import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, RuntimeVal } from "./value";

export function createGlobalEnv(): Environment {
  const env = new Environment();
  env.declareVar("null", MK_NULL(), true);
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  //define a native fn
  env.declareVar(
    "print",
    MK_NATIVE_FN((args, scope) => {
      console.log(...args);
      return MK_NULL();
    }),
    true
  );

  env.declareVar(
    "time",
    MK_NATIVE_FN(() => {
      return MK_NUMBER(Date.now());
    }),
    true
  );
  return env;
}

export default class Environment {
  private parent?: Environment;
  private varibles: Map<string, RuntimeVal>;
  private constant: Set<string>;
  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.varibles = new Map();
    this.constant = new Set();
  }
  public declareVar(
    varname: string,
    value: RuntimeVal,
    isConstant: boolean
  ): RuntimeVal {
    if (this.varibles.has(varname))
      throw `Variable ${varname} already declared`;

    this.varibles.set(varname, value);
    if (isConstant) this.constant.add(varname);
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if (env.constant.has(varname))
      throw `Cannot assign to constant variable ${varname}`;
    env.varibles.set(varname, value);
    return value;
  }

  public lookUp(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.varibles.get(varname) as RuntimeVal;
  }

  private resolve(varname: string): Environment {
    if (this.varibles.has(varname)) return this;
    if (this.parent === undefined) throw `Variable ${varname} not declared`;

    return this.parent?.resolve(varname);
  }
}
