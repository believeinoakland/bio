/* basis-versions: the six acts (R12–R15), the machine fence (R30) and one team never moving another's stance (R31). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V, MACHINE } from "./fixture.mjs";
import { VERSION_ACT_TO, basisVersionsOps } from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
const T = "2026-09-27T00:00:00Z";
const ALICE = "member:alice";

function setup(extra = {}) {
  const w = world();
  w.doc(DOC); w.doc(DOC2);
  w.member("alice"); w.member("bo");
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  const r = w.inquiry(Q, block(merge(version("first", [DOC], extra), version("inq-leg", [Q2]))));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return w;
}
const act = (w, a, o = {}) => w.bv[`version${a[0].toUpperCase()}${a.slice(1)}`]({ target: Q, version: "first", author: ALICE, viewer: V("alice"), ...o });

test("R12: refusals in order — no inquiry, not an inquiry, no version, a machine, no such version (invisible alike), unwritable, published, no reason, a malformed reason, an illegal edge, a basis cycle, an incomplete affirmation", () => {
  const w = setup();
  const code = (o) => w.bv.versionAccept({ author: ALICE, viewer: V("alice"), ...o });
  const c = (r) => [r.reason, r.check];
  assert.deepEqual(c(code({ version: "first" })), ["VERSION_ACT_NO_INQUIRY", "C-25.20"]);
  assert.deepEqual(c(code({ target: DOC, version: "first" })), ["VERSION_ACT_NOT_AN_INQUIRY", "C-25.21"]);
  assert.deepEqual(c(code({ target: Q })), ["VERSION_ACT_NO_VERSION", "C-25.22"]);
  assert.deepEqual(c(code({ target: Q, version: "first", author: "" })), ["MACHINE_CANNOT_MOVE_VERSION", "C-25.24"]);
  assert.deepEqual(c(code({ target: Q, version: "first", author: MACHINE })), ["MACHINE_CANNOT_MOVE_VERSION", "C-25.24"]);
  assert.deepEqual(c(code({ target: Q, version: "nope" })), ["VERSION_ACT_NO_SUCH_VERSION", "C-25.23"]);
  assert.equal(code({ target: Q, version: "first", viewer: "nobody" }).reason, "VERSION_ACT_NO_SUCH_VERSION");
  assert.deepEqual(c(code({ target: "INQ-2026-0077-z", version: "first" })), ["VERSION_ACT_NO_SUCH_VERSION", "C-25.23"]);
  w.facts.caseMember.add(Q);
  assert.deepEqual(c(code({ target: Q, version: "first" })), ["PUBLISHED_CANNOT_MOVE_VERSION", "C-25.34"]);
  assert.equal(act(w, "hide", { hidden: "true" }).ok, true, "hide moves no state and is not fenced");
  w.facts.caseMember.delete(Q);
  assert.deepEqual(c(act(w, "reject")), ["VERSION_NO_REASON", "C-25.26"]);
  assert.deepEqual(c(act(w, "consider", { reason: 'a "quoted" reason' })), ["VERSION_REASON_MALFORMED", "C-25.32"]);
  assert.deepEqual(c(act(w, "accept", { reason: "x".repeat(501) })), ["VERSION_REASON_MALFORMED", "C-25.32"]);
  assert.deepEqual(c(act(w, "revert")), ["VERSION_ILLEGAL_TRANSITION", "C-25.25"], "suggested -> suggested is no edge");
  w.inq.cycles[Q2] = true;
  const cyc = w.bv.versionAccept({ target: Q, version: "inq-leg", author: ALICE, viewer: V("alice") });
  assert.deepEqual([cyc.reason, cyc.check, cyc.path], ["VERSION_BASIS_CYCLE", "C-25.27", [Q, Q2, Q]]);
  /* several separately sufficient parts: every one affirmed */
  const w2 = world(); w2.doc(DOC); w2.doc(DOC2);
  assert.equal(w2.inquiry(Q, block({ versions: [{ name: "two", description: "two separate parts", relationship: "or", state: "suggested", hidden: false }],
    grounds: [{ version: "two", ground: "a", asserted_by: ALICE, at: T }, { version: "two", ground: "b", asserted_by: ALICE, at: T }],
    legs: [{ version: "two", target: DOC, role: "supports", ground: "a" }, { version: "two", target: DOC2, role: "supports", ground: "b" }] })).ok, true);
  const two = (affirmed) => w2.bv.versionAccept({ target: Q, version: "two", author: ALICE, viewer: V("alice"), affirmed });
  const inc = two("a");
  assert.deepEqual([inc.reason, inc.check, inc.missing, inc.unknown], ["VERSION_AFFIRMATION_INCOMPLETE", "C-25.33", ["b"], []]);
  assert.deepEqual(two(["a", "b", "c"]).unknown, ["c"]);
  const ok = two("b, a");
  assert.deepEqual([ok.ok, ok.affirmed], [true, ["a", "b"]], "in the record's own order");
  for (const r of [inc, cyc]) assert.ok(r.translation && r.act === "accept");
});

