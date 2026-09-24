# BIO / CivicOS — the system design

**Status** · v0.1 DRAFT, written 2026-09-14 by session BOB #10 at Bob's direction, awaiting Bob's review; the three constructs it named homeless at writing (11, 13, 15) received level-1 homes the same day (§3). This is the level-0 document the design corpus standard (`CORPUS-STANDARD.md` §2) requires: the whole system described broadly and completely at one altitude — its purpose, the path it serves, every major construct with its importance, its relationships and its home document, and the runtime shape — so that a reader can place any construct before opening its document. It is written from the record at `origin/main` `c2ba7a2` and from the documents it points at; it rules nothing and designs nothing of its own. Completeness: the construct inventory (§3) is believed complete at this altitude and every row's STATE column is this session's reading, not yet Bob's; §5's ladder states are pointers to `MILESTONES.md`, which stays the authority for what is open. The one caveat: several level-1 documents this map points at were written against the retired runtime and say so in their own front matter — read their Status before their body. **BOB RULED §3 THE SINGLE AUTHORITY ON DESIGN STATUS on 2026-09-17, and asked that the record be checked for second sources of truth; `tools/corpuscheck.mjs`'s `--authority` arm (M0-57) now refuses a governed document that lists a construct among the pieces still to be designed when a home document this map names has designed it.** Its reach is narrow by design and stated in the tool's header; M0-58 is the sweep. as of 2026-09-24 (§3 state rendered from construct-status.json).

**Place in the system** · The top of the design corpus. Every level-1 document in `docs/architecture/` is a construct named in §3 or a mission document named in §2; a construct not named here is not a major construct, and a new one is added here in the same landing that gives it a home (`CORPUS-STANDARD.md` §4). `README.md` catalogs the documents; this document places the constructs. `CLAUDE.md` carries the doctrine every session loads and points here for the whole.

