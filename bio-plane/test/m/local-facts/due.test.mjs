/* local-facts: factsDue (R4). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, P, TP } from "./fixture.mjs";

const paths = (r) => r.due.map((d) => d.path).sort();

test("R4 without paths: every fact of the active profiles that is unconfirmed (lapsed included) or disputed, whatever its due date, once each, with its status and why", () => {
  const w = world();
  /* at 2026-09-28 every fact is unconfirmed; 2027 is listed though it falls due only on 2026-11-01 (K986), saying so */
  let r = w.lf.factsDue({ viewer: V("bob") });
  assert.equal(r.ok, true);
  assert.deepEqual(paths(r), Object.values(P).sort());
  for (const d of r.due) { assert.equal(d.status, "unconfirmed"); assert.ok(d.why.length > 0); }
  const y = r.due.find((d) => d.path === P.y2027);
  assert.equal(y.due, false);
  assert.equal(y.due_from, "2026-11-01");
  assert.match(y.why, /falls due on 2026-11-01/);
  assert.match(r.due.find((d) => d.path === P.y2026).why, /due from 2025-11-01/);
  /* confirmed facts leave; a corrected one is a member's act and is not listed; a disputed one is */
  w.act(P.tz, "confirm");
  w.act(P.clerkHours, "correct", { value: { weekly: [{ day: "mon", open: "09:00", close: "10:00" }] }, source: "notice" });
  w.act(P.y2027, "dispute");
  r = w.lf.factsDue({});
  assert.ok(!paths(r).includes(P.tz));
  assert.ok(!paths(r).includes(P.clerkHours));
  const disputed = r.due.find((d) => d.path === P.y2027);
  assert.equal(disputed.status, "disputed");
  assert.match(disputed.why, /disputed by member:bob, 2026-09-27/, "the local day of 01:00Z in the profile's zone (R3)");
  /* lapsed: the time zone 183 local days on (confirmed 2026-09-27 local, lapsing at 2027-03-29's local midnight) */
  r = w.at("2027-03-30T00:00:00Z").lf.factsDue({});
  const tz = r.due.find((d) => d.path === P.tz);
  assert.equal(tz.status, "unconfirmed");
  assert.equal(tz.lapsed.act, "confirm");
  assert.equal(tz.lapses_on, "2027-03-29");
  assert.equal(new Set(paths(r)).size, r.due.length, "once each");
});

test("R4 with paths: only those of them, once each; a path R6 does not name is in unknown; a named fact no profile holds in absent", () => {
  const w = world();
  w.act(P.venueHours, "confirm");
  const r = w.lf.factsDue({ paths: [P.tz, P.tz, P.venueHours, P.y2027, "nonsense", `${TP}/holidays/2030`, "other/time_zone", 7],
                            viewer: V("bob") });
  assert.deepEqual(paths(r), [P.tz, P.y2027].sort(), "the confirmed is left out; the not-yet-due listed; the repeat once");
  assert.deepEqual(r.unknown, ["nonsense", "other/time_zone", null]);
  assert.deepEqual(r.absent, [`${TP}/holidays/2030`]);
  assert.deepEqual(w.lf.factsDue({ paths: [] }), { ok: true, due: [], unknown: [], absent: [] });
  /* a viewer membership refuses sees none */
  assert.deepEqual(w.lf.factsDue({ viewer: "nobody" }).due, []);
  assert.deepEqual(w.lf.factsDue({ paths: [P.tz], viewer: "nobody" }).unknown, [P.tz]);
});

test("R4 writes nothing", () => {
  const w = world();
  w.act(P.tz, "dispute");
  const before = JSON.stringify(w.rows("SELECT * FROM local_fact_acts"));
  w.lf.factsDue({}); w.lf.factsDue({ paths: Object.values(P) });
  assert.equal(JSON.stringify(w.rows("SELECT * FROM local_fact_acts")), before);
});
