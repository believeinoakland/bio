/* action-holds' T46 requirement at its interface: R15 (DEC-194; N913; amends R11) C-149.10 `MACHINE_CANNOT_SEND` reads
   `words.json`'s `refusal.MACHINE_CANNOT_SEND` by key from `ACTION_HOLDS_WORDS`, never a copy, its code, number and
   `where` unmoved; C-149.11 `HOLD_NOT_IN_PLACE` and C-149.8 `HOLD_PLACE_REFUSED` keep their present translations, and
   no other row moves. Each refusal with its control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V, MACHINE, received } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const A = "ACTN-2026-0001-a";
const ALICE = V("alice");

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* P alice's hidden project, D her discoverable one; A in P with two received entries; a case owned by P (publication's
   `cases`, its R40 read contract). */
function ground() {
  const w = world();
  const P = w.project("alice"), D = w.project("alice", "discoverable");
  w.action(A, [`project: ${P}`, ...received(2)]);
  w.st.db.exec(`CREATE TABLE IF NOT EXISTS cases (case_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, opened TEXT NOT NULL)`);
  w.st.db.exec(`INSERT INTO cases VALUES ('CASE-2026-0001', '${D}', 't')`);
  const hold = (x) => w.h.actionHold({ hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE, ...x });
  return { w, P, D, hold };
}

test("R15 C-149.10 MACHINE_CANNOT_SEND reads words.json's refusal.MACHINE_CANNOT_SEND by key from ACTION_HOLDS_WORDS, never a copy; its code, number and where unmoved; answered at the act", () => {
  assert.ok(Object.isFrozen(holds.ACTION_HOLDS_WORDS));
  assert.deepEqual(Object.keys(holds.ACTION_HOLDS_WORDS), ["refusal.MACHINE_CANNOT_SEND"], "the table holds exactly the one row's key");
  assert.equal(holds.ACTION_HOLDS_WORDS["refusal.MACHINE_CANNOT_SEND"], en("refusal.MACHINE_CANNOT_SEND"), "verbatim");
  const row = holds.ACTION_HOLDS_CHECKS.MACHINE_CANNOT_SEND;
  assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"]);
  assert.deepEqual([row.check, row.where], ["C-149.10", "src/action-holds/index.mjs holdNoticeSent > is-machine-send"]);
  assert.equal(row.translation, holds.ACTION_HOLDS_WORDS["refusal.MACHINE_CANNOT_SEND"], "the row reads the word by key");
  assert.doesNotMatch(row.translation, /automated one/, "T45's words are answered no longer");
  /* at the act, for every machine or absent author */
  const { w, hold } = ground();
  hold({ target: A, ord: 0 });
  for (const author of [MACHINE, "token:cron", "", null]) {
    const r = w.h.holdNoticeSent({ place: { target: A, ord: 0 }, at: "2026-09-29", account: "a", viewer: ALICE, author });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "MACHINE_CANNOT_SEND", "MACHINE_CANNOT_SEND", "C-149.10", en("refusal.MACHINE_CANNOT_SEND")], String(author));
  }
  /* control: a member's record lands */
  assert.equal(w.h.holdNoticeSent({ place: { target: A, ord: 0 }, at: "2026-09-29", account: "a", viewer: ALICE, author: ALICE }).ok, true);
});

test("R15 C-149.11 HOLD_NOT_IN_PLACE and C-149.8 HOLD_PLACE_REFUSED keep their present translations, not words.json's; no other row's check, where or translation moved", () => {
  const rows = holds.ACTION_HOLDS_CHECKS;
  const KEPT_WORDS = {
    HOLD_NOT_IN_PLACE: ["C-149.11", "holdNotInPlace > is-hold-not-in-place", "A hold notice is recorded for a hold that is in "
      + "place, and the hold at this place is not: none has been placed, or it was released. Nothing was written."],
    HOLD_PLACE_REFUSED: ["C-149.8", "#placeOf > is-hold-place", "A litigation hold is placed at one place: an action, one "
      + "entry of an action named by its position, or a project. This named more than one, or an entry that is not there, "
      + "so nothing was written."],
  };
  for (const [code, [check, region, translation]] of Object.entries(KEPT_WORDS)) {
    assert.deepEqual([rows[code].check, rows[code].where, rows[code].translation],
      [check, `src/action-holds/index.mjs ${region}`, translation], code);
    assert.ok(!(`refusal.${code}` in holds.ACTION_HOLDS_WORDS), `${code}: not taken in T46`);
    assert.notEqual(rows[code].translation, en(`refusal.${code}`), `${code}: words.json's sentence and the requirement do not yet agree`);
  }
  /* every row but the one R15 re-words, pinned whole as T45 left it (KEPT measured on the T46 START's tree) */
  const kept = Object.fromEntries(Object.entries(rows).filter(([c]) => c !== "MACHINE_CANNOT_SEND"));
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))],
    [10, "9cd0476d5536ccec4eb498903f4cd88041fce7850b7f4c44c05b29d266c8ec48"], "no other row's check, where or translation moved");
  for (const [code, r] of Object.entries(kept)) assert.ok(!Object.values(holds.ACTION_HOLDS_WORDS).includes(r.translation), code);
  /* filings relays HOLD_NOT_IN_PLACE unchanged: the minter answers the kept row */
  assert.equal(holds.holdNotInPlace({ project: "PROJ-2026-0001-x" }).translation, KEPT_WORDS.HOLD_NOT_IN_PLACE[2]);
});
