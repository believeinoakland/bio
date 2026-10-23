/* R61's world: two documents with a held passage each, a second passage of the first, and one passage in a project m1 takes
   no part in (laid down as rows of content's read contract, over the real neighbours). */
import { world, sha } from "./fixture.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

export const M1 = "member:m1", M2 = "member:m2";
export const DOC = { notice: "INFO-2026-0001-notice", lease: "INFO-2026-0002-lease" };
export const HIDDEN = "PROJ-2026-0009-hidden";
export const P = { notice3: { kind: "pdf-page", page: 3 }, notice4: { kind: "pdf-page", page: 4 }, lease1: { kind: "pdf-page", page: 1 } };
export const CID = { notice3: sha("notice 3"), notice4: sha("notice 4"), lease1: sha("lease 1"), secret: sha("secret 1") };

/* two documents, each with a held passage, a second passage of the first, and one passage in a project m1 takes no part in */
export function flagWorld() {
  const w = world();
  w.content(CID.notice3, "capN", DOC.notice, { extent: canonicalExtent(P.notice3), ref: "page 3 of the rent notice" });
  w.content(CID.notice4, "capN", DOC.notice, { extent: canonicalExtent(P.notice4), ref: "page 4 of the rent notice" });
  w.content(CID.lease1, "capL", DOC.lease, { extent: canonicalExtent(P.lease1), ref: "page 1 of the lease amendment" });
  w.project(HIDDEN, ["m2"]);
  w.content(CID.secret, "capS", HIDDEN, { extent: canonicalExtent(P.lease1), ref: "page 1 of a document m1 cannot see" });
  w.reading("capN", DOC.notice, { contentType: "notice", date: "2026-10-01" });
  w.reading("capL", DOC.lease, { contentType: "lease", date: "2024-03-01" });
  return w;
}
export const WHY = "The notice says the adjustment takes effect on November 1; the lease says no change before 2027.";
export const HERE = { capture: "capN", extent: P.notice3 }, OTHER = { capture: "capL", extent: P.lease1 };
