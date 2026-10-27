import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, docMd } = await import(`${R}/citation/fixture.mjs`);
const { multipart, mpFiles } = await import("./mp.mjs");
const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
for (const label of ["a","b"]) test("citation pins " + label, async () => {
  const w = world({ inquiry: true });
  const m = multipart(label);
  const id = "INFO-2026-0001-doc";
  const { files, register } = mpFiles(m, { md: docMd(id, "information") });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:ann", files, meta: {}, register });
  const ctl = "INFO-2026-0002-doc"; w.info(ctl);
  const cfor = w.content.captureFor(id);
  console.log(label, "promote", r.ok, "captureFor:", cfor === m.whole ? "WHOLE" : m.held.some(h=>h.sha256===cfor)?"PART":cfor);
  const inq = w.inquiry("INQ-2026-0001-q");
  const caseId = w.project("Case");
  for (const [n, tgt, proj] of [["case", id, caseId], ["inquiry", id, inq]]) {
    const h = await w.select([tgt]);
    const x = w.cit.cite({ project: proj, handle: h, ...ANN, ...(n==="inquiry"?{role:"supports"}:{}), note: "n" });
    const md = w.md(proj);
    const pin = (md.match(/extent_capture:\s*"?([0-9a-f]{64})/) || [])[1];
    console.log(label, n, "cite ok", x.ok, x.reason ?? "", "pin:", pin === m.whole ? "WHOLE" : pin ? (m.held.some(h=>h.sha256===pin)?"PART":"other") : "none");
  }
});
