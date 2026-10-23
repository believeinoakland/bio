/* The primary source T51's federal records law rests on (R95; fix round 3, C64), read live 2026-10-21 by JURISDICTIONS
 * #15 and cited in the first profile as `2026-10-21 foia-text`. The text read is the official United States Code, 2024
 * Edition, 5 U.S.C. § 552 as GPO's govinfo.gov prints it (uscode.house.gov, the House's own site, answered "Page Not
 * Found" to its section address that day, so govinfo.gov, the other official text, was read). The earlier reading
 * (`actions-law`'s `usc_552`) was on law.cornell.edu, which is not the official text. `sha256` is the capture's, as
 * fetched. Each `quote` is the words the profile's citation to that subsection rests on. */
export const RETRIEVED = "2026-10-21";
export const FOIA_SOURCE = {
  url: "https://www.govinfo.gov/content/pkg/USCODE-2024-title5/html/USCODE-2024-title5-partI-chap5-subchapII-sec552.htm",
  sha256: "b1fad0a21337dc814f2f05e47f260dba90752af9f72c66c7b0323477183323de",
};
export const FOIA_QUOTES = {
  "(a)(3)(A)": "each agency, upon any request for records which (i) reasonably describes such records and (ii) is made in accordance with published rules stating the time, place, fees (if any), and procedures to be followed, shall make the records promptly available to any person.",
  "(a)(3)(E)": "An agency, or part of an agency, that is an element of the intelligence community … shall not make any record available under this paragraph to— (i) any government entity, other than a State, territory, commonwealth, or district of the United States, or any subdivision thereof; or (ii) a representative of a government entity described in clause (i).",
  "(a)(4)(A)(iii)": "Documents shall be furnished without any charge or at a charge reduced below the fees established under clause (ii) if disclosure of the information is in the public interest",
  "(a)(4)(B)": "On complaint, the district court of the United States in the district in which the complainant resides, or has his principal place of business, or in which the agency records are situated, or in the District of Columbia, has jurisdiction to enjoin the agency from withholding agency records",
  "(a)(6)(A)(i)": "determine within 20 days (excepting Saturdays, Sundays, and legal public holidays) after the receipt of any such request whether to comply with such request and shall immediately notify the person making such request of— (I) such determination and the reasons therefor; … (III) in the case of an adverse determination— (aa) the right of such person to appeal to the head of the agency, within a period determined by the head of the agency that is not less than 90 days after the date of such adverse determination;",
  "(a)(6)(A)(ii)": "make a determination with respect to any appeal within twenty days (excepting Saturdays, Sundays, and legal public holidays) after the receipt of such appeal.",
  "(a)(6)(B)(i)": "In unusual circumstances as specified in this subparagraph, the time limits prescribed in either clause (i) or clause (ii) of subparagraph (A) may be extended by written notice to the person making such request setting forth the unusual circumstances for such extension",
};
