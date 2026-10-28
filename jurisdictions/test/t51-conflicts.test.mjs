/* jurisdictions, T51 (T51-170; K3957; the words rule, setup-words R13–R14): the conflict notes `combine` gives when the
 * active profiles disagree, each now read through `localize`. Tested at the module's interface: a real disagreement
 * between two profiles gives a conflict at the field, its note is a non-empty sentence, and identical profiles give none
 * (the control). No test holds a note's text (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { get, combine } from "../index.mjs";

const TEST = "test-port-ellery";

/* Two profiles that differ only in what `change` makes them differ in; each is a copy of the test profile. */
const pair = (change) => {
  const one = get(TEST);
  one.id = "one-ellery";
  one.name = "One";
  one.covers = ["One"];
  const two = get(TEST);
  two.id = "two-ellery";
  two.name = "Two";
  two.covers = ["Two"];
  change(one, two);
  return combine([one, two]);
};
const conflictAt = (r, end) => r.conflicts.find((c) => c.at === end || c.at.endsWith(end));
const assertNote = (c, label) => {
  assert.ok(c, `${label}: a conflict is given at the field`);
  assert.equal(typeof c.says, "string", `${label}: the conflict says why`);
  assert.ok(c.says.length > 0, `${label}: the note is not empty`);
};
const control = (label, end) => {
  const r = combine([TEST, get(TEST)]);
  assert.equal(conflictAt(r, end), undefined, `${label}: identical profiles give no conflict`);
};

test("jurisdictions.index.minutes_due_conflict: profiles giving different minutes periods conflict at practice; identical ones do not", () => {
  const r = pair((a, b) => { a.practice.minutes_due_days.value = 7; b.practice.minutes_due_days.value = 9; });
  assertNote(conflictAt(r, "practice.minutes_due_days"), "minutes");
  control("minutes", "practice.minutes_due_days");
});

test("jurisdictions.index.locale_conflict: profiles naming different locales conflict at locale; identical ones do not", () => {
  const r = pair((a, b) => { a.locale = { value: "fr-CA", basis: "TEST" }; b.locale = { value: "de-DE", basis: "TEST" }; });
  assertNote(conflictAt(r, "locale"), "locale");
  control("locale", "locale");
});

test("jurisdictions.index.time_zone_conflict: profiles naming different time zones conflict at time_zone; identical ones do not", () => {
  const r = pair((a, b) => { a.time_zone = { ...a.time_zone, value: "Europe/Paris" }; b.time_zone = { ...b.time_zone, value: "Asia/Tokyo" }; });
  assertNote(conflictAt(r, "time_zone"), "time zone");
  control("time zone", "time_zone");
});

test("jurisdictions.index.records_help_conflict: profiles giving different records-request help conflict at records_help; identical ones do not", () => {
  const r = pair((a, b) => { a.records_help.days = 10; b.records_help.days = 99; });
  /* R105: the conflict is at the field of the law's block */
  const at = `records_help[${get(TEST).records_help.law}].days`;
  assertNote(conflictAt(r, at), "records help");
  control("records help", at);
});

test("jurisdictions.index.weekend_conflict: profiles naming different weekends conflict at weekend; identical ones do not", () => {
  const r = pair((a, b) => { a.weekend.days = ["sat", "sun"]; b.weekend.days = ["fri", "sat", "sun"]; });
  assertNote(conflictAt(r, "weekend"), "weekend");
  control("weekend", "weekend");
});

test("jurisdictions.index.instrument_key_conflict: profiles giving different instrument-key segments conflict at instrument_key; identical ones do not", () => {
  const r = pair((a, b) => { a.instrument_key = { jurisdiction: "one-ellery", basis: "TEST" }; b.instrument_key = { jurisdiction: "two-ellery", basis: "TEST" }; });
  assertNote(conflictAt(r, "instrument_key"), "instrument key");
  control("instrument key", "instrument_key");
});

test("jurisdictions.index.family_dropped_from_view: a family whose profiles give different labels is withheld with its note; identical families are not", () => {
  const r = pair((a, b) => {
    const sa = a.standard_sources.find((x) => x.series);
    const sb = b.standard_sources.find((x) => x.series && x.series.key === sa.series.key && x.key === sa.key);
    sa.series.label = "Label one";
    sb.series.label = "Label two";
  });
  const c = r.conflicts.find((x) => x.at.endsWith(".series.label"));
  assertNote(c, "family");
  assert.equal(c.values.length, 2, "both profiles' labels are named");
});

test("jurisdictions.index.who_issues_undetermined: a source whose profiles give different levels is undetermined with its note", () => {
  const r = pair((a, b) => {
    const sa = a.standard_sources.find((x) => x.level && !x.series);
    const sb = b.standard_sources.find((x) => x.level && !x.series && x.source === sa.source && x.issuer === sa.issuer);
    sa.level = "city";
    sb.level = "county";
  });
  const c = r.conflicts.find((x) => x.at.endsWith(".level"));
  assertNote(c, "who issues");
});

test("jurisdictions.index.receipt_on_closed_day: venues giving different receipt rules conflict, and the note says what a closed day does", () => {
  const r = pair((a, b) => {
    const ka = a.action_kinds.find((x) => x.venue && x.venue.receipt);
    const kb = b.action_kinds.find((x) => x.venue && x.venue.receipt && x.kind === ka.kind);
    ka.venue.receipt = { ...ka.venue.receipt, citation: "Rule one" };
    kb.venue.receipt = { ...kb.venue.receipt, citation: "Rule two" };
  });
  const c = r.conflicts.find((x) => x.at.endsWith(".venue.receipt"));
  assertNote(c, "receipt");
});

test("jurisdictions.index.local_day_undetermined: venues giving different time zones conflict, and the note says the local day is undetermined", () => {
  const r = pair((a, b) => {
    const ka = a.action_kinds.find((x) => x.venue);
    const kb = b.action_kinds.find((x) => x.kind === ka.kind);
    ka.venue.time_zone = { value: "UTC", status: "ruled", basis: "TEST" };
    kb.venue.time_zone = { value: "Europe/Paris", status: "ruled", basis: "TEST" };
  });
  const c = r.conflicts.find((x) => x.at.endsWith(".venue.time_zone"));
  assertNote(c, "local day");
});

test("jurisdictions.index.named_identifiers, jurisdictions.index.named_within and jurisdictions.index.named_body_variants: a counterparty's named fields that differ conflict, each with its note", () => {
  const ids = pair((a, b) => {
    const ca = a.counterparties.find((c) => c.ids);
    const cb = b.counterparties.find((c) => c.ids && c.role === ca.role && c.body === ca.body);
    for (const k of Object.keys(ca.ids)) cb.ids[k] = { ...cb.ids[k], id: "9999" };
  });
  assertNote(ids.conflicts.find((x) => x.at.endsWith(".ids")), "identifiers");

  const within = pair((a, b) => {
    const ca = a.counterparties.find((c) => c.within);
    const cb = b.counterparties.find((c) => c.within && c.role === ca.role && c.body === ca.body);
    cb.within = { ...cb.within, label: "Another organisation" };
  });
  assertNote(within.conflicts.find((x) => x.at.endsWith(".within")), "within");

  const org = pair((a, b) => {
    const ca = a.counterparties.find((c) => c.organisation);
    const cb = b.counterparties.find((c) => c.organisation && c.role === ca.role && c.body === ca.body);
    cb.organisation = "harbour_commission";
  });
  assertNote(org.conflicts.find((x) => x.at.endsWith(".organisation")), "body-variant key");
});
