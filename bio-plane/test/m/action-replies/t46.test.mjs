/* action-replies' T46 requirements at its interface (T46-35): a proposal labelled through `record-grammar`'s `bearing`
   subject (R5); `aroseFromLink`'s refusals in order and its project judged by the author's sight, `arisenFrom`'s three
   refusals (R6); six rows read their words from `words.json` by key, C-150.7 keeping its own (R7). R8 is in
   `open.test.mjs`, beside R3. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, M, BOB, MACHINE, INQ, INQ3, INFO, RFC, REQ, PROJ, PROJ2, PLAN, PLAN2, leg } from "./fixture.mjs";
import { ACTION_REPLY_CHECKS, ACTION_REPLY_WORDS, bearingProposalLabel } from "../../../src/action-replies/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* A request for comment putting two inquiries and resting on a document, sent, then answered. */
function answered() {
  const w = world();
  w.rfc(RFC, { legs: [leg(INQ, "advances"), leg(INFO, "rests_on")] });
  w.say(RFC, "sent", "2026-09-10");
  const got = w.say(RFC, "received", "2026-09-20");
  return { w, got };
}
/* A records request sent and answered; PROJ shared by alice and bob, PROJ2 alice's alone, a plan in each. */
function linked() {
  const w = world();
  w.action(REQ);
  w.say(REQ, "sent", "2026-09-10");
  w.say(REQ, "received", "2026-09-20");
  w.bundle(PROJ, "project");
  w.bundle(PROJ2, "project");
  w.participant(PROJ, "alice"); w.participant(PROJ, "bob"); w.participant(PROJ2, "alice");
  w.bundle(PLAN, "action_plan", PROJ);
  w.bundle(PLAN2, "action_plan", PROJ2);
  return w;
}

/* ============================================================ R5 */

test("R5 control: a machine's proposal reads machine_proposed with record-grammar's bearing sentence; a member's and an unstated one read that subject's too, at the act and in the read", () => {
  const { w, got } = answered();
  const claims = [{ claim: INQ, bearing: "new_evidence" }];
  const p = w.r.actionBearingPropose({ target: RFC, ord: got, claims, proposer: MACHINE, viewer: MACHINE });
  assert.equal(p.ok, true, JSON.stringify(p));
  const { at, claims: pc, ...label } = p.proposal;
  assert.deepEqual(label, proposalLabel(MACHINE, "bearing"), "record-grammar's label, whole");
  assert.deepEqual([label.state, label.machine_work, pc], ["machine_proposed", true, claims]);
  w.clock.ms += 1000;
  assert.equal(w.r.actionBearingPropose({ target: RFC, ord: got, claims, proposer: BOB, viewer: BOB }).ok, true);
  const items = w.r.bearingsOf({ target: RFC, viewer: M }).entries[0].proposals.items;
  for (const it of items) {
    const { at: _a, claims: _c, ...l } = it;
    assert.deepEqual(l, proposalLabel(it.by, "bearing"), it.by);
  }
  assert.deepEqual(items.map((x) => x.state).sort(), ["machine_proposed", "member_proposed"]);
  /* the exported label is the subject's in every state; the three states are unchanged */
  for (const who of [MACHINE, "class:ai", M, null, "", "  "])
    assert.deepEqual(bearingProposalLabel(who), proposalLabel(who, "bearing"), String(who));
  assert.deepEqual([MACHINE, M, null].map((x) => bearingProposalLabel(x).state), ["machine_proposed", "member_proposed", "unstated"]);
});

/* ============================================================ R6 */

test("R6 control: a well-formed link to a project the author sees at FULL lands; the same project unseen is refused NO_SUCH_PROJECT through membership, absent and unseen alike", () => {
  const w = linked();
  const link = (args) => w.r.aroseFromLink({ target: REQ, ord: 1, arising: { project: PROJ2 }, author: M, viewer: M, ...args });
  /* bob sees the action but not PROJ2 */
  const unseen = link({ author: BOB, viewer: BOB });
  const absent = link({ author: BOB, viewer: BOB, arising: { project: "PROJ-2026-0099-none" } });
  assert.deepEqual([unseen.reason, unseen.code, unseen.project, absent.reason], ["NO_SUCH_PROJECT", "NO_SUCH_PROJECT", PROJ2, "NO_SUCH_PROJECT"]);
  assert.deepEqual([unseen.check, unseen.detail, unseen.translation], [absent.check, absent.detail, absent.translation], "not a hint either way");
  /* judged by the author's sight, not the viewer's: alice's viewer stamp with bob as author is refused */
  assert.equal(link({ author: BOB, viewer: M }).reason, "NO_SUCH_PROJECT");
  /* a project seen only at EXISTENCE (discoverable, not a participant) is NO_SUCH_PROJECT too */
  w.st.db.prepare(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, 'discoverable')`).run(PROJ2);
  assert.equal(w.membership.sight(PROJ2, BOB), "existence");
  assert.equal(link({ author: BOB, viewer: BOB }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_arose_from`)[0].n, 0, "nothing written");
  /* the control */
  const ok = link({});
  assert.deepEqual([ok.ok, ok.arising], [true, { project: PROJ2 }]);
});

