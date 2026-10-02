/* basis-versions: the six acts' state machine at the interface (R4, R12, R14, R13, R35) — carried from the old battery's
 * `test/versionstate.test.mjs` (IS-BUILD-PLAN PL-2 / IS-2), for what `acts.test.mjs`, `grammar.test.mjs` and `reads.test.mjs`
 * do not already prove: VERSION_ACT_NO_VERSION on all six acts; the illegal-edge refusal's fields over every edge; the
 * known names; `preview=true` spelled as a word; the receipt's fields; which acts carry a reason; empty, spaced,
 * backslash, newline and over-long reasons (C-25.32) on every act; the two reason refusals' distinct sentences; a
 * 500-character reason landing; the per-part affirmation missing both parts, under preview, and cleared on reject; an
 * accept whose inquiry leg closes no cycle; VERSION_NOT_ACCEPTED's `from`; C-25.31 (VERSION_ACT_UNWRITABLE) driven;
 * every refusal driven and equal to the catalogue; and the family's translation rules.
 * Three tests asserted the requirement where the module (2026-09-30) did not then meet it: a preview of an act the
 * writer cannot carry out, a preview of a one-to-seven-character reason the write then refuses, and C-25.31's place in
 * R12's order — reported as findings, never weakened, and met since.
 *
 * NOT CARRIED, and why:
 * - the old suite's source-text arms (the "sixth machine" comment, the one-implementation / call-site count pins over
 *   comment-stripped source, the REACH arm over a doctored corpus, fence layers 1–3 asserted in source, the `where`
 *   field naming `#moveVersionState`): source text; tests check behaviour at the interface.
 * - fence layer 1 (the credential stamp overwriting a caller-supplied `author`), layer 2 (NEEDS requiring `contribute`,
 *   and its behavioural arm) and the TOTALITY read of NEEDS: `control-plane` (the six version ops are in its NEEDS).
 * - `op=affordances` publishing the machine and deriving the six acts: `affordances` / `control-plane`.
 * - D-78's `surfaced_by: agent` restamp of a machine credential's write: the control plane's stamp, not this module.
 * - `STATES` holding no `version` key: the catalogue's object machines (`record-grammar`), not this module's.
 * - `op=publish` / `op=conclude` driven to reach C-25.34: here the case-member fact is the test's (fixture), as
 *   `acts.test.mjs` drives it.
 * Already proven elsewhere (not repeated): the machine's states, edges and reason set (grammar R4); the four-state walk,
 * preview refusing like the act, the Session Log entry, hide never deleting (acts R14); no inquiry / not an inquiry /
 * machine on all six / cycle path / partial and unknown affirmation / comma string (acts R12, R30); current's project
 * rules and one team never moving another (acts R13, R15, R31); a hidden version returned flagged, the envelope (reads
 * R9); a hand-written unattributed disposition refused (grammar R1, promote R6); the freeze on an edit and the
 * composition excluding state and hidden (promote R6/R29, grammar R5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V, MACHINE } from "./fixture.mjs";
import { VERSION_MACHINE, VERSION_ACT_TO, VERSION_ACT_CHECKS, BASIS_VERSION_CHECKS, versionNeedsReason }
  from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
const Q3 = "INQ-2026-0003-s";
const T = "2026-09-27T00:00:00Z", NOW = "2026-09-28T01:00:00Z";
const ALICE = "member:alice";
const OPENING = "opening account", AUDIT = "the audit alone";
const VERBS = ["accept", "reject", "consider", "revert", "current", "hide"];
const METHOD = (verb) => `version${verb[0].toUpperCase()}${verb.slice(1)}`;
const moved = (state, reason = "set by hand") => ({ state, state_by: ALICE, state_at: T, state_reason: reason });

function setup(more = []) {
  const w = world();
  w.doc(DOC); w.doc(DOC2);
  w.member("alice"); w.member("bo");
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  const r = w.inquiry(Q, block(merge(version(OPENING, [DOC]), version(AUDIT, [DOC2]), version("inq-leg", [Q2]), ...more)));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return w;
}
const act = (w, verb, o = {}) => w.bv[METHOD(verb)]({ target: Q, version: OPENING, author: ALICE, viewer: V("alice"),
                                                      identity: ALICE, ...o });
const read = (w, name, id = Q) => w.bv.basisVersions({ id, viewer: V("alice") }).versions.find((v) => v.name === name) ?? null;

test("R12 (C-25.22): not one of the six acts has a default version — absent, empty or blank, each refuses VERSION_ACT_NO_VERSION and writes nothing", () => {
  const w = setup();
  const p = w.project("Team", "alice", [Q]);
  const before = w.sha(Q);
  for (const verb of VERBS) for (const version of [undefined, "", "   "]) {
    const r = act(w, verb, { version, reason: "a reason", project: p });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.act, r.target, typeof r.translation],
      [false, "VERSION_ACT_NO_VERSION", "VERSION_ACT_NO_VERSION", "C-25.22", verb, Q, "string"], `${verb} ${JSON.stringify(version)}`);
  }
  assert.equal(w.sha(Q), before, "nothing written");
  /* negative control: naming the version, the same call lands */
  assert.equal(act(w, "hide", { reason: "a reason" }).ok, true);
});

