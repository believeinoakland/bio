/* wizard-scripts: the registry form the assistant reads (R21), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, restart, V, MACHINE, STEPS, step, SCREENS, LIBRARY, OFFERED_TEMPLATE } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), F = V("frank"), E = V("erin"), D = V("dave"), C = V("carol");
const VIEWERS = [A, F, E, D, C, MACHINE, "admin", "nobody", null];
const kindOf = (d) => (d === undefined || d === null ? undefined : Object.keys(d)[0]);
/* What R11 answers on one screen, in R21's form: each script's own fields, its steps with a draft named by kind only. */
const asR11 = (x, screen, viewer) => x.wizardsAt({ screen, viewer }).scripts.map((s) => ({
  id: s.id, version: s.version, name: s.name, start: screen,
  steps: s.steps.map((t) => ({ screen: t.screen, act: t.act, what: t.what, why: t.why, via: t.via ?? null, ...(t.draft ? { draft: kindOf(t.draft) } : {}) })),
  origin: LIBRARY.some((l) => l.id === s.id) ? "civicsmith" : "group", based_on: null, ...(s.draft ? { draft: true } : {}) }));

/* A world with every case R11 distinguishes: offered scripts of P (one with each draft kind), of Q, a group-wide one,
   the library's, a submitted, a withdrawn and a retired version, an updated version, a broken one, and drafts of
   several authors. */
function rich() {
  const w = seeded();
  const drafts = approved(w, { name: "Drafts of each kind", steps: [
    step("case-home", "casenote", { draft: { text: "Our own words, never shown" } }),
    step("filing-draft", "filingsave", { draft: { template: OFFERED_TEMPLATE } }),
    step("publish", "publish", { draft: { machine: "whatchangedpropose" } })] });
  const onFiling = approved(w, { name: "On filing", steps: [step("filing-draft", "filingsave"), step("case-home", "casenote")] });
  const old = approved(w, { name: "Updated" });
  const n2 = w.wz.wizardDraft({ from: old.version, author: F, viewer: F });
  w.wz.wizardRevise({ version: n2.version, steps: [STEPS[1], STEPS[0]], author: F, viewer: F });
  w.wz.wizardSubmit({ version: n2.version, author: F, viewer: F });
  w.wz.wizardApprove({ version: n2.version, by: A, viewer: A });
  const wide = approved(w, { name: "Group-wide" });
  w.wz.wizardApprove({ version: wide.version, widen: true, by: E, viewer: E });
  const retired = approved(w, { name: "Retired" });
  w.wz.wizardRetire({ script: retired.script, reason: "old", by: A, viewer: A });
  const sub = draft(w, { name: "Submitted" }); w.wz.wizardSubmit({ version: sub.version, author: F, viewer: F });
  const gone = draft(w, { name: "Withdrawn" }); w.wz.wizardRetire({ version: gone.version, reason: "r", by: F, viewer: F });
  const mine = draft(w, { name: "Frank's draft", steps: [step("publish", "publish", { draft: { machine: "whatchangedpropose" } }), STEPS[0]] });
  const alices = draft(w, { who: "alice", name: "Alice's draft" });
  const qs = draft(w, { who: "dave", name: "Q's", project: w.Q });
  return { w, drafts, onFiling, old, n2, wide, retired, sub, gone, mine, alices, qs };
}

