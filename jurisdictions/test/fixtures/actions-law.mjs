/* The primary sources T45's first-profile facts rest on (R85; plan M-T45-1, M-T45-2, M-T45-3), read 2026-10-11 by
 * JURISDICTIONS #10, as T33's time-law study read its own (`build/plan/measures-T33/time-law.md`). The measurement is
 * cited in the profile as `2026-10-11 actions-law`; this file and the job record `build/jobs/T45/jurisdictions.md` hold it.
 *
 * California's own site (leginfo.legislature.ca.gov) answers every fetch with a browser challenge, so each section was
 * read on california.public.law, which reproduces leginfo's text and names leginfo's page and its last update; FOIA and
 * 5 U.S.C. § 6103 on law.cornell.edu (the official text); the Oakland Municipal Code through the codifier's open JSON API
 * (Municode, as time-law §4 read it). `sha256` is the capture's, as fetched.
 *
 * `EXAMPLES` are worked examples, one or more per period, each with its negative control: `P` a published example (its
 * source says the date is within the period), `D` derived here from the quoted text (no published example found; a
 * derived row is a positive only once a second source confirms it, as time-law's P7). Counting them is `civil-time`'s
 * (its R29), never this module's: this module's tests show only that the first profile supplies, with its citation,
 * every fact each example needs. */

const PL = "https://california.public.law/codes/";
export const RETRIEVED = "2026-10-11";

