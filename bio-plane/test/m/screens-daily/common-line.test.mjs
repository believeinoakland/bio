/* The common line (R21; K3250, K3254; walk C1, C4, C5; DEC-219 (3)) over the module's real `SCREENS`, served by the shell:
   every class each screen draws is one a served stylesheet defines (interface-shell R56: `civicsmith.css`, `shell.css` and
   the shell's own `STYLE`, as `interface-assets` serves them, with the shell's hook classes, as its own `checkClasses` judges them), every labelled field is the
   kit's, and a screen drawn over an empty fixture shows no empty section and no zero. Beside interface-shell R56's own
   check of the screens' source (`interfacePage` throws), this checks what each screen draws, with data and empty. */
import test from "node:test";
import assert from "node:assert/strict";
import { interfacePage, checkClasses } from "../../../src/interface-shell/index.mjs";
import { SCREENS, open, main, text, ok, refused, MEMBER } from "./page.mjs";
import { ADMIN } from "../interface-shell/harness.mjs";

// A class the shell's own check (interface-shell R56) accepts: one a served stylesheet defines, or a hook class.
const defined = (c) => { try { return checkClasses([{ id: "probe", render: 'class="' + c + '"' }], null, ""); } catch { return false; } };

const SINCE = ok({ since: "2026-10-01T00:00:00Z" });
const FULL = {
  groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents." }),
  queue: ok({ items: [
    { id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch", assignee: "rosa", due: "2026-10-01", options: [{ id: "cite" }], disposition: { instead: "taskresolve" },
      case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Potholes", depth: 1 }] }, subject: { kind: "bundle", id: "INF-1" } },
    { id: "FINDING::h", class: "FINDING", kind: "tension", summary: "Two dates", hint: { matched: "m", how: "h", false_alarm_rate: 0.1 }, options: [], disposition: {},
      case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Potholes", depth: 1 }] } },
    { id: "FINDING::source-modified::1", class: "FINDING", kind: "source-modified", title: "Lease", subject: { kind: "bundle", id: "INF-2" }, options: [], disposition: {} },
    { id: "OBLIGATION::update-ready::1", class: "OBLIGATION", kind: "update-ready", assignee: "rosa", assignee_role: "admin", detail: { version: "1", date: "2026-10-13", security: true }, options: [{ id: "updatelater" }] },
    { id: "R-1", class: "OBLIGATION", kind: "request-unsent", summary: "Unsent", subject: { kind: "action", id: "ACT-1" }, case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Potholes", depth: 1 }] } },
  ], item_count: 5 }),
  projectlist: ok({ ok: true, truncated: true, projects: [{ id: "PROJ-1", name: "Potholes", stage: "forming", owner: { member: "M", handle: "rosa" }, members: [{ handle: "rosa" }],
    activity: [1, 0, 0, 2, 0, 1, 3, 1], lastChange: "2026-10-12T10:00:00Z" }] }),
  projectquestions: ok({ ok: true, items: [{ inquiry: "Q" }], cursor: null }),
  startfrom: ok({ ok: true, scripts: [{ id: "WIZ-1", version: 1, name: "Check" }], doors: [{ door: "problem", scripts: ["WIZ-1"] }, { door: "elsewhere", scripts: [], opens: "elsewhere" }],
    routes: [{ route: "elsewhere", pointer: { places: ["P"], pointers: [{ kind: "service", name: "311", does: "Fixes.", contacts: [{ how: "web", value: "example.org" }], source: "s", basis: "2026-10-02" }] } }] }),
  lookedsince: SINCE,
  memberlist: ok({ members: [{ handle: "rosa", role: "admin", status: "active" }, { handle: "dev", role: "member", status: "active" }] }),
  profiles: ok({ ok: true, profiles: [{ id: "p", name: "P" }] }),
  grouplanguages: ok({ languages: ["en"] }),
  aiuseovertime: ok({ owner: "group", periods: [{ unit: "usd", period: "month", used: 3, limit: null }] }),
  search: ok({ total: 1, hits: [{ bundle_id: "INF-1", title: "Report", grade: "A", snippet: "s" }] }),
  whoami: ok({ ...ADMIN, capabilities: ["contribute", "create_projects"] }),
};
const EMPTY = {
  groupidentity: ok({ ok: true, display_name: "Lakeshore Tenants" }), queue: ok({ items: [], item_count: 0 }), projectlist: ok({ ok: true, projects: [] }),
  projectquestions: ok({ ok: true, items: [], cursor: null }), startfrom: ok({ ok: true, scripts: [], doors: [], routes: [{ route: "elsewhere", pointer: { places: [], pointers: [] } }] }),
  lookedsince: SINCE, search: ok({ hits: [], total: 0 }), selection: ok({ n: 0 }), whoami: ok({ ...MEMBER, capabilities: ["contribute"] }),
};
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

test("R21 (DEC-219 (3)): each screen drawn over an empty fixture shows no empty section and no zero; a screen with nothing to show draws its one designed empty state", async () => {
  const ZERO = /(^|[^\d.,$])0 (questions?|items?|documents?|results?|need|to do|members?|places?|projects?)\b|· 0\b/;
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, EMPTY);
    for (const s of main(p).querySelectorAll("section")) {
      const inner = s.childNodes.filter((n) => n.localName !== "h2");
      assert.ok(text(p, s) !== (s.querySelector("h2") ? text(p, s.querySelector("h2")) : ""), `${id}: a section holding nothing is not drawn`);
      assert.ok(inner.length, `${id}: an empty section`);
    }
    assert.doesNotMatch(text(p), ZERO, `${id} draws a zero`);
  }
  assert.match(text(await open("/app/queue", EMPTY)), /You are up to date/, "the queue's designed empty state");
  assert.match(text(await open("/app/projects", EMPTY)), /No projects yet\. “Start a project” opens the first\./, "Projects' designed empty state names the first step");
  const finder = await open("/app/finder/pothole", EMPTY);
  assert.ok(!main(finder).querySelector(".cs-hold"), "finder draws no empty hold tray");
});

test("R21: control: a read that failed is still drawn failed (interface-shell R10)", async () => {
  const FAIL = refused("STORE_DID_NOT_ANSWER", null, 502);
  for (const [path, plane] of [["/app", { ...EMPTY, queue: FAIL }], ["/app/projects", { ...EMPTY, projectlist: FAIL }], ["/app/queue", { ...EMPTY, queue: FAIL }],
    ["/app/elsewhere", { ...EMPTY, startfrom: FAIL }], ["/app/finder/pothole", { ...EMPTY, search: FAIL }]]) {
    const p = await open(path, plane);
    assert.ok(main(p).querySelector('[data-state="failed"]'), path);
  }
});
