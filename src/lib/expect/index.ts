import { Host } from "../type";
import { assert } from "./assert";

import type { CompilerOptions, Program } from "typescript";

type AssertKey = keyof ReturnType<typeof assert>;
type TruthyAssertObject = { [T in AssertKey]: (...value: unknown[]) => void };

type ReturnObject = TruthyAssertObject & {
  not: TruthyAssertObject;
};

export class Expect {
  private expects: { passed: boolean; messages: string[] }[] = [];
  expect({
    code,
    program,
    host,
    expected,
  }: {
    code: string;
    program: Program;
    host: Host;
    expected: string;
  }) {
    const assertedObject = assert({
      code,
      program,
      host,
      variable: expected,
    });
    const returnObject = {
      not: {},
    } as ReturnObject;
    (Object.keys(assertedObject) as AssertKey[]).forEach((key) => {
      returnObject[key] = (...result: unknown[]) => {
        // @ts-ignore
        const [passed, messages] = assertedObject[key](...result);
        this.expects.push({ passed, messages });
      };
    });
    (Object.keys(assertedObject) as AssertKey[]).forEach((key) => {
      returnObject.not[key] = (...result: unknown[]) => {
        // @ts-ignore
        const [passed, messages] = assertedObject[key](...result);
        this.expects.push({ passed: !passed, messages });
      };
    });
    return returnObject;
  }

  clean() {
    this.expects = [];
  }

  isAllPassed() {
    return this.expects.every((e) => e.passed);
  }

  getMessages() {
    return this.expects.map((e) => e.messages).flat();
  }
}
