/* publication over the modules it uses, each the real one (record-core, membership, promotion, provenance, content,
   connections, inquiry, basis-versions), on a real SQLite database (node:sqlite) standing in for a Durable Object's
   storage. What a later module registers (legacy-store's fact `producingGroup`, the review provider) is a stand-in the
   test controls. The ceremonies that write through this module (`ratification`, `case-authoring`) are played by the
   test through R21 and R22, exactly as those modules call them. Every test drives `publication` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { publicationOf, publicationOps } from "../../../src/publication/index.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
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
export const MACHINE = "class:daemon";
export const NOW = "2026-09-28T01:00:00Z";
export const SIG = (n = 1) => `-----BEGIN SSH SIGNATURE-----\nsig${n}\n-----END SSH SIGNATURE-----`;
export const KEY = "AAAAC3NzaC1lZDI1NTE5AAAAIKEY";

/* The columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates today. */
const BUNDLE_COLUMNS = ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"];
/* The columns of extraction's tables that inquiry, content, connections and basis-versions join. */
const EXTRACTION_JOINED = [
  `CREATE TABLE readings (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL, content_type TEXT, reading TEXT,
     at TEXT, capture_format TEXT)`,
  `CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL, ref_kind TEXT,
     ref_key TEXT, label TEXT, pos_kind TEXT, pos TEXT, pos_ref TEXT, occurrence TEXT NOT NULL DEFAULT '',
     seq INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (capture_sha, ref, occurrence))`,
  `CREATE TABLE reading_ref_terms (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
     src TEXT NOT NULL, term TEXT NOT NULL, PRIMARY KEY (capture_sha, ref, src, term))`,
  `CREATE TABLE reading_text_source (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL,
     transcribed INTEGER NOT NULL DEFAULT 0, terminal_step TEXT, engines TEXT, derivation_cap TEXT,
     steps INTEGER NOT NULL DEFAULT 0, chain TEXT, calibrations TEXT)`,
];
const NO_READINGS = {
  readingOf: () => null, unitsOf: () => ({ units: [], state: null }), capturesReadFor: () => [], onReading: () => ({ ok: true }),
};

export function world({ group = "test-group" } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  for (const c of BUNDLE_COLUMNS) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  const groupRef = { value: group };
  promotion.registerFact("producingGroup", "legacy-store", () => groupRef.value);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  for (const t of EXTRACTION_JOINED) st.db.exec(t);
  const content = contentOf(host, { record, membership, provenance: prov, extraction: NO_READINGS, now: () => clock.now });
  content.migrate();
  const connections = connectionsOf(host, { record, membership, promotion, content, extraction: NO_READINGS, capture: {} });
  connections.entities.migrate();
  connections.migrate();
  const k = inquiryOf(host, { record, membership, promotion, content, connections, entities: connections.entities,
                              retrieval: { selectionResolve: () => ({ ok: false, reason: "NO_SUCH_SELECTION" }) },
                              provenance: prov, now: () => clock.now });
  k.migrate();
  const basisVersions = basisVersionsOf(host, { record, membership, promotion, content,
    inquiry: { earned: (s, t) => k.earned(s, t), legCapped, cyclePath: (id, t) => k.cyclePath(id, t) },
    now: () => clock.now });
  basisVersions.migrate();
  const p = publicationOf(host, { record, membership, promotion, inquiry: k, basisVersions, now: () => clock.now });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, content, connections, k, basisVersions, p, clock, groupRef,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot(tables = null) {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        if (!tables || tables.includes(name)) out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
      return out;
    },
    /** An op, as the legacy store's op map runs it: `query` the control plane's search params, `body` its JSON. */
    op(name, query = {}, body = null) {
      const url = new URL(`http://do/${name}`);
      for (const [key, v] of Object.entries(query)) if (v != null) url.searchParams.set(key, String(v));
      return publicationOps(p, url, body)[name]();
    },
    member(id, { role = "member", handle = `h_${id}`, cover = `Cover ${id}`, status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, cover, handle, role, status);
    },
    project(title, owner) {
      const res = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
      if (!res.ok) throw new Error(`fixture project refused: ${JSON.stringify(res).slice(0, 400)}`);
      return res.bundleId;
    },
    /** A document (information bundle) with one capture of its own. */
    doc(id) {
      const text = `the text of ${id}`, path = `snapshots/${id}.txt`;
      const res = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: V("alice"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path, text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(path, text)] }, null, 2) }],
        meta: { object_type: "information" },
        register: [{ sha256: sha(text), path, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
      if (!res.ok) throw new Error(`fixture doc refused: ${JSON.stringify(res).slice(0, 400)}`);
      return res;
    },
    /** An inquiry through promotion (so inquiry's check and projection run); `legs` as inquiry's grammar. */
    inquiry(id, opts = {}) {
      const res = w.promote(id, inquiryMd(id, opts));
      if (!res.ok) throw new Error(`fixture inquiry refused: ${JSON.stringify(res).slice(0, 600)}`);
      return res;
    },
    promote(id, text, type = "inquiry") {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`,
        author: V("alice"), files: [{ path: "bundle.md", text }], meta: { object_type: type } });
    },
    head: (id) => record.head(id)?.bundleSha ?? null,
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    fm: (id) => { const t = w.text(id); return t ? parseFrontmatter(t).data : null; },
    /** A member's firsthand observation, through provenance's `testify`. */
    observe(author, words = `I saw it, ${author}.`) {
      const r = prov.testify({ words, observedAt: "2026-09-27", title: `Observation by ${author}`, author: V(author) });
      if (!r.ok) throw new Error(`fixture testify refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundle_id;
    },
    /** The unsigned case document of one edition, stored through R21 as case-authoring stores it. */
    prepare(caseId, edition, opts = {}) {
      const text = caseDoc(caseId, edition, opts);
      const r = p.storeCaseDocument({ case: caseId, edition, text, author: V(opts.author || "olive"), at: NOW });
      if (!r.ok) throw new Error(`fixture prepare refused: ${JSON.stringify(r)}`);
      return r;
    },
    /** Ratification's commit of a case edition (R22), inside a transaction as ratification makes it. */
    signCase(caseId, edition, { project = "PROJ-1", roster = [], signer = "olive", sig = SIG(edition), at = NOW,
                                completeness = { statement: "It leaves out the minutes.", author: V("olive") },
                                bar = null } = {}) {
      return record.transact(() => p.commitCaseEdition({ case: caseId, edition, project, scope: "The question.",
        completeness, biasAcknowledgement: "none declared", bar, roster, sigArmored: sig, attestorKey: KEY,
        attestorMember: signer, gateVersion: "plane-gate/test", deliveredBy: V(signer), at }));
    },
    /** Ratification's commit of one published edition (R22). */
    signFinding(bundleId, { edition = undefined, title = `Finding ${bundleId}`, edges = [], shas = null, signer = "olive",
                             sig = SIG(9), strength = null, memberCarriesBlocks = false, at = NOW } = {}) {
      const bundleSha = w.head(bundleId);
      return record.transact(() => p.commitEdition({ bundleId, bundleSha, edition, title, completeness: null, strength,
        memberCarriesBlocks, group: "test-group", edges,
        shas: shas || [{ sha256: bundleSha, path: "bundle.md", kind: "bundle", bytes: 10 }],
        attestorKey: KEY, attestorMember: signer, gateVersion: "plane-gate/test", sigArmored: sig,
        deliveredBy: V(signer), at }));
    },
  };
  return w;
}

