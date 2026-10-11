/* case-grammar at its interface, T45 (N855 (6c); Actions D5, D6c; v0.2 §3 Success record, rule 17): R29's `outcomes:`
   block, written flat and read back in order, and its body section; R14's complete edition printing the outcomes after
   the claims and before the findings, an edition without the block rendering byte for byte as before; R23's `kind`
   gaining `outcome`. Each clause with the controls the requirement names (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha, NOW } from "./helpers.mjs";
import { caseFileFixture, editionInput, A, MINUTES, ACCOUNT } from "./casefile-fixture.mjs";

const fmOf = (text) => { const p = parseFrontmatter(text); assert.deepEqual(p.findings, [], "the grammar reads every line"); return p.data; };
const V7 = CG.CASE_DOCUMENT_FORMAT;
const OLDER = ["bio-case-document/5", "bio-case-document/4", "bio-case-document/1", null];
const HARD = "It's \"fixed\" \\ now # not a comment: 14 of 14 reports — é";
const OUTCOMES = [
  { outcome: "OUT-2026-0002", kind: "cure", text: "The board re-voted the lease in open session on 4 March.",
    cites: [{ kind: "finding", ref: A }, { kind: "leg", ref: A, ord: 2 }], on: "2026-03-04", carried_by: "member:olive", carried_at: NOW },
  { outcome: "OUT-2026-0001", kind: "success", text: HARD, cites: [{ kind: "material", ref: MINUTES }, { kind: "passage", ref: sha("p") }],
    on: "2026-05-14", carried_by: "member:heron", carried_at: NOW },
  { outcome: "OUT-2026-0003", kind: "harm_addressed", text: "The overcharged tenants were refunded.", cites: [],
    on: "2026-06-01", carried_by: "member:olive", carried_at: NOW },
];
const read = (r) => ({ ...r, cites: r.cites.map((c) => ({ kind: c.kind, ref: c.ref, ord: c.kind === "leg" ? c.ord : null })) });

/* ===== R29 ===== */

test("R29 the outcomes: block: one flat row per outcome {outcome, kind, text, cites, on, carried_by, carried_at}, cites as canonical JSON in one quoted value, read back in order", () => {
  assert.deepEqual([...CG.OUTCOME_FIELDS], ["outcome", "kind", "text", "cites", "on", "carried_by", "carried_at"]);
  assert.deepEqual([...CG.OUTCOME_KINDS], ["success", "cure", "harm_addressed"]);
  const lines = CG.outcomesLines(OUTCOMES);
  assert.equal(lines[0], "outcomes:");
  assert.equal(lines.includes(`    cites: '[{"kind":"finding","ord":null,"ref":"${A}"},{"kind":"leg","ord":2,"ref":"${A}"}]'`), true,
               "the cites' canonical JSON in one quoted value");
  for (const format of [V7, "bio-case-document/6"]) {
    const fm = fmOf(doc(format, lines));
    for (const r of fm.outcomes) assert.deepEqual(Object.keys(r), [...CG.OUTCOME_FIELDS], "one flat row");
    /* control: a round trip keeps the order (as carried, never sorted by id or date) */
    assert.deepEqual(CG.outcomesOf(fm), OUTCOMES.map(read), format);
  }
  assert.equal(CG.outcomesOf(fmOf(doc(V7, lines)))[1].text, HARD, "the text byte for byte, for the account check");
  const reversed = [...OUTCOMES].reverse();
  assert.deepEqual(CG.outcomesOf(fmOf(doc(V7, CG.outcomesLines(reversed)))).map((r) => r.outcome), reversed.map((r) => r.outcome));
});

test("R29 no row states a cause: the row is its seven fields and nothing else, whatever it is handed; a value outside its words is written null", () => {
  const handed = { ...OUTCOMES[1], cause: "our demand caused it", figures: [14], sequence: "after our demand", kind: "victory",
                   cites: [{ kind: "rumour", ref: "R" }, "loose"], on: 20260514 };
  const lines = CG.outcomesLines([handed]);
  for (const word of ["cause", "figures", "sequence", "our demand", "victory"]) assert.equal(lines.join("\n").includes(word), false, word);
  const [back] = CG.outcomesOf(fmOf(doc(V7, lines)));
  assert.deepEqual(Object.keys(back), [...CG.OUTCOME_FIELDS]);
  assert.deepEqual([back.kind, back.on, back.cites], [null, null, [{ kind: null, ref: "R", ord: null }, { kind: null, ref: null, ord: null }]]);
  /* a row that cannot be read is left out, the rest written */
  assert.deepEqual(CG.outcomesOf(fmOf(doc(V7, CG.outcomesLines([{ get outcome() { throw new Error("boom"); } }, OUTCOMES[0]])))), [read(OUTCOMES[0])]);
});

