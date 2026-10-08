/* ratification R40–R48 (DEC-147; T34-85): publishing a signed case edition at a set time. `op=publishat` at the control
   plane (`publishAtOp`) and its store half (`publishat`, R40), what signing records (`checked`, R41), the scheduled
   publisher (`publishScheduled`, R42) and its registration (R43), the pre-flight's offer (R44), the hold reader (R45),
   the rows (R46) and nothing published unchecked (R48); with R3's waiting clause and R32's `publishat` arm. publication's
   R66, R67, R69 and R62 are stand-ins the test controls (its own tests hold its side); the case, its signature, its
   gate and the commit are this module's and publication's real ones. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, plane, newKey, signCase, cleanCase, fmText, CASE_BODY, V, NOW, bucketOver } from "./fixture.mjs";
import { caseRatifyOp, publishAtOp, ratificationOp, obscuredCopyKey } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines, keyFingerprint, CHECKED_PARTS, rowOf } from "../../../src/ratification/index.mjs";
import { peopleLines, memberTieLines } from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const AT = { date: "2026-10-09", time: "09:30" };
const LATER = "2026-10-09T13:30:00.000Z";

/* A /6 case document Alice (the project's owner, holding an attesting key) may sign, stored unsigned; publication's set
   time services as stand-ins; a hold reader registered unless `reader` is false. `raw` adds front-matter lines. */
async function setup({ raw = [], reader = true, mutate = (d) => d, worker = null } = {}) {
  const registered = [];
  const w = world({ steer: { registerScheduledPublisher: (p) => (registered.push(p), { ok: true }) }, worker });
  const key = await newKey(), other = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = mutate(cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] }));
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc), ...raw], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await signCase(key, CASE, 1, docSha);
  /* publication R66 (a stand-in): each call kept; the answer R66 gives, or `w.scheduleAnswer` */
  const scheduled = [];
  w.publication.scheduleEdition = (a) => (scheduled.push(a), w.scheduleAnswer
    ?? { ok: true, case: a.case, edition: a.edition, state: "waiting", at: { ...a.at, zone: "America/Halifax" }, publish_at: LATER });
  w.publication.stampsOf = () => ({ ok: true, stamps: w.stamps ?? [] });
  w.hold = { held: false };
  const holdAsked = [];
  if (reader) w.r.registerHoldReader({ holdsOn: (a) => (holdAsked.push(a), typeof w.hold === "function" ? w.hold() : w.hold) });
  const body = { caseId: CASE, edition: 1, docSha, sigArmored: sig, attestorKey: key.keyB64, attestorMember: "alice",
                 gateVersion: "g1", deliveredBy: "member:alice", at: AT };
  const op = async (fn, b, o = {}) => { const p = plane(w, o); const res = await fn(p.request(b), p.stub, p.ctx); return { ...res, p }; };
  const entry = (checked) => ({ case: CASE, edition: 1, doc_sha: docSha, signature: sig, signer: "alice",
                                delivered_by: "member:alice", at: { ...AT, zone: "America/Halifax" }, publish_at: LATER,
                                state: "waiting", checked });
  return { w, P, key, other, docSha, sig, text, body, scheduled, registered, holdAsked, op, entry };
}

const nothingCommitted = (w) => {
  assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, CASE).sig_armored, null, "the document is unsigned");
  assert.equal(w.count("published_cases"), 0, "no case edition committed");
};

/* ---------------------------------------------------------------- R40 at the control plane */

test("R40: op=publishat answers C-32.13 and C-32.15 before the payload is read and MALFORMED (an absent at included), byte-identical to op=caseratify", async () => {
  const s = await setup();
  const req = { caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig };
  for (const o of [{ aiCred: { tokenId: "t1" }, cls: "ai" }, { viaSession: false, cls: "admin" }]) {
    const a = await s.op(publishAtOp, "not json", o), b = await s.op(caseRatifyOp, "not json", o);
    assert.deepEqual([a.status, a.body], [b.status, b.body]);
    assert.deepEqual(a.p.fetched, []);
  }
  for (const bad of ["x", {}, { ...req, edition: "1" }, req, { ...req, at: "2026-10-09 09:30" }, { ...req, at: [] }]) {
    const a = await s.op(publishAtOp, bad);
    assert.deepEqual([a.status, a.body.reason], [400, "MALFORMED"], JSON.stringify(bad));
  }
  assert.deepEqual(s.scheduled, []);
  nothingCommitted(s.w);
});

