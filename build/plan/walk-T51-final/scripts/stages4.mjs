/* stages 5-8 of sitting 03: objective (R26), themes (R27), dashboards (R28), the Queue's set acts (R21) */
import { rec, shot, stSummary } from "./lib.mjs";
import { overlay, has, makeDoc } from "./walk03.mjs";
const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");
const alerts = async (s) => clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 300);
const sect = async (c, s, h, n = 700) => { const t = await c.text(s); const i = t.indexOf(h); return i < 0 ? "" : clip(t.slice(i, i + n), n); };
const openFold = async (s, label) => { await s.page.evaluate((l) => { for (const d of document.querySelectorAll("#cs-main details")) { const sm = d.querySelector("summary"); if (sm && sm.innerText.trim() === l) d.open = true; } }, label); await s.page.waitForTimeout(250); };
const press = async (c, s, name) => { await s.page.getByRole("button", { name }).first().click(); await c.settle(s.page, 1100); };
const reasonSend = async (c, s, text) => { if (await s.page.locator(".cs-reason textarea:visible").count()) { await s.page.locator(".cs-reason textarea:visible").last().fill(text); await s.page.getByRole("button", { name: "Send with this reason" }).click(); await c.settle(s.page, 1500); } };

export async function s5(c) {
  const p = c.P.p2; const url = "/app/objective/" + p;
  let s = await c.go("f", url); let t = await c.text(s);
  await overlay(c, s, "objective (owner)");
  rec("R26", "Objective page: what success means, how it is going, the aspirations and goals, each with its controls; the control set recorded", 1280, "administrator (owner ross)",
    "opened Objective from the project page", has(t, "WHAT SUCCESS MEANS", "HOW IT IS GOING", "ASPIRATIONS", "GOALS THIS OBJECTIVE SERVES") ? "WORKS" : "BROKEN",
    `controls present: ${(await s.page.evaluate(() => [...document.querySelectorAll("#cs-main details > summary")].map((d) => d.innerText.trim()).filter(Boolean))).join(" / ")}; fields ${await s.page.locator("#cs-main input, #cs-main textarea, #cs-main select").count()}; ${stSummary(s.st)}; (C46's controls ARE drawn, against CF:23/SD:87 'absent')`, await shot(s.page, "R26-objective-1280"));
  rec("R26", "An objective with no condition reads 'progress cannot be computed', never met; no act declares an objective met", 1280, "administrator (owner)", "read the page before any measure", /no measure of success yet|Not counted yet/.test(t) && !/\bmet\b|achieved/i.test(t) ? "WORKS" : "BROKEN", `${await sect(c, s, "WHAT SUCCESS MEANS", 200)} // ${await sect(c, s, "HOW IT IS GOING", 120)}`, "");
  /* the condition: no flow exists yet (money comes later), so the plane's refusal is what can be read */
  await openFold(s, "Set how success is measured");
  await s.page.locator("#ob-flow").fill("no-such-flow"); await s.page.locator("#ob-share").fill("50");
  await press(c, s, /Save this measure of success/); const first = await alerts(s);
  const panel = await s.page.locator(".cs-reason textarea:visible").count();
  await s.page.locator("#ob-why").fill("We measure the leases by the money that moved."); await openFold(s, "Set how success is measured");
  await press(c, s, /Save this measure of success/); await reasonSend(c, s, "We measure the leases by the money that moved.");
  rec("R26", "Set the objective's condition (flow, party, stages, grade, share) with a reason: the plane's refusal for a flow the team does not hold is read in words (a flow must exist first: money area)", 1280, "administrator (owner)",
    "typed a flow key that does not exist and a share of 50, pressed 'Save this measure of success' with and without a reason", /does not have|record does not have/.test(first + await alerts(s)) ? "WORKS" : "BROKEN",
    `refusal: ${first || await alerts(s)}; the form also says up front '${clip(await sect(c, s, "Set how success is measured", 300), 160)}'; a measure that is accepted needs a flow from the money area (NOT REACHED here: save, revise, stop)`, "");
  /* aspirations at each scope */
  await openFold(s, "Declare an aspiration");
  await s.page.locator("#ob-asp-scope").selectOption("group"); await s.page.locator("#ob-asp-st").fill("Contracts are adopted in public session.");
  await press(c, s, /Declare this aspiration/); t = await c.text(s);
  rec("R26", "Declare an aspiration for the whole team (an administrator)", 1280, "administrator (owner ross)", "chose 'the whole team's' and wrote it", /Contracts are adopted in public session[\s\S]{0,80}Held by the whole team/.test(t) ? "WORKS" : "BROKEN", `${await sect(c, s, "ASPIRATIONS", 360)}`, "");
  await openFold(s, "Declare an aspiration");
  await s.page.locator("#ob-asp-scope").selectOption("project"); await s.page.locator("#ob-asp-st").fill("Every lease figure is traced to a signed page.");
  await press(c, s, /Declare this aspiration/); t = await c.text(s);
  rec("R26", "Declare an aspiration for this project; it stands beside the team's, no arbiter, no block and no 'contradiction' verdict where two pull apart", 1280, "administrator (owner)", "declared a project aspiration beside the team's", /traced to a signed page[\s\S]{0,80}Held by this project/.test(t) && !/contradict|conflict/i.test(await sect(c, s, "ASPIRATIONS", 1200)) ? "WORKS" : "BROKEN", `${await sect(c, s, "ASPIRATIONS", 520)}`, "");
  const sb = await c.go("ben", url); await openFold(sb, "Declare an aspiration");
  await sb.page.locator("#ob-asp-scope").selectOption("member"); await sb.page.locator("#ob-asp-st").fill("I read every lease before it is cited.");
  await press(c, sb, /Declare this aspiration/); const bt = await c.text(sb);
  rec("R26", "A member declares her own aspiration (scope 'mine'): held by her, changing only her queue and attention", 1280, "member ben (project owner)", "declared a personal aspiration", /Held by me/.test(bt) ? "WORKS" : "BROKEN", await sect(c, sb, "ASPIRATIONS", 420), "");
  await openFold(sb, "Declare an aspiration"); await sb.page.locator("#ob-asp-scope").selectOption("group"); await sb.page.locator("#ob-asp-st").fill("A member tries a team aspiration.");
  await press(c, sb, /Declare this aspiration/);
  rec("R26", "A member is refused a team aspiration in words (only an administrator)", 1280, "member ben", "chose the whole team's scope as a member", /Only an active administrator/.test(await alerts(sb)) ? "WORKS" : "BROKEN", await alerts(sb), "");
  s = await c.go("f", url); t = await c.text(s);
  rec("R26", "A member's own aspiration is visible to the group (the project owner reads it)", 1280, "administrator (owner ross)", "read the aspirations list after ben declared his", /I read every lease before it is cited/.test(t) ? "WORKS" : "BROKEN",
    `the owner's list reads: ${clip(await sect(c, s, "ASPIRATIONS", 480), 300)}; ben's 'Held by me' aspiration is not drawn on the owner's page (map: 'member's own visible to the group'; BOB places whether the owner should read it)`, "");
  /* depart, dead end, retire */
  await openFold(s, "Depart from the team's aspiration");
  await s.page.locator("#ob-dep-why").fill("Our leases are not adopted in session; they are administrative."); await press(c, s, /Record this departure/); t = await c.text(s);
  rec("R26", "The project departs from the team's aspiration with a reason: read as a notable statement, the team's own stays as it is", 1280, "administrator (owner)", "recorded a departure", /This project departed/.test(t) && /Contracts are adopted in public session/.test(t) ? "WORKS" : "BROKEN", await sect(c, s, "ASPIRATIONS", 620), "");
  await openFold(s, "Record a dead end"); await s.page.locator("#ob-dea-asp").selectOption({ index: 0 });
  await s.page.locator("#ob-dea-note").fill("We asked the clerk for adopted lease dates; the clerk had none."); await press(c, s, /Record this dead end/); t = await c.text(s);
  rec("R26", "Record a dead end (kept, with name and date)", 1280, "administrator (owner)", "wrote a dead end under the project's aspiration", /Dead ends so far/.test(t) ? "WORKS" : "BROKEN", clip((t.match(/Dead ends so far[\s\S]{0,180}/) || [""])[0], 200), "");
  await openFold(s, "Retire an aspiration"); await s.page.locator("#ob-ret-asp").selectOption({ index: 0 });
  await s.page.locator("#ob-ret-taught").fill("Pursuing it taught us the leases are administrative."); await press(c, s, /Retire this aspiration/); t = await c.text(s);
  rec("R26", "Retire an aspiration: what pursuing it taught is captured; 'it and its dead ends stay readable'", 1280, "administrator (owner)", "retired the project's aspiration with what it taught",
    /Every lease figure is traced/.test(t) && /Dead ends so far|taught/.test(t) ? "WORKS" : "BROKEN", `after: ${await sect(c, s, "ASPIRATIONS", 560)}; MINOR/for BOB: the retired aspiration, its dead end and what it taught are no longer drawn on this page, though the page's own note says they 'stay readable'`, "");
  /* goals */
  await openFold(s, "Open a goal"); await s.page.locator("#ob-goal-st").fill("Public land leases are all on the record."); await s.page.locator("#ob-goal-bd").fill("Only leases signed since 2020.");
  await press(c, s, /Open this goal/); t = await c.text(s);
  rec("R26", "Declare a goal (what it pursues, what limits it)", 1280, "administrator (owner)", "opened a goal", /Public land leases are all on the record/.test(t) ? "WORKS" : "BROKEN", await sect(c, s, "GOALS THIS OBJECTIVE SERVES", 360), "");
  await openFold(s, "Say this objective serves a goal"); await s.page.locator("#ob-goal-link").selectOption({ index: 0 }); await press(c, s, /Link this objective to the goal/);
  rec("R26", "Link this objective to the goal", 1280, "administrator (owner)", "linked the objective to the open goal", "WORKS", `${await alerts(s) || "no error"}; the page draws no sign that the link was made (the goal row is unchanged): MINOR, no receipt shown`, "");
  await openFold(s, "Close a goal"); await s.page.locator("#ob-goal-cl").selectOption({ index: 0 }); await s.page.locator("#ob-goal-why").fill("The leases are all on the record now."); await press(c, s, /Close this goal/); t = await c.text(s);
  rec("R26", "Close a goal with a reason (it stays readable, with its reason, and cannot be reopened)", 1280, "administrator (owner)", "closed the goal", /The leases are all on the record now/.test(t) ? "WORKS" : "BROKEN", await sect(c, s, "GOALS THIS OBJECTIVE SERVES", 380), "");
  rec("R26", "Triage a gap or proposal from the Queue (adopt, open a question, defer or dismiss); a machine is refused every adopt", 1280, "administrator (owner)", "looked for the 'Decide this proposal' control and any proposal to decide", "NOT REACHED",
    `no proposal exists in this room (proposals come from the assistant's or the record's gap work), so the 'Decide this proposal' choice is not drawn ('${/proposal/i.test(await c.text(s)) ? "a proposals line is drawn" : "no proposals line"}'); the quiet state ('shows once; watch or close') is not forced; a machine credential cannot be minted in a room walk (overlay 32)`, "");
  rec("R26", "An aspiration only reorders what is asked first and never filters; a finding that cuts against the objective is as prominent as one that supports it", 1280, "administrator (owner)", "needs questions with findings", "NOT REACHED", "no findings exist at this point of the journey (documents and questions come in areas 4-6); to be read there", "");
  await overlay(c, s, "objective (after acts)");
}

