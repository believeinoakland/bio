/* citation: a question resting on another team's accepted finding at a named edition, and taking that leg back
   (R16, R17; T51, K4189, UC-082), at the module's interface: the ops as the door calls them (`citationOps` over an
   address), over the real `inquiry` booted on the host and the real `accepted-work`, whose one registration is the
   test's stand-in for `case-import` (a later layer): its acceptance of an edition is a switch the test turns, as
   `importaccept` turns it. Each refusal has a control. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP, inqMd } from "./fixture.mjs";
import { citationOps, CITE_CHECKS, CITE_IMPORTED_CHECKS } from "../../../src/citation/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

const IMP = "c".repeat(64), FIND = "INFO-2026-0007-x", REF = importedFindingRef(IMP, FIND);
const Q = "INQ-2026-0001-q", ED = 3;
const ANN = { viewer: V("ann"), author: V("ann"), identity: V("ann") };
const INHERITS = localize("citation.index.imported_inherits_publication", "citing this inherits the fact of publication, not the credibility of its content");
const ALREADY = localize("citation.index.imported_already_cited", "this question already rests on that finding; nothing was written. Moving to a later edition is the re-evaluation's act, not a second leg.");

/* A question, and another team's finding at edition 3 that this team has not (yet) accepted. */
function setup() {
  const w = world({ inquiry: true });
  w.inquiry(Q);
  const stand = { accepted: false, flags: [] };
  const reg = acceptedWorkOf(w.host).registerAcceptedWork("case-import", {
    finding: ({ ref, edition }) => (ref === REF && edition === ED
      ? { ref, import: IMP, group: "other-group", case: "CASE-2026-0004-c", edition: ED, finding: FIND, pair: { capture: "B", connection: "C" },
          acceptance: stand.accepted ? { by: "member:zed", at: "2026-09-27T10:00:00Z", reason: "the other team's audit held", checked: [], gaps: [] } : null }
      : null),
    openFlags: () => ({ flags: stand.flags, complete: true }),
    withdrawals: () => ({ withdrawals: [], cursor: null }),
  });
  assert.ok(reg && reg.ok !== false, JSON.stringify(reg));
  /* the ops as the door calls them: the fields in the address */
  const call = (op, fields) => {
    const q = new URLSearchParams(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]));
    return citationOps(w.cit, new URL(`http://x/?${q}`))[op]();
  };
  const cite = (more = {}) => call("citeimported", { inquiry: Q, import: IMP, finding: FIND, edition: ED, role: "supports", note: "the audit is public", ...ANN, ...more });
  const withdraw = (more = {}) => call("withdrawimported", { inquiry: Q, import: IMP, finding: FIND, reason: "the case was re-opened", ...ANN, ...more });
  return { w, stand, call, cite, withdraw };
}

test("R16: an accepted edition is cited as one leg of the question's basis (target, target_edition, role, note and nothing else, not in references), and re-reads through basisFor as a leg with no grade of its own", () => {
  const { w, stand, cite } = setup();
  stand.accepted = true;
  const r = cite();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.cited, r.alreadyCited, r.citingObjectType, r.role, r.gradesFilled], [[REF], [], "inquiry", "supports", 0]);
  assert.deepEqual(r.legs, [{ target: REF, target_edition: ED, role: "supports" }]);
  assert.equal(r.bundleSha, w.record.head(Q).bundleSha);
  assert.deepEqual(w.fm(Q).basis, [{ target: REF, role: "supports", target_edition: ED, note: "the audit is public" }]);
  assert.deepEqual(w.fm(Q).references, [], "an imported leg is not listed in references[]");
  /* the receipt's origin: what the other team's case published, and what the leg inherits */
  assert.deepEqual(r.origin, { group: "other-group", case: "CASE-2026-0004-c", edition: ED, finding: FIND,
                               acceptance: { by: "member:zed", at: "2026-09-27T10:00:00Z", reason: "the other team's audit held" }, openFlags: 0 });
  assert.equal(r.inherits, INHERITS);
  /* read back through the record's own reads: the leg is there at that edition, stating no grade, axis or source */
  const leg = w.inquiryModule.basisFor(Q).legs.find((l) => l.target_id === REF);
  assert.ok(leg, JSON.stringify(w.inquiryModule.basisFor(Q)).slice(0, 400));
  assert.deepEqual([leg.role, leg.grade, leg.grade_axis, leg.grade_source], ["supports", null, null, null]);
  /* the Session Log entry names the author, the ref, the edition, the role and the note */
  const log = w.md(Q).slice(w.md(Q).indexOf("## Session Log"));
  for (const part of [V("ann"), REF, `edition ${ED}`, "supports", "the audit is public"]) assert.ok(log.includes(part), part);
  assert.equal(w.fm(Q).last_updated, STAMP);
});

