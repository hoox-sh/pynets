#!/usr/bin/env bun
/**
 * Generate TypeScript ANTLR lexer/parser from the shared PYNE .g4 files.
 *
 * Grammar source of truth (do not copy or edit into this repo):
 *   <pyne>/src/pynescript/ast/grammar/antlr4/resource/Pinescript{Lexer,Parser}.g4
 *
 * Resolution order:
 *   1. PYNETS_GRAMMAR — directory that contains the two .g4 files
 *   2. PYNESCRIPT_ROOT — pyne / pynescript checkout root
 *   3. parent checkout (this repo used as the pynets/ submodule of pyne)
 *   4. sibling checkouts: ../pynescript or ../pyne
 */
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const PYNETS = resolve(HERE, "..");
const PARENT = resolve(PYNETS, "..");
const GRAMMAR_REL = "src/pynescript/ast/grammar/antlr4/resource";
const OUT = join(PYNETS, "src/generated");
const TOOLS = join(PYNETS, ".tools");
const JAR_NAME = "antlr-4.13.2-complete.jar";
const JAR = join(TOOLS, JAR_NAME);
const JAR_URL = "https://www.antlr.org/download/antlr-4.13.2-complete.jar";

function must(ok: boolean, msg: string): void {
  if (!ok) {
    console.error(msg);
    process.exit(1);
  }
}

function isGrammarDir(dir: string): boolean {
  return existsSync(join(dir, "PinescriptLexer.g4")) && existsSync(join(dir, "PinescriptParser.g4"));
}

function resolveGrammar(): string {
  const envGrammar = process.env.PYNETS_GRAMMAR;
  if (envGrammar) {
    const abs = resolve(envGrammar);
    must(isGrammarDir(abs), `PYNETS_GRAMMAR is not a grammar dir: ${abs}`);
    return abs;
  }
  const envRoot = process.env.PYNESCRIPT_ROOT;
  if (envRoot) {
    const abs = join(resolve(envRoot), GRAMMAR_REL);
    must(isGrammarDir(abs), `PYNESCRIPT_ROOT has no grammar at ${abs}`);
    return abs;
  }
  const candidates = [
    join(PARENT, GRAMMAR_REL),
    join(PARENT, "pynescript", GRAMMAR_REL),
    join(PARENT, "pyne", GRAMMAR_REL),
  ];
  for (const dir of candidates) {
    if (isGrammarDir(dir)) return dir;
  }
  console.error(
    [
      "missing PinescriptLexer.g4 / PinescriptParser.g4",
      "clone hoox-sh/pyne next to this repo, use this repo as the pynets/ submodule of pyne,",
      "or set PYNESCRIPT_ROOT / PYNETS_GRAMMAR",
    ].join("\n"),
  );
  process.exit(1);
}

const GRAMMAR = resolveGrammar();

mkdirSync(TOOLS, { recursive: true });
mkdirSync(OUT, { recursive: true });

if (!existsSync(JAR)) {
  console.log(`downloading ${JAR_NAME} …`);
  const curl = spawnSync("curl", ["-fsSL", "-o", JAR, JAR_URL], { stdio: "inherit" });
  must(curl.status === 0 && existsSync(JAR), `failed to download ${JAR_URL}`);
}

const java = spawnSync("java", ["-version"], { encoding: "utf8" });
must(java.status === 0, "java is required to regenerate the ANTLR TypeScript target");

const args = [
  "-jar",
  JAR,
  "-Dlanguage=TypeScript",
  "-visitor",
  "-no-listener",
  "-o",
  OUT,
  "-Xexact-output-dir",
  "-lib",
  GRAMMAR,
  join(GRAMMAR, "PinescriptLexer.g4"),
  join(GRAMMAR, "PinescriptParser.g4"),
];

console.log("antlr4", args.filter((a) => !a.endsWith(".jar") && a !== "-jar").join(" "));
const gen = spawnSync("java", args, { stdio: "inherit", cwd: PYNETS });
must(gen.status === 0, "antlr4 TypeScript generation failed");

const lexerBaseSrc = join(PYNETS, "src/parser/LexerBase.ts");
const parserBaseSrc = join(PYNETS, "src/parser/ParserBase.ts");
must(existsSync(lexerBaseSrc), `missing ${lexerBaseSrc}`);
must(existsSync(parserBaseSrc), `missing ${parserBaseSrc}`);
copyFileSync(lexerBaseSrc, join(OUT, "PinescriptLexerBase.ts"));
copyFileSync(parserBaseSrc, join(OUT, "PinescriptParserBase.ts"));

for (const name of readdirSync(OUT)) {
  if (!name.endsWith(".ts")) continue;
  const path = join(OUT, name);
  let text = readFileSync(path, "utf8");
  const before = text;
  // Official target often emits `.js` imports; Bun/TS resolve the `.ts` bases.
  text = text.replaceAll("./PinescriptLexerBase.js", "./PinescriptLexerBase.ts");
  text = text.replaceAll("./PinescriptParserBase.js", "./PinescriptParserBase.ts");
  text = text.replaceAll("./PinescriptLexer.js", "./PinescriptLexer.ts");
  text = text.replaceAll("./PinescriptParser.js", "./PinescriptParser.ts");
  text = text.replaceAll("./PinescriptParserVisitor.js", "./PinescriptParserVisitor.ts");
  if (text !== before) writeFileSync(path, text);
}

console.log(`wrote ${OUT}`);
