/* capture-requests R55 (T41-25; N820): a request for a step. The door takes an optional `step`, one the run's principal
   sees, else refused as absent; on completion the drain ties the capture to the step (`steps.recordProduct`, steps R9);
   and the module registers `capture_request` as an arrival source (steps R11). `steps` is the real module on the
   fixture's storage (B3, K2491), read back through its own reads (`productsOf`, `stepWait`, `step`); every test drives
   capture-requests at its interface, each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, filed, refused, V } from "./fixture.mjs";
import { CAPTURE_REQUEST_CHECKS, CAPTURE_REQUEST_ARRIVAL_KIND } from "../../../src/capture-requests/index.mjs";

const count = (w) => w.row(`SELECT count(*) AS c FROM capture_requests`).c;
/** A step on INQ-1 by ann. */
const stepOf = (w, work = "find the council minutes", questions = ["INQ-1"], by = "member:ann") => {
  const s = w.steps.stepCreate({ place: { questions }, work, by });
  assert.equal(s.ok, true, JSON.stringify(s));
  return s.step;
};
/** A question in a project ann has not joined (hidden from her), with a step on it by its participant. */
const hiddenStep = (w) => {
  w.project("PROJ-H");
  w.participant("PROJ-H", "inner");
  w.bundle("INQ-H");
  w.st.sql.exec(`UPDATE bundles SET project='PROJ-H' WHERE bundle_id = 'INQ-H'`);
  w.membership.reindexProjectSight("INQ-H");
  return stepOf(w, "read the hidden ledger", ["INQ-H"], "member:inner");
};

test("R55 a request may carry a step its run's principal sees: written on the row, answered by the door, by R6's standing answer and by every read", () => {
  const w = world().scene();
  const stp = stepOf(w);
  const a = w.ask({ step: stp });
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.step, stp);
  assert.equal(w.req(a.request).step, stp);
  assert.equal(w.cr.captureRequests({ viewer: V("ann") }).requests[0].step, stp);
  assert.equal(w.cr.requestById({ request: a.request, viewer: V("ann") }).step, stp);
  assert.equal(w.cr.waits({ run: "R-1" }).outstanding[0].step, stp);
  /* R6: a second ask for the same key answers the standing row's step, whatever step it names, and writes nothing. */
  const other = stepOf(w, "another piece of work");
  const again = w.ask({ step: other });
  assert.equal(again.already, true);
  assert.equal(again.step, stp);
  assert.equal(count(w), 1);
  /* Control: a request naming no step, or a blank one, is an ordinary request answering step null. */
  const plain = w.ask({ address: "https://example.org/b" });
  const blank = w.ask({ address: "https://example.org/c", step: "  " });
  assert.equal(plain.ok && blank.ok, true);
  assert.equal(plain.step, null);
  assert.equal(blank.step, null);
  assert.equal(w.req(plain.request).step, null);
});

