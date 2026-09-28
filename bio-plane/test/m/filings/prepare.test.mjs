/* filings — preparing a draft (R1–R5), the Tier 3 fence (R17) and the profile as the only source of local words (R20).
   Driven at the module's interface, over the real modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, STRANGER, PROFILE } from "./fixture.mjs";
import { FILING_BLANKS, unfilledMarker } from "../../../src/filings/index.mjs";
import { validate } from "../../../../jurisdictions/index.mjs";

const prep = (x, action, over = {}) => x.f.filingPrepare({ action, preparer: V("bo"), viewer: V("bo"), ...over });

/* A second test profile, its own words throughout: `bylaw_complaint`'s template names every blank, `records_request`
   (Tier 2) has no advisory note. Its kinds are the test profile's, so actions (reading the test profile) accepts them. */
export function otherProfile(x, over = {}) {
  const p = x.profile(PROFILE);
  return { ...p, id: "test-filings-other", name: "Other Test Borough (test)", covers: ["Other Test Borough"],
    action_kinds: [
      { kind: "bylaw_complaint", label: "notice of breach", tier: 1,
        venue: { name: "the Borough Registry", how: "mail", basis: "TEST" },
        template: `Notice. ${Object.keys(FILING_BLANKS).map((n) => `${n}={{${n}}}`).join(" | ")}`, basis: "TEST" },
      { kind: "records_request", label: "records request", tier: 2,
        venue: { name: "the Borough Registry", how: "email", basis: "TEST" }, template: "Please send {{records}}.", basis: "TEST" },
      { kind: "commitment_claim", label: "claim", tier: 3, basis: "TEST" },
    ], ...over };
}

/* The test profile under another id, its `bylaw_complaint` kind changed by `patch` (a key set to undefined dropped). */
function rekind(x, id, patch) {
  const p = x.profile(PROFILE);
  return { ...p, id, action_kinds: p.action_kinds.map((k) => (k.kind === "bylaw_complaint"
    ? Object.fromEntries(Object.entries({ ...k, ...patch }).filter(([, v]) => v !== undefined)) : k)) };
}

test("R1 refusals in order: NO_AUTHOR (FILING_NO_PREPARER), NO_SUCH_ACTION (absent and invisible one answer), ACTION_CLOSED, FILING_TIER_UNDETERMINED, TIER3_COUNSEL_PACKET, KIND_NO_TEMPLATE; each with a negative control", () => {
  const x = world();
  const A = x.action();
  assert.equal(prep(x, A, { preparer: "" }).reason, "FILING_NO_PREPARER");
  assert.equal(prep(x, "ACTN-NONE", { preparer: " " }).reason, "FILING_NO_PREPARER", "asked first");
  const absent = prep(x, "ACTN-NONE");
  const hidden = prep(x, A, { viewer: STRANGER });
  assert.deepEqual([absent.reason, absent.detail], [hidden.reason, hidden.detail]);
  assert.equal(absent.reason, "NO_SUCH_ACTION");
  assert.equal(prep(x, x.D).reason, "NO_SUCH_ACTION", "a determination is not an action: one answer");
  assert.equal(prep(x, A).ok, true, "negative control");
  for (const [state, resolution] of [["resolved", "complied"], ["abandoned", null]]) {
    const c = x.action({ state, resolution, risk_tier: undefined });
    assert.equal(prep(x, c).reason, "ACTION_CLOSED", `${state} is closed, asked before the tier`);
  }
  for (const state of ["planned", "active", "awaiting_response"]) assert.equal(prep(x, x.action({ state })).ok, true, state);
  assert.equal(prep(x, x.action({ risk_tier: undefined, kind: "commitment_claim" })).reason, "FILING_TIER_UNDETERMINED",
               "asked before the Tier 3 route");
  assert.equal(prep(x, x.action({ kind: "commitment_claim" })).reason, "TIER3_COUNSEL_PACKET",
               "a Tier 3 kind has no template, and the Tier 3 answer comes first");
  assert.equal(prep(x, x.action({ kind: "other" })).reason, "KIND_NO_TEMPLATE", "a kind the profile does not hold");
});

