/* screens-daily against interface-shell R21's screen contract and R7's common rules, at the module's interface:
   `SCREENS` and `SCREEN_WORDS`. The registry and the word list are read from git at 3f40899950 (setup-words R5,
   wizard-scripts R29), so a later edit of the working copy does not move them. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-daily/index.mjs";
import { OPS, OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { kit, viewOf, keys } from "./kit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const COMMIT = "3f40899950";
const atCommit = (path) => {
  try { return JSON.parse(execFileSync("git", ["show", `${COMMIT}:${path}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); }
  catch { return JSON.parse(readFileSync(join(ROOT, path), "utf8")); }
};
const REGISTRY = atCommit("docs/development/ux-substrate/screens/registry.json").screens;
const WORD_KEYS = new Set(WORD_ROWS.map((r) => r[0]));
const byId = Object.fromEntries(SCREENS.map((s) => [s.id, s]));
// The acts a screen draws: the registry's, with `answers`' "Ask" re-pointed to `ask` (interface-shell R21) and `home`'s
// `startfrom` not drawn in T46 (R1).
const EXPECTED = {
  home: ["promote"],
  queue: ["taskresolve", "taskforward", "proposedispose", "queuesnooze", "queuemute", "adoptversion", "keepversion", "reminderanswer", "promote", "projectkeyset", "exploreapprove"],
  finder: ["search", "select", "findin", "selectionrelease", "frontier", "calculationcreate"],
  "find-in": ["findin", "standingquestionset", "recordpersonfact", "recorddatedfact", "standarddeclare", "recordfact", "tabledeclare", "cite", "search"],
  answers: ["ask", "ruleanswer", "search", "standingquestionset", "standingquestionend"],
};

test("R1–R6 (interface-shell R21): SCREENS is the five registry screens home, queue, finder, find-in, answers, each {id, reads, render, acts, words}", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["home", "queue", "finder", "find-in", "answers"]);
  for (const s of SCREENS) {
    assert.ok(REGISTRY.some((r) => r.id === s.id), `${s.id} is a registry screen`);
    assert.equal(typeof s.reads, "function");
    assert.equal(typeof s.render, "function");
    assert.ok(Array.isArray(s.acts) && Array.isArray(s.words));
    assert.ok(Object.isFrozen(s));
  }
});

test("R1–R7 (interface-shell R21): each screen's acts are exactly its registered acts, every op in OPS, with the re-point and R1's startfrom", () => {
  for (const s of SCREENS) {
    const reg = REGISTRY.find((r) => r.id === s.id).acts.map((a) => a.op);
    const mine = s.acts.map((a) => a.op);
    assert.deepEqual([...mine].sort(), [...EXPECTED[s.id]].sort(), s.id);
    for (const op of mine) {
      assert.ok(OPS[op], `${s.id}: ${op} is in OPS`);
      assert.ok(reg.includes(op) || (s.id === "answers" && op === "ask"), `${s.id}: ${op} is registered or the ask re-point`);
    }
    for (const op of reg) assert.ok(mine.includes(op) || (s.id === "home" && op === "startfrom"), `${s.id}: registered ${op} is offered`);
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
    assert.ok(/^screen\.(home|queue|finder|find-in|answers)\./.test(r[0]) || SHARED_OWN.includes(r[0]), r[0]);
    assert.ok(!/Civicsmith(?! ?'s tests)/.test(r[1].replace(/your group's Civicsmith/g, "")), `${r[0]} names the group's Civicsmith in DEC-149's form`);
  }
  assert.equal(new Set(SCREEN_WORDS.map((r) => r[0])).size, SCREEN_WORDS.length, "own keys distinct");
  for (const k of SCREEN_WORDS.map((r) => r[0])) if (!SHARED_OWN.includes(k)) assert.ok(!WORD_KEYS.has(k), `${k} does not shadow a WORD_ROWS key`);
  for (const s of SCREENS) for (const w of s.words) {
    if (typeof w === "string") assert.ok(WORD_KEYS.has(w), `${s.id}: ${w} is a WORD_ROWS key`);
    else assert.ok(SCREEN_WORDS.includes(w), `${s.id}: ${w[0]} is an own row`);
  }
});

// The views each screen is drawn in for the self-containment and word checks below.
const VIEWS = {
  home: viewOf({ data: { group: { display_name: "Lakeshore Tenants", description: "Rents and leases." }, queue: { items: [], item_count: 0 }, projects: { hits: [] }, directory: { projects: [] } } }),
  queue: viewOf({ subject: "due", data: { queue: { items: [{ id: "TSK-1", class: "OBLIGATION", kind: "x", summary: "s", options: [] }], item_count: 1 } } }),
  finder: viewOf({ subject: "lease", data: { search: { hits: [{ bundle_id: "INF-1", title: "Lease" }], total: 1 } } }),
  "find-in": viewOf({ subject: "PROJ-1", data: { questions: { hits: [] } } }),
  answers: viewOf({ reachable: true, ui: { answer: { summary: { text: "x" }, sentences: [], holdings: [], looks: [] } } }),
};

test("R7 (interface-shell R21 (1)): every function is self-contained: rebuilt from its own text with nothing in scope, it draws the same", () => {
  const rebuild = (fn) => new Function(`return (${fn.toString()});`)();
  for (const s of SCREENS) {
    const view = VIEWS[s.id];
    const a = kit(), b = kit();
    const v1 = structuredClone({ ...view, data: view.data });
    assert.equal(rebuild(s.render)(b.cs, view), a.render(s, view), s.id);
    assert.deepEqual(Object.keys(rebuild(s.reads)(view)), Object.keys(s.reads(v1)), s.id);
    for (const act of s.acts) {
      rebuild(act.send);
      if (act.done) rebuild(act.done);
    }
    if (s.place) rebuild(s.place);
  }
});

test("R7 (interface-shell R5, R12): every key drawn is a listed word, and an act the gate refuses is absent, never greyed", () => {
  for (const s of SCREENS) {
    const k = kit();
    const html = k.render(s, VIEWS[s.id]);
    assert.deepEqual(k.log.missing, [], s.id);
    const listed = new Set(s.words.map((w) => (typeof w === "string" ? w : w[0])));
    for (const key of keys(html)) assert.ok(listed.has(key), `${s.id} draws ${key}, which it lists`);
    const none = kit({ allow: () => false });
    const shut = none.render(s, VIEWS[s.id]);
    assert.doesNotMatch(shut, /data-act=/, `${s.id}: no act drawn when the gate refuses every op`);
  }
});

test("R7 (interface-shell R13): each refusal word an act names is a listed word", () => {
  for (const s of SCREENS) {
    const listed = new Set(s.words.map((w) => (typeof w === "string" ? w : w[0])));
    for (const a of s.acts) for (const [code, key] of Object.entries(a.refusals || {})) assert.ok(listed.has(key), `${s.id}.${a.op}: ${code} → ${key}`);
  }
});

test("R7: after an act the screen re-reads what it changed: an act names only its own screen's reads to re-read, or all of them", () => {
  const readsOf = { home: ["group", "queue", "projects", "directory"], queue: ["queue"], finder: ["search", "selection", "frontier"], "find-in": ["questions"], answers: ["search"] };
  for (const s of SCREENS) for (const a of s.acts) for (const r of a.rereads || []) assert.ok(readsOf[s.id].includes(r), `${s.id}.${a.op} rereads ${r}`);
  // The queue's acts change the queue: each re-reads all (the item resolved or muted leaves the list, R3).
  for (const a of byId.queue.acts) assert.equal(a.rereads, undefined, a.op);
});
