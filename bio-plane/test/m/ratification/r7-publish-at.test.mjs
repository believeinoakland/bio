/* ratification R58 (T51 fix round 7, G62; K4736): the pre-flight's `publish_at` says where the offered zone came from
   (`source`) and, when none is offered, why (`why`, retrieval's own), and every pre-flight writes one structured log line
   `{event: "publish_at", offered, source, why}`, so a ceremony that offers no zone can be told apart from one whose zone is
   unset. Driven at the pre-flight's interface (`caseRatifyPreflight`), over a stand-in `retrieval` that answers the shapes
   retrieval R69's `zone({why: true})` gives, and over the real retrieval for the one test that needs the provider. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, newKey, cleanCase, fmText, CASE_BODY, V } from "./fixture.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };

async function setup({ retrieval = null, profiles = null } = {}) {
  const w = world({ retrieval });
  const key = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const text = fmText(cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] }),
                      { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
  w.caseDoc(CASE, 1, text);
  if (profiles) w.record.setSetting("jurisdiction_profiles", profiles, V("alice"));
  const lines = [];
  const ask = () => {
    const real = console.log;
    console.log = (...a) => { const t = a.join(" "); try { const j = JSON.parse(t); if (j && j.event === "publish_at") lines.push(j); } catch { /* another line */ } };
    try { return w.r.caseRatifyPreflight({ text, signer: "alice", viewer: V("alice") }).publish_at; } finally { console.log = real; }
  };
  return { w, ask, lines };
}

const standIn = (answer) => ({ zone: (o) => (o && o.why ? answer : answer.zone) });

test("R58 an offer carries the source retrieval names, and the log line says so", async () => {
  const s = await setup({ retrieval: standIn({ zone: "America/Chicago", source: "local-facts", why: null }) });
  assert.deepEqual(s.ask(), { offered: true, zone: "America/Chicago", source: "local-facts" });
  assert.deepEqual(s.lines, [{ event: "publish_at", offered: true, source: "local-facts", why: null }]);
});

test("R58 no zone: PUBLISH_AT_NO_ZONE carries retrieval's why and the source none, and the log line says so (never the zone, never a name)", async () => {
  const s = await setup({ retrieval: standIn({ zone: null, source: null, why: "PROFILES_DISAGREE" }) });
  assert.deepEqual(s.ask(), { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE", source: "none", why: "PROFILES_DISAGREE" });
  assert.deepEqual(s.lines, [{ event: "publish_at", offered: false, source: "none", why: "PROFILES_DISAGREE" }]);
});

test("R58 control: a retrieval that holds no zone is final even when a profile holds one (two zones that disagree govern none; publish-schedule R1 would refuse the same time)", async () => {
  const s = await setup({ retrieval: standIn({ zone: null, source: null, why: "PROFILES_DISAGREE" }), profiles: ["test-port-ellery"] });
  const got = s.ask();
  assert.deepEqual([got.offered, got.zone, got.reason], [false, null, "PUBLISH_AT_NO_ZONE"]);
});

test("R58 a retrieval that cannot be read: the profiles answer, and the source says profiles", async () => {
  const s = await setup({ retrieval: { zone: () => { throw new Error("unreadable"); } }, profiles: ["test-port-ellery"] });
  assert.deepEqual(s.ask(), { offered: true, zone: "America/Halifax", source: "profiles" });
  assert.deepEqual(s.lines, [{ event: "publish_at", offered: true, source: "profiles", why: null }]);
});

test("R58 a retrieval that cannot be read and no profile zone: not offered, why UNREADABLE", async () => {
  const s = await setup({ retrieval: { zone: () => { throw new Error("unreadable"); } } });
  assert.deepEqual(s.ask(), { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE", source: "none", why: "UNREADABLE" });
});

test("R58 the real retrieval: a profile that holds a zone is offered with its source; none set says why (needs retrieval R69's zone({why: true}))", async () => {
  const none = await setup();
  const off = none.ask();
  assert.deepEqual([off.offered, off.zone, off.reason, off.source], [false, null, "PUBLISH_AT_NO_ZONE", "none"]);
  assert.equal(typeof off.why, "string", "retrieval says why no zone is held");
  const set = await setup({ profiles: ["test-port-ellery"] });
  const on = set.ask();
  assert.deepEqual([on.offered, on.zone], [true, "America/Halifax"]);
  assert.ok(["local-facts", "profiles"].includes(on.source), String(on.source));
});
