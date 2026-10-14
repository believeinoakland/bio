# screens-intake (T47)

**Status** · session_01TRpt7rshZQFBNZdR8YRhWi · depth 2 · COMPLETE · handled B7

## Work (SCREENS-INTAKE #2)

Read whole for this job (P20): `build/requirements/screens-intake.md`; my code (`bio-plane/src/screens-intake/`, 848 lines at START) and tests (818 lines); the public parts of `interface-shell`, `setup-words`, `wizard-scripts` and `op-declarations`; the owners' lines my T47 ids name (`capture` R76–R81, R88; `monitoring` R74; `capture-requests` R56; `sources` R1, R6, R9; `acquisition` R41; `provenance` R24–R27, R51, R63; `wizard-scripts` R25, R34; `ratification` R51; `op-declarations` R56); the START's sources for my screens. No flaw found in the T46 code beyond what T47-59 replaces (the draft drawn into a field of a new id; the inbox's typed source ids; the set-aside list kept only for the visit).

Applied (T47-59):
- R10: the writing-help draft filled into `ci-words` by `cs.fill`, labelled `screen.capture.saw.draft` ("Draft · the assistant's, asked by {handle}", the session's handle), with `ai.label.untested` when the answer carries `untested`; the label leaves once `testify` keeps it. Each knock on `inbox` is `cs.ref("knock", …)`, its card the size, date and note.
- R11: `held` rows draw `capture.grade` as one mark (a determined letter as `cs.grade`; a stated letter "as a member stated it, not measured"; received and authored captures by their basis, no letter); `capture` null draws `state.undetermined`; the thumbnail is a `capture` reference opening `open-file` for `capture.sha256`.
- R12: a pulled knock's source through `sourceof` (its `capture_sha`), its rung through `sourcerung`, the ladder at that rung (a knock not yet pulled: "Same knocker" with a pseudonym, else "Unknown"); `sourcelink` sends the source read and `to` chosen from the other pulled knocks' sources (the same knocker's first, at most 20 knocks read), no field for a typed id.
- R13: `held` reads `heldcaptures` twice, held and `state: "set_aside"`; the "Set aside" list names who, why and when, with `heldrestore` in each row's panel and in its hold strip.
- R14, R16: "Watch this address" sends `monitorset` (`enabled: true`, the frequency chosen among `MONITOR_FREQ` but `none`, default weekly) alone; "Check it now" sends `monitor` alone; both on this visit's capture of the address, else the held document whose source is that address (`heldcaptures`), else refused beside the act, nothing sent. "Ask for this later" says when the request waits (`drains: false`).
- R15: new screen `archive` (`archive.mjs`) at `/app/archive/<sha>`: `archivelist` and `gradenote`; filed entries (with a `bundle`) as picked rows; already held, folders, links, not filed and waiting entries listed with their state; the hold strip's `archivelist` (only those not filed), `heldsetaside`, `release` (held's `sendRelease`); an archive refused whole as its refusal with "See what it lists".
- K3114: `held.test.mjs`' stand-in control re-stated for ratification R51 (body, else query; both ways; neither refused).

Tests: in a scratch checkout carrying stand-ins for the four unmerged providers (J1), `node --test test/m/screens-intake/`: 57 pass, 0 fail. On this branch as it stands: 1 pass, 56 fail, every one from `interfacePage` refusing `capture` until `OPS` holds `monitorset` (expected; J1). Checks on the working tree: format 0 failures; architecture 0 failures; coverage 16 of 16 ids named, 0 failures; ownership 0 failures.
B2 (K3148): `tranche/T47` merged (c9dea8a628; wizard-scripts T47-47, op-grades T47-48): the registry now lists `monitorset` on `capture`, so the wizard-scripts stand-in is dropped; with the other three stand-ins, 57 pass, 0 fail. On this branch still red until `op-declarations` declares `monitorset`.
B3 (K3149): `tranche/T47` merged (2e591e7dc6; setup-words T47-52, instance-setup T47-75): the setup-words stand-in dropped. Two of my own lines followed `WORD_ROWS` at 6f0d88d8d5: the upload act's label key is now `act.captureupload.label.capture` (the registry names `captureupload`; `act.capture.label.capture` is gone), and R14's refusal test now expects the code's `refusal.<code>` word where `WORD_ROWS` holds one (`MONITOR_SET_REFUSED` now does; interface-shell R13's order), else the answer's words. With the op-declarations and interface-shell stand-ins: 57 pass, 0 fail.
B4 (K3152), B5 (K3153): `tranche/T47` merged (b1f9ec7269, op-declarations among it): on this branch 54 pass, 3 fail, the three R10 tests that need interface-shell's `cs.fill` and the `knock` kind. With `job/T47/interface-shell` merged on top in the scratch checkout and no stand-in left: 57 pass, 0 fail. Tests brought to the shell's harness as built (B5): R9's request list leaves out the shell's `bootstrap`; its storage control admits the session record in local storage (`bio-session`, `bio-session:active`); R10's knock card is checked against `SHELL_WORDS`' `shell.card.knock`, not words of my own.
B6 (K3157): `tranche/T47` merged (b9032fc3c8): on this branch 54 pass, 3 fail (the same three R10 tests); with `job/T47/interface-shell` at f8251c4926 (its J5 COMPLETE) on top in the scratch checkout: 57 pass, 0 fail.
B7 (K3165): `tranche/T47` merged (2d6895cb50, interface-shell among it). No overlay left; the scratch checkout is retired. Tightened what I held for this merge: R9's storage control now asks the session record in local storage and session storage empty (interface-shell R32, R33), no longer either form.

## Completion

- Entries applied: T47-59 whole (R10–R16; K3114's control re-stated for ratification R51). Nothing deferred.
- Bounds chosen (mine, not in a requirement): R12 reads `sourceof` for at most 20 other pulled knocks (the same knocker's first, then the latest), so a long inbox does not fan out a read per knock; R14's frequency offers `MONITOR_FREQ` but `none`, weekly by default.
- Found in other modules: `control-plane` `t46-app.test.mjs` R75 fails on `img-src` ('self', data:, blob:) on `tranche/T47` itself (caac922b0f) as on my branch: the page policy it pins differs from the one now served; not mine, control-plane's job (T47-65) or answer-envelope's. No generated artifact of another module staled by me (the plane bundle and `program.mjs` are rule 5 (4)'s).
- Tests: `node --test bio-plane/test/m/screens-intake/` → tests 57, pass 57, fail 0. User module `control-plane`: `t46-app.test.mjs` (the only test naming my screens) → 3 pass, 1 fail, the R75 red above, identical on `tranche/T47`.
- Checks (`civicos-process` @ its main): `node checks/run.mjs /home/user/bio` → format 0 failures; architecture 0 failures; channels 0 failures; coverage 12 failures, none mine (other L11 modules' not-yet-met ids, rule 5 (1)). Per module: `coverage.mjs … screens-intake` 16 of 16 ids named, 0 failures; `architecture.mjs … screens-intake` 0 failures; `ownership.mjs … screens-intake tranche/T47` 12 files, 0 failures; `format.mjs` 0 failures.
- B8 (K3171; JOURNEY-CHECK #1 J4 (1)): `tranche/T47` merged (control-plane among it). R3's `doneTestify` read `answer.id || answer.bundleId`, which provenance's `testify` never answers (`{ok, bundle_id, bundle_sha, capture_sha, file, …}`), so "Recorded as your testimony: {id}" was never drawn; it now reads `bundle_id`. The R3 tests' plane stand-ins now answer provenance's shape, and a new test (R3, K3171) checks the sentence names `bundle_id` (control: an answer naming no bundle draws no id). Tests 58 pass, 0 fail; control-plane `t46-app.test.mjs` 5 pass, 0 fail (its R75 red is gone with control-plane's merge); format, architecture, coverage (16 of 16), ownership 0 failures.
- Size (session_01TRpt7rshZQFBNZdR8YRhWi): test runs 27, module lines 1164

## J1 · REPORT

Read whole: my requirements, my code and tests (1,666 lines), the public parts of my Uses, the START's sources (registry, mock-acts, mock-screens' capture/held/archive/inbox, words.json rows I draw, the interface draft, fold §B, way-in rows naming me, connect §3). Baseline on my branch: 42 pass, 0 fail.

T47-59 leans on four L11 providers not yet merged into `tranche/T47` (each still WORKING at this report):
1. `op-declarations` (T47-53): `monitorset` in `OPS` and `SESSION_OPS.member`; `sourceof` and `sourcerung` in `SESSION_OPS.member` (its R56).
2. `wizard-scripts`: `SCREEN_REGISTRY`'s `capture` listing `monitorset` (DEC-200 (2)); `interfacePage` refuses my screen until it does.
3. `setup-words` (R7): `act.monitorset.label.capture` and `act.monitor.label.capture` "Check it now".
4. `interface-shell` (R27, R28/R38): `cs.fill`; the `knock` reference kind; `archive`'s path (Add › Held captures › Archive); `capture`'s re-point retired.
My reading: I build to their requirements now and prove my screens in a scratch checkout carrying stand-ins for those four (never committed). My suite on the real page stays red on my branch until they merge. On your CHANGE announcing those merges I merge `tranche/T47`, run my tests and the checks, and post COMPLETE. Dependent reads (`sourceof` then `sourcerung`; the earlier knocks' `sourceof`) follow `screens-inquiry`'s merged pattern: `cs.call` from render, memoised in `ui`.
Reading R16 over R14: "Watch this address" sends `monitorset` alone and "Check it now" sends `monitor` alone (R16 amends R14's "then `monitor`").

## J2 · COMPLETE

T47-59 complete on `job/T47/screens-intake` (tranche/T47 merged at 2d6895cb50; B2–B7 handled). R10–R16 met; K3114's control re-stated for ratification R51; nothing deferred.
Tests: screens-intake 57 pass, 0 fail, no overlay. Checks: run.mjs format/architecture/channels 0 failures; coverage 16 of 16 for screens-intake (12 product failures, all other modules' not-yet-met ids); ownership 0 failures.
For you: control-plane `t46-app.test.mjs` R75 fails on `img-src` on `tranche/T47` itself (caac922b0f) and on my branch alike, not mine (control-plane T47-65 or answer-envelope).
Record's Completion has the bounds I chose (R12: at most 20 earlier knocks read; R14: weekly by default) and the size line.
