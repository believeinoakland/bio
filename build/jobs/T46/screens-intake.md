# screens-intake (T46)

**Status** · session_01JBa3sUqEAyKhi388Z2gNjX · depth 2 · COMPLETE · handled B5

## Completion again (SCREENS-INTAKE #1, B5; K3002)

**Re-opened by B5** · `tranche/T46` merged; aligned to interface-shell R21's K3002 sub-bullet: `cs.rows` takes `cols` as header word keys (new row `screen.held.col`) and `acts(item)` as a row's panel, so held's hold strip (`heldsetaside`, `release`, receiving `extra.picked`) is drawn by the screen after the rows; `cs.digest`, `cs.now`, `{refuse, fills}` and `cs.value` on checkboxes and radios are now the kit's (J3 accepted), so nothing remains open on the kit. J4's two reports are N979 and N980 (T47). Still to do at the shell's merge: re-point the tests to its DOM stand-in (B5).
- `node --test bio-plane/test/m/screens-intake/`: tests 42, pass 42, fail 0.
- With `modules.json` patched locally (paths, tests, the `wizard-scripts` use; not committed): format 0; architecture 0; coverage 9 of 9; ownership 0 (13 files). `checks/run.mjs`: format 0, architecture 0 over 2,988 files, channels 0; coverage 8 failures, none screens-intake's.
- `SCREEN_WORDS` now 168 rows.

Size (session_01JBa3sUqEAyKhi388Z2gNjX): test runs 13, module lines 836

## Completion (SCREENS-INTAKE #1)

