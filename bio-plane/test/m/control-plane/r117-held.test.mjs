/* control-plane R117 (fix round 3, C5, C17; K4356, K4358; extraction R80, acquisition R96; amends R100): A HELD CAPTURE GETS ITS READING.
   Part one drives the door against a recording store: after `op=acquire` or `op=captureupload` answers `existed: true`, the store-internal
   `readheldfor` route (extraction's `readHeld`) is asked for the capture's digest; an upload answered `existed: true` WITH its document, for
   a digest `readHeld` says has no home (`NO_HOME`), is read by the door as a new upload is and answers the reading with the document; every
   other answer is relayed as it was, and a refusal of `readHeld` never turns a kept capture into a failed one. Controls throughout (K874).
   Part two, over Miniflare and the real plane, is R117's own test (the plane hands the door's map the getter `of.extraction`). */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { M, world, call, opCalls, defaultHooks } from "./harness.mjs";
import { controlPlaneOwnerOps } from "../../../src/control-plane/owner-ops.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const SHA = "c".repeat(64);
const ok = (result) => new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "content-type": "application/json" } });
const bare = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const doc = () => ({ file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, retrieved: "2026-10-21T00:00:00Z", profile: {},
                     capture: { sha256: SHA, bytes: 9, method: "uploaded" } });
const READ = { reading: { found: true, entities: 0 }, text_units: [{ extent: { kind: "document" }, text: "line one\nline two" }] };
const asked = (env, route) => opCalls(env).filter((c) => c.route === route);
/* the plane's part of `acquire`: the hook answers what the object filed (acquire's answer is top-level, as acquisition answers it) */
/* the door's bound is set far past this process's wall time: the file's real plane (part two) boots in this process while part one runs, which can hold the first request for
   17 s, and the clock arm of "will not fit" (R120) must not decide a case about `readHeld` (fix round 6: the cause of this suite's old intermittent red) */
const NO_CLOCK = 60 * 60 * 1000;
const acquiring = (answer) => ({ ...defaultHooks(), acquireBoundMs: NO_CLOCK, async gatedOp(ctx) { return ctx.op === "acquire" ? M.json(answer) : undefined; } });

test("R117 (the door's map): `readheldfor` is extraction's `readHeld` over the digest and the namespace the door names, and is a route of the door's own map only when the plane hands the getter (negative control: no getter, no route, nothing else of the map changes)", async () => {
  const seen = [];
  const of = { extraction: () => ({ readHeld: (a) => { seen.push(a); return { ok: true, read: false, why: "NO_HOME" }; } }) };
  const url = new URL(`http://do/readheldfor?sha=${SHA}&store=scratch`);
  const arm = controlPlaneOwnerOps(of, url, null).readheldfor;
  assert.deepEqual(await arm(), { ok: true, read: false, why: "NO_HOME" });
  assert.deepEqual(seen, [{ sha: SHA, storeName: "scratch" }]);
  const bio = controlPlaneOwnerOps(of, new URL(`http://do/readheldfor?sha=${SHA}`), null).readheldfor;
  await bio();
  assert.equal(seen[1].storeName, "bio", "the namespace defaults to bio");
  assert.equal("readheldfor" in controlPlaneOwnerOps({}, url, null), false);
  /* it is store-internal: no spec, so no caller reaches it (R2) and nothing is asked of the store */
  const w = world();
  for (const token of [w.env.ADMIN_TOKEN, w.S.ann, w.S.founder]) {
    const r = await call(w.env, { op: "readheldfor", token, params: { sha: SHA } });
    assert.equal(r.status, 400, r.text.slice(0, 200));
    assert.equal(r.json.reason, "UNKNOWN_OP");
  }
  assert.equal(asked(w.env, "readheldfor").length, 0);
  assert.equal("captureupload" in controlPlaneOwnerOps({}, url, null), true);
});

