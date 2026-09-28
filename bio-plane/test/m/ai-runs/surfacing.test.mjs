/* ai-runs R25–R27, R33: the surfacing step this module registers with promotion, and the question's `surfaced_in`. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, PROJ, ORG, T0, inquiryMd } from "./world.mjs";
import { SURFACE_RUN_CHECKS } from "../../../src/ai-runs/index.mjs";
import { AI_RUN_CHECKS } from "../../../src/airun.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";

const HIDDEN = "PROJ-2026-0009";
const Q = (n) => `INQ-2026-01${String(n).padStart(2, "0")}`;

async function surfWorld() {
  const w = world();
  await w.group("ann", "dan");
  w.bundle(INQ);
  w.project(HIDDEN, "ann");
  await w.runs.open(OPEN({ bounds: [{ bound: "surfaces", allowed: 2 }] }));
  await w.runs.open(OPEN({ run: "NOB" }));
  await w.runs.open(OPEN({ run: "ENDED", bounds: [{ bound: "surfaces", allowed: 2 }] }));
  await w.runs.close({ run: "ENDED", bound: "completed", viewer: "admin", caller: ORG });
  await w.runs.open(OPEN({ run: "RH", contextType: "project", contextId: HIDDEN, actor: "ann", viewer: "member:ann",
                           principalPlane: "member:ann/t1", bounds: [{ bound: "surfaces", allowed: 2 }] }));
  return w;
}
function refused(w, r, code, id) {
  assert.equal(r.ok, false, JSON.stringify(r));
  assert.deepEqual([r.code, r.reason], [code, code]);
  const row = SURFACE_RUN_CHECKS[code] || AI_RUN_CHECKS[code];
  assert.deepEqual([r.check, r.translation], [row.check, row.translation]);
  assert.equal(w.record.head(id), null, "the whole promotion refused");
}

test("R25: an assistant's creation of a question names a run — absent, invisible or unnamed C-66.1; then R5; not running C-66.2; no surfaces bound C-66.3; the bound reached C-66.4; each refuses the whole promotion", async () => {
  const w = await surfWorld();
  const before = w.dump();
  refused(w, w.surface(Q(1), { run: "" }), "SURFACE_NO_RUN", Q(1));
  refused(w, w.surface(Q(1), { run: "R404" }), "SURFACE_NO_RUN", Q(1));
  const hidden = w.surface(Q(1), { run: "RH", caller: "member:ann/t1", viewer: "member:dan" });
  refused(w, hidden, "SURFACE_NO_RUN", Q(1));
  assert.equal(hidden.translation, w.surface(Q(1), { run: "R404", viewer: "member:dan" }).translation);
  const np = w.surface(Q(1), { run: "R1", caller: "class:ai/someone-else" });
  refused(w, np, "AI_RUN_NOT_PRINCIPAL", Q(1));
  assert.match(np.detail, /^opening a question under a run/);
  refused(w, w.surface(Q(1), { run: "ENDED" }), "SURFACE_RUN_NOT_RUNNING", Q(1));
  refused(w, w.surface(Q(1), { run: "NOB" }), "SURFACE_NO_BOUND", Q(1));
  assert.equal(w.dump(), before, "no refusal spent a surface or wrote a row");
  assert.equal(w.surface(Q(1)).ok, true);
  assert.equal(w.surface(Q(2)).ok, true);
  const full = w.surface(Q(3));
  refused(w, full, "SURFACE_BOUND_REACHED", Q(3));
  assert.deepEqual([full.allowed, full.consumed], [2, 2]);
  /* a member's own creation, and a revision, are not asked */
  const member = w.promotion.promote({ bundleId: Q(4), base: null, files: [{ path: "bundle.md", text: inquiryMd(Q(4)) }], meta: {},
                                       snapKey: "m1", author: "member:dan" });
  assert.deepEqual([member.ok, "surfaced_in" in member], [true, false]);
  const head = w.record.head(Q(1));
  const rev = w.promotion.promote({ bundleId: Q(1), base: head.bundleSha, files: [{ path: "bundle.md", text: inquiryMd(Q(1)) + "\nMore.\n" }],
                                    meta: {}, snapKey: "r1", author: ORG, assistantPrincipal: ORG, run: "NOB", actorViewer: "admin" });
  assert.deepEqual([rev.ok, "surfaced_in" in rev], [true, false]);
});

