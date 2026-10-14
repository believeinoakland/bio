/* R11 and R12 (T48; N1047; DEC-226 (1); K3189): the administrators' to-do for a release ready to install, derived on read
   from the notice read the plane hands in (`deps.updateNotice`, instance-setup's `updateNoticeState()`, its R89), at
   conditionItems' interface (R1). The read is a function a test steers; membership is real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";

const READY = { version: "0.85.0", date: "2026-08-30", security: false, found_at: iso(NOW - 3 * 86400000) };
function setup(over = {}) {
  const st = { running: { version: "0.84.0" }, ready: { ...READY }, decisions: [], ...over };
  const calls = { n: 0 };
  const w = world({ updateNotice: () => { calls.n += 1; if (st.throws) throw new Error("down"); return st.value ?? st; } });
  w.member("ann", { role: "admin" }); w.member("ben", { role: "admin" }); w.member("cam");
  const todos = (who) => w.read(who).items.filter((i) => i.kind === "update-ready");
  return { w, st, calls, todos };
}

test("R11: a ready release gives each of two administrators one to-do, class OBLIGATION, id by version, for the admin role, ungrouped, carrying updatelater through optionsOf; a second, newer release replaces it", () => {
  const { w, st, todos } = setup();
  for (const who of ["ann", "ben"]) {
    const t = todos(who);
    assert.equal(t.length, 1, `${who} has exactly one`);
    assert.deepEqual([t[0].id, t[0].class, t[0].kind, t[0].assignee_role], ["OBLIGATION::update-ready::0.85.0", "OBLIGATION", "update-ready", "admin"]);
    assert.deepEqual(t[0].detail, { version: "0.85.0", date: "2026-08-30", security: false });
    assert.deepEqual([t[0].case.ungrouped, t[0].case.state], [true, "determined"], "no subject bundle: ungrouped");
    assert.deepEqual(t[0].age, { state: "determined", since: READY.found_at, ms: 3 * 86400000, days: 3 });
    assert.ok(Array.isArray(t[0].options), "options come through optionsOf");
  }
  assert.deepEqual(w.asked.options.at(-1), [], "optionsOf is asked for no subject bundle");
  st.ready = { ...READY, version: "0.86.0", security: true, found_at: iso(NOW - 86400000) };
  const t = todos("ann");
  assert.deepEqual(t.map((i) => i.id), ["OBLIGATION::update-ready::0.86.0"], "a newer release replaces the older one: at most one item");
  assert.equal(t[0].detail.security, true);
  assert.equal(t[0].summary.toLowerCase().includes("obligation"), false, "R9: a to-do, never an obligation");
});

test("R11: control: after one administrator's updatelater neither has the item until its date; a start or skip by anyone removes it for all; a decision on an older release does not touch a newer one", () => {
  const { st, todos, w } = setup();
  st.ready.decision = { version: "0.85.0", kind: "later", by: "ann", at: iso(NOW - 1000), until: iso(NOW + 86400000) };
  assert.deepEqual([todos("ann").length, todos("ben").length], [0, 0], "neither has it while the date is ahead");
  assert.equal(w.read("ann", "member:ann", { now: NOW + 2 * 86400000 }).items.filter((i) => i.kind === "update-ready").length, 1, "it returns at the date");
  st.ready.decision = { version: "0.85.0", kind: "later", by: "ann", at: iso(NOW - 1000), until: "2026-09-05" };
  assert.equal(todos("ben").length, 0, "a calendar day still to come");
  assert.equal(w.read("ben", "member:ben", { now: Date.parse("2026-09-06T12:00:00Z") }).items.some((i) => i.kind === "update-ready"), true);
  for (const kind of ["start", "skip"]) {
    st.ready.decision = { version: "0.85.0", kind, by: "ben", at: iso(NOW) };
    assert.deepEqual([todos("ann").length, todos("ben").length], [0, 0], `${kind} removes it from every queue`);
  }
  st.ready.decision = null;
  st.decisions = [{ version: "0.85.0", kind: "later", by: "ann", at: iso(NOW - 5000), until: iso(NOW - 1) },
                  { version: "0.84.5", kind: "skip", by: "ann", at: iso(NOW - 1) }];
  assert.equal(todos("ann").length, 1, "an elapsed later and another release's skip leave it");
  st.decisions.push({ version: "0.85.0", kind: "skip", by: "ben", at: iso(NOW) });
  assert.equal(todos("ann").length, 0, "the latest decision on the release wins");
});

test("R11: control: the running version being that release or newer removes it; a member who is not an administrator is answered none", () => {
  const { st, todos, w } = setup();
  assert.deepEqual([todos("cam").length, todos(null).length], [0, 0], "a member, and no member, get none");
  assert.equal(w.read(null, "class:admin").items.some((i) => i.kind === "update-ready"), false, "a machine viewer gets none");
  for (const v of ["0.85.0", "0.85.1", "1.0"]) { st.running = { version: v }; assert.equal(todos("ann").length, 0, `running ${v}`); }
  st.running = { version: "0.9.0" };
  assert.equal(todos("ann").length, 1, "0.85.0 is newer than 0.9.0 by number, not by text");
  st.ready = null;
  assert.equal(todos("ann").length, 0, "no ready release, no item");
  assert.deepEqual(Object.keys(w.read("ann")), ["items"], "nothing failed: no facts");
});

test("R11: it writes nothing", () => {
  const { w, todos } = setup();
  const count = () => w.statements.filter((q) => /^\s*(INSERT|UPDATE|DELETE)/i.test(q)).length;
  const before = count();
  todos("ann"); todos("ben");
  assert.equal(count(), before);
});

test("R12: with no read handed, or one that throws or answers malformed, an administrator is answered no item and the facts name update-ready failed; the other producers answer as before", () => {
  const w = world();
  w.member("ann", { role: "admin" });
  w.fakes.governor.governorHolding = () => [{ host: "h.example.gov", cooloff_until: NOW + 1000, refusals: 1, last_refusal_at: NOW - 1, granted: 1, refused_total: 1 }];
  const none = w.read("ann");
  assert.deepEqual([none.items.some((i) => i.kind === "update-ready"), none.facts.failed], [false, ["update-ready"]], "none handed");
  assert.equal(none.items.some((i) => i.kind === "governor-holding-host"), true, "the other producers answer as before");
  const bad = [() => { throw new Error("x"); }, () => null, () => "text", () => ({ running: { version: "0.84.0" }, ready: { version: "soon", date: "d", found_at: iso(NOW) } }),
    () => ({ running: {}, ready: null }),
    () => ({ running: { version: "0.84.0" }, ready: { ...READY, decision: { kind: "later", until: "never" } } }),
    () => ({ running: { version: "0.84.0" }, ready: { ...READY, decision: { kind: "maybe" } } })];
  for (const fn of bad) {
    const x = setup(); x.st.value = undefined;
    const w2 = world({ updateNotice: fn }); w2.member("ann", { role: "admin" });
    const r = w2.read("ann");
    assert.deepEqual([r.items.some((i) => i.kind === "update-ready"), r.facts.failed], [false, ["update-ready"]], String(fn));
  }
  const s = setup(); s.st.throws = true;
  assert.deepEqual(Object.keys(s.w.read("cam")), ["items"], "a member who is not an administrator is not asked, and nothing failed for them");
});
