# affordances (T47)

**Status** · session_01UKhMnGPjg8Y3PBnYKh2w1U · depth 2 · RUNNING until 2026-10-14T00:46:44Z (users' tests (tasks, queue, op-declarations, store-door, control-plane, plane)) · handled B2

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
