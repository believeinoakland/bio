/* case-authoring over the modules it uses, each the real one (record-core, membership, credentials, promotion,
   provenance, attestation, extraction's tables, content, entities, connections, inquiry, basis-versions, strength, bias, observation-log,
   reevaluation, publication, ratification, contradiction, network-notices), on a real SQLite database (node:sqlite) standing in for a Durable Object's
   storage. What a later module fills is a stand-in the test controls: the run gate `ai-runs` registers with
   contradiction (its R13; `runs` below), the review provider (publication R23, which
   `review` registers once extracted) and its `case_drafts` table (review R26's read contract). Every test drives
   `case-authoring` at its interface: `publishCase`, `acknowledgeStatement`, `statementAcknowledgements`, its ops, its
   exports. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { biasOf, BIAS_SCHEMA } from "../../../src/bias/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { ratificationOf, completenessFields } from "../../../src/ratification/index.mjs";
import { contradictionOf } from "../../../src/contradiction/index.mjs";
import { Capture } from "../../../src/capture/index.mjs";
import { sourcesOf } from "../../../src/sources/index.mjs";
import { networkNoticesOf } from "../../../src/network-notices/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

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
export const T0 = "2026-09-27T00:00:00Z";
/* The statement, the justification, the scope and the bias acknowledgement a well-formed act authors. */
export const AUTHORED = Object.freeze({
  scope: "Whether the contract was awarded as the minutes say.",
  statement: "It does not cover the award's later amendments.",
  subjectPosition: "not_sought",
  subjectJustification: "The award is a public record and the question is whether it was followed.",
  biasAcknowledgement: "We read the minutes as the authoritative account of the meeting.",
  excluded: [],
});

/* R38: what changed in an edition above 1, as a member writes it (the fixture's `publish` sends it on every act). */
export const WHAT_CHANGED = Object.freeze({ text: "The amendments were requested and are now excluded by name." });

/* review's table (its R26 read contract) and the columns its draft act writes. */
const CASE_DRAFTS = `CREATE TABLE IF NOT EXISTS case_drafts (draft_id TEXT PRIMARY KEY, project_id TEXT NOT NULL,
  case_id TEXT, params TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL, statement_by TEXT)`;

/** The dead answer of the stand-in review provider, C-87.1's code, as `review` builds it from no argument. */
export const DEAD = Object.freeze({ ok: false, reason: "NO_REVIEW_COPY", code: "NO_REVIEW_COPY", check: "C-87.1",
  translation: "(the review copy's dead answer)" });

/* The review provider `review` fills (publication R23), over its own tables as the test holds them. `grants` maps a
   secret fingerprint to `{grant_id, draft_id, case_id, edition, recipient, revoked}`. */
function reviewProvider(w) {
  const identity = (d) => {
    const named = d && d.case_id ? String(d.case_id) : null;
    if (!named) return { caseId: null, edition: 1 };
    const t = w.row(`SELECT MAX(edition) AS m FROM published_cases WHERE case_id=?`, named);
    return { caseId: named, edition: (t && t.m != null ? Number(t.m) : 0) + 1 };
  };
  const draftForMember = (draftId, viewer) => {
    const d = w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, String(draftId ?? "").trim());
    if (!d) return null;
    const who = String(viewer ?? "").startsWith("member:") ? String(viewer).slice(7) : null;
    return who && w.row(`SELECT 1 AS x FROM project_participants WHERE project_id=? AND member_id=?`, d.project_id, who)
      ? d : null;
  };
  const liveGrant = (secretSha) => {
    const g = w.grants.get(String(secretSha ?? ""));
    if (!g || g.revoked) return null;
    const d = w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, g.draft_id);
    if (!d) return null;
    const now = identity(d);
    if ((now.caseId ?? null) !== (g.case_id ?? null) || now.edition !== Number(g.edition)) return null;
    return { grant: g, draft: d };
  };
  return {
    draftForMember, draftFor: draftForMember,
    draftIdentity: identity,
    caseIdentitySentence: (caseId, edition, newCase) => (caseId ? `the next edition (${edition}) of ${caseId}`
      : newCase ? "a new case" : "a derived case"),
    statedEdition: (ident, newCase) => (ident.caseId || newCase ? ident.edition : null),
    liveGrant,
    grantAdmitsCaseEdition: (s, c, e) => { const l = liveGrant(s); return !!(l && l.grant.case_id === c && Number(l.grant.edition) === Number(e)); },
    grantAdmits: (s, c, e) => { const l = liveGrant(s); return !!(l && l.grant.case_id === c && Number(l.grant.edition) === Number(e)); },
    deadAnswer: () => ({ ...DEAD }),
  };
}

