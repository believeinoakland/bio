/* case-disclosures: the C-120 family in this module's own table (R22), no place named (R21), the seam (R23), and the
   renderers moved byte for byte (K1333): a section rendered from fixed rows hashes to what case-authoring's renderers
   rendered from the same rows before the split. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { world, storage, V, T0 } from "./fixture.mjs";
import * as CD from "../../../src/case-disclosures/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";

const { CASE_DISCLOSURE_CHECKS, caseDisclosuresOf } = CD;
const Q = "INQ-2026-0001-q", DOC = "INFO-2026-0001-a";
const hash = (lines) => createHash("sha256").update(lines.join("\n")).digest("hex");

/* ---------------------------------------------------------------- R22 */

/* The requirements' table, word for word (`build/requirements/case-disclosures.md`, R22). */
const ROWS = [
  ["TENSION_NOT_DISCLOSED", "C-120.1", "tensionsJudged", "A finding in this case rests on something the record holds in unresolved conflict, and a case may be published with it only if the conflict is disclosed. Each one is named. One in conflict with a record you cannot see is named by its finding, and the published case will highlight it without naming that record. Disclose it, or resolve it first. Nothing was published."],
  ["DISCLOSURE_NOT_STANDING", "C-120.2", "tensionsJudged", "One of the conflicts disclosed is not an unresolved conflict on this case's findings: it may have been resolved since. Read the list again. Nothing was published."],
  ["TENSIONS_UNDETERMINED", "C-120.3", "tensionsUndetermined", "The record could not be read completely for conflicts on this case's findings, so what must be disclosed is not known. Try again. Nothing was published."],
  ["CO_ATTESTATION_UNACKNOWLEDGED", "C-120.4", "selfAttestedJudged", "A load-bearing document has no trusted timestamp and co-archive. Retry them, or acknowledge publishing it as self-attested only, with a reason. Nothing was written."],
  ["SELF_ATTESTED_NO_REASON", "C-120.5", "selfAttestedJudged", "Publishing a document as self-attested only says why. Give the reason. Nothing was written."],
  ["SELF_ATTESTATION_NOT_STANDING", "C-120.6", "selfAttestedJudged", "A document acknowledged as self-attested only is either co-attested already or not one this case rests on, so it needs no acknowledgement. Remove it from the list. Nothing was written."],
  ["UNCLEARED_HUNCH", "C-120.7", "hunchDebt", "A finding in this case rests on a hunch. A hunch is temporary declared bias, and it is the one bias that must be cleared before publication: the case must still hold with the hunch removed. Give each leg a grade the record earns, or take the hunch out of the basis, and publish again. Nothing was written."],
  ["RELIED_ON_NOT_PRESENTABLE", "C-120.8", "materialsJudged", "A finding this case relies on rests on material this copy does not hold whole, and everything a case relies on travels with it in full. Find a presentable copy, stop relying on the material, or make the finding supporting. Nothing was written."],
  ["ACCEPTED_WORK_NOT_IN_FORCE", "C-120.10", "acceptedWorkJudged", "A finding in this case rests on another group's finding, and this group's acceptance of that edition is not in force. Accept it again, or take the leg out. Nothing was written."],
  ["FLAG_NOT_DISCLOSED", "C-120.11", "flagsJudged", "Another group's work this case rests on carries an open flag, and a case may be published with it only if the flag is disclosed. Each one is named. Disclose it, or clear it first. Nothing was published."],
  ["FLAGS_UNDETERMINED", "C-120.12", "flagsJudged", "The flags on another group's work this case rests on could not be read completely, so what must be disclosed is not known. Try again. Nothing was published."],
  ["FLAG_DISCLOSURE_NOT_STANDING", "C-120.13", "flagsJudged", "One of the flags disclosed is not open on work this case rests on: it may have been cleared since. Read the list again. Nothing was published."],
];

