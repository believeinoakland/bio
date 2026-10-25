/* screens-inquiry fix round 3 (T51), the question screen: C41 (R35, R50, R117: a refused basis version names the legs the plane says it left
 * unplaced, by their documents' titles), C36 (R23, R24, R34: a leg whose extent states a paragraph draws it), C44 (R2: no opener, the head draws
 * the date), C38 (R2: a removed citation is counted nowhere), C94 (members named by handle). On interface-shell's served page over a scripted
 * plane; every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, fill, press, inquiryMd, INQUIRY_REFS, LEGS, BASIS, says, word, day, lead, section, P, Q, D, SHA, POLICY } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const refusedBody = (code, extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...extra } } });

/* ------------------------------------------------------------------------------------------------------------------ C41 */

const D2 = "INFO-2026-0005";
const D3 = "INFO-2026-0011";
const D4 = "INFO-2026-0012";
const D5 = "INFO-2026-0013";
const TITLE5 = "Work orders, October";
const docMd = (id, title) => ["---", `id: ${id}`, "object_type: information", ...(title ? [`title: "${title}"`] : []), `project: ${P}`, "---", "", "## Summary", ""].join("\n");
const unplaced = (legs) => ({ check: "C-2.8", code: "VERSION_PARTITION_INCOMPLETE", detail: "version 'main' has 2 legs with no ground", translation: "Every passage must be placed in a part.", legs, repairs: ["repair-sentinel-qq"] });
const conclude = async (code, findings, o = {}) => {
  const p = await open(at, { images: { [D5]: { "bundle.md": docMd(D5, TITLE5) }, [D3]: { "bundle.md": docMd(D3, "") }, [D4]: { "bundle.md": docMd(D4, "") } }, plane: { conclude: refusedBody(code, { findings }), ...(o.plane || {}) } });
  fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "it answers it" });
  return press(p, "conclude");
};

test("R35 R50 R117 C41 a BASIS_VERSION_REFUSED whose first finding carries legs: [a, b] draws the finding and both legs, each by its document's title; control: no legs, no names; BASIS_REFUSED unchanged", async () => {
  const slot = await conclude("BASIS_VERSION_REFUSED", [unplaced([D, D2])]);
  assert.ok(says(slot, "refusal.VERSION_PARTITION_INCOMPLETE"), "the finding, by the word held for its code");
  assert.ok(slot.textContent.includes("repair-sentinel-qq"), "its repair");
  const named = slot.querySelector("[data-legs]");
  assert.ok(named, "the legs are named");
  assert.ok(named.textContent.includes(POLICY) && named.textContent.includes("Work orders"), "both, by the title the reading states for them");
  assert.ok(!named.textContent.includes(D) && !named.textContent.includes(D2), "never an id");
  /* a leg the reading does not hold is named by its document's own title, read for the purpose */
  const own = await conclude("BASIS_VERSION_REFUSED", [unplaced([D5])]);
  assert.ok(own.querySelector("[data-legs]").textContent.includes(TITLE5), "the document's own title");
  /* control: a finding with no legs names none */
  const bare = await conclude("BASIS_VERSION_REFUSED", [{ ...unplaced(undefined), legs: undefined }]);
  assert.ok(says(bare, "refusal.VERSION_PARTITION_INCOMPLETE") && bare.querySelector("[data-legs]") === null, "no legs, none named");
  /* control: BASIS_REFUSED is drawn as before (its detail) and names no legs */
  // fixtures-generic: SOMETHING_ELSE (a finding code made up on purpose: the control that BASIS_REFUSED names no legs, whatever code it carries)
  const old = await conclude("BASIS_REFUSED", [{ check: "C-9.9", code: "SOMETHING_ELSE", detail: "the leg names no edition", legs: [D, D2] }]);
  assert.ok(old.textContent.includes("the leg names no edition") && old.querySelector("[data-legs]") === null, "BASIS_REFUSED unchanged");
});

