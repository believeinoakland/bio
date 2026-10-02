/* provenance-routes over the modules it uses, each the real one (record-core, membership, credentials, promotion), on
   a real SQLite database (node:sqlite) standing in for a Durable Object's storage at its shape: `sql.exec`, answering
   a cursor as workerd does, and `transactionSync`, which rolls back what `fn` wrote when it throws and nests as
   savepoints. Every test drives the module at its interface; the bundles it reads are written through promotion's
   own `promote`. The world composes `provenance` only when asked (`withProvenance`): this module uses provenance's
   exports (`DOORBELL_ORIGIN`, `PROVENANCE_ACT_CHECKS`), never its instance, and the composition test builds both in
   the composition root's order. The share of `provenance`'s fixture these tests need, taken as N512 moved them. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { provenanceRoutesOf } from "../../../src/provenance-routes/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/* A cursor as workerd's `sql.exec` answers one (K316): an iterator over the rows, read once, with `toArray()` and
   `one()`; never an array, so `[0]` or `.length` on it is undefined, as in a Durable Object. */
function cursor(rows) {
  let i = 0;
  const c = {
    columnNames: rows.length ? Object.keys(rows[0]) : [],
    rowsRead: rows.length,
    rowsWritten: 0,
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
    raw() { return c.toArray().map((r) => Object.values(r))[Symbol.iterator](); },
  };
  return c;
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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

/** A record: the modules on one storage, the producing group registered as promotion's fact (instance-setup's, K69),
 *  and a clock the test controls. Credentials is built after membership, as the composition root builds it (K789).
 *  With `withProvenance`, provenance is built before this module, as the composition root builds them (layer 3's
 *  order: provenance, attestation, provenance-routes). */
export function world({ group = "test-group", now = "2026-09-27T03:00:00.000Z", instanceName = "test-instance",
                        withProvenance = false } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const credentials = credentialsOf(host, { record, membership });
  credentials.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  const facts = { group };
  promotion.registerFact("producingGroup", "instance-setup", () => facts.group);
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  let prov = null;
  if (withProvenance) {
    prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now, instanceName });
    prov.migrate();
  }
  const routes = provenanceRoutesOf(host, { record, membership, promotion, now: () => clock.now, instanceName });
  routes.migrate();
  const w = {
    st, host, record, membership, credentials, promotion, prov, routes, clock, facts,
    row: (q, ...a) => [...st.sql.exec(q, ...a)][0] ?? null,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => [...st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)][0].n,
    /** Every row of every table, for "nothing was written". */
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify([...st.sql.exec(`SELECT * FROM ${name}`)]);
      return out;
    },
    /** Promote an information bundle with a register document for each capture. */
    promoteInfo(id, { captures = [], base = null, state = "collected", docs = null, pkg = {}, criticality = "supporting",
                      title = `Document ${id}` } = {}) {
      const files = [];
      const documents = docs ?? captures.map((c) => provDoc(c));
      for (const c of captures) files.push({ path: c.path, text: c.text });
      files.unshift({ path: "bundle.md", text: infoMd(id, { state, criticality, title }) });
      files.push({ path: "data/provenance.json", text: JSON.stringify({ documents }, null, 2) });
      return promotion.promote({
        bundleId: id, base, snapKey: `k${Math.random().toString(16).slice(2)}`, author: "member:alice",
        files, meta: { object_type: "information" },
        register: captures.map((c) => ({ sha256: sha(c.text), path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })),
        ...pkg,
      });
    },
    /** A bundle that is not information, held through record-core's one write path. */
    inquiry(id) {
      const md = `---\nid: ${id}\n---\n`;
      return record.transact(() => record.commit({ bundleId: id, type: "inquiry", title: "Q", project: null,
        snapKey: id, kind: "promotion", base: "", author: V("ruth"), writer: null, operation: null,
        files: [{ path: "bundle.md", text: md, sha256: sha(md), bytes: Buffer.byteLength(md) }],
        state: "open", priorState: null, group: "test-group", created: T, lastUpdated: T, criticality: null, at: T }));
    },
    /** Fence a bundle inside a project no member participates in (record-core R34's `project`, which membership R43
     *  fences by): a `member:` viewer no longer sees it, the founder's viewer still does. */
    fence: (id, projectId = "PROJ-2026-0001-fenced") => st.sql.exec(`UPDATE bundles SET project = ? WHERE bundle_id = ?`, projectId, id),
    head: (id) => record.head(id),
    /** A capture, held as a file of an information bundle. */
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
  };
  return w;
}

const T = "2026-09-27T00:00:00Z";

export function infoMd(id, { state = "collected", criticality = "supporting", title = `Document ${id}` } = {}) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: ${JSON.stringify(title)}`,
          `current_state: ${state}`, "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", `criticality: ${criticality}`,
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

/** A C-18.1-conformant register document for one capture, its route recorded (a fetched address, an instant, a
 *  method). */
export function provDoc(c, extra = {}) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: sha(c.text), encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
    ...extra,
  };
}

export const V = (id) => `member:${id}`;
