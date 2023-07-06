import { hasTypeError } from "../compiler";

export const assert = (code: string, variable: string) => ({
  toBe: (result: unknown) => {
    const finalCode = `let somevariable = null as unknown as ${variable}
    function expectType<T>(value: T) {}
    expectType<${result}>(somevariable);
    `;
    return hasTypeError(finalCode);
  },
  toBeType: (result: unknown) => {
    const finalCode = `${code}
function expectType<T>(value: T) {}
expectType<${result}>(${variable});
    `;
    return hasTypeError(finalCode);
  },
});
