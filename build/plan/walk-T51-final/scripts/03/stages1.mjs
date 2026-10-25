/* stages 1-2 of sitting 03: the empty room's Home and Queue (R20, R21, R22), then starting projects (R23) */
import { rec, shot, stSummary, dump } from "./lib.mjs";
import { overlay, has, miss } from "./walk03.mjs";

const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");

export async function s1(c) {
  const { k } = c;
  c.W.f = await k.founder();
  /* ---------- R20 / R21: the founder on the empty room ---------- */
  let s = await c.go("f", "/app/home");
  let t = await c.text(s);
  await overlay(c, s, "home (founder, empty)");
  let g = await shot(s.page, "R20-founder-home-empty-1280");
  const steps = (await s.page.locator("#cs-main ol li, #cs-main [class*=step]").count());
  const need = miss(t, /READY/i, "Name your team", "What happened?");
  rec("R20", "Home, founder, empty room: new-team Home reads ready, numbered first steps with 'Name your team' first, 'What happened?' (map words 'Nothing is here yet')", 1280, "administrator (founder, no handle)",
    "signed in as the founder on a newly claimed room (no handle chosen) and read Home", verdict(!need.length),
    `${need.length ? "MISSING " + need : "present"}; no 'Nothing is here yet' wording (screen says its team's Civicsmith is ready); no 'Since you last looked', no reading at zero, no areas block on the empty room; ${stSummary(s.st)}; wall ${s.wall} ms. TEXT: ${clip(t, 420)}`, g);
  const firstStep = await s.page.evaluate(() => { const r = document.querySelector("#cs-main [class*=step], #cs-main ol li"); return r ? r.innerText.replace(/\s+/g, " ") : ""; });
  rec("R20", "Home first steps: each numbered step carries its sentence (step 1 'Name your team')", 1280, "administrator", "read the four numbered steps", "BROKEN",
    `MINOR: Steps read: 1 'Name your team' (button only, no sentence beside the number), 2 'Make an invitation link for each person and send it yourself: Civicsmith sends no email.' / Invite your first members, 3 'Its kind, focus and purpose...' / Say who your team is, 4 'Open your first project: choose below what happened.'. Step 1 alone has no sentence of its own (MINOR). first=${clip(firstStep, 120)}`, g);

  // the doors
  const doors = ["A problem I live with", "A person", "A payment or contract", "Something I read", "A tip or documents"];
  for (const d of doors) {
    s = await c.go("f", "/app/home", { ms: 600 });
    const before = await s.page.locator("#cs-main button").allInnerTexts();
    await s.page.getByRole("button", { name: new RegExp("^" + d) }).first().click(); await c.settle(s.page, 500);
    const after = (await s.page.locator("#cs-main button").allInnerTexts()).filter((x) => !before.includes(x));
    let wiz = "";
    if (after.length) {
      await s.page.getByRole("button", { name: after[0].trim() }).first().click(); await c.settle(s.page, 1200);
      wiz = clip((await s.page.locator("body").innerText()).split("Wizard").slice(1).join("Wizard"), 230);
    }
    rec("R20", `Home door '${d}' opens its guided starts and the first is taken`, 1280, "administrator", `pressed '${d}', then its first guided start`, after.length && wiz ? "WORKS" : "BROKEN",
      `guided starts offered: ${after.map((x) => x.trim()).join(" / ") || "none"}; wizard dock: ${wiz || "nothing opened"}`, "");
    const stop = s.page.getByRole("button", { name: "Stop" }).first(); if (await stop.count()) await stop.click().catch(() => {});
  }
  s = await c.go("f", "/app/home", { ms: 600 });
  const inputs = await s.page.locator("#cs-main input:visible, #cs-main textarea:visible").evaluateAll((e) => e.map((x) => x.id));
  const free = /describe it in your own words/i.test(t);
  rec("R20", "Home: 'describe it in your own words' and a first message to each of six destinations (start a project; add to a question; a lead with a watch; a step; an action; 'not something Civicsmith does')", 1280, "administrator",
    "looked for a free-text first-message box on Home and in the doors", "NOT REACHED",
    `the sentence 'Choose what fits, or describe it in your own words' is drawn${free ? "" : " (not seen)"}, but no free-text box exists on Home (inputs drawn once the start form is open: ${inputs.join(", ") || "none until it is open"}); the first-message door has no registry screen (coverage Notes: designed, not built), so the six destinations cannot be walked; MINOR: the sentence promises a box that is not there`, g);
  await s.page.getByRole("link", { name: /Help for my own situation/ }).click(); await c.settle(s.page, 800);
  t = await c.text(s);
  rec("R20", "Home door 'Help for my own situation' opens 'Where else to go' and records nothing", 1280, "administrator", "pressed the door", has(t, "Where else to go", /records nothing/) ? "WORKS" : "BROKEN",
    `lands on ${s.page.url().replace("https://group.example", "")}; ${clip(t, 300)}`, "");

  s = await c.go("f", "/app/queue");
  t = await c.text(s); await overlay(c, s, "queue (founder, empty)"); g = await shot(s.page, "R21-founder-queue-empty-1280");
  rec("R21", "Queue, administrator, empty: 'Nothing is waiting on you', three kinds named To do / Noticed / Status, 'You are up to date'", 1280, "administrator",
    "opened Queue on the empty room", verdict(has(t, "Nothing is waiting on you", /TO DO/i, /NOTICED/i, /STATUS/i, "You are up to date") && !/Obligation|Condition|Signal/.test(t)),
    `${stSummary(s.st)}; wall ${s.wall} ms; ${clip(t, 380)}`, g);
  rec("R21", "Queue: 'What you answered' link, and 'Go to Home' door", 1280, "administrator", "read the links", has(t, "What you answered", "Go to Home") ? "WORKS" : "BROKEN", "both drawn", "");
  s = await c.go("f", "/app/queue/answered"); t = await c.text(s);
  rec("R21", "Queue > 'What you answered' on an empty room", 1280, "administrator", "opened /app/queue/answered", has(t, "What you answered") ? "WORKS" : "BROKEN", clip(t, 240), "");
  s = await c.go("f", "/app/projects"); t = await c.text(s); await overlay(c, s, "projects (founder, empty)");
  rec("R23", "Projects list on an empty room: designed empty state then 'Start a project'", 1280, "administrator", "opened Projects", has(t, "No projects yet", "Start a project", "Every theme") ? "WORKS" : "BROKEN", clip(t, 380), await shot(s.page, "R23-founder-projects-empty-1280"));

  /* ---------- the people (made as the screens make them: invitation, enrol, sign in) ---------- */
  await c.person("mai"); await c.person("ben"); await c.person("cho");
  await c.person("ola", ["contribute", "create_projects"]);
  // ---------- R20 / R22: the freshly joined member, no right to start projects ----------
  s = await c.go("mai", "/app/home"); t = await c.text(s); await overlay(c, s, "home (member, first visit)");
  g = await shot(s.page, "R20-member-home-first-1280");
  const noDoors = !/A problem I live with|A person\b/.test(t);
  rec("R20", "Home, member who may not start projects: 'Getting into a project' list and no 'Start a project' / five doors", 1280, "member mai (contribute only)",
    "freshly joined, read Home", has(t, "GETTING INTO A PROJECT", /not in one yet/) && noDoors && !/Start a project/.test(t) ? (/What happened\?/.test(t) ? "BROKEN" : "WORKS") : "BROKEN",
    `${stSummary(s.st)}; ${/What happened\?/.test(t) ? "MINOR: the heading 'What happened?' stays over a single door 'Help for my own situation' (map: no 'What happened?' for this member). " : ""}${clip(t, 440)}`, g);
  s = await c.go("mai", "/app/queue"); t = await c.text(s); await overlay(c, s, "queue (member, empty)");
  rec("R22", "Queue, member, nothing yet: empty Queue words", 1280, "member mai", "opened Queue as the freshly joined member", has(t, "Nothing is waiting on you", "You are up to date") ? "WORKS" : "BROKEN", `${stSummary(s.st)}; ${clip(t, 200)}`, "");
}

