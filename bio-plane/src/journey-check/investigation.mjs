/* journey-check R9, R10 (K3320, K3324 (2); K3347): the journey from a claimed group to a first conclusion, as the
   administrator (R9) and as a member (R10), each step through the screens' own controls (journeys.mjs `act`, `control`,
   `type`; a link a person follows), with ops called only to observe. Each step asserts what the design (journey 29,
   DEC-245; the question's states, DEC-256) says the screen then shows, by the word's key (R14, words.mjs), and the walk
   fails on any refused or missing step (R8, walker.mjs). The assistant is connected by the person's own Claude
   subscription on `connect` (K3347): in the local arm through the runner's stand-in and its sign-in page (R11), in the
   live arm through the real sign-in, whose code the person types (R12). */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { settle } from "./walker.mjs";
import { act, control, type, open, requireDrawn } from "./journeys.mjs";
import { requireWord, byWord, wordPattern } from "./words.mjs";
import { NOTICE_ADDRESS, NOTICE_PASSAGE } from "./city.mjs";

export const PROJECT_TITLE = "Roof repairs at 14 Lakeshore Row";
export const QUESTION = "Has the landlord been ordered to repair the roof of 14 Lakeshore Row?";
/* The file the walk uploads into the question (R9 step 5): a tenant's own note, written by the walk into its output. */
export const UPLOAD_NAME = "flat-4-ceiling-note.txt";
export const UPLOAD_TEXT = "Flat 4, 14 Lakeshore Row. Water came through the ceiling on 29 September and again on 1 October 2026.\n";
/* The words the walk Finds in the held notice (step 7): a phrase of its passage. */
export const FIND_PHRASE = "repair the roof";
/* How long the walk waits for a run to end and its proposal to be drawn (steps 9, 10). */
export const RUN_WAIT_MS = 180000;
/* The co-attestations a capture asks for that the local arm does not stand in for (local.mjs `OUTSIDE`): their failed
   attempts, and an empty generic reading, are expected where they sit in the capture's answer, and nowhere else. */
export const CAPTURE_EXPECTS = Object.freeze([{ at: /\.attestation_attempts\[\d+\]$/, code: "ok: false" }, { at: /(?:^|\.)reading$/, code: "found: false" }]);

const where = (page) => new URL(page.url()).pathname;

/* The record id at the end of the page's address (a project's, a question's, a document's). */
const idOf = (page) => decodeURIComponent(where(page).split("/").filter(Boolean).pop() || "");

/* Follows the link or control whose text is the word `key`, as a person does. */
async function follow(page, key, vars) {
  const l = byWord(page, key, vars, "#cs-main");
  try { await l.waitFor({ state: "visible", timeout: 10000 }); }
  catch { throw new Error(`no link or control "${key}" on ${where(page)}`); }
  await l.click();
  await settle(page);
}

/* Reads the sign-in's code where the person reads it: the page the screen's link opens in a new tab (the stand-in in
   the local arm), or, in the live arm, `codeOf()`, which asks the person and answers what she typed. The code is kept
   secret by the walk and masked in every screenshot. */
async function signinCode(walk, page, codeOf) {
  const link = page.locator('#cs-main a[href^="https://"][target="_blank"]').first();
  try { await link.waitFor({ state: "visible", timeout: 10000 }); }
  catch { throw new Error(`the screen shows no link to Anthropic's sign-in page on ${where(page)}`); }
  if (codeOf) {
    const code = await codeOf(await link.getAttribute("href"));
    if (typeof code !== "string" || !code) throw new Error("the sign-in was not completed: no code from Anthropic's page was typed");
    return walk.keepSecret(code);
  }
  const tab = page.context().waitForEvent("page", { timeout: 15000 });
  await link.click();
  const t = await tab;
  try {
    await t.waitForLoadState();
    return walk.keepSecret((await t.locator("#signin-code").textContent()).trim());
  } finally { await t.close().catch(() => {}); }
}

/* Step 4 (and R10's connection): the person's own Claude subscription, on `connect`, through its own controls: show what
   connecting means, open Anthropic's sign-in page, copy its code, connect. */
export async function connectSubscription(walk, page, base, { password, codeOf = null, label = "4 · connect an assistant by her own Claude subscription" }) {
  await walk.step(page, label, async (p) => {
    await open(walk, p, base, "/app/connect", "connect");
    if (await p.locator('[data-act="disclosureshown"]').count()) await act(p, "disclosureshown");
    await act(p, "subscriptionsignin", { password });
    const code = await signinCode(walk, p, codeOf);
    await act(p, "subscriptionsignin", { fields: { "mc-code0": code }, nth: 1, password });
    await requireWord(p, "screen.connect.own.subscription", { within: "#cs-main" });
  }, { expect: ["REAUTH_DUE"] });
}

