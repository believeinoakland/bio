/* Test doubles for the two modules promotion uses, each implementing the Provides it builds against
 * (`build/requirements/record-core.md`, `membership.md`, and the record reads of this job's Q2), over an in-memory
 * SQLite database so a refused promotion can be shown to leave the store byte-identical (R2). Also: documents. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { PROJECT_VISIBILITY_CHECKS } from "../../../src/membership/index.mjs";

export const sha = (s) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
export const EMPTY = sha("");

/** record-core, as its Provides state it: transact rolls back every row on a throw or an `ok:false` answer. */
export function makeRecord() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, group_id TEXT NOT NULL, title TEXT,
      current_state TEXT NOT NULL, prior_state TEXT, created TEXT NOT NULL, last_updated TEXT NOT NULL, criticality TEXT,
      bundle_sha TEXT NOT NULL, row_version INTEGER NOT NULL, project TEXT);
    CREATE TABLE files (bundle_id TEXT, path TEXT NOT NULL, content TEXT, blob_sha TEXT, bytes INTEGER NOT NULL,
      sha256 TEXT NOT NULL, PRIMARY KEY (bundle_id, path));
    CREATE TABLE history (bundle_id TEXT, snap_key TEXT NOT NULL, path TEXT, content TEXT, blob_sha TEXT, sha256 TEXT,
      created TEXT, PRIMARY KEY (bundle_id, snap_key, path));
    CREATE TABLE manifest (bundle_id TEXT, snap_key TEXT NOT NULL, kind TEXT, base TEXT, author TEXT, created TEXT,
      files_json TEXT, writer TEXT, operation TEXT, PRIMARY KEY (bundle_id, snap_key));
    CREATE TABLE minted_ids (id TEXT PRIMARY KEY);
    CREATE TABLE side (k TEXT PRIMARY KEY, v TEXT);`);
  let depth = 0;
  const one = (q, ...a) => db.prepare(q).get(...a) ?? null;
  const rows = (q, ...a) => db.prepare(q).all(...a);
  const record = {
    db, one, rows,
    transact(fn) {
      const sp = `sp${depth}`;
      db.exec(depth === 0 ? "BEGIN" : `SAVEPOINT ${sp}`);
      depth++;
      let out;
      try { out = fn(); }
      catch (e) { depth--; db.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${sp}; RELEASE ${sp}`); throw e; }
      depth--;
      if (out && out.ok === false) db.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${sp}; RELEASE ${sp}`);
      else db.exec(depth === 0 ? "COMMIT" : `RELEASE ${sp}`);
      return out;
    },
    head(id) {
      const r = one(`SELECT * FROM bundles WHERE bundle_id=?`, id);
      return r ? { bundleSha: r.bundle_sha, rowVersion: r.row_version, type: r.object_type, title: r.title,
                   currentState: r.current_state, priorState: r.prior_state, groupId: r.group_id,
                   created: r.created, lastUpdated: r.last_updated } : null;
    },
    manifestEntry(id, key) {
      const r = one(`SELECT * FROM manifest WHERE bundle_id=? AND snap_key=?`, id, String(key));
      return r ? { kind: r.kind, base: r.base, author: r.author, created: r.created, writer: r.writer,
                   operation: r.operation, files: JSON.parse(r.files_json) } : null;
    },
    /** record-core R15–R16 as `readImage` states them: live files, each earlier copy under its snap key, a verbatim
     *  promotion record per manifest entry and the manifest, every entry carrying its write-order `seq`. */
    readImage(id) {
      const img = {};
      for (const r of rows(`SELECT * FROM files WHERE bundle_id=?`, id))
        img[r.path] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes };
      const snap = (path, key) => { const dot = path.lastIndexOf("."); return `_history/${dot === -1 ? `${path}_${key}` : `${path.slice(0, dot)}_${key}${path.slice(dot)}`}`; };
      for (const r of rows(`SELECT * FROM history WHERE bundle_id=?`, id))
        img[snap(r.path, r.snap_key)] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
      const entries = [];
      for (const r of rows(`SELECT rowid AS rid, * FROM manifest WHERE bundle_id=? ORDER BY rowid`, id)) {
        entries.push({ key: r.snap_key, seq: entries.length + 1, kind: r.kind, base: r.base, author: r.author, created: r.created });
        img[`_history/promotion_${r.snap_key}.json`] = JSON.stringify({ target: id, base: r.base, files: JSON.parse(r.files_json),
          created: r.created, author: r.author });
      }
      if (entries.length) img["_history/manifest.json"] = JSON.stringify({ entries });
      return Object.keys(img).length ? img : null;
    },
    livePaths: (id) => rows(`SELECT path FROM files WHERE bundle_id=?`, id).map((r) => r.path),
    readFile(id, path) {
      const r = one(`SELECT * FROM files WHERE bundle_id=? AND path=?`, id, path);
      if (!r) return null;
      return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
    },
    bundleInfo(id) {
      const r = one(`SELECT * FROM bundles WHERE bundle_id=?`, id);
      return r ? { id: r.bundle_id, type: r.object_type, title: r.title, project: r.project ?? null } : null;
    },
    listByType({ type, after = null, limit = 200 }) {
      const ids = rows(`SELECT bundle_id FROM bundles WHERE object_type=? AND bundle_id>? ORDER BY bundle_id LIMIT ?`,
                       type, after ?? "", limit).map((r) => r.bundle_id);
      return { ids, cursor: ids.length ? ids[ids.length - 1] : null };
    },
    mintOpaqueId(prefix, year, tail, taken) {
      for (let i = 0; i < 64; i++) {
        const id = `${prefix}-${year}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}${tail}`;
        if (taken(id) || one(`SELECT id FROM minted_ids WHERE id=?`, id)) continue;
        db.prepare(`INSERT INTO minted_ids (id) VALUES (?)`).run(id);
        return id;
      }
      return null;
    },
    /** record-core's grammar seam (§1b): the grammars later modules registered, in module order, as `grammars()`
     *  answers them. A test sets `grammarList`. */
    grammarList: [],
    grammars() { return record.grammarList; },
    /** record-core R67: a registration joins `grammarList` (R55's is promotion's own, made when it is first reached). */
    registerGrammar(module, { ids, arm }) { record.grammarList.push({ module, ids, arm }); return { ok: true, module, ids }; },
    /** record-core R59: the audit checks a module registers, kept for a test to run. */
    auditChecks: [],
    registerAuditCheck(module, check) { record.auditChecks.push({ module, check }); return { ok: true, module }; },
    commits: 0,
    /** record-core R44: the row records `project` and `criticality` as the caller gives them; `commitCalls` keeps each. */
    commitCalls: [],
    commit({ bundleId, type, title, project = null, snapKey, kind, base, author, writer, operation, files, state, priorState, group,
             created, lastUpdated, criticality, at }) {
      record.commitCalls.push({ bundleId, project, criticality });
      record.commits++;
      const key = String(snapKey);
      if (one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, bundleId))
        for (const r of rows(`SELECT * FROM files WHERE bundle_id=?`, bundleId))
          db.prepare(`INSERT INTO history VALUES (?,?,?,?,?,?,?)`).run(bundleId, key, r.path, r.content, r.blob_sha, r.sha256, at);
      db.prepare(`INSERT INTO manifest VALUES (?,?,?,?,?,?,?,?,?)`).run(bundleId, key, kind, base, author, at,
        JSON.stringify(files.map((f) => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      db.prepare(`DELETE FROM files WHERE bundle_id=?`).run(bundleId);
      for (const f of files)
        db.prepare(`INSERT INTO files VALUES (?,?,?,?,?,?)`).run(bundleId, f.path, f.text ?? null, f.blobSha ?? null, f.bytes, f.sha256);
      const md = files.find((f) => f.path === "bundle.md").sha256;
      db.prepare(`INSERT INTO bundles VALUES (?,?,?,?,?,?,?,?,?,?,1,?)
                  ON CONFLICT(bundle_id) DO UPDATE SET object_type=excluded.object_type, title=excluded.title,
                  current_state=excluded.current_state, prior_state=excluded.prior_state,
                  last_updated=excluded.last_updated, criticality=excluded.criticality, bundle_sha=excluded.bundle_sha,
                  row_version=bundles.row_version+1, project=excluded.project`)
        .run(bundleId, type, group, title ?? null, state, priorState ?? null, created, lastUpdated, criticality ?? null, md, project);
      const r = one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { bundleSha: r.bundle_sha, rowVersion: r.row_version };
    },
    /** Every row of every table, for "the record is exactly as it was" (R2). */
    dump() {
      return ["bundles", "files", "history", "manifest", "minted_ids", "side"]
        .map((t) => JSON.stringify(rows(`SELECT * FROM ${t} ORDER BY 1`))).join("\n");
    },
  };
  return record;
}

/** membership, as its Provides state it, with the facts a test sets. */
export function makeMembership() {
  const m = {
    hidden: new Set(), discoverable: new Set(), owners: new Map(), joined: new Map(), invited: new Map(), leaving: new Map(), created: [],
    sight(id, viewer) {
      if (!viewer) return "NONE";
      if (m.hidden.has(id)) return m.discoverable.has(id) && String(viewer).startsWith("member:") ? "EXISTENCE" : "NONE";
      return "FULL";
    },
    inSight: (id, viewer) => m.sight(id, viewer) === "FULL",
    isProjectOwner: (p, who) => (m.owners.get(p) || []).includes(who),
    participation(p, who) {
      if (m.isProjectOwner(p, who)) return { state: "joined", owner: 1 };
      if ((m.joined.get(p) || []).includes(who)) return { state: "joined", owner: 0 };
      if ((m.invited.get(p) || []).includes(who)) return { state: "invited", owner: 0 };
      if ((m.leaving.get(p) || []).includes(who)) return { state: "leaving", owner: 0 };
      return null;
    },
    projectAuthority(p, identity, need, act) {
      if (!identity || !String(identity).startsWith("member:")) return null;
      const who = String(identity).slice(7);
      if (m.isProjectOwner(p, who) || (m.joined.get(p) || []).includes(who)) return null;
      return { ok: false, reason: "PROJECT_ACT_NOT_A_PARTICIPANT", act };
    },
    visibilitySettingRefusal: (v) => (v === "discoverable" || v === "hidden" ? null
      : { ok: false, reason: "PROJECT_VISIBILITY_UNKNOWN_SETTING" }),
    /* R77: C-70.1, minted by membership; the id and name only. `titleOf` is set by makePromotion from the record. */
    titleOf: () => null,
    existenceAct(projectId, viewer) {
      if (viewer === null || viewer === undefined || m.sight(projectId, viewer) !== "EXISTENCE") return null;
      const row = PROJECT_VISIBILITY_CHECKS.PROJECT_SEEN_NOT_A_PARTICIPANT;
      return { ok: false, reason: "PROJECT_SEEN_NOT_A_PARTICIPANT", code: "PROJECT_SEEN_NOT_A_PARTICIPANT", check: row.check,
               translation: row.translation, detail: "membership's words", project: projectId, name: m.titleOf(projectId) };
    },
    visibilityOf: (projectId) => (m.discoverable.has(projectId) ? "discoverable" : "hidden"),
    projectCreated({ projectId, ownerId, visibility, by }) {
      if (!ownerId && visibility == null) { m.ownerless = (m.ownerless || 0) + 1; return { ok: true }; }
      m.created.push({ projectId, ownerId, visibility, by });
      if (ownerId) m.owners.set(projectId, [ownerId]);
      if (visibility === "discoverable") m.discoverable.add(projectId);
    },
  };
  return m;
}

/** project-roster, as its R23 states `projectScope`: `{scope, since, by}`, `none` for a project with no record and for an
 *  id naming no project. `scopes` (project id → scope) is the test's to change; `asked` keeps every id asked. */
export function makeRoster(scopes = {}) {
  const roster = {
    scopes, asked: [],
    projectScope(projectId) {
      roster.asked.push(projectId);
      const scope = Object.prototype.hasOwnProperty.call(roster.scopes, projectId) ? roster.scopes[projectId] : null;
      return scope ? { scope, since: "2026-09-26T11:00:00.000Z", by: "member:ann" } : { scope: "none", since: null, by: null };
    },
  };
  return roster;
}

/** A fresh promotion over fresh doubles, with the three facts the plane's modules register (instance-setup's
 *  `producingGroup`, connections' `citedBy`, publication's `caseMember`; `legacy-store` held them until T19, and the
 *  registrant's name here is only a label). */
export function makePromotion({ group = "test-group", citedBy = {}, caseMember = new Set(), facts = true,
                                now = () => "2026-09-26T12:00:00.000Z", scopes = null } = {}) {
  const record = makeRecord(), membership = makeMembership();
  membership.titleOf = (id) => record.bundleInfo(id)?.title ?? null;
  const host = {};
  const roster = scopes ? makeRoster(scopes) : null;
  const p = promotionOf(host, { record, membership, now, ...(roster ? { roster } : {}) });
  if (facts) {
    p.registerFact("producingGroup", "legacy-store", () => group);
    p.registerFact("citedBy", "legacy-store", (id) => citedBy[id] || []);
    p.registerFact("caseMember", "legacy-store", (id) => caseMember.has(id));
  }
  return { p, record, membership, roster };
}

/** A bundle.md with the given front-matter fields, in the catalogue's grammar, and a body. */
export function doc(fields, body = "\n## Session Log\n") {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    lines.push(`${k}: ${v === null ? "null" : typeof v === "string" && /[:#"]/.test(v) ? JSON.stringify(v) : v}`);
  }
  lines.push("---", body);
  return lines.join("\n");
}

