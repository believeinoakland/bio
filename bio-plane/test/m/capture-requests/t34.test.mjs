/* capture-requests at T34: R48 (N587; DEC-141, K1618, K1645), the `captured-for` reader this module registers into
   `capture` (its R83), driven through the registration as `capture` holds it; and DEC-149 (T34-86, K1784): every
   member-facing string of this module that called the group's Civicsmith "this instance" or "this plane" now names it,
   or needs no name, each changed string named below. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, filed, sha } from "./fixture.mjs";
import { CAPTURE_REQUEST_CHECKS, MEMBER_ROUTE, CAPTURE_REQUESTS_MODULE } from "../../../src/capture-requests/index.mjs";

/** The reader as `capture` holds it: the one registered in the `captured-for` slot, by this module. */
const readerOf = (w) => {
  const regs = w.capture.readers.filter((r) => r.slot === "captured-for");
  assert.equal(regs.length, 1, "registered once, at start");
  assert.equal(regs[0].module, CAPTURE_REQUESTS_MODULE);
  return regs[0].fn;
};

/** A scene: INQ-1 open and seen by all; INQ-2 concluded; INQ-H open inside a project only `inner` sees. Requests are
 *  asked through the door and drained, so each `capture_sha` is the drain's own. */
async function scene() {
  const w = world().scene();
  w.project("PROJ-H");
  w.participant("PROJ-H", "inner");
  w.bundle("INQ-H");
  w.st.sql.exec(`UPDATE bundles SET project='PROJ-H', title='Hidden question' WHERE bundle_id='INQ-H'`);
  w.membership.reindexProjectSight("INQ-H");
  w.st.sql.exec(`UPDATE bundles SET title='Who owns the lot?' WHERE bundle_id='INQ-1'`);
  w.st.sql.exec(`UPDATE bundles SET title='Closed one', current_state='concluded' WHERE bundle_id='INQ-2'`);
  w.run("R-2", { plane: "member:bea/tok2", claude: "project" });
  w.run("R-H", { plane: "member:inner/tok3", claude: "instance" });
  return w;
}
const same = (bytes) => (_b, opts) => filed(opts.captureRequest.locator, opts, { bytes });

test("R48 the captured-for reader: registered once at start in capture's slot; for a document's capture digests it answers one entry per (target, plane principal), question the target, asker the plane principal never the Claude one, title the target's, waiting when the target is open", async () => {
  const w = await scene();
  const fn = readerOf(w);
  const A = "https://a.example.org/doc.pdf", B = "https://b.example.org/doc.pdf";
  w.capture.script.set(A, same("doc one"));
  w.capture.script.set(B, same("doc one"));
  /* ann asks twice under INQ-1 (two runs, same plane principal would be one pair): R-1 for A; bea's R-2 for B under
     INQ-1 and again under INQ-2 with a lead that is not a question it was captured for */
  assert.equal(w.ask({ address: A }).ok, true);
  assert.equal(w.ask({ address: B, lead: "INQ-2" }).ok, true);
  assert.equal(w.cr.captureRequest({ run: "R-2", address: B, target: "INQ-2", purpose: "investigate" },
                                   { viewer: V("bea"), caller: "member:bea/tok2" }).ok, true);
  const d = await w.cr.drain({});
  assert.equal(d.captured.length, 2, JSON.stringify(d).slice(0, 400));
  w.tick(); await w.cr.drain({});
  const digest = sha("doc one");
  const got = fn({ document: "INFO-2026-0001-requested", captures: [digest], viewer: V("ann") });
  assert.deepEqual(got, { questions: [
    { question: "INQ-1", asker: "member:ann/tok1", title: "Who owns the lot?", visible: true, waiting: true },
    { question: "INQ-2", asker: "member:bea/tok2", title: "Closed one", visible: true, waiting: false },
  ] });
  for (const q of got.questions) assert.notEqual(q.asker, "instance", "never the Claude principal");
  assert.equal(got.questions.some((q) => q.question === "INQ-2" && q.asker === "member:ann/tok1"), false,
    "lead_inquiry is not a question the document was captured for");
  assert.equal(w.capture.readers.length, 1, "nothing else registered");
});

