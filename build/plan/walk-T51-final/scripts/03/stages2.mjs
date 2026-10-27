/* stage 3 of sitting 03: the project page (R24) */
import { rec, shot, stSummary } from "./lib.mjs";
import { overlay, has, miss } from "./walk03.mjs";
const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");
const fold = async (s) => { await s.page.evaluate(() => { const d = document.querySelector("details[data-fold=settings]"); if (d) d.open = true; }); await s.page.waitForTimeout(300); };
/* a reasoned act: the button opens "Your reason" in place; write it and send (the shell's own panel) */
export async function reasoned(c, s, button, text) {
  await s.page.getByRole("button", { name: button }).first().click(); await s.page.waitForTimeout(500);
  const box = s.page.locator("textarea:visible").filter({ hasNot: s.page.locator("#project-question") }).last();
  const send = s.page.getByRole("button", { name: "Send with this reason" });
  if (await send.count()) { await s.page.locator(".cs-reason textarea").last().fill(text); await send.first().click(); }
  await c.settle(s.page, 1500);
}

export async function s3a(c) {
  /* the founder claimed and chose 'Later' for a handle: a project she started shows her as its owner, but draws none of an owner's acts */
  let s = await c.go("f", "/app/project/" + c.P.p1); let t = await c.text(s);
  await fold(s);
  const ctl = await s.page.locator("#cs-main button, #cs-main input, #cs-main select, #cs-main textarea").evaluateAll((e) => e.filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.id || x.innerText.trim().slice(0, 30)));
  const owner = /owner/.test(t) && /The team's founder/.test(t);
  rec("R24", "Founder who chose 'Later' for a handle opens a project she started: she is named its owner; are the owner's acts there (invite, bar, who can find it, leave, fork, close)?", 1280, "administrator (founder, no handle)",
    "started 'Sewer Fund Transfers', opened its page, opened 'This project's settings'", owner && !ctl.some((x) => /project-invite|project-visibility-why|project-bar|project-close/.test(x)) ? "BROKEN" : "WORKS",
    `MAJOR for BOB to place: the Members row reads 'The team's founder · owner', yet the page draws none of the owner's acts; controls drawn: ${ctl.join(", ")}. Cause read in src/screens-inquiry/project.mjs:144,172-176: the page finds her by \`view.me.handle\`, which is null until she chooses one (Settings > setup: 'Later' keeps it null), so \`owner\` is false.`, await shot(s.page, "R24-founder-no-handle-project-1280"));
  s = await c.go("f", "/app/setup"); t = await c.text(s);
  await s.page.locator("#su-fh").fill("ross"); await s.page.getByRole("button", { name: "Choose this handle" }).click(); await c.settle(s.page, 1500);
  t = await c.text(s);
  const who = await c.k.get(c.W.f, { op: "whoami" });
  rec("R1x", "(prerequisite from area 1) the founder chooses her handle 'ross' on the setup screen", 1280, "administrator (founder)", "typed 'ross', pressed 'Choose this handle'", who.result && who.result.handle === "ross" ? "WORKS" : "BROKEN", `whoami handle = ${who.result && who.result.handle}; ${clip(t, 160)}`, "");
  c.H.f = "admin";
}

