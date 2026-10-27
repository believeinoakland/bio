/* contradiction R60 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, contradictionOps } from "../../../src/contradiction/index.mjs";
import { world, sha, MACHINE } from "./fixture.mjs";
import { RUN } from "./seed.mjs";
import { seeded, cand } from "./seed.mjs";
import { flagWorld, HERE, OTHER, WHY } from "./flag-seed.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const M1 = "member:m1";
/* a seeded world with one candidate (and, for a resolution, the question taken up from it); their ids stand for the sample ones */
const seedEnv = (key, label, takeUp = false) => async () => {
  const w = seeded({ strictConclude: takeUp });
  w.id = cand(w, key, label);
  if (takeUp) w.inq = w.c.takeUp({ candidate: w.id, question: "Q?", frame: "a", viewer: M1, author: M1 }).inquiry;
  return w;
};
const real = (f, env) => ({ ...f, ...("candidate" in f ? { candidate: env.id } : {}), ...("inquiry" in f ? { inquiry: env.inq } : {}) });

const PA = "PROJ-2026-0001-alpha", PB = "PROJ-2026-0002-beta";
const HA = sha("passage held by alpha"), HB = sha("passage held by beta");
const IX = "INQ-2026-0001-x", IY = "INQ-2026-0002-y";
const M2 = "member:m2", M3 = "member:m3";
/* m2 takes part in alpha only, m3 in beta only; m1 in both: two projects, each hidden from the other, drawing on the two sides of one duty */
function twoHidden({ label = "record", extraParties = [], discoverable = [] } = {}) {
  const w = world();
  const vis = (p) => ({ visibility: discoverable.includes(p) ? "discoverable" : null });
  w.runs.set(RUN, { status: "running", principal: M1 });
  w.project(PA, [{ id: "m2", owner: 1 }, "m1"], vis(PA));
  w.project(PB, [{ id: "m3", owner: 1 }, "m1"], vis(PB));
  w.content(HA, "capHA", PA, { ref: "p. 3 of alpha's minutes" });
  w.content(HB, "capHB", PB, { ref: "p. 9 of beta's report" });
  w.inquiry(IX); w.leg(IX, 0, "supports", { content: HA, target: PA });
  w.inquiry(IY); w.leg(IY, 0, "supports", { content: HB, target: PB });
  w.resolution("capHA", PA, "E1"); w.resolution("capHB", PB, "E1");
  w.reading("capHA", PA, { contentType: "minutes", date: "2026-01-01" });
  w.reading("capHB", PB, { contentType: "report", date: "2026-02-01" });
  w.draws(IX, PA); w.draws(IY, PB);
  for (const p of extraParties) { w.project(p, [{ id: "m3", owner: 1 }], vis(p)); w.draws(IY, p); }
  const pair = w.c.pairs({ key: "K4", viewer: MACHINE }).pairs[0];
  const r = w.c.propose({ run: RUN, proposedBy: "class:ai/t", viewer: MACHINE, caller: M1,
                          proposals: [{ key: "K4", a: pair.a, b: pair.b, label, reason: "alpha's minutes and beta's report disagree" }] });
  w.id = r.candidates[0].candidate;
  return w;
}
const optedIn = () => { const w = twoHidden(); const r = w.c.optIn({ candidate: w.id, project: PA, viewer: M2, author: M2 }); assert.equal(r.ok, true, JSON.stringify(r)); return w; };
/* the differing answer needs its coordinates and words, whichever other field the call leaves out */
const differs = (fields, env) => ({ ...real(fields, env), coordinates: ["scope"], explanation: "they differ in scope" });

