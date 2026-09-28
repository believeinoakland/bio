/* ratification over the modules it uses. record-core, membership and promotion are the real ones, on a real SQLite
   database (node:sqlite) standing in for a Durable Object's storage: the head, the transaction, the authority and sight
   questions, and the registrations (R8, R9) are theirs. What basis-versions, provenance, inquiry and publication
   provide is a provider the test controls, as `ratificationOf`'s deps take them: the conclusion reads (R1), the gate
   facts (R7), and publication's reads and its two commits (R22), which record every call so a test can say what this
   module handed them. Publication's `case_documents` and `cases` (its R40 read contract, read here in this module's own
   SQL) are created from publication's schema and filled as publication's writers would. Every test drives
   `ratification` at its interface: the store half (`ratificationOf`, `ratificationOps`) and the Worker half
   (`caseRatifyOp`, `ratifyOp`) with a Durable Object stub that routes to the store half. */
import { DatabaseSync } from "node:sqlite";
import { createHash, webcrypto } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { PUBLICATION_SCHEMA } from "../../../src/publication/index.mjs";
import { ratificationOf, ratificationOps } from "../../../src/ratification/index.mjs";
import { ratifyStatement, caseRatifyStatement, NS_RATIFY } from "../../../src/sshsig.mjs";

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

const bare = (schema) => schema.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");

export const V = (id) => `member:${id}`;
export const NOW = "2026-09-28T01:00:00Z";
export const PIN0 = "0".repeat(64);

/* ---------------------------------------------------------------- an SSHSIG signer (PROTOCOL.sshsig) */

const enc = (s) => new TextEncoder().encode(s);
const u8 = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};
const u32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const sstr = (v) => { const b = typeof v === "string" ? enc(v) : v; return u8(u32(b.length), b); };
const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const armor = (blob) =>
  `-----BEGIN SSH SIGNATURE-----\n${b64(blob).replace(/(.{70})/g, "$1\n")}\n-----END SSH SIGNATURE-----\n`;

export async function newKey() {
  const kp = await webcrypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const raw = new Uint8Array(await webcrypto.subtle.exportKey("raw", kp.publicKey));
  return { priv: kp.privateKey, raw, keyB64: b64(u8(sstr("ssh-ed25519"), sstr(raw))) };
}

export async function sign(key, message, namespace = NS_RATIFY) {
  const h = new Uint8Array(await webcrypto.subtle.digest("SHA-512", typeof message === "string" ? enc(message) : message));
  const signed = u8(enc("SSHSIG"), sstr(namespace), sstr(new Uint8Array(0)), sstr("sha512"), sstr(h));
  const sig = new Uint8Array(await webcrypto.subtle.sign("Ed25519", key.priv, signed));
  return armor(u8(enc("SSHSIG"), u32(1), sstr(u8(sstr("ssh-ed25519"), sstr(key.raw))), sstr(namespace),
    sstr(new Uint8Array(0)), sstr("sha512"), sstr(u8(sstr("ssh-ed25519"), sstr(sig)))));
}
export const signCase = (key, caseId, edition, docSha) => sign(key, caseRatifyStatement(caseId, edition, docSha));
export const signBundle = (key, id, bundleSha) => sign(key, ratifyStatement(id, bundleSha));

/* ---------------------------------------------------------------- the world */

