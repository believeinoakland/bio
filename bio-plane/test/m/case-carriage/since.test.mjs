/* case-carriage — what lapsed since an instant (R19–R21; T46, N907, K2833, K2949), the three reads `case-check` R2's
   latch asks over the interval from a check's `checked_at` through the read. For each read: a lapse made after `since`
   and undone before the read answers the row, its control (no lapse in the interval) answers none, with nothing changed
   since `since` it answers exactly what R4, R5 or R13 answers at the read, and its fail-closed arms. `accepted-work`,
   `sources` and `doc-clean` are the real modules; what case-import registers is the fixture's stand-in (`w.importer`).
   (T47; N947) The flags' history (accepted-work R9) and the instants a source changed (sources R20) latch a flag opened
   and cleared, and a consent withdrawn and given again, inside the interval. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseFm, caseText, makePng, V, NOW, sha } from "./fixture.mjs";
import { pdf } from "../doc-clean/fixtures.mjs";
import { CaseCarriage, COPY_CLEANED_LABEL, OBSCURED_LABEL, COPY_CHANGED_SINCE, MARKS_LAPSED_MAX }
  from "../../../src/case-carriage/index.mjs";
import { sourceStatement, unnamedSourceStatement, sourceRowsStanding } from "../../../src/case-grammar/index.mjs";

/* `since` spellings that are not record-core's instant (its R47), each answering fail closed */
const NOT_INSTANTS = [undefined, null, "", "  ", 42, Date.parse(NOW), "2026-09-28", "2026-09-28T01:30:00+00:00",
                      "2026-09-28T01:30:00.5Z", "2026-02-30T01:30:00Z", "2026-09-28 01:30:00Z", { at: NOW }, "yesterday"];

/* ---------------------------------------------------------------- R19 */

const IMP = "a".repeat(64);
const REF = `imported:${IMP}/INQ-2026-0042-their-finding`;
const REF2 = `imported:${"c".repeat(64)}/INQ-2026-0043-another`;
const F = "INQ-2026-0001";
const awRow = (over = {}) => ({ member: F, leg_of: F, ref: REF, group: "other-group", case: "CASE-2026-0042", edition: 2,
  finding: "INQ-2026-0042-their-finding", manifest_sha: "b".repeat(64),
  pair: { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } }, result: "recreated", gaps: [],
  accepted_by: V("olive"), accepted_at: NOW, reason: "we checked it", ...over });
const flagRow = (flag, over = {}) => ({ ref: REF, edition: 2, flag, issue: "a date is wrong", flagged_at: NOW, words: "noted",
  acknowledged_by: V("olive"), acknowledged_at: NOW, ...over });
const accepted = (a, edition = a.edition) => ({ ref: a.ref, import: IMP, group: "other-group", case: "CASE-2026-0042", edition,
  finding: "INQ-2026-0042-their-finding", manifest_sha: "b".repeat(64), result: "recreated", pair: { capture: "B" },
  acceptance: { by: V("olive"), at: NOW, reason: "we checked it", checked: "all of it", gaps: null } });
const noFlags = () => ({ flags: [], complete: true });
/* case-import's withdrawal record (accepted-work R1): one withdrawal of the acceptances of `refs` at `edition` */
const withdrawal = (n, at, { refs = [REF], edition = 2 } = {}) => ({ withdrawal: `WITHDRAWAL-${n}`, import: IMP, edition, refs, at });
const history = (list) => () => ({ withdrawals: list, cursor: null });
const SINCE = "2026-09-28T01:30:00.000Z";