test("R40: every refusal op=caseratify answers before its commit is op=publishat's, byte for byte and in R2's order (C-53.12, C-92.10, C-92.11, CASE_RATIFY_STALE, NO_SIGNERS, SIG_<reason>, GATE_REFUSED), each writing nothing", async () => {
  const s = await setup({ mutate: (d) => ({ ...d, case_scope: "" }) });
  const facts = s.w.pub.facts.get(`${CASE}#1`);
  const req = { caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig };
  const same = async (body, want) => {
    const a = await s.op(publishAtOp, { ...body, at: AT }), b = await s.op(caseRatifyOp, body);
    assert.deepEqual([a.status, a.body], [b.status, b.body], want);
    assert.match(String(a.body.reason), new RegExp(`^${want}`));
  };
  facts.attribution = { reached: [], legacy: ["INFO-2026-0008-legacy"], stated: [], current: [] };
  await same(req, "TESTIMONY_CASE_UNPUBLISHABLE");
  facts.attribution = { reached: [], legacy: [], stated: [], current: [{ observation: "INFO-2026-0009-o", level: null, why: "x" }] };
  await same(req, "ATTRIBUTION_UNCHOSEN");
  facts.attribution = { reached: [], legacy: [], stated: [], current: [{ observation: "INFO-2026-0009-o", level: "name", shown: "h" }] };
  await same(req, "ATTRIBUTION_STATEMENT_STALE");
  facts.attribution = { reached: [], legacy: [], stated: [], current: [] };
  await same({ ...req, expectedSha: "e".repeat(64) }, "CASE_RATIFY_STALE");
  const signers = facts.signers; facts.signers = [];
  await same(req, "NO_SIGNERS");
  facts.signers = signers;
  await same({ ...req, sig: await signCase(s.other, CASE, 1, s.docSha) }, "SIG_");
  await same(req, "GATE_REFUSED");
  assert.deepEqual(s.scheduled, []);
  nothingCommitted(s.w);
});

test("R40, R32: past every refusal op=publishat hands publication R66 the signature, the signer read from it, the deliverer from the session, at, checked and by, and relays its answer as given, its refusals unchanged; R32's arm reads the body", async () => {
  const s = await setup();
  const ok = await s.op(publishAtOp, { caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig, at: AT });
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.deepEqual([ok.body.ok, ok.body.state, ok.body.publish_at, ok.body.attestor.member], [true, "waiting", LATER, "alice"]);
  assert.equal(s.scheduled.length, 1);
  const a = s.scheduled[0];
  assert.deepEqual([a.case, a.edition, a.docSha, a.signature, a.signer, a.deliveredBy, a.at, a.by],
    [CASE, 1, s.docSha, s.sig, "alice", "member:alice", AT, "alice"]);
  assert.deepEqual(Object.keys(a.checked), CHECKED_PARTS);
  nothingCommitted(s.w);
  assert.deepEqual([s.w.sealCalls, s.w.levelMoves, s.w.pub.committed.length], [[], [], 1], "only the rolled-back probe reached the commit");
  for (const reason of ["PUBLISH_AT_MALFORMED", "PUBLISH_AT_NO_ZONE", "PUBLISH_AT_PAST", "PUBLISH_AT_ALREADY_SET"]) {
    s.w.scheduleAnswer = { ok: false, reason, detail: `publication's ${reason}` };
    const r = await s.op(publishAtOp, { caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig, at: AT });
    assert.deepEqual([r.status, r.body.reason, r.body.detail], [409, reason, `publication's ${reason}`]);
  }
  s.w.scheduleAnswer = null;
  const viaOps = s.w.op("publishat", {}, s.body);
  assert.deepEqual([viaOps.ok, viaOps.state], [true, "waiting"]);
  assert.equal(s.scheduled.at(-1).signer, "alice");
});

