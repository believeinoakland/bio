/* events: the uses of a power (T35-28): acts of discretion, waivers and assessments (R43–R45), `usesOf` (R46), the read
   contract's new tables (R47), the question kept beside a recorded row (R48), and R1's found extent, at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MEMBER, MACHINE, OUTSIDER } from "./fixture.mjs";
import { USE_KINDS, OUTCOMES, eventsOps } from "../../../src/events/index.mjs";

const doc = { kind: "document" };
const page = (n) => ({ kind: "pdf-page", page: n });
/* A capture of three pages whose text the record holds per page, so a cited page's words are read from the record. */
function paged(w, name, texts = ["The director grants the variance.", "Reason: the lot is too narrow for the setback.", "Granted for 12 Elm Way, until the work ends."], opts = {}) {
  return w.capture(name, { pages: texts.length, units: texts.map((text, i) => ({ seq: i, extent: page(i), text })), ...opts });
}
/* A found match in retrieval R73's shape {kind, words, capture_sha, extent, origin}. */
const match = (s, n, words = "as found") => ({ kind: "term", words, capture_sha: s, extent: page(n), origin: "search" });

function setup() {
  const w = world();
  const s = paged(w, "decision");
  const director = w.entity("Dana Director"), owner = w.entity("Owen Owner");
  const base = (x = {}) => ({ kind: "discretion", provision: { standard: "STD-2026-0001", portion: "§4.2" },
    statedReason: { captureSha: s, extent: page(1) }, outcome: { value: "granted", extent: { captureSha: s, extent: page(0) } },
    attestations: [{ datedFactId: w.ev.recordDatedFact({ captureSha: s, extent: page(0), kind: "signed", value: "2026-03-04", method: "read by a member", by: MEMBER }).dated_fact.dated_fact_id }],
    participants: [{ entityId: director, role: "decider", attestation: 0 }, { entityId: owner, role: "subject", attestation: 0 }],
    by: MEMBER, ...x });
  return { w, s, director, owner, base };
}

