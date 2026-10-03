/* case-import over the modules it uses, the real ones where a test needs their behaviour (record-core, membership,
   strength, accepted-work), on a real SQLite database (node:sqlite) standing in for a Durable Object's
   storage, answering as workerd's does (a cursor). Members are rows of membership's own table, as its acts would leave
   them; this group's default bar is a row of strength's own table, as `strengthBarSet` leaves it.

   A case file is built here as `public-read` R6 makes one: each part a stored ZIP with the manifest at its root and each
   file at its path, the files a case document (front matter stating its lens and bar), each finding's published bytes
   (with `published_strength`) and any documents. Three neighbours are stand-ins the test controls:
   - `case-checker.checkCaseFile` (its R1): it answers, for each finding the test scripts, its role, result, what is
     missing and what differs, and its recomputed pair; a document supplied later whose SHA-256 a missing entry names
     fills that gap (its R9). It records each call.
   - `case-grammar.caseFileManifestCheck` (its R13): the manifest's departures from the shape this fixture writes.
   - `reevaluation.acceptanceWithdrawn` (its R31): a recorder, which can be made to throw.
   Every test drives `case-import` at its interface. */
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { caseImportOf, CASE_IMPORT_CHECKS } from "../../../src/case-import/index.mjs";
import { readCaseFile } from "../../../src/case-import/parts.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

/* as workerd binds: an ArrayBuffer is a BLOB (node:sqlite takes it as a typed array), and a BLOB reads back as an
   ArrayBuffer */
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v instanceof ArrayBuffer ? new Uint8Array(v) : v);
const unbind = (r) => { for (const k of Object.keys(r)) if (r[k] instanceof Uint8Array) r[k] = r[k].buffer.slice(r[k].byteOffset, r[k].byteOffset + r[k].byteLength); return r; };
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`Expected exactly one result, got ${rest.length}`); return rest[0]; },
  };
  return c;
}
export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = { exec(q, ...args) {
    const st = db.prepare(q);
    return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => unbind({ ...r })) : (st.run(...args.map(bind)), []));
  } };
  return { db, sql, transactionSync(fn) {
    const sp = `sp${n++}`;
    db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
    catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
  } };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const SLUG = "home-group";
export const SOURCE = "source-group";
export const CASE = "CASE-2026-0101";
export const NOW = Date.parse("2026-10-03T12:00:00Z");
export const LENS = "a1".repeat(32);
export const OTHER_LENS = "b2".repeat(32);
export const F1 = "INQ-2026-0001-transfers";
export const F2 = "INQ-2026-0002-contracts";
export const F3 = "INQ-2026-0003-payroll";
export const sha = (b) => createHash("sha256").update(b).digest("hex");
const enc = new TextEncoder();
export const bytes = (s) => enc.encode(s);

/* ---------------------------------------------------------------- a stored ZIP, as public-read R6 writes a part */

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
/** A stored (uncompressed) ZIP of `entries` `[{name, bytes}]`, fixed timestamps. */
export function zip(entries) {
  const locals = [], centrals = [];
  let at = 0;
  for (const e of entries) {
    const name = enc.encode(e.name), data = e.bytes, crc = crc32(data);
    const l = new DataView(new ArrayBuffer(30));
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(8, 0, true); l.setUint16(10, 0, true);
    l.setUint16(12, 0x21, true); l.setUint32(14, crc, true); l.setUint32(18, data.length, true); l.setUint32(22, data.length, true);
    l.setUint16(26, name.length, true); l.setUint16(28, 0, true);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(10, 0, true);
    c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, at, true);
    locals.push(new Uint8Array(l.buffer), name, data);
    centrals.push(new Uint8Array(c.buffer), name);
    at += 30 + name.length + data.length;
  }
  const cdSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, at, true);
  const all = [...locals, ...centrals, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, b) => n + b.length, 0));
  let p = 0;
  for (const b of all) { out.set(b, p); p += b.length; }
  return out;
}

/* ---------------------------------------------------------------- a case file */

