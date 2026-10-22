import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, infoMd, sha: msha } = await import(`${R}/monitoring/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const LOC = "https://records.example.org/report.pdf", ADDR = LOC;
const receipt = (w, addr, cap, at) => w.prov.recordReceipt({ address: addr, addressNorm: addr, captureSha: cap, retrieved: at,
  via: "direct", retrievalLocator: addr, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });
test("monitoring whole", () => {
  const w = world();
  const v1 = w.monitored("INFO-2026-0110-v1", LOC, "pdf-5mb");
  receipt(w, ADDR, v1.cap, "2026-09-01T00:00:00Z");
  /* v2: the document grew past 8 MiB: held in three parts, promoted by the real chain, monitored at the same address */
  const m = multipart("b", { extra: { locator: LOC } }); m.doc.locator = LOC;
  const id = "INFO-2026-0111-v2";
  const md = infoMd(id, LOC, {});
  const { files, register } = mpFiles(m, { md });
  const r = w.promote(id, md, { reg: [m.doc], files: files.slice(2), register });
  console.log("promote v2", r.ok, r.reason ?? "", JSON.stringify(r).slice(0, 300));
  console.log("register v2", JSON.stringify(w.rows(`SELECT whole, substr(capture_sha,1,8) s FROM register WHERE bundle_id=?`, id)));
  console.log("captured_locators after promote", JSON.stringify(w.rows(`SELECT address_norm, substr(capture_sha,1,8) s FROM captured_locators`)));
  /* recordLook: a changed tick that filed the whole */
  const look = w.m.recordLook({ bundleId: id, address: ADDR, locator: LOC, outcome: "changed", baseline: v1.cap, seen: m.whole,
    captured: { sha256: m.whole, retrieved: "2026-09-02T00:00:00Z" } });
  console.log("recordLook changed whole:", "captured=", look.captured === m.whole ? "WHOLE" : look.captured, "uncaptured=", look.uncaptured ?? null);
  const ctl = w.monitored("INFO-2026-0112-ctl", "https://records.example.org/other.txt", "ctl-v1");
  const lc = w.m.recordLook({ bundleId: "INFO-2026-0112-ctl", address: "https://records.example.org/other.txt", locator: "https://records.example.org/other.txt", outcome: "changed", baseline: ctl.cap, seen: msha("ctl-v2"), captured: { sha256: msha("ctl-v2") } });
  console.log("control (unregistered new sha) captured=", lc.captured, "uncaptured=", lc.uncaptured);
  console.log("captured_locators now", JSON.stringify(w.rows(`SELECT address_norm, substr(capture_sha,1,8) s FROM captured_locators`)));
  const s = w.m.subjects();
  const row = s.rows.find((x) => x.address === ADDR);
  console.log("subjects row", JSON.stringify(row && { bundle_id: row.bundle_id, versions: row.versions }));
  /* 3080: watched captures of a project: a capture the project rests on */
  w.intent.watch["PRJ-2026-0001-p"] = [m.whole, v1.cap, sha("nowhere")];
  const wt = w.m.watched({ project: "PRJ-2026-0001-p" });
  console.log("watched", JSON.stringify(wt.captures.map((c) => ({ w: c.capture === m.whole ? "WHOLE" : c.capture === v1.cap ? "single" : "unknown", bundle: c.bundle, monitored: c.monitored, locator: c.locator }))));
});
