import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/case-authoring";
const { world, V, infoMd } = await import(`${R}/fixture.mjs`);
const { multipart, mpFiles } = await import("./mp.mjs");
const BIG = "INFO-2026-0006-big", Q = "INQ-2026-0001-q";
test("case-authoring relies on a multipart doc (leg targets the doc)", () => {
  const w = world(); for (const m of ["alice", "bo"]) w.member(m);
  const m = multipart("b");
  const { files, register } = mpFiles(m, { md: infoMd(BIG) });
  w.promotion.promote({ bundleId: BIG, base: null, snapKey: "mpbig", author: V("alice"), files, meta: { object_type: "information" }, register });
  w.documentCopy(m.whole, "clean"); w.indexText(m.whole, BIG);
  w.finding(Q, [{ target: BIG }]);
  const P = w.project("Team", "alice", [Q]);
  const r = w.publish(P, "alice", [Q]);
  console.log("publish load-bearing finding on the multipart doc:", r.ok, r.reason ?? "");
  for (const t of r.not_presentable ?? []) for (const x of t.materials) console.log("  material", x.sha === m.whole ? "WHOLE" : "part", "missing", JSON.stringify(x.missing));
});
