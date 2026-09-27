# capture-sources — requirements

**Status** · APPROVED by Bob 2026-09-26 (a product module, P17; K67). DRAFT by BOB #41, 2026-09-26 (P18), from a drafting worker's reading of the code, reviewed by BOB (K47–K49). Layer 3. Code today: its own files, `bio-plane/src/render.mjs` (the rendered capture's record), `bio-plane/src/browserrender.mjs` (the in-plane CDP renderer), `bio-plane/src/cdx.mjs` (the web-archive index) and `bio-plane/src/drive.mjs` (the Google Drive host stack); no extraction from a legacy module. Not yet met: R26 (old-plan row D-570: the quiet-window wait, as K48 rules it), R36 (the CDX `urlkey`, fixed in the first job, K48), R54 (the render locale from the profiles, K48), and R37 (Memento; stays here, unscheduled, K48). The credentials members supply (R55–R63, with the Purpose and R47 amended) folded by a drafting worker for BOB #47, 2026-09-27, from `docs/development/transition/drafts/capture-sources-credentials.md`, each of its Opens answered as it recommended (K157 (3): Opens 3, 5, 7; K158 (1), Bob: Opens 1, 2, 4, 6, 8); not yet met (K103, K109).

## Public

### Purpose

The source-specific halves of capture that decide what a fetch from a particular kind of source is and what its record says, with no store of their own: a client-rendered page (the renderer seam, an in-plane browser driver, and the `render` block and authority a rendered capture records), a web archive (reading its index, choosing the capture that may stand in for a document, and the archive's provenance hop), and Google Drive (recognising an address, composing its OpenDocument export, the export's hop and conversion step, and whether a held baseline is Google's shell); and the credentials members supply for a refused capture (K103), held encrypted, the one thing this module stores. `capture` does the fetching, storing and filing; this module supplies the rules.

### Provides

#### Rendered capture: the record (`render.mjs`)

**Constants**
- **R1** `RENDER_DEFAULTS`, frozen: `navigation_timeout_ms` = `RENDER_NAVIGATION_TIMEOUT_MS` = 10,000 (measured, M-151), `viewport` 1280 × 800, `dpr` 1, `locale` "en-US" (the fallback only, R54), `timezone` "UTC", `wait` `{until: "networkidle", timeout_ms: 15000}`. `RENDERED_METHOD` = "rendered". `NON_DATA_TYPES` = `{script: "code", stylesheet: "layout", font: "layout"}`; every other type, including one never seen, is data.
- **R2** `RENDER_TICK_UNDETERMINED` = "content undetermined — not watched: this source renders its content in the browser" and `RENDER_INCOMPLETE_READING` = "render may be incomplete (wait timed out)": the one copy of each sentence, which the record, the provenance assertion and the monitor read.

**renderLocaleFor(view) → string**
- **R54** The locale a render asks for: the one the instance's active jurisdiction profiles name (`view`, `jurisdictions.combine`'s view, passed by the caller), else `RENDER_DEFAULTS.locale`: the view's `locale.value` when it is a well-formed BCP 47 tag (a `{value, basis}` key, as `practice.minutes_due_days` is), else the fallback. Never throws (K119). *(not yet met: K48 — every render asks "en-US"; the profiles name no locale yet)*

**waitFiredClass(fired, askedWait) → "condition" | "settled" | "timeout" | "undetermined"**
- **R3** Of `fired` trimmed and lowercased: "timeout" when it matches `/timed?[ _-]?out|timeout/` (e.g. "timeout", "timed out", "time-out"); "settled" when it is "quiet_excluding_long_lived" (R26); "condition" when it equals `askedWait.until` (trimmed, lowercased); "undetermined" otherwise, including a non-string or empty `fired` and a word never seen. Never throws. *(not yet met: D-570, K48 — the "settled" class)*

**completenessReading(render) → string | null**
- **R4** For `render.completeness` "settled_with_open_requests", R26's reading. Otherwise `null` unless it is "undetermined"; then `RENDER_INCOMPLETE_READING` when `render.wait.fired_class` is "timeout", else "render completeness is undetermined (which wait ended the render was not established)". Never throws.

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
- **R14** `render.wait` is `{asked, fired, fired_class}`: the renderer's own word and R3's reading of it. `render.completeness` is "condition_met" only when `fired_class` is "condition", "settled_with_open_requests" when it is "settled" (R26), else "undetermined", with a sentence in `render.undetermined` (for a timeout, containing `RENDER_INCOMPLETE_READING`, the asked timeout and condition, and that grade and method are kept).
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
- **R26** After the load event, the wait also ends when for 500 ms no request younger than N seconds is in flight, N a measured figure stated with its measurement. `fired` names which rule ended the wait — `networkidle`, `quiet_excluding_long_lived` or `timeout` — and the answer carries N and the count and URLs of the long-lived requests not waited for. The `render` block records them with `fired_class` "settled" (R3) and `completeness` "settled_with_open_requests" (R14), whose reading, in `render.undetermined` and from R4, is "settled; N long-lived request(s) still open were not waited for", never "complete"; grade and method are kept, as for a timeout (R50). The rule is off until N is measured: until then no render fires it.

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
- **R36** The hop's evidence also names the CDX `urlkey`.
- **R37** The archive lookup speaks Memento (RFC 7089), so any compliant archive can serve it; the Wayback CDX is one such source, not the interface. *(not yet met: K48 — unscheduled; `ARCHIVE-FALLBACK.md` §Build to Memento, not to Wayback is [ABSENT], deferred to M6 with D-145; the WARC interchange is `capture`'s and `publication`'s)*

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

