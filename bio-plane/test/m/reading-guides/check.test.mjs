/* reading-guides: the guide check with no conduct check registered (R4, R10). This file registers nothing, so R4
   checks only its own closed lists (BOB's, K2472), here tested whole. */
import test from "node:test";
import assert from "node:assert/strict";
import { checkGuide, conductCheckHolder, LOOK_FOR_OPENERS, CONDUCT_LISTS, ITEMS_MAX, LABEL_MAX, LOOK_FOR_MAX, WHERE_MAX,
         ITEM_FIELDS } from "../../../src/reading-guides/index.mjs";
import { row, item, ITEMS } from "./fixture.mjs";

test("R4 the closed lists are exactly BOB's (K2472), frozen", () => {
  assert.deepEqual([...LOOK_FOR_OPENERS], ["Look for", "Note whether", "Note where", "Check whether", "Check that", "Watch for", "Compare"]);
  assert.deepEqual(JSON.parse(JSON.stringify(CONDUCT_LISTS)), {
    op_form: ["op="],
    tool_or_act: ["run", "call", "fetch", "search", "capture", "post", "send", "sign", "publish", "approve", "delete", "tool", "grant"],
    party: ["assistant", "Civicsmith", "model", "AI"],
    rule_or_permission: ["permission", "permitted", "allowed", "must", "rule", "instruction"],
  });
  assert.ok(Object.isFrozen(LOOK_FOR_OPENERS) && Object.isFrozen(CONDUCT_LISTS));
  for (const l of Object.values(CONDUCT_LISTS)) assert.ok(Object.isFrozen(l));
  assert.deepEqual([...ITEM_FIELDS], ["label", "look_for", "where"]);
  assert.equal(conductCheckHolder(), null, "nothing registered in this file");
});

test("R4 `may` is not on the list (K2482): a month's name passes, and a stated permission is still refused by `allowed`", () => {
  assert.equal(checkGuide([item("Budget", "Look for the May budget amendment")]).ok, true);
  assert.equal(checkGuide([item("L", "Look for what the clerk may file", "the May packet")]).ok, true);
  assert.equal(checkGuide([item("L", "Look for what is allowed")]).found.word, "allowed");
});

test("R4 every opener makes a look-for statement, any case; anything else is refused (negative control)", () => {
  for (const o of LOOK_FOR_OPENERS) for (const s of [o, o.toLowerCase(), o.toUpperCase()]) {
    const r = checkGuide([item("Label", `${s} the date of the hearing`)]);
    assert.equal(r.ok, true, `${s}: ${JSON.stringify(r)}`);
  }
  for (const s of ["The date of the hearing", "Looking for the date", "Lookfor the date", "Comparing the totals",
                   "Compared totals", "Find the date of the hearing", "Summarise the hearing", "Note the date"]) {
    const r = checkGuide([item("Label", s)]);
    row(r, "GUIDE_CARRIES_CONDUCT");
    assert.deepEqual(r.found, { list: "not_look_for" }, s);
    assert.equal(r.field, "look_for");
  }
});

test("R4 every word of every conduct list is refused in every field, whole-word and any case, naming the item", () => {
  for (const [list, words] of Object.entries(CONDUCT_LISTS)) for (const word of words) for (const field of ITEM_FIELDS)
    for (const spelled of [word, word.toUpperCase(), word.toLowerCase()]) {
      const it = { label: "Label", look_for: "Look for the date", where: "the cover page" };
      it[field] = field === "look_for" ? `Look for ${spelled}x and ${spelled}` : `${spelled} here`;
      const r = checkGuide([item(), it]);
      row(r, "GUIDE_CARRIES_CONDUCT");
      assert.equal(r.item, 1, `${word} in ${field}`);
      assert.equal(r.label, it.label.trim());
      assert.equal(r.field, field, `${word} in ${field}`);
      assert.equal(r.found.list, list);
      assert.match(r.detail, /item 2/);
    }
  /* op= is matched at its start as a form: op=frontier, OP=x */
  for (const t of ["op=frontier", "the OP=x form", "(op=read)"]) assert.equal(checkGuide([item("L", `Look for ${t}`)]).found.list, "op_form", t);
});

