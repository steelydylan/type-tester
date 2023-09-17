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

async function fetchFile(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

function simplifyImport(input: string): string {
  const regex =
    /import\s+([\s\S]*?)\s+from\s+'https:\/\/esm\.sh\/v\d+\/(.*?)@\d.*?'/g;
  return input.replace(regex, (url, importPart, libraryName) => {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].replace("';", "");
    if (filename.includes("index.d.ts")) {
      return `import ${importPart} from '${libraryName.replace(
        /@types\//,
        ""
      )}'`;
    }
    return `import ${importPart} from '${libraryName.replace(
      /@types\//,
      ""
    )}/${filename.replace(".d.ts", "")}`;
  });
}

async function setDependencies(
  library: string,
  baseUrl = "https://esm.sh/",
  versions = "v131"
) {
  async function processFile(
    path: string,
    definitions: { [key: string]: string } = {}
  ): Promise<{ [key: string]: string }> {
    const content = await fetchFile(path);
    const moduleName = path
      .split("/")
      .slice(-2)
      .join("/")
      // version表記を削除
      .replace(/@\d+\.\d+\.\d+/g, "");
    definitions[moduleName] = simplifyImport(content);

    // Import statements
    const importUrls = (
      content.match(
        /import [\s\S]*? from 'https:\/\/esm\.sh\/v\d+\/[^']+';/g
      ) || []
    ).map((line) => line.match(/https:\/\/esm\.sh\/[^']+/)?.[0]);

    // Reference paths
    const referencePaths = (
      content.match(/\/\/\/ <reference path="[^"]+" \/>/g) || []
    ).map((line) => line.match(/"[^"]+"/)?.[0]?.replace(/"/g, ""));

    for (const url of importUrls || []) {
      await processFile(url ?? "", definitions);
    }

    for (const refPath of referencePaths || []) {
      const refUrl = new URL(refPath ?? "", path); // Assuming relative path
      await processFile(refUrl.toString(), definitions);
    }

    return definitions;
  }

  const mainPath = `${baseUrl}@types/${library}@${versions}/index.d.ts`;
  const definitions = await processFile(mainPath);

  return definitions;
}

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
    const definitions = await setDependencies(name, "https://esm.sh/", version);
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