#### Credentials members supply for a refused capture (K103, K109 (3))

Terms. A **credential** is what a member supplies so that a source's refusal (capture-requests R40) can be retried (capture-requests R42): its **kind** is `login` (login credentials), `user-agent` (a user-agent setting) or `other` (another authorisation). Its **secret** is the supplied value. Its **host** is the one host it is for. Its **scope** is `member` (the supplier's own), `project` (one project, named) or `group`. Every refusal is an answer `{ok: false, reason, code, check, translation, detail}`, never a throw; its catalogue rows are allocated with the job, as K109 (3) allocates C-28's. A refusal's `detail` never contains a secret.

**credentialSupply({kind, host, secret, scope, project, by}) → `{ok: true, credential}` | refusal**
- **R55** Stores a credential under the declared scope and answers its listing entry (R58); it never answers the secret. `host` is the refused request's host, which the caller passes (Suggestions): the credential is for that one host, exact (never another subdomain or a parent domain), held lower-cased. Refusals, in order: `CAPTURE_CREDENTIAL_NOT_A_MEMBER` when `by` names no active member (`memberFacts`); `CAPTURE_CREDENTIAL_BAD_KIND` for a kind not in the three; `CAPTURE_CREDENTIAL_BAD_HOST` for a `host` that is not a non-empty host name (no scheme, path, port or user part); `CAPTURE_CREDENTIAL_BAD_SCOPE` for a scope not in the three, or for `project` given with any scope but `project`; `CAPTURE_CREDENTIAL_NO_PROJECT` when the scope is `project` and `project` names no held project (`bundleInfo`); `CAPTURE_CREDENTIAL_NO_SECRET` for an empty or non-string secret; `CAPTURE_CREDENTIAL_NOT_PERMITTED` when R63 does not let `by` supply at that scope; `CAPTURE_CREDENTIAL_NO_KEY` when no encryption key is bound to the instance, so that nothing is ever stored in the clear. A refusal writes nothing. *(not yet met: K103, K109)*

