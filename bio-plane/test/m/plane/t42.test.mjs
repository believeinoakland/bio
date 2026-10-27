/* plane T42's composition (R35's `caseAccount`, R36, R37, R38; N826, N832, N839; K2611, K2630, K2634, K2635, K2656):
   the transcriber registered with extraction and the door's `pagetranscribe` arm (R36), doorbell composed after capture
   and the public knock through `doorbellPublicOp` (R37), case-account built before review (R38) and handed to
   control-plane's owner map (R35). Each module's own behaviour is its own tests'; these check the composition through the
   plane's interface: construction over a storage, the route map, the object's door, the Worker's hooks (`publicOp`,
   `gatedOp`), the transcriber the plane registers, and the Worker under Miniflare. Each test carries a negative control
   (K874). */
import "../../../src/store-assembly/register.mjs";   /* R68: the start's registration before any op table is read */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { store, storage, Store, disclosed, assembledOver } from "./fixture.mjs";
import { Miniflare } from "miniflare";
import { doorbellOf, doorbellOps } from "../../../src/doorbell/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { caseAccountOf } from "../../../src/case-account/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { aiRunsOf } from "../../../src/ai-runs/index.mjs";
import { aiUseOf } from "../../../src/ai-use/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { aiAccountsOf } from "../../../src/ai-accounts/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { CIVICSMITH_TEST_SET } from "../../../src/run-rules/index.mjs";
import { assistantGateOf } from "../../../src/store-assembly/ask.mjs";
import { transcriberOf, renderPages, TRANSCRIBE_PAGES_MAX, TRANSCRIBE_IMAGE_MAX_BYTES, TRANSCRIBE_LOAD_MAX, PAGES_MAX, OWED } from "../../../src/store-assembly/transcribe.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";
import { publicOp, gatedOp } from "../../../src/plane/door.mjs";
import * as AGENT_WORKER_OPS from "../../../../agent-worker/src/ops.mjs";
import { renderPageToPixels } from "../../../../pdf-worker/src/pagepixels.mjs";
import { pageRefusal } from "../../../../pdf-worker/test/pdf-pixels-fixtures.mjs";   /* pdf-pixels' published refusals, made by its real renderers */
import { word } from "../../../src/setup-words/index.mjs";

const SENTINEL = "sk-ant-SENTINEL-T42-0000";
const SCAN = new Uint8Array(readFileSync(fileURLToPath(new URL("../../../../pdf-worker/test/fixtures/scan-dct-page.pdf", import.meta.url))));
const shaOf = (b) => createHash("sha256").update(b).digest("hex");

/* The evidence bucket (`CAPTURES`), in memory, counting its reads. */
function bucket() {
  const held = new Map(), calls = [];
  const object = (k, b) => ({ key: k, size: b.length, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) });
  return { calls, held,
    async put(k, v) { const b = v instanceof Uint8Array ? v : new TextEncoder().encode(String(v)); held.set(k, b); return { key: k, size: b.length }; },
    async get(k) { calls.push(["get", k]); return held.has(k) ? object(k, held.get(k)) : null; },
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async delete(k) { held.delete(k); },
    async list() { return { objects: [...held.keys()].map((key) => ({ key })), truncated: false }; } };
}

/* A plane built by hand over a fresh storage, so a test may hand the transcriber its set before construction (K61: a
   factory reads its deps on the first call only). `ann` holds an API-key account; the group's keep-away is off. */
