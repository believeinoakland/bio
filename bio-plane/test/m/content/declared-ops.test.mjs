/* content R56 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, contentOps } from "../../../src/content/ops.mjs";
import { world, V } from "./fixture.mjs";
const DOC = "INFO-2026-0001-a";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a document with one captured copy of three pages, read; ty has typed page 1 where the call asks for it */
const mkDoc = async () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 3 });
  return w;
};
const mkTyped = async () => {
  const w = await mkDoc();
  const r = w.content.transcribe({ bundleId: DOC, extent: { kind: "pdf-page", page: 1 }, text: "In the year 1921", transcriber: V("ty"), viewer: V("ty") });
  assert.equal(r.ok, true, JSON.stringify(r));
  w.typedId = r.content_id;
  return w;
};

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkDoc());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (contentOps(env.content, url, fields)[op]());
};

test("R56 content declares transcribe: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "transcribe", declaration: DECLARED_OPS["transcribe"], call: mk("transcribe", {"transcriber":"member:ty","viewer":"member:ty"}),
    refusedNaming: named({"bundleId":["TRANSCRIBE_NO_DOCUMENT"],"extent":["TRANSCRIBE_NO_PORTION"],"text":["TRANSCRIBE_NO_TEXT"]}, true), values: {"bundleId":"INFO-2026-0001-a","extent":{"kind":"pdf-page","page":1},"text":"In the year 1921"}, same: sameCode });
});

test("R56 content declares transcriptionattest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "transcriptionattest", declaration: DECLARED_OPS["transcriptionattest"], call: mk("transcriptionattest", {"attestor":"member:zed","viewer":"member:zed"}, async () => (mkTyped()), null, (fields, env) => (("contentId" in fields ? { ...fields, contentId: env.typedId } : fields))),
    refusedNaming: named({"contentId":["TRANSCRIPTION_NOT_FOUND"],"note":["ATTEST_NO_NOTE"]}, true), values: {"note":"Compared the typed line with page one of the scan."}, same: sameCode });
});

test("R56 content declares transcriptions: its requires alone raise no refusal naming a field, the missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "transcriptions", declaration: DECLARED_OPS["transcriptions"], call: mk("transcriptions", {"viewer":"member:ty"}, async () => (mkTyped())),
    refusedNaming: named({"bundleId":["NO_TARGET"]}, true), values: {"bundleId":"INFO-2026-0001-a"}, same: sameCode });
});
