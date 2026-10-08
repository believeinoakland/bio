/* The ops map (`projectRosterOps`): each of the ten ops answers what its service answers, every parameter and stamp
   read from the query (the control plane's `by` and `viewer` among them), never from a body; and this module's rows. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { projectRosterOps, PROJECT_ROSTER_CHECKS, PROJECT_JOIN_REQUEST_CHECKS } from "../../../src/project-roster/index.mjs";

const q = (o) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

test("R1 R3 R4 R5 R8 R9 R10 R11 R12 R14 each op answers its service, its parameters and stamps from the query; a body names nothing", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.owned("PROJ-P", "ann", ["bob"]);
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  const op = (name, params, body = null) =>
    projectRosterOps(w.r, new URL(`http://x/?${q(params)}`), body, {})[name]();
  assert.deepEqual(Object.keys(projectRosterOps(w.r, new URL("http://x/"), null, {})).sort(),
    ["projectdirectory", "projectowneradd", "projectownerremove", "projectownerrescue", "projectparticipants",
     "projectrequest", "projectrequestanswer", "projectrequests", "projectrequestwithdraw", "projectvisibility"]);
  /* reads */
  assert.deepEqual(op("projectparticipants", { projectId: "PROJ-P", by: "bob" }),
    w.r.projectParticipants({ projectId: "PROJ-P", by: "bob" }));
  assert.deepEqual(op("projectvisibility", { projectId: "PROJ-P", viewer: V("bob") }),
    w.r.projectVisibility({ projectId: "PROJ-P", viewer: V("bob") }));
  const dir = op("projectdirectory", { viewer: V("cal"), limit: "1" });
  assert.deepEqual([dir.limit, dir.projects.map((p) => p.id)], [1, ["PROJ-P"]]);
  /* the request's life through the ops */
  const asked = op("projectrequest", { projectId: "PROJ-P", comment: "hello", by: "cal", viewer: V("cal") });
  assert.deepEqual([asked.ok, asked.comment], [true, "hello"]);
  assert.equal(op("projectrequests", { by: "cal", viewer: V("cal"), limit: "5" }).requests.length, 1);
  assert.equal(op("projectrequests", { projectId: "PROJ-P", by: "ann", viewer: V("ann") }).requests[0].handle, "cal");
  assert.equal(op("projectrequestwithdraw", { projectId: "PROJ-P", by: "cal", viewer: V("cal") }).state, "withdrawn");
  op("projectrequest", { projectId: "PROJ-P", by: "cal", viewer: V("cal") });
  const granted = op("projectrequestanswer", { projectId: "PROJ-P", handle: "cal", answer: "grant", comment: "welcome",
    by: "ann", viewer: V("ann") });
  assert.deepEqual([granted.state, granted.comment, granted.participation], ["granted", "welcome", "invited"]);
  /* ownership through the ops */
  assert.equal(op("projectowneradd", { projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  const short = op("projectownerremove", { projectId: "PROJ-P", handle: "bob", by: "ann", reason: "done", viewer: V("ann") });
  assert.deepEqual([short.reason, short.deciders], ["VOTES_SHORT", ["ann"]]);
  assert.equal(op("projectownerrescue", { projectId: "PROJ-P", handle: "cal", by: "second", reason: "r", viewer: V("second") }).reason,
    "OWNERS_ARE_ACTIVE");
  /* a body's own `by`, `viewer` or parameters never reach a service */
  const forged = { by: "ann", viewer: V("ann"), projectId: "PROJ-P", handle: "cal" };
  assert.equal(op("projectowneradd", { projectId: "PROJ-P", handle: "bob", by: "cal", viewer: V("cal") }, forged).reason,
    "NOT_THE_OWNER");
  assert.equal(op("projectrequests", {}, forged).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
});

test("rows: each code this module mints carries its row, frozen, numbered, its `where` naming this module's region; the translations name the group's Civicsmith only so", () => {
  const FORBIDDEN = /\b(cop(y|ies)|instances?|planes?|servers?)\b/i;
  const want = {
    TARGET_NOT_JOINED: "C-56.5", LAST_OWNER: "C-33.28", PROJECT_DIRECTORY_NEEDS_A_MEMBER: "C-70.4",
    PROJECT_REQUEST_NEEDS_A_MEMBER: "C-95.1", PROJECT_REQUEST_NOT_OUTSIDE: "C-95.2", PROJECT_REQUEST_ALREADY_OPEN: "C-95.3",
    PROJECT_REQUEST_NONE_OPEN: "C-95.4", PROJECT_REQUEST_ANSWER_NOT_THE_OWNER: "C-95.5", PROJECT_REQUEST_UNKNOWN_ANSWER: "C-95.6",
    PROJECT_REQUEST_REQUESTER_INACTIVE: "C-95.7", PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT: "C-95.8",
    PROJECT_REQUESTS_NOT_VISIBLE: "C-95.9",
  };
  const rows = { ...PROJECT_ROSTER_CHECKS, ...PROJECT_JOIN_REQUEST_CHECKS };
  assert.deepEqual(Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, r.check])), want);
  assert.ok(Object.isFrozen(PROJECT_ROSTER_CHECKS) && Object.isFrozen(PROJECT_JOIN_REQUEST_CHECKS));
  for (const [code, row] of Object.entries(rows)) {
    assert.ok(Object.isFrozen(row), code);
    assert.match(row.where, /^src\/project-roster\/index\.mjs [#\w]+ > is-[a-z-]+$/, code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
    assert.doesNotMatch(row.translation, FORBIDDEN, code);
  }
});
