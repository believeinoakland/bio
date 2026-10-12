/* affordances R51 (T45; v0.2 rule 1, S1 §D 12; DEC-8): every act an action offers, at the module's interface. R14's
   `action` facts are asked of the real owners over their own fixtures (`action-holds`' world, with `actions` and
   `action-holds` real; `escalation`'s world, its conformance and actions stand-ins answering as the real modules do), and
   R18 is driven: each act offered is accepted from the caller the facts describe, well-formed, and each withheld is
   refused by its own state refusal. A machine is offered none in MACHINE_REFUSALS, and each of those its method refuses
   (R10, R20). The oracle over every combination of the facts is derive.test.mjs's; the vocabularies' identity is
   catalogue.test.mjs's (R4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveActs } from "../../../src/affordances.mjs";
import { affordancesOf } from "../../../src/affordances/facts.mjs";
import { MACHINE_REFUSALS } from "../../../src/op-grades/index.mjs";
import { world as hWorld, V, MACHINE, received } from "../action-holds/fixture.mjs";
import { seeded as escSeeded, opened as escOpened, V as EV } from "../escalation/fixture.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { actionClocksOf } from "../../../src/action-clocks/index.mjs";
import { actionRepliesOf } from "../../../src/action-replies/index.mjs";
import { planWorkOf } from "../../../src/plan-work/index.mjs";

const A = "ACTN-2026-0001-a";
const ALICE = V("alice");
/* The owners these tests do not drive answer as absent: their facts read null and offer nothing that needs them (R10). */
const SILENT = { escalationsFor: () => ({ ok: true, items: [] }), determinationRead: () => ({ ok: false }),
  templatesForAction: () => ({ ok: false }), filingsFor: () => ({ ok: false }), remindersFor: () => ({ ok: false }) };

/* An action with one sent and one received entry, over action-holds' world. */
function holdsScene() {
  const w = hWorld();
  w.action(A, ["correspondence:", "  - direction: sent", "    at: 2026-09-01", '    account: "we asked"',
    "    author: member:alice", ...received(1).slice(1)]);
  const facts = affordancesOf(w.host, { record: w.record, membership: w.membership, actions: w.a, actionHolds: w.h,
    escalation: SILENT, conformance: SILENT, filings: SILENT, actionClocks: SILENT });
  const ask = (author = ALICE) => facts.affordanceFacts({ target: A, viewer: ALICE, identity: ALICE, author, by: "alice" });
  const offered = (author) => deriveActs(ask(author)).map((a) => a.id);
  return { w, ask, offered };
}

test("R51 R14: an action's facts are asked through the reads its acts' refusals run — its ledger, its marks and its holds", () => {
  const { w, ask } = holdsScene();
  const f = ask();
  assert.equal(f.ok, true);
  assert.deepEqual(f.action.entries, { all: 2, sent: 1, received: 1, received_unmarked: 1 });
  assert.equal(f.action.holds_in_place, 0);
  assert.equal(f.action.request_for_comment, false);
  w.mark(A, 1);
  assert.equal(ask().action.entries.received_unmarked, 0, "a marked entry is counted marked");
  assert.equal(w.h.actionHold({ target: A, ord: 1, hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE }).ok, true);
  assert.equal(ask().action.holds_in_place, 1, "the hold at the entry is in place");
  /* a type that is not an action carries none */
  w.docIn("INFO-2026-0001-d", w.project("alice"));
  const doc = affordancesOf(w.host).affordanceFacts({ target: "INFO-2026-0001-d", viewer: ALICE, identity: ALICE, author: ALICE, by: "alice" });
  assert.equal(doc.action, null);
});

