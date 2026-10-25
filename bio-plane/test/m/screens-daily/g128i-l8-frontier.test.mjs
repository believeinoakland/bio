/* plane G128i L8 (fix round 9; X29; S4 of audit-silent-partial-reads-K4571; corpus R set, K4426 "Still MISSING" row 6): THE FRONTIER SAYS "SOMEBODY HAS LOOKED EVERYWHERE" WITH 34 OF 59 DOCUMENTS UNREAD. The walk's project held 59
   documents; 34 had been read in part (a scan with pages left, a reading refused whole) and the Finder's frontier said nobody had anywhere left to look. The case is built from the real parts, not a stub answer: 59 documents filed in the
   real retrieval fixture (`retrieval/fixture.mjs`: the real record, promotion, extraction and observation-log over SQLite), 25 whose extraction was whole and 34 whose extraction was partial, each looked at as extraction's writer writes
   the row; the real `frontier` answer for the content level (retrieval R36-R42); and that answer drawn by the real Finder screen (screens-daily, on its served page). Judged by the statement: the tally holds the 34 partial looks beside the 25,
   the page TELLS the partial looks with their count, and "somebody has looked everywhere" (`screen.finder.nobody.none`) is NOT drawn; the control (all 59 whole) draws it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "../retrieval/fixture.mjs";
import { open as openRaw, ok, text, press, settle, word, withScreens } from "./page.mjs";

const GOT = { found: true, built: true, never_looked: [], never_looked_count: 0, tally: { LOOKED_FOUND: 4, LOOKED_ABSENT: 1 }, note: "" };
const AT = (i) => `2026-09-27T01:${String(i % 60).padStart(2, "0")}:00Z`;

/** a project of `whole + partial` documents, each looked at once by extraction; returns the real frontier answer for the content level */
function frontierOf(whole, partial) {
  const w = world();
  const caps = Array.from({ length: whole + partial }, (_, i) => w.cap(`doc${i}`, `d${i}`));
  w.doc("INFO-1", {}, { captures: caps });
  caps.forEach((c, i) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract", authority: "INFO-1", at: AT(i),
    state: i < whole ? "PRESENT" : "partial", result_kind: "reading", result_ref: c.sha, ...(i < whole ? {} : { condition: "tier3-pages", detail: "pages left" }) }));
  return w.retrieval.frontier({ level: "content", viewer: V("vera"), limit: 200 });
}

const open = (path, plane) => openRaw(path, plane, { screens: withScreens("document", "question", "person", "action", "plan", "project", "timeline") });
const finder = async (content) => {
  const p = await open("/app/finder", { frontier: (req) => ok(req.query.level === "content" ? content : GOT) });
  await press(p, "frontier", { reason: "looking" });
  await settle();
  return p;
};

test("G128i L8: 59 documents, 34 read in part: the real frontier tallies the partial looks and the Finder does not say somebody has looked everywhere", async () => {
  const f = frontierOf(25, 34);
  console.log("G128i L8 real frontier tally:", JSON.stringify(f.tally), "looked", (f.looked || []).length, "never_looked_count", f.never_looked_count);
  assert.equal(f.tally.partial, 34, "the tally holds the 34 partial looks");
  assert.equal(Object.values(f.tally).reduce((a, b) => a + b, 0), 59, "and 59 looks in all");
  const p = await finder(f);
  assert.ok(text(p).includes(word("observation-log.partial.looked_got_part")), "the partial look is told");
  assert.ok(text(p).includes("(34)"), "with its count, 34");
  assert.ok(!text(p).includes(word("screen.finder.nobody.none")), "somebody has NOT looked everywhere: 34 of 59 are read in part");
});

test("G128i L8 control: 59 documents every one read whole: the Finder draws 'somebody has looked everywhere'", async () => {
  const f = frontierOf(59, 0);
  assert.equal(f.tally.partial, undefined, "no partial look");
  const p = await finder(f);
  assert.ok(text(p).includes(word("screen.finder.nobody.none")), "with every level whole the sentence is drawn");
  assert.ok(!text(p).includes(word("observation-log.partial.looked_got_part")), "and no partial look is told");
});
