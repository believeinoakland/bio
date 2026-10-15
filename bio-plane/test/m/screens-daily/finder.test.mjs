/* Find (R4) on the real served page (interface-shell's harness): the search, its results with grade and where they
   matched, holding a picked set together with its strip, letting it go, "Find in these", where nobody looked, and
   "Count". Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, screen, word, hasWord } from "./page.mjs";
import { SESSION_OPS } from "../../../src/op-declarations/index.mjs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { served } from "../interface-shell/harness.mjs";
import { SCREENS } from "./page.mjs";

const HITS = ok({ total: 3, hits: [
  { bundle_id: "INF-1", title: "Public Works work orders, FY2025", grade: "B", snippet: "pothole [work orders]" },
  { bundle_id: "INF-2", title: "Administrative Instruction 4.12", snippet: "within seven calendar days" },
  { bundle_id: "INF-3", title: "Report to council", grade: "C" },
] });
const SEL = ok({ ok: true, handle: "sel-abc", n: 2, members: ["INF-1", "INF-3"], expires: "2026-10-12T16:40:00Z" });
const PLANE = { search: HITS, select: ok({ ok: true, handle: "sel-abc", n: 2 }), selection: SEL, selectionrelease: ok({ ok: true, released: 1 }) };
// `search`, `findin`, `frontier` and `ruleanswer` are reads the shell weighs as reasoned until op-grades names them
// (SCREENS-DAILY #1's REPORT): the member's reason is answered where the shell asks one.
const R = "looking";

test("R4: search with the member's words: read from the route's words or the last search, sent as q", async () => {
  const blank = await open("/app/finder", PLANE);
  assert.equal(blank.byOp("search").length, 0, "nothing searched before the member writes words");
  const routed = await open("/app/finder/pothole", PLANE);
  assert.equal(last(routed, "search").query.q, "pothole");
  await press(routed, "search", { values: { "finder-q": "  work orders " }, reason: R });
  const reads = routed.byOp("search").map((r) => r.query.q);
  assert.deepEqual(reads.slice(-2), ["work orders", "work orders"], "the act's search, then the screen's re-read of it");
  const empty = await press(blank, "search", { values: { "finder-q": " " }, reason: R });
  assert.equal(beside(blank, empty), word("screen.finder.wordsfirst"));
});

test("R4: each result with its grade and where it matched (Found by search), a reference to its document and a box to pick it", async () => {
  const p = await open("/app/finder/pothole", PLANE);
  assert.ok(text(p).includes(word("screen.finder.total.many", { n: "3" })));
  assert.equal(main(p).querySelectorAll('.cs-origin[data-origin="search"]').length, 3);
  assert.deepEqual(main(p).querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["B", "C"]);
  assert.match(text(p), /pothole \[work orders\]/);
  assert.ok(main(p).querySelectorAll(".cs-card, a.cs-ref").some((a) => a.textContent === "Administrative Instruction 4.12"));
  assert.equal(p.doc.getElementById("finder-pick-INF-1").getAttribute("aria-label"), word("screen.finder.pick", { title: "Public Works work orders, FY2025" }));
  const none = await open("/app/finder/zz", { search: ok({ total: 0, hits: [], widen: { total: 4 } }) });
  assert.ok(text(none).includes(word("screen.finder.noresult", { q: "zz" })));
  assert.ok(text(none).includes(word("screen.finder.widen", { n: "4" })));
  const one = await open("/app/finder/pothole", { search: ok({ total: 1, hits: [HITS.json.result.hits[0]] }) });
  assert.ok(text(one).includes(word("screen.finder.total.one")), "R25: one result, the singular key");
});

test("R4: select holds the picked results together; the hold strip shows how many and until when, from selection", async () => {
  const p = await open("/app/finder/pothole", PLANE);
  assert.ok(ops(p).includes("select"));
  assert.ok(!ops(p).some((o) => ["findin", "calculationcreate", "selectionrelease"].includes(o)), "control: nothing held, nothing to act on");
  const nopick = await press(p, "select");
  assert.equal(beside(p, nopick), word("screen.finder.pickfirst"));
  await press(p, "select", { values: { "finder-pick-INF-1": true, "finder-pick-INF-3": true } });
  assert.deepEqual(last(p, "select").query, { op: "select", kind: "enumerated", q: "pothole" });
  assert.deepEqual(last(p, "select").body, { ids: ["INF-1", "INF-3"] });
  assert.equal(last(p, "selection").query.handle, "sel-abc");
  const at = new Date("2026-10-12T16:40:00Z");
  const hm = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  assert.ok(text(p, main(p).querySelector(".cs-hold")).includes(`${word("screen.finder.held.many", { n: "2" })} · ${word("screen.finder.until", { time: hm })}`));
  assert.deepEqual(ops(p).filter((o) => !["search", "frontier", "select"].includes(o)), ["findin", "calculationcreate", "selectionrelease"]);
  const one = await open("/app/finder/pothole", { ...PLANE, selection: ok({ n: 1, members: ["INF-1"] }) });
  await press(one, "select", { values: { "finder-pick-INF-1": true } });
  assert.ok(text(one).includes(word("screen.finder.held.one")), "R25: one document, the singular key");
});

test("R4: selectionrelease lets the set go; \"Find in these\" opens find-in over the held set", async () => {
  const p = await open("/app/finder/pothole", PLANE);
  await press(p, "select", { values: { "finder-pick-INF-1": true } });
  await press(p, "selectionrelease");
  assert.equal(last(p, "selectionrelease").query.handle, "sel-abc");
  assert.ok(!ops(p).includes("selectionrelease"), "the set is gone from the strip");
  await press(p, "select", { values: { "finder-pick-INF-1": true } });
  await press(p, "findin", { reason: R });
  assert.equal(p.byOp("findin").length, 0, "it sends nothing itself");
  assert.equal(p.location.pathname, "/app/find-in/sel-abc");
});

test("R4: frontier draws Nobody looked (mark.gap.nobody) for where nobody looked", async () => {
  // `frontier` is a read in no session set, so the shell's gate (interface-shell R12) draws it to nobody today
  // (SCREENS-DAILY #1's REPORT); with it in the member's set, as the registry's act needs, the screen draws and sends it.
  const absent = await open("/app/finder", {});
  assert.equal(ops(absent).includes("frontier"), SESSION_OPS.member.has("frontier"));
  // The page as it would be served with `frontier` in the member's session set.
  const html = served(interfacePage(SCREENS).replace('"sessionOps":{"member":[', '"sessionOps":{"member":["frontier",'));
  const p = await open("/app/finder", { frontier: ok({ never_looked: [{ referent: "Council minutes 2024" }, "Budget FY24"], never_looked_count: 2 }) }, { html });
  assert.ok(ops(p).includes("frontier"));
  await press(p, "frontier", { reason: R });
  assert.equal(last(p, "frontier").query.level, "document");
  assert.ok(main(p).querySelector('.cs-gap[data-gap="nobody"]'));
  assert.ok(text(p).includes(word("screen.finder.nobody", { n: "2" })) && text(p).includes("Council minutes 2024") && text(p).includes("Budget FY24"));
  const single = await open("/app/finder", { frontier: ok({ never_looked: ["Budget FY24"], never_looked_count: 1 }) }, { html });
  await press(single, "frontier", { reason: R });
  assert.ok(text(single).includes(word("screen.finder.nobody.one")), "R25: one place, the singular key");
  const none = await open("/app/finder", { frontier: ok({ never_looked: [] }) }, { html });
  await press(none, "frontier", { reason: R });
  assert.ok(text(none).includes(word("screen.finder.nobody.none")));
});

test("R4: \"Count\" makes a count over the held set as a calculation, asking what and when in place, and says what it counted", async () => {
  const p = await open("/app/finder/pothole", { ...PLANE, calculationcreate: ok({ ok: true, calc_id: "CALC-1", result_key: "count", results: { count: 812 } }) });
  await press(p, "select", { values: { "finder-pick-INF-1": true } });
  assert.equal(button(p, "calculationcreate").closest("details").querySelector("summary").textContent, word("act.calculationcreate.label.finder"));
  await press(p, "calculationcreate", { values: { "fc-question": "Reports closed in 7 days", "fc-from": "2024-07-01", "fc-to": "2025-06-30" }, reason: R });
  assert.deepEqual({ ...last(p, "calculationcreate").body, reason: undefined },
    { question: "Reports closed in 7 days", period: { from: "2024-07-01", to: "2025-06-30" }, kind: "count", inputs: [{ name: "held", set: "sel-abc" }], reason: undefined });
  assert.ok(text(p).includes(word("screen.finder.counted", { result: "812" })));
  const r = await open("/app/finder/pothole", { ...PLANE, calculationcreate: refused("NO_PERIOD", "Say over which period.") });
  await press(r, "select", { values: { "finder-pick-INF-1": true } });
  const b = await press(r, "calculationcreate", { values: { "fc-question": "q" }, reason: R });
  assert.match(beside(r, b), /period|NO_PERIOD/);
});

test("R12 (DEC-201 (13)): a search with no result says what search covers and offers \"Capture it\"", async () => {
  const p = await open("/app/finder/rent board minutes 2019", { search: ok({ total: 0, hits: [] }) });
  assert.ok(text(p).includes(word("screen.finder.noresult", { q: "rent board minutes 2019" }) + " " + word("screen.finder.covers")));
  assert.equal(main(p).querySelector('a[data-nav][href="/app/capture"]').textContent, word("screen.finder.captureit"));
  // Controls: results, nothing searched yet, and a failed search say neither.
  for (const [path, plane] of [["/app/finder/pothole", PLANE], ["/app/finder", PLANE], ["/app/finder/x", { search: refused("STORE_DID_NOT_ANSWER", null, 502) }]]) {
    const q = await open(path, plane);
    assert.ok(!text(q).includes(word("screen.finder.covers")), path);
    assert.equal(main(q).querySelector('a[href="/app/capture"]'), null, path);
  }
});

test("R34: every key find reads is a word of the list", () => {
  for (const k of screen("finder").words) assert.ok(hasWord(k), k);
});
