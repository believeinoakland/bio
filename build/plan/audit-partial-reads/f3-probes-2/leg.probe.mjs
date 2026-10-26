import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, inquiryMd, infoMd } = await import(`${R}/leg-earning/fixture.mjs`);
const { multipart, mpFiles } = await import("./mp.mjs");
for (const label of ["a","b"]) test("leg-earning " + label, () => {
  const w = world();
  const m = multipart(label); const id = "INFO-2026-0001-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:alice", files, meta: { object_type: "information" }, register });
  const ctl = w.doc("INFO-2026-0002-ctl")[0];
  console.log(label, "promote", r.ok, "captureFor", w.content.captureFor(id) === m.whole ? "WHOLE" : "PART");
  const Q = "INQ-2026-0001-q";
  const legs = [{ target: id }, { target: "INFO-2026-0002-ctl" }];
  const p = w.promote(Q, inquiryMd(Q, { legs }));
  console.log("inq promote", p.ok);
  const wr = w.k.writeBasis(Q, legs.map((l, i) => ({ ...l, role: "supports", ord: i, at: null, content_id: null })));
  console.log("writeBasis", wr.ok);
  for (const ord of [0, 1]) {
    const e = w.k.ensureLegContent(Q, ord);
    const row = w.row(`SELECT capture_sha, extent FROM content WHERE content_id=?`, e.content_id);
    console.log(label, ord ? "control" : "whole", "ensureLegContent", e.ok, e.null_case ?? "", "minted", e.minted, "capture", row ? (row.capture_sha === m.whole ? "WHOLE" : row.capture_sha === ctl ? "ctl" : "PART") : null);
  }
});
