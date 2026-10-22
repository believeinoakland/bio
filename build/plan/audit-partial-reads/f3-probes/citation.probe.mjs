import test from "node:test";
import assert from "node:assert/strict";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, docMd, NOW } = await import(`${R}/citation/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");

function put(w, id, m) {
  const { files, register } = mpFiles(m, { md: docMd(id, "information") });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp" + id, author: "member:ann", files, meta: {}, register });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
}
function setup(label) {
  const w = world({ inquiry: true });
  const m = multipart(label);
  put(w, "INFO-2026-0001-doc", m);
  /* the same, one-part control */
  const cap = w.info("INFO-2026-0002-doc");
  w.inquiry("INQ-2026-0001-q"); w.inquiry("INQ-2026-0002-q");
  return { w, m, cap };
}
const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
for (const label of ["b","a"]) test("citation cite(found) whole " + label, () => {
  const { w, m, cap } = setup(label);
  const parts = m.held.map((p) => p.sha256);
  console.log("label", label, "capturesOf order", w.prov.capturesOf("INFO-2026-0001-doc").map((c) => c.capture_sha === m.whole ? "WHOLE" : "part").join(","), "captureFor is whole:", w.content.captureFor("INFO-2026-0001-doc") === m.whole);
  console.log("homeOf(whole)", JSON.stringify(w.prov.homeOf(m.whole)));
  const ctl = w.cit.cite({ project: "INQ-2026-0001-q", found: { capture_sha: cap, extent: { kind: "pdf-page", page: 1 } }, ...ANN, role: "supports", note: "n" });
  console.log("control", ctl.ok, ctl.reason, JSON.stringify(ctl).slice(0,500));
  const r = w.cit.cite({ project: "INQ-2026-0002-q", found: { capture_sha: m.whole, extent: { kind: "pdf-page", page: 1 } }, ...ANN, role: "supports", note: "n" });
  console.log("whole cite", r.ok, r.reason, JSON.stringify(r.missing || ""), r.pinned_capture ?? "");
  if (r.ok) {
    const rb = w.cit.recordedBy({ captureSha: m.whole, viewer: V("ann") });
    console.log("recordedBy whole", rb.ok, rb.reason, JSON.stringify(rb.items).slice(0, 200));
    const rc = w.cit.recordedBy({ captureSha: cap, viewer: V("ann") });
    console.log("recordedBy control", rc.ok, JSON.stringify(rc.items).slice(0, 120));
    const un = w.cit.recordedBy({ captureSha: sha("unknown"), viewer: V("ann") });
    console.log("recordedBy unknown", JSON.stringify(un.items));
  }
});
