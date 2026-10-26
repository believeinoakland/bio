/* store-assembly's copy of plane's test. plane R108 -> R80 (fix round 9, G151; K4958; control-plane R130): A DEFERRED JOB KEEPS ITS PROJECT. `pendingadd` takes `project` beside `kind` and `sha`
   and writes it into the job row's `detail.project`, so the unpack drain sends it with `op=unpack` and a member an unpack files lands in the project
   its archive was filed in; absent, the row carries none. Over the assembled store: the route is called as the door calls it, the drain's own request is read. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");

async function world() {
  const sent = [];
  const env = { CAPTURES: bucketStandIn(), DAEMON_TOKEN: "dmn",
    SELF: { fetch: async (req) => { sent.push(await req.json()); return new Response(JSON.stringify({ ok: true, complete: true }), { status: 200 }); } } };
  const x = await store({ env });
  x.sent = sent;
  x.jobs = pendingOf(x.ctx);
  return x;
}

test("R80 pendingadd with a project writes detail.project on the job row, and the unpack drain sends it with op=unpack", async () => {
  const x = await world();
  const a = sha("an archive filed in a project");
  assert.equal((await x.call(`/pendingadd?kind=unpack&sha=${a}&project=PROJ-2026-0001`)).ok, true);
  assert.deepEqual(x.jobs.jobRow({ sha: a, kind: "unpack" }).detail, { project: "PROJ-2026-0001" });
  await x.s.onAlarm(Date.now() + 60_000);
  assert.deepEqual(x.sent.map((b) => [b.archiveSha, b.project]), [[a, "PROJ-2026-0001"]]);
});

test("R80 control: pendingadd with no project, an empty one or one over 200 characters writes no detail.project", async () => {
  const x = await world();
  const none = sha("no project"), empty = sha("empty project"), long = sha("long project");
  await x.call(`/pendingadd?kind=unpack&sha=${none}`);
  await x.call(`/pendingadd?kind=unpack&sha=${empty}&project=`);
  await x.call(`/pendingadd?kind=unpack&sha=${long}&project=${"p".repeat(201)}`);
  for (const s of [none, empty, long]) assert.deepEqual(x.jobs.jobRow({ sha: s, kind: "unpack" }).detail, {}, s);
});

test("R80 a second registration with a project re-arms the row and keeps it; one without a project does not erase it", async () => {
  const x = await world();
  const a = sha("registered twice");
  await x.call(`/pendingadd?kind=unpack&sha=${a}&project=PROJ-2026-0002`);
  await x.call(`/pendingadd?kind=unpack&sha=${a}`);
  assert.deepEqual(x.jobs.jobRow({ sha: a, kind: "unpack" }).detail, { project: "PROJ-2026-0002" });
});
