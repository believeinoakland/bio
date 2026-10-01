# record-grammar (T20)

**Status** · session_01Dr61eQgdPoB6sfPdCc6qXC · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T20 layer 1):
- **N437's kind.** `bundle.mjs`'s three registry comments (`publishedRegistry`, `publishedCaseRegistry`, `earnedRegistry`; were :767, :779, :793) no longer name the cli or the migrate tool (neither exists at HEAD). They now name the callers that exist: promotion's `runGate` and inquiry's `checkInquiryEntry` (which may be handed no registry), ratification's gate (`ratifyGate`, which injects all three), and record-core's audit (`publishedRegistry` through publication's registered audit context, `earnedRegistry` through inquiry's, record-core R69). Comments only.
- **N449.** R19's `not yet met` mark is stale: at HEAD `isPublicHttpsLocator` already accepts an upper-case scheme and refuses `localhost.` and `.local` hosts, and no code changed. The new test `R19 an upper-case scheme is https, and a localhost. or .local host is never public` (`bio-plane/test/m/record-grammar/locator.test.mjs`) checks `HTTPS://a.example/x` true, `https://localhost./x` false and `https://printer.local/x` false. **R19 is met; its mark can be struck.**

**Also in this module (own flaws fixed, comments only):** module comments that still described the deleted catalogue as present. `bundle.mjs`: the header (`LEGACY_GRAMMARS`, "legacy-checks' job"), the `EXTENSION_ARMS` note (inquiry-grammar fills C-6.1 and C-15.1 now), the `elided` note ("the gate and cli pass nothing": the gate passes `elidedPaths` now, so the note names `checkInquiryEntry`), and the `CHECK_RETIREMENTS above` pointer. The headers of `ids.mjs`, `titles.mjs`, `labels.mjs` and `document.mjs` ("the catalogue re-exports each name"; `lawProposalLabel` is now in action-grammar, and `isMachineMinted` went with the catalogue), `grades.mjs` (`EARNED_SOURCE_AXIS` and the leg arms are inquiry-grammar's). `invariants.test.mjs`: the header and the `OWN` comment re-worded, and the test that named retired R26 and R41 renamed `one binding per name: …`. Its assertions are unchanged.

**Other stale marks, for BOB (K775 (6)):** these `not yet met` marks in `build/requirements/record-grammar.md` also look stale. Each is met at HEAD and checked by an existing named test that passes: R1 (`PLN` in both patterns: `ids-types.test.mjs` R1), R3 (`PLN` → `action_plan`: R3), R5 (`normalizeType('constructor')` answers itself: R5), R12 (`{a: undefined}` → `{}`: `vocabulary.test.mjs` R12), R20 (a string throws a `TypeError`: `digests.test.mjs` R20). The status line's "This file covers T18's stage only … `checkBundle` [is] added when [it moves]" is also stale (R28–R40 are there). These are requirement wordings, so they are BOB's to change.

**Deferred:** none.

**Found in other modules:** none.

**Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`). They embed the six record-grammar files whose comments changed: `bundle.mjs`, `ids.mjs`, `titles.mjs`, `labels.mjs`, `document.mjs`, `grades.mjs`. Not regenerated (B1). No other bundle carries them.

**Tests and checks:**
- `node --test bio-plane/test/m/record-grammar/`: tests 58, pass 58, fail 0
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures
- `node checks/architecture.mjs … record-grammar`: 25 product files, 45 relative imports; 0 failures
- `node checks/coverage.mjs … record-grammar`: 39 of 39 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … record-grammar tranche/T20`: 0 failures (re-run after commit below)

Size (session_01Dr61eQgdPoB6sfPdCc6qXC): test runs 3, module lines 2257
