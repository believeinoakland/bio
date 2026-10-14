/* screens-inquiry R5 (with interface-shell R5, R8–R13 and R16 on this module's screens), on the shell's served page: each
 * screen with each of its reads answered pending, refused and not at all draws every read in its own state and no key
 * the page holds no word for; every grade is one mark, the scale's name and the letter; every record item named is a
 * reference; each screen draws only its registry acts, every act its requirements name among them, each an op `OPS`
 * holds, and the shell serves the module's screens (its R21 check). Words by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { refusedIn, silent, pending, ok } from "../interface-shell/harness.mjs";
import { open, main, rawKeys, plane, word, inquiryMd, INQUIRY_REFS, LEGS, SCREENS, P, Q, D } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
const PATHS = { project: "/app/project/" + P, question: "/app/question/" + Q, document: "/app/document/" + D, projectai: "/app/projectai/" + P };
/* the reads each screen draws in one of the four states, by op (the rest feed what is drawn: titles, choices) */
const DRAWN = { project: ["projectstage", "strengthbarof", "projectquestions", "list", "projectaccountstate", "projectparticipants", "projectvisibility"],
                question: ["inquirystrength", "questionwaits", "hypotheses"],
                document: ["backlinks", "reading", "versionchain"],
                projectai: ["projectaccountstate", "projectaikeepawaystate", "accountuses", "ailimits", "aiusage", "accounthistory"] };
/* the question with its partition held (state a), so its strength is drawn */
const GROUPED = { [Q]: { "bundle.md": inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)),
  grounds: [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }] }) } };
/* projectai's reads answered as an owner of the project reads them (R14), so every one is drawn */
const AI = { projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "mai", state: "joined", owner: true }] }),
  projectaccountstate: ok({ ok: true, held: true, kind: "apikey", on: true, set_at: "2026-10-05T09:00:00Z", by: "mai", serving: "project" }),
  projectkeynotice: ok({ ok: true, due: true, text: "The notice." }), projectaikeepawaystate: ok({ ok: true, on: false }),
  accountuses: ok({ owner: "project:" + P, held: true, uses: { ask: true } }), ailimits: ok({ ok: true, limits: [], history: [] }),
  aiusage: ok({ ok: true, uses: [] }), accounthistory: ok({ ok: true, changes: [] }) };
const base = (id) => (id === "projectai" ? AI : {});
const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };
/* the acts each screen's requirements name (R1–R4, R10–R16, R25, R28–R33, R37, R41) */
const NAMED = {
  project: ["promote", "drawquestion", "findin", "projectbarset", "projectinvite", "projectjoin", "planopen", "projectvisibilityset", "projectownerremove",
    "projectowneradd", "projectremove", "projectleave", "projectfork", "projectownerrescue"],
  question: ["cite", "sever", "reinstate", "narrow", "conclude", "withdrawconclusion", "hypothesishold", "planopen", "checkrequest", "heldrestore", "search",
    "inquiryground", "versionaccept", "versionhide", "versionconsider", "versionreject", "versionrevert", "versioncurrent", "readtranslate", "airunopen", "airunclose"],
  document: ["gradenote", "release", "cite", "retire", "attest", "identityclaim", "monitorset", "monitor", "findin", "pagetranscribe", "transcribe",
    "adoptversion", "keepversion", "connectionchoose", "explore"],
  assistant: ["airunopen", "suggest", "airunclose"],
  projectai: ["projectkeyset", "projectsigninset", "projectaccountswitch", "projectaccountremove", "projectkeynoticeseen", "accountusesset", "ailimitset", "projectaikeepaway", "projectjoin"],
};

for (const [id, path] of Object.entries(PATHS)) {
  test(`R5 ${id}: each read pending, refused and unanswered is drawn in its own state, beside the rest, with no key drawn bare (interface-shell R5, R10)`, async () => {
    for (const op of DRAWN[id]) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await open(path, { images: id === "question" ? GROUPED : {}, plane: { ...base(id), [op]: answer } });
      const m = main(p);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      const want = name === "pending" ? "loading" : "failed";
      assert.ok(m.querySelector(`[data-state="${want}"]`), `${id}: ${op} ${name} drawn ${want}`);
      if (name === "refused") assert.match(m.querySelector('[data-state="failed"]').textContent, /The plane refused this read|SOME_REFUSAL/);
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
  });

  if (id !== "projectai") test(`R5 ${id}: every grade is drawn as one mark (the scale's name and the letter), every record item named a reference to its screen`, async () => {
    const p = await open(path, { images: id === "question" ? GROUPED : {} });
    const m = main(p);
    const grades = m.querySelectorAll(".cs-grade");
    assert.ok(grades.length > 0);
    for (const g of grades) {
      const scale = g.getAttribute("data-scale");
      assert.ok(["capture", "connection", "testimony"].includes(scale));
      assert.match(g.textContent, new RegExp(`^${word("mark.scale." + scale + ".name")}[A-D]$`));
      /* the tip's text up to its first apostrophe, which the attribute carries escaped */
      assert.ok((g.getAttribute("data-tip") || "").includes(word("mark.grade.reading").split("'")[0]), "the grade explains itself");
    }
    const refs = m.querySelectorAll("a.cs-ref").map((a) => a.getAttribute("href"));
    assert.ok(refs.length > 0);
    for (const h of refs) assert.match(h, /^\/app\/(question|document|project|open-file|plan|timeline|calculation|standard)\//);
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

test("R5 R14–R16 R25 R28–R33 R37 R41 each screen draws its requirements' acts, each the registry's, labelled by act.<op>.label.<screen>, each an op OPS holds; the shell serves them", () => {
  assert.equal(typeof interfacePage(SCREENS), "string", "interface-shell R21's check passes");
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    const ops = s.acts.map((a) => a.op);
    assert.deepEqual([...ops].sort(), [...NAMED[s.id]].sort(), `${s.id}: exactly the acts its requirements name`);
    for (const op of ops) assert.ok(reg.acts.some((a) => a.op === op), `${s.id}: ${op} is the registry's`);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, `act.${a.op}.label.${s.id}`);
      assert.ok(s.words.includes(a.label), `${a.label} listed`);
    }
  }
  assert.deepEqual(SCREENS.map((s) => s.id), ["project", "question", "document", "assistant", "projectai"]);
});
