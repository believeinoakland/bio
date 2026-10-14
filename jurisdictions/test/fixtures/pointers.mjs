/* R92 (T48-2): the reads the first profile's pointers rest on, each page read on 2026-10-14 by the job's session (JURISDICTIONS
 * #12), with `curl` from the session's network where the host answered it, else with its web tool (`via: "web tool"`, a page
 * fetched and its text quoted back). Each quote is the page's own words, as read; the pointer's `does` is the profile's words
 * for them. Frozen evidence, not product code. */

export const READ = "2026-10-14";

/* K3190's official list for legal aid: the State Bar's Pro Bono Opportunities Directory. Its index page says of every program
   it lists: "All programs listed are nonprofit legal services organizations that receive funding from the State Bar Legal
   Services Trust Fund Program." The organisations it lists under its "Alameda County" heading, in its order. */
export const LEGAL_AID_LIST = Object.freeze({
  index: "https://www.calbar.ca.gov/legal-professionals/volunteer/pro-bono-opportunities",
  page: "https://www.calbar.ca.gov/legal-professionals/volunteer/pro-bono-opportunities-directory/san-francisco-area-pro-bono-directory",
  heading: "Alameda County",
  names: ["AIDS Legal Referral Panel", "Alameda County Homeless Action Center", "Asian Pacific Islander Legal Outreach", "Bay Area Legal Aid",
    "Centro Legal de la Raza", "Family Violence Law Center", "Justice & Diversity Center of the Bar Association of San Francisco",
    "La Raza Centro Legal", "Lawyers’ Committee for Civil Rights", "Legal Access Alameda", "Legal Assistance for Seniors",
    "Legal Services for Children", "Santa Clara County Asian Law Alliance", "Social Justice Collaborative"],
  /* the list's name for each organisation → the name its own page gives it, which the profile holds */
  own: {
    "Alameda County Homeless Action Center": "Homeless Action Center",
    "Asian Pacific Islander Legal Outreach": "API Legal Outreach",
    "Lawyers’ Committee for Civil Rights": "Lawyers' Committee for Civil Rights of the San Francisco Bay Area",
    "Santa Clara County Asian Law Alliance": "Asian Law Alliance",
  },
});

/* Hosts that refused the read: the pointer is absent and named in the job's record. */
export const REFUSED = Object.freeze([
  { name: "Legal Assistance for Seniors", host: "www.lashicap.org", answer: "HTTP 403 to curl and to the web tool" },
]);

/* Read and left out, with why (named in the job's record). */
export const LEFT_OUT = Object.freeze([
  { name: "The Oaklandside", kind: "tipline", why: "its contact page (read with the web tool) names a confidential email to its editors and a message form, but no tip channel as such; oaklandside.org/tips/ answered HTTP 429 to both tools" },
  { name: "OAK 311's short code", kind: "service", why: "the page tells callers to dial it for active infrastructure emergencies; only the ten-digit number and the page are held (DEC-227 (4))" },
  { name: "OPD Internal Affairs' 24-hour complaint hotline", kind: "agency", why: "a police department's own line, printed on the same page as the Community Police Review Agency's; the independent agency is held" },
]);

