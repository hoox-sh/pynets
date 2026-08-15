/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const nodeBundle = join(root, "dist/index.js");
const browserBundle = join(root, "dist/browser.js");
const dts = join(root, "dist/index.d.ts");

function ensureBuild(): void {
  if (existsSync(nodeBundle) && existsSync(browserBundle) && existsSync(dts)) return;
  const r = spawnSync("bun", ["run", "scripts/build.ts"], { cwd: root, encoding: "utf8" });
  expect(r.status).toBe(0);
}

describe("node / browser bundle", () => {
  test("bun build emits node + browser + d.ts", () => {
    ensureBuild();
    expect(existsSync(nodeBundle)).toBe(true);
    expect(existsSync(browserBundle)).toBe(true);
    expect(existsSync(dts)).toBe(true);
  });

  test("node can parse and Runtime.run the ESM bundle", () => {
    ensureBuild();
    const r = spawnSync(
      "node",
      [
        "--input-type=module",
        "-e",
        `import { parse, Runtime } from ${JSON.stringify(nodeBundle)};
         const src = "//@version=5\\nindicator(\\"t\\")\\nplot(ta.sma(close,2))";
         if (parse(src).kind !== "Script") process.exit(2);
         const out = new Runtime("T").run(src, [{close:1},{close:2},{close:3}]);
         if (out.error) { console.error(out.error); process.exit(3); }
         if (out.plots[2] !== 2.5) { console.error(out.plots); process.exit(4); }
         process.exit(0);`,
      ],
      { encoding: "utf8" },
    );
    expect(r.stderr || "").not.toContain("Error");
    expect(r.status).toBe(0);
  });
});
