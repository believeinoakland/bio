# screens-intake (T46)

**Status** · session_01JBa3sUqEAyKhi388Z2gNjX · depth 2 · WORKING · handled B3

## J1 · QUESTION

Seven readings, each with what I build meanwhile (step 3: I carry on with all of them; none stops me). Q1 is the one I most need an answer to before COMPLETE.

**Q1 · The kit.** interface-shell is being built beside me, so its kit `cs` (its Suggestions) has no signatures yet. Reading: I write `SCREENS` as R21's `{id, reads, render, acts, words}` with self-contained functions over `cs` and the mockups' kit names (`read`, `act`, `w`, `state`, `row`, `ref`, `mark`, `grade`, `sheet`, `sec`, `field`, `choice`, `checks`), tested against a small stand-in kit in my own tests; at interface-shell's merge (your CHANGE) I re-point to its real kit and shared DOM stand-in. If the shell's job has fixed `cs`'s signatures, please relay them so I build to them now.

**Q2 · R1's promote (N747).** The door promotes only an archive's documents after an `acquire` (control-plane `promoteAcquired`, answer `promoted`/`not_promoted`); a single document is not promoted by the door. Reading: an answer carrying `promoted` (an array) is not promoted again by the screen; otherwise the screen promotes `document` with `op=promote` as an information bundle at `collected`, with the same `bundle.md` (information@2), `data/provenance.json` and register the setup page's intake composes (`setup-page` `mdFor`/`docFiles`), carried as my own browser functions (no import from setup-page, which is not in my Uses). Title: the address's last path segment until the member names it.

**Q3 · `monitor` (R1).** `op=monitor` takes a `bundleId`, not an address (monitoring's `monitor({bundleId, actor})`, refused `NOT_MONITORED` unless the bundle's `monitoring.enabled` is true). Reading: "Watch this address" is drawn only after a capture from the address has landed, naming that bundle; its refusals (`NOT_MONITORED` among them) are drawn by shell R13. This is a flaw I report: the bundle the screen writes has `monitoring.enabled: false` (setup-page's form), so watching is refused until something sets it; no registry act on this screen sets it.

**Q4 · `capturerequest` (R1).** `captureRequest` requires a `run` that is `running` (C-28.1 `CAPTURE_REQUEST_NO_RUN`); a member on Add has no run. Reading: "Ask for this later" sends `{address}` (no run) and draws the refusal by shell R13, so the act is drawn but always refused today. Reported as a gap against `capture-requests` (no member path), for you to route or to tell me to leave the act undrawn.

**Q5 · `release` (R4).** ratification R20–R26: `release` takes a selection `handle`, `acknowledgment` and `mitigation` (each ≤500 chars, no `"`, `\`, CR, LF), not ids. Reading: the one "Vouch for them" act (weight signed → shell R11's dialog) asks the two fields in its dialog, then calls `op=select` with the picked ids (an enumerated selection, `retrieval` R18) and `op=release` with its handle. `select` is the act's own preparatory call, not a second control, so the screen's acts stay the registry's four. Its refusals (`CRUCIAL_IN_BATCH`, …) by shell R13.

**Q6 · `heldrestore` (R4).** `heldCaptures` (capture R77) lists no set-aside document, so a picked row is never restorable. Reading: after a set-aside, the screen keeps the just-set-aside rows in a "Set aside just now" band with "Restore" (one reason, as R81 requires), until the screen is left. No read lists set-aside documents.

**Q7 · R5's reads.** `scanstatus` is an administrators' read (file-safety R5); `scanfindings` is group-wide. Reading: `scanstatus` is read only when `whoami.administer` is true (its section absent otherwise, as R12's rule for acts); `scanfindings` is read with `since` a week back and filtered to this capture. The capture's subject id in `/app/open-file/<sha256>` is its digest; a held row's thumbnail links there.

## J2 · QUESTION

Building to K2998's contract now. Four points the contract's text leaves open for my screens; my reading of each, which I build meanwhile (none stops me). Please relay to INTERFACE-SHELL #1 if they are its to settle.

1. **Multi-request acts.** `release` needs `op=select` first (K2996 Q5) and `acquire` a promote after (Q2). Reading: `send` may answer a promise and the shell awaits it, so `release`'s `send` calls `cs.call("select", …)` and answers the release's `{body}` with the handle; `acquire`'s `done` calls `cs.call("allocid")` and `cs.call("promote")`, drawing their refusals through `cs.set`.
2. **Byte answers (R6).** `cs.call` answers "the parsed answer"; `openoriginal`, `openwithwarning` and `safeview` answer bytes. Reading: the kit gives `cs.download(op, {query, body})` → a promise of `{ok, answer}` that, on a byte answer, hands the bytes to the browser as a file (`Blob` behind an object address released once the download starts, setup-page R26's form) and answers `{ok: true, answer: {bytes, type, name}}` (the derived view's JSON answer as it comes); the three acts' `send` call it and answer `null`.
3. **Picked rows (R19).** Reading: the hold strip's act receives the picked rows' keys as `extra.picked` (the `key` of `cs.rows`).
4. **Upload's bytes.** Reading: `send` answers `{query: {statement, name}, raw: cs.file("ci-file")}`; the shell sends `raw` as the request body as it is, under the session header, with no JSON content type.

## J3 · QUESTION

Adds to J2 (which it does not replace), from rewriting to R21 (1)'s globals rule (only `JSON`, `Math`, `String`, `Number`, `Array`, `Object`, `Date`): three more kit needs, my reading of each built meanwhile.
5. **`cs.digest(text)`**: the screen-promoted bundle (K2996 Q2) sends each file's SHA-256 as the setup page does, and `crypto.subtle` is not among the allowed globals. Reading: the kit gives `cs.digest(text)` → a promise of the lowercase hex SHA-256 of the text's UTF-8 bytes. (UTF-8 lengths I compute myself.)
6. **`cs.now()`**: the instant for `observedAt`'s "no later than now" check and the bundle's `created`; read through the kit so tests set the clock (falls back to `Date.now()`).
7. **`{refuse: key, fills}`**: several of my refusals name what is missing ("Before it is sent, say: How you got it, Where and when."). Reading: the shell fills the word with `fills` as `w(key, fills)` does. Also `cs.value(id)` answers a checkbox's or radio's `checked` (true/false) and any other field's value.
