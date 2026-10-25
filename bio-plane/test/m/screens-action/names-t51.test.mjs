/* screens-action, fix round 10 (diagnosis 11 §7a; K5148; R18): a determination is named by its act (the kind of event, its day and the
   office) and a standard by its citation, never by an id, on the Matter, the Plan and Start and send. The determination, its list and its
   standards are `conformance`'s and `standards`' own, from conformance's published scene (never a hand-written answer). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, text, ok, W, D, DATA_PLANE, PLAN, PREVIEW, PLAN_ID, PROJECT } from "./page.mjs";
import { scene, V } from "../conformance/fixture.mjs";

const IDS = /\b(EVT|CONF|STD|INQ)-\d{4}-/;

function world() {
  const x = scene();
  const made = x.w.c.determine(x.input());
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
  const viewer = V("olive");
  const read = x.w.c.determinationRead({ id: made.id, viewer });
  const list = x.w.c.determinationsFor({ project: x.proj, viewer });
  const stds = x.w.standards.standardsIn({ viewer });
  return { ...x, id: made.id, read, list, stds };
}
const planOf = (x) => ({ ...PLAN, project: x.proj,
  subjects: [{ subject: { kind: "outcome", determination: x.id, standard: x.std }, key: `outcome:${x.id}#${x.std}`, support: "established", why: "determined", liveness: { state: "live" } }],
  options: [{ ...PLAN.options[0], subjects: [`outcome:${x.id}#${x.std}`] }] });
const plane = (x, more = {}) => ({ ...DATA_PLANE, determination: ok(x.read), determinations: ok(x.list), standards: ok(x.stds), list: ok({ bundles: [{ bundle_id: x.proj, object_type: "project", title: "Parks" }], limit: 500, cursor: null, total: 1 }), ...more });

test("R18 (diagnosis 11 §7a): the Matter names the act by the kind of event, its day and the office, and each standard by its citation, never by an id", async () => {
  const x = world();
  assert.match(x.read.act.event, IDS, "the owner answers the event as an id");
  const p = await open(`/app/matter/${x.id}`, plane(x));
  const t = text(p);
  assert.doesNotMatch(t, IDS);
  assert.ok(t.includes(`${x.read.event.kind} · ${D(x.read.act.when.value)}`), "the kind of event and its day");
  assert.ok(t.includes("Director of Parks, Parks Department"), "the office");
  assert.ok(t.includes("Parks Code 12.08.030"), "the standard by its citation");
});

test("R18 (diagnosis 11 §7a): the Plan names a matter by its act (its day and office) and its standard by its citation, and offers them so", async () => {
  const x = world();
  const p = await open(`/app/plan/${PLAN_ID}`, plane(x, { plan: ok(planOf(x)) }));
  const t = text(p);
  assert.doesNotMatch(t, IDS);
  assert.ok(t.includes(`${D(x.read.act.when.value)} · Director of Parks, Parks Department`) && t.includes("Parks Code 12.08.030"));
  // control: a project's second determination's standard is offered by its citation too, and a matter the plan holds is not offered again
  const q = await open(`/app/plan/${PLAN_ID}`, plane(x, { plan: ok({ ...planOf(x), subjects: [] }) }));
  const offered = q.doc.getElementById("plan-subject-id").querySelectorAll("option").map((o) => o.textContent.trim());
  assert.ok(offered.some((o) => o.includes("Parks Code 12.08.030")) && offered.every((o) => !IDS.test(o)), JSON.stringify(offered));
});

test("R18 (diagnosis 11 §7a): Start and send names what the option rests on, a matter by its act and a question by its title, never by id", async () => {
  const x = world();
  const pv = { ...PREVIEW, action: { ...PREVIEW.action, legs: [{ target: x.id, kind: "rests_on", subjects: [
    { subject: { kind: "outcome", determination: x.id, standard: x.std }, support: "established", why: "x" }] }] } };
  const p = await open(`/app/start-send/${PLAN_ID}~opt-1`, plane(x, { plan: ok(planOf(x)), optionstartpreview: ok(pv) }));
  const t = text(p);
  assert.doesNotMatch(t, IDS);
  assert.ok(t.includes(`${D(x.read.act.when.value)} · Director of Parks, Parks Department · Parks Code 12.08.030`));
  assert.ok(t.includes(W("screen.plan.support.established")));
});