test("R21 wizardRegistry answers every registered screen and, for each, exactly the scripts R11 answers to that viewer on it, each {id, version, name, start, steps: [{screen, act, what, why, via}], origin, based_on}, the viewer's own drafts marked draft: true, for every viewer", () => {
  const x = rich();
  const { w } = x;
  for (const viewer of VIEWERS) {
    const r = w.wz.wizardRegistry({ viewer });
    assert.deepEqual([r.ok, r.registered], [true, true], String(viewer));
    assert.deepEqual(r.screens.map((s) => [s.id, s.acts]), SCREENS.map((s) => [s.id, [...s.acts]]), "every registered screen, with its acts");
    for (const s of r.screens) assert.deepEqual(s.scripts, asR11(w.wz, s.id, viewer), `${viewer} on ${s.id}`);
  }
  /* the sets are the ones R11 distinguishes (a control on asR11 itself) */
  const on = (viewer, screen) => w.wz.wizardRegistry({ viewer }).screens.find((s) => s.id === screen).scripts.map((s) => s.version);
  const home = on(F, "case-home");
  for (const v of [`${LIBRARY[0].id}@2`, x.drafts.version, x.wide.version]) assert.ok(home.includes(v), v);
  for (const v of [x.old.version, x.retired.version, x.sub.version, x.gone.version, x.alices.version, x.onFiling.version])
    assert.ok(!home.includes(v), `not offered on case-home: ${v}`);
  assert.ok(on(F, "filing-draft").includes(x.n2.version) && on(F, "filing-draft").includes(x.onFiling.version));
  assert.ok(on(F, "publish").includes(x.mine.version) && on(F, "publish").includes(`${LIBRARY[1].id}@1`));
  assert.ok(!on(A, "publish").includes(x.mine.version), "another's draft is not offered");
  assert.ok(on(A, "case-home").includes(x.alices.version), "alice's own draft");
  assert.deepEqual(on(D, "case-home").sort(), [`${LIBRARY[0].id}@2`, x.wide.version, x.qs.version].sort(),
                   "dave cannot see P: the library's, the group-wide one and his own draft in Q");
  assert.ok(!on(F, "case-home").includes(x.qs.version), "Q's draft is dave's alone");
  assert.deepEqual(w.wz.wizardRegistry({ viewer: "nobody" }).screens.flatMap((s) => s.scripts), [], "a viewer the rule admits to nothing");
  /* the shape of one entry */
  const mine = w.wz.wizardRegistry({ viewer: F }).screens.find((s) => s.id === "publish").scripts.find((s) => s.version === x.mine.version);
  assert.deepEqual(Object.keys(mine).sort(), ["based_on", "draft", "id", "name", "origin", "start", "steps", "version"]);
  assert.deepEqual([mine.id, mine.name, mine.start, mine.origin, mine.draft], [x.mine.script, "Frank's draft", "publish", "group", true]);
  const lib = w.wz.wizardRegistry({ viewer: F }).screens.find((s) => s.id === "case-home").scripts.find((s) => s.id === LIBRARY[0].id);
  assert.deepEqual([lib.origin, lib.version, lib.name, "draft" in lib], ["civicsmith", `${LIBRARY[0].id}@2`, "Start a case", false]);
  assert.deepEqual(lib.steps, LIBRARY[0].steps.map((s) => ({ screen: s.screen, act: s.act, what: s.what, why: s.why, via: null })));
  assert.equal(lib.based_on, null);
});

test("R21 a step's draft is named by its kind only, never its text, its template or its op; a step with no draft carries no draft key", () => {
  const { w, drafts } = rich();
  const r = w.wz.wizardRegistry({ viewer: F });
  const e = r.screens.find((s) => s.id === "case-home").scripts.find((s) => s.version === drafts.version);
  assert.deepEqual(e.steps.map((s) => s.draft), ["text", "template", "machine"]);
  for (const s of e.steps) assert.deepEqual(Object.keys(s).sort(), ["act", "draft", "screen", "via", "what", "why"]);
  const plain = r.screens.find((s) => s.id === "case-home").scripts.find((s) => s.id === LIBRARY[0].id);
  for (const s of plain.steps) assert.equal("draft" in s, false);
  const scripts = (x) => JSON.stringify(x.screens.map((sc) => sc.scripts));   /* the screens' acts name ops by right */
  const text = scripts(w.wz.wizardRegistry({ viewer: E })) + scripts(r);
  for (const leak of ["Our own words", OFFERED_TEMPLATE, "whatchangedpropose"]) assert.ok(!text.includes(leak), leak);
  assert.ok(JSON.stringify(w.wz.wizardsAt({ screen: "case-home", viewer: F })).includes("Our own words"), "control: R11 itself carries the text");
});

test("R21 before registration the registry answers registered: false with no screens; a broken script is withheld as R11 withholds it", () => {
  const w0 = seeded({ register: false });
  assert.deepEqual(w0.wz.wizardRegistry({ viewer: F }), { ok: true, registered: false, screens: [] });
  /* a registry without the filing screen: the scripts that walk through it are broken and named nowhere */
  const { w, drafts, onFiling } = rich();
  const gone = restart(w, { screens: SCREENS.filter((s) => s.id !== "filing-draft") });
  assert.ok(gone.registered.broken.includes(drafts.version));
  const r = gone.wizardRegistry({ viewer: F });
  assert.deepEqual(r.screens.map((s) => s.id), ["case-home", "publish"]);
  const named = r.screens.flatMap((s) => s.scripts.map((x) => x.version));
  for (const v of [drafts.version, onFiling.version]) assert.ok(!named.includes(v), v);
  for (const s of r.screens) assert.deepEqual(s.scripts, asR11(gone, s.id, F), s.id);
});

test("R21 needs no AI credential and no key, runs nothing, records no use and writes nothing; it is in-process, not an op", () => {
  const { w } = rich();
  const before = w.snapshot();
  const tallies = w.count("wiz_tallies");
  for (const viewer of VIEWERS) assert.equal(w.wz.wizardRegistry({ viewer }).ok, true);
  assert.equal(w.wz.wizardRegistry().ok, true, "no argument at all");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.count("wiz_tallies"), tallies, "no use recorded");
  assert.equal("wizardregistry" in wz.wizardScriptsOps(w.wz, new URL("https://x/?viewer=member%3Afrank"), {}), false);
});