test("R51 R18: each act the facts offer on an action is accepted from that caller, well-formed, and each withheld is "
   + "refused by its own state refusal — pressure, hold, release, the hold notice, receipt, scope and promise", () => {
  const { w, offered } = holdsScene();
  /* before any mark or hold: pressure offered, release and the notice withheld */
  let acts = offered();
  for (const id of ["actionhold", "actionpressure", "actionreceipt", "actionscope", "actionpromise", "arosefrom"])
    assert.ok(acts.includes(id), id);
  for (const id of ["actionholdrelease", "holdnoticesent", "holdnoticeprepare", "actionreplybearing", "actionbearingpropose"])
    assert.ok(!acts.includes(id), id);
  /* the release where no hold stands is withheld though action-holds accepts it (it releases nothing): an offer that
     changes nothing is an overclaim, REC-186's reading for projectjoin (reported to BOB) */
  const notice = w.h.holdNoticeSent({ place: { target: A, ord: 1 }, at: "2026-09-05", medium: "email", account: "sent it",
    viewer: ALICE, author: ALICE });
  assert.equal(notice.reason, "HOLD_NOT_IN_PLACE", JSON.stringify(notice).slice(0, 200));
  /* each offered act, performed */
  assert.equal(w.h.actionPressure({ target: A, ord: 1, pressure: { kind: "legal", note: "a threat" }, viewer: ALICE, author: ALICE }).ok, true);
  assert.equal(w.h.actionHold({ target: A, ord: 1, hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE }).ok, true);
  const rc = w.a.actionReceipt({ target: A, ord: 0, at: "2026-09-02", how: "by email", account: "they wrote back", viewer: ALICE, author: ALICE });
  assert.equal(rc.ok, true, JSON.stringify(rc).slice(0, 300));
  const sc = w.a.actionScope({ target: A, confidential: true, reason: "the office must not learn of it", viewer: ALICE, author: ALICE });
  assert.equal(sc.ok, true, JSON.stringify(sc).slice(0, 300));
  const pr = w.a.actionPromise({ target: A, kind: "embargo", text: "held until the vote", viewer: ALICE, author: ALICE });
  assert.equal(pr.ok, true, JSON.stringify(pr).slice(0, 300));
  /* now marked and held: pressure withheld (and refused), the release and the notice offered (and accepted) */
  acts = offered();
  assert.ok(!acts.includes("actionpressure"));
  assert.equal(w.h.actionPressure({ target: A, ord: 1, pressure: { kind: "legal", note: "again" }, viewer: ALICE, author: ALICE }).ok, false);
  for (const id of ["actionholdrelease", "holdnoticesent", "holdnoticeprepare", "itemtakeup"]) assert.ok(acts.includes(id), id);
  const sent = w.h.holdNoticeSent({ place: { target: A, ord: 1 }, at: "2026-09-05", medium: "email", account: "sent it",
    viewer: ALICE, author: ALICE });
  assert.equal(sent.ok, true, JSON.stringify(sent).slice(0, 300));
  assert.equal(w.h.actionHoldRelease({ target: A, ord: 1, reason: "the matter closed", viewer: ALICE, author: ALICE }).ok, true);
  assert.ok(!offered().includes("actionholdrelease"), "released: no hold stands to release");
});

test("R51 R10 R20: a machine is offered none of the acts in MACHINE_REFUSALS, and each such act its method refuses "
   + "with the code MACHINE_REFUSALS names; a member is offered them", () => {
  const { w, offered } = holdsScene();
  assert.equal(w.h.actionHold({ target: A, ord: 1, hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE }).ok, true);
  const member = offered(), machine = offered(MACHINE);
  assert.deepEqual(machine.filter((id) => Object.hasOwn(MACHINE_REFUSALS, id)), []);
  const drive = {
    actionhold: () => w.h.actionHold({ target: A, hold: "in_place", reason: "r", viewer: ALICE, author: MACHINE }),
    actionholdrelease: () => w.h.actionHoldRelease({ target: A, ord: 1, reason: "r", viewer: ALICE, author: MACHINE }),
    actionpressure: () => w.h.actionPressure({ target: A, ord: 1, pressure: { kind: "legal", note: "n" }, viewer: ALICE, author: MACHINE }),
    holdnoticesent: () => w.h.holdNoticeSent({ place: { target: A, ord: 1 }, at: "2026-09-05", account: "a", viewer: ALICE, author: MACHINE }),
    actionreceipt: () => w.a.actionReceipt({ target: A, ord: 0, at: "2026-09-02", how: "h", account: "a", viewer: ALICE, author: MACHINE }),
    actionscope: () => w.a.actionScope({ target: A, confidential: true, reason: "r", viewer: ALICE, author: MACHINE }),
    actionpromise: () => w.a.actionPromise({ target: A, kind: "embargo", text: "t", viewer: ALICE, author: MACHINE }),
    /* the owners the plane composes at T45-47, each on the same host */
    clockstate: () => actionClocksOf(w.host, { record: w.record, membership: w.membership })
      .clockState({ target: A, text: "t", date: "2026-10-01", basis_kind: "window", viewer: ALICE, author: MACHINE }),
    actionreplybearing: () => actionRepliesOf(w.host, { record: w.record, membership: w.membership, actions: w.a })
      .actionReplyBearing({ target: A, ord: 1, claims: [], viewer: ALICE, author: MACHINE }),
    arosefrom: () => actionRepliesOf(w.host).aroseFromLink({ target: A, ord: 1, arising: { project: "PROJ-2026-0001-x" },
      viewer: ALICE, author: MACHINE }),
    itemtakeup: () => planWorkOf(w.host, { record: w.record, membership: w.membership, actions: w.a, actionHolds: w.h })
      .itemTakeUp({ item: { kind: "hold", target: A, ord: 1 }, viewer: ALICE, author: MACHINE }),
  };
  for (const [id, act] of Object.entries(drive)) {
    if (!["clockstate", "actionreplybearing", "arosefrom", "itemtakeup"].includes(id))
      assert.ok(member.includes(id), `a member is offered ${id}`);
    if (!Object.hasOwn(MACHINE_REFUSALS, id)) continue;
    assert.ok(!machine.includes(id), `a machine is not offered ${id}`);
    assert.equal(act().reason, MACHINE_REFUSALS[id], id);
  }
});

