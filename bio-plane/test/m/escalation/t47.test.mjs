/* escalation, T47 (T47-42; N962, N992, N983; DEC-198, DEC-199; K3027): two rows' translations read by key from
   words.json (R36), and the reads routed through the ops map evaluated at the server's instant, a query `now` ignored
   (R37), each driven at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { seeded, opened, toStage, V, ms } from "./fixture.mjs";
import { ESCALATION_CHECKS, ESCALATION_WORDS, escalationOps } from "../../../src/escalation/index.mjs";

const LIST = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const WORD = (key) => { const w = LIST.words.find((x) => x.key === key); if (!w) throw new Error(`words.json holds no ${key}`); return w.en; };
const by = (who) => ({ author: V(who), viewer: V(who) });
const URL_OF = (q) => new URL(`https://plane.test/op?${new URLSearchParams(q)}`);

test("R36 C-116.41 ESCALATION_BY_ACT_ONLY and C-116.14 ALREADY_ATTACHED take their translations from words.json, read by key (refusal.ESCALATION_BY_ACT_ONLY, refusal.ALREADY_ATTACHED): each row's translation equals its key's sentence, ESCALATION_WORDS holding it verbatim; codes, numbers and wheres unmoved; the first names stop pursuing and reopen among the acts; control: C-116.27 NOT_OPEN keeps its own translation (R35)", () => {
  const rows = { ESCALATION_BY_ACT_ONLY: ["C-116.41", "src/escalation/index.mjs check > is-escalation-act"],
                 ALREADY_ATTACHED: ["C-116.14", "src/escalation/index.mjs escalationAttach > is-attached-once"] };
  for (const [code, [check, where]] of Object.entries(rows)) {
    const key = `refusal.${code}`;
    assert.equal(ESCALATION_WORDS[key], WORD(key), key);
    assert.deepEqual([ESCALATION_CHECKS[code].check, ESCALATION_CHECKS[code].where, ESCALATION_CHECKS[code].translation],
                     [check, where, WORD(key)], code);
    assert.equal(Object.values(ESCALATION_CHECKS).filter((r) => r.check === check).length, 1, check);
  }
  assert.match(ESCALATION_CHECKS.ESCALATION_BY_ACT_ONLY.translation, /stop pursuing, reopen/);
  /* control: a row R36 does not name keeps its own sentence (R35's NOT_OPEN, words.json's sentence not adopted) */
  assert.notEqual(ESCALATION_CHECKS.NOT_OPEN.translation, WORD("refusal.NOT_OPEN"));
  /* driven: a member's raw promotion of an escalation's document is answered with the word, nothing written */
  const w = seeded();
  opened(w);
  const head = w.record.head(w.E);
  const before = w.text(w.E);
  const raw = w.promotion.promote({ bundleId: w.E, base: head.bundleSha, snapKey: "20260928T110000Z_0000c47a", author: V("bob"),
                                    files: [{ path: "bundle.md", text: before }], meta: {} });
  assert.deepEqual([raw.ok, raw.reason, raw.check, raw.translation],
                   [false, "ESCALATION_BY_ACT_ONLY", "C-116.41", WORD("refusal.ESCALATION_BY_ACT_ONLY")]);
  assert.equal(w.text(w.E), before);
});

test("R36 R34 an ALREADY_ATTACHED answered to a viewer who may not see the escalation carries no escalation id, stage or count, translation included, the translation being refusal.ALREADY_ATTACHED's sentence; control: a viewer who may see it is named the escalation and stage in the fields, with the same translation", () => {
  const w = seeded();
  toStage(w, 2);
  /* alice's escalation of D2, in a project bob may not see, at stage 2, holding an action bob may see */
  const P2 = w.project("Harbour watch", "alice");
  const D2 = w.determine({ project: P2, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const E2 = w.esc.escalationOpen({ reason: "Worth pursuing.", determination: D2, ...by("alice") }).id;
  assert.equal(w.esc.escalationAdvance({ id: E2, to: 2, reason: "Go.", ...by("alice") }).ok, true);
  const shared = w.action({ project: w.P, restsOn: [w.D, D2] });
  const attach = (who) => w.esc.escalationAttach({ reason: "This act serves the stage.", id: w.E, action: shared, ...by(who) });
  assert.equal(w.esc.escalationAttach({ reason: "Here.", id: E2, action: shared, ...by("alice") }).ok, true);
  const before = w.snapshot();
  const blind = attach("bob");
  assert.deepEqual([blind.reason, blind.check, blind.translation], ["ALREADY_ATTACHED", "C-116.14", WORD("refusal.ALREADY_ATTACHED")]);
  assert.deepEqual(Object.keys(blind).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  for (const s of [blind.translation, blind.detail]) {
    assert.equal(s.includes(E2), false, "no escalation id");
    assert.doesNotMatch(s, /\d/, "no stage or count");
  }
  /* control: alice may see E2, and is named it and its stage; the translation is the same sentence */
  const seen = attach("alice");
  assert.deepEqual([seen.reason, seen.escalation, seen.stage, seen.translation], ["ALREADY_ATTACHED", E2, 2, blind.translation]);
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
});

/* Stage 3 with a notification action whose clock entry falls due 2026-09-20 (the test profile's zone, America/Halifax:
   past from 2026-09-21T03:00:00Z), and nothing come back. */
function atDeadline() {
  const w = seeded();
  opened(w);
  w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Notify.", ...by("bob") });
  w.N = w.action({ project: w.P, restsOn: [w.D], clock: [{ date: "2026-09-20", text: "reply due" }] });
  assert.equal(w.esc.escalationAttach({ reason: "The notice.", id: w.E, action: w.N, ...by("bob") }).ok, true);
  w.correspond(w.N, "sent", "2026-09-02");
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 3, reason: "Sent.", ...by("bob") }).ok, true);
  return w;
}
const BEFORE = "2026-09-21T02:59:59Z", AFTER = "2026-09-21T03:00:00Z";

