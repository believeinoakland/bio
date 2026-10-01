# op-declarations (T21)

**Status** · session_01Fq5Tmj68jFDjRPXcC2D1iX · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings of R8 I am building on; correct me if either is wrong (neither stops the work).

(1) "each in `SESSION_OPS.member` and `SESSION_OPS.admin`" I read literally: all seventeen ops (the eleven acts, the four grant-door ops and the three reads `templates`, `factstatus`, `factsdue`, less nothing) go in both sets. For the doors (`classes: null`) this is harmless at the gate (admission passes public ops before the session gate, and a read before it too), and it records that a member's session reaches them. My R3 test's rule "a session set's op admits that session kind" therefore reads "admits it, or is public (`classes: null`)".

(2) `NEEDS`: `contribute` for the nine mutating member acts and `templatepropose` (R8's rule, as `optionpropose`); a null row for the two mutating doors (`templatereview`, `templatecomment`: reached by a secret, so no capability), and a null row for the five reads (`templates`, `templateread`, `templatecomments`, `factstatus`, `factsdue`), because affordances R30 names all seven in `NON_ACTS` and its R12 reads a `NON_ACTS` key that `NEEDS` does not carry as stale (K516's precedent for the contradiction reads).

The lists (R4), so control-plane can stamp from them: `FILING_TEMPLATES_ACTIONS` (the seven member acts) joins `QUERY_AUTHOR_ACTIONS` (filing-templates reads `author` from the query for all seven, mapping it to `by` where its R says `by`); `TEMPLATE_PROPOSAL_ACTIONS` (`templatepropose`, `proposer`); `LOCAL_FACTS_ACTIONS` (`factconfirm`, `by`); all three in `ACTION_LAYER_ACTIONS` (viewer). `FILING_TEMPLATES_READS` (`templates`, moved out of `FILINGS_READS`) and `LOCAL_FACTS_READS` in `ACTION_LAYER_READS`. `TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS` (author by session, or `secretSha`; viewer); `GRANT_SECRET_ACTIONS` = `reviewgrant`, `templatereviewgrant` (the door mints the secret and stamps its `secretSha`).

## J2 · REPORT

For other modules (nothing here is mine to change):

1. **control-plane, a test made red by the move you ordered.** `bio-plane/test/m/control-plane/stamps-action.test.mjs`:34 asserts `FILINGS_READS.includes("templates")`; `templates` is now in `FILING_TEMPLATES_READS` (filing-templates R14, my START). Red from my merge until control-plane re-points it. (Its two other reds, CHECK_FAMILIES R22 and R43, were red before my change.)
2. **filing-templates vs its R6 and my R8: the proposer's stamp.** `filingTemplatesOps` (`bio-plane/src/filing-templates/index.mjs`:1271) reads `templatepropose`'s proposer from the query's `author`, but R6 and my R8 name a `proposer` stamp, which control-plane sets for the proposal lists (`PLAN_PROPOSAL_ACTIONS`' expression). As built, a door that stamps `proposer` leaves the module with none (`TEMPLATE_NO_PROPOSER`), and a caller's own `author` would be read unless the door overwrites it. One of the two must give: filing-templates reads `proposer`, or control-plane stamps `author` for `TEMPLATE_PROPOSAL_ACTIONS`. I declared it `proposer`, as R8 says.
3. **control-plane, wiring (for its job).** New lists, each exported: `FILING_TEMPLATES_ACTIONS` (in `QUERY_AUTHOR_ACTIONS`, so the author stamp reaches all seven with no new code; filing-templates maps it to `by`), `FILING_TEMPLATES_READS`, `TEMPLATE_PROPOSAL_ACTIONS`, `LOCAL_FACTS_ACTIONS`, `LOCAL_FACTS_READS` (all in `ACTION_LAYER_ACTIONS`/`_READS`, so viewer-stamped already), `TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS` (author by session, else `secretSha` from `secret`, as `reviewcopy`/`reviewcomment`) and `GRANT_SECRET_ACTIONS` (`reviewgrant`, `templatereviewgrant`: mint the secret, stamp `secretSha`). local-facts reads `factconfirm`'s `by` from the BODY (`localFactsOps`, :389), so the door must stamp and overwrite it there, as it does `resolutiondefect`'s (control-plane R17).
4. **Generated artifact stale:** my change to `bio-plane/src/op-declarations/index.mjs` stales the plane's bundle `bio-plane/dist/` (`build/manifest.md`, "Generated artifacts"). I regenerated nothing.

