import test from "node:test";
globalThis.REALCAP = true;
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, actionMd, CP } = await import("./actions-fx.mjs");
const { multipart, mpFiles } = await import("./mp.mjs");
for (const label of ["a","b"]) test("actions basis " + label, () => {
  const w = world(); const m = multipart(label); const id = "INFO-2026-0001-big";
  const md = ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected", 'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A document.", ""].join("\n");
  const { files, register } = mpFiles(m, { md });
  console.log(label, "promote", w.promote(id, md, { files: files.slice(1), register }).ok);
  const A = "ACTN-2026-0001-a"; const ctl = w.doc("INFO-2026-0002-d");
  const r = w.action(A, ["action_basis:", `  - target: ${id}`, "    kind: rests_on", "  - target: INFO-2026-0002-d", "    kind: rests_on"]);
  console.log(label, "action ok", r?.ok);
  console.log(label, "action_basis", JSON.stringify(w.rows(`SELECT ord, target_id, extent_capture FROM action_basis WHERE bundle_id=?`, A).map(x => ({ t: x.target_id.slice(0,15), pin: x.extent_capture === m.whole ? "WHOLE" : x.extent_capture ? (m.held.some(h=>h.sha256===x.extent_capture)?"PART":"other") : null }))));
});
