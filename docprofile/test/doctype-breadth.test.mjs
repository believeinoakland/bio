/* docprofile — FW-18's content types over REAL documents (K619 convert): the old suite
 * `civicos-ui/test/doctype-breadth.test.mjs` converted to requirement-named tests at the
 * module's interface, `docprofile/registry.mjs`, the entry the plane imports.
 *
 * The fixture is the old suite's `fw18-doctypes.json`, already copied whole into ./fixtures/
 * by N390 (T17): five REAL documents (two sets of minutes, an agenda, a proposed ordinance,
 * a staff report), each the plane's own Tier-1 text field for the bytes named by its sha256,
 * trimmed only in size. They are read under `HELD`, the held non-test profiles' view, passed
 * explicitly (the old suite passed none and read under the K39 fallback, which gives the
 * same view).
 *
 * Not carried, both source text (P7): the old section 8's reading of the registry's own
 * header for the word "withheld", and section 10's reading of `civicos-ui/app.html`'s
 * flattened copy (legacy-ui's, K633). Which old assertion each test carries is in the job
 * record, `build/jobs/T19/docprofile.md`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as dp from "../registry.mjs";
import { HELD } from "./fixtures.mjs";

const { readText, doctypeFor, doctypes, CONFIDENCE, CONTRACT, EVENTS } = dp;

const FX = JSON.parse(fs.readFileSync(new URL("./fixtures/fw18-doctypes.json", import.meta.url), "utf8"));
const doc = (k) => FX.documents[k];
const KEYS = ["minutes", "minutes_council", "agenda", "regulation", "staff_report"];
const WANT = { minutes: "meeting_minutes", minutes_council: "meeting_minutes", agenda: "meeting_agenda",
               regulation: "regulation", staff_report: "staff_report" };
/* One reading per document, as the plane makes it: the producer's text field, the instance's view. */
const R = Object.fromEntries(KEYS.map((k) => [k, readText(doc(k).text, { view: HELD })]));
const typeOf = (key) => doctypes().find((t) => t.key === key);
/* How many lines of a text are exactly a masthead of this kind: the test's own count, so a
   trap's input is shown armed without reaching into the module. */
const mastheadLines = (t, word) => t.split(/\r?\n/)
  .filter((l) => new RegExp(`^(?:Meeting\\s+)?${word}(?:\\s*[-–—]\\s*\\S.*)?$`, "i").test(l.trim())).length;

