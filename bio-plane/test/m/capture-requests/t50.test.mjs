/* capture-requests at T50 (T50-81): R48 as amended (N1117, K3627; capture R83, R94), the `captured-for` reader also
   answers the asks `acquire`'s `for` recorded, handed to it as `asks`; driven through the registration as `capture`
   holds it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, filed, sha } from "./fixture.mjs";
import { CAPTURE_REQUESTS_MODULE } from "../../../src/capture-requests/index.mjs";

const readerOf = (w) => {
  const regs = w.capture.readers.filter((r) => r.slot === "captured-for");
  assert.equal(regs.length, 1, "exactly one registration in the captured-for slot");
  assert.equal(regs[0].module, CAPTURE_REQUESTS_MODULE);
  return regs[0].fn;
};
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
  return w;
}

test("R48 an ask (capture R94's captured_for row) with no request is answered for a viewer who may see the question with its title and asker, waiting when the question is open, and for one who may not as not visible with no title or asker", async () => {
  const w = await scene();
  const fn = readerOf(w);
  const asks = [{ question: "INQ-1", asker: "member:ann" }, { question: "INQ-2", asker: "member:bea" }, { question: "INQ-H", asker: "member:inner" }];
  assert.deepEqual(fn({ document: "D", captures: [sha("a")], viewer: V("ann"), asks }), { questions: [
    { question: "INQ-1", asker: "member:ann", title: "Who owns the lot?", visible: true, waiting: true },
    { question: "INQ-2", asker: "member:bea", title: "Closed one", visible: true, waiting: false },
    { question: "INQ-H", asker: null, title: null, visible: false, waiting: true },
  ] });
  assert.deepEqual(fn({ document: "D", captures: [], viewer: V("inner"), asks: [asks[2]] }), { questions: [
    { question: "INQ-H", asker: "member:inner", title: "Hidden question", visible: true, waiting: true }] });
  assert.deepEqual(fn({ document: "D", captures: [], viewer: "nobody", asks: [asks[0]] }), { questions: [
    { question: "INQ-1", asker: null, title: null, visible: false, waiting: true }] }, "an unrecognised viewer sees none");
  assert.deepEqual(fn({ document: "D", captures: [], viewer: V("ann"), asks: [{ question: "INQ-GONE", asker: "member:ann" }] }),
    { questions: [{ question: "INQ-GONE", asker: null, title: null, visible: false, waiting: false }] }, "a question not held");
});

test("R48 control: with asks empty, absent or not a list the answer is as before; an ask that names no question is skipped", async () => {
  const w = await scene();
  const fn = readerOf(w);
  const A = "https://a.example.org/doc.pdf";
  w.capture.script.set(A, (_b, opts) => filed(opts.captureRequest.locator, opts, { bytes: "doc" }));
  assert.equal(w.ask({ address: A }).ok, true);
  await w.cr.drain({});
  const base = fn({ document: "D", captures: [sha("doc")], viewer: V("ann") });
  assert.deepEqual(base.questions.map((q) => [q.question, q.asker]), [["INQ-1", "member:ann/tok1"]]);
  for (const asks of [[], undefined, null, "INQ-2", {}])
    assert.deepEqual(fn({ document: "D", captures: [sha("doc")], viewer: V("ann"), asks }), base, String(asks));
  assert.deepEqual(fn({ document: "D", captures: [], viewer: V("ann"), asks: [] }), { questions: [] });
  assert.deepEqual(fn({ document: "D", captures: [], viewer: V("ann"),
    asks: [null, 5, {}, { question: "", asker: "member:ann" }, { question: 7, asker: "member:ann" }] }), { questions: [] });
});

test("R48 a pair that is both a request's and an ask's is answered once; a request and an ask for different pairs are both answered, in question then asker order; it writes nothing", async () => {
  const w = await scene();
  const fn = readerOf(w);
  const A = "https://a.example.org/doc.pdf";
  w.capture.script.set(A, (_b, opts) => filed(opts.captureRequest.locator, opts, { bytes: "doc" }));
  w.ask({ address: A });
  await w.cr.drain({});
  const before = w.rows(`SELECT * FROM capture_requests ORDER BY request`);
  const got = fn({ document: "D", captures: [sha("doc")], viewer: V("ann"), asks: [
    { question: "INQ-1", asker: "member:ann/tok1" }, { question: "INQ-1", asker: "member:ann/tok1" },
    { question: "INQ-1", asker: "member:bea" }, { question: "INQ-2", asker: "member:ann" }] });
  assert.deepEqual(got.questions.map((q) => [q.question, q.asker]),
    [["INQ-1", "member:ann/tok1"], ["INQ-1", "member:bea"], ["INQ-2", "member:ann"]]);
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests ORDER BY request`), before, "writes nothing");
  /* a failure inside it answers nothing, never a partial list */
  w.st.sql.exec(`ALTER TABLE capture_requests RENAME TO gone`);
  assert.equal(fn({ document: "D", captures: [sha("doc")], viewer: V("ann"), asks: [{ question: "INQ-2", asker: "member:ann" }] }), null);
});
