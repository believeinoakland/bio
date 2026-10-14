# screens-action (T47)

**Status** · session_01HXdBS4CDZAKqJEhJHkH1oj · depth 2 · WORKING · handled B2

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
