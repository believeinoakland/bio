/* extraction, T50-9 at the module's interface: N1082 (R72, the door's `trace` and `memberRef` reach the registered
   transcriber's `transcription(...)` only as non-empty strings, from the control plane's stamps and never from a body)
   and N1066 (R71's test hygiene: a relayed refusal answered with its own whole-number status from 400 to 499, else 403;
   the paying account's key found in no answer, store row, history row, listener payload or error on any path; a
   `deployable()` answering anything but exactly `true` refused 501 beside one answering `true`), each with a negative
   control (K874). Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, withEntry, i2, noText, pageUnits, payingAccount } from "./fixture.mjs";
import { noAccount, keptAwayGroup } from "../ai-accounts/fixtures.mjs";
import { extractionOps } from "../../../src/extraction/index.mjs";
import { WORD } from "./words.mjs";
import { pageTranscribeOp } from "../../../src/extraction/ops.mjs";

const SENTINEL = "sk-ant-SENTINEL-KEY-5050";
const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
/* ai-accounts' real answers (its published fixtures, K5044) for a member with no account and for a group keeping its material away */
const NO_ACCOUNT = await noAccount();
/* ai-use is after this module, so its `useCheck` refusal is a contract (ai-use's test runs this shape against its real code) */
// fixtures-contract: ai-use use-check
const CEILING = { ok: false, code: "AI_LIMIT_REACHED", check: "C-143.1",
  translation: WORD("ai.refused.limit").replace("{whose}", WORD("ai.whose.own")).replace("{period}", WORD("ai.period.day")).replace("{use}", WORD("ai.use.transcribe.inline")).replace("{when}", WORD("ai.when.day")),
  detail: "member:ann's day limit (transcribe, in calls) is reached for the period from 2026-10-09. Nothing was started." };
const KEPT_GROUP = (await keptAwayGroup({ use: "transcribe" })).aiKeptAway;
const pdfEntry = (text, pages) => ({ format: "pdf",
  detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => ({ ok: true, text: structuredClone(text), pages, notes: [] }) });
const SCAN = i2([{ page: 0, text: "Minutes of the meeting" }, { page: 1, text: "", undetermined: [noText(1)] },
                 { page: 2, text: "", undetermined: [noText(2)] }]);
