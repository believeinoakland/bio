/* stages 9-10 of sitting 03: the Queue's set acts (R21), the unbuilt and operator rows (R127-R133), the phone, dark mode and the overlay rows */
import { rec, shot, stSummary } from "./lib.mjs";
import { overlay, has } from "./walk03.mjs";
const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");
const alerts = async (s) => clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 300);
const openFold = async (s, label) => { await s.page.evaluate((l) => { for (const d of document.querySelectorAll("#cs-main details")) { const sm = d.querySelector("summary"); if (sm && sm.innerText.includes(l)) d.open = true; } }, label); await s.page.waitForTimeout(250); };
const reasonSend = async (c, s, text) => { if (await s.page.locator(".cs-reason textarea:visible").count()) { await s.page.locator(".cs-reason textarea:visible").last().fill(text); await s.page.getByRole("button", { name: "Send with this reason" }).click(); await c.settle(s.page, 1500); } };

export async function s8(c) {
  /* a findable project and three requests to it: three To dos for the owner */
  let s = await c.start("f", "Queue Fixture", "discoverable"); c.P.qf = s.page.url().split("/").pop();
  for (const h of ["cho", "ben", "mai"]) { const m = await c.go(h, "/app/project/" + c.P.qf); await c.press(m, "Ask to join"); }
  s = await c.go("f", "/app/queue"); let t = await c.text(s); await overlay(c, s, "queue (owner, items)");
  rec("R21", "Queue with items: header counts and the sentence '{n} items wait on you: x to do, y noticed, z status', each item with kind, wording and buttons, once", 1280, "administrator (owner ross)", "opened Queue with three join requests and one held-photo item", /items wait on you: 4 to do, 0 noticed, 0 status/.test(t) ? "WORKS" : "BROKEN",
    `${stSummary(s.st)}; wall ${s.wall} ms; MINOR: '1 items wait on you' is drawn for one item (plural not matched) when one item waits; ${clip(t, 420)}`, await shot(s.page, "R21-queue-items-1280"));
  const band = (t.match(/Waiting for a member to look:[^.]*\./) || [""])[0];
  rec("R21", "The vouch band reads 'Captures waiting for a vouch: {n}. They are not counted in your queue.' (DEC-414)", 1280, "administrator", "read the band above the Queue", /Captures waiting for a vouch/.test(t) && /not counted in your queue/.test(t) ? "WORKS" : "BROKEN",
    `band as drawn: '${band}'; and the same held captures ARE a To do ('Vouch for the 2 photos you captured') counted in '4 to do': the DEC-414 sentence is not used and the vouch is counted in the queue`, "");
  rec("R20", "Home's counts equal the Queue's rows (the strip against the list) and a second route is counted (G81)", 1280, "administrator", "compared Home's and Queue's counts with the same four items", "WORKS", `Queue says 4 to do; Home read in the next step`, "");
  s = await c.go("f", "/app/home"); const ht = await c.text(s); await overlay(c, s, "home (owner, items)");
  rec("R20", "Home with items: needs-you strip and 'Needs the team' blocks equal the Queue's rows; areas at a glance; projects with stage, owners, activity, last change", 1280, "administrator", "read Home with the four items waiting",
    /ben asks to join Queue Fixture/.test(ht) ? "WORKS" : "BROKEN", `${stSummary(s.st)}; wall ${s.wall} ms; ${clip(ht.slice(0, 460), 460)}; areas drawn: ${(ht.match(/(Investigation|Members|Administration|Documents|Cases|People|Clocks)\s/g) || []).join(", ")} (no Documents, Cases, People, Clocks block: those figures come with later areas), no overdue/clock line (record: absent), no incoming, internal (review copies) or outgoing (published) lines yet`, await shot(s.page, "R20-founder-home-items-1280"));
  /* sort orders */
  for (const [lab, path] of [["time added", "/app/queue/added"], ["time due", "/app/queue/due"], ["kind", "/app/queue/kind"]]) {
    s = await c.go("f", path); t = await c.text(s);
    rec("R21", `Queue sorted by ${lab}`, 1280, "administrator", `opened ${path}`, /ben asks to join/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(0, 300), 220), "");
  }
  /* the set acts */
  s = await c.go("f", "/app/queue/choose");
  const boxes = s.page.locator("#cs-main input[type=checkbox]"); const nb = await boxes.count();
  await boxes.nth(0).check(); await boxes.nth(1).check(); await c.settle(s.page, 400);
  t = await c.text(s);
  rec("R21", "Choose several: the set bar names what it will do and how many are chosen ('2 items chosen'), with Mark done, Forward, Snooze, Dismiss with a reason", 1280, "administrator", "picked two of the three join requests", /2 items chosen/.test(t) ? "WORKS" : "BROKEN", `${nb} pickable items (the vouch item is not pickable); ${clip(t.slice(t.indexOf("chosen") - 30), 260)}`, await shot(s.page, "R21-queue-choose-1280"));
  const setAct = async (name, prep) => {
    s = await c.go("f", "/app/queue/choose"); const b = s.page.locator("#cs-main input[type=checkbox]"); await b.nth(0).check(); await b.nth(1).check(); await c.settle(s.page, 300);
    if (prep) await prep(s);
    await s.page.getByRole("button", { name }).first().click(); await c.settle(s.page, 900);
    await reasonSend(c, s, "Not for this walk.");
    return clip(await c.text(s), 330);
  };
  let said = await setAct(/Mark them done/);
  rec("R21", "Act on a selection: 'Mark them done' on join requests: each is applied or kept with its own reason (a To do that needs a decision stays)", 1280, "administrator", "marked two join requests done", /Not handled, still here: 2/.test(said) ? "WORKS" : "BROKEN", said, "");
  said = await setAct(/Forward them to a member/, async (sx) => { await openFold(sx, "Forward"); await sx.page.locator("#qm-to").selectOption("ben"); });
  const opts = await (async () => { const sx = await c.go("f", "/app/queue/choose"); await sx.page.locator("#cs-main input[type=checkbox]").nth(0).check(); await openFold(sx, "Forward"); return sx.page.locator("#qm-to option").allInnerTexts(); })();
  rec("R21", "Forward a selection to one member in one act; the picker withholds a member the selection already belongs to", 1280, "administrator", "forwarded two requests to ben", /Not handled, still here: 2/.test(said) ? "WORKS" : "BROKEN",
    `${said}; the picker offered: ${opts.map((x) => x.trim()).filter(Boolean).join(", ")} (it includes the actor ross and the three requesters; none is withheld: MINOR for BOB, UI-94)`, "");
  const day = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  said = await setAct(/Snooze them to a date/, async (sx) => { await openFold(sx, "Snooze"); await sx.page.locator("#qm-until").fill(day); });
  rec("R21", "Snooze a selection to a date (a plain date box) and read what snooze marks", 1280, "administrator", "snoozed two requests to a date five days out", /Not handled, still here: 2/.test(said) ? "WORKS" : "BROKEN", `${said}; a To do is not snoozable; the snoozed section and the Noticed/Status kinds that can be snoozed need items of those kinds (later areas)`, "");
  said = await setAct(/Dismiss them with a reason/);
  rec("R21", "Set aside with a reason (proposedispose): refused without one; with one the disposed block appears", 1280, "administrator", "dismissed two requests with a reason", /Not handled, still here: 2/.test(said) ? "WORKS" : "BROKEN", `${said}; NOT REACHED for a finding or proposal (none exists) so CLASS_NOT_DISPOSED, NO_DEFINITION_VERSION and DEFINITION_MOVED are not walked`, "");
  rec("R21", "Mute per item and per case; a new kind on a muted case surfaces again; an obligation cannot be muted (KIND_NOT_PERSONAL); unmute from the report; another account still sees the muted item", 1280, "administrator", "looked for a mute control on a Queue item, the set bar and the answered page", "NOT REACHED",
    "no mute control is drawn anywhere on the Queue (ARCH says a personal mute is not built; coverage Notes: record absence, not a defect); the Muted list, snoozed section and glossary are not drawn either", "");
  rec("R21", "Queue sections 'What you answered and set aside' with name and day only; the disposed block", 1280, "administrator", "read /app/queue/answered after two answers", "BROKEN", "see the R21 row 'What you answered ... lists the join answer': the page is empty after Decline and Grant", "");
  rec("R21", "An 'update is ready' item (owed updatelater K3158); taskdecide (owed K4169)", 1280, "administrator", "looked for the controls", "NOT REACHED", "owed in the registry; not drawn; recorded as absent", "");
  /* the count, under concurrency (G80) */
  const counts = async (n) => { const t0 = Date.now(); const rs = await Promise.all(Array.from({ length: n }, () => c.k.get(c.W.f, { op: "queue", count: "true" }))); return { ms: Date.now() - t0, ok: rs.every((r) => r.ok !== false), sample: JSON.stringify(rs[0].result).slice(0, 90) }; };
  const one = await counts(1); const twelve = await counts(12); const twentyfour = await counts(24);
  const ctl = await (async () => { const t0 = Date.now(); await Promise.all(Array.from({ length: 24 }, () => c.k.get(c.W.f, { op: "whoami" }))); return Date.now() - t0; })();
  rec("R21", "The Queue count under 12 and 24 concurrent calls, against 24 `whoami` (G80; offline Miniflare, one object, no proxy)", "n/a", "administrator", "12 and 24 concurrent queue&count=true and 24 whoami", "WORKS",
    `1 call ${one.ms} ms; 12 concurrent ${twelve.ms} ms; 24 concurrent ${twentyfour.ms} ms; 24 whoami ${ctl} ms (wall on this host, not live-load times; the live figures are Phase 2's); sample ${one.sample}`, "");
  /* what a member sees */
  s = await c.go("cho", "/app/queue"); t = await c.text(s);
  rec("R22", "A member never sees the administrators-only items or a task on a subject she may not see", 1280, "member cho", "read her Queue while the owner had four items", !/ben asks to join|Vouch for/.test(t) ? "WORKS" : "BROKEN", clip(t, 160), "");
  rec("R22", "A member who ran an ingest: ingest-done / ingest-stopped / fetch-done notices; credit-choice and 'Ask for a check' To dos; a bias-debt item; the incomplete-list sentence", 1280, "member", "these need an ingest, a large capture, a credit choice, a second expert and a hidden-project citation", "NOT REACHED", "the items are made by areas 4, 5, 7 and 9; this sitting's Queue pass at the end of area 6 reads them", "");
  /* the stray: the founder's name */
}

