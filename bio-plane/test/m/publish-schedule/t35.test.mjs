/* publish-schedule — T41-37 (K624's copy of publication's `t35.test.mjs`, re-labelled: publication R74 → R7, R33/R67's
   C-122.5 → R9, R2): the waiting edition read `case-authoring` calls (R7; N681, K1833), and the row of a stop no
   publisher could check, C-122.5, moved here with its number and translation (R9; N687, K1839). Driven at the module's
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG } from "./fixture.mjs";
import { SCHEDULED_CHECK_UNAVAILABLE, PUBLISH_SCHEDULE_CHECKS } from "../../../src/publish-schedule/index.mjs";
import { rowOf } from "../../../src/publish-schedule/checks.mjs";

const CASE = "CASE-2026-0001";

/* ---------------------------------------------------------------- R7, R9 (C-122.5) */

const AT = { date: "2026-10-01", time: "09:00" };
function waiting() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry("INQ-2026-0001");
  const roles = [{ target: "INQ-2026-0001", version_sha: w.head("INQ-2026-0001") }];
  for (const id of [CASE, "CASE-2026-0002"]) w.prepare(id, 1, { project: proj, roles });
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  const sched = (id = CASE, at = AT) => w.record.transact(() => w.ps.scheduleEdition({ case: id, edition: 1,
    docSha: w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, id).doc_sha, signature: SIG(1),
    signer: "olive", deliveredBy: V("olive"), at, checked: {}, by: V("olive") }));
  return { w, proj, roles, sched };
}

test("R7 waitingEditionOf answers the case's one waiting edition as {case, edition, doc_sha, at, publish_at}, or null when none was set or it was published, stopped or cancelled; viewer-free, it writes nothing and never throws, a malformed case id answering null", async () => {
  const { w, sched } = waiting();
  assert.equal(w.ps.waitingEditionOf(CASE), null, "none set");
  assert.equal(sched().ok, true);
  const docSha = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE).doc_sha;
  const before = w.snapshot();
  assert.deepEqual(w.ps.waitingEditionOf(CASE), { case: CASE, edition: 1, doc_sha: docSha,
    at: { ...AT, zone: "America/Halifax" }, publish_at: "2026-10-01T12:00:00Z" });
  assert.deepEqual(w.ps.waitingEditionOf(` ${CASE} `), w.ps.waitingEditionOf(CASE), "the id trimmed");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.equal(w.ps.waitingEditionOf("CASE-2026-0002"), null, "another case's edition does not wait");
  for (const bad of [null, undefined, "", 7, {}, []]) assert.equal(w.ps.waitingEditionOf(bad), null, JSON.stringify(bad));
  /* cancelled, stopped, published: none waits */
  assert.equal(w.ps.publishAtCancel({ case: CASE, edition: 1, by: V("olive") }).ok, true);
  assert.equal(w.ps.waitingEditionOf(CASE), null, "cancelled");
  sched();
  await w.ps.publishDue("2026-10-01T12:00:00Z");
  assert.equal(w.ps.scheduledEditions({ case: CASE }).editions.at(-1).state, "stopped");
  assert.equal(w.ps.waitingEditionOf(CASE), null, "stopped");
  const { w: w2, proj, roles, sched: s2 } = waiting();
  s2();
  w2.ps.registerScheduledPublisher("ratification", { publishScheduled(entry, now) {
    w2.record.transact(() => w2.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj, scope: "The question.",
      roster: roles.map((x) => ({ bundle_id: x.target, version_sha: x.version_sha })), sigArmored: entry.signature,
      attestorKey: "AAAA", attestorMember: entry.signer, gateVersion: "plane-gate/test", deliveredBy: entry.delivered_by, at: now }));
    return { published: true, published_at: now };
  } });
  await w2.ps.publishDue("2026-10-01T12:00:00Z");
  assert.equal(w2.ps.scheduledEditions({ case: CASE }).editions[0].state, "published");
  assert.equal(w2.ps.waitingEditionOf(CASE), null, "published");
  w2.st.db.exec(`DROP TABLE scheduled_editions`);
  assert.equal(w2.ps.waitingEditionOf(CASE), null, "never throws");
});

test("R9 R2 (N687) a waiting edition no publisher could check is stopped with row C-122.5, SCHEDULED_CHECK_UNAVAILABLE, moved here with its number and translation unchanged and its where this module's site: its reasons carry the code, the check and the translation R2 answers", async () => {
  assert.deepEqual(Object.keys(PUBLISH_SCHEDULE_CHECKS), ["SCHEDULED_CHECK_UNAVAILABLE"], "the one row this module raises");
  assert.equal(PUBLISH_SCHEDULE_CHECKS.SCHEDULED_CHECK_UNAVAILABLE.where,
               "src/publish-schedule/schedule.mjs unchecked > is-scheduled-check-available");
  assert.throws(() => rowOf("SCHEDULED_SOURCES_CHANGED"), /no row/, "the negative control: a code with no row here throws");
  assert.deepEqual(SCHEDULED_CHECK_UNAVAILABLE, rowOf("SCHEDULED_CHECK_UNAVAILABLE"));
  assert.deepEqual(SCHEDULED_CHECK_UNAVAILABLE, { code: "SCHEDULED_CHECK_UNAVAILABLE", check: "C-122.5",
    translation: "This edition was not published at its set time, because the checks it needed then could not be run. "
      + "Nothing was published. Sign it again to publish it." });
  for (const pub of [null, { publishScheduled() { throw new Error("boom"); } }, { publishScheduled: () => ({}) }]) {
    const { w, sched } = waiting();
    sched();
    if (pub) w.ps.registerScheduledPublisher("ratification", pub);
    const out = await w.ps.publishDue("2026-10-01T12:00:00Z");
    assert.deepEqual(out.taken[0].reasons, [{ code: "SCHEDULED_CHECK_UNAVAILABLE", check: "C-122.5",
                                              translation: SCHEDULED_CHECK_UNAVAILABLE.translation }]);
    assert.deepEqual(w.ps.scheduledEditions({}).editions[0].reasons, out.taken[0].reasons, "R4 answers the row");
  }
});
