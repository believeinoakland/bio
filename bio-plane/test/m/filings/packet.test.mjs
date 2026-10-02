/* filings — the counsel packet (R8–R12) and candidate theories (R14). Driven at the module's interface, over the real
   modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, STRANGER, F, CASE, PROFILE, DOC, sha, WHY } from "./fixture.mjs";
import { counselMarking, deadlineDate, Filings, INBAND_RULE, FILINGS_CHECKS, PACKET_REASON_MAX } from "../../../src/filings/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const MARK = counselMarking(COUNSEL);
const pack = (x, over = {}) => x.f.counselPacket({ reason: WHY, action: x.A, counsel: COUNSEL, author: V("olive"), viewer: V("olive"), ...over });
/* A world whose action `x.A` is of a Tier 3 kind (`o` over it). */
function tier3(o = {}, opts = {}) {
  const x = world(opts);
  x.A = x.action({ kind: "commitment_claim", ...o });
  return x;
}
/* actions' R15: a member's correspondence entry on `id`. */
const correspond = (x, id, e) => {
  const r = x.actions.actionCorrespond({ target: id, author: V("bo"), viewer: V("bo"), ...e });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return r;
};
/* conformance's R7: a determination of the same act superseding `id`. */
const supersede = (x, id) => x.determine({ supersedes: id, reason: "corrected",
  act: { ...x.act, id: x.conformance.determinationRead({ id, viewer: MACHINE }).act.id } });

test("R8 refusals in order: MACHINE_CANNOT_NAME_COUNSEL, NO_SUCH_ACTION, NO_COUNSEL (at Tier 3 or an undetermined tier; a counsel given at any tier without both name and organisation), NO_DETERMINATION; a packet at every governing tier, NOT_TIER3 retired; negative controls", async () => {
  const x = tier3();
  assert.equal(pack(x, { author: MACHINE, action: "ACTION-NONE" }).reason, "MACHINE_CANNOT_NAME_COUNSEL");
  assert.equal(pack(x, { author: "" }).reason, "MACHINE_CANNOT_NAME_COUNSEL");
  assert.equal(pack(x, { action: "ACTION-NONE", counsel: null }).reason, "NO_SUCH_ACTION");
  assert.equal(pack(x, { viewer: STRANGER }).reason, "NO_SUCH_ACTION", "an invisible action answers as absent");
  /* every governing tier gets a packet (K924): Tier 1 and 2 with counsel optional */
  for (const o of [{ kind: "bylaw_complaint", risk_tier: 1 }, { kind: "records_request", risk_tier: 2, law: "Test Stat. § 1.100" }]) {
    const A = x.action(o);
    const bare = pack(x, { action: A, counsel: null });
    assert.deepEqual([bare.ok, bare.fileable, bare.head.counsel], [true, false, null], `tier ${o.risk_tier}, no counsel`);
    assert.equal(pack(x, { action: A }).ok, true, `tier ${o.risk_tier}, counsel named`);
    for (const c of [{ name: "A. Counsel" }, { organisation: "Test Chambers" }, { name: " ", organisation: "x" }, {}])
      assert.equal(pack(x, { action: A, counsel: c }).reason, "NO_COUNSEL", `tier ${o.risk_tier}: a counsel given needs both: ${JSON.stringify(c)}`);
  }
  assert.equal(x.count("counsel_packets") >= 4, true);
  /* an undetermined governing tier is never read as 1: counsel is required, as at Tier 3 */
  const U = x.action({ risk_tier: undefined });
  assert.equal(pack(x, { action: U, counsel: null }).reason, "NO_COUNSEL", "undetermined: counsel required");
  assert.equal(pack(x, { action: U }).ok, true, "negative control: undetermined with counsel");
  x.A = x.action({ kind: "commitment_claim", legs: [] });
  for (const c of [null, { name: "A. Counsel" }, { organisation: "Test Chambers" }, { name: " ", organisation: "x" },
                   { name: "A", organisation: "B", contact: "x".repeat(201) }])
    assert.equal(pack(x, { counsel: c }).reason, "NO_COUNSEL", JSON.stringify(c));
  assert.equal(pack(x).reason, "NO_DETERMINATION", "contact is optional; the action rests on nothing");
  assert.equal(pack(x, { action: x.action({ legs: [] }), counsel: null }).reason, "NO_DETERMINATION", "at Tier 1 too, after counsel");
  assert.equal(pack(x, { action: x.action({ kind: "commitment_claim" }), viewer: V("quinn"), author: V("quinn") }).reason,
               "NO_DETERMINATION", "a determination the author may not see is none");
  const ok = pack(x, { action: x.action({ kind: "bylaw_complaint", risk_tier: 3 }),
                       counsel: { ...COUNSEL, contact: "counsel@example.org" } });
  assert.deepEqual([ok.ok, ok.version, ok.fileable], [true, 1, false], "a Tier 1 kind raised to 3 gets a packet");
  assert.match(ok.id, /^CPK-2026-\d{4}$/);
  const y = tier3();
  supersede(y, y.D);
  assert.equal(pack(y).reason, "NO_DETERMINATION", "a superseded determination is not live");
});