test("R40, R3: R3's refusals before its commit are op=publishat's (MALFORMED, CASE_UNSIGNED, NO_CASE_DOCUMENT, CASE_RATIFY_STALE, caseAuthority's, CASE_EDITION_ALREADY_RATIFIED, C-65.1, CASE_PRODUCTION_DIVERGED), each writing nothing", async () => {
  const s = await setup();
  const at = (b) => s.w.op("publishat", {}, b);
  assert.equal(at({ ...s.body, at: null }).reason, "MALFORMED");
  assert.equal(at({ ...s.body, gateVersion: null }).reason, "CASE_UNSIGNED");
  assert.equal(at({ ...s.body, edition: 4 }).reason, "NO_CASE_DOCUMENT");
  assert.equal(at({ ...s.body, docSha: "e".repeat(64) }).reason, "CASE_RATIFY_STALE");
  const notOwner = at({ ...s.body, attestorMember: "bo" });
  assert.deepEqual(notOwner, await s.w.op("caseratify", {}, { ...s.body, attestorMember: "bo" }), "caseAuthority's own refusal");
  assert.equal(notOwner.reason, "CASE_SIGNER_NOT_AN_OWNER");
  s.w.bv.conc.delete(s.w.key(s.P, Q1));
  assert.equal(at(s.body).reason, "CASE_CONCLUSION_MOVED");
  s.w.bv.conc.set(s.w.key(s.P, Q1), OWN);
  s.w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, CASE, "PROJ-2026-9999-other", NOW);
  assert.equal(at(s.body).reason, "CASE_PRODUCTION_DIVERGED");
  s.w.st.sql.exec(`DELETE FROM cases`);
  assert.deepEqual(s.scheduled, []);
  nothingCommitted(s.w);
  /* an edition already ratified, whatever the signature */
  const done = await s.w.r.ratifyCaseDocument(s.body);
  assert.equal(done.ok, true);
  assert.equal(at(s.body).reason, "CASE_EDITION_ALREADY_RATIFIED");
  assert.deepEqual(s.scheduled, []);
});

test("R40: a refusal publication's commit would answer now (here CASE_FORMAT_SUPERSEDED and SOURCE_CONSENT_WITHDRAWN) is op=publishat's, the commit's own answer, and nothing is written", async () => {
  const fmt = await setup({ mutate: (d) => ({ ...d, format: "bio-case-document/5" }) });
  const r = fmt.w.op("publishat", {}, fmt.body);
  assert.equal(r.reason, "CASE_FORMAT_SUPERSEDED");
  assert.equal(r.check, "C-122.2", "publication's own row (its R58)");
  assert.deepEqual(fmt.scheduled, []);
  nothingCommitted(fmt.w);
  const src = await setup({ raw: ["sources:", "  - capture: " + "c".repeat(64), '    stated: "a source told us"', "    basis: consent"] });
  const r2 = src.w.op("publishat", {}, src.body);
  assert.equal(r2.reason, "SOURCE_CONSENT_WITHDRAWN");
  assert.deepEqual(r2.captures, ["c".repeat(64)]);
  assert.deepEqual(src.scheduled, []);
  nothingCommitted(src.w);
});

test("R40, R45, R46: with no hold reader registered R41's holds cannot be read, so op=publishat answers SCHEDULE_UNCHECKABLE (C-58.6) naming it, nothing written, and op=caseratify is unchanged", async () => {
  const s = await setup({ reader: false });
  const r = s.w.op("publishat", {}, s.body);
  assert.deepEqual([r.ok, r.reason, r.check, r.translation], [false, "SCHEDULE_UNCHECKABLE", "C-58.6", rowOf("SCHEDULE_UNCHECKABLE").translation]);
  assert.match(r.unreadable.map((u) => u.what).join(), /no hold reader is registered/);
  assert.deepEqual(r.unreadable.map((u) => u.part), ["holds"]);
  assert.deepEqual(s.scheduled, []);
  nothingCommitted(s.w);
  const now = await s.w.r.ratifyCaseDocument(s.body);
  assert.equal(now.ok, true, "Publish now stays open");
});

test("R40, R41: a read R41 makes that fails or answers nothing (a hold read answering null, a money fact unread) is SCHEDULE_UNCHECKABLE naming each, never a clear reading", async () => {
  const s = await setup({ raw: peopleLines([{ person: "ENT-2026-0001-p", places: "money MNY-2026-0001", basis: "public_role", citation: "c", words: null }]) });
  s.w.hold = null;
  const r = s.w.op("publishat", {}, s.body);
  assert.equal(r.reason, "SCHEDULE_UNCHECKABLE");
  assert.deepEqual(r.unreadable.map((u) => u.what).sort(), ["money fact MNY-2026-0001", "the litigation holds"]);
  assert.deepEqual(s.scheduled, []);
});