/* Steps 2 and 3: a project with a title, opened; a question in it, opened. Answers the project's and question's
   addresses. */
async function projectAndQuestion(walk, page, base, { title, question }) {
  let project = null, q = null;
  await walk.step(page, "2 · start a project with a title, and open it", async (p) => {
    await open(walk, p, base, "/app/projects", "projects");
    await act(p, "promote", { fields: { "projects-title": title }, reason: "Tenants of 14 Lakeshore Row report water coming in." });
    if (!/^\/app\/project\//.test(where(p))) await p.locator("#cs-main a").filter({ hasText: title }).first().click();
    await settle(p);
    await requireDrawn(walk, p, "project");
    await requireTitle(p, title);
    project = p.url();
  });
  await walk.step(page, "3 · open a question in it", async (p) => {
    await act(p, "promote", { fields: { "project-question": question }, reason: "This is what the tenants need answered." });
    await requireDrawn(walk, p, "question");
    await requireTitle(p, question);
    await requireWord(p, "question.empty.heading", { within: "#cs-main" });
    q = p.url();
  });
  return { project, question: q };
}

/* The page's title is `text`, the record's own words. */
async function requireTitle(page, text) {
  const h = (await page.locator("#cs-main h1").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
  if (h !== text) throw new Error(`the title drawn is "${h}", not "${text}"`);
}

/* Steps 5 and 6: from the question's "Add a document", a capture by address and one by upload, each into the question;
   both held; one vouched for. Answers the vouched document's address. */
async function captureAndVouch(walk, page, base, { question, password }) {
  await walk.step(page, "5 · capture by address into the question, from its \"Add a document\"", async (p) => {
    await p.goto(question); await settle(p);
    await follow(p, "question.adddoc");
    await requireDrawn(walk, p, "capture");
    await act(p, "acquire", { fields: { "ci-address": NOTICE_ADDRESS }, password });
    await requireWord(p, "screen.capture.address.done", { within: "#cs-main" });
  }, { expect: CAPTURE_EXPECTS });
  await walk.step(page, "5 · capture by upload into the question", async (p) => {
    await p.goto(question); await settle(p);
    await follow(p, "question.adddoc");
    await p.locator('#cs-main a[href^="/app/capture/file"]').first().click();
    await settle(p);
    const dir = join(walk.out, "upload");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, UPLOAD_NAME), UPLOAD_TEXT);
    await p.locator("#ci-file").setInputFiles(join(dir, UPLOAD_NAME));
    await p.locator("#ci-how-made").first().check();
    await type(p, "ci-where", "Flat 4, 14 Lakeshore Row, 1 October 2026");
    await type(p, "ci-what", "My note of when the water came through the ceiling.");
    await act(p, "captureupload", { password });
    await requireWord(p, "screen.capture.file.done", { within: "#cs-main" });
  }, { expect: CAPTURE_EXPECTS });
  let document = null;
  await walk.step(page, "6 · see both held, and vouch for one", async (p) => {
    await open(walk, p, base, "/app/held", "held");
    const picks = p.locator('#cs-main input[type="checkbox"][data-table="held"]');
    if ((await picks.count()) < 2) throw new Error(`${await picks.count()} captures are held, not both`);
    const row = p.locator("#cs-main tr").filter({ has: p.locator(`a[href^="/app/document/"]`) }).filter({ hasText: NOTICE_ADDRESS }).first();
    document = new URL(await row.locator('a[href^="/app/document/"]').first().getAttribute("href"), base).href;
    await row.locator('input[type="checkbox"][data-table="held"]').check();
    await act(p, "release", { fields: { "ch-ack": "The copy is the notice the city published at that address", "ch-mitigation": "None remains" } });
    await requireWord(p, "screen.held.released", { vars: { count: 1 }, within: "#cs-main" });
  });
  return document;
}

