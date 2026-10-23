import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, infoMd } = await import(`${R}/retrieval/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
test("retrieval whole", () => {
  const w = world();
  const m = multipart("b");
  const id = "INFO-2026-0001-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:ann", files, meta: { object_type: "information" }, register });
  console.log("promote", r.ok, r.reason ?? "");
  const c = w.cap("ctl", "ctl bytes"); w.doc("INFO-2026-0002-ctl", {}, { captures: [c] });
  const ex = (s, state, extra = {}) => w.observe({ level: "content", subject_kind: "capture", subject: s, authority_kind: "extract", authority: id, state, ...extra });
  for (const s of [m.whole, c.sha, sha("nowhere")]) ex(s, "LOOKED_INDETERMINATE", { condition: "scanned" });
  for (const [n, s] of [["whole", m.whole], ["control", c.sha], ["unknown", sha("nowhere")]]) {
    const a = w.retrieval.contentAxis({ captureSha: s, viewer: V("vera") });
    console.log("contentAxis", n, "found=", a.found, "held=", a.capture_held, "bundle=", a.bundle_id ?? null, "extraction=", a.extraction?.state ?? null);
  }
  const f = w.retrieval.frontier({ level: "content", viewer: V("vera") });
  const names = { [m.whole]: "whole", [c.sha]: "control", [sha("nowhere")]: "unknown" };
  console.log("frontier content looked:", JSON.stringify(f.looked.map((x) => names[x.subject] ?? x.subject.slice(0, 6))), "recandidates:", JSON.stringify((f.recandidates || []).map((x) => names[x.subject] ?? x.subject.slice(0, 6))));
  /* meaning level */
  for (const s of [m.whole, c.sha, sha("nowhere")]) w.observe({ level: "meaning", subject_kind: "capture", subject: s, authority_kind: "extract", authority: id, state: "PRESENT" });
  const g = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  console.log("frontier meaning looked:", JSON.stringify(g.looked.map((x) => names[x.subject] ?? x.subject.slice(0, 6))));
  /* the never-looked partition for content: captures held with no content row */
  const w2 = world();
  w2.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:ann", files, meta: { object_type: "information" }, register });
  const f2 = w2.retrieval.frontier({ level: "content", viewer: V("vera") });
  console.log("frontier content (no rows) keys", Object.keys(f2).join(","));
  const flat = JSON.stringify(f2);
  console.log("never-looked/missing lists contain whole:", flat.includes(m.whole), " part:", flat.includes(m.held[0].sha256));
  console.log("never_looked after ex rows? (no rows world):", JSON.stringify((f2.never_looked||[]).map((x) => (x.subject===m.whole?"WHOLE":m.held.some((h)=>h.sha256===x.subject)?"part":"other"))), f2.never_looked_count);
  /* findIn */
  w.unit(m.whole, id, 0, "The budget line is set."); w.unit(c.sha, "INFO-2026-0002-ctl", 0, "The budget line is set.");
  for (const [n, i] of [["whole", id], ["control", "INFO-2026-0002-ctl"]]) {
    const fi = w.retrieval.findIn({ scope: { ids: [i] }, kinds: ["term"], term: "budget", viewer: V("vera") });
    console.log("findIn", n, fi.ok, fi.reason ?? "", "items:", fi.ok ? fi.kinds[0].items.length : "-");
  }
});