/* ---------------------------------------------------------------- R41 */

test("R41: checked records, each part in canonical JSON with its lists ordered, the sources with their standing, each signer's declared ties to what the document names (its people, its member ties, its money facts' parties), the holds and every stamp, and the key's fingerprint; it names no author or source the document does not", async () => {
  const s = await setup({ raw: [
    ...peopleLines([{ person: "ENT-2026-0002-p", places: "statement scope; money MNY-2026-0007", basis: "public_role", citation: "c", words: null },
                    { person: "ENT-2026-0001-p", places: "claim INQ", basis: "public_role", citation: "c", words: null }]),
    ...memberTieLines([{ row: "tie", signer: null, at: null, entity: "ENT-2026-0009-org", kind: "employer", level: "group", shown: null }]),
    "accepted_work: []"] });
  s.w.moneyFacts.set("MNY-2026-0007", { from: { entity: "ENT-2026-0010-payer" }, to: { entity: "ENT-2026-0011-payee" } });
  s.w.ties.set("alice", [{ tie_id: "MTI-2", entity: "ENT-2026-0011-payee", withdrawn: null },
                         { tie_id: "MTI-1", entity: "ENT-2026-0009-org", withdrawn: null },
                         { tie_id: "MTI-3", entity: "ENT-2026-0099-unnamed", withdrawn: null }]);
  s.w.stamps = [{ effect: "seal", entry: 3 }];
  s.w.hold = { held: true, since: "2026-10-01T00:00:00Z", recorded_by: "member:bo" };
  const r = s.w.op("publishat", {}, s.body);
  assert.equal(r.ok, true, JSON.stringify(r));
  const c = s.scheduled[0].checked;
  assert.deepEqual(Object.keys(c), ["sources", "ties", "holds", "signer_key"]);
  assert.deepEqual(JSON.parse(c.sources), { accepted_work: [], sources: [] });
  assert.deepEqual(JSON.parse(c.ties), [{ member: "alice", ties: [
    { entity: "ENT-2026-0009-org", tie_id: "MTI-1", withdrawn: false },
    { entity: "ENT-2026-0011-payee", tie_id: "MTI-2", withdrawn: false }] }]);
  assert.deepEqual(s.w.tiesAsked.at(-1), { entities: ["ENT-2026-0001-p", "ENT-2026-0002-p", "ENT-2026-0009-org",
    "ENT-2026-0010-payer", "ENT-2026-0011-payee"], member: "alice", viewer: "member:alice" });
  assert.deepEqual(JSON.parse(c.holds), { project: { held: true, recorded_by: "member:bo", since: "2026-10-01T00:00:00Z" },
                                          stamps: [] }, "no edition of the case is ratified yet, so no stamp is asked");
  assert.deepEqual(s.holdAsked.at(-1), { project: s.P });
  const fp = `SHA256:${createHash("sha256").update(Buffer.from(s.key.keyB64, "base64")).digest("base64").replace(/=+$/, "")}`;
  assert.equal(JSON.parse(c.signer_key), fp);
  assert.equal(keyFingerprint(s.key.keyB64), fp);
  for (const part of Object.values(c)) assert.equal(canonicalJson(JSON.parse(part)), part, "canonical JSON");
  assert.doesNotMatch(JSON.stringify(c), /ENT-2026-0099-unnamed|MTI-3/, "a tie to nothing the document names is not recorded");
});

/* ---------------------------------------------------------------- R42, R48 */

test("R42, R48: at its time, with nothing changed, the publisher commits as R3 commits and answers published with the commit's instant; R3's discharge, R36's telling and R37's sealed weeks follow, and the steps the Worker holds are named not done", async () => {
  const s = await setup();
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  nothingCommitted(s.w);
  const out = await s.w.r.publishScheduled(s.entry(s.scheduled[0].checked), LATER);
  assert.equal(out.published, true, JSON.stringify(out));
  const row = s.w.row(`SELECT sig_armored, ratified_at, attestor_member, delivered_by FROM case_documents WHERE case_id=?`, CASE);
  assert.deepEqual([row.sig_armored, row.attestor_member, row.delivered_by], [s.sig, "alice", "member:alice"]);
  assert.equal(out.published_at, row.ratified_at);
  assert.equal(s.w.count("published_cases"), 1);
  assert.deepEqual(s.w.sealCalls, [{ case: CASE, edition: 1 }], "R37 after the commit");
  assert.equal(out.after.seals.ok, true);
  assert.match(out.after.not_done.detail, /re-sent op=caseratify/);
  const gv = s.w.pub.committed.at(-1).gateVersion;
  assert.ok(typeof gv === "string" && gv.length, "the gate version is this run's");
});

