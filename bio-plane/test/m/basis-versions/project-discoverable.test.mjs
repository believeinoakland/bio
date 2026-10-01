/* basis-versions: a project a caller cannot see, at its two acts that name one — make-current (R13) and a project's
   conclusion (R16) — under R33 (every act naming a project the viewer may not see answers as an absent one).
   Carried from `test/project-discoverable.test.mjs` (REC-149, C-70), basis-versions' share of it: op=versioncurrent and
   op=conclude at a project the viewer cannot see but that its owner set DISCOVERABLE are refused C-70.1 at EXISTENCE —
   membership's `existenceAct` answer, relayed unchanged, carrying the id and name and nothing else, writing nothing
   (the old §3h, §3i, §3j); at a HIDDEN project they answer exactly as at a never-minted id, R13's
   VERSION_CURRENT_UNRELATED and R16's NOT_A_PROJECT, with no C-70.1 (the old §2b, §2d; §3m, a hidden project beside a
   discoverable one; §6k, a project hidden again). The setting is made through membership's own interface
   (`projectVisibilitySet`, its R45), and sight is membership's (its R44, R77).
   NOT carried: the predecessor boot (§1, membership's default-hidden), the directory (§1e, §2e, §3b–§3g, §6j, §7:
   membership R48, C-70.4), the setting's owner fence and history (§6, §4e–§4f: membership R45/R46, C-70.2, C-70.3),
   the seven contents reads (§5: membership R44), the other acts of the table (cite, sever, reinstate: citation;
   proposedispose: queue; publish: publication; the project acts: membership; promote, airunopen, biasadopt,
   casedraft: their own modules) and the reads of §3l other than this module's, and §1a0/§1a (source-text arming). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const T = "2026-09-27T00:00:00Z";
const ALICE = "member:alice", VERA = "member:vera";
const NEVER = "PROJ-2026-0000-never-minted";
const TITLE_P = "Discoverable sewer project", TITLE_H = "Always hidden project";
const ACCEPTED = { state: "accepted", claim: "the council approved it", state_by: ALICE, state_at: T, state_reason: "" };
const STANDS = ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`, `    at: "${T}"`, `    by: "${ALICE}"`];
/* C-70.1's whole shape: the refusal's own fields, and the id and name (membership R44, R77). */
const C701_KEYS = ["check", "code", "detail", "name", "ok", "project", "reason", "translation"];

