/* hypotheses R23 where workerd runs it (T46-65; K2926, the 0.82.0 regression; K2950): a Durable Object of this module's
   own (`workerd-entry.mjs`), booting `hypotheses` over Durable Object SQLite under Miniflare as the plane boots it, over a
   store an earlier release left, renumbers its notes (R14) using only statements Durable Object SQLite authorizes.
   0.82.0's cut made the working map with `CREATE TEMP TABLE`, which workerd refuses `SQLITE_AUTH` (node:sqlite, the
   other suites' engine, allows it), so the plane's constructor threw on every 0.81.0 store holding notes. Here the
   module boots over such a store (the notes numbered from one sequence shared across members, with turns; the same
   before T35's `revised`; none), answers each member's notes renumbered, keeps going after a real restart over the same
   storage, and the runtime itself is shown to refuse a `TEMP` table. Nothing later in the order is booted (P4): the
   whole store at the plane's shape is the plane's own test (T46-62). */
import "../../stdio.mjs";
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY = fileURLToPath(new URL("./workerd-entry.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "hyp-r23-"));
const ANN = "member:ann", OUTSIDER = "member:outsider";
const options = () => ({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { SHARED: { className: "StoreShared", useSQLite: true }, T34: { className: "StoreT34", useSQLite: true },
                    FRESH: { className: "StoreFresh", useSQLite: true } },
  durableObjectsPersist: PERSIST,
});
let mf = new Miniflare(options());
after(async () => { await mf.dispose(); });

const stub = async (binding) => { const ns = await mf.getDurableObjectNamespace(binding); return ns.get(ns.idFromName("bio")); };
const store = async (binding) => (await (await stub(binding)).fetch("http://plane/r23")).json();
const act = async (binding, name, args) =>
  (await (await stub(binding)).fetch("http://plane/r23", { method: "POST", body: JSON.stringify({ act: name, args }) })).json();
const page = async (binding, viewer) => (await act(binding, "notesOf", { viewer })).notes
  .map((n) => [n.note, n.text, n.at, n.revised, n.turned.map((t) => [t.into, t.id])]);

/* What R14's renumbering owes the seeded store: each member's notes from 1 in their present order, text, at and revised
   kept, their turns following them (newest first, as R12 answers). */
const ANN_RENUMBERED = [
  [3, "ann third", "2026-10-05T00:00:00.000Z", "2026-10-07T00:00:00.000Z", [["observation", "INFO-2026-0002-doc"]]],
  [2, "ann second", "2026-10-03T00:00:00.000Z", null, [["question", "INQ-2026-0002-q"], ["hunch", "HYP-2026-0001"]]],
  [1, "ann first", "2026-10-01T00:00:00.000Z", null, []],
];
const OUTSIDER_RENUMBERED = [
  [2, "outsider second", "2026-10-04T00:00:00.000Z", null, [["question", "INQ-2026-0003-q"]]],
  [1, "outsider first", "2026-10-02T00:00:00.000Z", "2026-10-06T00:00:00.000Z", [["observation", "INFO-2026-0001-doc"]]],
];
const OBJECTS = ["member_note_numbers", "member_note_told", "member_note_turns", "member_note_turns_member", "member_notes"];

test("R23 the runtime the plane runs on refuses a TEMP table (SQLITE_AUTH), so a migration that made one could not boot there; the module's Durable Object boots over a fresh store", async () => {
  const s = await store("FRESH");
  assert.match(s.temp, /SQLITE_AUTH|not authorized/i, "workerd's authorizer, the one R23 names");
  assert.deepEqual(s.keyed, ["member", "note_id"]);
  assert.deepEqual(s.objects, OBJECTS);
  assert.deepEqual((await act("FRESH", "noteWrite", { text: "first", by: ANN })).note, 1);
});

test("R23 R14 on workerd, the module boots in its own Durable Object over a store numbered from the shared sequence, holding notes and turns, and renumbers it with no TEMP table: each member's notes from 1, turns following, the shared sequence's mark and the working map kept nowhere", async () => {
  const s = await store("SHARED");
  assert.deepEqual(s.keyed, ["member", "note_id"], "keyed by (member, note_id): the renumbering ran");
  assert.deepEqual(s.notes.map((n) => [n.member, n.note_id, n.text]),
    [["ann", 1, "ann first"], ["ann", 2, "ann second"], ["ann", 3, "ann third"], ["outsider", 1, "outsider first"], ["outsider", 2, "outsider second"]]);
  assert.deepEqual(s.turns, [
    { note_id: 2, member: "ann", turned_into: "question", made_id: "INQ-2026-0002-q" },
    { note_id: 1, member: "outsider", turned_into: "observation", made_id: "INFO-2026-0001-doc" },
    { note_id: 3, member: "ann", turned_into: "observation", made_id: "INFO-2026-0002-doc" },
    { note_id: 2, member: "ann", turned_into: "hunch", made_id: "HYP-2026-0001" },
    { note_id: 2, member: "outsider", turned_into: "question", made_id: "INQ-2026-0003-q" },
  ]);
  assert.deepEqual(s.numbers, [{ member: "ann", last: 3 }, { member: "outsider", last: 2 }]);
  assert.deepEqual(s.sequence, [], "the shared sequence's mark is gone");
  assert.deepEqual(s.objects, OBJECTS, "no working map, old table or old index is left");
  assert.match(s.temp, /SQLITE_AUTH|not authorized/i);
  assert.deepEqual(await page("SHARED", ANN), ANN_RENUMBERED);
  assert.deepEqual(await page("SHARED", OUTSIDER), OUTSIDER_RENUMBERED);
});

test("R23 R14 on workerd, after the renumbering the acts carry on from each member's own mark, and a real restart over the same storage boots clean and changes nothing; the store whose notes predate T35's revised column gains it and is renumbered too", async () => {
  assert.deepEqual([(await act("SHARED", "noteWrite", { text: "ann fourth", by: ANN })).note,
                    (await act("SHARED", "noteWrite", { text: "outsider third", by: OUTSIDER })).note], [4, 3]);
  assert.deepEqual(await act("SHARED", "noteDelete", { note: 2, by: ANN }), { ok: true, note: 2, deleted: true });
  const before = await store("SHARED");
  assert.deepEqual(before.turns.filter((t) => t.member === "ann").map((t) => t.note_id), [3], "the deleted note's turns went with it");
  /* the restart: workerd stopped and started again over the persisted storage; the module boots again */
  await mf.dispose();
  mf = new Miniflare(options());
  const again = await store("SHARED");
  assert.deepEqual(again, before, "a second boot changes nothing");
  assert.deepEqual((await page("SHARED", ANN)).map((n) => n[0]), [4, 3, 1]);
  assert.equal((await act("SHARED", "noteWrite", { text: "ann fifth", by: ANN })).note, 5, "a deleted number is never taken again");
  const [third, ...rest] = await page("SHARED", OUTSIDER);
  assert.deepEqual([third[0], third[1], third[3], third[4], rest], [3, "outsider third", null, [], OUTSIDER_RENUMBERED]);
  /* T34's shape: no revised column, the same notes */
  const t34 = await store("T34");
  assert.deepEqual([t34.keyed, t34.columns.includes("revised"), t34.objects], [["member", "note_id"], true, OBJECTS]);
  assert.deepEqual(await page("T34", ANN), ANN_RENUMBERED.map(([n, text, at, , turned]) => [n, text, at, null, turned]));
  assert.deepEqual(await page("T34", OUTSIDER), OUTSIDER_RENUMBERED.map(([n, text, at, , turned]) => [n, text, at, null, turned]));
});