test("R29 controls: a document without the block answers []; an older format, odd input and a block that is not a list answer []; the writer writes nothing for none; never throws", () => {
  assert.deepEqual(CG.outcomesOf(fmOf(doc(V7))), [], "a document without the block");
  for (const f of OLDER) assert.deepEqual(CG.outcomesOf(fmOf(doc(f, CG.outcomesLines(OUTCOMES)))), [], String(f));
  assert.deepEqual(CG.outcomesOf(fmOf(doc(V7, ["outcomes: []"]))), []);
  assert.deepEqual(CG.outcomesOf({ format: V7, outcomes: "x" }), []);
  for (const odd of [undefined, null, 7, "x", [], {}, [null, 7, "x"]]) {
    assert.deepEqual(CG.outcomesLines(odd), [], "no line at all for none, so the document's bytes are what they were");
    assert.deepEqual(CG.outcomesSectionLines(odd), []);
    assert.deepEqual(CG.outcomesOf(odd), []);
  }
  assert.deepEqual(CG.outcomesOf({ format: V7, get outcomes() { throw new Error("boom"); } }), []);
  /* pure: the same answer twice, its argument untouched */
  const fm = fmOf(doc(V7, CG.outcomesLines(OUTCOMES)));
  const before = JSON.stringify(fm);
  assert.deepEqual(CG.outcomesOf(fm), CG.outcomesOf(fm));
  assert.equal(JSON.stringify(fm), before);
});

test("R29 the body prints the outcomes under one heading, \"Outcomes since the last edition\" until the UX stream's words, each with its kind, date, text and cites", () => {
  assert.equal(CG.OUTCOMES_HEAD, "## Outcomes since the last edition");
  assert.deepEqual({ ...CG.OUTCOME_KIND_WORDS }, { success: "Success", cure: "Cure", harm_addressed: "Harm addressed" });
  const lines = CG.outcomesSectionLines(OUTCOMES);
  assert.deepEqual(lines, [CG.OUTCOMES_HEAD, "",
    `- Cure, on 2026-03-04: The board re-voted the lease in open session on 4 March. Rests on: finding ${A}; leg ${A}, leg 2.`,
    `- Success, on 2026-05-14: ${HARD} Rests on: material ${MINUTES}; passage ${sha("p")}.`,
    "- Harm addressed, on 2026-06-01: The overcharged tenants were refunded. Rests on: none stated.", ""]);
  assert.equal(lines.filter((l) => l.startsWith("## ")).length, 1, "one heading, nothing inside it ending the section");
  assert.equal(CG.outcomesSectionLines([{ ...OUTCOMES[0], text: "one\nline" }])[2].includes("one line"), true);
  assert.equal(CG.outcomeWords({ text: "x" }), "An outcome of a kind not stated, on a date not stated: x Rests on: none stated.", "undetermined is stated");
});

/* ===== R14 ===== */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const heads = (html) => [...html.matchAll(/<h2>(\d+)\. ([^<]+)<\/h2>/g)].map((m) => [Number(m[1]), m[2]]);
const section = (html, name) => { const at = html.indexOf(`. ${name}</h2>`); return html.slice(at, html.indexOf("<h2>", at + 1)); };
const withLines = (opts, lines) => {
  const base = caseFileFixture({ ...opts, fileFormat: CG.CASE_FILE_FORMAT });
  const m = new Map(base.files);
  m.set("case.md", base.files.get("case.md").replace("\nsearched:", `\n${lines.join("\n")}\nsearched:`));
  return { html: CG.completeEditionOf(editionInput(base.manifest, m)), input: editionInput(base.manifest, m) };
};

