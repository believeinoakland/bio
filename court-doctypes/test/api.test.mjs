/* court-doctypes: `courtlistener_api`, CourtListener's docket-entries answer read as the page's register
 * (R18–R20), over the ASSUMED fixture (the shape is assumed from CourtListener's published description and
 * checked on no real answer, M-R9) and the captured page of the same docket. */
import test from "node:test";
import assert from "node:assert/strict";
import { localize } from "../../bio-plane/src/setup-words/index.mjs";
import { EVENTS } from "../../docprofile/registry.mjs";
import { courtlistenerApi as API, courtlistenerDocket as CL, KEYS, COURT_TYPES, COURT_API_TYPES, registerCourtTypes, registerCourtApiTypes } from "../index.mjs";
import { fixture, viewFor, widenedFor, LOCATORS, API_LOCATORS, ctxFor, FIRST, TEST, wordRe, reOf, ANY } from "./helpers.mjs";

const RAW = fixture("courtlistener-api-4214664-ASSUMED.json");
const P4 = fixture("courtlistener-4214664-p4.html");
const VIEW = viewFor(FIRST);
const WIDE = widenedFor(FIRST);
const onePage = (html) => html.replace(/\(Page\s+4\s+of\s+4\)/, "(Page 1 of 1)").replace(/Page<\/span>\s*4 of 4/, "Page</span> 1 of 1");

const answer = (edit) => { const j = JSON.parse(RAW); if (edit) edit(j); return JSON.stringify(j); };
const api = (text = RAW, view = VIEW) => API.parse(ctxFor(text, { view, locator: API_LOCATORS[FIRST] }));
const page = (html = onePage(P4)) => CL.parse(ctxFor(html, { view: VIEW, locator: LOCATORS[FIRST].courtlistener(1) }));
const types = (r) => r.events.map((e) => e.type);
const entry = (j, n) => j.results.find((e) => e.entry_number === n);

test("R18: the fixture is marked as assumed, and the three other types read as before", () => {
  assert.match(JSON.parse(RAW)._fixture, /^ASSUMED, not captured/);
  assert.deepEqual(KEYS, ["courtlistener_docket", "cpuc_proceeding", "ecourt_roa"]);
  assert.deepEqual(COURT_TYPES.map((t) => t.key), KEYS);
  const got = [];
  const out = registerCourtApiTypes((t) => { got.push(t); return t.key; });
  assert.deepEqual(out.map((o) => [o.key, o.registered, o.result]), [["courtlistener_api", true, "courtlistener_api"]]);
  assert.deepEqual(got, [...COURT_API_TYPES]);
  assert.equal(got[0].contract, "membership");
  assert.equal(got[0].version, 1);
  for (const f of ["detect", "parse", "assess"]) assert.equal(typeof got[0][f], "function");
  assert.deepEqual(registerCourtApiTypes(() => { throw new Error("refused"); }).map((o) => o.registered), [false]);
  assert.equal(registerCourtApiTypes(null).every((o) => !o.registered && o.why), true);
  /* the three are registered by their own function, the fourth not among them */
  const three = [];
  registerCourtTypes((t) => three.push(t.key));
  assert.deepEqual(three, KEYS);
});

test("R18: detect matches at CERTAIN only the API's address as the view names it, and the entries' own structure", () => {
  for (const id of [FIRST, TEST]) {
    const d = API.detect(ctxFor(RAW, { view: widenedFor(id), locator: API_LOCATORS[id] }));
    assert.equal(d.match, true, id);
    assert.equal(d.confidence, "certain", `${id}: ${d.why}`);
  }
  /* the profiles as they stand do not name the API's address: matched, not certain, and says why */
  const d = API.detect(ctxFor(RAW, { view: VIEW, locator: API_LOCATORS[FIRST] }));
  assert.equal(d.match, true);
  assert.equal(d.confidence, "likely");
  assert.match(d.why, wordRe("court-doctypes.common.what_s_structure_is_present"));
  /* no new system: the address is the existing courtlistener_docket's */
  assert.equal(VIEW.systems.filter((s) => /^(courtlistener|cpuc|ecourt)/.test(s.origin)).length, 3);
  assert.equal(WIDE.systems.filter((s) => /^(courtlistener|cpuc|ecourt)/.test(s.origin)).length, 3);
  /* the page's own address is no API address */
  const page = API.detect(ctxFor(RAW, { view: WIDE, locator: LOCATORS[FIRST].courtlistener(1) }));
  assert.equal(page.confidence, "certain", "the docket page's address is the same system's");
  /* a capture with no address */
  assert.equal(API.detect(ctxFor(RAW, { view: WIDE })).confidence, "likely");
});

