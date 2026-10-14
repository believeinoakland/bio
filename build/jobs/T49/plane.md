# plane (T49)

**Status** · session_012h3BBihPG3oRtYmVkx9DcV · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

COMPLETE for T49-30 · plane. Commit dbaa7cd381 on job/T49/plane, pushed.

**Read.** My requirements (whole), my entry and the L11 notes in START, the process mechanics and JOB.md; the route map (`src/plane/store.mjs`, whole, the parts that spread the maps); the three test files named (`t41`, `roster`, `split`) read where they carry a hand-list, and `t48`'s T48 re-pin as the pattern. The used modules' services I touched: `membership` (R144, `founderhandleset`) and `project-roster` (R30, `projectownervotes`), read at their map entries. Reading set over 600 KB (K3271, mechanics §17): I read my requirements, entry, and own code (`src/plane`, the whole of the route-map module) whole, but I did not read the used modules' services whole and did not start helpers for digests. I read only the two map entries that my changes touch (`membership` R144 and `project-roster` R30's map spreads), plus the test hand-lists. That is short of §17's rule and BOB should know it.

**Measure (START item 1).** The route map holds 1019 ops, with both new ops in it: `founderhandleset` served by `membership`'s map, `projectownervotes` by `project-roster`'s, each in exactly one owner's map. Both ops were already served through the spread maps before this job, so the route map gained no op: before 1019, after 1019. `split.test.mjs` carries no per-layer count (it has none to measure); it passes unchanged.

**Applied.**
- R5 (T49) by test: `t49.test.mjs` (new). Each of the two ops is in exactly one owner's map, in the route map, and answers through the route what its owner answers called directly (T48's pattern). Control: a probe no map serves is in none.
- `roster.test.mjs` hand-list (`OPS`, R5/R9/R45): `projectownervotes` added at its place in the route's order. This was the one inherited red in the plane suite the job owned.
- `t41.test.mjs`:124 (N1073): the literal ai-use op list is replaced by a read of the owner's map, `aiUseOps`; the route-map loop that checks each op is in the route map stays.

