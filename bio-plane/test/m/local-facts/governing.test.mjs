/* local-facts: governingPath (R6, T33-28): the office's own fact, else the nearest entity it is part_of that the profile
   holds a fact for, else the profile's `offices` grouping. Most cases use a reader the test writes in lines R10's
   answer shape (`held`, `undetermined` as `{line, why}`, `truncated`), so each walk shape is exact; the last test runs
   the real `lines`, reached as `linesOf(host)`. `officeOf` is the profile-office bridge (K1563). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, P, TP } from "./fixture.mjs";
import { BOUNDS } from "../../../src/connection-grammar/index.mjs";

const AT = "2026-06-01T12:00:00Z";
const CLERK = { role: "Town Clerk", body: "City of Port Ellery" };
const BOARD = { role: "Selectboard", body: "Port Ellery Selectboard" };        // no hours, named by no holiday entry
const HARBOUR = { role: "Harbour District Board", body: "Port Ellery Harbour District" };

/* `edges`: [line_id, from, to, "in" | "undetermined"]; `offices`: entity → profile office. Records every call. */
function reader(edges, offices = {}) {
  const calls = [];
  const lines = {
    structureAt(q) {
      calls.push(q);
      const at = (e) => e.filter(([, f, t]) => f === q.entity || t === q.entity)
        .map(([line_id, from, to]) => ({ line_id, kind: "part_of", from, to, why: "no end is stated" }));
      return { ok: true, entity: q.entity, at: q.at, held: at(edges.filter((e) => e[3] === "in")), truncated: false,
               undetermined: at(edges.filter((e) => e[3] === "undetermined")).map(({ why, ...line }) => ({ line, why })) };
    },
  };
  return { lines, calls, officeOf: (id, profile) => (profile === TP ? offices[id] ?? null : null) };
}
const lf = (r) => world({ lines: r.lines, officeOf: r.officeOf }).lf;
const ask = (l, extra) => l.governingPath({ profile: TP, at: AT, viewer: V("bob"), ...extra });

test("R6 governingPath: the office's own fact when the profile holds one, following no line", () => {
  const r = reader([["LIN-1", "ENT-clerk", "ENT-town", "in"]], { "ENT-town": BOARD });
  const l = lf(r);
  assert.deepEqual(ask(l, { fact: "hours", office: CLERK, entity: "ENT-clerk" }),
                   { ok: true, path: P.clerkHours, via: "own", lines: [], why: "the profile holds this office's own fact" });
  assert.equal(ask(l, { fact: "hours", office: { venue: "records_request" } }).path, P.venueHours);
  assert.equal(ask(l, { fact: "holidays", office: "Town Clerk", year: 2026 }).path, P.y2026clerk);
  assert.equal(ask(l, { fact: "holidays", office: { venue: "commitment_claim" }, year: 2026 }).path, P.y2026court);
  assert.deepEqual(ask(l, { fact: "time_zone" }), { ok: true, path: P.tz, via: "profile", lines: [],
                                                     why: "the time zone is the profile's, for every office" });
  assert.equal(r.calls.length, 0, "no line read when the office's own fact is held");
});

test("R6 governingPath follows part_of upward to the nearest entity whose fact the profile holds, naming each line", () => {
  const r = reader([["LIN-1", "ENT-board", "ENT-mid", "in"], ["LIN-2", "ENT-mid", "ENT-clerk", "in"],
                    ["LIN-9", "ENT-other", "ENT-board", "in"]],                 // a line into the office is not upward
                   { "ENT-mid": HARBOUR, "ENT-clerk": CLERK });
  const l = lf(r);
  const g = ask(l, { fact: "hours", office: BOARD, entity: "ENT-board" });
  assert.equal(g.path, P.clerkHours);
  assert.equal(g.via, "part_of");
  assert.deepEqual(g.lines, [{ line_id: "LIN-1", from: "ENT-board", to: "ENT-mid" }, { line_id: "LIN-2", from: "ENT-mid", to: "ENT-clerk" }]);
  assert.match(g.why, /LIN-1 → LIN-2/);
  assert.deepEqual(r.calls.map((c) => [c.entity, c.at, c.kinds, c.viewer]),
                   [["ENT-board", AT, ["part_of"], V("bob")], ["ENT-mid", AT, ["part_of"], V("bob")]]);
  /* holidays: the parent's own entry */
  const h = ask(l, { fact: "holidays", office: BOARD, entity: "ENT-board", year: 2026 });
  assert.deepEqual([h.path, h.via, h.lines.length], [`${TP}/holidays/2026/role=Town%20Clerk`, "part_of", 2]);
});

