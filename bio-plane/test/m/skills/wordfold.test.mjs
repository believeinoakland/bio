import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTION_RULES, ACTION_SOURCE } from "../../../src/skilldoctrine.mjs";
import { read, foundIn, section, wordFold } from "./fixture.mjs";

/* R21: the clauses are found in the canon through the same word conversion the word rows carry (DEC-355: the team
   is written "team" where the canon says "group"; DEC-221: American spelling), and any other change still fails. */
test("R21 the normaliser reads the canon through the rows' word conversion: team for group, labeled for labelled, defense for defence, catalog for catalogue", () => {
  assert.ok(foundIn("A member takes every act that commits the group.", "A member takes every act that commits the team."));
  assert.ok(foundIn("the group's own earlier plans, never from a fixed catalogue", "the team's own earlier plans, never from a fixed catalog"));
  assert.ok(foundIn("always labelled as machine work", "always labeled as machine work"));
  assert.ok(foundIn("for the group's defence", "for the team's defense"));
  assert.ok(foundIn("some groups", "some teams"));
});

test("R21 control: a genuinely changed word is still not found, through the same conversion", () => {
  assert.ok(!foundIn("A member takes every act that commits the group.", "A member takes every act that commits the crew."));
  assert.ok(!foundIn("A member takes every act that commits the group.", "A member takes every act that commits the team and the office."));
  assert.ok(!foundIn("always labelled as machine work", "always marked as machine work"));
  assert.ok(!foundIn("for the group's defence", "for the team's offence"));
  assert.ok(!foundIn("a fixed catalogue", "a fixed list"));
  assert.notEqual(wordFold("the teamwork of the group"), wordFold("the teamwork of the crew"), "only the whole word team is folded");
});

test("R21 the rendered rule sentences, read through localize, are found in the canon's rule by the same conversion; the canon's wording is not changed", () => {
  const rule = (n) => (section(read(ACTION_SOURCE), "4. The rules").split("\n").find((l) => l.startsWith(`${n}. `)) ?? "");
  const r1 = ACTION_RULES.find((r) => r.rule === 1).sentences[0];
  assert.ok(foundIn(rule(1), r1), "the row's sentence is the canon's");
  assert.ok(!foundIn(rule(1), r1.replace("approving", "rejecting")), "control: a changed word fails");
  assert.ok(rule(1).includes("the group"), "the canon still says group");
});