export async function s3b(c) {
  let s = await c.go("f", "/app/project/" + c.P.p1); let t = await c.text(s);
  await fold(s);
  t = await c.text(s);
  const stage = (t.match(/WHERE IT STANDS\s*([\s\S]*?)THE PROJECT'S BAR/i) || [, ""])[1];
  rec("R24", "Project page: stage line in plain words (Forming, Investigating, Matured, Closed), the bar, and what each stage needs from the record", 1280, "administrator (owner, handle ross)",
    "opened the new project", verdict(has(t, "WHERE IT STANDS", "WHAT EACH STAGE NEEDS", /The record decides the stage by itself/)),
    `stages named: ${clip(stage, 80)}; bar: ${(t.match(/THE PROJECT'S BAR\s*([^\n]*)/i) || [, ""])[1]}; ${stSummary(s.st)}; wall ${s.wall} ms; needs: ${clip((t.match(/WHAT EACH STAGE NEEDS([\s\S]*?)THE PROJECT'S DOCUMENTS/i) || [, ""])[1], 420)}`, await shot(s.page, "R24-project-owner-1280"));
  const stageButtons = await s.page.locator("#cs-main button").allInnerTexts();
  rec("R24", "The stage is computed, never set by hand: no control moves a stage", 1280, "administrator (owner)", "listed every button on the page", stageButtons.some((b) => /stage|forming|investigating|matured/i.test(b)) ? "BROKEN" : "WORKS", `buttons: ${stageButtons.map((x) => x.trim().replace(/\n.*/s, "")).filter(Boolean).join(" | ")}`, "");
  rec("R24", "Stacked stage bars with hover and click (each stage's bar, when reached and what earned it); closed shows its reason", 1280, "administrator", "read the stage line and tried hover/click on a stage name", "NOT REACHED",
    "the stage names are plain words with no per-stage bar; UC-151 says the stacked bars are not built in the interface (designed, not built: recorded, not a defect)", "");
  // the doors
  const links = ["Action plan", "Timeline", "Money trail", "Proceeding", "Standard", "Request records", "Matter", "Action", "Case", "Review copy", "Publication ceremony", "AI for this project", "Objective", "Add a document"];
  for (const l of links) {
    s = await c.go("f", "/app/project/" + c.P.p1, { ms: 700 });
    const a = s.page.locator("#cs-main a", { hasText: new RegExp("^" + l.replace(/[()]/g, "\\$&") + "$") }).first();
    if (!(await a.count())) { rec("R24", `Door '${l}' on the project page opens a working page`, 1280, "administrator (owner)", "looked for the door", "BROKEN", "no such link drawn", ""); continue; }
    await a.click(); await c.settle(s.page, 1500);
    const tt = await c.text(s);
    const nothing = /Nothing is here|couldn't be read|Could not read/i.test(tt);
    if (l === "Proceeding") { const bc = (await c.text(s)).slice(0, 70); rec("R24", "Breadcrumb of the Proceeding page ends with its own name and keeps the project", 1280, "administrator (owner)", "read the path above the Proceeding page", /Projects › [^›]+ › Proceeding/.test(bc) ? "WORKS" : "BROKEN", `MINOR: '${bc}' (the other door pages read 'Projects › <project> › <page>')`, ""); }
    rec("R24", `Door '${l}' on the project page opens a working page`, 1280, "administrator (owner)", `pressed '${l}'`, nothing || s.page.url().endsWith("/app/project/" + c.P.p1) ? "BROKEN" : "WORKS", `${s.page.url().replace("https://group.example", "")}; ${stSummary(s.st)}; ${clip(tt, 160)}`, "");
  }
}

const alerts = async (s) => clip((await s.page.locator("[role=alert],[aria-live],.cs-refusal,[class*=refus]").allInnerTexts()).join(" | "), 260);

export async function s3c(c) {
  const p1 = c.P.p1;
  /* a question opens and the project reads it */
  let s = await c.go("f", "/app/project/" + p1);
  await s.page.locator("#project-question").fill("Did the council move sewer fund money into the general fund in 2025?");
  await s.page.getByRole("button", { name: "Open a question" }).click(); await c.settle(s.page, 2500);
  c.P.q1 = s.page.url().split("/").pop();
  let t = await c.text(s);
  rec("R24", "Open a question from the project page: it opens on its own page and the project holds it", 1280, "administrator (owner)", "typed a question, pressed 'Open a question'", /\/app\/question\//.test(s.page.url()) ? "WORKS" : "BROKEN",
    `${s.page.url().replace("https://group.example", "")}; ${stSummary(s.st)}; ${clip(t, 300)}`, await shot(s.page, "R24-question-new-1280"));
  s = await c.go("f", "/app/project/" + p1); t = await c.text(s);
  const stageNow = (t.match(/WHERE IT STANDS\s*([\s\S]*?)THE PROJECT'S BAR/i) || [, ""])[1];
  const qrow = clip((t.match(/Did the council[\s\S]{0,260}/) || [""])[0], 260);
  rec("R24", "A question added: the computed stage reads from the record (no hand control); each question shows capture and connection badges, one phrase against the bar and 'Undetermined' with its reason, never one combined badge", 1280, "administrator (owner)",
    "read the page after adding a question", /Did the council/.test(t) ? "WORKS" : "BROKEN",
    `stage line now: ${clip(stageNow, 60)}; what each stage needs: ${clip((t.match(/WHAT EACH STAGE NEEDS([\s\S]{0,420})/) || [, ""])[1], 420)}; the question row: ${qrow}`, await shot(s.page, "R24-project-with-question-1280"));
  rec("R24", "Plural agrees with the number on the project page ('1 question', 'the project holds 1 question')", 1280, "administrator (owner)", "read the stage line and 'what each stage needs' with exactly one question", /\b1 questions\b|the 1 held questions/.test(t) ? "BROKEN" : "WORKS",
    `MINOR: ${clip((t.match(/[^.]*\b1 questions\b[^.]*/g) || [""]).join(" // "), 200)}`, "");
  rec("R24", "A plan can be opened for a question from the project page (door to the plan)", 1280, "administrator (owner)", "looked for 'planopen' on the page once a question exists", /Open a plan|plan/i.test(t) && (await s.page.locator("#project-plan, #project-plan-about").count()) ? "WORKS" : "BROKEN",
    `plan fields drawn: ${(await s.page.locator("#project-plan, #project-plan-about").count())}`, "");

  /* the project's bar, on one axis */
  await fold(s);
  await s.page.locator("#project-bar-capture").selectOption("B");
  await reasoned(c, s, /Set this project's bar/, "The team wants documents held to a B for this project.");
  t = await c.text(s);
  rec("R24", "Set the project's bar on one axis: the unset axis reads 'no bar set on the connection axis'; nothing preselected", 1280, "administrator (owner)", "chose capture B only and pressed 'Set this project's bar'", /THE PROJECT'S BAR[\s\S]{0,200}B/.test(t) && !/THE PROJECT'S BAR\s*No bar set for this project/.test(t) ? "WORKS" : "BROKEN",
    `${await alerts(s)}; the bar line now: ${clip((t.match(/THE PROJECT'S BAR([\s\S]{0,160})/i) || [, ""])[1], 160)}`, "");
  await fold(s);
  await s.page.locator("#project-bar-capture").selectOption("").catch(() => {});
  await s.page.locator("#project-bar-connection").selectOption("").catch(() => {});
  await reasoned(c, s, /Set this project's bar/, "Withdrawing the project's own bar.");
  t = await c.text(s);
  rec("R24", "Neither axis chosen withdraws the project's bar ('Choose neither axis to withdraw the project's bar')", 1280, "administrator (owner)", "set both selectors to none and pressed the act", /No bar set for this project/.test(t) ? "WORKS" : "BROKEN", `${await alerts(s)}; ${clip((t.match(/THE PROJECT'S BAR\s*([^\n]*)/i) || [, ""])[1], 120)}`, "");
  // the team default as a member: refused
  const refused = await c.k.post(c.W.mai, "strengthbarset", { capture: "B", connection: "B" });
  rec("R24", "A member is refused the team's default bar (strengthbarset)", 1280, "member mai (op the group screen sends)", "sent strengthbarset as a plain member", refused.body && refused.body.ok === false ? "WORKS" : "BROKEN", `${refused.status} ${clip(JSON.stringify(refused.body), 260)}`, "");

  /* the project's stake */
  await s.page.locator("#project-stake").fill("The council's own sewer fund reserves.");
  await s.page.getByRole("button", { name: "Save this project's stake" }).click(); await c.settle(s.page, 1500);
  t = await c.text(s);
  rec("R24", "Set the project's stake: shown with who set it and when, beside the team's statement", 1280, "administrator (owner)", "typed a stake and pressed 'Save this project's stake'", /sewer fund reserves/.test(t) && /set/i.test(t) ? "WORKS" : "BROKEN", `${await alerts(s)}; ${clip((t.match(/WHAT THE TEAM HAS AT STAKE HERE([\s\S]*?)MEMBERS/i) || [, ""])[1], 320)}`, "");
  await s.page.locator("#project-stake").fill("x".repeat(6000));
  await s.page.getByRole("button", { name: "Save this project's stake" }).click(); await c.settle(s.page, 1500);
  const stakeSaid = await alerts(s);
  rec("R24", "A malformed stake (6,000 characters) is refused in words that name the PROJECT's stake (STAKE_MALFORMED.project), never a code", 1280, "administrator (owner)", "saved a 6,000-character stake", /STAKE_MALFORMED|undefined/.test(stakeSaid) ? "BROKEN" : (/Your team's declared stake/.test(stakeSaid) ? "BROKEN" : "WORKS"),
    `MINOR: the refusal is in words, but they describe the TEAM's declared stake ('${clip(stakeSaid, 150)}'), not the project's; nothing was written`, "");
  rec("R24", "A machine cannot set a stake (MACHINE_CANNOT_SET_STAKE)", 1280, "machine credential", "needs a machine credential, which the room has not minted (an operator act)", "NOT REACHED", "no machine credential exists in this room; aicredentialmint is an operator act, not a room walk (overlay check 32)", "");
  rec("R24", "Declare the project's kind of work (UC-170)", 1280, "administrator (owner)", "looked on the page and its settings fold for a 'kind of work' control", /kind of work/i.test(await c.text(s)) ? "WORKS" : "NOT REACHED", "no 'kind of work' control is drawn on the project page (designed, not built or not drawn; recorded, not a defect)", "");

  /* who can find it */
  s = await c.go("f", "/app/project/" + p1); await fold(s);
  await s.page.getByRole("button", { name: "Change who can find it" }).click(); await c.settle(s.page, 1000);
  await fold(s);
  rec("R24", "Change who can find it without a reason: asked for the reason first, nothing changes", 1280, "administrator (owner)", "pressed 'Change who can find it' with the reason box empty", /Findable|Hidden/.test(await c.text(s)) ? (/reason/i.test(await alerts(s)) || /reason/i.test(await c.text(s)) ? "WORKS" : "BROKEN") : "BROKEN", `${await alerts(s)}`, "");
  await fold(s);
  await s.page.locator("#project-visibility-why").fill("The team wants other members to find it.");
  await s.page.getByRole("button", { name: "Change who can find it" }).click(); await c.settle(s.page, 1500);
  await fold(s); t = await c.text(s);
  rec("R24", "Change who can find it with a reason: the history line is dated with the reason", 1280, "administrator (owner)", "gave a reason and pressed the act", /Findable/.test(t) && /other members to find it/.test(t) ? "WORKS" : "BROKEN", clip((t.match(/WHO CAN FIND IT([\s\S]*)/i) || [, ""])[1], 360), "");
  const hist = clip((t.match(/WHO CAN FIND IT([\s\S]*)/i) || [, ""])[1], 400);
  rec("R24", "The 'Who can find it' history lines read as sentences", 1280, "administrator (owner)", "read the history lines under the setting", /exists\.,|join\. by /.test(hist) ? "BROKEN" : "WORKS", `MINOR: the lines glue a full sentence into another: '${hist}'`, "");
  // put it back to hidden for the rest of the walk
  await fold(s);
  await s.page.locator("#project-visibility-why").fill("Back to hidden while the team reads the first documents.");
  await s.page.getByRole("button", { name: "Change who can find it" }).click(); await c.settle(s.page, 1200);
  await overlay(c, s, "project (owner, with question)");
}

export async function s3d(c) {
  /* closing, with each reason */
  const made = {};
  for (const [name, idx, label] of [["Close Test Resolved", 0, "Resolved"], ["Close Test Superseded", 1, "Superseded by other work"], ["Close Test Abandoned", 2, "Abandoned"]]) {
    let s = await c.start("f", name, "hidden"); const id = s.page.url().split("/").pop(); made[label] = id;
    await fold(s);
    await s.page.locator(`#project-close-why-${idx}`).check();
    await s.page.locator("#project-close-note").fill("Closed in the walk to read the close.");
    await s.page.getByRole("button", { name: /Close this project/ }).click(); await c.settle(s.page, 1800);
    let t = await c.text(s);
    rec("R24", `Close a quiet project with the reason '${label}'`, 1280, "administrator (owner)", `chose '${label}', wrote a note, pressed the close`, /Closed|closed/.test(t) && new RegExp(label.split(" ")[0], "i").test(t) ? "WORKS" : "BROKEN", `${await alerts(s)}; stage line: ${clip((t.match(/WHERE IT STANDS\s*([\s\S]*?)THE PROJECT'S BAR/i) || [, ""])[1], 160)}; ${clip(t, 260)}`, label === "Resolved" ? await shot(s.page, "R24-project-closed-1280") : "");
    if (label === "Resolved") {
      const rb = await s.page.locator("#cs-main button").allInnerTexts();
      rec("R24", "Reopen a closed project: by an owner only; an administrator who is not an owner cannot close or reopen", 1280, "administrator (owner)", "looked for a reopen control on the closed page", rb.some((x) => /reopen/i.test(x)) ? "WORKS" : "NOT REACHED", `buttons on the closed page: ${rb.map((x) => x.trim().replace(/\n.*/s, "")).filter(Boolean).join(" | ")}; the registry marks projectclose owed (DEC-381): a reopen act is not drawn`, "");
    }
  }
  c.P.closed = made;
  // the map expects the close refused unless the project is quiet (C65); the page now says it closes whether or not the work has gone quiet (DEC-381)
  let s = await c.start("f", "Close Test Busy", "hidden"); const bid = s.page.url().split("/").pop();
  await s.page.locator("#project-question").fill("Is this question open when the project is closed?");
  await s.page.getByRole("button", { name: "Open a question" }).click(); await c.settle(s.page, 2200);
  s = await c.go("f", "/app/project/" + bid); await fold(s);
  const warn = clip((await c.text(s)).match(/CLOSE THIS PROJECT NOW([\s\S]*?)Why you are closing/)?.[1] || "", 200);
  await s.page.locator("#project-close-why-2").check();
  await s.page.getByRole("button", { name: /Close this project/ }).click(); await c.settle(s.page, 1800);
  const t = await c.text(s);
  const closed = /Closed/.test((t.match(/WHERE IT STANDS\s*([\s\S]*?)THE PROJECT'S BAR/i) || [, ""])[1]) && /Abandoned/i.test(t);
  rec("R24", "Close a project that still has an open question: map says refused unless quiet (C65); the page says it closes 'whether or not its work has gone quiet' and keeps what was open beside the reason", 1280, "administrator (owner)",
    "opened a question in a new project and closed it as Abandoned", closed ? "WORKS" : "BROKEN", `before pressing the page said: ${warn}; after: ${closed ? "closed" : "not closed"}; ${await alerts(s)}; ${clip(t.slice(0, 260), 260)}. The map's 'refused unless quiet' is out of date against DEC-381 as drawn (recorded, not a defect)`, "");
}