/* The escalation acts (escalation R1, R9): over escalation's world, the action's facts asked of the real escalation and
   actions, conformance's stand-in answering a determination as `determinationRead` does. */
function escScene() {
  const w = escSeeded();
  /* actions' `actionRead`, as the escalation fixture's own stand-in answers it from the action's document */
  const actions = { actionRead: ({ id, viewer }) => {
    const h = w.record.head(id);
    if (!h || !w.membership.inSight(id, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE" };
    const fm = parseFrontmatter(w.record.readFile(id, "bundle.md").text).data || {};
    return { ok: true, id, current_state: fm.current_state ?? null, kind: fm.action_kind ?? null, breach: fm.breach === true,
      legs: (fm.action_basis ?? []).map((l) => ({ target: l.target, kind: l.kind })), correspondence: [], clock: [] };
  } };
  const conformance = { determinationRead: ({ id }) => {
    const d = w.determinations.get(id);
    return d ? { ok: true, id, project: d.project, live: !d.superseded_by, void: null, outcomes: d.outcomes } : { ok: false };
  } };
  const facts = affordancesOf(w.host, { record: w.record, membership: w.membership, actions, escalation: w.esc, conformance,
    connections: { citesInto: () => ({ confirmed: [], severed: [] }) },
    actionHolds: { pressureFor: () => ({ ok: true, items: [] }), holdsOf: () => ({ ok: true, hold: null }) },
    filings: SILENT, actionClocks: SILENT });
  const offered = (id, who = "bob") => deriveActs(facts.affordanceFacts({ target: id, viewer: EV(who), identity: EV(who),
    author: EV(who), by: who })).map((a) => a.id);
  return { w, offered };
}

test("R51 R18: on a breach action resting on a noncompliant determination, escalationopen is offered while none is open "
   + "and accepted; once open, it is withheld (refused ALREADY_OPEN) and the attachment is offered at a stage that takes "
   + "one; control: an action resting on no determination is offered neither", () => {
  const { w, offered } = escScene();
  const act = w.action({ project: w.P, restsOn: [w.D] });
  const bare = w.action({ project: w.P, restsOn: [] });
  assert.ok(offered(act).includes("escalationopen"), "no escalation open: offered");
  assert.ok(!offered(act).includes("escalationattach"));
  for (const id of ["escalationopen", "escalationattach"]) assert.ok(!offered(bare).includes(id), `control: ${id}`);
  escOpened(w);
  assert.ok(!offered(act).includes("escalationopen"), "open: withheld");
  assert.equal(w.esc.escalationOpen({ reason: "again", determination: w.D, author: EV("bob"), viewer: EV("bob") }).reason, "ALREADY_OPEN");
  /* stage 1 takes no action: withheld, and refused */
  assert.ok(!offered(act).includes("escalationattach"));
  assert.equal(w.esc.escalationAttach({ id: w.E, action: act, reason: "r", author: EV("bob"), viewer: EV("bob") }).reason, "STAGE_TAKES_NO_ACTION");
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 2, reason: "the notice is due", author: EV("bob"), viewer: EV("bob") }).ok, true);
  assert.ok(offered(act).includes("escalationattach"), "stage 2: offered");
  assert.ok(!offered(bare).includes("escalationattach"), "control: an action resting on no determination");
  const at = w.esc.escalationAttach({ id: w.E, action: act, reason: "it serves the notice", author: EV("bob"), viewer: EV("bob") });
  assert.equal(at.ok, true, JSON.stringify(at).slice(0, 300));
  assert.ok(!offered(act).includes("escalationattach"), "attached: withheld");
  /* a member who has not joined the determination's project is not offered the opening the act refuses her */
  assert.ok(!offered(bare, "carol").includes("escalationopen"));
});