test("R19 acceptedWorkLapsedSince: an acceptance withdrawn after `since` and accepted again before the read answers the row withdrawn, though R4 reads it in force; its control (the withdrawal before `since`, or of another edition or ref) answers null; writes nothing", () => {
  const w = world();
  let list = [withdrawal(1, "2026-09-28T02:00:00.000Z")];
  const calls = w.importer({ finding: (a) => accepted(a), openFlags: noFlags, withdrawals: () => ({ withdrawals: list, cursor: null }) });
  const fm = caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })] });
  const before = w.snapshot();
  assert.equal(w.cc.acceptedWorkLapsed(fm, "olive"), null, "R4 at the read: the acceptance stands again");
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] });
  assert.deepEqual(calls.filter((c) => c[0] === "withdrawals"), [["withdrawals", { after: null, limit: 1000 }]],
                   "the history is read once, from its start, as accepted-work R2 pages it");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* a withdrawal at `since` itself is not known to precede the check */
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", "2026-09-28T02:00:00Z"), { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] });
  /* controls */
  assert.equal(w.cc.acceptedWorkLapsedSince(fm, "olive", "2026-09-28T02:00:00.001Z"), null, "the withdrawal before since");
  list = [withdrawal(1, "2026-09-28T02:00:00.000Z", { edition: 3 }), withdrawal(2, "2026-09-28T02:10:00.000Z", { refs: ["imported:other"] })];
  assert.equal(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), null, "another edition, another ref");
  list = [withdrawal(1, "2026-09-28T02:00:00.000Z", { refs: ["imported:other", REF2] })];
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), { withdrawn: [{ ref: REF2, edition: 2 }], undisclosed: [] },
                   "a withdrawal naming several refs names each");
  /* a withdrawal whose instant cannot be read counts as after since (fail closed) */
  list = [withdrawal(1, "not an instant")];
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] });
});

test("R19 with nothing withdrawn since `since`, acceptedWorkLapsedSince answers exactly what R4 answers at the read: null, withdrawn rows, undisclosed flags open now, at most 200", () => {
  const setups = [
    ["every row stands", { finding: (a) => accepted(a), openFlags: noFlags }],
    ["one acceptance gone now", { finding: (a) => (a.ref === REF2 ? null : accepted(a)), openFlags: noFlags }],
    ["a flag open now, undisclosed", { finding: (a) => accepted(a), openFlags: () => ({ flags: [{ flag: "FLAG-2", issue: "b" }, { flag: "FLAG-1", issue: "a" }], complete: true }) }],
    ["flags unreadable", { finding: (a) => accepted(a), openFlags: () => ({ unreadable: true }) }],
    ["205 open flags", { finding: (a) => accepted(a), openFlags: () => ({ flags: Array.from({ length: 205 }, (_, i) => ({ flag: `F-${i}`, issue: "x" })), complete: true }) }],
  ];
  for (const [label, state] of setups) {
    const w = world();
    w.importer({ ...state, withdrawals: history([withdrawal(1, "2026-09-28T01:00:00.000Z")]) });
    const fm = caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 }), awRow({ edition: 3 })], acceptedWorkFlags: [flagRow("FLAG-1")] });
    const now = w.cc.acceptedWorkLapsed(fm, "olive");
    assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), now, label);
    if (label === "205 open flags") assert.equal(now.undisclosed.length, 200);
  }
  /* withdrawn since and open now together: one row each way, in the block's order */
  const w = world();
  w.importer({ finding: (a) => accepted(a), openFlags: (a) => ({ flags: a.ref === REF2 ? [{ flag: "FLAG-7", issue: "g" }] : [], complete: true }),
               withdrawals: history([withdrawal(1, "2026-09-28T02:00:00.000Z")]) });
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })] }), "olive", SINCE),
                   { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [{ ref: REF2, edition: 2, flag: "FLAG-7", issue: "g" }] });
});

test("R19 the withdrawal history is read whole, page by page through its cursor; a withdrawal on a later page answers the row", () => {
  const w = world();
  const pages = { null: { withdrawals: [withdrawal(1, "2026-09-28T01:00:00.000Z")], cursor: "WITHDRAWAL-1" },
                  "WITHDRAWAL-1": { withdrawals: [withdrawal(2, "2026-09-28T02:00:00.000Z")], cursor: null } };
  const calls = w.importer({ finding: (a) => accepted(a), openFlags: noFlags, withdrawals: (a) => pages[String(a.after)] });
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(caseFm({ acceptedWork: [awRow()] }), "olive", SINCE),
                   { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] });
  assert.deepEqual(calls.filter((c) => c[0] === "withdrawals").map((c) => c[1]),
                   [{ after: null, limit: 1000 }, { after: "WITHDRAWAL-1", limit: 1000 }]);
});

