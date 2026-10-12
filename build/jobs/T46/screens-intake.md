# screens-intake (T46)

**Status** · session_01JBa3sUqEAyKhi388Z2gNjX · depth 2 · WORKING · handled B0

## J1 · QUESTION

Seven readings, each with what I build meanwhile (step 3: I carry on with all of them; none stops me). Q1 is the one I most need an answer to before COMPLETE.

**Q1 · The kit.** interface-shell is being built beside me, so its kit `cs` (its Suggestions) has no signatures yet. Reading: I write `SCREENS` as R21's `{id, reads, render, acts, words}` with self-contained functions over `cs` and the mockups' kit names (`read`, `act`, `w`, `state`, `row`, `ref`, `mark`, `grade`, `sheet`, `sec`, `field`, `choice`, `checks`), tested against a small stand-in kit in my own tests; at interface-shell's merge (your CHANGE) I re-point to its real kit and shared DOM stand-in. If the shell's job has fixed `cs`'s signatures, please relay them so I build to them now.

**Q2 · R1's promote (N747).** The door promotes only an archive's documents after an `acquire` (control-plane `promoteAcquired`, answer `promoted`/`not_promoted`); a single document is not promoted by the door. Reading: an answer carrying `promoted` (an array) is not promoted again by the screen; otherwise the screen promotes `document` with `op=promote` as an information bundle at `collected`, with the same `bundle.md` (information@2), `data/provenance.json` and register the setup page's intake composes (`setup-page` `mdFor`/`docFiles`), carried as my own browser functions (no import from setup-page, which is not in my Uses). Title: the address's last path segment until the member names it.

**Q3 · `monitor` (R1).** `op=monitor` takes a `bundleId`, not an address (monitoring's `monitor({bundleId, actor})`, refused `NOT_MONITORED` unless the bundle's `monitoring.enabled` is true). Reading: "Watch this address" is drawn only after a capture from the address has landed, naming that bundle; its refusals (`NOT_MONITORED` among them) are drawn by shell R13. This is a flaw I report: the bundle the screen writes has `monitoring.enabled: false` (setup-page's form), so watching is refused until something sets it; no registry act on this screen sets it.

**Q4 · `capturerequest` (R1).** `captureRequest` requires a `run` that is `running` (C-28.1 `CAPTURE_REQUEST_NO_RUN`); a member on Add has no run. Reading: "Ask for this later" sends `{address}` (no run) and draws the refusal by shell R13, so the act is drawn but always refused today. Reported as a gap against `capture-requests` (no member path), for you to route or to tell me to leave the act undrawn.

**Q5 · `release` (R4).** ratification R20–R26: `release` takes a selection `handle`, `acknowledgment` and `mitigation` (each ≤500 chars, no `"`, `\`, CR, LF), not ids. Reading: the one "Vouch for them" act (weight signed → shell R11's dialog) asks the two fields in its dialog, then calls `op=select` with the picked ids (an enumerated selection, `retrieval` R18) and `op=release` with its handle. `select` is the act's own preparatory call, not a second control, so the screen's acts stay the registry's four. Its refusals (`CRUCIAL_IN_BATCH`, …) by shell R13.

**Q6 · `heldrestore` (R4).** `heldCaptures` (capture R77) lists no set-aside document, so a picked row is never restorable. Reading: after a set-aside, the screen keeps the just-set-aside rows in a "Set aside just now" band with "Restore" (one reason, as R81 requires), until the screen is left. No read lists set-aside documents.

**Q7 · R5's reads.** `scanstatus` is an administrators' read (file-safety R5); `scanfindings` is group-wide. Reading: `scanstatus` is read only when `whoami.administer` is true (its section absent otherwise, as R12's rule for acts); `scanfindings` is read with `since` a week back and filtered to this capture. The capture's subject id in `/app/open-file/<sha256>` is its digest; a held row's thumbnail links there.
