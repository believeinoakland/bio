/* strength over record-core and membership (the real ones) on a real SQLite database (node:sqlite) standing in for a
   Durable Object's storage, with provenance's `register` and `captured_locators` (its R48 read contract) created from
   its own schema. What it reads from `inquiry` and `basis-versions` are providers the test controls, in the shapes of
   those modules' Provides (inquiry R13, R14, R16; basis-versions R11, and the version rows and legs), as
   `strengthOf`'s `deps` take them. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/index.mjs";
import { strengthOf, GRADE_RANK } from "../../../src/strength/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const statements = (ddl) => ddl.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
  .split(";").map((t) => t.trim()).filter(Boolean);

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

/* The version tables as basis-versions holds them: only the columns this module reads. */
const VERSION_DDL = `
CREATE TABLE inquiry_basis_versions (bundle_id TEXT NOT NULL, name TEXT NOT NULL, ord INTEGER NOT NULL DEFAULT 0,
  description TEXT, relationship TEXT, state TEXT NOT NULL, hidden INTEGER NOT NULL DEFAULT 0, derived_from TEXT,
  kind TEXT, run TEXT, author TEXT, at TEXT, leg_count INTEGER NOT NULL, PRIMARY KEY (bundle_id, name));
CREATE TABLE inquiry_basis_version_legs (bundle_id TEXT NOT NULL, name TEXT NOT NULL, ord INTEGER NOT NULL,
  target_id TEXT NOT NULL, target_type TEXT NOT NULL, role TEXT NOT NULL, grade TEXT, grade_axis TEXT,
  grade_source TEXT, note TEXT, at TEXT, ground TEXT NOT NULL, PRIMARY KEY (bundle_id, name, ord));
`;

export const MACHINE = "class:member";
export const ADMIN = "admin-ann", MEMBER = "mem-bo";

