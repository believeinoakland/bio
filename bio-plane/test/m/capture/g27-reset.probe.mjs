/* capture R73 (fix round 6, G27; plan rule 4), platform check L: the door's read after a kept acquire when the object is reset between the
 * acquire and the read, on workerd. A probe, not a test (no `.test.mjs`: it boots workerd under Miniflare):
 *   node g27-reset.probe.mjs <dir>
 * It writes <dir>/probe.mjs, a Durable Object (SQLite) whose `/acquire` answers a kept capture and whose `/extractread` aborts the object
 * (`ctx.abort`, the reset a memory limit causes) on its first call, counted in the object's storage so it survives the reset, and answers
 * from the second. It then drives `captureOp("acquire")` as the plane's door does (stubs of the live namespace, the reader of `reader.mjs`,
 * written to extraction's `acquireReadingOp` contract, behind `readAcquired`) and prints: whether the first read failed, whether the SAME stub answers after the reset (what
 * Cloudflare says may not be relied on), the number of stubs the door made, and the document read. Workerd here enforces no memory limit
 * (diagnosis-R6-G4.md), so the reset is made by `ctx.abort`, which is the same reset the platform makes at the limit. */
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Miniflare } from "miniflare";
import { captureOp } from "../../../src/capture/ops.mjs";
import { readerFor } from "./reader.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: g27-reset.probe.mjs <dir>"); process.exit(2); }
mkdirSync(dir, { recursive: true });
const ENTRY = join(dir, "probe.mjs");
const SHA = "ab".padEnd(64, "0");
writeFileSync(ENTRY, `
import { DurableObject } from "cloudflare:workers";
const kept = { ok: true, existed: false, document: { file: "f", locator: "https://t.example/d", capture: { sha256: ${JSON.stringify(SHA)} } } };
export class Probe extends DurableObject {
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/acquire") return Response.json({ ok: true, result: { status: 200, body: kept } });
    if (u.pathname === "/extractread") {
      const n = ((await this.ctx.storage.get("reads")) || 0) + 1;
      await this.ctx.storage.put("reads", n); await this.ctx.storage.sync();
      if (n === 1) { this.ctx.abort("the object was reset"); throw new Error("the object was reset"); }
      return Response.json({ ok: true, result: { reading: { read: true }, text_units: 1 } });
    }
    return new Response("?", { status: 404 });
  }
}
export default { async fetch() { return new Response("probe"); } };
`);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, durableObjectsPersist: mkdtempSync(join(tmpdir(), "capture-g27-")),
});
try {
  const ns = await mf.getDurableObjectNamespace("PROBE");
  let stubs = 0;
  const store = () => { stubs++; return ns.get(ns.idFromName("p")); };
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  const doAnswer = async (res) => { try { const r = await res; const out = await r.json(); return out.ok === true ? { answered: true, result: out.result, reply: { status: r.status, body: out } } : { answered: false }; } catch { return { answered: false }; } };
  // fixtures-contract: answer-envelope door-helpers
  const h = { json, storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502), doAnswer, storageAbsent: () => json({}, 503),
    cls: "member", member: true, sessMember: "member:ann", storeName: "bio",
    readAcquired: readerFor({ doAnswer, storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502) }) };
  const quiet = console.error;
  console.error = () => {};
  let res;
  try {
    res = await captureOp("acquire", new Request("https://p/?op=acquire", { method: "POST", body: JSON.stringify({ locator: "https://t.example/d" }) }),
      new URL("https://p/?op=acquire"), { CAPTURES: { put() {}, get() {} } }, store, h);
  } finally { console.error = quiet; }
  const b = await res.json();
  /* The same stub after the reset: does it answer? (Cloudflare: reusing a stub after it throws is not to be relied on.) */
  await mf.dispatchFetch("http://probe/").catch(() => {});
  const ns2 = await mf.getDurableObjectNamespace("PROBE");
  const same = ns2.get(ns2.idFromName("p"));
  console.log(JSON.stringify({ status: res.status, read: b.document.reading ?? null, reading_pending: b.reading_pending ?? false, stubs_made: stubs,
    same_stub_after_reset_answers: await same.fetch("http://x/extractread").then((r) => r.ok, () => false) }));
} finally { await mf.dispose(); }