async function plane({ testSet = null, worker = null, evidence = bucket(), account = true } = {}) {
  const st = storage();
  const env = { STORE: { idFromName: (n) => n }, ACCOUNT_SEAL_SECRET: "a-long-seal-secret-for-the-t42-test", CAPTURES: evidence,
                ...(worker ? { AGENT_WORKER: worker } : {}) };
  /* R40 (T46): a test's own set is ai-runs', handed through `assistantGateOf` before construction */
  if (testSet) assistantGateOf(st.ctx, { testSet });
  const s = new Store(st.ctx, env);
  /* the class holds no route map (plane R1): the map is the assembled store's over the same storage */
  const assembled = assembledOver(st.ctx, env);
  s.routes = (url, body = null, grant = null) => assembled.routes(url, body, grant);
  for (const p of st.blocked) await p;
  const ctx = st.ctx, sql = ctx.storage.sql;
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
            VALUES ('ada', 'Cover ada', 'h_ada', 'admin', 'active', '["contribute"]', 't', 't')`);
  assert.equal(credentialsOf(ctx).aiKeepAwaySet({ on: false, by: "ada" }).ok, true);
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
            VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  if (account) {
    await disclosed(ctx);   /* R44 (T47): the disclosure first, as the assembled plane asks */
    const r = await credentialsOf(ctx).accountReferenceSet({ member: "member:ann", kind: "apikey", secret: SENTINEL, by: "member:ann" });
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  const routes = (path, body = null) => s.routes(new URL("http://do" + path), body);
  const call = async (path, body = null) => {
    const op = new URL("http://do" + path).pathname.slice(1);
    return JSON.parse(JSON.stringify(await routes(path, body)[op]() ?? null));
  };
  return { s, ctx, env, evidence, routes, call, rows: (q, ...a) => [...sql.exec(q, ...a)] };
}
const hold = async (evidence, bytes) => { const d = shaOf(bytes); await evidence.put(`bio/captures/${d}`, bytes); return d; };

/* ===== R37 ===== */




test("R113 (was R37, in part; doorbell R20): the public hook's knock is doorbell's handler: it forwards `/knock` with the country the door read, refuses an empty knock KNOCK_EMPTY (C-85.5) before the store, and answers no other op", async () => {
  const seen = [];
  const stub = { fetch: async (r) => { seen.push(String(r instanceof Request ? r.url : r));
    return new Response(JSON.stringify({ ok: true, result: { ok: true, knockId: "k" } }), { headers: { "content-type": "application/json" } }); } };
  const env = { STORE: { idFromName: (n) => n, get: () => stub } };
  const hook = (op, body, country = "US") => { const url = new URL(`http://x/api/?op=${op}`);
    return publicOp({ req: new Request(url, { method: "POST", body }), url, env, op, stub, fp: "f", presentedAi: { cred: null },
                      credential: null, country }); };
  const ok = await hook("knock", JSON.stringify({ contentText: "a tip" }));
  assert.equal(ok.status, 200);
  assert.ok(seen.some((u) => /^http:\/\/do\/knock\?.*country=US/.test(u)), seen.join(" "));
  const knocks = () => seen.filter((u) => u.startsWith("http://do/knock?")).length;
  const empty = await hook("knock", JSON.stringify({ contentText: "" }));
  const eb = await empty.json();
  assert.deepEqual([empty.status, eb.reason, eb.check], [400, "KNOCK_EMPTY", "C-85.5"]);
  assert.equal(knocks(), 1, "refused before the store's knock (only its refusal is counted, doorbell R19)");
  /* negative control: another public op is not the knock's (the bootstrap report answers it) */
  await hook("bootstrap", null);
  assert.equal(seen.filter((u) => u.startsWith("http://do/knock")).length, 1);
});

/* capture's `plane.test.mjs`:66–75, carried and re-pointed (K2630, K2634): the knock at the whole plane's door. */
const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t42-adm", MEMBER_TOKEN: "t42-mem", VERSION: "test" },
});
after(() => mf.dispose());
const send = async (q, init) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, body, text };
};

test("R113 (was R37, in part; K2630, K2634; doorbell R1, R11; carried from capture's plane.test.mjs:66–75): op=knock is reached at the whole plane's door with no token, through doorbell's doorbellPublicOp, and answers as the doorbell does; GET is 405 and an empty knock KNOCK_EMPTY (C-85.5)", async () => {
  const k = await send("op=knock", { method: "POST", headers: { "cf-connecting-ip": "203.0.113.8" }, body: JSON.stringify({ contentText: "a tip for the group" }) });
  assert.equal(k.status, 200, k.text);
  assert.deepEqual([k.body.ok, k.body.sha256, k.body.bytes], [true, shaOf(Buffer.from("a tip for the group")), "a tip for the group".length]);
  assert.match(k.body.received, /inbox awaiting member review/);
  assert.equal((await send("op=knock", { method: "GET" })).status, 405);
  const empty = await send("op=knock", { method: "POST", body: JSON.stringify({ contentText: "" }) });
  assert.deepEqual([empty.status, empty.body.reason, empty.body.check], [400, "KNOCK_EMPTY", "C-85.5"]);
  /* negative control: the inbox the knock landed in is a member's, never read with no token */
  const inbox = await send("op=inboxlist", { method: "GET" });
  assert.notEqual(inbox.status, 200, inbox.text);
});

/* ===== R38, R35 ===== */



/* ===== R36: the transcriber ===== */









/* ===== R36: the door's arm, and the act end to end ===== */

