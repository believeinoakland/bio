/* standards: law relations, court links and treatment rows held as data, recorded by members (R22–R24, R26, R27, R30;
   D192, D134, K1443, K1446). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, REASON } from "./fixture.mjs";
import { STANDARDS_CHECKS, LAW_RELATIONS, COURT_LINKS, TREATMENTS, portionUnknown } from "../../../src/standards/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");

/* Two statutes and their passages, bob and carol members. */
function two(w, extra = {}) {
  const at = w.passage().contentId, bt = w.passage().contentId;
  const a = w.declare({ cite: "PEBL § 10", text: [at], portion: { path: "10(a)", content_id: at }, ...extra }).id;
  const b = w.declare({ cite: "PEBL § 20", text: [bt], portion: { path: "20(b)", content_id: bt }, ...extra }).id;
  return { a, b, at, bt };
}

test("R22 the relation types are two closed sets, temporal and referential, exported frozen, kept apart and never mixed in one list or read", () => {
  assert.deepEqual(LAW_RELATIONS, { temporal: ["amends", "repeals", "renumbers", "recodifies"],
                                    referential: ["refers_to", "defines", "excepts", "implements"] });
  assert.ok(Object.isFrozen(LAW_RELATIONS) && Object.isFrozen(LAW_RELATIONS.temporal) && Object.isFrozen(LAW_RELATIONS.referential));
  assert.deepEqual(LAW_RELATIONS.temporal.filter((t) => LAW_RELATIONS.referential.includes(t)), []);
  const w = seeded();
  const { a, b, at } = two(w);
  for (const type of [...LAW_RELATIONS.temporal, ...LAW_RELATIONS.referential])
    assert.equal(w.s.lawRelate({ type, from: a, to: b, citation: at, effective: "2021-01-01", reason: REASON, author: V("bob"), viewer: V("bob") }).ok, true, type);
  const read = w.s.lawRelationsOf({ standard: b, viewer: V("carol") });
  assert.deepEqual(read.temporal.map((r) => r.type).sort(), [...LAW_RELATIONS.temporal].sort());
  assert.deepEqual(read.referential.map((r) => r.type).sort(), [...LAW_RELATIONS.referential].sort());
  assert.ok(read.temporal.every((r) => r.class === "temporal" && r.effective) && read.referential.every((r) => r.class === "referential" && r.effective === null));
  assert.equal(read.items, undefined, "no list holds both");
  assert.ok(read.temporal.every((r) => r.direction === "in"));
  assert.equal(w.s.lawRelationsOf({ standard: "", viewer: V("carol") }).reason, "STANDARD_NO_ID");
});