## J3 · COMPLETE

**Completion (OP-DECLARATIONS #3).** Commit `job/T21/op-declarations` (pushed).

**Entries applied.**
- (1) K921, K927, R8: sixteen specs (my J1 said seventeen; the count is sixteen: eight member acts, `templatepropose`, four grant doors, three reads), each in both session sets; `NEEDS` `contribute` for the eight member acts and `templatepropose`, a null row for the two secret-reached doors and the five reads (B3). `templates` moved out of `FILINGS_READS` into `FILING_TEMPLATES_READS` (K992). The `templatesave` comment now cites filings R32. `templatesave`, `filingprepare` and `counselpacket` keep their specs and stamps (filings R28, R31, R32 change their bodies, not their declarations; a test pins this). R6 holds over the sixteen: they are exactly the keys of `filingTemplatesOps` (13) and `localFactsOps` (3), checked by reading both modules' op maps. My test does not import them (the architecture check refuses it: not in my uses), so it names the sixteen by R8's list.
- **Lists that differ from B2:** `templatepropose` is in `TEMPLATE_PROPOSAL_ACTIONS` (in `ACTION_LAYER_ACTIONS`), NOT in `QUERY_AUTHOR_ACTIONS`, because R8 and filing-templates R6 name a `proposer` stamp, not an author. That conflicts with what filing-templates reads (`proposer: q("author")`, my J2 item 2). If you rule for `author`, the change is one line: move the list into `QUERY_AUTHOR_ACTIONS`. All other placements are as B2 says: the seven template acts are in `FILING_TEMPLATES_ACTIONS`, which is in `QUERY_AUTHOR_ACTIONS`; `factconfirm` is in `LOCAL_FACTS_ACTIONS`, which is in `ACTION_LAYER_ACTIONS`; `templates` is in `FILING_TEMPLATES_READS` and `factstatus` and `factsdue` are in `LOCAL_FACTS_READS`, both in `ACTION_LAYER_READS`. Also new: `TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS` and `GRANT_SECRET_ACTIONS` (`reviewgrant`, `templatereviewgrant`).
- (2) N469: re-worded the notes at :47 (the battery, now the module tests), :853 (`versionstate.control.mjs`, now each fence layer's own test: this module's R3 and basis-versions' `acts.test.mjs`), :937 (the old battery, claim dropped) and :1270 (`d270-refusal-truth.test.mjs`, kept as provenance "found by D-270", pointing to admission's test). The re-scan also found :1007 and :1452 (`capability.test.mjs`) and :1907 ("the capability suite"), now this module's R3 test, and :672 "(asserted)", now this module's R2 test. Kept: :1096 (provenance) and livefire's citation (:2332, a quoted citation).
- `not yet met: T21` marks met: **R8**.

**Deferred:** none.

**Other modules:** J2 (control-plane `stamps-action.test.mjs`:34 red from the `templates` move; filing-templates reads the proposer from `author`; the wiring; `bio-plane/dist/` stale).

**Tests and checks.**
- op-declarations: `node --test test/m/op-declarations/`: tests 21, pass 21, fail 0.
- Users: admission 19/19; plane 28/28; control-plane 90/93 (new red: `stamps-action.test.mjs` R17/R29, J2 item 1; red before my change: CHECK_FAMILIES R22 and R43); affordances 132/133 (R3 R7 R12 layer 9's 62 ops, red before my change, its R30).
- Checks: `format: 86 modules, 84 requirements files; 0 failures` · `architecture: 4 product files, 7 relative imports (1 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 8 of 8 live requirement ids named by a test; 0 failures` · `ownership: 3 files changed by op-declarations between tranche/T21 and HEAD; 0 failures`.

Size (session_01Fq5Tmj68jFDjRPXcC2D1iX): test runs 9, module lines 2342