test("R55 a step the run's principal does not see is refused as absent: CAPTURE_REQUEST_NO_STEP, alike for unseen, absent and malformed, before anything is written", async () => {
  const w = world().scene();
  const hidden = hiddenStep(w);
  const row = CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NO_STEP;
  /* The step is held, seen by its project's participant, and not by ann, the run's principal. */
  assert.equal(w.steps.step({ step: hidden, viewer: "member:inner" }).ok, true);
  assert.equal(w.steps.step({ step: hidden, viewer: "member:ann" }).ok, false);
  const unseen = w.ask({ step: hidden });
  const absent = w.ask({ step: "STP-2026-aaaaaaaaaaaaaaaa" });
  for (const r of [unseen, absent]) {
    assert.equal(r.ok, false);
    assert.equal(r.code, "CAPTURE_REQUEST_NO_STEP");
    assert.equal(r.reason, "CAPTURE_REQUEST_NO_STEP");
    assert.equal(r.check, "C-28.34");
    assert.equal(r.translation, row.translation);
  }
  /* An unseen step and an absent one answer alike but for the id. */
  assert.equal(unseen.detail.replace(hidden, "X"), absent.detail.replace("STP-2026-aaaaaaaaaaaaaaaa", "X"));
  assert.deepEqual(Object.keys(unseen).sort(), Object.keys(absent).sort());
  /* The sight asked is the run's principal's, not the viewer stamp the call carries: inner's viewer on ann's run is
     still judged as ann. */
  assert.equal(w.ask({ step: hidden }, { viewer: V("inner") }).code, "CAPTURE_REQUEST_NO_STEP");
  for (const bad of [42, { id: hidden }, [hidden], true])
    assert.equal(w.ask({ step: bad }).code, "CAPTURE_REQUEST_NO_STEP", JSON.stringify(bad));
  /* No steps reachable, or a steps that throws, sees no step: fail closed. */
  const bare = world({ steps: null }).scene();
  assert.equal(bare.ask({ step: "STP-2026-aaaaaaaaaaaaaaaa" }).code, "CAPTURE_REQUEST_NO_STEP");
  const throwing = world({ steps: { step: () => { throw new Error("down"); } } }).scene();
  assert.equal(throwing.ask({ step: "STP-2026-aaaaaaaaaaaaaaaa" }).code, "CAPTURE_REQUEST_NO_STEP");
  /* Nothing was written, nothing fetched. */
  assert.equal(count(w) + count(bare) + count(throwing), 0);
  await w.cr.drain();
  assert.equal(w.capture.calls.length, 0);
  /* Control: when inner's run asks, the step she sees is accepted. */
  w.run("R-H", { plane: "member:inner/tok3", context: "INQ-H" });
  const ok = w.ask({ run: "R-H", target: "INQ-H", step: hidden }, { viewer: V("inner"), caller: "member:inner/tok3" });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(count(w), 1);
});

