import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, actionMd, CP } = await import(`${R}/actions/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const PC = "ACTN-2026-0101-pc", M = V("alice");
const READ = { chain: [{ step: "layer", tier: 1 }], pageCount: 3, pageBoxes: null, container: {} };
test("actions minutes + write-path correspondence whole", () => {
  const w = world({ profiles: ["oakland-alameda"], context: READ });
  const m = multipart("b"); const id = "INFO-2026-0101-big";
  const md = ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected", 'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A document.", ""].join("\n");
  const { files, register } = mpFiles(m, { md });
  console.log("promote", w.promote(id, md, { files: files.slice(1), register }).ok);
  const ctl = w.doc("INFO-2026-0102-ctl");
  w.promote(PC, actionMd(PC, [...CP, "action_kind: public_comment"]));
  w.a.actionCorrespond({ target: PC, direction: "sent", at: "2026-09-02", account: "read out", viewer: M, author: M });
  const rep = (s, at) => w.a.actionCorrespond({ target: PC, direction: "received", at, account: "minutes posted", minutes: { meeting: "Council", date: "2026-09-16", passage: { captureSha: s, extent: { kind: "document" } } }, viewer: M, author: M });
  for (const [n, s, at] of [["control", ctl, "2026-09-20"], ["whole", m.whole, "2026-09-21"], ["unknown", sha("unk"), "2026-09-22"]]) {
    const r = rep(s, at); console.log("minutes", n, r.ok, r.reason ?? "", r.detail ?? "");
  }
  /* write path: promote an action whose bundle.md states correspondence with artifact_sha */
  const A2 = "ACTN-2026-0103-w";
  for (const [n, s] of [["control", ctl], ["whole", m.whole], ["unknown", sha("unk2")]]) {
    const A = n === "control" ? A2 : n === "whole" ? "ACTN-2026-0104-w" : "ACTN-2026-0105-w";
    const r = w.promote(A, actionMd(A, [...CP, "action_kind: records_request", "correspondence:", "  - direction: received", "    at: 2026-09-02", `    artifact_sha: ${s}`, "    author: member:alice"]));
    console.log("promote correspondence", n, r.ok, r.reason ?? "");
    if (r.ok) console.log("  ledger", JSON.stringify(w.rows(`SELECT artifact_bundle_id FROM correspondence WHERE bundle_id=?`, A)));
  }
});