test("R48 sight: a question the viewer may not see answers visible false with title and asker null, still waiting when open; an unrecognised viewer sees none; a member who sees it is answered whole", async () => {
  const w = await scene();
  const fn = readerOf(w);
  const A = "https://h.example.org/x.pdf";
  w.capture.script.set(A, same("held bytes"));
  assert.equal(w.cr.captureRequest({ run: "R-H", address: A, target: "INQ-H", purpose: "investigate" },
                                   { viewer: V("inner"), caller: "member:inner/tok3" }).ok, true);
  await w.cr.drain({});
  const digest = sha("held bytes");
  assert.deepEqual(fn({ document: "D", captures: [digest], viewer: V("ann") }),
    { questions: [{ question: "INQ-H", asker: null, title: null, visible: false, waiting: true }] });
  assert.deepEqual(fn({ document: "D", captures: [digest], viewer: "nobody" }),
    { questions: [{ question: "INQ-H", asker: null, title: null, visible: false, waiting: true }] });
  assert.deepEqual(fn({ document: "D", captures: [digest], viewer: V("inner") }),
    { questions: [{ question: "INQ-H", asker: "member:inner/tok3", title: "Hidden question", visible: true, waiting: true }] });
});

test("R48 a document no request was filed into answers questions: []; only captured rows count; R39's held capture recorded for a second request names both questions; it writes nothing; a failure answers nothing, never a partial list", async () => {
  const w = await scene();
  const fn = readerOf(w);
  assert.deepEqual(fn({ document: "D", captures: [], viewer: V("ann") }), { questions: [] });
  assert.deepEqual(fn({ document: "D", captures: ["f".repeat(64)], viewer: V("ann") }), { questions: [] });
  assert.deepEqual(fn({ document: "D", viewer: V("ann") }), { questions: [] }, "no captures given");
  /* a request still waiting names no capture */
  const A = "https://w.example.org/a.pdf";
  const waiting = w.ask({ address: A });
  w.st.sql.exec(`UPDATE capture_requests SET capture_sha=? WHERE request=?`, sha("x"), waiting.request);
  assert.deepEqual(fn({ document: "D", captures: [sha("x")], viewer: V("ann") }), { questions: [] }, "not captured");
  /* R39: a second request for an address already held is recorded as that capture: both questions are named */
  w.st.sql.exec(`DELETE FROM capture_requests`);
  w.capture.script.set(A, [same("v1"), (_b, opts) => filed(A, opts, { bytes: "v1", existed: true })]);
  w.ask({ address: A });
  await w.cr.drain({});
  w.cr.captureRequest({ run: "R-2", address: A, target: "INQ-2", purpose: "investigate" },
                      { viewer: V("bea"), caller: "member:bea/tok2" });
  w.tick(); await w.cr.drain({});
  const before = w.rows(`SELECT * FROM capture_requests ORDER BY request`);
  const got = fn({ document: "D", captures: [sha("v1"), sha("v1")], viewer: V("ann") });
  assert.deepEqual(got.questions.map((q) => [q.question, q.asker]), [["INQ-1", "member:ann/tok1"], ["INQ-2", "member:bea/tok2"]]);
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests ORDER BY request`), before, "writes nothing");
  /* a target no longer held: not visible, not waiting */
  w.st.sql.exec(`DELETE FROM bundles WHERE bundle_id='INQ-2'`);
  assert.deepEqual(fn({ document: "D", captures: [sha("v1")], viewer: V("ann") }).questions[1],
    { question: "INQ-2", asker: null, title: null, visible: false, waiting: false });
  /* a failure inside it answers nothing: the table gone */
  w.st.sql.exec(`ALTER TABLE capture_requests RENAME TO gone`);
  assert.equal(fn({ document: "D", captures: [sha("v1")], viewer: V("ann") }), null);
  /* never a promise: the answer is synchronous */
  w.st.sql.exec(`ALTER TABLE gone RENAME TO capture_requests`);
  assert.equal(typeof fn({ document: "D", captures: [], viewer: V("ann") }).then, "undefined");
});

test("R48 many digests: a document with more captures than one read binds is answered whole", async () => {
  const w = await scene();
  const fn = readerOf(w);
  const A = "https://m.example.org/a.pdf";
  w.capture.script.set(A, same("many"));
  w.ask({ address: A });
  await w.cr.drain({});
  const captures = [...Array.from({ length: 250 }, (_, i) => sha(`other ${i}`)), sha("many")];
  assert.deepEqual(fn({ document: "D", captures, viewer: V("ann") }).questions.map((q) => q.question), ["INQ-1"]);
});

/* DEC-149 (T34-86): the strings BOB's grep named (checks.mjs C-28.8, C-28.16, C-28.21; index.mjs's unconfigured drain)
   and the others this job found (C-28.1, C-28.4, C-28.6, C-28.17, C-28.20, MEMBER_ROUTE, the platform mark's two failures). */
test("DEC-149 each changed member-facing string says your group's Civicsmith, or needs no name: C-28.1, C-28.4, C-28.6, C-28.8, C-28.16, C-28.17, C-28.20, C-28.21, MEMBER_ROUTE, the unconfigured drain, the platform mark's failures", async () => {
  const OLD = /\bthis (instance|copy|plane)\b/i;
  const tr = (code) => CAPTURE_REQUEST_CHECKS[code].translation;
  const named = {
    "C-28.1": ["CAPTURE_REQUEST_NO_RUN", "Every fetch your group's Civicsmith makes on its own"],
    "C-28.4": ["CAPTURE_REQUEST_CARRIES_A_CAPTURE", "The fetch is performed by your group's Civicsmith itself"],
    "C-28.6": ["CAPTURE_CONDUCT_UA_ILLEGIBLE", "Your group's Civicsmith will not fetch without saying who is asking"],
    "C-28.8": ["CAPTURE_CONDUCT_NO_PURPOSE", "Every request your group's Civicsmith makes says what it is for"],
    "C-28.16": ["CAPTURE_REQUEST_RENDER_MALFORMED", "in a form your group's Civicsmith does not recognise"],
    "C-28.17": ["CAPTURE_FETCH_FAILED", "Your group's Civicsmith tried to fetch the document"],
    "C-28.20": ["MEMBER_CAPTURE_ONLY", "Your group's Civicsmith does not fetch it unattended or sign in to it"],
    "C-28.21": ["CAPTURE_REQUEST_SITE_KIND_UNKNOWN", "in a way your group's Civicsmith does not recognise"],
  };
  for (const [check, [code, says]] of Object.entries(named)) {
    assert.equal(CAPTURE_REQUEST_CHECKS[code].check, check);
    assert.ok(tr(code).includes(says), `${check}: ${tr(code)}`);
  }
  /* no translation of the family calls it "this instance", "this copy" or "this plane" */
  for (const [code, row] of Object.entries(CAPTURE_REQUEST_CHECKS)) assert.doesNotMatch(row.translation, OLD, code);
  assert.match(MEMBER_ROUTE, /your group's Civicsmith uses no login for it\.$/);
  assert.doesNotMatch(MEMBER_ROUTE, OLD);
  /* the unconfigured drain, as its answer says it */
  const off = world({ configured: () => false });
  const d = await off.cr.drain({});
  assert.equal(d.detail, "no daemon credential is bound: your group's Civicsmith drains nothing and holds no alarm for it");
  /* the platform mark's two failures need no name */
  const w = world().scene();
  w.st.sql.exec(`DROP TABLE capture_request_platforms`);
  const m = w.cr.markPlatform({ host: "www.example.org" }, { viewer: V("ann") });
  assert.equal(m.detail, "the mark could not be written, and the reason was not recorded. Nothing was written.");
  const u = w.cr.unmarkPlatform({ host: "www.example.org" }, { viewer: V("ann") });
  assert.equal(u.detail, "the withdrawal could not be written, and the reason was not recorded. Nothing was written.");
  for (const s of [d.detail, m.detail, u.detail]) assert.doesNotMatch(s, OLD);
});
