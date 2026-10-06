/* affordances, T34 (T34-75, T34-87, T34-90, T34-91): R42 (publishing at a set time), R43 (a member's own notes and the
   hypotheses' reason code), R44 (the assistant's two labelled drafts), R37's `baseupdates`, R19 as amended, and DEC-149's
   member voice in the one served sentence it reaches here, each at the module's exports and at the owners' interfaces. */
import test from "node:test";
import assert from "node:assert/strict";
import * as A from "../../../src/affordances.mjs";
import { ratificationOps } from "../../../src/ratification/index.mjs";
import { publicationOps } from "../../../src/publication/index.mjs";
import { hypothesesOps } from "../../../src/hypotheses/index.mjs";
import { HYPOTHESES_CHECKS } from "../../../src/hypotheses/checks.mjs";
import { DUTIES_CHECKS } from "../../../src/duties/checks.mjs";
import * as hyFix from "../hypotheses/fixture.mjs";

const { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, ACTS, CAPTURE_ACTS, PER_ITEM_ACTS } = A;
const url = new URL("http://x/");
const keysOf = (f) => Object.keys(f({}, url, {}));
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? ["rung", RUNGS[op]]
  : Object.hasOwn(RUNG_ABSENT, op) ? ["absent", RUNG_ABSENT[op].ground] : null;
const published = (op) => [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].some((a) => a.id === op);
const dec = (op) => A.decorate({ id: op, label: "x" }, null);

/* ---- R42 ------------------------------------------------------------------------------------------------------------ */
const R42_GRADES = { publishat: ["rung", "irreversible"], publishatmove: ["rung", "irreversible"],
  publishatcancel: ["rung", "reversible"] };
const R42_REASONS = {
  publishat: "case-directed: keyed by a case edition (case, edition), reached from the publication ceremony's last step; "
    + "signs now and publishes at the set time only if every check passes again then",
  publishatmove: "case-directed: keyed by a case edition waiting to be published, reached from the case and the owner's "
    + "queue; an owner's act until the set time",
  publishatcancel: "case-directed: keyed by a case edition waiting to be published, reached from the case and the owner's "
    + "queue; an owner's act until the set time",
};
test("R42 R19 R36 R7 R12: publishat and publishatmove are `irreversible` as publish, publishatcancel `reversible` "
   + "(caseratify or publishat signs again), each with R42's NON_ACTS reason, the read publishschedule `read:`, phone false "
   + "for the two and true for the cancel, none in MACHINE_REFUSALS — and with op-declarations R25's rows nothing is "
   + "unaccounted; a misgraded op or an op left out is seen", () => {
  assert.ok(keysOf(ratificationOps).includes("publishat"), "ratification serves publishat");
  const pub = keysOf(publicationOps);
  for (const op of ["publishatmove", "publishatcancel", "publishschedule"]) assert.ok(pub.includes(op), op);
  const grades = Object.fromEntries(Object.keys(R42_GRADES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(grades, R42_GRADES);
  assert.equal(RUNGS.publishat, RUNGS.publish);
  /* R27's `reversible`: the published acts that take a cancel back, graded and served */
  assert.ok(keysOf(ratificationOps).includes("caseratify"));
  assert.deepEqual([RUNGS.caseratify, RUNGS.publishat], ["attested", "irreversible"]);
  for (const [op, why] of Object.entries(R42_REASONS)) assert.equal(NON_ACTS[op], why, op);
  assert.ok(NON_ACTS.publishschedule.startsWith("read: ") && /writes nothing$/.test(NON_ACTS.publishschedule));
  assert.equal(gradeOf("publishschedule"), null);
  assert.deepEqual(["publishat", "publishatmove", "publishatcancel"].map((op) => dec(op).phone), [false, false, true]);
  const ALL = [...Object.keys(R42_GRADES), "publishschedule"];
  assert.deepEqual(ALL.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op) || published(op)), []);
  /* negative controls */
  assert.notDeepEqual({ ...grades, publishatcancel: ["rung", "irreversible"] }, R42_GRADES);
  assert.notDeepEqual({ ...grades, publishatmove: ["rung", "attested"] }, R42_GRADES);
  const table = [...Object.keys(R42_GRADES).map((op) => ({ op, mutating: true, gated: true })),
    { op: "publishschedule", mutating: false, gated: true }];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => ALL.includes(op)), []);
  assert.deepEqual(ALL.filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  assert.ok(A.unaccounted([{ op: "publishschedule", mutating: false, gated: false }]).stale.includes("publishschedule"));
});

