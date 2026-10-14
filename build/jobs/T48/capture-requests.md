# capture-requests (T48)

**Status** · session_016oH6wXmETbYJSgystoYKuc · depth 2 · COMPLETE · handled B0

## Completion (CAPTURE-REQUESTS #19, session_016oH6wXmETbYJSgystoYKuc)

**Read (P20, mechanics §6 step 2; §17).** I read these whole myself: `build/requirements/capture-requests.md` (public and private), all of the module's code (`src/capture-requests/index.mjs`, `checks.mjs`, `schema.mjs`), and the two files the entry names (`plane.test.mjs`, `plane-world.mjs`). The reading set measured 959 KB at START, over the 600 KB limit. Two helpers in this session therefore read the rest whole and each wrote me a digest citing every section (K2032, mechanics §17 (3)):
- the first covered every other file in `test/m/capture-requests/`;
- the second covered the public parts (Purpose and Provides) of all 16 used modules, layer 6's contract in `build/layers.md`, and the sign-in, re-authentication and disclosure requirements the entry's test meets (credentials R66, R67, R71; ai-accounts R1, R23; instance-setup R54).

The sources stayed binding: I re-read each test I changed, and the code behind each step of the sign-in flow (`credentials` `reauth`, `setup.mjs` `disclosureShown` and `disclosureOf`), before relying on it.

**Entry applied (T48-32, N1052, test only).** `plane.test.mjs` now signs each enrolled member in by `{handle, password}` (credentials R67). At START all 6 tests failed in `world()`. With the sign-in fixed, the setup then met two later T47 rules on connecting Claude, which the test's `op=accountreferenceset` does:
- `REAUTH_DUE` (credentials R66, R71 (2)). The member's session now re-authenticates (`op=reauth`) just before connecting, as the provenance job's test does;
- `DISCLOSURE_DUE` (ai-accounts R1, R23; instance-setup R54). Her own session now records the disclosure first: `op=disclosureof` for the current version, then `op=disclosureshown`, and the test asserts that record is `shown: true`.

The test passes 6 of 6, and its K3192 reds clear. No assertion about this module changed.

**Flaws in my own module, fixed (P8).**
- **`op=capturerequestdrain` read the drain's clock from the request body** (`now`). An admin, probe or daemon caller could state an instant two days ahead and release every waiting request as `expired` (R20) in one tick. The door already refuses a body's clock (R6). No caller in the repository sends one; the scheduler states `now` in process. The op now passes no `now`. A new test in `drain.test.mjs` names R20 and R12. It showed red before the fix (`[1, 0, 'expired']`). Its control: the in-process caller's `now` still drives the drain.
- **`door.test.mjs`'s R3 test never asked an unseen inquiry.** Its "hidden" target was a project, refused as not an inquiry, and the setup lines retyping `PROJ-H-INQ` were dead. It now asks an inquiry in a project the viewer is not in. That is refused alike to an absent one, but for the id. The control: a member of that project may ask under it.
- **`t35.test.mjs`'s R49 "an unrecognised viewer holds nothing" passed for the wrong reason.** Its viewer could not see the run, so R1 answered first, and the test asserted only `ok: false`. It now uses a stamp that sees the run, and asserts `CAPTURE_REQUEST_ADDRESS_NOT_HELD`.
- `plane.test.mjs`' comment cited credentials R22 for the account reference; it now cites ai-accounts R1, where that requirement moved in T48.

**Deferred, with why.**
- R36's test (`retry.test.mjs`) checks three place names in answers, and R54's (`t35.test.mjs`) checks R54's eight named rows. Neither sweeps every member-facing string. Each meets its requirement as worded: R54 names its rows. A full text sweep is a larger change than this test-only entry, so I left it.

**For BOB: requirement text against the module (no code change made).**
- R12 says each item offered to the scheduler's rank is `{kind, id, waitingSince}`. The code and `drain.test.mjs` also offer `cadenceMs`, the cadence its next sentence says the rank uses. The requirement could name `cadenceMs`.
- R19 says "every code this module writes to a row is catalogued in C-28 or C-83". R40's `CAPTURE_SOURCE_REFUSED` is C-108.1, this module's own family (K181 (2)). R19 could say "C-28, C-83 or C-108".

**Found in other modules.** Nothing new. `m/scheduler/` fails the same 4 tests with and without my change (checked by putting the tranche's `index.mjs` back for one run). They are its inherited `{role}` sign-in reds, owned by T48-54.

**Tests and checks run.**
- `test/m/capture-requests/`: 123 pass, 0 fail (122 at START with plane.test's 6 red; one test added).
- Users of the changed op: link-sweep 29/29, intent 82/82, investigation 32/32, question-explorer 32/32. scheduler: 125/129, its 4 inherited reds as above.
- format: 0 failures. architecture (capture-requests): 0 failures. coverage (capture-requests): 56 of 56 live ids named, 0 failures. ownership (tranche/T48): 6 files, 0 failures.
- `run.mjs`: architecture 0 failures; coverage 37 failures, none capture-requests'; format 0; channels 0.
- No generated artifact is written. The plane bundle is staled by the `index.mjs` change (rule 5 (5)).

Size (session_016oH6wXmETbYJSgystoYKuc): test runs 16, module lines 2644
