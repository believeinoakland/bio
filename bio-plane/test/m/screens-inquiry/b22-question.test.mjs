/* screens-inquiry CHANGE B22 (K4258, K4259, K4269, K4270), the `question` screen: R110 (cite another team's finding, take it back), on
 * interface-shell's served page over a scripted plane; every request is checked by the shell's guard against the fields its owner
 * (`citation`) declares. Words by key (R44): each expectation is read through `word(key, vars)`, never copied. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, inquiryMd, INQUIRY_REFS, LEGS, says, section, word, P, Q } from "./fixtures.mjs";
import { importedNamed } from "../case-import/fixtures.mjs";
import { V, F1, F2 } from "../case-import/fixture.mjs";

const at = "/app/question/" + Q;
/* another team's case, imported by the real `case-import` (its published `importedNamed`) and its first finding accepted by the module's own act:
 * the page is shown the answers of `importedcases` and `importedcase` as that module gives them. `NOT_ACCEPTED` is the same import with nothing accepted. */
const TITLES = { [F1]: "Rent was paid late in nine of twelve months", [F2]: "The deposit was never returned" };
async function importedAccepting(accepting) {
  const x = await importedNamed({ titles: TITLES });
  if (accepting) {
    const a = x.ci.acceptImported({ import: x.import, edition: 1, findings: [F1], checked: "every passage against its document", reason: "We checked the ledger.", by: V("alice"), viewer: V("alice") });
    assert.equal(a.ok, true, JSON.stringify(a));
  }
  return { import: x.import, list: x.ci.importedCases({ viewer: V("alice") }), one: x.ci.importedCase({ import: x.import, viewer: V("alice") }) };
}
const HELD = await importedAccepting(true);
const NOT_ACCEPTED = await importedAccepting(false);
const IMP = HELD.import;
const EDITION = HELD.list.imports[0].latest_edition;
const REF1 = HELD.one.edition.findings.find((x) => x.finding === F1).ref;
const IMPORTS = ok(HELD.list);
const IMPORTED = ok(HELD.one);
const withImports = (o = {}) => ({ plane: { importedcases: IMPORTS, importedcase: IMPORTED, ...(o.plane || {}) }, ...(o.images ? { images: o.images } : {}) });
const choose = (p, id, value) => { p.doc.getElementById(id).querySelectorAll("input").find((i) => i.getAttribute("value") === value).checked = true; };
const KEY = "act.owed_citeimported.label.question";
const rested = { images: { [Q]: { "bundle.md": inquiryMd(P, INQUIRY_REFS, { legs: [...LEGS, { target: REF1, role: "supports" }] }) } } };

test("R110 \"Cite another team's finding\" is chosen among the findings the team accepted from another team's case, and not among those it has not accepted", async () => {
  const p = await open(at, withImports());
  const s = section(p, KEY);
  assert.ok(s, "the section is drawn");
  assert.equal(p.byOp("importedcases").length, 1);
  assert.equal(p.byOp("importedcase")[0].query.import, IMP);
  const opts = p.doc.getElementById("question-imp-finding").querySelectorAll("option").map((o) => o.getAttribute("value"));
  assert.deepEqual(opts, ["", `${IMP}|${EDITION}|${F1}`], "only the accepted finding, at the edition accepted");
  assert.ok(s.textContent.includes(TITLES[F1]) && !s.textContent.includes(TITLES[F2]));
  assert.ok(says(s, "screen.imported.citeimp.inherit1") && says(s, "screen.imported.citeimp.inherit2"));
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R110 citeimported sends the question, the import, the finding, the edition and the role she chose (and her note); with no finding or no role chosen nothing is sent", async () => {
  /* the shell asks a reason for this act as for every Reasoned one, and marks the request with it (`reason`, not a declared field) */
  const sent = (p, n = 0) => { const b = { ...p.byOp("citeimported")[n].body }; delete b.reason; return b; };
  const p = await open(at, withImports({ plane: { citeimported: ok({ ok: true, inquiry: Q, cited: [REF1], alreadyCited: [] }) } }));
  await press(p, "citeimported", { reason: "x" });
  assert.equal(p.byOp("citeimported").length, 0, "nothing chosen, nothing sent");
  fill(p, { "question-imp-finding": `${IMP}|${EDITION}|${F1}` });
  await press(p, "citeimported", { reason: "x" });
  assert.equal(p.byOp("citeimported").length, 0, "no role chosen, nothing sent");
  choose(p, "question-imp-role", "cuts_against");
  fill(p, { "question-imp-note": "Their ledger disagrees with ours." });
  await press(p, "citeimported", { reason: "x" });
  assert.deepEqual(sent(p), { inquiry: Q, import: IMP, finding: F1, edition: EDITION, role: "cuts_against", note: "Their ledger disagrees with ours." }, "the guard accepted exactly these fields");
  const q = await open(at, withImports({ plane: { citeimported: ok({ ok: true }) } }));
  fill(q, { "question-imp-finding": `${IMP}|${EDITION}|${F1}` });
  choose(q, "question-imp-role", "supports");
  await press(q, "citeimported", { reason: "x" });
  assert.deepEqual(sent(q), { inquiry: Q, import: IMP, finding: F1, edition: EDITION, role: "supports" }, "the note is optional");
});

