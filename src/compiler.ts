import * as ts from "typescript";

export const getVariableFromCode = (code: string, variableName: string) => {
  const sourceFile = ts.createSourceFile(
    "test.ts",
    code,
    ts.ScriptTarget.ES2015,
    true
  );

  const variable = sourceFile.statements.find((statement) => {
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations.find((declaration) => {
        if (ts.isIdentifier(declaration.name)) {
          return declaration.name.escapedText === variableName;
        }
        return false;
      });
    }
    return false;
  });

  return variable;
};

export const getVariableType = (variable: ts.Statement) => {
  if (ts.isVariableStatement(variable)) {
    const declaration = variable.declarationList.declarations[0];
    if (ts.isIdentifier(declaration.name)) {
      const type = declaration.type;
      console.log(type);
      if (type) {
        if (ts.isTypeReferenceNode(type)) {
          return type.typeName.getText();
        }
        return type.getText();
      }
    }
  }
  return "";
};
