# affordances (T47)

**Status** · session_01UKhMnGPjg8Y3PBnYKh2w1U · depth 2 · WORKING · handled B4

## Completion

**Read, whole:** `build/requirements/affordances.md`; `build/manifest.md`; my entry T47-49 and the plan's rules at the opening (rule 5's reds); rulings K3062, K3100, K3102–K3104, K3112, K3116, K3128, K3141; the split maps' affordances rows (`case-authoring-split-2.md` §5, `actions-split.md` §5); my code whole (`affordances.mjs`, `affordances/facts.mjs`, `door.mjs`, `words.mjs`, `act-help.mjs`, P20); my tests `catalogue`, `t36`, `t45`, `t45-backing` whole and the parts of `plane`, `backing`, `derive`, `t33` I changed. The reading set is over the limit (2486 KB), so per BOB's START a helper read every other test file of mine whole, and `plane`, `backing`, `derive` and `t45-backing` again, and wrote me a digest citing line ranges (K2032). Used modules' public parts I read only for the services I call: citation R4, R5, R14, R15; connections R22; leg-earning R4, R5; membership R43, R80, R85; op-grades R36, R37; op-declarations' T47 status line.

**Entries applied:** T47-49 (N992; K3062, K3102, K3104), on BOB's answers K3143 (J1) and my readings in J3:
- R54, R56: `ACT_HELP` regenerated from `mock-acts.js` on `tranche/T47` after PR #33's head (282 entries, R48's reading). `owed_passwordresetlink` is held under `passwordresetlink`. T47's declared ops are held under their own names: `unlock`, `passwordreset`, `grouplogoset`, `grouplanguagesset`, `signrequest`, `projectlist`, `projectquestions`, `drawquestion`, `projectbarset`, `monitorset`. R54's own texts are held (`captureupload`, `ask`, `subscriptiondisconnect`, `clockproposals`, `joindoors`, `statusreportassist`, `airundispatch`). `capture` and `hostingaccess` are no longer held. `handlechange` stays membership's refusal. No `owed_` key is held. This clears rule 5 (7a)'s two DEC-198/199 reds.
- R55: a new fact `legs_in {live, severed}`, on information targets only, asked through `inquiry.restsOnLive`. It counts the distinct questions the viewer may see. A frozen leg is never live, and a severed leg's question is counted only when no case pins it (`case-tensions.caseRelation`). On an information target, `sever` is also offered on a live leg and `reinstate` on a severed one (not on a retired target). On every other type, and in R13's existence facts, the fact is null-valued.
- K3102: plane `R14 R9 R18` sever-on-inquiry test restated for citation R15. A question's own leg on a question is accepted (sever and reinstate) but not offered (R9, R55 as written; J3 (1)).
- N908 §5: the catalogue tests read case-inputs' namespace, op map and checks (a new test: its three ops, `STATEMENT_ACK_NO_REASON`, R12's totality with `statementack` ungated), T23's test re-pointed, and R19's owners table re-pointed. backing drives `statementack` on case-inputs (`w.ci`).
- N961 §5: `catalogue`, `t45` and `t45-backing` drive `actionreceipt`, `actionscope` and `actionpromise` on action-records (`actionRecordsOf(host)`, `actionRecordsOps`).
- K3104: `peopledirectory` added to people's closed op map in `t33`. It has no help text, which is the design stream's (K3143).
- Flaws fixed in my tests (P8, from the digest): plane's "each act is accepted there" now drives sever and reinstate on INFO and INFO2 and restores the scene; two stale comments re-pointed (action-holds, action-records).

**Reds cleared:** rule 5 (7a)'s two; K3102's; K3116's R1, R12, R24, R14/R9/R18 and R19 ×2; K3128's three. Two remain, both waiting on op-grades (T47-48, which merges before me):
- `t33` R12 `peopledirectory` (K3112) waits for it to be named in `NON_ACTS`.
- `t36` R48/R53 "every key graded or named" waits on op-grades R36/R37 grading the 11 T47 ops above.
I will re-run both once op-grades has merged and `tranche/T47` is merged in.

**Deferred:** none of mine. The digest found weak tests outside this entry's scope, left as they are in this job: t33/t35/t36/t41-backing drive one reasonless value and do not check that nothing is written; plane R19's two loops name no exact code; converts:139 accepts any failure.