const ALL_READ = i2([{ page: 0, text: "all text" }, { page: 1, text: "also text" }, { page: 2, text: "more text" }]);
const filled = (pages) => ({ ok: true, engine: "claude-test", version: "1", pages: pages.map((p) => ({ page: p, text: `AI text of page ${p}` })) });
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`), w.rows(`SELECT * FROM reading_history`)]);
const stored = (w) => JSON.stringify(["readings", "reading_history", "capture_text", "reading_text_source", "composed_readings"]
  .map((t) => w.rows(`SELECT * FROM ${t}`)));

/* The composition root's transcriber (plane R36's shape): `account` is what the account service answers, `limit` what
   the limit check answers, `away` what the keep-away check answers, `answer` what the AI path answers; every
   `transcription(...)` argument is recorded whole. */
function transcriber({ deployable = true, account = null, limit = null, away = null, answer = filled } = {}) {
  const calls = { transcription: [], transcribe: [] };
  const t = {
    deployable: typeof deployable === "function" ? deployable : () => deployable,
    keptAway: () => away,
    transcription: (arg) => { calls.transcription.push(arg);
      return { member: arg.member, project: arg.project, at: arg.at, act: `transcribe:t50:${arg.at}`,
        accounts: { accountFor: payingAccount({ key: SENTINEL, answer: account }) }, useCheck: async () => limit,
        transcribe: async (q) => { calls.transcribe.push(q); return typeof answer === "function" ? answer(q.pages, q) : answer; } }; },
  };
  return { t, calls };
}

/* A three-page scan stored in B-1 and read once, its transcriber registered; `run()` transcribes it. */
async function heldScan(opts = {}, { text = SCAN } = {}) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: { content_type: "generic", reader_version: 1, found: false,
    entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 3 }, textUnits: pageUnits(text) });
  const tr = transcriber(opts);
  w.x.registerTranscriber("plane", tr.t);
  const payloads = [];
  w.x.onReading("content", (p) => { payloads.push(JSON.stringify(p)); return { staled: 0 }; });
  return { w, d, tr, payloads, run: (extra = {}) => withEntry(pdfEntry(text, 3), () => w.x.pageTranscribe({ captureSha: d, ...member1, ...extra })) };
}

/* ---- R71: the status a relayed refusal is answered with ---- */

/* agent-worker's real answer when the AI declines every page (its fixtures-run `transcribe-declined`: 502 MODEL_REFUSED, the provider's type and status beside it) */
const DECLINED = { ok: false, reason: "MODEL_REFUSED", code: "MODEL_REFUSED", detail: "d", worker: "agent-worker", status: 502, ending: "refused",
  model_error: "overloaded_error", model_status: 529 };
const refusalOf = (code, extra = {}) => ({ ok: false, reason: code, code, check: "C-9.9", translation: `words of ${code}`, ...extra });
/* The four places a refusal can come from, each given the refusal: the paying account, a limit, the keep-away check,
   and agent-worker after the post. */
const WAYS = {
  account: (r) => ({ account: r }),
  limit: (r) => ({ limit: r }),
  keptAway: (r) => ({ away: r }),
  worker: (r) => ({ answer: r }),
};

test("R71 (T50; N1066): a refusal relayed from the account, a limit, the keep-away check or agent-worker is answered with its own status when that is a whole number from 400 to 499, so 429 is 429 and 499 is 499, whichever way it came; nothing written", async () => {
  for (const [way, opts] of Object.entries(WAYS))
    for (const status of [400, 404, 429, 499]) {
      const { w, run } = await heldScan(opts(refusalOf("SOME_REFUSAL", { status })));
      const before = writes(w);
      const r = await run();
      assert.equal(r.status, status, `${way}: its own ${status}`);
      assert.deepEqual([r.body.ok, r.body.code, r.body.status], [false, "SOME_REFUSAL", status], way);
      assert.equal("transcription" in r.body, false, way);
      assert.equal(writes(w), before, `${way}: nothing written`);
    }
});

test("R71 (T50; N1066; control): a refusal carrying no status, 200, 399, 500, a fraction or a string status is answered 403, whichever way it came", async () => {
  for (const [way, opts] of Object.entries(WAYS))
    for (const status of [undefined, 200, 399, 500, 429.5, "429", null]) {
      const { w, run } = await heldScan(opts(refusalOf("SOME_REFUSAL", status === undefined ? {} : { status })));
      const before = writes(w);
      const r = await run();
      assert.equal(r.status, 403, `${way}: status ${JSON.stringify(status)} is 403`);
      assert.equal(r.body.ok, false);
      assert.equal(writes(w), before, way);
    }
});

/* ---- R71: the paying account's key appears nowhere ---- */

test("R71 (T50; N1066): the paying account's key goes to `transcribe` and nowhere else, on every path: pages filled, none filled, the AI declining, a malformed `transcribe` answer, an account, a limit, a keep-away and an agent-worker refusal, a not-deployed transcriber; found in no answer, stored reading, history row, text row, text-source row, listener payload", async () => {
  const paths = {
    "pages filled": { opts: {}, text: SCAN, sent: true },
    "none filled (nothing left unread)": { opts: {}, text: ALL_READ, sent: false },
    "the AI filled nothing": { opts: { answer: { ok: true, engine: "claude-test", version: "1", pages: [] } }, text: SCAN, sent: true },
    "a limit refusing": { opts: { limit: CEILING }, text: SCAN, sent: false },
    "the AI declining": { opts: { answer: DECLINED }, text: SCAN, sent: true },
    "the worker silent": { opts: { answer: { ok: false, reason: "AGENT_WORKER_SILENT" } }, text: SCAN, sent: true },
    "a malformed transcribe answer (null)": { opts: { answer: null }, text: SCAN, sent: true },
    "a malformed transcribe answer (a string)": { opts: { answer: "sk" }, text: SCAN, sent: true },
    "a malformed transcribe answer (pages not a list)": { opts: { answer: { ok: true, engine: "e", version: "1", pages: "nope" } }, text: SCAN, sent: true },
    "a malformed transcribe answer (a page with no text)": { opts: { answer: { ok: true, engine: "e", version: "1", pages: [{ page: 1 }] } }, text: SCAN, sent: true },
    "the account refusing": { opts: { account: NO_ACCOUNT }, text: SCAN, sent: false },
    "the keep-away check refusing": { opts: { away: KEPT_GROUP }, text: SCAN, sent: false },
    "agent-worker refusing after the post": { opts: { answer: refusalOf("BAD_PAGES", { worker: "agent-worker" }) }, text: SCAN, sent: true },
    "not deployed": { opts: { deployable: false }, text: SCAN, sent: false },
  };
  for (const [name, { opts, text, sent }] of Object.entries(paths)) {
    const { w, tr, payloads, run } = await heldScan(opts, { text });
    let r;
    try { r = await run(); } catch (e) { assert.fail(`${name}: the act threw ${e && e.message}`); }
    assert.doesNotMatch(JSON.stringify(r), /SENTINEL/, `${name}: the answer`);
    assert.doesNotMatch(stored(w), /SENTINEL/, `${name}: the store`);
    assert.doesNotMatch(payloads.join(" "), /SENTINEL/, `${name}: the listeners`);
    assert.equal(tr.calls.transcribe.length > 0, sent, `${name}: ${sent ? "sent" : "not sent"}`);
  }
  /* control: the key reaches `transcribe` (so the searches above are not vacuous) and the sentinel is what is searched for */
  const { tr, run } = await heldScan();
  assert.equal((await run()).body.transcription.written, true);
  assert.equal(tr.calls.transcribe[0].account.key, SENTINEL, "transcribe is handed the key");
  assert.equal(JSON.stringify(tr.calls.transcribe[0].account).includes("SENTINEL"), true);
});

test("R71 R72 (T50; N1066): a `deployable()` answering anything but exactly true is TRANSCRIBE_NOT_DEPLOYED, 501, before any account is read; one answering true beside it is not refused", async () => {
  for (const deployable of [false, () => undefined, null, 0, 1, "true", {}, () => { throw new Error("x"); }]) {
    const { w, tr, run } = await heldScan({ deployable });
    const before = writes(w);
    const r = await run();
    assert.deepEqual([r.status, r.body.reason, r.body.check], [501, "TRANSCRIBE_NOT_DEPLOYED", "C-51.7"], typeof deployable === "function" ? deployable.toString() : String(deployable));
    assert.deepEqual([tr.calls.transcription, tr.calls.transcribe], [[], []], "no account read, nothing sent");
    assert.equal(writes(w), before);
  }
  const ok = await heldScan({ deployable: true });
  const r = await ok.run();
  assert.deepEqual([r.status, r.body.transcription.written], [200, true]);
});

/* ---- R72: the door's trace and memberRef ---- */

const KEYS_NONE = ["at", "member", "project"];
const helpers = { json: (b, s = 200) => ({ b, s }), storeSilent: (op) => ({ silent: op }), storageAbsent: (op) => ({ absent: op }),
                  requiredArgument: (op, arg) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument: arg }) };
const stampsOf = (extra = {}) => ({ ...helpers, cls: "member", session: true, caps: ["contribute"], viewer: "class:admin",
                                    author: "member:m1", storeName: "bio", ...extra });

/* The control plane's half over the object's route: the store stub answers what `extractionOps` answers for the url the
   op built, as the Durable Object does; `asked` collects each url. */
function storeFor(w, asked = []) {
  return { fetch: async (p) => {
    const u = new URL(String(p));
    asked.push(u);
    const result = await extractionOps(w.x, u, null, {})[u.pathname.slice(1)]();
    return new Response(JSON.stringify({ ok: true, result }));
  } };
}
const op = (w, d, store, stamps, query = "") => withEntry(pdfEntry(SCAN, 3),
  () => pageTranscribeOp(new URL(`http://p/?sha256=${d}${query}`), { CAPTURES: { get() {} } }, store, stamps));

