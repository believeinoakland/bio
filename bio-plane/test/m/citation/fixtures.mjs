/* The answers this module publishes for its users' tests (K4990, K4993, K5175): each is made by this module's real code when
   the function is called, over a world built then, and never stored. Each answers the door's own op (`citationOps`), so a
   test takes the answer it would get from the store, not one written by hand. */
import { world, V } from "./fixture.mjs";
import { citationOps } from "../../../src/citation/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { importedWorld } from "../case-import/fixtures.mjs";
import { F1 } from "../case-import/fixture.mjs";

const BY = "ann";
const ANN = { viewer: V(BY), owner: "o", author: `member:${BY}`, identity: V(BY) };
const Q = "INQ-2026-0001-q";

/* The door's answer to one op, its fields given as the address carries them. */
function door(c, op, fields) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) if (v !== null && v !== undefined) q.set(k, String(v));
  return citationOps(c, new URL(`http://x/?${q}`))[op]();
}

/* A call that must succeed: a refusal here is a fault of the fixture, so it is thrown, never answered. */
function must(r, what) {
  if (r?.ok !== true) throw new Error(`${what} was refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
}

/* A case (project) citing one information document whole, through a selection. */
async function citedCase() {
  const w = world();
  w.info("INFO-2026-0001", { captured: false });
  const project = w.project();
  const handle = await w.select(["INFO-2026-0001"]);
  must(w.cit.cite({ project, handle, ...ANN, note: "first reason" }), "the cite");
  return { w, project, handle };
}

/* R4 (sever): a case with a cited finding, and the door's answer to `sever` of that citation. Answers `{w, project, handle,
   answer}`: the world, the case, the selection, and the answer as the door gives it. */
export async function sever({ reason = "the wrong edition" } = {}) {
  const { w, project, handle } = await citedCase();
  const answer = door(w.cit, "sever", { project, handle, ...ANN, reason });
  return { w, project, handle, answer };
}

/* R4 (reinstate): the same case, severed first (checked), then the door's answer to `reinstate`. Answers `{w, project, handle,
   severed, answer}`. */
export async function reinstate({ cut = "cut", reason = "the edition was right" } = {}) {
  const { w, project, handle } = await citedCase();
  const severed = must(door(w.cit, "sever", { project, handle, ...ANN, reason: cut }), "the sever");
  const answer = door(w.cit, "reinstate", { project, handle, ...ANN, reason });
  return { w, project, handle, severed, answer };
}

/* R16, R17 (citeimported): a question resting on an accepted finding of another team's case, at the edition shown. The
   import is case-import's real accepted import (its published `importedWorld`, edition 1 with F1 accepted), and the
   citation module reads its acceptance through the real accepted-work service of that world, passed in as its dependency.
   Answers `{w, caseImport, import, finding, edition, ref, answer}`: this module's world (the question is `Q`), the case-import
   world, the import, the finding, its edition, the ref the basis carries, and the door's answer. */
export async function citeimported({ role = "supports", note = "the audit is public" } = {}) {
  const caseImport = await importedWorld({ imports: [{ editions: [{ edition: 1, accepted: [F1] }] }] });
  const [{ import: imp }] = caseImport.imports;
  const finding = F1, edition = 1, ref = importedFindingRef(imp, finding);
  /* The viewer reads case-import's acceptance, so it is a member of both groups: alice, who imported and accepted it. */
  const w = world({ inquiry: true, members: ["ann", "alice"] });
  w.inquiry(Q);
  /* case-import's provider, registered on this plane's accepted work the way its own `start` registers it: each handler is
     that module's real read, over its own store. */
  const ci = caseImport.ci;
  const reg = acceptedWorkOf(w.host).registerAcceptedWork("case-import", {
    finding: (q) => ci.findingFacts(q || {}),
    openFlags: (q) => ci.openFlagsFacts(q || {}),
    withdrawals: (q) => ci.withdrawals(q || {}),
    moves: (q) => ci.moves(q || {}),
    flagHistory: (q) => ci.flagHistoryFacts(q || {}),
  });
  must(reg, "the registration of case-import");
  const answer = door(w.cit, "citeimported", { inquiry: Q, import: imp, finding, edition, role, note,
                                             viewer: V("alice"), author: "member:alice", identity: V("alice") });
  return { w, caseImport: caseImport.w, import: imp, finding, edition, ref, answer };
}
