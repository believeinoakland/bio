/* link-sweep R13, R14, R15 (T51; K4189, K4168; UC-034, UC-035): a member's doors to define and to ratify a sweep, driven as the
   door drives them (the ops map with `url` and `body`, the control plane's stamps in the address), over the real record,
   promotion and monitoring, whose `write` (its R77) is the one writer of the file. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { listWorld, sweepDef, NOW_MS, SEED, U, page, site, filedBundles } from "./fixture.mjs";
import { linkSweepOps, DECLARED_OPS, SWEEP_CHECKS, RATIFY_NOTICE } from "../../../src/link-sweep/index.mjs";

const PROJ = "PROJ-2026-0990-write";
const LIST = "INFO-2026-0990-list";
const FIELDS = { title: "Council minutes", sources: ["https://records.example.org/council"], seeds: [SEED], match: { terms: ["minutes"] },
                 cadence: "weekly", budget: { per_run: 10, backlog: 20 } };

/* the op as the door runs it: the stamps in the address, the fields as the body */
const door = (w, op, body, { author = "member:alice", viewer = author } = {}) => {
  const q = new URLSearchParams({ op, ...(author ? { author } : {}), ...(viewer ? { viewer } : {}) });
  return linkSweepOps(w.s, new URL("http://do/?" + q), body)[op]();
};
const fileOf = (w) => { const f = w.record.readFile(LIST, "data/gathering.json"); return f ? (typeof f === "string" ? f : f.text) : null; };
const world = (sweeps = [], daemon = undefined) => listWorld({ list: LIST, project: PROJ, sweeps, daemon });

test("R13 sweepset adds a sweep: its id minted from the title in R1's form, unique, written ratified: false, R1's fields only, and it is never due (R4)", async () => {
  const { w } = world();
  const a = await door(w, "sweepset", { bundle: LIST, ...FIELDS, ratified: true, id: "forced", extra: "x" });
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.sweep, `${LIST}#council-minutes`);
  assert.equal(a.ratified, false, "written unratified, whatever the body says");
  const f = JSON.parse(fileOf(w));
  assert.deepEqual(f.sweeps, [{ id: "council-minutes", title: "Council minutes", ratified: false, ...Object.fromEntries(Object.entries(FIELDS).filter(([k]) => k !== "title")) }]);
  assert.equal(w.manifest(LIST).at(-1).author, "member:alice", "authored by the member, never mechanical");
  /* a second sweep of the same title is a second id; the first is byte-identical */
  const first = JSON.stringify(f.sweeps[0]);
  const b = await door(w, "sweepset", { bundle: LIST, ...FIELDS });
  assert.equal(b.sweep, `${LIST}#council-minutes-2`);
  assert.equal(JSON.stringify(JSON.parse(fileOf(w)).sweeps[0]), first);
  /* R4: never due while unratified */
  assert.equal(w.s.sweepDue(NOW_MS), null);
  assert.equal(w.s.sweepWake(NOW_MS), null);
  const read = w.s.sweeps({ viewer: "member:alice" }).sweeps;
  assert.deepEqual(read.map((x) => [x.sweep, x.ratified, x.due]), [[`${LIST}#council-minutes`, false, false], [`${LIST}#council-minutes-2`, false, false]]);
  /* it fetches nothing */
  const calls = site(w, {});
  const t = await w.s.sweepTick(NOW_MS);
  assert.deepEqual([t.ran.length, calls.length], [0, 0]);
});

test("R13 sweepset with sweep changes one and leaves ratified as it is; the other sweeps and the daemon block survive byte for byte", async () => {
  const { w } = world([sweepDef({ id: "minutes", ratified: false }), sweepDef({ id: "agendas", ratified: false })], { enabled: true, sweep_budget: 7 });
  const before = JSON.parse(fileOf(w));
  const r = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#minutes`, ...FIELDS, title: "Minutes, retitled", cadence: "daily" });
  assert.equal(r.ok, true, JSON.stringify(r));
  const after = JSON.parse(fileOf(w));
  assert.deepEqual(after.sweeps[0], { ...before.sweeps[0], ...FIELDS, title: "Minutes, retitled", cadence: "daily", ratified: false });
  assert.equal(JSON.stringify(after.sweeps[1]), JSON.stringify(before.sweeps[1]));
  assert.deepEqual(after.daemon, before.daemon);
  /* an owner changing a ratified sweep leaves it ratified (R3: it re-ratifies) */
  await door(w, "sweepratify", { sweep: `${LIST}#agendas`, ratified: true });
  const c = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#agendas`, ...FIELDS, cadence: "monthly" });
  assert.equal(c.ok, true, JSON.stringify(c));
  assert.equal(c.ratified, true);
  assert.equal(JSON.parse(fileOf(w)).sweeps[1].cadence, "monthly");
});