/* Steps 7 and 8: the document opened, its words seen, a passage found in it, and cited on the question as supporting. */
async function readAndCite(walk, page, { document }) {
  await walk.step(page, "7 · open the document, see its words, and Find-in a passage", async (p) => {
    await p.goto(document); await settle(p);
    await requireDrawn(walk, p, "document");
    if (!(await p.locator("#cs-main").textContent()).replace(/\s+/g, " ").includes(NOTICE_PASSAGE))
      throw new Error("the document's words are not drawn on its page");
    await act(p, "findin");
    const box = p.locator('#cs-main input[type="search"]:visible, #cs-main [data-findin] input:visible').first();
    try { await box.waitFor({ state: "visible", timeout: 10000 }); } catch { throw new Error(`Find-in shows no field to type in on ${where(p)}`); }
    await box.fill(FIND_PHRASE);
    await box.press("Enter");
    await settle(p);
    if (!(await p.locator("#cs-main").textContent()).includes(FIND_PHRASE)) throw new Error("Find-in found no passage holding the phrase");
  });
  await walk.step(page, "8 · cite it with a role (supports)", async (p) => {
    /* the role is chosen before citing (screen.findin.cite.norole) */
    const role = p.locator('#cs-main select[id*="role"]:visible').first();
    if (await role.count()) await role.selectOption("supports");
    await act(p, "cite", { reason: "The notice orders the repair." });
    await requireWord(p, "ref.here.cited.support", { within: "#cs-main", timeout: 15000 });
  });
}

/* Steps 9 and 10: the assistant run on the question from the dock; its answer and its suggested reading read. */
async function runAndRead(walk, page, { question }) {
  await walk.step(page, "9 · run the assistant on the question from the dock", async (p) => {
    await p.goto(question); await settle(p);
    await act(p, "airunopen", { within: '[data-dock], #cs-dock, .cs-dock' });
    await requireWord(p, "question.run.heading", { timeout: 20000 });
  });
  await walk.step(page, "10 · read its run's answer and its suggested reading", async (p) => {
    const until = Date.now() + RUN_WAIT_MS;
    for (;;) {
      await p.goto(question); await settle(p);
      if (wordPattern("question.proposal.heading").test((await p.locator("body").textContent()).replace(/\s+/g, " "))) break;
      if (Date.now() > until) throw new Error("the run's proposal was not drawn within its wait");
      await p.waitForTimeout(3000);
    }
    await requireWord(p, "question.proposal.heading");
  });
}

/* Step 11: Ask, and the answer read. */
async function ask(walk, page, { question, words }) {
  await walk.step(page, "11 · Ask, and read the answer", async (p) => {
    await p.goto(question); await settle(p);
    const field = p.locator('[data-dock] textarea:visible, #cs-dock textarea:visible, .cs-dock textarea:visible').first();
    await (await control(p, "ask")).click().catch(() => {});
    try { await field.waitFor({ state: "visible", timeout: 10000 }); } catch { throw new Error(`the dock shows no field to Ask in on ${where(p)}`); }
    await field.fill(words);
    await act(p, "ask");
    /* the answer is drawn labelled machine work (screen.assistant.notevidence) */
    await requireWord(p, "screen.assistant.notevidence", { timeout: 60000 });
  });
}

/* Step 12: the proposed reading accepted, stood on for the project, and concluded. */
async function concludeOn(walk, page, { question, project }) {
  await walk.step(page, "12 · accept a reading, stand on it for the project, and conclude", async (p) => {
    await p.goto(question); await settle(p);
    await act(p, "versionaccept", { reason: "I read the notice; it says the repair was ordered." });
    await act(p, "versioncurrent", { reason: "The project stands on the city's own order." });
    await act(p, "conclude", { fields: { "question-conclude-falsifier": "The city withdrawing or amending notice 2026-118",
      "question-conclude-commentary": "The city's notice orders the landlord to repair the roof within 28 days." },
    reason: "The notice answers the question." });
    await requireWord(p, "question.concluded.by", { within: "#cs-main" });
  });
}

/** R9: the administrator's journey, from her claimed group (journey 28 has claimed it and signed her in by her handle,
 *  step 1) to a first conclusion. `codeOf` (live arm, R12) asks the person for the sign-in's code. Answers the
 *  project's and question's addresses. */
export async function walkAdministrator(walk, page, { base, founder, codeOf = null }) {
  walk.journey = "R9 as administrator";
  const { project, question } = await projectAndQuestion(walk, page, base, { title: PROJECT_TITLE, question: QUESTION });
  await connectSubscription(walk, page, base, { password: founder.password, codeOf });
  const document = await captureAndVouch(walk, page, base, { question, password: founder.password });
  await readAndCite(walk, page, { document });
  await runAndRead(walk, page, { question });
  await ask(walk, page, { question, words: "What did the city order the landlord to do, and by when?" });
  await concludeOn(walk, page, { question, project });
  return { project, question };
}