export const SOURCES = {
  gov_54960_1: { url: `${PL}government_code_section_54960.1`, sha256: "38f7abd8dfb088aab7efa080eefa482510fe00bfc652f1319cdbb2c4176eb02a",
    quote: "(c)(1) The written demand shall be made within 90 days from the date the action was taken unless the action was taken in an open session but in violation of Section 54954.2, in which case the written demand shall be made within 30 days from the date the action was taken. (2) Within 30 days of receipt of the demand, the legislative body shall cure or correct the challenged action … (3) If the legislative body takes no action within the 30-day period, the inaction shall be deemed a decision not to cure or correct the challenged action … (4) Within 15 days of receipt of the written notice of the legislative body's decision … or within 15 days of the expiration of the 30-day period to cure or correct, whichever is earlier, the demanding party shall be required to commence the action …" },
  pen_933: { url: `${PL}penal_code_section_933`, sha256: "d503096175b2608ea577212d56191f24adc6db7e4e3268cd1641bb6203bb6954",
    quote: "(c) No later than 90 days after the grand jury submits a final report on the operations of any public agency subject to its reviewing authority, the governing body of the public agency shall comment to the presiding judge … and every elected county officer or agency head … shall comment within 60 days …" },
  pen_933_05: { url: `${PL}penal_code_section_933.05`, sha256: "13620965e9bc2816826c8cb891bb841b5adef40f3cb0ced4e6812e9352618346",
    quote: "(a) … as to each grand jury finding, the responding person or entity shall indicate one of the following: (1) The respondent agrees with the finding. (2) The respondent disagrees wholly or partially with the finding … (b) … (1) The recommendation has been implemented … (2) The recommendation has not yet been implemented, but will be implemented in the future … (3) The recommendation requires further analysis … This timeframe shall not exceed six months from the date of publication of the grand jury report. (4) The recommendation will not be implemented because it is not warranted or is not reasonable …" },
  ccp_425_16: { url: `${PL}code_of_civil_procedure_section_425.16`, sha256: "33cbcd2838f15e6c8615b0da81783e78a19dd99fd12d35359056779a5c336eb0",
    quote: "(b)(1) A cause of action against a person arising from any act of that person in furtherance of the person's right of petition or free speech … in connection with a public issue shall be subject to a special motion to strike … (f) The special motion may be filed within 60 days of the service of the complaint or, in the court's discretion, at any later time upon terms it deems proper." },
  gov_54953_5: { url: `${PL}government_code_section_54953.5`, sha256: "2b98f0b02a08f898bcbed180adaf1eaa98ecfc3dbbe09428be7e55de5be4a56a",
    quote: "(a) Any person attending an open and public meeting of a legislative body of a local agency shall have the right to record the proceedings in the absence of a reasonable finding by the legislative body … that the recording cannot continue without noise, illumination, or obstruction of view that constitutes, or would constitute, a persistent disruption of the proceedings." },
  pen_632: { url: `${PL}penal_code_section_632`, sha256: "32f16958b95d7c5fcf02b41baa0757f993bb97c3c5eeb68f314b7812975011e1",
    quote: "(a) A person who, intentionally and without the consent of all parties to a confidential communication, uses an electronic amplifying or recording device to eavesdrop upon or record the confidential communication … shall be punished … (c) … 'confidential communication' … excludes a communication made in a public gathering or in any legislative, judicial, executive, or administrative proceeding open to the public …" },
  gov_54952_2: { url: `${PL}government_code_section_54952.2`, sha256: "345e05d9d92f64f9bfbefc49ee9fedd11aad758d83a8b5356c3bfdf2a2979610",
    quote: "(b)(1) A majority of the members of a legislative body shall not, outside a meeting authorized by this chapter, use a series of communications of any kind, directly or through intermediaries, to discuss, deliberate, or take action on any item of business that is within the subject matter jurisdiction of the legislative body." },
  gov_82013: { url: `${PL}government_code_section_82013`, sha256: "387c0bdbdf8e8d8514fa474bef11ae05ab8532df485a3b409c8072c60c951ff1",
    quote: "(b) Makes independent expenditures totaling one thousand dollars ($1,000) or more in a calendar year" },
  gov_82031: { url: `${PL}government_code_section_82031`, sha256: "83b2c17060e7c6200adb34f5afb933e54069bb0edfcad921df897526af3ce0d1",
    quote: "'Independent expenditure' means an expenditure made by any person … in connection with a communication which expressly advocates the election or defeat of a clearly identified candidate or the qualification, passage or defeat of a clearly identified measure … but which is not made to or at the behest of the affected candidate or committee." },
  gov_912_4: { url: `${PL}government_code_section_912.4`, sha256: "f247594210785edb2390c22505b944413eef29fdc5144b1eeb4c6a94d149717d",
    quote: "(a) The board shall act on a claim … within 45 days after the claim has been presented. … (c) If the board fails or refuses to act on a claim within the time prescribed by this section, the claim shall be deemed to have been rejected by the board on the last day of the period within which the board was required to act upon the claim." },
  cpra: { url: `${PL}government_code_section_7922.535`, sha256: "05d264cc4d8b6bdcbde23affcc78d4ff07444f55c9686ba83160e37cb954f222",
    also: { "7922.530": "d1a0772b4fd82cd4c009694f24df5b7d4114e9610e75281fc36ee270cdc594fb", "7922.540": "88a780bbcb4090d920446454d5db5865c8823f92ab9494e88f5e2609ed7012d3",
      "7923.000": "50ec5ebf4232e3d2da3ec43cb9156e15886e8f64e05696d027e6e577bd8dbabf", "7923.100": "2df660a488f73fbda633e334cf61231bc7aca15f5eb502228f049cba0c230c6c",
      "7921.300": "008bf7b3b6051e85e9a2937db0ef48bc5b9738fc55bba8fce07d01b78d629703", "7920.520": "c194d55c7e3fabae8b44382a0075babf4168563698285ed436d8952bc3ad18a7" },
    quote: "§ 7922.530(a): … upon a request for a copy of records … shall make the records promptly available to any person upon payment of fees covering direct costs of duplication … § 7922.535(b): … may be extended by written notice … § 7922.540(a): A response … that includes a determination that the request is denied, in whole or in part, shall be in writing. § 7923.000: Any person may institute a proceeding … § 7923.100: … by verified petition to the superior court … § 7920.520: 'person' includes any natural person, corporation, partnership, limited liability company, firm, or association. § 7921.300: … does not allow limitations on access … based upon the purpose for which the record is being requested." },
  omc_2_20: { url: "https://api.municode.com/CodesContent?jobId=494401&nodeId=TIT2ADPE_CH2.20PUMEPURE&productId=16308",
    sha256: "f9471dc86d995eb579dfb34131d9092ad57a68a0755b10f40da43c5d2b159a38",
    quote: "§ 2.20.230(A): a written request … shall be satisfied no later than three business days unless the requestor is advised within three business days that additional time is needed … (B) … In no event shall any disclosable records be provided … any later than fourteen (14) days after the written determination … (D) The person seeking the information need not state a reason … § 2.20.250: Any withholding of information shall be justified, in writing … § 2.20.270(B)(1): … any person may institute proceedings for injunctive relief, declaratory relief, or writ of mandate … (C) Mediation … § 2.20.260: fees for duplication (no waiver stage)." },
  omc_3_20: { url: "https://api.municode.com/CodesContent?jobId=494401&nodeId=TIT3MUEL_CH3.20THOALOREAC&productId=16308",
    sha256: "4d2a9da479fae64a649dd2d683055018e2c729ac0b93679fd23f77c1d6786ac0",
    quote: "§ 3.20.030(D): 'Local Governmental Lobbyist' means any individual who: (1) receives or is entitled to receive one thousand dollars ($1,000.00) or more in economic consideration in a calendar month … to communicate directly or through agents with any public official … for the purpose of influencing any proposed or pending governmental action of the City; or (2) whose duties as a salaried employee, officer, or director, of any corporation, organization or association, include communication … § 3.20.040(A): No person shall act as local governmental lobbyist before registering … with the Public Ethics Commission …" },
  usc_552: { url: "https://www.law.cornell.edu/uscode/text/5/552", sha256: "72af192b5f0ac7d338ab1b454b51348ab08b3d05bfdb194eea78360ebaf94d27",
    quote: "(a)(3)(A) … shall make the records promptly available to any person. (a)(4)(A)(iii) Documents shall be furnished without any charge or at a charge reduced … (a)(6)(A)(ii) make a determination with respect to any appeal within twenty days (excepting Saturdays, Sundays, and legal public holidays) after the receipt of such appeal. (a)(6)(C)(i) Any person making a request … shall be deemed to have exhausted his administrative remedies with respect to such request if the agency fails to comply with the applicable time limit provisions of this paragraph." },
  usc_6103_opm_2027: { url: "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/#url=2027", sha256: "3797368151ea3b4264f54287097a2120ea9391715fd2b6e6ab7266e4c6bf2e92",
    statute: { url: "https://www.law.cornell.edu/uscode/text/5/6103", sha256: "f3a1e6815a51b9f803da5a2816f5d7108d8e68202853fae04968e5f35305fb9d" },
    quote: "2027 Holiday Schedule: Friday, January 01 New Year's Day; Monday, January 18 Birthday of Martin Luther King, Jr.; Monday, February 15 Washington's Birthday; Monday, May 31 Memorial Day; Friday, June 18 ** Juneteenth National Independence Day; Monday, July 05 ** Independence Day; Monday, September 06 Labor Day; Monday, October 11 Columbus Day; Thursday, November 11 Veterans Day; Thursday, November 25 Thanksgiving Day; Friday, December 24 ** Christmas Day. 2028: Friday, December 31 * New Year's Day. **If a holiday falls on a Saturday … the preceding Friday … If a holiday falls on a Sunday … the following Monday …" },
  fac_hotline: { url: "https://firstamendmentcoalition.org/legal-hotline/", sha256: "60445dfc883a2f4a99a11653b60523a5e804a4ef2960d083d54973ca59dbc91d",
    quote: "The Legal Hotline provides information about access to public records and the right to attend government meetings in California; access to court documents and proceedings in California and federal courts; and First Amendment protections for freedom of speech and freedom of the press. … are you a reporter on deadline or a journalist facing a subpoena? … it does not provide legal services or legal representation, like preparing documents or appearing in court." },
  /* Read and not used: the 2027 judicial lists of two other courts disagree (Farmworkers Day 03-31 against 04-09; 12-31
     observed or not), CCP § 135 leaves a weekend holiday's day to the Judicial Council, and this venue's court (M-189's
     page, re-read) still lists 2026 only. So no 2027 judicial list is written (M-T45-1). */
  judicial_2027_not_used: { urls: ["https://www.sdcourt.ca.gov/sites/default/files/sdcourt/generalinformation/hours/holiday_schedule_2027.pdf",
      "https://www.lassen.courts.ca.gov/system/files/holidays/2027-court-holidays.pdf", "https://www.alameda.courts.ca.gov/general-information/holidays"],
    sha256: ["3360b5fa6f25d0b6c120e9c52730a46380172ba322213322bf9e02a80072dc7e", "1bd03c9d63605a731408a4a58ebd1a65c110e7fea3358288ceead6506335190c",
      "869b6adb618442117011c23c37fdecf656175766c3839e79c18b56051bd42bb2"] },
  berkeley_demand: { url: "https://berkeleyca.gov/sites/default/files/2026-05/2026-04-21_CORR_Schuyler_2128%20Oxford.pdf",
    sha256: "31c6bb66402bd919114162cdb95f1209fe88004828b1e83df1c4b5b4b1463670",
    quote: "Date: April 21, 2026 … regarding … violations committed by the Zoning Adjustments Board during its regular meeting on April 9, 2026. This demand is timely submitted within the strict 30-day statutory window." },
};

