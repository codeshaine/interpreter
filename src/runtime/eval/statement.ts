import {
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluvate } from "../interpreter";
import { FnValue, MK_NULL, NullVal, RuntimeVal } from "../value";

export function evalProgram(program: Program, env: Environment): RuntimeVal {
  let last: RuntimeVal = {
    type: "null",
    value: null,
  } as NullVal;
  for (const stmt of program.body) {
    last = evaluvate(stmt, env);
  }
  return last;
}

export function evalVarDeclaration(
  varDecl: VarDeclaration,
  env: Environment
): RuntimeVal {
  if (varDecl.value)
    return env.declareVar(
      varDecl.identifier,
      evaluvate(varDecl.value, env),
      varDecl.constant
    );
  return env.declareVar(varDecl.identifier, MK_NULL(), varDecl.constant);
}
export function evalFnDeclaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  const fn = {
    type: "function",
    parameters: declaration.parameters,
    name: declaration.name,
    body: declaration.body,
    declarationEnv: env,
  } as FnValue;
  return env.declareVar(declaration.name, fn, true);
}