test("R13 each refusal in its order, writing nothing: MACHINE_CANNOT_SET_SWEEP, ABSENT, NO_SUCH_SWEEP, then the grammar, the term check and the fence relayed", async () => {
  const { w } = world([sweepDef({ id: "minutes", ratified: false }), sweepDef({ id: "agendas", ratified: true })]);
  let held = fileOf(w), n = w.manifest(LIST).length;
  const nothing = () => assert.deepEqual([fileOf(w), w.manifest(LIST).length], [held, n], "file and history unchanged");
  /* 1: a machine or a nameless author */
  for (const author of ["class:daemon", "", null, "class:admin"]) {
    const r = await door(w, "sweepset", { bundle: LIST, ...FIELDS }, { author, viewer: "member:alice" });
    assert.deepEqual([r.ok, r.code], [false, "MACHINE_CANNOT_SET_SWEEP"], String(author));
    assert.equal(r.check, SWEEP_CHECKS.MACHINE_CANNOT_SET_SWEEP.check);
    assert.equal(r.translation, SWEEP_CHECKS.MACHINE_CANNOT_SET_SWEEP.translation);
  }
  nothing();
  /* control: the same call by a member is not refused as a machine's */
  assert.equal((await door(w, "sweepset", { bundle: LIST, ...FIELDS })).ok, true);
  held = fileOf(w); n = w.manifest(LIST).length;
  /* 2: a bundle absent, or unseen by the viewer, identically */
  const absent = await door(w, "sweepset", { bundle: "INFO-2026-0990-none", ...FIELDS });
  const unseen = await door(w, "sweepset", { bundle: LIST, ...FIELDS }, { author: "member:alice", viewer: "member:nobody" });
  assert.deepEqual([absent.ok, absent.reason, unseen.ok, unseen.reason], [false, "ABSENT", false, "ABSENT"]);
  assert.equal(JSON.stringify({ ...unseen, bundle: 0 }), JSON.stringify({ ...absent, bundle: 0 }), "the same answer");
  /* 3: a sweep the file lacks */
  const no = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#nothing`, ...FIELDS });
  assert.deepEqual([no.ok, no.reason], [false, "NO_SUCH_SWEEP"]);
  /* 4: R1's and R2's findings, monitoring R27's refusal relayed */
  const g = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#minutes`, ...FIELDS, cadence: "hourly", budget: { per_run: 0, backlog: 1 } });
  assert.deepEqual([g.ok, g.code], [false, "GATHERING_REFUSED"]);
  assert.ok(g.findings.some((x) => /\bcadence\b/.test(x.detail)) && g.findings.some((x) => /\bbudget\b/.test(x.detail)));
  const t = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#minutes`, ...FIELDS, match: { terms: ["/(a)\\1/"] } });
  assert.deepEqual([t.ok, t.code], [false, "SWEEP_TERM_REFUSED"]);
  const miss = await door(w, "sweepset", { bundle: LIST, ...FIELDS, title: undefined });
  assert.deepEqual([miss.ok, miss.code], [false, "GATHERING_REFUSED"]);
  assert.ok(miss.findings.some((x) => /\btitle is missing/.test(x.detail)));
  nothing();
  /* 5: R3's fence relayed: a non-owner changing a ratified sweep (control: the same member may change an unratified one) */
  const own = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#agendas`, ...FIELDS, cadence: "monthly" }, { author: "member:bob" });
  assert.deepEqual([own.ok, own.code], [false, "SWEEP_RATIFY_NOT_AN_OWNER"]);
  nothing();
  const ok = await door(w, "sweepset", { bundle: LIST, sweep: `${LIST}#minutes`, ...FIELDS, cadence: "monthly" }, { author: "member:bob" });
  assert.equal(ok.ok, true, JSON.stringify(ok));
});

