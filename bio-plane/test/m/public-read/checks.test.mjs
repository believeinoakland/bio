/* public-read — its own refusal rows (R17; K651, K93 (3): rows follow their raisers). The table holds C-44.2, C-68.5 and
   C-98.1–C-98.9 under their family names, each with its number, `where` and translation as `publication`'s table held
   them (pinned here by number, `where` and the translation's sha256, so a change to any fails); `rowOf` answers a row
   here and throws for any other code; and every refusal this module answers with one of these codes, at every site
   that raises it, carries its row from here. Driven at the module's interface: its store ops (`publicReadOps`) and the
   Worker's routes (`publishedRoutes`), the control plane's helpers bound as the plane binds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, stubOf, bucket, sha } from "./fixture.mjs";
import * as CHECKS from "../../../src/public-read/checks.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";
import { CONTAINER_MAX_BYTES } from "../../../src/container.mjs";

const { rowOf } = CHECKS;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

/* The rows as moved: family → code → [check, where, the first 16 hex of the translation's sha256]. */
const MOVED = {
  CASE_RESOLUTION_CHECKS: {
    FINDING_IN_SEVERAL_CASES: ["C-44.2", "src/public-read/index.mjs #resolveOneCase > is-finding-in-several-cases", "9bc6636d266af9ac"] },
  PUBLISHED_STORE_CHECKS: {
    NO_PUBLISHED_STORE: ["C-68.5", "src/publication/worker.mjs publishedStoreAbsent > is-published-store-absent", "73d5d27c455119e3"] },
  PUBLISHED_READ_CHECKS: {
    NO_PUBLISHED_PART: ["C-98.1", "src/publication/worker.mjs noPublishedPart > is-no-published-part", "57f8d6c2a5c065f0"],
    OBJECT_MISSING: ["C-98.2", "src/publication/worker.mjs publishedObjectMissing > is-published-object-missing", "7e1d31bb55fe7dca"],
    NOT_A_CONTAINER: ["C-98.3", "src/publication/worker.mjs publishedRoutes > is-not-a-container", "45d2eb9c5e5c934d"],
    MANIFEST_UNREADABLE: ["C-98.4", "src/publication/worker.mjs publishedRoutes > is-manifest-unreadable", "3df3fafa72b7b9ca"],
    PART_MISSING: ["C-98.5", "src/container.mjs containerEntries > is-part-missing", "ce5b0b7ff62bbb91"],
    DUPLICATE_PATH: ["C-98.6", "src/container.mjs serialiseContainer > is-duplicate-path", "971b174f1f8f2aa6"],
    CONTAINER_TOO_LARGE: ["C-98.7", "src/container.mjs serialiseContainer > is-container-too-large", "e299ef045e0a0d8b"],
    NOT_PUBLISHED: ["C-98.8", "src/public-read/index.mjs publishedCase > is-not-published", "bf79ad45a8e581b6"],
    CASE_DOCUMENT_UNSERVABLE: ["C-98.9", "src/publication/worker.mjs publishedRoutes > is-case-document-unservable", "0a10cff464f2574e"],
    /* C-98.10 (R18; K1149): a row minted here in T23, awaiting stamp; its translation as R17 states it, word for word. */
    PUBLIC_READ_NOT_REGISTERED: ["C-98.10", "src/public-read/index.mjs publicRead > is-public-read-not-registered", "5bd5f9f10b3aa19b"] },
};
const digest = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

