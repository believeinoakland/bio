# control-plane (T36)

**Status** · session_014Cxwr3sUfHWE5sRvShuypv · depth 2 · WAITING ON BOB (J4) · handled B5

## J1 · QUESTION

Three questions, each with my best reading; I carry on with the rest on these readings.

(1) **Byte answers cannot cross the store's door today.** `file-safety`'s map answers `openoriginal`, `openwithwarning`, `safeview` and `safecopy` with a `Response` (bytes; K2098 reading 2), but `store-door`'s `dispatch` wraps every map answer as `Response.json({ok: true, result: await map[op]()})` (`store-door/dispatch.mjs`:305), so a `Response` serialises to `{}` and no bytes reach the Worker. My side (R61): the door forwards each of the four to the store's route of its own name (as `declarations.test.mjs`:40 expects) and relays a non-JSON answer as given (bytes, content type, length, `x-capture-sha256` / `x-derived-sha256`), adding `cache-control: no-store`; a JSON refusal goes through the envelope. **Best reading:** the store's half is one line in `store-door` (T36-48): a map answer that is a `Response` is returned as is (`if (a instanceof Response) return a;`), or plane's if BOB places it there. I change neither file (P7). Please route it to STORE-DOOR #2 (or PLANE #25), or tell me another path.

(2) **The name of admission's address gate (R59, R28).** T36-36 has not merged. **Best reading:** admission exports a gate in its usual shape (`null` or `{status, body}`), and I call it directly after `namespaceGate` (admission R1), before `queryGate`, `aiCredentialPresented` and everything else. Until I know its name, I call `presentedCredential(...).inAddress` and refuse with admission's own refusal builder if it has one. Please give me the export's name once ADMISSION #6 fixes it (e.g. `credentialAddressGate(url)`).

(3) **R62's `warned` on `op=capture`'s GET.** A GET carries no body, and `file-safety`'s map reads `warned` from the body only. **Best reading:** for a member's or an `ai` credential's GET of `op=capture`, a query `warned` holding the JSON object (`warned={"own_device":true,"no_macros":true}`) routes to the store's `openwithwarning` with `{warned}` in an internal POST body; any other `warned` value is passed as given, and `file-safety` answers `WARNING_NOT_CONFIRMED`. Without `warned`, the request routes to `openoriginal`. The store's request carries `capture` (the GET's `sha256`) and the stamped `viewer` only. The binding classes keep `captureObjectOp`'s own answer. All of this sits in `control-plane/index.mjs`, so `plane/door.mjs` is not touched.

## J2 · REPORT

Progress, and what I wait on. The tranche branch is merged (b9ca24cd81), and the change is pushed on `job/T36/control-plane`.

