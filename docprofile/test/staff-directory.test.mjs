/* docprofile — the staff directory over REAL documents (N390, K573): the old suite
 * `civicos-ui/test/staff-directory.test.mjs` (FW-20) converted to requirement-named
 * tests at the module's interface, `docprofile/registry.mjs`, the entry the plane
 * imports.
 *
 * The fixtures are the old suite's, copied whole into ./fixtures/ so this suite does
 * not depend on a file the old battery's retirement removes:
 *   - `fw20-staff-directory.json`: nine REAL documents from the City of Oakland's
 *     public website bucket, fetched 2026-09-23 and read through the plane's own
 *     `op=acquire` with the pdf-worker bundle bound; each `text` is the plane's
 *     `op=pdfstructure` text field for those bytes, whole. Four are directories; five
 *     are the look-alikes the type was fenced against (a candidate contact list, a
 *     meeting schedule that names City staff in every row, a directory of businesses,
 *     a roster with no contact points, a provider contact list).
 *   - `fw18-doctypes.json`: FW-18's five real documents (two sets of minutes, an
 *     agenda, an instrument, a staff report), for the multi-class packet and for the
 *     landed types' verdicts beside the directory.
 * Where the documents come from is provenance, not a place in the product (layers.md,
 * "No jurisdiction in the product", rule 6). The test-only profiles are ./fixtures.mjs's.
 *
 * The old suite's section 8 (the flattened copy in `civicos-ui/app.html`) read source
 * text and is dropped (P7). Which old assertions each test carries is in the job
 * record, `build/jobs/T17/docprofile.md`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as dp from "../registry.mjs";
import { PORT_ALDER, LAKEMONT, view, EMPTY } from "./fixtures.mjs";

const { identify, doctypeFor, readText, doctypes, CONFIDENCE, CONTRACT, EVENTS } = dp;

const load = (f) => JSON.parse(fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url), "utf8"));
const FX = load("fw20-staff-directory.json");
const FW18 = load("fw18-doctypes.json");
const doc = (k) => FX.documents[k];
const directory = () => doctypes().find((t) => t.key === "staff_directory");

const POS = ["directory_nss", "directory_nsd", "directory_cro", "directory_benefits"];
const NEG = ["neg_candidates", "neg_schedule", "neg_recycling", "neg_wdb", "neg_medical"];
const PA = view(PORT_ALDER);
const LK = view(LAKEMONT);

/* One reading per document, as `op=acquire` makes it: the producer's text field, no view
   (the plane's caller today; K39). */
const R = Object.fromEntries([...POS, ...NEG].map((k) => [k, readText(doc(k).text, {})]));
const verdict = (r) => `${r.doctype.type.key}|${r.doctype.confidence}|${(r.doctype.also || []).map((x) => x.key).join(",")}`;
/* The distinct addresses of a text, and how many sit at its commonest domain. */
function addresses(text) {
  const all = new Set((text.match(/\b[A-Za-z0-9][A-Za-z0-9._%+-]*@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/g) || [])
    .map((a) => a.toLowerCase()));
  const byDomain = new Map();
  for (const a of all) { const d = a.split("@")[1]; byDomain.set(d, (byDomain.get(d) || 0) + 1); }
  return { all: all.size, atDomain: Math.max(0, ...byDomain.values()) };
}

