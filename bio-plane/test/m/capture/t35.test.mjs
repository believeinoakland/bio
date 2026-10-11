/* capture, T35 (T35-22) at the module's interface: the DEC-149 rows (plan rule 4: field and identifier names stay; "the
   plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing; each string
   named by a test; R15's `archive-unpack` kind. The doorbell's DEC-149 rows and R85 (now doorbell R20) moved with it to
   `doorbell` (T42, K2607). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, governor, network, granted, sha } from "./fixture.mjs";
import { TASK_KINDS } from "../../../src/capture/index.mjs";
import { acquireOp } from "../../../src/capture/ops.mjs";
import { TSA_ENDPOINTS, ARCHIVE_SAVE_BASE } from "../../../src/tsa.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };

/* ---- DEC-149 rows (plan rule 4; `build/plan/draft-T35-dec149-l1-l7.md` rows 178–188) ---- */

/* R68's world: a held capture, attestation's real `attest`, the network scripted (as knocker.test.mjs's). */
const LOCATOR = "https://a.example/page";
function reWorld() {
  const b = bucket();
  const f = fresh({ evidence: b, gov: governor(), env: { INSTANCE_NAME: "i" } });
  const bytes = new TextEncoder().encode("the captured page");
  const d = sha(bytes);
  b.held.set(`bio/captures/${d}`, bytes);
  return { ...f, d };
}
const scripted = (d, archived, replay = null) => network((url) => {
  if (url === TSA_ENDPOINTS[0]) return new Response(granted(d));
  if (url === ARCHIVE_SAVE_BASE + LOCATOR) return new Response("", { headers: { "content-location": archived.replace("https://web.archive.org", "") } });
  /* a function, so the scripted network calls it rather than cloning (and so buffering) a streamed answer */
  if (replay && url.includes("id_/")) return replay;
  return null;
});

test("DEC-149 M (index.mjs:1033): a co-archive whose locator is no raw replay reads undetermined, \"the archived locator is not a replay your group's Civicsmith can read raw\"", async () => {
  const w = reWorld();
  const net = scripted(w.d, "https://web.archive.org/web/2026100712/https://a.example/page");
  let r;
  try { r = await w.c.reattest({ captureSha: w.d, locator: LOCATOR }); } finally { net.restore(); }
  const co = r.late_attestations.find((o) => o.kind === "co_archive");
  assert.deepEqual([co.matches, co.match_basis], ["undetermined", "the archived locator is not a replay your group's Civicsmith can read raw"]);
});

test("DEC-149 M (index.mjs:1045): a replay over 256 MiB reads undetermined, \"the replay is larger than your group's Civicsmith compares\"", async () => {
  const w = reWorld();
  const chunk = new Uint8Array(4 << 20);
  let sent = 0;
  const big = () => new Response(new ReadableStream({ pull(ctl) { if (sent > 260 << 20) ctl.close(); else { sent += chunk.length; ctl.enqueue(chunk); } } }));
  const net = scripted(w.d, "https://web.archive.org/web/20261007120000/https://a.example/page", big);
  let r;
  try { r = await w.c.reattest({ captureSha: w.d, locator: LOCATOR }); } finally { net.restore(); }
  const co = r.late_attestations.find((o) => o.kind === "co_archive");
  assert.deepEqual([co.matches, co.match_basis], ["undetermined", "the replay is larger than your group's Civicsmith compares"]);
});

test("DEC-149 M (index.mjs:1414): a render over the concurrency cap waits, \"<n> renders are running and your group's Civicsmith runs at most <cap> at once\"", () => {
  const { c } = fresh();
  const at = "2026-10-07T12:00:00Z";
  assert.equal(c.renderAdmit({ allowanceMs: 10000, reserveMs: 1000, cap: 1, at }).state, "admitted");
  const w = c.renderAdmit({ allowanceMs: 10000, reserveMs: 1000, cap: 1, at });
  assert.deepEqual([w.state, w.why], ["waiting", "1 renders are running and your group's Civicsmith runs at most 1 at once"]);
});

test("DEC-149 M (ops.mjs:150): op=acquire with no evidence storage answers the storage-absent refusal with \"your group's Civicsmith has no evidence storage configured\"", async () => {
  const said = [];
  const storageAbsent = (op, error) => { said.push([op, error]); return json({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", op, error }, 503); };
  const out = await acquireOp(new Request("https://p/", { method: "POST", body: "{}" }), {}, null,
                              { json, storeSilent, storageAbsent, doAnswer, cls: "member", member: true, sessMember: "m1", storeName: "bio" });
  assert.equal(out.response.status, 503);
  assert.deepEqual(said, [["acquire", "your group's Civicsmith has no evidence storage configured"]]);
});

/* ---- R15 (T35; K1940): the `archive-unpack` kind ---- */

test("R15 R45 (T35): taskEnqueue takes the archive-unpack kind, deduped on (kind, digest) apart from authority-undetermined; each drainer reads its own kind", async () => {
  const { c } = fresh();
  assert.ok(TASK_KINDS.includes("archive-unpack"));
  const A = "a".repeat(64);
  const u = await c.taskEnqueue({ kind: "archive-unpack", captureSha: A, subject: "continue the unpack", at: "2026-10-07T12:00:00Z" });
  assert.deepEqual([u.ok, u.queued, u.kind], [true, true, "archive-unpack"]);
  assert.equal((await c.taskEnqueue({ kind: "archive-unpack", captureSha: A })).deduped, true);
  assert.equal((await c.taskEnqueue({ captureSha: A, at: "2026-10-07T12:00:01Z" })).queued, true, "the other kind for the same digest is its own event");
  assert.deepEqual(c.taskEvents({ kind: "archive-unpack" }).map((e) => [e.kind, e.captureSha]), [["archive-unpack", A]]);
  assert.deepEqual(c.taskEvents({ kind: "authority-undetermined" }).map((e) => e.kind), ["authority-undetermined"]);
  assert.equal(c.taskEvents().length, 2, "with no kind, every event, as before");
  assert.deepEqual([c.taskEventCount(), c.taskEventCount({ kind: "archive-unpack" })], [2, 1]);
});
