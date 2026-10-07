/* The 50 captured policies (fixtures/policies.json) and the member's answers (fixtures/policies-answers.json), which
 * R35's tests read under the held first profile (jurisdictions R67, R69; K1933). `MEASURED_VIEW` is the series and
 * labels as first measured on these 50 documents, before that profile held them (the job record's first measurement,
 * K1924): kept as that record, read by no test. */
import fs from "node:fs";

export const POLICIES = JSON.parse(fs.readFileSync(new URL("./fixtures/policies.json", import.meta.url), "utf8"));
export const ANSWERS = JSON.parse(fs.readFileSync(new URL("./fixtures/policies-answers.json", import.meta.url), "utf8")).answers;

const p = (re, flags) => (flags ? { re, flags } : { re });
const label = (field, re, flags) => ({ field, pattern: p(re, flags), basis: "MEASURED: doctypes R35, the 50 captured policies, 2026-10-07" });

export const MEASURED_VIEW = {
  standard_sources: [
    { source: "Oakland Administrative Instructions", kind: "policy", issuer: "City Administrator", level: "city", key: "oakland",
      series: { key: "ai", label: "Administrative Instruction" },
      cite: p("(?:Administrative\\s+Instruction|A\\.?I\\.?)\\s+(?:No\\.?\\s*)?(?<number>\\d{1,4})", "i"), basis: "MEASURED" },
    { source: "OPD Departmental General Orders", kind: "policy", issuer: "Chief of Police", level: "city", key: "opd",
      series: { key: "dgo", label: "Departmental General Order" },
      cite: p("(?:Departmental\\s+General\\s+Order|DGO)\\s+(?<number>[A-Z]-\\d{1,2}(?:\\.\\d{1,2})?)", "i"), basis: "MEASURED" },
    { source: "OPD Special Orders", kind: "policy", issuer: "Chief of Police", level: "city", key: "opd",
      series: { key: "so", label: "Special Order" },
      cite: p("(?:Special\\s+Order|SO)\\s+(?:No\\.?\\s*)?(?<number>\\d{4})", "i"), basis: "MEASURED" },
  ],
  vocabulary: {
    policy_headers: [
      label("number", "NUMBER"),
      label("title", "SUBJECT(?:/AGENCY)?"), label("title", "Index as"),
      label("effective", "EFFECTIVE DATE"), label("effective", "Effective Date"), label("effective", "EFFECTIVE"),
      label("effective", "DATE"), label("effective", "Rev\\."), label("effective", "New Order"),
      label("supersedes", "SUPERSEDES?"),
      label("reference", "REFERENCE"), label("reference", "Ref"),
      label("coordinator", "Evaluation Coordinator"), label("coordinator", "Coordinator"),
      label("review_due", "Evaluation Due Date"), label("review_due", "Evaluation Date"),
      label("revision_cycle", "Automatic Revision Cycle"),
    ],
  },
};

/** A field's text as compared with a member's: case, white space and a trailing colon do not count. */
export const same = (a, b) => String(a || "").toLowerCase().replace(/\s+/g, "").replace(/[:.]+$/, "")
  === String(b || "").toLowerCase().replace(/\s+/g, "").replace(/[:.]+$/, "");

/** One header reading against the member's: each field the member reads, right or wrong, and each the reader
 *  read that the member does not. */
export function score(header, answer) {
  const fields = {};
  const h = header || {};
  for (const [f, want] of Object.entries(answer)) {
    const got = h[f];
    const ok = !got ? false
      : f === "type" ? got.series === want
      : f === "effective" || f === "review_due" ? (got.date || got.text) === want
      : same(got.text, want);
    fields[f] = { ok, want, got: got ? (f === "type" ? got.series : got.date || got.text) : null };
  }
  for (const f of ["number", "title", "effective", "supersedes", "reference", "coordinator", "review_due", "revision_cycle"])
    if (h[f] && !(f in answer)) fields[f] = { ok: false, want: null, got: h[f].date || h[f].text };
  return { ok: Object.values(fields).every((x) => x.ok), fields };
}

export const SECTION_ANSWERS = JSON.parse(fs.readFileSync(new URL("./fixtures/policies-answers.json", import.meta.url), "utf8")).sections;
const head = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
/** A reading's top-level sections against a member's: the same parts, in the same order, each heading opening as the
 *  member reads it (where the member's text shows the heading). */
export function scoreSections(sections, answer) {
  const top = (sections || []).filter((s) => s.path.length === 1);
  const ok = top.length === answer.length
    && answer.every((a, i) => top[i].number === a.number && (!a.heading || head(top[i].heading).startsWith(head(a.heading))));
  return { ok, want: answer.map((a) => a.number).join(","), got: top.map((s) => s.number).join(",") };
}
