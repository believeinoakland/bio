/* contradiction's published fixtures (fix round 10): what a user module's test takes in place of contradiction's reads.
   Each is made by contradiction's real code when the test runs, over `world()`, and is never stored. */
import { world } from "./fixture.mjs";
import { seeded, cand, IQ, M1 } from "./seed.mjs";

const RUN = "RUN-2026-0001";
const PA = "PROJ-2026-0001-alpha", PB = "PROJ-2026-0002-beta";

/** R25: the real answers of `candidatesFor` in each shape a reader of it must treat as no clean read — `undetermined` (the
 *  candidate index cannot be read: `ok` with `undetermined: true`), `truncated` (more candidates than the page holds:
 *  `truncated: true` with one shown) and `noSubject` (called naming nothing: `CANDIDATES_NO_SUBJECT`). `clean` is the
 *  answer of the same call over a record holding no candidate, for a control. */
export function candidateReads({ viewer = M1 } = {}) {
  const clean = seeded().c.candidatesFor({ on: { inquiry: IQ.a }, viewer });
  const t = seeded();
  cand(t, "K1", "record");
  cand(t, "K4", "record");
  const truncated = t.c.candidatesFor({ on: { content: t.rows(`SELECT a_ref FROM contradiction_candidates`)[0].a_ref }, limit: 1, viewer });
  const u = seeded();
  u.rows(`DROP TABLE contradiction_candidates`);
  const undetermined = u.c.candidatesFor({ on: { inquiry: IQ.a }, viewer });
  const noSubject = seeded().c.candidatesFor({ viewer });
  return { clean, truncated, undetermined, noSubject };
}

/** R19, R25, R50: the real refusals and partial answers of `candidatesFor` and `conflictNotices` for a project. Two projects
 *  (alpha, beta) in which `m2` takes part in alpha only and `m1` in both; `outsider` is invited to alpha and not joined.
 *  `unknownProject` is `conflictNotices` for a project the record does not hold (NO_SUCH_PROJECT), `notAParticipant` for a
 *  viewer invited and not joined (membership's NOT_A_PARTICIPANT), `noticesClean` (a joined participant's read before the index goes, for a control), `noticesUndetermined` and `candidatesUndetermined` the
 *  answers when the candidate index cannot be read. */
export function readRefusals() {
  const w = world();
  w.runs.set(RUN, { status: "running", principal: M1 });
  w.project(PA, [{ id: "m2", owner: 1 }, "m1"]);
  w.project(PB, [{ id: "m3", owner: 1 }, "m1"]);
  w.participant(PA, "outsider", { state: "invited" });
  const unknownProject = w.c.conflictNotices({ project: "PRJ-none", viewer: M1 });
  const notAParticipant = w.c.conflictNotices({ project: PA, viewer: "member:outsider" });
  const noticesClean = w.c.conflictNotices({ project: PA, viewer: "member:m2" });
  w.rows(`DROP TABLE contradiction_candidates`);
  const noticesUndetermined = w.c.conflictNotices({ project: PA, viewer: "member:m2" });
  const candidatesUndetermined = w.c.candidatesFor({ on: { project: PA }, viewer: "member:m2" });
  return { world: w, noticesClean, unknownProject, notAParticipant, noticesUndetermined, candidatesUndetermined };
}
