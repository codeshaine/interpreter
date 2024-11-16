import { Stmt } from "../frontend/ast";
import Environment from "./environment";
export type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "native-fn"
  | "function";
export interface RuntimeVal {
  type: ValueType;
}

export function MK_NUMBER(value: number): NumberVal {
  return { type: "number", value };
}
export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL(): NullVal {
  return { type: "null", value: null };
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export function MK_BOOL(value: boolean): BoolVal {
  return { type: "boolean", value };
}

export interface BoolVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

export interface NativeFnValue extends RuntimeVal {
  type: "native-fn";
  call: FunctionCall;
}

export function MK_NATIVE_FN(call: FunctionCall) {
  return {
    type: "native-fn",
    call,
  } as NativeFnValue;
}

export interface FnValue extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stmt[];
}
