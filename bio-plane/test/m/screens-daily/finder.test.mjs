/* Find (R4) at the module's interface, over the stand-in kit: the search, its results with grade and where they matched,
   holding a picked set together with its strip, letting it go, "Find in these", where nobody looked, and "Count". */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-daily/index.mjs";
import { kit, viewOf, ops, drawn, keys, text } from "./kit.mjs";

const finder = SCREENS.find((s) => s.id === "finder");
const HITS = { total: 3, hits: [
  { bundle_id: "INF-1", title: "Public Works work orders, FY2025", grade: "B", snippet: "pothole [work orders]" },
  { bundle_id: "INF-2", title: "Administrative Instruction 4.12", snippet: "within seven calendar days" },
  { bundle_id: "INF-3", title: "Report to council", grade: "C" },
] };

test("R4: search with the member's words: read from the route's words or the last search, sending them as q", () => {
  assert.deepEqual(Object.keys(finder.reads(viewOf())), [], "nothing searched before the member writes words");
  assert.equal(finder.reads(viewOf({ subject: "pothole" })).search.query.q, "pothole");
  assert.equal(finder.reads(viewOf({ subject: "pothole", ui: { q: "lease" } })).search.query.q, "lease");
  const k = kit({ values: { "finder-q": "  work orders " } });
  const v = viewOf();
  assert.deepEqual(k.send(finder, "search", v), { query: { q: "work orders", limit: "50", snippet: "160" } });
  assert.equal(v.ui.q, "work orders");
  assert.deepEqual(finder.acts.find((a) => a.op === "search").rereads, ["search"]);
  assert.deepEqual(kit({ values: { "finder-q": " " } }).send(finder, "search", viewOf()), { refuse: "screen.finder.wordsfirst" });
});

test("R4: each result with its grade and where it matched (Found by search), a link to its document and a box to pick it", () => {
  const html = kit().render(finder, viewOf({ subject: "pothole", data: { search: HITS } }));
  assert.match(text(html), /3 results/);
  assert.equal((html.match(/data-mark="origin.search"/g) || []).length, 3);
  assert.match(html, /data-scale="capture">B</);
  assert.match(html, /data-scale="capture">C</);
  assert.match(html, /pothole \[work orders\]/);
  assert.match(html, /href="\/app\/document\/INF-2">Administrative Instruction 4.12/);
  assert.match(html, /id="finder-pick-INF-1" aria-label="⟦screen.finder.pick⟧Pick Public Works/);
  const none = kit().render(finder, viewOf({ subject: "zz", data: { search: { state: "empty", value: { total: 0, hits: [], widen: { total: 4 } } } } }));
  assert.ok(keys(none).includes("screen.finder.none"));
  const widened = kit().render(finder, viewOf({ subject: "zz", data: { search: { total: 0, hits: [], widen: { total: 4 } } } }));
  assert.match(text(widened), /4 hold at least one of them/);
});

test("R4: select holds the picked results together; the hold strip shows how many and until when, from selection", () => {
  const k = kit({ values: { "finder-pick-INF-1": true, "finder-pick-INF-3": "on" } });
  const v = viewOf({ subject: "pothole", data: { search: HITS } });
  assert.ok(ops(k.render(finder, v)).includes("select"));
  assert.deepEqual(k.send(finder, "select", v), { query: { kind: "enumerated", q: "pothole" }, body: { ids: ["INF-1", "INF-3"] } });
  assert.deepEqual(kit().send(finder, "select", v), { refuse: "screen.finder.pickfirst" });
  k.done(finder, "select", v, { ok: true, handle: "sel-abc", n: 2 });
  assert.equal(v.ui.handle, "sel-abc");
  assert.deepEqual(finder.reads(v).selection, { op: "selection", query: { handle: "sel-abc" } });
  const held = kit().render(finder, viewOf({ ui: { handle: "sel-abc" }, data: { selection: { ok: true, handle: "sel-abc", n: 2, members: ["INF-1", "INF-3"], expires: "2026-10-12T16:40:00Z" } } }));
  const at = new Date("2026-10-12T16:40:00Z");
  const hm = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  assert.match(text(held), new RegExp(`2 documents held together · until ${hm}`));
  const one = kit().render(finder, viewOf({ ui: { handle: "sel-abc" }, data: { selection: { n: 1 } } }));
  assert.ok(keys(one).includes("screen.finder.held.one"));
  assert.deepEqual(ops(held).filter((o) => o !== "frontier" && o !== "search"), ["findin", "calculationcreate", "selectionrelease"]);
  assert.ok(!ops(kit().render(finder, viewOf())).some((o) => ["findin", "calculationcreate", "selectionrelease", "select"].includes(o)), "control: nothing held, nothing to act on");
});

test("R4: selectionrelease lets the set go; \"Find in these\" opens find-in over the held set", () => {
  const k = kit();
  const v = viewOf({ ui: { handle: "sel-abc" } });
  assert.deepEqual(k.send(finder, "selectionrelease", v, { handle: "sel-abc" }), { query: { handle: "sel-abc" } });
  k.done(finder, "selectionrelease", v, { ok: true, released: 1 });
  assert.equal(v.ui.handle, null);
  assert.equal(k.send(finder, "findin", viewOf(), { handle: "sel-abc" }), null, "it sends nothing itself");
  assert.deepEqual(k.log.go, [["find-in", "sel-abc"]]);
  assert.deepEqual(kit().send(finder, "findin", viewOf(), {}), { refuse: "screen.finder.holdfirst" });
});

test("R4: frontier draws Nobody looked (mark.gap.nobody) for where nobody looked", () => {
  const k = kit();
  const v = viewOf();
  assert.ok(ops(k.render(finder, v)).includes("frontier"));
  assert.deepEqual(k.send(finder, "frontier", v), { query: { level: "document" } });
  assert.equal(v.ui.frontier, true);
  assert.deepEqual(finder.reads(v).frontier.query, { level: "document" });
  const html = kit().render(finder, viewOf({ ui: { frontier: true }, data: { frontier: { never_looked: [{ referent: "Council minutes 2024" }, "Budget FY24"], never_looked_count: 2 } } }));
  assert.match(html, /data-mark="gap.nobody"/);
  assert.match(text(html), /Nobody has looked yet at 2 places.*Council minutes 2024.*Budget FY24/);
  const none = kit().render(finder, viewOf({ ui: { frontier: true }, data: { frontier: { state: "empty", value: { never_looked: [] } } } }));
  assert.ok(keys(none).includes("screen.finder.nobody.none"));
});

test("R4: \"Count\" makes a count over the held set as a calculation, and says what it counted", () => {
  const k = kit();
  const v = viewOf({ ui: { handle: "sel-abc" } });
  const sent = k.send(finder, "calculationcreate", v, { handle: "sel-abc" }, { fields: { question: "Reports closed in 7 days", from: "2024-07-01", to: "2025-06-30" } });
  assert.deepEqual(sent, { body: { question: "Reports closed in 7 days", period: { from: "2024-07-01", to: "2025-06-30" }, kind: "count", inputs: [{ name: "held", set: "sel-abc" }] } });
  assert.deepEqual(kit().send(finder, "calculationcreate", viewOf(), {}, { fields: {} }), { refuse: "screen.finder.holdfirst" });
  k.done(finder, "calculationcreate", v, { ok: true, calc_id: "CALC-1", result_key: "count", results: { count: 812 } });
  assert.equal(v.ui.counted, "812");
  assert.match(text(kit().render(finder, v)), /Counted: 812\./);
});
