/* run-productions over the modules it uses, each the real one where it is extracted (record-core, membership,
   promotion, provenance, content), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage.
   The providers not yet extracted are stand-ins the test controls, each written to its requirements' Provides, as
   `runProductionsOf`'s deps take them (K61, K120): ai-runs (R28 `runFor`, R29 `boundOf`/`consumeBound`), strength
   (R26 `candidatePair`, R27 `candidateIndependence`), citation (R5 `retiredNotCitable`), basis-versions (R5
   `basisVersionsOf`, R9 `basisVersions`, R28 `appendVersion`, R40 `onCandidates`), connections (R22 `citesInto`),
   and extraction's readings (content's). Every stand-in records the calls made to it. The tables later modules own
   and this module reads under their read contracts (inquiry R40, basis-versions R38) are created here in their stated
   columns. Every test drives `run-productions` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { runProductionsOf } from "../../../src/run-productions/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export const V = (id) => `member:${id}`;
export const ALICE = "member:alice", ALICE_TOKEN = "member:alice/tok1", BOB = "member:bob";
export const MACHINE = "class:ai";
export const NOW = "2026-09-28T01:00:00Z";
export const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r", PROJ = "PROJ-2026-0001-p";
export const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", HIDDEN_PROJ = "PROJ-2026-0009-h";
export const RUN = "RUN-1", XRUN = "RUN-X";

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  return {
    db, sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/** A text layer's chain, unscoped (content's fixture's). */
export const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];

/* The read contracts of the later modules this one joins (inquiry R40, basis-versions R38), in their stated columns. */
const CONTRACT_TABLES = `
CREATE TABLE IF NOT EXISTS inquiry_basis (bundle_id TEXT, ord INTEGER, role TEXT, target_id TEXT, content_id TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS inquiry_basis_versions (bundle_id TEXT, name TEXT, ord INTEGER, state TEXT, hidden INTEGER,
  claim TEXT, relationship TEXT, derived_from TEXT, run TEXT, kind TEXT, composition TEXT, leg_count INTEGER);
CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (bundle_id TEXT, name TEXT, ord INTEGER, target_id TEXT,
  target_type TEXT, role TEXT, grade TEXT, grade_axis TEXT, grade_source TEXT, ground TEXT, content_id TEXT);
`;

const q = (s) => `"${String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim()}"`;
/** The grammar's one escape (basis-versions' `asWritten`): folds newlines, turns `"` and `\` to `'`, trims. */
export const asWritten = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();

