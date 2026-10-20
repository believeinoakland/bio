/* review T51 (FR-19): an edit keeps what it does not send (R37), the copy answers the choices and the account (R38), a draft
   begins from a published case (R39), a short title (R40) and a finding's own words (R41). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET } from "./fixture.mjs";
import { REVIEW_DRAFT_FIELDS } from "../../../src/review/index.mjs";
import { AUTHORED_FIELDS, ACT_FIELDS, MEMBER_ROLES } from "../../../src/case-authoring/index.mjs";
import { SUBJECT_POSITIONS } from "../../../src/ratification/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const CASE = "CASE-2026-0001";
const A = "INQ-2026-0001-a", B = "INQ-2026-0002-b";
const copy = (w, d, viewer = "ann") => w.r.copy({ draft: d.draftId ?? d, viewer: V(viewer) });
const stored = (w, d) => w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, d.draftId);
const world = () => {
  const w = standard();
  w.bundle(A, "inquiry", `---\nid: ${A}\nobject_type: inquiry\ntitle: "Is the pump safe?"\n---\n\nThe pump is safe.\n`, "concluded");
  w.bundle(B, "inquiry", "plain words, no front matter\n", "concluded");
  return w;
};

test("R37: REVIEW_DRAFT_FIELDS is derived from case-authoring's R65 lists (account included), with no second hand list", () => {
  const derived = [...new Set([...AUTHORED_FIELDS, ...ACT_FIELDS])].filter((k) => !["project", "draft", "viewer", "author"].includes(k));
  assert.deepEqual([...REVIEW_DRAFT_FIELDS], derived);
  for (const k of ["account", "whatChanged", "statementCites", "accountDraft", "reviewComments", "targets", "caseId"])
    assert.ok(REVIEW_DRAFT_FIELDS.includes(k), k);
  for (const k of ["project", "draft", "viewer", "author"]) assert.ok(!REVIEW_DRAFT_FIELDS.includes(k), `${k} is not a draft's argument`);
});

test("R37: an edit that sends only the draft and one field keeps the findings, the statement, the account and the case", () => {
  const w = world();
  w.publishedCase(CASE, P, 1);
  const d = w.r.act({ act: "draft", author: "ed", project: P, caseId: CASE, targets: [A, B], statement: "S", account: "an account",
                      roles: { [A]: "load_bearing" } });
  const e = w.r.act({ act: "draft", author: "ann", draft: d.draftId, scope: "the scope" });
  assert.deepEqual([e.ok, e.edited, e.caseId, e.edition], [true, true, CASE, 2]);
  const c = copy(w, d);
  assert.deepEqual(c.findings.map((f) => [f.target, f.role]), [[A, "load_bearing"], [B, null]]);
  assert.deepEqual([c.authored.statement, c.authored.account, c.authored.scope], ["S", "an account", "the scope"]);
  assert.equal(stored(w, d).case_id, CASE, "the stored case is not NULLed");
  assert.equal(stored(w, d).statement_by, "ed", "the statement was not rewritten, so its writer stands");
  assert.equal(c.case.case_id, CASE);
  /* control: a field sent replaces only itself */
  assert.deepEqual(Object.keys(JSON.parse(stored(w, d).params)).sort(), ["account", "caseId", "roles", "scope", "statement", "targets"]);
});

test("R37: a sent null or blank value clears that field, caseId: null clears the case, and an empty list is a value, not a clearing", () => {
  const w = world();
  w.publishedCase(CASE, P, 1);
  const d = w.r.act({ act: "draft", author: "ed", project: P, caseId: CASE, targets: [A], statement: "S", scope: "x", excluded: [{ id: "X" }] });
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, caseId: null });
  assert.equal(stored(w, d).case_id, null, "an explicit caseId: null clears the case");
  assert.equal("caseId" in JSON.parse(stored(w, d).params), false);
  assert.equal(copy(w, d).case.case_id, null);
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, scope: null, statement: "   " });
  const c = copy(w, d);
  assert.deepEqual([c.authored.scope, c.authored.statement, stored(w, d).statement_by], [null, null, null], "null and blank clear");
  assert.deepEqual(c.findings.map((f) => f.target), [A], "the findings it did not send stand");
  /* control: an empty list is a claim (case-authoring R3), kept; targets: null clears the findings */
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, excluded: [] });
  assert.deepEqual(copy(w, d).authored.excluded, []);
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, targets: null });
  assert.deepEqual(copy(w, d).findings, []);
  /* control: a field outside the draft's fields is dropped, as it always was */
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, extra: 1, viewerx: "z" });
  assert.deepEqual(Object.keys(JSON.parse(stored(w, d).params)).sort(), ["excluded"]);
});

test("R38: copy answers the choices op=publish accepts and the account and what changed, at both doors", () => {
  const w = world();
  const d = w.r.act({ act: "draft", author: "ed", project: P, statement: "S", account: "an account", whatChanged: "the pump" });
  w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: SECRET(1) });
  for (const c of [copy(w, d), w.r.copy({ secretSha: SECRET(1), bySecret: true })]) {
    assert.deepEqual(c.choices, { subject_positions: [...SUBJECT_POSITIONS], roles: [...MEMBER_ROLES] });
    assert.deepEqual([c.authored.account, c.authored.whatChanged], ["an account", "the pump"]);
  }
  /* control: a copy's choices cannot change the lists they were read from */
  const c = copy(w, d);
  c.choices.roles.push("x");
  assert.deepEqual([...MEMBER_ROLES], ["load_bearing", "supporting"]);
  /* control: a draft with neither field says null */
  const bare = w.r.act({ act: "draft", author: "ed", project: P, statement: "S" });
  assert.deepEqual([copy(w, bare).authored.account, copy(w, bare).authored.whatChanged], [null, null]);
});