export function world({ group = "test-group", provider = true, now = null, record: recordWrap = null, ratification: ratWrap = null,
                        deps = {} } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  /* The columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates today. */
  for (const c of ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"])
    st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { now: NOW, ms: "2026-09-28T01:00:00.000Z" };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  /* credentials (layer 2, after membership): the signer keys and agent credentials ratification's pre-flight reads
     (membership's `attestingKeys` copy reads its table), registered with membership at its start (its R16, R17, R20). */
  const credentials = credentialsOf(host, { record, membership });
  credentials.migrate();
  /* promotion (layer 2) is created by the first module that joins it, on this host (K61), and case-authoring does not
     use it itself: the fixture reaches the one instance through inquiry's (below). */
  const prov = provenanceOf(host, { record, membership, now: () => clock.now });
  prov.migrate();
  /* attestation (layer 3, after provenance), the real one: the attestations a capture holds (its R7), R35's read. */
  const attestation = attestationOf(host, { record, provenance: prov });
  /* capture (layer 3), its late attestations and signed accounts (its R68, R69) and its inbox (R72's read), and sources
     (layer 3) over it, each the real one; nothing here fetches. Created before any module that reaches sources on this storage, so its
     one instance keeps the test's clock. */
  const capture = new Capture(st, { record, env: { INSTANCE_NAME: "test", VERSION: "0.0.0" }, governor: null,
                                    provenance: prov, membership });
  capture.migrate();
  const sources = sourcesOf(host, { record, membership, capture, now: () => Date.parse(clock.now) });
  const ex = extractionOf(host, { record, membership, calibration: { onCalibration() { return { ok: true }; } } });
  ex.migrate();
  const readings = {};
  const exProvider = {
    readingOf: (s) => (readings[s] ? { reading: {}, chain: null, pageCount: 50, containerExtent: undefined,
                                       textContainer: null, captureFormat: null, ...readings[s] } : null),
    unitsOf: () => ({ units: [], state: null }), capturesReadFor: () => [], onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, provenance: prov, extraction: exProvider, now: () => clock.now });
  content.migrate();
  const retrieval = { selectionResolve: () => ({ ok: false, reason: "NO_SUCH_SELECTION", check: "C-33.20" }) };
  /* entities and connections are created by inquiry on this host (its lazy uses), as case-authoring uses neither. */
  const inquiry = inquiryOf(host, { record, membership, content, retrieval, provenance: prov, now: () => clock.now });
  inquiry.migrate();
  const promotion = inquiry.promotion;
  promotion.registerFact("producingGroup", "instance-setup", () => group);
  const entities = inquiry.entities;
  entities.migrate();
  const connections = inquiry.connections;
  connections.migrate();
  const basisVersions = basisVersionsOf(host, { record, membership, promotion, content,
    inquiry: { earned: (s, t) => inquiry.earned(s, t), legCapped, cyclePath: (id, t) => inquiry.cyclePath(id, t) },
    now: () => clock.now });
  basisVersions.migrate();
  const strength = strengthOf(host, { record, membership,
    inquiry: { basisFor: (id, o) => inquiry.basisFor(id, o), earned: (e, t) => inquiry.earned(e, t), legCapped,
               subjectEntityOf: (id) => inquiry.subjectEntityOf(id) },
    versions: basisVersions, producingGroup: () => group, now: () => clock.now });
  for (const s of BIAS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";"))
    if (s.trim()) st.db.exec(s);
  const bias = biasOf(host, { record, membership, promotion, entities });
  const observations = observationLogOf(host, { record, membership, provenance: prov, extraction: null,
                                                now: () => clock.now });
  observations.migrate();
  const reevaluation = reevaluationOf(host, { record, membership, promotion, inquiry, content, provenance: prov,
                                              strength, basisVersions, now: () => clock.now });
  const publication = publicationOf(host, { record, membership, promotion, inquiry, basisVersions,
                                            now: () => clock.now });
  const ratification = ratificationOf(host, { record, membership, promotion, provenance: prov, inquiry, basisVersions,
                                              publication });
  /* contradiction (layer 6), on this host; the runs its gate answers for are the test's: {status, principal}. */
  const contradiction = contradictionOf(host, { record, extraction: ex, membership, promotion, entities, basisVersions,
                                                now: () => clock.now });
  contradiction.migrate();
  const runs = new Map();
  contradiction.registerRunGate("test", (id, viewer, caller) => {
    const r = runs.get(id);
    if (!r) return { found: false, running: false, refusal: null };
    return { found: true, running: r.status === "running",
             refusal: caller === r.principal ? null : { ok: false, reason: "AI_RUN_NOT_PRINCIPAL", code: "AI_RUN_NOT_PRINCIPAL" } };
  });
  st.db.exec(CASE_DRAFTS);
  const w = {
    st, host, record, membership, credentials, promotion, prov, content, entities, connections, inquiry, basisVersions, strength,
    bias, observations, reevaluation, publication, ratification, contradiction, runs, clock, readings, grants: new Map(),
    capture, sources, attestation,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
      return out;
    },
  };
  if (provider) publication.registerReviewProvider("review", reviewProvider(w));
  /* network-notices (layer 8), the real one on this host; `notices` lets a test set what its `noticeReferenceOf` (its
     R19) answers for a project, any value, where the real module would need a signed notice. A project not in it is
     answered by the real module. */
  w.networkNotices = networkNoticesOf(host, { record, membership, credentials, promotion, provenance: prov, capture,
                                             publication });
  w.notices = new Map();
  const networkNotices = { noticeReferenceOf: (project) => (w.notices.has(project) ? w.notices.get(project)
                                                                                  : w.networkNotices.noticeReferenceOf(project)) };
  w.ca = caseAuthoringOf(host, { record: recordWrap ? recordWrap(record) : record, membership, inquiry, basisVersions,
    strength, bias, observations, reevaluation, publication, ratification: ratWrap ? ratWrap(ratification) : ratification,
    contradiction, provenance: prov, attestation, capture, networkNotices, extraction: ex,
    sources, now: now || ((p) => (p === "millisecond" ? clock.ms : clock.now)), ...deps });
  let n = 0;
  Object.assign(w, {
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    head: (id) => record.head(id)?.bundleSha ?? null,
    fm: (text) => parseFrontmatter(String(text || "")).data || {},
    member(id, { role = "member" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, 'active', '["contribute","publish"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
    },
    /** R44: a whole extracted-text index for `captureSha` (extraction R36's `unitsOf` reads it), one unit per entry of
     *  `units` (`{text, truncated?}`), or with `state` other than whole; the fixture's documents carry one unless asked
     *  not to (`text: false`). */
    indexText(captureSha, bundleId, units = [{ text: `the text of ${bundleId}` }], state = "whole") {
      st.sql.exec(`INSERT OR REPLACE INTO capture_text_state (capture_sha, bundle_id, state, offered, written, over_bound,
                   unaddressable, truncated, skipped_named, chain_kind, at) VALUES (?,?,?,?,?,0,0,?,0,'text',?)`,
                  captureSha, bundleId, state, units.length, units.length, units.filter((u) => u.truncated).length, T0);
      units.forEach((u, i) => st.sql.exec(`INSERT OR REPLACE INTO capture_text (capture_sha, bundle_id, extent_kind, extent,
                   ref, seq, text, truncated, chain_kind) VALUES (?,?,'doc-para',?,?,?,?,?,'text')`,
                  captureSha, bundleId, JSON.stringify({ kind: "doc-para", para: i + 1 }), `paragraph ${i + 1}`, i, u.text,
                  u.truncated ? 1 : 0));
    },
    /** An information bundle registering one capture, its text indexed whole unless `text: false`; answers the
     *  capture's sha. */
    doc(id, text = `bytes of ${id}`, { text: indexed = true } = {}) {
      const c = { path: "snapshots/c0.txt", text, sha: sha(text) };
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: V("alice"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path: c.path, text: c.text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(c)] }) }],
        meta: { object_type: "information" },
        register: [{ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) }] });
      if (!r.ok) throw new Error(`fixture doc refused: ${JSON.stringify(r).slice(0, 400)}`);
      if (indexed) w.indexText(c.sha, id);
      return c.sha;
    },
    /** An inquiry whose basis is `legs` (each `{target, …leg fields}`), in `state`; `concluded` carries its own
     *  conclusion and falsifier (the no-project relationship's conclusion, §7.1 item 5). */
    finding(id, legs, { state = "concluded", lines = [] } = {}) {
      const head = record.head(id);
      const r = promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`,
        author: V("alice"), files: [{ path: "bundle.md", text: inqMd(id, legs, { state, lines }) }],
        meta: { object_type: "inquiry" } });
      if (!r.ok) throw new Error(`fixture finding refused: ${JSON.stringify(r).slice(0, 600)}`);
      return r;
    },
    /** A project owned (and so joined) by `owner`, citing `cites`; `extra` lines join its front matter. */
    project(title, owner, cites = [], { extra = [] } = {}) {
      const r = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title, cites, extra) }], meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** A project revision (its bundle.md), every other file carried. */
    reviseProject(id, title, owner, cites = [], extra = []) {
      return promotion.promote({ bundleId: id, base: record.head(id).bundleSha, snapKey: `k${++n}`, author: V(owner),
        files: [{ path: "bundle.md", text: projMd(title, cites, extra) }], meta: { object_type: "project" } });
    },
    join(project, member, state = "joined", owner = 0) {
      st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, invited_by, created, updated)
                   VALUES (?, ?, ?, ?, 'alice', 't', 't')`, project, member, state, owner);
    },
    /** One act of op=publish by `owner` of `project` over `targets`, every member load-bearing unless `roles`. Every
     *  act says what changed (R38: an edition above 1 needs it, a first edition carries none); `over` replaces it. */
    publish(project, owner, targets, over = {}) {
      const roles = over.roles !== undefined ? over.roles : Object.fromEntries(targets.map((t) => [t, "load_bearing"]));
      return w.ca.publishCase({ ...AUTHORED, whatChanged: WHAT_CHANGED, project, targets, roles, viewer: V(owner),
                                author: owner, ...over });
    },
    /** Sign a prepared case edition through publication's commit (its R22), as op=caseratify does after its gate. */
    ratify(answer, { project = null, at = "2026-09-28T02:00:00Z" } = {}) {
      const doc = w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=? AND edition=?`, answer.caseId, answer.edition);
      const fm = w.fm(doc.text);
      const r = publication.commitCaseEdition({ caseId: answer.caseId, edition: answer.edition,
        project: project ?? fm.case_project, scope: fm.case_scope,
        completeness: { ...completenessFields(fm), subject_position: fm.completeness.subject_position ?? null,
                        author: fm.completeness.author ?? null },
        biasAcknowledgement: fm.bias_acknowledgement, bar: fm.required_strength,
        roster: (fm.case_roles || []).map((m) => ({ bundle_id: m.target, role: m.role, version_sha: m.version_sha })),
        docSha: doc.doc_sha, sigArmored: `sig-${answer.caseId}-${answer.edition}`, attestorKey: "key-1",
        attestorMember: fm.completeness.author, gateVersion: "1.37.0", deliveredBy: "founder", at });
      if (!r || r.ok === false) throw new Error(`fixture ratify refused: ${JSON.stringify(r).slice(0, 400)}`);
      /* ratification's commit dates the case edition's ratification (its R3), as the store's ceremony does today. */
      st.sql.exec(`UPDATE published_cases SET ratified_at=? WHERE case_id=? AND edition=? AND ratified_at IS NULL`,
                  at, answer.caseId, answer.edition);
      return r;
    },
    /** A draft of `project` (review's table), its params the op=publish arguments. */
    draft(id, project, params, { caseId = null, by = "alice", statementBy = by } = {}) {
      st.sql.exec(`INSERT OR REPLACE INTO case_drafts (draft_id, project_id, case_id, params, created_by, created_at,
                   updated_by, updated_at, statement_by) VALUES (?,?,?,?,?,?,?,?,?)`,
                  id, project, caseId, JSON.stringify(params), by, T0, by, T0, statementBy);
    },
    grant(secretSha, g) { w.grants.set(secretSha, { revoked: false, ...g }); },
    /** An information bundle registering one capture whose provenance document carries `extra` (attestations, a
     *  co-archive, attempts), fetched `direct` by this instance unless `receipt: false` (provenance R13: a Grade B
     *  capture, R24); answers the capture's sha. */
    graded(id, extra = {}, { receipt = true, text = `bytes of ${id}`, indexed = true } = {}) {
      const c = { path: "snapshots/c0.txt", text, sha: sha(text) };
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: V("alice"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path: c.path, text: c.text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [{ ...provDoc(c), ...extra }] }) }],
        meta: { object_type: "information" },
        register: [{ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) }] });
      if (!r.ok) throw new Error(`fixture graded refused: ${JSON.stringify(r).slice(0, 400)}`);
      if (indexed) w.indexText(c.sha, id);
      if (receipt) prov.recordReceipt({ address: `https://example.org/${id}`, addressNorm: `example.org/${id}`,
                                        captureSha: c.sha, retrieved: T0, via: "direct" });
      return c.sha;
    },
    /** A knock the doorbell received, already pulled into `captureSha` (capture R65, R72: the inbox row its read
     *  answers). */
    knocked(captureSha, { knockId = `KNOCK-2026-09-27-${captureSha.slice(0, 8)}`, received = T0, pseudonym = null } = {}) {
      st.sql.exec(`INSERT INTO inbox (knock_id, sha256, bytes, received, status, capture_sha, pulled_by, pulled_at,
                   pseudonym) VALUES (?, ?, 1, ?, 'pulled', ?, 'alice', ?, ?)`,
                  knockId, captureSha, received, captureSha, received, pseudonym);
      return knockId;
    },
  });
  return w;
}

