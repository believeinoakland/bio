/* strength over record-core and membership (the real ones) on a real SQLite database (node:sqlite) standing in for a
   Durable Object's storage, with provenance's `register` and `captured_locators` (its R48 read contract) created from
   its own schema. What it reads from `inquiry` and `basis-versions` are providers the test controls, in the shapes of
   those modules' Provides (inquiry R13, R14, R16; basis-versions R11, and the version rows and legs), as
   `strengthOf`'s `deps` take them; so are the registrations it makes with `promotion` (its R39, `registerStep`) and
   `retrieval` (its R62, `registerField`), which record what was registered, and `w.promote` runs the registered
   projection as promotion does, inside one transaction. Every test drives the module at its interface. */
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
/** R15 (DEC-88): an administrator's reason for the group's default bar. */
export const REASON = "Our readers check every claim against the documents themselves.";

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
  /* promotion's and retrieval's registrations (promotion R39, retrieval R62), as they are made. */
  const steps = [], fields = [];
  const promotion = {
    registerStep: (module, step) => { steps.push({ module, ...step }); return { ok: true, module }; },
    fact: () => ({ ok: false, reason: "FACT_UNAVAILABLE" }),
  };
  const retrieval = {
    registerField: (module, field, relation) => { fields.push({ module, field, ...relation }); return { ok: true, module, field }; },
  };
  /* accepted-work's side (its R2; R33): `acceptedFinding` over findings the test holds by `${ref}@${edition}`, each
     optionally seen only by the viewers it lists (null, the plane's own read, sees all); `aw.mode` "absent" answers as
     with nothing registered, "throw" as a registered function that throws (unreadable). */
  const accepted = new Map();
  const aw = { mode: "present", reads: [] };
  const acceptedWork = {
    acceptedFinding: ({ ref, edition, viewer = null }) => {
      aw.reads.push({ ref, edition, viewer });
      if (aw.mode === "absent") return { absent: true };
      if (aw.mode === "throw") return { unreadable: true };
      const f = accepted.get(`${ref}@${edition}`);
      if (!f) return null;
      if (viewer != null && Array.isArray(f.viewers) && !f.viewers.includes(viewer)) return null;
      const { viewers: _v, ...out } = f;
      return out;
    },
  };
  const clock = { now };
  const s = strengthOf(host, { record, membership, inquiry, versions, promotion, retrieval, acceptedWork,
                               producingGroup: () => group, now: () => clock.now });

  const w = {
    st, host, record, membership, s, clock, basis, accepted, aw, ceilings, connection, testimony, subjects, currents, calls, steps, fields,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    /** One promotion of `id` as promotion runs the registered projections (its R39): inside one transaction, which a
     *  throw after the projection (`fail`) rolls back whole. Answers what the projection answered. */
    promote(id, type = "inquiry", { fail = false } = {}) {
      const step = steps.find((x) => x.module === "strength");
      try {
        return st.transactionSync(() => {
          const out = step.project({ bundleId: id, promotedType: type, head: null });
          if (fail) throw new Error("a later step refused");
          return out;
        });
      } catch (e) {
        if (!fail) throw e;
        return { refused: true };
      }
    },
    /** A bundle row (record-core's `bundles`, its R37 read contract). */
    bundle(id, type = "information") {
      st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
                   VALUES (?,?,?,?,?,?,?,?)`, id, type, "g", id, "open", now, now, "x");
    },
    /** A live file (record-core's `files`), for a project's bundle.md. */
    file(id, path, text) {
      st.sql.exec(`INSERT INTO files (bundle_id,path,content,sha256,bytes) VALUES (?,?,?,?,?)`, id, path, text, "x", text.length);
    },
    /** An inquiry and its projected basis. Legs: `{target, role?, grade?, axis?, source?, ground?, edition?}`. As
     *  inquiry projects it (its R12), a leg's `target_edition` is not in the projection: with `edition` given, the
     *  inquiry's bundle.md states it on the authored `basis[ord]`, where the record holds it. */
    inquiry(id, legs = [], subject = null) {
      w.bundle(id, "inquiry");
      basis.set(id, legs.map((l, ord) => ({ ord, target_id: l.target, target_type: l.target.startsWith("INQ-") ? "inquiry" : "information",
        role: l.role ?? "supports", grade: l.grade ?? null, grade_axis: l.axis ?? null, grade_source: l.source ?? null,
        note: null, at: null, ground: l.ground ?? null })));
      if (legs.some((l) => l.edition != null))
        w.file(id, "bundle.md", "---\nbasis:\n" + legs.map((l) => `  - target: "${l.target}"\n    role: supports\n`
          + (l.edition != null ? `    target_edition: ${l.edition}\n` : "")).join("") + "---\n");
      if (subject) subjects.set(id, subject);
    },
    /** Another group's accepted finding as accepted-work answers it (its R1's `finding`), at one edition. */
    acceptedFinding(ref, edition, { pair, group = "other-group", caseId = "CASE-1", finding = "INQ-2026-0500-a", viewers,
                                    acceptance = { by: "member-ann", at: now, reason: "checked", checked: "all", gaps: null } } = {}) {
      accepted.set(`${ref}@${edition}`, { ref, import: ref.slice(9, 73), group, case: caseId, edition, finding,
        manifest_sha: "f".repeat(64), result: "recreated", pair, acceptance, ...(viewers ? { viewers } : {}) });
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
    /** A member's firsthand observation (provenance R28): an information bundle holding one authored capture, its
     *  register row naming the author (provenance R48), optionally retrieved from an address. */
    observation(id, author, sha = `obs-${id}`, address = null) {
      w.bundle(id);
      st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,authored,author,observed_at)
                   VALUES (?,?,?,?,?,?,?,?,?)`, sha, id, "words.txt", "utf8", 1, now, 1, author, now);
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