export const T0 = "2026-07-01T00:00:00Z";
export const T1 = "2026-07-02T00:00:00Z";

/** An information item's document. */
export const infoDoc = (id, over = {}) => doc({ id, object_type: "information", title: "A report", current_state: "collected",
  prior_state: null, created: T0, last_updated: T0, group: "test-group", ...over });

/** A creation package for `id` with `text`. */
export const create = (id, text, extra = {}) => ({ bundleId: id, base: null, snapKey: "k1", author: "member:ann",
  files: [{ path: "bundle.md", text }], meta: {}, ...extra });
/** A revision of `id` over `base`. */
export const revise = (id, base, text, extra = {}) => ({ bundleId: id, base, snapKey: "k2", author: "member:ann",
  files: [{ path: "bundle.md", text }], meta: {}, ...extra });

/** A stale-base refusal as promotion gives it, produced by promotion's real code when this is called (K4993 (1)): a
 *  document is created, revised (the base moves), and the revision is sent again over the base it first read. Never a
 *  stored literal; the answer is `{ ok: false, reason: "CAS_STALE", code, check, translation, detail, expected, got }`. */
export function staleBaseRefusal() {
  const id = "INFO-2026-0001";
  const { p } = makePromotion();
  const head = p.promote(create(id, infoDoc(id)));
  if (!head.ok) throw new Error(`staleBaseRefusal: the creation was refused: ${JSON.stringify(head)}`);
  const moved = p.promote(revise(id, head.bundleSha, infoDoc(id, { title: "Moved" })));
  if (!moved.ok) throw new Error(`staleBaseRefusal: the move was refused: ${JSON.stringify(moved)}`);
  const stale = p.promote(revise(id, head.bundleSha, infoDoc(id, { title: "Late" }), { snapKey: "k3" }));
  if (stale.ok !== false || stale.reason !== "CAS_STALE") throw new Error(`staleBaseRefusal: not a stale-base refusal: ${JSON.stringify(stale)}`);
  return stale;
}