test("R22: C-120.1–C-120.8 and C-120.10–C-120.13 are this module's own table (CASE_DISCLOSURE_CHECKS), ids, codes and translations as the requirements state them word for word, each `where` naming this module's raising method; C-120.9 is never used", () => {
  assert.deepEqual(Object.keys(CASE_DISCLOSURE_CHECKS), ROWS.map(([code]) => code));
  assert.ok(Object.isFrozen(CASE_DISCLOSURE_CHECKS));
  const w = world();
  for (const [code, check, method, translation] of ROWS) {
    const row = CASE_DISCLOSURE_CHECKS[code];
    assert.deepEqual([row.check, row.translation], [check, translation], code);
    const [, fn, region] = /^src\/case-disclosures\/index\.mjs (\w+) > ([a-z-]+)$/.exec(row.where) || [];
    assert.equal(fn, method, `${code}: ${row.where}`);
    assert.equal(typeof w.cd[fn], "function", `${code}: ${fn} is a service of this module`);
    assert.match(region, /^is-[a-z-]+$/);
  }
  assert.equal(Object.values(CASE_DISCLOSURE_CHECKS).some((r) => r.check === "C-120.9"), false);
  assert.equal(new Set(Object.values(CASE_DISCLOSURE_CHECKS).map((r) => r.where)).size, ROWS.length, "each site once");
});

test("R22: each row's method raises its code, with the row's check and translation (one negative control per row: the same method, the condition absent, does not)", () => {
  const cand = (id) => ({ candidate: id, a: { text: "a" }, b: { text: "b" }, state: "open" });
  const raised = (r) => (Array.isArray(r) ? r : r ? [r] : []).map((x) => [x.code, x.check, x.translation]);
  const row = (code) => [code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation];
  const prep = [{ id: Q, bundleSha: "s" }];
  /* C-120.1, C-120.2 */
  const t = world({ deps: { contradiction: { unresolvedRecordOn: () => ({ ok: true, candidates: [cand("c1")] }) } } });
  assert.deepEqual(raised(t.cd.tensionsJudged(prep, V("alice"), [{ candidate: "c2" }]).refusals), [row("TENSION_NOT_DISCLOSED"), row("DISCLOSURE_NOT_STANDING")]);
  assert.deepEqual(t.cd.tensionsJudged(prep, V("alice"), [{ candidate: "c1" }]).refusals, []);
  /* C-120.3 */
  assert.deepEqual(raised(t.cd.tensionsUndetermined([{ finding: Q, why: "x" }])), [row("TENSIONS_UNDETERMINED")]);
  /* C-120.4–C-120.6 */
  const f = (capture, co) => [capture, { capture, grade: "B", co_attested: co, timestamp_at: null, co_archive: null }];
  const facts = new Map([f("b1", false), f("b2", true)]);
  const resting = [{ member: Q, capture: "b1" }, { member: Q, capture: "b2" }];
  const roles = [{ target: Q, role: "load_bearing" }];
  assert.deepEqual(raised(t.cd.selfAttestedJudged(resting, facts, roles, [{ capture: "b2", reason: "" }]).refusals),
    [row("CO_ATTESTATION_UNACKNOWLEDGED"), row("SELF_ATTESTED_NO_REASON"), row("SELF_ATTESTATION_NOT_STANDING")]);
  assert.deepEqual(t.cd.selfAttestedJudged(resting, facts, roles, [{ capture: "b1", reason: "r" }]).refusals, []);
  /* C-120.7 */
  const h = (legs) => world({ deps: { inquiry: { basisFor: () => ({ ok: true, legs }) } } }).cd.hunchDebt(prep);
  assert.deepEqual(raised(h([{ ord: 0, target_id: DOC, grade_source: "hunch" }])), [row("UNCLEARED_HUNCH")]);
  assert.equal(h([{ ord: 0, target_id: DOC, grade_source: "capture" }]), null);
  /* C-120.8 */
  const m = world(); m.member("alice"); m.doc(DOC, {}, { indexed: false }); m.finding(Q, [{ target: DOC }]);
  assert.deepEqual(raised(m.cd.materialsJudged(m.prepared([Q]), m.roles([Q]), V("alice")).refusals), [row("RELIED_ON_NOT_PRESENTABLE")]);
  assert.deepEqual(m.cd.materialsJudged(m.prepared([Q]), m.roles([Q], [Q]), V("alice")).refusals, []);
  /* C-120.10 */
  const a = world({ deps: { caseImport: { acceptanceOf: () => null, importedCase: () => null } } });
  assert.deepEqual(raised(a.cd.acceptedWorkJudged([{ member: Q, leg_of: Q, ord: 0, ref: `imported:${"a".repeat(64)}/INQ-2026-0042-x` }], V("alice")).refusals),
    [row("ACCEPTED_WORK_NOT_IN_FORCE")]);
  assert.deepEqual(a.cd.acceptedWorkJudged([], V("alice")).refusals, []);
  /* C-120.11–C-120.13 */
  const fl = (answer) => world({ deps: { caseImport: { openFlagsOn: () => answer } } }).cd;
  const eds = [{ import: "i", edition: 1, refs: [{ ref: "r", finding: null, member: Q }] }];
  const open = { ok: true, complete: true, flags: [{ flag: "F1", issue: "i" }] };
  assert.deepEqual(raised(fl(open).flagsJudged(eds, [{ flag: "F2" }]).refusals), [row("FLAG_NOT_DISCLOSED"), row("FLAG_DISCLOSURE_NOT_STANDING")]);
  assert.deepEqual(raised(fl({ ok: true, complete: false, flags: [] }).flagsJudged(eds, null).refusals), [row("FLAGS_UNDETERMINED")]);
  assert.deepEqual(fl(open).flagsJudged(eds, [{ flag: "F1" }]).refusals, []);
});

