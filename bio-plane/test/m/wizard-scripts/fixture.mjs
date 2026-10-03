/* wizard-scripts over the modules it uses, the real ones (record-core, membership, filing-templates, record-grammar) on
   a real SQLite database (node:sqlite) standing in for a Durable Object's storage, answering as workerd's does (a
   cursor). Members and project participations are rows of membership's own tables, written as its acts would leave
   them; a project is a real bundle committed through record-core. The screen registry and the Civicsmith library are
   test ones (the real registry ships with the new interface; the library is empty until the UX stream writes it), and
   the jurisdiction profile is the test profile, whose records-request template filing-templates offers. Every test
   drives `wizard-scripts` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { filingTemplatesOf } from "../../../src/filing-templates/index.mjs";
import { wizardScriptsOf, WizardScripts } from "../../../src/wizard-scripts/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
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
    return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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
export const NOW = "2026-10-03T12:00:00Z";
export const TEST = "test-port-ellery";
/** The test profile's records-request template, which filing-templates offers while the profile is active. */
export const OFFERED_TEMPLATE = "TPL-test-records-request";
const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");

/** A test screen registry: three screens and their acts. */
export const SCREENS = Object.freeze([
  { id: "case-home", acts: ["casenote", "casejoin"] },
  { id: "filing-draft", acts: ["filingsave", "filingapprove"] },
  { id: "publish", acts: ["publish", "whatchangedpropose"] },
]);
export const OPS = Object.freeze(["casenote", "casejoin", "filingsave", "filingapprove", "publish", "whatchangedpropose"]);
/** The acts a machine is refused (affordances' MACHINE_REFUSALS keys, here a test's). */
export const MACHINE_REFUSED = Object.freeze(["filingapprove", "publish"]);
/** The labelled machine drafts (case-authoring R39's ops). */
export const MACHINE_DRAFTS = Object.freeze(["whatchangedpropose", "escalationreasondraft"]);
/** A step, whole. */
export const step = (screen, act, extra = {}) => ({ screen, act, what: `Do ${act ?? "nothing"} on ${screen}`, why: "Because it moves the case", ...extra });
export const STEPS = Object.freeze([step("case-home", "casenote"), step("filing-draft", "filingsave")]);
/** A test Civicsmith library: one required script and one optional. */
export const LIBRARY = Object.freeze([
  { id: "WIZ-2026-9001", name: "Start a case", required: true, version: 2, steps: [step("case-home", "casejoin"), step("case-home", "casenote")],
    approved: { by: "Bob", at: "2026-10-01T00:00:00Z" } },
  { id: "WIZ-2026-9002", name: "Publish", required: false, version: 1,
    steps: [step("publish", "publish", { draft: { machine: "whatchangedpropose" } })], approved: { by: "Bob", at: "2026-10-02T00:00:00Z" } },
]);
export const registration = (x = {}) => ({ screens: SCREENS, ops: OPS, machineRefused: MACHINE_REFUSED, machineDrafts: MACHINE_DRAFTS,
                                           library: LIBRARY, ...x });

export function world({ register = true, reg = {} } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  record.setSetting("jurisdiction_profiles", [TEST], "test");
  const now = () => Date.parse(clock.now);
  const filingTemplates = filingTemplatesOf(host, { record, membership, now });
  let n = 0;
  const w = {
    st, host, record, membership, clock, filingTemplates,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'wiz_%' ORDER BY name`))
        out[name] = JSON.stringify([...st.sql.exec(`SELECT * FROM ${name}`)]);
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    project(slug, owner) {
      const id = `PROJ-2026-${String(++n).padStart(4, "0")}-${slug}`;
      const text = ["---", `id: ${id}`, "object_type: project", `title: "${slug}"`, "current_state: forming", "---", "", "P.", ""].join("\n");
      record.transact(() => record.commit({ bundleId: id, type: "project", title: slug, project: null, snapKey: `b${n}`, kind: "promotion",
        base: EMPTY, author: V(owner), writer: null, operation: null,
        files: [{ path: "bundle.md", text, sha256: sha(text), bytes: Buffer.byteLength(text) }], state: "forming", priorState: null,
        group: "test-group", created: clock.now, lastUpdated: clock.now, criticality: null, at: clock.now }));
      w.join(id, owner, "joined", true);
      return id;
    },
    join(projectId, memberId, state = "joined", owner = false) {
      st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, ?, 't', 't')`, projectId, memberId, state, owner ? 1 : 0);
    },
  };
  w.wz = wizardScriptsOf(host, { record, membership, filingTemplates, now });
  if (register) { const r = w.wz.wizardRegister(registration(reg)); if (!r.ok) throw new Error(JSON.stringify(r)); }
  return w;
}

/** The common world: alice and bob joined owners of P; frank joined in P, not an owner; carol invited to P, not
 *  joined; dave outside P, owner of Q; erin an administrator outside P. */
export function seeded(opts = {}) {
  const w = world(opts);
  for (const m of ["alice", "bob", "carol", "dave", "frank"]) w.member(m);
  w.member("erin", { role: "admin" });
  w.P = w.project("budget", "alice");
  w.join(w.P, "bob", "joined", true);
  w.join(w.P, "frank");
  w.join(w.P, "carol", "invited");
  w.Q = w.project("harbour", "dave");
  return w;
}

/** The object constructed again on the same storage (a Durable Object's next wake), registered with `reg`'s changes. */
export function restart(w, reg = {}) {
  const x = new WizardScripts({ storage: w.st, record: w.record, membership: w.membership, filingTemplates: w.filingTemplates,
                                now: () => Date.parse(w.clock.now) });
  x.migrate();
  const r = x.wizardRegister(registration(reg));
  if (!r.ok) throw new Error(JSON.stringify(r));
  x.registered = r;
  return x;
}

const must = (r, what) => { if (!r || !r.ok) throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 400)}`); return r; };
/** A recorded draft in P by `who` (default frank), its steps revised to `steps`. */
export function draft(w, { who = "frank", steps = STEPS, name = "Note and save", project = null } = {}) {
  const d = must(w.wz.wizardDraft({ project: project ?? w.P, name, recorded: steps.map((s) => ({ screen: s.screen, act: s.act ?? null })),
                                    author: V(who), viewer: V(who) }), "draft");
  must(w.wz.wizardRevise({ version: d.version, steps, author: V(who), viewer: V(who) }), "revise");
  return d;
}
/** A draft submitted by its author and approved by alice (an owner who is not its author). */
export function approved(w, x = {}) {
  const d = draft(w, x);
  const who = x.who ?? "frank";
  must(w.wz.wizardSubmit({ version: d.version, author: V(who), viewer: V(who) }), "submit");
  const by = x.by ?? "alice";
  must(w.wz.wizardApprove({ version: d.version, by: V(by), viewer: V(by) }), "approve");
  return d;
}
