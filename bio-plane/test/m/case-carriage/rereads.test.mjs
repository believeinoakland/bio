/* case-carriage — the re-reads at the commit: another group's accepted work (R4; N522, DEC-96 items 1, 4) and what may
   be published of each source a document states (R5; N364, DEC-78 item 5(d)). Copied in meaning from `publication`
   R59's and R51's arms (`test/m/publication/t28.test.mjs`, `sources.test.mjs`), here at this module's interface, with a
   negative control for each withdrawn and undisclosed arm and each lapse. `accepted-work` and `sources` are the real
   modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseFm, caseText, V, NOW, sha } from "./fixture.mjs";
import { CaseCarriage, UNDISCLOSED_MAX } from "../../../src/case-carriage/index.mjs";
import { sourceStatement, unnamedSourceStatement } from "../../../src/case-grammar/index.mjs";

/* ---------------------------------------------------------------- R4 */

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

test("R4 acceptedWorkLapsed asks accepted-work once per distinct (ref, edition) as the signer's member: every acceptance in force and every open flag disclosed answers null; writes nothing", () => {
  const w = world();
  const calls = w.importer({ finding: (a) => accepted(a), openFlags: () => ({ flags: [{ flag: "FLAG-1", issue: "x", at: NOW }], complete: true }) });
  const fm = caseFm({ acceptedWork: [awRow(), awRow({ member: "INQ-2026-0002" }), awRow({ edition: 3 })],
                      acceptedWorkFlags: [flagRow("FLAG-1"), flagRow("FLAG-1", { edition: 3 })] });
  const before = w.snapshot();
  assert.equal(w.cc.acceptedWorkLapsed(fm, "olive"), null);
  assert.deepEqual(calls, [["finding", { ref: REF, edition: 2, viewer: V("olive") }], ["openFlags", { ref: REF, edition: 2, viewer: V("olive") }],
                           ["finding", { ref: REF, edition: 3, viewer: V("olive") }], ["openFlags", { ref: REF, edition: 3, viewer: V("olive") }]]);
  calls.length = 0;
  assert.equal(w.cc.acceptedWorkLapsed(fm, V("olive")), null, "a signer given as member:<id> is read as that member");
  assert.equal(calls[0][1].viewer, V("olive"));
  assert.deepEqual(w.snapshot(), before);
  /* a document stating no accepted work reads nothing */
  calls.length = 0;
  for (const doc of [caseFm({}), caseFm({ acceptedWorkFlags: [flagRow("FLAG-1")] }), null, undefined, "x", {}])
    assert.equal(w.cc.acceptedWorkLapsed(doc, "olive"), null);
  assert.deepEqual(calls, []);
});

test("R4 a row is withdrawn when acceptedFinding answers null, absent, unreadable, no acceptance object, or another edition, or the read throws; each is answered, the rest of the rows still read", () => {
  const cases = [
    ["null", () => null],
    ["absent", () => ({ absent: true })],
    ["unreadable", () => ({ unreadable: true })],
    ["no acceptance", (a) => ({ ...accepted(a), acceptance: null })],
    ["an acceptance not an object", (a) => ({ ...accepted(a), acceptance: "yes" })],
    ["another edition", (a) => accepted(a, 3)],
    ["throws", () => { throw new Error("down"); }],
    ["not an object", () => "accepted"],
  ];
  for (const [label, finding] of cases) {
    const w = world();
    w.importer({ finding: (a) => (a.ref === REF2 ? accepted(a) : finding(a)), openFlags: noFlags });
    const r = w.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })] }), "olive");
    assert.deepEqual(r, { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] }, label);
  }
  /* negative control: the same rows, every acceptance in force */
  const w = world();
  w.importer({ finding: (a) => accepted(a), openFlags: noFlags });
  assert.equal(w.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })] }), "olive"), null);
  /* nothing registered with accepted-work: absent, so withdrawn */
  const bare = world();
  assert.deepEqual(bare.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [awRow()] }), "olive"),
                   { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] });
});

test("R4 a row is withdrawn when openFlagsOn answers not an object, absent, unreadable, complete not true, or flags not a list, or throws; then its flags are not read as undisclosed", () => {
  const cases = [
    ["null", () => null],
    ["a string", () => "flags"],
    ["absent", () => ({ absent: true, flags: [], complete: true })],
    ["unreadable", () => ({ unreadable: true, flags: [], complete: true })],
    ["incomplete", () => ({ flags: [{ flag: "FLAG-9", issue: "x" }], complete: false })],
    ["complete as a string", () => ({ flags: [], complete: "true" })],
    ["flags not a list", () => ({ flags: "none", complete: true })],
    ["throws", () => { throw new Error("down"); }],
  ];
  for (const [label, openFlags] of cases) {
    const w = world();
    w.importer({ finding: (a) => accepted(a), openFlags });
    assert.deepEqual(w.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [awRow()] }), "olive"),
                     { withdrawn: [{ ref: REF, edition: 2 }], undisclosed: [] }, label);
  }
});

