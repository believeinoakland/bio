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
 *                                  adopted it, the response period of State Rules v1.5 §4.4; the Tier 2
 *                                  and Tier 3 kinds and the advisory note that Design Requirement 8 and
 *                                  Roadmap v5 §8 name (R36)
 *   legal_organisations            the two Bob named (K283 (2), K303, R36); unmeasured
 *   locale                         the render locale every capture has asked for (R37); unmeasured
 *   systems[].links                REC-206's gateway shapes, measured on M-120's agenda (R38)
 *   time_zone, hours, holidays     the T20 calendar research (`build/plan/research-oakland-calendar.md`), filed
 *                                  as M-187–M-196 and read by K925; each `researched`, or absent where no source
 *                                  publishes the fact (R41–R45). No template: none is approved (K921 Q1, R45).
 *   the first sourced rule set     T33's desk research, `build/plan/measures-T33/time-law.md` (2026-10-05): every
 *                                  rule with its primary source, the closure lists it counts on, the weekend, CCP
 *                                  §12's computation, the receipt rule, the five counterparties re-based on their
 *                                  primary sources, `minutes_due_days` corrected (R56; K1445, K1504). A rule or fact
 *                                  with no primary source is absent, never `UNMEASURED` (R44).
 *   meeting markers, body variants Legistar's own body names (`measures-T33/legistar-events.md` §1–§2, 2026-10-05)
 *   lawful_demands                 Gov. Code §7928.215 as K1493 rules it (R53)
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
    /* A Legistar PersonId (`/v1/oakland/persons`, read 2026-10-05; legistar-events §1): one form per person scheme. */
    person: {
      label: "person identifier, by scheme",
      forms: [
        { form: "legistar-person", pattern: { re: R`^(\d{1,7})$` }, normal: [{ group: 1 }], clean: { spaces: "remove" },
          basis: "2026-10-05 legistar-events" },
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
    /* An agenda links each item to its matter page and each file to the file, through the gateway;
       which links are items and which are files is read off these shapes (REC-206, M-120). */
    { origin: "oakland.legistar", name: "Legistar, the City of Oakland's legislative record",
      hosts: ["oakland.legistar.com", "oakland.legistar1.com"],
      links: { item: { re: R`^\/gateway\.aspx\?m=l&id=\/matter\.aspx\?key=\d+`, flags: "i" },
               file: { re: R`^\/gateway\.aspx\?m=f&id=[^&#]+`, flags: "i" } },
      basis: "M-119 LEG, M-120" },
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
      { pattern: { re: R`\b(?:CITY\s+COUNCIL|COUNCIL\s+OF\s+THE\s+CITY|BOARD\s+OF\s+[A-Z]+|COMMISSION|AUTHORITY|CITY\s+OF\s+[A-Z]+)\b` },
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
      /* The code is served by its codifier (Municode), 230 days behind the record at Supp. 103; one doc per section,
         headed `2.20.070 - Title.`, its subsections marked `A.`, `1.`, `(a)` (time-law §4–§5). */
      { key: "omc", label: "O.M.C.", pattern: { re: R`O\.?M\.?C\.?|Oakland\s+Municipal\s+Code`, flags: "i" },
        copy: "codifier", sections: { number: { re: R`\d+\.\d+\.\d+[A-Z]?` }, separators: ".", markers: ["letter", "numeral", "paren_letter"] },
        basis: "M-24, 2026-10-05 time-law" },
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
      { pattern: { re: R`^\s*INTRODUCED\s+BY\b[^\]]*\]`, flags: "i" }, basis: "M-24" },
    ],
    /* Legistar carries a meeting's kind in its body's name: a cancellation is a separate body ("… - CANCELLED",
       "… - CANCELLATION"), as are special and concurrent meetings (legistar-events §1, §2 (2)). */
    meeting_markers: [
      { marker: "cancelled", pattern: { re: R`\s*-\s*CANCELL(?:ED|ATION)\s*$`, flags: "i" }, basis: "2026-10-05 legistar-events" },
      { marker: "special", pattern: { re: R`\bSpecial\b`, flags: "i" }, basis: "2026-10-05 legistar-events" },
      { marker: "concurrent", pattern: { re: R`\bConcurrent\b`, flags: "i" }, basis: "2026-10-05 legistar-events" },
    ],
    /* The variant names of one organisation (legistar-events §1 (a)): the Council and its standing committees. */
    body_variants: [
      { pattern: { re: R`^\W*Meeting of the Oakland City Council\b`, flags: "i" }, organisation: "city_council", basis: "2026-10-05 legistar-events" },
      { pattern: { re: R`Rules\s+(?:&|and)\s+Legislation\s+Committee`, flags: "i" }, organisation: "rules_committee", basis: "2026-10-05 legistar-events" },
      { pattern: { re: R`Finance\s+(?:&|and)\s+Management\s+Committee`, flags: "i" }, organisation: "finance_management_committee", basis: "2026-10-05 legistar-events" },
      { pattern: { re: R`Community\s+(?:&|and)\s+Economic\s+Development\s+Committee`, flags: "i" }, organisation: "community_economic_development_committee", basis: "2026-10-05 legistar-events" },
      { pattern: { re: R`Public\s+Safety\s+Committee`, flags: "i" }, organisation: "public_safety_committee", basis: "2026-10-05 legistar-events" },
      { pattern: { re: R`Life\s+Enrichment\s+Committee`, flags: "i" }, organisation: "life_enrichment_committee", basis: "2026-10-05 legistar-events" },
      { pattern: { re: R`Public\s+Works\s+(?:(?:&|and)\s+Transportation\s+)?Committee`, flags: "i" }, organisation: "public_works_committee", basis: "2026-10-05 legistar-events" },
    ],
  },

  practice: {
    /* A threshold for raising a question, never for asserting a violation: OMC 2.20.160's draft minutes, "no later
       than ten business days after the meeting" (time-law §2; K1504), correcting the code's earlier 21 days. */
    minutes_due_days: { value: 10, count: "business", basis: "2026-10-05 time-law" },
  },
  locale: { value: "en-US", basis: "UNMEASURED" },
  /* California's statutory time (Gov. Code § 6808), by its IANA name. */
  time_zone: { value: "America/Los_Angeles", status: "researched", basis: "M-187" },
  search_terms: [
    { term: "oakland", basis: "UNMEASURED" },
    { term: "police", basis: "UNMEASURED" },
  ],
  records_laws: [
    { level: "state", name: "California Public Records Act", citation: "Cal. Gov. Code § 7920.000 et seq.",
      basis: "D-149" },
    /* The City's own records law, whose Immediate Disclosure Request is OMC 2.20.230 (time-law §2). */
    { level: "city", name: "Oakland Sunshine Ordinance", citation: "Oakland Mun. Code ch. 2.20", basis: "2026-10-05 time-law" },
    { level: "federal", name: "Freedom of Information Act", citation: "5 U.S.C. § 552", basis: "2026-10-05 time-law" },
  ],

  standard_sources: [
    { source: "Oakland Municipal Code", kind: "ordinance", issuer: "Oakland City Council",
      cite: { re: R`\b(?:O\.?M\.?C\.?|Oakland\s+Municipal\s+Code)\s+(?:Section|Chapter)\s+[\d.]+[\w.]*`, flags: "i" },
      level: "city", code: "omc", basis: "M-24" },
    { source: "Ordinances and resolutions of the Oakland City Council", kind: "ordinance", issuer: "Oakland City Council",
      level: "city", cite: { re: R`\b(?:Ordinance|Resolution)\s+No\.?\s*\d{3,6}(?:\s*C\.?\s?M\.?\s?S\.?)?`, flags: "i" }, basis: "M-24" },
    { source: "California Government Code", kind: "statute", issuer: "California Legislature", level: "state",
      cite: { re: R`\b(?:Cal(?:ifornia|\.)?\s+)?Gov(?:ernment|\.|t\.?)?\s+Code\s+(?:§+\s*|Section\s+)?\d+(?:\.\d+)?`, flags: "i" },
      basis: "2026-10-05 time-law" },
    { source: "California Code of Civil Procedure", kind: "statute", issuer: "California Legislature", level: "state",
      cite: { re: R`\b(?:Cal(?:ifornia|\.)?\s+)?(?:Code\s+(?:of\s+)?Civ(?:il|\.)?\s+Proc(?:edure|\.)?|C\.?C\.?P\.?)\s+(?:§+\s*|Section\s+)?\d+[a-z]?`, flags: "i" },
      basis: "2026-10-05 time-law" },
    { source: "Freedom of Information Act", kind: "statute", issuer: "United States Congress", level: "federal",
      cite: { re: R`\b5\s+U\.?\s?S\.?\s?C\.?\s+§+\s*552\b`, flags: "i" }, basis: "2026-10-05 time-law" },
  ],
  /* Hours only where the office publishes them (M-192). The Controller's Bureau (M-195), the City Council (M-196)
     and the Civil Grand Jury (M-194) publish none, and the State Controller's Office could not be read: their hours
     are absent, undetermined (R27, K925). Each office rests on its primary source (time-law §2): Charter §504(e)
     (an appointed Director of Finance), Charter §200 (eight elected Councilmembers), Penal Code §§888, 925a (the
     grand jury, which may examine any city's books), Charter §403(1) (the elected City Auditor), Cal. Const. art. V
     §11 (the elected Controller). */
  counterparties: [
    { role: "Controller", body: "City of Oakland Finance Department", level: "city", elected: false, basis: "2026-10-05 time-law" },
    { role: "City Council", body: "Oakland City Council", level: "city", elected: true, basis: "2026-10-05 time-law" },
    { role: "Civil Grand Jury", body: "Alameda County Civil Grand Jury", level: "county", elected: false, oversight: true, basis: "2026-10-05 time-law" },
    /* Design Requirement 8's "City Auditor whistleblower complaints"; its system is oakland.auditor. */
    { role: "City Auditor", body: "Office of the City Auditor, City of Oakland", level: "city", elected: true, oversight: true,
      hours: { weekly: ["mon", "tue", "wed", "thu", "fri"].map((day) => ({ day, open: "08:30", close: "17:00" })),
        status: "researched", basis: "M-192" },
      basis: "2026-10-05 time-law" },
    { role: "State Controller", body: "California State Controller's Office", level: "state", elected: true, basis: "2026-10-05 time-law" },
  ],
  action_kinds: [
    /* The portal is live (118,270 requests on 2026-10-05) and named by the City Attorney's staff guide, whose §5 says a
       request is received "on the next business day if submitted on a non-business day" (time-law §1c-3; K1504 (3)). */
    { kind: "records_request", label: "public records request", tier: 1, laws: ["California Public Records Act", "Oakland Sunshine Ordinance"],
      venue: { name: "the City's public records request portal (NextRequest)", how: "portal", basis: "2026-10-05 time-law",
        receipt: { rule: "next_business_day", citation: "Oakland City Attorney, Public Records Act staff guide § 5 (2025-04-29)",
          status: "researched", basis: "2026-10-05 time-law" } },
      basis: "D-182" },
    { kind: "grand_jury", label: "complaint to the civil grand jury", tier: 1, basis: "D-182" },
    { kind: "controller_referral", label: "referral to the State Controller", tier: 1, basis: "D-182" },
    { kind: "public_comment", label: "public comment to a body", basis: "UNMEASURED" },
    { kind: "media", label: "media outreach", tier: 1, basis: "D-182" },
    { kind: "litigation_support", label: "support for litigation", basis: "UNMEASURED" },
    { kind: "request_for_comment", label: "request for comment on specific claims", basis: "DEC-13" },
    { kind: "other", label: "other action", basis: "UNMEASURED" },
    /* Design Requirement 8 and Roadmap v5 §8: Tier 2, with its advisory note, and Tier 3, which has no
       template. The Roadmap names the court a records petition is filed in. */
    { kind: "records_petition", label: "court petition to enforce a public records request", tier: 2,
      laws: ["California Public Records Act"],
      /* The hours are the civil clerk's office at the René C. Davidson Courthouse, in person, where writ matters
         are filed (M-193); its drop box and e-filing hours are not office hours. */
      /* Gov. Code §7923.100: a verified petition to the superior court of the county where the records are. */
      venue: { name: "Alameda County Superior Court", how: "court", basis: "2026-10-05 time-law",
        hours: { weekly: [...["mon", "tue", "wed", "thu"].map((day) => ({ day, open: "08:30", close: "15:00" })),
          { day: "fri", open: "08:30", close: "14:00" }], status: "researched", basis: "M-193" } },
      advisory: "File with caution: a procedural error can have the petition dismissed, usually without "
        + "prejudice, so refiling is possible but costs time and money. Legal review before filing is recommended.",
      basis: "D-182" },
    { kind: "assessment_challenge", label: "challenge to a tax, assessment or fee under Proposition 218", tier: 3, basis: "D-182" },
    { kind: "taxpayer_action", label: "taxpayer action (Code of Civil Procedure § 526a)", tier: 3, basis: "D-182" },
    { kind: "consent_decree_motion", label: "motion under a federal consent decree", tier: 3, basis: "D-182" },
    { kind: "constitutional_claim", label: "claim involving constitutional interpretation or statutory construction", tier: 3, basis: "D-182" },
  ],
  /* The first sourced rule set (R56; K1445, K1504; time-law §1). Each rule cites its primary source; civil-time counts
     it. A statutory day period rolls on the closures its law names (CCP §12a: Saturdays and the judicial holidays of
     CCP §135); the City portal's practice on the City list is held as `observed`, never as the rule (K1504 (1)). An
     Oakland ordinance's "holidays" are the City's list (K1504 (5)). */
  deadlines: [
    { rule: "records_response", applies_to: "records_request", units: "days", amount: 10, count: "calendar", direction: "forward",
      starts: "received", roll: true, closures: "judicial", computation: "ccp_12",
      extension: { days: 14, count: "calendar", when: "unusual circumstances (Gov. Code § 7922.535(c)(1)–(6)), by written notice to the requester",
        citation: "Cal. Gov. Code § 7922.535(b)" },
      observed: { closures: "city", status: "researched", basis: "2026-10-05 time-law" },
      citation: "Cal. Gov. Code § 7922.535(a)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "immediate_disclosure", applies_to: "records_request", units: "days", amount: 3, count: "business", direction: "forward",
      starts: "received", closures: "city", citation: "Oakland Mun. Code § 2.20.230", status: "researched", basis: "2026-10-05 time-law" },
    /* The Brown Act and OMC 2.20.070 bind a body's notice of its meeting, counted back from the meeting (the act);
       they bear on the group's comment to that body. Clock hours do not roll. */
    { rule: "agenda_posting_regular", applies_to: "public_comment", units: "hours", amount: 72, direction: "backward", starts: "act",
      citation: "Cal. Gov. Code § 54954.2(a)(1)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "special_meeting_notice", applies_to: "public_comment", units: "hours", amount: 24, direction: "backward", starts: "act",
      citation: "Cal. Gov. Code § 54956(a)", status: "researched", basis: "2026-10-05 time-law" },
    /* "at least forty-eight (48) hours (excluding Saturdays, Sundays and holidays) before the time of the meeting". */
    { rule: "omc_special_meeting_notice", applies_to: "public_comment", units: "business_hours", amount: 48, direction: "backward",
      starts: "act", closures: "city", computation: "omc_monday_special", citation: "Oakland Mun. Code § 2.20.070",
      status: "researched", basis: "2026-10-05 time-law" },
    { rule: "claim_presentation_injury", applies_to: "claim", units: "months", amount: 6, direction: "forward", starts: "act",
      roll: true, closures: "judicial",
      citation: "Cal. Gov. Code § 911.2(a) (death, personal injury, personal property, growing crops)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "claim_presentation_other", applies_to: "claim", units: "years", amount: 1, direction: "forward", starts: "act",
      roll: true, closures: "judicial", citation: "Cal. Gov. Code § 911.2(a) (any other claim)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "claim_suit_after_rejection", applies_to: "claim", units: "months", amount: 6, direction: "forward", starts: "served",
      roll: true, closures: "judicial", citation: "Cal. Gov. Code § 945.6(a)(1)", status: "researched", basis: "2026-10-05 time-law" },
    /* "within 20 days (excepting Saturdays, Sundays, and legal public holidays) after the receipt". */
    { rule: "foia_response", applies_to: "records_request", units: "days", amount: 20, count: "business", direction: "forward",
      starts: "received", closures: "federal",
      extension: { days: 10, count: "business", when: "unusual circumstances, by written notice to the requester",
        citation: "5 U.S.C. § 552(a)(6)(B)(i)" },
      tolling: [{ when: "the agency awaits information it reasonably requested from the requester", citation: "5 U.S.C. § 552(a)(6)(A)(ii)(I)" },
        { when: "the agency awaits clarification of the requester's fee assessment", citation: "5 U.S.C. § 552(a)(6)(A)(ii)(II)" }],
      citation: "5 U.S.C. § 552(a)(6)(A)(i)", status: "researched", basis: "2026-10-05 time-law" },
  ],
  weekend: { days: ["sat", "sun"], citation: "Cal. Code Civ. Proc. § 12a(a); Cal. Gov. Code § 6700(a); 5 U.S.C. § 552(a)(6)(A)(i)",
    status: "researched", basis: "2026-10-05 time-law" },
  computation: [
    { key: "ccp_12", rule: "exclude_first_include_last", citation: "Cal. Code Civ. Proc. § 12; Cal. Gov. Code § 6800",
      status: "researched", basis: "2026-10-05 time-law" },
    /* "if a special meeting is called for a Monday, notice shall be deemed timely made if … made no later than 12:00
       p.m. (noon) on the preceding Friday" */
    { key: "omc_monday_special", rule: "monday_prior_friday_noon", citation: "Oakland Mun. Code § 2.20.070(C)",
      status: "researched", basis: "2026-10-05 time-law" },
  ],
  /* Legistar's PersonId, the register that issues it (legistar-events §1; B1b.4). */
  identifier_schemes: [
    { scheme: "legistar_person_id", label: "Legistar PersonId", entity_kinds: ["person"], space: "person", form: "legistar-person",
      systems: ["oakland.legistar"], basis: "2026-10-05 legistar-events" },
  ],
  /* K1493: a public official's home address or telephone number, removed within 48 hours of a written demand. */
  lawful_demands: [
    { kind: "official_home_contact", label: "demand by a public official to remove their home address or telephone number",
      covers: ["home_address", "phone"], within: { amount: 48, units: "hours" }, citation: "Cal. Gov. Code § 7928.215",
      status: "ruled", basis: "K1493" },
  ],
  /* Design Requirement 8's legal organisations, as Bob named them (K283 (2), K303): each takes up the
     Tier 3 kinds given here; none takes up consent_decree_motion. Their public websites are unmeasured. */
  legal_organisations: [
    { name: "Howard Jarvis Taxpayers Association", evaluates: ["assessment_challenge", "taxpayer_action"],
      contacts: [{ how: "web", value: "https://www.hjta.org" }], basis: "UNMEASURED" },
    { name: "First Amendment Coalition", evaluates: ["constitutional_claim"],
      contacts: [{ how: "web", value: "https://firstamendmentcoalition.org" }], basis: "UNMEASURED" },
  ],
  /* Each office's published closure days for 2026, by the list that governs it (K925). The City's and the
     State's are employers' paid-holiday lists, read as closure days (K925 (2)); the City's 09-09 and 11-11,
     marked "(HVA) If applicable", are left out until a member confirms (K925 (3)). The county's own list
     (M-188) governs no office the profile names, and none names the Civil Grand Jury's: a business-day count
     for it, for the records portal, and into 2027 (no list published) is undetermined (R27, R33). */
  holidays: [
    { year: 2026, offices: [{ venue: "records_petition" }], days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-01-19", name: "Martin Luther King Jr.'s Birthday" },
      { date: "2026-02-12", name: "Lincoln's Birthday" }, { date: "2026-02-16", name: "Washington's Birthday" },
      { date: "2026-03-31", name: "Pursuant to Code of Civil Procedure Section 135" }, { date: "2026-05-25", name: "Memorial Day" },
      { date: "2026-06-19", name: "Juneteenth" }, { date: "2026-07-03", name: "Independence Day" },
      { date: "2026-09-07", name: "Labor Day" }, { date: "2026-09-25", name: "Native American Day" },
      { date: "2026-11-11", name: "Veteran's Day" }, { date: "2026-11-26", name: "Thanksgiving Day" },
      { date: "2026-11-27", name: "Day after Thanksgiving" }, { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "M-189" },
    { year: 2026, offices: ["Controller", "City Council", "City Auditor"], days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-01-19", name: "Dr. Martin Luther King, Jr. Day" },
      { date: "2026-02-16", name: "President's Day" }, { date: "2026-03-31", name: "Cesar Chavez Day" },
      { date: "2026-05-25", name: "Memorial Day" }, { date: "2026-06-19", name: "Juneteenth National Independence Day" },
      { date: "2026-07-04", name: "Independence Day" }, { date: "2026-09-07", name: "Labor Day" },
      { date: "2026-11-26", name: "Thanksgiving Day" }, { date: "2026-11-27", name: "Day After Thanksgiving" },
      { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "M-190" },
    { year: 2026, offices: ["State Controller"], days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-01-19", name: "Martin Luther King Jr. Day" },
      { date: "2026-02-16", name: "Presidents' Day" }, { date: "2026-03-31", name: "Cesar Chavez Day" },
      { date: "2026-05-25", name: "Memorial Day" }, { date: "2026-07-04", name: "Independence Day" },
      { date: "2026-09-07", name: "Labor Day" }, { date: "2026-11-11", name: "Veteran's Day" },
      { date: "2026-11-26", name: "Thanksgiving Day" }, { date: "2026-11-27", name: "Day after Thanksgiving" },
      { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "M-191" },
    /* The closure lists rules name (R47). The judicial holidays of CCP §135 for 2026 are the court's published days
       (M-189): Columbus Day is not one (AB 268), Native American Day is. The City's list (M-190) is the "holidays"
       of an Oakland ordinance (K1504 (5)) and the portal's observed practice. The legal public holidays of 5 U.S.C.
       §6103(a) for 2026, by the statute's own dates (Independence Day falls on a Saturday). No other year is
       sourced, so a count reaching one is undetermined (R33). */
    { year: 2026, list: "judicial", citation: "Cal. Code Civ. Proc. § 135", days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-01-19", name: "Martin Luther King Jr.'s Birthday" },
      { date: "2026-02-12", name: "Lincoln's Birthday" }, { date: "2026-02-16", name: "Washington's Birthday" },
      { date: "2026-03-31", name: "Cesar Chavez Day" }, { date: "2026-05-25", name: "Memorial Day" },
      { date: "2026-06-19", name: "Juneteenth" }, { date: "2026-07-03", name: "Independence Day (observed)" },
      { date: "2026-09-07", name: "Labor Day" }, { date: "2026-09-25", name: "Native American Day" },
      { date: "2026-11-11", name: "Veterans Day" }, { date: "2026-11-26", name: "Thanksgiving Day" },
      { date: "2026-11-27", name: "Day after Thanksgiving" }, { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "M-189, 2026-10-05 time-law" },
    { year: 2026, list: "city", citation: "City of Oakland holiday list (M-190); Oakland Mun. Code § 2.20.070 \"holidays\" (K1504 (5))", days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-01-19", name: "Dr. Martin Luther King, Jr. Day" },
      { date: "2026-02-16", name: "President's Day" }, { date: "2026-03-31", name: "Cesar Chavez Day" },
      { date: "2026-05-25", name: "Memorial Day" }, { date: "2026-06-19", name: "Juneteenth National Independence Day" },
      { date: "2026-07-04", name: "Independence Day" }, { date: "2026-09-07", name: "Labor Day" },
      { date: "2026-11-26", name: "Thanksgiving Day" }, { date: "2026-11-27", name: "Day After Thanksgiving" },
      { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "M-190, 2026-10-05 time-law" },
    { year: 2026, list: "federal", citation: "5 U.S.C. § 6103(a)", days: [
      { date: "2026-01-01", name: "New Year's Day" }, { date: "2026-01-19", name: "Birthday of Martin Luther King, Jr." },
      { date: "2026-02-16", name: "Washington's Birthday" }, { date: "2026-05-25", name: "Memorial Day" },
      { date: "2026-06-19", name: "Juneteenth National Independence Day" }, { date: "2026-07-04", name: "Independence Day" },
      { date: "2026-09-07", name: "Labor Day" }, { date: "2026-10-12", name: "Columbus Day" },
      { date: "2026-11-11", name: "Veterans Day" }, { date: "2026-11-26", name: "Thanksgiving Day" },
      { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "2026-10-05 time-law" },
  ],
};
