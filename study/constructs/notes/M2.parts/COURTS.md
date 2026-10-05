### from jurisdictions.txt
- [DESIGN] jurisdictions R23, l.33 — `court` is a `standard_sources` kind (court decisions as standards a government act is measured against)
- [DESIGN] jurisdictions R25, l.35 — a venue's `how` may be `court`; Tier 3 kinds (court actions) have no `use: file` template
- [DESIGN] jurisdictions R26, l.37 — `applies_to: claim` — "for a period that binds a legal claim" (limitation windows as profile data)
- [DESIGN] jurisdictions R39, l.41 — per-kind venue evidence standard (rule of evidence), grades it admits, grades the opposition may contest
- [EXAMPLE] jurisdictions R36, l.91 — Tier 3 kinds `assessment_challenge`, `taxpayer_action`, `constitutional_claim`, evaluated by named legal organisations
- [GAP] (observation) — no docket, party, filing or judgment vocabulary in the profile; courts appear only as standard source kind, venue and limitation period
- none in id-spaces.txt
- none in docprofile.txt (no court-document content type is registered: l.240–241 list meeting_minutes, meeting_agenda, regulation, staff_report, staff_directory, meeting_calendar)
- none in office-readers.txt
- none in odf-reader.txt
- none in extraction.txt
- none in content.txt ("cases" at l.61 are the group's published cases, not court cases)
- none in entities.txt (no court, case, party or docket kind among the ten closed kinds; a court could only be registered as an `institution` or `body`)
- none in connections.txt
- none in progressions.txt (a court proceeding's stages could be a declared flow, but nothing in the file says so)
- none in bias.txt
### from the repository check (Modules)
- [BUILT] oakland-alameda.mjs:231–244 — `records_petition` "court petition to enforce a public records request", Tier 2, venue "Alameda County Superior Court" (`how: court`), civil clerk's hours (M-193), advisory text; Tier 3 kinds include `consent_decree_motion` ("motion under a federal consent decree"), `taxpayer_action` ("Code of Civil Procedure § 526a"), `assessment_challenge`, `constitutional_claim`; no `claim` limitation deadline held
- [GAP] (observation across all eleven modules) none models a court case, docket, party, filing, order or judgment; courts appear only as a profile venue, a standard-source kind and Tier 2/3 action kinds; a court order would enter only as a captured document (content extents, entity kind `institution`/`body`)
