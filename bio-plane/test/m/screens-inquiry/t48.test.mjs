/* screens-inquiry T48 (T48-73): R17 the dock's thirty days and meters, R18 the reference links, R19 the held texts, R20 the
 * common line (every class a served stylesheet defines; no empty section, no zero; a failed read still failed), R21 the
 * subject guard, R22 the original by its SHA-256 (the document's own link tests are in document.test.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ok, refusedIn, silent, ADMIN } from "../interface-shell/harness.mjs";
import { ASSET_FILES } from "../../../src/interface-assets/index.mjs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { SCREEN_WORDS } from "../../../src/screens-inquiry/index.mjs";
import { open, main, plane, SCREENS, P, Q, D, SHA, BASIS, READING, PROJECT_QUESTIONS, DOCUMENT_MD, inquiryMd } from "./fixtures.mjs";

const RUN = "RUN-" + "b".repeat(16);
const text = (el) => el.textContent;
const section = (p, head) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === head);
const heads = (p) => main(p).querySelectorAll("section").map((s) => s.querySelector("h2").textContent);

/* ---- R17: the dock's bars and meters (screens-settings R26's render, handed in as `view.parts`, a stand-in here) ---- */
function aiUsageBars(cs, view, o) {
  return `<div class="mk-bars" data-owner="${cs.esc(o.owner)}" data-days="${o.value.days.length}" data-meters="${o.value.periods.length}"></div>`;
}
const SERVING = SCREENS.map((s) => (s.id === "assistant" ? { ...s, parts: { aiUsageBars } } : s));
const OVER = (owner) => ok({ owner, days: Array.from({ length: 30 }, (_, i) => ({ day: `2026-09-${String(i + 1).padStart(2, "0")}`, calls: i, dollars: i / 10 })),
  periods: [{ scope: "overall", unit: "usd", period: "month", period_start: "2026-10-01", used: 1.5, limit: 5 }] });
async function dock(subject, extra = {}, whoami) {
  const screen = /^PROJ-/.test(subject) ? "project" : /^INFO-/.test(subject) ? "document" : "question";
  const p = await open(`/app/${screen}/${subject}`, { boot: { screens: SERVING, plane: { ...plane(), assistantstate: ok({ on: true }), accountreference: ok({ held: false }),
    groupkeystate: ok({ held: true, on: true }), aiusage: ok({ ok: true, today: { used: "$0.42", limit: "$2.00" } }), agentpack: ok({ ok: true, pack: { version: "p@1" } }),
    airuns: ok({ ok: true, runs: [] }), aiuseovertime: (r) => OVER(r.query.owner), ...(whoami ? { whoami } : {}), ...extra } } });
  await p.click(p.root().querySelector('.cs-mast [data-shell="dock"]'));
  await p.settle();
  return p;
}
const panel = (p) => p.root().querySelector(".cs-dock");
const bars = (p) => panel(p).querySelector(".mk-bars");

test("R17 her own account draws the thirty days and the meters of her account, read for her as its owner", async () => {
  const p = await dock(Q, { accountreference: ok({ held: true }) });
  assert.deepEqual(p.byOp("aiuseovertime").map((r) => r.query.owner), ["member:mai"]);
  assert.deepEqual([bars(p).getAttribute("data-owner"), bars(p).getAttribute("data-days"), bars(p).getAttribute("data-meters")], ["member:mai", "30", "1"]);
});

test("R17 a project's account she owns draws its bars; a refusal as a non-owner is refused draws nothing and says nothing of the account's use", async () => {
  const own = await dock(D, { projectaccountstate: ok({ ok: true, on: true, serving: "project" }) });
  assert.equal(bars(own).getAttribute("data-owner"), "project:" + P);
  const other = await dock(D, { projectaccountstate: ok({ ok: true, on: true, serving: "project" }), aiuseovertime: refusedIn("ACCOUNT_NOT_OWNER", "Only an owner sees this.") });
  assert.ok(!bars(other) && !panel(other).querySelector("[data-state]"), "nothing drawn, no failure");
  assert.doesNotMatch(text(panel(other)), /Only an owner|owner/);
});

