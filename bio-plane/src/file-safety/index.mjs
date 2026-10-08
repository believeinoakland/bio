/* file-safety — keeps every captured file safe to open without touching its bytes, digest or grade (layer 3, directly
 * after `capture`; Bob's K1913, K1928, K1929, K1939, K1949 with DEC-168, DEC-169 and DEC-173, packaged by BOB, K2008,
 * K2063; new at T36, T36-11). Requirements: `build/requirements/file-safety.md` (R1–R38).
 *
 * WHAT IT HOLDS. Verdict notes beside each capture naming tool, engine and version (R2, R3); the scan and render queue
 * (R1, R4, R12); scan holds and their release by two members or a second, different engine (R15–R19); deeper checks
 * (R13, R14, R36); safe views and safe copies, each a derived file stored under its own digest outside `captures/`,
 * never registered, graded or cited (R11, R12, R33, R37); the group's security tools with their stated handling (R27–
 * R32); and this module's counts by hour, forwarded with `credentials`' to the group's log tools (R35). It keeps no
 * record of who opened, viewed, copied or asked about which file (R10; K1892): no row, note, counter or log line names
 * a member beside a file but the release of a hold, which is an act of record (R17).
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
import { membershipOf, viewerPredicate, notAnAdmin } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { acquisitionOf } from "../acquisition/index.mjs";
import { captureObjectOp } from "../capture/ops.mjs";
import { SCAN_BATCH_MAX, LOG_COUNT_KINDS } from "../../../file-scanner/src/limits.mjs";
import { PROVIDERS, REFUSED_PROVIDERS, HELD_PROVIDERS, providerById, resolveDescriptor, differentEngine }
  from "../../../file-scanner/src/providers/catalogue.mjs";
import { FILE_SAFETY_SCHEMA, FILE_SAFETY_TABLES } from "./schema.mjs";
import { FILE_SAFETY_CHECKS, THREAT_REASONS, PROVIDER_REASON_WORDS } from "./checks.mjs";
import { formatOf, readActive, sheetsOf, structureFlags, safeViewRoute, ACTIVE_FORMATS, PLAIN_FORMATS } from "./formats.mjs";
export { FILE_SAFETY_CHECKS, THREAT_REASONS, PROVIDER_REASON_WORDS } from "./checks.mjs";
export { FINDING_KINDS, NO_PLAIN_DESCRIPTION, findingKind } from "./kinds.mjs";
export { FILE_SAFETY_TABLES } from "./schema.mjs";
import { findingKind } from "./kinds.mjs";

export const FILE_SAFETY_MODULE = "file-safety";

/* R21: the constants, by name. `SCAN_BATCH_MAX` and `LOG_COUNT_KINDS` are `file-scanner`'s (its R16). */
export const RESCAN_INTERVAL_MS = 604_800_000;
export const DEEPER_CHECK_FRESH_MS = 86_400_000;
export const DEEPER_CHECKS_PER_MONTH = 900;
export { SCAN_BATCH_MAX, LOG_COUNT_KINDS };

/* R5: a file due for more than a day is overdue. R8: the scan before first opening waits this long within the call
   before it answers `SCAN_PENDING` (the Suggestions' "a few seconds"); the scan goes on and writes its note. */
export const OVERDUE_MS = 86_400_000;
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
/* R6: the routes by which this copy fetched a file itself (direct, Drive and render all record `direct`; a web
   archive `archive.org`; a capture request's fetch `capture-request`). A doorbell's file was handed in. */
export const FETCHED_VIAS = Object.freeze(["direct", "archive.org", "capture-request"]);
const UNPACKED = "unpacked";
/* R32: the use a tool is put to, and the recipient a routine tool must have (its own servers). */
export const TOOL_USES = Object.freeze(["on_request", "routine"]);
/* The catalogue states that recipient in words ("the organization's own MetaDefender Core server", "Microsoft (the
   organization's own Azure storage account)"), so the rule reads them: the organization itself, or another's service
   run inside the organization's own account. A service the vendor runs, or one of two places, is not its own servers. */
