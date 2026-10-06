/* scheduler — T34 (T34-51; N662, DEC-147; ANSWERS #2, K1803; N605, K1666; K1790, K1811, K1816, K1836): the
   `scheduled-publish` consumer over publication R67 (R22), armed through publication's `onPublishScheduled` (its R71);
   the standing questions re-armed through answers' `onStandingSet` (R23, its R27); and the arming notices duties,
   people and money-checks offer (R9; duties R26, people R35, money-checks R16). The first tests drive stand-ins shaped
   as the owners state their services; the last drive the real owners in their own test worlds and read the alarm. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCHEDULER_ORDER, SCHEDULER_KEYS, RANKED, DAILY, Scheduler } from "../../../src/scheduler/index.mjs";
import { world, storage, writes, NOW } from "./fixture.mjs";
import { planeWorld as publicationWorld, V as PV, SIG, KEY } from "../publication/fixture.mjs";
import { world as dutiesWorld } from "../duties/fixture.mjs";
import { world as peopleWorld, ANN } from "../people/fixture.mjs";
import { world as moneyWorld, shareDetector, ALICE } from "../money-checks/fixture.mjs";
import { answersWorld, V as AV } from "../answers/fixture.mjs";

const iso = (ms) => new Date(ms).toISOString();
const settle = () => new Promise((r) => setImmediate(r));
const LA = "America/Los_Angeles";

/* ---- R22: the consumer ---- */

test("R22, R5, R2: scheduled-publish stands after deadline-recheck and before working-on-seal, answers under scheduledpublish, and is publication's alone", () => {
  const at = (n) => SCHEDULER_ORDER.indexOf(n);
  assert.equal(at("scheduled-publish"), at("deadline-recheck") + 1);
  assert.equal(at("working-on-seal"), at("scheduled-publish") + 1);
  assert.equal(SCHEDULER_KEYS["scheduled-publish"], "scheduledpublish");
  assert.equal(RANKED.includes("scheduled-publish"), false, "not batch-bounded: given its now alone");
  assert.equal(DAILY.includes("scheduled-publish"), false, "its time is the owner's, never a day of this module's (R7)");
  const { s } = world();
  const names = s.consumers();
  assert.deepEqual(names.slice(names.indexOf("deadline-recheck"), names.indexOf("deadline-recheck") + 3),
    ["deadline-recheck", "scheduled-publish", "working-on-seal"]);
  assert.deepEqual(new Scheduler({ storage: storage(), owners: {} }).consumers(), [], "without publication it is absent");
});

test("R22, R1, R2: its wake and due are publishWake; its tick is publishDue, told now as instant text and awaited, its answer under scheduledpublish; nothing waiting, it is absent and wants no wake", async () => {
  const T = Date.parse("2026-10-01T12:00:00Z");
  let resolved = false;
  const taken = { ok: true, taken: [{ case: "CASE-2026-0001", edition: 1, state: "published", published_at: "2026-10-01T12:00:00Z" }] };
  const { s, st, calls, set } = world({ "scheduled-publish": { wake: "2026-10-01T12:00:00Z",
    tick: () => new Promise((ok) => setTimeout(() => { resolved = true; ok(taken); }, 5)) } });
  assert.equal(await s.arm(NOW), T, "armed at the set time, read from instant text");
  const quiet = await s.onAlarm(NOW);
  assert.equal("scheduledpublish" in quiet, false, "before its time: not due, absent");
  assert.equal(calls.some(([m]) => m === "publication.publishDue"), false);
  set["scheduled-publish"].wake = T;   /* an instant in ms reads the same */
  const r = await s.onAlarm(T);
  assert.equal(resolved, true, "the publisher's answer awaited inside the alarm");
  assert.deepEqual(r.scheduledpublish, taken);
  assert.deepEqual(calls.filter(([m]) => m === "publication.publishDue"), [["publication.publishDue", "2026-10-01T12:00:00.000Z"]]);
  set["scheduled-publish"].wake = null;
  const after = await s.onAlarm(T + 1000);
  assert.equal("scheduledpublish" in after, false);
  assert.deepEqual([after.nextAt, st.alarm], [null, null], "nothing waiting: no wake (R15)");
});

