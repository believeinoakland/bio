/* The first jurisdiction profile: the City of Oakland and Alameda County, the one the project's own
 * instance uses (`build/layers.md`, "No jurisdiction in the product", rule 2). It holds every local
 * fact that was written into code at `snapshot/pre-refactor-2026-09-25` (R21, R30), each with the
 * measurement or ruling it rests on, or `UNMEASURED` where none exists:
 *
 *   spaces, systems, mixed_hosts   `bio-plane/src/idspaces.mjs` (M-119, M-132, M-157)
 *   vocabulary                     the `docprofile/doctypes/` recognisers: the agenda (the 2026-08-03
 *                                  measurement, FW-15), the minutes, staff report and ordinance or
 *                                  resolution (M-24, over the M-18 census corpus)
 *   practice.minutes_due_days      `MINUTES_DUE_DAYS` in `meeting-calendar.mjs`, which says it is unmeasured
 *   search_terms                   `readingNamePlan`'s default terms in `store.mjs`; no measurement found
 *   records_laws                   the law `cpra_request` names (D-149, `governingLawsOf`)
 *   action sections                `ACTION_KINDS` in `bio-checks.mjs`, tiers from Roadmap v5 §8 as D-182
 *                                  adopted it, the response period of State Rules v1.5 §4.4
 *
 * Plain data: patterns are `{re, flags?}` with a JavaScript regular-expression source. */
const R = String.raw;