test("R116 C41 a leg whose document has no title draws the plain word for a document once, however many such legs the finding names", async () => {
  const slot = await conclude("BASIS_VERSION_REFUSED", [unplaced([D3, D4, D5])]);
  const named = slot.querySelector("[data-legs]");
  assert.ok(named.textContent.includes(TITLE5), "the titled leg by its title");
  assert.equal(named.textContent.split(word("shell.card.document")).length - 1, 1, "the plain word once");
  assert.ok(!named.textContent.includes(D3) && !named.textContent.includes(D4), "never an id");
});

/* ------------------------------------------------------------------------------------------------------------------ C36 */

const SHA2 = "7c1d" + "0".repeat(56) + "e002";
const SITE = "A web page from www.oaklandca.gov";
const webImage = (id, sha) => ({ "bundle.md": ["---", `id: ${id}`, "object_type: information", `title: "${SITE}"`, `project: ${P}`, "source:", "  locator: https://www.oaklandca.gov/x", "---", ""].join("\n"),
  "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: sha } }] }) });
const legsMd = (legs) => ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', "created: 2026-10-03T10:00:00Z", `project: ${P}`, "references:",
  ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites", "    status: confirmed"]), "basis:",
  ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports", "    grade: B", ...(l.ext || [])]), "---", "", "## Question", "", "Is the city repairing reported potholes within seven days?", "", "## Session Log", ""].join("\n");
const para = (n, text) => ({ seq: n + 1, extent: { kind: "doc-para", para: n }, reference: "p" + n, truncated: false, text });
const readingOf = (r) => ok({ ok: true, found: true, capture_sha: r.query.sha256, reading: { content_type: "text/html", found: true },
  text_units: r.query.sha256 === SHA2 ? [para(0, "Intro."), para(2, "Potholes reported through 311 are repaired within seven days.")] : [], unread_pages: [] });
const supportsRows = (p) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.question.supports.head")).querySelectorAll(".cs-row");

test("R23 R24 R34 C36 a web-page leg whose extent states a paragraph draws `screen.question.leg.paragraph` (counted from zero in the record, drawn from one) and its words; control: a leg with no paragraph and no page draws neither", async () => {
  const p = await open(at, { images: { [Q]: { "bundle.md": legsMd([{ target: D2, ext: ["    extent_kind: doc-para", "    extent_para: 2"] }, { target: D }]) }, [D]: webImage(D, SHA), [D2]: webImage(D2, SHA2) },
    plane: { reading: readingOf, basisversions: ok({ ok: true, inquiry: Q, versions: [] }) } });
  const rows = supportsRows(p);
  assert.equal(rows.length, 2);
  assert.ok(says(rows[0], "screen.question.leg.paragraph", { n: "3" }), "Paragraph 3 for paragraph 2 counted from zero");
  assert.ok(rows[0].textContent.includes("Potholes reported through 311 are repaired within seven days."), "and its words");
  assert.ok(!rows[0].textContent.includes(word("screen.document.passage.where", { page: "3" })), "not as a page");
  assert.ok(!rows[1].textContent.includes(word("screen.question.leg.paragraph", { n: "1" }).split("1")[0]) && !rows[1].textContent.includes(word("screen.document.passage.where", { page: "1" }).split("1")[0]),
    "control: no paragraph and no page, neither");
});

test("R78 C36 the paragraph of a leg the reading shown states (`extent: {para}`) is drawn the same; a page extent still draws its page", async () => {
  const basis = ok(BASIS({ versions: [{ name: "main", state: "accepted", author: "member:dev", moved: { by: "dev", at: "2026-10-06T09:00:00Z", reason: null }, grounds: [], legs: [
    { ord: 1, target: D, role: "supports", grade: "B", target_title: POLICY, extent: { kind: "doc-para", para: 0 } },
    { ord: 2, target: D2, role: "supports", grade: "B", target_title: "Work orders", extent: { kind: "pdf-page", page: 4 } }] }] }));
  const p = await open(at, { images: { [Q]: { "bundle.md": legsMd([{ target: D }, { target: D2 }]) } }, plane: { basisversions: basis } });
  const rows = supportsRows(p);
  assert.ok(says(rows[0], "screen.question.leg.paragraph", { n: "1" }), "paragraph 0 is Paragraph 1");
  assert.ok(says(rows[1], "screen.document.passage.where", { page: "5" }) && !rows[1].textContent.includes(word("screen.question.leg.paragraph", { n: "5" })), "a page is a page");
});

/* ------------------------------------------------------------------------------------------------------------------ C44 */

test("R2 C44 a question whose record names no opener draws `screen.project.opened.date` with the project beside it, and no 'Opened by' with an undetermined name; control: with an author, the existing sentence", async () => {
  const none = await open(at);
  const sub = main(none).querySelector(".mk-sub");
  assert.ok(says(sub, "screen.project.opened.date", { date: day("2026-10-03") }), "Opened <date>");
  assert.ok(!sub.textContent.includes(lead("screen.question.opened")), "no 'Opened by'");
  assert.ok(!sub.textContent.includes(word("state.undetermined", { reason: "" }).trim()), "no undetermined name");
  assert.ok(sub.querySelector('a.cs-ref[href="/app/project/' + P + '"]'), "the project beside it");
  /* the same when the question has no project to name */
  const loose = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(null) } }, inquiryProject: null });
  const sub2 = main(loose).querySelector(".mk-sub");
  assert.ok(says(sub2, "screen.project.opened.date", { date: day("2026-10-03") }) && !sub2.textContent.includes(lead("screen.question.opened")), "no project, no opener");
  /* control: an author in the first promotion keeps the existing sentence */
  const hist = JSON.stringify({ target: Q, base: null, created: "2026-10-03T10:00:00Z", author: "member:dev" });
  const named = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(), "_history/promotion_a.json": hist } } });
  const sub3 = main(named).querySelector(".mk-sub");
  assert.ok(sub3.textContent.includes(word("screen.question.opened", { name: "dev", date: day("2026-10-03"), project: "" }).trim()), "the existing sentence");
  assert.ok(!sub3.textContent.includes(word("screen.project.opened.date", { date: day("2026-10-03") })), "and not the date-only head");
});

