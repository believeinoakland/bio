/* ratification R17 (N339, N349, N354; control-plane R23, R25, R30; K421, K444, K477): the eight relays of the two
   ceremonies — `op=caseratify`'s facts, gate and commit, `op=ratify`'s gate facts, image, list, gate (`ratifygate`,
   which runs the register probe in the store half, N417) and commit — answer the store's own
   refusal with its status, code and sentence, and only a reply that is no answer as the silence, carrying the store's
   correlation id when it gave one. The sub-reads inside the longer act relay a refusal by the same rule (K444). The
   control plane's helpers are stand-ins that behave as its R23, R25 and R30 state them (`doAnswer`, `storeSilent`,
   `storeRefusal`); each relay is driven with `storeRefusal` handed in (as the plane's door, `plane/door.mjs`, hands it)
   and without it (a caller handing only `{json, doAnswer, storeSilent, …}`), and the answers must be the same. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signCase, signBundle, cleanCase, cleanInfoMd, fmText, CASE_BODY, V, SILENT } from "./fixture.mjs";
import { caseRatifyOp, ratifyOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CORRELATION = "0f8fad5b-d9cb-469f-a165-70867728950e";
const STACK = "Error: boom\n    at Store.fetch (store.mjs:10:5)";
const reply = (body, status) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/* control-plane R23, R25: the store's envelope, read once. A stand-in store op answering a Response is read as the store
   answers over the Durable Object; one answering a plain value is an answer (the fixture's ops), `SILENT` no answer. */
async function doAnswer(p) {
  let v;
  try { v = await p; } catch { return { answered: false, result: undefined }; }
  if (v === SILENT) return { answered: false, result: undefined };
  if (!(v instanceof Response)) return { answered: true, result: v, reply: { status: 200, body: { ok: true, result: v } } };
  let out = null;
  try { out = await v.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const r = { status: v.status, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply: r };
  if (out.ok === false && r.status < 500) return { answered: false, refused: true, result: undefined, reply: r };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string" && UUID.test(out.correlation)
    ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}

async function caseWorld() {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice");
  const Q = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
  w.inquiry(Q);
  w.bv.conc.set(w.key(P, Q), { version: "first", claim: "c", falsifier: "f", falsifier_override: null,
                               by: "member:alice", at: "2026-09-27T10:00:00Z" });
  const conc = w.r.caseConclusionFor(P, Q, V("alice"), "open");
  const text = fmText(cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q, pin: w.sha(Q) }] }),
                      { raw: ["case_conclusions:", ...caseConclusionRowLines(Q, conc)], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  return { w, body: { caseId: CASE, edition: 1, expectedSha: docSha, sig: await signCase(key, CASE, 1, docSha) } };
}

async function ratifyWorld() {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice");
  const DOC = "INFO-2026-0001-report";
  w.promote(DOC, cleanInfoMd(DOC), "information");
  w.pub.resting.set(DOC, [{ case_id: "CASE-2026-0001", finding: "INQ-2026-0001-finding", project: P }]);
  return { w, body: { bundleId: DOC, expectedSha: w.sha(DOC), sig: await signBundle(key, DOC, w.sha(DOC)) } };
}

/* N354 (K477), N417: the register probe inside `op=ratify`'s gate runs in the store half (`ratifygate`), which the Worker
   relays. The bundle registers a capture the evidence store does not hold whole, so the gate asks the register whether
   it is held in parts (provenance's `registerHolds`). */
const HELD = "c".repeat(64);
async function probeWorld() {
  const made = await ratifyWorld();
  made.w.registers.set(made.body.bundleId, [{ capture_sha: HELD, path: "snapshots/a.pdf", bytes: 3, authored: 0 }]);
  return made;
}

