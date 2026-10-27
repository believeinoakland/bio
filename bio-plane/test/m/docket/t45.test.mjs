/* docket at T45 (N855, N858, N880, N892; Actions D4, D5, D10, D20, D22; v0.2 rules 12, 15, 16, 17; K2781 (3)): an
   outcome entry's own statement (R1) and what its public entry carries (R6), the lane's items marked public (R26), the
   pressure marks read for the modules that act on them (R27), and nothing of a counsel matter on a docket (R28), at the
   module's interface. Every refusal is shown with its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, file, prepare, sign, post, fileAndPlace, legacyEntry, V, MACHINE, CASE, SUBJECT, NOW, DAY, OUTCOME, keyFor, sha, notJoinedOk }
  from "./fixture.mjs";
import { DOCKET_CHECKS, OUTCOME_KINDS, PRESSURE_KINDS, COUNSEL_MATTER_CODE, counselMatterRow, docketOps, DOCKET_SCHEMA }
  from "../../../src/docket/index.mjs";
import { docketStatement, verifySshsig, NS_DOCKET } from "../../../src/sshsig.mjs";

const A = V("alice"), B = V("bob");
const rowOk = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, DOCKET_CHECKS[code].check);
  assert.equal(r.translation, DOCKET_CHECKS[code].translation);
};
function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  const r = bad();
  rowOk(r, code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 300)}`);
  return r;
}
const fields = (p) => JSON.parse(p.entry);

/* ---------------------------------------------------------------- R1: an outcome entry's own statement */

test("R1 (T45) an outcome states {kind, on} and a summary: DOCKET_OUTCOME_UNREADABLE and DOCKET_NO_SUMMARY, each writing nothing, each with its control", () => {
  const w = seeded();
  const good = () => file(w, OUTCOME);
  assert.deepEqual(OUTCOME_KINDS, ["cure", "harm_addressed"]);
  for (const outcome of [undefined, null, "", "cure", 7, {}, { kind: "success", on: "2026-09-30" }, { kind: "cured", on: "2026-09-30" },
                         { kind: "cure" }, { kind: "cure", on: null }, { kind: "cure", on: "30/09/2026" }, { kind: "cure", on: "2026-02-30" },
                         { kind: "cure", on: "2026-09-30T10:00:00Z" }, { kind: "cure", on: "2026-10-02" }, { kind: "harm_addressed", on: "2027-01-01" }])
    refusedThenAccepted(w, () => file(w, { ...OUTCOME, outcome }), good, "DOCKET_OUTCOME_UNREADABLE");
  /* the bounds of `on`: the filing's own day (UTC) is the latest; any earlier calendar date files */
  for (const on of ["2026-10-01", "2026-09-30", "1999-12-31", "2024-02-29"])
    for (const kind of OUTCOME_KINDS) assert.equal(file(w, { ...OUTCOME, outcome: { kind, on } }).ok, true, `${kind} on ${on}`);
  /* an outcome given as JSON text, as the ops map passes a query value */
  assert.equal(file(w, { ...OUTCOME, outcome: JSON.stringify({ kind: "harm_addressed", on: "2026-09-01" }) }).ok, true);
  /* the summary: one paragraph of 1 to 600 characters, as R4 bounds a reaction's */
  for (const summary of [undefined, null, "", "   ", "s".repeat(601), "one\n\ntwo paragraphs", 7])
    refusedThenAccepted(w, () => file(w, { ...OUTCOME, summary }), good, "DOCKET_NO_SUMMARY");
  assert.equal(file(w, { ...OUTCOME, summary: "s".repeat(600) }).ok, true, "a summary at the bound");
  assert.equal(file(w, { ...OUTCOME, summary: "one line\nand the next" }).ok, true, "one paragraph may run over lines");
  /* an entry of any other kind stating an outcome is refused; the same entry without it files */
  refusedThenAccepted(w, () => file(w, { outcome: OUTCOME.outcome }), () => file(w), "DOCKET_OUTCOME_UNREADABLE");
  for (const x of [{ kind: "statement", capture: w.swept.sha }, { kind: "reaction", from: { kind: "other", name: "A blog" } }])
    refusedThenAccepted(w, () => file(w, { ...x, outcome: { kind: "cure", on: "2026-09-30" } }), () => file(w, x), "DOCKET_OUTCOME_UNREADABLE");
  /* a summary on another kind is not an outcome's statement, but it is kept (R1, K5148); an unusable one is not refused */
  const plain = file(w, { summary: "kept words" });
  assert.equal(plain.ok, true);
  assert.equal(plain.summary, "kept words");
  assert.equal("outcome" in plain, false);
  const bad = file(w, { summary: "a\n\nb" });
  assert.equal(bad.ok, true);
  assert.equal("summary" in bad, false);
});

