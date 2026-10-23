# Fix round 3: diagnosis of C84, C5, C17, C9 (worker for BOB, read-only, 2026-10-21)

Branch tranche/T51, copy deployed at e1367d2a2c. Method: source reading, git history, local measurement. Nothing deployed, no live call to the copy. Where a cause is certain it is said so; where it is inferred, it is said so and the probe that settles it is named.

---

## 1. C84: the file scanner has no signatures

**Verdict: the stored refusal is stale. It was written by code that is no longer in the repository. The new code has not run once.**

Evidence
- `signatures.last_error = "REFUSED:main.cvd:403"` is the error format of the OLD Worker-side download. `git show bf97a18595 -- file-scanner/src/clamav.mjs` shows it: `throw new Error(\`REFUSED:${db}:${r.status}\`)` after a `fetch('https://database.clamav.net/main.cvd')` sending `user-agent: file-scanner/<v> (signature mirror; as cvdupdate)`. That is a borrowed tool name; the official host answered 403 (file-scanner R6 says so: "borrowed `cvdupdate`'s name and was refused 403").
- Commit bf97a18595 (Oct 20) replaced the Worker download with `freshclam` in the image (`file-scanner/container/scanner.mjs:96-108` `fetchSignatures`; `file-scanner/src/clamav.mjs:136-151` `runMirror` asks the updater instance; R6, R34). The new error format is `MIRROR_REFUSED:exit N: <freshclam's lines>`.
- `last_attempt 04:17:15Z` is the daily cron (`file-scanner/wrangler.jsonc`: `"crons": ["17 4 * * *"]`). The 11:54 redeploy ran no mirror, so `state.json` still holds the 04:17 result written by the old bundle. Next scheduled run is 2026-10-22 04:17Z.
- Triggers that exist: the cron only, and `POST /mirror` (`file-scanner/src/handler.mjs:41`). The scanner has `workers_dev:false`; the plane holds the `FILE_SCANNER` binding (`bio-plane/src/file-safety/index.mjs:357` `#scannerBinding`) but calls only `/version` and the scan/render paths. No plane op calls `/mirror` (`grep` finds none). So neither an administrator nor a deploy can start a run. This is the real defect: a deploy that fixes the cause leaves the team unscanned for up to 24 h, with no door.
- Whether `freshclam` is accepted by the official host from Cloudflare egress is NOT proved by anything in the repository (no run yet). `freshclam` sends its own `ClamAV/<version>` agent, which is what the host expects, so the old cause (borrowed UA) is removed. I did not curl `database.clamav.net` (the instruction was only if allowed; the proxy rules make it doubtful). The first run is the test.

Other defects found on the way (same module / owner)
- `fetchSignatures` uses a fresh empty `DatabaseDirectory` every run (`scanner.mjs:96-101`), so every run downloads the three databases in full (main.cvd ~160 MB) and never an incremental `.cdiff`. The ClamAV CDN rate-limits (429 / 403 "cool-down") clients that do this, and Cloudflare egress addresses are shared. A retry loop would make this worse. Hardening: hand the updater the current mirrored set before `freshclam` (the Worker already holds it in R2; `/sigs/<set>/<file>` PUT exists for the scanning instance), so `freshclam` fetches diffs.
- The plane cannot word the new error: `file-safety/index.mjs` `#noSignatures` matches `/^REFUSED:[^:]*:(\d{3})$/`, the old format only. A `MIRROR_REFUSED:exit 1: ... 403` falls to "The last download of signatures did not finish" (owner: file-safety R46). It also explains the walker's note that "(status 403)" is still printed: the stored string is old.

Owner: `file-scanner` (R6, R8, R34), with `file-safety` (R5, R46) for the door and the words. Requirement ids: file-scanner R6, R34, R8, R12; file-safety R5, R46.

