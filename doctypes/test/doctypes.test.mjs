/* doctypes — requirement-named tests for the seven types (R1–R8, R18, R20–R24), at the
 * module's interface: `doctypes/index.mjs`. The types are read the way docprofile reads
 * them, through a registry `registerDoctypes` filled (./read.mjs), and every type is read
 * under made-up profiles that are not the first profile (R20): Port Alder and Lakemont in
 * ./fixtures.mjs. The regulation reader's sections, definitions and exceptions (R9–R19) are
 * in ./regulation-sections.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as dt from "../index.mjs";
import { makeRegistry, CONFIDENCE, EVENTS, worstSignificance } from "../../site-profiles/index.mjs";
import { CONTRACT } from "../../docprofile/doctypes/index.mjs";
import { flattenText, makeLocator } from "../../docprofile/readtext.mjs";
import { combine, list } from "../../jurisdictions/index.mjs";
import {
  PORT_ALDER, LAKEMONT, view, EMPTY, HELD, PA_AGENDA, PA_MINUTES, PA_REPORT, PA_BYLAW, PA_DIRECTORY, calendarHtml,
} from "./fixtures.mjs";
import { CASES, pairsOf } from "./golden-cases.mjs";
import { registryOf, readWith, typeFor } from "./read.mjs";

const { DOCTYPES, registerDoctypes } = dt;
const PA = view(PORT_ALDER);
const LK = view(LAKEMONT);
const REG = (() => { const r = makeRegistry(); registerDoctypes(r.register); return r; })();
const typeOf = (key) => DOCTYPES.find((t) => t.key === key);
const keys = (r) => r.entities.map((e) => e.key);
const NOW = "2026-03-20T12:00:00Z";
const ORDER = ["meeting_calendar", "meeting_minutes", "meeting_agenda", "staff_report", "regulation", "staff_directory", "generic"];

/* ------------------------------------------------------------------ R1, R2 */

test("R1 DOCTYPES lists the seven types in registration order, generic alone the fallback", () => {
  assert.deepEqual(DOCTYPES.map((t) => t.key), ORDER);
  assert.deepEqual(DOCTYPES.filter((t) => t.fallback === true).map((t) => t.key), ["generic"]);
  for (const t of DOCTYPES) if (t.key !== "generic") assert.notEqual(t.fallback, true, t.key);
  assert.ok(Object.isFrozen(DOCTYPES), "the order is not a list a caller edits");
  // the order decides: minutes and an agenda both certain, the minutes (earlier) win
  const both = PA_MINUTES + "\n" + PA_AGENDA;
  assert.equal(typeFor(REG, { text: both, view: PA }).type.key, "meeting_minutes");
  for (const t of DOCTYPES) for (const f of ["key", "label", "version", "contract", "detect", "parse", "assess"])
    assert.ok(t[f] !== undefined, `${t.key}.${f}`);
});

test("R2 registerDoctypes calls register once per type in R1's order, and registers nothing the second time", () => {
  const seen = [];
  const reg = (m) => { seen.push(m.key); };
  const first = registerDoctypes(reg);
  assert.deepEqual(seen, ORDER);
  assert.equal(first.registered, 7);
  const again = registerDoctypes(reg);
  assert.equal(again.registered, 0);
  assert.match(again.why, /already/);
  assert.deepEqual(seen, ORDER, "nothing more registered");
  // a real registry, by its register function and then whole: still seven, once each
  const r = makeRegistry();
  registerDoctypes(r.register);
  registerDoctypes(r);
  registerDoctypes(r.register);
  assert.deepEqual(r.all().map((m) => m.key), ORDER);
  // the registry whole first, then its function
  const r2 = makeRegistry();
  registerDoctypes(r2);
  registerDoctypes(r2.register);
  assert.deepEqual(r2.all().map((m) => m.key), ORDER);
  // a registry already holding some keeps them and gains the rest, still never twice
  const r3 = makeRegistry();
  r3.register(DOCTYPES[0]);
  assert.equal(registerDoctypes(r3).registered, 6);
  assert.deepEqual(r3.all().map((m) => m.key), ORDER);
  assert.throws(() => registerDoctypes(null), TypeError);
  // what docprofile's registry needs: the fallback answers when nothing is recognised
  assert.equal(REG.recognise({ text: "a letter about nothing", view: PA }).member.key, "generic");
});

/* ---------------------------------------------------------------------- R3 */

