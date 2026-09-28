/* conformance over the modules it uses, each the real one (record-core, membership, promotion, content, inquiry,
   strength, reevaluation, publication, standards), on a real SQLite database (node:sqlite) standing in for a Durable
   Object's storage. The modules those reach in turn are created by their own factories on the same host. What a later
   module or the legacy store fills (the producing group) and the readings content reads through extraction are
   stand-ins the test controls. The ceremonies that publish a case (`case-authoring`, `ratification`) are played through
   publication's R21 and R22, exactly as those modules call them. Every test drives `conformance` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { contentOf, canonicalExtent } from "../../../src/content/index.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { standardsOf } from "../../../src/standards/index.mjs";
import { conformanceOf, conformanceOps } from "../../../src/conformance/index.mjs";
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
/** A text layer's chain, unscoped. */
export const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];
/** A text unit of one page, as extraction's index holds it. */
export const U = (page, text, truncated = false) =>
  ({ extent: canonicalExtent({ kind: "pdf-page", page }), ref: `page ${page + 1}`, text, truncated });

/* The columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates today. */
const BUNDLE_COLUMNS = ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"];
/* The columns of extraction's tables that inquiry, content and connections join. */
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

/** The readings extraction would provide: `readings[sha] = {chain, pageCount, …}`, `units[sha] = {units, state}`. */
function readings() {
  const r = { readings: {}, units: {}, readFor: {} };
  r.provider = {
    readingOf: (s) => (r.readings[s] ? { reading: { page_boxes: null }, chain: null, pageCount: null,
      textContainer: null, captureFormat: null, ...r.readings[s] } : null),
    unitsOf: (s) => r.units[s] || { units: [], state: null },
    capturesReadFor: (b) => (r.readFor[b] || []).map((capture_sha) => ({ capture_sha, at: null })),
    onReading: () => ({ ok: true }),
  };
  return r;
}