**Found in another module / for later jobs:**
- op-declarations (T47-53): four of its tests go red on my merge, from R34's partition, which its R34/R54 already require it to move:
  - `statusreportassist`, `joindoors`, `clockproposals` and `airundispatch` are now explained, so they leave `ACT_HELP_ABSENT`.
  - `captureupload` is explained.
  - `capture` (a member op) is now neither explained nor named; it needs an `ACT_HELP_ABSENT` ground.
  - `hostingaccess` (ungated) is no longer explained.
  - Its tests: `t41` R34, `t42` R47/R34, `t46` R51/R34, and the R34 partition test.
- Design stream (BOB's HANDOFF): `peopledirectory` has no text; `hostingaccess` lost its text.
- Generated artifacts: the plane bundle is staled by this merge (rule 5 (4)).

**Tests and checks run:**
- affordances `node --test test/m/affordances/`: tests 247, pass 245, fail 2 (the two waiting on op-grades, above). The plane suite on its own: 31/31.
- Users (P11), each compared with `tranche/T47`:
  - tasks 106/0, queue 142/0, store-door 45/0, conclude-project 1/0.
  - control-plane 235/7 and plane 218/5: the same reds as the tranche, none new.
  - op-declarations 140/16: the tranche has 12; the 4 new ones are those above.
- `checks/format.mjs`: 0 failures. `architecture.mjs . affordances`: 0 failures. `coverage.mjs . affordances`: 40 of 40; 0 failures. `ownership.mjs . affordances tranche/T47`: 0 failures. `run.mjs`: architecture 0 failures; coverage 25 failures, none affordances' (other L11 modules, rule 5 (1)); channels 0.

Size (session_01UKhMnGPjg8Y3PBnYKh2w1U): test runs 28, module lines 2729

**After B3 (CHANGE, K3147):** `tranche/T47` merged with op-grades (T47-48). The two reds waiting on it are cleared. R19 is re-pinned to op-grades' new grades: `irreversible` is only `publishat` and `publishatmove`; `publish` and `publishcheck` are `terminal`; `IRREVERSIBLE_WEIGHT` holds `personexpunge`, `publishat`, `publishatmove` and `standardrelease`. A new `t47-backing.test.mjs` drives `projectbarset` at strength's interface: refused `PROJECT_BAR_NO_REASON` for an absent, empty or blank reason, writing nothing, and accepted with one. plane's every-reasoned-op-driven test now counts T47's ops. Wording for BOB: R19's text still says `irreversible` goes "to the op that publishes"; since K3147 that op is `terminal`. Re-run: affordances 249/249; format, architecture, coverage (40/40) and ownership each 0 failures.

**After B4 (CHANGE, K3152):** `tranche/T47` merged. plane's R19 drive was red because `adminremove` answered `STORE_DID_NOT_ANSWER`: since op-declarations R58 it is one of `REAUTH_ACTS`, admission (R25) asks the store `reauthdue` first, and the plane does not route that to its store yet (plane's L11 job). Fix in my tests: `adminremove` leaves the plane drive, with a comment. Its reason refusal is now driven at membership's interface (`backing.test.mjs`, membership R7): three administrators; the second vote is refused `NO_REASON` for an absent, empty or blank reason, writing nothing, and carries with one. Found for plane / store-door (T47-66): the `reauthdue` route is owed, or every `REAUTH_ACTS` op is silent on the plane. Re-run: affordances 250/250; format, architecture and coverage each 0 failures.

## J1 · QUESTION

R56 and K3104, my readings (I carry on with them; the answer decides only the ACT_HELP keys):