test("R6 aroseFromLink's refusals in order, each writing nothing: machine, no target, no such bundle, not an action, not a response, AROSE_FROM_REFUSED (before NO_SUCH_PROJECT), no such project, already linked", () => {
  const w = linked();
  assert.equal(w.r.aroseFromLink({ target: REQ, ord: 1, arising: { project: PROJ }, author: M, viewer: M }).ok, true);
  const before = w.counts();
  const code = (args) => w.r.aroseFromLink({ target: REQ, ord: 1, arising: { project: PROJ }, author: M, viewer: M, ...args }).reason;
  /* each refusal with everything after it also wrong */
  const unseen = { project: "PROJ-2026-0099-none" };
  assert.equal(code({ author: MACHINE, target: null, ord: 0, arising: "x" }), "MACHINE_CANNOT_LINK");
  assert.equal(code({ target: null, ord: 0, arising: "x" }), "NO_TARGET");
  assert.equal(code({ target: "ACTN-2026-0099-none", ord: 0, arising: "x" }), "NO_SUCH_BUNDLE");
  assert.equal(code({ target: INFO, ord: 0, arising: "x" }), "NOT_AN_ACTION");
  assert.equal(code({ ord: 0, arising: "x" }), "AROSE_FROM_NOT_A_RESPONSE");
  /* the malformed arising is refused before any project is looked for */
  for (const arising of ["x", { project: "x" }, { project: PROJ, plan: PLAN }, { plan: "PROJ-2026-0001-roads", matter: "m" },
                         { plan: PLAN, matter: "two\nlines" }, { plan: PLAN, matter: " " }]) {
    const r = w.r.aroseFromLink({ target: REQ, ord: 1, arising, author: BOB, viewer: BOB });
    assert.deepEqual([r.reason, r.check, r.translation], ["AROSE_FROM_REFUSED", "C-150.7", ACTION_REPLY_CHECKS.AROSE_FROM_REFUSED.translation],
      JSON.stringify(arising));
  }
  assert.equal(code({ arising: unseen }), "NO_SUCH_PROJECT");
  assert.equal(code({}), "AROSE_FROM_LINKED");
  assert.deepEqual(w.counts(), before);
  /* a plan's matter is stored as given and never read here: a plan the author does not see still links */
  const m = w.r.aroseFromLink({ target: REQ, ord: 1, arising: { plan: PLAN2, matter: "a matter named in one line" }, author: BOB, viewer: BOB });
  assert.equal(m.ok, true, JSON.stringify(m));
});