export function world({ group = "test-group" } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  for (const c of BUNDLE_COLUMNS) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  for (const t of EXTRACTION_JOINED) st.db.exec(t);
  const clock = { now: NOW };
  const now = () => clock.now;
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now });
  promotion.registerFact("producingGroup", "legacy-store", () => group);
  const ex = readings();
  const content = contentOf(host, { record, membership, extraction: ex.provider, now });
  content.provenance.migrate();
  content.migrate();
  const k = inquiryOf(host, { record, membership, promotion, content, now,
                              retrieval: { selectionResolve: () => ({ ok: false, reason: "NO_SUCH_SELECTION" }) } });
  k.migrate();
  k.entities.migrate();
  k.connections.migrate();
  /* strength's factory does not reach inquiry itself (reported, CONFORMANCE #1): it is given the reads it walks. */
  const strength = strengthOf(host, { record, membership, now,
    inquiry: { basisFor: (id, o) => k.basisFor(id, o), earned: (e, t) => k.earned(e, t), legCapped,
               subjectEntityOf: (id) => k.subjectEntityOf(id) } });
  const reevaluation = reevaluationOf(host, { record, membership, promotion, inquiry: k, content, strength, now });
  reevaluation.basisVersions.migrate();
  const publication = publicationOf(host, { record, membership, promotion, inquiry: k, now });
  const standards = standardsOf(host, { record, membership, promotion, content, now });
  const c = conformanceOf(host, { record, membership, promotion, content, inquiry: k, strength, reevaluation,
                                  publication, standards, now });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, content, k, strength, reevaluation, publication, standards, c, clock, ex,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot(tables = null) {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        if (!tables || tables.includes(name)) out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
      return out;
    },
    /** An op, as the store's op map runs it: `query` the control plane's search params, `body` its JSON. */
    op(name, query = {}, body = null) {
      const url = new URL(`http://do/${name}`);
      for (const [key, v] of Object.entries(query)) if (v != null) url.searchParams.set(key, String(v));
      return conformanceOps(c, url, body)[name]();
    },
    member(id, { role = "member", handle = `h_${id}`, cover = `Cover ${id}`, status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, cover, handle, role, status);
    },
    project(title, owner, { visibility = null } = {}) {
      const res = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" },
        ...(visibility ? { visibility } : {}) });
      if (!res.ok) throw new Error(`fixture project refused: ${JSON.stringify(res).slice(0, 400)}`);
      return res.bundleId;
    },
    /** A participant `member` of `project`, invited by its owner and joined. */
    join(project, owner, member) {
      const inv = membership.projectInvite({ projectId: project, handle: `h_${member}`, by: owner, viewer: V(owner) });
      if (inv && inv.ok === false) throw new Error(`fixture invite refused: ${JSON.stringify(inv)}`);
      const j = membership.projectJoin({ projectId: project, by: member, viewer: V(member) });
      if (j && j.ok === false) throw new Error(`fixture join refused: ${JSON.stringify(j)}`);
    },
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
    /** A document (information bundle) holding `captures` (default: one of its own), registered in that order. */
    doc(id, captures = null) {
      const caps = captures || [w.cap(`${id}-0`, `the text of ${id}`)];
      const files = [{ path: "bundle.md", text: infoMd(id) }];
      for (const x of caps) files.push({ path: x.path, text: x.text });
      files.push({ path: "data/provenance.json", text: JSON.stringify({ documents: caps.map((x) => provDoc(x)) }, null, 2) });
      const res = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: V("alice"), files,
        meta: { object_type: "information" },
        register: caps.map((x) => ({ sha256: x.sha, path: x.path, encoding: "utf8", bytes: Buffer.byteLength(x.text) })) });
      if (!res.ok) throw new Error(`fixture doc refused: ${JSON.stringify(res).slice(0, 400)}`);
      return caps;
    },
    /** A capture read, with its text units; and retrieved from `address` at `at`. */
    read(capSha, units = null, { pageCount = 3, state = "whole" } = {}) {
      ex.readings[capSha] = { chain: LAYER, pageCount };
      if (units) ex.units[capSha] = { units: units.map((u, i) => ({ extent: u.extent, ref: u.ref ?? `u${i}`, text: u.text,
                                                                      truncated: !!u.truncated })), state };
    },
    at(capSha, address, retrieved) {
      content.provenance.recordReceipt({ address: `https://${address}`, addressNorm: address, captureSha: capSha, retrieved });
    },
    /** A passage of a capture, minted as content. */
    passage(bundleId, capSha, extent = { kind: "pdf-page", page: 1 }) {
      const m = content.mint({ bundleId, captureSha: capSha, extent, mintedBy: V("bo") });
      if (!m.ok) throw new Error(`fixture passage refused: ${JSON.stringify(m).slice(0, 300)}`);
      return m.content_id;
    },
    /** A document with one read capture and one minted passage of it: `{doc, cap, content}`. */
    evidence(id, text = `the text of ${id}`) {
      const [cp] = w.doc(id, [w.cap(`${id}-0`, text)]);
      w.read(cp.sha, [U(0, "page one"), U(1, text)]);
      return { doc: id, cap: cp, content: w.passage(id, cp.sha) };
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
    /** A finding published in a ratified edition of `caseId` owned by `project`, its pin the finding's current sha, with
     *  its frozen pair `strength` (rows `{axis, grade}`), through publication's R21 and R22 as case-authoring and
     *  ratification call them. Answers the pin. */
    publish(finding, project, { caseId = "CASE-2026-0001", edition = 1, role = "load_bearing",
                                strength = [{ axis: "capture", grade: "B" }, { axis: "connection", grade: "C" }] } = {}) {
      const pin = w.head(finding);
      const roles = [{ target: finding, version_sha: pin, edition, role }];
      const text = caseDoc(caseId, edition, { project, roles,
                                              strength: strength.map((s) => ({ target: finding, ...s })) });
      const prep = publication.storeCaseDocument({ case: caseId, edition, text, author: V("olive"), at: NOW });
      if (!prep.ok) throw new Error(`fixture prepare refused: ${JSON.stringify(prep)}`);
      const sc = record.transact(() => publication.commitCaseEdition({ case: caseId, edition, project,
        scope: "The question.", completeness: { statement: "It leaves out the minutes.", author: V("olive") },
        biasAcknowledgement: "none declared", bar: null,
        roster: [{ bundle_id: finding, version_sha: pin, role }], sigArmored: SIG(edition), attestorKey: KEY,
        attestorMember: "olive", gateVersion: "plane-gate/test", deliveredBy: V("olive"), at: NOW }));
      if (!sc.ok) throw new Error(`fixture case edition refused: ${JSON.stringify(sc)}`);
      const sf = record.transact(() => publication.commitEdition({ bundleId: finding, bundleSha: pin, edition: undefined,
        title: `Finding ${finding}`, completeness: null, strength: null, memberCarriesBlocks: false, group: "test-group",
        edges: [], shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: 10 }], attestorKey: KEY,
        attestorMember: "olive", gateVersion: "plane-gate/test", sigArmored: SIG(90 + edition), deliveredBy: V("olive"),
        at: NOW }));
      if (!sf.ok) throw new Error(`fixture finding edition refused: ${JSON.stringify(sf)}`);
      const items = publication.publishedEditionsOf({ finding, project }).items;
      if (!items.some((i) => i.case === caseId && i.edition === edition))
        throw new Error(`fixture publish: ${finding} is not in ${caseId} edition ${edition}: ${JSON.stringify(items)}`);
      return pin;
    },
    /** A standard held by `standards`, declared by a member through its R1, its text a passage of its own document. */
    standard(cite, { kind = "ordinance", issuer = "The Council", period = { from: "2020-01-01", to: null },
                     supersedes = undefined, author = V("olive"), text = null } = {}) {
      const t = text || w.evidence(`INFO-2026-${String(900 + ++n).padStart(4, "0")}-text`).content;
      const r = standards.standardDeclare({ cite, kind, issuer, text: [t], period,
                                            ...(supersedes ? { supersedes } : {}), author, viewer: author });
      if (!r.ok) throw new Error(`fixture standard refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.id;
    },
  };
  return w;
}

/** A case document (`bio-case-document/4`): the facts publication reads from it. */
export function caseDoc(caseId, edition, { project, roles = [], strength = [] } = {}) {
  return ["---", "format: bio-case-document/4", `case_id: ${caseId}`, `case_edition: ${edition}`, `case_project: ${project}`,
    "case_roles:", ...roles.flatMap((r) => [`  - target: ${r.target}`, `    version_sha: ${r.version_sha}`,
      `    edition: ${r.edition ?? 1}`, `    role: ${r.role ?? "load_bearing"}`]),
    "case_findings:", ...roles.map((r) => `  - ${r.target}`),
    ...(strength.length ? ["case_strength:", ...strength.flatMap((s) => [`  - target: ${s.target}`, `    axis: ${s.axis}`,
      `    state: ${s.state ?? "graded"}`, `    grade: ${s.grade}`])] : ["case_strength: []"]),
    "completeness:", "  author: member:olive", `  at: "${NOW}"`, "completeness_excluded: []", "case_citations: []",
    "---", "", "## Scope", "", "The question.", "", "## What This Excludes", "", "Nothing else.", "",
    "## What Was Searched", "", "Everything.", ""].join("\n");
}

export function inquiryMd(id, { question = `Is ${id} answered?`, legs = [], state = "open", prior = "null",
                               disposition = '""', extra = [] } = {}) {
  const references = [...new Set(legs.map((l) => l.target))].map((t) => ({ target: t, rel: "cites" }));
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
    `current_state: ${state}`, `prior_state: ${prior}`, `created: "2026-09-27T00:00:00Z"`,
    `last_updated: "2026-09-27T00:00:00Z"`, "group: test-group",
    ...(references.length
      ? ["references:", ...references.flatMap((r) => [`  - target: ${r.target}`, `    rel: ${r.rel}`, "    status: confirmed"])]
      : ["references: []"]),
    "state_history: []", "surfaced_by: human", `disposition_reason: ${disposition}`,
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`,
      ...(l.grade ? [`    grade: ${l.grade}`] : []), ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []),
      ...(l.grade_source ? [`    grade_source: ${l.grade_source}`] : []),
      ...(l.content_id ? [`    content_id: ${l.content_id}`] : [])])] : []),
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

