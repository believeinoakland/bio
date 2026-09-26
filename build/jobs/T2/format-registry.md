# T2 · format-registry — job record

Session: `session_019LnvZG7rvC4fK35bUVv3MW` (FORMAT-REGISTRY #1)

**Status** · COMPLETE, 2026-09-26. Branch `job/T2/format-registry`. No open question for BOB.

## Entries applied

- **T2-9** · Requirement-named tests for every live id, R1–R27, at the module's interface, in `bio-plane/test/m/format-registry/` (27 tests; no test reads source text):
  - `registry.test.mjs` · R1–R13 and R24–R27: every registration error with its exact message; storage without clone or default; unregister/get/list including re-registration moving to the end; both detect passes observed through spy entries on an emptied registry (argument identity, call order, first truthy `.format` hit returned verbatim, pass 2 never before every pass-1 call); the stated `undetermined` for every combination of inputs; an entry's error propagating; determinism with `fetch`, `Date`, `performance.now` and `Math.random` trapped. Every test that changes the registry restores the built-in roster in order.
  - `dialect.test.mjs` · R14–R16: `null` for every non-object and array; the named-key projection with type filtering; a real `csvEntry.dialect` projected without loss; unnamed keys dropped; hostile objects.
  - `builtins.test.mjs` · R17–R23: html and pdf detect at the 1024-byte window's edge, case rules, content type unconsulted while bytes are truthy, exact content types only; the null slots; `pdf.structure` equal to `extractPdfStructure` for PDF, non-PDF and non-bytes input; the nine-entry roster in order with the readers' own entry objects (this file never mutates the registry, so it sees the load-time state).
  - Negative controls run by hand and restored: `readingDialect` without the hardening below fails R16 alone; running pass 2 before pass 1 fails R10, R11 and R26.

## Other flaws fixed in this module (step 4)

- **R16** · `readingDialect` threw on an object whose key read throws (a throwing getter, a revoked or trapping Proxy, an array proxy whose `length` throws). Every named-key read is now guarded: a key that cannot be read projects as `null` or `[]` like any other value of the wrong type, and an object whose array check throws (a revoked Proxy) answers `null` (R14). No output changes for any object that could be read before.

Deferred: none.

## Found in another module

Nothing.

## Tests and checks run

- `node --test bio-plane/test/m/format-registry/` · tests 27, pass 27, fail 0.
- Layer tests: none named in `build/manifest.md`.
- No provided service's stated behaviour changed, so no user module's tests were required; run anyway from the legacy battery (in `bio-plane/`): `formats` 36 pass 0 fail, `reading-dialect` 20/0, `formats-csv` 75/0, `formats-odf` 142/0, `formats-docx` 82/0, `formats-xlsx` 88/0, `formats-pptx` 118/0; all exit 0.
- `checks/format.mjs` · 61 modules, 19 requirements files; 0 failures.
- `checks/architecture.mjs` · 4 product files, 16 relative imports (0 naming no tracked file, not judged); 0 failures.
- `checks/coverage.mjs` · 1 modules, 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` (tranche/T2) · 5 files changed by format-registry between tranche/T2 and HEAD; 0 failures.

## Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_019LnvZG7rvC4fK35bUVv3MW,job,format-registry,3105496,112321,54,30304,27,6,305
```