/** One world: the store, the controlled providers, and helpers that write what they read. */
export function world({ group = "grp-one", now = "2026-09-28T00:00:00.000Z" } = {}) {
  const st = storage();
  const host = { storage: st };
  for (const t of statements(RECORD_SCHEMA)) st.db.exec(t);
  for (const t of statements(PROVENANCE_SCHEMA)) st.db.exec(t);
  for (const t of statements(VERSION_DDL)) st.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();

  /* inquiry's side: the projected legs (R16), the earned registry (R13) and `legCapped` (R14). */
  const basis = new Map();            // inquiry id → legs
  const ceilings = new Map();         // document id → {grade, why, undetermined_because?} (capture ceiling)
  const connection = new Map();       // `${subject}|${doc}` → grade
  const testimony = new Map();        // doc → grade (a member's authored observation)
  const subjects = new Map();         // inquiry → subject entity
  const calls = { earned: 0, limits: [] };
  const inquiry = {
    basisFor: (id, { limit = null } = {}) => {
      calls.limits.push(limit);
      const all = (basis.get(id) || []).map((l) => ({ ...l }));
      return Number.isInteger(limit) && limit > 0
        ? { ok: true, bundleId: id, legs: all.slice(0, limit), limit, truncated: all.length > limit }
        : { ok: true, bundleId: id, legs: all };
    },
    earned: (subject, targets) => {
      calls.earned++;
      const out = { capture: {}, connection: {}, testimony: {} };
      for (const t of targets) {
        if (ceilings.has(t)) out.capture[t] = { mode: "ceiling", ...ceilings.get(t) };
        const c = connection.get(`${subject}|${t}`);
        if (c) out.connection[t] = { mode: "value", grade: c, why: `${t} resolves to ${subject} at ${c}` };
        if (testimony.has(t)) out.testimony[t] = { mode: "value", grade: testimony.get(t), why: `${t} is an observation` };
      }
      return { subject_entity: subject || null, subject_known: !!subject, earned: out };
    },
    legCapped: (stated, earned, targetId) => {
      if (!earned || earned.mode !== "ceiling") return null;
      if (earned.grade == null) return { grade: null, why: earned.why ?? "undetermined ceiling" };
      if (GRADE_RANK[stated] <= GRADE_RANK[earned.grade]) return null;
      return { grade: earned.grade, why: `the record can support no more than ${earned.grade} for ${targetId}` };
    },
    subjectEntityOf: (id) => subjects.get(id) ?? null,
  };
  /* basis-versions' side: a project's CURRENT (R11). */
  const currents = new Map();         // `${project}|${inquiry}` → version
  const versions = {
    currentOf: (project, inq, viewer) => {
      const v = currents.get(`${project}|${inq}`);
      return v && membership.inSight(project, viewer) ? { project, version: v } : null;
    },
  };
  const clock = { now };
  const s = strengthOf(host, { record, membership, inquiry, versions, producingGroup: () => group, now: () => clock.now });

  const w = {
    st, host, record, membership, s, clock, basis, ceilings, connection, testimony, subjects, currents, calls,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    /** A bundle row (record-core's `bundles`, its R37 read contract). */
    bundle(id, type = "information") {
      st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
                   VALUES (?,?,?,?,?,?,?,?)`, id, type, "g", id, "open", now, now, "x");
    },
    /** A live file (record-core's `files`), for a project's bundle.md. */
    file(id, path, text) {
      st.sql.exec(`INSERT INTO files (bundle_id,path,content,sha256,bytes) VALUES (?,?,?,?,?)`, id, path, text, "x", text.length);
    },
    /** An inquiry and its projected basis. Legs: `{target, role?, grade?, axis?, source?, ground?}`. */
    inquiry(id, legs = [], subject = null) {
      w.bundle(id, "inquiry");
      basis.set(id, legs.map((l, ord) => ({ ord, target_id: l.target, target_type: l.target.startsWith("INQ-") ? "inquiry" : "information",
        role: l.role ?? "supports", grade: l.grade ?? null, grade_axis: l.axis ?? null, grade_source: l.source ?? null,
        note: null, at: null, ground: l.ground ?? null })));
      if (subject) subjects.set(id, subject);
    },
    /** A stored version of an inquiry's basis, its legs as `inquiry` (`ground` required on a version). */
    version(inq, name, state, legs, { legCount = legs.length } = {}) {
      st.sql.exec(`INSERT INTO inquiry_basis_versions (bundle_id,name,state,leg_count,description,relationship)
                   VALUES (?,?,?,?,?,?)`, inq, name, state, legCount, "d", "and");
      legs.forEach((l, ord) => st.sql.exec(
        `INSERT INTO inquiry_basis_version_legs (bundle_id,name,ord,target_id,target_type,role,grade,grade_axis,grade_source,ground)
         VALUES (?,?,?,?,?,?,?,?,?,?)`, inq, name, ord, l.target, l.target.startsWith("INQ-") ? "inquiry" : "information",
        l.role ?? "supports", l.grade ?? null, l.axis ?? null, l.source ?? null, l.ground ?? ""));
    },
    /** A registered capture in a bundle, optionally retrieved from an address (provenance R48). */
    capture(sha, bundleId, address = null) {
      st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
                  sha, bundleId, "data/x.pdf", "binary", 1, now);
      if (address)
        st.sql.exec(`INSERT INTO captured_locators (address_norm,address,capture_sha,first_retrieved,last_retrieved)
                     VALUES (?,?,?,?,?)`, address, address, sha, now, now);
    },
    /** A member of the group, an administrator or not. */
    member(id, role = "member", status = "active") {
      st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?,?,?,?,?,?)`, id, id, role, status, now, now);
    },
    /** A project and its participants. */
    project(id, participants = []) {
      w.bundle(id, "project");
      for (const m of participants)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?,?,?,?,?)`,
                    id, m, "joined", now, now);
    },
  };
  return w;
}
