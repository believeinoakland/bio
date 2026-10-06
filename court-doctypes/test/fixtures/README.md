# court-doctypes fixtures

Captured by COURT-DOCTYPES #1 on 2026-10-05 (UTC) with a browser-like User-Agent (CourtListener's CloudFront
refuses curl's default one, `measures-T33/courts-workbooks.md` §1 (b)), byte for byte as served. Each is
public and was fetched without an account. Provenance, not a place in code (`build/layers.md`, rule 6).

| file | address | what it is |
| --- | --- | --- |
| `courtlistener-4214664-p2.html` | `https://www.courtlistener.com/docket/4214664/national-veterans-legal-services-program-v-united-states/?page=2` | docket 4214664, page 2 of 4: 100 rows, 49 unnumbered (minute) entries, a sealed and two unsealed rows |
| `courtlistener-4214664-p4.html` | the same, `?page=4` | page 4 of 4: 27 rows |
| `courtlistener-404.html` | `https://www.courtlistener.com/docket/4214664/` (no slug) | CourtListener's error page (HTTP 404) at a docket address |
| `courtlistener-sign-in.html` | `https://www.courtlistener.com/sign-in/` | CourtListener's sign-in page |
| `cpuc-A2106021-card.html` | `https://apps.cpuc.ca.gov/apex/f?p=401:56:0::NO:RP,57,RIR:P5_PROCEEDING_SELECT:A2106021` | the proceeding card of A2106021 |
| `cpuc-A2106021-documents-p1.html` | `https://apps.cpuc.ca.gov/apex/f?p=401:57:0::NO:RP,57,RIR:P5_PROCEEDING_SELECT:A2106021` | its documents report, rows 1 to 100 of 590 |
| `cpuc-search.html` | `https://apps.cpuc.ca.gov/apex/f?p=401:1:0` | the proceeding search page |
| `ecourt-login.html` | `https://eportal.alameda.courts.ca.gov/?q=node/387` (redirected to `?q=user/login&destination=node/387`) | the portal's sign-in page, where Case Number Search sends an anonymous visitor |
| `ecourt-search.html` | `https://eportal.alameda.courts.ca.gov/?q=node/388` | the portal's search page |
| `ecourt-roa-FICTIONAL.html` | none | **FICTIONAL**, built from the portal's stated fields; to be replaced by a member's own capture (K1492; R7, R16) |

Rows, keys and numbers as a member reads them are asserted in `../readers.test.mjs`.
