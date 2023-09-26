import type { CompilerHost, SourceFile } from "typescript";

export type Host = {
  compilerHost: CompilerHost;
  updateFile: (sourceFile: SourceFile) => boolean;
};