test("R17 the group's key draws its bars to an administrator; a member who does not administer reads and draws none", async () => {
  const member = await dock(Q);
  assert.match(text(panel(member)), /your group's key/);
  assert.equal(member.byOp("aiuseovertime").length, 0, "no read is made for an account she does not own");
  assert.ok(!bars(member));
  const admin = await dock(Q, {}, ok(ADMIN));
  assert.deepEqual([admin.byOp("aiuseovertime")[0].query.owner, bars(admin).getAttribute("data-owner")], ["group", "group"]);
});

test("R17 controls: an unreadable answer, and a read that fails, are drawn failed, never as zeros", async () => {
  const unreadable = await dock(Q, { accountreference: ok({ held: true }), aiuseovertime: ok({ owner: "member:mai", unreadable: true }) });
  assert.ok(!bars(unreadable) && panel(unreadable).querySelector('[data-state="failed"]'));
  const gone = await dock(Q, { accountreference: ok({ held: true }), aiuseovertime: silent });
  assert.ok(!bars(gone) && panel(gone).querySelector('[data-state="failed"]'));
});

/* ---- R18: the reference links ---- */
/* the kit stand-in: every kit call answers an empty string but the reference, which records what it was asked and answers
   a link (the shell links a kind it lists and whose screen it registers, interface-shell R16) */
function kit(refs, answer) {
  return new Proxy({}, { get: (_, k) => (k === "ref" ? (...a) => { refs.push(a); return answer(...a); }
    : k === "esc" || k === "w" ? (x) => String(x) : k === "sec" ? (t, inner) => inner : k === "sheet" ? (x) => x
    : k === "row" ? (...a) => a.join("") : k === "date" ? () => "" : () => "") });
}
const projectView = (plans) => ({ subject: P, ui: { plans }, data: {}, me: { handle: "mai" } });
const PROJECT = SCREENS.find((s) => s.id === "project");

test("R18 a plan opened in the project is a reference link to the plan screen, with the plan as subject; opening one sends nothing", () => {
  const refs = [];
  const html = PROJECT.render(kit(refs, (kind, id, label) => `<a class="cs-ref" href="/app/${kind}/${id}" data-nav>${label}</a>`),
    projectView([{ id: "PLAN-2026-0003", title: "Pothole options" }]));
  assert.deepEqual(refs.map((r) => r.slice(0, 3)), [["plan", "PLAN-2026-0003", "Pothole options"]]);
  assert.match(html, /<a class="cs-ref" href="\/app\/plan\/PLAN-2026-0003" data-nav>Pothole options<\/a>/);
});

test("R18 controls: a project with no plan draws no plan link; a kind the shell does not link is drawn plain, never as a bare card", async () => {
  const none = [];
  PROJECT.render(kit(none, () => ""), projectView([]));
  assert.deepEqual(none, [], "no plan, no link asked for");
  const unlinked = PROJECT.render(kit([], (kind, id, label) => `<span class="cs-card">${label}</span>`), projectView([{ id: "PLAN-1", title: "Options" }]));
  assert.doesNotMatch(unlinked, /cs-card/);
  assert.match(unlinked, /Options/);
});

/* ---- R19: the held texts ---- */
test("R19 the module holds no copy of a words.json word, and no held text is spelled \"labelled\"", () => {
  const words = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words;
  const carried = new Set(words.map((w) => w.key));
  for (const [key, en] of SCREEN_WORDS) {
    assert.ok(!carried.has(key), `${key} is words.json's: dropped here`);
    assert.doesNotMatch(en, /labelled/i, key);
  }
  assert.ok(SCREENS.find((s) => s.id === "document").words.includes("act.pagetranscribe.does"), "the document draws the carried word by its key");
});

/* ---- R20: the common line ---- */
/* projectai draws screens-settings' AI account panel (R14, `view.parts`); its classes are that module's (its R20), so a
   stand-in that draws nothing leaves only this module's own */
function noPanel() { return ""; }
const OWN_ONLY = SCREENS.map((s) => (s.id === "projectai" ? { ...s, parts: { ...s.parts, aiPanel: noPanel } } : s));
const defined = () => {
  const page = readFileSync(new URL("../../../../docs/development/ux-substrate/screens/page.src.html", import.meta.url), "utf8");
  const css = ASSET_FILES["civicsmith.css"].body + (ASSET_FILES["shell.css"] ? ASSET_FILES["shell.css"].body : (page.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [, ""])[1])
    + (interfacePage(SCREENS).match(/<style>([\s\S]*?)<\/style>/) || [, ""])[1];
  return new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
};
const classesIn = (el) => el.querySelectorAll("[class]").flatMap((e) => String(e.getAttribute("class")).split(/\s+/).filter(Boolean));

test("R20 every class the screens draw is one a served stylesheet defines, over full fixtures and the dock with a run", async () => {
  const known = defined();
  const drawn = new Set();
  const AI = { projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "mai", state: "joined", owner: true }] }),
    projectaccountstate: ok({ ok: true, held: true, kind: "apikey", on: true, set_at: "2026-10-05T09:00:00Z", by: "mai", serving: "project" }),
    projectkeynotice: ok({ ok: true, due: true, text: "The notice." }), projectaikeepawaystate: ok({ ok: true, on: true, set_by: "member:mai", set_at: "2026-10-05T09:00:00Z", reason: "Sensitive" }),
    accountuses: ok({ owner: "project:" + P, held: true, uses: { ask: true } }), ailimits: ok({ ok: true, limits: [], history: [] }), aiusage: ok({ ok: true, uses: [] }), accounthistory: ok({ ok: true, changes: [] }) };
  for (const [path, extra] of [["/app/project/" + P, {}], ["/app/question/" + Q, {}], ["/app/document/" + D, {}], ["/app/projectai/" + P, AI]]) {
    const p = await open(path, { plane: extra, boot: { screens: OWN_ONLY } });
    for (const c of classesIn(main(p))) drawn.add(c);
  }
  const p = await dock(Q, { accountreference: ok({ held: true }), airuns: ok({ ok: true, runs: [{ id: RUN, status: "running", principal: { plane: "member:mai" } }] }),
    airun: ok({ found: true, session: { id: RUN, status: "running", ticks: 2, untested: { kind: "untested" } } }),
    airunlog: ok({ found: true, entries: [{ says: "Found the policy." }] }) });
  for (const c of classesIn(panel(p))) drawn.add(c);
  assert.ok(drawn.has("cs-machinework") && drawn.has("mk-sub") && drawn.has("rec"), "the dock's production and the screens' sentences are among them");
  assert.deepEqual([...drawn].filter((c) => !known.has(c)).sort(), [], "every class is defined");
});

