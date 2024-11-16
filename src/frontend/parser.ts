import {
  Stmt,
  Program,
  Expr,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  VarDeclaration,
  AssignExpr,
  Property,
  ObjectLiteral,
  CallExpr,
  MemberExpr,
  FunctionDeclaration,
} from "./ast";
import { tokenize, Token, TokenType } from "./lexer";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }
  private at() {
    return this.tokens[0] as Token;
  }
  private eat() {
    return this.tokens.shift() as Token;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private expect(type: TokenType, err: any): Token {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, "- Expecting", type);
    }
    return prev;
  }
  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };
    while (this.notEOF()) {
      program.body.push(this.parseStmt());
    }
    return program;
  }

  private parseStmt(): Stmt {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVarDeclaration();
      case TokenType.Fn:
        return this.parseFnDeclaration();
      default:
        return this.parseExpr();
    }
  }
  private parseFnDeclaration(): Stmt {
    this.eat();
    const name = this.expect(
      TokenType.Identifier,
      "Expected funtion name follwing fn keyword"
    ).value;

    const args = this.parseArgs();
    const parameters: string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        console.log(arg);
        throw "Inside a function delcaration expected parameters to be of type string";
      }
      parameters.push((arg as Identifier).symbol);
    }
    this.expect(
      TokenType.OpenBrace,
      "Expected function body following declaration"
    );
    const body: Stmt[] = [];
    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parseStmt());
    }
    this.expect(
      TokenType.CloseBrace,
      "Closing paranthesis expected in funciton declaration"
    );
    const fn = {
      kind: "FunctionDeclaration",
      body,
      name,
      parameters,
    } as FunctionDeclaration;
    return fn;
  }

  //let ident
  //{let|const} ident = expr

  private parseExpr(): Expr {
    return this.parseAssignmemtExpr();
  }

  private parseAssignmemtExpr(): Expr {
    const left = this.parseObjectExpr(); //swtich to object
    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parseAssignmemtExpr(); //foo=bar="code"
      return {
        kind: "AssignExpr",
        assigne: left,
        value,
      } as AssignExpr;
    }
    return left;
  }

  parseObjectExpr(): Expr {
    //{props[]}
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parseAdditiveExpr();
    }
    this.eat(); //advance past to braces
    const properties = new Array<Property>();
    while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected"
      ).value;

      //for shorthands key: pair -> {key,}
      if (this.at().type === TokenType.Comma) {
        this.eat(); //object ={key,key:value}
        properties.push({
          kind: "Property",
          key,
        } as Property);
        continue;
      }
      //for shorthands key: pair -> {key}
      else if (this.at().type === TokenType.CloseBrace) {
        properties.push({
          kind: "Property",
          key,
        } as Property);
        continue;
      }

      //{key:val}
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in object literal"
      );
      const value = this.parseExpr();
      properties.push({ kind: "Property", key, value } as Property);
      if (this.at().type !== TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Missing comma or close braces after properties"
        );
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing literal");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parseVarDeclaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier"
    ).value;
    if (this.at().type === TokenType.SemiColon) {
      this.eat();
      if (isConstant) throw "Must assign to the constatnt varible";
      return {
        kind: "VarDeclaration",
        constant: false,
        identifier,
      } as VarDeclaration;
    }
    this.expect(TokenType.Equals, "Expected = after identifier");

    const declration = {
      kind: "VarDeclaration",
      constant: isConstant,
      identifier,
      value: this.parseExpr(),
    } as VarDeclaration;

    this.expect(TokenType.SemiColon, "Expected ; after expression");
    return declration;
  }

  private parseAdditiveExpr(): Expr {
    let left = this.parseMutliplicative();
    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parseMutliplicative();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
      } as BinaryExpr;
    }
    return left;
  }

  private parseMutliplicative(): Expr {
    let left = this.parseCallMemberExpr();
    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parseCallMemberExpr();
      left = {
        kind: "BinaryExpr",
        operator,
        left,
        right,
      } as BinaryExpr;
    }
    return left;
  }

  //foo.x()
  private parseCallMemberExpr(): Expr {
    const member = this.parseMemberExpr();
    if (this.at().type == TokenType.OpenParen) {
      return this.parseCallExpr(member);
    }
    return member;
  }
  private parseCallExpr(caller: Expr): Expr {
    let callExpr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parseArgs(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      callExpr = this.parseCallExpr(callExpr);
    }
    return callExpr;
  }

  //arr["one"]
  private parseArgs(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open paranthesis");
    const args =
      this.at().type == TokenType.CloseParen ? [] : this.parseArgumentList();
    this.expect(
      TokenType.CloseParen,
      "Expected close paranthesis inside arguments list"
    );
    return args;
  }

  private parseArgumentList(): Expr[] {
    const args = [this.parseAssignmemtExpr()];
    while (this.notEOF() && this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parseAssignmemtExpr());
    }
    return args;
  }
  private parseMemberExpr(): Expr {
    let object = this.parsePrimaryExpr();

    while (
      this.at().type === TokenType.Dot ||
      this.at().type == TokenType.OpenBrackets
    ) {
      const operator = this.eat();
      let property: Expr;
      let computed: boolean;
      //non-computed values aka dot
      if (operator.type == TokenType.Dot) {
        computed = false;
        property = this.parsePrimaryExpr();
        if (property.kind != "Identifier") {
          throw `Cannot use dot operator without right hand being a identifier`;
        }
      } else {
        computed = true;
        property = this.parseExpr();
        this.expect(TokenType.closeBrackets, "Missing closing bracktes");
      }

      object = {
        kind: "MemberExpr",
        computed,
        object,
        property,
      } as MemberExpr;
    }
    return object;
  }

  //Order of precedence
  //Addition
  // Multiplication;
  //Call
  //Member
  // PrimaryExpr

  private parsePrimaryExpr(): Expr {
    const tk = this.at().type;
    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen: {
        this.eat();
        const value = this.parseExpr();
        this.expect(
          TokenType.CloseParen,
          "unexpected token found inside paranthesised expression,Expected closing paranthesis"
        );
        return value;
      }

      default:
        console.error("Unexpected token found during parsing", this.at());
        process.exit(1);
    }
  }
}
