# control-plane (T36)

**Status** · session_014Cxwr3sUfHWE5sRvShuypv · depth 2 · WORKING · handled B2

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