/* ---------------------------------------------------------------- R21 */

test("R21: no place is named in this module's behaviour or outward text — its rows, sentences, refusals and every line its renderers write name no place a jurisdiction profile covers", () => {
  const dir = new URL("../../../../jurisdictions/profiles/", import.meta.url);
  const places = new Set();
  for (const f of readdirSync(dir))
    for (const m of readFileSync(new URL(f, dir), "utf8").matchAll(/covers:\s*\[([^\]]*)\]/g))
      for (const q of m[1].matchAll(/"([^"]+)"/g)) {
        places.add(q[1]);
        places.add(q[1].replace(/^(City|Town|County) of /, "").replace(/ (County|City)$/, ""));
      }
  assert.ok(places.size >= 4, "the profiles name places");
  const said = [JSON.stringify(Object.values(CASE_DISCLOSURE_CHECKS)), CD.SELF_ATTESTED_SENTENCE, CD.HIGHLIGHT_SENTENCE,
                CD.NOT_SHOWN_WORDS, CD.TENSIONS_DEPTH_STATED, JSON.stringify(CD.TENSION_TEMPLATES), CD.FLAG_SENTENCE, CD.FLAGS_SAY,
                ...Object.values(RENDERED).map(([fn, args]) => CD[fn](...args).join("\n")), ...ROWS_T.map(CD.tensionSentence)];
  /* the refusals' own words, each raised */
  const w = world({ deps: { contradiction: { unresolvedRecordOn: () => { throw new Error("x"); } } } });
  w.member("alice"); w.doc(DOC); w.finding(Q, [{ target: DOC, grade: "B", grade_axis: "connection", grade_source: "hunch", author: "member:alice", date: "2026-09-27" }]);
  said.push(JSON.stringify(w.cd.hunchDebt(w.prepared([Q]))), JSON.stringify(w.cd.tensionsJudged(w.prepared([Q]), V("alice"), null)),
            JSON.stringify(w.cd.tensionsJudged(w.prepared([Q]), V("alice"), "x")), JSON.stringify(w.cd.methodOf()));
  const all = said.join("\n");
  for (const p of places) assert.equal(all.includes(p), false, `names ${p}`);
});

/* ---------------------------------------------------------------- R23 */

