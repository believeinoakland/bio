/* action-replies' ops and outward words at its interface (R1, R2, R4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, M, MACHINE, INQ, RFC, PROJ } from "./fixture.mjs";
import { actionRepliesOps, actionRepliesOwns, ACTION_REPLY_CHECKS, ACTION_REPLIES_TABLES, bearingProposalLabel } from "../../../src/action-replies/index.mjs";

const url = (q) => new URL(`https://x/?${new URLSearchParams(q)}`);

test("R1 R2 the ops map holds exactly the three acts, each reading the control plane's stamps from the query", () => {
  const w = world();
  w.rfc(RFC);
  w.say(RFC, "sent");
  const got = w.say(RFC, "received");
  w.bundle(PROJ, "project");
  w.participant(PROJ, "alice");
  const claims = [{ claim: INQ, bearing: "new_evidence" }];
  assert.deepEqual(Object.keys(actionRepliesOps(w.r, url({}), {})).sort(), ["actionbearingpropose", "actionreplybearing", "arosefrom"]);
  /* a body's own author never wins over the stamp */
  const forged = actionRepliesOps(w.r, url({ target: RFC, ord: got, viewer: M }), { claims, author: M }).actionreplybearing();
  assert.equal(forged.reason, "MACHINE_CANNOT_RECORD_BEARING");
  assert.equal(actionRepliesOps(w.r, url({ target: RFC, ord: got, viewer: M, author: M }), { claims }).actionreplybearing().ok, true);
  const p = actionRepliesOps(w.r, url({ target: RFC, ord: got, viewer: MACHINE, proposer: MACHINE }), { claims }).actionbearingpropose();
  assert.deepEqual([p.ok, p.proposal.state], [true, "machine_proposed"]);
  assert.equal(actionRepliesOps(w.r, url({ target: RFC, ord: got, viewer: M, author: M, project: PROJ }), {}).arosefrom().ok, true);
  assert.equal(actionRepliesOps(w.r, url({ target: RFC, ord: got, viewer: M, author: M }), { arising: { project: PROJ } }).arosefrom().reason,
    "AROSE_FROM_LINKED");
});

test("R4 the tables are this module's own; no place is named in its rows or its sentences", () => {
  assert.deepEqual([...ACTION_REPLIES_TABLES], ["action_reply_bearings", "action_bearing_proposals", "action_arose_from"]);
  assert.ok(ACTION_REPLIES_TABLES.every((t) => actionRepliesOwns(t) && actionRepliesOwns({ name: t })));
  assert.equal(actionRepliesOwns("actions"), false);
  assert.deepEqual(Object.values(ACTION_REPLY_CHECKS).map((r) => r.check),
    ["C-150.1", "C-150.2", "C-150.3", "C-150.4", "C-150.5", "C-150.6", "C-150.7"]);
  /* the test profile's place and zone, and the group's own city */
  const places = ["Port Ellery", "Halifax", "Oakland", "California"];
  const words = [...Object.values(ACTION_REPLY_CHECKS).map((r) => r.translation),
                 ...["", M, MACHINE].map((x) => bearingProposalLabel(x).says)];
  for (const text of words) for (const place of places) assert.ok(!text.includes(place), `${place} in: ${text}`);
});
