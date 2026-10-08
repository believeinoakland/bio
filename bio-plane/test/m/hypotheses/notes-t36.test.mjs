/* hypotheses: a note's number is the member's own (R14 as T36 appended it; N727, K2007, K1489), at the interface: two
   members' notes reveal nothing of each other's, a deleted number is never taken again, and a store whose notes were
   numbered from one sequence shared across members is renumbered at boot, each member's turns following their notes. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, BOSS, NOW, INQ } from "./fixture.mjs";
import { hypothesesOps, NOTE_NUMBERS_TABLE } from "../../../src/hypotheses/index.mjs";

const url = (op, q = {}) => { const u = new URL(`https://plane.example/?op=${op}`); for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v); return u; };
/* A fixed clock, so two worlds that differ only in another member's notes can be compared byte for byte. */
const still = () => world({ now: () => NOW });

/** Everything Ann can learn from this module: her numbers, every page of her notes, and every answer she can provoke
 *  by naming a number around her own (or any number another member's notes might carry), through the acts and ops. */
function annSees(w, numbers) {
  const seen = { numbers };
  seen.pages = [w.h.notesOf({ viewer: ANN }), w.h.notesOf({ viewer: ANN, limit: 2 })];
  for (let p = seen.pages[1]; p.next; ) { p = w.h.notesOf({ viewer: ANN, limit: 2, after: p.next.after }); seen.pages.push(p); }
  for (const after of [1, 2, 4, 7, 9, 31, 51, 100]) seen.pages.push(w.h.notesOf({ viewer: ANN, after, limit: 3 }));
  seen.op = hypothesesOps(w.h, url("notes", { viewer: ANN }), {}).notes();
  const probe = [0, 7, 8, 9, 10, 11, 20, 30, 31, 49, 50, 51, 99999, "7", "50"];
  seen.refusals = probe.flatMap((note) => [
    w.h.noteRevise({ note, text: "probe", by: ANN }),
    w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0009-q" }),
    w.h.noteDelete({ note, by: ANN }),
  ]);
  return JSON.stringify(seen);
}

test("R14 R12 no note's number is drawn from a sequence shared across members: Ann's numbers, every page of her notes and every refusal she can provoke are byte-identical whether or not another member kept, kept and deleted, or keeps notes", () => {
  const run = (others) => {
    const w = still();
    const numbers = [];
    for (let i = 0; i < 3; i++) numbers.push(w.h.noteWrite({ text: `ann ${i}`, by: ANN }).note);
    others(w);
    for (let i = 3; i < 6; i++) numbers.push(w.h.noteWrite({ text: `ann ${i}`, by: ANN }).note);
    return { w, numbers };
  };
  const quiet = run(() => {});
  const busy = run((w) => {
    /* vera's 50 notes, 20 of them deleted; the boss's 7, kept */
    const vera = [];
    for (let i = 0; i < 50; i++) vera.push(w.h.noteWrite({ text: `vera ${i}`, by: OUTSIDER }).note);
    for (const n of vera.slice(10, 30)) assert.equal(w.h.noteDelete({ note: n, by: OUTSIDER }).ok, true);
    for (let i = 0; i < 7; i++) w.h.noteWrite({ text: `boss ${i}`, by: BOSS });
  });
  assert.deepEqual(quiet.numbers, [1, 2, 3, 4, 5, 6], "a member's numbers are dense from 1, their own alone");
  assert.deepEqual(busy.numbers, quiet.numbers);
  assert.equal(annSees(busy.w, busy.numbers), annSees(quiet.w, quiet.numbers), "nothing of another member's notes shows");
  /* the same the other way: vera's numbers carry nothing of Ann's */
  const veraFirst = still();
  const alone = [1, 2, 3].map((i) => veraFirst.h.noteWrite({ text: `vera ${i}`, by: OUTSIDER }).note);
  assert.deepEqual(alone, [1, 2, 3]);
  const veraAfter = busy.w.h.noteWrite({ text: "vera 50", by: OUTSIDER }).note;
  assert.equal(veraAfter, 51, "vera's next number follows vera's own 50, whatever Ann keeps");
  /* each member's note 1 is their own: the same number names a different note for each, and no act crosses */
  assert.deepEqual([ANN, OUTSIDER, BOSS].map((viewer) => busy.w.h.notesOf({ viewer }).notes.at(-1)).map((n) => [n.note, n.text]),
    [[1, "ann 0"], [1, "vera 0"], [1, "boss 0"]]);
  assert.equal(busy.w.h.noteRevise({ note: 1, text: "vera's own first note, revised", by: OUTSIDER }).ok, true);
  assert.equal(busy.w.h.notesOf({ viewer: ANN }).notes.at(-1).text, "ann 0", "Ann's note 1 untouched by vera's act on hers");
});

