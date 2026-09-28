/* publication's tables (requirements: `build/requirements/publication.md`; R3, R5, R7–R22, R24, R31). Moved from the
 * store's schema text and its boot migrations with their comments (K4), which state each column's meaning; where a
 * comment names `Store.publish` or `op=ratify` it names the act as it stands today (ratification's), not this module.
 *
 * The published projection (`published_bundles`, `published_shas`, `published_cases`, `published_case_members`,
 * `cases`) and `export_log` are append-only and exempt from purge (R24, R31): an edition answers forever. The derived
 * and working tables (`published_edges`, unsigned `case_documents` and their `case_exclusions`, `case_revision_flags`,
 * `observation_attributions`) are declared to record-core's purge as the store declared them (K23). */

export const PUBLICATION_SCHEMA = `
-- The published projection: the ONLY tables the public doorbell reads.
-- Nothing lands here except through ratification, so answering a public
-- query from these tables can never leak working material. published_shas
-- is append-only across re-ratifications: a hash once published stays
-- verifiable forever, which is what a document holder needs.
--
-- REC-14 / DEC-12: KEYED (bundle_id, edition) AND APPENDING. The table used
-- to be keyed on bundle_id and to UPSERT, so re-ratifying destroyed the prior
-- signature, attestor, time and gate version (D-144) while published_shas
-- accumulated -- the code split against itself, and neither branch of the
-- terminality question. Bob's ruling makes the append RIGHT and the upsert
-- merely not yet edition-aware: an edition is a SEPARATE DOCUMENT, edition 2
-- joins edition 1 rather than overwriting it, and a reader who relied on
-- edition 1's hash is not betrayed because edition 1 still answers, still
-- carries its own attestation and its own date, and still says what it said.
--
-- title is the ONE deliberate divergence from DATA-MODEL.md 2.4.4, so the
-- public index is not N+1. The frozen columns after it are what the group
-- SIGNED, kept beside the signature rather than only inside the bytes:
-- strength is the frozen axis OBJECTS, one per axis of Store.STRENGTH_AXES --
-- capture and connection always, and testimony only when it carries something
-- (MK-2 / IC-142, corrected from "BOTH" by D-423) -- never letters: unrated and
-- undetermined are different frozen facts, and C-21.2 compares per axis
-- against the right one. required is DEC-17's declared bar as it stood,
-- null meaning ABSENT and gating nothing.
--
-- REC-44 / DEC-44 / D-187: THIS ROW IS A **FINDING**, NOT A CASE, and the
-- correction is that it was only ever a case by assumption. A published case
-- is a CONTAINER OVER ONE OR MORE FINDINGS scoped to the project's own
-- question; the FINDING stays the unit of truth and the CASE becomes the unit
-- of publication. So THREE things left this table and went to
-- published_cases, and each one left for the same reason -- it is a fact
-- about the CASE and would otherwise be stated once per member finding, which
-- is D-21's second place to state one fact:
--   completeness  the assertion C-21.1 compares the next edition against.
--                 C-21.1 is now PER CASE PER EDITION; C-21.2's per-axis
--                 inheritance stays PER FINDING and reads strength below.
--                 The two live at different altitudes and collapsing them is
--                 exactly what DEC-44 forbids.
--   manifest      DEC-34's signed hash manifest, which now describes the
--   manifest_sha  WHOLE case -- every member finding's parts, every member's
--                 own signature -- because a stranger holding the container
--                 must be able to check every finding the case rests on
--                 without contacting this instance (DEC-44 determination 3).
-- edition here IS the CASE edition the finding was published in, not a
-- number of its own: editions are over the CONTAINER (DEC-12, unchanged by
-- DEC-44 and given its natural home by it).
--
-- parts is WHAT THIS SIGNED EDITION OF THIS FINDING CONSISTS OF -- the path,
-- sha256, kind and byte length of every file, as hashed at ratification. It is
-- a column rather than a query over published_shas because published_shas is
-- append-only ACROSS editions on purpose (a hash once published answers
-- forever), so it cannot say which parts belong to WHICH edition, and the case
-- container needs exactly that: assembling edition N of a case means gathering
-- edition N's parts from every member, including members ratified minutes
-- earlier. Nothing else holds it.
--
-- REC-128 (BOB #14, the honesty half of D-421): attestor_member is who SIGNED,
-- taken from the signature. delivered_by is who DELIVERED it, taken from the
-- authenticated session that performed the act -- member:<id>, or founder for
-- the instance founder's password session. They are two facts and neither is
-- ever copied from the other. NULL is a row written before the column existed
-- and reads back as UNDETERMINED, stated, and is never back-filled from the signer.
-- case_documents carries the same column for op=caseratify, for the same reason.
CREATE TABLE IF NOT EXISTS published_bundles (
  bundle_id       TEXT NOT NULL,
  edition         INTEGER NOT NULL,
  title           TEXT,
  bundle_sha      TEXT NOT NULL,
  ratified_at     TEXT NOT NULL,
  attestor_key    TEXT NOT NULL,
  attestor_member TEXT,
  delivered_by    TEXT,            -- REC-128 WHO DELIVERED, from the session. NULL means not recorded, never the signer
  gate_version    TEXT NOT NULL,
  sig_armored     TEXT NOT NULL,
  strength        TEXT,
  required        TEXT,
  parts           TEXT,
  PRIMARY KEY (bundle_id, edition)
);
CREATE TABLE IF NOT EXISTS published_shas (
  sha256    TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  path      TEXT NOT NULL,
  kind      TEXT NOT NULL,
  bytes     INTEGER,
  published TEXT NOT NULL,
  PRIMARY KEY (sha256, bundle_id, path)
);
CREATE INDEX IF NOT EXISTS published_shas_sha ON published_shas(sha256);

-- REC-22 / R4: the PUBLISHED GRAPH. One row per edge OUT of a published
-- bundle, written by the publishing act (Store.publish, the committer op=ratify
-- calls) from the RATIFIED BYTES' own references[] and division disclosure --
-- never from a caller and never from the working refs table, which changes
-- under the published record every time somebody promotes.
--
-- TWO DISCLOSURE CLASSES, and the distinction is the whole table:
--
--   serve  the target is ITSELF published, so the public surface may hand over
--          its edition, its title and its bundle_sha, and a reader can fetch
--          those bytes by hash. Restricted to published targets, which is what
--          stops the published graph naming working material.
--   name   the id may be NAMED and nothing more. R4's disclosure obligation --
--          "a published child names its parent and its siblings" -- lands here,
--          and it had to: a divided parent is TERMINAL and can never be
--          published, and a sibling may not be, so BUILD-ORDER's original
--          "restricted to targets that are themselves published" made R4's
--          disclosure impossible on the exact surface R4 was written for
--          (RECONCILED R4-e/R4-g). A name row carries an id and nothing else --
--          no title, no state, no sha, nothing fetchable.
--
-- The published column is the instant the edge was published, exactly as in
-- published_shas. The PK is (from_bundle, to_bundle, kind) as specified, so a
-- second edition re-asserting the same edge is idempotent rather than doubled;
-- the class of an existing row is refreshed on re-publication, because whether
-- a target is published is a fact about the record and not about the edition.
--
-- DERIVED, and therefore in BOTH arms of op=purge (D-113) unlike its published
-- siblings: every row here is recomputable from bytes that answer forever
-- (published_shas keeps the case's own bundle.md, which carries references[]
-- and the division disclosure inside the hash the group signed), so a purge
-- that cleared it destroys an index and never a fact. published_bundles and
-- published_shas are exempt precisely because nothing else holds what they hold.
CREATE TABLE IF NOT EXISTS published_edges (
  from_bundle TEXT NOT NULL,
  to_bundle   TEXT NOT NULL,
  kind        TEXT NOT NULL,
  disclosure  TEXT NOT NULL,
  published   TEXT NOT NULL,
  PRIMARY KEY (from_bundle, to_bundle, kind)
);
CREATE INDEX IF NOT EXISTS published_edges_to ON published_edges(to_bundle);
-- REC-44 / DEC-44 / D-187: THE PUBLISHED CASE, which is the object this record
-- always meant and never had. A case is a CONTAINER OVER ONE OR MORE FINDINGS,
-- scoped to the project's own question. Before this table a case WAS an
-- inquiry, and nobody chose that: it was assumed by every item in the chain,
-- and DEC-32 closed the only escape (a parent inquiry citing children would
-- collapse several propositions into one conclusion with one falsifier, the
-- overclaim DEC-32 exists to prevent).
--
-- THE IDENTITY IS DISTINCT FROM A BUNDLE ID, ALWAYS, including for the
-- one-finding case DEC-44 determination 5 keeps legal. Reusing the member's
-- bundle id when there happens to be one member is exactly the conflation
-- D-187 records: it would make ?id= ambiguous at the public read path and it
-- would make the shape depend on the arity, so the degenerate case would stop
-- being degenerate the moment a second finding joined. The id is minted by
-- op=publish (CASE-<year>-<seq>, through allocId like every other minted
-- identifier) and then CARRIED IN THE SIGNED BYTES of every member finding, so
-- a case identity can never be claimed at the commit that was not inside the
-- hash the member signed -- the rule DEC-12 already imposes on the edition.
--
-- WHAT IS AUTHORED HERE, and both are authored per CASE per EDITION:
--   scope         DEC-44 determination 2 -- Bob's "sufficient scope to address
--                 all issues that brought the various inquiries together".
--                 NEVER derived from the findings' titles. It sits BESIDE the
--                 completeness assertion and does not replace it: completeness
--                 says what was left OUT, scope says what the case is ABOUT,
--                 and a reader needs both because they are not the same claim.
--   completeness  REC-14's assertion, moved up one altitude. C-21.1's
--                 byte-check compares THIS against the previous edition of
--                 THIS CASE. The scope statement is deliberately NOT under
--                 that byte-check, and the reasoning is at C-21.1's site.
--   bias_acknowledgement
--                 REC-47 / DEC-46 (a). The publisher's AUTHORED acknowledgement
--                 of the bias this edition's case was produced under -- fresh
--                 per edition, never prefilled, and UNDER C-21.1's byte-check
--                 alongside completeness rather than exempt alongside scope.
--                 The discriminator between the two rules is recorded once, at
--                 C-21.1's site, because these three fields now sit side by
--                 side under two different rules and the next reader will ask.
--                 DEC-20 is why this is a DISCLOSURE and not a gate: ordinary
--                 declared bias never blocks publication and travels with every
--                 published case. Only an uncleared HUNCH disqualifies, and
--                 that refusal is publishpreflight's (UNCLEARED_HUNCH), not
--                 this column's. This field states the lens; it never judges it.
--                 The bias MANIFEST -- computed and stamped, DEC-46's other
--                 half -- is NOT here and is not built: the bias object type
--                 is still absent from the check catalogue (D-84), so no
--                 bundle exists to compute one from. The two are different
--                 things travelling together, and only the AUTHORED half of
--                 the pair can be built today.
--
-- ratified_at is NULL until the edition is COMPLETE -- until every member
-- finding has been ratified. That is a real state and it is stated rather than
-- hidden: each finding carries its own signature over its own bytes (the
-- finding is the unit of truth), so a case edition exists from the first
-- ratification and can only be SERVED as a container once the last one lands.
-- CASE-5 / DEC-72 clause 2 ADDS bar -- THE STANDARD OF EVIDENCE, STORED WHERE
-- IT IS A PROPERTY OF. Bob: "the bar -- that is, the standard of evidence -- is
-- a property of a project, not an inquiry or claim", told to the publishing act
-- at act time. CASE-2 computed it correctly and then had nowhere case-side to
-- put it, so the only place it was reachable was published_bundles.required --
-- once PER MEMBER.
--
-- THAT IS NOT A TIDINESS COMPLAINT AND THE DEFECT IT LEAVES IS REACHABLE. The
-- bar is read from the publishing project AT ACT TIME and members ratify at
-- DIFFERENT times, so a project whose bar moved between the first member's
-- ratification and the last one gave a single case edition TWO standards of
-- evidence, each stamped into different members' signed bytes, with nothing in
-- the plane noticing. Stored here it is ONE fact about the case, committed from
-- the signed bytes like the scope beside it and under the SAME divergence
-- refusal (CASE_ASSERTION_DIVERGED) -- so two members who signed different bars
-- are refused rather than reconciled.
--
-- JSON, matching the shape op=publish already stamps into every member's
-- required_strength block: declared, source, project, capture, connection,
-- detail. Not six columns, because it is ONE authored answer read at ONE
-- instant, and splitting it would let five sixths of a bar be written.
--
-- NULLABLE, and NULL is the honest answer for every edition published before
-- this column existed. A backfill from any member's required would look
-- defensible and would be an invention: it would assert that the case was held
-- to that standard when what the record actually holds is one member's stamp,
-- and where the two members disagree the backfill would have to choose which
-- disagreement to publish as the group's.
CREATE TABLE IF NOT EXISTS published_cases (
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  scope        TEXT,
  completeness TEXT,
  bias_acknowledgement TEXT,
  bar          TEXT,               -- the CASE's standard of evidence, as JSON. NULL = none recorded, and STATED
  opened       TEXT NOT NULL,
  ratified_at  TEXT,
  manifest_sha TEXT,
  manifest     TEXT,
  PRIMARY KEY (case_id, edition)
);
-- The case -> findings MEMBERSHIP, as DECLARED in every member's own ratified
-- bytes. published_bundles holds the RATIFIED SUBSET; this holds the whole set,
-- and the difference between them is what "this edition is not complete yet"
-- means. That difference is also why this is a TABLE rather than a derived
-- query over published_bundles, and it earns itself on the D4/REC-42 test
-- twice over: it needs an ORDINAL (the order the member published the findings
-- in is the order the container's parts[] and every rendering take, and it is
-- authored rather than alphabetical), and it answers a query keyed on it in
-- BOTH directions -- "which findings are in this case edition" (assembling the
-- container) and "which case does this finding belong to" (the public read
-- path resolving a finding id, which is why bundle_id is indexed).
-- CASE-1 / DEC-72 ADDS THE TWO FACTS A MEMBERSHIP ROW WAS MISSING: WHICH VERSION
-- OF THE FINDING IS IN THE CASE, AND WHAT THE PUBLISHER SAID IT WAS DOING THERE.
-- The design's member is (finding id, version hash, role, ordinal); before this
-- item the first and the last were here and the middle two were not.
--
-- version_sha -- CLAUSE 3, publication pins versions LIKE A COMMIT. Bob: "Once
--   published, the act of changing the findings (or any claims of any of the
--   findings) results in the changed version becoming a new version." The pin is
--   the finding's own bundle_sha, which is the hash the member SIGNED, so the
--   member row names a version by the same identity the signature covers.
--   NO SECOND COLUMN FOR THE MEMBER'S OWN EDITION NUMBER, deliberately: a
--   version is identified by its hash, and published_bundles is keyed
--   (bundle_id, edition), so resolving a pin is a PK-prefix seek on that
--   finding's own handful of editions rather than a scan. A stored edition
--   number beside the hash would be a second way to say the same thing, and the
--   two would eventually disagree. It also names the conflation the artifact
--   flip removes: before CASE-5 #caseEditionState read published_bundles at the
--   CASE'S edition number, which is only correct while one case owns one finding.
--   CASE-5 LANDED THAT FLIP 2026-09-10 -- resolution is now BY THIS COLUMN, and
--   the old predicate survives ONLY as the fallback for a row written before
--   CASE-3, whose pin is honestly NULL. edition on this table is the CASE'S
--   and a member's own edition is published_bundles', and after the flip the two
--   genuinely differ: a finding joining a case at that case's edition 2 having
--   published once before is at ITS OWN edition 1 inside the case's edition 2.
--
-- role -- CLAUSE 4, and it is AUTHORED BY THE PUBLISHER, never derived. Bob:
--   "All load-bearing findings of a case being published must meet the necessary
--   bar. Other findings/claims that don't meet the bar can be a part of the
--   published work, though they aren't presented as load-bearing." Two values and
--   nothing else: 'load_bearing' and 'supporting'. Spelled snake_case to match
--   every other closed vocabulary in this schema ('cuts_against' is the exact
--   precedent -- a hyphenated English term stored with an underscore), and the
--   spelling is fixed HERE so CASE-2 and CASE-6 do not each invent a third.
--
-- BOTH ARE NULLABLE AND THERE IS NO DEFAULT ON EITHER, WHICH IS THE WHOLE
-- DISCIPLINE OF THIS PAIR. Rows written before DEC-72 pinned no version and
-- carry no authored designation, and NULL states exactly that -- the same answer
-- inquiry_basis_versions.affirmed_parts gives, and for the same reason: a
-- DEFAULT of 'supporting' would mean a member could be designated by OMISSION,
-- and a default of 'load_bearing' would have the record assert that evidence
-- meets a bar nobody claimed it met. A designation that can happen without an
-- act is not authored. CASE-2 makes both REQUIRED AT THE DOOR, where a refusal
-- can name what is missing, rather than here where a constraint would only
-- break the shipped ratify path.
CREATE TABLE IF NOT EXISTS published_case_members (
  case_id     TEXT NOT NULL,
  edition     INTEGER NOT NULL,   -- the CASE's edition, never the member's
  ord         INTEGER NOT NULL,
  bundle_id   TEXT NOT NULL,
  version_sha TEXT,               -- the member finding's pinned bundle_sha. NULL = not pinned, and STATED
  role        TEXT,               -- 'load_bearing' | 'supporting'. NULL = nobody authored one, and STATED
  PRIMARY KEY (case_id, edition, bundle_id)
);
CREATE INDEX IF NOT EXISTS published_case_members_bundle ON published_case_members(bundle_id);
-- CASE-1 / DEC-72: THE CASE IDENTITY, AND WHOSE PRODUCTION THE CASE IS.
--
-- Bob, 2026-08-10, ruling the model this table exists to make structural: a case
-- is A PRODUCTION OF A PROJECT -- its own object, a set of finding-versions plus
-- the publishing project, published by a project OWNER against THAT PROJECT'S bar
-- at act time. The design is CASE-AS-PRODUCTION.md and it is the authority.
--
-- WHY THIS IS A THIRD TABLE RATHER THAN A COLUMN ON published_cases, and it is
-- the one structural decision in this item. published_cases is keyed
-- (case_id, edition). A project_id on THAT row would be a project per EDITION,
-- which permits edition 1 to be project A's production and edition 2 to be
-- project B's -- and under DEC-72 that is not a case with two editions, it is
-- two different productions wearing one identity. The bar is read from the
-- publishing project at act time, so a case whose owner can change between
-- editions is a case whose STANDARD OF EVIDENCE can change without anyone
-- authoring the change. One row per case_id makes that unrepresentable rather
-- than merely discouraged.
--
-- project_id IS NOT NULL, AND THE ABSENCE OF A ROW IS THE HONEST STATEMENT FOR
-- EVERY CASE PUBLISHED BEFORE THIS MODEL. DEC-72 removes the project-less
-- publication path outright, so a row here that named no project would be
-- exactly the shape the ruling deletes. Cases already in published_cases were
-- published under the pre-DEC-72 model and genuinely have no owning project;
-- they get NO ROW HERE, and a reader asking whose production such a case was is
-- answered "undetermined" by the missing row rather than by a NULL that would
-- read as a project the record lost. Backfilling a project would be inventing an
-- attribution to get past a gate, which this record refuses everywhere else.
-- The constraint is affordable here precisely BECAUSE the table is new: the two
-- columns this item adds to published_case_members are nullable for the mirror
-- reason -- their rows already exist and honestly lack the fact.
--
-- WHO WRITES IT: CASE-2, which is where publishCase() first takes a publishing
-- project and an owner-only fence. CASE-1 builds the object and writes no row,
-- so op=export answers project_id NULL for every case in the store today and
-- says so. That is a stated state of the record, not a gap in the answer.
--
-- THERE IS DELIBERATELY NO opened_by. The act's author belongs to the ACT, and
-- the act that mints this identity is the publication of an edition, which
-- published_cases already carries. A second author column here would be a second
-- authority for one fact, which is how the drift this repo keeps finding starts.
--
-- AND THERE IS DELIBERATELY NO INDEX ON project_id YET. "Which cases does this
-- project own" is clause 6's query and it is CASE-2's and CASE-6's to ask -- an
-- index declared before any statement filters on it is REC-69's own class, an
-- access path built for a question no op asks. It belongs in the commit that
-- brings its reader.
CREATE TABLE IF NOT EXISTS cases (
  case_id    TEXT PRIMARY KEY,  -- one identity, invariant across every edition
  project_id TEXT NOT NULL,     -- the OWNING project. Its bar is the case's bar, read at act time
  opened     TEXT NOT NULL      -- the instant this identity came into being
);
-- CASE-5b / DEC-72: THE CASE DOCUMENT -- THE THING A MEMBER SIGNS WHEN WHAT IS
-- BEING ASSERTED IS THE CASE'S OWN, AND NOT ANY ONE FINDING'S.
--
-- WHY IT EXISTS, and the reason is a wall CASE-5 measured rather than a feature
-- anyone wanted. Every case fact this plane commits is committed FROM THE SIGNED
-- BYTES AND FROM NOTHING ELSE (#publishEdges' doctrine). Until this table the
-- only signed bytes in the system were a FINDING's, so op=publish stamped the
-- case's scope, roster, partition, bias acknowledgement and bar into EVERY
-- member's frontmatter -- N copies of one fact, each inside a different
-- signature, held together by four divergence refusals. A finding's bytes could
-- not stop naming a case, because there was no signature over a case for those
-- facts to move to.
--
-- THE CONSTRAINT THAT SHAPED IT is the container manifest's own sentence: a
-- case-level signature would be a signature over SOMETHING NOBODY REVIEWED. So
-- what is stored here is not a synthesised summary of the roster. It is the
-- publisher's own authored assertions, written once, in the words they authored
-- them in at the ceremony -- the scope, the completeness statement, the
-- exclusions and their reasons, the subject position and its justification, the
-- bias acknowledgement, the load-bearing partition, the bar -- assembled into a
-- document a member reads whole and signs. Every sentence in it was typed by a
-- person at op=publish. The roster appears because a partition needs targets,
-- and it appears WITH THE PINS, which is clause 3's freeze stated where the
-- freeze is actually asserted.
--
-- doc_sha IS THE IDENTITY THE SIGNATURE COVERS, and text is kept beside it so
-- the document can be re-read and re-verified without this instance being
-- trusted to re-render it. Rendering it twice is exactly the equality that costs
-- nothing to produce, so the bytes are stored rather than recomputed.
--
-- sig_armored / attestor_key / attestor_member / gate_version / ratified_at ARE
-- ALL NULL UNTIL op=caseratify LANDS, and that window is a real state which is
-- STATED rather than hidden: between op=publish and the case ratification the
-- case is AUTHORED AND UNSIGNED, and nothing case-side is committed while they
-- are NULL. That is the whole fence -- the store refuses CASE_UNSIGNED rather
-- than writing a case row from a request, which is the attribution class this
-- record refuses everywhere else.
--
-- ONE ROW PER (case_id, edition). An edition is a separate document and answers
-- forever, exactly as published_cases' own key says.
CREATE TABLE IF NOT EXISTS case_documents (
  case_id         TEXT NOT NULL,
  edition         INTEGER NOT NULL,
  doc_sha         TEXT NOT NULL,   -- sha256 of text. The identity the signature covers
  text            TEXT NOT NULL,   -- the authored document itself, stored not recomputed
  authored_at     TEXT NOT NULL,
  authored_by     TEXT,            -- the member who drove op=publish
  sig_armored     TEXT,            -- NULL until op=caseratify. NULL means AUTHORED AND UNSIGNED
  attestor_key    TEXT,
  attestor_member TEXT,
  delivered_by    TEXT,            -- REC-128 WHO DELIVERED, from the session. NULL means not recorded, never the signer
  gate_version    TEXT,
  ratified_at     TEXT,
  -- REC-217 / BIO_Publication_v0_1.md section 3 rule 13 (BOB #33, 2026-09-24 19:14Z): THE DRAFT THE PUBLISHER
  -- NAMED as this case edition's draft at op=publish (draft=), or NULL where none was named. The link is an ACT:
  -- its author is authored_by and its time authored_at, the publisher and the moment of the same op=publish, and
  -- the document's own bytes state it in words. Readings taken through this draft bind to this case edition.
  -- NULL on a row written before this column is MEASURED, not back-filled: no act could name a draft until now.
  draft_id        TEXT,
  PRIMARY KEY (case_id, edition)
);
-- D-442 / BIO_Publication_v0_1.md section 3 rule 12: WHICH CASES EXCLUDED THIS DOCUMENT, projected
-- from the CASE DOCUMENT. inquiry_exclusions answered it from a FINDING's own completeness_excluded,
-- which op=publish's promotion wrote there -- and rule 12 stops that promotion, so a case published
-- under it states its exclusions once, in its document, and nowhere in any member. Without this
-- projection op=excludedby would silently stop naming every case published after rule 12, which is
-- a reader left on the old bytes. DERIVED from case_documents.text, re-projected whole for a
-- (case_id, edition) whenever op=publish authors or re-authors that document, and never touched
-- after it is signed (the document can no longer change). Kept for EVERY edition: a case that
-- excluded a document at edition 1 has still excluded it there, whatever edition 2 says.
-- description and reason are NOT NULL for inquiry_exclusions' own reason. The whole-store purge
-- clears the rows of every UNRATIFIED document with the document itself (D-113), and keeps a
-- ratified document's for case_documents' own reason.
-- ONE ROW PER (case edition, MEMBER, exclusion row): an excluded document is reported on each member
-- finding of the case, as inquiry_exclusions always reported it, and the member, its own edition
-- and the publishing project are columns so op=excludedby answers in ONE indexed, gated statement
-- with no read per row (derivation-bounds' class).
CREATE TABLE IF NOT EXISTS case_exclusions (
  case_id        TEXT NOT NULL,
  edition        INTEGER NOT NULL,
  bundle_id      TEXT NOT NULL,
  ord            INTEGER NOT NULL,
  member_edition INTEGER,
  project_id     TEXT,
  target_id      TEXT,
  description    TEXT NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (case_id, edition, bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS case_exclusions_target ON case_exclusions(target_id);

-- CASE-4 / DEC-72: THE REVISION FLAG. A CASE EDITION FROZE A MEMBER AT A HASH,
-- AND THAT MEMBER HAS SINCE MINTED A NEW VERSION.
--
-- The design (CASE-AS-PRODUCTION.md, "Revised findings vs the cases containing
-- them"): a case is a frozen, signed edition, honest as of its date. When a
-- member finding is later revised, the containing cases are FLAGGED, never
-- silently updated and never automatically re-published -- the cascade doctrine
-- one level up. New editions are each owning project's deliberate act.
--
-- WHY A TABLE AND NOT A DERIVED READ, WHICH IS THE ONE STRUCTURAL DECISION HERE.
-- The condition itself IS derivable: CASE-5 unslaved the member's edition from
-- the case's and made a member resolve BY ITS PIN, so "this case's pin is no
-- longer this finding's current version" is one comparison over columns that
-- already exist. A derived answer was written first and is wrong for exactly one
-- reason: IT CLEARS ITSELF. Revert the finding to the pinned bytes, or let the
-- pin and the head agree again by any route, and the derived flag vanishes with
-- nobody having acted -- which is D-79's ruling one altitude up. A finding that
-- disappears is indistinguishable from one that was never made, and a flag that
-- stops being raised is indistinguishable from a project that dealt with it. So
-- the OBSERVATION is derived (from the pin, and from no second mechanism) and
-- the FLAG is written down, once, at the moment the revision mints.
--
-- SET-BUT-NEVER-CLEAR IS LITERAL. No statement anywhere DELETES a row here. An
-- owning project that acts ADDS the discharge to the row it discharges
-- (acted_at / acted_by / acted_edition), so the record holds both the flag and
-- what was done about it, in the order it happened. A row with acted_at NULL is
-- outstanding; a row with acted_at set is history, and history is not absence.
--
-- THE ACT THAT DISCHARGES IS A NEW RATIFIED EDITION OF THAT CASE, and it is
-- deliberately an act that ALREADY EXISTS rather than a new acknowledgement op.
-- The design names it: "New editions are each owning project's deliberate act."
-- It is also the only discharge available without walking into CASE-5b's wall --
-- every case fact this plane commits is committed FROM THE SIGNED BYTES, and a
-- bare acknowledgement op would commit a case-level assertion from an unsigned
-- request. A ratified edition is signed, so the discharge rests on a signature
-- exactly as the flag's pin does.
--
-- SCOPED TO case_id, WHICH IS D-266's RULING ARRIVING HERE: a disposition is
-- scoped to the key's own subject. A case is ONE project's production (cases is
-- keyed on case_id alone, CASE-1's sharpest call), so a project acting on ITS
-- case discharges rows carrying that case_id and reaches no other project's.
-- Where several cases containing revised members are owned by several projects,
-- one project acting leaves every other project's rows outstanding -- and that
-- is structural here rather than a rule somebody has to remember, because the
-- discharge statement's WHERE clause names case_id and nothing wider.
--
-- pinned_sha is the hash the case COMMITTED TO (published_case_members.version_sha
-- as it stood) and revised_sha is the version that superseded it as the finding's
-- head. Both are stored rather than re-read: the roster row can be re-pinned by a
-- later edition, and a flag that re-read the pin would silently re-describe what
-- it was raised about.
--
-- Keyed (case_id, edition, bundle_id, revised_sha) so a member that revises
-- three times against one frozen edition raises three rows and not one -- each
-- revision is its own fact, and collapsing them would let the second and third
-- vanish into the first.
--
-- DERIVED FROM NOTHING, so it is not rebuilt by a projection pass; it is a
-- record of events. It carries a bundle_id, so it is cleared by BOTH arms of
-- op=purge -- the D-113 silent-leftover, asserted against this file by
-- hygiene.test.mjs.
CREATE TABLE IF NOT EXISTS case_revision_flags (
  case_id       TEXT NOT NULL,
  edition       INTEGER NOT NULL,  -- the CASE edition whose roster froze the pin
  bundle_id     TEXT NOT NULL,     -- the member finding that revised
  pinned_sha    TEXT NOT NULL,     -- what the case committed to
  revised_sha   TEXT NOT NULL,     -- the version that superseded it
  project_id    TEXT,              -- the OWNING project that must act. NULL for a pre-DEC-72 case, and STATED
  since         TEXT NOT NULL,
  acted_at      TEXT,              -- NULL while the flag stands. NEVER set back to NULL, and the row is never deleted
  acted_by      TEXT,              -- the member whose act discharged it
  acted_edition INTEGER,           -- the CASE edition that act published
  PRIMARY KEY (case_id, edition, bundle_id, revised_sha)
);
-- Outstanding-by-member is the question op=caseflags asks with a bundle_id, and
-- it is the only filter whose leading column is not the primary key's. The index
-- arrives WITH that statement, which is the rule the finding_dispositions comment
-- above had to learn by failing the build.
CREATE INDEX IF NOT EXISTS case_revision_flags_bundle ON case_revision_flags(bundle_id);

-- MK-7 / MEMBER-KNOWLEDGE-DESIGN.md section 4.2-4.6: THE ATTRIBUTION ACT. One row per
-- (case edition, observation): the level the observation's AUTHOR chose for what that edition's
-- published case document shows of them. Written only by op=attribute, taken by the author and by
-- nobody else, never prefilled (no row is "unchosen", and a case document cannot be ratified
-- while any observation it reaches is unchosen). A later edition INHERITS the latest earlier
-- edition's row until the author acts again (section 4.3). chosen_by is the server-stamped author.
-- There is deliberately NO column that could hold an off-the-record source's identity: that
-- anonymity is a structural absence (section 4), and hygiene would see a column added here.
-- bundle_id is the OBSERVATION, so the rows ride the purge TABLES list in both arms (D-113): an
-- attribution outliving its observation would attach to whatever bundle was next allocated its id.
CREATE TABLE IF NOT EXISTS observation_attributions (
  case_id    TEXT NOT NULL,
  edition    INTEGER NOT NULL,
  bundle_id  TEXT NOT NULL,     -- the observation (an authored INFO bundle)
  level      TEXT NOT NULL CHECK (level IN ('group','project','cover','name')),
  chosen_by  TEXT NOT NULL,     -- the observation's author, stamped from the signed-in session
  chosen_at  TEXT NOT NULL,
  PRIMARY KEY (case_id, edition, bundle_id)
);
CREATE INDEX IF NOT EXISTS observation_attributions_bundle ON observation_attributions(bundle_id);

-- Section 8.1: an export is recorded so it can never happen SILENTLY.
-- Append-only, like everything else here. In-app administrators cannot RUN
-- an export and must be able to SEE that one happened, because an export a
-- captured root of trust could take unnoticed would defeat the recording.
CREATE TABLE IF NOT EXISTS export_log (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  at      TEXT NOT NULL,
  scope   TEXT NOT NULL,
  bundles INTEGER NOT NULL,
  files   INTEGER NOT NULL,
  note    TEXT
);
`;

