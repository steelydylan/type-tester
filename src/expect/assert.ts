import { hasTypeError } from "../compiler";

export const assert = (code: string, variable: string) => ({
  toBe: (result: unknown) => {
    const finalCode = `${code}
let somevariable = null as unknown as ${variable}
declare function expectType<T>(value: T): void
expectType<${result}>(somevariable);
    `;
    return hasTypeError(finalCode);
  },
  toBeType: (result: unknown) => {
    const finalCode = `${code}
declare function expectType<T>(value: T): void
expectType<${result}>(${variable});
    `;
    return hasTypeError(finalCode);
  },
  toBeAny: () => {
    const finalCode = `${code}
declare function expectType<T>(value: T): void
type ____IsAny<T> = 0 extends (1 & T) ? true : false;
expectType<____IsAny<${variable}>>(true as const);
    `;
    return hasTypeError(finalCode);
  },
});