test("R3 every type takes its local facts from ctx.view, and with no view from every non-test held profile", () => {
  const lkAgenda = PA_AGENDA.replace(/PA-(\d{3})/g, "LK00$1").replace(/Harbor Commission/g, "Lakemont Council")
    .replace(/Town of Port Alder/g, "City of Lakemont");
  const ag = (t, v) => typeOf("meeting_agenda").parse({ text: t, view: v });
  assert.deepEqual(keys(ag(PA_AGENDA, PA)), ["PA-101", "PA-102", "PA-103"]);
  assert.deepEqual(keys(ag(PA_AGENDA, LK)), []);
  assert.deepEqual(keys(ag(lkAgenda, LK)), ["LK00101", "LK00102", "LK00103"]);
  assert.equal(ag(PA_AGENDA, PA).body, "Harbor Commission");
  assert.equal(ag(PA_AGENDA, LK).body, null);

  const mins = (v) => typeOf("meeting_minutes").parse({ text: PA_MINUTES, view: v });
  assert.deepEqual(keys(mins(PA)), ["PA-101", "PA-103"]);
  assert.deepEqual(keys(mins(LK)), []);
  assert.equal(mins(LK).body, null);

  const rep = (t, v) => typeOf("staff_report").parse({ text: t, view: v });
  assert.deepEqual(keys(rep(PA_REPORT, PA)).sort(), ["bylaw:2041", "file:PA-117", "order:1990", "pac:4.12"]);
  assert.deepEqual(keys(rep(PA_REPORT, LK)), []);
  assert.equal(typeOf("staff_report").detect({ text: PA_REPORT, view: LK }).match, false);

  const reg = (v) => typeOf("regulation").parse({ text: PA_BYLAW, view: v });
  assert.equal(reg(PA).instrument, "bylaw");
  assert.deepEqual(keys(reg(PA)).sort(), ["order:1990", "pac:4.12"]);
  assert.equal(reg(LK).title, null);
  // the code's section forms too: Port Alder's code read under its own view only
  const pa = PA;
  const code = "4-12 Mooring fees.\n(a)\nFees are set by order.";
  assert.equal(typeOf("regulation").parse({ text: code, view: pa }).form, "code");
  assert.equal(typeOf("regulation").parse({ text: code, view: LK }).form, null);

  // the calendar's practice threshold, the view's
  const cal = typeOf("meeting_calendar");
  const parsed = cal.parse({ text: calendarHtml([["7", "Harbor Commission", "3/2/2026"]]) });
  const due = (v) => cal.connections(parsed, parsed, { now: NOW, view: v }).find((c) => c.relation === "minutes_not_yet_published").expected_by;
  assert.equal(due(PA), "2026-03-12");
  assert.equal(due(LK), "2026-04-01");
  assert.equal(due(EMPTY), null);

  // the directory holds no local vocabulary at all
  const d = (v) => keys(typeOf("staff_directory").parse({ text: PA_DIRECTORY, view: v }));
  assert.deepEqual(d(PA), d(LK));
  assert.deepEqual(d(PA), d(EMPTY));

  // no view: every NON-TEST held profile, combined; never a test profile
  const held = combine(list().filter((x) => !x.test).map((x) => x.id)).view;
  const legacy = PA_AGENDA.replace(/PA-(\d)(\d\d)/g, "26-0$1$2");
  assert.deepEqual(keys(ag(legacy, undefined)), keys(ag(legacy, held)));
  assert.deepEqual(keys(ag(legacy, undefined)), ["26-0101", "26-0102", "26-0103"]);
  assert.deepEqual(keys(ag(legacy, EMPTY)), []);
  assert.deepEqual(keys(ag(PA_AGENDA.replace(/PA-(\d{3})/g, "M$1/26"), undefined)), [], "a test profile is never the fallback");
});

/* ---------------------------------------------------------------------- R4 */

test("R4 each type declares a contract, SUBSTANCE or MEMBERSHIP, generic SUBSTANCE", () => {
  const want = { meeting_calendar: "membership", meeting_agenda: "membership", meeting_minutes: "membership",
                 staff_directory: "membership", staff_report: "substance", regulation: "substance", generic: "substance" };
  for (const t of DOCTYPES) {
    assert.ok([CONTRACT.SUBSTANCE, CONTRACT.MEMBERSHIP].includes(t.contract), t.key);
    assert.equal(t.contract, want[t.key], t.key);
    assert.ok(Number.isInteger(t.version), t.key);
  }
});

/* ---------------------------------------------------------------------- R5 */

