/* The bias module over the real modules it uses: record-core (its schema and `recordOf`), membership (its schema,
   migrated) and promotion, over node:sqlite (SQLite, the engine a Durable Object runs), with this module's tables.
   Each world is its own storage, so `biasOf` answers a fresh instance. Every test drives the module at its interface:
   the promotion it joins, its services and its ops. Also: documents in the catalogue's grammar. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { biasOf, biasOps, BIAS_SCHEMA } from "../../../src/bias/index.mjs";

export const sha = (s) => createHash("sha256").update(Buffer.from(String(s), "utf8")).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const run = (sql, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const st of bare.split(";")) if (st.trim()) sql.exec(st);
};

export const T0 = "2026-07-01T00:00:00Z";
export const T1 = "2026-07-02T00:00:00Z";
export const RESIDUE = "BIO checks that each statement below names a registered subject and carries a justification. "
  + "It does NOT check whether a second source was independent of the first.";

/** A statement, well formed unless overridden. */
export const S = (id, over = {}) => ({ id, kind: "scrutiny", subject: "ENT-2026-0007",
  text: `Statement ${id}: claims from this office need a second, independent record before they bear load.`,
  justification: `Why ${id} is held: the office is a party to matters this group examines.`, citations: [],
  locked: false, ...over });

/** A bias set's front matter, well formed unless overridden. */
export const FM = (id, over = {}) => ({
  id, object_type: "bias", title: `Lens ${id}`, current_state: "draft", prior_state: null,
  created: T0, last_updated: T0, group: "test-group", statements: [S("s1")], ...over });

const scalar = (v) => v === null ? "null" : typeof v === "string" ? JSON.stringify(v)
  : typeof v === "boolean" || typeof v === "number" ? String(v) : JSON.stringify(v);

/** Front matter in the catalogue's grammar (arrays of maps in flow style inside an item, which it parses). */
export function yaml(fm) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (v === undefined) continue;
    if (Array.isArray(v) && v.length && v[0] && typeof v[0] === "object") {
      lines.push(`${k}:`);
      for (const row of v) {
        const keys = Object.entries(row).filter(([, x]) => x !== undefined);
        lines.push(`  - ${keys[0][0]}: ${scalar(keys[0][1])}`);
        for (const [rk, rv] of keys.slice(1)) lines.push(`    ${rk}: ${Array.isArray(rv) ? JSON.stringify(rv) : scalar(rv)}`);
      }
    } else if (Array.isArray(v)) lines.push(`${k}: ${v.length ? JSON.stringify(v) : "[]"}`);
    else lines.push(`${k}: ${scalar(v)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

/** A bias set's bundle.md: its front matter and its sections, the residue section as given (null leaves it out). */
export const biasMd = (fm, residue = RESIDUE) => [yaml(fm), "", "## Statements", "", "The lens.", "",
  "## Adoption", "", "Adopted by the group.", "",
  ...(residue === null ? [] : ["## What This Does Not Enforce", "", residue, ""]),
  "## Session Log", "", "## Review Notes", ""].join("\n");

export function world(opts = {}) {
  /* `entities` absent is no registry (null); `entities: undefined` given reaches the real one (`entitiesOf`). */
  const entities = "entities" in opts ? opts.entities : null, env = opts.env || {};
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...args) {
    const st = db.prepare(q);
    return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
  } };
  let n = 0;
  const storage = { sql, transactionSync(fn) {
    const sp = `sp${n++}`;
    db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
    catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
  } };
  run(sql, RECORD_SCHEMA);
  run(sql, BIAS_SCHEMA);
  db.exec(`CREATE TABLE ai_runs (run TEXT PRIMARY KEY)`);   // another module's table, for "nothing else was written"
  const ctx = { storage };
  const record = recordOf(ctx);
  record.migrate();
  const membership = membershipOf(ctx, { record });
  membership.migrate();
  let clock = Date.parse("2026-07-02T00:00:00Z");
  const promotion = promotionOf(ctx, { record, membership, now: () => new Date(clock).toISOString() });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("citedBy", "legacy-store", () => []);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  const bias = biasOf(ctx, { record, membership, promotion, entities, env });
  const w = {
    db, sql, ctx, record, membership, promotion, bias,
    row: (q, ...a) => sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => sql.exec(q, ...a),
    count: (t) => sql.exec(`SELECT count(*) AS n FROM ${t}`)[0].n,
    dump: () => ["bundles", "files", "history", "manifest", "bias_statements", "bias_adoptions", "bias_debts",
                 "bias_debt_sweeps", "bias_debt_settlements"]
      .map((t) => JSON.stringify(sql.exec(`SELECT * FROM ${t} ORDER BY rowid`))).join("\n"),
    /** Promote a bias set: its creation, or a revision over its head. */
    promote(id, fm, { residue = RESIDUE, replay = false, meta = {}, key = null } = {}) {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: key || `k${n++}`,
        author: "member:ann", files: [{ path: "bundle.md", text: biasMd({ ...fm, id }, residue) }], meta,
        ...(replay ? { replay: true } : {}) });
    },
    /** Write a set and move it along the machine to `state` (draft → proposed → adopted), one promotion each. */
    set(id, statements, state = "adopted", over = {}) {
      const path = { draft: ["draft"], proposed: ["draft", "proposed"], adopted: ["draft", "proposed", "adopted"] }[state];
      let r, prior = null;
      for (const st of path) {
        r = w.promote(id, FM(id, { statements, current_state: st, prior_state: prior, ...over }));
        if (!r.ok) throw new Error(`promote ${id} to ${st}: ${JSON.stringify(r)}`);
        prior = st;
      }
      return r;
    },
    /** A bundle of another type (a project, for a project scope), written straight into record-core. */
    bundle(id, type = "project") {
      record.transact(() => record.commit({ bundleId: id, type, title: id, project: null, snapKey: "p0", kind: "promotion",
        base: sha(""), author: "x", writer: null, operation: null,
        files: [{ path: "bundle.md", text: `---\nid: ${id}\n---\n`, sha256: sha(`---\nid: ${id}\n---\n`), bytes: 10 }],
        state: "forming", priorState: null, group: "test-group", created: T0, lastUpdated: T0, criticality: null, at: T0 }));
      if (type === "project") membership.reindexProjectSight(id);
      return id;
    },
    tick(ms = 60000) { clock += ms; return clock; },
    ops(query = "", body = null) { return biasOps(bias, new URL(`http://x/?${query}`), body); },
    /* Members: the founder claims; an administrator; members enrolled all the way to active. */
    async group(...members) {
      await membership.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    async enrol(id, role = "member") {
      const a = await membership.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: null, by: "admin" });
      if (!a.ok) throw new Error(`memberAdd ${id}: ${JSON.stringify(a)}`);
      return membership.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
    },
    /** A project owned by `owner` (a member id). */
    project(id, owner) {
      w.bundle(id, "project");
      membership.projectClaimOwner({ projectId: id, memberId: owner });
      membership.reindexProjectSight(id);
      return id;
    },
  };
  return w;
}

/** A work-product source over a plain map, for the debt (R33): `wps[key] = {context, principal, lens, ranUnder,
 *  rerunOf, readers}`; `readers` the viewers that may read it (absent: every viewer). */
export function source(wps) {
  return {
    list: (after, limit) => Object.keys(wps).sort().filter((k) => k > after).slice(0, limit),
    read: async (k) => (wps[k] ? { ...wps[k] } : null),
    visible: async (k, viewer) => !!wps[k] && (!wps[k].readers || wps[k].readers.includes(viewer)),
  };
}
