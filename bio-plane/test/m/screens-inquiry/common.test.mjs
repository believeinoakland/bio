/* screens-inquiry R5 (with interface-shell R5, R8–R13 and R16 on this module's screens), on the shell's served page: each
 * screen with each of its reads answered pending, refused and not at all draws every read in its own state and no key
 * the page holds no word for; every grade is one mark, the scale's name and the letter; every record item named is a
 * reference; the module's own words are well formed; each screen draws exactly its registry acts (less K3003's three),
 * each an op `OPS` holds, and the shell serves the module's screens (its R21 check). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { refusedIn, silent, pending, ok } from "../interface-shell/harness.mjs";
import { SCREEN_WORDS } from "../../../src/screens-inquiry/index.mjs";
import { open, main, rawKeys, plane, SCREENS, P, Q, D } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
const PATHS = { project: "/app/project/" + P, question: "/app/question/" + Q, document: "/app/document/" + D };
/* the reads each screen draws in one of the four states, by op (the rest feed what is drawn: titles, choices) */
const DRAWN = { project: ["projectstage", "strengthbarof", "list", "projectaccountstate", "projectparticipants"],
                question: ["inquirystrength", "questionwaits", "basisversions", "hypotheses"],
                document: ["backlinks", "reading", "versionchain"] };
const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };

for (const [id, path] of Object.entries(PATHS)) {
  test(`R5 ${id}: each read pending, refused and unanswered is drawn in its own state, beside the rest, with no key drawn bare (interface-shell R5, R10)`, async () => {
    for (const op of DRAWN[id]) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await open(path, { plane: { [op]: answer } });
      const m = main(p);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      const want = name === "pending" ? "loading" : "failed";
      assert.ok(m.querySelector(`[data-state="${want}"]`), `${id}: ${op} ${name} drawn ${want}`);
      if (name === "refused") assert.match(m.querySelector('[data-state="failed"]').textContent, /The plane refused this read|SOME_REFUSAL/);
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
  });

  test(`R5 ${id}: every grade is drawn as one mark (the scale's name and the letter), every record item named a reference to its screen`, async () => {
    const p = await open(path);
    const m = main(p);
    const grades = m.querySelectorAll(".cs-grade");
    assert.ok(grades.length > 0);
    for (const g of grades) {
      const scale = g.getAttribute("data-scale");
      assert.ok(["capture", "connection", "testimony"].includes(scale));
      assert.match(g.textContent, /^(Capture|Connection|Testimony)[A-D]$/);
      assert.match(g.getAttribute("data-tip") || "", /A is easiest to check/, "the grade explains itself");
    }
    const refs = m.querySelectorAll("a.cs-ref").map((a) => a.getAttribute("href"));
    assert.ok(refs.length > 0);
    for (const h of refs) assert.match(h, /^\/app\/(question|document|project|open-file)\//);
    for (const a of m.querySelectorAll("a.cs-ref")) assert.ok(a.getAttribute("data-tip"), "each reference carries its card");
  });
}

test("R5 the dock in every state of its reads draws no key bare", async () => {
  for (const op of ["accountreference", "aiusage", "agentpack"]) for (const answer of Object.values(VARIANTS)) {
    const p = await open(PATHS.question, { boot: { plane: { ...plane(), assistantstate: ok({ on: true }), accountreference: ok({ held: true }), [op]: answer } } });
    const b = p.root().querySelector('.cs-mast [data-shell="dock"]');
    if (b) { await p.click(b); await p.settle(); }
    assert.deepEqual(rawKeys(p.root()), [], op);
  }
});

test("R5 each screen draws exactly its registry acts (less K3003's three), labelled by act.<op>.label.<screen>, each an op OPS holds; the shell serves them", () => {
  assert.equal(typeof interfacePage(SCREENS), "string", "interface-shell R21's check passes");
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    const ruledOut = { project: ["strengthbarset"], question: ["sever", "reinstate"] }[s.id] || [];
    assert.deepEqual(s.acts.map((a) => a.op).sort(), reg.acts.map((a) => a.op).filter((op) => !ruledOut.includes(op)).sort(), s.id);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, `act.${a.op}.label.${s.id}`);
      assert.ok(s.words.some((w) => (typeof w === "string" ? w : w[0]) === a.label), `${a.label} listed`);
    }
  }
  assert.deepEqual(SCREENS.map((s) => s.id), ["project", "question", "document", "assistant"]);
});

test("R5 the module's own words: frozen [key, en, protected] rows, unique, each listed by a screen, none shadowing WORD_ROWS but the shell's named ones", () => {
  const shellNamed = new Set(["act.pagetranscribe.does", "ai.refused.limit.unjudged"]);
  const shared = new Set(WORD_ROWS.map((r) => r[0]));
  const keys = new Set();
  const listed = new Set(SCREENS.flatMap((s) => s.words.filter((w) => typeof w !== "string").map((w) => w[0])));
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[0] === "string" && typeof r[1] === "string" && typeof r[2] === "boolean", String(r[0]));
    assert.ok(!keys.has(r[0]), `${r[0]} once`);
    keys.add(r[0]);
    assert.ok(!shared.has(r[0]) || shellNamed.has(r[0]), `${r[0]} shadows WORD_ROWS`);
    assert.ok(listed.has(r[0]), `${r[0]} is drawn by some screen`);
    assert.ok(!/\bCivicsmith\b/.test(r[1].replace(/your group's Civicsmith/g, "").replace(/Civicsmith's tests/g, "")), `${r[0]} names Civicsmith bare`);
    assert.ok(!/\b(Oakland|Alameda)\b/.test(r[1]), `${r[0]} names no place`);
  }
  for (const s of SCREENS) for (const w of s.words) if (typeof w === "string") assert.ok(shared.has(w), `${s.id}: ${w} in WORD_ROWS`);
  assert.ok(Object.isFrozen(SCREEN_WORDS));
});
