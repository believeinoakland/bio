/* R42: this module's promotion step, exported whole (`promotionStep`), registered here as `plane` registers it, under
   this module's name at the rank `legacy-store`'s step had (after layer 10, before every module of layer 11 and `tasks`): the
   testimony slot's check and projection (provenance R52) and the sight index (D-497), each answer's keys and values as
   they were, and every step's checks and projections in their old order. The module after the step is the first of
   layer 11 in `build/modules.json`, read there, never a fixed name (N548). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { record, STEP_ORDER, FIRST_LATER } from "./record.mjs";
import { promotionStep } from "../../../src/control-plane/step.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const projMd = (title) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
  "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  `objective: "Find out what happened."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");

const one = (x, q, ...a) => [...x.ctx.storage.sql.exec(q, ...a)][0];

/* A record with its group recorded and members alice and bob; the step registered unless `step: false`. */
async function world(opts = { step: true }) {
  const x = await record(opts);
  instanceSetupOf(x.ctx).instanceGroupSeed({ slug: "oak-watch", author: "admin" });
  for (const m of ["alice", "bob"])
    x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                            VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, m, `Cover ${m}`, `h_${m}`);
  return x;
}
const createProject = (x, title = "Budget watch", snapKey = "k1") => x.promotion.promote({ base: null, snapKey,
  author: "member:alice", ownerMemberId: "alice", files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
const testify = (x, words) => x.go("testify?author=member:alice", "POST", { words, observedAt: "2026-09-01" });

test("R42: the rank: after every module of layers 1-10 (monitoring's included), before tasks' and every later module's", () => {
  const layers = JSON.parse(readFileSync(new URL("../../../../build/modules.json", import.meta.url), "utf8"));
  const mods = layers.modules || layers;
  const at = STEP_ORDER.indexOf("control-plane");
  assert.ok(at > 0);
  assert.equal(STEP_ORDER.filter((m) => m === "control-plane").length, 1);
  for (const m of mods) {
    if (m.id === "control-plane" || !STEP_ORDER.includes(m.id)) continue;
    if (m.layer <= 10) assert.ok(STEP_ORDER.indexOf(m.id) < at, `${m.id} (layer ${m.layer}) ranks before the step`);
    else assert.ok(STEP_ORDER.indexOf(m.id) > at, `${m.id} (layer ${m.layer}) ranks after the step`);
  }
  assert.ok(STEP_ORDER.indexOf("monitoring") < at && at < STEP_ORDER.indexOf("tasks"));
  /* the module directly after the step is the first module of layer 11 in build/modules.json, whichever it is (N548) */
  const firstLater = mods.find((m) => m.layer > 10 && m.id !== "control-plane");
  assert.ok(firstLater && STEP_ORDER.includes(firstLater.id), "a layer-11 module follows the step");
  assert.equal(firstLater.id, FIRST_LATER);
  assert.equal(STEP_ORDER[at + 1], firstLater.id);
  assert.equal(STEP_ORDER[at - 1], [...mods].reverse().find((m) => m.layer <= 10 && STEP_ORDER.includes(m.id)).id,
               "the module directly before the step is the last of layers 1-10");
});

test("R42: the step is a {check, project} pair of functions and registers nothing itself", async () => {
  const x = await world({ step: false });
  const s = promotionStep(x.ctx);
  assert.deepEqual(Object.keys(s).sort(), ["check", "project"]);
  assert.equal(typeof s.check, "function");
  assert.equal(typeof s.project, "function");
  /* nothing was registered under this module's name: the composition root's registration is accepted */
  const r = x.promotion.registerStep("control-plane", s);
  assert.notEqual(r && r.ok, false, JSON.stringify(r));
});

test("R42: a project's creation answers its visibility read back and gains its sight row; a revision answers neither visibility nor testimony", async () => {
  const x = await world();
  const created = createProject(x);
  assert.equal(created.ok, true, JSON.stringify(created));
  assert.deepEqual(Object.keys(created).sort(), ["bundleId", "bundleSha", "ok", "owner", "rowVersion", "visibility"]);
  assert.equal(created.visibility, "hidden");
  assert.equal(created.owner, "alice");
  assert.equal(created.rowVersion, 1);
  const P = created.bundleId;
  assert.equal(created.bundleSha, one(x, `SELECT bundle_sha FROM bundles WHERE bundle_id = ?`, P).bundle_sha);
  assert.equal(one(x, `SELECT count(*) c FROM project_sight WHERE project_id = ?`, P).c, 1, "the sight index follows the bundle");
  const idLine = recordOf(x.ctx).readFile(P, "bundle.md").text.split("\n").find((l) => l.startsWith("id:"));
  const rev = x.promotion.promote({ bundleId: P, base: created.bundleSha, snapKey: "k2", author: "member:alice",
    files: [{ path: "bundle.md", text: projMd("Budget watch, renamed").replace("---\n", `---\n${idLine}\n`) }],
    meta: { object_type: "project" } });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.equal(rev.rowVersion, 2);
  assert.equal(Object.hasOwn(rev, "visibility"), false);
  assert.equal(Object.hasOwn(rev, "testimony"), false, "no other path's answer gains the testimony key");
  assert.equal(one(x, `SELECT count(*) c FROM project_sight WHERE project_id = ?`, P).c, 1, "a revision recomputes the same row");
});

test("R42: the sight index is the step's: a sight row lost is re-derived by the next promotion only with the step registered", async () => {
  for (const step of [true, false]) {
    const x = await world({ step });
    const created = createProject(x);
    assert.equal(created.ok, true, JSON.stringify(created));
    const P = created.bundleId;
    x.ctx.storage.sql.exec(`DELETE FROM project_sight WHERE project_id = ?`, P);
    const idLine = recordOf(x.ctx).readFile(P, "bundle.md").text.split("\n").find((l) => l.startsWith("id:"));
    const rev = x.promotion.promote({ bundleId: P, base: created.bundleSha, snapKey: "k2", author: "member:alice",
      files: [{ path: "bundle.md", text: projMd("Budget watch, again").replace("---\n", `---\n${idLine}\n`) }],
      meta: { object_type: "project" } });
    assert.equal(rev.ok, true, JSON.stringify(rev));
    assert.equal(one(x, `SELECT count(*) c FROM project_sight WHERE project_id = ?`, P).c, step ? 1 : 0,
                 step ? "the step re-derives the row" : "negative control: without the step nothing re-derives it");
  }
});

test("R42: op=testify's answer carries the testimony slot's work, done inside its promotion; a refused testimony writes nothing", async () => {
  const x = await world();
  const r = await testify(x, "The gate on the north side was chained shut.");
  assert.equal(r.json.ok, true, JSON.stringify(r.json));
  const out = r.json.result;
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.match(String(out.content_id), /^[0-9a-f]{64}$/, "the content row the slot minted");
  const row = [...x.ctx.storage.sql.exec(`SELECT bundle_id, capture_sha FROM content WHERE content_id = ?`, out.content_id)].map((o) => ({ ...o }));
  assert.deepEqual(row, [{ bundle_id: out.bundle_id, capture_sha: out.capture_sha }]);
  const before = one(x, `SELECT count(*) c FROM content`).c, bundles = one(x, `SELECT count(*) c FROM bundles`).c;
  const bad = (await testify(x, "")).json;
  assert.equal((bad.result ?? bad).ok, false);
  assert.equal(one(x, `SELECT count(*) c FROM content`).c, before);
  assert.equal(one(x, `SELECT count(*) c FROM bundles`).c, bundles);
});

test("R42: negative control: without the step, a testimony's promotion carries no testimony work", async () => {
  const x = await world({ step: false });
  const out = (await testify(x, "The gate on the north side was chained shut.")).json;
  const r = out.result ?? out;
  assert.equal(Object.hasOwn(r, "content_id") && /^[0-9a-f]{64}$/.test(String(r.content_id)), false, JSON.stringify(r));
});

test("R42: the testimony slot's check refusal refuses the promotion, and its projection refusal rolls the whole promotion back; nothing is written", async () => {
  for (const which of ["check", "project"]) {
    const x = await world();
    const { provenanceOf } = await import("../../../src/provenance/index.mjs");
    const reg = provenanceOf(x.ctx).onTestimony("probe-refuser", { [which]: () => ({ ok: false, reason: "PROBE_REFUSED" }) });
    assert.equal(reg.ok, true, JSON.stringify(reg));
    const counts = () => ["bundles", "content", "files", "history"].map((t) => one(x, `SELECT count(*) c FROM ${t}`).c);
    const before = counts();
    const r = (await testify(x, "The gate on the north side was chained shut.")).json;
    const out = r.result ?? r;
    assert.equal(out.ok, false, `${which}: ${JSON.stringify(r)}`);
    if (which === "check") assert.equal(out.reason, "PROBE_REFUSED");
    assert.deepEqual(counts(), before, `${which}: nothing of the promotion was written`);
  }
  /* off the testimony path the slot answers nothing, so a refusing slot participant is never asked */
  const y = await world({ step: false });
  const { provenanceOf } = await import("../../../src/provenance/index.mjs");
  provenanceOf(y.ctx).onTestimony("probe-refuser", { project: () => ({ ok: false, reason: "PROBE_REFUSED" }) });
  y.ctx.storage.sql.exec(`DELETE FROM project_sight`);
  const created = createProject(y);
  assert.equal(promotionStep(y.ctx).project({ bundleId: created.bundleId, pkg: {}, state: {} }), null, "a promotion off the testimony path: no testimony key, nothing thrown");
});

test("R42: probe steps on either side see today's order: every check before the write, then every projection, in rank; a refusal ahead of the step stops its check", async () => {
  const at = STEP_ORDER.indexOf("control-plane");
  const before = STEP_ORDER[at - 1], after = STEP_ORDER[at + 1];
  const log = [];
  const wrap = (name, s) => ({ check: (c) => { log.push(`${name}.check`); return s.check ? s.check(c) : null; },
                               project: (c) => { log.push(`${name}.project`); return s.project ? s.project(c) : null; } });
  let refuseBefore = false, x = null;
  const seen = {};
  const sight = (c) => one(x, `SELECT count(*) c FROM project_sight WHERE project_id = ?`, c.bundleId).c;
  const holder = {};
  const late = { check: (c) => holder.step.check(c), project: (c) => holder.step.project(c) };
  x = await world({ step: wrap("control-plane", late), probes: {
    [after]: wrap(after, { project: (c) => { seen.after = sight(c); return null; } }),
    [before]: wrap(before, { check: () => (refuseBefore ? { ok: false, reason: "PROBE_REFUSED" } : null),
                             project: (c) => { seen.before = sight(c); x.ctx.storage.sql.exec(`DELETE FROM project_sight`); return null; } }),
  } });
  holder.step = promotionStep(x.ctx);
  const created = createProject(x);
  assert.equal(created.ok, true, JSON.stringify(created));
  assert.deepEqual(log, [`${before}.check`, "control-plane.check", `${after}.check`,
                         `${before}.project`, "control-plane.project", `${after}.project`]);
  assert.equal(seen.after, 1, "the step after sees the sight row the step re-derived");
  log.length = 0;
  refuseBefore = true;
  const refused = createProject(x, "Refused first", "k9");
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "PROBE_REFUSED");
  assert.deepEqual(log, [`${before}.check`], "a refusal ahead of the step: its check never runs");
});
