/* T41-27 (N820; K2405, K2418, K2420, K2472): the investigation's layers. R40 the reading guide, R41 the interview and
 * planning, R42 exploring and reading, R43 every clause a quotation of the investigation's canon, R44 the case's
 * account and its check. Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { renderPack, packVersion, SOURCING } from "../../../src/skillpack.mjs";
import { INVESTIGATION_SOURCE, INTAKE_QUESTIONS, INTAKE_SENTENCE, ENQUIRE_CLAUSES, EXPLORE_CLAUSES, READING_CLAUSES,
         CASE_ACCOUNT_CLAUSES, ACCOUNT_CHECK_CLAUSES, enquireLayer, exploreLayer, readingLayer, caseAccountLayer,
         accountCheckLayer, readingGuideLayer, judgementLayers, controlFlowAuthority, CONDUCT_CHECK_REGISTRATION }
  from "../../../src/skilldoctrine.mjs";
import { checkGuide, registerConductCheck, conductCheckHolder } from "../../../src/reading-guides/index.mjs";
import { ROOT, read, foundIn, section, canonDocuments, published } from "./fixture.mjs";

const CANON = () => read(INVESTIGATION_SOURCE);
/* "§6" is the section headed "6. AI use in an investigation": the number and its dot open the heading. */
const sec = (s) => section(CANON(), `${s.slice(1)}. `);
const ALL = { ENQUIRE_CLAUSES, EXPLORE_CLAUSES, READING_CLAUSES, CASE_ACCOUNT_CLAUSES, ACCOUNT_CHECK_CLAUSES };
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
const LAYERS = ["reading_guide", "enquire", "explore", "reading", "case_account", "account_check"];

const guide = (items, over = {}) => ({ guide: { id: "GUD-1", kind: "construction_contract", origin: "group",
  items, state: "group", author: "m1" , ...over }, origin: "group" });
const ITEMS = [
  { label: "Contract time", look_for: "Look for the number of days given to complete the work", where: "the agreement" },
  { label: "Damages", look_for: "Note whether liquidated damages are stated per day" },
  { label: "Change orders", look_for: "Check whether the change-order clause names who approves" },
];

test("R43 every clause of R40–R44 is a span of BIO_Investigation_v0_1.md found by R21's normaliser in the section it names; the document is canon; the lookup can miss", () => {
  assert.ok(canonDocuments().has(INVESTIGATION_SOURCE), `${INVESTIGATION_SOURCE} is canon`);
  let n = 0;
  for (const [name, clauses] of Object.entries(ALL)) {
    assert.ok(Object.isFrozen(clauses) && clauses.length > 0, name);
    for (const c of clauses) {
      assert.deepEqual(Object.keys(c).sort(), ["section", "source", "text"], name);
      assert.equal(c.source, INVESTIGATION_SOURCE, `${name}: quoted only from the investigation's canon`);
      const where = sec(c.section);
      assert.ok(where.length > 0, `${name}: ${c.section} is a section of the canon`);
      assert.ok(foundIn(where, c.text), `${name}, in ${c.section}: ${c.text}`);
      n++;
    }
  }
  assert.ok(n >= 40, "every clause was looked up");
  /* The lookup can miss: each clause with one word turned is not found, and a clause put in the wrong section is not. */
  for (const clauses of Object.values(ALL))
    for (const c of clauses) {
      const turned = c.text.replace(/\s(\S+)$/, " not $1");
      assert.notEqual(turned, c.text);
      assert.ok(!foundIn(CANON(), turned), turned);
    }
  assert.ok(!foundIn(sec("§5"), READING_CLAUSES[0].text), "§6's sentence is not in §5");
  /* What the requirements name and no canon sentence states is not authored: no such words in any clause. */
  for (const unstated of ["quote-bound", "relabel a claim as bias", "explore a person on its own"])
    assert.ok(!Object.values(ALL).flat().some((c) => c.text.includes(unstated)) && !foundIn(CANON(), unstated), unstated);
});