/* a refusal names a field by its code (the table; an entry {code, end} also needs the answer to carry that end, and {code, whyHas} its why to hold those words; a refusal may be answered as refused) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const hit = (c) => (typeof c === "string" ? answer.code === c || answer.reason === c || answer.error === c || answer.refused === c
    : (answer.code === c.code || answer.reason === c.code || answer.refused === c.code)
      && Object.entries(c).every(([k, v]) => k === "code" || (k === "whyHas" ? [answer.why, answer.detail, answer.findings && JSON.stringify(answer.findings)].filter(Boolean).join(" ").includes(v) : answer[k] === v)));
  if ((codes[field] || []).some(hit)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (seedEnv("K2", "record")());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (contradictionOps(env.c, url, fields)[op]());
};

test("R60 contradiction declares contradictionresolve: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictionresolve", declaration: DECLARED_OPS["contradictionresolve"], call: mk("contradictionresolve", {"viewer":"member:m1","author":"member:m1"}, async () => (seedEnv("K2", "record", true)()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"inquiry":["NOT_A_CONTRADICTION_INQUIRY"],"resolution":[{"code":"BASIS_REFUSED","whyHas":"`resolution`"}],"conclusion":["BAD_READING"]}, true), values: {"resolution":{"kind":"dissolved","coordinates":["scope"],"qualifiers":{"a":"base","b":"total"}},"conclusion":"two fees, two bases"}, same: sameCode });
});

test("R60 contradiction declares contradictiondismiss: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictiondismiss", declaration: DECLARED_OPS["contradictiondismiss"], call: mk("contradictiondismiss", {"viewer":"member:m1","author":"member:m1"}, async () => (seedEnv("K4", "world")()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"candidate":["NO_CANDIDATE","NO_SUCH_CANDIDATE"],"reason":["DISMISSAL_REASON_UNKNOWN"]}, true), values: {"reason":"not_same_matter"}, same: sameCode });
});

test("R60 contradiction declares contradictionclarify: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictionclarify", declaration: DECLARED_OPS["contradictionclarify"], call: mk("contradictionclarify", {"viewer":"member:m1","author":"member:m1"}, async () => (seedEnv("K2", "record")()), null, (fields, env) => (differs(fields, env))),
    refusedNaming: named({"candidate":["NO_CANDIDATE","NO_SUCH_CANDIDATE"],"choice":["CLARIFY_CHOICE_UNKNOWN"]}, true), values: {"choice":"differs"}, same: sameCode });
});

test("R60 contradiction declares contradictiontakeup: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictiontakeup", declaration: DECLARED_OPS["contradictiontakeup"], call: mk("contradictiontakeup", {"viewer":"member:m1","author":"member:m1"}, async () => (seedEnv("K2", "record")()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"candidate":["NO_CANDIDATE","NO_SUCH_CANDIDATE"],"question":["TAKE_UP_NO_QUESTION"],"frame":["TAKE_UP_NO_FRAME"]}, true), values: {"question":"Which fee governs?","frame":"a"}, same: sameCode });
});

test("R60 contradiction declares contradictionoptin: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictionoptin", declaration: DECLARED_OPS["contradictionoptin"], call: mk("contradictionoptin", {"viewer":"member:m2","author":"member:m2"}, async () => (twoHidden()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"candidate":["NO_CANDIDATE","NO_SUCH_CANDIDATE"],"project":["NO_SUCH_PROJECT"]}, true), values: { project: PA }, same: sameCode });
});

test("R60 contradiction declares contradictionrespond: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictionrespond", declaration: DECLARED_OPS["contradictionrespond"], call: mk("contradictionrespond", {"viewer":"member:m2","author":"member:m2"}, async () => (optedIn()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"candidate":["NO_CANDIDATE","NO_SUCH_CANDIDATE"],"project":["NO_SUCH_PROJECT"],"text":["RESPONSE_NO_TEXT"]}, true), values: { project: PA, text: "our minutes are the adopted text" }, same: sameCode });
});

test("R61 contradiction declares contradictionflag as its owner's op: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "contradictionflag", declaration: DECLARED_OPS["contradictionflag"], call: mk("contradictionflag", {"viewer":"member:m1","author":"member:m1"}, async () => flagWorld()),
    refusedNaming: named({"here":["FLAG_NO_PASSAGE"],"other":["FLAG_NO_PASSAGE"],"reason":["FLAG_NO_REASON"]}, true), values: { here: HERE, other: OTHER, reason: WHY }, same: sameCode });
});