test("R13: current requires the version accepted, a project, one the viewer sees that cites the inquiry by a live edge, and the actor joined", () => {
  const w = setup();
  const cur = (o) => act(w, "current", o);
  assert.deepEqual([cur({ project: "x" }).reason, cur({}).check], ["VERSION_NOT_ACCEPTED", "C-25.28"]);
  assert.equal(act(w, "accept").ok, true);
  assert.deepEqual([cur({}).reason, cur({}).check], ["VERSION_CURRENT_NO_PROJECT", "C-25.29"]);
  const other = w.project("Other", "alice", [Q2]);
  const severed = w.project("Severed", "alice", [], { severed: [Q] });
  const mine = w.project("Mine", "alice", [Q]);
  const bos = w.project("Bo's", "bo", [Q]);
  for (const p of [other, severed, "PROJ-2026-0404-none"])
    assert.deepEqual([cur({ project: p }).reason, cur({ project: p }).check], ["VERSION_CURRENT_UNRELATED", "C-25.30"], p);
  assert.equal(cur({ project: bos, viewer: V("alice") }).reason, "VERSION_CURRENT_UNRELATED", "a project the viewer may not see");
  const denied = cur({ project: bos, viewer: "class:admin", identity: ALICE });
  assert.equal(denied.reason, "PROJECT_ACT_NOT_A_PARTICIPANT", "seen, but not joined");
  const done = cur({ project: mine, identity: ALICE, reason: "we stand on it" });
  assert.deepEqual([done.ok, done.project, done.moves_state, done.to], [true, mine, false, "accepted"]);
});

