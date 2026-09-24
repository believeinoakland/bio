/* contradiction-corpus.mjs — M0-71: §7's LABELLED FIXTURE for the contradiction
 * detector's over-strictness arm (CONTRADICTION-IDENTIFY-DESIGN.md §7).
 *
 * Every entry is ONE pair a pairing key (§4) will form over the record the suite
 * builds from it, and the label a member would give it (§5's vocabulary). The
 * label is the fixture author's, not a finding about any real document: every
 * name, figure and date below is SYNTHETIC, shaped like what Oakland's records
 * produce, and none of it is a statement about a real body.
 *
 * `shape` names which of §7's required shapes the entry stands for, so the
 * corpus can be checked for coverage of §7's list rather than by count alone:
 *   precision.bob      Bob's own example, "reduced a little" / "dropped a lot"
 *   precision.round    a rounded figure against the exact one
 *   precision.approx   "approximately" against a stated number
 *   precision.summary  a summary against the table it summarises
 *   world.rule-act     a rule's requirement against a record of the contrary act
 *   world.then-now     one body's statement in one month against its contrary later
 *   record.subject     two accepted claims on one subject that cannot both be so
 *   record.referent    two accepted claims reading one passage two ways
 *   unrelated.entity   same entity (or subject, or passage), different matter
 *
 * WRITTEN AFTER `contradiction-judge-baseline.mjs` was committed (63b2418f), and
 * not edited to suit it: the first measurement is whatever that rule makes of
 * this text, recorded as measured.
 */

/* K1 — one inquiry, a `supports` leg against a `cuts_against` leg. Sides are two
   documents' passages. Feeds WORLD. */
export const K1 = [
  { id: "k1-bob", shape: "precision.bob", label: "precision",
    a: "Park maintenance spending was reduced a little in the adopted budget.",
    b: "Park maintenance spending dropped a lot in the adopted budget." },
  { id: "k1-approx", shape: "precision.approx", label: "precision",
    a: "The Sewer Fund transferred $4.2 million to the general fund in March.",
    b: "The Sewer Fund transferred about $4 million to the general fund in March." },
  { id: "k1-rule", shape: "world.rule-act", label: "world",
    a: "Ordinance 24680 requires the department to report every fund transfer to the council each quarter.",
    b: "The department made the fund transfer and reported nothing to the council for the full year." },
  { id: "k1-then", shape: "world.then-now", label: "world",
    a: "In March the department stated the pool would stay open through the summer.",
    b: "In October the department stated the pool had been closed since June." },
  { id: "k1-far", shape: "unrelated.entity", label: "unrelated",
    a: "The library branch on Fruitvale Avenue extended its weekend hours.",
    b: "The ordinance sets the fee for a sidewalk vending permit." },
  { id: "k1-near", shape: "unrelated.entity", label: "unrelated",
    a: "The Sewer Fund paid for the pipe replacement on 14th Street.",
    b: "The Sewer Fund auditor was appointed by the city administrator." },
];

/* K2 — two inquiries on one registered subject, each with an ACCEPTED reading
   carrying a claim. Sides are OUR claims. Feeds RECORD. */
export const K2 = [
  { id: "k2-only", shape: "record.subject", label: "record",
    a: "Measure Q parcel tax revenue is spent only on park maintenance.",
    b: "Measure Q parcel tax revenue paid for police overtime in 2024." },
  { id: "k2-never", shape: "record.subject", label: "record",
    a: "The city council approved the Sewer Fund transfer on March 2, 2026.",
    b: "The city council never approved the Sewer Fund transfer." },
  { id: "k2-expire", shape: "record.subject", label: "record",
    a: "The homeless services contract was renewed for three years.",
    b: "The homeless services contract was allowed to expire at the end of its term." },
  { id: "k2-round", shape: "precision.round", label: "precision",
    a: "Measure Q raised roughly $30 million in its first year.",
    b: "Measure Q raised $29,850,000 in its first year." },
  { id: "k2-bob", shape: "precision.bob", label: "precision",
    a: "Emergency response times improved slightly after the dispatch change.",
    b: "Emergency response times improved significantly after the dispatch change." },
  { id: "k2-port", shape: "unrelated.entity", label: "unrelated",
    a: "The Port of Oakland board meets on the first Thursday of each month.",
    b: "The Port of Oakland received a federal grant for shore power at its terminals." },
  { id: "k2-rap", shape: "unrelated.entity", label: "unrelated",
    a: "The Rent Adjustment Program publishes its annual allowable increase each February.",
    b: "The Rent Adjustment Program hearing officers are city employees." },
];

/* K3 — two inquiries whose ACCEPTED readings rest on the SAME passage. Sides are
   OUR claims; `passage` is the text both rest on (context, §5). Feeds RECORD. */