test("R1 (T45) the outcome's refusals come after R1's form checks, in order: outcome, then summary", () => {
  const w = seeded();
  const bad = { ...OUTCOME, outcome: { kind: "nope" }, summary: "", proposed: "maybe" };
  rowOk(file(w, { ...bad, capture: "x" }), "DOCKET_NO_CAPTURE");
  rowOk(file(w, bad), "DOCKET_NO_REASON");
  rowOk(file(w, { ...bad, proposed: "both" }), "DOCKET_OUTCOME_UNREADABLE");
  rowOk(file(w, { ...bad, proposed: "both", outcome: OUTCOME.outcome }), "DOCKET_NO_SUMMARY");
  assert.equal(file(w, { ...bad, proposed: "both", outcome: OUTCOME.outcome, summary: OUTCOME.summary }).ok, true);
  /* the caller's refusals before every form check, as for every kind */
  rowOk(file(w, { ...bad, author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_FILE_DOCKET");
  notJoinedOk(file(w, { ...bad, author: V("dave"), viewer: B }), "docketfile");
});

test("R1 (T45) a well-formed outcome files at once to the record, by a member, from anyone; recorded with its statement; never core", () => {
  const w = seeded();
  const before = w.snapshot();
  const f = file(w, { ...OUTCOME, outcome: { kind: "harm_addressed", on: "2026-09-15" }, summary: "  The fee was refunded.  ",
                      from: { kind: "other", name: "The council" } });
  assert.notDeepEqual(w.snapshot(), before);
  assert.equal(f.ok, true, JSON.stringify(f));
  assert.deepEqual([f.shelf, f.kind, f.outcome, f.summary], ["record", "outcome", { kind: "harm_addressed", on: "2026-09-15" }, "The fee was refunded."]);
  const subj = file(w, OUTCOME);
  assert.equal(subj.ok, true, "from the subject too");
  const d = w.docket.docketOf({ case: CASE, viewer: A });
  const rec = d.entries.find((e) => e.entry === f.entry);
  assert.deepEqual([rec.state, rec.outcome, rec.summary], ["pending", { kind: "harm_addressed", on: "2026-09-15" }, "The fee was refunded."]);
  file(w);
  const other = w.docket.docketOf({ case: CASE, viewer: A }).entries.find((e) => e.kind === "response");
  assert.equal("outcome" in other, false, "a response carries no outcome fields");
  assert.equal(w.docket.coreDue({ viewer: A }).items.some((i) => i.ref === f.entry || i.ref === subj.entry), false, "never core (R9)");
  /* filed by a member only: a machine files no outcome */
  rowOk(file(w, { ...OUTCOME, author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_FILE_DOCKET");
  /* the ops map passes outcome and summary through, the author from the query */
  const url = new URL(`https://x/?${new URLSearchParams({ author: B, viewer: B })}`);
  const viaOps = docketOps(w.docket, url, { case: CASE, edition: 1, from: { kind: "subject", entity: SUBJECT }, capture: w.cap.sha,
                                            proposed: "record", reason: "r", ...OUTCOME }).docketfile();
  assert.deepEqual([viaOps.ok, viaOps.outcome], [true, OUTCOME.outcome]);
});

/* ---------------------------------------------------------------- R6: what a public outcome entry carries */

test("R6 (T45) a placed outcome carries outcome {kind, on} and summary as filed, by the manager's signed act only", async () => {
  const w = seeded();
  const f = file(w, OUTCOME);
  rowOk(prepare(w, { kind: "outcome", entry: f.entry }, "bob"), "DOCKET_NOT_THE_MANAGER");
  const p = prepare(w, { kind: "outcome", entry: f.entry, summary: "The manager's other words." });
  assert.equal(p.ok, true, JSON.stringify(p));
  const j = fields(p);
  assert.deepEqual(j.outcome, OUTCOME.outcome);
  assert.equal(j.summary, OUTCOME.summary, "the summary as filed; prepare's summary is not read for an outcome");
  assert.equal(j.shelf, "listed");
  rowOk(prepare(w, { kind: "outcome", entry: f.entry, shelf: "reactions" }), "DOCKET_WRONG_SHELF");
  const posted = await w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A });
  assert.equal(posted.ok, true);
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual([pub.entries[0].fields.outcome, pub.entries[0].fields.summary], [OUTCOME.outcome, OUTCOME.summary]);
  assert.deepEqual(pub.entries[0].fields, JSON.parse(pub.entries[0].json), "fields is json parsed");
  assert.equal(w.docket.docketOf({ case: CASE, viewer: A }).entries.find((e) => e.entry === f.entry).state, "placed");
});

test("R6 (T45) a pre-T45 outcome entry, without outcome or summary, still verifies and reads outcome: null; its bytes are kept", async () => {
  const w = seeded();
  const old = legacyEntry(w, { shelf: "listed", kind: "outcome", edition: 1, from: "The council", received: "2026-10-01",
                                capture: { sha256: w.cap.sha, origin: w.cap.origin, archived: w.cap.archived } });
  const pub = await w.docket.docketPublic({ case: CASE });
  const e = pub.entries[0];
  assert.equal(e.json, old.text, "the stored bytes, untouched");
  assert.equal(sha(e.json), e.digest);
  assert.equal((await verifySshsig(e.signature, docketStatement(CASE, e.seq, e.digest), NS_DOCKET, [keyFor("alice").b64])).ok, true, "it verifies");
  assert.equal(e.fields.outcome, null, "reads outcome: null");
  assert.equal("outcome" in JSON.parse(e.json), false, "though its bytes carry none");
  assert.deepEqual(Object.keys(e).sort(), ["digest", "entry", "fields", "json", "published_at", "seq", "signature", "taken_back"], "R24's form");
  /* negative control: a pre-T45 entry of another kind gains no outcome key */
  w.clock.now = NOW + DAY;
  legacyEntry(w, { shelf: "listed", kind: "standing-granted", edition: 1, holder: "A union", reason: "named" });
  const again = await w.docket.docketPublic({ case: CASE });
  assert.equal("outcome" in again.entries[1].fields, false);
  assert.deepEqual(again.entries[1].fields, JSON.parse(again.entries[1].json));
});

test("R6 (T45) a record outcome filed before T45 (no statement) reads outcome: null, and is not placed without one: DOCKET_OUTCOME_UNREADABLE", () => {
  const w = seeded();
  const f = file(w, OUTCOME);
  w.st.sql.exec(`UPDATE docket_record SET outcome_json=NULL, summary=NULL WHERE entry_id=?`, f.entry);
  const rec = w.docket.docketOf({ case: CASE, viewer: A }).entries.find((e) => e.entry === f.entry);
  assert.deepEqual([rec.outcome, rec.summary], [null, null]);
  const before = w.snapshot();
  rowOk(prepare(w, { kind: "outcome", entry: f.entry }), "DOCKET_OUTCOME_UNREADABLE");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(prepare(w, { kind: "outcome", entry: file(w, OUTCOME).entry }).ok, true, "negative control: one filed with its statement");
});

test("R1 (T45) a store created before T45 gains the outcome columns at start, keeping its rows", () => {
  const oldSchema = DOCKET_SCHEMA.replace(",\n  outcome_json TEXT,\n  summary      TEXT\n);", "\n);");
  assert.notEqual(oldSchema, DOCKET_SCHEMA, "the old schema is the one without the two columns");
  const w = world({ before: (x) => {
    const bare = oldSchema.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const t of bare.split(";")) if (t.trim()) x.st.db.exec(t);
    x.st.db.exec(`INSERT INTO docket_record (entry_id, case_id, edition, kind, from_json, capture_sha, proposed, reason, found_by, author, filed_at)
                  VALUES ('DKT-2026-0001', 'CASE-2026-0101', 1, 'outcome', '{"kind":"other","name":"x"}', 'a', 'record', 'r', 'paste', 'bob', 't')`);
  } });
  const cols = w.rows(`PRAGMA table_info(docket_record)`).map((c) => c.name);
  assert.ok(cols.includes("outcome_json") && cols.includes("summary"));
  assert.deepEqual(w.rows(`SELECT entry_id, outcome_json, summary FROM docket_record`), [{ entry_id: "DKT-2026-0001", outcome_json: null, summary: null }]);
  w.docket.migrate();
  assert.equal(w.rows(`PRAGMA table_info(docket_record)`).length, cols.length, "idempotent");
});

/* ---------------------------------------------------------------- R26: the lane's items marked public */

test("R26 (T45) every item carries public: true; a record entry is never an item; under audience: \"public\" the same items, through events too", async () => {
  const w = seeded();
  await fileAndPlace(w);
  await fileAndPlace(w, OUTCOME);
  const pending = file(w, OUTCOME).entry;
  const direct = w.docket.docketEvents({ set: [SUBJECT], viewer: A });
  assert.ok(direct.items.length >= 4);
  for (const i of direct.items) assert.equal(i.public, true, `${i.ref} ${i.kind}`);
  assert.ok(!JSON.stringify(direct).includes(pending), "a record entry is never an item");
  assert.deepEqual(w.docket.docketEvents({ set: [SUBJECT], viewer: A, audience: "public" }), direct, "the same items for the public audience");
  const pubLane = w.events.timeline({ set: [SUBJECT], lanes: ["ours"], viewer: A, audience: "public" });
  const ownLane = w.events.timeline({ set: [SUBJECT], lanes: ["ours"], viewer: A });
  const src = (t) => t.ours.sources.find((s) => s.source === "docket");
  assert.deepEqual(src(pubLane).items, src(ownLane).items);
  for (const i of src(pubLane).items) assert.equal(i.public, true);
  /* negative control: still fail-closed to a reader who does not see the project */
  assert.deepEqual(w.docket.docketEvents({ set: [SUBJECT], viewer: V("dave"), audience: "public" }).items, []);
});

/* ---------------------------------------------------------------- R27: the pressure marks, read */

test("R27 (T45) docketPressureMarks: each mark in the order made, as the plane, naming no member; kind filters; paged by cursor; writes nothing", () => {
  const w = seeded();
  const mark = (kind, note = null) => {
    const e = file(w).entry;
    assert.equal(w.docket.docketPressure({ entry: e, pressure: { kind, note }, author: B, viewer: B }).ok, true);
    return e;
  };
  const empty = w.docket.docketPressureMarks({});
  assert.deepEqual(empty, { ok: true, marks: [], cursor: null });
  const made = [["legal", "A letter from counsel."], ["retaliation", null], ["legal", null], ["discrediting", "A column."], ["other", null]]
    .map(([k, n]) => ({ kind: k, note: n, entry: mark(k, n) }));
  file(w);   /* an unmarked entry is no mark */
  const before = w.snapshot();
  const all = w.docket.docketPressureMarks({});
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.equal(all.ok, true);
  assert.deepEqual(all.marks.map((m) => [m.entry, m.kind, m.note]), made.map((m) => [m.entry, m.kind, m.note]), "in the order made");
  for (const m of all.marks) {
    assert.deepEqual(Object.keys(m).sort(), ["at", "case", "entry", "kind", "mark", "note", "project"]);
    assert.deepEqual([m.case, m.project, m.at], [CASE, w.P, "2026-10-01T12:00:00Z"]);
    assert.ok(Number.isInteger(m.mark));
  }
  assert.equal(all.cursor, null);
  const text = JSON.stringify(all);
  for (const who of ["bob", "alice", "member:", "h_bob", "Cover "]) assert.ok(!text.includes(who), `names no member (${who})`);
  /* kind: only that kind; one outside R2's four refused with its row */
  assert.deepEqual(w.docket.docketPressureMarks({ kind: "legal" }).marks.map((m) => m.entry), [made[0].entry, made[2].entry]);
  for (const kind of PRESSURE_KINDS) assert.ok(w.docket.docketPressureMarks({ kind }).marks.every((m) => m.kind === kind));
  for (const kind of ["rude", "LEGAL", 3]) rowOk(w.docket.docketPressureMarks({ kind }), "DOCKET_PRESSURE_REFUSED");
  /* paging across a cursor */
  const p1 = w.docket.docketPressureMarks({ limit: 2 });
  assert.deepEqual([p1.marks.length, p1.cursor], [2, p1.marks[1].mark]);
  const p2 = w.docket.docketPressureMarks({ after: p1.cursor, limit: 2 });
  const p3 = w.docket.docketPressureMarks({ after: p2.cursor, limit: 2 });
  assert.deepEqual([...p1.marks, ...p2.marks, ...p3.marks], all.marks, "the pages make the whole, in order");
  assert.equal(p3.cursor, null, "the last page says none follow");
  const lp = w.docket.docketPressureMarks({ kind: "legal", limit: 1 });
  assert.deepEqual(w.docket.docketPressureMarks({ kind: "legal", after: lp.cursor }).marks.map((m) => m.entry), [made[2].entry]);
  /* the limit: default 1,000, clamped to 1–1,000 */
  assert.equal(w.docket.docketPressureMarks({ limit: 0 }).marks.length, 1);
  assert.equal(w.docket.docketPressureMarks({ limit: 5000 }).marks.length, 5);
  assert.equal(w.docket.docketPressureMarks({ limit: 5 }).cursor, null, "exactly the limit: none follow");
});

test("R27 (T45) the default page is 1,000 marks, the cursor naming the last when more follow", () => {
  const w = seeded();
  const e = file(w).entry;
  for (let i = 0; i < 1001; i++)
    w.st.sql.exec(`INSERT INTO docket_marks (entry_id, kind, pressure, by_member, at) VALUES (?, ?, 'legal', 'bob', 't')`, `${e}-${i}`, "pressure");
  const r = w.docket.docketPressureMarks({});
  assert.equal(r.marks.length, 1000);
  assert.equal(r.cursor, r.marks[999].mark);
  assert.equal(w.docket.docketPressureMarks({ after: r.cursor }).marks.length, 1);
});

test("R27 (T45) docketPressureOf: the entry's mark, or pressure: null; an unseen entry answered as an absent one, byte-identical", () => {
  const w = seeded();
  const marked = file(w).entry, plain = file(w).entry;
  w.docket.docketPressure({ entry: marked, pressure: { kind: "legal", note: "Counsel wrote." }, author: B, viewer: B });
  const before = w.snapshot();
  assert.deepEqual(w.docket.docketPressureOf({ entry: marked, viewer: A }),
                   { ok: true, entry: marked, case: CASE, project: w.P, kind: "legal", note: "Counsel wrote.", at: "2026-10-01T12:00:00Z" });
  assert.deepEqual(w.docket.docketPressureOf({ entry: plain, viewer: B }), { ok: true, entry: plain, pressure: null });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  const unseen = w.docket.docketPressureOf({ entry: marked, viewer: V("dave") });
  rowOk(unseen, "NO_SUCH_DOCKET_ENTRY");
  /* the absent entry named by the same id: put the case out of anyone's sight by asking for an id that names nothing */
  const absent = (() => { const x = seeded(); return x.docket.docketPressureOf({ entry: marked, viewer: A }); })();
  assert.equal(JSON.stringify(unseen), JSON.stringify(absent), "byte-identical");
  for (const viewer of [null, MACHINE]) rowOk(w.docket.docketPressureOf({ entry: marked, viewer }), "NO_SUCH_DOCKET_ENTRY");
  assert.ok(!JSON.stringify(w.docket.docketPressureOf({ entry: marked, viewer: A })).includes("bob"), "names no member");
});

test("R27 (T45) neither read throws: an unreadable table answers DOCKET_UNREADABLE, never a short list", () => {
  const w = seeded();
  const e = file(w).entry;
  w.docket.docketPressure({ entry: e, pressure: { kind: "legal" }, author: B, viewer: B });
  assert.equal(w.docket.docketPressureMarks({}).marks.length, 1, "negative control: readable");
  w.st.db.exec(`ALTER TABLE docket_marks RENAME TO docket_marks_gone`);
  assert.deepEqual([w.docket.docketPressureMarks({}).ok, w.docket.docketPressureMarks({}).reason], [false, "DOCKET_UNREADABLE"]);
  assert.equal("marks" in w.docket.docketPressureMarks({ kind: "legal" }), false);
  assert.deepEqual([w.docket.docketPressureOf({ entry: e, viewer: A }).ok, w.docket.docketPressureOf({ entry: e, viewer: A }).reason],
                   [false, "DOCKET_UNREADABLE"]);
});

/* ---------------------------------------------------------------- R28: nothing of a counsel matter on a docket */

const counselOk = (r) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.reason, r.code], [COUNSEL_MATTER_CODE, COUNSEL_MATTER_CODE]);
  const row = counselMatterRow();
  assert.ok(row, "publication exports R78's row for COUNSEL_MATTER_NOT_PUBLISHED");
  assert.deepEqual([r.check, r.translation], [row.check, row.translation], "publication R78's one row, answered through its export");
};

