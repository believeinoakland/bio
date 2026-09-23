/* NEGATIVE CONTROL: RUN 2026-09-23 by `node civicos-ui/test/nc-fw20.mjs` from the REPO ROOT — a baseline and 4 arms, 0 not as declared. Each arm edits the REAL source `docprofile/doctypes/staff-directory.mjs`, is armed ALONE, runs this suite, `doctype-breadth.test.mjs` and `bio-plane/test/staff-directory-e2e.test.mjs`, and is restored by `cp` from a uniquely-named per-arm pristine copy verified by sha256 AND `cmp` (13,259 bytes, floored; subject sha256 057df968…, re-run after the M-120 comment edits with the same verdicts). BASELINE all three green. (1) DECIDE — the deciding leg — density at one organisation's domain — neutered: this suite FAILED AS DECLARED at `directory_nss: reads as staff_directory (got generic)`, the plane at `the content-type registry chose staff_directory`, breadth GREEN. (2) REFERENCE — the schedule fence removed, so a document whose every row REFERENCES City staff reads as a directory: FAILED AS DECLARED at `neg_schedule: does NOT read as staff_directory (got staff_directory)` and in the plane at `and it is not a staff_directory`, while the plane's real directory still read as one; breadth GREEN. (3) ONEORG — the one-organisation share removed — the liar's pass: FAILED AS DECLARED at `neg_candidates: does NOT read as staff_directory (got staff_directory)`; breadth and plane GREEN. (4) OVERSTRICT — the schedule fence re-spelled against ALL addresses rather than the organisation's: all three GREEN AS DECLARED. Over-strictness on the landed types is also pinned in section 7: FW-18's five fixtures answer byte-identically to their verdicts read at origin/main 02603e88 before this type existed. */
/*
 * FW-20 — the STAFF DIRECTORY, the fourth and last class of M0-32's measured order
 * (`EXTRACTION-BREADTH-DESIGN.md` §2's table row 4 and §7 row 2).
 *
 * Every fixture is a REAL document from `s3://cao-94612` (the City of Oakland's public
 * website bucket), fetched 2026-09-23 and read through the plane's own `op=acquire` with
 * the committed pdf-worker bundle bound; the text object is the plane's `op=pdfstructure`
 * text field for those bytes, WHOLE and untrimmed. `bio-plane/test/staff-directory-e2e.test.mjs`
 * drives two of the same PDFs through the plane itself; this suite drives the reader
 * through `readText`, the one entry point `op=acquire` uses, and through `identify`.
 *
 * WHAT IT ASSERTS, AND WHY EACH ONE IS HERE.
 *
 *   1. THE FIXTURES ARE REAL AND NON-EMPTY, floored — three headline totality assertions
 *      in this repository have passed over an empty corpus.
 *   2. FOUR REAL DIRECTORIES READ AS `staff_directory`, including one laid out in two
 *      columns and one whose first line is a column header.
 *   3. FIVE REAL NON-DIRECTORIES DO NOT, in any degree — primary OR `also`. This is the
 *      liar's test: a recogniser that matched "a list of names with contacts" would pass
 *      section 2 and fail here on the candidate list, and one that matched "many
 *      addresses at one domain" would fail on the NCPC meeting schedule, which is a
 *      document that REFERENCES staff in every row and is not a directory (M0-32's one
 *      defect class, reference-as-membership).
 *   4. THE READER'S OUTPUT: entries keyed by the address (never a name), each carrying
 *      where it was read (FW-17 / IC-86), document facts, and the honest null.
 *   5. ASSESS: an address gone, added, or re-assigned is reported as which.
 *   6. `also`: WHAT ELSE A DIRECTORY IS — asked of every registered type independently.
 *   7. OVER-STRICTNESS: the landed types' verdicts on FW-18's committed fixture are
 *      byte-identical to what they were before this type existed.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36 — shared, for its side effect */
import fs from "fs";
import { readText } from "../../docprofile/readtext.mjs";
import { identify } from "../../docprofile/registry.mjs";
import { doctypes, doctypeFor } from "../../docprofile/doctypes/registry.mjs";
import staffDirectory, { DIRECTORY_FLOOR, ONE_ORGANISATION } from "../../docprofile/doctypes/staff-directory.mjs";
import { CONTRACT } from "../../docprofile/doctypes/index.mjs";

let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

const FX = JSON.parse(fs.readFileSync(new URL("./fixtures/fw20-staff-directory.json", import.meta.url), "utf8"));
const doc = (k) => FX.documents[k];