export function world() {
  const st = storage();
  const host = { storage: st };
  for (const t of bare(RECORD_SCHEMA).split(";")) if (t.trim()) st.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => NOW });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  /* publication's tables, as far as this module reads them (its R40) */
  for (const t of bare(PUBLICATION_SCHEMA).split(";")) if (t.trim()) st.db.exec(t);
  /* the columns of inquiry's `inquiry_basis` and connections' `refs` that R7's facts join, as their writers fill them */
  st.db.exec(`CREATE TABLE inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL)`);
  st.db.exec(`CREATE TABLE refs (bundle_id TEXT NOT NULL, target_id TEXT NOT NULL, kind TEXT NOT NULL DEFAULT '',
                                 PRIMARY KEY (bundle_id, target_id, kind))`);

  /* basis-versions (R1's four reads, R7's reach), as the test sets them */
  const bv = { conc: new Map(), rec: new Map(), np: new Map(), drawing: new Map(), reach: { self: [], via: [] } };
  const key = (p, q) => `${p}\u0000${q}`;
  const basisVersions = {
    conclusionOf: (p, q) => bv.conc.get(key(p, q)) ?? null,
    conclusionRecordOf: (p, q) => bv.rec.get(key(p, q)) ?? { history: [], stance: null },
    noProjectConclusionOf: (q) => bv.np.get(q) ?? null,
    projectsDrawingOn: (q) => bv.drawing.get(q) ?? Object.assign([], { bound: 32, truncated: false }),
    testimonyReach: () => bv.reach,
  };
  /* provenance's register rows and inquiry's earned registry, for R7 */
  const registers = new Map();
  const provenance = { registeredFor: (id) => registers.get(id) ?? [] };
  const inquiry = { subjectEntityOf: (id) => `ENT-of-${id}`,
                    earned: (subject, targets) => ({ subject, earned: { capture: Object.fromEntries(targets.map((t) => [t, null])) } }) };

  /* publication's services, each recording its calls; a test replaces any of them */
  const calls = [];
  const note = (name, fn) => (...a) => { calls.push([name, ...a]); return fn(...a); };
  const pub = {
    facts: new Map(), pins: new Map(), resting: new Map(), claims: new Map(),
    committed: [], editions: [],
  };
  const publication = {
    caseDocumentFacts: note("caseDocumentFacts", (c, e) => pub.facts.get(`${c}#${Number(e)}`) ?? { ok: false, reason: "NO_CASE_DOCUMENT" }),
    pinnedCaseEditionsOf: note("pinnedCaseEditionsOf", (id, s) => pub.pins.get(`${id}@${s}`) ?? []),
    ratifiedFindingsRestingOn: note("ratifiedFindingsRestingOn", (id) => pub.resting.get(id) ?? []),
    caseClaimsOf: note("caseClaimsOf", (id) => pub.claims.get(id) ?? []),
    publishedRegistryFor: note("publishedRegistryFor", (id, targets) => ({ asked: [id, ...targets] })),
    publishedCaseRegistryFor: note("publishedCaseRegistryFor", (ids) => ({ cases: ids })),
    attributionStatedFor: note("attributionStatedFor", () => false),
    observationsNamingAuthor: note("observationsNamingAuthor", () => []),
    dischargeCaseFlags: note("dischargeCaseFlags", () => ({ ok: true })),
    /* R22 as publication states it: inside the caller's transaction, `existed` for the same signature. */
    commitCaseEdition: note("commitCaseEdition", (a) => {
      const row = st.sql.exec(`SELECT sig_armored, ratified_at FROM case_documents WHERE case_id=? AND edition=?`,
                              a.case, a.edition)[0];
      if (row && row.ratified_at)
        return row.sig_armored === a.sigArmored ? { ok: true, existed: true }
          : { ok: false, reason: "CASE_EDITION_ALREADY_RATIFIED" };
      st.sql.exec(`UPDATE case_documents SET sig_armored=?, ratified_at=? WHERE case_id=? AND edition=?`,
                  a.sigArmored, a.at, a.case, a.edition);
      if (!st.sql.exec(`SELECT 1 AS x FROM cases WHERE case_id=?`, a.case).length)
        st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, a.case, a.project, a.at);
      pub.committed.push(a);
      return { ok: true, awaiting: a.roster.map((m) => m.bundle_id), caseState: pub.caseState ?? null };
    }),
    commitEdition: note("commitEdition", (a) => {
      const prior = pub.editions.find((e) => e.bundleId === a.bundleId && e.bundleSha === a.bundleSha);
      if (prior) return { ok: true, existed: true, edition: prior.edition, ratifiedAt: prior.at };
      const edition = pub.editions.filter((e) => e.bundleId === a.bundleId).length + 1;
      pub.editions.push({ ...a, edition });
      return { ok: true, existed: false, edition, ratifiedAt: a.at, edges: { serve: 0, name: 0 } };
    }),
  };
  const r = ratificationOf(host, { storage: st, record, membership, promotion, provenance, inquiry, basisVersions,
                                   publication });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, r, bv, key, registers, pub, publication, calls,
    ops: {},   /* stand-ins for other modules' Durable Object ops, by name (the Worker half's tests) */
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    sha: (id) => record.head(id)?.bundleSha ?? null,
    /** An active member, and optionally a registered active signing key. */
    member(id, { role = "member", signer = null } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
      if (signer) st.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES (?, ?, 'active', 't')`,
                              signer.keyB64, id);
    },
    /** A project owned (and so joined) by `owner`; `joined` more members join it without owning it. */
    project(title, owner, { joined = [] } = {}) {
      const res = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
      if (!res.ok) throw new Error(`fixture project refused: ${JSON.stringify(res).slice(0, 400)}`);
      for (const m of joined)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                     VALUES (?, ?, 'joined', 0, 't', 't')`, res.bundleId, m);
      return res.bundleId;
    },
    /** A bundle promoted with `text` as its bundle.md (a creation, or a revision of the head). */
    promote(id, text, type = "inquiry") {
      const head = record.head(id);
      const res = promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`,
        author: V("alice"), files: [{ path: "bundle.md", text }], meta: { object_type: type } });
      if (!res.ok) throw new Error(`fixture promote refused: ${JSON.stringify(res).slice(0, 600)}`);
      return res;
    },
    inquiry(id, opts = {}) { return w.promote(id, inqMd(id, opts)); },
    info(id) { return w.promote(id, infoMd(id), "information"); },
    /** A case document stored unsigned, as publication's R21 stores it; its sha. `owner` also records the case. */
    caseDoc(caseId, edition, text, { owner = null } = {}) {
      const docSha = sha(text);
      st.sql.exec(`INSERT INTO case_documents (case_id, edition, doc_sha, text, authored_by, authored_at)
                   VALUES (?, ?, ?, ?, 'member:alice', ?)`, caseId, edition, docSha, text, NOW);
      if (owner) st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, caseId, owner, NOW);
      return docSha;
    },
    /** The store half's ops, as the legacy store's dispatch reaches them. */
    op(name, query = {}, body = null) {
      const url = new URL(`http://do/${name}`);
      for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
      return ratificationOps(r, url, body)[name]();
    },
  };
  return w;
}

