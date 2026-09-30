# contradiction (T16)

**Status** · session_01ABCPCsNDwoT4nvrzvxni42 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four readings I am building on now; none blocks me. Correct any and I bring the work in line.

1. **N366, `reach` (R24/R25).** `reach.projects` names only the projects the viewer sees at `FULL` (membership R80 `inSight`), read through `projectsDrawingOn(inq, viewer)`, and for an extent side only through inquiries citing the row that the viewer may see. The rest are **not counted and not flagged**: any count or "others exist" flag differs between zero, one and three hidden projects, which R55's parity forbids (its test is byte-identity across hidden-party counts), and membership R44 never widens a reverse edge. `reach.truncated` is measured on that visible list only. R49's parties, the notice, the opt-in and reveal, `unseen_conflict` and `{project}` matching stay read in full (`INTERNAL`) inside the module, never shown. `between_projects` is unchanged (a joined participant sees their project).
2. **N366, `{project}` at EXISTENCE sight.** A project the viewer sees at `EXISTENCE` (discoverable, not a participant) answers exactly as an absent id (`none_judged`), like `NONE`. I am not using membership's C-70.1 there, because R25 names no refusal but C-60.2. Say if you want C-70.1 (membership's general rule) instead.
3. **N368, the bounds (entities R39's class).** `tensionsOn`: at most 200 candidates read per referent (`TENSIONS_CANDIDATES_MAX`), with `truncated` per referent observed by reading one past. `contextFacts`: `resolved_entities` at most 500 per side (`FACTS_ENTITIES_MAX`), with `truncated` on that fact; the facts array itself is fixed at 4 or 5. `conflictNotices`' R50 `truncated` gets a test driving 51 notices. R27 and R28 don't state these numbers yet; the wording is yours.
4. **N359.** The `stale` mark from an inquiry's CORRECTED conclusion reads `member` and `at` from the latest R36 `resolve` act on the candidate naming that inquiry, and adds `act: <act_id>` beside `inquiry`. A conclusion reached only through basis-versions' own door has no resolve act. There `member` and `at` stay null, with `why: "concluded through basis-versions' own door; no concluding act of this module"`. Say if you want them read from inquiry R19 `stateHistory` instead; I'd need to reach it through `inquiryServices`, a declared use.

## J2 · REPORT

N366 is applied and pushed on `job/T16/contradiction` at 0d3612eecc, if you want it merged ahead of the rest. `reach` is read under the viewer's sight, and `{project}` is fenced (J1's readings 1 and 2). It is tested over two hidden projects, with byte parity with and without them, in `present.test.mjs` "R24, R25, R19 (N366)". The module's tests are 85 pass, 0 fail, 7 todo. I'm now working on N368, N359 and N365; the checks run at completion.
