/* control-plane R123, R125, R105, R20 (fix round 6, G5, G7, G1, G12c; K4570, K4571, K4573; R-FOUR, R-CLOCK): THE ROUND-6 CASES AT THE DOOR. Each case is the walker's, entered the way the
   screens enter it (an upload of the walker's size, an `acquire` that ran past the bound), with a store that FAILS the test if a read the case says must wait runs
   inside the request. No timing is taken from the object's clock (R-CLOCK): the test asserts the calls made and the rows written.
     G5   a 12,000,060 B text upload is answered `reading_pending` and nothing is read in the request; a 1 MB text is read inline; the size rule is by format class
          (text and office above 3 MiB, a PDF above 2 MiB), also on the `existed` path with no home, and a reading already held is not promised again;
     G7   a capture over the statement threshold (41.5 MB in parts, a 40 MB upload) is answered with its `final` reading and its size whatever the clock
          says: no `reading_pending`, no row owed (the clock is the door's bound, set short here as a late request is);
     G1   the plane's cron literal beside its limits, and the batch reads' keys (`projects`, `ids`, `drafts`) reaching the store.
   The whole path over the real plane is `t51-round6-seam.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks, opCalls } from "./harness.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const SHA = "d".repeat(64);
const MB = 1024 * 1024;
const ok = (result) => new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "content-type": "application/json" } });
const bare = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const asked = (env, route) => opCalls(env).filter((c) => c.route === route);
const docOf = (o = {}) => ({ file: `snapshots/upload-${SHA}`, locator: o.locator ?? `upload:${SHA}`, retrieved: "2026-10-22T00:00:00Z", profile: o.profile ?? {},
  capture: { sha256: SHA, bytes: o.bytes ?? 9, method: "uploaded", ...(o.type ? { content_type: o.type } : {}) },
  ...(o.parts ? { parts: Array.from({ length: o.parts }, (_, i) => ({ sha256: String(i).repeat(64), bytes: Math.ceil((o.bytes ?? 9) / o.parts) })) } : {}) });
const READ = { reading: { found: true, entities: 0 }, text_units: [{ extent: { kind: "document" }, text: "line one\nline two" }] };
const STATED = { reading: { found: false, failure: "final", basis: "the capture is 40014922 bytes in 5 parts, over the 25165824 B a format entry is handed here, so it was not read" }, text_units: [] };
/* the store: an upload lands as the scripted answer; a read that runs fails the test by name */
const storeFor = (landed, { held = null, read = READ } = {}) => (c) => {
  if (c.route === "captureupload") return ok(landed);
  if (c.route === "readheldfor") return held ? ok(held(c)) : ok({ ok: true, read: false, why: "NO_HOME" });
  if (c.route === "extractread") return ok(read);
  return null;
};
const upload = (w, hooks) => call(w.env, { op: "captureupload", token: w.S.ann, method: "POST", params: { statement: "s", name: "a.txt", type: "text/plain" }, body: "x", ...(hooks ? { hooks } : {}) });
const late = () => ({ ...defaultHooks(), acquireBoundMs: 1 });   /* the door's bound is spent: the clock arm says "will not fit" */

/* ---- G5 ---- */

test("R123, R125 (G5): the walker's 12,000,060 B text upload is answered at once with `reading_pending`, its row written once, and nothing is read inside the request", async () => {
  const landed = { ok: true, existed: false, capture: { sha256: SHA, bytes: 12000060 }, document: docOf({ bytes: 12000060, type: "text/plain" }) };
  const w = world({ answer: storeFor(landed) });
  const r = await upload(w);
  assert.equal(r.status, 200, r.text);
  assert.equal(asked(w.env, "extractread").length, 0, "no read ran in the request");
  assert.equal(r.json.result.reading_pending, true);
  assert.equal(r.json.result.document.reading, undefined, "the document is answered unread, filed by the screen as it stands");
  const adds = asked(w.env, "pendingadd");
  assert.equal(adds.length, 1, "one row owed");
  assert.deepEqual([adds[0].params.kind, adds[0].params.sha, adds[0].method], ["reading", SHA, "POST"]);
});

test("R123, R125 (G5 control): a 1 MB text upload is read inline as before: its reading is in the answer, no row, no `reading_pending`", async () => {
  const landed = { ok: true, existed: false, capture: { sha256: SHA, bytes: MB }, document: docOf({ bytes: MB, type: "text/plain" }) };
  const w = world({ answer: storeFor(landed) });
  const r = await upload(w);
  assert.equal(r.status, 200, r.text);
  assert.equal(asked(w.env, "extractread").length, 1);
  assert.deepEqual(r.json.result.document.reading, READ.reading);
  assert.equal(r.json.result.reading_pending, undefined);
  assert.equal(asked(w.env, "pendingadd").length, 0);
});