test("R8 PACKET_NO_REASON (C-115.44): a reason absent, not a string, blank or only whitespace, or over 2,000 characters is refused with nothing written, asked after MACHINE_CANNOT_NAME_COUNSEL and before NO_SUCH_ACTION; a reasoned packet at Tier 1 and at Tier 3 reads its reason back with its version through counselPacketRead, filingsFor and the op", async () => {
  const x = tier3();
  const T1 = x.action();
  const tables = ["counsel_packets", "counsel_packet_exports", "theory_proposals"];
  const before = x.snapshot(tables);
  const ids = JSON.stringify(x.rows(`SELECT scope, next FROM seq ORDER BY scope`));
  for (const [why, over] of [["absent", { reason: undefined }], ["null", { reason: null }], ["a number", { reason: 42 }],
                             ["an object", { reason: { text: "why" } }], ["empty", { reason: "" }], ["blank", { reason: "   \n\t " }],
                             ["2,001 characters", { reason: "x".repeat(PACKET_REASON_MAX + 1) }],
                             ["2,001 code points", { reason: "\u{1F4DC}".repeat(PACKET_REASON_MAX + 1) }]]) {
    for (const action of [x.A, T1]) {
      const r = pack(x, { action, ...over });
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
                       [false, "PACKET_NO_REASON", "PACKET_NO_REASON", "C-115.44", FILINGS_CHECKS.PACKET_NO_REASON.translation], why);
    }
  }
  assert.deepEqual(x.snapshot(tables), before, "nothing written: no packet, no version");
  assert.equal(x.count("counsel_packets"), 0, "the packet count unchanged");
  assert.equal(JSON.stringify(x.rows(`SELECT scope, next FROM seq ORDER BY scope`)), ids, "no id spent");
  /* asked after the machine fence and before the action */
  assert.equal(pack(x, { author: MACHINE, reason: undefined }).reason, "MACHINE_CANNOT_NAME_COUNSEL", "a machine still refused first");
  assert.equal(pack(x, { author: "", reason: "" }).reason, "MACHINE_CANNOT_NAME_COUNSEL");
  assert.equal(pack(x, { action: "ACTION-NONE", reason: undefined }).reason, "PACKET_NO_REASON", "before NO_SUCH_ACTION");
  assert.equal(pack(x, { action: "ACTION-NONE" }).reason, "NO_SUCH_ACTION", "negative control: reasoned, the action is asked");
  assert.equal(pack(x, { counsel: null, reason: undefined }).reason, "PACKET_NO_REASON", "before NO_COUNSEL");
  /* reasoned: at Tier 3 and at Tier 1, each version with its own reason, read back as written */
  const long = "y".repeat(PACKET_REASON_MAX), wide = "\u{1F4DC}".repeat(PACKET_REASON_MAX);
  const v1 = pack(x, { reason: `  ${WHY}  ` });
  const v2 = pack(x, { reason: long });
  const t1 = pack(x, { action: T1, counsel: null, reason: wide });
  assert.deepEqual([v1.ok, v1.version, v1.reason, v2.version, v2.reason, t1.ok, t1.reason], [true, 1, `  ${WHY}  `, 2, long, true, wide],
                   "2,000 characters is allowed, counted in code points, and kept as written");
  const read = (id, version) => x.f.counselPacketRead({ id, version, viewer: V("bo") });
  assert.deepEqual([read(v1.id, 1).reason, read(v1.id, 2).reason, read(v1.id).reason, read(t1.id).reason],
                   [`  ${WHY}  `, long, long, wide], "each version reads back its own reason");
  assert.deepEqual(x.rows(`SELECT version, reason FROM counsel_packets WHERE packet_id=? ORDER BY version`, v1.id),
                   [{ version: 1, reason: `  ${WHY}  ` }, { version: 2, reason: long }], "recorded with the version");
  assert.deepEqual(x.f.filingsFor({ action: x.A, viewer: V("bo") }).packets.map((p) => [p.version, p.reason]), [[1, `  ${WHY}  `], [2, long]]);
  /* through the op: the reason from the body, never the query */
  const op = (query, body) => x.op("counselpacket", { author: V("olive"), viewer: V("olive"), ...query }, { action: x.A, counsel: COUNSEL, ...body });
  assert.equal(op({ reason: WHY }, {}).reason, "PACKET_NO_REASON", "a reason in the query is not read");
  const o = op({}, { reason: "asked through the op" });
  assert.deepEqual([o.ok, o.version, read(o.id, 3).reason], [true, 3, "asked through the op"]);
});

