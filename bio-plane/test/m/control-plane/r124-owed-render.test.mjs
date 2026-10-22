/* control-plane R124 (fix round 4b, F5; K4492, K4493; acquisition R100, plane R77): THE ALARM'S DELIVERY OF AN OWED RENDER. `deliverOwedRender({ctx, env,
   storeName, answer, session})` is what the plane hands acquisition's `owedRun` as `deliver`: it promotes the rendered document as the capture screen
   promotes an acquired one (screens-intake's own `promoteDocument`, run through the record's `promote`), filed under the project of the shell document (the
   capture session's primary) with the session's opener as author, and R123's read follows: inline when it fits, else written down (`pendingadd`) with
   `reading_pending`. Driven over a real record (`record.mjs`): the shell is promoted first as the screen promotes it. Controls throughout (K874). */
import "../../sandbox.mjs";
import "./harness.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
/* the sources are loaded after the harness has registered the declared ops (its top-level await), as the other suites do */
const { CAPTURE_SCREEN } = await import("../../../src/screens-intake/capture.mjs");
const { deliverOwedRender } = await import("../../../src/control-plane/index.mjs");
const { captureOf } = await import("../../../src/capture/index.mjs");
const { extractionOf } = await import("../../../src/extraction/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");
const { promotionOf } = await import("../../../src/promotion/index.mjs");
const { record } = await import("./record.mjs");

const hex = (b) => createHash("sha256").update(b).digest("hex");
const MB = 1024 * 1024;

/* the screen's own composition, in process: what `cs.call` does for `promoteDocument`, as the door's delivery does it */
const screen = (ctx, who = { author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" }) => ({
  now: () => Date.now(), digest: async (t) => hex(t), w: (k) => k, date: (d) => d,
  call: async (op, { query = {}, body } = {}) => (op === "allocid" ? { ok: true, ...recordOf(ctx).allocId(query.prefix, query.year) } : promotionOf(ctx).promote({ ...body, ...who })) });
const docOf = (bytes, file, extra = {}) => ({ file, locator: `https://example.org/${file}`, retrieved: "2026-10-22T00:00:00Z", profile: { format: { format: "html" } },
  authority_state: "undetermined", authority_basis: "rendered from a page", origin: { kind: "named_request" },
  capture: { sha256: hex(bytes), bytes: bytes.length, content_type: "text/html", method: "rendered", grade: "C", actor_class: "member", encoding: "binary" }, ...extra });

