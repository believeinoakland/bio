/* escalation: the opening reason (R1) and the attachment reason (R9) (DEC-88, DEC-89 (1)); the decline to escalate
   (R27) and the determination's status, escalated, declined or neither (R28) (DEC-89 (2); K1019); the decline's own
   machine row. Each driven at the module's interface, with negative controls. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, storage, V, MACHINE } from "./fixture.mjs";
import { ESCALATION_CHECKS, ESCALATION_SCHEMA, escalationOf } from "../../../src/escalation/index.mjs";
import { noSuchDetermination, determinationSuperseded } from "../../../src/conformance/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";

/* A reason absent, not a string, blank, only whitespace, and one of 2,001 characters (trimmed). */
const BAD = [undefined, null, 7, ["a"], "", "   ", "\n\t ", "x".repeat(2001), `  ${"x".repeat(2001)}  `];
const NO_REASON = ESCALATION_CHECKS.ESCALATION_NO_REASON;
const refusedNoReason = (r, why) =>
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "ESCALATION_NO_REASON", "ESCALATION_NO_REASON",
                   NO_REASON.check, NO_REASON.translation], why);
const omit = (o, k) => { const { [k]: _, ...rest } = o; return rest; };

test("R1 the author's reason is required, refused ESCALATION_NO_REASON second in R1's order (after MACHINE_CANNOT_OPEN, before the determination is read) when absent, not a string, blank, only whitespace or over 2,000 characters, with nothing written and the next ESC- id unchanged; R19's judged input keeps its place; a reasoned opening records the reason with who and when and reads it back", () => {
  const w = seeded();
  const ok = { determination: w.D, reason: "The office closed the park without notice.", author: V("bob"), viewer: V("bob") };
  const before = w.snapshot();
  const reads = w.calls.determinationRead.length;
  for (const reason of BAD) {
    refusedNoReason(w.esc.escalationOpen({ ...ok, reason }), JSON.stringify(reason)?.slice(0, 20));
    /* before every condition on the determination: absent, unseen, superseded, not noncompliant, not joined */
    refusedNoReason(w.esc.escalationOpen({ ...ok, reason, determination: "CONF-2026-0404-none" }), "absent determination");
    refusedNoReason(w.esc.escalationOpen({ ...ok, reason, author: V("carol"), viewer: V("carol") }), "unseen determination");
  }
  refusedNoReason(w.esc.escalationOpen(omit(ok, "reason")), "no reason key");
  assert.equal(w.calls.determinationRead.length, reads, "the determination is never read when the reason is refused");
  /* the machine is still refused first; R19's judged input is refused after it and before the reason */
  assert.equal(w.esc.escalationOpen({ ...ok, reason: "", author: MACHINE }).reason, "MACHINE_CANNOT_OPEN");
  assert.equal(w.esc.escalationOpen({ ...ok, reason: "", severity: "high" }).reason, "ESCALATION_CARRIES_NO_JUDGMENT");
  assert.deepEqual(w.snapshot(), before, "no escalation, no history entry, nothing written");
  assert.equal(w.count("escalations"), 0);
  /* the reason is asked before the determination's own conditions, which follow in R1's order */
  assert.equal(w.esc.escalationOpen({ ...ok, determination: "CONF-2026-0404-none" }).reason, "NO_SUCH_DETERMINATION");
  /* a reasoned opening: the first id allocated, so no refusal consumed one */
  w.clock.now = "2026-09-28T02:00:00Z";
  const r = w.esc.escalationOpen({ ...ok, reason: `  ${ok.reason}  ` });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.id, "ESC-2026-0001-escalation", "the next ESC- id is unchanged by every refusal before it");
  assert.deepEqual([r.reason, r.opened_by, r.at], [ok.reason, V("bob"), "2026-09-28T02:00:00Z"], "kept trimmed");
  const read = w.esc.escalationRead({ id: r.id, viewer: V("alice") });
  assert.deepEqual([read.opened_reason, read.opened_by, read.opened_at], [ok.reason, V("bob"), "2026-09-28T02:00:00Z"]);
  assert.deepEqual(read.history.map((h) => [h.kind, h.reason, h.author, h.at]), [["open", ok.reason, V("bob"), "2026-09-28T02:00:00Z"]]);
  assert.deepEqual(w.esc.escalationsFor({ determination: w.D, viewer: V("bob") }).items.map((x) => x.reason), [ok.reason]);
  /* 2,000 characters land */
  const D2 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  assert.equal(w.esc.escalationOpen({ ...ok, determination: D2, reason: "r".repeat(2000) }).ok, true);
});