test("R117 (acquire): an `acquire` answered `existed: true` with a document asks `readHeld` for its digest, once, and the answer is relayed as it was; `existed: false`, a refusal and a continuation (no digest) ask none (negative controls: the question is asked of the digest the answer names, in the namespace it landed in)", async () => {
  const held = { ok: true, existed: true, document: doc(), note: "n" };
  const w = world({ answer: (c) => (c.route === "readheldfor" ? ok({ ok: true, read: true, bundle_id: "INFO-1", found: true }) : null) });
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: acquiring(held), body: { locator: "https://example.org/a" } });
  assert.equal(r.status, 200, r.text);
  assert.deepEqual([r.json.ok, r.json.existed, r.json.document.capture.sha256, r.json.note], [true, true, SHA, "n"], "the answer is relayed as it was");
  const [q] = asked(w.env, "readheldfor");
  assert.equal(asked(w.env, "readheldfor").length, 1);
  assert.deepEqual([q.params.sha, q.params.store], [SHA, "bio"]);
  for (const [label, answer] of [["new", { ok: true, existed: false, document: doc() }],
                                 ["refused", { ok: false, reason: "BAD_FOR", status: 400 }],
                                 ["continuation", { ok: true, existed: true, continued: { session: "s" } }]]) {
    const c = world({ answer: (x) => (x.route === "readheldfor" ? ok({ ok: true, read: true }) : null) });
    const o = await call(c.env, { op: "acquire", token: c.S.ann, method: "POST", hooks: acquiring(answer), body: { locator: "https://example.org/a" } });
    assert.equal(o.status, 200, label);
    assert.equal(asked(c.env, "readheldfor").length, 0, `${label}: not asked`);
  }
});

test("R117 (C5b, a capture of several parts): an `acquire` answered `existed: null` (the register names no row for the whole) with a document of parts asks `readHeld` for its digest, once, and relays the answer as it was; a single part answered `existed: false` and a continuation ask none", async () => {
  const parted = { ok: true, existed: null, existed_undetermined: "captured in 5 parts", document: { ...doc(), parts: [{ sha256: "e".repeat(64), bytes: 8 }, { sha256: "f".repeat(64), bytes: 1 }] }, parts: 2, note: "n" };
  const w = world({ answer: (c) => (c.route === "readheldfor" ? ok({ ok: true, read: true, bundle_id: "INFO-1", found: true }) : null) });
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: acquiring(parted), body: { locator: "https://example.org/a" } });
  assert.equal(r.status, 200, r.text);
  assert.deepEqual([r.json.ok, r.json.existed, r.json.note, r.json.parts], [true, null, "n", 2], "the answer is relayed as it was");
  assert.equal(asked(w.env, "readheldfor").length, 1);
  assert.equal(asked(w.env, "readheldfor")[0].params.sha, SHA);
  for (const [label, answer] of [["one part, new", { ok: true, existed: false, document: doc() }], ["one part, undetermined without parts", { ok: true, existed: null, document: doc() }]]) {
    const c = world({ answer: (x) => (x.route === "readheldfor" ? ok({ ok: true, read: true }) : null) });
    await call(c.env, { op: "acquire", token: c.S.ann, method: "POST", hooks: acquiring(answer), body: { locator: "https://example.org/a" } });
    assert.equal(asked(c.env, "readheldfor").length, 0, `${label}: not asked`);
  }
});

test("R117 (acquire, controls): a refusal or a silence of `readHeld`, and a throw, leave the kept capture's answer exactly as it was (a kept capture never becomes a failed one)", async () => {
  const held = { ok: true, existed: true, document: doc(), note: "n" };
  for (const [label, answer] of [["refused", () => bare({ ok: false, reason: "UNKNOWN_ROUTE" }, 404)], ["silent", () => new Response("<html>boom</html>", { status: 500 })],
                                 ["not ok", () => ok({ ok: false, reason: "NO" })], ["throws", () => { throw new Error("x"); }]]) {
    const w = world({ answer: (c) => (c.route === "readheldfor" ? answer() : null) });
    const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: acquiring(held), body: { locator: "https://example.org/a" } });
    assert.equal(r.status, 200, `${label}: ${r.text.slice(0, 200)}`);
    assert.deepEqual([r.json.ok, r.json.existed, r.json.document.capture.sha256], [true, true, SHA], label);
    assert.equal(asked(w.env, "readheldfor").length, 1, label);
  }
});

