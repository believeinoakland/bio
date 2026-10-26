/* screens-investigate R8: a standard the city set itself, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { refusedIn } from "../interface-shell/harness.mjs";
import { WORLD_TOKENS } from "../store-request/fixtures.mjs";
import { main, button, fill, press, word, drew, dayOf } from "./fixtures.mjs";
import { inWorld, openAs, settled, readHeld, declareStandard, rewrite } from "./world.mjs";

const REASON = "The passage says so.";
const ORDINANCE = "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.\n\nSection 8.22.020 No landlord shall retaliate against a tenant who complains.";
const POLICY = "The Director shall repair each reported pothole within seven calendar days.\n\nCrews log each pothole they fill.";

/** A project holding an ordinance (no period stated) and a policy (in force from 2023, known in force through 1 October 2026), each declared a standard by the member's own act. */
async function laws(world, me) {
  const project = await world.recipes.project(me, "Pothole repairs");
  const doc = await world.recipes.hold(me, "Ordinance.txt", ORDINANCE, project);
  const memo = await world.recipes.hold(me, "Policy.txt", POLICY, project);
  const du = await readHeld(world, me, doc.sha), mu = await readHeld(world, me, memo.sha);
  const ord = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: doc.sha, extent: du[0].extent });
  const pol = await declareStandard(me, { cite: "Public Works Instruction 9.1", kind: "policy", issuer: "Public Works Department", sha: memo.sha, extent: mu[0].extent, period: { from: "2023-01-01", to: null } });
  /* the member records that the policy is known in force through a day, from the passage checked that day (standardinforcethrough) */
  await me.act("standardinforcethrough", { body: { standard: pol, through: "2026-10-01", source: { captureSha: memo.sha, extent: mu[0].extent }, reason: REASON } });
  return { project, doc, memo, du, mu, ord, pol };
}

test("R8 reads the standard (its words as written, its source passage, its issuer, kind, when in force) and its relations to laws", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const cited = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  await me.act("lawrelate", { body: { type: "implements", from: L.pol, to: L.ord, citation: cited, reason: "The instruction implements the repair ordinance." } });
  const p = await openAs(world, me, "/app/standard/" + L.pol);
  assert.equal(p.byOp("standard")[0].query.id, L.pol);
  assert.equal(p.byOp("lawrelations")[0].query.id, L.pol);
  const held = await me.read("standard", { query: { id: L.pol } });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, held.cite);
  drew(m, "screen.standard.sub", { kind: word("screen.standard.kind." + held.kind), issuer: held.issuer });
  drew(m, "screen.standard.inforce.since", { from: dayOf(held.period.from) });
  assert.ok(m.querySelectorAll("blockquote").some((b) => b.textContent.includes(L.mu[0].text)), "its words as written");
  drew(m, "screen.standard.rel.implements");
  const law = await me.read("standard", { query: { id: L.ord } });
  assert.ok(m.textContent.includes(law.cite), "the related law by its citation (D8)");
  assert.ok(!m.textContent.includes(L.ord), "never by its id");
});

const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);