/** A finding's published bytes: its id and its frozen per-axis pair. */
export function findingText(id, pair = { capture: "B", connection: "C" }) {
  return ["---", `id: ${id}`, "object_type: inquiry", "published_strength:",
          ...Object.entries(pair).flatMap(([axis, g]) => [`  - axis: ${axis}`, `    state: ${g ? "graded" : "unrated"}`, `    grade: ${g ?? "null"}`]),
          "---", "", `# ${id}`, ""].join("\n");
}
/** The case document: its lens (`bias_manifest.statements_sha`) and the source's bar (`required_strength`). */
export function caseDocText({ case: caseId = CASE, edition = 1, lens = LENS, bar = { capture: "B", connection: "B" }, note = "" } = {}) {
  return ["---", "format: bio-case-document/6", `case_id: ${caseId}`, `case_edition: ${edition}`, "bias_manifest:",
          `  in_force: ${lens ? "true" : "false"}`, `  statements_sha: ${lens ?? "null"}`, "required_strength:",
          `  declared: ${bar ? "true" : "false"}`, `  capture: ${bar?.capture ?? "null"}`, `  connection: ${bar?.connection ?? "null"}`,
          "---", "", `# Case ${caseId}`, note, ""].join("\n");
}

/** A case file's parts: `{parts, manifest, files}`. `split` puts each file after the first two in a part of its own. */
export function caseFile({ group = SOURCE, case: caseId = CASE, edition = 1, lens = LENS, bar, note = "", findings = [F1, F2, F3],
                           pairs = {}, documents = [], split = false, manifestExtra = {}, manifestName = "manifest.json" } = {}) {
  const files = [
    { path: "case.md", kind: "case_document", bytes: bytes(caseDocText({ case: caseId, edition, lens, bar, note })) },
    ...findings.map((id) => ({ path: `findings/${id}.md`, kind: "finding", bytes: bytes(findingText(id, pairs[id])) })),
    ...documents.map((d) => ({ path: `documents/${d.name}`, kind: "document", bytes: d.bytes })),
  ];
  const groups = split ? [files.slice(0, 2), ...files.slice(2).map((f) => [f])] : [files];
  /* `case-grammar` R13 (K1318): a part's SHA-256 is over the lines `<path> <sha256> <bytes>\n` of its files in path
     order, its bytes their sum (`casePartDigest`) */
  const digestOf = (g) => sha([...g].sort((a, b) => (a.path < b.path ? -1 : 1)).map((f) => `${f.path} ${sha(f.bytes)} ${f.bytes.length}\n`).join(""));
  const manifest = { format: "bio-case-file/1", group, case: caseId, edition, case_document_sha: sha(files[0].bytes),
                     keys: [], parts: groups.map((g, index) => ({ index, sha256: digestOf(g),
                                                                  bytes: g.reduce((n, f) => n + f.bytes.length, 0) })),
                     files: groups.flatMap((g, part) => g.map((f) => ({ path: f.path, sha256: sha(f.bytes), bytes: f.bytes.length, part, kind: f.kind }))),
                     ...manifestExtra };
  const mBytes = bytes(JSON.stringify(manifest));
  const parts = groups.map((g) => zip([{ name: manifestName, bytes: mBytes }, ...g.map((f) => ({ name: f.path, bytes: f.bytes }))]));
  return { parts, manifest, files, manifestSha: sha(canonicalJson(manifest)) };
}

/** The stand-in manifest check (`case-grammar` R13's `caseFileManifestCheck`): each departure from the shape written here. */
export function manifestCheck(m) {
  const out = [];
  if (!m || typeof m !== "object") return ["the manifest is not an object"];
  if (m.format !== "bio-case-file/1") out.push(`format is ${JSON.stringify(m.format ?? null)}, not bio-case-file/1`);
  for (const k of ["group", "case"]) if (typeof m[k] !== "string" || !m[k]) out.push(`${k} is not named`);
  if (!Number.isInteger(m.edition) || m.edition < 1) out.push("edition is not a positive integer");
  if (!Array.isArray(m.files)) out.push("files is not a list");
  return out;
}

/* ---------------------------------------------------------------- the world */

