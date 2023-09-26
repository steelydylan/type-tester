import type { CompilerOptions, Program } from "typescript";
import { hasTypeError } from "../compiler";
import { Host } from "../type";

export const assert = ({
  code,
  program,
  host,
  variable,
}: {
  code: string;
  program: Program;
  host: Host;
  variable: string;
}) => ({
  toBe: (result: unknown) => {
    const finalCode = `${code}
let somevariable = null as unknown as ${variable}
declare function expectType<T>(value: T): void
expectType<${result}>(somevariable);
    `;
    return hasTypeError({
      code: finalCode,
      host,
      program,
    });
  },
  toBeType: (result: unknown) => {
    const finalCode = `${code}
declare function expectType<T>(value: T): void
expectType<${result}>(${variable});
    `;
    return hasTypeError({
      code: finalCode,
      host,
      program,
    });
  },
  toBeAny: () => {
    const finalCode = `${code}
declare function expectType<T>(value: T): void
type ____IsAny<T> = 0 extends (1 & T) ? true : false;
expectType<____IsAny<${variable}>>(true as const);
    `;
    return hasTypeError({
      code: finalCode,
      host,
      program,
    });
  },
  toBeTypeAny: () => {
    const finalCode = `${code}
declare function expectType<T>(value: T): void
type ____IsAny<T> = 0 extends (1 & T) ? true : false;
expectType<____IsAny<typeof ${variable}>>(true as const);
    `;
    return hasTypeError({
      code: finalCode,
      host,
      program,
    });
  },
});