test("R9 escalationAttach requires the attacher's reason, refused ESCALATION_NO_REASON after MACHINE_CANNOT_ATTACH and before NO_SUCH_ESCALATION, with nothing written; the reason is recorded with the attachment, who and when, and read back in the escalation's actions and history", () => {
  const w = seeded();
  toStage(w, 2);
  const a = w.action({ project: w.P, restsOn: [w.D] });
  const ok = { id: w.E, action: a, reason: "The second notice, to the deputy.", author: V("bob"), viewer: V("bob") };
  const before = w.snapshot();
  for (const reason of BAD) {
    refusedNoReason(w.esc.escalationAttach({ ...ok, reason }), JSON.stringify(reason)?.slice(0, 20));
    /* before the escalation is read: absent and unseen alike */
    refusedNoReason(w.esc.escalationAttach({ ...ok, reason, id: "ESC-2026-0999-escalation" }), "absent escalation");
    refusedNoReason(w.esc.escalationAttach({ ...ok, reason, author: V("carol"), viewer: V("carol") }), "unseen escalation");
    refusedNoReason(w.esc.escalationAttach({ ...ok, reason, action: "ACTN-2026-0999-none" }), "absent action");
  }
  refusedNoReason(w.esc.escalationAttach(omit(ok, "reason")), "no reason key");
  assert.equal(w.esc.escalationAttach({ ...ok, reason: "", author: MACHINE }).reason, "MACHINE_CANNOT_ATTACH", "the machine first");
  assert.deepEqual(w.snapshot(), before, "no attachment, no history entry");
  /* negative control: with a reason, the conditions after it answer in their order */
  assert.equal(w.esc.escalationAttach({ ...ok, id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  w.clock.now = "2026-09-28T03:00:00Z";
  const r = w.esc.escalationAttach(ok);
  assert.deepEqual([r.ok, r.reason, r.author, r.at], [true, ok.reason, V("bob"), "2026-09-28T03:00:00Z"]);
  const read = w.esc.escalationRead({ id: w.E, viewer: V("alice") });
  const item = read.actions.find((x) => x.action === a);
  assert.deepEqual([item.reason, item.attached_by, item.at], [ok.reason, V("bob"), "2026-09-28T03:00:00Z"]);
  const h = read.history.filter((x) => x.kind === "attach").at(-1);
  assert.deepEqual([h.action, h.reason, h.author, h.at], [a, ok.reason, V("bob"), "2026-09-28T03:00:00Z"]);
  /* stage 7 records its purpose and standards beside the reason */
  const x = seeded();
  toStage(x, 7);
  const t = x.action({ project: x.P, restsOn: [x.D] });
  const s7 = x.esc.escalationAttach({ id: x.E, action: t, purpose: "testimony", standards: ["STD-2026-0001-a"], reason: "Testify.",
                                      author: V("bob"), viewer: V("bob") });
  assert.deepEqual([s7.ok, s7.purpose, s7.reason], [true, "testimony", "Testify."]);
  assert.equal(x.esc.escalationRead({ id: x.E, viewer: V("bob") }).actions.find((y) => y.action === t).reason, "Testify.");
});

test("R1 R9 a store written before the reasons is migrated forward: escalations and escalation_attachments gain their reason columns, an earlier row reads none, a later act records its reason, and migrating again changes nothing", () => {
  const st = storage();
  const host = { storage: st };
  for (const t of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) st.db.exec(t);
  /* the tables as they stood before DEC-88 and DEC-89: without opened_reason and without the attachment's reason */
  const old = ESCALATION_SCHEMA.replace(/^\s*opened_reason\s+TEXT,\n/m, "").replace(/^\s*reason\s+TEXT,\n(?=\s*author\s+TEXT NOT NULL,\n\s*at\s+TEXT NOT NULL\n\);\nCREATE INDEX IF NOT EXISTS escalation_attachments)/m, "");
  assert.notEqual(old, ESCALATION_SCHEMA);
  for (const t of old.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) st.db.exec(t);
  const cols = (t) => [...st.sql.exec(`PRAGMA table_info(${t})`)].map((c) => c.name);
  assert.ok(!cols("escalations").includes("opened_reason"));
  assert.ok(!cols("escalation_attachments").includes("reason"));
  st.db.exec(`INSERT INTO escalations (escalation_id, project_id, determination_id, act_id, standards_json, state, stage, stage_since,
              state_since, opened_by, opened_at, log_len) VALUES ('ESC-2026-0001-escalation', 'P', 'D', null, '[]', 'open', 2, 't', 't', 'member:bob', 't', 3)`);
  st.db.exec(`INSERT INTO escalation_attachments (action_id, escalation_id, seq, stage, purpose, standards_json, author, at)
              VALUES ('ACTN-1', 'ESC-2026-0001-escalation', 3, 2, null, null, 'member:bob', 't')`);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership });
  const esc = escalationOf(host, { record, membership, promotion });
  assert.ok(cols("escalations").includes("opened_reason"));
  assert.ok(cols("escalation_attachments").includes("reason"));
  assert.deepEqual([...st.sql.exec(`SELECT opened_reason FROM escalations`)], [{ opened_reason: null }], "an earlier row reads none");
  assert.deepEqual([...st.sql.exec(`SELECT reason FROM escalation_attachments`)], [{ reason: null }]);
  esc.migrate();
  assert.deepEqual(cols("escalations").filter((c) => c === "opened_reason"), ["opened_reason"], "added once");
  /* a later act on a migrated store records its reason */
  const w = seeded();
  opened(w);
  assert.equal(w.rows(`SELECT opened_reason FROM escalations`)[0].opened_reason, "Worth pursuing.");
});

