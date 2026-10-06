/* publication — T34 (T34-44, T34-79): this module no longer spreads case-tensions' ops (N597); the set-wide read of the
   court-order stamps (R64; N598, K1644); the group's self-description as the public is told it (R65; DEC-132 (3)); and
   publishing at a set time (R66–R71, R21's waiting clause; DEC-147, K1790, K1811, K1816). `ratification`'s publisher
   (R67) and `scheduler`'s listener (R71) are stand-ins each test registers; the group's zone is the test profile's
   (`jurisdictions` R41, America/Halifax, three hours behind UTC in October). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, SIG, KEY, NOW, MACHINE } from "./fixture.mjs";
import { publicationOps, SCHEDULED_EDITIONS_MAX, SCHEDULED_CHECK_UNAVAILABLE } from "../../../src/publication/index.mjs";
import { caseTensionsOps } from "../../../src/case-tensions/index.mjs";

const F = "INQ-2026-0001", CASE = "CASE-2026-0001", CASE2 = "CASE-2026-0002";
const AT = { date: "2026-10-01", time: "09:00" }, AT_UTC = "2026-10-01T12:00:00Z";   /* 09:00 in Halifax, ADT */
const ZONE = "America/Halifax";
const tick = () => new Promise((r) => setImmediate(r));
const docOf = (w, c = CASE, e = 1) => w.row(`SELECT doc_sha, text, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, c, e);

/* olive owns the project; ann is an administrator (sees every project, owns none); zed a member of nothing. A case
   edition prepared over F; the group's zone held unless `zone: false`. */
function base({ zone = true, cases = [CASE] } = {}) {
  const w = world();
  w.member("olive"); w.member("ann", { role: "admin" }); w.member("zed");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const roles = [{ target: F, version_sha: w.head(F) }];
  for (const c of cases) w.prepare(c, 1, { project: proj, roles });
  if (zone) assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  return { w, proj, roles };
}
const sched = (w, extra = {}, c = CASE) => w.record.transact(() => w.p.scheduleEdition({
  case: c, edition: 1, docSha: docOf(w, c)?.doc_sha ?? "f".repeat(64), signature: SIG(1), signer: "olive", deliveredBy: V("olive"),
  at: AT, checked: { sources: [], ties: [], holds: [] }, by: V("olive"), ...extra }));
/* ratification's publisher, played: re-checks nothing, commits through R22 as R42 commits, or stops as told. */
function publisher(w, proj, roles, { stop = null, calls = [] } = {}) {
  return { calls, publishScheduled(entry, now) {
    calls.push({ entry, now });
    if (stop) return { stopped: stop };
    const r = w.record.transact(() => w.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj,
      scope: "The question.", roster: roles.map((x) => ({ bundle_id: x.target, version_sha: x.version_sha, role: "load_bearing" })),
      sigArmored: entry.signature, attestorKey: KEY, attestorMember: entry.signer, gateVersion: "plane-gate/test",
      deliveredBy: entry.delivered_by, at: now }));
    return r.ok ? { published: true, published_at: now } : { stopped: [{ code: r.reason, translation: "no" }] };
  } };
}

/* ---------------------------------------------------------------- N597, R64, R65 */

test("N597 this module's op map no longer spreads case-tensions' ops (the plane's op map spreads them itself since T33-90)", () => {
  const { w } = base();
  const url = new URL("http://do/x");
  const mine = Object.keys(publicationOps(w.p, url, null));
  const theirs = Object.keys(caseTensionsOps(w.p.caseTensionsModule, url, null));
  assert.ok(theirs.includes("caseflags") && theirs.includes("attribute"), "the control: case-tensions' own ops");
  assert.deepEqual(mine.filter((k) => theirs.includes(k)), [], "none of case-tensions' ops is this module's");
  assert.ok(mine.includes("casedocument") && mine.includes("publishschedule"), "the control: this module's own map");
});

test("R64 stampedEditions answers, in one read, every stamped edition in case and edition order, each edition's stamps exactly as stampsOf answers them; none stamped, editions []; it writes nothing and never throws", () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  assert.deepEqual(w.p.stampedEditions(), { ok: true, editions: [] });
  for (const c of [CASE, CASE2]) assert.equal(w.signCase(c, 1, { project: proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha })) }).ok, true);
  w.prepare(CASE, 2, { project: proj, roles });
  w.signCase(CASE, 2, { project: proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha })) });
  const orders = { [`${CASE2}#7`]: { seq: 7, effect: "seal" }, [`${CASE}#3`]: { seq: 3, effect: "seal" },
                   [`${CASE}#4`]: { seq: 4, effect: "unseal" }, [`${CASE}#5`]: { seq: 5, effect: "redact" } };
  w.p.registerOrderSource("docket", { courtOrderOf: (c, e) => orders[`${c}#${e}`] || null });
  /* made out of key order: CASE2 first, then CASE edition 2 before edition 1 */
  w.record.transact(() => w.p.stampEdition({ case: CASE2, editions: [1], entry: 7, effect: "seal" }));
  w.record.transact(() => w.p.stampEdition({ case: CASE, editions: [2], entry: 5, effect: "redact", parts: ["bundle.md"] }));
  w.record.transact(() => w.p.stampEdition({ case: CASE, editions: [1], entry: 4, effect: "unseal" }));
  w.record.transact(() => w.p.stampEdition({ case: CASE, editions: "all", entry: 3, effect: "seal" }));
  const before = w.snapshot();
  const all = w.p.stampedEditions();
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(all.editions.map((e) => [e.case, e.edition]), [[CASE, 1], [CASE, 2], [CASE2, 1]]);
  for (const e of all.editions)
    assert.deepEqual(e.stamps, w.p.stampsOf({ case: e.case, edition: e.edition }).stamps, `${e.case} ${e.edition}`);
  assert.deepEqual(all.editions[0].stamps.map((s) => s.entry), [4, 3], "in the order made");
  w.prepare(CASE2, 2, { project: proj, roles });
  assert.equal(all.editions.some((e) => e.case === CASE2 && e.edition === 2), false, "an edition with no stamp is not listed");
  w.st.db.exec(`DROP TABLE edition_stamps`);
  assert.doesNotThrow(() => w.p.stampedEditions());
});

