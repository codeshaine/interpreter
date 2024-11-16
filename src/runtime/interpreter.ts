import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../frontend/ast";
import Environment from "./environment";
import {
  evalAssignment,
  evalBinaryExpr,
  evalCallExpr,
  evalIdent,
  evalObjectExpr,
} from "./eval/expression";
import {
  evalFnDeclaration,
  evalProgram,
  evalVarDeclaration,
} from "./eval/statement";
import { NumberVal, RuntimeVal } from "./value";

export function evaluvate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        type: "number",
        value: (astNode as NumericLiteral).value,
      } as NumberVal;

    case "Program":
      return evalProgram(astNode as Program, env);

    case "BinaryExpr":
      return evalBinaryExpr(astNode as BinaryExpr, env);

    case "Identifier":
      return evalIdent(astNode as Identifier, env);
    case "VarDeclaration":
      return evalVarDeclaration(astNode as VarDeclaration, env);
    case "AssignExpr":
      return evalAssignment(astNode as AssignExpr, env);
    case "ObjectLiteral":
      return evalObjectExpr(astNode as ObjectLiteral, env);
    case "CallExpr":
      return evalCallExpr(astNode as CallExpr, env);
    case "FunctionDeclaration":
      return evalFnDeclaration(astNode as FunctionDeclaration, env);
    default:
      console.error(
        "unexptected AST node , this node has not been set up for interpretation",
        astNode
      );
      process.exit(1);
  }
}
