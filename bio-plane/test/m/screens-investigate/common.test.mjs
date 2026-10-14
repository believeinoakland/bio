/* screens-investigate R10 (with interface-shell R8–R13 and R16 on this module's screens), on the shell's served page:
 * each screen with each read it draws answered pending, refused and not at all draws that read in its own state, beside
 * the rest; every grade is one mark (the scale's name and the letter) explaining itself; every record item named is a
 * reference with its card; each screen draws exactly its registry acts and the shell serves the module's screens (its
 * R21 check); the module's own words are well formed; after an act the screen reads again what it changed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { refusedIn, silent, pending, ok } from "../interface-shell/harness.mjs";
import { SCREEN_WORDS } from "../../../src/screens-investigate/index.mjs";
import { open, main, rawKeys, plane, press, fill, SCREENS, PATHS, P, ENT, MSR, CALC, PROC, ACT, STD, SHA } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
/* the reads each screen draws in one of the four states, by op (the rest feed what is drawn: titles, choices) */
const DRAWN = { people: ["peopledirectory"], person: ["person", "samepersoncandidates", "exploregraph"], explore: ["affordances", "explorepreset", "exploregraph"],
  timeline: ["timeline"], money: ["moneyset", "money", "exploregraph"], calculation: ["calculation", "spotcheck"],
  proceeding: ["entity", "partiesof", "follows", "dutiesof"], "due-date": ["action", "clockproposals", "clocksics"],
  standard: ["standard", "lawrelations"], ties: ["memberties"] };
const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };

for (const [id, ops] of Object.entries(DRAWN)) {
  test(`R10 ${id}: each read pending, refused and unanswered is drawn in its own state, beside the rest, with no key drawn bare (interface-shell R10, R5)`, async () => {
    for (const op of ops) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await open(PATHS[id], { plane: { [op]: answer } });
      const m = main(p);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      const want = name === "pending" ? "loading" : "failed";
      assert.ok(m.querySelector(`[data-state="${want}"]`), `${id}: ${op} ${name} drawn ${want}`);
      if (name === "refused") assert.match(m.querySelector('[data-state="failed"]').textContent, /The plane refused this read|SOME_REFUSAL/);
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
  });
}

test("R10 a read that answers nothing is drawn empty, never failed (control: a refusal is failed, never empty); R22: ties with none draws its designed empty state, not \"You have listed no tie\"", async () => {
  const p = await open(PATHS.ties, { plane: { memberties: ok({ ok: true, member: "mai", count: 0, ties: [] }) } });
  assert.match(main(p).textContent, /Start with “Add this tie”/);
  assert.doesNotMatch(main(p).textContent, /You have listed no tie/);
  assert.equal(main(p).querySelector('[data-state="failed"]'), null);
  const q = await open(PATHS.ties, { plane: { memberties: refusedIn("SOME_REFUSAL") } });
  assert.equal(main(q).querySelector('[data-state="empty"]'), null);
});

test("R10 every grade is drawn as one mark (the scale's name and the letter) explaining itself, on every screen that draws grades", async () => {
  for (const id of ["person", "timeline", "money", "calculation"]) {
    const p = await open(PATHS[id]);
    const grades = main(p).querySelectorAll(".cs-grade");
    assert.ok(grades.length > 0, id);
    for (const g of grades) {
      assert.ok(["capture", "connection", "testimony", "subject"].includes(g.getAttribute("data-scale")), id);
      assert.match(g.textContent, /^(Capture|Connection|Testimony|Subject match)[A-D]$/, id);
      assert.match(g.getAttribute("data-tip") || "", /A is easiest to check/, `${id}: the grade explains itself`);
    }
  }
});

test("R10 every record item a screen names is a reference with its card (DEC-160): people and organisations open person, documents their capture", async () => {
  for (const id of ["people", "person", "timeline", "money", "calculation", "proceeding", "ties"]) {
    const p = await open(PATHS[id]);
    const refs = main(p).querySelectorAll("a.cs-ref, .cs-card");
    assert.ok(refs.length > 0, id);
    for (const r of refs) assert.ok(r.getAttribute("data-tip"), `${id}: ${r.textContent} carries its card`);
    for (const a of main(p).querySelectorAll('a.cs-ref[href^="/app/person/"]')) assert.match(a.getAttribute("href"), /^\/app\/person\/ENT-/);
  }
  const p = await open(PATHS.people);
  assert.ok(main(p).querySelector(`a.cs-ref[href="/app/person/${ENT}"]`), "a person's name opens person (interface-shell R47)");
});

