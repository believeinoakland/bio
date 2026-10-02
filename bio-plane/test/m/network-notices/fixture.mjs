/* network-notices over the modules it uses, the real ones (record-core, membership, credentials, promotion, provenance,
   publication, project-stage, signatures) on a real SQLite database (node:sqlite) standing in for a Durable Object's
   storage, answering as workerd's does (a cursor). Members, project participations and signer keys are rows of their
   modules' own tables, written as those modules' acts would leave them; a project and its records are real bundles
   committed through record-core at stated instants, so the member acts (R8) are real history entries. project-stage's
   layer-6 readers (`basisVersions`, `inquiry`) answer that a project holds no question, so its stage is decided by
   rule 1 alone (the owner's recorded close). The timestamp authorities are STUBBED in every test (R15, R30): `tsa`
   answers each request with a well-formed RFC 3161 response bound to the digest it asked about, or refuses, and records
   every outbound call. The group slug is the fact `producingGroup` (promotion R40), registered as instance-setup does.
   Every test drives `network-notices` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash, generateKeyPairSync } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { projectStageOf } from "../../../src/project-stage/index.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { networkNoticesOf } from "../../../src/network-notices/index.mjs";
import { signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";
import { NS_NOTICE } from "../../../src/sshsig.mjs";

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
export const SLUG = "test-group";
export const DAY = 86400000, WEEK = 7 * DAY;
/** Thursday 2026-10-01, noon UTC: the fixture's "now" unless a test moves the clock. */
export const NOW = Date.parse("2026-10-01T12:00:00Z");
export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const EMPTY = sha("");
export const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
export const day = (ms) => new Date(ms).toISOString().slice(0, 10);
/** The Monday 00:00Z of the week holding `ms`. */
export const monday = (ms) => { const d = Math.floor(ms / DAY) * DAY; return d - ((new Date(d).getUTCDay() + 6) % 7) * DAY; };

/** A member's ratification key (the browser signer's envelope form) and its wire base64. */
export function keyFor(label) {
  const seed = createHash("sha256").update(`seed:${label}`).digest();
  const env = `BIOKEY-RAW1.bio-ratify.${seed.toString("base64")}`;
  return { env, b64: signerPublicLine(env).split(" ")[1] };
}

/** An RFC 3161 TimeStampResp, status granted, whose token carries the requested digest (the binding signatures R17 checks). */
function tsResponse(digestBytes) {
  const tlv = (tag, body) => Buffer.concat([Buffer.from([tag, body.length]), body]);
  return tlv(0x30, Buffer.concat([tlv(0x30, tlv(0x02, Buffer.from([0]))), tlv(0x30, tlv(0x04, Buffer.from(digestBytes)))]));
}
/** The digest an RFC 3161 request asks about: the 32 bytes after the SHA-256 OID's NULL and OCTET STRING header. */
function digestOfRequest(der) {
  const b = Buffer.from(der);
  const i = b.indexOf(Buffer.from([0x04, 0x20]));
  return b.subarray(i + 2, i + 34);
}

/** The stubbed authorities: `mode` "grant" answers every request bound to it, "refuse" answers 503 everywhere. */
export function tsa() {
  const t = { mode: "grant", calls: [],
    fetch: async (url, init) => {
      t.calls.push({ url, method: init && init.method, headers: init && init.headers });
      if (t.mode !== "grant") return new Response("down", { status: 503 });
      return new Response(tsResponse(digestOfRequest(init.body)), { status: 200, headers: { "content-type": "application/timestamp-reply" } });
    } };
  return t;
}