const F = "INQ-2026-0001";
/* CASE-2026-0001 edition 1 over F, ratified and published; F's bytes and the container in the published bucket. */
async function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const text = w.text(F);
  w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] });
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin, proj };
}
/* A further case edition whose recorded manifest is `bytes`, in the bucket under its hash. */
function manifestAt(w, env, bytes) {
  const n = w.count("published_cases") + 1;
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened) VALUES ('CASE-2026-0001', ?, '2026-09-28T00:00:00Z')`, n);
  const s = sha(Buffer.from(bytes));
  let manifest; try { manifest = JSON.parse(new TextDecoder().decode(bytes)); } catch { manifest = { unreadable: true }; }
  assert.equal(w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: n, manifest, manifestSha: s }).ok, true);
  env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
  return s;
}
const enc = (o) => new TextEncoder().encode(typeof o === "string" ? o : JSON.stringify(o));

test("R17 the module holds C-44.2, C-68.5 and C-98.1–C-98.10 in its own table, under their family names, each number, where and translation as moved; rowOf answers them and throws for any other code", () => {
  const families = Object.keys(CHECKS).filter((k) => /_CHECKS$/.test(k)).sort();
  assert.deepEqual(families, Object.keys(MOVED).sort(), "exactly the three families");
  for (const [fam, rows] of Object.entries(MOVED)) {
    assert.deepEqual(Object.keys(CHECKS[fam]).sort(), Object.keys(rows).sort(), fam);
    for (const [code, [check, where, t]] of Object.entries(rows)) {
      const row = CHECKS[fam][code];
      assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
      assert.deepEqual([row.check, row.where, digest(row.translation)], [check, where, t], `${code}: number, where and translation unchanged`);
      assert.deepEqual(rowOf(code), { code, check, translation: row.translation }, code);
    }
  }
  /* no row id is held twice in the table */
  const ids = families.flatMap((f) => Object.values(CHECKS[f]).map((r) => r.check));
  assert.equal(new Set(ids).size, ids.length);
  /* any other code throws: another module's code, a prototype name, nothing */
  for (const other of ["ATTRIBUTION_NO_LEVEL", "SOURCE_CONSENT_WITHDRAWN", "STORE_DID_NOT_ANSWER", "NOT_FOUND",
                       "constructor", "toString", "__proto__", "", undefined, null])
    assert.throws(() => rowOf(other), /no row with a canned translation/, String(other));
});

test("R17 every refusal the module answers with one of these codes, at every site that raises it, carries its row from here", async () => {
  const got = new Map();
  const seen = (body, where) => {
    assert.equal(body.ok, false, where);
    const row = rowOf(body.reason);
    assert.deepEqual([body.code, body.check, body.translation], [row.code, row.check, row.translation], where);
    got.set(body.reason, (got.get(body.reason) || 0) + 1);
  };
  const { w, env, pin, proj } = await published();
  /* the store side: C-98.8, and C-44.2 by finding id and by hash */
  seen(w.read("publishedcase", { id: "NOPE" }), "publishedcase NOT_PUBLISHED");
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase("CASE-2026-0002", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  seen(w.read("publishedcase", { id: F }), "publishedcase by finding");
  seen(w.read("publishedcase", { sha256: pin }), "publishedcase by hash");
  /* the Worker relays the store's refusal with its row */
  seen(await (await call(w, env, "publishedcase", { id: F })).json(), "Worker publishedcase FINDING_IN_SEVERAL_CASES");
  seen(await (await call(w, env, "publishedcase", { id: "NOPE" })).json(), "Worker publishedcase NOT_PUBLISHED");
  /* publishedbytes: C-98.1, C-98.3, C-98.9 */
  seen(await (await call(w, env, "publishedbytes", { sha256: "0".repeat(64) })).json(), "NO_PUBLISHED_PART");
  seen(await (await call(w, env, "publishedbytes", { sha256: pin, format: "zip" })).json(), "NOT_A_CONTAINER");
  const doc = w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id='CASE-2026-0001'`);
  w.st.sql.exec(`UPDATE case_documents SET text=text || 'x' WHERE case_id='CASE-2026-0001'`);
  seen(await (await call(w, env, "publishedbytes", { sha256: doc.doc_sha })).json(), "CASE_DOCUMENT_UNSERVABLE");
  w.st.sql.exec(`UPDATE case_documents SET text=? WHERE case_id='CASE-2026-0001'`, doc.text);
  /* the container form: C-98.4, C-98.5, C-98.6, C-98.7 */
  seen(await (await call(w, env, "publishedbytes", { sha256: manifestAt(w, env, enc("not json")), format: "zip" })).json(), "MANIFEST_UNREADABLE");
  seen(await (await call(w, env, "publishedbytes", { sha256: manifestAt(w, env, enc({ case: "C", parts: [{ path: "a", sha256: "9".repeat(64) }] })),
                                                     format: "zip" })).json(), "PART_MISSING");
  seen(await (await call(w, env, "publishedbytes", { sha256: manifestAt(w, env, enc({ case: "C", parts: [{ path: "a", sha256: pin }, { path: "a", sha256: pin }] })),
                                                     format: "zip" })).json(), "DUPLICATE_PATH");
  const big = sha("R17 one large part");
  env.PUBLISHED.m.set(`bio/published/${big}`, new Uint8Array(CONTAINER_MAX_BYTES / 2 + 1));
  const tooLarge = await call(w, env, "publishedbytes", { sha256: manifestAt(w, env, enc({ case: "C",
    parts: [{ path: "a", sha256: big }, { path: "b", sha256: big }] })), format: "zip" });
  assert.equal(tooLarge.status, 413);
  seen(await tooLarge.json(), "CONTAINER_TOO_LARGE");
  env.PUBLISHED.m.delete(`bio/published/${big}`);
  /* the bytes: C-98.2 at publishedbytes and at publishedcase's finding body; C-68.5 at both */
  env.PUBLISHED.m.delete(`bio/published/${pin}`);
  seen(await (await call(w, env, "publishedbytes", { sha256: pin })).json(), "publishedbytes OBJECT_MISSING");
  const body = (await (await call(w, env, "publishedcase", { id: "CASE-2026-0001", edition: 1 })).json()).findings[0].body;
  assert.equal(body.state, "unavailable");
  seen({ ok: false, ...body }, "publishedcase body OBJECT_MISSING");
  seen(await (await call(w, {}, "publishedbytes", { sha256: pin })).json(), "publishedbytes NO_PUBLISHED_STORE");
  const ub = (await (await call(w, {}, "publishedcase", { id: "CASE-2026-0001", edition: 1 })).json()).findings[0].body;
  seen({ ok: false, ...ub }, "publishedcase body NO_PUBLISHED_STORE");
  /* C-98.10: an unregistered public read, at the store op and through the door (R18) */
  seen(w.read("publicread", { name: "nosuchread" }), "publicread PUBLIC_READ_NOT_REGISTERED");
  const nr = await publicReadDoorOp("publicread", new URL("https://plane/?op=publicread&name=nosuchread"), env, stubOf(w),
    { json, storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502), storeRefusal: () => null,
      requiredArgument: () => ({}), doAnswer: async (res) => ({ answered: true, result: (await (await res).json()).result }) });
  assert.equal(nr.status, 404);
  seen(await nr.json(), "door publicread PUBLIC_READ_NOT_REGISTERED");
  assert.equal(rowOf("PUBLIC_READ_NOT_REGISTERED").translation,
               "This copy of the record offers no public read by that name. Nothing was changed.");
  /* every code of the table was met at a site */
  assert.deepEqual([...got.keys()].sort(), Object.values(MOVED).flatMap((r) => Object.keys(r)).sort());
});