test("R65 publicGroupDescription answers the public exactly membership R110's public answer: the four texts only while the latest visibility is public, else null; never the history, who or when; it writes nothing and never throws", () => {
  const { w } = base();
  assert.deepEqual(w.p.publicGroupDescription(), { description: null }, "none recorded");
  const set = (visibility) => assert.equal(w.membership.groupDescriptionSet({ kinds: ["issue", "other"], otherKind: "Tenants",
    focus: "Rents", purpose: "Fair rents", visibility, by: "ann" }).ok, true);
  set("members");
  assert.deepEqual(w.p.publicGroupDescription(), { description: null }, "kept to members");
  set("public");
  const before = w.snapshot();
  const pub = w.p.publicGroupDescription();
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(pub, { description: { kinds: ["issue", "other"], otherKind: "Tenants", focus: "Rents", purpose: "Fair rents" } });
  assert.deepEqual(pub, w.membership.groupDescription({ viewer: null }), "membership R110's public answer, exactly");
  assert.equal(/history|"by"|"at"|visibility|ann/.test(JSON.stringify(pub)), false, "no history, who or when");
  set("members");
  assert.deepEqual(w.p.publicGroupDescription(), { description: null }, "the latest choice rules");
  const real = w.p.membership;
  w.p.membership = { groupDescription() { throw new Error("down"); } };
  try { assert.deepEqual(w.p.publicGroupDescription(), { description: null }); } finally { w.p.membership = real; }
});

/* ---------------------------------------------------------------- R66, R21 */