test("R43 recordDiscretion refuses in order KIND_NOT_DISCRETION, MEMBER_ACT_ONLY, R6's, PROVISION_MALFORMED, STATED_REASON_MISSING, OUTCOME_UNKNOWN, QUESTION_NOT_HELD, then a waiver's WAIVER_NO_SCOPE, conditions and expiry, FIELD_NOT_FOR_KIND for a discretion; each writes nothing; else one event with decider and subject", () => {
  const { w, s, base } = setup();
  const r = (x) => w.ev.recordDiscretion(base(x)).reason;
  const count = () => w.rows(`SELECT COUNT(*) AS n FROM events`)[0].n + w.rows(`SELECT COUNT(*) AS n FROM event_uses`)[0].n;
  assert.deepEqual(OUTCOMES, ["granted", "denied", "partly_granted", "other"]);
  assert.equal(r({ kind: "meeting", by: MACHINE }), "KIND_NOT_DISCRETION");
  assert.equal(r({ kind: "assessment" }), "KIND_NOT_DISCRETION");
  assert.equal(r({ by: MACHINE, attestations: [] }), "MEMBER_ACT_ONLY", "the machine proposes, never records");
  assert.equal(r({ by: null }), "MEMBER_ACT_ONLY");
  assert.equal(r({ attestations: [], provision: { standard: "" } }), "NO_ATTESTATION", "R6's refusals come before the facet's");
  assert.equal(r({ participants: [{ entityId: "ENT-2026-9999", role: "decider", attestation: 0 }] }), "NO_SUCH_ENTITY");
  for (const bad of [{ standard: "" }, { standard: " " }, { standard: "x".repeat(201) }, { standard: "S", portion: "" }, { standard: "S", extra: 1 }, "STD-1", [1]])
    assert.equal(r({ provision: bad, statedReason: null }), "PROVISION_MALFORMED", JSON.stringify(bad));
  assert.equal(r({ provision: { standard: "x".repeat(200), portion: "y".repeat(200) }, statedReason: null }), "STATED_REASON_MISSING", "200 characters is a key");
  for (const missing of [null, undefined, "", "because", "None"])
    assert.equal(r({ statedReason: missing, outcome: { value: "maybe" } }), "STATED_REASON_MISSING", String(missing));
  assert.equal(r({ statedReason: { captureSha: sha("absent"), extent: doc } }), "CAPTURE_NOT_HELD", "a reason is refused as R1 refuses an extent");
  assert.equal(r({ statedReason: { captureSha: s } }), "NO_EXTENT");
  assert.equal(r({ statedReason: { captureSha: s, extent: page(9) } }), "EXTENT_NOT_IN_CAPTURE");
  assert.equal(r({ statedReason: { extent: page(1) } }), "NO_SHA");
  for (const bad of [null, { value: "approved" }, { value: "GRANTED" }, "granted"]) assert.equal(r({ outcome: bad, question: "INQ-x" }), "OUTCOME_UNKNOWN", JSON.stringify(bad));
  assert.equal(r({ outcome: { value: "denied" } }), "NO_SHA", "the outcome's passage is required");
  assert.equal(r({ outcome: { value: "denied", extent: { captureSha: s, extent: page(7) } } }), "EXTENT_NOT_IN_CAPTURE");
  assert.equal(r({ question: "INQ-2026-0001-none" }), "QUESTION_NOT_HELD");
  assert.equal(r({ scope: { captureSha: s, extent: page(2) } }), "FIELD_NOT_FOR_KIND");
  const f = w.ev.recordDiscretion(base({ expiry: "2027-01-01" }));
  assert.deepEqual([f.reason, f.field], ["FIELD_NOT_FOR_KIND", "expiry"]);
  assert.equal(r({ conditions: [] }), "FIELD_NOT_FOR_KIND", "an empty list given is still given");
  /* a waiver */
  const wv = (x) => r({ kind: "waiver", ...x });
  assert.equal(wv({}), "WAIVER_NO_SCOPE");
  assert.equal(wv({ scope: { captureSha: s, extent: page(5) } }), "EXTENT_NOT_IN_CAPTURE");
  assert.equal(wv({ scope: { captureSha: s, extent: page(2) }, conditions: "none" }), "NO_EXTENT");
  assert.equal(wv({ scope: { captureSha: s, extent: page(2) }, conditions: [{ captureSha: sha("gone"), extent: doc }] }), "CAPTURE_NOT_HELD");
  assert.equal(wv({ scope: { captureSha: s, extent: page(2) }, expiry: "2027-02-31" }), "BAD_DATE");
  assert.equal(count(), 0, "no refusal writes");
  /* negative controls: each accepted */
  const ok = w.ev.recordDiscretion(base());
  assert.equal(ok.ok, true);
  const v = w.ev.readEvent({ eventId: ok.event_id, viewer: MEMBER }).event;
  assert.equal(v.kind, "discretion");
  assert.deepEqual(v.participants.map((p) => p.role).sort(), ["decider", "subject"]);
  assert.equal(w.ev.recordDiscretion(base({ provision: undefined, statedReason: "none" })).ok, true, "provision optional; \"none\" a reason");
  assert.equal(w.ev.recordDiscretion(base({ kind: "waiver", outcome: { value: "partly_granted", extent: { captureSha: s, extent: page(0) } },
    scope: { captureSha: s, extent: page(2) } })).ok, true, "a waiver with no conditions or expiry given");
  for (const value of OUTCOMES) assert.equal(w.ev.recordDiscretion(base({ outcome: { value, extent: { captureSha: s, extent: page(0) } } })).ok, true, value);
});

test("R43 createEvent of a use's kind is refused USE_NEEDS_ITS_ACT: a use is held only with its facet; USE_KINDS are discretion, waiver, assessment", () => {
  const { w, s } = setup();
  assert.deepEqual(USE_KINDS, ["discretion", "waiver", "assessment"]);
  for (const kind of USE_KINDS)
    assert.equal(w.ev.createEvent({ kind, attestations: [{ captureSha: s, extent: doc }], by: MEMBER }).reason, "USE_NEEDS_ITS_ACT", kind);
  assert.equal(w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: s, extent: doc }], by: MEMBER }).ok, true);
});

