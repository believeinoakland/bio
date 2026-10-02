/* corpus-export — the verifying import (R3; Membership v2 §8, "What verified must mean"): every file's hash, every
   record's history chain and base links re-derived, every registered capture byte-compared, nothing the manifest
   asserts trusted. Each tamper alone is refused by name beside a negative control. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { verifyCorpusExport } from "../../../src/corpus-export/index.mjs";

const A = "INFO-2026-0001-minutes", B = "INQ-2026-0001";

/* A fixture world of two records: A, a document with a registered capture, promoted once; B, an inquiry citing it,
   promoted twice, so its second promotion's base links to the snapshot its first version was filed as. */
function exported() {
  const w = world();
  w.doc(A, ["the minutes, as captured"]);
  w.inquiry(B, { cites: [A] });
  w.inquiry(B, { question: "Revised?", cites: [A] });
  const manifest = w.ce.exportManifest({});
  return { w, manifest, bytes: w.bytesFor(manifest) };
}
const clone = (m) => JSON.parse(JSON.stringify(m));
const bundleOf = (m, id) => m.bundles.find((b) => b.bundle_id === id);
const swapped = (bytes, key, text = "tampered bytes") => new Map([...bytes, [key, new TextEncoder().encode(text)]]);
const without = (bytes, key) => new Map([...bytes].filter(([k]) => k !== key));
/* A failure's name and place, without what it expected and found. */
const named = (r) => (r.failures || []).map(({ expected, found, ...at }) => at);

test("R3 negative control: an untampered export, two records, a base link, a snapshot and a registered capture, verifies whole, and the import writes nothing", () => {
  const { w, manifest, bytes } = exported();
  assert.equal(bundleOf(manifest, B).promotions.length, 2);
  assert.equal(bundleOf(manifest, B).snapshots.length, 1);
  assert.equal(manifest.register.length, 1);
  const before = w.snapshot();
  const r = verifyCorpusExport({ manifest, bytes });
  assert.deepEqual(r, { ok: true, verified: true, counts: { bundles: 2, files: 4, promotions: 3, snapshots: 1, captures: 1 } });
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  assert.deepEqual(w.ce.verifyCorpusExport({ manifest, bytes }), r, "the instance answers the same service");
  /* the bytes may come as a plain object, keyed in any case, as text */
  const plain = Object.fromEntries([...bytes].map(([k, v]) => [k.toUpperCase(), new TextDecoder().decode(v)]));
  assert.equal(verifyCorpusExport({ manifest, bytes: plain }).verified, true);
});

test("R3 each tamper alone is refused by name, with what was expected and found, and nothing else fails", () => {
  const { manifest, bytes } = exported();
  const a = bundleOf(manifest, A), b = bundleOf(manifest, B);
  const bmd = b.files.find((f) => f.path === "bundle.md");
  const snap = b.snapshots[0];
  const cap = manifest.register[0];
  const prov = a.files.find((f) => f.path === "data/provenance.json");
  const nowhere = sha("no snapshot holds this");
  const cases = [
    ["a file's bytes changed", { bytes: swapped(bytes, bmd.sha256) },
     [{ reason: "FILE_HASH_MISMATCH", bundle: B, path: "bundle.md", expected: bmd.sha256, found: sha("tampered bytes") }]],
    ["a promotion's base naming a sha no snapshot holds", { manifest: ((m) => { bundleOf(m, B).promotions[1].base = nowhere; return m; })(clone(manifest)) },
     [{ reason: "BASE_UNLINKED", bundle: B, snap_key: b.promotions[1].snap_key, expected: snap.sha256, found: nowhere }]],
    ["a snapshot's bytes changed", { bytes: swapped(bytes, snap.sha256) },
     [{ reason: "SNAPSHOT_HASH_MISMATCH", bundle: B, snap_key: snap.snap_key, path: "bundle.md", expected: snap.sha256,
        found: sha("tampered bytes") }]],
    ["a registered capture's bytes differing from the register's size", { manifest: ((m) => { m.register[0].bytes += 1; return m; })(clone(manifest)) },
     [{ reason: "CAPTURE_SIZE_MISMATCH", bundle: A, path: cap.path, capture: cap.capture_sha, expected: cap.bytes + 1, found: cap.bytes }]],
    /* the capture is also A's live file, so the bytes they share are named at both places, and at nothing else */
    ["a registered capture's bytes differing from the register's digest", { bytes: swapped(bytes, cap.capture_sha) },
     [{ reason: "FILE_HASH_MISMATCH", bundle: A, path: cap.path, expected: cap.capture_sha, found: sha("tampered bytes") },
      { reason: "CAPTURE_HASH_MISMATCH", bundle: A, path: cap.path, capture: cap.capture_sha, expected: cap.capture_sha,
        found: sha("tampered bytes") }]],
    ["the bytes for a named sha missing", { bytes: without(bytes, prov.sha256) },
     [{ reason: "BYTES_MISSING", bundle: A, path: "data/provenance.json", expected: prov.sha256, found: null }]],
  ];
  for (const [what, tamper, failures] of cases) {
    const r = verifyCorpusExport({ manifest, bytes, ...tamper });
    assert.equal(r.ok, false, what);
    assert.equal(r.verified, false, what);
    assert.deepEqual(r.failures, failures, what);
  }
  assert.equal(verifyCorpusExport({ manifest, bytes }).verified, true, "the same export untampered verifies");
});

