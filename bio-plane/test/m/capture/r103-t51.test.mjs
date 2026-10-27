/* capture, T51 fix round 4b (F2, F5; K4487): R103, a large upload is kept whole, and a capture session's expiry ends no owed work.
   At the module's interface: `uploadCapture` over record-core's REAL evidence store (its `putFromParts`, R87) on a bucket with
   R2's multipart upload, provenance's contract (fixture.mjs), and the plane's hand-off `keepLater` as the plane assigns it to
   the capture instance (plane/store.mjs). Each test names the requirement id it proves; each has its control. The whole path
   through the real door (control-plane's `readUploaded`, plane's alarm) is the seam owners' (control-plane R123, plane R77). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";
import { evidencePartsRefusal } from "../record-core/fixtures.mjs";

const MiB = 1024 * 1024;
const STATEMENT = "a scan the clerk handed me at the counter";
const AT = "2026-10-22T12:00:00Z";
/* bytes whose every 8 MiB part differs */
const varied = (n, seed = 1) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (Math.floor(i / (8 * MiB)) * 37 + seed + (i % 251)) & 255; return b; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* the bucket with R2's multipart upload, which record-core's putFromParts uses */
const multipartBucket = () => {
  const b = bucket();
  b.createMultipartUpload = async (key) => {
    const parts = [];
    return { uploadPart: async (n, bytes) => { parts[n - 1] = new Uint8Array(bytes); return { partNumber: n }; },
             complete: async () => { b.held.set(key, new Uint8Array(Buffer.concat(parts))); }, abort: async () => {} };
  };
  return b;
};
const setup = () => { const b = multipartBucket(); const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } }); return { ...f, b }; };
const wholeKey = (big) => `bio/captures/${sha(big)}`;
const up = (c, bytes, extra = {}) => c.uploadCapture({ bytes, statement: STATEMENT, by: "m1", at: AT, ...extra });
/* the plane's hand-off, recording what it is given (plane/pending.mjs keepLater) */
// fixtures-contract: plane keep-later
const handOff = (c) => { const given = []; c.keepLater = async (k) => { given.push(k); return { ok: true }; }; return given; };

test("R103 (F2): with no ledger a 40 MiB upload in five parts is made whole under its digest by the store's real putFromParts, awaited inside the bound, with nothing owed", async () => {
  const { c, b, core } = setup();
  const given = [];
  const big = varied(40 * MiB, 3);
  assert.ok(big.length > MULTIPART_KEEP_MAX);
  const r = await up(c, big);
  assert.equal(r.ok, true);
  assert.equal(r.document.parts.length, 5);
  assert.equal(r.capture.sha256, sha(big));
  assert.ok(await core.evidenceStore().head(sha(big)), "the whole is held under its own digest");
  assert.equal(sha(b.held.get(wholeKey(big))), sha(big), "and it is the bytes uploaded");
  assert.equal(r.keep_pending, undefined, "kept inside the bound: nothing owed");
  assert.deepEqual(given, [], "the plane is asked for nothing");
  assert.deepEqual(b.calls.filter((x) => x[0] === "put" && x[1] === wholeKey(big)), [], "this module did not assemble the whole in memory");
});

test("R103 (F2; G79): with the plane's ledger the keep of a file past MULTIPART_KEEP_MAX is handed over at once, in the parts' order, and the answer is not held for it: the store is not asked by the upload and the answer says keep_pending", async () => {
  const { c, b, core } = setup();
  const given = handOff(c);
  const real = core.evidenceStore();
  const asked = [];
  let release;
  const gate = new Promise((res) => { release = res; });
  /* a keep that would never end inside the answer: if the upload awaited it, this test would not finish */
  core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { asked.push({ d, p }); await gate; return real.putFromParts(d, p); } });
  const big = varied(40 * MiB, 4);
  const r = await up(c, big, { boundMs: 60000 });
  assert.equal(r.ok, true, "the upload is not refused for the keep");
  assert.equal(r.keep_pending, true);
  assert.deepEqual(asked, [], "the upload did not start the keep itself");
  assert.equal(given.length, 1);
  assert.deepEqual(given[0], { sha: sha(big), parts: r.document.parts.map((p) => p.sha256) });
  assert.equal(b.held.has(wholeKey(big)), false, "no whole yet");
  /* the plane's alarm: its entry put by the real putFromParts (plane/pending.mjs keep) */
  release();
  const later = await real.putFromParts(given[0].sha, given[0].parts);
  assert.equal(later.ok, true);
  assert.equal(sha(b.held.get(wholeKey(big))), sha(big), "the whole is held after the one alarm");
});

test("R103 (F2): with no ledger a keep that does not end inside the bound is answered kept in its parts, nothing claimed owed", async () => {
  const { c, core } = setup();
  const real = core.evidenceStore();
  let release;
  const gate = new Promise((res) => { release = res; });
  core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { await gate; return real.putFromParts(d, p); } });
  const r = await up(c, varied(40 * MiB, 11), { boundMs: 5000 });
  assert.equal(r.ok, true);
  assert.equal(r.keep_pending, undefined, "no ledger took it");
  release();
});

