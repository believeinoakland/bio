/* Converts `bio-plane/test/ratify.test.mjs`, public-read's share only: R1 — every part of a published multi-part
   bundle answers `verify` true with its path and kind (the old suite's "doorbell 7a: anyone can verify, and only
   ratified answers yes", with its "the OLD published sha still verifies forever"). The rest of that suite (signer
   registration, SSHSIG, the gate, revocation, the session-only delivery) belongs to other modules.
   The old suite ratified, through a whole Worker, an information bundle of three parts (bundle.md, a data file, a
   registered capture). Here the same bundle is built on public-read's world, and its parts are listed from the record
   exactly as ratification's committer lists them (`bundle.md` kind `bundle`, any other inline file kind `file`, a blob
   kind `capture`) and committed through publication's `commitEdition`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V } from "./fixture.mjs";

const ID = "INFO-2026-7001-ratify-target";
const CAP = new Uint8Array(2048).map((_, i) => (i * 7) % 256);
const DATA = JSON.stringify({ probe: true }, null, 1);
const md = (n) => ["---", `id: ${ID}`, "object_type: information", "schema: information@1", `title: "Ratify target"`,
                   "current_state: collected", "prior_state: null", `created: "2026-07-24T00:00:00Z"`,
                   `last_updated: "2026-07-24T00:00:00Z"`, "references: []", "state_history: []",
                   "criticality: supporting", "---", "", "## Summary", "", `revision ${n}`, ""].join("\n");

/* The bundle at revision `n`: bundle.md, an inline data file and a registered binary capture. */
function promote(w, n) {
  const head = w.record.head(ID);
  const capSha = sha(Buffer.from(CAP));
  const res = w.promotion.promote({ bundleId: ID, base: head ? head.bundleSha : null, snapKey: `r${n}`, author: V("alice"),
    files: [{ path: "bundle.md", text: md(n) }, { path: "data/probe.json", text: DATA },
            { path: "snapshots/evidence.bin", blobSha: capSha, bytes: CAP.length, sha256: capSha }],
    meta: { object_type: "information" },
    register: [{ sha256: capSha, path: "snapshots/evidence.bin", encoding: "binary", bytes: CAP.length }] });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 400));
  return res.bundleSha;
}

/* The parts of the bundle's live image, as ratification's committer lists them. */
function partsOf(w) {
  return w.rows(`SELECT path, content, blob_sha, bytes FROM files WHERE bundle_id=? ORDER BY path`, ID)
    .filter((f) => !f.path.startsWith("_history/"))
    .map((f) => f.content !== null
      ? { sha256: sha(f.content), path: f.path, kind: f.path === "bundle.md" ? "bundle" : "file", bytes: Buffer.byteLength(f.content) }
      : { sha256: f.blob_sha, path: f.path, kind: "capture", bytes: f.bytes });
}

function ratified() {
  const w = world();
  w.member("olive"); w.member("alice");
  const r1 = promote(w, 1);
  const live = promote(w, 2);
  const parts = partsOf(w);
  assert.equal(parts.length, 3, "a three-part bundle");
  assert.deepEqual(parts.map((p) => p.kind).sort(), ["bundle", "capture", "file"]);
  assert.equal(parts.find((p) => p.kind === "bundle").sha256, live);
  const c = w.signFinding(ID, { shas: parts });
  assert.equal(c.ok, true, JSON.stringify(c));
  return { w, r1, live, parts };
}

test("R1 (ratify) every part of a published multi-part bundle answers verify true, naming its bundle, path and kind", () => {
  const { w, parts } = ratified();
  for (const p of parts) {
    const v = w.read("verify", { sha256: p.sha256 });
    assert.equal(v.published, true, `${p.path} verifies`);
    assert.equal(v.sha256, p.sha256);
    assert.deepEqual(v.matches.map((m) => [m.bundle_id, m.path, m.kind]), [[ID, p.path, p.kind]]);
    assert.equal(typeof v.matches[0].published, "string");
    assert.deepEqual(Object.keys(v.matches[0]).sort(), ["bundle_id", "kind", "path", "published"]);
    assert.deepEqual(w.pr.verifySha(p.sha256), v);
  }
  /* each kind is answered: the bundle.md, the data file and the capture */
  assert.deepEqual(parts.map((p) => w.read("verify", { sha256: p.sha256 }).matches[0].kind).sort(),
                   ["bundle", "capture", "file"]);
});

test("R1 (ratify) an unratified working revision does not verify, and the old published sha still verifies after a newer edition", () => {
  const { w, r1, live, parts } = ratified();
  assert.deepEqual(w.read("verify", { sha256: r1 }), { published: false, sha256: r1, matches: [] });
  /* a newer revision ratifies as edition 2 */
  const r3 = promote(w, 3);
  const parts3 = partsOf(w);
  assert.equal(w.signFinding(ID, { shas: parts3 }).ok, true);
  assert.deepEqual(w.read("verify", { sha256: live }).matches.map((m) => [m.bundle_id, m.path, m.kind]),
                   [[ID, "bundle.md", "bundle"]]);
  assert.deepEqual(w.read("verify", { sha256: r3 }).matches.map((m) => [m.bundle_id, m.path, m.kind]),
                   [[ID, "bundle.md", "bundle"]]);
  /* the unchanged parts are the same hashes, published once, and still answer with their path and kind */
  for (const p of parts.filter((x) => x.kind !== "bundle")) {
    const v = w.read("verify", { sha256: p.sha256 });
    assert.equal(v.published, true);
    assert.deepEqual([...new Set(v.matches.map((m) => `${m.bundle_id} ${m.path} ${m.kind}`))], [`${ID} ${p.path} ${p.kind}`]);
  }
});
