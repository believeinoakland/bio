# screens-action (T47)

**Status** · session_01HXdBS4CDZAKqJEhJHkH1oj · depth 2 · COMPLETE · handled B7

## J1 · QUESTION

Readings I am building on; answer only where you rule otherwise.

1. **R10 (where the unsent-request item opens).** `action-producers` R25 gives the item's door as "the action's screen", but the registry's `action` screen does not list `filingrecordsent`, so it cannot draw the send step. My reading: `request` takes an action id as its subject (`/app/request/ACTN-…`) and opens at the step the action has reached (no law → the law; no draft → prepare; approved and not sent, from `filingsfor` → the send step). `action`, for an action holding an approved, unsent filing, draws "Pick up where you left off", a link to `/app/request/<action>` (or `/app/start-send/<plan>?…` for an action started from a plan). screens-daily R13's link should then be `/app/request/<action>` for a records request. A new request is `/app/request/<project>`.
2. **Subjects.** `plan` is addressed by its plan id. `start-send` by `<plan>~<option>` (one path segment), and then by the new action. `action` and `request` by the action id. `matter` by the determination id (its escalation found through `escalationstatus`).
3. **Reads beyond the registry's.** I also read `plans`, `filingsfor`, `actionholdpreview`, `profiles` (for R9's view) and `list` (type project or action, for the title on the path), all declared reads. R21 restricts acts only.
4. **R9 (help-records).** The registry's text names a state, a city and a portal. Under interface-shell R23 (no place named), the words are general. The place's own facts (the faster request's rule, its days and citation) are drawn as record data from `profiles`' `view.deadlines` (`applies_to: records_request`).
5. **Gaps I will REPORT, not fix (other modules).** (a) No read answers a prepared draft's text, blanks or fills after `filingprepare`/`communicationprepare` (filings R13 names none), so a reload between prepare and approve loses the draft. The screen keeps it in page memory and says so. (b) `action` answers neither its project nor its title. (c) No op reads `actionpressure`'s marks (`pressureFor`), so R5's "pressure" draws only the replies' own `entries[].pressure`. (d) The registry lacks `help-records` and `matter`'s `escalationreopen` until wizard-scripts R35 merges, so my tests are red until then.

## J2 · QUESTION

Five more points, each with my best reading. I am building on these readings unless you rule otherwise; none of them stops me.

1. **R3, "`filingrecordsent` read, not done, at the phone width" (`op-grades` R18, `LARGER_SCREEN_ACTS`).** The kit gives a screen no phone signal, and the shell (R11) holds back only signed and irreversible acts. My reading: this is the shell's to do. `interface-shell` R11 should also hold back every op `phoneOf` answers `false` for (today only `filingsent`/`filingrecordsent`, by alias), drawing what it does and where to finish it. Until it does, my screen draws the act as usual, and I test only the act's own behaviour. If you rule instead that the screen does it, the kit needs `cs.phone()`.
2. **R4, the "Get a record" wizard's mark.** The current kit has no way to draw a wizard mark (`cs.wizard` is `interface-shell` R31, T47, unbuilt). My reading: when R31 lands, I draw it as `screens-wizards` defines the mark (a control calling `cs.wizard(<Get a record's script>, <version>)`). Until then it is deferred, unless you name the script id and version and the shell's mark API now.
3. **R5, "each due date opens `due-date`".** `due-date` is `screens-investigate`'s. I link `/app/due-date/<action>~<entry position>`. Please confirm, or name the subject form `screens-investigate` uses.
4. **R1, "Ask the assistant for options" (`optionpropose`).** As the code stands, `optionpropose` from a member records the member's *own* proposal (summary, category, matter, why). It does not start the assistant: a machine proposal needs a planning run, and no registry act on `plan` starts one. I draw it only while the assistant is reachable, as R1 says, with those fields. That is a gap for the design stream or `action-plans`: the label promises the assistant. I will REPORT it.
5. **R6, the escalation's stage names.** R6 (and the mockup) name the seven stages Documentation, Notification, Clock starts, Public, Formal, Political, Legal. `escalation`'s code names 4–7 as response_evaluation, legal_tools, sustained_attention and political_accountability. I draw R6's names by stage number, since the requirements bind. The mismatch (stage 5 is "legal tools" in the code but "Formal" in R6) is a REPORT for `escalation` or the design stream.

## J3 · REPORT

Findings in other modules, beyond those in J1 (5) that B2 has placed as N1034 and N1035.

1. **`action-plans` R1 versus the design stream (`optionpropose`).** The registry labels `optionpropose` "Ask the assistant for options". From a member, the op records the member's *own* proposal; nothing on `plan` starts a planning run for the assistant. As built, the screen's act is the member's proposal form, drawn only while the assistant is reachable (J2 item 4). The label promises more than the op does: a registry correction or an act that starts the run.
2. **`escalation` versus `screens-action` R6 and the mockup (stage names).** R6 names stages 4–7 Public, Formal, Political, Legal. The code names 4 response_evaluation, 5 legal_tools, 6 sustained_attention, 7 political_accountability. I draw R6's names by number. Either R6's words or the code's stage table should move.
3. **`interface-shell` R11 versus `op-grades` R18 (`filingrecordsent` at the phone width).** The shell holds back only signed and irreversible acts. `LARGER_SCREEN_ACTS` (`filingsent`) is not held back, so R3's "read, not done, at the phone width" is unmet by any screen (J2 item 1).
4. **`action-plans` R37 (`optionstartpreview`).** The preview's addressee carries the role and body but not who holds the office today. R2 asks for that, and `actions`' read answers it (`holder_on_date`) only once the action exists. Step 1 draws the office by its role alone.
5. **`interface-shell` (T47 kit, R31).** No wizard-mark API exists yet for R4's "Get a record" mark (J2 item 2).

## Completion (SCREENS-ACTION #1)

**Entry applied.** T47-64: `plan`, `start-send`, `request`, `action`, `matter` (R1–R7), with L11's fold: R8 (the period, form and cost limit as `fills`, the portal's warning and request number), R9 (`help-records`) and R10 (an action opens at its step). Built fresh to interface-shell R21's contract, on the readings of J1 that B2 (K3145) confirmed.

**Files** (for BOB to enter in `modules.json`, K1043):
- Code, `bio-plane/src/screens-action/`: `index.mjs`, `words.mjs`, `send-steps.mjs`, `plan.mjs`, `start-send.mjs`, `request.mjs`, `action.mjs`, `matter.mjs`, `help-records.mjs`.
- Tests, `bio-plane/test/m/screens-action/`: `page.mjs`, `contract.test.mjs`, `plan.test.mjs`, `start-send.test.mjs`, `request.test.mjs`, `action.test.mjs`, `matter.test.mjs`, `help-records.test.mjs`.
- Uses (as in `modules.json`): interface-shell, setup-words, op-declarations. Tests also use interface-shell's harness.

**Readings taken (each tested):**
- Subjects: `plan` is addressed by the plan id. `start-send` by `<plan>~<option>`, and after the start by the action. `request` by the project (a new request) or the action (opened at its step). `action` by the action. `matter` by the determination, then `<determination>~<escalation>` once one is opened.
- Shared steps: `send-steps.mjs` holds prepare, approve, second approval and record-the-sending, for both screens. The step comes from `filingsfor`. A prepared text is kept in page memory only, because no read answers it (N1034).
- Words: 3 rows share a `WORD_ROWS` key. `act.plansubjectadd.label.plan` and `.does` call a plan's subject a matter (R7). `act.filingrecordsent.does` follows DEC-149. `help-records` names no place: the profile's laws are drawn as data (interface-shell R23).
- Acts the owners weigh as `undetermined` (`optionadd`, `optionstart`, `communicationprepare`, `actioncreate`, `actionpressure`, and others) are reasoned in the browser (interface-shell R11, DEC-87), so the shell asks a reason. `optionstart` sends it also as `why_first`.

**Deferred:**
- R4's "Get a record" wizard mark, until the kit offers a mark (J2 item 2).
- R3's phone-width hold of `filingrecordsent`, the shell's by my reading (J2 item 1).
- R2's "who holds the office today" in Step 1: the preview does not carry it (J3 item 4). It is drawn on `request` and `action` from the action's read.
- J2 is unanswered at this COMPLETE; a ruling there re-opens the job by CHANGE.

**Found in another module:** J1 (5) (N1034, N1035) and J3 items 1–5.

**Tests and checks:**
- On `job/T47/screens-action` as pushed (5b187f9fab): `node --test bio-plane/test/m/screens-action/` gives 4 pass, 47 fail. Every failure is `interfacePage` refusing `matter`'s `escalationreopen` and the missing `help-records`, because the registry on `tranche/T47` predates wizard-scripts R35. This is the inherited red B2 named (it clears at that merge, by a CHANGE).
- On a scratch copy of the same commit, with `SCREEN_REGISTRY` and `WORD_ROWS` re-taken from `registry.json` and `words.json` at PR #33's head (what wizard-scripts R35 and setup-words R7 do): 51 pass, 0 fail.
- Checks, from civicos-process `d547b03e00`, on that scratch copy with my paths entered in `modules.json`:
  - `format`: 0 failures.
  - `architecture screens-action`: 17 product files, 0 failures.
  - `coverage screens-action`: 10 of 10 ids named, 0 failures.
  - `run.mjs`: architecture 0 failures; coverage fails only other modules' ids, none of mine.
- On the job branch itself: `ownership screens-action tranche/T47` gives 0 failures.
- No layer tests are named in `build/manifest.md`. I provide no service, so there are no users' tests to run.

Size (session_01HXdBS4CDZAKqJEhJHkH1oj): test runs 14, module lines 1467

## J4 · COMPLETE

T47-64 applied: plan, start-send, request, action, matter, help-records (R1–R10). Files, readings, deferrals and checks are in the record's Completion section. My tests are red on the tranche only through the registry that wizard-scripts R35 re-takes (51/51 pass with it, on a scratch copy). J2 is unanswered and J3 reports findings.

## Completion of B3 (CHANGE, K3149) and B4 (ANSWER to J2)

B4: every reading of J2 stands, so nothing changes in code. R3's phone hold is the shell's (interface-shell R50), the wizard mark is screens-wizards R2's, the due-date link is `/app/due-date/<action>~<position>` as built, and R6's stage names stand.

B3: merged `tranche/T47` (wizard-scripts, setup-words, instance-setup, op-grades) at 2840e58403. `node --test bio-plane/test/m/screens-action/` gives 51 pass, 0 fail. The format check gives 0 failures. Coverage and ownership fail on the branch only because my paths are not yet in `modules.json` (K1043): with them entered, as on the scratch copy, both pass (10 of 10 ids, 0 failures).

## J5 · COMPLETE · re B3

B3 merged at 2840e58403: 51 pass, 0 fail. B4's rulings match what is built, so the code is unchanged. My files still need entering in modules.json (listed in the record's Completion section).

## Completion of B5, B6, B7 (CHANGE, K3152, K3153, K3157)

- Merged `tranche/T47` (through action-producers and op-declarations, K3157): 51 pass, 0 fail.
- B6: I ran my tests on a scratch copy of the branch with `job/T47/interface-shell` (@ f8251c4926) merged on top: 51 pass, 0 fail. One test was adjusted so it works with both kits. R1's sort test now reads each row's name without the panel control that the new kit draws beside it (R27). No code changed.
- My tests compare requests by op only, so the new `bootstrap` request needs no filter.
