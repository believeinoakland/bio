/* screens-publish R42 and R43 (T51-121) and DEC-342 on interface-shell's served page: the sign step's open requests for comment and
 * minutes comparisons, drawn once from `publishpreflight`'s sign step by the keys its rows carry; the docket's "Pressure marked on
 * this case"; and a failed read's words, never the builder's `detail`. Each sentence is asserted by its key (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, tipOf, drew, drewIn, day, word, hasWord, ops, press, ok, refusedIn, refused, PREFLIGHT, P, DR, C } from "./fixtures.mjs";

const PATH = `/app/ceremony/${P}/${DR}`;
const withSign = (o) => { const pre = PREFLIGHT(); Object.assign(pre.steps[7], o); return { publishpreflight: ok(pre) }; };
const sectionOf = (p, key) => main(p).querySelectorAll("h2").find((h) => h.textContent === word(key))?.closest("section") ?? null;

/* the rows case-authoring R34 answers: case-inputs R10's line keys beside each row's facts, R18's `quotable` */
const REQUESTS = [
  { whom: "Councilmember Reyes", asked_at: "2026-10-14", window_closes: "2026-11-04", answers: { answered: 2, claims: 3 }, replied: true, quotable: false, key: "signing.openrequest.line" },
  { whom: "Public Works", asked_at: "2026-10-16", window_closes: "2026-11-06", answers: null, replied: false, key: "signing.openrequest.noreply" },
  { whom: "The Housing Authority", asked_at: "2026-10-12", window_closes: null, answers: null, replied: false, key: "signing.openrequest.nowindow.noreply" },
];
/* case-inputs R19: the rows with their keys, `same` true exactly when the texts are equal once whitespace is folded */
const MINUTES = [{ meeting: "the City Council meeting", date: "2026-10-07", minutes: "The team asked the council to publish the amendment.", filed: "The team asked the council to publish amendment 1 and the schedules.", same: false, key: "signing.minutes.line" }];

test("R42 the sign step draws the open requests, one line each with the dates in the design's words, and the minutes beside the public comment with .differs; nothing asked, nothing sent", async () => {
  const p = await open(PATH, { plane: withSign({ open_requests: { read: true, lines: REQUESTS }, minutes: MINUTES }) });
  const req = sectionOf(p, "screen.ceremony.openrequests.heading");
  assert.ok(req, "the section");
  assert.ok(tipOf(req.querySelector("h2")).includes(word("screen.ceremony.openrequests.says")), "explained by .says");
  assert.ok(drewIn(req, "signing.openrequest.line", { whom: "Councilmember Reyes", asked_at: day("2026-10-14"), window_closes: day("2026-11-04"), answered: "2", claims: "3" }));
  assert.ok(drewIn(req, "signing.openrequest.noquote", { whom: "Councilmember Reyes" }), "beside the row whose reply asks not to be quoted");
  assert.ok(drewIn(req, "signing.openrequest.noreply", { whom: "Public Works", asked_at: day("2026-10-16"), window_closes: day("2026-11-06") }));
  assert.ok(drewIn(req, "signing.openrequest.nowindow.noreply", { whom: "The Housing Authority", asked_at: day("2026-10-12") }), "a row with no window");
  assert.equal(req.querySelectorAll(".cs-row").length, 3, "one line each");
  assert.equal(req.querySelectorAll("button[data-act]").length, 0, "no act, no gate");
  const mins = sectionOf(p, "screen.ceremony.minutes.heading");
  assert.ok(mins && tipOf(mins.querySelector("h2")).includes(word("screen.ceremony.minutes.says")));
  assert.ok(drewIn(mins, "signing.minutes.line", { meeting: "the City Council meeting", date: day("2026-10-07") }));
  assert.ok(drewIn(mins, "signing.minutes.left") && drewIn(mins, "signing.minutes.right"));
  assert.ok(mins.textContent.includes(MINUTES[0].minutes) && mins.textContent.includes(MINUTES[0].filed), "both passages, as written");
  assert.ok(drewIn(mins, "signing.minutes.differs") && !drewIn(mins, "signing.minutes.same"));
  assert.ok(ops(p).includes("publish"), "the ceremony is as before: a gate is none of these");
});

