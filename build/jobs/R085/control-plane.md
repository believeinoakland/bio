# control-plane (R085)

**Status** · session_013MCbxDMa9jH48CQ4Ks4wqm · depth 2 · COMPLETE · handled B2

## Work record

- **Entry R085-4 (R100) applied in code.** `owner-ops.mjs`: `captureupload` passes the address's `type` to `uploadCapture` (only when named). `index.mjs`: after `captureupload` is forwarded, `readUploaded` hands a new upload's document (`ok`, not `existed`) to extraction's `acquireReadingOp`, the call `op=acquire` makes, and the answer's document carries `reading` and `text_units`; `existed` answers, refusals and silences are relayed unread; a refused reading is relayed as acquire relays it, the upload standing.
- **Tests** (`test/m/control-plane/r100-upload.test.mjs`): the map passes `type` (and none when unnamed); the door reads a new upload and not an `existed` one or a refusal; a refused reading is the answer; and one Miniflare test over the real plane (upload, promote as the capture screen does, `op=reading` by digest, `op=capture` not `SAFE_VIEW_ONLY`).
- **Run:** `node --test test/m/control-plane/*.test.mjs`: 291 tests, 290 pass, 1 fail. The one failure is that Miniflare test, and only for lack of capture R92 on this branch (the upload's reading is attached, but the profile is `generic` because `type` is not yet used, so no text units). It must be re-run after `tranche/R085` carries capture's merge.
- **Checks:** format 0 failures; architecture 0 failures; coverage 68 of 68 ids named; ownership 4 files, 0 failures.
- **Deferred / other modules:** none found.

## J1 · REPORT

R100 is built and pushed: the door passes the address's type to uploadCapture and reads a new upload with extraction's acquireReadingOp (reading and text_units on the answer's document); controls and tests in test/m/control-plane/r100-upload.test.mjs. Control-plane suite 290 of 291 pass; the one failure is R100's own real-plane test (upload, promote, op=reading), which needs capture R92 merged into tranche/R085 (without it the profile is generic and no text units are made). Format, architecture, coverage (68/68) and ownership are clean. Please tell me when capture is merged into tranche/R085; I will merge it, re-run, and post COMPLETE.

- **After B2 (capture R92 merged @ f74eb9fcfa, merged into this branch):** R100's real-plane test now passes every reading assertion (the upload's answer carries `reading` and `text_units`; `op=reading` by digest is `found: true` with both lines). It fails only on the last clause, `op=capture` not refused `SAFE_VIEW_ONLY`. Cause, outside control-plane: `file-safety` R6 grades a non-archive file `low` only when `provenance.fetchedByThisCopy` is true, and an upload is received, never fetched, so it is always `high` (`source_not_fetched`, and `format_unchecked` too while `text/plain` has no format entry), and R8 refuses a high file's original with `SAFE_VIEW_ONLY` unless a deeper check passes or the warned path is used. No change in control-plane can alter that; the test is not weakened.

## J2 · QUESTION · re B2

With capture R92 merged, R100's real-plane test passes every reading assertion (upload answer carries reading and text_units; op=reading by digest found:true with both lines). It fails only on its last clause, op=capture not refused SAFE_VIEW_ONLY. Cause is in file-safety, not control-plane: R6 grades a non-archive file low only if provenance.fetchedByThisCopy is true; an upload is received, never fetched, so it is always high (source_not_fetched; also format_unchecked until formats has a text entry), and R8 then refuses its original SAFE_VIEW_ONLY unless a deeper check passes or the warned path (openwithwarning) is used. Nothing in the door can change that. Options: (a) BOB amends R100 so the clause reads: the original opens by the warned path (op=openwithwarning) or after a deeper check, and I change the test accordingly; (b) file-safety changes R6 so a member's own upload is not graded high on source alone (a file-safety job; a doctrine call for Bob, since it relaxes the safety rule). My best reading: (a), since R6 is deliberate doctrine and the walk's blocker was the missing reading. I have not weakened the test; it stays red until you choose. Everything else is done and green (format, architecture, coverage 68/68, ownership).

## Completion

- **Entries applied:** R085-4 (R100): `type` passed to `uploadCapture`; a new upload read as an acquire is (`readUploaded`, extraction's `acquireReadingOp`). Per BOB's B3 (a), the real-plane test's last clause is the warned path (`op=openwithwarning`), file-safety R6/R8 unchanged; the Miniflare plane binds a stand-in `FILE_SCANNER` (clean) because the warned path scans first.
- **Deferred:** none. **Found in other modules:** none beyond the file-safety point settled in B3.
- **Tests:** `node --test test/m/control-plane/*.test.mjs`: 291 tests, 291 pass, 0 fail (capture R92 merged, tranche/R085 @ 97f683add5).
- **Checks:** format 170 modules, 169 requirements files; 0 failures. architecture 59 product files, 288 relative imports; 0 failures. coverage 68 of 68 live requirement ids named by a test; 0 failures. ownership 4 files changed by control-plane; 0 failures.

Size (session_013MCbxDMa9jH48CQ4Ks4wqm): test runs 9, module lines 3781

## J3 · COMPLETE · re B3

R100 done on job/R085/control-plane (tranche/R085 @ 97f683add5 merged in). Door passes type and reads a new upload as acquire does; the real-plane test now ends on the warned path per B3. Control-plane suite 291/291; format, architecture, coverage 68/68 and ownership all 0 failures. Record has the details.
