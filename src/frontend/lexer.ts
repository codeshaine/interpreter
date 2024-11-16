export enum TokenType {
  //Literal Types
  Number,
  Identifier,
  String,
  //keywords
  Let,
  Const,
  Fn,

  Null,
  Equals,
  OpenParen, //(
  CloseParen, //)
  BinaryOperator,
  SemiColon,
  Comma,
  Colon,
  Dot,
  OpenBrace, //{
  CloseBrace, //}
  OpenBrackets, //[
  closeBrackets, //]
  EOF,
}

export interface Token {
  value: string;
  type: TokenType;
}

const KEYWORD: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  fn: TokenType.Fn,
};

export function makeToken(value: string | undefined, type: TokenType): Token {
  if (typeof value === "undefined") {
    return { value: "", type: type };
  }
  return { value, type };
}

export function isAlpha(str: string): boolean {
  return str.toUpperCase() != str.toLowerCase();
}

export function isInt(str: string): boolean {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

export function isSkippable(str: string): boolean {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");
  //build each token until EOF
  while (src.length > 0) {
    if (src[0] === "(") {
      tokens.push(makeToken(src.shift(), TokenType.OpenParen));
    } else if (src[0] === ")") {
      tokens.push(makeToken(src.shift(), TokenType.CloseParen));
    } else if (src[0] === "{") {
      tokens.push(makeToken(src.shift(), TokenType.OpenBrace));
    } else if (src[0] === "}") {
      tokens.push(makeToken(src.shift(), TokenType.CloseBrace));
    } else if (src[0] === "[") {
      tokens.push(makeToken(src.shift(), TokenType.OpenBrackets));
    } else if (src[0] === "]") {
      tokens.push(makeToken(src.shift(), TokenType.closeBrackets));
    } else if (src[0] === ",") {
      tokens.push(makeToken(src.shift(), TokenType.Comma));
    } else if (src[0] === ".") {
      tokens.push(makeToken(src.shift(), TokenType.Dot));
    } else if (src[0] === ":") {
      tokens.push(makeToken(src.shift(), TokenType.Colon));
    } else if (src[0] === ";") {
      tokens.push(makeToken(src.shift(), TokenType.SemiColon));
    } else if (
      src[0] === "+" ||
      src[0] === "-" ||
      src[0] === "*" ||
      src[0] === "/" ||
      src[0] === "%"
    ) {
      tokens.push(makeToken(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] === "=") {
      tokens.push(makeToken(src.shift(), TokenType.Equals));
    } else {
      //for mutlicharacters

      if (isInt(src[0])) {
        let num = "";
        while (src.length > 0 && isInt(src[0])) {
          num += src.shift();
        }
        tokens.push(makeToken(num, TokenType.Number));
      } else if (isAlpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isAlpha(src[0])) {
          ident += src.shift();
        }
        const reserved = KEYWORD[ident];
        if (typeof reserved === "number") {
          tokens.push(makeToken(ident, reserved));
        } else {
          tokens.push(makeToken(ident, TokenType.Identifier));
        }
      } else if (isSkippable(src[0])) {
        src.shift();
      } else {
        console.error("Unrecognized character found in source:", src[0]);
        process.exit(1);
      }
    }
  }

  tokens.push(makeToken("EOF", TokenType.EOF));
  return tokens;
}