/* ---- 1. the corpus is real, and it is not empty ---- */
const POS = ["directory_nss", "directory_nsd", "directory_cro", "directory_benefits"];
const NEG = ["neg_candidates", "neg_schedule", "neg_recycling", "neg_wdb", "neg_medical"];
ok("the fixture corpus is FLOORED at nine documents", Object.keys(FX.documents).length >= 9);
for (const k of [...POS, ...NEG]) {
  const d = doc(k);
  ok(`${k}: present`, !!d);
  ok(`${k}: names the URL it was fetched from`, /^https:\/\/cao-94612\.s3\.amazonaws\.com\//.test(d.source));
  ok(`${k}: carries the sha256 of the bytes that were read`, /^[0-9a-f]{64}$/.test(d.sha256));
  ok(`${k}: was read at a tier the plane records`, [1, 2, 3].includes(d.tier));
  ok(`${k}: the text is not empty (>500 chars)`, d.text.document.length > 500);
  ok(`${k}: the pages keep the PRODUCER's own page indices`,
     d.text.pages.length > 0 && d.text.pages.every((p) => Number.isInteger(p.page)));
}
console.log(`corpus: ${POS.length} directories, ${NEG.length} non-directories, `
  + `${[...POS, ...NEG].reduce((a, k) => a + doc(k).text.document.length, 0)} characters`);

const R = {};
for (const k of [...POS, ...NEG]) {
  R[k] = readText(doc(k).text, {});
  ok(`${k}: a reading is produced at all`, R[k].determined === true);
  ok(`${k}: the reader ran without throwing`, !R[k].parse_error);
}

/* ---- 2. the directories read as directories ---- */
for (const k of POS)
  ok(`${k}: reads as staff_directory (got ${R[k].doctype.type.key})`, R[k].doctype.type.key === "staff_directory");
for (const k of ["directory_nss", "directory_nsd", "directory_benefits"])
  ok(`${k}: CERTAIN — it names itself in its title line`, R[k].doctype.confidence === "certain");
ok("directory_cro: LIKELY — its first line is a column header, so it does not name itself, and the ladder says so",
   R.directory_cro.doctype.confidence === "likely");
for (const k of POS)
  ok(`${k}: the detection names the evidence that earned it`, (R[k].doctype.signals || []).length >= 1
     && /distinct contact address\(es\) at one organisation's domain/.test(R[k].doctype.signals[0]));
/* THROUGH `identify` as well: the stack axis and the content axis are separate and the
   directory is a content fact, so a PDF's text must reach the type whichever stack the
   stack registry chooses. */
{
  const t = doc("directory_nss").text.document;
  const stack = identify({ text: t });
  const dt = doctypeFor({ text: t, handler: stack.handler, kind: stack.kind });
  ok("driven through identify() then doctypeFor(): staff_directory", dt.type.key === "staff_directory");
}

/* ---- 3. the non-directories do not, in ANY degree ---- */
for (const k of NEG) {
  ok(`${k}: does NOT read as staff_directory (got ${R[k].doctype.type.key})`, R[k].doctype.type.key !== "staff_directory");
  ok(`${k}: and staff_directory is not even an ALSO`,
     !(R[k].doctype.also || []).some((x) => x.key === "staff_directory"));
}
/* The inputs of the liar's pass are PRESENT, asserted, so the refusals above are about
   the rule and not about fixtures that happen to carry nothing. */
{
  const cand = doc("neg_candidates").text.document;
  ok("the candidate list really is a list of people with addresses and phones (the trap's input)",
     (cand.match(/@/g) || []).length >= 20 && (cand.match(/\(\d{3}\)\s?\d{3}-\d{4}/g) || []).length >= 20);
  const sched = doc("neg_schedule").text.document;
  const cityAt = new Set((sched.match(/[A-Za-z.]+@oaklandca\.gov/gi) || []).map((x) => x.toLowerCase()));
  ok("the NCPC schedule really does carry DIRECTORY_FLOOR+ distinct City staff addresses at ONE domain",
     cityAt.size >= DIRECTORY_FLOOR);
  ok("and it references them in dated rows — the schedule fence is what refuses it",
     (sched.match(/\b(?:April|May|June)\s+\d{1,2}\b/g) || []).length >= 10);
  ok("the recycling directory really does name itself a DIRECTORY in its title lines",
     /DIRECTORY/.test(doc("neg_recycling").text.document.split("\n").slice(0, 3).join(" ")));
  ok("and really does reference a City staff contact", /@oaklandca\.gov/i.test(doc("neg_recycling").text.document));
}

/* ---- 4. what the reader found ---- */
{
  const p = R.directory_nss.parsed;
  ok("the NSS directory's entries are its distinct addresses", p.entities.length === 12);
  ok("its organisation domain is the City's", p.domain === "oaklandca.gov" && p.entries === 12);
  ok("every entry is keyed by its ADDRESS, never a name", p.entities.every((e) => /^contact:[^@\s]+@[^@\s]+$/.test(e.key)));
  ok("no entry is a person entity keyed by a name", p.entities.every((e) => e.kind === "contact"));
  const moore = p.entities.find((e) => e.key === "contact:amoore@oaklandca.gov");
  ok("an entry carries its own line verbatim, as a fact", !!moore && /Angela Moore/.test(moore.facts.line));
  ok("and the phone read on that line", moore.facts.phone === "238-6822");
  ok("the title is read from the document's own first line",
     p.title === "Neighborhood Services Staff Beat & Program Directory" && p.title_why === null);
  /* FW-17 / IC-86: every entry says where it was read, from the producer's own map. */
  for (const k of POS) {
    const ents = R[k].parsed.entities;
    ok(`${k}: at least DIRECTORY_FLOOR entries`, ents.length >= DIRECTORY_FLOOR);
    ok(`${k}: EVERY entry carries where it was read`, ents.every((e) => e.source));
    ok(`${k}: every position is an IC-1 pdf-page reference with a null rect`,
       ents.every((e) => e.source.kind === "pdf-page" && Number.isInteger(e.source.page) && e.source.rect === null));
    const pages = new Set(doc(k).text.pages.map((x) => x.page));
    ok(`${k}: every position names a page this document emitted`, ents.every((e) => pages.has(e.source.page)));
  }
  /* The benefits sheet's second page carries entries; a locator that put everything on
     page 0 would pass every arm above on the one-page documents. */
  ok("the two-page benefits sheet places entries on BOTH its pages",
     new Set(R.directory_benefits.parsed.entities.map((e) => e.source.page)).size === 2);
  /* THE HONEST NULL: the CRO directory does not name itself, and says why. */
  ok("the CRO directory's title is null", R.directory_cro.parsed.title === null);
  ok("and the reading says why", /no line among the first five/.test(R.directory_cro.parsed.title_why || ""));
  /* The two-column page: an address's own line is kept verbatim and NOT paired with a
     name by guesswork. */
  const nsd = R.directory_nsd.parsed.entities.find((e) => e.key === "contact:arichards@oaklandca.gov");
  ok("on the two-column page an entry's line is the line it was read on, carrying both columns",
     !!nsd && nsd.facts.line === "arichards@oaklandca.gov amoore@oaklandca.gov");
  /* The benefits sheet lists carriers' websites beside the City's staff, but its ADDRESSES
     are all the City's; every entry says whether it sits at the organisation's domain. */
  ok("every entry states whether it sits at the organisation's domain",
     POS.every((k) => R[k].parsed.entities.every((e) => typeof e.facts.organisation === "boolean")));
  ok("and an address at another domain is an entry marked as such, not dropped",
     staffDirectory.parse({ text: doc("directory_nss").text.document + "\nA. Person outside@example.org" })
       .entities.some((e) => e.key === "contact:outside@example.org" && e.facts.organisation === false));
}

/* ---- 5. assess() ---- */
{
  const a = R.directory_nss.parsed;
  const b = JSON.parse(JSON.stringify(a));
  b.entities = b.entities.filter((e) => e.key !== "contact:ldieng@oaklandca.gov");
  b.entities.find((e) => e.key === "contact:bivey@oaklandca.gov").facts.line = "Brenda Ivey 1X bivey@oaklandca.gov 238-3091";
  b.entities.push({ key: "contact:someone@oaklandca.gov", kind: "contact", label: "someone", facts: { line: "x" } });
  const r = staffDirectory.assess(a, b);
  ok("an address no longer listed is item_pulled", r.events.some((e) => e.type === "item_pulled" && e.key === "contact:ldieng@oaklandca.gov"));
  ok("a new address is item_added", r.events.some((e) => e.type === "item_added" && e.key === "contact:someone@oaklandca.gov"));
  ok("a re-assigned entry is item_changed, naming what moved",
     r.events.some((e) => e.type === "item_changed" && e.key === "contact:bivey@oaklandca.gov"));
  ok("the change is meaningful", r.meaningful === true);
  const same = staffDirectory.assess(a, JSON.parse(JSON.stringify(a)));
  ok("an unchanged directory reports no events and says so", same.events.length === 0 && /same addresses/.test(same.why));
  const empty = staffDirectory.assess({ entities: [] }, { entities: [] });
  ok("a read that found nothing claims NOTHING either way", empty.meaningful === null);
}

/* ---- 6. also: what else a directory is ---- */
{
  /* The `also` pass is asked of EVERY directory here, and each answer is asserted. On
     this real corpus no directory satisfies another class, and that is the answer the
     pass gives — stated rather than left as an unasked question. */
  for (const k of POS) {
    ok(`${k}: the also pass answered (a list)`, Array.isArray(R[k].doctype.also));
    ok(`${k}: the reader carries it into the reading`, Array.isArray(R[k].parsed.also_satisfies)
       && R[k].parsed.also_satisfies.join() === R[k].doctype.also.map((x) => x.key).join());
  }
  /* A DIRECTORY THAT IS ALSO ANOTHER KIND, from REAL pages: the NSS directory followed by
     the regulation fixture's instrument — the shape of an agenda packet or a staff report
     that carries its division's directory as an attachment (M0-32: 52 of 600 sampled
     documents satisfy more than one class). Both halves are real text; only their
     adjacency is composed, and the arm says so. */
  const FW18 = JSON.parse(fs.readFileSync(new URL("./fixtures/fw18-doctypes.json", import.meta.url), "utf8"));
  const packet = FW18.documents.regulation.text.document + "\n" + doc("directory_nss").text.document;
  const pr = readText(packet, {});
  ok("a packet carrying an instrument and a directory reads as the instrument first (registration order)",
     pr.doctype.type.key === "regulation");
  ok("and ALSO as a staff_directory — the also pass says what the first-CERTAIN break hid",
     (pr.doctype.also || []).some((x) => x.key === "staff_directory"));
  ok("and the regulation reader carries that fact into its reading",
     (pr.parsed.also_satisfies || []).includes("staff_directory"));
}

/* ---- 7. registration, contract, and over-strictness ---- */
{
  const t = doctypes().find((x) => x.key === "staff_directory");
  ok("staff_directory is registered", !!t);
  ok("it watches MEMBERSHIP — a directory is a list", t.contract === CONTRACT.MEMBERSHIP);
  ok("it carries a version", Number.isInteger(t.version));
  const keys = doctypes().map((x) => x.key);
  ok("registered AFTER the three substance types and BEFORE the fallback",
     keys.indexOf("staff_directory") > keys.indexOf("regulation") && keys.indexOf("staff_directory") < keys.indexOf("generic"));
  ok("the thresholds are the measured ones", DIRECTORY_FLOOR === 5 && ONE_ORGANISATION === 0.8);
  /* OVER-STRICTNESS: the landed types answer exactly as before on FW-18's committed
     fixture. The pins were read from origin/main at 02603e88, before this type existed. */
  const FW18 = JSON.parse(fs.readFileSync(new URL("./fixtures/fw18-doctypes.json", import.meta.url), "utf8"));
  const PIN = {
    minutes: "meeting_minutes|certain|meeting_agenda",
    minutes_council: "meeting_minutes|certain|",
    agenda: "meeting_agenda|certain|",
    regulation: "regulation|certain|",
    staff_report: "staff_report|certain|regulation",
  };
  for (const [k, want] of Object.entries(PIN)) {
    const r = readText(FW18.documents[k].text, {});
    const got = `${r.doctype.type.key}|${r.doctype.confidence}|${(r.doctype.also || []).map((x) => x.key).join(",")}`;
    ok(`FW-18's ${k} answers byte-identically to its pre-FW-20 verdict (${want}; got ${got})`, got === want);
  }
}

/* ---- 8. the flattened copy in app.html carries the type ---- */
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const block = /\/\*__DOCPROFILE_START__\*\/\n([\s\S]*?)\n\/\*__DOCPROFILE_END__\*\//.exec(app);
  ok("app.html carries the flattened docprofile block", !!block);
  ok("the embed carries docprofile/doctypes/staff-directory.mjs",
     block[1].includes("---- docprofile/doctypes/staff-directory.mjs ----"));
  ok("and DEFINES staffDirectory before registering it",
     block[1].indexOf("const staffDirectory = {") >= 0
     && block[1].indexOf("const staffDirectory = {") < block[1].indexOf("types.register(staffDirectory)"));
}

console.log(n + " pass");
