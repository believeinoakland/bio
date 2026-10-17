/* action-records' T50 requirements at its interface: the action's own stake (R17), the one answer to an action no one
   may see (R18) and a question opened with an action as its reference (R19). Over the fixture's real record, membership
   and promotion; no `actions`, a later module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, M, MACHINE, A, B, HIDDEN, INFO, ledger, progressionsStandIn } from "./fixture.mjs";
import * as records from "../../../src/action-records/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";
import * as roster from "../../../src/project-roster/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const ABSENT = "ACTN-2026-0404-none";
const E1 = "ENT-2026-0001-council";

/* a world with alice enrolled, a hidden action, an information bundle, and one action */
function seen() {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  w.member("alice");
  w.action(A, ledger("sent"));
  w.doc(INFO);
  w.hidden();
  return w;
}

test("R17 actionStake: refusals in order (MACHINE_CANNOT_SET_STAKE, NO_TARGET, STAKE_MALFORMED, NO_SUCH_ACTION), nothing written; both stake codes are project-roster's, asked through stakeFault", () => {
  const w = seen();
  const S = (x) => w.r.actionStake({ target: A, stake: "We are the neighbours of the school", viewer: M, author: M, ...x });
  assert.deepEqual(S({ author: MACHINE, target: "", stake: 7 }).reason, "MACHINE_CANNOT_SET_STAKE", "the machine fence comes first");
  assert.deepEqual([S({ author: MACHINE }), S({ author: "" }), S({ author: null }), S({ author: "token:abc" })].map((r) => r.reason),
    ["MACHINE_CANNOT_SET_STAKE", "MACHINE_CANNOT_SET_STAKE", "MACHINE_CANNOT_SET_STAKE", "MACHINE_CANNOT_SET_STAKE"]);
  assert.deepEqual([S({ target: "", stake: "x".repeat(1001) }).reason, S({ target: null }).reason], ["NO_TARGET", "NO_TARGET"]);
  const tooLong = S({ stake: "x".repeat(1001) });
  assert.deepEqual([tooLong.reason, tooLong.code, tooLong.target], ["STAKE_MALFORMED", "STAKE_MALFORMED", A]);
  assert.equal("project" in tooLong, false, "the action's answer carries no project");
  assert.deepEqual([S({ stake: "one\ntwo" }).reason, S({ stake: "a\u0007b" }).reason, S({ stake: "" }).reason, S({ stake: "   " }).reason,
    S({ stake: 5 }).reason, S({ stake: undefined }).reason, S({ stake: { text: "x" } }).reason],
    Array(7).fill("STAKE_MALFORMED"));
  assert.deepEqual([S({ target: ABSENT }).reason, S({ target: HIDDEN }).reason, S({ target: INFO }).reason],
    ["NO_SUCH_ACTION", "NO_SUCH_ACTION", "NO_SUCH_ACTION"]);
  /* each is project-roster's own answer: the same code, check and translation as its stakeFault gives */
  const machine = S({ author: MACHINE });
  const fault = roster.stakeFault({ by: "", stake: "s", of: "action" });
  assert.deepEqual([machine.check, machine.translation], [fault.check, fault.translation]);
  assert.equal(tooLong.translation, word("refusal.STAKE_MALFORMED.action"), "STAKE_MALFORMED read for an action by its own key");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_stakes`).n, 0, "no refusal writes");
  assert.equal(w.r.stakeOf(A).stake, null);
});

test("R17 a member's statement is appended and read back with set_by and set_at; null clears it and keeps the history; stakeOf answers null with none and undetermined when unreadable", () => {
  const w = seen();
  assert.deepEqual(w.r.stakeOf(A), { stake: null, set_by: null, set_at: null, history: [] }, "none stated");
  assert.deepEqual(w.r.stakeOf("ACTN-2026-0009-none"), { stake: null, set_by: null, set_at: null, history: [] });
  const text = w.text(A);
  const one = w.r.actionStake({ target: A, stake: "  We live next to the school  ", viewer: M, author: M });
  assert.deepEqual([one.ok, one.stake, one.set_by, one.set_at, one.weight],
    [true, "We live next to the school", "h_alice", "2026-09-28T12:00:00Z", "single"], "trimmed; set_by her handle");
  w.clock.ms += 60000;
  const two = w.r.actionStake({ target: A, stake: "x".repeat(1000), viewer: M, author: M });
  assert.equal(two.ok, true, "1,000 characters lands");
  w.clock.ms += 60000;
  const cleared = w.r.actionStake({ target: A, stake: null, viewer: M, author: M });
  assert.deepEqual([cleared.ok, cleared.stake, cleared.set_by, cleared.set_at], [true, null, "h_alice", "2026-09-28T12:02:00Z"]);
  assert.deepEqual(w.r.stakeOf(A).history.map((h) => [h.stake === null ? null : h.stake.length, h.set_by, h.set_at]),
    [[26, "h_alice", "2026-09-28T12:00:00Z"], [1000, "h_alice", "2026-09-28T12:01:00Z"], [null, "h_alice", "2026-09-28T12:02:00Z"]],
    "history oldest first, the clearing kept");
  assert.deepEqual(w.r.stakeOf(A).stake, null);
  assert.equal(w.text(A), text, "the action's document is never written");
  /* another action's stake is its own */
  assert.equal(w.r.stakeOf(B).stake, null);
  /* a member with no handle row is named by her id; the founder by membership.founderHandle(), null while none */
  assert.equal(w.r.actionStake({ target: A, stake: "ghost", viewer: V("ghost"), author: V("ghost") }).set_by, "ghost");
  const f1 = w.r.actionStake({ target: A, stake: "founder", viewer: "admin", author: "admin" });
  assert.deepEqual([f1.ok, f1.set_by], [true, null], "the founder, holding no handle yet, is named by none, never by her id");
  assert.equal(w.membership.founderHandleSet({ handle: "founder-f", by: "admin" }).ok, true);
  const f2 = w.r.actionStake({ target: A, stake: "founder again", viewer: "admin", author: V("admin") });
  assert.deepEqual([f2.ok, f2.set_by], [true, "founder-f"], "the founder as membership.founderHandle() names her");
  assert.deepEqual(w.r.stakeOf(A).history.slice(-2).map((h) => h.set_by), ["founder-f", "founder-f"], "a handle is read now, as project-roster reads it: her earlier statement is named too");
  /* unreadable: a row whose stake is not text */
  w.st.db.exec(`INSERT INTO action_stakes (bundle_id, seq, stake, by, at) VALUES ('${B}', 1, X'00', 'alice', 't')`);
  assert.deepEqual([w.r.stakeOf(B).stake, w.r.stakeOf(B).history], ["undetermined", []], "undetermined, never null");
  /* the op: `null` in the query clears; a missing stake is malformed; the stamps are the query's only */
  const ops = (qs, body = null) => records.actionRecordsOps(w.r, new URL(`https://x/?${qs}`), body);
  assert.equal(ops(`target=${A}&viewer=${M}&author=${M}&stake=null`).actionstake().stake, null);
  assert.equal(ops(`target=${A}&viewer=${M}&author=${M}`).actionstake().reason, "STAKE_MALFORMED");
  assert.equal(ops(`viewer=${M}&author=${M}`, { target: A, stake: "from the body" }).actionstake().stake, "from the body");
  assert.equal(ops(`viewer=${M}&author=${M}`, { target: A, stake: null }).actionstake().stake, null);
  assert.equal(ops(`target=${A}&viewer=${M}`, { stake: "s", author: M }).actionstake().reason, "MACHINE_CANNOT_SET_STAKE",
    "a body's author never stamps");
});

