/* record-grammar at its interface: the one accepting act's record (R52; T41-1, N820; D3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCEPTANCE_FORMS, ACCEPT_MUST_REAUTHOR, acceptanceRecord, isMachineIdentity, NON_MEMBER_AUTHORS, ACTOR_CLASSES }
  from "../../../src/record-grammar/index.mjs";

const OK = { proposal: "STP-2026-a1b2c3d4e5f6g7h8", form: "edited", by: "alice", at: "2026-10-09T18:00:00Z", kind: "step" };

test("R52 ACCEPTANCE_FORMS is exactly [as_proposed, edited, own_instead], frozen", () => {
  assert.deepEqual([...ACCEPTANCE_FORMS], ["as_proposed", "edited", "own_instead"]);
  assert.ok(Object.isFrozen(ACCEPTANCE_FORMS));
  assert.throws(() => { "use strict"; /** @type {any} */ (ACCEPTANCE_FORMS).push("x"); }, TypeError);
  assert.equal(ACCEPTANCE_FORMS.length, 3);
});

test("R52 ACCEPT_MUST_REAUTHOR is the one spelling of the code an act's owner refuses as_proposed with", () => {
  assert.equal(ACCEPT_MUST_REAUTHOR, "ACCEPT_MUST_REAUTHOR");
});

test("R52 acceptanceRecord: the one shape {proposal, form, by, at, kind}, frozen, for every form and any kind; extra keys dropped", () => {
  for (const form of ACCEPTANCE_FORMS)
    for (const kind of ["step", "hypothesis", "passage", "connection", "question", "find", "account"]) {
      const r = acceptanceRecord({ ...OK, form, kind, extra: 1, viewer: "x" });
      assert.deepEqual(r, { ...OK, form, kind });
      assert.deepEqual(Object.keys(r), ["proposal", "form", "by", "at", "kind"]);
      assert.ok(Object.isFrozen(r));
    }
  /* The same input gives the same record (R24), and the input is not changed. */
  const input = { ...OK };
  assert.deepEqual(acceptanceRecord(input), acceptanceRecord(input));
  assert.deepEqual(input, OK);
});

test("R52 acceptanceRecord refuses, naming the field, anything that is not an acceptance (negative controls)", () => {
  const refused = (over, field) =>
    assert.throws(() => acceptanceRecord({ ...OK, ...over }), (e) => e instanceof TypeError && e.message.includes(field),
      `${field} ${JSON.stringify(over)}`);
  for (const proposal of [undefined, null, "", "  ", 1, {}, ["p"]]) refused({ proposal }, "proposal");
  for (const form of [undefined, null, "", "As_Proposed", "accepted", "rejected", "own", "constructor", "toString", 0, ["edited"]])
    refused({ form }, "form");
  /* Accepting is a member's act: blank or any machine identity is refused (R15). */
  const machines = ["token:assistant", "class:daemon", " TOKEN:x ", ...NON_MEMBER_AUTHORS, ...ACTOR_CLASSES];
  for (const by of machines) assert.ok(isMachineIdentity(by), by);
  for (const by of [undefined, null, "", "   ", 7, ...machines]) refused({ by }, "by");
  for (const at of [undefined, null, "", "2026-10-09", "2026-10-09T18:00:00.000Z", "2026-10-09T18:00:00+00:00", 1780000000000,
    "2026-10-09T18:00:00Z\n"]) refused({ at }, "at");
  for (const kind of [undefined, null, "", " ", 3, {}]) refused({ kind }, "kind");
  for (const bad of [undefined, null, "x", 1, []]) assert.throws(() => acceptanceRecord(bad), TypeError);
  /* Control: the same record with each field put right lands. */
  assert.deepEqual(acceptanceRecord(OK), OK);
});
