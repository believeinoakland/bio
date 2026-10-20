/* reevaluation R39 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, reevaluationOps } from "../../../src/reevaluation/index.mjs";
import { world } from "./fixture.mjs";
import { inquiryMd, U } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (world());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (reevaluationOps(env.r, url, fields)[op]());
};

test("R39 reevaluation declares versionnotice: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versionnotice", declaration: DECLARED_OPS["versionnotice"], call: mk("versionnotice", {"viewer":"member:alice"}),
    refusedNaming: named({"target":["VERSION_NOTICE_NO_SUBJECT"],"content":["VERSION_NOTICE_NO_SUBJECT"]}, true), same: sameCode });
});

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", Q = "INQ-2026-0001-q";
const DOC = "INFO-2026-0001-doc", T = "INQ-2026-0001-target", DEP = "INQ-2026-0002-dep";
const ADMIN = "class:admin";
/* a question resting (leg 0) on page 2 of an older capture whose newer capture changed that page: one open notice */
const withNotice = () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z");
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }, { target: NEW }] });
  w.noticeId = w.r.raiseNotices({}).raised[0].notice;
  return w;
};
/* a target question moved to deferred, and a dependent resting on it: one cause standing */
const withCause = () => {
  const w = world();
  w.doc(DOC);
  w.inquiry(T, {});
  w.inquiry(DEP, { legs: [{ target: T }, { target: DOC }] });
  w.promote(T, inquiryMd(T, { state: "deferred", disposition: '"set down"' }));
  return w;
};
const noticed = (fields, env) => ("notice" in fields ? { ...fields, notice: env.noticeId } : fields);
const caused = (fields, env) => ({ ...fields, ...("dependent" in fields ? { dependent: DEP } : {}), ...("target" in fields ? { target: T } : {}) });
const sameCode2 = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

test("R40 reevaluation declares adoptversion: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "adoptversion", declaration: DECLARED_OPS["adoptversion"], call: mk("versionadopt", {"author":"member:alice","viewer":"class:admin"}, async () => (withNotice()), null, (fields, env) => (noticed(fields, env))),
    refusedNaming: named({"notice":["VERSION_NOTICE_NOT_FOUND"],"why":["VERSION_ADOPT_NO_REASON"]}, true), values: {"why":"the newer version restates the same cut"}, same: sameCode2 });
});

test("R40 reevaluation declares keepversion: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "keepversion", declaration: DECLARED_OPS["keepversion"], call: mk("versionkeep", {"author":"member:alice","viewer":"class:admin"}, async () => (withNotice()), null, (fields, env) => (noticed(fields, env))),
    refusedNaming: named({"notice":["VERSION_NOTICE_NOT_FOUND"]}, true), same: sameCode2 });
});

test("R40 reevaluation declares reevaluationrecord: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reevaluationrecord", declaration: DECLARED_OPS["reevaluationrecord"], call: mk("reevaluationrecord", {"author":"alice","viewer":"class:admin"}, async () => (withCause()), null, (fields, env) => (caused(fields, env))),
    refusedNaming: named({"dependent":["REEVALUATION_NO_SUCH_CAUSE"],"target":["REEVALUATION_NO_SUCH_CAUSE"],"source":["REEVALUATION_NO_SUCH_CAUSE"],"note":["REEVALUATION_NOTE_MALFORMED"]}, true), values: {"source":"deferred","note":"still stands"}, same: sameCode2 });
});

test("R40 reevaluation declares reevaluations: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reevaluations", declaration: DECLARED_OPS["reevaluations"], call: mk("reevaluations", {"viewer":"member:alice"}),
    refusedNaming: named({"target":["NO_SUCH_BUNDLE"]}, true), same: sameCode });
});