test("R26: inside the promotion's transaction a surfacing row {bundle_id, run, principal, at} is written and surfaces consumed by one; the answer's surfaced_in carries the run, instant and bound", async () => {
  const w = await surfWorld();
  const r = w.surface(Q(1));
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.surfaced_in), ["run", "at", "bound"]);
  assert.deepEqual([r.surfaced_in.run, r.surfaced_in.bound], ["R1", { bound: "surfaces", allowed: 2, consumed: 1 }]);
  assert.ok(!Number.isNaN(Date.parse(r.surfaced_in.at)));
  assert.deepEqual(w.rows(`SELECT * FROM inquiry_run_surfacings`), [{ bundle_id: Q(1), run: "R1", principal: ORG, at: r.surfaced_in.at }]);
  assert.equal(w.runs.boundOf("R1", "surfaces").consumed, 1);
  /* one transaction: a promotion refused after this step's projection keeps neither the row nor the spend */
  w.promotion.registerStep("zz-late", { project: () => ({ ok: false, reason: "LATE_REFUSAL" }) });
  const late = w.surface(Q(2));
  assert.equal(late.reason, "LATE_REFUSAL");
  assert.equal(w.count("inquiry_run_surfacings"), 1);
  assert.equal(w.runs.boundOf("R1", "surfaces").consumed, 1);
  assert.equal(w.record.head(Q(2)), null);
});

test("R27: surfacedIn — no row is not recorded; a run the viewer cannot read says so; otherwise run, principal, instant, context, status and R20's block; retrieval's projection carries it", async () => {
  const w = await surfWorld();
  w.bundle(INQ.replace("0001", "0077"));
  assert.deepEqual(await w.runs.surfacedIn("INQ-2026-0077", "admin"), { recorded: false, stated: "not recorded", run: null, lens: null });
  w.surface(Q(1), { run: "RH", caller: "member:ann/t1", viewer: "member:ann" });
  const hidden = await w.runs.surfacedIn(Q(1), "member:dan");
  assert.deepEqual(hidden, { recorded: true, run: null, by: null, at: hidden.at, lens: null,
                             stated: "this question was opened inside a run this reader cannot read" });
  const seen = await w.runs.surfacedIn(Q(1), "member:ann");
  const read = (await w.runs.read({ run: "RH", viewer: "member:ann" })).session;
  assert.deepEqual(seen, { recorded: true, run: "RH", by: "member:ann/t1", at: hidden.at, context: read.context,
                           status: "running", lens: read.bias });
  const proj = await retrievalOf(w.ctx).projection({ bundleId: Q(1), viewer: "member:ann" });
  assert.deepEqual((proj.bundle ?? proj).surfaced_in ?? proj.surfaced_in, seen);
});

test("R33: the surfacing step names a running run whose principal is the caller, and the row records the caller's own stamp; a member's other credential is the same principal", async () => {
  const w = world();
  await w.group("ann", "bob");
  w.bundle(INQ);
  await w.runs.open(OPEN({ principalPlane: "member:ann/t1", actor: "ann", viewer: "member:ann", bounds: [{ bound: "surfaces", allowed: 3 }] }));
  assert.equal(w.surface(Q(1), { caller: "member:ann/t2", viewer: "member:ann" }).ok, true);
  assert.equal(w.surface(Q(2), { caller: "member:bob/t1", viewer: "member:bob" }).code, "AI_RUN_NOT_PRINCIPAL");
  assert.deepEqual(w.rows(`SELECT bundle_id, principal FROM inquiry_run_surfacings`), [{ bundle_id: Q(1), principal: "member:ann/t2" }]);
  void T0; void PROJ;
});