/* ---- Fixtures published for the modules that use promotion (K4990, K4993, K4995, K5044). Each is made by promotion's
 * real code when it is called, never stored; each is checked by `fixtures.test.mjs`. ---- */

/** A promotion over the caller's own record and membership (a test that keeps its record). Every step `registerStep`
 *  accepted is read back with `registeredSteps(p)`. */
const STEPS = new WeakMap();
export function promotionOver({ record, membership, host = {}, now = () => "2026-09-26T12:00:00.000Z", roster = null } = {}) {
  const p = promotionOf(host, { record, membership, now, ...(roster ? { roster } : {}) });
  const accepted = [];
  const real = p.registerStep.bind(p);
  p.registerStep = (module, opts) => {
    const r = real(module, opts);
    if (r && r.ok) accepted.push({ module, check: opts && typeof opts.check === "function" ? opts.check : null,
                                   project: opts && typeof opts.project === "function" ? opts.project : null });
    return r;
  };
  STEPS.set(p, accepted);
  return p;
}
/** What `registerStep` accepted on `p` (a promotion made by `promotionOver` or `makePromotion`), in registration order. */
export const registeredSteps = (p) => (STEPS.get(p) || []).map((s) => ({ ...s }));

/** The promotion registrations a user needs, with the refusals promotion really gives: `fact("unregistered")` is
 *  FACT_UNAVAILABLE; a second registration of a step or a fact is STEP_DECLARED. */