/* ------------------------------------------------------------------------------------------------------------------ C38 */

const SEVERED = "Severed 2026-10-07T09:00:00Z: the wrong year's orders";
const refsWith = (status2) => [[D, "cites", "confirmed", null], [D2, "cites", status2, status2 === "severed" ? JSON.stringify(SEVERED) : null]];
const twoLegs = (o = {}) => [{ target: D, role: "supports", grade: "B", ...(o.g1 ? { ground: "part 1" } : {}) }, { target: D2, role: "supports", grade: "B", ...(o.g2 ? { ground: "part 1" } : {}) }];
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];

test("R2 R23 C38 state b: a severed citation is not asked about and not sent in the partition; saving sends the live passage alone; control: the same leg live is both asked about and sent", async () => {
  const run = async (status2) => {
    const p = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, refsWith(status2), { legs: twoLegs() }) } }, plane: { inquiryground: ok({ ok: true, act: "authored" }) } });
    const asked = section(p, "question.ask.title").querySelectorAll("[data-ask]").length;
    /* each live passage answered "Yes" with no other named: a ground of its own (R23; a "No" is necessary and in no ground, DEC-32 clause 2) */
    p.doc.getElementById("ask-0-1").checked = true;
    if (status2 !== "severed") p.doc.getElementById("ask-1-1").checked = true;
    await press(p, "inquiryground", { reason: "my first reading" });
    return { asked, grounds: p.byOp("inquiryground")[0].body.grounds };
  };
  const sev = await run("severed");
  assert.equal(sev.asked, 1, "only the live passage is asked about");
  assert.deepEqual(sev.grounds, [{ ground: "part 1", legs: [0] }], "the partition holds the live passage alone");
  const live = await run("confirmed");
  assert.equal(live.asked, 2, "control: the live leg is asked about");
  assert.deepEqual(live.grounds, [{ ground: "part 1", legs: [0] }, { ground: "part 2", legs: [1] }], "control: and sent");
});

