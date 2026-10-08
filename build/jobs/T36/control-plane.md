# control-plane (T36)

**Status** · session_014Cxwr3sUfHWE5sRvShuypv · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three questions, each with my best reading; I carry on with the rest on these readings.

(1) **Byte answers cannot cross the store's door today.** `file-safety`'s map answers `openoriginal`, `openwithwarning`, `safeview` and `safecopy` with a `Response` (bytes; K2098 reading 2), but `store-door`'s `dispatch` wraps every map answer as `Response.json({ok: true, result: await map[op]()})` (`store-door/dispatch.mjs`:305), so a `Response` serialises to `{}` and no bytes reach the Worker. My side (R61): the door forwards each of the four to the store's route of its own name (as `declarations.test.mjs`:40 expects) and relays a non-JSON answer as given (bytes, content type, length, `x-capture-sha256` / `x-derived-sha256`), adding `cache-control: no-store`; a JSON refusal goes through the envelope. **Best reading:** the store's half is one line in `store-door` (T36-48): a map answer that is a `Response` is returned as is (`if (a instanceof Response) return a;`), or plane's if BOB places it there. I change neither file (P7). Please route it to STORE-DOOR #2 (or PLANE #25), or tell me another path.

(2) **The name of admission's address gate (R59, R28).** T36-36 has not merged. **Best reading:** admission exports a gate in its usual shape (`null` or `{status, body}`), and I call it directly after `namespaceGate` (admission R1), before `queryGate`, `aiCredentialPresented` and everything else. Until I know its name, I call `presentedCredential(...).inAddress` and refuse with admission's own refusal builder if it has one. Please give me the export's name once ADMISSION #6 fixes it (e.g. `credentialAddressGate(url)`).

(3) **R62's `warned` on `op=capture`'s GET.** A GET carries no body, and `file-safety`'s map reads `warned` from the body only. **Best reading:** for a member's or an `ai` credential's GET of `op=capture`, a query `warned` holding the JSON object (`warned={"own_device":true,"no_macros":true}`) routes to the store's `openwithwarning` with `{warned}` in an internal POST body; any other `warned` value is passed as given, and `file-safety` answers `WARNING_NOT_CONFIRMED`. Without `warned`, the request routes to `openoriginal`. The store's request carries `capture` (the GET's `sha256`) and the stamped `viewer` only. The binding classes keep `captureObjectOp`'s own answer. All of this sits in `control-plane/index.mjs`, so `plane/door.mjs` is not touched.
