/* case-checker at its interface: `checkCaseFile` (R1–R12, R16, R18) and `readCaseFile` (R19), over real case files
   (`./fixture.mjs`): a clean case file recreates every finding, and each check has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { CATALOG_VERSION } from "../../../src/gate.mjs";
import { GRADING_METHOD_VERSIONS } from "../../../src/strength/method.mjs";
import { captureAccountStatement, ratifyStatement, NS_RELEASE } from "../../../src/sshsig.mjs";
import { caseFile, caseFiles, gradingFacts, byId, sha, keyFor, A, B, C, MINUTES, MEMO, MEMO_BYTES, MEMO_ACCOUNT, MINUTES_BYTES, REF, GROUP, CASE } from "./fixture.mjs";

const passagesOfFixture = () => Object.fromEntries([A, B, C].map((id) => [id, JSON.parse(caseFiles().texts.get(CG.caseFilePath("passages", id)))]));
const check = (opts = {}, args = {}) => CC.checkCaseFile({ parts: caseFile(opts).parts, ...args });
const results = (answer) => Object.fromEntries(answer.findings.map((f) => [f.finding, f.result]));
const ALL_RECREATED = { [A]: "recreated", [C]: "recreated", [B]: "recreated" };
const has = (list, check, re) => list.some((e) => e.check === check && re.test(e.detail));

test("R1 R11: a clean case file recreates every finding, members and the finding a member's chain reaches, with the answer's whole shape", async () => {
  for (const parts of [1, 2, 3]) {
    const r = await check({ parts });
    assert.deepEqual(Object.keys(r).sort(), ["case", "checker", "complete_edition", "edition", "findings", "format", "group", "integrity",
      "publication_checks", "rests_on_another_group", "rests_on_another_group_statement", "signatures", "statement"]);
    assert.equal(r.format, "bio-case-file/1"); assert.equal(r.case, CASE); assert.equal(r.edition, 2); assert.equal(r.group, GROUP);
    assert.deepEqual(r.checker, { grading_versions: [...GRADING_METHOD_VERSIONS], checks_version: CATALOG_VERSION });
    assert.deepEqual(results(r), ALL_RECREATED, `${parts} part(s)`);
    for (const f of r.findings) {
      assert.deepEqual(Object.keys(f), ["finding", "role", "result", "missing", "differs", "pair", "bar_met"]);
      assert.deepEqual(f.missing, []); assert.deepEqual(f.differs, []);
    }
    assert.deepEqual(byId(r)[A].role, "load_bearing"); assert.deepEqual(byId(r)[C].role, "supporting"); assert.deepEqual(byId(r)[B].role, "reached");
    assert.equal(r.integrity.intact, true); assert.deepEqual(r.integrity.departures, []);
    assert.equal(r.statement, CC.RECREATION_STATEMENT);
    assert.match(r.statement, /intact and consistent/); assert.match(r.statement, /does not show that the case is true/);
  }
});

test("R1: pure and never throws: any input answers the whole answer, malformed input naming each departure with every finding it names did_not_recreate", async () => {
  for (const bad of [undefined, null, 7, "x", {}, { parts: null }, { parts: [] }, { parts: ["not bytes"] }, { parts: [new Uint8Array(40)] }]) {
    const r = await CC.checkCaseFile(bad);
    assert.equal(r.statement, CC.RECREATION_STATEMENT);
    assert.equal(r.integrity.intact, false);
    assert.ok(r.integrity.departures.length > 0);
    assert.ok(Array.isArray(r.findings));
  }
  /* a manifest that is not the format: each departure named; the findings it lists do not recreate */
  const r = await check({ manifest: (m) => { m.format = "bio-case-file/9"; } });
  assert.ok(r.integrity.departures.some((d) => /format/.test(d)), r.integrity.departures.join("; "));
  assert.deepEqual(new Set(Object.values(results(r))), new Set(["did_not_recreate"]));
  /* a part that is not a ZIP among good ones is named, and nothing is thrown */
  const cf = caseFile({ parts: 2 });
  const r2 = await CC.checkCaseFile({ parts: [cf.parts[0], new Uint8Array([1, 2, 3])] });
  assert.ok(r2.integrity.departures.some((d) => /part 2 given: the part is not a ZIP/.test(d)));
});

