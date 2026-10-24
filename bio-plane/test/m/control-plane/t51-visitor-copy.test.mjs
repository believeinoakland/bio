/* acquisition: the SEAM of the visitor copy (T51 fix round 5, E8; R104, R100, R99). A capture with the visitor view, the object's render table reset
   (it restarted), the member's "Finish it" whose answer never reaches the record, then the plane's alarm: the run goes through the REAL merged
   parts, acquisition's `acquire` and `owedRun` over capture's real instance on a real record, and control-plane's real `deliverOwedRender`. The
   second document ("as a visitor saw it") is read back with `heldcaptures` and from the project's list. No answer shape is written by hand:
   the inputs are the member's own acts (the capture, the filing of the page as served, "Finish it"). */
import "../../sandbox.mjs";
import "./harness.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { network, HTML, page } from "../acquisition/fixture.mjs";

const { CAPTURE_SCREEN } = await import("../../../src/screens-intake/capture.mjs");
const { deliverOwedRender } = await import("../../../src/control-plane/index.mjs");
const { captureOf } = await import("../../../src/capture/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");
const { promotionOf } = await import("../../../src/promotion/index.mjs");
const { record } = await import("./record.mjs");

const hex = (b) => createHash("sha256").update(b).digest("hex");
const SHELL = HTML("<div id=app></div>");
const RENDERED = HTML("<p>the page as a visitor saw it</p>");
const PG = "https://www.nps.gov/arch/index.htm";
const R_ANSWER = (url) => ({ ok: true, html: RENDERED, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });
const who = { author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" };
const screen = (ctx) => ({ now: () => Date.now(), digest: async (t) => hex(t), w: (k) => k, date: (d) => d,
  call: async (op, { query = {}, body } = {}) => (op === "allocid" ? { ok: true, ...recordOf(ctx).allocId(query.prefix, query.year) } : promotionOf(ctx).promote({ ...body, ...who })) });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the plane's ledger, as a log of entries */
const ledger = () => { const entries = new Map(); return { entries, owedLater: async (e) => { entries.set(e.session, e); return { ok: true }; } }; };

async function captured() {
  const r = await record();
  /* the opener takes part in the project the page is filed in, as one who captured into it does */
  r.ctx.storage.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'ann', 'active', 0, '2026-10-22T00:00:00Z', '2026-10-22T00:00:00Z')`, PROJECT);
  let open; const gate = new Promise((x) => (open = x));
  r.env.RENDERER = { fetch: async (u, init) => { await gate; return new Response(JSON.stringify(R_ANSWER(JSON.parse(init.body).url))); } };
  const cap = captureOf(r.ctx);
  const L = ledger();
  cap.owedLater = L.owedLater;
  const net = network({ [PG]: () => page(SHELL) });
  let first;
  try { first = await cap.acquire({ locator: PG, render: true }, { cls: "member", member: true, sessMember: "member:ann", storeName: "bio", renderWaitMs: 20 }); }
  finally { net.restore(); }
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 300));
  const doc = first.body.document;
  const sid = doc.render_pending.session;
  /* the member's own act: the page as served is filed, as the capture screen files it */
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screen(r.ctx), { doc, title: "Arches", locator: PG, project: PROJECT });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  return { r, cap, L, sid, doc, shellBundle: made.bundleId, open };
}
const PROJECT = "INQ-2026-0001";
const heldBundles = async (cap, project = null) => (await cap.heldCaptures({ limit: 100, viewer: "class:admin", ...(project ? { project } : {}) }));

test("R104 R100 R99 (E8): a capture with the visitor view, the object restarted, \"Finish it\" whose answer is never filed, then the alarm: the visitor copy is a second document in the held list and in the record, once; control: nothing else changed", async () => {
  const c = await captured();
  c.open();
  await sleep(50);
  const fresh = await import("../../../src/acquisition/index.mjs?restart=seam-visitor");   // the object restarted: the render table is empty
  const net = network({ [PG]: () => page(SHELL) });
  let cont;
  try { cont = await fresh.acquire(c.cap, { continue: c.sid }, { cls: "member", member: true, sessMember: "member:ann", storeName: "bio", renderWaitMs: 5000 }); }
  finally { net.restore(); }
  assert.equal(cont.status, 200, JSON.stringify(cont.body).slice(0, 300));
  /* acquisition R117 (fix round 9, G126g; amends R106): the run's answer was kept in the session when it returned, so the restarted object finishes the copy in this
     request from it (no second render, reservation or charge): "Finish it" answers the finished copy, not `pending`; with the ledger the session stays, owing the
     document, until the alarm has seen it filed or delivered it (R104) */
  const copySha = hex(RENDERED);
  assert.deepEqual([cont.body.ok, cont.body.render && cont.body.render.state, cont.body.document && cont.body.document.capture.sha256],
                   [true, undefined, copySha], "\"Finish it\" answers the finished copy from the answer kept in the session");
  /* that answer is never filed. Before the alarm: the held list holds the page as served alone */
  const before = await heldBundles(c.cap);
  assert.equal(before.held.filter((x) => x.capture && x.capture.sha256 === copySha).length, 0, "the visitor copy is not yet a document");
  assert.ok(c.cap.loadCaptureSession({ session: c.sid }).found, "the session still owes it");
  /* the alarm runs the ledger's entry through the real delivery */
  const out = await fresh.owedRun(c.cap, c.L.entries.get(c.sid), { deliver: (d) => deliverOwedRender({ ctx: c.r.ctx, env: c.r.env, storeName: "bio", answer: d.answer, session: d.session }) });
  assert.deepEqual([out.ok, out.done], [true, true], JSON.stringify(out));
  const after = await heldBundles(c.cap);
  const copies = after.held.filter((x) => x.capture && x.capture.sha256 === copySha);
  assert.equal(copies.length, 1, "exactly one second document, the page as a visitor saw it");
  assert.notEqual(copies[0].bundle_id, c.shellBundle, "beside the page as served, not over it");
  assert.equal(after.held.length, before.held.length + 1);
  const inProject = (await heldBundles(c.cap, PROJECT)).held.map((x) => x.bundle_id);
  assert.ok(inProject.includes(copies[0].bundle_id) && inProject.includes(c.shellBundle), "both documents are in the project's list");
  const inRecord = [...c.r.ctx.storage.sql.exec(`SELECT bundle_id FROM bundles WHERE bundle_id = ?`, copies[0].bundle_id)];
  assert.equal(inRecord.length, 1, "and the record holds it");
  assert.equal(c.cap.loadCaptureSession({ session: c.sid }).found, false, "the session closed once delivered");
  /* control: the alarm again finds nothing owed and files nothing more */
  const again = await fresh.owedRun(c.cap, c.L.entries.get(c.sid), { deliver: async () => { throw new Error("delivered twice"); } });
  assert.deepEqual([again.ok, again.done], [true, true]);
  assert.equal((await heldBundles(c.cap)).held.length, after.held.length);
});