test("R18 R17: an error body, a login failure, HTML or another JSON is not matched, with which kind of no", () => {
  const ctx = (text) => ctxFor(text, { view: WIDE, locator: API_LOCATORS[FIRST] });
  const label = localize("court-doctypes.courtlistener_api.label", "a CourtListener docket-entries answer");
  const notJson = reOf(localize("court-doctypes.courtlistener_api.not_json", "this answer is not a JSON object, so it is not {what}", { what: label }));
  const refusal = (detail) => reOf(localize("court-doctypes.courtlistener_api.refusal", "this answer is a refusal by the service (\"{detail}\"), not {what}", { detail, what: label }));
  const lacks = reOf(localize("court-doctypes.courtlistener_api.lacks", "this answer lacks {what}'s own structure (results that are entries with an entry number and a filing date, and a next that is a string or null)", { what: label }));
  const cases = [
    [JSON.stringify({ detail: "Invalid token." }), refusal("Invalid token.")],
    [JSON.stringify({ detail: "Authentication credentials were not provided." }), refusal(ANY)],
    [JSON.stringify({ error: "rate limited" }), refusal("rate limited")],
    [fixture("courtlistener-sign-in.html"), notJson],
    [P4, notJson],
    ["", notJson],
    ["[1,2]", notJson],
    [JSON.stringify({ count: 0, next: null, previous: null, results: [] }), reOf(localize("court-doctypes.courtlistener_api.no_entries", "this answer holds no entries, so there is no register to read in it"))],
    [JSON.stringify({ results: [{ id: 1 }], next: null }), lacks],
    [answer((j) => { j.next = 5; }), lacks],
    [answer((j) => { delete j.results[0].date_filed; }), lacks],
    [answer((j) => { delete j.results[3].entry_number; }), lacks],
  ];
  for (const [text, re] of cases) {
    const d = API.detect(ctx(text));
    assert.equal(d.match, false, text.slice(0, 40));
    assert.equal(d.confidence, "none");
    assert.match(d.why, re, text.slice(0, 40));
    /* and a reading of it is a failed read with the same why, no rows */
    const r = API.parse(ctx(text));
    assert.deepEqual(r.rows, []);
    assert.match(r.failed, re);
  }
  /* the docket page is not matched by the API type, nor the answer by the page's */
  assert.equal(CL.detect(ctx(RAW)).match, false);
});

test("R18 R6: the rows are the page's rows, keyed as it keys them, entry_id the entry number", () => {
  const j = api(), h = page();
  assert.equal(j.rows.length, 27);
  assert.equal(j.rows.length, h.rows.length);
  assert.deepEqual(j.rows.filter((x) => x.entry_id).map((x) => [x.key, x.entry_id]), h.rows.filter((x) => x.entry_id).map((x) => [x.key, x.entry_id]));
  assert.deepEqual(j.rows.map((x) => x.entry_id), h.rows.map((x) => x.entry_id), "the same rows in the same order");
  for (const x of j.rows.filter((x) => x.entry_id)) assert.equal(x.key, `entry:${x.entry_id}`);
  const minute = j.rows.filter((x) => !x.entry_id);
  assert.equal(minute.length, 8);
  for (const x of minute) assert.ok(x.key.startsWith(`minute:${x.date}|`), x.key);
  assert.equal(new Set(j.rows.map((x) => x.key)).size, j.rows.length);
  assert.deepEqual(Object.keys(j.rows[0]).sort(), Object.keys(h.rows[0]).sort(), "the page's row shape");
  assert.equal(j.rows.find((x) => x.entry_id === "160").date, "2023-10-03", "a date as the answer writes it");
  assert.equal(j.rows.find((x) => x.entry_id === "160").text, h.rows.find((x) => x.entry_id === "160").text.replace(/\s*\(Entered: [^)]*\)\s*$/, ""));
  /* twins on one reading are told apart by order */
  const twin = api(answer((x) => { x.results.splice(1, 0, structuredClone(x.results[0])); x.count = 28; }));
  assert.equal(twin.rows[1].key, `${twin.rows[0].key}#2`);
});

