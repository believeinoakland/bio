# admission (T34)

**Status** · session_01881r9vqe42oZehxYxDvLfc · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings; I carry on with each as stated and stop only if you answer otherwise.

(1) R17 and R19 at admission's interface. Today the door runs R1, then the agent credential's lookup (R6) and R2 for EVERY op, public ones included, so a confined `aik-` credential presented with `websiteinvite`/`joinlinkinvite` is looked up and can be refused `NAMESPACE_CONFINED` or have `store=scratch` set: the credential is used, which R17 forbids. My reading: a new admission export `queryGate(url, op)` (never refuses, returns null), called by the door right after R1 and before R6's lookup, which removes from the URL what an op may not take from the query: for the two doors the caller's `token` (so no lookup, no R2, no reader sees a caller) and `key`/`link`/`cover`; for `groupkeyset`, `key` (R19). The body fields are untouched (control-plane R54/R56 read them from the body). Control-plane's T34-60 then calls it in R28's order (R1, queryGate, R2, R3, ...); I will REPORT that as a wiring item for CONTROL-PLANE (its R28's order names admission's gates; it may want a word added there). Admission adds no limit (R17's cap is membership's).

(2) DEC-149's C-38.8 (`SESSION_ROUTE_NOT_RECORDED`, checks.mjs:111). Your START puts it with C-38.1 under "this group's Civicsmith" as answered to a caller with no session; but `sessionOpGate` raises it only to a signed-in session (a member or the founder), so by K1821 (2) it addresses a member. My reading: "your group's Civicsmith" for C-38.8 and C-38.3/.7-class rows; "this group's Civicsmith" only for C-38.1 (NOT_AUTHENTICATED). If you meant "this group's" for C-38.8 regardless, say so and I change one word.

Dependency: my R3/R17/R18/R19 tests read op-declarations' `OPS` specs for the T34 ops (R22, R24), which are not on `tranche/T34` yet (OP-DECLARATIONS #11 is running). I write them now against op-declarations R22/R24 as worded; they stay red on my branch until op-declarations merges, then I merge `tranche/T34` and post COMPLETE with them green. I will set WAITING ON BOB then; send a CHANGE when op-declarations has merged.

## J2 · QUESTION

R19 lists "an `ai` credential" among the callers "refused by R9 (`CLASS_FORBIDDEN`, their specs' `machineClasses` being empty)". But R10 (and op-declarations R2: no spec names `ai`, an agent is admitted by its task scope alone) answers every `ai` caller through its task scope: an op whose spec carries `machineClasses` is one no agent reaches (`aiReachesAsMember`), so the agent is refused `AI_BEYOND_TASK_SCOPE` (C-29.6), never `CLASS_FORBIDDEN`, and the scope cannot even be minted (C-29.9). Changing the code to `CLASS_FORBIDDEN` for `ai` would contradict R10 for every `machineClasses: []` op (ask, notices, docket, ...).
My reading, applied: R10 governs the `ai` credential; R19's binding classes (operator tokens, machine credentials) get `CLASS_FORBIDDEN` naming the class, and an `ai` credential gets `AI_BEYOND_TASK_SCOPE` (C-29.6), each before any store call, as my R19 test asserts. If you agree, R19's wording wants "an `ai` credential by R10 (`AI_BEYOND_TASK_SCOPE`)"; a requirement change is yours. Nothing waits on this: the code is unchanged by it.

## Completion