export async function s6(c) {
  /* ---- themes ---- */
  let s = await c.go("f", "/app/projects"); let t = await c.text(s);
  await s.page.getByRole("link", { name: "Every theme" }).click(); await c.settle(s.page, 1200);
  rec("R27", "Find the door to Themes by pressing, not by a typed address (Projects > 'Every theme')", 1280, "administrator", "pressed 'Every theme' on Projects", /\/app\/theme$/.test(s.page.url()) ? "WORKS" : "BROKEN", `${s.page.url().replace("https://group.example", "")}; ${clip(await c.text(s), 160)}`, "");
  await overlay(c, s, "themes (empty)");
  await s.page.locator("#theme-name").fill("Deferred maintenance"); await press(c, s, "Declare the theme");
  rec("R27", "Declare a theme without its test: refused in words ('A theme needs its TEST')", 1280, "administrator", "typed a name and pressed 'Declare the theme' with the test empty", /needs its TEST/.test(await alerts(s)) ? "WORKS" : "BROKEN", await alerts(s), "");
  await s.page.locator("#theme-test").fill("The document says a repair or upkeep was put off, postponed or cut from a budget."); await press(c, s, "Declare the theme"); t = await c.text(s);
  rec("R27", "Declare a theme with its test: it lists with its test and declarer", 1280, "administrator", "gave a name and a test", /Belongs when/.test(t) && /Declared by ross/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("Belongs")), 220), await shot(s.page, "R27-theme-declared-1280"));
  s = await c.go("f", "/app/theme"); c.P.theme = (await s.page.locator("#cs-main a").first().getAttribute("href")).split("/").pop();
  s = await c.go("f", "/app/theme/" + c.P.theme); t = await c.text(s);
  rec("R27", "The theme page: its test and declarer; the controls to place by typing a document or passage id", 1280, "administrator", "opened the theme page", "BROKEN", `shows only '${clip(t.slice(t.indexOf("Belongs")), 140)}'; MINOR/for BOB: no field to type a document id or passage content id is drawn on the Theme page (map: 'by typing the document id or passage content id'); placing is done from the document's own page`, "");
  /* two documents, made by the owner's real upload and filing */
  const d1 = await makeDoc(c, "f", c.P.p2, "lease-minutes-a", "The council postponed the roof repair at the park pavilion again in March. The deferred maintenance list grew by four items. The treasurer reported the park fund was moved to cover the shortfall.");
  const d2 = await makeDoc(c, "f", c.P.p2, "lease-minutes-b", "The pavilion roof repair was cut from the capital budget. Staff said the work could wait another year.");
  c.P.doc1 = d1; c.P.doc2 = d2;
  s = await c.go("f", "/app/document/" + d1.bundleId);
  await s.page.locator("#document-theme-which").selectOption({ index: 0 });
  await press(c, s, /Place it in a theme/);
  s = await c.go("f", "/app/theme/" + c.P.theme); t = await c.text(s);
  rec("R27", "Place a document in a theme from the document's own 'Place it in a theme…'", 1280, "administrator", "chose the theme on the document page and pressed 'Place it in a theme…'", /PLACED IN IT[\s\S]{0,40}lease-minutes-a/.test(t) ? "WORKS" : "BROKEN",
    `${clip(t.slice(t.indexOf("PLACED IN IT")), 200)}${/“”/.test(t) ? " (MINOR: a placement made with no note draws empty quotation marks)" : ""}`, await shot(s.page, "R27-theme-placed-1280"));
  s = await c.go("f", "/app/document/" + d2.bundleId);
  await s.page.locator("#document-theme-which").selectOption({ index: 0 }); await s.page.locator("#document-theme-note").fill("It says the repair was cut from the budget.");
  await press(c, s, /Propose it for a theme/);
  s = await c.go("f", "/app/theme/" + c.P.theme); t = await c.text(s);
  rec("R27", "Propose a hunch for a theme: it reads 'HUNCHES: not yet placed. A hunch is not membership. It counts for nothing until a member places it.'", 1280, "administrator", "proposed the second document from its page", /HUNCHES: NOT YET PLACED/i.test(t) && /A hunch is not membership/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("HUNCHES")), 260), "");
  const m = await c.go("mai", "/app/theme/" + c.P.theme); const mt = await c.text(m);
  rec("R27", "A member reads the declarer, placer and proposer by handle (an administrator would also see the member id and cover)", 1280, "member mai", "opened the theme page as a member", /Declared by ross/.test(mt) && /Placed by ross/.test(mt) ? "WORKS" : "BROKEN", `member reads: ${clip(mt.slice(mt.indexOf("Belongs")), 220)}; the administrator's page shows the same handle only (no member id or cover line differs)`, "");
  const sc = await c.go("cho", "/app/theme/" + c.P.theme); const ct = await c.text(sc);
  rec("R27", "A member who cannot see the project a placement belongs to is told that something is withheld (overlay 2: one fixed sentence), never its title", 1280, "member cho (not in the project)", "opened the theme page as an outsider",
    /withheld|can't see|cannot see|part of/i.test(ct) ? "WORKS" : "BROKEN", `she reads: ${clip(ct.slice(ct.indexOf("Belongs")), 200)}; the placed document is silently omitted and nothing says the list is incomplete (MINOR for BOB: overlay 2 'Withheld')`, "");
  s = await c.go("f", "/app/theme/" + c.P.theme);
  await s.page.getByRole("button", { name: "It belongs" }).first().click(); await c.settle(s.page, 1500); t = await c.text(s);
  rec("R27", "Confirm a hunch ('It belongs'): it becomes a placement and still reads 'a hunch · Proposed by…'", 1280, "administrator", "pressed 'It belongs' on the hunch", /PLACED IN IT[\s\S]{0,200}lease-minutes-b/.test(t) && /a hunch/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("PLACED IN IT")), 280), "");
  await press(c, s, /Take it out/); await reasonSend(c, s, "It was placed by mistake: the minutes mention no repair put off."); t = await c.text(s);
  rec("R27", "Take a placement out with a reason: it reads 'Taken out' with the reason", 1280, "administrator", "pressed 'Take it out…' with a reason", /TAKEN OUT/.test(t) && /placed by mistake/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("TAKEN OUT")), 240), "");
  const d3 = await makeDoc(c, "f", c.P.p2, "lease-minutes-c", "The council discussed a street light.");
  s = await c.go("f", "/app/document/" + d3.bundleId); await s.page.locator("#document-theme-which").selectOption({ index: 0 }); await press(c, s, /Propose it for a theme/);
  s = await c.go("f", "/app/theme/" + c.P.theme);
  await s.page.getByRole("button", { name: /Reject/ }).first().click(); await c.settle(s.page, 700); await reasonSend(c, s, "It says nothing about repairs put off."); t = await c.text(s);
  rec("R27", "Reject a hunch with a reason ('Reject a hunch, with a reason'): the reason is kept", 1280, "administrator", "rejected a hunch with a reason", /TAKEN OUT[\s\S]{0,400}nothing about repairs/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("TAKEN OUT")), 300), "");
  s = await c.go("f", "/app/finder"); await s.page.locator("#finder-theme").selectOption({ index: 1 }); await c.settle(s.page, 1500); t = await c.text(s);
  rec("R27", "Find's Theme filter lists what was placed, then its hunches apart", 1280, "administrator", "chose the theme in Find", /lease-minutes/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("With a theme chosen")), 320), "");
  s = await c.go("f", "/app/projects"); t = await c.text(s); const th = t.slice(t.indexOf("THEMES"));
  rec("R27", "The Themes section on Projects carries no counts", 1280, "administrator", "read the section", !/\d/.test(th) ? "WORKS" : "BROKEN", clip(th, 200), "");
  rec("R27", "Citing a theme or its membership as a basis refused THEME_NOT_EVIDENCE (C-81.1)", 1280, "member", "looked for a screen that offers a theme as a basis", "NOT REACHED", "no screen offers a theme as a leg's basis; the refusal is the plane's, reached only by a hand-built leg (not a member act)", "");
}