const upload = (w, params = { statement: "s", name: "a.txt" }) =>
  call(w.env, { op: "captureupload", token: w.S.ann, method: "POST", params, body: "line one\nline two", hooks: { ...defaultHooks(), acquireBoundMs: NO_CLOCK } });

test("R117 (a registered home): a second upload of bytes the record holds under a home answers `existed: true` with no document; `readHeld` is asked for the digest its `capture` names, and the answer is relayed as it was (the reading is the store's to write, not the answer's); a reading already held (`READING_HELD`) changes nothing and nothing is read by the door", async () => {
  const landed = { ok: true, existed: true, capture: { sha256: SHA, bytes: 9 }, receipt: { address: `upload:${SHA}` } };
  for (const held of [{ ok: true, read: true, bundle_id: "INFO-42", found: true }, { ok: true, read: false, why: "READING_HELD" },
                      { ok: true, read: false, why: "NO_WHOLE_OBJECT" }]) {
    const w = world({ answer: (c) => (c.route === "captureupload" ? ok(landed) : c.route === "readheldfor" ? ok(held) : null) });
    const r = await upload(w);
    assert.equal(r.status, 200, r.text);
    /* R123: where the whole is not held yet the reading is owed (written down, `reading_pending`); every other answer is relayed as it was */
    const owed = held.why === "NO_WHOLE_OBJECT";
    assert.deepEqual(r.json.result, owed ? { ...landed, reading_pending: true } : landed, `${JSON.stringify(held)}: relayed as it was`);
    /* R130 (amends R123): the door registers the `reading` row of bytes it answers `existed: true` BEFORE `readHeld` is asked, whether or not the reading is then made
       (the registrar's row is keyed by the digest, so a second write for an owed reading names the same row): the row is always for this digest and kind, once when
       nothing is owed, and the answer says `reading_pending` exactly when the whole was missing */
    const rows = asked(w.env, "pendingadd");
    assert.ok(rows.length >= 1 && rows.every((x) => x.params.sha === SHA && x.params.kind === "reading"), `${JSON.stringify(held)}: the row is registered for the digest`);
    if (!owed) assert.equal(rows.length, 1, `${JSON.stringify(held)}: nothing owed, one registration`);
    assert.equal(r.json.result.reading_pending === true, owed, `${JSON.stringify(held)}: reading_pending exactly when owed`);
    assert.equal(asked(w.env, "readheldfor").length, 1);
    assert.equal(asked(w.env, "readheldfor")[0].params.sha, SHA);
    assert.equal(asked(w.env, "extractread").length, 0, "the door reads nothing: there is no document");
  }
});

