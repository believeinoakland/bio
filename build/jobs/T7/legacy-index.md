# legacy-index (T7)

**Status** · session_0187Db6WrLHm27JAfM829YxD · depth 2 · COMPLETE · handled B4

**Job** · LEGACY-INDEX #4, session `session_0187Db6WrLHm27JAfM829YxD`, branch `job/T7/legacy-index`, entry T6-13 and the items forwarded to legacy-index at the plan's foot (`build/plan/current.md`, layer 11). A legacy module: no requirements file and no `tests` path. Its contract is the entry, and the requirements of the modules whose ops it routes: intent R2–R18 and R23; reevaluation R8, R9 and R14–R16 (K199); capture-requests R42 (K181 (6)). BOB's B2 and B4 (tranche merges: queue, then affordances) and B3 (NEEDS for intent's reads) are applied.

**Read whole:** `roles/JOB.md`, `build/manifest.md`, `build/layers.md`, `build/plan/current.md`, `bio-plane/src/index.mjs` (9,069 lines at the base), `build/requirements/intent.md`, the Provides of `reevaluation.md`, capture-requests R42, my T4 and T5 records, INTENT #1 J4, REEVALUATION #1 J2, CAPTURE-REQUESTS #1 J2.2 and J6, and rulings K153, K181, K199, K205 and K207.

## Entries applied