test("R2 R11: a changed byte in a carried file differs for each finding that needs it; a missing part makes its findings recreated_in_part, naming each file to fetch", async () => {
  const r = await check({ edit: (b) => { const x = Buffer.from(b.get(CG.caseFilePath("document", MINUTES))); x[3] ^= 1; b.set(CG.caseFilePath("document", MINUTES), x); } });
  assert.equal(byId(r)[A].result, "did_not_recreate");
  assert.ok(has(byId(r)[A].differs, "integrity", /materials\/INFO-2026-0001-minutes\/document does not match the manifest/));
  assert.equal(byId(r)[C].result, "recreated");     /* C's chain does not reach the minutes */
  /* bytes the manifest lists consistently, but not the bytes the signed materials block fingerprints */
  const swapped = await check({ mutate: (t) => t.set(CG.caseFilePath("document", MINUTES), "%PDF other minutes") });
  assert.deepEqual(swapped.integrity.departures, []);
  assert.ok(has(byId(swapped)[A].differs, "integrity", /the carried document INFO-2026-0001-minutes is not the bytes the signed case fingerprints/));
  assert.equal(byId(swapped)[C].result, "recreated");
  /* a part fingerprint the manifest lists falsely is a departure of the whole case */
  const fp = await check({ parts: 2, manifest: (m) => { m.parts[1].sha256 = sha("not it"); } });
  assert.ok(fp.integrity.departures.some((d) => /part 2's files do not recompute the fingerprint/.test(d)), fp.integrity.departures.join("; "));
  assert.deepEqual(new Set(Object.values(results(fp))), new Set(["did_not_recreate"]));
  /* a file absent from its part: missing for the findings needing it, named with its fingerprint */
  const gone = await check({ edit: (b) => b.delete(CG.caseFilePath("document", MEMO)) });
  assert.equal(byId(gone)[A].result, "recreated_in_part");
  assert.equal(byId(gone)[B].result, "recreated_in_part");
  assert.ok(byId(gone)[A].missing.some((e) => e.sha256 === sha(MEMO_BYTES) && /fetch the document whose SHA-256 is/.test(e.detail)));
  assert.equal(byId(gone)[C].result, "recreated");
  /* a whole part missing (part 2 of 2 not given) */
  const two = caseFile({ parts: 2 });
  const half = await CC.checkCaseFile({ parts: [two.parts[0]] });
  assert.equal(half.integrity.parts.find((p) => p.index === 2).state, "missing");
  assert.deepEqual(new Set(Object.values(results(half))), new Set(["recreated_in_part"]));
  assert.ok(half.findings.every((f) => f.differs.length === 0 && f.missing.length > 0));
});

test("R19: readCaseFile answers the manifest, every file with its kind, fingerprint, size and carried bytes, and the departures; pure and never throws", () => {
  const cf = caseFile({ parts: 2 });
  const r = CC.readCaseFile(cf.parts);
  assert.deepEqual(r.manifest, cf.manifest);
  assert.deepEqual(r.departures, []);
  assert.equal(r.files.length, cf.manifest.files.length);
  for (const f of r.files) {
    const row = cf.manifest.files.find((x) => x.path === f.path);
    assert.equal(f.kind, row.kind); assert.equal(f.sha256, row.sha256); assert.equal(f.bytes, row.bytes); assert.equal(f.state, "intact");
    assert.equal(sha(Buffer.from(f.content)), row.sha256);
  }
  assert.equal(r.files.find((f) => f.kind === "finding" && f.finding === A).path, CG.caseFilePath("finding", A));
  assert.equal(r.files.find((f) => f.kind === "document" && f.ref === MINUTES).path, CG.caseFilePath("document", MINUTES));
  /* negative controls: an unlisted entry, a tampered file, a missing part, junk */
  const extra = caseFile({ edit: (b) => b.set("extra.txt", Buffer.from("hi")) });
  const tampered = CC.readCaseFile(caseFile({ edit: (b) => b.set(CG.caseFilePath("finding", C), Buffer.from("changed")) }).parts);
  const t = tampered.files.find((f) => f.path === CG.caseFilePath("finding", C));
  assert.equal(t.state, "differs"); assert.equal(t.content, null);
  const half = CC.readCaseFile([cf.parts[1]]);
  assert.ok(half.files.some((f) => f.state === "missing"));
  for (const junk of [undefined, null, [], [null], ["x"], [new Uint8Array(3)]]) {
    const j = CC.readCaseFile(junk);
    assert.ok(Array.isArray(j.departures) && j.departures.length > 0);
    assert.ok(Array.isArray(j.files));
  }
  assert.equal(extra.parts.length, 1);
});

test("R3: the case document's signature and each member's verify over their statements; a forged one differs for the case and every finding; a key the case file does not list differs", async () => {
  const r = await check();
  assert.equal(r.signatures.case.verified, true);
  assert.equal(r.signatures.case.listed_in_case_file, true);
  assert.deepEqual(r.signatures.findings.map((s) => [s.finding, s.verified]), [[A, true], [C, true]]);
  /* forged: the case document signed by a key the case file does not list */
  const forged = await check({ caseSigner: "mallory" });
  assert.equal(forged.signatures.case.verified, false);
  assert.equal(forged.signatures.case.reason, "UNKNOWN_KEY");
  assert.deepEqual(new Set(Object.values(results(forged))), new Set(["did_not_recreate"]));
  assert.ok(forged.findings.every((f) => has(f.differs, "signature", /case document's signature/)));
  /* a signature over other bytes */
  const wrong = await check({ mutate: (t) => t.set(CG.caseFilePath("case_signature"), t.get(CG.caseFilePath("finding_signature", A))) });
  assert.equal(wrong.signatures.case.verified, false);
  assert.deepEqual(new Set(Object.values(results(wrong))), new Set(["did_not_recreate"]));
  /* a member's signature by an unlisted key differs for that member */
  const fsig = await check({ findingSigner: "mallory" });
  assert.equal(byId(fsig)[A].result, "did_not_recreate");
  assert.ok(has(byId(fsig)[A].differs, "signature", new RegExp(`finding ${A}'s signature`)));
});

test("R3: with the group's published keys each signing key is said to be among them or not; without them the answer says they were not checked", async () => {
  const none = await check();
  assert.equal(none.signatures.keys_checked, false);
  assert.equal(none.signatures.keys_statement, CC.KEYS_NOT_CHECKED_STATEMENT);
  assert.equal("among_published_keys" in none.signatures.case, false);
  const all = await check({}, { keys: ["group", "alice", "bob"].map((k) => keyFor(k).line) });
  assert.equal(all.signatures.keys_checked, true);
  assert.equal(all.signatures.keys_statement, null);
  assert.equal(all.signatures.case.among_published_keys, true);
  assert.deepEqual(results(all), ALL_RECREATED);
  /* the case document's key is not among the group's published keys: it differs */
  const notPublished = await check({}, { keys: [keyFor("alice").line, keyFor("bob").line] });
  assert.equal(notPublished.signatures.case.among_published_keys, false);
  assert.equal(notPublished.signatures.case.verified, false);
  assert.ok(notPublished.findings.every((f) => f.result === "did_not_recreate"));
});

test("R3 R8 (K1275): material from a source whose identity is withheld recreates like any other, and a forged attesting member's signature on it differs for each finding whose chain reaches it", async () => {
  const clean = await check();
  const memoRows = clean.signatures.attestations.filter((a) => a.ref === MEMO);
  assert.deepEqual(memoRows.map((a) => [a.by_kind, a.state]), [["member", "checked"], ["group", "checked"]]);
  const forged = await check({ memoAccountSigner: "mallory" });
  assert.equal(forged.signatures.attestations.find((a) => a.ref === MEMO && a.by_kind === "member").state, "fails");
  assert.equal(byId(forged)[A].result, "did_not_recreate");
  assert.equal(byId(forged)[B].result, "did_not_recreate");
  assert.ok(has(byId(forged)[B].differs, "signature", /signed account attesting INFO-2026-0002-memo/));
  assert.equal(byId(forged)[C].result, "recreated");
  /* an account whose words were changed after signing */
  const changed = await check({ memoAccountSigned: "Some other words." });
  assert.equal(byId(changed)[B].result, "did_not_recreate");
  /* a group row is the case document's signature: it fails with it */
  const unsigned = await check({ caseSigner: "mallory" });
  assert.ok(unsigned.signatures.attestations.filter((a) => a.by_kind === "group").every((a) => a.state === "fails"));
  /* a project row must name a material the manifest lists */
  const noFile = await check({ mutate: (t) => { t.delete(CG.caseFilePath("document", MINUTES)); t.delete(CG.caseFilePath("extracted_text", MINUTES)); } });
  assert.equal(noFile.signatures.attestations.find((a) => a.by_kind === "project").state, "fails");
});

test("R3 (N530): a member's account is verified over signatures.captureAccountStatement in the ratify namespace, and over no other spelling of it", async () => {
  assert.equal(CC.accountStatement, captureAccountStatement, "the very function signatures provides");
  /* signed over that statement: checked */
  const over = await check({ memoAccountMessage: captureAccountStatement(sha(MEMO_BYTES), MEMO_ACCOUNT) });
  assert.equal(over.signatures.attestations.find((a) => a.ref === MEMO && a.by_kind === "member").state, "checked");
  assert.deepEqual(results(over), ALL_RECREATED);
  /* signed over a near spelling of it, or over another statement: fails for each finding whose chain reaches the memo */
  for (const bad of [`bio-capture-account ${sha(MEMO_BYTES)} \n${MEMO_ACCOUNT}`, `bio-capture-account ${sha(MEMO_BYTES)}\n${MEMO_ACCOUNT}\n`,
                     `bio-capture-account\n${sha(MEMO_BYTES)}\n${MEMO_ACCOUNT}`, String(ratifyStatement(MEMO, sha(MEMO_BYTES)))]) {
    const r = await check({ memoAccountMessage: Buffer.from(bad) });
    assert.equal(r.signatures.attestations.find((a) => a.ref === MEMO && a.by_kind === "member").state, "fails", bad);
    assert.equal(byId(r)[A].result, "did_not_recreate"); assert.equal(byId(r)[B].result, "did_not_recreate");
    assert.equal(byId(r)[C].result, "recreated");
  }
  /* signed over that statement, but in another namespace */
  const ns = await check({ memoAccountNamespace: NS_RELEASE });
  assert.equal(ns.signatures.attestations.find((a) => a.ref === MEMO && a.by_kind === "member").state, "fails");
  assert.ok(has(byId(ns)[B].differs, "signature", /signed account attesting INFO-2026-0002-memo was made for another purpose/));
});

test("R4: each relied-on passage is found where it is said to be; a moved passage or a wrong content id differs, and extracted text not carried is missing", async () => {
  const moved = await check({ quoted: "Adjourned at nine." });             /* on page 2, said to be on page 1 */
  assert.equal(byId(moved)[A].result, "did_not_recreate");
  assert.ok(has(byId(moved)[A].differs, "passage", /not found where it is said to be/));
  const forgedRows = (rows) => rows.map((p) => ({ ...p, content_id: sha("another") }));
  const forged = await check({ signedPassages: { [A]: forgedRows(passagesOfFixture()[A]) }, mutate: (t) =>
    t.set(CG.caseFilePath("passages", A), JSON.stringify(forgedRows(passagesOfFixture()[A]))) });
  assert.ok(has(byId(forged)[A].differs, "passage", /does not recompute to the content id/));
  /* the carried file must say what the signed document states: only the document is signed */
  const unsigned = await check({ mutate: (t) => t.set(CG.caseFilePath("passages", A), JSON.stringify(forgedRows(passagesOfFixture()[A]))) });
  assert.ok(has(byId(unsigned)[A].differs, "passage", /carried passages are not the passages the signed case document states/));
  const noText = await check({ edit: (b) => b.delete(CG.caseFilePath("extracted_text", MINUTES)) });
  assert.equal(byId(noText)[A].result, "recreated_in_part");
  assert.ok(has(byId(noText)[A].missing, "passage", /extracted text is not carried; fetch the document whose SHA-256 is/));
  /* the text at an extent */
  const units = CG.extractedTextOf([{ extent: { kind: "pdf-page", page: 0 }, ref: "p1", text: "one" }, { extent: { kind: "pdf-page", page: 1 }, ref: "p2", text: "two" }]);
  assert.equal(CC.textAtExtent(units, { kind: "pdf-page", page: 1 }), "two");
  assert.equal(CC.textAtExtent(units, { kind: "pdf-page", page: 0, rect: [0, 0, 10, 10] }), "one");
  assert.equal(CC.textAtExtent(units, { kind: "document" }), "one\ntwo");
  assert.equal(CC.textAtExtent(units, { kind: "pdf-page", page: 5 }), null);
  assert.equal(CC.textAtExtent("not json", { kind: "document" }), null);
});

test("R5: each pair recomputes at the stated method version; a changed recorded grade differs naming the axis, the recorded and the recomputed grade; an unknown version is missing naming it", async () => {
  const r = await check();
  assert.deepEqual(byId(r)[A].pair, { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "B" }, testimony: { state: "unrated", grade: null } });
  const changed = await check({ recorded: (p) => ({ ...p, [A]: { ...p[A], capture: { state: "graded", grade: "A" } } }) });
  const d = byId(changed)[A].differs.find((e) => e.check === "grade");
  assert.deepEqual([d.axis, d.recorded, d.recomputed], ["capture", "A", "B"]);
  assert.equal(byId(changed)[A].result, "did_not_recreate");
  /* the answer a leg states for the finding it rests on recomputes too: changed, it differs for both */
  const legFacts = gradingFacts(); legFacts[A].legs[1].answer.capture = { state: "graded", grade: "D" };
  const leg = await check({ signedFacts: legFacts, mutate: (t) => t.set(CG.caseFilePath("grading_facts", A), JSON.stringify(legFacts[A])) });
  assert.ok(has(byId(leg)[B].differs, "grade", /the grading facts of INQ-2026-0001-lease records D/));
  assert.ok(has(byId(leg)[A].differs, "grade", /rests on INQ-2026-0002-board, whose stated grade on capture does not recompute/));
  /* the carried grading facts must be what the signed document states */
  const lied = await check({ mutate: (t) => t.set(CG.caseFilePath("grading_facts", C), JSON.stringify({ legs: [] })) });
  assert.ok(has(byId(lied)[C].differs, "grade", /carried grading facts are not the facts the signed case document states/));
  /* a version this checker does not hold */
  const unknown = await check({ mutate: (t) => t.set(CG.caseFilePath("case_document"), t.get(CG.caseFilePath("case_document")).replace("grading: \"bio-grading/1\"", "grading: \"bio-grading/99\"")) });
  for (const f of unknown.findings) {
    assert.ok(f.missing.some((e) => e.check === "grade" && e.version === "bio-grading/99" && /does not hold/.test(e.detail)), f.finding);
    assert.equal(f.pair, null);
  }
});

test("R6: a load-bearing member reaching the bar answers true; one short of it false, naming each axis, and that differs; a supporting member is not_asked; a case with no bar no_bar", async () => {
  const r = await check();
  assert.equal(byId(r)[A].bar_met, true);
  assert.equal(byId(r)[C].bar_met, "not_asked");
  assert.equal(byId(r)[B].bar_met, "not_asked");
  const high = await check({ bar: { declared: true, capture: "A", connection: "A" } });
  assert.equal(byId(high)[A].bar_met, false);
  assert.deepEqual(byId(high)[A].differs.filter((e) => e.check === "bar").map((e) => [e.axis, e.bar]), [["capture", "A"], ["connection", "A"]]);
  assert.equal(byId(high)[A].result, "did_not_recreate");
  assert.equal(byId(high)[C].bar_met, "not_asked");
  const none = await check({ bar: { declared: false, capture: null, connection: null } });
  assert.equal(byId(none)[A].bar_met, "no_bar");
});

test("R7: the publication checks run over the case document; a refusal differs for the case; record-bound arms are named unasked; a stated catalogue version not the checker's is said", async () => {
  const r = await check();
  assert.equal(r.publication_checks.ran, true);
  assert.deepEqual(r.publication_checks.findings, []);
  assert.equal(r.publication_checks.stated_version, CATALOG_VERSION);
  assert.equal(r.publication_checks.checker_version, CATALOG_VERSION);
  assert.equal(r.publication_checks.statement, null);
  assert.ok(r.publication_checks.unasked.some((u) => /C-21\.1/.test(u)));
  const refused = await check({ mutate: (t) => t.set(CG.caseFilePath("case_document"), t.get(CG.caseFilePath("case_document")).replace('case_scope: "Who approved the lease, and on what record."', 'case_scope: ""')) });
  assert.ok(refused.publication_checks.findings.some((x) => x.check === "C-41.5"));
  assert.ok(refused.findings.every((f) => f.result === "did_not_recreate" && has(f.differs, "publication", /C-41\.5/)));
  const older = await check({ mutate: (t) => t.set(CG.caseFilePath("case_document"), t.get(CG.caseFilePath("case_document")).replace(`checks: "${CATALOG_VERSION}"`, 'checks: "1.0.0"')) });
  assert.equal(older.publication_checks.stated_version, "1.0.0");
  assert.equal(older.publication_checks.statement, CC.CHECKS_VERSION_STATEMENT("1.0.0", CATALOG_VERSION));
  assert.match(older.publication_checks.statement, /ran at this checker's version/);
});

test("R8: every material a load-bearing chain reaches is listed included and carried whole; listed not included differs, and carried bytes missing are missing", async () => {
  const notIncluded = await check({ memoIncluded: false, mutate: (t) => { t.delete(CG.caseFilePath("document", MEMO)); t.delete(CG.caseFilePath("extracted_text", MEMO)); } });
  assert.equal(byId(notIncluded)[A].result, "did_not_recreate");
  assert.ok(has(byId(notIncluded)[A].differs, "presentability", /load-bearing and rests on the document INFO-2026-0002-memo, which the case lists as not travelling whole/));
  /* B is reached, not a load-bearing member: not asked to be presentable, and nothing it lacks is missing */
  assert.equal(byId(notIncluded)[B].result, "recreated");
  const more = gradingFacts(); more[A].legs.push({ target: "INFO-2026-0077-gone", kind: "document", role: "supports", grade: "C", grade_axis: "capture", grade_source: "capture" });
  const unlisted = await check({ facts: more });
  assert.ok(has(byId(unlisted)[A].differs, "presentability", /reaches document INFO-2026-0077-gone, which the case document's materials do not list/));
  const gone = await check({ edit: (b) => b.delete(CG.caseFilePath("document", MINUTES)) });
  assert.equal(byId(gone)[A].result, "recreated_in_part");
  assert.ok(byId(gone)[A].missing.some((e) => e.check === "presentability" && e.origin === "https://records.example/minutes.pdf"));
});

test("R9: a document supplied later that matches a missing file's fingerprint fills the gap and the finding is re-checked; one that matches nothing is named and never used", async () => {
  const cf = caseFile({ edit: (b) => b.delete(CG.caseFilePath("document", MINUTES)) });
  const before = await CC.checkCaseFile({ parts: cf.parts });
  assert.equal(byId(before)[A].result, "recreated_in_part");
  const after = await CC.checkCaseFile({ parts: cf.parts, documents: [Buffer.from(MINUTES_BYTES)] });
  assert.deepEqual(results(after), ALL_RECREATED);
  assert.deepEqual(after.integrity.documents.used, [sha(MINUTES_BYTES)]);
  assert.equal(after.integrity.files.find((f) => f.path === CG.caseFilePath("document", MINUTES)).state, "supplied");
  const stranger = await CC.checkCaseFile({ parts: cf.parts, documents: [Buffer.from("some other document")] });
  assert.equal(byId(stranger)[A].result, "recreated_in_part");
  assert.deepEqual(stranger.integrity.documents.unmatched.map((u) => u.sha256), [sha("some other document")]);
  assert.match(stranger.integrity.documents.unmatched[0].detail, /matches no fingerprint/);
  assert.deepEqual(stranger.integrity.documents.used, []);
  /* bytes matching a file that is carried are not "used": nothing was missing there */
  const carried = await check({}, { documents: [Buffer.from(MINUTES_BYTES)] });
  assert.equal(carried.integrity.documents.unmatched.length, 1);
});

test("R10: the carried complete edition equals the one the rest of the case file renders; a different one differs for the case", async () => {
  const r = await check();
  assert.equal(r.complete_edition.equal, true);
  assert.equal(r.complete_edition.sha256, r.complete_edition.rendered_sha256);
  const other = await check({ completeEdition: "<!doctype html><p>another edition</p>" });
  assert.equal(other.complete_edition.equal, false);
  assert.deepEqual(new Set(Object.values(results(other))), new Set(["did_not_recreate"]));
  assert.ok(other.findings.every((f) => has(f.differs, "complete_edition", /is not the edition the rest of the case file renders/)));
});

/* R10 (DEC-124; K1365 (1)): a `/6` case file as published before T31, built and packed by this fixture on `main` @
   d2b7451b80 (the commit T31 opened from) and kept whole as bytes, so its complete edition is the one rendered then. */
const BEFORE_T31 = readFileSync(new URL("./case-file-6-before-T31.zip", import.meta.url));

test("R10: a bio-case-document/6 case file whose complete edition was rendered before T31 still compares equal, with no differs entry", async () => {
  const r = await CC.checkCaseFile({ parts: [new Uint8Array(BEFORE_T31)] });
  const doc = r.integrity.files.find((f) => f.kind === "case_document");
  assert.ok(doc && doc.state === "intact");
  assert.equal(r.complete_edition.equal, true, r.complete_edition.detail);
  assert.equal(r.complete_edition.sha256, r.complete_edition.rendered_sha256);
  for (const f of r.findings) assert.deepEqual(f.differs, [], f.finding);
  assert.deepEqual(results(r), ALL_RECREATED);
  /* and it is the edition that names the product as it was then */
  const read = CC.readCaseFile([new Uint8Array(BEFORE_T31)]);
  const edition = new TextDecoder().decode(read.files.find((f) => f.kind === "complete_edition").content);
  assert.match(new TextDecoder().decode(read.files.find((f) => f.kind === "case_document").content), /^---\nformat: bio-case-document\/6\n/);
  assert.ok(edition.includes("Made with CivicOS") && !edition.includes("Civicsmith"));
});

test("R10: a bio-case-document/7 case file compares its complete edition rendered with the name Civicsmith; one carrying the CivicOS words differs for the case", async () => {
  const seven = { format: "bio-case-document/7" };
  const r = await check(seven);
  assert.equal(r.complete_edition.equal, true, r.complete_edition.detail);
  assert.deepEqual(results(r), ALL_RECREATED);
  const edition = caseFile(seven).bytesOf.get(CG.caseFilePath("complete_edition")).toString("utf8");
  assert.ok(edition.includes("Civicsmith") && !edition.includes("CivicOS"));
  /* the same /7 case file carrying an edition in the old words: the rest renders another edition, so it differs */
  const old = await check({ ...seven, completeEdition: edition.replaceAll("Civicsmith", "CivicOS") });
  assert.equal(old.complete_edition.equal, false);
  assert.deepEqual(new Set(Object.values(results(old))), new Set(["did_not_recreate"]));
  assert.ok(old.findings.every((f) => has(f.differs, "complete_edition", /is not the edition the rest of the case file renders/)));
  /* and a /6 case file carrying the new words differs the same way */
  const six = caseFile().bytesOf.get(CG.caseFilePath("complete_edition")).toString("utf8");
  const renamed = await check({ completeEdition: six.replaceAll("CivicOS", "Civicsmith") });
  assert.equal(renamed.complete_edition.equal, false);
});

test("R12: no answer composes a case-level strength or a single verdict: pairs are per finding and per axis, and recreation is never stated as endorsement", async () => {
  for (const r of [await check(), await check({ caseSigner: "mallory" })]) {
    const top = Object.keys(r);
    for (const k of ["strength", "pair", "result", "verdict", "score", "trust", "endorsed"]) assert.equal(top.includes(k), false, k);
    for (const f of r.findings) if (f.pair) assert.deepEqual(Object.keys(f.pair), ["capture", "connection", "testimony"]);
    const words = JSON.stringify(r).split(CC.RECREATION_STATEMENT).join("");
    assert.equal(/endorse/i.test(words), false);
    assert.equal(/case (is|was) (true|proven|verified)/i.test(words), false);
  }
});

test("R16: the same arguments always give the same answer, byte-identical canonical JSON", async () => {
  const cf = caseFile({ parts: 2, withImported: true });
  const a = canonicalJson(await CC.checkCaseFile({ parts: cf.parts, keys: [keyFor("group").line] }));
  const b = canonicalJson(await CC.checkCaseFile({ parts: cf.parts.map((p) => new Uint8Array(p)), keys: [keyFor("group").line] }));
  assert.equal(a, b);
  /* reads only its arguments: the parts are not changed */
  const copy = cf.parts.map((p) => Buffer.from(p));
  await CC.checkCaseFile({ parts: cf.parts });
  cf.parts.forEach((p, i) => assert.equal(Buffer.compare(Buffer.from(p), copy[i]), 0));
});

test("R18: a finding resting on another group's accepted finding recreates up to that leg, lists it under rests_on_another_group, adds no missing entry and is never recreated on that group's behalf", async () => {
  const r = await check({ withImported: true });
  assert.deepEqual(results(r), ALL_RECREATED);
  assert.deepEqual(byId(r)[A].missing, []);
  assert.deepEqual(r.rests_on_another_group, [{ group: "riverside-watch", case: "CASE-2026-0007", edition: 2, finding: "INQ-2026-0042-lease", manifest_sha: sha("their manifest") }]);
  assert.equal(r.rests_on_another_group_statement, CC.REST_ON_ANOTHER_GROUP_STATEMENT);
  assert.match(r.rests_on_another_group_statement, /checked against that group's own case file/);
  /* the imported finding is not itself a finding of this answer */
  assert.equal(r.findings.some((f) => f.finding === REF || f.finding === "INQ-2026-0042-lease"), false);
  /* the row's pair is that leg's fact: a recorded pair that differs from it differs */
  const off = await check({ withImported: true, recorded: (p) => ({ ...p, [A]: { ...p[A], connection: { state: "graded", grade: "A" } } }) });
  assert.equal(byId(off)[A].result, "did_not_recreate");
  /* with no imported leg, nothing is listed */
  assert.deepEqual((await check()).rests_on_another_group, []);
});
