/* acquisition — ARCHIVES: OPENED ON CAPTURE, EACH FILE AT ITS ARCHIVE'S GRADE (R38–R41, R43, with R20, R25–R27, R29;
 * N688, K1844, K1852, K1881, K1888, K1940; `build/plan/draft-zip-architecture.md`).
 *
 * A file inside a captured archive is PART of it, not derived from it (K1852 (1)): cut out unambiguously, exactly as the
 * archive holds it and verified by size and CRC-32 (ooxml R29), it is its own capture, stored under its own digest, and
 * carries its archive's grade and co-attestation unchanged (provenance R59, attestation R7); otherwise it is NOT FILED,
 * by name, and never filed at a lower letter. Archives open on capture within published limits (K1852 (2)), each
 * file held for review beside its archive (Intake §4). Nothing here writes a bundle, a register row or a file of the
 * record (R25): the act stores bytes, writes its receipts and its own record of each entry's outcome, and answers the
 * files' documents for the caller to promote.
 *
 * Its record lives in this module's own two tables, declared through record-core's `declareTable` (its R21) by the
 * instance `acquisitionOf` makes for a storage: `archive_entries` (one row per entry an archive's listing holds, and
 * the archive's own row at index -1) and `unpack_days` (the automatic budget's count for each UTC day). The capture
 * store handed in (`capture`'s) reaches it as `store.acquisition`, as it reaches attestation's instance.
 *
 * Every refusal is an answer `{ok: false, reason, code, check, translation, ...}`, never a throw. */
import { hasZipMagic, listArchive, streamMember, ARCHIVE_LIMITS, ARCHIVE_DEPTH_MAX, ARCHIVE_TREE_TOTAL_MAX, ARCHIVE_TREE_ENTRIES_MAX,
         normalizePartName, CONTENT_TYPES_PART, ODF_MIMETYPE_PART } from "../ooxml.mjs";
import { createSha256, isMachineIdentity } from "../record-grammar/index.mjs";
import { partsHeld, UNPACKED_VIA, provenanceOf } from "../provenance/index.mjs";
import { viewerPredicate, notAnAdmin, membershipOf } from "../membership/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { detectFormat } from "../formats.mjs";
import { ARCHIVE_CHECKS, firstHopWho } from "./checks.mjs";
import { profileOf, profileView, evidenceStorageAbsent } from "./index.mjs";
import { word, localize } from "../setup-words/index.mjs";

/* R40: one call's share, and the day's for automatic opening, each exported by its name (K1940: BOB's, K1881). The
   per-call figures keep one call within the plane's subrequest and CPU limits: every part stored is a write. */
export const UNPACK_CALL_ENTRIES = 100;
export const UNPACK_CALL_BYTES = 67108864;          // 64 MiB, declared uncompressed
export const UNPACK_DAILY_BYTES = 1073741824;       // 1 GiB, declared uncompressed, each UTC day
export const UNPACK_DAILY_ENTRIES = 40000;
export const UNPACK_LIMITS = Object.freeze({ UNPACK_CALL_ENTRIES, UNPACK_CALL_BYTES, UNPACK_DAILY_BYTES, UNPACK_DAILY_ENTRIES });

/* R48 (T50; N1104; CAPTURE #32, K3345): the most reads of the evidence store (each `head`, `get` or range read counting one)
   R41's decision on a held capture never opened costs: ARCHIVE_NOT_HELD, then NOT_AN_ARCHIVE by R17's rule, before any
   listing. Measured at this job's START (4.33 a capture over a mixed set of plain files and archives; four for a plain or an
   office file and five for an archive with its listing): a head to learn the object is there and one read of its bytes,
   which both verifies the part (provenance R7) and is the bytes R17's rule judges, so no object is read twice. This is the
   figure for a capture held whole; one held in parts costs a head of the whole key, then a head of each part and, where the
   store gives no stored checksum to verify it by, a read of each part, none twice (BOB's reading, recorded in the job record). */
export const ARCHIVE_CHECK_READS = 2;

/** R48: the evidence store as one decision reads it: a `head` asked twice is answered once, and the bytes of an object
 *  (`get`, one part at most 8 MiB) are read once, the first read and the last two kept (the first part is asked again for
 *  the ZIP magic after every other part has been verified), so verifying a part (provenance R7), profiling the
 *  capture (R17) and listing it (ooxml R27) share one read of each. Only `head` and `get` are passed on; it holds nothing
 *  beyond the call that made it; `put` is passed on. */
export function readThrough(ev) {
  const heads = new Map();
  const kept = [];   // [{key, buf}], the first read and the two most recently read
  return {
    async head(key) {
      if (heads.has(key)) return heads.get(key);
      const h = await ev.head(key);
      heads.set(key, h);
      return h;
    },
    async get(key, options) {
      /* R88 (record-core): a ranged look is the store's, never cached as the whole */
      const hit = kept.find((k) => k.key === key);
      if (options && options.range && !hit) return ev.get(key, options);
      if (options && options.range) { const r = options.range, b = hit.buf.slice(r.offset, r.offset + r.length); return { key, size: hit.buf.byteLength, arrayBuffer: async () => b }; }
      if (hit) return { key, size: hit.buf.byteLength, arrayBuffer: async () => hit.buf };
      const o = await ev.get(key);
      if (!o) return o;
      const buf = await o.arrayBuffer();
      if (buf.byteLength <= PART) { kept.push({ key, buf }); if (kept.length > 3) kept.splice(1, 1); }
      return { key, size: buf.byteLength, ...(o.checksums ? { checksums: o.checksums } : {}), arrayBuffer: async () => buf };
    },
    /* a write goes straight through, and what was asked about the key before it is asked again */
    async put(key, bytes, opts) { heads.delete(key); return ev.put(key, bytes, opts); },
    /* R121: the store's own way to make a whole from stored parts, when it offers one */
    ...(typeof ev.putFromParts === "function" ? { putFromParts: (...a) => { heads.delete(a[0]); return ev.putFromParts(...a); } } : {}),
  };
}

/* R107: the most captures an instance remembers as no archive. CHOSEN: a digest and two short words each. */
const NOT_ARCHIVES_MAX = 20000;

/* R38's form of a stored file: parts of 8 MiB, each under its own SHA-256, as R10 stores a fetched one. */
const PART = 8 * 1024 * 1024;
/* R41: a page of entries. */
const LIST_DEFAULT = 200, LIST_MAX = 1000;
/* R38: a symlink's target is the archive's claim, read only when it is small; never followed. */
const LINK_TARGET_MAX = 4096;

/* R122 (2): the most times a filed member's document is offered to its caller to find a home (the first filing's included), then it is stated final.
   CHOSEN: BOB's ruling (P17), fix round 9. */
export const REOFFER_MAX = 3;
const NOT_PROMOTED = "NOT_PROMOTED";

const HEX64 = /^[0-9a-f]{64}$/;
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const shaOf = (v) => (typeof v === "string" && HEX64.test(v.toLowerCase()) ? v.toLowerCase() : null);
const json = (v) => { try { return v == null ? null : JSON.parse(v); } catch { return null; } };

/* The every limit and budget this act names, with its figure. */
const FIGURES = Object.freeze({ ...ARCHIVE_LIMITS, ...UNPACK_LIMITS });

/** R29: a refusal or a not-filed entry with its row. `limit` is a limit's figure, never in the words. */
function rowed(code, extra = {}) {
  const row = ARCHIVE_CHECKS[code];
  const limit = Object.prototype.hasOwnProperty.call(FIGURES, code) ? { limit: FIGURES[code] } : {};
  return row ? { reason: code, code, check: row.check, translation: row.translation, ...limit, ...extra }
             : { reason: code, code, ...limit, ...extra };
}
const refuse = (code, extra = {}) => ({ ok: false, ...rowed(code, extra) });

/* R38: the verdicts ooxml's listing answers (its R28) that are listed and never cut, each its own name here. */
const NOT_CUT = Object.freeze(["MEMBER_ENCRYPTED", "MEMBER_METHOD_UNSUPPORTED", "MEMBER_AMBIGUOUS", "MEMBER_MAX", "ARCHIVE_RATIO_MAX"]);

/* R39: the media type of what format-registry finds in a file's own bytes. No response exists for a file cut out of
   an archive, so no header is read or invented: the type is the bytes', or absent. */
