/* filings at T50 (T50-46; N933, K3230, K3635): the matter's stake. R60 which stake shows (the action's own, else its
   project's, else none; an unreadable source "undetermined", never the other and never none), R61 the stamp's `group` is
   `groupFields({project})` with `matter_stake` set to R60's answer beside the team's stake, and the in-band block says
   both in words (keys), R62 `stakeAtPreparation` (a prompt, never a gate), R63 an accepted finding's source line prints
   its matter stake. Driven at the module's interface over the real modules; project-roster's `projectStakeSet` (its R31)
   and public-read's `groupFields` (its R36) are the real ones. `actions` R105 (`own_stake`, an accepted disclosure's
   `matter_stake`) is a stand-in answering as its requirement states, until actions' job merges (as `actionsWith` stands in
   for R75's disclosures). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, STRANGER, WHY, actionsWith } from "./fixture.mjs";
import { groupLine, matterWords } from "../../../src/filings/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const TEAM = "residents of the harbour ward";
const PROJECT_STAKE = "tenants of Block 4 live beside the works";
const OWN_STAKE = "our rent is set by the same order";
const prep = (f, action, over = {}) => f.filingPrepare({ action, text: "To the {{counterparty_role}}: a letter.", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const comm = (f, action, over = {}) => f.communicationPrepare({ action, text: "A word to the board.", purpose: "a letter", preparer: V("bo"), viewer: V("bo"), language: "en", ...over });
const approve = (f, filing, over = {}) => f.filingApprove({ filing, author: V("bo"), viewer: V("bo"), ...over });
const own = (stake, extra = {}) => ({ own_stake: { stake, set_by: "bo", set_at: "2026-10-02T09:00:00Z", history: [], ...extra } });
const projectStake = (x, stake, by = "olive") => {
  const r = x.roster.projectStakeSet({ projectId: x.proj, stake, by, viewer: V(by) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return r;
};
const matterOf = (f, A) => f.stakeAtPreparation({ action: A, viewer: V("bo") }).matter_stake;
/** public-read as the module reads it, its `groupFields` answering what a test says (the real one otherwise) */
const publicReadSaying = (x, matter) => new Proxy(x.pr, { get: (t, k) => (k === "groupFields"
  ? (a) => ({ ...t.groupFields(a), matter_stake: typeof matter === "function" ? matter() : matter })
  : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });

test("R60 the stake shown for an action is its own when one is set, otherwise its project's, otherwise none: with both set the action's shows; after the action's is cleared the project's shows; with neither, null", async () => {
  const x = world();
  const A = x.action();
  const f = x.filingsWith();
  assert.equal(matterOf(f, A), null, "neither set: null");
  projectStake(x, PROJECT_STAKE);
  const m = matterOf(f, A);
  assert.deepEqual([m.stake, m.source, typeof m.set_by, typeof m.set_at], [PROJECT_STAKE, "project", "string", "string"], "the project's, with who set it and when");
  /* both set: the action's own shows */
  const g = x.filingsWith({ actions: actionsWith(x, { [A]: own(OWN_STAKE) }) });
  assert.deepEqual(matterOf(g, A), { stake: OWN_STAKE, set_by: "bo", set_at: "2026-10-02T09:00:00Z", source: "action" });
  /* the action's cleared (stake null): the project's again */
  const cleared = x.filingsWith({ actions: actionsWith(x, { [A]: own(null) }) });
  assert.deepEqual([matterOf(cleared, A).stake, matterOf(cleared, A).source], [PROJECT_STAKE, "project"]);
  /* the project's cleared too: none */
  projectStake(x, null);
  assert.equal(matterOf(cleared, A), null, "neither: null");
  assert.equal(matterOf(f, A), null);
  /* an action whose read answers no `own_stake` at all (before actions' R105) is under its project */
  projectStake(x, PROJECT_STAKE);
  assert.equal(matterOf(f, A).source, "project");
});

test("R60 control: an unreadable action stake answers undetermined with source action, not the project's and not null; an unreadable project stake answers undetermined with source project, never null; neither is read as none", async () => {
  const x = world();
  const A = x.action();
  projectStake(x, PROJECT_STAKE);
  const unreadable = x.filingsWith({ actions: actionsWith(x, { [A]: own("undetermined") }) });
  assert.deepEqual(matterOf(unreadable, A), { stake: "undetermined", set_by: null, set_at: null, source: "action" }, "not the project's stake");
  const malformed = x.filingsWith({ actions: actionsWith(x, { [A]: { own_stake: "garbled" } }) });
  assert.equal(matterOf(malformed, A).stake, "undetermined");
  assert.equal(matterOf(malformed, A).source, "action");
  /* the project's stake cannot be read: public-read answers it undetermined, or throws */
  const unread = { stake: "undetermined", set_by: null, set_at: null, source: "project" };
  const saysUnread = x.filingsWith({ publicRead: publicReadSaying(x, unread) });
  assert.deepEqual(matterOf(saysUnread, A), unread);
  const throws = x.filingsWith({ publicRead: new Proxy(x.pr, { get: (t, k) => (k === "groupFields" ? () => { throw new Error("unreadable"); } : t[k]) }) });
  assert.deepEqual(matterOf(throws, A), unread, "a read that throws is undetermined, never none");
  const nothing = x.filingsWith({ publicRead: {} });
  assert.deepEqual(matterOf(nothing, A), unread, "no module answering the project's stake: undetermined");
  /* control: readable, none set */
  projectStake(x, null);
  assert.equal(matterOf(x.filingsWith(), A), null);
});

test("R60 the project is the action's own record's, else the project of the determination it rests on; an action in no project and with no stake of its own has none", async () => {
  const x = world();
  projectStake(x, PROJECT_STAKE);
  const named = x.action({ project: x.proj, legs: [] });
  assert.equal(matterOf(x.filingsWith(), named).stake, PROJECT_STAKE, "named by its own record");
  const viaDetermination = x.action();
  assert.equal(matterOf(x.filingsWith(), viaDetermination).stake, PROJECT_STAKE, "through the determination it rests on");
  const loose = x.action({ legs: [] });
  assert.equal(matterOf(x.filingsWith(), loose), null, "no project, no stake of its own: none");
  assert.equal(matterOf(x.filingsWith({ actions: actionsWith(x, { [loose]: own(OWN_STAKE) }) }), loose).source, "action");
});

test("R61 an approved communication's stamp carries both stakes in its group (the team's stake and the matter's, beside each other) and in the in-band block's words; the body fingerprint is computed without them", async () => {
  const x = world();
  x.pr.registerGroupIdentity({ identity: () => ({ group: "test-group", display_name: "Port Ellery Watch", domain: "pew.example", domain_verified_at: "2026-09-01" }) });
  x.record.setSetting("declared_stake", TEAM, V("olive"));
  projectStake(x, PROJECT_STAKE);
  const f = x.filingsWith();
  const A = x.action();
  const r = await approve(f, comm(f, A, { text: "A plain letter." }).id);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const g = r.inband.group;
  assert.deepEqual([g.name, g.stake], ["Port Ellery Watch", TEAM], "the team's own stake, unchanged");
  assert.deepEqual([g.matter_stake.stake, g.matter_stake.source], [PROJECT_STAKE, "project"], "and the matter's, beside it");
  const m = g.matter_stake;
  const line = `${word("stake.inmatter")}: ${PROJECT_STAKE} (${word("stake.source.project", { who: m.set_by, date: m.set_at.slice(0, 10) })}).`;
  assert.ok(r.bytes.includes(groupLine(g)), "the team's line");
  assert.ok(r.bytes.includes(`\n${line}\n`), `the matter's line, in words: ${line}`);
  assert.ok(r.bytes.indexOf(groupLine(g)) < r.bytes.indexOf(line), "beside the team's, after it");
  assert.deepEqual(JSON.parse(x.row(`SELECT inband FROM filing_approvals WHERE filing_id=?`, r.filing).inband).group.matter_stake, m, "stored as served");
  /* the fingerprint is the same with no matter stake at all */
  const y = world();
  const g2 = y.filingsWith();
  const r2 = await approve(g2, comm(g2, y.action(), { text: "A plain letter." }).id);
  assert.deepEqual([r2.inband.hash.sha256, r2.body_sha], [r.inband.hash.sha256, r.body_sha]);
  /* an approved filing too, the action's own stake in its place when one is set */
  const h = x.filingsWith({ actions: actionsWith(x, { [A]: own(OWN_STAKE) }) });
  const ra = await approve(h, prep(h, A, { text: "A letter." }).id);
  assert.deepEqual([ra.inband.group.stake, ra.inband.group.matter_stake.stake, ra.inband.group.matter_stake.source], [TEAM, OWN_STAKE, "action"]);
  assert.ok(ra.bytes.includes(`${word("stake.inmatter")}: ${OWN_STAKE} (${word("stake.source.action", { who: "bo", date: "2026-10-02" })}).`));
  assert.equal(JSON.parse(ra.bytes.split("\n").at(-2)).group.matter_stake.stake, OWN_STAKE, "the stamp's JSON carries it too");
});

test("R61 control: an action in a project with no stake and none of its own carries matter_stake null, the team's stake unchanged and no matter line; the stake is read at approval, and an approval already given keeps the stamp it was given", async () => {
  const x = world();
  x.record.setSetting("declared_stake", TEAM, V("olive"));
  const f = x.filingsWith();
  const A = x.action();
  const d = comm(f, A, { text: "A plain letter." });
  const none = await approve(f, d.id);
  assert.deepEqual([none.inband.group.stake, none.inband.group.matter_stake], [TEAM, null]);
  assert.equal(none.bytes.includes(word("stake.inmatter")), false, "no matter line is added");
  /* read at approval: set after preparing and before approving it is carried; set after approving it changes nothing */
  const d2 = comm(f, A, { text: "Another letter." });
  projectStake(x, PROJECT_STAKE);
  const late = await approve(f, d2.id);
  assert.equal(late.inband.group.matter_stake.stake, PROJECT_STAKE);
  projectStake(x, "something else entirely");
  assert.equal(JSON.parse(x.row(`SELECT inband FROM filing_approvals WHERE filing_id=?`, d2.id).inband).group.matter_stake.stake, PROJECT_STAKE,
               "a stamp already given is kept as given");
  /* an unread stake is told as unread in the block, never as none */
  const g = x.filingsWith({ actions: actionsWith(x, { [A]: own("undetermined") }) });
  const un = await approve(g, comm(g, A, { text: "A third letter." }).id);
  assert.equal(un.inband.group.matter_stake.stake, "undetermined");
  assert.ok(un.bytes.includes(`${word("stake.inmatter")}: ${word("stake.unreadable")}.`));
});

test("R61 a counsel packet's export carries both stakes in its stamp, the packet's action giving the project and the matter's stake", async () => {
  const x = world();
  x.record.setSetting("declared_stake", TEAM, V("olive"));
  projectStake(x, PROJECT_STAKE);
  const A = x.action({ kind: "commitment_claim" });
  const p = x.f.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive") });
  const e = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  assert.deepEqual([e.inband.group.stake, e.inband.group.matter_stake.stake, e.inband.group.matter_stake.source], [TEAM, PROJECT_STAKE, "project"]);
  assert.ok(e.bytes.includes(`${word("stake.inmatter")}: ${PROJECT_STAKE} (`));
  /* the same packet, its project's stake cleared: none, and no line */
  projectStake(x, null);
  const e2 = await x.f.counselPacketExport({ id: p.id, author: V("olive"), viewer: V("olive") });
  assert.equal(e2.inband.group.matter_stake, null);
  assert.equal(e2.bytes.includes(word("stake.inmatter")), false);
  assert.equal(e2.inband.hash.sha256, e.inband.hash.sha256, "the hash covers the packet's bytes only");
});

test("R61 a joint text's body fingerprint is computed without these fields: a partner's matching fingerprint lands whatever the matter's stake", async () => {
  const x = world();
  projectStake(x, PROJECT_STAKE);
  const f = x.filingsWith({ actions: actionsWith(x, {}) });
  const A = x.action({ partners: [{ role: "Chair", organisation: "Harbour Watch" }] });
  const ap = await approve(f, prep(f, A, { text: "A joint letter." }).id);
  const r = f.jointSignatory({ filing: ap.filing, organisation: "Harbour Watch", body_sha: ap.body_sha, account: "by letter", author: V("bo"), viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  /* the fingerprint is the same with no matter stake at all */
  const y = world();
  const g2 = y.filingsWith();
  const ap2 = await approve(g2, prep(g2, y.action({ partners: [{ role: "Chair", organisation: "Harbour Watch" }] }), { text: "A joint letter." }).id);
  assert.equal(ap2.body_sha, ap.body_sha);
});

test("R62 stakeAtPreparation answers what the preparation screen's question reads: higher_stakes is true for a Tier 2 party_participation action and for an undetermined tier, with the team's stake, the matter's and the project", async () => {
  /* party participation is a Tier 2 kind of the Oakland-Alameda profile (jurisdictions R85); the test profile holds none */
  const x = world({ profiles: ["oakland-alameda"] });
  x.record.setSetting("jurisdiction_profiles", ["oakland-alameda"], V("olive"));
  x.record.setSetting("declared_stake", TEAM, V("olive"));
  projectStake(x, PROJECT_STAKE);
  const A = x.action({ kind: "party_participation", risk_tier: 2 });
  const r = x.f.stakeAtPreparation({ action: A, viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.higher_stakes, r.governing_tier, r.group_stake, r.matter_stake.stake, r.project], [true, 2, TEAM, PROJECT_STAKE, x.proj]);
  /* an undetermined tier is never read as Tier 1 */
  const U = x.action({ kind: "party_participation", risk_tier: "undetermined" });
  const u = x.f.stakeAtPreparation({ action: U, viewer: V("bo") });
  assert.deepEqual([u.higher_stakes, u.governing_tier], [true, "undetermined"]);
  /* Tier 3 too */
  const T3 = x.action({ kind: "assessment_challenge", risk_tier: 3 });
  assert.equal(x.f.stakeAtPreparation({ action: T3, viewer: V("bo") }).higher_stakes, true);
  /* through the op, a read */
  const o = x.op("stakeatpreparation", { action: A, viewer: V("bo") });
  assert.deepEqual([o.ok, o.higher_stakes], [true, true]);
});

test("R62 control: a Tier 1 action answers higher_stakes false; an absent or invisible action is NO_SUCH_ACTION as R1 answers it; it writes nothing; filingPrepare on a Tier 2 action with no matter stake lands unchanged, and no act depends on the answer", async () => {
  const x = world();
  const A = x.action();
  const r = x.f.stakeAtPreparation({ action: A, viewer: V("bo") });
  assert.deepEqual([r.higher_stakes, r.governing_tier, r.matter_stake, r.group_stake], [false, 1, null, null]);
  const gone = x.f.stakeAtPreparation({ action: "ACTN-2026-0000-none", viewer: V("bo") });
  const prepared = x.f.filingPrepare({ action: "ACTN-2026-0000-none", text: "x", preparer: V("bo"), viewer: V("bo") });
  assert.deepEqual([gone.ok, gone.reason], [false, "NO_SUCH_ACTION"]);
  assert.deepEqual([gone.ok, gone.reason], [prepared.ok, prepared.reason]);
  const stranger = x.f.stakeAtPreparation({ action: A, viewer: STRANGER });
  assert.deepEqual([stranger.ok, stranger.reason], [false, "NO_SUCH_ACTION"], "one answer for absent and invisible");
  const before = x.snapshot(["filing_drafts", "communication_drafts", "filing_approvals", "filing_sendings"]);
  x.f.stakeAtPreparation({ action: A, viewer: V("bo") });
  assert.deepEqual(x.snapshot(["filing_drafts", "communication_drafts", "filing_approvals", "filing_sendings"]), before, "writes nothing");
  /* Tier 2, no matter stake: prepare, approve and record sent land whatever the question answered or was answered */
  const T2 = x.action({ kind: "records_request", risk_tier: 2, law: "Test Stat. § 1.100" });
  assert.equal(x.f.stakeAtPreparation({ action: T2, viewer: V("bo") }).higher_stakes, true);
  assert.equal(x.f.stakeAtPreparation({ action: T2, viewer: V("bo") }).matter_stake, null);
  const d = x.f.filingPrepare({ action: T2, text: "Please send the records named under {{law}}.", fills: { records: "x" }, preparer: V("bo"), viewer: V("bo") });
  assert.equal(d.ok === true || d.reason === "FILL_UNKNOWN_BLANK", true, JSON.stringify(d).slice(0, 200));
  const d2 = x.f.filingPrepare({ action: T2, text: "Please send the records named under {{law}}.", preparer: V("bo"), viewer: V("bo") });
  assert.equal(d2.ok, true, JSON.stringify(d2).slice(0, 300));
  const ap = await approve(x.f, d2.id);
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  assert.equal(x.f.filingRecordSent({ filing: d2.id, at: "2026-09-29", account: "by hand", author: V("bo"), viewer: V("bo") }).ok, true);
  /* a machine reads it too: nothing is gated on who asks */
  assert.equal(x.f.stakeAtPreparation({ action: A, viewer: MACHINE }).ok, true);
});

test("R63 an accepted finding's source line prints that source's matter stake after its identity and team stake, when the disclosure carries one; one with matter_stake null prints exactly what it printed before", async () => {
  const x = world();
  const C = x.action(), N = x.action(), U = x.action();
  const disclosure = (extra) => ({ kind: "accepted", group: "Hayward Parents for Accountability", edition_date: "2026-09-03", accepted_at: "2026-09-20",
                                    identity: { name: "Hayward Parents", domain: "hpa.example" }, stake: "parents of pupils", ...extra });
  const f = x.filingsWith({ actions: actionsWith(x, {
    [C]: { disclosures: [disclosure({ matter_stake: { stake: "the hall's lease renews in March", set_by: "ann", set_at: "2026-09-01T00:00:00Z", source: "project" } })] },
    [N]: { disclosures: [disclosure({ matter_stake: null })] },
    [U]: { disclosures: [disclosure({ matter_stake: "undetermined" })] } }) });
  const before = `${word("prepared.rests.accepted", { group: "Hayward Parents for Accountability", date: "2026-09-03", date_accepted: "2026-09-20" })} `
    + word("filings.public_identity_declared", { name: "Hayward Parents, hpa.example", stake: "parents of pupils" });
  assert.equal(comm(f, N).text.split("\n")[0], before, "control: matter_stake null prints exactly what it printed before");
  assert.equal(before, "Rests on findings of Hayward Parents for Accountability (edition of 2026-09-03), accepted by us on 2026-09-20. "
    + "Its public identity: Hayward Parents, hpa.example. Its declared stake: parents of pupils.");
  const c = comm(f, C);
  assert.equal(c.text.split("\n")[0], `${before} ${word("stake.inmatter")}: the hall's lease renews in March.`);
  assert.ok(f.counselPacket({ reason: WHY, action: C, author: V("olive"), viewer: V("olive") }).disclosure.includes("In this matter: the hall's lease renews in March."));
  /* an unread source stake is told as unread, never dropped as none */
  assert.equal(comm(f, U).text.split("\n")[0], `${before} ${word("stake.inmatter")}: ${word("stake.unreadable")}.`);
  /* no disclosure has no matter line, and nothing is added to the held kind */
  assert.equal(matterWords(null), null);
  assert.equal(matterWords({ stake: null }), null);
});
