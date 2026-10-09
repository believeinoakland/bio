/* capture-requests R55 (T41-25; N820): a request for a step. The door takes an optional `step`, one the run's principal
   sees, else refused as absent; on completion the drain ties the capture to the step (`steps.recordProduct`, steps R9);
   and the module registers `capture_request` as an arrival source (steps R11). `steps` is a stand-in the test scripts
   (K61), recording what it was asked; every test drives capture-requests at its interface, each with a negative
   control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, filed, refused, V } from "./fixture.mjs";
import { CAPTURE_REQUEST_CHECKS, CAPTURE_REQUEST_ARRIVAL_KIND } from "../../../src/capture-requests/index.mjs";

/** `steps` as a stand-in: `seen` maps a step id to the viewer stamps that see it (steps R2); `product` is what
 *  `recordProduct` answers (a value, or a function of its argument); each call is recorded. */
function fakeSteps({ seen = { "STP-1": ["member:ann"] }, product = { ok: true } } = {}) {
  const asked = [], products = [], regs = [];
  return {
    asked, products, regs,
    step({ step, viewer }) {
      asked.push({ step, viewer });
      return (seen[step] || []).includes(viewer) ? { ok: true, step, place: { group: true } } : null;
    },
    async recordProduct(a) { products.push(a); return typeof product === "function" ? product(a) : product; },
    registerArrivalSource(kind, read) { regs.push({ kind, read }); return { ok: true, kind }; },
  };
}

const count = (w) => w.row(`SELECT count(*) AS c FROM capture_requests`).c;

test("R55 a request may carry a step its run's principal sees: written on the row, answered by the door, by R6's standing answer and by every read", () => {
  const steps = fakeSteps();
  const w = world({ steps }).scene();
  const a = w.ask({ step: "STP-1" });
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.step, "STP-1");
  assert.equal(w.req(a.request).step, "STP-1");
  /* Sight is the run's principal's: the plane principal `member:ann/tok1` read as the viewer `member:ann`. */
  assert.deepEqual(steps.asked, [{ step: "STP-1", viewer: "member:ann" }]);
  assert.equal(w.cr.captureRequests({ viewer: V("ann") }).requests[0].step, "STP-1");
  assert.equal(w.cr.requestById({ request: a.request, viewer: V("ann") }).step, "STP-1");
  assert.equal(w.cr.waits({ run: "R-1" }).outstanding[0].step, "STP-1");
  /* R6: a second ask for the same key answers the standing row's step, whatever step it names, and writes nothing. */
  const again = w.ask({ step: "STP-1" });
  assert.equal(again.already, true);
  assert.equal(again.step, "STP-1");
  assert.equal(count(w), 1);
  /* Control: a request naming no step, or a blank one, is an ordinary request answering step null, and asks steps nothing. */
  const plain = w.ask({ address: "https://example.org/b" });
  const blank = w.ask({ address: "https://example.org/c", step: "  " });
  assert.equal(plain.ok && blank.ok, true);
  assert.equal(plain.step, null);
  assert.equal(blank.step, null);
  assert.equal(w.req(plain.request).step, null);
  assert.equal(steps.asked.length, 2, "only the two asks naming STP-1 asked steps");
});