test("R44 recordAssessment refuses MEMBER_ACT_ONLY, R6's, PROVISION_MALFORMED (the standard, each unmet item), UNMET_NOT_CITED, an unmet item's extent as R1 (in an attesting capture), QUESTION_NOT_HELD; holds the accreditor as decider, the body as subject; an empty unmet reads no standard found unmet, never met", () => {
  const w = world();
  const s = paged(w, "accreditation report"), other = paged(w, "unrelated");
  const accreditor = w.entity("Accrediting Board", "institution"), college = w.entity("Harbor College", "institution");
  const base = (x = {}) => ({ provision: { standard: "STD-ACC-1" }, unmet: [{ provision: { standard: "STD-ACC-1", portion: "II.A" }, extent: { captureSha: s, extent: page(1) } }],
    attestations: [{ captureSha: s, extent: page(0) }],
    participants: [{ entityId: accreditor, role: "decider", attestation: 0 }, { entityId: college, role: "subject", attestation: 0 }], by: MEMBER, ...x });
  const r = (x) => w.ev.recordAssessment(base(x)).reason;
  assert.equal(r({ by: MACHINE, attestations: [] }), "MEMBER_ACT_ONLY");
  assert.equal(r({ attestations: [], provision: null }), "NO_ATTESTATION");
  for (const bad of [null, undefined, {}, { standard: "" }, { portion: "II" }]) assert.equal(r({ provision: bad }), "PROVISION_MALFORMED", JSON.stringify(bad));
  assert.equal(r({ unmet: [{ provision: { standard: "" }, extent: { captureSha: s, extent: page(1) } }] }), "PROVISION_MALFORMED");
  assert.equal(r({ unmet: "II.A" }), "PROVISION_MALFORMED");
  assert.equal(r({ unmet: [{ provision: { standard: "STD-ACC-1", portion: "II.B" } }] }), "UNMET_NOT_CITED");
  assert.equal(r({ unmet: [{ provision: { standard: "S" }, extent: { captureSha: s, extent: page(8) } }] }), "EXTENT_NOT_IN_CAPTURE");
  assert.equal(r({ unmet: [{ provision: { standard: "S" }, extent: { captureSha: other, extent: page(0) } }] }), "EXTENT_NOT_IN_CAPTURE", "an attesting capture only");
  assert.equal(r({ question: "INQ-2026-0002-none" }), "QUESTION_NOT_HELD");
  assert.equal(w.rows(`SELECT * FROM events`).length + w.rows(`SELECT * FROM event_unmet`).length, 0, "no refusal writes");
  /* a found match spread into an unmet item is taken as its citation */
  const a = w.ev.recordAssessment(base({ unmet: [{ provision: { standard: "STD-ACC-1", portion: "II.A" }, ...match(s, 1) }] }));
  assert.equal(a.ok, true);
  const v = w.ev.readEvent({ eventId: a.event_id, viewer: MEMBER }).event;
  assert.equal(v.kind, "assessment");
  assert.deepEqual(v.use.provision, { standard: "STD-ACC-1" });
  assert.deepEqual(v.use.unmet.map((u) => [u.provision.portion, u.extent.capture_sha, u.extent.extent.page]), [["II.A", s, 1]]);
  assert.match(v.use.says, /^Assessment of Harbor College by Accrediting Board, date not recorded, against STD-ACC-1: found unmet: STD-ACC-1 II\.A$/);
  const none = w.ev.recordAssessment(base({ unmet: [] }));
  const n = w.ev.readEvent({ eventId: none.event_id, viewer: MEMBER }).event.use;
  assert.deepEqual(n.unmet, []);
  assert.match(n.says, /no standard found unmet$/);
  assert.ok(!/\bmet\b(?! *$)/.test(n.says.replace("unmet", "")) && !/: met/.test(n.says), "never read as met");
  assert.equal(w.ev.recordAssessment(base({ unmet: undefined, participants: [] })).ok, true, "participants and unmet optional");
});

