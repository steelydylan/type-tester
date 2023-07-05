import { getVariableType } from "../compiler";
import * as ts from "typescript";

export const assert = (expected: ts.Statement) => ({
  toBeType: (result: unknown) => {
    const expectedType = getVariableType(expected);
    // ts check same type
    return expectedType === result;
  },
});