Proposed fix (smallest first)
1. file-scanner: make `/mirror` start the run and answer at once (`handler`/`worker.fetch` takes `ctx`; `ctx.waitUntil(runMirror(deps))`, answer 202 `{ok:true, started:true}`) when called with `?async=1`; the run's outcome lands in `/version` `signatures` as now. A full 300 MB download plus verify is too long to hold a service-binding request open.
2. file-safety: one administrator op, e.g. `scanmirror` ("Check for new signatures now"), an administrator's act that calls `/mirror?async=1` through the binding, refuses if `last_attempt` is under 15 minutes old, and answers "started". Draw its button on the Security page beside the "no signatures" sentence. Declare it in op-declarations (weight: a write that reaches out) and amend file-safety R5/R46 and screens-settings security.
3. file-safety, self-healing on deploy: when `scanStatus` / the scan batch reads `/version` with no published set and `last_attempt` null or older than 6 h, the batch calls the same start once. After any release that fixes the cause, the next scan wake (the 86 queued files) starts the run with no human act. Rate-limit by `last_attempt` (already in `/version`), so the CDN is not hit more than once per 6 h.
4. file-safety R46: parse `MIRROR_REFUSED:exit N: ...` as well as the old form (a status number found in the text, else "refused") so the words stay true; keep the administrator step printed once (C76-adjacent duplicate).
5. file-scanner hardening: seed the updater's directory with the current set (see above).
Requirement change: file-scanner R6 gains "and on `POST /mirror?async=1`, which starts the run and answers 202"; file-safety R5 or a new R gains the op and the self-start rule (3). R34 unchanged.