test("R17 control: a machine credential is refused and nothing is written; 1,001 characters and a line break are STAKE_MALFORMED; an invisible action is NO_SUCH_ACTION; a visible one lands", () => {
  const w = seen();
  assert.equal(w.r.actionStake({ target: A, stake: "s", viewer: MACHINE, author: MACHINE }).reason, "MACHINE_CANNOT_SET_STAKE");
  assert.equal(w.r.actionStake({ target: A, stake: "x".repeat(1001), viewer: M, author: M }).reason, "STAKE_MALFORMED");
  assert.equal(w.r.actionStake({ target: A, stake: "a\r\nb", viewer: M, author: M }).reason, "STAKE_MALFORMED");
  assert.equal(w.r.actionStake({ target: HIDDEN, stake: "s", viewer: M, author: M }).reason, "NO_SUCH_ACTION");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_stakes`).n, 0);
  assert.equal(w.r.actionStake({ target: HIDDEN, stake: "s", viewer: MACHINE, author: M }).ok, true, "a viewer who sees it");
  assert.equal(w.r.actionStake({ target: A, stake: "x".repeat(1000), viewer: M, author: M }).ok, true);
  /* R12: actionStake is among what a machine never does */
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_stakes WHERE by LIKE 'class:%' OR by LIKE 'token:%'`).n, 0);
});

