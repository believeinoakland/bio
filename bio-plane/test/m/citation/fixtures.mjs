/* The answers this module publishes for its users' tests (K4990, K4993, K5175): each is made by this module's real code when
   the function is called, over a world built then, and never stored. Each answers the door's own op (`citationOps`), so a
   test takes the answer it would get from the store, not one written by hand. */
import { world, V } from "./fixture.mjs";
import { citationOps } from "../../../src/citation/index.mjs";

const BY = "ann";
const ANN = { viewer: V(BY), owner: "o", author: `member:${BY}`, identity: V(BY) };

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


/* R23 (reinstate onto the other side): a question that cited one document as `cuts_against` and severed that leg (both
   checked), then the door's answer to `reinstate` with `role` (default `supports`). Answers `{w, question, handle, severed,
   answer}`. */
export async function reinstateOtherSide({ role = "supports", reason = "I read it the wrong way round" } = {}) {
  const w = world({ inquiry: true });
  w.info("INFO-2026-0001-doc");
  const question = w.inquiry("INQ-2026-0001-q");
  const handle = await w.select(["INFO-2026-0001-doc"]);
  must(w.cit.cite({ project: question, handle, ...ANN, role: "cuts_against", note: "first reason" }), "the cite");
  const severed = must(door(w.cit, "sever", { project: question, handle, ...ANN, reason: "wrong side" }), "the sever");
  const answer = door(w.cit, "reinstate", { project: question, handle, ...ANN, reason, role });
  return { w, question, handle, severed, answer };
}
