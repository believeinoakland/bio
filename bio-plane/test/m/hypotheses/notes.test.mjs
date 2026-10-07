/* hypotheses: a member's own notes (R11–R15; DEC-136 (2), (3)) and their ops (R7), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, BOSS, INQ, E1, E2 } from "./fixture.mjs";
import { hypothesesOps, HYPOTHESES_CHECKS, NOTES_TABLES, NOTE_MAX_BYTES } from "../../../src/hypotheses/index.mjs";
import { ID_TABLE, isHypothesisId } from "../../../src/record-grammar/index.mjs";
import { isRecordId, defaultRegistry } from "../../../src/connection-grammar/index.mjs";
import { Membership } from "../../../src/membership/index.mjs";

const COURT = "Your group's Civicsmith keeps this from the public and the people the group looks into. A court order your group can't defeat could still require it to be shown. Write accordingly.";
const url = (op, q = {}) => { const u = new URL(`https://plane.example/?op=${op}`); for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v); return u; };
const count = (w) => w.rows(`SELECT COUNT(*) AS n FROM member_notes`)[0].n;
const row = (code) => HYPOTHESES_CHECKS[code];

test("R11 noteWrite keeps one note in the member's words, answering {ok, note, at}; refusals in order, each writing nothing: MACHINE_CANNOT_NOTE, NOTE_NO_TEXT, NOTE_TOO_LONG (refused, never cut)", () => {
  const w = world();
  const words = "  The clerk said the minutes were \"late again\".\nAsk about March.  ";
  const r = w.h.noteWrite({ text: words, by: ANN });
  assert.deepEqual(Object.keys(r).sort(), ["at", "note", "ok"]);
  assert.equal(r.ok, true);
  assert.ok(Number.isSafeInteger(r.note) && r.note > 0);
  assert.equal(w.h.notesOf({ viewer: ANN }).notes[0].text, words, "kept exactly as written");
  const expect = (args, code) => {
    const before = count(w);
    const x = w.h.noteWrite(args);
    assert.deepEqual([x.ok, x.reason, x.code, x.check, x.translation], [false, code, code, row(code).check, row(code).translation], JSON.stringify(args).slice(0, 80));
    assert.equal(count(w), before, "nothing was written");
    return x;
  };
  /* in order: the machine first, whatever the text */
  for (const by of [null, "", "class:ai", "class:daemon", "token:abc", "session"]) expect({ text: "", by }, "MACHINE_CANNOT_NOTE");
  for (const text of [undefined, null, "", "   \n\t", 7, { t: "x" }]) expect({ text, by: ANN }, "NOTE_NO_TEXT");
  const big = expect({ text: "é".repeat(NOTE_MAX_BYTES / 2) + "x", by: ANN }, "NOTE_TOO_LONG");
  assert.deepEqual([big.max_bytes, big.bytes], [131072, 131073]);
  /* the bound is in bytes, and exactly the bound is kept whole */
  const edge = "é".repeat(NOTE_MAX_BYTES / 2);
  const ok = w.h.noteWrite({ text: edge, by: ANN });
  assert.equal(ok.ok, true);
  assert.equal(w.h.notesOf({ viewer: ANN }).notes[0].text, edge, "never cut");
  assert.deepEqual([row("MACHINE_CANNOT_NOTE").check, row("NOTE_NO_TEXT").check, row("NOTE_TOO_LONG").check], ["C-134.13", "C-134.14", "C-134.15"]);
});

