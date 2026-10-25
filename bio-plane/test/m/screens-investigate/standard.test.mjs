/* screens-investigate R8: a standard the city set itself, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, plane, STD, P, SHA, STD_PROPOSALS, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const at = "/app/standard/" + STD;
const reachable = (o = {}) => ({ boot: { plane: { ...plane(o), assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } } });

test("R8 reads the standard (its words as written, its source passage, its issuer, kind, when in force) and its relations to laws", async () => {
  const p = await open(at);
  assert.equal(p.byOp("standard")[0].query.id, STD);
  assert.equal(p.byOp("lawrelations")[0].query.id, STD);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Administrative Instruction 9.1, §2");
  drew(m, "screen.standard.sub", { kind: word("screen.standard.kind.policy"), issuer: "Public Works" });
  drew(m, "screen.standard.inforce.since", { from: dayOf("2023-01-01") });
  assert.match(m.querySelector("blockquote").textContent, /within seven calendar days of the report/);
  drew(m, "screen.standard.rel.implements");
  assert.ok(m.textContent.includes("Municipal Code §12.04"), "the related law by its citation (D8)");
  assert.ok(!m.textContent.includes("STD-2026-0001-ordinance"), "never by its id");
});

const proj = "/app/standard/" + P;

test("R19 the project's proposals are read from standardproposals (the project, state open by default), each under its state with its label, why and what became of it, each \"not a standard until a member adopts it\"; adopted and all are choices; control: a proposal of another project is not listed", async () => {
  const p = await open(proj);
  const r = p.byOp("standardproposals");
  assert.deepEqual([r.length, r[0].query.project, r[0].query.state], [1, P, "open"]);
  const sec = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  for (const t of ["90% of potholes filled within 72 hours", "Proposed by the assistant: machine work", "the department's own goal"]) assert.ok(sec.textContent.includes(t), t);
  drew(sec, "screen.standard.notyet");
  assert.ok(sec.querySelector('.cs-origin[data-origin="machine"]'), "machine work is marked");
  assert.ok(!sec.textContent.includes("Repair crews log each pothole"), "the adopted one is not under open");
  assert.ok(button(p, "standardadopt", sec), "an open one can be adopted");
  const choices = sec.querySelectorAll("a.cs-btn").map((a) => a.getAttribute("href"));
  assert.deepEqual(choices, [proj, proj + "/adopted", proj + "/all"]);
  const q = await open(proj + "/adopted");
  assert.equal(q.byOp("standardproposals")[0].query.state, "adopted");
  const s2 = main(q).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  assert.ok(s2.textContent.includes("Repair crews log each pothole"));
  drew(s2, "screen.standard.adopted", { by: "dev", date: dayOf("2026-10-06") });
  assert.equal(button(q, "standardadopt"), null, "an adopted one is not adopted again");
  const all = await open(proj + "/all");
  assert.equal(all.byOp("standardproposals")[0].query.state, "all");
  const other = await open(proj, { plane: { standardproposals: ok({ ok: true, project: P, state: "open", items: [], truncated: false }) } });
  assert.ok(!main(other).textContent.includes("90% of potholes"), "a proposal the read does not answer for this project is not listed");
});

test("R19 the section is drawn whether or not the assistant is reachable; truncated is said", async () => {
  const p = await open(proj, { plane: { standardproposals: ok({ ...STD_PROPOSALS({ project: P }), truncated: true }) } });
  assert.ok(main(p).textContent.includes("90% of potholes filled within 72 hours"));
  drew(main(p), "screen.standard.proposals.more");
  assert.equal(p.byOp("proposals").length, 0, "the old assistant-only read is gone");
});

test("R8 standarddeclare \"Hold this as a standard\" from a passage; standardadopt by the member's own act; lawrelate \"Relate to a law\"", async () => {
  const p = await open(at, reachable({ plane: { standarddeclare: ok({ ok: true, id: "STD-2026-0009-policy" }), standardadopt: ok({ ok: true, id: "STD-2026-0010-policy" }), lawrelate: ok({ ok: true }) } }));
  fill(p, { "st-type": "implements", "st-to": "STD-2026-0001-ordinance", "st-citation": "CNT-2026-0001" });
  await press(p, "lawrelate", { reason: "§3 carries out the ordinance's §2" });
  assert.deepEqual(p.byOp("lawrelate")[0].body, { type: "implements", from: STD, to: "STD-2026-0001-ordinance", citation: "CNT-2026-0001", reason: "§3 carries out the ordinance's §2" });
  const q = await open(proj, { plane: { standardadopt: ok({ ok: true, id: "STD-2026-0010-policy" }) } });
  await press(q, "standardadopt", { reason: "the budget's own target" });
  assert.deepEqual(q.byOp("standardadopt")[0].body, { proposal: "STDP-2026-0001", reason: "the budget's own target" });
  assert.equal(q.location.pathname, "/app/standard/STD-2026-0010-policy");
  fill(p, { "st-cite": "Budget 2026, performance target 4", "st-kind": "commitment", "st-issuer": "City Council", "st-doc": SHA, "st-from": "2026-07-01" });
  await press(p, "standarddeclare", { reason: "the council adopted it" });
  assert.deepEqual(p.byOp("standarddeclare")[0].body, { cite: "Budget 2026, performance target 4", kind: "commitment", issuer: "City Council", text: [{ capture_sha: SHA, extent: { kind: "document" } }], period: { from: "2026-07-01", to: null }, reason: "the council adopted it" });
});

test("R8 an amendment needs the day it takes effect (control: nothing sent)", async () => {
  const p = await open(at);
  fill(p, { "st-type": "amends", "st-to": "STD-2026-0001-ordinance", "st-citation": "CNT-2026-0001" });
  await press(p, "lawrelate", { reason: "x" });
  assert.equal(p.byOp("lawrelate").length, 0);
  drew(main(p), "screen.standard.relate.effective");
});

test("R34 the standard's text is a document chosen on screen, never typed content ids; with no document nothing is sent", async () => {
  const p = await open("/app/standard/" + STD);
  assert.equal(p.doc.getElementById("st-text"), null);
  assert.deepEqual(p.doc.getElementById("st-doc").querySelectorAll("option").map((o) => o.textContent), ["Lease amendment 1", "Rent schedule"]);
  const none = await open("/app/standard/" + STD, { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  fill(none, { "st-cite": "c", "st-issuer": "i" });
  await press(none, "standarddeclare", { reason: "r" });
  assert.equal(none.byOp("standarddeclare").length, 0);
});

/* R51 (T51; DEC-375, C40) */
test("R51 a date sends standardinforce with the declared fields and draws the owner's answer, including not in force; control: no date sends nothing", async () => {
  const inForce = (r) => ok({ ok: true, id: STD, date: r.query.date, state: r.query.date < "2023-01-01" ? "not_in_force" : "in_force",
    why: r.query.date < "2023-01-01" ? "the period starts after that day" : "that day lies within the period" });
  const p = await open(at, { plane: { standardinforce: inForce } });
  const sec = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.inforce.heading"));
  assert.ok(sec, "the section is drawn with the standard");
  drew(sec, "screen.standard.inforce.refused.summary");
  assert.ok(sec.textContent.includes(word("screen.standard.inforce.day.label")), "the day field is labelled by its key (B419 2)");
  await press(p, "standardinforce");
  assert.equal(p.byOp("standardinforce").length, 0, "no day, nothing sent");
  fill(p, { "st-inforce-day": "2026-10-08" });
  await press(p, "standardinforce");
  assert.deepEqual(p.byOp("standardinforce")[0].query, { op: "standardinforce", id: STD, date: "2026-10-08" }, "the op is the request's; the declared fields are id and date");
  let shown = main(p).querySelector('[data-inforce="in_force"]');
  assert.ok(shown && shown.textContent.includes("that day lies within the period"));
  drew(shown, "screen.standard.inforce.result.line", { date: dayOf("2026-10-08"), state: word("screen.standard.inforce.state.in_force") });
  drew(shown.parentElement, "screen.standard.inforce.result.meta", { from: dayOf("2023-01-01") });
  fill(p, { "st-inforce-day": "2022-05-01" });
  await press(p, "standardinforce");
  shown = main(p).querySelector('[data-inforce="not_in_force"]');
  assert.ok(shown && shown.textContent.includes("the period starts after that day"), "not in force is drawn with its reason");
  drew(shown, "screen.standard.inforce.result.line", { date: dayOf("2022-05-01"), state: word("screen.standard.inforce.state.not_in_force") });
  assert.equal(main(p).querySelector('[data-inforce="in_force"]'), null);
  const und = await open(at, { plane: { standardinforce: ok({ ok: true, id: STD, date: "2026-10-08", state: "undetermined", why: "the standard states no period" }) } });
  fill(und, { "st-inforce-day": "2026-10-08" });
  await press(und, "standardinforce");
  assert.ok(main(und).querySelector('[data-inforce="undetermined"] .cs-gap'), "undetermined is the gap mark with its reason");
  drew(main(und).querySelector('[data-inforce="undetermined"]'), "screen.standard.inforce.result.line", { date: dayOf("2026-10-08"), state: word("screen.standard.inforce.state.undetermined") });
  const bad = await open(at, { plane: { standardinforce: refusedIn("DATE_INVALID", "That day does not exist.") } });
  fill(bad, { "st-inforce-day": "2026-02-30" });
  await press(bad, "standardinforce");
  assert.equal(bad.byOp("standardinforce").length, 1);
  assert.ok(main(bad).textContent.includes("That day does not exist.") || main(bad).textContent.includes(word("refusal.DATE_INVALID")), "a refusal beside the act");
  const proj = await open("/app/standard/" + P);
  assert.equal(proj.doc.getElementById("st-inforce-day"), null, "control: a project's page (no standard) asks no date");
});

