# runtime-limits — requirements

**Status** · In force: written by BOB #37 (T6), a helper module, its requirements BOB's (K20); the group's copy binds no Claude credential in its environment (K1502, K1755): R14 and R15 retired. Last changed T35 (T35-4: R13, R23; K1916); every requirement met. Fix round 9 (T51; G123a, G124; K4831 (3) (8), K4834, K4835 (1)): R29-R34 new, the reading ceilings' one table, the byte ledger, the cap convention and the platform's figures; R22 amended; marked not yet met (T51). Fix round 9 (T51; K4958): R35 new, six rows. Fix round 9 (T51; K4965): R36 new, `wholeReadRow`; marked not yet met (T51). Last changed T53 (R37–R47 new: the beta's per-kind bounds, the service levels, the time classes, the room in a jurisdiction, the mail and register rows; N1267, K5427, K5438, K5440, K5441, K5527, K5569); marked not yet met (T53).

## Public

### Purpose

Two runtime facts a Worker cannot get any other way. `cpu.mjs` measures what a capture spends in CPU:
Cloudflare freezes `Date.now()` during synchronous execution, so a Worker cannot time its own compute,
and it counts calls and bytes instead of fabricating a millisecond figure; it also finds the CPU ceiling
the runtime enforces, by a stepped probe that checkpoints after every step so the trail survives the
isolate being killed mid-probe. `tokens.mjs` is token hygiene: whether a secret value is live rather than
a value that has ever been published in this repository, and the status of the two instance-level
credentials an instance may hold as deploy secrets (BIO's own `ai` credential that resumes a run; the
group's copy binds no Claude account as a deploy secret, K1502, K1755: the group's API key, when held, is in `credentials`' sealed table, never a binding, so the instance-level Claude status always answers none), and which bound credential the instance's unattended work spends.
Neither half holds a store, reads the network, or has any way to
set a credential. A third part, for the reading modules, is the one table of every ceiling a reader keeps (`read-bounds.mjs`), a count of the bytes a reader holds (`byte-ledger.mjs`) and the platform's measured figures with the source of each; it too holds no store and reads no network.

### Provides

**makeMeter() → meter**
- **R1** Returns an object with three methods: `sync(label, fn, bytes?)`, `cpuAwait(label, fn, bytes?)`
  and `report()`.
- **R2** `sync` and `cpuAwait` each record one call under `label` — creating that segment on first use —
  and add `bytes` to its byte total when `bytes` is a finite number, before running `fn` (`cpuAwait`
  awaits it) and returning its result. The call is counted before `fn` runs, so a throwing `fn` still
  leaves it counted.
- **R3** `report()` returns `{work_calls, work_bytes, segments, measured_ms: null, note}`: `work_calls`
  and `work_bytes` are the sums, over every label used on this meter, of each segment's calls and bytes;
  `segments` is a copy keyed by label, each `{calls, bytes}`; `measured_ms` is always `null`; `note` is a
  string stating these are counts, never times, because Cloudflare freezes the clock during synchronous
  execution.
- Errors: never throws on its own account. Propagates whatever `fn` throws or rejects with.

**burn(iterations) → number**
- **R4** Runs a fixed, allocation-free arithmetic loop `iterations` times and returns the final value. The
  same `iterations` does the same amount of work every time; the returned number carries no meaning
  beyond that.
- Errors: never throws.

**cpuProbe({checkpoint, startStep, maxStep, iterationsPerStep, budgetMs, now}) → Promise<{completed, elapsed_ms, reason}>**
- **R5** Defaults: `startStep` 0, `maxStep` 40, `iterationsPerStep` 2,000,000, `budgetMs` 20,000, `now`
  `Date.now`. `checkpoint` has no default.
- **R6** Reads `now()` once, at the start, as `t0`. Starting from `step = startStep`, repeats: `burn`
  `iterationsPerStep` iterations, compute `elapsed = now() - t0`, then `await checkpoint(step + 1,
  elapsed)`. `checkpoint` is called exactly once per completed step, strictly in ascending step order,
  and is always awaited before the next step's `burn` begins.
- **R7** Immediately after a checkpointed step whose `elapsed >= budgetMs`, returns `{completed: step + 1,
  elapsed_ms: elapsed, reason: "BUDGET_REACHED"}` without starting another step.
- **R8** If `maxStep` is reached without the budget being reached, returns `{completed: maxStep,
  elapsed_ms, reason: "MAX_STEP_REACHED"}`, `elapsed_ms` from the last completed step.
- Errors: throws when `checkpoint` is not callable. Otherwise never throws on its own logic; propagates
  whatever `checkpoint` throws or rejects with.

**sha256hex(v) → Promise\<string\>**
- **R9** Returns the SHA-256 digest of the UTF-8 encoding of `v`, as 64 lowercase hex characters.
- Errors: never throws for any string `v`, including the empty string.

**liveToken(v) → Promise\<boolean\>**
- **R10** Returns `false` when `v` is not a string, or is the empty string.
- **R11** Otherwise returns `false` when `sha256hex(v)` is a member of `PUBLISHED_TOKEN_HASHES`, and
  `true` otherwise.
- Errors: never throws.

**PUBLISHED_TOKEN_HASHES**
- **R12** An exported `Set` of SHA-256 hex strings, the denylist. `liveToken` and every credential-status
  service below treat a value whose hash is in the set exactly as an empty one. A caller may also test
  membership directly (`PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))`) and gets the same answer
  `liveToken(v)` would give.

**instanceClaudeStatus(env) → Promise\<{level: "instance", configured, reason, detail}\>**
- **R13** (K1502) Answers `{level: "instance", configured: false, reason: CASCADE_UNSET, detail: <string>}`
  for every `env`, whatever it carries, `INSTANCE_CLAUDE_TOKEN` included: the group's copy binds no Claude
  credential in its environment, and `detail` says that the assistant is reached through a member's own
  Claude account or API key or the group's API key, each held in `credentials` (K1755), never a binding. It reads no binding for a Claude credential, and `INSTANCE_CLAUDE_BINDING` is
  no longer exported.
- **R14** *(retired: K1502, T33-6; the instance-level Claude credential is retired and R13 answers every `env` alike)*
- **R15** *(retired: K1502, T33-6; no `env` gives `configured: true`, R13)*
- **R16** `detail` is `null` exactly when `configured` is `true`, otherwise a string; the return value
  never carries the configured value itself.
- Errors: never throws.

**instanceClaudeToken(env) → Promise\<string | null\>**
- **R17** (K1502) Returns `null` for every `env`, `INSTANCE_CLAUDE_TOKEN` included: computed from
  `instanceClaudeStatus`'s own answer (R13), so the two can never disagree, and no Claude credential is ever
  read from the copy's bindings.
- Errors: never throws.

**instanceAiCredential(env) → Promise\<{token, reason}\>**
- **R18** Reads `env.INSTANCE_AI_TOKEN` (`INSTANCE_AI_BINDING`). Missing, or the empty string: `{token:
  null, reason: INSTANCE_AI_UNSET}`.
- **R19** A non-empty string that is not `liveToken`: `{token: null, reason: INSTANCE_AI_PUBLISHED}`.
- **R20** Any other non-empty string `v`: `{token: v, reason: null}`.
- Errors: never throws.

**unattendedCredential(env) → {bound, token}** (K90 (2): the choice `monitoring` and `capture-requests` share)
- **R26** `bound` is a boolean, computed synchronously: `true` exactly when `env.DAEMON_TOKEN` or
  `env.ADMIN_TOKEN` is present and non-empty, that is truthy (presence only; publication is not asked; K227). `token()` answers a
  `Promise<string | null>`: `env.DAEMON_TOKEN` when it is a string that is `liveToken`, else
  `env.ADMIN_TOKEN` on the same test, else `null`. The object itself never carries a credential's value.
  *(met, T8; the store still holds its own copies, `#monitorTokenBound` and `#monitorToken`, until monitoring and capture-requests are extracted)*
- Errors: never throws; `token()` never rejects.

**The reason constants**
- **R21** `CASCADE_UNSET`, `CASCADE_PUBLISHED`, `INSTANCE_AI_UNSET` and `INSTANCE_AI_PUBLISHED` are
  exported string constants (`"NO_INSTANCE_ACCOUNT"`, `"INSTANCE_ACCOUNT_REVOKED_BY_PUBLICATION"`,
  `"NO_INSTANCE_AI_CREDENTIAL"`, `"INSTANCE_AI_CREDENTIAL_REVOKED_BY_PUBLICATION"`), stable across calls.
  They are the only values `reason` ever takes, besides `null`.

**Where the platform keeps the team's room (fix round 7 G83; K4746, K4747, K4752)** (`bio-plane/src/store-place.mjs`)
- **R27** `STORE_HINTS` is the frozen list of Cloudflare's location hints, exactly `wnam`, `enam`, `sam`, `weur`, `eeur`, `apac`, `apac-ne`, `apac-se`, `oc`, `afr`, `me`; `storeHint(env)` answers `env.STORE_LOCATION` when it is exactly one of them, else `null` (an absent, empty, padded or differently cased value is no hint). `storeGeneration(env)` answers `env.STORE_GENERATION` as a whole number when it matches `/^[1-9][0-9]*$/` and is 2 or more, else `1` (so `"02"`, `"2.0"`, `" 2"` are `1`).
- **R28** `storeId(env, name)` answers `env.STORE.idFromName(n)` and `storeStub(env, name)` answers `env.STORE.get(storeId(env, name), {locationHint: h})` when `storeHint(env)` is `h`, else `env.STORE.get(storeId(env, name))` with no second argument; `n` is `name` when `storeGeneration(env)` is `1`, else `` `${name}~g${generation}` ``. The suffix is on the object's name only: the logical names `bio` and `scratch` (a `store=` value, an R2 key prefix such as `bio/captures/`, `bio/published/`, `bio/inbox/`) never change with the generation. These are the only way product code names or obtains the team's room (`bio`, `scratch`): no other file calls `idFromName` on `env.STORE`. A hint is where the hosting platform runs the room, never a jurisdiction (R25).

**The reading ceilings, the byte ledger and the platform's figures (fix round 9, G123a, G124; K4831 (3) (8), K4834, K4835 (1); `bio-plane/src/read-bounds.mjs`, `bio-plane/src/byte-ledger.mjs`)**
- **R29** `READ_BOUNDS` is a deeply frozen map `kind -> name -> {standard, alpha, protective, key}`: one row for every ceiling a reading module keeps (the bytes, rows, columns, cells, entries, depth, ratio, objects, pixels and the rest it refuses above), each with three figures and `key`, the `localize` key of the member sentence that states a refusal on it (the key belongs to the quoting module; this module holds no sentence). `standard` is the figure the standard sets (K4628); `alpha` is the figure the alpha keeps (K4831 (3)): the kind's own figure at the start of fix round 9 where it is lower than the standard; `protective` is a limit inside the standard against a file no ordinary program produces (K4831 (8)). A row's `alpha` is never above its `standard`.
- **R30** The figures the table holds are these, and a quoting module's job adds a row, with its three figures and `key`, for any other ceiling it keeps, the `alpha` being the figure it holds at the start of the round. A figure in MB or GB counts 2^20 or 2^30 bytes, the platform's own unit (K4838 (6)). **Light kinds** (`text`, `csv`, `tsv`, `json`, `xml`): standard 50 MB (52,428,800 bytes) and 1,048,576 rows (K4628). **Archives:** standard 500 MB (524,288,000 bytes) as uploaded and 2 GB (2,147,483,648 bytes) unpacked, alpha 256 MiB for each (K4837), depth 3, ratio 1,100 to 1, 10,000 members, each member within its kind's figure. **Alpha figures of the heavy kinds** the plan names: PDF bytes read 24 MiB; XLSX declared text 32 MiB; ODS `content.xml` 20 MiB and 262,144 expanded repeat units; the analysis workbook's cells 250,000 (K4831 (10)), its file 20 MiB (standard and protective 50 MB) and its cells' JSON 64 MiB in all three columns, a protective figure (K4936); the sheet worker's 250,000 cells, 9,000,000 bytes and 120,000 ms; office retained objects 250,000. **Protective figures** (each is the plan's proposal, recorded by BOB when the capped child has shown it): columns 16,384; a cell 32,767 characters (longer kept to 1 MiB and stated per cell); sheets 1,000; members 10,000; nesting depth 3; ratio 1,100; a page's decoded content 64 MiB; an object stream 16 MiB; a CMap 1 MiB; an embedded file 64 MiB; objects 2,000,000; a direct object 4 MiB and 65,536 operands; tree depth 256; `bfrange` 65,536 codes; a picture edge 65,535 and chunks 65,536; a row stride 8 MiB; an XML tag 64 KiB; a zip directory 16 MiB; a name 4,096 bytes; office package entries 100,000 and archive entries 10,000; retained objects 250,000; pixels a page 120,000,000 (`COVER_MAX_PIXELS`); the render DOM (the figure the capture-sources job proposes).
- **R31** `boundOf(kind, name) -> number` answers the ACTIVE figure of a row: its `alpha`, except for the light kinds (R30), which answer their `standard` (K4834). `statement(kind, name, size) -> {size, bound, key}` answers the size the caller measured, the active figure and the row's `key`, so a refusal is stated with the file's size and the limit and never says a file was read that was not. Both throw an `Error` naming the kind and name when no such row exists (a defect in the quoting module, found by its test); neither throws otherwise. A module that keeps a ceiling quotes `boundOf` and holds no numeric literal for it.
- **R32** `byteLedger() -> {hold(n, tag), release(n, tag), peak(), held()}` makes one ledger, independent of every other, that counts the bytes of the backing stores (buffers, ranges, decoded copies) a reader holds. `hold` adds `n` bytes (a non-negative integer, else it throws a `TypeError`) under `tag`; `release` takes `n` bytes off that tag and never below zero; `held()` is the bytes held now, over all tags; `peak()` is the largest `held()` the ledger has reached. A buffer not released shows in `held()` after its work ends.
- **R33** `capFor(N) -> integer` is the one cap convention for a capped child process: the old-space cap in whole megabytes for a child that holds `N` MB of backing bytes, computed from the memory entries of `PLATFORM_FIGURES` (R34: the isolate's memory, shared by the objects of a class, and the platform's idle figure), the same answer for a PDF run and a sheet run. No other formula for it exists.
- **R34** `PLATFORM_FIGURES` is a deeply frozen map `name -> {value, source}`, one entry for each figure a gated job depends on (the memory idle figure; the landing batch size `LAND_BATCH_BYTES`; the plane's `cpu_ms`; the zone's request body cap). The entries start at Stage 0's measured figures (K4838): `isolate_memory_bytes` 268,435,456 (about 256 MiB of buffers per isolate, shared by up to five objects of a class; one buffer at most 134,217,728), `idle_bytes` 52,428,800 (K4616, not yet measured: P-M2 (c)), `cpu_ms` 300,000, `LAND_BATCH_BYTES` 1,048,576, `request_body_max` 104,857,600 (including framing), each with `source` `K4838 (<n>)` or `K4616`. `source` is the ruling the value rests on until BOB records the measured row in `PLATFORM.md`; the same commit then changes the entry's `value` and sets `source` to `PLATFORM.md P-M<n>` naming that row. An entry whose `source` is a ruling holds that ruling's figure; no entry changes its value without a `source` naming a row. No code reads the Markdown.
- **R35** (fix round 9, G156; K4958) `READ_BOUNDS` gains six rows, today's figures in all three columns (no bound moves, K1881), each `same(n, k(...))`: `provenance.part_verify_bytes` 8 MiB; `acquisition.odf_digest_bytes` 8 MiB; `acquisition.large_fetch_bytes` 8 MiB; `case.copy_now_bytes` 2 MiB; `monitoring.docket_read_bytes` 8 MiB; `following.portal_parse_bytes` 4 MiB. Test: each through `boundOf` and `statement`.
- **R36** (fix round 9; K4965) `wholeReadRow(kind) -> [kind, name]`, the `READ_BOUNDS` row that is a document's whole-read ceiling by its kind: `"pdf"` gives `["pdf", "bytes"]`, `"csv"` `["csv", "bytes"]`, `"text"` `["text", "bytes"]`, any other kind or none `["pdf", "bytes"]` (the whole-load row); exported from `read-bounds.mjs` beside `boundOf`, so every module judging a whole read by kind (capture R109, control-plane's inline gate) asks this one declaration. Test: each kind, an unknown kind and `undefined`; `boundOf(...wholeReadRow(k))` equals the row's active figure.
- **R37** (T53; N1267; K4628 (3) option B, K5427, K5439, K4831 (3); K5448 (8); CONSISTENCY §2 row 8; `build/plan/beta/files/SIZES-N1267.md`) **The beta's per-kind bounds are the Level 1 row of the one table.** In the beta the active figure (`boundOf`, R31) of each whole-read ceiling of the kinds below is the figure stated here and not the alpha's lower one; the alpha figures stay in the row's `alpha` column. A file over **either** limit of its kind is refused in plain words with its size and the limit, never half read, and `statement` (R31) states both. MB and GB count 2^20 and 2^30 bytes (R30). The kinds: **document** (PDF, DOCX, DOC, PPTX, PPT, ODT, ODP, RTF) 100 MB **or** 5,000 pages, a PDF's pages counted from its page tree; **text** (text, JSON, XML, NDJSON, HTML and the text-like ICS, VCF, SVG, KML, GeoJSON, SRT, VTT, log, md) 100 MB (K5427), read in byte windows with the encoding carried, HTML included; **spreadsheet** (XLSX, XLSM, XLS, ODS, CSV, TSV) 50 MB **or** about 1,000,000 rows (1,048,576, R30), an XLS 65,536 rows a sheet in its own format, a workbook's rows counted over its sheets; **image** (JPEG, PNG, TIFF, HEIC, GIF, WebP, BMP, AVIF) 50 MB each, a multi-page TIFF's pages counting toward the 5,000, the pixels a page a protective limit (R30); **archive** (ZIP, TAR, GZ, 7z, MBOX) 500 MB as uploaded and 2 GB unpacked, each member within its own kind's bound, nesting 3 deep, 10,000 members, ratio 1,100 to 1 (R30); **message** (EML, MSG) within the document bound, 100 MB uploaded, every attachment a member and its own job. The protective limits of K5439 are rows beside them: 100,000 messages in one mailbox, JSON and XML nesting 1,000, 100,000 events in one calendar file. The analysis workbook's 250,000 cells (R30) stay; no bound above 250,000 cells is set in the beta (N1267a is left out). Rows and pages are counted before any byte is read, from declared structure, and a file whose declaration is false is stopped at the first window past it, and stated. Every reader quotes `boundOf` and holds no literal (R31). The names of the new rows are set by the job and listed in its record; this table is the one source the screens' per-kind limit sentences read (`format-registry`'s kind table). Test: for each kind above, `boundOf` of the kind's whole-read row (R36) equals the figure; `statement(kind, name, size)` for a file at bound + 1 states the size and the limit; each protective row answers its figure; a test reads `SIZES-N1267.md` §2's figures and finds each in this table. Control: a row not named here keeps its figures (no bound moves, K1881).
- **R38** (T53; K4746, K5438, K5569; PL20 of `platform/service-levels-draft.md`; K5448 (8)) **The three service levels are rows of the one bounds table.** Kind `level`, never a second table: Level 1 Team, Level 2 Institution, Level 3 Enterprise (K5438), each `{name, design_stage, cf_plan, record_bytes, members_at_once, upload_bytes, measured}`, `record_bytes` the database and R2 bytes apart; `measured` is `null` until a load-test row is recorded in `PLATFORM.md` (its `source` `PLATFORM.md P-M<n>`, as `PLATFORM_FIGURES`, R34). Level 1's bounds are R37's per-kind rows. `levelOf(copy)` answers 1, 2 or 3 from the copy's design stage and the plan it declares, never from a guess; an undeclared copy answers 1, and a Level 1 copy declaring a higher plan still answers 1 (PL25). The `level` kind's rows carry their own fields; R29's four-field row shape stays for the kinds it names, and `read-bounds.test.mjs:18` (exactly those four fields) is amended by name for the kinds `level` and `time` (R41). Test: each level by `levelOf`; an undeclared copy answers 1; `measured` is `null` for every level until a row is recorded. Control: the rows of R29–R35 answer as before.
- **R39** (T53; K5438, K5569; PL21) **An unmeasured figure is never given to a caller that renders words for a team.** `levelFigures(level)` throws a `TypeError` naming the level while that level's `measured` is `null` (R38) and answers its figures once it is measured. Test: the throw for an unmeasured level; the figures for a measured fixture level. Control: `levelOf` answers for an unmeasured level.
- **R40** (T53; K5535 (C32); PL45 of `platform/load-test-draft.md`; N1272 R119) **The interpretation ceiling is a row beside the levels'.** Per level, the largest count of interpretation rows (and the bytes of their content) a team may hold, a row of kind `level` (R38) with `measured: null` until the load test's `report` records it (PL45: the largest count at which the screens that read the rows still hold their budgets at the level's rated load, flagged for Bob, not set, where the ordinary rate and the limit are within a factor of 10); R119's refusal (`extraction`) names this figure and the count held, through `levelFigures` (R39), so an unmeasured level has none and the refusal cannot quote an invented figure. Test: an unmeasured level has no ceiling and `levelFigures` throws; a fixture level with a recorded ceiling answers it. Control: R38's rows are unchanged.
- **R41** (T53; K4354, K5438; PL1 of `platform/time-budgets-draft.md` §2, §4; CONSISTENCY §2 rows 14, 16; K5448 (8)) **The time classes are rows of the one bounds table.** Kind `time`, never a second table, each `{ceiling_ms, p90_factor, hops}` with `source` naming the ruling (K4354) or the `PLATFORM.md` row; `p90_factor` is 1.5 (the p90 may be up to 1.5 times the ceiling; the median over at least 5 runs is the figure judged). `budgetOf(class)` answers that row and throws an `Error` naming the class when none exists. The thirteen classes (decided, K5571 (3); the keys from `time-budgets-draft.md` §2's table): `screen_load` 2,000 ms, 3 hops; `screen_move` 2,000 ms, 2 hops; `screen_load_phone` 2,000 ms, 3 hops; `read_act` 1,000 ms, 2 hops; `shell_act` 500 ms, 1 hops; `write_act` 2,000 ms, 2 hops; `web_capture_plain` 5,000 ms, no hop count; `web_capture_visitor` 15,000 ms, no hop count; `file_capture` 2,000 ms, no hop count; `ai_act` 60,000 ms, 2 hops; `gate_run` 1,800,000 ms, 2 hops; `follow` 1,000 ms, 2 hops; `explore` 2,000 ms, 2 hops. `screen_load` is a full load of a screen at 1280 px (hops: 3 after the combined read, 12 today); `screen_move` an in-app move; `screen_load_phone` a full load at 390 px, the same ceiling; `read_act` a list or a look; `shell_act` a setting or a level; `write_act` a share, reply, prepare, confirm or conclude; `web_capture_plain` and `web_capture_visitor` a web capture plain and as a visitor sees it (15 s, K4354); `file_capture` the acknowledgement of a file up to its kind's bound (R37) with `fetch_pending` while reading runs behind stated progress; `ai_act` an assistant answer or step and `gate_run` the capability suite scored by code for one (entry, part): each also answers within `ack_ms` 2,000 (acknowledged with progress visible), their `ceiling_ms` being the completion ceiling, 60,000 and 1,800,000, PLATFORM's figures until a measuring run replaces them (K5571 (3); a longer ceiling is a class of its own, never an override, R42); `follow` one `followfrom` read; `explore` the chain search a member waits on, which stops at its ceiling and says it stopped (`connection-grammar`'s `CHAIN_LIMITS` stay counts, R25 there). The reading of a whole file has a rate floor, not a total, and is not a class here (FILES owns the rate). Test: each class by `budgetOf` returns its figures; an unknown class throws naming it; the map is deeply frozen. Control: R29–R35's rows answer as before.
- **R42** (T53; K5438; PL2) **A per-screen or per-op row names its class and may override the ceiling downward only.** `budgetOf` of such a row answers the class's figures with its own `ceiling_ms` when that is lower than the class's; an override above its class's ceiling is refused (a longer ceiling is a class of its own, R41, never an override: CONSISTENCY row 14). Test: an override above the class is refused naming it, an override below is accepted. Control: a row with no override answers the class's ceiling.
- **R43** (T53; N1273; K5440, K5441; PL30 of `platform/record-placement-draft.md` §3; amends R27, R28) **The team's room can be kept in a jurisdiction.** `STORE_JURISDICTIONS` is the frozen list `eu`, `us`, `fedramp`; `storeJurisdiction(env)` answers `env.STORE_JURISDICTION` when it is exactly one of them, else `null`; `storeStub` and `storeId` take the room from `env.STORE.jurisdiction(j)` when a jurisdiction is set and from the hint's otherwise; a jurisdiction and a hint never both apply, and a copy that sets both is refused (Cloudflare's page does not say they combine). Test: each value; hint and jurisdiction together refused; neither gives today's behaviour (R28); the same name gives a different id in each jurisdiction. Control: a hint alone behaves as R27 and R28 state.
- **R44** (T53; N1273; PL31) **The generation suffix applies to a jurisdiction room as to a hinted one.** `storeId` for (jurisdiction, name, generation) is stable across calls; the suffix is on the object's name only (R28). Test: the same id twice; a changed generation changes it. Control: a hinted room's id is as R28 states.
- **R45** (T53; N1273; K5441; K5571 (2); PL34) **The one jurisdiction row serves the byte store as it serves the room.** `storeJurisdiction(env)` (R43) is the only value this module holds for a copy kept in a jurisdiction, and it is the same value for the team's R2 bucket as for the room (a bucket's jurisdiction cannot be changed afterwards); this module creates no bucket and runs no install. Creating the bucket in that jurisdiction, reading it through the jurisdiction's own endpoint, and the install's refusal before the room is created are `installer-steps` R47's. Test: `storeJurisdiction(env)` answers one of the three values or `null` and nothing else for the room and the bucket alike. Control: this module's source holds no call that creates a bucket or a room.
- **R46** (T53; N824; K5527 (2); N1267; amends R29, R35) **The mail figures are rows of `READ_BOUNDS`.** `message_bytes` (a message received by address, 25 MiB, Cloudflare's own limit, never above `boundOf("archive", "uploaded_bytes")`), `per_member_hour` (20), `per_team_day` (200), `waiting_days` (14), `nest_max` (3) and `nest_read_max` (4, the reader's count) are rows of kind `mail`, and `discard_days` (7) a row of kind `doorbell` (DEC-108 (5); `doorbell` R30's discard clearing quotes it): each `{standard, alpha, protective, key}` with all three figures the one figure (`same(n, key)`, R35's form), quoted once as `boundOf("mail", name)` and `boundOf("doorbell", "discard_days")`; `mail-door`, `mail-reader`, `doorbell`, `capture` and `provenance` quote them and write no literal. The per-service-level figures of these rows are PLATFORM's to place (R38) and are not stated here. Test: each key answers its active figure; a literal of any of them in those modules' source fails the check. Control: the existing keys answer as before.
- **R47** *(not yet met: T53)* (T53; N1259 (part a, `acquisition` R126); K4403 (2); K4837; K5530 F4) **A register piece's input and stored segments have rows of their own.** `READ_BOUNDS` gains two rows of kind `register`: `stream_max`, the most a register piece may stream (`REGISTER_STREAM_MAX`), and `segment_max`, the most one stored segment may hold (`REGISTER_SEGMENT_MAX`, never above `CAPTURE_MAX`, `boundOf("archive", "uploaded_bytes")`); `acquisition` quotes both and `READ_BOUNDS` is not applied to `register-readers`' stream (K5530 F4). The figures are set at START from the throughput, CPU, subrequest and decoder-state measure M-R7 (the measured sources reach 5.46 GiB per federal zip and 1.49 GiB for the state's), each with `source` naming the measure; until it is recorded the rows do not exist. Test: the rows answer through `boundOf`; `segment_max` is not above `CAPTURE_MAX`; `stream_max` exceeds the largest measured source. Control: the other rows answer as before.

## Private

### Uses

- None. `runtime-limits` is Layer 1 with no `uses` entry in `modules.json`; every reading module takes a `uses` edge to it for R29-R34 (K4835 (1)). `unattendedCredential` (R26) calls
  this module's own `liveToken`.

### Invariants

- **R22** Pure: no store, no network fetch, and (outside `cpuProbe`'s own injectable `now`) no clock.
  Every service gives the same answer for the same inputs; `cpuProbe`'s `elapsed_ms` is the one exception,
  since it depends on when it runs. (Fix round 9: a byte ledger, R32, keeps counters inside the object its caller made and nowhere else; `READ_BOUNDS` and `PLATFORM_FIGURES` are frozen constants.)
- **R23** No function here accepts or sets a credential. `env.INSTANCE_AI_TOKEN` reaches this module
  only by already being present on the `env` object the caller passes at each call; nothing exported here
  can create, change or clear it (DS-3, D-260 §6: minting and setting an account credential is a member act
  elsewhere, never a plane write path). No Claude credential is read from `env` at all (R13, R17; K1502): a
  member's own account reference and the group's API key are `credentials`' (K1755).
- **R24** `report()` never states a duration for synchronous work: `measured_ms` is always `null`, and
  `note` says why, rather than reporting a zero that would read as a measurement.
- **R25** No place is named in this module (`build/layers.md`, "No jurisdiction in the product"). It holds
  no local fact of any jurisdiction, and none of its behaviour depends on one. A Cloudflare location hint is where the hosting platform runs the team's room, not a jurisdiction and not a place the product acts on (fix round 7, G3; K4752).

No check in `bio-plane/checks/bio-checks.mjs` names `cpu.mjs`, `tokens.mjs`, or any function or constant
of either file — this module owns no C-numbered check today.

### Satisfies

- `BIO_Distribution_v0_1.md` §6 (D-260, DS-3): an instance may hold one organisation-principal `ai`
  credential as a deploy secret (`INSTANCE_AI_TOKEN`), never generated by this module, denylisted on
  publication like every other token.
- `BIO_Assistant_and_AI_Roles_v0_1.md` §6, D-260 (RULED by BOB #22, 2026-09-21): publication of a
  credential's value is revocation.
- K1502 and K1503 (`BIO_Assistant_and_AI_Roles_v0_1.md` §6 as amended), with K1755: no project-wide
  Claude account, and the subscription token is each member's own by Bob's choice (K1755); the group's API key, when held, is `credentials`'; the
  group's copy binds no Claude credential in its environment (R13, R17, R23).
- The CPU-measurement half (`makeMeter`, `burn`, `cpuProbe`) rests on no canon design section; it is
  runtime instrumentation the code itself records discovering (2026-07-29: a Worker cannot time its own
  synchronous compute, so consumption is counted in work and the ceiling is found by a checkpointed
  probe instead).

- K4831 (3) and (8), K4834 and K4835 (1) (fix round 9): the alpha's limits stated to members with the file's size and the limit, the protective class of limits, the light kinds at the standard in Stage 1, and the table's home in this module (R29-R31); `build/plan/fix-round-9-T51.md` G123a and G124, R-GATE (R34).
- K4628 (3), K5427, K5439 (N1267): the beta's file bounds and protective limits, stated to members with the file's size and the limit (R37).
- K4354, K5438, K5569 (PLATFORM): the time classes and the three service levels as rows of this one table (R38–R42); K5440, K5441 (N1273): the room in a jurisdiction (R43–R45).

### Suggestions

- Callers of `cpuProbe` (today, `legacy-index`'s `op=cpuprobe`) should make `checkpoint` itself durable
  (a store write) before it resolves: the whole design rests on the last completed step's checkpoint
  surviving an isolate kill that `cpuProbe` itself cannot detect or report, and a `checkpoint` that only
  buffers in memory defeats that.
- `unattendedCredential` (R26) is read by `capture-requests` and `monitoring` until their in-process paths
  (capture-requests R16, monitoring R23) leave them nothing to spend; `monitoring` keeps its own
  `MONITOR_NO_LIVE_CREDENTIAL` sentence for a `token()` of `null`.
- Today's callers: `subresources` uses `makeMeter`; `legacy-index` uses `cpuProbe`, `liveToken` (to admit
  `ADMIN_TOKEN`/`MEMBER_TOKEN`/`PROBE_TOKEN`/`DAEMON_TOKEN`) and re-exports `PUBLISHED_TOKEN_HASHES`;
  `legacy-store` uses `liveToken`, `sha256hex`, `instanceAiCredential` and `instanceClaudeToken`
  (after K1502 the last always answers `null`; its callers, `agent-worker`'s cascade among them, re-point to
  the member's own reference in their T33 jobs, and the two Claude services may then be removed by a later
  change);
  `legacy-index`'s `livefire.mjs` checks configured bindings directly against `PUBLISHED_TOKEN_HASHES`.
  None of this module's own tests may depend on those legacy files; test each service directly.
- A caller combining this module's `cpuProbe`/meter output with other runtimes limits (for example the
  subrequest ceiling, `legacy-store`'s concern) is composing several modules' reports; that composition is
  not this module's requirement.
