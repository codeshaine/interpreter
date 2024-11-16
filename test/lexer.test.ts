import { describe, it, expect } from "vitest";
import {
  isAlpha,
  isSkippable,
  isInt,
  makeToken,
  TokenType,
  tokenize,
} from "../src/lexer";

describe("Testing makeToken Function", () => {
  it("should return value when value is string", () => {
    expect(makeToken("=", TokenType.Equals)).toStrictEqual({
      value: "=",
      type: TokenType.Equals,
    });
  });
  it("should return empty string when value is undefined", () => {
    expect(makeToken(undefined, TokenType.Equals)).toStrictEqual({
      value: "",
      type: TokenType.Equals,
    });
  });
});

describe("Testing isAlpa Function", () => {
  it("should return true when given right input", () => {
    expect(isAlpha("a")).toBe(true);
  });
  it("should return true when given wrong type input", () => {
    expect(isAlpha("1")).toBe(false);
  });
});

describe("Testing isInt function", () => {
  it("should return true for valid interger from 0-9", () => {
    expect(isInt("1")).toBe(true);
  });
  it("should return false for non numeric value", () => {
    expect(isInt("a")).toBe(false);
  });
});

describe("Testing isSkippable function", () => {
  it("should return true for space", () => {
    expect(isSkippable(" ")).toBe(true);
  });
  it("should return true for newline", () => {
    expect(isSkippable("\n")).toBe(true);
  });
  it("should return true for tab", () => {
    expect(isSkippable("\t")).toBe(true);
  });
  it("should return false for other characters", () => {
    expect(isSkippable("a")).toBe(false);
  });
});

describe("Testing tokenize function", () => {
  it("should return array of tokens", () => {
    expect(tokenize("let a = (1+1)")).toStrictEqual([
      { value: "let", type: TokenType.Let },
      { value: "a", type: TokenType.Identifier },
      { value: "=", type: TokenType.Equals },
      { value: "(", type: TokenType.OpenParen },
      { value: "1", type: TokenType.Number },
      { value: "+", type: TokenType.BinaryOperator },
      { value: "1", type: TokenType.Number },
      { value: ")", type: TokenType.CloseParen },
      { value: "EOF", type: TokenType.EOF },
    ]);
  });
});
