/* screens-publish R38 (T51-121; DEC-330 A77): "Read it at a minimum strength" on `published`: a minimum on each axis, the browser act
 * that shows only the findings at or above both, the filtered view that says it is the reader's own, and the way back. Page memory
 * only: no request is sent to set or clear a minimum. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, drew, drewIn, tipOf, word, ops, press, fill, ok, C, F1, F2, FINDING, publishedPlane, hasWord } from "./fixtures.mjs";

const PUBLIC = { session: null };
const PATH = `/app/published/${C}`;
const pair = (capture, connection) => [capture ? { axis: "capture", grade: capture } : null, connection ? { axis: "connection", grade: connection } : null].filter(Boolean);
const TWO = () => publishedPlane([FINDING(F1, { strength: pair("B", "B") }), FINDING(F2, { strength: pair("C", "B"), standing: { role: "supporting", bar: { capture: "B", connection: "B" }, meets: false } })]);
const set = (p, capture, connection) => press(p, "pubfloorset", { values: { "pb-fl-capture": capture, "pb-fl-connection": connection } });
const sec = (p) => main(p).querySelectorAll("h2").find((h) => h.textContent === word("screen.published.read.it.at.a.minimum"))?.closest("section") ?? null;
const shown = (p) => main(p).querySelectorAll("article.mk-finding").map((a) => a.getAttribute("data-finding"));

test("R38 the case page offers the minimum: a choice for each axis and the act, explained by both sentences; with the explanation's note", async () => {
  const p = await open(PATH, { boot: PUBLIC, plane: TWO() });
  const s = sec(p);
  assert.ok(s, "the section");
  assert.ok(tipOf(s.querySelector("h2")).includes(word("screen.published.a.way.to.read.the.explain")) && tipOf(s.querySelector("h2")).includes(word("screen.published.it.changes.only.what.you.explain")));
  assert.ok(drewIn(s, "screen.published.choose.the.weakest.strength.you") && drewIn(s, "screen.published.the.page.then.shows.only"));
  assert.ok(drewIn(s, "screen.published.how.well.the.documents.are") && drewIn(s, "screen.published.how.firmly.they.are.linked"));
  assert.deepEqual(["pb-fl-capture", "pb-fl-connection"].map((id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.getAttribute("value"))), [["", "C", "B", "A"], ["", "C", "B", "A"]], "no minimum, then C, B, A");
  assert.ok(s.querySelector('button[data-act="pubfloorset"]').textContent.includes(word("act.owed_pubfloorset.label.published")));
  assert.ok(hasWord("act.owed_pubfloorset.does"));
  assert.deepEqual(shown(p), [F1, F2], "the whole case");
});

test("R38 minimums B and B draw the filtered view: the notice with 1 of 2 and the whole-case signature sentence, only the finding at or above both, Back to the whole case and Print; clearing it draws both", async () => {
  const p = await open(PATH, { boot: PUBLIC, plane: TWO() });
  const before = p.requests.length;
  await set(p, "B", "B");
  assert.equal(p.requests.length, before, "no request is sent to set a minimum");
  const notice = main(p).querySelector("[data-filtered]");
  assert.ok(notice, "the notice");
  assert.ok(drewIn(notice, "screen.published.a.filtered.view.you.constructed") && drewIn(notice, "screen.published.you.asked.for.findings.held", { capture: "B", connection: "B" }));
  assert.ok(drewIn(notice, "screen.published.this.is.part.of.the", { n: "1", total: "2", hidden: "1" }), "1 of 2 findings, the other below the minimum");
  assert.ok(drewIn(notice, "screen.published.the.team.s.signature.covers"), "the team's signature covers the whole case, not this view");
  assert.deepEqual(shown(p), [F1]);
  assert.ok(ops(p).includes("pubfloorclear") && ops(p).includes("pubprint"));
  assert.equal(main(p).querySelector('button[data-act="pubfloorclear"]').getAttribute("data-tone"), "primary");
  assert.equal(sec(p), null, "the minimum's own section is not drawn in the filtered view");
  await press(p, "pubfloorclear");
  assert.deepEqual(shown(p), [F1, F2]);
  assert.equal(main(p).querySelector("[data-filtered]"), null);
  assert.equal(p.requests.length, before, "no request is sent to clear it");
});

test("R38 several left out draws the plural sentence; no finding at the minimum draws the note in its fold and no finding; a grade the answer does not state never meets a floor (controls)", async () => {
  const three = publishedPlane([FINDING(F1, { strength: pair("B", "B") }), FINDING(F2, { strength: pair("C", "C") }), FINDING("FND-2026-0033", { strength: pair("C", "D") })]);
  const p = await open(PATH, { boot: PUBLIC, plane: three });
  await set(p, "B", "");
  assert.ok(drewIn(main(p).querySelector("[data-filtered]"), "screen.published.this.is.part.of.the.many", { n: "1", total: "3", hidden: "2" }));
  assert.ok(drewIn(main(p).querySelector("[data-filtered]"), "screen.published.you.asked.for.findings.held", { capture: "B", connection: "–" }), "an axis with no minimum reads as none");
  const none = await open(PATH, { boot: PUBLIC, plane: TWO() });
  await set(none, "A", "A");
  assert.deepEqual(shown(none), []);
  const fold = main(none).querySelector('[data-fold="screen.published.when.no.finding.meets.the"]');
  assert.ok(fold && fold.hasAttribute("open") && drewIn(fold, "screen.published.no.finding.in.this.case") && drewIn(fold, "screen.published.lower.the.minimum.or.go"));
  const none0 = { n: "0", total: "2", hidden: "2" };
  assert.ok(!drew(none, "screen.published.this.is.part.of.the.many", none0) && !drew(none, "screen.published.this.is.part.of.the", { ...none0, hidden: "1" }), "no count is drawn at zero");
  assert.ok(drewIn(main(none).querySelector("[data-filtered]"), "screen.published.the.team.s.signature.covers"), "the notice still says the signature covers the whole case");
  assert.ok(ops(none).includes("pubfloorclear"), "the two acts remain");
  const unstated = await open(PATH, { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { strength: pair("A", null) }), FINDING(F2, { strength: [{ axis: "capture", grade: "A" }, { axis: "connection", grade: "unrated" }] })]) });
  await set(unstated, "", "C");
  assert.deepEqual(shown(unstated), [], "a connection grade that is missing or no letter meets no floor on connection");
  await press(unstated, "pubfloorclear");
  await set(unstated, "A", "");
  assert.deepEqual(shown(unstated), [F1, F2], "the same findings meet a floor on the axis they state");
});

test("R38 the minimum is page memory only: a new visit draws the whole case; the check of a file, the signature and the case's own acts are never filtered; no minimum chosen draws the whole case (controls)", async () => {
  const p = await open(PATH, { boot: PUBLIC, plane: TWO() });
  await set(p, "B", "B");
  assert.deepEqual(shown(p), [F1]);
  const again = await open(PATH, { boot: PUBLIC, plane: TWO() });
  assert.deepEqual(shown(again), [F1, F2], "a reload shows the whole case");
  assert.ok(![...p.store.values(), ...p.local.values()].some((v) => /pb-fl|floor/.test(String(v))), "nothing is stored");
  assert.ok(!/floor|minimum/i.test(p.location.pathname + p.location.search + p.location.hash), "nothing is in the address");
  await press(again, "pubfloorset", { values: { "pb-fl-capture": "", "pb-fl-connection": "" } });
  assert.equal(main(again).querySelector("[data-filtered]"), null, "no minimum chosen is no filter");
  assert.ok(drew(again, "published.check.title") && ops(again).includes("verify"), "the check is the whole case's");
});
