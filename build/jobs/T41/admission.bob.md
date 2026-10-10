# BOB to admission (T41)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 11, admission: T41-59 (was T40-18a). Read also K2394 and K2484 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/admission.md` (read whole). Marked `*(not yet met: T41)*`: R3 (N797; K2394) the public ops that address scratch are declared, `handlecheck` among them (it reads an invitation, as `invitelook` does), every other public op pinned (`NAMESPACE_PINNED`, C-78.2); R19's clause (DEC-188 (8)): `groupswitchset` retired to `accountusesset`, no longer among R24's session-only ops; R22 refused keys, links and over-the-limit requests counted through `credentials.securityCount` once per refusal (kinds `credential` and `rate`, `country` as stated, nothing else of the request), (T40; N797) `op=handlecheck` answered `NO_SUCH_INVITATION` counted as kind `credential`, as `invitelook`'s is. Test each explicitly, with a negative control (K874). The plan's applied L11 line (K2484) gives you "admission R19".
Reading set (mechanics §17): measured at this START: 406 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L11: wizard-scripts, op-grades, affordances, tasks, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, control-plane, plane (`modules.json` order, the plan's L11 line; plane last; tasks (T41-61a) merges at its `modules.json` place, after affordances, whatever its number). Layer 10 is merged into `tranche/T41` before this START: build on it as merged. Same-layer providers you use: op-declarations (T41-58; R24, R42's `handlecheck`). Its changes reach you by a CHANGE once it merges. answer-envelope (T41-60), control-plane (T41-62) and plane (T41-63) use yours later in this layer. Record your final `uses` in your record, for BOB to apply at your merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); yours: none named for admission. Found at this drafting (grep): `doors.test.mjs`:12 lists `groupswitchset` among `GROUP_KEY_OPS`: re-state it for R19; none other unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.


**Marked at this START (K2573, re-taken after L10's merge):** R3, R19, R22. These are the ids your job meets and names; the lines above that list marks are superseded by this one.

## B2 · ANSWER · re J1

ANSWER J1 (K2574): build against the real `OPS` as you propose, no stand-ins. When OP-DECLARATIONS #16 merges you get a CHANGE: merge the tranche, verify the R3/R19/R22 arms green, then post COMPLETE. Until then set `WAITING ON BOB (op-declarations merge)` once the rest is done.

## B3 · CHANGE

CHANGE (K2576), answering J2: admission is the site. Your R20 on `tranche/T41` gains `handlecheck`'s `invite` and `handle` as body-only (`BODY_ONLY_FIELDS`), a query invitation answered `NO_SUCH_INVITATION` as R17's doors answer a missing key. Merge it in, build and test it (negative control, K874); the rest stands as B2 says (COMPLETE after op-declarations' merge reaches you).
