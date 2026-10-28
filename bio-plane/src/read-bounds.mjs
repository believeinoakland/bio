/* The reading ceilings, one table (runtime-limits R29, R30, R31; fix round 9 G124; K4831 (3) (8), K4834, K4835 (1)).
 *
 * Every ceiling a reading module keeps is a row here: `standard` is the figure the standard sets (K4628), `alpha` the
 * figure the alpha keeps (the kind's own figure at the start of fix round 9 where it is lower), `protective` a limit
 * against a file no ordinary program produces. A quoting module writes `export const X_MAX = boundOf(kind, name)` and
 * holds no numeric literal for a ceiling; the sentence a refusal says is the quoting module's (`key` names it). A job
 * adds its own row below, with the three figures. MB and GB count 2^20 and 2^30 bytes (K4840 (1)). Where the
 * requirements give no standard for a heavy kind, the row's standard is K4628's per kind (K4845: documents 100 MB,
 * spreadsheets and images 50 MB; the alpha where it is above), a count or time row's standard is its alpha, and the
 * protective figure is the one R30 names, else the standard. Pure; nothing at load but the frozen table.
 *
 * T53 (R37-R42): the beta's per-kind bounds are the active figure of the whole-read rows of BETA_STANDARD_ROWS (their
 * `standard`; the alpha stays in the row's `alpha` column); the kinds `level` (the three service levels, R38-R40) and
 * `time` (the time classes, R41-R42) are rows of this table with their own fields and are not byte rows. */

const KiB = 1024, MiB = 1048576, GiB = 1073741824, MB50 = 52428800, MB100 = 104857600;

/* the light kinds take the standard in Stage 1 (K4834) */
const LIGHT_KINDS = Object.freeze(["text", "csv", "tsv", "json", "xml"]);

const row = (standard, alpha, protective, key) => ({ standard, alpha, protective, key });
/* a byte row of a heavy kind: the standard is K4628 per kind (K4845): documents 100 MB, spreadsheets and images 50 MB; where the alpha is above it, the alpha */
const bytes = (alpha, key, perKind) => row(Math.max(alpha, perKind), alpha, Math.max(alpha, perKind), key);
/* a count or size with one figure for all three columns */
const same = (n, key) => row(n, n, n, key);
const k = (kind, name) => `limit.${kind}.${name}`;

/* the text kind (text, JSON, XML, NDJSON, HTML and the text-like) is 100 MB in the beta (K5427); the spreadsheet kinds csv and tsv are 50 MB (N1267) */
const light = (kind, alphaBytes, beta = MB50) => ({
  bytes: row(beta, alphaBytes, beta, k(kind, "bytes")),
  rows: row(1048576, 1048576, 1048576, k(kind, "rows")),
});