test("R22, R1: a firing inside the grace before the set time runs the tick, takes nothing, and the reconcile re-arms at the time; the edition is never taken before it", async () => {
  const T = Date.parse("2026-10-01T12:00:00Z");
  /* publication R67, played: takes only what is due at or before now */
  const waiting = [T];
  const { s, st, calls } = world({ "scheduled-publish": { wake: () => waiting[0] ?? null,
    tick: (now) => { const n = Date.parse(now); const t = waiting.filter((w) => w <= n); waiting.splice(0, t.length); return { ok: true, taken: t }; } } });
  const early = await s.onAlarm(T - 200);
  assert.deepEqual(early.scheduledpublish, { ok: true, taken: [] }, "ticked within the grace, took nothing");
  assert.equal(calls.find(([m]) => m === "publication.publishDue")[1], iso(T - 200), "told the firing instant, not the set time");
  assert.deepEqual([early.nextAt, st.alarm], [T, T], "re-armed at the time");
  const due = await s.onAlarm(T);
  assert.deepEqual(due.scheduledpublish.taken, [T]);
  assert.equal(st.alarm, null);
});

test("R22, R11: an edition whose time passed while no alarm fired is taken at the next firing: the start re-derives the alarm from publishWake", async () => {
  const T = Date.parse("2026-10-01T12:00:00Z");
  const waiting = [T];
  const { s, st } = world({ "scheduled-publish": { wake: () => waiting[0] ?? null,
    tick: (now) => ({ ok: true, taken: waiting.splice(0, waiting.filter((w) => w <= Date.parse(now)).length) }) } });
  assert.equal(st.alarm, null, "the alarm was lost");
  assert.equal(await s.start(T + 3_600_000), T, "the start sets it at the passed time, so it fires at once");
  const r = await s.onAlarm(T + 3_600_005);
  assert.deepEqual(r.scheduledpublish.taken, [T], "taken late, at the next firing");
});

test("R22, R3, R15: an edition still waiting after a tick at or past its time wants no wake until publication's next notice or the next start, so the alarm never spins; a throwing tick is answered under its key", async () => {
  const T = Date.parse("2026-10-01T12:00:00Z");
  const { s, st, set } = world({ "scheduled-publish": { wake: T, tick: { ok: true, taken: [] } } });
  const heard = [];
  s.listenTo({ publication: { onPublishScheduled: (module, fn) => { heard.push(fn); return { ok: true, module }; } } });
  const r = await s.onAlarm(T + 10);
  assert.deepEqual(r.scheduledpublish, { ok: true, taken: [] });
  assert.deepEqual([r.nextAt, st.alarm], [null, null], "held: no alarm in the past");
  assert.equal("scheduledpublish" in (await s.onAlarm(T + 20)), false, "not due again while held");
  assert.equal(await heard[0]({ publishAt: iso(T) }), T, "publication's notice releases it");
  assert.equal(await s.start(T + 30), T, "so does the next start");
  set["scheduled-publish"].throws = "tick";
  const broke = await s.onAlarm(T + 40);
  assert.deepEqual(broke.scheduledpublish, { error: "scheduled-publish tick broke" });
  assert.deepEqual([broke.nextAt, st.alarm], [null, null], "a tick that threw holds the time too");
});

/* ---- R9, R22: publication's notice ---- */

test("R9, R22, R17: it registers once with publication's onPublishScheduled; a set or a move arms the alarm at once, a cancel arms nothing new; the notice runs no tick and writes nothing but the alarm", async () => {
  const T = Date.parse("2026-10-01T12:00:00Z"), LATER = T + 7 * 86_400_000;
  /* another consumer wants a later wake, so a cancel is seen to leave the alarm where it was */
  const { s, st, calls, set } = world({ "scheduled-publish": { wake: null }, "dated-waits": { wake: iso(LATER) } });
  const heard = [];
  const out = s.listenTo({ publication: { onPublishScheduled: (module, fn) => { heard.push({ module, fn }); return { ok: true, module }; } } });
  assert.deepEqual(out.publication, { ok: true, module: "scheduler" });
  assert.deepEqual(heard.map((h) => h.module), ["scheduler"]);
  st.log.length = 0;
  set["scheduled-publish"].wake = iso(T);   /* set to wait (publication R66) */
  assert.equal(await heard[0].fn({ publishAt: iso(T) }), T);
  assert.equal(st.alarm, T);
  set["scheduled-publish"].wake = iso(T - 3_600_000);   /* moved earlier (R68) */
  await heard[0].fn({ publishAt: iso(T - 3_600_000) });
  assert.equal(st.alarm, T - 3_600_000);
  set["scheduled-publish"].wake = null;   /* cancelled: arms nothing new (R4) */
  const n = writes(st).length;
  await heard[0].fn({ publishAt: null });
  assert.equal(writes(st).length, n, "a cancel leaves the alarm where it was, never pushed later");
  assert.equal(st.alarm, T - 3_600_000);
  const fired = await s.onAlarm(T - 3_600_000);
  assert.deepEqual([fired.nextAt, "scheduledpublish" in fired], [LATER, false], "the next reconcile drops the wake no one wants (R15)");
  assert.deepEqual(writes(st).map(([m]) => m), ["setAlarm", "setAlarm", "setAlarm"], "only the alarm is written");
  /* with nothing else wanting one, a cancel's reconcile leaves no alarm at all (R4) */
  set["dated-waits"].wake = null;
  await heard[0].fn({ publishAt: null });
  assert.equal(st.alarm, null);
  assert.equal(calls.some(([m]) => m === "publication.publishDue"), false, "no tick ran");
});