/** An inquiry's document with its versions, in the restricted frontmatter grammar. */
export function inquiryMd(id, versions = []) {
  const vs = versions.length
    ? ["basis_versions:", ...versions.flatMap((v) => [`  - name: ${q(v.name)}`, `    state: "suggested"`])]
    : [];
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
          "current_state: open", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", ...vs, "---", "",
          "## Question", "", "What happened?", "", "## Session Log", ""].join("\n");
}
export function infoMd(id, state = "collected") {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          `current_state: ${state}`, "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}
/** basis-versions' one composer (its R5), as far as this module's check depends on it: every field that defines a
 *  version, in a fixed order, escaped; the ground rows sorted, carrying `asserted_by` and `at` as fields 2 and 3. */
export function basisVersionsOf(fm) {
  const c = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
  return (fm.basis_versions || []).map((v) => {
    const legs = (fm.basis_version_legs || []).filter((l) => l.version === v.name);
    const grounds = (fm.basis_version_grounds || []).filter((g) => g.version === v.name)
      .sort((a, b) => (a.ground < b.ground ? -1 : a.ground > b.ground ? 1 : 0));
    const composition = [
      `name\t${c(v.name)}`, ...(v.kind ? [`kind\t${c(v.kind)}`] : []), `description\t${c(v.description)}`,
      `claim\t${c(v.claim)}`, `relationship\t${c(v.relationship)}`, `derived_from\t${c(v.derived_from)}`,
      ...grounds.map((g) => `ground\t${c(g.ground)}\t${c(g.asserted_by)}\t${c(g.at)}\t${c(g.statement)}`),
      ...legs.map((l, k) => `leg\t${k}\t${c(l.target)}\t${c(l.role)}\t${c(l.grade)}\t${c(l.grade_axis)}\t`
                          + `${c(l.grade_source)}\t${c(l.note)}\t${c(l.date)}\t${c(l.ground)}`),
    ].join("\n");
    return { name: v.name, kind: v.kind ?? null, composition, legs, grounds };
  });
}

export function world({ strengthPair = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  st.db.exec(CONTRACT_TABLES);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("citedBy", "legacy-store", () => []);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  const ex = { readings: {}, readFor: {} };
  const extraction = {
    readingOf: (s) => (ex.readings[s] ? { reading: { page_boxes: null }, chain: null, pageCount: null,
                                          textContainer: null, captureFormat: null, ...ex.readings[s] } : null),
    unitsOf: () => ({ units: [], state: null }),
    capturesReadFor: (b) => (ex.readFor[b] || []).map((capture_sha) => ({ capture_sha, at: null })),
    onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, provenance: prov, extraction, now: () => clock.now });
  content.migrate();

  const calls = [];
  const note = (name, a) => { calls.push({ name, a }); };
  const runs = new Map();
  const bounds = new Map();
  const aiRuns = {
    runFor(run, viewer) {
      note("runFor", { run, viewer });
      const r = typeof run === "string" ? runs.get(run.trim()) : null;
      if (!r) return null;
      if (!membership.inSight(r.context_id, viewer)) return null;
      const { run: id, status, mode, context_type, context_id, principal_plane } = r;
      return { run: id, status, mode, context_type, context_id, principal_plane };
    },
    boundOf(run, bound) {
      note("boundOf", { run, bound });
      const b = bounds.get(`${run}|${bound}`);
      return b ? { ...b } : null;
    },
    consumeBound(run, bound, n) {
      note("consumeBound", { run, bound, n });
      if (!Number.isSafeInteger(n) || n < 0) return { ok: false, code: "AI_RUN_CONSUME_INVALID" };
      if (n === 0) return null;
      const k = `${run}|${bound}`;
      const b = bounds.get(k) || { allowed: 0, consumed: 0 };
      bounds.set(k, { ...b, consumed: b.consumed + n });
      return null;
    },
  };
  const pair = strengthPair || {
    capture: { axis: "capture", state: "unrated", grade: null },
    connection: { axis: "connection", state: "unrated", grade: null },
    testimony: { axis: "testimony", state: "unrated", grade: null },
  };
  const strength = {
    pair, independence: null, error: null,
    candidatePair(a) { note("candidatePair", a); return strength.error ? { pair: null, error: strength.error } : { pair: strength.pair, error: null }; },
    candidateIndependence(a) {
      note("candidateIndependence", a);
      return strength.independence || { checked: a.parts > 1, parts: a.parts, shared: [], complete: a.parts > 1 ? true : null, limit: 200 };
    },
  };
  const retired = new Set();
  const citation = { retiredNotCitable: (id) => { note("retiredNotCitable", { id }); return retired.has(id); } };
  const cites = {};
  const connections = { citesInto: (id) => ({ confirmed: [...(cites[id] || [])].sort(), severed: [] }) };

  const candidateSources = [];
  const basisVersions = {
    asWritten, basisVersionsOf,
    unsplice: false,
    appended: [],
    onCandidates(module, fn) { candidateSources.push({ module, fn }); return { ok: true }; },
    basisVersions({ id, limit, viewer }) {
      note("basisVersions", { id, limit, viewer });
      const rows = st.sql.exec(`SELECT * FROM inquiry_basis_versions WHERE bundle_id=? ORDER BY ord LIMIT ?`, id, limit);
      return { ok: true, total: rows.length, truncated: false,
               versions: rows.map((r) => ({ name: r.name, kind: r.kind, run: r.run, state: r.state,
                                            author: r.author_for_test ?? w.authors[`${id}|${r.name}`] ?? null,
                                            at: w.ats[`${id}|${r.name}`] ?? null, composition: r.composition,
                                            legs: w.legsOf[`${id}|${r.name}`] ?? [], leg_count: r.leg_count,
                                            legs_complete: true, grounds: w.groundsOf[`${id}|${r.name}`] ?? [],
                                            composition_grades: "authored" })) };
    },
    /* basis-versions R28's call; the stand-in re-promotes the question's document with the version added. */
    appendVersion(a) {
      note("appendVersion", a);
      basisVersions.appended.push(a);
      if (basisVersions.unsplice) return { ok: false, reason: "UNSPLICEABLE_BASIS" };
      if (basisVersions.refuse) return basisVersions.refuse;
      const cur = st.sql.exec(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, a.target)[0];
      const held = w.versions[a.target] || (w.versions[a.target] = []);
      held.push({ name: a.version.name });
      const r = promotion.promote({ bundleId: a.target, base: cur.bundle_sha, snapKey: `k${Math.random().toString(16).slice(2)}`,
        author: a.author || a.version.run, files: [{ path: "bundle.md", text: inquiryMd(a.target, held) + (a.log || "") }],
        meta: { object_type: "inquiry" } });
      if (!r.ok) return r;
      const fm = { basis_versions: [{ ...a.version, state: "suggested", hidden: false }],
                   basis_version_grounds: a.grounds.map((g) => ({ version: a.version.name, ...g })),
                   basis_version_legs: a.legs.map((l) => ({ version: a.version.name, ...l })) };
      const v = basisVersionsOf(fm)[0];
      st.sql.exec(`INSERT INTO inquiry_basis_versions (bundle_id, name, ord, state, hidden, claim, relationship,
                     derived_from, run, kind, composition, leg_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                  a.target, a.version.name, held.length - 1, "suggested", 0, a.version.claim ?? null,
                  a.version.relationship, a.version.derived_from ?? null, a.version.run, a.version.kind ?? null,
                  v.composition, a.legs.length);
      w.authors[`${a.target}|${a.version.name}`] = a.author;
      w.ats[`${a.target}|${a.version.name}`] = a.at;
      w.legsOf[`${a.target}|${a.version.name}`] = a.legs.map((l, ord) => ({ ord, ...l }));
      w.groundsOf[`${a.target}|${a.version.name}`] = [...new Set(a.legs.map((l) => l.ground).filter(Boolean))].sort();
      return r;
    },
  };

  const p = runProductionsOf(host, { record, membership, content, connections, aiRuns, strength, citation,
                                     basisVersions, now: () => Date.parse(clock.now) });
  p.migrate();

  const promote = (id, text, type, files = [], register = []) => {
    const cur = st.sql.exec(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id)[0];
    const r = promotion.promote({ bundleId: id, base: cur ? cur.bundle_sha : null, snapKey: `k${Math.random().toString(16).slice(2)}`,
      author: ALICE, files: [{ path: "bundle.md", text }, ...files], meta: { object_type: type }, register });
    if (!r.ok) throw new Error(`fixture promote refused: ${JSON.stringify(r).slice(0, 400)}`);
    return r;
  };

  const w = {
    st, host, record, membership, promotion, prov, content, p, clock, ex, calls, runs, bounds, aiRuns, strength,
    citation, retired, connections, cites, basisVersions, candidateSources,
    versions: {}, authors: {}, ats: {}, legsOf: {}, groundsOf: {},
    row: (qq, ...a) => st.sql.exec(qq, ...a)[0] ?? null,
    rows: (qq, ...a) => st.sql.exec(qq, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    sha: (id) => st.sql.exec(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id)[0]?.bundle_sha ?? null,
    md: (id) => st.sql.exec(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id)[0]?.content ?? null,
    /** Every table's rows, to prove an act wrote nothing. */
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM ${name}`));
      return out;
    },
    inquiry(id, versions = []) { w.versions[id] = versions.slice(); return promote(id, inquiryMd(id, versions), "inquiry"); },
    /** A project, written as record-core's `bundles` read contract holds it (a project's id is the plane's to mint). */
    project(id, participants = []) {
      st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                   VALUES (?, 'project', 'g', ?, 'forming', 't', 't', 'sha')`, id, id);
      for (const m of participants)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                     VALUES (?, ?, 'joined', 0, 't', 't')`, id, m);
      membership.reindexProjectSight(id);
      return id;
    },
    /** An information bundle holding one capture of `text` (provenance's register, first-held order). */
    doc(id, text = `bytes of ${id}`, { state = "collected", read = true, pageCount = 3 } = {}) {
      const s = sha(text);
      const path = `snapshots/${id}.txt`;
      promote(id, infoMd(id, state), "information", [
        { path, text },
        { path: "data/provenance.json", text: JSON.stringify({ documents: [{
          file: path, locator: `https://example.org/${id}`, retrieved: "2026-09-27T00:00:00Z",
          authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
          capture: { method: "acquire", grade: "B", actor_class: "session", sha256: s, encoding: "utf8",
                     bytes: Buffer.byteLength(text) },
          origin: { kind: "named_request" } }] }, null, 2) }],
        [{ sha256: s, path, encoding: "utf8", bytes: Buffer.byteLength(text) }]);
      if (read) ex.readings[s] = { chain: LAYER, pageCount };
      return s;
    },
    /** A run as ai-runs holds it (its Terms), and its declared bounds. */
    run(id, { status = "running", mode = "check", context_type = "inquiry", context_id = Q, principal_plane = ALICE_TOKEN,
              mints = null } = {}) {
      runs.set(id, { run: id, status, mode, context_type, context_id, principal_plane });
      if (mints !== null) bounds.set(`${id}|mints`, { allowed: mints, consumed: 0 });
      return id;
    },
    suggest(over = {}) {
      return p.suggest({ target: Q, kind: "basis-version", run: RUN, name: "a reading",
                         description: "the ledger shows the transfer was approved twice",
                         claim: "the transfer was approved twice", relationship: "and",
                         legs: [], grounds: [], author: ALICE, viewer: ALICE, caller: ALICE, ...over });
    },
  };
  return w;
}

/** A graded pair, every axis resolved (strength's answer shape). */
export const GRADED = {
  capture: { axis: "capture", state: "graded", grade: "B", weakest: { target: DOC } },
  connection: { axis: "connection", state: "unrated", grade: null },
  testimony: { axis: "testimony", state: "unrated", grade: null },
};
