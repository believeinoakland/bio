/* screens-daily against interface-shell R21's screen contract and R7's common rules, at the module's interface
   (`SCREENS`, `SCREEN_WORDS`) and on the real served page (interface-shell's harness). The registry is read from git at
   6f0d88d8d5, PR #33's head as merged into `tranche/T47` at L11's START (wizard-scripts R35, K3127), so a later edit of the
   working copy does not move it. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-daily/index.mjs";
import { OPS, OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { checkScreens, interfacePage } from "../../../src/interface-shell/index.mjs";
import { nestedTips, accessibleName, controls } from "../interface-shell/harness.mjs";
import { open, main, text, ops, ok, refused, textNodes, wordChecker, MEMBER } from "./page.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const COMMIT = "6f0d88d8d5";
const atCommit = (path) => {
  try { return JSON.parse(execFileSync("git", ["show", `${COMMIT}:${path}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); }
  catch { return JSON.parse(readFileSync(join(ROOT, path), "utf8")); }
};
const REGISTRY = atCommit("docs/development/ux-substrate/screens/registry.json").screens;
const WORD_KEYS = new Set(WORD_ROWS.map((r) => r[0]));
const byId = Object.fromEntries(SCREENS.map((s) => [s.id, s]));
// The acts a screen draws: exactly the registry's (`startfrom` drawn on Home since T47, R9; `actionmove` on the queue, R13).
const EXPECTED = {
  home: ["startfrom", "promote"],
  projects: ["promote"],
  queue: ["taskresolve", "taskforward", "proposedispose", "queuesnooze", "queuemute", "adoptversion", "keepversion", "reminderanswer", "promote", "projectkeyset", "exploreapprove", "actionmove"],
  finder: ["search", "select", "findin", "selectionrelease", "frontier", "calculationcreate"],
  "find-in": ["findin", "standingquestionset", "recordpersonfact", "recorddatedfact", "standarddeclare", "recordfact", "tabledeclare", "cite", "search"],
  answers: ["ask", "ruleanswer", "search", "standingquestionset", "standingquestionend"],
};

test("R1–R6, R10 (interface-shell R21): SCREENS is the six registry screens home, projects, queue, finder, find-in, answers, each {id, reads, render, acts, words}", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["home", "projects", "queue", "finder", "find-in", "answers"]);
  for (const s of SCREENS) {
    assert.ok(REGISTRY.some((r) => r.id === s.id), `${s.id} is a registry screen`);
    assert.equal(typeof s.reads, "function");
    assert.equal(typeof s.render, "function");
    assert.ok(Array.isArray(s.acts) && Array.isArray(s.words));
    assert.ok(Object.isFrozen(s));
  }
});

test("R1–R13 (interface-shell R21, R38): each screen's acts are exactly its registered acts, every op in OPS", () => {
  for (const s of SCREENS) {
    const reg = REGISTRY.find((r) => r.id === s.id).acts.map((a) => a.op);
    const mine = s.acts.map((a) => a.op);
    assert.deepEqual([...mine].sort(), [...EXPECTED[s.id]].sort(), s.id);
    for (const op of mine) {
      assert.ok(OPS[op], `${s.id}: ${op} is in OPS`);
      assert.ok(reg.includes(op), `${s.id}: ${op} is registered`);
    }
    for (const op of reg) assert.ok(mine.includes(op), `${s.id}: registered ${op} is offered`);
    for (const a of s.acts) {
      assert.equal(typeof a.send, "function", `${s.id}.${a.op} send`);
      if (a.rereads) for (const r of a.rereads) assert.equal(typeof r, "string");
    }
  }
  // R5: finding records nothing (K1468): the find op is a read.
  assert.equal(OPS.findin.mutating, false);
  // R6: the plain-words question is ask, and "Show how this was counted" is ruleanswer, a read of `rule`.
  assert.equal(OP_ALIASES.ruleanswer, "rule");
});

test("R7 (interface-shell R5): every word a screen lists is a WORD_ROWS key or its own row; own rows are screen.<id>.* or the four shared keys", () => {
  const SHARED_OWN = ["mark.origin.search.means", "queue.step-cost-shared.detail", "ai.refused.limit.unjudged", "ai.label.untested"];
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[1] === "string" && typeof r[2] === "boolean", r[0]);
    assert.ok(/^screen\.(home|projects|queue|finder|find-in|answers)\./.test(r[0]) || SHARED_OWN.includes(r[0]), r[0]);
    assert.ok(!/Civicsmith(?! ?'s tests)/.test(r[1].replace(/your group's Civicsmith/gi, "")), `${r[0]} names the group's Civicsmith in DEC-149's form`);
  }
  assert.equal(new Set(SCREEN_WORDS.map((r) => r[0])).size, SCREEN_WORDS.length, "own keys distinct");
  for (const k of SCREEN_WORDS.map((r) => r[0])) if (!SHARED_OWN.includes(k)) assert.ok(!WORD_KEYS.has(k), `${k} does not shadow a WORD_ROWS key`);
  for (const s of SCREENS) for (const w of s.words) {
    if (typeof w === "string") assert.ok(WORD_KEYS.has(w), `${s.id}: ${w} is a WORD_ROWS key`);
    else assert.ok(SCREEN_WORDS.includes(w), `${s.id}: ${w[0]} is an own row`);
  }
});

// Each screen drawn with data, as the harness's plane answers its reads.
const DATA_PLANE = {
  groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents." }),
  queue: ok({ items: [{ id: "TSK-1", class: "OBLIGATION", kind: "x", summary: "Vouch for photos", options: [], disposition: { instead: "taskresolve" },
    case: { ancestors: [{ id: "PROJ-1", type: "project", title: "Pothole repairs" }] }, due: "2026-10-20" }], item_count: 1 }),
  search: ok({ total: 1, hits: [{ bundle_id: "PROJ-1", title: "Pothole repairs", current_state: "forming" }] }),
  projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Pothole repairs", stage: "forming", members: [{ member: "M-1", handle: "mai" }], activity: [0, 1, 0, 2, 0, 1, 3, 1], lastChange: "2026-10-20T10:00:00Z" }] }),
  projectquestions: ok({ ok: true, items: [{ inquiry: "INQ-1" }], cursor: null }),
  projectdirectory: ok({ projects: [{ id: "PROJ-9", name: "Library hours" }] }),
  startfrom: ok({ ok: true, scripts: [{ id: "WIZ-33b5887790b7561b", version: 1, name: "Check a claim" }], doors: [{ door: "problem", scripts: ["WIZ-33b5887790b7561b"] }] }),
};
const ROUTES = { home: "/app", projects: "/app/projects", queue: "/app/queue", finder: "/app/finder/pothole", "find-in": "/app/find-in/PROJ-1", answers: "/app/answers" };
const DATA = ["River Town", "Lakeshore Tenants", "Rents.", "Vouch for photos", "Pothole repairs", "Library hours", "PROJ-1", "pothole", "20 October 2026", "mai", "M", "Check a claim"];

test("R1–R10 (interface-shell R21): the shell accepts the six screens and serves them: each route draws its screen under its path", async () => {
  assert.equal(checkScreens(SCREENS), true);
  assert.match(interfacePage(SCREENS), /<script nonce="__CSP_NONCE__">/);
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, DATA_PLANE);
    assert.ok(main(p).querySelector("nav.cs-crumbs [aria-current]"), `${id} under its path (interface-shell R8)`);
    assert.ok(main(p).querySelector("h1"), `${id} has its heading`);
  }
});

test("R7 (interface-shell R21 (1)): every function is self-contained: the page runs each from its own text, with nothing else in scope", async () => {
  // The page holds each screen's functions by their source (`toSource`), run in the page's scope, where no import of this
  // module exists: a function reaching outside its parameters and `cs` would throw there, and the screen not draw.
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, DATA_PLANE);
    assert.ok(text(p).length > 20, `${id} drew from its own source`);
  }
});

test("R7 (interface-shell R5): every text node each screen draws, with data, empty and failed, is a word (filled) or the record's own data", async () => {
  const isWord = wordChecker(DATA);
  const planes = {
    data: DATA_PLANE,
    empty: { groupidentity: ok({ ok: true, display_name: "Lakeshore Tenants" }), queue: ok({ items: [] }), search: ok({ hits: [] }), projectdirectory: ok({ projects: [] }),
      projectlist: ok({ ok: true, projects: [] }), startfrom: ok({ ok: true, scripts: [], doors: [] }), whoami: ok({ ...MEMBER, administer: true, capabilities: ["contribute"] }) },
    failed: { queue: refused("STORE_DID_NOT_ANSWER", null, 502), search: refused("STORE_DID_NOT_ANSWER", null, 502), projectdirectory: refused("STORE_DID_NOT_ANSWER", null, 502),
      projectlist: refused("STORE_DID_NOT_ANSWER", null, 502), startfrom: refused("STORE_DID_NOT_ANSWER", null, 502) },
  };
  for (const [state, plane] of Object.entries(planes)) for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, plane);
    for (const t of textNodes(main(p)).map((n) => n.textContent.trim()).filter((t) => t && !/^[·:,.()›→\s]+$/.test(t)))
      assert.ok(isWord(t), `${id} (${state}) draws "${t}", which is no word`);
  }
});

test("R7 (interface-shell R12, R15, R22): an act the gate refuses is absent, never greyed; no explanation sits inside another; every control has a name and every field a label", async () => {
  for (const [id, path] of Object.entries(ROUTES)) {
    const p = await open(path, DATA_PLANE);
    assert.equal(main(p).querySelectorAll("button[disabled]").length, 0, id);
    assert.deepEqual(nestedTips(main(p)).map((e) => e.outerHTML.slice(0, 80)), [], `${id}: no explanation inside another`);
    for (const c of controls(main(p))) assert.ok(accessibleName(c, p.doc), `${id}: ${c.outerHTML.slice(0, 80)} has a name`);
    const shut = await open(path, { ...DATA_PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) });
    for (const op of ops(shut)) assert.ok(!["promote", "proposedispose", "adoptversion", "keepversion", "calculationcreate", "cite", "standarddeclare", "recordfact"].includes(op), `${id}: ${op} needs contribute`);
  }
});

test("R7 (interface-shell R13): each refusal word an act names is a listed word", () => {
  for (const s of SCREENS) {
    const listed = new Set(s.words.map((w) => (typeof w === "string" ? w : w[0])));
    for (const a of s.acts) for (const [code, key] of Object.entries(a.refusals || {})) assert.ok(listed.has(key), `${s.id}.${a.op}: ${code} → ${key}`);
  }
});

test("R7: after an act the screen re-reads what it changed: an act names only its own screen's reads to re-read, or all of them", () => {
  const readsOf = { home: ["group", "queue", "projects", "directory", "doors", "matching"], projects: ["projects"], queue: ["queue"], finder: ["search", "selection", "frontier"], "find-in": ["questions"], answers: ["search"] };
  for (const s of SCREENS) for (const a of s.acts) for (const r of a.rereads || []) assert.ok(readsOf[s.id].includes(r), `${s.id}.${a.op} rereads ${r}`);
  // The queue's acts change the queue: each re-reads all (the item resolved or muted leaves the list, R3).
  for (const a of byId.queue.acts) assert.equal(a.rereads, undefined, a.op);
});