/* ---------------------------------------------------------------- documents */

export function inqMd(id, { state = "open", extra = [] } = {}) {
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
          `current_state: ${state}`, "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "surfaced_by: human", "group: test-group", "references: []",
          "state_history: []", ...extra, "---", "", "## Question", "", "What happened?", "", "## Session Log", ""].join("\n");
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

/** A /4 case document's text over `members` ([{id, pin, role}]), with `conclusions` rows ([[member, conclusion]])
 *  written by this module's one writer, and `extra` frontmatter lines. */
export function caseMd({ caseId, edition, project, members, conclusions = [], extra = [], rowLines }) {
  return ["---", "format: bio-case-document/4", `case_id: ${caseId}`, `case_edition: ${edition}`,
    `case_project: ${project}`, `case_scope: "whether the permits were issued as the minutes say"`,
    `bias_acknowledgement: "we expected the permits were late"`,
    "case_findings:", ...members.map((m) => `  - ${m.id}`),
    "case_roles:", ...members.flatMap((m) => [`  - target: ${m.id}`, `    role: ${m.role || "load_bearing"}`,
                                              `    version_sha: ${m.pin}`, `    edition: 1`]),
    ...(conclusions.length ? ["case_conclusions:", ...conclusions.flatMap(([m, c]) => rowLines(m, c))] : []),
    ...extra, "---", "", "# Case", "", "## What This Excludes", "", "Nothing named.", ""].join("\n");
}

/** A frontmatter document from an object, in the catalogue's restricted grammar (scalars, lists of scalars, maps of
 *  scalars, lists of maps of scalars), `raw` lines appended to the frontmatter, and `body`. */
export function fmText(obj, { raw = [], body = "" } = {}) {
  const sc = (v) => (v === null || v === undefined ? "null" : typeof v === "string" ? JSON.stringify(v) : String(v));
  const lines = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      if (!v.length) { lines.push(`${k}: []`); continue; }
      lines.push(`${k}:`);
      for (const x of v) {
        if (x && typeof x === "object") Object.entries(x).forEach(([kk, vv], i) => lines.push(`${i ? "    " : "  - "}${kk}: ${sc(vv)}`));
        else lines.push(`  - ${sc(x)}`);
      }
    } else if (v && typeof v === "object") {
      lines.push(`${k}:`);
      for (const [kk, vv] of Object.entries(v)) lines.push(`  ${kk}: ${sc(vv)}`);
    } else lines.push(`${k}: ${sc(v)}`);
  }
  return [...lines, ...raw, "---", "", body].join("\n");
}