test("R55 on completion the capture is tied to the step through steps.recordProduct, a new capture and R39's already-held one alike; a request for no step, or one not captured, ties nothing", async () => {
  const w = world().scene();
  const stp = stepOf(w);
  const a = w.ask({ step: stp });
  const plain = w.ask({ address: "https://other.example.org/p" });
  const d = await w.cr.drain();
  assert.equal(d.captured.length, 2);
  const mine = d.captured.find((c) => c.request === a.request);
  const other = d.captured.find((c) => c.request === plain.request);
  assert.deepEqual(mine.step_product, { ok: true, step: stp });
  assert.equal("step_product" in other, false, "control: a request for no step carries no tie");
  /* The step holds the capture as its product, read through steps' own read. A capture's sight is its bundle's: the
     record files the promoted capture in its bundle (provenance's register, a stand-in table here). */
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                 VALUES (?, ?, 'snapshots/x.bin', 'binary', 1, 't')`, mine.sha, mine.promoted.bundle_id);
  assert.equal(w.row(`SELECT by_actor FROM step_products WHERE ref = ?`, mine.sha).by_actor, "member:ann/tok1",
               "tied by the row's plane principal");
  const products = () => w.steps.productsOf({ step: stp, viewer: "member:ann" }).products;
  assert.deepEqual(products().map((p) => [p.kind, p.id]), [["capture", mine.sha]]);
  assert.equal(w.req(a.request).capture_sha, mine.sha);

  /* R39: a capture the record already held is tied as that capture, to the step its own request names. */
  w.tick();
  const stp2 = stepOf(w, "check the agenda too");
  w.run("R-2");
  const h = w.ask({ run: "R-2", address: "https://example.org/a", step: stp2 });
  w.capture.script.set("https://example.org/a", (body, opts) => filed("https://example.org/a", opts, { existed: true }));
  const d2 = await w.cr.drain();
  assert.equal(d2.captured[0].request, h.request);
  assert.equal(d2.captured[0].already_held, true);
  assert.deepEqual(w.steps.productsOf({ step: stp2, viewer: "member:ann" }).products.map((p) => [p.kind, p.id]),
                   [["capture", mine.sha]]);

  /* Control: a request for a step the source refuses is not captured and ties nothing. */
  w.tick();
  const r = w.ask({ address: "https://refusing.example.org/x", step: stp });
  w.capture.script.set("https://refusing.example.org/x", refused(403));
  const d3 = await w.cr.drain();
  assert.equal(d3.refused[0].request, r.request);
  assert.equal(products().length, 1);
});

test("R55 a tie the step refuses, or a steps that throws, never changes the row or the drain's outcome: the capture is filed and the refusal relayed", async () => {
  const w = world().scene();
  /* A step deleted (untouched, steps R6) after the request was filed: recordProduct answers it absent. */
  const stp = stepOf(w, "a step later withdrawn");
  const a = w.ask({ step: stp });
  assert.equal(w.steps.stepDelete({ step: stp, by: "member:ann" }).ok, true);
  const d = await w.cr.drain();
  assert.equal(d.captured[0].request, a.request);
  assert.equal(d.captured[0].step_product.ok, false);
  assert.equal(d.captured[0].step_product.step, stp);
  assert.ok(d.captured[0].step_product.reason, "steps' own refusal code is relayed");
  assert.equal(w.req(a.request).state, "captured");

  const throwing = world({ steps: { step: ({ step }) => ({ ok: true, step }),
                                    recordProduct: () => { throw new Error("boom"); } } }).scene();
  const b = throwing.ask({ step: "STP-2026-bbbbbbbbbbbbbbbb" });
  const d2 = await throwing.cr.drain();
  assert.equal(d2.captured[0].step_product.ok, false);
  assert.equal(throwing.req(b.request).state, "captured");
  assert.doesNotMatch(JSON.stringify(d2), /boom/, "a thrown message is never carried");
  /* Control: a held step takes the tie. */
  const w4 = world().scene();
  w4.ask({ step: stepOf(w4) });
  assert.equal((await w4.cr.drain()).captured[0].step_product.ok, true);
});

test("R55 capture_request is registered at creation as an arrival source (steps R11): a step's wait on a request is met exactly when it is captured", async () => {
  const w = world().scene();
  assert.equal(CAPTURE_REQUEST_ARRIVAL_KIND, "capture_request");
  /* The kind is held: a second registration of it is refused, naming this module as its holder. */
  const second = w.steps.registerArrivalSource("capture_request", () => true, "someone-else");
  assert.equal(second.ok, false);
  const waiter = stepOf(w, "wait for the minutes to arrive");
  const a = w.ask({ address: "https://example.org/a" });
  const b = w.ask({ address: "https://refusing.example.org/x" });
  w.capture.script.set("https://refusing.example.org/x", refused(403));
  assert.equal(w.steps.stepWait({ step: waiter, on: { arrival: { kind: "capture_request", id: a.request } }, by: "member:ann" }).ok, true);
  const waits = () => w.steps.step({ step: waiter, viewer: "member:ann" }).waits;
  const before = waits();
  assert.equal(w.steps.step({ step: waiter, viewer: "member:ann" }).state, "waiting", JSON.stringify(before));
  assert.equal(w.cr.arrived(a.request), false);
  await w.cr.drain();
  assert.equal(w.cr.arrived(a.request), true);
  assert.notEqual(w.steps.step({ step: waiter, viewer: "member:ann" }).state, "waiting", "the arrival met the wait");
  /* Control: a refused request has not arrived; an unknown or blank id is undetermined (null). */
  assert.equal(w.cr.arrived(b.request), false);
  assert.equal(w.cr.arrived("CR-NONE"), null);
  assert.equal(w.cr.arrived(""), null);
  const other = stepOf(w, "wait for the refused one");
  w.steps.stepWait({ step: other, on: { arrival: { kind: "capture_request", id: b.request } }, by: "member:ann" });
  assert.equal(w.steps.step({ step: other, viewer: "member:ann" }).state, "waiting");
  /* It writes nothing. */
  const rows = w.rows(`SELECT * FROM capture_requests ORDER BY request`);
  w.cr.arrived(a.request); w.cr.arrived(b.request);
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests ORDER BY request`), rows);
  /* Control: with no steps nothing is registered, and the world still builds. */
  assert.equal(world({ steps: null }).scene().ask({}).ok, true);
});