test("R123, R125 (G5, the size by format class): text and office files above 3 MiB are owed, a PDF above 2 MiB; at the threshold each is read inline; a file of no stated type is owed above 3 MiB", async () => {
  const OFFICE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const cases = [["text/plain", 3 * MB, false], ["text/plain", 3 * MB + 1, true], ["text/html", 4 * MB, true], ["text/csv", 5 * MB, true], [OFFICE, 3 * MB, false], [OFFICE, 6 * MB, true],
                 ["application/pdf", 2 * MB, false], ["application/pdf", 2 * MB + 1, true], [undefined, 3 * MB + 1, true]];
  for (const [type, bytes, deferred] of cases) {
    const landed = { ok: true, existed: false, capture: { sha256: SHA, bytes }, document: docOf({ bytes, ...(type ? { type } : {}) }) };
    const w = world({ answer: storeFor(landed) });
    const r = await upload(w);
    const label = `${type} ${bytes}`;
    assert.equal(r.status, 200, `${label}: ${r.text}`);
    assert.equal(r.json.result.reading_pending === true, deferred, label);
    assert.equal(asked(w.env, "extractread").length, deferred ? 0 : 1, `${label}: read in the request or owed`);
    assert.equal(asked(w.env, "pendingadd").length, deferred ? 1 : 0, label);
  }
});

test("R123, R125 (G5, `existed` with no home): bytes held whose upload was never promoted, 12 MB of text, are owed and not read again in the request (the walker's 21-23 s second and third uploads)", async () => {
  const landed = { ok: true, existed: true, capture: { sha256: SHA, bytes: 12000060 }, document: docOf({ bytes: 12000060, type: "text/plain" }) };
  const w = world({ answer: storeFor(landed, { held: () => ({ ok: true, read: false, why: "NO_HOME" }) }) });
  const r = await upload(w);
  assert.equal(r.status, 200, r.text);
  assert.equal(asked(w.env, "extractread").length, 0, "not read again inside the request");
  assert.equal(r.json.result.reading_pending, true);
  assert.equal(asked(w.env, "pendingadd").length, 1);
});

test("R123, R125 (G5, a promoted upload): the same 12 MB text uploaded again once its reading is held answers `existed` with no read and no promise: nothing is owed and `reading_pending` is not said", async () => {
  const landed = { ok: true, existed: true, capture: { sha256: SHA, bytes: 12000060 }, receipt: { address: `upload:${SHA}` } };
  const made = { found: true, reading: { found: true, entities: 0 }, text_units: [{ text: "x" }] };
  const w = world({ answer: (c) => (c.route === "reading" ? ok(made) : storeFor(landed)(c)) });
  const r = await upload(w);
  assert.equal(r.status, 200, r.text);
  assert.deepEqual(r.json.result, landed, "relayed as it was");
  assert.equal(asked(w.env, "extractread").length, 0);
  assert.equal(asked(w.env, "pendingadd").length, 1, "R130: bytes held before this upload have the door's own row registered first, which the plane finishes with nothing to read");
  assert.equal(asked(w.env, "readheldfor").length, 0, "the owner is not asked to read");
  assert.ok(asked(w.env, "reading")[0].params.viewer, "the plain read, as the member may see");
  /* control: a held statement is not a made reading, so it stays owed */
  const stated = world({ answer: (c) => (c.route === "reading" ? ok({ found: true, reading: { found: false, failure: "transient" } }) : storeFor(landed)(c)) });
  assert.equal((await upload(stated)).json.result.reading_pending, true);
});

/* ---- G7 ---- */

test("R123, R125 (G7): a 40 MB five-part upload with the clock spent answers its `final` reading with the size, no `reading_pending`, no row owed", async () => {
  const landed = { ok: true, existed: false, capture: { sha256: SHA, bytes: 40014922 }, document: docOf({ bytes: 40014922, type: "application/pdf", pdf: true, parts: 5 }) };
  const w = world({ answer: storeFor(landed, { read: STATED }) });
  const r = await upload(w, late());
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.result.reading_pending, undefined, "the statement is made from sizes alone: nothing follows");
  assert.equal(r.json.result.document.reading.failure, "final");
  assert.ok(r.json.result.document.reading.basis.includes("40014922"), "with its size");
  assert.equal(asked(w.env, "pendingadd").length, 0, "no row owed");
  /* control: the same clock on a 1 MB text is owed, as a late request's reading is */
  const small = world({ answer: storeFor({ ok: true, existed: false, capture: { sha256: SHA, bytes: MB }, document: docOf({ bytes: MB, type: "text/plain" }) }) });
  const s = await upload(small, late());
  assert.equal(s.json.result.reading_pending, true);
  assert.equal(asked(small.env, "pendingadd").length, 1);
});