test("R23: every service is synchronous, and none throws when every module it reads fails — each answers, stating less", () => {
  const boom = () => { throw new Error("down"); };
  const deps = { inquiry: { basisFor: boom }, strength: { gradingFacts: boom }, contradiction: { unresolvedRecordOn: boom },
                 provenance: { captureGrade: boom }, attestation: { attestationsOf: boom },
                 capture: { lateAttestationsOf: boom, captureAccountsOf: boom }, sources: { sourceOf: boom, publishableAt: boom },
                 extraction: { unitsOf: boom }, promotion: { fact: boom },
                 caseImport: { acceptanceOf: boom, openFlagsOn: boom, importedCase: boom } };
  const w = world({ deps: { ...deps, record: { readFile: boom } } });
  w.member("alice"); w.doc(DOC); w.finding(Q, [{ target: DOC }]);
  const prep = w.prepared([Q]), roles = w.roles([Q]);
  const ref = `imported:${"a".repeat(64)}/INQ-2026-0042-x`;
  const calls = {
    hunchDebt: () => w.cd.hunchDebt(prep),
    tensionsRead: () => w.cd.tensionsRead(prep, V("alice")),
    tensionsJudged: () => w.cd.tensionsJudged(prep, V("alice"), null),
    tensionsUndetermined: () => w.cd.tensionsUndetermined([]),
    restingCaptures: () => w.cd.restingCaptures(prep),
    captureFacts: () => w.cd.captureFacts("e".repeat(64)),
    selfAttestedJudged: () => w.cd.selfAttestedJudged([], new Map(), roles, null),
    materialsJudged: () => w.cd.materialsJudged(prep, roles, V("alice")),
    acceptedWorkJudged: () => w.cd.acceptedWorkJudged([{ member: Q, leg_of: Q, ord: 1, ref }], V("alice")),
    flagsJudged: () => w.cd.flagsJudged([{ import: "i", edition: 1, refs: [{ ref, finding: null, member: Q }] }], null),
    sourcesStated: () => w.cd.sourcesStated(["e".repeat(64)], V("alice")),
    withheldOf: () => w.cd.withheldOf([]),
    findingFacts: () => w.cd.findingFacts([{ id: Q, member: Q }], V("alice")),
    methodOf: () => w.cd.methodOf(),
    disclosureBlocks: () => w.cd.disclosureBlocks({ resting: [{ member: Q, capture: "e".repeat(64) }],
      reached: { materials: [{ ref: DOC, kind: "document", sha: "e".repeat(64), held: { text_sha: null }, included: false, rests_under: "supporting" }] },
      author: "alice", at: T0 }),
  };
  const services = Object.getOwnPropertyNames(Object.getPrototypeOf(w.cd)).filter((k) => k !== "constructor"
    && typeof Object.getOwnPropertyDescriptor(Object.getPrototypeOf(w.cd), k).value === "function");
  assert.deepEqual(services.sort(), Object.keys(calls).sort(), "every service is exercised");
  for (const [name, call] of Object.entries(calls)) {
    let out;
    assert.doesNotThrow(() => { out = call(); }, name);
    assert.equal(out instanceof Promise || (out && typeof out.then === "function"), false, `${name} is synchronous`);
  }
  /* what each failed read states */
  assert.equal(calls.tensionsJudged().refusals[0].reason, "TENSIONS_UNDETERMINED");
  assert.equal(calls.acceptedWorkJudged().refusals[0].reason, "ACCEPTED_WORK_NOT_IN_FORCE");
  assert.equal(calls.flagsJudged().refusals[0].reason, "FLAGS_UNDETERMINED");
  assert.equal(calls.hunchDebt().reason, "UNCLEARED_HUNCH");
  assert.match(calls.sourcesStated()[0].stated, /^Withheld: /);
  assert.deepEqual(calls.findingFacts().grading, []);
  assert.equal(calls.disclosureBlocks().group, null);
  assert.equal(calls.materialsJudged().materials[0].included, false, "a file that cannot be read is not held");
});