test("R11 while the group's court notice is tell, the first note a member keeps answers courtStatement, exactly membership R108's sentence, and no later note of that member answers it; otherwise the key is absent", () => {
  const w = world();
  const keys = (r) => "courtStatement" in r;
  /* nothing chosen: null reads as not telling */
  assert.equal(w.membership.courtNotice().choice, null);
  assert.equal(keys(w.h.noteWrite({ text: "a", by: ANN })), false);
  assert.equal(w.membership.courtNoticeSet({ choice: "dont", by: "boss" }).ok, true);
  assert.equal(keys(w.h.noteWrite({ text: "b", by: ANN })), false);
  assert.equal(w.membership.courtNoticeSet({ choice: "tell", by: "boss" }).ok, true);
  const first = w.h.noteWrite({ text: "c", by: ANN });
  assert.equal(first.courtStatement, COURT);
  assert.equal(first.courtStatement, Membership.COURT_STATEMENT);
  assert.equal(keys(w.h.noteWrite({ text: "d", by: ANN })), false, "once, at the member's first note while it is tell");
  /* each member is told once */
  assert.equal(w.h.noteWrite({ text: "e", by: OUTSIDER }).courtStatement, COURT);
  assert.equal(keys(w.h.noteWrite({ text: "f", by: OUTSIDER })), false);
  /* a refused note is not the first one kept */
  assert.equal(w.h.noteWrite({ text: "", by: BOSS }).reason, "NOTE_NO_TEXT");
  assert.equal(w.h.noteWrite({ text: "g", by: BOSS }).courtStatement, COURT);
  /* switched off and on again: no member already told is told again */
  w.membership.courtNoticeSet({ choice: "dont", by: "boss" });
  w.membership.courtNoticeSet({ choice: "tell", by: "boss" });
  assert.equal(keys(w.h.noteWrite({ text: "h", by: ANN })), false);
});

test("R12 notesOf answers the viewer's own notes, newest first, each {note, text, at, revised, turned}, at most limit (200 by default, clamped 1…1000) with truncated and next; any other viewer, an administrator, the founder, a machine and no viewer, reads none, exactly as a member with no notes", () => {
  const w = world();
  const ids = [];
  for (let i = 0; i < 205; i++) ids.push(w.h.noteWrite({ text: `ann ${i}`, by: ANN }).note);
  w.h.noteWrite({ text: "the outsider's own", by: OUTSIDER });
  const first = w.h.notesOf({ viewer: ANN });
  assert.equal(first.limit, 200);
  assert.equal(first.notes.length, 200);
  assert.equal(first.truncated, true);
  assert.deepEqual(first.notes.slice(0, 2).map((n) => n.text), ["ann 204", "ann 203"], "newest first");
  for (const n of first.notes) {
    assert.deepEqual(Object.keys(n).sort(), ["at", "note", "revised", "text", "turned"]);
    assert.deepEqual([n.turned, n.revised], [[], null]);
  }
  const rest = w.h.notesOf({ viewer: ANN, after: first.next.after });
  assert.deepEqual([rest.notes.length, rest.truncated, rest.next], [5, false, null]);
  assert.deepEqual([...first.notes, ...rest.notes].map((n) => n.note), [...ids].reverse(), "the pages joined are every note, once");
  /* the limit is clamped */
  assert.equal(w.h.notesOf({ viewer: ANN, limit: 0 }).notes.length, 1);
  assert.equal(w.h.notesOf({ viewer: ANN, limit: -5 }).limit, 1);
  assert.equal(w.h.notesOf({ viewer: ANN, limit: 5000 }).limit, 1000);
  assert.equal(w.h.notesOf({ viewer: ANN, limit: 3 }).notes.length, 3);
  assert.equal(w.h.notesOf({ viewer: ANN, limit: "abc" }).limit, 200);
  /* only the author: everyone else reads exactly as a member with no notes */
  const empty = world().h.notesOf({ viewer: ANN });
  assert.deepEqual(empty, { ok: true, notes: [], limit: 200, truncated: false, next: null });
  for (const viewer of [BOSS, "admin", "member:admin", "class:ai", "class:daemon", "token:x", null, undefined, "", "member:nobody"])
    assert.deepEqual(w.h.notesOf({ viewer }), empty, String(viewer));
  assert.deepEqual(w.h.notesOf({ viewer: OUTSIDER }).notes.map((n) => n.text), ["the outsider's own"]);
  /* nothing names how many another member keeps: the outsider's page is the same whatever Ann keeps */
  const fresh = world();
  fresh.h.noteWrite({ text: "the outsider's own", by: OUTSIDER });
  const strip = (r) => ({ ...r, notes: r.notes.map((n) => ({ text: n.text, revised: n.revised, turned: n.turned })) });
  assert.deepEqual(strip(w.h.notesOf({ viewer: OUTSIDER })), strip(fresh.h.notesOf({ viewer: OUTSIDER })));
});