test("R45 every read answers a use with its facet and its members' words; discretion's are DEC-145's; the cited words are the record's; a facet is never edited; withdrawUse refuses NO_REASON, NO_SUCH_EVENT, KIND_NOT_DISCRETION, answers a repeat already, and leaves the use readable, shown withdrawn", () => {
  const { w, s, director, owner, base } = setup();
  const d = w.ev.recordDiscretion(base()).event_id;
  const read = (id, viewer = MEMBER) => w.ev.readEvent({ eventId: id, viewer }).event.use;
  const u = read(d);
  assert.deepEqual(u.provision, { standard: "STD-2026-0001", portion: "§4.2" });
  assert.deepEqual([u.stated_reason.capture_sha, u.stated_reason.extent.page], [s, 1]);
  assert.equal(u.stated_reason.words, "Reason: the lot is too narrow for the setback.", "words read from the record, not a caller");
  assert.equal(u.outcome.value, "granted");
  assert.equal(u.says, "Discretion used by Dana Director, 2026-03-04, stated reason: “Reason: the lot is too narrow for the setback.”");
  /* "none", no decider, no date, no provision */
  const bare = w.ev.recordDiscretion(base({ statedReason: "none", provision: null, participants: [], attestations: [{ captureSha: s, extent: page(0) }] })).event_id;
  const b = read(bare);
  assert.equal(b.stated_reason, "none");
  assert.deepEqual([b.provision, b.provision_says], [null, "provision not recorded"]);
  assert.equal(b.says, "Discretion used by decider not recorded, date not recorded, no reason stated");
  /* a passage whose text is not held is named without words, never "no reason stated" */
  const plain = w.capture("plain");
  const nt = w.ev.recordDiscretion(base({ statedReason: { captureSha: plain, extent: doc } })).event_id;
  assert.match(read(nt).says, /stated reason: in the cited passage, its words not read$/);
  /* a waiver's facet and words */
  const wv = w.ev.recordDiscretion(base({ kind: "waiver", scope: { captureSha: s, extent: page(2) }, conditions: [{ captureSha: s, extent: page(1) }], expiry: "2027-06-30" })).event_id;
  const x = read(wv);
  assert.deepEqual([x.scope.words, x.conditions.length, x.expiry.value], ["Granted for 12 Elm Way, until the work ends.", 1, "2027-06-30"]);
  assert.match(x.says, /^Waiver granted by Dana Director, 2026-03-04, stated reason: “Reason: .*”; waived: “Granted for 12 Elm Way, until the work ends\.”; conditions: “Reason: .*”; expires 2027-06-30$/);
  const wv2 = read(w.ev.recordDiscretion(base({ kind: "waiver", scope: { captureSha: s, extent: page(2) } })).event_id);
  assert.match(wv2.says, /no conditions stated; no expiry stated$/);
  /* every read: eventsFor, timeline, statementsOf's lists and the connection owner carry the facet */
  assert.equal(w.ev.eventsFor({ entity: director, viewer: MEMBER }).events.find((e) => e.event_id === d).use.says, u.says);
  assert.equal(w.ev.timeline({ set: [owner], lanes: ["world"], viewer: MEMBER }).world.items.find((e) => e.event_id === d).use.kind, "discretion");
  const conn = w.ev.neighbours({ node: director, at: { value: "2026-03-04", precision: "day", zone: "America/Halifax" }, viewer: MEMBER, scope: null }).items;
  assert.equal(conn.find((c) => c.to === d).use.says, u.says);
  /* sight: a cited passage in a capture the viewer may not see is withheld */
  w.project("PROJ-2026-0001-q", "alice");
  const hidden = paged(w, "fenced memo", ["Our private reason."], { bundleId: "INFO-2026-0004-p", project: "PROJ-2026-0001-q" });
  const mixed = w.ev.recordDiscretion(base({ statedReason: { captureSha: hidden, extent: page(0) } })).event_id;
  assert.equal(read(mixed).stated_reason.words, "Our private reason.");
  const seen = read(mixed, OUTSIDER);
  assert.deepEqual(seen.stated_reason, { withheld: true });
  assert.match(seen.says, /stated reason: in a document you cannot see$/);
  assert.ok(!JSON.stringify(seen).includes(hidden) && !JSON.stringify(seen).includes("private"));
  /* withdrawal */
  const wd = (x) => w.ev.withdrawUse({ eventId: d, reason: "recorded against the wrong permit", by: MEMBER, ...x });
  assert.equal(wd({ reason: " " }).reason, "NO_REASON");
  assert.equal(wd({ eventId: "EVT-2026-aaaaaaaaaaaaaaaa" }).reason, "NO_SUCH_EVENT");
  assert.equal(wd({ eventId: w.event({ value: "2026-01-01" }).event_id }).reason, "KIND_NOT_DISCRETION");
  const done = wd({ by: "member:bob" });
  assert.deepEqual([done.ok, done.withdrawn.by, done.withdrawn.reason], [true, "member:bob", "recorded against the wrong permit"]);
  assert.equal(wd({ reason: "again" }).already, true);
  const after = read(d);
  assert.deepEqual([after.withdrawn.by, after.withdrawn.reason, after.says], ["member:bob", "recorded against the wrong permit", u.says], "still readable, shown withdrawn");
  /* never edited: no act changes a facet's columns; a split carries it unchanged */
  const facetCols = () => w.rows(`SELECT event_id, kind, provision_standard, provision_portion, reason_stated, reason, outcome, outcome_cite, scope, conditions, expiry, question FROM event_uses ORDER BY event_id`);
  const before = facetCols();
  w.ev.attest({ eventId: wv, attestation: { captureSha: s, extent: page(2) }, by: MEMBER });
  const pid = w.one(`SELECT participant_id FROM event_participants WHERE event_id=? AND role='decider'`, wv).participant_id;
  w.ev.correctParticipant({ participantId: pid, entityId: owner, reason: "misread", by: MEMBER });
  assert.deepEqual(facetCols(), before);
  const atts = w.ev.readEvent({ eventId: wv, viewer: MEMBER }).event.attestations;
  const sp = w.ev.splitEvent({ eventId: wv, attestations: [atts.at(-1).attestation_id], reason: "two waivers", by: MEMBER });
  assert.equal(sp.ok, true);
  assert.deepEqual({ ...read(sp.new_event_id), says: null, at: null }, { ...read(wv), says: null, at: null }, "the split event carries the same facet");
});

