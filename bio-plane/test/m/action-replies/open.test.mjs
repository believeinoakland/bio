/* action-replies' open requests at signing at its interface (R3, R4, R8), through `case-inputs` R8's real seam (T47; N908:
   split from `case-authoring`, whose R70 it was). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, M, BOB, INQ, INQ2, INQ3, INFO, RFC, RFC2, REQ, PROJ2, leg, WINDOW } from "./fixture.mjs";
import { ActionReplies, actionRepliesOf } from "../../../src/action-replies/index.mjs";
import { caseInputsOf } from "../../../src/case-inputs/index.mjs";
import { actionsForRefusal } from "../actions/fixtures.mjs";

const RFC3 = "ACTN-2026-0004-rfc", RFC4 = "ACTN-2026-0005-rfc", RFC5 = "ACTN-2026-0006-rfc", RFC6 = "ACTN-2026-0007-rfc";
const members = (...ids) => ids.map((bundle_id) => ({ bundle_id, version_sha: "a".repeat(64) }));
const WHOM = "Town Clerk, Town of Port Ellery";

test("R3 at start the source is registered once with case-inputs R8, in its names, on the instance case-authoring creates; a second registration is refused there", () => {
  const w = world({ signing: true });
  assert.equal(w.ci, caseInputsOf(w.host), "the host's one case-inputs, the one case-authoring created");
  assert.deepEqual(w.ci.openRequestsSource(), { registered: true, module: "action-replies" });
  assert.equal(actionRepliesOf(w.host), w.r, "one instance per host: nothing registered twice");
  const again = w.ci.registerOpenRequests("action-replies", { openRequestsOn: () => [] });
  assert.equal(again.reason, "PROVIDER_DECLARED");
  assert.deepEqual(w.ci.openRequestsSource(), { registered: true, module: "action-replies" });
  /* started as the composition root starts it (its environment, no case-inputs given): the host's own case-inputs */
  const root = world({ root: true });
  assert.deepEqual(caseInputsOf(root.host).openRequestsSource(), { registered: true, module: "action-replies" });
  /* with no case-inputs given and no environment, nothing is registered */
  const bare = world();
  assert.equal(bare.ci, null);
  assert.deepEqual(caseInputsOf(bare.host).openRequestsSource(), { registered: false, module: null });
});

test("R3 control: each open request for comment on the case's members is answered once as case-inputs R8's row; a resolved or abandoned one is not; nor one never sent, one on no member, or another kind; it writes nothing", () => {
  const w = world({ signing: true });
  /* RFC: open, sent, a reply laid out claim by claim */
  w.rfc(RFC, { legs: [leg(INQ, "advances"), leg(INQ2, "advances")] });
  w.say(RFC, "sent", "2026-09-10");
  const got = w.say(RFC, "received", "2026-09-20");
  assert.equal(w.r.actionReplyBearing({ target: RFC, ord: got, author: M, viewer: M,
    claims: [{ claim: INQ, bearing: "new_evidence" }, { claim: INQ2, bearing: "not_addressed" }] }).ok, true);
  /* RFC2: open, sent, no reply; its window waived first, then a later dated entry */
  w.rfc(RFC2, { legs: [leg(INQ2, "advances"), leg(INFO, "rests_on")],
                clock: [...WINDOW("2026-10-01", "waived"), ...WINDOW("2026-10-20").slice(1)] });
  w.say(RFC2, "sent", "2026-09-12");
  /* RFC3: resolved; RFC4: abandoned; RFC5: never sent; RFC6: on no member of the case; REQ: another kind */
  for (const id of [RFC3, RFC4, RFC5]) w.rfc(id);
  for (const id of [RFC3, RFC4]) w.say(id, "sent");
  w.a.actionMove({ target: RFC3, to: "active", reason: "go", viewer: M, author: M });
  w.a.actionMove({ target: RFC3, to: "resolved", resolution: "completed", reason: "done", viewer: M, author: M });
  w.a.actionMove({ target: RFC4, to: "abandoned", reason: "dropped", viewer: M, author: M });
  w.rfc(RFC6, { legs: [leg(INQ3, "advances")] });
  w.say(RFC6, "sent");
  w.action(REQ, ["action_basis:", ...leg(INQ, "advances")]);
  w.say(REQ, "sent");
  const before = w.counts();
  const rows = w.r.openRequestsOn({ case: "case-1", members: members(INQ, INQ2), viewer: M });
  assert.deepEqual(rows, [
    { whom: WHOM, asked_at: "2026-09-10", window_closes: "2026-10-15", answers: { answered: 1, claims: 2 }, replied: true, quotable: true },
    { whom: WHOM, asked_at: "2026-09-12", window_closes: "2026-10-20", answers: null, replied: false, quotable: true },
  ]);
  /* through the seam, as case-authoring R34's sign step reads it */
  assert.deepEqual(w.ci.openRequestsOn({ case: "case-1", members: members(INQ, INQ2), viewer: M }), { ok: true, rows });
  assert.deepEqual(w.counts(), before, "writes nothing");
  /* the members alone decide which requests are on the case: a finding the request rests on counts too */
  assert.deepEqual(w.r.openRequestsOn({ members: members(INFO), viewer: M }).map((r) => r.asked_at), ["2026-09-12"]);
  assert.deepEqual(w.r.openRequestsOn({ members: [], viewer: M }), []);
});

