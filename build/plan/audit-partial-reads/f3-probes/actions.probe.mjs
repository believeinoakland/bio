import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, actionMd, CP } = await import(`${R}/actions/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const A = "ACTN-2026-0001-a", M = V("alice");
test("actions whole", () => {
  const w = world();
  const m = multipart("b");
  const id = "INFO-2026-0001-big";
  const md = ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A document.", ""].join("\n");
  const { files, register } = mpFiles(m, { md });
  const r = w.promote(id, md, { files: files.slice(1), register });
  console.log("promote multipart", r.ok, r.reason ?? "", JSON.stringify(r.findings ?? "").slice(0, 200));
  console.log("register rows", JSON.stringify(w.rows(`SELECT bundle_id, whole, substr(capture_sha,1,8) s FROM register`)));
  const ctl = w.doc("INFO-2026-0002-ctl");
  w.action(A);
  const c = (s, dir = "received", at = "2026-09-03") => w.a.actionCorrespond({ target: A, direction: dir, at, artifactSha: s, viewer: M, author: M });
  const rc = c(ctl); console.log("control correspond", rc.ok, rc.reason ?? "", JSON.stringify(rc.responds_to));
  const rw = c(m.whole, "received", "2026-09-04"); console.log("whole correspond", rw.ok, rw.reason ?? "", rw.detail ?? "", JSON.stringify(rw.responds_to), JSON.stringify(rw.findings ?? "").slice(0, 300));
  const ru = c(sha("unk"), "received", "2026-09-05"); console.log("unknown correspond", ru.ok, ru.reason ?? "");
  console.log("ledger rows", JSON.stringify(w.rows(`SELECT ord, substr(artifact_sha,1,8) s, artifact_bundle_id FROM correspondence WHERE bundle_id=?`, A)));
  console.log("big refs", JSON.stringify(w.fm(id).references ?? null));
  console.log("big register after", JSON.stringify(w.rows(`SELECT whole, substr(capture_sha,1,8) s FROM register WHERE bundle_id=?`, id)), "head", w.record.head(id)?.bundleSha?.slice(0, 8));
});
