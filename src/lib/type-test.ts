import { resolveModuleType } from "browser-type-resolver";
import { Expect } from "./expect";
import { Spy } from "./spy";

type Option = {
  code: string;
  files?: Record<string, string>;
};

type Result = {
  description: string;
  result: boolean;
  error?: unknown;
};

type Test = {
  description: string;
  callback: () => Promise<void>;
};

export class TypeTester {
  private code: string;
  private files: Record<string, string>;
  private tests: Test[] = [];
  private dependencies: Record<string, string> = {};
  private expects = new Expect();
  private beforeEachCallbacks: (() => Promise<void>)[] = [];
  private afterEachCallbacks: (() => Promise<void>)[] = [];

  constructor({ code, files }: Option) {
    this.code = code ?? "";
    this.files = files ?? {};
  }

  async setDependencies(dependencies: Record<string, string>) {
    const keys = Object.keys(dependencies);
    for (const key of keys) {
      await this.addDependency(key, dependencies[key]);
    }
  }

  async addDependency(name: string, version: string) {
    const definitions = await resolveModuleType(name, version);
    this.dependencies = {
      ...this.dependencies,
      ...definitions,
    };
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
    return this.expects.expect(
      this.code,
      this.files,
      this.dependencies,
      variable
    );
  }

  clearTests() {
    this.tests = [];
  }

  evaluate(code: string) {
    const func = new Function(
      "test",
      "it",
      "expect",
      "beforeEach",
      "afterEach",
      "spyOn",
      code
    );
    func(
      this.test.bind(this),
      this.it.bind(this),
      this.expect.bind(this),
      this.beforeEach.bind(this),
      this.afterEach.bind(this),
      this.spyOn
    );
  }

  async run() {
    const results = [] as Result[];
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
        });
      } catch (e) {
        results.push({
          description,
          result: false,
          error: e,
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
