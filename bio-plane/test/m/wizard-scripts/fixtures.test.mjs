/* wizard-scripts' published fixtures (K5207, fix round 10): each answer `fixtures.mjs` publishes is the real `writingHelp`'s,
   made when the test runs. The two `writinghelp` answers screens-publish takes are asserted against the module's own refusal
   rows (`WIZARD_SCRIPTS_CHECKS`), so a change to the real answer is seen here first. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { writingHelpDraftHeld, writingHelpUnreachable } from "./fixtures.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

test("R24 R27 writinghelp with a draft held and the assistant reachable: the published answer is the real WRITING_HELP_DRAFT_HELD refusal, with its row, and writes nothing", () => {
  const r = writingHelpDraftHeld();
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
                   [false, "WRITING_HELP_DRAFT_HELD", "WRITING_HELP_DRAFT_HELD", wz.WIZARD_SCRIPTS_CHECKS.WRITING_HELP_DRAFT_HELD.check,
                    wz.WIZARD_SCRIPTS_CHECKS.WRITING_HELP_DRAFT_HELD.translation], JSON.stringify(r).slice(0, 300));
  assert.equal(r.op, "casenote", "the answer names the op it was asked for");
});

test("R27 writinghelp with the assistant unreachable: the published answer is the door's AGENT_WORKER_UNBOUND, as given, naming its op", () => {
  const r = writingHelpUnreachable();
  assert.deepEqual([r.ok, r.code, r.op], [false, "AGENT_WORKER_UNBOUND", "casenote"], JSON.stringify(r).slice(0, 300));
});