const FORMAT_MEDIA_TYPES = Object.freeze({
  html: "text/html", pdf: "application/pdf", csv: "text/csv", zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text", ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
});

/* ======================================================================= *
 * The stored bytes as one range source (ooxml R27, R29): the archive is never held whole in memory; each read takes
 * the parts it spans, keeping the last two read, so the listing's scattered reads and the cut's sequential ones stay
 * at one or two parts resident.
 * ======================================================================= */
export function partsSource(ev, parts) {
  const starts = [];
  let size = 0;
  for (const p of parts) { starts.push(size); size += p.bytes; }
  const cache = new Map();
  const load = async (i) => {
    if (cache.has(i)) return cache.get(i);
    const o = await ev.get(parts[i].sha256);
    if (!o) throw new Error("a part is no longer held");
    const b = new Uint8Array(await o.arrayBuffer());
    if (b.length !== parts[i].bytes) throw new Error("a part's size changed");
    if (cache.size >= 2) cache.delete(cache.keys().next().value);
    cache.set(i, b);
    return b;
  };
  return {
    size,
    async read(offset, length) {
      if (!(offset >= 0 && length >= 0 && offset + length <= size)) throw new Error("out of range");
      const out = new Uint8Array(length);
      let at = 0;
      while (at < length) {
        const pos = offset + at;
        let i = starts.length - 1;
        while (i > 0 && starts[i] > pos) i--;
        const b = await load(i);
        const from = pos - starts[i], take = Math.min(b.length - from, length - at);
        out.set(b.subarray(from, from + take), at);
        at += take;
      }
      return out;
    },
  };
}

/* R121: a store failure that may pass (a put, a head, the making of the whole) is thrown tagged, so the caller leaves the entry with no outcome */
const storeFailed = (e) => { const x = e instanceof Error ? e : new Error(String(e)); x.storeFailure = true; return x; };

/** R38, R121: a file's bytes, as `streamMember` yields them, hashed as they pass and stored in parts of 8 MiB, each under its
 *  own SHA-256 (R10's form). Answers `{sha256, bytes, parts}`; a part already held is not written again. A file of more than
 *  one part is also kept whole under its own digest (`putFromParts`, as R96 keeps a capture) when the store offers it. A store
 *  failure is thrown tagged `storeFailure`. */
async function storeChunks(ev, chunks) {
  const whole = createSha256();
  const parts = [];
  let held = [], heldBytes = 0, total = 0;
  const flush = async (all) => {
    while (heldBytes >= PART || (all && heldBytes > 0)) {
      const n = Math.min(PART, heldBytes);
      const buf = new Uint8Array(n);
      let at = 0;
      while (at < n) {
        const c = held[0], take = Math.min(c.length, n - at);
        buf.set(c.subarray(0, take), at); at += take;
        if (take === c.length) held.shift(); else held[0] = c.subarray(take);
      }
      heldBytes -= n;
      const psha = hex(await crypto.subtle.digest("SHA-256", buf));
      try { if (!(await ev.head(psha))) await ev.put(psha, buf); } catch (e) { throw storeFailed(e); }
      parts.push({ sha256: psha, bytes: n });
    }
  };
  for await (const c of chunks) {
    whole.update(c); total += c.length;
    held.push(c); heldBytes += c.length;
    if (heldBytes >= PART) await flush(false);
  }
  await flush(true);
  /* an empty file is held under the empty digest, as any capture would be */
  if (!parts.length) {
    const e = new Uint8Array(0), esha = hex(await crypto.subtle.digest("SHA-256", e));
    try { if (!(await ev.head(esha))) await ev.put(esha, e); } catch (x) { throw storeFailed(x); }
    parts.push({ sha256: esha, bytes: 0 });
  }
  const sha256 = whole.hex();
  if (parts.length > 1 && typeof ev.putFromParts === "function") {
    let kept = null;
    try { if (!(await ev.head(sha256))) kept = await ev.putFromParts(sha256, parts.map((p) => p.sha256)); else kept = { ok: true }; } catch (e) { throw storeFailed(e); }
    if (!(kept && kept.ok === true)) throw storeFailed(new Error("the store would not make the whole from its parts"));
  }
  return { sha256, bytes: total, parts };
}

/* ======================================================================= *
 * The instance: this module's two tables for one storage (R38, R40, R41) and the group's co-archive setting (R43).
 * ======================================================================= */

/* R21 (record-core): the classes of each table, declared once at start (Suggestions, T35-21). `archive_entries` is
   cleared by the whole-store purge only: its rows are keyed to an archive's digest, and the archive's home is the
   register's, so no bundle column is kept here (provenance's `captured_locators` is declared the same way). */
export const ACQUISITION_TABLES = Object.freeze([
  Object.freeze({ name: "archive_entries", keys: Object.freeze([]), purge: "clear", expunge: "none", export: "yes", sight: "source",
                  derive: "stored", version_chain: false }),
  Object.freeze({ name: "unpack_days", purge: "exempt", expunge: "none", export: "never", sight: "group", derive: "stored",
                  version_chain: false }),
]);
const SCHEMA = `
CREATE TABLE IF NOT EXISTS archive_entries (
  archive_sha TEXT NOT NULL, idx INTEGER NOT NULL,
  name TEXT, name_raw TEXT, name_encoding TEXT, name_shared INTEGER, path_unsafe INTEGER, kind TEXT, dos_time TEXT,
  uncompressed INTEGER, verdict TEXT,
  state TEXT NOT NULL, code TEXT, detail TEXT, limit_name TEXT, sha256 TEXT, target TEXT, at TEXT,
  depth INTEGER, root_sha TEXT, address TEXT, address_norm TEXT, origin TEXT, parts TEXT, entries INTEGER,
  declared_total INTEGER, bytes INTEGER, tree_entries INTEGER, tree_bytes INTEGER, offers INTEGER,
  PRIMARY KEY (archive_sha, idx));
CREATE INDEX IF NOT EXISTS archive_entries_sha ON archive_entries(sha256);
CREATE TABLE IF NOT EXISTS unpack_days (day TEXT PRIMARY KEY, entries INTEGER NOT NULL, bytes INTEGER NOT NULL)`;

/* R43: the setting's name in record-core's settings (its R25). */
export const CO_ARCHIVE_SETTING = "co_archive";

const instances = new WeakMap();   // host (or storage) → Acquisition
const byRecord = new WeakMap();    // record-core instance → Acquisition, so a store handed in finds it by its `core`

export class Acquisition {
  #sql; #record; #provenance; #membership;
  /* R107: the captures this instance has decided are no archive, by digest, with what the decision answered (`notAnArchive`'s arguments).
     A digest names its bytes for ever, so the decision is never stale; it is held in this instance's memory and bounded, and
     it is not a table: R41's `archiveList` is a read that writes nothing. A restarted object asks again, once for each digest. */
  #notArchives = new Map();

