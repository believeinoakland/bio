/* Fixtures strength publishes for the modules that use it (K4990, K4993, K4995, K5044). Each is made by strength's real
 * code over its own test world when it is called, never stored; `fixtures.test.mjs` calls each and checks the answer. */
import { world, MACHINE, ADMIN, REASON } from "./fixture.mjs";
import { world as projectWorld, byBob } from "./projectbar-world.mjs";

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

/** The refusal of `op=projectbarset` when `expected` is not the bar the project holds (R45): `{ ok: false, reason:
 *  "BAR_STALE", code, check, translation, detail, project, previous }`, `previous` R14's answer for the bar now held (a
 *  catalogue row; its sentence is a `localize` stand-in until the design list holds it). Made from the real call: one
 *  owner sets B/C, a second, who read no bar, saves. */
export function projectBarStale() {
  const w = projectWorld();
  w.s.projectBarSet(byBob(w, { author: "alice", viewer: "member:alice", identity: "member:alice" }));
  return w.s.projectBarSet(byBob(w, { capture: "A", connection: "A", expected: { capture: null, connection: null } }));
}