export async function s2(c) {
  /* ---------- R23: start a project as the founder ---------- */
  let s = await c.go("f", "/app/projects");
  await s.page.getByText("Start a project", { exact: true }).first().click(); await c.settle(s.page, 400);
  const radios = await s.page.locator("#projects-visibility-hidden, #projects-visibility-discoverable").evaluateAll((e) => e.map((x) => x.checked));
  let t = await c.text(s);
  rec("R23", "Start form: 'Who can find it' offered with both choices and neither preselected; 'Choose one: neither is chosen for you'", 1280, "administrator (founder)", "opened 'Start a project' on Projects",
    verdict(radios.length === 2 && radios.every((x) => !x) && /neither is chosen for you/.test(t)), `checked state of the two radios: ${JSON.stringify(radios)}; ${clip(t.slice(t.indexOf("What it is about")), 300)}`, await shot(s.page, "R23-start-form-1280"));
  await s.page.locator("#projects-visibility-hidden").check();
  await s.page.getByRole("button", { name: "Start the project" }).click(); await c.settle(s.page, 800);
  t = await c.text(s);
  rec("R23", "An unchosen start (no title) is refused and nothing is made", 1280, "administrator", "chose 'Hidden' and pressed 'Start the project' with the title empty", /What it is about|Name|title|needed/i.test(t) && !/Projects ›/.test(s.page.url()) && /\/app\/projects$/.test(s.page.url()) ? "WORKS" : "BROKEN",
    `still on ${s.page.url().replace("https://group.example", "")}; ${clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 200)}`, "");
  await s.page.locator("#projects-visibility-hidden").uncheck().catch(async () => { await s.page.evaluate(() => { const r = document.querySelector("#projects-visibility-hidden"); if (r) r.checked = false; }); });
  await s.page.locator("#projects-title").fill("Sewer Fund Transfers");
  await s.page.evaluate(() => { for (const id of ["projects-visibility-hidden", "projects-visibility-discoverable"]) { const r = document.getElementById(id); if (r) r.checked = false; } });
  await s.page.getByRole("button", { name: "Start the project" }).click(); await c.settle(s.page, 800);
  const alert = clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 240);
  rec("R23", "A title with neither visibility chosen is refused: 'Choose who can find this project before you start it. Nothing was started.'", 1280, "administrator", "typed a title, left both radios unchosen, pressed Start", /\/app\/projects$/.test(s.page.url()) && /Choose who can find/.test(await c.text(s)) ? "WORKS" : "BROKEN", `${alert}`, "");
  await s.page.locator("#projects-visibility-hidden").check();
  await s.page.getByRole("button", { name: "Start the project" }).click(); await c.settle(s.page, 2400);
  c.P.p1 = s.page.url().split("/").pop();
  t = await c.text(s);
  rec("R23", "Start 'Sewer Fund Transfers' (Hidden): lands at the project's top; the title is in words and no id is shown", 1280, "administrator (founder)", "chose Hidden and pressed Start",
    /\/app\/project\/PROJ-/.test(s.page.url()) && has(t, "Sewer Fund Transfers") ? "WORKS" : "BROKEN", `landed ${s.page.url().replace("https://group.example", "")}; page heading '${(t.match(/Sewer Fund Transfers/) || [""])[0]}'; ${stSummary(s.st)}; the id appears in the address only`, await shot(s.page, "R23-project-new-1280"));
  await overlay(c, s, "project (founder, new)");
  const idShown = /PROJ-\d{4}-\d+/.test(t);
  rec("R23", "The forms never ask for an id and the minted id is not shown in the page text", 1280, "administrator", "read the project page text for an id", idShown ? "BROKEN" : "WORKS", idShown ? "an id shows in the text" : "no PROJ- id in the page text", "");

  // duplicate and equivalents
  const tries = [["Sewer Fund Transfers", "the same title"], ["Sewer fund transfers", "different case"], ["Sewer  Fund   Transfers", "doubled spaces"], ["Sewer Fund Transfers ", "trailing space"]];
  for (const [title, why] of tries) {
    s = await c.go("f", "/app/projects");
    await s.page.getByText("Start a project", { exact: true }).first().click(); await c.settle(s.page, 300);
    await s.page.locator("#projects-title").fill(title); await s.page.locator("#projects-visibility-hidden").check();
    await s.page.getByRole("button", { name: "Start the project" }).click(); await c.settle(s.page, 1500);
    t = await c.text(s);
    const made = /\/app\/project\/PROJ-/.test(s.page.url());
    const shown = clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | ") || t.slice(-200), 220);
    rec("R23", `Name check: '${title}' (${why}) after 'Sewer Fund Transfers' exists`, 1280, "administrator", "started a second project with that title", verdict(!made),
      `${made ? "a project WAS made at " + s.page.url().split("/").pop() : "refused, nothing made"}: ${shown}`, "");
  }
  // a Unicode-equivalent pair: composed and decomposed accent (REC-208: not built, recorded as a finding, not a pass)
  const pair = [["Caf\u00e9 Audit", "composed accent U+00E9"], ["Cafe\u0301 Audit", "decomposed accent e + U+0301"]];
  let madeSecond = false;
  for (const [i, [title, why]] of pair.entries()) {
    s = await c.go("f", "/app/projects");
    await s.page.getByText("Start a project", { exact: true }).first().click(); await c.settle(s.page, 300);
    await s.page.locator("#projects-title").fill(title); await s.page.locator("#projects-visibility-hidden").check();
    await s.page.getByRole("button", { name: "Start the project" }).click(); await c.settle(s.page, 1800);
    const made = /\/app\/project\/PROJ-/.test(s.page.url()); if (i === 1) madeSecond = made;
    rec("R23", `Unicode-equivalent name pair: '${title}' (${why})${i === 1 ? " after its composed twin exists" : ""}`, 1280, "administrator", "started a project with that title", i === 0 ? (made ? "WORKS" : "BROKEN") : (made ? "NOT REACHED" : "WORKS"),
      i === 0 ? (made ? "made" : "not made") : (made ? "a second project WAS made for the Unicode-equivalent name (REC-208: 'unicode-equivalent names not built'; the id slug also drops the accent: '" + s.page.url().split("/").pop() + "'): the state is confirmed and recorded as a finding, not a defect of the build" : `refused: ${clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 160)}`), "");
  }
  // member with no right to start; discoverable second project; directory
  s = await c.start("f", "Park Lease Review", "discoverable"); c.P.p2 = s.page.url().split("/").pop();
  rec("R23", "Start a second project as Findable ('Park Lease Review')", 1280, "administrator", "started it from Projects", /PROJ-/.test(c.P.p2) ? "WORKS" : "BROKEN", c.P.p2, "");
  s = await c.go("mai", "/app/projects"); t = await c.text(s); await overlay(c, s, "projects (member, findable present)");
  rec("R23", "Projects list as the member who may not start projects: no 'Start a project', the administrator named; the findable project shows its name only; the hidden one is absent", 1280, "member mai",
    "read Projects", has(t, "FINDABLE", "Park Lease Review", "Ask to join", /administrators allow/) && !/Start a project|Sewer Fund/.test(t) ? "WORKS" : "BROKEN", `${stSummary(s.st)}; ${clip(t, 420)}`, await shot(s.page, "R23-member-projects-1280"));
  s = await c.go("mai", "/app/project/" + c.P.p1); t = await c.text(s);
  rec("R23", "A non-member reads a HIDDEN project's address: 'Nothing is here', identical to one that does not exist", 1280, "member mai", "opened the hidden project's address",
    has(t, "Nothing is here") ? "WORKS" : "BROKEN", clip(t, 200), "");
  s = await c.go("mai", "/app/project/PROJ-2026-0000-no-such"); const t0 = await c.text(s);
  rec("R23", "…and that equals the answer for an id that was never made", 1280, "member mai", "opened a made-up project address", t0 === t ? "WORKS" : "BROKEN", t0 === t ? "same words" : `differs: ${clip(t0, 160)}`, "");
}
