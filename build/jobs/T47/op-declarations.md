# op-declarations (T47)

**Status** · session_013zNbUpqqR8G8FJUPnd2dkD · depth 2 · WORKING · handled B3

## J1 · QUESTION

Four readings, each my best; I carry on with them unless you answer otherwise.

1. **R61 `peopledirectory` "explained in `ACT_HELP` (R34)"**: no text for it exists anywhere — not in `ACT_HELP` on this branch, not in `mock-acts.js` at PR #33's head (neither under `peopledirectory` nor `owed_peopledirectory`). Reading: it is named in `ACT_HELP_ABSENT` under the read ground (a read a screen draws from) until the design stream gives a text; I name it back to you for UX-DESIGN.
2. **R34 against `ACT_HELP` (R54, R59)**: `mock-acts.js` at PR #33's head now holds texts for `drawquestion`, `projectbarset`, `monitorset`, `projectlist`, `projectquestions` (R54 expected none), and for `unlock`, `grouplanguagesset`, `grouplogoset`, `passwordreset`, `signrequest`, `statusreportassist`, `airundispatch`, `joindoors`, `clockproposals` (`passwordresetlink` as `owed_passwordresetlink`). `ACT_HELP` on my branch (affordances not yet merged) has none of them. Reading: R34 is read against `ACT_HELP` as affordances R54/R56 re-generates it, so I will re-pin `ACT_HELP_ABSENT` when you announce affordances' merge (a CHANGE); until then the ops with no text in the mock either (`sourceof`, `sourcerung`, `reauth`, `passwordresetlook`, `grouplanguages`, `signintrace`, `peopledirectory`) are named in `ACT_HELP_ABSENT`, and the rest are named there provisionally against today's `ACT_HELP`.
3. **R6 for R59's ops**: `grouplogoset`, `grouplanguagesset`, `grouplanguages` (instance-setup R84, R85) and `signrequest` (tasks R19) are served by no map on my branch; `signintrace` is signin-door R5's route. Reading: I declare them now, the totality test names each served by its L11 job until that job's map is merged, and I merge `tranche/T47` on your CHANGE after instance-setup and tasks merge, before COMPLETE.
4. **R58 `REAUTH_ACTS`' shape** (admission R25 reads it): a frozen map from op to `null` (every call asks the password again) or a frozen `{arg, is, orWas?}`: `memberset: {arg: "role", is: "admin", orWas: "admin"}` (to or from admin; "from" needs the target's current role, admission's to ask), `memberadd: {arg: "role", is: "admin"}`, `subscriptionsignin: {arg: "step", is: "start"}`; every other named op `null`. The detail is BOB's; tell me if admission's job wants another shape.

## J2 · REPORT

Found while testing the modules that use my services (P11), against their requirements. Each is a pin of the old tables, not a defect of theirs.

1. **control-plane** `test/m/control-plane/doorbell.test.mjs:79` (R2, N364) asserts that each N364 op is in both session sets "exactly when it writes". R56 puts the reads `sourceof` and `sourcerung` in both sets on purpose, so this red is new with my change. The test belongs to T47-65 to re-pin: the two reads are in both sets by R56.
2. **control-plane** R2, R41 (affordances R12, "unaccounted over the door's op table"): T47's new ops are unpublished until op-grades (T47-48) and affordances (T47-49) grade them and give them texts: `drawquestion`, `grouplanguagesset`, `grouplogoset`, `monitorset`, `passwordresetlink`, `peopledirectory`, `projectbarset`, `projectlist`, `projectquestions`, `reauth`, `reviewcomment`, and the rest of R55, R57, R59 and R61's ops. This red is new with my change too. It clears at those jobs' merges, as K3112's affordances R12 red does.
3. **Missing `modules.json` edges for R6's totality (BOB's to add, tests only).** No test of mine reads the maps of `citation` (`drawquestion`), `strength` (`projectbarset`), `monitoring` (`monitorset`) or `basis-versions` (`projectquestions`): this module does not use those four, and architecture refuses the imports. R6 for those four ops is therefore asserted only by their own spec tests. If you add the four edges, I will add their "served by the owner's map" arms in a CHANGE.
4. **credentials** `passwordresetlink` reads `member` from the body, else from the query (credentials/index.mjs:3410), where R57 says "`member` a body field". It is not a secret, so this is harmless. Noted for credentials' next job.
5. Unchanged inherited control-plane reds, the same before and after my change: R20 statementack ×3, R45 (`whatchangedpropose`), R64 ×2. control-plane's R53 (T33 ops have specs) went green with my change.
