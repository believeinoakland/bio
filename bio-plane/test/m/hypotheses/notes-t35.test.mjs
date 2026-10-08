/* hypotheses: a member revises their own note in place and deletes it for good (R11–R15 as T35 amended them; DEC-144),
   at the interface: the acts, the read, the ops, and the whole store read directly for what is left behind. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, BOSS, INQ, E1, E2 } from "./fixture.mjs";
import { hypothesesOps, hypothesesOf, HYPOTHESES_CHECKS, NOTE_MAX_BYTES } from "../../../src/hypotheses/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const row = (code) => HYPOTHESES_CHECKS[code];
/** The notes table as T34 made it: one number sequence for the whole group, no `revised`. */
const T34_MEMBER_NOTES = `CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, member TEXT NOT NULL, text TEXT NOT NULL, at TEXT NOT NULL)`;
const url = (op) => new URL(`https://plane.example/?op=${op}`);
const notesRows = (w) => w.rows(`SELECT * FROM member_notes ORDER BY note_id`);
const turnRows = (w) => w.rows(`SELECT * FROM member_note_turns ORDER BY seq`);
/** Every row of every table in the store, as text: what R14 and R15 say holds nothing of an earlier text or a deleted note. */
const everything = (w) => w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map((t) => `${t.name}:${JSON.stringify(w.rows(`SELECT * FROM "${t.name}"`))}`).join("\n");
const refusedAs = (r, code) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row(code).check, row(code).translation], JSON.stringify(r).slice(0, 160));
const same = (a, b) => assert.deepEqual({ ...a, note: null }, { ...b, note: null }, "answered exactly as an absent note");

test("R11 noteRevise replaces in place the text of one note `by` kept, answering {ok, note, at} and never courtStatement; the note keeps its number and its turns, and its earlier text is kept nowhere", () => {
  const w = world();
  w.bundle(INQ);
  assert.equal(w.membership.courtNoticeSet({ choice: "tell", by: "boss" }).ok, true);
  const first = w.h.noteWrite({ text: "the first words, about the clerk", by: ANN });
  assert.ok("courtStatement" in first);
  const { note } = first;
  w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0002-q" });
  const turnsBefore = turnRows(w);
  const words = "  the revised words, exactly as written\n";
  const r = w.h.noteRevise({ note, text: words, by: ANN });
  assert.deepEqual(Object.keys(r).sort(), ["at", "note", "ok"], "never courtStatement");
  assert.deepEqual([r.ok, r.note], [true, note]);
  assert.ok(typeof r.at === "string" && r.at > first.at, "at is the revision's instant");
  const [n] = w.h.notesOf({ viewer: ANN }).notes;
  assert.deepEqual([n.note, n.text, n.at, n.revised], [note, words, first.at, r.at], "same number, current text, kept at, revised at");
  assert.deepEqual(n.turned.map((t) => t.id), ["INQ-2026-0002-q"], "its turns kept");
  assert.deepEqual(turnRows(w), turnsBefore);
  assert.equal(notesRows(w).length, 1, "overwritten in place, no second row");
  assert.ok(!everything(w).includes("the first words"), "the earlier text is in no row of the store");
  /* a revision is not a first note: a member never told before is not told by revising */
  const out = w.h.noteWrite({ text: "x", by: OUTSIDER });
  w.membership.courtNoticeSet({ choice: "dont", by: "boss" });
  w.membership.courtNoticeSet({ choice: "tell", by: "boss" });
  assert.ok(!("courtStatement" in w.h.noteRevise({ note: out.note, text: "y", by: OUTSIDER })));
  /* the bound is in bytes, exactly the bound kept whole */
  const edge = "é".repeat(NOTE_MAX_BYTES / 2);
  assert.equal(w.h.noteRevise({ note, text: edge, by: ANN }).ok, true);
  assert.equal(w.h.notesOf({ viewer: ANN }).notes.find((x) => x.note === note).text, edge, "never cut");
});