**Built (all of T36-37's entry):**
- R59/R28: admission's `credentialAddressGate(url)` runs directly after `namespaceGate`, both at the op door and before the page's read at `/`. `deprecated` is gone everywhere: the `outOfAddress` wrapper is now tally-only, and `reviewAnswer` no longer takes the extra.
- R41: `op=agentpack` alone serves `{fences, pack | pack: null + pack_absent}`. The untargeted `op=affordances` answer is relayed as the handler gives it. `heldPack` (R57) reads `agentpack`'s pack. The ask grant's own ops are now exactly agent-worker's `ASK_PLANE_OPS`, so `affordances` is no longer admitted under a grant (K2135).
- R53/R63: `assistantset` and `securitycount` are answered as ops with no spec, whatever `OPS` holds.
- R61: file-safety's ops reach the store's route of their own name. The four byte ops relay a non-JSON 200/206 answer as given, adding `cache-control: no-store`; a JSON answer is enveloped. `openwithwarning` carries a GET's query `warned` into the body. `securitytooladd`'s `credentials` and `config` are dropped from the store's address.
- R62: a session's or an `ai` credential's `op=capture` GET goes to the store's `openoriginal` (or `openwithwarning`) with only `capture` and `viewer`. The binding classes keep capture's hook.
- K2146: the forward strips `secretSha` and `bySecret` from caller bodies.
- R60, R29: standards' body author is now derived from `OP_FAMILIES` (`BODY_ACTOR`).

**A flaw found in my module and fixed (P8):** standards' T35 acts (`standardforce`, `standardforcewithdraw`, `standardrelease`, `standardadoption`, `standardimpose`, `standardbenchmark`, `standardforcepropose`) reached standards with `author` (or `proposer`) only in the query. Standards' map reads these from the body (`standards/index.mjs`:2570–2583, family `actor: BODY("author")`). So every member's act would have been refused `MACHINE_CANNOT_DECLARE_STANDARD`. The new door suite now covers every act of the family.

**Tests:** 166 pass and 12 fail, all on prerequisites:
- op-declarations' R31–R33 specs and its `assistantset` removal: reds 22 and 23's loop, the R53 stamps sweep, `declarations.test.mjs`:40, and my R60, R61 and R63 tests;
- the totality test (`totality.test.mjs`:20). This one is a tranche-state red: affordances (merged) ranks the T36 ops before op-declarations declares them;
- admission's gate: four R59 tests, including red 26's address arm.

R62's suite passes now. The byte relay is proven at the Worker; the store side waits on store-door R13.

**After the merges I expect to re-pin:** every test of mine that uses `env.MEMBER_TOKEN`, which admission R5 retires (a binding of my own suites' callers); and `envelope.test.mjs`:363 (`caseReader` over a URL `token=` with no credential).

**Checks:** format 0, architecture 0, coverage 36/36, ownership 0. P6: 3,102 lines (+77).

I wait for op-declarations', admission's and store-door's merges, then merge the tranche branch when you say so.

## Completion (T36-37)

**Reading (mechanics §17).** The set measured over 300 KB (the module's 230 KB of code plus 419 KB of tests alone), so read under (3):
- Read whole myself: `build/requirements/control-plane.md`; the plan's T36-37 entry and rules at the opening; K2111, K2126, K2129, K2130, K2135, K2146 and K2152, and the drafts' control-plane sections with BOB's reviews; `src/control-plane/index.mjs`; admission R20, R22 and `presentedCredential`/`queryGate`; `file-safety`'s Purpose, R8–R11, R33, R34 and `fileSafetyOps`; `capture/ops.mjs`; `plane/door.mjs`; `store-door/dispatch.mjs`:180–310; op-declarations R17 and R30–R33 with its `OP_STAMPS` and families; the standards, calculations and credentials map arms the new ops reach.
- Tests read whole myself: `harness.mjs`, `r53-routes`, `members-pin`, `affordances-pack`, `converts` and `t35-door`.
- Two workers read the other 29 test files in full and wrote summaries (about 2,500 words each, every statement citing file:line). Their findings:
  - No other test puts a credential in an address.
  - The sweeps that pick up new ops are `declarations.test.mjs`:23–40, `totality.test.mjs`:20 and `envelope.test.mjs`:17–34.
  - `envelope.test.mjs`:363 calls `caseReader` over a URL `token=`.
  - `t34-routes.test.mjs`:209, :239 call `assistantSet`.

  Nothing they left out mattered: the gaps the full run surfaced were all ones they had named.
- `archive.mjs` and `draft.mjs` are unchanged and were not reread.
- R41 (K2087): `draft.test.mjs` reads the pack only through `heldPack`. I found no other reader of the untargeted answer's `pack` or `fences`.

**Entries applied (T36-37):**
- R59, R28: admission's `credentialAddressGate(url)` (B2, K2157) runs directly after `namespaceGate`, at the op door and before the `/` page's read. No `deprecated` remains: `outOfAddress` became `tallyOnTheWayOut`, and `reviewAnswer` no longer takes the extra.
- R41: `op=agentpack` alone serves `{fences, pack}` (`packOf`). The untargeted `op=affordances` answer is relayed as given. `heldPack` (R57) reads through `packOf`. The grant's own ops are now exactly `ASK_PLANE_OPS`, so `affordances` is no longer a grant call (K2135).
- R53, R63: `assistantset` and `securitycount` are in `NOT_ROUTED` and are answered `UNKNOWN_OP`.
- R60: routed generically. The in-force-through acts carry `author` in the body through `BODY_ACTOR`, derived from `OP_FAMILIES`.
- R61: the 23 file-safety ops reach the store's route of their own name.
  - `BYTE_OPS` go through `byteAnswer`: a non-JSON 200/206 answer is relayed as given with `cache-control: no-store` (and CORS); JSON is enveloped.
  - `openwithwarning` carries a GET's query `warned` into the body (B2 (3)).
  - `securitytooladd`'s `credentials` and `config` are dropped from the address.
- R62: a session's or an `ai` credential's `op=capture` GET goes to `openoriginal` (or `openwithwarning`) with only `capture` and `viewer`. The binding classes keep capture's hook. No change to `plane/door.mjs`.
- K2146: the forward strips `secretSha` and `bySecret` from caller bodies.
- Reds 22, 23, 24 and 26 re-pinned (`r53-routes`, `members-pin`, `converts`). `t35-door` re-pinned to the refusal form. Red 32's `t34-routes` tests re-pointed to `credentials.aiKeepAwaySet` (B3, K2162).
- New suite: `t36-door.test.mjs`.

**A flaw in my own module, fixed (P8):** standards' T35 acts and proposals reached standards with their `author` or `proposer` only in the query, where standards' map does not read it (family `actor: BODY("author")`), so every member's act would have been refused `MACHINE_CANNOT_DECLARE_STANDARD`. They are now stamped in the body through `BODY_ACTOR`; the new suite drives every act of the family.

**Deferred:**
- The guard around `admission.credentialAddressGate` (`typeof … === "function"`) stays until ADMISSION #6 is merged into this branch, then is dropped.
- These tests stay red until op-declarations' merge (T36-35: the R31–R33 specs, `assistantset` removed): `declarations.test.mjs`:40, `totality.test.mjs`:20, `r53-routes.test.mjs`:70 (red 22) and :83, and `t36-door`'s R60/R63, the two R61 routing tests, and the R61 byte test.
- These stay red until admission's merge (T36-36): `t35-door`'s two R59 tests, `t36-door`'s R59/R28 test, and `converts.test.mjs`'s address arm (red 26).
- After admission's merge I expect to re-pin my suites' `env.MEMBER_TOKEN` callers (admission R5) and `envelope.test.mjs`:363.

**Found in other modules (reported in J1, J2):**
- `store-door`'s `dispatch` wrapped a map's `Response` as JSON (`dispatch.mjs`:305), so no byte answer reached the Worker. Routed as store-door R13 (K2157).
- `totality.test.mjs`:20 is red in the tranche state: affordances (merged) ranks T36's ops before op-declarations declares them.

**Tests and checks:**
- `node --test bio-plane/test/m/control-plane/`: 178 tests, 166 pass, 12 fail, every failure on a prerequisite named above.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs` control-plane: 0 failures.
- `checks/coverage.mjs` control-plane: 36 of 36 ids, 0 failures.
- `checks/ownership.mjs` control-plane `tranche/T36`: 0 failures.
- P6: 3,102 lines (+77).


**B4 (op-declarations merged, K2165):** the tranche branch is merged again (aec90d5cc6) and the suite re-run: 174 pass, 4 fail. The four failures are the admission-dependent R59 arms: `t35-door`'s two tests, `t36-door`'s R59/R28 test, and `converts`' address arm (red 26). Two fixes came out of the re-run:
- **The door's rule for a byte answer was too loose.** A byte answer is now one at 200/206 carrying its owner's digest header (`x-capture-sha256` or `x-derived-sha256`), not one whose content type is not JSON. A file's own type may be JSON or text, and the envelope sweep (`envelope.test.mjs` R21) found a JSON answer that carried no content type relayed raw.
- **My tests predicted who each op admits.** They now take admission's answer and require every op to reach its route for some caller.

Size (session_014Cxwr3sUfHWE5sRvShuypv): test runs 19, module lines 3103

## J3 · COMPLETE

B3 applied: the tranche branch is merged (d70c455390), and t34-routes' two R57 tests are re-pointed to credentials.aiKeepAwaySet (red 32 is mine and passes). The completion record is in my record. 166/178 pass. The 12 reds wait on op-declarations (T36-35) and admission (T36-36), each named in the record. Checks: format, architecture and ownership 0 failures; coverage 36/36. After those two merges, and when you say so, I merge the tranche branch again, drop the guard around credentialAddressGate, and re-pin the MEMBER_TOKEN callers.

## J4 · REPORT

B4 applied. I merged the tranche branch (aec90d5cc6) and re-ran the suite: 174 of 178 pass. The 4 failures are the R59 tests that need admission's gate: t35-door's two, t36-door's R59/R28, and converts' address arm (red 26). Reds 22, 23 and 24 are cleared, and so are the totality and declarations sweeps.

The re-run surfaced two fixes:
- My door's rule for a byte answer was too loose. It is now: status 200 or 206 with the owner's digest header (x-capture-sha256 or x-derived-sha256). Before, it was any non-JSON content type, and the R21 envelope sweep found a header-less JSON answer passed through raw.
- My R60, R61 and R63 tests now take admission's answer for each caller instead of predicting it.

Checks: format, architecture and ownership 0 failures; coverage 36/36. Size: 3,103 lines. After admission's merge I will merge again, drop the guard and re-pin the MEMBER_TOKEN callers.
