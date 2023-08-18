import * as ts from "typescript";
import { libFileMap } from "./expect/lib";

const removeNodeModulePath = (module: string) => {
  return module.replace(/node_modules\//, "");
};

export const hasTypeError = (
  code: string,
  dependencies: Record<string, string> = {}
) => {
  // console.log(nodeModules);
  // check type error sourcefile
  const options: ts.CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    strict: true,
    esModuleInterop: true,
    typeRoots: ["./node_modules/@types", "https://esm.sh/@types"],
    target: ts.ScriptTarget.Latest,
    // moduleResolution: ts.ModuleResolutionKind.
    module: ts.ModuleKind.CommonJS,
    // strict: true,
  };
  const libFileName = "lib.es6.d.ts";
  const sourceFileName = "test.tsx";
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName: string) => {
      // console.log(fileName);
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
      if (dependencies && dependencies[removeNodeModulePath(fileName)]) {
        return ts.createSourceFile(
          fileName,
          dependencies[removeNodeModulePath(fileName)],
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
    fileExists: (fileName: string) => {
      return (
        fileName === sourceFileName ||
        !!libFileMap[fileName] ||
        !!dependencies[removeNodeModulePath(fileName)]
      );
    },
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