test("R103 controls: a store that refuses or throws is owed to the plane, never a refused upload; with no store call or no hand-off the upload still files in its parts", async () => {
  const { refused } = await evidencePartsRefusal();
  for (const how of ["refuse", "throw"]) {
    /* with the ledger the keep is handed over without being tried; with none it is tried, fails, and nothing is claimed owed */
    for (const ledger of [true, false]) {
      const { c, core } = setup();
      const given = ledger ? handOff(c) : [];
      const real = core.evidenceStore();
      core.evidenceStore = () => ({ ...real, putFromParts: async () => { if (how === "throw") throw new Error("down"); return refused; } });
      const big = varied(33 * MiB, 5);
      const r = await up(c, big);
      assert.equal(r.ok, true, how);
      assert.equal(r.keep_pending, ledger ? true : undefined, how);
      assert.equal(given.length, ledger ? 1 : 0, how);
    }
  }
  { /* no putFromParts on the store: the parts stand, as before */
    const { c, core } = setup();
    const given = handOff(c);
    const real = core.evidenceStore();
    core.evidenceStore = () => { const { putFromParts, ...rest } = real; return rest; };
    const r = await up(c, varied(33 * MiB, 6));
    assert.equal(r.ok, true);
    assert.equal(r.keep_pending, undefined);
    assert.deepEqual(given, []);
  }
  { /* no hand-off, or one that refuses or throws: the keep still tried, the upload still filed */
    const { c, core } = setup();
    const real = core.evidenceStore();
    let release;
    const gate = new Promise((res) => { release = res; });
    core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { await gate; return real.putFromParts(d, p); } });
    for (const keepLater of [undefined, async () => ({ ok: false }), async () => { throw new Error("no"); }]) {
      if (keepLater) c.keepLater = keepLater; else delete c.keepLater;
      const r = await up(c, varied(33 * MiB, 7), { boundMs: 5000, by: "m2" });
      assert.equal(r.ok, true);
      assert.equal(r.keep_pending, undefined, "nothing is claimed owed that the plane did not take");
    }
    release();
  }
});

test("R103 controls: an upload within MULTIPART_KEEP_MAX is put whole by this module as before and asks no putFromParts; one part asks nothing", async () => {
  const { c, b, core } = setup();
  const given = handOff(c);
  const real = core.evidenceStore();
  let asked = 0;
  core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { asked++; return real.putFromParts(d, p); } });
  const mid = varied(20 * MiB, 8);
  const r = await up(c, mid);
  assert.equal(r.ok, true);
  assert.equal(sha(b.held.get(wholeKey(mid))), sha(mid));
  const one = await up(c, varied(3 * MiB, 9), { by: "m2" });
  assert.equal(one.ok, true);
  assert.equal(asked, 0);
  assert.deepEqual(given, []);
  assert.equal(r.keep_pending, undefined);
});

test("R103: a second press of the same large file while the first keep is under way shares it: the store is asked once", async () => {
  const { c, core } = setup();
  const real = core.evidenceStore();
  let asked = 0;
  core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { asked++; await sleep(300); return real.putFromParts(d, p); } });
  const big = varied(33 * MiB, 10);
  const [a, d] = await Promise.all([up(c, big), up(c, big, { by: "m2" })]);
  assert.equal(a.ok && d.ok, true);
  assert.equal(asked, 1);
});

test("R103 (F5): a capture session's expiry ends no owed work: it stays loadable past its hour, saying it has expired, until it is dropped; it is not live, and another session's save or load does not prune it", async () => {
  const { c } = setup();
  const t0 = "2026-10-22T10:00:00Z", later = "2026-10-22T11:30:00Z", muchLater = "2026-10-25T10:00:00Z";
  const state = { outstanding: ["https://a.example/x.css"] };
  c.saveCaptureSession({ session: "s1", locator: "https://a.example/p", primarySha: "a".repeat(64), primaryFile: "snapshots/p", base: "https://a.example/", state, at: t0 });
  assert.equal(c.loadCaptureSession({ session: "s1", at: t0 }).expired, false);
  assert.equal(c.liveCaptureSessions(later).length, 0, "past its hour it is no longer live (R46)");
  c.saveCaptureSession({ session: "s2", locator: "https://a.example/q", primarySha: "b".repeat(64), primaryFile: "snapshots/q", base: "https://a.example/", state, at: later });
  const ld = c.loadCaptureSession({ session: "s1", at: muchLater });
  assert.equal(ld.found, true, "the owed work is still there after days");
  assert.equal(ld.expired, true);
  assert.deepEqual(ld.state, state);
  assert.equal(c.loadCaptureSession({ session: "nope", at: muchLater }).found, false, "control: an unknown session is still not found");
  c.dropCaptureSession({ session: "s1" });
  assert.equal(c.loadCaptureSession({ session: "s1", at: muchLater }).found, false, "dropped when its work is done");
  assert.equal(c.liveCaptureSessions(later).map((s) => s.session).join(), "s2", "a live session is listed as before");
});
