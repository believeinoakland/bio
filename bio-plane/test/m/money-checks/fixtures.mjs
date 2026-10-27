/* The fixtures money-checks publishes for its users (K4990, K4993, K5044): each is made by money-checks' real code when it
 * is called, never stored, and each is checked by `fixtures.test.mjs`. Named with the requirement each answer carries. */
import { world, ALICE } from "./fixture.mjs";

/** `moneyChecks.runDetectors({...})` over an empty world (no fact, no detector switched on): the real answer, with no
 *  result written and nothing remaining (R6). `budgetMs` as the caller gives it, 1,000 ms by default. */
export function runDetectorsAnswers({ budgetMs = 1000 } = {}) {
  const w = world();
  return w.c.runDetectors({ budgetMs });
}

/** `moneyChecks.noticed({project, viewer})` for a project the viewer takes part in, over an empty record: the real
 *  answer with no item and no truncation, labelled as the machine's with its mark (R9, R17). */
export function noticed() {
  const w = world();
  w.project("PROJ-2026-0001-alpha", ["alice"]);
  return w.c.noticed({ project: "PROJ-2026-0001-alpha", viewer: ALICE });
}