test("R23: it writes nothing of its own and holds no table — creating it adds no table and declares nothing to purge; every judgment leaves the store as it found it, the one write it reaches (sources' minted id) inside the caller's transaction, which rolls it back", () => {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";")) if (s.trim()) st.db.exec(s);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  const declared = [];
  const watched = new Proxy(record, { get: (o, k) => (k === "declarePurge" ? (...a) => { declared.push(a); return { ok: true }; }
                                                                             : typeof o[k] === "function" ? o[k].bind(o) : o[k]) });
  const tables = () => st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name);
  const before = tables();
  const c = caseDisclosuresOf(host, { record: watched });
  assert.deepEqual([tables(), declared], [before, []]);
  assert.equal(caseDisclosuresOf(host), c, "one instance per host");
  assert.equal(caseDisclosuresOf(host, { record: null }), c, "later deps are not read");
  assert.notEqual(caseDisclosuresOf({ storage: storage() }), c, "another host, another instance");
  /* over a real record: every judgment writes nothing; the source read's mint rolls back with the caller */
  const w = world();
  w.member("alice");
  const k = w.doc(DOC); w.knocked(k);
  w.finding(Q, [{ target: DOC, grade: "B", grade_axis: "connection", grade_source: "hunch", author: "member:alice", date: "2026-09-27" }]);
  const prep = w.prepared([Q]);
  const snap = w.snapshot();
  const reached = w.cd.materialsJudged(prep, w.roles([Q]), V("alice"));
  w.cd.hunchDebt(prep); w.cd.tensionsJudged(prep, V("alice"), null); w.cd.findingFacts(reached.findings, V("alice"));
  const resting = w.cd.restingCaptures(prep);
  const facts = new Map(resting.map((r) => [r.capture, w.cd.captureFacts(r.capture)]));
  w.cd.selfAttestedJudged(resting, facts, w.roles([Q]), null);
  w.cd.acceptedWorkJudged(reached.refs, V("alice")); w.cd.flagsJudged([], null);
  w.cd.disclosureBlocks({ resting, facts, reached, author: "alice", at: T0 });
  assert.deepEqual(w.snapshot(), snap, "the judgments and the blocks write nothing");
  const ROLLBACK = Symbol("rollback");
  try { w.record.transact(() => { assert.equal(w.cd.sourcesStated([k], V("alice")).length, 1); throw ROLLBACK; }); }
  catch (e) { if (e !== ROLLBACK) throw e; }
  assert.deepEqual(w.snapshot(), snap, "the caller's rollback takes the minted source id back");
  /* negative control: outside a rolled-back transaction the read does mint, so the arm above saw a write undone */
  w.cd.sourcesStated([k], V("alice"));
  assert.notDeepEqual(w.snapshot(), snap);
});

/* ---------------------------------------------------------------- the renderers, byte for byte (K1333) */