test("R18 the seven acts of R1 to R6 and R17 answer an unknown id, an invisible action and a bundle that is no action the same bytes with the action sentence, NO_SUCH_ACTION (C-117.2), never NO_SUCH_BUNDLE or NOT_AN_ACTION", () => {
  const w = seen();
  const asks = (target, viewer = M, who = M) => [
    ["R1", w.r.actionLawsPropose({ target, laws: [{ level: "state", citation: "X" }], proposer: who, viewer })],
    ["R2", w.r.actionRiskPropose({ target, tier: 2, basis: "b", proposer: who, viewer })],
    ["R3", w.r.actionSeeksPropose({ target, seeks: [{ progression: "meeting", entity: E1, stage: "notice" }], proposer: who, viewer })],
    ["R4", w.r.actionReceipt({ target, ord: 0, at: "2026-09-03", how: "h", account: "a", viewer, author: who })],
    ["R5", w.r.actionScope({ target, confidential: true, reason: "r", viewer, author: who })],
    ["R6", w.r.actionPromise({ target, kind: "other", text: "t", viewer, author: who })],
    ["R17", w.r.actionStake({ target, stake: "s", viewer, author: who })]];
  const normal = (r) => ({ ...r, action: null });
  const absent = asks(ABSENT), hidden = asks(HIDDEN), notAction = asks(INFO);
  assert.equal(absent.length, 7);
  absent.forEach(([name, r], i) => {
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "NO_SUCH_ACTION", "NO_SUCH_ACTION", "C-117.2"], name);
    assert.equal(r.action, ABSENT, name);
    assert.equal(r.translation, grammar.ACTION_CATALOGUE_CHECKS.NO_SUCH_ACTION.translation, name);
    assert.equal(r.detail, records.noSuchAction(ABSENT).detail, name);
    assert.deepEqual(normal(hidden[i][1]), normal(r), `${name}: invisible as absent, byte for byte`);
    assert.deepEqual(normal(notAction[i][1]), normal(r), `${name}: a bundle that is no action as absent`);
    assert.equal(JSON.stringify(hidden[i][1]).replace(HIDDEN, ABSENT), JSON.stringify(r), `${name}: the same bytes`);
  });
  for (const rows of [hidden, notAction, absent])
    for (const [name, r] of rows) assert.equal(["NO_SUCH_BUNDLE", "NOT_AN_ACTION"].includes(r.reason), false, name);
  assert.equal(w.row(`SELECT (SELECT COUNT(*) FROM action_stakes) + (SELECT COUNT(*) FROM action_scopes) + (SELECT COUNT(*) FROM action_promises)
    + (SELECT COUNT(*) FROM action_receipts) + (SELECT COUNT(*) FROM action_law_proposals) + (SELECT COUNT(*) FROM action_risk_proposals)
    + (SELECT COUNT(*) FROM action_seeks_proposals) AS n`).n, 0, "nothing written");
  /* control: an action the caller may see lands as before, each act */
  const ok = asks(A);
  for (const [name, r] of ok) assert.equal(r.ok, true, `${name}: ${r.reason}`);
});