test("R123, R125 (G7): a 41.5 MB five-part capture answered after the bound is nearly spent carries no `reading_pending` and owes no row; the statement is `readHeld`'s, asked for the digest", async () => {
  const answer = { ok: true, existed: null, existed_undetermined: "captured in 5 parts", document: docOf({ bytes: 41502904, type: "application/pdf", parts: 5, locator: "https://www.example.gov/budget.pdf" }) };
  const hooks = { ...defaultHooks(), acquireBoundMs: 1, async gatedOp(ctx) { return ctx.op === "acquire" ? M.json(answer) : undefined; } };
  const w = world({ answer: (c) => (c.route === "readheldfor" ? ok({ ok: true, read: true, found: false }) : null) });
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://www.example.gov/budget.pdf" } });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.reading_pending, undefined);
  assert.equal(asked(w.env, "pendingadd").length, 0, "no row owed");
  assert.equal(asked(w.env, "readheldfor").length, 1, "the statement is asked for");
  /* the question the door puts to the plane's acquire: never "will not fit" for a statement */
  const seen = [];
  const probe = { ...defaultHooks(), acquireBoundMs: 1, async gatedOp(ctx) {
    if (ctx.op !== "acquire") return undefined;
    seen.push(await ctx.deferReading(answer.document), await ctx.deferReading({ capture: { sha256: SHA, bytes: MB, content_type: "text/plain" } }));
    return M.json({ ok: true, existed: false, document: answer.document });
  } };
  const p = world();
  await call(p.env, { op: "acquire", token: p.S.ann, method: "POST", hooks: probe, body: { locator: "https://x.example/b.pdf" } });
  assert.deepEqual(seen, [false, true], "over the statement threshold the clock is no reason to wait; a small file with the clock spent still waits");
});

test("R123 (G7, the promotion): a promoted 41.5 MB capture with the clock spent asks for its statement and owes no row", async () => {
  const sha = "e".repeat(64);
  const files = [{ path: "data/provenance.json", text: JSON.stringify({ documents: [{ locator: "https://www.example.gov/budget.pdf", capture: { sha256: sha, bytes: 41502904, content_type: "application/pdf" },
    parts: Array.from({ length: 5 }, (_, i) => ({ sha256: String(i).repeat(64), bytes: 8300581 })) }] }) }];
  const w = world({ answer: (c) => (c.route === "promote" ? ok({ ok: true, bundle_id: "INFO-1" }) : c.route === "readheldfor" ? ok({ ok: true, read: true, found: false }) : null) });
  const r = await call(w.env, { op: "promote", token: w.S.ann, method: "POST", hooks: late(), body: { files } });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.result.reading_pending, undefined);
  assert.equal(asked(w.env, "pendingadd").length, 0);
  assert.equal(asked(w.env, "readheldfor")[0].params.sha, sha);
});

/* ---- G1 ---- */

test("R1 (G1): the door carries the plane's cron as a literal statement beside its limits: `bio-plane-crons/1 */5 * * * *`, once, exported and on the function it makes", async () => {
  assert.equal(M.PLANE_CRONS_STATEMENT, "bio-plane-crons/1 */5 * * * *");
  const door = M.makeFetch({});
  assert.equal(door.cronsStatement, "bio-plane-crons/1 */5 * * * *");
  assert.equal(door.limitsStatement, "bio-plane-limits/1 cpu_ms=300000 subrequests=10000", "the limits statement is as it was");
  const crons = M.PLANE_CRONS_STATEMENT.split(" ").slice(1).join(" ");
  assert.equal(crons.split(/\s+/).length, 5, "one five-field cron");
});

/* ---- G12c ---- */

