/* filings — the counsel packet (R8–R12) and candidate theories (R14). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, F, CASE, PROFILE, DOC, sha } from "./fixture.mjs";
import { counselMarking, deadlineDate, Filings } from "../../../src/filings/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const A = "ACTION-2026-0003";
const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const MARK = counselMarking(COUNSEL);
const pack = (x, over = {}) => x.f.counselPacket({ action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive"), ...over });
function tier3(over = {}, opts = {}) {
  const x = world(opts);
  x.action(A, { kind: "commitment_claim", ...over });
  return x;
}

test("R8 refusals in order: MACHINE_CANNOT_NAME_COUNSEL, NO_SUCH_ACTION, NOT_TIER3, NO_COUNSEL, NO_DETERMINATION; negative controls", () => {
  const x = tier3();
  assert.equal(pack(x, { author: MACHINE, action: "ACTION-NONE" }).reason, "MACHINE_CANNOT_NAME_COUNSEL");
  assert.equal(pack(x, { author: "" }).reason, "MACHINE_CANNOT_NAME_COUNSEL");
  assert.equal(pack(x, { action: "ACTION-NONE", counsel: null }).reason, "NO_SUCH_ACTION");
  x.actions.held.get(A).audience = [V("bo")];
  assert.equal(pack(x).reason, "NO_SUCH_ACTION", "an invisible action answers as absent");
  delete x.actions.held.get(A).audience;
  x.action(A, { kind: "bylaw_complaint", risk_tier: 1 });
  assert.equal(pack(x, { counsel: null }).reason, "NOT_TIER3", "asked before counsel");
  x.action(A, { kind: "commitment_claim", risk_tier: "undetermined" });
  assert.equal(pack(x).reason, "NOT_TIER3", "an undetermined governing tier is not 3");
  x.action(A, { kind: "commitment_claim", legs: [] });
  for (const c of [null, { name: "A. Counsel" }, { organisation: "Test Chambers" }, { name: " ", organisation: "x" },
                   { name: "A", organisation: "B", contact: "x".repeat(201) }])
    assert.equal(pack(x, { counsel: c }).reason, "NO_COUNSEL", JSON.stringify(c));
  assert.equal(pack(x).reason, "NO_DETERMINATION", "contact is optional; the action rests on nothing");
  x.action(A, { kind: "commitment_claim" });
  x.conformance.held.get("CONF-2026-0001").superseded_by = "CONF-2026-0002";
  assert.equal(pack(x).reason, "NO_DETERMINATION", "a superseded determination is not live");
  delete x.conformance.held.get("CONF-2026-0001").superseded_by;
  x.action(A, { kind: "bylaw_complaint", risk_tier: 3 });
  const ok = pack(x, { counsel: { ...COUNSEL, contact: "counsel@example.org" } });
  assert.deepEqual([ok.ok, ok.version, ok.fileable], [true, 1, false], "a Tier 1 kind raised to 3 gets a packet");
  assert.match(ok.id, /^CPK-2026-\d{4}$/);
});

test("R9 the six sections, each item naming its record source: facts, chronology in date order (ties by source id), exhibits with provenance and attestations, standards with in-force, candidate theories, deadlines; consequences as recorded", () => {
  const x = tier3({ correspondence: [
    { ord: 0, direction: "sent", at: "2026-03-10", account: "letter", author: V("bo") },
    { ord: 1, direction: "received", at: "2026-03-12", party: "the clerk", artifact_sha: sha(`the text of ${DOC}`), author: V("bo") }] });
  x.consequences.held.set("CONF-2026-0001", [{ id: "CONS-1", state: "assessed", measure: { unit: "money", value: 1000 } },
                                             { id: "CONS-2", state: "undetermined" }]);
  const p = pack(x);
  const s = p.sections;
  assert.deepEqual(Object.keys(s), ["facts", "chronology", "exhibits", "standards", "theories", "deadlines", "consequences"]);
  /* facts: the finding at its published edition, its claim and its citations */
  const [fact] = s.facts.items;
  assert.deepEqual([fact.finding, fact.case, fact.edition, fact.version_sha, fact.source], [F, CASE, 1, x.pin, `${F}@${CASE}/1`]);
  assert.equal(fact.claim.conclusion, "The works order was let without the vote the bylaw requires.");
  assert.deepEqual(fact.citations.map((c) => c.target), [DOC]);
  /* chronology: every dated event in order, ties by source id */
  const ch = s.chronology.items;
  assert.deepEqual(ch.map((e) => [e.date, e.source]), [
    ["2026-03-02", "CONF-2026-0001"], ["2026-03-10", `${A}#0`], ["2026-03-10", `${A}/state_history[0]`],
    ["2026-03-12", `${A}#1`], ["2026-04-01", `${A}/clock[0]`], ["2026-09-28", `${F}@${CASE}/1`]]);
  for (let i = 1; i < ch.length; i++) assert.ok(ch[i - 1].date < ch[i].date || (ch[i - 1].date === ch[i].date && ch[i - 1].source < ch[i].source));
  /* exhibits: each capture a fact or event cites, with digest, locator, capture time and attestations */
  const ex = Object.fromEntries(s.exhibits.items.map((e) => [e.sha256, e]));
  const docSha = sha(`the text of ${DOC}`), evSha = sha("the text of INFO-2026-0002-ledger");
  assert.deepEqual(Object.keys(ex).sort(), [docSha, evSha].sort());
  assert.deepEqual(ex[docSha].cited_by, [`${A}#1`, `${F}@${CASE}/1`]);
  assert.deepEqual(ex[evSha].cited_by, ["CONF-2026-0001"]);
  assert.equal(ex[evSha].locator, "https://example.org/snapshots/INFO-2026-0002-ledger.txt");
  assert.equal(ex[evSha].captured_at, "2026-09-27T00:00:00Z");
  assert.deepEqual(ex[evSha].attestations.items, x.prov.attestationsOf(evSha).attestations, "provenance's attestationsOf, never the bundle document");
  assert.deepEqual(ex[evSha].attestations.items.map((a) => a.kind), ["rfc3161", "co_archive"]);
  assert.deepEqual(ex[docSha].attestations.items, []);
  /* standards: citation, kind, issuer, text content ids, in force at the act's date */
  assert.deepEqual(s.standards.items.map((i) => [i.standard, i.cite, i.kind, i.issuer, i.in_force.state, i.outcome]), [
    ["STD-2026-0001", "P.E.B.L. § 12", "ordinance", "Port Ellery Selectboard", "in_force", "noncompliant"],
    ["STD-2026-0002", "MCBC 2025-3", "commitment", "Marlow County Commission", "undetermined", "compliant"]]);
  assert.deepEqual(s.standards.items[0].text, [x.evidenceCid]);
  /* theories: empty, said in words */
  assert.deepEqual(s.theories.items, []);
  assert.match(s.theories.says, /no candidate theory/);
  /* deadlines: the profile's claim deadline, whose start ("known") the record does not hold */
  assert.deepEqual(s.deadlines.items.map((d) => [d.rule, d.days, d.count, d.starts, d.citation, d.date.state]),
                   [["claim_notice", 90, "calendar", "known", "Test Stat. § 9.20", "undetermined"]]);
  assert.match(s.deadlines.items[0].start.why, /no date on which the group knew/);
  /* consequences as recorded, states kept apart */
  assert.deepEqual(s.consequences.items[0].recorded.parts.map((c) => [c.id, c.state]), [["CONS-1", "assessed"], ["CONS-2", "undetermined"]]);
});