test("R18 noSuchAction(actionId, extra?) is this module's: R43's body and behaviour unchanged, the C-117.2 row, the action sentence fixed; extra adds a caller's own fields and never replaces one; never throws", () => {
  const row = grammar.ACTION_CATALOGUE_CHECKS.NO_SUCH_ACTION;
  const r = records.noSuchAction("ACTN-2026-0001-a");
  assert.deepEqual(r, { ok: false, reason: "NO_SUCH_ACTION", code: "NO_SUCH_ACTION", check: row.check, translation: row.translation,
    action: "ACTN-2026-0001-a", detail: "no action answers to that id here. An action you may not see is answered exactly as one that does not exist, so this is not a hint either way." });
  assert.equal(row.check, "C-117.2");
  assert.equal(records.noSuchAction().action, null);
  assert.equal(records.noSuchAction(null).action, null);
  assert.equal(records.noSuchAction(42).action, "42");
  /* extra: the caller's own fields beside, never replacing ok, reason, code, check, translation, action or detail */
  const x = records.noSuchAction("ACTN-1", { stage: "reply", ok: true, reason: "X", code: "X", check: "X", translation: "X", action: "X", detail: "X" });
  assert.deepEqual([x.stage, x.ok, x.reason, x.code, x.check, x.translation, x.action, x.detail],
    ["reply", false, "NO_SUCH_ACTION", "NO_SUCH_ACTION", row.check, row.translation, "ACTN-1", r.detail]);
  for (const bad of [[], "x", 5, null, { get stage() { throw new Error("boom"); } }])
    assert.equal(records.noSuchAction("ACTN-2", bad).reason, "NO_SUCH_ACTION", String(bad));
  assert.equal(records.noSuchAction({ toString() { throw new Error("no"); } }).action, null, "an id that cannot be stringified is null");
});

/* R19: a project the caller is joined to, and an action in it */
function inProject() {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  w.member("alice"); w.member("bob"); w.member("carol");
  const project = w.project("Water testing", "alice");
  w.join(project, "alice", "bob");
  const action = "ACTN-2026-0010-in";
  w.action(action, ledger("sent"), { project });
  w.action(A, ledger("sent"));          /* an action in no project */
  return { w, project, action };
}

test("R19 actionInquiry opens a question in the action's project with the action as its reference (derived_from, noting who opened it), no leg onto the action; the action is unchanged", () => {
  const { w, project, action } = inProject();
  const before = { text: w.text(action), head: w.record.head(action), manifest: JSON.stringify(w.rows(`SELECT * FROM manifest WHERE bundle_id=?`, action)) };
  const r = w.r.actionInquiry({ action, question: "  Why was the water tested only twice?  ", viewer: V("bob"), author: V("bob") });
  assert.deepEqual([r.ok, r.action, r.project], [true, action, project]);
  assert.match(r.inquiry, /^INQ-2026-\d{4}-question$/);
  const fm = w.fm(r.inquiry);
  assert.deepEqual([fm.object_type, fm.current_state, fm.project], ["inquiry", "open", project]);
  assert.deepEqual(fm.references.map((x) => [x.rel, x.target, x.status]), [["derived_from", action, "confirmed"]]);
  assert.match(fm.references[0].note, /member:bob/, "noting who opened it");
  assert.equal(fm.basis === undefined || fm.basis.length === 0, true, "no leg onto the action");
  assert.equal(w.text(r.inquiry).includes("Why was the water tested only twice?"), true, "the question is the member's words");
  assert.equal(w.text(r.inquiry).includes("## Question\n\nWhy was the water tested only twice?\n"), true, "trimmed");
  assert.equal(String(fm.title).includes("water tested"), true, "titled from the question");
  assert.equal(w.row(`SELECT project FROM bundles WHERE bundle_id=?`, r.inquiry).project, project, "in the action's project");
  /* the action is byte-identical */
  assert.equal(w.text(action), before.text);
  assert.deepEqual(w.record.head(action), before.head);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM manifest WHERE bundle_id=?`, action)), before.manifest);
  /* nothing is filled from the action: the question holds none of its fields */
  assert.equal(w.text(r.inquiry).includes("Town of Port Ellery"), false);
  /* the op: the action and question from the query, else the body; the stamps from the query */
  const op = records.actionRecordsOps(w.r, new URL(`https://x/?viewer=${V("bob")}&author=${V("bob")}`), { action, question: "Second question?" }).actioninquiry();
  assert.deepEqual([op.ok, op.action, op.project], [true, action, project]);
  assert.notEqual(op.inquiry, r.inquiry);
  const spoof = records.actionRecordsOps(w.r, new URL(`https://x/?viewer=${V("bob")}`), { action, question: "q", author: V("bob") }).actioninquiry();
  assert.equal(spoof.reason, "MACHINE_CANNOT_OPEN_FROM_ACTION", "a body's author never stamps");
});