const TABLE = {
  /* request_bytes: the most of a stored text, office or HTML document (any kind but a PDF) a member's request reads inline; above it the reading is deferred to the ledger, never refused (K4916) */
  text: { ...light("text", 24 * MiB, MB100), nesting: same(1000, k("text", "nesting")), calendar_events: same(100000, k("text", "calendar_events")), request_bytes: same(3 * MiB, k("text", "request_bytes")) },
  csv: light("csv", 17 * MiB),
  tsv: light("tsv", 24 * MiB),
  json: light("json", 24 * MiB, MB100),
  xml: { ...light("xml", 24 * MiB, MB100), tag: same(64 * KiB, k("xml", "tag")) },
  archive: {
    uploaded_bytes: row(524288000, 256 * MiB, 524288000, k("archive", "uploaded_bytes")),
    unpacked_bytes: row(2 * GiB, 256 * MiB, 2 * GiB, k("archive", "unpacked_bytes")),
    depth: same(3, k("archive", "depth")),
    ratio: same(1100, k("archive", "ratio")),
    members: same(10000, k("archive", "members")),
    directory: same(16 * MiB, k("archive", "directory")),
    name: same(4096, k("archive", "name")),
    /* a member's bytes: the ooxml reader's own figure (OOXML R30 `MEMBER_MAX`, K4857) */
    member_bytes: row(2 * GiB, 256 * MiB, 2 * GiB, k("archive", "member_bytes")),
    /* the most messages in one mailbox (MBOX), a protective limit (K5439) */
    mailbox_messages: same(100000, k("archive", "mailbox_messages")),
  },
  /* the beta's whole-read rows of the kinds N1267 names (R37, `SIZES-N1267.md` §2): a spreadsheet is 50 MB or about 1,000,000 rows, an XLS 65,536 rows a sheet in its own format, a workbook's rows counted over its sheets; a message (EML, MSG) 100 MB uploaded, every attachment a member */
  spreadsheet: {
    bytes: same(MB50, k("spreadsheet", "bytes")),
    rows: same(1048576, k("spreadsheet", "rows")),
    xls_sheet_rows: same(65536, k("spreadsheet", "xls_sheet_rows")),
  },
  message: { upload_bytes: same(MB100, k("message", "upload_bytes")) },
  pdf: {
    bytes: bytes(24 * MiB, k("pdf", "bytes"), MB100),
    worker_bytes: bytes(64 * MiB, k("pdf", "worker_bytes"), MB100),
    need_mb: same(100, k("pdf", "need_mb")),
    page_content: same(64 * MiB, k("pdf", "page_content")),
    /* 32 MiB: 16 MiB refused a real govinfo file's 18.55 MiB object stream (K4862) */
    object_stream: same(32 * MiB, k("pdf", "object_stream")),
    cmap: same(MiB, k("pdf", "cmap")),
    embedded_file: same(64 * MiB, k("pdf", "embedded_file")),
    objects: same(2000000, k("pdf", "objects")),
    direct_object: same(4 * MiB, k("pdf", "direct_object")),
    operands: same(65536, k("pdf", "operands")),
    tree_depth: same(256, k("pdf", "tree_depth")),
    bfrange_codes: same(65536, k("pdf", "bfrange_codes")),
    xmp: same(2 * MiB, k("pdf", "xmp")),
    /* the most of a PDF one member request reads; above it the work is owed to the ledger, never refused (K4901) */
    request_bytes: same(2 * MiB, k("pdf", "request_bytes")),
  },
  image: {
    /* an image (JPEG, PNG, TIFF, HEIC, GIF, WebP, BMP, AVIF) is 50 MB each (R37) */
    bytes: same(MB50, k("image", "bytes")),
    /* image-cover's rows (BOB #326, T53): today's figures in all three columns */
    redraw_bytes: same(33554432, k("image", "redraw_bytes")),
    photo_profile_max: same(1048576, k("image", "photo_profile_max")),
    photo_profile_tags: same(256, k("image", "photo_profile_tags")),
    photo_exif_bytes: same(1048576, k("image", "photo_exif_bytes")),
    photo_directory_entries: same(1024, k("image", "photo_directory_entries")),
    photo_field_chars: same(256, k("image", "photo_field_chars")),
    photo_text_chars: same(4096, k("image", "photo_text_chars")),
    photo_list_items: same(64, k("image", "photo_list_items")),
    photo_xmp_bytes: same(262144, k("image", "photo_xmp_bytes")),
    photo_inflated_bytes: same(262144, k("image", "photo_inflated_bytes")),
    pixels: same(120000000, k("image", "pixels")),
    edge: same(65535, k("image", "edge")),
    chunks: same(65536, k("image", "chunks")),
    row_stride: same(8 * MiB, k("image", "row_stride")),
    cover_bytes: bytes(32 * MiB, k("image", "cover_bytes"), MB50),
    picture_frame: same(4096 * 3072 * 3, k("image", "picture_frame")),
    /* the figures the image jobs already hold (K4858, K4859) */
    working_set: same(61300000, k("image", "working_set")),
    retained_objects: same(250000, k("image", "retained_objects")),
    picture_source: same(603979776, k("image", "picture_source")),
    /* pixels of the rows route: 16384 x 12288, today's photo ceiling (K4862) */
    rows_pixels: same(201326592, k("image", "rows_pixels")),
  },
  ocr: {
    frame_bytes: bytes(61300000, k("ocr", "frame_bytes"), MB50),
    picture_edge: same(4096, k("ocr", "picture_edge")),
  },
  render: {
    safe_view_bytes: same(32 * MiB, k("render", "safe_view_bytes")),
    safe_view_pages: same(500, k("render", "safe_view_pages")),
    /* the serialised-DOM bound capture-sources' `renderBlock` takes as `domBound.bound`: 25 MiB, BOB's protective figure (K4831 (8)) */
    dom_bytes: same(25 * MiB, k("render", "dom_bytes")),
  },
  /* the acquisition module's ceilings (K4882): `MULTIPART_KEEP_MAX` and `PROFILE_TEXT_MAX`, today's figures in all three columns */
  capture: {
    keep_bytes: same(32 * MiB, k("capture", "keep_bytes")),
    profile_text_bytes: same(8 * MiB, k("capture", "profile_text_bytes")),
  },
  document: {
    /* a document (PDF, DOCX, DOC, PPTX, PPT, ODT, ODP, RTF) is 100 MB or 5,000 pages, a PDF's pages counted from its page tree and a multi-page TIFF's counting toward the same 5,000 (R37) */
    bytes: same(MB100, k("document", "bytes")),
    pages: same(5000, k("document", "pages")),
    clean_bytes: bytes(16 * MiB, k("document", "clean_bytes"), MB100),
    /* a part of a document: standard 100 MB, the alpha and the protective figure 32 MiB (K4860) */
    part_bytes: row(MB100, 32 * MiB, 32 * MiB, k("document", "part_bytes")),
  },
  file_safety: {
    grade_read: bytes(20 * MiB, k("file_safety", "grade_read"), MB100),
    /* the declared size of an OpenDocument sheet's content.xml above which no preview is drawn: file-safety's SAFE_VIEW_ODS_DECLARED_MAX, today's figure (K4893) */
    ods_declared: same(8 * MiB, k("file_safety", "ods_declared")),
  },
  /* the content module's ceilings, today's figures (K4916): `held_text_chars` a count of characters, `kind_scan_pages` a count of pages of units */
  content: {
    held_text_chars: same(32 * MiB, k("content", "held_text_chars")),
    kind_scan_pages: same(16, k("content", "kind_scan_pages")),
  },
  /* the calculations module's read ceilings, today's figures (K4922): `TABLE_MAX_BYTES` (20 MiB of canonical CSV) and `TABLE_MAX_CELLS` (a count) */
  table: {
    bytes: same(20 * MiB, k("table", "bytes")),
    cells: same(1000000, k("table", "cells")),
  },
  /* the ceilings the reading modules keep beside acquisition's, today's figures in all three columns (R35; K4958): no bound moves (K1881) */
  provenance: { part_verify_bytes: same(8 * MiB, k("provenance", "part_verify_bytes")) },
  acquisition: {
    odf_digest_bytes: same(8 * MiB, k("acquisition", "odf_digest_bytes")),
    large_fetch_bytes: same(8 * MiB, k("acquisition", "large_fetch_bytes")),
  },
  case: { copy_now_bytes: same(2 * MiB, k("case", "copy_now_bytes")) },
  monitoring: { docket_read_bytes: same(8 * MiB, k("monitoring", "docket_read_bytes")) },
  following: { portal_parse_bytes: same(4 * MiB, k("following", "portal_parse_bytes")) },
  /* the mail figures (R46; N824, K5527 (2)): a message received by address 25 MiB (Cloudflare's own limit), 20 an hour a member, 200 a day a team,
   * 14 days waiting, nesting 3 (the reader counts 4); the doorbell's discard 7 days (DEC-108 (5)). One figure in all three columns, quoted once. */
  mail: {
    message_bytes: same(25 * MiB, k("mail", "message_bytes")),
    per_member_hour: same(20, k("mail", "per_member_hour")),
    per_team_day: same(200, k("mail", "per_team_day")),
    waiting_days: same(14, k("mail", "waiting_days")),
    nest_max: same(3, k("mail", "nest_max")),
    nest_read_max: same(4, k("mail", "nest_read_max")),
  },
  doorbell: { discard_days: same(7, k("doorbell", "discard_days")) },
  office: {
    entries: same(100000, k("office", "entries")),
    retained_objects: same(250000, k("office", "retained_objects")),
    /* the ooxml reader's text figures: ooxml R6 `MEASURED_OOXML_TEXT_BOUND_BYTES`, R35 `STREAMED_TEXT_BOUND_BYTES` (K4857) */
    text_bytes: row(MB100, 20 * MiB, MB100, k("office", "text_bytes")),
    streamed_text_bytes: row(MB100, 32 * MiB, MB100, k("office", "streamed_text_bytes")),
    /* a count of characters, not bytes (K4858) */
    decoded_chars: same(64 * MiB, k("office", "decoded_chars")),
    /* protective (K4859) */
    structural_part_bytes: same(8 * MiB, k("office", "structural_part_bytes")),
    piece_chars: same(8 * MiB, k("office", "piece_chars")),
  },
  /* the file scanner's ceilings (K4858); `time_ms` is milliseconds, `partitions` and `icons_pe` counts */
  scan: {
    max_bytes: row(524288000, 256 * MiB, 524288000, k("scan", "max_bytes")),
    time_ms: same(900000, k("scan", "time_ms")),
    embedded_pe: same(40 * MiB, k("scan", "embedded_pe")),
    html_normalize: same(40 * MiB, k("scan", "html_normalize")),
    script_normalize: same(20 * MiB, k("scan", "script_normalize")),
    zip_type_rcg: same(MiB, k("scan", "zip_type_rcg")),
    partitions: same(50, k("scan", "partitions")),
    icons_pe: same(100, k("scan", "icons_pe")),
  },
  sheet: {
    columns: same(16384, k("sheet", "columns")),
    cell_chars: same(32767, k("sheet", "cell_chars")),
    cell_kept_chars: same(MiB, k("sheet", "cell_kept_chars")),
    sheets: same(1000, k("sheet", "sheets")),
  },
  xlsx: { declared_text: bytes(32 * MiB, k("xlsx", "declared_text"), MB50) },
  ods: {
    content_xml: bytes(20 * MiB, k("ods", "content_xml"), MB50),
    repeat_units: same(262144, k("ods", "repeat_units")),
  },
  /* the analysis workbook: its add holds up to 250,000 cells once the workbook-add job merges (K4831 (10)); the file 20 MiB;
   * the cells' JSON 64 MiB, a protective figure from the capped-child measure (K4831 (8)) */
  workbook: {
    cells: same(250000, k("workbook", "cells")),
    bytes: bytes(20 * MiB, k("workbook", "bytes"), MB50),
    cells_json_bytes: same(64 * MiB, k("workbook", "cells_json_bytes")),
  },
  sheet_worker: {
    cells: same(250000, k("sheet_worker", "cells")),
    bytes: bytes(9000000, k("sheet_worker", "bytes"), MB50),
    ms: same(120000, k("sheet_worker", "ms")),
  },
};