test("R16: a flag open on the edition is counted in the receipt's origin, and a cuts_against leg is written as the member said", () => {
  const { w, stand, cite } = setup();
  stand.accepted = true;
  stand.flags = [{ flag: "F1", finding: FIND, issue: "x", at: "2026-09-28T00:00:00Z" }, { flag: "F2", finding: FIND, issue: "y", at: "2026-09-28T00:00:00Z" }];
  const r = cite({ role: "cuts_against", note: "" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.origin.openFlags, 2);
  assert.equal(w.fm(Q).basis[0].role, "cuts_against");
});

test("R16: an edition this team has not accepted is refused IMPORTED_NOT_ACCEPTED inside BASIS_REFUSED with the document unchanged, and the same call lands once it is accepted", () => {
  const { w, stand, cite } = setup();
  const before = w.snapshot();
  const bytes = w.md(Q);
  const refused = cite();
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "BASIS_REFUSED");
  assert.deepEqual(refused.findings.map((f) => f.code), ["IMPORTED_NOT_ACCEPTED"]);
  assert.equal(w.md(Q), bytes, "the document is unchanged");
  assert.deepEqual(w.snapshot(), before, "nothing was written");
  /* the control: after the acceptance, the very same call lands */
  stand.accepted = true;
  const landed = cite();
  assert.equal(landed.ok, true, JSON.stringify(landed).slice(0, 300));
  assert.equal(w.fm(Q).basis.length, 1);
});

test("R16: an edition or an import the other team's case does not hold is refused IMPORTED_NOT_ACCEPTED alike, and an unreadable acceptance ACCEPTED_WORK_UNREADABLE, inside BASIS_REFUSED", () => {
  const { w, stand, cite } = setup();
  stand.accepted = true;
  const other = cite({ edition: 4 });
  assert.equal(other.reason, "BASIS_REFUSED");
  assert.deepEqual(other.findings.map((f) => f.code), ["IMPORTED_NOT_ACCEPTED"]);
  const elsewhere = cite({ import: "d".repeat(64) });
  assert.deepEqual(elsewhere.findings.map((f) => f.code), ["IMPORTED_NOT_ACCEPTED"]);
  /* unreadable: a world whose acceptance cannot be read (no registration on the host) */
  const bare = world({ inquiry: true });
  bare.inquiry(Q);
  const r = citationOps(bare.cit, new URL(`http://x/?${new URLSearchParams({ inquiry: Q, import: IMP, finding: FIND, edition: ED, role: "supports", ...ANN })}`)).citeimported();
  assert.equal(r.reason, "BASIS_REFUSED");
  assert.deepEqual(r.findings.map((f) => f.code), ["ACCEPTED_WORK_UNREADABLE"]);
  assert.equal(bare.fm(Q).basis, undefined);
  assert.equal(w.fm(Q).basis, undefined);
});

test("R16: a question already holding a leg on the finding answers ok with alreadyCited and its edition and writes nothing; a later edition is not a second leg", () => {
  const { w, stand, cite } = setup();
  stand.accepted = true;
  assert.equal(cite().ok, true);
  const snap = w.snapshot();
  const again = cite();
  assert.deepEqual([again.ok, again.cited, again.alreadyCited, again.edition, again.rowVersion], [true, [], [REF], ED, null]);
  assert.equal(again.detail, ALREADY);
  const later = cite({ edition: 4 });
  assert.deepEqual([later.ok, later.cited, later.alreadyCited, later.edition], [true, [], [REF], ED], "the held leg stays at its own edition");
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  assert.equal(w.fm(Q).basis.length, 1);
});