test("R19 fail closed: a withdrawal history that cannot be read whole, or a `since` that is not record-core's instant, answers every row of the block withdrawn; a block stating no row answers null, asking nothing", () => {
  const fm = caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 }), awRow()] });
  const all = { withdrawn: [{ ref: REF, edition: 2 }, { ref: REF2, edition: 2 }], undisclosed: [] };
  const histories = [
    ["throws", () => { throw new Error("down"); }],
    ["answers later (a promise: unreadable)", async () => ({ withdrawals: [], cursor: null })],
    ["null", () => null],
    ["not an object", () => "none"],
    ["withdrawals not a list", () => ({ withdrawals: "none", cursor: null })],
    ["a withdrawal not an object", () => ({ withdrawals: [null], cursor: null })],
    ["a withdrawal's refs not a list", () => ({ withdrawals: [{ ...withdrawal(1, NOW), refs: REF }], cursor: null })],
    ["a cursor that does not move", (a) => ({ withdrawals: [withdrawal(1, NOW)], cursor: a.after ?? "WITHDRAWAL-1" })],
    ["an empty page with a cursor", () => ({ withdrawals: [], cursor: "WITHDRAWAL-9" })],
    ["a cursor that never ends", (a) => { const n = Number(String(a.after ?? "WITHDRAWAL-0").split("-")[1]) + 1;
                                          return { withdrawals: [withdrawal(n, NOW)], cursor: `WITHDRAWAL-${n}` }; }],
  ];
  for (const [label, withdrawals] of histories) {
    const w = world();
    w.importer({ finding: (a) => accepted(a), openFlags: noFlags, withdrawals });
    assert.equal(w.cc.acceptedWorkLapsed(fm, "olive"), null, `${label}: R4 reads every row in force`);
    assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), all, label);
  }
  /* nothing registered with accepted-work: absent, every row withdrawn (as R4) */
  assert.deepEqual(world().cc.acceptedWorkLapsedSince(fm, "olive", SINCE), all);
  /* `since` not an instant */
  const w = world();
  w.importer({ finding: (a) => accepted(a), openFlags: noFlags });
  for (const since of NOT_INSTANTS) assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", since), all, String(since));
  /* controls: both of record-core's spellings are instants; an empty history withdraws nothing */
  assert.equal(w.cc.acceptedWorkLapsedSince(fm, "olive", "2026-09-28T01:30:00Z"), null);
  assert.equal(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), null);
  /* no row stated: null, nothing asked */
  const bare = world();
  const calls = bare.importer({ finding: (a) => accepted(a), openFlags: noFlags });
  for (const doc of [caseFm({}), caseFm({ acceptedWorkFlags: [flagRow("FLAG-1")] }), null, undefined, "x", {}])
    for (const since of [SINCE, null]) assert.equal(bare.cc.acceptedWorkLapsedSince(doc, "olive", since), null);
  assert.deepEqual(calls, []);
});

/* accepted-work R9's history entry: a flag on REF's edition 2, opened at `opened`, cleared at `cleared` (null: open) */
const flagHist = (flag, opened, cleared, issue = "a date is wrong") => ({ flag, finding: "INQ-2026-0042-their-finding", issue,
                                                                         opened_at: opened, cleared_at: cleared });

test("R19 (T47; N947) a flag opened after `since` and cleared before the read answers undisclosed through accepted-work's flagHistoryOn (its R9), as the signer, each distinct (ref, edition) asked once; the same flag disclosed in the block answers none; a flag both open now and in the history is named once", () => {
  const w = world();
  const cleared = flagHist("FLAG-5", "2026-09-28T02:00:00.000Z", "2026-09-28T02:30:00.000Z", "the count was wrong");
  const calls = w.importer({ finding: (a) => accepted(a), openFlags: noFlags,
    flagHistory: (a) => ({ flags: a.ref === REF ? [cleared] : [], complete: true }) });
  const fm = caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 }), awRow()] });
  const before = w.snapshot();
  assert.equal(w.cc.acceptedWorkLapsed(fm, "olive"), null, "R4 at the read: no flag is open");
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE),
                   { withdrawn: [], undisclosed: [{ ref: REF, edition: 2, flag: "FLAG-5", issue: "the count was wrong" }] });
  assert.deepEqual(calls.filter((c) => c[0] === "flagHistory").map((c) => c[1]),
                   [{ ref: REF, edition: 2, since: SINCE, viewer: "member:olive" }, { ref: REF2, edition: 2, since: SINCE, viewer: "member:olive" }],
                   "once per distinct (ref, edition), with since, as the signer");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* control: the flag disclosed in the block answers none */
  assert.equal(w.cc.acceptedWorkLapsedSince(caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })], acceptedWorkFlags: [flagRow("FLAG-5")] }),
                                            "olive", SINCE), null);
  /* a flag open now (R4) and in the history is named once, R4's first */
  const o = world();
  o.importer({ finding: (a) => accepted(a), openFlags: () => ({ flags: [{ flag: "FLAG-1", issue: "a" }], complete: true }),
               flagHistory: () => ({ flags: [flagHist("FLAG-1", NOW, null, "a"), flagHist("FLAG-9", NOW, "2026-09-28T02:00:00.000Z", "i")], complete: true }) });
  assert.deepEqual(o.cc.acceptedWorkLapsedSince(caseFm({ acceptedWork: [awRow()] }), "olive", SINCE),
                   { withdrawn: [], undisclosed: [{ ref: REF, edition: 2, flag: "FLAG-1", issue: "a" }, { ref: REF, edition: 2, flag: "FLAG-9", issue: "i" }] });
});

