# cause-capture-t51 (T51)

**Status** · session_01GFqkWRF1arvd4PeKMk724o · depth 2 · WORKING · handled B1

## J1 · QUESTION

All six causes are built and tested (C5 C12 C13 C14 C25 C26); suites green so far (acquisition 185, capture 220, sources, direct users running). No question blocks me. Requirement lines that are not written, my best reading of each, which I built; correct any and I change the code:

1. acquisition R10/R11 (C5, multipart). Cause found by the three-part fixture: the whole fingerprint was never an object (R10 stored parts only), so every reader that asks the evidence store for a capture by its digest (OCR, `op=capture`, vouch) found nothing. Now a multipart capture up to `MULTIPART_KEEP_MAX` (32 MiB, exported, chosen not measured: please record) is also kept whole under its own digest (`keepWhole`, parts read back one at a time, hashed); a part gone at read-back, bytes that do not add up, or a store that refuses the whole answers 502 `CAPTURE_NOT_KEPT` in words (no catalogue row; sentence by `localize`) with no receipt and no document. Past 32 MiB the capture is held in parts alone as before (provenance R7 reads it by parts): an OCR/vouch screen must not offer either for such a document. R11 unchanged (existed by registerHolds only). Same for capture R86 uploads (`UPLOAD_NOT_STORED`). Existing tests that asserted "the whole is never stored" were changed to the new rule (acquire R10, R20 scenario moved past the bound, R48 count test). The test fixture bucket now reports R2's checksums as R2 does.
2. acquisition R20 (C12). After the document is kept `acquire` waits `ATTEST_WAIT_MS` (3000, `opts.attestWaitMs`) for co-attestation; past it the document is answered with `attestation_attempts: [{service:"attest", attempted:true, ok:false, pending:true, at, note}]`, the attestation goes on, and its attempts are recorded when they end through a new store service `capture.recordLateAttestations({captureSha, attempts, by})` (capture R68: appended to `late_attestations` as late attestations, "proves the bytes existed by <at>, not at capture"). The capture-request arm waits for it. A late or failed attempt never fails or un-keeps a capture.
3. acquisition R5/R6/R12 (C13). The render is started once the page is fetched and waited for `RENDER_WAIT_MS` (10000, `opts.renderWaitMs`); a fast render files the pair at once (unchanged). Past it the served page is filed as it is, `document.render_pending = {session, since, note}`, answer `render: {state:"pending", session}`, the render's cost reported when it returns; the session (capture R22, `queue: [{render:true}]`, `opened_by`) is listed by `openCaptures` (R46) as Unfinished. `acquire {continue: session}` then finishes it: still running -> `render: {state:"pending"}`, session kept; returned -> the PAIR is answered as a second document (rendered primary, the page beside it), no second render or charge; the object restarted -> rendered then. R12's "no document" is amended for this case: the caller (control-plane's promote) must promote that `document`; screens' "Finish it" must draw `render_pending`.
4. acquisition R16 (C25). `reading.title` is the reading's (reading-pipeline `titleOfHtml`/`titleOfMetadata`), not acquisition's. Acquisition's part, built: `document.capture.file_name`, the source's own file name (Content-Disposition `filename*` then `filename`, else the address's last segment when it ends in an extension; decoded, path stripped, at most 200 characters; absent when none). screens-intake's rule can end "else its file name" with it.
5. capture R77/R88 (C14). New parameter `fields`: `full` (default, rows unchanged: proved against the list as answered before) or `picker` (rows `{bundle_id, title, project, capture:{sha256}, standing}`, no examination/questions/archive/facts; any other value refused naming `fields`); `heldcaptures` DECLARED_OPS accepts `fields`. The list's per-row reads are batched (the test holds 60 rows to at most 40 store reads and growth from 6 rows to 12; it was about 8 a row); a capture whose own register document profiles it as not `zip` is not asked of the archive listing. New acquisition services `membersOf`, `openedAmong` (R41, batch forms of `memberOf`).
6. capture R96 (C26). Other bytes are `changed` only when both the copy and what the site serves earned a determined evidentiary digest over the same handler; otherwise `undetermined` ("cannot tell"), `looked_at` still given. New acquisition helper `servedSubstance`. Two existing R96 tests changed accordingly. `monitoring` records the baseline (its own job).

Words: no new design row needed by me; every sentence I added is written once with `localize` (keys `acquisition.index.keep_*`, `capture_not_kept`, `attestation_pending`, `render_pending_note`, `render_pending_files`; `capture.index.heldat_*`). `sources`: nothing in it reads a stored document, so it has no part in C5; unchanged.

## Record (cause-capture-t51, fix round 2 of T51; wave 1)

Holds `acquisition`, `capture`, `sources`. Tranche tip merged first (`9ff79d0b77`). Every test written first and seen failing, at the module's interface, with its control; the tests are `bio-plane/test/m/acquisition/fix2-t51.test.mjs` and `bio-plane/test/m/capture/fix2-t51.test.mjs`.

### Causes met

| cause | requirement ids | what | test |
|---|---|---|---|
| C5 (BLOCKER) | acquisition R10, R11; capture R86 | The whole fingerprint was never an object (R10 stored the parts only), so every reader that asks the evidence store for a capture by its digest (OCR, `op=capture`, the vouch box) found nothing: the acquisition half failed. `keepWhole` keeps a multipart capture whole up to `MULTIPART_KEEP_MAX` (32 MiB) under its own digest, parts read back one at a time and hashed; any failure is `CAPTURE_NOT_KEPT` (502, in words) with no receipt and no document; an upload the same (`UPLOAD_NOT_STORED`). `existed` is still `registerHolds` alone. `sources` has no part in it (nothing in it reads a stored document). | `fix2-t51` acquisition (3 tests), capture (1) |
| C12 | acquisition R20; capture R68 | The attestation is requested once the document is kept and waited for `ATTEST_WAIT_MS` (3 s); past it the document is answered with a `pending` attempt and the outcome is recorded when it ends (`recordLateAttestations`, new, appended as late attestations). The capture-request arm waits. | acquisition (2), capture (1) |
| C13 | acquisition R5, R6, R12 | The render is waited for `RENDER_WAIT_MS` (10 s); past it the served page is filed with `render_pending {session, since, note}` and a capture session `rs_…` that `openCaptures` lists; `continue` finishes it (pending / the pair as a second document / re-render if the object restarted); the render is paid for once, when it returns. | acquisition (2) |
| C14 | capture R77, R88 | A page's reads are batched (`#pageFacts`, `membersOf`, `openedAmong`); a capture its own register document profiles as not `zip` is not asked of the archive listing; `fields: "picker"` is the cheap read; `heldcaptures` declares `fields`. | capture (3: golden-list control, read count, picker) |
| C25 | acquisition R16 | The title is the reading's (`reading-pipeline`), not acquisition's; acquisition's part: `capture.file_name`, the source's own file name. | acquisition (1) |
| C26 | capture R96 | Other bytes are `changed` only when both sides earned a determined evidentiary digest over the same handler (`servedSubstance`, acquisition); else `undetermined`. | capture (2) |

### Tests changed (the requirement they proved moved)

- acquire R10: "the whole is never stored under its own hash" is now "kept whole" (C5).
- acquire R20/R28: the "register cannot be asked" scenario uses a capture past `MULTIPART_KEEP_MAX` (only parts are held).
- t50 R48: the in-parts count test uses a body past the bound (five distinct parts, a store with no checksum); a within-bound case is added. `readThrough` keeps the first object read and the last two (the first part is asked again for the ZIP magic): this is a flaw in my module found by the five-part case (a part was read three times), fixed.
- t51 R96: two tests expected `changed` from a copy with no determined digest; they now expect `undetermined` and still prove the look was made. The `changed` cases are in `fix2-t51`.
- acquisition fixture bucket: reports `checksums` as R2 does for an object put with `sha256` (`checksums = false` stands for a store that gives none).

### Deferred, and why

- Captures already filed parts-only (INFO-2026-0042 on biosmoke8) are not repaired: they are held as before. Capture them again (existing bytes answer `existed`, the receipt is a second sighting, and the whole is written) or BOB names a one-time repair act.
- Past `MULTIPART_KEEP_MAX` a capture is still parts-only. A document with no object under its fingerprint must not offer OCR or vouch (a screen's rule, `screens-intake`); a streamed serve of parts needs `record-core`'s evidence store, not held here.
- The late record is written by the object after it has answered; if the object is evicted first the attempt stays `pending` in the document and `reattest` (R68) is the member's way to ask again.

### Found in other modules (REPORT to BOB)

See `J2` in the mailbox: `reading-pipeline.bytesOf` (prefer the whole, and its 20 MiB bound), `provenance.captureGrade` (one read a call; a batch form), `control-plane` (promote a continuation's `document`; the 504 sentence), `screens-intake` (draw `render_pending`, `file_name`, `fields: "picker"`).

### Words

No sentence of mine needs a design row: each is written once with `localize` (acquisition keys `index.keep_part_missing`, `keep_part_differs`, `keep_parts_do_not_add_up`, `keep_store_refused`, `capture_not_kept`, `attestation_pending`, `render_pending_note`, `render_pending_files`; capture keys `index.heldat_baseline_no_digest`, `heldat_served_too_large`, `heldat_other_handler`, `heldat_served_no_digest`, `heldat_same_substance`, `heldat_changed_substance`). They are builders' diagnostics: the screens draw their own keyed words from `pending`, `render_pending`, `changed.state`.

### Generated artifacts made stale (I wrote none; BOB regenerates at the layer close, manifest §14)

- `bio-plane/src/setup-words/rows.mjs` (setup-words): my new `localize` keys are not in it (`node bio-plane/src/setup-words/build.mjs --check` names `acquisition.index.attestation_pending` first); regenerate with `node bio-plane/src/setup-words/build.mjs`.
- `agent-worker/dist/agent-worker.bundled.mjs`, `.bundle.json` (inputs `acquisition/index.mjs`, `checks.mjs`, `keyed.mjs`, `unpack.mjs`, `capture/checks.mjs`, `ops.mjs`, `words.mjs`) and `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json` (the plane's source): `npm run build` in each directory.

### Tests and checks run

- acquisition 185/185; capture (with `cap13-reuse-pages`, `d57selflink`) 220/220; sources 44/44.
- Direct users (36 modules, two lanes): all pass except two failures that fail identically on `tranche/T51` untouched, not mine: `store-door` R17 (`groupdescriptiondraft` hand row disagrees with the owner's) and `plane` R24 (a screen title/purpose words check).
- `checks/run.mjs`: architecture, coverage, words 0 failures for acquisition, capture, sources (other modules' coverage gaps and a rulings.md K4301 line fail, not mine). Cause-job `ownership.mjs acquisition,capture,sources origin/tranche/T51 job/T51/cause-capture-t51`: 0 failures (11 files).
- Not run: the full `impact.mjs` set (1738 files, K4272); BOB runs the whole suite per wave.

Size (session_01GFqkWRF1arvd4PeKMk724o): test runs 40, module lines 8333

## J2 · REPORT

Other modules (for routing):
- reading-pipeline `bytesOf` (R2): reads a multipart document by assembling its parts and refuses over MULTIPART_READ_MAX (20 MiB); a 21 MB PDF is over it, which is likely the walk's "no reading". It should read `evidence.get(doc.capture.sha256)` first (the whole is now held up to 32 MiB). cause-reading-t51 or a wave-3 follow-up.
- provenance: `captureGrade` reads once per capture; heldcaptures calls it once per distinct row. A batch `captureGrades(shas)` would finish C14's bound.
- control-plane: promote the `document` of a render continuation (`acquire {continue}` with `render_pending`); the 504 sentence (wave 2) can now say what was kept.
- screens-intake: draw `render_pending`, a pending attestation, `capture.file_name`; use `fields:"picker"` for pickers; never offer OCR/vouch for a document with no object under its fingerprint (parts-only past 32 MiB).
- Generated artifacts stale: setup-words rows.mjs, agent-worker and plane bundles (listed in my record).
- Two failures on tranche/T51 untouched: store-door R17, plane R24.
