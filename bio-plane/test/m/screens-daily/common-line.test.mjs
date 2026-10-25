/* The common line (R21; K3250, K3254; walk C1, C4, C5; DEC-219 (3)) over the module's real `SCREENS` and the REAL store (store-request's `storeWorld()`, op-tables §5.3: the team, its project, its question, its documents and its members are made by the real acts), served by the shell:
   every class each screen draws is one a served stylesheet defines (interface-shell R56: `civicsmith.css`, `shell.css` and
   the shell's own `STYLE`, as `interface-assets` serves them, with the shell's hook classes, as its own `checkClasses` judges them), every labelled field is the
   kit's, and a screen drawn over an empty fixture shows no empty section and no zero. Beside interface-shell R56's own
   check of the screens' source (`interfacePage` throws), this checks what each screen draws, with data and empty. */
import test from "node:test";
import assert from "node:assert/strict";
import { interfacePage, checkClasses } from "../../../src/interface-shell/index.mjs";
import { storeWorld } from "../store-request/fixtures.mjs";
import { SCREENS, open as openRaw, main, text, ok, refused, word } from "./page.mjs";

// A class the shell's own check (interface-shell R56) accepts: one a served stylesheet defines, or a hook class.
const defined = (c) => { try { return checkClasses([{ id: "probe", render: 'class="' + c + '"' }], null, ""); } catch { return false; } };

/* A team with data: its administrator, the team named, a project of hers with a question, and a document held in it (all by the real acts); and a team with
   nothing: a member who may contribute, no project, no document. The queue of the full team is five items of every kind the queue draws (a finding or a
   condition is raised by no act of the door alone, recipes.queue), the one read the world does not make. */
const FULL_QUEUE = ok({ items: [
  { id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch", assignee: "rosa", due: "2026-10-01", options: [{ id: "cite" }], disposition: { instead: "taskresolve" },
    case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Potholes", depth: 1 }] }, subject: { kind: "bundle", id: "INF-1" } },
  { id: "FINDING::h", class: "FINDING", kind: "tension", summary: "Two dates", hint: { matched: "m", how: "h", false_alarm_rate: 0.1 }, options: [], disposition: {},
    case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Potholes", depth: 1 }] } },
  { id: "FINDING::source-modified::1", class: "FINDING", kind: "source-modified", title: "Lease", subject: { kind: "bundle", id: "INF-2" }, options: [], disposition: {} },
  { id: "OBLIGATION::update-ready::1", class: "OBLIGATION", kind: "update-ready", assignee: "rosa", assignee_role: "admin", detail: { version: "1", date: "2026-10-13", security: true }, options: [{ id: "updatelater" }] },
  { id: "R-1", class: "OBLIGATION", kind: "request-unsent", summary: "Unsent", subject: { kind: "action", id: "ACT-1" }, case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Potholes", depth: 1 }] } },
], item_count: 5 });
const teams = {};
const teamOf = (kind) => (teams[kind] ||= (async () => {
  const w = await storeWorld({ group: null, now: Date.now() });
  if (kind === "empty") return { w, as: await w.signIn("mem", { capabilities: ["contribute"] }) };
  const rosa = await w.signIn("admin");
  await rosa.act("groupnameset", { body: { name: "Lakeshore Tenants" } });
  const project = await w.recipes.project(rosa, "Potholes");
  await w.recipes.question(rosa, project, { title: "Is it fixed?", draw: true });
  await w.recipes.hold(rosa, "Report", "A report on the potholes.", project);
  await w.signIn("dev");
  return { w, as: rosa };
})());
/** Opens `path` as the team `kind` ("full" or "empty") sees it, `over` on top of the world's plane. */
const open = async (path, kind, over = {}) => { const { w, as } = await teamOf(kind); return openRaw(path, { ...(kind === "full" ? { queue: FULL_QUEUE } : {}), ...over }, w.boot(as)); };
const FULL = "full", EMPTY = "empty";
const ROUTES = { home: "/app", elsewhere: "/app/elsewhere", projects: "/app/projects", queue: "/app/queue", finder: "/app/finder/pothole", "find-in": "/app/find-in/PROJ-1", answers: "/app/answers" };

test("R21 (interface-shell R56): the module's real SCREENS compose under the shell's class check, and every class each screen draws, with data and empty, is one a served stylesheet defines", async () => {
  assert.doesNotThrow(() => interfacePage(SCREENS));
  for (const [name, plane] of Object.entries({ full: FULL, empty: EMPTY })) for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, plane);
    for (const el of main(p).querySelectorAll("[class]")) for (const c of el.getAttribute("class").split(/\s+/).filter(Boolean))
      assert.ok(defined(c), `${id} (${name}) draws class "${c}", which no served stylesheet defines`);
  }
  // Control: the check finds a class no stylesheet defines.
  assert.equal(defined("cs-nonesuch"), false);
  assert.equal(defined("mk-door"), true);
});

test("R21: every labelled field is drawn with the kit's field; no screen draws cs-form or a bare label with .help", async () => {
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, FULL);
    assert.ok(!main(p).querySelector(".cs-form"), id);
    for (const label of main(p).querySelectorAll("label")) {
      const holder = label.parentNode;
      if (holder.querySelector(".help")) assert.match(holder.getAttribute("class") || "", /cs-field/, `${id}: a label with help is the kit's field`);
    }
  }
});

/* What a screen draws but for "What this search covered" (R56): that panel is the search's own tally of what it looked in, and on a team holding nothing the
   real search's true tally is "0 of the 0 documents" (the stand-in this test used before answered no tally, so none was drawn). */
const covered = word("screen.finder.covered.heading");
const shown = (p) => main(p).childNodes.filter((n) => !(n.localName === "section" && n.querySelector("h2") && n.querySelector("h2").textContent === covered))
  .map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();

test("R21 (DEC-219 (3)): each screen drawn over an empty fixture shows no empty section and no zero; a screen with nothing to show draws its one designed empty state", async () => {
  const ZERO = /(^|[^\d.,$])0 [a-z]|· 0\b/i;
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, EMPTY);
    for (const s of main(p).querySelectorAll("section")) {
      const inner = s.childNodes.filter((n) => n.localName !== "h2");
      assert.ok(text(p, s) !== (s.querySelector("h2") ? text(p, s.querySelector("h2")) : ""), `${id}: a section holding nothing is not drawn`);
      assert.ok(inner.length, `${id}: an empty section`);
    }
    assert.doesNotMatch(shown(p), ZERO, `${id} draws a zero`);
  }
  assert.ok(text(await open("/app/queue", EMPTY)).includes(word("screen.queue.empty")), "the queue's designed empty state");
  assert.ok(text(await open("/app/projects", EMPTY)).includes(word("projects.empty.sub")), "Projects' designed empty state names the first step");
  const finder = await open("/app/finder/pothole", EMPTY);
  assert.ok(!main(finder).querySelector(".cs-hold"), "finder draws no empty hold tray");
});

test("R21: control: a read that failed is still drawn failed (interface-shell R10)", async () => {
  const FAIL = refused("STORE_DID_NOT_ANSWER", null, 502);
  for (const [path, over] of [["/app", { queue: FAIL }], ["/app/projects", { projectlist: FAIL }], ["/app/queue", { queue: FAIL }],
    ["/app/elsewhere", { startfrom: FAIL }], ["/app/finder/pothole", { search: FAIL }]]) {
    const p = await open(path, EMPTY, over);
    assert.ok(main(p).querySelector('[data-state="failed"]'), path);
  }
});