test("R6 governingPath falls back to the profile's offices grouping, saying why: no entity, no lines, no parent, an undetermined line, two parents", () => {
  const cases = [
    [reader([]), { entity: undefined }, /no registry entity/],
    [{ lines: {}, officeOf: null }, { entity: "ENT-board" }, /`lines` is not reachable/],
    [reader([]), { entity: "ENT-board" }, /part of no entity/],
    [reader([["LIN-1", "ENT-board", "ENT-clerk", "undetermined"]], { "ENT-clerk": CLERK }), { entity: "ENT-board" },
     /part_of line LIN-1 from ENT-board is undetermined at 2026-06-01T12:00:00Z \(no end is stated\)/],
    [reader([["LIN-1", "ENT-board", "ENT-a", "in"], ["LIN-2", "ENT-board", "ENT-clerk", "in"]], { "ENT-clerk": CLERK }),
     { entity: "ENT-board" }, /part of 2 entities.*LIN-1, LIN-2/],
    [reader([["LIN-1", "ENT-board", "ENT-clerk", "in"]], { "ENT-clerk": CLERK }), { entity: "ENT-board", at: undefined }, /no date was given/],
  ];
  for (const [r, extra, why] of cases) {
    const l = lf(r);
    const h = ask(l, { fact: "holidays", office: BOARD, year: 2026, ...extra });
    assert.deepEqual([h.ok, h.path, h.via], [true, P.y2026, "fallback"], String(why));
    assert.match(h.why, why);
    assert.match(h.why, /entry for every office governs \(its `offices` grouping\)/);
    const o = ask(l, { fact: "hours", office: BOARD, ...extra });
    assert.deepEqual([o.path, o.via], [null, "none"], `hours have no grouping: ${why}`);
    assert.match(o.why, /undetermined/);
  }
  /* the negative control: the same walk with the line `in` reaches the parent */
  const ok = ask(lf(reader([["LIN-1", "ENT-board", "ENT-clerk", "in"]], { "ENT-clerk": CLERK })),
                 { fact: "hours", office: BOARD, entity: "ENT-board" });
  assert.deepEqual([ok.path, ok.via], [P.clerkHours, "part_of"]);
});

test("R6 governingPath walks at most connection-grammar's default depth, and never loops", () => {
  const n = BOUNDS.depth_default;
  const chain = (len) => Array.from({ length: len }, (_, i) => [`LIN-${i}`, `ENT-${i}`, `ENT-${i + 1}`, "in"]);
  let r = reader(chain(n), { [`ENT-${n}`]: CLERK });
  let g = ask(lf(r), { fact: "hours", office: BOARD, entity: "ENT-0" });
  assert.deepEqual([g.path, g.lines.length], [P.clerkHours, n], "reached within the depth");
  r = reader(chain(n + 1), { [`ENT-${n + 1}`]: CLERK });
  g = ask(lf(r), { fact: "hours", office: BOARD, entity: "ENT-0" });
  assert.equal(g.path, null);
  assert.match(g.why, new RegExp(`within ${n} part_of lines`));
  assert.equal(r.calls.length, n);
  r = reader([["LIN-1", "ENT-a", "ENT-b", "in"], ["LIN-2", "ENT-b", "ENT-a", "in"]]);
  g = ask(lf(r), { fact: "hours", office: BOARD, entity: "ENT-a" });
  assert.match(g.why, /return to an entity already followed/);
});

