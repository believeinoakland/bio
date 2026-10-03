/* case-import — another group's case file, imported into a read-only project (requirements:
 * `build/requirements/case-import.md` R1–R16; DEC-112 (6), DEC-96 items 1, 2, 4, DEC-92, DEC-45, DEC-46 (3);
 * `BIO_Publication_v0_1.md` §5C "Import"; N520, N522, K1256, K1257, K1273).
 *
 * A member imports another group's case file (R1). The copy holds it as an IMPORT, one per source group, case and lens,
 * its id the SHA-256 of canonical `{group, case, lens}`, with each EDITION side by side and never replaced. It confirms
 * each finding by recreating it through `case-checker` and records each result (R3); it shows each finding against
 * this group's own bar, never the source's as this group's (R4, R11). A document fetched later that matches a missing
 * material's fingerprint completes it, and the edition is checked again (R5). The group may accept an edition for the
 * findings that recreated, by a reasoned act, and withdraw that acceptance, and may flag and clear issues on it (R6–R8).
 * Recreating is not endorsing, and an acceptance changes no grade.
 *
 * Nothing an import holds is a record bundle (R2): it lives in this module's own tables, append-only (R12), and no act
 * here edits, promotes, ratifies or publishes it. `accepted-work` (layer 6) reads it for the modules before this one
 * through the registration this module fills at start (R16); `case-authoring` reads `acceptanceOf` and `openFlagsOn`
 * directly (R9).
 *
 * A NEW MODULE (T28, layer 8, directly after `case-checker`). REACHED as `caseImportOf(host, deps)` (K61): one instance
 * per host. At creation it creates its tables, declares them to record-core's purge (whole store only, R13), registers
 * its figures (record-core R63) and fills `accepted-work`'s registration (R16). `deps` (each reached through its factory
 * on the same host unless given; a test passes its own):
 *   record          `transact`, `declarePurge`, `registerCounts`.
 *   membership      `positionalMember`, `memberFacts`, `isAdministrator` (who is an active member of this group).
 *   strength        `strengthBarOf` (its R16): this group's default bar (R4).
 *   acceptedWork    `registerAcceptedWork` (its R1; R16).
 *   reevaluation    `acceptanceWithdrawn` (its R31; R7).
 *   checkCaseFile   `case-checker.checkCaseFile` (its R1), pure.
 *   caseFileManifestCheck   `case-grammar.caseFileManifestCheck` (its R13), pure.
 *   now             the clock, milliseconds (default `env.BIO_NOW_MS`, else the wall clock).
 *
 * The words a member sees (the origin marks, "another group's", the statement that recreating is not endorsing) are the
 * UX design stream's; this module answers facts and the checker's statement, never their final words. No place is named
 * here (R15). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { importedFindingRef, parseImportedFindingRef } from "../inquiry-grammar/index.mjs";
import * as caseGrammar from "../case-grammar/index.mjs";
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { createSha256, sha256HexSync } from "../record-grammar/sha256.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { BASIS_GRADES } from "../record-grammar/index.mjs";
import { CASE_IMPORT_CHECKS, rowOf } from "./checks.mjs";
import { CASE_IMPORT_TABLES, BLOB_CHUNK, migrateCaseImport } from "./schema.mjs";
import { readCaseFile } from "./parts.mjs";

export { CASE_IMPORT_CHECKS } from "./checks.mjs";
export { CASE_IMPORT_SCHEMA, CASE_IMPORT_TABLES } from "./schema.mjs";

/* ---------------------------------------------------------------- the vocabularies and bounds */

/** `case-checker` R11's results. */
export const RESULTS = Object.freeze(["recreated", "recreated_in_part", "did_not_recreate"]);
/** R1: the part bound, `public-read` R5's 64 MiB. */
export const PART_MAX = 64 * 1024 * 1024;
/** R6–R8: a member's words, DEC-88's bound. */
export const WORDS_MAX = 2000;
/** R16: the most withdrawals one page answers, and the default. */
export const WITHDRAWALS_PAGE_MAX = 1000, WITHDRAWALS_PAGE = 200;
/** R4: the label every statement of the source's own bar carries (DEC-45). */
export const SOURCE_BAR = "the source group's bar, as its case states it";
/** R4: this group's own bar, the group default, when none is set (K1134 reading 3). */
export const NO_OWN_BAR = "no bar is set for this group";
/** R1 (`case-checker` R1): the checker's statement when no answer carries one; its words are the UX stream's. */
export const STATEMENT = "Recreating a case shows it is intact and consistent, not that it is true.";
const AXES = Object.freeze(["capture", "connection", "testimony"]);
const ID = { acceptance: "IMA", withdrawal: "IMW", flag: "IMF" };

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const words = (v) => typeof v === "string" && !!v.trim() && v.length <= WORDS_MAX && !LONE_SURROGATE.test(v);
const int = (v) => {
  if (typeof v === "number") return Number.isInteger(v) && v > 0 ? v : null;
  if (typeof v === "string" && /^[1-9][0-9]{0,8}$/.test(v.trim())) return Number(v.trim());
  return null;
};
const isSha = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const parse = (s, dflt = null) => { if (s && typeof s === "object") return s; try { return JSON.parse(s); } catch { return dflt; } };
const idOf = (kind, rn) => `${ID[kind]}-${rn}`;
const rnOf = (kind, id) => {
  const m = typeof id === "string" ? new RegExp(`^${ID[kind]}-([1-9][0-9]{0,15})$`).exec(id.trim()) : null;
  return m ? Number(m[1]) : null;
};

/** The SHA-256 of bytes, lowercase hex (record-grammar R20). */
export function shaOf(bytes) { return createSha256().update(bytes).hex(); }

/** Bytes as given: a `Uint8Array`, an `ArrayBuffer`, a byte array, or standard base64 text; null for anything else. */
export function bytesOf(v) {
  try {
    if (v instanceof Uint8Array) return v;
    if (v instanceof ArrayBuffer) return new Uint8Array(v);
    if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
    if (Array.isArray(v) && v.every((b) => Number.isInteger(b) && b >= 0 && b < 256)) return Uint8Array.from(v);
    if (typeof v === "string" && /^[A-Za-z0-9+/\s]*={0,2}\s*$/.test(v)) {
      const bin = atob(v.replace(/\s+/g, ""));
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
  } catch { /* not bytes */ }
  return null;
}

/* DEC-49: a refusal of this module's own carries its code, its row and the member's translation. */
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string" || r.check) return r;
  const row = rowOf(r.reason);
  return row ? { ...r, code: r.code ?? r.reason, check: row.check, translation: row.translation } : r;
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });

/** The import id (Provides, "An import"): the SHA-256 of canonical JSON `{group, case, lens}`. */
export function importIdOf({ group, case: caseId, lens }) {
  return sha256HexSync(canonicalJson({ group, case: caseId, lens: lens ?? null }));
}

/* R4 (`case-checker` R6): one axis of a pair as `strength` answers it: a letter, or `{state, grade}`. */
function gradeOf(pair, axis) {
  const a = isObj(pair) ? pair[axis] : null;
  if (typeof a === "string") return BASIS_GRADES.includes(a) ? a : null;
  if (isObj(a) && (a.state === undefined || a.state === "graded") && BASIS_GRADES.includes(a.grade)) return a.grade;
  return null;
}
/* R4: a bar's declared axes, `{axis: letter}`, or null for no bar. */
function barAxes(bar) {
  if (!isObj(bar)) return null;
  const out = {};
  for (const axis of ["capture", "connection"]) if (BASIS_GRADES.includes(bar[axis])) out[axis] = bar[axis];
  return Object.keys(out).length ? out : null;
}
/** R4: a finding against a bar, as `case-checker` R6 reads it: `not_asked` for a finding that is not load-bearing,
 *  `no_bar` with none set, else whether each declared axis is reached, `meets` true only when every one is. */
export function againstBar(role, pair, bar) {
  const axes = barAxes(bar);
  if (role !== "load_bearing") return { meets: "not_asked", bar: axes, short: [] };
  if (!axes) return { meets: "no_bar", bar: null, short: [] };
  const short = [];
  for (const [axis, need] of Object.entries(axes)) {
    const got = gradeOf(pair, axis);
    if (!got || BASIS_GRADES.indexOf(got) > BASIS_GRADES.indexOf(need)) short.push({ axis, bar: need, grade: got });
  }
  return { meets: short.length === 0, bar: axes, short };
}

/* R16 (`accepted-work` R1): a finding's per-axis pair as its published bytes freeze it (`published_strength`). */
function publishedPairOf(fm) {
  const rows = isObj(fm) && Array.isArray(fm.published_strength) ? fm.published_strength : null;
  if (!rows) return null;
  const pair = {};
  for (const r of rows) if (isObj(r) && AXES.includes(r.axis) && !(r.axis in pair))
    pair[r.axis] = { state: typeof r.state === "string" ? r.state : null, grade: BASIS_GRADES.includes(r.grade) ? r.grade : null };
  return Object.keys(pair).length ? pair : null;
}

/* R5: the fingerprints a `missing` entry names: each 64-hex value it carries (a material's or a file's SHA-256). */
function fingerprintsOf(entry, out = new Set(), depth = 0) {
  if (depth > 4) return out;
  if (typeof entry === "string") { for (const m of entry.match(/\b[0-9a-f]{64}\b/g) || []) out.add(m); return out; }
  if (Array.isArray(entry)) { for (const x of entry) fingerprintsOf(x, out, depth + 1); return out; }
  if (isObj(entry)) for (const v of Object.values(entry)) fingerprintsOf(v, out, depth + 1);
  return out;
}

/* R4 (DEC-92): whether the case document's signature verified, as the checker answers it; null when it does not say. */
function signatureVerified(answer) {
  const s = isObj(answer) ? answer.signatures : null;
  const c = isObj(s) ? (isObj(s.case) ? s.case : isObj(s.case_document) ? s.case_document : null) : null;
  for (const k of ["verified", "ok", "valid"]) if (c && typeof c[k] === "boolean") return c[k];
  return null;
}

export class CaseImport {
  #deps;

  constructor({ storage, record, membership, host = null, env = null, now = null, ...deps } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
    this.#deps = { host, ...deps };
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get reevaluation() { return this.#deps.reevaluation ||= reevaluationOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get acceptedWork() { return this.#deps.acceptedWork ||= acceptedWorkOf(this.#deps.host, { record: this.record }); }
  get #checkCaseFile() { return this.#deps.checkCaseFile; }
  get #manifestCheck() { return this.#deps.caseFileManifestCheck || caseGrammar.caseFileManifestCheck; }

  migrate() { migrateCaseImport(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #call(fn, dflt = null) { try { return fn(); } catch { return dflt; } }
  #nowMs() {
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env.BIO_NOW_MS);
    return Number.isFinite(v) && v >= 0 ? v : Date.now();
  }
  #stamp() { return stampInstant("second", this.#nowMs()); }

  /* ================================================================ who may act and read */

  /* The member an identity names, or null for a machine, an AI credential, an operator token or nobody (R1). */
  #member(identity) {
    if (!str(identity) || isMachineIdentity(identity)) return null;
    return this.#call(() => this.membership.positionalMember(null, String(identity).trim()));
  }
  /* An active member of this group: the founder and every administrator, and every member whose status is active. */
  #isActiveMember(identity) {
    const m = this.#member(identity);
    if (!m) return false;
    if (this.#call(() => this.membership.isAdministrator(m), false)) return true;
    const f = this.#call(() => this.membership.memberFacts(m));
    return !!f && f.status === "active";
  }
  /* R4, R9, R16: who may read an import. A viewer never sent is an internal caller, the plane reading for itself (as
     `membership` treats one), and is answered; any viewer sent is answered only as an active member. */
  #sees(viewer) {
    if (viewer === null || viewer === undefined) return true;
    return this.#isActiveMember(viewer);
  }

  /* R1's first two refusals, shared by every act (R5–R8). */
  #callerRefusal({ by, viewer }) {
    const member = this.#member(by);
    /* DEC-49 REGION is-import-caller */
    if (!member)
      return { refusal: refuse("MACHINE_CANNOT_IMPORT", str(by)
        ? "an import, and every act on one, is a member's, signed in as themselves; this caller is not one"
        : "no member is named as the one acting: this call carries nobody") };
    if (!this.#isActiveMember(str(viewer) || by))
      return { refusal: refuse("IMPORT_NOT_A_MEMBER", "only an active member of this group imports, or acts on an import") };
    /* END DEC-49 REGION is-import-caller */
    return { member };
  }

  /* ================================================================ the bytes */