function setup() {
  const w = world();
  w.doc(DOC);
  w.member("alice"); w.member("vera"); w.member("ruth", { role: "admin" });
  const r = w.inquiry(Q, block(merge(version("first", [DOC], ACCEPTED), { basis: [{ target: DOC, role: "supports" }], refs: [DOC] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const P = w.project(TITLE_P, "alice", [Q], { extra: STANDS });
  const H = w.project(TITLE_H, "alice", [Q], { extra: STANDS });
  return { w, P, H };
}
const setting = (w, id, s) => {
  const r = w.membership.projectVisibilitySet({ projectId: id, setting: s, by: "alice", viewer: ALICE });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
};
/* vera's request at project X, for each of the two acts; each well-formed enough to reach its project resolution. */
const ACTS = {
  versioncurrent: (w, X, o = {}) => w.bv.versionCurrent({ target: Q, version: "first", project: X, reason: "we stand on it",
    author: VERA, viewer: VERA, identity: VERA, ...o }),
  conclude: (w, X, o = {}) => w.bv.conclude({ target: Q, project: X, falsifier: "a rescinding minute",
    author: VERA, viewer: VERA, identity: VERA, ...o }),
};
/* An answer at X with X's id written as a placeholder, so two answers compare whole across ids. */
const idless = (r, id) => JSON.parse(JSON.stringify(r).split(id).join("<PROJECT-ID>"));
const shas = (w, ...ids) => ids.map((id) => w.sha(id));

test("R33, R13, R16: at a HIDDEN project, versioncurrent and conclude answer exactly as at a never-minted id — R13's VERSION_CURRENT_UNRELATED (C-25.30) and R16's NOT_A_PROJECT — never C-70.1, and write nothing", () => {
  const { w, P, H } = setup();
  assert.equal(w.membership.visibilityOf(P), "hidden", "a project with no recorded setting is hidden");
  const before = shas(w, Q, P, H);
  for (const X of [P, H]) {
    const cur = ACTS.versioncurrent(w, X), never = ACTS.versioncurrent(w, NEVER);
    assert.deepEqual([cur.reason, cur.check], ["VERSION_CURRENT_UNRELATED", "C-25.30"]);
    assert.deepEqual(idless(cur, X), idless(never, NEVER), "hidden = absent, whole");
    const con = ACTS.conclude(w, X), cnever = ACTS.conclude(w, NEVER);
    assert.equal(con.reason, "NOT_A_PROJECT");
    assert.deepEqual(idless(con, X), idless(cnever, NEVER), "hidden = absent, whole");
    for (const r of [cur, con]) {
      assert.notEqual(r.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1 is never said about a hidden project");
      assert.equal(JSON.stringify(r).includes(X === P ? TITLE_P : TITLE_H), false, "the name is not shown");
    }
  }
  /* preview runs the same refusal */
  assert.deepEqual(idless(ACTS.versioncurrent(w, P, { preview: "1" }), P), idless(ACTS.versioncurrent(w, NEVER, { preview: "1" }), NEVER));
  assert.deepEqual(shas(w, Q, P, H), before, "nothing written");
});

test("R33, R13, R16: at a DISCOVERABLE project the viewer cannot see, versioncurrent and conclude are refused C-70.1 at EXISTENCE — membership's existenceAct answer relayed unchanged, the id and name and nothing else — and write nothing", () => {
  const { w, P, H } = setup();
  setting(w, P, "discoverable");
  const own = w.membership.existenceAct(P, VERA);
  assert.equal(own && own.check, "C-70.1", "membership places vera at EXISTENCE");
  const before = shas(w, Q, P, H);
  for (const [name, f] of Object.entries(ACTS)) {
    for (const o of [{}, name === "versioncurrent" ? { preview: "1" } : { commentary: "we agree" }]) {
      const r = f(w, P, o);
      assert.deepEqual(r, own, `${name}: relayed unchanged`);
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.project, r.name],
        [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", "PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", P, TITLE_P], name);
      assert.equal(typeof r.translation, "string");
      assert.deepEqual(Object.keys(r).sort(), C701_KEYS, `${name}: nothing beyond the id and name`);
      assert.equal(/alice|forming|current_versions|first|council/.test(JSON.stringify(r)), false,
        `${name}: no owner, participant, state, stance or claim is named`);
    }
  }
  assert.deepEqual(shas(w, Q, P, H), before, "nothing written");
  assert.equal(w.bv.currentOf(P, Q, ALICE).version, "first", "P's stance is untouched");
  assert.deepEqual(w.bv.conclusionRecordOf(P, Q, ALICE).history, [], "and no conclusion was recorded on it");
});

test("R33, R13, R16: a HIDDEN project beside a discoverable one still answers as absent, and a project set hidden again answers as absent again", () => {
  const { w, P, H } = setup();
  setting(w, P, "discoverable");
  const absent = { versioncurrent: ACTS.versioncurrent(w, NEVER), conclude: ACTS.conclude(w, NEVER) };
  for (const [name, f] of Object.entries(ACTS)) assert.deepEqual(idless(f(w, H), H), idless(absent[name], NEVER), `${name} at hidden H`);
  setting(w, P, "hidden");
  assert.equal(w.membership.existenceAct(P, VERA), null);
  for (const [name, f] of Object.entries(ACTS)) {
    const r = f(w, P);
    assert.notEqual(r.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT", name);
    assert.deepEqual(idless(r, P), idless(absent[name], NEVER), `${name} at P hidden again`);
  }
});

test("R13, R16 (controls): EXISTENCE is only for the caller outside — the owner still acts on her discoverable project, and an administrator (full sight) is answered by the joined fence, never C-70.1", () => {
  const { w, P } = setup();
  setting(w, P, "discoverable");
  const ruth = { author: "member:ruth", viewer: "member:ruth", identity: "member:ruth" };
  const rc = ACTS.versioncurrent(w, P, ruth), rn = ACTS.conclude(w, P, ruth);
  assert.deepEqual([rc.reason, rn.reason], ["PROJECT_ACT_NOT_A_PARTICIPANT", "PROJECT_ACT_NOT_A_PARTICIPANT"]);
  const own = { author: ALICE, viewer: ALICE, identity: ALICE };
  const cur = ACTS.versioncurrent(w, P, own);
  assert.deepEqual([cur.ok, cur.project, cur.to], [true, P, "accepted"]);
  const con = ACTS.conclude(w, P, own);
  assert.equal(con.ok, true, JSON.stringify(con).slice(0, 300));
  assert.deepEqual([con.version, con.history_length], ["first", 1]);
});

test("R20, R33: withdrawConclusion naming a project answers as its sibling acts do — C-70.1 at EXISTENCE (membership's existenceAct, relayed unchanged) for a discoverable project, NOT_A_PROJECT exactly as at a never-minted id for a hidden one — and writes nothing", () => {
  const { w, P, H } = setup();
  setting(w, P, "discoverable");
  const withdraw = (X) => w.bv.conclude({ withdraw: true, target: Q, project: X, reason: "we got it wrong",
    author: VERA, viewer: VERA, identity: VERA });
  const before = shas(w, Q, P, H);
  assert.deepEqual(withdraw(P), w.membership.existenceAct(P, VERA));
  assert.deepEqual(Object.keys(withdraw(P)).sort(), C701_KEYS);
  const hid = withdraw(H), never = withdraw(NEVER);
  assert.equal(hid.reason, "NOT_A_PROJECT");
  assert.deepEqual(idless(hid, H), idless(never, NEVER), "hidden = absent, whole");
  assert.equal(JSON.stringify(hid).includes(TITLE_H), false, "the name is not shown");
  assert.deepEqual(shas(w, Q, P, H), before, "nothing written");
});