test("R22, R1: a take's notice arrives inside the scheduled-publish tick and arms nothing there: onAlarm's authoritative reconcile stands", async () => {
  const T = Date.parse("2026-10-01T12:00:00Z"), NEXT = T + 86_400_000;
  const waiting = [T, NEXT];
  let fn = null;
  const { s, st } = world({ "scheduled-publish": { wake: () => waiting[0] ?? null,
    tick: async () => { waiting.shift(); const told = fn({ publishAt: iso(waiting[0]) }); await settle();
                        return { ok: true, taken: [T], told: told ?? null }; } } });
  s.listenTo({ publication: { onPublishScheduled: (module, f) => { fn = f; return { ok: true, module }; } } });
  st.log.length = 0;
  const r = await s.onAlarm(T);
  assert.equal(r.scheduledpublish.told, null, "the notice inside the tick arms nothing");
  assert.equal(st.log.filter(([m]) => m === "getAlarm").length, 0, "no arm's reconcile ran beside the firing's");
  assert.deepEqual([r.nextAt, st.alarm], [NEXT, NEXT], "the firing's reconcile set the next edition's time");
});

/* ---- R23: answers' notice ---- */

test("R23, R17: it registers once with answers' onStandingSet; a question set re-arms the standing questions' wake at once; one ended arms nothing new; the notice writes nothing but the alarm", async () => {
  const W = Date.parse("2026-10-05T07:00:00Z"), LATER = W + 7 * 86_400_000;
  const { s, st, calls, set } = world({ "standing-questions": { due: 0, wake: null }, "dated-waits": { wake: iso(LATER) } });
  const heard = [];
  const out = s.listenTo({ answers: { onStandingSet: (module, fn) => { heard.push({ module, fn }); return { ok: true, module }; } } });
  assert.deepEqual(out.answers, { ok: true, module: "scheduler" });
  set["standing-questions"].wake = iso(W);
  assert.equal(await heard[0].fn({ question: "STQ-1", due: "2026-10-05" }), W);
  assert.equal(st.alarm, W);
  set["standing-questions"].wake = null;
  const n = writes(st).length;
  await heard[0].fn({ question: "STQ-1", due: null });
  assert.equal(writes(st).length, n, "ended: nothing new armed, the alarm never pushed later");
  assert.equal((await s.onAlarm(W)).nextAt, LATER, "the next reconcile drops the wake no one wants (R15)");
  assert.equal(calls.some(([m]) => m === "answers.standingTick"), false, "no tick ran");
  assert.deepEqual(st.log.filter(([m]) => m === "put"), [], "nothing but the alarm written");
});

test("R23, R9: a refused registration is a start-up fault, reported by faults() and never ignored; registrations that stood leave none", () => {
  const { s } = world();
  const refusal = { ok: false, reason: "LISTENER_DECLARED", detail: "scheduler has already registered its listener" };
  const out = s.listenTo({ answers: { onStandingSet: () => refusal },
                           publication: { onPublishScheduled: (module) => ({ ok: true, module }) } });
  assert.deepEqual(out.answers, refusal, "the owner's answer, as given");
  assert.deepEqual(s.faults(), [{ notice: "answers", reason: "LISTENER_DECLARED", detail: refusal.detail }]);
  assert.deepEqual(world().s.faults(), [], "none listened: none refused");
});

/* ---- R9: the daily consumers' notices ---- */

const NOTICES = [
  ["duties' onDutyTracked (its R26)", "duties", "onDutyTracked", "duty-transitions", { duty: "DUT-2026-0001" }],
  ["people's onChecksChanged (its R35)", "people", "onChecksChanged", "interest-checks", { check: "CHK-2026-0001", project: null }],
  ["money-checks' onDetectorSwitchedOn (its R16)", "moneyChecks", "onDetectorSwitchedOn", "money-detectors", { detector_id: "D1", project: "P" }],
];