test("R19 the project's proposals are read from standardproposals (the project, state open by default), each under its state with its label, why and what became of it, each \"not a standard until a member adopts it\"; adopted and all are choices; control: a proposal of another project is not listed", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const proj = "/app/standard/" + L.project;
  const lights = await world.recipes.project(me, "Street lights");
  const text = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  /* the assistant's proposal is a machine credential's own act; a member's is hers */
  const machine = resultOf(await world.door({ url: "/api/?op=standardpropose", init: { method: "POST", headers: { authorization: "Bearer " + WORLD_TOKENS.PROBE_TOKEN, "content-type": "application/json" },
    body: JSON.stringify({ project: L.project, cite: "90% of potholes filled within 72 hours", kind: "policy", issuer: "Public Works", why: "the department's own goal", text: [text] }) } }, null)).proposal;
  assert.equal(machine.machine_work, true, "the store labels it machine work");
  const propose = async (project, cite, why) => (await me.act("standardpropose", { body: { project, cite, kind: "policy", issuer: "Public Works", why, text: [text] } })).proposal;
  const crews = await propose(L.project, "Repair crews log each pothole", "a member's suggestion");
  await propose(lights, "Street lights are checked monthly", "the lighting division's practice");
  await me.act("standardadopt", { body: { proposal: crews.id, reason: "the crews do log them" } });
  const adopted = (await me.read("standardproposals", { query: { project: L.project, state: "adopted" } })).items[0];
  assert.equal(adopted.id, crews.id);
  assert.equal(adopted.adoption.by, "member:" + me.member, "the member's own adoption");
  const p = await openAs(world, me, proj);
  const r = p.byOp("standardproposals");
  assert.deepEqual([r.length, r[0].query.project, r[0].query.state], [1, L.project, "open"]);
  const sec = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  for (const t of [machine.cite, machine.says, machine.why]) assert.ok(sec.textContent.includes(t), t);
  drew(sec, "screen.standard.notyet");
  assert.ok(sec.querySelector('.cs-origin[data-origin="machine"]'), "machine work is marked");
  assert.ok(!sec.textContent.includes(crews.cite), "the adopted one is not under open");
  assert.ok(button(p, "standardadopt", sec), "an open one can be adopted");
  const choices = sec.querySelectorAll("a.cs-btn").map((a) => a.getAttribute("href"));
  assert.deepEqual(choices, [proj, proj + "/adopted", proj + "/all"]);
  const q = await openAs(world, me, proj + "/adopted");
  assert.equal(q.byOp("standardproposals")[0].query.state, "adopted");
  const s2 = main(q).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  assert.ok(s2.textContent.includes(crews.cite));
  assert.ok(!s2.textContent.includes(machine.cite), "an open one is not under adopted");
  drew(s2, "screen.standard.adopted", { by: me.handle, date: dayOf(adopted.adoption.at.slice(0, 10)) });
  assert.equal(button(q, "standardadopt"), null, "an adopted one is not adopted again");
  const all = await openAs(world, me, proj + "/all");
  assert.equal(all.byOp("standardproposals")[0].query.state, "all");
  assert.ok(main(all).textContent.includes(machine.cite) && main(all).textContent.includes(crews.cite), "all lists both");
  assert.ok(main(p).textContent.includes(machine.cite), "the project's own proposal is listed");
  const other = await openAs(world, me, "/app/standard/" + lights);
  const theirs = main(other).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  assert.ok(!theirs.textContent.includes(machine.cite) && !theirs.textContent.includes(crews.cite), "a proposal of another project is not listed");
  assert.ok(theirs.textContent.includes("Street lights are checked monthly"), "control: it is listed on its own project");
});

test("R19 the section is drawn whether or not the assistant is reachable; truncated is said", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const text = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  const mine = (await me.act("standardpropose", { body: { project: L.project, cite: "90% of potholes filled within 72 hours", kind: "policy", issuer: "Public Works", why: "the department's own goal", text: [text] } })).proposal;
  /* the page bound of a long list is far above what a test holds: the world's own answer is marked cut, the one part it does not make here */
  const cut = rewrite(world, me, (req, a) => {
    if (!/op=standardproposals(&|$)/.test(String(req.url))) return a;
    const j = JSON.parse(JSON.stringify(a.json));
    j.result.truncated = true;
    return { ...a, json: j };
  });
  const p = await openAs(world, me, "/app/standard/" + L.project, { plane: { standardproposals: cut } });
  assert.ok(main(p).textContent.includes(mine.cite), "a member's proposal is listed with no assistant reachable");
  drew(main(p), "screen.standard.proposals.more");
  assert.equal(p.byOp("proposals").length, 0, "the old assistant-only read is gone");
});

