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
 *   policy series (T35)            the City's Administrative Instructions, OPD's General Orders, Special Orders and
 *                                  Training Bulletins, OUSD's Board Policies and Administrative Regulations, each read
 *                                  on its primary pages 2026-10-07 (the pages and the citations measured are in
 *                                  `test/fixtures/policies.mjs`), with the header labels they print (R67, R69), and
 *                                  the CALEA standards OPD's General Orders cite by designation (K1930).
 *   Legistar's ids (T34)           the `body` and `office` spaces, their schemes and the counterparties' BodyIds, from
 *                                  legistar-reader's captured `bodies` and `officerecords` (2026-10-05; R61). The
 *                                  MemberTypes measured (Member, Chair) mapped on the Council only: elsewhere they sit
 *                                  on elected and appointed holders alike (R60, K1729). No `vote_values`: two captured
 *                                  roll calls show only Aye and Excused, not the whole set (R58). No institution scheme
 *                                  until a registry is measured (N632, K1729).
 *   T45's action facts (R85)       each read on its primary source on 2026-10-11 (the operative text quoted, with its
 *                                  worked examples, in `test/fixtures/actions-law.mjs` and the job record
 *                                  `build/jobs/T45/jurisdictions.md`): whose duty each deadline is; the Brown Act's
 *                                  cure-and-correct demand and its periods; the grand jury's comment periods and the
 *                                  statuses Penal Code § 933.05 sets; the anti-SLAPP motion's period; the Claims Act
 *                                  board's 45 days; FOIA's appeal; the legal facts shown at their moment; the stages and
 *                                  requesters of each records law; FAC's defence scope; the federal 2027 list. What no
 *                                  source supports is absent, never `UNMEASURED` (R44, R83): no office keeps another time
 *                                  zone (M-T45-3); no 2027 judicial or City list is published; no procedure guide,
 *                                  template, venue fact or phrasing is written here.
 *   pointers (T48, R92)            where else a member is sent, each read on the body's own page on 2026-10-14 (the
 *                                  address read is its source; the reads, with the words each fact rests on, are in
 *                                  `test/fixtures/pointers.mjs` and the job record `build/jobs/T48/jurisdictions.md`):
 *                                  legal aid as the State Bar's Pro Bono Opportunities Directory lists it under Alameda
 *                                  County (every program there a Legal Services Trust Fund grantee); the Superior Court's
 *                                  and the Judicial Council's self-help pages; OAK 311; each office on the Council's
 *                                  roster; the offices whose own pages take one person's complaint; newsrooms' own tip
 *                                  pages. No emergency number is held (DEC-227 (4)).
 *
 * Plain data: patterns are `{re, flags?}` with a JavaScript regular-expression source. */
