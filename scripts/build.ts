/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Bun-built Node + browser ESM bundles + generated TypeScript declarations.
 * Source remains the Bun entry (`src/index.ts`). Dist is gitignored and
 * produced on `bun run build` / `npm pack` (prepack).
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const entry = join(root, "src/index.ts");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

function bundle(
  outfile: string,
  target: "node" | "browser",
  minify: boolean,
  entrypoint: string = entry,
): void {
  const args = [
    "build",
    entrypoint,
    "--target",
    target,
    "--format",
    "esm",
    "--outfile",
    outfile,
    "--packages",
    "bundle",
  ];
  if (minify) args.push("--minify");
  const r = Bun.spawnSync(["bun", ...args], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (r.exitCode !== 0) throw new Error(`bun build failed (${target})`);
  const kb = (statSync(outfile).size / 1024).toFixed(0);
  console.log(
    `${target.padEnd(8)} ${outfile.replace(root + "/", "")}  ${kb} kB`,
  );
}

function rewriteTsExtensions(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteTsExtensions(path);
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;
    const text = readFileSync(path, "utf8");
    const next = text
      .replace(/(from\s+["\x27][^"\x27]+)\.ts(["\x27])/g, "$1.js$2")
      .replace(/(import\(["\x27][^"\x27]+)\.ts(["\x27]\))/g, "$1.js$2");
    if (next !== text) writeFileSync(path, next);
  }
}

function emitTypes(): void {
  const r = Bun.spawnSync(["bunx", "tsc", "-p", "tsconfig.build.json"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (r.exitCode !== 0) throw new Error("tsc declaration emit failed");
  rewriteTsExtensions(join(dist, "types"));
  console.log("types    dist/types/index.d.ts");
}

bundle(join(dist, "index.js"), "node", false);
bundle(join(dist, "browser.js"), "browser", true);
bundle(join(dist, "parse.js"), "node", false, join(root, "src/ast/helper.ts"));
// Same parse entry, but with antlr4's browser build (no `node:` imports) so
// strict bundlers / CDNs can load `@hoox-sh/pynets/parse` everywhere.
bundle(
  join(dist, "parse.browser.js"),
  "browser",
  true,
  join(root, "src/ast/helper.ts"),
);
emitTypes();