test("R66 scheduleEdition refuses, in order and each writing nothing, PUBLISH_AT_MALFORMED, PUBLISH_AT_NO_ZONE, PUBLISH_AT_PAST, NO_CASE_DOCUMENT, CASE_EDITION_ALREADY_RATIFIED and PUBLISH_AT_ALREADY_SET", () => {
  const { w, proj, roles } = base({ zone: false });
  const before = w.snapshot();
  const reason = (extra, c) => sched(w, extra, c).reason;
  for (const at of [null, { date: "2026-02-30", time: "09:00" }, { date: "2026-10-01", time: "24:00" },
                    { date: "2026-10-01", time: "9:00" }, { date: "1 Oct", time: "09:00" }, { date: "2026-10-01" }])
    assert.equal(reason({ at }), "PUBLISH_AT_MALFORMED", JSON.stringify(at));
  assert.equal(reason({ at: { date: "2026-09-01", time: "00:00" } }), "PUBLISH_AT_NO_ZONE", "malformed first, then no zone, before the past");
  assert.equal(reason({}), "PUBLISH_AT_NO_ZONE", "never read as UTC");
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
  const zoned = w.snapshot();
  assert.equal(reason({ at: { date: "2026-09-27", time: "21:59" }, docSha: "0".repeat(64) }), "PUBLISH_AT_PAST", "the past before the document");
  assert.equal(reason({ at: { date: "2026-09-27", time: "22:01" }, docSha: "0".repeat(64) }), "NO_CASE_DOCUMENT", "22:01 in Halifax is after 01:00Z");
  assert.equal(reason({ at: { date: "2026-09-27", time: "22:00" } }), "PUBLISH_AT_PAST", "01:00Z is 22:00 the day before in Halifax: not after now");
  assert.equal(reason({ docSha: "0".repeat(64) }), "NO_CASE_DOCUMENT");
  assert.equal(reason({}, CASE2), "NO_CASE_DOCUMENT", "never authored");
  assert.deepEqual(w.snapshot(), zoned, "each refusal wrote nothing");
  assert.equal(before.scheduled_editions, zoned.scheduled_editions);
  /* signed and published at signing: already ratified */
  const b2 = base();
  assert.equal(b2.w.signCase(CASE, 1, { project: b2.proj, roster: b2.roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha })) }).ok, true);
  const w2snap = b2.w.snapshot();
  assert.equal(sched(b2.w).reason, "CASE_EDITION_ALREADY_RATIFIED");
  assert.deepEqual(b2.w.snapshot(), w2snap);
  /* a waiting edition: the same call again is existed, any other time PUBLISH_AT_ALREADY_SET with the waiting entry */
  assert.equal(sched(w).ok, true);
  const held = w.snapshot();
  assert.deepEqual(sched(w), { ok: true, existed: true, case: CASE, edition: 1, state: "waiting",
                               at: { ...AT, zone: ZONE }, publish_at: AT_UTC });
  const again = sched(w, { at: { date: "2026-10-02", time: "09:00" } });
  assert.deepEqual([again.ok, again.reason, again.waiting.state, again.waiting.publish_at], [false, "PUBLISH_AT_ALREADY_SET", "waiting", AT_UTC]);
  assert.deepEqual(w.snapshot(), held, "neither wrote");
  void proj; void roles;
});

