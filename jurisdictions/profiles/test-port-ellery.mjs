/* The test profile (R22): the City of Port Ellery and Marlow County, a jurisdiction made up for tests.
 * Every basis is `TEST`. It supplies every section and vocabulary key the first profile supplies, with
 * different values in each, shares no host with it (all hosts are under the reserved `.example`
 * domain), and adds a captured crosswalk, a venue's evidence standard (R39) and attributed templates (R40),
 * which the first profile has none of. Its calendar (R41–R44, R45) has a holiday year for every office with
 * entries of that year for one office and for one venue, hours on an office and a venue, and both statuses.
 * Modules that take local facts are tested against it (`build/layers.md`, "No jurisdiction in the product",
 * rule 3). T33's sections and fields (R57) are here too, with values unlike the first profile's: two closure lists
 * with a rule naming one and observing the other, a one-day weekend, a venue's cutoff, outages and receipt rule,
 * every unit, direction and anchor, fiscal years, law ranks, proceedings, schemes, a lawful demand, recurrences. */
const R = String.raw;

/* R40: a template's whole attribution, as filing-templates reads a profile template (its R15); every blank in
   the texts below is one of filing-templates' blanks. */
const attributed = (id, use, text, review) => ({
  id, version: 1, use, text, notes: "A made-up template for tests.", authored_by: "Ada Example",
  contributors: ["Ben Example"], reviews: [review], approved_by: "Cy Example", approved_at: "2026-09-01", basis: "TEST",
});