test("R5 every event a type's assess emits is the catalogue's, and meaningful is isMeaningful(events)", () => {
  const golden = JSON.parse(fs.readFileSync(new URL("./fixtures/docprofile-verdicts.json", import.meta.url), "utf8"));
  const parsed = {};
  for (const c of CASES) { const r = readWith(REG, c.supplied, c.ctx); parsed[c.id] = { t: r.doctype.type, p: r.parsed, ctx: c.ctx }; }
  const reads = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, { type: v.t.key }]));
  // every pair of readings of one type, and each reading against a changed copy of itself
  const mutate = (p) => { const b = structuredClone(p);
    if (b.entities && b.entities.length) { b.entities[0].facts = { ...b.entities[0].facts, outcome: "Rejected", subject: "x" }; b.entities.pop(); }
    for (const k of ["title", "recommendation", "number"]) if (b[k]) b[k] = `${b[k]} (changed)`;
    return b; };
  let n = 0;
  for (const [a, b] of pairsOf(reads)) for (const [x, y] of [[parsed[a].p, parsed[b].p], [parsed[a].p, mutate(parsed[a].p)]]) {
    const r = parsed[a].t.assess(x, y, parsed[b].ctx);
    for (const e of r.events) {
      assert.ok(Object.hasOwn(EVENTS, e.type), `${a}: ${e.type} is in the catalogue`);
      assert.equal(e.significance, EVENTS[e.type].significance);
    }
    if (r.meaningful !== null) assert.equal(r.meaningful, worstSignificance(r.events) === "event", `${a}|${b}`);
    else assert.deepEqual(r.events, []);
    n++;
  }
  assert.ok(n >= 100 && Object.keys(golden.assess).length > 0);
});

/* ---------------------------------------------------------------------- R6 */

test("R6 every connection is referential or temporal, each in its own shape", () => {
  const cal = typeOf("meeting_calendar");
  const a = cal.parse({ text: calendarHtml([["1", "Harbor Commission", "3/2/2026", null, "11"]]) });
  const b = cal.parse({ text: calendarHtml([["1", "Harbor Commission", "3/2/2026", null, "11"],
    ["2", "Select Board", "3/4/2026", null, "21", "22"], ["3", "Harbor Commission", "4/2/2026"]]) });
  const conns = cal.connections(a, b, { now: NOW, view: PA });
  assert.ok(conns.length >= 5);
  for (const c of conns) {
    if (c.connection === "referential") assert.deepEqual(Object.keys(c).sort(), ["connection", "from", "relation", "to", "why"]);
    else {
      assert.equal(c.connection, "temporal");
      assert.deepEqual(Object.keys(c).sort(), ["at", "connection", "expected_by", "from", "relation", "to", "why"]);
    }
  }
  const rel = new Set(conns.map((c) => `${c.connection}:${c.relation}`));
  for (const x of ["referential:is_the_agenda_for", "referential:is_the_minutes_of", "referential:held_by",
                   "temporal:minutes_published_after", "temporal:minutes_not_yet_published", "temporal:agenda_not_yet_published"])
    assert.ok(rel.has(x), x);
  // no other type emits a connection of a third shape
  for (const t of DOCTYPES) if (typeof t.connections === "function" && t !== cal)
    for (const c of t.connections(t.parse({ text: "", view: PA }), t.parse({ text: "", view: PA }), { view: PA }) || [])
      assert.ok(["referential", "temporal"].includes(c.connection));
});

/* ---------------------------------------------------------------------- R7 */

const pagesOf = (texts) => ({ pages: texts.map((text, page) => ({ page, text, undetermined: [] })), document: texts.filter(Boolean).join("\n") });

