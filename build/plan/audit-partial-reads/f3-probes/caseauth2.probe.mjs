import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/case-authoring";
const { world, V, infoMd } = await import(`${R}/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const DOC = "INFO-2026-0001-a", BIG = "INFO-2026-0006-big", Q = "INQ-2026-0001-q";
const docOf = (w, r) => w.row(`SELECT * FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
test("case-authoring searched section whole", () => {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const capA = w.doc(DOC);
  const m = multipart("b");
  const { files, register } = mpFiles(m, { md: infoMd(BIG) });
  w.promotion.promote({ bundleId: BIG, base: null, snapKey: "mpbig", author: V("alice"), files, meta: { object_type: "information" }, register });
  w.documentCopy(m.whole, "clean"); w.indexText(m.whole, BIG);
  w.finding(Q, [{ target: DOC }]);
  const Q2 = "INQ-2026-0002-q"; w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  const ord0 = w.row(`SELECT MAX(ord) AS m FROM inquiry_basis WHERE bundle_id=?`, Q).m + 1;
  [[capA, DOC, 1], [m.whole, BIG, 2]].forEach(([cap, doc, i]) => {
    const cid = sha(`content ${i}`);
    w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, cited_as) VALUES (?, ?, ?, 'document', '{"kind":"document"}', 'the document', 'plane', ?, 'text')`, cid, cap, doc, w.clock.now);
    w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, role, target_id, target_type, content_id) VALUES (?, ?, 'supports', ?, 'information', ?)`, Q, ord0 + i, doc, cid);
  });
  const r = w.publish(P, "alice", [Q2, Q], { roles: { [Q2]: "load_bearing", [Q]: "supporting" } });
  console.log("publish", r.ok, r.reason ?? "", JSON.stringify(r.not_presentable ?? ""));
  const fm = w.fm(docOf(w, r).text);
  for (const l of fm.searched_levels) console.log("level", l.level, "subjects", l.subjects, "outcome", l.outcome, "undetermined", l.undetermined ?? null, "looked", l.looked ?? null);
  // direct: the module's own subject computation
  const sec = w.ca.searchedSection ? "n/a" : "";
});
