/* content: the capture's context and its text attestations (K73 (1): content's; their Provides ids are asked of BOB in
   CONTENT #1's Q1, so these tests name the services until the ids exist). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a";

test("contentContextFor: the chain, the page set (stored count first, else the named pages), the page boxes and the container, each absence stated", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 5, pageBoxes: { boxes: [{ media_box: [0, 0, 10, 10] }], of_page: [0] } });
  const c = w.content.contentContextFor(a.sha);
  assert.deepEqual([c.pageCount, c.pageBoxes.of_page, Array.isArray(c.chain)], [5, [0], true]);
  assert.equal(c.container.held, false);
  assert.match(c.container.why, /does not hold/);
  assert.equal(c.container.office, null);
  /* no stored count: the highest page a scoped step or an attestation names, plus one */
  const b = w.cap("b"); w.doc("INFO-2026-0002-b", [b]);
  w.read(b.sha, { pageCount: null, chain: [{ step: "layer", tier: 1, extent: { kind: "pages", pages: [0, 3] } }] });
  assert.equal(w.content.contentContextFor(b.sha).pageCount, 4);
  w.content.attestText({ captureSha: b.sha, member: V("cy"), extent: { kind: "page", page: 6 } });
  assert.equal(w.content.contentContextFor(b.sha).pageCount, 7);
  /* an office container, by the format registry, never a list of slugs */
  const d = w.cap("d"); w.doc("INFO-2026-0003-d", [d]);
  w.read(d.sha, { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 4, tables: [], images: [] } });
  const dc = w.content.contentContextFor(d.sha).container;
  assert.deepEqual([dc.office, dc.format, dc.paragraphs, dc.tables, dc.images, dc.held], [true, "docx", 4, [], [], true]);
  w.read(d.sha, { captureFormat: "pdf", containerExtent: { container: "pdf", levels: [], images: [{ page: 0, rect: [0, 0, 1, 1] }] } });
  const pc = w.content.contentContextFor(d.sha).container;
  assert.deepEqual([pc.office, pc.container_name, pc.page_images_why], [false, "pdf", null]);
  assert.equal(w.content.contentContextFor("0".repeat(64)).container.office, null, "no reading: undetermined, stated");
});

test("attestText: a member's attestation over a stated extent, the chain snapshotted; refusals are text-chain's; no reading is NO_READING", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { pageCount: 3 });
  assert.equal(w.content.attestText({ captureSha: a.sha, member: "class:ai", extent: { kind: "document" } }).code, "TEXT_ATTEST_MACHINE");
  assert.equal(w.content.attestText({ captureSha: a.sha, member: V("cy"), extent: { kind: "page" } }).code, "TEXT_ATTEST_EXTENT");
  assert.equal(w.content.attestText({ captureSha: "0".repeat(64), member: V("cy"), extent: { kind: "document" } }).reason, "NO_READING");
  const r = w.content.attestText({ captureSha: a.sha, member: V("cy"), extent: { kind: "region", source: { kind: "pdf-page", page: 1, rect: [0, 0, 5, 5] } }, at: "2026-09-02T00:00:00Z", note: "ok" });
  assert.deepEqual([r.ok, r.attestor, r.at], [true, V("cy"), "2026-09-02T00:00:00Z"]);
  assert.deepEqual(r.chain_at_attestation, w.ex.readings[a.sha].chain);
  const row = w.row(`SELECT * FROM text_attestations`);
  assert.deepEqual([row.bundle_id, row.extent_kind, row.extent_page, JSON.parse(row.extent_rect), row.note], [DOC, "region", 1, [0, 0, 5, 5], "ok"]);
});

test("attestationsFor: every attestation over a capture, bounded, stale against the live chain (never on a null), with the ceiling for a target", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 3, chain: [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "1", cap: "C", measured_by: "m" }] });
  w.content.attestText({ captureSha: a.sha, member: V("cy"), extent: { kind: "page", page: 1 }, at: "2026-09-01T00:00:00Z" });
  w.read(a.sha, { pageCount: 3, chain: [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "2", cap: "B", measured_by: "m" }] });
  w.content.attestText({ captureSha: a.sha, member: V("di"), extent: { kind: "page", page: 2 }, at: "2026-09-02T00:00:00Z" });
  const r = w.content.attestationsFor(a.sha, { page: 1 }, V("bo"));
  assert.deepEqual(r.attestations.map((x) => [x.attestor, x.stale]), [[V("cy"), true], [V("di"), false]]);
  assert.deepEqual([r.count, r.truncated, r.limit], [2, false, 200]);
  assert.equal(r.ceiling.determinant, "derivation", "the stale attestation over page 1 raises nothing");
  assert.equal(w.content.attestationsFor(a.sha, { page: 2 }, V("bo")).ceiling.determinant, "attestation");
  assert.deepEqual(w.content.attestationsFor(a.sha, null, V("bo"), 1).truncated, true);
  assert.equal(w.content.attestationsFor(a.sha, null, "nobody").attestations[0].bundle_id, null, "the bundle withheld from a viewer who may not see it");
  assert.equal(w.content.attestationsFor("", null, V("bo")).reason, "NO_SHA");
});
