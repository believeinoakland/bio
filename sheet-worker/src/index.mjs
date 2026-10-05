/* sheet-worker: a fleet member reached only through the plane's `SHEET_WORKER` service binding. Given a capture's
 * sha and a store namespace, it reads a captured `.xlsx` workbook from R2 itself, recomputes every formula with a
 * pinned build of IronCalc, and answers each formula cell's recomputed value with the engine's version, or a named
 * refusal saying the workbook is not recomputed here and why (build/requirements/sheet-worker.md). Until an
 * administrator sets `SHEET_RECOMPUTE` to "on" after the release, every recompute request is answered NOT_ENABLED.
 */
import { makeMember } from "./member.mjs";
import { SHEET_ENGINE } from "./engine.mjs";

/* The member's surface: two routes, neither mutating (a member asserts nothing). `fleet-member.json` names this table. */
export const SURFACE = {
  recompute: { method: "POST", mutating: false },
  version: { method: "GET", mutating: false },
};

const member = makeMember(SHEET_ENGINE);

export default {
  fetch: (req, env) => member.fetch(req, env),
};