test("R12 (C-25.23): a name nobody wrote is refused rather than matched to the nearest, and the refusal hands back the names the question holds", () => {
  const w = setup();
  for (const verb of ["accept", "reject", "hide"]) {
    const r = act(w, verb, { version: "a reading nobody wrote", reason: "a reason" });
    assert.deepEqual([r.ok, r.reason, r.check, r.version, [...(r.known ?? [])].sort()],
      [false, "VERSION_ACT_NO_SUCH_VERSION", "C-25.23", "a reading nobody wrote", [AUDIT, "inq-leg", OPENING].sort()], verb);
  }
  const near = act(w, "accept", { version: "opening accoun" });
  assert.equal(near.reason, "VERSION_ACT_NO_SUCH_VERSION", "not matched to the nearest name");
  assert.equal(read(w, OPENING).state, "suggested");
});

test("R4, R12 (C-25.25): over every state and every state-moving act, a legal edge passes and an illegal one is VERSION_ILLEGAL_TRANSITION naming from, to and the legal set; a refused move moves nothing", () => {
  const w = setup();
  const probe = (from) => {
    assert.equal(read(w, OPENING).state, from, "the premise is driven, not assumed");
    for (const verb of ["accept", "reject", "consider", "revert"]) {
      const to = VERSION_ACT_TO[verb];
      const r = act(w, verb, { reason: "a reason", preview: "true" });
      if (VERSION_MACHINE.edges[from].includes(to))
        assert.deepEqual([r.ok, r.from, r.to, r.wrote], [true, from, to, false], `${from} -> ${to} is legal`);
      else
        assert.deepEqual([r.ok, r.reason, r.code, r.check, r.act, r.from, r.to, r.legal, typeof r.translation],
          [false, "VERSION_ILLEGAL_TRANSITION", "VERSION_ILLEGAL_TRANSITION", "C-25.25", verb, from, to, VERSION_MACHINE.edges[from], "string"],
          `${from} -> ${to} is refused`);
    }
  };
  probe("suggested");
  assert.equal(act(w, "consider", { reason: "waiting on the minutes" }).ok, true); probe("considering");
  assert.equal(act(w, "accept").ok, true); probe("accepted");
  assert.equal(act(w, "reject", { reason: "the audit contradicts it" }).ok, true); probe("rejected");
  /* the one absent reversal, driven for real: accepted -> suggested moves nothing */
  assert.equal(act(w, "accept").ok, true);
  const before = w.sha(Q);
  const bad = act(w, "revert");
  assert.deepEqual([bad.ok, bad.reason, bad.from, bad.to, bad.legal], [false, "VERSION_ILLEGAL_TRANSITION", "accepted", "suggested", ["considering", "rejected"]]);
  assert.equal(w.sha(Q), before, "nothing written");
  assert.equal(read(w, OPENING).state, "accepted");
});