test("R9 a claim deadline's date only from a recorded start event and its count: calendar, business on the holiday calendar, undetermined past the calendar's years", () => {
  const base = { rule: "claim_act", applies_to: "claim", days: 10, citation: "Test Stat. § 9.30", basis: "TEST" };
  const prof = (deadlines) => {
    const x0 = world();
    return { ...x0.profile(PROFILE), id: "test-filings-deadlines", deadlines };
  };
  const x = tier3({}, { profiles: [prof([{ ...base, days: 11, count: "business", starts: "act" },
                                         { ...base, rule: "claim_filed", count: "calendar", starts: "filed" }])] });
  const d = Object.fromEntries(pack(x).sections.deadlines.items.map((i) => [i.rule, i]));
  /* 2026-03-02 (a Monday) plus 11 business days: the 11th would be Tuesday 17 March, the profile's holiday, so the
     18th. */
  assert.deepEqual([d.claim_act.start.date, d.claim_act.start.source, d.claim_act.date.state, d.claim_act.date.date],
                   ["2026-03-02", "CONF-2026-0001", "determined", "2026-03-18"]);
  assert.equal(d.claim_act.source, "profile:test-filings-deadlines/deadlines/claim_act");
  assert.equal(d.claim_filed.date.state, "undetermined", "no sent entry is recorded");
  x.actions.held.get(A).correspondence = [{ ord: 0, direction: "sent", at: "2026-05-01", account: "letter" }];
  const d2 = Object.fromEntries(pack(x).sections.deadlines.items.map((i) => [i.rule, i]));
  assert.deepEqual([d2.claim_filed.date.date, d2.claim_filed.start.source], ["2026-05-11", `${A}#0`]);
  const hol = combine([PROFILE]).view.holidays;
  assert.equal(deadlineDate({ start: "2026-03-13", days: 2, count: "business", holidays: hol }).date, "2026-03-18",
               "a Friday, then Monday 16th, Tuesday 17th a holiday, Wednesday 18th");
  assert.equal(deadlineDate({ start: "2026-12-30", days: 3, count: "business", holidays: hol }).date, "2027-01-05",
               "31 Dec, 1 Jan a holiday, weekend, 4 and 5 Jan");
  const past = deadlineDate({ start: "2027-12-30", days: 3, count: "business", holidays: hol });
  assert.equal(past.state, "undetermined");
  assert.match(past.why, /reaches into 2028/);
  assert.equal(deadlineDate({ start: "2026-01-31", days: 30, count: "calendar" }).date, "2026-03-02");
  assert.equal(deadlineDate({ start: null, days: 3, count: "calendar" }).state, "undetermined");
  assert.equal(deadlineDate({ start: "2026-01-31", days: 3, count: null }).state, "undetermined");
});

