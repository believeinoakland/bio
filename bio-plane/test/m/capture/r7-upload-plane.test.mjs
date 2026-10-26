/* capture, T51 fix round 7, G79, platform check L (R103): the walker's 24 MiB text and 40 MB file uploaded through the whole plane (the Worker's entry under
   Miniflare, real Durable Object SQLite, R2 and the object's alarm). The times are the TEST's own, taken outside the object (R-CLOCK), and are printed with
   R7_NUMBERS=1; what is asserted is what the answer says and what the record then holds: the 24 MiB whole is held when the answer comes (no keep owed), the
   40 MB answer says `keep_pending` (the ledger has it) and the whole is held after the alarm. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r7upl-0123456789abcdef", PASSWORD = "the founder's long password, upload", ORIGIN = "https://group.example";
const MiB = 1024 * 1024;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r7upl-0123456789abcdef", PROBE_TOKEN: "prb-r7upl-0123456789abcdef", VERSION: "4.7.7", INSTANCE_NAME: "r7upl-town" },
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
const unwrap = (j) => (j && typeof j === "object" && "result" in j ? j.result : j);
let authOnce = null;
async function founder() {
  if (authOnce) return authOnce;
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  return (authOnce = { authorization: `Bearer ${signed.result.token}` });
}
/* the walker's text: distinct lines, so every part differs */
function lineText(bytes, tag) {
  const out = new Uint8Array(bytes);
  const enc = new TextEncoder();
  let at = 0, i = 0;
  while (at < bytes) { const l = enc.encode(`${tag} line ${i++} appeal${i % 997} the board approved the minutes of the zoning hearing\n`); out.set(l.subarray(0, Math.min(l.length, bytes - at)), at); at += l.length; }
  return out;
}
const heldWhole = async (auth, digest) => { const r = await plane(`/api/?op=capture&sha256=${digest}`, { headers: { ...auth, range: "bytes=0-9" } }); await r.arrayBuffer(); return r.status === 200 || r.status === 206; };

test("R103 (G79, platform L): a 24 MiB text in three parts is answered with its whole held and nothing owed; a 40 MB file in five parts is answered `keep_pending` and its whole is held after the alarm", { timeout: 600000 }, async () => {
  const auth = await founder();
  const upload = async (bytes, name) => {
    const t = Date.now();
    const res = await plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=text%2Fplain`, { method: "POST", headers: auth, body: bytes });
    const body = unwrap(await res.json());
    return { ms: Date.now() - t, body, status: res.status };
  };
  const t24 = lineText(24 * MiB, "UPL24");
  const a = await upload(t24, "w24.txt");
  assert.equal(a.status, 200);
  assert.equal(a.body.ok, true, JSON.stringify(a.body).slice(0, 300));
  assert.equal(a.body.document.parts.length, 3);
  assert.equal(a.body.keep_pending, undefined, "kept within the request: nothing owed");
  assert.equal(await heldWhole(auth, sha(t24)), true, "the whole is held when the answer comes");
  const t40 = lineText(39867294, "UPL40");
  const b = await upload(t40, "w40.txt");
  assert.equal(b.status, 200);
  assert.equal(b.body.ok, true, JSON.stringify(b.body).slice(0, 300));
  assert.equal(b.body.document.parts.length, 5);
  assert.equal(b.body.keep_pending, true, "the ledger has the keep");
  const end = Date.now() + 240000;
  let held = false;
  while (Date.now() < end && !held) { held = await heldWhole(auth, sha(t40)); if (!held) await later(3000); }
  assert.equal(held, true, "the whole is held after the alarm");
  if (process.env.R7_NUMBERS) console.log("G79 L:", JSON.stringify({ upload_24MiB_ms: a.ms, upload_40MB_ms: b.ms }));
});