test("R13 R14 a bundle in no project has no owner: an unratified sweep is added, and ratifying it is refused by the fence, relayed", async () => {
  const none = "INFO-2026-0991-none";
  const { w } = listWorld({ list: none, project: null, sweeps: [sweepDef({ id: "minutes", ratified: false })] });
  const a = await door(w, "sweepset", { bundle: none, ...FIELDS });
  assert.equal(a.ok, true, JSON.stringify(a));
  const r = await door(w, "sweepratify", { sweep: `${none}#minutes`, ratified: true });
  assert.deepEqual([r.ok, r.code], [false, "SWEEP_RATIFY_NOT_AN_OWNER"]);
});

test("R14 sweepratify: the owner ratifies, the sweep is due at the next tick (R4) and files at collected (R7); the answer carries who, when, due and next", async () => {
  const { w } = world([sweepDef({ id: "minutes", ratified: false })]);
  const name = `${LIST}#minutes`;
  assert.equal(w.s.sweepDue(NOW_MS), null);
  const r = await door(w, "sweepratify", { sweep: name, ratified: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.sweep, r.ratified, r.ratified_by, r.due], [name, true, "member:alice", true]);
  assert.match(String(r.ratified_at), /^\d{4}-\d\d-\d\dT/);
  assert.ok("next" in r);
  assert.equal(JSON.parse(fileOf(w)).sweeps[0].ratified, true);
  assert.equal(w.s.sweepDue(NOW_MS), NOW_MS);
  site(w, { [SEED]: { body: page([[U("m/1.html"), "Minutes one"]]) }, [U("m/1.html")]: { body: "<html>one</html>" } });
  const t = await w.s.sweepTick(NOW_MS);
  assert.deepEqual(t.ran.map((x) => [x.sweep, x.filed]), [[name, 1]]);
  assert.deepEqual(filedBundles(w).map((f) => [f.current_state, f.project]), [["collected", PROJ]]);
});

test("R14 sweepratify refusals in order, writing nothing: MACHINE_CANNOT_SET_SWEEP, ABSENT, NO_SUCH_SWEEP, the fence; a non-owner member is refused to ratify while any writer stops it; already in the asked state is {ok, existed}", async () => {
  const { w } = world([sweepDef({ id: "minutes", ratified: false }), sweepDef({ id: "agendas", ratified: true })]);
  const name = (id) => `${LIST}#${id}`;
  const held = fileOf(w), n = w.manifest(LIST).length;
  const nothing = () => assert.deepEqual([fileOf(w), w.manifest(LIST).length], [held, n]);
  const m = await door(w, "sweepratify", { sweep: name("minutes"), ratified: true }, { author: "class:daemon", viewer: "member:alice" });
  assert.deepEqual([m.ok, m.code], [false, "MACHINE_CANNOT_SET_SWEEP"]);
  const abs = await door(w, "sweepratify", { sweep: "INFO-2026-0990-none#minutes", ratified: true });
  assert.deepEqual([abs.ok, abs.reason], [false, "ABSENT"]);
  const unseen = await door(w, "sweepratify", { sweep: name("minutes"), ratified: true }, { author: "member:alice", viewer: "member:nobody" });
  assert.deepEqual([unseen.ok, unseen.reason], [false, "ABSENT"]);
  const no = await door(w, "sweepratify", { sweep: name("nothing"), ratified: true });
  assert.deepEqual([no.ok, no.reason], [false, "NO_SUCH_SWEEP"]);
  const noRat = await door(w, "sweepratify", { sweep: name("minutes") });
  assert.deepEqual([noRat.ok, noRat.argument], [false, "ratified"]);
  /* the fence: a joined member who is not an owner cannot ratify */
  const bob = await door(w, "sweepratify", { sweep: name("minutes"), ratified: true }, { author: "member:bob" });
  assert.deepEqual([bob.ok, bob.code], [false, "SWEEP_RATIFY_NOT_AN_OWNER"]);
  nothing();
  /* control: any writer stops it, a ratified sweep, the member who is no owner included */
  const stop = await door(w, "sweepratify", { sweep: name("agendas"), ratified: false }, { author: "member:bob" });
  assert.deepEqual([stop.ok, stop.ratified, stop.due], [true, false, false]);
  assert.equal(JSON.parse(fileOf(w)).sweeps[1].ratified, false);
  /* already in the asked state: nothing written */
  const before = [fileOf(w), w.manifest(LIST).length];
  for (const [id, state] of [["agendas", false], ["minutes", false]]) {
    const same = await door(w, "sweepratify", { sweep: name(id), ratified: state });
    assert.deepEqual([same.ok, same.existed], [true, true]);
  }
  assert.deepEqual([fileOf(w), w.manifest(LIST).length], before);
});