test("R18 R3 R8: the proceeding's fields the answer does not state are null, with why; the page is a cursor's", () => {
  const r = api();
  assert.equal(r.type, "courtlistener_api");
  for (const f of ["number", "number_as_written", "caption", "forum_as_written", "kind_as_written", "status_as_written", "filed", "docket_number_core"])
    assert.equal(r.proceeding[f], null, f);
  for (const f of ["number", "caption", "forum_as_written", "kind_as_written", "status_as_written", "filed", "docket_number_core"])
    assert.equal(r.proceeding.why[f], localize("court-doctypes.courtlistener_api.states_no", "the answer does not state it"), f);
  assert.deepEqual(r.parties, []);
  assert.deepEqual(r.page, { n: null, of: null, may_continue: false });
  assert.equal(r.complete, true);
  assert.equal(r.complete_why, null);
  /* a next string: the register goes on */
  const more = api(answer((j) => { j.next = "https://www.courtlistener.com/api/rest/v4/docket-entries/?cursor=abc"; }));
  assert.deepEqual(more.page, { n: null, of: null, may_continue: true });
  assert.equal(more.complete, false);
  assert.equal(more.complete_why, localize("court-doctypes.courtlistener_api.more", "this answer has a next cursor, so it holds only some of the register's entries"));
  /* an earlier page, or fewer entries than the answer counts, is not the whole register either */
  const later = api(answer((j) => { j.previous = "https://www.courtlistener.com/api/rest/v4/docket-entries/?cursor=xyz"; }));
  assert.equal(later.complete, false);
  assert.equal(later.complete_why, localize("court-doctypes.courtlistener_api.earlier", "this answer has an earlier page, so it holds only some of the register's entries"));
  const short = api(answer((j) => { j.count = 100; }));
  assert.equal(short.complete, false);
  assert.equal(short.complete_why, localize("court-doctypes.courtlistener_api.count", "this answer states {count} entries and holds {length}, so it holds only some of them", { count: 100, length: 27 }));
});

test("R18 R7 R9: every reading is provisional and says why; a sealing is what the answer states", () => {
  const r = api();
  assert.equal(r.provisional, true);
  assert.equal(r.key_basis, localize("court-doctypes.courtlistener_api.key_basis", "courtlistener_api (PROVISIONAL): a numbered entry is keyed by the entry number the answer gives it (entry_id); an unnumbered (minute) entry by its date and its text as written (or, with no text, its documents' descriptions), and twins on one reading by their order among themselves; the JSON shape is assumed from CourtListener's published description and has not been checked on a real answer, until a fixture captured from a member's authenticated call replaces the assumed one"));
  assert.equal(CL.parse(ctxFor(P4, { view: VIEW })).provisional, false, "the page's reading is not");
  assert.deepEqual(r.rows.map((x) => x.sealing).filter(Boolean), []);
  const sealed = api(answer((j) => { entry(j, 170).recap_documents[0].is_sealed = true; }));
  assert.equal(sealed.rows.find((x) => x.entry_id === "170").sealing, "sealed");
  const worded = api(answer((j) => { entry(j, 171).description = "Exhibit unsealed by order of the court."; }));
  assert.equal(worded.rows.find((x) => x.entry_id === "171").sealing, "unsealed");
  for (const x of r.rows) assert.ok(["sealed", "unsealed", null].includes(x.sealing));
  /* the filer, where the answer states one */
  assert.equal(r.rows.every((x) => x.filer === null), true);
  assert.equal(api(answer((j) => { entry(j, 170).filer = "Plaintiffs"; })).rows.find((x) => x.entry_id === "170").filer, "Plaintiffs");
});

