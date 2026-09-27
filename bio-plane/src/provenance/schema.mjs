/* provenance's tables (requirements: `build/requirements/provenance.md`, R41, R48). Moved out of the legacy
 * `schema.mjs` at this module's extraction (layers.md ruling 3, "each module owns its tables"; K72 (3)'s pattern):
 * the register, the acquisition receipts (`captured_locators`) and the route marks, with the comments that record
 * why each is shaped as it is; and the two tables this module added, the declared origins (R29) and the signed
 * receipts with the instance keys that signed them (R34). `register` and `captured_locators` are a stated read
 * contract (R48): later modules may join their capture digest, `bundle_id`, path, locator columns; every write
 * to them is this module's (R41). */

export const PROVENANCE_SCHEMA = `
-- The register: the trust root. capture_sha is the only thing that proves bytes.
CREATE TABLE IF NOT EXISTS register (
  capture_sha TEXT PRIMARY KEY,
  bundle_id   TEXT NOT NULL,
  path        TEXT NOT NULL,
  encoding    TEXT NOT NULL,
  bytes       INTEGER NOT NULL,
  registered  TEXT NOT NULL,
  -- MK-1 / D-184 / IC-134 (MEMBER-KNOWLEDGE-DESIGN.md section 2). 1 when these
  -- bytes are a MEMBER'S OWN WORDS authored through op=testify, never a capture
  -- of something published. ONLY the testimony path writes 1, and promote's
  -- fence (C-53.8) refuses the flag on any document it did not write, so a
  -- caller cannot set it and cannot clear it. 0 is the true value for every row
  -- that existed before this column did, because no authored bundle could.
  authored    INTEGER NOT NULL DEFAULT 0,
  -- The member who authored the words, STAMPED by the plane from the session
  -- and never taken from the caller. NULL on every row that is not authored.
  author      TEXT,
  -- When the member says they OBSERVED it, which is THEIR statement. The
  -- record's own time of writing is registered above, and the two are kept
  -- apart as correspondence keeps them. NULL on every row that is not authored.
  observed_at TEXT
);
CREATE INDEX IF NOT EXISTS register_bundle ON register(bundle_id);

-- Which ADDRESSES the record has captured, and when. The register is keyed by
-- capture hash and carries no locator, so nothing could answer "does the store
-- hold a capture of https://..." without this. One row per (address, capture),
-- because the point is precisely that an address is captured repeatedly over
-- time and the versions are what a contemporaneity verdict compares.
-- One row per (address, DISTINCT BYTES), carrying the INTERVAL over which those
-- bytes were seen served rather than a single date. That interval is the whole
-- point: identical bytes observed on both sides of another document's retrieval
-- prove the target did not change across it, which settles contemporaneity
-- outright and needs no timestamp from the source that anyone has to trust. A
-- first draft keyed rows by (address, sha) and kept only the earliest date,
-- which threw away exactly the evidence the verdict is built on.
-- D-96: via names the SOURCE of an observation, because once an alternative
-- source counts as a re-fetch for monitoring (RULED, AUTHORITY-AND-TRUST.md),
-- archive bytes and live bytes must never be compared as one observation
-- stream. Two sources agreeing is STRONGER evidence than one source repeating;
-- two sources disagreeing is not evidence of change at all. The bracket arm
-- cannot tell those apart without knowing which is which, so via is part of
-- the KEY: an archive observation of the same bytes is a different fact from a
-- direct one, not a repeat of it.
--
-- The address columns carry the DOCUMENT ADDRESS, the address the record
-- reasons about; retrieval_locator carries what was actually fetched. For an
-- archive capture the document address is the CDX original field through our own
-- normaliser and the retrieval locator is the archive's replay address, and
-- conflating them is how a provenance difference gets reported as a change.
--
-- CORRECTED 2026-09-14 BY CAP-8, AND THE OLD SENTENCE IS SAID RATHER THAN
-- DELETED. This read "For a direct capture they are the same string", and that
-- was true of every capture the plane could make until Bob ruled that a link to
-- a Google Drive file KEEPS THE LINK while the harvest is the OpenDocument
-- export. A Drive capture is via 'direct' -- we asked Google and Google answered
-- us, with nobody in between -- and its two addresses differ anyway: the address
-- columns hold the Drive link the source page carried, and retrieval_locator
-- holds the export address the plane composed from the file id and the kind.
-- So via no longer tells a reader whether the two are equal, and a reader that
-- wants the document address must read it here rather than infer it. IC-85.
CREATE TABLE IF NOT EXISTS captured_locators (
  address_norm      TEXT NOT NULL,
  address           TEXT NOT NULL,
  capture_sha       TEXT NOT NULL,
  via               TEXT NOT NULL DEFAULT 'direct',
  retrieval_locator TEXT,
  first_retrieved   TEXT NOT NULL,
  last_retrieved    TEXT NOT NULL,
  observations      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (address_norm, capture_sha, via)
);
CREATE INDEX IF NOT EXISTS captured_locators_addr ON captured_locators(address_norm, first_retrieved);
-- CAP-13: the page count in siteAssets and siteChrome joins on capture_sha.
CREATE INDEX IF NOT EXISTS captured_locators_sha ON captured_locators(capture_sha);

-- REC-63 / DEC-56 / D-204: THE STANDING MARKER. When a document's provenance
-- ROUTE cannot be shown, the record carries that fact BESIDE the state rather
-- than un-saying the verification. Bob ruled the principle across DEC-56/57/58
-- on 2026-08-06: ACT, AND SAY WHAT YOU COULD NOT ESTABLISH.
--
-- WHY A ROW HERE AND NOT A FIELD IN THE BUNDLE'S OWN BYTES, which is the first
-- question a reader will ask. Writing the marker into data/provenance.json
-- would change the bundle_sha of a VERIFIED document, so the doubt about the
-- bytes would alter the bytes -- and it would be a second claim nobody made,
-- which is the same reasoning provenanceChainRebuild already gives for leaving
-- bundle.md alone. The marker is a statement by THIS INSTANCE about its own
-- evidence, so it lives where the instance's other statements live.
--
-- APPEND-ONLY, AND THAT IS DEC-19. Correction moves FORWARD: a route later
-- shown is a NEW row saying so, never a delete of the row that said it could
-- not be. The current finding is the row with the highest 'seq' for a bundle,
-- and the ones before it stay readable.
--
-- 'finding' IS D-129's VOCABULARY, taken from airun.mjs's OBSERVATION_STATES
-- rather than invented here, because this record already has words for which
-- absence it met: NEVER_LOOKED is the ABSENCE OF A ROW and is never stored,
-- LOOKED_INDETERMINATE is the marker itself (we looked and cannot tell), and
-- PRESENT is an assessment that found the route showable. LOOKED_ABSENT is
-- deliberately unreachable here: it would assert the bytes have no route, and
-- every captured byte came from somewhere -- what we cannot show is OUR
-- EVIDENCE of it, which is a statement about us.
--
-- 'state_at' RECORDS THE STATE THE DOCUMENT SAT IN WHEN THE MARKER WAS MADE,
-- because the marker's whole point is that the state STANDS while the doubt is
-- carried: a reader of the history has to be able to see that the two disagreed
-- ON PURPOSE and that nothing moved the document.
CREATE TABLE IF NOT EXISTS provenance_route_marks (
  bundle_id      TEXT    NOT NULL,
  seq            INTEGER NOT NULL, -- MAX+1 per bundle. The highest is the current finding
  at             TEXT    NOT NULL,
  by             TEXT    NOT NULL, -- the MEMBER who made the assessment. Never a machine
  finding        TEXT    NOT NULL, -- LOOKED_INDETERMINATE (the marker) | PRESENT
  state_at       TEXT    NOT NULL, -- current_state at the moment of marking
  register_state TEXT    NOT NULL, -- readable | absent | unparsable | no_documents | empty
  undetermined   INTEGER NOT NULL, -- documents whose route could not be shown
  documents_n    INTEGER NOT NULL, -- documents the register named at all
  documents      TEXT    NOT NULL, -- JSON per-document outcomes, so the marker says WHICH
  PRIMARY KEY (bundle_id, seq)
);
-- =========================================================================
-- REC-112, 2026-09-17 -- THIS INDEX HAS NO READER, AND IT IS KEPT ON PURPOSE.
--
-- WHAT IT WAITS FOR: a READ op answering the question no op asks --
-- "which documents in this instance carry a standing LOOKED_INDETERMINATE
-- marker". All four SQL readers of this table key on bundle_id and seq and
-- classify in JS, so a group asking where its own record's provenance is
-- doubted must page the whole store and count for itself. The route act is
-- registered mutating:true in index.mjs -- a WRITE. There is no read.
--
-- IT IS NOT DEAD WEIGHT AND IT IS NOT MIS-SPECIFIED, and that is MEASURED
-- rather than read off the SQL (EXPLAIN QUERY PLAN, sqlite3 3.51.0, no
-- ANALYZE, which is this plane's live condition because nothing here ever
-- runs one). The MEASUREMENTS ledger's M-41 carries the plans in full:
--   the four existing readers     -- every one uses the PRIMARY KEY autoindex,
--                                    none touches this index, and DROPPING it
--                                    leaves all four plans IDENTICAL
--   finding = ?                   -- SEARCH USING INDEX (finding=?)
--   finding = ? AND bundle_id > ? -- SEARCH USING INDEX (finding=? AND
--                                    bundle_id>?) -- BOTH columns, which is
--                                    this plane's after-cursor paging shape
--   COUNT over finding = ?        -- COVERING INDEX
-- The second column is therefore not decoration: whoever declared this knew
-- the intended reader's PAGING shape. That is evidence of a SPECIFIC reader
-- rather than a speculative index, and it is why the act was to row the
-- reader rather than to delete the declaration.
--
-- DELETING IT WAS CONSIDERED AND REFUSED. REC-92 withdrew a chain_kind index
-- a few hundred lines down on REC-12's rule -- an index nobody seeks on is
-- cost with no reader -- but that precedent governs ADDING one, not removing
-- one a dated delegation has pointed at for 39 days. Removing this would take
-- the airuns sweep's unread roster DOWN by one for a reason that is not the
-- plane getting better, which is the one direction that ratchet must never
-- move, and it would delete the very artifact that made the sweep find this
-- owed act at all. The write cost is one row per member assessment, on an
-- append-only table a member writes by hand.
--
-- THE INTENT SURVIVES IN THREE PLACES AND THIS IS THE THIRD, so the index is
-- NOT the only evidence of it: CLAIMS.md carries REC-69's DELEGATION of
-- 2026-08-09 naming the question verbatim and re-affirmed open by M0-37 on
-- 2026-09-16, airuns.test.mjs carries it on the unread roster AND pins it BY
-- NAME, and the declaration is here.
--
-- DO NOT REFLOW THE TWO LINES BELOW. test/nc-rec69-selects.mjs patches them as
-- EXACT STRING LITERALS to arm two negative controls, so a whitespace change
-- makes those arms match zero times and PASS while testing nothing.
-- =========================================================================
CREATE INDEX IF NOT EXISTS provenance_route_marks_finding
  ON provenance_route_marks(finding, bundle_id);

-- REC-225 (Content Framework v0.10 section 8.3; R29, R30): A MEMBER'S DECLARATION OF THE SYSTEM A
-- DOCUMENT CAME FROM. A host serves many offices, so a host is not an origin: the office a document
-- came from is a member's attributed statement, per document, dated, append-only; the row with the
-- highest seq for a bundle is the standing declaration, and the ones before it stay readable.
CREATE TABLE IF NOT EXISTS origin_declarations (
  bundle_id TEXT    NOT NULL,
  seq       INTEGER NOT NULL, -- MAX+1 per bundle. The highest is the standing declaration
  system    TEXT    NOT NULL, -- the system the member says the document came from
  by        TEXT    NOT NULL, -- the member who declared it. Never a machine
  at        TEXT    NOT NULL, -- this module's clock at the declaration
  PRIMARY KEY (bundle_id, seq)
);

-- K59 (R34): THE INSTANCE'S OWN SIGNED RECEIPTS FOR ARCHIVE-SOURCED CAPTURES, and the public keys that
-- signed them. One signing key per instance, held as a secret and replaceable by the operator; each
-- public key the instance ever signed with is kept here, so a receipt signed before a replacement
-- stays verifiable against the key it was signed with. key_id is the SHA-256 of the raw public key.
CREATE TABLE IF NOT EXISTS receipt_keys (
  key_id     TEXT PRIMARY KEY,
  public_key TEXT NOT NULL, -- the raw Ed25519 public key, base64
  first_used TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS signed_receipts (
  capture_sha       TEXT NOT NULL,
  retrieval_locator TEXT NOT NULL,
  retrieved         TEXT NOT NULL,
  statement         TEXT NOT NULL, -- the exact bytes signed (UTF-8)
  signature         TEXT NOT NULL, -- Ed25519 over the statement, base64
  key_id            TEXT NOT NULL,
  signed_at         TEXT NOT NULL,
  PRIMARY KEY (capture_sha, retrieval_locator, retrieved)
);
`;

