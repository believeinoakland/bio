/* screens-action R25 (T51-122; DEC-329 (6); N1237): `plan` opened on a project draws its one live plan, its plans, or where one is started. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ok, W, D, DATA_PLANE, ROUTES, PLAN, PLAN_ID, PROJECT } from "./page.mjs";

const row = (id, title, state, at, by = "member:dev") => ({ id, project: PROJECT, title, state, opened_by: by, opened_at: at, subjects: [] });
const LIST = (items) => ({ ...DATA_PLANE, plans: ok({ ok: true, items, truncated: false, cursor: null, limit: 200 }) });
const PATH = `/app/plan/${PROJECT}`;
const links = (p) => main(p).querySelectorAll("a.cs-ref").map((a) => [a.getAttribute("href"), a.textContent.trim()]).filter(([h]) => h.startsWith("/app/plan/"));

test("R25: a project with one open plan opens that plan at once, with no list; the read is `plans` for the project", async () => {
  const p = await open(PATH, LIST([row(PLAN_ID, "Repairs: closed is not repaired", "open", "2026-10-03T10:00:00Z"), row("PLN-2026-9-plan", "Last year's list", "closed", "2026-08-02T10:00:00Z")]));
  assert.equal(p.byOp("plans")[0].query.project, PROJECT);
  await p.clock.tick(5);
  assert.equal(p.location.pathname, `/app/plan/${PLAN_ID}`, "the one live plan");
  assert.equal(main(p).querySelector("h1").textContent, PLAN.title, "R1's page");
  assert.equal(links(p).length, 0, "no list");
});

test("R25: several live plans, or only closed ones, are listed: live first (open, paused), newest first, then closed; each row a reference with its state and who opened it", async () => {
  const items = [row("PLN-2026-c-plan", "Last year's resurfacing list", "closed", "2026-08-02T10:00:00Z"), row("PLN-2026-a-plan", "Repairs: closed is not repaired", "open", "2026-10-03T10:00:00Z"),
    row("PLN-2026-b-plan", "Response times by district", "paused", "2026-09-28T10:00:00Z", "member:ana")];
  const p = await open(PATH, LIST(items));
  assert.equal(p.location.pathname, PATH, "several live plans: nothing opens");
  assert.deepEqual(links(p).map(([h]) => h), ["/app/plan/PLN-2026-a-plan", "/app/plan/PLN-2026-b-plan", "/app/plan/PLN-2026-c-plan"]);
  const t = text(p);
  assert.ok(t.includes(W("screen.plan.list.title")) && t.includes(W("screen.plan.list")), "the heading and the section");
  assert.ok(t.includes(W("screen.plan.state.open")) && t.includes(W("screen.plan.state.paused")) && t.includes(W("screen.plan.state.closed")));
  assert.ok(t.includes(W("screen.plan.opened", { date: D("2026-09-28"), name: "ana" })), "the opener's handle");
  const only = await open(PATH, LIST([row("PLN-2026-c-plan", "Last year's resurfacing list", "closed", "2026-08-02T10:00:00Z")]));
  assert.equal(only.location.pathname, PATH, "only closed: listed, never opened");
  assert.deepEqual(links(only).map(([h]) => h), ["/app/plan/PLN-2026-c-plan"]);
});

test("R25: a project with no plan says where one is started, with no list and no empty heading; a failed read is drawn failed, never as no plan", async () => {
  const p = await open(PATH, LIST([]));
  assert.ok(text(p).includes(W("screen.plan.none")));
  assert.equal(main(p).querySelectorAll("section.cs-section").length, 0, "no empty heading");
  assert.equal(links(p).length, 0);
  const f = await open(PATH, { ...DATA_PLANE, plans: { status: 502, text: "boom" } });
  assert.ok(main(f).querySelector('[data-state="failed"]'));
  assert.ok(!text(f).includes(W("screen.plan.none")), "control: never drawn as no plan");
});

test("R25: control: a plan id as the subject opens that plan as before; the back step lists the project's plans instead of opening it again", async () => {
  const p = await open(ROUTES.plan, DATA_PLANE);
  assert.equal(p.byOp("plans").length, 0, "a plan's id reads the plan, not the project's plans");
  assert.equal(main(p).querySelector("h1").textContent, PLAN.title);
  const q = await open(PATH, LIST([row(PLAN_ID, "Repairs: closed is not repaired", "open", "2026-10-03T10:00:00Z")]));
  await q.clock.tick(5);
  assert.equal(q.location.pathname, `/app/plan/${PLAN_ID}`);
  await q.back(PATH);
  assert.deepEqual(links(q).map(([h]) => h), [`/app/plan/${PLAN_ID}`], "coming back lists the plan instead of opening it again");
});