test("R4 the real corpus is present and whole: nine documents, each fetched, hashed, read at a recorded tier, not empty", () => {
  assert.ok(Object.keys(FX.documents).length >= 9, "floored at nine documents");
  for (const k of [...POS, ...NEG]) {
    const d = doc(k);
    assert.ok(d, `${k}: present`);
    assert.match(d.source, /^https:\/\/cao-94612\.s3\.amazonaws\.com\//, `${k}: names the address it was fetched from`);
    assert.match(d.sha256, /^[0-9a-f]{64}$/, `${k}: carries the sha256 of the bytes read`);
    assert.ok([1, 2, 3].includes(d.tier), `${k}: read at a tier the plane records`);
    assert.ok(d.text.document.length > 500, `${k}: the text is not empty`);
    assert.ok(d.text.pages.length > 0 && d.text.pages.every((p) => Number.isInteger(p.page)),
      `${k}: the pages keep the producer's own page indices`);
    assert.equal(R[k].determined, true, `${k}: a reading is produced`);
    assert.equal(R[k].parse_error, null, `${k}: the reader ran without throwing`);
  }
});

test("R4 every real directory reads as staff_directory, CERTAIN when it names itself and LIKELY when it does not, with its evidence", () => {
  for (const k of POS) {
    const dt = R[k].doctype;
    assert.equal(dt.type.key, "staff_directory", k);
    assert.ok(dt.signals.length >= 1, `${k}: names the evidence that earned it`);
    assert.match(dt.signals[0], /distinct contact address\(es\) at one organisation's domain/, k);
  }
  for (const k of ["directory_nss", "directory_nsd", "directory_benefits"])
    assert.equal(R[k].doctype.confidence, CONFIDENCE.CERTAIN, `${k}: names itself in its title line`);
  assert.equal(R.directory_cro.doctype.confidence, CONFIDENCE.LIKELY,
    "directory_cro: its first line is a column header, so it does not name itself, and the ladder says so");
  // through identify() then doctypeFor(), as the stack axis hands it on: the directory is a content fact
  const t = doc("directory_nss").text.document;
  const stack = identify({ text: t });
  assert.equal(doctypeFor({ text: t, handler: stack.handler, kind: stack.kind }).type.key, "staff_directory");
});

test("R4 R5 no real look-alike reads as staff_directory in any degree, primary or also, and each trap is really armed", () => {
  for (const k of NEG) {
    assert.notEqual(R[k].doctype.type.key, "staff_directory", `${k}: not a directory`);
    assert.ok(!R[k].doctype.also.some((x) => x.key === "staff_directory"), `${k}: not even an also`);
  }
  // the traps' inputs are present, so each refusal is about the rule and not an empty fixture
  const cand = doc("neg_candidates").text.document;
  assert.ok((cand.match(/@/g) || []).length >= 20 && (cand.match(/\(\d{3}\)\s?\d{3}-\d{4}/g) || []).length >= 20,
    "the candidate list is people with addresses and phones");
  const smallest = Math.min(...POS.map((k) => addresses(doc(k).text.document).atDomain));
  const sched = addresses(doc("neg_schedule").text.document);
  assert.ok(sched.atDomain >= 5 && sched.atDomain / sched.all >= 0.8,
    "the meeting schedule has a directory's density at one organisation's domain, so density alone cannot refuse it");
  assert.ok(smallest >= 5, "every real directory clears the density floor");
  assert.ok((doc("neg_schedule").text.document.match(/\b(?:April|May|June)\s+\d{1,2}\b/g) || []).length >= 10,
    "and its rows are dated: the schedule fence is what refuses it");
  const rec = doc("neg_recycling").text.document;
  assert.match(rec.split("\n").slice(0, 3).join(" "), /DIRECTORY/, "the recycling directory names itself a directory");
  assert.match(rec, /@oaklandca\.gov/i, "and references a City staff contact");
});

test("R4 the recognition floors are fixed: five addresses at one domain, four-fifths of all, and no dated rows", () => {
  const rows = (n, domain, from = 0) => Array.from({ length: n }, (_, i) =>
    `Person ${from + i} p${from + i}@${domain} 555-100-${String(from + i).padStart(4, "0")}`);
  const key = (lines) => doctypeFor({ text: ["Staff Directory", ...lines].join("\n"), view: EMPTY }).type.key;
  assert.equal(key(rows(4, "harbor.test")), "generic", "four addresses are a signature block, not a body");
  assert.equal(key(rows(5, "harbor.test")), "staff_directory", "five are a body");
  assert.equal(key([...rows(8, "harbor.test"), ...rows(2, "mail.test", 8)]), "staff_directory", "8 of 10 is one organisation");
  assert.equal(key([...rows(7, "harbor.test"), ...rows(3, "mail.test", 7)]), "generic", "7 of 10 is not");
  const dated = rows(6, "harbor.test").map((l, i) => `June ${i + 1} meeting, contact ${l}`);
  assert.equal(key(dated), "generic", "a list whose rows are dated is a schedule that names its contacts");
});

test("R5 also is asked of every real directory and carried into its reading; a packet holding an instrument and a directory states both", () => {
  for (const k of POS) {
    assert.ok(Array.isArray(R[k].doctype.also), `${k}: the also pass answered`);
    assert.equal(R[k].parsed.also_satisfies.join(), R[k].doctype.also.map((x) => x.key).join(),
      `${k}: the reader carries it into the reading`);
    for (const t of doctypes()) {
      if (t.key === "staff_directory" || t.fallback) continue;
      const d = t.detect({ text: doc(k).text.document });
      assert.equal(R[k].doctype.also.some((x) => x.key === t.key), !!d.match, `${k}: ${t.key}`);
    }
  }
  /* Real text on both sides; only the adjacency is composed: the shape of a staff
     report or agenda packet carrying its division's directory as an attachment. */
  const packet = FW18.documents.regulation.text.document + "\n" + doc("directory_nss").text.document;
  const pr = readText(packet, {});
  assert.equal(pr.doctype.type.key, "regulation", "the instrument first, in registration order");
  assert.ok(pr.doctype.also.some((x) => x.key === "staff_directory"), "and also a staff directory");
  assert.ok(pr.parsed.also_satisfies.includes("staff_directory"), "and the instrument's reading says so");
});

test("R4 R5 the landed types answer on FW-18's real documents exactly as before the directory type existed", () => {
  /* Pinned from origin/main at 02603e88, before FW-20 registered the directory. */
  const PIN = {
    minutes: "meeting_minutes|certain|meeting_agenda",
    minutes_council: "meeting_minutes|certain|",
    agenda: "meeting_agenda|certain|",
    regulation: "regulation|certain|",
    staff_report: "staff_report|certain|regulation",
  };
  for (const [k, want] of Object.entries(PIN)) assert.equal(verdict(readText(FW18.documents[k].text, {})), want, k);
});

test("R6 the directory takes no local fact from the view: every real document reads the same under any view, and another organisation's directory is one", () => {
  for (const k of [...POS, ...NEG]) {
    const want = verdict(R[k]);
    const keys = JSON.stringify(R[k].parsed.entities.map((e) => e.key));
    for (const [name, v] of [["Port Alder", PA], ["Lakemont", LK], ["no profile", EMPTY]]) {
      const r = readText(doc(k).text, { view: v });
      assert.equal(r.doctype.type.key === "staff_directory", R[k].doctype.type.key === "staff_directory", `${k} under ${name}`);
      if (R[k].doctype.type.key === "staff_directory") {
        assert.equal(`${r.doctype.type.key}|${r.doctype.confidence}`, want.split("|").slice(0, 2).join("|"), `${k} under ${name}`);
        assert.equal(JSON.stringify(r.parsed.entities.map((e) => e.key)), keys, `${k} under ${name}`);
      }
    }
  }
  // the same real directories, their organisation's domain replaced by a made-up one: the
  // recogniser holds no place's domain, so they read exactly as before
  for (const k of POS) {
    const own = new RegExp(R[k].parsed.domain.replace(/\./g, "\\."), "gi");
    const moved = { ...doc(k).text,
      document: doc(k).text.document.replace(own, "portalder.test"),
      pages: doc(k).text.pages.map((p) => ({ ...p, text: p.text.replace(own, "portalder.test") })) };
    const r = readText(moved, { view: PA });
    assert.equal(`${r.doctype.type.key}|${r.doctype.confidence}`, verdict(R[k]).split("|").slice(0, 2).join("|"), k);
    assert.equal(r.parsed.domain, "portalder.test", k);
    assert.equal(r.parsed.entities.length, R[k].parsed.entities.length, k);
  }
});

test("R29 staff_directory is registered after the substance types and before the fallback, versioned, watching MEMBERSHIP", () => {
  const t = directory();
  assert.ok(t, "registered");
  assert.equal(t.contract, CONTRACT.MEMBERSHIP, "a directory is a list");
  assert.ok(Number.isInteger(t.version));
  const keys = doctypes().map((x) => x.key);
  assert.ok(keys.indexOf("staff_directory") > keys.indexOf("regulation"));
  assert.ok(keys.indexOf("staff_directory") > keys.indexOf("staff_report"));
  assert.ok(keys.indexOf("staff_directory") < keys.indexOf("generic"));
});

test("R19 R35 a real directory's reading: entries keyed by address, never a name, each line verbatim, the title read or its absence said", () => {
  const p = R.directory_nss.parsed;
  assert.equal(p.entities.length, 12, "the NSS directory's twelve distinct addresses");
  assert.equal(p.domain, "oaklandca.gov");
  assert.equal(p.entries, 12);
  for (const k of POS) {
    const ents = R[k].parsed.entities;
    assert.ok(ents.length >= 5, `${k}: at least the floor's entries`);
    assert.ok(ents.every((e) => /^contact:[^@\s]+@[^@\s]+$/.test(e.key) && e.kind === "contact"), `${k}: keyed by address`);
    assert.ok(ents.every((e) => typeof e.facts.organisation === "boolean"), `${k}: each says whether it is at the domain`);
  }
  const moore = p.entities.find((e) => e.key === "contact:amoore@oaklandca.gov");
  assert.match(moore.facts.line, /Angela Moore/, "an entry carries its own line verbatim");
  assert.equal(moore.facts.phone, "238-6822", "and the phone read on that line");
  assert.equal(p.title, "Neighborhood Services Staff Beat & Program Directory");
  assert.equal(p.title_why, null);
  assert.equal(R.directory_cro.parsed.title, null, "the CRO directory does not name itself");
  assert.match(R.directory_cro.parsed.title_why, /no line among the first five/, "and the reading says why");
  // the two-column page: the line an address was read on, both columns, never a guessed pairing
  const nsd = R.directory_nsd.parsed.entities.find((e) => e.key === "contact:arichards@oaklandca.gov");
  assert.equal(nsd.facts.line, "arichards@oaklandca.gov amoore@oaklandca.gov");
  // an address at another domain is an entry marked as such, not dropped
  const extra = directory().parse({ text: doc("directory_nss").text.document + "\nA. Person outside@example.org" });
  assert.ok(extra.entities.some((e) => e.key === "contact:outside@example.org" && e.facts.organisation === false));
});

test("R20 R34 every real directory entry says where it was read, a page this document emitted, from the producer's own map", () => {
  for (const k of POS) {
    const pages = new Set(doc(k).text.pages.map((x) => x.page));
    for (const e of R[k].parsed.entities) {
      assert.ok(e.source, `${k}: ${e.key} carries where it was read`);
      assert.equal(e.source.kind, "pdf-page");
      assert.equal(e.source.rect, null, "tier-2 text carries no geometry");
      assert.ok(pages.has(e.source.page), `${k}: ${e.key} is on a page the document emitted`);
      const page = doc(k).text.pages.find((x) => x.page === e.source.page);
      assert.ok(page.text.toLowerCase().includes(e.facts.address), `${k}: ${e.key} is on that page`);
    }
  }
  assert.equal(new Set(R.directory_benefits.parsed.entities.map((e) => e.source.page)).size, 2,
    "the two-page benefits sheet places entries on both its pages");
});

test("R14 R16 R33 assess on a real directory: gone, added and re-assigned entries named, the unchanged said, a read of nothing claims nothing", () => {
  const t = directory();
  const a = R.directory_nss.parsed;
  const b = JSON.parse(JSON.stringify(a));
  b.entities = b.entities.filter((e) => e.key !== "contact:ldieng@oaklandca.gov");
  b.entities.find((e) => e.key === "contact:bivey@oaklandca.gov").facts.line = "Brenda Ivey 1X bivey@oaklandca.gov 238-3091";
  b.entities.push({ key: "contact:someone@oaklandca.gov", kind: "contact", label: "someone", facts: { line: "x" } });
  const r = t.assess(a, b);
  const has = (type, key) => r.events.some((e) => e.type === type && e.key === key);
  assert.ok(has("item_pulled", "contact:ldieng@oaklandca.gov"), "an address no longer listed");
  assert.ok(has("item_added", "contact:someone@oaklandca.gov"), "a new address");
  assert.ok(has("item_changed", "contact:bivey@oaklandca.gov"), "a re-assigned entry");
  for (const e of r.events) assert.equal(e.significance, EVENTS[e.type].significance, "graded by the catalogue");
  assert.equal(r.meaningful, true);
  assert.deepEqual(r.confirmed, { entries: b.entities.length, intact: a.entities.length - 2 });
  const same = t.assess(a, JSON.parse(JSON.stringify(a)));
  assert.deepEqual(same.events, []);
  assert.match(same.why, /same addresses/);
  for (const [x, y] of [[{ entities: [] }, { entities: [] }], [a, { entities: [] }], [{ entities: [] }, a]]) {
    const e = t.assess(x, y);
    assert.equal(e.meaningful, null);
    assert.deepEqual(e.events, []);
  }
});