test("R20 every labelled field is drawn with cs.field: no screen draws cs-form or a bare label", async () => {
  const AI = { projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "mai", state: "joined", owner: true }] }),
    projectaccountstate: ok({ ok: true, held: true, kind: "apikey", on: true, serving: "project" }), projectkeynotice: ok({ ok: true, due: false }),
    projectaikeepawaystate: ok({ ok: true, on: false }), accountuses: ok({ owner: "project:" + P, held: true, uses: {} }), ailimits: ok({ ok: true, limits: [], history: [] }),
    aiusage: ok({ ok: true, uses: [] }), accounthistory: ok({ ok: true, changes: [] }) };
  for (const [path, extra] of [["/app/project/" + P, {}], ["/app/question/" + Q, {}], ["/app/document/" + D, {}], ["/app/projectai/" + P, AI]]) {
    const m = main(await open(path, { plane: extra, boot: { screens: OWN_ONLY } }));
    assert.equal(m.querySelectorAll(".cs-form").length, 0, path);
    for (const l of m.querySelectorAll("label")) assert.ok(String(l.parentElement.getAttribute("class")).split(/\s+/).includes("cs-field"), `${path}: ${l.textContent}`);
  }
  const m = main(await open("/app/projectai/" + P, { plane: AI, boot: { screens: OWN_ONLY } }));
  const key = m.querySelectorAll("input").find((i) => i.getAttribute("type") === "password");
  assert.ok(key && key.parentElement.querySelector("label") && key.parentElement.querySelector(".help"), "the key field has its label and help");
});