test("R20, R29 (G12c): the batch reads' keys reach the store: `casedrafts` with `projects`, `inquirystrength` with `ids`, a member's `reviewcopy` with `drafts`; a grant holder's reads are single", async () => {
  const w = world();
  await call(w.env, { op: "casedrafts", token: w.S.ann, params: { projects: "P-1,P-2" } });
  assert.equal(asked(w.env, "casedrafts")[0].params.projects, "P-1,P-2");
  assert.ok(asked(w.env, "casedrafts")[0].params.viewer, "the viewer is the door's stamp");
  await call(w.env, { op: "inquirystrength", token: w.S.ann, params: { ids: "Q-1,Q-2" } });
  assert.equal(asked(w.env, "inquirystrength")[0].params.ids, "Q-1,Q-2");
  await call(w.env, { op: "reviewcopy", token: w.S.ann, params: { drafts: "D-1,D-2" } });
  const [c] = asked(w.env, "reviewcopy");
  assert.equal(c.params.drafts, "D-1,D-2");
  assert.ok(c.params.viewer, "the member's read is stamped with her viewer");
  /* control: a grant's secret reads one draft; a `drafts` beside it is not passed */
  const g = world();
  await call(g.env, { op: "reviewcopy", params: { draft: "D-1", drafts: "D-1,D-2", secret: "a-secret-value" } });
  const [s] = asked(g.env, "reviewcopy");
  assert.equal(s.params.drafts, undefined, "a secret opens one copy");
  assert.equal(s.params.draft, "D-1");
});

/* ---- G2, G3 ---- */

test("R105, R123 (G2): a document-less `fetch_pending` answer of a large capture is relayed untouched: nothing is promoted, read or written down by the door (the alarm's delivery does that)", async () => {
  const answer = { ok: true, fetch_pending: { session: "fs_1", since: "2026-10-22T00:00:00Z", declared_bytes: 15932155, why: "LARGE" } };
  const hooks = { ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "acquire" ? M.json(answer) : undefined; } };
  const w = world();
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://www.example.gov/BUDGET.pdf", project: "PROJ-2026-0001" } });
  assert.equal(r.status, 200, r.text);
  assert.deepEqual({ ok: r.json.ok, fetch_pending: r.json.fetch_pending }, answer, "relayed as the owner answered it");
  assert.equal(r.json.document, undefined);
  assert.equal(r.json.reading_pending, undefined);
  for (const route of ["readheldfor", "pendingadd", "promote"]) assert.equal(asked(w.env, route).length, 0, `${route} is not asked`);
});

test("R105 (G2, G3): the timed-out answer's `kept` is asked of the store: an address the record holds, or the opener's own session whose page is kept, is `held` and carries no `kept nothing`; a capture it does not hold is `nothing` with the design's detail", async () => {
  const slow = { ...defaultHooks(), acquireBoundMs: 30, async gatedOp(ctx) { if (ctx.op !== "acquire") return undefined; await new Promise((r) => setTimeout(r, 300)); return M.json({ ok: true }); } };
  const stages = () => ok({ ok: true, stageTimes: { stages: { fetch: 12 }, running: "read", total_ms: 30 } });
  const timed = async (answer, body, token) => {
    const w = world({ answer: (c) => (c.route === "acquiretimings" ? stages() : answer(c)) });
    const r = await call(w.env, { op: "acquire", token: token ?? w.S.ann, method: "POST", hooks: slow, body });
    return { r, w };
  };
  /* held by address: this call's stages say nothing was kept, the record holds the address */
  const byAddress = await timed((c) => (c.route === "heldat" ? ok({ ok: true, held: true }) : null), { locator: "https://www.example.gov/BUDGET.pdf" });
  assert.equal(byAddress.r.status, 504, byAddress.r.text);
  assert.equal(byAddress.r.json.code, "ACQUIRE_TIMED_OUT");
  assert.equal(byAddress.r.json.kept, "held");
  assert.notEqual(byAddress.r.json.detail, word("refusal.ACQUIRE_TIMED_OUT"), "no \"kept nothing\" is said of a capture the record holds");
  const [q] = asked(byAddress.w.env, "heldat");
  assert.equal(q.params.address, "https://www.example.gov/BUDGET.pdf");
  assert.ok(q.params.viewer, "asked as the member may see");
  /* a continued session: the opener's own */
  const session = (opener) => (c) => (c.route === "loadcapturesession" ? ok({ session: "rs_1", found: true, primarySha: "a".repeat(64), state: { opened_by: opener } }) : null);
  const mine = await timed(session("member:ann"), { continue: "rs_1" });
  assert.equal(mine.r.json.kept, "held", "her session's page is kept");
  assert.notEqual(mine.r.json.detail, word("refusal.ACQUIRE_TIMED_OUT"));
  /* controls: another member's session id states nothing; a capture the record does not hold is nothing, with the detail */
  const theirs = await timed(session("member:bea"), { continue: "rs_1" });
  assert.equal(theirs.r.json.kept, "nothing");
  assert.equal(theirs.r.json.detail, word("refusal.ACQUIRE_TIMED_OUT"));
  const none = await timed((c) => (c.route === "heldat" ? ok({ ok: true, held: false }) : null), { locator: "https://www.example.gov/BUDGET.pdf" });
  assert.equal(none.r.json.kept, "nothing");
  assert.equal(none.r.json.detail, word("refusal.ACQUIRE_TIMED_OUT"));
  /* a store that cannot be asked states nothing more than the stages did */
  const silent = await timed((c) => (c.route === "heldat" ? new Response("x", { status: 500 }) : null), { locator: "https://www.example.gov/BUDGET.pdf" });
  assert.equal(silent.r.json.kept, "nothing");
  /* a capture the stages already say is kept is not asked of the store */
  const stagesHeld = world({ answer: (c) => (c.route === "acquiretimings" ? ok({ ok: true, stageTimes: { stages: { fetch: 1, receipt: 5 }, running: "attest" } }) : null) });
  const h = await call(stagesHeld.env, { op: "acquire", token: stagesHeld.S.ann, method: "POST", hooks: slow, body: { locator: "https://www.example.gov/BUDGET.pdf" } });
  assert.equal(h.json.kept, "held");
  assert.equal(asked(stagesHeld.env, "heldat").length, 0, "the stages sufficed");
});

