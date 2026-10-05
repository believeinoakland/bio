### from jurisdictions.txt
- [DESIGN] jurisdictions R3, l.17–19 — `spaces.enactment` (and project, fund, parcel): forms with patterns and a normal form that "removes formatting and never changes a digit"; enactment `kinds` with `prefix` and coverage `floor` `{first, system}` ("the first number of that kind that the system's record holds")
- [DESIGN] jurisdictions R5, l.21 — `crosswalks` between concurrent forms come only from a captured document (content hash) — "A crosswalk is never a pattern (Framework §8.3 rule 2)."
- [DESIGN] jurisdictions R6, l.26–29 — vocabulary `enactment_markers`; `codes` `{key, label, pattern}` — "a code of law cited by section"; `file_numbers` (legislative record); staff-report `report_titles`, `report_sections`, `recommendation_openers`, `template_blanks`
- [BUILT] jurisdictions R21, l.85–87 — first profile holds enactment kinds and their floors (M-119, M-132, M-157), "the municipal code's name and abbreviation, with its key prefix and label; the legislative file-number form"
- [DESIGN] jurisdictions R7, l.30 — `records_laws` `{level, name, citation}` by law level
- [DESIGN] jurisdictions R23, l.33 — `standard_sources` `{source, kind, issuer, level, cite, code?}`; `kind` one of statute, regulation, ordinance, court, policy, commitment — "where the standards a government act is measured against come from"
- [DESIGN] jurisdictions R31, l.38 (K108) — `LAW_LEVELS` = federal, state, county, city, in order, the one vocabulary of a law's level; D-149's `local` read as written, never recorded anew
- [DESIGN] jurisdictions R25, l.35–36 — `action_kinds` `{kind, label, tier?, laws?, venue?, template?, advisory?}`; `laws` names the records laws or standard sources that govern a kind; Tier 3 has no `use: file` template; Tier 2 carries an advisory recommending legal review
- [DESIGN] jurisdictions R39, l.41 — `evidence` per kind: the venue's standard "naming the rule or practice, for example a rule of evidence by its number", grades accepted and contestable
- [DESIGN] jurisdictions R40, l.42 (K921) — profile templates governed: id, version, use file|brief, authored_by ≠ approved_by, reviews by member or professional
- [BUILT] jurisdictions R30, l.90 — first profile action sections: kinds from `ACTION_KINDS` with tiers from Roadmap v5 §8, "the records law's response period and its citation", the offices addressed
- [GAP] (observation, jurisdictions whole) — the profile holds citation patterns and identifiers only, never a law's text, structure, definitions, amendments or version in force
### from id-spaces.txt
- [DESIGN] id-spaces R1, R5, l.16, l.23 — the `enactment` space ("an ordinance or resolution number"): `recognise` returns its `kind` (ordinance, resolution, as the profile names) and `reach`
- [DESIGN] id-spaces R4, l.22 — the normal form removes formatting only — "A digit is never changed."
- [DESIGN] id-spaces R17, l.47 — different forms give `FORMS_UNJOINED` — "Two forms never join unless the view supplies a crosswalk between them."
- [DESIGN] id-spaces Purpose, l.9 — only identifier sameness is judged; nothing about an enactment's content, amendment, or force
### from docprofile.txt
- [DESIGN] docprofile Purpose, l.16–19 — content types recognise documents by local vocabulary — "a masthead's wording, a code's own abbreviation, a report template's section names" — from the profiles
- [DESIGN] docprofile R6, l.39–44 — local facts tested from `ctx.view`: enactment kinds, forms and markers, codes, file numbers, report titles/sections, recommendation openers, practice deadlines
- [DESIGN] docprofile Uses, l.145–147 — instrument numbers ("an ordinance's or resolution's number, in its caption or cited by another document") recognised with the view's identifier section, the same forms id-spaces uses
- [DESIGN] docprofile Uses, l.157–162 — operative voice ("ordain/resolve") and caption vocabulary, the series suffix ("Oakland's is "C.M.S.""), and code-citation vocabulary ("Section", "Chapter")
- [DESIGN] docprofile Suggestions, l.240 — a `regulation` content type (with `staff_report`) exists in the registry
- [OPEN] docprofile Suggestions, l.223–230 — whether docprofile should recognise and normalise instrument numbers through `id-spaces` — "one fact, read once — is an architecture question for BOB, not settled here"
### from office-readers.txt
- [DESIGN] office-readers R10–R11, l.100–101, l.133–135 — a redlined DOCX (e.g., a draft ordinance) yields tracked insertions/deletions; "`w:delText` (deleted text) is NEVER in it — it lives only in the evidentiary `superseded` field"; inserted text is in `document` (the reading is the as-amended text; prior wording only in the envelope)
- [GAP] office-readers Suggestions, l.302–307 — the evidentiary envelope (tracked changes, comments, formulas…) is "extracted but not yet indexed as searchable content — a NINTH extent kind, `envelope`, is DESIGNED but NOT BUILT" (D-124)
### from odf-reader.txt
- [DESIGN] odf-reader R8, l.60–67 — a deletion's `superseded` text verbatim; "A deleted region's own paragraphs never appear in `paragraphs`, `document`, `tables` or their numbering." (prior wording of a redlined draft lives only in the envelope)
- [RULING] odf-reader Satisfies, l.259–261 — DEC-5 quoted: "Bob ruled these public documents' revision history IS evidence"
### from extraction.txt
- [DESIGN] extraction R52, l.66–67 — `op=pdfstructure` derives an agenda item's membership in a legislative file by page containment of item/file links matched to a profile system's `links.item`/`links.file` patterns; carries "`derived: containment, work: machine, asserted_by: system, grade: C, standing: inferred, established: false`"
- [GAP] extraction R52, l.67 — "*(the shapes are stated by no real profile until `jurisdictions` holds them: N96)*"
- [DESIGN] extraction R28, l.57 — `op=readingref` finds every document whose reading carries a reference (e.g., an enactment number or code section as `kind:key`): the only cross-document "where is this cited" read at this layer
### from content.txt
- [DESIGN] content R29–R31, l.66–68 — the version notice is the only "has this text changed?" service for a cited passage (e.g., a code section or ordinance clause cited from a capture): it compares captures of one address, graded; it does not know legal versions, amendments or effective dates
- [DESIGN] content R27–R28, l.61–63 — `citationRefusals`/`resolveCitation` serve "the modules whose edges cite (inquiry, basis versions, cases, actions)": any law passage cited in a finding or action goes through content's extent checks
- [DESIGN] content R33, l.74 — "An office document's envelope items (tracked-change authors, comments, core properties, speaker notes) are citable as content through an `envelope` extent." (redline history of a draft citable)
- [CONFLICT] content status l.4 says R33 met in T7 (CONTENT #2, REC-204, K102); office-readers Suggestions l.302–305 (T6 draft) says the `envelope` kind is "DESIGNED but NOT BUILT" and envelope items "not yet indexed as searchable content" — verify (Modules)
### from entities.txt
- [DESIGN] entities Terms, l.17 — `ordinance` and `contract` are entity kinds (a law or contract as a subject a case is about; no structure, provisions or parties)
- [DESIGN] entities R21, l.52 — `idMatch` on one enactment value answers its recognition: "for an enactment its kind and reach"
- [DOCTRINE] entities Satisfies, l.115 — Declared Bias safeguard 4: "every registry kind a legal subject"
### from connections.txt
- [DESIGN] connections R19–R23, l.49–53 — edges between bundles from each document's `references[]` (`cites`, `links_to`, `supersedes`…): backlinks ("who cites what"), dangling (C-6.2), severed edges, `citedBy` fact — the record's own citation graph, not the cross-reference structure of a law
- [DESIGN] connections R30, R49, R55–R57, l.64, l.69, l.93–95 — an agenda item's membership in a legislative file (extraction R52) stored as a system connection grade `C`, "never established", re-derived on re-read, confirmed or rejected by a member with reasons (legislative-history link from agenda to file)
- [DESIGN] connections R58, l.98 (N213) — `refs` read contract for `inquiry`, `publication`, `ratification`
### from progressions.txt
- [DESIGN] progressions Terms, R11, l.17, l.39 (K102) — requiredness `always`, `usually`, `sometimes`, `never`, `unless_exception`; a missing required stage is `missing_predecessor` unless "an exception names that stage", then `discharged_skip` ("not lawfully discharged", Purpose l.13)
- [RULING] progressions Satisfies, l.110 — DEC-9: "a required `unless_exception` stage with no exception document is a finding"
- [DESIGN] progressions R14, l.44 — `dischargeStage` records an exception document with a reason and a required citation (C-33.41), versioned
- [DESIGN] progressions R2, R4, l.21–23 (DEC-88; K1025) — a definition carries a basis statement (required at version 1: status l.5 "not yet met (T22)") and a citation (required for a revision) — the place a group cites the law that prescribes a procedure; the law itself is not modelled
- [GAP] progressions R32, l.102 — junction checks "(one response, a signed amount differing from the award, amendments past a threshold, payments past the term)" — "*(not yet met: no row; deferred by K102 until the record holds amounts and funds as values ...)*"
- none in bias.txt (its policy reader parses an outside organisation's evidentiary policy, not a government's law or policy)
