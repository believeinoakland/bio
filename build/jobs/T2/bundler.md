# T2 · bundler — job record

Session: `session_015mpX96po6BkGDjNJ5AVwMB` (BUNDLER #1). BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T2`.

**Status** · STARTED, 2026-09-26. Branch `job/T2/bundler`. Entry: T2-3.

## Questions to BOB

- **Q1 (R8), sent 2026-09-26.** R8 says `unresolvableSpecifiers` lists "every import specifier" in a built artifact. The function scans the artifact's text for static `import`/`export … from` and bare `import "…"` statements only; a dynamic `import("…")` is not listed, deliberately (a lexical scan cannot tell a string in dead code from a statement: it flagged a string inside pdf.js). The parser-derived list of everything the output imports, dynamic imports included, is checked in `verifyFresh` from esbuild's metafile. **Best reading, which I build on:** R8 means the static import and export statements, the set a one-part upload must resolve when the module is instantiated; dynamic imports are covered by `verifyFresh` and need no wording change beyond, perhaps, "every static import or export specifier". Not blocking.