/* Each fact R85 asks of the first profile: where it is, what it must say, and the source it was read on. */
export const FACTS = [
  { at: "deadlines", rule: "brown_act_demand", owed_by: "group", amount: 90, citation: "Cal. Gov. Code § 54960.1(c)(1)", source: "gov_54960_1" },
  { at: "deadlines", rule: "brown_act_demand_agenda", owed_by: "group", amount: 30, citation: /§ 54960\.1\(c\)\(1\)/, source: "gov_54960_1" },
  { at: "deadlines", rule: "brown_act_cure", owed_by: "body", amount: 30, citation: "Cal. Gov. Code § 54960.1(c)(2)", consequence: "Cal. Gov. Code § 54960.1(c)(3)", source: "gov_54960_1" },
  { at: "deadlines", rule: "grand_jury_body_comment", owed_by: "body", amount: 90, citation: "Cal. Penal Code § 933(c)", starter: "Civil Grand Jury", source: "pen_933" },
  { at: "deadlines", rule: "grand_jury_officer_comment", owed_by: "body", amount: 60, citation: /§ 933\(c\)/, starter: "Civil Grand Jury", source: "pen_933" },
  { at: "deadlines", rule: "grand_jury_further_analysis", owed_by: "body", amount: 6, citation: "Cal. Penal Code § 933.05(b)(3)", starter: "Civil Grand Jury", source: "pen_933_05" },
  { at: "deadlines", rule: "anti_slapp_motion", owed_by: "group", defends: true, amount: 60, citation: "Cal. Code Civ. Proc. § 425.16(f)", source: "ccp_425_16" },
  { at: "deadlines", rule: "claim_board_action", owed_by: "body", amount: 45, citation: "Cal. Gov. Code § 912.4(a)", consequence: "Cal. Gov. Code § 912.4(c)", source: "gov_912_4" },
  { at: "deadlines", rule: "foia_appeal_response", owed_by: "body", amount: 20, citation: "5 U.S.C. § 552(a)(6)(A)(ii)", consequence: "5 U.S.C. § 552(a)(6)(C)(i)", source: "usc_552" },
  { at: "legal_facts", key: "recording_open_meeting", trigger: "recording", citation: "Cal. Gov. Code § 54953.5(a)", source: "gov_54953_5" },
  { at: "legal_facts", key: "recording_consent", trigger: "recording", citation: /Penal Code § 632/, source: "pen_632" },
  { at: "legal_facts", key: "lobbyist_registration", trigger: "paid_attendee", citation: /3\.20\.030\(D\)/, threshold: 1000, source: "omc_3_20" },
  { at: "legal_facts", key: "serial_meeting", trigger: "serial_meeting", citation: "Cal. Gov. Code § 54952.2(b)(1)", source: "gov_54952_2" },
  { at: "legal_facts", key: "campaign_spending", trigger: "pending_measure_or_candidate", citation: /82013\(b\), 82031/, threshold: 1000, source: "gov_82013" },
  { at: "legal_facts", key: "anti_slapp", trigger: "threat_letter", citation: /425\.16/, source: "ccp_425_16" },
];

