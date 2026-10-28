/* connections: the reader of a project's reach (T53-587; N1200; membership R150). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { projectViewer } from "../../../src/membership/index.mjs";

const P = "INFO-2026-0001-p", A = "INFO-2026-0002-a", B = "INFO-2026-0003-b", C = "INFO-2026-0004-c", D = "INFO-2026-0005-d";

test("T53-587 (N1200; membership R150): connections registers its reader at start; the reach of a document is the records it cites whose edge is not severed, each once, and no other", () => {
  const w = world();
  w.member("alice");
  w.doc(A, ["a"]); w.doc(B, ["b"]); w.doc(C, ["c"]); w.doc(D, ["d"]);
  w.doc(P, ["p"], { references: [{ rel: "cites", target: A }, { rel: "cites", target: A }, { rel: "cites", target: B, status: "severed" },
                                 { rel: "links_to", target: C }, { rel: "relates_to", target: D }] });
  /* the reader is the module's own, asked through membership */
  assert.deepEqual(w.membership.projectReach(P), [A]);
  assert.deepEqual(w.k.projectReach({ project: P }), [A]);
  /* a run fenced to the project reaches what it cites, and nothing else */
  const pv = projectViewer("member:alice", P);
  assert.equal(w.membership.inSight(A, pv), true);
  for (const id of [B, C, D]) assert.equal(w.membership.inSight(id, "member:alice"), true, `control: alice's own viewer sees ${id}`);
});

test("T53-587 control: a second registration is refused LISTENER_DECLARED; no project, an unheld one, or a document citing nothing reaches nothing; the reader writes nothing", () => {
  const w = world();
  w.doc(A, ["a"]);
  const again = w.membership.registerProjectReach("connections", () => [B]);
  assert.deepEqual([again.ok, again.reason], [false, "LISTENER_DECLARED"]);
  const before = JSON.stringify(w.snapshot());
  for (const project of [undefined, null, "", 7, "INFO-2026-0099-none", A]) assert.deepEqual(w.k.projectReach({ project }), [], String(project));
  assert.deepEqual(w.k.projectReach(), []);
  assert.equal(JSON.stringify(w.snapshot()), before);
});
