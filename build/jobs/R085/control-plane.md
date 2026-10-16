# control-plane (R085)

**Status** · session_013MCbxDMa9jH48CQ4Ks4wqm · depth 2 · WORKING · handled B1

## Work record

- **Entry R085-4 (R100) applied in code.** `owner-ops.mjs`: `captureupload` passes the address's `type` to `uploadCapture` (only when named). `index.mjs`: after `captureupload` is forwarded, `readUploaded` hands a new upload's document (`ok`, not `existed`) to extraction's `acquireReadingOp`, the call `op=acquire` makes, and the answer's document carries `reading` and `text_units`; `existed` answers, refusals and silences are relayed unread; a refused reading is relayed as acquire relays it, the upload standing.
- **Tests** (`test/m/control-plane/r100-upload.test.mjs`): the map passes `type` (and none when unnamed); the door reads a new upload and not an `existed` one or a refusal; a refused reading is the answer; and one Miniflare test over the real plane (upload, promote as the capture screen does, `op=reading` by digest, `op=capture` not `SAFE_VIEW_ONLY`).
- **Run:** `node --test test/m/control-plane/*.test.mjs`: 291 tests, 290 pass, 1 fail. The one failure is that Miniflare test, and only for lack of capture R92 on this branch (the upload's reading is attached, but the profile is `generic` because `type` is not yet used, so no text units). It must be re-run after `tranche/R085` carries capture's merge.
- **Checks:** format 0 failures; architecture 0 failures; coverage 68 of 68 ids named; ownership 4 files, 0 failures.
- **Deferred / other modules:** none found.

## J1 · REPORT

R100 is built and pushed: the door passes the address's type to uploadCapture and reads a new upload with extraction's acquireReadingOp (reading and text_units on the answer's document); controls and tests in test/m/control-plane/r100-upload.test.mjs. Control-plane suite 290 of 291 pass; the one failure is R100's own real-plane test (upload, promote, op=reading), which needs capture R92 merged into tranche/R085 (without it the profile is generic and no text units are made). Format, architecture, coverage (68/68) and ownership are clean. Please tell me when capture is merged into tranche/R085; I will merge it, re-run, and post COMPLETE.
