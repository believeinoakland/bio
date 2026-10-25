/* monitoring R70 (K2524; investigation R18): a watched project's sources. Driven at monitoring's interface over the
   real investigation module (K874), reached as production reaches it (`investigationOf` on the same host, the one per
   storage). intent's answers are the real intent's, from the published `watchSetOf` fixture (follow-up 27): each project
   of this world is the project the fixture made for its name (`bind`), so a test states what each one's objective reads.
   investigation's own reads of steps and questions stand in at their interfaces, so a test states exactly when the
   project's work is quiet. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, DAEMON, V, NOW, sha } from "./fixture.mjs";
import { watchSetOf } from "../intent/fixtures.mjs";
import { investigationOf } from "../../../src/investigation/index.mjs";
import { normalizeAddress } from "../../../src/subresources.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const LA = "https://records.example.org/agenda.txt";
const LB = "https://records.example.org/budget.txt";
const LC = "https://records.example.org/contract.txt";
const tick = (w, id) => w.m.monitor({ bundleId: id, viewer: DAEMON, actorClass: "machine", actor: DAEMON });
const receipt = (w, addr, cap) => w.prov.recordReceipt({ address: addr, addressNorm: normalizeAddress(addr), captureSha: cap,
  retrieved: NOW, via: "direct", retrievalLocator: addr, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });

/* intent as this world reaches it: the fixture's real intent, asked about the project the fixture made for each name this
   world binds. `unreadable` is the set of this world's projects whose watch set cannot be read; `calls` records each
   watch-set question as this world asks it (its own project id, its cursor). */
function intentFor(f) {
  const names = new Map(), unreadable = new Set(), calls = [];
  const own = (id) => (names.has(id) ? f.projects[names.get(id)] : id);
  return {
    calls, unreadable, sources: f.sources,
    bind(project, name) { names.set(project, name); },
    watchSet(q = {}) {
      calls.push({ project: q.project, after: q.after ?? null });
      if (unreadable.has(q.project)) throw new Error("intent unreadable");
      return f.intent.watchSet({ ...q, project: own(q.project) });
    },
    gaps: (q) => f.intent.gaps({ ...q, project: own(q.project) }),
    progress: (q) => f.intent.progress({ ...q, project: own(q.project) }),
    registerSource: (kind, reader) => f.intent.registerSource(kind, reader),
  };
}

/* A project document the record holds, owned by Carol, so its close is a revision through promotion. The intent name is
   the title, which the held watch sets of `watchWorld` are keyed by. */
function project(w, title) {
  const md = ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${NOW}"`, "group: test-group", "objective: Know whether the award was proper",
    "references: []", "state_history: []", "---", "", "## Objective", "", "Know whether the award was proper.", "", "## Session Log", ""].join("\n");
  const made = w.promotion.promote({ base: null, snapKey: `k-${title.replace(/\W/g, "")}`, author: V("carol"), meta: { object_type: "project" },
                                     files: [{ path: "bundle.md", text: md }] });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  w.st.sql.exec(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, 'discoverable')`, made.bundleId);
  w.inProject(made.bundleId, { owner: "carol" });
  w.intent.bind(made.bundleId, title);
  return made.bundleId;
}

/* The world: the real investigation, its steps (one ended step per project, more as a test adds them), no questions,
   and intent for the projects `held` names (keyed by title, each watching the digests it lists). */
async function watchWorld(held) {
  const f = await watchSetOf(held, { page: 2 });
  const w = world({ intent: intentFor(f) });
  for (const m of ["carol"])
    w.st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, created, updated) VALUES (?, 'c', ?, 'member', 'active', '2026-01-01', '2026-01-01')`, m, `${m}-h`);
  w.stepsOf = new Map();
  const steps = {
    stepsIn: ({ project }) => ({ ok: true, steps: w.stepsOf.get(project) ?? [{ step: `STEP-${project}`, state: "ended", at: "2026-09-01T00:00:00Z" }], truncated: false }),
    stepsOn: () => ({ ok: true, steps: [], truncated: false }),
  };
  w.inv = investigationOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, intent: w.intent, steps,
    basisVersions: { projectQuestions: () => ({ items: [], cursor: null }), conclusionRecordOf: () => ({ history: [], stance: null }) },
    inquiry: { questionWaits: () => ({ ok: true, waits: [] }), documentWaits: () => ({ ok: true, questions: [] }) },
    captureRequests: { captureRequests: () => ({ requests: [] }) },
    view: () => ({ time_zone: { value: "America/Los_Angeles" } }), now: () => new Date(w.clock.ms).toISOString() });
  w.arrivals = () => w.rows(`SELECT project_id, source, arrived_at FROM inv_watch_arrivals ORDER BY seq`);
  return w;
}

