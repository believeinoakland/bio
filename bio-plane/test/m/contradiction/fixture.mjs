/* contradiction's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec`, `transactionSync`
   nesting as savepoints) with the real modules contradiction uses — record-core (`bundles`, purge, `transact`),
   membership (the sight rule, participation, facts), promotion (the one write path, with this module's check
   registered), extraction (`readings` and `readingOf`), content (`content`), entities (`resolutions`,
   `reportResolutionDefect`) and inquiry (its tables, its grammar and projection, `contradictionLink`,
   `inquiryOfCandidate`, R46–R48). `basis-versions`' reads (`projectsDrawingOn`, `conclusionOf`, `projectQuestions`) and
   its no-project `conclude` are a stand-in the test controls, built from its stated interface (its R16–R19, R22, R37,
   R41): a question concluded through it is promoted through the real promotion, so inquiry's grammar judges the
   resolution. A run gate stands in for ai-runs' (R21). Every test drives `contradiction` at its interface. The
   version tables are basis-versions' own (its migrate), rows laid down by hand with the columns its read contract
   names (R38 there). */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";
import { inquiryOf } from "../../../src/inquiry/index.mjs";
import { migrateBasisVersions } from "../../../src/basis-versions/schema.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/frontmatter.mjs";
import { contradictionOf, inquiryServices } from "../../../src/contradiction/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export const MACHINE = "class:admin";
export const MEMBER = "member:m1";
export const OUTSIDER = "member:outsider";
export const NOW = "2026-09-28T00:00:00Z";

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/* The columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates today. */
const BUNDLE_COLUMNS = ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"];