test("R41 INTAKE_QUESTIONS is the interview's six questions, one frozen list, each in §6's sentence in its order; the enquire layer carries them with the planning rules, a remembered claim becoming something to find and never stated as the body's words", () => {
  assert.ok(Object.isFrozen(INTAKE_QUESTIONS));
  assert.deepEqual(INTAKE_QUESTIONS, ["what happened", "which public body, and where", "since when",
    "what was promised or expected, and by whom", "what you already have", "what you want to come of it"]);
  assert.ok(foundIn(sec("§6"), INTAKE_SENTENCE.text), "§6's sentence, verbatim");
  assert.equal(INTAKE_SENTENCE.text.split(": ")[1].replace(/\.$/, "").split("; ").join("|"), INTAKE_QUESTIONS.join("|"),
    "the six, in the sentence's order, nothing added or dropped");
  /* The control: a seventh question, or two swapped, is not the canon's list. */
  assert.ok(!foundIn(sec("§6"), INTAKE_SENTENCE.text.replace("since when; ", "")));
  assert.ok(!foundIn(sec("§6"), "what happened; since when; which public body, and where"));
  const layer = renderPack(published()).disclosed.enquire;
  assert.deepEqual(layer, enquireLayer());
  assert.equal(layer.sourcing, "authored");
  assert.equal(SOURCING.enquire, "authored");
  assert.equal(layer.body.questions, INTAKE_QUESTIONS, "the same frozen list, never a copy");
  assert.equal(layer.body.clauses, ENQUIRE_CLAUSES);
  assert.ok(ENQUIRE_CLAUSES.includes(INTAKE_SENTENCE));
  for (const re of [/A claim in the narrative becomes something to find/, /turning remembered claims into "find the record" steps/, /never as what the district said/,
                    /recollection of what a public body said is not the body's statement/, /checks the answers before/,
                    /Rumours become leads, never questions aimed at a person/, /warned at the act, and decides/])
    assert.ok(ENQUIRE_CLAUSES.some((c) => re.test(c.text)), String(re));
  assert.match(layer.load_when, /interviews a member at intake/);
});