test("R10 every section, the head and every export carry the marking; no caption, venue heading, signature, prayer or template; fileable is false", () => {
  const x = tier3();
  const p = pack(x);
  assert.equal(p.marking, MARK);
  assert.equal(p.head.marking, MARK);
  for (const s of Object.values(p.sections)) assert.equal(s.marking, MARK, s.title);
  assert.equal(p.fileable, false);
  const e = x.f.counselPacketExport({ id: p.id, version: 1, author: V("olive"), viewer: V("olive") });
  assert.equal(e.fileable, false);
  const heads = e.bytes.split("\n").map((l, i, all) => (l.startsWith("#") ? all[i + 2] : null)).filter((l) => l !== null);
  assert.ok(heads.length >= 8);
  for (const h of heads) assert.equal(h, MARK, "the line under every heading is the marking");
  const view = combine([PROFILE]).view;
  for (const k of view.action_kinds) {
    if (k.template) assert.equal(e.bytes.includes(k.template.split("{{")[0].trim()), false, `no template of ${k.kind}`);
    if (k.venue) assert.equal(e.bytes.includes(k.venue.name), false, `no venue of ${k.kind}`);
  }
  for (const word of [/\bplaintiff\b/i, /\bdefendant\b/i, /\bprayer\b/i, /\bsigned\b/i, /\bcomes now\b/i, /\bv\.\s/])
    assert.doesNotMatch(e.bytes, word);
});

test("R11 the packet is never published and has no path to publication; it is read only by a member who may see the action (NO_SUCH_PACKET otherwise); an export records who, which version, when and for which counsel; a machine is refused", () => {
  const x = tier3();
  const p = pack(x);
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: V("bo") }).ok, true);
  x.actions.held.get(A).audience = [V("olive")];
  const hidden = x.f.counselPacketRead({ id: p.id, viewer: V("bo") });
  const absent = x.f.counselPacketRead({ id: "CPK-NONE", viewer: V("bo") });
  assert.deepEqual([hidden.reason, hidden.detail], [absent.reason, absent.detail]);
  assert.equal(hidden.reason, "NO_SUCH_PACKET");
  assert.equal(x.f.counselPacketExport({ id: p.id, author: V("bo"), viewer: V("bo") }).reason, "NO_SUCH_PACKET");
  assert.equal(x.f.counselPacketExport({ id: p.id, author: MACHINE, viewer: MACHINE }).reason, "MACHINE_CANNOT_EXPORT");
  const e = x.f.counselPacketExport({ id: p.id, version: 1, author: V("olive"), viewer: V("olive") });
  assert.deepEqual([e.ok, e.id, e.version, e.exported_by, e.at, e.counsel, e.format], [true, p.id, 1, V("olive"), "2026-09-28T01:00:00Z", COUNSEL, "text/markdown"]);
  assert.equal(e.sha, sha(e.bytes));
  assert.deepEqual(x.f.counselPacketRead({ id: p.id, viewer: V("olive") }).exports,
                   [{ exported_by: V("olive"), at: "2026-09-28T01:00:00Z", counsel: COUNSEL, sha: e.sha }]);
  /* No path to publication: none of its public reads knows the packet, its bytes or its digest. */
  assert.equal(x.p.verifySha(e.sha).published, false);
  assert.equal(x.p.publishedCase({ id: p.id }).ok, false);
  assert.equal(JSON.stringify(x.p.publishedManifest()).includes(p.id), false);
  assert.equal(JSON.stringify(x.p.publishedList()).includes(p.id), false);
  const pub = x.p.publishedCase({ caseId: CASE });
  assert.equal(JSON.stringify(pub).includes(p.id), false);
  assert.equal(JSON.stringify(pub).includes(MARK), false);
});

