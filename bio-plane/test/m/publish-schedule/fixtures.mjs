/* publish-schedule's fixtures for the modules that use it (K4990, K4993, K4995, K5044). Each is made by this module's real
 * code when it is called, never stored: a user's test calls it and checks the answer it gets. The world is this module's
 * own test world (`./fixture.mjs`): a case edition prepared over an inquiry, the group's zone held unless a fixture says
 * otherwise. Refusals write nothing, so one world serves the three that need no waiting edition. */
import { world, V, SIG } from "./fixture.mjs";

const F = "INQ-2026-0001", CASE = "CASE-2026-0001";
const AT = { date: "2026-10-01", time: "09:00" }, LATER = { date: "2026-10-02", time: "09:00" };
const PAST = { date: "2026-09-27", time: "21:59" };

/* One case edition prepared over F, signed by nobody yet; its zone held unless `zone` is false. */
function caseWorld({ zone = true } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: w.head(F) }] });
  if (zone) {
    const set = w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
    if (set.ok !== true) throw new Error(`scheduleRefusals: the zone was not held: ${JSON.stringify(set)}`);
  }
  return w;
}

/* `scheduleEdition` for the case edition, as ratification's `op=publishat` calls it: a signature, the signer and the
 * time, inside one transaction. */
function schedule(w, at) {
  const doc = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE);
  return w.record.transact(() => w.ps.scheduleEdition({
    case: CASE, edition: 1, docSha: doc.doc_sha, signature: SIG(1), signer: "olive", deliveredBy: V("olive"), at,
    checked: { sources: [], ties: [], holds: [] }, by: V("olive") }));
}

/** The four refusals of `scheduleEdition`'s time (R1), each the real answer of the real call, keyed by its code:
 *  PUBLISH_AT_MALFORMED (a date that is not a day), PUBLISH_AT_NO_ZONE (no zone held), PUBLISH_AT_PAST (not after now),
 *  and PUBLISH_AT_ALREADY_SET (a second time for an edition that already waits, with the waiting entry). */
export function scheduleRefusals() {
  const zoned = caseWorld();
  const malformed = schedule(zoned, { date: "2026-02-30", time: "09:00" });
  const past = schedule(zoned, PAST);
  const unzoned = schedule(caseWorld({ zone: false }), AT);

  const set = schedule(zoned, AT);
  if (set.ok !== true) throw new Error(`scheduleRefusals: the first time was refused: ${JSON.stringify(set)}`);
  const alreadySet = schedule(zoned, LATER);

  return {
    PUBLISH_AT_MALFORMED: malformed,
    PUBLISH_AT_NO_ZONE: unzoned,
    PUBLISH_AT_PAST: past,
    PUBLISH_AT_ALREADY_SET: alreadySet,
  };
}