(1) `mock-acts.js` on `tranche/T47` (PR #33's head f90b187c7b) has 282 entries and only one `owed_` key, `owed_passwordresetlink`; `passwordreset`, `grouplogoset`, `grouplanguagesset` and `signrequest` are bare keys there, as are `login`, `unlock`, and T47's new ops R54 said the file lacked (`drawquestion`, `projectbarset`, `monitorset`, `projectlist`, `projectquestions`). None of `unlock`, `passwordreset(link)`, `grouplogoset`, `grouplanguagesset`, `signrequest`, `monitorset`, `projectbarset`, `drawquestion`, `projectlist`, `projectquestions` is in op-declarations' OPS yet; op-grades (T47-48) grades them and op-declarations (T47-53, R55, R57, R59) declares them after my merge. Reading, on R53's K2999 precedent (ops op-declarations declares in this tranche are held under their own names, so R34's partition holds at both merges): every one of these is held under its op now (`owed_passwordresetlink` under `passwordresetlink`), no `owed_` key held; op-declarations then names none of them in `ACT_HELP_ABSENT`. `login` (in OPS, no NEEDS row) is treated as an ungated door, like `bootstrap`.
(2) `peopledirectory` (K3104 "help for peopledirectory"): the design gives no text for it in `mock-acts.js` or `words.json`, and R48/R21 forbid composing one here. Reading: no entry; op-declarations (R61) names it in `ACT_HELP_ABSENT` as a read; named back for the design stream.
(3) `hostingaccess` (still in OPS, ungated) has no text in the file any more (the design gives `hostingaccessset`, a separate declared op); like `capture` (R54) its former text is no longer held. op-declarations names it in `ACT_HELP_ABSENT` or retires it.
(4) Texts changed at PR #33's head beyond R56's three (`publish`, `publishat` are unchanged since PR #31; `caseratify` changed): `bootstrap`, `subscriptionsignin`, `accountreferenceset`, `accountreferenceremove`, `monitor`, `attest`, and the alias texts held under `strengthbarset`'s and `ruleanswer`'s ops — all taken verbatim, as R48 reads them.

## J2 · REPORT

`build/modules.json`: affordances' `uses` lacks `case-inputs` and `action-records`, which its requirements' Uses names (T47; N908, N961: the catalogue, `t45` and `t45-backing` tests read their namespaces, op maps and checks, and `backing.test.mjs` drives `statementack` at case-inputs' interface). Both are earlier in the order (113, 120 < 136). My tests import them, so `checks/architecture.mjs` will fail on those imports until the two edges are added (BOB's). Please add them on `tranche/T47`; I merge it in when you say.

## J3 · QUESTION

R55 and K3102, my readings (I build on them now):

(1) R55 offers `sever`/`reinstate` on a question's own legs only on an `information` target, and R9 still says "exactly when" for an inquiry target (a case's citation). But citation R15/R4 admit an inquiry as a leg's member too (`NOT_INFORMATION` only for neither), and K3102's re-stated test is on an inquiry target (QX, a leg of question QY): `op=sever&project=QY` on QX is now accepted. Reading: I implement R55 as written (information only); on an inquiry target the leg sever is accepted but not offered, which R18 does not forbid (it forbids offering what is refused), and the re-stated plane test says exactly that: cited by a question alone, sever and reinstate are withheld by R9 and the question's own leg sever is accepted (`ok`), then reinstated. If you want legs on a question offered too, R55 (and R9) need the inquiry target named; say so and I add it (one condition, the same fact).
(2) "each act naming that question as its citing object" against R16 ("never naming a question"): reading, the act carries no id; the fact `legs_in {live, severed}` counts questions, and the question is the act's citing-object parameter (`project=`), as a project is today.
(3) `legs_in` is asked through `inquiry.restsOnLive` (leg-earning R5: `connections.edgeSevered` over the question's references, divided citers skipped, case-frozen ones `frozen`): `live` counts the distinct working questions the viewer may see with a live leg on the target, `severed` those with a severed leg that are not case members (`case-tensions.caseRelation`), since citation R15 refuses a write to a divided or case-frozen question; a frozen question is counted in neither. `legs_in` is null-valued on every type but information, and on R13's existence facts.

## J4 · COMPLETE

T47-49 complete; see the Completion section of my record. Two reds remain, waiting on op-grades (T47-48): t33 R12 peopledirectory in NON_ACTS, and t36's every-key-graded test for the 11 T47 ops. I re-run both when you CHANGE me after op-grades merges. My merge moves op-declarations' R34 partition (4 tests, listed in the record) and stales the plane bundle.

## J5 · COMPLETE

B3 applied: op-grades merged in, both waiting reds cleared, R19's rung sets re-pinned, projectbarset's backing driven (t47-backing). affordances 249/249; checks 0 failures. R19's wording ('irreversible to the op that publishes') is now stale against K3147; see the record. I use no new wizard-scripts service.
