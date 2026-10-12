/* Settings › Your notes at the module's interface (R6, R7, R8). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { MEMBER, READER, NOTES, notesTable, env } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();

test("R6 reads the member's own notes; states who can see them (protected words); each note's acts in its panel", async () => {
  const a = await open("notes", { me: MEMBER, table: notesTable(MEMBER) });
  assert.deepEqual(a.p.requests.map((r) => r.op).slice(0, 2), ["notes", "courtnotice"]);
  has(a, "screen.notes.private");
  assert.equal(said("screen.notes.private"), "Only you can see these in your group.");
  for (const r of ["screen.notes.private", "screen.notes.protects", "screen.notes.court", "screen.notes.draft.label"])
    assert.equal(a.s.words.find((w) => Array.isArray(w) && w[0] === r)[2], true, `${r} is protected`);
  for (const n of NOTES) {
    assert.ok(textOf(rowOf(a.tree, String(n.note))).includes(n.text));
    const panel = panelOf(a.tree, String(n.note));
    assert.deepEqual([...new Set(acts(panel).map((b) => b.attrs["data-act"]))].sort(), ["notedelete", "noterevise", "noteturn"]);
  }
  has(a, "screen.notes.turned.observation", { id: "OBS-0001" });
  assert.deepEqual(ops(a), ["notedelete", "noterevise", "noteturn", "notewrite"], "no writing help while the assistant is not reachable");
  const empty = await open("notes", { me: MEMBER, table: notesTable(MEMBER, { notes: env({ ok: true, notes: [], limit: 200, truncated: false, next: null }) }) });
  has(empty, "screen.notes.empty");
  // a member without `contribute` is offered no act on notes (op-declarations NEEDS)
  const r = await open("notes", { me: READER, table: notesTable(READER) });
  assert.deepEqual(ops(r), []);
});

test("R6 notewrite, noterevise and notedelete send their owner's arguments (hypotheses R11–R13)", async () => {
  const a = await open("notes", { me: MEMBER, table: notesTable(MEMBER) });
  assert.deepEqual((await a.press("notewrite", { values: { "mn-new": " Ask the clerk. " } })).sent[0].body, { text: "Ask the clerk." });
  assert.equal(a.p.requests.at(-1).op, "notes", "R8: the notes read again");
  assert.deepEqual((await a.press("notewrite", { values: { "mn-new": "" } })).sent, []);
  assert.deepEqual((await a.press("noterevise", { data: { note: "2" }, values: { "mn-r2": "Revised." } })).sent[0].body, { note: 2, text: "Revised." });
  assert.deepEqual((await a.press("notedelete", { data: { note: "1" } })).sent[0].body, { note: 1 });
  const rev = acts(a.tree).find((b) => b.attrs["data-act"] === "noterevise" && b.attrs["data-note"] === "2");
  assert.ok(ancestor(rev, (e) => /cs-panel/.test(e.attrs.class || "")));
});

test("R6 noteturn, as the owner's shape names: into a hunch {inquiry, kind, about}, or into an observation or question already made", async () => {
  const a = await open("notes", { me: MEMBER, table: notesTable(MEMBER) });
  const body = async (values) => { const r = await a.press("noteturn", { data: { note: "2" }, values }); return r.sent.length ? r.sent[0].body : null; };
  assert.deepEqual(await body({ "mn-observation2": true, "mn-made2": "OBS-0009" }), { note: 2, into: "observation", made: "OBS-0009" });
  assert.deepEqual(await body({ "mn-question2": true, "mn-made2": "Q-0003" }), { note: 2, into: "question", made: "Q-0003" });
  assert.deepEqual(await body({ "mn-hunch2": true, "mn-inq2": "INQ-1", "mn-kind2": "cause", "mn-about2": "EV-1 EV-2" }), { note: 2, into: "hunch", hunch: { inquiry: "INQ-1", kind: "cause", about: { from: "EV-1", to: "EV-2" } } });
  assert.deepEqual(await body({ "mn-hunch2": true, "mn-inq2": "INQ-1", "mn-kind2": "flow", "mn-about2": "EV-1, EV-2, EV-3" }), { note: 2, into: "hunch", hunch: { inquiry: "INQ-1", kind: "flow", about: ["EV-1", "EV-2", "EV-3"] } });
  assert.equal(await body({ "mn-hunch2": true, "mn-inq2": "INQ-1", "mn-kind2": "relation", "mn-about2": "EV-1" }), null);
  assert.equal(a.refused.key, "screen.notes.turn.pair");
  assert.equal(await body({ "mn-observation2": true, "mn-made2": "" }), null);
  assert.equal(a.refused.key, "screen.notes.turn.nomade");
});

test("R6 writinghelp under the note's field only while the assistant is reachable; its draft in the field labelled \"Draft · the assistant's, asked by <handle>\", kept only by the member's own act", async () => {
  const a = await open("notes", { me: MEMBER, table: notesTable(MEMBER), reachable: true });
  const help = acts(a.tree).filter((b) => b.attrs["data-act"] === "writinghelp");
  assert.deepEqual(help.map((b) => b.attrs["data-field"]).sort(), ["new", "note:1", "note:2"], "one under each note's field");
  const r = await a.press("writinghelp", { data: { field: "new", id: "mn-new" }, values: { "mn-new": "potholes keep opening" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["writinghelp", { op: "notewrite", field: "text", told: "potholes keep opening" }]], "nothing is written: no notewrite");
  const field = all(a.tree, (e) => e.attrs.id === "mn-new")[0];
  assert.equal(textOf(field), "The potholes on Seminary Avenue between 59th and 62nd reopened three times since spring.");
  has(a, "screen.notes.draft.label", { handle: "dev" });
  assert.equal(said("screen.notes.draft.label", { handle: "dev" }), "Draft · the assistant's, asked by dev");
  lacks(a, "ai.label.untested");
  const kept = await a.press("notewrite", { values: { "mn-new": "The potholes on Seminary Avenue reopened." } });
  assert.deepEqual(kept.sent[0].body, { text: "The potholes on Seminary Avenue reopened." });
  lacks(a, "screen.notes.draft.label", { handle: "dev" });
  // on a note being revised, the help names noterevise
  const b = await open("notes", { me: MEMBER, table: notesTable(MEMBER), reachable: true });
  assert.deepEqual((await b.press("writinghelp", { data: { field: "note:2", id: "mn-r2" }, values: { "mn-r2": "ask foreman" } })).sent[0].body, { op: "noterevise", field: "text", told: "ask foreman" });
  assert.equal(textOf(all(b.tree, (e) => e.attrs.id === "mn-r2")[0]).startsWith("The potholes"), true);
  const off = await open("notes", { me: MEMBER, table: notesTable(MEMBER), reachable: false });
  assert.ok(!ops(off).includes("writinghelp"), "absent while not reachable");
});

test("R6 an AI output drawn carries the test-instance label `untested` when the answer marks it (screens-inquiry R7's words)", async () => {
  const a = await open("notes", { me: MEMBER, reachable: true, table: notesTable(MEMBER, { writinghelp: () => env({ ok: true, text: "A draft.", label: { kind: "machine", asked_by: "member:dev" }, withheld: [], untested: true }) }) });
  await a.press("writinghelp", { data: { field: "new", id: "mn-new" }, values: { "mn-new": "x" } });
  has(a, "ai.label.untested");
  assert.equal(said("ai.label.untested"), "Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters. Check what it says against the record.");
});

test("R7 the court sentence, in membership R108's words, once: the first time this member keeps a note while the group tells members", async () => {
  assert.equal(said("screen.notes.court"), "Your group's Civicsmith keeps this from the public and the people the group looks into. A court order your group can't defeat could still require it to be shown. Write accordingly.");
  let kept = [];
  const a = await open("notes", { me: MEMBER, table: notesTable(MEMBER, {
    notes: () => env({ ok: true, notes: kept, limit: 200, truncated: false, next: null }),
    notewrite: (q, b) => { kept = [{ note: kept.length + 1, text: b.text, at: "2026-10-12T00:00:00Z", revised: null, turned: [] }, ...kept]; return env({ ok: true, note: kept.length, at: "2026-10-12T00:00:00Z" }); },
  }) });
  lacks(a, "screen.notes.court");
  await a.press("notewrite", { values: { "mn-new": "my first note" } });
  has(a, "screen.notes.court");
  // shown once: not on the next note
  await a.press("notewrite", { values: { "mn-new": "my second" } });
  lacks(a, "screen.notes.court");
  // the owner's own signal is followed too (hypotheses R11's `courtStatement`)
  const s = await open("notes", { me: MEMBER, table: notesTable(MEMBER, { notewrite: () => env({ ok: true, note: 3, at: "2026-10-12T00:00:00Z", courtStatement: "…" }) }) });
  await s.press("notewrite", { values: { "mn-new": "x" } });
  has(s, "screen.notes.court");
  // controls: the group does not tell members, or the member already keeps notes
  for (const table of [notesTable(MEMBER, { notes: env({ ok: true, notes: [], limit: 200, truncated: false, next: null }), courtnotice: env({ choice: "dont", history: [] }) }), notesTable(MEMBER, { courtnotice: env({ choice: null, history: [] }) }), notesTable(MEMBER)]) {
    const o = await open("notes", { me: MEMBER, table });
    await o.press("notewrite", { values: { "mn-new": "x" } });
    lacks(o, "screen.notes.court");
  }
});
