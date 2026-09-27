/* content: citation refusals and resolution, for the modules whose edges cite (R27, R28), with C-45.5 and C-45.6. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTENT_EXTENT_CHECKS } from "../../../checks/bio-checks.mjs";
import { world, V } from "./fixture.mjs";
import { contentIdFor } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a", OTHER = "INFO-2026-0002-b", EMPTY = "INFO-2026-0003-empty", Q = "INQ-2026-0001-q";

function setup() {
  const w = world();
  const a = w.cap("a"), b = w.cap("b");
  w.doc(DOC, [a]); w.doc(OTHER, [b]); w.doc(EMPTY, []); w.inquiry(Q);
  w.read(a.sha, { pageCount: 3 }); w.read(b.sha, { pageCount: 3 });
  return { w, a, b };
}

test("R27: citationRefusals returns every refusal: C-45.3 on a non-document, C-45.5 unknown row, C-45.6 another document's row, C-45.2 no capture, else R7", () => {
  const { w, a, b } = setup();
  const theirs = w.content.mint({ bundleId: OTHER, captureSha: b.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  const mine = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  const cites = [
    { target: Q, extent_kind: "pdf-page", extent_page: 0 },
    { target: Q, content_id: mine },
    { target: Q },
    { target: DOC, content_id: "0".repeat(64) },
    { target: DOC, content_id: theirs },
    { target: DOC, content_id: mine },
    { target: EMPTY, extent_kind: "pdf-page", extent_page: 0 },
    { target: EMPTY },
    { target: DOC, extent_kind: "pdf-page", extent_page: 7 },
    { target: DOC, extent_kind: "pdf-page", extent_page: 1 },
    { target: DOC, extent: { kind: "pdf-page", page: 0, rect: [0, 0, 1, 1], space: "image-px" } },
  ];
  const errs = w.content.citationRefusals(cites, (i) => `leg[${i}]`);
  const got = errs.map((e) => [e.detail.match(/^leg\[(\d+)\]/)[1], e.code]);
  assert.deepEqual(got, [["0", "CONTENT_EXTENT_UNREADABLE"], ["1", "CONTENT_EXTENT_UNREADABLE"], ["3", "CONTENT_ROW_UNKNOWN"],
    ["4", "CONTENT_ROW_NOT_THIS_TARGET"], ["6", "CONTENT_EXTENT_NO_CHAIN"], ["8", "CONTENT_EXTENT_OUT_OF_RANGE"],
    ["10", "CONTENT_EXTENT_NOT_USER_SPACE"]]);
  for (const e of errs.filter((x) => CONTENT_EXTENT_CHECKS[x.code])) {
    assert.equal(e.check, CONTENT_EXTENT_CHECKS[e.code].check);
    assert.equal(e.translation, CONTENT_EXTENT_CHECKS[e.code].translation);
  }
  assert.equal(errs.find((e) => e.code === "CONTENT_ROW_UNKNOWN").check, "C-45.5");
  assert.equal(errs.find((e) => e.code === "CONTENT_ROW_NOT_THIS_TARGET").check, "C-45.6");
  /* one context per capture per call */
  let asked = 0;
  const orig = w.content.extraction.readingOf;
  w.content.extraction.readingOf = (s) => { asked++; return orig(s); };
  w.content.citationRefusals([{ target: DOC, extent_kind: "pdf-page", extent_page: 0 }, { target: DOC, extent_kind: "pdf-page", extent_page: 1 },
                              { target: DOC }], "leg");
  w.content.extraction.readingOf = orig;
  assert.equal(asked, 1);
  assert.deepEqual(w.content.citationRefusals([{ target: DOC }, { target: DOC, extent_kind: "pdf-page", extent_page: 2 }]), []);
});

test("R28: resolveCitation uses a named id as it is; otherwise mints (plane) R5's extent over R11's capture; a non-document and no capture answer null with the reason", () => {
  const { w, a } = setup();
  const named = "c".repeat(64);
  assert.deepEqual(w.content.resolveCitation({ target: DOC, content_id: named }), { content_id: named, minted: false });
  const r = w.content.resolveCitation({ target: DOC, extent_kind: "pdf-page", extent_page: 2 });
  assert.deepEqual([r.content_id, r.minted], [contentIdFor(a.sha, { kind: "pdf-page", page: 2 }, w.ex.readings[a.sha].chain), true]);
  assert.equal(w.row(`SELECT minted_by FROM content WHERE content_id=?`, r.content_id).minted_by, "plane");
  const d = w.content.resolveCitation({ target: DOC });
  assert.equal(w.row(`SELECT extent_kind FROM content WHERE content_id=?`, d.content_id).extent_kind, "document");
  assert.deepEqual(w.content.resolveCitation({ target: DOC, extent_kind: "pdf-page", extent_page: 2 }).minted, false);
  const q = w.content.resolveCitation({ target: Q });
  assert.deepEqual([q.content_id, q.null_case], [null, "INQUIRY_TARGET"]); assert.ok(q.why);
  const e = w.content.resolveCitation({ target: EMPTY });
  assert.deepEqual([e.content_id, e.null_case], [null, "NO_BYTES_HELD"]); assert.ok(e.why);
});