test("R2 R116 C38 the strength sentence names the legs it leaves out by title, never a removed citation: a severed leg the answer lists is not named; control: the same leg live is named", async () => {
  const unrated = { state: "unrated", grade: null, weakest: null, load_bearing: 0, population: 2, not_load_bearing: [{ target_id: D }, { target_id: D2 }],
    detail: `UNRATED on capture: no leg carries a grade. Not load-bearing: ${D}, ${D2}.` };
  const strength = { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: { state: "graded", grade: "B" }, connection: unrated }) };
  const draw = async (status2) => {
    const p = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, refsWith(status2), { legs: twoLegs({ g1: true, g2: true }), grounds: GROUNDS }) } }, plane: strength });
    return main(p).querySelector(".mk-strengthbox");
  };
  const sev = await draw("severed");
  const axis = word("mark.scale.connection.name");
  assert.ok(says(sev, "strength.arithmetic.unrated_no_leg_on_this_axis", { axis, legs: POLICY }), "the live leg alone, by its title");
  assert.ok(!sev.textContent.includes("Work orders") && !sev.textContent.includes(D2), "the removed citation is not named");
  const live = await draw("confirmed");
  assert.ok(says(live, "strength.arithmetic.unrated_no_leg_on_this_axis", { axis, legs: POLICY + ", Work orders" }), "control: the same leg live is named");
});

test("R2 R24 C38 'What your answer rests on' and the weakest part leave out a removed citation; control: the same leg live is read back", async () => {
  const legs = twoLegs({ g1: true, g2: true });
  const draw = async (status2) => {
    const p = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, refsWith(status2), { legs, grounds: GROUNDS }) } },
      plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: { state: "graded", grade: "B", weakest: { target_id: D2, title: "Work orders" } }, connection: { state: "graded", grade: "C" } }) } });
    return { rests: section(p, "question.rests.title"), box: main(p).querySelector(".mk-strengthbox") };
  };
  const sev = await draw("severed");
  assert.ok(sev.rests.textContent.includes(POLICY) && !sev.rests.textContent.includes("Work orders"), "the read-back holds the live passage alone");
  assert.ok(!sev.box.textContent.includes("Work orders"), "and the weakest part is not a removed citation");
  const live = await draw("confirmed");
  /* fix round 4 (C36 aside; R24): each passage in the read-back is named with the words it cites where the reading shown states them */
  assert.ok(says(live.rests, "question.rests.all", { passages: POLICY + " \u00b7 \u201cwithin seven calendar days of the report\u201d, Work orders" }), "control: live, both are read back, the first by its words");
  assert.ok(says(live.box, "screen.question.strength.weakest", { weakest: "Work orders" }), "control: and the weakest part is named");
});

test("R2 C38 the page reads the strength and the partition again after a sever", async () => {
  const p = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, refsWith("confirmed"), { legs: twoLegs({ g1: true, g2: true }), grounds: GROUNDS }) } },
    plane: { select: (r) => ok({ ok: true, handle: "SEL-" + r.body.ids[0], items: r.body.ids }), sever: ok({ ok: true, severed: [D] }) } });
  const before = [p.byOp("inquirystrength").length, p.byOp("inquirypartition").length, p.byOp("partitionindependence").length];
  await press(p, "sever", { reason: "it is the 2023 policy", within: section(p, "screen.question.supports.head") });
  assert.ok(p.byOp("inquirystrength").length > before[0], "the strength is read again");
  assert.ok(p.byOp("inquirypartition").length > before[1], "and the partition");
  assert.ok(p.byOp("partitionindependence").length > before[2], "and its shared origins");
});