test("R70: a change tick on a source a watched project's intent R7 names is reported once through investigation.watchArrival, and reopens its work; an unwatched project's source and a look that records no change report nothing; a project no longer watched is no longer reported", async () => {
  const w = await watchWorld({ Watched: ["0".repeat(64), "1".repeat(64), sha("agenda v1")], "Not watched": [sha("budget v1")] });
  const P1 = project(w, "Watched"), P2 = project(w, "Not watched");
  const a = w.monitored("INFO-2026-0001-agenda", LA, "agenda v1", { freq: "daily" });
  w.monitored("INFO-2026-0002-budget", LB, "budget v1", { freq: "daily" });
  /* P1's condition reads the agenda's capture (twice over: its register and its address), P2's the budget's; pages of two */
  receipt(w, LA, a.cap);
  assert.equal(w.inv.projectWatch({ project: P1, by: V("carol") }).ok, true);
  assert.deepEqual(w.inv.watchedProjects().projects.map((p) => p.project), [P1]);

  /* the negative controls: a look that records no change on the watched source reports nothing */
  w.net.routes[LA] = serve("agenda v1");
  const same = await tick(w, "INFO-2026-0001-agenda");
  assert.deepEqual([same.body.status, same.body.observation.state, same.body.arrivals], ["unchanged", "PRESENT", null]);
  assert.deepEqual(w.arrivals(), []);
  /* a change on the source only an unwatched project names reports nothing, and investigation is not asked */
  w.net.routes[LB] = serve("budget v2");
  const other = await tick(w, "INFO-2026-0002-budget");
  assert.deepEqual([other.body.status, other.body.observation.written], ["modified", true]);
  assert.deepEqual(other.body.arrivals, { reported: [], failed: [] });
  assert.deepEqual(w.arrivals(), []);
  /* a gone source and an unreachable one record no change: nothing reported */
  w.clock.ms += 1000;
  w.net.routes[LA] = serve("gone", "text/plain", 410);
  assert.deepEqual([(await tick(w, "INFO-2026-0001-agenda")).body.status, w.arrivals().length], ["removed", 0]);
  w.net.routes[LA] = new Error("connection reset");
  assert.equal((await tick(w, "INFO-2026-0001-agenda")).body.arrivals, null);
  /* a governed look is no check of the source: refused HOST_COOLING_OFF, nothing reported */
  w.gov.refuse.push("records.example.org");
  w.net.routes[LA] = serve("agenda v9");
  assert.equal((await tick(w, "INFO-2026-0001-agenda")).body.reason, "HOST_COOLING_OFF");
  w.gov.refuse.length = 0;
  assert.deepEqual(w.arrivals(), []);
  assert.equal(w.inv.quietState({ project: P1, viewer: V("carol") }).quiet, true);

  /* the change tick on the watched source: one arrival, the address as its source, the tick's instant as its at */
  w.clock.ms += 1000;
  w.net.routes[LA] = serve("agenda v2");
  const changed = await tick(w, "INFO-2026-0001-agenda");
  assert.deepEqual([changed.body.status, changed.body.observation.written], ["modified", true]);
  const at = changed.body.checked;
  assert.deepEqual(changed.body.arrivals, { reported: [{ project: P1, source: normalizeAddress(LA), at }], failed: [] });
  assert.deepEqual(w.arrivals(), [{ project_id: P1, source: normalizeAddress(LA), arrived_at: at }], "once for that look");
  const q = w.inv.quietState({ project: P1, viewer: V("carol") });
  assert.deepEqual([q.quiet, q.why], [false, word("investigation.why.something_arrived_watched")], "the project's work reads reopened");
  /* a caller who may not see the project is not told of it, and it is reported all the same */
  w.st.sql.exec(`UPDATE project_sight SET setting = 'hidden' WHERE project_id = ?`, P1);
  w.clock.ms += 1000;
  w.net.routes[LA] = serve("agenda v2b");
  const unseen = await w.m.monitor({ bundleId: "INFO-2026-0001-agenda", viewer: V("dave"), actorClass: "member", actor: V("dave") });
  assert.equal(w.membership.inSight(P1, V("dave")), false);
  assert.deepEqual([unseen.body.status, unseen.body.arrivals], ["modified", { reported: [], failed: [] }]);
  assert.equal(w.arrivals().length, 2, "reported to the hidden project all the same");
  w.st.sql.exec(`UPDATE project_sight SET setting = 'discoverable' WHERE project_id = ?`, P1);
  /* monitoring decided nothing about the change: the tick's own record is R8's flag, as on any change */
  assert.equal(w.fm("INFO-2026-0001-agenda").reeval_pending.flag, true);

  /* the members take it up, the work goes quiet again, and they close the project: no longer watched */
  w.stepsOf.set(P1, [{ step: "STEP-x", state: "ended", at: "2099-01-01T00:00:00Z" }]);
  assert.equal(w.inv.quietState({ project: P1, viewer: V("carol") }).quiet, true);
  const closed = w.inv.projectCloseWithGaps({ project: P1, reason: "abandoned", by: V("carol") });
  assert.equal(closed.ok, true, JSON.stringify(closed).slice(0, 400));
  assert.deepEqual(w.inv.watchedProjects().projects, []);
  w.clock.ms += 1000;
  w.net.routes[LA] = serve("agenda v3");
  const after = await tick(w, "INFO-2026-0001-agenda");
  assert.deepEqual([after.body.status, after.body.arrivals], ["modified", { reported: [], failed: [] }]);
  assert.equal(w.arrivals().length, 2, "a project no longer watched is no longer reported");
});

