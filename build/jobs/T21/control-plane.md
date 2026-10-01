# control-plane (T21)

**Status** · session_01Gmuq4U2PQihnDRrGeAzmtS · depth 2 · WAITING ON BOB (J3) · handled B5

## J1 · QUESTION

Q1 (R44, R17/R29 for K921's ops). My door stamps from op-declarations' act lists, and OPDECL's job has not pushed its R8 yet, so I need to know which lists the new ops join. My best reading, which I am building on now:
(a) the eight gated acts (`templatedraft`, `templaterevise`, `templatesubmit`, `templatereviewgrant`, `templategrantrevoke`, `templateapprove`, `templateretire`) and `templatepropose` join `QUERY_AUTHOR_ACTIONS` (so `ACTION_LAYER_ACTIONS`: `viewer` and query `author` stamped by the layer's expression, positional identity / `class:<cls>` / `class:ai/<tokenId>`), which is what filing-templates' ops map reads (`author`, also as `by` and `proposer`); `templates`, `factstatus`, `factsdue` join `ACTION_LAYER_READS` (viewer).
(b) `factconfirm`: local-facts' ops map reads `by` from the BODY (`{...b, viewer}`), so a caller's own `by` would reach it. My door stamps the body `by` itself (`inboxresolve`'s precedent), by the positional expression (`member:<id>`, the form local-facts' tests use), and needs only `viewer` from op-declarations (ACTION_LAYER_ACTIONS or any viewer list). If you would rather local-facts read `by` from the query, that is local-facts' change; I report it either way.
(c) `templatereviewgrant`: the door mints the secret with admission's `reviewGrantSecret` and stamps `secretSha`, as `reviewgrant`, by op name in my door.
(d) the four grant doors (`classes: null`): handled wholly in my door (secret → `bySecret`, `secretSha`; else `admit` held to a session; else NO_TEMPLATE_GRANT at 404), stamping `author` (identity) and `viewer` for the session path.
If OPDECL names different lists (or exports its own list for the template acts), tell me and I re-point. Until OPDECL's merge my R44 tests are red by name (UNKNOWN_OP), as the START says.

## Progress (CONTROL-PLANE #12)

Built on B2's adopted readings and B3's list names (OP-DECLARATIONS #3's, not yet merged). This branch imports `TEMPLATE_PROPOSAL_ACTIONS`, `LOCAL_FACTS_ACTIONS`, `TEMPLATE_DOOR_ACTIONS` and `TEMPLATE_DOOR_READS` from `op-declarations`, so until its merge reaches `tranche/T21` and I merge it, the module does not load on this branch; tested meanwhile against a local, uncommitted simulation of op-declarations R8 with B3's names (101/101). Next: on B's CHANGE at op-declarations' merge, merge `tranche/T21`, re-run steps 5–7, post COMPLETE.

## J2 · REPORT

R1. Work so far is pushed (961898a965), built to B3's names; it waits on OP-DECLARATIONS #3's merge (the module imports B3's lists, so it does not load on my branch until I merge `tranche/T21`). Under a local, uncommitted simulation of op-declarations R8 with B3's names: test/m/control-plane 101/101; format 0, architecture 0, coverage 28/28, ownership 0.
(1) Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`, `bundler`'s `npm run build` in `bio-plane/`): my change touches `bio-plane/src/control-plane/`. Regenerated nothing.
(2) R43's snapshot (`rows-before-r43.json`) needed more than K952's C-53.13 re-pin: K921/K992 re-worded filings' C-115.12, .33, .34, .39, .40, re-keyed C-115.31 (`MACHINE_CANNOT_SAVE_TEMPLATE` → `MACHINE_CANNOT_DRAFT_TEMPLATE`) and C-115.36 (`TEMPLATE_KIND_TIER3` → `TEMPLATE_TIER3_FILE`), and retired `KIND_NO_TEMPLATE` (C-115.6) and `NOT_TIER3` (C-115.17). I re-pinned each to its owner's row and the test now names the change set (`changed`: retired codes have no row and their numbers are reused by none; re-keyed codes keep their numbers under the successor; the published fence list follows the re-key). My decision (technical, P17): a snapshot of rows tracks Bob-approved row changes by name rather than holding the old words.
(3) For filing-templates (no action needed from me): its ops map reads `templatepropose`'s proposer from the query's `author`, while op-declarations names the stamp `proposer` (B3). My door sets both keys to the proposal label (`actionlawspropose`'s expression), so it works either way; if filing-templates ever reads `proposer`, `author` can go.
(4) K982: my R20 states the review copy's in-band `date` only, not its hash. I added a test anyway (`converts.test.mjs`, "R20 (K982; public-read R7)"): the served `inband` equals `inbandQuartet` over the answer without `inband`; BOB words R20 if wanted.
(5) `stamps-action.test.mjs` no longer asserts `FILINGS_READS.includes("templates")` (it moves to `FILING_TEMPLATES_READS`, B3).

## J3 · REPORT

R2, on B4. `tranche/T21` merged (c4bf2a3192, affordances in).
(1) Already so: `TEMPLATE_PROPOSAL_ACTIONS` stamps the query `author` with the proposal expression (session its member, machine `class:<cls>`, agent `class:ai/<tokenId>`), the caller's overwritten; I also set `proposer` (op-declarations' name) to the same value.
(2) Already so: the assertion is gone, and my K921 stamp test reads `FILING_TEMPLATES_READS` by name.
(3) Added `test/m/control-plane/totality.test.mjs`, under R2 (every op with a spec is routed, any other refused) and R41 (the `op=affordances` answer's totality): `unaccounted` over the door's table (`OPS`, `gated` = a `NEEDS` row, as the old `rung-ladder.test.mjs` §2 read it) is `{[], [], []}`, with negative controls. Pushed (a later commit). It cannot run until op-declarations merges (my module imports its new lists). Finding to watch: under my simulation of op-declarations R8 (B3's lists; NEEDS `contribute` only for the mutating member acts), `stale` is `factsdue`, `factstatus`, `templatecomment`, `templatecomments`, `templateread`, `templatereview`, `templates`: affordances put these seven in `NON_ACTS`, and R12 calls a `NON_ACTS` key stale unless the table carries it as gated (a `NEEDS` row), which reads and the secret-reached doors have none of by op-declarations R8. If the merged op-declarations still gives them no `NEEDS` row, the fix is affordances' (take them out of `NON_ACTS`, as every other read, e.g. `plans`, is out) or op-declarations' — not mine; my test will name it.

## Completion (CONTROL-PLANE #12)

`tranche/T21` merged after OP-DECLARATIONS #3 (B5, K1003); the module now loads against the real `op-declarations` lists and every test below ran against them, no simulation.

**Entries applied** (B1 START; B4, B5 CHANGEs)
- K921, K927, R44: `templatereviewgrant` answered as `reviewgrant` (admission's `reviewGrantSecret`, the value returned once, only `secretSha` crossing); the four grant doors (`TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS`) admit a live grant's secret (`bySecret`, `secretSha` stamped) or a member's session (`admit` held to a session; `viewer`, `author` stamped); every other caller receives filing-templates' `NO_TEMPLATE_GRANT`, byte-identical, at 404; a silence stays a silence. `secretSha`/`bySecret` from a caller reach no admitted op. **R44's `not yet met: T21` mark is met.**
- K921: the new ops dispatched with their stamps: `FILING_TEMPLATES_ACTIONS` through `QUERY_AUTHOR_ACTIONS`; `TEMPLATE_PROPOSAL_ACTIONS` stamped `proposer` and `author` (K1002; the key filing-templates reads); `LOCAL_FACTS_ACTIONS` its body `by` (positional expression, caller's body stamps removed); the reads `viewer`. R27: `templateread`, `templatecomments`, `factstatus`, `factsdue` classified in `PROJECT_NAMING_READS_NOT`.
- R22, R43, K992: `local-facts/checks.mjs` (C-126) and `filing-templates/checks.mjs` (C-125) in `CHECK_FAMILY_FILES`, each in its module's place.
- N465: `families.mjs`' comment re-worded (no `actions/checks.mjs`).
- N468: `step.mjs`:1–6, `promotion-step.test.mjs`:1–2, `record.mjs`:53 re-worded (plane registers this module's step under its name).
- N469: every listed note re-worded to the module test that proves it now, kept as provenance ("the old …", "found by", "ported from"), or its claim dropped (`identity-claims` pins, `refusal-wire`'s pair); re-scan found and fixed `index.mjs`' "the suite's arms" too.
- K952: C-53.13 re-pinned (6611137f11985943) in `rows-before-r43.json`; also K921/K992's filings rows (C-115.12, .33, .34, .39, .40 re-worded; .31, .36 re-keyed; `KIND_NO_TEMPLATE`, `NOT_TIER3` retired), named in the snapshot's `changed` and asserted (J2 (2)).
- K982: R20 states the review copy's in-band `date` only, not its hash; a test proves the hash equals `inbandQuartet`'s over the same bytes anyway (`converts.test.mjs`); BOB words R20 if wanted.
- B4 (2): `stamps-action.test.mjs` no longer asserts `templates` in `FILINGS_READS`. B4 (3): `totality.test.mjs` (R2, R41): `unaccounted` over the door's table is empty — green on the merged tranche.

**Deferred:** none.

**Found in other modules** (J2, J3): filing-templates reads `templatepropose`'s proposer from the query's `author` while op-declarations names the stamp `proposer` (the door sets both). Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json` (`src/control-plane/` changed); regenerated nothing.

**Tests and checks** (on `job/T21/control-plane` with `tranche/T21` @ K1003 merged)
- `node --test bio-plane/test/m/control-plane/`: tests 102, pass 102, fail 0.
- Users of the door: plane 28/0, op-declarations 21/0, affordances 138/0, filing-templates 46/0, local-facts 22/0, admission 19/0.
- `format`: 86 modules, 84 requirements files; 0 failures. `architecture`: 32 product files, 187 relative imports (3 naming no tracked file, not judged); 0 failures. `coverage`: 28 of 28 live requirement ids named by a test; 0 failures. `ownership`: 15 files changed by control-plane between tranche/T21 and HEAD; 0 failures.

Size (session_01Gmuq4U2PQihnDRrGeAzmtS): test runs 22, module lines 3445