test("R42 the explore layer reuses the investigate mode's instructions by their keys and adds the rules for exploring: capture only what the record points to, never a person on its own", () => {
  const pack = renderPack(published());
  const layer = pack.disclosed.explore;
  assert.deepEqual(layer, exploreLayer());
  assert.equal(layer.sourcing, "authored");
  assert.deepEqual(layer.body.reuses, Object.keys(judgementLayers()), "named by key, never copied");
  for (const k of layer.body.reuses) {
    assert.ok(k in pack.disclosed, `${k} is a layer of the pack`);
    assert.equal(typeof layer.body[k], "undefined", `${k}'s body is not carried twice`);
  }
  for (const re of [/asking to capture pages the record already points to/, /names to a member, who captures it/,
                    /never explores a person on its own/, /only when a member has tied that person to the question/,
                    /labelled signal/, /never a grade, never a stored score/, /never facts/,
                    /finds are labelled as the system's work/, /never concludes, determines or attests/])
    assert.ok(EXPLORE_CLAUSES.some((c) => re.test(c.text)), String(re));
  /* The control: the opposite of the person rule is not canon. */
  assert.ok(!foundIn(CANON(), "The system explores a person on its own."));
});

test("R42 the reading layer: reading inside a document the group holds, every proposal tied to its exact quote and taken up by a member's act", () => {
  const layer = renderPack(published()).disclosed.reading;
  assert.deepEqual(layer, readingLayer());
  assert.equal(layer.sourcing, "authored");
  assert.equal(layer.body.clauses, READING_CLAUSES);
  for (const re of [/a few pages at a time, within a reading limit, and never one under a "no AI" limit/,
                    /tied to its exact quote, labelled as the system's work, and taken up by a member's act/,
                    /keeps the document's capture grade/, /never grades one D/, /any sentence that cannot be tied is left out/,
                    /never cited as evidence/, /graded "undetermined" until its accuracy is measured/])
    assert.ok(READING_CLAUSES.some((c) => re.test(c.text)), String(re));
  assert.ok(!foundIn(CANON(), "Each proposal is tied to its exact quote, labelled as the member's work"), "the control");
});

test("R44 the case_account and account_check layers: the account drafted only from the cited evidence in the framings named, labelled the system's; each unsupported sentence flagged; a claim never relabelled as bias", () => {
  const pack = renderPack(published());
  assert.deepEqual(pack.disclosed.case_account, caseAccountLayer());
  assert.deepEqual(pack.disclosed.account_check, accountCheckLayer());
  for (const k of ["case_account", "account_check"]) {
    assert.equal(pack.disclosed[k].sourcing, "authored");
    assert.equal(SOURCING[k], "authored");
  }
  assert.equal(pack.disclosed.case_account.body.clauses, CASE_ACCOUNT_CLAUSES);
  assert.equal(pack.disclosed.account_check.body.clauses, ACCOUNT_CHECK_CLAUSES);
  assert.ok(CASE_ACCOUNT_CLAUSES.some((c) => /drafts the case's written account from the evidence/.test(c.text)
    && /in time order, by question, by rule/.test(c.text) && /each labelled as the system's/.test(c.text)));
  assert.ok(CASE_ACCOUNT_CLAUSES.some((c) => /no stories/.test(c.text)));
  for (const re of [/every sentence is checked against the evidence it cites/, /does not support is flagged/,
                    /record contradicts is refused outright/, /An unsupported claim cannot be relabelled as bias/,
                    /Lying is not bias/])
    assert.ok(ACCOUNT_CHECK_CLAUSES.some((c) => re.test(c.text)), String(re));
  assert.ok(!foundIn(CANON(), "An unsupported claim can be relabelled as bias."), "the control");
});

test("R40 the reading_guide layer: with no guide passed, a stated absence in R9's form and the pack still renders; with one, sourcing guide, the guide named with its kind and origin, its items only", () => {
  for (const none of [undefined, null, [], [{ guide: null, origin: null }], "x", {}]) {
    const layer = readingGuideLayer(none);
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.equal(SOURCING.reading_guide_none, "absent");
    assert.deepEqual(layer.body, {});
  }
  const bare = renderPack(published());
  assert.deepEqual(bare.disclosed.reading_guide, readingGuideLayer(null));
  const pack = renderPack(published(), { reading_guides: [guide(ITEMS)] });
  const layer = pack.disclosed.reading_guide;
  assert.equal(layer.sourcing, "guide");
  assert.equal(SOURCING.reading_guide, "guide");
  assert.deepEqual(layer.body.guides, [{ kind: "construction_contract", guide: "GUD-1", origin: "group", items: ITEMS }]);
  assert.deepEqual(layer.body.guides[0].items, checkGuide(ITEMS).items, "the items as the guide check passed them");
  assert.deepEqual(readingGuideLayer([guide(ITEMS.map((it) => ({ ...it, label: `  ${it.label} ` })))]).body.guides[0].items,
    ITEMS, "trimmed by the check, nothing else");
  for (const leaked of ["state", "author"]) assert.ok(!(leaked in layer.body.guides[0]), `the items only: no ${leaked}`);
  assert.ok(pack.resident.disclosable.some((d) => d.layer === "reading_guide" && d.load_when === layer.load_when));
  /* R11: a run under a guide ran under other instructions. */
  assert.notEqual(pack.version, bare.version);
  assert.notEqual(renderPack(published(), { reading_guides: [guide(ITEMS.slice(1))] }).version, pack.version);
  assert.equal(renderPack(published(), { reading_guides: [guide(ITEMS)] }).version, pack.version, "the control");
});

test("R40 R16 a guide carries no clause of conduct: an item R16 finds throws, naming the guide and the item, and renderPack renders nothing", () => {
  for (const [field, text] of [["look_for", "Look for the clause, and keep searching until you are satisfied"],
                               ["label", "Repeat until found"], ["where", "at most three passes over the schedule"]]) {
    const items = [...ITEMS, { label: "x", look_for: "Look for the bond", [field]: text }];
    assert.ok(controlFlowAuthority(text).length > 0, `the scan fires on ${text}`);
    assert.throws(() => readingGuideLayer([guide(items)]), /reading guide GUD-1 item 4 .*carries a clause of conduct/);
    assert.throws(() => renderPack(published(), { reading_guides: [guide(items)] }), /GUD-1 item 4/);
  }
  /* The control: the clean guide renders. */
  assert.doesNotThrow(() => renderPack(published(), { reading_guides: [guide(ITEMS)] }));
});

test("R40 reading-guides' R4 runs at every render: an item its closed lists refuse, or one that is not a look-for statement, throws naming the guide and the item, though R16 finds nothing in it", () => {
  for (const bad of [{ label: "Bond", look_for: "Look for the bond the assistant attached" },
                     { label: "Bond", look_for: "Look for whatever the rule permits" },
                     { label: "Bond", look_for: "Look for op=fetch in the schedule" },
                     { label: "Bond", look_for: "The performance bond amount" }]) {
    assert.deepEqual(controlFlowAuthority(bad.look_for), [], "R16 alone would pass it");
    const items = [ITEMS[0], bad];
    assert.equal(checkGuide(items).ok, false, "R4 refuses it");
    assert.throws(() => readingGuideLayer([guide(items)]), /reading guide GUD-1 item 2 \("Bond"\)/);
    assert.throws(() => renderPack(published(), { reading_guides: [guide(items)] }), /GUD-1 item 2/);
  }
  assert.throws(() => readingGuideLayer([guide([])]), /reading guide GUD-1/, "a guide with no items is no guide");
});

test("R40 K2472 skills registers R16 as reading-guides' conduct check once, at load: the check then refuses a control-flow item no closed list names, and a second registration is refused", () => {
  assert.deepEqual({ ...CONDUCT_CHECK_REGISTRATION }, { ok: true, module: "skills" });
  assert.equal(conductCheckHolder(), "skills");
  const loop = [{ label: "Bond", look_for: "Look for the bond, and keep going until you are satisfied" }];
  assert.ok(controlFlowAuthority(loop[0].look_for).length > 0);
  const r = checkGuide(loop);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "GUIDE_CARRIES_CONDUCT");
  assert.equal(r.found.list, "registered", "refused by the registered R16, not a closed list");
  assert.deepEqual(r.found.patterns, controlFlowAuthority(loop[0].look_for));
  assert.equal(registerConductCheck(() => [], "other").reason, "PROVIDER_DECLARED", "one registration per process");
  /* The control: a clean item passes the registered check. */
  assert.equal(checkGuide([ITEMS[1]]).ok, true);
});

test("R16 R24 R26 R22 no string of the investigation's layers carries control-flow authority or names a place; none reads a viewer", () => {
  const pack = renderPack(published(), { reading_guides: [guide(ITEMS)] });
  for (const k of LAYERS) {
    for (const s of strings(pack.disclosed[k])) assert.deepEqual(controlFlowAuthority(s), [], `${k}: ${s}`);
    const text = JSON.stringify(pack.disclosed[k]);
    for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"]) assert.ok(!text.includes(place));
  }
  assert.ok(controlFlowAuthority("Keep searching until the account reads well.").length > 0, "the scan can fire");
  /* R22: the same inputs render the same pack, whatever else the published answer carries. */
  const v = renderPack(published()).version;
  for (const extra of [{ viewer: "m1" }, { project: "PRJ-1" }, { exploring: "yes" }])
    assert.equal(renderPack(published(extra)).version, v);
  assert.equal(packVersion(renderPack(published())), v);
});

test("R40 R16 runs again at render whatever reading-guides' check answers: with checkGuide made to pass everything, a control-flow item still throws, naming the guide and the item", () => {
  const rg = join(ROOT, "bio-plane/src/reading-guides/index.mjs");
  const run = (look) => execFileSync(process.execPath, ["--experimental-test-module-mocks", "--no-warnings",
    "--input-type=module", "-e", `
    import { mock } from "node:test";
    const real = { ...(await import(${JSON.stringify(rg + "?real")})) };
    mock.module(${JSON.stringify("file://" + rg)}, { namedExports: { ...real,
      checkGuide: (items) => ({ ok: true, items }), registerConductCheck: () => ({ ok: true, module: "skills" }) } });
    const { renderPack } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/skillpack.mjs"))});
    const { published } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/test/m/skills/fixture.mjs"))});
    const guides = [{ guide: { id: "GUD-9", kind: "k", items: [{ label: "Bond", look_for: ${JSON.stringify(look)} }] }, origin: "group" }];
    try { renderPack(published(), { reading_guides: guides }); console.log("RENDERED"); } catch (e) { console.log("THREW " + e.message); }`],
    { encoding: "utf8" });
  assert.match(run("Look for the bond, and repeat until it is found"), /^THREW the reading guide GUD-9 item 1 \("Bond"\) carries a clause of conduct \(a loop written as an instruction/m);
  assert.match(run("Look for the bond amount"), /^RENDERED/m, "the control: a clean item renders");
});