test("R27 declineToEscalate is refused exactly as R1 refuses an opening, in R1's order, MACHINE_CANNOT_DECLINE_TO_ESCALATE in place of MACHINE_CANNOT_OPEN, so none is recorded while an escalation of the determination is open or suspended (ALREADY_OPEN); otherwise it records the decline with its reason, who and when; a later decline supersedes it and both stay readable; any joined member who may open may decline", () => {
  const w = seeded();
  w.member("dave");
  w.join(w.P, "dave", "invited");
  const ok = { determination: w.D, reason: "We have no capacity this quarter.", author: V("bob"), viewer: V("bob") };
  const decline = (x) => w.esc.declineToEscalate({ ...ok, ...x });
  const open = (x) => w.esc.escalationOpen({ ...ok, reason: "Pursue it.", ...x });
  const before = w.snapshot();
  /* each of R1's arms, in R1's order, each answered as the opening answers it (its machine code aside) */
  for (const author of ["", "  ", MACHINE, "token:run-1", "ai", undefined]) {
    const r = decline({ author, determination: "CONF-none", reason: "" });
    assert.equal(r.reason, "MACHINE_CANNOT_DECLINE_TO_ESCALATE", String(author));
    assert.equal(open({ author, determination: "CONF-none", reason: "" }).reason, "MACHINE_CANNOT_OPEN");
  }
  assert.equal(decline({ reason: "", rank: 1 }).reason, "ESCALATION_CARRIES_NO_JUDGMENT");
  for (const reason of BAD) refusedNoReason(decline({ reason, determination: "CONF-none" }), JSON.stringify(reason)?.slice(0, 20));
  const absent = decline({ determination: "CONF-2026-0404-none" });
  assert.deepEqual(absent, noSuchDetermination("CONF-2026-0404-none"));
  assert.deepEqual(absent, open({ determination: "CONF-2026-0404-none" }));
  assert.deepEqual(decline({ author: V("carol"), viewer: V("carol") }), noSuchDetermination(w.D), "unseen answers as absent");
  assert.deepEqual(decline({ determination: undefined }), noSuchDetermination(null));
  const S = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }], supersededBy: "CONF-x" });
  assert.deepEqual(decline({ determination: S }), determinationSuperseded(S, null));
  assert.deepEqual(decline({ determination: S }), open({ determination: S }));
  const C = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "compliant" }] });
  const nn = decline({ determination: C });
  assert.deepEqual([nn.reason, nn.check], ["NOT_NONCOMPLIANT", "C-116.5"]);
  const np = decline({ author: V("dave"), viewer: V("dave") });
  assert.deepEqual([np.reason, np.check, np.project], ["ESCALATION_NOT_A_PARTICIPANT", "C-116.6", w.P]);
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
  /* recorded: who, when, why; then a second by another member supersedes it, both readable */
  w.clock.now = "2026-09-28T02:00:00Z";
  const d1 = decline({ reason: `  ${ok.reason} ` });
  assert.deepEqual([d1.ok, d1.id, d1.determination, d1.reason, d1.author, d1.at],
                   [true, `${w.D}/decline-to-escalate#1`, w.D, ok.reason, V("bob"), "2026-09-28T02:00:00Z"]);
  w.clock.now = "2026-09-28T03:00:00Z";
  const d2 = decline({ reason: "Still no capacity.", author: V("alice"), viewer: V("alice") });
  assert.equal(d2.id, `${w.D}/decline-to-escalate#2`);
  const s = w.esc.escalationStatus({ determination: w.D, viewer: V("bob") });
  assert.deepEqual(s.declines.map((x) => [x.id, x.reason, x.author, x.at, x.superseded_by]), [
    [d1.id, ok.reason, V("bob"), "2026-09-28T02:00:00Z", d2.id],
    [d2.id, "Still no capacity.", V("alice"), "2026-09-28T03:00:00Z", null]]);
  /* an opening supersedes the latest decline; while it is open or suspended no decline is recorded */
  w.clock.now = "2026-09-28T04:00:00Z";
  const o = open();
  assert.equal(o.ok, true);
  const held = w.snapshot();
  const ao = decline({});
  assert.deepEqual([ao.reason, ao.check, ao.escalation], ["ALREADY_OPEN", "C-116.7", o.id]);
  assert.equal(w.esc.escalationSuspend({ id: o.id, reason: "Hold.", author: V("bob"), viewer: V("bob") }).ok, true);
  const held2 = w.snapshot();
  assert.equal(decline({}).reason, "ALREADY_OPEN", "a suspended escalation is still the determination's one");
  assert.deepEqual(w.snapshot(), held2);
  void held;
  /* the opening's ALREADY_OPEN is the same row */
  assert.equal(open().check, "C-116.7");
});

