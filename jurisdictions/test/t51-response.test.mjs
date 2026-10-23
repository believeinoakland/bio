/* jurisdictions, T51 fix round 4 (C64-law; K4438): a records law names its own first-request window (R96) and a deadline has
 * words (R97). Tested at the module's interface: get, validate, combine. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { get, validate, combine } from "../index.mjs";

const FIRST = "oakland-alameda", TEST = "test-port-ellery";
const law = (p, name) => p.records_laws.find((l) => l.name === name);
const rule = (p, r) => p.deadlines.find((d) => d.rule === r);
const bad = (r, code, path) => r.errors.some((e) => e.code === code && e.path === path);

test("R96 each of the first profile's records laws names its first-request window; the federal law's is clause (A)(i)", () => {
  const p = get(FIRST);
  assert.equal(law(p, "California Public Records Act").response, "records_response");
  assert.equal(law(p, "Oakland Sunshine Ordinance").response, "immediate_disclosure");
  const foia = law(p, "Freedom of Information Act");
  assert.equal(foia.response, "foia_response");
  const win = rule(p, foia.response);
  assert.equal(win.applies_to, "records_request");
  assert.equal(win.citation, "5 U.S.C. § 552(a)(6)(A)(i)", "a first request is clause (i)'s, never the appeal's (ii)");
  assert.equal(win.amount, 20);
  assert.equal(win.count, "business");
  assert.equal(validate(p).ok, true);
  assert.equal(validate(get(TEST)).ok, true, "the test profile supplies it too");
  assert.ok(law(get(TEST), "Freedom of Records Act (test)").response);
});

test("R96 a response naming no deadline, or one that does not apply to a records request, is refused; control: a real rule is accepted", () => {
  const none = get(FIRST);
  law(none, "Freedom of Information Act").response = "no_such_rule";
  assert.ok(bad(validate(none), "VALUE_INVALID", `records_laws[${none.records_laws.findIndex((l) => l.name === "Freedom of Information Act")}].response`));
  const other = get(FIRST);
  law(other, "Freedom of Information Act").response = "claim_presentation_other";
  assert.equal(validate(other).ok, false, "a rule that binds a claim is no records window");
  const typed = get(FIRST);
  law(typed, "Freedom of Information Act").response = 7;
  assert.equal(validate(typed).ok, false);
  const ok = get(FIRST);
  law(ok, "Freedom of Information Act").response = "foia_appeal_response";
  assert.equal(validate(ok).ok, true, "control: any records_request rule of the profile is accepted");
});

test("R97 the federal deadlines carry their labels; an empty label is refused; combine keeps a label and withholds a disagreement", () => {
  const p = get(FIRST);
  assert.equal(rule(p, "foia_response").label, "answer to a first request");
  assert.equal(rule(p, "foia_appeal_response").label, "decision on an appeal");
  const empty = get(FIRST);
  rule(empty, "foia_response").label = "";
  assert.ok(validate(empty).errors.some((e) => e.path.endsWith(".label")), "an empty label is refused at its field");
  const view = combine([FIRST]).view;
  assert.equal(view.deadlines.find((d) => d.rule === "foia_response").label, "answer to a first request");
  assert.equal(view.records_laws.find((l) => l.name === "Freedom of Information Act").response, "foia_response");

  const a = get(FIRST), b = get(FIRST);
  b.id = "other-first"; b.name = "other"; b.covers = ["x"];
  rule(b, "foia_response").label = "reply to the first request";
  law(b, "Freedom of Information Act").response = "foia_appeal_response";
  const c = combine([a, b]);
  assert.equal(c.ok, true);
  assert.ok(c.conflicts.some((x) => /label/.test(x.at) || /foia_response/.test(x.at)), "a differing label is a conflict");
  assert.ok(c.conflicts.some((x) => x.at === "records_laws[Freedom of Information Act].response"), "a differing window is a conflict");
  assert.equal(c.view.records_laws.find((l) => l.name === "Freedom of Information Act").response, undefined, "neither is chosen");
});
