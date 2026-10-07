# Draft · T36 · the virus package's two modules: `file-scanner` and `file-safety`

**Status** · DRAFT by a drafting worker for BOB #128, 2026-10-07, on `tranche/T35`, for BOB's review (P18). Not applied: nothing here is in `modules.json` or `build/requirements/` until BOB applies it at T36's opening (N706, N707). Bob's decisions are fixed and cited: K1888, K1890, K1892, K1895, K1913 (with K1852 (1), K1882, K1903). Sources read: PROCESS-MECHANICS §3, §12; `requirements/README.md`; `next.md` N706, N707; `current.md` "Proposed modules for the virus package"; `study-virus-scanning.md`; `study-scanner-N705.md`; `agent-runner.md`, `sheet-worker.md`; the public parts of the providers (T35's `active` lists: office-readers R32/R33, pdf-reader R36, odf-reader R47, ooxml R27–R33). Ids may be renumbered until Bob approves (README 6).

## 0. For BOB: questions for Bob, decisions taken, conflicts found

**Questions for Bob (they change meaning: who may open what).** Each draft requirement below is written to the recommendation and marked *(Q<n>)*.
- **Q1 · What is "low risk".** K1888 (3) grades a file from its source and contents; the table is open. *Recommended:* low only when (a) the copy fetched it itself (direct, Drive export, render or web-archive arm), or it is a member cut from an archive so fetched; (b) its format has an `active` list (PDF, Word/Excel/PowerPoint and their macro twins, ODF, CSV) and that list is `[]`, or it is an image or plain text; (c) it is not encrypted; (d) it has no unreleased "found". Everything else is high: a doorbell knock, anything not fetched by the copy, any `active` item (`unread` included), an archive itself, an unknown format. HTML pages are graded by source alone (they are opened as captured pages are today).
- **Q2 · What the deeper check's structure check flags.** If any `active` item flagged, a form or macro workbook could never pass, against K1888 (1)'s purpose (the original's features). *Recommended:* it flags a structure the reader cannot read whole (a refusal, an `unread` item, encryption, an ambiguous container), and the kinds that act outside the document: `launch`, `activex`, `ole-object`, `embedded-file`, `xl4-macrosheet`, `external-target`, a VBA project with any `suspicious` keyword or `undetermined` module; it passes a form's `javascript`, `xfa`, `open-action`, `additional-actions`, `rich-media`, and a VBA project with auto-run names but no suspicious keyword.
- **Q3 · What "a second scanner" releases.** K1888 (4), K1892 say both "any flag keeps the safe view" and "release by two members or a second scanner". *Recommended:* a ClamAV-only "found" is released when a deeper check on the same bytes has Scanii clean and the structure check passing; a Scanii "found" is released only by two members.
- **Q4 · A copy with no scanner** (Distribution §4 rule 4: absence stated, never silent). *Recommended:* while no scanner is installed, a low-risk original opens with "not scanned: this copy has no scanner" stated; a high-risk one keeps the safe view (and nothing opens when the renderer is absent too, but the readers' text).

**Decided by BOB's worker (technical; report to Bob as done, P17).** (1) The safe-view renderer (LibreOffice and a PDF rasteriser) is a second container class inside `file-scanner`, so the package stays two modules. (2) It renders PDFs too: `pdf-pixels` refuses any page with text or vector marks (its R16, R17), so it cannot make a safe view; `file-safety` does not use it (the sketch's "via `pdf-pixels`" is replaced). (3) Presentations and ODF text go the Word route; spreadsheets (OOXML, ODS, CSV) are shown as data (K1888 (4)). (4) The state is called a **scan hold** and its act `releaseScanHold`, never "hold"/"release": both words already mean Intake §4a's collected-to-verified release and `capture` R77–R81's held captures. (5) A clean deeper check opens the original to any member who may see it, by an explicit override, for 24 hours (K1888 (3)'s "fresh"); the override is not recorded, since no record of who opened which file is kept (K1892). (6) Limits (K1881, BOB's): scan size 256 MiB (acquisition R10's cap), re-scan every 7 days, signatures older than 72 hours refused, 900 deeper checks a month (under Scanii Basic's 1,000), safe view 500 pages at 150 dpi. (7) No MalwareBazaar lookup: Bob's deeper check names three checks only; nothing leaves the account but the deeper check's Scanii call. (8) `file-safety` also uses `odf-reader` (its R47 `active`), `file-scanner` (its constants and answer shapes) and `record-grammar`, `test-support`.

**Conflicts with existing requirements.** (a) `pdf-pixels` R16–R17 (above, (2)). (b) The words "hold"/"release" (above, (4)). (c) `capture` R21's `getCapture` serves any capture's bytes to whoever reaches `op=capture`: the member's opening must be routed through `file-safety.openOriginal` (control-plane's entry), or the gate is bypassed. (d) Outside-service keys live in `credentials` (its R29, acquisition R36), but N706 puts Scanii's key in the scanner Worker's secrets, since a layer-1 module cannot reach `credentials`: two homes for keys; kept as N706 says. (e) Distribution §4's members "write nothing" in practice (`sheet-worker` R10, `ocr-worker` R15); `file-scanner` writes its signature mirror (K1913), bounded to its own prefix (its R15).

