import { assert } from "./assert";

import type { CompilerOptions } from "typescript";

type AssertKey = keyof ReturnType<typeof assert>;
type TruthyAssertObject = { [T in AssertKey]: (...value: unknown[]) => void };

type ReturnObject = TruthyAssertObject & {
  not: TruthyAssertObject;
};

export class Expect {
  private expects: boolean[] = [];

  expect({
    code,
    files,
    dependencies,
    compilerOptions,
    expected,
  }: {
    code: string;
    files: Record<string, string>;
    dependencies: Record<string, string>;
    compilerOptions: CompilerOptions;
    expected: string;
  }) {
    const assertedObject = assert({
      code,
      files,
      dependencies,
      compilerOptions,
      variable: expected,
    });
    const returnObject = {
      not: {},
    } as ReturnObject;
    (Object.keys(assertedObject) as AssertKey[]).forEach((key) => {
      returnObject[key] = (...result: unknown[]) => {
        // @ts-ignore
        this.expects.push(assertedObject[key](...result));
      };
    });
    (Object.keys(assertedObject) as AssertKey[]).forEach((key) => {
      returnObject.not[key] = (...result: unknown[]) => {
        // @ts-ignore
        this.expects.push(!assertedObject[key](...result));
      };
    });
    return returnObject;
  }

  clean() {
    this.expects = [];
  }

  isAllPassed() {
    return this.expects.every((e) => e);
  }
}