/* ---- R43 ------------------------------------------------------------------------------------------------------------ */
const NOTE_DIRECTED = "note-directed: a member's own note, keyed by the note and answered to its author alone; never a "
  + "record id, never cited, published or counted; moves no bundle";
test("R43 R3 R7 R36 R12: notewrite and noteturn are `caller-owned` as reminderset, each note-directed in NON_ACTS, the "
   + "read notes `read:`, phone true, none in MACHINE_REFUSALS — and with the control plane's rows nothing is unaccounted",
() => {
  const ops = keysOf(hypothesesOps);
  for (const op of ["notewrite", "noteturn", "notes"]) assert.ok(ops.includes(op), op);
  for (const op of ["notewrite", "noteturn"]) {
    assert.deepEqual(gradeOf(op), ["absent", "caller-owned"], op);
    assert.equal(RUNG_ABSENT[op].ground, RUNG_ABSENT.reminderset.ground, op);
    assert.ok(RUNG_ABSENT[op].is.length > 40, op);
    assert.equal(NON_ACTS[op], NOTE_DIRECTED, op);
    assert.equal(dec(op).phone, true, op);
  }
  assert.ok(NON_ACTS.notes.startsWith("read: ") && /writes nothing$/.test(NON_ACTS.notes));
  assert.equal(gradeOf("notes"), null);
  assert.deepEqual(["notewrite", "noteturn", "notes"].filter((op) => Object.hasOwn(MACHINE_REFUSALS, op) || published(op)), []);
  const table = [{ op: "notewrite", mutating: true, gated: true }, { op: "noteturn", mutating: true, gated: true },
    { op: "notes", mutating: false, gated: true }];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => table.some((t) => t.op === op)), []);
  /* negative control: a note graded on another ground is seen */
  assert.notDeepEqual(gradeOf("notewrite"), ["absent", "undetermined"]);
});

test("R43 R20: hypotheses refuses a machine at both note ops by its own code, MACHINE_CANNOT_NOTE, which no ACTS row "
   + "carries, so MACHINE_REFUSALS gains nothing", () => {
  const w = hyFix.world();
  assert.equal(w.h.noteWrite({ text: "a thing I saw", by: "" }).reason, "MACHINE_CANNOT_NOTE");
  const n = w.h.noteWrite({ text: "a thing I saw", by: hyFix.ANN });
  assert.equal(n.ok, true, JSON.stringify(n).slice(0, 300));
  assert.equal(w.h.noteTurn({ note: n.note, into: "question", by: "" }).reason, "MACHINE_CANNOT_NOTE");
  assert.ok(!Object.values(MACHINE_REFUSALS).includes("MACHINE_CANNOT_NOTE"));
});

