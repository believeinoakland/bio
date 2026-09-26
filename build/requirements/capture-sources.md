# capture-sources — requirements

**Status** · DRAFT for BOB #41, 2026-09-26 (P18 preparation), from a drafting worker's reading of the code; for BOB's review. Layer 3. Code today: its own files, `bio-plane/src/render.mjs` (the rendered capture's record), `bio-plane/src/browserrender.mjs` (the in-plane CDP renderer), `bio-plane/src/cdx.mjs` (the web-archive index) and `bio-plane/src/drive.mjs` (the Google Drive host stack); no extraction from a legacy module. Not yet met: R26 (old-plan row D-570, owner this module: the quiet-window wait), R37 (the archive lookup speaks Memento; `ARCHIVE-FALLBACK.md` §Build to Memento, not to Wayback, [ABSENT]) and R36 (the archive hop's evidence omits the CDX `urlkey`; found in drafting, no row).

## Public

### Purpose

The source-specific halves of capture that decide what a fetch from a particular kind of source is and what its record says, with no store of their own: a client-rendered page (the renderer seam, an in-plane browser driver, and the `render` block and authority a rendered capture records), a web archive (reading its index, choosing the capture that may stand in for a document, and the archive's provenance hop), and Google Drive (recognising an address, composing its OpenDocument export, the export's hop and conversion step, and whether a held baseline is Google's shell). `capture` does the fetching, storing and filing; this module supplies the rules.

### Provides

#### Rendered capture: the record (`render.mjs`)

**Constants**
- **R1** `RENDER_DEFAULTS`, frozen: `navigation_timeout_ms` = `RENDER_NAVIGATION_TIMEOUT_MS` = 10,000 (measured, M-151), `viewport` 1280 × 800, `dpr` 1, `locale` "en-US" (Q2), `timezone` "UTC", `wait` `{until: "networkidle", timeout_ms: 15000}`. `RENDERED_METHOD` = "rendered". `NON_DATA_TYPES` = `{script: "code", stylesheet: "layout", font: "layout"}`; every other type, including one never seen, is data.
- **R2** `RENDER_TICK_UNDETERMINED` = "content undetermined — not watched: this source renders its content in the browser" and `RENDER_INCOMPLETE_READING` = "render may be incomplete (wait timed out)": the one copy of each sentence, which the record, the provenance assertion and the monitor read.

**waitFiredClass(fired, askedWait) → "condition" | "timeout" | "undetermined"**
- **R3** Of `fired` trimmed and lowercased: "timeout" when it matches `/timed?[ _-]?out|timeout/` (e.g. "timeout", "timed out", "time-out"); "condition" when it equals `askedWait.until` (trimmed, lowercased); "undetermined" otherwise, including a non-string or empty `fired` and a word never seen. Never throws.

**completenessReading(render) → string | null**
- **R4** `null` unless `render.completeness` is "undetermined"; then `RENDER_INCOMPLETE_READING` when `render.wait.fired_class` is "timeout", else "render completeness is undetermined (which wait ended the render was not established)". Never throws.

**renderAllowanceMs(env), renderConcurrencyCap(env), renderReserveMs(asked) → number**
- **R5** `renderAllowanceMs` answers `env.RENDER_DAILY_ALLOWANCE_MS` floored when it is a finite number ≥ 0, else `RENDER_DAILY_ALLOWANCE_MS_DEFAULT` (1,200,000: 20 minutes a day, derived from the vendor's stated 10 browser-hours a month and labelled as theirs).
- **R6** `renderConcurrencyCap` answers `env.RENDER_CONCURRENCY_CAP` when it is a positive whole number, else `RENDER_CONCURRENCY_CAP_DEFAULT` (10, the vendor's stated included concurrency, labelled as theirs); a 0 or a malformed value falls back, never meaning "no renders" or "no cap".
- **R7** `renderReserveMs` answers ceil(wait timeout + navigation timeout) of `asked` (default `RENDER_DEFAULTS`), each term falling back to `RENDER_DEFAULTS`' own when it is not a finite number ≥ 0: a render's maximum cost, reserved at admission.
- Errors: none throws.

**keepRenderBodies(answer, {put, sha256}) → Promise<[entry | null]> | null**
- **R8** `null` when `answer.requests` is not an array. Otherwise an array aligned with `answer.requests`: `null` for a request that is not a completed load (no digest is owed). For a completed load: bytes from `body_base64` (`body_as: "bytes"`) or `body_text` UTF-8 encoded (`body_as: "decoded_text"`); hashed with `sha256`, stored with `put(digest, bytes)`, and only then answered `{sha256, bytes, body_as, kept: true}`.
- **R9** A completed load whose bytes are not kept answers `{sha256: "undetermined", digest_reason}`, the reason naming which: no body delivered (with the renderer's own `body_unavailable` words), invalid base64, over `SUBRESOURCE_MAX` bytes, past `SUBRESOURCE_CAP` kept bodies, past `SUBRESOURCE_BUDGET` total bytes, or `put`/`sha256` failing (its message). Bytes held only in memory are never given a digest. A 64-hex `sha256` the renderer reported is kept as `renderer_sha256`, beside either outcome, and never as the digest.
- Errors: never throws; a failing `put` or `sha256` becomes R9's entry.

**originKey(u) → string | null**
- **R10** `scheme//host` of `u`, or `null` when unparseable.

**renderBlock(answer, {pageUrl, shellSha, asked, at, digests}) → `{ok: true, render}` | `{ok: false, problem}`**
- **R11** `{ok: false, problem}` only when the answer is not `ok: true` (naming its `error`) or carries no non-empty `html`. Anything short of that is recorded with its gaps named.
- **R12** `render.requests` counts the requests with a URL by outcome: `made`, `completed`, `failed`, `blocked`, `blocked_by` (per the browser's rule name, "unstated" when none), `outcome_unstated`. `render.subresources` lists every completed load with its digest from `digests[i]` (R8–R9) — or `undetermined` with "the plane did not keep this render's subresource bytes" when none was passed — and, for a hex digest, `bytes`, `body_as` and `digest_by: "plane"`. `render.data` is the completed loads whose lowercased type is not in `NON_DATA_TYPES`, each with `origin`/`host` from `subresources.originOf` against the page's host (`navigated_to`, else `pageUrl`), `approximate` when `originOf` says so, the same digest, and `reported_by: "renderer"`. When the renderer recorded no requests, all three are `null` and `render.undetermined` says so.
- **R13** `render.scripts_executed` is the sorted distinct origins (R10) of the executed scripts; `render.third_party_executed` those whose `originOf` origin is not `same_host` (`same_site` counts as another origin). When the renderer could not record the set, both are the string "undetermined" and `render.undetermined` says so — never an empty list.
- **R14** `render.wait` is `{asked, fired, fired_class}`: the renderer's own word and R3's reading of it. `render.completeness` is "condition_met" only when `fired_class` is "condition", else "undetermined", with a sentence in `render.undetermined` (for a timeout, containing `RENDER_INCOMPLETE_READING`, the asked timeout and condition, and that grade and method are kept).
- **R15** `render` also carries `of` (= `shellSha`), `engine`, `engine_version`, `viewport`, `dpr`, `locale`, `timezone`, `elapsed_ms` (each `null` with "<field>: not reported by the renderer" in `render.undetermined` when absent or malformed), `navigated_to`, `status`, `asked` (`{viewport, dpr, locale, timezone}` as asked) and `at`. No absent field is filled with a default.
- Errors: never throws.

**renderedAuthority({asserted, render, at}) → authority**
- **R16** `{authority_state: "determined", authority: asserted, authority_basis}` only when `asserted` is given, `render.data` is a list whose every entry is `same_host`, and `render.third_party_executed` is an empty list.
- **R17** Otherwise `{authority_state: "undetermined", authority_basis, authority_other_origins}`: the basis is dated with `at` and names each reason — no assertion; data origins unknown; each other origin that supplied data (saying `same_site` approximates and is not the host); scripts unknown; each other origin that ran code — and ends saying a person resolves it by an assertion with its basis. `authority_other_origins` is the sorted union of those origins, or "undetermined" when neither list is known.
- Errors: never throws for a `render` built by R11–R15.

**rendererFor(env) → `{kind, render}`**
- **R18** In order: `env.RENDERER` with a `fetch` → `kind: "service"`, `render(req)` POSTs `req` as JSON to `/render` and answers its JSON, or `{ok: false, error}` naming the HTTP status when the body is not JSON; `env.BROWSER` with a `fetch` → R19's renderer (`kind: "browser-binding"`); `env.BROWSER` without one → `{kind: "browser-binding-without-driver", render: null}`; neither → `{kind: "none", render: null}`.

#### Rendered capture: the in-plane renderer (`browserrender.mjs`)

**renderWithBinding(binding, req, {now}) → Promise<answer>**; `browserBindingRenderer(binding)` wraps it for R18.
- **R19** Opens a browser session over the binding (POST `/v1/devtools/browser` → `sessionId`, then a websocket upgrade on `/v1/devtools/browser/<sessionId>`), and answers in R11's answer shape, every field either observed or `null`. Any failure answers `{ok: false, error}` with a sentence naming what failed; it never rejects.
- **R20** Holds the bounds it is asked for: session opening and every setup command up to the navigation's commit within `navMs` (`req.navigation_timeout_ms`, at least 1,000, 30,000 when unasked); the wait within `timeoutMs` (`req.wait.timeout_ms`, at least 1,000, 15,000 when unasked) from the commit; and the whole render, serialisation and body collection included, within `navMs + timeoutMs`. A phase whose bound is spent fails the render by name.
- **R21** The emulated viewport, dpr, locale and timezone are answered as asked only when the browser accepted each override, else `null`. `engine` and `engine_version` are the browser's own product string split at its last `/` (whole, with a `null` version, when it does not split).
- **R22** `requests` is every request the page made, from the network domain, each `{url, type, outcome, status?, blocked_by?}` with `type` lowercased ("other" when the browser gives none), `outcome` "completed", "failed", "blocked" (with the browser's `blockedReason` as `blocked_by`) or "pending"; a redirect hop is closed as its own completed entry. `scripts` is `{url}` for every script resource the engine parsed (inline scripts have no URL and are not listed). Either is `null` when its domain would not enable.
- **R23** The wait ends on `load` when that was asked and the load event fired; else on `networkidle` once the load event has fired and no request has been in flight for 500 ms; else on the deadline, answered `fired: "timeout"`. A timeout is an answer, not a failure.
- **R24** `html` is the serialised document after the wait, its doctype rebuilt from the document's own (none when the page has none), and `navigated_to` its `location.href` from the same evaluation; no document fails the render by name. `status` is the main frame's document response status. A navigation the browser refuses fails the render naming the address and the browser's error.
- **R25** After the document is taken, collects each completed load's body (`body_base64` or `body_text`), or states `body_unavailable` in a sentence (a redirect hop; no request id; past `SUBRESOURCE_CAP` bodies or `SUBRESOURCE_BUDGET` bytes; over `SUBRESOURCE_MAX`; the 10,000 ms collection bound or the render's reserved bound spent; the browser's own refusal). It hashes nothing. The session is closed on every path, the failing ones included.
- **R26** After the load event, the wait also ends when for 500 ms no request younger than N seconds is in flight, N a measured figure stated with its measurement. `fired` names which rule ended the wait — `networkidle`, `quiet_excluding_long_lived` or `timeout` — and the answer carries N and the count and URLs of the long-lived requests not waited for; the `render` block records them, and the reading of such a render is "settled; N long-lived request(s) still open were not waited for", never "complete". *(not yet met: D-570, ruled (c) by BOB #34 2026-09-25; R23 alone never fires on a source that keeps a request open, so every render of it times out; Q1)*

#### Web archive (`cdx.mjs`)

**parseCdx(text) → `{ok: true, rows}` | `{ok: false, reason, detail?}`**
- **R27** Reads a CDX `output=json` answer (an array of arrays whose first is the header) into row objects keyed by the header's names, skipping non-array rows; `[]` answers no rows. Refuses unparseable JSON `CDX_UNPARSEABLE`, a non-array `CDX_NOT_AN_ARRAY`, and a header that does not name both `timestamp` and `original` `CDX_NO_HEADER`. Never throws.

**cdxTimestampToIso(ts) → string | null**
- **R28** A 14-digit `YYYYMMDDhhmmss` as the UTC instant `YYYY-MM-DDThh:mm:ssZ`; anything else `null`.

**rowRefusal(row) → null | reason**
- **R29** `null` when the row may stand in for the document; otherwise the reason, in this order: not a row; timestamp not 14 digits; no original URL; a status other than 200 ("statuscode N, not 200"); no digest; the digest is `EMPTY_BODY_DIGEST` (base32 SHA-1 of the empty body, "3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ").

**selectCapture(rows, {notAfter}) → selection**
- **R30** Every row R29 refuses, or whose timestamp is later than `notAfter`, is listed in `considered`/`rejected` as `{timestamp, refused}`. With no usable row, answers `{ok: false, reason: "NO_USABLE_CAPTURE", detail, considered}`.
- **R31** Otherwise the newest usable row: `{ok: true, chosen: {timestamp, archived_at, original, mimetype, statuscode, digest, warc_record_length}, rejected, usable_count}`. `warc_record_length` is the archive's compressed record size, carried verbatim and never compared with anything.

**replayLocator(chosen) → string | null**
- **R32** `https://web.archive.org/web/<timestamp>id_/<original>` (the raw bytes, without overlay or rewriting), or `null` when the timestamp is not 14 digits.

**cdxQuery(address, {limit}) → string**
- **R33** The CDX query for `address` with its `http(s)://` removed, `output=json`, `limit` = −|limit| (default 40: the newest rows) and fields `urlkey,timestamp,original,mimetype,statuscode,digest,length`.

**archiveHop(chosen, replay, {mementoDatetime, warcSource}) → hop**
- **R34** `{who: "Internet Archive Wayback Machine", asserts, evidence, bound: false, unsigned_reason, via: "archive.org", document_address: chosen.original}`. `asserts` states these bytes were served for the original at `archived_at` with its status; `evidence` names the CDX timestamp and digest (as their base32 SHA-1 over the body as they stored it), the MIME type, the WARC record length (stated as theirs and not our length), the Memento-Datetime and `x-archive-src` when given, and the replay address; `unsigned_reason` says no cryptographic attestation exists and this is a dated third-party claim trusted, not verified.
- **R35** Every fact in the hop comes from the CDX record and the replay the caller fetched, never from a request (D-112).
- **R36** The hop's evidence also names the CDX `urlkey`. *(not yet met: `selectCapture` drops `urlkey` and `archiveHop` never names it; `ARCHIVE-FALLBACK.md` §Shape on the capture lists it; found in drafting, no row)*
- **R37** The archive lookup speaks Memento (RFC 7089), so any compliant archive can serve it; the Wayback CDX is one such source, not the interface. *(not yet met: `ARCHIVE-FALLBACK.md` §Build to Memento, not to Wayback is [ABSENT], deferred to M6 with D-145; no row targets this module; Q3)*

#### Google Drive (`drive.mjs`)

**Constants**
- **R38** `DRIVE_HOSTS` = docs.google.com, drive.google.com, sheets.google.com, slides.google.com (an exact set). `DRIVE_KINDS` = document/`document`/odt, spreadsheet/`spreadsheets`/ods, presentation/`presentation`/odp, each with its OpenDocument media type, which equals `odf-reader`'s `ODT/ODS/ODP_CONTENT_TYPE`. `DRIVE_PRODUCER` = "Google Drive export"; `DRIVE_CONVERT_ENGINE` = "google-export".

**readDriveAddress(address) → verdict | null**
- **R39** `null` for anything not an `https:` URL on a Drive host (after lowercasing and dropping a leading `www.`): the caller proceeds as for any address. For a Drive host it always answers a verdict `{address, host, shape, harvestable, …}`, reading the path with every `u/<digits>` pair and every `a/<name-with-a-dot>` pair removed wherever they stand.
- **R40** `shape` is: `folder` (`drive/folders`, `folderview`, `drive/my-drive`, `drive/shared-with-me`), not harvestable, with `why`; `published` (`<kind segment>/d/e/…`, publish-to-web), not harvestable, with `why` saying the ordinary path captures it; `document` | `spreadsheet` | `presentation` (`<kind segment>/d/<file id>`, the id 10–200 of `A–Z a–z 0–9 _ -`), harvestable, with `kind`, `fileId`, `format`, `mimetype` and `exportAddress`; `file` (`file/d/…`, `open`, `uc`, or an `id=` parameter holding a file id), not harvestable, with `fileId` when readable and `why` saying the kind decides the export format; `unknown` otherwise, not harvestable, with `why`. A folder or unknown shape is named, never silently skipped.
- Errors: never throws.

**exportAddressFor(kindRow, fileId) → string**
- **R41** `https://docs.google.com/<segment>/d/<fileId>/export?format=<format>`: one export host whatever host the link used.

**driveHop(drive, {retrieved, resolved, detected}) → hop**
- **R42** `{who: "Google Drive (Google Drive export)", asserts, evidence, bound: false, unsigned_reason, via: "direct", export_address, export_format, producer, drive_file_id, drive_kind, document_address, export_format_confirmed}`. `asserts` says the bytes are Google's conversion to the format, made at export time, of the named file, served for the export address at `retrieved`, and that the document lives at its Drive address. `evidence` names the export address and format, the producer, that the export address was composed by this instance from the address (never from the request), the host canonicalisation when the link named another host, a redirect when `resolved` differs, and whether the bytes confirmed the format (`detected.format` equal to the asked one), disagreed (recorded, not refused), or were not sniffed. `export_format_confirmed` is `true`/`false` from `detected`, `null` without it.

**driveConvertStep(drive) → step**
- **R43** `{step: "convert", engine: "google-export", format, cap: null, measured_by, calibration: null}`: the conversion as a derivation step whose cap is undetermined and stated, never a letter, until a calibration raises it.

**DRIVE_HOP_FACT_KEYS; callerSuppliedHopFacts(body) → [key]**
- **R44** `DRIVE_HOP_FACT_KEYS` = `export_address`, `export_format`, `producer`, `drive_file_id`, `drive_kind`, `drive`, `document_address`, `provenance_hop`. `callerSuppliedHopFacts` answers those that are own top-level keys of `body`, in that list's order; `[]` for a non-object.

**driveBaselineRow(rows, drive, locator) → row | null; classifyDriveBaseline({drive, locator, rows, retrievals}) → `{verdict, basis, …}`**
- **R45** `driveBaselineRow` answers, among rows with a string `locator`, the row naming the export address when the address is harvestable, else the row naming `locator`, else `null` — the row `op=monitor` compares against.
- **R46** `classifyDriveBaseline` answers `no_baseline` with no such row. Otherwise it judges from the plane's own retrieval record for the baseline's bytes (`retrievals`: direct fetches of the export address, or of another address) and the register's profile (format, declared type, `document_kind: "shell"`): `export` when only the export was fetched and the profile does not say HTML; `shell` when only another address was fetched and the profile does not name a document format; with no direct retrieval on record, `export` when the row names the export address and the profile does not say HTML, `shell` when the profile says HTML for a row at the document address; `undetermined` whenever the two sources disagree, both addresses were fetched, or neither speaks. Every answer carries `basis` (a sentence naming the facts used) and the facts: `baseline`, `handler`, `document_kind`, `format`, `declared_content_type`, `fetched_address`, `fetched_record`.
- Errors: never throws.

## Private

### Uses

- `subresources.originOf`: the origin of each data load and executed script (R12, R13).
- `subresources.SUBRESOURCE_CAP`, `SUBRESOURCE_MAX`, `SUBRESOURCE_BUDGET`: the ceilings on a render's kept bodies (R9, R25).
- `runtime-limits` is a declared use and nothing in this module calls it today (Q4).

### Invariants

- **R47** No store and no binding of its own: every fetch, hash and write is the caller's (`put`, `sha256`, the binding or service passed in). The pure functions give the same answer for the same inputs.
- **R48** A hex digest on a rendered capture is always the plane's, over bytes the plane kept; a digest only reported by a renderer is never recorded as one.
- **R49** What could not be observed is stated `undetermined` or `null` with its reason, never an empty list or a default that reads as measured.
- **R50** Completeness and authority are separate axes, and neither touches the grade: a timed-out render keeps its grade and method; a rendered capture is never `determined` as the host when another origin supplied data or ran code.
- **R51** A provenance hop's facts are derived from the address and from what this instance fetched, never taken from a request (D-112); both hops are `bound: false` and say why.
- **R52** Equality that costs nothing is not evidence: the archive's record length is never compared, the empty-body digest never selects a capture, and a non-200 row never stands in for a document.
- **R53** No jurisdiction. The recognisers name only the platforms they read (Google Drive, the Internet Archive), never a place; the source a measurement was taken from may be named in a comment (layers.md rule 6).

### Satisfies

- `docs/development/CLIENT-RENDERED.md` §What must be recorded on a rendered capture, with its DESIGNED 2026-09-21 authority rule (R11–R17); §Therefore: a pair, not a replacement; RULED 2026-09-23 by BOB #31 (scripts run and each is recorded, R13); RULED 2026-09-23 by BOB #32 (the method `rendered`, R1); RULED 2026-09-25 by BOB #34 (the tick's sentence, R2); RULED 2026-09-24 by BOB #32 (a timed-out wait, R3, R4, R14); RULED 2026-09-24 by BOB #33, the per-subresource digest (R8, R9, R12, R25) and the render throttle (R1's navigation bound, R6, R7, R20); §There is no collision (the daily allowance, R5); its DESIGN GAP D-570 (R26).
- `docs/development/ARCHIVE-FALLBACK.md` §What the Wayback Machine actually establishes and §And what it does not (R29–R34), §Shape on the capture (R34, R36), §Build to Memento, not to Wayback (R37).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16, the Google Drive paragraphs (RULED by Bob 2026-09-14: keep the link, harvest the OpenDocument export; R38–R42) and DEC-75 (the conversion is a derivation step, grade kept for the fetch path; R43); Part I §6's unwatchable shell (R46).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2 (a hop states locator, authority, time and method) and §3 (grade tracks the capture chain, never technique: R42's `via: "direct"`, R50).
- `docs/development/AUTHORITY-AND-TRUST.md`, the RULED sections: authority follows the data and is three-valued (R16, R17); transitive trust accepted where disclosed (R34).
- `docs/architecture/BIO_System_Design.md` §3, construct 2 ("a hop attests these bytes, this URL, this time, and no more").

### Suggestions

- `cdpConnection` and `collectBodies` are exported for tests; they are internals of R19–R25, not services.
- `rendererFor`'s service renderer rejects when the service's own `fetch` throws; wrapping it to answer `{ok: false, error}` would match R19.
- The archive's 24/min appetite for web.archive.org is set by `capture`'s archive lookup through `host-governor`; it belongs with the archive knowledge here or in `capture`, never in the governor.
- Today's tests: `bio-plane/test/cdx.test.mjs`, `drive.test.mjs`, `drive-convert.test.mjs`, `d525-driveshells.test.mjs`, `browser-render.test.mjs`, and the render half of `rendered-capture.test.mjs`; `modules.json` places this module's at `bio-plane/test/m/capture-sources/`.

## Open questions for BOB

1. **D-570's quiet-window rule (R26): what do `fired_class` and `completeness` say for `quiet_excluding_long_lived`?** R3 today reads any word other than the asked condition or a timeout as `undetermined`. *Recommended: `fired_class: "condition"` is wrong (the page never went fully idle); add a fourth `fired_class`, "settled", and `completeness: "settled_with_open_requests"` with the ruled sentence in `render.undetermined`, grade untouched as for a timeout. N is measured by the job before it is set; until then the rule is not enabled.*
2. **`RENDER_DEFAULTS.locale` is "en-US".** A page's language and formats follow the locale, which is local knowledge. *Recommended: take the locale from the instance's jurisdiction profile (a field it gains), with "en-US" only as the fallback when the profile names none; timezone stays UTC.*
3. **Memento (R37).** *Recommended: keep R37 as not yet met in this module (the archive lookup is here) and leave it unscheduled until M6 is taken up; the WARC interchange belongs to `capture` and `publication`, not here.*
4. **The declared use of `runtime-limits` is unused.** *Recommended: remove the edge from `modules.json` (a BOB-level change under P17); re-add it if a job meters a render's compute.*
5. **R36 (`urlkey`).** *Recommended: fix in this module's first job; the query already asks for the field.*