test("R10 after an act the screen reads again what it changed and draws it (control: a refused act reads nothing again)", async () => {
  let n = 0;
  const p = await open(PATHS.ties, { plane: { memberties: () => { n += 1; return ok({ ok: true, member: "mai", count: 0, ties: n > 1 ? [{ tie_id: "MTI-9", entity: "ENT-1", kind: "employer", note: "East Bay Transit", attribution: "group" }] : [] }); },
    declaretie: ok({ ok: true, tie_id: "MTI-9" }) } });
  fill(p, { "tie-who": "ENT-1", "tie-note": "East Bay Transit" });
  await press(p, "declaretie");
  assert.equal(n, 2);
  assert.match(main(p).textContent, /East Bay Transit/);
  const q = await open(PATHS.ties, { plane: { declaretie: refusedIn("NO_SUCH_ENTITY", "No such entity.") } });
  const before = q.byOp("memberties").length;
  fill(q, { "tie-who": "ENT-1", "tie-note": "x" });
  await press(q, "declaretie");
  assert.equal(q.byOp("memberties").length, before);
  assert.match(main(q).textContent, /No such entity\./);
  assert.equal(q.doc.getElementById("tie-note").value, "x", "the form keeps what was typed (interface-shell R13)");
});

test("R10 each screen draws exactly its registry acts, labelled by its words, each an op OPS holds; the shell serves the eleven screens", () => {
  assert.equal(typeof interfacePage(SCREENS), "string", "interface-shell R21's check passes");
  assert.deepEqual(SCREENS.map((s) => s.id), ["people", "person", "explore", "timeline", "money", "calculation", "help", "proceeding", "due-date", "standard", "ties"]);
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    /* interface-shell R55: on explore, stepsource and stepsourcewithdraw re-point connectionassert (screens-investigate R17) */
    const want = s.id === "explore" ? [...reg.acts.map((a) => a.op).filter((o) => o !== "connectionassert"), "stepsource", "stepsourcewithdraw"] : reg.acts.map((a) => a.op);
    assert.deepEqual([...new Set(s.acts.map((a) => a.op))].sort(), [...new Set(want)].sort(), s.id);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, a.op === "stepsource" ? "act.connectionassert.label.explore" : a.op === "stepsourcewithdraw" ? "screen.explore.withdraw" : `act.${a.op}.label.${s.id}`);
      assert.ok(s.words.some((w) => (typeof w === "string" ? w : w[0]) === a.label), `${a.label} listed`);
    }
  }
});

test("R10 the module's own words: frozen [key, en, protected] rows, unique, each a screen's own key, listed by a screen, none shadowing WORD_ROWS but screen.help.purpose", () => {
  const shared = new Set(WORD_ROWS.map((r) => r[0]));
  const keys = new Set();
  const listed = new Set(SCREENS.flatMap((s) => s.words.filter((w) => typeof w !== "string").map((w) => w[0])));
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[0] === "string" && typeof r[1] === "string" && typeof r[2] === "boolean", String(r[0]));
    assert.ok(!keys.has(r[0]), `${r[0]} once`);
    keys.add(r[0]);
    assert.match(r[0], /^screen\.(people|person|explore|timeline|money|calculation|help|proceeding|due-date|standard|ties)\./);
    assert.ok(!shared.has(r[0]) || r[0] === "screen.help.purpose", `${r[0]} shadows WORD_ROWS`);
    assert.ok(listed.has(r[0]), `${r[0]} is drawn by some screen`);
    assert.ok(!/\bCivicsmith\b/.test(r[1].replace(/your group's Civicsmith/g, "").replace(/your group's Civicsmith's/g, "")), `${r[0]} names Civicsmith bare`);
    assert.ok(!/\b(Oakland|Alameda)\b/.test(r[1]), `${r[0]} names no place`);
  }
  for (const s of SCREENS) for (const w of s.words) if (typeof w === "string") assert.ok(shared.has(w), `${s.id}: ${w} in WORD_ROWS`);
  assert.ok(Object.isFrozen(SCREEN_WORDS));
});
