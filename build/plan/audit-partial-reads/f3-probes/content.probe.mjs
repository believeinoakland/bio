import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/content";
const { world, LAYER, infoMd } = await import(`${R}/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const V = (i) => `member:${i}`;
for (const label of ["b", "a"]) test("content whole " + label, () => {
  const w = world();
  const m = multipart(label); const id = "INFO-2026-0900-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  console.log(label, "promote", w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: V("alice"), files, meta: { object_type: "information" }, register }).ok, "captureFor(bundle) is whole:", w.content.captureFor(id) === m.whole);
  const c = w.cap("ctl"); w.doc("INFO-2026-0901-ctl", [c]);
  w.read(m.whole, { pageCount: 8 }); w.read(c.sha, { pageCount: 8 });
  for (const [n, s] of [["control", c.sha], ["whole", m.whole], ["unknown", sha("nowhere")]]) {
    const a = w.content.attestText({ note: "compared with the page", captureSha: s, viewer: V("bo"), member: V("cy"), extent: { kind: "page", page: 2 } });
    console.log(label, "attestText", n, a.ok, a.reason ?? a.code ?? "");
    const mi = w.content.mint({ bundleId: n === "whole" ? id : "INFO-2026-0901-ctl", captureSha: s, extent: { kind: "pdf-page", page: 2 }, mintedBy: V("alice") });
    console.log(label, "mint", n, mi.ok, mi.reason ?? mi.code ?? "");
    const af = w.content.attestationsFor(s, null, V("bo"));
    console.log(label, "attestationsFor", n, af.ok, "n=", af.attestations?.length);
  }
});