test("R37 the reads routed through the map (escalation, escalationsdue, escalationreasondraft) answer a request carrying now in the query, or now or nowMs in the body, byte-identically to the same request without it; control: the same instant passed to the service in-plane does change the answer, so the ignored now would have mattered", () => {
  const w = atDeadline();
  w.clock.now = BEFORE;
  const late = String(ms("2026-12-01T00:00:00Z"));
  const base = { author: V("bob"), viewer: V("bob") };
  const arms = { escalation: { id: w.E }, escalationsdue: { limit: "50" }, escalationreasondraft: { determination: w.D } };
  for (const [op, q] of Object.entries(arms)) {
    const plain = JSON.stringify(escalationOps(w.esc, URL_OF({ ...base, ...q }), null)[op]());
    for (const [extra, body] of [[{ now: late }, null], [{ now: "" }, null], [{ now: "soon" }, null],
                                 [{}, { now: late, nowMs: Number(late) }], [{ now: late }, { nowMs: Number(late) }]])
      assert.equal(JSON.stringify(escalationOps(w.esc, URL_OF({ ...base, ...q, ...extra }), body)[op]()), plain,
                   `${op} ${JSON.stringify(extra)} ${JSON.stringify(body)}`);
  }
  /* control: in-plane, the service at that instant proposes 3→4, lists it due and states the date passed */
  const at = Number(late);
  assert.deepEqual(w.esc.escalationRead({ id: w.E, nowMs: at, viewer: V("bob") }).proposed.map((p) => p.to), [4]);
  assert.equal(w.esc.escalationsDue({ nowMs: at, viewer: V("bob") }).items.length, 1);
  assert.match(w.esc.escalationReasonDraft({ determination: w.D, nowMs: at, viewer: V("bob") }).text, /passed without a response/);
  /* while through the map, at the module's clock, none of them does */
  const read = escalationOps(w.esc, URL_OF({ ...base, id: w.E, now: late }), null).escalation();
  assert.deepEqual([read.as_of, read.proposed], [BEFORE, []]);
});

test("R37 the instant is the module's own clock (escalationOf's now): moving it across the clock entry's deadline moves the proposal, the due list and the draft's passed date through the map's arms; the age is counted from it", () => {
  const w = atDeadline();
  const q = (extra) => URL_OF({ author: V("bob"), viewer: V("bob"), ...extra });
  const read = () => escalationOps(w.esc, q({ id: w.E }), null).escalation();
  const due = () => escalationOps(w.esc, q({}), null).escalationsdue().items.map((x) => [x.id, x.to]);
  const passed = () => escalationOps(w.esc, q({ determination: w.D }), null).escalationreasondraft().parts
    .filter((p) => p.text.startsWith("The date ")).map((p) => p.id);
  w.clock.now = BEFORE;
  assert.deepEqual([read().as_of, read().proposed, due(), passed()], [BEFORE, [], [], []]);
  w.clock.now = AFTER;
  const r = read();
  assert.deepEqual([r.as_of, r.proposed.map((p) => [p.to, p.instant, p.age_ms])], [AFTER, [[4, AFTER, 0]]]);
  assert.deepEqual(due(), [[w.E, 4]]);
  assert.deepEqual(passed(), [w.N]);
  w.clock.now = "2026-09-23T03:00:00Z";
  assert.equal(read().proposed[0].age_ms, ms("2026-09-23T03:00:00Z") - ms(AFTER));
  /* and the advance, an act, reads the same clock */
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 4, reason: "Past due.", ...by("bob") }).ok, true);
});
