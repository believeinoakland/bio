/* The test profile (R22): the City of Port Ellery and Marlow County, a jurisdiction made up for tests.
 * Every basis is `TEST`. It supplies every section and vocabulary key the first profile supplies, with
 * different values in each, shares no host with it (all hosts are under the reserved `.example`
 * domain), and adds a captured crosswalk, which the first profile has none of. Modules that take local
 * facts are tested against it (`build/layers.md`, "No jurisdiction in the product", rule 3). */
const R = String.raw;

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
      hosts: ["minutes.port-ellery.example"], basis: "TEST" },
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
  search_terms: [{ term: "harbour", basis: "TEST" }],
  records_laws: [
    { level: "state", name: "Freedom of Records Act (test)", citation: "Test Stat. § 1.100", basis: "TEST" },
    { level: "city", name: "Port Ellery Open Government Bylaw", citation: "P.E.B.L. § 4", basis: "TEST" },
  ],

  standard_sources: [
    { source: "Port Ellery Bylaws", kind: "ordinance", issuer: "Port Ellery Selectboard",
      cite: { re: R`\bP\.?E\.?B\.?L\.?\s*§\s*\d+`, flags: "i" }, code: "pebl", basis: "TEST" },
    { source: "Marlow County Budget Commitments", kind: "commitment", issuer: "Marlow County Commission",
      cite: { re: R`\bMCBC\s+\d{4}-\d+` }, basis: "TEST" },
  ],
  counterparties: [
    { role: "Town Clerk", body: "City of Port Ellery", level: "city", elected: false, basis: "TEST" },
    { role: "Selectboard", body: "Port Ellery Selectboard", level: "city", elected: true, basis: "TEST" },
    { role: "Harbour District Board", body: "Port Ellery Harbour District", level: "district", elected: true, basis: "TEST" },
  ],
  action_kinds: [
    { kind: "records_request", label: "request under the records act", tier: 2,
      laws: ["Freedom of Records Act (test)", "Port Ellery Open Government Bylaw"],
      venue: { name: "the Town Clerk's office", how: "email", basis: "TEST" },
      template: "To the Town Clerk: under {{law}}, please provide {{records}}.", basis: "TEST" },
    { kind: "bylaw_complaint", label: "complaint under the bylaws", tier: 1, laws: ["Port Ellery Bylaws"],
      venue: { name: "the Selectboard", how: "in_person", basis: "TEST" },
      template: "To the Selectboard: {{act}} does not conform to {{bylaw}}.", basis: "TEST" },
    { kind: "commitment_claim", label: "claim on a budget commitment", tier: 3,
      venue: { name: "Marlow County Court", how: "court", basis: "TEST" }, basis: "TEST" },
  ],
  deadlines: [
    { rule: "records_answer", applies_to: "records_request", days: 5, count: "business", starts: "received",
      extension: { days: 5, count: "business", when: "the records are held off site" },
      citation: "Test Stat. § 1.140", basis: "TEST" },
    { rule: "claim_notice", applies_to: "claim", days: 90, count: "calendar", starts: "known",
      citation: "Test Stat. § 9.20", basis: "TEST" },
  ],
};