test("R112 (was R36, in part; K2635, K2656; control-plane R74): the gated hook answers op=pagetranscribe through extraction's pageTranscribeOp: the store is asked `/pagetranscribe` with the door's stamps and the project; a malformed digest and no evidence storage are refused before the store", async () => {
  const seen = [];
  const stub = { fetch: async (r) => { seen.push(String(r instanceof Request ? r.url : r));
    return new Response(JSON.stringify({ ok: true, result: { status: 200, body: { ok: true, op: "pagetranscribe" } } }), { headers: { "content-type": "application/json" } }); } };
  const env = (captures = { get: async () => null }) => ({ STORE: { idFromName: (n) => n, get: () => stub }, ...(captures ? { CAPTURES: captures } : {}) });
  const d = "c".repeat(64);
  const arm = (q, e = env(), op = "pagetranscribe") => { const url = new URL(`http://x/api/?op=${op}&${q}`);
    return gatedOp({ req: new Request(url, { method: "POST" }), url, env: e, op, cls: "member", viaSession: true,
      sessMember: "member:ann", sessViewer: "member:ann", sessIdentity: "member:ann", sessRights: [], sessCaps: ["contribute"],
      aiCred: null, storeName: "bio", stub }); };
  const ok = await arm(`sha256=${d}&project=PROJ-1`);
  assert.equal(ok.status, 200);
  const asked = new URL(seen.at(-1));
  assert.equal(asked.pathname, "/pagetranscribe");
  assert.deepEqual(Object.fromEntries(asked.searchParams), { sha256: d, cls: "member", session: "1", caps: "contribute",
    viewer: "member:ann", author: "member:ann", store: "bio", project: "PROJ-1" });
  const n = seen.length;
  const bad = await arm("sha256=nope");
  assert.equal(bad.status, 400);
  assert.equal((await arm(`sha256=${d}`, env(null))).ok, false, word("acquisition.why.evidence_storage"));
  assert.equal(seen.length, n, "refused before the store");
  /* negative control: pdfstructure's arm asks its own route */
  await arm(`sha256=${d}`, env(), "pdfstructure");
  assert.equal(new URL(seen.at(-1)).pathname, "/pdfstructure");
});

/* A stored reading of the scan, filed in `bundleId`: the bundle row record-core's contract holds, and the reading
   extraction writes (its R34), as a promotion leaves them. */
async function stored(x, bundleId = "B-T42") {
  const d = await hold(x.evidence, SCAN);
  x.ctx.storage.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                          VALUES (?, 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`, bundleId);
  const w = extractionOf(x.ctx).writeReading({ bundleId, captureSha: d, reading: { content_type: "generic", reader_version: 1,
    read_from_text: false, found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null,
    page_count: 1 } });
  assert.notEqual(w && w.ok, false, JSON.stringify(w));
  return d;
}
const stamps = (d) => `/pagetranscribe?sha256=${d}&cls=member&session=1&caps=contribute&viewer=member:ann&author=member:ann&store=bio`;



test("R6 (control-plane R17; CONTROL-PLANE #29 J1, B3): the gated hook stamps an `ai` credential's principal as the viewer its arms receive (pdfstructure's, the queue's, affordances'), as the generic forward does; a binding class is `class:<cls>`", async () => {
  const run = async (op, cls, aiCred) => {
    const seen = [];
    const stub = { fetch: async (r) => { seen.push(String(r instanceof Request ? r.url : r));
      return new Response(JSON.stringify({ ok: true, result: { status: 200, body: { ok: true } } }), { headers: { "content-type": "application/json" } }); } };
    const env = { STORE: { idFromName: (n) => n, get: () => stub }, CAPTURES: { get: async () => null } };
    const url = new URL(`http://x/api/?op=${op}&sha256=${"c".repeat(64)}`);
    await gatedOp({ req: new Request(url), url, env, op, cls, viaSession: false, sessMember: null, sessViewer: null,
      sessIdentity: null, sessRights: [], sessCaps: [], aiCred, storeName: "bio", stub });
    return seen.map((u) => new URL(u).searchParams.get("viewer")).filter((v) => v !== null);
  };
  const ai = { principal: "member:ann", tokenId: "t1" };
  assert.deepEqual(await run("pdfstructure", "ai", ai), ["member:ann"]);
  const aff = await run("affordances", "ai", ai);
  assert.ok(aff.length > 0 && aff.every((v) => v === "member:ann"), JSON.stringify(aff));
  /* negative control: a binding class is stamped as its class, never a principal */
  assert.deepEqual(await run("pdfstructure", "admin", null), ["class:admin"]);
});

/* ---- R106 (fix round 9, G126e; K4835): the transcriber reads by ranges and names what it left ---- */