test("R28 (T45) the code is publication's row alone: docket's table holds no copy", () => {
  assert.equal(Object.hasOwn(DOCKET_CHECKS, COUNSEL_MATTER_CODE), false);
  assert.equal(COUNSEL_MATTER_CODE, "COUNSEL_MATTER_NOT_PUBLISHED");
  const row = counselMatterRow();
  assert.ok(row && /^C-122\.\d+$/.test(row.check), `publication R78's row is of family C-122 (${row && row.check})`);
});

test("R28 (T45) docketFile on a counsel matter's case: refused after the not-joined refusal, before every form check, writing nothing; scope none files", () => {
  const w = seeded();
  w.roster.scopes.set(w.P, "counsel_matter");
  const before = w.snapshot();
  counselOk(file(w));
  counselOk(file(w, OUTCOME));
  counselOk(file(w, { edition: 9, capture: "x", reason: "" }));
  counselOk(w.docket.docketFile({ case: CASE, takesBack: "DKT-2026-9999", reason: "", author: B, viewer: B }));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  notJoinedOk(file(w, { author: V("dave"), viewer: B }), "docketfile");
  rowOk(file(w, { author: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_FILE_DOCKET");
  assert.equal(file(w, {}, "dave").reason, "NO_SUCH_CASE");
  assert.ok(w.roster.asked.includes(w.P), "the scope read is the case's owning project's");
  /* controls: scope none, and `own`, file */
  w.roster.scopes.set(w.P, "own");
  assert.equal(file(w).ok, true);
  w.roster.scopes.delete(w.P);
  assert.equal(file(w).ok, true);
  /* a scope read that throws is refused, never filed on an unread scope */
  w.roster.throws = true;
  counselOk(file(w));
});

test("R28 (T45) docketPrepare and docketPost on a counsel matter's case: refused after DOCKET_NOT_THE_MANAGER, read at the act, writing nothing", async () => {
  const w = seeded();
  const e = file(w).entry;
  const p = prepare(w, { kind: "response", entry: e });
  assert.equal(p.ok, true);
  w.roster.scopes.set(w.P, "counsel_matter");
  const before = w.snapshot();
  counselOk(prepare(w, { kind: "response", entry: e }));
  counselOk(prepare(w, { kind: "withdrawal", edition: 99, reason: "" }));
  rowOk(prepare(w, { kind: "response", entry: e }, "bob"), "DOCKET_NOT_THE_MANAGER");
  rowOk(prepare(w, { kind: "response", entry: e, by: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_PLACE_DOCKET");
  /* prepared before the scope was set, posted after: read at the post */
  counselOk(await w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A }));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* the slug comes after: a counsel matter in a group with no slug is the counsel matter */
  const bare = world({ slug: null });
  bare.member("alice");
  bare.P = bare.project("budget", "alice");
  bare.publish(bare.P, CASE, 1, [{ id: "INQ-2026-0001-x", role: "load_bearing" }]);
  bare.roster.scopes.set(bare.P, "counsel_matter");
  counselOk(prepare(bare, { kind: "edition", edition: 1 }));
  /* control: scope none prepares and posts the same entry */
  w.roster.scopes.set(w.P, "none");
  const ok = await w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A });
  assert.equal(ok.ok, true, JSON.stringify(ok));
});

test("R28 (T45) a case whose project became a counsel matter after an entry was placed still answers it (R14, R15); its marks are still read (R27)", async () => {
  const w = seeded();
  const { posted } = await fileAndPlace(w);
  const e = file(w).entry;
  w.docket.docketPressure({ entry: e, pressure: { kind: "legal" }, author: B, viewer: B });
  const pubBefore = await w.docket.docketPublic({ case: CASE });
  w.roster.scopes.set(w.P, "counsel_matter");
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(pub, pubBefore, "every public entry still answered, unchanged");
  assert.equal(pub.entries[0].seq, posted.seq);
  assert.match(await w.docket.docketFeed({ case: CASE }), /#1 response/);
  assert.equal(w.docket.lastEntryOf({ case: CASE }), "2026-10-01");
  assert.equal(w.docket.docketPressureMarks({ kind: "legal" }).marks[0].entry, e, "a hold can still be placed from the mark");
  assert.equal(w.docket.docketPressureOf({ entry: e, viewer: A }).kind, "legal");
  assert.equal(w.docket.docketOf({ case: CASE, viewer: A }).ok, true, "the members' read stands");
});
