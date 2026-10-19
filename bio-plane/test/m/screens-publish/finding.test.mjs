/* screens-publish R37 (T51-121; DEC-330 A76): one finding's own page at <case>/<edition>/<finding>, read from `publishedcase` asked by
 * the finding's id, drawn in the public frame from what that answer holds and nothing more. Each sentence is asserted by its key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, drew, drewIn, tipOf, day, word, ok, refused, refusedIn, F1, F2, C, FINDING, leg, publishedPlane, findingPath } from "./fixtures.mjs";

const PUBLIC = { session: null };
const sectionOf = (p, key) => main(p).querySelectorAll("h2").find((h) => h.textContent === word(key))?.closest("section") ?? null;
const OTHER = { edition: 1, title: "Rents under the same lease, 2022 to 2024", ratified_at: "2026-06-01T10:00:00Z", case_id: "CASE-OTHER-1", bundle_sha: "e".repeat(64) };
const LEGS = [leg("INFO-1", "supports", "B", "capture"), leg("INFO-2", "supports", "B", "capture"), leg("INFO-3", "cuts_against", "C", "capture"),
  leg("FND-OTHER-4", "supports", "B", "connection", { served: true, cited_edition: OTHER })];
const DIVISION = { parent: { question: "Were the 2024 rent adjustments lawful?" }, siblings: [{ question: "Whether the shortfall was reported" }], detail: null };
const RICH = FINDING(F1, { basis: LEGS, division: DIVISION });
const FOUR = (o = {}) => publishedPlane([RICH, FINDING(F2)], { asked: F1, ...o });

test("R37 a finding's page draws its identity, the falsifier as signed, what it rests on (served and named-only legs), what rests on what, and the division, from one read asked by its id", async () => {
  const p = await open(findingPath(F1), { boot: PUBLIC, plane: FOUR() });
  assert.deepEqual([...new Set(p.requests.map((r) => r.op))].filter((o) => !["interfacewords", "groupidentity", "bootstrap"].includes(o)), ["publishedcase"], "one read");
  const read = p.byOp("publishedcase")[0].query;
  assert.deepEqual([read.id, read.caseId, read.edition], [F1, C, "2"], "asked by the finding's id");
  for (const r of p.requests) assert.equal(r.headers.Authorization, undefined, `${r.op}: no credential`);
  assert.equal(main(p).querySelector("h1").textContent, word("screen.published.finding", { n: "1" }));
  assert.ok(text(p).includes("The 2024 adjustments were made without the council vote the lease requires."), "the conclusion in the author's words");
  assert.ok(main(p).querySelector("[data-whole-case]") && drew(p, "screen.published.back.to.the.whole.case"));
  assert.equal(main(p).querySelector("[data-whole-case]").getAttribute("href"), `/app/published/${encodeURIComponent(`${C}/2`)}`);
  // what would overturn it, as signed; no override section when the finding has none
  const over = sectionOf(p, "screen.published.what.would.overturn.it");
  assert.ok(over.textContent.includes("A council vote on the 2024 adjustments") && over.querySelector("details") === null);
  // what it rests on: one row for each leg, in order
  const rests = sectionOf(p, "screen.published.what.it.rests.on");
  assert.deepEqual(rests.querySelector("h2").getAttribute("data-tip") && tipOf(rests.querySelector("h2")).includes(word("screen.published.each.leg.is.one.thing.explain")), true);
  assert.ok(tipOf(rests.querySelector("h2")).includes(word("screen.published.a.leg.the.team.holds.explain")), "the second sentence follows the first");
  const rows = rests.querySelectorAll(".cs-row");
  assert.equal(rows.length, 4);
  assert.equal(rows.filter((r) => r.textContent.includes(word("screen.published.leg.namedonly"))).length, 3, "three documents the case only names");
  assert.ok(rows[3].textContent.includes(word("screen.published.named.only.its.documents.are")) && rows[3].textContent.includes(OTHER.title), "a leg on another team's finding: served with its own case, by the title it cites");
  assert.ok(rows[3].querySelector("a, .cs-card"), "the edition it cites as a reference");
  assert.ok(!rows.slice(0, 3).some((r) => /INFO-\d/.test(r.textContent)) && !/INFO-\d/.test(text(p)), "a target that is only named is never drawn, nor anything of the working material");
  // what rests on what: a line for each leg with its place and role
  const chain = sectionOf(p, "screen.published.what.rests.on.what");
  assert.ok(drewIn(chain, "screen.published.holds.leg.2.which.supports", { leg: "1", n: "1" }) && drewIn(chain, "screen.published.holds.leg.3.which.cuts", { leg: "3", n: "1" })
    && drewIn(chain, "screen.published.is.leg.4.which.supports", { leg: "4", n: "1" }));
  // whether the question was divided
  const div = sectionOf(p, "screen.published.whether.the.question.was.divided");
  assert.ok(drewIn(div, "screen.published.finding.1.answers.one.part", { n: "1" }) && drewIn(div, "screen.published.the.question.it.came.from", { question: "Were the 2024 rent adjustments lawful?" }));
  assert.ok(drewIn(div, "screen.published.the.other.part.is.named") && div.textContent.includes("Whether the shortfall was reported"));
  assert.deepEqual(main(p).querySelectorAll("h2").map((h) => h.textContent).slice(0, 4), ["screen.published.what.would.overturn.it", "screen.published.what.it.rests.on", "screen.published.what.rests.on.what", "screen.published.whether.the.question.was.divided"].map((k) => word(k)), "four sections in the drawing's order");
});

test("R37 the falsifier override is drawn with who set it and when; a finding with no division draws none; a document leg is never named (controls)", async () => {
  const override = FINDING(F1, { basis: [leg("INFO-1", "supports", "B", "capture")], body: { state: "published", from_sha: "a", conclusion: "We found it.",
    authored: { falsifier: "", falsifier_override: { by: "Rosa M.", at: "2026-09-18T10:00:00Z" } } } });
  const p = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([override], { asked: F1 }) });
  const fold = main(p).querySelector('[data-fold="screen.published.falsifier.override.summary"]');
  assert.ok(fold && drewIn(fold, "screen.published.falsifier.override", { member: "Rosa M.", date: day("2026-09-18") }) && drewIn(fold, "screen.published.falsifier.override.explain"), "the override, in its fold");
  assert.equal(sectionOf(p, "screen.published.whether.the.question.was.divided"), null, "no division, no section");
  assert.ok(!/INFO-1/.test(text(p)));
  assert.equal(main(p).querySelector("details[data-fold='screen.published.falsifier.override.summary']").hasAttribute("open"), true);
});

test("R37 a body that is unavailable still draws the finding's identity and strengths and says why; a finding the edition does not hold, or NOT_PUBLISHED, is Nothing is here (controls)", async () => {
  const gone = FINDING(F1, { body: { state: "unavailable", from_sha: B1x(), code: "OBJECT_MISSING" } });
  const p = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([gone], { asked: F1 }) });
  assert.equal(main(p).querySelector("h1").textContent, word("screen.published.finding", { n: "1" }));
  const art = main(p).querySelector('[data-body="unavailable"]');
  assert.ok(art && art.querySelector(".mk-grade, .cs-grade, [data-grade]") !== undefined && art.textContent.includes(word("screen.published.finding.unreadable")), "its strengths and the reason");
  assert.ok(!main(p).querySelector('[data-state="empty"]'), "never an empty page");
  const absent = await open(findingPath("FND-NOT-HERE"), { boot: PUBLIC, plane: publishedPlane([FINDING(F1)], { asked: F1 }) });
  assert.ok(main(absent).querySelector('[data-unavailable="nothing"]'));
  const nothing = await open(findingPath(F1), { boot: PUBLIC, plane: { publishedcase: refused("NOT_PUBLISHED", "Nothing published.", 404) } });
  assert.ok(main(nothing).querySelector("[data-state]"), "the refusal is drawn, not an empty page");
});

test("R37 a finding several cases pin draws the cases it names as references; the case page's finding is the way to its own page (controls)", async () => {
  const several = { publishedcase: { status: 400, json: { ok: false, reason: "FINDING_IN_SEVERAL_CASES", code: "FINDING_IN_SEVERAL_CASES", target: F1, cases: [C, "CASE-2025-0001"],
    memberships: [{ case_id: C, edition: 2 }, { case_id: "CASE-2025-0001", edition: 1 }] } } };
  const p = await open(findingPath(F1), { boot: PUBLIC, plane: several });
  const links = main(p).querySelectorAll('[data-state="failed"] a').map((a) => a.getAttribute("href"));
  assert.deepEqual(links, [`/app/published/${encodeURIComponent(`${C}/2/${F1}`)}`, `/app/published/${encodeURIComponent(`CASE-2025-0001/1/${F1}`)}`]);
  assert.ok(main(p).textContent.includes(word("refusal.FINDING_IN_SEVERAL_CASES").slice(0, 40)));
  const page = await open(`/app/published/${C}`, { boot: PUBLIC, plane: FOUR() });
  const door = main(page).querySelectorAll("[data-finding-page]");
  assert.equal(door.length, 2);
  assert.equal(door[0].getAttribute("href"), findingPath(F1, 2));
  await page.click(door[1]);
  assert.equal(page.location.pathname, findingPath(F2, 2));
});

function B1x() { return "7d0e" + "1".repeat(56) + "91ab"; }
