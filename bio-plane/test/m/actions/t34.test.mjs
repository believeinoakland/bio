/* actions' T34 entry at its interface: R68 (N611, K1681; re-stated T47, N960) `place()` and `zoneOf`, the read for a
   module with no office (an action's clock is read in R100's `actionZone`, `t47.test.mjs`); and T34-87 (DEC-149), the member-facing details that called the group's Civicsmith "this instance". (Its R69
   tests moved to `action-holds` with the reader, T45; K2781 (1).) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const view = (ids) => combine(ids).view;
/* Everything a read could write: the settings and the record. */
const state = (w) => JSON.stringify(["settings", "manifest", "bundles"]
  .map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)));

/* ---------------------------------------------------------------- R68 */

test("R68 place() is the read for a module with no office: the active profiles' combined view as they stand at the call, or null when none can be read; it writes nothing and never throws", () => {
  const w = world();
  assert.deepEqual(w.a.place(), view(["test-port-ellery"]));
  /* at the call (K1649): a change of the active profiles is read at the next call, never cached */
  w.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("admin"));
  assert.deepEqual(w.a.place(), view(["oakland-alameda"]));
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery", "oakland-alameda"], V("admin"));
  assert.deepEqual(w.a.place(), view(["test-port-ellery", "oakland-alameda"]), "several profiles: their combined view");
  /* none can be read: no profile active, an empty list, a profile that does not combine */
  for (const ids of [[], ["no-such-profile"]]) {
    w.record.setSetting("jurisdiction_profiles", ids, V("admin"));
    assert.equal(w.a.place(), null, JSON.stringify(ids));
  }
  assert.equal(world({ profiles: null }).a.place(), null);
  /* the setting unreadable: null, never a throw */
  const broken = world({ recordAs: (r) => new Proxy(r, { get(t, key) {
    if (key === "getSetting") return () => { throw new Error("storage unavailable"); };
    const v = t[key]; return typeof v === "function" ? v.bind(t) : v;
  } }) });
  assert.doesNotThrow(() => broken.a.place());
  assert.equal(broken.a.place(), null);
  /* writes nothing */
  const x = world();
  const before = state(x);
  for (let i = 0; i < 3; i++) x.a.place();
  assert.equal(state(x), before);
});

test("R68 zoneOf answers the IANA zone a place states (its time_zone's value; a string read as the zone itself), the group's zone for place(), or null when none is held or the active profiles disagree; it never throws", () => {
  assert.equal(typeof actions.zoneOf, "function", "a module-level function");
  assert.equal(actions.zoneOf(view(["test-port-ellery"])), "America/Halifax");
  assert.equal(actions.zoneOf(view(["oakland-alameda"])), "America/Los_Angeles");
  /* two profiles naming different zones: the view withholds it, and none is answered */
  assert.equal(actions.zoneOf(view(["test-port-ellery", "oakland-alameda"])), null);
  assert.equal(actions.zoneOf({ time_zone: { value: " UTC " } }), "UTC");
  assert.equal(actions.zoneOf({ time_zone: "Europe/Lisbon" }), "Europe/Lisbon");
  assert.equal(actions.zoneOf("America/Halifax"), "America/Halifax", "a string is the zone itself");
  assert.equal(actions.zoneOf(" Asia/Tokyo "), "Asia/Tokyo");
  for (const none of [null, undefined, "", "   ", 7, true, [], {}, { time_zone: null }, { time_zone: {} },
                      { time_zone: { value: 7 } }, { time_zone: { value: "  " } }, { counterparties: [] }])
    assert.equal(actions.zoneOf(none), null, JSON.stringify(none) ?? "undefined");
  const hostile = new Proxy({}, { get() { throw new Error("no"); } });
  assert.doesNotThrow(() => actions.zoneOf(hostile));
  assert.equal(actions.zoneOf(hostile), null);
});

test("R68 R12 R100 with one active profile R100's zone is zoneOf(place()), a local day never the UTC day; an action's clock is never read in place() alone, and with no zone held for it every local day is undetermined", () => {
  const at = Date.parse("2026-09-29T02:00:00Z");          /* 23:00 on the 28th in Halifax, the 29th in UTC */
  const w = world();
  assert.equal(actions.localToday(at, actions.zoneOf(w.a.place())), "2026-09-28");
  const md = actionMd(A, [...CP, "action_kind: other", "clock:", '  - text: "t"', '    description: "d"', "    date: 2026-09-28",
    "    basis: s", "    status: pending"]);
  assert.equal(actions.actionFacts(md, at, w.a.place()).clock_overdue, false, "still the 28th where the office is");
  assert.equal(actions.actionFacts(md, at, actions.zoneOf(w.a.place())).clock_overdue, false, "the zone alone reads the same");
  assert.equal(actions.actionZone({ counterparty: { state: "named", role: "Town Clerk", body: "Town of Port Ellery" } }, w.a.place()),
    actions.zoneOf(w.a.place()), "one profile: R100's zone is the group's");
  /* the active profiles changed: the next read follows them */
  w.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("admin"));
  assert.equal(actions.localToday(at, actions.zoneOf(w.a.place())), "2026-09-28");
  /* none held for this action (no profile; or two whose zones differ, and none gives its office): undetermined, never
     the UTC day */
  for (const nz of [world({ profiles: null }), world({ profiles: ["test-port-ellery", "oakland-alameda"] })]) {
    const zone = actions.zoneOf(nz.a.place());
    assert.equal(zone, null);
    assert.equal(actions.localToday(at, zone), null);
    assert.equal(actions.actionFacts(md, at, nz.a.place()).clock_overdue, null);
    assert.equal(nz.reg.facts[0].fn(md, Date.parse("2026-12-01T00:00:00Z")).clock_overdue, null, "retrieval's registered facts too");
  }
});

/* ---------------------------------------------------------------- T34-87 (DEC-149) */

test("R10 R45 R8 (DEC-149, T34-87) the member-facing details name 'your group's Civicsmith', or need no name, and never 'this instance', 'this copy' or 'this plane'", () => {
  const w = world();
  const kind = w.promote(A, actionMd(A, [...CP, "action_kind: grand_jury"]));
  assert.equal(kind.reason, "ACTION_KIND_UNKNOWN");
  assert.match(kind.detail, /^action_kind 'grand_jury' is not a kind your group's Civicsmith offers: one of records_request, /);
  const contact = actions.contactNotAMember();
  assert.equal(contact.detail, "contact names a member of your group by member id, and this one names none. Nothing was written.");
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: other", "contact: nobody-here"])).detail, contact.detail);
  const x = world({ conformance: {} });
  const det = x.promote(C, actionMd(C, [...CP, "action_kind: other", "breach: true"]));
  assert.deepEqual([det.reason, det.cause], ["ACTION_NO_DETERMINATION", "CONFORMANCE_UNAVAILABLE"]);
  assert.equal(det.detail, "an action recorded for a breach rests on a conformance determination, and no determination can be "
    + "read on your group's Civicsmith yet, so none could be found. Nothing was written.");
  for (const r of [kind, contact, det]) assert.doesNotMatch(r.detail, /this instance|this copy|this plane|the plane/i);
});