test("R23 lawRelate records one relation by a member's act, refusing in order MACHINE_CANNOT_RELATE, LAW_RELATION_UNKNOWN, NO_SUCH_STANDARD naming the end, PORTION_UNKNOWN, LAW_RELATION_NO_CITATION (a passage of the from standard's text), LAW_RELATION_NO_EFFECTIVE (temporal), STANDARD_NO_REASON, each through its row with nothing written; a machine's suggestion is a proposal that moves no answer; lawWithdraw keeps it, with who, when and why", () => {
  const w = seeded();
  const { a, b, at, bt } = two(w);
  const good = { type: "amends", from: { standard: a, portion: "10(a)" }, to: { standard: b, portion: "20(b)" }, citation: at,
                 effective: "2021-01-01", reason: REASON, author: V("bob"), viewer: V("bob") };
  const bad = { type: "supersedes", from: { standard: "STD-2026-9999-x", portion: "9" }, to: { standard: b, portion: "nope" },
                citation: bt, effective: "soon", reason: " ", author: MACHINE, viewer: V("bob") };
  const order = [["author", "MACHINE_CANNOT_RELATE"], ["type", "LAW_RELATION_UNKNOWN"], ["from", "NO_SUCH_STANDARD"],
                 ["to", "PORTION_UNKNOWN"], ["citation", "LAW_RELATION_NO_CITATION"], ["effective", "LAW_RELATION_NO_EFFECTIVE"],
                 ["reason", "STANDARD_NO_REASON"]];
  const before = w.snapshot();
  const call = { ...bad };
  for (const [field, code] of order) {
    const r = w.s.lawRelate(call);
    assert.equal(codeOf(r), code, `${field}: expected ${code}`);
    assert.deepEqual([r.check, r.translation], [STANDARDS_CHECKS[code].check, STANDARDS_CHECKS[code].translation], code);
    if (field === "from") assert.equal(r.end, "from", "names the end");
    call[field] = good[field];
  }
  assert.deepEqual(w.snapshot(), before, "a refused relation writes nothing");
  const ok = w.s.lawRelate(call);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.match(ok.relation.id, /^lrel-[0-9a-f]{24}$/);
  assert.deepEqual([ok.relation.class, ok.relation.by, ok.relation.effective, ok.relation.from, ok.relation.withdrawn],
                   ["temporal", V("bob"), { date: "2021-01-01" }, { standard: a, portion: "10(a)" }, null]);
  /* each condition's edges */
  assert.equal(codeOf(w.s.lawRelate({ ...good, author: "" })), "MACHINE_CANNOT_RELATE");
  assert.equal(w.s.lawRelate({ ...good, to: "STD-2026-9999-x" }).end, "to");
  assert.equal(codeOf(w.s.lawRelate({ ...good, viewer: "nobody" })), "NO_SUCH_STANDARD", "a viewer naming no member reads none");
  assert.equal(codeOf(w.s.lawRelate({ ...good, citation: bt })), "LAW_RELATION_NO_CITATION", "the to standard's passage is not the amending words");
  assert.equal(codeOf(w.s.lawRelate({ ...good, to: { standard: a, portion: "10(a)" } })), "LAW_RELATION_SELF");
  for (const effective of [undefined, "2021-02-30", { event: "EVT-2026-x", edge: "start" }, { event: "EVT-2026-abcdefghijklmnop", edge: "mid" }])
    assert.equal(codeOf(w.s.lawRelate({ ...good, effective })), "LAW_RELATION_NO_EFFECTIVE", JSON.stringify(effective));
  assert.equal(w.s.lawRelate({ ...good, effective: { event: "EVT-2026-abcdefghijklmnop", edge: "start" } }).ok, true);
  assert.equal(w.s.lawRelate({ ...good, type: "refers_to", effective: undefined }).ok, true, "a referential relation needs no effective date");
  assert.equal(codeOf(w.s.lawRelate({ ...good, merit: 1 })), "STANDARD_FIELD_UNKNOWN");
  /* a passage of a document the viewer may not see is not a citation for that viewer (one answer) */
  const P = w.project("Private", "alice");
  const hidden = w.passage();
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
  const c = w.declare({ cite: "PEBL § 30", text: [hidden.contentId], author: V("alice"), viewer: V("alice") }).id;
  assert.equal(codeOf(w.s.lawRelate({ ...good, from: c, citation: hidden.contentId })), "LAW_RELATION_NO_CITATION");
  assert.equal(w.s.lawRelate({ ...good, from: c, to: b, citation: hidden.contentId, author: V("alice"), viewer: V("alice") }).ok, true);
  /* a machine proposes; the proposal moves nothing until a member records the row naming it */
  const answer = () => w.s.inForceAt({ standard: b, date: "2022-01-01" });
  const fresh = seeded();
  const f = two(fresh);
  const was = fresh.s.inForceAt({ standard: f.b, date: "2022-01-01" });
  const p = fresh.s.lawPropose({ what: "relation", type: "repeals", from: f.a, to: f.b, citation: f.at, effective: "2021-01-01",
                                 why: "Its section 4 repeals the older bylaw.", proposer: MACHINE });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.deepEqual([p.proposal.state, p.proposal.machine_work, p.recorded], ["machine_proposed", true, false]);
  assert.deepEqual(fresh.s.inForceAt({ standard: f.b, date: "2022-01-01" }), was, "a proposal never moves an answer");
  assert.equal(fresh.count("law_relations"), 0);
  assert.equal(codeOf(fresh.s.lawRelate({ proposal: p.proposal.id, author: MACHINE })), "MACHINE_CANNOT_RELATE");
  const adopted = fresh.s.lawRelate({ proposal: p.proposal.id, reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(adopted.ok, true, JSON.stringify(adopted).slice(0, 300));
  assert.deepEqual([adopted.relation.proposal, adopted.adopted.from_proposal.sort()], [p.proposal.id, ["citation", "effective", "from", "to", "type"]]);
  assert.equal(fresh.s.inForceAt({ standard: f.b, date: "2022-01-01" }).state, "not_in_force", "the member's act moves it");
  assert.equal(codeOf(fresh.s.lawRelate({ proposal: p.proposal.id, reason: REASON, author: V("carol"), viewer: V("carol") })), "STANDARD_PROPOSAL_ADOPTED");
  assert.equal(codeOf(fresh.s.lawRelate({ proposal: "lprop-0", reason: REASON, author: V("carol") })), "STANDARD_NO_SUCH_PROPOSAL");
  for (const [args, code] of [[{ what: "relation", why: "", proposer: MACHINE }, "STANDARD_WHY_INVALID"], [{ what: "relation", why: "w", proposer: "" }, "STANDARD_PROPOSER_UNNAMED"],
                              [{ what: "opinion", why: "w", proposer: MACHINE }, "LAW_RELATION_UNKNOWN"], [{ what: "relation", why: "w", proposer: MACHINE, merit: 1 }, "STANDARD_FIELD_UNKNOWN"]])
    assert.equal(codeOf(fresh.s.lawPropose(args)), code, code);
  /* withdrawal: kept, with who, when and why; the row stays; a repeat answers already */
  const id = ok.relation.id;
  assert.equal(codeOf(w.s.lawWithdraw({ relation: id, reason: "wrong", author: MACHINE })), "MACHINE_CANNOT_RELATE");
  assert.equal(codeOf(w.s.lawWithdraw({ relation: "lrel-000", reason: "wrong", author: V("bob") })), "NO_SUCH_LAW_ITEM");
  assert.equal(codeOf(w.s.lawWithdraw({ relation: id, reason: "", author: V("bob") })), "STANDARD_NO_REASON");
  const wd = w.s.lawWithdraw({ relation: id, reason: "It cites the wrong section.", author: V("carol") });
  assert.deepEqual([wd.ok, wd.withdrawn.by, wd.withdrawn.reason], [true, V("carol"), "It cites the wrong section."]);
  assert.equal(w.s.lawWithdraw({ relation: id, reason: "again", author: V("bob") }).already, true);
  const kept = w.s.lawRelationsOf({ standard: a, viewer: V("bob") }).temporal.find((r) => r.id === id);
  assert.deepEqual([kept.withdrawn.by, kept.type], [V("carol"), "amends"], "withdrawn, never deleted");
  assert.equal(answer().state, w.s.inForceAt({ standard: b, date: "2022-01-01" }).state);
});

test("R23 portionUnknown is the one answer to a portion the standard does not record: PORTION_UNKNOWN through its row, the standard and portion as asked, a caller's fields beside and never replacing them; it never throws", () => {
  const r = portionUnknown("STD-2026-0001-statute", "12(z)", { end: "to", code: "X", reason: "Y" });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.standard, r.portion, r.end],
                   [false, "PORTION_UNKNOWN", "PORTION_UNKNOWN", STANDARDS_CHECKS.PORTION_UNKNOWN.check,
                    STANDARDS_CHECKS.PORTION_UNKNOWN.translation, "STD-2026-0001-statute", "12(z)", "to"]);
  assert.match(STANDARDS_CHECKS.PORTION_UNKNOWN.where, /index\.mjs portionUnknown > is-portion-held$/);
  for (const x of [null, 7, [1], new Proxy({}, { ownKeys() { throw new Error("no"); } })])
    assert.doesNotThrow(() => assert.equal(portionUnknown(null, null, x).reason, "PORTION_UNKNOWN"));
});