/** A case document (`bio-case-document/4` unless `format`): the facts this module reads from it. `roles`:
 *  [{target, version_sha, edition?, role?}]; `strength`: [{target, axis, state, grade}]; `excluded`: [{target,
 *  description, reason}]; `attributions`: [{observation, level, shown, chosen_at_edition}] (a run is written only when
 *  given); `citations`: rows for /4's `case_citations`. */
export function caseDoc(caseId, edition, { project = "PROJ-1", roles = [], findings = null, strength = [], excluded = [],
                                           attributions = null, citations = [], format = "bio-case-document/4",
                                           excludes = "Nothing else.", ack = false } = {}) {
  const fm = ["---", `format: ${format}`, `case_id: ${caseId}`, `case_edition: ${edition}`, `case_project: ${project}`,
    "case_roles:", ...roles.flatMap((r) => [`  - target: ${r.target}`, `    version_sha: ${r.version_sha}`,
      `    edition: ${r.edition ?? 1}`, `    role: ${r.role ?? "load_bearing"}`]),
    "case_findings:", ...(findings ?? roles.map((r) => r.target)).map((f) => `  - ${f}`),
    ...(strength.length ? ["case_strength:", ...strength.flatMap((s) => [`  - target: ${s.target}`, `    axis: ${s.axis}`,
      `    state: ${s.state ?? "graded"}`, `    grade: ${s.grade}`])] : ["case_strength: []"]),
    "completeness:", "  author: member:olive", `  at: "${NOW}"`,
    ...(ack ? ["  statement_sha: abc", "  acknowledged: 0"] : []),
    ...(excluded.length ? ["completeness_excluded:", ...excluded.flatMap((x, i) => [`  - target: ${x.target}`,
      `    description: "${x.description ?? `row ${i}`}"`, `    reason: "${x.reason ?? "out of scope"}"`])]
      : ["completeness_excluded: []"]),
    ...(attributions ? ["observation_attributions:", ...attributions.flatMap((r) => [`  - observation: ${r.observation}`,
      `    level: ${r.level ?? "null"}`, `    shown: ${r.shown == null ? "null" : `"${r.shown}"`}`,
      `    chosen_at_edition: ${r.chosen_at_edition ?? "null"}`])] : []),
    ...(citations.length ? ["case_citations:", ...citations.flatMap((c) => [`  - target: ${c.target}`,
      `    version: ${c.version}`])] : ["case_citations: []"]),
    "---"];
  const body = ["", "## Scope", "", "The question.", "",
    ...(ack ? ["**Who else read this statement.** Nobody yet.", ""] : []),
    ...(attributions ? ["## Whose Words These Are", "", "old words", ""] : []),
    "## What This Excludes", "", excludes, "", "## What Was Searched", "", "Everything.", ""];
  return [...fm, ...body].join("\n");
}

export function inquiryMd(id, { question = `Is ${id} answered?`, legs = [], refs = null, state = "open", extra = [] } = {}) {
  const references = refs ?? [...new Set(legs.map((l) => l.target))].map((t) => ({ target: t, rel: "cites" }));
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
    `current_state: ${state}`, "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
    `last_updated: "2026-09-27T00:00:00Z"`, "group: test-group",
    ...(references.length
      ? ["references:", ...references.flatMap((r) => [`  - target: ${r.target}`, `    rel: ${r.rel || "cites"}`,
          `    status: ${r.status || "confirmed"}`])]
      : ["references: []"]),
    "state_history: []", "surfaced_by: human", 'disposition_reason: ""',
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`])] : []),
    ...extra,
    "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
}

export function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

export function projMd(title) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");
}

function provDoc(path, text) {
  return {
    file: path, locator: `https://example.org/${path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: sha(text), encoding: "utf8",
               bytes: Buffer.byteLength(text) },
    origin: { kind: "named_request" },
  };
}
