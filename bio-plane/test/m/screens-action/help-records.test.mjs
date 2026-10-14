/* screens-action R9 (DEC-209 (5)): How a records request works, reached from `request`: what the office must do, the
   profile's faster request where held, what a portal shows, what the group's Civicsmith does with the due date, its
   sources listed; no place named in its words (interface-shell R23). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, text, ops, ok, DATA_PLANE, PROFILES } from "./page.mjs";

test("R9: what the office must do, the faster request from the profile's view, what a portal shows, what the group's Civicsmith does with the due date, and the sources", async () => {
  const p = await open("/app/help-records", DATA_PLANE);
  assert.equal(p.byOp("profiles").length, 1);
  const t = text(p);
  for (const s of ["What the office must do", "Never ask why you want them.", "The faster request", "Mun. Code § 2.20.230 · an answer within 3 business days",
    "the faster request", "What a public portal shows", "shows its full text to anyone", "What your group's Civicsmith does with it",
    "works out the due date from the law and your group's calendar", "Sources", "Gov. Code § 7922.535(b); Gov. Code § 7922.535(c); Mun. Code § 2.20.230"]) assert.ok(t.includes(s), s);
  assert.doesNotMatch(t, /Open meetings law/, "only the records request's laws");
  assert.deepEqual(ops(p), []);
});

test("R9: control: a profile naming no faster request draws only the law it names, marked as none faster", async () => {
  const one = { ...PROFILES, view: { deadlines: [PROFILES.view.deadlines[0]] } };
  const p = await open("/app/help-records", { ...DATA_PLANE, profiles: ok(one) });
  assert.match(text(p), /Gov. Code § 7922.535\(b\) · an answer within 10 days/);
  assert.doesNotMatch(text(p), /the faster request/, "no law marked faster");
  assert.doesNotMatch(text(p), /suits a small set of records/);
  const none = await open("/app/help-records", { ...DATA_PLANE, profiles: ok({ ...PROFILES, view: {} }) });
  // R14: with no law named, the sections that would hold laws hold nothing and are not drawn
  assert.doesNotMatch(text(none), /The faster request|Sources|no law/);
  assert.match(text(none), /What the office must do/);
});