test("R28 escalationStatus answers neither, then declined, then escalated after a later opening, then declined after that escalation ends and a later decline; with every escalation (as R22) and every decline (reason, who, when, what superseded it), oldest first; an absent or invisible determination answers NO_SUCH_DETERMINATION, naming nothing of it; it writes nothing", () => {
  const w = seeded();
  const status = (viewer = V("bob")) => w.esc.escalationStatus({ determination: w.D, viewer });
  const actOf = w.determinations.get(w.D).act.id;
  let s = status();
  assert.deepEqual([s.ok, s.determination, s.status, s.escalations, s.declines], [true, w.D, "neither", [], []]);
  w.clock.now = "2026-09-20T00:00:00Z";
  const d1 = w.esc.declineToEscalate({ determination: w.D, reason: "Not yet.", author: V("bob"), viewer: V("bob") });
  s = status();
  assert.equal(s.status, "declined");
  assert.deepEqual(s.declines.map((x) => [x.id, x.superseded_by]), [[d1.id, null]]);
  /* a later opening: escalated, and the decline names it as what superseded it */
  w.clock.now = "2026-09-20T00:00:00Z";
  const o = w.esc.escalationOpen({ determination: w.D, reason: "Now.", author: V("alice"), viewer: V("alice") });
  s = status();
  assert.equal(s.status, "escalated", "the opening is later, even within the same second");
  assert.deepEqual(s.escalations.map((x) => [x.id, x.state, x.stage, x.opened_by, x.reason]), [[o.id, "open", 1, V("alice"), "Now."]]);
  assert.deepEqual(s.escalations, w.esc.escalationsFor({ determination: w.D, viewer: V("bob") }).items, "every escalation as R22");
  assert.deepEqual(s.declines.map((x) => [x.id, x.superseded_by]), [[d1.id, o.id]]);
  /* that escalation ends by R14's conditions; a later decline: declined again */
  w.determine({ project: w.P, act: actOf, at: "2026-09-21T00:00:00Z", outcomes: [{ standard: "STD-2026-0001-a", outcome: "compliant" },
    { standard: "STD-2026-0002-b", outcome: "compliant" }] });
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  w.clock.now = "2026-09-22T00:00:00Z";
  assert.equal(w.esc.escalationEnd({ id: o.id, author: V("bob"), viewer: V("bob") }).ok, true);
  assert.equal(status().status, "escalated", "an ended escalation is still the latest act until a decline follows");
  w.clock.now = "2026-09-22T00:00:00Z";
  const d2 = w.esc.declineToEscalate({ determination: w.D, reason: "Restored; nothing more to do.", author: V("bob"), viewer: V("bob") });
  assert.equal(d2.ok, true, JSON.stringify(d2).slice(0, 300));
  const snap = w.snapshot();
  s = status();
  assert.deepEqual(w.snapshot(), snap, "the read writes nothing");
  assert.equal(s.status, "declined");
  assert.deepEqual(s.escalations.map((x) => [x.id, x.state]), [[o.id, "ended"]]);
  assert.deepEqual(s.declines.map((x) => [x.id, x.reason, x.author, x.at, x.superseded_by]), [
    [d1.id, "Not yet.", V("bob"), "2026-09-20T00:00:00Z", o.id],
    [d2.id, "Restored; nothing more to do.", V("bob"), "2026-09-22T00:00:00Z", null]]);
  /* a superseded determination still answers its status */
  w.supersede(w.D);
  assert.equal(status().status, "declined");
  /* absent, invisible and unnamed: conformance's one answer, naming nothing of it */
  const unseen = status(V("carol"));
  assert.deepEqual(unseen, noSuchDetermination(w.D));
  assert.deepEqual(w.esc.escalationStatus({ determination: "CONF-2026-0999-none", viewer: V("bob") }), noSuchDetermination("CONF-2026-0999-none"));
  assert.deepEqual(w.esc.escalationStatus({ viewer: V("bob") }), noSuchDetermination(null));
  for (const x of [d1.id, d2.id, o.id, "Not yet.", "Restored", "Now."]) assert.ok(!JSON.stringify(unseen).includes(x), x);
  /* another determination's escalations and declines are not among them */
  const D2 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  assert.equal(w.esc.declineToEscalate({ determination: D2, reason: "Other.", author: V("bob"), viewer: V("bob") }).ok, true);
  assert.deepEqual(status().declines.map((x) => x.id), [d1.id, d2.id]);
  assert.deepEqual(w.esc.escalationStatus({ determination: D2, viewer: V("bob") }).declines.map((x) => x.reason), ["Other."]);
  /* a provider absent answers PROVIDER_UNAVAILABLE, never neither */
  delete w.esc.deps.conformance;
  assert.deepEqual([status().reason, status().provider], ["PROVIDER_UNAVAILABLE", "conformance"]);
  assert.equal(w.esc.declineToEscalate({ determination: w.D, reason: "x", author: V("bob"), viewer: V("bob") }).reason, "PROVIDER_UNAVAILABLE");
});

