/* Writes `fixtures/codifier-answers.json`, what a member reads in each codifier capture
 * (R17), so the test checks a reading against answers that are not the reader's own:
 *   node doctypes/test/make-codifier-answers.mjs
 *
 * SECTIONS AND SUBSECTIONS come from the codifier's markup (./codifier.mjs, `answersOf`),
 * corrected by hand only where the markup's indentation contradicts the printed sequence
 * (CORRECTED below, each with what was printed).
 *
 * DEFINITIONS AND EXCEPTIONS: every passage in the definitional and exceptive voice, by term
 * or by the words it opens with, with the section holding it and the section numbers it
 * cites. They were taken from the reading of 2026-10-05 and then checked by DOCTYPES #1 one
 * by one against the printed text (`textOf`) and against a plain search of every capture for
 * "means", "includes", "except as", "notwithstanding" and "not apply"; REVIEWED records the
 * judgments made. A later change to the reader that moves one fails the test until a person
 * re-checks that answer here: the file is not regenerated to make a test pass. */
import fs from "node:fs";
import { servedDocuments, answersOf, textOf } from "./codifier.mjs";
import { regulation } from "../index.mjs";
import { HELD, withSections, CODIFIER_SECTIONS, CHARTER } from "./fixtures.mjs";

/* Where the markup's indentation is not what was printed, the member's reading (the
   subsection paths, relative to the section). */
const CORRECTED = {
  /* Printed: B. … 3. then "4.", "5.", "6." with their items; the markup indents "4." at the
     section's top level, so "5." and "6." hang off a top-level "4". All three are B's. */
  "8.22.070": (paths) => paths.map((p) => (p[0] !== "4" ? p : p.length === 1 ? ["B", "4"] : ["B", ...p.slice(1)])),
  /* Printed: "A." then "1." to "5." with their items, "B." then "1." … "f." then "2.",
     "3."; the markup indents "A." deeper than "1.", "n."/"o." under "m.", "4." under "3.",
     and B's "2."/"3." under its "1.". Each is read as printed. */
  "8.22.090": (paths) => paths.map((p) => {
    if (p[0] === "A" || p[0] === "B") {
      if (p[0] === "B" && p[1] === "1" && (p[2] === "2" || p[2] === "3")) return ["B", p[2]];
      return p;
    }
    let q = ["A", ...p];
    if (q[1] === "1" && q[2] === "m" && q.length === 4) q = ["A", "1", q[3]];
    if (q[1] === "3" && q[2] === "4") q = ["A", "4", ...q.slice(3)];
    if (q[1] === "3" && q[2] === "5") q = ["A", "5", ...q.slice(3)];
    return q;
  }),
  /* Printed: "i." and "ii." as the two items of the "Current Business Tax Certificate"
     definition, with the definitions after them at the section's own level; the markup
     marks the items as subsections of the section. They are list items of one definition. */
  "8.22.020": () => [],
};

/* The judgments made in reading definitions and exceptions. */
const REVIEWED = [
  "8.22.020: \"Board\" and \"Residential Rent Adjustment Board\" means … defines both terms.",
  "8.22.020: \"Base occupancy level\" is defined twice (its own entry, and \"base occupancy level\" for a unit with a lease limit): two entries.",
  "8.22.020: \"Covered Unit\" means … and \"Covered Unit\" includes … are two definitional passages: two entries.",
  "2.20.130 B.1: \"If notwithstanding the final approval …\" is in the exceptive voice R14 names, and is listed.",
  "8.22.020: the exceptive passage inside \"CPI Rent Adjustment\" is listed (\"except as\" …).",
];

const out = { note: "What a member reads in each codifier capture (doctypes R17); see make-codifier-answers.mjs.",
              reviewed: REVIEWED, documents: {} };
const VIEW = withSections(HELD, CODIFIER_SECTIONS, [CHARTER]);
for (const { doc } of servedDocuments()) {
  const a = answersOf(doc);
  const num = a.sections[0].number;
  const holderOf = (para) => [...a.sections].reverse().find((s) => s.para <= para).number;
  let subs = a.markers.map((m) => m.path);
  if (CORRECTED[num]) subs = CORRECTED[num](subs);
  const secs = a.markers.map((m) => holderOf(m.para));
  const text = textOf(doc).document;
  const r = regulation.parse({ text, view: VIEW });
  const opens = (x) => text.slice(x.start, x.end).split(/\s+/).slice(0, 6).join(" ");
  out.documents[doc.Id] = {
    title: doc.Title,
    sections: a.sections.map((s) => ({ number: s.number, heading: s.heading, para: s.para })),
    subsections: subs.map((p, i) => `${secs[Math.min(i, secs.length - 1)]}|${p.join(".")}`),
    definitions: r.definitions.map((d) => ({ term: d.term, section: d.section && d.section.join(".") })),
    exceptions: r.exceptions.map((e) => ({ opens: opens(e), section: e.section && e.section.join("."), cites: e.cites })),
  };
}
fs.writeFileSync(new URL("./fixtures/codifier-answers.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(Object.keys(out.documents).length, "documents");