/* ---- BOB's CHANGEs B41, B42 (K4577, K4578): the delivery's record, the failed read, `more`, the 16, the batches ---- */

test("R123 (G4; EXTRACTION #34): an upload whose read failed or went silent after the upload stood is `reading_pending` with the failed call's `diag`, its row written once, the upload standing", async () => {
  const landed = { ok: true, existed: false, capture: { sha256: SHA, bytes: MB }, document: docOf({ bytes: MB, type: "text/plain" }) };
  const w = world({ answer: (c) => (c.route === "captureupload" ? ok(landed) : c.route === "extractread" ? new Response("<html>boom</html>", { status: 500 }) : null) });
  const r = await upload(w);
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.result.reading_pending, true, "never a 502 for a kept upload");
  assert.ok(r.json.result.diag !== undefined, "the failed call travels in `diag`");
  assert.equal(r.json.result.document.capture.sha256, SHA);
  assert.equal(asked(w.env, "pendingadd").length, 1);
});

test("R123 (G14): a reading that answers `more` is continued by the ledger on every door path: promote, a held upload, an acquire; one that does not is left", async () => {
  const sha = "e".repeat(64);
  const files = [{ path: "data/provenance.json", text: JSON.stringify({ documents: [{ locator: "https://x.example/a.docx", capture: { sha256: sha, bytes: MB } }] }) }];
  const promote = (more) => { const w = world({ answer: (c) => (c.route === "promote" ? ok({ ok: true, bundle_id: "INFO-1" }) : c.route === "readheldfor" ? ok({ ok: true, read: true, found: true, ...(more ? { more: true } : {}) }) : null) });
    return call(w.env, { op: "promote", token: w.S.ann, method: "POST", body: { files } }).then((r) => ({ r, w })); };
  const m = await promote(true);
  assert.equal(m.r.json.result.reading_pending, true);
  assert.deepEqual(asked(m.w.env, "pendingadd").map((c) => c.params.sha), [sha]);
  const n = await promote(false);
  assert.equal(n.r.json.result.reading_pending, undefined);
  assert.equal(asked(n.w.env, "pendingadd").length, 1, "R130: the row first; no reading_pending once the reading is made");
  /* a held upload whose reading answers more */
  const landed = { ok: true, existed: true, capture: { sha256: SHA, bytes: 9 }, receipt: { address: `upload:${SHA}` } };
  const u = world({ answer: storeFor(landed, { held: () => ({ ok: true, read: true, found: true, more: true }) }) });
  const ur = await upload(u);
  assert.equal(ur.json.result.reading_pending, true);
  assert.equal(asked(u.env, "pendingadd").length, 1);
  /* an acquire whose own reading answers more */
  const doc = { ...docOf({ bytes: MB, type: "text/html", locator: "https://x.example/p.html" }), reading: { found: true, more: true }, text_units: [] };
  const hooks = { ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "acquire" ? M.json({ ok: true, existed: false, document: doc }) : undefined; } };
  const a = world();
  const ar = await call(a.env, { op: "acquire", token: a.S.ann, method: "POST", hooks, body: { locator: "https://x.example/p.html" } });
  assert.equal(ar.json.reading_pending, true);
  assert.equal(asked(a.env, "pendingadd").length, 1);
});