test("R42, R46: a source, a signer's tie or a hold that changed since signing stops it, one entry per cause naming what changed (C-58.7, C-58.8, C-58.9), nothing committed", async () => {
  const s = await setup({ raw: [...peopleLines([{ person: "ENT-2026-0001-p", places: "claim x", basis: "public_role", citation: "c", words: null }]),
    "sources:", "  - capture: " + "c".repeat(64), '    stated: "a source told us"', "    basis: consent"] });
  let lapsed = false;
  const real = s.w.realPub.caseCarriage;
  const ROW = { capture: "c".repeat(64), stated: "a source told us", basis: "consent" };
  const carriage = new Proxy(real, { get: (t, k) => (k === "sourcesLapsed" ? () => (lapsed ? [ROW] : [])
    : k === "acceptedWorkLapsed" ? () => null : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  Object.defineProperty(s.w.realPub, "caseCarriage", { value: carriage, configurable: true });
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  const checked = s.scheduled[0].checked;
  /* each change alone */
  s.w.ties.set("alice", [{ tie_id: "MTI-7", entity: "ENT-2026-0001-p", withdrawn: null }]);
  let out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => [x.code, x.check]), [["SCHEDULED_TIES_CHANGED", "C-58.8"]]);
  assert.equal(out.stopped[0].translation, rowOf("SCHEDULED_TIES_CHANGED").translation);
  assert.deepEqual(out.stopped[0].changed, [{ now: { member: "alice", tie: "MTI-7", withdrawn: false } }]);
  s.w.ties.set("alice", []);
  s.w.hold = { held: true, since: "2026-10-08T00:00:00Z", recorded_by: "member:bo" };
  out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => x.code), ["SCHEDULED_HOLD_CHANGED"]);
  assert.equal(out.stopped[0].check, "C-58.9");
  s.w.hold = { held: false };
  /* all three at once: one entry each, in R42's order */
  lapsed = true;
  s.w.ties.set("alice", [{ tie_id: "MTI-7", entity: "ENT-2026-0001-p", withdrawn: null }]);
  s.w.hold = { held: true };
  out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => x.check), ["C-58.7", "C-58.8", "C-58.9"]);
  assert.deepEqual(out.stopped[0].changed, [{ was: { source: { ...ROW, standing: true } } }, { now: { source: { ...ROW, standing: false } } }],
                   "the source is named, as the document names it");
  nothingCommitted(s.w);
  /* negative control: back as signed, it publishes */
  lapsed = false; s.w.ties.set("alice", []); s.w.hold = { held: false };
  assert.equal((await s.w.r.publishScheduled(s.entry(checked), LATER)).published, true);
});

test("R42, R46: a check signing passed that refuses at the time (the conclusion moved, a signer no longer active, the signature not over these bytes) stops it as SCHEDULED_CHECK_REFUSED (C-58.10) with the refusal as its cause; nothing committed", async () => {
  const s = await setup();
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  const checked = s.scheduled[0].checked;
  s.w.bv.conc.delete(s.w.key(s.P, Q1));
  let out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => [x.code, x.check, x.cause.code]), [["SCHEDULED_CHECK_REFUSED", "C-58.10", "CASE_CONCLUSION_MOVED"]]);
  assert.equal(out.stopped[0].cause.translation, rowOf("CASE_CONCLUSION_MOVED").translation);
  s.w.bv.conc.set(s.w.key(s.P, Q1), OWN);
  out = await s.w.r.publishScheduled({ ...s.entry(checked), signature: await signCase(s.other, CASE, 1, s.docSha) }, LATER);
  assert.match(out.stopped[0].cause.code, /^SIG_/);
  s.w.st.sql.exec(`UPDATE signers SET status='revoked'`);
  out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.equal(out.stopped[0].cause.code, "NO_SIGNERS");
  nothingCommitted(s.w);
});