test("R24 addressesOf follows adopted renumbers and recodifies relations both ways and answers every key and portion the provision has been held under, each with the relation and its effective date; withdrawn ones and other types are not followed; bounded by connection-grammar's default depth (truncated past it); it never throws", () => {
  const w = seeded();
  const ids = [], texts = [];
  for (let i = 0; i < 11; i++) {
    const t = w.passage().contentId;
    texts.push(t);
    ids.push(w.declare({ cite: `PEBL § ${100 + i}`, text: [t], portion: { path: `${100 + i}(a)`, content_id: t } }).id);
  }
  const rel = (type, from, to, i) => w.s.lawRelate({ type, from: ids[from], to: ids[to], citation: texts[from], effective: `20${10 + i}-01-01`,
                                                     reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(rel("renumbers", 1, 0, 1).ok, true);
  assert.equal(rel("recodifies", 1, 2, 2).ok, true, "from 1 to 2: followed against its direction from 2");
  const amend = rel("amends", 3, 0, 3);
  const a = w.s.addressesOf({ key: "/eli/xx-port-ellery/selectboard/100", viewer: V("carol") });
  assert.deepEqual(a.held_under, [ids[0]]);
  assert.deepEqual(a.addresses.map((x) => [x.standard, x.key, x.portion, x.via.type, x.via.effective.date, x.depth]),
                   [[ids[1], "/eli/xx-port-ellery/selectboard/101", "101(a)", "renumbers", "2011-01-01", 1],
                    [ids[2], "/eli/xx-port-ellery/selectboard/102", "102(a)", "recodifies", "2012-01-01", 2]]);
  assert.equal(a.truncated, false);
  assert.ok(!a.addresses.some((x) => x.standard === ids[3]), "an amendment is not an address");
  /* from the other end, the same provision */
  assert.deepEqual(w.s.addressesOf({ key: "/eli/xx-port-ellery/selectboard/102", viewer: V("carol") }).addresses.map((x) => x.standard), [ids[1], ids[0]]);
  /* withdrawn: not followed */
  const w2 = w.s.lawRelationsOf({ standard: ids[1], viewer: V("bob") }).temporal.find((r) => r.type === "recodifies").id;
  w.s.lawWithdraw({ relation: w2, reason: "not a recodification", author: V("bob") });
  assert.deepEqual(w.s.addressesOf({ key: "/eli/xx-port-ellery/selectboard/100" }).addresses.map((x) => x.standard), [ids[1]]);
  /* a chain longer than the default depth (8) is cut and said so */
  for (let i = 3; i < 10; i++) assert.equal(rel("renumbers", i + 1, i, i).ok, true);
  assert.equal(rel("renumbers", 3, 2, 30).ok, true);
  const long = w.s.addressesOf({ key: "/eli/xx-port-ellery/selectboard/110" });
  assert.equal(long.truncated, true);
  assert.match(long.why, /past 8 steps/);
  assert.equal(long.addresses.length, 8);
  assert.equal(w.s.addressesOf({ key: "" }).reason, "STANDARD_NO_ID");
  for (const args of [undefined, { key: 7 }, { key: {} }]) assert.doesNotThrow(() => w.s.addressesOf(args));
  assert.ok(amend.ok);
});

test("R26 courtLink records interprets, applies or holds_invalid from an extent of a court standard's text to a portion of a held statute, regulation or ordinance, by a member; refusals as R23's, NOT_A_COURT_STANDARD for another kind and COURT_LINK_TARGET_NOT_LAW for a target of another kind; a machine's suggestion is a proposal", () => {
  const w = seeded();
  const ct = w.passage().contentId, st = w.passage().contentId, pt = w.passage().contentId;
  const court = w.declare({ cite: "12 Marlow 340", kind: "court", issuer: "Marlow Court", text: [ct] }).id;
  const statute = w.declare({ text: [st], portion: { path: "12(a)", content_id: st } }).id;
  const policy = w.declare({ cite: "Policy 4", kind: "policy", text: [pt] }).id;
  assert.deepEqual(COURT_LINKS, ["interprets", "applies", "holds_invalid"]);
  const good = { type: "interprets", from: court, to: { standard: statute, portion: "12(a)" }, citation: ct, reason: REASON,
                 author: V("bob"), viewer: V("bob") };
  for (const type of COURT_LINKS) {
    const r = w.s.courtLink({ ...good, type });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.match(r.link.id, /^clink-[0-9a-f]{24}$/);
  }
  const before = w.snapshot();
  for (const [args, code] of [[{ author: MACHINE }, "MACHINE_CANNOT_RELATE"], [{ type: "overrules" }, "LAW_RELATION_UNKNOWN"],
                              [{ from: "STD-2026-9999-x" }, "NO_SUCH_STANDARD"], [{ from: statute, citation: st }, "NOT_A_COURT_STANDARD"],
                              [{ to: policy }, "COURT_LINK_TARGET_NOT_LAW"], [{ to: { standard: statute, portion: "9" } }, "PORTION_UNKNOWN"],
                              [{ citation: st }, "LAW_RELATION_NO_CITATION"], [{ reason: "" }, "STANDARD_NO_REASON"], [{ x: 1 }, "STANDARD_FIELD_UNKNOWN"]]) {
    const r = w.s.courtLink({ ...good, ...args });
    assert.equal(codeOf(r), code, code);
    assert.equal(r.check, STANDARDS_CHECKS[code].check, code);
  }
  assert.deepEqual(w.snapshot(), before);
  const p = w.s.lawPropose({ what: "link", type: "applies", from: court, to: statute, citation: ct, why: "The court applies §12.", proposer: MACHINE });
  assert.equal(w.count("court_links"), 3, "a proposal records no link");
  const adopted = w.s.courtLink({ proposal: p.proposal.id, reason: REASON, author: V("carol"), viewer: V("carol") });
  assert.deepEqual([adopted.ok, adopted.link.type, adopted.link.proposal], [true, "applies", p.proposal.id]);
});

test("R27 courtTreat records reversed, vacated, depublished, overruled or affirmed, citing the later decision's extent; stillStanding answers not_standing on a held ending treatment effective on or before the date, standing on an affirmance so effective, and undetermined where the later history is not read, never a default of standing", () => {
  const w = seeded();
  const d = (cite, from) => { const t = w.passage().contentId; return { id: w.declare({ cite, kind: "court", issuer: "Court", text: [t], period: { from, to: null } }).id, t }; };
  const lower = d("1 Marlow 1", "2010-05-01"), appeal = d("2 Marlow 2", "2012-03-01"), later = d("3 Marlow 3", null), affirm = d("4 Marlow 4", "2011-01-01");
  assert.deepEqual(TREATMENTS, ["reversed", "vacated", "depublished", "overruled", "affirmed"]);
  assert.equal(w.s.stillStanding({ decision: lower.id, date: "2020-01-01" }).state, "undetermined", "no later history held");
  assert.match(w.s.stillStanding({ decision: lower.id, date: "2020-01-01" }).why, /later history is not read/);
  const good = { decision: lower.id, treatment: "affirmed", by_decision: affirm.id, citation: affirm.t, reason: REASON, author: V("bob"), viewer: V("bob") };
  const aff = w.s.courtTreat(good);
  assert.equal(aff.ok, true, JSON.stringify(aff).slice(0, 300));
  assert.match(aff.treatment.id, /^ctreat-[0-9a-f]{24}$/);
  assert.deepEqual(["2010-12-31", "2011-06-01"].map((date) => w.s.stillStanding({ decision: lower.id, date }).state), ["undetermined", "standing"]);
  assert.equal(w.s.courtTreat({ ...good, treatment: "reversed", by_decision: appeal.id, citation: appeal.t }).ok, true);
  const s = w.s.stillStanding({ decision: lower.id, date: "2013-01-01" });
  assert.deepEqual([s.state, s.treatments.length], ["not_standing", 2]);
  assert.match(s.why, /reversed it, effective 2012-03-01/);
  assert.equal(w.s.stillStanding({ decision: lower.id, date: "2012-02-29" }).state, "standing", "before the reversal took effect");
  /* an ending treatment whose later decision states no date: undetermined, never standing */
  assert.equal(w.s.courtTreat({ ...good, decision: affirm.id, treatment: "vacated", by_decision: later.id, citation: later.t }).ok, true);
  assert.equal(w.s.stillStanding({ decision: affirm.id, date: "2030-01-01" }).state, "undetermined");
  /* refusals */
  const statute = w.declare({ text: [w.passage().contentId] }).id;
  for (const [args, code] of [[{ author: MACHINE }, "MACHINE_CANNOT_RELATE"], [{ treatment: "criticised" }, "TREATMENT_UNKNOWN"],
                              [{ decision: "STD-2026-9999-x" }, "NO_SUCH_STANDARD"], [{ decision: statute }, "NOT_A_COURT_STANDARD"],
                              [{ by_decision: lower.id, citation: lower.t }, "LAW_RELATION_SELF"], [{ citation: lower.t }, "LAW_RELATION_NO_CITATION"],
                              [{ reason: "" }, "STANDARD_NO_REASON"]])
    assert.equal(codeOf(w.s.courtTreat({ ...good, ...args })), code, code);
  for (const [args, code] of [[{ decision: "", date: "2020-01-01" }, "STANDARD_NO_ID"], [{ decision: lower.id, date: "x" }, "STANDARD_DATE_INVALID"],
                              [{ decision: statute, date: "2020-01-01" }, "NOT_A_COURT_STANDARD"]])
    assert.equal(codeOf(w.s.stillStanding(args)), code, code);
  /* withdrawn: it no longer bears */
  w.s.lawWithdraw({ relation: aff.treatment.id, reason: "a different case", author: V("bob") });
  assert.equal(w.s.stillStanding({ decision: lower.id, date: "2011-06-01" }).state, "undetermined");
});

test("R30 no law relation, court link or treatment row is written by a machine: each act refuses a machine or empty author, and an AI's reading reaches a member only as a proposal, stored apart and labelled machine work", () => {
  const w = seeded();
  const { a, b, at } = two(w);
  const ct = w.passage().contentId;
  const court = w.declare({ cite: "9 Marlow 9", kind: "court", text: [ct] }).id;
  for (const author of [MACHINE, "class:daemon", "", null]) {
    assert.equal(codeOf(w.s.lawRelate({ type: "refers_to", from: a, to: b, citation: at, reason: REASON, author })), "MACHINE_CANNOT_RELATE");
    assert.equal(codeOf(w.s.courtLink({ type: "applies", from: court, to: a, citation: ct, reason: REASON, author })), "MACHINE_CANNOT_RELATE");
    assert.equal(codeOf(w.s.courtTreat({ decision: court, treatment: "affirmed", by_decision: court, citation: ct, reason: REASON, author })), "MACHINE_CANNOT_RELATE");
    assert.equal(codeOf(w.s.lawWithdraw({ relation: "lrel-x", reason: "r", author })), "MACHINE_CANNOT_RELATE");
  }
  assert.deepEqual(["law_relations", "court_links", "court_treatments", "law_withdrawals"].map((t) => w.count(t)), [0, 0, 0, 0]);
  const p = w.s.lawPropose({ what: "treatment", decision: court, treatment: "affirmed", why: "Read in a news report.", proposer: MACHINE });
  assert.deepEqual([p.proposal.machine_work, p.proposal.by, w.count("law_proposals"), w.count("court_treatments")], [true, MACHINE, 1, 0]);
});