test("R3 every file, snapshot, base link and registered capture is re-derived, not a sample: a tamper at each is refused there", () => {
  const { manifest, bytes } = exported();
  let sites = 0;
  for (const b of manifest.bundles) {
    for (const f of b.files) {
      const r = verifyCorpusExport({ manifest, bytes: swapped(bytes, f.sha256) });
      assert.ok(named(r).some((x) => x.reason === "FILE_HASH_MISMATCH" && x.bundle === b.bundle_id && x.path === f.path),
                `${b.bundle_id} ${f.path}`);
      assert.ok(r.failures.every((x) => x.expected === f.sha256), "every failure is the tamper's");
      sites++;
    }
    for (const s of b.snapshots) {
      const r = verifyCorpusExport({ manifest, bytes: swapped(bytes, s.sha256) });
      assert.ok(named(r).some((x) => x.reason === "SNAPSHOT_HASH_MISMATCH" && x.snap_key === s.snap_key && x.path === s.path));
      sites++;
    }
    b.promotions.forEach((p, i) => {
      const m = clone(manifest);
      bundleOf(m, b.bundle_id).promotions[i].base = sha(`not the base ${i}`);
      const r = verifyCorpusExport({ manifest: m, bytes });
      assert.deepEqual(named(r), [{ reason: i ? "BASE_UNLINKED" : "CHAIN_START_UNANCHORED", bundle: b.bundle_id, snap_key: p.snap_key }],
                       `${b.bundle_id} promotion ${i}`);
      sites++;
    });
  }
  for (const c of manifest.register) {
    const r = verifyCorpusExport({ manifest, bytes: swapped(bytes, c.capture_sha) });
    assert.ok(named(r).some((x) => x.reason === "CAPTURE_HASH_MISMATCH" && x.capture === c.capture_sha));
    sites++;
  }
  assert.equal(sites, 4 + 1 + 3 + 1);
});

test("R3 nothing the manifest asserts is trusted: sizes, bundle digests, counts, the chain's start and a snapshot's key are each checked", () => {
  const { manifest, bytes } = exported();
  const b = bundleOf(manifest, B);
  const edit = (fn) => { const m = clone(manifest); fn(m); return verifyCorpusExport({ manifest: m, bytes }); };
  assert.deepEqual(named(edit((m) => { bundleOf(m, B).files[0].bytes += 3; })),
                   [{ reason: "FILE_SIZE_MISMATCH", bundle: B, path: "bundle.md" }]);
  assert.deepEqual(named(edit((m) => { bundleOf(m, B).bundle_sha = sha("another"); })),
                   [{ reason: "BUNDLE_SHA_MISMATCH", bundle: B, path: "bundle.md" }]);
  assert.deepEqual(named(edit((m) => { m.counts.files += 1; })), [{ reason: "COUNTS_MISMATCH", path: "counts.files" }]);
  assert.deepEqual(named(edit((m) => { m.counts.bundles = "2"; })), [{ reason: "COUNTS_MISMATCH", path: "counts.bundles" }]);
  /* a promotion dropped from the front: the chain starts at a promotion that replaced something */
  assert.deepEqual(named(edit((m) => { bundleOf(m, B).promotions.shift(); })),
                   [{ reason: "CHAIN_START_UNANCHORED", bundle: B, snap_key: b.promotions[1].snap_key }]);
  /* a snapshot re-filed under a key no promotion names: unlinked, and the promotion it belonged to loses its base */
  assert.deepEqual(named(edit((m) => { bundleOf(m, B).snapshots[0].snap_key = "elsewhere"; })),
                   [{ reason: "BASE_UNLINKED", bundle: B, snap_key: b.promotions[1].snap_key },
                    { reason: "SNAPSHOT_UNLINKED", bundle: B, snap_key: "elsewhere", path: "bundle.md" }]);
  /* a digest that is not one */
  assert.deepEqual(named(edit((m) => { bundleOf(m, A).files[0].sha256 = "not-a-digest"; })).map((x) => x.reason),
                   ["FILE_HASH_MISMATCH", "BUNDLE_SHA_MISMATCH"]);
});

test("R3 it never throws: an unreadable export or bytes are answered not verified, by name", () => {
  const { manifest, bytes } = exported();
  const odd = [undefined, null, {}, { manifest: null }, { manifest: "x" }, { manifest: { bundles: "x" } },
               { manifest: { bundles: [null, 7, { files: [null], promotions: [null], snapshots: [null] }], register: [null] } },
               { manifest: { ...manifest, register: "x" }, bytes }, { manifest, bytes: null }, { manifest, bytes: "x" },
               { manifest, bytes: new Map([[Object.keys(Object.fromEntries(bytes))[0], 42]]) }];
  for (const input of odd) {
    let r;
    assert.doesNotThrow(() => { r = verifyCorpusExport(input); });
    assert.equal(r.ok, false, JSON.stringify(input)?.slice(0, 60));
    assert.equal(r.verified, false);
    assert.ok(r.failures.length > 0 && r.failures.every((f) => typeof f.reason === "string"));
  }
  assert.deepEqual(named(verifyCorpusExport({ manifest: null })), [{ reason: "MANIFEST_MALFORMED" }]);
  const getter = { get bundles() { throw new Error("boom"); } };
  assert.deepEqual(named(verifyCorpusExport({ manifest: getter })), [{ reason: "MANIFEST_MALFORMED" }]);
});