test("R4 whole words only: a conduct word inside a longer word passes (negative control for every word)", () => {
  for (const words of Object.values(CONDUCT_LISTS)) for (const word of words) {
    if (word === "op=") { assert.equal(checkGuide([item("L", "Look for shop=open and stop=2")]).ok, true); continue; }
    const r = checkGuide([item("L", `Look for x${word.toLowerCase()} and ${word.toLowerCase()}9 totals`)]);
    assert.equal(r.ok, true, `${word}: ${JSON.stringify(r)}`);
  }
  /* real words that merely contain a listed one */
  for (const s of ["Look for the posted agenda", "Look for any rules-based fee", "Watch for signatures on page 2",
                   "Note whether the runoff is scheduled", "Check whether the approved budget changed"])
    assert.equal(checkGuide([item("L", s)]).ok, true, s);
});

test("R4 the items' shape: 1 to 50 items of a label, a look-for and an optional where, short plain text", () => {
  assert.deepEqual(checkGuide(ITEMS), { ok: true, items: ITEMS });
  assert.deepEqual(checkGuide([{ label: "  L ", look_for: " Look for x ", where: "   " }]), { ok: true, items: [{ label: "L", look_for: "Look for x" }] });
  assert.equal(checkGuide(Array.from({ length: ITEMS_MAX }, () => item())).ok, true);
  assert.equal(checkGuide([item("x".repeat(LABEL_MAX), `Look for ${"x".repeat(LOOK_FOR_MAX - 9)}`, "w".repeat(WHERE_MAX))]).ok, true);
  for (const bad of [undefined, null, "items", {}, [], Array.from({ length: ITEMS_MAX + 1 }, () => item()),
                     [null], ["Look for x"], [{ label: "L" }], [{ look_for: "Look for x" }], [{ label: "", look_for: "Look for x" }],
                     [{ label: "L", look_for: "  " }], [{ label: 1, look_for: "Look for x" }], [{ label: "L", look_for: "Look for x", where: 3 }],
                     [{ label: "L", look_for: "Look for x", grade: "high" }], [{ label: "L", look_for: "Look for x", conclusion: "c" }],
                     [item("x".repeat(LABEL_MAX + 1))], [item("L", `Look for ${"x".repeat(LOOK_FOR_MAX)}`)],
                     [item("L", "Look for x", "w".repeat(WHERE_MAX + 1))], [item("L", "Look for x\nthen y")], [item("L\u0000", "Look for x")]])
    row(checkGuide(bad), "GUIDE_ITEMS_REFUSED");
  assert.equal(checkGuide([item(), {}]).item, 1, "the bad item is named");
});

test("R4 pure: it writes nothing to the items it is given and never throws", () => {
  const items = [{ label: " L ", look_for: " Look for x " }];
  const copy = JSON.parse(JSON.stringify(items));
  checkGuide(items);
  assert.deepEqual(items, copy);
  const hostile = [{ get label() { throw new Error("boom"); }, look_for: "Look for x" }];
  assert.doesNotThrow(() => checkGuide(hostile));
});

test("R10 a guide never grades, concludes or names a body's conduct: no field for it, and such text is refused", () => {
  for (const s of ["The council violated the open meetings law", "This report is misleading", "Grade: poor",
                   "Conclude that the budget is short", "Rate the staff report from 1 to 5"])
    row(checkGuide([item("L", s)]), "GUIDE_CARRIES_CONDUCT");
  for (const extra of ["grade", "verdict", "conclusion", "rating", "conduct"])
    row(checkGuide([{ label: "L", look_for: "Look for x", [extra]: "y" }]), "GUIDE_ITEMS_REFUSED");
  /* negative control: what to look for and where passes */
  assert.equal(checkGuide([item("Open meeting", "Check whether the agenda was posted 72 hours before", "the agenda's header")]).ok, true);
});
