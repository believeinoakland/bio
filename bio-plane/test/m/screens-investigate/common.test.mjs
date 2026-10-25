/* screens-investigate R10 (with interface-shell R8–R13 and R16 on this module's screens), on the shell's served page:
 * each screen with each read it draws answered pending, refused and not at all draws that read in its own state, beside
 * the rest; every grade is one mark (the scale's name and the letter) explaining itself; every record item named is a
 * reference with its card; each screen draws exactly its registry acts and the shell serves the module's screens (its
 * R21 check); the module's own words are well formed; after an act the screen reads again what it changed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { WORD_ROWS, word, hasWord } from "../../../src/setup-words/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { refusedIn, silent, pending, ok } from "../interface-shell/harness.mjs";
import { open, main, rawKeys, plane, DIRECTORY, press, fill, SCREENS, PATHS, P, ENT, MSR, CALC, PROC, ACT, STD, SHA } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("./fixtures/registry-43379a1a44.json", import.meta.url), "utf8"));
/* N1073: no hand list of other modules' ops. The reads a screen makes are those it is seen to send over the scripted plane; each
 * answered pending, refused and not at all must leave the screen standing, and draw its own state where the screen draws one (the
 * reads that only feed a title or a choice draw none). The screen's subject read and the screen's other state-drawn reads are
 * found by the page itself: at least one read per screen draws its state. */
/* The design's own label keys for acts whose words the requirements name (R31, R32, R33, R36, R37). */
const LABELS = { "person:entityalias": "entity.alias.add", "person:aliaswithdraw": "act.owed_aliaswithdraw.label.person", "person:relationdeclare": "entity.relation.declare",
  "person:resolve": "entity.naming.match", "person:resolvetestify": "entity.naming.testify", "person:connect": "entity.connect", "timeline:thread": "progression.thread",
  "timeline:discharge": "progression.discharge", "timeline:proposedispose": "progression.setaside", "timeline:progressiondefine": "progression.define.go",
  "theme:themedeclare": "theme.declare.go", "theme:themeplace": "theme.confirm", "people:entitycreate": "screen.people.add.submit" };
const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };
const readsOf = async (id) => {
  const p = await open(PATHS[id]);
  const served = new Set(Object.keys(plane()));
  return [...new Set(p.requests.map((r) => r.op))].filter((op) => served.has(op));
};

for (const id of Object.keys(PATHS).filter((x) => x !== "help")) {
  test(`R10 ${id}: each read pending, refused and unanswered is drawn in its own state, beside the rest, with no key drawn bare (interface-shell R10, R5)`, async () => {
    const drawn = new Set();
    for (const op of await readsOf(id)) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await open(PATHS[id], { plane: { [op]: answer } });
      const m = main(p);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      const want = name === "pending" ? "loading" : "failed";
      if (m.querySelector(`[data-state="${want}"]`)) {
        drawn.add(op);
        if (name === "refused") assert.ok(/The plane refused this read|SOME_REFUSAL/.test(m.querySelector('[data-state="failed"]').textContent), "the refusal's own words");
      }
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
    assert.ok(drawn.size > 0, `${id}: some read is drawn in its own state`);
    const subject = SCREENS.find((s) => s.id === id).reads({ subject: PATHS[id].split("/")[3], ui: {}, data: {} });
    for (const r of Object.values(subject)) if (r.subject === true) assert.ok(drawn.has(r.op), `${id}: its subject read ${r.op} is drawn in its own state`);
  });
}

test("R10 a read that answers nothing is drawn empty, never failed (control: a refusal is failed, never empty); R22: ties with none draws its designed empty state, not \"You have listed no tie\"", async () => {
  const p = await open(PATHS.ties, { plane: { memberties: ok({ ok: true, member: "mai", count: 0, ties: [] }) } });
  assert.ok(main(p).textContent.includes(word("screen.ties.first")), "the designed empty state, naming the first step");
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
      const scale = g.getAttribute("data-scale");
      assert.equal(g.textContent, word("mark.scale." + scale + ".name") + g.textContent.slice(-1), id);
      assert.match(g.textContent, /[A-D]$/, id);
      assert.ok((g.getAttribute("data-tip") || "").includes(word("mark.grade.reading").split(";")[0]), `${id}: the grade explains itself`);
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
  assert.ok(main(p).textContent.includes("East Bay Transit"), "the tie she added, read again");
  const q = await open(PATHS.ties, { plane: { declaretie: refusedIn("ODD_TIE_REFUSAL", "No such entity.") } });
  const before = q.byOp("memberties").length;
  fill(q, { "tie-who": "ENT-1", "tie-note": "x" });
  await press(q, "declaretie");
  assert.equal(q.byOp("memberties").length, before);
  assert.ok(main(q).textContent.includes("No such entity."), "the refusal by its words");
  assert.equal(q.doc.getElementById("tie-note").value, "x", "the form keeps what was typed (interface-shell R13)");
});

