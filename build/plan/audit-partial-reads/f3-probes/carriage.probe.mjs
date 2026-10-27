import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/case-carriage";
const { world, caseFm, sha, NOW, infoMd } = await import(`${R}/fixture.mjs`);
const { extractedTextOf } = await import("/home/user/bio/bio-plane/src/case-grammar/index.mjs");
const { multipart, mpFiles } = await import("./mp.mjs");
const UNITS = [{ seq: 0, extent: { kind: "document" }, ref: "¶1", text: "The minutes say so.", truncated: false }];
const EXTRACTED = extractedTextOf(UNITS);
const docRow = (ref, s, over = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null, included: true, rests_under: "load_bearing", ...over });
test("case-carriage holdMaterials over a multipart document", () => {
  const w = world();
  const m = multipart("b"); const id = "INFO-2026-0009-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  console.log("promote", w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:alice", files, meta: { object_type: "information" }, register }).ok);
  w.receipt(m.whole);                                  /* acquired directly by this copy */
  w.units.set(m.whole, { units: UNITS, state: "whole" });
  const ctl = w.doc("INFO-2026-0001-ctl");
  w.units.set(ctl, { units: UNITS, state: "whole" });
  for (const [n, ref, s, inEv] of [["control", "INFO-2026-0001-ctl", ctl, false], ["whole (not in evidence store)", id, m.whole, false], ["whole (also kept in evidence store)", id, m.whole, true], ["unknown", "INFO-2026-0404-x", sha("nowhere"), false]]) {
    if (inEv) w.evidence.put(m.whole, Buffer.alloc(8));
    const r = w.cc.holdMaterials({ format: "bio-case-document/6", materials: [docRow(ref, s, { text_sha: sha(EXTRACTED) })] }, { caseId: "CASE-2026-0001", edition: n.startsWith("whole (also") ? 3 : n === "control" ? 1 : n === "unknown" ? 4 : 2, at: NOW });
    console.log("holdMaterials", n, "materials:", JSON.stringify(r.materials.map((x) => [x.sha === m.whole ? "WHOLE" : x.sha === ctl ? "ctl" : x.sha === sha(EXTRACTED) ? "text" : x.sha.slice(0, 6), x.held])), "unheld:", JSON.stringify(r.unheld.map((u) => [u.kind, (u.why || "").slice(0, 60)])));
  }
});