test("R8 standarddeclare \"Hold this as a standard\" from a passage; standardadopt by the member's own act; lawrelate \"Relate to a law\"", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const cited = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  const p = await openAs(world, me, "/app/standard/" + L.pol);
  fill(p, { "st-type": "implements", "st-to": L.ord, "st-citation": cited });
  await press(p, "lawrelate", { reason: "§3 carries out the ordinance's §2" });
  await settled(p);
  assert.deepEqual(p.byOp("lawrelate")[0].body, { type: "implements", from: L.pol, to: L.ord, citation: cited, reason: "§3 carries out the ordinance's §2" });
  assert.ok(!main(p).querySelector('[data-gap="refused"]'), "the relation is taken");
  assert.equal((await me.read("lawrelations", { query: { id: L.pol } })).referential.filter((r) => !r.withdrawn).length, 1, "the world holds the relation");
  const proposed = (await me.act("standardpropose", { body: { project: L.project, cite: "Budget 2026, performance target 4", kind: "commitment", issuer: "City Council", why: "the budget's own target", text: [cited] } })).proposal.id;
  const q = await openAs(world, me, "/app/standard/" + L.project);
  await press(q, "standardadopt", { reason: "the budget's own target" });
  await settled(q);
  assert.deepEqual(q.byOp("standardadopt")[0].body, { proposal: proposed, reason: "the budget's own target" });
  assert.match(q.location.pathname, /^\/app\/standard\/STD-/);
  const adopted = (await me.read("standard", { query: { id: q.location.pathname.split("/").pop() } }));
  assert.equal(adopted.cite, "Budget 2026, performance target 4", "the world holds the adopted standard");
  const doc = await world.recipes.hold(me, "Budget.txt", "Performance target 4: fill each pothole within seven days.", L.project);
  const bu = await readHeld(world, me, doc.sha);
  fill(p, { "st-cite": "Budget 2026, performance target 5", "st-kind": "commitment", "st-issuer": "City Council", "st-doc": doc.sha, "st-from": "2026-07-01" });
  p.fire(p.doc.getElementById("st-doc"), "change");
  await settled(p);
  await press(p, "standarddeclare", { reason: "the council adopted it" });
  await settled(p);
  const sent = p.byOp("standarddeclare")[0].body;
  assert.deepEqual([sent.cite, sent.kind, sent.issuer, sent.reason, sent.period, sent.text[0].capture_sha], ["Budget 2026, performance target 5", "commitment", "City Council", "the council adopted it", { from: "2026-07-01", to: null }, doc.sha]);
  assert.ok(!main(p).querySelector('[data-gap="refused"]'), "the standard is held");
  assert.match(p.location.pathname, /^\/app\/standard\/STD-/);
  const held = await me.read("standard", { query: { id: p.location.pathname.split("/").pop() } });
  assert.deepEqual([held.cite, held.kind, held.issuer], ["Budget 2026, performance target 5", "commitment", "City Council"], "the world holds it");
});

test("R8 an amendment needs the day it takes effect (control: nothing sent)", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const cited = (await me.read("standard", { query: { id: L.pol } })).texts[0].content_id;
  const p = await openAs(world, me, "/app/standard/" + L.pol);
  fill(p, { "st-type": "amends", "st-to": L.ord, "st-citation": cited });
  await press(p, "lawrelate", { reason: "x" });
  assert.equal(p.byOp("lawrelate").length, 0);
  drew(main(p), "screen.standard.relate.effective");
});

test("R34 the standard's text is a document chosen on screen, never typed content ids; with no document nothing is sent", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const doc = await world.recipes.hold(me, "Ordinance.txt", ORDINANCE, project);
  const memo = await world.recipes.hold(me, "Policy.txt", POLICY, project);
  const du = await readHeld(world, me, doc.sha);
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: doc.sha, extent: du[0].extent });
  const p = await openAs(world, me, "/app/standard/" + std);
  assert.equal(p.doc.getElementById("st-text"), null);
  assert.deepEqual(p.doc.getElementById("st-doc").querySelectorAll("option").filter((o) => o.getAttribute("value") !== "").map((o) => o.textContent.split(" · ")[0]).sort(), ["Ordinance.txt", "Policy.txt"], "by title");
  assert.deepEqual(p.doc.getElementById("st-doc").querySelectorAll("option").map((o) => o.getAttribute("value")).filter(Boolean).sort(), [doc.sha, memo.sha].sort());
  /* control: a member who can read no held document */
  const guest = await world.signIn("guest", { admin: false });
  const none = await openAs(world, guest, "/app/standard/" + std);
  assert.equal(none.doc.getElementById("st-doc"), null);
  fill(none, { "st-cite": "c", "st-issuer": "i" });
  await press(none, "standarddeclare", { reason: "r" });
  assert.equal(none.byOp("standarddeclare").length, 0);
});