test("R123 (G18): a promotion of 20 documents follows the first 16 and OWES the other 4: every document has its read or its row, none is dropped", async () => {
  const shas = Array.from({ length: 20 }, (_, i) => i.toString(16).padStart(2, "0").repeat(32));
  const files = [{ path: "data/provenance.json", text: JSON.stringify({ documents: shas.map((s) => ({ locator: `https://x.example/${s.slice(0, 4)}`, capture: { sha256: s, bytes: 9 } })) }) }];
  const w = world({ answer: (c) => (c.route === "promote" ? ok({ ok: true, bundle_id: "INFO-1" }) : c.route === "readheldfor" ? ok({ ok: true, read: true, found: true }) : null) });
  const r = await call(w.env, { op: "promote", token: w.S.ann, method: "POST", body: { files } });
  assert.equal(r.status, 200, r.text);
  assert.equal(asked(w.env, "readheldfor").length, 16, "the first 16 are followed here");
  assert.deepEqual(asked(w.env, "pendingadd").map((c) => c.params.sha), shas, "R130: every document's row is registered before any read; the last 4 are not read here and stay owed");
  assert.equal(r.json.result.reading_pending, true);
  /* control: 16 documents owe nothing */
  const f16 = [{ path: "data/provenance.json", text: JSON.stringify({ documents: shas.slice(0, 16).map((s) => ({ locator: `https://x.example/${s.slice(0, 4)}`, capture: { sha256: s, bytes: 9 } })) }) }];
  const c = world({ answer: (q) => (q.route === "promote" ? ok({ ok: true, bundle_id: "INFO-1" }) : q.route === "readheldfor" ? ok({ ok: true, read: true, found: true }) : null) });
  const cr = await call(c.env, { op: "promote", token: c.S.ann, method: "POST", body: { files: f16 } });
  assert.equal(cr.json.result.reading_pending, undefined);
  assert.equal(asked(c.env, "pendingadd").length, 16, "R130: each followed document has its row first");
});

test("R123 (G2): the delivery of a finished fetch records `fetch_done` through capture; a render's delivery records none (see r124-owed-render)", async () => {
  /* driven in r124-owed-render.test.mjs over a real record; here the contract's shape: the door exports the delivery */
  assert.equal(typeof M.deliverOwedRender, "function");
});

test("R20 (G12c): a batch of review copies is a read answer: each copy is stamped as the single read stamps it, its in-band quartet over the copy as served; a body list of `drafts` and `projects` reaches the store as the comma list", async () => {
  const copy = (id) => ({ ok: true, draft: id, project: "P-1", required_strength: 2, updated_by: "member:ann", last_change: { at: "2026-10-22T00:00:00Z", by: "member:ann" }, text: `copy ${id}` });
  const batch = { ok: true, kind: "review-copies", count: 2, copies: [copy("D-1"), copy("D-2")] };
  const w = world({ answer: (c) => (c.route === "reviewcopy" ? ok(batch) : c.route === "casedrafts" ? ok({ ok: true, kind: "review-drafts-batch", count: 1, lists: [] }) : null) });
  const r = await call(w.env, { op: "reviewcopy", token: w.S.ann, method: "POST", body: { drafts: ["D-1", "D-2"] } });
  assert.equal(r.status, 200, r.text);
  assert.equal(asked(w.env, "reviewcopy")[0].params.drafts, "D-1,D-2");
  assert.equal(r.json.kind, "review-copies");
  for (const c of r.json.copies) {
    assert.ok(c.inband && c.inband.hash, `copy ${c.draft} carries its in-band quartet`);
    assert.equal(c.required_strength, undefined, "the floor is read into the quartet, not served twice");
  }
  const single = await call(world({ answer: (c) => (c.route === "reviewcopy" ? ok(copy("D-1")) : null) }).env, { op: "reviewcopy", token: "x" });
  assert.notEqual(single.status, 500);
  const d = await call(w.env, { op: "casedrafts", token: w.S.ann, method: "POST", body: { projects: ["P-1", "P-2"] } });
  assert.equal(d.status, 200, d.text);
  assert.equal(asked(w.env, "casedrafts")[0].params.projects, "P-1,P-2");
  assert.equal(d.json.kind, "review-drafts-batch");
});