**Incomplete sections** ·
- §3 — the STATE column is now RENDERED from `construct-status.json` and verified against the code at every push (2026-09-18); it replaced a hand reading of 2026-09-14 that three independent reads found wrong in both directions, mostly calling BUILT things absent. Since M0-138 (BOB #31, 2026-09-23) each claim renders its FIRST SENTENCE only; the whole text is `node tools/status.mjs <n>`, so the map's budget never trims the source of truth. **What it still cannot say:** a probe proves a named thing is PRESENT, or ABSENT under the names searched — never that it WORKS (the battery's job), and an absence is only as good as the names tried. Three claims rest on the code's own statement of an absence (5.reextract, 8.contradiction, 9.internet) and say so.
- §4 — the class diagram shows the 14 constructs that have relationships drawn; construct 10 (standing intent and monitoring) is folded into Capture and Operations there and is not a separate class until Bob confirms the inventory.
- §5 — the capability ladder is summarised by pointer; per-milestone state is not restated here because `MILESTONES.md` is its authority and a copy would drift.
- §6 — the runtime shape names what is deployed on the project's instance; a sovereign group's instance differs (it gets the fleet only through the installer DIST deploys) and the differences are listed, not designed.

**Contents**
- [1. Purpose — the path, and the stance](#1-purpose-the-path-and-the-stance)
- [2. The system in one view](#2-the-system-in-one-view)
- [3. The major constructs](#3-the-major-constructs)
- [4. How the constructs relate](#4-how-the-constructs-relate)
- [5. The capability ladder as the completeness map](#5-the-capability-ladder-as-the-completeness-map)
- [6. The runtime shape](#6-the-runtime-shape)
- [7. The doctrine spine](#7-the-doctrine-spine)
- [8. What this document does not own](#8-what-this-document-does-not-own)

---

## 1. Purpose — the path, and the stance

**CivicOS exists to answer questions, make a case, tell a story, and take action to affect
a living civic system** (Bob, 2026-08-01, `CLAUDE.md`). Everything in this system is
substrate for one thing: supporting a member through the winding path of *questioning,
exploring, discovering, documenting, and impacting* the civic system they live in. A
capability that does not serve that path is not obviously worth building.

The stance is doctrine (`CLAUDE.md`, "The stance"): the objective is BETTER GOVERNMENT
through greater understanding, less narrative, and accountability; all stakeholders are
presumed to want better outcomes; bad actors are identified by EVIDENCE, never assumed by
role; and *less narrative* binds us before it binds anyone else. The product is therefore
**the trustworthiness of the record**: a group captures what a public body published and
can prove later that it said what they claim. A defect that lets the record claim more
than it can support is worse than a missing feature.

Three rules follow and govern every construct below: **undetermined is first-class and
must be stated**; **an equality or outcome that costs nothing to produce is not
evidence**; **derived things inform, authored acts bind** — the machine may do the
LOOKING, the member does the CONCLUDING (DEC-24).

## 2. The system in one view

A **group** — as small as one person (Design Requirement 2) — installs its own
**sovereign instance** into its own Cloudflare account with the installer `newgroup`
(§6). The instance is a **plane** (a Worker) fronting a **Durable Object with SQLite**
that holds the **record**, with captured bytes in **R2**. Members reach it through the
member surfaces (`civicos-ui`) and, where they choose, through an **assistant** that works
under the same fences. The plane **captures** documents a public body publishes and keeps
their **provenance**; it **extracts content** from them; it derives **meaning** — entities,
connections, progressions — and states how strongly each is established; members author
**inquiries** that rest on content and on other inquiries, conclude them as **findings**,
and produce a **case** the group **stands behind** and **publishes**; the published corpus
is verifiable by a stranger with no credential; and outward **action** can say which
findings justified it. The instance keeps itself current unattended (a scheduler on one
reconciling alarm), tells the truth about what it is and can do, and can be left,
mirrored and outlived.

The mission-level constraints every construct satisfies are in two documents that own no
construct: `BIO_Complete_Roadmap_v5.md` (the mission of record: values, principles, the
seven-category UX, the stance) and `BIO_Design_Requirements_v2.md` (fifteen requirements;
"the system fails if any is violated"). On conflict the Design Requirements govern.

## 3. The major constructs

One row per construct. **Importance** says why the row exists at this altitude. **Relates
to** names the constructs it depends on or feeds. **Home** is the level-1 authority; a
level-2 design that serves the construct is named in brackets. **State is RENDERED, never
hand-written** (Bob, 2026-09-18: one source of truth, always kept updated): it comes from
`docs/architecture/construct-status.json`, whose every claim carries probes that
`node tools/status.mjs --check` re-runs against the code, and the push is refused while any
disagrees. A cell carries each claim's FIRST SENTENCE, a cut one ending in `…` (BOB #31, 2026-09-23): the
whole text is in the JSON and `node tools/status.mjs <n>` serves it. Look anything up with
`node tools/status.mjs <topic>`; edit the JSON, never trimming a claim to fit, then
`node tools/status.mjs --write`.

| # | construct | what it is | importance | relates to | home | state |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Membership and authority** | cover and handle, administrators and the two-administrator floor, capabilities, burner-URL invitations, project participation and ownership, secure verified export; who may perform which act, and what an act is worth when a machine performs it | every authored act in the system is attributed to a member; the fences on capture, attestation and publication rest on it | record (3), publication (13), assistant (11) | `BIO_Membership_Architecture_v2.md` [`AUTHORITY-AND-TRUST.md`] | **BUILT:** the two-administrator floor, with endorsement and removal votes — and since D-136 (2026-09-19) the §4.7 vote is CASTABLE BY A PERSON AND UNFORGEABLE: `op=adminendorse` and `op=adminremove` reach any administrator's session (both …; burner-URL invitations and enrolment, which D-158 (C-63) binds signing keys to; project participation, ownership votes, fork and rescue; project name uniqueness (Membership v2 §7.1, §11 item 8) at BOTH halves through ONE key: the write path refuses NAME_TAKEN (`promote`, the fork) and the catalog's corpus check C-77 (D-50, 2026-09-23) names every colliding pair of projects … (also cites §11 item 9); member capabilities and declared expertise — and since D-136 (2026-09-19) §4.9's capability edit is a NAMED ADMINISTRATOR'S act: `op=membercaps` rides with the §4.7 votes in `GOVERNANCE_ACTIONS` and `Store#memberCaps` READS its …; secure verified export, logged, and told to every administrator (D-52); machine credentials minted and revoked by members; a request names one of exactly two namespaces, `bio` (the record) or `scratch`; any other `store=` value — a namespace that does not exist, a case variant, an empty one — is refused by name (NAMESPACE_UNKNOWN, C-78.1; D-456, IC-237) for …; a public op that always answers from `bio` refuses `store=scratch` by name (NAMESPACE_PINNED, C-78.2; D-461, IC-250): the thirteen `classes: null` ops (measured by d461-pinned-namespace at c19-batch11, 2026-09-24) other than `invitelook` …; a gated opaque id is recorded in the purge-exempt `minted_ids` ledger at its draw and never drawn again, purge or not (D-432, IC-170); the boot seed adds the live and the untailed counter-era ids, and cannot see one that left every live … · **PARTIAL:** DISCOVERABLE or HIDDEN (Membership v2 §7.14): step 1 BUILT by REC-149 (IC-231, C-70, 2026-09-23) — the setting is an OWNER's recorded act (`op=projectvisibilityset`, append-only `project_visibility`, latest wins, no record = HIDDEN, so … · **DEFERRED:** the root of trust is the ADMIN_TOKEN holder and cannot be voted out; custody is deliberately unmodelled (DEC-2, deferred) — verified at the code: `node tools/status.mjs 1` |
| 2 | **Intake, capture and provenance** | how material enters the record: admission requires provenance never relevance; capture grades; the provenance chain of hops; the daemon/member division of who fetches; the archive fallback; link fidelity; authority follows the data | the record's trust root — a hop attests "these bytes, this URL, this time" and no more; everything above inherits the document's chain | record (3), content (4), scheduler (14) | `BIO_Intake_Doctrine_v1_1.md` [`LINK-FIDELITY.md`, `ARCHIVE-FALLBACK.md`, `SOURCE-ACCESS.md`, `CAPTURE-SCALING.md`, `CLIENT-RENDERED.md`] | **BUILT:** capture and acquire, with grades A/B/C enforced as a check; the provenance chain, its rebuild, and the per-document provenance route marks (`provenance_route_marks`) — a status line, not a design home: construct 2 names no home for them; link discovery with fidelity verdicts; a reused subresource names the capture whose fetch served its bytes, and a reuse recorded before that build reads undetermined as to its source (CAP-14). …; named capture requests and their drain; TSA co-attestation; the per-host governor; a narrowly scoped `daemon` credential class exists in the plane (acquire's archive arm, monitor, capturerequestdrain) — the intake doctrine's retired daemon is a different thing; one capture, one home: held bytes under a second bundle are refused (C-53.13); op=homecensus lists rows a pre-fence move displaced, rewriting none · **PARTIAL:** a member's firsthand observation as evidence (D-184; MEMBER-KNOWLEDGE-DESIGN.md §2–§4). …; a client-rendered page captured as the PAIR (D-64; CLIENT-RENDERED.md §"What must be recorded on a rendered capture", BOB #31, BOB #32). … — verified at the code: `node tools/status.mjs 2` **Designed in:** firsthand observation (2.firsthand) and attribution — `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §2–§4 (2026-09-18). |
| 3 | **The record** | the bundle: id grammar, universal frontmatter, per-type schemas and state machines, the closed relationship vocabulary, cascade semantics, the invariant set and the violation-to-repair map, the Mechanical Verification Law; the C-series check catalog that gates every write | the shape everything else is stored in and checked against; the plane implements it and `bio-checks.mjs` runs it | all rows | `BIO_State_Rules_Consistency_v1_5.md` [`BIO_Bundle_Skill_Composite_Design_v1_7.md` for the inherited format and checks] | **BUILT:** the gate and the case gate run the check catalogue on every write; history is append-only at the write (State Rules §2.4, REC-176): op=promote refuses a snap key the bundle's manifest already holds (SNAP_KEY_TAKEN, C-67.1) before anything is written, and its manifest and history writes are plain INSERT …; a stored "changed from" sentence is corrected by a READ, never a rewrite (D-256, BOB #31 2026-09-23): op=changedfromaudit finds every body carrying addGo's pre-D-221 sentence, resolves the bundle it names through the version chain, and …; the closed relationship vocabulary and the violation-to-repair map; the edition-keyed published projection; a bundle's `group`, the producing group's slug in its signed bytes (State Rules §3.1), is ONE recorded value per instance (D-436, IC-172): written once, at the store's first boot from the slug the installer bound, or by the root of trust's …; a stored digest is of the stored bytes (State Rules §8, REC-175): op=promote computes every inline file's SHA-256 over its UTF-8 bytes and refuses a supplied value naming another, on any file, before anything is written …; a stored size is of the stored bytes (State Rules §8, REC-178): op=promote computes an inline file's bytes from its UTF-8 encoding, stores that whatever was supplied, and judges OVERSIZE_INLINE on it; op=digestcensus counts held rows whose …; a refused op=promote writes nothing (§8, REC-180); op=promote refuses to retire a cited item, as op=retire does (§4.1, REC-181); op=reinstate refuses to put an edge back onto a retired item (REC-183); a CENSUS of the plane: 221 ops, 117 tables — any addition or removal, under any name, fails the check until the claims it could change are reviewed. … · **UNDETERMINED:** whether a given instance serves this build is not a fact about the code; ask the instance (`/version`) — verified at the code: `node tools/status.mjs 3` |
| 4 | **CONTENT** | the unit the record points at: a reference to a PART of a document up to and including the whole (DEC-23); its two intrinsic properties — EXTENT and EXTRACTION METHOD (DEC-4); the forms it takes; the extraction process as built; how it is organized and reached; the central gap — *the address exists, no edge carries it* (D-164) | **the heart of the system** (Bob, 2026-09-15): documents are harvested, content is extracted, meaning derives from both; a store of unread documents is noise with good provenance | capture (2), record (3), meaning (6), inquiry (8), retrieval (9), assistant (11), surfaces (12) | `BIO_Content_Framework_v0_10.md` **Part II** [`CONTENT-EXTENT-DESIGN-SPACE.md`, `STORE-AS-CACHE.md`] | **BUILT:** the content object: a content-addressed row minted lazily on first edge, readable and machine-mintable; D-164's central gap is CLOSED: basis legs and version legs carry a content_id, and op=cite accepts one; all five extent arms are landed: document, pdf-page, sheet-cell, slide-shape, doc-para; REC-86's on-point narrowing of a LEG: the machine's candidates (op=narrowcandidates, labelled machine work) and the member's act (op=narrow), which writes a NEW basis version and retains the old one; the on-point choice for a CONNECTION is …; member TRANSCRIPTION, plane half (REC-87, IC-127/IC-128): the `typed(member)` derivation step on a content row's chain with cap undetermined, op=transcribe, a second member's op=transcriptionattest (the typist's own refused, C-52.9) …; a deck's bound is its declared length (COFF-13); the CROSS-VERSION NOTICE, plane half (D-394, framework §18.1, IC-239): op=versionnotice answers, for a question's cited passages (target=) or one passage (content=), whether the document's address holds a NEWER capture — WITH CERTAINTY …; the content extent kinds are exactly these eight — a new kind under any name fails the check · **ABSENT:** a member surface for TRANSCRIBE (a portion selection plus an empty text field), delegated to UI in CLAIMS.md by REC-87; a member surface showing the cross-version notice where the member meets a citation (§18.1's HOW); the plane half is 4.cross-version — verified at the code: `node tools/status.mjs 4` |
| 5 | **Document profile and the extraction substrate** | recognisers over three axes (host stack, content type, format); regions and three digests; change as layers with one entry point; the transcription chain and its four rules; calibration; the L2→L3 wire through three tiers (in-plane, pdf-worker, ocr-worker) | how bytes become readable text and readings honestly — the machine's EXTRACT role as built | capture (2), content (4), fleet (15) | `BIO_Content_Framework_v0_10.md` **Part I** [`DOCUMENT-PROFILES.md`, `OFFICE-FORMATS.md`, `CONSTRUCTS.md` as the 2026-07-30 inventory] | **BUILT:** host-stack handlers and the three digests; three extraction tiers: in-plane, the PDF worker, the OCR worker; SEVEN doctype readers: meeting calendar, agenda, minutes, staff report, regulation, staff directory (FW-20, M0-32's fourth class, read at tier 2 — M-121), and the generic fallback; AI-proposed readings, kept out of coverage (the EXTRACT role's plane half); tables and images as content: the sheet-range, doc-table and image extent arms are landed (FW-19); an image's cited_as distinguishes it; an image's {part} is a member of an OFFICE CONTAINER's own bytes and is refused by name on any capture …; an image {page, rect} citation is bounded by what the page PAINTS, not only by the page set (D-420): acquire persists a PDF's painted-image placements as container_extent.images, and a rect no placement equals is refused C-45.12 by name; a …; a tier-1 PDF LINE is a baseline and its RUNS are separated by the pen (D-481 then D-502, 2026-09-24): glyph advance widths are read from the file — /Widths with /FirstChar and the descriptor's /MissingWidth for a simple font, /W and /DW …; read-time re-extraction to tier 3, OPT-IN on op=pdfstructure&ocr=1 (D-319, closed by CPDF-19); existing stored captures are not rewritten; the transcription chain's step kinds are exactly these seven — a new step under any name fails the check. … — verified at the code: `node tools/status.mjs 5` |
| 6 | **Meaning: entities, connections, progressions** | the entity axis (registry, aliases, constitutive relations, graded resolutions); referential and temporal connections as DATA with their own grade; progressions as the many shapes a happening takes, with the missing predecessor as a finding; identifier spaces where grade collapses | "every document that concerns this ordinance" is one query; a connection has a grade like a capture does; a machine-proposed connection is a HUNCH until earned | content (4), bias (7), inquiry (8), retrieval (9) | `BIO_Content_Framework_v0_10.md` Part I §8, §8.1–8.3 | **BUILT:** the entity registry, aliases, constitutive relations, and graded resolutions (at document grain); a connection keeps its determining reference pair and each end's position (D-161 closed); progressions, with missing-predecessor and overdue-successor findings; a member CHOOSES the on-point mention on one end of a connection (op=connectionchoose, REC-122, IC-232; D-161 act 3): a machine credential is refused by name (C-74.1), a mention the document does not carry is refused (C-74.3), a re-choice …; op=connections' entity arm states whether the DERIVATION behind its rows was cut, from REC-95's latest derivation observation, and states no row as never derived, pre-log or undetermined (D-241, IC-236); a THEME, a connection through an IDEA (D-162; framework §8.4), plane half: the `themes` and `theme_placements` tables and op=themedeclare, themeplace, themepropose and themeread. … · **ABSENT:** a member surface for choosing a connection's on-point mention (the connection display), owed by UI; the plane half is REC-122's; identifier spaces where grade collapses — verified at the code: `node tools/status.mjs 6` |
| 7 | **Declared bias** | bias as a declared, justified, first-class construct: three statement kinds, bundles and adoption, the subject registry (the same construct as the entity axis), bias debt versus HUNCH DEBT, the authored acknowledgement at export, regrade and the cross-group rerun | "less narrative" made mechanical: what a member brings to the record is stated, and evidence accrues to it | meaning (6), inquiry (8), publication (13) | `BIO_Declared_Bias_v0_1.md` | **BUILT:** bias statements in three kinds, adoptions with revision pins, manifest and inhale; the bias acknowledgement is required at publication; THE BIAS MANIFEST TRAVELS WITH PUBLICATION (D-84; BIO_Declared_Bias_v0_1.md §Bias bundles and adoption, §The bias acknowledgement, authored at export): op=publish computes the manifest in force for the case's project scope — each (bias …; bias debt is raised AND SETTLED: one disclosed, never-blocking obligation per run whose lens moved, read from op=airun's comparison, and three acts that settle it, each RECORDED · **ABSENT:** the PUBLICATION REFUSAL for an uncleared HUNCH is NOT BUILT: no code refuses a publication for hunch debt, `UNCLEARED_HUNCH` is a refusal code this plane does not carry, and `op=publishpreflight` is in no OPS table (REC-15, blocked in …; regrade / cross-group rerun under another lens; a member surface for bias (the ops have no UI caller) — verified at the code: `node tools/status.mjs 7` |
| 8 | **Intent and inquiry — from goal to case** | goals → objectives → aspirations and the discovery loop; the recursive INQUIRY (a question nests, concludes as a FINDING, its legs rest on content and other inquiries with earned grades per axis, its strength composed by DEC-32's arithmetic); the required falsifier; CHECK; a CASE as a production of a project (DEC-72); **CONTRADICTION in three cases — in the WORLD it is a FINDING the system exists to find, in the RECORD it is a defect in our own holding carrying a DUTY to identify, present and resolve, and imprecision is NEITHER (Q14, ruled 2026-09-17)**; the action plan | this is what the whole system is FOR — "case-making is undesigned, and it is what the whole system is for" (D-127, **Bob's framing of 2026-08-01**; since designed and built through the IS plan, which closed 43/43 — the quotation is history and this row's status cell is the authority) | content (4), meaning (6), bias (7), assistant (11), surfaces (12), publication (13) | `BIO_Content_Framework_v0_10.md` Part I §12; `BIO_Case_Making_v0_1.md` as the reasoning record **and the HOME of the contradiction construct (§CONTRADICTION)**; the rulings DEC-15…DEC-32, DEC-72 [`INVESTIGATIVE-SESSION.md`, `docs/archive/IS-BUILD-PLAN.md` — the plan closed at 43/43 and is closed history] | **BUILT:** the inquiry lifecycle: cite, dispose, conclude, reopen, divide, ground, versions; a RETIRED Information bundle is not citable (State Rules §4.1, BOB #30): op=cite refuses it RETIRED_NOT_CITABLE (C-33.39) in the store for every caller, a …; a concluded inquiry requires a conclusion and a falsifier, or the member's stated override (UI-64/REC-117); cases, their documents, ratification and revision flags; the action plan and its correspondence; an action's risk tier is 1, 2, 3 or UNDETERMINED, read in the plane's published words and never defaulted to 1 (D-182); the setup page OFFERS the tiers over the published vocabulary, unset by default, and unset still writes undetermined …; a FEE QUOTE IS EVIDENCE (D-148, Bob 2026-09-22; BIO_Case_Making_v0_1.md §2): a received correspondence entry may carry a quote — amount and currency as quoted, the stated basis verbatim, the sent entry it answers, and optionally the quote …; a records request names every law that governs it (D-149, BIO_Case_Making_v0_1.md §2), plane half: `op=actionlaws` sets an action's `governing_laws[]` — each law by citation at its level (federal, state, local; `law_levels` published) — as … · **PARTIAL:** D-195's shared-origin check over a PROPOSED partition, before it is written (INVESTIGATIVE-SESSION.md §12 clause (c)). …; a claim is carried on basis VERSIONS (the `claim` column, D-217b), and CONCLUDING ADOPTS IT PER PROJECT (INVESTIGATIVE-SESSION.md §7.1): each project keeps its own dated, authored, APPEND-ONLY history of conclusions and withdrawals … (also cites §7.1 item 4, §7.1 item 9); Q14's contradiction case (CONTRADICTION-IDENTIFY-DESIGN.md). … · **ABSENT:** goals and aspirations as objects (an objective is a zero-leg open inquiry); a standard of proof per production or audience (only the project's strength bar exists); op=publishpreflight (REC-15), deferred by DEC-33 until the substrate beneath it is solid — verified at the code: `node tools/status.mjs 8` **Designed in:** the CLAIM is designed, and has been since 2026-08-03 — a FIELD of an inquiry rather than an object, with concluding as the inquiry ADOPTING it (`BIO_Case_Making_v0_1.md`), and its standard of proof attaching to the PRODUCTION (Bob, 2026-09-14); Part II §18 item 6 POINTS here rather than restating it, and what remains owed is RESEARCH, not design — the catalogue of standards by audience and output act. CONTRADICTION's IDENTIFY (8.contradiction) — `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` (2026-09-19); PRESENT and RESOLVE are not yet designed. |
| 9 | **Retrieval — the store as a read-through cache** | three axes (document, content, meaning), each with its own frontier, states and repair (FETCH / EXTRACT / DERIVE); the four-level search (meaning, content, documents, the open internet) — a search that returns documents has not finished; the query compiler with one compilation point; FTS5 inside the Durable Object | the reason the store is never assumed complete; sparse is normal at every level and saying WHICH absence is true is a first-class obligation | content (4), meaning (6), assistant (11), surfaces (12) | [`STORE-AS-CACHE.md`, `RETRIEVAL-SUBSTRATE.md`] — Part II §14.2–14.3 carry the adopted tables | **BUILT:** document-grain search over FTS5 with the query compiler; relevance computed over the rows the VIEWER can see and published as an ORDER, never a score (D-447, IC-238); content-grain search: the `content:` arm and the `passage:` arm over indexed captured text; the meaning arms (resolves:, concerns:, leg:); the observation log with one append site, and the frontier over the document, content and meaning levels · **PARTIAL:** the frontier's internet-level READ is BUILT and driven (REC-129, IC-143): op=frontier&level=internet answers from a lead's looks, fenced by the lead's own visibility before grouping, and names what it does not read. … · **ABSENT:** a member surface for the frontier and the content axis — verified at the code: `node tools/status.mjs 9` |
| 10 | **Standing intent and monitoring** | named requests and ratified sweeps; the frontier of deferred links; monitoring contracts; change detection through the digests; what the instance does unattended | the record stays current without anyone calling an op | capture (2), scheduler (14) | `BIO_Intake_Doctrine_v1_1.md` §4; `BIO_Content_Framework_v0_10.md` Part I §6 [`SCHEDULER.md`, `NOTIFICATIONS.md`] | **BUILT:** monitoring on the alarm scheduler, with digest-based change detection; op=monitor asks `assess` through the capture's handler and content type, answers with the layer it stopped at and graded events, logs each look, and says which cadence governs (D-65); the frontier of deferred links; a member's LEAD (D-194; MEMBER-KNOWLEDGE-DESIGN.md §5), plane half (MK-4): the `leads` table and op=lead, leadlook, leadread and leadshare. … — verified at the code: `node tools/status.mjs 10` **Designed in:** the LEAD (10.lead) — `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (2026-09-18). |
| 11 | **The assistant and the AI roles** | the machine may FIND / PURSUE / EXTRACT / CHECK and request capture; it never touches the provenance chain, never attests, never concludes; its work is labelled and graded as machine work; the investigative session and its run log; the skill and doctrine pack; the credential cascade through `agent-worker` | one way in, on every surface; central to what BIO offers, and bounded by the same fences a member's act carries | content (4), inquiry (8), surfaces (12), fleet (15) | `BIO_Assistant_and_AI_Roles_v0_1.md` (v0.1 DRAFT, 2026-09-14) [`INVESTIGATIVE-SESSION.md`, `ASSISTANT-PILOT.md`, the SKILL kickoff] | **BUILT:** the investigative session: runs, bounds, ticks, close, spawn, suggest; a bound declared at op=airunopen states a positive allowance, an absent or zero one refused and nothing written (REC-177, C-22.16, INVESTIGATIVE-SESSION.md §14b item 6); the run a production names (INVESTIGATIVE-SESSION.md §11 item 5, BOB #25). …; the credential cascade's ORDER and its per-level judgement (member, then project, then instance): one pure expression in agent-worker (FL-6), resolving only what a caller hands it, and no caller hands it anything yet (11.cascade-sources); a woken run is RE-ENTERED — only a run the instance's ONE organisation-principal `ai` credential opened (D-260, BOB #22; AI Roles §6): FL-4's wake hands it to agent-worker's POST /run under that credential when the run's stamped …; a run counts a document once, its versions as versions (D-220); the CHECK runner is deployed in the fleet; an `ai` credential is refused at every attesting or ratifying op but op=attest, a third party's timestamp permitted by design, each traced by driving (REC-123; C-32.12/.13, C-35.10); and no operator bearer token carrying a member's …; the last codeless refusals are coded (D-278); the detail is this claim's note · **PARTIAL:** a SOURCE the cascade can reach, at any level. … · **ABSENT:** the EXTRACT role is NOT deployed in the fleet (its plane half is built — 5.ai-readings); the assistant pilot's flow: a prompt entry, INTERPRET, the classifier and the wizard; a member surface for AI-proposed readings — verified at the code: `node tools/status.mjs 11` |
| 12 | **Member surfaces and the interaction constructs** | QUEUE and ACT as the two constructs, the rung ladder of authored acts (release → stand behind → ground → conclude → accept → ratify), UNDETERMINED as a display primitive; the guiding voice (inform once, never nag — DEC-69; nothing prefilled; capability absent, never greyed); the iterative case journey; the public/verify surface | how a member reaches what the record holds (M8) and traverses the path (§1); UX is paramount | every row | `BIO_Interaction_Constructs_v0_1.md` [`UI-PLAN.md`, `UI-KICKOFF.md`; the Iterative Case Journey canvas] | **BUILT:** U1–U7: tokens, semantics, byte verification, release, snapshot resolution, the /build route; op=affordances: roster acts by position; nothing a machine is refused (D-311); the UNDETERMINED display primitive; a queue selection is handled as a SET under the `per-item` weight: each item applied or kept in the list with the record's own reason (D-126; NOTIFICATIONS.md §Applying a handler to a selection); a member's selection of candidate documents is resolved as ONE `op=resolve` carrying `items` under the `per-item` weight, beside the single-document act (D-291; BIO_Interaction_Constructs_v0_1.md §S, named by BOB #32's ruling of 2026-09-23 …; an agent-surfaced question is marked wherever a question is listed or shown (D-82; §P accountability rule); The accept ceremony (#accept/<INQ>/<name>) shows D-195's shared origin, then requires a per-set affirmation sent with op=versionaccept. · **ABSENT:** a member cannot publish or ratify from the UI — publishing runs through the operator; a member cannot start a CHECK run from the UI (it only reads runs) — verified at the code: `node tools/status.mjs 12` |
| 13 | **Publication, audiences and communications** | one-way publication (DEC-19), editions (DEC-12), the authored statement of what was left out, the eight audiences and their output acts, the publication fence on the provenance chain, evidence-package risk tiers, the platforms for cross-group discussion and the directory | the point where the record's trustworthiness becomes public and irreversible | inquiry (8), bias (7), membership (1) | `BIO_Publication_v0_1.md` (v0.1 DRAFT, 2026-09-14) [`BIO_Communications_Platforms.md` for the platform half; the audiences research in `docs/archive/research/AUDIENCES.md`] | **BUILT:** the fence and one-way publication, editions, and the signed case document; op=ratify publishes nothing outside a ratified case — a finding only at a sha a ratified case pins (C-58.2), anything else only as evidence a pinned finding rests …; the public read and verify surface, usable with no account; PUBLISHING WRITES NOTHING ON A MEMBER FINDING (BIO_Publication_v0_1.md §3 rule 12, BOB #28; D-442, IC proposed 2026-09-23): op=publish promotes no member — each is pinned at the sha it has as prepared, so one project's prepare never moves …; the completeness statement carries a computed `searched` section; the exclusion statement's acknowledgements (BIO_Publication_v0_1.md §3 rule 11, BOB #27; D-150, IC-227, 2026-09-23). … · **PARTIAL:** the review copy (DEC-31; BIO_Publication_v0_1.md §6A). …; the publishing group's public identity (BIO_Publication_v0_1.md §7, BOB #24). … · **ABSENT:** the member-facing publication ceremony (UI-17) — see 12.publish and 8.preflight; attribution levels for a member's observation (group, project, cover, name; off-the-record); the directory and cross-group discussion — verified at the code: `node tools/status.mjs 13` |
| 14 | **Scheduler and operations** | one reconciling Durable Object alarm; interruption recovered by re-deriving outstanding conditions from durable state; the host governor; the inbox; audit | the instance keeps its own record current unattended (M1) and recovers from any signal loss by state, never by signal | capture (2), monitoring (10) | [`SCHEDULER.md`, `INBOX-GRAMMAR.md`]; the doorbell (`op=knock`) is intake and its design is `BIO_Intake_Doctrine_v1_1.md` §2a — Tech Arch §10.7's interruption model is the rule that survived | **BUILT:** one reconciling Durable Object alarm driving the named consumers; the inbox (knock / resolve) and the audit pass. … — verified at the code: `node tools/status.mjs 14` |
| 15 | **Distribution: installer, releases, fleet, multi-instance** | `newgroup` installs a sovereign instance into a group's own account; DIST cuts signed releases from a green main and deploys with byte-verification and rollout gates; the fleet members (pdf-worker, ocr-worker, agent-worker) beside the plane; several instances per account isolated by structural partition | the distribution model IS the product — sovereign instances, not a hosted service | record (3), extraction (5), assistant (11) | `BIO_Distribution_v0_1.md` (v0.1 DRAFT, 2026-09-14) [`MULTI-INSTANCE-ISOLATION.md`, `kickoffs/DIST.md`, `VERIFICATION.md`; `BIO_Technical_Architecture_Decisions_v10.md` for the rules that survived the substrate change] | **BUILT:** the installer's source installs the signed fleet; the plane release is signed and carries the fleet; the COMMITTED installer bundle installs the signed fleet — rebuilt at the 0.66.0 cut (DIST #2, 2026-09-19); the old ABSENT claim described a 0.56.0-era artifact and its "deploying it is Bob's gate" clause is superseded by Bob's standing …; an update of a copy whose store predates IC-172 (it ran a release before 0.71.0) TELLS the operator the one act D-436 leaves them — recording which group produces the record, by the root of trust’s op=instancegroupseed for the record and …; the RUNTIME half of the fleet's version authority (D-116, IC-182, 2026-09-23): op=bootstrap reports the Durable Object's OWN build as storeVersion (never `version`, which stays the routing isolate's) and, on members=1, each fleet member's …; the plane the installer uploads is BOUND to the fleet members it uploads beside it — DIST-6, 2026-09-23 (found ABSENT by D-116's worker the same day): uploadInstall and uploadUpdate bind PDF_WORKER / OCR_WORKER / AGENT_WORKER as service …; install and update carry the instance's organisation `ai` credential as the Worker secret `INSTANCE_AI_TOKEN`, as they carry DAEMON_TOKEN — never in the record, denylisted on publication (D-260 scope (2), DIST's half; Distribution §6). …; the release's own canary SPEAKS ITS VERDICT (D-506, IC-265; BIO_Distribution_v0_1.md §6 rung 6, on BOB #32's ruling of 2026-09-24 06:07Z): `op=livefire` answers `ok` for THE OP HAVING ANSWERED — `ok:false` is reserved for a catalogued … · **PARTIAL:** the subrequest ceiling is stated and carried, not yet deployed · **ABSENT:** multi-instance isolation — account-global names are still fixed — verified at the code: `node tools/status.mjs 15` |

Every row names a level-1 home. Three of them — the assistant (11), publication (13) and distribution (15) — were homeless when this map was written and received their documents on 2026-09-14 (v0.1 DRAFTs, awaiting Bob's review); each restates its construct's rulings once and is the authority into which further rulings fold (`CORPUS-STANDARD.md` §4.2).

## 4. How the constructs relate

Read §3's rows downward and the dependency runs one way: **membership** attributes every
act; **capture** establishes what the bytes are and where they came from; **the record**
stores and checks; **content** is extracted from what the record holds and is the unit
every edge should point at; **meaning** is derived over content; **bias** states what the
member brings; **inquiry** rests on content and meaning and concludes; **retrieval** is the
one process that searches all four levels and grows every layer; **the assistant** does the
looking at every layer under the member's fences; **the surfaces** are where the member
authors each rung; **publication** is where the group stands behind the result; and
**distribution** and **operations** are what make an instance exist and keep it honest
unattended.

The two cross-cutting rules: **grade tracks directness and never composes across scales**
(capture grade is the document's; a content's derivation cap is its own; a connection's
grade is a third; DEC-21 shows both on one leg and CPDF-10 forbids a third scale); and
**every layer may be sparse, and absence at one level is not evidence of absence at the
next** (Part II §14.3).

The same relationships as a UML class diagram (the settled notation for structure; edges
read as "depends on / feeds", labelled with the act; validated against the mermaid parser
with `tools/mermaid-check.mjs` before landing):

```mermaid
classDiagram
  direction TB
  class Membership {
    +cover and handle
    +administrators, capabilities
    +project participation
  }
  class Capture {
    +provenance chain
    +capture grade
    +standing intent
  }
  class Record {
    +bundle, states, checks
    +invariants I-1..I-20
  }
  class Content {
    +extent
    +extraction method
    +derivation cap
  }
  class Extraction {
    +recognisers, digests
    +transcription chain
    +three tiers
  }
  class Meaning {
    +entities, resolutions
    +connections, grade
    +progressions
  }
  class DeclaredBias {
    +statements, bundles
    +bias debt, hunch debt
  }
  class Inquiry {
    +legs, earned grades
    +finding, falsifier
    +case as production
  }
  class Retrieval {
    +three axes
    +four-level search
  }
  class Assistant {
    +FIND PURSUE EXTRACT CHECK
    +never attests
  }
  class Surfaces {
    +QUEUE, ACT
    +rung ladder
  }
  class Publication {
    +one-way, editions
    +audiences, fence
  }
  class Distribution {
    +installer, releases
    +fleet, isolation
  }
  class Operations {
    +reconciling alarm
    +audit
  }
  Membership --> Record : attributes every act
  Capture --> Record : admits with provenance
  Record --> Content : holds documents content is extracted from
  Extraction --> Content : produces
  Content --> Meaning : derived over
  DeclaredBias --> Meaning : shares the subject registry
  Content --> Inquiry : legs rest on
  Meaning --> Inquiry : legs earn grade from
  DeclaredBias --> Inquiry : states what the member brings
  Retrieval --> Content : searches and grows
  Retrieval --> Meaning : searches and grows
  Retrieval --> Record : searches and grows
  Assistant --> Retrieval : looks through
  Assistant --> Capture : requests capture
  Surfaces --> Inquiry : member authors each rung
  Surfaces --> Capture : release is the first rung
  Inquiry --> Publication : case is stood behind
  Publication --> Membership : owner-gated
  Distribution --> Record : installs the instance that holds it
  Distribution --> Extraction : deploys the fleet
  Operations --> Capture : keeps the record current
```

## 5. The capability ladder as the completeness map

`docs/development/MILESTONES.md` is the authority for what is open. Its ladder is the
system's completeness statement at the capability altitude, and each rung maps onto §3:

| rung | capability | constructs |
| --- | --- | --- |
| M0 | the plan and its verification are trustworthy | process (`VERIFICATION.md`, `plancheck`, this corpus standard) |
| M1 | the instance keeps its own record current, unattended | 10, 14 |
| M2 | every document class Oakland publishes can become evidence | 2, 5 |
| M3 | the record knows what it holds | 5 |
| M4 | the record connects what it holds | 4, 6 — **D-164, this rung's primitive, CLOSED 2026-09-22** (BOB #26; built: `node tools/status.mjs 4`) |
| M5 | the record can be searched over its content, not only its notes | 4, 9 |
| M6 | the record can be left, mirrored and outlived | 3, 15 |
| M7 | a group can install and run it honestly | 15 |
| M8 | a member can reach what the record holds | 12 |
| M9 | a member can state what they found, and what it rests on | 8 |
| M10 | the group can stand behind what it found, and act on it | 8, 13 |

## 6. The runtime shape

What is deployed on the project's own instance at 0.71.0 (`release/RELEASE.json`;
`bio-plane/wrangler.jsonc`):

- **`bio-plane`** — the Worker (`src/index.mjs`, the control plane and the OPS table) and
  the Durable Object `Store` (`src/store.mjs`, `src/schema.mjs`) with SQLite; bindings
  `CAPTURES` and `PUBLISHED` (R2), `PDF_WORKER`, `OCR_WORKER`, `AGENT_WORKER`, `SELF`.
- **Fleet members** beside it, each one area's code and DIST's release object:
  `pdf-worker` (tier-2 text), `ocr-worker` (tier-3 OCR, tesseract-wasm, reads captured
  bytes from R2 itself), `agent-worker` (the assistant's credential cascade and plane
  callback).
- **`civicos-ui`** — the member surfaces, a Worker-served UI proxied to the plane.
- **`newgroup`** — the installer: OAuth into the group's account, plan probe, buckets,
  plane and members uploaded and byte-verified, the front page.
- **`docprofile/`** — the recogniser library the plane bundles (`tools/bundle-docprofile.mjs`).

A sovereign group's instance receives the fleet through the installer, which embeds the signed
release and installs the fleet (D-297) and which DIST deploys at every cut under Bob's standing
permission of 2026-09-18 (CORRECTED 2026-09-22 by BOB #25: this said the fleet waited on Bob's click). Several instances in one account
collide on bucket and fleet names today; the plan to partition them structurally is
`MULTI-INSTANCE-ISOLATION.md`, sequenced after the member surfaces. `BIO_Distribution_v0_1.md` is the
construct's home and describes the topology, the release, the fleet and the installer once.

## 7. The doctrine spine

The rulings that govern every construct, each stated once where it lives and cited from
here rather than restated:

- **Content is the unit; a document is not the answer** — DEC-23; `CLAUDE.md`; Part II §14.
- **The machine may EXTRACT; the member concludes** — DEC-24; Part II §14.5.
- **Machine-read text is never indistinguishable from publisher text; OCR never raises a
  capture grade; fidelity bounds the capture axis, no third scale** — DEC-4, CPDF-10.
- **Undetermined is first-class and stated; an outcome that costs nothing is not evidence;
  the publication fence sits on the provenance chain** — `CLAUDE.md`, Intake Doctrine.
- **Legs compose by AND/OR; weakest governs across AND, strongest across OR; sufficiency
  only by an attributed act** — DEC-32.
- **A case is a production of a project; publication is one-way; return is a new edition**
  — DEC-72, DEC-19, DEC-12.
- **The workflow respects the member's judgment: inform once at the act, never nag** — DEC-69.
- **No structural prior against any class of actor; bad actors are identified by evidence**
  — `CLAUDE.md`, "The stance".

## 8. What this document does not own

The mission and requirements (`BIO_Complete_Roadmap_v5.md`, `BIO_Design_Requirements_v2.md`);
every construct's detail (its level-1 home in §3); the process by which the system is
built (`docs/development/ORCHESTRATION.md`, `PARALLELISM.md`, `VERIFICATION.md`); the
ledgers; and every ruling, which stays in the ledger it was ruled in.