/* a record holding a shell page, promoted as the screen promotes it (under `project`), and a capture session begun by `opener` over it */
async function owing({ opener = "member:ann", project = "" } = {}) {
  const r = await record();
  /* the opener takes part in the shell's project, as one who captured into it does */
  if (project) r.ctx.storage.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, ?, 'active', 0, '2026-10-22T00:00:00Z', '2026-10-22T00:00:00Z')`, project, opener.replace(/^member:/, ""));
  const shellBytes = new TextEncoder().encode(`<html><body>the shell page ${Math.random()}</body></html>`);
  r.objects.set(`bio/captures/${hex(shellBytes)}`, shellBytes);
  const shell = docOf(shellBytes, "shell.html");
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screen(r.ctx), { doc: shell, title: "The shell", locator: shell.locator, project });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  const session = `sess-${Math.random().toString(16).slice(2)}`;
  const state = { opened_by: opener, queue: [], render_pending: { body: {} } };
  captureOf(r.ctx).saveCaptureSession({ session, locator: shell.locator, primarySha: shell.capture.sha256, primaryFile: shell.file, base: shell.locator, state });
  const added = [];
  const env = { ...r.env, STORE: { idFromName: (n) => n, get: () => ({ fetch: async (req) => { added.push(new URL(req.url ?? req)); return new Response(JSON.stringify({ ok: true, result: { ok: true } })); } }) } };
  return { ...r, shell, shellBundle: made.bundleId, session, env, added };
}
const rendered = (r, text = "the rendered page of the shell") => {
  const bytes = new TextEncoder().encode(`<html><body>${text} ${Math.random()}</body></html>`);
  r.objects.set(`bio/captures/${hex(bytes)}`, bytes);
  return docOf(bytes, "rendered.html");
};
const bundleRow = (r, id) => [...r.ctx.storage.sql.exec(`SELECT bundle_id, project FROM bundles WHERE bundle_id = ?`, id)][0];

test("R124: the rendered document is promoted beside its shell, filed under the shell's project, by the session's opener, and its reading is made at once when it fits", async () => {
  const r = await owing();
  const doc = rendered(r);
  const out = await deliverOwedRender({ ctx: r.ctx, env: r.env, storeName: "bio", answer: { ok: true, document: doc }, session: r.session });
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(out.reading_pending, undefined, "a page fits: read at once");
  assert.ok(bundleRow(r, out.bundleId), "the rendered document is a bundle of the record");
  assert.notEqual(out.bundleId, r.shellBundle, "beside the shell, not over it");
  assert.equal(extractionOf(r.ctx).readingFor(doc.capture.sha256, "class:admin").found, true, "its reading exists");
  assert.equal(r.added.length, 0, "nothing was written down");
});

test("R124: the rendered document lands in the shell document's project, not another (the project the opener sees the shell under)", async () => {
  /* a project is a bundle; the shell is filed in it, and the delivery reads that home from the record */
  const r = await owing({ project: "INQ-2026-0001" });
  const doc = rendered(r, "filed with its shell");
  const out = await deliverOwedRender({ ctx: r.ctx, env: r.env, storeName: "bio", answer: { ok: true, document: doc }, session: r.session });
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(bundleRow(r, r.shellBundle).project, "INQ-2026-0001", "the shell is filed in its project");
  assert.equal(bundleRow(r, out.bundleId).project, "INQ-2026-0001", "the same project as the shell");
});

test("R124 (R123): a rendered document too large to read inline is written down for the alarm and the delivery says `reading_pending`", async () => {
  const r = await owing();
  const doc = rendered(r, "a very large render");
  doc.capture.bytes = 3 * MB; doc.capture.content_type = "application/pdf"; doc.profile = { format: { format: "pdf" } };
  const out = await deliverOwedRender({ ctx: r.ctx, env: r.env, storeName: "bio", answer: { ok: true, document: doc }, session: r.session });
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(out.reading_pending, true);
  assert.deepEqual(r.added.map((u) => [u.pathname, u.searchParams.get("kind"), u.searchParams.get("sha")]), [["/pendingadd", "reading", doc.capture.sha256]]);
  assert.equal(extractionOf(r.ctx).readingFor(doc.capture.sha256, "class:admin").found, false, "not read inline");
});

test("R124 (controls): a session that is gone, one with no opener, an answer with no document and a refused promotion deliver nothing and say why; nothing is thrown", async () => {
  const r = await owing();
  const doc = rendered(r);
  const go = (over) => deliverOwedRender({ ctx: r.ctx, env: r.env, storeName: "bio", answer: { ok: true, document: doc }, session: r.session, ...over });
  assert.deepEqual(await go({ session: "no-such-session" }), { ok: false, reason: "NO_SUCH_SESSION" });
  assert.deepEqual(await go({ answer: { ok: true } }), { ok: false, reason: "NO_RENDERED_DOCUMENT" });
  const ghost = `ghost-${Math.random().toString(16).slice(2)}`;
  captureOf(r.ctx).saveCaptureSession({ session: ghost, locator: r.shell.locator, primarySha: r.shell.capture.sha256, primaryFile: r.shell.file, base: r.shell.locator, state: { queue: [] } });
  assert.deepEqual(await go({ session: ghost }), { ok: false, reason: "NO_OPENER" });
  const bad = await go({ answer: { ok: true, document: { ...doc, file: undefined } } });
  assert.equal(bad.ok, false, "a document the promotion cannot take is refused, not thrown");
  assert.equal(typeof bad.reason, "string");
});
