/* local-facts R20 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, localFactsOps } from "../../../src/local-facts/index.mjs";
import { world, V, sha, P } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a deadline of Tier 2 and one of Tier 1 (which a confirmation needs no statement for), a legal fact is not used here */
const DL = { rule: "group_answer", applies_to: "records_request", units: "days", amount: 7, starts: "received", citation: "Test Bylaw § 9", effective_from: "2026-09-01" };
const DL1 = { rule: "group_notice", applies_to: "bylaw_complaint", units: "days", amount: 3, starts: "act", citation: "Test Bylaw § 10", effective_from: "2026-09-01" };
/* the group's world; a primary source it holds; and, when asked, a rule bob drafted from it */
const mkWorld = (entry = null) => {
  const w = world();
  w.src = { captureSha: w.held("INFO-2026-0001", sha("the bylaw")), extent: { kind: "document" } };
  if (entry) {
    const d = w.lf.ruleDraft({ section: "deadlines", entry, source: w.src, reason: "the bylaw's own text", by: V("bob"), viewer: V("bob") });
    if (!d.ok) throw new Error("fixture draft refused: " + JSON.stringify(d));
    w.ruleId = d.rule;
  }
  return w;
};
const as = (who, fields) => ({ ...fields, by: V(who) });
const drafted = (fields, env) => as("bob", Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, k === "source" ? env.src : k === "section" ? "deadlines" : k === "entry" ? DL : v])));
const ruled = (who) => (fields, env) => as(who, "rule" in fields ? { ...fields, rule: env.ruleId } : fields);

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.field === field || answer.argument === field || (typeof answer.field === "string" && answer.field.startsWith(field + "."))) return true;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (localFactsOps(env.lf, url, fields)[op]());
};

test("R20 local-facts declares ruledraft: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "ruledraft", declaration: DECLARED_OPS["ruledraft"], call: mk("ruledraft", {"viewer":"member:bob"}, null, null, (fields, env) => (drafted(fields, env))),
    refusedNaming: named({"section":["RULE_SECTION_UNKNOWN"],"entry":["RULE_ENTRY_INVALID"],"source":["RULE_NO_SOURCE"],"reason":["RULE_NO_REASON"]}, true), values: {"reason":"the bylaw's own text"}, same: sameCode });
});

test("R20 local-facts declares ruleconfirm: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "ruleconfirm", declaration: DECLARED_OPS["ruleconfirm"], call: mk("ruleconfirm", {"viewer":"member:carol"}, async () => (mkWorld(DL1)), null, (fields, env) => (ruled("carol")(fields, env))),
    refusedNaming: named({"rule":["NO_SUCH_GROUP_RULE"]}, true), same: sameCode });
});

test("R20 local-facts declares rulewithdraw: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "rulewithdraw", declaration: DECLARED_OPS["rulewithdraw"], call: mk("rulewithdraw", {"viewer":"member:carol"}, async () => (mkWorld(DL)), null, (fields, env) => (ruled("carol")(fields, env))),
    refusedNaming: named({"rule":["NO_SUCH_GROUP_RULE"],"reason":["RULE_NO_REASON"]}, true), values: {"reason":"the bylaw was repealed"}, same: sameCode });
});

test("R20 local-facts declares factconfirm: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "factconfirm", declaration: DECLARED_OPS["factconfirm"], call: mk("factconfirm", {}, null, null, (fields, env) => (as("bob", fields))),
    refusedNaming: named({"path":["NO_SUCH_FACT"],"act":["FACT_ACT_REFUSED"],"how":["FACT_HOW_REFUSED"]}, true), values: { path: P.tz, act: "confirm", how: "read the office's posted notice" }, same: sameCode });
});