test("R11 noteRevise's refusals in order, each writing nothing: MACHINE_CANNOT_NOTE, NO_SUCH_NOTE (absent, deleted or another's, an administrator's included, one answer; the founder's and a machine's stamp refused first), NOTE_NO_TEXT, NOTE_TOO_LONG (refused, never cut)", () => {
  const w = world();
  const { note } = w.h.noteWrite({ text: "Ann's words", by: ANN });
  const gone = w.h.noteWrite({ text: "to be deleted", by: ANN }).note;
  assert.equal(w.h.noteDelete({ note: gone, by: ANN }).ok, true);
  const expect = (args, code) => {
    const before = everything(w);
    const x = w.h.noteRevise(args);
    refusedAs(x, code);
    assert.equal(everything(w), before, "nothing was written");
    return x;
  };
  for (const by of [null, "", "class:ai", "class:daemon", "token:abc"]) expect({ note, text: "", by }, "MACHINE_CANNOT_NOTE");
  const absent = expect({ note: 99999, text: "", by: ANN }, "NO_SUCH_NOTE");
  for (const n of [null, "x", -1, 0, 1.5]) expect({ note: n, text: "", by: ANN }, "NO_SUCH_NOTE");
  same(expect({ note: gone, text: "", by: ANN }, "NO_SUCH_NOTE"), absent);
  same(expect({ note, text: "", by: OUTSIDER }, "NO_SUCH_NOTE"), absent);
  same(expect({ note, text: "", by: BOSS }, "NO_SUCH_NOTE"), absent);
  /* the founder's stamp names no member who keeps notes: refused at the first step, reaching nothing */
  expect({ note, text: "taken over", by: "admin" }, "MACHINE_CANNOT_NOTE");
  for (const text of [undefined, null, "", "  \n", 7, { t: "x" }]) expect({ note, text, by: ANN }, "NOTE_NO_TEXT");
  const big = expect({ note, text: "é".repeat(NOTE_MAX_BYTES / 2) + "x", by: ANN }, "NOTE_TOO_LONG");
  assert.deepEqual([big.max_bytes, big.bytes], [131072, 131073]);
  assert.deepEqual(w.h.notesOf({ viewer: ANN }).notes.map((n) => [n.text, n.revised]), [["Ann's words", null]]);
});

test("R12 notesOf answers a note with its current text only and revised its last revision's instant (null before one); a deleted note is in no answer", () => {
  const w = world();
  const a = w.h.noteWrite({ text: "one", by: ANN }).note;
  const b = w.h.noteWrite({ text: "two", by: ANN }).note;
  const c = w.h.noteWrite({ text: "three", by: ANN }).note;
  w.h.noteRevise({ note: a, text: "one, again", by: ANN });
  const last = w.h.noteRevise({ note: a, text: "one, a third time", by: ANN });
  w.h.noteDelete({ note: b, by: ANN });
  const page = w.h.notesOf({ viewer: ANN });
  assert.deepEqual(page.notes.map((n) => [n.note, n.text, n.revised]), [[c, "three", null], [a, "one, a third time", last.at]]);
  assert.ok(!JSON.stringify(page).includes("one, again"));
  /* pages joined skip the deleted note and count it nowhere */
  const p1 = w.h.notesOf({ viewer: ANN, limit: 1 });
  const p2 = w.h.notesOf({ viewer: ANN, limit: 1, after: p1.next.after });
  assert.deepEqual([p1.notes[0].note, p2.notes[0].note, p2.truncated, p2.next], [c, a, false, null]);
  /* still the author's alone after a revision */
  for (const viewer of [OUTSIDER, BOSS, "admin", "class:ai", null]) assert.deepEqual(w.h.notesOf({ viewer }).notes, [], String(viewer));
});