test("R42, R45: what cannot be read at the time stops it (UNREADABLE naming what), and so does an exception inside it: it never throws and never passes", async () => {
  const s = await setup();
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  const checked = s.scheduled[0].checked;
  s.w.hold = null;
  let out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => [x.code, x.cause.code]), [["SCHEDULED_CHECK_REFUSED", "UNREADABLE"]]);
  assert.deepEqual(out.stopped[0].cause.what, ["the litigation holds"]);
  s.w.hold = () => { throw new Error("boom"); };
  out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.equal(out.stopped[0].cause.code, "UNREADABLE");
  s.w.hold = { held: false };
  s.w.caseTensions.attributionFacts = () => { throw new Error("the read fell over"); };
  out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => [x.code, x.cause.code]), [["SCHEDULED_CHECK_REFUSED", "UNREADABLE"]]);
  assert.match(out.stopped[0].cause.what[0], /the read fell over/);
  out = await s.w.r.publishScheduled(null, LATER);
  assert.equal(out.stopped[0].cause.code, "UNREADABLE");
  out = await s.w.r.publishScheduled(s.entry(undefined), LATER);
  assert.ok(out.stopped.length, "a waiting edition with no checked record is never published unchecked");
  nothingCommitted(s.w);
  /* with no hold reader registered at all */
  const bare = await setup({ reader: false });
  const ch = Object.fromEntries(Object.entries(checked));
  out = await bare.w.r.publishScheduled(bare.entry(ch), LATER);
  assert.match(out.stopped.map((x) => (x.cause.what || []).join()).join(), /no hold reader is registered/);
  nothingCommitted(bare.w);
});

test("R43: at start this module registers R42 once with publication's registerScheduledPublisher, and the registered publisher is R42", async () => {
  const s = await setup();
  assert.equal(s.registered.length, 1);
  assert.equal(typeof s.registered[0].publishScheduled, "function");
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  const out = await s.registered[0].publishScheduled(s.entry(s.scheduled[0].checked), LATER);
  assert.equal(out.published, true);
});

/* ---------------------------------------------------------------- R3, R44, R45 */

test("R3: an edition publication holds waiting is refused PUBLISH_AT_ALREADY_SET naming its set time, nothing written; the same signature and at again through op=publishat answer R66's own answer", async () => {
  const s = await setup();
  const waiting = { case: CASE, edition: 1, state: "waiting", at: { ...AT, zone: "America/Halifax" }, publish_at: LATER, checked: { sources: "x" } };
  s.w.publication.scheduledEditions = ({ case: c, state }) => ({ editions: c === CASE && state === "waiting" ? [waiting] : [], cursor: null });
  const r = await s.w.r.ratifyCaseDocument(s.body);
  assert.deepEqual([r.ok, r.reason, r.publish_at, r.at], [false, "PUBLISH_AT_ALREADY_SET", LATER, waiting.at]);
  nothingCommitted(s.w);
  s.w.scheduleAnswer = { ok: true, existed: true, case: CASE, edition: 1, state: "waiting", at: waiting.at, publish_at: LATER };
  const again = s.w.op("publishat", {}, s.body);
  assert.deepEqual(again, s.w.scheduleAnswer);
  assert.deepEqual(s.scheduled.at(-1).checked, waiting.checked, "the waiting entry's own record is handed back");
  s.w.publication.scheduledEditions = () => ({ editions: [], cursor: null });
  assert.equal((await s.w.r.ratifyCaseDocument(s.body)).ok, true, "negative control: nothing waiting, it commits");
});