/** R10: the same journey as a member, invited to the group (journey 28 joined her) and to the project: her own Claude
 *  subscription connected, her own run dispatched on it, and the project's assistant page (`projectai`), plan help
 *  (`planask`) and Ask walked as hers. `inviter` is the administrator's page, which invites her to the project. */
export async function walkMemberJourney(walk, page, { base, member, inviter, project, codeOf = null }) {
  walk.journey = "R10 as member";
  await walk.step(inviter, "the administrator invites her to the project", async (p) => {
    await p.goto(project); await settle(p);
    await act(p, "projectinvite", { fields: { "project-invite": member.handle }, reason: "She lives in flat 4." });
    if (!(await p.locator("#cs-main").textContent()).includes(member.handle)) throw new Error("the project does not list her as a member");
  });
  await connectSubscription(walk, page, base, { password: member.password, codeOf, label: "she connects her own Claude subscription" });
  let question = null;
  await walk.step(page, "she opens the project and a question of her own", async (p) => {
    await p.goto(project); await settle(p);
    await requireDrawn(walk, p, "project");
    await act(p, "promote", { fields: { "project-question": "When did the tenants first report the leak to the landlord?" },
      reason: "The timeline matters for the order." });
    await requireDrawn(walk, p, "question");
    question = p.url();
  });
  await walk.step(page, "the project's assistant page, as hers (projectai)", async (p) => {
    await p.goto(project); await settle(p);
    await p.locator('#cs-main a[href^="/app/projectai/"]').first().click();
    await settle(p);
    await requireDrawn(walk, p, "projectai");
  });
  await walk.step(page, "plan help, as hers (planask)", async (p) => {
    await p.goto(project); await settle(p);
    await act(p, "planopen", { fields: { "project-plan": "Get the roof repaired" }, reason: "The tenants want the repair made." });
    await requireDrawn(walk, p, "plan");
    await act(p, "planask", { reason: "Ask the assistant for options." });
    await requireWord(p, "screen.plan.ask.running", { timeout: 20000 });
    const until = Date.now() + RUN_WAIT_MS;
    for (;;) {
      await p.reload(); await settle(p);
      if (wordPattern("screen.plan.ask.ended").test((await p.locator("body").textContent()).replace(/\s+/g, " "))) break;
      if (Date.now() > until) throw new Error("the plan's assistant did not finish within its wait");
      await p.waitForTimeout(3000);
    }
  });
  await runAndRead(walk, page, { question });
  await ask(walk, page, { question, words: "Who has the tenants' reports of the leak?" });
  return { question };
}


/* R13: which of the walk's steps walks each step of design journey 29 (with the assistant), by the step's screen and act
   (`s:act`): the label its LIVE screenshot is paired under. The design's `groupkeyset` step (the group's API key) is
   walked by the person's own subscription on `connect` since K3347; the question's running and concluded states are
   what steps 9 and 12 leave drawn. */
export const JOURNEY_29_STEPS = Object.freeze({
  "install:bootstrap": "install: the installer's first page",
  "install:null": "install: each step finishes, the checks pass",
  "setup:claim": "1 · setup: claim",
  "setup:groupkeyset": "4 · connect an assistant",
  "home:null": "home: a new group's home",
  "projects:promote": "2 · start a project",
  "project:promote": "3 · open a question",
  "question:airunopen": "9 · run the assistant",
  "question:null": "9 · run the assistant",
  "capture:acquire": "5 · capture by address",
  "held:release": "6 · see both held",
  "document:cite": "8 · cite it",
  "question:versionaccept": "10 · read its run's answer",
  "question:conclude": "12 · accept a reading",
});
/* The LIVE screenshot (its path) for a step of journey 29: the last screenshot of the walk's step whose label begins as
   the table says; the running state's own shot is step 9's, the concluded state's step 12's. */
export function journey29Live(walk, step) {
  const key = `${step.s}:${step.act}`;
  const concluded = step.s === "question" && step.v === "concluded";
  const label = concluded ? JOURNEY_29_STEPS["question:conclude"] : JOURNEY_29_STEPS[key];
  if (!label) return null;
  const core = label.replace(/^\d+ · /, "");
  const hit = walk.steps.filter((x) => x.label.includes(core)).pop();
  return hit ? join(walk.out, hit.screenshot) : null;
}