test("R9, R21, R17: a duty tracked, a check changed, a detector switched on asks its daily consumer for a pass at once, though the day's pass ran or found nothing; the notice runs no pass and writes nothing but the alarm; the pass runs at the next firing", async () => {
  for (const [what, owner, method, name, payload] of NOTICES) {
    const { s, st, calls } = world({ [name]: {} }, null, { zone: LA });
    const heard = [];
    const out = s.listenTo({ [owner]: { [method]: (module, fn) => { heard.push({ module, fn }); return { ok: true, module }; } } });
    assert.deepEqual(out[owner], { ok: true, module: "scheduler" }, what);
    const first = await s.onAlarm(NOW);
    assert.ok(SCHEDULER_KEYS[name] in first, `${what}: the day's pass ran`);
    assert.equal(st.alarm, null, `${what}: it found nothing, so no wake`);
    const passes = () => calls.filter(([m]) => m.startsWith(`${owner}.`)).length;
    const ran = passes();
    st.log.length = 0;
    const t0 = Date.now();
    const armed = await heard[0].fn(payload);
    assert.ok(armed >= t0 && armed <= Date.now(), `${what}: armed at once (${armed})`);
    assert.equal(st.alarm, armed);
    assert.equal(passes(), ran, `${what}: no pass ran on the notice`);
    assert.deepEqual(writes(st).map(([m]) => m), ["setAlarm"], `${what}: only the alarm written`);
    const again = await s.onAlarm(NOW + 60_000);
    assert.ok(SCHEDULER_KEYS[name] in again, `${what}: the next firing runs the pass, the same local day`);
    assert.equal(again[SCHEDULER_KEYS[name]].local_day.date, "2026-09-28");
    assert.equal(st.alarm, null, `${what}: done, and nothing found: no wake again`);
    assert.equal(SCHEDULER_KEYS[name] in (await s.onAlarm(NOW + 120_000)), false, `${what}: asked once`);
  }
});

/* ---- against the real owners: the act driven, the alarm read ---- */

test("R22, R9: against the real publication, an edition set to wait arms the alarm at its time; a firing in the grace before it takes nothing; the firing at it publishes through the registered publisher; a move and a cancel re-arm through onPublishScheduled", async () => {
  const w = publicationWorld();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const F = "INQ-2026-0001";
  w.inquiry(F);
  const roles = [{ target: F, version_sha: w.head(F) }];
  for (const c of ["CASE-2026-0001", "CASE-2026-0002"]) w.prepare(c, 1, { project: proj, roles });
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);   /* America/Halifax */
  const docOf = (c) => w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, c).doc_sha;
  const schedule = (c, at) => w.record.transact(() => w.p.scheduleEdition({ case: c, edition: 1, docSha: docOf(c),
    signature: SIG(1), signer: "olive", deliveredBy: PV("olive"), at, checked: { sources: [], ties: [], holds: [] }, by: PV("olive") }));
  /* ratification's publisher, played: commits through publication R22 as its R42 commits */
  w.p.registerScheduledPublisher("ratification", { publishScheduled: async (entry, now) => {
    await settle();   /* answering asynchronously (K1832) */
    const r = w.record.transact(() => w.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj,
      scope: "The question.", roster: roles.map((x) => ({ bundle_id: x.target, version_sha: x.version_sha, role: "load_bearing" })),
      sigArmored: entry.signature, attestorKey: KEY, attestorMember: entry.signer, gateVersion: "plane-gate/test",
      deliveredBy: entry.delivered_by, at: now }));
    return r.ok ? { published: true, published_at: now } : { stopped: [{ code: r.reason, translation: "no" }] };
  } });
  const st = storage();
  const s = new Scheduler({ storage: st, owners: { publication: () => w.p } });
  assert.deepEqual(s.listenTo({ publication: w.p }).publication, { ok: true, module: "scheduler" });
  assert.deepEqual(s.faults(), []);
  const T1 = Date.parse("2026-10-01T12:00:00Z"), T2 = Date.parse("2026-10-02T12:00:00Z");   /* 09:00 in Halifax */
  assert.equal(schedule("CASE-2026-0001", { date: "2026-10-01", time: "09:00" }).ok, true);
  await settle();
  assert.equal(st.alarm, T1, "armed at the set time once the transaction returned");
  assert.equal(schedule("CASE-2026-0002", { date: "2026-10-03", time: "09:00" }).ok, true);
  await settle();
  assert.equal(st.alarm, T1, "a later set time never pushes the alarm later");
  assert.equal(w.p.publishAtMove({ case: "CASE-2026-0002", edition: 1, at: { date: "2026-10-01", time: "08:00" }, by: PV("olive") }).ok, true);
  await settle();
  assert.equal(st.alarm, T1 - 3_600_000, "moved earlier: re-armed at once");
  assert.equal(w.p.publishAtMove({ case: "CASE-2026-0002", edition: 1, at: { date: "2026-10-02", time: "09:00" }, by: PV("olive") }).ok, true);
  await settle();
  assert.equal(st.alarm, T1 - 3_600_000, "moved later: an arm never pushes the alarm later");
  const early = await s.onAlarm(T1 - 100);
  assert.deepEqual(early.scheduledpublish, { ok: true, taken: [] }, "inside the grace, before its time: nothing taken");
  assert.equal(st.alarm, T1, "re-armed at the time");
  const due = await s.onAlarm(T1);
  assert.deepEqual(due.scheduledpublish.taken.map((x) => [x.case, x.state]), [["CASE-2026-0001", "published"]]);
  assert.equal(st.alarm, T2, "the next waiting edition's time");
  assert.equal(w.p.publishAtCancel({ case: "CASE-2026-0002", edition: 1, by: PV("olive") }).ok, true);
  await settle();
  assert.equal(st.alarm, null, "a cancel arms nothing new; nothing waits, so its reconcile leaves no alarm (R4, R15)");
});