test("R4 each open flag on a row's edition the flags block does not state is undisclosed {ref, edition, flag, issue}; a flag disclosed at another edition or ref is not disclosed; at most 200", () => {
  const w = world();
  let flags = [{ flag: "FLAG-1", issue: "a", at: NOW }, { flag: "FLAG-2", issue: "b", at: NOW }, { flag: "FLAG-3", issue: 7, at: NOW }];
  w.importer({ finding: (a) => accepted(a), openFlags: () => ({ flags, complete: true }) });
  const fm = caseFm({ acceptedWork: [awRow()],
                      acceptedWorkFlags: [flagRow("FLAG-1"), flagRow("FLAG-2", { edition: 3 }), flagRow("FLAG-3", { ref: REF2 })] });
  assert.deepEqual(w.cc.acceptedWorkLapsed(fm, "olive"), { withdrawn: [], undisclosed: [
    { ref: REF, edition: 2, flag: "FLAG-2", issue: "b" }, { ref: REF, edition: 2, flag: "FLAG-3", issue: null }] });
  /* negative control: every one disclosed */
  const all = caseFm({ acceptedWork: [awRow()], acceptedWorkFlags: [flagRow("FLAG-1"), flagRow("FLAG-2"), flagRow("FLAG-3")] });
  assert.equal(w.cc.acceptedWorkLapsed(all, "olive"), null);
  /* withdrawn and undisclosed together: one row's acceptance gone, another's flag undisclosed */
  const w2 = world();
  w2.importer({ finding: (a) => (a.ref === REF2 ? null : accepted(a)), openFlags: () => ({ flags: [{ flag: "FLAG-5", issue: "e" }], complete: true }) });
  assert.deepEqual(w2.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [awRow(), awRow({ ref: REF2 })] }), "olive"),
                   { withdrawn: [{ ref: REF2, edition: 2 }], undisclosed: [{ ref: REF, edition: 2, flag: "FLAG-5", issue: "e" }] });
  /* the cap: two rows' 205 open flags each name at most 200 */
  assert.equal(UNDISCLOSED_MAX, 200);
  flags = Array.from({ length: 205 }, (_, i) => ({ flag: `FLAG-${i}`, issue: "x", at: NOW }));
  const r = w.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [awRow(), awRow({ edition: 5 })] }), "olive");
  assert.deepEqual([r.withdrawn, r.undisclosed.length], [[], 200]);
  assert.deepEqual(r.undisclosed[0], { ref: REF, edition: 2, flag: "FLAG-0", issue: "x" });
});

/* ---------------------------------------------------------------- R5 */

const CAP = sha("the knocked bytes");
const CAP2 = sha("more knocked bytes");

function sourcesWorld() {
  const w = world();
  w.member("olive");
  const source = w.knock(CAP, { pseudonym: "heron" });
  return { w, source };
}
/* One disclosure, as a member records it (sources R2), and optionally its consent to the public (R7). */
function disclose(w, source, { kind = "attribute", attribute = "employer", value = "the water board", knownTo = "group",
                               evidence = "said so at the door", consent = true } = {}) {
  const r = w.src.recordDisclosure({ source, revealed: { kind, ...(kind === "attribute" ? { attribute } : {}), value },
    how: "self", knownTo, evidence, recorded: true, sight: ["olive"], by: V("olive") });
  assert.equal(r.ok, true, JSON.stringify(r));
  if (consent) assert.equal(w.src.recordConsent({ source, entry: r.entry, audience: "public", evidence: "signed form",
                                                  by: V("olive") }).ok, true);
  return r.entry;
}
/* What case-authoring writes for one capture: each entry publishableAt answers, or the unnamed statement. */
function statedRows(w, capture, source) {
  const p = w.src.publishableAt({ source, audience: "public", at: w.clock.now });
  assert.equal(p.ok, true);
  const received = w.row(`SELECT received FROM source_knocks WHERE capture_sha=? ORDER BY received, knock_id`, capture).received;
  return p.entries.length ? p.entries.map((e) => ({ capture, stated: sourceStatement(e), basis: e.basis }))
                          : [{ capture, stated: unnamedSourceStatement({ capture, received }), basis: null }];
}