export function world({ key = true, slug = SLUG, before = null } = {}) {
  const st = storage();
  const host = { storage: st, env: {} };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const credentials = credentialsOf(host, { record, membership });
  credentials.migrate();
  const promotion = promotionOf(host, { record, membership });
  if (slug) promotion.registerFact("producingGroup", "instance-setup", () => slug);
  const instanceKey = key ? generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64") : null;
  const provenance = provenanceOf(host, { record, membership, promotion, signingKey: instanceKey, now: () => iso(clock.now) });
  provenance.migrate();
  const publication = publicationOf(host, { record, membership, promotion });
  const projectStage = projectStageOf(host, { record, membership,
    basisVersions: { projectQuestions: () => ({ items: [], cursor: null }), conclusionOf: () => null },
    inquiry: { basisFor: () => null } });
  const publicRead = publicReadOf(host, { publication });
  const authorities = tsa();
  const governed = [];
  const governor = { admit: async (q) => { governed.push(q.host); return { admitted: true, wait_ms: 0 }; }, report: async () => ({ recorded: true }) };
  let n = 0;
  const w = {
    st, host, record, membership, credentials, promotion, provenance, publication, projectStage, publicRead, clock, tsa: authorities, governed,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'nn_%' ORDER BY name`))
        out[name] = JSON.stringify([...st.sql.exec(`SELECT * FROM ${name}`)]);
      return out;
    },
    member(id, { role = "member", status = "active", key: withKey = true } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
      if (withKey) st.sql.exec(`INSERT INTO signers (key_b64, member_id, comment, status, added) VALUES (?, ?, 'k', 'active', ?)`,
                               keyFor(id).b64, id, "2026-09-01T00:00:00Z");
    },
    /** A history entry on bundle `id` (created when absent) at `at`, by `author`. */
    commit(id, { at = clock.now, author = V("alice"), writer = null, project = null, type = "information", state = "collected",
                 text = null } = {}) {
      const head = record.head(id);
      const body = text ?? ["---", `id: ${id}`, `object_type: ${type}`, `title: "${id}"`, `current_state: ${state}`,
                            ...(project ? [`project: ${project}`] : []), "---", "", `${n}`, ""].join("\n");
      record.transact(() => record.commit({ bundleId: id, type, title: id, project, snapKey: `s${++n}`, kind: "promotion",
        base: head ? head.bundleSha : EMPTY, author, writer, operation: writer ? "op" : null,
        files: [{ path: "bundle.md", text: body, sha256: sha(body), bytes: Buffer.byteLength(body) }], state, priorState: null,
        group: SLUG, created: iso(at), lastUpdated: iso(at), criticality: null, at: iso(at) }));
      return id;
    },
    /** A project bundle created at `at`, `owner` its owner (joined). */
    project(slug_, owner, { at = Date.parse("2026-01-05T09:00:00Z") } = {}) {
      const id = `PROJ-2026-${String(++n).padStart(4, "0")}-${slug_}`;
      w.commit(id, { at, author: V(owner), type: "project", state: "forming" });
      w.join(id, owner, "joined", true);
      return id;
    },
    /** The owner closes the project (rule 1 of project-stage R2). */
    close(pid, { at = clock.now, by = "alice" } = {}) {
      const text = ["---", `id: ${pid}`, "object_type: project", `title: "${pid}"`, "current_state: closed", "closed_reason: resolved",
                    "---", "", "closed", ""].join("\n");
      w.commit(pid, { at, author: V(by), type: "project", state: "closed", text });
    },
    /** record-core's purge; a table another module declares but this world never created is created empty first. */
    purge(opts) {
      for (let i = 0; i < 50; i++) {
        try { return record.purge(opts); }
        catch (e) {
          const m = /no such table: (\w+)/.exec(String(e && e.message));
          if (!m) throw e;
          st.db.exec(`CREATE TABLE ${m[1]} (bundle_id TEXT, project_id TEXT, project TEXT, case_id TEXT)`);
        }
      }
      throw new Error("purge: too many missing tables");
    },
    join(projectId, memberId, state = "joined", owner = false) {
      st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, ?, 't', 't')`, projectId, memberId, state, owner ? 1 : 0);
    },
    /** A member act on a record of the project at `at` (R8). */
    act(pid, at, { author = V("alice"), writer = null, bundle = null } = {}) {
      return w.commit(bundle || `INFO-2026-${String(++n).padStart(4, "0")}-doc`, { at, author, writer, project: pid });
    },
    /** One member act in each of the `k` complete weeks before `asOf` (most recent first). */
    weeksOfWork(pid, k, asOf = clock.now, opts = {}) {
      for (let i = 1; i <= k; i++) w.act(pid, monday(asOf) - i * WEEK + DAY, opts);
    },
    /** A ratified case edition of `pid`, its members `members` (written as publication's commit would leave them). */
    publish(pid, caseId, edition = 1, members = []) {
      st.sql.exec(`INSERT OR IGNORE INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, caseId, pid, iso(clock.now));
      st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened, ratified_at, scope) VALUES (?, ?, ?, ?, ?)`,
                  caseId, edition, iso(clock.now), iso(clock.now), "What the case covers.");
      members.forEach((b, i) => st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                                              VALUES (?, ?, ?, ?, NULL, 'supporting')`, caseId, edition, i, b));
    },
  };
  if (typeof before === "function") before(w);
  w.nn = networkNoticesOf(host, { record, membership, credentials, promotion, provenance, publication, projectStage,
                                  publicRead, governor, fetch: authorities.fetch, now: () => clock.now });
  return w;
}

/** The common world: alice and bob owners of P (created 2026-01-05); carol joined in P, not an owner; dave owner of Q;
 *  each with a registered ratification key. */
export function seeded(opts = {}) {
  const w = world(opts);
  for (const m of ["alice", "bob", "carol", "dave"]) w.member(m);
  w.P = w.project("budget", "alice");
  w.join(w.P, "bob", "joined", true);
  w.join(w.P, "carol");
  w.Q = w.project("harbour", "dave");
  return w;
}

export const BASE = { wording: "Tracing the budget transfers", since: "2026-02-01" };
/** Prepares as `who` (alice by default) on P. */
export const prepare = (w, x = {}, who = "alice") =>
  w.nn.prepareNotice({ project: w.P, ...BASE, by: V(who), viewer: V(who), ...x });
/** Signs a prepared answer's statement with `who`'s key, in the notice namespace. */
export const sign = (prep, who = "alice", ns = NS_NOTICE) => signSshsig(keyFor(who).env, Buffer.from(prep.statement, "utf8"), ns);
/** Prepares, signs and posts; throws on any refusal. */
export async function post(w, x = {}, who = "alice") {
  const p = await prepare(w, x, who);
  if (!p.ok) throw new Error(`fixture prepare refused: ${JSON.stringify(p).slice(0, 300)}`);
  const r = await w.nn.postNotice({ digest: p.digest, signature: sign(p, who), acknowledged: true, by: V(who), viewer: V(who) });
  if (!r.ok) throw new Error(`fixture post refused: ${JSON.stringify(r).slice(0, 300)}`);
  return { ...r, prepared: p };
}