export function provDoc(x) {
  return {
    file: x.path, locator: `https://example.org/${x.path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: x.sha, encoding: "utf8",
               bytes: Buffer.byteLength(x.text) },
    origin: { kind: "named_request" },
  };
}

export const F = "INQ-2026-0001-finding";
export const DOC = "INFO-2026-0001-doc";

/** A project `Parks` owned by olive, with pat joined, quinn a member outside it and ron an administrator; one document
 *  with a minted passage (the act's evidence), a finding resting on it published in the project's ratified case
 *  edition, and a standard in force (a period with both ends). */
export function scene(opts = {}) {
  const w = world(opts);
  for (const m of ["olive", "pat", "quinn"]) w.member(m);
  w.member("ron", { role: "admin" });
  const proj = w.project("Parks", "olive");
  w.member("sam");
  w.join(proj, "olive", "pat");
  const ev = w.evidence(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.publish(F, proj);
  const std = w.standard("Parks Code 12.08.030", { period: { from: "2020-01-01", to: "2030-12-31" } });
  /** A valid determination of the scene's act (every field `over` replaces). */
  const input = (over = {}) => ({
    project: proj, author: V("olive"), viewer: V("olive"),
    act: { description: "The parks department closed the east playground without the notice the code requires",
           actor: { role: "Director of Parks", body: "Parks Department" }, at: "2026-03-02", evidence: [ev.content] },
    findings: [F], standards: [{ standard: std, outcome: "noncompliant" }],
    rows: [{ standard: std, requires: "thirty days' public notice before a closure", did: "closed with no notice",
             reading: "diverges", content: [ev.content] }],
    ...over });
  return { w, proj, ev, pin, std, input };
}