test("R46 usesOf answers held uses not withdrawn, filtered by provision (any portion when none), decider, subject, kinds (KIND_NOT_DISCRETION), from/to with placed-nowhere apart, in R31's order, paged by after and limit, a population not a census; it writes nothing and never throws", () => {
  const { w, s, director, owner, base } = setup();
  const other = w.entity("Pat Planner");
  const att = (v) => [{ datedFactId: w.ev.recordDatedFact({ captureSha: s, extent: page(0), kind: "signed", value: v, method: "m", by: MEMBER }).dated_fact.dated_fact_id }];
  const mk = (x) => w.ev.recordDiscretion(base(x)).event_id;
  const jan = mk({ attestations: att("2026-01-10") });
  const feb = mk({ attestations: att("2026-02-10"), provision: { standard: "STD-2026-0001", portion: "§9" } });
  const mar = mk({ attestations: att("2026-03-10"), kind: "waiver", scope: { captureSha: s, extent: page(2) }, provision: { standard: "STD-OTHER" },
                   participants: [{ entityId: other, role: "decider", attestation: 0 }, { entityId: owner, role: "subject", attestation: 0 }] });
  const nowhere = mk({ attestations: [{ captureSha: s, extent: page(0) }] });
  const gone = mk({ attestations: att("2026-01-20") });
  w.ev.withdrawUse({ eventId: gone, reason: "wrong", by: MEMBER });
  w.event({ value: "2026-01-15", participants: [{ entityId: director, role: "decider", attestation: 0 }] });
  const rowsBefore = w.rows(`SELECT COUNT(*) AS n FROM event_uses`)[0].n + w.rows(`SELECT COUNT(*) AS n FROM content`)[0].n;
  const q = (x) => w.ev.usesOf({ viewer: MEMBER, ...x });
  const ids = (r) => [...r.items, ...r.placed_nowhere].map((e) => e.event_id);
  const all = q({});
  assert.deepEqual(all.items.map((e) => e.event_id), [jan, feb, mar], "R31's order; the withdrawn use and the plain event left out");
  assert.deepEqual(all.placed_nowhere.map((e) => e.event_id), [nowhere]);
  assert.equal(all.count, 4);
  assert.match(all.population, /never every use made: a population, not a census/);
  assert.ok(all.items.every((e) => e.use && Array.isArray(e.participants)), "each item the event with its facet and participants");
  assert.deepEqual(ids(q({ provision: { standard: "STD-2026-0001" } })), [jan, feb, nowhere], "no portion: every portion");
  assert.deepEqual(ids(q({ provision: { standard: "STD-2026-0001", portion: "§9" } })), [feb]);
  assert.equal(q({ provision: { standard: "" } }).reason, "PROVISION_MALFORMED");
  assert.deepEqual(ids(q({ decider: other })), [mar]);
  assert.deepEqual(ids(q({ subject: owner, kinds: ["waiver"] })), [mar]);
  assert.deepEqual(ids(q({ kinds: "discretion" })), [jan, feb, nowhere]);
  assert.equal(q({ kinds: ["meeting"] }).reason, "KIND_NOT_DISCRETION");
  const ranged = q({ from: "2026-02-01", to: "2026-02-28" });
  assert.deepEqual([ranged.items.map((e) => e.event_id), ranged.placed_nowhere.map((e) => e.event_id)], [[feb], [nowhere]], "an event placed nowhere answered apart, never dropped");
  assert.equal(q({ from: "2026-02-31" }).reason, "BAD_DATE");
  const p1 = q({ limit: 2 });
  assert.deepEqual([ids(p1), p1.truncated, p1.next], [[jan, feb], true, feb]);
  const p2 = q({ limit: 2, after: p1.next });
  assert.deepEqual([ids(p2), p2.truncated, p2.next], [[mar, nowhere], false, null]);
  assert.equal(q({ limit: 9999 }).limit, 500);
  assert.equal(q({ limit: 0 }).limit, 100);
  /* sight is R40's: an absent viewer and an outsider to a fenced use see and count nothing of it */
  assert.equal(w.ev.usesOf({}).count, 0);
  w.project("PROJ-2026-0002-u", "bob");
  const fenced = w.capture("fenced decision", { bundleId: "INFO-2026-0005-u", project: "PROJ-2026-0002-u" });
  w.ev.recordDiscretion(base({ by: "member:bob", attestations: [{ captureSha: fenced, extent: doc }], participants: [], statedReason: "none",
    outcome: { value: "denied", extent: { captureSha: fenced, extent: doc } } }));
  assert.equal(q({ viewer: OUTSIDER }).count, 4);
  assert.equal(q({ viewer: "member:bob" }).count, 5);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM event_uses`)[0].n + w.rows(`SELECT COUNT(*) AS n FROM content`)[0].n, rowsBefore + 1 + 1, "a read writes nothing");
  for (const bad of [null, { kinds: 7 }, { provision: "x" }, { limit: "x" }]) assert.doesNotThrow(() => w.ev.usesOf(bad || undefined));
});

test("R47 the read contract: event_uses (event_id, kind, provision_standard, provision_portion, reason_stated, outcome, withdrawn) and event_unmet (event_id, provision_standard, provision_portion) joinable in a later module's SQL", () => {
  const { w, s, base } = setup();
  const d = w.ev.recordDiscretion(base()).event_id;
  const n = w.ev.recordDiscretion(base({ statedReason: "none", outcome: { value: "denied", extent: { captureSha: s, extent: page(0) } } })).event_id;
  const a = w.ev.recordAssessment({ provision: { standard: "STD-ACC" }, unmet: [{ provision: { standard: "STD-ACC", portion: "3" }, extent: { captureSha: s, extent: page(1) } }],
    attestations: [{ captureSha: s, extent: page(0) }], by: MEMBER }).event_id;
  w.ev.withdrawUse({ eventId: n, reason: "duplicate", by: MEMBER });
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
  for (const c of ["event_id", "kind", "provision_standard", "provision_portion", "reason_stated", "outcome", "withdrawn"]) assert.ok(cols("event_uses").includes(c), c);
  for (const c of ["event_id", "provision_standard", "provision_portion"]) assert.ok(cols("event_unmet").includes(c), c);
  const j = w.rows(`SELECT u.event_id, u.kind, u.provision_standard, u.provision_portion, u.reason_stated, u.outcome, u.withdrawn, e.status
                    FROM event_uses u JOIN events e ON e.event_id = u.event_id ORDER BY u.at, u.event_id`);
  assert.deepEqual(j.map((r) => [r.event_id, r.kind, r.provision_standard, r.provision_portion, r.reason_stated, r.outcome, r.withdrawn]),
    [[d, "discretion", "STD-2026-0001", "§4.2", 1, "granted", 0], [n, "discretion", "STD-2026-0001", "§4.2", 0, "denied", 1], [a, "assessment", "STD-ACC", null, null, null, 0]]);
  assert.deepEqual(w.rows(`SELECT n.event_id, n.provision_standard, n.provision_portion FROM event_unmet n JOIN event_uses u ON u.event_id = n.event_id`),
    [{ event_id: a, provision_standard: "STD-ACC", provision_portion: "3" }]);
  const d2 = w.record.declaredTables().filter((t) => t.module === "events").map((t) => t.name);
  assert.ok(d2.includes("event_uses") && d2.includes("event_unmet"), "declared through record-core (R40)");
});

test("R48 a question given to R1, R43 or R44 is kept beside the row unchanged, answered by every read to a viewer who may see the inquiry, withheld as absent from any other; no question answers null; a repeat of R1 with another question keeps the first", () => {
  const { w, s, base } = setup();
  w.project("PROJ-2026-0003-i", "alice");
  const inq = w.bundle("INQ-2026-0001-q", { type: "inquiry", project: "PROJ-2026-0003-i" });
  const inq2 = w.bundle("INQ-2026-0002-q", { type: "inquiry" });
  w.bundle("INFO-2026-0009-n", { type: "information" });
  /* R1 */
  w.ev.recordDatedFact({ captureSha: s, extent: page(0), kind: "signed", value: "2026-03-04", method: "read by a member", by: MEMBER });
  const fact = (x) => w.ev.recordDatedFact({ captureSha: s, extent: page(2), kind: "effective", value: "2026-05-01", method: "read by a member", by: MEMBER, ...x });
  assert.equal(fact({ question: "INFO-2026-0009-n" }).reason, "QUESTION_NOT_HELD", "a bundle that is no inquiry");
  assert.equal(fact({ question: "INQ-2026-0001-q", by: OUTSIDER }).reason, "QUESTION_NOT_HELD", "an unseen inquiry as an absent one");
  assert.equal(fact({ question: "", method: "" }).reason, "NO_METHOD", "after NO_METHOD");
  const f = fact({ question: inq });
  assert.equal(f.dated_fact.question, inq);
  const again = fact({ question: inq2 });
  assert.deepEqual([again.already, again.dated_fact.question], [true, inq], "the first question is kept");
  const facts = (viewer) => w.ev.datedFactsFor({ captureSha: s, viewer }).dated_facts.find((x) => x.dated_fact_id === f.dated_fact.dated_fact_id);
  assert.equal(facts(MEMBER).question, inq);
  assert.ok(!("question" in facts(OUTSIDER)), "withheld as absent: no field");
  const plainFact = w.ev.datedFactsFor({ captureSha: s, viewer: OUTSIDER }).dated_facts.find((x) => x.kind === "signed");
  assert.equal(plainFact.question, null, "a row recorded with no question answers null");
  /* R43, R44 */
  const d = w.ev.recordDiscretion(base({ question: inq })).event_id;
  const a = w.ev.recordAssessment({ provision: { standard: "STD-A" }, attestations: [{ captureSha: s, extent: page(0) }], question: inq2, by: MEMBER }).event_id;
  const none = w.ev.recordDiscretion(base()).event_id;
  const use = (id, viewer) => w.ev.readEvent({ eventId: id, viewer }).event.use;
  assert.equal(use(d, MEMBER).question, inq);
  assert.ok(!("question" in use(d, OUTSIDER)));
  assert.equal(use(a, OUTSIDER).question, inq2, "a group-wide inquiry is seen by every member");
  assert.equal(use(none, OUTSIDER).question, null);
  const listed = (viewer) => w.ev.usesOf({ viewer }).items.find((e) => e.event_id === d).use;
  assert.equal(listed(MEMBER).question, inq);
  assert.ok(!("question" in listed(OUTSIDER)) && !JSON.stringify(w.ev.usesOf({ viewer: OUTSIDER })).includes(inq), "no field, no count");
  /* unchanged by later acts */
  w.ev.withdrawUse({ eventId: d, reason: "r", by: MEMBER });
  assert.equal(use(d, MEMBER).question, inq);
});

test("R1 a found extent (retrieval's findIn match: its capture_sha and extent) is taken as the dated fact's citation exactly as any other extent: no refusal or grade changes", () => {
  const w = world();
  const s = paged(w, "found");
  const m = match(s, 1, "Reason: the lot");
  const found = w.ev.recordDatedFact({ captureSha: m.capture_sha, extent: m.extent, kind: "issued", value: "2026-04-04", method: "a member's reading of a found passage", by: MEMBER });
  assert.equal(found.ok, true);
  assert.deepEqual([found.dated_fact.capture_sha, found.dated_fact.extent.kind, found.dated_fact.extent.page, found.dated_fact.grade], [s, "pdf-page", 1, w.prov.captureGrade(s).grade]);
  const typed = w.ev.recordDatedFact({ captureSha: s, extent: page(1), kind: "issued", value: "2026-04-04", method: "a member's reading of a found passage", by: MEMBER });
  assert.deepEqual([typed.already, typed.dated_fact.dated_fact_id], [true, found.dated_fact.dated_fact_id], "the same citation as a typed extent");
  assert.equal(w.ev.recordDatedFact({ captureSha: m.capture_sha, extent: page(9), kind: "issued", value: "2026-04-04", method: "m", by: MEMBER }).reason, "EXTENT_NOT_IN_CAPTURE");
  /* the use acts take a match as it is */
  const d = w.ev.recordDiscretion({ kind: "discretion", statedReason: m, outcome: { value: "granted", ...match(s, 0) },
    attestations: [{ captureSha: s, extent: page(0) }], by: MEMBER });
  assert.equal(d.ok, true);
  assert.equal(w.ev.readEvent({ eventId: d.event_id, viewer: MEMBER }).event.use.stated_reason.words, "Reason: the lot is too narrow for the setback.", "the record's words, not the match's");
});

test("R36 the use ops: discretionrecord, assessmentrecord, usewithdraw take the url's stamp as author; usesof reads its filters from the url", () => {
  const { w, s, director, base } = setup();
  const url = (q) => { const u = new URL("https://plane.test/op"); for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v); return u; };
  const { by, ...body } = base();
  const d = eventsOps(w.ev, url({ by: MEMBER }), { ...body, by: MACHINE }).discretionrecord();
  assert.equal(d.ok, true, "the body's own by is never read");
  assert.equal(eventsOps(w.ev, url({ by: MACHINE }), body).discretionrecord().reason, "MEMBER_ACT_ONLY");
  assert.equal(eventsOps(w.ev, url({ by: MEMBER }), { provision: { standard: "S" }, attestations: [{ captureSha: s, extent: page(0) }] }).assessmentrecord().ok, true);
  const got = eventsOps(w.ev, url({ viewer: MEMBER, standard: "STD-2026-0001", portion: "§4.2", decider: director, kinds: "discretion" }), undefined).usesof();
  assert.deepEqual(got.items.map((e) => e.event_id), [d.event_id]);
  assert.equal(eventsOps(w.ev, url({ by: MEMBER }), { eventId: d.event_id, reason: "wrong" }).usewithdraw().withdrawn.by, MEMBER);
  assert.equal(eventsOps(w.ev, url({ viewer: MEMBER }), undefined).usesof().count, 1);
});