/* the rows whose ACTIVE figure is the beta's: the `standard` of the whole-read row of each kind R37 names (R36's `wholeReadRow`; K4628 (3) option B, K5427);
 * a row not listed keeps the alpha as its active figure (no bound moves, K1881): a reader's own rows (a worker's bytes, a part's text, a package's
 * declared text) take the standard when that reader's job moves them. The light kinds (below) take the standard already. */
export const BETA_STANDARD_ROWS = Object.freeze([
  ["pdf", "bytes"], ["document", "bytes"], ["spreadsheet", "bytes"], ["image", "bytes"], ["archive", "uploaded_bytes"], ["message", "upload_bytes"],
].map((r) => Object.freeze(r)));

/* The three service levels (R38-R40; PL20, PL21, PL45 of `service-levels-draft.md`). `design_stage` and `cf_plan` are identifiers, never
 * sentences (K3971); the words a team reads for a level are UX-DESIGN's. The figures are the draft's estimates until a load-test row is
 * recorded in `PLATFORM.md`: `measured` is null until then, and `levelFigures` gives none to a caller (R39). `record_bytes` holds the
 * database and R2 apart (a null figure is one the level's design has not set); `interpretation_rows` / `interpretation_bytes` are the
 * interpretation ceiling (R40), null until the load test's report records it. */