test("R19 actionInquiry: refusals in order (MACHINE_CANNOT_OPEN_FROM_ACTION, NO_TARGET, ACTION_INQUIRY_NO_QUESTION, NO_SUCH_ACTION, ACTION_NO_PROJECT, then promotion's), each writing nothing, each worded by key", () => {
  const { w, project, action } = inProject();
  const Q = (x) => w.r.actionInquiry({ action, question: "A question?", viewer: V("bob"), author: V("bob"), ...x });
  const count = () => w.row(`SELECT COUNT(*) AS n FROM bundles`).n;
  const bundles = count();
  const refused = [Q({ author: MACHINE, action: "", question: "" }), Q({ author: "" }), Q({ author: "token:abc" }), Q({ author: null }),
    Q({ action: "", question: "" }), Q({ action: null }),
    Q({ question: "" }), Q({ question: "   " }), Q({ question: undefined }), Q({ question: null }), Q({ question: 7 }),
    Q({ question: "x".repeat(501) }), Q({ question: "one\ntwo" }), Q({ question: "one\rtwo" }), Q({ question: "a b" }),
    Q({ action: ABSENT }), Q({ action: HIDDEN }), Q({ action: INFO }), Q({ action: A })];
  assert.deepEqual(refused.map((r) => r.reason), [
    "MACHINE_CANNOT_OPEN_FROM_ACTION", "MACHINE_CANNOT_OPEN_FROM_ACTION", "MACHINE_CANNOT_OPEN_FROM_ACTION", "MACHINE_CANNOT_OPEN_FROM_ACTION",
    "NO_TARGET", "NO_TARGET", ...Array(9).fill("ACTION_INQUIRY_NO_QUESTION"),
    "NO_SUCH_ACTION", "NO_SUCH_ACTION", "NO_SUCH_ACTION", "ACTION_NO_PROJECT"]);
  for (const r of refused.filter((x) => x.code)) {
    if (r.reason === "NO_SUCH_ACTION") continue;
    assert.equal(r.translation, word(`refusal.${r.reason}`), `${r.reason}: its words by key`);
  }
  assert.equal(count(), bundles, "no refusal writes a bundle");
  assert.equal(Q({ question: "x".repeat(500) }).ok, true, "control: 500 characters lands");
  /* the allocated id of a refused call is not spent: the next question takes the next number */
  const a = Q({}), b = Q({});
  assert.equal(Number(b.inquiry.split("-")[2]) - Number(a.inquiry.split("-")[2]), 1);
  /* a member who cannot see the project is told the action does not exist; one who sees it as invited and has not joined
     is refused by membership's own position check, and nothing is written */
  w.st.db.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                VALUES ('dave', 'c', 'h_dave', 'member', 'active', '["contribute"]', 't', 't')`);
  assert.equal(Q({ viewer: V("dave"), author: V("dave") }).reason, "NO_SUCH_ACTION", "unseen: as absent");
  w.membership.projectInvite({ projectId: project, handle: "h_dave", by: "alice", viewer: V("alice") });
  const out = Q({ viewer: V("dave"), author: V("dave") });
  assert.deepEqual([out.ok, out.reason, out.check, out.project], [false, "PROJECT_ACT_NOT_A_PARTICIPANT", "C-56.1", project]);
  assert.equal(count(), bundles + 3, "nothing more written");
  w.membership.projectJoin({ projectId: project, by: "dave", viewer: V("dave") });
  assert.equal(Q({ viewer: V("dave"), author: V("dave") }).ok, true, "control: once joined, he opens one");
  /* the hidden action seen by a machine viewer is no escape: the machine author is refused first */
  assert.equal(w.r.actionInquiry({ action, question: "q", viewer: MACHINE, author: MACHINE }).reason, "MACHINE_CANNOT_OPEN_FROM_ACTION");
  void project;
});