test("R14: preview spelled as the word `true` (or boolean true) is honoured as preview=1 is — the receipt with wrote:false, and nothing moves; `false` and `0` are no preview", () => {
  const w = setup();
  const before = w.sha(Q);
  for (const preview of ["true", true]) {
    const pv = act(w, "consider", { version: AUDIT, reason: "waiting on the second audit", preview });
    assert.deepEqual([pv.ok, pv.preview, pv.wrote, pv.would, pv.from, pv.to], [true, true, false, "consider", "suggested", "considering"], String(preview));
    const ph = act(w, "hide", { version: AUDIT, preview });
    assert.deepEqual([ph.ok, ph.preview, ph.wrote, ph.hidden], [true, true, false, true], String(preview));
  }
  assert.equal(w.sha(Q), before, "nothing written");
  const v = read(w, AUDIT);
  assert.deepEqual([v.state, v.moved, v.hidden], ["suggested", null, false], "no act is attributed to the version");
  /* negative control: a preview that is not asked for writes */
  for (const preview of ["false", "0"]) {
    const r = act(w, "hide", { version: AUDIT, preview, hidden: preview === "0" ? "false" : "true" });
    assert.deepEqual([r.ok, "preview" in r, "wrote" in r], [true, false, false], preview);
  }
  assert.notEqual(w.sha(Q), before);
});

test("R14: the receipt names the act, the question, the version, from and to, the member, the instant, the reason and the single weight; the act is read back on the version itself", () => {
  const w = setup();
  const why = "the audit's scope excluded this transfer";
  const r = act(w, "reject", { version: AUDIT, reason: why });
  assert.deepEqual({ ...r }, { ok: true, act: "reject", target: Q, version: AUDIT, from: "suggested", to: "rejected", moves_state: true,
    hidden: false, reason: why, author: ALICE, at: NOW, weight: "single", affirmed: null });
  assert.ok(r.at.endsWith("Z"));
  const v = read(w, AUDIT);
  assert.deepEqual([v.state, v.moved], ["rejected", { by: ALICE, at: NOW, reason: why }]);
  assert.match(w.text(Q), /Changes: reading 'the audit alone' suggested to rejected\.\nReason: the audit's scope excluded this transfer\n/);
});

test("R4, R12 (C-25.26): exactly the two moves into considering and rejected carry a reason — reject and consider refuse VERSION_NO_REASON without one, from a state where the move is legal; accept, revert, current and hide do not", () => {
  const w = setup([version("set aside", [DOC], moved("considering")), version("settled", [DOC], moved("accepted", ""))]);
  const p = w.project("Team", "alice", [Q]);
  /* each act from a state where its edge is legal, so the answer is about the reason and never about an edge */
  const from = { accept: OPENING, reject: OPENING, consider: OPENING, revert: "set aside", current: "settled", hide: OPENING };
  const before = w.sha(Q);
  const got = VERBS.map((verb) => {
    const r = act(w, verb, { version: from[verb], project: p, preview: "1" });
    return [verb, r.reason === "VERSION_NO_REASON" ? "VERSION_NO_REASON" : r.ok];
  });
  assert.deepEqual(got, VERBS.map((verb) => [verb, versionNeedsReason(VERSION_ACT_TO[verb]) ? "VERSION_NO_REASON" : true]));
  assert.deepEqual(VERBS.filter((v) => versionNeedsReason(VERSION_ACT_TO[v])), ["reject", "consider"]);
  const rj = act(w, "reject");
  assert.deepEqual([rj.ok, rj.code, rj.check, rj.from, rj.to, typeof rj.translation === "string" && rj.translation.length > 40],
    [false, "VERSION_NO_REASON", "C-25.26", "suggested", "rejected", true]);
  assert.equal(w.sha(Q), before, "nothing written");
});

test("R12 (C-25.26): a reason present but blank — an empty string, spaces, a tab — is refused exactly as an absent one", () => {
  const w = setup();
  const before = w.sha(Q);
  for (const verb of ["reject", "consider"]) for (const reason of [undefined, "", "   ", "\t"]) {
    const r = act(w, verb, { reason });
    assert.deepEqual([r.ok, r.code, r.check], [false, "VERSION_NO_REASON", "C-25.26"], `${verb} ${JSON.stringify(reason)}`);
  }
  assert.equal(w.sha(Q), before);
});

test("R12 (C-25.32): a reason the record cannot store — a double quote, a backslash, a newline, or over 500 characters — is VERSION_REASON_MALFORMED on every one of the six acts, including accept, hide and current, which need no reason; nothing written", () => {
  const w = setup();
  const p = w.project("Team", "alice", [Q]);
  const before = { q: w.sha(Q), p: w.sha(p) };
  const bad = [["a double quote", 'the audit says "the transfer never cleared"'],
               ["a backslash", "the ledger path C:\\accounts disagrees"],
               ["a newline", "first point\nsecond point"],
               ["a carriage return and newline", "first point\r\nsecond point"],
               ["501 characters", "x".repeat(501)]];
  for (const verb of VERBS) for (const [what, reason] of bad) {
    const r = act(w, verb, { reason, project: p });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.act], [false, "VERSION_REASON_MALFORMED", "VERSION_REASON_MALFORMED", "C-25.32", verb],
      `${verb}: ${what}`);
  }
  assert.deepEqual({ q: w.sha(Q), p: w.sha(p) }, before, "nothing written");
});

