import { test } from "node:test";
import assert from "node:assert/strict";
import { foundIn, wordFold } from "./fixture.mjs";

/* R21: the clauses are found in the canon through the same word conversion the word rows carry (DEC-355: the team
   is written "team" where the canon says "group"; DEC-221: American spelling), and any other change still fails. */
/* The sentences here are invented for the conversion; none is a sentence of the product (K3810). */
test("R21 the normaliser reads the canon through the rows' word conversion: team for group, labeled for labelled, defense for defence, catalog for catalogue", () => {
  assert.ok(foundIn("A clerk files every form that binds the group.", "A clerk files every form that binds the team."));
  assert.ok(foundIn("the group's shelf of forms, never a fixed catalogue", "the team's shelf of forms, never a fixed catalog"));
  assert.ok(foundIn("each form labelled as a draft", "each form labeled as a draft"));
  assert.ok(foundIn("speaking for the group's defence", "speaking for the team's defense"));
  assert.ok(foundIn("some groups", "some teams"));
});

test("R21 control: a genuinely changed word is still not found, through the same conversion", () => {
  assert.ok(!foundIn("A clerk files every form that binds the group.", "A clerk files every form that binds the crew."));
  assert.ok(!foundIn("A clerk files every form that binds the group.", "A clerk files every form that binds the team and the office."));
  assert.ok(!foundIn("each form labelled as a draft", "each form marked as a draft"));
  assert.ok(!foundIn("speaking for the group's defence", "speaking for the team's offence"));
  assert.ok(!foundIn("a fixed catalogue", "a fixed list"));
  assert.notEqual(wordFold("the teamwork of the group"), wordFold("the teamwork of the crew"), "only the whole word team is folded");
});

test("R36 R21 the canon's `<handle>` in a label is read as the row's words for it; control: another changed word in the same clause still fails", () => {
  const who = ["the", "asking", "member's", "handle"].join(" ");
  const canon = "its words arrive labelled \"Tag · asked by <handle>\", filed only when the clerk signs.";
  const row = `its words arrive labeled "Tag · asked by" and ${who}, filed only when the clerk signs.`;
  assert.ok(foundIn(canon, row));
  assert.ok(!foundIn(canon, row.replace("filed only", "kept only")), "a changed word after it fails");
  assert.ok(!foundIn(canon, row.replace(who, "the clerk's name")), "a changed word in the substitution fails");
  assert.ok(!foundIn(canon, row.replace("Tag", "Note")), "a changed word before it fails");
});