test("R14: preview runs every refusal and writes nothing; accept, reject, consider and revert write state, state_by, state_at, state_reason and the affirmed parts with a Session Log entry; hide sets or clears hidden and never deletes", () => {
  const w = setup();
  const before = w.sha(Q);
  const pv = act(w, "reject", { reason: "does not hold up", preview: "1" });
  assert.deepEqual([pv.ok, pv.preview, pv.wrote, pv.would, pv.from, pv.to], [true, true, false, "reject", "suggested", "rejected"]);
  assert.equal(w.sha(Q), before, "nothing written");
  assert.equal(act(w, "reject", { preview: "1" }).reason, "VERSION_NO_REASON", "preview refuses as the act does");
  const rej = act(w, "reject", { reason: "does not hold up" });
  assert.deepEqual([rej.ok, rej.from, rej.to, rej.author, rej.reason], [true, "suggested", "rejected", ALICE, "does not hold up"]);
  const row = w.row(`SELECT state, state_by, state_at, state_reason, affirmed_parts FROM inquiry_basis_versions WHERE bundle_id=? AND name='first'`, Q);
  assert.deepEqual(row, { state: "rejected", state_by: ALICE, state_at: "2026-09-28T01:00:00Z", state_reason: "does not hold up", affirmed_parts: null });
  assert.match(w.text(Q), /### Session 2026-09-28T01:00:00Z \| Version reject \| member:alice\nTrigger: op=versionreject on INQ-2026-0001-q\nChanges: reading 'first' suggested to rejected.\nReason: does not hold up\n/);
  assert.equal(act(w, "consider", { reason: "worth another look" }).to, "considering");
  assert.equal(act(w, "revert").to, "suggested");
  assert.equal(w.row(`SELECT state_reason FROM inquiry_basis_versions WHERE name='first'`).state_reason, "", "a move clears an earlier reason");
  assert.equal(act(w, "accept").to, "accepted");
  const hide = act(w, "hide");
  assert.deepEqual([hide.ok, hide.hidden, hide.moves_state], [true, true, false]);
  assert.equal(w.row(`SELECT hidden, state FROM inquiry_basis_versions WHERE name='first'`).hidden, 1);
  assert.equal(act(w, "hide", { hidden: "false" }).hidden, false);
  assert.equal(w.count("inquiry_basis_versions"), 2, "hiding never deletes");
  assert.deepEqual(Object.keys(VERSION_ACT_TO), ["accept", "reject", "consider", "revert", "current", "hide"]);
});

test("R15: current writes only the project — its current_versions row, last_updated and a Session Log entry with the reason; the inquiry's bytes do not change", () => {
  const w = setup();
  act(w, "accept");
  const p = w.project("Mine", "alice", [Q]);
  const qSha = w.sha(Q), pSha = w.sha(p);
  const qText = w.text(Q);
  const r = act(w, "current", { project: p, identity: ALICE, reason: "the team agreed" });
  assert.equal(r.ok, true);
  assert.equal(w.sha(Q), qSha, "the question's bundle_sha does not move");
  assert.equal(w.text(Q), qText);
  assert.notEqual(w.sha(p), pSha);
  const t = w.text(p);
  assert.match(t, new RegExp(`current_versions:\\n  - inquiry: "${Q}"\\n    version: "first"\\n    at: "2026-09-28T01:00:00Z"\\n    by: "member:alice"`));
  assert.match(t, /last_updated: "2026-09-28T01:00:00Z"/);
  assert.match(t, /\| Stands on \| member:alice\nTrigger: op=versioncurrent on INQ-2026-0001-q\nChanges: this project now stands on reading 'first' of INQ-2026-0001-q.\nReason: the team agreed\n/);
  assert.deepEqual(w.bv.currentOf(p, Q, V("alice")), { project: p, version: "first", at: "2026-09-28T01:00:00Z", by: ALICE });
});

test("R30: a machine credential holds no act that moves, hides or makes current a version, concludes or narrows", () => {
  const w = setup();
  for (const a of ["accept", "reject", "consider", "revert", "current", "hide"])
    assert.equal(act(w, a, { author: MACHINE, reason: "because" }).reason, "MACHINE_CANNOT_MOVE_VERSION", a);
  assert.equal(w.bv.conclude({ target: Q, author: "class:ai", conclusion: "x", falsifier: "y", version: "first" }).reason, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(w.bv.conclude({ target: Q, author: "class:ai", withdraw: true, project: "p", reason: "r" }).reason, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(w.bv.narrow({ target: Q, version: "first", ord: 0, author: MACHINE, viewer: V("alice") }).reason, "NARROW_NOT_A_MEMBER");
  assert.equal(w.count("inquiry_basis_versions"), 2);
});

test("R31: one team's act never moves another's stance — CURRENT is written on the acting project only, never on the shared question", () => {
  const w = setup();
  act(w, "accept");
  const a = w.project("A", "alice", [Q]), b = w.project("B", "alice", [Q]);
  act(w, "current", { project: a, identity: ALICE });
  const bBefore = w.sha(b), qBefore = w.sha(Q);
  const two = w.revise(Q, inqMd(Q, block(merge(version("first", [DOC], { state: "accepted", state_by: ALICE, state_at: "2026-09-28T01:00:00Z", state_reason: "" }),
    version("inq-leg", [Q2]), version("second", [DOC2], { state: "accepted", state_by: ALICE, state_at: T, state_reason: "" })))));
  assert.equal(two.ok, true, JSON.stringify(two).slice(0, 300));
  act(w, "current", { project: b, identity: ALICE, version: "second" });
  assert.deepEqual([w.bv.currentOf(a, Q, V("alice")).version, w.bv.currentOf(b, Q, V("alice")).version], ["first", "second"]);
  assert.notEqual(w.sha(b), bBefore);
  assert.equal(w.text(Q).includes("current_versions"), false, "never on the shared question");
});

test("R12–R15 through the ops: the six dispatch entries read the stamps from the query string only", () => {
  const w = setup();
  const url = new URL(`https://x/?target=${Q}&version=first&author=${encodeURIComponent(ALICE)}&viewer=${encodeURIComponent(V("alice"))}`);
  const ops = basisVersionsOps(w.bv, url, { author: "member:mallory", reason: "moved by body" });
  const r = ops.versionreject();
  assert.deepEqual([r.ok, r.author, r.reason], [true, ALICE, "moved by body"]);
  assert.deepEqual(Object.keys(ops).sort(), ["basisversions", "conclude", "narrow", "narrowcandidates", "versionaccept", "versionconsider",
    "versioncurrent", "versionhide", "versionreject", "versionrevert", "withdrawconclusion"]);
});
