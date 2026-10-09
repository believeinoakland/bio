/* reading-guides: the registered conduct check (R4; K31's pattern; K2472). `skills` registers its R16
   `controlFlowAuthority` at start; this file registers a stand-in of the same shape (text in, a list of pattern names
   out), since a later module is not this one's to import (P4). Each test file runs in its own process, so the one
   registration here is this file's alone (`check.test.mjs` holds the case with none). */
import test from "node:test";
import assert from "node:assert/strict";
import { registerConductCheck, conductCheckHolder, checkGuide } from "../../../src/reading-guides/index.mjs";
import { world, row, item, ITEMS, ANN, BOB } from "./fixture.mjs";

/* The stand-in: a pass budget ("at most 3 passes") or a stopping rule ("until"). `throwOn` makes it fail. */
const asked = [];
let mode = "normal";
const flow = (text) => {
  asked.push(text);
  if (mode === "throw") throw new Error("broken check");
  if (mode === "junk") return "not a list";
  const out = [];
  if (/\b\d+ passes\b/i.test(text)) out.push("pass_budget");
  if (/\buntil\b/i.test(text)) out.push("termination_condition");
  return out;
};

test("R4 the registration: malformed refused, the first stands, a second refused PROVIDER_DECLARED naming the holder", () => {
  assert.equal(conductCheckHolder(), null);
  assert.deepEqual(registerConductCheck("not a function"), { ok: false, reason: "PROVIDER_MALFORMED", module: "skills",
    detail: "a conduct check is a function of one text" });
  assert.equal(conductCheckHolder(), null, "a malformed registration registers nothing");
  assert.deepEqual(registerConductCheck(flow), { ok: true, module: "skills" });
  assert.equal(conductCheckHolder(), "skills");
  const second = registerConductCheck(() => [], "another");
  assert.equal(second.ok, false);
  assert.equal(second.reason, "PROVIDER_DECLARED");
  assert.match(second.detail, /skills already registered/);
  assert.equal(conductCheckHolder(), "skills", "the first stands");
});

test("R4 with the check registered, an item carrying a control-flow pattern is refused, in any field, naming it", () => {
  for (const field of ["label", "look_for", "where"]) {
    const it = { label: "L", look_for: "Look for the totals", where: "page 1" };
    it[field] = field === "look_for" ? "Look for totals until none are left" : "read it until none are left";
    const r = checkGuide([item(), it]);
    row(r, "GUIDE_CARRIES_CONDUCT");
    assert.deepEqual([r.item, r.field, r.found], [1, field, { list: "registered", patterns: ["termination_condition"] }]);
    assert.match(r.detail, /termination_condition/);
  }
  row(checkGuide([item("L", "Look for totals in 3 passes")]), "GUIDE_CARRIES_CONDUCT");
  /* negative control: every text of a clean guide is asked, and passes */
  asked.length = 0;
  assert.equal(checkGuide(ITEMS).ok, true);
  assert.deepEqual(asked, ["Fiscal impact", "Look for the fiscal impact and who pays it", "Votes",
                           "Note whether the vote was unanimous", "the minutes' record of the vote"]);
});

test("R4 the closed lists are asked first: a listed word is named as such, not as the registered check's", () => {
  const r = checkGuide([item("L", "Look for the assistant's totals until done")]);
  assert.deepEqual(r.found, { list: "party", word: "assistant" });
});

test("R4 fail closed: a registered check that throws or answers no list refuses the item", () => {
  for (const m of ["throw", "junk"]) {
    mode = m;
    const r = checkGuide(ITEMS);
    row(r, "GUIDE_CARRIES_CONDUCT");
    assert.deepEqual(r.found, { list: "registered", patterns: null, unreadable: true });
    assert.equal(r.item, 0);
  }
  mode = "normal";
  assert.equal(checkGuide(ITEMS).ok, true, "control: the same items pass once it answers");
});

test("R4 every draft, review, adoption and offer runs it (and R5's reads pass over a guide that now fails)", () => {
  const w = world();
  const bad = [item("L", "Look for totals until none are left")];
  row(w.g.guideDraft({ kind: "staff_report", items: bad, by: ANN }), "GUIDE_CARRIES_CONDUCT");
  /* a guide drafted while the check passed it, then the check tightens */
  const id = w.draft({ items: [item("L", "Look for the totals")] });
  const offered = (() => { const g = w.groupGuide({ items: [item("M", "Look for the motion")] }); return g; })();
  mode = "throw";
  row(w.g.guideReview({ guide: id, verdict: "approve", by: BOB }), "GUIDE_CARRIES_CONDUCT");
  row(w.g.guideOffer({ guide: offered, by: ANN }), "GUIDE_CARRIES_CONDUCT");
  const f = w.g.guideFor({ kind: "staff_report", viewer: ANN });
  assert.equal(f.guide, null, "nothing in force passes now");
  assert.deepEqual(f.withheld.map((x) => x.guide).sort(), [id, offered].sort());
  mode = "normal";
  const bytes = w.g.guideOffer({ guide: offered, by: ANN }).bytes;
  mode = "throw";
  row(w.g.guideAdopt({ bytes, by: BOB }), "GUIDE_CARRIES_CONDUCT");
  mode = "normal";
  assert.equal(w.g.guideAdopt({ bytes, by: BOB }).ok, true, "control: adopted once the check passes it");
  assert.equal(w.g.guideReview({ guide: id, verdict: "approve", by: BOB }).ok, true);
});