const level = (name, design_stage, cf_plan, database, r2, upload_bytes) => ({
  name, design_stage, cf_plan, record_bytes: { database, r2 }, members_at_once: null, upload_bytes,
  measured: null, interpretation_rows: null, interpretation_bytes: null,
});
const LEVELS = {
  team: level("team", "one_room", "workers_paid", 10 * GiB, 50 * GiB, MB100),
  institution: level("institution", "split_record", "workers_paid", null, null, 200 * MiB),
  enterprise: level("enterprise", "split_cached", "enterprise", null, null, 5 * GiB),
};

/* The time classes (R41; PL1 of `time-budgets-draft.md` §2, §4): `ceiling_ms`, the p90 allowed up to `p90_factor` times it (the median of at
 * least 5 runs is the figure judged), the critical-path `hops` (null where the class counts none), and the `source` ruling. `ack_ms` is the
 * acknowledgement an act with a longer completion ceiling owes (K5571 (3)). */
const time = (ceiling_ms, hops, source, ack_ms) => ({ ceiling_ms, p90_factor: 1.5, hops, source, ...(ack_ms ? { ack_ms } : {}) });
const TIME = {
  screen_load: time(2000, 3, "K4354"),
  screen_move: time(2000, 2, "K4354"),
  screen_load_phone: time(2000, 3, "K4354"),
  read_act: time(1000, 2, "K4354"),
  shell_act: time(500, 1, "K4354"),
  write_act: time(2000, 2, "K4354"),
  web_capture_plain: time(5000, null, "K4354"),
  web_capture_visitor: time(15000, null, "K4354"),
  file_capture: time(2000, null, "K4354"),
  ai_act: time(60000, 2, "K5571 (3)", 2000),
  gate_run: time(1800000, 2, "K5571 (3)", 2000),
  follow: time(1000, 2, "K5571 (3)"),
  explore: time(2000, 2, "K5571 (3)"),
};

