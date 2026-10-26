import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/capture-requests";
const { world, V } = await import(`${R}/fixture.mjs`);
const { normalizeAddress } = await import("/home/user/bio/bio-plane/src/subresources.mjs");
const { realChain, install, sha } = await import("./mp.mjs");
test("capture-requests whole", async () => {
  const ch = await realChain("b");
  const w = world().scene();
  w.project("PROJ-H"); w.participant("PROJ-H", "inner");
  w.bundle("INQ-H"); w.bundle("DOC-H", "information");
  w.st.sql.exec(`UPDATE bundles SET project='PROJ-H' WHERE bundle_id IN ('INQ-H','DOC-H')`);
  w.membership.reindexProjectSight("INQ-H"); w.membership.reindexProjectSight("DOC-H");
  w.run("R-H", { plane: "member:inner/tok3" });
  /* the real chain's register rows (3 parts + whole), re-homed to DOC-H, the hidden project's document */
  install(w.st, { register: ch.register.map((r) => ({ ...r, bundle_id: "DOC-H" })) }, { tables: ["register"] });
  const secret = "https://hidden.example.org/only-in-the-project-big.pdf";
  w.st.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved) VALUES (?,?,?, 'direct','t','t')`, normalizeAddress(secret), secret, ch.m.whole);
  console.log("register rows", w.rows(`SELECT COUNT(*) n FROM register WHERE bundle_id='DOC-H'`)[0].n);
  const ann = w.ask({ held: false, address: secret });
  console.log("ann (cannot see DOC-H):", ann.ok, ann.reason ?? ann.code ?? "");
  const inner = w.cr.captureRequest({ run: "R-H", address: secret, target: "INQ-H", purpose: "investigate" }, { viewer: V("inner"), caller: "member:inner/tok3" });
  console.log("inner (sees DOC-H):", inner.ok, inner.reason ?? inner.code ?? "");
  /* the OLD shape for contrast: same receipt, register holding the parts only (no whole row) -> filed in no bundle -> visible to ann */
  w.st.sql.exec(`DELETE FROM register WHERE capture_sha = ?`, ch.m.whole);
  const ann2 = w.ask({ held: false, address: secret });
  console.log("ann, whole row removed (pre-R72 shape):", ann2.ok, ann2.reason ?? ann2.code ?? "");
});
