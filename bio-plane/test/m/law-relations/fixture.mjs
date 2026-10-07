/* law-relations over the modules it uses, each the real one (record-core, membership, content, and the provenance
   content builds on the same host), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage
   at the plane's shape (K313, K316: `sql.exec` answers a cursor, never an array, and refuses a LIKE or GLOB pattern over
   workerd's 50 bytes). The readings content reads through extraction are a provider the test controls.

   The host (R13) is the test's own: `standards` is a later module, which this module's tests may not import (P4; the
   architecture check reads test files too). A small table of stand-in standards, `{id, kind, portion_path, instrument,
   period, texts}`, answers `row`, `texts`, `idsAtKey`, `idsOfKind` and `idsCovering`; each stand-in is a bundle of
   record-core's (type `standard`), so `readable` is membership's sight over it, as `standards` reads it. The refusals
   named "the host's" are minted here as plain coded answers, so a test can tell them from this module's own rows.
   Nothing here creates a `standards` table: every service runs with none held (R13). No place is named (R17). */
import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { recogniseCitations } from "../../../src/idspaces.mjs";
import { LawRecords, weakestCeiling } from "../../../src/law-relations/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s), "utf8").digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export const WORKERD_PATTERN_CAP = 50;

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
  };
  return c;
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
      const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
      if ([...literal, ...bound].some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP))
        throw new Error("LIKE or GLOB pattern too complex");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    db, sql, rows: (q, ...a) => [...sql.exec(q, ...a)],
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const REASON = "The selectboard cites it in its permits, so the group records how the two bear on each other.";
const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];

/* The host's refusals, as `standards` mints them: a code and a sentence, never this module's rows. */
const hostRefusal = (code, extra = {}) => ({ ok: false, reason: code, code, host: true, detail: `the host's ${code}`, ...extra });

/** A world: the real record-core, membership and content over one storage, a host over them, and `law`, the
 *  `LawRecords` constructed over the host (unless `construct: false`). `members`: bob and carol members, alice an
 *  administrator. */
