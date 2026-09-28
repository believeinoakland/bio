/* standards over the modules it uses, each the real one (record-core, membership, promotion, content, and the
   provenance content builds on the same host), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage. The readings
   content reads through extraction are a provider the test controls, as `contentOf`'s `deps.extraction` takes it.
   Jurisdiction profiles are the real ones: the test profile (`test-port-ellery`), and profile objects a test writes
   (never Oakland's, `layers.md` rule 3). Every test drives `standards` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { standardsOf } from "../../../src/standards/index.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

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

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const NOW = "2026-09-28T01:00:00.000Z";
export const TEST_PROFILE = "test-port-ellery";
/** A citation the test profile's first source (the bylaws, `ordinance`, `city`) recognises, and one none does. */
export const BYLAW = "PEBL § 12", UNKNOWN_CITE = "Some Code § 4";
const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];

/** A profile object of the test's own, valid under `jurisdictions.validate`, with the given standard sources. */
export function profile(id, sources) {
  return { id, name: `Profile ${id}`, covers: [`Place ${id}`], test: true, standard_sources: sources };
}
export const src = (source, re, extra = {}) => ({ source, kind: "statute", issuer: `Issuer of ${source}`, level: "state",
                                                  cite: { re }, basis: "TEST", ...extra });

/** `written`: profile objects the test wrote, which the instance setting names by id; `jurisdictions.combine` (the
 *  real one) is handed the object for such an id and the id itself for a held profile. */
export function world({ now = NOW, profiles = [TEST_PROFILE], written = [] } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("citedBy", "legacy-store", () => []);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  const ex = { readings: {}, units: {} };
  const extraction = {
    readingOf: (s) => (ex.readings[s] ? { reading: { page_boxes: null }, chain: LAYER, pageCount: 3, textContainer: null,
                                          captureFormat: null, ...ex.readings[s] } : null),
    unitsOf: (s) => ex.units[s] || { units: [], state: null },
    capturesReadFor: () => [],
    onReading: () => ({ ok: true }),
  };
  /* content builds provenance on the same host (standards does not use provenance); the fixture reaches it there to
     migrate it and to record where a capture was retrieved from, for R5's newer capture. */
  const content = contentOf(host, { record, membership, extraction, now: () => clock.now });
  const prov = content.provenance;
  prov.migrate();
  content.migrate();
  if (profiles !== null) record.setSetting("jurisdiction_profiles", profiles, "admin");
  const byId = new Map(written.map((p) => [p.id, p]));
  const s = standardsOf(host, { record, membership, promotion, content, now: () => clock.now,
                                combine: (ids) => combine(ids.map((id) => byId.get(id) ?? id)) });
  s.migrate();
  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, content, s, clock, ex,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    fm: (id) => { const t = record.readFile(id, "bundle.md")?.text; return t ? parseFrontmatter(t).data : null; },
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = st.sql.exec(`SELECT * FROM ${name}`);
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    /** A captured document (an information bundle holding one capture), read with a text layer, and a passage of it
     *  minted as content: its content id. `project` files the document in that project instead. */
    passage(name = `doc${++n}`, { page = 0, address = null, retrieved = "2026-09-01T00:00:00Z" } = {}) {
      const text = `bytes of ${name}`, capSha = sha(text), id = `INFO-2026-${String(++n).padStart(4, "0")}-${name}`;
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${n}`, author: V("alice"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path: `snapshots/${name}.txt`, text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(`snapshots/${name}.txt`, capSha, text)] }) }],
        meta: { object_type: "information" },
        register: [{ sha256: capSha, path: `snapshots/${name}.txt`, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
      if (!r.ok) throw new Error(`fixture document refused: ${JSON.stringify(r).slice(0, 400)}`);
      ex.readings[capSha] = { chain: LAYER, pageCount: 3 };
      if (address) prov.recordReceipt({ address, addressNorm: address.replace(/^https?:\/\//, ""), captureSha: capSha, retrieved });
      const m = content.mint({ bundleId: id, captureSha: capSha, extent: { kind: "pdf-page", page }, mintedBy: V("alice") });
      if (!m.ok) throw new Error(`fixture mint refused: ${JSON.stringify(m).slice(0, 400)}`);
      return { contentId: m.content_id, bundleId: id, capSha };
    },
    /** A project owned by `owner`, through promotion. */
    project(title, owner) {
      const r = promotion.promote({ base: null, snapKey: `p${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** A standard declared by bob over a fresh passage, with the given fields over the defaults. */
    declare(fields = {}) {
      const text = fields.text ?? w.passage().contentId;
      return s.standardDeclare({ cite: BYLAW, kind: "ordinance", issuer: "Port Ellery Selectboard", text,
                                 period: { from: "2020-01-01", to: "2030-12-31" }, author: V("bob"), viewer: V("bob"),
                                 ...fields });
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

function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

function provDoc(file, capSha, text) {
  return { file, locator: `https://example.org/${file}`, retrieved: "2026-09-27T00:00:00Z",
           authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
           capture: { method: "acquire", grade: "B", actor_class: "session", sha256: capSha, encoding: "utf8",
                      bytes: Buffer.byteLength(text) },
           origin: { kind: "named_request" } };
}

function projMd(title) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          `objective: "Find out."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""]
    .join("\n");
}