export const K3 = [
  { id: "k3-vote", shape: "record.referent", label: "record",
    passage: "The council may transfer up to 10 percent of the fund balance by a two-thirds vote of its members.",
    a: "The passage allows a transfer from the fund by a simple majority of the council.",
    b: "The passage requires a two-thirds vote of the council for any transfer from the fund." },
  { id: "k3-due", shape: "record.referent", label: "record",
    passage: "The annual audit report shall be delivered to the council no later than June 30.",
    a: "The passage makes the annual audit report due to the council by June 30.",
    b: "The passage makes the annual audit report due to the council by September 30." },
  { id: "k3-tenth", shape: "precision.approx", label: "precision",
    passage: "Transfers shall not exceed 10 percent of the fund balance at the close of the prior fiscal year.",
    a: "The passage caps a transfer at 10 percent of the fund balance.",
    b: "The passage caps a transfer at a tenth of the fund balance." },
  { id: "k3-table", shape: "precision.summary", label: "precision",
    passage: "Table 4: ending fund balance, fiscal year 2025, $1,204,311.",
    a: "The budget table shows the fund ended the year with $1,204,311.",
    b: "The budget table shows the fund ended the year with about $1.2 million." },
  { id: "k3-admin", shape: "unrelated.entity", label: "unrelated",
    passage: "The Public Works director administers the fund, whose fiscal year begins July 1.",
    a: "The passage names the Public Works director as the fund administrator.",
    b: "The passage sets the fiscal year of the fund to begin on July 1." },
  { id: "k3-staff", shape: "unrelated.entity", label: "unrelated",
    passage: "Finance staff recommend two additional code inspectors for the rental inspection program.",
    a: "The staff report recommends hiring two additional code inspectors.",
    b: "The staff report was prepared by the finance department." },
];

/* K4 — two cited documents established on ONE entity, of different doctype or
   different date as their readers state them. Sides are two documents'
   passages. Feeds WORLD. */
export const K4 = [
  { id: "k4-rule", shape: "world.rule-act", label: "world",
    a: { doctype: "regulation", date: "2026-03-02",
         text: "Ordinance 13579 requires a public hearing before any change to parking meter rates." },
    b: { doctype: "meeting_minutes", date: "2026-05-10",
         text: "The council adopted new parking meter rates on the consent calendar with no public hearing." } },
  { id: "k4-then", shape: "world.then-now", label: "world",
    a: { doctype: "staff_report", date: "2026-03-15",
         text: "The department states the Lakeside pool will remain open all year." },
    b: { doctype: "staff_report", date: "2026-10-15",
         text: "The department states the Lakeside pool will close for the winter months." } },
  { id: "k4-round", shape: "precision.round", label: "precision",
    a: { doctype: "budget", date: "2026-06-20",
         text: "The adopted budget allocates $12,487,000 to street paving." },
    b: { doctype: "meeting_minutes", date: "2026-06-24",
         text: "Councilmembers noted the adopted budget puts $12.5 million into street paving." } },
  { id: "k4-summary", shape: "precision.summary", label: "precision",
    a: { doctype: "meeting_agenda", date: "2026-04-07",
         text: "The item summary says police overtime costs rose by roughly a third." },
    b: { doctype: "staff_report", date: "2026-04-01",
         text: "Police overtime costs rose from $3,000,000 to $4,020,000, an increase of 34 percent." } },
  { id: "k4-approx", shape: "precision.approx", label: "precision",
    a: { doctype: "meeting_minutes", date: "2026-05-20",
         text: "Approximately 1,200 residents attended the budget hearings." },
    b: { doctype: "staff_report", date: "2026-05-28",
         text: "Attendance at the budget hearings totalled 1,187 residents." } },
  { id: "k4-zoo", shape: "unrelated.entity", label: "unrelated",
    a: { doctype: "regulation", date: "2026-01-12",
         text: "The Oakland Zoo lease with the city runs through 2045." },
    b: { doctype: "meeting_minutes", date: "2026-02-03",
         text: "The Oakland Zoo opened a new veterinary hospital to visitors." } },
  { id: "k4-kaiser", shape: "unrelated.entity", label: "unrelated",
    a: { doctype: "staff_report", date: "2026-07-01",
         text: "The Kaiser Convention Center roof repair contract was awarded to a local firm." },
    b: { doctype: "regulation", date: "2026-07-09",
         text: "The Kaiser Convention Center is listed on the local historic register." } },
];

/* The shapes §7 requires, each of which must be present at least once. */
export const REQUIRED_SHAPES = ["precision.bob", "precision.round", "precision.approx", "precision.summary",
  "world.rule-act", "world.then-now", "record.subject", "unrelated.entity"];