test("R19 (T47; N947) fail closed: a flags' history answering absent (none registered), unreadable, not an object, complete not true or flags not a list answers that (ref, edition) withdrawn, its flags not named; every other row is judged as before", () => {
  const fm = caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })] });
  const histories = [
    ["none registered (absent)", null],
    ["unreadable", () => ({ unreadable: true })],
    ["throws (unreadable)", () => { throw new Error("down"); }],
    ["answers later (unreadable)", async () => ({ flags: [], complete: true })],
    ["null", () => null],
    ["not an object", () => "none"],
    ["not complete", () => ({ flags: [], complete: false })],
    ["flags not a list", () => ({ flags: "none", complete: true })],
  ];
  for (const [label, h] of histories) {
    const w = world();
    const fh = h === null ? null : (a) => (a.ref === REF ? h(a) : { flags: [], complete: true });
    w.importer({ finding: (a) => accepted(a), openFlags: (a) => ({ flags: a.ref === REF ? [{ flag: "FLAG-1", issue: "a" }] : [], complete: true }),
                 flagHistory: fh });
    const expected = h === null ? { withdrawn: [{ ref: REF, edition: 2 }, { ref: REF2, edition: 2 }], undisclosed: [] }
                                : { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] };
    assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), expected, label);
  }
  /* control: the same history readable answers the open flag undisclosed and withdraws nothing */
  const w = world();
  w.importer({ finding: (a) => accepted(a), openFlags: (a) => ({ flags: a.ref === REF ? [{ flag: "FLAG-1", issue: "a" }] : [], complete: true }),
               flagHistory: (a) => ({ flags: a.ref === REF ? [flagHist("FLAG-1", NOW, null, "a")] : [], complete: true }) });
  assert.deepEqual(w.cc.acceptedWorkLapsedSince(fm, "olive", SINCE), { withdrawn: [], undisclosed: [{ ref: REF, edition: 2, flag: "FLAG-1", issue: "a" }] });
});

/* ---------------------------------------------------------------- R20 */

const PHOTO = "INFO-2026-0020-photo";
const OLIVE = V("olive");
const docRow = (ref, s, over = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                         included: true, rests_under: "load_bearing", ...over });
const obscuredRow = (ref, s, copy) => docRow(ref, s, { included: false, obscured: { copy, label: OBSCURED_LABEL } });
const copyRow = (ref, s, copy) => docRow(ref, s, { included: false, obscured: { copy, label: COPY_CLEANED_LABEL } });
const area = (rect, kind = "person") => ({ rect, kind });
const changed = (ref, s, kind = "photo") => ({ ref, sha: s, kind, why: COPY_CHANGED_SINCE });

async function photoScene() {
  const w = world();
  w.member("olive");
  const p = w.photo(PHOTO, makePng(20, 20));
  const r = await w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 6, 6])], by: OLIVE });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { w, p, copy: r.copy.sha256 };
}

