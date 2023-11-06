import * as ts from "typescript";
import * as tsvfs from "@typescript/vfs";
import { Host } from "./type";

export const getProgram = ({
  compilerOptions,
  fsMap,
}: {
  compilerOptions: ts.CompilerOptions;
  fsMap: Map<string, string>;
}) => {
  fsMap.set("/test.tsx", "const a = 1");
  const system = tsvfs.createSystem(fsMap);
  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  const keys = [...fsMap.keys()];
  const program = ts.createProgram(
    [
      ...keys.filter(
        (e) => !e.startsWith("/node_modules") && !e.startsWith("/lib")
      ),
      "/lib.es6.d.ts",
    ],
    compilerOptions,
    host.compilerHost
  );

  return {
    program,
    host,
  };
};

export const hasTypeError = ({
  code,
  host,
  program,
}: {
  code: string;
  host: Host;
  program: ts.Program;
}) => {
  host.updateFile(
    ts.createSourceFile("/test.tsx", code, ts.ScriptTarget.Latest, true)
  );
  const newProgram = ts.createProgram({
    rootNames: program.getRootFileNames(),
    oldProgram: program,
    options: program.getCompilerOptions(),
    host: host.compilerHost,
  });
  const diagnostics = newProgram.emit().diagnostics.filter((e) => !!e.file);
  const filteredMessages = diagnostics
    .map((e) => {
      const expectTypePos = code.indexOf("expectType");
      if (e.start! >= expectTypePos) {
        const message = ts.flattenDiagnosticMessageText(e.messageText, "\n");
        return message;
      }
      return "";
    })
    .filter((e) => !!e) as string[];

  return [filteredMessages.length === 0, filteredMessages] as const;
};