test("R27 R17 MACHINE_CANNOT_DECLINE_TO_ESCALATE is its own row, C-116.46, minted in declineToEscalate, with its own translation; C-116.26's MACHINE_CANNOT_DECLINE (R13's edge decline) is unchanged and answers only the edge decline", () => {
  const row = ESCALATION_CHECKS.MACHINE_CANNOT_DECLINE_TO_ESCALATE;
  assert.deepEqual([row.check, row.where], ["C-116.46", "src/escalation/index.mjs declineToEscalate > is-decline-member"]);
  assert.match(row.translation, /member's act/);
  assert.match(row.translation, /Nothing was written\.$/);
  assert.equal(ESCALATION_CHECKS.MACHINE_CANNOT_DECLINE.check, "C-116.26");
  assert.equal(Object.values(ESCALATION_CHECKS).filter((r) => r.check === "C-116.46").length, 1);
  const w = seeded();
  const r = w.esc.declineToEscalate({ determination: w.D, reason: "No.", author: MACHINE, viewer: V("bob") });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MACHINE_CANNOT_DECLINE_TO_ESCALATE",
                   "MACHINE_CANNOT_DECLINE_TO_ESCALATE", "C-116.46", row.translation]);
  opened(w);
  assert.equal(w.esc.escalationDecline({ id: w.E, to: 2, reason: "No.", author: MACHINE, viewer: V("bob") }).check, "C-116.26");
});
