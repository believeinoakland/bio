/* ratification R53 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, ratificationOps, caseConclusionRowLines } from "../../../src/ratification/index.mjs";
import { caseRatifyOp } from "../../../src/ratification/ops.mjs";
import { world as ratificationWorld, plane, newKey, signCase, cleanCase, fmText, CASE_BODY } from "./fixture.mjs";
import { world as retrievalWorld, V, sha, infoMd } from "../retrieval/fixture.mjs";
import { ratificationOf } from "../../../src/ratification/index.mjs";
import { contradictionOf } from "../../../src/contradiction/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
const OWNER = "o", WHO = V("ann");
const DATASET = JSON.stringify({ v: 1 });
const HASH = `sha256:${sha(canonicalJson(JSON.parse(DATASET)))}`;
const FULL = [{ path: "data/dataset.json", text: DATASET }, { path: "snapshots/capture.html", text: "<html/>" }];
const BODY = "\n## Summary\n\nA posting.\n\n## Session Log\n\n### Session 2026-07-02T00:00:00Z | Formation | assisted\nTrigger: intake\nChanges: created.\n\n## Review Notes\n";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* retrieval's world with this module over it, one collected document ready to be released, and a selection holding it */
const mkSelection = async () => {
  const w = retrievalWorld();
  contradictionOf(w.host).migrate();
  w.r = ratificationOf(w.host, { storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion, retrieval: w.retrieval, publication: {} });
  const id = "INFO-2026-0001-a";
  const text = infoMd(id, { content_hash: HASH }).replace(/\n## Summary[\s\S]*$/, BODY);
  const res = w.promotion.promote({ bundleId: id, base: null, snapKey: "r1", author: WHO, replay: false,
    files: [{ path: "bundle.md", text }, ...FULL], meta: { object_type: "information", criticality: "supporting" } });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
  w.handle = (await w.retrieval.selectionCreate({ owner: OWNER, viewer: WHO, ids: [id] })).handle;
  return w;
};
/* the real selection stands for the one the call names */
const real = (fields, env) => ("handle" in fields ? { ...fields, handle: env.handle } : fields);

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkSelection());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (ratificationOps(env.r, url, fields)[op]());
};

test("R53 ratification declares release: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "release", declaration: DECLARED_OPS["release"], call: mk("release", {"viewer":"member:ann","owner":"o","author":"member:ann"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"handle":["NO_SUCH_SELECTION"],"acknowledgment":["NO_ACKNOWLEDGMENT"],"mitigation":["NO_MITIGATION"]}, true), same: sameCode });
});

test("R53 ratification declares retire: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "retire", declaration: DECLARED_OPS["retire"], call: mk("retire", {"viewer":"member:ann","owner":"o","author":"member:ann"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"handle":["NO_SUCH_SELECTION"],"reason":["NO_REASON"]}, true), same: sameCode });
});

const CASE = "CASE-2026-0001", Q1 = "INQ-2026-0001-first";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };

test("R54 ratification declares caseratify: its requires alone raise no refusal naming a field, each missing one is refused naming it by the door's Worker half, and an undeclared field is dropped", async () => {
  const w = ratificationWorld();
  const key = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
    attribution: { reached: [], legacy: [], stated: [], current: [] }, signers: w.credentials.attestingKeys(),
    memberBasis: null, priorCase: null });
  const sig = await signCase(key, CASE, 1, docSha);
  /* the call as the door runs it: the Worker half, over the request's body, with the member's session */
  const call = async (fields) => { const p = plane(w); const res = await caseRatifyOp(p.request(fields), p.stub, p.ctx);
                                   return { status: res.status, ...res.body }; };
  await declaredOpHolds({ op: "caseratify", declaration: DECLARED_OPS.caseratify, call, same: sameCode,
                          values: { caseId: CASE, edition: 1, expectedSha: docSha, sig },
                          outside: ["undeclared_field_caseratify"] });
});
