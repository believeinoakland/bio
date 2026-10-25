/* case-authoring G9 (fix round 6; K4573; R85): a case that cites a member's own file is prepared in one sitting. `op=publish`
   answered DOCUMENT_COPY_PENDING for a document whose publication copy nobody had made (case-disclosures R6): the only maker
   was the scheduler's alarm, so even a 356-byte text file could not be signed. The act now awaits case-carriage's
   `copyNow({shas, maxBytes})` for the documents the refusal names and runs `publishCase` once more.
   Two kinds of test. The seam tests run the real `publish` op over the real case-carriage and case-disclosures, the file
   and its receipt made as an upload makes them (`copying` gives case-carriage the evidence store and the bucket); they need
   case-carriage's `copyNow` and stay red by name until that job is merged. The wiring tests give the act a `copyNow` of the
   test's own, so they hold what the act asks of it and how it behaves when it fails, apart from the copy itself. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha, T0 } from "./fixture.mjs";
import { caseAuthoringOps, COPY_NOW_MAX_BYTES } from "../../../src/case-authoring/index.mjs";
import { encryptedRefusal } from "../doc-clean/fixtures.mjs";

const DOC = "INFO-2026-0134-report-txt";
const Q = "INQ-2026-0001-q";
const ratified = (real) => new Proxy(real, { get: (t, p) => (p === "caseRatifyPreflight"
  ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
/* the walker's file: 356 bytes of plain text */
const BASE = "The agency's records office answered the request in nineteen days and gave no reason for the delay in its letter.\n"
  + "It enclosed the policy it applied and named the officer who decided.\n"
  + "The policy sets a ten day limit and allows one extension in writing.\n";
const TEXT = BASE + "No extension was recorded. ".repeat(10).slice(0, 356 - BASE.length - 1) + "\n";

/* One finding, load-bearing, resting on a member document (the walker's text file) whose copy nobody has made. `size`, when
   given, is the size the register row and the evidence store state for it (the bytes held stay the text's: promotion refuses
   an inline text of that size, and case-carriage reads the size from what is stated). */
function setup({ copying = false, text = TEXT, size = null } = {}) {
  const w = world({ ratification: ratified, copying });
  w.member("alice");
  const s = w.doc(DOC, text, { copy: null });
  if (copying) {
    w.evidence.held.set(s, Buffer.from(text, "utf8"));
    /* as the upload makes it: a receipt that is not a fetch (provenance R62), which case-carriage queues (its R15) */
    w.prov.recordReceipt({ address: `upload:${s}`, addressNorm: `upload:${s}`, captureSha: s, retrieved: T0, via: "upload" });
    if (size) {
      w.st.sql.exec(`UPDATE register SET bytes=? WHERE capture_sha=?`, size, s);
      const head = w.evidence.head;
      w.evidence.head = async (k) => (k === s ? { size } : head(k));
    }
  }
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  return { w, P, sha: s };
}
const body = (P) => ({ project: P, targets: [Q], roles: { [Q]: "load_bearing" }, scope: "s",
  statement: "It does not cover the amendments.", subjectPosition: "not_sought", subjectJustification: "A public record.",
  biasAcknowledgement: "We read the minutes as the account.", excluded: [], tieAttested: true });
/* the act as the door reaches it: the plane's op map, the stamps on the query */
const op = (w, P, name = "publishcase") => caseAuthoringOps(w.ca,
  new URL(`http://plane/?viewer=${encodeURIComponent(V("alice"))}&author=alice`), body(P))[name]();
/* what the tables hold, less the empty ones some module creates on first use */
const held = (w) => Object.fromEntries(Object.entries(w.snapshot()).filter(([, v]) => v !== "[]"));
const prepared = (w) => w.rows(`SELECT case_id, edition FROM case_documents`);

/* ---------------------------------------------------------------- the seam: real case-carriage and case-disclosures */

test("G9 R85 (the walker's case): the real publish op over the real case-carriage and case-disclosures — a 356-byte text upload cited load-bearing is prepared in the act, with no DOCUMENT_COPY_PENDING; the document is carried as it is held", async () => {
  const { w, P, sha: s } = setup({ copying: true });
  assert.equal(Buffer.byteLength(TEXT), 356, "the walker's file is 356 bytes");
  assert.equal(w.cc.documentCopy(s).state, "pending", "before: nobody has made the copy");
  const a = await op(w, P);
  assert.notEqual(a.code, "DOCUMENT_COPY_PENDING", JSON.stringify(a).slice(0, 400));
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 400));
  assert.equal(prepared(w).length, 1, "the edition is prepared");
  assert.equal(w.cc.documentCopy(s).state, "clean", "the copy was made in the act, not by the alarm");
});

