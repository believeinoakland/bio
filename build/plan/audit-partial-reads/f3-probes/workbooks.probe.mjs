import test from "node:test";
import assert from "node:assert/strict";
const R = "/home/user/bio/bio-plane/test/m";
const { world, BASIC, V } = await import(`${R}/workbooks/fixture.mjs`);
const { multipartOfBytes, mpFiles, padZip, sha, MIB } = await import("./mp.mjs");
const mdFor = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`, "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");
test("workbooks whole", async () => {
  const w = world();
  for (const m of ["alice", "bob", "carol"]) w.member(m, m === "alice" ? { role: "admin" } : {});
  const P = w.project("Rates", "bob", ["carol"]);
  const big = await padZip(Buffer.from(BASIC()), 20 * MIB);
  const m = multipartOfBytes("wb", big);
  console.log("bytes", big.length, "parts", m.held.map((p) => p.bytes).join("+"));
  const id = "INFO-2026-0900-wb";
  const { files, register } = mpFiles(m, { md: mdFor(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: V("alice"), files, meta: { object_type: "information" }, register });
  console.log("promote", r.ok, r.reason ?? "");
  w.ev.m.set(m.whole, big);                     /* the whole kept under its own digest (<= 32 MiB), as acquire keeps it */
  for (const p of m.held) w.ev.m.set(p.sha256, p.bytesBuf);
  w.ex.readings[m.whole] = { chain: [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }], pageCount: 3 };
  const ctl = w.capture(BASIC());
  const add = (s) => w.wb.addWorkbook({ captureSha: s, question: "What does it cost?", period: "FY2025", project: P, by: V("bob") });
  for (const [n, s] of [["control", ctl.capSha], ["whole", m.whole], ["unknown", sha("nowhere")]]) {
    const a = await add(s); console.log("addWorkbook", n, a.ok, a.reason ?? "", a.ok ? "" : (a.why ?? a.detail ?? "").toString().slice(0, 120));
  }
});
