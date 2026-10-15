/* screens-action R9 (DEC-209 (5)): How a records request works, reached from `request`: what the office must do (each
   sentence with the particulars the profile names, and none the profile does not name), the profile's faster request
   where held, what a portal shows, what the group's Civicsmith does with the due date, its sources listed; no place named
   in its words (interface-shell R23). Every sentence is asserted by its key through `setup-words` (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, text, ops, ok, W, hasWord, DATA_PLANE, PROFILES } from "./page.mjs";

const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
const unsaid = (p, key, vars) => assert.ok(!text(p).includes(W(key, vars)), key);

test("R9: what the office must do from the profile's response period, the faster request from the profile's view, what a portal shows, what the group's Civicsmith does with the due date, and the sources", async () => {
  const p = await open("/app/help-records", DATA_PLANE);
  assert.equal(p.byOp("profiles").length, 1);
  said(p, "screen.help-records.must");
  said(p, "screen.help-records.must.1", { days: "10", cite: "Gov. Code § 7922.535(b)" });
  said(p, "screen.help-records.faster");
  assert.ok(text(p).includes(`Mun. Code § 2.20.230 · ${W("screen.request.window.business", { n: "3" })}`));
  said(p, "screen.help-records.thefaster");
  said(p, "screen.help-records.faster.when");
  said(p, "screen.help-records.portal");
  for (const n of [1, 2, 3]) said(p, `screen.help-records.portal.${n}`);
  said(p, "screen.help-records.does");
  said(p, "screen.help-records.does.text");
  said(p, "screen.help-records.sources");
  assert.ok(text(p).includes("Gov. Code § 7922.535(b); Gov. Code § 7922.535(c); Mun. Code § 2.20.230"));
  assert.doesNotMatch(text(p), /Open meetings law/, "only the records request's laws");
  assert.deepEqual(ops(p), []);
});

test("R9, R19: a must sentence the profile does not fully name is not drawn, never drawn short or with a placeholder in it", async () => {
  const p = await open("/app/help-records", DATA_PLANE);
  assert.doesNotMatch(text(p), /\{\w+\}/, "no placeholder is drawn");
  // the profile names the response period and its citation: the first sentence only (its records help is the profile's to add)
  for (const n of [2, 3, 4, 5, 6, 7]) assert.ok(hasWord(`screen.help-records.must.${n}`));
  for (const n of [2, 3, 4, 5, 6, 7]) assert.ok(!text(p).includes(W(`screen.help-records.must.${n}`, { days: "10", cite: "Gov. Code § 7922.535(b)", cite2: "x", cite3: "x", reasons: "x", extra: "14" })), `must.${n} is not drawn`);
});

test("R9: control: a profile naming no faster request draws only the law it names, marked as none faster", async () => {
  const one = { ...PROFILES, view: { deadlines: [PROFILES.view.deadlines[0]] } };
  const p = await open("/app/help-records", { ...DATA_PLANE, profiles: ok(one) });
  assert.ok(text(p).includes(`Gov. Code § 7922.535(b) · ${W("screen.request.window.calendar", { n: "10" })}`));
  unsaid(p, "screen.help-records.thefaster");
  unsaid(p, "screen.help-records.faster.when");
  const none = await open("/app/help-records", { ...DATA_PLANE, profiles: ok({ ...PROFILES, view: {} }) });
  // R14: with no law named, the sections that would hold laws hold nothing and are not drawn
  unsaid(none, "screen.help-records.faster");
  unsaid(none, "screen.help-records.sources");
  unsaid(none, "screen.help-records.must");
  said(none, "screen.help-records.portal");
  said(none, "screen.help-records.does");
});