const R = String.raw;
/* The organisation the City's offices are part of (Charter §§200, 403, 504; time-law §2), by name and kind (R59). */
const CITY = { label: "City of Oakland", kind: "institution", ids: [] };

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
    /* A Legistar BodyId and OfficeRecordId (`/v1/oakland/bodies`, 151 bodies, 1–283; `/v1/oakland/officerecords`, 1,262
       records, 1–1552; read 2026-10-05, legistar-events §7): a body's number and one seat's holding (N569, N613). */
    body: {
      label: "body number in the legislative record",
      forms: [
        { form: "legistar-body", pattern: { re: R`^(\d{1,6})$` }, normal: [{ group: 1 }], clean: { spaces: "remove" },
          basis: "2026-10-05 legistar-events" },
      ],
    },
    office: {
      label: "office record number in the legislative record",
      forms: [
        { form: "legistar-office-record", pattern: { re: R`^(\d{1,7})$` }, normal: [{ group: 1 }], clean: { spaces: "remove" },
          basis: "2026-10-05 legistar-events" },
      ],
    },
    /* A proceeding's number in its forum's forms (courts-workbooks §1; K1452): the Superior Court's current and legacy
       civil numbers, a federal district docket number and CourtListener's docket_number_core, a CPUC proceeding. */
    proceeding: {
      label: "proceeding or case number",
      forms: [
        { form: "alameda-civil", pattern: { re: R`^(\d{2}CV\d{6})$` }, normal: [{ group: 1 }], clean: { spaces: "remove", upper: true },
          basis: "2026-10-05 courts-workbooks" },
        { form: "alameda-legacy", pattern: { re: R`^((?:RG|HG)\d{8})$` }, normal: [{ group: 1 }], clean: { spaces: "remove", upper: true },
          basis: "2026-10-05 courts-workbooks" },
        { form: "federal-district", pattern: { re: R`^(\d):(\d{2})-(cv|cr|mc|md|mj|bk|ap)-(\d{5})((?:-[A-Z]{2,4})*)$` },
          normal: [{ group: 1 }, ":", { group: 2 }, "-", { group: 3 }, "-", { group: 4 }, { group: 5, default: "" }], clean: { spaces: "remove" },
          basis: "2026-10-05 courts-workbooks" },
        { form: "docket-core", pattern: { re: R`^(\d{7,8})$` }, normal: [{ group: 1 }], clean: { spaces: "remove" }, basis: "2026-10-05 courts-workbooks" },
        { form: "cpuc", pattern: { re: R`^([ARICPK])\.?(\d{2})-?(\d{2})-?(\d{3})$` },
          normal: [{ group: 1 }, { group: 2 }, { group: 3 }, { group: 4 }], clean: { spaces: "remove", upper: true }, basis: "2026-10-05 courts-workbooks" },
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
    /* The three court registers (courts-workbooks §1): a CourtListener docket page, a CPUC proceeding card and its
       documents report, and the Superior Court's eCourt portal (login-gated; a member's own capture, K1492). */
    { origin: "courtlistener_docket", name: "CourtListener docket pages (Free Law Project)", hosts: ["www.courtlistener.com"],
      path: { re: R`^\/docket\/\d+\/` }, basis: "2026-10-05 courts-workbooks" },
    { origin: "cpuc_proceeding", name: "the California Public Utilities Commission's proceeding cards", hosts: ["apps.cpuc.ca.gov"],
      path: { re: R`^\/apex\/f\?p=401:5[67]:` }, basis: "2026-10-05 courts-workbooks" },
    { origin: "ecourt_roa", name: "the Alameda County Superior Court's eCourt public portal", hosts: ["eportal.alameda.courts.ca.gov"],
      basis: "2026-10-05 courts-workbooks" },
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
         headed `2.20.070 - Title.` (time-law §4–§5); its subsections print `A.`, `1.`, `a.`, `i.`, `(1)` (doctypes'
         codifier fixtures, K1521). */
      { key: "omc", label: "O.M.C.", pattern: { re: R`O\.?M\.?C\.?|Oakland\s+Municipal\s+Code`, flags: "i" },
        copy: "codifier", sections: { number: { re: R`\d+\.\d+\.\d+[A-Z]?` }, separators: ".",
          markers: ["letter", "numeral", "letter", "roman", "paren_numeral"] },
        basis: "M-24, 2026-10-05 time-law, 2026-10-05 doctypes" },
      /* The City Charter, served by the same codifier as article-level docs; its sections print `Section 200.`, one
         part, their subsections `(a)`, `(1)`, `(a)`, `i.` (time-law §2, §4; K1514, K1521). */
      { key: "charter", label: "Oakland City Charter", pattern: { re: R`(?:Oakland\s+)?City\s+Charter`, flags: "i" },
        copy: "codifier", sections: { number: { re: R`\d{3,4}` }, separators: "", markers: ["paren_letter", "paren_numeral", "paren_letter", "roman"] },
        basis: "2026-10-05 time-law, 2026-10-05 doctypes" },
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
    /* Legistar's office records (1,262, read 2026-10-05): MemberType `Member` 1,135, `Chair` 126. On the Council's own body
       every holder is a councilmember, elected (Charter §200); on other bodies the same types carry councilmembers, other
       bodies' members and appointees alike (the Port's, the school board's, the county's), so no entry there (K1729). */
    member_types: [
      { member_type: "Member", organisation: "city_council", capacity: "elected", basis: "2026-10-05 legistar-events, 2026-10-05 time-law" },
      { member_type: "Chair", organisation: "city_council", capacity: "elected", basis: "2026-10-05 legistar-events, 2026-10-05 time-law" },
    ],
    /* The City's own rosters and organisation charts (roster-reader's fixtures, 15 documents read 2026-10-05; K1517).
       A term column's header is left unnamed. */
    roster_words: [
      { pattern: { re: R`\brosters?\b`, flags: "i" }, kind: "roster", basis: "2026-10-05 roster-reader" },
      { pattern: { re: R`\borgani[sz]ational\s+chart\b|\borg\s+chart\b`, flags: "i" }, kind: "chart", basis: "2026-10-05 roster-reader" },
    ],
    staff_titles: [
      { pattern: { re: R`\b(?:Co-|Vice\s+)?Chair\b`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { pattern: { re: R`\b(?:(?:Assistant|Deputy)\s+)?City\s+Administrator\b`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { pattern: { re: R`\bCity\s+(?:Attorney|Clerk)\b`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { pattern: { re: R`\b(?:Director|Manager|Chief|Supervisor|Coordinator|Analyst|Inspector|Engineer|Custodian|Leader|Officer|Parliamentarians?|Accountant|Intern)\b`, flags: "i" },
        basis: "2026-10-05 roster-reader" },
    ],
    roster_headers: [
      { role: "name", pattern: { re: R`^(?:Full\s+)?Name$`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { role: "title", pattern: { re: R`^(?:Title|Position|Job\s+Title)$`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { role: "unit", pattern: { re: R`^(?:Department|Division|Organization)$`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { role: "employee_id", pattern: { re: R`^Employee\s+ID$`, flags: "i" }, basis: "2026-10-05 roster-reader" },
      { role: "contact", pattern: { re: R`^(?:Phone|Email|Address)$`, flags: "i" }, basis: "2026-10-05 roster-reader" },
    ],
    /* The ACFRs (FY2012–FY2025) and the adopted budget books (money-people §1c, §4, §7; K1513). Some years' headings
       are letter-spaced ("Primary Gove rnme nt"), so headings match whitespace-tolerantly. */
    financial_report_titles: [
      { pattern: { re: R`\b(?:Annual\s+Comprehensive|Comprehensive\s+Annual)\s+Financial\s+Report\b`, flags: "i" }, basis: "2026-10-05 money-people" },
    ],
    budget_book_titles: [
      { pattern: { re: R`\b(?:Adopted|Proposed)\s+(?:Policy\s+)?Budget\b`, flags: "i" }, basis: "2026-10-05 money-people" },
    ],
    financial_headings: [
      "Statement of Net Position", "Statement of Activities", "Statement of Cash Flows", "Balance Sheet", "Budget and Actual",
      "Summary Table By Fund", "Citywide Classification Summary", "Property Tax Levies and Collections",
      /* the budget book's OpenGov-rendered pages (BB23 p148; the department pages, p283) */
      "General Purpose Fund Revenue", "Expenditures By Fund",
    ].map((h) => ({ pattern: { re: h.replace(/ /g, "").split("").join(R`\s*`), flags: "i" }, basis: "2026-10-05 money-people" })),
    fiscal_year_forms: [
      /* a biennial budget: FY13-15, FY2023-25, FY25-27 */
      { pattern: { re: R`\bFY\s?(\d{2}|\d{4})-(\d{2})\b`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      /* an ACFR's year: FY2024 */
      { pattern: { re: R`\bFY\s?(\d{4})\b(?!-)`, flags: "i" }, basis: "2026-10-05 money-people" },
    ],
    /* The headers of the Socrata budget line items, FY2013-15 `vmzx-e5fe` (budget, department, org_code, fund_code,
       project_code, program_code, account_code, amount), FY2015-17 `urid-amga` (budget_year_name, …, org, fund, amt) and
       FY2019-21 `m4jd-q2c4` (prog, acct, and one amount column per period such as fy18_19_midcycle_adopted)
       (money-people §2, legistar-events §3; read by BUDGET-DOCTYPES, P9). */
    /* The labels the families' documents print in their header blocks (R69): an AI's SUBJECT (SUBJECT/AGENCY on AI 544),
       NUMBER, REFERENCE, EFFECTIVE, SUPERSEDE; a DGO's Effective Date (with or without its colon), New Order or Rev. (the
       date an older order took effect), Ref (its CALEA references), Index as, Coordinator, Evaluation Coordinator,
       Evaluation Due Date or Evaluation Date, Automatic Revision Cycle; a Training Bulletin's Index Number; a Special
       Order's SUBJECT, EFFECTIVE DATE or DATE; OUSD's type lines. Measured on the families' primary pages (2026-10-07
       policies) and on the 50 policies doctypes captured from them the same day (K1930; `test/fixtures/policies.mjs`).
       Written without a trailing colon: a reader takes the label with or without one. */
    /* R77 (T45): Penal Code § 933.05 sets the statuses in which a body answers a grand jury report: one of two per
       finding ((a)), one of four per recommendation ((b)). */
    response_statuses: [
      { status: "finding_agreed", label: "The respondent agrees with the finding", citation: "Cal. Penal Code § 933.05(a)(1)", applies_to: "grand_jury", basis: "2026-10-11 actions-law" },
      { status: "finding_disputed", label: "The respondent disagrees wholly or partially with the finding", citation: "Cal. Penal Code § 933.05(a)(2)", applies_to: "grand_jury", basis: "2026-10-11 actions-law" },
      { status: "recommendation_implemented", label: "The recommendation has been implemented", citation: "Cal. Penal Code § 933.05(b)(1)", applies_to: "grand_jury", basis: "2026-10-11 actions-law" },
      { status: "recommendation_will_be_implemented", label: "The recommendation has not yet been implemented, but will be implemented in the future", citation: "Cal. Penal Code § 933.05(b)(2)", applies_to: "grand_jury", basis: "2026-10-11 actions-law" },
      { status: "recommendation_requires_analysis", label: "The recommendation requires further analysis", citation: "Cal. Penal Code § 933.05(b)(3)", applies_to: "grand_jury", basis: "2026-10-11 actions-law" },
      { status: "recommendation_not_implemented", label: "The recommendation will not be implemented because it is not warranted or is not reasonable", citation: "Cal. Penal Code § 933.05(b)(4)", applies_to: "grand_jury", basis: "2026-10-11 actions-law" },
    ],
    policy_headers: [
      { field: "type", pattern: { re: R`\bADMINISTRATIVE\s+INSTRUCTION\b` }, basis: "2026-10-07 policies" },
      { field: "type", pattern: { re: R`\bDEPARTMENTAL\s+GENERAL\s+ORDER\b` }, basis: "2026-10-07 policies" },
      { field: "type", pattern: { re: R`\bSPECIAL\s+ORDER\s+(?:NO\.\s*)?\d` }, basis: "2026-10-07 policies" },
      { field: "type", pattern: { re: R`\bTRAINING\s+BULLETIN\b` }, basis: "2026-10-07 policies" },
      { field: "type", pattern: { re: R`^\s*(?:Board\s+Policy|Administrative\s+Regulation)\s*$` }, basis: "2026-10-07 policies" },
      { field: "number", pattern: { re: R`\bNUMBER\b|\bIndex\s+Number\b` }, basis: "2026-10-07 policies" },
      { field: "title", pattern: { re: R`\bSUBJECT(?:\/AGENCY)?\b|\bIndex\s+as\b` }, basis: "2026-10-07 policies" },
      { field: "effective", pattern: { re: R`\bEFFECTIVE(?:\s+DATE)?\b|\bEffective\s+Date\b|\bDATE\b|\bNew\s+Order\b|\bRev\.` }, basis: "2026-10-07 policies" },
      { field: "supersedes", pattern: { re: R`\bSUPERSEDE\b` }, basis: "2026-10-07 policies" },
      { field: "reference", pattern: { re: R`\bREFERENCE\b|\bRef\b` }, basis: "2026-10-07 policies" },
      { field: "coordinator", pattern: { re: R`\b(?:Evaluation\s+)?Coordinator\b` }, basis: "2026-10-07 policies" },
      { field: "review_due", pattern: { re: R`\bEvaluation\s+(?:Due\s+)?Date\b` }, basis: "2026-10-07 policies" },
      { field: "revision_cycle", pattern: { re: R`\bAutomatic\s+Revision\s+Cycle\b` }, basis: "2026-10-07 policies" },
    ],
    budget_headers: [
      { column: "fund", pattern: { re: R`^fund(?:_code)?$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "org", pattern: { re: R`^org(?:_code)?$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "program", pattern: { re: R`^(?:program(?:_code)?|prog)$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "account", pattern: { re: R`^(?:account(?:_code)?|acct)$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "project", pattern: { re: R`^project(?:_code)?$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "department", pattern: { re: R`^department$`, flags: "i" }, basis: "2026-10-05 legistar-events" },
      { column: "amount", pattern: { re: R`^(?:amount|amt)$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "amount", pattern: { re: R`^fy\d{2}_\d{2}_[a-z0-9_]+$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
      { column: "period", pattern: { re: R`^(?:budget|budget_year_name)$`, flags: "i" }, basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
    ],
  },

  practice: {
    /* A threshold for raising a question, never for asserting a violation: OMC 2.20.160's draft minutes, "no later
       than ten business days after the meeting" (time-law §2; K1504), correcting the code's earlier 21 days; an ordinance's
       business days skip the City's list (K1504 (5), K1533). */
    minutes_due_days: { value: 10, count: "business", closures: "city", basis: "2026-10-05 time-law" },
  },
  locale: { value: "en-US", basis: "UNMEASURED" },
  /* California's statutory time (Gov. Code § 6808), by its IANA name. */
  time_zone: { value: "America/Los_Angeles", status: "researched", basis: "M-187" },
  search_terms: [
    { term: "oakland", basis: "UNMEASURED" },
    { term: "police", basis: "UNMEASURED" },
  ],
  records_laws: [
    /* R76 (T45): each law's stages in its own order, in the product's stage names, with the law's own term; a stage the
       law lacks is absent: the CPRA has no fee waiver and no administrative appeal, and charges direct costs of
       duplication with no estimate stage (§ 7922.530(a)); mediation under OMC 2.20.270(C) is an action of its own (v0.2 §5). */
    { level: "state", name: "California Public Records Act", citation: "Cal. Gov. Code § 7920.000 et seq.",
      stages: [
        { stage: "request", label: "request for a copy of records", citation: "Cal. Gov. Code § 7922.530(a)" },
        { stage: "extension_notice", label: "written notice extending the time limit in unusual circumstances", citation: "Cal. Gov. Code § 7922.535(b)" },
        { stage: "production", label: "records made promptly available", citation: "Cal. Gov. Code § 7922.530(a)" },
        { stage: "denial", label: "written determination that the request is denied", citation: "Cal. Gov. Code § 7922.540(a)" },
        { stage: "court_filing", label: "verified petition to the superior court", citation: "Cal. Gov. Code §§ 7923.000, 7923.100" }],
      requesters: { text: "any person, including a corporation, partnership, firm or association; no purpose need be given",
        citation: "Cal. Gov. Code §§ 7920.520, 7921.300, 7922.530(a)", status: "researched", basis: "2026-10-11 actions-law" },
      response: "records_response", basis: "D-149" },
    /* The City's own records law, whose Immediate Disclosure Request is OMC 2.20.230 (time-law §2). */
    { level: "city", name: "Oakland Sunshine Ordinance", citation: "Oakland Mun. Code ch. 2.20",
      stages: [
        { stage: "request", label: "Immediate Disclosure Request", citation: "Oakland Mun. Code § 2.20.230(A), (B)" },
        { stage: "extension_notice", label: "advice that additional time is needed", citation: "Oakland Mun. Code § 2.20.230(A), (B)" },
        { stage: "production", label: "disclosable records provided for inspection or copying", citation: "Oakland Mun. Code § 2.20.230(B)" },
        { stage: "denial", label: "withholding justified in writing", citation: "Oakland Mun. Code § 2.20.250" },
        { stage: "court_filing", label: "proceedings for injunctive relief, declaratory relief, or writ of mandate", citation: "Oakland Mun. Code § 2.20.270(B)(1)" }],
      requesters: { text: "any person; no reason or use need be stated", citation: "Oakland Mun. Code §§ 2.20.230(D), 2.20.270(B)(1)",
        status: "researched", basis: "2026-10-11 actions-law" },
      response: "immediate_disclosure", basis: "2026-10-05 time-law" },
    /* R95 (T51, C64): read live 2026-10-21 on the official text, the United States Code (2024 Edition) as govinfo.gov prints
       it, never from memory (`test/fixtures/foia-text.mjs`); the 20-day determination and the appeal are clause (A)(i)'s and (ii)'s. */
    { level: "federal", name: "Freedom of Information Act", citation: "5 U.S.C. § 552",
      stages: [
        { stage: "request", label: "request for records", citation: "5 U.S.C. § 552(a)(3)(A)" },
        { stage: "fee_waiver_request", label: "request for a waiver or reduction of fees", citation: "5 U.S.C. § 552(a)(4)(A)(iii)" },
        { stage: "extension_notice", label: "written notice of unusual circumstances", citation: "5 U.S.C. § 552(a)(6)(B)(i)" },
        { stage: "production", label: "records made promptly available", citation: "5 U.S.C. § 552(a)(3)(A)" },
        { stage: "denial", label: "determination denying the request", citation: "5 U.S.C. § 552(a)(6)(A)(i)" },
        { stage: "appeal", label: "appeal of an adverse determination", citation: "5 U.S.C. § 552(a)(6)(A)(i)" },
        { stage: "appeal_decision", label: "determination on the appeal", citation: "5 U.S.C. § 552(a)(6)(A)(ii)" },
        { stage: "court_filing", label: "complaint in the district court", citation: "5 U.S.C. § 552(a)(4)(B)" }],
      requesters: { text: "any person; an element of the intelligence community does not make records available to a foreign government entity or its representative",
        citation: "5 U.S.C. § 552(a)(3)(A), (E)", status: "researched", basis: "2026-10-21 foia-text" },
      response: "foia_response", basis: "2026-10-21 foia-text" },
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
    /* Oakland's policy series (R67; K1742, DEC-145 (8)), each family its own entry, its cite measured on the citations its
       primary pages print (2026-10-07 policies; the pages and strings in `test/fixtures/policies.mjs`). The City's and
       OPD's families are the City's (level city); OUSD's are a government's at no law level (sector government, R31). */
    { source: "City of Oakland Administrative Instructions", kind: "policy", issuer: "City Administrator", level: "city",
      key: "city-administrator", series: { key: "ai", label: "Administrative Instruction" },
      cite: { re: R`\b(?:(?:City\s+)?Administrative\s+Instruction|A\.I\.|AI)\s+(?:No\.\s*)?(?<number>\d{1,4})\b` }, basis: "2026-10-07 policies" },
    /* A DGO's number is written padded or not (K-03, K-3; B-06, B-6 in the Special Orders that revise it): its normal form
       drops the padding and keeps every digit. One portion is printed with it: "DGO K-03: II C". */
    { source: "Oakland Police Department Departmental General Orders", kind: "policy", issuer: "Office of Chief of Police, Oakland Police Department",
      level: "city", key: "opd", series: { key: "dgo", label: "Departmental General Order" },
      cite: { re: R`\b(?:DGOs?|Departmental\s+General\s+Orders?(?:\s+\(DGO\))?)\s+(?<number>([A-Z])-(\d{1,2})(\.\d{1,2})?)(?::\s+(?<portion>[IVX]+(?:\s[A-Z])?)\b)?` },
      normal: [{ group: 2 }, "-", { group: 3, unpad: true }, { group: 4, default: "" }], basis: "2026-10-07 policies" },
    { source: "Oakland Police Department Special Orders", kind: "policy", issuer: "Office of Chief of Police, Oakland Police Department",
      level: "city", key: "opd", series: { key: "so", label: "Special Order" },
      cite: { re: R`\b(?:Special\s+Orders?|SPECIAL\s+ORDER|SO)\s+(?:NO\.\s*)?(?<number>\d{4})\b` }, basis: "2026-10-07 policies" },
    /* A Training Bulletin's index number is a roman numeral, a letter and an optional point number, joined by a hyphen or
       a space (III-P.05, I F.06): its normal form joins them by a hyphen. */
    { source: "Oakland Police Department Training Bulletins", kind: "policy", issuer: "Office of Chief of Police, Oakland Police Department",
      level: "city", key: "opd", series: { key: "tb", label: "Training Bulletin" },
      cite: { re: R`\b(?:Training\s+Bulletins?|TB)\s+(?<number>([IVX]+)[ -]([A-Z])(\.\d{1,2})?)\b` },
      normal: [{ group: 2 }, "-", { group: 3 }, { group: 4, default: "" }], basis: "2026-10-07 policies" },
    { source: "Oakland Unified School District Board Policies", kind: "policy", issuer: "Oakland Unified School District Governing Board",
      sector: "government", key: "ousd", series: { key: "bp", label: "Board Policy" },
      cite: { re: R`\bBP(?:\/AR)?\s+(?<number>\d{4}(?:\.\d{1,2})?)\b` }, basis: "2026-10-07 policies" },
    { source: "Oakland Unified School District Administrative Regulations", kind: "policy", issuer: "Oakland Unified School District",
      sector: "government", key: "ousd", series: { key: "ar", label: "Administrative Regulation" },
      cite: { re: R`\b(?:BP\/)?AR\s+(?<number>\d{4}(?:\.\d{1,2})?)\b` }, basis: "2026-10-07 policies" },
    /* The accreditor's standards OPD's General Orders cite in their headers ("Ref: CALEA Standards 15.1.1; 15.1.2", on 12
       of the orders doctypes captured, K1930): a standard OPD cites, held by its designation (R63, R67). No edition is
       printed with it. */
    { source: "CALEA Standards for Law Enforcement Agencies", kind: "standard",
      issuer: "Commission on Accreditation for Law Enforcement Agencies (CALEA)", sector: "association",
      key: "calea", series: { key: "standards", label: "CALEA Standard" },
      cite: { re: R`\bCALEA[\s:]+Standards?:?\s+(?<number>\d{1,3}\.\d{1,2}\.\d{1,2})\b` }, basis: "2026-10-07 policies" },
  ],
  /* Hours only where the office publishes them (M-192). The Controller's Bureau (M-195), the City Council (M-196)
     and the Civil Grand Jury (M-194) publish none, and the State Controller's Office could not be read: their hours
     are absent, undetermined (R27, K925). Each office rests on its primary source (time-law §2): Charter §504(e)
     (an appointed Director of Finance), Charter §200 (eight elected Councilmembers), Penal Code §§888, 925a (the
     grand jury, which may examine any city's books), Charter §403(1) (the elected City Auditor), Cal. Const. art. V
     §11 (the elected Controller). The City's three offices carry their Legistar BodyId (`/v1/oakland/bodies`, read
     2026-10-05): the Council's own body (1, "Meeting of the Oakland City Council", whose variants the body-variant map
     names `city_council`), and the Auditor's and Finance's Requestor bodies, whose names are written here as Legistar
     gives them (16, 171; K1690). No source read gives the City an identifier in a scheme this profile holds, so `within`
     names it with none. No office record measured is a counterparty's (they are the Council's and committees' seats). */
  counterparties: [
    { role: "Controller", body: "Finance Department", level: "city", elected: false,
      ids: { body: { scheme: "legistar_body_id", id: "171" } }, within: CITY,
      basis: "2026-10-05 time-law, 2026-10-05 legistar-events" },
    { role: "City Council", body: "Oakland City Council", level: "city", elected: true,
      ids: { body: { scheme: "legistar_body_id", id: "1" } }, within: CITY, organisation: "city_council",
      basis: "2026-10-05 time-law, 2026-10-05 legistar-events" },
    { role: "Civil Grand Jury", body: "Alameda County Civil Grand Jury", level: "county", elected: false, oversight: true, basis: "2026-10-05 time-law" },
    /* Design Requirement 8's "City Auditor whistleblower complaints"; its system is oakland.auditor. */
    { role: "City Auditor", body: "Office Of The City Auditor", level: "city", elected: true, oversight: true,
      hours: { weekly: ["mon", "tue", "wed", "thu", "fri"].map((day) => ({ day, open: "08:30", close: "17:00" })),
        status: "researched", basis: "M-192" },
      ids: { body: { scheme: "legistar_body_id", id: "16" } }, within: CITY,
      basis: "2026-10-05 time-law, 2026-10-05 legistar-events" },
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
    /* Design Requirement 8 names "public comment at government meetings" Tier 1 (K2785). */
    { kind: "public_comment", label: "public comment to a body", tier: 1, basis: "K2785" },
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
    /* R85 (T45): the Brown Act's demand to cure or correct, a precondition of an action to void (Gov. Code § 54960.1(b)),
       at Tier 2 (K2785); and taking part as a formal party before a venue, Tier 2 with its advisory (v0.2 rule 13, K2780). */
    { kind: "brown_act_demand", label: "demand to cure or correct an action taken in violation of the Brown Act", tier: 2,
      laws: ["California Government Code"],
      advisory: "File with caution: the demand must be made in writing within the period the law sets, and an action to "
        + "void must follow within 15 days of the body's answer, or be barred (Gov. Code § 54960.1(c)). Legal review before "
        + "filing is recommended.",
      basis: "K2785" },
    { kind: "party_participation", label: "taking part as a formal party before a venue", tier: 2,
      advisory: "File with caution: a party's filings are bound by the venue's own rules of practice and deadlines, and a "
        + "procedural error can cost the party its standing. Legal review before filing is recommended.",
      basis: "K2780" },
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
      owed_by: "body", citation: "Cal. Gov. Code § 7922.535(a)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "immediate_disclosure", applies_to: "records_request", units: "days", amount: 3, count: "business", direction: "forward",
      starts: "received", closures: "city", owed_by: "body", citation: "Oakland Mun. Code § 2.20.230", status: "researched", basis: "2026-10-05 time-law" },
    /* The Brown Act and OMC 2.20.070 bind a body's notice of its meeting, counted back from the meeting (the act);
       they bear on the group's comment to that body. Clock hours do not roll. */
    { rule: "agenda_posting_regular", applies_to: "public_comment", units: "hours", amount: 72, direction: "backward", starts: "act",
      owed_by: "body", citation: "Cal. Gov. Code § 54954.2(a)(1)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "special_meeting_notice", applies_to: "public_comment", units: "hours", amount: 24, direction: "backward", starts: "act",
      owed_by: "body", citation: "Cal. Gov. Code § 54956(a)", status: "researched", basis: "2026-10-05 time-law" },
    /* "at least forty-eight (48) hours (excluding Saturdays, Sundays and holidays) before the time of the meeting". */
    { rule: "omc_special_meeting_notice", applies_to: "public_comment", units: "business_hours", amount: 48, direction: "backward",
      starts: "act", closures: "city", owed_by: "body", citation: "Oakland Mun. Code § 2.20.070", status: "researched", basis: "2026-10-05 time-law" },
    /* (C): "if a special meeting is called for a Monday, notice shall be deemed timely made if … made no later than
       12:00 p.m. (noon) on the preceding Friday". Held beside the general rule; the later answer is the safe harbour
       (K1514). */
    { rule: "omc_special_meeting_monday", applies_to: "public_comment", units: "days", amount: 3, count: "calendar", direction: "backward",
      starts: "act", applies_on: ["mon"], due_at: "12:00", owed_by: "body", citation: "Oakland Mun. Code § 2.20.070(C)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "claim_presentation_injury", applies_to: "claim", units: "months", amount: 6, direction: "forward", starts: "act",
      roll: true, closures: "judicial",
      owed_by: "group", citation: "Cal. Gov. Code § 911.2(a) (death, personal injury, personal property, growing crops)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "claim_presentation_other", applies_to: "claim", units: "years", amount: 1, direction: "forward", starts: "act",
      roll: true, closures: "judicial", owed_by: "group", citation: "Cal. Gov. Code § 911.2(a) (any other claim)", status: "researched", basis: "2026-10-05 time-law" },
    { rule: "claim_suit_after_rejection", applies_to: "claim", units: "months", amount: 6, direction: "forward", starts: "served",
      roll: true, closures: "judicial", owed_by: "group", citation: "Cal. Gov. Code § 945.6(a)(1)", status: "researched", basis: "2026-10-05 time-law" },
    /* "within 20 days (excepting Saturdays, Sundays, and legal public holidays) after the receipt". */
    { rule: "foia_response", label: "answer to a first request", applies_to: "records_request", units: "days", amount: 20, count: "business", direction: "forward",
      starts: "received", closures: "federal",
      extension: { days: 10, count: "business", when: "unusual circumstances, by written notice to the requester",
        citation: "5 U.S.C. § 552(a)(6)(B)(i)" },
      tolling: [{ when: "the agency awaits information it reasonably requested from the requester", citation: "5 U.S.C. § 552(a)(6)(A)(ii)(I)" },
        { when: "the agency awaits clarification of the requester's fee assessment", citation: "5 U.S.C. § 552(a)(6)(A)(ii)(II)" }],
      owed_by: "body",
      consequence: { text: "shall be deemed to have exhausted his administrative remedies with respect to such request if the agency fails to comply with the applicable time limit provisions of this paragraph",
        citation: "5 U.S.C. § 552(a)(6)(C)(i)" },
      citation: "5 U.S.C. § 552(a)(6)(A)(i)", status: "researched", basis: "2026-10-05 time-law, 2026-10-11 actions-law" },
    /* T45 (R75, R85): each with its primary source (2026-10-11 actions-law). Day periods under California law count by
       CCP § 12 and roll on its § 12a closures, as the rules above do. Where the law states what failing a period means,
       its words are quoted as the consequence. Whose duty each earlier rule is (`owed_by`) is read off the operative text
       time-law quotes ("the legislative body shall post", "each agency … shall … determine", a claim "shall be
       presented"). */
    { rule: "claim_board_action", applies_to: "claim", units: "days", amount: 45, count: "calendar", direction: "forward", starts: "filed",
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "body",
      consequence: { text: "the claim shall be deemed to have been rejected by the board on the last day of the period within which the board was required to act upon the claim",
        citation: "Cal. Gov. Code § 912.4(c)" },
      citation: "Cal. Gov. Code § 912.4(a)", status: "researched", basis: "2026-10-11 actions-law" },
    { rule: "foia_appeal_response", label: "decision on an appeal", applies_to: "records_request", units: "days", amount: 20, count: "business", direction: "forward",
      starts: "received", closures: "federal", owed_by: "body",
      consequence: { text: "shall be deemed to have exhausted his administrative remedies with respect to such request if the agency fails to comply with the applicable time limit provisions of this paragraph",
        citation: "5 U.S.C. § 552(a)(6)(C)(i)" },
      citation: "5 U.S.C. § 552(a)(6)(A)(ii)", status: "researched", basis: "2026-10-11 actions-law" },
    /* Gov. Code § 54960.1(c)(1): the demand within 90 days of the action, or 30 when an open-session action violated
       § 54954.2 (the agenda); (c)(2)–(3): the body's 30 days to cure or correct. The 15 days to sue ((c)(4)) run from the
       group's receipt of the body's answer or from the end of the 30 days, whichever is earlier: no anchor of R26 names
       that, so it is absent and named in the job's record. */
    { rule: "brown_act_demand", applies_to: "brown_act_demand", units: "days", amount: 90, count: "calendar", direction: "forward", starts: "act",
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "group",
      citation: "Cal. Gov. Code § 54960.1(c)(1)", status: "researched", basis: "2026-10-11 actions-law" },
    { rule: "brown_act_demand_agenda", applies_to: "brown_act_demand", units: "days", amount: 30, count: "calendar", direction: "forward", starts: "act",
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "group",
      citation: "Cal. Gov. Code § 54960.1(c)(1) (an action in open session in violation of § 54954.2)", status: "researched", basis: "2026-10-11 actions-law" },
    { rule: "brown_act_cure", applies_to: "brown_act_demand", units: "days", amount: 30, count: "calendar", direction: "forward", starts: "received",
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "body",
      consequence: { text: "the inaction shall be deemed a decision not to cure or correct the challenged action", citation: "Cal. Gov. Code § 54960.1(c)(3)" },
      citation: "Cal. Gov. Code § 54960.1(c)(2)", status: "researched", basis: "2026-10-11 actions-law" },
    /* Penal Code § 933(c): the governing body's comment within 90 days after the grand jury submits its final report, an
       elected county officer's or agency head's within 60; § 933.05(b)(3): further analysis within six months of the
       report's publication. The grand jury's act starts each count. */
    { rule: "grand_jury_body_comment", applies_to: "grand_jury", units: "days", amount: 90, count: "calendar", direction: "forward",
      starts: "third_party", starter: { role: "Civil Grand Jury", body: "Alameda County Civil Grand Jury" },
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "body",
      citation: "Cal. Penal Code § 933(c)", status: "researched", basis: "2026-10-11 actions-law" },
    { rule: "grand_jury_officer_comment", applies_to: "grand_jury", units: "days", amount: 60, count: "calendar", direction: "forward",
      starts: "third_party", starter: { role: "Civil Grand Jury", body: "Alameda County Civil Grand Jury" },
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "body",
      citation: "Cal. Penal Code § 933(c) (an elected county officer or agency head)", status: "researched", basis: "2026-10-11 actions-law" },
    { rule: "grand_jury_further_analysis", applies_to: "grand_jury", units: "months", amount: 6, direction: "forward",
      starts: "third_party", starter: { role: "Civil Grand Jury", body: "Alameda County Civil Grand Jury" },
      roll: true, closures: "judicial", owed_by: "body",
      citation: "Cal. Penal Code § 933.05(b)(3)", status: "researched", basis: "2026-10-11 actions-law" },
    /* Code Civ. Proc. § 425.16(f): the special motion to strike, the group's own defence. */
    { rule: "anti_slapp_motion", applies_to: "claim", units: "days", amount: 60, count: "calendar", direction: "forward", starts: "served",
      roll: true, closures: "judicial", computation: "ccp_12", owed_by: "group", defends: true,
      citation: "Cal. Code Civ. Proc. § 425.16(f)", status: "researched", basis: "2026-10-11 actions-law" },
  ],
  weekend: { days: ["sat", "sun"], citation: "Cal. Code Civ. Proc. § 12a(a); Cal. Gov. Code § 6700(a); 5 U.S.C. § 552(a)(6)(A)(i)",
    status: "researched", basis: "2026-10-05 time-law" },
  computation: [
    { key: "ccp_12", rule: "exclude_first_include_last", citation: "Cal. Code Civ. Proc. § 12; Cal. Gov. Code § 6800",
      status: "researched", basis: "2026-10-05 time-law" },
  ],
  /* R49: the City of Oakland's fiscal year runs July 1 to June 30 and is named by its first year, written "FY 2025-26"
     (oaklandca.gov, Fiscal Year 2025-2027 Budget, "New fiscal year 2025-2026 begins on July 1"; the two-year cycle "July 1,
     2025 through June 30, 2027"; read 2026-10-22). Alameda County's runs July 1 to June 30 and is written "FY 2025-26"
     (the county's budget press release: "The new budget goes into effect from July 1, 2024, to June 30, 2025"; the Board
     letter "Fiscal Year (FY) 2025-26 Final Budget"; budget.alamedacountyca.gov; read 2026-10-22). The State Controller's
     Office keeps no entry: no page of its own was read. */
  fiscal_year: [
    ...["Finance Department", "Oakland City Council", "Office Of The City Auditor"].map((body) => ({
      body, start: "07-01", named_by: "start", label: "FY{start}-{end2}", status: "researched",
      basis: "2026-10-22 oaklandca.gov-fy2025-27-budget" })),
    { body: "Alameda County Civil Grand Jury", start: "07-01", named_by: "start", label: "FY{start}-{end2}", status: "researched",
      basis: "2026-10-22 acgov.org-budget-press-release, 2026-10-22 budget.alamedacountyca.gov-fy2025-26-board-letter" },
  ],
  /* Legistar's PersonId, BodyId and OfficeRecordId, the register that issues them (legistar-events §1, §7; B1b.4, N569,
     N613). An office record is one seat's holding: person × body × dates, the source's own key. */
  identifier_schemes: [
    { scheme: "legistar_person_id", label: "Legistar PersonId", entity_kinds: ["person"], space: "person", form: "legistar-person",
      systems: ["oakland.legistar"], basis: "2026-10-05 legistar-events" },
    { scheme: "legistar_body_id", label: "Legistar BodyId", entity_kinds: ["body"], space: "body", form: "legistar-body",
      systems: ["oakland.legistar"], basis: "2026-10-05 legistar-events" },
    { scheme: "legistar_office_record_id", label: "Legistar OfficeRecordId", entity_kinds: ["office"], space: "office",
      form: "legistar-office-record", systems: ["oakland.legistar"], basis: "2026-10-05 legistar-events" },
  ],
  /* The budget's keys (money-people §3; legistar-events §3): fund and org codes stable cycle to cycle, departments a
     dated grouping recoded as DP codes from FY19-21. */
  classification_schemes: [
    { scheme: "oakland_fund", label: "fund", kind: "fund", forms: [{ re: R`^FD_\d{4}$` }, { re: R`^\d{4}$` }],
      codes: [{ code: "1010", label: "General Purpose Fund" }], basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
    /* `OR_01111` in the budget tables; the FY2013-15 line items write the bare code (`11`, `1111`) */
    { scheme: "oakland_org", label: "organisation (org)", kind: "organisation", forms: [{ re: R`^OR_\d{5}$` }, { re: R`^\d{2,5}$` }],
      basis: "2026-10-05 money-people, 2026-10-05 legistar-events" },
    { scheme: "oakland_department", label: "department", kind: "organisation", forms: [{ re: R`^DP(?:\d{3,4}|CC0)$` }],
      codes: [{ code: "DP010", label: "Mayor" }, { code: "DP1000", label: "Police" }, { code: "DP350", label: "Transportation" },
        { code: "DP660", label: "Police Commission" }, { code: "DP700", label: "Violence Prevention" }, { code: "DPCC0", label: "Council" }],
      basis: "2026-10-05 legistar-events" },
    { scheme: "oakland_program", label: "program", kind: "program", forms: [{ re: R`^PG_[A-Z0-9]+$` }], basis: "2026-10-05 money-people" },
    { scheme: "oakland_account", label: "account", kind: "account", forms: [{ re: R`^\d{5}$` }], basis: "2026-10-05 money-people" },
    { scheme: "oakland_project", label: "project", kind: "project", forms: [{ re: R`^PJ_\d{7}$` }, { re: R`^100\d{4}$` }], basis: "2026-10-05 money-people" },
  ],
  /* K1493: a public official's home address or telephone number, removed within 48 hours of a written demand. */
  lawful_demands: [
    { kind: "official_home_contact", label: "demand by a public official to remove their home address or telephone number",
      covers: ["home_address", "phone"], within: { amount: 48, units: "hours" }, citation: "Cal. Gov. Code § 7928.215",
      status: "ruled", basis: "K1493" },
  ],
  /* R79 (T45): the legal facts shown, with their citations, at the moment they matter (each read 2026-10-11 on its primary
     source; quoted in `test/fixtures/actions-law.mjs`). Legal information, never advice: whether one applies is the
     member's to judge. */
  legal_facts: [
    { key: "recording_open_meeting", trigger: "recording",
      statement: "Anyone attending an open and public meeting of a local legislative body may record it, unless the body reasonably finds that the recording would persistently disrupt the meeting through noise, light or blocking the view.",
      citation: "Cal. Gov. Code § 54953.5(a)", status: "researched", basis: "2026-10-11 actions-law" },
    { key: "recording_consent", trigger: "recording",
      statement: "Recording a confidential communication without the consent of every party to it is a crime in California; a communication in a public gathering or an open public proceeding is not confidential.",
      citation: "Cal. Penal Code § 632(a), (c)", status: "researched", basis: "2026-10-11 actions-law" },
    { key: "lobbyist_registration", trigger: "paid_attendee",
      statement: "Anyone paid $1,000 or more in a calendar month to communicate with City officials to influence a City decision, or a salaried employee, officer or director of an organisation whose duties include doing so, is a local governmental lobbyist and must register with the Public Ethics Commission before lobbying.",
      citation: "Oakland Mun. Code §§ 3.20.030(D), 3.20.040(A)", threshold: { amount: 1000, unit: "USD in a calendar month" },
      status: "researched", basis: "2026-10-11 actions-law" },
    { key: "serial_meeting", trigger: "serial_meeting",
      statement: "A majority of a legislative body's members may not, outside a noticed meeting, use a series of communications of any kind, directly or through intermediaries, to discuss, deliberate or act on business within the body's jurisdiction.",
      citation: "Cal. Gov. Code § 54952.2(b)(1)", status: "researched", basis: "2026-10-11 actions-law" },
    { key: "campaign_spending", trigger: "pending_measure_or_candidate",
      statement: "Spending $1,000 or more in a calendar year on communications that expressly advocate for or against a clearly identified candidate or measure, not made at a candidate's or committee's behest, makes the spender a committee under the Political Reform Act.",
      citation: "Cal. Gov. Code §§ 82013(b), 82031", threshold: { amount: 1000, unit: "USD in a calendar year" },
      status: "researched", basis: "2026-10-11 actions-law" },
    { key: "anti_slapp", trigger: "threat_letter",
      statement: "A lawsuit arising from a statement made before, or about an issue under review by, a legislative, executive or judicial body, or in a public forum on an issue of public interest, may be met by a special motion to strike, filed within 60 days of service of the complaint.",
      citation: "Cal. Code Civ. Proc. § 425.16(b)(1), (e), (f)", status: "researched", basis: "2026-10-11 actions-law" },
  ],
  /* Design Requirement 8's legal organisations, as Bob named them (K283 (2), K303): each takes up the
     Tier 3 kinds given here; none takes up consent_decree_motion. HJTA's public website is unmeasured. FAC's Legal
     Hotline page (read 2026-10-11) states its scope: public records, open meetings, court access, and "First Amendment
     protections for freedom of speech and freedom of the press", a journalist facing a subpoena named among its urgent
     requests; so it is held as one that advises a group facing legal pressure against itself (R78, R85). */
  legal_organisations: [
    { name: "Howard Jarvis Taxpayers Association", evaluates: ["assessment_challenge", "taxpayer_action"],
      contacts: [{ how: "web", value: "https://www.hjta.org" }], basis: "UNMEASURED" },
    { name: "First Amendment Coalition", evaluates: ["constitutional_claim"], defends: true,
      contacts: [{ how: "web", value: "https://firstamendmentcoalition.org" }], basis: "K303, 2026-10-11 actions-law" },
  ],
  /* R92 (T48): where else to go, each read on the body's own page on 2026-10-14 (`test/fixtures/pointers.mjs`). Legal aid:
     the organisations the State Bar's Pro Bono Opportunities Directory lists under Alameda County, every one a Legal
     Services Trust Fund grantee by that directory's own words (K3190); Legal Assistance for Seniors is listed but its site
     refused the read (403), so it is absent. Hours are held only where a page prints them for the line or office named. */
  pointers: [
    { kind: "legalaid", name: "AIDS Legal Referral Panel",
      does: "Civil legal services for people living with HIV/AIDS in the Bay Area: direct representation, placement with volunteer attorneys, and connection to non-legal service providers.",
      contacts: [{ how: "phone", value: "(415) 701-1100" }, { how: "address", value: "1663 Mission Street, Suite 720, San Francisco, California 94103" }, { how: "web", value: "https://www.alrp.org/get-legal-help/" }],
      source: "https://www.alrp.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Homeless Action Center",
      does: "Free public benefits advocacy for unhoused and disabled residents of Alameda County.",
      contacts: [{ how: "phone", value: "510-775-0035" }, { how: "address", value: "2601 San Pablo Avenue, Oakland, CA 94612" }, { how: "web", value: "https://homelessactioncenter.org/" }],
      hours: { weekly: ["mon", "tue", "wed", "thu"].map((day) => ({ day, open: "13:00", close: "17:00" })), status: "researched", basis: "2026-10-14 pointers" },
      source: "https://homelessactioncenter.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "API Legal Outreach",
      does: "Culturally competent and linguistically appropriate legal representation, social services and advocacy for low-income women, seniors, recent immigrants and youth.",
      contacts: [{ how: "phone", value: "(510) 251-2846" }, { how: "address", value: "310 8th St., Suite 305, Oakland, CA 94607" }, { how: "web", value: "https://www.apilegaloutreach.org/contact/" }],
      source: "https://www.apilegaloutreach.org/contact/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Bay Area Legal Aid",
      does: "Free civil legal help to low-income people in the Bay Area, including advice, self-help clinics and representation.",
      contacts: [{ how: "phone", value: "800-551-5554" }, { how: "address", value: "1735 Telegraph Avenue, Oakland, CA 94612" }, { how: "web", value: "https://baylegal.org/" }],
      source: "https://baylegal.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Centro Legal de la Raza",
      does: "A legal aid nonprofit giving bilingual legal representation, education and advocacy to low-income, immigrant communities and communities of color in the Bay Area.",
      contacts: [{ how: "phone", value: "510-437-1554" }, { how: "address", value: "3400 E. 12th Street, Oakland, CA 94601" }, { how: "web", value: "https://www.centrolegal.org/" }],
      source: "https://www.centrolegal.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Family Violence Law Center",
      does: "Survivor-centered legal and crisis intervention services for people in Alameda County facing domestic violence and sexual assault.",
      contacts: [{ how: "phone", value: "800-947-8301" }, { how: "address", value: "470 27th Street, Oakland, CA 94612" }, { how: "web", value: "https://fvlc.org/" }],
      source: "https://fvlc.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Justice & Diversity Center of the Bar Association of San Francisco",
      does: "Pro bono legal services for low-income people.",
      contacts: [{ how: "phone", value: "(415) 982-1600" }, { how: "address", value: "50 Fremont St., Suite 1700, San Francisco, California 94105" }, { how: "web", value: "https://www.sfbar.org/jdc/" }],
      hours: { weekly: ["mon", "tue", "wed", "thu", "fri"].map((day) => ({ day, open: "09:00", close: "17:00" })), status: "researched", basis: "2026-10-14 pointers" },
      source: "https://www.sfbar.org/jdc/jdc-contact-us/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "La Raza Centro Legal",
      does: "Free legal services and advocacy that advance civil and human rights and access to justice.",
      contacts: [{ how: "phone", value: "415-575-3500" }, { how: "email", value: "info@lrcl.org" }, { how: "address", value: "474 Valencia Street, Suite 295, San Francisco, CA 94103" }],
      source: "https://www.lrcl.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Lawyers' Committee for Civil Rights of the San Francisco Bay Area",
      does: "Free legal services, direct representation and legal education for low-income and historically marginalized communities.",
      contacts: [{ how: "phone", value: "415.543.9444" }, { how: "address", value: "131 Steuart Street, Suite 400, San Francisco, CA 94105" }, { how: "web", value: "https://lccrsf.org/" }],
      source: "https://lccrsf.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Legal Access Alameda",
      does: "The pro bono arm of the Alameda County Bar Association: free legal assistance for Alameda County's low-income litigants from volunteer attorneys.",
      contacts: [{ how: "phone", value: "(510) 302-2222 *4" }, { how: "web", value: "https://www.legalaccess.org/" }],
      source: "https://www.legalaccess.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Legal Services for Children",
      does: "Legal and social work services for children and youth in crisis in the San Francisco Bay Area.",
      contacts: [{ how: "phone", value: "(415) 780-6366" }, { how: "phone", value: "(415) 780-6367" }, { how: "address", value: "870 Market Street, Suite 356, San Francisco, CA 94102" }],
      hours: { weekly: ["mon", "thu"].map((day) => ({ day, open: "13:30", close: "16:30" })), status: "researched", basis: "2026-10-14 pointers" },
      languages: ["en", "es"],
      source: "https://lsc-sf.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Asian Law Alliance",
      does: "Free legal services, education about key rights, and advocacy with and for underserved community members.",
      contacts: [{ how: "phone", value: "(408) 287-9710" }, { how: "address", value: "991 W. Hedding Street #202, San Jose, CA 95126" }, { how: "web", value: "https://asianlawalliance.org/" }],
      source: "https://asianlawalliance.org/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "legalaid", name: "Social Justice Collaborative",
      does: "Free and low-cost legal representation for immigrant families across Northern and Central California, in clients' languages.",
      contacts: [{ how: "phone", value: "(510) 992-3964" }, { how: "email", value: "office@socialjusticecollaborative.org" }, { how: "address", value: "1832 Second Street, Berkeley, CA 94710" }],
      source: "https://www.socialjusticecollaborative.org/en", status: "researched", basis: "2026-10-14 pointers" },
    /* The courts' self-help pages: the Superior Court's own center, and the Judicial Council's statewide guide. */
    { kind: "selfhelp", name: "Self-Help Center of the Superior Court of California, County of Alameda",
      does: "Procedural information and help with forms for people with a case in the court who do not have a lawyer; no legal advice.",
      contacts: [{ how: "phone", value: "(510) 272-1393" }, { how: "web", value: "https://www.alameda.courts.ca.gov/self-help" }],
      hours: { weekly: ["mon", "tue", "wed", "thu"].map((day) => ({ day, open: "14:00", close: "16:00" })), status: "researched", basis: "2026-10-14 pointers" },
      source: "https://www.alameda.courts.ca.gov/self-help", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "selfhelp", name: "Self-Help Guide to the California Courts",
      does: "The Judicial Council's guides and information for people handling a court case on their own.",
      contacts: [{ how: "web", value: "https://selfhelp.courts.ca.gov/" }],
      source: "https://selfhelp.courts.ca.gov/", status: "researched", basis: "2026-10-14 pointers" },
    /* The City's service line; its short code is not held, only the number and page the City prints with it. */
    { kind: "service", name: "OAK 311",
      does: "The City of Oakland's line for reporting problems such as potholes, illegal dumping, graffiti and city building maintenance.",
      contacts: [{ how: "phone", value: "(510) 615-5566" }, { how: "web", value: "https://www.oaklandca.gov/My-Household/Report-an-Issue-OAK-311" }],
      source: "https://www.oaklandca.gov/My-Household/Report-an-Issue-OAK-311", status: "researched", basis: "2026-10-14 pointers" },
    /* Each office the Council's roster lists, by its seat, never by its holder; none is chosen by a member's address. */
    { kind: "representative", name: "Oakland City Council, At-Large office",
      does: "The office of the Councilmember elected at large, who represents the whole city on the Oakland City Council.",
      contacts: [{ how: "phone", value: "(510) 238-7008" }, { how: "email", value: "atlarge@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 1 office",
      does: "The office of the Councilmember elected for District 1, who represents District 1 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "510-238-7001" }, { how: "email", value: "zunger@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 2 office",
      does: "The office of the Councilmember elected for District 2, who represents District 2 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "510-238-7021" }, { how: "email", value: "district2@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 3 office",
      does: "The office of the Councilmember elected for District 3, who represents District 3 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "(510) 238-7003" }, { how: "email", value: "District3@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 4 office",
      does: "The office of the Councilmember elected for District 4, who represents District 4 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "510-238-7004" }, { how: "email", value: "District4@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 5 office",
      does: "The office of the Councilmember elected for District 5, who represents District 5 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "510-238-7005" }, { how: "email", value: "Ngallo@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 6 office",
      does: "The office of the Councilmember elected for District 6, who represents District 6 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "(510) 238-7006" }, { how: "email", value: "District6@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "representative", name: "Oakland City Council, District 7 office",
      does: "The office of the Councilmember elected for District 7, who represents District 7 on the Oakland City Council.",
      contacts: [{ how: "phone", value: "510-238-7007" }, { how: "email", value: "District7@oaklandca.gov" }],
      source: "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership", status: "researched", basis: "2026-10-14 pointers" },
    /* Public offices whose own pages say they take one person's complaint. */
    { kind: "agency", name: "Community Police Review Agency",
      does: "Takes a member of the public's complaint about the conduct of an Oakland police officer.",
      contacts: [{ how: "phone", value: "(510) 238-3159" }, { how: "web", value: "https://apps.oaklandca.gov/CPRAPublic/" }, { how: "address", value: "250 Frank Ogawa Plaza, Suite 6302, Oakland, CA 94612" }],
      hours: { weekly: ["mon", "tue", "wed", "thu", "fri"].map((day) => ({ day, open: "09:00", close: "17:00" })), status: "researched", basis: "2026-10-14 pointers" },
      source: "https://www.oaklandca.gov/Public-Safety-Streets/Report-Police-Misconduct", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "agency", name: "Public Ethics Commission",
      does: "Takes complaints of violations of government ethics, campaign finance or transparency laws in the City of Oakland.",
      contacts: [{ how: "phone", value: "(510) 238-3593" }, { how: "email", value: "ethicscommission@oaklandca.gov" }, { how: "address", value: "250 Frank H Ogawa Plaza, Suite 6303, Oakland, CA 94612" }],
      source: "https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/File-a-Complaint-with-the-Public-Ethics-Commission", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "agency", name: "Rent Adjustment Program",
      does: "Takes a tenant's petition challenging certain rent increases or seeking a decrease in rent for a loss in service, for units under the Rent Adjustment Ordinance.",
      contacts: [{ how: "phone", value: "(510) 238-3721" }, { how: "email", value: "RAP@oaklandca.gov" }, { how: "address", value: "250 Frank H. Ogawa Plaza, Suite 5313, Oakland, CA 94612" }],
      hours: { weekly: ["mon", "tue", "wed", "thu"].map((day) => ({ day, open: "09:30", close: "16:30" })), status: "researched", basis: "2026-10-14 pointers" },
      source: "https://www.oaklandca.gov/Community/Housing-Programs-Support/Rent-Adjustment-Program-RAP/For-Tenants/File-a-Tenant-Petition", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "agency", name: "City Auditor's Whistleblower Program",
      does: "A confidential hotline, open to residents, for complaints of fraud, waste and abuse in the City of Oakland, with interpreters.",
      contacts: [{ how: "phone", value: "1-888-329-6390" }, { how: "web", value: "https://secure.ethicspoint.com/domain/media/en/gui/23089/issues.html?locationid=-1" }],
      source: "https://www.oaklandauditor.com/whistleblower/submit-a-complaint/", status: "researched", basis: "2026-10-14 pointers" },
    /* Newsrooms that publish a tip channel on their own sites. */
    { kind: "tipline", name: "San Francisco Chronicle",
      does: "A daily newspaper that takes news tips, including sensitive tips to its investigative team.",
      contacts: [{ how: "email", value: "metro@sfchronicle.com" }, { how: "phone", value: "(415) 777-7239" }, { how: "mail", value: "News Tips, The San Francisco Chronicle, 901 Mission Street, San Francisco CA 94103" }],
      source: "https://projects.sfchronicle.com/newstips/", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "tipline", name: "KTVU Fox 2",
      does: "A television newsroom in Oakland that takes news tips and story ideas.",
      contacts: [{ how: "email", value: "newstips@fox.com" }, { how: "phone", value: "(510) 874-0242" }],
      source: "https://www.ktvu.com/about-us", status: "researched", basis: "2026-10-14 pointers" },
    { kind: "tipline", name: "CalMatters",
      does: "A newsroom covering California that takes news tips, by email or through confidential channels.",
      contacts: [{ how: "email", value: "tips@calmatters.org" }, { how: "web", value: "https://calmatters.org/about/contact-us/#news-tips" }],
      source: "https://calmatters.org/about/contact-us/#news-tips", status: "researched", basis: "2026-10-14 pointers" },
  ],
  /* R51, R94 (T51 fix round 10; K1452, DEC-301, K5148): the four kinds a proceeding is registered as, the forums that hold
     them and each kind's stages, read 2026-10-25 on the courts' and the City's own pages and the Legislature's own text of
     the codes (its official bulk download, K3658). A civil action is commenced by filing a complaint with the court (Code Civ.
     Proc. § 411.10); a writ of mandate may be issued by any court (§ 1085(a)) and, for a final administrative decision, is
     heard by the court (§ 1094.5(a)); an appeal other than in a limited civil case is to the court of appeal, from a judgment
     or order (§ 904.1(a)); an ethics complaint is filed with the Public Ethics Commission, which "reviews and takes action on
     the complaint" and tells the complainant its "final action" (the Commission's own page). That page names no hearing, so
     the complaint flow has two stages; nor does any page read name a hearing stage for a civil action or an appeal. */
  proceeding_kinds: [
    { kind: "civil", label: "Civil case", forum_kind: "court", basis: "2026-10-25 ccp-411-10, 2026-10-25 alameda-superior-court" },
    { kind: "writ", label: "Petition for a writ", forum_kind: "court", basis: "2026-10-25 ccp-1085, 2026-10-25 ccp-1094-5" },
    { kind: "appeal", label: "Appeal", forum_kind: "court", basis: "2026-10-25 ccp-904-1, 2026-10-25 first-district-about" },
    { kind: "complaint", label: "Administrative complaint", forum_kind: "commission", basis: "2026-10-25 oakland-pec-complaint-page" },
  ],
  proceeding_flows: [
    { kind: "civil", stages: [
      { stage: "filed", label: "complaint filed", reached_by: ["filing"] },
      { stage: "decided", label: "judgment or order entered", reached_by: ["order"] }],
      citation: "Cal. Code Civ. Proc. §§ 411.10, 904.1(a)", basis: "2026-10-25 ccp-411-10, 2026-10-25 ccp-904-1" },
    { kind: "writ", stages: [
      { stage: "filed", label: "petition filed", reached_by: ["filing"] },
      { stage: "heard", label: "heard by the court", reached_by: ["hearing"] },
      { stage: "decided", label: "writ granted or denied", reached_by: ["order"] }],
      citation: "Cal. Code Civ. Proc. §§ 1085(a), 1094.5(a)", basis: "2026-10-25 ccp-1085, 2026-10-25 ccp-1094-5" },
    { kind: "appeal", stages: [
      { stage: "filed", label: "appeal filed", reached_by: ["filing"] },
      { stage: "decided", label: "appeal decided", reached_by: ["order"] }],
      citation: "Cal. Code Civ. Proc. § 904.1(a)", basis: "2026-10-25 ccp-904-1" },
    { kind: "complaint", stages: [
      { stage: "filed", label: "complaint filed", reached_by: ["filing"] },
      { stage: "decided", label: "final action taken", reached_by: ["order"] }],
      citation: "Oakland Public Ethics Commission, File a Complaint", basis: "2026-10-25 oakland-pec-complaint-page" },
  ],
  forums: [
    { label: "Superior Court of California, County of Alameda", forum_kind: "court", basis: "2026-10-25 alameda-superior-court" },
    { label: "Court of Appeal of California, First Appellate District", forum_kind: "court", basis: "2026-10-25 first-district-about" },
    { label: "Supreme Court of California", forum_kind: "court", basis: "2026-10-25 supreme-court-home" },
    { label: "United States District Court, Northern District of California", forum_kind: "court", basis: "2026-10-25 cand-jurisdiction-map" },
    { label: "Oakland Public Ethics Commission", forum_kind: "commission", basis: "2026-10-25 oakland-pec-complaint-page" },
  ],
  /* R93 (T51 fix round 10; K5148): the California Public Records Act as the Legislature's own text prints it (Gov. Code
     §§ 7921.300, 7922.525–.540, .570–.575, .600, as amended through Stats. 2025, ch. 34, effective 2026-01-01; read 2026-10-25),
     the City's request portal as the Police Department's own General Order M-9.1 names it (read 2026-10-25), and the Sunshine
     Ordinance's window as OMC 2.20.230(A) prints it (read 2026-10-11, `test/fixtures/actions-law.mjs`). */
  records_help: {
    law: "California Public Records Act", days: 10, extra_days: 14,
    extension_reasons: [
      { reason: "the records must be searched for and collected from field facilities or other establishments separate from the office processing the request", citation: "Cal. Gov. Code § 7922.535(c)(1)" },
      { reason: "a voluminous amount of separate and distinct records is demanded in a single request", citation: "Cal. Gov. Code § 7922.535(c)(2)" },
      { reason: "the agency must consult another agency with a substantial interest in the request, or two or more of its own components", citation: "Cal. Gov. Code § 7922.535(c)(3)" },
      { reason: "data must be compiled, a program written, or a computer report constructed to extract the data", citation: "Cal. Gov. Code § 7922.535(c)(4)" },
      { reason: "a cyberattack stops the agency reaching its electronic servers or systems", citation: "Cal. Gov. Code § 7922.535(c)(5)" },
      { reason: "a state of emergency proclaimed by the Governor directly affects the agency's ability to respond, through staffing shortages or closed facilities", citation: "Cal. Gov. Code § 7922.535(c)(6)" }],
    portal: { name: "the City of Oakland's public records request portal (NextRequest)", url: "https://oaklandca.nextrequest.com/" },
    faster: { ordinance: "Oakland Sunshine Ordinance", window: "three business days", request: "Immediate Disclosure Request", citation: "Oakland Mun. Code § 2.20.230(A)" },
    citations: { answer: "Cal. Gov. Code § 7922.535(a)", extend: "Cal. Gov. Code § 7922.535(b)", assist: "Cal. Gov. Code § 7922.600(a)",
      segregate: "Cal. Gov. Code § 7922.525(b)", refuse_in_writing: "Cal. Gov. Code § 7922.540(a)", electronic: "Cal. Gov. Code § 7922.570(a)",
      cost: "Cal. Gov. Code § 7922.530(a)", cost_electronic: "Cal. Gov. Code § 7922.575(a)", inspect_photograph: "Cal. Gov. Code § 7922.530(b)",
      purpose: "Cal. Gov. Code § 7921.300" },
    status: "researched",
    basis: "2026-10-25 leginfo-bulk-download, 2026-10-25 opd-dgo-m-9-1, 2026-10-11 actions-law" },
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
      { date: "2026-06-19", name: "Juneteenth National Independence Day" }, { date: "2026-07-03", name: "Independence Day (observed, 5 U.S.C. § 6103(b))" },
      { date: "2026-07-04", name: "Independence Day" }, { date: "2026-09-07", name: "Labor Day" }, { date: "2026-10-12", name: "Columbus Day" },
      { date: "2026-11-11", name: "Veterans Day" }, { date: "2026-11-26", name: "Thanksgiving Day" },
      { date: "2026-12-25", name: "Christmas Day" }],
      status: "researched", basis: "2026-10-05 time-law; 2026-10-05 holidays-extra" },
    /* The legal public holidays of 5 U.S.C. § 6103(a) for 2027 (R85, M-T45-1), with the days OPM's 2027 schedule observes in
       their place (§ 6103(b); E.O. 11582 § 3(a)): Juneteenth and Christmas fall on a Saturday, Independence Day on a
       Sunday, and 2028's New Year's Day on a Saturday, observed 2027-12-31 (OPM's 2028 table). Neither the court (M-189's
       page lists 2026 only) nor the City (M-190) has published 2027: those lists stay without 2027, undetermined. */
    { year: 2027, list: "federal", citation: "5 U.S.C. § 6103(a), (b)", days: [
      { date: "2027-01-01", name: "New Year's Day" }, { date: "2027-01-18", name: "Birthday of Martin Luther King, Jr." },
      { date: "2027-02-15", name: "Washington's Birthday" }, { date: "2027-05-31", name: "Memorial Day" },
      { date: "2027-06-18", name: "Juneteenth National Independence Day (observed)" }, { date: "2027-06-19", name: "Juneteenth National Independence Day" },
      { date: "2027-07-04", name: "Independence Day" }, { date: "2027-07-05", name: "Independence Day (observed)" },
      { date: "2027-09-06", name: "Labor Day" }, { date: "2027-10-11", name: "Columbus Day" },
      { date: "2027-11-11", name: "Veterans Day" }, { date: "2027-11-25", name: "Thanksgiving Day" },
      { date: "2027-12-24", name: "Christmas Day (observed)" }, { date: "2027-12-25", name: "Christmas Day" },
      { date: "2027-12-31", name: "New Year's Day 2028 (observed)" }],
      status: "researched", basis: "2026-10-11 actions-law" },
    /* The judicial holidays of 2018 and 2020, as the superior courts published them (San Diego Superior Court's
       schedules, agreeing with a statewide calendar; holidays-extra): Columbus Day was then a judicial holiday. */
    { year: 2018, list: "judicial", citation: "Cal. Code Civ. Proc. § 135 (as in force in 2018); San Diego Super. Ct. holiday schedule 2018", days: [
      { date: "2018-01-01", name: "New Year's Day" }, { date: "2018-01-15", name: "Martin Luther King Jr. Day" },
      { date: "2018-02-12", name: "Lincoln's Birthday" }, { date: "2018-02-19", name: "Presidents' Day" },
      { date: "2018-03-30", name: "Cesar Chavez Day (observed)" }, { date: "2018-05-28", name: "Memorial Day" },
      { date: "2018-07-04", name: "Independence Day" }, { date: "2018-09-03", name: "Labor Day" },
      { date: "2018-10-08", name: "Columbus Day" }, { date: "2018-11-12", name: "Veterans Day (observed)" },
      { date: "2018-11-22", name: "Thanksgiving" }, { date: "2018-11-23", name: "Day after Thanksgiving" },
      { date: "2018-12-25", name: "Christmas Day" }],
      status: "researched", basis: "2026-10-05 holidays-extra" },
    { year: 2020, list: "judicial", citation: "Cal. Code Civ. Proc. § 135 (as in force in 2020); San Diego Super. Ct. holiday schedule 2020", days: [
      { date: "2020-01-01", name: "New Year's Day" }, { date: "2020-01-20", name: "Martin Luther King Jr. Day" },
      { date: "2020-02-12", name: "Lincoln's Birthday" }, { date: "2020-02-17", name: "Presidents' Day" },
      { date: "2020-03-31", name: "Cesar Chavez Day" }, { date: "2020-05-25", name: "Memorial Day" },
      { date: "2020-07-03", name: "Independence Day (observed)" }, { date: "2020-09-07", name: "Labor Day" },
      { date: "2020-10-12", name: "Columbus Day" }, { date: "2020-11-11", name: "Veterans Day" },
      { date: "2020-11-26", name: "Thanksgiving" }, { date: "2020-11-27", name: "Day after Thanksgiving" },
      { date: "2020-12-25", name: "Christmas Day" }],
      status: "researched", basis: "2026-10-05 holidays-extra" },
  ],
};