test("G9 R85 (control): a 5 MB document still answers DOCUMENT_COPY_PENDING, is left queued for the alarm path, and the alarm's copyBatch makes it, after which the act prepares", async () => {
  const { w, P, sha: s } = setup({ copying: true, size: 5 * 1024 * 1024 });
  const a = await op(w, P);
  assert.equal(a.ok, false);
  assert.equal(a.code, "DOCUMENT_COPY_PENDING", "over the act's bound: the alarm path");
  assert.deepEqual(prepared(w), [], "nothing prepared");
  assert.equal(w.rows(`SELECT capture FROM document_copy_queue`).some((r) => r.capture === s), true, "still queued for the alarm");
  await w.cc.copyBatch({});
  assert.notEqual(w.cc.documentCopy(s).state, "pending", "the alarm's batch made it");
  const b = await op(w, P);
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 400));
});

/* ---------------------------------------------------------------- the act's wiring, apart from the copy */

test("G9 R85: on DOCUMENT_COPY_PENDING the act asks copyNow once for exactly the documents the refusal names, within COPY_NOW_MAX_BYTES (2 MB), then runs publishCase once more and answers that run", async () => {
  const { w, P, sha: s } = setup();
  const calls = [];
  w.copyNow = async (a) => { calls.push(a); w.documentCopy(s, "clean"); return { ok: true }; };
  assert.equal(COPY_NOW_MAX_BYTES, 2 * 1024 * 1024);
  const a = await op(w, P);
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.deepEqual(calls, [{ shas: [s], maxBytes: 2 * 1024 * 1024 }], "once, the named digest, the bound");
  assert.equal(prepared(w).length, 1);
});

test("G9 R85 (controls): a copy not made leaves the first refusal as it was, and the act asks once only — copyNow that does nothing, one that throws, one that rejects, and the real one with no store bound", async () => {
  for (const [name, copyNow] of [["does nothing", async () => ({ ok: true })], ["throws", () => { throw new Error("no store"); }],
                                 ["rejects", () => Promise.reject(new Error("no store"))], ["is the real one, with no store bound", null]]) {
    const { w, P } = setup();
    let n = 0;
    if (copyNow) w.copyNow = async (a) => { n++; return copyNow(a); };
    else w.copyNow = undefined;
    const before = held(w);
    const a = await op(w, P);
    assert.equal(a.ok, false, name);
    assert.equal(a.code, "DOCUMENT_COPY_PENDING", name);
    assert.ok(n <= 1, `${name}: asked ${n} times`);
    assert.deepEqual(held(w), before, `${name}: nothing written (R18)`);
  }
});

test("G9 R85 (controls): copyNow is not asked when the first run does not refuse DOCUMENT_COPY_PENDING — a prepared case, a document refused as not cleanable, and a document whose copy is already made", async () => {
  const calls = [];
  const asked = (w) => { w.copyNow = async (a) => { calls.push(a); return { ok: true }; }; };
  const done = setup(); asked(done.w); done.w.documentCopy(done.sha, "clean");
  assert.equal((await op(done.w, done.P)).ok, true);
  const { code, detail } = await encryptedRefusal();
  const refused = setup(); asked(refused.w); refused.w.documentCopy(refused.sha, "refused", { refused: { code, detail } });
  assert.equal((await op(refused.w, refused.P)).code, "DOCUMENT_NOT_CLEANABLE");
  assert.deepEqual(calls, []);
});

test("G9 R85, R34: the pre-flight stays a read — it answers DOCUMENT_COPY_PENDING as first, asks for no copy and writes nothing, so the copy is made by the act and not by a look at the checks", async () => {
  const { w, P } = setup();
  const calls = [];
  w.copyNow = async (a) => { calls.push(a); return { ok: true }; };
  const before = held(w);
  const pre = await op(w, P, "publishpreflight");
  assert.equal(pre.first.code, "DOCUMENT_COPY_PENDING");
  assert.deepEqual(calls, []);
  assert.deepEqual(held(w), before);
});