const side = (text, src, cap = null) => ({ kind: "leg", text, source: src, date: "2026-01-02", doctype: "minutes", capture: cap });
const ROWS_T = [
  { candidate: "c".repeat(64), finding: "INQ-2026-0001-q", state: "explained_not_shown", kind: null, unseen_other_side: false,
    a: side("the page of A", "INFO-2026-0001-a", "a".repeat(64)), b: side("the page's \"other\" B\\x", "INFO-2026-0002-b"),
    explanation: "different years", depth: 1, words: "we read the later page", acknowledged_by: "alice", acknowledged_at: "2026-09-28T01:00:00Z" },
  { candidate: "d".repeat(64), finding: "INQ-2026-0002-q", state: "resolved", kind: "irreconcilable", unseen_other_side: false,
    a: side("one", "INFO-1"), b: side(null, null), explanation: null, depth: 1, words: null, acknowledged_by: "alice", acknowledged_at: "2026-09-28T01:00:00Z" },
  { candidate: "e".repeat(64), finding: "INQ-2026-0001-q", state: "open", kind: null, unseen_other_side: true,
    side: side("the seen side", "INFO-2026-0001-a"), depth: 1, words: null, acknowledged_by: "alice", acknowledged_at: "2026-09-28T01:00:00Z" },
  { candidate: "f".repeat(64), finding: "INQ-2026-0003-q", state: "taken_up", kind: null, unseen_other_side: false,
    a: side("x", "INFO-3"), b: side("y", "INFO-4"), explanation: null, depth: 1, words: "w", acknowledged_by: "bo", acknowledged_at: "t" },
];
const UNREAD = [{ finding: "INQ-2026-0001-q", legs: 2 }];
const acct = (by, sig) => ({ by, at: "2026-09-27T12:00:00Z", text: "I saved it.\nIt was there.", signature: sig });
const CAPTURES = [
  { capture: "a".repeat(64), member: "INQ-2026-0001-q", grade: "B", grade_basis: "measured", grade_why: "fetched directly",
    co_attested: true, timestamp_at: "2026-09-27T00:00:00Z", co_archive: "https://archive.example/x", late: true, self_attested_only: false,
    accounts: [acct("alice", "SIG")] },
  { capture: "a".repeat(64), member: "INQ-2026-0002-q", grade: "B", grade_basis: "measured", grade_why: null, co_attested: true,
    timestamp_at: "2026-09-27T00:00:00Z", co_archive: "https://archive.example/x", late: true, self_attested_only: false, accounts: [] },
  { capture: "b".repeat(64), member: "INQ-2026-0001-q", grade: "B", grade_basis: "measured", grade_why: null, co_attested: false,
    timestamp_at: "2026-09-27T00:00:00Z", co_archive: null, late: false, self_attested_only: true,
    acknowledgement: { reason: "the archive refuses it", acknowledged_by: "alice", at: "2026-09-28T01:00:00Z", sentence: "s" },
    accounts: [acct(null, null), acct("bo", null)] },
  { capture: "9".repeat(64), member: "INQ-2026-0003-q", grade: null, grade_basis: null, grade_why: null, co_attested: false,
    timestamp_at: null, co_archive: "https://archive.example/y", late: false, self_attested_only: false, accounts: [] },
];
const SOURCES = [{ capture: "b".repeat(64), stated: "Withheld: the source has not consented", basis: null },
  { capture: "a".repeat(64), stated: "Pat Q. Example", basis: "consent" }, { capture: "9".repeat(64), stated: "the clerk", basis: "public_elsewhere" },
  { capture: "8".repeat(64), stated: "z", basis: "other_basis" }];
const METHOD = { grading: "bio-grading/1", checks: "1.58.0" };
const att = (by_kind, by, level, at, signature, recorded_in, ref = "INFO-2026-0001-a") => ({ ref, by_kind, by, level, at, signature, recorded_in });
const MATERIALS = {
  rows: [{ ref: "INFO-2026-0001-a", kind: "document", sha: "a".repeat(64), text_sha: "t".repeat(64), origin: "https://example.org/a",
           archived_copy: "https://archive.example/x", included: true, rests_under: "load_bearing" },
         { ref: "INFO-2026-0002-b", kind: "observation", sha: "b".repeat(64), text_sha: null, origin: null, archived_copy: null,
           included: false, rests_under: "supporting" }],
  attestations: [att("member", "alice", "name", "2026-09-27T12:00:00Z", "SIG", null), att("member", null, "group", null, null, null),
                 att("member", null, null, null, null, null), att("member", "Cover bo", "cover", null, null, null),
                 att("co_attestation", "timestamp", null, "2026-09-27T00:00:00Z", null, null), att("co_attestation", "timestamp", null, null, null, null),
                 att("co_attestation", "https://archive.example/x", null, null, null, null),
                 att("project", "PROJ-x", null, null, null, "INFO-2026-0001-a"), att("group", "test-group", null, "2026-09-28T01:00:00Z", "case", null),
                 att("member", null, "project", null, null, null, "INFO-2026-0002-b")],
};
const ACCEPTED = {
  rows: [{ member: "INQ-2026-0001-q", leg_of: "INQ-2026-0001-q", ref: "imported:x/INQ-1", group: "other-group", case: "CASE-1", edition: 2,
           finding: "INQ-1", manifest_sha: "f".repeat(64), pair: { capture: "B", connection: "C" }, result: "recreated_in_part",
           gaps: "page 3", accepted_by: "alice", accepted_at: "2026-09-27T00:00:00Z", reason: "We recreated it." },
         { member: "INQ-2026-0002-q", leg_of: "INQ-2026-0009-q", ref: "imported:x/INQ-2", group: null, case: null, edition: 1,
           finding: "INQ-2", manifest_sha: null, pair: null, result: null, gaps: null, accepted_by: "bo", accepted_at: "t", reason: "r" }],
  flags: [{ ref: "imported:x/INQ-1", edition: 2, flag: "IMPFLAG-1", issue: "page 3 is misread", flagged_at: null, words: "we checked",
            acknowledged_by: "alice", acknowledged_at: "2026-09-28T01:00:00Z" },
          { ref: "imported:x/INQ-1", edition: 2, flag: "IMPFLAG-2", issue: "i", flagged_at: "t", words: null, acknowledged_by: "alice", acknowledged_at: "t" }],
};
/* Each renderer over the fixed rows, and the SHA-256 of its lines joined by newlines as case-authoring's own renderers
   (`document.mjs` at tranche/T29's opening, before the split) produced them from the same rows. */