test("R4 R19 the real corpus is present and whole: five documents, each fetched, hashed and read", () => {
  assert.ok(Object.keys(FX.documents).length >= 5, "floored at five documents");
  for (const k of KEYS) {
    const d = doc(k);
    assert.ok(d, `${k}: present`);
    assert.match(d.source, /^https:\/\//, `${k}: names the address it was fetched from`);
    assert.match(d.sha256, /^[0-9a-f]{64}$/, `${k}: carries the sha256 of the bytes read`);
    assert.ok(d.whole_pages > 0, `${k}: the whole document's page count is recorded`);
    assert.ok(d.text.document.length > 1500, `${k}: the trimmed text is substantial`);
    assert.ok(d.text.pages.length > 0 && d.text.pages.every((p) => Number.isInteger(p.page)),
      `${k}: the pages keep the producer's own page indices`);
    assert.equal(R[k].determined, true, `${k}: a reading is produced`);
    assert.equal(R[k].parse_error, null, `${k}: the reader ran without throwing`);
  }
});

test("R4 each real document reads as its own class, CERTAIN where the type was written from it, and as no other class", () => {
  for (const k of KEYS) {
    assert.equal(R[k].doctype.type.key, WANT[k], k);
    for (const other of KEYS)
      if (WANT[other] !== WANT[k]) assert.notEqual(R[k].doctype.type.key, WANT[other], `${k} is not ${WANT[other]}`);
    assert.ok(R[k].doctype.signals.length >= 2, `${k}: names at least two signals that earned it`);
  }
  for (const k of ["minutes", "minutes_council", "regulation", "staff_report"])
    assert.equal(R[k].doctype.confidence, CONFIDENCE.CERTAIN, `${k}: certain on the document it was written from`);
});

test("R4 R5 a reference is never read as membership: the minutes that name agendas and cite instruments are neither", () => {
  // the trap's input is armed: the minutes carry the word, and line-anchored agenda lines, below the masthead rate
  const t = doc("minutes").text.document;
  assert.match(t, /\bAgenda\b/i, "the Rules Committee minutes say Agenda");
  assert.ok(mastheadLines(t, "Minutes") >= 3, "and name themselves as minutes at the furniture rate");
  assert.ok(mastheadLines(t, "Agenda") < 3, "but name themselves as an agenda below it");
  assert.ok(mastheadLines(doc("agenda").text.document, "Agenda") >= 3, "while the agenda does reach it");
  // the rate fence governs the `also` pass, which the registration order cannot
  assert.ok(R.minutes.doctype.also.every((x) => x.key !== "meeting_agenda" || x.confidence === CONFIDENCE.LIKELY),
    "the agenda is at most LIKELY on the minutes, never certain");
  assert.ok(!R.minutes_council.doctype.also.some((x) => x.key === "meeting_agenda"),
    "the Council minutes, with no agenda masthead line, are not an agenda in any degree");
  // the regulation side: the Council minutes cite captions and enact nothing
  assert.match(doc("minutes_council").text.document.replace(/\s+/g, " "), /\b(ORDINANCE|RESOLUTION)\s+NO\.?\s*\d{3,6}/i,
    "the Council minutes cite an instrument caption");
  assert.notEqual(R.minutes_council.doctype.type.key, "regulation");
  assert.ok(!R.minutes_council.doctype.also.some((x) => x.key === "regulation"), "not even an also");
});

test("R20 R34 every reference on the real documents says where it was read: a page the document emitted, no rectangle", () => {
  for (const k of KEYS) {
    const ents = R[k].parsed.entities;
    assert.ok(ents.length >= 1, `${k}: the reader found a reference`);
    assert.ok(R[k].position_parts > 0, `${k}: the container itemised its text`);
    const pages = new Set(doc(k).text.pages.map((p) => p.page));
    for (const e of ents) {
      assert.ok(e.source, `${k}: ${e.key} carries where it was read`);
      assert.equal(e.source.kind, "pdf-page");
      assert.match(e.source.ref, /^p\.\d+$/);
      assert.equal(e.source.rect, null, "Tier-1 text carries no geometry");
      assert.ok(pages.has(e.source.page), `${k}: ${e.key} is on a page this document emitted`);
      assert.ok(e.key && !/^\d{1,2}$/.test(e.key), `${k}: ${e.key} is source-assigned, not a list index`);
    }
  }
});

test("R5 a real document of two kinds says so, in its profile and in its reading, and also never names itself or the fallback", () => {
  assert.ok(R.minutes.doctype.also.some((x) => x.key === "meeting_agenda"), "the Rules Committee minutes are also an agenda");
  assert.ok(R.minutes.parsed.also_satisfies.includes("meeting_agenda"), "and the reading says so");
  assert.ok(R.staff_report.doctype.also.some((x) => x.key === "regulation"), "the errata report carries a resolution");
  assert.ok(R.staff_report.parsed.also_satisfies.includes("regulation"), "and the reading says so");
  for (const k of KEYS) {
    const also = R[k].doctype.also.map((x) => x.key);
    assert.ok(!also.includes(R[k].doctype.type.key), `${k}: its own type is not in also`);
    assert.ok(!also.includes("generic"), `${k}: the fallback is never in also`);
    for (const t of doctypes()) {
      if (t.key === R[k].doctype.type.key || t.fallback) continue;
      assert.equal(also.includes(t.key), !!t.detect({ text: doc(k).text.document, view: HELD }).match, `${k}: ${t.key}`);
    }
  }
  // `considered` stops at the first CERTAIN, which is why `also` exists
  assert.ok(R.minutes.doctype.considered.length <= R.minutes.doctype.also.length + 1);
});

test("R19 the agenda and the minutes of one meeting close the progression: same body, same date, shared file numbers, outcomes only in the minutes", () => {
  const m = R.minutes.parsed, a = R.agenda.parsed;
  assert.equal(m.body, a.body, "the same body");
  assert.equal(m.date, a.date, "on the same date");
  const aKeys = new Set(a.entities.map((e) => e.key));
  assert.ok(m.entities.filter((e) => aKeys.has(e.key)).length >= 3, "sharing file numbers read from both");
  assert.ok(m.entities.filter((e) => e.facts.outcome).length >= 3, "the minutes record outcomes");
  assert.ok(a.entities.every((e) => e.facts.outcome === undefined), "the agenda records none");
  assert.ok(m.entities.some((e) => e.facts.vote && typeof e.facts.vote.aye === "number"), "a vote is the clerk's own tally");
});

test("R19 R35 each reader's document facts on the real documents, and the nulls it states with their reasons", () => {
  const m = R.minutes.parsed;
  assert.equal(m.status, "DRAFT", "the minutes are a draft, a fact about what a member cites");
  assert.ok(m.convened && m.adjourned, "when the meeting convened and adjourned");
  assert.equal(typeof m.attendance.present, "string", "attendance is a fact, not entities");
  assert.ok(m.entities.every((e) => e.kind !== "person"), "no person's name is an entity key");
  assert.equal(m.body, "Rules & Legislation Committee");
  assert.equal(m.body_why, null);
  assert.equal(R.minutes_council.parsed.body, null, "a body set across three lines is not guessed from one");
  assert.match(R.minutes_council.parsed.body_why, /no single line/);
  const r = R.regulation.parsed;
  assert.equal(r.number, null, "the proposed ordinance carries no number");
  assert.match(r.number_why, /proposed ordinance or resolution/);
  assert.ok(r.entities.some((e) => e.kind === "instrument"), "it cites other instruments");
  assert.ok(!r.entities.some((e) => e.facts.number === r.number), "none claimed as its own");
  assert.match(r.title, /^ORDINANCE AMENDING OAKLAND MUNICIPAL CODE/, "its own title from its own caption");
  const s = R.staff_report.parsed;
  assert.equal(s.to, "Edard D. Reiskin", "one field, not the whole memorandum header");
  assert.match(s.recommendation, /^Staff Recommends That The City Council/);
  assert.ok(s.sections >= 3);
});

test("R29 R14 seven types registered in a deciding order, each declaring a contract and a version; past acts graded EVENT", () => {
  const keys = doctypes().map((t) => t.key);
  assert.deepEqual([...keys].sort(), ["generic", "meeting_agenda", "meeting_calendar", "meeting_minutes", "regulation",
                                      "staff_directory", "staff_report"]);
  assert.ok(keys.indexOf("meeting_minutes") < keys.indexOf("meeting_agenda"), "minutes decide a certain/certain tie");
  for (const t of doctypes()) {
    assert.ok(Object.values(CONTRACT).includes(t.contract), t.key);
    assert.ok(Number.isInteger(t.version), t.key);
  }
  assert.equal(typeOf("meeting_minutes").contract, CONTRACT.MEMBERSHIP);
  assert.equal(typeOf("staff_report").contract, CONTRACT.SUBSTANCE);
  assert.equal(typeOf("regulation").contract, CONTRACT.SUBSTANCE);
  for (const e of ["outcome_changed", "recommendation_changed", "instrument_changed"])
    assert.equal(EVENTS[e].significance, "event", e);
});

test("R14 R33 assess on the real readings: an outcome, a recommendation and an instrument moving are events, wording a notice, nothing read claims nothing", () => {
  const read = (k) => { const t = doctypeFor({ text: doc(k).text.document, view: HELD }).type;
                        return [t, t.parse({ text: doc(k).text.document, view: HELD })]; };
  const [mins, a] = read("minutes");
  const b = structuredClone(a); b.entities[0].facts.outcome = "Rejected";
  const o = mins.assess(a, b);
  assert.equal(o.meaningful, true);
  assert.ok(o.events.some((e) => e.type === "outcome_changed" && e.significance === "event"));
  const c = structuredClone(a); c.entities[0].facts.subject = "something else entirely";
  const w = mins.assess(a, c);
  assert.ok(w.events.some((e) => e.type === "item_changed"));
  assert.equal(w.meaningful, false, "the wording moving is graded apart from the outcome");
  const empty = mins.assess({ entities: [] }, a);
  assert.equal(empty.meaningful, null);
  assert.match(empty.why, /could not be read/);
  const [rep, ra] = read("staff_report");
  const rr = rep.assess(ra, { ...ra, recommendation: "Staff Recommends That The City Council Reject It." });
  assert.equal(rr.meaningful, true);
  assert.ok(rr.events.some((e) => e.type === "recommendation_changed"));
  const [reg, ga] = read("regulation");
  const gr = reg.assess(ga, { ...ga, title: "ORDINANCE DOING SOMETHING ELSE." });
  assert.equal(gr.meaningful, true);
  assert.ok(gr.events.some((e) => e.type === "instrument_changed"));
  assert.deepEqual(reg.assess(ga, structuredClone(ga)).events, [], "an unchanged instrument reports nothing");
});