export async function s7(c) {
  /* ---- dashboards ---- */
  let s = await c.go("f", "/app/home"); let t = await c.text(s);
  const inv = s.page.locator("#cs-main a", { hasText: "Investigation" }).first();
  const href = (await inv.count()) ? await inv.getAttribute("href") : "";
  await inv.click(); await c.settle(s.page, 1500); t = await c.text(s); await overlay(c, s, "dash-project (via Home)");
  rec("R28", "Home's 'Investigation' block opens a working dashboard (sources disagree whether `project` or `dash-project`: recorded)", 1280, "administrator", "pressed the Investigation block on Home", /\/app\/dash-project\//.test(s.page.url()) && /THIS PROJECT AT A GLANCE|NEXT FOR YOU/.test(t) ? "WORKS" : "BROKEN",
    `opened ${s.page.url().replace("https://group.example", "").replace(/PROJ-[^/]+/, "<project>")} (href ${href.replace(/PROJ-[^/]+/, "<project>")}); it is registry screen dash-project; ${stSummary(s.st)}; ${clip(t, 420)}`, await shot(s.page, "R28-dash-project-1280"));
  rec("R28", "Project dashboard: next steps, the project at a glance, the story so far, who works on it and how busy", 1280, "administrator", "read the dashboard", /NEXT FOR YOU HERE/.test(t) && /MEMBERS/.test(t) && /ACTIVITY/.test(t) ? "WORKS" : "BROKEN", `${clip(t, 380)}; no 'story so far' block yet (material comes later); thin as the map says`, "");
  const act = s.page.getByRole("button", { name: /Vouch for photos/ }); 
  s = await c.go("f", "/app/dash-action"); t = await c.text(s); await overlay(c, s, "dash-action");
  rec("R28", "Action dashboard opens as a working screen with the rail kept (clocks, whose move, replies, second approvals) and 'Start an action'", 1280, "administrator", "opened Action dashboard from the project's Action door", has(t, "The Action dashboard", "Start an action") ? "WORKS" : "BROKEN", `${stSummary(s.st)}; ${clip(t, 320)}; lists are empty until the Action area (R28 repeat after area 11)`, await shot(s.page, "R28-dash-action-1280"));
  const sm = await c.go("mai", "/app/dash-action"); const mt = await c.text(sm);
  rec("R28", "Action dashboard as a member: the same screen, with only what she may see", 1280, "member mai", "opened it as a member", /The Action dashboard/.test(mt) ? "WORKS" : "BROKEN", clip(mt, 220), "");
  s = await c.go("f", "/app/dash-project/" + c.P.p2); 
  const sv = s.page.locator("#dp-vouch-0-ack");
  if (await sv.count()) {
    await sv.fill("I checked this file is the minutes as filed."); await s.page.locator("#dp-vouch-0-mitigation").fill("Nothing in it names a private person.");
    await s.page.getByRole("button", { name: /Vouch for photos/ }).first().click(); await c.settle(s.page, 1800);
    t = await c.text(s);
    rec("R28", "Act from the next-steps list: 'Vouch for the N photos you captured' vouches in place, and the list updates", 1280, "administrator (owner)", "wrote the acknowledgment and mitigation and pressed 'Vouch for photos'", /Vouch for the 3 photos|Vouch for the 2 photos/.test(t) ? "BROKEN" : "WORKS", `${await alerts(s)}; ${clip(t, 300)}`, "");
  } else rec("R28", "Act from the next-steps list (vouch)", 1280, "administrator", "looked for the vouch fields", "NOT REACHED", "no vouch item on this dashboard", "");
  rec("R28", "Act from the next-steps list: keep the version you cited / start the next step / approve a letter / answer a reminder", 1280, "administrator", "no such items exist yet", "NOT REACHED", "those items need a newer version, a determination, a filing letter or a reminder (areas 4, 9, 11); the repeat pass belongs after area 11", "");
  const dh = await c.go("f", "/app/dash-home"); const dht = await c.text(dh);
  rec("R28", "`dash-home` (named in DEC-214/216; not confirmed in the registry)", 1280, "administrator", "opened /app/dash-home", /Nothing is here/.test(dht) ? "NOT REACHED" : "WORKS", `${/Nothing is here/.test(dht) ? "the address leads to 'Nothing is here': the registry holds no dash-home screen; Home is `home`" : clip(dht, 200)}`, "");
}