test("R20 marksLapsedSince: a mark added after `since` and withdrawn before the read answers the row (the copy changed since), though the stated copy is derived again and R13 reads it standing; its control (nothing since, or an act whose copy is the stated one) answers none; writes nothing", async () => {
  const { w, p, copy } = await photoScene();
  const fm = caseFm({ materials: [obscuredRow(PHOTO, p, copy)] });
  assert.deepEqual(w.cc.marksLapsedSince(fm, SINCE), [], "nothing since");
  w.clock.now = "2026-09-28T02:00:00Z";
  const added = await w.cc.obscureMark({ captureSha: p, areas: [area([10, 10, 14, 14], "plate")], by: OLIVE });
  assert.notEqual(added.copy.sha256, copy);
  w.clock.now = "2026-09-28T02:30:00Z";
  const back = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: added.mark, reason: "the plate is the group's own", by: OLIVE });
  assert.equal(back.copy.sha256, copy, "derived again at the stated digest");
  const before = w.snapshot();
  assert.deepEqual(w.cc.marksLapsed(fm), [], "R13 at the read: it stands");
  assert.deepEqual(w.cc.marksLapsedSince(fm, SINCE), [changed(PHOTO, p)]);
  assert.deepEqual(w.cc.marksLapsedSince(fm, "2026-09-28T02:00:00.000Z"), [changed(PHOTO, p)], "an act at since itself counts");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* controls: since after both acts; an act after since whose copy is the stated one ("nothing to obscure" adds no area) */
  assert.deepEqual(w.cc.marksLapsedSince(fm, "2026-09-28T02:45:00Z"), []);
  w.clock.now = "2026-09-28T03:00:00Z";
  const same = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(same.copy.sha256, copy);
  assert.deepEqual(w.cc.marksLapsedSince(fm, "2026-09-28T02:45:00Z"), [], "the copy after the act is the one stated");
  /* a withdrawal after since that leaves no mark standing leaves no copy: other than the stated one */
  const g = await photoScene();
  g.w.clock.now = "2026-09-28T02:00:00Z";
  await g.w.cc.obscureMarkWithdraw({ captureSha: g.p, mark: 1, reason: "drawn in error", by: OLIVE });
  const gfm = caseFm({ materials: [obscuredRow(PHOTO, g.p, g.copy)] });
  assert.deepEqual(g.w.cc.marksLapsedSince(gfm, SINCE), g.w.cc.marksLapsed(gfm), "lapsed at the read too: R13's row is answered");
  assert.equal(g.w.cc.marksLapsedSince(gfm, SINCE).length, 1);
});

test("R20 a member document's copy other than the stated one after `since` answers the row (kind document), though the stated copy is recorded again before the read; its control answers none", async () => {
  const w = world();
  const b = Buffer.from(pdf()), s = sha(b), id = "INFO-2026-0101-knock", path = "snapshots/file.pdf";
  w.doc(id, { text: `the page about ${id}` });
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`, s, id, path, b.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`, id, path, s, b.length, s);
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
    JSON.stringify({ documents: [{ file: path, capture: { method: "acquire", sha256: s, encoding: "binary", bytes: b.length, content_type: "application/pdf" } }] }), id);
  w.evidence.held.set(s, b);
  w.receipt(s, "doorbell");
  await w.cc.copyBatch({});
  const { state, copy } = w.cc.documentCopy(s);
  assert.equal(state, "copy");
  const fm = caseFm({ materials: [copyRow("K", s, copy)] });
  assert.deepEqual(w.cc.marksLapsedSince(fm, SINCE), [], "nothing since");
  /* two later outcomes, as copyBatch records them (append-only, R12): another copy, then the stated one again */
  const record = (sha256, at) => w.st.sql.exec(`INSERT INTO document_copies (capture, state, sha256, bytes, at) VALUES (?, 'copy', ?, 1, ?)`, s, sha256, at);
  record(sha("another copy"), "2026-09-28T02:00:00Z");
  record(copy, "2026-09-28T02:30:00Z");
  assert.deepEqual(w.cc.marksLapsed(fm), [], "R13 at the read: it stands");
  assert.deepEqual(w.cc.marksLapsedSince(fm, SINCE), [changed("K", s, "document")]);
  assert.deepEqual(w.cc.marksLapsedSince(fm, "2026-09-28T02:15:00Z"), [], "control: since after the other copy");
  w.st.sql.exec(`INSERT INTO document_copies (capture, state, refused_code, at) VALUES (?, 'refused', 'IMAGE_NOT_CLEANABLE', ?)`, s, "2026-09-28T03:00:00Z");
  assert.equal(w.cc.marksLapsedSince(fm, "2026-09-28T02:15:00Z").length, 1, "a refusal since is no copy, so the row lapses (also at the read)");
});