test("R14 (T45) the complete edition prints R29's outcomes after the claims and before the findings, each with its kind, its date, its text and its cites, in the order carried", () => {
  assert.equal(CG.OUTCOMES_HEADING, "Outcomes since the last edition");
  const { html, input } = withLines({}, CG.outcomesLines(OUTCOMES));
  assert.deepEqual(heads(html).map(([, h]) => h).slice(0, 3), ["The claims", CG.OUTCOMES_HEADING, "The findings"]);
  assert.deepEqual(heads(html).map(([n]) => n), heads(html).map((_, i) => i + 1), "numbered as rendered");
  const out = section(html, CG.OUTCOMES_HEADING);
  const items = [...out.matchAll(/<li>([^<]*)<\/li>/g)].map((m) => m[1]);
  assert.deepEqual(items, OUTCOMES.map((r) => esc(CG.outcomeWords(r))), "each outcome's kind, date, text and cites, in order");
  for (const s of ["Cure, on 2026-03-04", `Rests on: finding ${A}; leg ${A}, leg 2.`, "Harm addressed, on 2026-06-01", HARD])
    assert.equal(out.includes(esc(s)), true, s);
  assert.equal(CG.completeEditionOf(input), html, "the same case file gives the same bytes");
  assert.equal(CG.completeEditionOf({ ...input, files: [...input.files].reverse() }), html, "however its files are handed in");
  /* with an account (T41): the claims, the account, the outcomes, the findings */
  const both = withLines({ t41: true }, CG.outcomesLines(OUTCOMES)).html;
  assert.deepEqual(heads(both).map(([, h]) => h).slice(0, 4), ["The claims", CG.ACCOUNT_HEADING, CG.OUTCOMES_HEADING, "The findings"]);
});

const GOLDEN = JSON.parse(readFileSync(new URL("./complete-v7-pre-t37-golden.json", import.meta.url), "utf8"));

test("R14 (T45) controls: an edition whose document carries no outcomes: block renders byte for byte as before; an older format carrying it adds no section; an empty block says it carries none", () => {
  for (const [name, opts] of [["v7", {}], ["v7_t33", { t33: true }]]) {
    const { manifest, files } = caseFileFixture(opts);
    assert.equal(CG.completeEditionOf(editionInput(manifest, files)), GOLDEN[name].html, name);
  }
  /* a T41 edition (the account, reviewers, approvals) without the block: its headings as before T45 */
  const t41 = caseFileFixture({ t41: true, fileFormat: CG.CASE_FILE_FORMAT });
  assert.equal(CG.completeEditionOf(editionInput(t41.manifest, t41.files)).includes(CG.OUTCOMES_HEADING), false);
  const { html } = withLines({}, CG.outcomesLines([]));
  assert.equal(html.includes(CG.OUTCOMES_HEADING), false, "no outcome carried: no block written, no section");
  const empty = withLines({}, ["outcomes: []"]).html;
  assert.equal(section(empty, CG.OUTCOMES_HEADING).includes(esc("No outcome is carried into this edition.")), true);
  const v5 = CG.completeEditionOf({ files: [{ path: "case.md", content: `---\nformat: bio-case-document/5\ncase_id: X\n${CG.outcomesLines(OUTCOMES).join("\n")}\n---\n` }] });
  assert.equal(v5.includes(CG.OUTCOMES_HEADING), false, "an older format's block is not read");
  /* the words are escaped, and nothing is a script */
  const hostile = withLines({}, CG.outcomesLines([{ ...OUTCOMES[0], text: "<script>x</script> & y" }])).html;
  assert.equal(/<script/.test(hostile), false);
});

/* ===== R23 ===== */

test("R23 (T45) kind takes outcome: a row carrying a carried outcome's text with its cites round-trips; the body's account and the edition's account print no outcome row", () => {
  assert.equal(CG.ACCOUNT_KINDS.includes("outcome"), true);
  const row = { ord: 4, text: OUTCOMES[0].text, kind: "outcome", cites: OUTCOMES[0].cites, began_as: "member" };
  const back = CG.accountOf(fmOf(doc(V7, CG.accountLines([...ACCOUNT, row]))));
  assert.deepEqual(back.at(-1), { ord: 4, text: OUTCOMES[0].text, kind: "outcome", bias_statement: null, began_as: "member", draft: null,
                                  cites: read(OUTCOMES[0]).cites });
  /* control: a document without such a row reads as before */
  assert.deepEqual(CG.accountOf(fmOf(doc(V7, CG.accountLines(ACCOUNT)))), back.slice(0, -1));
  /* printed by the outcomes section, never as the account */
  assert.deepEqual(CG.accountSectionLines([...ACCOUNT, row]), CG.accountSectionLines(ACCOUNT));
  const base = caseFileFixture({ t41: true, fileFormat: CG.CASE_FILE_FORMAT });
  const m = new Map(base.files);
  m.set("case.md", base.files.get("case.md").replace(CG.accountLines(ACCOUNT).join("\n"), CG.accountLines([...ACCOUNT, row]).join("\n")));
  assert.notEqual(m.get("case.md"), base.files.get("case.md"));
  assert.equal(section(CG.completeEditionOf(editionInput(base.manifest, m)), CG.ACCOUNT_HEADING),
               section(CG.completeEditionOf(editionInput(base.manifest, base.files)), CG.ACCOUNT_HEADING));
});