test("R5 sourcesLapsed answers [] while every stated row still holds at `at`; a consent withdrawn since is answered lapsed (negative control); writes nothing", () => {
  const { w, source } = sourcesWorld();
  const employer = disclose(w, source);
  disclose(w, source, { attribute: "role", value: "clerk" });
  const rows = statedRows(w, CAP, source);
  assert.equal(rows.length, 2);
  const text = caseText({ sources: rows });
  assert.deepEqual(w.cc.sourcesLapsed(text, NOW), [], "every row holds");
  w.clock.now = "2026-09-28T02:00:00Z";
  assert.equal(w.src.withdrawConsent({ source, entry: employer, audience: "public", by: V("olive") }).ok, true);
  const before = w.snapshot();
  const lapsed = w.cc.sourcesLapsed(text, "2026-09-28T03:00:00Z");
  assert.deepEqual(lapsed.map((x) => [x.capture, x.stated]), [[CAP, "attribute employer: the water board"]]);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* judged at `at`: before the withdrawal it still held */
  assert.deepEqual(w.cc.sourcesLapsed(text, "2026-09-28T01:30:00Z"), []);
});

test("R5 every row is judged: each basis, the unnamed statement, several sources behind one capture first received first; each kind of row lapses alone", () => {
  const { w, source } = sourcesWorld();
  disclose(w, source, { kind: "name", value: "Pat Doe", knownTo: "public", evidence: { cite: "https://news.example/a" }, consent: false });
  const second = w.knock(CAP, { knockId: "KNOCK-9", pseudonym: "wren", received: "2026-09-28T01:30:00Z" });
  assert.notEqual(second, source);
  disclose(w, second, { attribute: "occupation", value: "engineer" });
  const other = w.knock(CAP2, { pseudonym: "finch" });
  disclose(w, other, { consent: false });
  const rows = [...statedRows(w, CAP, source), ...statedRows(w, CAP, second), ...statedRows(w, CAP2, other)];
  assert.deepEqual(rows.map((x) => x.basis), ["public_elsewhere", "consent", null]);
  assert.deepEqual(w.cc.sourcesLapsed(caseText({ sources: rows }), NOW), [], "every row holds");
  const lapses = (bad) => w.cc.sourcesLapsed(caseText({ sources: bad }), NOW).map((x) => x.stated);
  assert.deepEqual(lapses([{ ...rows[0], basis: "consent" }]), [rows[0].stated], "a basis it does not have");
  const stale = unnamedSourceStatement({ capture: CAP2, received: "2020-01-01T00:00:00Z" });
  assert.deepEqual(lapses([{ ...rows[2], stated: stale }]), [stale], "unnamed, at another receipt");
  assert.deepEqual(lapses([{ ...rows[2], capture: CAP }]), [rows[2].stated], "unnamed, but its capture has sources");
  assert.deepEqual(lapses([{ capture: sha("no knock"), stated: "an unnamed source", basis: null }]), ["an unnamed source"],
                   "a capture with no knock answers nothing, so its rows lapse");
  const none = sha("no knock");
  for (const received of [undefined, null, NOW]) {
    const unnamed = unnamedSourceStatement({ capture: none, received });
    assert.deepEqual(lapses([{ capture: none, stated: unnamed, basis: null }]), [unnamed],
                     "even the unnamed statement lapses for a capture no knock stands behind");
  }
  assert.deepEqual(lapses([rows[1], { ...rows[1], stated: "attribute occupation: astronaut" }]), ["attribute occupation: astronaut"],
                   "one of two rows lapses");
});

test("R5 a source whose answer is not ok with a list of entries, or that throws, answers nothing, so its capture's rows lapse (fail closed)", () => {
  const { w, source } = sourcesWorld();
  disclose(w, source);
  const rows = statedRows(w, CAP, source);
  const answers = [["not ok", () => ({ ok: false, reason: "NO_SUCH_SOURCE" })], ["no entries list", () => ({ ok: true, entries: null })],
                   ["null", () => null], ["throws", () => { throw new Error("down"); }],
                   ["ok, as the module answers (control)", (a) => w.src.publishableAt(a)]];
  for (const [label, publishableAt] of answers) {
    const asked = [];
    const cc = new CaseCarriage({ storage: w.st, record: w.record, sources: { publishableAt: (a) => { asked.push(a); return publishableAt(a); } } });
    const lapsed = cc.sourcesLapsed(caseText({ sources: rows }), NOW);
    if (label.startsWith("ok")) assert.deepEqual(lapsed, [], label);
    else assert.deepEqual(lapsed.map((x) => x.stated), rows.map((x) => x.stated), label);
    assert.deepEqual(asked, [{ source, audience: "public", at: NOW }], `${label}: asked once, of the public, at at`);
  }
});

test("R5 a document stating no sources row answers [], asking nothing: an empty block, no block, an older format, no text", () => {
  const { w } = sourcesWorld();
  const asked = [];
  const cc = new CaseCarriage({ storage: w.st, record: w.record, sources: { publishableAt: (a) => { asked.push(a); return null; } } });
  for (const text of [caseText({ sources: [] }), caseText({}), caseText({ format: "bio-case-document/4",
                      sources: [{ capture: CAP, stated: "x", basis: null }] }), "", null, undefined, 42])
    assert.deepEqual(cc.sourcesLapsed(text, NOW), [], String(text).slice(0, 40));
  assert.deepEqual(asked, []);
});