test("R42 a row whose passages read the same draws .same; a window with no reply laid out and a reply that came draw their own keys (controls)", async () => {
  const same = { ...MINUTES[0], filed: MINUTES[0].minutes, same: true };
  const rows = [{ whom: "Parks", asked_at: "2026-10-01", window_closes: "2026-10-30", answers: null, replied: true, key: "signing.openrequest.notlaidout" },
    { whom: "Police", asked_at: "2026-10-02", window_closes: null, answers: { answered: 1, claims: 4 }, key: "signing.openrequest.nowindow.line" }];
  const p = await open(PATH, { plane: withSign({ open_requests: rows, minutes: [same] }) });
  assert.ok(drewIn(sectionOf(p, "screen.ceremony.minutes.heading"), "signing.minutes.same") && !drewIn(sectionOf(p, "screen.ceremony.minutes.heading"), "signing.minutes.differs"));
  const req = sectionOf(p, "screen.ceremony.openrequests.heading");
  assert.ok(drewIn(req, "signing.openrequest.notlaidout", { whom: "Parks", asked_at: day("2026-10-01"), window_closes: day("2026-10-30") }));
  assert.ok(drewIn(req, "signing.openrequest.nowindow.line", { whom: "Police", asked_at: day("2026-10-02"), answered: "1", claims: "4" }));
  assert.equal(req.querySelectorAll(".cs-row").length, 2, "an array of rows is read as the rows");
});

test("R42 requests that could not be read draw only signing.openrequest.unread under the heading (state k); minutes that could not be read draw signing.minutes.unread (state l); no rows draw neither heading (controls)", async () => {
  const k = await open(PATH, { plane: withSign({ open_requests: { read: false, undetermined: true, key: "signing.openrequest.unread" }, minutes: [] }) });
  const req = sectionOf(k, "screen.ceremony.openrequests.heading");
  assert.ok(req && drewIn(req, "signing.openrequest.unread") && req.querySelector(".cs-row") === null, "state k");
  assert.equal(sectionOf(k, "screen.ceremony.minutes.heading"), null, "no minutes");
  const l = await open(PATH, { plane: withSign({ open_requests: [], minutes: { undetermined: true } }) });
  const mins = sectionOf(l, "screen.ceremony.minutes.heading");
  assert.ok(mins && drewIn(mins, "signing.minutes.unread") && mins.querySelector(".cs-row") === null, "state l");
  assert.equal(sectionOf(l, "screen.ceremony.openrequests.heading"), null);
  const none = await open(PATH, { plane: withSign({ open_requests: [], minutes: [] }) });
  assert.equal(sectionOf(none, "screen.ceremony.openrequests.heading"), null);
  assert.equal(sectionOf(none, "screen.ceremony.minutes.heading"), null);
  const unreached = await open(PATH, { plane: withSign({ open_requests: { read: false, stated: "not reached" }, minutes: { undetermined: true } }) });
  assert.equal(sectionOf(unreached, "screen.ceremony.openrequests.heading"), null, "a step not reached draws no requests");
});

/* ---------- R43: the docket's pressure marks ---------- */

const MARK = (o = {}) => ({ kind: "legal", note: "A letter threatening to sue over Edition 2", at: "2026-10-01T09:00:00Z", by: { member: "dev", handle: "dev" }, ...o });
const docketWith = (mark, extra = {}) => ({ docket: ok({ case: C, project: P, entries: [
  { shelf: "record", entry: 2, kind: "court-order", summary: "Order of 20 November: seal exhibit 4", proposed: "public", state: "filed", filed_at: "2026-11-20T09:00:00Z", pressure: mark },
], wrote: false }), ...extra });
const DOCKET = `/app/docket/${P}/${C}`;
const DUE = (entries) => ({ holdsdue: ok({ ok: true, items: entries.map((e) => ({ arrived: { docket_entry: e, case: C }, note: "x", marked_at: "2026-10-01T09:00:00Z", project: P })), limit: 500, truncated: false, cursor: null }) });