export const onOwnServers = (recipient) => typeof recipient === "string"
  && (/^the organization\b/i.test(recipient.trim()) || /^[^,(]+\(the organization's own [^)]+\)$/i.test(recipient.trim()));
/* R11, R12, R33: where a derived file is kept, under its own digest and outside `captures/`. */
export const derivedKey = (store, sha) => `${store}/derived/${sha}`;

const HEX64 = /^[0-9a-f]{64}$/;
const LIST = Object.freeze({ default: 200, max: 1000 });
const INTERNAL_VIEWER = `${MACHINE_CLASS_PREFIX}daemon`;
const iso = (ms) => new Date(ms).toISOString();
const second = (ms) => iso(ms).replace(/\.\d+Z$/, "Z");
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const parse = (s, fallback) => { try { return s == null ? fallback : JSON.parse(s); } catch { return fallback; } };
const shaOf = (x) => (typeof x === "string" ? x.trim().toLowerCase().replace(/^sha:/, "") : "");
const clamp = (n, d, max) => { const v = Math.floor(Number(n)); return Number.isFinite(v) && v >= 1 ? Math.min(v, max) : d; };
const memberOf = (x) => (typeof x !== "string" || x === "" ? null : x.startsWith("member:") ? (x.slice(7) || null) : x);
const monthOf = (ms) => iso(ms).slice(0, 7);

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
                scanWaitMs = SCAN_WAIT_MS } = {}) {
    this.sql = sql;
    this.record = record;
    this.membership = membership;
    this.credentials = credentials;
    this.provenance = provenance;
    this.acquisition = acquisition;
    this.env = env || {};
    this.store = store === "scratch" ? "scratch" : "bio";
    this.now = typeof now === "function" ? now : () => Date.now();
    this.scanWaitMs = Number.isFinite(scanWaitMs) && scanWaitMs >= 0 ? scanWaitMs : SCAN_WAIT_MS;
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
    for (const t of FILE_SAFETY_SCHEMA.replace(/--.*$/gm, "").split(";")) if (t.trim()) this.sql.exec(t);
    if (!this.#declared && this.record && typeof this.record.declareTable === "function") {
      const r = this.record.declareTable(FILE_SAFETY_MODULE, FILE_SAFETY_TABLES.map((d) => ({ ...d })));
      this.#declared = r && r.ok === true;
    }
    return { ok: true };
  }
  #declared = false;

  /* R1: every receipt puts its capture in the scan queue and the render queue (R12 renders only a file with a
     safe-view route); a receipt carrying a reputation answer adds a `reputation` note (R34); a routine safe-copy tool
     queues its copy (R32). It runs inside the receipt's own transaction and never refuses, delays or fails it. */
  #onReceipt(event) {
    try {
      const sha = shaOf(event && event.capture_sha);
      if (!HEX64.test(sha)) return { ok: true, queued: false };
      const at = second(this.now());
      this.sql.exec(`INSERT OR IGNORE INTO fs_files (capture_sha, queued_at, render_state) VALUES (?, ?, 'queued')`, sha, at);
      if (this.#routineTools("cdr").length)
        this.sql.exec(`INSERT OR IGNORE INTO fs_copies (capture_sha, state, queued_at) VALUES (?, 'queued', ?)`, sha, at);
      const rep = event.reputation;
      if (rep && typeof rep === "object" && typeof rep.listed === "boolean") {
        this.#writeNote(sha, { kind: "reputation", tool: String(rep.tool ?? "reputation"), engine: String(rep.tool ?? "reputation"),
          engine_version: "not reported", signatures: null, scanned_at: typeof rep.checked_at === "string" ? rep.checked_at : at,
          result: rep.listed ? "listed" : "not_listed", findings: Array.isArray(rep.categories) ? rep.categories.map(String) : [] });
        if (rep.listed) this.#count("reputation_listed");
      }
      this.#stampHome(sha);
      return { ok: true, queued: true };
    } catch {
      return { ok: true, queued: false };
    }
  }

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

  /* R2 and every service naming a capture (K2098): `NO_SUCH_CAPTURE` for a digest the record holds nothing under, and the
     same answer, byte for byte, for a capture whose home the viewer may not see (membership R43), so no answer tells a
     hidden capture from one never held (DEC-36); else null. A viewer left out is an in-plane caller, which sees every
     capture. */
  #held(captureSha, viewer) {
    const sha = shaOf(captureSha);
    /* DEC-49 REGION is-capture-held */
    if (!HEX64.test(sha)) return { sha, refused: refusal("NO_SUCH_CAPTURE", "captureSha names a capture by its SHA-256, 64 hex.", { captureSha: captureSha ?? null }) };
    const absent = () => ({ sha, refused: refusal("NO_SUCH_CAPTURE", "No capture this viewer may see is held under this digest. Nothing was read.", { captureSha: sha }) });
    const home = this.#home(sha);
    const known = !!home || !!this.#one(`SELECT 1 AS x FROM fs_files WHERE capture_sha = ?`, sha) || this.#receiptsOf(sha).length > 0;
    if (!known) return absent();
    if (viewer !== undefined) {
      const gate = viewerPredicate(viewer);
      if (gate.scope === "DENY") return absent();
      if (home && gate.scope !== "member" && !this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id = ? AND (${gate.sql})`, home, ...gate.args))
        return absent();
    }
    /* END DEC-49 REGION is-capture-held */
    return { sha, refused: null };
  }

  #bucket() { const b = this.env && this.env.CAPTURES; return b && typeof b.get === "function" ? b : null; }
  #evidence() { try { return this.record.evidenceStore(); } catch { return null; } }
  #parts(sha) {
    const home = this.#home(sha);
    if (!home) return null;
    try {
      const p = this.provenance.partsNamed(home, sha);
      return p && p.state === "named" ? p.parts.map((x) => ({ sha256: x.sha256, bytes: x.bytes })) : null;
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
  /* The capture's bytes, whole or reassembled from its parts, for its reader; null when they are not held. */
  async #bytes(sha) {
    const ev = this.#evidence();
    if (!ev) return null;
    try {
      const whole = await FileSafety.#bytesOf(await ev.get(sha));
      if (whole) return whole;
      const parts = this.#parts(sha);
      if (!parts) return null;
      const chunks = [];
      for (const p of parts) { const b = await FileSafety.#bytesOf(await ev.get(p.sha256)); if (!b) return null; chunks.push(b); }
      const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
      let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
      return out;
    } catch { return null; }
  }

  /* ===== the scanner (R23: only the store, the target, a tool spec and a counts record are sent) ===== */

  #scannerBinding() { const s = this.env && this.env.FILE_SCANNER; return s && typeof s.fetch === "function" ? s : null; }
  /* `{status, body}` with the body parsed, `{status, bytes, headers}` for a file, or `{unreachable: true}`. */
  async #scanner(path, body, { method = "POST" } = {}) {
    const s = this.#scannerBinding();
    if (!s) return { absent: true };
    try {
      const res = await s.fetch(new Request(`https://file-scanner${path}`, method === "GET" ? { method }
        : { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
      const type = (res.headers.get("content-type") || "").toLowerCase();
      if (type.includes("application/json")) return { status: res.status, body: await res.json().catch(() => null), headers: res.headers };
      return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), headers: res.headers };
    } catch {
      return { unreachable: true };
    }
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
    } catch { return refusal("NO_SUCH_CAPTURE", "The notes could not be read. Nothing was read.", { captureSha: captureSha ?? null }); }
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

  /** R15: every `found` note in order, for the notices of a finding; no member is named. */
  scanFindings({ after = null, limit = LIST.default, viewer = undefined } = {}) {
    try {
      const lim = clamp(limit, LIST.default, LIST.max);
      const from = Number.isFinite(Number(after)) && after !== null && after !== "" ? Number(after) : 0;
      const findings = [];
      let last = from, more = false;
      for (const r of this.#rows(`SELECT * FROM fs_notes WHERE result = 'found' AND kind <> 'copy' AND seq > ? ORDER BY seq`, from)) {
        if (findings.length >= lim) { more = true; break; }
        last = r.seq;
        if (viewer !== undefined && this.#held(r.capture_sha, viewer).refused) continue;
        findings.push({ captureSha: r.capture_sha, note_id: r.note_id, tool: r.tool, engine: r.engine, findings: parse(r.findings, []), at: r.scanned_at });
      }
      return { ok: true, findings, cursor: last > from ? String(last) : (after ?? null), truncated: more };
    } catch { return { ok: true, findings: [], cursor: after ?? null, truncated: false }; }
  }

  /** R17: an act of record. The first member's act answers `pending_second`; a second, different member's releases. */
  releaseScanHold({ captureSha = null, by = null, reason = null } = {}) {
    try {
      /* DEC-49 REGION is-release-by-member */
      if (typeof by !== "string" || !by.trim() || isMachineIdentity(by) || by.startsWith(MACHINE_CLASS_PREFIX) || !memberOf(by))
        return refusal("MACHINE_CANNOT_RELEASE", "A scan hold is released by members only; this act names none. Nothing was released.", { by: by ?? null });
      /* END DEC-49 REGION is-release-by-member */
      /* DEC-49 REGION is-release-reason */
      if (typeof reason !== "string" || !reason.trim() || reason.length > RELEASE_REASON_MAX)
        return refusal("NO_REASON", `A release's reason is 1 to ${RELEASE_REASON_MAX} characters. Nothing was released.`);
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

  /* R6's source condition: some receipt is a fetch by this copy, or the file was cut from an archive whose own source
     condition holds (K1949: one such receipt suffices). `path` is the archives already walked, so a chain that meets
     a digest twice, or runs past `ARCHIVE_DEPTH_MAX` levels, ends not fetched. */
  #sourceOf(sha, path = []) {
    const rows = this.#receiptsOf(sha);
    const routes = [...new Set(rows.map((r) => r.via || "direct"))].sort();
    if (rows.some((r) => FETCHED_VIAS.includes(r.via || "direct"))) return { fetched: true, routes, archive: null };
    for (const r of rows.filter((x) => x.via === UNPACKED)) {
      const m = /^zip:([0-9a-f]{64})!(\d+)$/.exec(r.retrieval_locator || "");
      if (!m || path.includes(m[1]) || path.length >= 3) continue;
      if (this.#sourceOf(m[1], [...path, sha]).fetched) return { fetched: true, routes, archive: m[1] };
    }
    const first = rows.find((x) => x.via === UNPACKED);
    const m = first ? /^zip:([0-9a-f]{64})!/.exec(first.retrieval_locator || "") : null;
    return { fetched: false, routes, archive: m ? m[1] : null };
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
    const source = this.#sourceOf(sha);
    if (!source.fetched) add("source_not_fetched");
    const bytes = await this.#bytes(sha);
    const format = bytes ? formatOf(bytes) : "unknown";
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
      const read = await readActive(format, bytes);
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
    const hold = this.#holdOf(sha);
    if (hold) add("scan_hold");
    const listed = this.#one(`SELECT 1 AS x FROM fs_notes WHERE capture_sha = ? AND kind = 'reputation' AND result = 'listed' LIMIT 1`, sha);
    if (listed) add("bad_reputation");
    const latest = (kind) => { const r = this.#one(`SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = ? ORDER BY seq DESC LIMIT 1`, sha, kind); return r ? FileSafety.#note(r) : null; };
    const view = this.#one(`SELECT * FROM fs_files WHERE capture_sha = ?`, sha);
    const copy = this.#one(`SELECT * FROM fs_copies WHERE capture_sha = ?`, sha);
    const g = { threat: reasons.length ? "high" : "low", reasons, source, format, active, scan_hold: hold,
                latest_scan: latest("scan"), latest_deeper: latest("deeper"),
                safe_view: view ? { state: view.render_state, route: view.render_route, sha256: view.render_sha } : null,
                safe_copy: copy ? { state: copy.state, sha256: copy.copy_sha } : null, archive };
    cache.set(sha, g);
    return g;
  }

  /** R6: the threat grade, computed at the call. */
  async threatOf({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      return { ok: true, captureSha: h.sha, ...(await this.#grade(h.sha, [], new Map())) };
    } catch { return refusal("NO_SUCH_CAPTURE", "The grade could not be computed. Nothing was read.", { captureSha: captureSha ?? null }); }
  }

  /* ===== opening the original (R8, R9; DEC-173) ===== */

  /* The scan before first opening, on demand: the verdict within `scanWaitMs`, or `pending` (the scan goes on and writes
     its note when it ends). */
  async #scanBeforeOpening(sha) {
    if (!this.#scannerBinding()) return { absent: true };
    const run = this.#clamav(sha).then((r) => {
      if (r.verdict) r.noteId = this.#writeNote(sha, { kind: "scan", ...r.verdict });
      return r;
    });
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
  async #decide(sha, { override = false, warned = undefined, run = true } = {}) {
    /* DEC-49 REGION is-under-scan-hold */
    if (this.#openHolds(sha).length) return { refuse: "SCAN_HOLD" };
    /* END DEC-49 REGION is-under-scan-hold */
    const g = await this.#grade(sha, [], new Map());
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
      WARNING_NOT_CONFIRMED: "warned must be exactly {own_device: true, no_macros: true}. Nothing was served.",
      SAFE_VIEW_ONLY: "The file is high risk and neither a fresh deeper check nor the warned path opens it. Nothing was served.",
    }[d.refuse];
    return refusal(d.refuse, detail, d.reason ? { not_scanned: d.reason } : {});
  }

  /* The capture's bytes exactly as `capture`'s R21 get serves them (`x-capture-sha256` equal to the digest). */
  async #serveOriginal(sha, stated) {
    const ev = this.#evidence();
    if (!ev) return json(refusal("NO_SUCH_CAPTURE", "Your group's Civicsmith holds no evidence store, so no bytes can be served.", { captureSha: sha }), 404);
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
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      const d = await this.#decide(h.sha, { override, warned, run: true });
      if (d.refuse) return FileSafety.#refusalFor(d);
      return await this.#serveOriginal(h.sha, d.stated || null);
    } catch { return refusal("NOT_SCANNED", "The original could not be opened. Nothing was served.", { captureSha: captureSha ?? null }); }
  }

  /** R9: what R8 would answer now, without opening, scanning or serving anything. */
  async originalState({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      return { ok: true, captureSha: h.sha, ...(await this.#stateOf(h.sha)) };
    } catch { return { ok: true, captureSha: shaOf(captureSha) || null, may_open: false, path: null, why: "NOT_SCANNED" }; }
  }
  async #stateOf(sha) {
    const deeperFirst = this.#freshDeeper(sha) && !this.#openHolds(sha).length;
    const d = await this.#decide(sha, { override: deeperFirst, warned: undefined, run: false });
    if (d.open) return { may_open: true, path: d.open, why: null, ...(d.stated ? { stated: d.stated } : {}) };
    return { may_open: false, path: null, why: d.refuse, ...(d.reason ? { not_scanned: d.reason } : {}) };
  }

  /* ===== the safe view (R11, R12) ===== */

  #ensureQueued(sha) {
    this.sql.exec(`INSERT OR IGNORE INTO fs_files (capture_sha, bundle_id, queued_at, render_state) VALUES (?, ?, ?, 'queued')`,
                  sha, this.#home(sha), second(this.now()));
    return this.#one(`SELECT * FROM fs_files WHERE capture_sha = ?`, sha);
  }

  /** R11: the safe view by route: a rendered PDF of page images (its bytes, the description in `x-file-safety`) or a
   *  spreadsheet's cells as data; a file under a scan hold still gets it (K1892). */
  async safeView({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      const sha = h.sha;
      const bytes = await this.#bytes(sha);
      const format = bytes ? formatOf(bytes) : "unknown";
      const route = safeViewRoute(format);
      /* DEC-49 REGION is-safe-view-route */
      if (!route) return refusal("NO_SAFE_VIEW", "A safe view is made of documents, presentations and spreadsheets only.", { captureSha: sha, format });
      /* END DEC-49 REGION is-safe-view-route */
      const original = await this.#stateOf(sha);
      if (route === "data") {
        const s = await sheetsOf(format, bytes);
        if (!s.ok) return refusal("SAFE_VIEW_FAILED", "The spreadsheet's cells could not be read.", { captureSha: sha, renderer_reason: s.why });
        this.#count("safe_views");
        return { ok: true, kind: "data", derived: true, of: sha, sheets: s.sheets, original };
      }
      if (!this.#scannerBinding()) return refusal("RENDERER_ABSENT", "No safe-view maker is bound beside this copy.", { captureSha: sha });
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
                            source_pages: row.render_source_pages, truncated: row.render_truncated === 1, original };
      return new Response(bytesOut, { status: 200, headers: { "content-type": "application/pdf", "x-derived-sha256": row.render_sha,
        "x-of": sha, "x-file-safety": JSON.stringify(description) } });
    } catch { return refusal("SAFE_VIEW_FAILED", "The safe view could not be read.", { captureSha: captureSha ?? null }); }
  }

  /* R12: one file's render, after its capture: the image-only PDF stored under its own digest outside `captures/`,
     labelled derived and naming its original; never registered, graded or chained. */
  async #render(row) {
    const sha = row.capture_sha;
    const bytes = await this.#bytes(sha);
    if (!bytes) { this.sql.exec(`UPDATE fs_files SET render_state = 'failed', render_reason = 'NOT_FOUND' WHERE capture_sha = ?`, sha); return "failed"; }
    const format = formatOf(bytes), route = safeViewRoute(format);
    if (!route || route === "data") {
      this.sql.exec(`UPDATE fs_files SET render_state = ?, render_route = ? WHERE capture_sha = ?`, route ? "data" : "none", route, sha);
      return route ? "data" : "none";
    }
    const r = await this.#scanner("/render", { store: this.store, target: this.#target(sha), route });
    const bucket = this.#bucket();
    const derived = r.bytes && r.status === 200 ? r.headers.get("x-derived-sha256") : null;
    if (!derived || !HEX64.test(derived) || !bucket) {
      const code = r.unreachable ? "SCANNER_UNREACHABLE" : (r.body && r.body.code) || (!bucket ? "R2_NOT_CONFIGURED" : "RENDER_FAILED");
      this.sql.exec(`UPDATE fs_files SET render_state = 'failed', render_route = ?, render_reason = ?, render_detail = ? WHERE capture_sha = ?`,
                    route, code, r.body && r.body.detail ? String(r.body.detail).slice(0, 300) : null, sha);
      return "failed";
    }
    await bucket.put(derivedKey(this.store, derived), r.bytes, { sha256: derived,
      customMetadata: { derived: "true", of: sha, kind: "safe-view" } });
    this.sql.exec(`UPDATE fs_files SET render_state = 'done', render_route = ?, render_sha = ?, render_pages = ?, render_source_pages = ?,
                   render_truncated = ?, rendered_at = ?, render_reason = NULL WHERE capture_sha = ?`, route, derived,
                  Number(r.headers.get("x-pages")) || 0, Number(r.headers.get("x-source-pages")) || 0,
                  r.headers.get("x-truncated") === "true" ? 1 : 0, iso(this.now()), sha);
    return "rendered";
  }

  /** R12: renders queued files (the scheduler's wake), and makes the safe copies a routine tool queued (R32, R33). */
  async renderBatch({ limit = 20 } = {}) {
    try {
      /* DEC-49 REGION is-renderer-bound */
      if (!this.#scannerBinding()) return refusal("RENDERER_ABSENT", "No safe-view maker is bound beside this copy. Nothing was rendered.");
      /* END DEC-49 REGION is-renderer-bound */
      const lim = clamp(limit, 20, SCAN_BATCH_MAX);
      const out = { rendered: 0, failed: 0, none: 0, data: 0 };
      for (const row of this.#rows(`SELECT * FROM fs_files WHERE render_state = 'queued' ORDER BY queued_at, capture_sha LIMIT ?`, lim))
        out[await this.#render(row)]++;
      const copies = { made: 0, failed: 0 };
      const tool = this.#routineTools("cdr")[0];
      if (tool) for (const c of this.#rows(`SELECT * FROM fs_copies WHERE state = 'queued' ORDER BY queued_at LIMIT ?`, lim)) {
        const r = await this.#makeCopy(c.capture_sha, tool);
        if (r === "done" || r === "withheld") copies.made++; else copies.failed++;
      }
      const remaining = Number(this.#one(`SELECT COUNT(*) AS n FROM fs_files WHERE render_state = 'queued'`).n);
      return { ok: true, ...out, copies, remaining };
    } catch { return refusal("RENDERER_ABSENT", "The render queue could not be read. Nothing was rendered."); }
  }

  /* ===== scanning (R4, R5) ===== */

  /* R4: due files, oldest due first: never scanned by ClamAV, or its newest ClamAV scan older than RESCAN_INTERVAL_MS. */
  #due(at) {
    const rows = this.#rows(`SELECT f.capture_sha, f.queued_at,
        (SELECT MAX(n.scanned_at) FROM fs_notes n WHERE n.capture_sha = f.capture_sha AND n.kind = 'scan' AND n.tool = 'clamav'
           AND n.result <> 'not_scanned') AS last
      FROM fs_files f`);
    return rows.map((r) => ({ sha: r.capture_sha, since: r.last ? Date.parse(r.last) + RESCAN_INTERVAL_MS : Date.parse(r.queued_at) }))
      .filter((r) => !Number.isFinite(r.since) || r.since <= at)
      .sort((a, b) => (a.since - b.since) || (a.sha < b.sha ? -1 : 1));
  }

  /** R4: one batch to ClamAV in one request, a note per verdict; each routine scan tool also scans each due file. */
  async scanBatch({ limit = SCAN_BATCH_MAX, at = null } = {}) {
    try {
      /* DEC-49 REGION is-scanner-bound */
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", "No scanner is bound beside this copy. No note was written.");
      /* END DEC-49 REGION is-scanner-bound */
      const now = Number.isFinite(Date.parse(at)) ? Date.parse(at) : this.now();
      const due = this.#due(now);
      const batch = due.slice(0, clamp(limit, SCAN_BATCH_MAX, SCAN_BATCH_MAX));
      const out = { scanned: 0, found: 0, not_scanned: 0 };
      if (batch.length) {
        const r = await this.#scanner("/scan", { store: this.store, targets: batch.map((d) => this.#target(d.sha)) });
        /* DEC-49 REGION is-scanner-answering */
        if (r.unreachable || !r.body || r.body.ok !== true || !Array.isArray(r.body.verdicts))
          return refusal("SCANNER_UNREACHABLE", "The scanner did not answer the batch. No note was written.",
                         { scanner_code: (r.body && r.body.code) || null });
        /* END DEC-49 REGION is-scanner-answering */
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
        for (const tool of this.#routineTools("scan")) {
          for (const d of batch) {
            if (this.#budgetLeft(tool) <= 0) break;
            await this.#providerScan(tool, d.sha);
          }
        }
      }
      return { ok: true, ...out, remaining: Math.max(0, due.length - batch.length) };
    } catch { return refusal("SCANNER_UNREACHABLE", "The scan batch could not be run. No note was written."); }
  }

  /** R5: the scanner's state for administrators, so a lag is stated, never silent. */
  async scanStatus({ viewer = undefined } = {}) {
    try {
      const bar = this.#adminBar(viewer, "reading the scanner's state");
      if (bar) return bar;
      const now = this.now();
      const v = await this.#scanner("/version", null, { method: "GET" });
      const ver = v.body && v.body.ok === true ? v.body : null;
      const published = ver && ver.signatures ? Date.parse(ver.signatures.published) : NaN;
      const lists = ver && Array.isArray(ver.reputation_lists) ? ver.reputation_lists.map((l) => Date.parse(l.fetched_at)).filter(Number.isFinite) : [];
      const due = this.#due(now);
      return { ok: true,
        scanner: ver ? { bound: true, version: ver.version, clamav_version: ver.clamav_version, signatures: ver.signatures }
          : { bound: !!this.#scannerBinding(), version: null, ...(this.#scannerBinding() ? { unreachable: true } : {}) },
        renderer: ver ? { bound: true, version: ver.renderer_version } : { bound: !!this.#scannerBinding(), version: null },
        signatures_age_ms: Number.isFinite(published) ? Math.max(0, now - published) : null,
        queued: due.length, overdue: due.filter((d) => Number.isFinite(d.since) && now - d.since > OVERDUE_MS).length,
        held: Number(this.#one(`SELECT COUNT(DISTINCT capture_sha) AS n FROM fs_holds WHERE state <> 'released'`).n),
        tools: this.#rows(`SELECT * FROM fs_tools WHERE state <> 'removed' ORDER BY seq`).map((t) => ({ tool_id: t.tool_id, state: t.state,
          used_this_month: this.#used(t.tool_id), monthly_limit: t.monthly_limit })),
        reputation_list_age_ms: lists.length ? Math.max(0, now - Math.max(...lists)) : null };
    } catch { return refusal("SCANNER_UNREACHABLE", "The scanner's state could not be read."); }
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
  #event(toolId, event) {
    this.sql.exec(`INSERT INTO fs_tool_events (tool_id, event, at) VALUES (?, ?, ?)`, toolId, event, iso(this.now()));
  }
  /* R31: a tool that did not honour its private mode is switched off, for the administrators' notice. */
  #switchOff(tool, reason) {
    this.sql.exec(`UPDATE fs_tools SET state = 'off', off_reason = ? WHERE tool_id = ?`, reason, tool.tool_id);
    this.#event(tool.tool_id, "switched_off");
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
    const bar = this.#adminBar(viewer, "reading the security tools offered");
    if (bar) return bar;
    return { ok: true,
      offered: PROVIDERS.map((d) => ({ provider_id: d.provider_id, vendor: d.vendor, product: d.product, kinds: d.kinds,
        transport: d.transport, reach: d.reach, template: !!d.template, credentials: d.credentials, handling: d.handling,
        handling_digest: FileSafety.#handlingDigest(d.handling), licence_note: d.licence_note ?? null,
        source_urls: d.source_urls, read_on: d.read_on })),
      refused: REFUSED_PROVIDERS.map((r) => ({ provider_id: r.provider_id, reason: r.reason,
        words: PROVIDER_REASON_WORDS[r.reason] || PROVIDER_REASON_WORDS.NOT_OFFERED })),
      held: HELD_PROVIDERS.map((h) => ({ provider_id: h.provider_id, reason: h.missing || "HANDLING_NOT_STATED",
        words: PROVIDER_REASON_WORDS[h.missing] || PROVIDER_REASON_WORDS.HANDLING_NOT_STATED })) };
  }

  /** R27: the group's tools, without credentials. */
  securityTools({ viewer = undefined } = {}) {
    const bar = this.#adminBar(viewer, "reading the group's security tools");
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
      const host = template && typeof template === "object" && typeof template.host === "string" && template.host ? template.host
        : typeof cfg.host === "string" && cfg.host ? cfg.host : null;
      const region = typeof cfg.region === "string" && cfg.region ? cfg.region : null;
      delete cfg.host; delete cfg.region;
      if (!base || (base.template && !host)) return refusal("PROVIDER_UNKNOWN", "No offered service has this name, or a generic tool names no host.", { provider_id: id });
      /* END DEC-49 REGION is-provider-offered */
      /* DEC-49 REGION is-descriptor-valid */
      const resolved = resolveDescriptor(base, { host, config: cfg });
      if (!resolved.ok) return refusal(FILE_SAFETY_CHECKS[resolved.code] ? resolved.code : "DESCRIPTOR_MALFORMED",
        "file-scanner's R19 refuses the tool's description.", { provider_id: id, ...(resolved.field ? { field: resolved.field } : {}) });
      /* END DEC-49 REGION is-descriptor-valid */
      const d = resolved.descriptor;
      const digest = FileSafety.#handlingDigest(d.handling);
      /* DEC-49 REGION is-handling-shown */
      if (handlingDigest !== digest) return refusal("HANDLING_NOT_SHOWN", "handlingDigest is not the tool's current handling_digest.", { provider_id: id, handling_digest: digest });
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
    if (!t || t.state === "removed") return { refused: refusal("NO_SUCH_TOOL", "No tool of the group's has this id.", { tool_id: toolId ?? null }) };
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
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", "No scanner is bound beside this copy, so no tool can be tested.", { tool_id: tool.tool_id });
      const spec = await this.#spec(tool);
      const r = spec ? await this.#scanner("/provider/test", { tool: spec }) : { body: { ok: false, code: "CREDENTIALS_UNAVAILABLE" } };
      const at = iso(this.now());
      const passed = !!(r.body && r.body.ok === true && r.body.passed === true);
      const detail = r.unreachable ? "SCANNER_UNREACHABLE" : r.body ? (r.body.ok === true ? r.body.detail : r.body.code) : "SCANNER_UNREACHABLE";
      this.sql.exec(`UPDATE fs_tools SET state = ?, tested_at = ?, detail = ?, off_reason = NULL WHERE tool_id = ?`,
                    passed ? "on" : "test_failed", at, detail == null ? null : String(detail).slice(0, 300), tool.tool_id);
      this.#event(tool.tool_id, passed ? "test_passed" : "test_failed");
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

  /** R31: each add, test, removal and switch, for the administrators' notice; no file is named. */
  securityToolEvents({ after = null, limit = LIST.default, viewer = undefined } = {}) {
    const bar = this.#adminBar(viewer, "reading the security tools' events");
    if (bar) return bar;
    const from = Number.isFinite(Number(after)) && after !== null && after !== "" ? Number(after) : 0;
    const lim = clamp(limit, LIST.default, LIST.max);
    const rows = this.#rows(`SELECT * FROM fs_tool_events WHERE seq > ? ORDER BY seq LIMIT ?`, from, lim + 1);
    const page = rows.slice(0, lim);
    return { ok: true, events: page.map((e) => ({ tool_id: e.tool_id, event: e.event, at: e.at })),
             cursor: page.length ? String(page[page.length - 1].seq) : (after ?? null), truncated: rows.length > lim };
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
      return { ok: true, captureSha: sha, state: "queued", check_id: checkId };
    } catch { return refusal("NO_OUTSIDE_TOOL", "The deeper check could not be asked for.", { captureSha: captureSha ?? null }); }
  }

  /* R14's structure check: the file's reader reads it whole (K1928 Q2), an archive by its listing. */
  async #structureCheck(sha) {
    const bytes = await this.#bytes(sha);
    const entry = (result, detail) => ({ check: "structure", tool: "file-safety", engine: "structure", result, detail });
    if (!bytes) return entry("not_scanned", "NOT_FOUND");
    const format = formatOf(bytes);
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
    if (format === "image" || format === "text") return entry("clean", format);
    return entry("not_scanned", `NO_READER:${format}`);
  }

  /* R14: the check starts: the structure check, ClamAV on demand, every outside scan tool and a submission to every
     outside sandbox with budget left (a tool past its limit is skipped and named). */
  async #startDeeper(row) {
    const sha = row.capture_sha;
    const checks = [await this.#structureCheck(sha)];
    const c = await this.#clamav(sha);
    if (c.verdict) {
      this.#writeNote(sha, { kind: "scan", ...c.verdict });
      checks.push({ check: "clamav", tool: "clamav", engine: c.verdict.engine, result: c.verdict.result,
                    detail: c.verdict.result === "found" ? (c.verdict.findings || []).join(", ") : (c.verdict.reason || c.verdict.detail || null) });
    } else checks.push({ check: "clamav", tool: "clamav", engine: "clamav", result: "not_scanned", detail: c.absent ? "SCANNER_ABSENT" : c.failed });
    const pending = [];
    for (const kind of ["scan", "sandbox"]) {
      for (const tool of this.#onTools(kind)) {
        if (this.#budgetLeft(tool) <= 0) { checks.push({ check: kind, tool: tool.provider_id, tool_id: tool.tool_id, engine: null, result: "skipped", detail: "MONTHLY_LIMIT_REACHED" }); continue; }
        if (kind === "scan") { checks.push(...(await this.#providerScan(tool, sha))); continue; }
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
    const ran = checks.filter((c) => c.result !== "skipped");
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

  /** R36: the scheduler's wake while checks are queued or running: queued checks start, running sandboxes are asked. */
  async deeperBatch({ limit = 20 } = {}) {
    try {
      const lim = clamp(limit, 20, SCAN_BATCH_MAX);
      const out = { started: 0, polled: 0, done: [] };
      for (const q of this.#rows(`SELECT * FROM fs_deeper WHERE state = 'queued' ORDER BY requested_at LIMIT ?`, lim)) {
        const row = await this.#startDeeper(q);
        out.started++;
        if (!parse(row.pending, []).length) out.done.push(this.#finishDeeper(row));
      }
      for (const q of this.#rows(`SELECT * FROM fs_deeper WHERE state = 'running' ORDER BY requested_at LIMIT ?`, lim)) {
        const { row, polled } = await this.#pollDeeper(q);
        out.polled += polled;
        if (!parse(row.pending, []).length) out.done.push(this.#finishDeeper(row));
      }
      const left = (s) => Number(this.#one(`SELECT COUNT(*) AS n FROM fs_deeper WHERE state = ?`, s).n);
      return { ok: true, ...out, running: left("running"), queued: left("queued") };
    } catch { return { ok: true, started: 0, polled: 0, done: [], running: null, queued: null }; }
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
    const s = await this.#scanner("/scan", { store: this.store, targets: [{ capture_sha: copySha, parts: null }], area: "derived" });
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
      const h = this.#held(captureSha, viewer);
      if (h.refused) return h.refused;
      const tool = this.#onTools("cdr")[0];
      /* DEC-49 REGION is-copy-tool-on */
      if (!tool) return refusal("NO_SAFE_COPY", "No tool of kind cdr is on.", { captureSha: h.sha });
      /* END DEC-49 REGION is-copy-tool-on */
      const row = this.#one(`SELECT * FROM fs_copies WHERE capture_sha = ?`, h.sha);
      if (row && ["pending", "done", "withheld"].includes(row.state)) return { ok: true, captureSha: h.sha, state: row.state };
      if (!this.#scannerBinding()) return refusal("SCANNER_ABSENT", "No scanner is bound beside this copy, so no tool can be asked.", { captureSha: h.sha });
      return { ok: true, captureSha: h.sha, state: await this.#makeCopy(h.sha, tool) };
    } catch { return refusal("SAFE_COPY_FAILED", "The safe copy could not be asked for.", { captureSha: captureSha ?? null }); }
  }

  /** R33: the safe copy and its bytes (the description in `x-file-safety`), or why not. It opens for a high file without
   *  a deeper check and stays available under a scan hold: it is the derived document, never the original. */
  async safeCopy({ captureSha = null, viewer = undefined } = {}) {
    try {
      const h = this.#held(captureSha, viewer);
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

  /** R35: one counts record for the period, keys exactly LOG_COUNT_KINDS (a figure that could not be read is absent,
   *  never zero), sent to every `on` log tool. */
  async forwardSecurityCounts({ from = null, to = null } = {}) {
    try {
      const f = Date.parse(from), t = Date.parse(to);
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
      return { ok: true, sent, failed, record };
    } catch { return refusal("FORWARD_PERIOD_INVALID", "The counts could not be built. Nothing was sent."); }
  }
}

/* K61: the one FileSafety of a Durable Object's storage, made on first use; its first construction registers the receipt
   listener (R1). The providers (a test's own) and `env` are read on the first call only. */
const OF = new WeakMap();
export function fileSafetyOf(ctx, { record = null, membership = null, credentials = null, provenance = null, acquisition = null,
                                    env = null, store = "bio", now = null, scanWaitMs = SCAN_WAIT_MS } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let fs = OF.get(storage);
  if (fs) return fs;
  const rec = record || recordOf(ctx);
  const mem = membership || membershipOf(ctx, { record: rec });
  const cred = credentials || credentialsOf(ctx, { record: rec, membership: mem });
  const prov = provenance || provenanceOf(ctx, { record: rec, membership: mem });
  const acq = acquisition || acquisitionOf(ctx, { record: rec, provenance: prov, membership: mem });
  fs = new FileSafety({ sql: storage.sql, record: rec, membership: mem, credentials: cred, provenance: prov, acquisition: acq,
                        env, store, now, scanWaitMs });
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
    safeview: () => fs.safeView({ captureSha: sha(), viewer: viewer() }),
    safecopyrequest: () => fs.requestSafeCopy({ captureSha: sha(), viewer: viewer() }),
    safecopy: () => fs.safeCopy({ captureSha: sha(), viewer: viewer() }),
    scanbatch: () => fs.scanBatch({ limit: b.limit ?? q("limit") ?? undefined, at: b.at ?? q("at") ?? null }),
    scanstatus: () => fs.scanStatus({ viewer: viewer() }),
    renderbatch: () => fs.renderBatch({ limit: b.limit ?? q("limit") ?? undefined }),
    deepercheck: () => fs.requestDeeperCheck({ captureSha: sha(), viewer: viewer() }),
    deeperbatch: () => fs.deeperBatch({ limit: b.limit ?? q("limit") ?? undefined }),
    scanfindings: () => fs.scanFindings({ after: q("after") ?? b.after ?? null, limit: q("limit") ?? b.limit ?? undefined, viewer: viewer() }),
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