test("R3 answers: null with a reply but no layout; the latest layout's claims, answered those not `not_addressed`; null window when the action states none dated", () => {
  const w = world();
  w.rfc(RFC);
  w.say(RFC, "sent", "2026-09-10");
  const got = w.say(RFC, "received", "2026-09-20");
  const on = () => w.r.openRequestsOn({ members: members(INQ), viewer: M })[0];
  assert.equal(on().answers, null, "a reply recorded with no layout");
  w.r.actionReplyBearing({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "not_addressed" }], author: M, viewer: M });
  assert.deepEqual(on().answers, { answered: 0, claims: 1 });
  w.r.actionReplyBearing({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "disputed_without_evidence" }], author: M, viewer: M });
  assert.deepEqual(on().answers, { answered: 1, claims: 1 }, "the latest layout");
  /* a proposal is not a layout */
  w.r.actionBearingPropose({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "not_addressed" }], proposer: "class:ai", viewer: "class:ai" });
  assert.deepEqual(on().answers, { answered: 1, claims: 1 });
  /* a window stated only as waived reads null */
  const x = world();
  x.rfc(RFC, { clock: WINDOW("2026-10-15", "waived") });
  x.say(RFC, "sent", "2026-09-10");
  assert.equal(x.r.openRequestsOn({ members: members(INQ), viewer: M })[0].window_closes, null);
});

test("R3 R4 a request the viewer may not see is not answered; when the requests cannot be read it throws, and case-inputs answers undetermined, never []", () => {
  const w = world({ signing: true });
  w.rfc(RFC);
  w.say(RFC, "sent", "2026-09-10");
  w.bundle(PROJ2, "project");
  w.participant(PROJ2, "alice");
  w.st.db.prepare(`UPDATE bundles SET project=? WHERE bundle_id=?`).run(PROJ2, RFC);
  assert.equal(w.r.openRequestsOn({ members: members(INQ), viewer: M }).length, 1);
  assert.deepEqual(w.r.openRequestsOn({ members: members(INQ), viewer: BOB }), [], "withheld as absent");
  /* an actions module that cannot read */
  const refused = actionsForRefusal().unknownRead;
  /* a read refusing with a code other than NO_SUCH_ACTION, which this module skips by design (R4); actions gives no other for actionRead */
  const broken = { ok: false, reason: "BROKEN" }; // fixtures-generic: BROKEN
  for (const actions of [{ actionsFor: () => refused }, { actionsFor: () => { throw new Error("down"); } },
                         { actionsFor: () => ({ ok: true, items: [{ id: RFC, state: "active" }] }), actionRead: () => broken }]) {
    const r = new ActionReplies({ storage: w.st, record: w.record, membership: w.membership, actions });
    assert.throws(() => r.openRequestsOn({ members: members(INQ), viewer: M }), /could not be read|down/);
  }
});

test("R3 through the seam, this source when it cannot read is undetermined, never []", () => {
  const w = world();
  const broken = new ActionReplies({ storage: w.st, record: w.record, membership: w.membership,
                                     actions: { actionsFor: () => actionsForRefusal().unknownRead } });
  const ci = caseInputsOf(w.host);
  assert.equal(ci.registerOpenRequests("action-replies", { openRequestsOn: (a) => broken.openRequestsOn(a) }).ok, true);
  const r = ci.openRequestsOn({ case: "c", members: members(INQ), viewer: M });
  assert.deepEqual([r.ok, r.undetermined], [false, true]);
});

test("R8 control: a request with a reply recorded and no claims laid out answers answers: null, replied: true; one with none, replied: false; case-inputs R8 takes every row as well formed", () => {
  const w = world({ signing: true });
  w.rfc(RFC);
  w.say(RFC, "sent", "2026-09-10");
  w.rfc(RFC2);
  w.say(RFC2, "sent", "2026-09-12");
  const on = () => w.r.openRequestsOn({ members: members(INQ), viewer: M });
  /* neither replied: each row answers replied: false */
  assert.deepEqual(on().map((r) => [r.asked_at, r.answers, r.replied]), [["2026-09-10", null, false], ["2026-09-12", null, false]]);
  /* a reply recorded on RFC, no layout: answers null, replied true; RFC2 unchanged */
  const got = w.say(RFC, "received", "2026-09-20");
  assert.deepEqual(on().map((r) => [r.asked_at, r.answers, r.replied]), [["2026-09-10", null, true], ["2026-09-12", null, false]]);
  /* laid out: answers set, still replied */
  assert.equal(w.r.actionReplyBearing({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "new_evidence" }], author: M, viewer: M }).ok, true);
  assert.deepEqual(on()[0], { whom: WHOM, asked_at: "2026-09-10", window_closes: "2026-10-15", answers: { answered: 1, claims: 1 }, replied: true, quotable: true });
  /* a sent entry or a non-response is not a reply */
  w.a.actionCorrespond({ target: RFC2, direction: "no_response", at: "2026-09-25", account: "nothing came", viewer: M, author: M });
  assert.equal(on()[1].replied, false);
  /* every row is a boolean, and case-inputs R8 takes each row as well formed */
  assert.ok(on().every((r) => typeof r.replied === "boolean"));
  const seam = w.ci.openRequestsOn({ case: "c", members: members(INQ), viewer: M });
  assert.deepEqual(seam, { ok: true, rows: on() });
});
