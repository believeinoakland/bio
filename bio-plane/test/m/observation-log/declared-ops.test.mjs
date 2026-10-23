/* observation-log R39 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, observationLogOps } from "../../../src/observation-log/index.mjs";
import { world, V } from "./fixture.mjs";
import { LEAD_LOOK_OUTCOMES } from "../../../src/observation-log/index.mjs";
/* a group: alice has written one lead and joined PROJ-A */
const mkGroup = async () => {
  const w = world({ now: "2026-09-27T03:04:05Z" });
  w.project("PROJ-A");
  w.participant("PROJ-A", "alice");
  const r = w.obs.lead({ words: "I was told the contract was amended", author: "alice" });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { ...w, leadId: r.lead_id };
};
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const withLead = (fields, env) => { const f = { ...fields }; for (const k of ["lead", "id"]) if (k in f) f[k] = env.leadId; return f; };

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkGroup());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (observationLogOps(env.obs, url, fields)[op]());
};

test("R39 observation-log declares lead: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "lead", declaration: DECLARED_OPS["lead"], call: mk("lead", {"author":"alice"}),
    refusedNaming: named({"words":["LEAD_NO_WORDS"]}, true), same: sameCode });
});

test("R39 observation-log declares leadlook: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "leadlook", declaration: DECLARED_OPS["leadlook"], call: mk("leadlook", {"looker":"alice","viewer":"member:alice"}, null, null, (fields, env) => (withLead(fields, env))),
    refusedNaming: named({"lead":["LEAD_NOT_FOUND"],"state":["LEAD_LOOK_STATE"],"detail":["LEAD_LOOK_NO_DETAIL"]}, true), values: { state: LEAD_LOOK_OUTCOMES[0], detail: "I looked in the March agenda" }, same: sameCode });
});

test("R39 observation-log declares leadshare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "leadshare", declaration: DECLARED_OPS["leadshare"], call: mk("leadshare", {"sharer":"alice","viewer":"member:alice"}, null, null, (fields, env) => (withLead(fields, env))),
    refusedNaming: named({"lead":["LEAD_NOT_FOUND"],"project":["LEAD_SHARE_NOT_A_PARTICIPANT"],"reason":["LEAD_SHARE_NO_REASON"]}, true), values: {"project":"PROJ-A","reason":"the project needs it"}, same: sameCode });
});

test("R39 observation-log declares leadread: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "leadread", declaration: DECLARED_OPS["leadread"], call: mk("leadread", {"viewer":"member:alice"}, null, null, (fields, env) => (withLead(fields, env))),
    refusedNaming: named({"id":["LEAD_NOT_FOUND"]}, true), same: sameCode });
});

test("R39 observation-log declares leadlist: it requires nothing, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "leadlist", declaration: DECLARED_OPS["leadlist"], call: mk("leadlist", {"viewer":"member:alice"}, null, null, null),
    values: { limit: "5" }, same: sameCode });
});

test("R39 R20 leadlist as declared lists the leads its viewer may read and none other", async () => {
  const w = await mkGroup();
  const other = w.obs.lead({ words: "bob's private lead", author: "bob" });
  assert.equal(other.ok, true, JSON.stringify(other));
  const ask = (viewer) => observationLogOps(w.obs, new URL("http://x/?" + new URLSearchParams({ op: "leadlist", viewer })), null).leadlist();
  const mine = ask("member:alice");
  assert.deepEqual(mine.leads.map((l) => l.lead_id), [w.leadId]);
  assert.equal(mine.truncated, false);
  assert.equal(mine.leads.some((l) => l.lead_id === other.lead_id), false);
});