## 1. `modules.json` rows

```json
{"id": "file-scanner", "layer": 1, "paths": ["file-scanner/"], "tests": ["file-scanner/test/"], "uses": ["runtime-limits", "bundler", "test-support"]},
{"id": "file-safety", "layer": 3, "paths": ["bio-plane/src/file-safety/"], "tests": ["bio-plane/test/m/file-safety/"], "uses": ["record-grammar", "test-support", "pdf-reader", "ooxml", "office-readers", "odf-reader", "file-scanner", "record-core", "membership", "provenance", "acquisition", "capture"]}
```

- **`file-scanner`**: last in layer 1, directly after `sheet-worker` (K1913: beside it, a fleet member with no plane import; last so no layer-1 module moves and every provider, `runtime-limits`, `bundler`, `test-support`, is earlier). The directories are created by its job (K1043's form until then).
- **`file-safety`**: layer 3 directly after `capture`, before `sources` (K1913): it registers on `provenance`'s receipts and reads `capture`'s and `acquisition`'s facts, and no layer-3 module needs it. Every use is earlier in the order.
- `status` gains one AMENDED sentence naming K1913, N706, N707 and these two rows.

## 2. `build/requirements/file-scanner.md`

**Status** · DRAFT (this file, §0). New module and fleet member, layer 1, last. Plan entry N706 (K1913); every id new and not yet met (T36). **Size (P6).** About 600–900 lines with tests, plus two container images (built artifacts, PROCESS-MECHANICS §14).

### Public · Purpose

A fleet member in the group's own Cloudflare account, reached only through the plane's `FILE_SCANNER` binding. Given a capture's digest, it reads a duplicate of the stored bytes itself and answers ClamAV's verdict with its signature versions, a Scanii verdict for a deeper check, or a safe view rendered as page images. It keeps ClamAV's signatures mirrored daily in the group's R2, holds no record, and never writes, moves or changes a capture (K1888, K1892, K1895, K1913).

### Provides

Terms. A **target** is `{capture_sha, parts}`: `capture_sha` 64 hex; `parts` `null` for a single object or `[{sha256, bytes}]` in order (`provenance.partsNamed`). A **store** is `"bio"` or `"scratch"`. A **verdict** is `{capture_sha, engine, engine_version, signatures, scanned_at, result, name?, findings?, reason?, detail?}`, `result` one of `clean`, `found` (with `name`, or `findings` for Scanii), `unknown` (the engine could not decide, `detail`), `not_scanned` (with `reason`).

**POST /scan** `{store, targets}` → `{ok:true, verdicts}` | `{ok:false, code}`
- **R1** Request checks, before R2 is addressed: `store` exactly `"bio"` or `"scratch"`, else `NAMESPACE_UNKNOWN` (400); `targets` an array of 1 to `SCAN_BATCH_MAX` targets, else `BAD_BATCH` (400); a target with a malformed digest or parts is answered `not_scanned` with `reason:"BAD_TARGET"`; no `CAPTURES` binding answers `R2_NOT_CONFIGURED` (503).
- **R2** Each target is read from R2 (`${store}/captures/<sha>`, or each part in order with its own digest checked) into the container as a copy; the SHA-256 of the whole must equal `capture_sha`. Otherwise `not_scanned` with `reason` `NOT_FOUND`, `DIGEST_MISMATCH` or `TOO_LARGE` (over `SCAN_MAX_BYTES`, nothing read).
- **R3** One verdict per target, in request order, from ClamAV (`engine:"clamav"`, `engine_version`, `signatures` `{main, daily, bytecode, published}` as the loaded set states them, `scanned_at` an ISO instant). A failure on one target never fails the batch. Archives and documents are scanned inside (ClamAV's archive, OLE2, PDF and HTML scanning on); a file over ClamAV's own size or recursion limits is `unknown` with `detail:"LIMIT:<name>"`, never `clean`.
- **R4** Only the mirrored signatures are used (R6). With none mirrored every target is `not_scanned`, `SIGNATURES_ABSENT`; when the newest set was published more than `SIGNATURES_MAX_AGE_MS` before the scan, `SIGNATURES_STALE`. The set is loaded once per request.

**POST /deep** `{store, target}` → `{ok:true, verdict}` | `{ok:false, code}` (the Scanii adapter; K1895)
- **R5** R1 and R2's checks for one target; then the bytes are sent to Scanii's file endpoint in the region the group configured, with the group's own key and secret in an `Authorization` header, never in an address (K1874). The request carries the bytes and nothing else: no file name (a fixed neutral part name), no address, no member, no callback, no metadata. Answer: `engine:"scanii"`, `findings` as Scanii lists them, `result` `found` when any finding is a malware finding, else `clean`; `not_scanned` with `NOT_CONFIGURED` (no key, secret or region: nothing is sent), `SERVICE_REFUSED` (with the status) or `SERVICE_UNREACHABLE`; `scanii_id` the service's id for its result record.

**The mirror**
- **R6** Once a day (the member's own scheduled trigger) and on `POST /mirror`, it fetches ClamAV's signature databases from the official database service, as `cvdupdate` does (never `curl` scripts, freshclam FAQ), checks each file's digital signature, and only then writes the set under `clamav/` in the group's bucket, replacing the previous set only after the new one is complete and verified. A failed run leaves the last good set and is stated in `/version` (R8). `POST /mirror` answers `{ok, versions, published, error?}`.

**POST /render** `{store, target, route}` → a PDF | `{ok:false, code}` (the safe view; K1888 (4))
- **R7** `route` is `"pdf"` or `"office"` (Word, presentation, ODF text). The answer is a new PDF whose every page is one image of the source page rendered at `SAFE_VIEW_DPI`, and nothing else of the source: no text layer, script, action, link, form, attachment or metadata. Headers state `x-derived-sha256`, `x-pages`, `x-source-pages` and `x-truncated` (pages beyond `SAFE_VIEW_PAGES_MAX` are not rendered). Refusals by name: R1, R2's, `ENCRYPTED`, `NOT_RENDERABLE`, `TIME_LIMIT`, `RENDER_FAILED` (with the converter's message, at most 300 characters).

**GET /version**, anything else
- **R8** `GET /version` answers `{ok:true, name:"file-scanner", version, clamav_version, signatures:{versions, published, mirrored_at, last_attempt, last_error}, scanii:{configured, region}, renderer_version, bounds}`; `version` from the running build; `configured` never reveals the key.
- **R9** Any other method or path is refused 404 `UNKNOWN`.

**The fleet member**
- **R10** The module defines the Worker hosting two container classes: `FileScanner` (ClamAV; `standard-1`, 4 GiB) and `SafeViewRenderer`; R1–R9 answer through the binding. Its `fleet-member.json` states `kind:"container"`, each image by a digest-pinned reference with its base pinned by digest, `bundle`, `class_name`s, `max_instances`, `bind` (`FILE_SCANNER`) and the scheduled trigger, as `agent-runner` R13–R14 do, so `bundler` lists, describes and deploys it.

### Private · Uses

- `runtime-limits`: `makeMeter` (the time limits), `sha256hex` (R2).
- `bundler`: `writeMember`, `verifyFresh` (R10).
- `test-support`: the fleet member's harness and fixtures.

### Invariants

- **R11** It never writes, moves, renames, tags or deletes an object under `captures/`; its only writes are R6's, under `clamav/`. A test reads every storage call in its sources and finds no other key.
- **R12** Egress: the scanning and rendering containers open no connection; the mirror run reaches only ClamAV's database host; R5 reaches only Scanii's API host for the configured region. Each is declared in the member's own configuration and read by a test.
- **R13** Nothing but the bytes leaves (R5). The key and secret are Worker secrets, never written, logged or echoed; a sentinel-secret test finds them in no output.
- **R14** It holds no record and nothing survives a request but the mirror: each scan or render runs on a fresh temporary copy, deleted when the request ends. The same bytes and signature set give the same verdict.
- **R15** The namespace set is exactly `["bio", "scratch"]`, exported frozen as `NAMESPACES`, with `PLANE_OPS` (empty), as `sheet-worker` R11.
- **R16** Limits, exported by name and stated in its bundle as `bio-member-limits/1` (as `sheet-worker` R17): `SCAN_MAX_BYTES` 268,435,456; `SCAN_BATCH_MAX` 200; `SIGNATURES_MAX_AGE_MS` 259,200,000 (72 h); `SAFE_VIEW_DPI` 150; `SAFE_VIEW_PAGES_MAX` 500; and the time budgets measured at the job.
- **R17** Tested offline: the EICAR test file is `found`; a clean corpus PDF, a `.docm` and a ZIP holding EICAR give `clean`, `clean`, `found`; Scanii is a stub that asserts R5's request carries no name; the renderer's PDF holds images only. A live Scanii test is a release measurement.
- **R18** No place is named in its behaviour or outward text.

### Satisfies

- `BIO_Distribution_v0_1.md` §4 (the fleet rules: own release, a stated absence), §5 (the installer installs it).
- `BIO_Intake_Doctrine_v1_1.md` §2 (the bytes as served are kept unaltered: it reads a duplicate), §3 (no grade is touched).
- Bob's K1888 (4), K1890, K1892, K1895, K1913.

### Suggestions

- ClamAV's official image (`clamav/clamav`, pinned by digest) with `clamd` loading from the mirror; the mirror run in the container with `cvdupdate`. LibreOffice headless to PDF, then a rasteriser (Poppler's `pdftoppm`, GPL, in its own image) and an image-only PDF writer, after Dangerzone's design. Scanii's endpoints: `api-<region>.scanii.com/v2.2/files` with HTTP basic auth (study N705 §2.1).

## 3. `build/requirements/file-safety.md`

**Status** · DRAFT (this file, §0). New product module, layer 3, directly after `capture`. Plan entry N707 (K1913); every id new and not yet met (T36). **Size (P6).** About 1,500–2,200 lines with tests.

### Public · Purpose

Keeps every captured file safe to open without touching its bytes, digest or grade: scan-verdict notes beside each capture, a per-file threat grade from its source and contents, a safe view, a scan hold on a "found" verdict released by two members or a second scanner, the weekly re-scan and one before first opening, and a member's deeper check before a high-risk original opens. It keeps no record of who opened which file (K1888, K1890, K1892).

### Provides

Terms. A **file** is one capture the record holds, named by its digest. A **note** is `{note_id, kind:"scan"|"deeper", engine, engine_version, signatures, scanned_at, result, name?, findings?, reason?, checks?}`. The **threat** is `"low"` or `"high"`. Settings come from `record-core`; the scanner is `FILE_SCANNER` (`file-scanner`).

**Intake**
- **R1** (K1888 (2)) Every acquisition receipt (`provenance.onReceipt`) puts its capture in the scan queue and, when it has a safe-view route (R13), the render queue: a direct, Drive, archive or render fetch, a pulled knock, and each member of an unpacked archive, which is its own capture (K1852 (1), K1882). One row per digest. Nothing here delays, changes or refuses the capture or its answer, and a failure here never fails the receipt.

**Notes**
- **R2** `verdictNotes({captureSha, viewer})` → `{ok:true, notes}` oldest first, or `NO_SUCH_CAPTURE`, or membership's sight refusal when the viewer may not see the capture.
- **R3** Notes are append-only: none is changed or removed but by the purge of the capture's bundle (R25). A re-scan adds a note. `unknown` and `not_scanned` are never read as `clean` by any service here.

**Scanning**
- **R4** `scanBatch({limit, at})` (`op=scanbatch`; the scheduler's daily wake, an administrator or daemon) sends the due files, oldest due first, at most `limit` and `SCAN_BATCH_MAX`, to `/scan` in one request, and writes one note per verdict. Due: never scanned, or the newest ClamAV note older than `RESCAN_INTERVAL_MS` (7 days; K1888 (4)'s weekly re-scan). Answer `{ok:true, scanned, found, not_scanned, remaining}`. With no scanner bound: `{ok:false, code:"SCANNER_ABSENT"}` and no note (Q4).
- **R5** `scanStatus({viewer})` (administrators) → `{scanner, renderer, signatures_age_ms, queued, overdue, held, deeper_this_month, deeper_budget}`: `overdue` counts files due for more than a day, so a lag is stated, never silent.

**The threat grade** (K1888 (3), K1890)
- **R6** `threatOf({captureSha, viewer})` → `{ok:true, threat, reasons, source, format, active, scan_hold, latest_scan, latest_deeper, safe_view}`, computed at the call from the capture's receipt and its reader's `active` list, never stored as a fact of the capture. *(Q1)* `low` only when every condition holds: the receipt's route is a fetch by this copy (direct, Drive, render, web archive) or the file is a member of an archive so fetched; the format is one with an `active` list (`pdf-reader` R36, `office-readers` R32–R33, `odf-reader` R47) and it is `[]`, or the format is an image or plain text, or HTML (by source alone); it is not encrypted; it is under no scan hold. Otherwise `high`, with each reason named: `source_not_fetched`, `active:<kind>` (one per kind), `unread`, `encrypted`, `archive`, `format_unchecked`, `scan_hold`.
- **R7** The same capture and notes always give the same answer; no note or grade changes the capture's grade letter (`provenance.captureGrade`), its state or its provenance document.

**Opening the original** (one click from the safe view, K1888 (4))
- **R8** `openOriginal({captureSha, viewer, override})` answers the capture's bytes exactly as `capture.getCapture` serves them, digest header equal to `captureSha`, or the first refusal that applies: `NO_SUCH_CAPTURE`; the sight refusal; `SCAN_HOLD` (R16); then, for a `low` file with no ClamAV `clean` note newer than `RESCAN_INTERVAL_MS`, an on-demand scan first (the scan before first opening): `found` places the hold and answers `SCAN_HOLD`, `not_scanned` or `unknown` answers `NOT_SCANNED` with the reason (*Q4*: with no scanner bound the bytes open, stated `not_scanned:"SCANNER_ABSENT"`), and a scan not finished within the call answers `SCAN_PENDING`; for a `high` file, `SAFE_VIEW_ONLY` unless `override` is `true` and a deeper check (R12) ended `clean` less than `DEEPER_CHECK_FRESH_MS` (24 h) ago with no `found` note since, which opens it to any member who may see it.
- **R9** `originalState({captureSha, viewer})` → `{may_open, why}`: what R8 would answer now, without opening, scanning or serving anything (the warning before opening, the screens' share).
- **R10** (K1892) No record of who opened, downloaded or asked about which file is kept: no table, note, counter or log line of this module holds a member's identity beside a file for R2, R6, R8, R9, R11 or R12. A test opens files as two members and finds neither member's id in any row this module wrote or any line it logged.

**The safe view** (K1888 (1), (4))
- **R11** `safeView({captureSha, viewer})` → by route: PDFs and office documents (Word, presentations, ODF text) `{kind:"pdf", derived:true, of, sha256, pages, source_pages, truncated, original}`, the image-only PDF of `file-scanner` R7; spreadsheets (OOXML and its twins, ODS, CSV) `{kind:"data", derived:true, of, sheets:[{name, cells:[{ref, value, type}]}], original}`, the cached values the readers read, no formula computed, no link followed; `original` is R9's answer. Refusals: `NO_SAFE_VIEW` (another format), `SAFE_VIEW_PENDING`, `SAFE_VIEW_FAILED` with the renderer's reason, `RENDERER_ABSENT`, and R8's first two.
- **R12** `renderBatch({limit})` (`op=renderbatch`; the scheduler's wake) renders queued files after their capture, never inside the capture's act. A rendered view is stored under its own digest outside `captures/`, labelled derived and naming its original; it is never registered (`provenance`), never a capture, never graded and never in a provenance chain. A file under a scan hold still gets and serves its safe view (K1892: "any flag keeps the safe view").

**The deeper check** (K1888 (1), K1892, K1895)
- **R13** `requestDeeperCheck({captureSha, viewer})` (any member who may see the file) → `{ok:true, state, check_id}` (`queued`, `running`, or `done` with its note), or the sight refusal, or `DEEPER_CHECK_BUDGET_SPENT` past `DEEPER_CHECKS_PER_MONTH` this calendar month (UTC). A check already queued or running answers it. Who asked is not kept (R10).
- **R14** The check runs three checks on the same bytes: the structure check (the file's reader reads it whole: *(Q2)* it flags a refusal, an `unread` item, encryption, an ambiguous container, and the kinds `launch`, `activex`, `ole-object`, `embedded-file`, `xl4-macrosheet`, `external-target`, or a VBA project with any `suspicious` keyword or `undetermined` module); ClamAV, on demand; Scanii (`/deep`). Its note `kind:"deeper"` lists `checks:[{check, result, detail}]` and `result`: `clean` only when all three are clean, `flagged` when any flags (the safe view stays), `incomplete` when any could not run (Scanii not configured, scanner absent, `unknown`); `incomplete` never opens an original.

**Scan hold and release** (K1888 (4), K1892)
- **R15** `scanFindings({after, limit, viewer})` → `{findings:[{captureSha, note_id, engine, name, at}], cursor}`: every `found` note in order, for the notices of a finding; no member is named.
- **R16** A `found` note from any engine places the file under a scan hold: its original does not open (R8); its safe view, its place in the record, its promotion state and its grade are unchanged. A hold names the finding names it covers.
- **R17** `releaseScanHold({captureSha, by, reason})` (an act of record, not a download log): refused `MACHINE_CANNOT_RELEASE` for a machine or AI identity, `NO_REASON` for an empty reason or one over 2,000 characters, `NOT_HELD`, `SAME_MEMBER` when `by` made the hold's pending act. The first act answers `{state:"pending_second"}`; a second by a different member releases it, `{state:"released", by:[a, b]}`.
- **R18** *(Q3)* A hold whose findings are ClamAV's alone is released by a second scanner when a deeper check on the same bytes has Scanii `clean` and the structure check passing, `{released_by:"second_scanner", note_id}`; a Scanii finding is released only by R17.
- **R19** A release covers the finding names its hold named; a later note finding another name places a new hold.

**Archives** (K1852 (1), K1882)
- **R20** Each file cut from an archive is scanned, graded, held and released as its own file; its source for R6 is the archive's. The archive is also scanned as itself; a finding in it holds the archive only.

**Its constants**
- **R21** Exported by name: `RESCAN_INTERVAL_MS` 604,800,000; `DEEPER_CHECK_FRESH_MS` 86,400,000; `DEEPER_CHECKS_PER_MONTH` 900; `SCAN_BATCH_MAX` (`file-scanner`'s).

### Private · Uses

- `record-grammar`: the digest and instant forms. `test-support`: fixtures.
- `pdf-reader` (R2's `active`, R36), `office-readers` (`active`, R32–R33; the cells of R11), `odf-reader` (`active`, R47), `ooxml` (the macro twins' `variant`, R10): the structure check and R6.
- `file-scanner`: `SCAN_BATCH_MAX`, the verdict and target shapes; reached through the `FILE_SCANNER` binding.
- `record-core`: its tables, `transact`, `declarePurge`, `evidenceStore`, `getSetting`, `registerCounts`.
- `membership`: sight (who may see a capture), identity class (R17).
- `provenance`: `onReceipt` (R1), `homeOf`, `partsNamed`, `receipts` (R6's route), `captureGrade` (R7's test).
- `acquisition`: the unpack's link from a member to its archive (R20) and the receipt's route names.
- `capture`: `getCapture` (R8), the knock's origin (R6).

### Invariants

- **R22** The capture's bytes, digest, register entry, grade, promotion state and provenance document are byte-identical before and after any act of this module; a test compares them across scan, hold, release, render and deeper check.
- **R23** No member identity, file name, address or record text reaches `file-scanner` in any request: only the store and the target.
- **R24** Every refusal is named in this module's own table, with its translation.
- **R25** Its tables are declared to `record-core.declarePurge`: a bundle's purge removes its notes, holds and safe views.
- **R26** No place is named in its behaviour or outward text.

### Satisfies

- `BIO_Intake_Doctrine_v1_1.md` §2 (the intake contract: the bytes as served are kept; every derived file says so), §2a (the doorbell: material from anyone), §3 (grades never revised by a scan; members of a captured archive, K1852), §4 (constraints as security controls), §4a (release by named members, the model of R17).
- `BIO_Membership_Architecture_v2.md` (who may see a capture: membership's sight).
- `BIO_Distribution_v0_1.md` §4 rule 4 (a member's absence stated: R4, R8, R11).
- Bob's K1888, K1890, K1892, K1895, K1913.

### Suggestions

- The structure check reuses the readers' `structure()` answers already held where `reading-pipeline` keeps them; reading again is allowed.
- The on-demand scan of R8 is a `/scan` request of one target; a short wait (a few seconds) before `SCAN_PENDING` suits the screens.
- Not here: the assistant's rule (text and `active` only) is `skills` and `agent-worker`'s (T35-46, T35-50).

## 4. The later users (each its own entry at T36's opening)

- `scheduler`: the daily wakes of `scanBatch` and `renderBatch` (`file-safety` R4, R12).
- `op-grades` (or `affordances` if T35's split has not landed): the grades of `releaseScanHold` and `requestDeeperCheck`, and of `openOriginal` with `override`.
- `notice-producers`: a "found" finding (`scanFindings`, R15) to the members who may see the capture.
- `op-declarations`: `scanbatch`, `renderbatch`, `scanstatus`, `verdictnotes`, `threatof`, `openoriginal`, `originalstate`, `safeview`, `deepercheck`, `releasescanhold`, `scanfindings`.
- `control-plane`: dispatches those ops and routes a member's opening of an original through `openOriginal`, never straight to `capture`'s `op=capture` (conflict (c)); its `FILE_SCANNER` binding.
- `installer`: installs `file-scanner` (two containers, its cron, the `clamav/` prefix) and asks for Scanii's key, secret and region as the member's secrets, with the EICAR test (study N705 §3).
- The design stream: the warning before opening, the safe view's label and its one click to the original.