test("R12 assembling again makes a new version and earlier versions stay readable; a version is flagged basis_changed, naming each cause, and nothing in it changes", () => {
  const x = tier3();
  const v1 = pack(x);
  const v2 = pack(x, { counsel: { name: "B. Counsel", organisation: "Other Chambers" } });
  assert.deepEqual([v2.id, v2.version], [v1.id, 2]);
  const r1 = x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") });
  assert.deepEqual([r1.version, r1.head.counsel, r1.versions, r1.basis_changed], [1, COUNSEL, [1, 2], null]);
  assert.deepEqual(r1.sections, v1.sections);
  /* each cause, one at a time */
  x.conformance.held.get("CONF-2026-0001").basis_changed = { causes: [{ cause: "reopened" }] };
  assert.deepEqual(x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") }).basis_changed.causes.map((c) => c.cause),
                   ["determination_flagged"]);
  x.conformance.held.get("CONF-2026-0001").basis_changed = null;
  x.standards.held.get("STD-2026-0002").superseded_by = "STD-2026-0009";
  x.conformance.held.get("CONF-2026-0001").superseded_by = "CONF-2026-0002";
  /* a later edition of the finding's case */
  const roles = [{ target: F, version_sha: x.pin }];
  x.prepare(CASE, 2, { project: x.proj, roles });
  assert.equal(x.signCase(CASE, 2, { project: x.proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) }).ok, true);
  x.signFinding(F, { edges: [] });
  const flagged = x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") });
  assert.deepEqual(flagged.basis_changed.causes.map((c) => c.cause).sort(),
                   ["determination_superseded", "finding_later_edition", "standard_superseded"]);
  const later = flagged.basis_changed.causes.find((c) => c.cause === "finding_later_edition");
  assert.deepEqual([later.finding, later.edition, later.later], [F, 1, 2]);
  assert.deepEqual(flagged.sections, v1.sections, "nothing in the version changes");
  assert.deepEqual(x.rows(`SELECT version FROM counsel_packets ORDER BY version`).map((r) => r.version), [1, 2]);
});

test("R14 any credential may propose a candidate theory and remedy against named standards, stored apart and labelled, why at most 1,000 characters; NO_STANDARDS, NO_SUCH_STANDARD naming it; it enters the next packet version as a candidate", () => {
  const x = tier3();
  const v1 = pack(x);
  const prop = (over = {}) => x.f.theoryPropose({ packet: v1.id, theory: "The order breached the bylaw's vote requirement.",
    remedy: "Rescission of the order.", standards: ["STD-2026-0001"], why: "the determination finds it noncompliant",
    proposer: V("bo"), viewer: V("bo"), ...over });
  assert.equal(prop({ proposer: "" }).reason, "NO_AUTHOR");
  assert.equal(prop({ packet: "CPK-NONE" }).reason, "NO_SUCH_PACKET");
  assert.equal(prop({ packet: null, action: "ACTION-NONE" }).reason, "NO_SUCH_ACTION");
  assert.equal(prop({ standards: [] }).reason, "NO_STANDARDS");
  const bad = prop({ standards: ["STD-2026-0001", "STD-NONE"] });
  assert.deepEqual([bad.reason, bad.standard], ["NO_SUCH_STANDARD", "STD-NONE"]);
  assert.equal(prop({ why: "x".repeat(1001) }).reason, "THEORY_WHY_REFUSED");
  assert.equal(prop({ why: "" }).reason, "THEORY_WHY_REFUSED");
  assert.equal(prop({ why: "x".repeat(1000) }).ok, true, "1,000 characters is allowed");
  const m = prop({ proposer: MACHINE, viewer: MACHINE, packet: null, action: A });
  assert.deepEqual([m.ok, m.evidence, m.proposal.label.state, m.proposal.label.machine_work], [true, false, "machine_proposed", true]);
  assert.match(m.says, /not the group's position/);
  assert.equal(x.f.counselPacketRead({ id: v1.id, viewer: V("olive") }).sections.theories.items.length, 0,
               "the version already assembled does not change");
  const v2 = pack(x);
  const items = v2.sections.theories.items;
  assert.equal(items.length, 2);
  for (const t of items) {
    assert.equal(t.candidate, true);
    assert.deepEqual(t.standards, ["STD-2026-0001"]);
    assert.ok(t.label && t.label.says);
  }
  assert.match(v2.sections.theories.says, /never the group's position/);
});

test("R10 the export's bytes are the rendering of the version read, the marking under every heading", () => {
  const x = tier3();
  const p = pack(x);
  const read = x.f.counselPacketRead({ id: p.id, viewer: V("olive") });
  assert.equal(x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") }).bytes, Filings.render(read));
});