export default {
  id: "oakland-alameda",
  name: "City of Oakland and Alameda County",
  covers: ["City of Oakland", "Alameda County"],
  test: false,

  spaces: {
    enactment: {
      label: "resolution or ordinance number (C.M.S.)",
      forms: [
        { form: "cms",
          pattern: { re: R`^(?:C\.?\s?M\.?\s?S\.?\s*)?(\d{4,5})(?:\s*C\.?\s?M\.?\s?S\b\.?)?$`, flags: "i" },
          normal: [{ group: 1 }], clean: { spaces: "collapse" }, basis: "M-119, M-132" },
      ],
      kinds: [
        { kind: "ordinance", prefix: { re: R`ordinance\s+(?:no\.?\s*|number\s+)?`, flags: "i" },
          floor: { first: 12274, system: "oakland.legistar", basis: "M-132" }, basis: "M-119, M-132" },
        { kind: "resolution", prefix: { re: R`resolution\s+(?:no\.?\s*|number\s+)?`, flags: "i" },
          floor: { first: 75950, system: "oakland.legistar", basis: "M-132" }, basis: "M-119, M-132" },
      ],
    },
    project: {
      label: "project or capital improvement number",
      /* Concurrent forms, told apart by shape (M-132: C###### 2000–2026, 100xxxx 2015–2026). C and P
         are kept apart: nothing measured says they share an allocator. A suffixed new-form value is a
         different string (M-157). */
      forms: [
        { form: "C#####", pattern: { re: R`^(C\d{5,6})$` }, normal: [{ group: 1 }],
          clean: { strip: [{ re: R`#\s*` }], spaces: "remove", upper: true }, basis: "M-132" },
        { form: "P#####", pattern: { re: R`^(P\d{5,6})$` }, normal: [{ group: 1 }],
          clean: { strip: [{ re: R`#\s*` }], spaces: "remove", upper: true }, basis: "M-132" },
        { form: "100xxxx", pattern: { re: R`^(100\d{4})$` }, normal: [{ group: 1 }],
          clean: { strip: [{ re: R`#\s*` }], spaces: "remove", upper: true }, basis: "M-132" },
        { form: "100xxxx+suffix", pattern: { re: R`^(100\d{4}[A-Z])$` }, normal: [{ group: 1 }],
          clean: { strip: [{ re: R`#\s*` }], spaces: "remove", upper: true }, basis: "M-157" },
      ],
    },
    fund: {
      label: "fund code",
      forms: [
        { form: "####", pattern: { re: R`^(\d{4})$` }, normal: [{ group: 1 }], clean: { spaces: "collapse" },
          basis: "M-119" },
      ],
    },
    parcel: {
      label: "assessor's parcel number (APN)",
      /* Book (digits with an optional letter, or a bare letter), page, parcel (optional letter),
         optional sub. M-157's key: every numeric part read without its zero-padding (the legislative
         record pads every part, the roll does not); a digit is never folded. */
      forms: [
        { form: "alameda-apn",
          pattern: { re: R`^0*(\d{1,3}[A-Z]?|[A-Z])-0*(\d{1,4})-0*(\d{1,3}[A-Z]?)(?:-0*(\d{1,2}))?$` },
          normal: [{ group: 1, unpad: true }, "-", { group: 2, unpad: true }, "-", { group: 3, unpad: true }, "-",
                   { group: 4, unpad: true, default: "0" }],
          clean: { strip: [{ re: R`APN\s*`, flags: "i" }], spaces: "remove", upper: true }, basis: "M-157" },
      ],
    },
  },

  systems: [
    /* The shared API host serves every client city of the vendor, so only this path is this city's. */
    { origin: "oakland.legistar", name: "Legistar, the City of Oakland's legislative record",
      hosts: ["webapi.legistar.com"], path: { re: R`^\/v1\/oakland(\/|$)`, flags: "i" }, basis: "M-119 LEG" },
    { origin: "oakland.legistar", name: "Legistar, the City of Oakland's legislative record",
      hosts: ["oakland.legistar.com", "oakland.legistar1.com"], basis: "M-119 LEG" },
    { origin: "oakland.budget", name: "the City of Oakland's budget system (its Open Data line items)",
      hosts: ["data.oaklandca.gov"], path: { re: R`vmzx-e5fe`, flags: "i" }, basis: "M-119 ODP" },
    { origin: "alameda.assessor",
      name: "the Alameda County Assessor's parcel layer, republished by the City of Oakland's portal "
        + "(the portal does not state its provenance; its schema, keys and 2012-13 vintage are the county's)",
      hosts: ["data.oaklandca.gov"], path: { re: R`c3xp-qcgn`, flags: "i" },
      republishes: true, provenance_stated: false, basis: "M-132, M-157" },
    { origin: "alameda.assessor", name: "the Alameda County Assessor's own publications (Open Data Hub)",
      hosts: ["services5.arcgis.com", "data.acgov.org"],
      path: { re: R`(ROBnTHSNjoZ2Wm1P\/.*(Parcel|Assessor_Office))`, flags: "i" }, basis: "M-157 (4)" },
    { origin: "oakland.permits", name: "the City of Oakland's permit system (Accela)",
      hosts: ["aca-prod.accela.com"], path: { re: R`\/OAKLAND\/`, flags: "i" }, basis: "M-157 (1)" },
    { origin: "oakland.auditor", name: "the Office of the City Auditor",
      hosts: ["www.oaklandauditor.com"], basis: "M-119 AUD" },
  ],
  mixed_hosts: [
    { host: "www.oaklandca.gov", why: "the City's general website, serving many offices' publications",
      basis: "M-119 FIN, M-132" },
    { host: "cao-94612.s3.us-west-2.amazonaws.com",
      why: "the storage behind the City's general website, serving many offices' publications",
      basis: "M-119 FIN, M-132" },
  ],
  /* M-157: no crosswalk is captured, so the section is absent (an absent section supplies nothing). */

  vocabulary: {
    furniture: [
      { pattern: { re: R`^City of Oakland$`, flags: "i" }, basis: "2026-08-03, M-24" },
      { pattern: { re: R`^Office of the City Clerk$`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^View Report$`, flags: "i" }, basis: "2026-08-03, M-24" },
      { pattern: { re: R`^View Legislation$`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^View (Attachment|Supplemental)\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^Attachments:$`, flags: "i" }, basis: "2026-08-03, M-24" },
      { pattern: { re: R`^Sponsors:$`, flags: "i" }, basis: "2026-08-03, M-24" },
    ],
    bodies: [
      /* A header line naming the body that meets (agenda and minutes mastheads). */
      { pattern: { re: R`(Committee|City Council|Commission|Board|Authority)\s*$` }, basis: "2026-08-03, M-24" },
      /* The enacting body printed above an instrument's own caption. */
      { pattern: { re: R`\b(?:OAKLAND\s+CITY\s+COUNCIL|CITY\s+COUNCIL|COUNCIL\s+OF\s+THE\s+CITY|CITY\s+OF\s+OAKLAND)\b`, flags: "i" },
        basis: "M-24" },
    ],
    member_titles: [
      { pattern: { re: R`^Councilmember`, flags: "i" }, basis: "2026-08-03, M-24" },
    ],
    enactment_markers: [
      /* Council Meeting Series, printed after an instrument's number. */
      { pattern: { re: R`C\.?\s?M\.?\s?S\.?`, flags: "i" }, basis: "M-24, M-132" },
    ],
    codes: [
      { key: "omc", label: "O.M.C.", pattern: { re: R`O\.?M\.?C\.?|Oakland\s+Municipal\s+Code`, flags: "i" }, basis: "M-24" },
    ],
    file_numbers: [
      { pattern: { re: R`\d{2}-\d{4}` }, system: "oakland.legistar", basis: "2026-08-03, M-24" },
    ],
    report_titles: [
      { pattern: { re: R`^AGENDA\s+REPORT\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^STAFF\s+REPORT\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^INFORMATIONAL\s+REPORT\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^CITY\s+ADMINISTRATOR'?S?\s+REPORT\b`, flags: "i" }, basis: "M-24" },
    ],
    report_sections: [
      { pattern: { re: R`^RECOMMENDATION\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^EXECUTIVE\s+SUMMARY\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^(BACKGROUND|LEGISLATIVE\s+HISTORY|BACKGROUND\s*\/\s*LEGISLATIVE\s+HISTORY)\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^ANALYSIS(\s+AND\s+POLICY\s+ALTERNATIVES)?\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^FISCAL\s+IMPACT\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^PUBLIC\s+OUTREACH\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^COORDINATION\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^SUSTAINABLE\s+OPPORTUNITIES\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^ACTION\s+REQUESTED\b`, flags: "i" }, basis: "M-24" },
      { pattern: { re: R`^REASON\s+FOR\b`, flags: "i" }, basis: "M-24" },
    ],
    recommendation_openers: [
      { pattern: { re: R`\bStaff\s+Recommends\s+That\b`, flags: "i" }, basis: "M-24" },
    ],
    template_blanks: [
      { pattern: { re: R`INTRODUCED\s+BY\b[^\]]*\]`, flags: "i" }, basis: "M-24" },
    ],
  },

  practice: {
    /* A threshold for raising a question, never for asserting a violation; the city's practice is
       not measured (its code says so). */
    minutes_due_days: { value: 21, basis: "UNMEASURED" },
  },
  search_terms: [
    { term: "oakland", basis: "UNMEASURED" },
    { term: "police", basis: "UNMEASURED" },
  ],
  records_laws: [
    { level: "state", name: "California Public Records Act", citation: "Cal. Gov. Code § 7920.000 et seq.",
      basis: "D-149" },
  ],

  standard_sources: [
    { source: "Oakland Municipal Code", kind: "ordinance", issuer: "Oakland City Council",
      cite: { re: R`\b(?:O\.?M\.?C\.?|Oakland\s+Municipal\s+Code)\s+(?:Section|Chapter)\s+[\d.]+[\w.]*`, flags: "i" },
      code: "omc", basis: "M-24" },
    { source: "Ordinances and resolutions of the Oakland City Council", kind: "ordinance", issuer: "Oakland City Council",
      cite: { re: R`\b(?:Ordinance|Resolution)\s+No\.?\s*\d{3,6}(?:\s*C\.?\s?M\.?\s?S\.?)?`, flags: "i" }, basis: "M-24" },
    { source: "California Government Code", kind: "statute", issuer: "California Legislature",
      cite: { re: R`\b(?:Cal(?:ifornia|\.)?\s+)?Gov(?:ernment|\.|t\.?)?\s+Code\s+(?:§+\s*|Section\s+)?\d+(?:\.\d+)?`, flags: "i" },
      basis: "UNMEASURED" },
  ],
  counterparties: [
    { role: "Controller", body: "City of Oakland Finance Department", level: "city", elected: false, basis: "UNMEASURED" },
    { role: "City Council", body: "Oakland City Council", level: "city", elected: true, basis: "UNMEASURED" },
    { role: "Civil Grand Jury", body: "Alameda County Civil Grand Jury", level: "county", elected: false, basis: "UNMEASURED" },
    { role: "State Controller", body: "California State Controller's Office", level: "state", elected: true, basis: "UNMEASURED" },
  ],
  action_kinds: [
    { kind: "records_request", label: "public records request", tier: 1, laws: ["California Public Records Act"],
      venue: { name: "the City's public records request portal (NextRequest)", how: "portal", basis: "UNMEASURED" },
      basis: "D-182" },
    { kind: "grand_jury", label: "complaint to the civil grand jury", tier: 1, basis: "D-182" },
    { kind: "controller_referral", label: "referral to the State Controller", tier: 1, basis: "D-182" },
    { kind: "public_comment", label: "public comment to a body", basis: "UNMEASURED" },
    { kind: "media", label: "media outreach", tier: 1, basis: "D-182" },
    { kind: "litigation_support", label: "support for litigation", basis: "UNMEASURED" },
    { kind: "request_for_comment", label: "request for comment on specific claims", basis: "DEC-13" },
    { kind: "other", label: "other action", basis: "UNMEASURED" },
  ],
  deadlines: [
    { rule: "records_response", applies_to: "records_request", days: 10, count: "calendar", starts: "received",
      extension: { days: 14, count: "calendar", when: "unusual circumstances, by written notice to the requester" },
      citation: "Cal. Gov. Code § 7922.535", basis: "UNMEASURED" },
  ],
};