**Deferred, with why.**
1. **R56 (words by key) is not met and not built here.** Its `word(key, vars)` and `hasWord` are T49-15 setup-words' interface, and on the tranche `setup-words` still has the old `WORD_ROWS` module: no `word` export, and it has not merged. Building against an interface that does not exist would break the module's import and its tests. `screens.mjs` holds the member-facing sentences and titles (about 20 lines, the `screen.*` keys of `words-reads.json`'s `reads` for plane), and `ask.mjs` holds others. I have not converted them. Requested: a CHANGE (or a START note) when setup-words merges, so R56 is built against its real `word`.
2. **Hand-lists beyond the two named sites.** N1073's census draft lists about 95 plane hand-list items (`t47`, `t42`, `accepted` and others). Entry T49-30 names `t41:124` and "its other hand-lists". I re-pinned only `t41:124` and `roster`, the two that are red or named. The rest are green. Doing them all is a sweep beyond this entry, so I have left them for the modules' next touch (N1073's use rule). Question for BOB: include the sweep in T49-30, or hold it for the next plane job.
3. **Rule 6 checks, none needing an edit.** `labelled` appears only in source comments, not member-facing text (N1068 is not owed a change here). The `admin` grep finds no founder id reaching a reader in `src/plane`. No `ok: true` answer carries a refusal, `started: false`, `dispatched: false` or `withheld` (D29).

**Inherited red, not mine (rule 5 (10)).** `store.test.mjs:85` (R2, R10): `STEP_ORDER` is taken from `membership`'s `MODULE_ORDER`, which lacks `setup-words` until N1115 (T50). It fails on this branch exactly as at START, and is accepted by name in plan rule 5 (10).

**Tests run.**
- Full plane suite (`node --test test/m/plane/*.test.mjs`), before: 246 tests, 244 pass, 2 fail (`roster` R5 hand-list, now fixed; `store.test.mjs:85`, rule 5 (10)). After: 248 tests, 247 pass, 1 fail (`store.test.mjs:85`, rule 5 (10)).
- `checks/format.mjs /home/user/bio`: `format: 170 modules, 169 requirements files; 0 failures`.
- `checks/architecture.mjs /home/user/bio plane`: `architecture: 56 product files, 619 relative imports (2 naming no tracked file, not judged); 0 failures`. `checks/run.mjs`: architecture `3352 product files … 0 failures` over the whole product.
- `checks/coverage.mjs /home/user/bio plane`: `coverage: 1 modules, 56 of 56 live requirement ids named by a test; 0 failures`. `checks/run.mjs` over the product: `coverage: 169 modules, 5428 of 5515 live requirement ids named by a test; 18 failures`, none in `plane`; they are in other L11 modules' open jobs (`control-plane` R96–R99, the `screens-*` modules, `site`, `setup-words`).
- `checks/ownership.mjs /home/user/bio plane origin/tranche/T49`: `ownership: 4 files changed by plane between origin/tranche/T49 and HEAD; 0 failures`.
- `checks/channels.mjs` (via run.mjs): `channels: 2 participants, 606 outbox commits read; 0 failures`.

**Found in another module.** None new. The `control-plane` R96–R99 coverage gap is its own open job (T49-29).

**Size (session_012h3BBihPG3oRtYmVkx9DcV):** test runs 2, module lines 2282.

## J2 · COMPLETE

COMPLETE again for T49-30 · plane (after ANSWER B2). Commits on job/T49/plane: e5063109e9 (R56 by key), pushed; the tranche (T49, with setup-words merged) merged in first.

**R56, built (K3372).** Read setup-words' Provides R10–R13 whole and its `word`/`hasWord` in `src/setup-words/index.mjs`. Keyed sentences now go through `word(key, vars)`; the unkeyed strings stay as `words-reads.json` marks them.
- `src/plane/ask.mjs`: the refusal and detail sentences of ask and draft: `refusal.ASK_NOT_A_MEMBER` (both paths), `refusal.AGENT_WORKER_SILENT` (four places), `ai.refused.notdeployed` (AGENT_WORKER_UNBOUND, both paths, as BOB ruled), `refusal.PASSAGE_TOO_LONG` (with `{max}`), `translate.undetermined.language`, `ai.keepaway.unread` (two places), `ai.draft.planunread`, `ai.draft.recordsunread`, `refusal.NO_SUCH_NOTE`. Where the sentence carried a diagnostic (the records read's thrown message) the diagnostic moves to a separate `cause` field, so no information is lost.
- `src/plane/screens.mjs`: the titles and purposes the words list keys for the plane's screens: queue, finder, subjects' purpose (`screen.people.purpose`), themes, projects, review (`screen.held.purpose`), members, add (`screen.capture`), bundle (`screen.document`), inquiry (`screen.question`), project, action, review-copy, and published-case (`screen.published`). Mappings are my reading by meaning; a registry screen with no key keeps its own English (see the report below).
- Keys used: 33 of the 35 `reads`. `screen.front.name` and `screen.front.purpose` are read by no plane screen: the registry has no front screen. Left unused, not invented.

**Tests.** `test/m/plane/words.test.mjs` (new), R56 in the titles: each key the plane reads is `hasWord` and a key `words-reads.json` lists for plane; the registry draws `word(key)` for each keyed title and purpose; the passage limit is filled with its maximum; controls: `WORD_VAR_MISSING` for a missing placeholder and `UNKNOWN_WORD` for an unknown key. No test holds a sentence's English. `ask.test.mjs` (B2 control) and `release.test.mjs` (the members purpose) compare `word(key)` instead of the old sentence.

**REPORT to BOB: titles with no key.** These titles are member-facing English that no key in `words-reads.json` holds, so they stay in source as the inventory marks them, not as inline keys: "Subjects", "Progressions", "Themes" (title), "Projects" (title), "Review" (title), "Case files" (title and purpose, the `published` screen), and "Your accountability record" (already unkeyed). Requested: keys from the design lane for these, or confirmation that they stay. This is the rule that "a sentence no key holds is a REPORT, never inline English."

**Checks.** `checks/format.mjs`: 0 failures. `checks/architecture.mjs plane`: 0 failures (58 files; the new `setup-words` import is accepted). `checks/coverage.mjs plane`: 56 of 56 live ids named (R56 now named). `checks/ownership.mjs plane origin/tranche/T49`: 9 files, 0 failures. `checks/run.mjs` over the product: format 0, architecture 0, channels 0; coverage failures remain only in other modules' open L11 work (control-plane R96–R99 among them).

**Tests run.** Full plane suite: 250 tests, 249 pass, 1 fail: `store.test.mjs:85` (R2, R10), the inherited red accepted by name in plan rule 5 (10) until N1115 (T50). Everything else passes, including the new R56 tests.

**Still deferred, as in the first COMPLETE:** the N1073 hand-lists beyond `t41:124` and `roster`, which B2 says wait for plane's next substantive entry (K3268).

**Size (session_012h3BBihPG3oRtYmVkx9DcV):** test runs 4, module lines 2300 (src/plane, counted after this job's edits).