const RENDERED = {
  "4622dce4f877b09dd49359c991d211736923732ecee1fc4bc365f62380e70e38": ["tensionFrontmatterLines", [ROWS_T, UNREAD]],
  "147ca17cd4fca35ce473f33b01ba40847056d9a6b19feece651b7e5ba7955745": ["tensionFrontmatterLines", [[], []]],
  "7b4d64ee3bbd113a414cf7a9b7fbbe3b4a871838fcac7aaf624c8a183ce25f39": ["tensionBodyLines", [ROWS_T, UNREAD]],
  "8708f2958a9f13f2c9d49825b7b401a89b8057e9d9a85128bc72612a47a31dfa": ["tensionBodyLines", [[]]],
  "69c79f41e94ef5e3d1e52e35cb912344feaed5350ded66be74bc0c7e293fbf5e": ["captureBodyLines", [CAPTURES, SOURCES]],
  "fe16ace5dca89d8bb3ea1dd6f7371ae334b08cdc1e964be0800d11d388ff9eb1": ["captureBodyLines", [[], []]],
  "54051f5fdfe26a6d6017163cb0115033e67c6076a0d9855e96a0c18bbf8b4d6f": ["carriesBodyLines", [METHOD, MATERIALS, "test-group"]],
  "90eb0ce32c1afc3fa9af5d11f4c768f7ff59c62daac0562ff4516428000324cb": ["carriesBodyLines", [null, { rows: [] }, null]],
  "557eeb47abfb15756efe91a681364b912cc007dda9b7d40ec6b73286471a7145": ["acceptedBodyLines", [ACCEPTED]],
  "ad9a96ebac55e2784f2d60cee6ad7bfb581b2cd94cc6f355d4a4507123420cc3": ["acceptedBodyLines", [{ rows: ACCEPTED.rows, flags: [] }]],
};

test("R1, R3, R5, R7, R13, R14 (K1333): the renderers moved byte for byte — each section rendered from fixed rows hashes to what case-authoring's renderers produced from them before the split, and so does each member's tension sentence (negative control: one changed byte in a row changes the hash)", () => {
  for (const [want, [fn, args]] of Object.entries(RENDERED)) assert.equal(hash(CD[fn](...args)), want, fn);
  assert.equal(hash(ROWS_T.map(CD.tensionSentence)), "ea2712a31f72c703a3308c648cb20d048e210232c2eb1cda3995cf468c283417");
  const changed = [{ ...ROWS_T[0], words: "we read the later page." }, ...ROWS_T.slice(1)];
  assert.notEqual(hash(CD.tensionBodyLines(changed, UNREAD)), "7b4d64ee3bbd113a414cf7a9b7fbbe3b4a871838fcac7aaf624c8a183ce25f39");
});