/* The eight relays, each with the store op behind it and the op the silence names. */
const RELAYS = [
  { name: "caseratify/facts", op: "casedocfacts", make: caseWorld, run: caseRatifyOp },
  { name: "caseratify/gate", op: "casegate", make: caseWorld, run: caseRatifyOp },
  { name: "caseratify/commit", op: "caseratify", make: caseWorld, run: caseRatifyOp },
  { name: "ratify/gatefacts", op: "gatefacts", make: ratifyWorld, run: ratifyOp },
  { name: "ratify/image", op: "image", make: ratifyWorld, run: ratifyOp },
  { name: "ratify/list", op: "list", make: ratifyWorld, run: ratifyOp },
  { name: "ratify/publish", op: "publish", make: ratifyWorld, run: ratifyOp },
  { name: "ratify/gate", op: "ratifygate", make: probeWorld, run: ratifyOp },
];

const silent = (op, correlation = undefined) =>
  ({ status: 502, body: { ok: false, reason: "STORE_DID_NOT_ANSWER", code: "STORE_DID_NOT_ANSWER", op,
                          detail: "the store did not answer", correlation } });
const HANDED = {
  "with storeRefusal": (json) => ({ storeRefusal: (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status) }),
  "without it": () => ({}),
};

/* Drives one relay with its store op answering `answer()`; the answer, what the plane asked, and what was committed. */
async function drive(relay, answer, handed) {
  const { w, body } = await relay.make();
  w.ops[relay.op] = () => answer();
  const p = plane(w);
  p.ctx.doAnswer = doAnswer;
  p.ctx.storeSilent = silent;
  delete p.ctx.storeRefusal;
  Object.assign(p.ctx, handed(p.ctx.json));
  const res = await relay.run(p.request(body), p.stub, p.ctx);
  return { res, p, w };
}
const committed = (w) => w.pub.committed.length + w.count("published_bundles");
const wire = (res) => JSON.stringify(res.body);

test("R17 (N339, N354): each of the eight relays answers the store's own refusal (ok false below 500) with the store's status, code and sentence, never STORE_DID_NOT_ANSWER, with or without storeRefusal handed; nothing is committed or copied", async () => {
  const refusals = [
    [{ ok: false, reason: "BAD_JSON", error: "the body is not JSON" }, 400],
    [{ ok: false, reason: "UNKNOWN_OP", code: "UNKNOWN_OP", error: "unknown op: x", translation: "t" }, 404],
    [{ ok: false, error: "unknown op: publish" }, 404],
  ];
  for (const relay of RELAYS)
    for (const [label, handed] of Object.entries(HANDED))
      for (const [body, status] of refusals) {
        const { res, p, w } = await drive(relay, () => reply(body, status), handed);
        assert.ok(p.fetched.includes(relay.op), `${relay.name}: the store was asked`);
        assert.equal(p.fetched[p.fetched.length - 1], relay.op, `${relay.name}: the act stopped at the refusal`);
        assert.deepEqual([res.status, res.body], [status, body], `${relay.name} ${label}: the store's answer, as it gave it`);
        assert.equal(committed(w), 0, `${relay.name} ${label}: nothing committed`);
        assert.equal(p.published.size, 0, `${relay.name} ${label}: nothing copied`);
      }
});

test("R17: a relay handed storeRefusal answers through it, once, and its answer is the one composed without it", async () => {
  const body = { ok: false, reason: "BAD_JSON", error: "the body is not JSON" };
  for (const relay of RELAYS) {
    const seen = [];
    const spy = (json) => ({ storeRefusal: (out) => { seen.push(out.reply.status); return json(out.reply.body, out.reply.status); } });
    const via = await drive(relay, () => reply(body, 400), spy);
    const own = await drive(relay, () => reply(body, 400), HANDED["without it"]);
    assert.deepEqual(seen, [400], `${relay.name}: through storeRefusal once`);
    assert.deepEqual([via.res.status, wire(via.res)], [own.res.status, wire(own.res)], `${relay.name}: the same answer`);
  }
});

