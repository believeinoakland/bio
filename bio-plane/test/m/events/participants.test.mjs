/* events: participants (R11–R13) and a member's merges and splits (R14), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, testView, MEMBER, MACHINE } from "./fixture.mjs";
import { ROLES } from "../../../src/events/index.mjs";

const doc = { kind: "document" };

test("R11 addParticipant refuses in order NO_SUCH_EVENT, NO_ENTITY/NO_SUCH_ENTITY, UNKNOWN_ROLE (payer and payee live on the money fact), NO_ATTESTATION, then NO_VOTE_VALUE/UNKNOWN_VOTE_VALUE for voted; a repeat answers already", () => {
  const w = world({ view: testView({ votes: [{ value: "Aye" }, { value: "No" }] }) });
  const e = w.event({ kind: "vote", value: "2026-01-20" });
  const p = w.entity("Una");
  const add = (x) => w.ev.addParticipant({ eventId: e.event_id, entityId: p, role: "voted", attestation: e.attestation_ids[0], voteValue: "Aye", by: MEMBER, ...x });
  assert.deepEqual(ROLES, ["actor", "organizer", "mover", "seconder", "voted", "present", "speaker", "sender", "recipient", "copied",
    "signatory", "decider", "author", "implementer", "party", "subject"]);
  assert.equal(add({ eventId: "EVT-2026-aaaaaaaaaaaaaaaa", entityId: "", role: "payer" }).reason, "NO_SUCH_EVENT");
  assert.equal(add({ entityId: "", role: "payer" }).reason, "NO_ENTITY");
  assert.equal(add({ entityId: "ENT-2026-9999", role: "payer" }).reason, "NO_SUCH_ENTITY");
  const payer = add({ role: "payer", attestation: null });
  assert.equal(payer.reason, "UNKNOWN_ROLE");
  assert.match(payer.detail, /money fact/);
  assert.ok(!ROLES.includes("payer") && !ROLES.includes("payee"));
  assert.equal(add({ attestation: null, voteValue: "" }).reason, "NO_ATTESTATION");
  assert.equal(add({ attestation: 999 }).reason, "NO_SUCH_ATTESTATION");
  assert.equal(add({ voteValue: "" }).reason, "NO_VOTE_VALUE");
  const unk = add({ voteValue: "Maybe" });
  assert.equal(unk.reason, "UNKNOWN_VOTE_VALUE");
  assert.deepEqual(unk.values, ["Aye", "No"], "the profile's values");
  const a = add({});
  assert.equal(a.ok, true);
  assert.equal(add({}).already, true);
  assert.equal(w.rows(`SELECT * FROM event_participants`).length, 1);
  /* a participant on a fresh attestation, given here */
  const s = w.capture("r11b");
  const b = w.ev.addParticipant({ eventId: e.event_id, entityId: p, role: "present", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  assert.equal(b.ok, true);
  assert.notEqual(b.attestation_id, e.attestation_ids[0]);
  /* with no vote values in the view, a vote is kept as written and says it was not checked (never a default list) */
  const w2 = world();
  const e2 = w2.event({ kind: "vote", value: "2026-01-20" });
  const q = w2.entity("Vic");
  assert.equal(w2.ev.addParticipant({ eventId: e2.event_id, entityId: q, role: "voted", attestation: e2.attestation_ids[0], voteValue: "Abstain", by: MEMBER }).ok, true);
  const v = w2.ev.readEvent({ eventId: e2.event_id, viewer: MEMBER }).event.participants[0];
  assert.deepEqual([v.vote_value, v.vote_value_checked], ["Abstain", false]);
});

test("R12 each participant answers its entity's resolution grade in the attesting capture, the strongest, beside its attestation's grade: two axes, never one combined", () => {
  const w = world();
  const p = w.entity("Wanda Example");
  const s = w.capture("r12", { extra: { entities: [] } });
  w.x.writeReading({ bundleId: "INFO-2026-0001-a", captureSha: s, composed: true,
    reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z",
               entities: [{ kind: "person", key: "p1", label: "Wanda Example" }] } });
  w.ents.resolve({ captureSha: s, resolvedBy: MACHINE });
  const e = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: s, extent: doc }], participants: [{ entityId: p, role: "speaker", attestation: 0 }], by: MEMBER });
  const part = w.ev.readEvent({ eventId: e.event_id, viewer: MEMBER }).event.participants[0];
  assert.deepEqual(part.grades, { attestation: "B", resolution: "C" });
  assert.ok(!("grade" in part), "no one combined grade");
  /* testimony has no capture to resolve in */
  const t = w.ev.createEvent({ kind: "meeting", attestations: [{ testimony: "Wanda spoke" }], participants: [{ entityId: p, role: "speaker", attestation: 0 }], by: MEMBER });
  assert.deepEqual(w.ev.readEvent({ eventId: t.event_id, viewer: MEMBER }).event.participants[0].grades, { attestation: "D", resolution: null });
});

