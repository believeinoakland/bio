/* extraction, T48-18 at the module's interface (N996 §5; K3101, K3195): R72's transcriber hands the paying account's
   service as `accounts` (`ai-accounts.accountFor`, its R7, R11), as `reading-pipeline` R31 names it, and this module
   passes the transcriber's answer to `tier4Extend` as given; through T48 a `transcription` handing `credentials` in its
   place is still read. Each refusal has its control (K874). `ai-accounts` sits in no `uses` of this module (its account
   service arrives only through R72's registration), so its answers are taken from its published fixtures (K5044), never
   hand-built here (R7, R11, R25: `NO_ACCOUNT`, row C-29.20). Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, withEntry, i2, noText, pageUnits, payingAccount } from "./fixture.mjs";
import { WORD } from "./words.mjs";
import { accountForResult, noAccount, keptAwayGroup, keptAwayProject, keptAwayUnreadable } from "../ai-accounts/fixtures.mjs";

const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
/* ai-accounts' real answers (its published fixtures, K5044): a member with no account, and one whose own key is served */
const NO_ACCOUNT = await noAccount();
const ACCOUNT = await accountForResult({ key: "k" });

/* The composition root's transcriber (plane R36's shape), deployable, handing each account service named in `services`
   (`accounts`, `credentials` or both), each recording what it was asked. */
function transcriber(services, { away = null } = {}) {
  const calls = { accounts: [], credentials: [], transcribe: [], keptAway: [] };
  const service = (name) => ({ accountFor: payingAccount({ record: calls[name], answer: services[name] }) });
  const t = {
    deployable: () => true,
    keptAway: (q) => { calls.keptAway.push(q); return away; },
    transcription: ({ member, project, at }) => ({ member, project, at, act: `transcribe:t48:${at}`,
      ...Object.fromEntries(Object.keys(services).map((name) => [name, service(name)])),
      useCheck: async () => null,
      // fixtures-contract: content transcribe-answer
      transcribe: async (q) => { calls.transcribe.push(q);
        return { ok: true, engine: "claude-test", version: "2026-01", pages: q.pages.map((p) => ({ page: p, text: `AI text of page ${p}` })) }; } }),
  };
  return { t, calls };
}
const pdf = (text) => ({ format: "pdf",
  detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => ({ ok: true, text: structuredClone(text), pages: 3, notes: [] }) });
