/* NEGATIVE CONTROL: the seven arms live in `civicos-ui/test/nc-fw18.mjs` and are re-run in one step with `node civicos-ui/test/nc-fw18.mjs [arm]` from the REPO ROOT. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy (one per PATCH, since one arm carries two) verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Every arm declares its MUST-FAIL and its MUST-STAY BEFORE it is armed, and every fixture not named in an arm's declaration is a MUST-STAY by default - because this item's subject is a SEPARATION between document classes, and a control that only looked for new failures would score "every type stopped detecting" as a success. All seven RUN. (a) `baseline` - nothing armed; MUST be green, and it is the row that distinguishes seven-arms-working from seven-arms-broken. (b) `minutes` - neuter meeting_minutes.detect to `return {match:false, confidence:"none"}`; the minutes fixtures MUST stop reading as `meeting_minutes` (the Rules Committee one falls to `meeting_agenda`, the Council one to `generic`) while agenda, regulation and staff_report MUST STAY - this is the row-2 arm `EXTRACTION-BREADTH-DESIGN.md` section 8 demands per type. (c) `report` - the same for staff_report.detect; the staff-report fixture MUST fall to `regulation`, which is M0-32's multi-class finding showing up inside the control and is DECLARED rather than discovered, while all four others STAY. (d) `regulation` - the same for regulation.detect; the ordinance fixture MUST fall to `generic` AND the staff report's `also` MUST lose `regulation`, while every primary verdict including the staff report's MUST STAY. (e) `ratefence` - the agenda's masthead-RATE test replaced by the bare `/\bAgenda\b/i` rule it carried before FW-18. RE-DECLARED AFTER ITS FIRST RUN, and the first declaration was what was wrong: it said the minutes would go back to reading as an agenda, and they did not, because the correction has TWO INDEPENDENT HALVES and `recognise` breaks on the first CERTAIN - `meeting_minutes` being registered first already decides every primary verdict, so the fence governs only the `also` list. Re-declared there: the minutes' `also` entry for meeting_agenda MUST rise likely->certain and the Council minutes MUST gain one they did not have, while every primary verdict STAYS. ITS FIRST CORRECTED RUN THEN FIRED WHILE THIS SUITE STAYED GREEN, which was a finding about THIS SUITE - the two `also`-confidence assertions in section 3 were added for it and the arm now turns the suite RED as declared. (f) `defect` - THE DEFECT ARM, two patches because the correction is enforced in two places: the bare-word rule AND `types.register(meetingMinutes)` removed, together reproducing `main` as it stood before this item. BOTH real sets of Oakland minutes MUST read as `meeting_agenda` at CERTAIN - the landed defect on demand - while agenda, regulation and staff_report STAY. (g) `overstrict` - THE OVER-STRICTNESS DIRECTION, arming NO source: every fixture is re-read with its text passed as a BARE STRING rather than as I2's itemised `text` shape. Every primary verdict MUST STAY IDENTICAL (a type must not need position to recognise its own class) while `position_parts` MUST fall to 0 and every entity's `source` MUST become absent - a reader that still claimed a page over a string with no container structure would be inventing an address. */
/* FW-18 — the content types beyond three, in M0-32's measured order.
 *
 * `EXTRACTION-BREADTH-DESIGN.md` section 7 row 2: one content type per measured class,
 * each WRITTEN FROM A FETCHED AND READ PAGE OF ITS CLASS, each emitting references
 * with position now that FW-17 has landed. This suite drives what landed through
 * `readText` — the ONE entry point the plane's `op=acquire` uses — over fixtures that
 * are REAL Oakland documents trimmed only in size.
 *
 * WHAT IT ASSERTS, AND WHY EACH ONE IS HERE.
 *
 *   1. THE FIXTURES ARE REAL AND NON-EMPTY. Asserted first and floored, because three
 *      headline totality assertions in this repository have passed over an EMPTY
 *      corpus. The fixture carries each document's source URL, the sha256 of the bytes
 *      that were read, and how many pages the WHOLE document had, so a reader can go
 *      and fetch the same document.
 *
 *   2. EACH CLASS READS AS ITS OWN TYPE, and — the load-bearing half — THE OTHER
 *      CLASSES DO NOT. A recogniser that said `meeting_minutes` to everything would
 *      pass a suite that only checked the minutes.
 *
 *   3. THE LANDED DEFECT IS FIXED AND STAYS FIXED. Before this item, both real sets of
 *      Oakland minutes read as `meeting_agenda` at CERTAIN confidence, because the
 *      agenda's rule took the word `Agenda` anywhere in the text — and minutes say
 *      `On The July 21, 2026 City Council Agenda On Consent` of nearly every item.
 *      That is M0-32's one defect class: a REFERENCE read as MEMBERSHIP. The arm that
 *      reproduces it on demand is `ratefence` in the control harness.
 *
 *   4. REFERENCES CARRY POSITION (FW-17 / IC-86). Every reference every new reader
 *      emits must carry the container part it was read in, and `rect` must be null —
 *      Tier-1 text has no geometry and asserting layout the extractor cannot support
 *      is the invented structure this project forbids.
 *
 *   5. A DOCUMENT MAY BE MORE THAN ONE KIND (M0-32: 52 of 600, one in twelve). Two
 *      fixtures prove it on real documents: the Rules Committee minutes also satisfy
 *      `meeting_agenda`, and the budget errata staff report also satisfies
 *      `regulation` because it carries a whole resolution inside it.
 *
 *   6. THE AGENDA -> MINUTES PROGRESSION CLOSES. The minutes fixture and the agenda
 *      fixture are the same body on the same date, and the file numbers one lists are
 *      the file numbers the other lists — read from two documents rather than assumed.
 *
 *   7. WHAT IS NOT REGISTERED IS STATED. A staff DIRECTORY, class 4 of the measured
 *      order, had no type, and the suite asserted the registry said so rather than
 *      letting the absence be silent. CORRECTED 2026-09-23 (FW-20): the type is now
 *      written, and its own suite is `staff-directory.test.mjs` — see section 8.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs";
import { readText } from "../../docprofile/readtext.mjs";
import { doctypes, doctypeFor, alsoFor } from "../../docprofile/doctypes/registry.mjs";
import { CONTRACT, flatten, selfNaming, FURNITURE_RECURS } from "../../docprofile/doctypes/index.mjs";
import { EVENTS } from "../../docprofile/events.mjs";

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

const FX = JSON.parse(fs.readFileSync(new URL("./fixtures/fw18-doctypes.json", import.meta.url), "utf8"));
const doc = (k) => FX.documents[k];
const read = (k, asString) => {
  const d = doc(k);
  return readText(asString ? d.text.document : d.text, {});
};

/* ---- 1. the corpus is real, and it is not empty ---- */
const KEYS = ["minutes", "minutes_council", "agenda", "regulation", "staff_report"];
ok("the fixture holds all five measured documents", KEYS.every((k) => doc(k)));
ok("the fixture corpus is FLOORED at five documents", Object.keys(FX.documents).length >= 5);
for (const k of KEYS) {
  const d = doc(k);
  ok(`${k}: the fixture names the URL it was fetched from`, /^https:\/\//.test(d.source));
  ok(`${k}: the fixture carries the sha256 of the bytes that were read`, /^[0-9a-f]{64}$/.test(d.sha256));
  ok(`${k}: the whole document's page count is recorded`, d.whole_pages > 0);
  ok(`${k}: the trimmed text is substantial (>1500 chars)`, d.text.document.length > 1500);
  ok(`${k}: the trimmed pages keep the PRODUCER's own page indices`,
     d.text.pages.length > 0 && d.text.pages.every((p) => Number.isInteger(p.page)));
}
console.log(`corpus: ${KEYS.length} real documents, `
  + `${KEYS.reduce((a, k) => a + doc(k).text.document.length, 0)} characters of Tier-1 text, `
  + `${KEYS.reduce((a, k) => a + doc(k).text.pages.length, 0)} container parts`);

/* ---- 2. each class reads as its own type, and the others do not ---- */
const WANT = {
  minutes: "meeting_minutes",
  minutes_council: "meeting_minutes",
  agenda: "meeting_agenda",
  regulation: "regulation",
  staff_report: "staff_report",
};
const R = {};
for (const k of KEYS) {
  R[k] = read(k);
  ok(`${k}: a reading is produced at all`, R[k].determined === true);
  ok(`${k}: the reader ran without throwing`, !R[k].parse_error);
}
for (const k of KEYS)
  ok(`${k}: reads as ${WANT[k]} (got ${R[k].doctype.type.key})`, R[k].doctype.type.key === WANT[k]);
/* THE SEPARATION, asserted in the direction a broad recogniser would fail: no fixture
   may read as ANOTHER class's type. This is what a suite checking only its own class
   cannot see. */
for (const k of KEYS)
  for (const other of KEYS)
    if (WANT[other] !== WANT[k])
      ok(`${k}: does NOT read as ${WANT[other]}`, R[k].doctype.type.key !== WANT[other]);
/* Every one of the three new types is CERTAIN on its own measured document — a merely
   LIKELY reading on the document the type was written from would mean the rule does not
   describe what it was written from. */
for (const k of ["minutes", "minutes_council", "regulation", "staff_report"])
  ok(`${k}: detected with CERTAIN confidence on its own measured document`,
     R[k].doctype.confidence === "certain");
/* And each names the evidence that earned it, rather than matching silently. */
for (const k of KEYS)
  ok(`${k}: the detection names at least two signals`, (R[k].doctype.signals || []).length >= 2);

/* ---- 3. the landed defect, and the rate that fixed it ---- */
/* The reference-read-as-membership defect, pinned at its own mechanism rather than only
   at its symptom: the minutes DO carry the word Agenda, and DO carry line-anchored
   `Agenda` lines, and are still not an agenda. */
{
  const t = doc("minutes").text.document;
  ok("the minutes fixture really does contain the word Agenda (the defect's input)",
     /\bAgenda\b/i.test(t));
  ok("the minutes name themselves as minutes at furniture rate",
     selfNaming(t, /^(?:Meeting\s+)?Minutes(?:\s*[-–—]\s*\S.*)?$/i) >= FURNITURE_RECURS);
  ok("the minutes do NOT name themselves as an agenda at furniture rate",
     selfNaming(t, /^(?:Meeting\s+)?Agenda(?:\s*[-–—]\s*\S.*)?$/i) < FURNITURE_RECURS);
  ok("the agenda DOES name itself as an agenda at furniture rate",
     selfNaming(doc("agenda").text.document, /^(?:Meeting\s+)?Agenda(?:\s*[-–—]\s*\S.*)?$/i) >= FURNITURE_RECURS);
  /* ADDED AFTER THE `ratefence` CONTROL ARM FIRED AND THIS SUITE STAYED GREEN, which is
     a finding about the SUITE. The correction has two independent halves —
     `meeting_minutes` registered ahead of `meeting_agenda`, and the agenda's rate fence
     — and `recognise` breaks on the first CERTAIN, so the ORDER alone decides every
     primary verdict. Nothing above could therefore see the fence at all. These two
     assertions are where it governs: WITH the fence, the agenda is at most LIKELY on a
     minutes document, and a minutes document with no agenda masthead line is not an
     agenda in any degree. Remove the fence and both flip. */
  ok("with the rate fence, the agenda is at most LIKELY on the minutes — never certain",
     (R.minutes.doctype.also || []).every((x) => x.key !== "meeting_agenda" || x.confidence === "likely"));
  ok("and the Council minutes, which carry NO agenda masthead line, are not an agenda in any degree",
     !(R.minutes_council.doctype.also || []).some((x) => x.key === "meeting_agenda")
     && R.minutes_council.doctype.type.key !== "meeting_agenda");
}
/* The same class in the OTHER direction, on the regulation side: the Council's minutes
   carry well-formed instrument captions they merely cite, and must not read as an
   instrument. */
{
  const flat = flatten(doc("minutes_council").text.document);
  ok("the Council minutes cite an instrument caption (the defect's input)",
     /\b(ORDINANCE|RESOLUTION)\s+NO\.?\s*\d{3,6}/i.test(flat));
  ok("and still do not read as a regulation",
     R.minutes_council.doctype.type.key !== "regulation"
     && !(R.minutes_council.doctype.also || []).some((x) => x.key === "regulation"));
}

/* ---- 4. references carry position, and no reader invents geometry ---- */
for (const k of KEYS) {
  const ents = (R[k].parsed && R[k].parsed.entities) || [];
  ok(`${k}: the reader found at least one reference`, ents.length >= 1);
  ok(`${k}: the container itemised its own text (position was available)`, R[k].position_parts > 0);
  ok(`${k}: EVERY reference carries where it was read`, ents.every((e) => e.source));
  ok(`${k}: every position is an IC-1 element reference with a null rect`,
     ents.every((e) => e.source.kind === "pdf-page" && Number.isInteger(e.source.page)
       && /^p\.\d+$/.test(e.source.ref) && e.source.rect === null));
  /* The page a reference is placed on must be a page the container actually emitted —
     a locator that answered from outside its own map would be a confident wrong page. */
  const pages = new Set(doc(k).text.pages.map((p) => p.page));
  ok(`${k}: every position names a page this document actually emitted`,
     ents.every((e) => pages.has(e.source.page)));
  /* Keys must be source-assigned, never a position in a list (framework section 7). */
  ok(`${k}: every entity key is non-empty and not a bare list index`,
     ents.every((e) => e.key && !/^\d{1,2}$/.test(e.key)));
}

/* ---- 5. one document may be more than one kind (M0-32: 52 of 600) ---- */
{
  const alsoMinutes = (R.minutes.doctype.also || []).map((x) => x.key);
  ok("the Rules Committee minutes ALSO satisfy meeting_agenda, and the record says so",
     alsoMinutes.includes("meeting_agenda"));
  ok("and the reader carries that fact into the reading itself",
     (R.minutes.parsed.also_satisfies || []).includes("meeting_agenda"));
  const alsoReport = (R.staff_report.doctype.also || []).map((x) => x.key);
  ok("the budget errata staff report ALSO satisfies regulation (it carries a resolution)",
     alsoReport.includes("regulation"));
  ok("and the reader carries that fact into the reading itself",
     (R.staff_report.parsed.also_satisfies || []).includes("regulation"));
  /* The multi-class pass NEVER changes the verdict: `also` is additive. */
  ok("a document's own type is never listed in its own `also`",
     KEYS.every((k) => !(R[k].doctype.also || []).some((x) => x.key === R[k].doctype.type.key)));
  ok("the fallback type is never listed as an `also`",
     KEYS.every((k) => !(R[k].doctype.also || []).some((x) => x.key === "generic")));
  /* And the engine's own truncation is the reason this exists: `considered` stops at
     the first CERTAIN, so it cannot carry what `also` carries. */
  ok("`considered` is truncated at the winning CERTAIN detection, which is why `also` exists",
     (R.minutes.doctype.considered || []).length <= (R.minutes.doctype.also || []).length + 1);
  ok("alsoFor is reachable on its own and agrees with the profile",
     alsoFor({ text: doc("minutes").text.document }, "meeting_minutes")
       .map((x) => x.key).join() === alsoMinutes.join());
}

/* ---- 6. the agenda -> minutes progression, closed from two readings ---- */
{
  const mKeys = new Set(R.minutes.parsed.entities.map((e) => e.key));
  const aKeys = new Set(R.agenda.parsed.entities.map((e) => e.key));
  const shared = [...mKeys].filter((k) => aKeys.has(k));
  ok("the minutes and the agenda are the same body", R.minutes.parsed.body === R.agenda.parsed.body);
  ok("on the same date", R.minutes.parsed.date === R.agenda.parsed.date);
  ok("and they share legislation file numbers, read from BOTH documents", shared.length >= 3);
  /* What the MINUTES add over the agenda is the outcome, which is the whole reason
     minutes are a separate type rather than the agenda reader pointed at a second
     document. */
  const withOutcome = R.minutes.parsed.entities.filter((e) => e.facts.outcome);
  ok("the minutes record an OUTCOME for the matters they carry", withOutcome.length >= 3);
  ok("the agenda records none, because an agenda has none",
     R.agenda.parsed.entities.every((e) => e.facts.outcome === undefined));
  ok("a recorded vote is the clerk's own tally, never one this reader summed",
     R.minutes.parsed.entities.some((e) => e.facts.vote && typeof e.facts.vote.aye === "number"));
  console.log(`progression: ${shared.length} file numbers appear in BOTH the agenda and the minutes `
    + `of the Rules & Legislation Committee, 2026-07-16`);
}

/* ---- 7. the document facts each reader claims, and the nulls it states ---- */
{
  ok("the minutes report that they are a DRAFT, which is a fact about what a member cites",
     R.minutes.parsed.status === "DRAFT");
  ok("the minutes report when the meeting convened and adjourned",
     !!R.minutes.parsed.convened && !!R.minutes.parsed.adjourned);
  ok("the minutes report the attendance roster as a FACT, not as entities",
     R.minutes.parsed.attendance && typeof R.minutes.parsed.attendance.present === "string");
  ok("no reader emits a person's name as an entity key (a name is not a source-assigned id)",
     R.minutes.parsed.entities.every((e) => e.kind !== "person"));
  /* THE HONEST NULL, and the arm that proves it is not silence. The Council's minutes
     set the body's name across three lines, so no single line is the name. */
  ok("the Council minutes decline to name the body rather than guessing from one line",
     R.minutes_council.parsed.body === null);
  ok("and say WHY the body is not named", /no single line/.test(R.minutes_council.parsed.body_why || ""));
  ok("the Rules Committee minutes DO name the body, so the null above is not a broken path",
     R.minutes.parsed.body === "Rules & Legislation Committee" && R.minutes.parsed.body_why === null);
  /* The proposed ordinance has no number, and that is a fact about the instrument. */
  ok("the proposed ordinance carries NO number", R.regulation.parsed.number === null);
  ok("and says why, rather than borrowing a number it cites",
     /proposed ordinance or resolution/.test(R.regulation.parsed.number_why || ""));
  ok("the instrument this reader read cites OTHER instruments by number",
     R.regulation.parsed.entities.some((e) => e.kind === "instrument"));
  ok("and none of those is claimed as its own number",
     !R.regulation.parsed.entities.some((e) => e.facts.number === R.regulation.parsed.number));
  ok("the ordinance's own title is read from its own caption",
     /^ORDINANCE AMENDING OAKLAND MUNICIPAL CODE/.test(R.regulation.parsed.title || ""));
  ok("the staff report names who it is addressed to, and it is ONE field not the whole header",
     R.staff_report.parsed.to === "Edard D. Reiskin");
  ok("the staff report carries the recommendation it makes",
     /^Staff Recommends That The City Council/.test(R.staff_report.parsed.recommendation || ""));
  ok("the staff report counts the template sections it found",
     R.staff_report.parsed.sections >= 3);
}

/* ---- 8. the registry, the contracts, and what is NOT registered ---- */
{
  const keys = doctypes().map((t) => t.key);
  /* CORRECTED 2026-09-23 (FW-20): was "six content types", which was true until the
     fourth class of M0-32's order was written. The count is the thing CPDF-17's
     correction of the registry header obliges every later author to move. */
  ok("seven content types are registered", keys.length === 7);
  ok("and they are the measured six plus the generic fallback",
     ["meeting_calendar", "meeting_minutes", "meeting_agenda", "staff_report", "regulation", "staff_directory", "generic"]
       .every((k) => keys.includes(k)));
  ok("meeting_minutes is registered BEFORE meeting_agenda, which decides a certain/certain tie",
     keys.indexOf("meeting_minutes") < keys.indexOf("meeting_agenda"));
  ok("every registered type declares a contract from the one vocabulary",
     doctypes().every((t) => t.fallback || Object.values(CONTRACT).includes(t.contract)));
  ok("minutes watch MEMBERSHIP (a list of matters), reports and instruments watch SUBSTANCE",
     doctypes().find((t) => t.key === "meeting_minutes").contract === CONTRACT.MEMBERSHIP
     && doctypes().find((t) => t.key === "staff_report").contract === CONTRACT.SUBSTANCE
     && doctypes().find((t) => t.key === "regulation").contract === CONTRACT.SUBSTANCE);
  ok("every registered type carries a version so a judgment can be revised",
     doctypes().every((t) => Number.isInteger(t.version)));
  /* CORRECTED 2026-09-23 (FW-20). These two assertions pinned that class 4 of the
     measured order had NO type and that the registry said why — "every directory this
     item could fetch was Tier-1 undecodable". The ABSENCE was honest; its REASON was a
     measurement taken with only tier 1, and FW-20 re-took it through the plane with the
     fleet bound: the markers were `no_tounicode` (tier 2's case), and 56 of 57
     name-matched documents read from text once the tier-2 member was bound. So the old
     assertion now pins a stale reason, not a fact. What stays true, and is asserted in its
     place: the directory type exists, it is the fourth class's, and the registry still
     states WHY it was once withheld rather than erasing the history. The type's own
     behaviour is `staff-directory.test.mjs`'s to pin. */
  ok("a staff-directory type IS registered (class 4 of the measured order)", keys.includes("staff_directory"));
  const src = fs.readFileSync(new URL("../../docprofile/doctypes/registry.mjs", import.meta.url), "utf8");
  ok("and the registry records that it was withheld on a measurement and why that measurement did not hold",
     /withheld/.test(src) && /UNDECODABLE/i.test(src) && /no_tounicode/.test(src));
  /* The events the new readers emit are in the ONE catalogue, never inline strings. */
  for (const e of ["outcome_changed", "recommendation_changed", "instrument_changed"])
    ok(`the event catalogue holds ${e} with a fixed significance`, EVENTS[e] && EVENTS[e].significance);
  ok("a published record of a past act changing is graded EVENT, not routine drift",
     EVENTS.outcome_changed.significance === "event"
     && EVENTS.recommendation_changed.significance === "event"
     && EVENTS.instrument_changed.significance === "event");
}

/* ---- 9. assess(): the three new types report change, and grade it apart ---- */
{
  const mins = doctypeFor({ text: doc("minutes").text.document }).type;
  const a = mins.parse({ text: doc("minutes").text.document });
  /* An outcome moving and the wording moving are DIFFERENT facts and must not collapse. */
  const b = JSON.parse(JSON.stringify(a));
  b.entities[0].facts.outcome = "Rejected";
  const outcome = mins.assess(a, b);
  ok("a changed outcome is MEANINGFUL", outcome.meaningful === true);
  ok("and is reported as outcome_changed at EVENT significance",
     outcome.events.some((e) => e.type === "outcome_changed" && e.significance === "event"));
  const c = JSON.parse(JSON.stringify(a));
  c.entities[0].facts.subject = "something else entirely";
  const wording = mins.assess(a, c);
  ok("a changed SUBJECT is a notice, not an event — the two are graded apart",
     wording.events.some((e) => e.type === "item_changed") && wording.meaningful === false);
  /* A read that found nothing is a failed reader, never an emptied record. */
  const empty = mins.assess({ entities: [] }, a);
  ok("a read that found nothing claims NOTHING either way", empty.meaningful === null);
  ok("and says so in words a member can read", /could not be read/.test(empty.why));

  const rep = doctypeFor({ text: doc("staff_report").text.document }).type;
  const ra = rep.parse({ text: doc("staff_report").text.document });
  const rb = { ...ra, recommendation: "Staff Recommends That The City Council Reject It." };
  const rr = rep.assess(ra, rb);
  ok("a staff report's recommendation moving is MEANINGFUL", rr.meaningful === true);
  ok("and is reported as recommendation_changed",
     rr.events.some((e) => e.type === "recommendation_changed"));

  const reg = doctypeFor({ text: doc("regulation").text.document }).type;
  const ga = reg.parse({ text: doc("regulation").text.document });
  const gb = { ...ga, title: "ORDINANCE DOING SOMETHING ELSE." };
  const gr = reg.assess(ga, gb);
  ok("an instrument's title moving at the same address is MEANINGFUL", gr.meaningful === true);
  ok("and is reported as instrument_changed",
     gr.events.some((e) => e.type === "instrument_changed"));
  ok("an unchanged instrument reports no events and says so",
     reg.assess(ga, JSON.parse(JSON.stringify(ga))).events.length === 0);
}

/* ---- 10. the flattened copy in app.html carries every new type ---- */
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const block = /\/\*__DOCPROFILE_START__\*\/\n([\s\S]*?)\n\/\*__DOCPROFILE_END__\*\//.exec(app);
  ok("app.html still carries a flattened docprofile block", !!block);
  /* A doctype the registry imports and the bundler's ORDER omits is a symbol the
     flattened copy REGISTERS AND NEVER DEFINES — a ReferenceError in the UI runtime and
     in every UI harness at once, which is exactly what shipped when meeting-agenda was
     added to the package and not to ORDER. `check-semantics.mjs` compares the two
     copies; this asserts the SYMBOL, which is the failure that one went green past. */
  for (const [file, sym] of [["meeting-minutes", "meetingMinutes"], ["staff-report", "staffReport"],
                             ["regulation", "regulation"], ["meeting-agenda", "meetingAgenda"]]) {
    ok(`the embed carries docprofile/doctypes/${file}.mjs`, block[1].includes(`---- docprofile/doctypes/${file}.mjs ----`));
    ok(`and DEFINES ${sym} before registering it`,
       block[1].indexOf(`const ${sym} = {`) >= 0
       && block[1].indexOf(`const ${sym} = {`) < block[1].indexOf(`types.register(${sym})`));
  }
}

console.log(n + " pass");