**credentialsForFetch({host, principalPlane, target}) → `{credentials: [entry], reason}`**
- **R56** Answers at most one unwithdrawn credential for a fetch to `host` made for a request with plane principal `principalPlane` and target inquiry `target`. Admitted are: a `member` credential only when its supplier is `principalPlane`; a `project` credential only when `bundleInfo(target).project` is its project; a `group` credential for any request; each only when its host equals `host` lower-cased, exactly. Of those admitted, the one answered is of the narrowest scope (`member`, then `project`, then `group`) and, within that scope, the newest supplied: one credential per fetch. If the source refuses the fetch made with it, the request is refused under capture-requests R40 as before, and no other credential is tried. A credential goes only to its own host: it is never sent after a redirect to another host (the caller's, Suggestions). The entry is `{credential, kind, secret, supplied_by, scope, project}`: the facts a capture fetched with it records in its provenance (that credentials were used, whose they were and at which scope), the capture also being marked not reproducible by the public; recording both is the caller's (Suggestions). `credentials` is `[]`, and the fetch goes without credentials so that the source's refusal stands, when none is admitted, when no key is bound (`reason` naming `CAPTURE_CREDENTIAL_NO_KEY`), and when the admitted credential's secret will not decrypt (`reason` naming the credential, never its secret); `reason` is a sentence saying which, and `null` when a credential is answered. Never throws. *(not yet met: K103, K109)*

**credentialWithdraw({credential, by}) → `{ok: true, withdrawn}` | refusal**
- **R57** Withdraws a credential. From that call on, R56 never answers it; its ciphertext is destroyed at once, and its secretless entry stays (R58) with `withdrawn_at` and `withdrawn_by`. `CAPTURE_CREDENTIAL_NO_SUCH` covers an unknown id and one `by` may not see (R58); both cases get the same answer. `CAPTURE_CREDENTIAL_NOT_PERMITTED` applies when R63 does not let `by` withdraw it. Withdrawing twice answers `already: true` and writes nothing. A credential has no expiry of its own: it holds until it is withdrawn, here or by a revocation, or purged (R63). *(not yet met: K103, K109)*

**credentialList({viewer, scope, project}) → [entry]**
- **R58** Lists the credentials the viewer may see, filtered by `scope` and `project` when given: a member sees their own `member` credentials; a `project` credential is seen by a viewer at `FULL` sight of its project (membership's `sight`); a `group` credential by every member; an administrator (`isAdministrator`) sees every entry, so as to withdraw under R63; an absent or unrecognised viewer sees none. Each entry is `{credential, kind, host, scope, project, supplied_by, supplied_at, withdrawn_at, withdrawn_by}`. It never contains the secret, any part of it, its length or its digest. Never throws. *(not yet met: K103, K109)*

## Private

### Uses

- `subresources.originOf`: the origin of each data load and executed script (R12, R13).
- `subresources.SUBRESOURCE_CAP`, `SUBRESOURCE_MAX`, `SUBRESOURCE_BUDGET`: the ceilings on a render's kept bodies (R9, R25).
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge` (the credentials table, R63), and `bundleInfo` (a project's existence, R55, and a target's project, R56).
- `membership`: `memberFacts` (an active member, R55, R63), `isProjectEditor` and `isProjectOwner` (R63), `isAdministrator` (R58, R63) and `sight` (R58); a member's revocation (membership R8, R20) for R63.

### Invariants

- **R47** No binding of its own, and no store but the credentials of R55–R63 (amended, K157). Every fetch, hash and write of a capture is the caller's (`put`, `sha256`, the binding or service passed in). The pure functions give the same answer for the same inputs.
- **R48** A hex digest on a rendered capture is always the plane's, over bytes the plane kept; a digest only reported by a renderer is never recorded as one.
- **R49** What could not be observed is stated `undetermined` or `null` with its reason, never an empty list or a default that reads as measured.
- **R50** Completeness and authority are separate axes, and neither touches the grade: a timed-out render keeps its grade and method; a rendered capture is never `determined` as the host when another origin supplied data or ran code.
- **R51** A provenance hop's facts are derived from the address and from what this instance fetched, never taken from a request (D-112); both hops are `bound: false` and say why.
- **R52** Equality that costs nothing is not evidence: the archive's record length is never compared, the empty-body digest never selects a capture, and a non-200 row never stands in for a document.
- **R53** No jurisdiction. The recognisers name only the platforms they read (Google Drive, the Internet Archive), never a place; a render's locale comes from the jurisdiction profiles (R54); the source a measurement was taken from may be named in a comment (layers.md rule 6).
- **R59** A secret is held encrypted at rest. No row of this module's tables holds a secret's bytes in plaintext. A test that supplies a known secret and reads the tables raw never finds it. *(not yet met: K103)*
- **R60** Never shown back. No service or op of this module answers a secret, except R56. R56 is an in-process service and is never an op. A secret does not reach an observation, a log line or a refusal. *(not yet met: K103)*
- **R61** Never exported. Credentials live in this module's own table and never in a bundle, a file, a manifest entry or a snapshot. No export, publication or image of the record (`readImage`) carries a secret. *(not yet met: K103)*
- **R62** Read only for fetches within scope. A credential's host, scope and project are the ones declared at supply and are never changed afterwards: to change them, withdraw the credential and supply it again. R56 is the only read that answers a credential for use, and only under R56's scope and host rules. *(not yet met: K103, K109 (3))*
- **R63** Who may supply and withdraw, and what else ends a credential. The supplier is always `by`, an active member (R55). A `member` credential is supplied by the member as their own, never by one member for another, and withdrawn by its supplier or an administrator (`isAdministrator`). A `project` credential is supplied by an editor of that project (`isProjectEditor`) and withdrawn by its supplier or any owner of the project (`isProjectOwner`). A `group` credential is supplied by any active member and withdrawn by its supplier or any administrator. A member's revocation (membership R8, R20) withdraws their `member` credentials as R57 does: from the revocation on, R56 never answers a `member` credential whose supplier is not an active member, and its ciphertext is destroyed at the first read of this module that meets it (K159; a revocation notice from `membership` would make it immediate, N123), and keeps their `project` and `group` credentials, which were given to the project or the group. For `record-core`'s purge, `member` and `group` credentials are exempt, as membership R59 exempts credentials; `project` credentials are keyed to their project and cleared with its purge. *(not yet met: K103)*

### Satisfies

- `docs/development/CLIENT-RENDERED.md` §What must be recorded on a rendered capture, with its DESIGNED 2026-09-21 authority rule (R11–R17); §Therefore: a pair, not a replacement; RULED 2026-09-23 by BOB #31 (scripts run and each is recorded, R13); RULED 2026-09-23 by BOB #32 (the method `rendered`, R1); RULED 2026-09-25 by BOB #34 (the tick's sentence, R2); RULED 2026-09-24 by BOB #32 (a timed-out wait, R3, R4, R14); RULED 2026-09-24 by BOB #33, the per-subresource digest (R8, R9, R12, R25) and the render throttle (R1's navigation bound, R6, R7, R20); §There is no collision (the daily allowance, R5); its DESIGN GAP D-570 (R26).
- `docs/development/ARCHIVE-FALLBACK.md` §What the Wayback Machine actually establishes and §And what it does not (R29–R34), §Shape on the capture (R34, R36), §Build to Memento, not to Wayback (R37).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16, the Google Drive paragraphs (RULED by Bob 2026-09-14: keep the link, harvest the OpenDocument export; R38–R42) and DEC-75 (the conversion is a derivation step, grade kept for the fetch path; R43); Part I §6's unwatchable shell (R46).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2 (a hop states locator, authority, time and method) and §3 (grade tracks the capture chain, never technique: R42's `via: "direct"`, R50).
- `docs/development/AUTHORITY-AND-TRUST.md`, the RULED sections: authority follows the data and is three-valued (R16, R17); transitive trust accepted where disclosed (R34).
- `docs/architecture/BIO_System_Design.md` §3, construct 2 ("a hop attests these bytes, this URL, this time, and no more").
- `docs/development/SOURCE-ACCESS.md`, DEC-47 as K103 extends it beyond publicly available documents: a member may supply what a retry needs and declare its scope (R55–R63). This includes BOB's reading of K103 (3): the secrets are encrypted, never shown back or exported, and used only under their scope (R59–R62). Placement is K109 (3): the credentials' home is this module, each credential is scoped to its member, one project or the group, and it is read only for requests within that scope (R56, R62).

### Suggestions

- **The key.** Keep it outside the store, as a Worker secret (for example `CAPTURE_CREDENTIALS_KEY`, set with `wrangler secret put` on account `20b533579290b9b93168345edd3b7f72`). Encrypt with AES-GCM through WebCrypto, using a fresh IV for each row. Use the row's id, scope and project as associated data, so that a ciphertext copied into another row or scope fails to decrypt. To rotate the key, re-encrypt every row under the new key.
- **The credentials table's purge declaration** (R63): record-core R46's form, keyed to a bundle by `project` and cleared by the whole-store form only where the scope is `project`, so that `member` and `group` rows are never cleared.
- **A member's revocation** (R63): membership states no listener today. Either capture-sources registers with membership for it (the K31 pattern), or R56 and R58 read `memberFacts` and withdraw a revoked supplier's `member` credentials when they meet them; the extraction job proposes which, through BOB.
- **Obligations only callers can keep** (P7):
  - capture-requests checks that the supplier can see the request's target before it calls R55 (its R41), and passes the refused request's own host as `host`.
  - capture-requests passes `principalPlane`, `target` and `host` to R56 from the row, never from a body.
  - `capture` sends R56's credential only to its host: a redirect to another host is followed without it.
  - `capture` (or `provenance`) records R56's facts on the capture, marks it not reproducible by the public, and never writes the secret into the capture's record or receipt.
  - **A supplied user-agent** (K158): capture-requests judges a `user-agent` credential at the drain as its R14 judges the member-browser form (DEC-47's access-parity amendment), not as the legible CivicOS agent; the capture's provenance names it.
- **Ops**, which are the control plane's to route: `capturecredentialsupply` and `capturecredentialwithdraw` (admin and member with `contribute`, mutating), and `capturecredentials` (admin and member, carrying the viewer stamp). R56 has no op.
- The render locale: `capture` passes R54 its view (`jurisdictions.combine` of the active profiles) and asks the renderer with the answer; timezone stays UTC.
- `cdpConnection` and `collectBodies` are exported for tests; they are internals of R19–R25, not services.
- `rendererFor`'s service renderer rejects when the service's own `fetch` throws; wrapping it to answer `{ok: false, error}` would match R19.
- The archive's 24/min appetite for web.archive.org is set by `capture`'s archive lookup through `host-governor`; it belongs with the archive knowledge here or in `capture`, never in the governor.
- Today's tests: `bio-plane/test/cdx.test.mjs`, `drive.test.mjs`, `drive-convert.test.mjs`, `d525-driveshells.test.mjs`, `browser-render.test.mjs`, and the render half of `rendered-capture.test.mjs`; `modules.json` places this module's at `bio-plane/test/m/capture-sources/`. The credentials' tests there cover a raw-table scan for a known secret (R59), a sweep of every answer shape for the secret (R60, R61), and one admitted and one refused request for each scope and for another host (R56).

