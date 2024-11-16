import Parser from "./frontend/parser";
import readline from "node:readline/promises";
import { evaluvate } from "./runtime/interpreter";
import { createGlobalEnv } from "./runtime/environment";
import { readFileSync } from "node:fs";

function run(filename: string) {
  console.log(process.cwd());
  console.log(filename);
  const parser = new Parser();
  const env = createGlobalEnv();

  const sourceCode = readFileSync(filename, "utf-8");

  const program = parser.produceAST(sourceCode);

  const result = evaluvate(program, env);
  // console.log(result);
}

async function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("\nRepl v1.0.0");
  const parser = new Parser();
  const env = createGlobalEnv();

  while (true) {
    const input = await rl.question(">");
    if (input == "exit") process.exit(1);

    const program = parser.produceAST(input);

    const result = evaluvate(program, env);
    console.log(result);
  }
}

run("./program.txt");
// (async () => {
//   await repl().catch((data) => {
//     console.error(data);
//     process.exit(1);
//   });
// })();