test("R16: refusals in order, each writing nothing: a machine or unnamed author, the citing object (absent, unseen, not a question), the ref, the edition, the role, the note", () => {
  const { w, stand, call, cite } = setup();
  stand.accepted = true;
  const proj = w.project("A case", "ann");
  const hiddenQ = "INQ-2026-0002-h";
  w.put(hiddenQ, inqMd(hiddenQ, [`project: ${proj}`]));
  const snap = w.snapshot();
  const code = (a) => a.reason;
  /* MACHINE_CANNOT_CITE_IMPORTED comes before every other judgement */
  for (const author of [undefined, "", "class:daemon", "admin"]) {
    const r = cite({ author, inquiry: "INQ-2026-9999-nope", edition: "0" });
    assert.equal(code(r), "MACHINE_CANNOT_CITE_IMPORTED", `author ${JSON.stringify(author)}`);
    assert.equal(r.check, CITE_IMPORTED_CHECKS.MACHINE_CANNOT_CITE_IMPORTED.check);
    assert.equal(r.translation, CITE_IMPORTED_CHECKS.MACHINE_CANNOT_CITE_IMPORTED.translation);
  }
  /* the citing object: absent and hidden answer as membership.noSuchProject does; a project is NOT_AN_INQUIRY */
  assert.deepEqual(cite({ inquiry: "INQ-2026-9999-nope" }), noSuchProject("INQ-2026-9999-nope"));
  const notQ = cite({ inquiry: proj });
  assert.equal(code(notQ), "NOT_AN_INQUIRY");
  assert.equal(notQ.check, CITE_CHECKS.NOT_AN_INQUIRY.check);
  /* a question belonging to ann's hidden case, which vera may not see, answers as an absent one */
  const VERA = V("vera");
  assert.deepEqual(cite({ inquiry: hiddenQ, viewer: VERA, author: VERA, identity: VERA }), noSuchProject(hiddenQ));
  /* the ref, the edition, the role, the note: each in this order, naming its own code and row */
  const badRef = cite({ finding: "not an id", edition: "0", role: undefined });
  assert.equal(code(badRef), "IMPORTED_REF_MALFORMED");
  assert.equal(badRef.check, CITE_IMPORTED_CHECKS.IMPORTED_REF_MALFORMED.check);
  assert.equal(code(cite({ import: "short", edition: "0" })), "IMPORTED_REF_MALFORMED");
  for (const edition of ["0", "-1", "1.5", "three", "", undefined]) {
    const r = cite({ edition, role: undefined });
    assert.equal(code(r), "IMPORTED_EDITION_MALFORMED", `edition ${edition}`);
    assert.equal(r.check, CITE_IMPORTED_CHECKS.IMPORTED_EDITION_MALFORMED.check);
  }
  const noRole = cite({ role: undefined, note: "x".repeat(300) });
  assert.equal(code(noRole), "NO_ROLE");
  assert.deepEqual(noRole.roles, ["supports", "cuts_against"]);
  assert.equal(code(cite({ role: "decides", note: "x".repeat(300) })), "BAD_ROLE");
  for (const note of ["x".repeat(201), 'a "quote"', "a \\ slash", "two\nlines"]) {
    const r = cite({ note });
    assert.equal(code(r), "BAD_NOTE", note.slice(0, 20));
    assert.equal(r.check, CITE_CHECKS.BAD_NOTE.check);
  }
  assert.deepEqual(w.snapshot(), snap, "none of them wrote");
  /* the control: the very call without a fault lands, on the question ann may see as on the one she may not */
  assert.equal(cite().ok, true);
  assert.equal(cite({ inquiry: hiddenQ }).ok, true);
  assert.equal(call("citeimported", { inquiry: Q, import: IMP, finding: FIND, edition: ED, role: "supports", ...ANN }).alreadyCited[0], REF);
});

