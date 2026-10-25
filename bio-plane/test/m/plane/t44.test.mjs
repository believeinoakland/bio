/* plane T44 (T44-13; N869, N874; DEC-191 (4), (5); K2719, K2726): a `NO_PAGE_RENDERED` answer carries `refused`, one
   `{page, reason, process?}` per asked page not sent (R36), and the gated hook's `by` for an `ai` caller is
   `class:ai/<tokenId>` (R6). Each is checked at the plane's interface (the transcriber's AI path, its page rendering, the
   Worker's gated hook) with a negative control (K874). The pictures are pdf-pixels' own fixtures (`picture-variants.json`,
   made with Pillow) or a JPEG header written here; the vector-only PDF page is written here. */
import "../../../src/store-assembly/register.mjs";   /* R68: the start's registration before any op table is read */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

import { gatedOp } from "../../../src/plane/door.mjs";

const here = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SENTINEL = "sk-ant-SENTINEL-T44-0000";

/* A baseline JPEG whose frame header says `w` × `h` (its SOF0 rewritten), so the picture renderer judges the frame
   before any decode. */

/* The evidence bucket, in memory. */
function bucket() {
  const held = new Map();
  const object = (k, b) => ({ key: k, size: b.length, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) });
  return { async put(k, v) { held.set(k, v); return { key: k, size: v.length }; },
           async get(k) { return held.has(k) ? object(k, held.get(k)) : null; },
           async head(k) { return held.has(k) ? { key: k, size: held.get(k).length } : null; } };
}

/* ===== R36 ===== */

/* ===== R6 ===== */

/* The `by` each store request the gated hook makes for `op` carries. */
async function bys(op, cls, { aiCred = null, session = null } = {}) {
  const seen = [];
  const stub = { fetch: async (r) => { seen.push(String(r instanceof Request ? r.url : r));
    return new Response(JSON.stringify({ ok: true, result: { status: 200, body: { ok: true } } }), { headers: { "content-type": "application/json" } }); } };
  const env = { STORE: { idFromName: (n) => n, get: () => stub }, CAPTURES: { get: async () => null } };
  const url = new URL(`http://x/api/?op=${op}&target=B-1`);
  await gatedOp({ req: new Request(url), url, env, op, cls, viaSession: !!session, sessMember: session, sessViewer: session,
    sessIdentity: session, sessRights: [], sessCaps: ["contribute"], aiCred, storeName: "bio", stub });
  return seen.map((u) => new URL(u).searchParams.get("by")).filter((v) => v !== null);
}

test("R6 (T44; N874; K2726; control-plane R17): the gated hook's `by` for an `ai` caller on a gated op (affordances, the arm handed `by`) is `class:ai/<tokenId>`, as the generic forward stamps it, never `class:ai` alone; a member's is the member", async () => {
  const a = await bys("affordances", "ai", { aiCred: { principal: "member:ann", tokenId: "t1" } });
  assert.ok(a.length > 0 && a.every((v) => v === "class:ai/t1"), JSON.stringify(a));
  assert.ok(!a.includes("class:ai"));
  assert.deepEqual([...new Set(await bys("affordances", "ai", { aiCred: { principal: "member:ann", tokenId: "t2" } }))], ["class:ai/t2"]);
  /* negative controls: a member's session stamps the member, a binding class its class */
  assert.deepEqual([...new Set(await bys("affordances", "member", { session: "member:ann" }))], ["member:ann"]);
  assert.deepEqual([...new Set(await bys("affordances", "admin"))], ["class:admin"]);
});

