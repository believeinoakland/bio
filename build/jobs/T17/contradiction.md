# contradiction (T17)

**Status** · session_01PJZi1Tddeq3RdfGvVdcz9C · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N394, my best reading, on which I am building now: the gate CAN be measured at my interface, over the recorded judgement (M-162's three blind runs are a fixed recording keyed by pair text, not a live model), so I propose a requirement rather than a release measurement. Only re-running a live model under the prompt (a new recording) is outside a job's reach, and that is already how R2 moves the digest.

Proposed, as a new **R57** under "The judgement's words" (or folded into R2's text, your ruling):

- **R57** (the over-strictness gate; CONTRADICTION-IDENTIFY-DESIGN §7, M-118, M-162). The judgement recorded under `JUDGEMENT_PROMPT_SHA256` passes the gate over the gate's corpus (26 labelled pairs over K1–K4, synthetic, each shape §7 requires at least once, at least 6 per key, each key with a negative and a conflict) built as a record:
  - every corpus pair is formed by its own key through R5–R11, nothing the corpus does not label is formed, and no key is cut at its bound;
  - R4's input carries every formed pair and no label or fixture id;
  - every formed pair is answered with an R1 label;
  - no `precision` or `unrelated` pair is labelled `world` or `record`: a false-conflict rate of 0 (the threshold M-118 set), per key and over all;
  - recall is stated beside the rate, never as the gate, and each recorded run's beats the lexical baseline's.
  The gate fails by name an empty record (no rate over nothing; each key's R11 level carried instead), an always-`world` judgement, and a silent one, and passes a judgement that gives every pair its gold label. The recording answers only the prompt it was made under: a moved digest (R2) leaves pairs unanswered, and the gate fails. *(its K5 arm not yet met: K488)*

The test (`test/m/contradiction/gate.test.mjs`, new) builds the corpus with my fixture, forms the pairs through `pairs`, renders through `renderJudgementInput`, and judges from the recording; the corpus, gate, baseline and recording are copied into `test/m/contradiction/` (the old helpers stay for legacy-tests to delete). Rest of the old suite: section 6's propose arms go into propose tests under R13–R17 over the corpus; its two source-text censuses (one append site; nothing updates or deletes) are dropped (P7), R17's behaviour already tested at the interface.

## J2 · COMPLETE

**Entry applied** (branch `job/T17/contradiction` @ e41583db35): N394 (K573), on J1's reading. J1 is still open. If you rule otherwise (fold it into R2, or make it a release measurement), I retitle the tests and bring the work in line.

**N394: the gate is testable at my interface.** It is measured over the recorded judgement (M-162's three runs, keyed by pair text), not over a live model. Proposed as **R57** (J1's text). Only a new recording under a new prompt needs a model, and R2 already says the digest moves only with one.

**The conversion** (K572): new `bio-plane/test/m/contradiction/gate.test.mjs`, 12 tests. It uses the same real fixtures, copied unchanged except for a header note: `gate-corpus.mjs`, `gate-measure.mjs`, `gate-baseline.mjs` and `gate-recorded.mjs`. The corpus is laid down as a record in my fixture. The pairs are formed through `pairs`, rendered through `renderJudgementInput`, and proposed through `propose`. The old suite and its helpers are untouched, for legacy-tests to delete.

Which new test carries each part of `contradiction-overstrict.test.mjs`:
- **§0**, the empty record (NOTHING_COMPARED; case (a) with the op's per-key levels) → "R57, R11: an empty record is no rate".
- **§1**, the corpus: its floor, its shapes, negatives and conflicts per key, and the label vocabulary → "R57: the corpus is floored".
- **§2**, the pairing: GOLD has one entry per pair, no key is truncated, each key is COMPARED, and nothing unlabelled is formed → "R57, R8: the pairing forms every corpus pair…". Added: a dropped key fails KEY_NOT_COMPARED by name (§7 control 1).
- **§3**, the baseline passes at THRESHOLD 0 with every pair labelled → "R57: the lexical baseline passes the gate…".
- **§4**, the gate's own failures → "R57: the gate can fail, by name…":
  - always-`world` fails FALSE_CONFLICT on every key and on ALL;
  - a disabled judgement fails JUDGEMENT_ABSENT;
  - the oracle passes;
  - always-`precision` passes with recall 0.
  Added: a rate equal to the threshold passes, and one planted false conflict fails by name (the old `overstrict` control arm).
- **§5**, the prompt and the input:
  - The prompt measured is the prompt shipped, and there is one vocabulary → "R57, R1, R2".
  - What the machine sees is fenced: every pair is rendered, with no gold id or shape → "R57, R4". Added: K3's passage is the context, and the recording answers exactly the formed pairs.
- **§5**, the recorded runs: each one passes, and its recall beats the baseline's → "R57: each recorded run…". Added: a changed side text is JUDGEMENT_ABSENT (the old `recorded` arm), and an abstaining judgement passes the gate but fails recall (the old `abstain` arm).
- **§6**, the rows through the door: 26 written, 9 of them conflicts. Each row's referents, versions, key, run, label, reason, `proposed`, `machine` and proposer are checked → "R13, R15, R16…".
- **§6**, versions and re-runs: a claim is versioned by its digest and a passage by its capture; a re-run writes nothing; a flipped label is no new candidate → "R14, R15…".
- **§6**, a changed side is a new candidate and the old one stays; forged claim text is C-93.7 → "R14, R13…".
- **§6**, the refusals → "R13: over the corpus, each refusal…". It covers C-93.1, C-93.2, C-93.3, C-93.4, C-93.5, C-93.6 and C-93.7, AI_RUN_NOT_PRINCIPAL, and a batch with one bad proposal writing none of it. Each refusal is checked by code, row and translation, with nothing written.

**Assertions not carried, and why:**
1. **§6 "ONE APPEND SITE"** is a regex census over the bundled sources for `INSERT … INTO contradiction_candidates` inside `#append`. It reads source text, so P7 drops it. The behaviour it guards (a re-run writes nothing, and the first row stands) is carried above, and R17 already tests it in `propose.test.mjs`.
2. **The §6 "APPEND-ONLY" census** checks that no source updates or deletes from the table, the generic-delete list, and how the `const both` declaration is spelled. It also reads source text, so P7 drops it too. R17, R22 and R47 are tested at the interface in `propose.test.mjs` and `measures.test.mjs`.
3. **C-93.1 and AI_RUN_NOT_PRINCIPAL:** the old suite reached C-93.1 at the Durable Object directly, and AI_RUN_NOT_PRINCIPAL through a real enrolled member's token. Both routes are control-plane routing, not mine. At my interface they are carried as an empty `proposedBy` and a non-principal `caller`. The route's reading of the stamps stays tested in `factory.test.mjs` (R5, R6, R13 through the routes).
4. **The printed figure tables** (M-118's per-key lines) are log output, not assertions. The figures they print are asserted.

**Also fixed in my module (comments only):**
- The index header still said no read shows a candidate, but PRESENT is built.
- The `pairs` doc said `NOT_REACHED`; the state is `HELD_APART`.
- `schema.mjs` said the table is not read to a member.
- `contradiction.mjs` pointed at the old suite and helper for the digest and the labels. It now points at `gate.test.mjs` and `gate-measure.mjs`.

**Reported, not mine to change:**
1. **Generated artifact (§14):**
   - Those comment edits stale `agent-worker/dist/agent-worker.bundled.mjs` (owner `agent-worker`). Its inputs include `src/contradiction.mjs`, `src/contradiction/index.mjs` and `src/contradiction/schema.mjs`. `fleetbundles.test.mjs` fails agent-worker with STALE BUNDLE on those three files only; every other member passes.
   - `bio-plane.bundled.mjs` (owner `not_product`) takes the plane's source too.
   - Both need your layer-close rebuild. No code changed.
2. **legacy-tests:** once this merges, `contradiction-overstrict.test.mjs` can retire with its own helpers: `contradiction-corpus.mjs`, `contradiction-gate.mjs`, `contradiction-judge-baseline.mjs`, `contradiction-judge-recorded.mjs` and `contradiction-overstrict.control.mjs`. The shared helpers it imports (`surfacing-run.mjs` and others) stay.

**Deferred:** nothing. R57's K5 arm stays with K488, since no model is reachable.

**Tests and checks:**
- `node --test test/m/contradiction/`: tests 108, pass 101, fail 0, todo 7. The seven todos are unchanged (K488).
- `gate.test.mjs`: 12 pass. Two negative controls, each restored afterwards:
  - a planted `world` on one precision pair in the recording fails the two recorded-run tests;
  - with K1's `cuts_against` join disabled, 9 of the 12 tests fail.
- format: 72 modules, 67 requirements files; 0 failures.
- architecture: 17 product files, 47 relative imports; 0 failures.
- coverage: 56 of 56 live requirement ids named by a test; 0 failures.
- ownership: 9 files changed; legacy-store 0 lines added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01PJZi1Tddeq3RdfGvVdcz9C): test runs 6, module lines 3240
