/* contradiction's published fixtures (fixtures.mjs): each is called here and its real answer checked. */
import test from "node:test";
import assert from "node:assert/strict";
import { candidateReads, readRefusals } from "./fixtures.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

test("R25: candidateReads answers the real candidate read in each shape: a clean one, a truncated page, an undetermined read and no subject", () => {
  const r = candidateReads();
  assert.equal(r.clean.ok, true);
  assert.equal(r.clean.truncated, false);
  assert.equal(r.clean.undetermined, undefined, "a clean read is not undetermined");
  assert.deepEqual(r.clean.candidates, []);
  assert.equal(r.truncated.ok, true);
  assert.equal(r.truncated.truncated, true);
  assert.equal(r.truncated.candidates.length, 1, "the page holds the one candidate asked for");
  assert.equal(r.undetermined.ok, true);
  assert.equal(r.undetermined.undetermined, true);
  assert.deepEqual(r.undetermined.candidates, []);
  assert.equal(r.undetermined.empty.level, "undetermined");
  assert.equal(r.noSubject.ok, false);
  assert.equal(r.noSubject.code, "CANDIDATES_NO_SUBJECT");
  assert.equal(r.noSubject.reason, "CANDIDATES_NO_SUBJECT");
});

test("R50, R19: readRefusals answers the real refusals and undetermined answers of conflictNotices and candidatesFor for a project", () => {
  const r = readRefusals();
  assert.equal(r.unknownProject.ok, false);
  assert.equal(r.unknownProject.code, "NO_SUCH_PROJECT");
  assert.equal(r.notAParticipant.ok, false);
  assert.equal(r.notAParticipant.code, "NOT_A_PARTICIPANT");
  assert.equal(r.notAParticipant.check, MEMBERSHIP_CHECKS.NOT_A_PARTICIPANT.check);
  assert.equal(r.noticesUndetermined.ok, true);
  assert.equal(r.noticesUndetermined.undetermined, true);
  assert.deepEqual(r.noticesUndetermined.notices, []);
  assert.equal(r.candidatesUndetermined.ok, true);
  assert.equal(r.candidatesUndetermined.undetermined, true);
  assert.deepEqual(r.candidatesUndetermined.candidates, []);
  /* control: the same project read before the index went answers a joined participant cleanly */
  assert.equal(r.noticesClean.ok, true);
  assert.equal(r.noticesClean.undetermined, undefined);
});