test("R7 a type places a reference only where locate says, once per reference with every occurrence, and no source without a locator", () => {
  const texts = { meeting_agenda: PA_AGENDA, staff_report: PA_REPORT, regulation: PA_BYLAW, staff_directory: PA_DIRECTORY,
                  meeting_minutes: PA_MINUTES };
  for (const [key, text] of Object.entries(texts)) {
    const bare = typeOf(key).parse({ text, view: PA });
    for (const e of bare.entities) { assert.ok(!("source" in e), key); for (const o of e.occurrences || []) assert.equal(o, null); }
    const nul = typeOf(key).parse({ text, view: PA, locate: () => null });
    for (const e of nul.entities) assert.ok(!("source" in e), `${key}: a null answer composes nothing`);
    const given = new Map();
    const locate = (off) => { const s = { kind: "pdf-page", ref: `p.${off}`, page: off, rect: null }; given.set(s.ref, s); return s; };
    const placed = typeOf(key).parse({ text, view: PA, locate });
    assert.ok(placed.entities.length, key);
    for (const e of placed.entities) {
      assert.equal(given.get(e.source.ref), e.source, `${key}: ${e.key} carries what locate gave`);
      const needle = String(e.facts.number || e.facts.section || e.facts.file || e.facts.address || e.key).toLowerCase();
      assert.ok(text.slice(e.source.page, e.source.page + 80).toLowerCase().includes(needle), `${key}: ${e.key} at ${e.source.page}`);
      for (const o of e.occurrences || []) assert.equal(given.get(o.ref), o);
      if (e.occurrences) assert.equal(e.occurrences[0], e.source, "the first occurrence is the source");
    }
    assert.equal(new Set(placed.entities.map((e) => e.key)).size, placed.entities.length, `${key}: one entity per reference`);
  }
  // read on two pages: one entity, its first sighting the source, every occurrence in reading order
  const flat = flattenText(pagesOf(PA_AGENDA.split("Page 1")));
  const r = typeOf("meeting_agenda").parse({ text: flat.text, view: PA, locate: makeLocator(flat.segments) });
  const first = r.entities.find((e) => e.key === "PA-101");
  assert.deepEqual(first.source, { kind: "pdf-page", ref: "p.1", page: 0, rect: null });
  assert.deepEqual(first.occurrences.map((s) => s && s.ref), ["p.1", "p.2"]);
  assert.ok(!("occurrences" in r.entities.find((e) => e.key === "PA-102")), "read once: no occurrences");
});

/* ---------------------------------------------------------------------- R8 */

test("R8 the calendar's forward-looking connection reads ctx.now when given, the wall clock only when not", () => {
  const cal = typeOf("meeting_calendar");
  const html = calendarHtml([["7", "Harbor Commission", "3/2/2026"]]);
  const p = cal.parse({ text: html });
  const at = (now) => cal.connections(p, p, { now, view: PA }).filter((c) => c.relation === "minutes_not_yet_published");
  assert.equal(at("2026-03-20T12:00:00Z").length, 1, "after the meeting, by the given now");
  assert.equal(at("2026-03-01T12:00:00Z").length, 0, "before it, by the given now");
  // with no now, the wall clock: today is long after March 2026
  assert.equal(at(undefined).length, 1);
  assert.deepEqual(at("2026-03-20T12:00:00Z"), at("2026-03-20T12:00:00Z"));
});

/* --------------------------------------------------------------------- R18 */

test("R18 the existing fixtures of every type give the verdicts docprofile gave, apart from the added readings", () => {
  const golden = JSON.parse(fs.readFileSync(new URL("./fixtures/docprofile-verdicts.json", import.meta.url), "utf8"));
  const ADDED = new Set(["form", "form_why", "sections", "sections_why", "section_digests", "definitions", "exceptions", "counts"]);
  const strip = (p) => Object.fromEntries(Object.entries(p).filter(([k]) => !ADDED.has(k)));
  const noSection = (r) => ({ ...r, events: r.events.filter((e) => e.key !== "section" && e.key !== "form"),
                              sections_compared: undefined, sections_why: undefined });
  /* The views as they are: the held profiles and Port Alder name their codes' section
     forms (jurisdictions T33-2), so the new readings are shown to move no verdict. */
  {
    const parsed = {};
    for (const c of CASES) {
      const ctx = c.ctx;
      const r = readWith(REG, c.supplied, ctx);
      const g = golden.readings[c.id];
      assert.equal(r.doctype.type.key, g.type, `${c.id}: type`);
      assert.equal(r.doctype.confidence, g.confidence, `${c.id}: confidence`);
      assert.deepEqual(r.doctype.signals, g.signals, `${c.id}: signals`);
      assert.deepEqual(r.doctype.also, g.also, `${c.id}: also`);
      const own = r.doctype.type.key === "regulation" ? strip(r.parsed) : r.parsed;
      assert.deepEqual(JSON.parse(JSON.stringify(own)), g.parsed, `${c.id}: the reading, entities included`);
      parsed[c.id] = { t: r.doctype.type, p: r.parsed, ctx };
    }
    for (const [pair, want] of Object.entries(golden.assess)) {
      const [a, b] = pair.split("|");
      const got = parsed[a].t.assess(parsed[a].p, parsed[b].p, parsed[b].ctx);
      const g = JSON.parse(JSON.stringify(noSection(got)));
      assert.deepEqual(g.events, want.events, `${pair}: events`);
      assert.equal(g.meaningful, want.meaningful, `${pair}: meaningful`);
    }
  }
  assert.equal(Object.keys(golden.readings).length, CASES.length);
});