  constructor({ storage, record, provenance = null, membership = null }) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#provenance = provenance;
    this.#membership = membership;
  }

  migrate() {
    for (const t of SCHEMA.split(";")) if (t.trim()) this.#sql.exec(t);
    /* R122: a table made before the count of offers has no such column */
    if (!this.#rows(`PRAGMA table_info(archive_entries)`).some((c) => c.name === "offers")) this.#sql.exec(`ALTER TABLE archive_entries ADD COLUMN offers INTEGER`);
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #tx(fn) { return this.#record && typeof this.#record.transact === "function" ? this.#record.transact(fn) : fn(); }

  get record() { return this.#record; }
  get provenance() { return this.#provenance; }

  /* ---- R38's record of each entry's outcome ---- */

  header(archiveSha) { return this.#one(`SELECT * FROM archive_entries WHERE archive_sha=? AND idx=-1`, archiveSha); }
  entryRows(archiveSha) { return this.#rows(`SELECT * FROM archive_entries WHERE archive_sha=? AND idx>=0 ORDER BY idx`, archiveSha); }

  /** R38: the archive's own row and one `waiting` row per entry of its listing, written once, when it is first opened. */
  open(archiveSha, { listing, depth, root, address, addressNorm, origin, parts, bytes, at }) {
    return this.#tx(() => {
      if (this.header(archiveSha)) return { ok: true, already: true };
      this.#sql.exec(`INSERT INTO archive_entries (archive_sha, idx, state, at, depth, root_sha, address, address_norm, origin, parts,
                        entries, declared_total, bytes, tree_entries, tree_bytes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,0)`,
                     archiveSha, -1, "opened", at, depth, root, address, addressNorm, JSON.stringify(origin ?? null),
                     JSON.stringify(parts), listing.count, listing.declared_total, bytes);
      for (const e of listing.entries)
        this.#sql.exec(`INSERT INTO archive_entries (archive_sha, idx, name, name_raw, name_encoding, name_shared, path_unsafe, kind,
                          dos_time, uncompressed, verdict, state) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                       archiveSha, e.index, e.name, e.name_raw, e.name_encoding, e.name_shared, e.path_unsafe ? 1 : 0, e.kind,
                       e.dos_time, e.uncompressed, e.verdict, "waiting");
      return { ok: true };
    });
  }

  /** R38, R40: one entry's outcome, with the call's, the tree's and the day's counts it costs, in one transaction. */
  settle(archiveSha, index, { state, code = null, detail = null, sha256 = null, target = null, at, cost = null, root = null, day = null }) {
    return this.#tx(() => {
      /* R122: a file filed is offered to its caller once by this settling */
      this.#sql.exec(`UPDATE archive_entries SET state=?, code=?, detail=?, sha256=?, target=?, at=?, limit_name=NULL, offers=?
                       WHERE archive_sha=? AND idx=?`, state, code, detail, sha256, target, at, state === "filed" ? 1 : null, archiveSha, index);
      if (cost && root)
        this.#sql.exec(`UPDATE archive_entries SET tree_entries=tree_entries+1, tree_bytes=tree_bytes+? WHERE archive_sha=? AND idx=-1`,
                       cost.bytes, root);
      if (cost && day)
        this.#sql.exec(`INSERT INTO unpack_days (day, entries, bytes) VALUES (?,1,?)
                         ON CONFLICT(day) DO UPDATE SET entries=entries+1, bytes=bytes+excluded.bytes`, day, cost.bytes);
      return { ok: true };
    });
  }

  /** R40, R41: the entries still waiting, marked with the limit or budget they wait on (null: only the next call). */
  markWaiting(archiveSha, limitName) {
    return this.#tx(() => {
      this.#sql.exec(`UPDATE archive_entries SET limit_name=? WHERE archive_sha=? AND idx>=0 AND state='waiting'`, limitName, archiveSha);
      return { ok: true };
    });
  }

  /** R122 (2): the entries filed whose reason is not yet stated final, in index order, each with the offers made of its document. */
  filedRows(archiveSha) { return this.#rows(`SELECT * FROM archive_entries WHERE archive_sha=? AND idx>=0 AND state='filed' AND sha256 IS NOT NULL AND code IS NULL ORDER BY idx`, archiveSha); }
  /** R122 (2): one more offer of a filed entry's document. */
  offered(archiveSha, index) { this.#sql.exec(`UPDATE archive_entries SET offers=COALESCE(offers,1)+1 WHERE archive_sha=? AND idx=?`, archiveSha, index); return { ok: true }; }
  /** R122 (2): a filed entry whose document found no home in `REOFFER_MAX` offers, stated final with its reason on the entry. */
  final(archiveSha, index, { code, detail }) {
    this.#sql.exec(`UPDATE archive_entries SET code=?, detail=? WHERE archive_sha=? AND idx=? AND state='filed'`, code, detail, archiveSha, index);
    return { ok: true };
  }

  dayCount(day) { return this.#one(`SELECT entries, bytes FROM unpack_days WHERE day=?`, day) || { entries: 0, bytes: 0 }; }
  treeCount(root) { return this.#one(`SELECT tree_entries, tree_bytes FROM archive_entries WHERE archive_sha=? AND idx=-1`, root)
                           || { tree_entries: 0, tree_bytes: 0 }; }

  /** R38: whether the record holds these bytes as a file an archive filed (`provenance` R2's one home, read beside it). */
  filedBefore(sha) { return !!this.#one(`SELECT 1 AS x FROM archive_entries WHERE sha256=? AND idx>=0 AND state='filed' LIMIT 1`, sha); }

  /** R41: every archive a capture was filed from or found in, from R38's records; `[]` for none. Writes nothing, never
   *  throws. */
  memberOf(captureSha) {
    try {
      const s = shaOf(captureSha);
      if (!s) return [];
      return this.#rows(`SELECT archive_sha, idx FROM archive_entries WHERE sha256=? AND idx>=0 AND state IN ('filed','already_held')
                          ORDER BY archive_sha, idx`, s).map((r) => ({ archiveSha: r.archive_sha, index: r.idx }));
    } catch { return []; }
  }

  /** R107: what this instance decided of a capture that is no archive, `{format, part}`, or null when it has not decided. */
  knownNotArchive(sha) { return this.#notArchives.get(sha) ?? null; }
  rememberNotArchive(sha, decided) {
    if (!shaOf(sha)) return;
    this.#notArchives.delete(sha);
    this.#notArchives.set(sha, decided);
    if (this.#notArchives.size > NOT_ARCHIVES_MAX) this.#notArchives.delete(this.#notArchives.keys().next().value);
  }
  /** R107: which of these captures this instance has decided are no archive, one read of its memory, no store call. A set of
   *  digests. Writes nothing, never throws. */
  notArchivesAmong(captureShas) {
    const out = new Set();
    try { for (const s of Array.isArray(captureShas) ? captureShas : []) if (typeof s === "string" && this.#notArchives.has(s)) out.add(s); }
    catch { /* none is known */ }
    return out;
  }

  /** R41 (T51; C14): `memberOf` for several captures in one read: a map of each capture's digest to the archives it was filed from
   *  or found in, in `memberOf`'s order; a capture in none has no key. Writes nothing, never throws. */
  membersOf(captureShas) {
    const out = new Map();
    try {
      const shas = [...new Set((Array.isArray(captureShas) ? captureShas : []).map(shaOf).filter(Boolean))];
      if (!shas.length) return out;
      for (const r of this.#rows(`SELECT sha256, archive_sha, idx FROM archive_entries WHERE sha256 IN (SELECT value FROM json_each(?))
                                   AND idx>=0 AND state IN ('filed','already_held') ORDER BY sha256, archive_sha, idx`, JSON.stringify(shas))) {
        const list = out.get(r.sha256) || [];
        list.push({ archiveSha: r.archive_sha, index: r.idx });
        out.set(r.sha256, list);
      }
    } catch { /* none is known: the captures read as in no archive */ }
    return out;
  }

  /** R41 (T51; C14): which of these captures this module recorded opening as an archive (it holds the archive's own row), one read.
   *  A set of digests. Writes nothing, never throws. */
  openedAmong(captureShas) {
    const out = new Set();
    try {
      const shas = [...new Set((Array.isArray(captureShas) ? captureShas : []).map(shaOf).filter(Boolean))];
      if (!shas.length) return out;
      for (const r of this.#rows(`SELECT archive_sha FROM archive_entries WHERE idx=-1 AND archive_sha IN (SELECT value FROM json_each(?))`, JSON.stringify(shas)))
        out.add(r.archive_sha);
    } catch { /* none is known */ }
    return out;
  }

  /** R40: where an archive stands in its unpack tree: its depth (the outermost at 1) and its outermost archive, from its
   *  own row, else from the archive it was cut from (the shallowest one, when several hold it), else the outermost. */
  placeOf(archiveSha) {
    const h = this.header(archiveSha);
    if (h) return { depth: h.depth, root: h.root_sha };
    let best = null;
    for (const p of this.memberOf(archiveSha)) {
      const ph = this.header(p.archiveSha);
      const d = ph ? ph.depth : 1;
      if (!best || d < best.depth) best = { depth: d, root: ph ? ph.root_sha : p.archiveSha };
    }
    return best ? { depth: best.depth + 1, root: best.root } : { depth: 1, root: archiveSha };
  }

  /** R39: the archive's document address, as its own acquisition receipt recorded it (provenance R48's read contract on
   *  `captured_locators`): a fetched receipt before a file's own `unpacked` one, the earliest first. */
  addressOf(archiveSha) {
    try {
      const r = this.#one(`SELECT address, address_norm FROM captured_locators WHERE capture_sha=?
                            ORDER BY CASE WHEN via=? THEN 1 ELSE 0 END, first_retrieved, address_norm LIMIT 1`, archiveSha, UNPACKED_VIA);
      return r ? { address: r.address, addressNorm: r.address_norm } : null;
    } catch { return null; }
  }

  /** R41: the title of a bundle (record-core's `bundles`), or null when it has none or the bundle is gone. */
  titleOf(bundleId) {
    try { const r = this.#one(`SELECT title FROM bundles WHERE bundle_id=?`, bundleId); return r && typeof r.title === "string" && r.title.trim() ? r.title : null; }
    catch { return null; }
  }

  /** R41: whether `viewer` may see `bundleId`, by membership's one rule (its R43), asked over record-core's `bundles`. */
  sees(viewer, bundleId) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "DENY") return false;
    if (gate.scope === "member") return true;
    try { return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, bundleId, ...gate.args); }
    catch { return false; }
  }

  /* ---- R43: the group's co-archive setting ---- */

  /** R43: `{on, set_by, set_at}`; on (K60's default) with `set_by` and `set_at` null while never set. Writes nothing, never
   *  throws. */
  coArchiveState() { return coArchiveStateOf(this.#record); }

  /** R43: an active administrator's act (membership R64); anyone else, a machine credential included, is refused through
   *  `notAnAdmin` (its R84); an `on` that is not a boolean is refused with its row. A refusal records nothing. */
  coArchiveSet({ on, by } = {}) {
    const who = typeof by === "string" ? by : null;
    const admin = who && !isMachineIdentity(who) && this.#membership && typeof this.#membership.isAdministrator === "function"
      ? this.#membership.isAdministrator(who.replace(/^member:/, "")) : false;
    if (!admin) return notAnAdmin(by ?? null, localize("acquisition.unpack.set_whether_your_team_s", "set whether your team's captures ask a public archive for a copy"));
    /* DEC-49 REGION is-co-archive-setting */
    if (typeof on !== "boolean")
      return refuse("CO_ARCHIVE_SETTING_INVALID", { on: on === undefined ? null : typeof on,
        detail: localize("acquisition.unpack.the_setting_is_true", "the setting is true (on) or false (off); nothing was recorded") });
    /* END DEC-49 REGION is-co-archive-setting */
    const at = stampSecond();
    const r = this.#record.setSetting(CO_ARCHIVE_SETTING, { on, set_by: who, set_at: at }, who);
    if (r && r.ok === false) return r;
    return { ok: true, on, set_by: who, set_at: at };
  }

  /* ---- R38–R41: the act and the read, through this instance ---- */
  unpack(store, args) { return unpack({ ...store, acquisition: this }, args); }
  archiveList(args) { return archiveList(this, args); }
}

/** R43: the group's setting read from record-core (its R25), never throwing. */
export function coArchiveStateOf(record) {
  let v = null;
  try { v = record && typeof record.getSetting === "function" ? record.getSetting(CO_ARCHIVE_SETTING) : null; } catch { v = null; }
  if (v && typeof v === "object" && typeof v.on === "boolean")
    return { on: v.on, set_by: typeof v.set_by === "string" ? v.set_by : null, set_at: typeof v.set_at === "string" ? v.set_at : null };
  return { on: true, set_by: null, set_at: null };
}

/** The instance for a host's storage, made once: it migrates and declares its tables (record-core R21). `deps` may name
 *  the record, provenance and membership instances the composition already holds. */
export function acquisitionOf(host, deps = {}) {
  const storage = host && host.storage ? host.storage : host;
  let a = instances.get(storage);
  if (!a) {
    const record = deps.record || recordOf(host);
    const membership = deps.membership || membershipOf(host, { record });
    const provenance = deps.provenance || provenanceOf(host, { record, membership });
    a = new Acquisition({ storage, record, provenance, membership });
    a.migrate();
    const d = record.declareTable("acquisition", ACQUISITION_TABLES.map((t) => ({ ...t, ...(t.keys ? { keys: [...t.keys] } : {}) })));
    if (d && d.ok === false && d.reason !== "TABLE_DECLARED")
      throw new Error(`acquisition: record-core refused its tables: ${d.reason}`);
    instances.set(storage, a);
    byRecord.set(record, a);
  }
  return a;
}

/* The instance a store handed in reaches: its own `acquisition`, else the one made over the same record-core. */
const instanceOf = (store) => (store && store.acquisition instanceof Acquisition ? store.acquisition
  : store && store.core && byRecord.get(store.core)) || null;

/* ======================================================================= *
 * R38–R40: THE ACT
 * ======================================================================= */

/* R40: who may open an archive, and how far: `automatic` within every budget (the capture that brought it in, or the
   daemon continuing), `member` past the tree and daily budgets (a member session, `by` a member), else none. */
function modeOf({ by, cls, member }, automatic) {
  if (automatic || cls === "daemon") return "automatic";
  const who = typeof by === "string" ? by.trim() : "";
  if ((cls === "member" || member === true) && who && !isMachineIdentity(who)) return "member";
  return null;
}

/** R38: the parts the archive's bytes are held in, from this module's record, the capture that just stored them, the
 *  object under its own digest, or the parts its home's document names (provenance R6); each verified (R7). */
async function heldParts(inst, store, ev, archiveSha, given) {
  const h = inst.header(archiveSha);
  let parts = (h && json(h.parts)) || given || null;
  if (!parts) {
    const whole = await ev.head(archiveSha).catch(() => null);
    if (whole && Number.isSafeInteger(Number(whole.size))) parts = [{ sha256: archiveSha, bytes: Number(whole.size) }];
  }
  if (!parts) {
    const p = store.provenance || inst.provenance;
    let home = null;
    try { home = p && typeof p.homeOf === "function" ? p.homeOf(archiveSha) : null; } catch { home = null; }
    let named = null;
    try { named = home && typeof p.registerHolds === "function" ? (await p.registerHolds({ sha: archiveSha, bundle: home.bundleId })).parts : null; }
    catch { named = null; }
    if (named && named.state === "named") parts = named.parts.map((x) => ({ sha256: x.sha256, bytes: x.bytes }));
  }
  if (!Array.isArray(parts) || !parts.length) return { why: word("acquisition.why.bytes_held_whole") };
  let v;
  try { v = await partsHeld(ev, (s) => s, parts.map((x, i) => ({ file: `part ${i}`, ...x }))); }
  catch { return { why: word("acquisition.why.evidence_store_read") }; }
  if (v.missing.length || v.disagree.length || v.unverified.length)
    return { why: word("acquisition.why.part_missing_disagreeing", { missing: v.missing.length, disagree: v.disagree.length, unverified: v.unverified.length }) };
  return { parts };
}

/* R38: whether the record holds the archive at all (a receipt or a register row, provenance R5). */
async function holds(store, inst, archiveSha) {
  if (inst.header(archiveSha)) return true;
  const p = store.provenance || inst.provenance;
  try {
    const r = p && typeof p.registerHolds === "function" ? await p.registerHolds({ sha: archiveSha }) : null;
    return !!(r && (r.registered === true || r.acquired === true));
  } catch { return false; }
}

/* R38: the listing's whole-archive refusal, by name, or null. */
function listingRefusal(listing) {
  if (!listing.ok) {
    if (listing.why === "ARCHIVE_AMBIGUOUS") return rowed("ARCHIVE_AMBIGUOUS", { detail: listing.detail ?? null });
    if (listing.why === "ARCHIVE_ENTRIES_MAX")
      return rowed("ARCHIVE_UNREADABLE", { why: "ARCHIVE_ENTRIES_MAX", limit: ARCHIVE_LIMITS.ARCHIVE_ENTRIES_MAX });
    return rowed("ARCHIVE_UNREADABLE", { why: listing.why ?? "source_unreadable" });
  }
  /* R122 (1): the refusal names the total the listing declared, beside its limit */
  if (listing.verdict === "ARCHIVE_TOTAL_MAX") return rowed("ARCHIVE_TOTAL_MAX", { declared_total: listing.declared_total ?? null });
  return null;
}

/* R39's `origin`: the archive document's, from the capture that brought it in, this module's record, or the document
   its home's `data/provenance.json` holds for it. */
function originOf(inst, archiveSha, given) {
  if (given && typeof given === "object") return given;
  const h = inst.header(archiveSha);
  const kept = h ? json(h.origin) : null;
  if (kept && typeof kept === "object") return kept;
  try {
    const home = inst.provenance && typeof inst.provenance.homeOf === "function" ? inst.provenance.homeOf(archiveSha) : null;
    const f = home && inst.record && typeof inst.record.readFile === "function" ? inst.record.readFile(home.bundleId, "data/provenance.json") : null;
    const docs = f && typeof f.text === "string" ? json(f.text)?.documents : null;
    const d = Array.isArray(docs) ? docs.find((x) => x && x.capture && x.capture.sha256 === archiveSha) : null;
    if (d && d.origin && typeof d.origin === "object") return d.origin;
  } catch { /* stated below */ }
  return { kind: "named_request" };
}

/** R38, R40: `unpack(store, {archiveSha, by, cls, member})` opens an archive the record holds and files each file it can cut
 *  out unambiguously, within R40's budgets; `internal` is only `acquire`'s own call (R40's automatic run, with the
 *  facts its capture established), never a request's. Answers `{ok: true, archive, documents, already_held, not_filed,
 *  nested, waiting, complete}` or a refusal. */
export async function unpack(store, { archiveSha = null, by = null, cls = null, member = false } = {}, internal = null) {
  const st = store || {};
  const sha = shaOf(archiveSha);
  if (!sha) return { ok: false, reason: "BAD_SHA", code: "BAD_SHA", detail: "archiveSha names an archive by its SHA-256, 64 hex; nothing was opened" };
  const mode = modeOf({ by, cls, member }, !!(internal && internal.automatic));
  /* DEC-49 REGION is-unpack-caller */
  if (!mode) return refuse("UNPACK_NOT_PERMITTED", { cls: cls ?? null,
    detail: localize("acquisition.unpack.an_archive_is_opened", "an archive is opened by a member's own request, by the daemon continuing an automatic run, or by the capture that brought it in; nothing was opened") });
  /* END DEC-49 REGION is-unpack-caller */
  const inst = instanceOf(st);
  if (!inst) return { ok: false, reason: "ARCHIVE_RECORD_UNAVAILABLE", code: "ARCHIVE_RECORD_UNAVAILABLE",
    detail: localize("acquisition.unpack.the_store_handed_in", "the store handed in carries no acquisition instance, so no archive's outcomes can be recorded; nothing was opened") };
  const core = st.core || inst.record;
  const rawEv = core && typeof core.evidenceStore === "function" ? core.evidenceStore() : null;
  if (!rawEv) return evidenceStorageAbsent("unpack", word("capture.response.group_civicsmith_evidence")).body;
  const ev = readThrough(rawEv);

  /* DEC-49 REGION is-archive-held */
  if (!(await holds(st, inst, sha)))
    return refuse("ARCHIVE_NOT_HELD", { archive: sha, detail: localize("acquisition.unpack.no_acquisition_receipt_or", "no acquisition receipt or register row names this archive; nothing was opened") });
  const held = await heldParts(inst, st, ev, sha, internal && internal.parts);
  if (!held.parts) return refuse("ARCHIVE_NOT_HELD", { archive: sha, detail: localize("acquisition.unpack.why_nothing_was_opened", "{why}; nothing was opened", { why: String(held.why) }) });
  /* END DEC-49 REGION is-archive-held */
  /* DEC-49 REGION is-not-an-archive
     R38 (K2100): a held capture R17's rule does not profile as `zip` is refused as R41 refuses it, before any listing.
     `acquire`'s own call (R40) is made only for a capture it has just profiled `zip`, so it is not asked again. */
  if (!(internal && internal.automatic && internal.parts)) {
    const notArchive = await archiveProfile(inst, ev, sha, held.parts);
    if (notArchive) return notArchive;
  }
  /* END DEC-49 REGION is-not-an-archive */
  const source = partsSource(ev, held.parts);
  const listing = await listArchive(source);
  /* DEC-49 REGION is-archive-listed */
  const whole = listingRefusal(listing);
  if (whole) return { ok: false, ...whole, archive: sha };
  /* END DEC-49 REGION is-archive-listed */

  const at = stampSecond();
  const archive = { sha256: sha, entries: listing.count, declared_total: listing.declared_total };
  let h = inst.header(sha);
  /* DEC-49 REGION is-unpack-budget
     R40: an archive deeper than the published depth is filed as a file and never opened, whoever asks: nothing of it is
     recorded, so R41 reads it as held and not opened, every entry waiting on that name. */
  if (!h && inst.placeOf(sha).depth > ARCHIVE_DEPTH_MAX)
    return { ok: true, archive, documents: [], already_held: [], not_filed: [], nested: [], waiting: listing.count, complete: listing.count === 0,
             ...(listing.count ? { waiting_on: rowed("ARCHIVE_DEPTH_MAX") } : {}) };
  /* END DEC-49 REGION is-unpack-budget */
  if (!h) {
    const place = inst.placeOf(sha);
    const addr = (internal && internal.address) ? { address: internal.address, addressNorm: internal.addressNorm } : inst.addressOf(sha);
    const opened = inst.open(sha, { listing, depth: place.depth, root: place.root, address: addr ? addr.address : null,
      addressNorm: addr ? addr.addressNorm : null, origin: originOf(inst, sha, internal && internal.origin), parts: held.parts,
      bytes: source.size, at });
    if (opened && opened.ok === false) return opened;
    h = inst.header(sha);
  }
  const out = { documents: [], already_held: [], not_filed: [], nested: [], not_promoted: [] };
  const rowsByIndex = new Map(listing.entries.map((e) => [e.index, e]));
  const waitingRows = inst.entryRows(sha).filter((r) => r.state === "waiting");
  /* R40 (N998): the day the cuts count towards is the day of the instant they record, from the one clock read above */
  const day = at.slice(0, 10);
  const call = { entries: 0, bytes: 0 };
  let stoppedOn = null, stoppedForCall = false;
  const ctx = { st, inst, ev, sha, h, at, mode, by, cls, member, out, source,
                pv: profileView(core) };

  /* R40: an archive deeper than the published depth is filed as a file and never opened, whoever asks. */
  if (h.depth > ARCHIVE_DEPTH_MAX) stoppedOn = "ARCHIVE_DEPTH_MAX";
  /* R122 (2): the daemon's run (the plane's `unpack` job, not `acquire`'s own call) offers again each entry filed whose document has no home, its
     promotion having failed; the third offer without a home is the last, and the entry is then stated final with its reason. The run is not
     complete while an offer is unanswered: the next run sees whether the document found its home. An offer is a re-cut of the member (its
     parts are already held, so nothing is written twice) and counts towards the call's share, but not towards the tree's or the day's. */
  let owedAgain = 0;
  if (cls === "daemon" && !(internal && internal.automatic) && !stoppedOn) {
    const p = st.provenance || inst.provenance;
    const homeless = (s) => { try { return !!(p && typeof p.homeOf === "function") && !p.homeOf(s); } catch { return false; } };
    for (const r of inst.filedRows(sha)) {
      const row = rowsByIndex.get(r.idx);
      if (!row || !homeless(r.sha256)) continue;
      if ((r.offers ?? 1) >= REOFFER_MAX) {
        const detail = localize("acquisition.unpack.its_document_was_offered", "its document was offered {n} times and found no home in a project, so it is kept in the record and is not offered again", { n: String(r.offers ?? 1) });
        inst.final(sha, r.idx, { code: NOT_PROMOTED, detail });
        out.not_promoted.push({ index: r.idx, sha256: r.sha256, code: NOT_PROMOTED, detail });
        continue;
      }
      owedAgain++;
      if (call.entries >= UNPACK_CALL_ENTRIES || (call.entries > 0 && call.bytes + row.uncompressed > UNPACK_CALL_BYTES)) { stoppedForCall = true; continue; }
      call.entries++; call.bytes += row.uncompressed;
      await reofferOne(ctx, row, r);
    }
  }
  for (const r of stoppedOn ? [] : waitingRows) {
    const row = rowsByIndex.get(r.idx);
    if (!row) continue;
    /* DEC-49 REGION is-entry-verdict */
    if (row.verdict === "directory") { inst.settle(sha, row.index, { state: "folder", at }); continue; }
    if (row.verdict === "symlink") { inst.settle(sha, row.index, { state: "link", target: await linkTarget(source, row), at }); continue; }
    if (NOT_CUT.includes(row.verdict)) {
      inst.settle(sha, row.index, { state: "not_filed", code: row.verdict, at });
      out.not_filed.push({ index: row.index, ...rowed(row.verdict) });
      continue;
    }
    /* END DEC-49 REGION is-entry-verdict */
    if (row.verdict !== "ok") continue;
    /* DEC-49 REGION is-unpack-budget
       R40: the call's share first (the first cut of a call always fits, so a file larger than the share is not held
       back for ever), then, for an automatic run only, the tree's and the day's. */
    if (call.entries >= UNPACK_CALL_ENTRIES || (call.entries > 0 && call.bytes + row.uncompressed > UNPACK_CALL_BYTES)) {
      stoppedForCall = true; break;
    }
    if (mode === "automatic") {
      const t = inst.treeCount(h.root_sha), d = inst.dayCount(day);
      const over = t.tree_entries + 1 > ARCHIVE_TREE_ENTRIES_MAX ? "ARCHIVE_TREE_ENTRIES_MAX"
        : t.tree_bytes + row.uncompressed > ARCHIVE_TREE_TOTAL_MAX ? "ARCHIVE_TREE_TOTAL_MAX"
        : d.entries + 1 > UNPACK_DAILY_ENTRIES ? "UNPACK_DAILY_ENTRIES"
        : d.bytes + row.uncompressed > UNPACK_DAILY_BYTES ? "UNPACK_DAILY_BYTES" : null;
      if (over) { stoppedOn = over; break; }
    }
    /* END DEC-49 REGION is-unpack-budget */
    call.entries++; call.bytes += row.uncompressed;
    await cutOne(ctx, row, { bytes: row.uncompressed, day });
  }
  const left = inst.entryRows(sha).filter((r) => r.state === "waiting").length;
  inst.markWaiting(sha, left ? stoppedOn : null);
  const unanswered = left + owedAgain;
  /* The driver (Suggestions): an automatic run that stopped only for the call's share, or that filed a nested archive
     it may open, asks the queue handed in to continue as `op=unpack` (capture R15's `archive-unpack`).
     R100 (fix round 4b, F11; plane R77): with the plane's owed-work ledger handed in (`internal.owedLater`, else the store's
     `owedLater`), the continuation is an entry of that ledger instead, `{kind: "unpack", sha}`, which no count of tries ends,
     and an automatic run that stopped on a daily budget is owed too: the day's figures start again at the next UTC day. A stop on
     the tree's figures or the depth is not owed: the tree never shrinks, so only a member's own `op=unpack` goes past it
     (R40), and the archive's page states it (R41). */
  if (mode === "automatic") {
    const more = [...(left && stoppedForCall && !stoppedOn ? [sha] : []), ...(h.depth < ARCHIVE_DEPTH_MAX ? out.nested : [])];
    const given = internal && typeof internal.owedLater === "function" ? internal.owedLater : typeof st.owedLater === "function" ? (e) => st.owedLater(e) : null;
    if (given) {
      const owed = [...more, ...(left && (stoppedOn === "UNPACK_DAILY_ENTRIES" || stoppedOn === "UNPACK_DAILY_BYTES") ? [sha] : [])];
      for (const s of owed) {
        try { await given({ kind: "unpack", sha: s }); }
        catch { /* an unregistered continuation waits for a member; it never fails the run */ }
      }
    } else if (typeof st.taskEnqueue === "function") {
      for (const s of more) {
        try { await st.taskEnqueue({ kind: "archive-unpack", captureSha: s, subject: s, at }); }
        catch { /* an unqueued continuation waits for a member; it never fails the run */ }
      }
    }
  }
  return {
    ok: true, archive, documents: out.documents, already_held: out.already_held, not_filed: out.not_filed, nested: out.nested,
    not_promoted: out.not_promoted, waiting: unanswered, complete: unanswered === 0,
    ...(left && stoppedOn ? { waiting_on: rowed(stoppedOn) } : {}),
  };
}

/* R38: a symlink's target, the archive's claim, read only when small; never followed. */
async function linkTarget(source, row) {
  if (!(row.uncompressed <= LINK_TARGET_MAX) || row.encrypted || (row.method !== 0 && row.method !== 8)) return null;
  try {
    const { chunks, done } = streamMember(source, { ...row, verdict: "ok" });
    const got = [];
    for await (const c of chunks) got.push(c);
    const r = await done;
    if (!r.ok) return null;
    const all = new Uint8Array(got.reduce((n, c) => n + c.length, 0));
    let at = 0;
    for (const c of got) { all.set(c, at); at += c.length; }
    return new TextDecoder("utf-8", { fatal: true }).decode(all);
  } catch { return null; }
}

/** R122 (2): one more offer of an entry already filed: the member is cut again, verified to be the file the entry recorded, and its document answered for the
 *  caller to promote. A cut that fails, or yields other bytes, answers no document; the offer is spent either way. */
async function reofferOne(ctx, row, rec) {
  const { inst, ev, sha, h, at, out } = ctx;
  inst.offered(sha, row.index);
  const { chunks, done } = streamMember(ctx.source, row);
  let stored = null;
  try { stored = await storeChunks(ev, chunks); } catch { stored = null; }
  const verdict = await done;
  if (!stored || !verdict.ok || stored.sha256 !== rec.sha256 || verdict.sha256 !== rec.sha256) return;
  const address = h.address ? `${h.address}#zip:${row.index}` : null;
  const receipt = { address, addressNorm: h.address_norm ? `${h.address_norm}#zip:${row.index}` : null, captureSha: rec.sha256,
                    retrieved: at, via: UNPACKED_VIA, retrievalLocator: `zip:${sha}!${row.index}` };
  out.documents.push(await fileDocument(ctx, row, stored, receipt));
}

/** R38, R39: cut one `ok` entry, store it, and record its outcome: not filed (the cut refused), already held (a second
 *  sighting), or filed with its receipt and its document. */
async function cutOne(ctx, row, cost) {
  const { st, inst, ev, sha, h, at, out } = ctx;
  const counted = { cost: { bytes: cost.bytes }, root: h.root_sha, day: cost.day };
  const { chunks, done } = streamMember(ctx.source, row);
  let stored = null, passing = false;
  try { stored = await storeChunks(ev, chunks); } catch (e) { stored = null; passing = !!(e && e.storeFailure); }
  const verdict = await done;
  /* R121: a store failure that may pass leaves the entry with NO outcome, so the next call cuts it again (R38's resume) and the
     answer counts it in `waiting`; only a deterministic verdict of the listing or the cut files an entry `not_filed`. */
  if (passing && !(verdict && verdict.ok === false && verdict.why === "MEMBER_CORRUPT")) return;
  /* DEC-49 REGION is-entry-cut
     Only a cut `done` answers whole is the file; any byte stored on the way stays content-addressed and unnamed. */
  if (!verdict.ok || !stored || stored.sha256 !== verdict.sha256) {
    const code = verdict.ok ? "ARCHIVE_UNREADABLE" : verdict.why === "MEMBER_CORRUPT" ? "MEMBER_CORRUPT"
      : NOT_CUT.includes(verdict.why) ? verdict.why : "ARCHIVE_UNREADABLE";
    const detail = verdict.ok ? word("acquisition.text.evidence_store_hold") : (verdict.detail ?? verdict.why ?? null);
    inst.settle(sha, row.index, { state: "not_filed", code, detail, at, ...counted });
    out.not_filed.push({ index: row.index, ...rowed(code, { detail }) });
    return;
  }
  /* END DEC-49 REGION is-entry-cut */
  const fileSha = stored.sha256;
  const p = st.provenance || inst.provenance;
  const address = h.address ? `${h.address}#zip:${row.index}` : null;
  const receipt = { address, addressNorm: h.address_norm ? `${h.address_norm}#zip:${row.index}` : null, captureSha: fileSha,
                    retrieved: at, via: UNPACKED_VIA, retrievalLocator: `zip:${sha}!${row.index}` };
  /* provenance R2's one home: bytes the register holds under an existing bundle, or that an archive filed before, are a
     second sighting, never filed again. */
  let registered = false;
  try { registered = !!(p && typeof p.registerHolds === "function" && (await p.registerHolds({ sha: fileSha }))?.registered === true); }
  catch { registered = false; }
  const before = registered || inst.filedBefore(fileSha) || out.documents.some((d) => d.capture.sha256 === fileSha);
  try { await p?.recordReceipt?.(receipt); } catch { /* an unwritten receipt leaves the grade unanswered, never the cut undone */ }
  if (before) {
    inst.settle(sha, row.index, { state: "already_held", sha256: fileSha, at, ...counted });
    out.already_held.push({ index: row.index, sha256: fileSha });
    return;
  }
  const document = await fileDocument(ctx, row, stored, receipt);
  inst.settle(sha, row.index, { state: "filed", sha256: fileSha, at, ...counted });
  out.documents.push(document);
  if (document.profile && document.profile.format && document.profile.format.format === "zip") out.nested.push(fileSha);
}

/** R39: the provenance document of one file cut out of an archive, R16's with R39's differences. Every fact is derived
 *  from the archive's held bytes and their listing (R27), never from a caller. */
async function fileDocument(ctx, row, stored, receipt) {
  const { st, inst, ev, sha, h, at, mode, by, cls, member } = ctx;
  const multipart = stored.parts.length > 1;
  /* No response exists: the type is what format-registry finds in the bytes (the first part read back), else none. */
  let ct = null;
  try {
    const o = await ev.get(stored.parts[0].sha256);
    const head = o ? new Uint8Array(await o.arrayBuffer()) : null;
    const f = head ? detectFormat(head, null) : null;
    ct = f && FORMAT_MEDIA_TYPES[f.format] ? FORMAT_MEDIA_TYPES[f.format] : null;
  } catch { ct = null; }
  const name = `zip-${sha}-${row.index}`;
  const profile = await profileOf({ ev, sha: stored.sha256, ct, total: stored.bytes, multipart, headers: {},
    locator: receipt.address, view: ctx.pv, retrieved: at, origin: "fetch", parts: stored.parts });
  const p = st.provenance || inst.provenance;
  let g = null;
  try { g = p && typeof p.captureGrade === "function" ? await p.captureGrade(stored.sha256) : null; } catch { g = null; }
  const isMember = mode === "member" || cls === "member" || member === true;
  const actor = isMember && typeof by === "string" && by && !isMachineIdentity(by) ? by : null;
  const path = row.name ?? null;
  const env = st.env || {};
  return {
    file: `snapshots/${name}`, locator: receipt.address, retrieved: at,
    profile,
    authority_state: "undetermined",
    authority_basis: word("acquisition.authority_basis.file_cut_out", { at }),
    provenance_chain: [{
      who: firstHopWho(env.INSTANCE_NAME, env.VERSION),
      asserts: localize("acquisition.unpack.these_bytes_are_entry_index", "these bytes are entry {index} ({v1}, the archive's own claim) of the archive {sha} held by your team's Civicsmith, cut out and verified by size and CRC-32 at {at}", { index: String(row.index), v1: String(path === null ? "a name that is not valid UTF-8" : path), sha: String(sha), at: String(at) }),
      evidence: localize("acquisition.unpack.the_archives_capture_sha_its", "the archive's capture {sha}; its central directory and the entry's local header agree on this entry", { sha: String(sha) }),
      bound: false, via: UNPACKED_VIA, archive_sha256: sha,
    }],
    capture: {
      method: UNPACKED_VIA,
      ...(g && g.grade ? { grade: g.grade } : { ...(g && g.basis ? { grade_basis: g.basis } : {}) }),
      actor_class: isMember ? "member" : (cls === "probe" ? "session" : "daemon"),
      actor,
      sha256: stored.sha256, encoding: "binary", bytes: stored.bytes,
      ...(ct ? { content_type: ct } : {}),
    },
    container: {
      archive_sha256: sha, index: row.index, path, name_raw: row.name_raw, method: row.method, crc32: row.crc32,
      compressed: row.compressed, uncompressed: row.uncompressed, local_offset: row.local_offset,
      member_sha256: stored.sha256,
      /* the archive's statement, with no zone, never a fact */
      dos_time_stated: row.dos_time ?? null,
      name_shared: row.name_shared, path_unsafe: !!row.path_unsafe,
    },
    ...(multipart ? { parts: stored.parts.map((x, i) => ({ file: `snapshots/${name}.part${String(i).padStart(3, "0")}`, sha256: x.sha256, bytes: x.bytes })) } : {}),
    origin: json(h.origin) || { kind: "named_request" },
    attestation_attempts: [],
  };
}

/* ======================================================================= *
 * R41: THE READ BEHIND `owed:archivelist`
 * ======================================================================= */

/* R41: an entry as the screen shows it, from the listing's facts and R38's outcome. */
function entryOf(r, { limit, refused, sees, heldOf }) {
  const base = { index: r.idx ?? r.index, name: r.name ?? null, name_raw: r.name_raw ?? null, name_encoding: r.name_encoding ?? null,
                 name_shared: r.name_shared ?? 1, path_unsafe: !!r.path_unsafe, kind: r.kind ?? null, dos_time_stated: r.dos_time ?? null,
                 uncompressed: r.uncompressed ?? null };
  if (refused) return { ...base, state: "not_filed", ...rowed(refused.code), ...(refused.detail ? { detail: refused.detail } : {}) };
  const verdict = r.verdict;
  const state = r.state || (verdict === "directory" ? "folder" : verdict === "symlink" ? "link"
    : NOT_CUT.includes(verdict) ? "not_filed" : "waiting");
  /* R122: a filed entry whose document found no home in its offers states it, with the reason */
  if (state === "filed") return { ...base, state, sha256: r.sha256, bundle: sees(r.sha256), ...(r.code ? { not_promoted: { code: r.code, detail: r.detail ?? null } } : {}) };
  /* R41 (T50; N1126): an `already_held` entry also states when, and under which document's title, the record first held the
     same bytes (null when the earlier holding is no document the viewer may see, or has no document yet) */
  if (state === "already_held") { const bundle = sees(r.sha256); return { ...base, state, sha256: r.sha256, bundle, ...heldOf(r.sha256, bundle) }; }
  if (state === "folder") return { ...base, state };
  if (state === "link") return { ...base, state, target: r.target ?? null };
  if (state === "not_filed") {
    const code = r.code || verdict;
    return { ...base, state, ...rowed(code), ...(r.detail ? { detail: r.detail } : {}) };
  }
  const waitsOn = r.limit_name || limit || null;
  return { ...base, state: "waiting", ...(waitsOn ? { waiting_on: waitsOn, limit: FIGURES[waitsOn] ?? null } : { waiting_on: null }) };
}

/** R38, R41 (N720, K1955, K2100): whether a held capture is an archive by R17's rule, answered as the refusal
 *  `NOT_AN_ARCHIVE` when it is not, else null. An archive never opened is profiled by R17's one function over its held
 *  parts; an opened one by the same rule's reading of its listing, which R38 recorded whole: a directory naming an OPC
 *  content-type map or an ODF `mimetype` is an office or OpenDocument file (format-registry R28, R17's past-bound arm). */
async function archiveProfile(inst, ev, sha, parts) {
  if (inst.header(sha)) {
    const officePart = inst.entryRows(sha).find((r) => {
      const n = normalizePartName(r.name || "");
      return n === CONTENT_TYPES_PART || n === ODF_MIMETYPE_PART;
    });
    return officePart ? notAnArchive(sha, { format: null, part: officePart.name }) : null;
  }
  /* R48 (fix round 4, P10 c; K4445): the opening bytes first. A capture that does not begin with the ZIP local-file magic is no ZIP archive
     (R17's `zip` needs the magic, `formats.mjs`), so it is answered at once from its first part's head, never profiled whole. */
  let archiveHead = null;
  try {
    const first = await ev.get(parts[0].sha256, { range: { offset: 0, length: Math.min(1024, parts[0].bytes) } });
    const head = first ? new Uint8Array(await first.arrayBuffer()).subarray(0, 1024) : null;
    archiveHead = head;   // R101: the profile that follows is served this head for the reads it makes inside it
    if (head && !hasZipMagic(head.subarray(0, 4))) {
      const f = detectFormat(head, null);
      return remembered(inst, sha, { format: f && f.format !== "zip" ? f.format : null });
    }
  } catch { /* an unreadable head is profiled as before */ }
  const total = parts.reduce((n, x) => n + x.bytes, 0);
  let fmt = null, decided = false;
  try {
    const unread = {};
    const prof = await profileOf({ ev, sha, ct: null, total, multipart: parts.length > 1, headers: {}, locator: null,
      view: undefined, retrieved: stampSecond(), origin: null, parts, unread, firstPart: archiveHead });
    fmt = prof && prof.format ? prof.format.format : null;
    decided = !unread.reason;   // R101, R121: a store that could not be read is no decision
  } catch { fmt = null; }
  /* R107: a decision made from the bytes is remembered; one made because the profile could not be read is not (it may read next time) */
  return fmt === "zip" ? null : decided ? remembered(inst, sha, { format: fmt }) : notAnArchive(sha, { format: fmt });
}
const remembered = (inst, sha, decided) => { inst.rememberNotArchive(sha, decided); return notAnArchive(sha, decided); };

/* R41, C-139.20: a capture held and visible that is not an archive; `format` what R17's rule profiled it as, or `part` the
   office or OpenDocument part its recorded listing names. */
const notAnArchive = (sha, { format = null, part = null } = {}) => refuse("NOT_AN_ARCHIVE", { archive: sha, format,
  ...(part ? { part } : {}),
  detail: `${part ? `this capture is an office or OpenDocument file (its listing names ${part})` : `this capture's bytes are profiled \`${format ?? "undetermined"}\``}, `
        + "not a ZIP archive, so it has no list of files to show" });

/** R41: `archiveList({archiveSha, viewer, state, limit, after})` answers an archive's entries as R38 recorded them, or, for
 *  an archive held and never opened, as its listing reads now. Writes nothing. */
export async function archiveList(instOrStore, { archiveSha = null, viewer = null, state = null, limit = LIST_DEFAULT, after = null } = {}) {
  const inst = instOrStore instanceof Acquisition ? instOrStore : instanceOf(instOrStore);
  const sha = shaOf(archiveSha);
  if (!sha) return { ok: false, reason: "BAD_SHA", code: "BAD_SHA", detail: "archiveSha names an archive by its SHA-256, 64 hex" };
  if (!inst) return { ok: false, reason: "ARCHIVE_RECORD_UNAVAILABLE", code: "ARCHIVE_RECORD_UNAVAILABLE",
    detail: localize("acquisition.unpack.no_acquisition_instance_holds", "no acquisition instance holds this storage's archive records") };
  const p = inst.provenance;
  const notHeld = () => refuse("ARCHIVE_NOT_HELD", { archive: sha, detail: localize("acquisition.unpack.no_archive_your_team", "no archive your team holds and you may see answers to that digest") });
  let home = null;
  try { home = p && typeof p.homeOf === "function" ? p.homeOf(sha) : null; } catch { home = null; }
  /* DEC-49 REGION is-archive-held
     membership R43: an archive whose home the viewer may not see is answered exactly as one not held. */
  if (viewerPredicate(viewer).scope === "DENY" || (home && !inst.sees(viewer, home.bundleId))) return notHeld();
  if (!(await holds({}, inst, sha))) return notHeld();
  /* END DEC-49 REGION is-archive-held */
  /* R107: a capture this instance already decided is no archive is answered from that decision, with no read of the evidence store
     (the fence and the register above are asked first, so a viewer who may not see it is told what they always were) */
  const known = inst.knownNotArchive(sha);
  if (known) return notAnArchive(sha, known);
  const sees = (s) => {
    let hh = null;
    try { hh = s && p && typeof p.homeOf === "function" ? p.homeOf(s) : null; } catch { hh = null; }
    return hh && inst.sees(viewer, hh.bundleId) ? hh.bundleId : null;
  };
  const h = inst.header(sha);
  /* DEC-49 REGION is-not-an-archive */
  let ev = null, held = null;
  if (!h) {
    const rawEv = inst.record && typeof inst.record.evidenceStore === "function" ? inst.record.evidenceStore() : null;
    ev = rawEv ? readThrough(rawEv) : null;
    held = ev ? await heldParts(inst, {}, ev, sha, null) : { why: word("acquisition.why.evidence_storage") };
    if (!held.parts) return notHeld();
  }
  const notArchive = await archiveProfile(inst, ev, sha, held && held.parts);
  if (notArchive) return notArchive;
  /* END DEC-49 REGION is-not-an-archive */
  let g = null;
  try { g = p && typeof p.captureGrade === "function" ? await p.captureGrade(sha) : null; } catch { g = null; }
  let rows, refused = null, waitLimit = null, bytes = null, entries = 0, declaredTotal = null;
  if (h) {
    rows = inst.entryRows(sha);
    bytes = h.bytes; entries = h.entries; declaredTotal = h.declared_total;
    if (h.depth > ARCHIVE_DEPTH_MAX) waitLimit = "ARCHIVE_DEPTH_MAX";
  } else {
    /* held, never opened: read as it lists now */
    const source = partsSource(ev, held.parts);
    const listing = await listArchive(source);
    bytes = source.size;
    refused = listingRefusal(listing);
    rows = Array.isArray(listing.entries) ? listing.entries : [];
    entries = listing.ok ? listing.count : rows.length;
    declaredTotal = listing.ok ? listing.declared_total : null;
    if (!refused && inst.placeOf(sha).depth > ARCHIVE_DEPTH_MAX) waitLimit = "ARCHIVE_DEPTH_MAX";
  }
  /* R41: the earlier holding of the same bytes, from provenance's one reading of when a bundle first held a capture (its R12) and
     the bundle's own title; null whenever `bundle` (what the viewer may see) is */
  const heldOf = (s, bundle) => {
    if (!bundle) return { held_at: null, held_name: null };
    let at = null;
    try { const c = p && typeof p.capturesOf === "function" ? p.capturesOf(bundle).find((x) => x.capture_sha === s) : null; at = c && c.held_at ? c.held_at : null; }
    catch { at = null; }
    return { held_at: at, held_name: inst.titleOf(bundle) };
  };
  const all = rows.map((r) => entryOf(r, { limit: waitLimit, refused, sees, heldOf }));
  const summary = { filed: 0, already_held: 0, not_filed: 0, folders: 0, links: 0, waiting: 0 };
  for (const e of all) {
    if (e.state === "folder") summary.folders++;
    else if (e.state === "link") summary.links++;
    else summary[e.state]++;
  }
  const want = typeof state === "string" && state ? state : null;
  const lim = Math.min(LIST_MAX, Math.max(1, Number.isFinite(Number(limit)) ? Math.trunc(Number(limit)) : LIST_DEFAULT));
  const from = Number.isInteger(Number(after)) && after !== null && after !== "" ? Number(after) : -1;
  const picked = all.filter((e) => (!want || e.state === want) && e.index > from);
  const page = picked.slice(0, lim);
  const truncated = picked.length > page.length;
  return {
    ok: true,
    archive: { sha256: sha, bundle: home ? home.bundleId : null, grade: g && g.grade ? g.grade : null, bytes, entries,
               declared_total: declaredTotal, opened: !!h, refused: refused ? { code: refused.code, check: refused.check,
               translation: refused.translation, ...(refused.why ? { why: refused.why } : {}), ...(refused.detail ? { detail: refused.detail } : {}),
               ...(refused.limit !== undefined ? { limit: refused.limit } : {}) } : null },
    summary, entries: page, limit: lim, truncated, next: truncated ? page[page.length - 1].index : null,
  };
}

/** R41 (T51; C14): the module-level forms of `membersOf` and `openedAmong`, through the instance a store reaches. Never throw;
 *  a store with no instance answers nothing known. */
export function membersOf(store, captureShas) {
  try { const inst = store instanceof Acquisition ? store : instanceOf(store); return inst ? inst.membersOf(captureShas) : new Map(); }
  catch { return new Map(); }
}
export function openedAmong(store, captureShas) {
  try { const inst = store instanceof Acquisition ? store : instanceOf(store); return inst ? inst.openedAmong(captureShas) : new Set(); }
  catch { return new Set(); }
}

/** R107: the module-level form of `notArchivesAmong`, through the instance a store reaches. Never throws; a store with no instance
 *  answers nothing known. */
export function notArchivesAmong(store, captureShas) {
  try { const inst = store instanceof Acquisition ? store : instanceOf(store); return inst ? inst.notArchivesAmong(captureShas) : new Set(); }
  catch { return new Set(); }
}

/** R41: the module-level form of `memberOf`, through the instance a store reaches. Never throws. */
export function memberOf(store, captureSha) {
  try { const inst = store instanceof Acquisition ? store : instanceOf(store); return inst ? inst.memberOf(captureSha) : []; }
  catch { return []; }
}