test("R12, R35: the missing and the malformed reason are different refusals with different sentences — the malformed one never says the reason is missing, the missing one never offers to shorten it", () => {
  const w = setup();
  const missing = act(w, "reject");
  const malformed = act(w, "reject", { reason: 'the audit says "it never cleared"' });
  assert.deepEqual([missing.code, malformed.code], ["VERSION_NO_REASON", "VERSION_REASON_MALFORMED"]);
  assert.notEqual(malformed.translation, missing.translation);
  assert.doesNotMatch(malformed.translation, /without the reason|worth nothing/);
  assert.match(malformed.translation, /given but could not be stored/);
  assert.doesNotMatch(missing.translation, /shorten/i);
  assert.deepEqual([missing.translation, malformed.translation],
    [VERSION_ACT_CHECKS.VERSION_NO_REASON.translation, VERSION_ACT_CHECKS.VERSION_REASON_MALFORMED.translation]);
});

test("R12, R14: a reason of exactly 500 characters, carrying an apostrophe, an em dash and accented words, lands and is stored verbatim", () => {
  const w = setup();
  const AT_BOUND = (("the auditor's own note — la contradicción está en la fecha — is what this reading "
                   + "does not answer, and it is the whole of why it is being turned down. ").repeat(5)
                   .slice(0, 499) + ".").replace(/\s\.$/, "..");
  assert.equal(AT_BOUND.length, 500);
  const r = act(w, "reject", { version: AUDIT, reason: AT_BOUND });
  assert.deepEqual([r.ok, r.reason, r.to], [true, AT_BOUND, "rejected"]);
  const v = read(w, AUDIT);
  assert.deepEqual([v.state, v.moved.reason], ["rejected", AT_BOUND]);
  assert.equal(w.row(`SELECT state_reason FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, Q, AUDIT).state_reason, AT_BOUND);
});

test("R12 (C-25.33), R14: accepting a version of two separately sufficient parts with no affirmation names both parts missing, in the record's order; the preview refuses identically; affirming every part lands and is read back; a one-part version accepts with affirmed null; a later reject clears the affirmation", () => {
  const w = world(); w.doc(DOC); w.doc(DOC2); w.member("alice");
  assert.equal(w.inquiry(Q, block(merge({ versions: [{ name: "two routes", description: "two separate routes to the answer", relationship: "or",
      state: "suggested", hidden: false }],
    grounds: [{ version: "two routes", ground: "the ledger route", asserted_by: ALICE, at: T },
              { version: "two routes", ground: "the minutes route", asserted_by: ALICE, at: T }],
    legs: [{ version: "two routes", target: DOC, role: "supports", ground: "the ledger route" },
           { version: "two routes", target: DOC2, role: "supports", ground: "the minutes route" }] },
    version("one route", [DOC])))).ok, true);
  const acc = (o) => w.bv.versionAccept({ target: Q, version: "two routes", author: ALICE, viewer: V("alice"), ...o });
  const before = w.sha(Q);
  for (const affirmed of [undefined, "", []]) {
    const r = acc({ affirmed });
    assert.deepEqual([r.ok, r.code, r.check, r.missing, r.unknown, r.declared],
      [false, "VERSION_AFFIRMATION_INCOMPLETE", "C-25.33", ["the ledger route", "the minutes route"], [], ["the ledger route", "the minutes route"]],
      JSON.stringify(affirmed));
  }
  const pv = acc({ preview: "1" });
  assert.deepEqual([pv.ok, pv.code, pv.missing], [false, "VERSION_AFFIRMATION_INCOMPLETE", ["the ledger route", "the minutes route"]]);
  const pvOk = acc({ preview: "1", affirmed: "the ledger route,the minutes route" });
  assert.deepEqual([pvOk.ok, pvOk.wrote, pvOk.affirmed], [true, false, ["the ledger route", "the minutes route"]]);
  assert.equal(w.sha(Q), before, "nothing written by a refusal or a preview");
  const good = acc({ affirmed: ["the minutes route", "the ledger route"] });
  assert.deepEqual([good.ok, good.to, good.affirmed], [true, "accepted", ["the ledger route", "the minutes route"]]);
  const v = read(w, "two routes");
  assert.deepEqual([v.affirmed, v.moved.by], [["the ledger route", "the minutes route"], ALICE]);
  const one = w.bv.versionAccept({ target: Q, version: "one route", author: ALICE, viewer: V("alice") });
  assert.deepEqual([one.ok, one.to, one.affirmed, read(w, "one route").affirmed], [true, "accepted", null, null],
    "nobody was asked: null, not an empty list");
  const back = w.bv.versionReject({ target: Q, version: "two routes", author: ALICE, viewer: V("alice"),
                                    reason: "on reflection the two routes are not separate" });
  assert.deepEqual([back.ok, back.affirmed, read(w, "two routes").affirmed], [true, null, null], "a later move clears it");
});

test("R12 (C-25.27): accepting a version whose inquiry leg closes no cycle lands — the refusal is for a circle, not recursion — and a refused cycle moves nothing", () => {
  const w = setup();
  w.inq.cycles[Q2] = true;
  const before = w.sha(Q);
  const cyc = act(w, "accept", { version: "inq-leg" });
  assert.equal(cyc.reason, "VERSION_BASIS_CYCLE");
  assert.deepEqual([w.sha(Q), read(w, "inq-leg").state], [before, "suggested"], "nothing moved");
  delete w.inq.cycles[Q2];
  const ok = act(w, "accept", { version: "inq-leg" });
  assert.deepEqual([ok.ok, read(w, "inq-leg").state], [true, "accepted"]);
});

test("R13 (C-25.28): VERSION_NOT_ACCEPTED names where the version stands; a version made current stays accepted", () => {
  const w = setup();
  const p = w.project("Team", "alice", [Q]);
  assert.equal(act(w, "consider", { reason: "waiting on the minutes" }).ok, true);
  const na =act(w, "current", { project: p });
  assert.deepEqual([na.ok, na.code, na.check, na.from], [false, "VERSION_NOT_ACCEPTED", "C-25.28", "considering"]);
  assert.equal(act(w, "accept").ok, true);
  const made = act(w, "current", { project: p });
  assert.deepEqual([made.ok, made.project, made.from, made.to], [true, p, "accepted", "accepted"]);
  assert.equal(read(w, OPENING).state, "accepted");
});

/* A version row the in-place writer cannot address: its first line is not `- name:`. The restricted parser reads it
   (so the version is found and every guard passes), and the rewrite in place answers null. */
function oddWorld() {
  const w = setup();
  assert.equal(w.inquiry(Q3, block({
    versions: [{ description: "a reading whose row opens with its description", name: "odd", relationship: "and",
                 state: "suggested", hidden: false }],
    grounds: [{ version: "odd", ground: "main", asserted_by: ALICE, at: T }],
    legs: [{ version: "odd", target: DOC, role: "supports", ground: "main" }] })).ok, true);
  return w;
}

test("R12 (C-25.31): VERSION_ACT_UNWRITABLE is reachable — a version row the writer cannot address in place, on every act that rewrites the question, and a project whose current_versions is an inline value it cannot extend; nothing is written", () => {
  const w = oddWorld();
  assert.equal(read(w, "odd", Q3)?.state, "suggested", "the version is held and readable");
  const before = w.sha(Q3);
  for (const verb of ["accept", "reject", "consider", "hide"]) {
    const r = act(w, verb, { target: Q3, version: "odd", reason: "a reason" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.act, r.target, r.version, typeof r.translation],
      [false, "VERSION_ACT_UNWRITABLE", "VERSION_ACT_UNWRITABLE", "C-25.31", verb, Q3, "odd", "string"], verb);
  }
  assert.equal(w.sha(Q3), before, "nothing written");
  assert.equal(read(w, "odd", Q3).state, "suggested");
  /* the project's side */
  assert.equal(act(w, "accept").ok, true);
  const p = w.project("Odd", "alice", [Q], { extra: ["current_versions: none"] });
  const pBefore = w.sha(p);
  const cur = act(w, "current", { project: p });
  assert.deepEqual([cur.ok, cur.reason, cur.check, cur.act, cur.project], [false, "VERSION_ACT_UNWRITABLE", "C-25.31", "current", p]);
  assert.equal(w.sha(p), pBefore, "nothing written");
  assert.equal(w.bv.currentOf(p, Q, V("alice")), null);
});

test("R14, R12 (C-25.31): preview runs every refusal — a preview of an act the writer cannot carry out answers VERSION_ACT_UNWRITABLE, as the act does", () => {
  const w = oddWorld();
  for (const verb of ["accept", "hide"]) {
    const pv = act(w, verb, { target: Q3, version: "odd", preview: "1" });
    assert.deepEqual([pv.ok, pv.reason], [false, "VERSION_ACT_UNWRITABLE"], `${verb} preview`);
  }
  assert.equal(act(w, "accept").ok, true);
  const p = w.project("Odd", "alice", [Q], { extra: ["current_versions: none"] });
  const pv = act(w, "current", { project: p, preview: "1" });
  assert.deepEqual([pv.ok, pv.reason], [false, "VERSION_ACT_UNWRITABLE"], "current preview");
});

test("R14: preview runs every refusal — for a reason of one to seven characters on reject and consider, the preview and the act give the same verdict", () => {
  for (const verb of ["reject", "consider"]) for (const reason of ["x", "waiting"]) {
    const w = setup();
    const pv = act(w, verb, { reason, preview: "1" });
    const r = act(w, verb, { reason });
    assert.deepEqual([pv.ok, pv.reason ?? null], [r.ok, r.ok ? pv.reason : r.reason], `${verb} '${reason}': preview ${JSON.stringify([pv.ok, pv.reason])}, act ${JSON.stringify([r.ok, r.reason, r.findings?.map((f) => f.code)])}`);
  }
});

test("R12: VERSION_ACT_UNWRITABLE stands in its place in the order — after VERSION_ACT_NO_SUCH_VERSION, before PUBLISHED_CANNOT_MOVE_VERSION, VERSION_NO_REASON and VERSION_ILLEGAL_TRANSITION", () => {
  const w = oddWorld();
  assert.equal(act(w, "accept", { target: Q3, version: "nope" }).reason, "VERSION_ACT_NO_SUCH_VERSION", "the name is told first");
  assert.equal(act(w, "reject", { target: Q3, version: "odd" }).reason, "VERSION_ACT_UNWRITABLE", "before a missing reason");
  assert.equal(act(w, "revert", { target: Q3, version: "odd" }).reason, "VERSION_ACT_UNWRITABLE", "before an illegal edge");
  w.facts.caseMember.add(Q3);
  assert.equal(act(w, "accept", { target: Q3, version: "odd" }).reason, "VERSION_ACT_UNWRITABLE", "before a case member's fence");
});

test("R12, R35 (DEC-49): every refusal the six acts can send is driven out of the module, the driven set equals VERSION_ACT_CHECKS (a floor as well as a ceiling), and each carries its C-number on the wire", () => {
  const w = oddWorld();
  const p = w.project("Team", "alice", [Q]);
  const stranger = w.project("Stranger", "alice", []);
  const wire = new Map();
  const drive = (r) => { assert.equal(r.ok, false, JSON.stringify(r).slice(0, 200)); wire.set(r.code, r.check); };
  const base = { author: ALICE, viewer: V("alice"), identity: ALICE };
  drive(w.bv.versionAccept({ ...base, version: OPENING }));
  drive(w.bv.versionAccept({ ...base, target: DOC, version: OPENING }));
  drive(w.bv.versionAccept({ ...base, target: Q }));
  drive(act(w, "accept", { author: MACHINE }));
  drive(act(w, "accept", { version: "nobody wrote this" }));
  drive(act(w, "reject", { target: Q3, version: "odd", reason: "a reason" }));
  drive(act(w, "reject"));
  drive(act(w, "reject", { reason: 'says "never"' }));
  drive(act(w, "revert"));
  w.inq.cycles[Q2] = true; drive(act(w, "accept", { version: "inq-leg" })); delete w.inq.cycles[Q2];
  drive(act(w, "current", { project: p }));
  assert.equal(act(w, "accept").ok, true);
  drive(act(w, "current"));
  drive(act(w, "current", { project: stranger }));
  w.facts.caseMember.add(Q); drive(act(w, "consider", { reason: "a reason" })); w.facts.caseMember.delete(Q);
  const w2 = world(); w2.doc(DOC); w2.doc(DOC2);
  assert.equal(w2.inquiry(Q, block({ versions: [{ name: "two", description: "two separate parts", relationship: "or", state: "suggested", hidden: false }],
    grounds: [{ version: "two", ground: "a", asserted_by: ALICE, at: T }, { version: "two", ground: "b", asserted_by: ALICE, at: T }],
    legs: [{ version: "two", target: DOC, role: "supports", ground: "a" }, { version: "two", target: DOC2, role: "supports", ground: "b" }] })).ok, true);
  drive(w2.bv.versionAccept({ ...base, target: Q, version: "two" }));
  assert.deepEqual([...wire.keys()].sort(), Object.keys(VERSION_ACT_CHECKS).sort(), "driven equals the catalogue");
  assert.deepEqual(Object.fromEntries([...wire].sort()), {
    MACHINE_CANNOT_MOVE_VERSION: "C-25.24", PUBLISHED_CANNOT_MOVE_VERSION: "C-25.34", VERSION_ACT_NOT_AN_INQUIRY: "C-25.21",
    VERSION_ACT_NO_INQUIRY: "C-25.20", VERSION_ACT_NO_SUCH_VERSION: "C-25.23", VERSION_ACT_NO_VERSION: "C-25.22",
    VERSION_ACT_UNWRITABLE: "C-25.31", VERSION_AFFIRMATION_INCOMPLETE: "C-25.33", VERSION_BASIS_CYCLE: "C-25.27",
    VERSION_CURRENT_NO_PROJECT: "C-25.29", VERSION_CURRENT_UNRELATED: "C-25.30", VERSION_ILLEGAL_TRANSITION: "C-25.25",
    VERSION_NOT_ACCEPTED: "C-25.28", VERSION_NO_REASON: "C-25.26", VERSION_REASON_MALFORMED: "C-25.32" });
});

test("R35 (DEC-49, DEC-32 elicitation): the act family's translation rules — each row a C-25 number and a sentence of at least twelve words, no two rows sharing a number or a sentence, none shared with the grammar's rows, and no member-facing 'ground', 'partition', 'AND' or 'OR'; the grammar's disposition row held to the same bound", () => {
  const keys = Object.keys(VERSION_ACT_CHECKS);
  const rows = keys.map((k) => VERSION_ACT_CHECKS[k]);
  assert.ok(rows.every((r) => /^C-25\.\d+$/.test(r.check)));
  assert.ok(rows.every((r) => typeof r.translation === "string" && r.translation.split(/\s+/).length >= 12));
  assert.equal(new Set(rows.map((r) => r.check)).size, keys.length, "one C-number per code");
  assert.equal(new Set(rows.map((r) => r.translation)).size, keys.length, "one sentence per code");
  assert.deepEqual(keys.filter((k) => k in BASIS_VERSION_CHECKS), [], "one code, one home");
  const banned = /\bground\b|\bpartition\b|\bAND\b|\bOR\b/;
  assert.deepEqual(keys.filter((k) => banned.test(VERSION_ACT_CHECKS[k].translation)), []);
  const d = BASIS_VERSION_CHECKS.VERSION_DISPOSITION_UNATTRIBUTED;
  assert.deepEqual([/^C-25\.\d+$/.test(d.check), banned.test(d.translation)], [true, false]);
});

test("R12 (C-25.32): on reject and consider, a reason shorter than the grammar stores (VERSION_REASON_MIN, 8) arrived and cannot be stored — VERSION_REASON_MALFORMED at the act and its preview, nothing written; eight characters land, and accept takes a shorter one", async () => {
  const { VERSION_REASON_MIN } = await import("../../../src/basis-versions/index.mjs");
  assert.equal(VERSION_REASON_MIN, 8);
  for (const verb of ["reject", "consider"]) {
    const w = setup();
    const before = w.sha(Q);
    for (const reason of ["x", "7 chars"]) for (const preview of [undefined, "1"]) {
      const r = act(w, verb, { reason, preview });
      assert.deepEqual([r.ok, r.reason, r.check], [false, "VERSION_REASON_MALFORMED", "C-25.32"], `${verb} '${reason}' ${preview ?? ""}`);
    }
    assert.equal(w.sha(Q), before, "nothing written");
    assert.equal(act(w, verb, { reason: "8 chars!" }).ok, true);
  }
  assert.equal(act(setup(), "accept", { reason: "ok" }).ok, true, "a reason no state requires is not held to the floor");
});
