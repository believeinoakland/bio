/* file-safety — keeps every captured file safe to open without touching its bytes, digest or grade (layer 3, directly
 * after `capture`; Bob's K1913, K1928, K1929, K1939, K1949 with DEC-168, DEC-169 and DEC-173, packaged by BOB, K2008,
 * K2063; new at T36, T36-11; its own cadences, T37-8). Requirements: `build/requirements/file-safety.md` (R1–R50).
 *
 * WHAT IT HOLDS. Verdict notes beside each capture naming tool, engine and version (R2, R3); the scan and render queue
 * (R1, R4, R12); scan holds and their release by two members or a second, different engine (R15–R19); deeper checks
 * (R13, R14, R36); safe views and safe copies, each a derived file stored under its own digest outside `captures/`,
 * never registered, graded or cited (R11, R12, R33, R37); the group's security tools with their stated handling (R27–
 * R32); and this module's counts by hour, forwarded with `credentials`' to the group's log tools (R35). It keeps no
 * record of who opened, viewed, copied or asked about which file (R10; K1892): no row, note, counter or log line names
 * a member beside a file but the release of a hold, which is an act of record (R17).
 *
 * ITS CADENCES (R39–R41; T37). Each batch states when it next wants to run (`scanWake` … `reputationWake`), from the
 * instants it keeps in `fs_wakes`, so the scheduler holds no interval for it; an act that gives a batch work sooner
 * tells the modules registered with `onFileWork`, after the act commits (record-core R66).
 *
 * WHAT IT NEVER DOES. It writes no capture, receipt, register row, grade, promotion state or provenance document (R7,
 * R22, R37): the threat grade (R6) is computed at each call from the capture's receipts, its reader's `active` list, its
 * notes and, for an archive, `acquisition.archiveList`, and it is never stored. Nothing it sends `file-scanner` names a
 * member, a file name, an address or record text: only the store, the target, a tool spec and a counts record (R23).
 *
 * SHAPE (K61). `fileSafetyOf(ctx, opts)` answers the one instance for a Durable Object's storage, reaching record-core,
 * membership, credentials, provenance and acquisition by their factories on the same `ctx` (a test may pass its own),
 * and the Worker's `env` (the `FILE_SCANNER` binding and the `CAPTURES` bucket) on the first call. Its first
 * construction is this module's start: it registers its receipt listener with provenance (R1). `migrate()` creates and
 * declares its tables (R25). `fileSafetyOps` is its route map. No service throws; every refusal names its row (R24). */
import { canonicalJson, sha256HexSync, isMachineIdentity, MACHINE_CLASS_PREFIX } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, notAnAdmin, listenerRefusal } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { acquisitionOf, readRange } from "../acquisition/index.mjs";
import { boundOf } from "../read-bounds.mjs";
import { captureObjectOp } from "../capture/ops.mjs";
import { SCAN_BATCH_MAX, LOG_COUNT_KINDS, SAFE_VIEW_BYTES_MAX, SAFE_VIEW_PAGES_MAX } from "../../../file-scanner/src/limits.mjs";
import { PROVIDERS, REFUSED_PROVIDERS, HELD_PROVIDERS, providerById, resolveDescriptor, differentEngine }
  from "../../../file-scanner/src/providers/catalogue.mjs";
import { FILE_SAFETY_SCHEMA, FILE_SAFETY_TABLES, FILE_SAFETY_ADDITIVE_COLUMNS } from "./schema.mjs";
import { FILE_SAFETY_CHECKS, THREAT_REASONS, PROVIDER_REASON_WORDS } from "./checks.mjs";
import { describe, readActive, activeFromDirectory, sheetsOf, sheetWindow, structureFlags, safeViewRoute, ACTIVE_FORMATS, PLAIN_FORMATS, CONTAINER_FORMATS,
         READ_IMAGES, SAFE_VIEW_TEXT_MAX, HEAD_MAX, needsWholeFile, wholeCharacters, textView, SAFE_VIEW_CELLS_MAX } from "./formats.mjs";
import { rowKey, SENTENCE_KEYS } from "./words.mjs";
export { FILE_SAFETY_CHECKS, THREAT_REASONS, PROVIDER_REASON_WORDS } from "./checks.mjs";
export { SAFE_VIEW_TEXT_MAX, SAFE_VIEW_CELLS_MAX, SAFE_VIEW_SHEETS_MAX, SAFE_VIEW_TOTAL_CELLS_MAX, SAFE_VIEW_INLINE_CELLS_MAX_BYTES,
         SAFE_VIEW_ODS_DECLARED_MAX, sheetsOf } from "./formats.mjs";
export { SCREEN_WORDS, SCREEN_WORD_KEYS } from "./screen-words.mjs";
export { SENTENCE_KEYS } from "./words.mjs";
export { FINDING_KINDS, NO_PLAIN_DESCRIPTION, findingKind } from "./kinds.mjs";
export { FILE_SAFETY_TABLES } from "./schema.mjs";
import { findingKind } from "./kinds.mjs";
import { localize, WORD_ROWS } from "../setup-words/index.mjs";

export const FILE_SAFETY_MODULE = "file-safety";
/* T50 (plan rule 6; setup-words R11–R13): every key this module reads, the rows' own (`refusal.<CODE>`) and the sentences'. A row
   whose word the design stream has not yet written (a stand-in, `checks.mjs`) is not yet read by key: the list holds a stand-in
   as a row of source "code" once regenerated, so a key is read only when its row is the design's. */
/* R52 (fix round 7 G84): the design's keys gathered in one pass over the table, not one pass per key at load. */
const DESIGN_KEYS = new Set(WORD_ROWS.filter((r) => r[5] === "design").map((r) => r[0]));
export const WORD_KEYS = Object.freeze([...Object.keys(FILE_SAFETY_CHECKS).map(rowKey).filter((key) => DESIGN_KEYS.has(key)), ...SENTENCE_KEYS]);

/* R21: the constants, by name. `SCAN_BATCH_MAX` and `LOG_COUNT_KINDS` are `file-scanner`'s (its R16). */
export const RESCAN_INTERVAL_MS = 604_800_000;
export const DEEPER_CHECK_FRESH_MS = 86_400_000;
export const DEEPER_CHECKS_PER_MONTH = 900;
/* R39 (T37): the poll while render or deeper work is left (and the floor of a retry), and a reputation list's refresh. */
export const FILE_SAFETY_POLL_MS = 300_000;
export const REPUTATION_REFRESH_MS = 21_600_000;
export { SCAN_BATCH_MAX, LOG_COUNT_KINDS, SAFE_VIEW_BYTES_MAX, SAFE_VIEW_PAGES_MAX };
/* R51 (fix round 4b; F3a, F10): how often a file whose bytes are not (all) held is looked at again for its scan and its safe
   view (one hour: D2's back-off ceiling), and the most of a file the grade, the structure check and the safe view's cells load
   into this object's memory: above it the file is judged by its start and stated unread. */
export const WAITING_RECHECK_MS = 3_600_000;
export const GRADE_READ_MAX = boundOf("file_safety", "grade_read");
/* R55 (fix round 9, G92): the longest a firing waits for one call to `file-scanner`; the call goes on and its result is kept. Injectable. */
export const SCANNER_CALL_BOUND_MS = 8_000;
/* R12 (G136b): the back-off of a render that failed for a reason a later try can cure, and the age at which an in-flight render's mark is
   taken to be left by a stopped firing (a render takes up to the renderer's own time limit). */
export const RENDER_RETRY_MS = 300_000;
export const RENDER_INFLIGHT_STALE_MS = 1_200_000;

/* R5: a file due for more than a day is overdue. R8: the scan before first opening waits this long within the call
   before it answers `SCAN_PENDING` (the Suggestions' "a few seconds"); the scan goes on and writes its note. */
export const OVERDUE_MS = 86_400_000;
/* R49, R50 (fix round 3, C84): an administrator's "check now" waits this long after any attempt; a scan batch starts a run by itself
   only when no attempt is younger than this. */
export const MIRROR_MIN_GAP_MS = 900_000;
export const MIRROR_SELF_START_MS = 21_600_000;
export const SCAN_WAIT_MS = 5_000;
/* R17: a release's reason, in characters. R28: a tool's monthly allowance. */
export const RELEASE_REASON_MAX = 2000;
export const MONTHLY_LIMIT = Object.freeze({ min: 1, max: 100_000 });
/* R8 (DEC-173 (2)): the two confirmations, exactly. */
export const WARNED = Object.freeze({ own_device: true, no_macros: true });
/* R35: this module's own kinds of `LOG_COUNT_KINDS`; the rest are `credentials`' R44. */
export const FILE_SAFETY_COUNT_KINDS = Object.freeze(["files_scanned", "files_found", "holds_placed", "holds_released",
  "deeper_checks", "sandbox_submissions", "safe_views", "safe_copies", "reputation_listed"]);
const CREDENTIAL_COUNT_KINDS = Object.freeze(["signin", "credential", "rate", "handover", "through"]);
/* R32: the use a tool is put to, and the recipient a routine tool must have (its own servers). */
export const TOOL_USES = Object.freeze(["on_request", "routine"]);
/* R44 (N971): whether a tool's stated `handling.recipient` is the organization's own servers, the one rule R28 and R32
   decide by. The catalogue states that recipient in words ("the organization's own MetaDefender Core server", "Microsoft
   (the organization's own Azure storage account)"), so the rule reads them: the organization itself (the words "the
   organization" first, any case), or one service named with, in parentheses at its end, "the organization's own …". A
   service the vendor runs, or one of two places, is not its own servers; a value that is not a string is not either.
   Pure and self-contained (it refers to nothing outside its own text and never throws), so `setup-page` R30 carries its
   source and applies the same rule. */