test("R15 the module declares its three ops by key, and the ratify words say what ratifying sends, by key", () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["sweeps", "sweepratify", "sweepset"].sort());
  for (const op of ["sweepset", "sweepratify"]) {
    const d = DECLARED_OPS[op];
    assert.deepEqual([d.classes, d.machineClasses, d.mutating, d.weight], [["admin", "member"], [], true, "reversible"], op);
  }
  assert.deepEqual([DECLARED_OPS.sweeps.mutating, DECLARED_OPS.sweeps.classes], [false, ["admin", "member", "probe"]]);
  assert.ok(typeof RATIFY_NOTICE === "string" && RATIFY_NOTICE.length > 0, "the ratify screen's sentence is written once, by key, here");
  for (const d of Object.values(DECLARED_OPS)) assert.ok(typeof d.description === "string" && d.description.length > 0);
});

/* a project's own bundle carrying `gathering.json`: the project document, promoted by its owner, then revised to hold the sweeps */
const projectWorld = (sweeps) => {
  const { w } = listWorld({ list: "INFO-2026-0992-other", project: null });
  const md = (id) => ["---", ...(id ? [`id: ${id}`] : []), "object_type: project", "schema: project@1", 'title: "The Sweeping Project"', "current_state: forming",
    "prior_state: null", 'created: "2026-10-03T00:00:00Z"', 'last_updated: "2026-10-03T00:00:00Z"', "group: test-group",
    "objective: Know whether the award was proper", "references: []", "state_history: []", "---", "", "## Objective", "", "Know it.", ""].join("\n");
  const made = w.promotion.promote({ base: null, snapKey: "k-proj-1", author: "member:alice", meta: { object_type: "project" },
    files: [{ path: "bundle.md", text: md(null) }] });
  assert.equal(made.ok, true, JSON.stringify(made));
  const P = made.bundleId;
  w.st.sql.exec(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, 'discoverable')`, P);
  w.inProject(P, { owner: "alice", joined: ["bob"] });
  const t = JSON.stringify({ sweeps });
  const rev = w.promotion.promote({ bundleId: P, base: w.record.head(P).bundleSha, snapKey: "k-proj-2", author: "member:alice", meta: { object_type: "project" },
    files: [{ path: "bundle.md", text: md(P) }, { path: "data/gathering.json", text: t }] });
  return { w, P, rev };
};

test("R14 a project's own bundle belongs to that project: the owner ratifies a sweep defined on it, a non-owner is refused, a bundle in no project has no owner", async () => {
  const { w, P, rev } = projectWorld([sweepDef({ id: "minutes", ratified: false })]);
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.deepEqual([w.record.bundleInfo(P).type, w.record.bundleInfo(P).project], ["project", null]);
  const name = `${P}#minutes`;
  const bob = await door(w, "sweepratify", { sweep: name, ratified: true }, { author: "member:bob" });
  assert.deepEqual([bob.ok, bob.code], [false, "SWEEP_RATIFY_NOT_AN_OWNER"]);
  const own = await door(w, "sweepratify", { sweep: name, ratified: true });
  assert.equal(own.ok, true, JSON.stringify(own));
  assert.deepEqual([own.ratified, own.ratified_by], [true, "member:alice"]);
  const stop = await door(w, "sweepratify", { sweep: name, ratified: false }, { author: "member:bob" });
  assert.deepEqual([stop.ok, stop.ratified], [true, false]);
  /* control: a bundle in no project still has no owner (the R13 R14 test above) */
});

test("R4 R14 a ratified sweep on a project's own bundle is not due once that project is closed", async () => {
  const { w, P } = projectWorld([sweepDef({ id: "minutes", ratified: true })]);
  assert.equal(w.s.sweepDue(NOW_MS), NOW_MS);
  w.stages[P] = "closed";
  assert.equal(w.s.sweepDue(NOW_MS), null);
});
