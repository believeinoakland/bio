/* The test profile (R22): the City of Port Ellery and Marlow County, a jurisdiction made up for tests.
 * Every basis is `TEST`. It supplies every section and vocabulary key the first profile supplies, with
 * different values in each, shares no host with it (all hosts are under the reserved `.example`
 * domain), and adds a captured crosswalk, a venue's evidence standard (R39) and attributed templates (R40),
 * which the first profile has none of. Its calendar (R41–R44, R45) has a holiday year for every office with
 * entries of that year for one office and for one venue, hours on an office and a venue, and both statuses.
 * Modules that take local facts are tested against it (`build/layers.md`, "No jurisdiction in the product",
 * rule 3). */
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
      { key: "pebl", label: "P.E. Bylaws", pattern: { re: R`Port\s+Ellery\s+Bylaws|P\.?E\.?B\.?L\.?`, flags: "i" }, basis: "TEST" },
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
  },

  practice: { minutes_due_days: { value: 30, basis: "TEST" } },
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
      level: "city", cite: { re: R`\bP\.?E\.?B\.?L\.?\s*§\s*\d+`, flags: "i" }, code: "pebl", basis: "TEST" },
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
    { rule: "records_answer", applies_to: "records_request", days: 5, count: "business", starts: "received",
      extension: { days: 5, count: "business", when: "the records are held off site" },
      citation: "Test Stat. § 1.140", basis: "TEST" },
    { rule: "claim_notice", applies_to: "claim", days: 90, count: "calendar", starts: "known",
      citation: "Test Stat. § 9.20", basis: "TEST" },
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
  ],
};