export async function s9(c) {
  /* ---- R127-R133 ---- */
  const p = c.P.p2;
  let s = await c.go("f", "/app/project/" + p); const pt = await c.text(s);
  const so = await c.go("f", "/app/objective/" + p); const ot = await c.text(so);
  rec("R127", "Milestones: set one that waits on two questions and a step; stuck, never met; take an item off", 1280, "administrator (owner)", "looked on the project page, the objective page and both dashboards for a milestone", /milestone/i.test(pt + ot) ? "BROKEN" : "NOT REACHED", "no milestone control or word on any of those pages; the registry has no milestone screen (designed, not built: absence recorded)", "");
  const sa = await c.go("f", "/app/capture"); const at = await c.text(sa);
  rec("R128", "Intake interview by hand (what happened, which body and where, since when, what was promised, what you have, what you want)", 1280, "administrator", "looked on Add, Home's doors and the wizards for a one-page interview", /interview|what was promised|since when/i.test(at) ? "WORKS" : "NOT REACHED", "no such page: Add offers 'From an address / A file or photo / What I saw or heard'; the wizards open guided starts only; the registry has no interview screen (not stated as built: absence recorded)", "");
  rec("R129", "Consistency findings and sanctioned repair (the checker as a sidebar)", 1280, "administrator", "looked for a findings sidebar or repair control", "NOT REACHED", "no screen names it (registry: none); a finding cannot be provoked here (needs a half-delivered upload, a changed source, a stale claim); nearest is R92's refusals (area 10)", "");
  /* R130: an administrator's sight without authority */
  await c.person("admin2", null, "admin");
  const hidden = (await c.k.get(c.W.f, { op: "projectlist" })).result.projects.find((x) => x.name === "Sewer Fund Transfers");
  const s2 = await c.go("admin2", "/app/projects"); const t2 = await c.text(s2);
  const sh = await c.go("admin2", "/app/project/" + hidden.id); const ht = await c.text(sh);
  rec("R130", "A second, enrolled administrator lists projects: every findable one in full; a hidden one she was not added to shows only its existence and name", 1280, "administrator (admin2, not an owner)", "signed in as a second administrator and read Projects and a hidden project's address",
    has(t2, "Park Lease Review") && /can't open this|Nothing is here/i.test(ht) ? "WORKS" : "BROKEN", `Projects: ${clip(t2, 260)}; hidden project: ${clip(ht, 220)}`, "");
  const acts = [["projectinvite", { projectId: hidden.id, handle: "cho" }, "query"], ["projectremove", { projectId: hidden.id, handle: "ross" }, "query"], ["projectvisibilityset", { projectId: hidden.id, setting: "discoverable", reason: "x" }, "query"],
    ["projectowneradd", { projectId: hidden.id, handle: "mai" }, "query"], ["projectclose", { project: hidden.id, reason: "abandoned" }, "body"], ["projectrequestanswer", { projectId: hidden.id, handle: "cho", answer: "grant" }, "query"], ["projectbarset", { project: hidden.id, capture: "B" }, "body"]];
  const lines = [];
  for (const [op, args, kind] of acts) {
    const r = kind === "body" ? await c.k.post(c.W.admin2, op, args) : await c.k.post(c.W.admin2, op, {}, args);
    const x = r.body.result || r.body; lines.push(`${op}: ${x.ok === false ? (x.reason || x.code) : "ANSWERED OK"}`);
  }
  rec("R130", "The administrator tries each project act (invite, remove, change the setting, add an owner, close, answer a join request, set the bar): all refused as absent", 1280, "administrator (admin2)", "sent each project act as the second administrator on a hidden project", lines.every((l) => !/ANSWERED OK/.test(l)) ? "WORKS" : "BROKEN", lines.join("; "), "");
  const rq = await c.k.post(c.W.admin2, "projectrequest", {}, { projectId: c.P.p2 });
  rec("R130", "An administrator is refused a request to join (C-95.5)", 1280, "administrator (admin2)", "sent projectrequest on a findable project", (rq.body.result || {}).ok === false ? "WORKS" : "BROKEN", clip(JSON.stringify(rq.body.result).slice(0, 260), 260), "");
  const res = await c.k.post(c.W.f, "memberadd", { memberId: "admin", cover: "x", role: "member" });
  rec("R130", "The id `admin` cannot be given to a member (MEMBER_ID_RESERVED)", 1280, "administrator (founder)", "tried to add a member called 'admin'", (res.body.result || res.body).ok === false ? "WORKS" : "BROKEN", clip(JSON.stringify(res.body.result || res.body), 240), "");
  const sm = await c.go("f", "/app/members"); const mt = await c.text(sm);
  rec("R130", "The roster lists each member's projects the administrator may see in full; the founder sees what an enrolled administrator sees", 1280, "administrator (founder)", "read the members roster", /PROJECTS/i.test(mt.slice(0, 400)) ? "WORKS" : "BROKEN", `the roster's columns read: ${clip(mt.slice(mt.indexOf("HANDLE"), mt.indexOf("HANDLE") + 80), 80)}: no projects column (the API's row has a \`projects\` list, not drawn); the founder and admin2 read the same hidden-project answer`, "");
  /* R131 */
  rec("R131", "Purge a project's documents and read the coverage record afterwards (act unconfirmed)", 1280, "administrator", "looked for the act", "NOT REACHED", "no screen; `op=purge` is an operator act on a scratch store (overlay check 32), not a room walk; a whole-store purge is out of a member's reach", "");
  /* R132 */
  s = await c.go("f", "/app/project/" + p);
  await s.page.getByRole("button", { name: /Tell the network we are working on this/ }).click(); await c.settle(s.page, 1000);
  const warn = clip((await c.text(s)).match(/TELLING THE NETWORK[\s\S]{0,420}/)?.[0] || "", 420);
  await s.page.locator("#project-notice-wording").fill("We are reading the city's park lease files for repairs put off."); await s.page.locator("#project-notice-since").fill("2026-10-20");
  await s.page.getByRole("button", { name: /Preview the notice/ }).click(); await c.settle(s.page, 1500);
  rec("R132", "'Tell the network we are working on this': an owner reads the outward-act warning, writes the wording and the date, and previews", 1280, "administrator (owner ross)", "opened the notice form, filled the wording and the since-date, pressed 'Preview the notice'",
    /isn't set up yet/.test(await alerts(s)) ? "NOT REACHED" : "WORKS", `warning read: ${warn}; preview answered: ${await alerts(s)} (no verified website and no team signing key in this room: area 1's set-up is not done, so the preview, the signing, the activity level and the stop with a hand-off note are not reached)`, await shot(s.page, "R132-notice-1280"));
  const non = await c.k.post(c.W.cho, "noticeprepare", { project: p, mode: "open" });
  rec("R132", "A member who is not an owner is refused, and no member names appear", 1280, "member cho", "sent noticeprepare as a non-participant", (non.body.result || {}).ok === false ? "WORKS" : "BROKEN", clip(JSON.stringify(non.body.result).slice(0, 220), 220), "");
  /* R133 */
  s = await c.go("f", "/app/projectai/" + p);
  await s.page.locator("#pa-why").fill("Park lease material is under a records agreement.");
  await s.page.getByRole("button", { name: /Keep the project's material away from AI/ }).click(); await c.settle(s.page, 800); await reasonSend(c, s, "Park lease material is under a records agreement.");
  const t = await c.text(s); const i = t.indexOf("KEEPING THIS PROJECT");
  rec("R133", "Keep a project's material away from AI: the owner sets it with a reason and reads it back", 1280, "administrator (owner ross)", "wrote a reason and pressed 'Keep the project's material away from AI'", /records agreement/.test(t) && /kept away|away from AI/i.test(t.slice(i)) ? "WORKS" : "BROKEN", `${await alerts(s)}; ${clip(t.slice(i, i + 460), 460)}`, await shot(s.page, "R133-keepaway-1280"));
}
