# admission (T41)

**Status** · session_01XRFXxX3r77uSXKpEg4sgCD · depth 2 · WAITING ON BOB (J1) · handled B1


## Record

**Reading set (mechanics §17, §3).** Measured at this job's start: my requirements whole (25.0 KB); each used module's Purpose and the services my Uses names (op-declarations Terms, R2, R3, R6, R22, R24, R41, R42; runtime-limits `liveToken`, R9–R12; credentials R5, R15, R28, R33, R38, R42, R44, R50; capture R56; membership R15, R16, R97, R101, R104, R105, R123; record-grammar's and record-core's Purpose): 22.5 KB; layer 11's row and its control-plane split section in `build/layers.md` (~2 KB); K2394, K2484, K2507 (~6 KB); my code (`bio-plane/src/admission/`, 96.0 KB) and tests (`bio-plane/test/m/admission/`, 131.6 KB). About 283 KB, at most 300: **read whole by me**, no worker summary.

**Entry T41-59** (was T40-18a; N797, K2394; DEC-188 (8)), applied on `8d7e628814`:
- R3: `handlecheck` added to `SCRATCH_ADDRESSING_PUBLIC_OPS` (`index.mjs`), so `store=scratch` reaches it; every other public op stays pinned (the unlisted default is the refusal).
- R22: `op=handlecheck` answered `NO_SUCH_INVITATION` counted as kind `credential` (`CREDENTIAL_REFUSED_AT`), as `invitelook`'s; its own `HANDLE_CHECK_PAUSED` is membership's and not counted.
- R19: no code named `groupswitchset` (R19 is read from op-declarations' table); `doors.test.mjs`:12's `GROUP_KEY_OPS` re-stated without it.
- Tests: new `t41.test.mjs` (R3, R19, R22, each with negative controls); `namespaces.test.mjs` R3's list gains `handlecheck`.

**Tests (on `tranche/T41` as it stands):** `node --test test/m/admission/`: 40 tests, 37 pass, 3 fail, each only because op-declarations' T41 declarations are not merged yet (J1): R3 (`namespaces.test.mjs`) and R3 (T41) find no `OPS.handlecheck`; R19 (T41) finds `groupswitchset` still declared and no `accountusesset`. With op-declarations' R24/R41/R42 simulated locally (not committed): 40 of 40 pass; with my code change then reverted, R3, R3 (T41) and R22 (T41) fail (the tests tell the change apart).

**Checks:** format 0 failures; architecture 0; coverage 22 of 22 live ids named, 0; ownership 0.

**Found elsewhere (for BOB):** op-declarations R42 says `handlecheck`'s `invite` and `handle` are read from the body only, citing admission R20; R20 governs only `token` and `secret`, and admission's `queryGate` removes body-only fields from the query only for the doors and `groupkeyset` (R17, R19). Nothing in my requirements asks it for `handlecheck`, so I added nothing; whose site enforces "body only" for `invite` (control-plane's relay or membership's handler) is a question for BOB, not a change I make unasked.

**Uses (final):** unchanged: record-grammar, runtime-limits, membership, op-declarations, credentials, capture, record-core.

**Next:** after BOB's answer to J1 / the CHANGE that brings op-declarations' merge, merge `tranche/T41`, re-run the tests and checks, complete.

## J1 · QUESTION

Q1 (testing against op-declarations' T41 declarations, not yet merged). `OPS` on `tranche/T41` still declares `groupswitchset` and declares neither `handlecheck` nor `accountusesset` (op-declarations R24, R41, R42, T41-58, its job still WORKING). My best reading, which I am building on now: admission is later in the order than op-declarations, so I write R3's, R19's and R22's tests against the real `OPS` with no stand-ins (K2507's stand-ins are for jobs earlier in the order): R3 finds `handlecheck` declared public and in `SCRATCH_ADDRESSING_PUBLIC_OPS`; R19 finds no `groupswitchset` spec (so `aiScopeDeclaration` refuses it `AI_SCOPE_UNKNOWN_OP`) and `accountusesset` session-only (`machineClasses: []`, refused `CLASS_FORBIDDEN` to every binding class). Those arms are red on `tranche/T41` until T41-58 merges; the code change itself (`handlecheck` in the scratch-addressing list, its `NO_SUCH_INVITATION` counted) does not depend on it. I will verify them green against `job/T41/op-declarations` once its job completes, and post COMPLETE after your CHANGE brings its merge, unless you prefer COMPLETE now with those arms listed as red until T41-58.

## J2 · REPORT

R1 (another module's requirement, no change made). op-declarations R42 says `handlecheck`'s `invite` and `handle` are read from the body only, citing admission R20; R20 governs only `token` and `secret`, and admission's `queryGate` strips body-only fields from the query only for the doors and `groupkeyset` (R17, R19). My requirements ask nothing of it for `handlecheck`, so I added nothing. If admission is to be that site (adding `handlecheck: ["invite", "handle"]` to `BODY_ONLY_FIELDS`, a query invitation then answered `NO_SUCH_INVITATION` as R17's doors answer a missing key), that is an amendment to admission R3 or R20 for you; otherwise it is control-plane's relay or membership's handler. Progress: T41-59 applied on `8d7e628814`; 37 of 40 tests green on `tranche/T41`, the 3 red waiting only on op-declarations' merge (J1); all four checks 0.