Settling probe after deploy: press the new act (or wait for 04:17Z) and read `scanstatus`. If `last_error` then reads `MIRROR_REFUSED:exit 1: ... 403`, the cause is the host refusing Cloudflare egress, and the choice for Bob is a mirror the team controls (a private mirror host, ClamAV's own guidance) rather than a header.

---

## 2. C5: multi-part PDFs

Two separate defects.

### 2a. Why the read stage times out for fresh multi-part captures (8.8 MB, 15.9 MB govinfo PDFs)

Source facts
- The `read` stage in `bio-plane/src/acquisition/index.mjs` is `stageBegin(t,"read")` at :1105 (the body loop, with an R2 `head`+`put` per 8 MiB part, `part()` :1075-1083) plus, for a multi-part capture, `timed(t,"read", () => keepWhole(...))` at :1259-1263. The `fetch` stage is only the response headers (walker: 0.28 s), so "fetch 0.28 s, read 24.7 s" does not show the site is fast; it shows the body and our writes are in `read`.
- `keepWhole` (:329-350, added in fix round 2 for the earlier C5) re-reads every part from R2 (`ev.get` + `arrayBuffer`), hashes each with WebCrypto, assembles a `total`-sized array, hashes the whole, and `put`s the whole as a second object. So each byte is written twice and read once more, all serially, before the receipt, inside the door's 25 s bound (control-plane R105). The constant `MULTIPART_KEEP_MAX = 32 MiB` is documented as "CHOSEN, not measured".
- Measured here (not by the walk): the pure-JS incremental SHA-256 (`record-grammar/sha256.mjs`) takes 118 ms for 16 MiB; the source host serves the 15.9 MB and 8.8 MB PDFs in 1.7 to 2.9 s from this sandbox (with the plane's User-Agent form and with a browser one). So neither hashing nor the source explains 24 to 43 s.
- Correlation: before fix round 2 the 21 MB BAC packet captured (parts only). The only new work on the multi-part path is `keepWhole` and the R2 round trips, and both newly tried PDFs fail while the BAC re-capture (parts already held, no part `put`s) takes 1.9 s in `read`. The 8.8 MB capture failing slower than the 15.9 MB one points at R2 latency under load (the walkers shared the copy; the STORE_DID_NOT_ANSWER at 20 s agrees), not at size.
- A 504 at the door does not cancel the work, so a second press while the first `keepWhole` still runs competes with it (43.4 s wall on the 8.8 MB retry).

Confidence: the double write and read-back is certain from the code; that it is the dominant cost is inferred. The stage is not split, so the live timings cannot say. First act of the fix: split the stage (`read` for streaming and part writes, `keep` for `keepWhole`) so the next walk reads the truth.

Owner: `acquisition` (R10, R11, R20, R95; R10 is the keep-whole rule). Requirement ids: acquisition R10, R11, R95, control-plane R105.

Proposed fix
1. Remove the read-back. Keep each part's bytes (they are already in memory when `part(buf)` runs) in an array while the total stays under `MULTIPART_KEEP_MAX`; when the stream ends, concatenate that memory and `put` once under the whole sha (R2 verifies `sha256`). That drops N `get`s and N digests from the critical path and removes the "part not what was stored" failure class. Peak memory is the total (at most 32 MiB) beside one part, the same as now.
2. Better still, put the whole first and the parts after it, or put the whole in the background via the existing "goes on by itself" mechanism used for attestation (index.mjs:357-360), so the answer returns when the parts and receipt are written. Only do this if the reading step can wait for the whole (it can: the reading is made after promote by `extractread`, which reads under the sha).
3. Add the `keep` stage timing and a test that a 16 MiB capture with a stubbed store whose `put` costs 1.5 s still answers inside the bound.
4. Past `MULTIPART_KEEP_MAX` (32 MiB of the 256 MiB `CAPTURE_MAX`) a capture is held in parts only forever: no reading, no vouch box, no OCR (`heldcaptures` `whole:false`). Requirement decision for Bob/BOB: either raise the keep ceiling after (1), or refuse such a capture in words and file nothing (CAUSES C5's own fix text). Today it is filed and unusable, which is the original C5 complaint.
Requirement change: acquisition R10/R11 amended: "kept whole from the parts held in memory, with no read-back; the stage `keep` is timed (R95)". No change to the 25 s bound.

### 2b. Why a parts-only record is never repaired

- A re-capture of the same address ends in the `existed: true` arm: `acquire` finds the sha registered (`provenance.registerHolds`, index.mjs:1170-1181), files nothing new, and (for 21 MB, under 32 MiB) now even runs `keepWhole`, so the bytes ARE now stored whole under the sha. Nothing then reads them.
- The screen, `screens-intake/capture.mjs:411-416` `doneAcquire`, asks `heldat` for the home, finds INFO-2026-0042 and only links it ("Open it"); it writes nothing.
- The reading of a document exists only if it was written when the bundle was promoted (`extraction/index.mjs:631-651` `projectPromotion` reads the `reading` object in the promoted `data/provenance.json`). INFO-2026-0042 was promoted when only parts existed, so it holds no `readings` row. After the bytes arrive nothing ever calls extraction for that bundle. The "Read this document again with OCR" control then answers 409 `REEXTRACT_NOT_READ` (`extraction/index.mjs:1388-1392`, which needs a stored reading to replace), so even the member's own repair door is shut.
- The earlier fix (round 2) only made new captures whole; it has no repair path for a record that already exists, and one capture has one home (provenance R2, `CAPTURE_HELD_BY_ANOTHER_BUNDLE`), so the second capture can never file a repaired copy either.

Owner: `extraction` (the reading) with the control-plane door that already chains acquire to extraction (`control-plane/index.mjs` `readUploaded`/`acquireReadingOp`, :2346-2355). Requirement ids: extraction R1, R19, R20, R31; provenance R2; acquisition R10, R11; screens-intake R49.

Proposed fix
- New extraction act (internal, called by the door): `readHeld({sha})`: if the register has a home bundle, no `readings` row for the sha, and the evidence store now holds an object under the sha, run `read()` on the stored document (`#storedDocument`) and `writeReading` for that bundle. Call it from the control-plane door after an `acquire` (and after `captureupload`) that answers `existed: true`, and from `keepWhole`'s success when the sha is registered. It is idempotent and writes no new bundle.
- Also draw the honest sentence meanwhile: `doneAcquire` should say when the home has no reading ("this copy was kept in pieces and is being read now"), not link silently.
- One-off for the live copy: INFO-2026-0042 repairs itself on the next capture of the same address once the door calls `readHeld`.
Requirement change: extraction gains the act and its R20 gains "a reading is also written for a registered home that has none, once its bytes are held whole"; acquisition R11's `existed` arm names the call.

---

## 3. C17 (new): a project-less member photo is never read; OCR answers 409 first and explains after

What the requirements say
- Upload R86 / screens-intake R21 promote an upload as an information bundle at `collected`, and control-plane R100 hands a new upload to extraction's reading regardless of project (`control-plane/index.mjs:2339-2355`). Nothing in the requirements makes reading depend on a project, and project-less bundles are visible to every member (membership `viewerPredicate`, the "outside" arm, `membership/index.mjs:85`).
- The sentence the page prints after the 409 ("A copy is read when it is filed in a project you are part of", word key `screen.document.ocr.refused.unread`, rows.mjs:9376) states a rule found in no requirement. If it is a rule it is undeclared; if the reading should exist it is a bug.
- extraction R31-R35 and the code (`extraction/index.mjs:1388-1392`) refuse a re-read when no reading is held (`REEXTRACT_NOT_READ`): there is nothing to replace.

Root cause on the page (certain): `bio-plane/src/screens-inquiry/document.mjs`
- :214 `textState = ... reading.state === "empty" ? "unread" : ...`. For a copy with no reading `textState` is "unread".
- :400 `if (textState && textState !== "full" && sha && !incomplete)` draws a re-read act for "unread" as for "none"/"partial".
- :389-399 `isPicture` is derived from the READING (`rv0`, content type/format), which is null for an unread copy, so a photograph with no reading is taken for a PDF and gets the `pdfstructure` act (:404). That act can only ever answer 409 here.
So the control is offered exactly when its precondition (a held reading) is false, and the member learns the reason only after the refusal (FC-14 fixed the picture-with-reading case only).

Why the photo has no reading (NOT confirmed): the door reads a new upload (R100) and the screen promotes the answer's document, so a reading should exist. The candidates, in order: (a) the member's upload answered `existed` or came without `reading` (a refused or failed read relayed "as the failed reading" while "the upload stands", :2341-2344) and was promoted without it; (b) `readingFor` withheld the reading from the viewer, because a viewer carrying a project is admitted only to that project's reach (`projectGate`, `membership/index.mjs:121-131`: `b.bundle_id = ? OR b.project = ?`), and a project-less bundle has `project = ''`, so it is outside every carried project. Settle with two reads of the live copy: `op=reading&sha256=<the photo's sha>` as the member and as the administrator. If the administrator sees a reading and the member does not, it is (b), owner `membership` R149/R150 (a project-less bundle must be in a project-carrying member's reach when the member captured it) and `extraction` readingFor. If neither sees one, it is (a): the door should refuse to promote an upload whose reading failed, or say so.

Owner: `screens-inquiry` (document) for the control; `control-plane` R100 / `extraction` / `membership` for the missing reading (pending the probe). Requirement ids: screens-inquiry R96 (C17/C21), R3; extraction R31-R35, R71; control-plane R100; screens-intake R2, R21; membership R43, R149.

Proposed fix
1. document.mjs: draw a re-read act only when a reading is held (`rv0 !== null`: textState "none" or "partial"). When textState is "unread", draw instead, up front, one sentence: that no reading exists, why in the member's words, and the door that works: for a picture the typed-page door ("Type the words yourself", drawn already for pictures), plus "File it in a project" if the rule below stands. Decide picture-ness from the document's own record (the receipt's name and type, available from the same page reads), not from the reading.
2. If a project really is required for reading, state it as a requirement (screens-intake R2/R21: "a file with no project is held unread; the capture screen says so at capture, and offers the project choice") and say it at capture, not after a 409. If it is not (the likely intent), fix the reading per the probe.
Requirement change: screens-inquiry R96/R3: "an act that re-reads is drawn only when a reading is held; an unread copy says so and why". screens-intake R2: the result line for a project-less upload states whether it was read.

---

## 4. C9: capturing an address the team already holds files nothing under the current project

What the requirements say
- screens-intake R22: a capture opened with a project or question as subject "files what it captures there" (the bundle names that project).
- screens-intake R49 (not yet met, amended in fix round 2): when `existed: true` and a visible document holds the bytes, "link it ... and the capture is also recorded as made for the question ... so the question's project lists it"; when none shows, promote for the viewer; when the bytes have another home, name the holder and link it.
- provenance R2 / Intake Doctrine §8: one capture, one home, the original's. So a second filing cannot move or copy the document; the project has to hold a reference to it.

Root cause (certain)
1. `screens-intake/capture.mjs:411-416` `doneAcquire`: after `homeOf` finds a visible home it sets `captured` and returns. It never records the capture as made for the question (R49's own clause) and never files anything for a PROJECT subject (R22), which R49 does not cover (it speaks of the question only).
2. Even if it did record `captured_for`, the project's list would not show it: `capture/index.mjs` `heldCaptures({project})` (R77) filters by the bundle's own project (`provenance.homeOf` / `b.project`), and `captured_for` (R94) is read only to label rows (`#shown`), never to select them. R49's sentence "so the question's project lists it" is therefore unimplemented in the owning module as well. The walker's evidence: the project's list showed example.org and three photos, not acgov.org.

Owner: `screens-intake` (capture) for the call, `capture` (R77, R94) for the listing. Requirement ids: screens-intake R22, R49, R50; capture R77, R83, R94; provenance R2; acquisition R47.

Proposed fix (smallest that keeps one home)
1. capture: a second kind of "seen in" row beside `captured_for`: `recordSeenIn({captureSha, project, by})`, table `seen_in(capture_sha, project, by, at)`, idempotent on (sha, project). `heldCaptures({project})` selects `bundles.project = ? OR bundle_id IN (SELECT register home of seen_in.capture_sha WHERE seen_in.project = ?)` and marks such a row `also_here: true` with its home project, still gated by membership sight of the home bundle (the viewer must see the document; a hidden home gives the holder sentence of R49, not a listing).
2. screens-intake `doneAcquire` and `doneUpload` (`:411-416`, `:569-575`): on a visible home, call it for the subject's project (and `recordCapturedFor` for the question, as R49 already says) and say "Filed here as well; it stays held under <the first project>". This also gives C10's "second sighting" a project to appear in.
3. For a hidden home, keep R49's holder-naming path.
Requirement change: screens-intake R49 extended to the project subject (R22) with the sentence above; capture R77 amended (project list includes documents seen there; `also_here`), R94 sibling requirement for `seen_in`, declared to record-core's purge as capture's tables are (R74, R87). Provenance R2 unchanged (one home). This is a doctrine-adjacent point (a document may now be listed in two projects while it has one home), which BOB can rule as a detail of the existing doctrine; if BOB thinks it widens Intake Doctrine §8 it goes to Bob with options: (a) this reference row, (b) refuse and tell the member where the document lives, (c) copy the document.

---

## Summary table

| Cause | Root cause | Owner | Fix |
|---|---|---|---|
| C84 | stored error is from deleted code; new freshclam path never ran; no door starts a run | file-scanner + file-safety | `/mirror?async=1`, admin act `scanmirror`, self-start when none, parse new error |
| C5 read | `keepWhole` read-back and double write inside the 25 s read stage | acquisition | keep parts in memory, one put, time `keep` stage |
| C5 repair | `existed` arm only links; nothing reads a home that has no reading | extraction + control-plane | `readHeld({sha})` after existed/keep, idempotent |
| C17 | OCR act drawn for an unread copy; picture-ness taken from the missing reading | screens-inquiry (+ probe for missing reading) | draw re-read only when a reading is held; say why unread; probe `op=reading` |
| C9 | `doneAcquire` links only; project list selects by home only | screens-intake + capture | `seen_in` reference row, listing includes it |