export function registrars() {
  const { p, record, membership } = makePromotion({ facts: false });
  const step = p.registerStep("fixture-module", { check: () => null });
  const stepAgain = p.registerStep("fixture-module", { check: () => null });
  const fact = p.registerFact("fixtureFact", "fixture-module", () => 1);
  const factAgain = p.registerFact("fixtureFact", "fixture-module", () => 2);
  const unavailable = p.fact("unregistered");
  if (!step.ok || !fact.ok || stepAgain.reason !== "STEP_DECLARED" || factAgain.reason !== "STEP_DECLARED" || unavailable.reason !== "FACT_UNAVAILABLE")
    throw new Error(`registrars: promotion did not answer as expected: ${JSON.stringify({ step, stepAgain, fact, factAgain, unavailable })}`);
  return { p, record, membership, registerStep: (...a) => p.registerStep(...a), registerFact: (...a) => p.registerFact(...a),
           fact: (...a) => p.fact(...a), onCommitted: (...a) => p.onCommitted(...a), stepDeclared: stepAgain, factDeclared: factAgain,
           factUnavailable: unavailable };
}

/** FACT_UNAVAILABLE as promotion gives it for a fact no module provides: `{ok:false, reason, code, check, translation, fact, detail}`. */
export function factUnavailable() {
  const r = makePromotion({ facts: false }).p.fact("unregistered");
  if (r.ok !== false || r.reason !== "FACT_UNAVAILABLE") throw new Error(`factUnavailable: not a FACT_UNAVAILABLE refusal: ${JSON.stringify(r)}`);
  return r;
}