export function world({ minimal = false } = {}) {
  const st = storage();
  const host = { storage: st, env: {} };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now: NOW };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  /* `minimal`: stand-ins for strength and accepted-work, so record-core's purge meets only tables this world holds */
  /* the producing group is `strength`'s dep (promotion's fact on the plane); accepted-work makes its own promotion */
  const strength = minimal ? { strengthBarOf: () => ({ ok: true, group: SLUG, bar: null }) }
    : strengthOf(host, { record, membership, producingGroup: () => SLUG });
  const acceptedWork = minimal ? { registerAcceptedWork: (module) => ({ ok: true, module }) }
    : acceptedWorkOf(host, { record });
  /* case-checker's checkCaseFile, scripted per finding */
  const script = new Map();
  const checker = { calls: [], throws: false, statement: "Recreating shows the case intact and consistent, not true.",
                    signature: true, versions: { grading_versions: ["g1"], checks_version: "1.55.0" } };
  const checkCaseFile = ({ parts, documents = [] }) => {
    checker.calls.push({ parts: parts.length, documents: documents.length });
    if (checker.throws) throw new Error("checker down");
    const read = readCaseFile(parts);
    const given = new Set(documents.map((d) => sha(d)));
    const m = read.manifest || {};
    const ids = (m.files || []).filter((f) => f.kind === "finding").map((f) => f.path.replace(/^findings\/|\.md$/g, ""));
    return {
      format: m.format ?? null, case: m.case ?? null, edition: m.edition ?? null, group: m.group ?? null,
      checker: checker.versions, integrity: { departures: [] }, signatures: { case: { verified: checker.signature } },
      publication_checks: { findings: [] }, complete_edition: { equal: true }, statement: checker.statement,
      findings: ids.map((id) => {
        const s = script.get(id) || { role: "load_bearing", result: "recreated", pair: { capture: { state: "graded", grade: "B" },
                                                                                          connection: { state: "graded", grade: "C" } } };
        const missing = (s.missing || []).filter((x) => !given.has(x.sha));
        const result = s.result === "recreated_in_part" && !missing.length ? "recreated" : s.result;
        return { finding: id, role: s.role ?? "load_bearing", result, missing, differs: s.differs || [], pair: s.pair ?? null,
                 bar_met: "not_asked" };
      }),
    };
  };
  const reeval = { told: [], throws: false,
    acceptanceWithdrawn(q) { reeval.told.push(q); if (reeval.throws) throw new Error("listeners down");
                             return { ok: true, told: true, kind: "acceptance", withdrawal: q.withdrawal, dependents: 0 }; } };
  const w = {
    st, host, record, membership, strength, acceptedWork, clock, script, checker, reeval,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n,
    /** Every table's rows, for "nothing written", "append-only" and "byte-identical". */
    snapshot(prefix = "") {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE ? ORDER BY name`, `${prefix}%`))
        out[name] = JSON.stringify([...st.sql.exec(`SELECT * FROM ${name}`)], (k, v) => (v instanceof ArrayBuffer ? sha(new Uint8Array(v)) : v));
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    /** This group's default bar, as `strengthBarSet` leaves it. */
    bar({ capture = null, connection = null } = {}) {
      st.sql.exec(`INSERT OR REPLACE INTO group_strength_bar (group_id, capture, connection, author, at, reason) VALUES (?,?,?,?,?,?)`,
                  SLUG, capture, connection, "member:alice", "2026-10-01T00:00:00Z", "the group's standard");
    },
  };
  w.ci = caseImportOf(host, { record, membership, strength, acceptedWork, reevaluation: reeval,
                              checkCaseFile, caseFileManifestCheck: manifestCheck, now: () => clock.now });
  return w;
}

/** The common world: alice and bob active members, carol revoked, dave invited (not yet active). */
export function seeded(opts) {
  const w = world(opts);
  w.member("alice");
  w.member("bob");
  w.member("carol", { status: "revoked" });
  w.member("dave", { status: "invited" });
  return w;
}

/** Imports a case file as alice (or `who`). */
export function imp(w, file = caseFile(), who = "alice") {
  return w.ci.importCaseFile({ parts: file.parts, by: V(who), viewer: V(who) });
}

/** A refusal of this module's own: its code, its row and its translation (R14). */
export const rowOk = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, CASE_IMPORT_CHECKS[code].check);
  assert.equal(r.translation, CASE_IMPORT_CHECKS[code].translation);
};
/* Refused with nothing written anywhere; then the control, accepted. */
export function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  const r = bad();
  rowOk(r, code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 300)}`);
  return r;
}
