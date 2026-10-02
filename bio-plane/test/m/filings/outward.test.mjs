/* filings — what leaves the instance and what it is prepared from (T18, the Action layer: K608, K613 (3)): the in-band
   quartet on approved bytes and exports (R22), communications (R23), the exhibits' grades beside the venue's standard
   (R25) and the group's template library (R26). Driven at the module's interface and through its ops, over the real
   modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, MACHINE, STRANGER, PROFILE, DOC, EVID, sha, WORDS, LAW, WHY } from "./fixture.mjs";
import { Filings, INBAND_RULE, inbandBlock } from "../../../src/filings/index.mjs";
import { inbandQuartet } from "../../../src/inband.mjs";
import { validate } from "../../../../jurisdictions/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const OUTSIDER = V("quinn");
const rehash = (text) => createHash("sha256").update(JSON.stringify(text, null, 1), "utf8").digest("hex");
const prep = (x, action, over = {}) => x.f.filingPrepare({ action, preparer: V("bo"), viewer: V("bo"), ...over });
/* A Tier 1 draft in the member's words on a fresh action, its one unfillable blank written in. */
function drafted(x, o = {}) {
  const A = x.action(o);
  const d = prep(x, A, { text: WORDS });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  return { A, d, text: d.text.replace("[UNFILLED: law]", LAW) };
}
/* The project's bundle.md revised by its owner to declare `required_strength` (strength R14). */
function declareBar(x, lines) {
  const head = x.record.head(x.proj);
  const text = x.text(x.proj).replace(/^---\n/, `---\nrequired_strength:\n${lines.map((l) => `  ${l}`).join("\n")}\n`);
  const r = x.promotion.promote({ bundleId: x.proj, base: head.bundleSha, snapKey: `bar-${lines.join()}`, author: V("olive"),
                                  files: [{ path: "bundle.md", text }], meta: { object_type: "project" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
}
/* The test profile under another id, `bylaw_complaint` carrying `evidence` (jurisdictions R39). */
function withEvidence(x, id, evidence) {
  const p = x.profile(PROFILE);
  const out = { ...p, id, action_kinds: p.action_kinds.map((k) => (k.kind === "bylaw_complaint" ? { ...k, evidence: { basis: "TEST", ...evidence } } : k)) };
  assert.equal(validate(out).ok, true, JSON.stringify(validate(out).errors));
  return out;
}

test("R22 an approved filing's bytes carry the in-band quartet: its hash over the text above the rule by inbandQuartet, the date, the author and both floors (the project's bar); a draft carries none; a reader re-hashes it", async () => {
  const x = world();
  const { d, text } = drafted(x);
  assert.equal("inband" in d, false, "a draft not yet approved carries none");
  assert.equal(d.text.includes(INBAND_RULE), false);
  const r = await x.f.filingApprove({ filing: d.id, text, author: V("bo"), viewer: V("bo") });
  assert.equal(r.ok, true);
  const q = r.inband;
  assert.equal(q.format, "bio-inband/1");
  assert.deepEqual([q.hash.sha256, q.date, q.author], [rehash(text), r.at, V("bo")]);
  assert.deepEqual(q, (await inbandQuartet({ subject: text, over: q.hash.over, date: r.at, author: V("bo"), bar: null })).quartet,
                   "the one hasher's quartet, nothing computed beside it");
  assert.deepEqual([q.floors.declared, q.floors.capture, q.floors.connection], [false, null, null], "the project declares no bar");
  assert.equal(r.bytes, `${text}\n${inbandBlock(q)}`);
  /* a reader holding only the bytes: the text above the rule, re-hashed */
  const above = r.bytes.slice(0, r.bytes.indexOf(`\n${INBAND_RULE}\n`));
  assert.equal(rehash(above), q.hash.sha256);
  assert.ok(r.bytes.includes(`Hash: sha256 ${q.hash.sha256}`) && r.bytes.includes(`Author: ${V("bo")}`) && r.bytes.includes(`Date: ${r.at}`));
  assert.equal(r.sha, sha(text), "R6's SHA-256 stays the approved text's");
  assert.deepEqual(JSON.parse(x.row(`SELECT inband FROM filing_approvals WHERE filing_id=?`, d.id).inband), q, "stored as served");
  /* the project declares its bar: the floors are the project's, both axes */
  declareBar(x, ["capture: B", "connection: C"]);
  const two = drafted(x);
  const r2 = await x.f.filingApprove({ filing: two.d.id, text: two.text, author: V("cy"), viewer: V("cy") });
  assert.deepEqual([r2.inband.floors.declared, r2.inband.floors.capture, r2.inband.floors.connection], [true, "B", "C"]);
  assert.ok(r2.bytes.includes("Floors: capture B, connection C."));
  /* through the op, awaited as control-plane's dispatch awaits it */
  const three = drafted(x);
  const o = await x.op("filingapprove", { author: V("bo"), viewer: V("bo") }, { filing: three.d.id, text: three.text });
  assert.deepEqual([o.ok, o.inband.hash.sha256], [true, rehash(three.text)]);
});

test("R22 every counsel-packet export carries the in-band quartet over the packet's rendering; each export is stamped with its own date and author", async () => {
  const x = world();
  const T3 = x.action({ kind: "commitment_claim" });
  const p = x.f.counselPacket({ reason: WHY, action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  const read = x.f.counselPacketRead({ id: p.id, viewer: V("olive") });
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  const face = Filings.render(read);
  assert.deepEqual([e.inband.hash.sha256, e.inband.author, e.inband.date], [rehash(face), V("olive"), e.at]);
  assert.equal(e.bytes, `${face}\n${inbandBlock(e.inband)}`);
  assert.equal(e.sha, sha(e.bytes), "the export's digest is of the bytes handed over");
  assert.deepEqual(JSON.parse(x.row(`SELECT inband FROM counsel_packet_exports WHERE sha=?`, e.sha).inband), e.inband);
  x.clock.now = "2026-09-28T05:00:00Z";
  const e2 = await x.f.counselPacketExport({ id: p.id, author: V("bo"), viewer: V("bo") });
  assert.deepEqual([e2.inband.author, e2.inband.date, e2.inband.hash.sha256], [V("bo"), "2026-09-28T05:00:00Z", rehash(face)]);
});

test("R23 communicationPrepare: any credential prepares a communication for an action, stored apart, labelled, evidence: false, from no template; R6 and R7 apply unchanged (approved with the quartet, recorded sent by a member); filingsFor lists it marked a communication; the instance transmits nothing", async () => {
  const x = world();
  const T3 = x.action({ kind: "commitment_claim" });
  const before = x.text(T3);
  const m = x.f.communicationPrepare({ action: T3, text: "A briefing for the press on the works order.", purpose: "press briefing",
                                       preparer: MACHINE, viewer: MACHINE });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  assert.deepEqual([m.form, m.label.state, m.label.machine_work, m.evidence], ["communication", "machine_proposed", true, false]);
  assert.match(m.label.says, /communication/);
  assert.match(m.says, /nobody has approved or sent it/);
  assert.match(m.id, /^FIL-2026-\d{4}$/, "the drafts' own id space");
  assert.equal(m.text, "A briefing for the press on the works order.", "the preparer's words, no template read, any tier");
  assert.equal(x.text(T3), before, "stored apart: the action's bytes are untouched");
  assert.equal(x.count("communication_drafts"), 1);
  assert.equal(x.count("filing_drafts"), 0);
  /* R6 unchanged: a machine never approves; a member does, with the quartet */
  assert.equal((await x.f.filingApprove({ filing: m.id, author: MACHINE, viewer: MACHINE })).reason, "MACHINE_CANNOT_APPROVE");
  const ap = await x.f.filingApprove({ filing: m.id, author: V("bo"), viewer: V("bo") });
  assert.deepEqual([ap.ok, ap.form, ap.edited, ap.inband.hash.sha256], [true, "communication", false, rehash(m.text)]);
  assert.equal((await x.f.filingApprove({ filing: m.id, author: V("bo"), viewer: V("bo") })).reason, "ALREADY_APPROVED");
  /* R7 unchanged: one sent entry, by a member's own hand */
  assert.equal(x.f.filingRecordSent({ filing: m.id, at: "2026-09-29", account: "x", author: MACHINE, viewer: MACHINE }).reason, "MACHINE_CANNOT_FILE");
  const s = x.f.filingRecordSent({ filing: m.id, at: "2026-09-29", account: "read to the reporter", author: V("bo"), viewer: V("bo") });
  assert.deepEqual([s.ok, s.ord, s.held_as], [true, 0, "testimony"]);
  assert.deepEqual(x.read(T3).correspondence.map((e) => [e.direction, e.account]), [["sent", "read to the reporter"]]);
  /* R13: listed among the drafts, marked */
  x.clock.now = "2026-09-28T02:00:00Z";
  const c2 = x.op("communicationprepare", { author: V("cy"), viewer: V("cy") }, { action: T3, text: "Words.", purpose: "a statement" });
  assert.equal(c2.ok, true);
  const l = x.f.filingsFor({ action: T3, viewer: V("bo") });
  assert.deepEqual(l.drafts.map((r) => [r.filing, r.form, r.purpose, r.label.state, !!r.approval, !!r.sending]),
                   [[m.id, "communication", "press briefing", "machine_proposed", true, true],
                    [c2.id, "communication", "a statement", "member_proposed", false, false]]);
  /* R6's staleness applies to it: the tier changed since */
  const A = x.action();
  const c3 = x.f.communicationPrepare({ action: A, text: "t", purpose: "p", preparer: V("bo"), viewer: V("bo") });
  x.actions.actionRiskTier({ target: A, tier: 2, reason: "raised", author: V("olive"), viewer: V("olive") });
  assert.equal((await x.f.filingApprove({ filing: c3.id, author: V("bo"), viewer: V("bo") })).reason, "FILING_STALE");
  /* refusals with negative controls */
  const cp = (o) => x.f.communicationPrepare({ action: A, text: "t", purpose: "p", preparer: V("bo"), viewer: V("bo"), ...o });
  assert.equal(cp({ preparer: " " }).reason, "COMMUNICATION_NO_PREPARER");
  assert.equal(cp({ viewer: STRANGER }).reason, "NO_SUCH_ACTION", "invisible answers as absent");
  assert.equal(cp({ action: x.action({ state: "resolved", resolution: "complied" }) }).reason, "ACTION_CLOSED");
  for (const t of [null, "", "  ", "\uD800", "x".repeat(65537)]) assert.equal(cp({ text: t }).reason, "COMMUNICATION_TEXT_REFUSED", String(t).slice(0, 9));
  for (const p of [null, "", "x".repeat(501)]) assert.equal(cp({ purpose: p }).reason, "COMMUNICATION_PURPOSE_REFUSED");
  assert.equal(cp({ purpose: "x".repeat(500) }).ok, true, "500 characters is allowed");
});

test("R25 every draft and packet shows each exhibit's capture grade (provenance's) and whether it is co-attested; with no venue standard, it reads undetermined and the grades stand alone; nothing is refused for a grade", () => {
  const x = world();
  const { d } = drafted(x);
  const docSha = sha(`the text of ${DOC}`), evSha = sha(`the text of ${EVID}`);
  const ex = Object.fromEntries(d.exhibits.map((e) => [e.sha256, e]));
  assert.deepEqual(Object.keys(ex).sort(), [docSha, evSha].sort(), "the captures the draft rests on");
  for (const s of [docSha, evSha]) {
    const g = x.prov.captureGrade(s);
    assert.deepEqual([ex[s].grade.grade, ex[s].grade.route, ex[s].grade.determined], [g.grade, g.route, g.determined], "provenance's grade");
  }
  assert.deepEqual([ex[evSha].grade.grade, ex[evSha].coattested], ["B", true], "a trusted timestamp and a co-archive");
  assert.deepEqual([ex[docSha].grade.grade, ex[docSha].coattested], [null, false]);
  assert.match(ex[docSha].coattested_why, /neither a trusted timestamp nor a co-archive/);
  assert.equal(d.venue_standard.state, "undetermined", "the profile states no standard for this kind");
  assert.match(d.venue_standard.why, /grades are shown alone/);
  for (const e of d.exhibits) assert.deepEqual([e.venue.state, e.venue.flagged], ["undetermined", false]);
  assert.deepEqual(JSON.parse(x.row(`SELECT exhibits FROM filing_drafts WHERE filing_id=?`, d.id).exhibits), d.exhibits, "stored with the draft");
  /* the Tier 3 kind's venue states a standard: the packet shows it beside the grades */
  const T3 = x.action({ kind: "commitment_claim" });
  const p = x.f.counselPacket({ reason: WHY, action: T3, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  const sec = p.sections.exhibits;
  assert.equal(sec.venue_standard.state, "stated");
  assert.equal(sec.venue_standard.standard, x.profile().action_kinds.find((k) => k.kind === "commitment_claim").evidence.standard);
  const pe = Object.fromEntries(sec.items.map((e) => [e.sha256, e]));
  assert.deepEqual([pe[evSha].venue.state, pe[evSha].venue.flagged], ["accepted", false], "B is within what the venue accepts");
  assert.deepEqual([pe[docSha].venue.state, pe[docSha].venue.flagged], ["undetermined", false], "an unmeasured grade is not read against it");
  assert.ok(p.ok, "never refused for a grade");
});

test("R25 the venue's standard flags an exhibit below every grade it accepts, one accepted only co-attested that is not, and one at a grade the profile marks contestable; profiles that disagree leave it undetermined", () => {
  const x0 = world();
  const evSha = sha(`the text of ${EVID}`);
  const reading = (evidence, id) => {
    const x = world({ profiles: [withEvidence(x0, id, evidence)] });
    const r = drafted(x).d;
    return { std: r.venue_standard, ev: r.exhibits.find((e) => e.sha256 === evSha).venue, r };
  };
  const below = reading({ standard: "only originals", accepts: [{ grade: "A" }] }, "test-ev-a");
  assert.deepEqual([below.std.state, below.ev.state, below.ev.flagged], ["stated", "below", true]);
  assert.match(below.ev.says, /below every grade the venue accepts/);
  assert.equal(below.r.ok, true, "flagged, never refused");
  const contest = reading({ standard: "copies admitted", accepts: [{ grade: "A" }], contestable: [{ grade: "B" }] }, "test-ev-c");
  assert.deepEqual([contest.ev.state, contest.ev.flagged], ["contestable", true]);
  const accepted = reading({ standard: "attested copies", accepts: [{ grade: "B", coattested: true }] }, "test-ev-b");
  assert.deepEqual([accepted.ev.state, accepted.ev.flagged], ["accepted", false], "co-attested, as the venue asks");
  /* a B capture held without attestations: the venue accepts B only co-attested */
  const x = world({ profiles: [withEvidence(x0, "test-ev-b2", { standard: "attested copies", accepts: [{ grade: "B", coattested: true }] })] });
  const reply = x.capture("INFO-2026-0003-reply", "the clerk's reply");
  x.prov.recordReceipt({ address: "https://example.org/reply", addressNorm: "example.org/reply", captureSha: reply,
                         retrieved: "2026-09-27T00:00:00Z" });
  const A = x.action();
  const c = x.actions.actionCorrespond({ target: A, direction: "received", at: "2026-03-12", artifactSha: reply, author: V("bo"), viewer: V("bo") });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 200));
  const e = prep(x, A).exhibits.find((i) => i.sha256 === reply);
  assert.deepEqual([e.grade.grade, e.coattested, e.venue.state, e.venue.flagged], ["B", false, "below", true]);
  assert.match(e.venue.says, /only co-attested/);
  assert.deepEqual(e.cited_by, [`${A}#0`], "the correspondence's capture is an exhibit");
  /* two profiles stating different standards: withheld, the grades alone */
  const y = world({ profiles: [withEvidence(x0, "test-ev-d1", { standard: "one", accepts: [{ grade: "A" }] }),
                               withEvidence(x0, "test-ev-d2", { standard: "two", accepts: [{ grade: "B" }] })] });
  const u = drafted(y).d;
  assert.equal(u.venue_standard.state, "undetermined");
  assert.match(u.venue_standard.why, /different evidence standards/);
});

test("R19 communications are keyed to their action and purged with it; the retired R26 library's table is written by nothing", async () => {
  const x = world();
  const { A, d, text } = drafted(x);
  await x.f.filingApprove({ filing: d.id, text, author: V("bo"), viewer: V("bo") });
  assert.equal(x.f.templateSave({ filing: d.id, name: "kept", author: V("bo"), viewer: V("bo") }).ok, true);
  assert.equal(x.count("filing_templates"), 0, "R32 hands the draft to filing-templates; filings keeps no library (K921, K986)");
  assert.equal(x.f.communicationPrepare({ action: A, text: "t", purpose: "p", preparer: V("bo"), viewer: V("bo") }).ok, true);
  const report = x.record.purge({ bundleId: A });
  for (const t of ["communication_drafts", "filing_templates"]) assert.ok(t in report.removed, `${t} is declared`);
  assert.equal(x.count("communication_drafts"), 0);
});