export const onOwnServers = (recipient) => typeof recipient === "string"
  && (/^the organization\b/i.test(recipient.trim()) || /^[^,(]+\(the organization's own [^)]+\)$/i.test(recipient.trim()));
/* R11, R12, R33: where a derived file is kept, under its own digest and outside `captures/`. */
export const derivedKey = (store, sha) => `${store}/derived/${sha}`;

const HEX64 = /^[0-9a-f]{64}$/;
const LIST = Object.freeze({ default: 200, max: 1000 });
const INTERNAL_VIEWER = `${MACHINE_CLASS_PREFIX}daemon`;
const iso = (ms) => new Date(ms).toISOString();
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const parse = (s, fallback) => { try { return s == null ? fallback : JSON.parse(s); } catch { return fallback; } };
const shaOf = (x) => (typeof x === "string" ? x.trim().toLowerCase().replace(/^sha:/, "") : "");
const clamp = (n, d, max) => { const v = Math.floor(Number(n)); return Number.isFinite(v) && v >= 1 ? Math.min(v, max) : d; };
/* R15, R31: a list's `limit`, the default when it names no number, else clamped to 1–1,000. */
const listLimit = (n) => { const v = Math.floor(Number(n)); return n === null || n === undefined || n === "" || !Number.isFinite(v) ? LIST.default : Math.min(Math.max(v, 1), LIST.max); };
const memberOf = (x) => (typeof x !== "string" || x === "" ? null : x.startsWith("member:") ? (x.slice(7) || null) : x);
const monthOf = (ms) => iso(ms).slice(0, 7);
const HOUR = 3_600_000;
/* R15, R39: an instant (ms since the epoch, or a non-empty string `Date.parse` reads) as ms; else NaN. */
const msOf = (v) => (typeof v === "number" ? v : typeof v === "string" && v.trim() ? Date.parse(v) : NaN);
/* R39, R40: the batches whose cadence this module states. */
export const FILE_WORK_BATCHES = Object.freeze(["scan", "render", "deeper", "forward", "reputation"]);

/* R53 (fix round 9, G136e): reading does not wait for the scan, and the sentence that says so plainly is this module's, read by key. */
export const READING_KEY = "file-safety.index.reading_is_not_gated";
export const readingStatement = () => ({ gated: false, key: READING_KEY });
export const readingWords = () => localize("file-safety.index.reading_is_not_gated", "This file is read without waiting for its scan. The scan is a separate check, and a threat it finds does not yet take the file out of reading or search.");

/* R24: every refusal answers its row. */
function refusal(code, detail, extra = {}) {
  const row = FILE_SAFETY_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
}
/* R6, R24: a reason with its member words; an active kind no row names reads the general words. */
function reasonOf(code, extra = {}) {
  const row = THREAT_REASONS[code] || (code.startsWith("active:") ? THREAT_REASONS.active : null);
  return { code, translation: row ? row.translation : THREAT_REASONS.active.translation, ...extra };
}

export class FileSafety {
  constructor({ sql, record, membership, credentials, provenance, acquisition, env = null, store = "bio", now = null,
                scanWaitMs = SCAN_WAIT_MS, callBoundMs = SCANNER_CALL_BOUND_MS, registerJob = null, ledger = null } = {}) {
    this.sql = sql;
    this.ledger = ledger && typeof ledger.hold === "function" && typeof ledger.release === "function" ? ledger : null;   /* runtime-limits R32: the bytes a look holds */
    this.record = record;
    this.membership = membership;
    this.credentials = credentials;
    this.provenance = provenance;
    this.acquisition = acquisition;
    this.env = env || {};
    this.store = store === "scratch" ? "scratch" : "bio";
    this.now = typeof now === "function" ? now : () => Date.now();
    this.scanWaitMs = Number.isFinite(scanWaitMs) && scanWaitMs >= 0 ? scanWaitMs : SCAN_WAIT_MS;
    this.callBoundMs = Number.isFinite(callBoundMs) && callBoundMs >= 0 ? callBoundMs : SCANNER_CALL_BOUND_MS;
    this.registerJob = typeof registerJob === "function" ? registerJob : null;
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #tx(fn) { return this.record && typeof this.record.transact === "function" ? this.record.transact(fn) : fn(); }

  /* ===== START: the receipt listener (R1) and the tables (R25) ===== */

  start() {
    try {
      if (this.provenance && typeof this.provenance.onReceipt === "function")
        return this.provenance.onReceipt(FILE_SAFETY_MODULE, (event) => this.#onReceipt(event));
    } catch { /* a listener that cannot register leaves receipts unchanged */ }
    return { ok: false };
  }

  migrate() {
    for (const [table, column, decl] of FILE_SAFETY_ADDITIVE_COLUMNS) {
      const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
      if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    for (const t of FILE_SAFETY_SCHEMA.replace(/--.*$/gm, "").split(";")) if (t.trim()) this.sql.exec(t);
    this.#repairWaits();
    if (!this.#declared && this.record && typeof this.record.declareTable === "function") {
      const r = this.record.declareTable(FILE_SAFETY_MODULE, FILE_SAFETY_TABLES.map((d) => ({ ...d })));
      this.#declared = r && r.ok === true;
    }
    return { ok: true };
  }
  #declared = false;
  /* R51 (R-OLD): a file whose newest ClamAV scan note is `not_scanned: NOT_FOUND`, and a safe view `failed: NOT_FOUND`, were
     sent again at every batch and never made; they now wait for their bytes like any other (the scan, and the view, are
     looked at again once an hour). Idempotent: a file already waiting, or whose newest note is another, is untouched. */
  #repairWaits() {
    try {
      const at = iso(this.now() + WAITING_RECHECK_MS);
      this.sql.exec(`UPDATE fs_files SET scan_wait_at = ? WHERE scan_wait_at IS NULL AND
        (SELECT n.result || '/' || COALESCE(n.reason, '') FROM fs_notes n WHERE n.capture_sha = fs_files.capture_sha
          AND n.kind = 'scan' AND n.tool = 'clamav' ORDER BY n.seq DESC LIMIT 1) = 'not_scanned/NOT_FOUND'`, at);
      this.sql.exec(`UPDATE fs_files SET render_state = 'waiting', render_wait_at = ?, render_reason = 'NOT_FOUND'
                     WHERE render_state = 'failed' AND render_reason = 'NOT_FOUND'`, at);
    } catch { /* the next start tries again */ }
  }

  /* ===== its cadences' state (R39) and the arming notice (R40) ===== */

  /* R39: the instants the wakes read, kept in `fs_wakes` so they survive a restart; null when none is kept. */
  #kept(key) { try { const r = this.#one(`SELECT value FROM fs_wakes WHERE key = ?`, key); return r ? parse(r.value, null) : null; } catch { return null; } }
  /* A kept instant that cannot be written never fails the batch it belongs to: the wake then reads the last one kept. */
  #keep(key, value) {
    try {
      this.sql.exec(`INSERT INTO fs_wakes (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, key, JSON.stringify(value));
    } catch { /* as above */ }
  }

  #fileWork = [];
  #answered = new Map();   /* R40: each batch's last R39 answer, so an act arms only a batch it gives work sooner */
  /** R40: a later module registers once at start; a second registration by one module, or a malformed one, is refused
   *  through membership's `listenerRefusal` (its R81). */
  onFileWork(module, fn) {
    const refused = listenerRefusal(this.#fileWork, module, fn);
    if (refused) return refused;
    this.#fileWork.push({ module, fn });
    return { ok: true, module };
  }
  /* R40: after the act commits (record-core R66), when `at` is sooner than the batch's last answer, every listener is
     called once with `{batch, at}`; one that throws or rejects changes nothing. No call names a member, a file or a
     viewer (R10). */
  #arm(batch, instant) {
    const last = this.#answered.get(batch);   /* read before `instant` runs a wake, which remembers its own answer */
    const at = instant();
    if (at === null || !Number.isFinite(at)) return;
    if (last !== undefined && last !== null && last <= at) return;
    this.#answered.set(batch, at);
    const notify = () => {
      for (const l of this.#fileWork) {
        try { const r = l.fn({ batch, at }); if (r && typeof r.catch === "function") r.catch(() => {}); } catch { /* R40: nothing of the act */ }
      }
    };
    try { if (this.record && typeof this.record.afterCommit === "function") this.record.afterCommit(notify); else notify(); } catch { /* never the act's */ }
  }

  /* R1: every receipt puts its capture in the scan queue and the render queue (R12 renders only a file with a
     safe-view route); a receipt carrying a reputation answer adds a `reputation` note (R34); a routine safe-copy tool
     queues its copy (R32). It runs inside the receipt's own transaction and never refuses, delays or fails it. */
  #onReceipt(event) {
    try {
      const sha = shaOf(event && event.capture_sha);
      if (!HEX64.test(sha)) return { ok: true, queued: false };
      const at = iso(this.now());   /* R4 (G171): to the millisecond, so a file queued after a batch within its second is told from one the batch sent */
      const fresh = !this.#one(`SELECT 1 AS x FROM fs_files WHERE capture_sha = ?`, sha);
      this.sql.exec(`INSERT OR IGNORE INTO fs_files (capture_sha, queued_at, render_state) VALUES (?, ?, 'queued')`, sha, at);
      if (this.#routineTools("cdr").length)
        this.sql.exec(`INSERT OR IGNORE INTO fs_copies (capture_sha, state, queued_at) VALUES (?, 'queued', ?)`, sha, at);
      /* R40: a newly queued file is due at once (R39's scan instant is then `now`), and its render at the next poll */
      if (fresh) { this.#arm("scan", () => (this.#scannerBinding() ? this.now() : null)); this.#arm("render", () => this.renderWake(this.now())); }
      const jobs = this.#registerJobs(sha, event);
      const rep = event.reputation;
      if (rep && typeof rep === "object" && typeof rep.listed === "boolean") {
        this.#writeNote(sha, { kind: "reputation", tool: String(rep.tool ?? "reputation"), engine: String(rep.tool ?? "reputation"),
          engine_version: "not reported", signatures: null, scanned_at: typeof rep.checked_at === "string" ? rep.checked_at : at,
          result: rep.listed ? "listed" : "not_listed", findings: Array.isArray(rep.categories) ? rep.categories.map(String) : [] });
        if (rep.listed) this.#count("reputation_listed");
      }
      this.#stampHome(sha);
      return { ok: true, queued: true, ...jobs };
    } catch {
      return { ok: true, queued: false };
    }
  }

  /* R1 (fix round 9, G126, G136): in the receipt's own synchronous act the file's jobs are registered by its whole digest through the
     registrar the composition root gave this module: `scan`, `grade` and, when the file may have a safe view, `safe_view`. A
     registration that answers `{ok:false}` is stated in the answer and the log, never swallowed; with no registrar given the module
     keeps its own queues and says so. The safe-view route is known from the bytes, which this synchronous act does not read: a name
     that says it is no document (a picture, a page, an archive, plain text) registers none, anything else registers it. */
  static #NO_VIEW = /\.(?:png|jpe?g|gif|webp|bmp|tiff?|heic|svg|html?|txt|zip|tar|gz|json|xml|md)(?:[?#].*)?$/i;
  #registerJobs(sha, event) {
    const fn = this.registerJob;
    if (typeof fn !== "function") return { registrar: "absent" };
    const named = String((event && (event.retrieval_locator || event.address)) || "");
    const kinds = ["scan", "grade", ...(FileSafety.#NO_VIEW.test(named) ? [] : ["safe_view"])];
    const refused = [];
    for (const kind of kinds) {
      let r;
      try { r = fn({ kind, sha }); } catch (e) { r = { ok: false, reason: "REGISTRAR_THREW" }; }
      if (!r || r.ok !== true) refused.push({ kind, reason: (r && r.reason) || "REGISTRAR_REFUSED" });
    }
    if (refused.length) this.#log({ event: "job_not_registered", sha: sha.slice(0, 12), refused });
    return { jobs: kinds.filter((k) => !refused.some((x) => x.kind === k)), ...(refused.length ? { jobs_refused: refused } : {}) };
  }
  /* R55 (R-LOG): one JSON line named by this module, never naming a member (R10). */
  #log(line) { try { console.log(JSON.stringify({ file_safety: line.event, ...line, event: undefined })); } catch { /* a log that cannot be written */ } }

  /* ===== the capture, its sight and its bytes ===== */

  #home(sha) {
    try { const h = this.provenance.homeOf(sha); return h && h.bundleId ? h.bundleId : null; } catch { return null; }
  }
  /* R25: each row about a file carries its home bundle once the register names one. */
  #stampHome(sha) {
    const b = this.#home(sha);
    if (!b) return;
    for (const t of ["fs_files", "fs_notes", "fs_holds", "fs_deeper", "fs_copies"])
      this.sql.exec(`UPDATE ${t} SET bundle_id = ? WHERE capture_sha = ? AND bundle_id IS NULL`, b, sha);
  }
  /* provenance R60 when it is there, else R16's whole read narrowed to the capture. */
  #receiptsOf(sha) {
    try {
      if (typeof this.provenance.receiptsOfCapture === "function") return this.provenance.receiptsOfCapture({ captureSha: sha }).rows || [];
      return (this.provenance.receipts({}).rows || []).filter((r) => r.capture_sha === sha);
    } catch { return []; }
  }

  /* R2 and every service naming a capture (K2098): `FILE_NOT_HELD` for a digest the record holds nothing under, and the
     same answer, byte for byte, for a capture whose home the viewer may not see (membership R43), so no answer tells a
     hidden capture from one never held (DEC-36); else null. A viewer left out is an in-plane caller, which sees every
     capture. */
  #held(captureSha, viewer, { serves = false } = {}) {
    const sha = shaOf(captureSha);
    /* DEC-49 REGION is-capture-held */
    if (!HEX64.test(sha)) return { sha, refused: refusal("FILE_NOT_HELD", "captureSha names a capture by its SHA-256, 64 hex.", { captureSha: captureSha ?? null }) };
    const absent = () => ({ sha, refused: refusal("FILE_NOT_HELD", "No capture this viewer may see is held under this digest. Nothing was read.", { captureSha: sha }) });
    const home = this.#home(sha);
    const known = !!home || !!this.#one(`SELECT 1 AS x FROM fs_files WHERE capture_sha = ?`, sha) || this.#receiptsOf(sha).length > 0;
    if (!known) return absent();
    if (viewer !== undefined) {
      const gate = viewerPredicate(viewer);
      if (gate.scope === "DENY") return absent();
      /* R51 (D6, F3a): a member's sight is judged by the capture's home; a service that serves the file's bytes or a view or copy of
         them (`serves`) refuses a capture whose home is not found, never serving it as though it had no sight to check */
      if (gate.scope !== "member" && ((serves && !home) || (home && !this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id = ? AND (${gate.sql})`, home, ...gate.args))))
        return absent();
    }
    /* END DEC-49 REGION is-capture-held */
    return { sha, refused: null };
  }

  #bucket() { const b = this.env && this.env.CAPTURES; return b && typeof b.get === "function" ? b : null; }
  #evidence() { try { return this.record.evidenceStore(); } catch { return null; } }
  /* G127d: the parts of a whole by the register's one lookup, `provenance.partsOf(sha)` (its R78), a function of the whole's bytes;
     null for a capture held whole. The whole digest is the only key here, never a part's. */
  #parts(sha) {
    try {
      const p = this.provenance.partsOf(sha);
      return Array.isArray(p) && p.length ? p.map((x) => ({ sha256: x.sha256, bytes: x.bytes })) : null;
    } catch { return null; }
  }
  /* The target `file-scanner` reads (its Terms): the digest and, for a capture held in parts, its parts in order. */
  #target(sha) { return { capture_sha: sha, parts: this.#parts(sha) }; }
  static async #bytesOf(obj) {
    if (!obj) return null;
    if (typeof obj.arrayBuffer === "function") return new Uint8Array(await obj.arrayBuffer());
    if (obj.body instanceof Uint8Array) return obj.body;
    return null;
  }
  /* G127d: `acquisition.readRange(store, sha, offset, length)`, the one reader of a capture's bytes by its whole digest (the parts are
     its own business); the bytes, or a throw this module's callers catch. */
  async #range(sha, offset, length) {
    const r = await readRange({ core: this.record, provenance: this.provenance }, sha, offset, length);
    if (!(r instanceof Uint8Array)) throw new Error((r && r.reason) || "READ_FAILED");
    return r;
  }
  /* R51: whether the capture's bytes can be read where they are kept: the whole under its digest, else every part its register
     names. Heads only; nothing is loaded. */
  async #wholeHeld(sha) {
    const ev = this.#evidence();
    if (!ev || typeof ev.head !== "function") return false;
    try {
      if (await ev.head(sha)) return true;
      const parts = this.#parts(sha);
      if (!parts || !parts.length) return false;
      for (const p of parts) if (!(await ev.head(p.sha256))) return false;
      return true;
    } catch { return false; }
  }
  /* R51 (F10): the capture's size from the store's heads, without loading it: the whole's, else the sum of its parts'
     declared bytes; null when neither is known. */
  async #sizeOf(sha) {
    const ev = this.#evidence();
    if (!ev || typeof ev.head !== "function") return null;
    try {
      const h = await ev.head(sha);
      if (h && Number.isFinite(Number(h.size))) return Number(h.size);
      const parts = this.#parts(sha);
      return parts && parts.length ? parts.reduce((n, p) => n + p.bytes, 0) : null;
    } catch { return null; }
  }
  /* The capture's bytes, whole, for its reader; null when they are not held, or when they are above `GRADE_READ_MAX` (R51: a file
     that large is never loaded here). */
  async #bytes(sha) {
    try {
      const size = await this.#sizeOf(sha);
      if (size === null || size > GRADE_READ_MAX) return null;
      return await this.#range(sha, 0, size);
    } catch { return null; }
  }

  /* R45, R56: what a file is, decided from its structure and read no further than it need be. The first `HEAD_MAX` bytes (four for
     each character a safe view of plain text keeps) are read; a file that ends within them is read whole. A longer file that is a
     PDF, a container (an office or OpenDocument file, an archive) or a compound file is read whole while it is within
     `GRADE_READ_MAX`, and above it is judged by range reads of its head and its end (an office package by its directory); any
     other longer file is judged by its start, cut back to a whole character, its remainder not read.
     `{bytes, whole, format, size, src, encrypted, encoding, image, directory, tooLarge?}`, or null when the bytes are not held. */
  async #look(sha, cache = null) {
    const kept = cache ? cache.get(`look:${sha}`) : undefined;
    if (kept !== undefined) return kept;
    const out = await this.#lookAt(sha);
    if (cache) cache.set(`look:${sha}`, out);
    return out;
  }
  /* X19 (G136b): a look is let go once its grade is made, so a call over an archive of thousands of members holds one member's bytes at a
     time and not all of them until it returns. */
  #letGo(cache, sha) {
    const l = cache.get(`look:${sha}`);
    if (l && l.held && this.ledger) this.ledger.release(l.held, "file-safety.look");
    cache.delete(`look:${sha}`);
  }
  async #lookAt(sha) {
    try {
      const size = await this.#sizeOf(sha);
      if (size === null) return null;
      const src = { size, read: (o, n) => this.#range(sha, o, n) };
      const head = await src.read(0, Math.min(size, HEAD_MAX));
      const tooLarge = size > GRADE_READ_MAX;
      let bytes = head, whole = size <= HEAD_MAX;
      if (!whole && needsWholeFile(head) && !tooLarge) { bytes = await src.read(0, size); whole = true; }
      const d = await describe(src, { head, bytes: whole ? bytes : null });
      if (!whole && !needsWholeFile(head)) bytes = wholeCharacters(head);
      const held = bytes.length;
      if (this.ledger) this.ledger.hold(held, "file-safety.look");
      return { bytes, whole, size, src, held, ...d, ...(tooLarge ? { tooLarge: size } : {}) };
    } catch { return null; }
  }

  /* ===== the scanner (R23: only the store, the target, a tool spec and a counts record are sent) ===== */

  #scannerBinding() { const s = this.env && this.env.FILE_SCANNER; return s && typeof s.fetch === "function" ? s : null; }
  /* `{status, body}` with the body parsed, `{status, bytes, headers}` for a file, or `{unreachable: true}`. */
  async #scanner(path, body, { method = "POST", stream = false } = {}) {
    const s = this.#scannerBinding();
    if (!s) return { absent: true };
    const began = this.now();
    const sha = body && (body.target ? body.target.capture_sha : body.targets && body.targets[0] ? body.targets[0].capture_sha : null);
    /* R55 (R-LOG): the call's start is written before the await, its end and outcome after */
    this.#log({ event: "scanner_call", phase: "start", call: path.split("?")[0], sha: sha ? String(sha).slice(0, 12) : null });
    let out;
    try {
      const res = await s.fetch(new Request(`https://file-scanner${path}`, method === "GET" ? { method }
        : { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
      const type = (res.headers.get("content-type") || "").toLowerCase();
      if (type.includes("application/json")) out = { status: res.status, body: await res.json().catch(() => null), headers: res.headers };
      else if (stream) out = { status: res.status, stream: res.body, headers: res.headers };
      else out = { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), headers: res.headers };
    } catch {
      out = { unreachable: true };
    }
    this.#log({ event: "scanner_call", phase: "end", call: path.split("?")[0], sha: sha ? String(sha).slice(0, 12) : null, ms: this.now() - began,
                outcome: out.unreachable ? "unreachable" : out.absent ? "absent" : `status ${out.status}` });
    return out;
  }
  /* R55 (fix round 9, G92): a call is not waited for beyond `callBoundMs` from the firing's point of view. `start` is the whole of the
     work, the call and the recording of its result, and runs once per `key`: a second ask while it is in flight shares it, so no
     second call is made for the same file. At the bound the caller is told `{late: true}` and returns; the work goes on and records its
     result when it arrives, and the file stays queued (never opened or shown scanned) until it has. */
  #inflight = new Map();   /* key -> {p, at}: a call that has run past `RENDER_INFLIGHT_STALE_MS` is taken to be lost and may be made again */
  #live(key) {
    const e = this.#inflight.get(key);
    if (e && this.now() - e.at > RENDER_INFLIGHT_STALE_MS) { this.#inflight.delete(key); return null; }
    return e ? e.p : null;
  }
  #track(key, p) {
    const e = { p: null, at: this.now() };
    e.p = p.finally(() => { if (this.#inflight.get(key) === e) this.#inflight.delete(key); });
    e.p.catch(() => {});
    this.#inflight.set(key, e);
    return e.p;
  }
  async #bounded(key, start) {
    let p = this.#live(key);
    if (!p) p = this.#track(key, Promise.resolve().then(start));
    const LATE = Symbol("late");
    let timer;
    const bound = new Promise((res) => { timer = setTimeout(() => res(LATE), this.callBoundMs); });
    try {
      const r = await Promise.race([p, bound]);
      return r === LATE ? { late: true } : { value: r };
    } finally { clearTimeout(timer); }
  }
  #flying(key) { return !!this.#live(key); }
  /* R55: one ClamAV scan of one file runs once at a time: the call and the recording of its note are one piece of work, shared by
     whoever asks while it is in flight, so no second call is made for the same file (a scan before opening, a deeper check, a
     batch). A file in a batch in flight waits for that batch and answers from the note it wrote. */
  #batchShas = new Set();
  #clamavOnce(sha) {
    const key = `scan:${sha}`;
    const live = this.#live(key);
    if (live) return live;
    return this.#track(key, Promise.resolve().then(async () => {
      if (this.#batchShas.has(sha)) {
        await this.#live("scanbatch");
        const n = this.#one(`SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = 'scan' AND tool = 'clamav' ORDER BY seq DESC LIMIT 1`, sha);
        return n ? { verdict: { ...FileSafety.#note(n), detail: n.reason ?? undefined }, noteId: n.note_id } : { failed: "SCANNER_UNREACHABLE" };
      }
      const r = await this.#clamav(sha);
      if (r.verdict) r.noteId = this.#writeNote(sha, { kind: "scan", ...r.verdict });
      return r;
    }));
  }
  /* R54 (G136a, G136d): a verdict `unknown` whose detail is a limit (`LIMIT:<name>`) or a type the scanner cannot open
     (`UNOPENABLE:<type>`) is `unscannable`, the limit or type in `reason`; an `encrypted` verdict names its reason; any other `unknown`
     keeps its detail as its reason. None of them is read as clean. */
  static #classify(v) {
    if (!v || typeof v !== "object") return v;
    const detail = v.reason ?? v.detail ?? null;
    if (v.result === "unknown") {
      const d = detail == null ? "" : String(detail);
      return /^(?:LIMIT|UNOPENABLE):/.test(d) ? { ...v, result: "unscannable", reason: d } : detail == null ? v : { ...v, reason: d };
    }
    if (v.result === "encrypted" && v.reason == null) return { ...v, reason: "ENCRYPTED" };
    return v;
  }
  /* R4, R8, R14: one ClamAV scan of one target: its verdict, or why there is none. */
  async #clamav(sha) {
    const r = await this.#scanner("/scan", { store: this.store, targets: [this.#target(sha)] });
    if (r.absent) return { absent: true };
    if (r.unreachable || !r.body || r.body.ok !== true || !Array.isArray(r.body.verdicts) || !r.body.verdicts[0])
      return { failed: (r.body && r.body.code) || "SCANNER_UNREACHABLE" };
    return { verdict: r.body.verdicts[0] };
  }

  /* ===== the notes (R2, R3) ===== */

  /* R3: append-only. A `found` verdict places or widens a hold (R16, R19); a copy's note is about the copy, which is
     withheld instead (R33). Returns the note's id. */
  #writeNote(sha, v) {
    v = FileSafety.#classify(v);
    this.#noteScanWait(sha, v);
    const same = this.#sameNotScanned(sha, v);
    if (same) return same;
    const noteId = `FSN-${[...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    const findings = Array.isArray(v.findings) ? v.findings.map(String) : [];
    this.sql.exec(`INSERT INTO fs_notes (note_id, capture_sha, bundle_id, kind, tool, engine, engine_version, signatures, scanned_at,
                     result, findings, reason, checks, vendor_ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      noteId, sha, this.#home(sha), v.kind, String(v.tool ?? "unknown"), v.engine == null ? null : String(v.engine),
      v.engine_version == null ? "not reported" : String(v.engine_version), v.signatures == null ? null : JSON.stringify(v.signatures),
      typeof v.scanned_at === "string" ? v.scanned_at : iso(this.now()), String(v.result), JSON.stringify(findings),
      v.reason == null ? null : String(v.reason), v.checks == null ? null : JSON.stringify(v.checks),
      v.vendor_ref == null ? null : String(v.vendor_ref));
    if (v.kind === "scan" || v.kind === "sandbox") {
      if (v.result !== "not_scanned") this.#count("files_scanned");
      if (v.result === "found") this.#count("files_found");
    }
    if (v.result === "found" && v.kind !== "copy") this.#placeHold(sha, noteId, findings, v);
    return noteId;
  }
  /* R51 (F3a): a ClamAV verdict `not_scanned: NOT_FOUND` (its bytes are not held) puts the file to wait: it is sent again only once
     its bytes are held, looked at once an hour, never at every batch; a real verdict ends the wait. Any other `not_scanned`
     reason leaves the file due as R4 and R47 state. Runs before R47's dedupe, so a verdict that writes no note still waits. */
  #noteScanWait(sha, v) {
    try {
      if (v.kind !== "scan" || String(v.tool ?? "unknown") !== "clamav") return;
      if (String(v.result) === "not_scanned") {
        if (v.reason === "NOT_FOUND")
          this.sql.exec(`UPDATE fs_files SET scan_wait_at = ? WHERE capture_sha = ?`, iso(this.now() + WAITING_RECHECK_MS), sha);
      } else this.sql.exec(`UPDATE fs_files SET scan_wait_at = NULL WHERE capture_sha = ?`, sha);
    } catch { /* the file stays due, as before */ }
  }
  /* R47: a `not_scanned` verdict is recorded once for a file and reason, by tool and engine, until the reason changes: the
     newest note of that kind, tool and engine is the same `not_scanned` for the same reason, so no row is written and its
     id answers. A real verdict, or another reason, writes (R3); the files stay due, as `#due` ignores these notes (R4). */
  #sameNotScanned(sha, v) {
    if (String(v.result) !== "not_scanned" || !["scan", "sandbox", "copy"].includes(v.kind)) return null;
    const last = this.#one(`SELECT note_id, result, reason FROM fs_notes WHERE capture_sha = ? AND kind = ? AND tool = ?
                            AND COALESCE(engine, '') = ? ORDER BY seq DESC LIMIT 1`,
                           sha, v.kind, String(v.tool ?? "unknown"), v.engine == null ? "" : String(v.engine));
    return last && last.result === "not_scanned" && (last.reason ?? null) === (v.reason == null ? null : String(v.reason)) ? last.note_id : null;
  }
  static #note(r) {
    return { note_id: r.note_id, kind: r.kind, tool: r.tool, engine: r.engine, engine_version: r.engine_version,
             signatures: parse(r.signatures, null), scanned_at: r.scanned_at, result: r.result, findings: parse(r.findings, []),
             ...(r.reason != null ? { reason: r.reason } : {}), ...(r.checks != null ? { checks: parse(r.checks, []) } : {}),
             ...(r.vendor_ref != null ? { vendor_ref: r.vendor_ref } : {}) };
  }
  #notesOf(sha) { return this.#rows(`SELECT * FROM fs_notes WHERE capture_sha = ? ORDER BY seq`, sha); }
  /* R8: the newest ClamAV `clean` note, by its scan's instant. */
  #lastClean(sha) {
    return this.#one(`SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = 'scan' AND tool = 'clamav' AND result = 'clean'
                      ORDER BY scanned_at DESC, seq DESC LIMIT 1`, sha);
  }

  /** R2: the capture's notes, oldest first. */
  verdictNotes({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      return { ok: true, captureSha: h.sha, notes: this.#notesOf(h.sha).map(FileSafety.#note) };
    } catch { return refusal("FILE_NOT_HELD", "The notes could not be read. Nothing was read.", { captureSha: captureSha ?? null }); }
  }

  /* ===== the counts (R35): kind and hour only ===== */

  #count(kind, n = 1) {
    try {
      if (!FILE_SAFETY_COUNT_KINDS.includes(kind)) return;
      const hour = Math.floor(this.now() / 3_600_000);
      this.sql.exec(`INSERT INTO fs_counts (hour, kind, n) VALUES (?, ?, ?) ON CONFLICT(hour, kind) DO UPDATE SET n = n + excluded.n`, hour, kind, n);
    } catch { /* a count that cannot be written never changes the act */ }
  }

  /* ===== scan holds (R15–R19) ===== */

  #openHolds(sha) { return this.#rows(`SELECT * FROM fs_holds WHERE capture_sha = ? AND state <> 'released' ORDER BY seq`, sha); }
  /* R16, R19: a found note places a hold over the names no hold of this file has covered; a hold that already names a
     finding also names the engine that found it again, so R18 reads every engine behind it. */
  #placeHold(sha, noteId, names, v) {
    const engine = { tool: String(v.tool ?? "unknown"), engine: v.engine == null ? null : String(v.engine) };
    const all = this.#rows(`SELECT * FROM fs_holds WHERE capture_sha = ? ORDER BY seq`, sha);
    const covered = new Set(all.flatMap((h) => parse(h.names, [])));
    for (const h of all.filter((x) => x.state !== "released")) {
      const hn = parse(h.names, []);
      if (!names.some((n) => hn.includes(n))) continue;
      const engines = parse(h.engines, []);
      if (!engines.some((e) => e.tool === engine.tool && e.engine === engine.engine)) engines.push(engine);
      this.sql.exec(`UPDATE fs_holds SET engines = ?, note_ids = ? WHERE seq = ?`, JSON.stringify(engines),
                    JSON.stringify([...parse(h.note_ids, []), noteId]), h.seq);
    }
    const fresh = [...new Set(names.filter((n) => !covered.has(n)))];
    if (!fresh.length) return;
    this.sql.exec(`INSERT INTO fs_holds (capture_sha, bundle_id, names, engines, note_ids, placed_at, state) VALUES (?,?,?,?,?,?, 'held')`,
                  sha, this.#home(sha), JSON.stringify(fresh), JSON.stringify([engine]), JSON.stringify([noteId]), iso(this.now()));
    this.#count("holds_placed");
  }
  /* The hold as the screens show it: every name and engine of the file's open holds. */
  #holdOf(sha) {
    const open = this.#openHolds(sha);
    if (!open.length) return null;
    const engines = [];
    for (const h of open) for (const e of parse(h.engines, [])) if (!engines.some((x) => x.tool === e.tool && x.engine === e.engine)) engines.push(e);
    return { names: [...new Set(open.flatMap((h) => parse(h.names, [])))], engines, placed_at: open[0].placed_at,
             state: open.every((h) => h.state === "pending_second") ? "pending_second" : "held" };
  }

  /** R15: every `found` note in order, for the notices of a finding; no member is named. With `since`, only notes
   *  whose `at` is at or after it; `held` read in this same synchronous call; `cursor` null once nothing follows. */
  scanFindings({ after = null, since = null, limit = LIST.default, viewer = undefined } = {}) {
    try {
      const lim = listLimit(limit);
      const lo = since === null || since === undefined ? null : msOf(since);
      if (lo !== null && !Number.isFinite(lo))
        return { ok: true, findings: [], cursor: null, truncated: false, since_invalid: true,
                 note: "since is not an instant, so no finding is listed" };
      const from = Number.isFinite(Number(after)) && after !== null && after !== "" ? Number(after) : 0;
      const findings = [];
      const open = new Map();   /* each capture's open holds' names, read once in this call */
      const heldNames = (sha) => {
        if (!open.has(sha)) open.set(sha, new Set(this.#openHolds(sha).flatMap((h) => parse(h.names, []))));
        return open.get(sha);
      };
      let last = from, more = false;
      for (const r of this.#rows(`SELECT * FROM fs_notes WHERE result = 'found' AND kind <> 'copy' AND seq > ? ORDER BY seq`, from)) {
        if (lo !== null && !(msOf(r.scanned_at) >= lo)) continue;
        if (viewer !== undefined && this.#held(r.capture_sha, viewer).refused) continue;
        if (findings.length >= lim) { more = true; break; }
        last = r.seq;
        const names = parse(r.findings, []);
        findings.push({ captureSha: r.capture_sha, note_id: r.note_id, tool: r.tool, engine: r.engine, findings: names, at: r.scanned_at,
                        held: names.some((n) => heldNames(r.capture_sha).has(n)) });
      }
      return { ok: true, findings, cursor: more ? String(last) : null, truncated: more };
    } catch { return { ok: true, findings: [], cursor: null, truncated: false }; }
  }

  /** R17: an act of record. The first member's act answers `pending_second`; a second, different member's releases. */
  releaseScanHold({ captureSha = null, by = null, reason = null } = {}) {
    try {
      /* DEC-49 REGION is-release-by-member */
      if (typeof by !== "string" || !by.trim() || isMachineIdentity(by) || by.startsWith(MACHINE_CLASS_PREFIX) || !memberOf(by))
        return refusal("MACHINE_CANNOT_RELEASE_HOLD", "A scan hold is released by members only; this act names none. Nothing was released.", { by: by ?? null });
      /* END DEC-49 REGION is-release-by-member */
      /* DEC-49 REGION is-release-reason */
      if (typeof reason !== "string" || !reason.trim() || reason.length > RELEASE_REASON_MAX)
        return refusal("HOLD_NO_REASON", `A release's reason is 1 to ${RELEASE_REASON_MAX} characters. Nothing was released.`);
      /* END DEC-49 REGION is-release-reason */
      const viewer = by.startsWith("member:") || by === "admin" ? by : `member:${by}`;
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      const sha = h.sha, who = memberOf(by), at = iso(this.now());
      const open = this.#openHolds(sha);
      /* DEC-49 REGION is-hold-open */
      if (!open.length) return refusal("NOT_HELD", "No open scan hold names this file. Nothing was released.", { captureSha: sha });
      /* END DEC-49 REGION is-hold-open */
      const pending = open.filter((x) => x.state === "pending_second");
      /* DEC-49 REGION is-second-member */
      if (pending.length && pending.every((x) => x.pending_by === who) && open.every((x) => x.state === "pending_second"))
        return refusal("SAME_MEMBER", "This member made the hold's pending act; a second, different member releases it. Nothing was released.", { captureSha: sha });
      /* END DEC-49 REGION is-second-member */
      return this.#tx(() => {
        const released = [];
        for (const x of open) {
          if (x.state === "pending_second" && x.pending_by !== who) {
            this.sql.exec(`UPDATE fs_holds SET state = 'released', released_by = ?, released_reason = ?, released_how = 'members', released_at = ?
                           WHERE seq = ?`, JSON.stringify([x.pending_by, who]), reason, at, x.seq);
            released.push(x.pending_by);
          } else if (x.state === "held") {
            this.sql.exec(`UPDATE fs_holds SET state = 'pending_second', pending_by = ?, pending_reason = ?, pending_at = ? WHERE seq = ?`,
                          who, reason, at, x.seq);
          }
        }
        if (released.length) {
          this.#count("holds_released", released.length);
          const left = this.#openHolds(sha).length;
          return { ok: true, captureSha: sha, state: left ? "pending_second" : "released", by: [released[0], who], ...(left ? { still_held: left } : {}) };
        }
        return { ok: true, captureSha: sha, state: "pending_second" };
      });
    } catch { return refusal("NOT_HELD", "The hold could not be read. Nothing was released.", { captureSha: captureSha ?? null }); }
  }

  /* R18: a hold whose findings all come from the built-in ClamAV is released by a deeper check on the same bytes whose
     structure check passed and in which an engine of a different family answered clean. A hold any other engine found
     is the members' to release (R17). */
  #secondEngineRelease(sha, noteId, verdict) {
    const out = [];
    for (const h of this.#openHolds(sha)) {
      const engines = parse(h.engines, []);
      if (!engines.length || !engines.every((e) => e.tool === "clamav")) continue;
      this.sql.exec(`UPDATE fs_holds SET state = 'released', released_how = 'second_engine', release_note_id = ?, release_tool = ?,
                     release_engine = ?, released_at = ? WHERE seq = ?`, noteId, verdict.tool, verdict.engine, iso(this.now()), h.seq);
      this.#count("holds_released");
      out.push({ released_by: "second_engine", note_id: noteId, tool: verdict.tool, engine: verdict.engine, names: parse(h.names, []) });
    }
    return out;
  }

  /* ===== the threat grade (R6, R7, R20) ===== */

  /* R6's source condition is provenance's one definition, its R62 (N806, K2333): a fetch by this copy, or a file cut
     from an archive whose own answer is fetched. Its answer is `source` as given; one that cannot be read is not
     fetched (R62 fails closed the same way). */
  async #fetched(sha) {
    try {
      const a = await this.provenance.fetchedByThisCopy(sha);
      if (a && typeof a === "object" && typeof a.fetched === "boolean") return a;
    } catch { /* below */ }
    return { fetched: false, routes: [], archive: null };
  }

  /* An archive's whole listing, every page, read as an in-plane caller (the viewer's sight was asked first). */
  async #listing(sha) {
    if (!this.acquisition || typeof this.acquisition.archiveList !== "function") return { ok: false, code: "ARCHIVE_RECORD_UNAVAILABLE" };
    const entries = [];
    let after = null, head = null;
    for (let i = 0; i < 64; i++) {
      const page = await this.acquisition.archiveList({ archiveSha: sha, viewer: INTERNAL_VIEWER, limit: LIST.max, after });
      if (!page || page.ok !== true) return { ok: false, code: (page && (page.code || page.reason)) || "ARCHIVE_UNREADABLE" };
      head = page.archive;
      entries.push(...(page.entries || []));
      if (!page.truncated || !page.next) break;
      after = page.next;
    }
    return { ok: true, archive: head, entries };
  }

  /* R6: the grade at this call, from the record's facts alone; `path` the archives above (R6's `archive_cycle`), `cache`
     each member's grade for this call. Never stored (R7). */
  async #grade(sha, path, cache) {
    if (cache.has(sha)) return cache.get(sha);
    const reasons = [];
    const add = (code, extra) => { if (!reasons.some((r) => r.code === code)) reasons.push(reasonOf(code, extra)); };
    const source = await this.#fetched(sha);
    if (source.fetched !== true) add("source_not_fetched");
    const look = await this.#look(sha, cache);
    const bytes = look ? look.bytes : null;
    const format = look ? look.format : "unknown";
    let active = null, archive = null;
    if (format === "zip") {
      const l = await this.#listing(sha);
      archive = { opened: false, entries: 0, members_low: 0, members_high: 0 };
      if (!l.ok) add("archive_not_opened", { refusal: l.code });
      else {
        archive.entries = l.entries.length;
        archive.opened = l.archive ? l.archive.opened === true : false;
        const refused = l.archive && l.archive.refused;
        if (!archive.opened) add("archive_not_opened");
        if (refused) add("archive_refused", { refusal: typeof refused === "object" ? (refused.code || refused.reason || null) : String(refused) });
        const by = (s) => l.entries.filter((e) => e.state === s);
        if (by("waiting").length) add("archive_waiting", { count: by("waiting").length });
        if (by("not_filed").length) add("archive_entry_not_filed", { count: by("not_filed").length });
        if (by("link").length) add("archive_link", { count: by("link").length });
        let cycle = false;
        for (const e of [...by("filed"), ...by("already_held")]) {
          const m = shaOf(e.sha256);
          if (!HEX64.test(m)) { archive.members_high++; continue; }
          if (m === sha || path.includes(m)) { cycle = true; archive.members_high++; continue; }
          const g = await this.#grade(m, [...path, sha], cache);
          if (g.threat === "low") archive.members_low++; else archive.members_high++;
        }
        if (cycle) add("archive_cycle");
        if (archive.members_high) add("archive_member_high", { count: archive.members_high });
      }
    } else if (ACTIVE_FORMATS.includes(format)) {
      /* R56: above `GRADE_READ_MAX` an office or OpenDocument file is graded from its directory and its small relationship parts, read
         by range; any other kind that large has its active content unread (R51, F10), high as R6 states for an unread item */
      const read = look && look.tooLarge
        ? (CONTAINER_FORMATS.includes(format) ? await activeFromDirectory(format, look.src, look.directory) : { ok: true, active: [{ kind: "unread" }] })
        : await readActive(format, bytes);
      if (!read.ok) add("format_unchecked", { why: read.why });
      else {
        active = read.active;
        for (const item of active) {
          if (!item || typeof item !== "object") continue;
          if (item.kind === "unread") add("unread");
          else if (item.kind === "encryption") add("encrypted");
          else add(`active:${item.kind}`);
        }
      }
    } else if (!PLAIN_FORMATS.includes(format)) add("format_unchecked");
    /* R54: a file or member the structure shows encrypted, or the scanner could not read, is graded high and never clean */
    if (look && look.encrypted) add("encrypted");
    const clam = this.#one(`SELECT result, reason FROM fs_notes WHERE capture_sha = ? AND kind = 'scan' AND tool = 'clamav' AND result <> 'not_scanned'
                            ORDER BY seq DESC LIMIT 1`, sha);
    if (clam && clam.result === "encrypted") add("encrypted");
    if (clam && clam.result === "unscannable") add("unscannable", { limit: clam.reason ?? null });
    /* R45 (B2): a file longer than the start `#look` reads, judged by that start alone, is never graded lower for its unread rest; a
       picture, an archive and an office package are judged by their structure, whatever their size (R56) */
    if (look && !look.whole && !(look.format === "image" || look.format === "zip" || (look.tooLarge && CONTAINER_FORMATS.includes(look.format)))) add("unread");
    const hold = this.#holdOf(sha);
    if (hold) add("scan_hold");
    const listed = this.#one(`SELECT 1 AS x FROM fs_notes WHERE capture_sha = ? AND kind = 'reputation' AND result = 'listed' LIMIT 1`, sha);
    if (listed) add("bad_reputation");
    const latest = (kind) => { const r = this.#one(`SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = ? ORDER BY seq DESC LIMIT 1`, sha, kind); return r ? FileSafety.#note(r) : null; };
    const view = this.#one(`SELECT * FROM fs_files WHERE capture_sha = ?`, sha);
    const copy = this.#one(`SELECT * FROM fs_copies WHERE capture_sha = ?`, sha);
    const g = { threat: reasons.length ? "high" : "low", reasons, source, format, active, scan_hold: hold,
                ...(look && look.format === "image" && look.image ? { image: { type: look.image, read: READ_IMAGES.includes(look.image) } } : {}),
                latest_scan: latest("scan"), latest_deeper: latest("deeper"),
                safe_view: view ? { state: view.render_state, route: view.render_route, sha256: view.render_sha } : null,
                safe_copy: copy ? { state: copy.state, sha256: copy.copy_sha } : null, archive };
    cache.set(sha, g);
    /* a member's bytes are let go when its grade is in; the call's own file stays for the call's other readers */
    if (path.length) this.#letGo(cache, sha);
    return g;
  }

  /** R6: the threat grade, computed at the call. */
  async threatOf({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      const cache = new Map();
      try { return { ok: true, captureSha: h.sha, ...(await this.#grade(h.sha, [], cache)), reading: readingStatement() }; }
      finally { this.#letGo(cache, h.sha); }
    } catch { return refusal("FILE_NOT_HELD", "The grade could not be computed. Nothing was read.", { captureSha: captureSha ?? null }); }
  }

  /* ===== opening the original (R8, R9; DEC-173) ===== */

  /* The scan before first opening, on demand: the verdict within `scanWaitMs`, or `pending` (the scan goes on and writes
     its note when it ends). */
  async #scanBeforeOpening(sha) {
    if (!this.#scannerBinding()) return { absent: true };
    const run = this.#clamavOnce(sha);
    let timer;
    const late = new Promise((res) => { timer = setTimeout(() => res({ pending: true }), this.scanWaitMs); });
    const r = await Promise.race([run, late]);
    clearTimeout(timer);
    return r;
  }
  /* R8's deeper path: a deeper check that ended clean less than `DEEPER_CHECK_FRESH_MS` ago with no `found` note since. */
  #freshDeeper(sha) {
    const d = this.#one(`SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = 'deeper' AND result = 'clean' ORDER BY seq DESC LIMIT 1`, sha);
    if (!d || !(this.now() - Date.parse(d.scanned_at) < DEEPER_CHECK_FRESH_MS)) return false;
    return !this.#one(`SELECT 1 AS x FROM fs_notes WHERE capture_sha = ? AND result = 'found' AND kind <> 'copy' AND seq > ?`, sha, d.seq);
  }
  #cleanFresh(sha) { const c = this.#lastClean(sha); return !!c && this.now() - Date.parse(c.scanned_at) < RESCAN_INTERVAL_MS; }

  /* R8 and R9 decide by one rule: `{open: path, stated?}` or `{refuse: code, …}`. With `run` false (R9) nothing is
     scanned: a scan R8 would run is stated as the path it would open by. */
  async #decide(sha, { override = false, warned = undefined, run = true, cache = new Map() } = {}) {
    /* DEC-49 REGION is-under-scan-hold */
    if (this.#openHolds(sha).length) return { refuse: "SCAN_HOLD" };
    /* END DEC-49 REGION is-under-scan-hold */
    const g = await this.#grade(sha, [], cache);
    /* R54: an encrypted original is not opened as safe: no path (neither the deeper nor the warned) takes it for clean */
    if (g.reasons.some((r) => r.code === "encrypted")) return { refuse: "NOT_SCANNED", reason: "ENCRYPTED" };
    /* DEC-49 REGION is-scan-before-opening */
    const scan = async (path, high) => {
      if (this.#cleanFresh(sha)) return { open: path };
      if (!run) {
        if (this.#scannerBinding()) return { open: path, would_scan: true };
        if (!high) return { open: path, stated: { not_scanned: "SCANNER_ABSENT" } };
        return { refuse: this.#lastClean(sha) ? "SCAN_STALE" : "NOT_SCANNED", reason: "SCANNER_ABSENT" };
      }
      const r = await this.#scanBeforeOpening(sha);
      /* K1928 Q4: with no scanner bound a low file opens, stated; never a high one */
      if (r.absent) return high ? { refuse: this.#lastClean(sha) ? "SCAN_STALE" : "NOT_SCANNED", reason: "SCANNER_ABSENT" }
                                : { open: path, stated: { not_scanned: "SCANNER_ABSENT" } };
      if (r.pending) return { refuse: "SCAN_PENDING" };
      if (r.failed) return high && this.#lastClean(sha) ? { refuse: "SCAN_STALE", reason: r.failed } : { refuse: "NOT_SCANNED", reason: r.failed };
      const v = r.verdict;
      if (v.result === "found") return { refuse: "SCAN_HOLD" };
      if (v.result === "clean") return { open: path };
      if (v.result === "encrypted") return { refuse: "NOT_SCANNED", reason: "ENCRYPTED" };
      const why = v.reason || v.detail || v.result;
      return high && this.#lastClean(sha) ? { refuse: "SCAN_STALE", reason: why } : { refuse: "NOT_SCANNED", reason: why };
    };
    /* END DEC-49 REGION is-scan-before-opening */
    if (g.threat === "low") return scan("plain", false);
    if (override === true && this.#freshDeeper(sha)) return { open: "deeper" };
    if (warned !== undefined && warned !== null) {
      /* DEC-49 REGION is-warned-path */
      const exact = warned && typeof warned === "object" && !Array.isArray(warned) && Object.keys(warned).length === 2
        && warned.own_device === true && warned.no_macros === true;
      if (!exact) return { refuse: "WARNING_NOT_CONFIRMED" };
      /* END DEC-49 REGION is-warned-path */
      return scan("warned", true);
    }
    if (!run) {
      /* R9: the warned path is open to a member who gives both confirmations, when R8's warned arm would open it */
      const w = await scan("warned", true);
      return w.open ? { open: "warned", needs_confirmation: true } : w;
    }
    /* DEC-49 REGION is-high-risk-path */
    return { refuse: "SAFE_VIEW_ONLY" };
    /* END DEC-49 REGION is-high-risk-path */
  }

  static #refusalFor(d) {
    const detail = {
      SCAN_HOLD: "A scan hold applies to this file; no path opens its original. Nothing was served.",
      SCAN_PENDING: "The scan before first opening has not finished within the call. Nothing was served.",
      NOT_SCANNED: "The scan before first opening could not decide. Nothing was served.",
      SCAN_STALE: "The file's last clean scan is older than a week and the scanner cannot run now. Nothing was served.",
      WARNING_NOT_CONFIRMED: localize("file-safety.index.warned_must_be_exactly", "warned must be exactly {own_device: true, no_macros: true}. Nothing was served."),
      SAFE_VIEW_ONLY: "The file is high risk and neither a fresh deeper check nor the warned path opens it. Nothing was served.",
    }[d.refuse];
    return refusal(d.refuse, detail, d.reason ? { not_scanned: d.reason } : {});
  }

  /* The capture's bytes exactly as `capture`'s R21 get serves them (`x-capture-sha256` equal to the digest). */
  async #serveOriginal(sha, stated) {
    const ev = this.#evidence();
    if (!ev) return json(refusal("FILE_NOT_HELD", localize("file-safety.index.your_teams_civicsmith_holds_no", "Your team's Civicsmith holds no evidence store, so no bytes can be served."), { captureSha: sha }), 404);
    const env = { CAPTURES: { get: (k) => ev.get(k), head: (k) => ev.head(k), put: () => null } };
    const res = await captureObjectOp(new Request(`http://x/?sha256=${sha}`), new URL(`http://x/?sha256=${sha}`), env,
      { json, storageAbsent: (op, d) => json({ ok: false, reason: "STORAGE_ABSENT", detail: d }, 503),
        requiredArgument: (op, a, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", error }), key: (s) => s,
        storeName: this.store, cls: null });
    if (!stated) return res;
    const headers = new Headers(res.headers);
    headers.set("x-file-safety-not-scanned", stated.not_scanned);
    return new Response(res.body, { status: res.status, headers });
  }

  /** R8: the original's bytes, or the first refusal that applies. `warned` is never stored (R10). */
  async openOriginal({ captureSha = null, viewer = undefined, override = false, warned = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer, { serves: true });
      if (h.refused) return h.refused;
      const d = await this.#decide(h.sha, { override, warned, run: true });
      if (d.refuse) return FileSafety.#refusalFor(d);
      return await this.#serveOriginal(h.sha, d.stated || null);
    } catch { return refusal("NOT_SCANNED", "The original could not be opened. Nothing was served.", { captureSha: captureSha ?? null }); }
  }

  /** R9: what R8 would answer now, without opening, scanning or serving anything. */
  async originalState({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer, { serves: true });
      if (h.refused) return h.refused;
      return { ok: true, captureSha: h.sha, ...(await this.#stateOf(h.sha)) };
    } catch { return { ok: true, captureSha: shaOf(captureSha) || null, may_open: false, path: null, why: "NOT_SCANNED", reading: readingStatement() }; }
  }
  async #stateOf(sha, cache = new Map()) {
    const deeperFirst = this.#freshDeeper(sha) && !this.#openHolds(sha).length;
    const d = await this.#decide(sha, { override: deeperFirst, warned: undefined, run: false, cache });
    /* R53: reading is not gated by anything here, and the answer says so by key */
    if (d.open) return { may_open: true, path: d.open, why: null, ...(d.stated ? { stated: d.stated } : {}), reading: readingStatement() };
    return { may_open: false, path: null, why: d.refuse, ...(d.reason ? { not_scanned: d.reason } : {}), reading: readingStatement() };
  }

  /* ===== the safe view (R11, R12) ===== */

  #ensureQueued(sha) {
    this.sql.exec(`INSERT OR IGNORE INTO fs_files (capture_sha, bundle_id, queued_at, render_state) VALUES (?, ?, ?, 'queued')`,
                  sha, this.#home(sha), iso(this.now()));
    return this.#one(`SELECT * FROM fs_files WHERE capture_sha = ?`, sha);
  }

  /* R11 (G137a): the safe view is a view, not a reading, and says so; a view cut at the page cap says how much of the document it holds. */
  static #viewStatement(pages = null, sourcePages = null, truncated = false) {
    if (truncated && Number.isFinite(pages) && Number.isFinite(sourcePages) && pages > 0 && sourcePages > pages) {
      return { key: "file-safety.index.safe_view_first_pages",
               words: localize("file-safety.index.safe_view_first_pages", "This shows the first {pages} pages of the document's {source_pages}. It is a view of the document, not a reading of it.",
                               { pages: String(pages), source_pages: String(sourcePages) }), pages, source_pages: sourcePages };
    }
    return { key: "file-safety.index.safe_view_is_a_view", words: localize("file-safety.index.safe_view_is_a_view", "This is a view of the document, not a reading of it.") };
  }
  /* R54: whether the scanner could not read the file for a password (its newest ClamAV note), as the structure shows it too. */
  #scanNoteEncrypted(sha) {
    const n = this.#one(`SELECT result FROM fs_notes WHERE capture_sha = ? AND kind = 'scan' AND tool = 'clamav' AND result <> 'not_scanned' ORDER BY seq DESC LIMIT 1`, sha);
    return !!n && n.result === "encrypted";
  }

  /** R11: the safe view by route: a rendered PDF of page images (its bytes, the description in `x-file-safety`), a
   *  spreadsheet's cells as data, from `fromRow` of `sheet` (G137b: following `next_row` call by call reaches the last row), or (R45) a
   *  plain-text file's own characters; a file under a scan hold still gets it (K1892). */
  async safeView({ captureSha = null, viewer = undefined, sheet = null, fromRow = null } = {}) {
    try {
      const h = this.#held(captureSha, viewer, { serves: true });
      if (h.refused) return h.refused;
      const sha = h.sha;
      const cache = new Map();
      const look = await this.#look(sha, cache);
      const format = look ? look.format : "unknown";
      const route = safeViewRoute(format);
      /* R51 (F3b): bytes not held yet, and a view queued or waiting for them: it is on its way, not a file of no route */
      if (!look) {
        const q = this.#one(`SELECT render_state FROM fs_files WHERE capture_sha = ?`, sha);
        if (q && (q.render_state === "queued" || q.render_state === "waiting" || q.render_state === "rendering"))
          return refusal("SAFE_VIEW_PENDING", "The safe view is queued.", { captureSha: sha });
      }
      /* R54: an encrypted file has no safe view, final and not retried */
      if (look && (look.encrypted || this.#scanNoteEncrypted(sha)))
        return refusal("SAFE_VIEW_FAILED", localize("file-safety.index.the_file_is_encrypted_so_no_safe_view", "The file is encrypted, so no safe view can be made of it."),
                       { captureSha: sha, renderer_reason: "ENCRYPTED", final: true, format });
      /* R51 (G44): a zip or unknown file above GRADE_READ_MAX is never loaded, and the view says why with its size and the bound */
      if (look && look.tooLarge && (format === "zip" || format === "unknown"))
        return refusal("SAFE_VIEW_FAILED", localize("file-safety.index.the_file_is_above_what_a_safe_view_reads", "The file is above what a safe view reads. Nothing was read."), { captureSha: sha, renderer_reason: "TOO_LARGE", size: look.tooLarge, bound: GRADE_READ_MAX, format });
      /* DEC-49 REGION is-safe-view-route */
      if (!route && !(format === "text" && look.encoding === "utf-8"))
        return refusal("NO_SAFE_VIEW", localize("file-safety.index.a_safe_view_is_made", "A safe view is made of documents, presentations, spreadsheets and plain text only."), { captureSha: sha, format });
      /* END DEC-49 REGION is-safe-view-route */
      const original = await this.#stateOf(sha, cache);
      if (!route) {
        /* R45: plain text is shown as it stands, cut at SAFE_VIEW_TEXT_MAX characters; it needs no renderer and is never queued */
        const t = textView(look.bytes, !look.whole);
        if (!t.ok) return refusal("SAFE_VIEW_FAILED", localize("file-safety.index.the_text_could_not_be", "The text could not be read."), { captureSha: sha, renderer_reason: "NOT_TEXT" });
        this.#count("safe_views");
        return { ok: true, kind: "text", derived: true, of: sha, text: t.text, truncated: t.truncated, original };
      }
      if (route === "data") {
        const whole = look.whole ? look.bytes : await this.#bytes(sha);
        const size = whole ? null : await this.#sizeOf(sha);
        /* R51 (G44): a file above GRADE_READ_MAX, and one above what a preview can show, are stated with their size and the bound */
        const windowed = (sheet !== null && sheet !== undefined && sheet !== "") || (fromRow !== null && fromRow !== undefined);
        const row1 = Number.isInteger(Number(fromRow)) && Number(fromRow) >= 1 ? Number(fromRow) : 1;
        const s = whole ? (windowed ? await sheetWindow(format, whole, { sheet: sheet === "" ? null : sheet, fromRow: row1 }) : await sheetsOf(format, whole))
          : { ok: false, why: size > GRADE_READ_MAX ? "TOO_LARGE" : "NOT_FOUND", ...(size > GRADE_READ_MAX ? { size, bound: GRADE_READ_MAX } : {}) };
        if (!s.ok) return refusal("SAFE_VIEW_FAILED", "The spreadsheet's cells could not be read.", { captureSha: sha, renderer_reason: s.why,
          ...(s.size !== undefined ? { size: s.size, bound: s.bound, format } : {}) });
        this.#count("safe_views");
        return { ok: true, kind: "data", derived: true, of: sha, sheets: s.sheets, sheets_total: s.sheets_total, sheets_truncated: s.sheets_truncated, original };
      }
      if (!this.#scannerBinding()) return refusal("RENDERER_ABSENT", localize("file-safety.index.your_teams_civicsmith_has_no", "Your team's Civicsmith has no safe view installed. Nothing was rendered."), { captureSha: sha });
      const row = this.#ensureQueued(sha);
      /* DEC-49 REGION is-safe-view-made */
      if (row.render_state === "failed")
        return refusal("SAFE_VIEW_FAILED", "The renderer refused the file.", { captureSha: sha, renderer_reason: row.render_reason, renderer_detail: row.render_detail });
      if (row.render_state !== "done" || !row.render_sha) return refusal("SAFE_VIEW_PENDING", "The safe view is queued.", { captureSha: sha });
      /* END DEC-49 REGION is-safe-view-made */
      const bucket = this.#bucket();
      const bytesOut = bucket ? await FileSafety.#bytesOf(await bucket.get(derivedKey(this.store, row.render_sha))) : null;
      if (!bytesOut) return refusal("SAFE_VIEW_PENDING", "The safe view's bytes are not held; it is made again.", { captureSha: sha });
      this.#count("safe_views");
      const description = { kind: "pdf", derived: true, of: sha, sha256: row.render_sha, pages: row.render_pages,
                            source_pages: row.render_source_pages, truncated: row.render_truncated === 1, original,
                            statement: FileSafety.#viewStatement(row.render_pages, row.render_source_pages, row.render_truncated === 1) };
      return new Response(bytesOut, { status: 200, headers: { "content-type": "application/pdf", "x-derived-sha256": row.render_sha,
        "x-of": sha, "x-file-safety": JSON.stringify(description) } });
    } catch { return refusal("SAFE_VIEW_FAILED", "The safe view could not be read.", { captureSha: captureSha ?? null }); }
  }

  /* R12, G136b: one file's render, after its capture: the image-only PDF stored once under its own digest outside `captures/`, labeled
     derived and naming its original; never registered, graded or chained. The renderer's PDF is read as a stream held to
     `SAFE_VIEW_BYTES_MAX` and put once. The row is marked in flight (`rendering`) before the call and the whole of this work, the call
     and its record, goes on past the firing's bound (R55). A failure is classed from the renderer's refusal: `TIME_LIMIT` and an
     unreachable renderer are transient (the file stays queued and is tried again with back-off), `NOT_RENDERABLE`, `ENCRYPTED` and
     any other refusal are final, and only `NOT_FOUND` waits for the file's bytes (R51). */
  async #render(row) {
    const sha = row.capture_sha;
    const look = await this.#look(sha);
    /* R51 (F3b): bytes not held yet (the keep, after the receipt that queued this render) are waited for, not failed: the view is
       made once they are held (`#releaseRenderWaits`), and the member's call meanwhile answers `SAFE_VIEW_PENDING` */
    if (!look) return this.#renderWaits(sha);
    const format = look.format, route = safeViewRoute(format);
    if (!route || route === "data") {
      this.sql.exec(`UPDATE fs_files SET render_state = ?, render_route = ? WHERE capture_sha = ?`, route ? "data" : "none", route, sha);
      return route ? "data" : "none";
    }
    /* R54: an encrypted file is refused without a call to the renderer, so it does not use the tick */
    if (look.encrypted || this.#scanNoteEncrypted(sha)) { this.#renderFinal(sha, route, "ENCRYPTED", null); return "refused"; }
    this.sql.exec(`UPDATE fs_files SET render_state = 'rendering', render_started_at = ? WHERE capture_sha = ?`, iso(this.now()), sha);
    try { return await this.#renderCall(sha, route); } catch (e) {
      /* a fault after the mark: the file is queued again, not left marked in flight */
      try { this.sql.exec(`UPDATE fs_files SET render_state = 'queued', render_started_at = NULL WHERE capture_sha = ? AND render_state = 'rendering'`, sha); } catch { /* the stale mark is released */ }
      throw e;
    }
  }
  async #renderCall(sha, route) {
    const r = await this.#scanner("/render", { store: this.store, target: this.#target(sha), route }, { stream: true });
    const bucket = this.#bucket();
    const detail = r.body && r.body.detail ? String(r.body.detail).slice(0, 300) : r.body && r.body.message ? String(r.body.message).slice(0, 300) : null;
    /* R12 (G171): a server error with no classed refusal is the renderer down, transient like a rejected fetch */
    if (r.unreachable || r.absent || (r.status >= 500 && !(r.body && r.body.code))) return this.#renderRetry(sha, route, "SCANNER_UNREACHABLE", null);
    if (r.stream && r.status === 200) {
      const derived = r.headers.get("x-derived-sha256");
      if (!derived || !HEX64.test(derived) || !bucket) {
        await FileSafety.#drop(r.stream);
        return this.#renderFinal(sha, route, !bucket ? "R2_NOT_CONFIGURED" : "RENDER_FAILED", null);
      }
      const got = await FileSafety.#heldStream(r.stream, SAFE_VIEW_BYTES_MAX);
      if (!got.ok) return this.#renderFinal(sha, route, got.reason, null);
      await bucket.put(derivedKey(this.store, derived), got.bytes, { sha256: derived,
        customMetadata: { derived: "true", of: sha, kind: "safe-view" } });
      this.sql.exec(`UPDATE fs_files SET render_state = 'done', render_route = ?, render_sha = ?, render_pages = ?, render_source_pages = ?,
                     render_truncated = ?, rendered_at = ?, render_reason = NULL, render_wait_at = NULL, render_started_at = NULL WHERE capture_sha = ?`, route, derived,
                    Number(r.headers.get("x-pages")) || 0, Number(r.headers.get("x-source-pages")) || 0,
                    r.headers.get("x-truncated") === "true" ? 1 : 0, iso(this.now()), sha);
      return "rendered";
    }
    if (r.stream) await FileSafety.#drop(r.stream);
    const code = (r.body && r.body.code) || (!bucket ? "R2_NOT_CONFIGURED" : "RENDER_FAILED");
    if (code === "NOT_FOUND") return this.#renderWaits(sha);
    const transient = r.body && (r.body.class === "transient" || code === "TIME_LIMIT" || code === "SCANNER_UNREACHABLE");
    return transient ? this.#renderRetry(sha, route, code, detail) : this.#renderFinal(sha, route, code, detail);
  }
  #renderWaits(sha) {
    this.sql.exec(`UPDATE fs_files SET render_state = 'waiting', render_reason = 'NOT_FOUND', render_wait_at = ?, render_started_at = NULL WHERE capture_sha = ?`,
                  iso(this.now() + WAITING_RECHECK_MS), sha);
    return "waiting";
  }
  /* G136b: final, never tried again */
  #renderFinal(sha, route, code, detail) {
    this.sql.exec(`UPDATE fs_files SET render_state = 'failed', render_route = ?, render_reason = ?, render_detail = ?, render_wait_at = NULL, render_started_at = NULL
                   WHERE capture_sha = ?`, route, code, detail, sha);
    return "failed";
  }
  /* G136b: transient, queued again after a back-off that doubles each try from `RENDER_RETRY_MS` to the hour (one file's recheck ceiling) */
  #renderRetry(sha, route, code, detail) {
    const tries = Number((this.#one(`SELECT render_tries AS n FROM fs_files WHERE capture_sha = ?`, sha) || {}).n || 0) + 1;
    const back = Math.min(RENDER_RETRY_MS * 2 ** Math.min(tries - 1, 10), WAITING_RECHECK_MS);
    this.sql.exec(`UPDATE fs_files SET render_state = 'queued', render_route = ?, render_reason = ?, render_detail = ?, render_tries = ?, render_wait_at = ?, render_started_at = NULL
                   WHERE capture_sha = ?`, route, code, detail, tries, iso(this.now() + back), sha);
    return "retry";
  }
  static async #drop(stream) { try { await stream.cancel(); } catch { /* nothing more is wanted of it */ } }
  /* G136b: the body read as a stream and held to `max` bytes; past it the read stops (`OVER_BOUND`), the rest never pulled. */
  static async #heldStream(stream, max) {
    const reader = stream.getReader();
    const chunks = [];
    let n = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        n += value.byteLength;
        if (n > max) { await reader.cancel().catch(() => {}); return { ok: false, reason: "OVER_BOUND" }; }
        chunks.push(value);
      }
    } catch { return { ok: false, reason: "RENDER_STREAM_BROKEN" }; }
    const bytes = new Uint8Array(n);
    let at = 0;
    for (const c of chunks) { bytes.set(c, at); at += c.byteLength; }
    return { ok: true, bytes };
  }

  /* R55: a render marked in flight by a firing that stopped (its mark older than `RENDER_INFLIGHT_STALE_MS`, and no call of this
     instance running for it) is queued again. */
  #releaseStaleRenders() {
    try {
      const before = iso(this.now() - RENDER_INFLIGHT_STALE_MS);
      for (const r of this.#rows(`SELECT capture_sha FROM fs_files WHERE render_state = 'rendering' AND COALESCE(render_started_at, '') <= ?`, before))
        if (!this.#flying(`render:${r.capture_sha}`))
          this.sql.exec(`UPDATE fs_files SET render_state = 'queued', render_started_at = NULL WHERE capture_sha = ?`, r.capture_sha);
    } catch { /* they wait for the next round */ }
  }
  /* R51 (F3b): the safe views waiting for their bytes are queued again once the bytes are held (the whole, else every part), at
     most once an hour each, `limit` of them looked at in a round; the rest wait another hour. Never fails the round. */
  async #releaseRenderWaits(limit) {
    try {
      const at = this.now();
      for (const r of this.#rows(`SELECT capture_sha FROM fs_files WHERE render_state = 'waiting' AND COALESCE(render_wait_at, '') <= ?
                                  ORDER BY render_wait_at, capture_sha LIMIT ?`, iso(at), limit)) {
        if (await this.#wholeHeld(r.capture_sha))
          this.sql.exec(`UPDATE fs_files SET render_state = 'queued', render_reason = NULL, render_wait_at = NULL WHERE capture_sha = ?`, r.capture_sha);
        else this.sql.exec(`UPDATE fs_files SET render_wait_at = ? WHERE capture_sha = ?`, iso(at + WAITING_RECHECK_MS), r.capture_sha);
      }
    } catch { /* they wait for the next round */ }
  }

  /** R12: renders queued files (the scheduler's wake), and makes the safe copies a routine tool queued (R32, R33); it
   *  states the copies and the files still queued after it. R43: with a renderer bound, a queue that cannot be read
   *  (the files queued to render, or the safe copies queued) answers RENDER_QUEUE_UNREADABLE, rendering, copying and
   *  counting nothing; RENDERER_ABSENT keeps its one condition, no renderer bound. */
  async renderBatch({ limit = 20 } = {}) {
    this.#keep("render", { last: this.now(), unreadable: false });
    /* DEC-49 REGION is-renderer-bound */
    if (!this.#scannerBinding()) return refusal("RENDERER_ABSENT", localize("file-safety.index.your_teams_civicsmith_has_no_2", "Your team's Civicsmith has no safe view installed. Nothing was rendered."));
    /* END DEC-49 REGION is-renderer-bound */
    const lim = clamp(limit, 20, SCAN_BATCH_MAX);
    const unreadable = (detail, extra) => {
      this.#keep("render", { last: this.now(), unreadable: true });
      return refusal("RENDER_QUEUE_UNREADABLE", detail, extra);
    };
    await this.#releaseRenderWaits(lim);
    this.#releaseStaleRenders();
    let views, queuedCopies;
    try {
      /* DEC-49 REGION is-render-queue-readable */
      views = this.#rows(`SELECT * FROM fs_files WHERE render_state = 'queued' AND COALESCE(render_wait_at, '') <= ? ORDER BY queued_at, capture_sha LIMIT ?`, iso(this.now()), lim);
      queuedCopies = this.#rows(`SELECT * FROM fs_copies WHERE state = 'queued' ORDER BY queued_at LIMIT ?`, lim);
      /* END DEC-49 REGION is-render-queue-readable */
    } catch {
      return unreadable(localize("file-safety.index.your_teams_civicsmith_could_not", "Your team's Civicsmith could not read the files waiting for a safe view. Nothing was rendered, made or counted."));
    }
    const out = { rendered: 0, failed: 0, none: 0, data: 0 };
    const copies = { made: 0, failed: 0, queued: 0 };
    let inFlight = 0;
    try {
      /* R55: one render is begun per tick, and the firing waits for it no longer than the bound; a file that takes no renderer (no
         route, a spreadsheet's cells, bytes not held yet) is bookkeeping and does not use the tick */
      for (const row of views) {
        const got = await this.#bounded(`render:${row.capture_sha}`, () => this.#render(row));
        if (got.late) { inFlight++; break; }
        const r = got.value;
        if (r in out) out[r]++;
        if (r === "retry" || r === "refused") out.failed++;
        if (r === "rendered" || r === "failed" || r === "retry") break;
      }
      const tool = this.#routineTools("cdr")[0];
      if (tool) for (const c of queuedCopies) {
        const got = await this.#bounded(`copy:${c.capture_sha}`, () => this.#makeCopy(c.capture_sha, tool));
        if (got.late) { inFlight++; break; }
        if (got.value === "done" || got.value === "withheld") copies.made++; else copies.failed++;
      }
      copies.queued = Number(this.#one(`SELECT COUNT(*) AS n FROM fs_copies WHERE state = 'queued'`).n);
      const remaining = Number(this.#one(`SELECT COUNT(*) AS n FROM fs_files WHERE render_state = 'queued'`).n);
      /* R39 (K4900): views due now, and copies beyond those this batch looked at, are what makes the next wake `now`; a view in its back-off is not */
      const dueViews = Number(this.#one(`SELECT COUNT(*) AS n FROM fs_files WHERE render_state = 'queued' AND COALESCE(render_wait_at, '') <= ?`, iso(this.now())).n);
      this.#keep("render", { last: this.now(), unreadable: false, left: dueViews + (tool ? Math.max(0, copies.queued - queuedCopies.length) : 0) });
      return { ok: true, ...out, copies, remaining, ...(inFlight ? { in_flight: inFlight } : {}) };
    } catch {
      /* a fault once rendering began: what was done is stated, and the rest wait for the next round (as R36's) */
      return unreadable(localize("file-safety.index.your_teams_civicsmith_could_not_2", "Your team's Civicsmith could not read the files waiting for a safe view after some were rendered. The rest wait for the next round."),
                        { rendered: out.rendered, copies_made: copies.made });
    }
  }

  /* ===== scanning (R4, R5) ===== */

  /* R4: due files, oldest due first: never scanned by ClamAV, or its newest ClamAV scan older than RESCAN_INTERVAL_MS. R54: a file whose
     newest ClamAV note is `encrypted` or `unscannable` is not due again for the same signature set (the note's `published` is the set
     the scanner last showed); it is due when a newer set is published, and is parked, counted nowhere, until then. */
  #due(at) {
    const published = (this.#kept("sig") || {}).published ?? null;
    const newest = (col) => `(SELECT n.${col} FROM fs_notes n WHERE n.capture_sha = f.capture_sha AND n.kind = 'scan' AND n.tool = 'clamav'
           AND n.result <> 'not_scanned' ORDER BY n.seq DESC LIMIT 1)`;
    const rows = this.#rows(`SELECT f.capture_sha, f.queued_at, f.scan_wait_at,
        (SELECT MAX(n.scanned_at) FROM fs_notes n WHERE n.capture_sha = f.capture_sha AND n.kind = 'scan' AND n.tool = 'clamav'
           AND n.result <> 'not_scanned') AS last, ${newest("result")} AS newest, ${newest("signatures")} AS newest_sigs
      FROM fs_files f`);
    /* R51: a file waiting for its bytes is next looked at at its wait's instant */
    return rows.flatMap((r) => {
      let since = r.scan_wait_at ? Date.parse(r.scan_wait_at) : r.last ? Date.parse(r.last) + RESCAN_INTERVAL_MS : Date.parse(r.queued_at);
      if (!r.scan_wait_at && (r.newest === "encrypted" || r.newest === "unscannable")) {
        const was = parse(r.newest_sigs, null);
        const set = was && typeof was.published === "string" ? was.published : null;
        if (!published || published === set) return [];
        since = Date.parse(published);
      }
      return [{ sha: r.capture_sha, waiting: !!r.scan_wait_at, since }];
    }).filter((r) => !Number.isFinite(r.since) || r.since <= at)
      .sort((a, b) => (a.since - b.since) || (a.sha < b.sha ? -1 : 1));
  }

  /* R4, R55: the records one batched call wrote; `batch` the due files sent. */
  async #runBatch(batch) {
    const r = await this.#scanner("/scan", { store: this.store, targets: batch.map((d) => this.#target(d.sha)) });
    /* DEC-49 REGION is-scanner-answering */
    if (r.unreachable || !r.body || r.body.ok !== true || !Array.isArray(r.body.verdicts))
      return { refused: refusal("SCANNER_UNREACHABLE", "The scanner did not answer the batch. No note was written.",
                                { scanner_code: (r.body && r.body.code) || null }) };
    /* END DEC-49 REGION is-scanner-answering */
    const out = { scanned: 0, found: 0, not_scanned: 0 };
    this.#tx(() => {
      batch.forEach((d, i) => {
        const v = r.body.verdicts[i];
        if (!v) return;
        this.#writeNote(d.sha, { kind: "scan", ...v });
        this.#stampHome(d.sha);
        if (v.result === "not_scanned") out.not_scanned++; else out.scanned++;
        if (v.result === "found") out.found++;
      });
    });
    return { out };
  }

  /** R4, R55: one batch to ClamAV in one request, a note per verdict; each routine scan tool also scans each due file. The batch's
   *  call is waited for `callBoundMs` at most: at the bound the files stay queued, the call goes on and records its notes when it
   *  ends, and the answer says how many files are in flight. */
  async scanBatch({ limit = SCAN_BATCH_MAX, at = null } = {}) {
    try {
      /* DEC-49 REGION is-scanner-bound */
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", localize("file-safety.index.your_teams_civicsmith_has_no_3", "Your team's Civicsmith has no file scanner installed. No note was written."));
      /* END DEC-49 REGION is-scanner-bound */
      const now = Number.isFinite(Date.parse(at)) ? Date.parse(at) : this.now();
      /* R39: the run is kept first, so a batch the scanner refuses still counts as run (its files retried a poll later) */
      this.#keep("scan", { last: now, remaining: 0 });
      await this.#startRunWhenNoSignatures(now);
      const due = this.#due(now);
      const room = clamp(limit, SCAN_BATCH_MAX, SCAN_BATCH_MAX);
      /* R51 (F3a): a file waiting for its bytes is sent only once they are held (its parts, when no whole is); else it waits
         another hour and takes no room in the batch. R55: a file whose call is in flight is not sent again. */
      const batch = [];
      let looked = 0;
      for (const d of due) {
        if (batch.length >= room) break;
        looked++;
        if (this.#batchShas.has(d.sha) || this.#flying(`scan:${d.sha}`)) continue;
        if (d.waiting) {
          if (!(await this.#wholeHeld(d.sha))) { this.sql.exec(`UPDATE fs_files SET scan_wait_at = ? WHERE capture_sha = ?`, iso(now + WAITING_RECHECK_MS), d.sha); continue; }
          this.sql.exec(`UPDATE fs_files SET scan_wait_at = NULL WHERE capture_sha = ?`, d.sha);
        }
        batch.push(d);
      }
      let out = { scanned: 0, found: 0, not_scanned: 0 };
      let inFlight = due.filter((d) => this.#batchShas.has(d.sha) || this.#flying(`scan:${d.sha}`)).length;
      if (batch.length) {
        for (const d of batch) this.#batchShas.add(d.sha);
        const run = await this.#bounded("scanbatch", async () => {
          try { return await this.#runBatch(batch); } finally { for (const d of batch) this.#batchShas.delete(d.sha); }
        });
        if (run.late) inFlight += batch.length;
        else if (run.value.refused) return run.value.refused;
        else {
          out = run.value.out;
          late: for (const tool of this.#routineTools("scan")) {
            for (const d of batch) {
              if (this.#budgetLeft(tool) <= 0) break;
              const p = await this.#bounded(`pscan:${tool.tool_id}:${d.sha}`, () => this.#providerScan(tool, d.sha));
              if (p.late) { inFlight++; break late; }
            }
          }
        }
      }
      this.#keep("scan", { last: now, remaining: Math.max(0, due.length - looked) });
      return { ok: true, ...out, remaining: Math.max(0, due.length - looked) + inFlight, ...(inFlight ? { in_flight: inFlight } : {}) };
    } catch { return refusal("SCANNER_UNREACHABLE", "The scan batch could not be run. No note was written."); }
  }

  /* R46, R49, R50 (fix round 4, C84): a run the scanner shows unfinished: `last_error` `RUN_STARTED` with its `stage` and the
     instant of its latest stage (`stage_at`, else `last_attempt`). Alive while that instant is under `MIRROR_MIN_GAP_MS` old,
     stopped after (the cron resumes it); null when the scanner shows no unfinished run. */
  static #runOf(sigs, now) {
    if (!sigs || typeof sigs !== "object" || sigs.last_error !== "RUN_STARTED") return null;
    const at = [sigs.stage_at, sigs.last_attempt].map(msOf).find(Number.isFinite);
    return { alive: Number.isFinite(at) && now - at < MIRROR_MIN_GAP_MS, stage: typeof sigs.stage === "string" ? sigs.stage : null,
             at: Number.isFinite(at) ? at : null };
  }
  /* R49, R50: asks `file-scanner` to start a run (`POST /mirror?async=1`, its R6). What it asked is the scanner's to remember: it
     writes the run's start itself, and the guards read that, never a note of this module's (R50). */
  async #startRun() {
    const r = await this.#scanner("/mirror?async=1", {});
    if (r.absent) return { absent: true };
    if (r.unreachable || r.status !== 202 || !r.body || r.body.ok === false) return { failed: (r.body && r.body.code) || "SCANNER_UNREACHABLE" };
    return { started: true };
  }
  /* R50: when the scanner holds no published set and the newest attempt is more than six hours old, or none was made, the scan
     batch starts one run, with no administrator's act. A run alive, or a request open, is the cron's to finish: nothing is started.
     It never refuses or changes the batch: a state it cannot read, or a start the scanner does not accept, starts nothing and is
     tried again at the next batch. */
  async #startRunWhenNoSignatures(now) {
    try {
      const got = await this.#bounded("version", () => this.#scanner("/version", null, { method: "GET" }));
      const v = got.late ? {} : got.value;
      const ver = v.body && v.body.ok === true ? v.body : null;
      /* R54: the set the scanner last published, so a file it could not read waits for a newer one (R4) */
      if (ver && ver.signatures && typeof ver.signatures.published === "string") this.#keep("sig", { published: ver.signatures.published });
      if (!ver || !ver.signatures || Number.isFinite(Date.parse(ver.signatures.published))) return;
      const sigs = ver.signatures;
      const run = FileSafety.#runOf(sigs, now);
      if ((run && run.alive) || sigs.request) return;
      const last = msOf(sigs.last_attempt);
      if (Number.isFinite(last) && now - last <= MIRROR_SELF_START_MS) return;
      await this.#startRun();
    } catch { /* the batch goes on as R4 states it */ }
  }

  /** R49: an administrator's "check for new signatures now": starts a run and answers at once, without waiting for it. R50
   *  (fix round 4): a run the scanner shows alive refuses in words that say a check is under way; a stopped one does not block. */
  async scanMirror({ viewer = undefined, at = null } = {}) {
    try {
      const bar = this.#adminBar(viewer, localize("file-safety.index.checking_for_new_signatures", "checking for new signatures"));
      if (bar) return bar;
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", localize("file-safety.index.no_scanner_so_no_run_started", "Your team's Civicsmith has no file scanner installed. No run was started."));
      const now = Number.isFinite(Date.parse(at)) ? Date.parse(at) : this.now();
      const v = await this.#scanner("/version", null, { method: "GET" });
      const sigs = v.body && v.body.ok === true ? v.body.signatures : null;
      const run = FileSafety.#runOf(sigs, now);
      /* DEC-49 REGION is-signature-run-under-way */
      if (run && run.alive)
        return refusal("SIGNATURES_RUN_UNDER_WAY", localize("file-safety.index.a_run_is_under_way", "A check for signatures is already under way. No run was started."),
                       { started_at: iso(run.at), stage: run.stage });
      /* END DEC-49 REGION is-signature-run-under-way */
      const last = run ? NaN : msOf(sigs && sigs.last_attempt);
      /* DEC-49 REGION is-signature-run-due */
      if (Number.isFinite(last) && now - last < MIRROR_MIN_GAP_MS)
        return refusal("SIGNATURES_RUN_RECENT", localize("file-safety.index.a_run_was_started_lately", "A check for signatures was made a few minutes ago. No run was started."), { attempted_at: iso(last) });
      /* END DEC-49 REGION is-signature-run-due */
      const r = await this.#startRun();
      if (r.failed) return refusal("SCANNER_UNREACHABLE", localize("file-safety.index.the_scanner_did_not_start", "The scanner did not start a run. Nothing was changed."), { scanner_code: r.failed });
      return { ok: true, state: "started" };
    } catch { return refusal("SCANNER_UNREACHABLE", localize("file-safety.index.the_scanner_did_not_start", "The scanner did not start a run. Nothing was changed.")); }
  }

  /** R5: the scanner's state for administrators, so a lag is stated, never silent. */
  async scanStatus({ viewer = undefined } = {}) {
    try {
      const bar = this.#adminBar(viewer, localize("file-safety.index.reading_scanners_state", "reading the scanner's state"));
      if (bar) return bar;
      const now = this.now();
      const v = await this.#scanner("/version", null, { method: "GET" });
      const ver = v.body && v.body.ok === true ? v.body : null;
      const published = ver && ver.signatures ? Date.parse(ver.signatures.published) : NaN;
      if (ver && ver.signatures && typeof ver.signatures.published === "string" && Number.isFinite(published)) this.#keep("sig", { published: ver.signatures.published });
      const lists = ver && Array.isArray(ver.reputation_lists) ? ver.reputation_lists.map((l) => Date.parse(l.fetched_at)).filter(Number.isFinite) : [];
      const due = this.#due(now);
      /* R58: the bounds the scanner (and its renderer) state in their own /version, for an administrator to read */
      const bounds = ver && ver.bounds && typeof ver.bounds === "object" && !Array.isArray(ver.bounds) ? ver.bounds : null;
      return { ok: true,
        ...(ver && !Number.isFinite(published) ? { no_signatures: this.#noSignatures(ver.signatures, now) } : {}),
        scanner: ver ? { bound: true, version: ver.version, clamav_version: ver.clamav_version, signatures: ver.signatures, bounds }
          : { bound: !!this.#scannerBinding(), version: null, ...(this.#scannerBinding() ? { unreachable: true } : {}) },
        renderer: ver ? { bound: true, version: ver.renderer_version, bounds } : { bound: !!this.#scannerBinding(), version: null },
        signatures_age_ms: Number.isFinite(published) ? Math.max(0, now - published) : null,
        queued: due.length, overdue: due.filter((d) => Number.isFinite(d.since) && now - d.since > OVERDUE_MS).length,
        held: Number(this.#one(`SELECT COUNT(DISTINCT capture_sha) AS n FROM fs_holds WHERE state <> 'released'`).n),
        tools: this.#rows(`SELECT * FROM fs_tools WHERE state <> 'removed' ORDER BY seq`).map((t) => ({ tool_id: t.tool_id, state: t.state,
          used_this_month: this.#used(t.tool_id), monthly_limit: t.monthly_limit })),
        reputation_list_age_ms: lists.length ? Math.max(0, now - Math.max(...lists)) : null };
    } catch { return refusal("SCANNER_UNREACHABLE", "The scanner's state could not be read."); }
  }

  /* R46: what is true when the scanner holds no signatures: the date it has had none since (the first file it could not scan
     for want of them, else the last time it tried, else none), its reason as it states it, and both in members' words by
     key, never "waiting". Read from the scanner's own state and this module's notes; writes nothing. */
  #noSignatures(state, now) {
    const sigs = state && typeof state === "object" ? state : {};
    const first = this.#one(`SELECT scanned_at FROM fs_notes WHERE kind = 'scan' AND tool = 'clamav' AND result = 'not_scanned'
                             AND reason = 'SIGNATURES_ABSENT' ORDER BY seq LIMIT 1`);
    const at = [first && first.scanned_at, sigs.last_attempt].map(msOf).find(Number.isFinite);
    const since = Number.isFinite(at) ? iso(at) : null;
    const tried = typeof sigs.last_error === "string" && sigs.last_error ? sigs.last_error : null;
    /* C83: `REFUSED:<db>:<status>` (the old download), or `MIRROR_REFUSED:exit N: <the updater's lines>` (freshclam, `file-scanner`
       R34): a status is named only if the text holds one, as an HTTP answer (never the exit code, a version or a count) */
    const old = tried && /^REFUSED:[^:]*:(\d{3})$/.exec(tried);
    const refused = tried && /^MIRROR_REFUSED\b/.test(tried);
    const found = refused && /(?:error code|status(?: code)?|http\/?[\d.]*|code)\s*[:=]?\s*([1-5]\d{2})(?!\d)|\(([1-5]\d{2})\)/i.exec(tried.replace(/^MIRROR_REFUSED:exit \d+:/, ""));
    const status = old || (found && [null, found[1] || found[2]]);
    const date = since && since.slice(0, 10);
    /* R46 (fix round 4, C84): an unfinished run is worded as one, at its stage, or as stopped; never as a refusal */
    const run = FileSafety.#runOf(sigs, now);
    return {
      since, reason: tried || "SIGNATURES_ABSENT",
      ...(since ? { key: "file-safety.index.no_signatures_since",
                    words: localize("file-safety.index.no_signatures_since", "The file scanner has had no signatures since {date}.", { date }) }
                : { key: "file-safety.index.no_signatures",
                    words: localize("file-safety.index.no_signatures", "The file scanner has no signatures.") }),
      ...(run ? FileSafety.#runWords(run) : status ? { reason_key: "file-safety.index.signatures_refused",
                     reason_words: localize("file-safety.index.signatures_refused", "The signature service refused the download (status {status}).", { status: status[1] }) }
        : refused ? { reason_key: "file-safety.index.signatures_refused_unnumbered",
                      reason_words: localize("file-safety.index.signatures_refused_unnumbered", "The signature service refused the download. The scanner tries again daily; to fix it sooner, an administrator can check that your team's Civicsmith is allowed to reach the service.") }
        : tried ? { reason_key: "file-safety.index.signatures_failed",
                    reason_words: localize("file-safety.index.signatures_failed", "The last download of signatures did not finish.") }
        : { reason_key: "file-safety.index.signatures_not_fetched",
            reason_words: localize("file-safety.index.signatures_not_fetched", "No download of signatures has finished yet.") }),
    };
  }

  /* R46 (fix round 4, C84): the words of an unfinished run, by key: under way at its stage, or stopped and to be resumed. */
  static #runWords(run) {
    if (!run.alive)
      return { reason_key: "file-safety.index.signatures_run_stopped",
               reason_words: localize("file-safety.index.signatures_run_stopped", "The last check for signatures stopped before it finished. It will be resumed shortly.") };
    switch (run.stage) {
      case "seed": return { reason_key: "file-safety.index.signatures_run_seed",
        reason_words: localize("file-safety.index.signatures_run_seed", "A check for signatures is under way: it is preparing the signatures the file scanner already holds.") };
      case "download": return { reason_key: "file-safety.index.signatures_run_download",
        reason_words: localize("file-safety.index.signatures_run_download", "A check for signatures is under way: it is downloading the signatures that changed.") };
      case "stage": return { reason_key: "file-safety.index.signatures_run_stage",
        reason_words: localize("file-safety.index.signatures_run_stage", "A check for signatures is under way: it is setting the new signatures aside to check them.") };
      case "verify": return { reason_key: "file-safety.index.signatures_run_verify",
        reason_words: localize("file-safety.index.signatures_run_verify", "A check for signatures is under way: it is checking that the new signatures are genuine.") };
      default: return { reason_key: "file-safety.index.signatures_run_under_way",
        reason_words: localize("file-safety.index.signatures_run_under_way", "A check for signatures is under way.") };
    }
  }

  /* ===== the group's security tools (R27–R32) ===== */

  /* R27–R31: an administrator's act or read; a machine credential is refused as anyone else is (membership R84). */
  #adminBar(by, act) {
    const who = memberOf(by);
    const admin = who !== null && !isMachineIdentity(by) && !String(by).startsWith(MACHINE_CLASS_PREFIX)
      && (() => { try { return this.membership.isAdministrator(who); } catch { return false; } })();
    return admin ? null : notAnAdmin(by ?? null, act);
  }
  static #handlingDigest(handling) { return sha256HexSync(canonicalJson(handling)); }
  /* R27, R28 (N777): the settings an entry's adapter reads, as `file-scanner` R19 lists them. */
  static #configOf(d) { return d && Array.isArray(d.config) ? d.config : []; }
  static #toolOut(r) {
    return { tool_id: r.tool_id, provider_id: r.provider_id, kinds: parse(r.kinds, []), use: r.use, state: r.state,
             handling: parse(r.handling, {}), handling_digest: r.handling_digest, monthly_limit: r.monthly_limit,
             added_by: r.added_by, added_at: r.added_at, tested_at: r.tested_at, off_reason: r.off_reason };
  }
  #toolRow(toolId) { return typeof toolId === "string" ? this.#one(`SELECT * FROM fs_tools WHERE tool_id = ?`, toolId) : null; }
  /* R29: a tool is used only while `on`; the first of a kind is the earliest added. */
  #onTools(kind) {
    return this.#rows(`SELECT * FROM fs_tools WHERE state = 'on' ORDER BY seq`).filter((t) => parse(t.kinds, []).includes(kind));
  }
  #routineTools(kind) {
    try { return this.#onTools(kind).filter((t) => t.use === "routine"); } catch { return []; }
  }
  #used(toolId) {
    const r = this.#one(`SELECT used FROM fs_tool_usage WHERE tool_id = ? AND month = ?`, toolId, monthOf(this.now()));
    return r ? Number(r.used) : 0;
  }
  #budgetLeft(tool) { return tool.monthly_limit - this.#used(tool.tool_id); }
  #spend(tool) {
    this.sql.exec(`INSERT INTO fs_tool_usage (tool_id, month, used) VALUES (?, ?, 1)
                   ON CONFLICT(tool_id, month) DO UPDATE SET used = used + 1`, tool.tool_id, monthOf(this.now()));
  }
  #event(toolId, event, reason = null) {
    this.sql.exec(`INSERT INTO fs_tool_events (tool_id, event, at, reason) VALUES (?, ?, ?, ?)`, toolId, event, iso(this.now()), reason);
  }
  /* R31: a tool that did not honour its private mode is switched off, for the administrators' notice. */
  #switchOff(tool, reason) {
    this.sql.exec(`UPDATE fs_tools SET state = 'off', off_reason = ? WHERE tool_id = ?`, reason, tool.tool_id);
    this.#event(tool.tool_id, "switched_off", reason);
  }
  /* R21's tool spec (`file-scanner`), its credentials read from `credentials` for this call only; null when they
     cannot be read. No member and no file is in it (R23). */
  async #spec(tool) {
    const base = providerById(tool.provider_id);
    let key = base && Array.isArray(base.credentials) && !base.credentials.length ? {} : null;
    if (key === null) {
      try {
        const k = await this.credentials.keyedServiceFor({ service: `security:${tool.tool_id}` });
        key = k && k.ok === true ? k.key : null;
      } catch { key = null; }
    }
    if (key === null) return null;
    const config = parse(tool.config, {});
    return { provider_id: tool.provider_id, tool_id: tool.tool_id, ...(tool.region ? { region: tool.region } : {}),
             ...(tool.host ? { host: tool.host } : {}), config,
             credentials: typeof key === "string" ? { key } : key, handling_confirmed: tool.confirm_retention === 1,
             monthly_limit_left: this.#budgetLeft(tool) };
  }

  /** R27: the catalogue for administrators: what each offered tool is sent and who keeps it (its digest is what an
   *  administrator confirms seeing, R28), and the services not offered, each with its reason in member words. */
  securityToolCatalogue({ viewer = undefined } = {}) {
    const bar = this.#adminBar(viewer, localize("file-safety.index.reading_security_tools_offered", "reading the security tools offered"));
    if (bar) return bar;
    return { ok: true,
      offered: PROVIDERS.map((d) => ({ provider_id: d.provider_id, vendor: d.vendor, product: d.product, kinds: d.kinds,
        transport: d.transport, reach: d.reach, template: !!d.template, credentials: d.credentials,
        config: FileSafety.#configOf(d).map((f) => ({ name: f.name, label: f.label, required: f.required === true })), handling: d.handling,
        handling_digest: FileSafety.#handlingDigest(d.handling), licence_note: d.licence_note ?? null,
        source_urls: d.source_urls, read_on: d.read_on })),
      refused: REFUSED_PROVIDERS.map((r) => ({ provider_id: r.provider_id, reason: r.reason,
        words: PROVIDER_REASON_WORDS[r.reason] || PROVIDER_REASON_WORDS.NOT_OFFERED })),
      held: HELD_PROVIDERS.map((h) => ({ provider_id: h.provider_id, reason: h.missing || "HANDLING_NOT_STATED",
        words: PROVIDER_REASON_WORDS[h.missing] || PROVIDER_REASON_WORDS.HANDLING_NOT_STATED })) };
  }

  /** R27: the group's tools, without credentials. */
  securityTools({ viewer = undefined } = {}) {
    const bar = this.#adminBar(viewer, localize("file-safety.index.reading_teams_security_tools", "reading the team's security tools"));
    if (bar) return bar;
    return { ok: true, tools: this.#rows(`SELECT * FROM fs_tools ORDER BY seq`).map(FileSafety.#toolOut) };
  }

  /** R28: an active administrator adds a tool, off until its test passes (R29). Each refusal writes nothing. */
  async securityToolAdd({ providerId = null, template = null, config = null, credentials = null, handlingDigest = null,
                          confirmRetention = false, use = "on_request", monthlyLimit = undefined, by = null } = {}) {
    try {
      const bar = this.#adminBar(by, "adding a security tool");
      if (bar) return bar;
      const id = typeof providerId === "string" ? providerId : null;
      /* DEC-49 REGION is-provider-offered */
      const refused = REFUSED_PROVIDERS.find((r) => r.provider_id === id);
      if (refused) return refusal("PROVIDER_REFUSED", "The catalogue refuses this service.", { provider_id: id, provider_reason: refused.reason,
        words: PROVIDER_REASON_WORDS[refused.reason] || PROVIDER_REASON_WORDS.NOT_OFFERED });
      const held = HELD_PROVIDERS.find((h) => h.provider_id === id);
      if (held) return refusal("PROVIDER_HELD", "The catalogue holds this service back.", { provider_id: id, provider_reason: held.missing });
      const base = id ? providerById(id) : null;
      const cfg = config && typeof config === "object" && !Array.isArray(config) ? { ...config } : {};
      /* `host` (from `config`, or a generic template's `template.host`) and `region` are the spec's own fields
         (file-scanner R21): held apart from `config`, and given for the entry's list when it names them (T38) */
      const text = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
      const host = (template && typeof template === "object" ? text(template.host) : null) || text(cfg.host);
      const region = text(cfg.region);
      delete cfg.host; delete cfg.region;
      if (!base || (base.template && !host)) return refusal("PROVIDER_UNKNOWN", "No offered service has this name, or a generic tool names no host.", { provider_id: id });
      /* END DEC-49 REGION is-provider-offered */
      /* DEC-49 REGION is-descriptor-valid */
      const resolved = resolveDescriptor(base, { host, config: cfg });
      if (!resolved.ok) return refusal(FILE_SAFETY_CHECKS[resolved.code] ? resolved.code : "DESCRIPTOR_MALFORMED",
        localize("file-safety.index.file_scanners_r19_refuses_the", "file-scanner's R19 refuses the tool's description."), { provider_id: id, ...(resolved.field ? { field: resolved.field } : {}) });
      /* END DEC-49 REGION is-descriptor-valid */
      /* DEC-49 REGION is-config-named */
      const fields = FileSafety.#configOf(base);
      const empty = (v) => v === undefined || v === null || (typeof v === "string" && !v.trim())
        || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
      const given = { ...cfg, ...(host ? { host } : {}), ...(region ? { region } : {}) };
      const absent = fields.find((f) => f.required === true && empty(given[f.name]));
      if (absent) return refusal("CONFIG_MISSING", "A setting the tool's entry names as required was not given.", { provider_id: id, field: absent.name });
      const stray = Object.keys(cfg).find((k) => !fields.some((f) => f.name === k));
      if (stray !== undefined) return refusal("CONFIG_UNKNOWN", "A setting was given that the tool's entry does not name.", { provider_id: id, field: stray });
      /* END DEC-49 REGION is-config-named */
      const d = resolved.descriptor;
      /* the digest the catalogue (R27) answers for the entry, a generic template's own included, is what the
         administrator saw; the tool keeps the digest of the handling it works under, for a template the handling its
         maker stated in `config`, computed here (T38) */
      const shown = FileSafety.#handlingDigest(base.handling);
      const digest = FileSafety.#handlingDigest(d.handling);
      /* DEC-49 REGION is-handling-shown */
      if (handlingDigest !== shown) return refusal("HANDLING_NOT_SHOWN", "handlingDigest is not the tool's current handling_digest.", { provider_id: id, handling_digest: shown });
      /* END DEC-49 REGION is-handling-shown */
      /* DEC-49 REGION is-retention-confirmed */
      if (d.handling.sample_sharing === "vendor_internal_research" && confirmRetention !== true)
        return refusal("RETENTION_NOT_CONFIRMED", "The vendor keeps samples for its own research; confirmRetention is not true.", { provider_id: id });
      /* END DEC-49 REGION is-retention-confirmed */
      const creds = credentials && typeof credentials === "object" && !Array.isArray(credentials) ? credentials : {};
      /* DEC-49 REGION is-credentials-given */
      const missing = (d.credentials || []).find((n) => !(typeof creds[n] === "string" && creds[n].trim()));
      if (missing) return refusal("CREDENTIALS_MISSING", "A credential the tool names was not given.", { provider_id: id, field: missing });
      /* END DEC-49 REGION is-credentials-given */
      /* DEC-49 REGION is-use-allowed */
      if (!TOOL_USES.includes(use) || (use === "routine" && !onOwnServers(d.handling.recipient)))
        return refusal("USE_NOT_ALLOWED", "Routine use is for a tool on the organization's own servers only.", { provider_id: id, use: use ?? null });
      /* END DEC-49 REGION is-use-allowed */
      const limit = monthlyLimit === undefined || monthlyLimit === null ? DEEPER_CHECKS_PER_MONTH : monthlyLimit;
      /* DEC-49 REGION is-limit-valid */
      if (!Number.isSafeInteger(limit) || limit < MONTHLY_LIMIT.min || limit > MONTHLY_LIMIT.max)
        return refusal("LIMIT_INVALID", "monthlyLimit is a whole number from 1 to 100,000.", { provider_id: id });
      /* END DEC-49 REGION is-limit-valid */
      const seq = Number(this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM fs_tools`).n);
      let toolId = `${id}-${seq}`;
      while (this.#toolRow(toolId)) toolId = `${id}-${seq}-${Math.floor(Math.random() * 1e6)}`;
      const service = `security:${toolId}`;
      /* the fields the tool names, held by credentials (its R29); a tool that names none holds nothing there */
      const key = Object.fromEntries((d.credentials || []).map((n) => [n, creds[n]]));
      if (Object.keys(key).length) {
        const set = await this.credentials.keyedServiceSet({ service, key, by });
        if (!set || set.ok !== true) return set;
        const on = this.credentials.keyedServiceSwitch({ service, on: true, by });
        if (!on || on.ok !== true) { await this.credentials.keyedServiceSet({ service, key: null, by }); return on; }
      }
      const at = iso(this.now());
      this.sql.exec(`INSERT INTO fs_tools (tool_id, provider_id, kinds, use, state, handling, handling_digest, monthly_limit, added_by, added_at,
                       region, host, config, confirm_retention, seq) VALUES (?,?,?,?, 'added', ?,?,?,?,?,?,?,?,?,?)`,
        toolId, id, JSON.stringify(d.kinds), use, JSON.stringify(d.handling), digest, limit, memberOf(by), at, region, host,
        JSON.stringify(cfg), confirmRetention === true ? 1 : 0, seq);
      this.#event(toolId, "added");
      return { ok: true, tool_id: toolId, state: "added" };
    } catch { return refusal("PROVIDER_UNKNOWN", "The tool could not be added. Nothing was added."); }
  }

  #tool(toolId) {
    const t = this.#toolRow(toolId);
    /* DEC-49 REGION is-tool-held */
    if (!t || t.state === "removed") return { refused: refusal("NO_SUCH_TOOL", localize("file-safety.index.no_tool_of_the_teams", "No tool of the team's has this id."), { tool_id: toolId ?? null }) };
    /* END DEC-49 REGION is-tool-held */
    return { tool: t };
  }

  /** R29: the tool's test through `file-scanner`; a pass turns it on, anything else leaves it off. */
  async securityToolTest({ toolId = null, by = null } = {}) {
    try {
      const bar = this.#adminBar(by, "testing a security tool");
      if (bar) return bar;
      const { tool, refused } = this.#tool(toolId);
      if (refused) return refused;
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", localize("file-safety.index.your_teams_civicsmith_has_no_4", "Your team's Civicsmith has no file scanner installed, so no tool can be tested."), { tool_id: tool.tool_id });
      const spec = await this.#spec(tool);
      const r = spec ? await this.#scanner("/provider/test", { tool: spec }) : { body: { ok: false, code: "CREDENTIALS_UNAVAILABLE" } };
      const at = iso(this.now());
      const passed = !!(r.body && r.body.ok === true && r.body.passed === true);
      const detail = r.unreachable ? "SCANNER_UNREACHABLE" : r.body ? (r.body.ok === true ? r.body.detail : r.body.code) : "SCANNER_UNREACHABLE";
      this.sql.exec(`UPDATE fs_tools SET state = ?, tested_at = ?, detail = ?, off_reason = NULL WHERE tool_id = ?`,
                    passed ? "on" : "test_failed", at, detail == null ? null : String(detail).slice(0, 300), tool.tool_id);
      this.#event(tool.tool_id, passed ? "test_passed" : "test_failed");
      /* R41: a test asks a reputation tool's list again; R40: a tool switched on may give its batch work sooner */
      this.sql.exec(`DELETE FROM fs_wakes WHERE key = ?`, `reputation:${tool.tool_id}`);
      if (passed) {
        const kinds = parse(tool.kinds, []);
        if (kinds.includes("log_sink")) this.#arm("forward", () => this.forwardWake(this.now()));
        if (kinds.includes("url_reputation")) this.#arm("reputation", () => this.reputationWake(this.now()));
      }
      return { ok: true, tool_id: tool.tool_id, state: passed ? "on" : "test_failed", passed, detail: detail ?? null, tested_at: at };
    } catch { return refusal("SCANNER_UNREACHABLE", "The test could not be run. Nothing was changed."); }
  }

  /** R30: the tool removed, its credentials removed, its notes kept; it is never called again. */
  async securityToolRemove({ toolId = null, by = null } = {}) {
    try {
      const bar = this.#adminBar(by, "removing a security tool");
      if (bar) return bar;
      const { tool, refused } = this.#tool(toolId);
      if (refused) return refused;
      const gone = await this.credentials.keyedServiceSet({ service: `security:${tool.tool_id}`, key: null, by });
      if (!gone || gone.ok !== true) return gone;
      /* R30: its key is gone, and it is never called again */
      this.sql.exec(`UPDATE fs_tools SET state = 'removed' WHERE tool_id = ?`, tool.tool_id);
      this.#event(tool.tool_id, "removed");
      return { ok: true, tool_id: tool.tool_id, state: "removed" };
    } catch { return refusal("NO_SUCH_TOOL", "The tool could not be removed. Nothing was changed.", { tool_id: toolId ?? null }); }
  }

  /** R31: each add, test, removal and switch, for the administrators' notice; no file is named. `reason` is a switch
   *  off's `off_reason`, else null; `cursor` the last event answered when more follow, else null. */
  securityToolEvents({ after = null, limit = LIST.default, viewer = undefined } = {}) {
    const bar = this.#adminBar(viewer, "reading the security tools' events");
    if (bar) return bar;
    const from = Number.isFinite(Number(after)) && after !== null && after !== "" ? Number(after) : 0;
    const lim = listLimit(limit);
    const rows = this.#rows(`SELECT * FROM fs_tool_events WHERE seq > ? ORDER BY seq LIMIT ?`, from, lim + 1);
    const page = rows.slice(0, lim), more = rows.length > lim;
    return { ok: true, events: page.map((e) => ({ tool_id: e.tool_id, event: e.event, at: e.at,
                                                   reason: e.event === "switched_off" ? (e.reason ?? null) : null })),
             cursor: more ? String(page[page.length - 1].seq) : null, truncated: more };
  }

  /* R4, R14: one outside scan of one file by one tool: a note per engine's verdict; `PRIVATE_MODE_NOT_HONOURED` switches
     the tool off (R31). Answers the check entries. */
  async #providerScan(tool, sha) {
    const spec = await this.#spec(tool);
    if (!spec) return [{ check: "scan", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: "CREDENTIALS_UNAVAILABLE" }];
    this.#spend(tool);
    const r = await this.#scanner("/provider/scan", { store: this.store, target: this.#target(sha), tool: spec });
    if (r.body && r.body.ok === true && Array.isArray(r.body.verdicts)) {
      return r.body.verdicts.map((v) => {
        this.#writeNote(sha, { kind: "scan", ...v });
        return { check: "scan", tool: v.tool, tool_id: tool.tool_id, engine: v.engine, result: v.result,
                 detail: v.result === "found" || v.result === "suspicious" ? (v.findings || []).join(", ") : (v.reason || v.detail || null) };
      });
    }
    const code = r.unreachable ? "SCANNER_UNREACHABLE" : (r.body && r.body.code) || "SERVICE_UNREACHABLE";
    if (code === "PRIVATE_MODE_NOT_HONOURED") this.#switchOff(tool, code);
    return [{ check: "scan", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: code }];
  }

  /* ===== the deeper check (R13, R14, R36) ===== */

  /** R13: any member who may see the file asks; a check already queued or running answers it, and so does one done
   *  within DEEPER_CHECK_FRESH_MS with no note since. Who asked is not kept (R10). */
  requestDeeperCheck({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      const sha = h.sha;
      const open = this.#one(`SELECT * FROM fs_deeper WHERE capture_sha = ? AND state IN ('queued', 'running') ORDER BY requested_at DESC LIMIT 1`, sha);
      if (open) return { ok: true, captureSha: sha, state: open.state, check_id: open.check_id };
      const done = this.#one(`SELECT * FROM fs_deeper WHERE capture_sha = ? AND state = 'done' ORDER BY done_at DESC LIMIT 1`, sha);
      if (done && done.note_id && this.now() - Date.parse(done.done_at) < DEEPER_CHECK_FRESH_MS) {
        const note = this.#one(`SELECT * FROM fs_notes WHERE note_id = ?`, done.note_id);
        const since = note && this.#one(`SELECT 1 AS x FROM fs_notes WHERE capture_sha = ? AND seq > ? AND kind <> 'deeper'`, sha, note.seq);
        if (note && !since) return { ok: true, captureSha: sha, state: "done", check_id: done.check_id, note: FileSafety.#note(note) };
      }
      const tools = [...this.#onTools("scan"), ...this.#onTools("sandbox")].filter((t, i, a) => a.findIndex((x) => x.tool_id === t.tool_id) === i);
      /* DEC-49 REGION is-outside-tool-on */
      if (!tools.length) return refusal("NO_OUTSIDE_TOOL", "No tool of kind scan or sandbox is on.", { captureSha: sha });
      if (tools.every((t) => this.#budgetLeft(t) <= 0)) return refusal("DEEPER_CHECK_BUDGET_SPENT", "Every scan and sandbox tool has spent its monthly_limit this calendar month (UTC).", { captureSha: sha });
      /* END DEC-49 REGION is-outside-tool-on */
      const checkId = `FSD-${[...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
      this.sql.exec(`INSERT INTO fs_deeper (check_id, capture_sha, bundle_id, state, requested_at) VALUES (?, ?, ?, 'queued', ?)`,
                    checkId, sha, this.#home(sha), iso(this.now()));
      this.#arm("deeper", () => this.deeperWake(this.now()));
      return { ok: true, captureSha: sha, state: "queued", check_id: checkId };
    } catch { return refusal("NO_OUTSIDE_TOOL", "The deeper check could not be asked for.", { captureSha: captureSha ?? null }); }
  }

  /* R14's structure check: the file's reader reads it whole (K1928 Q2), an archive by its listing. R54: a file or member the
     structure shows encrypted answers `encrypted`, never clean. R56 (G136d): a picture is not examined (`not_examined`, never `clean`),
     and a TIFF, HEIC or BMP is named as an unread image type; an office file too large to load is checked from its directory. */
  async #structureCheck(sha) {
    const look = await this.#look(sha);
    const bytes = look ? look.bytes : null;
    const entry = (result, detail) => ({ check: "structure", tool: "file-safety", engine: "structure", result, detail });
    if (!bytes) return entry("not_scanned", "NOT_FOUND");
    if (look.encrypted) return entry("encrypted", "ENCRYPTED");
    const format = look.format;
    if (format === "image")
      return entry("not_examined", READ_IMAGES.includes(look.image) ? "IMAGE" : `UNREAD_IMAGE_TYPE:${look.image}`);
    /* R51: a capture above GRADE_READ_MAX is not loaded by its structure check: `not_scanned TOO_LARGE`, its grade being R56's from range reads */
    if (look.tooLarge) return entry("not_scanned", "TOO_LARGE");
    if (format === "zip") {
      const l = await this.#listing(sha);
      if (!l.ok) return entry("flagged", `refused:${l.code}`);
      const flags = [];
      if (!l.archive || l.archive.opened !== true) flags.push("not_opened");
      if (l.archive && l.archive.refused) flags.push("refused");
      for (const s of ["waiting", "not_filed", "link"]) if (l.entries.some((e) => e.state === s)) flags.push(s);
      return flags.length ? entry("flagged", flags.join(", ")) : entry("clean", "zip");
    }
    if (ACTIVE_FORMATS.includes(format)) {
      const f = structureFlags(await readActive(format, bytes));
      return f.flags.length ? entry("flagged", f.flags.join(", ")) : entry("clean", format);
    }
    if (format === "text") return entry("clean", format);
    return entry("not_scanned", `NO_READER:${format}`);
  }

  /* R14: the check starts: the structure check, ClamAV on demand, every outside scan tool and a submission to every
     outside sandbox with budget left (a tool past its limit is skipped and named). */
  async #startDeeper(row) {
    const sha = row.capture_sha;
    const checks = [await this.#structureCheck(sha)];
    /* R54: a structure check that finds an encrypted file or member writes a note saying so, which no one reads as clean */
    if (checks[0].result === "encrypted")
      this.#writeNote(sha, { kind: "scan", tool: FILE_SAFETY_MODULE, engine: "structure", engine_version: "not reported", signatures: null,
        scanned_at: iso(this.now()), result: "encrypted", findings: [], reason: "ENCRYPTED" });
    const c = await this.#clamavOnce(sha);
    if (c.verdict) {
      checks.push({ check: "clamav", tool: "clamav", engine: c.verdict.engine, result: c.verdict.result,
                    detail: c.verdict.result === "found" ? (c.verdict.findings || []).join(", ") : (c.verdict.reason || c.verdict.detail || null) });
    } else checks.push({ check: "clamav", tool: "clamav", engine: "clamav", result: "not_scanned", detail: c.absent ? "SCANNER_ABSENT" : c.failed });
    const pending = [];
    for (const kind of ["scan", "sandbox"]) {
      for (const tool of this.#onTools(kind)) {
        if (this.#budgetLeft(tool) <= 0) { checks.push({ check: kind, tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "skipped", detail: "MONTHLY_LIMIT_REACHED" }); continue; }
        if (kind === "scan") {
          /* R55: an outside scan is not waited for beyond the bound; its note is written when it arrives, and this check says it is pending */
          const got = await this.#bounded(`pscan:${tool.tool_id}:${sha}`, () => this.#providerScan(tool, sha));
          checks.push(...(got.late ? [{ check: "scan", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: "CALL_PENDING" }] : got.value));
          continue;
        }
        const spec = await this.#spec(tool);
        if (!spec) { checks.push({ check: "sandbox", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: "CREDENTIALS_UNAVAILABLE" }); continue; }
        this.#spend(tool);
        const r = await this.#scanner("/provider/sandbox", { store: this.store, target: this.#target(sha), tool: spec });
        if (r.body && r.body.ok === true && r.body.state === "submitted" && r.body.vendor_ref) {
          this.#count("sandbox_submissions");
          const submitted = iso(this.now());
          pending.push({ tool_id: tool.tool_id, vendor_ref: String(r.body.vendor_ref), submitted_at: submitted,
                         next_at: this.now() + (Number(r.body.poll_after_ms) || 60_000) });
        } else {
          const code = r.unreachable ? "SCANNER_UNREACHABLE" : (r.body && r.body.code) || "SERVICE_UNREACHABLE";
          if (code === "PRIVATE_MODE_NOT_HONOURED") this.#switchOff(tool, code);
          checks.push({ check: "sandbox", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: code });
        }
      }
    }
    this.sql.exec(`UPDATE fs_deeper SET state = 'running', started_at = ?, checks = ?, pending = ? WHERE check_id = ?`,
                  iso(this.now()), JSON.stringify(checks), JSON.stringify(pending), row.check_id);
    return this.#one(`SELECT * FROM fs_deeper WHERE check_id = ?`, row.check_id);
  }

  /* R36: each running sandbox is asked for its result no sooner than its `poll_after_ms`; a `sandbox` note per verdict. */
  async #pollDeeper(row) {
    const sha = row.capture_sha;
    const checks = parse(row.checks, []), left = [];
    let polled = 0;
    for (const p of parse(row.pending, [])) {
      const tool = this.#toolRow(p.tool_id);
      if (!tool || tool.state !== "on") { checks.push({ check: "sandbox", tool: tool ? tool.provider_id : null, tool_id: p.tool_id, engine: null, result: "not_scanned", detail: tool ? `TOOL_${tool.state.toUpperCase()}` : "TOOL_REMOVED" }); continue; }
      if (this.now() < p.next_at) { left.push(p); continue; }
      const spec = await this.#spec(tool);
      if (!spec) { checks.push({ check: "sandbox", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: "CREDENTIALS_UNAVAILABLE" }); continue; }
      polled++;
      const r = await this.#scanner("/provider/sandbox/result", { tool: spec, vendor_ref: p.vendor_ref, submitted_at: p.submitted_at });
      if (r.body && r.body.ok === true && r.body.state === "running") { left.push({ ...p, next_at: this.now() + (Number(r.body.poll_after_ms) || 60_000) }); continue; }
      if (r.body && r.body.ok === true && r.body.state === "done" && Array.isArray(r.body.verdicts)) {
        for (const v of r.body.verdicts) {
          this.#writeNote(sha, { kind: "sandbox", ...v, vendor_ref: v.vendor_ref ?? p.vendor_ref });
          checks.push({ check: "sandbox", tool: v.tool, tool_id: tool.tool_id, engine: v.engine, result: v.result,
                        detail: v.result === "found" || v.result === "suspicious" ? (v.findings || []).join(", ") : (v.reason || v.detail || null) });
        }
        continue;
      }
      const code = r.unreachable ? "SCANNER_UNREACHABLE" : (r.body && r.body.code) || "SERVICE_UNREACHABLE";
      if (code === "PRIVATE_MODE_NOT_HONOURED") this.#switchOff(tool, code);
      checks.push({ check: "sandbox", tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "not_scanned", detail: code });
    }
    this.sql.exec(`UPDATE fs_deeper SET checks = ?, pending = ? WHERE check_id = ?`, JSON.stringify(checks), JSON.stringify(left), row.check_id);
    return { row: this.#one(`SELECT * FROM fs_deeper WHERE check_id = ?`, row.check_id), polled };
  }

  /* R14: a check is done when every check in it has a result. `clean` only when every check that ran is clean and an
     outside engine of another family than ClamAV's answered clean; `flagged` when any found, was suspicious or the
     structure check flagged; `incomplete` otherwise, which never opens an original. R18's release follows. */
  #finishDeeper(row) {
    const sha = row.capture_sha;
    const checks = parse(row.checks, []);
    const ran = checks.filter((c) => c.result !== "skipped" && c.result !== "not_examined");
    const flagged = ran.some((c) => ["found", "suspicious", "flagged"].includes(c.result));
    const incomplete = ran.some((c) => !["clean", "found", "suspicious", "flagged"].includes(c.result));
    const outsideClean = ran.find((c) => c.result === "clean" && c.check !== "structure" && c.tool !== "clamav"
      && differentEngine({ tool: c.tool, engine: c.engine }, { tool: "clamav", engine: "clamav" }));
    const result = flagged ? "flagged" : !incomplete && outsideClean ? "clean" : "incomplete";
    const findings = [...new Set(ran.filter((c) => c.result === "found" || c.result === "suspicious")
      .flatMap((c) => String(c.detail || "").split(", ").filter(Boolean)))];
    const noteId = this.#writeNote(sha, { kind: "deeper", tool: FILE_SAFETY_MODULE, engine: "deeper-check", engine_version: "not reported",
      signatures: null, scanned_at: iso(this.now()), result, findings, checks });
    const structure = checks.find((c) => c.check === "structure");
    const releases = structure && structure.result === "clean" && outsideClean
      ? this.#secondEngineRelease(sha, noteId, { tool: outsideClean.tool, engine: outsideClean.engine }) : [];
    this.sql.exec(`UPDATE fs_deeper SET state = 'done', done_at = ?, note_id = ?, releases = ? WHERE check_id = ?`,
                  iso(this.now()), noteId, JSON.stringify(releases), row.check_id);
    this.#count("deeper_checks");
    this.#stampHome(sha);
    return { check_id: row.check_id, captureSha: sha, result, note_id: noteId, releases };
  }

  /** R36: the scheduler's wake while checks are queued or running: queued checks start, running sandboxes are asked.
   *  Checks that cannot be read answer DEEPER_CHECKS_UNREADABLE, starting and asking nothing. */
  async deeperBatch({ limit = 20 } = {}) {
    const lim = clamp(limit, 20, SCAN_BATCH_MAX);
    let queued, running;
    try {
      this.#keep("deeper", { last: this.now(), unreadable: false });
      /* DEC-49 REGION is-deeper-readable */
      queued = this.#rows(`SELECT * FROM fs_deeper WHERE state = 'queued' ORDER BY requested_at LIMIT ?`, lim);
      running = this.#rows(`SELECT * FROM fs_deeper WHERE state = 'running' ORDER BY requested_at LIMIT ?`, lim);
      for (const r of [...queued, ...running]) if (!Array.isArray(JSON.parse(r.pending)) || !Array.isArray(JSON.parse(r.checks))) throw new Error("unreadable");
      /* END DEC-49 REGION is-deeper-readable */
    } catch {
      this.#keep("deeper", { last: this.now(), unreadable: true });
      return refusal("DEEPER_CHECKS_UNREADABLE", "The deeper checks could not be read. None was started or asked about.");
    }
    const out = { started: 0, polled: 0, done: [] };
    try {
      for (const q of queued) {
        const row = await this.#startDeeper(q);
        out.started++;
        if (!parse(row.pending, []).length) out.done.push(this.#finishDeeper(row));
      }
      for (const q of running) {
        const { row, polled } = await this.#pollDeeper(q);
        out.polled += polled;
        if (!parse(row.pending, []).length) out.done.push(this.#finishDeeper(row));
      }
      const left = (st) => Number(this.#one(`SELECT COUNT(*) AS n FROM fs_deeper WHERE state = ?`, st).n);
      return { ok: true, ...out, running: left("running"), queued: left("queued") };
    } catch {
      this.#keep("deeper", { last: this.now(), unreadable: true });
      return refusal("DEEPER_CHECKS_UNREADABLE", "The deeper checks could not be read after some were started; the rest wait for the next round.",
                     { started: out.started, polled: out.polled });
    }
  }

  /* ===== the safe copy (R33) ===== */

  /* One copy made by one CDR tool: the rebuilt file under its own digest outside `captures/`, then scanned by ClamAV
     (its `copy` note, beside the original's notes); it is handed out only once that note is clean. */
  async #makeCopy(sha, tool) {
    const at = iso(this.now());
    this.sql.exec(`INSERT INTO fs_copies (capture_sha, bundle_id, state, queued_at, tool_id) VALUES (?, ?, 'pending', ?, ?)
                   ON CONFLICT(capture_sha) DO UPDATE SET state = 'pending', tool_id = excluded.tool_id, reason = NULL, detail = NULL`,
                  sha, this.#home(sha), at, tool.tool_id);
    const fail = (code, detail = null) => {
      this.sql.exec(`UPDATE fs_copies SET state = 'failed', reason = ?, detail = ? WHERE capture_sha = ?`, code, detail, sha);
      return "failed";
    };
    const spec = await this.#spec(tool);
    if (!spec) return fail("CREDENTIALS_UNAVAILABLE");
    this.#spend(tool);
    const r = await this.#scanner("/provider/cdr", { store: this.store, target: this.#target(sha), tool: spec });
    const copySha = r.bytes && r.status === 200 ? r.headers.get("x-derived-sha256") : null;
    if (!copySha || !HEX64.test(copySha)) {
      const code = r.unreachable ? "SCANNER_UNREACHABLE" : (r.body && r.body.code) || "SAFE_COPY_FAILED";
      if (code === "PRIVATE_MODE_NOT_HONOURED") this.#switchOff(tool, code);
      return fail(code, r.body && r.body.detail ? String(r.body.detail).slice(0, 300) : null);
    }
    const bucket = this.#bucket();
    if (!bucket) return fail("R2_NOT_CONFIGURED");
    await bucket.put(derivedKey(this.store, copySha), r.bytes, { sha256: copySha,
      customMetadata: { derived: "true", of: sha, kind: "safe-copy", tool: tool.provider_id } });
    const type = r.headers.get("x-output-type") || r.headers.get("content-type") || "application/octet-stream";
    const removed = parse(r.headers.get("x-removed"), []);
    /* R33 (N753): the copy is read where it is stored, `file-scanner` R2's derived area, named on the target */
    const s = await this.#scanner("/scan", { store: this.store, targets: [{ capture_sha: copySha, parts: null, area: "derived" }] });
    const v = s.body && s.body.ok === true && Array.isArray(s.body.verdicts) && s.body.verdicts[0] ? s.body.verdicts[0]
      : { tool: "clamav", engine: "clamav", engine_version: "not reported", signatures: null, scanned_at: iso(this.now()), result: "not_scanned",
          findings: [], reason: s.unreachable ? "SCANNER_UNREACHABLE" : (s.body && s.body.code) || "SCANNER_UNREACHABLE" };
    const noteId = this.#writeNote(sha, { kind: "copy", ...v, capture_sha: undefined });
    const state = v.result === "clean" ? "done" : "withheld";
    this.sql.exec(`UPDATE fs_copies SET state = ?, copy_sha = ?, content_type = ?, removed = ?, note_id = ?, made_at = ? WHERE capture_sha = ?`,
                  state, copySha, type, JSON.stringify(removed), noteId, iso(this.now()), sha);
    this.#count("safe_copies");
    return state;
  }

  /** R33: a member who may see the file asks the first `on` CDR tool for a rebuilt file. Who asked is not kept (R10). */
  async requestSafeCopy({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer, { serves: true });
      if (h.refused) return h.refused;
      const tool = this.#onTools("cdr")[0];
      /* DEC-49 REGION is-copy-tool-on */
      if (!tool) return refusal("NO_SAFE_COPY", "No tool of kind cdr is on.", { captureSha: h.sha });
      /* END DEC-49 REGION is-copy-tool-on */
      const row = this.#one(`SELECT * FROM fs_copies WHERE capture_sha = ?`, h.sha);
      if (row && ["pending", "done", "withheld"].includes(row.state)) return { ok: true, captureSha: h.sha, state: row.state };
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", localize("file-safety.index.your_teams_civicsmith_has_no_5", "Your team's Civicsmith has no file scanner installed, so no tool can be asked."), { captureSha: h.sha });
      const got = await this.#bounded(`copy:${h.sha}`, () => this.#makeCopy(h.sha, tool));
      return { ok: true, captureSha: h.sha, state: got.late ? "pending" : got.value };
    } catch { return refusal("SAFE_COPY_FAILED", "The safe copy could not be asked for.", { captureSha: captureSha ?? null }); }
  }

  /** R33: the safe copy and its bytes (the description in `x-file-safety`), or why not. It opens for a high file without
   *  a deeper check and stays available under a scan hold: it is the derived document, never the original. */
  async safeCopy({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer, { serves: true });
      if (h.refused) return h.refused;
      const sha = h.sha;
      const row = this.#one(`SELECT * FROM fs_copies WHERE capture_sha = ?`, sha);
      if (!row && !this.#onTools("cdr").length) return refusal("NO_SAFE_COPY", "No tool of kind cdr is on.", { captureSha: sha });
      /* DEC-49 REGION is-copy-made */
      if (!row || row.state === "queued" || row.state === "pending") return refusal("SAFE_COPY_PENDING", "The safe copy is not made yet.", { captureSha: sha });
      if (row.state === "failed") return refusal("SAFE_COPY_FAILED", "The tool did not rebuild the file.", { captureSha: sha, tool_reason: row.reason, tool_detail: row.detail });
      /* END DEC-49 REGION is-copy-made */
      /* DEC-49 REGION is-copy-clean */
      if (row.state !== "done") return refusal("SAFE_COPY_WITHHELD", "The copy's ClamAV note is not clean.", { captureSha: sha, note_id: row.note_id });
      /* END DEC-49 REGION is-copy-clean */
      const bucket = this.#bucket();
      const bytes = bucket ? await FileSafety.#bytesOf(await bucket.get(derivedKey(this.store, row.copy_sha))) : null;
      if (!bytes) return refusal("SAFE_COPY_PENDING", "The safe copy's bytes are not held.", { captureSha: sha });
      const tool = this.#toolRow(row.tool_id);
      const description = { kind: "copy", derived: true, of: sha, sha256: row.copy_sha, content_type: row.content_type,
                            removed: parse(row.removed, []), tool: tool ? tool.provider_id : row.tool_id, original: await this.#stateOf(sha) };
      return new Response(bytes, { status: 200, headers: { "content-type": row.content_type || "application/octet-stream",
        "x-derived-sha256": row.copy_sha, "x-of": sha, "x-file-safety": JSON.stringify(description) } });
    } catch { return refusal("SAFE_COPY_FAILED", "The safe copy could not be read.", { captureSha: captureSha ?? null }); }
  }

  /* ===== web reputation (R34) and log forwarding (R35) ===== */

  /** R34: the tool spec of the first `on` reputation tool, with its credentials, for the control plane to hand to
   *  `acquisition`; null when there is none. An in-plane call, reached by no route and answered to no viewer. */
  async reputationTool() {
    try {
      const tool = this.#onTools("url_reputation")[0];
      return tool ? await this.#spec(tool) : null;
    } catch { return null; }
  }

  /* R35 (T37): the period the scheduler's wake forwards: from the end of the last period forwarded with `ok` (never more
     than a day back; at the first, the previous whole UTC hour's start) to the current whole UTC hour's start. */
  #ownPeriod() {
    const to = Math.floor(this.now() / HOUR) * HOUR;
    const kept = this.#kept("forward");
    const end = kept && Number.isFinite(kept.end) ? kept.end : to - HOUR;
    return { from: Math.max(end, to - 24 * HOUR), to };
  }

  /** R35: one counts record for the period, keys exactly LOG_COUNT_KINDS (a figure that could not be read is absent,
   *  never zero), sent to every `on` log tool. With neither `from` nor `to` (the scheduler's wake) the period is this
   *  module's own, its end kept once answered `ok`, and an empty period answers `record: null`, so none is sent twice. */
  async forwardSecurityCounts({ from = null, to = null } = {}) {
    try {
      const own = (from === null || from === undefined) && (to === null || to === undefined);
      const period = own ? this.#ownPeriod() : null;
      if (period && !(period.from < period.to)) return { ok: true, sent: [], failed: [], record: null };
      const f = period ? period.from : Date.parse(from), t = period ? period.to : Date.parse(to);
      /* DEC-49 REGION is-forward-period */
      if (!Number.isFinite(f) || !Number.isFinite(t) || !(f < t)) return refusal("FORWARD_PERIOD_INVALID", "from and to are instants, from before to. Nothing was sent.");
      /* END DEC-49 REGION is-forward-period */
      const counts = {};
      try {
        const own = Object.fromEntries(FILE_SAFETY_COUNT_KINDS.map((k) => [k, 0]));
        for (const r of this.#rows(`SELECT kind, SUM(n) AS n FROM fs_counts WHERE hour >= ? AND hour < ? GROUP BY kind`,
                                   Math.ceil(f / 3_600_000), Math.ceil(t / 3_600_000)))
          if (r.kind in own) own[r.kind] = Number(r.n);
        Object.assign(counts, own);
      } catch { /* absent, never zero */ }
      try {
        const c = this.credentials.securityTotals({ from: iso(f), to: iso(t) });
        if (c && c.ok === true && c.counts) for (const k of CREDENTIAL_COUNT_KINDS) if (Number.isSafeInteger(c.counts[k])) counts[k] = c.counts[k];
      } catch { /* absent, never zero */ }
      const record = { period: { from: iso(f), to: iso(t) }, counts: Object.fromEntries(LOG_COUNT_KINDS.filter((k) => k in counts).map((k) => [k, counts[k]])) };
      const sent = [], failed = [];
      for (const tool of this.#onTools("log_sink")) {
        const spec = await this.#spec(tool);
        if (!spec) { failed.push({ tool_id: tool.tool_id, code: "CREDENTIALS_UNAVAILABLE" }); continue; }
        const r = await this.#scanner("/provider/forward", { tool: spec, record });
        if (r.body && r.body.ok === true) sent.push(tool.tool_id);
        else failed.push({ tool_id: tool.tool_id, code: r.absent ? "SCANNER_ABSENT" : r.unreachable ? "SCANNER_UNREACHABLE" : (r.body && r.body.code) || "SERVICE_UNREACHABLE" });
      }
      if (own) this.#keep("forward", { end: t });
      return { ok: true, sent, failed, record };
    } catch { return refusal("FORWARD_PERIOD_INVALID", "The counts could not be built. Nothing was sent."); }
  }

  /** R41: each `on` reputation tool's local list refreshed through `file-scanner` R26, its spec and credentials read for
   *  that call only; a tool with no local list is skipped until it is tested again (R29). An in-plane call reached by
   *  no route. Writes no note and names no file, address or member (R23); never throws. */
  async refreshReputationLists({ at = null } = {}) {
    try {
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", localize("file-safety.index.your_teams_civicsmith_has_no_6", "Your team's Civicsmith has no file scanner installed, so no list was refreshed."));
      const when = Number.isFinite(msOf(at)) ? msOf(at) : this.now();
      const refreshed = [], failed = [], skipped = [];
      for (const tool of this.#onTools("url_reputation")) {
        const key = `reputation:${tool.tool_id}`, kept = this.#kept(key) || {};
        if (kept.no_local_list) { skipped.push(tool.tool_id); continue; }
        const spec = await this.#spec(tool);
        if (!spec) { failed.push({ tool_id: tool.tool_id, code: "CREDENTIALS_UNAVAILABLE" }); this.#keep(key, { ...kept, tried: when }); continue; }
        const r = await this.#scanner("/provider/refresh", { tool: spec });
        const b = r.body || null;
        if (b && b.ok === true) {
          refreshed.push({ tool_id: tool.tool_id, list_version: b.list_version ?? null, fetched_at: b.fetched_at ?? null });
          this.#keep(key, { ok_at: when, tried: when });
        } else if (b && b.code === "NO_LOCAL_LIST") {
          skipped.push(tool.tool_id);
          this.#keep(key, { ...kept, no_local_list: true });
        } else {
          failed.push({ tool_id: tool.tool_id, code: r.unreachable ? "SCANNER_UNREACHABLE" : (b && (b.code || b.error)) || "SERVICE_UNREACHABLE" });
          this.#keep(key, { ...kept, tried: when });
        }
      }
      return { ok: true, refreshed, failed, skipped };
    } catch { return { ok: true, refreshed: [], failed: [], skipped: [] }; }
  }

  /* ===== its cadences (R39): each batch's due and wake, from its own kept instants; each writes nothing ===== */

  /* The batch's answer, remembered for R40's "sooner than its last answer". */
  #answer(batch, at) { this.#answered.set(batch, at); return at; }

  /** R39: scanBatch's instant. Null with no scanner bound or no file held; `now` while the last batch left files; else
   *  the earliest a file falls due (R4), a file already due at the last batch (sent and not resolved, or the batch
   *  refused) no sooner than a poll after it, so none is retried at every wake. */
  scanWake(now) {
    try {
      const n = msOf(now);
      if (!Number.isFinite(n) || !this.#scannerBinding()) return this.#answer("scan", null);
      const kept = this.#kept("scan");
      if (kept && Number(kept.remaining) > 0) return this.#answer("scan", n);
      const due = this.#due(Infinity);
      if (!due.length) return this.#answer("scan", null);
      const lastRun = kept && Number.isFinite(kept.last) ? kept.last : null;
      const at = Math.min(...due.map((d) => {
        const since = Number.isFinite(d.since) ? d.since : n;
        return lastRun !== null && since <= lastRun ? Math.max(since, lastRun + FILE_SAFETY_POLL_MS) : since;
      }));
      return this.#answer("scan", Math.max(n, at));
    } catch { return null; }
  }

  /** R39: renderBatch's instant. Null with no renderer bound (the scanner binding, as renderBatch refuses
   *  RENDERER_ABSENT) or while no file's view and no safe copy is queued; else the later of `now` and the last batch
   *  plus FILE_SAFETY_POLL_MS. While the queue cannot be read (R43: the last batch found it so, or this read fails), the
   *  last batch plus FILE_SAFETY_POLL_MS, as deeperWake's, so the files waiting are read again on the next round. */
  renderWake(now) {
    const n = msOf(now);
    if (!Number.isFinite(n) || !this.#scannerBinding()) return this.#answer("render", null);
    const kept = this.#kept("render");
    const poll = kept && Number.isFinite(kept.last) ? Math.max(n, kept.last + FILE_SAFETY_POLL_MS) : n;
    try {
      if (kept && kept.unreadable) return this.#answer("render", poll);
      /* R39 (K4900): one render a tick, so while the last batch left a view or safe copy queued the next tick is now, as scanWake's; a render in flight holds it (R55) */
      if (kept && Number(kept.left) > 0 && !this.#one(`SELECT 1 AS x FROM fs_files WHERE render_state = 'rendering' LIMIT 1`)) return this.#answer("render", n);
      /* G136b: a view queued again after a transient failure is due at the end of its back-off */
      const views = this.#one(`SELECT MIN(COALESCE(render_wait_at, '')) AS t FROM fs_files WHERE render_state = 'queued'`);
      const copies = this.#one(`SELECT 1 AS x FROM fs_copies WHERE state = 'queued' LIMIT 1`);
      /* R39 (G171): a view queued with no back-off is due now, so one queued after the last batch is drawn at the next wake, not a poll later */
      if (views && views.t === "") return this.#answer("render", n);
      if (views && views.t !== null && !copies) {
        const t = views.t === "" ? NaN : Date.parse(views.t);
        return this.#answer("render", Number.isFinite(t) ? Math.max(poll, t) : poll);
      }
      if (!(views && views.t !== null) && !copies) {
        /* R51: views waiting for their bytes are looked at again at the earliest of their instants */
        const w = this.#one(`SELECT MIN(render_wait_at) AS t FROM fs_files WHERE render_state = 'waiting'`);
        const t = w && w.t ? Date.parse(w.t) : NaN;
        const waiting = Number.isFinite(t) ? Math.max(poll, t) : w && w.t === null && this.#one(`SELECT 1 AS x FROM fs_files WHERE render_state = 'waiting' LIMIT 1`) ? poll : null;
        /* R55: a render marked in flight is looked at again when its mark would be stale, so a firing that stopped leaves no file behind */
        const f = this.#one(`SELECT MIN(render_started_at) AS t FROM fs_files WHERE render_state = 'rendering'`);
        const ft = f && f.t ? Date.parse(f.t) + RENDER_INFLIGHT_STALE_MS : NaN;
        const inflight = Number.isFinite(ft) ? Math.max(poll, ft) : null;
        return this.#answer("render", waiting === null ? inflight : inflight === null ? waiting : Math.min(waiting, inflight));
      }
      return this.#answer("render", poll);
    } catch { return this.#answer("render", poll); }
  }

  /** R39: deeperBatch's instant. Null while no check is queued or running; else the earliest of the last batch plus
   *  FILE_SAFETY_POLL_MS for a queued check and each running sandbox's next poll, never before `now`; while the checks
   *  cannot be read, the last batch plus FILE_SAFETY_POLL_MS. */
  deeperWake(now) {
    const n = msOf(now);
    if (!Number.isFinite(n)) return this.#answer("deeper", null);
    const kept = this.#kept("deeper");
    const poll = kept && Number.isFinite(kept.last) ? kept.last + FILE_SAFETY_POLL_MS : n;
    try {
      if (kept && kept.unreadable) return this.#answer("deeper", Math.max(n, poll));
      const rows = this.#rows(`SELECT state, pending FROM fs_deeper WHERE state IN ('queued', 'running')`);
      if (!rows.length) return this.#answer("deeper", null);
      const instants = [];
      for (const r of rows) {
        if (r.state === "queued") { instants.push(poll); continue; }
        const pending = JSON.parse(r.pending);
        if (!Array.isArray(pending) || !pending.length) { instants.push(poll); continue; }
        for (const p of pending) instants.push(Number.isFinite(Number(p.next_at)) ? Number(p.next_at) : poll);
      }
      return this.#answer("deeper", Math.max(n, Math.min(...instants)));
    } catch { return this.#answer("deeper", Math.max(n, poll)); }
  }

  /** R39: forwardSecurityCounts' instant. Null while no log tool is on; else the start of the first whole UTC hour after
   *  the end of the last period forwarded with `ok` (at the first, the current hour's start). */
  forwardWake(now) {
    try {
      const n = msOf(now);
      if (!Number.isFinite(n) || !this.#onTools("log_sink").length) return this.#answer("forward", null);
      const kept = this.#kept("forward");
      if (!kept || !Number.isFinite(kept.end)) return this.#answer("forward", Math.floor(n / HOUR) * HOUR);
      return this.#answer("forward", Math.floor(kept.end / HOUR) * HOUR + HOUR);
    } catch { return null; }
  }

  /** R39: refreshReputationLists' instant. Null while no reputation tool with a local list is on; else, for each, its
   *  last refresh that answered ok plus REPUTATION_REFRESH_MS, or `now` when none has (a tool whose last try failed no
   *  sooner than a poll after that try), the earliest. */
  reputationWake(now) {
    try {
      const n = msOf(now);
      if (!Number.isFinite(n)) return this.#answer("reputation", null);
      const instants = [];
      for (const tool of this.#onTools("url_reputation")) {
        const kept = this.#kept(`reputation:${tool.tool_id}`) || {};
        if (kept.no_local_list) continue;
        let at = Number.isFinite(kept.ok_at) ? kept.ok_at + REPUTATION_REFRESH_MS : n;
        if (Number.isFinite(kept.tried) && kept.tried !== kept.ok_at) at = Math.max(at, kept.tried + FILE_SAFETY_POLL_MS);
        instants.push(at);
      }
      return this.#answer("reputation", instants.length ? Math.max(n, Math.min(...instants)) : null);
    } catch { return null; }
  }
}

/* K61: the one FileSafety of a Durable Object's storage, made on first use; its first construction registers the receipt
   listener (R1). The providers (a test's own) and `env` are read on the first call only. */
const OF = new WeakMap();
export function fileSafetyOf(ctx, { record = null, membership = null, credentials = null, provenance = null, acquisition = null,
                                    env = null, store = "bio", now = null, scanWaitMs = SCAN_WAIT_MS, callBoundMs = SCANNER_CALL_BOUND_MS,
                                    registerJob = null, ledger = null } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let fs = OF.get(storage);
  if (fs) return fs;
  const rec = record || recordOf(ctx);
  const mem = membership || membershipOf(ctx, { record: rec });
  const cred = credentials || credentialsOf(ctx, { record: rec, membership: mem });
  const prov = provenance || provenanceOf(ctx, { record: rec, membership: mem });
  const acq = acquisition || acquisitionOf(ctx, { record: rec, provenance: prov, membership: mem });
  fs = new FileSafety({ sql: storage.sql, record: rec, membership: mem, credentials: cred, provenance: prov, acquisition: acq,
                        env, store, now, scanWaitMs, callBoundMs, registerJob, ledger });
  OF.set(storage, fs);
  fs.start();
  return fs;
}

/** The route map. The viewer and `by` are the control plane's stamps in the query, never the body's. The byte answers
 *  (`openoriginal`, `openwithwarning`, `safeview`, `safecopy`) are Responses; every other op answers an object.
 *  `reputationTool` and the listener are reached by no route. */
export function fileSafetyOps(fs, url, body, env) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const viewer = () => (url.searchParams.has("viewer") ? q("viewer") : "");
  const sha = () => q("capture") ?? b.captureSha ?? null;
  return {
    verdictnotes: () => fs.verdictNotes({ captureSha: sha(), viewer: viewer() }),
    threatof: () => fs.threatOf({ captureSha: sha(), viewer: viewer() }),
    originalstate: () => fs.originalState({ captureSha: sha(), viewer: viewer() }),
    openoriginal: () => fs.openOriginal({ captureSha: sha(), viewer: viewer(), override: b.override === true || q("override") === "1" }),
    openwithwarning: () => fs.openOriginal({ captureSha: sha(), viewer: viewer(), warned: b.warned ?? null }),
    safeview: () => fs.safeView({ captureSha: sha(), viewer: viewer(), sheet: q("sheet") ?? b.sheet ?? null, fromRow: q("fromRow") ?? b.fromRow ?? null }),
    safecopyrequest: () => fs.requestSafeCopy({ captureSha: sha(), viewer: viewer() }),
    safecopy: () => fs.safeCopy({ captureSha: sha(), viewer: viewer() }),
    scanbatch: () => fs.scanBatch({ limit: b.limit ?? q("limit") ?? undefined, at: b.at ?? q("at") ?? null }),
    scanstatus: () => fs.scanStatus({ viewer: viewer() }),
    scanmirror: () => fs.scanMirror({ viewer: viewer(), at: b.at ?? q("at") ?? null }),
    renderbatch: () => fs.renderBatch({ limit: b.limit ?? q("limit") ?? undefined }),
    deepercheck: () => fs.requestDeeperCheck({ captureSha: sha(), viewer: viewer() }),
    deeperbatch: () => fs.deeperBatch({ limit: b.limit ?? q("limit") ?? undefined }),
    scanfindings: () => fs.scanFindings({ after: q("after") ?? b.after ?? null, since: q("since") ?? b.since ?? null,
      limit: q("limit") ?? b.limit ?? undefined, viewer: viewer() }),
    releasescanhold: () => fs.releaseScanHold({ captureSha: sha(), by: q("by"), reason: b.reason ?? null }),
    findingkind: () => ({ ok: true, ...findingKind(q("name") ?? b.name ?? null) }),
    securitytoolcatalogue: () => fs.securityToolCatalogue({ viewer: viewer() }),
    securitytools: () => fs.securityTools({ viewer: viewer() }),
    securitytooladd: () => fs.securityToolAdd({ providerId: b.providerId ?? null, template: b.template ?? null, config: b.config ?? null,
      credentials: b.credentials ?? null, handlingDigest: b.handlingDigest ?? null, confirmRetention: b.confirmRetention === true,
      use: b.use ?? "on_request", monthlyLimit: b.monthlyLimit, by: q("by") }),
    securitytooltest: () => fs.securityToolTest({ toolId: b.toolId ?? q("tool"), by: q("by") }),
    securitytoolremove: () => fs.securityToolRemove({ toolId: b.toolId ?? q("tool"), by: q("by") }),
    securitytoolevents: () => fs.securityToolEvents({ after: q("after"), limit: q("limit") ?? undefined, viewer: viewer() }),
    securityforward: () => fs.forwardSecurityCounts({ from: b.from ?? q("from"), to: b.to ?? q("to") }),
  };
}

/* R48 (T51; K4168, K4202; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their
   owner beside the ops map: each row's classes, weight and description are the op's existing rows' (op-declarations, op-grades),
   its fields are what the arm reads from `url` and `body` (the stamps `viewer` and `by` are the control plane's). `capture` is the
   address's name for the digest and `captureSha` the body's (the arm reads either). */
export const DECLARED_OPS = Object.freeze({
  deepercheck: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "observational", description: localize("file-safety.declared.deepercheck", "file-directed: keyed by a capture's digest; asks the group's outside tools about this file; records no one"),
    fields: { accepts: ["capture","captureSha"], requires: [["capture","captureSha"]] } },
  openoriginal: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "observational", description: localize("file-safety.declared.openoriginal", "file-directed: keyed by a capture's digest, reached from the safe view's one click; answers the original's bytes to a member who may see it, a high-risk file only after a fresh clean deeper check (`override`); records no one"),
    fields: { accepts: ["capture","captureSha","override"], requires: [["capture","captureSha"]] } },
  openwithwarning: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "observational", description: localize("file-safety.declared.openwithwarning", "file-directed: keyed by a capture's digest, reached from the warning before opening; answers a high-risk original after the member's two confirmations, never under a scan hold; records no one and keeps no confirmation"),
    fields: { accepts: ["capture","captureSha","warned"], requires: [["capture","captureSha"]] } },
  releasescanhold: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "reasoned", description: localize("file-safety.declared.releasescanhold", "file-directed: keyed by a capture's digest under a scan hold, reached from the held file; one member's reasoned act of two, never a machine's; moves no bundle"),
    fields: { accepts: ["capture","captureSha","reason"], requires: [["capture","captureSha"],"reason"] } },
  safeview: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("file-safety.declared.safeview", "read: a file's safe view, a derived copy so labeled, with what opening the original would answer; writes nothing"),
    fields: { accepts: ["capture","captureSha","sheet","fromRow"], requires: [["capture","captureSha"]] } },
  scanmirror: { classes: ["admin","member"], machineClasses: [], mutating: true, stamps: ["viewer"], needs: null, weight: "substrate", description: localize("file-safety.declared.scanmirror", "setting: the group's file scanner, an administrator's act; asks it to check for new signatures now and answers at once; moves no bundle"),
    fields: { accepts: ["at"], requires: [] } },
  securitytooladd: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "credential", description: localize("file-safety.declared.securitytooladd", "setting: the group's security tools, an administrator's act; moves no bundle"),
    fields: { accepts: ["providerId","template","config","credentials","handlingDigest","confirmRetention","use","monthlyLimit"], requires: ["providerId","handlingDigest"] } },
  securitytoolremove: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "credential", description: localize("file-safety.declared.securitytoolremove", "setting: the group's security tools, an administrator's act; moves no bundle"),
    fields: { accepts: ["toolId","tool"], requires: [["toolId","tool"]] } },
  securitytooltest: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "substrate", description: localize("file-safety.declared.securitytooltest", "setting: the group's security tools, an administrator's act; moves no bundle"),
    fields: { accepts: ["toolId","tool"], requires: [["toolId","tool"]] } },
});