test("R13 correctParticipant refuses NO_REASON and NO_SUCH_PARTICIPANT; the corrected row stays superseded with who, when and why, the new row keeps role and attestation; nothing is deleted", () => {
  const w = world();
  const a = w.entity("Xan"), b = w.entity("Yolanda");
  const e = w.event({ value: "2026-02-02", participants: [{ entityId: a, role: "mover", attestation: 0 }] });
  const pid = w.rows(`SELECT participant_id FROM event_participants`)[0].participant_id;
  assert.equal(w.ev.correctParticipant({ participantId: pid, entityId: b, reason: " ", by: MEMBER }).reason, "NO_REASON");
  assert.equal(w.ev.correctParticipant({ participantId: 999, entityId: b, reason: "r", by: MEMBER }).reason, "NO_SUCH_PARTICIPANT");
  assert.equal(w.ev.correctParticipant({ participantId: pid, entityId: "ENT-2026-9999", reason: "r", by: MEMBER }).reason, "NO_SUCH_ENTITY");
  const c = w.ev.correctParticipant({ participantId: pid, entityId: b, reason: "the minutes name Yolanda", by: "member:bob" });
  assert.equal(c.ok, true);
  const parts = w.ev.readEvent({ eventId: e.event_id, viewer: MEMBER }).event.participants;
  assert.equal(parts.length, 2);
  const old = parts.find((p) => p.entity_id === a), now = parts.find((p) => p.entity_id === b);
  assert.deepEqual([old.superseded.by, old.superseded.reason, old.superseded.by_row], ["member:bob", "the minutes name Yolanda", now.participant_id]);
  assert.ok(old.superseded.at);
  assert.deepEqual([now.role, now.attestation_id, now.superseded], [old.role, old.attestation_id, null]);
  assert.equal(w.ev.correctParticipant({ participantId: pid, entityId: a, reason: "again", by: MEMBER }).reason, "PARTICIPANT_SUPERSEDED");
});

test("R14 only a member merges or splits (MEMBER_ACT_ONLY); NO_REASON and an absent event refused; a merge moves every attestation, participant and relation and leaves an alias; a split moves the named attestations; each recorded, rebuilding every when, telling listeners", async () => {
  const w = world();
  const told = [], moved = [];
  w.ev.onEventChanged("reevaluation", (x) => told.push(x.change));
  w.ev.onWhenChanged("lines", (x) => moved.push(x.eventId));
  const p = w.entity("Zed");
  const keep = w.event({ value: "2026-03-03", participants: [{ entityId: p, role: "present", attestation: 0 }] });
  const absorb = w.event({ value: "2026-03-02" });
  const other = w.event({ value: "2026-03-01" });
  const s = w.capture("r14");
  w.ev.relate({ from: absorb.event_id, to: other.event_id, kind: "answers", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  const m = (x) => w.ev.mergeEvents({ keep: keep.event_id, absorb: absorb.event_id, reason: "one meeting, two notices", by: MEMBER, ...x });
  assert.equal(m({ by: MACHINE }).reason, "MEMBER_ACT_ONLY");
  assert.equal(m({ by: null }).reason, "MEMBER_ACT_ONLY");
  assert.equal(m({ reason: "" }).reason, "NO_REASON");
  assert.equal(m({ absorb: "EVT-2026-aaaaaaaaaaaaaaaa" }).reason, "NO_SUCH_EVENT");
  moved.length = 0;
  const r = m({});
  assert.equal(r.ok, true);
  const v = w.ev.readEvent({ eventId: keep.event_id, viewer: MEMBER }).event;
  assert.equal(v.attestations.length, 2);
  assert.equal(v.relations.length, 1);
  assert.equal(v.relations[0].from, keep.event_id);
  assert.equal(v.when.value, "2026-03-03", "the kept event's governing attestation still governs");
  const alias = w.ev.readEvent({ eventId: absorb.event_id, viewer: MEMBER });
  assert.deepEqual([alias.found, alias.alias_of, alias.event.event_id], [true, keep.event_id, keep.event_id]);
  assert.deepEqual(v.merges_and_splits.map((c) => [c.kind, c.other, c.reason, c.by]), [["merged_in", absorb.event_id, "one meeting, two notices", MEMBER]]);
  assert.ok(moved.includes(keep.event_id) || w.one(`SELECT 1 AS x FROM event_when_cache WHERE event_id=?`, keep.event_id));
  assert.ok(told.includes("merged"));
  assert.deepEqual(w.record.rebuildAndCompare("events", "event_when_cache"), { same: true });
  /* split */
  const sp = (x) => w.ev.splitEvent({ eventId: keep.event_id, attestations: [v.attestations[1].attestation_id], reason: "two meetings after all", by: MEMBER, ...x });
  assert.equal(sp({ by: MACHINE }).reason, "MEMBER_ACT_ONLY");
  assert.equal(sp({ reason: "" }).reason, "NO_REASON");
  assert.equal(sp({ eventId: "EVT-2026-aaaaaaaaaaaaaaaa" }).reason, "NO_SUCH_EVENT");
  assert.equal(sp({ attestations: [9999] }).reason, "NO_SUCH_ATTESTATION");
  assert.equal(sp({ attestations: v.attestations.map((a) => a.attestation_id) }).reason, "SPLIT_EMPTIES");
  moved.length = 0;
  const out = sp({});
  assert.equal(out.ok, true);
  const n = w.ev.readEvent({ eventId: out.new_event_id, viewer: MEMBER }).event;
  assert.equal(n.when.value, "2026-03-02");
  assert.equal(n.kind, "meeting");
  assert.equal(w.ev.readEvent({ eventId: keep.event_id, viewer: MEMBER }).event.attestations.length, 1);
  assert.ok(moved.includes(out.new_event_id), "the new event's when is set and listeners told");
  assert.equal(n.merges_and_splits[0].kind, "split_from");
  assert.ok(told.includes("split"));
  assert.deepEqual(w.record.rebuildAndCompare("events", "event_when_cache"), { same: true });
});