test("R19: one JSON reading and one HTML reading of one docket together: the same docket gives no change", () => {
  const before = page(), after = api();
  for (const [a, b] of [[before, after], [after, before]]) {
    const r = API.assess(a, b);
    assert.deepEqual(r.events, []);
    assert.equal(r.meaningful, false);
    assert.equal(r.why, localize("court-doctypes.common.all_length_rows_of_this", "all {length} rows of this register are unchanged", { length: 27 }));
    assert.deepEqual(r.confirmed, { rows: 27, intact: 27 });
    assert.deepEqual(CL.assess(a, b), r, "either type's assess gives the same answer");
  }
  /* the text and the links are the forms' own, so neither is compared across them */
  const reworded = api(answer((j) => { entry(j, 170).description = "A different way of saying it."; entry(j, 171).recap_documents = []; }));
  assert.deepEqual(API.assess(before, reworded).events, []);
  /* a header the answer does not state is not read as a change: no status, caption or party event */
  const terminated = page(onePage(P4).replace(/(<p class="bottom">\s*<span class="meta-data-header">Date Filed:)/,
    '<p class="bottom"><span class="meta-data-header">Date Terminated:</span><span class="meta-data-value">May 1, 2026</span></p>$1'));
  assert.deepEqual(API.assess(terminated, after).events, []);
  /* the date as the page writes it and as the answer writes it is one date */
  assert.equal(before.rows.find((x) => x.entry_id === "160").date, "Oct 3, 2023");
});

test("R19: a row in one form and not the other is item_added or delisted as R10 gives, never a markup difference", () => {
  const before = page();
  const added = api(answer((j) => {
    j.results.push({ id: 8000100, entry_number: 179, date_filed: "2026-07-01", description: "A new filing.", recap_documents: [] });
    j.count = 28;
  }));
  let r = API.assess(before, added);
  assert.deepEqual(types(r), ["item_added"]);
  assert.equal(r.events[0].key, "entry:179");
  assert.equal(r.events[0].significance, EVENTS.item_added.significance);
  assert.equal(r.meaningful, false);
  /* the other way round: the page holds a row the answer lacks */
  const gone = api(answer((j) => { j.results = j.results.filter((e) => e.entry_number !== 170); j.count = 26; }));
  r = API.assess(before, gone);
  assert.deepEqual(types(r), ["delisted"]);
  assert.equal(r.events[0].key, "entry:170");
  assert.match(r.events[0].why, wordRe("court-doctypes.common.row_gone_both_complete"));
  /* an unnumbered row is the same row in both forms, and gone when the answer lacks it */
  const noMinute = api(answer((j) => { j.results = j.results.filter((e) => e.entry_number !== null || e.date_filed !== "2023-10-11"); j.count = j.results.length; }));
  r = API.assess(before, noMinute);
  assert.deepEqual(types(r), ["delisted", "delisted", "delisted"]);
  assert.ok(r.events.every((e) => e.key.startsWith("minute:Oct 11, 2023|") || e.key.startsWith("minute:2023-10-11|")), r.events.map((e) => e.key).join());
  /* an incomplete reading cannot say a row was removed */
  const cursor = api(answer((j) => { j.results = j.results.filter((e) => e.entry_number !== 170); j.next = "https://www.courtlistener.com/api/rest/v4/docket-entries/?cursor=abc"; }));
  r = API.assess(before, cursor);
  assert.deepEqual(types(r), ["possibly_delisted"]);
  /* fields both state are compared: the date and the sealing, named by row and field */
  const moved = api(answer((j) => { entry(j, 172).date_filed = "2030-01-01"; entry(j, 173).recap_documents.push({ id: 1, document_number: 173, description: "Under seal", is_sealed: true }); }));
  r = API.assess(before, moved);
  assert.deepEqual(r.events.map((e) => [e.type, e.key, e.field]).sort(), [["outcome_changed", "entry:172", "date"], ["outcome_changed", "entry:173", "sealing"]]);
  assert.equal(r.events.find((e) => e.field === "date").now, "2030-01-01");
  assert.equal(r.meaningful, true);
});