**Entries applied.** T34-59 (N552, DEC-133; K1541, K1749, K1755; B2, B3):
- R3: `SCRATCH_ADDRESSING_PUBLIC_OPS` gains `websiteinvite`, `joinlinkinvite` and `groupdescription`.
- R17, R19: new exports `queryGate(url, op)`, `PUBLIC_DOORS` and `BODY_ONLY_FIELDS`. The door calls `queryGate` after R1 and before R6's lookup (accepted in B2; CONTROL-PLANE told, K1861 (6)). It never refuses. For the two doors it removes the caller's `token` and the door's own body fields (`websiteinvite`: `key`, `cover`; `joinlinkinvite`: `link`, `cover`) from the URL. So no credential is looked up, no confinement (R2) applies, no reader sees a caller, and no secret stays in an address. For `groupkeyset` it removes `key` and keeps the session's token. Admission counts nothing; the cap stays membership's.
- R18: no code change. The administrator's acts are admitted as op-declarations R22's specs say, and `bearerFence` does not name them. Tested.
- R19: binding classes refused `CLASS_FORBIDDEN` naming the class; an `ai` credential refused `AI_BEYOND_TASK_SCOPE` by R10 (B3, K1863 (6)), each before any store call. None of the seven ops is on `AI_GRANT_OPS`.

T34-87 (DEC-149; K1811, K1821, B2): seven translations re-worded, nothing else changed. "this group's Civicsmith" in C-38.1. "your group's Civicsmith" in C-38.3, C-38.8, C-78.1 ("It has two" for "A copy has two") and C-29.8. C-32.17 and C-64.4 use ratification R47's "access tokens for your group's Civicsmith". The `index.mjs` details stay (operator- and agent-facing). These rows are awaiting stamp (T35's promotion job, accepted red 4): C-38.1 NOT_AUTHENTICATED, C-38.3 MACHINE_CREDENTIAL_REQUIRED, C-38.8 SESSION_ROUTE_NOT_RECORDED, C-78.1 NAMESPACE_UNKNOWN, C-29.8 AI_SCOPE_UNKNOWN_OP, C-32.17 OPERATOR_TOKEN_CANNOT_GOVERN, C-64.4 GROUP_IDENTITY_NEEDS_SESSION.

**Deferred.** None.

**Found in another module.** control-plane:
- Its door must call `queryGate` in R28's order. Until it does, R17 and R19 hold only at admission's interface, not at the live door. Already told, K1861 (6).
- `catalogue-end.test.mjs` pins the old translations of the seven rows above (`rows-before-r43.json`). That test is already red (K1789) and is re-pinned by T34-60; these seven join its re-pin.
- Its suite is 163/168 with my changes and 162/168 on `tranche/T34` without them. Every red is the tranche's own: affordances R2/R41, families R22, tasks R22, catalogue-end R43, wizard-scripts R50, plus R53 on the bare tranche only.

**Tests and checks.**
- `node --test bio-plane/test/m/admission/`: tests 23, pass 23, fail 0. No layer tests are named in the manifest.
- Users of admission: `node --test bio-plane/test/m/control-plane/`: tests 168, pass 163, fail 5, all red on the tranche as above.
- `row-census.test.mjs` is red under accepted red 4; my seven rows are listed above as awaiting stamp.
- `format`: 129 modules, 0 failures. `architecture`: 10 product files, 0 failures. `coverage`: 19 of 19 live ids, 0 failures. `ownership`: 7 files changed, 0 failures.

Size (session_01881r9vqe42oZehxYxDvLfc): test runs 9, module lines 882

## J3 · REPORT

For CONTROL-PLANE (T34-60): (1) the door calls admission's new `queryGate(url, op)` after R1 and before `aiCredentialPresented` (R28's order; K1861 (6)); without it R17/R19 hold only at admission's interface. (2) `catalogue-end.test.mjs` (`rows-before-r43.json`) pins the old translations of admission's seven DEC-149 rows: C-38.1, C-38.3, C-38.8, C-78.1, C-29.8, C-32.17, C-64.4. That test is already red (K1789); these join T34-60's re-pin. Its suite is otherwise unchanged by admission (163/168 with my branch, 162/168 on the tranche; every red is the tranche's own).

## J4 · COMPLETE

T34-59 and T34-87 applied (R3, R17, R18, R19 met; seven DEC-149 rows re-worded, awaiting stamp). Admission 23/23; format, architecture, coverage (19/19) and ownership 0 failures. Record: Completion section. Nothing deferred.
