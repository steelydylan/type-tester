import * as ts from "typescript";
import { libFileMap } from "./expect/lib";

export const hasTypeError = (code: string) => {
  // check type error sourcefile
  const options: ts.CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    strict: true,
    target: ts.ScriptTarget.Latest,
    // moduleResolution: ts.ModuleResolutionKind.
    module: ts.ModuleKind.CommonJS,
    // strict: true,
  };
  const libFileName = "lib.es6.d.ts";
  const sourceFileName = "test.ts";
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName: string) => {
      if (fileName === sourceFileName) {
        return ts.createSourceFile(fileName, code, options.target!);
      }
      if (libFileMap[fileName]) {
        return ts.createSourceFile(
          fileName,
          libFileMap[fileName],
          options.target!
        );
      }
      return undefined;
    },
    writeFile: () => {},
    getCurrentDirectory: () => "",
    getDirectories: () => [],
    getCanonicalFileName: (fileName: string) => fileName,
    useCaseSensitiveFileNames: () => false,
    getNewLine: () => "\n",
    fileExists: (fileName: string) =>
      fileName === sourceFileName || !!libFileMap[fileName],
    readFile: () => "",
    getDefaultLibFileName: () => libFileName,
    getEnvironmentVariable: () => "",
  };
  const program = ts.createProgram(
    [libFileName, sourceFileName],
    options,
    compilerHost
  );
  const diagnostics = program.emit().diagnostics.filter((e) => !!e.file);
  return diagnostics.length === 0;
};