test("R110 IMPORTED_NOT_ACCEPTED, carried inside BASIS_REFUSED or answered alone, is drawn by its words; control: another BASIS_REFUSED draws its first finding's own detail", async () => {
  const refused = (findings) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "BASIS_REFUSED", code: "BASIS_REFUSED", findings } } });
  const go = async (answer) => {
    const p = await open(at, withImports({ plane: { citeimported: answer } }));
    fill(p, { "question-imp-finding": `${IMP}|${EDITION}|${F1}` });
    choose(p, "question-imp-role", "supports");
    return press(p, "citeimported", { reason: "x" });
  };
  assert.ok(says(await go(refused([{ code: "IMPORTED_NOT_ACCEPTED", check: "C-21.4", detail: "basis[0] rests on x" }])), "refusal.IMPORTED_NOT_ACCEPTED"));
  assert.ok(says(await go(refusedIn("IMPORTED_NOT_ACCEPTED")), "refusal.IMPORTED_NOT_ACCEPTED"));
  // fixtures-generic: SOMETHING_ELSE (a finding code made up on purpose: no module gives it, so a finding with an unlisted code is drawn by its own detail)
  const other = await go(refused([{ code: "SOMETHING_ELSE", check: "C-9.9", detail: "the leg names no edition" }]));
  assert.ok(other.textContent.includes("the leg names no edition") && !says(other, "refusal.IMPORTED_NOT_ACCEPTED"));
});

test("R110 \"Take it back\" is offered on a leg on another team's finding only: it sends the question, the import and the finding with her reason; a leg on a document offers sever and no take-back", async () => {
  const p = await open(at, { ...withImports(rested), plane: { ...withImports().plane, withdrawimported: ok({ ok: true, inquiry: Q, withdrawn: [REF1] }) } });
  const rows = main(p).querySelectorAll("[data-imported]");
  assert.equal(rows.length, 1);
  assert.ok(rows[0].textContent.includes(TITLES[F1]), "the leg is named by the finding's title, never its ref");
  assert.deepEqual(actsIn(main(p)).filter((o) => o === "withdrawimported"), ["withdrawimported"]);
  assert.ok(!p.requests.some((r) => r.op === "image" && String(r.query.id).startsWith("imported:")), "no document is read for it");
  await press(p, "withdrawimported", { reason: "Their case was withdrawn." });
  assert.deepEqual(p.byOp("withdrawimported")[0].body, { inquiry: Q, import: IMP, finding: F1, reason: "Their case was withdrawn." });
  assert.equal(p.byOp("sever").length, 0);
  const plain = await open(at, withImports());
  assert.ok(!actsIn(main(plain)).includes("withdrawimported"), "control: legs on documents offer sever, not take-back");
  assert.ok(actsIn(main(plain)).includes("sever"));
});

test("R110 a finding the question already rests on is not offered again; with nothing accepted to cite, or the team holding no import, the section is not drawn (R20); a failed read is drawn failed", async () => {
  const p = await open(at, { ...withImports(rested), plane: withImports().plane });
  assert.equal(section(p, KEY), undefined, "the one accepted finding is already cited");
  const none = await open(at);
  assert.equal(section(none, KEY), undefined, "the team holds no import: no section");
  const unaccepted = await open(at, withImports({ plane: { importedcase: ok(NOT_ACCEPTED.one) } }));
  assert.equal(section(unaccepted, KEY), undefined, "nothing accepted: nothing to cite");
  const bad = await open(at, { plane: { importedcases: refusedIn("SOME_REFUSAL", "The plane refused this read.") } });
  assert.ok(section(bad, KEY).querySelector('[data-state="failed"]'), "drawn failed, never as none");
});

test("R110 a question with nothing cited yet can rest on another team's accepted finding too (the section is drawn in state c)", async () => {
  const p = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, [], { legs: [] }) } }, ...withImports() });
  assert.ok(section(p, KEY), "drawn with the three ways in");
  assert.ok(actsIn(main(p)).includes("citeimported"));
});
