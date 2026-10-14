# op-declarations (T47)

**Status** · session_013zNbUpqqR8G8FJUPnd2dkD · depth 2 · COMPLETE · handled B3

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

## J3 · COMPLETE

COMPLETE at 282dad4bc5 (job/T47/op-declarations, tranche/T47 merged at 117542b2df).

**Entries applied (T47-53):**
- K3041: `statementack`, `reviewcomment`, `publishpreflight` and `publishtensions` are in both session sets (`PUBLISH_SCREEN_OPS`, internal). Their specs and stamps are unchanged. The two doors have present null NEEDS rows (R3's totality). `ACT_GATE.mode` now answers `session` for all four.
- R54, R60: R21 and R27 are re-pinned at PR #33's head, clearing the eight DEC-198/DEC-199 reds:
  - the registry has 89 function acts (67 distinct), each an op or an alias;
  - every `declared` act has a spec (a new test);
  - the one owed act, `owed:passwordresetlink DEC-201`, is declared by R57;
  - the acts once owed are all declared acts now;
  - `hostingaccessset` is on `setup` and `group`;
  - the library marks nothing owed.
  The old tests in t34, t37 and t46 carry "(R54, R60, T47)" clauses.
- R55:
  - `projectlist` (project-roster's family) and `projectquestions` (a new basis-versions family): reads.
  - `drawquestion`: cite's spec, in EDGE_ACTIONS and POSITIONAL_ACTS.
  - `projectbarset`: in DECLARATION_ACTIONS, `machineClasses: []`, `contribute`.
  - `monitorset`: in MONITORING_ACTIONS, `machineClasses: []`, `contribute`.
  - `heldcaptures` and `capturerequest` are unchanged (tested).
- R56: `sourceof` and `sourcerung` are in both session sets, specs unchanged.
- R57: `unlock` and `reauth` are kind `sessionend`, stamped `session`, `source` and `country`; `passwordresetlink` is `admin`; `passwordresetlook` is `public` and `passwordreset` is `door`, both stamped `source` and `country`. All five are in credentials' family. This clears R19/R30's two reds.
- R58, R62, R63: `REAUTH_ACTS` (in t47.mjs, exported by index.mjs) is `op → null | {field, values}`, with the rows as R63 gives them.
- R59:
  - `grouplogoset` and `grouplanguagesset`: `admin`, in instance-setup's family.
  - `grouplanguages`: `public`.
  - `signrequest`: `member`, in tasks' family.
  - `signintrace`: `ownread`, in a new signin-door family.
- R61: `peopledirectory` is an ownread in people's family. This clears R49/R6's people red.
- R6, R62, R63: the store-internal routes `reauthdue`, signin-door's five and `grouplogo` have no spec and are in no table (tested). `publishedlist` is public.
- R34: ACT_HELP_ABSENT names the reads `sourceof`, `sourcerung`, `projectlist`, `projectquestions`, `peopledirectory` and `signintrace`. It names the acts `drawquestion`, `projectbarset`, `monitorset`, `unlock`, `reauth`, `passwordresetlink`, `grouplogoset`, `grouplanguagesset` and `signrequest` under the last ground. This is read against ACT_HELP as it stands before T47-49; I re-pin it on your CHANGE after affordances merges (K3144 (2)).
- T47's ops live in a new `src/op-declarations/t47.mjs` (data only, inside my paths). The family shares and families are merged by `family()`, as t45.mjs's and t46.mjs's are.

**Waiting on L11 merges (K3144 (3)):**
- The totality test lists `grouplogoset`, `grouplanguagesset` and `grouplanguages` as served by instance-setup (T47-75), and `signrequest` as served by tasks (T47-89). Each must leave that list when its owner's map merges.
- The R34 lists must be re-pinned after affordances (T47-49).
- I merge `tranche/T47` on your CHANGE.

**Read:**
- Read whole: my requirements, my code (index.mjs, t45.mjs, t46.mjs), the plan entry, the drafts' named sections, and the test files I changed.
- Two helpers read in full and wrote digests citing sections:
  - all eighteen test files, with the cause of each red;
  - the owners' requirements and ops-map arms for every new op (credentials R63–R71, people R37, project-roster R26, basis-versions R50, citation R14, strength R40, monitoring R74, capture R88, capture-requests R56, sources R1 and R9, instance-setup R84 and R85, tasks R19, signin-door R5, and ACT_HELP and mock-acts.js).

**Flaws in my own module:**
- Fixed: t35's credentials control had a clause that was always true.
- Noted, not changed:
  - t37:198 asserts on its own source text. That is R39's "the comment goes", which no behaviour can show.
  - Several older negative controls are weak (they add a fake name to a filter).
  - The titles of the PR #14, #15 and #28 tests now carry T47 clauses.

**Found in other modules:** J2.

**Tests:** `node --test bio-plane/test/m/op-declarations/`: 169 tests, 169 pass, 0 fail (12 inherited reds cleared). Users of my services, run before and after the change (P11):
- admission 43/43; interface-shell 63/63; screens-settings 51/51; screens-intake 42/42; screens-daily 45/45.
- screens-inquiry: 1 fail, the same before (K3141).
- plane: 5 fail, the same before.
- control-plane: 8 fail, against 7 before. R53 turned green; the two new reds are J2 (1) and (2).

**Checks (process repository):**
- format: 0 failures.
- architecture op-declarations: 23 files, 0 failures.
- coverage op-declarations: 60 of 60 (after BOB's R62 and R63, all ids named).
- ownership tranche/T47: 0 failures.
- checks/run.mjs over the product: format 0, architecture 0 (3126 files), channels 0. Coverage has 25 failures, none of them op-declarations' (rule 5 (1)).

Size (session_013zNbUpqqR8G8FJUPnd2dkD): test runs 16, module lines 3760