test("R55 a step the run's principal does not see is refused as absent: CAPTURE_REQUEST_NO_STEP, alike for unseen, absent, malformed and unreadable, before anything is written", async () => {
  const steps = fakeSteps({ seen: { "STP-1": ["member:ann"], "STP-BOB": ["member:bob"] } });
  const w = world({ steps }).scene();
  const row = CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NO_STEP;
  const unseen = w.ask({ step: "STP-BOB" });
  const absent = w.ask({ step: "STP-NONE" });
  for (const r of [unseen, absent]) {
    assert.equal(r.ok, false);
    assert.equal(r.code, "CAPTURE_REQUEST_NO_STEP");
    assert.equal(r.reason, "CAPTURE_REQUEST_NO_STEP");
    assert.equal(r.check, "C-28.34");
    assert.equal(r.translation, row.translation);
  }
  /* An unseen step and an absent one answer alike but for the id. */
  assert.equal(unseen.detail.replace("STP-BOB", "X"), absent.detail.replace("STP-NONE", "X"));
  assert.deepEqual(Object.keys(unseen).sort(), Object.keys(absent).sort());
  /* Seen by someone else is not seen by the run's principal: the viewer asked is ann's, never the caller's body. */
  assert.ok(steps.asked.every((x) => x.viewer === "member:ann"));
  for (const bad of [42, { id: "STP-1" }, ["STP-1"], true])
    assert.equal(w.ask({ step: bad }).code, "CAPTURE_REQUEST_NO_STEP", JSON.stringify(bad));
  /* No steps reachable, or a steps that throws, sees no step: fail closed. */
  const bare = world().scene();
  assert.equal(bare.ask({ step: "STP-1" }).code, "CAPTURE_REQUEST_NO_STEP");
  assert.equal(count(bare), 0);
  const throwing = world({ steps: { step: () => { throw new Error("down"); } } }).scene();
  assert.equal(throwing.ask({ step: "STP-1" }).code, "CAPTURE_REQUEST_NO_STEP");
  /* An answer naming another step is not this one. */
  const other = world({ steps: { step: () => ({ ok: true, step: "STP-2" }) } }).scene();
  assert.equal(other.ask({ step: "STP-1" }).code, "CAPTURE_REQUEST_NO_STEP");
  /* Nothing was written, nothing listened, nothing fetched. */
  assert.equal(count(w), 0);
  assert.equal(count(throwing) + count(other), 0);
  await w.cr.drain();
  assert.equal(w.capture.calls.length, 0);
  /* Control: the step ann sees, on the same world, is accepted. */
  assert.equal(w.ask({ step: "STP-1" }).ok, true);
  assert.equal(count(w), 1);
});

test("R55 on completion the capture is tied to the step through steps.recordProduct, a new capture and R39's already-held one alike; a request for no step, or one not captured, ties nothing", async () => {
  const steps = fakeSteps();
  const w = world({ steps }).scene();
  const a = w.ask({ step: "STP-1" });
  const plain = w.ask({ address: "https://other.example.org/p" });
  const d = await w.cr.drain();
  assert.equal(d.captured.length, 2);
  const mine = d.captured.find((c) => c.request === a.request);
  const other = d.captured.find((c) => c.request === plain.request);
  assert.equal(steps.products.length, 1, "only the request made for a step is tied");
  const p = steps.products[0];
  assert.equal(p.step, "STP-1");
  assert.equal(p.record, mine.sha);
  assert.equal(p.kind, "capture");
  assert.equal(p.run, "R-1");
  assert.equal(p.request, a.request);
  assert.equal(p.by, "member:ann/tok1");
  assert.equal(p.at, d.at);
  assert.deepEqual(mine.step_product, { ok: true, step: "STP-1" });
  assert.equal("step_product" in other, false, "control: a request for no step carries no tie");
  assert.equal(w.req(a.request).capture_sha, mine.sha);

  /* R39: a capture the record already held is tied as that capture. */
  w.tick();
  const held = w.ask({ run: "R-2", address: "https://example.org/a", step: "STP-1" }, {});
  assert.equal(held.ok, false, "R-2 is not a run yet");
  w.run("R-2");
  const h = w.ask({ run: "R-2", address: "https://example.org/a", step: "STP-1" });
  w.capture.script.set("https://example.org/a", (body, opts) => filed("https://example.org/a", opts, { existed: true }));
  const d2 = await w.cr.drain();
  assert.equal(d2.captured[0].request, h.request);
  assert.equal(d2.captured[0].already_held, true);
  assert.equal(steps.products.length, 2);
  assert.equal(steps.products[1].record, mine.sha, "the held capture's digest");
  assert.equal(steps.products[1].request, h.request);

  /* Control: a request for a step the source refuses is not captured and ties nothing. */
  w.tick();
  const r = w.ask({ address: "https://refusing.example.org/x", step: "STP-1" });
  w.capture.script.set("https://refusing.example.org/x", refused(403));
  const d3 = await w.cr.drain();
  assert.equal(d3.refused[0].request, r.request);
  assert.equal(steps.products.length, 2);
});