test("R16: a document whose basis block cannot be extended in place is refused UNSPLICEABLE_BASIS, one that does not parse by its readability refusal, and one that would pass 1 MiB CITATION_TOO_LARGE; nothing is written", () => {
  const { w, stand } = setup();
  stand.accepted = true;
  const doc = w.md(Q);
  const run = (text) => w.withDocument(Q, text).citeImported({ inquiry: Q, import: IMP, finding: FIND, edition: ED, role: "supports", ...ANN });
  const snap = w.snapshot();
  const inline = run(doc.replace("references: []", "references: []\nbasis: pending"));
  assert.equal(inline.reason, "UNSPLICEABLE_BASIS");
  assert.equal(run(null).reason, "NO_BUNDLE_MD");
  assert.equal(run("no frontmatter at all").reason, "UNPARSEABLE_FRONTMATTER");
  assert.equal(run(doc.replace("references: []", "references: []\nfiller: " + "x".repeat(1_048_576))).reason, "CITATION_TOO_LARGE");
  assert.deepEqual(w.snapshot(), snap);
  /* the control: the same shape with `basis: []` takes the leg */
  assert.equal(run(doc.replace("references: []", "references: []\nbasis: []")).ok, true);
});

test("R17: cite then withdraw leaves basisFor without the leg and the Session Log naming author, ref, edition and reason; the earlier bytes stay in history", () => {
  const { w, stand, cite, withdraw } = setup();
  stand.accepted = true;
  assert.equal(cite().ok, true);
  const withLeg = w.md(Q);
  const gone = withdraw();
  assert.equal(gone.ok, true, JSON.stringify(gone).slice(0, 400));
  assert.deepEqual([gone.withdrawn, gone.editions, gone.why, gone.citingObjectType], [[REF], [ED], "the case was re-opened", "inquiry"]);
  assert.equal(w.inquiryModule.basisFor(Q).legs.some((l) => l.target_id === REF), false);
  assert.deepEqual(w.fm(Q).basis, [], "an empty block, not a missing one");
  const log = w.md(Q).slice(w.md(Q).indexOf("## Session Log"));
  for (const part of [V("ann"), REF, `edition ${ED}`, "the case was re-opened"]) assert.ok(log.includes(part), part);
  assert.equal(w.fm(Q).last_updated, STAMP);
  /* history keeps the earlier bytes */
  const history = Object.entries(w.record.readImage(Q)).filter(([path]) => path.startsWith("_history/bundle_")).map(([, text]) => text);
  assert.ok(history.some((text) => text.includes(`target: ${REF}`)), "a snapshot holds the leg");
  assert.ok(withLeg.includes(`target: ${REF}`));
  /* and it can be cited again: the control that the withdrawal left the question as it was before */
  assert.equal(cite().ok, true);
  assert.equal(w.fm(Q).basis.length, 1);
});

test("R17: withdrawing one leg leaves the question's other legs untouched, byte for byte", () => {
  const { w, stand, cite, withdraw } = setup();
  w.info("INFO-2026-0001-doc");
  stand.accepted = true;
  return w.select(["INFO-2026-0001-doc"]).then((handle) => {
    assert.equal(w.cit.cite({ project: Q, handle, owner: "o", ...ANN, role: "supports", note: "mine" }).ok, true);
    assert.equal(cite().ok, true);
    const before = w.fm(Q).basis;
    assert.equal(before.length, 2);
    assert.equal(withdraw().ok, true);
    assert.deepEqual(w.fm(Q).basis, [before[0]]);
    assert.deepEqual(w.fm(Q).references.map((e) => e.target), ["INFO-2026-0001-doc"]);
  });
});

