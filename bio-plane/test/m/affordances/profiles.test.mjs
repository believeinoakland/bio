/* affordances, T51 (T51-99; N1236, K3771; DEC-329 (5), K3806): R67, the active profiles' `proceeding_kinds`, and R68, `action_kind_labels`,
   at the store's read that answers them (`op=affordancevocab`, `affordancesOf(host).profileVocabularies()` and its op map), driven over
   the real owners: `jurisdictions.combine` of the instance's `jurisdiction_profiles` setting, and `actions` with its governing view
   (the `actions` fixture's world, the `test-port-ellery` profile and `oakland-alameda` real). The door that hands the answer to
   `vocabulariesFor`, on both arms, is door.test.mjs'; the shaping by `vocabulariesFor` is its too. */
import test from "node:test";
import assert from "node:assert/strict";
import { affordancesOf, affordancesOps } from "../../../src/affordances/facts.mjs";
import { vocabulariesFor, VOCABULARIES } from "../../../src/affordances.mjs";
import { PRODUCT_KINDS } from "../../../src/action-grammar/index.mjs";
import { SETTING_UNREADABLE } from "../../../src/record-core/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { world, V } from "../actions/fixture.mjs";

const read = (w, deps = {}) => affordancesOf(w.host, { record: w.record, actions: w.a, ...deps }).profileVocabularies();
const kindsOf = (view, key) => (view[key] || []).map((k) => k.kind);

test("R67: the combined view of the active profiles answers its proceeding kinds as {kind, label, forum_kind}, in its order, every kind "
   + "once, read at the call; a profile's own label travels as record data", () => {
  const w = world({ profiles: ["test-port-ellery"] });
  const got = read(w);
  const view = combine(["test-port-ellery"]).view;
  assert.equal(got.ok, true);
  assert.deepEqual(got.proceeding_kinds, view.proceeding_kinds.map(({ kind, label, forum_kind }) => ({ kind, label, forum_kind })));
  assert.ok(got.proceeding_kinds.length >= 2 && got.proceeding_kinds.every((k) => typeof k.label === "string" && k.label.length > 0));
  /* at the call, never cached: a change of the active profiles is read at the next call */
  w.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("admin"));
  assert.deepEqual(read(w).proceeding_kinds, (combine(["oakland-alameda"]).view.proceeding_kinds ?? []).map(({ kind, label, forum_kind }) => ({ kind, label, forum_kind })));
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery", "oakland-alameda"], V("admin"));
  assert.deepEqual(kindsOf(read(w), "proceeding_kinds"), kindsOf(combine(["test-port-ellery", "oakland-alameda"]).view, "proceeding_kinds"));
});

test("R67: two profiles naming different kinds answer both, a kind both name once, an entry without a string kind left out, a label that "
   + "is not a string null", () => {
  const w = world({ profiles: ["test-port-ellery"] });
  const stand = (view) => ({ combine: () => ({ ok: true, view }) });
  const got = read(w, stand({ proceeding_kinds: [
    { kind: "a_suit", label: "A suit", forum_kind: "court" }, { kind: "b_inquiry", label: "B inquiry", forum_kind: "commission" },
    { kind: "a_suit", label: "A suit, again", forum_kind: "court" }, { label: "no kind", forum_kind: "court" }, null, { kind: 4 },
    { kind: "c_matter", forum_kind: "auditor" }] }));
  assert.deepEqual(got.proceeding_kinds, [{ kind: "a_suit", label: "A suit", forum_kind: "court" },
    { kind: "b_inquiry", label: "B inquiry", forum_kind: "commission" }, { kind: "c_matter", label: null, forum_kind: "auditor" }]);
});

test("R67: with no profile active the kinds are [] (the setting unset, or an empty list); a combined view that cannot be read leaves the key "
   + "out, never []", () => {
  for (const profiles of [null, []]) {
    const w = world({ profiles });
    assert.deepEqual(read(w).proceeding_kinds, [], JSON.stringify(profiles));
  }
  /* a profile that does not combine, a combine that throws, a setting unreadable or whose read throws: no key */
  const bad = world({ profiles: ["no-such-profile"] });
  assert.equal(Object.hasOwn(read(bad), "proceeding_kinds"), false, "a profile that does not combine");
  const w = world({ profiles: ["test-port-ellery"] });
  assert.equal(Object.hasOwn(read(w, { combine: () => { throw new Error("storage unavailable"); } }), "proceeding_kinds"), false);
  assert.equal(Object.hasOwn(read(w, { combine: () => ({ ok: false }) }), "proceeding_kinds"), false);
  const unreadable = world({ profiles: null });
  assert.equal(Object.hasOwn(read(unreadable, { record: { getSetting: () => SETTING_UNREADABLE } }), "proceeding_kinds"), false);
  assert.equal(Object.hasOwn(read(world({ profiles: null }), { record: { getSetting: () => { throw new Error("gone"); } } }), "proceeding_kinds"), false);
  assert.equal(Object.hasOwn(read(world({ profiles: null }), { record: { getSetting: () => "not json" } }), "proceeding_kinds"), false);
});

