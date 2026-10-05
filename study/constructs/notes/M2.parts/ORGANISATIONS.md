### from jurisdictions.txt
- [DESIGN] jurisdictions R1, l.15 — a profile `covers` a non-empty list of jurisdiction names (union on combine, R13)
- [DESIGN] jurisdictions R4, l.20 — `systems` `{origin, name, hosts, path?, republishes?, provenance_stated?}`: publishing systems by origin (an office's system); `republishes` marks one office republishing another's; `mixed_hosts` "hosts that serve many offices' publications, so an address there names no system"
- [BUILT] jurisdictions R21, l.86 — the first profile's systems: "the legislative record ... the budget data set; the county assessor's layer republished by the city's portal, provenance unstated; the assessor's own publications; the permit system; and the auditor"
- [DESIGN] jurisdictions R6, l.24–25 — vocabulary `bodies` ("how a line names a body that meets or enacts") and `member_titles` ("the title printed before a member's name"): recognition patterns only, no roster of bodies or members
- [DESIGN] jurisdictions R24, l.34 — `counterparties` `{role, body, level, elected, oversight?}`: offices an action is addressed to — "named by official role and body, never by a person"; level state|county|city|district; `elected: true` = stage 7 political accountability; `oversight` absent → undetermined
- [DESIGN] jurisdictions R31, l.38 — "An office's level (R24) is not a law's level and keeps its own vocabulary."
- [DESIGN] jurisdictions R23, l.33 — a standard source names its `issuer`: "the body that makes them"
- [DESIGN] jurisdictions R32, l.39 — `legal_organisations` `{name, evaluates (Tier 3 kinds), contacts}`: outside bodies equipped to evaluate/file Tier 3 actions
- [CONFLICT] jurisdictions l.3 vs R36 l.91 — status line: "the first profile holds no `legal_organisations` until Bob rules which to name (K227)"; R36: first profile names Howard Jarvis Taxpayers Association (`assessment_challenge`, `taxpayer_action`) and First Amendment Coalition (`constitutional_claim`), basis `UNMEASURED` (K283 (2), K303) — the later ruling supersedes; check code
- [DESIGN] jurisdictions R42–R43, l.45–46 — offices carry hours and their own holiday entries (office-level calendars)
- [GAP] (observation, jurisdictions whole) — no organisational structure: no departments under bodies, no positions vs holders, no reporting lines, no responsibilities/obligations between bodies, no change over time; offices exist only as action addressees (R24) and publishing systems (R4)
### from id-spaces.txt
- [DESIGN] id-spaces R13–R15, l.40–42 — `systemOf`: an address names the publishing system (origin) of the first matching system; a republication names the system it republishes; a mixed host (many offices) names none
- [DESIGN] id-spaces R16, R19, l.46, l.49 — independence of publishers is checked before the referent: `SAME_SYSTEM` / `SYSTEM_UNDETERMINED` — "So no reading can make two publications of one source count."
- [DESIGN] id-spaces Suggestion, l.77 — the caller (`entities`, `op=idmatch`) passes only addresses the record located each capture at — "A provenance hop a caller can hand in is one a caller can invent."
### from docprofile.txt
- [DESIGN] docprofile Uses, l.154–160 — furniture lines (the publishing body's name, "its clerk's-office name") and caption vocabulary naming "which kind of body: a council, a board, a commission" come from the profile
- [DESIGN] docprofile Uses, l.170–173 — `staff_directory` content type: self-naming words ("directory", "staff", "roster", "contacts"); recognition floors ("the minimum count of distinct contact addresses and the share at one organisation's domain") stay in code (K574)
- [DESIGN] docprofile Uses, l.166–169 — reference-line shapes (e.g., a Legistar file number) "used as an entity key"; a different fact from an id-spaces form "not assumed to be one without a ruling saying so"
- [DESIGN] docprofile R34, l.207–209 (D-454, K754) — an entity read more than once is one entity, `source` its first sighting, with `occurrences` in reading order
### from office-readers.txt
- [DESIGN] office-readers R10, l.100–104 — authorship evidence inside office files: tracked-change `author`, comment `author`/`initials`, core properties `creator`, `lastModifiedBy` (who in a body drafted or edited a document); no module-level meaning is drawn (R24)
### from odf-reader.txt
- [DESIGN] odf-reader R8, R9, R29, l.61, l.69, l.173 — author/initials of tracked changes and comments; `creator` in core properties (authorship evidence, as office-readers)
### from extraction.txt
- [DESIGN] extraction R46, R58, l.136, l.75–76 — a reference (e.g., a body's or person's name as a reader emits it) is stored raw `kind:key` with `label` — "never resolved" here; `reading_refs` positions and occurrences are a read contract for entities, connections, retrieval
- [DESIGN] extraction R59, l.78 — the one term fold `normAlias`/`labelTerms` (lower-cased, split on non-letter/digit, ≤24 terms; "diacritics not folded"); "a name is matched within one (`capture_sha`, `ref`, `src`) group, never across sources" (R58)
- [DESIGN] extraction R28, l.57 (`op=readingref`) — every captured document whose reading carries a reference exactly, with positions and occurrences
- [DESIGN] extraction R21, l.45 (K104) — a reading this instance did not compose "is recorded as the caller's assertion", with its justification (e.g., "a recorded interview with an authority")
- none in content.txt (authorship there is members' and the machine's, R16, R36; no government body is modelled)
### from entities.txt
- [DESIGN] entities Terms, l.17 — "**Kinds** are closed: `source`, `institution`, `office`, `movement`, `person`, `body`, `ordinance`, `parcel`, `contract`, `fund`. **Relation kinds** are closed: `proxy_for`, `member_of`, `overlaps`."
- [DESIGN] entities Purpose, l.13 — entities are "the things a case is about, which outlive any document naming them, each with first-class aliases and member-declared constitutive relations"
- [EXAMPLE] entities R1, l.20 — a subject "registered under a name a person can read, such as 'City Clerk'"; a note (≤2,000) "on who or what this is and why it is registered"
- [DESIGN] entities R2, R6, l.22, l.28 — "The same fold may be held by different entities; nothing refuses an ambiguous name."; `entitiesByAlias` "ambiguity is kept, never resolved"
- [DESIGN] entities R3, l.23 — `declareRelation` requires `justification` (≤4,000) and `citation` (≤2,000); "A relation has no grade field and answers none (constitutive, not evidentiary)."
- [DESIGN] entities R8, l.30 (K106) — a member may correct the registry without erasing it (withdraw alias/relation, reasoned, kept visible)
- [DESIGN] entities R9–R12, l.33–36 — the recogniser resolves a reading's references to entities: `A` alias = ref, `B` alias = ref_key, `C` alias = label; `D` only by `testify`; `established` only A/B; "It never mints `D` and never matches through a declared relation."
- [DESIGN] entities R15–R17, l.41–46 — `concerns` (captures resolving to an entity, strongest each) and `namingDocuments` (term-index candidates with `selectivity`; "always says candidates are not resolutions")
- [DESIGN] entities R20–R24, l.51–55 — `idMatch` over id-spaces for shared identifiers; system from the record's captured locators, a member's declared origin (`provenance.originOf`) first
- [DESIGN] entities R38, l.70–80 (N345, DEC-76 item 3) — a report that a resolution "matched the wrong subject" (from a member or a contradiction candidate); "A report moves nothing."
- [GAP] (observation) entities whole — the three relation kinds cannot express reporting lines, responsibilities, obligations, appointment, oversight, contract parties, or a position vs its holder; relations are constitutive and never traversed (R26), so no chain of accountability can be followed by the machine
### from connections.txt
- [DESIGN] connections Purpose and R1, l.13, l.21 — "two captured documents that resolve to the same entity are connected", graded the weaker end; `established` only when both ends A/B
- [DESIGN] connections R34, l.128 — "a derivation never forms a connection through a declared relation" (documents naming a department and its parent body are not connected through `member_of`)
- [GAP] connections R2, l.22 — derivation bound: "the document bound is the largest k with k(k−1)/2 within it (32 at 500, 100 at 5,000)" — an office named in hundreds of documents connects only the first k by digest, `truncated`
- [DESIGN] connections R31, R53, l.67, l.91 — a member may assert a connection between two documents with a stated basis (grade `D`, kept apart)
### from progressions.txt
- [DESIGN] progressions Purpose, R6–R7, l.13, l.29–30 — an instance threads documents "by following one entity" (e.g., a contract, project or body); a placement must resolve to the entity (`NOT_CONCERNED`) and its grade is the record's strongest resolution
- [GAP] progressions Suggestions, l.117 — "a definition scoped to an institution" deferred (a flow cannot yet be declared for one body's process)
### from bias.txt
- [DESIGN] bias Purpose and R19–R21, l.13, l.46–48 — `biasInhale` "reads an outside organisation's policy into a proposal without ever installing it" (an outside body's evidentiary policy as input)
- [DESIGN] bias R3, l.22 — every statement's subject must be a registry key `ENT-YYYY-NNNN` (bias attaches to the same entities registry as ORGANISATIONS)
### from the repository check (Modules)
- [BUILT] oakland-alameda.mjs:207–217 — five counterparties (Controller/Finance Department, City Council, Civil Grand Jury `oversight`, City Auditor `oversight` with hours, State Controller), all basis `UNMEASURED`: the only list of public offices the product holds
- [BUILT] entities/index.mjs:28–31 — the ten kinds and three relation kinds as required; nothing richer in code
- [GAP] entity correction and defect acts `aliaswithdraw`, `relationwithdraw`, `resolutiondefect`, the `relation` read and `idmatch` are declared ops with UI 0 (built, unreachable by a member)
- [DESIGN] intent R4 (build/requirements/intent.md:27, layer 7) — an objective's matched instances are those "whose entity is the condition's entity or stands in its `relation` to it (`entities`)": one hop of a declared relation used for scoping, with walk bound 1,000 (entities R39)