test("R20 with nothing changed since `since`, marksLapsedSince answers exactly what R13 answers at the read, every kind of row in the block's order; at most 200", async () => {
  const { w, p, copy } = await photoScene();
  const plain = w.photo("INFO-2026-0021-plain", makePng(8, 8, () => [10, 200, 10]));
  const doc = w.doc("INFO-2026-0001-minutes");
  w.clock.now = "2026-09-28T02:00:00Z";
  const fm = caseFm({ materials: [docRow("INFO-2026-0021-plain", plain), obscuredRow(PHOTO, p, sha("an older copy")), docRow("D", doc),
                                  obscuredRow(PHOTO, p, copy)] });
  const now = w.cc.marksLapsed(fm);
  assert.deepEqual(now.map((x) => x.ref), ["INFO-2026-0021-plain", PHOTO]);
  assert.deepEqual(w.cc.marksLapsedSince(fm, SINCE), now);
  const many = caseFm({ materials: Array.from({ length: 205 }, (_, i) => docRow(`INFO-2026-${1000 + i}-x`, plain)) });
  assert.equal(MARKS_LAPSED_MAX, 200);
  assert.equal(w.cc.marksLapsedSince(many, SINCE).length, 200);
  for (const doc of [null, undefined, 42, "x", {}]) assert.deepEqual(w.cc.marksLapsedSince(doc, SINCE), []);
});

test("R20 fail closed: a `since` that is not record-core's instant answers every row stating `obscured` lapsed; a history that cannot be read answers the row lapsed; never throws", async () => {
  const { w, p, copy } = await photoScene();
  const doc = w.doc("INFO-2026-0001-minutes");
  const fm = caseFm({ materials: [obscuredRow(PHOTO, p, copy), docRow("D", doc)] });
  for (const since of NOT_INSTANTS) {
    const r = w.cc.marksLapsedSince(fm, since);
    assert.deepEqual(r.map((x) => [x.ref, x.sha, x.kind]), [[PHOTO, p, "photo"]], String(since));
    assert.match(r[0].why, /cannot be read/);
  }
  assert.deepEqual(w.cc.marksLapsedSince(fm, SINCE), [], "control: an instant, nothing since");
  w.st.sql.exec(`DROP TABLE photo_mark_withdrawals`);
  const r = w.cc.marksLapsedSince(fm, SINCE);
  assert.deepEqual(r.map((x) => [x.ref, x.kind]), [[PHOTO, "photo"]]);
  assert.match(r[0].why, /could not be read/);
});

/* ---------------------------------------------------------------- R21 */

const CAP = sha("the knocked bytes");

function sourcesWorld() {
  const w = world();
  w.member("olive");
  const source = w.knock(CAP, { pseudonym: "heron" });
  return { w, source };
}
function disclose(w, source, { attribute = "employer", value = "the water board" } = {}) {
  const r = w.src.recordDisclosure({ source, revealed: { kind: "attribute", attribute, value },
    how: "self", knownTo: "group", evidence: "said so at the door", recorded: true, sight: ["olive"], by: V("olive") });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.src.recordConsent({ source, entry: r.entry, audience: "public", evidence: "signed form", by: V("olive") }).ok, true);
  return r.entry;
}
function statedRows(w, capture, source) {
  const p = w.src.publishableAt({ source, audience: "public", at: w.clock.now });
  assert.equal(p.ok, true);
  const received = w.row(`SELECT received FROM source_knocks WHERE capture_sha=? ORDER BY received, knock_id`, capture).received;
  return p.entries.length ? p.entries.map((e) => ({ capture, stated: sourceStatement(e), basis: e.basis }))
                          : [{ capture, stated: unnamedSourceStatement({ capture, received }), basis: null }];
}

