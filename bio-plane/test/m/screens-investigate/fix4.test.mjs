/* screens-investigate, T51 fix round 4 (K4429): C14 (each screen's read set, R4, R34, R52) and the words check of C59 / N3 (a refusal or a silence drawn whole, never
   escaped twice, R10). The whole-path tests of C59 and C8, over the real plane, are `fix4-seam.test.mjs`; these run over the module's scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, silent } from "../interface-shell/harness.mjs";
import { open, main, plane, PATHS, MORE_PATHS, GRAPH, GRAPH_PERSON, word } from "./fixtures.mjs";

/* what the page's frame reads for itself (cause-shell-4, control-plane, queue) is what `help`, a screen that reads nothing, makes the page ask */
let frame = null;
const framed = async () => (frame ||= new Set((await open(PATHS.help)).requests.map((r) => r.op)));
/* and the roster the kit names members from (interface-shell R111), asked when a screen names a member */
const readsOf = (p) => p.requests.filter((r) => !frame.has(r.op) && r.op !== "memberlist");
const count = (rs) => rs.reduce((m, r) => { m[r.op] = (m[r.op] || 0) + 1; return m; }, {});
const SCREENS_OF_THE_MODULE = { ...PATHS, ...MORE_PATHS };
/* the reads of each screen of the module, as it opens (a per-item read is one for each item shown: money's `money` per figure, a matter's documents' `image`) */
const OWN = {
  people: { peopledirectory: 1 },
  person: { exploregraph: 1, affordances: 1, peopledirectory: 1, entity: 1, readingname: 1, heldcaptures: 1, reading: 1, entityidonly: 1, person: 1, samepersoncandidates: 1 },
  theme: { themeread: 1 },
  explore: { exploregraph: 1, affordances: 1, peopledirectory: 1, explorepreset: 1, entityidonly: 1, heldcaptures: 1 },
  timeline: { image: 1, peopledirectory: 1, list: 1, heldcaptures: 1, affordances: 1, reading: 1, timeline: 1, instances: 1, sequence: 1 },
  money: { exploregraph: 1, heldcaptures: 1, list: 1, peopledirectory: 1, moneyset: 1, affordances: 1, reading: 1, image: 1, money: 3, entityidonly: 1 },
  calculation: { calculation: 2, heldcaptures: 1, spotcheck: 1 },
  help: {},
  proceeding: { entitieskind: 2, affordances: 1, entity: 1, partiesof: 1, proceedingdates: 1, follows: 1, heldcaptures: 1, peopledirectory: 1, standards: 1, dutiesof: 2, reading: 1 },
  "due-date": { action: 1, clockproposals: 1, clocksics: 1 },
  standard: { heldcaptures: 1, standard: 1, lawrelations: 1, standards: 1, content: 1, entitieskind: 2, reading: 1 },
  ties: { memberties: 1, peopledirectory: 1 },
  themeOne: { themeread: 1, image: 3 },
  matter: { image: 1, peopledirectory: 1, list: 1, heldcaptures: 1, affordances: 1, instance: 1, reading: 1 },
  progression: { image: 1, peopledirectory: 1, list: 1, heldcaptures: 1, affordances: 1, progression: 1, reading: 1 },
};

test("R4 R34 R52 C14 each screen of the module reads only what it draws, once: its own reads are exactly the set below, no read is asked twice with the same question, and the frame's `queue` and `bootstrap` are asked once", async () => {
  await framed();
  for (const [name, path] of Object.entries(SCREENS_OF_THE_MODULE)) {
    const p = await open(path);
    const own = readsOf(p);
    assert.deepEqual(count(own), OWN[name], `${name}: its reads`);
    const asked = own.map((r) => r.op + JSON.stringify(r.query) + JSON.stringify(r.body || null));
    assert.equal(new Set(asked).size, asked.length, `${name}: no read repeats`);
    for (const op of ["queue", "bootstrap"]) assert.ok(p.byOp(op).length <= 1, `${name}: ${op} once`);
  }
});

test("R18 C14 a graph with no step to colour does not read the connection vocabulary (`affordances`, 43 KB on the live copy), on money and on person; control: one step, one read", async () => {
  const bare = { ok: true, centre: GRAPH_PERSON, at: { value: "2026-10-14", precision: "day", zone: "UTC" }, nodes: [{ id: GRAPH_PERSON, ring: 0, label: "L. Chen" }], steps: [], stopped: [], at_depth: [] };
  for (const name of ["money", "person"]) {
    const p = await open(PATHS[name], { plane: { exploregraph: ok(bare) } });
    assert.equal(p.byOp("affordances").length, 0, `${name}: no step, no vocabulary`);
    assert.ok(main(p).querySelector(".mk-graph, [data-state=empty]") || main(p).textContent.length > 0, `${name}: drawn`);
    const stepped = await open(PATHS[name], { plane: { exploregraph: ok(GRAPH()) } });
    assert.equal(stepped.byOp("affordances").length, 1, `${name}: control, a step is coloured by its group, one read`);
  }
});

/* each read of each screen in turn answered with nothing, and with a refusal that carries neither code nor words: whatever is drawn is drawn whole in the member's words,
   with no entity of its own showing (`&#39;` is the apostrophe of "your team's Civicsmith did not answer" escaped twice) */
const ENTITY = /&(#\d+|amp|lt|gt|quot);/;
test("R10 C59 N3 a read of any screen of the module that did not answer, or was refused with neither code nor words, is drawn whole: the apostrophe plain, never escaped twice", async () => {
  const hows = { silent: () => silent, "refused with no code": () => ({ status: 200, json: { ok: true, result: { ok: false } } }) };
  await framed();
  let drawn = 0;
  for (const [name, path] of Object.entries(SCREENS_OF_THE_MODULE)) {
    const reads = [...new Set(readsOf(await open(path)).map((r) => r.op))];
    for (const op of reads) for (const [how, answer] of Object.entries(hows)) {
      const p = await open(path, { plane: { [op]: answer } });
      const text = main(p).textContent;
      const at = ENTITY.exec(text);
      assert.equal(at, null, `${name}, ${op} ${how}: ${at && text.slice(Math.max(0, at.index - 70), at.index + 40)}`);
      if (text.includes("did not answer")) drawn++;
    }
  }
  assert.ok(drawn > 0, "the failed sentence was drawn somewhere in the sweep");
});
