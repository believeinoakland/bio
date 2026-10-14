/* screens-action against interface-shell R21's screen contract and R7's common rules, at the module's interface
   (`SCREENS`, `SCREEN_WORDS`) and on the real served page (interface-shell's harness). The registry is the design
   stream's `registry.json` as merged into `tranche/T47` at PR #33's head (wizard-scripts R35). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-action/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { checkScreens, interfacePage } from "../../../src/interface-shell/index.mjs";
import { nestedTips, accessibleName, controls } from "../interface-shell/harness.mjs";
import { open, main, text, ops, ok, refused, textNodes, wordChecker, MEMBER, DATA_PLANE, ROUTES, PLAN_ID, ACTION_ID, DET, ESC, PROJECT } from "./page.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const REGISTRY = JSON.parse(readFileSync(join(ROOT, "docs/development/ux-substrate/screens/registry.json"), "utf8")).screens;
const WORD_KEYS = new Set(WORD_ROWS.map((r) => r[0]));
const IDS = ["plan", "start-send", "request", "action", "matter", "help-records"];

test("R1–R6, R9 (interface-shell R21): SCREENS is the registry screens plan, start-send, request, action, matter, help-records, each {id, reads, render, acts, words}", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), IDS);
  for (const s of SCREENS) {
    assert.ok(REGISTRY.some((r) => r.id === s.id), `${s.id} is a registry screen`);
    assert.equal(typeof s.reads, "function");
    assert.equal(typeof s.render, "function");
    assert.ok(Array.isArray(s.acts) && Array.isArray(s.words));
    assert.ok(Object.isFrozen(s));
  }
});

test("R1–R6 (interface-shell R21, R38): each screen's acts are exactly its registry acts, every op in OPS, each with its send", () => {
  for (const s of SCREENS) {
    const reg = REGISTRY.find((r) => r.id === s.id).acts.map((a) => a.op);
    const mine = s.acts.map((a) => a.op);
    assert.deepEqual([...mine].sort(), [...reg].sort(), s.id);
    for (const a of s.acts) {
      assert.ok(OPS[a.op], `${s.id}: ${a.op} is in OPS`);
      assert.equal(typeof a.send, "function", `${s.id}.${a.op} send`);
    }
  }
  assert.equal(checkScreens(SCREENS), true);
});

test("R7 (interface-shell R5): every word a screen lists is a WORD_ROWS key or its own row; own rows are screen.<id>.* or the three shared keys", () => {
  const SHARED_OWN = ["act.plansubjectadd.label.plan", "act.plansubjectadd.does", "act.filingrecordsent.does"];
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[1] === "string" && typeof r[2] === "boolean", r[0]);
    assert.ok(new RegExp(`^screen\\.(${IDS.join("|")})\\.`).test(r[0]) || SHARED_OWN.includes(r[0]), r[0]);
    // DEC-149: the group's Civicsmith, never Civicsmith bare.
    assert.ok(!/Civicsmith/.test(r[1].replace(/your group's Civicsmith/gi, "")), `${r[0]} names the group's Civicsmith in DEC-149's form`);
  }
  assert.equal(new Set(SCREEN_WORDS.map((r) => r[0])).size, SCREEN_WORDS.length, "own keys distinct");
  for (const k of SCREEN_WORDS.map((r) => r[0])) if (!SHARED_OWN.includes(k)) assert.ok(!WORD_KEYS.has(k), `${k} does not shadow a WORD_ROWS key`);
  for (const s of SCREENS) for (const w of s.words) {
    if (typeof w === "string") assert.ok(WORD_KEYS.has(w), `${s.id}: ${w} is a WORD_ROWS key`);
    else assert.ok(SCREEN_WORDS.includes(w), `${s.id}: ${w[0]} is an own row`);
  }
});

test("R7 (action-producers R19): every member-facing sentence calls a plan's subject a matter: no word a screen draws says 'subject' of a plan", () => {
  for (const s of SCREENS) for (const w of s.words) {
    const en = typeof w === "string" ? WORD_ROWS.find((r) => r[0] === w)[1] : w[1];
    assert.ok(!/\bsubjects?\b/i.test(en), `${s.id}: ${typeof w === "string" ? w : w[0]} says "${en}"`);
  }
});

test("R7 (interface-shell R23): no place is named in this module's words", () => {
  for (const [, en] of SCREEN_WORDS) assert.ok(!/California|Oakland|Alameda|NextRequest|Sunshine Ordinance|Government Code/.test(en), en);
});

const DATA = ["River Town", "Pothole repairs", "Repairs: closed is not repaired", "INQ-2026-ffffffffffffffff", DET, "STD-1", "STD-2", ESC, ACTION_ID, PLAN_ID, PROJECT,
  "a suspected matter", "determined", "Records request: inspection logs", "Story with a reporter", "Complaint to the auditor",
  "first, to see what closed means", "Records first", "Phase 1", "opt-1", "Scenario 1: no branch answers a hostile response to the records request.",
  "Ask the committee to agendize repair performance", "the committee oversees repairs", "machine work", `inquiry:INQ-2026-ffffffffffffffff`, `outcome:${DET}#STD-1`,
  "City Clerk, Office of the City Clerk", "Asha Rao", "mai", "M", "web form", "email", "Office of the City Clerk", "Response due", "Extension ends", "ten days from receipt",
  "fourteen more days", "Gov. Code § 7922.535", "Gov. Code § 7922.535(b)", "Mun. Code § 2.20.230", "Gov. Code § 7922.535(b); Gov. Code § 7922.535(c); Mun. Code § 2.20.230",
  "The 2024 rent adjustment", "City Administrator, City", "a council vote", "adjusted without a vote", "notice within 30 days", "noticed on day 21",
  "Tenants of the district", "class", "38000 USD", "from the rent schedules", "The repair program", "program", "its trigger was met 5 days ago",
  "no live compliant determination", "not every part addressed", "the records law's ten days", "1", "2", "3", "10", "14", "notification", "Open",
  "12 October 2026", "26 October 2099", "2 October 2026", "3 October 2026", "20 October 2026", "30 November 2026", "20 December 2026", "24 October 2026", "1 March 2024"];

test("R1–R6, R9 (interface-shell R8, R21): the shell serves the six screens: each route draws its screen under its path, from its own source", async () => {
  assert.match(interfacePage(SCREENS), /<script nonce="__CSP_NONCE__">/);
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, DATA_PLANE);
    assert.ok(main(p).querySelector("nav.cs-crumbs [aria-current]"), `${id} under its path`);
    assert.ok(main(p).querySelector("h1"), `${id} has its heading`);
    assert.ok(text(p).length > 40, `${id} drew from its own source`);
  }
});

test("R7 (interface-shell R5, R10): every text node each screen draws, with data, empty and failed, is a word (filled) or the record's own data", async () => {
  const isWord = wordChecker(DATA);
  const fail = refused("STORE_DID_NOT_ANSWER", null, 502);
  const planes = {
    data: DATA_PLANE,
    failed: Object.fromEntries(Object.keys(DATA_PLANE).map((k) => [k, fail])),
  };
  for (const [state, plane] of Object.entries(planes)) for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, plane);
    for (const t of textNodes(main(p)).map((n) => n.textContent.trim()).filter((t) => t && !/^[·:,.()›→\s]+$/.test(t)))
      assert.ok(isWord(t), `${id} (${state}) draws "${t}", which is no word`);
  }
});

test("R7 (interface-shell R10): a failed read is drawn as failed, never as empty, on every screen", async () => {
  const fail = refused("STORE_DID_NOT_ANSWER", null, 502);
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, Object.fromEntries(Object.keys(DATA_PLANE).map((k) => [k, fail])));
    const states = main(p).querySelectorAll("[data-state]").map((e) => e.getAttribute("data-state"));
    assert.ok(states.includes("failed"), `${id} draws its failed read as failed`);
  }
});

test("R7 (interface-shell R12, R15, R22): an act the gate refuses is absent, never greyed; no explanation inside another; every control named, every field labelled", async () => {
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, DATA_PLANE);
    assert.equal(main(p).querySelectorAll("button[disabled]").length, 0, id);
    assert.deepEqual(nestedTips(main(p)).map((e) => e.outerHTML.slice(0, 80)), [], `${id}: no explanation inside another`);
    for (const c of controls(main(p))) assert.ok(accessibleName(c, p.doc), `${id}: ${c.outerHTML.slice(0, 80)} has a name`);
    const shut = await open(path, { ...DATA_PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) });
    for (const op of ops(shut)) assert.ok(["itemtakeup", "reminderset", "optionstartpreview", "addresseesuggest"].includes(op), `${id}: ${op} needs contribute`);
  }
});

test("R7 (interface-shell R13): each refusal word an act names is a listed word", () => {
  for (const s of SCREENS) {
    const listed = new Set(s.words.map((w) => (typeof w === "string" ? w : w[0])));
    for (const a of s.acts) for (const [code, key] of Object.entries(a.refusals || {})) assert.ok(listed.has(key), `${s.id}.${a.op}: ${code} → ${key}`);
  }
});

test("R7: after an act the screen re-reads what it changed: an act names only its own screen's reads", () => {
  for (const s of SCREENS) {
    const names = new Set([...Object.keys(s.reads({ subject: `${PLAN_ID}~opt-1`, ui: {}, reachable: true, data: {} })),
      ...Object.keys(s.reads({ subject: ACTION_ID, ui: {}, reachable: true, data: {} })), ...Object.keys(s.reads({ subject: `${DET}~${ESC}`, ui: {}, reachable: true, data: {} }))]);
    for (const a of s.acts) for (const r of a.rereads || []) assert.ok(names.has(r), `${s.id}.${a.op} rereads ${r}`);
  }
});

test("R1–R6 (interface-shell R8): every working screen is drawn under its path, its project's step named by the project's title as read", async () => {
  const want = { plan: "Projects › Pothole repairs › Action plan", "start-send": "Projects › Pothole repairs › Action plan › Start and send",
    request: "Projects › Pothole repairs › Request records", action: "Projects › Pothole repairs › Action", matter: "Projects › Pothole repairs › Matter" };
  for (const [id, path] of Object.entries(want)) {
    const p = await open(ROUTES[id], DATA_PLANE);
    const steps = main(p).querySelectorAll("nav.cs-crumbs li").map((li) => li.textContent.trim());
    assert.equal(steps.join(" › "), path, id);
  }
});