test("R21 sourcesLapsedSince: a row that did not hold at `since` though it holds at the read is answered, and one that holds at `since` but not at the read; its control (holding at both) answers []; with nothing changed it answers what R5 answers at the read; writes nothing", () => {
  const { w, source } = sourcesWorld();
  w.clock.now = "2026-09-28T01:10:00Z";
  const employer = disclose(w, source);
  disclose(w, source, { attribute: "role", value: "clerk" });
  w.clock.now = "2026-09-28T01:20:00Z";
  const rows = statedRows(w, CAP, source);
  assert.equal(rows.length, 2);
  const text = caseText({ sources: rows });
  const before = w.snapshot();
  assert.deepEqual(w.cc.sourcesLapsedSince(text, SINCE), [], "every row holds at since and at the read");
  assert.deepEqual(w.cc.sourcesLapsedSince(text, SINCE), w.cc.sourcesLapsed(text, w.clock.now));
  /* at since, before the consents were recorded, neither row held: each is answered, as R5 judges it there */
  const early = "2026-09-28T01:05:00Z";
  assert.deepEqual(w.cc.sourcesLapsed(text, w.clock.now), []);
  assert.deepEqual(w.cc.sourcesLapsedSince(text, early), w.cc.sourcesLapsed(text, early));
  assert.equal(w.cc.sourcesLapsedSince(text, early).length, 2);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* a consent withdrawn after since: lapsed at the read */
  w.clock.now = "2026-09-28T02:00:00Z";
  assert.equal(w.src.withdrawConsent({ source, entry: employer, audience: "public", by: V("olive") }).ok, true);
  w.clock.now = "2026-09-28T03:00:00Z";
  const lapsed = w.cc.sourcesLapsedSince(text, SINCE);
  assert.deepEqual(lapsed.map((x) => [x.capture, x.stated]), [[CAP, "attribute employer: the water board"]]);
  assert.deepEqual(lapsed, w.cc.sourcesLapsed(text, w.clock.now), "nothing lapsed at since: exactly R5 at the read");
  /* the read's instant is the module's clock: judged at an earlier read, the row still held */
  assert.deepEqual(w.cc.sourcesLapsed(text, "2026-09-28T01:45:00Z"), []);
});

test("R21 fail closed: a source that cannot be read answers its rows lapsed; a `since` that is not record-core's instant answers every row lapsed; a document stating no sources row answers [], asking nothing", () => {
  const { w, source } = sourcesWorld();
  disclose(w, source);
  const rows = statedRows(w, CAP, source);
  const text = caseText({ sources: [...rows, { capture: sha("no knock"), stated: "an unnamed source", basis: null }] });
  const every = sourceRowsStanding([...rows, { capture: sha("no knock"), stated: "an unnamed source", basis: null }], () => null);
  assert.deepEqual(w.cc.sourcesLapsedSince(text, NOW).map((x) => x.stated), ["an unnamed source"], "control: a capture no knock stands behind lapses (R5)");
  for (const since of NOT_INSTANTS) assert.deepEqual(w.cc.sourcesLapsedSince(text, since), every, String(since));
  for (const [label, publishableAt] of [["not ok", () => ({ ok: false })], ["throws", () => { throw new Error("down"); }],
                                        ["no entries", () => ({ ok: true, entries: "x" })]]) {
    const cc = new CaseCarriage({ storage: w.st, record: w.record, now: () => w.clock.now, sources: { publishableAt } });
    assert.deepEqual(cc.sourcesLapsedSince(text, NOW), every, label);
  }
  /* answered at since only: a source readable at the read but not at since */
  const cc = new CaseCarriage({ storage: w.st, record: w.record, now: () => w.clock.now,
    sources: { publishableAt: (a) => (a.at === "2026-09-28T00:59:00Z" ? null : w.src.publishableAt(a)),
               sourceChangesSince: (a) => w.src.sourceChangesSince(a) } });
  assert.deepEqual(cc.sourcesLapsedSince(text, "2026-09-28T00:59:00Z"), every);
  assert.deepEqual(cc.sourcesLapsedSince(text, NOW).map((x) => x.stated), ["an unnamed source"]);
  const asked = [];
  const quiet = new CaseCarriage({ storage: w.st, record: w.record, sources: { publishableAt: (a) => { asked.push(a); return null; } } });
  for (const doc of [caseText({ sources: [] }), caseText({}), "", null, undefined, 42])
    for (const since of [SINCE, null]) assert.deepEqual(quiet.sourcesLapsedSince(doc, since), []);
  assert.deepEqual(asked, []);
});