test("R19 R10: two JSON readings are compared in full: a filer, a text or a link changed gives outcome_changed (control)", () => {
  const withFiler = (name) => api(answer((j) => { entry(j, 170).filer = name; }));
  let r = API.assess(withFiler("Plaintiffs"), withFiler("Defendants"));
  assert.deepEqual(r.events.map((e) => [e.type, e.key, e.field, e.was, e.now]), [["outcome_changed", "entry:170", "filer", "Plaintiffs", "Defendants"]]);
  assert.equal(r.meaningful, true);
  r = API.assess(api(), api(answer((j) => { entry(j, 171).description += " (corrected)"; })));
  assert.deepEqual(r.events.map((e) => [e.type, e.field]), [["outcome_changed", "text"]]);
  r = API.assess(api(), api(answer((j) => { entry(j, 172).recap_documents.push({ id: 2, document_number: 172, attachment_number: 1, description: "Attachment", absolute_url: "/docket/4214664/172/1/" }); })));
  assert.deepEqual(r.events.map((e) => [e.type, e.field]).sort(), [["outcome_changed", "documents"], ["outcome_changed", "links"]]);
  assert.deepEqual(API.assess(api(), api()).events, []);
  /* a failed or empty reading is a failed read, never a register emptied (R12) */
  r = API.assess(api(), api(JSON.stringify({ detail: "Invalid token." })));
  assert.equal(r.meaningful, null);
  assert.deepEqual(r.events, []);
  assert.match(r.why, wordRe("court-doctypes.common.a_reading_failed_v1"));
});

test("R20 R13 R14: pure over its inputs: no clock, no network, nothing changed, nothing followed or inferred", () => {
  const realNow = Date.now, realFetch = globalThis.fetch;
  Date.now = () => { throw new Error("the clock was read"); };
  globalThis.fetch = () => { throw new Error("the network was used"); };
  const before = page(), c = ctxFor(RAW, { view: WIDE, locator: API_LOCATORS[FIRST] });
  const snapshot = JSON.stringify(before);
  let r, d, a;
  try {
    r = API.parse(c); d = API.detect(c); a = API.assess(before, r);
    assert.deepEqual(API.parse({ ...c }), r);
    assert.deepEqual(API.detect({ ...c }), d);
    assert.deepEqual(API.assess(before, r), a);
  } finally { Date.now = realNow; globalThis.fetch = realFetch; }
  assert.equal(JSON.stringify(before), snapshot, "the reading is not changed");
  assert.equal(c.text, RAW);
  /* the page's `at` is carried as given, never composed */
  assert.equal(API.parse(ctxFor(RAW, { view: VIEW, at: "2026-10-27T10:00:00Z" })).at, "2026-10-27T10:00:00Z");
  assert.equal(r.at, null);
  /* nothing is inferred: a value the answer does not state is null, a link is listed and none is a fee */
  for (const x of r.rows) {
    assert.ok(x.date === null || typeof x.date === "string");
    assert.equal(x.kind_as_written, null);
    for (const l of x.links) assert.equal(l.fee, false);
  }
  assert.deepEqual(Object.keys(a).sort(), ["confirmed", "events", "meaningful", "significance", "why"]);
  for (const e of API.assess(page(), api(answer((j) => { entry(j, 170).recap_documents[0].is_sealed = true; }))).events) {
    assert.ok(Object.hasOwn(EVENTS, e.type), e.type);
    assert.equal(e.significance, EVENTS[e.type].significance);
  }
});