/* R56, R57 (T51; DEC-384 I-30) */
const crumbs = (p) => main(p).querySelector("nav.cs-crumbs");
test("R56 R57 the path of a standard under a project names the project by its title and the last step says which standard; control: an unreadable project is the unjoined key, never its id", async () => {
  const p = await open("/app/standard/" + P);
  const nav = crumbs(p);
  assert.ok(nav.textContent.includes("Pothole repairs"), "the project's title");
  assert.ok(!nav.textContent.includes(P), "never the id");
  const lost = await open("/app/standard/" + P, { plane: { image: refusedIn("NO_SUCH_BUNDLE", "Not found.") } });
  const nl = crumbs(lost);
  assert.ok(nl.textContent.includes(word("crumb.project.unjoined")), "the unjoined key's word");
  assert.ok(!nl.textContent.includes("PROJ-"), "no PROJ- text");
  assert.ok(nl.textContent.includes(word("screen.standard.name")) || nl.textContent.includes(word("screen.standard.crumb", { name: "x" }).replace("x", "")), "the last step names the standard screen");
});

test("R57 the last step of a standard's own page is screen.standard.crumb with the standard's citation", async () => {
  const p = await open(at);
  const nav = crumbs(p);
  assert.ok(nav.textContent.includes(word("screen.standard.crumb", { name: "Administrative Instruction 9.1, §2" })), "Standard: <cite>");
  const onProject = await open("/app/standard/" + P);
  assert.ok(crumbs(onProject).textContent.includes(word("screen.standard.name")), "control: a project's page names no standard, so the last step is the screen's own name");
  assert.ok(!crumbs(onProject).textContent.includes(word("screen.standard.crumb", { name: "" }).trim()), "and not the crumb word");
});