test("R14 a later note never takes a deleted note's number: the member's own mark, not the largest number held, gives the next one, after a boot and a whole-store purge too; the mark is declared the member's alone, never exported", () => {
  const w = still();
  const a = [1, 2, 3].map((i) => w.h.noteWrite({ text: `a${i}`, by: ANN }).note);
  assert.equal(w.h.noteDelete({ note: a[2], by: ANN }).ok, true, "Ann deletes her latest note");
  const next = w.h.noteWrite({ text: "after", by: ANN }).note;
  assert.equal(next, 4, "never 3 again");
  w.h.noteDelete({ note: next, by: ANN });
  w.h.noteDelete({ note: a[1], by: ANN });
  w.h.migrate();
  assert.equal(w.h.noteWrite({ text: "after boot", by: ANN }).note, 5, "the mark survives a boot");
  /* a refused note, or one whose act rolls back, takes no number */
  assert.equal(w.h.noteWrite({ text: "", by: ANN }).ok, false);
  assert.equal(w.h.noteWrite({ text: "next", by: ANN }).note, 6);
  /* the mark is the member's own, holds no text and no other member's count */
  assert.deepEqual(w.rows(`SELECT * FROM ${NOTE_NUMBERS_TABLE}`), [{ member: "ann", last: 6 }]);
  const d = w.record.declaredTables().find((t) => t.module === "hypotheses" && t.name === NOTE_NUMBERS_TABLE);
  assert.deepEqual([d.sight, d.export, d.purge, d.version_chain, d.derive], ["owner", "never", "exempt", false, "stored"]);
  /* a whole-store purge clears the notes and keeps the mark (as record-core keeps its id counter, its R23) */
  assert.equal(w.record.purge({}).removed.member_notes, 3);
  assert.equal(w.h.noteWrite({ text: "after purge", by: ANN }).note, 7);
  /* nothing of this module answers the mark */
  for (const r of [w.h.notesOf({ viewer: ANN }), w.h.notesOf({ viewer: OUTSIDER }), w.h.hypothesesOf({ inquiry: INQ, viewer: ANN })])
    assert.ok(!JSON.stringify(r).includes('"last"'), JSON.stringify(r).slice(0, 120));
});

/* A store as T34 and T35 left it: one AUTOINCREMENT sequence over every member's notes, with T35's `revised`. */
function sharedSequenceStore() {
  const w = still();
  for (const t of ["member_notes", "member_note_turns", NOTE_NUMBERS_TABLE]) w.st.db.exec(`DROP TABLE ${t}`);
  w.st.db.exec(`CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, member TEXT NOT NULL, text TEXT NOT NULL,
                at TEXT NOT NULL, revised TEXT)`);
  w.st.db.exec(`CREATE INDEX member_notes_of ON member_notes (member, note_id)`);
  w.st.db.exec(`CREATE TABLE member_note_turns (seq INTEGER PRIMARY KEY AUTOINCREMENT, note_id INTEGER NOT NULL, member TEXT NOT NULL,
                turned_into TEXT NOT NULL, made_id TEXT NOT NULL, at TEXT NOT NULL)`);
  w.st.db.exec(`CREATE INDEX member_note_turns_of ON member_note_turns (note_id, seq)`);
  const put = (member, text, revised = null) => {
    w.st.sql.exec(`INSERT INTO member_notes (member, text, at, revised) VALUES (?,?,?,?)`, member, text, `2026-10-0${1 + (text.length % 5)}T00:00:00.000Z`, revised);
    return Number(w.rows(`SELECT last_insert_rowid() AS id`)[0].id);
  };
  const turn = (note, member, into, id) => w.st.sql.exec(`INSERT INTO member_note_turns (note_id, member, turned_into, made_id, at) VALUES (?,?,?,?,?)`,
    note, member, into, id, "2026-10-05T00:00:00.000Z");
  /* interleaved: ann 1, vera 2, ann 3, vera 4 (deleted), vera 5, ann 6 (deleted), ann 7 */
  const n1 = put("ann", "ann first");
  const n2 = put("outsider", "vera first", "2026-10-06T00:00:00.000Z");
  const n3 = put("ann", "ann second");
  const n4 = put("outsider", "vera gone");
  const n5 = put("outsider", "vera second");
  const n6 = put("ann", "ann gone");
  const n7 = put("ann", "ann third", "2026-10-07T00:00:00.000Z");
  w.st.sql.exec(`DELETE FROM member_notes WHERE note_id IN (?, ?)`, n4, n6);
  turn(n3, "ann", "question", "INQ-2026-0002-q");
  turn(n2, "outsider", "observation", "INFO-2026-0001-doc");
  turn(n7, "ann", "observation", "INFO-2026-0002-doc");
  turn(n3, "ann", "hunch", "HYP-2026-0001");
  turn(n5, "outsider", "question", "INQ-2026-0003-q");
  return { w, ids: { n1, n2, n3, n5, n7 } };
}

