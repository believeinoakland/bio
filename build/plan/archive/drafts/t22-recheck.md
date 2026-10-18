# draft-T22 re-check against T21 L1–L6 (K929–K975), on tranche/T21 @ 28f1cf7b3c

State: L1–L5 closed (K940, K947, K952, K956, K960). L6 is still open: every job is merged except **agent-worker** (AGENT-WORKER #8). It has no merged `build/jobs/T21/agent-worker.md`, only `agent-worker.bob.md` (START B1). Its N458, N469 and N467 shares are pending.

Census check (run read-only): `row-census.test.mjs` is now **7 pass / 1 fail**. It prints "no snapshot of 1.51.0" and "STAMPED SINCE, retire" for C-68.1 and C-117.20–.22. A `git diff 903470ce89..HEAD` (the K947 stamp commit) of every row's `check`/`where`/`translation` finds **only C-53.13** changed in L3–L6. The bias C-26.1 and observation-log C-22.6 texts that changed are finding messages, not rows. inquiry-grammar, record-core, retrieval and observation-log state "no row, nothing awaits stamp": `inquiry-grammar.md`:14, `record-core.md`:13, `retrieval.md`:11, `observation-log.md`:8.

## (1) Lines marked [T21] or that depend on T21 L1–6

| draft line | status | evidence |
|---|---|---|
| :3 Before T22 opens (K954 channel, PR #6) | **holds; more evidence** | Channel prepared on `civicos-process` `prep/channel` (K957). Reviewed (K973). Forced-rewrite fix @ c00b0cf680, checks 107/0 (K975). D12 certifies at T21's close (K973, K975). Cite K957/K973/K975. |
| :5 Status "layer 1 closed, K940; layer 2 running" | **changed** | L1–L5 closed (K940–K960); L6 open (agent-worker). |
| :7 Cut from "rulings K921–K940" | **changed** | Now K921–K975 (and `next.md`'s N470, N471). |
| :9 Priorities: "the stamp … and whatever T21's layers 2–11 leave" | **changed** | N471 is an order leftover that T22 can do (P4, K966; `next.md`:25). Adds work in L1–L6, see (2). |
| :15 Rule 1, "T21's promotion job, 1.50.0 → its new version" | **changed** | T21 stamped 1.50.0 → **1.51.0**, ROW_CENSUS 984 rows b7c43a32… (K947; `promotion.md`:11, :44). T22 stamps **1.51.0 → next**. |
| :16 Rule 2, census suite (see For BOB 2) | **changed: firm, not conditional** | K941: legacy-tests' **T21 L11** job re-pins to 1.51.0, adds the 1.51.0 fixture and declares T21 L3–11 rows; the suite is red by name until then. Also `promotion.bob.md`:11, `promotion.md`:44 ("its 1.50.0 declarations and a 1.51.0 fixture are legacy-tests' L11"), `provenance.md`:16. So T22 L11 must retire `after: "1.51.0"` declarations and add the next version's fixture. |
| :21 "requirements govern where `current.md` rule 4 differs" | **moot** | K941 corrected rule 4 (`current.md`:24 now reads .31–.33, .35–.38). |
| :25 provenance C-53.13 | **holds** | K952; `provenance.md`:8, :16, :36; census diff (only row changed L3–L6). |
| :26–:35 filing-templates, local-facts, filings rows (L9) | **holds (pending)** | L9 not run. |
| :36 intent `PROJECT_GRAMMAR` `['C-2.9']` (L7) | **holds (pending)** | L7 not run. K972 struck intent R29's last sentence (wording). |
| :37 action-clocks / any other L3–L11 job | **L3–L6 part resolved: none beyond C-53.13** | Census diff; job records above. agent-worker pending. L7–L11 pending. |
| :39 N459 `out_of_view` changes no row | **holds** | K960; `connections.md`:21 (additive wire key, no row). |
| :44 L2 "[T21] the version it stamps from" | **resolved** | 1.51.0 (K947). |
| :45 L3–L10 "none at this draft" | **changed** | N471: provenance L3, content L4, connections and observation-log L5, run-rules L6. See (2). |
| :43 L1 "none" (not marked [T21]) | **changed** | N471's text-chain share is L1 (`modules.json`: text-chain L1, `src/textchain.mjs`:425). |
| :46 L11 legacy-tests "joins only if …" | **changed: joins** | K941 (see :16). |
| :54 legacy-tests START sketch | **holds; version now known** | Retire `after: "1.51.0"`. "47 kept suites" holds (K923). |
| :68 N467 row | **changed** | Also carries N469's legacy-ui notes: `app.html`, `README.md`, `check-mock-envelope.mjs` (K941; `next.md`:23). |
| :67 N461 release share | **holds** | More old strings land in `release/` and `newgroup/src/release.mjs` (K952, K956, K958; `query-language.md`:13, `bias.md`:14). Still deploy. |
| :70 first-profile facts | **holds** | K934 (M-188 not written), K941 (the 09-09/11-11 reading confirmed). |
| :74 stamp rows and starting version | **partly resolved** | Version 1.51.0 (K947). L3–L6 rows: C-53.13 only. |
| :75 carried entries (one line per entry) | **status below** | |
| :76 accepted reds (K936, K939, rule 3) | **changed** | See below; K941 and K952 are missing. |
| :78 whether legacy-tests joins L11 | **resolved: yes** | K941. |

Carried entries (:75):
- **Met:** N452 (K969); N453 (K946); N455 (K938); N456's record-grammar and promotion shares (K939, K947); N459 and N464 (K960); N463's capture-requests share (K971).
- **N458:** met in every L1–L6 module except agent-worker (pending).
- **N468:** its L2–L6 shares are met (K944, K946, K959, K962, K968, K971).
- **N469:** met in every merged L1–L6 job.
- **Pending (L7–L11):** N456's intent share; N457; N460; N462; N463's scheduler and plane shares; N465 (action-grammar L9, control-plane L11); N468's L11 shares; N469's later jobs and agent-worker; N467's agent-worker share; K921 work.
- **T21 additions to watch at the close:**
  - monitoring joins **T21 L10** (K949).
  - project-stage joins **T21 L8** (K939).
  - ratification L8 and queue L11 carry N471's share (K966).
  - control-plane L11 re-pins `catalogue-end.test.mjs` C-53.13 (K952).
  - legacy-tests L11 fixes `civicos-ui/test/run.mjs`:88 (K935, K965).

Accepted reds (:76):
- **Closed:** K936's membership reds (K946); K939's record-core reds (K944) and promotion reds (K947).
- **Still open:**
  - filings' 35, until L9 (K936).
  - intent `grammar.test.mjs`:47, until L7 (K939).
  - project-stage's 5, until L8 (K939).
- **Not in the draft:**
  - row-census, red until legacy-tests' T21 L11 (K941). It is red now: 7/1.
  - control-plane `catalogue-end.test.mjs` R43 (C-53.13 digest), until control-plane's T21 L11 (K952; `provenance.md`:15).
  - the code held twice between filing-templates' and filings' merges (K935).

## (2) Entries not yet carried by the draft

1. **N470** (`next.md`:24; K943): publication and reevaluation, the withdrawal of a ratified edition. LEFT OUT: Bob's (UX design work under way). It needs a row in the :56 table, and the count goes 12 → 14.
2. **N471** (`next.md`:25; K966; `strength.md`:20): notes naming `node tools/mintid.mjs` as live.
   - Its reason, "order (P4)", lapses in T22, so it is **doable and must be placed**. Still live at HEAD:
     - **L1** text-chain: `textchain.mjs`:425 (a new job).
     - **L2** promotion: `promotion/checks.mjs`:241 (add to the stamp START).
     - **L3** provenance: `checks.mjs`:235.
     - **L4** content: `checks.mjs`:19, :223.
     - **L5** connections: `checks.mjs`:25, :179.
     - **L5** observation-log: `checks.mjs`:212.
     - **L6** run-rules: `checks.mjs`:370.
   - All are comments, with no row change.
   - inquiry-grammar and basis-versions are met (K971). ratification (`checks.mjs`:451, :454) and queue are T21's (K966); `queuestate.mjs`:233 is already past tense.
3. **K945** (UX stream rules: cite DECs, never edit `ux-substrate/`, merge a moved `main` at the close) and **K954**'s channel reads (at takeover, each backstop and before any ruling, once in force) should join "Rules at the opening" (:13).
4. **Census suite at T22 L11** is firm (K941): see :16 and :46.
5. **No other** "deferred" items: every T21 L1–L6 record reads "Deferred: none". These "Found" items are already settled:
   - `basis-versions.md`:24 (K971)
   - `retrieval.md`:17 (K958)
   - `observation-log.md`:15, `layers.md` (K959)
   - `test-support.md`:28 (K937)
   - `pdf-pixels.md`:10 (K934)
   - `capture-sources.md`:18 (monitoring in T21 L10, K949)
   - `inquiry-grammar.md`:18 (K974)
   - `capture.md`:17 `pullKnock` C-68.1 (K887: "no change")
   - `run-rules.md`:17 (K965)

## (3) Draft entries now done or moot

- For BOB 1 (rule 4 stale): **done**, K941.
- For BOB 2 (census across T21): **done**, K941 (legacy-tests' T21 L11; promotion told not to edit, `promotion.bob.md`:11).
- For BOB 3 (N469's legacy-ui notes): **done**, K941; `next.md`:23.
- For BOB 4 (carried entries moved early): **done**, K941 ("K424's practice changed").
- For BOB 5 (K925 (3) 09-09/11-11): **done**, K941 (confirmed reading, local-facts settles).
- For BOB 6 (thin tranche): **moot**. N471 adds about 7 comment-only jobs across L1–L6.
- :21 rule-4 caveat: **moot** (K941).
- :44 and :78 conditional questions: **resolved** (K947, K941).