export function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "${T0}"`,
          `last_updated: "${T0}"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

/** An inquiry document: `legs` its basis (each cited by a confirmed `cites` reference); concluded in its own bytes. */
export function inqMd(id, legs = [], { state = "concluded", lines = [] } = {}) {
  const val = (v) => (typeof v === "number" ? String(v) : `${v}`);
  const refs = [...new Set(legs.map((l) => l.target))];
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
    `current_state: ${state}`, "prior_state: open", `created: "${T0}"`, `last_updated: "${T0}"`, "surfaced_by: human",
    ...(refs.length ? ["references:", ...refs.flatMap((t) => ["  - rel: cites", `    target: ${t}`, "    status: confirmed",
                                                              '    note: ""'])] : ["references: []"]),
    "state_history: []",
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => Object.entries({ role: "supports", ...l })
      .sort(([a], [b]) => (a === "target" ? -1 : b === "target" ? 1 : 0))
      .map(([k, v], i) => `${i ? "    " : "  - "}${k}: ${val(v)}`))] : []),
    ...(state === "concluded" ? [`conclusion: "the award followed the minutes"`, `falsifier: "a later amendment"`] : []),
    ...lines, "---", "", "## Question", "", `Was ${id} answered?`, "", "## Session Log", ""].join("\n");
}