test("R72 (T50; N1082): `pageTranscribe` and `pageTranscribeOp` called with the plane's door stamps trace t1 and memberRef m1 reach the registered transcriber's `transcription` with exactly those two strings", async () => {
  /* the Durable Object half, called directly */
  const a = await heldScan();
  assert.equal((await a.run({ trace: "t1", memberRef: "m1" })).body.transcription.written, true);
  assert.deepEqual(a.tr.calls.transcription.map(({ trace, memberRef }) => [trace, memberRef]), [["t1", "m1"]]);
  assert.deepEqual(Object.keys(a.tr.calls.transcription[0]).sort(), ["at", "member", "memberRef", "project", "trace"]);
  assert.equal(a.tr.calls.transcription[0].member, "member:m1", "the stamps beside `by` are unchanged");
  /* the control plane's half, over the object's route */
  const b = await heldScan();
  const asked = [];
  const out = await op(b.w, b.d, storeFor(b.w, asked), stampsOf({ trace: "t1", memberRef: "m1" }));
  assert.equal(out.s, 200);
  assert.equal(out.b.transcription.written, true);
  assert.equal(asked[0].searchParams.get("trace"), "t1");
  assert.equal(asked[0].searchParams.get("memberRef"), "m1");
  assert.deepEqual(b.tr.calls.transcription.map(({ trace, memberRef }) => [trace, memberRef]), [["t1", "m1"]]);
  assert.deepEqual(Object.keys(b.tr.calls.transcription[0]).sort(), ["at", "member", "memberRef", "project", "trace"]);
});