test("R68: a profile-defined kind with a label answers kind to label and appears in `action_kind`; a product kind appears in `action_kind` "
   + "and not here; the kinds in `action_kind` are exactly those `actions.kinds()` answers, whatever the labels", () => {
  const w = world({ profiles: ["test-port-ellery"] });
  const got = read(w);
  const kinds = w.a.kinds();
  assert.deepEqual(got.action_kind_labels, { bylaw_complaint: "complaint under the bylaws", commitment_claim: "claim on a budget commitment",
    recognition_letter: "letter of recognition" });
  for (const k of Object.keys(got.action_kind_labels)) assert.ok(kinds.includes(k), `${k} is a kind the instance accepts`);
  for (const k of PRODUCT_KINDS) assert.equal(Object.hasOwn(got.action_kind_labels, k), false, `${k} is the product's own`);
  /* the published answer: `action_kind` is the list of names and the labels beside it, neither disagreeing about which kinds exist */
  const v = vocabulariesFor(kinds, got);
  assert.deepEqual(v.action_kind, kinds);
  assert.deepEqual(kinds.filter((k) => !PRODUCT_KINDS.includes(k)).sort(), Object.keys(v.action_kind_labels).sort());
  /* several profiles: the combined view's kinds, a product kind still not here */
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery", "oakland-alameda"], V("admin"));
  const both = read(w);
  assert.deepEqual(Object.keys(both.action_kind_labels).sort(), w.a.kinds().filter((k) => !PRODUCT_KINDS.includes(k)).sort());
  assert.equal(both.action_kind_labels.grand_jury, combine(["oakland-alameda"]).view.action_kinds.find((k) => k.kind === "grand_jury").label);
});

test("R68: a kind with no label, or an empty one, is left out of the labels and stays in `action_kind`; a kind a confirmed group rule adds, "
   + "with a label, appears in both (the governing view, `local-facts` R12)", () => {
  const group = { ok: true, view: { action_kinds: [{ kind: "group_kind", label: "Group kind label" }, { kind: "no_label_kind" },
    { kind: "empty_label_kind", label: "" }, { kind: "blank_label_kind", label: "   " }, { kind: "number_label_kind", label: 5 },
    { kind: "group_kind", label: "listed twice" }, { kind: "records_request", label: "a product kind relabelled" }] } };
  const w = world({ profiles: [], deps: { localFacts: { governingView: () => group } } });
  const got = read(w);
  assert.deepEqual(got.action_kind_labels, { group_kind: "Group kind label" });
  const kinds = w.a.kinds();
  for (const k of ["group_kind", "no_label_kind", "empty_label_kind", "blank_label_kind", "number_label_kind"]) assert.ok(kinds.includes(k), k);
  assert.deepEqual(got.proceeding_kinds, [], "no profile is active, whatever the group's rules add");
});

test("R68: with no profile active the labels are {}; a governing view that cannot be read leaves the key out, never {}", () => {
  assert.deepEqual(read(world({ profiles: null })).action_kind_labels, {});
  assert.deepEqual(read(world({ profiles: [] })).action_kind_labels, {});
  const bad = world({ profiles: ["no-such-profile"] });
  assert.equal(Object.hasOwn(read(bad), "action_kind_labels"), false);
  const throws = world({ profiles: ["test-port-ellery"] });
  assert.equal(Object.hasOwn(read(throws, { actions: { governingView: () => { throw new Error("gone"); } } }), "action_kind_labels"), false);
  assert.equal(Object.hasOwn(read(throws, { actions: { governingView: () => null } }), "action_kind_labels"), false);
});

test("R67 R68 R22: the read is the module's own store route `affordancevocab`, answers {ok: true, ...} and writes nothing; no vocabulary "
   + "other than `action_kind` and these two moves with the profiles", () => {
  const w = world({ profiles: ["test-port-ellery"] });
  const facts = affordancesOf(w.host, { record: w.record, actions: w.a });
  const ops = affordancesOps(facts, new URL("http://do/affordancevocab"));
  assert.ok(Object.hasOwn(ops, "affordancevocab"));
  const snapshot = () => JSON.stringify([w.rows("SELECT * FROM settings"), w.rows("SELECT bundle_id FROM bundles")]);
  const before = snapshot();
  const a = ops.affordancevocab();
  assert.deepEqual(a, facts.profileVocabularies());
  assert.equal(a.ok, true);
  assert.equal(snapshot(), before, "writes nothing");
  /* control: the published answer without the profiles' keys is the one without them */
  const withProfile = vocabulariesFor(w.a.kinds(), a), without = vocabulariesFor(w.a.kinds());
  assert.deepEqual(Object.keys(withProfile).filter((k) => !(k in without)).sort(), ["action_kind_labels", "proceeding_kinds"]);
  for (const k of Object.keys(VOCABULARIES)) if (k !== "action_kind") assert.equal(withProfile[k], VOCABULARIES[k], k);
  /* the other profile changes only the kinds' lists */
  w.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("admin"));
  const other = vocabulariesFor(w.a.kinds(), read(w));
  for (const k of Object.keys(VOCABULARIES)) if (k !== "action_kind") assert.equal(other[k], VOCABULARIES[k], k);
});
