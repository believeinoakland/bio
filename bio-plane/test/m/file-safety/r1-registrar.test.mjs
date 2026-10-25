/* file-safety R1 (fix round 9, G126, G136; plan 2c item 1): in the receipt's own synchronous act the module registers its jobs by the
   whole digest through the registrar the composition root gives it: scan, grade and, when the file may have a safe view, safe_view. At the
   module's interface, over test-support's registrar stub. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, enc, sha } from "./fixture.mjs";
// fixtures-contract: plane job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { PNG } from "./r9-kit.mjs";

const answer = (w, s) => {
  const r = w.prov.recordReceipt({ address: `https://files.example/${s.slice(0, 8)}.bin`, addressNorm: `https://files.example/${s.slice(0, 8)}.bin`, captureSha: s,
    retrieved: "2026-10-08T12:00:00Z", via: "direct" });
  return r.listeners.find((l) => l.module === "file-safety").answer;
};

test("R1: a receipt registers scan, grade and safe_view by the whole digest in the same act; a name that says it is no document registers no safe_view; a second receipt of the same bytes registers nothing new; the receipt, the queues and the answer are as before", async () => {
  const reg = jobRegistrarStub();
  const w = world({ registerJob: reg.registerJob });
  const a = await w.capture(pdf(false, "doc"));
  assert.deepEqual(reg.rows().map((r) => [r.kind, r.sha, r.state]), [["scan", a, "queued"], ["grade", a, "queued"], ["safe_view", a, "queued"]]);
  /* a picture named as one: scan and grade only */
  const p = await w.capture(PNG, { address: "https://files.example/photo.png" });
  assert.deepEqual(reg.rows().filter((r) => r.sha === p).map((r) => r.kind), ["scan", "grade"]);
  /* the same bytes again at another address: the rows are the same rows */
  const n = reg.rows().length;
  await w.capture(pdf(false, "doc"), { address: "https://files.example/again.pdf" });
  assert.equal(reg.rows().length, n, "one row per (digest, kind)");
  /* the module's own queues are as before, and the answer says what was registered */
  assert.ok(w.row("SELECT 1 AS x FROM fs_files WHERE capture_sha = ?", a));
  const b = sha("another one");
  const ans = answer(w, b);
  assert.deepEqual([ans.ok, ans.queued, ans.jobs], [true, true, ["scan", "grade", "safe_view"]]);
  assert.equal(ans.jobs_refused, undefined);
  assert.equal(reg.rows().filter((r) => r.sha === b).length, 3);
});

test("R1: a registration that answers {ok:false} (or throws) is stated in this module's answer and its log, never swallowed; the receipt stands and the file is queued; with no registrar given the module keeps its own queues and says so", async () => {
  const lines = [];
  const log = console.log;
  console.log = (x) => { try { lines.push(JSON.parse(x)); } catch { /* not ours */ } };
  let w, ans, ans2, s, s2;
  try {
    // fixtures-contract: plane job-registrar
    w = world({ registerJob: (e) => (e.kind === "grade" ? { ok: false, reason: "JOB_KIND_UNKNOWN" } : e.kind === "safe_view" ? (() => { throw new Error("down"); })() : { ok: true, existed: false, state: "queued" }) });
    s = sha("refused one");
    ans = answer(w, s);
    s2 = sha("refused two");
    ans2 = answer(w, s2);
  } finally { console.log = log; }
  assert.equal(ans.ok, true);
  assert.equal(ans.queued, true, "the file is queued all the same");
  assert.deepEqual(ans.jobs, ["scan"]);
  assert.deepEqual(ans.jobs_refused, [{ kind: "grade", reason: "JOB_KIND_UNKNOWN" }, { kind: "safe_view", reason: "REGISTRAR_THREW" }]);
  assert.ok(lines.some((l) => l.file_safety === "job_not_registered" && l.sha === s.slice(0, 12) && l.refused.length === 2), "it is logged by name");
  assert.ok(ans2.jobs_refused.length === 2);
  assert.ok(w.row("SELECT 1 AS x FROM fs_files WHERE capture_sha = ?", s));
  /* none given */
  const n = world();
  const none = answer(n, sha("no registrar"));
  assert.deepEqual([none.ok, none.queued, none.registrar], [true, true, "absent"]);
  assert.ok(n.row("SELECT 1 AS x FROM fs_files WHERE capture_sha = ?", sha("no registrar")));
  assert.equal(enc("x").length, 1);
  assert.equal(typeof pdf, "function");
});