const deepFreeze = (o) => { for (const v of Object.values(o)) if (v && typeof v === "object") deepFreeze(v); return Object.freeze(o); };

export const READ_BOUNDS = deepFreeze({ ...TABLE, level: LEVELS, time: TIME });

/* the kinds whose rows carry their own fields and no byte figure: boundOf and statement answer no row of these */
const OWN_FIELD_KINDS = Object.freeze(["level", "time"]);

const rowOf = (kind, name) => {
  const r = !OWN_FIELD_KINDS.includes(kind) && Object.hasOwn(READ_BOUNDS, kind) && Object.hasOwn(READ_BOUNDS[kind], name) ? READ_BOUNDS[kind][name] : null;
  if (!r) throw new Error(`READ_BOUNDS has no row for kind ${String(kind)}, name ${String(name)}`);
  return r;
};

const isBeta = (kind, name) => LIGHT_KINDS.includes(kind) || BETA_STANDARD_ROWS.some(([k, n]) => k === kind && n === name);

/* the ACTIVE figure: the standard for the light kinds (K4834) and the beta's whole-read rows (R37), else the alpha */
export const boundOf = (kind, name) => {
  const r = rowOf(kind, name);
  return isBeta(kind, name) ? r.standard : r.alpha;
};

/* the size the caller measured, the figure it was judged against and the member sentence's key */
export const statement = (kind, name, size) => ({ size, bound: boundOf(kind, name), key: rowOf(kind, name).key });

