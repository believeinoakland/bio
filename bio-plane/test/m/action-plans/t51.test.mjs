/* action-plans T51 fix round 10 (live walk E K10-1, K4; walk C C-M17): R54. Starting an option records the tier its
   fields state on the action it creates; an addressee with an empty role or organisation is refused by name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, by, OFFICE, FIRST } from "./fixture.mjs";
import { ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const code = (r) => r.code ?? r.reason;
const start = (w, opt, extra = {}) => w.ap.optionStart({ plan: w.PL, option: opt, kind: "other", ...by("bob"), ...FIRST, ...extra });
const add = (w, extra) => w.ap.optionAdd({ plan: w.PL, summary: "Write to the press", category: "awareness", subjects: [w.S1], ...by("bob"), ...extra });

test("R54: starting a chosen legal option with tier 1, 2 or 3 records that tier on the action as its first risk-tier history entry, by the starter, in the start's own transaction; no tier, or an undetermined one, leaves the action undetermined (control)", () => {
  for (const tier of [1, 2, 3]) {
    const w = seeded();
    opened(w);
    const o = option(w, { category: "legal", tier, addressee: OFFICE });
    choose(w, [o]);
    const r = start(w, o);
    assert.equal(r.ok, true, JSON.stringify(r));
    const fm = w.fm(r.action);
    assert.equal(fm.risk_tier, tier, `the action carries tier ${tier}`);
    assert.equal(fm.risk_tier_history.length, 1, "one history entry");
    const h = fm.risk_tier_history[0];
    assert.equal(h.tier, tier); assert.equal(h.prior, "undetermined"); assert.equal(h.by, "member:bob");
    assert.ok(typeof h.reason === "string" && h.reason.length > 0, "the entry says why");
    const read = w.actions.actionRead({ id: r.action, viewer: "member:bob" });
    assert.equal(read.risk_tier, tier, "the action's read answers the tier");
    assert.equal(read.risk_tier_history.revisions.length, 1);
  }
  /* control: no tier stated, an undetermined tier, and an awareness option leave the tier undetermined and the history empty */
  for (const fields of [{ category: "legal" }, { category: "legal", tier: "undetermined" }, { category: "awareness" }]) {
    const w = seeded();
    opened(w);
    const o = option(w, { ...fields, addressee: OFFICE });
    choose(w, [o]);
    const r = start(w, o);
    assert.equal(r.ok, true, JSON.stringify(r));
    const fm = w.fm(r.action);
    assert.ok(fm.risk_tier === undefined || fm.risk_tier === "undetermined", JSON.stringify(fields));
    assert.equal((fm.risk_tier_history || []).length, 0, JSON.stringify(fields));
  }
});

test("R54: the start's preview leaves no tier entry behind, and the real start after it records exactly one (control)", () => {
  const w = seeded();
  opened(w);
  const o = option(w, { category: "legal", tier: 2, addressee: OFFICE });
  choose(w, [o]);
  const p = w.ap.optionStartPreview({ plan: w.PL, option: o, kind: "other", ...by("bob"), ...FIRST });
  assert.ok(p, "the preview answers");
  assert.equal(w.count("bundles WHERE object_type='action'"), 0, "the preview wrote no action");
  const r = start(w, o);
  assert.equal(w.fm(r.action).risk_tier_history.length, 1);
});

test("R54: an addressee whose role or organisation is empty is refused ADDRESSEE_INCOMPLETE naming each empty field, its own code and check, never the private-individual sentence; a missing shape stays ADDRESSEE_REFUSED (control)", () => {
  const w = seeded();
  opened(w);
  const press = { state: "named", kind: "press", role: "", organisation: "" };
  const both = add(w, { addressee: press });
  assert.equal(code(both), "ADDRESSEE_INCOMPLETE");
  assert.deepEqual(both.empty, ["role", "organisation"]);
  assert.equal(both.check, ACTION_PLAN_CHECKS.ADDRESSEE_INCOMPLETE.check);
  assert.notEqual(both.check, ACTION_PLAN_CHECKS.ADDRESSEE_REFUSED.check, "a code and check of its own");
  assert.equal(both.translation, ACTION_PLAN_CHECKS.ADDRESSEE_INCOMPLETE.translation);
  assert.notEqual(both.translation, ACTION_PLAN_CHECKS.ADDRESSEE_REFUSED.translation);
  assert.match(both.detail, /role/); assert.match(both.detail, /organisation/);
  assert.doesNotMatch(both.detail, /private individual/);
  const outlet = add(w, { addressee: { ...press, role: "Reporter" } });
  assert.equal(code(outlet), "ADDRESSEE_INCOMPLETE");
  assert.deepEqual(outlet.empty, ["organisation"]);
  assert.match(outlet.detail, /organisation/); assert.doesNotMatch(outlet.detail, /role/);
  const role = add(w, { addressee: { ...press, organisation: "The Daily" } });
  assert.deepEqual(role.empty, ["role"]);
  const spaces = add(w, { addressee: { ...press, role: "   ", organisation: "The Daily" } });
  assert.deepEqual(spaces.empty, ["role"], "blank is empty");
  const office = add(w, { addressee: { ...OFFICE, role: "" } });
  assert.equal(code(office), "ADDRESSEE_INCOMPLETE");
  assert.deepEqual(office.empty, ["role"]);
  /* controls: a whole addressee lands; a private person, or an absent field, keeps the old refusal */
  assert.equal(add(w, { addressee: { ...press, role: "Reporter", organisation: "The Daily" } }).ok, true);
  const person = add(w, { addressee: { state: "named", name: "Jane Doe" } });
  assert.equal(code(person), "ADDRESSEE_REFUSED");
  assert.equal(person.translation, ACTION_PLAN_CHECKS.ADDRESSEE_REFUSED.translation);
  assert.equal(code(add(w, { addressee: { state: "named", kind: "press", role: "Reporter" } })), "ADDRESSEE_REFUSED", "absent, not empty");
  assert.equal(code(add(w, { addressee: { state: "named", kind: "person", role: "", organisation: "" } })), "ADDRESSEE_REFUSED", "an unknown kind");
});

test("R54: optionRevise refuses an emptied role or organisation the same way", () => {
  const w = seeded();
  opened(w);
  const o = add(w, { addressee: { state: "named", kind: "press", role: "Reporter", organisation: "The Daily" } }).option;
  const r = w.ap.optionRevise({ plan: w.PL, option: o, addressee: { state: "named", kind: "press", role: "Reporter", organisation: "" }, reason: "Fix", ...by("bob") });
  assert.equal(code(r), "ADDRESSEE_INCOMPLETE");
  assert.deepEqual(r.empty, ["organisation"]);
});
