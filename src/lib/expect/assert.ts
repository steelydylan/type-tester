import type { CompilerOptions } from "typescript";
import { hasTypeError } from "../compiler";

export const assert = ({
  code,
  files,
  dependencies,
  variable,
  compilerOptions,
}: {
  code: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  variable: string;
  compilerOptions: CompilerOptions;
}) => ({
  toBe: (result: unknown) => {
    const finalCode = `${code}
let somevariable = null as unknown as ${variable}
declare function expectType<T>(value: T): void
expectType<${result}>(somevariable);
    `;
    return hasTypeError({
      code: finalCode,
      files,
      dependencies,
      compilerOptions,
    });
  },
  toBeType: (result: unknown) => {
    const finalCode = `${code}
declare function expectType<T>(value: T): void
expectType<${result}>(${variable});
    `;
    return hasTypeError({
      code: finalCode,
      files,
      dependencies,
      compilerOptions,
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
      files,
      dependencies,
      compilerOptions,
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
      files,
      dependencies,
      compilerOptions,
    });
  },
});