test("R13 noteTurn records a turn into a hunch (held by R1's hold with the note's text, R1's refusals unchanged and nothing recorded when hold refuses), an observation or a question (named in made, a record id); refusals in order, each writing nothing, NOTE_TOO_LONG_FOR_HUNCH for a note past R1's bound, never cut; the note itself is unchanged and stays its author's", () => {
  const w = world();
  w.bundle(INQ);
  const words = "E1 and E2 seem to act together.";
  const { note } = w.h.noteWrite({ text: words, by: ANN });
  const turns = () => w.rows(`SELECT COUNT(*) AS n FROM member_note_turns`)[0].n;
  const expect = (args, code) => {
    const before = [turns(), w.rows(`SELECT COUNT(*) AS n FROM hypotheses`)[0].n];
    const r = w.h.noteTurn(args);
    assert.deepEqual([r.ok, r.reason, r.check], [false, code, row(code)?.check ?? r.check], JSON.stringify(args).slice(0, 120));
    assert.deepEqual([turns(), w.rows(`SELECT COUNT(*) AS n FROM hypotheses`)[0].n], before, "nothing was written");
    return r;
  };
  /* in order */
  for (const by of [null, "", "class:ai"]) expect({ note: 99999, into: "nonsense", by }, "MACHINE_CANNOT_NOTE");
  for (const n of [null, 99999, "x", -1, 0, 1.5]) expect({ note: n, into: "nonsense", by: ANN }, "NO_SUCH_NOTE");
  const other = expect({ note, into: "nonsense", by: OUTSIDER }, "NO_SUCH_NOTE");
  const absent = expect({ note: 99999, into: "nonsense", by: OUTSIDER }, "NO_SUCH_NOTE");
  assert.deepEqual({ ...other, note: null }, { ...absent, note: null }, "another's note answers as an absent one");
  expect({ note, into: "nonsense", by: BOSS }, "NO_SUCH_NOTE");
  const unk = expect({ note, into: "theory", by: ANN }, "NOTE_TURN_UNKNOWN");
  assert.deepEqual(unk.turns, ["observation", "hunch", "question"]);
  /* a hunch: hold's refusals, answered unchanged */
  assert.deepEqual(expect({ note, into: "hunch", by: ANN, hunch: { inquiry: "INQ-2026-0404-x", kind: "relation", about: { from: E1, to: E2 } } }, "NO_SUCH_BUNDLE"),
    w.h.hold({ inquiry: "INQ-2026-0404-x", kind: "relation", about: { from: E1, to: E2 }, statement: words, by: ANN }));
  expect({ note, into: "hunch", by: ANN }, "NO_SUCH_BUNDLE");
  expect({ note, into: "hunch", by: ANN, hunch: { inquiry: INQ, kind: "suspicion", about: { from: E1, to: E2 } } }, "UNKNOWN_HYPOTHESIS_KIND");
  expect({ note, into: "hunch", by: ANN, hunch: { inquiry: INQ, kind: "relation", about: [E1] } }, "BAD_ABOUT");
  /* observation and question: made must be a record id */
  for (const made of [undefined, null, "", "not an id", 7, "HYP"]) expect({ note, into: "observation", by: ANN, made }, "NOTE_TURN_NOT_MADE");
  assert.equal(row("NOTE_TURN_NOT_MADE").check, "C-134.18");
  /* K1807: a note past R1's statement bound is refused for a hunch, naming the bound, never cut; the same note may
     still become an observation or a question, and one exactly at the bound is held whole */
  const long = w.h.noteWrite({ text: "x".repeat(4001), by: ANN }).note;
  const hk = { inquiry: INQ, kind: "relation", about: { from: E1, to: E2 } };
  const tooLong = expect({ note: long, into: "hunch", by: ANN, hunch: hk }, "NOTE_TOO_LONG_FOR_HUNCH");
  assert.deepEqual([tooLong.check, tooLong.max_characters, tooLong.characters], ["C-134.19", 4000, 4001]);
  assert.ok(tooLong.detail.includes("4000"));
  assert.deepEqual(w.h.notesOf({ viewer: ANN }).notes.find((x) => x.note === long).turned, [], "nothing recorded on the note");
  assert.equal(w.h.noteTurn({ note: long, into: "question", by: ANN, made: "INQ-2026-0005-q" }).ok, true);
  const edge = w.h.noteWrite({ text: `  ${"y".repeat(4000)}  `, by: ANN }).note;
  const whole = w.h.noteTurn({ note: edge, into: "hunch", by: ANN, hunch: hk });
  assert.equal(whole.ok, true, JSON.stringify(whole).slice(0, 200));
  assert.equal(w.h.read({ hypothesisId: whole.id, viewer: ANN }).hypothesis.statement, "y".repeat(4000), "held whole");
  /* the turns */
  const h = w.h.noteTurn({ note, into: "hunch", by: ANN, hunch: { inquiry: INQ, kind: "relation", about: { from: E1, to: E2 } } });
  assert.equal(h.ok, true, JSON.stringify(h));
  assert.ok(isHypothesisId(h.id));
  const held = w.h.read({ hypothesisId: h.id, viewer: ANN }).hypothesis;
  assert.deepEqual([held.statement, held.held_by, held.inquiry, held.label], [words, ANN, INQ, "hypothesis"], "an ordinary hypothesis of its owner");
  const o = w.h.noteTurn({ note, into: "observation", by: ANN, made: " INFO-2026-0001-doc " });
  const q = w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0002-why" });
  assert.deepEqual([o.ok, o.id, q.ok, q.id], [true, "INFO-2026-0001-doc", true, "INQ-2026-0002-why"]);
  const n = w.h.notesOf({ viewer: ANN }).notes.find((x) => x.note === note);
  assert.equal(n.text, words, "the note itself is unchanged");
  assert.deepEqual(n.turned.map((t) => [t.into, t.id]), [["hunch", h.id], ["observation", "INFO-2026-0001-doc"], ["question", "INQ-2026-0002-why"]]);
  assert.ok(n.turned.every((t, i, a) => typeof t.at === "string" && (i === 0 || a[i - 1].at <= t.at)));
  /* never deleted by the turn, and still its author's alone */
  assert.equal(count(w), 3, "every note kept, none deleted by a turn");
  assert.deepEqual(w.h.notesOf({ viewer: OUTSIDER }).notes, []);
  /* the hunch carries nothing of the note but the words: its history names no note */
  assert.ok(!JSON.stringify(held).includes(`"note"`));
});

