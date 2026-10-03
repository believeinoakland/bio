/* case-grammar at its interface: R14, the complete edition rendered from a case file, and R15, a finding's standing
   against the bar the case records, each with its negative controls. Driven on a whole `/6` case file built by this
   module's own writers (`./casefile-fixture.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gradingMethodText, GRADING_METHOD_VERSION } from "../../../src/strength/method.mjs";
import { completeEditionOf, COMPLETE_EDITION_HEADINGS, TWO_STRENGTHS_SENTENCE, GRADE_MEANINGS, MADE_WITH_LINE,
         CHECKER_READS, standingOf, BAR_AXES, STANDING_ROLE_WORDS, LENS_CLOSING_SENTENCES, LENS_KIND_WORDS,
         WITHHELD_SOURCE_LABEL, WITHHELD_SOURCE_REASON, caseFilePath } from "../../../src/case-grammar/index.mjs";
import { caseFileFixture, manifestFor, A, B, C, MINUTES, OBS, MINUTES_SHA, REF } from "./casefile-fixture.mjs";
import { sha } from "./helpers.mjs";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");
const has = (html, s) => html.includes(esc(s));
const at = (html, s) => html.indexOf(esc(s));
const sectionOf = (html, i) => html.slice(html.indexOf(`<h2>${i}. `), i < 9 ? html.indexOf(`<h2>${i + 1}. `) : undefined);
const others = (files) => new Map([...files].filter(([p]) => p !== caseFilePath("complete_edition")));

/* ===== R14 ===== */