const SCAN = i2([{ page: 0, text: "Minutes of the meeting" }, { page: 1, text: "", undetermined: [noText(1)] },
                 { page: 2, text: "", undetermined: [noText(2)] }]);
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`),
                                      w.rows(`SELECT * FROM reading_history`), w.rows(`SELECT * FROM reading_text_source`)]);

/* A store holding a three-page scan's reading, with `services` registered as its transcriber; `run()` transcribes. */
async function heldScan(services, opts = {}) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: { content_type: "generic", reader_version: 1, found: false,
    entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 3 }, textUnits: pageUnits(SCAN) });
  const tr = transcriber(services, opts);
  w.x.registerTranscriber("plane", tr.t);
  return { w, d, tr, run: () => withEntry(pdf(SCAN), () => w.x.pageTranscribe({ captureSha: d, ...member1 })) };
}
const ASKED = { member: "member:m1", act: { kind: "transcribe", member: "member:m1" } };

test("R72 R71 (T48, N996): a transcriber whose `accounts` refuses NO_ACCOUNT makes op=pagetranscribe answer that refusal as given, nothing sent or written; control: one whose `accounts` answers an account fills the asked pages", async () => {
  const { w, d, tr, run } = await heldScan({ accounts: NO_ACCOUNT });
  const before = writes(w);
  const r = await run();
  assert.equal(r.status, 403, "the door's status for a refusal that states none");
  assert.deepEqual([r.body.ok, r.body.reason, r.body.code, r.body.check, r.body.translation, r.body.detail],
                   [false, "NO_ACCOUNT", "NO_ACCOUNT", "C-29.20", NO_ACCOUNT.translation, NO_ACCOUNT.detail]);
  assert.equal(r.body.says, WORD("transcribe.refused").replace("{reason}", NO_ACCOUNT.translation));
  assert.equal(r.body.transcription, undefined);
  assert.deepEqual(tr.calls.accounts, [ASKED], "the paying account was asked of `accounts`, for the act `transcribe`");
  assert.deepEqual(tr.calls.transcribe, [], "nothing was sent to the AI");
  assert.equal(writes(w), before, "nothing was written");

  /* control: the same transcriber whose `accounts` answers an account */
  const c = await heldScan({ accounts: ACCOUNT });
  const ok = await c.run();
  assert.equal(ok.status, 200);
  assert.deepEqual([ok.body.transcription.performed, ok.body.transcription.written, ok.body.transcription.pages], [true, true, [1, 2]]);
  assert.deepEqual(c.tr.calls.accounts, [ASKED]);
  assert.deepEqual(c.tr.calls.transcribe.map((q) => [q.pages, q.capture_sha, q.account]), [[[1, 2], c.d, ACCOUNT]],
                   "the account `accounts` answered is the one handed to the AI");
  assert.equal(c.w.one(`SELECT text FROM capture_text WHERE capture_sha=? AND seq=2`, c.d).text, "AI text of page 2");
});

test("R72 (T48, N996): through T48 a `transcription` handing `credentials` in place of `accounts` is still read: its refusal answered as given, nothing written; control: its account fills the asked pages", async () => {
  const { w, tr, run } = await heldScan({ credentials: NO_ACCOUNT });
  const before = writes(w);
  const r = await run();
  assert.deepEqual([r.status, r.body.code, r.body.check], [403, "NO_ACCOUNT", "C-29.20"]);
  assert.deepEqual([tr.calls.credentials, tr.calls.transcribe], [[ASKED], []]);
  assert.equal(writes(w), before);

  const c = await heldScan({ credentials: ACCOUNT });
  const ok = await c.run();
  assert.deepEqual([ok.status, ok.body.transcription.written, ok.body.transcription.pages], [200, true, [1, 2]]);
  assert.deepEqual(c.tr.calls.credentials, [ASKED]);
});

test("R72 (T48, N996): handed both, `accounts` is the paying account's service and `credentials` is never asked; control: `accounts` refusing is answered though `credentials` would serve", async () => {
  const a = await heldScan({ accounts: ACCOUNT, credentials: NO_ACCOUNT });
  const ok = await a.run();
  assert.deepEqual([ok.status, ok.body.transcription.written], [200, true]);
  assert.deepEqual([a.tr.calls.accounts.length, a.tr.calls.credentials.length], [1, 0]);

  const b = await heldScan({ accounts: NO_ACCOUNT, credentials: ACCOUNT });
  const before = writes(b.w);
  const r = await b.run();
  assert.deepEqual([r.status, r.body.code], [403, "NO_ACCOUNT"]);
  assert.deepEqual([b.tr.calls.accounts.length, b.tr.calls.credentials.length, b.tr.calls.transcribe.length], [1, 0, 0]);
  assert.equal(writes(b.w), before);
});

/* ai-accounts' keep-away refusals, from its published fixtures (K5044): R7's `AI_KEPT_AWAY` when the group's limit covers the use, R22's
   `PROJECT_AI_KEPT_AWAY` when the project's does, and R34's fail-closed `AI_KEPT_AWAY` (its row, `keep_away`'s three null) when the setting cannot be read. */
const KEPT = [
  (await keptAwayGroup({ use: "transcribe" })).aiKeptAway,
  (await keptAwayProject({ use: "transcribe" })).aiKeptAway,
  (await keptAwayUnreadable({ use: "transcribe" })).aiKeptAway,
];

test("R71 (T48; ai-accounts.aiKeptAway, its R7, R22, R34): each keep-away refusal the transcriber's keptAway answers is relayed as given, before any byte is read or account asked, saying transcribe.refused; control: keptAway answering null transcribes", async () => {
  for (const k of KEPT) {
    const { w, tr, run } = await heldScan({ accounts: ACCOUNT }, { away: k });
    const before = writes(w);
    const gets = () => w.evidence.calls.filter(([op]) => op === "get").length;
    const r = await run();
    assert.equal(r.status, 403, k.code);
    assert.deepEqual({ ...r.body, says: undefined }, { ...k, says: undefined }, "relayed as given, every field");
    assert.equal(r.body.says, WORD("transcribe.refused").replace("{reason}", k.translation));
    assert.deepEqual(tr.calls.keptAway, [{ project: null, use: "transcribe" }]);
    assert.deepEqual([gets(), tr.calls.accounts.length, tr.calls.transcribe.length], [0, 0, 0], "nothing read, asked or sent");
    assert.equal(writes(w), before);
  }
  const c = await heldScan({ accounts: ACCOUNT }, { away: null });
  const ok = await c.run();
  assert.deepEqual([ok.status, ok.body.transcription.written, c.tr.calls.keptAway.length], [200, true, 1]);
});