test("R43 docket draws \"Pressure marked on this case\" after the record: a legal mark with no hold draws its date, who made it, the note, the no-hold sentence, the counsel sentence and the way to the hold", async () => {
  const p = await open(DOCKET, { plane: docketWith(MARK(), DUE([2])) });
  const sec = sectionOf(p, "screen.docket.pressure.heading");
  assert.ok(sec, "the section");
  const order = main(p).querySelectorAll("h2").map((h) => h.textContent);
  assert.ok(order.indexOf(word("screen.docket.entries")) < order.indexOf(word("screen.docket.pressure.heading")), "after the record");
  assert.ok(tipOf(sec.querySelector("h2")).includes(word("screen.docket.pressure.tip1")) && tipOf(sec.querySelector("h2")).includes(word("screen.docket.pressure.tip2")), "explained by both sentences");
  assert.ok(sec.textContent.includes(day("2026-10-01")));
  assert.ok(drewIn(sec, "screen.docket.pressure.mark", { member: "dev" }));
  assert.ok(sec.textContent.includes("A letter threatening to sue over Edition 2"), "the note, as written");
  assert.ok(drewIn(sec, "screen.hold.nohold"), "holdsdue lists it");
  assert.ok(drewIn(sec, "screen.docket.pressure.counsel"));
  const door = [...sec.querySelectorAll("a, .cs-card")].find((a) => a.textContent === word("screen.action.hold.link"));
  assert.ok(door, "a reference to hold");
  assert.equal(p.byOp("holdsdue").length, 1, "read once");
});

test("R43 a mark with a hold placed is not said to have none; a mark by someone who is no member draws no maker; another kind is named by its own word; no mark draws no heading and no read (controls)", async () => {
  const held = await open(DOCKET, { plane: docketWith(MARK(), DUE([])) });
  assert.ok(sectionOf(held, "screen.docket.pressure.heading") && !drew(held, "screen.hold.nohold"));
  const anon = await open(DOCKET, { plane: docketWith(MARK({ by: null }), DUE([2])) });
  const sa = sectionOf(anon, "screen.docket.pressure.heading");
  assert.ok(sa.textContent.includes("A letter threatening") && !/\bnull\b/.test(sa.textContent));
  const other = await open(DOCKET, { plane: docketWith(MARK({ kind: "retaliation" }), DUE([2])) });
  const so = sectionOf(other, "screen.docket.pressure.heading");
  assert.ok(drewIn(so, "screen.action.pressure.retaliation") && drewIn(so, "screen.action.pressuremark.by", { who: "dev" }) && !drewIn(so, "screen.docket.pressure.mark", { member: "dev" }));
  const unread = await open(DOCKET, { plane: docketWith(MARK(), { holdsdue: refusedIn("SOME_REFUSAL", "x") }) });
  assert.ok(sectionOf(unread, "screen.docket.pressure.heading") && !drew(unread, "screen.hold.nohold"), "a hold read that failed hides only its sentence");
  const none = await open(DOCKET, { plane: docketWith(null) });
  assert.equal(sectionOf(none, "screen.docket.pressure.heading"), null);
  assert.equal(none.byOp("holdsdue").length, 0, "no mark, no read");
  const plain = await open(DOCKET);
  assert.equal(sectionOf(plain, "screen.docket.pressure.heading"), null);
});

/* ---------- DEC-342: a failed read's words ---------- */

test("R10 (DEC-342) a read that failed is drawn by refusal.<CODE> when the list holds it, else the plane's translation, else refusal.uncatalogued with the code; never the builder's detail", async () => {
  const DETAIL = "A builder's detail, for developers.", SAID = "The plane's own words for it.", UNHELD = "NOT_A_CODE_THE_LIST_HOLDS";
  assert.ok(hasWord("refusal.NOT_PUBLISHED") && !hasWord("refusal." + UNHELD));
  const failed = async (code, translation) => {
    const p = await open(PATH, { plane: { publishtensions: refused(code, translation, 400, { detail: DETAIL }) } });
    return main(p).querySelector('[data-state="failed"]').textContent;
  };
  const held = await failed("NOT_PUBLISHED", SAID);
  assert.ok(held.includes(word("refusal.NOT_PUBLISHED")) && !held.includes(DETAIL), "the list's word first");
  const said = await failed(UNHELD, SAID);
  assert.ok(said.includes(SAID) && !said.includes(DETAIL), "else the plane's translation");
  const bare = await failed(UNHELD, null);
  assert.ok(bare.includes(word("refusal.uncatalogued")) && bare.includes(UNHELD) && !bare.includes(DETAIL), "else uncatalogued, with its code, never detail");
});