test("R9 the six sections, each item naming its record source: facts, chronology in date order (ties by source id), exhibits with provenance and attestations, standards with in-force, candidate theories, deadlines; consequences as recorded", async () => {
  const x = tier3();
  correspond(x, x.A, { direction: "sent", at: "2026-03-10", account: "letter" });
  correspond(x, x.A, { direction: "received", at: "2026-03-12", party: "the clerk", artifactSha: sha(`the text of ${DOC}`) });
  const A = x.A;
  const part = (over) => x.consequences.consequenceRecord({ determination: x.D, standard: x.S1,
    affected: { kind: "fund", description: "the harbour works fund" }, period: { from: "2026-03-02", to: "2026-06-30" },
    author: V("olive"), viewer: V("olive"), ...over });
  const assessed = part({ measure: { unit: "money", currency: "USD", value: 1000 },
                          basis: { rationale: "the order's own figure", rests_on: [] } });
  const undetermined = part({ basis: { why: "not_in_record" } });
  assert.deepEqual([assessed.ok, undetermined.ok], [true, true], JSON.stringify([assessed, undetermined]).slice(0, 400));
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
    ["2026-03-02", x.D], ["2026-03-10", `${A}#0`], ["2026-03-10", `${A}/state_history[0]`],
    ["2026-03-12", `${A}#1`], ["2026-04-01", `${A}/clock[0]`], ["2026-09-28", `${F}@${CASE}/1`]]);
  for (let i = 1; i < ch.length; i++) assert.ok(ch[i - 1].date < ch[i].date || (ch[i - 1].date === ch[i].date && ch[i - 1].source < ch[i].source));
  /* exhibits: each capture a fact or event cites, with digest, locator, capture time and attestations */
  const ex = Object.fromEntries(s.exhibits.items.map((e) => [e.sha256, e]));
  const docSha = sha(`the text of ${DOC}`), evSha = sha("the text of INFO-2026-0002-ledger");
  assert.deepEqual(Object.keys(ex).sort(), [docSha, evSha].sort());
  assert.deepEqual(ex[docSha].cited_by, [`${A}#1`, `${F}@${CASE}/1`]);
  assert.deepEqual(ex[evSha].cited_by, [x.D]);
  assert.equal(ex[evSha].locator, "https://example.org/snapshots/INFO-2026-0002-ledger.txt");
  assert.equal(ex[evSha].captured_at, "2026-09-27T00:00:00Z");
  assert.deepEqual(ex[evSha].attestations.items, x.attestation.attestationsOf(evSha).attestations, "attestation's attestationsOf, never the bundle document");
  assert.deepEqual(ex[evSha].attestations.items.map((a) => a.kind), ["rfc3161", "co_archive"]);
  assert.deepEqual(ex[docSha].attestations.items, []);
  /* standards: citation, kind, issuer, text content ids, in force at the act's date */
  assert.deepEqual(s.standards.items.map((i) => [i.standard, i.cite, i.kind, i.issuer, i.in_force.state, i.outcome]), [
    [x.S1, "P.E.B.L. § 12", "ordinance", "Port Ellery Selectboard", "in_force", "noncompliant"],
    [x.S2, "MCBC 2025-3", "commitment", "Marlow County Commission", "undetermined", "compliant"]]);
  assert.deepEqual(s.standards.items[0].text, [x.evidenceCid]);
  /* theories: empty, said in words */
  assert.deepEqual(s.theories.items, []);
  assert.match(s.theories.says, /no candidate theory/);
  /* deadlines: the profile's claim deadline, whose start ("known") the record does not hold */
  assert.deepEqual(s.deadlines.items.map((d) => [d.rule, d.days, d.count, d.starts, d.citation, d.date.state]),
                   [["claim_notice", 90, "calendar", "known", "Test Stat. § 9.20", "undetermined"]]);
  assert.match(s.deadlines.items[0].start.why, /no date on which the group knew/);
  /* consequences as recorded, states kept apart */
  const rec = s.consequences.items[0].recorded;
  assert.deepEqual(rec, x.consequences.consequencesOf({ determination: x.D, viewer: V("olive") }), "whole, as recorded");
  assert.deepEqual(rec.parts.map((c) => [c.id, c.state]), [[assessed.id, "assessed"], [undetermined.id, "undetermined"]]);
  assert.deepEqual(rec.undetermined, [undetermined.id]);
  assert.ok(rec.totals.every((t) => t.state === "assessed"), "totals kept within one state");
});