test("R14 a store numbered from a sequence shared across members is renumbered at boot: each member's notes from 1 in their present order, text, at and revised kept, their turns following them, the shared sequence's mark kept nowhere; a second boot changes nothing", () => {
  const { w } = sharedSequenceStore();
  assert.ok(w.rows(`SELECT * FROM sqlite_sequence WHERE name = 'member_notes'`).length, "the shared mark, before");
  w.h.migrate();
  const page = (viewer) => w.h.notesOf({ viewer }).notes.map((n) => [n.note, n.text, n.at, n.revised, n.turned.map((t) => [t.into, t.id])]);
  const ann = [
    [3, "ann third", "2026-10-05T00:00:00.000Z", "2026-10-07T00:00:00.000Z", [["observation", "INFO-2026-0002-doc"]]],
    [2, "ann second", "2026-10-01T00:00:00.000Z", null, [["question", "INQ-2026-0002-q"], ["hunch", "HYP-2026-0001"]]],
    [1, "ann first", "2026-10-05T00:00:00.000Z", null, []],
  ];
  const vera = [
    [2, "vera second", "2026-10-02T00:00:00.000Z", null, [["question", "INQ-2026-0003-q"]]],
    [1, "vera first", "2026-10-01T00:00:00.000Z", "2026-10-06T00:00:00.000Z", [["observation", "INFO-2026-0001-doc"]]],
  ];
  assert.deepEqual(page(ANN), ann, "dense from 1, newest first, turns on the right notes");
  assert.deepEqual(page(OUTSIDER), vera);
  assert.deepEqual(w.rows(`SELECT * FROM sqlite_sequence WHERE name LIKE 'member_notes%'`), [], "the shared sequence's mark is gone");
  assert.deepEqual(w.rows(`SELECT member, last FROM ${NOTE_NUMBERS_TABLE} ORDER BY member`), [{ member: "ann", last: 3 }, { member: "outsider", last: 2 }]);
  assert.deepEqual(w.rows(`SELECT name FROM sqlite_master WHERE name LIKE 'member_note%' ORDER BY name`).map((r) => r.name),
    ["member_note_numbers", "member_note_told", "member_note_turns", "member_note_turns_member", "member_notes"],
    "no copy of the old table or its index is left");
  /* a second boot changes nothing; the acts carry on from each member's own mark */
  const snapshot = JSON.stringify(w.rows(`SELECT * FROM member_notes ORDER BY member, note_id`)) + JSON.stringify(w.rows(`SELECT * FROM member_note_turns ORDER BY seq`));
  w.h.migrate();
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM member_notes ORDER BY member, note_id`)) + JSON.stringify(w.rows(`SELECT * FROM member_note_turns ORDER BY seq`)), snapshot);
  assert.deepEqual([w.h.noteWrite({ text: "ann fourth", by: ANN }).note, w.h.noteWrite({ text: "vera third", by: OUTSIDER }).note], [4, 3]);
  assert.equal(w.h.noteDelete({ note: 2, by: ANN }).ok, true, "a renumbered note is reached by its new number");
  assert.deepEqual(page(ANN).map((n) => n[0]), [4, 3, 1]);
  assert.deepEqual(w.rows(`SELECT COUNT(*) AS n FROM member_note_turns WHERE member = 'ann'`)[0].n, 1, "its turns went with it");
  assert.equal(page(OUTSIDER)[1][4].length, 1, "another member's turns untouched");
});

test("R14 R15 the renumbering is one act: a boot that fails part-way leaves the shared-sequence store whole, and the next boot renumbers it; a store with no notes boots as an empty one", () => {
  const { w, ids } = sharedSequenceStore();
  const before = JSON.stringify(w.rows(`SELECT * FROM member_notes ORDER BY note_id`)) + JSON.stringify(w.rows(`SELECT * FROM member_note_turns ORDER BY seq`));
  const real = w.st.sql.exec;
  w.st.sql.exec = (q, ...a) => { if (/^ALTER TABLE member_notes_renumbered/.test(q.trim())) throw new Error("storage failed"); return real.call(w.st.sql, q, ...a); };
  assert.throws(() => w.h.migrate());
  w.st.sql.exec = real;
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM member_notes ORDER BY note_id`)) + JSON.stringify(w.rows(`SELECT * FROM member_note_turns ORDER BY seq`)), before);
  assert.deepEqual(w.rows(`SELECT note_id FROM member_notes ORDER BY note_id`).map((r) => r.note_id), [ids.n1, ids.n2, ids.n3, ids.n5, ids.n7]);
  w.h.migrate();
  assert.deepEqual(w.h.notesOf({ viewer: ANN }).notes.map((n) => n.note), [3, 2, 1]);
  /* no notes at all */
  const empty = still();
  empty.st.db.exec(`DROP TABLE member_notes`);
  empty.st.db.exec(`CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, member TEXT NOT NULL, text TEXT NOT NULL, at TEXT NOT NULL)`);
  empty.h.migrate();
  assert.deepEqual(empty.h.notesOf({ viewer: ANN }).notes, []);
  assert.equal(empty.h.noteWrite({ text: "first", by: ANN }).note, 1);
  assert.deepEqual(empty.h.notesOf({ viewer: ANN }).notes.map((n) => [n.note, n.text, n.revised]), [[1, "first", null]]);
});