/* The worked examples (each its negative control). `rule` names the first profile's deadline; `needs` the facts the
   count reads. */
export const EXAMPLES = [
  { id: "B1", kind: "P", rule: "brown_act_demand_agenda", start: "2026-04-09", expected: "2026-05-11", within: "2026-04-21", negative: "2026-05-09",
    why_negative: "2026-05-09 is a Saturday: CCP § 12a rolls the last day to Monday", needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" },
    source: "berkeley_demand", note: "the published demand of 2026-04-21 says it is timely within the 30 days; the due date is derived" },
  { id: "B2", kind: "D", rule: "brown_act_demand", start: "2026-06-01", expected: "2026-08-31", negative: "2026-08-30", why_negative: "a Sunday, not rolled",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "gov_54960_1", derived: true },
  { id: "B3", kind: "D", rule: "brown_act_cure", start: "2026-11-02", expected: "2026-12-02", negative: "2026-12-01", why_negative: "the day of receipt counted",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "gov_54960_1", derived: true },
  { id: "G1", kind: "D", rule: "grand_jury_body_comment", start: "2026-06-26", expected: "2026-09-24", negative: "2026-09-23", why_negative: "the day of submission counted",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "pen_933", derived: true },
  { id: "G2", kind: "D", rule: "grand_jury_officer_comment", start: "2026-06-26", expected: "2026-08-25", negative: "2026-09-24", why_negative: "the governing body's 90 days read for an officer",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "pen_933", derived: true },
  { id: "G3", kind: "D", rule: "grand_jury_further_analysis", start: "2026-06-26", expected: "2026-12-28", negative: "2026-12-26", why_negative: "a Saturday, not rolled",
    needs: { closures: "judicial", years: [2026], weekend: true }, source: "pen_933_05", derived: true },
  { id: "S1", kind: "D", rule: "anti_slapp_motion", start: "2026-03-02", expected: "2026-05-01", negative: "2026-04-30", why_negative: "the day of service counted",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "ccp_425_16", derived: true },
  { id: "C1", kind: "D", rule: "claim_board_action", start: "2026-11-02", expected: "2026-12-17", negative: "2026-12-16", why_negative: "the day of presentation counted",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "gov_912_4", derived: true },
  { id: "F1", kind: "D", rule: "foia_appeal_response", start: "2026-11-02", expected: "2026-12-02", negative: "2026-11-30", why_negative: "Veterans Day and Thanksgiving counted as working days",
    needs: { closures: "federal", years: [2026], weekend: true }, source: "usc_552", derived: true },
];