test("R9 an exhibit's attestations are attestation.attestationsOf's answer (its R7), never read from the bundle document: as it answers them, its undetermined carried with why; unreadable or with no module to ask, undetermined, said so", async () => {
  const x = tier3();
  const evSha = sha("the text of INFO-2026-0002-ledger"), docSha = sha(`the text of ${DOC}`);
  const real = x.attestation;
  const exhibit = (attestation, s = evSha) => {
    const f = x.filingsWith({ attestation, ...(attestation === null ? { host: null } : {}) });
    const p = f.counselPacket({ reason: WHY, action: x.A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
    assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
    return p.sections.exhibits.items.find((e) => e.sha256 === s);
  };
  /* the real module: every attestation it answers, with its note, for each exhibit */
  for (const s of [evSha, docSha]) {
    const a = real.attestationsOf(s);
    assert.deepEqual(exhibit(real, s).attestations, { items: a.attestations, note: a.note }, s);
  }
  /* a stand-in answering what the bundle document does not hold: the exhibit shows the module's answer, so nothing is
     parsed beside it */
  const asked = [];
  const other = { kind: "co_archive", service: "elsewhere.example", locator: "https://elsewhere.example/y", bundle: "INFO-X", path: "data/provenance.json" };
  const answering = (over) => ({ attestationsOf: (s) => { asked.push(s); return { ...real.attestationsOf(s), ...over(s) }; } });
  const e = exhibit(answering((s) => (s === evSha ? { attestations: [other] } : {})));
  assert.deepEqual(e.attestations.items, [other]);
  assert.ok(asked.includes(evSha) && asked.includes(docSha), "asked for every exhibit");
  assert.deepEqual([e.coattested, e.coattested_why], [false, "the record holds a co-archive but no trusted timestamp for it"]);
  /* its undetermined, carried with why; co-attestation then undetermined too */
  const u = exhibit(answering(() => ({ attestations: [], undetermined: "its home's register cannot be read" })));
  assert.deepEqual([u.attestations.items, u.attestations.undetermined, u.coattested], [[], "its home's register cannot be read", null]);
  assert.match(u.coattested_why, /undetermined: its home's register cannot be read/);
  /* a read that fails or refuses, and no module to ask: undetermined, said so, never an empty "none recorded" */
  for (const [att, why] of [[{ attestationsOf: () => { throw new Error("down"); } }, /could not be read/],
                            [{ attestationsOf: () => ({ ok: false, reason: "BAD_SHA" }) }, /could not be read/],
                            [null, /no module answers a capture's attestations/]]) {
    const n = exhibit(att);
    assert.deepEqual([n.attestations.items, n.coattested], [[], null]);
    assert.match(n.attestations.undetermined, why);
  }
  /* a draft's exhibits read the same (R25) */
  const d = x.filingsWith({ attestation: answering((s) => (s === evSha ? { attestations: [other] } : {})) })
    .filingPrepare({ action: x.action(), preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual(d.exhibits.find((i) => i.sha256 === evSha).attestations.items, [other]);
});

test("R9 a claim deadline's date only from a recorded start event and its count: calendar, business on the holiday calendar, undetermined past the calendar's years", async () => {
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
                   ["2026-03-02", x.D, "determined", "2026-03-18"]);
  assert.equal(d.claim_act.date.calendar.status, "unconfirmed", "R30: no member has confirmed the year here");
  assert.equal(d.claim_act.source, "profile:test-filings-deadlines/deadlines/claim_act");
  assert.equal(d.claim_filed.date.state, "undetermined", "no sent entry is recorded");
  correspond(x, x.A, { direction: "sent", at: "2026-05-01", account: "letter" });
  const d2 = Object.fromEntries(pack(x).sections.deadlines.items.map((i) => [i.rule, i]));
  assert.deepEqual([d2.claim_filed.date.date, d2.claim_filed.start.source], ["2026-05-11", `${x.A}#0`]);
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

test("R30 a packet's business-day deadline states the calendar's status as action-clocks R10 states it, read through local-facts' factStatus: unconfirmed, confirmed, corrected (naming who and when, counted on the corrected days), undetermined when disputed; the office's own entries read for that office alone; a calendar count states none", async () => {
  const x0 = world();
  const PID = "test-filings-r30";
  const p = { ...x0.profile(PROFILE), id: PID,
              deadlines: [{ rule: "claim_act", applies_to: "claim", days: 2, count: "business", starts: "act", citation: "Test Stat. § 9.30", basis: "TEST" },
                          { rule: "claim_cal", applies_to: "claim", days: 2, count: "calendar", starts: "act", citation: "Test Stat. § 9.31", basis: "TEST" }] };
  const x = world({ profiles: [p] });
  /* the act on Wednesday 12 August 2026; the Town Clerk's office alone keeps Friday the 14th */
  const D = x.determine({ act: { ...x.act, at: "2026-08-12" } });
  const clerk = { state: "named", role: "Town Clerk", body: "City of Port Ellery", level: "city" };
  const A = x.action({ kind: "commitment_claim", legs: [{ target: D, kind: "rests_on" }], counterparty: clerk });
  const B = x.action({ kind: "commitment_claim", legs: [{ target: D, kind: "rests_on" }] });
  const dl = (id) => Object.fromEntries(x.f.counselPacket({ reason: WHY, action: id, counsel: COUNSEL, author: V("olive"), viewer: V("olive") })
    .sections.deadlines.items.map((i) => [i.rule, i]));
  const all = `${PID}/holidays/2026`, office = `${PID}/holidays/2026/role=Town%20Clerk`;
  /* unconfirmed: counted, and said so */
  let a = dl(A).claim_act, b = dl(B).claim_act;
  assert.deepEqual([a.date.state, a.date.date, b.date.date], ["determined", "2026-08-17", "2026-08-14"],
                   "the clerk's day is counted for the clerk's office alone");
  assert.equal(a.date.calendar.status, "unconfirmed");
  assert.deepEqual(a.date.calendar.years.map((y) => y.path).sort(), [all, office].sort(), "the entries for all offices and the office's own");
  assert.deepEqual(b.date.calendar.years.map((y) => y.path), [all]);
  assert.ok(a.date.calendar.says.every((s) => /^counted on an unconfirmed calendar \(/.test(s)));
  assert.equal(dl(A).claim_cal.date.calendar, undefined, "a calendar count reads no holiday and states none");
  /* confirmed: counted as today */
  const act = (path, o) => assert.equal(x.localFacts.factConfirm({ path, how: "the clerk's published calendar", by: V("olive"),
                                                                   viewer: V("olive"), ...o }).ok, true);
  act(all, { act: "confirm" });
  act(office, { act: "confirm" });
  a = dl(A).claim_act;
  assert.deepEqual([a.date.date, a.date.calendar.status, a.date.calendar.says], ["2026-08-17", "confirmed", []]);
  /* corrected: counted on the corrected days, naming the member and the date */
  act(office, { act: "correct", value: [{ date: "2026-08-13", name: "Clerk's records day (moved)" }], source: "the clerk's notice" });
  a = dl(A).claim_act;
  assert.deepEqual([a.date.date, a.date.calendar.status], ["2026-08-17", "corrected"], "13th closed instead: 14th, then Monday 17th");
  assert.match(a.date.calendar.says.join(" "), /corrected locally by .*2026-09-28/);
  /* disputed: undetermined, with why */
  act(all, { act: "dispute" });
  a = dl(A).claim_act;
  assert.equal(a.date.state, "undetermined");
  assert.match(a.date.why, /disputed/);
  /* a reader with no local facts: counted, the calendar `not_read` */
  assert.equal(deadlineDate({ start: "2026-08-12", days: 2, count: "business", view: combine([PROFILE]).view }).calendar.status, "not_read");
});

test("R10 every section, the head and every export carry the marking; no caption, venue heading, signature, prayer or template; fileable is false", async () => {
  const x = tier3();
  const p = pack(x);
  assert.equal(p.marking, MARK);
  assert.equal(p.head.marking, MARK);
  for (const s of Object.values(p.sections)) assert.equal(s.marking, MARK, s.title);
  assert.equal(p.fileable, false);
  const e = (await x.f.counselPacketExport({ id: p.id, version: 1, author: V("olive"), viewer: V("olive") }));
  assert.equal(e.fileable, false);
  const heads = e.bytes.split("\n").map((l, i, all) => (l.startsWith("#") ? all[i + 2] : null)).filter((l) => l !== null);
  assert.ok(heads.length >= 8);
  for (const h of heads) assert.equal(h, MARK, "the line under every heading is the marking");
  const view = combine([PROFILE]).view;
  for (const k of view.action_kinds) {
    if (k.template) assert.equal(e.bytes.includes(k.template.text.split("{{")[0].trim()), false, `no template of ${k.kind}`);
    if (k.venue) assert.equal(e.bytes.includes(k.venue.name), false, `no venue of ${k.kind}`);
  }
  for (const word of [/\bplaintiff\b/i, /\bdefendant\b/i, /\bprayer\b/i, /\bsigned\b/i, /\bcomes now\b/i, /\bv\.\s/])
    assert.doesNotMatch(e.bytes, word);
});

test("R10 with no counsel named (Tier 1 or 2) every section, the head and every export carry the group's own marking, and the packet names no counsel", async () => {
  const x = world();
  const A = x.action();
  const p = x.f.counselPacket({ reason: WHY, action: A, author: V("olive"), viewer: V("olive") });
  const OWN = "Prepared for the group's own review. Not legal advice. Not for filing.";
  assert.deepEqual([p.ok, p.marking, p.head.marking, p.head.counsel, p.fileable], [true, OWN, OWN, null, false]);
  assert.equal(counselMarking(null), OWN);
  for (const s of Object.values(p.sections)) assert.equal(s.marking, OWN, s.title);
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  assert.equal(e.counsel, null);
  const heads = e.bytes.split("\n").map((l, i, all) => (l.startsWith("#") ? all[i + 2] : null)).filter((l) => l !== null);
  assert.ok(heads.length >= 8);
  for (const h of heads) assert.equal(h, OWN, "the line under every heading is the group's marking");
  assert.equal(e.bytes.includes("Prepared for review by"), false);
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: V("bo") }).marking, OWN, "read back the same");
  assert.equal(x.f.filingsFor({ action: A, viewer: V("bo") }).packets[0].counsel, null);
  /* negative control: counsel named at Tier 1 carries counsel's marking */
  assert.equal(x.f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") }).marking, MARK);
});

test("R11 the packet is never published and has no path to publication; it is read only by a member who may see the action (NO_SUCH_PACKET otherwise); an export records who, which version, when and for which counsel; a machine is refused", async () => {
  const x = tier3();
  const p = pack(x);
  assert.equal(x.f.counselPacketRead({ id: p.id, viewer: V("bo") }).ok, true);
  const hidden = x.f.counselPacketRead({ id: p.id, viewer: STRANGER });
  const absent = x.f.counselPacketRead({ id: "CPK-NONE", viewer: V("bo") });
  assert.deepEqual([hidden.reason, hidden.detail], [absent.reason, absent.detail]);
  assert.equal(hidden.reason, "NO_SUCH_PACKET");
  assert.equal((await x.f.counselPacketExport({ id: p.id, author: V("bo"), viewer: STRANGER })).reason, "NO_SUCH_PACKET");
  assert.equal((await x.f.counselPacketExport({ id: p.id, author: MACHINE, viewer: MACHINE })).reason, "MACHINE_CANNOT_EXPORT");
  const e = (await x.f.counselPacketExport({ id: p.id, version: 1, author: V("olive"), viewer: V("olive") }));
  assert.deepEqual([e.ok, e.id, e.version, e.exported_by, e.at, e.counsel, e.format], [true, p.id, 1, V("olive"), "2026-09-28T01:00:00Z", COUNSEL, "text/markdown"]);
  assert.equal(e.sha, sha(e.bytes));
  assert.deepEqual(x.f.counselPacketRead({ id: p.id, viewer: V("olive") }).exports,
                   [{ exported_by: V("olive"), at: "2026-09-28T01:00:00Z", counsel: COUNSEL, sha: e.sha }]);
  /* No path to publication: none of its public reads knows the packet, its bytes or its digest. */
  assert.equal(x.pr.verifySha(e.sha).published, false);
  assert.equal(x.pr.publishedCase({ id: p.id }).ok, false);
  assert.equal(JSON.stringify(x.pr.publishedManifest()).includes(p.id), false);
  assert.equal(JSON.stringify(x.pr.publishedList()).includes(p.id), false);
  const pub = x.pr.publishedCase({ caseId: CASE });
  assert.equal(JSON.stringify(pub).includes(p.id), false);
  assert.equal(JSON.stringify(pub).includes(MARK), false);
});

test("R12 assembling again makes a new version and earlier versions stay readable; a version is flagged basis_changed, naming each cause, and nothing in it changes", async () => {
  const x = tier3();
  const v1 = pack(x);
  const v2 = pack(x, { counsel: { name: "B. Counsel", organisation: "Other Chambers" } });
  assert.deepEqual([v2.id, v2.version], [v1.id, 2]);
  const r1 = x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") });
  assert.deepEqual([r1.version, r1.head.counsel, r1.versions, r1.basis_changed], [1, COUNSEL, [1, 2], null]);
  assert.deepEqual(r1.sections, v1.sections);
  /* a later edition of the finding's case: the finding's cause, and conformance's own flag when it raises one */
  x.publishEdition(2);
  const causes = () => (x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") }).basis_changed?.causes || []).map((c) => c.cause).sort();
  const flaggedByConformance = !!x.conformance.determinationRead({ id: x.D, viewer: MACHINE }).basis_changed;
  assert.deepEqual(causes(), [...(flaggedByConformance ? ["determination_flagged"] : []), "finding_later_edition"]);
  /* a standard superseded, and the determination superseded */
  x.declare({ cite: "MCBC 2025-3A", kind: "commitment", issuer: "Marlow County Commission", supersedes: x.S2 });
  supersede(x, x.D);
  const flagged = x.f.counselPacketRead({ id: v1.id, version: 1, viewer: V("olive") });
  assert.deepEqual(flagged.basis_changed.causes.map((c) => c.cause).sort(),
                   ["determination_superseded", "finding_later_edition", "standard_superseded"]);
  const later = flagged.basis_changed.causes.find((c) => c.cause === "finding_later_edition");
  assert.deepEqual([later.finding, later.edition, later.later], [F, 1, 2]);
  assert.deepEqual(flagged.sections, v1.sections, "nothing in the version changes");
  assert.deepEqual(x.rows(`SELECT version FROM counsel_packets ORDER BY version`).map((r) => r.version), [1, 2]);
});

test("R14 any credential may propose a candidate theory and remedy against named standards, stored apart and labelled, why at most 1,000 characters; NO_STANDARDS (THEORY_NO_STANDARDS), NO_SUCH_STANDARD naming it; it enters the next packet version as a candidate", async () => {
  const x = tier3();
  const v1 = pack(x);
  const prop = (over = {}) => x.f.theoryPropose({ packet: v1.id, theory: "The order breached the bylaw's vote requirement.",
    remedy: "Rescission of the order.", standards: [x.S1], why: "the determination finds it noncompliant",
    proposer: V("bo"), viewer: V("bo"), ...over });
  assert.equal(prop({ proposer: "" }).reason, "THEORY_NO_PROPOSER");
  assert.equal(prop({ packet: "CPK-NONE" }).reason, "NO_SUCH_PACKET");
  assert.equal(prop({ packet: null, action: "ACTION-NONE" }).reason, "NO_SUCH_ACTION");
  assert.equal(prop({ standards: [] }).reason, "THEORY_NO_STANDARDS");
  const bad = prop({ standards: [x.S1, "STD-NONE"] });
  assert.deepEqual([bad.reason, bad.id, bad.check], ["NO_SUCH_STANDARD", "STD-NONE", "C-112.10"], "standards' own refusal, naming it");
  assert.equal(prop({ why: "x".repeat(1001) }).reason, "THEORY_WHY_REFUSED");
  assert.equal(prop({ why: "" }).reason, "THEORY_WHY_REFUSED");
  assert.equal(prop({ why: "x".repeat(1000) }).ok, true, "1,000 characters is allowed");
  const m = prop({ proposer: MACHINE, viewer: MACHINE, packet: null, action: x.A });
  assert.deepEqual([m.ok, m.evidence, m.proposal.label.state, m.proposal.label.machine_work], [true, false, "machine_proposed", true]);
  assert.match(m.says, /not the group's position/);
  assert.equal(x.f.counselPacketRead({ id: v1.id, viewer: V("olive") }).sections.theories.items.length, 0,
               "the version already assembled does not change");
  const v2 = pack(x);
  const items = v2.sections.theories.items;
  assert.equal(items.length, 2);
  for (const t of items) {
    assert.equal(t.candidate, true);
    assert.deepEqual(t.standards, [x.S1]);
    assert.ok(t.label && t.label.says);
  }
  assert.match(v2.sections.theories.says, /never the group's position/);
});

test("R10 R22 the export's bytes are the rendering of the version read, the marking under every heading, then the in-band block", async () => {
  const x = tier3();
  const p = pack(x);
  const read = x.f.counselPacketRead({ id: p.id, viewer: V("olive") });
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  assert.ok(e.bytes.startsWith(`${Filings.render(read)}\n${INBAND_RULE}\n`), "the rendering, then the in-band block (R22)");
});

test("R27 R12 a superseded standard whose successor the reader may not see is named superseded without by, its cause stating out_of_view: true; a successor the reader sees is named by, with no key", async () => {
  const x = tier3();
  const v1 = pack(x);
  const S2b = x.declare({ cite: "MCBC 2025-3A", kind: "commitment", issuer: "Marlow County Commission", supersedes: x.S2 });
  /* membership's sight, as the real one answers it, except that bo may not see the successor */
  const real = x.membership;
  const membership = new Proxy(real, { get: (t, k) => (k === "inSight"
    ? (id, viewer) => (id === S2b && viewer === V("bo") ? false : t.inSight(id, viewer)) : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const f = x.filingsWith({ membership });
  const cause = (viewer) => f.counselPacketRead({ id: v1.id, viewer }).basis_changed.causes.find((c) => c.cause === "standard_superseded");
  const hidden = cause(V("bo"));
  assert.deepEqual(hidden, { cause: "standard_superseded", standard: x.S2, out_of_view: true });
  const listed = f.filingsFor({ action: x.A, viewer: V("bo") }).packets[0].basis_changed.causes.find((c) => c.cause === "standard_superseded");
  assert.deepEqual(listed, hidden, "filingsFor answers the same");
  /* negative control: a reader who sees the successor */
  assert.deepEqual(cause(V("olive")), { cause: "standard_superseded", standard: x.S2, by: S2b });
});

test("R27 R12 a flagged determination's causes are those conformance answers the reader, never read as the machine: a cause naming a finding the reader may not see gives the reader no cause naming it", async () => {
  const x = tier3();
  const v1 = pack(x);
  const HIDDEN = "INQ-2026-0077";
  /* conformance's R24, by a proxy of the real one: D's flag carries a cause about HIDDEN, withheld from bo whole */
  const real = x.conformance;
  const conformance = {
    determinationsFor: (a) => real.determinationsFor(a),
    determinationRead(a) {
      const d = real.determinationRead(a);
      if (!d || d.ok === false || d.id !== x.D) return d;
      const mine = { kind: "finding_superseded", subject: HIDDEN, source: HIDDEN, since: "2026-09-28", detail: `${HIDDEN} was superseded` };
      return a.viewer === V("bo") ? { ...d, basis_changed: { causes: [], says: "withheld" }, out_of_view: true }
        : { ...d, basis_changed: { causes: [mine], says: "flagged" } };
    },
  };
  const f = x.filingsWith({ conformance });
  for (const r of [f.counselPacketRead({ id: v1.id, viewer: V("bo") }), f.filingsFor({ action: x.A, viewer: V("bo") })]) {
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.equal(JSON.stringify(r).includes(HIDDEN), false, "no cause naming it");
  }
  const bo = f.counselPacketRead({ id: v1.id, viewer: V("bo") }).basis_changed.causes;
  assert.deepEqual(bo, [{ cause: "determination_flagged", determination: x.D, causes: [] }], "the flag stands, its cause left out");
  /* negative control: a reader conformance answers the cause */
  const olive = f.counselPacketRead({ id: v1.id, viewer: V("olive") }).basis_changed.causes;
  assert.deepEqual(olive.map((c) => [c.cause, c.causes.map((k) => k.subject)]), [["determination_flagged", [HIDDEN]]]);
});