/* ---------------------------------------------------------------- invariants */

test("R20 no place is named in this module's code, and every type is read under a profile that is not the first", () => {
  const read = (key, text, extra) => typeOf(key).parse({ text, view: PA, ...(extra || {}) });
  assert.deepEqual(keys(read("meeting_agenda", PA_AGENDA)), ["PA-101", "PA-102", "PA-103"]);
  assert.equal(read("meeting_minutes", PA_MINUTES).entities[0].facts.outcome, "Approved");
  assert.match(read("staff_report", PA_REPORT).recommendation, /^Adopt Bylaw No\. 2041/);
  assert.equal(read("regulation", PA_BYLAW).instrument, "bylaw");
  assert.equal(read("staff_directory", PA_DIRECTORY).entities.length, 6);
  assert.equal(read("meeting_calendar", calendarHtml([["5", "Harbor Commission", "3/3/2026"]])).entities[0].facts.body, "Harbor Commission");
  assert.deepEqual(read("generic", "x"), { entities: [], facts: {} });
  for (const t of DOCTYPES) assert.ok(typeFor(REG, { text: { meeting_agenda: PA_AGENDA, meeting_minutes: PA_MINUTES,
    staff_report: PA_REPORT, regulation: PA_BYLAW, staff_directory: PA_DIRECTORY, generic: "x",
    meeting_calendar: calendarHtml([["5", "B", "3/3/2026", null, "9"]]) }[t.key], view: PA, locator: "https://r.test/Calendar.aspx" }).type.key === t.key, t.key);
  // the first profile's shapes are not recognised when no active profile supplies them
  const oaklandShaped = PA_AGENDA.replace(/PA-(\d)(\d\d)/g, "26-0$1$2");
  for (const v of [PA, EMPTY]) assert.deepEqual(keys(typeOf("meeting_agenda").parse({ text: oaklandShaped, view: v })), []);
  const cites = "Staff recommends amending O.M.C. Section 8.28 per Ordinance No. 13314 C.M.S. and file 26-0910.";
  assert.deepEqual(keys(typeOf("staff_report").parse({ text: cites, view: PA })), []);
  assert.deepEqual(keys(typeOf("regulation").parse({ text: cites + " DOES ORDAIN", view: EMPTY })), []);
  assert.equal(typeOf("regulation").parse({ text: "2.20.030 - Definitions.\nA.\nText.", view: PA }).form, null,
    "a code number no active profile names is no code section");
  // and the code itself names no place: every name the held profiles cover, searched in the source
  const places = new Set();
  for (const p of list()) for (const c of p.covers || []) for (const w of String(c).split(/\W+/)) if (w.length > 4 && /^[A-Z]/.test(w)) places.add(w);
  for (const f of fs.readdirSync(new URL("..", import.meta.url)).filter((x) => x.endsWith(".mjs"))) {
    const src = fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    for (const w of places) if (!["County", "Cities"].includes(w)) assert.ok(!new RegExp(`\\b${w}\\b`).test(src), `${f} names ${w} outside a comment`);
  }
});

