/* content's published fixtures (fix round 10; K4990, K5044): each is called here and compared with the real answer it stands for. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { contentContextFor } from "./fixtures.mjs";
import { world, LAYER } from "./fixture.mjs";

const CHAIN = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];

test("R11, R42 (fixture contentContextFor): captureFor and contentContextFor answer the seeded captures as the real module does", () => {
  const f = contentContextFor({ captures: { a: { bundleId: "INFO-1", chain: CHAIN, pageCount: 3 }, b: { bundleId: "INFO-2", text: "other bytes" } } });
  assert.equal(f.captureFor("INFO-1"), f.shas.a);
  assert.equal(f.captureFor("INFO-2"), f.shas.b);
  assert.equal(f.captureFor("INFO-9"), null, "a bundle holding no capture answers null");
  const ctx = f.contentContextFor(f.shas.a);
  assert.deepEqual(ctx.chain, CHAIN);
  assert.equal(ctx.pageCount, 3);
  assert.deepEqual(f.contentContextFor(f.shas.b).chain, LAYER, "no chain named: one unscoped text layer");
  /* the same answers as the module over a world seeded by hand */
  const w = world(); const cap = w.cap("a"); w.doc("INFO-1", [cap]); w.read(cap.sha, { chain: CHAIN, pageCount: 3 });
  assert.deepEqual(f.contentContextFor(f.shas.a), w.content.contentContextFor(cap.sha));
});

test("R12, R7 (fixture contentContextFor): refusedMint is the real mint's refusal of a page past the capture's count, and an in-range mint is real too", () => {
  const f = contentContextFor({ captures: { a: { bundleId: "INFO-1", pageCount: 2 } } });
  const r = f.refusedMint();
  assert.equal(r.ok, false);
  assert.equal(r.code, "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.equal(r.check, "C-45.1");
  const ok = f.mint({ bundleId: "INFO-1", captureSha: f.shas.a, extent: { kind: "pdf-page", page: 1 }, mintedBy: "plane" });
  assert.equal(ok.ok, true);
  assert.equal(ok.minted, true);
  assert.throws(() => contentContextFor({}).refusedMint(), /needs one capture/);
});