test("R21 (T47; N947) a consent withdrawn and given again between `since` and the read answers the row lapsed, judged at each instant sources' sourceChangesSince (its R20) names; with no change in the interval it answers exactly what it answers at `since` and at the read; writes nothing", () => {
  const { w, source } = sourcesWorld();
  w.clock.now = "2026-09-28T01:10:00Z";
  const employer = disclose(w, source);
  disclose(w, source, { attribute: "role", value: "clerk" });
  w.clock.now = "2026-09-28T01:20:00Z";
  const text = caseText({ sources: statedRows(w, CAP, source) });
  w.clock.now = "2026-09-28T02:00:00Z";
  assert.equal(w.src.withdrawConsent({ source, entry: employer, audience: "public", by: V("olive") }).ok, true);
  w.clock.now = "2026-09-28T02:30:00Z";
  assert.equal(w.src.recordConsent({ source, entry: employer, audience: "public", evidence: "signed again", by: V("olive") }).ok, true);
  w.clock.now = "2026-09-28T03:00:00Z";
  assert.deepEqual(w.cc.sourcesLapsed(text, w.clock.now), [], "R5 at the read: it holds again");
  assert.deepEqual(w.cc.sourcesLapsed(text, SINCE), [], "R5 at since: it held");
  const before = w.snapshot();
  const lapsed = w.cc.sourcesLapsedSince(text, SINCE);
  assert.deepEqual(lapsed.map((x) => [x.capture, x.stated]), [[CAP, "attribute employer: the water board"]]);
  assert.deepEqual(lapsed, w.cc.sourcesLapsed(text, "2026-09-28T02:00:00.000Z"), "as R5 judges it at the withdrawal's instant");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* control: no change in the interval answers exactly what it answers at since and at the read */
  assert.deepEqual(w.cc.sourcesLapsedSince(text, "2026-09-28T02:45:00Z"), []);
  assert.deepEqual(w.cc.sourcesLapsedSince(text, "2026-09-28T02:45:00Z"), w.cc.sourcesLapsed(text, "2026-09-28T02:45:00Z"));
});

test("R21 (T47; N947) a source's changes are read whole through `next` until not truncated, a change on a later page judged; a source whose changes cannot be read (NO_SUCH_SOURCE, not ok, changes null, since_invalid, throws, a cursor that does not move) answers its rows lapsed though they hold at since and at the read", () => {
  const { w, source } = sourcesWorld();
  w.clock.now = "2026-09-28T01:10:00Z";
  const employer = disclose(w, source);
  const rows = statedRows(w, CAP, source);
  const text = caseText({ sources: rows });
  w.clock.now = "2026-09-28T02:00:00Z";
  w.src.withdrawConsent({ source, entry: employer, audience: "public", by: V("olive") });
  w.clock.now = "2026-09-28T02:30:00Z";
  w.src.recordConsent({ source, entry: employer, audience: "public", evidence: "signed again", by: V("olive") });
  w.clock.now = "2026-09-28T03:00:00Z";
  const real = w.src.sourceChangesSince({ source, since: SINCE });
  assert.equal(real.changes.length, 2);
  /* page one names only the consent given again; the withdrawal is on page two */
  const asked = [];
  const paged = (a) => { asked.push(a);
    return a.after === undefined ? { ...real, changes: [real.changes[1]], truncated: true, next: "c1" }
                                 : { ...real, changes: [real.changes[0]], truncated: false, next: null }; };
  const make = (sourceChangesSince) => new CaseCarriage({ storage: w.st, record: w.record, now: () => w.clock.now,
    sources: { publishableAt: (a) => w.src.publishableAt(a), sourceChangesSince } });
  assert.deepEqual(make(paged).sourcesLapsedSince(text, SINCE), rows.map((r) => ({ capture: r.capture, stated: r.stated, basis: r.basis })));
  assert.deepEqual(asked.map((a) => [a.source, a.since, a.after]), [[source, SINCE, undefined], [source, SINCE, "c1"]]);
  /* fail closed, though the row holds at since and at the read */
  const every = sourceRowsStanding(rows, () => null);
  const quiet = { ok: true, source, since: SINCE, at: w.clock.now, changes: [], limit: 1000, truncated: false, next: null };
  assert.deepEqual(make(() => quiet).sourcesLapsedSince(text, SINCE), [], "control: no change answers none");
  for (const [label, fn] of [["NO_SUCH_SOURCE", () => ({ ok: false, reason: "NO_SUCH_SOURCE" })], ["not ok", () => ({ ok: false })],
                             ["changes null", () => ({ ...quiet, changes: null })], ["since_invalid", () => ({ ok: true, source, changes: null, since_invalid: true })],
                             ["throws", () => { throw new Error("down"); }], ["null", () => null],
                             ["a change with no instant", () => ({ ...quiet, changes: [{ at: "later", act: "consent", entry: "E" }] })],
                             ["a cursor that does not move", () => ({ ...quiet, changes: [real.changes[1]], truncated: true, next: "c9" })],
                             ["truncated with no cursor", () => ({ ...quiet, changes: [real.changes[1]], truncated: true, next: null })],
                             ["none offered", undefined]])
    assert.deepEqual(make(fn).sourcesLapsedSince(text, SINCE), every, label);
});
