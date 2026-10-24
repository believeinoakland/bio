/* acquisition R116 (T51 fix round 9, G126, G126f, G126g; K4835 (2); plan 2c item 1): WORK THIS MODULE OWES IS ONE JOB ROW, WRITTEN THROUGH THE REGISTRAR.
   On test-support's `jobRegistrarStub`: an `acquire` of a large web page, of a capture whose keep passes the bound, of a page with outstanding supporting
   files and of a ZIP each leaves exactly one row of its kind and sha; a second press leaves one row; a refusing registrar is stated in the answer; a
   small capture owes nothing and registers nothing (control). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, HTML } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";

const MIB = 1024 * 1024;
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio", settle: false };
const stubbed = (w) => { const j = jobRegistrarStub(); w.store.registerJob = j.registerJob; return j; };
const bytes = (n, seed = 1) => new Uint8Array(n).map((_, i) => (i * 2654435761 + seed * 977 + (i >> 9)) >>> 24);

test("R116 (fetch): a large web page parked by a member's press leaves one `fetch` row keyed by its session, and a second press leaves the same one", async () => {
  const w = world(); const j = stubbed(w);
  const big = bytes(9 * MIB);
  const routes = { "https://a.example/big.pdf": () => new Response(big, { headers: { "content-type": "application/pdf", "content-length": String(big.length) } }) };
  const first = await run(w, routes, { locator: "https://a.example/big.pdf", project: "P" }, member);
  const second = await run(w, routes, { locator: "https://a.example/big.pdf", project: "P" }, member);
  assert.equal(first.body.fetch_pending.session, second.body.fetch_pending.session);
  assert.equal(j.rows().length, 1);
  assert.equal(j.rows()[0].kind, "fetch");
  assert.equal(j.rows()[0].session, first.body.fetch_pending.session);
});

test("R116 (keep): a capture whose keep passes the bound leaves one `keep` row keyed by its whole digest, with its parts", async () => {
  const w = world(); const j = stubbed(w);
  w.b.createMultipartUpload = async (key) => { const ps = []; return { uploadPart: async (n, b) => { await new Promise((r) => setTimeout(r, 400)); ps[n - 1] = new Uint8Array(b); return { partNumber: n }; },
    complete: async () => { w.b.held.set(key, new Uint8Array(Buffer.concat(ps))); }, abort: async () => {} }; };
  const big = bytes(40 * MIB, 3);
  const r = await run(w, { "https://a.example/forty.bin": () => new Response(big, { headers: { "content-type": "application/octet-stream" } }) }, { locator: "https://a.example/forty.bin" }, { ...member, boundMs: 0, inlineFetch: true });
  assert.equal(r.status, 200);
  assert.equal(r.body.keep_pending, true);
  const keeps = j.rows().filter((x) => x.kind === "keep");
  assert.equal(keeps.length, 1);
  assert.equal(keeps[0].sha, sha(big));
  assert.equal(keeps[0].parts.length, 5);
});

test("R116 (subresources): a page with outstanding supporting files leaves one `subresources` row keyed by its capture session", async () => {
  const w = world(); const j = stubbed(w);
  w.store.recordCaptureLimit({ runtime: "subrequests", observed: 50 });
  const n = 120, page0 = HTML(Array.from({ length: n }, (_, i) => `<img src="/img/i${i}.png">`).join(""));
  const png = bytes(70, 5);
  const routes = (u) => (/big\.html$/.test(u) ? new Response(page0, { headers: { "content-type": "text/html" } }) : new Response(png, { headers: { "content-type": "image/png" } }));
  const r = await run(w, routes, { locator: "https://o.example/big.html", subresources: true }, member);
  assert.ok(r.body.snapshot.outstanding > 0);
  const rows = j.rows().filter((x) => x.kind === "subresources");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].session, r.body.snapshot.continuation.session);
});

test("R116 (unpack): an `acquire` of a ZIP registers one `unpack` row with the archive's whole digest before it answers; a continuation registers none", async () => {
  const w = world(); const j = stubbed(w);
  const z = makeZip([{ name: "a.txt", data: "alpha" }]);
  const r = await run(w, { "https://f.example/b.zip": () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: "https://f.example/b.zip" }, member);
  assert.equal(r.status, 200);
  assert.deepEqual(j.rows().map((x) => [x.kind, x.sha]), [["unpack", sha(z)]]);
  const again = await run(w, { "https://f.example/b.zip": () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: "https://f.example/b.zip" }, member);
  assert.equal(again.status, 200);
  assert.equal(j.rows().length, 1, "a second press leaves one row");
});

test("R116: a registrar that refuses is stated in the answer, never swallowed; with no registrar at all the answer says so; a small plain capture owes nothing and registers nothing (control)", async () => {
  const z = makeZip([{ name: "a.txt", data: "alpha" }]);
  const route = { "https://f.example/b.zip": () => new Response(z, { headers: { "content-type": "application/zip" } }) };
  const w = world(); w.store.registerJob = () => ({ ok: false, reason: "JOB_TABLE_FULL" });
  const r = await run(w, route, { locator: "https://f.example/b.zip" }, member);
  assert.deepEqual(r.body.jobs.not_registered, [{ kind: "unpack", reason: "JOB_TABLE_FULL" }]);
  const none = await run(world(), route, { locator: "https://f.example/b.zip" }, member);
  assert.deepEqual(none.body.jobs.not_registered, [{ kind: "unpack", reason: "NO_REGISTRAR" }]);
  const wc = world(); const j = stubbed(wc);
  const c = await run(wc, { "https://s.example/x": () => new Response("small page", { headers: { "content-type": "text/plain" } }) }, { locator: "https://s.example/x" }, member);
  assert.equal(c.status, 200);
  assert.equal(c.body.jobs, undefined);
  assert.deepEqual(j.rows(), []);
});