**Entry applied** · T46-56 (N897 (1); N821; N714's screen side; N747): R1–R9 met, a new module built to interface-shell R21 as K2996, K2998 and K2999 fixed it (B2–B4), against my own stand-in kit; re-pointed to the shell's shared DOM stand-in at its merge (B3).
- **capture** (R1–R3): three tabs at `/app/capture/address|file|saw`. R1 `acquire` (its five refusals each in its own row via `refusals`), `capturerequest`, `monitor` drawn once a capture landed in a bundle (K2996 Q3); an answer carrying `promoted` is not promoted again, any other new document is promoted by the screen (`allocid`, then `promote` of an information@2 bundle at `collected` composed as setup-page's intake composes it; K2996 Q2). R2 the upload: `accept` and `capture="environment"`, four choices none preselected, statement composed in order with labels, ≤2,000 characters, nothing sent while any part is missing (saying which), raw bytes with `statement` and `name` in the query; its four refusals in their own rows; `existed` drawn; "Downloaded from a website?" links the address tab; `photo.reminder` by key. R3 `testify` (words with where, `observedAt` from when, never after now); `writinghelp` under the words only while reachable, told only what was typed, the draft labelled, `ai.label.untested` exactly when the answer carries `untested`.
- **held** (R4): `heldcaptures`; rows through `cs.rows` (picked, hold strip `release`, `heldsetaside`), eligibility marks (`gap.refused` with its reason, `gap.undetermined` when R78 is unregistered), questions and `gap.withheld`; an archive's files link to `open-file`. `release` = `op=select` over the picked ids then `op=release` with the signed dialog's acknowledgment and mitigation, checked to ratification R20's bounds first (K2996 Q5). Set-aside rows stay in view with `heldrestore` (Q6).
- **open-file** (R5, R6, R9): `threatof`, `originalstate`, `verdictnotes`, `scanfindings` (filtered to the capture), `scanstatus` only for a session that administers (Q7); held / low / high; `openwithwarning` only on the `warned` path, sent only with both boxes ticked; the deeper path by `override`; `releasescanhold` only while held; the safe view marked `origin.machine`, "a safe copy of the original", cite the original; a sheet drawn as data. Originals and safe views through `cs.download` (B4); requests carry only the capture's digest.
- **inbox** (R7): `inbox`, `inboxget` for `/app/inbox/<knock>`; size, date, note, same-knocker count, the ladder (from what the row holds); `inboxpull`, `inboxresolve` to `discarded` (the shell's reason; `RESOLVE_NO_REASON` its own row), `sourcelink`.
- **Words**: `SCREEN_WORDS`, 167 rows (165 `screen.<id>.` keys, plus `mark.gap.refused.means` in DEC-149's form and `ai.label.untested` word for word as screens-inquiry R7), for the design stream's HANDOFF (plan T46, "BOB's acts").

**Files (K1043; for `modules.json`)** · paths `bio-plane/src/screens-intake/` (`index.mjs`, `words.mjs`, `capture.mjs`, `held.mjs`, `open-file.mjs`, `inbox.mjs`); tests `bio-plane/test/m/screens-intake/` (`kit.mjs`, `capture.test.mjs`, `held.test.mjs`, `open-file.test.mjs`, `inbox.test.mjs`, `common.test.mjs`). **Uses** gain `wizard-scripts` (tests only: `SCREEN_REGISTRY`, to check every act against the registry; earlier in layer 11).

**Kit parts read beyond K2998's list** (asked in J3, unanswered at COMPLETE): `cs.digest(text)` (the promoted bundle's SHA-256s; `crypto` is not an allowed global), `cs.now()` (falls back to `Date.now()`), `{refuse: key, fills}` filled by the shell, `cs.value(id)` a checkbox's or radio's `checked`. If the shell does not give `cs.digest`, the R1 promote cannot run; that is the one point to settle at its merge.

**Read** · my requirements whole; the public parts of interface-shell, setup-words, op-declarations (its tables); layers.md layer 11; draft-T46-interface.md §1, §2.4, §3–§7; registry, `mock-kit.js`, `mock-screens.js` (capture, held, open-file, inbox) and `words.json` at 3f40899950; the owners' answers I draw (acquisition R10, capture R76–R81 and R86 and its `heldCaptures`, `setAside`, `restoreHeld` code, ratification R20–R26, retrieval R18, provenance R28, monitoring R1, capture-requests R1–R2, file-safety R2, R5, R6, R8–R11, R13, R15–R17 and its ops map, doorbell R3, R13 and its ops map, sources R1–R12, wizard-scripts R24, R27, control-plane R36, R58, R59, R72 and its archive promote, setup-page R10, R11, R26, R31 and its intake composition).

**Found in other modules** (also in REPORT) · N969 (K2996) holds the three gaps: `monitor` refuses `NOT_MONITORED` on a bundle the screen writes (`monitoring.enabled: false`) and no act sets it; `captureRequest` needs a running run (no member path); no read lists set-aside documents. New: (a) `heldCaptures` rows (capture R77) carry no grade and no capture digest, so a held row other than an archive's file can draw no grade and no thumbnail opening `open-file` (R4 asks both); (b) no member read answers a knock's source id (`sourceof` and `sourcerung` are not in `SESSION_OPS.member`), so `sourcelink` needs the member to type both ids and the ladder stops at "Same knocker"; (c) the registry's `inbox` op is served as doorbell's `inboxlist` arm (control-plane's alias), not checked live here.

**Deferred** · none in my module.

**Tests and checks** (on `job/T46/screens-intake`, `tranche/T46` merged at B3)
- `node --test bio-plane/test/m/screens-intake/`: tests 42, pass 42, fail 0. Every function runs compiled from its own text in a `vm` context with only the language's globals (R21 (1)); the stand-in's `w` throws on any key no list holds.
- With `modules.json` patched locally (paths, tests, the `wizard-scripts` use; not committed): `architecture.mjs … screens-intake` 0 failures; `coverage.mjs … screens-intake` 9 of 9; `ownership.mjs … tranche/T46` 13 files, 0 failures. Unpatched: architecture 0 (no files listed), coverage 9 unnamed (no tests listed), as K1043 expects.
- `checks/run.mjs` (patched): architecture 0 failures over 2,984 files, channels 0; coverage 12 failures, none screens-intake's (the other L11 jobs' marked ids, as rule 5 (1)).

Size (session_01JBa3sUqEAyKhi388Z2gNjX): test runs 11, module lines 834

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

## J4 · COMPLETE

T46-56 complete: R1–R9 met, built to interface-shell R21 (K2996, K2998, K2999) over my own stand-in kit; 42/42; the record's "Completion" section has the detail.
- **Files for `modules.json` (K1043):** paths `bio-plane/src/screens-intake/`; tests `bio-plane/test/m/screens-intake/`. **Uses** gain `wizard-scripts` (tests only, `SCREEN_REGISTRY`). With those patched locally: architecture 0, coverage 9/9, ownership 0 (13 files); run.mjs architecture 0, coverage failures none mine.
- **Open for the shell's merge (J3, unanswered):** `cs.digest(text)` (R1's promoted bundle; `crypto` is not an allowed global), `cs.now()`, `{refuse, fills}` filled, `cs.value` answering a checkbox's `checked`. I re-point to the shell's DOM stand-in at its merge (your CHANGE).
- **REPORT, other modules (beyond N969):** (a) capture R77's `heldCaptures` rows carry no grade and no capture digest, so a held row (not an archive's file) can draw neither its grade nor a thumbnail opening `open-file`, as R4 asks; (b) no member-session read answers a knock's source id (`sourceof`, `sourcerung` not in `SESSION_OPS.member`), so `sourcelink` needs both ids typed and the ladder stops at "Same knocker".
- `SCREEN_WORDS`: 167 rows for the design stream's HANDOFF.

## J5 · COMPLETE · re B5

Re-complete per B5: tranche/T46 merged; aligned to K3002's R21 (cs.rows cols as header keys, acts(item) the row panel, so held draws its own hold strip with heldsetaside and release over extra.picked; digest, now, refuse fills and value on checkboxes now the kit's). 42/42; with modules.json patched locally (paths bio-plane/src/screens-intake/, tests bio-plane/test/m/screens-intake/, uses + wizard-scripts): format 0, architecture 0, coverage 9/9, ownership 0; run.mjs coverage failures none mine. Re-pointing to the shell's DOM stand-in waits on its merge's CHANGE. Record: 'Completion again'.