test("R66 a set time records one waiting edition with its signature held beside the document, never on it: until published, R1, R2, R12 and R29 answer the document as unsigned, and nothing of the edition is public", () => {
  const { w, proj, roles } = base();
  const prepared = docOf(w);
  const r = sched(w);
  assert.deepEqual(r, { ok: true, case: CASE, edition: 1, state: "waiting", at: { ...AT, zone: ZONE }, publish_at: AT_UTC });
  const row = w.row(`SELECT * FROM scheduled_editions`);
  assert.deepEqual([row.doc_sha, row.sig_armored, row.signer, row.delivered_by, row.signed_at, row.set_by, row.state, JSON.parse(row.checked)],
                   [prepared.doc_sha, SIG(1), "olive", V("olive"), NOW, V("olive"), "waiting", { sources: [], ties: [], holds: [] }]);
  assert.deepEqual(docOf(w), prepared, "the document is untouched: no signature on it");
  /* R1, R2, R29: unsigned to its project's members, and to anybody else exactly as a document that does not exist */
  const mine = w.p.caseDocument(CASE, 1, V("olive"));
  assert.deepEqual([mine.ok, mine.ratified, mine.sig_armored, mine.signed_at, mine.published_at], [true, false, null, null, null]);
  const unseen = JSON.stringify(w.p.caseDocument(CASE, 1, V("zed"))).replaceAll(CASE, "X");
  assert.equal(unseen, JSON.stringify(w.p.caseDocument(CASE2, 1, V("zed"))).replaceAll(CASE2, "X"), "as one never authored");
  assert.equal(w.p.caseDocumentFacts(CASE, 1, V("zed")).reason, "NO_CASE_DOCUMENT");
  /* R12: its exclusions answer only to standing; nothing is in the published projection */
  for (const t of ["published_cases", "published_case_members", "cases"]) assert.equal(w.count(t), 0, t);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_shas WHERE kind='case_document'`).n, 0);
  assert.equal(w.p.caseEditionState(CASE, 1), null);
  assert.deepEqual(w.p.publishedEditionsOf({ finding: F }).items, []);
  void proj; void roles;
});

test("R21 a document R66 holds waiting counts as signed: neither storeCaseDocument nor reauthorSection replaces or re-authors it; after R68's cancel it is an unsigned preparation again", () => {
  const { w, proj, roles } = base();
  sched(w);
  const held = docOf(w);
  const s = w.p.storeCaseDocument({ case: CASE, edition: 1, text: held.text + "\nchanged", author: V("olive") });
  assert.deepEqual([s.ok, s.stored, s.doc_sha], [true, false, held.doc_sha], "answers what the store holds");
  const a = w.p.reauthorSection({ case: CASE, edition: 1, docSha: held.doc_sha, section: "acknowledgements",
                                  lines: { frontmatter: [], body: [] } });
  assert.deepEqual([a.ok, a.reauthored, a.doc_sha], [true, false, held.doc_sha]);
  assert.match(a.why, /waits to be published/);
  assert.deepEqual(docOf(w), held);
  assert.equal(w.p.publishAtCancel({ case: CASE, edition: 1, by: V("olive") }).ok, true);
  const again = w.p.storeCaseDocument({ case: CASE, edition: 1, text: held.text + "\nchanged", author: V("olive") });
  assert.equal(again.stored, true, "a cancelled edition's document is a preparation again");
  assert.equal(docOf(w).sig_armored, null, "the signature was never committed");
  void proj; void roles;
});

/* ---------------------------------------------------------------- R67 */

test("R67 publishWake answers the earliest waiting publish_at or null; publishDue takes each due edition in publish_at order, hands it with its checked to the one publisher, and it is published once, with its published_at", async () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  assert.equal(w.p.publishWake(), null);
  sched(w, { at: { date: "2026-10-02", time: "09:00" } }, CASE2);
  sched(w);
  assert.equal(w.p.publishWake(), AT_UTC, "the earliest");
  const pub = publisher(w, proj, roles);
  assert.deepEqual(w.p.registerScheduledPublisher("ratification", pub), { ok: true, module: "ratification" });
  assert.equal(w.p.registerScheduledPublisher("other", pub).reason, "PROVIDER_DECLARED");
  /* not yet due: nothing taken */
  assert.deepEqual(w.p.publishDue("2026-10-01T11:59:59Z"), { ok: true, taken: [] });
  assert.equal(pub.calls.length, 0);
  /* a late alarm: taken when checked, both instants kept; an instant spelled with milliseconds compares as an instant */
  const late = "2026-10-01T15:30:00.000Z";
  w.clock.now = late;
  const out = w.p.publishDue(late);
  assert.deepEqual(out.taken, [{ case: CASE, edition: 1, state: "published", published_at: late }], "only the due one");
  assert.equal(pub.calls.length, 1);
  assert.deepEqual([pub.calls[0].now, pub.calls[0].entry.checked, pub.calls[0].entry.signature, pub.calls[0].entry.doc_sha,
                    pub.calls[0].entry.publish_at], [late, { sources: [], ties: [], holds: [] }, SIG(1), docOf(w).doc_sha, AT_UTC]);
  const e = w.p.scheduledEditions({ case: CASE }).editions[0];
  assert.deepEqual([e.state, e.publish_at, e.outcome_at, e.signed_at], ["published", AT_UTC, late, NOW]);
  assert.equal(docOf(w).sig_armored, SIG(1), "committed through R22");
  assert.equal(w.p.publishWake(), "2026-10-02T12:00:00Z");
  /* never tried again */
  w.p.publishDue("2026-10-01T23:00:00Z");
  assert.equal(pub.calls.length, 1);
  /* both due at once: taken in publish_at order */
  const order = [];
  const w2 = base({ cases: [CASE, CASE2] });
  sched(w2.w, { at: { date: "2026-10-01", time: "10:00" } }, CASE);
  sched(w2.w, { at: { date: "2026-10-01", time: "08:00" } }, CASE2);
  w2.w.p.registerScheduledPublisher({ publishScheduled: (en) => { order.push(en.case); return { stopped: [{ code: "X", translation: "x" }] }; } });
  w2.w.p.publishDue("2026-10-02T00:00:00Z");
  assert.deepEqual(order, [CASE2, CASE]);
});

test("R67 with no publisher, a publisher that throws, or one that gives neither answer, a due edition is stopped SCHEDULED_CHECK_UNAVAILABLE and never published unchecked; a publisher's stop is kept with its reasons; a stopped edition committed nothing and is never tried again", () => {
  const cases = [
    [null, [SCHEDULED_CHECK_UNAVAILABLE]],
    [{ publishScheduled() { throw new Error("boom"); } }, [SCHEDULED_CHECK_UNAVAILABLE]],
    [{ publishScheduled() { return { published: true }; } }, [SCHEDULED_CHECK_UNAVAILABLE]],   /* claims, commits nothing */
    [{ publishScheduled() { return {}; } }, [SCHEDULED_CHECK_UNAVAILABLE]],
    [{ publishScheduled() { return { stopped: [{ code: "SCHEDULED_SOURCES_CHANGED", check: "C-58.7", translation: "A source changed." }] }; } },
     [{ code: "SCHEDULED_SOURCES_CHANGED", check: "C-58.7", translation: "A source changed." }]],
  ];
  for (const [pub, reasons] of cases) {
    const { w } = base();
    sched(w);
    if (pub) w.p.registerScheduledPublisher("ratification", pub);
    const before = w.snapshot(["case_documents", "published_cases", "published_case_members", "published_shas", "cases"]);
    const out = w.p.publishDue("2026-10-01T12:00:00Z");
    assert.deepEqual(out.taken, [{ case: CASE, edition: 1, state: "stopped", reasons }]);
    assert.deepEqual(w.snapshot(["case_documents", "published_cases", "published_case_members", "published_shas", "cases"]), before,
                     "nothing committed");
    const e = w.p.scheduledEditions({}).editions[0];
    assert.deepEqual([e.state, e.reasons, e.outcome_at], ["stopped", reasons, "2026-10-01T12:00:00Z"]);
    assert.deepEqual(w.p.publishDue("2026-10-09T00:00:00Z").taken, [], "never tried again");
    assert.equal(w.p.publishWake(), null);
  }
  assert.equal(typeof SCHEDULED_CHECK_UNAVAILABLE.translation, "string");
  assert.equal(/instance|copy|plane|server/i.test(SCHEDULED_CHECK_UNAVAILABLE.translation), false, "DEC-149: the member's words");
  const { w } = base();
  assert.equal(w.p.registerScheduledPublisher("ratification", {}).reason, "PROVIDER_MALFORMED");
});

/* ---------------------------------------------------------------- R68 */

test("R68 publishAtMove and publishAtCancel refuse, in order and each writing nothing: MACHINE_CANNOT_SCHEDULE_PUBLISH, NOT_WAITING (one answer without standing; naming the state once it no longer waits or its time has come), NOT_A_CASE_OWNER, and for a move R66's refusals of at", () => {
  const { w } = base();
  const none = w.p.publishAtCancel({ case: CASE, edition: 1, by: V("olive") });
  assert.equal(none.reason, "NOT_WAITING");
  sched(w);
  const before = w.snapshot();
  for (const act of ["publishAtMove", "publishAtCancel"]) {
    const call = (by, extra = {}) => w.p[act]({ case: CASE, edition: 1, at: { date: "2026-10-03", time: "07:30" }, by, ...extra });
    for (const by of [MACHINE, "class:admin", null, "", "nobody"])
      assert.equal(call(by).reason, "MACHINE_CANNOT_SCHEDULE_PUBLISH", `${act} ${by}`);
    assert.equal(call(MACHINE, { case: CASE2 }).reason, "MACHINE_CANNOT_SCHEDULE_PUBLISH", "before anything else");
    assert.deepEqual(call(V("zed")), none, "no standing: as if none waited, byte-identical");
    assert.deepEqual(call(V("olive"), { case: CASE2 }), none);
    assert.equal(call(V("ann")).reason, "NOT_A_CASE_OWNER", "standing, not an owner");
    assert.equal(call("admin").reason, "NOT_A_CASE_OWNER", "the founder owns no project");
  }
  const mv = (at) => w.p.publishAtMove({ case: CASE, edition: 1, at, by: V("olive") }).reason;
  assert.equal(mv({ date: "2026-10-03", time: "25:00" }), "PUBLISH_AT_MALFORMED");
  assert.equal(mv({ date: "2026-09-01", time: "07:30" }), "PUBLISH_AT_PAST");
  assert.equal(w.p.publishAtMove({ case: CASE, edition: 1, at: AT, by: V("ann") }).reason, "NOT_A_CASE_OWNER", "the owner before at");
  assert.deepEqual(w.snapshot(), before, "each refusal wrote nothing");
  /* its time has come: NOT_WAITING naming its state */
  w.clock.now = "2026-10-01T12:00:00Z";
  const come = w.p.publishAtCancel({ case: CASE, edition: 1, by: V("olive") });
  assert.deepEqual([come.reason, come.state], ["NOT_WAITING", "waiting"]);
  w.p.publishDue("2026-10-01T12:00:00Z");
  const gone = w.p.publishAtMove({ case: CASE, edition: 1, at: AT, by: V("olive") });
  assert.deepEqual([gone.reason, gone.state], ["NOT_WAITING", "stopped"]);
});

test("R68 a move records the new at and publish_at, keeping each earlier time with who moved it and when; a cancel makes the edition cancelled with who and when; each answers R69's entry", () => {
  const { w, proj } = base();
  sched(w);
  w.clock.now = "2026-09-29T00:00:00Z";
  const m1 = w.p.publishAtMove({ case: CASE, edition: 1, at: { date: "2026-10-03", time: "07:30" }, by: V("olive") });
  assert.deepEqual(m1, { ok: true, ...w.p.scheduledEditions({}).editions[0] });
  assert.deepEqual([m1.state, m1.at, m1.publish_at, m1.project], ["waiting", { date: "2026-10-03", time: "07:30", zone: ZONE },
                                                                  "2026-10-03T10:30:00Z", proj]);
  assert.deepEqual(m1.moves, [{ at: { ...AT, zone: ZONE }, publish_at: AT_UTC, moved_by: V("olive"), moved_at: "2026-09-29T00:00:00Z" }]);
  const m2 = w.p.publishAtMove({ case: CASE, edition: 1, at: AT, by: V("olive") });
  assert.deepEqual(m2.moves.map((x) => x.publish_at), [AT_UTC, "2026-10-03T10:30:00Z"], "each earlier time kept");
  assert.equal(w.p.publishWake(), AT_UTC);
  w.clock.now = "2026-09-30T00:00:00Z";
  const c = w.p.publishAtCancel({ case: CASE, edition: 1, by: V("olive") });
  assert.deepEqual(c, { ok: true, ...w.p.scheduledEditions({}).editions[0] });
  assert.deepEqual([c.state, c.outcome_at, w.row(`SELECT cancelled_by FROM scheduled_editions`).cancelled_by],
                   ["cancelled", "2026-09-30T00:00:00Z", V("olive")]);
  assert.equal(w.p.publishWake(), null);
  assert.equal(w.op("publishatcancel", { by: V("olive") }, { case: CASE, edition: 1 }).reason, "NOT_WAITING", "the op, `by` the stamp");
  /* a new signing may wait again */
  assert.equal(sched(w).ok, true);
  assert.equal(w.op("publishatmove", { by: V("olive") }, { case: CASE, edition: 1, at: { date: "2026-10-05", time: "09:00" } }).publish_at,
               "2026-10-05T12:00:00Z");
});

/* ---------------------------------------------------------------- R69 */

test("R69 scheduledEditions answers each edition's state, signer, setter, both times and moves in publish_at order, paged by cursor; a viewer without standing is answered as if none existed; read as the plane every edition answers; it writes nothing", () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  w.prepare("CASE-2026-0003", 1, { project: proj, roles });
  sched(w, { at: { date: "2026-10-03", time: "09:00" } }, CASE2);
  sched(w, {}, CASE);
  sched(w, { at: { date: "2026-10-02", time: "09:00" } }, "CASE-2026-0003");
  w.p.publishAtCancel({ case: "CASE-2026-0003", edition: 1, by: V("olive") });
  const before = w.snapshot();
  const all = w.p.scheduledEditions({});
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(all.editions.map((e) => [e.case, e.state]), [[CASE, "waiting"], ["CASE-2026-0003", "cancelled"], [CASE2, "waiting"]]);
  assert.deepEqual(Object.keys(all.editions[0]).sort(), ["at", "case", "edition", "moves", "outcome_at", "project", "publish_at",
                                                         "reasons", "set_by", "signed_at", "signer", "state"].sort());
  assert.deepEqual([all.editions[0].signer, all.editions[0].set_by, all.editions[0].signed_at, all.editions[0].at, all.editions[0].reasons],
                   ["olive", V("olive"), NOW, { ...AT, zone: ZONE }, null]);
  assert.equal(all.cursor, null);
  /* paged */
  const p1 = w.p.scheduledEditions({ limit: 2 });
  assert.deepEqual([p1.editions.length, p1.limit], [2, 2]);
  assert.ok(p1.cursor);
  const p2 = w.p.scheduledEditions({ limit: 2, after: p1.cursor });
  assert.deepEqual([...p1.editions, ...p2.editions], all.editions);
  assert.equal(p2.cursor, null);
  assert.equal(w.p.scheduledEditions({ limit: 99999 }).limit, SCHEDULED_EDITIONS_MAX);
  assert.equal(w.p.scheduledEditions({ limit: 0 }).limit, SCHEDULED_EDITIONS_MAX);
  /* filters */
  assert.deepEqual(w.p.scheduledEditions({ state: "cancelled" }).editions.map((e) => e.case), ["CASE-2026-0003"]);
  assert.deepEqual(w.p.scheduledEditions({ case: CASE2 }).editions.map((e) => e.case), [CASE2]);
  assert.equal(w.p.scheduledEditions({ state: "late" }).reason, "MALFORMED");
  /* viewers: the project's member and an administrator see them; anybody else, and the op with no viewer, see none */
  assert.deepEqual(w.p.scheduledEditions({ viewer: V("olive") }).editions, all.editions);
  assert.deepEqual(w.p.scheduledEditions({ viewer: V("ann") }).editions, all.editions);
  for (const viewer of [V("zed"), "", "nobody"])
    assert.deepEqual(w.p.scheduledEditions({ viewer }), { ok: true, editions: [], limit: SCHEDULED_EDITIONS_MAX, cursor: null });
  assert.deepEqual(w.op("publishschedule", {}).editions, [], "the op without the control plane's viewer stamp answers none");
  assert.deepEqual(w.op("publishschedule", { viewer: V("olive"), state: "waiting" }).editions.map((e) => e.case), [CASE, CASE2]);
});

/* ---------------------------------------------------------------- R70 */

test("R70 every published case edition answers signed_at and published_at in R53's document and R1's answer: one instant for an edition published at signing or committed before T34; the ceremony's and the commit's for one published at a set time", () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
  /* published at signing */
  w.signCase(CASE, 1, { project: proj, roster, at: "2026-09-28T02:00:00Z" });
  w.signFinding(F);
  const d1 = w.p.caseEditionState(CASE, 1).document;
  assert.deepEqual([d1.signed_at, d1.published_at, d1.ratified_at], ["2026-09-28T02:00:00Z", "2026-09-28T02:00:00Z", "2026-09-28T02:00:00Z"]);
  const r1 = w.p.caseDocument(CASE, 1, null);
  assert.deepEqual([r1.signed_at, r1.published_at], ["2026-09-28T02:00:00Z", "2026-09-28T02:00:00Z"]);
  /* published at a set time: signed at the ceremony, published at the commit */
  sched(w, {}, CASE2);
  w.p.registerScheduledPublisher("ratification", publisher(w, proj, roles));
  w.p.publishDue("2026-10-01T12:00:05Z");
  const d2 = w.p.caseEditionState(CASE2, 1).document;
  assert.deepEqual([d2.signed_at, d2.published_at], [NOW, "2026-10-01T12:00:05Z"]);
  assert.deepEqual([w.p.caseDocument(CASE2, 1, null).signed_at, w.p.caseDocument(CASE2, 1, null).published_at], [NOW, "2026-10-01T12:00:05Z"]);
  /* committed before T34: no signed_at recorded, read as its ratification instant */
  w.prepare(CASE, 2, { project: proj, roles });
  w.signLegacy(CASE, 2, { project: proj, roster, at: "2026-01-01T00:00:00Z" });
  w.st.sql.exec(`UPDATE case_documents SET signed_at=NULL WHERE case_id=? AND edition=2`, CASE);
  const d3 = w.p.caseDocument(CASE, 2, null);
  assert.deepEqual([d3.signed_at, d3.published_at], ["2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"]);
});

/* ---------------------------------------------------------------- R71 */

test("R71 onPublishScheduled: one registration per module, refused through membership.listenerRefusal; fn({publishAt}) is called once after R66 (after the caller's transaction), R68's move and cancel, and R67's take, with publishWake as it then stands; a throwing fn never undoes the act and the notice writes nothing", async () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  const heard = [];
  assert.deepEqual(w.p.onPublishScheduled("scheduler", (x) => heard.push(x)), { ok: true, module: "scheduler" });
  const dup = w.p.onPublishScheduled("scheduler", () => {});
  assert.deepEqual([dup.ok, dup.reason, dup.module], [false, "LISTENER_DECLARED", "scheduler"]);
  assert.equal(w.p.onPublishScheduled("", () => {}).reason, "LISTENER_MALFORMED");
  assert.equal(w.p.onPublishScheduled("x", null).reason, "LISTENER_MALFORMED");
  assert.equal(w.p.onPublishScheduled("thrower", () => { throw new Error("no"); }).ok, true);
  /* R66: inside the caller's transaction nothing is told; after it, once */
  w.record.transact(() => { w.p.scheduleEdition({ case: CASE, edition: 1, docSha: docOf(w).doc_sha, signature: SIG(1),
    signer: "olive", deliveredBy: V("olive"), at: AT, checked: {}, by: V("olive") }); assert.equal(heard.length, 0); });
  await tick();
  assert.deepEqual(heard, [{ publishAt: AT_UTC }]);
  /* the same call again is no act */
  sched(w); await tick();
  assert.equal(heard.length, 1);
  /* a set time whose transaction rolls back is told the wake as it then stands */
  assert.throws(() => w.record.transact(() => { sched(w, { at: { date: "2026-09-30", time: "09:00" } }, CASE2); throw new Error("rollback"); }));
  await tick();
  assert.deepEqual(heard.at(-1), { publishAt: AT_UTC });
  assert.equal(w.count("scheduled_editions"), 1);
  /* R68 */
  const snap = w.snapshot();
  w.p.publishAtMove({ case: CASE, edition: 1, at: { date: "2026-10-02", time: "09:00" }, by: V("olive") });
  assert.deepEqual(heard.at(-1), { publishAt: "2026-10-02T12:00:00Z" });
  assert.notDeepEqual(w.snapshot(), snap, "the move stands though a listener threw");
  sched(w, { at: { date: "2026-09-30", time: "09:00" } }, CASE2); await tick();
  assert.deepEqual(heard.at(-1), { publishAt: "2026-09-30T12:00:00Z" });
  w.p.publishAtCancel({ case: CASE2, edition: 1, by: V("olive") });
  assert.deepEqual(heard.at(-1), { publishAt: "2026-10-02T12:00:00Z" });
  /* R67's take */
  w.p.registerScheduledPublisher("ratification", publisher(w, proj, roles));
  const n = heard.length;
  const before = w.snapshot();
  w.p.publishDue("2026-10-02T12:00:00Z");
  assert.deepEqual(heard.slice(n), [{ publishAt: null }], "once per edition taken, none waiting now");
  assert.notDeepEqual(w.snapshot(), before);
  /* a refused act tells nobody */
  const m = heard.length;
  w.p.publishAtCancel({ case: CASE, edition: 1, by: V("olive") });
  assert.equal(heard.length, m);
});

/* ---------------------------------------------------------------- R31 for the new table */

test("R31 R66 a waiting, stopped or cancelled edition is working material, cleared by the whole-store purge with its unsigned document; a published one keeps when it was signed", () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  sched(w, {}, CASE2);
  sched(w, { at: { date: "2026-10-05", time: "09:00" } }, CASE);
  w.p.registerScheduledPublisher("ratification", publisher(w, proj, roles));
  w.p.publishDue("2026-10-01T12:00:00Z");
  assert.deepEqual(w.rows(`SELECT case_id, state FROM scheduled_editions ORDER BY case_id`),
                   [{ case_id: CASE, state: "waiting" }, { case_id: CASE2, state: "published" }]);
  w.record.purge({});
  assert.deepEqual(w.rows(`SELECT case_id, state FROM scheduled_editions`), [{ case_id: CASE2, state: "published" }]);
  assert.deepEqual(w.rows(`SELECT case_id FROM case_documents`), [{ case_id: CASE2 }]);
  assert.equal(w.p.caseEditionState(CASE2, 1).document.signed_at, NOW);
});