test("R117 (bytes held with no home): an upload answered `existed: true` WITH its document, for a digest `readHeld` says has no home, is read by the door as a new upload is — the store is asked `extractread` over the document — and the answer carries `reading` and `text_units` on the document, the rest unchanged, so the promotion the screen sends keeps it; with a home and no reading it is read through `readHeld` alone; one whose reading is held is relayed as before", async () => {
  const landed = () => ({ ok: true, existed: true, capture: { sha256: SHA, bytes: 9 }, receipt: { address: `upload:${SHA}` }, document: doc() });
  const route = (held) => (c) => (c.route === "captureupload" ? ok(landed()) : c.route === "readheldfor" ? ok(held) : c.route === "extractread" ? ok(READ) : null);
  /* no home: read by the door */
  const w = world({ answer: route({ ok: true, read: false, why: "NO_HOME" }) });
  const r = await upload(w);
  assert.equal(r.status, 200, r.text);
  const [e] = asked(w.env, "extractread");
  assert.ok(e, "the store was asked to read");
  assert.equal(e.body.document.capture.sha256, SHA);
  assert.deepEqual(r.json.result.document.reading, READ.reading);
  assert.deepEqual(r.json.result.document.text_units, READ.text_units);
  assert.deepEqual([r.json.result.ok, r.json.result.existed, r.json.result.capture.sha256, r.json.result.receipt.address],
                   [true, true, SHA, `upload:${SHA}`]);
  /* a home with no reading: readHeld writes it; the door reads nothing and relays */
  const h = world({ answer: route({ ok: true, read: true, bundle_id: "INFO-42", found: true }) });
  const hr = await upload(h);
  assert.equal(asked(h.env, "extractread").length, 0);
  assert.deepEqual(hr.json.result, landed());
  /* controls: a reading held, no whole object, a refusal and a silence of readHeld leave the answer unread */
  for (const [label, held] of [["held", ok({ ok: true, read: false, why: "READING_HELD" })], ["no whole object", ok({ ok: true, read: false, why: "NO_WHOLE_OBJECT" })],
                               ["refused", bare({ ok: false, reason: "UNKNOWN_ROUTE" }, 404)], ["silent", new Response("x", { status: 500 })]]) {
    const c = world({ answer: (x) => (x.route === "captureupload" ? ok(landed()) : x.route === "readheldfor" ? held.clone() : x.route === "extractread" ? ok(READ) : null) });
    const u = await upload(c);
    assert.equal(u.status, 200, label);
    /* R123: no whole object yet means the reading is owed and said so; the document is still answered unread */
    assert.deepEqual(u.json.result, label === "no whole object" ? { ...landed(), reading_pending: true } : landed(), label);
    assert.equal(asked(c.env, "extractread").length, 0, `${label}: not read`);
  }
  /* control: a document that already carries its reading is not read again */
  const d = { ...landed(), document: { ...doc(), reading: { found: true } } };
  const k = world({ answer: (x) => (x.route === "captureupload" ? ok(d) : x.route === "readheldfor" ? ok({ ok: true, read: false, why: "NO_HOME" }) : x.route === "extractread" ? ok(READ) : null) });
  assert.deepEqual((await upload(k)).json.result, d);
  assert.equal(asked(k.env, "extractread").length, 0);
});

test("R117 (a failed read): the door's read of an `existed: true` upload with no home that fails is answered as the failed reading, as R100 answers one for a new upload — never an unread document the screen could promote; the upload stands (negative control: a new upload's failed reading is answered the same way)", async () => {
  const landed = (existed) => ({ ok: true, existed, capture: { sha256: SHA, bytes: 9 }, receipt: { address: `upload:${SHA}` }, document: doc() });
  for (const existed of [true, false]) {
    const w = world({ answer: (c) => (c.route === "captureupload" ? ok(landed(existed)) : c.route === "readheldfor" ? ok({ ok: true, read: false, why: "NO_HOME" })
      : c.route === "extractread" ? bare({ ok: false, reason: "READ_FAILED", error: "the reading failed" }, 400) : null) });
    const r = await upload(w, { statement: "s", type: "text/plain" });
    assert.notEqual(r.status, 200, `existed ${existed}: the failed reading is the answer`);
    assert.equal(r.json.ok === true && r.json.result?.ok === true, false);
    assert.equal(asked(w.env, "captureupload").length, 1, "the upload was filed once and stands");
  }
});

test("R117 (controls; R100): a new upload (`existed: false`) is read as R100 reads it and `readHeld` is not asked; a refusal is relayed unread and asks none", async () => {
  const w = world({ answer: (c) => (c.route === "captureupload" ? ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 }, document: doc() })
    : c.route === "extractread" ? ok(READ) : c.route === "readheldfor" ? ok({ ok: true, read: true }) : null) });
  const r = await upload(w);
  assert.deepEqual(r.json.result.document.reading, READ.reading);
  assert.equal(asked(w.env, "readheldfor").length, 0);
  const f = world({ answer: (c) => (c.route === "captureupload" ? ok({ ok: false, reason: "EMPTY", status: 400 }) : c.route === "readheldfor" ? ok({ ok: true, read: true }) : null) });
  assert.deepEqual((await upload(f)).json.result, { ok: false, reason: "EMPTY", status: 400 });
  assert.equal(asked(f.env, "readheldfor").length, 0);
  assert.equal(asked(f.env, "extractread").length, 0);
});

