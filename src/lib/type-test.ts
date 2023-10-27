import { resolveAllModuleType, resolveModuleType } from "browser-type-resolver";

import { Expect } from "./expect";
import { Spy } from "./spy";
import * as tsvfs from "@typescript/vfs";
import type { CompilerOptions } from "typescript";
import * as ts from "typescript";
import { getProgram } from "./compiler";
import { Host } from "./type";

type Option = {
  code: string;
  files?: Record<string, string>;
  compilerOptions?: CompilerOptions;
};

type Result = {
  description: string;
  result: boolean;
  messages: string[];
};

type Test = {
  description: string;
  callback: () => Promise<void>;
};

export class TypeTester {
  private code: string;
  private setupCodes: string[] = [];
  private files: Record<string, string>;
  private tests: Test[] = [];
  private dependencies: Record<string, string> = {};
  private expects = new Expect();
  private beforeAllCallbacks: (() => Promise<void>)[] = [];
  private beforeEachCallbacks: (() => Promise<void>)[] = [];
  private afterEachCallbacks: (() => Promise<void>)[] = [];
  private compilerOptions: CompilerOptions = {};
  private fsMap: Map<string, string> = new Map();
  private program!: ts.Program;
  private host!: Host;

  constructor({ code, files, compilerOptions = {} }: Option) {
    this.code = code ?? "";
    this.files = files ?? {};
    const options: ts.CompilerOptions = {
      lib: ["dom", "dom.iterable", "esnext"],
      noEmitOnError: true,
      noImplicitAny: true,
      strict: true,
      esModuleInterop: true,
      typeRoots: ["./node_modules/@types"],
      target: ts.ScriptTarget.Latest,
      jsx: ts.JsxEmit.React,
      // moduleResolution: ts.ModuleResolutionKind.
      module: ts.ModuleKind.CommonJS,
      // strict: true,
      ...compilerOptions,
    };
    this.compilerOptions = options;
  }

  private async setFsMapFromCdn() {
    const fsMap = await tsvfs.createDefaultMapFromCDN(
      this.compilerOptions,
      ts.version,
      true,
      ts
      // lzstring
    );
    const keys = [...fsMap.keys()];
    for (const key of keys) {
      this.fsMap.set(key, fsMap.get(key) ?? "");
    }
  }

  private async prepare() {
    await this.setFsMapFromCdn();
    Object.keys(this.files).forEach((key) => {
      this.fsMap.set(key, this.files[key]);
    });
    const { host, program } = await getProgram({
      compilerOptions: this.compilerOptions,
      fsMap: this.fsMap,
    });
    this.program = program;
    this.host = host;
  }

  setDependenciesFromJson(dependencies: Record<string, string>) {
    Object.keys(dependencies).forEach((key) => {
      this.fsMap.set("/node_modules/" + key, dependencies[key]);
    });
  }

  async setDependencies(
    dependencies: Record<string, string>,
    options = { cache: true }
  ) {
    this.dependencies = await resolveAllModuleType(dependencies, options);
    // object to map
    Object.keys(this.dependencies).forEach((key) => {
      this.fsMap.set("/node_modules/" + key, this.dependencies[key]);
    });
  }

  async addDependency(
    name: string,
    version: string,
    options = { cache: true }
  ) {
    const definitions = await resolveModuleType(name, version, options);
    this.dependencies = {
      ...this.dependencies,
      ...definitions,
    };
    Object.keys(definitions).forEach((key) => {
      this.fsMap.set("/node_modules/" + key, definitions[key]);
    });
  }

  spyOn<T extends string>(obj: Record<T, Function>, key: T) {
    return new Spy(obj, key);
  }

  beforeEach(callback: () => Promise<void>) {
    this.beforeEachCallbacks.push(callback);
  }

  afterEach(callback: () => Promise<void>) {
    this.afterEachCallbacks.push(callback);
  }

  test(description: string, callback: () => Promise<void>) {
    this.tests.push({
      description,
      callback,
    });
  }

  it(description: string, callback: () => Promise<void>) {
    this.tests.push({
      description,
      callback,
    });
  }

  expect(variable: string) {
    const setupCodes = this.setupCodes.join("\n");
    return this.expects.expect({
      code: this.code + "\n" + setupCodes,
      program: this.program,
      host: this.host,
      expected: variable,
    });
  }

  clearTests() {
    this.tests = [];
  }

  beforeAll(callback: () => Promise<void>) {
    this.beforeAllCallbacks.push(callback);
  }

  evaluate(code: string) {
    const func = new Function(
      "test",
      "it",
      "expect",
      "beforeAll",
      "beforeEach",
      "afterEach",
      "addSetupCode",
      "spyOn",
      code
    );
    func(
      this.test.bind(this),
      this.it.bind(this),
      this.expect.bind(this),
      this.beforeAll.bind(this),
      this.beforeEach.bind(this),
      this.afterEach.bind(this),
      this.addSetupCode.bind(this),
      this.spyOn
    );
  }

  addSetupCode(code: string) {
    this.setupCodes.push(code);
  }

  async run() {
    await this.prepare();
    const results = [] as Result[];
    for (const b of this.beforeAllCallbacks) {
      await b();
    }
    for (const t of this.tests) {
      for (const b of this.beforeEachCallbacks) {
        await b();
      }
      const { description } = t;
      try {
        await t.callback();
        results.push({
          description,
          result: this.expects.isAllPassed(),
          messages: this.expects.getMessages(),
        });
      } catch (e) {
        console.error(e);
        results.push({
          description,
          result: false,
          messages: [],
        });
      }
      this.expects.clean();
      for (const a of this.afterEachCallbacks) {
        await a();
      }
    }
    return results;
  }
}
