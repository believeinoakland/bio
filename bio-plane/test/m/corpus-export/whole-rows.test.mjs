/* corpus-export: a capture held in parts verifies by its parts (R13; fix round 4b, F3 verification, K4508; provenance R72,
   R73). The fixture is the audit's, at a size a test can hold: a document of three real parts promoted by the real chain
   as the capture screen promotes it (the register list holds the parts alone, R72 adds the whole's row, which has no file
   of the bundle at its path). The bytes an exporter holds for it are the parts' bytes; the whole's concatenation exists
   nowhere as one object. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, inquiryMd } from "./fixture.mjs";
import { rich, ANN } from "./rich.mjs";
import { verifyCorpusExport } from "../../../src/corpus-export/index.mjs";

const BIG = "INFO-2026-0006-big";
const PARTS = [Buffer.from("alpha ".repeat(40)), Buffer.from("beta ".repeat(55)), Buffer.from("gamma, the last part")];
const WHOLE = sha(Buffer.concat(PARTS));
const TOTAL = PARTS.reduce((n, p) => n + p.length, 0);
const held = PARTS.map((b, i) => ({ file: `snapshots/big.part${String(i).padStart(3, "0")}`, sha256: sha(b), bytes: b.length }));
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "The big report"`,
  "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "references: []", "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");

function promote(w, id = BIG, snapKey = "mp1", author = "member:alice") {
  const doc = { file: "snapshots/big", locator: "https://example.org/big", retrieved: "2026-09-27T00:00:00Z", authority: "the publisher",
    authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: WHOLE, encoding: "binary", bytes: TOTAL },
    origin: { kind: "named_request" }, parts: held };
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey, author, meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(id) }, { path: "data/provenance.json", text: JSON.stringify({ documents: [doc] }, null, 1) },
            ...held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })) });
  if (!r.ok) throw new Error(`fixture multipart refused: ${JSON.stringify(r).slice(0, 400)}`);
}
/* the bytes an exporter holds: every named object the world can read, and the parts' bytes by their digests */
function bytesOf(w, manifest) {
  const out = w.bytesFor(manifest);
  held.forEach((p, i) => out.set(p.sha256, new Uint8Array(PARTS[i])));
  return out;
}
const scene = () => { const w = world(); promote(w); w.inquiry("INQ-2026-0001-q", { cites: [BIG] }); return w; };

test("R13: the manifest carries the whole's register row as an identity, with its parts in order, beside its parts' own rows", () => {
  const w = scene();
  const m = w.ce.exportManifest({});
  assert.equal(m.register.length, 4);
  const whole = m.register.find((r) => r.capture_sha === WHOLE);
  assert.deepEqual(whole, { bundle_id: BIG, path: "snapshots/big", capture_sha: WHOLE, bytes: TOTAL, whole: 1, parts: held.map((p) => p.sha256) });
  for (const p of held) assert.deepEqual(m.register.find((r) => r.capture_sha === p.sha256), { bundle_id: BIG, path: p.file, capture_sha: p.sha256, bytes: p.bytes });
});

test("R13: the bytes an exporter holds for a bundle held in parts verify, with no concatenation handed apart", () => {
  const w = scene();
  const m = w.ce.exportManifest({});
  const bytes = bytesOf(w, m);
  assert.equal(bytes.has(WHOLE), false, "the whole is held only as its parts");
  const r = verifyCorpusExport({ manifest: m, bytes });
  assert.equal(r.ok, true, JSON.stringify(r.failures));
  assert.equal(r.verified, true);
  /* the same, handed the concatenation too, as before provenance R72: still verified */
  const both = new Map(bytes); both.set(WHOLE, new Uint8Array(Buffer.concat(PARTS)));
  assert.equal(verifyCorpusExport({ manifest: m, bytes: both }).verified, true);
});

test("R13: the whole is re-derived from its parts, not trusted: a tampered part, a wrong stated size, a swapped order, a missing part and a forged digest are each refused by name", () => {
  const w = scene();
  const m = w.ce.exportManifest({});
  const bytes = bytesOf(w, m);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const reasons = (r) => r.failures.filter((f) => f.capture === WHOLE).map((f) => f.reason);
  const run = (manifest, b) => verifyCorpusExport({ manifest, bytes: b });

  const tampered = new Map(bytes); tampered.set(held[1].sha256, new TextEncoder().encode("not the second part"));
  const t = run(m, tampered);
  assert.equal(t.ok, false);
  assert.ok(reasons(t).includes("CAPTURE_HASH_MISMATCH"), "the whole's digest no longer matches its parts");

  const size = clone(m); size.register.find((r) => r.capture_sha === WHOLE).bytes += 1;
  assert.deepEqual(reasons(run(size, bytes)), ["CAPTURE_SIZE_MISMATCH"]);

  const order = clone(m); order.register.find((r) => r.capture_sha === WHOLE).parts.reverse();
  assert.deepEqual(reasons(run(order, bytes)), ["CAPTURE_HASH_MISMATCH"]);

  const missing = new Map(bytes); missing.delete(held[2].sha256);
  assert.ok(reasons(run(m, missing)).includes("BYTES_MISSING"));

  const forged = clone(m); forged.register.find((r) => r.capture_sha === WHOLE).capture_sha = sha("forged");
  const f = run(forged, bytes);
  assert.equal(f.ok, false);
  assert.ok(f.failures.some((x) => x.capture === sha("forged")));
});

test("R13 (control): a bundle holding a single capture exports and verifies as it did: no whole, no parts on its row", () => {
  const w = world();
  w.doc("INFO-2026-0001-a", ["the minutes, as captured"]);
  const m = w.ce.exportManifest({});
  assert.equal(m.register.length, 1);
  assert.deepEqual(Object.keys(m.register[0]).sort(), ["bundle_id", "bytes", "capture_sha", "path"]);
  assert.equal(verifyCorpusExport({ manifest: m, bytes: w.bytesFor(m) }).verified, true);
});

test("R13: a rendering reads the whole's row as the sight of a capture: a person fact citing a document held in parts is rendered for a viewer who sees its bundle", () => {
  const w = rich();
  const ada = w.person("Ada Lane");
  promote({ promotion: w.dw.promotion }, BIG, "mp1", ANN);
  w.dw.sw.ex.readings[WHOLE] = { chain: [{ step: "layer", tier: 1 }], pageCount: 3 };    /* the whole has been read (extraction R81) */
  const r = w.p.recordPersonFact({ person: ada, kind: "birth", value: "1970-05-01",
    valid: { valid: { from: null, to: null, precision: "day", zone: "UTC" }, basis: "a cv" },
    citation: { captureSha: WHOLE, extent: { kind: "pdf-page", page: 0 } }, by: ANN });
  assert.equal(r.ok, true, JSON.stringify(r));
  const out = w.ce.exportRendering({ format: "popolo", viewer: ANN });
  assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
  assert.ok(JSON.stringify(out.rendering).includes("1970-05-01"), "the birth fact citing the whole is rendered");
  assert.ok(JSON.stringify(out.rendering).includes(WHOLE), "and carries its citation");
});