test("R10 each screen draws exactly its registry acts, labelled by its words, each an op OPS holds; the shell serves the twelve screens", () => {
  assert.equal(typeof interfacePage(SCREENS), "string", "interface-shell R21's check passes");
  assert.deepEqual(SCREENS.map((s) => s.id), ["people", "person", "explore", "timeline", "money", "calculation", "help", "proceeding", "due-date", "standard", "ties", "theme"]);
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    /* B14 (K4259): each screen names exactly the acts the registry lists for it (and its owed acts under their op names) */
    const want = reg.acts.map((a) => a.op.replace(/^owed:(\S+).*$/, "$1"));
    assert.deepEqual([...new Set(s.acts.map((a) => a.op))].sort(), [...new Set(want)].sort(), s.id);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, LABELS[s.id + ":" + a.op] ? LABELS[s.id + ":" + a.op] : a.op === "stepsource" ? "act.stepsource.label.explore" : `act.${a.op}.label.${s.id}`);
      assert.ok(s.words.some((w) => (typeof w === "string" ? w : w[0]) === a.label), `${a.label} listed`);
    }
  }
});

/* K5173 (HANDOFF B520): the rows UX-DESIGN adopts for this round's causes; the source draws each by key, and each is a `test.todo` until the word table holds it */
const ADOPTED = ["screen.person.expunge.marker", "screen.person.holds.heading", "screen.person.holds.holder", "screen.person.holds.capacity", "screen.person.holds.empty",
  "act.recordline.label.office", "screen.calculation.column", "screen.calculation.column.help", "screen.calculation.part", "screen.calculation.part.help",
  ...["implements", "refers_to", "amends", "repeals", "renumbers", "recodifies", "defines", "excepts", "incorporates"].map((k) => "screen.standard.rel.in." + k)];
for (const key of ADOPTED) if (!hasWord(key)) test.todo(`K5173: ${key} is a word the table holds (hasWord)`);

test("R30 the module holds no member-facing English: no SCREEN_WORDS, every screen lists keys only, each key a word setup-words holds (hasWord); what is drawn equals word(key, vars)", async () => {
  const mod = await import("../../../src/screens-investigate/index.mjs");
  assert.equal(mod.SCREEN_WORDS, undefined, "the module exports no rows of English");
  for (const s of SCREENS) {
    assert.equal(new Set(s.words).size, s.words.length, `${s.id}: keys listed once`);
    for (const w of s.words) {
      assert.equal(typeof w, "string", `${s.id}: ${JSON.stringify(w)} is a key, not a row`);
      assert.ok(hasWord(w), `${s.id}: ${w} is a word`);
    }
  }
  /* each key the source names, found by its shape, is a word (the keys a screen reads without listing them too) */
  const dir = new URL("../../../src/screens-investigate/", import.meta.url);
  const SHAPE = /["`]((?:screen|act|connection|mark|state|file|proceeding|column|shell)\.[a-z0-9_.-]*[a-z0-9_])["`]/g;
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    for (const m of text.matchAll(SHAPE)) assert.ok(hasWord(m[1]) || ADOPTED.includes(m[1]), `${f}: ${m[1]} is no word`);
  }
  const p = await open(PATHS.ties);
  for (const k of ["screen.ties.why.1", "screen.ties.who.1", "screen.ties.either", "screen.ties.add"]) assert.ok(main(p).textContent.includes(word(k)), k);
  assert.ok(WORD_ROWS.length > 0);
});

test("D29 an answer that says ok and carries a refusal is drawn as the refusal, never as success: a graph, a search and a spot-check read", async () => {
  const refusal = ok({ ok: true, refused: "NO_NODE", why: "No such record." });
  const g = await open(PATHS.explore, { plane: { exploregraph: refusal } });
  assert.ok(main(g).querySelector('[data-state="failed"]'), "the graph read");
  assert.equal(main(g).querySelector(".mk-graph"), null);
  const s = await open(PATHS.calculation, { plane: { spotcheck: refusal } });
  assert.ok(main(s).querySelector('[data-state="failed"]'), "the spot-check read");
  const p = await open(PATHS.people, { plane: { peopledirectory: (r) => (r.query.q ? refusal : ok(DIRECTORY())) } });
  fill(p, { "people-q": "chen" });
  await press(p, "search");
  assert.ok(main(p).querySelector('[data-state="failed"]'), "the search");
  assert.equal(main(p).querySelector('[data-state="empty"]'), null);
});