/** R31 (K23): what purge clears, as the store declared it — `published_edges` keyed by either end, the unsigned case
 *  documents and their exclusions by the whole-store form only, the flags and the attributions by their bundle. */
export const PUBLICATION_TABLES = Object.freeze([
  "case_revision_flags", "observation_attributions",
  { name: "published_edges", keys: ["from_bundle", "to_bundle"] },
  { name: "case_documents", keys: [], whole: "ratified_at IS NULL" },
  { name: "case_exclusions", keys: [], whole: "NOT EXISTS (SELECT 1 FROM case_documents d WHERE d.case_id = case_exclusions.case_id AND d.edition = case_exclusions.edition)" },
]);
/** R24, R31: the published bytes, never cleared by any purge. */
export const PUBLICATION_EXEMPT = Object.freeze([
  "published_bundles", "published_shas", "published_cases", "published_case_members", "cases", "export_log",
]);

/* Columns added after a store was first written, added by hand because CREATE TABLE IF NOT EXISTS does nothing to a
   table that already exists. Additive and nullable, never back-filled: each NULL is a state of the record. */
const ADDITIVE_COLUMNS = [
  /* CASE-1 / DEC-72: the member finding's PINNED VERSION and the publisher's AUTHORED ROLE for it. A member rostered
     before this column existed was rostered under the pre-DEC-72 model, where a case edition pinned nothing, so NULL
     says no version was chosen; a backfill of the finding's current bundle_sha would claim the case froze a version at
     a hash nobody signed for that purpose. A member rostered before `role` existed was never designated load-bearing
     or supporting by anybody, and neither designation may come out of a migration (DEC-72 clause 4). */
  ["published_case_members", "version_sha", "TEXT"],
  ["published_case_members", "role", "TEXT"],
  /* CASE-5 / DEC-72 clause 2: the CASE's own standard of evidence. An edition published before this column recorded
     its bar only inside each member's signed `required_strength` block; a backfill from one member would publish one
     member's stamp as the group's answer. */
  ["published_cases", "bar", "TEXT"],
  /* REC-128 / IC-140: WHO DELIVERED a ratification. NULLABLE AND NEVER BACK-FILLED: the one value a backfill could
     reach for is the SIGNER, the liar D-421 exists to separate. NULL reads back as UNDETERMINED (R14, R28). */
  ["published_bundles", "delivered_by", "TEXT"],
  ["case_documents", "delivered_by", "TEXT"],
  /* REC-217 (BIO_Publication_v0_1.md §3 rule 13): THE DRAFT A PUBLISHER NAMED as a case edition's draft. NULL is the
     measured truth for every older row: no act could name a draft before this column existed. */
  ["case_documents", "draft_id", "TEXT"],
];

