import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, infoMd } = await import(`${R}/provenance/fixture.mjs`);
const { fresh, reader, ofKind } = await import(`${R}/notice-producers/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
test("notice-producers whole", () => {
  const w = world({ now: "2026-10-01T00:00:00.000Z" });
  const m = multipart("b"); const id = "INFO-2026-0001-big";
  const { files, register } = mpFiles(m, { md: infoMd(id, { title: "The big report" }) });
  console.log("promote", w.promotion.promote({ bundleId: id, base: null, snapKey: "k", author: "member:alice", meta: { object_type: "information" }, files, register }).ok);
  const c = w.cap("single"); w.promoteInfo("INFO-2026-0002-s", { captures: [c], title: "A small report" });
  for (const mm of ["m1"]) w.st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', 't', 't')`, mm);
  w.st.db.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const AT = Date.parse("2026-10-01T00:00:00Z") - 3600_000;
  const note = (cap, n) => ({ captureSha: cap, note_id: n, held: true, at: AT, findings: ["Xls.Downloader.Agent-917"], tool: "clamav", engine: "clamav 1" });
  const fileSafety = { scanFindings: () => ({ ok: true, findings: [note(m.whole, "N1"), note(c.sha, "N2"), note(sha("nowhere"), "N3")], cursor: null, truncated: false }),
                       securityToolEvents: () => ({ ok: true, events: [], cursor: null, truncated: false }), securityTools: () => ({ ok: true, tools: [] }) };
  const n = fresh({ storage: w.st, ...w.host }, { membership: w.membership, fileSafety, provenance: w.prov });
  const { read } = reader(n);
  const items = ofKind(read("m1", { now: Date.parse("2026-10-01T00:00:00Z") }), "scan-found");
  for (const i of items) console.log("scan-found", i.subject.capture === m.whole ? "WHOLE" : i.subject.capture === c.sha ? "control" : "unknown", "home=", i.subject.id, "| document word:", i.fills.document);
});