All are in `bio-plane/src/index.mjs` unless named. Each stamp is set after the caller's parameters are copied, so the caller's own value is overwritten.
- **K153** (`scripts/coverage.mjs`): `--strict` no longer gates on op reach through the plane (`unreached`, `doOnly`) or on check naming (`unnamed`). The condition is now `if (STRICT && (uncontrolled.length …`. My permission check did not refuse the edit this time.
- **The routes of layer 6–7's ops (N43's pattern).** I measured every op the ten layer-6 and two layer-7 modules serve (`*Ops` functions) against the OPS table. Unrouted were intent's 17, reevaluation's 6 and capture-requests' `capturerequestretry`. `basis`, `restson` and `strength` stay in-process, as inquiry's and strength's requirements say.
  - **Intent** (INTENT #1 J4.2; B3):
    - 17 OPS rows, exactly ten of them mutating: `objectivecondition`, `goaldeclare`, `goallink`, `goalclose`, `aspirationdeclare`, `aspirationdepart`, `aspirationdeadend`, `aspirationretire`, `triage`, `workobjective`.
    - The ten acts are a new array `INTENT_ACTIONS`, spread into both session sets. Each has NEEDS `contribute`. The seven reads (`INTENT_READS`) have NEEDS null (op=queue's precedent), as affordances' NON_ACTS names them (B3).
    - All 17 take the viewer stamp.
    - `author` is stamped into the body as the positional identity (`member:<id>`), the form intent passes to `projectAuthority`. A machine stamps `class:<cls>`, and an `ai` credential stamps `class:ai/<tokenId>`, never its principal.
    - `triage` also carries `assistantPrincipal`, stamped by op=promote's expression. It is deleted first and set only for a caller that did not arrive by a session. `run` stays the caller's word; ai-runs' surfacing gate asks every question of it.
    - Classes are `conclude`'s cut (admin, member, probe): a machine reaches the op and the store refuses it by name, except at `triage`'s `question`.
  - **Reevaluation** (REEVALUATION #1 J2.9, K199):
    - `reevaluationraise` admits admin and daemon (mutating) and is recorded in `UNATTENDED_BY_DECISION`, citing K199, so a session is told it is on the unattended path.
    - `reevaluationnotices` and `reevaluationchanges` are reads: admin, member and probe, viewer-stamped.
    - `versionadopt`, `versionkeep` and `reevaluationrecord` form `REEVALUATION_ACTIONS`: both session sets, NEEDS `contribute`, `author` stamped in the query by the version acts' expression, and viewer-stamped.
  - **`capturerequestretry`** (K181 (6)): admin and member, mutating, NEEDS `contribute`, both session sets, stamped with `viewer` and `principal` (the run verbs' expression, in a statement of its own).
- **The retired `capturerequestdraining` row is removed** (CAPTURE-REQUESTS #1 J2.2 (b)). Admin and probe now meet the plane's own `UNKNOWN_OP` with its code, instead of a codeless store answer. The comment above the capture-request rows is corrected: the daemon reaches three ops there, plus `reevaluationraise` by K199.
- **The unused `withReading` import is dropped** (CAPTURE #3 J2.5).
- **N70, pensweep** (`scripts/pensweep.mjs`): in a checkout whose `node_modules` are links, `git check-ignore` refused `pdf-worker/node_modules/` ("beyond a symbolic link", exit 128), and every pen read unignored. A probe that runs through a link is now asked at the link, bare (`linkedPrefix`), and the sweep names each such probe in `linked` and in its report.
  - In a real-install checkout the output is byte-identical to the base.
  - In a linked worktree, the base read 0 declared, 88 dirty and exit 1; this reads 38 declared, 50 dirty and exit 0, as a real checkout does.
  - `pen-sweep.test.mjs` there went from 36/5 to 41/0.
- **N68, `op-claims`:** nothing is left in my paths but `scripts/walkfloor.mjs`'s header, which said the op-claims instance "is live in this repository". It now says the instance was removed at N12 and that the account is its record.

## Readings taken (BOB's to confirm; built as stated)

1. Intent's `author` is the identity form (`member:<id>`), the form intent's own tests and `projectAuthority` use. Reevaluation's `author` is the bare member id, as the version acts write it.
2. Intent's and reevaluation's acts take `conclude`'s class cut (admin, member, probe), so each machine is refused by the store by name. REEVALUATION's J2.9 wrote "(member)".
3. `capturerequestretry` takes admin and member only, as K181 (6) wrote.
4. `reevaluationraise` is recorded in `UNATTENDED_BY_DECISION` with K199 as the citation.
5. `triage`'s `run` is the caller's word and `assistantPrincipal` is the plane's. That is how ai-runs' surfacing gate states the split ("the caller is the STAMP … the run is the body's word").

## Found in other modules (REPORT)

1. **legacy-tests**, made red by this job's decisions, each a re-pin:
   - `daemon-token` 54/2 (base 56/0): the daemon now reaches `reevaluationraise` (K199), so the pinned set becomes `acquire`, `capturerequestdrain`, `monitor`, `reevaluationraise`.
   - `d270-refusal-truth` 35/1 (36/0): the recorded-decision literal gains `reevaluationraise`.
   - `capturerequests`: its `capturerequestdraining` class-fence arm now meets `UNKNOWN_OP` (already on CAPTURE-REQUESTS #1 J2.5's list).
   - `refusal-wire`'s draining arm is fixed by the removal. The suite's other change is item 2.
   - `gate-reads` must classify the nine new reads, and `rung-ladder` must count the new mutating ops. Both suites stop first at `NO_OBJECTIVE` fixtures (INTENT #1 J4.1), on base and here alike, so they measure nothing yet. The same holds for `affordances`, `aicredential`, `members` and `hygiene`.
2. **intent / legacy-checks: the code `NO_STATEMENT` is two rows.** It is legacy-checks' C-33.14 (`publishCase`) and intent's C-110.10. Now that intent's ops are routed, `refusal-wire` (35/7 against base 37/5) grades intent's refusal against the catalogue's row and finds a different C-number and sentence. One of the two needs a code of its own (DEC-49's one code, one row).
3. **affordances:** four new NEEDS keys have no ACTS or NON_ACTS row: `capturerequestretry`, `versionadopt`, `versionkeep`, `reevaluationrecord`. Fifteen new mutating ops need a rung or a stated absence: intent's ten, those four, and `reevaluationraise`. Intent's are done (K213). The other five are not.
4. **legacy-tests: `coverage.mjs --strict`** still exits 1, on this branch and on the tip, for one reason only: `d419-content-crop.test.mjs` declares no negative control (`uncontrolled` = 1). Everything else it still gates on is clean. With a declaration there, `owed-controls` A13b can pass.
5. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (`index.mjs` changed). BOB regenerates them at the layer close.

## Tests and checks

No `tests` path (legacy). Measured on the merged branch (after B4) against the tranche tip, same machine:
- **A scratch driver through the whole plane in Miniflare** (not committed): **56 pass, 0 fail here; 3 pass, 53 fail on the tip.** It covers:
  - every new route and its class cut;
  - NOT_CAPABLE for a view-only member;
  - each stamp overwriting the caller's (`author`, `viewer`, `assistantPrincipal`), and a machine refused by name at each act;
  - `triage` by a machine bearer meeting `SURFACE_NO_RUN` (the stamp reaches the surfacing gate), while a member's `triage` opens the question as the member;
  - the daemon and admin bearers reaching `reevaluationraise`, and a session told `MACHINE_CREDENTIAL_REQUIRED` citing K199;
  - `capturerequestdraining` answered `UNKNOWN_OP` with its code.
- **The whole old battery**, 371 suites, four at a time, on both trees: 186 red here and 184 on the tip, most of them the `NO_OBJECTIVE` fixture reds.
  - Every suite that differs: `daemon-token`, `d270-refusal-truth` (REPORT 1), `refusal-wire` (REPORT 2) and `identity-claims`. `identity-claims` read my new stamp comment's "a member's" as a member-only claim; I reworded the comment and it is 33/0.
  - `pen-sweep` is red only on the tip's worktree, whose `node_modules` I linked: exactly N70's fault. It is 41/0 here in both checkouts.
- `walkfloor` 42/0, `identity-claims` 33/0, `pen-sweep` 41/0.
- No layer tests (manifest).
- Checks (civicos-process `main`):
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 29 product files, 50 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
  - `ownership: 5 files changed by legacy-index between tranche/T7 and HEAD; 0 failures`

Size (session_0187Db6WrLHm27JAfM829YxD): test runs 830, module lines 19,829 (`index.mjs` 9,225; `scripts/` and `migrate/` 10,604)

## J1 · COMPLETE

T6-13 and every forwarded item applied, at the commit carrying this entry; the record above has the detail.
- K153's `coverage.mjs` edit is made (not refused this time).
- Layer 6–7's ops are routed: intent's 17 (after B3, NEEDS carries all 17, with exactly 10 mutating), reevaluation's 6 (`reevaluationraise` unattended per K199) and `capturerequestretry`. The retired `capturerequestdraining` row is removed, and the unused `withReading` import is dropped.
- N70: pensweep asks git at a symbolic link, never through it. N68: walkfloor's stale op-claims prose is corrected.
- Tests: a scratch plane driver reads 56/0 here and 3/53 on the tip. The whole old battery on both trees differs only in the suites named in my REPORT.
- Checks: format, architecture, coverage and ownership each show 0 failures.

REPORTs:
1. legacy-tests re-pins `daemon-token` and `d270-refusal-truth` (K199).
2. `NO_STATEMENT` is two catalogue rows: intent C-110.10 and legacy-checks C-33.14. `refusal-wire` shows it.
3. affordances needs rows and rungs for `capturerequestretry`, `versionadopt`, `versionkeep` and `reevaluationrecord`, and a rung for `reevaluationraise`.
4. `coverage --strict` is now gated only by `d419-content-crop` declaring no negative control (legacy-tests).
5. The plane bundle is stale.