  /* Bytes by SHA-256, once; chunked, append-only. Called inside a transaction. */
  #putBlob(sha, bytes) {
    if (this.#one(`SELECT 1 AS x FROM case_import_blobs WHERE sha=? AND chunk=0`, sha)) return;
    if (!bytes.length) { this.sql.exec(`INSERT INTO case_import_blobs (sha, chunk, data) VALUES (?,?,?)`, sha, 0, new Uint8Array(0)); return; }
    for (let i = 0, c = 0; i < bytes.length; i += BLOB_CHUNK, c++)
      this.sql.exec(`INSERT INTO case_import_blobs (sha, chunk, data) VALUES (?,?,?)`, sha, c, bytes.slice(i, i + BLOB_CHUNK));
  }
  #blob(sha) {
    const rows = this.#rows(`SELECT data FROM case_import_blobs WHERE sha=? ORDER BY chunk`, sha);
    if (!rows.length) return null;
    const parts = rows.map((r) => (r.data instanceof Uint8Array ? r.data : new Uint8Array(r.data)));
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const p of parts) { out.set(p, at); at += p.length; }
    return out;
  }
  #parts(importId, edition) {
    return this.#rows(`SELECT sha FROM case_import_parts WHERE import_id=? AND edition=? ORDER BY idx`, importId, edition)
      .map((p) => this.#blob(p.sha));
  }
  #documents(importId, edition) {
    return this.#rows(`SELECT sha FROM case_import_documents WHERE import_id=? AND edition=? ORDER BY at, sha`, importId, edition)
      .map((d) => this.#blob(d.sha)).filter(Boolean);
  }
  /** R1, R13: a file of an imported edition, by its path, as held: `{path, kind, sha, bytes}`, or null. */
  fileOf({ import: importId = null, edition = null, path = null } = {}) {
    const ed = int(edition);
    const f = str(importId) && ed && str(path)
      ? this.#one(`SELECT * FROM case_import_files WHERE import_id=? AND edition=? AND path=?`, str(importId), ed, str(path)) : null;
    if (!f) return null;
    const part = this.#one(`SELECT sha FROM case_import_parts WHERE import_id=? AND edition=? AND idx=?`, f.import_id, ed, f.part);
    const whole = part ? this.#blob(part.sha) : null;
    const bytes = whole ? whole.slice(Number(f.at_byte), Number(f.at_byte) + Number(f.bytes)) : null;
    return bytes && shaOf(bytes) === f.sha ? { path: f.path, kind: f.kind ?? null, sha: f.sha, bytes } : null;
  }

  /* ================================================================ R3: one recreation */

  /* The checker's answer over the edition's parts and the documents supplied for it, or what stands for none. The
     checker is pure and never throws (its R1); one that does, or is absent, answers every finding as unknown here. */
  #recreate(parts, documents) {
    const fn = this.#checkCaseFile;
    try {
      if (typeof fn !== "function") return { findings: [], unread: "no case checker is composed on this copy" };
      const a = fn({ parts, documents });
      return isObj(a) ? a : { findings: [], unread: "the case checker gave no answer" };
    } catch (e) {
      return { findings: [], unread: `the case checker failed: ${String(e && e.message ? e.message : e).slice(0, 200)}` };
    }
  }

  /* R3, R12: records one recreation, inside the caller's transaction: its run, and each finding's result with what is
     missing, what differs, the recomputed pair and the checker's versions; each finding's published pair beside it
     (R16). Answers the run's number. */
  #recordCheck(importId, edition, answer, { cause, document = null, by, at, published }) {
    const { findings = [], ...rest } = answer;
    const checker = isObj(rest.checker) ? rest.checker : null;
    this.sql.exec(`INSERT INTO case_import_checks (import_id, edition, cause, document_sha, checker, answer, checked_by, checked_at)
                   VALUES (?,?,?,?,?,?,?,?)`, importId, edition, cause, document,
                  canonicalJson({ grading_versions: checker?.grading_versions ?? null, checks_version: checker?.checks_version ?? null }),
                  canonicalJson(rest), by, at);
    const rn = Number(this.#one(`SELECT MAX(rn) AS rn FROM case_import_checks`).rn);
    (Array.isArray(findings) ? findings : []).forEach((f, ord) => {
      const id = isObj(f) ? str(f.finding) : null;
      if (!id) return;
      const result = RESULTS.includes(f.result) ? f.result : "did_not_recreate";
      this.sql.exec(`INSERT INTO case_import_results (check_rn, ord, finding, role, result, missing, differs, pair, published)
                     VALUES (?,?,?,?,?,?,?,?,?)`, rn, ord, id, str(f.role), result,
                    canonicalJson(Array.isArray(f.missing) ? f.missing : []), canonicalJson(Array.isArray(f.differs) ? f.differs : []),
                    f.pair === undefined ? null : canonicalJson(f.pair), published.has(id) ? canonicalJson(published.get(id)) : null);
    });
    return rn;
  }

  /* R16: each finding's published pair, from the edition's `finding` files. */
  #publishedPairs(files) {
    const out = new Map();
    for (const f of files) {
      if (f.kind !== "finding") continue;
      const fm = this.#call(() => parseFrontmatter(new TextDecoder().decode(f.bytes)).data);
      const id = isObj(fm) ? str(fm.id) : null;
      const pair = publishedPairOf(fm);
      if (id && pair && !out.has(id)) out.set(id, pair);
    }
    return out;
  }
  #heldFiles(importId, edition) {
    return this.#rows(`SELECT path FROM case_import_files WHERE import_id=? AND edition=? ORDER BY path`, importId, edition)
      .map((f) => this.fileOf({ import: importId, edition, path: f.path })).filter(Boolean);
  }

  /* ================================================================ R1: the import */

  /* The manifest's list of files, each `{path, kind, sha, bytes, part}` (`case-grammar` R13). */
  static #manifestFiles(manifest) {
    const list = isObj(manifest) && Array.isArray(manifest.files) ? manifest.files : [];
    return list.filter(isObj).map((f) => ({ path: str(f.path), kind: str(f.kind), sha: str(f.sha ?? f.sha256), part: int(f.part) ?? 0 }))
      .filter((f) => f.path);
  }
  static #manifestIdentity(manifest) {
    const m = isObj(manifest) ? manifest : {};
    return { group: str(m.group ?? m.source_group), case: str(m.case ?? m.case_id), edition: int(m.edition ?? m.case_edition) };
  }

  /** R1: imports a case file's parts into this group's read-only import of that case and lens, recreating each finding.
   *  The same edition with the same bytes answers `existed: true` and writes nothing. */
  importCaseFile({ parts = null, by = null, viewer = null } = {}) {
    const k = this.#callerRefusal({ by, viewer });
    if (k.refusal) return k.refusal;
    const list = Array.isArray(parts) ? parts.map(bytesOf) : [];
    /* DEC-49 REGION is-import-case-file */
    if (!list.length || list.some((p) => !p))
      return refuse("IMPORT_NOT_A_CASE_FILE", "parts are the case file's parts, each as bytes",
                    { departures: [!list.length ? "no part was given" : `part ${list.findIndex((p) => !p)} is not bytes`] });
    const read = readCaseFile(list);
    if (read.departures.length)
      return refuse("IMPORT_NOT_A_CASE_FILE", "the parts could not be read as a case file", { departures: read.departures });
    const check = this.#manifestCheck;
    const departures = typeof check === "function" ? this.#call(() => check(read.manifest), ["the manifest could not be checked"])
      : ["this copy holds no check of a case file's manifest"];
    const named = Array.isArray(departures) ? departures : departures ? [departures] : [];
    if (named.length)
      return refuse("IMPORT_NOT_A_CASE_FILE", "the manifest departs from the case-file format", { departures: named });
    const big = list.findIndex((p) => p.length > PART_MAX);
    if (big >= 0)
      return refuse("IMPORT_PART_TOO_LARGE", `part ${big} is ${list[big].length} bytes, over the part bound of ${PART_MAX}`,
                    { part: big, bytes: list[big].length, bound: PART_MAX });
    const who = CaseImport.#manifestIdentity(read.manifest);
    if (!who.group || !who.case || !who.edition)
      return refuse("IMPORT_NOT_A_CASE_FILE", "the manifest departs from the case-file format",
                    { departures: ["the manifest does not name its group, case and edition"] });
    /* END DEC-49 REGION is-import-case-file */
    const listed = CaseImport.#manifestFiles(read.manifest);
    const docEntry = listed.find((f) => f.kind === "case_document");
    const docBytes = docEntry && read.files.get(docEntry.path) ? read.files.get(docEntry.path).bytes : null;
    const fm = docBytes ? this.#call(() => parseFrontmatter(new TextDecoder().decode(docBytes)).data) : null;
    const lensSha = isObj(fm) && isObj(fm.bias_manifest) && isSha(fm.bias_manifest.statements_sha) ? fm.bias_manifest.statements_sha : null;
    const importId = importIdOf({ group: who.group, case: who.case, lens: lensSha });
    const manifestSha = shaOf(read.manifestBytes);
    const held = this.#one(`SELECT manifest_sha FROM case_import_editions WHERE import_id=? AND edition=?`, importId, who.edition);
    if (held && held.manifest_sha === manifestSha)
      return { ok: true, existed: true, import: importId, group: who.group, case: who.case, lens: lensSha, edition: who.edition,
               manifest_sha: manifestSha, wrote: false };
    /* DEC-49 REGION is-import-case-file */
    if (held)
      return refuse("IMPORT_EDITION_DIFFERS", `edition ${who.edition} of this case is held with other bytes; an edition never changes`,
                    { import: importId, edition: who.edition, held: held.manifest_sha, given: manifestSha });
    /* END DEC-49 REGION is-import-case-file */
    const answer = this.#recreate(list, []);
    const at = this.#stamp();
    const files = listed.map((f) => ({ ...f, entry: read.files.get(f.path) })).filter((f) => f.entry);
    const published = this.#publishedPairs(files.map((f) => ({ kind: f.kind, bytes: f.entry.bytes })));
    const sourceBar = isObj(fm) && isObj(fm.required_strength) ? fm.required_strength : null;
    const out = this.record.transact(() => {
      if (this.#one(`SELECT 1 AS x FROM case_import_editions WHERE import_id=? AND edition=?`, importId, who.edition))
        return { ok: false, reason: "RACED", detail: "the edition was imported meanwhile" };
      if (!this.#one(`SELECT 1 AS x FROM case_imports WHERE import_id=?`, importId))
        this.sql.exec(`INSERT INTO case_imports (import_id, source_group, case_id, lens, created_by, created_at) VALUES (?,?,?,?,?,?)`,
                      importId, who.group, who.case, lensSha, k.member, at);
      this.sql.exec(`INSERT INTO case_import_editions (import_id, edition, manifest_sha, format, case_doc_sha, source_bar, imported_by,
                                                       imported_at) VALUES (?,?,?,?,?,?,?,?)`,
                    importId, who.edition, manifestSha, str(read.manifest.format), docBytes ? shaOf(docBytes) : null,
                    sourceBar ? canonicalJson(sourceBar) : null, k.member, at);
      list.forEach((bytes, idx) => {
        const sha = shaOf(bytes);
        this.#putBlob(sha, bytes);
        this.sql.exec(`INSERT INTO case_import_parts (import_id, edition, idx, sha, bytes) VALUES (?,?,?,?,?)`,
                      importId, who.edition, idx, sha, bytes.length);
      });
      for (const f of files)
        this.sql.exec(`INSERT INTO case_import_files (import_id, edition, path, kind, sha, bytes, part, at_byte) VALUES (?,?,?,?,?,?,?,?)`,
                      importId, who.edition, f.path, f.kind, shaOf(f.entry.bytes), f.entry.bytes.length, f.entry.part, f.entry.at);
      this.#recordCheck(importId, who.edition, answer, { cause: "import", by: k.member, at, published });
      return { ok: true };
    });
    if (!out || out.ok !== true) {
      const again = this.#one(`SELECT manifest_sha FROM case_import_editions WHERE import_id=? AND edition=?`, importId, who.edition);
      if (again && again.manifest_sha === manifestSha)
        return { ok: true, existed: true, import: importId, group: who.group, case: who.case, lens: lensSha, edition: who.edition,
                 manifest_sha: manifestSha, wrote: false };
      return again ? refuse("IMPORT_EDITION_DIFFERS", `edition ${who.edition} of this case is held with other bytes`,
                            { import: importId, edition: who.edition, held: again.manifest_sha, given: manifestSha }) : out;
    }
    return { ok: true, existed: false, import: importId, group: who.group, case: who.case, lens: lensSha, edition: who.edition,
             manifest_sha: manifestSha, imported_at: at, imported_by: k.member,
             recreation: this.#recreationView(importId, who.edition) };
  }

  /* ================================================================ the rows read back */

  #import(importId) { return str(importId) ? this.#one(`SELECT * FROM case_imports WHERE import_id=?`, str(importId)) : null; }
  #edition(importId, edition) {
    const ed = int(edition);
    return str(importId) && ed ? this.#one(`SELECT * FROM case_import_editions WHERE import_id=? AND edition=?`, str(importId), ed) : null;
  }
  #latestCheck(importId, edition) {
    return this.#one(`SELECT * FROM case_import_checks WHERE import_id=? AND edition=? ORDER BY rn DESC LIMIT 1`, importId, edition);
  }
  #results(rn) {
    return this.#rows(`SELECT * FROM case_import_results WHERE check_rn=? ORDER BY ord`, rn).map((r) => ({
      finding: r.finding, role: r.role ?? null, result: r.result, missing: parse(r.missing, []), differs: parse(r.differs, []),
      pair: r.pair === null ? null : parse(r.pair), published: r.published === null ? null : parse(r.published) }));
  }
  /* The latest recreation's result per finding, by id. */
  #resultsOf(importId, edition) {
    const c = this.#latestCheck(importId, edition);
    return c ? this.#results(c.rn) : [];
  }

  /* R3: the latest recreation, as recorded. */
  #recreationView(importId, edition) {
    const c = this.#latestCheck(importId, edition);
    if (!c) return null;
    const answer = parse(c.answer, {});
    return { check: Number(c.rn), cause: c.cause, document: c.document_sha ?? null, checked_at: c.checked_at,
             checker: parse(c.checker, {}), statement: str(answer.statement) ?? STATEMENT,
             ...(answer.unread ? { unread: answer.unread } : {}), findings: this.#results(c.rn).map(({ published, ...r }) => r) };
  }

  /* R6, R9: each acceptance of the edition in force (not withdrawn), oldest first. */
  #acceptancesInForce(importId, edition) {
    const withdrawn = new Set(this.#rows(`SELECT acceptances FROM case_import_withdrawals WHERE import_id=? AND edition=?`, importId, edition)
      .flatMap((w) => parse(w.acceptances, [])));
    return this.#rows(`SELECT * FROM case_import_acceptances WHERE import_id=? AND edition=? ORDER BY rn`, importId, edition)
      .filter((a) => !withdrawn.has(idOf("acceptance", a.rn)));
  }
  /* R9: the acceptance in force for one finding: the latest naming it. */
  #acceptanceFor(importId, edition, finding) {
    const a = this.#acceptancesInForce(importId, edition).filter((x) => parse(x.findings, []).includes(finding)).pop();
    if (!a) return null;
    const gaps = parse(a.gaps, {});
    return { acceptance: idOf("acceptance", a.rn), by: a.by_member, at: a.at, reason: a.reason, checked: a.checked,
             gaps: Array.isArray(gaps[finding]) ? gaps[finding] : [] };
  }
  /* R8, R9: the open flags on an edition, the edition's own and its findings', oldest first. */
  #openFlags(importId, edition) {
    return this.#rows(`SELECT f.* FROM case_import_flags f LEFT JOIN case_import_clears c ON c.flag_rn = f.rn
                        WHERE f.import_id=? AND f.edition=? AND c.flag_rn IS NULL ORDER BY f.rn`, importId, edition)
      .map((f) => ({ flag: idOf("flag", f.rn), finding: f.finding ?? null, issue: f.issue, by: f.by_member, at: f.at }));
  }

  /* ================================================================ R4: the reads */

  /** R4: every import, with its source group, case, lens and editions, each with when it was imported. A viewer who is
   *  not an active member is answered as if no import exists. Writes nothing. */
  importedCases({ viewer = null } = {}) {
    if (!this.#isActiveMember(viewer)) return { ok: true, imports: [], count: 0, wrote: false };
    const imports = this.#rows(`SELECT * FROM case_imports ORDER BY source_group, case_id, import_id`).map((i) => ({
      import: i.import_id, group: i.source_group, case: i.case_id, lens: i.lens ?? null,
      editions: this.#rows(`SELECT edition, imported_at, imported_by FROM case_import_editions WHERE import_id=? ORDER BY edition`, i.import_id)
        .map((e) => ({ edition: Number(e.edition), imported_at: e.imported_at, imported_by: e.imported_by })) }));
    return { ok: true, imports, count: imports.length, wrote: false };
  }

  /* R6–R8 and R4: an edition this import does not hold, answered the same whatever the reason. */
  #noSuchEdition(importId, edition) {
    /* DEC-49 REGION is-import-edition */
    return refuse("IMPORT_NO_SUCH_EDITION", "no imported edition answers here by that import and edition",
                  { import: str(importId), edition: int(edition) });
    /* END DEC-49 REGION is-import-edition */
  }
  #editionRefusal(importId, edition) {
    const e = this.#edition(importId, edition);
    return e ? { e } : { refusal: this.#noSuchEdition(importId, edition) };
  }

  /** R4: one import's editions, and the latest (or the one named) in full: each finding's role, result, what is missing
   *  or differs and its recomputed pair; the source's bar labelled as the source's; each finding against this group's
   *  own bar; its origin mark facts; and the checker's statement. A viewer who is not an active member, an import not
   *  held and an edition not held are answered alike. Writes nothing. */
  importedCase({ import: importId = null, edition = null, viewer = null } = {}) {
    const i = this.#isActiveMember(viewer) ? this.#import(importId) : null;
    const editions = i ? this.#rows(`SELECT edition, imported_at, imported_by FROM case_import_editions WHERE import_id=? ORDER BY edition`,
                                    i.import_id).map((e) => ({ edition: Number(e.edition), imported_at: e.imported_at, imported_by: e.imported_by }))
      : [];
    const named = edition === null || edition === undefined || edition === "" ? (editions.length ? editions[editions.length - 1].edition : null)
      : int(edition);
    const e = i && named ? this.#edition(i.import_id, named) : null;
    if (!e) return this.#noSuchEdition(importId, edition);
    return { ok: true, import: i.import_id, group: i.source_group, case: i.case_id, lens: i.lens ?? null, editions,
             edition: this.#editionView(i, e), wrote: false };
  }

  /* R4: one edition in full. */
  #editionView(i, e) {
    const ed = Number(e.edition);
    const rec = this.#recreationView(i.import_id, ed);
    const lastAnswer = parse(this.#latestCheck(i.import_id, ed)?.answer, {});
    const own = this.#ownBar();
    const flags = this.#openFlags(i.import_id, ed);
    const verified = signatureVerified(lastAnswer);
    const sourceBar = e.source_bar ? parse(e.source_bar) : null;
    const findings = (rec ? rec.findings : []).map((f) => ({
      ...f,
      ref: importedFindingRef(i.import_id, f.finding),
      against_own_bar: againstBar(f.role, f.pair, own.bar),
      origin: {
        another_groups: { group: i.source_group, case: i.case_id, edition: ed, signature_verified: verified },
        acceptance: this.#acceptanceFor(i.import_id, ed, f.finding),
        flags: flags.filter((x) => x.finding === null || x.finding === f.finding),
      },
    }));
    return {
      edition: ed, manifest_sha: e.manifest_sha, format: e.format ?? null, case_document_sha: e.case_doc_sha ?? null,
      imported_at: e.imported_at, imported_by: e.imported_by,
      checked_at: rec ? rec.checked_at : null, checker: rec ? rec.checker : null, ...(rec && rec.unread ? { unread: rec.unread } : {}),
      statement: rec ? rec.statement : STATEMENT,
      source_bar: { whose: "source", label: SOURCE_BAR, group: i.source_group, stated: sourceBar,
                    bar: barAxes(sourceBar) },
      own_bar: own,
      documents: this.#rows(`SELECT sha, bytes, by_member, at FROM case_import_documents WHERE import_id=? AND edition=? ORDER BY at, sha`,
                            i.import_id, ed).map((d) => ({ sha: d.sha, bytes: Number(d.bytes), by: d.by_member, at: d.at })),
      findings,
      flags,
    };
  }

  /* R4 (K1134 reading 3): this group's own bar, the group default (`strength` R16, no project), or that none is set. */
  #ownBar() {
    const r = this.#call(() => this.strength.strengthBarOf({}));
    const bar = r && r.ok && isObj(r.bar) ? barAxes(r.bar) : null;
    return bar ? { whose: "this_group", group: r.group ?? null, bar, set: true }
      : { whose: "this_group", group: r && r.ok ? r.group ?? null : null, bar: null, set: false, stated: NO_OWN_BAR };
  }

  /* ================================================================ R5: completion */

  /** R5: stores a document whose SHA-256 matches a material the edition records as missing, and checks every finding of
   *  the edition again. Nothing else about the edition changes. */
  completeImportedDocument({ import: importId = null, edition = null, bytes = null, by = null, viewer = null } = {}) {
    const k = this.#callerRefusal({ by, viewer });
    if (k.refusal) return k.refusal;
    const b = bytesOf(bytes);
    const sha = b ? shaOf(b) : null;
    const e = this.#edition(importId, edition);
    const missing = new Set();
    if (e) for (const r of this.#resultsOf(e.import_id, Number(e.edition))) for (const m of r.missing) fingerprintsOf(m, missing);
    /* DEC-49 REGION is-import-document */
    if (!b || !e || !missing.has(sha))
      return refuse("IMPORT_DOCUMENT_NOT_MISSING", "the bytes match no material this imported edition records as missing",
                    { import: str(importId), edition: int(edition), fingerprint: sha });
    /* END DEC-49 REGION is-import-document */
    const ed = Number(e.edition);
    const at = this.#stamp();
    const parts = this.#parts(e.import_id, ed);
    const answer = this.#recreate(parts, [...this.#documents(e.import_id, ed), b]);
    const published = this.#publishedPairs(this.#heldFiles(e.import_id, ed));
    const out = this.record.transact(() => {
      this.#putBlob(sha, b);
      if (!this.#one(`SELECT 1 AS x FROM case_import_documents WHERE import_id=? AND edition=? AND sha=?`, e.import_id, ed, sha))
        this.sql.exec(`INSERT INTO case_import_documents (import_id, edition, sha, bytes, by_member, at) VALUES (?,?,?,?,?,?)`,
                      e.import_id, ed, sha, b.length, k.member, at);
      this.#recordCheck(e.import_id, ed, answer, { cause: "completion", document: sha, by: k.member, at, published });
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, import: e.import_id, edition: ed, document: sha, bytes: b.length, completed_by: k.member, at,
             recreation: this.#recreationView(e.import_id, ed) };
  }

  /* ================================================================ R6, R7: acceptance and its withdrawal */

  /** R6: records the acceptance of one edition for the named findings, each recreated, or recreated in part with every
   *  gap stated in the member's words. It changes no grade. */
  acceptImported({ import: importId = null, edition = null, findings = null, checked = null, reason = null, gaps = null,
                   by = null, viewer = null } = {}) {
    const k = this.#callerRefusal({ by, viewer });
    if (k.refusal) return k.refusal;
    const er = this.#editionRefusal(importId, edition);
    if (er.refusal) return er.refusal;
    const { e } = er;
    const ed = Number(e.edition);
    /* DEC-49 REGION is-import-accept */
    if (!words(checked) || !words(reason))
      return refuse("IMPORT_ACCEPT_NO_REASON", `what was checked and the reason are each 1 to ${WORDS_MAX} characters`,
                    { missing: [!words(checked) ? "checked" : null, !words(reason) ? "reason" : null].filter(Boolean) });
    /* END DEC-49 REGION is-import-accept */
    const asked = (typeof findings === "string" ? (findings.trim().startsWith("[") ? parse(findings, null) : [findings]) : findings);
    const named = Array.isArray(asked) ? [...new Set(asked.map((f) => (typeof f === "string" ? f.trim() : f)))] : [];
    const results = new Map(this.#resultsOf(e.import_id, ed).map((r) => [r.finding, r]));
    const unknown = named.filter((f) => typeof f !== "string" || !results.has(f));
    /* DEC-49 REGION is-import-edition */
    if (!named.length || unknown.length)
      return refuse("IMPORT_NO_SUCH_FINDING", named.length ? "a finding named is not one of this edition's" : "no finding is named",
                    { import: e.import_id, edition: ed, findings: unknown.map((f) => (typeof f === "string" ? f : null)) });
    /* END DEC-49 REGION is-import-edition */
    const stated = isObj(gaps) ? gaps : typeof gaps === "string" ? parse(gaps, {}) : {};
    const notRecreated = named.filter((f) => results.get(f).result === "did_not_recreate");
    /* DEC-49 REGION is-import-accept */
    if (notRecreated.length)
      return refuse("IMPORT_ACCEPT_NOT_RECREATED", "only a finding that recreated, wholly or in part, is accepted",
                    { import: e.import_id, edition: ed, findings: notRecreated });
    const unstated = [];
    for (const f of named) {
      const r = results.get(f);
      if (r.result !== "recreated_in_part") continue;
      const said = Array.isArray(stated[f]) ? stated[f] : [];
      r.missing.forEach((m, i) => { if (!words(said[i])) unstated.push({ finding: f, entry: i, missing: m }); });
    }
    if (unstated.length)
      return refuse("IMPORT_ACCEPT_GAPS_UNSTATED", "each missing entry of a finding recreated in part is stated in the member's words, "
        + "in order", { import: e.import_id, edition: ed, unstated });
    /* END DEC-49 REGION is-import-accept */
    const kept = {};
    for (const f of named) if (results.get(f).result === "recreated_in_part") kept[f] = stated[f].slice(0, results.get(f).missing.length).map((s) => s.trim());
    const at = this.#stamp();
    let rn = null;
    const out = this.record.transact(() => {
      this.sql.exec(`INSERT INTO case_import_acceptances (import_id, edition, findings, checked, reason, gaps, by_member, at)
                     VALUES (?,?,?,?,?,?,?,?)`, e.import_id, ed, canonicalJson(named), checked.trim(), reason.trim(), canonicalJson(kept),
                    k.member, at);
      rn = Number(this.#one(`SELECT MAX(rn) AS rn FROM case_import_acceptances`).rn);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, acceptance: idOf("acceptance", rn), import: e.import_id, edition: ed, by: k.member, at,
             checked: checked.trim(), reason: reason.trim(), gaps: kept,
             findings: named.map((f) => ({ finding: f, ref: importedFindingRef(e.import_id, f), result: results.get(f).result })),
             grades: "unchanged: the edition's grades stand as published" };
  }

  /** R7: withdraws every acceptance of the edition in force, with a reason; each stays in the history. After the
   *  withdrawal commits, `reevaluation` is told (its R31), and its answer is carried as `reevaluation`. */
  withdrawAcceptance({ import: importId = null, edition = null, reason = null, by = null, viewer = null } = {}) {
    const k = this.#callerRefusal({ by, viewer });
    if (k.refusal) return k.refusal;
    const er = this.#editionRefusal(importId, edition);
    if (er.refusal) return er.refusal;
    const { e } = er;
    const ed = Number(e.edition);
    /* DEC-49 REGION is-import-withdraw */
    if (!words(reason))
      return refuse("IMPORT_ACCEPT_NO_REASON", `the reason for withdrawing is 1 to ${WORDS_MAX} characters`, { missing: ["reason"] });
    if (!this.#acceptancesInForce(e.import_id, ed).length)
      return refuse("IMPORT_NOTHING_ACCEPTED", "no acceptance of this edition is in force", { import: e.import_id, edition: ed });
    /* END DEC-49 REGION is-import-withdraw */
    const at = this.#stamp();
    let rn = null, ids = [], refs = [];
    const out = this.record.transact(() => {
      const live = this.#acceptancesInForce(e.import_id, ed);
      if (!live.length) return refuse("IMPORT_NOTHING_ACCEPTED", "the acceptance was withdrawn meanwhile", { import: e.import_id, edition: ed });
      ids = live.map((a) => idOf("acceptance", a.rn));
      refs = [...new Set(live.flatMap((a) => parse(a.findings, [])))].sort()
        .map((f) => importedFindingRef(e.import_id, f)).filter(Boolean);
      this.sql.exec(`INSERT INTO case_import_withdrawals (import_id, edition, acceptances, refs, reason, by_member, at) VALUES (?,?,?,?,?,?,?)`,
                    e.import_id, ed, canonicalJson(ids), canonicalJson(refs), reason.trim(), k.member, at);
      rn = Number(this.#one(`SELECT MAX(rn) AS rn FROM case_import_withdrawals`).rn);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    const withdrawal = idOf("withdrawal", rn);
    let told;
    try {
      told = this.reevaluation.acceptanceWithdrawn({ withdrawal });
    } catch (err) {
      told = { ok: false, told: false, listeners_failed: [{ module: "reevaluation",
        error: String(err && err.message ? err.message : err).slice(0, 200) }] };
    }
    return { ok: true, withdrawal, import: e.import_id, edition: ed, acceptances: ids, refs, reason: reason.trim(), by: k.member, at,
             reevaluation: told ?? { ok: false, told: false } };
  }

  /* ================================================================ R8: flags */

  /* R8's refusals after R1's: the issue or reason, then the edition and the finding. */
  #flagRefusal(text, what) {
    /* DEC-49 REGION is-import-flag */
    if (!words(text)) return refuse("IMPORT_FLAG_NO_ISSUE", `${what} is 1 to ${WORDS_MAX} characters`);
    /* END DEC-49 REGION is-import-flag */
    return null;
  }

  /** R8: a member's flag on an edition, or on one of its findings, naming the specific issue. */
  flagImported({ import: importId = null, edition = null, finding = null, issue = null, by = null, viewer = null } = {}) {
    const k = this.#callerRefusal({ by, viewer });
    if (k.refusal) return k.refusal;
    const fr = this.#flagRefusal(issue, "the issue");
    if (fr) return fr;
    const er = this.#editionRefusal(importId, edition);
    if (er.refusal) return er.refusal;
    const { e } = er;
    const ed = Number(e.edition);
    const f = finding === null || finding === undefined || finding === "" ? null : str(finding);
    /* DEC-49 REGION is-import-edition */
    if ((finding !== null && finding !== undefined && finding !== "" && !f)
        || (f && !this.#resultsOf(e.import_id, ed).some((r) => r.finding === f)))
      return refuse("IMPORT_NO_SUCH_FINDING", "the finding named is not one of this edition's",
                    { import: e.import_id, edition: ed, findings: [typeof finding === "string" ? finding : null] });
    /* END DEC-49 REGION is-import-edition */
    const at = this.#stamp();
    let rn = null;
    const out = this.record.transact(() => {
      this.sql.exec(`INSERT INTO case_import_flags (import_id, edition, finding, issue, by_member, at) VALUES (?,?,?,?,?,?)`,
                    e.import_id, ed, f, issue.trim(), k.member, at);
      rn = Number(this.#one(`SELECT MAX(rn) AS rn FROM case_import_flags`).rn);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, flag: idOf("flag", rn), import: e.import_id, edition: ed, finding: f, issue: issue.trim(), by: k.member, at };
  }

  /** R8: clears an open flag with a reason; the flag stays in the history. */
  clearFlag({ flag = null, reason = null, by = null, viewer = null } = {}) {
    const k = this.#callerRefusal({ by, viewer });
    if (k.refusal) return k.refusal;
    const fr = this.#flagRefusal(reason, "the reason for clearing");
    if (fr) return fr;
    const rn = rnOf("flag", flag);
    const open = () => (rn ? this.#one(`SELECT f.* FROM case_import_flags f LEFT JOIN case_import_clears c ON c.flag_rn = f.rn
                                         WHERE f.rn=? AND c.flag_rn IS NULL`, rn) : null);
    const notOpen = () => {
      /* DEC-49 REGION is-import-flag */
      return refuse("IMPORT_FLAG_NOT_OPEN", "no open flag answers by that id", { flag: str(flag) });
      /* END DEC-49 REGION is-import-flag */
    };
    const f = open();
    if (!f) return notOpen();
    const at = this.#stamp();
    const out = this.record.transact(() => {
      if (!open()) return notOpen();
      this.sql.exec(`INSERT INTO case_import_clears (flag_rn, reason, by_member, at) VALUES (?,?,?,?)`, rn, reason.trim(), k.member, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, flag: idOf("flag", rn), import: f.import_id, edition: Number(f.edition), finding: f.finding ?? null,
             cleared: { reason: reason.trim(), by: k.member, at } };
  }

  /* ================================================================ R9: the services for later modules */

  /** R9: the acceptance in force for one finding of an edition (who, when, why, what was checked, the gaps), or null.
   *  Read as the plane. Writes nothing and never throws. */
  acceptanceOf({ import: importId = null, edition = null, finding = null } = {}) {
    try {
      const e = this.#edition(importId, edition);
      const f = str(finding);
      return e && f ? this.#acceptanceFor(e.import_id, Number(e.edition), f) : null;
    } catch { return null; }
  }

  /** R9: the open flags on an edition, the edition's own and its findings', each with its issue; `complete: false` when
   *  they could not be read. Read as the plane. Writes nothing and never throws. */
  openFlagsOn({ import: importId = null, edition = null } = {}) {
    try {
      const e = this.#edition(importId, edition);
      return { flags: e ? this.#openFlags(e.import_id, Number(e.edition)) : [], complete: true };
    } catch { return { flags: [], complete: false }; }
  }

  /* ================================================================ R16: the registration with accepted-work */

  /** R16 (`accepted-work` R1's `finding`): one imported finding at one edition, with its published pair and the
   *  acceptance in force, or null when it is not held there or the viewer may not see the import. */
  findingFacts({ ref = null, edition = null, viewer = null } = {}) {
    if (!this.#sees(viewer)) return null;
    const p = typeof ref === "string" ? parseImportedFindingRef(ref.trim()) : null;
    if (!p || !Number.isInteger(edition) || edition < 1) return null;
    const i = this.#import(p.import);
    const e = i ? this.#edition(i.import_id, edition) : null;
    const r = e ? this.#resultsOf(i.import_id, edition).find((x) => x.finding === p.finding) : null;
    if (!r) return null;
    const a = this.#acceptanceFor(i.import_id, edition, p.finding);
    return { ref: ref.trim(), import: i.import_id, group: i.source_group, case: i.case_id, edition, finding: p.finding,
             manifest_sha: e.manifest_sha, result: r.result, pair: r.published ?? r.pair ?? null,
             acceptance: a ? { by: a.by, at: a.at, reason: a.reason, checked: a.checked, gaps: a.gaps } : null };
  }

  /** R16 (`accepted-work` R1's `openFlags`): the open flags on the edition a ref names, the edition's own and the named
   *  finding's; null when the viewer may not see the import. */
  openFlagsFacts({ ref = null, edition = null, viewer = null } = {}) {
    if (!this.#sees(viewer)) return null;
    const p = typeof ref === "string" ? parseImportedFindingRef(ref.trim()) : null;
    const e = p && Number.isInteger(edition) ? this.#edition(p.import, edition) : null;
    const flags = e ? this.#openFlags(e.import_id, edition).filter((f) => f.finding === null || f.finding === p.finding)
      .map(({ flag, finding, issue, at }) => ({ flag, finding, issue, at })) : [];
    return { flags, complete: true };
  }

  /** R16 (`accepted-work` R1's `withdrawals`): the withdrawals of acceptances, in withdrawal order after `after`, at most
   *  `limit` (1 to 1,000, default 200), with `cursor` the last one listed when more follow. Read as the plane. */
  withdrawals({ after = null, limit = null } = {}) {
    const n = int(limit);
    const cap = Math.min(n ?? WITHDRAWALS_PAGE, WITHDRAWALS_PAGE_MAX);
    const from = rnOf("withdrawal", after) ?? 0;
    const rows = this.#rows(`SELECT * FROM case_import_withdrawals WHERE rn > ? ORDER BY rn LIMIT ?`, from, cap + 1);
    const more = rows.length > cap;
    if (more) rows.length = cap;
    return { withdrawals: rows.map((w) => ({ withdrawal: idOf("withdrawal", w.rn), import: w.import_id, edition: Number(w.edition),
                                             refs: parse(w.refs, []), at: w.at })),
             cursor: more ? idOf("withdrawal", rows[rows.length - 1].rn) : null };
  }

  /** R16: fills `accepted-work`'s registration (its R1) once, each function synchronous; the answer is kept. */
  start() {
    if (this.registration) return this.registration;
    this.registration = this.#call(() => this.acceptedWork.registerAcceptedWork("case-import", {
      finding: (q) => this.findingFacts(q || {}),
      openFlags: (q) => this.openFlagsFacts(q || {}),
      withdrawals: (q) => this.withdrawals(q || {}) }), { ok: false, reason: "REGISTRATION_FAILED" });
    return this.registration;
  }
}

/* The member acts and reads answer their own refusals with code, check and translation (DEC-49). */
for (const m of ["importCaseFile", "importedCase", "completeImportedDocument", "acceptImported", "withdrawAcceptance",
                 "flagImported", "clearFlag"]) {
  const fn = CaseImport.prototype[m];
  CaseImport.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it creates and declares its tables (whole store only, R13), registers
 *  its figures, and fills accepted-work's registration (R16). */
export function caseImportOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    c = new CaseImport({ ...d, host, storage, record, membership, env: d.env ?? host.env ?? null });
    instances.set(host, c);
    c.migrate();
    c.purgeDeclaration = record.declarePurge("case-import", CASE_IMPORT_TABLES.map((name) => ({ name, keys: [] })));
    c.countsRegistration = record.registerCounts("case-import",
      ["caseImports", "caseImportEditions", "caseImportAcceptances", "caseImportFlags"], () => {
        const n = (t) => Number([...storage.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)][0].n);
        return { caseImports: n("case_imports"), caseImportEditions: n("case_import_editions"),
                 caseImportAcceptances: n("case_import_acceptances"), caseImportFlags: n("case_import_flags") };
      });
    c.start();
  }
  return c;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function caseImportOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CASE_IMPORT_TABLES.includes(name);
}

/** The module's eight member ops: `by` and `viewer` are the control plane's stamps, read from the query, never the
 *  body. `op-declarations` declares them, `control-plane` routes them and `plane` composes them (L11). Bytes arrive in
 *  the body as base64 text (`parts`, a list; `bytes`). */
export function caseImportOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const pick = (k) => (b[k] !== undefined && b[k] !== null ? b[k] : url.searchParams.has(k) ? q(k) : null);
  const by = q("by") ?? q("author"), viewer = q("viewer");
  return {
    caseimport: () => m.importCaseFile({ parts: Array.isArray(b.parts) ? b.parts : null, by, viewer }),
    importedcases: () => m.importedCases({ viewer }),
    importedcase: () => m.importedCase({ import: q("import"), edition: q("edition"), viewer }),
    caseimportdocument: () => m.completeImportedDocument({ import: pick("import"), edition: pick("edition"),
      bytes: b.bytes ?? null, by, viewer }),
    importaccept: () => m.acceptImported({ import: pick("import"), edition: pick("edition"), findings: pick("findings"),
      checked: pick("checked"), reason: pick("reason"), gaps: pick("gaps"), by, viewer }),
    importacceptwithdraw: () => m.withdrawAcceptance({ import: pick("import"), edition: pick("edition"), reason: pick("reason"),
      by, viewer }),
    importflag: () => m.flagImported({ import: pick("import"), edition: pick("edition"), finding: pick("finding"),
      issue: pick("issue"), by, viewer }),
    importflagclear: () => m.clearFlag({ flag: pick("flag"), reason: pick("reason"), by, viewer }),
  };
}
