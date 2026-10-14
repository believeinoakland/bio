# answer-envelope (T47)

**Status** · session_013osHE4dWKZtRLQMyZZYfNj · depth 2 · WORKING · handled B9

## J1 · QUESTION

Two readings of R16, each with what I am building meanwhile.

(1) "R6 binds `interfacePage` at `/` and `/app/*`." `interfacePage` is `interface-shell`'s (modules.json index 152, after this module at 148), so no file under my `tests` path may import it (architecture: only earlier, declared modules). My best reading: my test drives `withPagePolicy` over (a) the signer page (as now) and (b) a page shaped as `interface-shell` R2/R3 serves it (every script element carrying `NONCE_SLOT`, a module script, an inline style), served at `/` and at `/app/<screen>`, and finds R6's policy and nonces on each; the setup page leaves the R6 test's page list (no longer served), and the comment and R6's test title name `interfacePage` as the page at `/` and `/app/*`. The test over `interfacePage`'s real bytes is `control-plane` R82's (it serves `/` and imports both). Tell me if you want otherwise (e.g. a `uses` edge is impossible here, since the order runs the other way).

(2) "the door's row for `signintrace` off a test instance (`SIGNINTRACE_NOT_TEST`) joins `DISPATCH_CHECKS`." My best reading: `SIGNINTRACE_NOT_TEST`, check C-69.7 (the next free C-69 number; C-69.6 retired and never reused by R14), `where` `src/signin-door/index.mjs signintrace > is-signintrace-test-instance` (signin-door R5 raises it; signin-door's paths are still empty, so the file and region name are my reading, for SIGNIN-DOOR to match or BOB to correct), translation an interim sentence of this module's until `words.json` holds `refusal.SIGNINTRACE_NOT_TEST`, read by key from a module-local `DOOR_WORDS` (the pattern R14 removes for DISCLOSURE_DUE): "This group's Civicsmith keeps a trace of sign-ins only when it runs as a test instance, and this one does not. Nothing was read or changed." "Its order test" read as: R8's held-rows test names it, and R2's decoration of it is pinned. The row joins the row census red until T48's stamp (rule 5 (2)).

Also, beside R14/R15, I re-pin under R7's re-wording clause (DEC-199, `escalation` R36): C-116.14 `ALREADY_ATTACHED` and C-116.41 `ESCALATION_BY_ACT_ONLY` read their new words, changed.note naming them. That is my reading of the entry's "R8 re-taken from DEC-198/DEC-199, clearing its red".

## Completion (ANSWER-ENVELOPE #11)

**Entries applied (T47-54).**
- (N992; R14, DEC-198 (3), K3030) C-69.6 `DISCLOSURE_DUE` retired from `DISPATCH_CHECKS`, its number held by no code; the module-local `DOOR_WORDS` is gone (no longer exported from `checks.mjs` or `index.mjs`). The code's one row is `credentials`' C-29.40, its words `words.json`'s `refusal.DISCLOSURE_DUE`. Until `control-plane` answers through `credentials.disclosureDue` (T47-65), its door still mints the code through `dispatchRow("DISCLOSURE_DUE")` (`control-plane/index.mjs` :2035), so that reader answers this one retired code (`RETIRED_DISPATCH`) with the row R2 decorates it with (C-29.40), never a row of this table, and still throws for every other code it does not hold. Without that, the door would throw (`PLANE_INTERNAL_ERROR`) where R14 says it still refuses, decorated. Plan rule 5 (7b) (the family-order pins) and (7a) (the design-file red: words.json now holds the key) are cleared.
- (N992; R7's re-wording clause, DEC-199, `escalation` R36; BOB's B2) C-116.14 `ALREADY_ATTACHED` and C-116.41 `ESCALATION_BY_ACT_ONLY` re-pinned in `rows-before-r43.json` to their owner's rows (both equal `words.json`'s keys); `changed.note` gains one T47 sentence naming them, case-inputs' rows and C-69.6's retirement.
- (N908 §5; R15) `CHECK_FAMILY_FILES` reads `src/case-inputs/checks.mjs` directly after case-account's and before case-authoring's (88 files). The six pinned C-82 rows read their R7 pins; no C-136 row is pinned. `action-records` has no entry.
- (N1002, N1001; R16; BOB's B2) R6's page set is the signer page and `interfacePage` at `/` and `/app/*`; the setup page left the test's page list and the comments. `interfacePage` belongs to a later module, so the test drives a page in its R1–R3 shape; the test over its real bytes at `/` is `control-plane` R82's. C-69.7 `SIGNINTRACE_NOT_TEST` joins `DISPATCH_CHECKS`, `where` `src/signin-door/index.mjs signintrace > is-signintrace-test-instance` (SIGNIN-DOOR is to match it). Its interim words are inline in the row, not in a `DOOR_WORDS` as J1 said, because R14 removes that table; they go to the design stream (BOB's HANDOFF). The new row and C-69.6's retirement join the row census red until T48's stamp (rule 5 (2)).
- `setup-page` R28 citations in this module's code and tests re-pointed to `interface-shell` (R1, R2).

**Read (P20; mechanics §17).** I read whole: my requirements; my code (`index.mjs`, `checks.mjs`, `families.mjs`); my tests (`envelope`, `families`, `catalogue-end`, `page-policy`, `load.mjs`). The snapshot `rows-before-r43.json` is a data fixture: its note and changed blocks were read, and its rows searched. I read the sections of the sources my entry names: connect §3, way in §3, and fold §B (answer-envelope, interface-shell, control-plane, setup-page, signin-door) and §D. Of the used modules, I read the parts my change touches: `signin-door` (whole), `case-inputs` (Purpose, R12, R17, its family), `credentials` R64 and its C-29.40 row, and `escalation` R36 and its two rows. I did not read every used module's Purpose and spawned no helpers. The rest of the reading set is the 87 families' rows, which the tests walk mechanically. The later L11 users of my services were covered by running their tests (below). No flaw found in my own code beyond those fixed above.

**Found in other modules (REPORT J2).**
- `control-plane`: `test/m/control-plane/t46-door.test.mjs` R65 and the R32/R39/R46 wire-check test pin `DISCLOSURE_DUE` at C-69.6. They now read C-29.40 (two new reds). This is R14's intended effect; it is T47-65's to re-take, together with dropping the `dispatchRow("DISCLOSURE_DUE")` call (after which `RETIRED_DISPATCH` can go, in a later answer-envelope job).
- `promotion`: `src/gate.mjs`'s census comment names C-69.6 as a live row ("counted twice"); stale for the next stamp (T48).

**Tests and checks.**
- `node --test bio-plane/test/m/answer-envelope/`: tests 35, pass 35, fail 0.
- Users (P11), before → after my change: `control-plane` 235/7 fail → 233/9 fail (the two C-69.6 pins above; the other 7 were red before); `plane` 218/5 fail → 218/5 fail (unchanged); `store-door` 45/0 → 45/0.
- `checks/format.mjs`: 0 failures. `architecture.mjs bio answer-envelope`: 0 failures. `coverage.mjs bio answer-envelope`: 16 of 16 live ids named, 0 failures. `ownership.mjs bio answer-envelope tranche/T47`: 9 files, 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0 (3124 files), channels 0; coverage 24 failures, all other modules' unmerged T47 ids (rule 5 (1)), none of this module's.

Size (session_013osHE4dWKZtRLQMyZZYfNj): test runs 9, module lines 887

## J2 · REPORT

control-plane (T47-65): R14 opens two reds there, by design. (a) test/m/control-plane/t46-door.test.mjs R65 and the R32/R39/R46 wire-check test pin DISCLOSURE_DUE at C-69.6; the door now answers it decorated with credentials' C-29.40 and words.json's sentence. (b) control-plane/index.mjs :2035 still calls dispatchRow("DISCLOSURE_DUE"); answer-envelope's reader answers that one retired code with the C-29.40 row (RETIRED_DISPATCH) until T47-65 answers through credentials.disclosureDue, so the door keeps working. After T47-65 that branch can go in a later answer-envelope job. promotion (T48 stamp): src/gate.mjs's census comment still names C-69.6 as a live row. Before/after counts are in my record.

## J3 · COMPLETE

T47-54 done: R14 (C-69.6 retired; DISCLOSURE_DUE decorates with C-29.40), R15 (case-inputs' family before case-authoring's), R16 (interfacePage under R6; C-69.7 SIGNINTRACE_NOT_TEST as B2 confirmed), and the DEC-199 re-pins C-116.14, C-116.41. Rule 5 (7a) and (7b) are cleared. Module tests 35/35. Checks: format, architecture, coverage and ownership 0 failures; run.mjs architecture 0. Users: store-door and plane unchanged; control-plane +2 C-69.6 pins (J2). Record on job/T47/answer-envelope.

**B3 (CHANGE, K3148): re-run after merging `tranche/T47` (wizard-scripts T47-47, op-grades T47-48).** None of this module's files changed. `node --test bio-plane/test/m/answer-envelope/`: 35 pass, 0 fail. Users, `tranche/T47` alone → with this job: `store-door` 45/0 → 45/0; `plane` 217/6 → 217/6 (its sixth red came with the merge, not from this job); `control-plane` 234/8 → 232/10 (the same two C-69.6 pins, J2). Checks: format 0, architecture 0, coverage 16 of 16 (0), ownership 0. `run.mjs`: architecture 0 (3129 files), channels 0, coverage 23 failures, all other modules' unmerged T47 ids.

Size (session_013osHE4dWKZtRLQMyZZYfNj): test runs 14, module lines 887

## J4 · COMPLETE

B3: tranche/T47 merged (wizard-scripts, op-grades); re-ran. Module 35/35. Checks: format, architecture, coverage and ownership 0 failures; run.mjs architecture 0. Users, tranche alone → with this job: store-door 45/0 → 45/0; plane 217/6 → 217/6 (the sixth red came with the merge); control-plane 234/8 → 232/10 (the two C-69.6 pins of J2). Record updated.

**B4, B5 (CHANGE, K3149): re-run after merging `tranche/T47` (setup-words T47-52, instance-setup T47-75).** B5 was already met by R16's re-pointing: no file of this module imports `setupPage` or `setup-page`. The only `src/setup.mjs` import is instance-setup's refusal entries (`INSTANCE_SETUP_CHECKS`, R7). `node --test bio-plane/test/m/answer-envelope/`: 35 pass, 0 fail. Users, `tranche/T47` alone → with this job: `store-door` 45/0 → 45/0; `plane` 216/7 → 216/7; `control-plane` 234/8 → 232/10 (the two C-69.6 pins, J2). Checks: format 0, architecture 0, coverage 16 of 16 (0), ownership 0. `run.mjs`: architecture 0 (3131 files), channels 0, coverage 20 failures, all other modules' unmerged T47 ids.

Size (session_013osHE4dWKZtRLQMyZZYfNj): test runs 19, module lines 887

## J5 · COMPLETE

B4, B5: tranche/T47 merged (setup-words, instance-setup); re-ran. B5 was already met: page-policy.test.mjs dropped the setupPage import with R16 and drives interfacePage's shape; no file of this module imports setupPage. Module 35/35. Checks 0 failures; run.mjs architecture 0. Users, tranche alone → with this job: store-door 45/0 → 45/0; plane 216/7 → 216/7; control-plane 234/8 → 232/10 (J2's two C-69.6 pins).

**B6 (CHANGE, K3152): re-run after merging `tranche/T47` (adds notice-producers, installer, project-roster, affordances, tasks, op-declarations, admission).** `node --test bio-plane/test/m/answer-envelope/`: 35 pass, 0 fail. Users, `tranche/T47` alone → with this job: `store-door` 45/0 → 45/0; `plane` 216/7 → 216/7; `control-plane` 222/20 → 220/22. Comparing the failing test names (timings stripped), the only two added are J2's C-69.6 pins (R32/R39/R46 and R65); the other 20 fail on the tranche alone. Checks: format 0, architecture 0, coverage 16 of 16 (0), ownership 0. `run.mjs`: architecture 0 (3137 files), channels 0, coverage 16 failures, all other modules' unmerged T47 ids.

Size (session_013osHE4dWKZtRLQMyZZYfNj): test runs 24, module lines 887

## J6 · COMPLETE

B6: tranche/T47 merged; re-ran. Module 35/35. Checks 0 failures; run.mjs architecture 0. Users, tranche alone → with this job: store-door 45/0 → 45/0; plane 216/7 → 216/7; control-plane 222/20 → 220/22. Comparing failing test names, the only two added are J2's C-69.6 pins; the other 20 fail on the tranche alone.

**B7 (CHANGE, K3156, T47-94): R6's `img-src` admits `blob:`.** `PAGE_POLICY`'s `img-src` is `'self' data: blob:`; no other directive admits `blob:`. Test: a new page-policy test, "R6 (K3156; interface-shell R49)", checks every served page's `img-src` is exactly those three, `blob:` is in no other directive and no other origin appears. Its negative controls show the judge refuses `blob:` in `connect-src`, `default-src` or `script-src`, and a host or wildcard in `img-src`. The judge admits `blob:` for images only.

**B8, B9 (CHANGE, K3157, K3161): re-run after merging `tranche/T47` (adds action-producers, op-declarations again, queue).** `node --test bio-plane/test/m/answer-envelope/`: 36 pass, 0 fail. Users, `tranche/T47` alone → with this job, by failing test names (timings stripped):
- `store-door`: 0 → 0.
- `plane`: 7 → 7, none added.
- `interface-shell`: 0 → 0.
- `control-plane`: 20 → 26. Added: J2's two C-69.6 pins, and four tests whose own policy judges reject `blob:` in `img-src`, which amended R6 now requires (`page-policy.test.mjs` R51 ×3 at :16; `t46-app.test.mjs` R75 at :22). This is a REPORT for T47-65 (J7).

Checks: format 0, architecture 0, coverage 16 of 16 (0), ownership 0. `run.mjs`: architecture 0 (3139 files), channels 0, coverage 14 failures, all other modules' unmerged T47 ids.

Size (session_013osHE4dWKZtRLQMyZZYfNj): test runs 31, module lines 888