test("R20 over an empty fixture no section is drawn empty and no count is drawn at zero", async () => {
  const bare = { image: (r) => ok({ "bundle.md": r.query.id === Q ? inquiryMd(P, []) : r.query.id === D ? DOCUMENT_MD : "" }) };
  const project = await open("/app/project/" + P, { plane: { projectstage: ok({ ok: true, project: P, stage: "forming", questions: { read: 0, with_legs: 0, concluded: 0 } }),
    projectquestions: ok({ ok: true, project: P, items: [], cursor: null }), list: ok({ bundles: [] }),
    projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "mai", state: "joined", owner: true }] }) } });
  const question = await open("/app/question/" + Q, { plane: { ...bare, basisversions: ok(BASIS({ versions: [{ name: "main", legs: [] }] })), questionwaits: ok({ ok: true, waits: [] }),
    hypotheses: ok({ ok: true, inquiry: Q, hypotheses: [] }) } });
  const document = await open("/app/document/" + D, { plane: { reading: ok(READING({ reading: { passages: [], people: [] }, unread_pages: [] })),
    backlinks: ok({ ok: true, target: D, backlinks: [] }), versionchain: ok({ ok: true, versions: [{ capture_sha: SHA }] }) } });
  for (const [p, absent] of [[project, ["Questions from elsewhere"]], [question, ["Cuts against", "What it waits on"]],
                             [document, ["Passages", "People it names", "Its versions", "What cites it", "Pages your group's Civicsmith couldn't read"]]]) {
    for (const h of absent) assert.ok(!heads(p).includes(h), `${h} is not drawn`);
    for (const s of main(p).querySelectorAll("section")) assert.ok(text(s).length > text(s.querySelector("h2")).length, `${text(s.querySelector("h2"))} holds something`);
    assert.doesNotMatch(text(main(p)), /\b0 (questions|resting|concluded)\b|Nothing here yet|No hunches kept|Nobody has joined/);
  }
  const dockP = await dock(Q, { aiusage: ok({ ok: true, today: { used: "$0.00", limit: "$2.00" } }) });
  assert.doesNotMatch(text(panel(dockP)), /of your/, "no use today, no count");
  assert.ok(!panel(dockP).querySelectorAll("section").some((s) => text(s.querySelector("h2")) === "What it produced"), "no productions, no section");
});

test("R20 controls: a read that failed is still drawn failed, beside the rest, in a section that is kept", async () => {
  const q = await open("/app/question/" + Q, { plane: { questionwaits: refusedIn("SOME_REFUSAL", "The plane refused this read.") } });
  assert.ok(section(q, "What it waits on").querySelector('[data-state="failed"]'));
  const d = await open("/app/document/" + D, { plane: { backlinks: refusedIn("SOME_REFUSAL", "The plane refused this read."), versionchain: silent } });
  assert.ok(section(d, "What cites it").querySelector('[data-state="failed"]'));
  assert.ok(section(d, "Its versions").querySelector('[data-state="failed"]'));
});

/* ---- R21: the subject guard ---- */
test("R21 project, question, projectai and document mark their subject read, and drawn bare each draws nothing of its own", () => {
  const SUBJECT = { project: "project", question: "inquiry", projectai: "project", document: "capture" };
  for (const [id, key] of Object.entries(SUBJECT)) {
    const s = SCREENS.find((x) => x.id === id);
    const r = s.reads({ subject: "X-1" });
    assert.deepEqual([r[key].subject, r[key].op], [true, "image"], `${id}: ${key} marks the subject`);
    assert.equal(Object.values(r).filter((x) => x.subject === true).length, 1, `${id}: only the subject read is marked`);
    const refs = [];
    assert.equal(s.render(kit(refs, () => ""), { subject: "", ui: {}, data: {}, me: {} }), "", `${id} bare draws no heading, refusal block or form`);
    assert.equal(s.render(kit(refs, () => ""), { subject: undefined, ui: {}, data: {}, me: {} }), "", `${id} with no subject`);
  }
});