export function world({ construct = true, lookup = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const ex = { readings: {}, units: {} };
  const extraction = {
    readingOf: (s) => (ex.readings[s] ? { reading: { page_boxes: null }, chain: LAYER, pageCount: 3, textContainer: null,
                                          captureFormat: null, ...ex.readings[s] } : null),
    unitsOf: (s) => ex.units[s] || { units: [], state: null },
    capturesReadFor: () => [],
    onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, extraction, now: () => "2026-10-01T00:00:00Z" });
  content.provenance.migrate();
  content.migrate();
  const standards = new Map();     // the stand-in standards, by id
  const events = new Map();        // the stand-in events, by id: {day, bundle}
  let n = 0, tick = 0;
  const bundle = (id, type, project = null) => {
    st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated,
                   bundle_sha, row_version, project) VALUES (?, ?, 'g', 't', 'recorded', '2026-01-01', '2026-01-01', 'x', 1, ?)`,
                id, type, project);
    return id;
  };
  const readable = (id, viewer) => viewer !== null && viewer !== undefined && membership.inSight(id, viewer);
  const periodOf = (row) => ({ from: row ? row.period_from ?? null : null, to: row ? row.period_to ?? null : null });
  const inPeriod = (row, day) => !((row.period_from && row.period_from > day) || (row.period_to && row.period_to < day));
  const calls = { lookup: [] };
  const reads = {
    sql: st.sql, record, membership,
    rows: (q, ...a) => st.rows(q, ...a), one: (q, ...a) => st.rows(q, ...a)[0] ?? null,
    row: (id) => { const s = standards.get(id); return s ? { standard_id: s.id, kind: s.kind, portion_path: s.portion_path,
                                                              instrument: s.instrument, period_from: s.period_from,
                                                              period_to: s.period_to } : null; },
    texts: (id) => [...(standards.get(id)?.texts ?? [])],
    readable, content: () => content,
    when: () => new Date(Date.UTC(2026, 9, 7, 12, 0, tick++)).toISOString().replace(/\.\d{3}Z$/, "Z"),
    nonce: () => randomBytes(8).toString("hex"),
    inForceAt: ({ standard, date, viewer = null }) => {
      const r = reads.row(standard);
      if (!r || (viewer != null && !readable(standard, viewer))) return hostRefusal("NO_SUCH_STANDARD", { standard });
      if (!r.period_from || !r.period_to)
        return inPeriod(r, date) ? { ok: true, date, standard, state: "undetermined", why: "the period is open" }
                                 : { ok: true, date, standard, state: "not_in_force", why: "outside its period" };
      return { ok: true, date, standard, state: inPeriod(r, date) ? "in_force" : "not_in_force", why: "its stated period" };
    },
    periodOf,
    eventDay: (event, edge, viewer) => {
      const e = events.get(event);
      return e && (viewer == null || membership.inSight(e.bundle, viewer)) && e.day ? { day: e.day, why: null }
        : { day: null, why: `the event ${event} is not held, or may not be read` };
    },
    eventWhen: (event, viewer) => { const d = reads.eventDay(event, "start", viewer); return d.day ? d : null; },
    gradeOf: (ids) => weakestCeiling(ids.length ? content.standings(ids) : {}, ids),
    zone: () => "UTC",
    recognise: (t) => recogniseCitations(t),
    citationLookup: async (a) => { calls.lookup.push(a); return lookup ? lookup(a) : { ok: false, reason: "KEYED_SERVICE_OFF" }; },
    idsAtKey: (key, portion) => [...standards.values()].filter((s) => s.instrument === key && (portion === null || s.portion_path === portion))
      .map((s) => s.id).sort(),
    idsOfKind: (kind, limit) => [...standards.values()].filter((s) => s.kind === kind).map((s) => s.id).sort().slice(0, limit),
    idsCovering: (day) => [...standards.values()].filter((s) => inPeriod(s, day)).map((s) => s.id).sort(),
    noSuchStandard: (id, extra) => hostRefusal("NO_SUCH_STANDARD", { standard: id, ...(extra || {}) }),
    portionUnknown: (end, standard, portion) => hostRefusal("PORTION_UNKNOWN", { end, standard, portion }),
    refuseNoId: (op) => hostRefusal("STANDARD_NO_ID", { op }),
    refuseDateInvalid: (date) => hostRefusal("STANDARD_DATE_INVALID", { date }),
    refuseFieldUnknown: (a, keys) => {
      const unknown = Object.keys(a).filter((k) => !keys.includes(k)).sort();
      return unknown.length ? hostRefusal("STANDARD_FIELD_UNKNOWN", { rejected: unknown, accepted: [...keys] }) : null;
    },
    refuseReason: (fault) => hostRefusal("STANDARD_NO_REASON", { fault }),
    refuseNoSuchProposal: (id) => hostRefusal("STANDARD_NO_SUCH_PROPOSAL", { proposal: id }),
    refuseProposalAdopted: (id, as) => hostRefusal("STANDARD_PROPOSAL_ADOPTED", { proposal: id, adopted_as: as }),
    refuseProposerUnnamed: () => hostRefusal("STANDARD_PROPOSER_UNNAMED"),
    refuseWhyInvalid: () => hostRefusal("STANDARD_WHY_INVALID"),
  };
  const w = {
    st, host, record, membership, content, ex, reads, standards, events, calls,
    law: construct ? new LawRecords(reads) : null,
    build: () => new LawRecords(reads),
    rows: (q, ...a) => st.rows(q, ...a),
    count: (t) => st.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    tables: () => new Set(st.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)),
    snapshot() {
      const out = {};
      for (const { name } of st.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = st.rows(`SELECT * FROM ${name}`);
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    /** A project with `owner` its joined owner: a bundle membership withholds from everyone else. */
    project(owner) {
      const id = bundle(`PROJ-2026-${String(++n).padStart(4, "0")}-p`, "project");
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, owner);
      return id;
    },
    /** A captured document with a passage of it minted as content: its content id. `words` indexes the passage's
     *  text; `project` files the document in that project. */
    passage({ words = null, project = null } = {}) {
      const name = `doc${++n}`, capSha = sha(`bytes of ${name}`);
      const id = bundle(`INFO-2026-${String(n).padStart(4, "0")}-${name}`, "information", project);
      ex.readings[capSha] = { chain: LAYER, pageCount: 3 };
      if (words !== null) ex.units[capSha] = { units: [{ extent: { kind: "pdf-page", page: 0 }, text: words, seq: 0 }], state: "whole" };
      const m = content.mint({ bundleId: id, captureSha: capSha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("alice") });
      if (!m.ok) throw new Error(`fixture mint refused: ${JSON.stringify(m).slice(0, 300)}`);
      return m.content_id;
    },
    /** A stand-in standard: a bundle of type `standard` (in `project` when given) and its row. Its text is one fresh
     *  passage unless `texts` names them. */
    standard({ kind = "statute", portion = null, key = null, from = "2010-01-01", to = "2030-12-31", texts = null,
               project = null } = {}) {
      const id = bundle(`STD-2026-${String(++n).padStart(4, "0")}-${kind}`, "standard", project);
      const t = texts ?? [w.passage()];
      standards.set(id, { id, kind, portion_path: portion, instrument: key, period_from: from, period_to: to, texts: t });
      return { id, t: t[0], texts: t };
    },
    /** A stand-in event, dated `day` (or undated), seen as `project`'s bundle is seen when given. */
    event({ day = null, project = null } = {}) {
      const id = `EVT-2026-${String(++n).padStart(16, "0")}`;
      events.set(id, { day, bundle: bundle(`INFO-2026-${String(n).padStart(4, "0")}-ev`, "information", project) });
      return id;
    },
  };
  return w;
}

/** bob and carol members, alice an administrator. */
export function seeded(opts) {
  const w = world(opts);
  w.member("alice", { role: "admin" });
  w.member("bob");
  w.member("carol");
  return w;
}

export const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
