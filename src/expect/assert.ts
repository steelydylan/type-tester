import * as ts from "typescript";

export const assert = (code: string, variable: string) => ({
  toBeType: (result: unknown) => {
    const finalCode = `${code}
function expectType<T>(value: T) {}
expectType<${result}>(${variable});
    `;
    // check type error sourcefile
    const options: ts.CompilerOptions = {
      noEmitOnError: true,
      noImplicitAny: true,
      target: ts.ScriptTarget.Latest,
      // moduleResolution: ts.ModuleResolutionKind.
      module: ts.ModuleKind.CommonJS,
      // strict: true,
    };
    const sourceFileName = "test.ts";
    const compilerHost: ts.CompilerHost = {
      getSourceFile: (fileName: string) => {
        if (fileName === sourceFileName) {
          return ts.createSourceFile(fileName, finalCode, options.target!);
        }
        return undefined;
      },
      writeFile: () => {},
      getCurrentDirectory: () => "",
      getDirectories: () => [],
      getCanonicalFileName: (fileName: string) => fileName,
      useCaseSensitiveFileNames: () => false,
      getNewLine: () => "\n",
      fileExists: (fileName: string) => fileName === sourceFileName,
      readFile: () => "",
      getDefaultLibFileName: () => "",
      getEnvironmentVariable: () => "",
    };
    const program = ts.createProgram(["test.ts"], options, compilerHost);
    const diagnostics = program.emit().diagnostics.filter((e) => !!e.file);
    const allDiagnostics = ts.getPreEmitDiagnostics(program);
    // console.log(allDiagnostics);
    //   .concat(emitResult.diagnostics);
    console.log(diagnostics, finalCode);
    return diagnostics.length === 0;
  },
});