/* the row that is a document's whole-read ceiling by its kind (K4965): pdf, csv and text each their own `bytes`, any other kind or none the whole-load row `pdf.bytes` */
export const wholeReadRow = (kind) => {
  if (kind === "csv" || kind === "text") return [kind, "bytes"];
  /* the beta's kinds (R37): the kind's own whole-read row */
  if (kind === "document" || kind === "spreadsheet" || kind === "image") return [kind, "bytes"];
  if (kind === "message") return ["message", "upload_bytes"];
  if (kind === "archive") return ["archive", "uploaded_bytes"];
  return ["pdf", "bytes"];
};

/* ---- the three service levels (R38-R40) ---- */
const PLAN_RANK = Object.freeze({ workers_paid: 1, business: 1, enterprise: 2 });
const STAGE_LEVEL = Object.freeze({ one_room: 1, split_record: 2, split_cached: 3 });

/* the level of a copy from the design stage and the plan it declares (never a guess): an undeclared or unknown stage is 1, a design stage above 1 needs
 * a plan that holds it (Level 3 needs Enterprise, else the copy is Level 2), and a Level 1 copy declaring a higher plan is still 1 (PL25) */
export const levelOf = (copy) => {
  const stage = Object.hasOwn(STAGE_LEVEL, copy?.design_stage) ? STAGE_LEVEL[copy.design_stage] : 1;
  if (stage === 3 && PLAN_RANK[Object.hasOwn(PLAN_RANK, copy?.cf_plan) ? copy.cf_plan : "workers_paid"] < PLAN_RANK.enterprise) return 2;
  return stage;
};

const LEVEL_NAMES = Object.freeze(["team", "institution", "enterprise"]);
const levelRow = (level) => {
  if (!Number.isInteger(level) || level < 1 || level > 3) throw new Error(`no service level ${String(level)}`);
  return READ_BOUNDS.level[LEVEL_NAMES[level - 1]];
};

/* the figures of a level row, once measured (R39): a row whose `measured` is null throws a TypeError naming the level, so no caller that renders words for
 * a team is given an unmeasured figure (PL21); the interpretation ceiling (R40) is among them */
export const levelFiguresOf = (row) => {
  if (row?.measured == null) throw new TypeError(`service level ${String(row?.name)} is not yet measured`);
  const { measured, ...figures } = row;
  return Object.freeze({ ...figures, record_bytes: Object.freeze({ ...row.record_bytes }), measured });
};
export const levelFigures = (level) => levelFiguresOf(levelRow(level));

/* ---- the time classes (R41, R42) ---- */
/* a class name, or a per-screen / per-op row `{class, ceiling_ms?}`: the class's row, with the row's own ceiling when it is lower; a ceiling above the
 * class's is refused (a longer ceiling is a class of its own, never an override) */
export const budgetOf = (spec) => {
  const name = typeof spec === "string" ? spec : spec?.class;
  const base = typeof name === "string" && Object.hasOwn(READ_BOUNDS.time, name) ? READ_BOUNDS.time[name] : null;
  if (!base) throw new Error(`no time class ${String(name)}`);
  if (typeof spec === "string" || spec.ceiling_ms === undefined) return base;
  if (!Number.isFinite(spec.ceiling_ms) || spec.ceiling_ms <= 0 || spec.ceiling_ms > base.ceiling_ms) {
    throw new Error(`ceiling_ms ${String(spec.ceiling_ms)} is above the ceiling of time class ${name}`);
  }
  return Object.freeze({ ...base, ceiling_ms: spec.ceiling_ms });
};
