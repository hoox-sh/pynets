/**
 * Deep-module boundaries for pyne-ts.
 * Packages root = src/. Each immediate child directory of src/ is a deep module;
 * its root files are entry points. Everything in a subfolder is private.
 * .ts extensions are imported explicitly everywhere in this repo, and
 * dependency-cruiser resolves them via enhancedResolveOptions below.
 */
module.exports = {
  forbidden: [
    {
      name: "entrypoints-only-from-outside",
      severity: "error",
      comment:
        "Code outside a module (src root files, test/, scripts/) may import only a module's entry points, never its subfolders.",
      from: { pathNot: "^src/[^/]+/" },
      to: { path: "^src/[^/]+/[^/]+/" },
    },
    {
      name: "entrypoints-only-across-modules",
      severity: "error",
      comment:
        "A module may reach its own subfolders freely, but other modules only through their entry points. $1 = importing module (dependency-cruiser back-reference).",
      from: { path: "^src/([^/]+)/" },
      to: { path: "^src/[^/]+/[^/]+/", pathNot: "^src/$1/" },
    },
    {
      name: "tests-through-entrypoints",
      severity: "error",
      comment:
        "Tests import a module through its entry points only. Their own test/helpers are fine.",
      from: { path: "^test/" },
      to: { path: "^src/[^/]+/[^/]+/" },
    },
    {
      name: "no-circular",
      severity: "error",
      comment:
        "No dependency cycles. Generated ANTLR output is excluded: PinescriptParser.ts <-> PinescriptParserVisitor.ts is an inherent ANTLR4 cycle, and src/generated/ is git-committed generated code that must never be hand-edited (AGENTS.md) and is already excluded from typecheck (tsconfig).",
      from: { pathNot: "^src/generated/" },
      to: { circular: true },
    },
    // Layering is deliberately NOT enforced yet.
    // Agreed sketch: runtime -> ast -> (generated, parser); generated and parser import nothing internal.
    // Enforce only when the team agrees, e.g.:
    // {
    //   name: "no-generated-depends-on-src",
    //   severity: "error",
    //   from: { path: "^src/generated/" },
    //   to: { path: "^src/(runtime|ast)/" },
    // },
  ],
  options: {
    tsPreCompilationDeps: true,
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^(dist|node_modules)/" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      conditionNames: ["import", "require", "node", "default", "bun"],
    },
  },
};