export default {
  id: "test-port-ellery",
  name: "City of Port Ellery and Marlow County (test)",
  covers: ["City of Port Ellery", "Marlow County"],
  test: true,

  spaces: {
    enactment: {
      label: "act or bylaw number (P.E.)",
      forms: [
        { form: "pe", pattern: { re: R`^(?:P\.?E\.?\s*)?(\d{3,4})(?:\s*P\.?E\.?)?$`, flags: "i" },
          normal: [{ group: 1 }], clean: { spaces: "collapse" }, basis: "TEST" },
      ],
      kinds: [
        { kind: "act", prefix: { re: R`act\s+(?:no\.?\s*)?`, flags: "i" },
          floor: { first: 500, system: "ellery.minutes", basis: "TEST" }, basis: "TEST" },
        { kind: "bylaw", prefix: { re: R`bylaw\s+(?:no\.?\s*)?`, flags: "i" },
          floor: { first: 1200, system: "ellery.minutes", basis: "TEST" }, basis: "TEST" },
      ],
    },
    project: {
      label: "works order number",
      forms: [
        { form: "WO-####", pattern: { re: R`^WO-?(\d{4})$` }, normal: ["WO-", { group: 1 }],
          clean: { spaces: "remove", upper: true }, basis: "TEST" },
        { form: "E#####", pattern: { re: R`^(E\d{5})$` }, normal: [{ group: 1 }],
          clean: { spaces: "remove", upper: true }, basis: "TEST" },
      ],
    },
    fund: {
      label: "ledger fund number",
      forms: [
        { form: "###-##", pattern: { re: R`^(\d{3})-(\d{2})$` }, normal: [{ group: 1 }, "-", { group: 2 }],
          clean: { spaces: "remove" }, basis: "TEST" },
      ],
    },
    account: { label: "ledger account", forms: [
      { form: "A-####", pattern: { re: R`^A-?(\d{4})$`, flags: "i" }, normal: ["A-", { group: 1 }], clean: { spaces: "remove" }, basis: "TEST" }] },
    object: { label: "spending object", forms: [
      { form: "OBJ##", pattern: { re: R`^OBJ(\d{2})$`, flags: "i" }, normal: ["OBJ", { group: 1 }], clean: { spaces: "remove", upper: true }, basis: "TEST" }] },
    vendor: { label: "supplier number", forms: [
      { form: "S-#####", pattern: { re: R`^S-?0*(\d{1,5})$`, flags: "i" }, normal: ["S-", { group: 1, unpad: true }], clean: { spaces: "remove" }, basis: "TEST" }] },
    proceeding: { label: "court file number", forms: [
      { form: "MC-yy-####", pattern: { re: R`^MC-(\d{2})-(\d{4})$`, flags: "i" }, normal: ["MC-", { group: 1 }, "-", { group: 2 }],
        clean: { spaces: "remove", upper: true }, basis: "TEST" }] },
    person: { label: "registered person number", forms: [
      { form: "minute-person", pattern: { re: R`^P(\d{3})$`, flags: "i" }, normal: ["P", { group: 1 }], clean: { spaces: "remove", upper: true }, basis: "TEST" },
      { form: "bar-number", pattern: { re: R`^BAR(\d{5})$`, flags: "i" }, normal: ["BAR", { group: 1 }], clean: { spaces: "remove", upper: true }, basis: "TEST" }] },
    parcel: {
      label: "lot and block number",
      forms: [
        { form: "marlow-lot", pattern: { re: R`^(?:LOT)?0*(\d{1,4})\/0*(\d{1,3})([a-z])?$`, flags: "i" },
          normal: [{ group: 1, unpad: true }, "/", { group: 2, unpad: true }, { group: 3, upper: true, default: "" }],
          clean: { strip: [{ re: R`parcel\s*`, flags: "i" }], spaces: "remove" }, basis: "TEST" },
      ],
    },
  },

  systems: [
    { origin: "ellery.minutes", name: "the Port Ellery clerk's minute book",
      hosts: ["minutes.port-ellery.example"],
      links: { item: { re: R`^\/entry\/\d+$` }, file: { re: R`^\/papers\/[a-z0-9-]+\.pdf$`, flags: "i" } }, basis: "TEST" },
    { origin: "ellery.minutes", name: "the Port Ellery clerk's minute book, through the shared records API",
      hosts: ["api.records-host.example"], path: { re: R`^\/ellery\/`, flags: "i" }, basis: "TEST" },
    { origin: "ellery.ledger", name: "the Port Ellery general ledger",
      hosts: ["ledger.port-ellery.example"], basis: "TEST" },
    { origin: "marlow.lands", name: "the Marlow County lands register, republished by the city's portal",
      hosts: ["open.port-ellery.example"], path: { re: R`lots` },
      republishes: true, provenance_stated: false, basis: "TEST" },
    { origin: "marlow.lands", name: "the Marlow County lands register",
      hosts: ["lands.marlow-county.example"], basis: "TEST" },
  ],
  mixed_hosts: [
    { host: "www.port-ellery.example", why: "the city's general website, serving every department", basis: "TEST" },
  ],
  crosswalks: [
    { space: "project", forms: ["WO-####", "E#####"], pairs: [["WO-0001", "E10001"], ["WO-0002", "E10002"]],
      source: "0f".repeat(32), basis: "TEST" },
  ],

  vocabulary: {
    furniture: [
      { pattern: { re: R`^Port Ellery Town Hall$`, flags: "i" }, basis: "TEST" },
      { pattern: { re: R`^Marlow County Clerk$`, flags: "i" }, basis: "TEST" },
      { pattern: { re: R`^Open Minute$`, flags: "i" }, basis: "TEST" },
    ],
    bodies: [
      { pattern: { re: R`(Selectboard|Harbour Commission|Town Meeting)\s*$` }, basis: "TEST" },
    ],
    member_titles: [
      { pattern: { re: R`^Selectman`, flags: "i" }, basis: "TEST" },
      { pattern: { re: R`^Selectwoman`, flags: "i" }, basis: "TEST" },
    ],
    enactment_markers: [
      { pattern: { re: R`P\.?E\.?`, flags: "i" }, basis: "TEST" },
    ],
    codes: [
      { key: "pebl", label: "P.E. Bylaws", pattern: { re: R`Port\s+Ellery\s+Bylaws|P\.?E\.?B\.?L\.?`, flags: "i" },
        copy: "official", sections: { number: { re: R`\d+-\d+` }, separators: "-", markers: ["paren_numeral", "paren_letter", "roman"] }, basis: "TEST" },
    ],
    file_numbers: [
      { pattern: { re: R`M\d{3}\/\d{2}` }, system: "ellery.minutes", basis: "TEST" },
    ],
    report_titles: [
      { pattern: { re: R`^OFFICER'?S\s+MEMORANDUM\b`, flags: "i" }, basis: "TEST" },
    ],
    report_sections: [
      { pattern: { re: R`^PROPOSAL\b`, flags: "i" }, basis: "TEST" },
      { pattern: { re: R`^COSTS\b`, flags: "i" }, basis: "TEST" },
      { pattern: { re: R`^CONSULTATION\b`, flags: "i" }, basis: "TEST" },
    ],
    recommendation_openers: [
      { pattern: { re: R`\bThe\s+Officer\s+Proposes\b`, flags: "i" }, basis: "TEST" },
    ],
    template_blanks: [
      { pattern: { re: R`\[INSERT\s+[A-Z ]+\]`, flags: "i" }, basis: "TEST" },
    ],
    amending: [
      { pattern: { re: R`\bis\s+hereby\s+varied\b`, flags: "i" }, relation: "amends", basis: "TEST" },
      { pattern: { re: R`\bis\s+hereby\s+inserted\b`, flags: "i" }, relation: "adds", basis: "TEST" },
      { pattern: { re: R`\bis\s+hereby\s+revoked\b`, flags: "i" }, relation: "repeals", basis: "TEST" },
      { pattern: { re: R`\bshall\s+be\s+renumbered\b`, flags: "i" }, relation: "renumbers", basis: "TEST" },
      { pattern: { re: R`\bis\s+consolidated\s+into\b`, flags: "i" }, relation: "recodifies", basis: "TEST" },
    ],
    meeting_markers: [
      { marker: "cancelled", pattern: { re: R`\(POSTPONED\)\s*$`, flags: "i" }, basis: "TEST" },
      { marker: "special", pattern: { re: R`\bExtraordinary\b`, flags: "i" }, basis: "TEST" },
      { marker: "concurrent", pattern: { re: R`\bJoint\s+Sitting\b`, flags: "i" }, basis: "TEST" },
    ],
    body_variants: [
      { pattern: { re: R`^(?:The\s+)?Selectboard(?:\s+of\s+Port\s+Ellery)?\b`, flags: "i" }, organisation: "selectboard", basis: "TEST" },
      { pattern: { re: R`Harbour\s+(?:Commission|Commissioners)`, flags: "i" }, organisation: "harbour_commission", basis: "TEST" },
    ],
    roster_words: [
      { pattern: { re: R`\bList\s+of\s+Officers\b`, flags: "i" }, basis: "TEST" },
      { pattern: { re: R`\bWho'?s\s+Who\s+at\s+Town\s+Hall\b`, flags: "i" }, basis: "TEST" },
    ],
    roster_headers: [
      { pattern: { re: R`^Officer\s+\|\s+Post$`, flags: "i" }, basis: "TEST" },
    ],
    staff_titles: [
      { pattern: { re: R`\b(?:Town\s+Reeve|Harbour\s+Master|Deputy\s+Clerk)\b`, flags: "i" }, basis: "TEST" },
    ],
  },

  practice: { minutes_due_days: { value: 30, count: "calendar", basis: "TEST" } },
  locale: { value: "en-GB", basis: "TEST" },
  time_zone: { value: "America/Halifax", status: "researched", basis: "TEST" },
  search_terms: [{ term: "harbour", basis: "TEST" }],
  records_laws: [
    { level: "state", name: "Freedom of Records Act (test)", citation: "Test Stat. § 1.100", basis: "TEST" },
    { level: "city", name: "Port Ellery Open Government Bylaw", citation: "P.E.B.L. § 4", basis: "TEST" },
    { level: "federal", name: "National Records Access Act (test)", citation: "Test U.S.C. § 552", basis: "TEST" },
  ],

  standard_sources: [
    { source: "Port Ellery Bylaws", kind: "ordinance", issuer: "Port Ellery Selectboard",
      level: "city", cite: { re: R`\bP\.?E\.?B\.?L\.?\s*§\s*\d+`, flags: "i" }, code: "pebl", key: "selectboard", basis: "TEST" },
    { source: "Marlow County Budget Commitments", kind: "commitment", issuer: "Marlow County Commission", level: "county",
      cite: { re: R`\bMCBC\s+\d{4}-\d+` }, basis: "TEST" },
  ],
  counterparties: [
    { role: "Town Clerk", body: "City of Port Ellery", level: "city", elected: false,
      hours: { weekly: [...["mon", "tue", "wed", "thu"].map((day) => ({ day, open: "09:00", close: "12:30" })),
        ...["mon", "tue", "wed", "thu"].map((day) => ({ day, open: "13:30", close: "16:00" })),
        { day: "fri", open: "09:00", close: "12:00" }], status: "researched", basis: "TEST" },
      basis: "TEST" },
    { role: "Selectboard", body: "Port Ellery Selectboard", level: "city", elected: true, basis: "TEST" },
    { role: "Harbour District Board", body: "Port Ellery Harbour District", level: "district", elected: true, oversight: false, basis: "TEST" },
    { role: "Examiner of Accounts", body: "Marlow County Audit Office", level: "county", elected: false, oversight: true, basis: "TEST" },
  ],
  action_kinds: [
    { kind: "records_request", label: "request under the records act", tier: 2,
      laws: ["Freedom of Records Act (test)", "Port Ellery Open Government Bylaw"],
      venue: { name: "the Town Clerk's office", how: "email", basis: "TEST",
        cutoff: { time: "16:30", citation: "Test Stat. § 1.105", status: "ruled", basis: "TEST" },
        outages: [{ from: "2026-03-02T09:00:00-04:00", to: "2026-03-02T13:30:00-04:00", status: "researched", basis: "TEST" }],
        receipt: { rule: "next_business_day", citation: "P.E.B.L. § 4(2)", status: "researched", basis: "TEST" },
        hours: { weekly: ["mon", "tue", "wed", "thu", "fri"].map((day) => ({ day, open: "08:00", close: "18:00" })),
          status: "ruled", basis: "TEST" } },
      template: attributed("TPL-test-records-request", "file", "To the {{counterparty_role}}: under {{law}}, {{group}} asks for the records described below.",
        { reviewer: "Dee Example", kind: "professional", organisation: "Marlow Commons Legal Society (test)",
          credential: "solicitor (test)", scope: "the whole text", outcome: "no_concerns", at: "2026-08-20" }),
      advisory: "A test advisory: have a solicitor read the request before it is sent.", basis: "TEST" },
    { kind: "bylaw_complaint", label: "complaint under the bylaws", tier: 1, laws: ["Port Ellery Bylaws"],
      venue: { name: "the Selectboard", how: "in_person", basis: "TEST" },
      template: attributed("TPL-test-bylaw-complaint", "file", "To the {{counterparty_role}}: {{act}} does not conform to {{standards}}.",
        { reviewer: "Dee Example", kind: "member", scope: "the whole text", outcome: "no_concerns", at: "2026-08-21" }),
      basis: "TEST" },
    { kind: "commitment_claim", label: "claim on a budget commitment", tier: 3,
      venue: { name: "Marlow County Court", how: "court", basis: "TEST" },
      evidence: { standard: "Marlow County Court Rule 9.02 (test): a record authenticated by its custodian",
        accepts: [{ grade: "A", coattested: true }, { grade: "B" }], contestable: [{ grade: "C" }], basis: "TEST" },
      /* A Tier 3 kind takes a briefing to counsel, never a `file` template (K921). */
      template: attributed("TPL-test-commitment-brief", "brief", "For counsel: {{group}} asks whether {{act}} ({{act_date}}) breaches {{standards}}, on {{findings}}.",
        { reviewer: "Dee Example", kind: "professional", organisation: "Marlow Commons Legal Society (test)",
          credential: "solicitor (test)", scope: "the whole text", outcome: "concerns", at: "2026-08-22" }),
      basis: "TEST" },
  ],
  deadlines: [
    /* the pre-T33 form, `days: n`, read as units: days, amount: n */
    { rule: "records_answer", applies_to: "records_request", days: 5, count: "business", starts: "received", closures: "town",
      extension: { days: 5, count: "business", when: "the records are held off site", citation: "Test Stat. § 1.141" },
      observed: { closures: "court", status: "researched", basis: "TEST" },
      citation: "Test Stat. § 1.140", status: "researched", basis: "TEST" },
    { rule: "claim_notice", applies_to: "claim", units: "days", amount: 90, count: "calendar", direction: "forward", starts: "known",
      roll: true, closures: "court", computation: "clear_days",
      tolling: [{ when: "the claimant is a minor", citation: "Test Stat. § 9.22" }],
      citation: "Test Stat. § 9.20", status: "ruled", basis: "TEST" },
    { rule: "notice_of_sitting", applies_to: "bylaw_complaint", units: "hours", amount: 36, direction: "backward", starts: "act",
      citation: "P.E.B.L. § 7", status: "researched", basis: "TEST" },
    { rule: "harbour_notice", applies_to: "bylaw_complaint", units: "business_hours", amount: 16, direction: "backward", starts: "hearing",
      closures: "town", citation: "P.E.B.L. § 8", status: "researched", basis: "TEST" },
    { rule: "appeal_window", applies_to: "commitment_claim", units: "months", amount: 2, direction: "forward", starts: "entered",
      roll: true, closures: "court", citation: "Marlow Ct. R. 30.1", status: "researched", basis: "TEST" },
    { rule: "service_lapse", applies_to: "commitment_claim", units: "years", amount: 2, direction: "forward", starts: "served",
      citation: "Marlow Ct. R. 30.9", status: "researched", basis: "TEST" },
    { rule: "filing_reply", applies_to: "commitment_claim", units: "days", amount: 7, count: "calendar", direction: "backward", starts: "filed",
      roll: true, closures: "court", computation: "clear_days", citation: "Marlow Ct. R. 31.2", status: "researched", basis: "TEST" },
  ],
  weekend: { days: ["sun"], citation: "Test Stat. § 0.12", status: "researched", basis: "TEST" },
  computation: [
    { key: "clear_days", rule: "exclude_first_include_last", citation: "Test Stat. § 0.10", status: "ruled", basis: "TEST" },
  ],
  fiscal_year: [
    { body: "*", start: "04-01", named_by: "start", label: "FY{start}-{end2}", status: "researched", basis: "TEST" },
    { body: "Port Ellery Harbour District", start: "10-01", named_by: "end", label: "HD{end}", status: "ruled", basis: "TEST" },
  ],
  law_ranks: [
    { kind: "statute", level: "state", rank: 1, basis: "TEST" },
    { kind: "ordinance", level: "city", rank: 2, basis: "TEST" },
    { kind: "commitment", level: "county", rank: 3, basis: "TEST" },
  ],
  instrument_key: { jurisdiction: "xx-port-ellery", basis: "TEST" },
  proceeding_kinds: [
    { kind: "commitment_suit", label: "suit on a budget commitment", forum_kind: "court", basis: "TEST" },
    { kind: "harbour_inquiry", label: "harbour commission inquiry", forum_kind: "commission", basis: "TEST" },
  ],
  proceeding_flows: [
    { kind: "commitment_suit", stages: [
      { stage: "filed", label: "filed", reached_by: ["filing"] },
      { stage: "heard", label: "heard", reached_by: ["hearing"] },
      { stage: "decided", label: "decided", reached_by: ["judgment", "dismissal"] }],
      citation: "Marlow Ct. R. 2", basis: "TEST" },
  ],
  identifier_schemes: [
    { scheme: "ellery_person", label: "minute-book person number", entity_kinds: ["person"], space: "person", form: "minute-person",
      systems: ["ellery.minutes"], basis: "TEST" },
    { scheme: "marlow_bar", label: "Marlow bar number", entity_kinds: ["person"], space: "person", form: "bar-number", basis: "TEST" },
  ],
  classification_schemes: [
    { scheme: "ellery_funds", label: "ledger funds", kind: "fund", codes: [{ code: "100-01", label: "General" }, { code: "200-01", label: "Harbour" }], basis: "TEST" },
    { scheme: "ellery_objects", label: "spending objects", kind: "object", basis: "TEST" },
  ],
  lawful_demands: [
    { kind: "officer_privacy", label: "an officer's demand to remove their home details", covers: ["home_address", "other"],
      within: { amount: 5, units: "days" }, citation: "Test Stat. § 12.4", status: "researched", basis: "TEST" },
  ],
  recurrences: [
    { body: "Port Ellery Selectboard", rrule: "FREQ=MONTHLY;BYDAY=2TU", dtstart: "2026-01-13T19:00", citation: "P.E.B.L. § 6",
      status: "researched", basis: "TEST" },
    { body: "Port Ellery Harbour District", rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;UNTIL=20261231", dtstart: "2026-01-08T10:00",
      citation: "P.E.B.L. § 6A", status: "ruled", basis: "TEST" },
  ],
  legal_organisations: [
    { name: "Marlow Commons Legal Society (test)", evaluates: ["commitment_claim"],
      contacts: [{ how: "web", value: "https://legal.marlow-county.example" }, { how: "phone", value: "+1 555 0100" }],
      basis: "TEST" },
  ],
  /* The entries for one office and one venue come first: each adds its days to the year every office keeps (R43). */
  holidays: [
    { year: 2026, offices: ["Town Clerk"], days: [{ date: "2026-08-14", name: "Clerk's records day" }],
      status: "ruled", basis: "TEST" },
    { year: 2026, offices: [{ venue: "commitment_claim" }], days: [
      { date: "2026-08-31", name: "Court vacation day" }, { date: "2026-12-24", name: "Court closed" }],
      status: "researched", basis: "TEST" },
    { year: 2026, days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-03-17", name: "Harbour Day" },
      { date: "2026-07-03", name: "Founders' Day (observed)" }, { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "TEST" },
    { year: 2027, days: [
      { date: "2027-01-01", name: "New Year's Day" }, { date: "2027-03-17", name: "Harbour Day" },
      { date: "2027-12-24", name: "Christmas Day (observed)" }],
      status: "researched", basis: "TEST" },
    /* Two closure lists (R47): the court's, which a rule counts on, and the town's, observed beside it. */
    { year: 2026, list: "court", citation: "Marlow Ct. R. 1.4", days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-08-31", name: "Court vacation day" },
      { date: "2026-12-24", name: "Court closed" }, { date: "2026-12-25", name: "Christmas Day" }],
      status: "ruled", basis: "TEST" },
    { year: 2026, list: "town", citation: "P.E.B.L. § 3", days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-03-17", name: "Harbour Day" },
      { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "TEST" },
  ],
};
