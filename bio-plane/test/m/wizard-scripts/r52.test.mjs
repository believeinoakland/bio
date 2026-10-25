/* wizard-scripts R52 (T51 fix round 10; SCREENS-WIZARDS #7 J6 (3); K5186; amends R11): each row wizardsAt answers carries
   `required`, as R10 serves it, `false` on the caller's own draft, so a screen marks a required script wherever it lists it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, LIBRARY } from "./fixture.mjs";

const F = V("frank");
const REQUIRED = LIBRARY.find((e) => e.required);
const OPTIONAL = LIBRARY.find((e) => !e.required);

test("R52 wizardsAt carries `required` on every row it answers: a required library script true, a group script false, and the caller's own draft false", () => {
  const w = seeded();
  const group = approved(w, { name: "On case home" });
  const mine = draft(w, { name: "Frank's draft" });
  const at = w.wz.wizardsAt({ screen: "case-home", viewer: F });
  assert.equal(at.ok, true);
  const byVersion = Object.fromEntries(at.scripts.map((s) => [s.version, s]));
  assert.equal(byVersion[`${REQUIRED.id}@${REQUIRED.version}`].required, true, "a required library script serves required: true");
  assert.equal(byVersion[group.version].required, false, "a group script serves required: false");
  assert.equal(byVersion[mine.version].required, false, "the caller's own draft serves required: false");
  for (const s of at.scripts) assert.equal(typeof s.required, "boolean", `${s.version} carries a boolean required`);
});

test("R52 wizardsAt's `required` agrees with R10's `wizards` for the same optional library script, and it serves required: false", () => {
  const w = seeded();
  const row = w.wz.wizardsAt({ screen: "publish", viewer: F }).scripts.find((s) => s.id === OPTIONAL.id);
  assert.ok(row, "the optional library script starts on publish and is offered");
  assert.equal(row.required, false);
  const listed = w.wz.wizards({ viewer: F }).scripts.find((s) => s.id === OPTIONAL.id);
  assert.ok(listed, "wizards lists the same script");
  assert.equal(row.required, listed.required, "wizardsAt and wizards agree on required");
});

test("R52 control: an unknown screen answers no rows, and every row a screen answers carries the key required", () => {
  const w = seeded();
  assert.deepEqual(w.wz.wizardsAt({ screen: "nowhere", viewer: F }).scripts, []);
  const at = w.wz.wizardsAt({ screen: "case-home", viewer: F });
  assert.ok(at.scripts.length > 0, "case-home lists at least one row");
  assert.ok(at.scripts.every((s) => "required" in s), "every row answered carries required");
});