test("R14 notes are never cited, published, counted or shared: no read but notesOf answers one or a count; no connection owner, registration or figure is made from one; no leg, reference or citation can name one by its key", () => {
  const w = world();
  w.bundle(INQ);
  const { note } = w.h.noteWrite({ text: "a private thought about ENT-2026-0001", by: ANN });
  /* its key is no record id: record-grammar holds no prefix for it, and no id test reads it */
  assert.deepEqual(ID_TABLE.filter((r) => r.owner === "hypotheses").map((r) => r.prefix), ["HYP"], "this module mints no prefix but HYP-");
  for (const k of [note, String(note)]) {
    assert.equal(isRecordId(String(k)), false);
    assert.equal(isHypothesisId(k), false);
  }
  /* no other read of this module answers it */
  const reads = [w.h.hypothesesOf({ inquiry: INQ, viewer: ANN }), w.h.read({ hypothesisId: `HYP-2026-${note}`, viewer: ANN }),
    w.h.neighbours({ node: "ENT-2026-0001", viewer: ANN, scope: INQ }), w.h.legRefusals({ legs: [{ target: note }], viewer: ANN })];
  for (const r of reads) assert.ok(!JSON.stringify(r).includes("private thought"), JSON.stringify(r).slice(0, 200));
  /* nothing registered from notes: the connection owners are the hunch alone, in the default registry and the test's */
  for (const reg of [w.registry, defaultRegistry]) {
    const mine = reg.owners().filter((o) => o.owner === "hypotheses");
    assert.deepEqual(mine.flatMap((o) => o.kinds.map((k) => k.kind)), ["hunch"]);
  }
  /* no figure: record-core's counts, through every registration, name no note table */
  const counts = JSON.stringify(w.record.counts ? w.record.counts(null) : {});
  assert.ok(!/note/i.test(counts), counts);
  /* no other module's table is written by keeping or turning a note */
  const before = w.others();
  w.h.noteWrite({ text: "another", by: ANN });
  w.h.noteTurn({ note, into: "question", by: ANN, made: "INQ-2026-0003-q" });
  assert.deepEqual(w.others(), before);
});