test("R17: refusals in order, each writing nothing: a machine, the citing object, NO_REASON, BAD_REASON, NOT_CITED; a leg on an ordinary target is NOT_CITED here and sever still moves it", async () => {
  const { w, stand, cite, withdraw } = setup();
  stand.accepted = true;
  w.info("INFO-2026-0001-doc");
  const handle = await w.select(["INFO-2026-0001-doc"]);
  assert.equal(w.cit.cite({ project: Q, handle, owner: "o", ...ANN, role: "supports" }).ok, true);
  assert.equal(cite().ok, true);
  const proj = w.project("A case", "ann");
  const snap = w.snapshot();
  assert.equal(withdraw({ author: "class:daemon" }).reason, "MACHINE_CANNOT_CITE_IMPORTED");
  assert.deepEqual(withdraw({ inquiry: "INQ-2026-9999-nope" }), noSuchProject("INQ-2026-9999-nope"));
  assert.equal(withdraw({ inquiry: proj }).reason, "NOT_AN_INQUIRY");
  for (const reason of [undefined, "", "   "]) assert.equal(withdraw({ reason }).reason, "NO_REASON");
  for (const reason of ["x".repeat(161), 'a "quote"', "a \\ slash", "two\nlines"]) assert.equal(withdraw({ reason }).reason, "BAD_REASON", reason.slice(0, 20));
  /* NOT_CITED: a finding the question does not rest on, an ordinary target, a ref that cannot be spelled */
  assert.equal(withdraw({ finding: "INFO-2026-0008-y" }).reason, "NOT_CITED");
  assert.equal(withdraw({ finding: "INFO-2026-0001-doc", import: "e".repeat(64) }).reason, "NOT_CITED");
  assert.equal(withdraw({ finding: "not an id" }).reason, "NOT_CITED");
  assert.deepEqual(w.snapshot(), snap, "none of them wrote");
  /* sever still moves the ordinary leg, and cannot take the imported one back */
  const sev = w.cit.sever({ project: Q, handle, owner: "o", ...ANN, reason: "wrong edition" });
  assert.equal(sev.ok, true, JSON.stringify(sev).slice(0, 300));
  const impHandle = await w.select([REF]);
  assert.equal(w.cit.sever({ project: Q, handle: impHandle, owner: "o", ...ANN, reason: "no" }).ok, false);
  assert.equal(w.fm(Q).basis.some((l) => l.target === REF), true, "the imported leg is still there");
  /* the control: the withdrawal works */
  assert.equal(withdraw().ok, true);
});

test("R17: a question that cannot be revised is refused as any write to it is, the write's refusal relayed unchanged", () => {
  const { w, stand, cite, withdraw } = setup();
  stand.accepted = true;
  w.info("INFO-2026-0001-doc");
  return w.select(["INFO-2026-0001-doc"]).then((handle) => {
    assert.equal(w.cit.cite({ project: Q, handle, owner: "o", ...ANN, role: "supports" }).ok, true);
    assert.equal(cite().ok, true);
    const divided = w.inquiryModule.divide({ target: Q, reason: "two questions", viewer: ANN.viewer, author: ANN.author,
      children: [{ id: "INQ-2026-0010-a", question: "First half?", legs: [0] }, { id: "INQ-2026-0011-b", question: "Second half?", legs: [1] }] });
    assert.ok(divided && divided.ok, JSON.stringify(divided).slice(0, 300));
    const snap = w.snapshot();
    const r = withdraw();
    assert.equal(r.ok, false);
    assert.equal(r.reason, "DIVIDED_CANNOT_RESTRUCTURE", JSON.stringify(r).slice(0, 300));
    assert.deepEqual(w.snapshot(), snap);
  });
});

test("R16, R17: the three new codes carry the next free C-33 rows and a translation each", () => {
  assert.deepEqual(Object.entries(CITE_IMPORTED_CHECKS).map(([code, row]) => [code, row.check]),
    [["MACHINE_CANNOT_CITE_IMPORTED", "C-33.55"], ["IMPORTED_REF_MALFORMED", "C-33.56"], ["IMPORTED_EDITION_MALFORMED", "C-33.57"]]);
  for (const row of Object.values(CITE_IMPORTED_CHECKS)) assert.ok(typeof row.translation === "string" && row.translation.length > 20);
});
