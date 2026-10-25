/* publish-schedule R12 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, publishScheduleOps } from "../../../src/publish-schedule/index.mjs";
import { world, V, SIG } from "./fixture.mjs";
const CASE = "CASE-2026-0001";
const AT = { date: "2026-10-01", time: "09:00" };
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* olive's project with one case edition prepared and its publishing time set, so that it waits */
const mkWaiting = () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry("INQ-2026-0001");
  const roles = [{ target: "INQ-2026-0001", version_sha: w.head("INQ-2026-0001") }];
  w.prepare(CASE, 1, { project: proj, roles });
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  const doc = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE);
  const r = w.record.transact(() => w.ps.scheduleEdition({ case: CASE, edition: 1, docSha: doc.doc_sha, signature: SIG(1),
    signer: "olive", deliveredBy: V("olive"), at: AT, checked: {}, by: V("olive") }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
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
  const env = setup ? await setup() : await (mkWaiting());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (publishScheduleOps(env.ps, url, fields)[op]());
};

test("R12 publish-schedule declares publishatcancel: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "publishatcancel", declaration: DECLARED_OPS["publishatcancel"], call: mk("publishatcancel", {"by":"member:olive"}),
    refusedNaming: named({"case":["NOT_WAITING"],"edition":["NOT_WAITING"]}, true), values: { case: CASE, edition: 1 }, same: sameCode });
});
