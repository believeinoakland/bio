# escalation (T45)

**Status** · session_01HztAVfrFX3rGVayQh2NyNt · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R31's state `stopped_pursuing` is not a state of the `escalation` type in `record-grammar` R35 (`STATES.escalation`: legal `open suspended ended`; edges open→suspended ended, suspended→open ended). An escalation is a promoted document (R21) and promotion R15 refuses a `current_state` outside the catalogue's table, and promotion's history check (C-4.2) marks an undeclared edge an error; escalation's own R21 test asserts `STATES.escalation.legal` too. So R31 cannot land as written without a `record-grammar` change, and no T45 entry gives one (K2780 amended State Rules §4.4; `affordances` R?'s vocabulary list already names "escalation states with `stopped_pursuing`").

My best reading, which I am building on now: `record-grammar` R35 gains `stopped_pursuing` for `escalation`: legal `open suspended ended stopped_pursuing`; edges open→suspended ended stopped_pursuing; suspended→open ended stopped_pursuing; stopped_pursuing→open; ended none. Until that lands my R31 test (the stop written as the document's `current_state`) is red, as an inherited red named to `record-grammar`'s change. Options for you: (a) a small `record-grammar` job/addition in T45 (or BOB's own act on that table) with the edges above — my recommendation; (b) R31 amended so the document stays `open`/`suspended` and `stopped_pursuing` lives only in escalation's own row and log (I would not recommend: the record's state would disagree with the module's). Which one?

## J2 · REPORT

Built on my branch (pushed): R6, R14, R23, R25, R30, R32 and R31's code; R31's tests red only on J1 (record-grammar's `escalation` states). Readings I am building on — each yours to change by a CHANGE; the first three need another module's text or code:

1. **R30 needs a read of `actions` R87's scope.** R87 makes "confidential" an appended act (`actionScope`) and names no field in `actionRead` (R25/R29) or `actionsFor`. I read `actionRead(...).confidential === true` (or a `scope` stating it). Please have `actions` (T45-27) answer the latest scope on `actionRead` as `confidential: true|false`, or tell me the field.
2. **R14 reads `conformance.curesOf` (R37), whose top-level shape is not stated.** I accept per-standard entries `{standard, link: {link, cure, standard, by, at, cure_standing}}` under `standards` (also `links`/`items`/`cures`, array or map). Only `cure_standing: true` links count; the cure determination must be live, compliant for that standard, recorded after the escalation opened (the determination's own `at`, not the link's), and of the same office (conformance R36's rule). With no `curesOf` held yet, only the same act restores (never read as restored). If the escalation's determination is superseded, I read cures on it only, not on its successor. Please pin R37's shape with T45-23.
3. **New ops `escalationstoppursuing`, `escalationreopen`** need specs, grades and stamps in `op-declarations`, `op-grades`, `affordances`, and routes in the plane, as rule 4 (12) does for other new ops (their suites show no new red today: 653 pass, 11 fail, the same with and without my change).
4. **R31:** a stopped escalation also refuses `escalationEnd` and `escalationSuspend` with `NOT_OPEN` (now minted once, at `refuseNotOpen`; `where` changed from `#edgeArgs` to `refuseNotOpen > is-escalation-open`; translation widened), and resume answers `NOT_SUSPENDED`. Attach and evaluate stay allowed while stopped, as while suspended. Reopen's order: MACHINE_CANNOT_STOP, NO_SUCH_ESCALATION, NOT_STOPPED, ESCALATION_NO_REASON. Log kinds and timeline kinds are the literal `stopped_pursuing`, `reopened`. Rows: C-116.47 MACHINE_CANNOT_STOP, C-116.48 NOT_STOPPED.
5. **R30:** "every attached action confidential" read as "at least one attached, all confidential" (one with none attached is answered). Every item is `public: true` for every caller, as R30 says; note this publishes deliberation (declines "for now", suspensions, evaluation readings) into cases through case-authoring R57, which v0.2 rule 15 and R57's "leaving out deliberation… is the producers'" may not intend. If you want only outward acts public (as actions R66), amend R30 and I follow.
6. **R6:** `reply_owed: false` read from `actionRead` where it carries the field, else from the document (actions R82 not yet built); a `no_response` entry then does not trigger, a `received` one still does.
7. **R23:** the attachment records `premise_override: {ground, reason, by, at}` from `actionRead`'s `premise_override` (ground null until actions R74).
8. **R32:** context lists actions resting on the determination or on any finding in `determinationRead().findings[].finding`, excluding every `breach: true` action, each `{action, kind, sent_at, resolution, state}`.
9. Not in my requirements but named by conformance R33: refusing a void determination through `determinationVoided` at R1/R27/R29. Today a void one (outcomes read undetermined) answers `NOT_NONCOMPLIANT`. Add a line if you want `DETERMINATION_VOID`.

## J3 · COMPLETE

**Completion (T45-32), head bbf7750cd7 on `job/T45/escalation` (tranche/T45 merged at d9df7faade).**

**Applied:** R6 (no reply owed: neither the clock nor a `no_response` entry triggers; the read's note says "no reply owed"), R14 (a curing act of the same office linked through `conformance.curesOf`, `cure_standing: true`, restores compliance per standard; `COMPLIANCE_NOT_RESTORED` names per standard what is missing), R23 (an overridden action attaches once it rests on this determination; the attachment entry records `premise_override: {ground, reason, by, at}`, shown in the history), R30 (every item `public: true`; an escalation whose attached actions are all confidential is not answered; a confidential attachment never is), R32 (`context` in the read). R16's and R25's T45 sentences and R30's stop sentence depend on R31.

**Deferred:** R31, as B2 directs (T46, N910, K2844). Its built version (stop, reopen, C-116.47 `MACHINE_CANNOT_STOP`, C-116.48 `NOT_STOPPED`, `NOT_OPEN` widened, two ops arms, tests) is in commit f0c0e4574d. It was reverted here and is named by a `test.todo`. Items 3 and 4 of J2 are void with it: no new op, no new row and no `where` change ship in T45. Its parts in R16 (never listing a stopped escalation), R25 (the two arms) and R30 (the stop and reopening) go with it to T46. Their *(not yet met: T45)* marks may want T46 too; that is your fold.

**Found in other modules (also in J2):** (1) `actions` R87 exposes no read of the confidential scope, so I read `actionRead().confidential === true`. (2) `conformance` R37's answer shape is not stated, and my read tolerates several shapes. (5) R30 makes deliberation public through case-authoring R57. (9) `conformance` R33 names escalation among the refusers of a void determination, which escalation's requirements do not say. No artifact made stale by me: no new op ships.

**Own code read whole** (index, checks, doc, ops, schema) and all tests read whole. The reading set was read as K2700 allows: requirements, code and tests whole by me; the used modules' public parts and the later users' lines read whole by a helper, whose digest cites each section. Flaws: none found beyond the above. `#compliance` now also skips a void compliant determination.

**Tests:** `node --test bio-plane/test/m/escalation/`: tests 70, pass 69, fail 0, todo 1. Users of my services:
- `test/m/monitoring`, `legacy-store`, `plane`, `action-plans`, `queue-producers`: 465 pass, 2 fail. Both are inherited reds (rule 4 (9), (11)).
- `affordances`, `control-plane`, `op-declarations`, `op-grades`, `answer-envelope`: 653 pass, 11 fail, identical with and without my change (inherited reds).

**Checks:**
- format: 153 modules, 152 requirements files; 0 failures.
- architecture escalation: 18 product files, 65 relative imports; 0 failures.
- coverage escalation: 32 of 32 live requirement ids named by a test; 0 failures.
- ownership escalation tranche/T45: 10 files changed; 0 failures.

New test files: `stopped.test.mjs` (the todo) and `t45.test.mjs`, under my tests path.

Size (session_01HztAVfrFX3rGVayQh2NyNt): test runs 16, module lines 2218