/** GROUP_UNDETERMINED (R13): a success record created where the store records no producing team and the creation names none. */
export function groupUndetermined() {
  const id = "SUC-2026-0001";
  const { p } = makePromotion({ group: null });
  const text = doc({ id, object_type: "success_record", title: "A success", current_state: "recorded", prior_state: null,
    created: T0, last_updated: T0 });
  const r = p.promote(create(id, text));
  if (r.ok !== false || r.reason !== "GROUP_UNDETERMINED") throw new Error(`groupUndetermined: not a GROUP_UNDETERMINED refusal: ${JSON.stringify(r)}`);
  return r;
}

/** A project created by `owner` (promotion's real creation), and the pieces a test needs to act on it. */
function projectMade(owner = "ann", env = makePromotion()) {
  const text = doc({ object_type: "project", title: "Fixture Project", current_state: "forming", created: T0, last_updated: T0 });
  const made = env.p.promote({ base: null, snapKey: "p1", author: `member:${owner}`, ownerMemberId: owner,
    files: [{ path: "bundle.md", text }], meta: {} });
  if (!made.ok) throw new Error(`projectMade: the creation was refused: ${JSON.stringify(made)}`);
  return { ...env, project: made.bundleId, made, text: env.record.readFile(made.bundleId, "bundle.md").text };
}

/** PROJECT_ACT_NOT_A_PARTICIPANT as promotion gives it when a member who is not in the project revises its document
 *  (membership's `projectAuthority`, reached through `promote`). */
