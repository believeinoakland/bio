/* screens-inquiry R44 (setup-words R11–R13; K3366, K3368): words by key. The module holds no member-facing English: every
 * key its screens read is a `words.json` word (`hasWord`), its own rows are none, and over fixtures what it draws for a
 * sample of its keys equals `word(key, vars)`. No test here holds a sentence's English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { SCREEN_WORDS } from "../../../src/screens-inquiry/index.mjs";
import { STAND_INS } from "../../../src/screens-inquiry/document.mjs";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, section, says, word, day, SCREENS, P, Q, D } from "./fixtures.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules["screens-inquiry"];

test("R44 every key the module's screens read is a words.json word, asserted with hasWord; it holds no row of its own", () => {
  assert.deepEqual(SCREEN_WORDS, []);
  for (const s of SCREENS) {
    assert.ok(Array.isArray(s.words) && s.words.length > 0, s.id);
    for (const k of s.words) {
      if (Array.isArray(k)) {
        /* fix round 4 (K4269; BOB's B32): a sentence the design has no row for yet is a stand-in, `[key, English]` from `localize` and listed by the module
           as `STAND_INS`; it is never a key the table already holds (the table's row wins and the stand-in goes), and it is plain English, not a key */
        assert.ok(STAND_INS.some((x) => x[0] === k[0] && x[1] === k[1]), `${s.id}: ${k[0]} is a stand-in the module lists`);
        assert.equal(typeof k[1], "string");
        assert.ok(k[1] && k[1] !== k[0] && !/^[a-z][\w-]*(\.[\w-]+){2,}$/.test(k[1]), `${s.id}: ${k[0]} has plain English`);
        continue;
      }
      assert.equal(typeof k, "string", `${s.id}: a key, or a stand-in row listed in STAND_INS`);
      assert.ok(hasWord(k), `${s.id}: ${k}`);
    }
  }
  /* a stand-in whose row the design has since written is dropped from the list */
  for (const [k, en] of STAND_INS) { assert.ok(!hasWord(k) || en === word(k, new Proxy({}, { get: (_, n) => "{" + String(n) + "}" })), `${k}: the table's row wins`); }
});

test("R44 the keys words-reads.json lists for the module are each a words.json word", () => {
  /* the list was taken from the module's code before T49; the keys it reads since (R23–R43, the dock's withheld reasons)
     are each asserted with hasWord above */
  for (const k of READS.reads) assert.ok(hasWord(k), k);
  assert.equal(READS.unkeyed.length, 0, "DEC-366 keyed record-grammar's two headings: the list marks no string unkeyed");
});

test("R44 over fixtures, what the screens draw for a sample of their keys equals word(key, vars)", async () => {
  const p = await open("/app/project/" + P);
  assert.ok(section(p, "screen.project.stage.head") && says(main(p), "screen.project.stage.read", { count: "2" }));
  assert.equal(main(p).querySelector('button[data-act="promote"]').childNodes[0].data || main(p).querySelector('button[data-act="promote"]').textContent.split(word("weight.reversible.name"))[0],
    word("act.promote.label.project"));
  const q = await open("/app/question/" + Q);
  assert.ok(says(main(q), "question.ask.first.title") && says(main(q), "question.ask.first.says"));
  const d = await open("/app/document/" + D);
  assert.ok(says(main(d), "screen.document.captured", { date: day("2026-10-02T09:00:00Z", { year: true }), source: "https://example.org/ai-4-12.pdf" }));
  const a = await open("/app/projectai/" + P, { plane: { projectparticipants: ok({ ok: true, participants: [{ handle: "mai", state: "joined", owner: true }] }),
    projectaccountstate: ok({ ok: true, held: false }), projectaikeepawaystate: ok({ ok: true, on: false }) } });
  assert.ok(says(main(a), "screen.projectai.account.none") && says(main(a), "screen.projectai.keepaway.off"));
});
