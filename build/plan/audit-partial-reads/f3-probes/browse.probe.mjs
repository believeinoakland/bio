import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, infoMd, md } = await import(`${R}/retrieval-browse/fixture.mjs`);
const { FIND_CAPTURES_PER_CALL } = await import("/home/user/bio/bio-plane/src/retrieval-browse/index.mjs");
const { multipart, mpFiles, sha } = await import("./mp.mjs");
test("retrieval-browse whole", () => {
  const w = world();
  const m = multipart("b");
  const id = "INFO-2026-0001-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  console.log("promote", w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:ann", files, meta: { object_type: "information" }, register }).ok, "FIND_CAPTURES_PER_CALL", FIND_CAPTURES_PER_CALL);
  const c = w.cap("ctl", "ctl bytes"); w.doc("INFO-2026-0002-ctl", {}, { captures: [c] });
  w.unit(m.whole, id, 0, "The budget line is set."); w.unit(c.sha, "INFO-2026-0002-ctl", 0, "The budget line is set.");
  const show = (n, fi) => console.log("findIn", n, fi.ok, fi.reason ?? "", fi.ok ? `scope.captures=${fi.scope.captures} captures_read=${fi.captures_read} items=${fi.kinds[0].items.length} first=${JSON.stringify(fi.kinds[0].items[0] && { capture: fi.kinds[0].items[0].capture_sha === m.whole ? "WHOLE" : fi.kinds[0].items[0].capture_sha === c.sha ? "ctl" : "other", doc: fi.kinds[0].items[0].document ?? fi.kinds[0].items[0].bundle_id })}` : "");
  const q = (scope) => w.rb.findIn({ scope, kinds: ["term"], term: "budget", viewer: V("vera") });
  show("capture=whole", q({ capture: m.whole }));
  show("capture=part0", q({ capture: m.held[0].sha256 }));
  show("capture=ctl", q({ capture: c.sha }));
  show("ids=[big]", q({ ids: [id] }));
  show("ids=[ctl]", q({ ids: [c.sha ? "INFO-2026-0002-ctl" : ""] }));
  const p = w.project("Case", "ann", { captures: [] });
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id IN (?,?)`, p, id, "INFO-2026-0002-ctl");
  show("project", q({ project: p }));
  /* the cap: a project of 8 multipart docs would spend 4 captures each */
});