export function projectActNotParticipant() {
  const { p, record, project, text } = projectMade("ann");
  const r = p.promote({ bundleId: project, base: record.head(project).bundleSha, snapKey: "s2", author: "member:carl",
    actorIdentity: "member:carl", actorViewer: "member:carl", actorMemberId: "carl",
    files: [{ path: "bundle.md", text: text.replace("## Session Log", "## Session Log\n\nAn outsider's edit.") }], meta: {} });
  if (r.ok !== false || r.reason !== "PROJECT_ACT_NOT_A_PARTICIPANT") throw new Error(`projectActNotParticipant: not the refusal: ${JSON.stringify(r)}`);
  return r;
}

/** SNAP_KEY_TAKEN: a different promotion sent under a snap key the bundle already holds. */
export function snapKeyTaken() {
  const id = "INFO-2026-0001";
  const { p } = makePromotion();
  const head = p.promote(create(id, infoDoc(id)));
  if (!head.ok) throw new Error(`snapKeyTaken: the creation was refused: ${JSON.stringify(head)}`);
  const r = p.promote(revise(id, head.bundleSha, infoDoc(id, { title: "Two" }), { snapKey: "k1" }));
  if (r.ok !== false || r.reason !== "SNAP_KEY_TAKEN") throw new Error(`snapKeyTaken: not a SNAP_KEY_TAKEN refusal: ${JSON.stringify(r)}`);
  return r;
}

/** CITED: a move into `retired` while inquiries Q and Q2 cite the item, `{ok:false, reason:"CITED", to:"retired", offenders:[{id, citedBy}]}`. */
export function retireCited({ id = "INFO-2026-0001", citedBy = ["INQ-2026-0001", "INQ-2026-0002"] } = {}) {
  const { p } = makePromotion({ citedBy: { [id]: citedBy } });
  const a = p.promote(create(id, infoDoc(id, { current_state: "verified" })));
  if (!a.ok) throw new Error(`retireCited: the creation was refused: ${JSON.stringify(a)}`);
  const r = p.promote(revise(id, a.bundleSha, infoDoc(id, { current_state: "retired" })));
  if (r.ok !== false || r.reason !== "CITED") throw new Error(`retireCited: not a CITED refusal: ${JSON.stringify(r)}`);
  return r;
}

/** promotion's real `promote` over a real record, with a call log that delegates (a spy). `decide(pkg, n)` answers which
 *  real cause the call meets: "succeed" (the default), "stale" (the base moved), "snapkey" (a held snap key), "outsider"
 *  (a non-participant of the project), or "throw" / "fail" (the record fails under it: promotion never throws out, it answers
 *  PROMOTE_FAILED with nothing written). */
export function promoteControlled(decide = () => "succeed") {
  const env = makePromotion();
  const { p, record } = env;
  const log = [];
  const id = "INFO-2026-0001";
  const first = p.promote(create(id, infoDoc(id)));
  const project = projectMade("ann", env);
  let head = first;
  const promote = (pkg = {}) => {
    const n = log.length + 1;
    const verdict = decide(pkg, n);
    log.push({ n, pkg, verdict });
    if (verdict === "throw" || verdict === "fail") {
      const broken = promotionOver({ record: { ...record, transact() { throw new Error("the record failed"); } }, membership: env.membership });
      broken.registerFact("producingGroup", "fixture", () => "test-group");
      return broken.promote(create("INFO-2026-0002", infoDoc("INFO-2026-0002")));
    }
    if (verdict === "stale") return p.promote(revise(id, "0".repeat(64), infoDoc(id, { title: `S${n}` }), { snapKey: `s${n}` }));
    if (verdict === "snapkey") return p.promote(revise(id, head.bundleSha, infoDoc(id, { title: `T${n}` }), { snapKey: "k1" }));
    if (verdict === "outsider") return p.promote({ bundleId: project.project, base: record.head(project.project).bundleSha, snapKey: `o${n}`,
      author: "member:carl", actorIdentity: "member:carl", actorViewer: "member:carl", actorMemberId: "carl",
      files: [{ path: "bundle.md", text: project.text.replace("## Session Log", "## Session Log\n\nNoted.") }], meta: {} });
    const next = p.promote(revise(id, head.bundleSha, infoDoc(id, { title: `V${n}` }), { snapKey: `v${n}` }));
    if (next.ok) head = next;
    return next;
  };
  return { promote, log, p, record };
}