/** A fresh record with the modules above and contradiction over it. `gate: false` registers no run gate. */
export function world({ gate = true, now = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  for (const c of BUNDLE_COLUMNS) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { now: NOW };
  const tick = () => clock.now;
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: tick });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("caseMember", "legacy-store", () => false);
  promotion.registerFact("publishedRegistry", "legacy-store", () => null);
  /* provenance and connections are not contradiction's uses: inquiry, content and entities receive stand-ins answering
     that the record holds no capture history and no theme or severed edge, which none of these tests exercises. */
  /* provenance's `register` and connections' `refs`, as inquiry reads them (empty: no capture registered, no edge) */
  st.sql.exec(`CREATE TABLE IF NOT EXISTS register (bundle_id TEXT, capture_sha TEXT, authored INTEGER DEFAULT 0)`);
  st.sql.exec(`CREATE TABLE IF NOT EXISTS refs (bundle_id TEXT NOT NULL, target_id TEXT NOT NULL, kind TEXT NOT NULL DEFAULT '',
               PRIMARY KEY (bundle_id, target_id, kind))`);
  const prov = { capturesOf: () => [], originOf: () => null, versionChain: () => null, capturedLocators: () => [],
                 captureGrade: () => ({ determined: false, basis: "CAPTURE_ROUTE_UNRECORDED" }),
                 recordReceipt: () => ({ ok: true }) };
  const x = extractionOf(host, { record, membership, calibration: { onCalibration() { return { ok: true }; } } });
  x.migrate();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: x, now: tick });
  content.migrate();
  const entities = entitiesOf(host, { record, membership, provenance: prov, now: tick });
  entities.migrate();
  const connections = { themeLegFindings: () => [], edgeSevered: () => false, portionGrades: () => ({}), portionAxes: () => ({}) };
  const k = inquiryOf(host, { record, membership, promotion, content, connections, entities, provenance: prov,
                              retrieval: { selectionResolve: () => ({ ok: false, reason: "NO_SUCH_SELECTION" }) }, now: tick });
  k.migrate();
  migrateBasisVersions(st.sql);
  for (const [id, cover] of [["m1", "Cover m1"], ["m2", "Cover m2"], ["m3", "Cover m3"], ["outsider", "Cover outsider"]])
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, id, cover, `h_${id}`);

  /* basis-versions' reads and its no-project conclude, as a stand-in built from its stated interface. */
  const drawing = new Map();      /* inquiry -> [project ids] */
  const stances = new Map();      /* `${project}|${inquiry}` -> {claim, version} */
  const bv = {
    concludeCalls: [], concludeRefusal: null,
    projectsDrawingOn(inq, viewer) {
      const all = (drawing.get(inq) || []).filter((p) => membership.inSight(p, viewer)).sort();
      const out = all.slice(0, 32).map((id) => ({ id, title: `title of ${id}`, current: null }));
      out.bound = 32; out.truncated = all.length > 32;
      return out;
    },
    conclusionOf(p, inq, viewer) {
      if (!membership.inSight(p, viewer)) return null;
      const s = stances.get(`${p}|${inq}`);
      return s ? { project: p, inquiry: inq, relationship: "project", act: "concluded", state: "concluded",
                   version: s.version, claim: s.claim } : null;
    },
    projectQuestions({ project }) {
      const items = [...drawing.entries()].filter(([, ps]) => ps.includes(project)).map(([inq]) => inq).sort()
        .map((inquiry) => ({ inquiry, legs: true, stance: stances.has(`${project}|${inquiry}`) ? "concluded" : "none" }));
      return { items, cursor: null };
    },
    conclude(args) {
      bv.concludeCalls.push(args);
      if (bv.concludeRefusal) return bv.concludeRefusal;
      const md = record.readFile(args.target, "bundle.md");
      const head = record.head(args.target);
      let text = md.text.replace(/^current_state: .*$/m, "current_state: concluded")
                        .replace(/^prior_state: .*$/m, `prior_state: ${head.currentState}`);
      text = text.replace(/\n---\n/, `\nconclusion: "${args.conclusion}"\nfalsifier: "${args.falsifier || "a record showing otherwise"}"\n---\n`);
      const r = promotion.promote({ bundleId: args.target, base: head.bundleSha, snapKey: `conclude${++n}`,
        author: args.author, files: [{ path: "bundle.md", text }], meta: { object_type: "inquiry" } });
      return r.ok ? { ok: true, target: args.target, to: "concluded", relationship: "no_project", project: null } : r;
    },
  };
  let n = 0;
  const c = contradictionOf(host, { record, extraction: x, membership, promotion, entities, basisVersions: bv,
                                    inquiry: inquiryServices(host), now: now || (() => clock.now) });
  c.migrate();
  /* The runs the stand-in gate answers for: {status, principal, hidden}. */
  const runs = new Map();
  const gateCalls = [];
  if (gate) c.registerRunGate("test", (id, viewer, caller) => {
    gateCalls.push({ run: id, viewer, caller });
    const r = runs.get(id);
    if (!r || r.hidden) return { found: false, running: false, refusal: null };
    return { found: true, running: r.status === "running",
             refusal: caller === r.principal ? null
               : { ok: false, reason: "AI_RUN_NOT_PRINCIPAL", code: "AI_RUN_NOT_PRINCIPAL", check: "C-22.12",
                   translation: "not the run's principal", detail: "proposing is the principal's act" } };
  });
  const w = {
    st, host, record, membership, promotion, x, content, entities, k, c, bv, runs, gateCalls, clock, drawing, stances,
    rows: (q, ...a) => st.sql.exec(q, ...a), one: (q, ...a) => st.sql.exec(q, ...a)[0] || null,
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    fm: (id) => { const t = record.readFile(id, "bundle.md")?.text; return t ? parseFrontmatter(t).data : null; },
    bundle(id, { type = "information", subject = null } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, inquiry_subject_entity)
                   VALUES (?, ?, 'g', ?, 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, `title of ${id}`, subject);
      return id;
    },
    /* An inquiry bundle; `project: true` makes it a project-typed bundle m1 takes part in, the one kind membership
       withholds from a non-participant (R43). */
    inquiry(id, { subject = null, project = false } = {}) {
      w.bundle(id, { type: project ? "project" : "inquiry", subject });
      if (project) w.participant(id, "m1", { owner: 1 });
      return id;
    },
    /* A project bundle with its participants (membership's roster), each `{id, state?, owner?}`. */
    project(id, members = [], { visibility = null } = {}) {
      w.bundle(id, { type: "project" });
      for (const m of members) w.participant(id, typeof m === "string" ? m : m.id, typeof m === "string" ? {} : m);
      if (visibility) {
        st.sql.exec(`INSERT INTO project_visibility (project_id, setting, reason, set_by, at) VALUES (?, ?, 'r', 'm1', '2026-01-01')`, id, visibility);
        st.sql.exec(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, ?)`, id, visibility);   /* membership's sight index */
      }
      return id;
    },
    participant(projectId, memberId, { state = "joined", owner = 0 } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, ?, '2026-01-01', '2026-01-01')`, projectId, memberId, state, owner);
    },
    /* A content row over `capture` filed in `bundleId` (content R45's columns). */
    content(contentId, capture, bundleId, { ref = `ref of ${contentId}`, kind = "pdf-page", stale = 0 } = {}) {
      w.bundle(bundleId);
      st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
                   VALUES (?, ?, ?, ?, '{}', ?, 'plane', '2026-01-01', ?)`, contentId, capture, bundleId, kind, ref, stale);
      return contentId;
    },
    leg(inquiry, ord, role, { content = null, target = "INFO-2026-0001", note = null } = {}) {
      st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, note, content_id)
                   VALUES (?, ?, ?, 'information', ?, ?, ?)`, inquiry, ord, target, role, note, content);
    },
    version(inquiry, name, { state = "accepted", hidden = 0, claim = "a claim" } = {}) {
      const ord = w.one(`SELECT COUNT(*) AS n FROM inquiry_basis_versions WHERE bundle_id=?`, inquiry).n;
      st.sql.exec(`INSERT INTO inquiry_basis_versions (bundle_id, name, ord, description, relationship, state, hidden, claim, composition)
                   VALUES (?, ?, ?, 'd', 'and', ?, ?, ?, 'c')`, inquiry, name, ord, state, hidden, claim);
    },
    versionLeg(inquiry, name, ord, { content = null, target = "INFO-2026-0001", type = "information" } = {}) {
      st.sql.exec(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id, target_type, role, ground, content_id)
                   VALUES (?, ?, ?, ?, ?, 'supports', '', ?)`, inquiry, name, ord, target, type, content);
    },
    /* A reading of `capture` (extraction's table): `contentType` its doctype, `date` its top-level date. */
    reading(capture, bundleId, { contentType = null, date = null } = {}) {
      w.bundle(bundleId);
      const reading = { content_type: contentType, found: true, ...(date == null ? {} : { date }) };
      st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type, reading) VALUES (?, ?, ?, ?)`,
                  capture, bundleId, contentType, JSON.stringify(reading));
    },
    resolution(capture, bundleId, entity, { established = 1, ref = "ref:1" } = {}) {
      st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, established)
                   VALUES (?, ?, ?, ?, ?, 'test', ?)`, capture, bundleId, ref, entity, established ? "A" : "C", established);
    },
    /* Projects drawing on an inquiry (basis-versions R37's stand-in), and a project's concluded stance (R22's). */
    draws(inquiry, ...projects) { drawing.set(inquiry, [...new Set([...(drawing.get(inquiry) || []), ...projects])]); },
    stance(project, inquiry, claim, version = "v1") { w.draws(inquiry, project); stances.set(`${project}|${inquiry}`, { claim, version }); },
  };
  return w;
}

/* A K4 world: entity E1, two cited passages of two captures resolving (established) to it, read as `a` and `b`. */
export function k4World(a = {}, b = {}, opts = {}) {
  const w = world(opts);
  w.inquiry("INQ-2026-0001");
  w.content("ca", "capA", "INFO-2026-0001");
  w.content("cb", "capB", "INFO-2026-0002");
  w.leg("INQ-2026-0001", 0, "supports", { content: "ca" });
  w.leg("INQ-2026-0001", 1, "supports", { content: "cb" });
  w.resolution("capA", "INFO-2026-0001", "E1");
  w.resolution("capB", "INFO-2026-0002", "E1");
  if (a !== null) w.reading("capA", "INFO-2026-0001", a);
  if (b !== null) w.reading("capB", "INFO-2026-0002", b);
  return w;
}