export function projMd(title, cites = [], extra = []) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "${T0}"`, `last_updated: "${T0}"`,
          ...(cites.length ? ["references:", ...cites.flatMap((c) => {
            const o = typeof c === "string" ? { target: c } : c;
            return ["  - rel: cites", `    target: ${o.target}`, `    status: ${o.status || "confirmed"}`, '    note: ""',
                    ...(o.extent_capture ? [`    extent_capture: ${o.extent_capture}`] : [])];
          })] : ["references: []"]),
          "state_history: []", ...extra, "---", "", "## Objective", "", "Find out.", "", "## Session Log", ""].join("\n");
}

export function provDoc(c) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: T0,
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
  };
}

/** The front-matter lines of one accepted reading of an inquiry (basis-versions R1–R5), named `name`, over `targets`,
 *  stating `claim`: the reading a project stands on and concludes (basis-versions R13, R16). */
export function readingLines(name, targets, claim = "the award followed the minutes") {
  return ["basis_versions:", `  - name: "${name}"`, `    description: "the reading called ${name}"`,
          `    relationship: "and"`, `    state: "accepted"`, "    hidden: false", "    derived_from: null",
          `    author: "member:alice"`, `    at: "${T0}"`, `    claim: "${claim}"`, `    state_by: "member:alice"`,
          `    state_at: "${T0}"`, `    state_reason: ""`,
          "basis_version_grounds:", `  - version: "${name}"`, `    ground: "main"`, `    asserted_by: "member:alice"`,
          `    at: "${T0}"`,
          "basis_version_legs:", ...targets.flatMap((t) => [`  - version: "${name}"`, `    target: ${t}`,
                                                              `    role: "supports"`, `    ground: "main"`])];
}

/** A project's CURRENT reading of `inquiry` (basis-versions R13, R15), as front-matter lines of the project. */
export function currentLines(inquiry, version = "first") {
  return ["current_versions:", `  - inquiry: "${inquiry}"`, `    version: "${version}"`, `    at: "${T0}"`,
          `    by: "member:alice"`];
}