test("R17 (N349): a reply that is no answer is 502 STORE_DID_NOT_ANSWER naming the relay: a 500 with a stack carries no stack; the store's STORE_INTERNAL_ERROR carries its correlation id, and one without an id gets no correlation key", async () => {
  for (const relay of RELAYS)
    for (const [label, handed] of Object.entries(HANDED)) {
      const stack = (await drive(relay, () => reply({ ok: false, error: STACK }, 500), handed)).res;
      assert.deepEqual([stack.status, stack.body.reason, stack.body.op], [502, "STORE_DID_NOT_ANSWER", relay.name], `${relay.name} ${label}`);
      assert.ok(!wire(stack).includes("Store.fetch") && !("error" in stack.body), `${relay.name} ${label}: no stack`);
      assert.equal(stack.body.correlation, undefined, `${relay.name} ${label}: no correlation where the store gave none`);
      assert.equal("correlation" in JSON.parse(wire(stack)), false, `${relay.name} ${label}: no correlation key on the wire`);
      const withId = await drive(relay, () => reply({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION }, 500), handed);
      assert.deepEqual([withId.res.status, withId.res.body.reason, withId.res.body.op, withId.res.body.correlation],
        [502, "STORE_DID_NOT_ANSWER", relay.name, CORRELATION], `${relay.name} ${label}: the store's correlation`);
      assert.equal(committed(withId.w), 0);
      const noId = (await drive(relay, () => reply({ ok: false, reason: "STORE_INTERNAL_ERROR" }, 500), handed)).res;
      assert.deepEqual([noId.status, "correlation" in JSON.parse(wire(noId))], [502, false], `${relay.name} ${label}: no key without an id`);
      for (const bad of [() => new Response("not json", { status: 200 }), () => { throw new Error("down"); },
                         () => reply({ ok: false, reason: "BAD_JSON" }, 503), () => SILENT]) {
        const s = (await drive(relay, bad, handed)).res;
        assert.deepEqual([s.status, s.body.reason, s.body.op], [502, "STORE_DID_NOT_ANSWER", relay.name], `${relay.name} ${label}: no answer is a silence`);
      }
    }
});

test("R17: an answer is the handler's own to read — every relay answered, each ceremony completes as before", async () => {
  for (const make of [caseWorld, ratifyWorld]) {
    const { w, body } = await make();
    const p = plane(w);
    p.ctx.doAnswer = doAnswer;
    p.ctx.storeSilent = silent;
    const res = await (make === caseWorld ? caseRatifyOp : ratifyOp)(p.request(body), p.stub, p.ctx);
    assert.equal(res.status, 200, wire(res).slice(0, 400));
    assert.equal(res.body.ok, true);
  }
});

test("R17 (N354, N417): the gate's silence or refusal (`ratifygate`, where the register probe runs) is never a finding about the record; an answered gate whose probe finds nothing held is PLANE_MISSING_BYTES, and a receipt still reads as held in parts", async () => {
  for (const [label, handed] of Object.entries(HANDED)) {
    const relay = RELAYS.find((r) => r.op === "ratifygate");
    for (const answer of [() => SILENT, () => reply({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION }, 500),
                          () => reply({ ok: false, reason: "BAD_JSON", error: "the body is not JSON" }, 400)]) {
      const { res } = await drive(relay, answer, handed);
      assert.notEqual(res.body.reason, "GATE_REFUSED", label);
      assert.doesNotMatch(wire(res), /PLANE_MISSING_BYTES|PLANE_HELD_IN_PARTS|PLANE_PART_/, label);
    }
    const run = async (holds) => {
      const { w, body } = await probeWorld();
      if (holds) w.holds.set(HELD, holds);
      const p = plane(w);
      p.ctx.doAnswer = doAnswer;
      p.ctx.storeSilent = silent;
      delete p.ctx.storeRefusal;
      Object.assign(p.ctx, handed(p.ctx.json));
      return ratifyOp(p.request(body), p.stub, p.ctx);
    };
    const answered = await run(null);
    assert.deepEqual([answered.status, answered.body.reason], [409, "GATE_REFUSED"], label);
    assert.deepEqual(answered.body.findings.filter((f) => f.check.startsWith("PLANE_")).map((f) => [f.check, f.where.sha256]),
      [["PLANE_MISSING_BYTES", HELD]], `${label}: the negative control`);
    const inParts = await run({ ok: true, sha: HELD, asked: true, parts: null, registered: true, acquired: true });
    assert.deepEqual(inParts.body.findings.filter((f) => f.check.startsWith("PLANE_")).map((f) => f.check),
      ["PLANE_HELD_IN_PARTS"], `${label}: an answered receipt still reads as held in parts`);
  }
});
