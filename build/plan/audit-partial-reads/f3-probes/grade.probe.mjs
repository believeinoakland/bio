import test from "node:test";
const { world, infoMd, provDoc } = await import("/home/user/bio/bio-plane/test/m/provenance/fixture.mjs");
const { multipart, mpFiles } = await import("./mp.mjs");
test("grade", () => {
  const w = world();
  const m = multipart("b"); const { files, register } = mpFiles(m, { md: infoMd("INFO-2026-0001-big") });
  w.promotion.promote({ bundleId: "INFO-2026-0001-big", base: null, snapKey: "k", author: "member:alice", meta: { object_type: "information" }, files, register });
  const c = w.cap("single"); w.promoteInfo("INFO-2026-0002-s", { captures: [c] });
  console.log("grade whole", JSON.stringify(w.prov.captureGrade(m.whole)), "part", JSON.stringify(w.prov.captureGrade(m.held[0].sha256)));
  console.log("grade single(no receipt)", JSON.stringify(w.prov.captureGrade(c.sha)));
});