test("R13 noteDelete deletes one note `by` kept, for good, answering {ok, note, deleted: true}; its text and turns go with it; what a turn made stays its owner's, unchanged; refusals in order, each writing nothing: MACHINE_CANNOT_NOTE, NO_SUCH_NOTE (absent, already deleted or another's, an administrator's included, one answer)", () => {
  const w = world();
  w.bundle(INQ);
  const words = "E1 and E2 seem to act together.";
  const { note } = w.h.noteWrite({ text: words, by: ANN });
  const keep = w.h.noteWrite({ text: "another of Ann's", by: ANN }).note;
  const theirs = w.h.noteWrite({ text: "the outsider's", by: OUTSIDER }).note;
  /* a turn never deletes the note: after it the note is still revised and deleted */
  const h = w.h.noteTurn({ note, into: "hunch", by: ANN, hunch: { inquiry: INQ, kind: "relation", about: { from: E1, to: E2 } } });
  assert.equal(h.ok, true, JSON.stringify(h));
  w.h.noteTurn({ note, into: "observation", by: ANN, made: "INFO-2026-0001-doc" });
  assert.equal(w.h.noteRevise({ note, text: words, by: ANN }).ok, true, "a turned note may be revised");
  const hypothesis = JSON.stringify(w.h.read({ hypothesisId: h.id, viewer: ANN }));
  const expect = (args, code) => {
    const before = everything(w);
    const x = w.h.noteDelete(args);
    refusedAs(x, code);
    assert.equal(everything(w), before, "nothing was written");
    return x;
  };
  for (const by of [null, "", "class:ai", "class:daemon", "token:abc"]) expect({ note, by }, "MACHINE_CANNOT_NOTE");
  const absent = expect({ note: 99999, by: ANN }, "NO_SUCH_NOTE");
  for (const n of [null, "x", -1, 0, 1.5]) expect({ note: n, by: ANN }, "NO_SUCH_NOTE");
  /* another's: a number of Ann's that the asker does not hold (since T36 each member numbers their own notes, N727) */
  assert.ok(keep !== theirs);
  same(expect({ note: keep, by: OUTSIDER }, "NO_SUCH_NOTE"), absent);
  same(expect({ note, by: BOSS }, "NO_SUCH_NOTE"), absent);
  same(expect({ note: keep, by: BOSS }, "NO_SUCH_NOTE"), absent);
  expect({ note, by: "admin" }, "MACHINE_CANNOT_NOTE");
  const d = w.h.noteDelete({ note, by: ANN });
  assert.deepEqual(d, { ok: true, note, deleted: true });
  assert.deepEqual(notesRows(w).map((r) => [r.member, r.note_id]).sort(), [["ann", keep], ["outsider", theirs]].sort(),
    "only that note's row went, whatever number another member's note carries");
  assert.deepEqual(turnRows(w), [], "its turns went with it");
  assert.equal(JSON.stringify(w.h.read({ hypothesisId: h.id, viewer: ANN })), hypothesis, "the hypothesis the turn made is unchanged");
  /* already deleted: one answer with the absent; and no act reaches it again */
  same(expect({ note, by: ANN }, "NO_SUCH_NOTE"), absent);
  refusedAs(w.h.noteRevise({ note, text: "back?", by: ANN }), "NO_SUCH_NOTE");
  refusedAs(w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0002-q" }), "NO_SUCH_NOTE");
  assert.deepEqual(w.h.notesOf({ viewer: OUTSIDER }).notes.map((n) => n.text), ["the outsider's"], "another member's notes untouched");
});

test("R14 no history and no marker: after a revision no row of the store holds the earlier text; after a deletion none holds the note, its text, its turns or a sign it existed; a later note never takes a deleted note's number", () => {
  const w = world();
  w.bundle(INQ);
  /* the number's high-water mark (R14's own means of never reusing a number): the shared sequence's before T36, the
     member's own mark since (N727), which holds only that member's last number */
  const unmarked = (t) => t.replace(/^sqlite_sequence:.*$/m, "").replace(/^member_note_numbers:.*$/m, "");
  const before = unmarked(everything(w));
  const { note } = w.h.noteWrite({ text: "a secret first draft about ENT-2026-0001", by: ANN });
  w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0077-q" });
  w.h.noteRevise({ note, text: "a second, kinder draft", by: ANN });
  assert.ok(!everything(w).includes("secret first draft"), "no earlier text after a revision");
  w.h.noteDelete({ note, by: ANN });
  const after = everything(w);
  for (const trace of ["kinder draft", "INQ-2026-0077-q"]) assert.ok(!after.includes(trace), trace);
  /* every table but the number's high-water mark (R14's own means of never reusing a number) is as before the note */
  assert.equal(unmarked(after), before, "nothing marks that it existed");
  assert.deepEqual(w.rows(`SELECT * FROM member_note_numbers`), [{ member: "ann", last: note }], "the mark: the member's last number, nothing else");
  /* the deleted number is never answered again */
  const next = [];
  for (let i = 0; i < 3; i++) next.push(w.h.noteWrite({ text: `n${i}`, by: ANN }).note);
  assert.ok(next.every((n) => n > note), JSON.stringify([note, next]));
  /* the same after a boot over the same storage (a new instance's migrate) */
  const last = Math.max(...next);
  w.h.noteDelete({ note: last, by: ANN });
  w.h.migrate();
  assert.ok(w.h.noteWrite({ text: "after boot", by: ANN }).note > last);
});

test("R15 a revision overwrites the note's row and a deletion removes the row and its turns in the one act; the notes table keeps sight owner, export never; an older copy's notes table gains the revised column at boot, its notes kept", () => {
  const w = world();
  const mine = w.record.declaredTables().filter((d) => d.module === "hypotheses" && d.name === "member_notes");
  assert.deepEqual(mine.map((d) => [d.sight, d.export, d.purge, d.version_chain]), [["owner", "never", "clear", false]]);
  const { note } = w.h.noteWrite({ text: "v1", by: ANN });
  w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0002-q" });
  w.h.noteRevise({ note, text: "v2", by: ANN });
  assert.deepEqual(notesRows(w).map((r) => [r.note_id, r.text]), [[note, "v2"]]);
  /* one act: a deletion that fails part-way leaves the note and its turns whole */
  const st = w.st;
  const real = st.sql.exec;
  st.sql.exec = (q, ...a) => { if (/^DELETE FROM member_notes/.test(q.trim())) throw new Error("storage failed"); return real.call(st.sql, q, ...a); };
  assert.throws(() => w.h.noteDelete({ note, by: ANN }));
  st.sql.exec = real;
  assert.equal(notesRows(w).length, 1);
  assert.equal(turnRows(w).length, 1, "the turns were not removed without the note");
  assert.equal(w.h.noteDelete({ note, by: ANN }).ok, true);
  assert.deepEqual([notesRows(w).length, turnRows(w).length], [0, 0]);

  /* an older copy: the notes table as T34 made it, without `revised` */
  const old = world();
  old.st.db.exec(`DROP TABLE member_notes`);
  old.st.db.exec(T34_MEMBER_NOTES);
  old.st.db.exec(`INSERT INTO member_notes (member, text, at) VALUES ('ann', 'kept in T34', '2026-10-01T00:00:00.000Z')`);
  const host = { storage: old.st };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  const again = hypothesesOf(host, { record, membership: old.membership, promotion: old.promotion, registry: old.registry });
  assert.equal(again, old.h, "the one instance per host");
  again.migrate();
  assert.deepEqual(old.h.notesOf({ viewer: ANN }).notes.map((n) => [n.text, n.revised]), [["kept in T34", null]]);
  const id = old.h.notesOf({ viewer: ANN }).notes[0].note;
  assert.equal(old.h.noteRevise({ note: id, text: "revised in T35", by: ANN }).ok, true);
  assert.equal(old.h.notesOf({ viewer: ANN }).notes[0].text, "revised in T35");
});

test("R7 the notes' T35 ops: noterevise and notedelete take the act's member from the body's stamp", () => {
  const w = world();
  const { note } = w.h.noteWrite({ text: "via the op", by: ANN });
  const rev = hypothesesOps(w.h, url("noterevise"), { note: String(note), text: "revised via the op", by: ANN }).noterevise();
  assert.deepEqual([rev.ok, rev.note], [true, note]);
  assert.equal(w.h.notesOf({ viewer: ANN }).notes[0].text, "revised via the op");
  assert.equal(hypothesesOps(w.h, url("noterevise"), { note, text: "z", by: OUTSIDER }).noterevise().reason, "NO_SUCH_NOTE", "the stamp in the body is the member");
  assert.equal(hypothesesOps(w.h, url("notedelete"), { note, by: OUTSIDER }).notedelete().reason, "NO_SUCH_NOTE");
  assert.equal(hypothesesOps(w.h, url("noterevise"), null).noterevise().reason, "MACHINE_CANNOT_NOTE", "an empty body is refused, never thrown");
  assert.equal(hypothesesOps(w.h, url("notedelete"), null).notedelete().reason, "MACHINE_CANNOT_NOTE");
  assert.deepEqual(hypothesesOps(w.h, url("notedelete"), { note, by: ANN }).notedelete(), { ok: true, note, deleted: true });
  assert.deepEqual(w.h.notesOf({ viewer: ANN }).notes, []);
});

test("R11 R13 the rows noteRevise and noteDelete answer are the notes' own C-134.13–C-134.16, their where naming the new sites; no new code", () => {
  assert.deepEqual(Object.keys(HYPOTHESES_CHECKS).filter((k) => /NOTE/.test(k)).sort(),
    ["MACHINE_CANNOT_NOTE", "NOTE_NO_TEXT", "NOTE_TOO_LONG", "NOTE_TOO_LONG_FOR_HUNCH", "NOTE_TURN_NOT_MADE", "NOTE_TURN_UNKNOWN", "NO_SUCH_NOTE"]);
  const where = (k) => row(k).where;
  for (const k of ["MACHINE_CANNOT_NOTE", "NO_SUCH_NOTE"]) assert.ok(where(k).includes("noteRevise") && where(k).includes("noteDelete"), k);
  for (const k of ["NOTE_NO_TEXT", "NOTE_TOO_LONG"]) assert.ok(where(k).includes("noteRevise"), k);
  assert.deepEqual(["MACHINE_CANNOT_NOTE", "NOTE_NO_TEXT", "NOTE_TOO_LONG", "NO_SUCH_NOTE"].map((k) => row(k).check), ["C-134.13", "C-134.14", "C-134.15", "C-134.16"]);
});