/* The register's columns added after stores were first written (MK-1 / D-184 / IC-134): the default IS the true
   value for every row that can exist before the column did, since no route could author a bundle until
   op=testify existed; `author` and `observed_at` are NULL on every row that is not authored. */
export const REGISTER_ADDITIVE = [
  ["register", "authored", "INTEGER NOT NULL DEFAULT 0"],
  ["register", "author", "TEXT"],
  ["register", "observed_at", "TEXT"],
];

/* Creates this module's tables on `sql` (the Durable Object's storage). Idempotent, run at every boot.
   `captured_locators` gained `via` (D-96) when observation SOURCE became part of the key: an archive observation
   of the same bytes at the same address is a different fact from a direct one, and rows keyed without via had
   already merged them. It is derived (re-derivable from the captures and the provenance documents, holding
   nothing a member wrote), so a table without the column is dropped and rebuilt rather than altered. */
export function migrateProvenance(sql) {
  const cols = (t) => [...sql.exec(`PRAGMA table_info(${t})`)].map((r) => r.name);
  const cl = cols("captured_locators");
  if (cl.length && !cl.includes("via")) sql.exec(`DROP TABLE captured_locators`);
  for (const [t, c, decl] of REGISTER_ADDITIVE) {
    const have = cols(t);
    if (have.length && !have.includes(c)) sql.exec(`ALTER TABLE ${t} ADD COLUMN ${c} ${decl}`);
  }
  const bare = PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";")) { const t = s.trim(); if (t) sql.exec(t); }
}
