/* acquisition fix round 9, job 86 (G160, G161, G163; K4980): a member cut from an archive with no letter carries the ARCHIVE's grade basis (R39,
   provenance C-18.1) and is typed as text by R102's one rule when its bytes carry no magic (R39, R102); `owedFetch`'s final answers carry the
   refusal's facts as the refusing module gave them (R116). At the module's interface: `unpack(store, {archiveSha, by, cls})` over a held archive
   (fixture.mjs), and `owedFetch(store, entry, {deliver})` over a parked large capture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, network } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack, owedFetch } from "../../../src/acquisition/index.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";

const URL1 = "https://files.example/set.zip";
const hold = async (w, bytes, via) => {
  await w.b.put(`bio/captures/${sha(bytes)}`, bytes);
  w.prov.recordReceipt({ address: URL1, addressNorm: URL1, captureSha: sha(bytes), retrieved: "2026-01-01T00:00:00Z", via });
};
const MEMBERS = [{ name: "m001.txt", data: "alpha notes" }, { name: "m002.txt", data: "bravo notes" }, { name: "m003.txt", data: "charlie notes" }];

test("R39 (G161): the members of an uploaded archive (a receipt, no letter) carry the archive's grade basis, no letter of their own, and each is typed as text", async () => {
  const w = world();
  const z = makeZip(MEMBERS);
  await hold(w, z, "doorbell");
  const u = await unpack(w.store, { archiveSha: sha(z), cls: "daemon" });
  assert.equal(u.ok, true);
  assert.equal(u.documents.length, 3);
  for (const d of u.documents) {
    assert.equal(d.capture.grade_basis, "CAPTURE_RECEIVED_NOT_FETCHED", `${d.container.path}: the archive's basis, never CAPTURE_UNPACKED_FROM_ARCHIVE`);
    assert.equal("grade" in d.capture, false, "no letter of its own");
    assert.equal(d.capture.content_type, "text/plain", `${d.container.path} is text`);
    assert.equal(d.profile.profiled_from_text, true, `${d.container.path} is read as text`);
  }
});

test("R39 (G161, control): the members of a fetched, letter-graded archive carry its letter and no basis", async () => {
  const w = world();
  const z = makeZip(MEMBERS);
  const r = await run(w, { [URL1]: () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: URL1 });
  assert.equal(r.status, 200);
  assert.equal(r.body.unpack.documents.length, 3);
  for (const d of r.body.unpack.documents) {
    assert.equal(d.capture.grade, EARNED_CAPTURE_CEILING);
    assert.equal("grade_basis" in d.capture, false);
  }
});

test("R39 R102 (G163): a .txt, .md and .csv member is typed by R102's rule from its entry name; a NUL-bearing .txt, an .bin and a nameless-type member are not text", async () => {
  const w = world();
  const z = makeZip([
    { name: "a.txt", data: "plain words" }, { name: "b.md", data: "# heading" }, { name: "c.csv", data: "x,y\n1,2\n" },
    { name: "nul.txt", data: new Uint8Array([104, 105, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) },
    { name: "x.bin", data: "plain words too" },
  ]);
  await hold(w, z, "direct");
  const u = await unpack(w.store, { archiveSha: sha(z), cls: "daemon" });
  const by = Object.fromEntries(u.documents.map((d) => [d.container.path, d.capture.content_type]));
  assert.deepEqual([by["a.txt"], by["b.md"], by["c.csv"]], ["text/plain", "text/markdown", "text/csv"]);
  assert.equal(by["nul.txt"], undefined, "a NUL byte makes it binary");
  assert.equal(by["x.bin"], undefined, "an entry named .bin is not overridden by its bytes");
});

const MIB = 1024 * 1024;
const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const big = new Uint8Array(9 * MIB).fill(7);
const source = () => new Response(big, { headers: { "content-type": "application/pdf", "content-length": String(big.length) } });
const parked = async (w) => {
  w.store.owedLater = async () => ({ ok: true });
  const first = await run(w, { [BIG]: source }, { locator: BIG, project: "P" }, { settle: false });
  return first.body.fetch_pending.session;
};
const HELD = { ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", detail: { kind: "whole", capture_sha: "a".repeat(64), holder: null } };

test("R116 (G160): a delivery refused for good ends the entry final with the refusal's kind, capture_sha and holder, as given", async () => {
  const w = world();
  const session = await parked(w);
  const net = network({ [BIG]: source });
  try {
    const out = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => HELD });
    assert.equal(out.final, true);
    assert.equal(out.reason, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
    assert.deepEqual(out.detail, { kind: "whole", capture_sha: "a".repeat(64), holder: null });
  } finally { net.restore(); }
});

test("R116 (G160): the facts at the refusal's top level (provenance's own shape) are carried the same; a refusal with none adds no detail", async () => {
  const w = world();
  const session = await parked(w);
  const net = network({ [BIG]: source });
  try {
    const top = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", kind: "whole", capture_sha: "b".repeat(64), holder: "INFO-1" }) });
    assert.deepEqual(top.detail, { kind: "whole", capture_sha: "b".repeat(64), holder: "INFO-1" });
    const w2 = world();
    const s2 = await parked(w2);
    const bare = await owedFetch(w2.store, { kind: "fetch", session: s2 }, { storeName: "bio", deliver: async () => ({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE" }) });
    assert.equal(bare.final, true);
    assert.equal("detail" in bare, false);
  } finally { net.restore(); }
});

test("R116 (G160, control): a delivery refused for a cause that may pass goes again and carries no facts; an accepted delivery ends done", async () => {
  const w = world();
  const session = await parked(w);
  const net = network({ [BIG]: source });
  try {
    const again = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: false, reason: "DELIVERY_FAILED" }) });
    assert.equal(again.done, false);
    assert.equal(again.reason, "DELIVERY_FAILED");
    const done = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: true }) });
    assert.equal(done.done, true);
    assert.equal(done.final, undefined);
  } finally { net.restore(); }
});