/* ------------------------------------------------------------------------------------------------------------------ C94 */

const ROSTER = ok({ ok: true, members: [{ member_id: "admin", handle: "sparky", founder: true }, { member_id: "u-7", handle: "rosa" }, { member_id: "u-9", handle: null }] });
const hist = (author) => JSON.stringify({ target: Q, base: null, created: "2026-10-03T10:00:00Z", author });
const CONCLUDED_BY = (by) => (r) => ok(BASIS(r.query.project ? { conclusion: { claim: { text: "Yes." }, by, at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" } : {}));
const waitsBy = (setter) => ok({ ok: true, waits: [{ document: "INFO-2026-0008", title: "2024 budget PDF", setter, reason: "wrong year", date: "2026-10-06T09:00:00Z" }] });
const hunchBy = (held_by) => ok({ ok: true, inquiry: Q, hypotheses: [{ hypothesis_id: "HYP-1", statement: "Crews close reports when they inspect.", held_by }] });

test("R2 R40 R46 C94 the members the question names from the record are drawn by handle, never by id: the founder's id `admin`, another member's id; an unknown id by the plain word; control: with the roster silent, the fallback words", async () => {
  const draw = async (author, roster) => open(at, { images: { [Q]: { "bundle.md": inquiryMd(), "_history/promotion_a.json": hist("member:" + author) } },
    plane: { memberlist: roster, basisversions: CONCLUDED_BY("member:" + author), questionwaits: waitsBy(author), hypotheses: hunchBy(author) } });
  const surfaces = (p) => ({ head: main(p).querySelector(".mk-sub"), concluded: section(p, "question.concluded.heading"), waits: section(p, "screen.question.waits.head"), hunches: section(p, "screen.question.hunches.head") });
  for (const [author, handle] of [["admin", "sparky"], ["u-7", "rosa"]]) {
    const p = await draw(author, ROSTER);
    await p.settle();
    const s = surfaces(p);
    assert.ok(s.head.textContent.includes(word("screen.question.opened", { name: handle, date: day("2026-10-03"), project: "" }).trim()), author + ": opened by " + handle);
    assert.ok(says(s.concluded, "question.concluded.by", { who: handle, date: day("2026-10-13") }), author + ": concluded by " + handle);
    assert.ok(says(s.waits, "screen.question.waits.setaside", { document: "2024 budget PDF", who: handle, reason: "wrong year" }), author + ": set aside by " + handle);
    assert.ok(says(s.hunches, "screen.question.hunch.by", { who: handle }), author + ": a hunch of " + handle);
    assert.doesNotMatch(main(p).textContent, /\badmin\b|\bu-7\b/, author + ": never the id");
  }
  /* an id the roster holds no handle for (or does not hold) is the plain word, never the id */
  const unk = await draw("u-99", ROSTER);
  await unk.settle();
  assert.ok(surfaces(unk).head.textContent.includes(word("screen.question.opened", { name: word("shell.card.member"), date: day("2026-10-03"), project: "" }).trim()), "unknown id: the plain word");
  assert.ok(says(surfaces(unk).waits, "screen.question.waits.setaside", { document: "2024 budget PDF", who: word("shell.card.member"), reason: "wrong year" }));
  assert.doesNotMatch(main(unk).textContent, /\bu-99\b/);
  /* control: no handle known (the roster silent): the founder unnamed by key, any other member by the plain word */
  const quiet = ok({ ok: true, members: [] });
  const f = await draw("admin", quiet);
  await f.settle();
  assert.ok(says(surfaces(f).waits, "screen.question.waits.setaside", { document: "2024 budget PDF", who: word("member.founder.unnamed"), reason: "wrong year" }), "the founder unnamed");
  const m = await draw("u-7", quiet);
  await m.settle();
  assert.ok(says(surfaces(m).waits, "screen.question.waits.setaside", { document: "2024 budget PDF", who: word("shell.card.member"), reason: "wrong year" }), "a member with no handle known: the fallback word");
});