test("R70: such a source is found by a capture filed at the tick's address as well as by the document's own register, followed through intent R7's cursor to the end; each watched project naming it is told once; a refusal or an unreadable watch fails no tick", async () => {
  /* the older capture at the address is the greatest of P1's digests, so it is on P1's last page */
  const OLD = "contract v0";
  const w = await watchWorld({ "By address": ["0".repeat(64), "0".repeat(63) + "1", "0".repeat(63) + "2", "0".repeat(63) + "3", sha(OLD)],
                               "By register": [sha("contract v1")], Unrelated: ["4".repeat(64)], Empty: [] });
  const P1 = project(w, "By address"), P3 = project(w, "By register");
  /* an older capture at the address, held by another (unmonitored) document: P1 names only it, at the end of its pages */
  const old = w.monitored("INFO-2026-0003-old", LC, OLD, { enabled: false });
  receipt(w, LC, old.cap);
  w.monitored("INFO-2026-0004-contract", LC, "contract v1", { freq: "weekly" });
  for (const p of [P1, P3]) assert.equal(w.inv.projectWatch({ project: p, by: V("carol") }).ok, true);
  w.net.routes[LC] = serve("contract v2");
  const r = await tick(w, "INFO-2026-0004-contract");
  assert.equal(r.body.status, "modified");
  assert.deepEqual(r.body.arrivals.reported.map((x) => x.project).sort(), [P1, P3].sort());
  assert.deepEqual(w.arrivals().map((x) => x.project_id).sort(), [P1, P3].sort());
  assert.ok(w.intent.calls.filter((x) => x.project === P1).length >= 3, "P1's watch set followed by its cursor");

  /* a watch set that cannot be read is stated per project, and the tick still records */
  w.intent.unreadable.add(P3);
  w.clock.ms += 1000;
  w.net.routes[LC] = serve("contract v3");
  const r2 = await tick(w, "INFO-2026-0004-contract");
  assert.equal(r2.body.ok, true);
  assert.deepEqual(r2.body.arrivals.failed, [{ project: P3, reason: "the sources intent R7 names for it could not be read" }]);
  assert.deepEqual(r2.body.arrivals.reported.map((x) => x.project), [P1]);
  w.intent.unreadable.delete(P3);
  /* investigation's refusal is carried as its code, and the tick still records */
  const inv = w.m.investigation;
  const watchArrival = inv.watchArrival;
  inv.watchArrival = () => ({ ok: false, code: "ARRIVAL_BAD" });
  w.clock.ms += 1000;
  w.net.routes[LC] = serve("contract v4");
  const r3 = await tick(w, "INFO-2026-0004-contract");
  assert.equal(r3.body.ok, true);
  assert.deepEqual(r3.body.arrivals.failed.map((x) => x.reason), ["ARRIVAL_BAD", "ARRIVAL_BAD"]);
  /* and one that throws is carried as what it said, the tick still recorded */
  inv.watchArrival = () => { throw new Error("investigation unavailable"); };
  w.clock.ms += 1000;
  w.net.routes[LC] = serve("contract v5");
  const r4 = await tick(w, "INFO-2026-0004-contract");
  inv.watchArrival = watchArrival;
  assert.deepEqual([r4.body.ok, r4.body.status], [true, "modified"]);
  assert.deepEqual(r4.body.arrivals.failed.map((x) => x.reason), ["investigation unavailable", "investigation unavailable"]);
  assert.equal(w.arrivals().length, 3, "two at the first tick, P1's at the second; neither the refusal nor the throw recorded one");
  /* a capture neither held by the ticked document nor filed at its address is not its source */
  w.intent.bind(P1, "Unrelated");
  w.intent.bind(P3, "Empty");
  w.clock.ms += 1000;
  w.net.routes[LC] = serve("contract v6");
  const r5 = await tick(w, "INFO-2026-0004-contract");
  assert.deepEqual(r5.body.arrivals, { reported: [], failed: [] });
});

