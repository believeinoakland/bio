/* Fixtures strength publishes for the modules that use it (K4990, K4993, K4995, K5044). Each is made by strength's real
 * code over its own test world when it is called, never stored; `fixtures.test.mjs` calls each and checks the answer. */
import { world, MACHINE, ADMIN, REASON } from "./fixture.mjs";

/** strength.gradingFacts over an inquiry that does not exist, as the module answers it (a refusal that names the target). */
export function gradingFactsUnread() {
  const w = world();
  return w.s.gradingFacts({ inquiry: "INQ-2026-9999-a", viewer: MACHINE });
}

/** The ok answer of `op=strengthbarset`, from the real call: `{ ok, group, capture, connection, author, at, reason }`. */
export function strengthBarSet() {
  const w = world();
  w.member(ADMIN, "admin");
  return w.s.strengthBarSet({ capture: "B", connection: "C", reason: REASON, author: ADMIN });
}

/** strength.strengthOf with no id: the NO_ID refusal. */
export function strengthOfNoId() {
  return world().s.strengthOf("");
}

/** testimonyCorroboration over a question that rests on no testimony: `{ ok: true, legs: [] , ... }`. */
export function testimonyCorroboration() {
  const w = world();
  const id = "INQ-2026-0001-a";
  w.inquiry(id, []);
  return w.s.testimonyCorroboration({ inquiry: id, viewer: MACHINE });
}