test("R1 KIND_NO_TEMPLATE also when no profile is active and when the active profiles disagree on the template (withheld as a conflict)", () => {
  const none = world({ profiles: [] });
  const r = prep(none, none.action());
  assert.equal(r.reason, "KIND_NO_TEMPLATE");
  assert.match(r.detail, /no jurisdiction profile is active/);
  const x0 = world();
  const clash = rekind(x0, "test-filings-clash", { template: "A different template {{act}}." });
  assert.equal(validate(clash).ok, true);
  const x = world({ profiles: [PROFILE, clash] });
  const c = prep(x, x.action());
  assert.equal(c.reason, "KIND_NO_TEMPLATE");
  assert.match(c.detail, /different templates/);
});

test("R2 the stricter of the kind's tier and the action's governs; an undetermined action tier is refused, never read as 1; with no kind tier the action's alone governs, stated", () => {
  const x = world();
  assert.equal(prep(x, x.action({ kind: "bylaw_complaint", risk_tier: 3 })).reason, "TIER3_COUNSEL_PACKET",
               "a member may raise a Tier 1 kind to 3");
  assert.equal(prep(x, x.action({ kind: "commitment_claim", risk_tier: 1 })).reason, "TIER3_COUNSEL_PACKET",
               "a Tier 3 kind is never templated even if a member marks the action 1");
  const r = prep(x, x.action({ kind: "records_request", risk_tier: 1 }));
  assert.deepEqual([r.tier, r.governing.kind_tier, r.governing.action_tier], [2, 2, 1]);
  assert.equal(prep(x, x.action({ risk_tier: 2 })).tier, 2, "the action's stricter tier governs a Tier 1 kind");
  const u = prep(x, x.action({ risk_tier: undefined }));
  assert.equal(u.reason, "FILING_TIER_UNDETERMINED", "an absent tier reads undetermined");
  assert.equal(u.governing.tier, "undetermined");
  const x0 = world();
  const y = world({ profiles: [rekind(x0, "test-filings-untiered", { tier: undefined })] });
  const alone = prep(y, y.action({ risk_tier: 1 }));
  assert.deepEqual([alone.ok, alone.tier, alone.governing.kind_tier], [true, 1, null]);
  assert.match(alone.governing.says, /gives this kind no tier.*action's own tier alone governs/);
  const tierClash = rekind(x0, "test-filings-third", { tier: 2 });
  assert.equal(validate(tierClash).ok, true);
  const z = world({ profiles: [PROFILE, tierClash] });
  const c = prep(z, z.action({ risk_tier: 1 }));
  assert.deepEqual([c.tier, c.governing.kind_tier], [1, null]);
  assert.match(c.governing.says, /disagree on this kind's tier/);
});

test("R3 every blank is filled from the record naming its source, or left as a visible [UNFILLED: name] marker listed with why; never from the preparer", () => {
  const x0 = world();
  const x = world({ profiles: [otherProfile(x0)] });
  const A = x.action({ kind: "records_request", risk_tier: 2, law: "Test Stat. § 1.100" });
  /* a Tier 2 kind of this profile; the full template is on bylaw_complaint */
  const B = x.action({ law: undefined });
  const r = prep(x, B);
  assert.equal(r.ok, true);
  const by = Object.fromEntries(r.blanks.map((b) => [b.name, b]));
  assert.deepEqual(r.unfilled.map((u) => u.name), ["law"], "a bylaw complaint states no law; every other blank filled");
  assert.match(r.unfilled[0].why, /undetermined/);
  assert.deepEqual([by.counterparty_role.value, by.counterparty_role.source], ["Selectboard", B]);
  assert.deepEqual([by.counterparty_body.value, by.counterparty_body.source], ["Port Ellery Selectboard", B]);
  assert.deepEqual([by.act.value, by.act.source], ["the works order let on 2026-03-02", x.D]);
  assert.deepEqual([by.act_date.value, by.act_date.source], ["2026-03-02", x.D]);
  assert.deepEqual([by.standards.value, by.standards.source], ["P.E.B.L. § 12; MCBC 2025-3", `${x.S1}, ${x.S2}`]);
  assert.deepEqual([by.findings.value, by.findings.source],
                   ["INQ-2026-0001 (case CASE-2026-0001, edition 1)", "INQ-2026-0001@CASE-2026-0001/1"]);
  assert.deepEqual([by.governing_laws.value, by.governing_laws.source], ["P.E.B.L. § 4", B]);
  assert.deepEqual([by.clock.value, by.clock.source], ["2026-04-01: answer due (P.E.B.L. § 4)", B]);
  assert.deepEqual([by.venue.value, by.venue.source], ["the Borough Registry", "profile:test-filings-other/action_kinds/bylaw_complaint/venue"]);
  assert.equal(by.venue_how.value, "mail");
  assert.deepEqual([by.group.value, by.group.source], ["test-group", "setting:producing_group"]);
  assert.deepEqual([by.date.value, by.date.source], ["2026-09-28", "clock:2026-09-28T01:00:00Z"]);
  for (const b of r.blanks) assert.ok(r.text.includes(`${b.name}=${b.value}`), b.name);
  assert.ok(r.text.includes(`law=${unfilledMarker("law")}`));
  /* a records request states its law, filled from the action */
  const la = prep(x, A);
  assert.equal(la.unfilled.find((u) => u.name === "law"), undefined);
  /* No value, undetermined: a counterparty undetermined, no laws stated, no clock, no group, no act date. */
  x.groupRef.value = null;
  const D2 = x.determine({ act: { ...x.act, at: undefined, period: { from: "2026-03-01", to: "2026-03-05" } } });
  const C = x.action({ counterparty: { state: "undetermined", basis: "not yet known" }, clock: [], laws: null,
                       legs: [{ target: D2, kind: "rests_on" }] });
  const u = prep(x, C);
  const why = Object.fromEntries(u.unfilled.map((b) => [b.name, b.why]));
  for (const n of ["counterparty_role", "counterparty_body", "governing_laws", "law", "clock", "group"]) {
    assert.ok(u.text.includes(unfilledMarker(n)), n);
    assert.ok(why[n], n);
  }
  assert.match(why.counterparty_role, /undetermined/);
  assert.match(why.governing_laws, /undetermined/);
  assert.match(why.group, /no producing group/);
  assert.equal(u.blanks.find((b) => b.name === "act_date").value, "2026-03-01 to 2026-03-05", "a period, from and to");
  /* Not visible: quinn, outside the project, may not see the determination. */
  const h = prep(x, B, { viewer: V("quinn"), preparer: V("quinn") });
  const hw = Object.fromEntries(h.unfilled.map((b) => [b.name, b.why]));
  for (const n of ["act", "act_date", "standards", "findings"]) assert.match(hw[n], /not one you may see/, n);
  /* the preparer supplies no value: two preparers, one text */
  x.groupRef.value = "test-group";
  const y = world();
  const T = y.action();
  const t = prep(y, T);
  assert.deepEqual(t.unfilled, [{ name: "bylaw", why: "filings fills no blank by this name, so the record holds no value for it" }]);
  assert.equal(t.text, "To the Selectboard: the works order let on 2026-03-02 does not conform to [UNFILLED: bylaw].");
  assert.equal(prep(y, T, { preparer: MACHINE, viewer: MACHINE }).text, t.text);
});

test("R4 a Tier 2 draft carries the profile's advisory note first in the text and as advisory; Tier 1 carries none; with no note it is an unfilled blank", () => {
  const x = world();
  const r = prep(x, x.action({ kind: "records_request", risk_tier: 2 }));
  const note = x.profile().action_kinds.find((k) => k.kind === "records_request").advisory;
  assert.equal(r.advisory, note);
  assert.ok(r.text.startsWith(`${note}\n\n`));
  const t1 = prep(x, x.action());
  assert.equal("advisory" in t1, false);
  assert.equal(t1.text.includes(note), false);
  const x0 = world();
  const y = world({ profiles: [otherProfile(x0)] });
  const n = prep(y, y.action({ kind: "records_request", risk_tier: 1 }));
  assert.equal(n.advisory, null);
  assert.ok(n.text.startsWith(`${unfilledMarker("advisory")}\n\n`));
  assert.equal(n.unfilled[0].name, "advisory");
  assert.match(n.unfilled[0].why, /undetermined/);
});

test("R5 any credential may prepare; the draft is stored apart, labelled with its preparer and whether it is machine work, answered evidence: false with a sentence; preparing again makes a new draft, never an edit", () => {
  const x = world();
  const A = x.action();
  const before = x.text(A);
  const m = prep(x, A, { preparer: MACHINE, viewer: MACHINE });
  assert.equal(m.ok, true);
  assert.deepEqual([m.label.state, m.label.machine_work, m.label.by], ["machine_proposed", true, MACHINE]);
  assert.equal(m.evidence, false);
  assert.match(m.says, /nobody has approved or sent it/);
  assert.match(m.label.says, /machine work/);
  const b = prep(x, A);
  assert.deepEqual([b.label.state, b.label.machine_work], ["member_proposed", false]);
  assert.notEqual(b.id, m.id);
  assert.match(m.id, /^FIL-2026-\d{4}$/);
  assert.equal(x.text(A), before, "stored apart: the action's bytes are untouched");
  assert.deepEqual(x.read(A).correspondence, []);
  assert.equal(x.row(`SELECT text FROM filing_drafts WHERE filing_id=?`, m.id).text, m.text, "the first draft is unchanged");
  assert.equal(x.count("filing_drafts"), 2);
});

test("R17 a Tier 3 governing tier never yields a template, a pre-filled filing or a fileable document; a profile cannot hold a Tier 3 template", () => {
  const x = world();
  assert.equal(prep(x, x.action({ kind: "commitment_claim", risk_tier: 3 })).reason, "TIER3_COUNSEL_PACKET");
  const A = x.action({ risk_tier: 3 });
  assert.equal(prep(x, A).reason, "TIER3_COUNSEL_PACKET", "even when the kind has a template");
  assert.equal(x.count("filing_drafts"), 0);
  const p = x.f.counselPacket({ action: A, counsel: { name: "A. Counsel", organisation: "Test Chambers" }, author: V("olive"), viewer: V("olive") });
  assert.equal(p.fileable, false);
  const template = x.profile().action_kinds.find((k) => k.kind === "bylaw_complaint").template;
  assert.equal(JSON.stringify(p).includes(template.slice(0, 18)), false, "no template text in the packet");
  const bad = { ...x.profile(), id: "test-tier3-template" };
  bad.action_kinds = bad.action_kinds.map((k) => (k.tier === 3 ? { ...k, template: "{{act}}" } : k));
  assert.ok(validate(bad).errors.some((e) => e.code === "TEMPLATE_TIER3"));
});

test("R20 no place, law, venue or template is named in behaviour or outward text: each comes from the active profiles, the test profile included; none active, none is named", () => {
  const x0 = world();
  const outputs = [];
  for (const profiles of [[PROFILE], [otherProfile(x0)]]) {
    const x = world({ profiles });
    const r = prep(x, x.action());
    const prof = typeof profiles[0] === "string" ? x.profile(profiles[0]) : profiles[0];
    const kind = prof.action_kinds.find((k) => k.kind === "bylaw_complaint");
    assert.equal(r.venue.name, kind.venue.name);
    assert.ok(r.text.startsWith(kind.template.split("{{")[0]), "the text is the profile's template");
    outputs.push(r.text);
  }
  assert.notEqual(outputs[0], outputs[1]);
  const none = world({ profiles: [] });
  assert.equal(prep(none, none.action()).reason, "KIND_NO_TEMPLATE");
  const block = none.f.availableActions({ determination: none.D, viewer: V("olive") });
  assert.deepEqual(block.kinds, []);
  assert.match(block.says, /no jurisdiction profile is active/);
});