test("R6 governingPath's year: given, else the local year of `at` in the profile's zone", () => {
  const l = lf(reader([]));
  /* 2027-01-01T02:00Z is still 2026-12-31 in the profile's zone (UTC-4) */
  assert.equal(ask(l, { fact: "holidays", office: "Town Clerk", at: "2027-01-01T02:00:00Z" }).path, P.y2026clerk);
  assert.equal(ask(l, { fact: "holidays", office: BOARD, at: "2027-01-01T05:00:00Z" }).path, P.y2027);
  const none = ask(l, { fact: "holidays", office: BOARD, at: undefined });
  assert.deepEqual([none.path, none.via], [null, "none"]);
  assert.match(none.why, /year is undetermined/);
});

test("R6 governingPath writes nothing and never throws; an unknown profile or a refused viewer is NO_SUCH_FACT", () => {
  const thrower = { lines: { structureAt() { throw new Error("boom"); } }, officeOf: () => { throw new Error("x"); } };
  const w = world(thrower);
  const g = w.lf.governingPath({ profile: TP, fact: "hours", office: BOARD, entity: "ENT-board", at: AT, viewer: V("bob") });
  assert.deepEqual([g.ok, g.path], [true, null]);
  assert.match(g.why, /undetermined: the walk failed \(boom\)/);
  for (const a of [undefined, null, 7, "x", [], { profile: 3 }, { profile: TP, fact: "weather" }, { profile: TP, fact: "hours", office: 5 }])
    assert.doesNotThrow(() => w.lf.governingPath(a));
  assert.equal(w.lf.governingPath({ profile: "other", fact: "time_zone" }).reason, "NO_SUCH_FACT");
  assert.equal(w.lf.governingPath({ profile: TP, fact: "time_zone", viewer: "nobody" }).reason, "NO_SUCH_FACT");
  assert.equal(w.lf.governingPath({ profile: TP, fact: "weather" }).reason, "NO_SUCH_FACT");
  assert.equal(w.count(), 0);
});

test("R6 governingPath over the real lines (linesOf(host), its R10): an in-force part_of line followed, an expired one not, an open-ended one undetermined", async () => {
  const { world: linesWorld, ANN } = await import("../lines/fixture.mjs");
  const { localFactsOf } = await import("../../../src/local-facts/index.mjs");
  const lw = linesWorld();
  const board = lw.ent("office", "Selectboard desk"), town = lw.ent("body", "Town office"), old = lw.ent("body", "Old office");
  const open = lw.ent("office", "Harbour desk"), any = lw.ent("body", "Somewhere");
  const inForce = lw.say("part_of", board, town, { valid: { from: "2020-01-01", to: "2030-12-31" } });
  lw.say("part_of", board, old, { valid: { from: "2000-01-01", to: "2009-12-31" } });                 /* out at AT */
  const unended = lw.say("part_of", open, any, { valid: { from: "2020-01-01" } });                    /* no end stated */
  const officeOf = (id, profile) => (profile === TP && id === town ? CLERK : profile === TP && id === old ? CLERK : null);
  const l = localFactsOf(lw.host, { record: lw.record, membership: lw.membership, officeOf, now: () => "2026-09-28T01:00:00Z" });
  const g = l.governingPath({ profile: TP, fact: "hours", office: BOARD, entity: board, at: "2026-06-15", viewer: ANN });
  assert.deepEqual([g.path, g.via, g.lines], [P.clerkHours, "part_of", [{ line_id: inForce, from: board, to: town }]]);
  /* the same office at a date before its in-force line: only the expired line's era, which is out then too */
  const before = l.governingPath({ profile: TP, fact: "hours", office: BOARD, entity: board, at: "2015-06-15", viewer: ANN });
  assert.deepEqual([before.path, before.via], [null, "none"]);
  assert.match(before.why, /part of no entity/);
  const h = l.governingPath({ profile: TP, fact: "holidays", office: HARBOUR, entity: open, at: "2026-06-15", year: 2026, viewer: ANN });
  assert.deepEqual([h.path, h.via], [P.y2026, "fallback"]);
  assert.match(h.why, new RegExp(`part_of line ${unended} from ${open} is undetermined`));
});
