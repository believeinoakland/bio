/* A RE-EXPORT, NOT A COPY (T33-57; plan Rules (9) item 4). The control-flow tables and their pure rules moved to
 * `agent-harness` (T33-54, its R1–R8); this file holds none of that code. It stays so the importers that still name
 * this path (control-plane's `members-pin.test.mjs`, the skills doctrine's and run-rules' `GATE_ADDRESS`, the fleet
 * bundle control) read through it until each is re-pointed by its own job. `PLANE_OPS` and `NAMESPACES` are this
 * member's own declarations (R37, R4), from `ops.mjs`; a local export wins over the star below. */
export * from "../../agent-harness/src/harness.mjs";
export { PLANE_OPS, NAMESPACES, MEANING_ARM } from "./ops.mjs";