test("R55 a tie the step refuses, throws on, or that no steps can take never changes the row or the drain's outcome: the capture is filed and the refusal relayed", async () => {
  const refusing = fakeSteps({ product: { ok: false, reason: "STEP_NOT_SEEN", detail: "no such step" } });
  const w = world({ steps: refusing }).scene();
  const a = w.ask({ step: "STP-1" });
  const d = await w.cr.drain();
  assert.equal(d.captured[0].request, a.request);
  assert.deepEqual(d.captured[0].step_product, { ok: false, step: "STP-1", reason: "STEP_NOT_SEEN",
                                                 detail: "no such step" });
  assert.equal(w.req(a.request).state, "captured");

  const throwing = fakeSteps({ product: () => { throw new Error("boom"); } });
  const w2 = world({ steps: throwing }).scene();
  const b = w2.ask({ step: "STP-1" });
  const d2 = await w2.cr.drain();
  assert.equal(d2.captured[0].step_product.ok, false);
  assert.equal(w2.req(b.request).state, "captured");
  assert.doesNotMatch(JSON.stringify(d2), /boom/, "a thrown message is never carried");

  /* A steps that saw the step at the door and has no recordProduct: filed, the tie said not made. */
  const w3 = world({ steps: { step: ({ step }) => ({ ok: true, step }) } }).scene();
  const c = w3.ask({ step: "STP-1" });
  const d3 = await w3.cr.drain();
  assert.equal(d3.captured[0].step_product.ok, false);
  assert.equal(w3.req(c.request).state, "captured");
  /* Control: the accepting steps answers the tie made. */
  const w4 = world({ steps: fakeSteps() }).scene();
  w4.ask({ step: "STP-1" });
  assert.equal((await w4.cr.drain()).captured[0].step_product.ok, true);
});

test("R55 capture_request is registered once at creation as an arrival source (steps R11); its read answers a request's state, met exactly when captured, null for an unknown or unseen one", async () => {
  const steps = fakeSteps();
  const w = world({ steps }).scene();
  assert.equal(CAPTURE_REQUEST_ARRIVAL_KIND, "capture_request");
  assert.deepEqual(steps.regs.map((r) => r.kind), ["capture_request"]);
  const read = steps.regs[0].read;
  const a = w.ask({ step: "STP-1" });
  const b = w.ask({ address: "https://refusing.example.org/x" });
  w.capture.script.set("https://refusing.example.org/x", refused(403));
  const waiting = read(a.request);
  assert.equal(waiting.kind, "capture_request");
  assert.equal(waiting.id, a.request);
  assert.equal(waiting.state, "requested");
  assert.equal(waiting.met, false);
  assert.equal(waiting.ended, false);
  const d = await w.cr.drain();
  const met = read({ id: a.request, viewer: V("ann") });
  assert.equal(met.state, "captured");
  assert.equal(met.met, true);
  assert.equal(met.ended, true);
  assert.equal(met.capture_sha, d.captured[0].sha);
  assert.equal(met.at, d.at);
  /* Control: a refused request has ended and is not met. */
  const no = read(b.request);
  assert.equal(no.state, "refused");
  assert.equal(no.met, false);
  assert.equal(no.ended, true);
  /* An unknown or blank id, or one whose target the viewer cannot see, answers null (steps: undetermined). */
  assert.equal(read("CR-NONE"), null);
  assert.equal(read(""), null);
  assert.equal(read({ id: a.request, viewer: "nobody" }), null);
  assert.equal(read(null), null);
  /* It writes nothing. */
  const before = w.rows(`SELECT * FROM capture_requests ORDER BY request`);
  read(a.request); read({ id: b.request, viewer: V("ann") });
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests ORDER BY request`), before);
  /* Control: without steps nothing is registered (the world builds, and a step is refused as absent). */
  const bare = world().scene();
  assert.equal(bare.ask({ step: "STP-1" }).code, "CAPTURE_REQUEST_NO_STEP");
});