test("R15 the notes tables are declared with record-core: sight owner, export never, purge clear, version_chain false; held in the group's copy, cleared by the whole-store purge and by no bundle's purge", () => {
  const w = world();
  w.bundle(INQ);
  const mine = w.record.declaredTables().filter((d) => d.module === "hypotheses" && NOTES_TABLES.includes(d.name));
  assert.deepEqual(mine.map((d) => d.name), ["member_notes", "member_note_turns", "member_note_told"]);
  for (const d of mine)
    assert.deepEqual([d.sight, d.export, d.purge, d.version_chain, d.expunge, d.derive], ["owner", "never", "clear", false, "none", "stored"], d.name);
  w.h.noteWrite({ text: "kept", by: ANN });
  assert.equal(w.record.purge({ bundleId: INQ }).removed.member_notes, 0, "a bundle's purge leaves the notes");
  assert.equal(count(w), 1);
  const all = w.record.purge({});
  assert.equal(all.removed.member_notes, 1);
  assert.equal(count(w), 0);
  /* no place is named in a note row's words */
  const PLACES = /oakland|california|alameda|berkeley|san francisco|los angeles|county|city of/i;
  for (const code of ["MACHINE_CANNOT_NOTE", "NOTE_NO_TEXT", "NOTE_TOO_LONG", "NO_SUCH_NOTE", "NOTE_TURN_UNKNOWN", "NOTE_TURN_NOT_MADE"])
    assert.ok(!PLACES.test(row(code).translation), code);
});

test("R7 the notes' ops: notewrite and noteturn take the act's member from the body's stamp, notes reads the viewer from the query, never the body", () => {
  const w = world();
  const wrote = hypothesesOps(w.h, url("notewrite"), { text: "via the op", by: ANN }).notewrite();
  assert.equal(wrote.ok, true);
  const mine = hypothesesOps(w.h, url("notes", { viewer: ANN, limit: "5" }), {}).notes();
  assert.deepEqual([mine.notes.map((n) => n.text), mine.limit], [["via the op"], 5]);
  /* a body's viewer is ignored */
  assert.deepEqual(hypothesesOps(w.h, url("notes", { viewer: OUTSIDER }), { viewer: ANN }).notes().notes, []);
  assert.deepEqual(hypothesesOps(w.h, url("notes"), { viewer: ANN }).notes().notes, []);
  const turned = hypothesesOps(w.h, url("noteturn"), { note: wrote.note, into: "question", made: "INQ-2026-0002-q", by: ANN }).noteturn();
  assert.equal(turned.ok, true);
  /* the note's number as the query or a form sends it */
  assert.equal(hypothesesOps(w.h, url("noteturn"), { note: String(wrote.note), into: "question", made: "INQ-2026-0003-q", by: ANN }).noteturn().ok, true);
  const after = hypothesesOps(w.h, url("notes", { viewer: ANN, after: String(wrote.note + 1) }), {}).notes();
  assert.deepEqual(after.notes[0].turned.map((t) => t.id), ["INQ-2026-0002-q", "INQ-2026-0003-q"]);
  assert.equal(hypothesesOps(w.h, url("notewrite"), null).notewrite().reason, "MACHINE_CANNOT_NOTE", "an empty body is refused, never thrown");
  assert.equal(hypothesesOps(w.h, url("noteturn"), null).noteturn().reason, "MACHINE_CANNOT_NOTE");
});