test("R6 arisenFrom refuses a malformed arising AROSE_FROM_REFUSED, a project the viewer does not see at FULL NO_SUCH_PROJECT, and a plan not in the viewer's sight NO_SUCH_BUNDLE; each control answers", () => {
  const w = linked();
  assert.equal(w.r.aroseFromLink({ target: REQ, ord: 1, arising: { project: PROJ2 }, author: M, viewer: M }).ok, true);
  assert.equal(w.r.aroseFromLink({ target: REQ, ord: 1, arising: { plan: PLAN2, matter: "m" }, author: M, viewer: M }).ok, true);
  for (const bad of [null, "x", {}, { project: "x" }, { plan: PLAN2 }, { project: PROJ2, plan: PLAN2, matter: "m" }]) {
    const r = w.r.arisenFrom(bad, M);
    assert.deepEqual([r.ok, r.reason, r.check], [false, "AROSE_FROM_REFUSED", "C-150.7"], JSON.stringify(bad));
  }
  const p = w.r.arisenFrom({ project: PROJ2 }, BOB);
  assert.deepEqual([p.reason, p.code, p.project], ["NO_SUCH_PROJECT", "NO_SUCH_PROJECT", PROJ2]);
  w.st.db.prepare(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, 'discoverable')`).run(PROJ2);
  assert.equal(w.r.arisenFrom({ project: PROJ2 }, BOB).reason, "NO_SUCH_PROJECT", "existence is not FULL");
  assert.deepEqual(w.r.arisenFrom({ plan: PLAN2, matter: "m" }, BOB), { ok: false, reason: "NO_SUCH_BUNDLE", target: PLAN2 });
  /* the controls: alice sees both */
  assert.deepEqual(w.r.arisenFrom({ project: PROJ2 }, M).items.map((x) => x.action), [REQ]);
  assert.deepEqual(w.r.arisenFrom({ plan: PLAN2, matter: "m" }, M).items.map((x) => x.action), [REQ]);
});

/* ============================================================ R7 */

/* The six rows R7 reads by key, with the numbers and `where`s it does not move. */
const AT = (fn, region) => `src/action-replies/index.mjs ${fn} > ${region}`;
const TAKEN = {
  MACHINE_CANNOT_RECORD_BEARING: ["C-150.1", AT("actionReplyBearing", "is-machine-bearing")],
  BEARING_NOT_RFC: ["C-150.2", AT("#bearingTarget", "is-bearing-rfc")],
  BEARING_REFUSED: ["C-150.3", AT("#bearingShape", "is-bearing-shape")],
  MACHINE_CANNOT_LINK: ["C-150.4", AT("aroseFromLink", "is-machine-link")],
  AROSE_FROM_NOT_A_RESPONSE: ["C-150.5", AT("aroseFromLink", "is-arose-response")],
  AROSE_FROM_LINKED: ["C-150.6", AT("aroseFromLink", "is-arose-linked")],
};
/* The six as T45 worded them: none is answered any longer. */
const T45 = [
  "A reply is laid out claim by claim by a member.", "Only a reply received to a request for comment is laid out claim by claim.",
  "Each claim in the layout is one the request put to the addressee", "That a matter or project arose from a response is recorded by a member.",
  "A matter or project is linked to a response the group received.", "This link is already recorded, so nothing was added.",
];

test("R7 the six rows take their translations from words.json's refusal.<CODE>, read by key; codes, numbers and wheres unmoved; C-150.7 keeps its own", () => {
  assert.deepEqual(Object.keys(ACTION_REPLY_WORDS).sort(), Object.keys(TAKEN).map((c) => `refusal.${c}`).sort(), "the six keys, no other");
  for (const [code, [check, where]] of Object.entries(TAKEN)) {
    const row = ACTION_REPLY_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, where], code);
    assert.equal(ACTION_REPLY_WORDS[`refusal.${code}`], en(`refusal.${code}`), `${code}: the list holds words.json's sentence`);
    assert.equal(row.translation, en(`refusal.${code}`), `${code}: the row answers it`);
    for (const old of T45) assert.ok(!row.translation.includes(old), `${code} no longer answers T45's words`);
  }
  assert.ok(!WORDS.some((x) => x.key === "refusal.AROSE_FROM_REFUSED"), "words.json holds no AROSE_FROM_REFUSED");
  assert.deepEqual([ACTION_REPLY_CHECKS.AROSE_FROM_REFUSED.check, ACTION_REPLY_CHECKS.AROSE_FROM_REFUSED.where,
                    ACTION_REPLY_CHECKS.AROSE_FROM_REFUSED.translation],
    ["C-150.7", AT("#arising", "is-arising-shape"), "What arose from the response is named as a project, or as a plan with one "
      + "of its matters, each by its id. This request named neither in that form, so nothing was linked."]);
  assert.equal(Object.keys(ACTION_REPLY_CHECKS).length, 10, "these seven, and T48's C-150.8 to .10 (R10; quoting.test.mjs)");
});

test("R7 each act answers the re-worded row's words beside its control, BEARING_REFUSED at its one site here", () => {
  const { w, got } = answered();
  /* R9 (T47) amends R7 for BEARING_REFUSED: the act answers the key's sentence with its `{item}` filled (t47.test.mjs) */
  const tr = (r, code, item = null) => {
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, code, code, TAKEN[code][0]], JSON.stringify(r).slice(0, 300));
    assert.equal(r.translation, item === null ? en(`refusal.${code}`) : en(`refusal.${code}`).replace("{item}", item), code);
  };
  const good = [{ claim: INQ, bearing: "new_evidence" }];
  tr(w.r.actionReplyBearing({ target: RFC, ord: got, claims: good, author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_RECORD_BEARING");
  tr(w.r.actionReplyBearing({ target: RFC, ord: 0, claims: good, author: M, viewer: M }), "BEARING_NOT_RFC");
  tr(w.r.actionReplyBearing({ target: RFC, ord: got, claims: [{ claim: INQ3, bearing: "new_evidence" }], author: M, viewer: M }), "BEARING_REFUSED",
     `Claim 1 (${INQ3})`);
  tr(w.r.actionBearingPropose({ target: RFC, ord: got, claims: [], proposer: MACHINE, viewer: MACHINE }), "BEARING_REFUSED",
     "The list of claims");
  assert.equal(w.r.actionReplyBearing({ target: RFC, ord: got, claims: good, author: M, viewer: M }).ok, true, "the control lands");
  w.bundle(PROJ, "project");
  w.participant(PROJ, "alice");
  tr(w.r.aroseFromLink({ target: RFC, ord: got, arising: { project: PROJ }, author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_LINK");
  tr(w.r.aroseFromLink({ target: RFC, ord: 0, arising: { project: PROJ }, author: M, viewer: M }), "AROSE_FROM_NOT_A_RESPONSE");
  assert.equal(w.r.aroseFromLink({ target: RFC, ord: got, arising: { project: PROJ }, author: M, viewer: M }).ok, true, "the control lands");
  tr(w.r.aroseFromLink({ target: RFC, ord: got, arising: { project: PROJ }, author: M, viewer: M }), "AROSE_FROM_LINKED");
});