/* D-734 (BOB #36, D-731 (b)): the path a ratified case document's hash is registered under in `published_shas`. */
export const caseDocumentPath = (edition) => `case-document-edition-${Number(edition)}.md`;

/** Creates the tables and runs their migrations; idempotent, every boot. */
export function migratePublication(sql) {
  const rows = (q, ...a) => [...sql.exec(q, ...a)];
  const addColumns = () => {
    for (const [table, column, decl] of ADDITIVE_COLUMNS) {
      const have = rows(`PRAGMA table_info(${table})`).map((r) => r.name);
      /* An absent table reads as no columns: it is skipped here and the schema creates it. */
      if (have.length && !have.includes(column)) sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
  };
  /* REC-14 / DEC-12: published_bundles is RE-KEYED (bundle_id, edition). It may NEVER be dropped — it is the published
     projection, and a hash once published stays answerable forever — so the old table is renamed out of the way here,
     the schema below creates the new shape, and the copy-forward runs immediately after it. Every existing row becomes
     EDITION 1, which is what it always was. The interim name never survives this function. */
  {
    const cols = rows(`PRAGMA table_info(published_bundles)`).map((r) => r.name);
    if (cols.length && !cols.includes("edition"))
      sql.exec(`ALTER TABLE published_bundles RENAME TO published_bundles_preeditions`);
  }
  /* REC-143: the additive columns run BEFORE the schema (an index on a column only this list adds would otherwise hit
     the old table and throw inside blockConcurrencyWhile) and again AFTER it (a table the schema creates now). */
  addColumns();
  const bare = PUBLICATION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  if (rows(`PRAGMA table_info(published_bundles_preeditions)`).length) {
    sql.exec(
      `INSERT INTO published_bundles (bundle_id,edition,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored)
       SELECT bundle_id,1,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored
       FROM published_bundles_preeditions`);
    sql.exec(`DROP TABLE published_bundles_preeditions`);
  }
  addColumns();
  /* D-734 (BOB #36, D-731 (b)): a case document RATIFIED BEFORE its hash was registered answers op=verify as never
     ratified. The rows are written here from what the record already holds — the signed doc_sha, the text it was
     computed over, the ratification's own time — only where no row exists, so every boot after the first finds
     nothing to do. */
  for (const d of rows(
    `SELECT d.case_id, d.edition, d.doc_sha, d.text, d.ratified_at FROM case_documents d
      WHERE d.ratified_at IS NOT NULL AND d.doc_sha IS NOT NULL AND NOT EXISTS (SELECT 1 FROM published_shas p
        WHERE p.sha256 = d.doc_sha AND p.bundle_id = d.case_id AND p.kind = 'case_document')`))
    registerCaseDocumentSha(sql, d.case_id, d.edition, d.doc_sha, d.text, d.ratified_at);
}

/* D-734: A RATIFIED CASE DOCUMENT'S HASH IS A PUBLISHED HASH, kind `case_document`, `bundle_id` the case, `published`
   the ratification's own time; `bytes` the UTF-8 length of the text the sha was computed over. Append-only. */
export function registerCaseDocumentSha(sql, caseId, edition, docSha, text, at) {
  sql.exec(
    `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
     ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
    docSha, caseId, caseDocumentPath(edition), "case_document",
    new TextEncoder().encode(String(text ?? "")).length, at);
}