test("R70 R36: the cadence tick's change ticks report as a caller's op=monitor does, the watched source checked at its own cadence; a watched source that does not ask to be monitored is never fetched (R33's proposal stands)", async () => {
  const w = await watchWorld({ Cadence: [sha("agenda v1"), sha("budget v1")] });
  const P1 = project(w, "Cadence");
  w.monitored("INFO-2026-0005-agenda", LA, "agenda v1", { freq: "daily" });
  w.monitored("INFO-2026-0006-unwatched", LB, "budget v1", { enabled: false });
  assert.equal(w.inv.projectWatch({ project: P1, by: V("carol") }).ok, true);
  w.net.routes[LA] = serve("agenda v2");
  const t = await w.m.cadenceTick(w.clock.ms);
  assert.deepEqual(t.ticked.map((x) => [x.bundle, x.frequency, x.status]), [["INFO-2026-0005-agenda", "daily", "modified"]]);
  assert.deepEqual(w.arrivals().map((x) => x.project_id), [P1]);
  assert.equal(w.net.seen.includes(LB), false, "watching adds no monitoring of an unmonitored source");
  assert.deepEqual(w.m.watched({ project: P1 }).captures.map((c) => [c.bundle, c.monitored]).sort(),
                   [["INFO-2026-0005-agenda", true], ["INFO-2026-0006-unwatched", false]]);
  assert.deepEqual(w.m.proposals({ project: P1, viewer: DAEMON }).map((x) => x.basis.bundle), ["INFO-2026-0006-unwatched"]);
  /* not due again within its day: nothing fetched, nothing reported */
  w.clock.ms += 3600000;
  const t2 = await w.m.cadenceTick(w.clock.ms);
  assert.deepEqual([t2.ticked.length, w.arrivals().length], [0, 1]);
});