test("R39: a draft naming a published case begins from its highest edition's findings, roles and scope, and writes nothing of the case", () => {
  const w = world();
  w.publishedCase(CASE, P, 2, { scope: "the published scope", members: [[A, "load_bearing"], [B, null]] });
  const before = w.snapshot();
  const d = w.r.act({ act: "draft", author: "ed", project: P, caseId: CASE });
  assert.deepEqual([d.ok, d.caseId, d.edition], [true, CASE, 3]);
  const c = copy(w, d);
  assert.deepEqual(c.findings.map((f) => [f.target, f.present, f.role]), [[A, true, "load_bearing"], [B, true, null]]);
  assert.equal(c.authored.scope, "the published scope");
  assert.deepEqual([c.authored.statement, c.authored.excluded, c.authored.subjectJustification, c.authored.account], [null, null, null, null],
    "what every edition authors afresh is not carried");
  const after = w.snapshot();
  for (const t of ["cases", "published_cases", "published_case_members", "case_documents"])
    assert.equal(after[t], before[t], `${t}: the case file is not written`);
  /* control: what the act sent is the member's own and is not filled over */
  const own = w.r.act({ act: "draft", author: "ed", project: P, caseId: CASE, targets: [B], scope: "mine" });
  assert.deepEqual(copy(w, own).findings.map((f) => f.target), [B]);
  assert.equal(copy(w, own).authored.scope, "mine");
  const none = w.r.act({ act: "draft", author: "ed", project: P, caseId: CASE, targets: null });
  assert.deepEqual(copy(w, none).findings, []);
  /* control: an edit does not begin again, and a draft naming no case carries nothing from any */
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, targets: null });
  assert.deepEqual(copy(w, d).findings, []);
  const loose = w.r.act({ act: "draft", author: "ed", project: P });
  assert.deepEqual([copy(w, loose).findings, copy(w, loose).authored.scope], [[], null]);
});

test("R40: reviewcopy carries a short title: Case X, edition N for a named case, else the scope or the subject, else untitled", () => {
  const w = world();
  w.publishedCase(CASE, P, 1);
  const named = w.r.act({ act: "draft", author: "ed", project: P, caseId: CASE, targets: [A] });
  assert.equal(copy(w, named).title, localize("review.index.case_edition_title", "Case {case_id}, edition {edition}", { case_id: CASE, edition: "2" }));
  assert.match(copy(w, named).title, /^Case CASE-2026-0001, edition 2$/);
  const scoped = w.r.act({ act: "draft", author: "ed", project: P, scope: "Pump safety", targets: [A] });
  assert.equal(copy(w, scoped).title, word("review.title.draft", { title: "Pump safety" }));
  const subject = w.r.act({ act: "draft", author: "ed", project: P, targets: [A] });
  assert.equal(copy(w, subject).title, word("review.title.draft", { title: A }), "the subject is the first finding it names, by its title");
  const empty = w.r.act({ act: "draft", author: "ed", project: P });
  assert.equal(copy(w, empty).title, word("review.title.untitled"));
  /* control: no title is the identity sentence; the sentence stays beside it; both doors say the same */
  for (const d of [named, scoped, subject, empty]) {
    const c = copy(w, d);
    assert.notEqual(c.title, c.case.identity);
    assert.equal(typeof c.case.identity, "string");
  }
  w.r.act({ act: "grant", author: "ann", draft: scoped.draftId, recipient: "R", secretSha: SECRET(2) });
  assert.equal(w.r.copy({ secretSha: SECRET(2), bySecret: true }).title, copy(w, scoped).title);
  /* control: a subject the editor cannot read is not named in the title */
  w.project("PROJ-2026-0009-z", { owners: ["quinn"] });
  const hidden = w.r.act({ act: "draft", author: "ed", project: P, targets: ["PROJ-2026-0009-z"] });
  assert.equal(copy(w, hidden).title, word("review.title.untitled"));
});

test("R41: a finding's answer carries its own words, statement, free of front matter; a file without front matter answers its words unchanged", () => {
  const w = world();
  w.bundle("INQ-2026-0003-c", "inquiry", "---\nid: INQ-2026-0003-c\nconclusion: The valve holds.\n---\n", "concluded");
  w.bundle("INQ-2026-0004-d", "inquiry", null, "concluded");
  const d = w.r.act({ act: "draft", author: "ed", project: P, targets: [A, B, "INQ-2026-0003-c", "INQ-2026-0004-d"] });
  w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: SECRET(3) });
  for (const c of [copy(w, d), w.r.copy({ secretSha: SECRET(3), bySecret: true })]) {
    const [a, b, cc, dd] = c.findings;
    assert.equal(a.statement.trim(), "The pump is safe.");
    assert.equal(b.statement, "plain words, no front matter\n", "no front matter: its words unchanged");
    assert.equal(b.text, b.statement);
    assert.equal(cc.statement, "The valve holds.", "front matter alone: its conclusion");
    assert.deepEqual([dd.text, dd.statement], [null, null]);
    for (const f of [a, b, cc]) for (const line of [f.statement, f.text].join("\n").split("\n"))
      assert.ok(!line.startsWith("---"), `no front matter in ${f.target}: ${line}`);
    assert.equal(/object_type:|schema:|produced_by:/.test([a, b, cc].flatMap((f) => [f.text, f.statement]).join("\n")), false);
  }
});