test("R14 the complete edition is one self-contained HTML file: every style inline, no script, no external reference, and it opens with nothing installed", () => {
  const { manifest, files } = caseFileFixture();
  const html = completeEditionOf({ manifest, files });
  assert.match(html, /^<!doctype html>\n<html lang="en">/);
  assert.match(html, /<style>[^<]+<\/style>/, "the styles are inline");
  for (const bad of [/<script/i, /\son\w+=/i, /\ssrc=/i, /\shref=/i, /<link/i, /@import/i, /url\(/i, /<iframe/i, /<object/i, /<img/i])
    assert.equal(bad.test(html), false, String(bad));
  /* an archived copy's address is printed as text, never linked */
  assert.equal(has(html, "https://archive.example/m"), true);
  assert.equal(html.endsWith("</html>\n"), true);
});

test("R14 its order: the claims, the findings, the materials, what was searched, the declared bias, disclosed contradictions, the strength section, the grading method, and how to check it yourself", () => {
  const { manifest, files } = caseFileFixture();
  const html = completeEditionOf({ manifest, files });
  assert.deepEqual([...COMPLETE_EDITION_HEADINGS], ["The claims", "The findings", "The documents and observations",
    "What was searched", "The declared bias", "Disclosed contradictions", "Strength", "How grades are worked out",
    "How to check this case yourself"]);
  const heads = [...html.matchAll(/<h2>(\d+)\. ([^<]+)<\/h2>/g)].map((m) => [Number(m[1]), m[2]]);
  assert.deepEqual(heads, COMPLETE_EDITION_HEADINGS.map((h, i) => [i + 1, h]), "nine sections, in order, once each");
  /* 1. the claims */
  const claims = sectionOf(html, 1);
  assert.equal(has(claims, "Who approved the lease, and on what record."), true);
  assert.equal(has(claims, `${A}: The board approved the lease without a vote.`), true);
  assert.equal(has(claims, `${C}: the claim is undetermined: no reading named.`), true, "undetermined is stated, never filled");
  /* 2. each finding opens with its standing line, then its two grades with their plain meanings, then its chain */
  const findings = sectionOf(html, 2);
  const a = findings.slice(findings.indexOf(`<h3>${A}</h3>`), findings.indexOf(`<h3>${C}</h3>`));
  assert.equal(at(a, "Relied on · meets this project's bar (capture B, connection C)") < at(a, GRADE_MEANINGS.capture), true);
  assert.equal(at(a, GRADE_MEANINGS.capture) < at(a, GRADE_MEANINGS.connection), true);
  assert.equal(has(a, `${GRADE_MEANINGS.capture} This finding: grade B.`), true);
  assert.equal(has(a, `${GRADE_MEANINGS.connection} This finding: grade C.`), true);
  assert.equal(at(a, GRADE_MEANINGS.connection) < at(a, `Supports: ${MINUTES}`), true, "the chain follows the grades");
  assert.equal(has(a, `Supports: ${MINUTES}, capture grade B (capture)`), true);
  /* the chain is followed into a question the case file carries, down to its own legs, never round a loop */
  assert.equal(has(a, `Supports: ${B} (inherited), in the set of reasons 'the record'`), true);
  assert.equal(has(a, `Cuts against: ${OBS}, testimony grade D (testimony)`), true);
  assert.equal(has(a, `${A} is already shown above in this chain.`), true);
  /* down to the exact passages relied on, each quoted with its location */
  assert.equal(has(a, "No vote was taken on item 7 <the lease>."), true, "quoted, and escaped");
  assert.equal(has(a, `In the document captured as ${MINUTES_SHA}, at {"end":52,"page":3,"start":10} (content ${sha("passage")}).`), true);
  const c = findings.slice(findings.indexOf(`<h3>${C}</h3>`));
  assert.equal(has(c, "Supporting · not asked to meet this project's bar (capture B, connection C)"), true);
  assert.equal(has(c, `${GRADE_MEANINGS.connection} This finding: undetermined.`), true);
  assert.equal(has(c, `${C} rests on nothing.`), true);
  /* 3. every document and observation, with fingerprint, origin, archived copy, inclusion and attestations */
  const mats = sectionOf(html, 3);
  for (const s of [`Fingerprint (SHA-256): ${MINUTES_SHA}`, `Extracted text fingerprint: ${sha("the minutes' text")}`,
                   "Origin: https://records.example/m.pdf", "Archived copy: https://archive.example/m",
                   "Included whole in this case file.", "A finding this case relies on rests on it.",
                   "Attested by a member of the group, credited to the group, on 2026-09-30T00:00:00Z.",
                   `Held in the record of PROJ-2026-0001-parks, registered 2026-09-30T00:00:00Z, in ${MINUTES}.`,
                   "Vouched for by the group lakeshore-tenants, under this case's own signature.",
                   "Not included: only its fingerprint, origin and archived copy travel.", "Archived copy: none recorded",
                   "Attested by member:olive (credited by name), on 2026-09-30T00:00:00Z, signed."])
    assert.equal(has(mats, s), true, s);
  assert.equal(at(mats, MINUTES) < at(mats, OBS), true, "in the document's order");
  /* 4. what was searched */
  assert.equal(has(sectionOf(html, 4), "document level (document): looked: 3 subject(s), 2 looked at, 0 never looked at, 1 undetermined. One was never logged."), true);
  /* 5. the declared bias: the acknowledgement, each statement, its withheld count never naming which, the sentences */
  const bias = sectionOf(html, 5);
  assert.equal(has(bias, "The publisher's acknowledgement: We expected the board to defer to the vendor."), true);
  assert.equal(has(bias, `${LENS_KIND_WORDS.scrutiny}, on ENT-2026-0001: Vendor filings need a second source.`), true);
  assert.equal(has(bias, "Citations withheld: 1 (which ones is not stated)."), true);
  assert.equal(html.includes("SECRET-CITATION"), false, "a withheld citation is never named");
  for (const sentence of LENS_CLOSING_SENTENCES) assert.equal(has(bias, sentence), true);
  /* 6. disclosed contradictions */
  assert.equal(has(sectionOf(html, 6), `${A}: The minutes say no vote, against The press release says a vote. State: open. The case's owner says: We disclose it.`), true);
  /* 7. the strength section opens "a case has two strengths, never one", per finding and per axis, never composed */
  const strength = sectionOf(html, 7);
  assert.equal(TWO_STRENGTHS_SENTENCE, "A case has two strengths, never one.");
  assert.equal(strength.indexOf(`<p>${esc(TWO_STRENGTHS_SENTENCE)}</p>`), strength.indexOf("<p>"), "it opens the section");
  assert.equal(has(strength, `${A}: capture B, connection C.`), true);
  assert.equal(has(strength, `${C}: capture D, connection undetermined.`), true);
  /* 8. the grading method in plain words, at the document's grading version */
  const method = sectionOf(html, 8);
  for (const line of gradingMethodText(GRADING_METHOD_VERSION).split("\n").filter((l) => l.trim()))
    assert.equal(has(method, line), true, line.slice(0, 40));
  assert.equal(has(method, "It was checked under catalogue version 1.61.0."), true);
  /* 9. how to check it, naming the checker's public read */
  const check = sectionOf(html, 9);
  assert.equal(CHECKER_READS.program, "casechecker");
  assert.equal(has(check, `public read ${CHECKER_READS.program}`), true);
  assert.equal(has(check, CHECKER_READS.specification), true);
  assert.equal(has(check, "It does not show that it is true."), true);
});

test("R14 the identifying notice: the case, edition, group, declared bias, both floors and the case document's hash with where to verify it, heading the file and fixed on every printed page; the group leads and CivicOS is credited at the foot", () => {
  const { manifest, files } = caseFileFixture();
  const html = completeEditionOf({ manifest, files });
  const notice = html.slice(html.indexOf('<div class="notice">'), html.indexOf("</div>"));
  const docSha = createHash("sha256").update(files.get("case.md")).digest("hex");
  for (const s of ["lakeshore-tenants · Case CASE-2026-0001 · Edition 2", "Declared bias: We expected the board to defer to the vendor.",
                   "Bar (floors): capture B, connection C.", `Case document SHA-256: ${docSha}.`, `public read ${CHECKER_READS.program}`])
    assert.equal(has(notice, s), true, s);
  assert.equal(html.indexOf('<div class="notice">') < html.indexOf("<h1>"), true, "it heads the file");
  assert.match(html, /@media print\{\.notice\{position:fixed;top:0/, "and is fixed on every printed page");
  assert.equal(has(html, "<h1>lakeshore-tenants · Case CASE-2026-0001 · Edition 2</h1>".replace(/<\/?h1>/g, "")), true);
  assert.equal(html.includes(`<p class="foot">${MADE_WITH_LINE}</p>`), true);
  assert.equal(MADE_WITH_LINE, "Made with CivicOS");
  /* a bar on one axis, and no bar, are stated as such */
  const one = caseFileFixture({ bar: { declared: true, capture: "A", connection: null } });
  assert.equal(has(completeEditionOf(one), "Bar (floors): capture A, connection not set."), true);
  const none = caseFileFixture({ bar: { declared: false, capture: null, connection: null } });
  const noneHtml = completeEditionOf(none);
  assert.equal(has(noneHtml, "Bar (floors): no bar declared."), true);
  assert.equal(has(noneHtml, "Relied on · this project declared no bar"), true);
});

test("R14 the same case file always gives the same bytes, however its files are handed in; nothing is left out for length; the carried edition is never read", () => {
  const { manifest, files } = caseFileFixture();
  const html = completeEditionOf({ manifest, files });
  assert.equal(completeEditionOf({ manifest, files }), html, "byte-identical twice");
  assert.equal(completeEditionOf({ manifest, files: new Map([...files].reverse()) }), html, "a reordered Map");
  assert.equal(completeEditionOf({ manifest, files: Object.fromEntries([...files].reverse()) }), html, "an object");
  assert.equal(completeEditionOf({ manifest, files: [...files].map(([path, t]) => ({ path, bytes: new TextEncoder().encode(t) })) }),
               html, "a list of bytes");
  assert.equal(completeEditionOf({ manifest, files: others(files) }), html, "rendered from the case file's other files");
  assert.equal(files.get("complete-edition.html") === completeEditionOf({ manifest: manifestFor([], { group: "riverside-watch" }), files: others(files) }), false,
               "the manifest's group is read");
  /* a path handed twice: the copy the manifest lists, in either order */
  const forged = "---\nformat: bio-case-document/6\ncase_id: FORGED\n---\n";
  const twice = [...[...files].map(([path, bytes]) => ({ path, bytes })), { path: "case.md", bytes: forged }];
  assert.equal(completeEditionOf({ manifest, files: twice }), html);
  assert.equal(completeEditionOf({ manifest, files: [...twice].reverse() }), html);
  /* no length limit: a long passage travels whole */
  const long = "word ".repeat(60000).trim();
  const big = new Map(files);
  big.set(caseFilePath("passages", A), JSON.stringify([{ content_id: "c", capture_sha: MINUTES_SHA, extent: "p1", quoted: long }]));
  assert.equal(completeEditionOf({ manifest, files: big }).includes(long), true, "nothing is left out for length");
});

test("R14 DEC-96 item 4 a chain reaching another group's finding prints, at that leg, the acceptance, the recreation result and gaps, each disclosed flag and the source case file, and stops there", () => {
  const { manifest, files } = caseFileFixture();
  const leg = sectionOf(completeEditionOf({ manifest, files }), 2);
  const from = leg.indexOf(esc(`Supports: ${REF}`));
  const part = leg.slice(from, leg.indexOf("</ul></li>", from));
  for (const s of ["This is another group's finding.",
                   "Accepted by member:olive on 2026-09-30T00:00:00Z, edition 2, because: We read it twice.",
                   "Recreated as: recreated in part; the gaps stated: the 2019 contract, not fetched. Its grades as that edition published them: capture B, connection C.",
                   `Check that finding in its own case file: riverside-watch, case CASE-2026-0007, edition 2, finding INQ-2026-0042-lease, manifest SHA-256 ${sha("their manifest")}.`,
                   "An open flag is disclosed: The lease date may be wrong (flagged 2026-09-30T00:00:00Z). The case's owner says: We disclose it.",
                   "The chain stops here: what that finding rests on is in its own case file."])
    assert.equal(has(part, s), true, s);
  /* negative control: with no acceptance stated, the leg says so */
  const bare = new Map(files);
  bare.set("case.md", files.get("case.md").replace(/\naccepted_work:[\s\S]*?\naccepted_work_flags:/, "\naccepted_work: []\naccepted_work_flags:"));
  assert.equal(has(completeEditionOf({ manifest, files: bare }), "This case states no acceptance for it."), true);
});

test("R14 DEC-119 material from a source whose identity is withheld is shown with its source as Withheld and its reason, and an anonymous attesting member is never named", () => {
  const { manifest, files } = caseFileFixture();
  const mats = sectionOf(completeEditionOf({ manifest, files }), 3);
  assert.equal(has(mats, `Source: ${WITHHELD_SOURCE_LABEL}: ${WITHHELD_SOURCE_REASON}.`), true);
  assert.equal(mats.includes("heron"), false, "a member credited to the group is not named");
  assert.equal(has(mats, "Included whole in this case file."), true, "it travels whole, like any other material");
});

test("R14 R6 negative controls: no case document, an unreadable one, odd input, a method this rendering does not hold and absent facts are stated, never filled, and it never throws", () => {
  const { manifest, files } = caseFileFixture();
  const noDoc = completeEditionOf({ manifest, files: new Map([...files].filter(([p]) => p !== "case.md")) });
  assert.match(noDoc, /This case file carries no readable case document/);
  assert.match(noDoc, /^<!doctype html>/);
  for (const odd of [null, undefined, 7, "x", {}, [], { manifest: 7, files: 7 }, { files: new Map([["case.md", 7]]) },
                     { get manifest() { throw new Error("boom"); } }]) {
    assert.doesNotThrow(() => completeEditionOf(odd));
    assert.match(completeEditionOf(odd), /^<!doctype html>[\s\S]*<\/html>\n$/);
  }
  assert.match(completeEditionOf({ get manifest() { throw new Error("boom"); } }), /could not be read whole/);
  const odd = new Map(files);
  odd.set("case.md", files.get("case.md").replace('grading: "bio-grading/1"', 'grading: "bio-grading/99"'));
  odd.delete(caseFilePath("grading_facts", C));
  const html = completeEditionOf({ manifest, files: odd });
  assert.equal(has(html, "This case was graded by method bio-grading/99, whose words this rendering does not hold."), true);
  assert.equal(has(html, `This case file carries no grading facts for ${C}, so its chain is not shown.`), true);
  const bare = completeEditionOf({ manifest, files: new Map([["case.md", "---\nformat: bio-case-document/6\ncase_id: CASE-2026-0002\n---\n"]]) });
  for (const s of ["This case document lists no materials.", "This case document does not state what was searched.",
                   "This case document does not state the grading method it was graded by.", "Declared bias: none stated."])
    assert.equal(has(bare, s), true, s);
});

/* ===== R15 ===== */

test("R15 standingOf: the four meets arms, the bar per declared axis, and a line naming the role and the bar with its per-axis grades", () => {
  assert.deepEqual([...BAR_AXES], ["capture", "connection"]);
  assert.deepEqual({ ...STANDING_ROLE_WORDS }, { load_bearing: "Relied on", supporting: "Supporting" });
  const bar = { capture: "B", connection: "C" };
  /* load-bearing, reaching the bar on every declared axis */
  assert.deepEqual(standingOf({ role: "load_bearing", bar, pair: { capture: "A", connection: { state: "graded", grade: "C" } } }),
    { role: "load_bearing", bar, meets: true, short: [],
      line: "Relied on · meets this project's bar (capture B, connection C)" });
  /* load-bearing, short on one axis and on both */
  assert.deepEqual(standingOf({ role: "load_bearing", bar, pair: { capture: "B", connection: "D" } }),
    { role: "load_bearing", bar, meets: false, short: ["connection"],
      line: "Relied on · short of this project's bar on connection (capture B, connection C)" });
  assert.deepEqual(standingOf({ role: "load_bearing", bar, pair: { capture: "C", connection: { state: "undetermined", grade: null } } }).short,
                   ["capture", "connection"], "an undetermined axis falls short");
  /* supporting: not asked */
  assert.deepEqual(standingOf({ role: "supporting", bar, pair: { capture: "D", connection: "D" } }),
    { role: "supporting", bar, meets: "not_asked", short: [],
      line: "Supporting · not asked to meet this project's bar (capture B, connection C)" });
  /* no bar: no axis declared, or the bar declared absent */
  for (const none of [null, {}, { capture: null, connection: null }, { declared: false, capture: "B", connection: "C" }])
    for (const role of ["load_bearing", "supporting"])
      assert.deepEqual(standingOf({ role, bar: none, pair: { capture: "A", connection: "A" } }),
        { role, bar: { capture: null, connection: null }, meets: "no_bar", short: [],
          line: `${STANDING_ROLE_WORDS[role]} · this project declared no bar` });
  /* a bar on one axis: the other is null and stated, and only the declared axis is asked */
  assert.deepEqual(standingOf({ role: "load_bearing", bar: { capture: "B", connection: null }, pair: { capture: "B" } }),
    { role: "load_bearing", bar: { capture: "B", connection: null }, meets: true, short: [],
      line: "Relied on · meets this project's bar (capture B, connection not set)" });
  /* every grade against every bar letter: reached when at least as strong */
  const G = ["A", "B", "C", "D"];
  for (const b of G) for (const g of G)
    assert.equal(standingOf({ role: "load_bearing", bar: { capture: b }, pair: { capture: g } }).meets, G.indexOf(g) <= G.indexOf(b));
});

test("R15 the line never says meets without the bar it is measured against, composes no case-level strength, and never throws", () => {
  const G = ["A", "B", "C", "D", null];
  const pairs = [{ capture: "A", connection: "A" }, { capture: "D", connection: "A" }, { capture: { state: "unrated" } }, null];
  for (const role of ["load_bearing", "supporting", null, "boss"]) for (const c of G) for (const k of G) for (const pair of pairs) {
    const s = standingOf({ role, bar: { capture: c, connection: k }, pair });
    if (/meets/.test(s.line)) assert.match(s.line, /meets this project's bar \(capture [A-D]|meets this project's bar \(capture not set, connection [A-D]\)/);
    for (const word of ["overall", "case strength", "score", "combined"]) assert.equal(s.line.includes(word), false);
    assert.deepEqual(Object.keys(s), ["role", "bar", "meets", "short", "line"]);
  }
  assert.deepEqual(standingOf({ role: "boss", bar: { capture: "B" }, pair: { capture: "A" } }),
    { role: null, bar: { capture: "B", connection: null }, meets: null, short: [],
      line: "Its role in this case is not stated · this project's bar is (capture B, connection not set)" });
  for (const odd of [undefined, null, 7, "x", { bar: 7, pair: 7 }, { bar: { capture: "E" }, role: "load_bearing" },
                     { get role() { throw new Error("boom"); } }])
    assert.doesNotThrow(() => standingOf(odd));
  assert.equal(standingOf({ get role() { throw new Error("boom"); } }).line, "Its standing against this project's bar could not be read");
});