test("R21 deterministic over its inputs apart from R8, and nothing reads a store or the network", () => {
  for (const c of CASES) {
    const ctx = { ...c.ctx, view: c.ctx.view };
    assert.equal(JSON.stringify(readWith(REG, c.supplied, ctx).parsed), JSON.stringify(readWith(REG, c.supplied, ctx).parsed), c.id);
  }
  for (const f of fs.readdirSync(new URL("..", import.meta.url)).filter((x) => x.endsWith(".mjs"))) {
    const src = fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    assert.ok(!/\bfetch\s*\(|node:(?:fs|net|http)|\bD1\b|\.prepare\s*\(|indexedDB|localStorage/.test(src), `${f} reads no store or network`);
    for (const m of src.matchAll(/from\s+"([^"]+)"/g))
      assert.ok(/^\.\/|^\.\.\/(?:docprofile|site-profiles|jurisdictions)\//.test(m[1]), `${f} imports only its declared uses: ${m[1]}`);
  }
});

test("R22 an unrecognised document is never assumed decorated, and a type without CERTAIN never asserts unchanged", () => {
  const g = typeOf("generic");
  const r = g.assess({ entities: [], facts: {} }, { entities: [], facts: {} }, { view: PA });
  assert.notEqual(r.meaningful, false, "generic never says nothing changed by itself");
  const likely = typeFor(REG, { text: "The Select Board DOES HEREBY RESOLVE that the harbor opens.", view: PA });
  assert.equal(likely.type.key, "regulation");
  assert.equal(likely.confidence, CONFIDENCE.LIKELY);
  const none = typeFor(REG, { text: "a letter about nothing in particular", view: PA });
  assert.equal(none.type.key, "generic");
  assert.equal(none.confidence, CONFIDENCE.NONE);
  for (const t of DOCTYPES) assert.ok(!("unchanged" in t), `${t.key} holds no verdict of its own`);
});

test("R23 a reading or a diff that found nothing is a failed reader, and a mass removal is never reported from one", () => {
  const cases = [["meeting_agenda", PA_AGENDA], ["meeting_minutes", PA_MINUTES], ["staff_report", PA_REPORT],
                 ["regulation", PA_BYLAW], ["staff_directory", PA_DIRECTORY]];
  for (const [key, good] of cases) {
    const t = typeOf(key);
    const a = t.parse({ text: good, view: PA });
    const b = t.parse({ text: "nothing", view: PA });
    for (const [x, y] of [[a, b], [b, a], [b, b]]) {
      const m = t.assess(x, y, { view: PA });
      assert.equal(m.meaningful, null, key);
      assert.deepEqual(m.events, [], key);
      assert.match(m.why, /./);
    }
  }
  const cal = typeOf("meeting_calendar");
  const full = cal.parse({ text: calendarHtml([["1", "B", "3/3/2026"], ["2", "C", "3/4/2026"]]) });
  const empty = cal.parse({ text: calendarHtml([]) });
  const m = cal.assess(full, empty, { view: PA, now: NOW });
  assert.equal(m.meaningful, null);
  assert.ok(!m.events.some((e) => e.type === "item_pulled"), "no mass removal from a failed read");
});

test("R24 every no says which no and why", () => {
  assert.match(typeOf("regulation").parse({ text: "DOES ORDAIN", view: PA }).number_why, /no caption/);
  assert.match(typeOf("regulation").parse({ text: PA_BYLAW, view: PA }).number_why, /carries no number/);
  assert.match(typeOf("regulation").parse({ text: "nothing", view: PA }).form_why, /neither an instrument nor a code/);
  assert.match(typeOf("regulation").parse({ text: "DOES ORDAIN", view: PA }).sections_why, /SECTION 1/);
  assert.match(typeOf("meeting_agenda").parse({ text: PA_AGENDA, view: EMPTY }).references_why, /no active jurisdiction profile/);
  assert.match(typeOf("meeting_minutes").parse({ text: PA_MINUTES, view: EMPTY }).body_why, /no active jurisdiction profile/);
  assert.match(typeOf("staff_directory").parse({ text: PA_DIRECTORY.replace("Harbor Staff Directory", "Harbor"), view: PA }).title_why, /./);
  assert.match(typeFor(REG, { text: "plain", view: PA }).type.key, /generic/);
  const cal = typeOf("meeting_calendar");
  const p = cal.parse({ text: calendarHtml([["7", "Harbor Commission", "3/2/2026"]]) });
  assert.match(cal.connections(p, p, { now: NOW, view: EMPTY }).find((x) => x.relation === "minutes_not_yet_published").why, /not known/);
  const reg = typeOf("regulation");
  const a = reg.parse({ text: PA_BYLAW, view: PA });
  assert.match(reg.assess(a, a, { view: PA }).why, /./);
});

test("R4 R5 R1 a registry filled by registerDoctypes answers as docprofile's did: first CERTAIN, else best, else generic", () => {
  for (const [t, key] of [[PA_AGENDA, "meeting_agenda"], [PA_MINUTES, "meeting_minutes"], [PA_REPORT, "staff_report"],
                          [PA_BYLAW, "regulation"], [PA_DIRECTORY, "staff_directory"]]) {
    const r = typeFor(REG, { text: t, view: PA });
    assert.equal(r.type.key, key);
    assert.equal(r.confidence, CONFIDENCE.CERTAIN);
  }
  const both = typeFor(REG, { text: PA_MINUTES + "\n" + PA_AGENDA, view: PA });
  assert.ok(both.also.some((x) => x.key === "meeting_agenda"));
  assert.ok(registryOf(DOCTYPES).all().length === 7);
});