/* Every source a first-profile pointer names, with the words read there. */
export const READS = Object.freeze({
  "https://www.alrp.org/": { via: "curl", quote: ["Comprehensive civil legal services for the HIV/AIDS community",
    "We support people living with HIV/AIDS in the Bay Area through direct legal representation, careful placement with volunteer attorneys, and connection to non-legal service providers.",
    "Client Line: (415) 701-1100", "1663 Mission Street Suite 720 San Francisco, California 94103"] },
  "https://homelessactioncenter.org/": { via: "curl", quote: ["Benefits Helpline: 510-775-0035 | Mon–Thu 1:00–5:00 PM",
    "Call our helpline at 510-775-0035 or drop by one of our offices Mon–Thu 1:00–5:00 PM", "2601 San Pablo Avenue Oakland, CA 94612",
    "the mission of the Homeless Action Center is to provide high-quality public benefits advocacy for free to unhoused and disabled residents of Alameda County."] },
  "https://www.apilegaloutreach.org/contact/": { via: "curl", quote: ["the mission of API Legal Outreach is to provide culturally competent and linguistically appropriate legal representation, social services, and advocacy for the most marginalized segments of the community including low-income women, seniors, recent immigrants, and youth.",
    "Oakland Office", "310 8th St., Suite 305, Oakland, CA 94607", "(T) 510.251.2846",
    "To seek legal advice or representation, please submit us a message through our website or call us at our San Francisco or Oakland office to speak with a legal intake staff."] },
  "https://baylegal.org/": { via: "curl", quote: ["We provide free civil legal help to low-income people in the Bay Area, including advice, self-help clinics, and representation.",
    "Legal Advice Line: 800-551-5554", "Administrative Office 1735 Telegraph Avenue Oakland, CA 94612"] },
  "https://www.centrolegal.org/": { via: "web tool", quote: ["Centro Legal De La Raza",
    "We are a legal aid nonprofit protecting and advancing the rights of low-income, immigrant, and communities of color",
    "bilingual legal representation, education, and advocacy", "510-437-1554", "3400 E. 12th Street, Oakland, CA 94601"] },
  "https://fvlc.org/": { via: "curl", quote: ["Founded in 1978, Family Violence Law Center (FVLC) helps diverse communities in Alameda County heal from domestic violence and sexual assault",
    "We provide survivor-centered legal and crisis intervention services", "Family Violence Law Center 470 27th Street Oakland, CA 94612 800-947-8301"] },
  "https://www.sfbar.org/jdc/jdc-contact-us/": { via: "web tool", quote: ["The Justice & Diversity Center (JDC) advances fairness and equality by providing pro bono legal services",
    "Justice & Diversity Center of the Bar Association of San Francisco 50 Fremont St. Suite 1700 San Francisco, California 94105",
    "Phone: (415) 982-1600", "Monday – Friday", "9:00 a.m. to 5:00 p.m."] },
  "https://www.lrcl.org/": { via: "curl", quote: ["We advance civil and human rights and ensure access to justice through free legal services and advocacy",
    "474 Valencia Street, Suite 295, San Francisco, CA 94103", "info@lrcl.org ph. 415-575-3500"] },
  "https://lccrsf.org/": { via: "curl", quote: ["provide direct services to low-income and historically marginalized communities, and ensure access to free legal services for those most impacted by systemic racism and oppression.",
    "131 Steuart Street, Suite 400 San Francisco, CA 94105", "Phone: 415.543.9444"] },
  "https://www.legalaccess.org/": { via: "curl", quote: ["Legal Access Alameda (Legal Access) is the 501(c)(3) pro bono arm of the Alameda County Bar Association.",
    "Legal Access Alameda provides free direct legal assistance to Alameda County’s low-income litigants by mobilizing volunteer attorneys to provide pro bono service.",
    "Intake Line (510) 302-2222 *4"] },
  "https://lsc-sf.org/": { via: "curl", quote: ["LSC defends the rights of children and youth in crisis",
    "San Francisco Bay Area youth need your support more than ever.", "help meet young people’s need for legal and social work services.",
    "Need help? Call our Warmline.", "Warmline Hours Mon & Thu 1:30 to 4:30 pm", "Warmline Number (415) 780-6366", "Linea en Español (415) 780-6367",
    "870 Market Street, Suite 356, San Francisco, CA 94102"] },
  "https://asianlawalliance.org/": { via: "curl", quote: ["Asian Law Alliance provides free legal services, educates residents about key rights, and engages in advocacy to build power with and for underserved community members.",
    "991 W. Hedding Street #202 San Jose, CA 95126", "Phone: (408) 287-9710"] },
  "https://www.socialjusticecollaborative.org/en": { via: "curl", quote: ["Free and low-cost legal representation as a right",
    "Social Justice Collaborative stands with immigrant families across Northern and Central California.",
    "Services in our clients' languages, including Indigenous languages, with staff interpreters",
    "1832 Second Street Berkeley, CA 94710", "(510) 992-3964", "office@socialjusticecollaborative.org"] },
  "https://www.alameda.courts.ca.gov/self-help": { via: "curl", quote: ["Self-Help Services",
    "If you do not have an attorney, the Self-Help Center and Family Law Facilitator staff and volunteers may be able to assist you with procedural information and instruction on completing forms.",
    "Call: (510) 272-1393, Mon-Thurs, 2PM-4PM"] },
  "https://selfhelp.courts.ca.gov/": { via: "curl", quote: ["Self-Help Guide to the California Courts",
    "Resources and information to help you navigate your court case, including step-by-step guides for following procedures and help with understanding your options."] },
  "https://www.oaklandca.gov/My-Household/Report-an-Issue-OAK-311": { via: "web tool", quote: ["Report an Issue (OAK 311)",
    "For urgent issues, call 311 or (510) 615-5566.", "Please report all non-emergency issues online at this page.",
    "illegal dumping, graffiti, city building maintenance, potholes, and abandoned vehicles"] },
  "https://www.oaklandca.gov/Government/City-Council-Leadership/Leadership": { via: "web tool", quote: [
    "At Large: (510) 238-7008, atlarge@oaklandca.gov", "District 1: 510-238-7001, zunger@oaklandca.gov", "District 2: 510-238-7021, district2@oaklandca.gov",
    "District 3: (510) 238-7003, District3@oaklandca.gov", "District 4: 510-238-7004, District4@oaklandca.gov", "District 5: 510-238-7005, Ngallo@oaklandca.gov",
    "District 6: (510) 238-7006, District6@oaklandca.gov", "District 7: 510-238-7007, District7@oaklandca.gov"] },
  "https://www.oaklandca.gov/Public-Safety-Streets/Report-Police-Misconduct": { via: "web tool", quote: ["Members of the public can visit the Community Police Review Agency (CPRA) to file a complaint",
    "(510) 238-3159", "https://apps.oaklandca.gov/CPRAPublic/", "250 Frank Ogawa Plaza Suite 6302 Oakland, CA 94612",
    "Office hours are Monday through Friday, 9:00 a.m. to 5:00 p.m"] },
  "https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/File-a-Complaint-with-the-Public-Ethics-Commission": { via: "web tool", quote: [
    "File a Complaint with the Public Ethics Commission", "To report a violation of government ethics, campaign finance or transparency laws in the City of Oakland", "(510) 238-3593", "ethicscommission@oaklandca.gov",
    "Public Ethics Commission, 250 Frank H Ogawa Plaza, Suite 6303, Oakland, CA 94612"] },
  "https://www.oaklandca.gov/Community/Housing-Programs-Support/Rent-Adjustment-Program-RAP/For-Tenants/File-a-Tenant-Petition": { via: "web tool", quote: [
    "Tenants of units covered under the Rent Adjustment Ordinance may file a petition with RAP",
    "to challenge certain rent increases and/or for a decrease in rent paid due to a loss in service", "(510) 238-3721", "RAP@oaklandca.gov",
    "250 Frank H. Ogawa Plaza, Suite 5313, Oakland, CA 94612", "Housing Counselors are available Monday through Thursday, 9:30 a.m. to 4:30 p.m."] },
  "https://www.oaklandauditor.com/whistleblower/submit-a-complaint/": { via: "curl", quote: ["Use the confidential hotline to report complaints of fraud, waste, and abuse",
    "The hotline is available 24/7 to city employees, contractors, vendors, and residents.", "WHISTLEBLOWER HOTLINE at 1-888-329-6390 (interpreter available)",
    "https://secure.ethicspoint.com/domain/media/en/gui/23089/issues.html?locationid=-1"] },
  "https://projects.sfchronicle.com/newstips/": { via: "curl", quote: ["Have a news tip for The Chronicle?",
    "For general correspondence (press releases, story pitches, breaking news tips, etc), please email metro@sfchronicle.com",
    "You can reach our investigative team by telephone at (415) 777-7239.", "News Tips The San Francisco Chronicle 901 Mission Street San Francisco CA 94103"] },
  "https://www.ktvu.com/about-us": { via: "curl", quote: ["If you have a news tip or story idea for KTVU Fox 2 in San Francisco Bay Area, email newstips@fox.com or call our newsroom in Oakland, Calif. at (510) 874-0242."] },
  "https://calmatters.org/about/contact-us/#news-tips": { via: "curl", quote: ["News Tips", "If your tip isn’t sensitive, you can send us an email at tips@calmatters.org.",
    "Confidential Tips"] },
});