test("R72 (T50; N1082; control): a call with neither reaches `transcription` with neither key; an empty, non-string or one-sided stamp hands on only the strings that are non-empty", async () => {
  const none = await heldScan();
  await none.run();
  assert.deepEqual(Object.keys(none.tr.calls.transcription[0]).sort(), KEYS_NONE);
  const asked = [];
  const viaOp = await heldScan();
  await op(viaOp.w, viaOp.d, storeFor(viaOp.w, asked), stampsOf());
  assert.deepEqual(Object.keys(viaOp.tr.calls.transcription[0]).sort(), KEYS_NONE);
  assert.deepEqual([asked[0].searchParams.has("trace"), asked[0].searchParams.has("memberRef")], [false, false], "the op forwards neither");
  for (const [trace, memberRef, keys] of [["", "", KEYS_NONE], [5, {}, KEYS_NONE], [null, null, KEYS_NONE],
                                           ["t2", "", [...KEYS_NONE, "trace"].sort()], ["", "m2", [...KEYS_NONE, "memberRef"].sort()]]) {
    const x = await heldScan();
    await x.run({ trace, memberRef });
    assert.deepEqual(Object.keys(x.tr.calls.transcription[0]).sort(), keys, JSON.stringify([trace, memberRef]));
    const y = await heldScan();
    const q = [];
    await op(y.w, y.d, storeFor(y.w, q), stampsOf({ trace, memberRef }));
    assert.deepEqual(Object.keys(y.tr.calls.transcription[0]).sort(), keys, `via the op ${JSON.stringify([trace, memberRef])}`);
  }
});

test("R72 (T50; N1082; control): a `trace` or `memberRef` in the url's own query or in the body is not used: only the control plane's stamps are", async () => {
  /* the op builds the object's query from its stamps, never from the caller's url */
  const a = await heldScan();
  const asked = [];
  await op(a.w, a.d, storeFor(a.w, asked), stampsOf(), "&trace=evil&memberRef=evil");
  assert.deepEqual([asked[0].searchParams.has("trace"), asked[0].searchParams.has("memberRef")], [false, false]);
  assert.deepEqual(Object.keys(a.tr.calls.transcription[0]).sort(), KEYS_NONE);
  /* the object's route reads the stamps' query, and a body carrying the names changes nothing */
  const b = await heldScan();
  const route = extractionOps(b.w.x, new URL(`http://x/pagetranscribe?sha256=${b.d}&cls=member&session=1&caps=contribute&viewer=class:admin&author=member:m1&store=bio`),
    { trace: "from-body", memberRef: "from-body", sha256: b.d }, {});
  assert.equal((await withEntry(pdfEntry(SCAN, 3), () => route.pagetranscribe())).body.transcription.written, true);
  assert.deepEqual(Object.keys(b.tr.calls.transcription[0]).sort(), KEYS_NONE);
});

test("R72 (T50; N1082): this module reads, stores and answers neither string: no reading, history row, text row, listener payload or answer of the act holds either, written or refused", async () => {
  const T = "TRACE-ID-7788", M = "MEMBER-REF-9911";
  for (const opts of [{}, { account: NO_ACCOUNT }, { away: KEPT_GROUP }, { answer: DECLINED }]) {
    const { w, d, payloads, run } = await heldScan(opts);
    const r = await run({ trace: T, memberRef: M });
    assert.doesNotMatch(JSON.stringify(r), /TRACE-ID-7788|MEMBER-REF-9911/, "the answer");
    assert.doesNotMatch(stored(w), /TRACE-ID-7788|MEMBER-REF-9911/, "the store");
    assert.doesNotMatch(payloads.join(" "), /TRACE-ID-7788|MEMBER-REF-9911/, "the listeners");
    assert.doesNotMatch(JSON.stringify(w.x.readingFor(d, "class:admin")), /TRACE-ID-7788|MEMBER-REF-9911/);
  }
  const { w, d, run } = await heldScan();
  assert.equal((await run({ trace: T, memberRef: M })).body.transcription.written, true);
  assert.doesNotMatch(JSON.stringify(w.x.readingFor(d, "class:admin")), /TRACE-ID-7788|MEMBER-REF-9911/, "op=reading");
  assert.doesNotMatch(stored(w), /TRACE-ID-7788|MEMBER-REF-9911/);
});
