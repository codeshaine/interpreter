import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  ObjectLiteral,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluvate } from "../interpreter";
import {
  FnValue,
  MK_NULL,
  NativeFnValue,
  NumberVal,
  ObjectVal,
  RuntimeVal,
} from "../value";

export function evalNumericBinaryExpr(
  left: NumberVal,
  right: NumberVal,
  operator: string
): NumberVal {
  if (operator == "+")
    return { type: "number", value: left.value + right.value } as NumberVal;
  else if (operator == "-")
    return { type: "number", value: left.value - right.value } as NumberVal;
  else if (operator == "*")
    return { type: "number", value: left.value * right.value } as NumberVal;
  else if (operator == "/")
    return { type: "number", value: left.value / right.value } as NumberVal;
  else if (operator == "%")
    return { type: "number", value: left.value % right.value } as NumberVal;
  else {
    console.error("unknown operator", operator);
    process.exit(1);
  }
}

export function evalBinaryExpr(
  binaryExpr: BinaryExpr,
  env: Environment
): RuntimeVal {
  const left = evaluvate(binaryExpr.left, env);
  const right = evaluvate(binaryExpr.right, env);
  const operator = binaryExpr.operator;
  if (left.type == "number" && right.type == "number") {
    return evalNumericBinaryExpr(
      left as NumberVal,
      right as NumberVal,
      operator as string
    );
  }
  return MK_NULL();
}

export function evalIdent(ident: Identifier, env: Environment): RuntimeVal {
  return env.lookUp(ident.symbol);
}

export function evalAssignment(
  assignExpr: AssignExpr,
  env: Environment
): RuntimeVal {
  if (assignExpr.assigne.kind !== "Identifier") {
    throw `Invalid assignment target ${JSON.stringify(assignExpr.assigne)}`;
  }
  const varname = (assignExpr.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluvate(assignExpr.value, env));
}

export function evalObjectExpr(
  obj: ObjectLiteral,
  env: Environment
): RuntimeVal {
  const object = {
    type: "object",
    properties: new Map(),
  } as ObjectVal;

  for (const { key, value } of obj.properties) {
    //handles valid key:pair
    const runtimeVal =
      value == undefined ? env.lookUp(key) : evaluvate(value, env);
    object.properties.set(key, runtimeVal);
  }
  return object;
}

export function evalCallExpr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluvate(arg, env));
  const fn = evaluvate(expr.caller, env);
  if (fn.type == "native-fn") {
    const result = (fn as NativeFnValue).call(args, env);
    return result;
  }

  if (fn.type == "function") {
    // const result = (fn as NativeFnValue).call(args, env);
    const func = fn as FnValue;
    const scope = new Environment(func.declarationEnv);
    //create for the parameter
    //!verify arity of fuction
    for (let i = 0; i < func.parameters.length; i++) {
      const varname = func.parameters[i];
      scope.declareVar(varname, args[i], false);
    }
    //   return evaluvate(func.body, scope);
    let result: RuntimeVal = MK_NULL();
    for (const stmt of func.body) {
      result = evaluvate(stmt, scope);
    }
    return result;
  }

  throw "Not call value that is not a function";
}
