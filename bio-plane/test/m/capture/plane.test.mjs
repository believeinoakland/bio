/* capture through the whole plane (the Worker's entry under Miniflare, as `wrangler.jsonc` runs it): the five ops whose
   dispatch moved out of `src/index.mjs` into capture's `capturePublicOp` and `captureOp` (the legacy-index map's §4.4
   plain move, K649 (7)) are reached at the door exactly as before: `knock` with no token, the other four behind it,
   `acquire` read by extraction's reader and carrying the grade note. The network is scripted. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { Miniflare } from "miniflare";
import { ACQUIRE_GRADE_NOTE } from "../../../src/capture/index.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const T = { admin: "cap-adm", member: "cap-mem" };
const sha = (s) => createHash("sha256").update(Buffer.from(s)).digest("hex");
let mf;

before(async () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: T.admin, MEMBER_TOKEN: T.member, VERSION: "test" },
    outboundService(req) {
      if (new URL(req.url).hostname === "docs.example.org")
        return new Response("the minutes of the meeting", { headers: { "content-type": "text/plain" } });
      return new Response("unscripted", { status: 500 });
    },
  });
});
after(async () => { if (mf) await mf.dispose(); });

const send = async (q, init) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, body, text };
};
/* A member's own session (the shared member key is retired, MEMBER_TOKEN_RETIRED): enrolled by the administrator and
   signed in with the member's password. Every credential travels in the Authorization header, never the address
   (CREDENTIAL_IN_ADDRESS). */
let session = null;
const bearer = (token, init = {}) => ({ ...init, headers: { ...(init.headers || {}), authorization: `Bearer ${token}` } });
const signedIn = async () => {
  if (session) return session;
  const post = async (q, token, body) => (await send(q, bearer(token, { method: "POST", body: JSON.stringify(body) }))).body;
  const add = await post("op=memberadd", T.admin, { memberId: "m1", cover: "cover for m1", role: "member", capabilities: ["contribute"] });
  const unwrap = (j) => (j && typeof j === "object" && "result" in j ? j.result : j);
  const invite = unwrap(add) && unwrap(add).invite;
  if (!invite) throw new Error(`memberadd: ${JSON.stringify(add)}`);
  const en = unwrap((await send("op=enroll", { method: "POST", body: JSON.stringify({ invite, handle: "m1", password: "m1-passphrase-capture" }) })).body);
  if (!en || !en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
  const lg = unwrap((await send("op=login", { method: "POST", body: JSON.stringify({ role: "member:m1", password: "m1-passphrase-capture" }) })).body);
  if (!lg || !lg.token) throw new Error(`login: ${JSON.stringify(lg)}`);
  return (session = lg.token);
};
const member = async (q, init = {}) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, bearer(await signedIn(), init));
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, body, text };
};

test("R30 R54 (K649 (7)): op=knock is reached at the door with no token, through capturePublicOp, and answers as the doorbell does", async () => {
  const k = await send("op=knock", { method: "POST", headers: { "cf-connecting-ip": "203.0.113.8" }, body: JSON.stringify({ contentText: "a tip for the group" }) });
  assert.equal(k.status, 200, k.text);
  assert.deepEqual([k.body.ok, k.body.sha256, k.body.bytes], [true, sha("a tip for the group"), "a tip for the group".length]);
  assert.match(k.body.received, /inbox awaiting member review/);
  assert.equal((await send("op=knock", { method: "GET" })).status, 405);
  const empty = await send("op=knock", { method: "POST", body: JSON.stringify({ contentText: "" }) });
  assert.deepEqual([empty.status, empty.body.reason, empty.body.check], [400, "KNOCK_EMPTY", "C-85.5"], "the row from capture's own table");
});

test("R21 R27 R73 (K649 (7)): op=capture, op=links, op=archivelookup and op=acquire are reached behind the token through captureOp; acquire is read by extraction and carries the grade note", async () => {
  const bytes = "evidence held by digest", d = sha(bytes);
  const put = await member(`op=capture&sha256=${d}`, { method: "PUT", body: bytes });
  assert.deepEqual([put.status, put.body.ok, put.body.existed], [200, true, false], put.text);
  /* capture's own read (R21) answers the binding classes; a member session's GET of bytes is file-safety's opening
     (control-plane R62, file-safety R8), so the read here is the administrator's */
  const got = await send(`op=capture&sha256=${d}`, bearer(T.admin));
  assert.deepEqual([got.status, got.text], [200, bytes]);
  const none = await send(`op=capture&sha256=${sha("never")}`, bearer(T.admin));
  assert.deepEqual([none.status, none.body.reason], [404, "EVIDENCE_NOT_HELD"]);
  const links = await member(`op=links&address=${encodeURIComponent("https://t.example/u")}`);
  assert.deepEqual([links.status, links.body.ok, links.body.count], [200, true, 0], links.text);
  const al = await member(`op=archivelookup`, { method: "POST", body: JSON.stringify({ address: "https://t.example/d" }) });
  assert.ok(al.body && al.status !== 404 && al.body.reason !== "STORE_DID_NOT_ANSWER", al.text);
  const acq = await member(`op=acquire`, { method: "POST", body: JSON.stringify({ locator: "https://docs.example.org/minutes.txt" }) });
  assert.equal(acq.status, 200, acq.text);
  assert.equal(acq.body.note, ACQUIRE_GRADE_NOTE);
  assert.equal(acq.body.document.capture.sha256, sha("the minutes of the meeting"));
  assert.ok("reading" in acq.body.document, "extraction's reader was handed the filed document");
  /* the door still refuses before capture is reached */
  const anon = await send("op=capture&sha256=" + d);
  assert.ok(anon.status === 401 || anon.status === 403, `no token: ${anon.status}`);
});