test("R23: against the real answers, a standing question set arms the alarm at the standing questions' wake through onStandingSet; ended, the next reconcile holds none", async () => {
  const w = answersWorld();
  const st = storage();
  const s = new Scheduler({ storage: st, owners: { answers: () => w.a } });
  assert.deepEqual(s.listenTo({ answers: w.a }).answers, { ok: true, module: "scheduler" });
  assert.equal(await s.arm(), null, "no question: no alarm");
  const q = w.a.standingQuestionSet({ author: AV("bob"), question: "Anything new on the budget?", query: "title:budget",
                                      cadence: "daily", ends: "2099-12-31" });
  assert.equal(q.ok, true, JSON.stringify(q));
  await settle();
  assert.notEqual(st.alarm, null, "armed at once, without waiting for a firing");
  assert.equal(await s.arm(), st.alarm, "at the standing questions' own wake");
  assert.equal(w.a.standingQuestionEnd({ id: q.id, author: AV("bob") }).ok, true);
  await settle();
  assert.equal(await s.start(), null, "ended: the next reconcile drops the wake");
});

test("R9, R21: against the real duties, people and money-checks, each act its owner tells of arms the alarm at once, and the next firing runs its consumer's pass the same local day", async () => {
  const cases = [
    ["a duty declared (duties R26)", "duties", "dutytransitions", () => { const w = dutiesWorld(); return { o: w.duties, act: () => w.declare() }; }],
    ["a check switched in a project (people R35)", "people", "interestchecks", () => {
      const w = peopleWorld();
      const proj = w.project();
      const rd = w.p.listChecks({ viewer: ANN }).checks.find((c) => c.machine && c.name === "revolving door");
      return { o: w.p, act: () => w.p.switchCheck({ check: rd.check, project: proj, on: false, by: ANN }) };
    }],
    ["a detector switched on (money-checks R16)", "moneyChecks", "moneydetectors", () => {
      const w = moneyWorld();
      const P = "PROJ-2026-0001-alpha";
      w.project(P, ["alice", "bob"]);
      const d = w.c.defineDetector(shareDetector());
      return { o: w.c, act: () => w.c.switchDetector({ detectorId: d.detector_id, project: P, on: true, by: ALICE }) };
    }],
  ];
  for (const [what, owner, key, make] of cases) {
    const { o, act } = make();
    const st = storage();
    const s = new Scheduler({ storage: st, owners: { [owner]: () => o }, zone: () => LA });
    const out = s.listenTo({ [owner]: o });
    assert.deepEqual([out[owner].ok, s.faults()], [true, []], what);
    const first = await s.onAlarm(Date.now());
    assert.ok(key in first, `${what}: the day's pass ran`);
    const before = st.alarm;
    const t0 = Date.now();
    const r = act();
    assert.equal(r.ok, true, `${what}: ${JSON.stringify(r).slice(0, 300)}`);
    await settle();
    assert.ok(st.alarm !== null && st.alarm >= t0 && st.alarm <= Date.now(), `${what}: armed at once (${st.alarm}; was ${before})`);
    const next = await s.onAlarm(Date.now());
    assert.ok(key in next, `${what}: the next firing runs the pass`);
    assert.equal(next[key].local_day.date, first[key].local_day.date, `${what}: the same local day`);
  }
});