/* R51 (T51; DEC-375, C40) */
test("R51 a date sends standardinforce with the declared fields and draws the owner's answer, including not in force; control: no date sends nothing", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const at = "/app/standard/" + L.pol;
  const p = await openAs(world, me, at);
  const sec = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.inforce.heading"));
  assert.ok(sec, "the section is drawn with the standard");
  drew(sec, "screen.standard.inforce.refused.summary");
  assert.ok(sec.textContent.includes(word("screen.standard.inforce.day.label")), "the day field is labelled by its key (B419 2)");
  await press(p, "standardinforce");
  assert.equal(p.byOp("standardinforce").length, 0, "no day, nothing sent");
  const asked = (id, date) => me.read("standardinforce", { query: { id, date } });
  const inside = await asked(L.pol, "2026-06-15");
  assert.equal(inside.state, "in_force", "the world: inside the period");
  fill(p, { "st-inforce-day": "2026-06-15" });
  await press(p, "standardinforce");
  assert.deepEqual(p.byOp("standardinforce")[0].query, { op: "standardinforce", id: L.pol, date: "2026-06-15" }, "the op is the request's; the declared fields are id and date");
  let shown = main(p).querySelector('[data-inforce="in_force"]');
  assert.ok(shown && shown.textContent.includes(inside.why));
  drew(shown, "screen.standard.inforce.result.line", { date: dayOf("2026-06-15"), state: word("screen.standard.inforce.state.in_force") });
  drew(shown.parentElement, "screen.standard.inforce.result.meta", { from: dayOf("2023-01-01") });
  const before = await asked(L.pol, "2022-05-01");
  assert.equal(before.state, "not_in_force", "the world: before the period");
  fill(p, { "st-inforce-day": "2022-05-01" });
  await press(p, "standardinforce");
  shown = main(p).querySelector('[data-inforce="not_in_force"]');
  assert.ok(shown && shown.textContent.includes(before.why), "not in force is drawn with its reason");
  drew(shown, "screen.standard.inforce.result.line", { date: dayOf("2022-05-01"), state: word("screen.standard.inforce.state.not_in_force") });
  assert.equal(main(p).querySelector('[data-inforce="in_force"]'), null);
  const unstated = await asked(L.ord, "2026-06-15");
  assert.equal(unstated.state, "undetermined", "the world: the ordinance states no period");
  const und = await openAs(world, me, "/app/standard/" + L.ord);
  fill(und, { "st-inforce-day": "2026-06-15" });
  await press(und, "standardinforce");
  assert.ok(main(und).querySelector('[data-inforce="undetermined"] .cs-gap'), "undetermined is the gap mark with its reason");
  assert.ok(main(und).querySelector('[data-inforce="undetermined"]').textContent.includes(unstated.why));
  drew(main(und).querySelector('[data-inforce="undetermined"]'), "screen.standard.inforce.result.line", { date: dayOf("2026-06-15"), state: word("screen.standard.inforce.state.undetermined") });
  const bad = await openAs(world, me, at);
  fill(bad, { "st-inforce-day": "2026-02-30" });
  await press(bad, "standardinforce");
  assert.equal(bad.byOp("standardinforce").length, 1);
  assert.ok(main(bad).textContent.includes(word("refusal.STANDARD_DATE_INVALID")), "a refusal of the store beside the act");
  const proj = await openAs(world, me, "/app/standard/" + L.project);
  assert.equal(proj.doc.getElementById("st-inforce-day"), null, "control: a project's page (no standard) asks no date");
});

/* R56, R57 (T51; DEC-384 I-30) */
const crumbs = (p) => main(p).querySelector("nav.cs-crumbs");
test("R56 R57 the path of a standard under a project names the project by its title and the last step says which standard; control: an unreadable project is the unjoined key, never its id", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const title = (/^title: "(.*)"$/m.exec((await me.read("image", { query: { id: L.project } }))["bundle.md"]) || [])[1];
  assert.ok(title, "the world holds the project's title");
  const p = await openAs(world, me, "/app/standard/" + L.project);
  const nav = crumbs(p);
  assert.ok(nav.textContent.includes(title), "the project's title");
  assert.ok(!nav.textContent.includes(L.project), "never the id");
  /* the project's record is unreadable: a fault the test injects on purpose */
  const lost = await openAs(world, me, "/app/standard/" + L.project, { plane: { image: refusedIn("NO_SUCH_BUNDLE", "Not found.") } });
  const nl = crumbs(lost);
  assert.ok(nl.textContent.includes(word("crumb.project.unjoined")), "the unjoined key's word");
  assert.ok(!nl.textContent.includes("PROJ-"), "no PROJ- text");
  assert.ok(nl.textContent.includes(word("screen.standard.name")) || nl.textContent.includes(word("screen.standard.crumb", { name: "x" }).replace("x", "")), "the last step names the standard screen");
});

test("R57 the last step of a standard's own page is screen.standard.crumb with the standard's citation", async () => {
  const { world, me } = await inWorld();
  const L = await laws(world, me);
  const cite = (await me.read("standard", { query: { id: L.pol } })).cite;
  const p = await openAs(world, me, "/app/standard/" + L.pol);
  const nav = crumbs(p);
  assert.ok(nav.textContent.includes(word("screen.standard.crumb", { name: cite })), "Standard: <cite>");
  const onProject = await openAs(world, me, "/app/standard/" + L.project);
  assert.ok(crumbs(onProject).textContent.includes(word("screen.standard.name")), "control: a project's page names no standard, so the last step is the screen's own name");
  assert.ok(!crumbs(onProject).textContent.includes(word("screen.standard.crumb", { name: "" }).trim()), "and not the crumb word");
});
