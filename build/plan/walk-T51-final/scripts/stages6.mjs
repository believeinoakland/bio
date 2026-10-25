/* stages 11-12 of sitting 03: the phone, dark mode and the overlay's rows */
import { rec, shot, stSummary, counts } from "./lib.mjs";
import { overlay, has } from "./walk03.mjs";
const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");
const alerts = async (s) => clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 300);

export async function s10(c) {
  /* the phone at 390 px: each screen of this sitting */
  const set = [["f", "/app/home", "home"], ["f", "/app/queue", "queue"], ["f", "/app/queue/choose", "queue-choose"], ["f", "/app/projects", "projects"], ["f", "/app/project/" + c.P.p2, "project"],
    ["f", "/app/objective/" + c.P.p2, "objective"], ["f", "/app/theme", "themes"], ["f", "/app/theme/" + c.P.theme, "theme"], ["f", "/app/dash-project/" + c.P.p2, "dash-project"], ["f", "/app/dash-action", "dash-action"],
    ["f", "/app/projectai/" + c.P.p2, "projectai"], ["mai", "/app/home", "home (member)"], ["mai", "/app/queue", "queue (member)"], ["mai", "/app/projects", "projects (member)"]];
  const out = [];
  for (const [who, path, name] of set) {
    const s = await c.go(who, path, { width: 390, ms: 1500 });
    if (name === "project") await s.page.evaluate(() => { const d = document.querySelector("details[data-fold=settings]"); if (d) d.open = true; });
    const o = await overlay(c, s, name + " @390");
    const small = await s.page.evaluate(() => [...document.querySelectorAll("#cs-main button, #cs-main a.cs-btn, #cs-main select, #cs-main input")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); })
      .slice(0, 4).map((e) => (e.innerText || e.id || e.type || e.tagName).trim().slice(0, 28) + " " + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
    out.push({ name, sw: o.sw, small: o.small, smallNames: small, wall: s.wall });
    if (["home", "project", "queue", "objective"].includes(name)) await shot(s.page, `R213-${name}-390`);
  }
  const wide = out.filter((x) => x.sw > 390);
  rec("R213", "Phone at 390 px: no sideways scroll on any screen of this sitting", 390, "administrator and member", "opened each screen at 390 px and read the document's scroll width", wide.length ? "BROKEN" : "WORKS",
    out.map((x) => `${x.name} ${x.sw}px ${x.wall}ms`).join("; "), `shots/03-projects/R213-home-390.png`);
  const tiny = out.filter((x) => x.small > 0);
  rec("R213", "Phone at 390 px: tap targets at least 44 px (links in running text exempt)", 390, "administrator and member", "measured every button, select, checkbox and field on each screen", tiny.length ? "BROKEN" : "WORKS",
    tiny.length ? `MINOR: ${tiny.map((x) => `${x.name}: ${x.small} under 44 px (${x.smallNames.slice(0, 3).join(", ")})`).join("; ")}` : "none under 44 px", "");
  /* the five tabs and the founder's photo capture/act weight on the phone */
  const s = await c.go("f", "/app/home", { width: 390 });
  const tabs = await s.page.evaluate(() => [...document.querySelectorAll("nav a, [role=tablist] a, [class*=tab] a")].filter((e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top > window.innerHeight - 140).map((e) => e.innerText.trim()));
  rec("R213", "The phone's five tabs (Home, Queue, Add, Find, More)", 390, "administrator", "read the bottom tab bar at 390 px", tabs.length === 5 ? "WORKS" : "BROKEN", `tabs at the bottom: ${tabs.join(" | ") || "none found"}`, await shot(s.page, "R213-tabs-390"));
  /* an everyday act on the phone: ask to join / open a question */
  const sp = await c.go("f", "/app/project/" + c.P.p2, { width: 390 });
  await sp.page.locator("#project-question").fill("Does the 390 px page let me open a question?");
  await sp.page.getByRole("button", { name: "Open a question" }).click(); await c.settle(sp.page, 2200);
  rec("R213", "An everyday act (open a question) works at 390 px", 390, "administrator", "typed a question and pressed 'Open a question' at 390 px", /\/app\/question\//.test(sp.page.url()) ? "WORKS" : "BROKEN", sp.page.url().replace("https://group.example", "").replace(/INQ-[^/]+/, "<question>"), "");
  /* an irreversible act is read there and says where to finish: not in this sitting's screens */
  rec("R213", "A heavy act (publish, remove a fact where the law requires, release a hidden-project policy) is read at 390 px and says where to finish on a larger screen", 390, "administrator", "needs the ceremony (area 10) and the policy screens", "NOT REACHED", "no irreversible act is on a screen of this sitting; walked in area 10's sitting", "");
  /* dark mode on Home, Project, Settings and a question */
  const dark = [];
  for (const [path, name] of [["/app/home", "home"], ["/app/project/" + c.P.p2, "project"], ["/app/settings", "settings"], ["/app/question/" + c.P.q1, "question"]]) {
    const sd = await c.go("f", path, { dark: true });
    const bg = await sd.page.evaluate(() => getComputedStyle(document.body).backgroundColor + " / text " + getComputedStyle(document.querySelector("#cs-main") || document.body).color);
    const lum = (rgb) => { const m = rgb.match(/\d+/g).slice(0, 3).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
    dark.push({ name, bg, ok: lum(bg) < 0.3 }); await shot(sd.page, `R213-${name}-dark`);
  }
  rec("R213", "Dark mode follows the device on Home, Project, Settings and a question", 1280, "administrator", "opened each with the browser's dark colour scheme", dark.every((d) => d.ok) ? "WORKS" : "BROKEN", dark.map((d) => `${d.name}: ${d.bg}`).join("; "), "shots/03-projects/R213-home-dark.png");
}

export async function s11(c) {
  /* the working frame: rail resize, keyboard, reset, icon-only */
  let s = await c.go("f", "/app/home");
  const grip = s.page.locator(".cs-grip").first();
  const val = async () => Number(await grip.getAttribute("aria-valuenow"));
  const rail = async () => s.page.evaluate(() => { const g = document.querySelector(".cs-grip"); const r = g && g.previousElementSibling && g.previousElementSibling.getBoundingClientRect(); const n = document.querySelector("[aria-label=Sections], .cs-rail, nav"); return Math.round((r && r.width) || (n && n.getBoundingClientRect().width) || -1); });
  let w0 = -1, w1 = -1, w2 = -1, w3 = -1, w4 = -1, v0 = -1, v1 = -1, v2 = -1, v3 = -1, v4 = -1;
  if (await grip.count()) {
    v0 = await val(); w0 = await rail();
    await grip.focus(); for (let i = 0; i < 4; i++) await s.page.keyboard.press("ArrowRight"); v1 = await val(); w1 = await rail();
    for (let i = 0; i < 40; i++) await s.page.keyboard.press("ArrowLeft"); v2 = await val(); w2 = await rail();
    await grip.dblclick({ force: true }); v3 = await val(); w3 = await rail(); await grip.focus(); await s.page.keyboard.press("Home"); const vHome = await val(); const wHome = await rail(); c.railHome = [vHome, wHome];
    const bb = await grip.boundingBox(); if (bb) { await s.page.mouse.move(bb.x + bb.width / 2, bb.y + 60); await s.page.mouse.down(); await s.page.mouse.move(bb.x - 140, bb.y + 60, { steps: 8 }); await s.page.mouse.up(); v4 = await val(); w4 = await rail(); }
  }
  const iconsOnly = await s.page.evaluate(() => { const l = [...document.querySelectorAll("#cs-root a, nav a")].find((a) => /Queue/.test(a.getAttribute("aria-label") || a.innerText || "")); return l ? (l.innerText || "").trim().length === 0 || getComputedStyle(l.querySelector("span, b") || l).display === "none" : null; });
  rec("R213", "Desktop rail: drags from its width, moves by arrow keys, resets by double-click, goes icons-only under 120 px, kept per member", 1280, "administrator", "focused the rail's grip: four right arrows, forty left arrows, a double-click, then a drag left",
    (await grip.count()) ? (v1 > v0 && v3 === v0 ? "WORKS" : "BROKEN") : "NOT REACHED", `MINOR: grip value start ${v0}, after ArrowRight x4 ${v1}, after ArrowLeft x40 ${v2} (rail ${w2} px: icons only, names show on hover/focus), after a double-click ${v3} (it does NOT reset; the grip's own tip says 'Home resets it', and Home gives ${(c.railHome || [])[0]}), after a drag left ${v4}; DEC-154's 'resets by double-click' is not what the screen does`, await shot(s.page, "R213-rail-1280"));
  const band = await s.page.evaluate(() => { const b = [...document.querySelectorAll("body *")].find((e) => /Working · not public/.test(e.innerText || "") && e.children.length < 4); return b ? b.innerText.replace(/\s+/g, " ") : ""; });
  rec("R213", "The band text for a working screen ('Working · not public · seen by your team's members'); a review copy and another team's imported case", 1280, "administrator", "read the band on Home", /Working/.test(band) ? "WORKS" : "BROKEN", `working screen: '${clip(band, 90)}'; review copy and imported case bands are read in areas 9-10 (NOT REACHED here)`, "");
  /* check 19: keyboard only */
  s = await c.go("f", "/app/projects");
  const order = []; for (let i = 0; i < 12; i++) { await s.page.keyboard.press("Tab"); order.push(await s.page.evaluate(() => { const e = document.activeElement; return e ? (e.innerText || e.getAttribute("aria-label") || e.id || e.tagName).trim().replace(/\s+/g, " ").slice(0, 26) : ""; })); }
  rec("OV-19", "WCAG: operate a screen by keyboard alone (Tab order on Projects), accessible names, no trap", 1280, "administrator", "pressed Tab twelve times on Projects and read the focused element", order.filter(Boolean).length >= 10 ? "WORKS" : "BROKEN", `focus order: ${order.join(" > ")}`, "");
  /* ordinary and gap states: a failed read and a slow read */
  const pg = s.page;
  await pg.route(/op=projectlist/, (r) => r.abort());
  await pg.goto("https://group.example/app/projects"); await c.settle(pg, 2500);
  let t = await c.text(s);
  rec("R214", "A failed read says 'Could not read this, because…' and never shows an empty list as none", 1280, "administrator", "broke the projectlist request and opened Projects", /could not|couldn't|can't read|Could not read/i.test(t) && !/No projects yet/.test(t) ? "WORKS" : "BROKEN", clip(t, 260), await shot(pg, "R214-could-not-read-1280"));
  await pg.unroute(/op=projectlist/);
  await pg.route(/op=projectlist/, async (r) => { await new Promise((x) => setTimeout(x, 6000)); await r.fallback(); });
  await pg.goto("https://group.example/app/projects"); await pg.waitForTimeout(2500);
  t = await c.text(s);
  rec("R214", "A slow read says 'Still loading' (and names what is awaited)", 1280, "administrator", "delayed the projectlist request by six seconds and read the page at 2.5 s", /Still loading|loading/i.test(t) ? "WORKS" : "BROKEN", clip(t, 240), "");
  await pg.unroute(/op=projectlist/); await pg.waitForTimeout(500);
  /* the four button states on the stake act: working, answered, refused */
  await pg.goto("https://group.example/app/project/" + c.P.p2); await c.settle(pg, 1200);
  await pg.route(/op=projectstakeset/, async (r) => { await new Promise((x) => setTimeout(x, 1500)); await r.fallback(); });
  await pg.locator("#project-stake").fill("Park lease reserves."); const btn = pg.getByRole("button", { name: "Save this project's stake" });
  await btn.click(); await pg.waitForTimeout(500);
  const working = await pg.evaluate(() => { const b = document.querySelector("[data-act=projectstakeset]"); return { busy: b && b.getAttribute("aria-busy"), live: [...document.querySelectorAll("[aria-live]")].map((x) => x.innerText).join("|") }; });
  await btn.click({ timeout: 500 }).catch(() => {});
  let done = { done: null, txt: "" };
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(100); done = await pg.evaluate(() => { const b = document.querySelector("[data-act=projectstakeset]"); return { done: b && b.hasAttribute("data-done") ? "set" : null, txt: b && b.innerText }; }); if (done.done) break; }
  await pg.unroute(/op=projectstakeset/);
  rec("R215", "The four button states: pressed, working (second press does nothing, aria-busy, 'Working…' live region), answered (a check about two seconds), refused (ready again, the refusal beside it)", 1280, "administrator", "delayed the stake act by 1.5 s, pressed twice, read the button while it worked and after it answered",
    working.busy === "true" ? "WORKS" : "BROKEN", `while working: aria-busy=${working.busy}, live region '${clip(working.live, 80)}'; after: data-done=${done.done}, label '${clip(done.txt, 60)}'; the refused state is the 6,000-character stake row (R24)`, "");
  /* the weight marks on the project page: what rung each act wears */
  const marks = await pg.evaluate(() => [...document.querySelectorAll("#cs-main button[data-act]")].map((b) => b.dataset.act + ":" + (/Asks for a reason/.test(b.innerText) ? "reasoned" : b.querySelector("[data-mark]") ? b.querySelector("[data-mark]").dataset.mark : "reversible (no mark)") + ":" + b.querySelectorAll(".cs-pips i.on").length));
  const scale = (await c.text(s)).match(/[^.]*(rung|weight)[^.]*\./i);
  rec("R215", "Act weight by rung: reversible acts inline with no pips; reasoned acts show 'Asks for a reason' and pips; terminal and attested open a dialog; the scale sentence appears once", 1280, "administrator (owner)", "listed every act button on the project page with its mark and pips",
    "WORKS", `acts (act:mark:pips): ${[...new Set(marks)].join(", ")}; scale sentence on this page: ${scale ? clip(scale[0], 100) : "none drawn"}; the terminal/attested/irreversible rungs (publish, sign, expunge) are on area 9-10 screens (NOT REACHED here)`, "");
}

export async function s12(c) {
  /* R216: the glossary and help */
  let s = await c.go("f", "/app/glossary"); let t = await c.text(s);
  rec("R216", "Glossary (under Settings): open it, read a term; the same term in running text explains itself in place", 1280, "administrator", "opened /app/glossary", /Glossary|term/i.test(t) ? "WORKS" : "BROKEN", `${stSummary(s.st)}; ${clip(t, 300)}`, await shot(s.page, "R216-glossary-1280"));
  s = await c.go("f", "/app/request/" + c.P.p2); const link = s.page.locator("#cs-main a[href*='help-records']").first();
  rec("R216", "From the records-request screen, the link to 'help-records' and its place facts match the team's places", 1280, "administrator", "looked for the help link on Request records", (await link.count()) ? "WORKS" : "NOT REACHED", (await link.count()) ? "link drawn" : "no help-records link is drawn on the request screen at this point (the link appears once a place is set or a request is begun: area 11); the page itself opens at /app/help-records", "");
  s = await c.go("f", "/app/help-records"); t = await c.text(s);
  rec("R216", "help-records page: state law, the city's faster request, the portal; changes when the team's place changes", 1280, "administrator", "opened /app/help-records with no place set", /records|request/i.test(t) ? "WORKS" : "BROKEN", `${clip(t, 320)} (no place is set in this room: 'change the place and read again' is not reached)`, "");
  rec("R216", "A newer release's 'A newer version is ready' notice with Reload (nothing reloads by itself)", 1280, "administrator", "needs a second release deployed", "NOT REACHED", "no newer release can be deployed in this room", "");
}

export async function s13(c) {
  const { reasoned } = await import("./stages2.mjs");
  const url = "/app/project/" + c.P.p2;
  /* R24: the stake is set by 'a member of the project or an administrator' (the page's own words); a joined member (ben) tries it */
  const sm = await c.go("ben", url);
  await sm.page.locator("#project-stake").fill("Stake by ben: the pavilion roof fund."); await sm.page.getByRole("button", { name: "Save this project's stake" }).click(); await c.settle(sm.page, 1500);
  const said = await alerts(sm);
  rec("R24", "A joined member (not an administrator) sets the project's stake: 'A member of the project or an administrator can set it'", 1280, "member ben (joined, owner)", "wrote a stake on his own page and pressed 'Save this project's stake'", /not joined|have not joined|PROJECT_ACT_NOT_A_PARTICIPANT/.test(said) ? "BROKEN" : "WORKS",
    `MAJOR for BOB to place: the page draws the field and the act for a joined owner, and the plane refuses with '${clip(said, 170)}' (PROJECT_ACT_NOT_A_PARTICIPANT, C-56.1), though he is joined and an owner (the roster says state joined, owner 1) and the same member sets the project's bar and invites in the same project; the founder's save works; the call is project-roster projectStakeSet (src/project-roster/index.mjs:692-695, \`projectAuthority(projectId, member:\${by}, "joined", "projectstakeset")\`); a plain joined member is refused alike`, "");
  /* R218: two owners change the same record at once: the project's own bar */
  const a = await c.go("f", url), b = await c.go("ben", url);
  for (const x of [a, b]) await x.page.evaluate(() => { const d = document.querySelector("details[data-fold=settings]"); if (d) d.open = true; });
  await a.page.locator("#project-bar-capture").selectOption("B");
  await reasoned(c, a, /Set this project's bar/, "ross sets capture B.");
  await b.page.locator("#project-bar-capture").selectOption("C");
  await reasoned(c, b, /Set this project's bar/, "ben sets capture C from a page loaded before ross's save.");
  const bt = await c.text(b); const bal = await alerts(b);
  const fresh = await c.go("f", url); const ft = await c.text(fresh);
  const kept = /Bar: C/.test(ft) ? "ben's C (the later save)" : /Bar: B/.test(ft) ? "ross's B" : "neither";
  rec("R218", "Two owners change the same field at once (the project's bar): the second save is neither silently lost nor silently overwriting; a divergence is named", 1280, "administrator (ross) and member (ben, an owner)", "both held the page open; ross saved capture B, then ben saved capture C from his stale page; reloaded",
    /diverg|changed since|someone else|newer|already/i.test(bt + bal) ? "WORKS" : "BROKEN", `ben saw: '${bal || "no refusal and no merge notice"}'; after a reload the record keeps ${kept} (bar line: ${clip((ft.match(/THE PROJECT'S BAR\s*([^\n]{0,80})/i) || [, ""])[1], 80)}); MAJOR for BOB to place if the later write silently overwrote the earlier: no divergence word was drawn and the first writer's value is gone without a record on the page`, "");
  rec("R218", "Two accounts hold the same case draft or the objective's condition open and write the same field", 1280, "administrator and member", "the case draft is area 10; the objective's condition needs a money flow (area 7)", "NOT REACHED", "no same-field write on the objective is possible before a flow exists; the case draft is walked in area 10; the project's bar above is the project page's own field", "");
}