/* ---- part two: the real plane ---- */
const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r117-0123456789abcdef", PASSWORD = "the founder's long password";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r117-0123456789abcdef", PROBE_TOKEN: "prb-r117-0123456789abcdef",
              VERSION: "4.6.0", INSTANCE_NAME: "r117-town" },
});
after(() => mf.dispose());
const ORIGIN = "https://group.example";
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

async function founder() {
  const claimed = await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  await claimed.arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => {
    const u = new URLSearchParams({ op, ...query });
    return (await plane(`/api/?${u}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
                                        ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json();
  } });

test("R117 (through the door, the real plane): a digest filed under a home that holds no reading for it is uploaded again (`existed: true`) and `op=reading` by the digest then answers `found: true` with its units (C5); bytes held with no home and no reading, uploaded again and answered `existed: true`, carry their reading, and after the screen promotes the document `op=reading` answers `found: true` (C17) (controls: a digest that already has a reading is not read again; a new upload is read as R100 reads it)", async () => {
  const auth = await founder();
  const up = async (bytes, statement) => (await (await plane(`/api/?op=captureupload&statement=${statement}&name=notes.txt&type=text%2Fplain`,
    { method: "POST", headers: auth, body: bytes })).json()).result;
  const readingOf = async (sha) => (await (await plane(`/api/?op=reading&sha256=${sha}`, { headers: auth })).json()).result;
  const cs = screenCall(auth);
  const now = Date.now();
  /* C5: a home with no reading. The first upload is read at the door; its document is promoted WITHOUT the reading, as a record that
     was filed before bytes were held whole is, so the register names a home and the readings table holds nothing for the digest */
  const a = Buffer.from(`a home with no reading ${now}\nline two of the home\n`);
  const shaA = createHash("sha256").update(a).digest("hex");
  const first = await up(a, "first");
  assert.equal(first.existed, false);
  assert.ok(first.document.reading, "a new upload is read as R100 reads it");
  const { reading: _r, text_units: _t, ...bare } = first.document;
  /* R123: a document promoted without its reading is read by the door at the promotion, so a home with no reading is no longer what the
     screen's promotion leaves (the door-level suite above drives `readHeld` for a home that holds none: records filed before this fix) */
  const made = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: bare, title: "notes.txt", locator: bare.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made));
  const now1 = await readingOf(shaA);
  assert.equal(now1.found, true, "the door read the document at the promotion: " + JSON.stringify(now1).slice(0, 300));
  assert.ok(JSON.stringify(now1.text_units).includes("a home with no reading"), "its units are the file's lines");
  const again = await up(a, "again");
  assert.equal(again.existed, true);
  /* control: a reading already held is left as it is (the same reading, not read again) */
  const held = JSON.stringify(now1.reading);
  assert.equal((await up(a, "third")).existed, true);
  assert.equal(JSON.stringify((await readingOf(shaA)).reading), held, "a held reading is not replaced");
  /* C17: bytes held with no home. The first upload is never promoted, so its reading was never kept */
  const b = Buffer.from(`bytes held with no home ${now}\nline two of the photo\n`);
  const shaB = createHash("sha256").update(b).digest("hex");
  assert.equal((await up(b, "lost")).existed, false);
  assert.equal((await readingOf(shaB)).found, false, "nothing was kept: no home, no reading");
  const second = await up(b, "found-again");
  assert.equal(second.existed, true);
  assert.ok(second.document, "an interrupted upload's second answer carries the document to file");
  assert.ok(second.document.reading, "the door read it: " + JSON.stringify(second.document).slice(0, 300));
  assert.ok(JSON.stringify(second.document.text_units).includes("bytes held with no home"));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: second.document, title: "notes.txt", locator: second.document.locator, project: "" });
  assert.equal(filed.refused, undefined, JSON.stringify(filed));
  const kept = await readingOf(shaB);
  assert.equal(kept.found, true, JSON.stringify(kept).slice(0, 300));
  assert.ok(JSON.stringify(kept.text_units).includes("line two of the photo"));
});