test("R44: the pre-flight answers publish_at — offered with the group's zone when the active profiles hold one, else not offered, PUBLISH_AT_NO_ZONE — and its other answers are unchanged", async () => {
  const s = await setup();
  const before = s.w.r.caseRatifyPreflight({ text: s.text, signer: "alice", viewer: V("alice") });
  assert.deepEqual(before.publish_at, { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE" });
  s.w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  const after = s.w.r.caseRatifyPreflight({ text: s.text, signer: "alice", viewer: V("alice") });
  assert.deepEqual(after.publish_at, { offered: true, zone: "America/Halifax" });
  const { publish_at: a, ...restA } = before, { publish_at: b, ...restB } = after;
  assert.deepEqual(restA, restB);
  assert.deepEqual(restA, { ok: true, ready: true, refusals: [] });
});

test("R45: the hold reader is registered once; a second is refused HOLD_READER_DECLARED, and the first stays the one read", async () => {
  const s = await setup();
  const r = s.w.r.registerHoldReader({ holdsOn: () => ({ held: true }) });
  assert.equal(r.reason, "HOLD_READER_DECLARED");
  assert.equal(s.w.r.registerHoldReader({}).reason, "HOLD_READER_DECLARED");
  const fresh = await setup({ reader: false });
  assert.equal(fresh.w.r.registerHoldReader({}).reason, "MALFORMED");
  assert.equal(fresh.w.r.registerHoldReader({ holdsOn: () => ({ held: false }) }).ok, true);
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  assert.deepEqual(JSON.parse(s.scheduled[0].checked.holds).project, { held: false }, "the first reader's answer");
});

test("R48: op=publishat never commits; only R42 does, after its checks pass again and nothing changed", async () => {
  const s = await setup();
  for (let i = 0; i < 2; i++) assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  nothingCommitted(s.w);
  const stale = { ...s.scheduled[0].checked, holds: "\"something else\"" };
  const stop = await s.w.r.publishScheduled(s.entry(stale), LATER);
  assert.equal(stop.stopped[0].code, "SCHEDULED_HOLD_CHANGED");
  nothingCommitted(s.w);
  assert.equal((await s.w.r.publishScheduled(s.entry(s.scheduled[0].checked), LATER)).published, true);
  const twice = await s.w.r.publishScheduled(s.entry(s.scheduled[0].checked), LATER);
  assert.equal(twice.stopped[0].cause.code, "CASE_EDITION_ALREADY_RATIFIED", "never committed twice");
});

test("R6, R39 (with R42): a retry of the same signature on an edition committed without the Worker copies its materials and assembles its container", async () => {
  const s = await setup();
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  assert.equal((await s.w.r.publishScheduled(s.entry(s.scheduled[0].checked), LATER)).published, true);
  s.w.publication.caseEditionState = () => ({ caseId: CASE, edition: 1, complete: true, manifest_sha: null });
  const res = await s.op(caseRatifyOp, { caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.existed, true);
  assert.equal(res.p.assembled.length, 1, "the container is assembled at the retry");
  assert.ok(res.body.materials_copied);
});

test("R32, R40: ratificationOp routes publishat; any other op is not this module's", async () => {
  const s = await setup();
  const p = plane(s.w);
  const res = await ratificationOp("publishat", p.request({ caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig, at: AT }), p.stub, p.ctx);
  assert.equal(res.status, 200);
  assert.equal(ratificationOp("publishatmove", p.request({}), p.stub, p.ctx), null);
});

/* R42, R39 (T37; N757; K2206): where the publisher reaches the published bucket, R39's copy follows its commit as it
   follows R3's: an evidence-held material from `captures/`, a derived one (an obscured copy, case-carriage R1, R11) from
   where case-carriage holds it, never from `captures/`, each counted in `materials_copied`. */
test("R42, R39: at its time, with the bucket reachable, the publisher copies each evidence-held and derived material after the commit, a derived one never from captures/, and a missing one never changes the answer", async () => {
  const captures = new Map(), published = new Map();
  const env = { CAPTURES: bucketOver(captures), PUBLISHED: bucketOver(published) };
  const s = await setup({ worker: { env, storeName: "s" } });
  const A = "a1".repeat(32), D = "d4".repeat(32), E = "e5".repeat(32);
  const real = s.w.publication.commitCaseEdition;
  s.w.publication.commitCaseEdition = (a) => ({ ...real(a), materials: [{ sha: A, held: "evidence" }, { sha: D, held: "derived" },
                                                                          { sha: E, held: "derived" }, { sha: "c3".repeat(32), held: "inline" }] });
  const bytesA = new TextEncoder().encode("document A"), copyD = new TextEncoder().encode("the obscured copy D");
  captures.set(`s/captures/${A}`, bytesA); captures.set(obscuredCopyKey("s", D), copyD);
  captures.set(`s/captures/${E}`, new TextEncoder().encode("the original photo E"));
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  const out = await s.w.r.publishScheduled(s.entry(s.scheduled[0].checked), LATER);
  assert.equal(out.published, true, JSON.stringify(out));
  assert.deepEqual(out.after.materials_copied, { copied: 2, present: 0, missing: [E] });
  assert.deepEqual([published.get(`s/published/${A}`), published.get(`s/published/${D}`)], [bytesA, copyD]);
  assert.equal(published.has(`s/published/${E}`), false, "a derived material is never read from captures/");
  assert.equal(out.after.not_done, undefined);
});