test("R43 R19: HYPOTHESIS_NO_REASON and DUTY_NO_REASON are in the justification family, each a row of its owner's checks, "
   + "and NO_REASON stays for the ops that still answer it", () => {
  assert.ok(Object.hasOwn(HYPOTHESES_CHECKS, "HYPOTHESIS_NO_REASON"));
  assert.ok(Object.hasOwn(DUTIES_CHECKS, "DUTY_NO_REASON"));
  for (const c of ["HYPOTHESIS_NO_REASON", "DUTY_NO_REASON", "NO_REASON"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  /* the note ops' refusals ask an object or a member, never an account, and stay out */
  for (const c of ["MACHINE_CANNOT_NOTE", "NOTE_NO_TEXT", "NOTE_TOO_LONG", "NOTE_TURN_UNKNOWN", "NOTE_TURN_NOT_MADE",
    "NOTE_TOO_LONG_FOR_HUNCH", "HYPOTHESIS_NO_STATEMENT"]) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

/* ---- R44 and R37's baseupdates ---------------------------------------------------------------------------------------- */
const DRAFT = "draft: answers a labelled machine draft into a member's own field; writes nothing of the record; the "
  + "member's words only by the member's own act of keeping it";
test("R44 R37 R7 R12: groupdescriptiondraft and writinghelp carry R44's sentence and no rung, are no act and in no "
   + "MACHINE_REFUSALS; baseupdates is a read; with the control plane's rows (gated, not mutating) nothing is "
   + "unaccounted, and carried as mutating each would read unranked", () => {
  for (const op of ["groupdescriptiondraft", "writinghelp"]) {
    assert.equal(NON_ACTS[op], DRAFT, op);
    assert.equal(gradeOf(op), null, op);
    assert.ok(!Object.hasOwn(MACHINE_REFUSALS, op) && !published(op), op);
  }
  assert.ok(NON_ACTS.baseupdates.startsWith("read: ") && /writes nothing$/.test(NON_ACTS.baseupdates));
  assert.equal(gradeOf("baseupdates"), null);
  const OPS = ["groupdescriptiondraft", "writinghelp", "baseupdates"];
  const table = OPS.map((op) => ({ op, mutating: false, gated: true }));
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => OPS.includes(op)), []);
  assert.deepEqual(A.unaccounted([{ op: "writinghelp", mutating: true, gated: true }]).unranked, ["writinghelp"]);
  assert.ok(A.unaccounted([]).stale.includes("writinghelp"), "carried by no row, it reads stale");
});

/* ---- DEC-149 (T34-87; K1849 (7)) ----------------------------------------------------------------------------------- */
test("R21 R4 (DEC-149): the undetermined ground's sentence, served as vocabularies.rung_absence_grounds, names no "
   + "Civicsmith ('no refusal establishes one'), and no sentence this module serves in the catalogue calls it the plane, this "
   + "instance, this copy or the server; 'server-side' stays", () => {
  const u = A.RUNG_ABSENCE_GROUNDS.undetermined;
  assert.match(u, /^THIS IS A REAL ACT ON THE RECORD AND IT HAS NO RUNG\. No document assigns one and no refusal establishes one, so the honest answer is that it is UNDETERMINED/);
  assert.doesNotMatch(u, /plane/);
  assert.match(A.RUNG_ABSENCE_GROUNDS["caller-owned"], /server-side/);
  /* this module's own served text: `answer_checks` is `answers`' family, carried whole for the pack (K1601) */
  const { answer_checks, ...own } = A.affordancesAnswer({ kinds: null, gate: null });
  assert.ok(answer_checks && typeof answer_checks === "object");
  const served = JSON.stringify(own);
  const NAMES = /\bthe plane\b|\bthis plane\b|\bthis instance\b|\bthe instance\b|\bthis copy\b|\bserver\b(?!-side)/i;
  assert.equal(NAMES.exec(served), null);
  assert.ok(NAMES.test(served.replace("no refusal establishes", "no refusal in the plane establishes")), "negative control");
});

/* ---- R44: the no-target answer's writing_help_refused (K1861 (1)) ----------------------------------------------------- */
import { affordancesOp } from "../../../src/affordances.mjs";
test("R44 R17 R21: the door passes the screens route's writing_help_refused into the no-target answer unchanged — the "
   + "same object wizard-scripts answered — and a targeted answer carries no such key", async () => {
  const WHR = { named: Object.freeze(["release", "caseratify", "bootstrap"]), machine_refused: ["publish"],
                irreversible: ["publish", "publishat", "publishatmove"] };
  const routes = { "/actionkinds": { answered: true, result: { kinds: ["other"] } },
    "/affordancescreens": { answered: true, result: { ok: true, screens: [], wizard_scripts: [], writing_help_refused: WHR } },
    "/affordancefacts": { answered: true, result: { ok: true, target: "INQ-1", object_type: "inquiry", current_state: "open" } } };
  const deps = { json: (body, status) => ({ body, status }), doAnswer: async (r) => r,
    storeSilent: () => ({ silent: true }), storeRefusal: (o) => ({ refusal: o }), gate: null,
    viewer: "member:iris", identity: "member:iris", author: "iris", by: "iris", storeName: "bio", cls: "session" };
  const stub = { fetch: (u) => routes[new URL(u).pathname] };
  const r = await affordancesOp(new URL("http://x/api/?op=affordances"), stub, deps);
  assert.equal(r.body.result.writing_help_refused, WHR, "the very object, never a copy");
  const t = await affordancesOp(new URL("http://x/api/?op=affordances&target=INQ-1"), stub, deps);
  assert.ok(!("writing_help_refused" in t.body.result));
  /* the pure composition: absent where none was handed in, never an invented list */
  assert.equal(A.affordancesAnswer({ kinds: null, gate: null }).writing_help_refused, null);
});

/* ---- R45 (K1864) ---------------------------------------------------------------------------------------------------- */
import { membershipOps } from "../../../src/membership/index.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";
import { T34_RUNGS, T34_RUNG_ABSENT, T34_NON_ACTS, OP_ALIASES, aliased } from "../../../src/affordances/t34.mjs";
/* Each op R45 grades, by owner, with its grade; reads apart. `tasks` and `instance-setup` are later in the order (P4), so
   their ops are named as op-declarations R23, R26 and R28 name them; membership's and credentials' maps are read. */
const R45_WRITES = {
  invitewithdraw: "credential", websitekeycreate: "credential", websitekeyset: "credential", websitekeyrevoke: "credential",
  joinlinkenable: "credential", joinlinkset: "credential", joinlinkreplace: "credential", joinlinkoff: "credential",
  websiteinvite: "credential", joinlinkinvite: "credential", courtnoticeset: "substrate", groupdescriptionset: "substrate",
  checkrequest: "undetermined", checktake: "undetermined", checkrecord: "reasoned",
  groupkeyset: "credential", groupkeyremove: "credential", groupkeyswitch: "substrate", groupswitchset: "substrate",
  groupkeynoticeseen: "caller-owned", placewanted: "substrate", memberlanguageset: "caller-owned",
};
const R45_READS = ["checkrequests", "checksof", "groupkeystate", "groupkeynotice", "placewantedstate",
  "memberlanguage", "startfrom"];
/* public, with no NEEDS row (op-declarations R22: `classes: null`; `courtnotice` a plain read, K1883 (1)): graded where
   they write, named in no NON_ACTS (R12) */
const R45_PUBLIC = ["websiteinvite", "joinlinkinvite", "groupdescription", "courtnotice"];
const UNGATED_READS = ["groupdescription", "courtnotice"];
const g = (op) => gradeOf(op)?.[1] ?? null;
test("R45 R3 R7 R12 R19: every op T34 declares in op-declarations R22–R24, R26, R28 and R15 carries the grade read from "
   + "its owner, each gated op its NON_ACTS reason, the public ones none; with their rows nothing is unaccounted; a "
   + "misgraded op or one left out is seen", () => {
  const m = keysOf(membershipOps), c = keysOf(credentialsOps);
  for (const op of ["invitewithdraw", "websitekeycreate", "websitekeyset", "websitekeyrevoke", "joinlinkenable", "joinlinkset",
    "joinlinkreplace", "joinlinkoff", "courtnoticeset", "groupdescriptionset", "websiteinvite", "joinlinkinvite",
    "courtnotice", "groupdescription"]) assert.ok(m.includes(op), `membership serves ${op}`);
  for (const op of ["groupkeyset", "groupkeyremove", "groupkeyswitch", "groupswitchset", "groupkeystate", "groupkeynotice",
    "groupkeynoticeseen"]) assert.ok(c.includes(op), `credentials serves ${op}`);
  const got = Object.fromEntries(Object.keys(R45_WRITES).map((op) => [op, g(op)]));
  assert.deepEqual(got, R45_WRITES);
  assert.deepEqual([...Object.keys(T34_RUNGS), ...Object.keys(T34_RUNG_ABSENT)].sort(), Object.keys(R45_WRITES).sort());
  for (const [op, e] of Object.entries(T34_RUNG_ABSENT)) assert.ok(e.is.length > 40, op);
  /* each beside the op R45's reading names as its precedent */
  for (const [op, like] of [["groupkeyset", "keyedserviceset"], ["groupkeyswitch", "keyedserviceswitch"],
    ["courtnoticeset", "groupnameset"], ["placewanted", "officesseed"], ["websiteinvite", "knock"],
    ["groupkeynoticeseen", "disclosureshown"], ["memberlanguageset", "accountswitchset"]]) assert.equal(g(op), g(like), op);
  for (const op of R45_READS) {
    assert.ok(NON_ACTS[op].startsWith("read: ") && /writes nothing$/.test(NON_ACTS[op]), op);
    assert.equal(gradeOf(op), null, op);
  }
  for (const op of R45_PUBLIC) assert.ok(!Object.hasOwn(NON_ACTS, op), op);
  const gatedWrites = Object.keys(R45_WRITES).filter((op) => !R45_PUBLIC.includes(op));
  assert.deepEqual(Object.keys(T34_NON_ACTS).sort(), [...gatedWrites, ...R45_READS].sort());
  for (const op of gatedWrites) assert.ok(NON_ACTS[op].length > 30 && !NON_ACTS[op].startsWith("read: "), op);
  const ALL = [...Object.keys(R45_WRITES), ...R45_READS, ...UNGATED_READS];
  assert.deepEqual(ALL.filter((op) => published(op) || Object.hasOwn(MACHINE_REFUSALS, op)), []);
  /* R19: checkrecord's code is in the family (its refusal is tasks' R15 test: tasks is later in the order) */
  assert.ok(JUSTIFICATION_REFUSALS.includes("CHECK_NO_REASON"));
  const table = [...Object.keys(R45_WRITES).map((op) => ({ op, mutating: true, gated: !R45_PUBLIC.includes(op) })),
    ...R45_READS.map((op) => ({ op, mutating: false, gated: true })),
    ...UNGATED_READS.map((op) => ({ op, mutating: false, gated: false }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => ALL.includes(op)), []);
  /* negative controls */
  assert.notDeepEqual({ ...got, checkrecord: "reversible" }, R45_WRITES);
  for (const op of UNGATED_READS)
    assert.deepEqual(A.unaccounted([{ op, mutating: false, gated: true }]).unpublished, [op], `${op}, carried gated, is seen`);
});

test("R45 R12: each of op-declarations R21's 29 aliases takes its op's very grade and reason through one frozen table — "
   + "an alias never differs from its op — and with the alias rows nothing is unaccounted", () => {
  assert.ok(Object.isFrozen(OP_ALIASES));
  assert.equal(Object.keys(OP_ALIASES).length, 29);
  for (const [a, op] of Object.entries(OP_ALIASES)) {
    assert.ok(Object.hasOwn(NON_ACTS, op), `${op}, ${a}'s op, is named`);
    assert.equal(NON_ACTS[a], NON_ACTS[op], a);
    assert.equal(RUNGS[a], RUNGS[op], a);
    assert.equal(RUNG_ABSENT[a], RUNG_ABSENT[op], `${a}: the same entry object`);
    assert.deepEqual(gradeOf(a), gradeOf(op), a);
  }
  /* the reads stay reads (ruleanswer, reconcile): no grade */
  for (const a of ["ruleanswer", "reconcile"]) assert.equal(gradeOf(a), null, a);
  /* `aliased` answers only the aliases whose op the table holds, with that op's own value */
  assert.deepEqual(aliased({ rule: "x" }), { ruleanswer: "x" });
  const table = Object.entries(OP_ALIASES).map(([a, op]) => ({ op: a, mutating: gradeOf(op) !== null, gated: true }));
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => Object.hasOwn(OP_ALIASES, op)), []);
});