/** A catalogue-clean information bundle.md (the gate draws no finding over it alone). */
export function cleanInfoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "A report"`,
    "current_state: collected", "prior_state: null", `created: "2026-07-01T00:00:00Z"`, `last_updated: "2026-07-01T00:00:00Z"`,
    "group: test-group", "produced_by:", "  mode: human", "  capability_tier: none", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending: false", "visuals: []", "criticality: supporting", "source_status: unchanged",
    "source:", "  locator: https://example.org/a", "  authority: the publisher", `  retrieved: "2026-07-01T00:00:00Z"`,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", "A document.", "",
    "## Provenance Notes", "", "None.", "", "## Review Notes", "", "## Session Log", ""].join("\n");
}

/** A catalogue-clean bio-case-document/4 as an object (`checkCaseDocument` draws no finding over it). */
export function cleanCase({ caseId, edition, project, members }) {
  return {
    format: "bio-case-document/4", case_id: caseId, case_edition: edition, case_project: project,
    case_scope: "whether the permits were issued as the minutes say", bias_acknowledgement: "we expected them late",
    case_findings: members.map((m) => m.id),
    case_roles: members.map((m, i) => ({ target: m.id, role: i ? "supporting" : "load_bearing", version_sha: m.pin, edition: 1 })),
    completeness: { statement: "the 2019 permits are not covered", author: "alice", at: "2026-09-28T00:00:00Z",
                    subject_position: "not_sought", subject_justification: "the office is closed", acknowledged: 0,
                    statement_by: "alice" },
    completeness_acknowledgements: [], completeness_excluded: [],
    searched: { subject_source: "case_basis", subjects: 1 }, searched_levels: [],
    required_strength: { declared: false },
    bias_manifest: { in_force: false, stated: "no manifest was in force", pins_proposed: 0,
                     pins_proposed_stated: "no adoption pinned a proposed revision" },
    bias_manifest_bundles: [], bias_manifest_pins_proposed: [], case_citations: [],
    case_strength: members.flatMap((m) => [{ target: m.id, axis: "capture", state: "unrated", grade: null },
                                           { target: m.id, axis: "connection", state: "unrated", grade: null }]),
    case_strength_grounds: [],
  };
}
export const CASE_BODY = "# Case\n\n## What This Excludes\n\nNothing named.\n";

/* ---------------------------------------------------------------- the Worker half's control plane */

export const SILENT = Symbol("silent");

/** What the control plane hands `caseRatifyOp` / `ratifyOp`: a Durable Object stub routing to this world's store half
 *  (and to stand-ins for the other modules' ops, `w.ops`), in-memory buckets, and its helpers. A stand-in answering
 *  `SILENT` is a store that did not answer. */
export function plane(w, { session = { role: "member:alice" }, viaSession = true, aiCred = null, cls = "session",
                           viewer = V("alice") } = {}) {
  const captures = new Map(), published = new Map(), assembled = [], fetched = [];
  const stub = {
    async fetch(u, init) {
      const req = u instanceof Request ? u : new Request(u, init);
      const url = new URL(req.url);
      const op = url.pathname.slice(1);
      const body = req.method === "POST" ? await req.json() : null;
      fetched.push(op);
      if (w.ops[op]) return w.ops[op](url, body);
      const q = (k) => url.searchParams.get(k);
      if (op === "casedocfacts") return w.publication.caseDocumentFacts(q("case"), q("edition"), q("viewer"));
      if (op === "image") { const img = w.record.readImage(q("id")); return img || {}; }
      if (op === "list") return w.st.sql.exec(`SELECT bundle_id FROM bundles`);
      if (op === "reusedparts") return { parts: [] };
      if (op === "capturelimit") return { observed: null };
      if (op === "recordreuseverdicts") return { ok: true };
      if (op === "registerholds") return { parts: null, acquired: false };
      const mine = ratificationOps(w.r, url, body)[op];
      if (mine) return mine();
      throw new Error(`no op ${op}`);
    },
  };
  const bucket = (m) => ({
    head: async (k) => (m.has(k) ? { size: m.get(k).length } : null),
    get: async (k) => (m.has(k) ? { body: m.get(k) } : null),
    put: async (k, v) => { m.set(k, v instanceof Uint8Array ? v : new TextEncoder().encode(String(v))); },
  });
  const json = (body, status = 200) => ({ status, body });
  const ctx = {
    env: { CAPTURES: bucket(captures), PUBLISHED: bucket(published) }, json, storeName: "s",
    doAnswer: async (p) => { const v = await p; return v === SILENT ? { answered: false } : { answered: true, result: v }; },
    storeSilent: (op) => json({ ok: false, reason: "STORE_SILENT", op }, 502),
    assembleCaseContainer: async (a) => { assembled.push(a); return { manifest_sha: "m".repeat(64), zip: "z" }; },
    cls, aiCred, viaSession, sessViewer: viewer, sessRights: session,
    captureKey: (store, s) => `${store}/captures/${s}`, withBiasChecks: (image, gate) => gate,
    STORE_SILENT_REASON: "STORE_SILENT", STORE_SILENT_DETAIL: "the store did not answer",
  };
  const request = (body) => new Request("http://plane/op", { method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body) });
  return { stub, ctx, request, captures, published, assembled, fetched };
}
