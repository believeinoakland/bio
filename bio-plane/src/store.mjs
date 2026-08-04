import { DurableObject } from "cloudflare:workers";
/* The catalog's own frontmatter parser. References are read from the document
   with the same code that later checks them, so the store's projection and the
   checker's view cannot disagree about what the document says. */
import { parseFrontmatter, checkGatheringGrammar, checkInboxGrammar, MECHANICAL_FIELD_SETS,
         checkBundle, createSha256, isPublicHttpsLocator,
         /* REC-10: the type mapping and the inquiry state machine come from
            the catalog, so the store's view and the checker's view cannot
            disagree (the same reason this file already imports the catalog's
            parser); the title derivation is C-16's ONE rule, stated once. */
         /* REC-13: vocabFor is the catalog's OWN vocabulary lookup — declared
            spelling first, normalized type as the fallback. op=conclude asks a
            VOCABULARY question ("which state machine governs this document"),
            so it goes through the map like every other consulting site rather
            than reaching into STATES by a raw key. REC-20: the MAP RULE applies
            to op=queue's ancestor walk too — a case's type and state read
            through the same machinery, so a legacy spelling groups identically. */
         normalizeType, LEGACY_TYPE_ALIASES, STATES, OBJECT_TYPES, vocabFor,
         /* REC-11: the basis leg grammar is the catalog's ONE function, run
            here at the write (the checkGatheringGrammar precedent) and by the
            checker, so a malformed leg never lands and the two views cannot
            drift. */
         deriveInquiryTitle, inquiryQuestionOf, checkInquiryBasis,
         /* REC-14: the published vocabulary and the ONE definition of what a
            completeness block ASSERTS, imported so this act's pre-flight and
            C-21.1's gate compare exactly the same fields. */
         SUBJECT_POSITIONS, completenessFields } from "../checks/bio-checks.mjs";
import { SCHEMA as SCHEMA_TEXT } from "./schema.mjs";
/* The disposition set is the PUBLISHED one (op=affordances), imported so there
   is ONE array — the REC-19 landing left a literal copy in dispose() with the
   suite pinning the two identical; REC-11's folded chore flips the direction. */
/* REC-20: op=queue's `options[]` come from REC-19's OWN derivation and from
   nowhere else — the store calls deriveActs over its own affordanceFacts, so a
   queue item and an op=affordances answer for the same subject and the same
   viewer cannot disagree. The act METADATA (needs/mode/rung) still composes at
   the control plane, where NEEDS, SESSION_OPS and RUNGS live. */
import { DISPOSITIONS, REOPENABLE_FROM, deriveActs } from "./affordances.mjs";
/* REC-21: the queue's PERSONAL half. The CONDITION-kind vocabulary the mute
   fence refuses against, and the ONE admission decision the feed applies — pure,
   so the suite holds the rule directly rather than only through a Durable
   Object, the same reason deriveActs lives outside this file. */
import { QUEUE_CONDITION_KINDS, classOfKind, MUTE_REFUSAL_DETAIL,
         serializeMutedKinds, parseMutedKinds, suppressedBy } from "./queuestate.mjs";
/* The retrieval surface is compiled, never assembled here. This file executes
   statements and maintains the index; it builds no query. That is what makes the
   D-15 viewer gate a SINGLE compilation point rather than a convention: there is
   no second place in the plane where a query could come from. */
import { compile, textOf, FTS_COLUMNS, GATE_MARK, FIELDS, DEFAULT_FACETS, IDS_MAX, viewerPredicate } from "./query.mjs";

/* BIO store, plane layer, step 1.
 *
 * Replaces storeReadAdapter_, storeWriteAdapter_, indexWriteAdapter_ and the
 * Drive traversal helpers from promotion-service.gs (about 890 lines) with SQL
 * against the Durable Object's embedded SQLite.
 *
 * What is deliberately absent, because the plane makes it unnecessary:
 *   - findBundleFolder_ / allBundleFolders_ / typeRootFor_ traversal: a primary
 *     key replaces four type roots and getFoldersByName.
 *   - duplicateBundleIds_ / duplicatePaths_ / duplicatePathError_: the refusal
 *     machinery for Drive's same-name defect. A primary key cannot collide.
 *   - completeInterruptedCreation_ and the .pending manifest-last marker: one
 *     transaction cannot be half applied.
 *   - the deadline, checkpoint, cursor and budget parameters: no execution
 *     ceiling.
 *
 * What is preserved exactly: promotion is the sole writer of live state, the
 * CAS is the lost-update floor, history is append-only, the register is the
 * root of trust, and the gate runs over a byte-complete image.
 */

/* The SHA-256 of the empty string: the canonical base of a creation, as the
   accelerator recorded it and as the check catalog recognises it. */
const EMPTY_STRING_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const INLINE_MAX = 1024 * 1024; // spill to R2 above 1MB; measured hard limit ~2MiB

/* ---- D-98 task inbox helpers, module scope because they are pure ----
   The F5 bound lives HERE, at the producer boundary, so a subject is inert
   before it is stored rather than after it is read. Anything a member sees on
   a task passed through boundedSubject on its way in. */
const TASK_KINDS = ["authority-undetermined"];
/* D-104. Closed on purpose: the value of the reachability table is that it tells
   kinds of not-getting-the-bytes apart, and a free string would let a caller
   collapse that distinction by accident. */
const SOURCE_OUTCOMES = ["success", "source_refused", "fetch_failed", "governed"];
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
/* Single line, length-capped, control characters stripped. Newlines go first
   because a multi-line subject is how a plausible-looking instruction gets
   room to look like a message rather than a label. */
const boundedSubject = (v) =>
  String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200);
/* The id suffix the TASK grammar requires: lowercase alphanumeric groups joined
   by single dashes, never empty, never leading or trailing dashes. Derived from
   the subject so an id is legible, but it is an IDENTIFIER and not a rendering:
   the subject itself is carried in the bounded field the grammar checks. */
const taskSlug = (subject) => {
  const s = String(subject || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/g, "");
  return s || "authority";
};
const isHttpsPublic = (u) => isPublicHttpsLocator(u);

export class Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => this.#migrate());
  }

  #migrate() {
    const bare = (this.env.SCHEMA || SCHEMA_TEXT || "").split("\n").filter(l => !l.trim().startsWith("--")).join("\n");
    /* Some tables are DERIVED: regenerable by scan, never authoritative, holding
       nothing a member wrote. When one of those changes shape, recreating it is
       correct and an additive ALTER would be the wrong answer, because the new
       column's meaning is part of the KEY and old rows keyed the old way are not
       merely missing a field, they are wrong.
       *
       * links gained citation_norm and fragment when element references became
       * part of a citation rather than a comment on one. A link to #findings and
       * a link to #methodology in one report are two citations, and rows keyed
       * without the fragment had already collapsed them. Those rows cannot be
       * repaired by adding a column; they can only be re-derived from the
       * captures, which is exactly what a derived table is for.
       *
       * This list must never grow to include a table holding first-party
       * material. The test suite asserts the distinction. */
    /* captured_locators gained `via` (D-96) when observation SOURCE became part
       * of the key: an archive observation of the same bytes at the same address
       * is a different fact from a direct one, and rows keyed without via had
       * already merged them. Like links, it is derived: re-derivable from the
       * captures and the provenance documents, holding nothing a member wrote. */
    for (const [table, needed] of [["links", "citation_norm"], ["captured_locators", "via"]]) {
      const cols = [...this.sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
      /* Dropped BEFORE the schema runs, so the CREATE TABLE and CREATE INDEX
         statements below rebuild it in one pass. Dropping afterwards meant the
         schema's CREATE INDEX on the new column hit the OLD table and threw
         inside blockConcurrencyWhile, which does not fail a test, it bricks the
         Durable Object. */
      if (cols.length && !cols.includes(needed)) this.sql.exec(`DROP TABLE ${table}`);
    }

    /* REC-14 / DEC-12: published_bundles is RE-KEYED (bundle_id, edition).
       Unlike the two derived tables above it may NEVER be dropped — it is the
       published projection, and a hash once published stays answerable forever
       — so the old table is renamed out of the way here, the schema below
       creates the new shape, and the copy-forward runs immediately after it.
       Every existing row becomes EDITION 1, which is what it always was: the
       upsert that overwrote it (D-144) was the missing feature, not the append.
       The interim name carries no IF NOT EXISTS and never survives this
       function, so it is not a table the D-113 sweep has to know about. */
    {
      const cols = [...this.sql.exec(`PRAGMA table_info(published_bundles)`)].map((r) => r.name);
      if (cols.length && !cols.includes("edition"))
        this.sql.exec(`ALTER TABLE published_bundles RENAME TO published_bundles_preeditions`);
    }

    for (const s of bare.split(";")) { const t = s.trim(); if (t) this.sql.exec(t); }

    {
      const old = [...this.sql.exec(`PRAGMA table_info(published_bundles_preeditions)`)];
      if (old.length) {
        this.sql.exec(
          `INSERT INTO published_bundles (bundle_id,edition,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored)
           SELECT bundle_id,1,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored
           FROM published_bundles_preeditions`);
        this.sql.exec(`DROP TABLE published_bundles_preeditions`);
      }
    }
    /* CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so
       columns added after a store was first written need adding by hand. Done
       here rather than in a versioned migration ladder because these are
       additive and nullable: an older row simply has no writer, which is exactly
       what a hand-authored promotion means. */
    /* members.name became members.cover on 2026-07-24. A field called "name"
       invites an administrator to type a legal name, which is the whole exposure
       the cover-and-handle split exists to prevent, so the column carries the
       honest word. Renamed rather than aliased: two words for one thing is how
       the drift this repo keeps finding gets started. */
    const memberCols = [...this.sql.exec(`PRAGMA table_info(members)`)].map((r) => r.name);
    if (memberCols.includes("name") && !memberCols.includes("cover"))
      this.sql.exec(`ALTER TABLE members RENAME COLUMN name TO cover`);
    for (const [table, column, decl] of [
      /* The membership model's member half. A COVER is what an administrator
         calls someone in the roster; a HANDLE is what the member chooses at
         enrolment and what the RECORD shows. Two names assigned by two parties
         for two purposes, and only administrators see them together
         (Membership Architecture section 3). Additive and nullable, so a member
         enrolled before handles existed simply has none until they choose one. */
      ["members", "handle", "TEXT"],
      /* Capabilities, section 5. Stored as a JSON array rather than a column
         apiece because the set is expected to grow and a column per capability
         is a migration per capability. `administer` is deliberately NOT in this
         list even though it is a capability: it is granted and removed only by
         the section 4 process, never by editing a field. */
      ["members", "capabilities", "TEXT"],
      /* Declared expertise, section 1.3: metadata that informs humans and gates
         nothing. Recorded here so it cannot drift into being consulted. */
      ["members", "expertise", "TEXT"],
      ["manifest", "writer", "TEXT"],
      ["manifest", "operation", "TEXT"],
      /* S-10 step 1: the metadata projection the retrieval surface filters and
         sorts on. Probe 2 (development/RETRIEVAL-SUBSTRATE.md) measured that the
         original nine columns cover about half of what real frontmatter carries,
         and that typed indexed columns beat a facet table by roughly 9x on write
         cost and 5.5x on space while never being slower. So: a column for every
         field the UX filters on, and fm_json for the per-schema tail, since
         information@1, information@2, problem@1 and project@1 carry different
         field sets and more versions are coming. All nullable and additive, so
         an older row simply has an empty projection until the backfill below
         re-derives it from bundle.md. */
      ["bundles", "schema_id", "TEXT"],
      ["bundles", "produced_mode", "TEXT"],
      ["bundles", "capability_tier", "TEXT"],
      ["bundles", "source_locator", "TEXT"],
      ["bundles", "source_authority", "TEXT"],
      ["bundles", "source_retrieved", "TEXT"],
      ["bundles", "source_status", "TEXT"],
      ["bundles", "content_hash", "TEXT"],
      ["bundles", "monitor_enabled", "INTEGER"],
      ["bundles", "monitor_frequency", "TEXT"],
      ["bundles", "monitor_last_checked", "TEXT"],
      ["bundles", "annotations_open", "INTEGER"],
      ["bundles", "reeval_flag", "INTEGER"],
      ["bundles", "reeval_since", "TEXT"],
      ["bundles", "reeval_source", "TEXT"],
      ["bundles", "fm_json", "TEXT"],
      /* S-10 step 2: the row key the text index is aligned on. FTS5 addresses
         rows by integer rowid, and probe 2 chose an integer join over a string
         join for text-plus-metadata queries, so a bundle needs a stable integer
         of its own. NOT the table's implicit rowid: that is an implementation
         detail SQLite is entitled to renumber, and an index keyed on a number
         the engine may change is an index that can silently point at the wrong
         document. */
      ["bundles", "fts_id", "INTEGER"],
      /* REC-12: the derived strength PAIR, cached per axis. TWO grade columns
         and never one, because a single cached letter is exactly the composed
         scalar DEC-21 forbids and a column is where one would grow. The STATE
         column beside each grade is what tells `unrated` (DEC-18's boundary
         case — nothing on this axis is graded) from `undetermined` (R3 — the
         walk hit its depth bound) from "never projected", which one nullable
         grade column cannot do. Additive and nullable: a bundle that is not an
         inquiry simply has none, and an inquiry promoted before these existed
         has none until its next promotion re-derives them. THE COLUMN IS A
         CACHE AND strengthOf() IS THE AUTHORITY — a stored strength goes stale
         the moment a leg beneath it is raised. */
      ["bundles", "inquiry_capture_strength", "TEXT"],
      ["bundles", "inquiry_capture_state", "TEXT"],
      ["bundles", "inquiry_connection_strength", "TEXT"],
      ["bundles", "inquiry_connection_state", "TEXT"],
      ["bundles", "inquiry_basis_count", "INTEGER"],
    ]) {
      const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].some((r) => r.name === column);
      if (!have) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    /* classification was REMOVED from the Information catalog on 2026-07-27
       (Bob's decision, recorded in the state doc v30 entry). fact/analysis/
       judgment is a stance a citing project takes toward a passage, not a
       property a document has, so the vocabulary moves to the citation model
       when anchored citations land. Dropped rather than orphaned so a store
       migrated forward and a fresh install present the same table; guarded on
       PRAGMA because this must be idempotent across every boot, and DROP
       COLUMN on a column already gone is an error. Bundle frontmatter still
       carrying the field is inert and drains on each bundle's next promotion;
       history is append-only and keeps it forever, which is correct. */
    const bundleCols = [...this.sql.exec(`PRAGMA table_info(bundles)`)].map((r) => r.name);
    if (bundleCols.includes("classification"))
      this.sql.exec(`ALTER TABLE bundles DROP COLUMN classification`);
    /* The type renames (problem→focus 2026-07-27, focus→inquiry REC-10).
       Normalisation site 2 of 4. The projection is DERIVED, so it is the
       layer the design normalizes: frontmatter in append-only history keeps
       whatever spelling it was written with, and every projection row says
       the canonical type. GENERATED from the catalog's own alias map rather
       than restated, so a fourth name is one catalog entry and zero edits
       here. Idempotent by construction. */
    for (const [legacy, canonical] of Object.entries(LEGACY_TYPE_ALIASES))
      this.sql.exec(`UPDATE bundles SET object_type=? WHERE object_type=?`, canonical, legacy);
    /* Indexed because probe 2 recorded the difference in the query PLAN, not
       only the latency: without an index a filter is a full table scan whose
       cost grows with the corpus, and at 20,000 rows a scan is still fast
       enough to look like success. */
    /* REC-12's two axis columns are indexed for the same reason the rest are:
       "every inquiry at B or better on the capture axis" must be a seek. The
       STATE columns are not indexed — they are read WITH a row, never filtered
       across the corpus, and an index nobody seeks on is cost with no reader. */
    for (const c of ["schema_id", "produced_mode", "source_authority", "source_status",
                     "monitor_frequency", "reeval_flag", "annotations_open",
                     "inquiry_capture_strength", "inquiry_connection_strength"])
      this.sql.exec(`CREATE INDEX IF NOT EXISTS bundles_${c} ON bundles(${c})`);
    this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS bundles_fts_id ON bundles(fts_id)`);

    /* S-10 step 2: the text index, inside the Durable Object, which is what
       probe 1 measured and chose. Not an exported index: cost tracks result size
       rather than corpus size, and the whole surface stays behind the two-bucket
       fence by construction because it never leaves the object that holds the
       working corpus.

       Five columns rather than one blob, so a member can scope a term to the
       part of the document they mean. `meta` carries the flattened frontmatter,
       which is what makes the per-schema tail searchable without a column per
       schema version: information@1, information@2, problem@1 and project@1
       carry different field sets and more versions are coming.

       A regular content table, not contentless and not external-content. A
       contentless table cannot produce snippet(), and Bob settled that a result
       carries provenance and context rather than bare ids. External content
       requires the text to be reconstructable from one table with matching
       columns, and `body` spans every inline text file in the bundle. The cost
       is a second copy of the text, measured at roughly 430 bytes per document. */
    this.sql.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS bundles_fts USING fts5(
         ${FTS_COLUMNS.join(", ")}, tokenize='unicode61')`);

    /* S-10 step 5: server-side selections.
     *
     * A selection is the FIRST thing in this store that is legitimately
     * collectable. Everything else is append-only by doctrine, and a sweep that
     * deletes rows would read as a violation to anyone who did not know why, so
     * the exception is written here as well as in the debt register: a selection
     * is DERIVED, it holds no assertion about the world, and losing one costs a
     * member a click. Nothing else in this schema has that property.
     *
     * Two kinds, because two different intents were wearing one word:
     *   query       the operator picked a CRITERION and said "all of these", so
     *               the current answer to the criterion is the correct set by
     *               definition. No items are stored at all: the query plus a
     *               digest of the ordered id list is O(1) and still detects
     *               drift exactly.
     *   enumerated  the operator picked SPECIFIC items. Membership is frozen,
     *               and items are stored with the sha each carried when it was
     *               picked, which is what makes revision drift a comparison.
     *
     * Collapsing the two would mean a large enumeration silently became a query
     * at whatever size a storage cap sat, which changes what the operator's
     * click meant. So the cap on an enumeration is a REFUSAL, not a fallback. */
    /* A handle is unique across the instance, because a roster in which two
       people can answer to one name defeats the purpose of having one. Partial,
       so the many members with no handle yet do not collide on NULL. */
    this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS members_handle ON members(handle) WHERE handle IS NOT NULL`);

    /* Administrator governance, Membership Architecture section 4.7. Every vote
       is a row and nothing is tallied anywhere else, so the record of WHO
       decided and WHY survives the decision. Append-only like the rest of the
       store: a spent proposal keeps its votes.
         kind    'add'    an endorsement, and addition needs the consensus of
                          every existing administrator
                 'remove' a vote to eject, and removal needs a majority of ALL
                          administrators counting the target in the denominator
       Nothing is ever deleted from here, so an ejection can be audited after
       the fact by the people it was done to. */
    /* Project participation, Membership Architecture section 7. Keyed on
       member_id and not on handle: a handle is what the RECORD shows and is the
       member's own, and keying participation on a display name would make the
       graph depend on a field the member picked. Invitations arrive BY handle
       (7.2) and are resolved here.
         state   'invited'  invited, not joined: skeleton visibility, view only
                 'joined'   full visibility, subject to capabilities
                 'leaving'  a joined member unchecked the box (7.6). This is a
                            REQUEST, not a removal: they keep their position
                            until an administrator acts, because 7.7 gives
                            removal to administrators alone.
       `owner` is the creator (7.1). Owners invite; they do not remove. */
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS project_participants (
         project_id TEXT NOT NULL,
         member_id  TEXT NOT NULL,
         state      TEXT NOT NULL,
         owner      INTEGER NOT NULL DEFAULT 0,
         invited_by TEXT,
         comment    TEXT,
         created    TEXT NOT NULL,
         updated    TEXT NOT NULL,
         PRIMARY KEY (project_id, member_id)
       )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS pp_member ON project_participants(member_id)`);
    /* Section 1.3, declared expertise and confirmed licenses.
     *
     * An EVENT LOG, not a status column, because withdrawal supersedes rather
     * than overwrites: a group that can see a confirmation was once given and
     * later withdrawn is better informed than one that sees only today's answer.
     * Every other record in this system is append-only and this is no different;
     * because confirmation gates nothing, the reason here is honesty of the
     * roster rather than security.
     *
     * The v1.4 model was an `expertise` list on the member row, which cannot
     * carry a confirmation state, a confirmer, or a withdrawal PER ENTRY, all of
     * which v2 1.3 requires. The old column is left in place and unused rather
     * than dropped, since nothing in this system deletes. */
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS member_expertise (
         seq       INTEGER PRIMARY KEY AUTOINCREMENT,
         member_id TEXT NOT NULL,
         label     TEXT NOT NULL,
         event     TEXT NOT NULL,
         actor     TEXT NOT NULL,
         created   TEXT NOT NULL
       )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS mx_member ON member_expertise(member_id, label)`);
    /* Section 8.1: an export is recorded so it can never happen SILENTLY.
       Append-only, like everything else here. In-app administrators cannot RUN
       an export and must be able to SEE that one happened, because an export a
       captured root of trust could take unnoticed would defeat the recording. */
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS export_log (
         seq     INTEGER PRIMARY KEY AUTOINCREMENT,
         at      TEXT NOT NULL,
         scope   TEXT NOT NULL,
         bundles INTEGER NOT NULL,
         files   INTEGER NOT NULL,
         note    TEXT
       )`);
    /* Section 7.10 owner governance, recorded the way section 4.7's admin votes
       are. Separate from admin_votes because the arithmetic differs at two and
       sharing the table would invite sharing the tally. */
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS project_owner_votes (
         project_id TEXT NOT NULL,
         kind       TEXT NOT NULL,
         target     TEXT NOT NULL,
         voter      TEXT NOT NULL,
         reason     TEXT,
         created    TEXT NOT NULL,
         PRIMARY KEY (project_id, kind, target, voter)
       )`);

    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS admin_votes (
         kind      TEXT NOT NULL,
         target    TEXT NOT NULL,
         voter     TEXT NOT NULL,
         reason    TEXT,
         created   TEXT NOT NULL,
         PRIMARY KEY (kind, target, voter)
       )`);

    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS selections (
         handle     TEXT PRIMARY KEY,
         owner      TEXT NOT NULL,
         kind       TEXT NOT NULL,
         q          TEXT NOT NULL,
         sort_field TEXT, sort_dir TEXT,
         created    TEXT NOT NULL,
         touched    TEXT NOT NULL,
         expires    TEXT NOT NULL,
         n          INTEGER NOT NULL,
         digest     TEXT NOT NULL
       )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS selections_owner ON selections(owner)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS selections_expires ON selections(expires)`);
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS selection_items (
         handle     TEXT NOT NULL,
         ord        INTEGER NOT NULL,
         bundle_id  TEXT NOT NULL,
         bundle_sha TEXT NOT NULL,
         PRIMARY KEY (handle, ord)
       )`);

    /* Backfill. Rows written before these columns existed carry an empty
       projection, and nothing downstream can tell that apart from a bundle whose
       frontmatter genuinely says nothing. Re-derive from the stored bundle.md,
       which is the authority anyway. Bounded per construction because a Durable
       Object has a CPU budget: the development record is 30 bundles and this is
       milliseconds, but a large store finishes over successive constructions
       rather than timing out on one. */
    this.#backfillProjection(500);
  }

  /* The projection derived from a bundle.md, using the CATALOG'S OWN parser so
     the store's view and the checker's view cannot disagree about what the
     document says. Returns nulls rather than guesses when frontmatter does not
     parse: a wrong value in a filterable column is worse than an absent one,
     because a filter silently under-reports and the member cannot tell. */
  static projectionOf(bundleMdText) {
    const empty = {
      schema_id: null, produced_mode: null, capability_tier: null,
      source_locator: null, source_authority: null, source_retrieved: null,
      source_status: null, content_hash: null, monitor_enabled: null,
      monitor_frequency: null, monitor_last_checked: null, annotations_open: null,
      reeval_flag: null, reeval_since: null, reeval_source: null, fm_json: null,
    };
    if (typeof bundleMdText !== "string") return empty;
    let fm = null;
    try { fm = parseFrontmatter(bundleMdText).data; } catch { return empty; }
    if (!fm || typeof fm !== "object") return empty;
    const s = (v) => (typeof v === "string" && v !== "" ? v : v === 0 ? "0" : v == null ? null : String(v));
    const nested = (block, key) => {
      const b = fm[block];
      return b && typeof b === "object" && !Array.isArray(b) ? b[key] : undefined;
    };
    const bool = (v) => (v === true ? 1 : v === false ? 0 : null);
    const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    /* reeval_pending is a {flag, since, source} record, but the catalog also
       tolerates a legacy boolean, so both shapes are read rather than one
       assumed. */
    const rp = fm.reeval_pending;
    const rpObj = rp && typeof rp === "object" && !Array.isArray(rp);
    return {
      schema_id: s(fm.schema),
      produced_mode: s(nested("produced_by", "mode")),
      capability_tier: s(nested("produced_by", "capability_tier")),
      source_locator: s(nested("source", "locator")),
      source_authority: s(nested("source", "authority")),
      source_retrieved: s(nested("source", "retrieved")),
      source_status: s(fm.source_status),
      content_hash: s(fm.content_hash),
      monitor_enabled: bool(nested("monitoring", "enabled")),
      monitor_frequency: s(nested("monitoring", "frequency")),
      monitor_last_checked: s(nested("monitoring", "last_checked")),
      annotations_open: num(fm.annotations_open),
      reeval_flag: rpObj ? bool(rp.flag) : bool(rp),
      reeval_since: rpObj ? s(rp.since) : null,
      reeval_source: rpObj ? s(rp.source) : null,
      fm_json: JSON.stringify(fm),
    };
  }

  static PROJECTION_COLS = [
    "schema_id", "produced_mode", "capability_tier", "source_locator",
    "source_authority", "source_retrieved", "source_status", "content_hash",
    "monitor_enabled", "monitor_frequency", "monitor_last_checked",
    "annotations_open", "reeval_flag", "reeval_since", "reeval_source", "fm_json",
  ];

  /* Write the projection for one bundle. Called inside promote's transaction, so
     the projection can never be a revision behind the document. */
  #writeProjection(bundleId, bundleMdText) {
    const p = Store.projectionOf(bundleMdText);
    const set = Store.PROJECTION_COLS.map((c) => `${c}=?`).join(", ");
    this.sql.exec(
      `UPDATE bundles SET ${set} WHERE bundle_id=?`,
      ...Store.PROJECTION_COLS.map((c) => p[c]), bundleId
    );
    return p;
  }

  /* The integer the text index is keyed on. Allocated once per bundle and never
     reassigned while the bundle exists, so a revision replaces its own index row
     rather than orphaning one. MAX+1 rather than a sequence because it is
     allocated inside promote's transaction, and a Durable Object runs one
     transaction at a time, so there is no race to lose. */
  #ftsIdFor(bundleId) {
    const cur = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
    if (cur && cur.fts_id !== null && cur.fts_id !== undefined) return cur.fts_id;
    const next = (this.#one(`SELECT COALESCE(MAX(fts_id), 0) AS m FROM bundles`).m || 0) + 1;
    this.sql.exec(`UPDATE bundles SET fts_id=? WHERE bundle_id=?`, next, bundleId);
    return next;
  }

  /* Delete-then-insert rather than an FTS5 UPDATE, because a revision can change
     which files exist and an in-place update of a virtual table row is the shape
     that leaves stale terms behind. Called inside promote's transaction, so the
     text index cannot be a revision behind the corpus. */
  #writeText(bundleId, files) {
    const fid = this.#ftsIdFor(bundleId);
    const t = textOf(bundleId, files);
    this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, fid);
    this.sql.exec(
      `INSERT INTO bundles_fts (rowid, ${FTS_COLUMNS.join(", ")}) VALUES (?, ${FTS_COLUMNS.map(() => "?").join(", ")})`,
      fid, ...FTS_COLUMNS.map((c) => t[c]));
    return { fts_id: fid, chars: FTS_COLUMNS.reduce((n, c) => n + t[c].length, 0) };
  }

  #filesOf(bundleId) {
    return this.#rows(`SELECT path, content FROM files WHERE bundle_id=?`, bundleId)
      .map((r) => ({ path: r.path, text: r.content }));
  }

  /* One backfill for both derived structures. A row is stale if it has no
     projection or no text index, which covers a row written before either
     existed and a row whose index was cleared for repair. Bounded per pass
     because a Durable Object has a CPU budget: a large store finishes over
     successive constructions rather than timing out on one. */
  #backfillProjection(limit) {
    const stale = this.#rows(
      `SELECT bundle_id, fm_json IS NULL AS need_proj, fts_id IS NULL AS need_text
         FROM bundles WHERE fm_json IS NULL OR fts_id IS NULL ORDER BY bundle_id LIMIT ?`, limit);
    let n = 0, t = 0;
    for (const r of stale) {
      const files = this.#filesOf(r.bundle_id);
      const md = files.find((f) => f.path === "bundle.md");
      if (!md || md.text === null) continue;
      if (r.need_proj) { this.#writeProjection(r.bundle_id, md.text); n++; }
      if (r.need_text) { this.#writeText(r.bundle_id, files); t++; }
    }
    return {
      reprojected: n, reindexed: t,
      remaining: this.#one(`SELECT count(*) c FROM bundles WHERE fm_json IS NULL OR fts_id IS NULL`).c,
    };
  }

  /** Re-derive the projection and the text index for rows that lack one. Exposed
   *  because a deploy runs the bounded pass once at construction and a large
   *  store may need more than one. Idempotent: a row that has both is left
   *  alone. */
  reproject({ limit = 500 } = {}) {
    return this.#backfillProjection(limit);
  }

  /** The projected metadata for one bundle, or a json_extract query over the
   *  per-schema tail. This is what the retrieval compiler will filter on.
   *
   *  REC-25 / F-8: the D-15 viewer gate, from query.mjs's ONE compilation
   *  point. FAIL CLOSED — an absent or unrecognised viewer compiles to the
   *  deny predicate, exactly as the search path already behaves, so a caller
   *  that reaches this read without a server-stamped identity sees nothing
   *  rather than everything. An invisible bundle answers EXACTLY as an absent
   *  one (null), because "hidden" said out loud is half the leak. */
  projection({ bundleId = null, jsonPath = null, jsonEquals = null, limit = 200, viewer = null } = {}) {
    const cols = ["b.bundle_id", "b.object_type", "b.group_id", "b.title", "b.current_state",
                  "b.prior_state", "b.created", "b.last_updated", "b.criticality",
                  "b.bundle_sha", ...Store.PROJECTION_COLS.map((c) => "b." + c)].join(", ");
    const gate = viewerPredicate(viewer);
    if (bundleId) return this.#one(
      `SELECT ${cols} FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, bundleId, ...gate.args);
    if (jsonPath !== null && jsonEquals !== null)
      return this.#rows(
        `SELECT ${cols} FROM bundles b WHERE json_extract(b.fm_json, ?) = ? AND (${gate.sql}) ORDER BY b.bundle_id LIMIT ?`,
        jsonPath, jsonEquals, ...gate.args, limit);
    return this.#rows(`SELECT ${cols} FROM bundles b WHERE (${gate.sql}) ORDER BY b.bundle_id LIMIT ?`,
                      ...gate.args, limit);
  }

  /** EXPLAIN QUERY PLAN for representative filters, so a test can assert the
   *  index is USED rather than trusting that creating it was enough. */
  projectionPlan() {
    const out = {};
    for (const c of ["source_status", "produced_mode", "schema_id", "reeval_flag"])
      out[c] = this.#rows(`EXPLAIN QUERY PLAN SELECT bundle_id FROM bundles WHERE ${c} = ?`, "x")
        .map((r) => r.detail);
    return out;
  }

  /** Test and repair support: clear a projection so the backfill path can be
   *  exercised against a row that looks like it predates the columns. */
  projectionClear({ bundleId = null, text = true } = {}) {
    const set = Store.PROJECTION_COLS.map((c) => `${c}=NULL`).join(", ");
    if (bundleId) this.sql.exec(`UPDATE bundles SET ${set} WHERE bundle_id=?`, bundleId);
    else this.sql.exec(`UPDATE bundles SET ${set}`);
    /* The text index is cleared with the projection by default, because the two
       are one derived structure with one backfill and clearing half of it would
       leave the repair path untested on the half that stayed. */
    if (text) {
      if (bundleId) {
        const r = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        this.sql.exec(`UPDATE bundles SET fts_id=NULL WHERE bundle_id=?`, bundleId);
      } else {
        this.sql.exec(`DELETE FROM bundles_fts`);
        this.sql.exec(`UPDATE bundles SET fts_id=NULL`);
      }
    }
    return { ok: true, scope: bundleId || "ALL", text };
  }

  /* ---- S-10 step 3: the retrieval surface ----
   *
   * Five verbs, one call, run where the data is, which is the shape D-26 chose.
   *   search  the query string, compiled by query.mjs
   *   filter  selectors in that same string, plus facet counts to drive a sidebar
   *   list    every hit arrives with full provenance, per Bob's decision
   *   sort    any projected field, always with the declared id tiebreak
   *   select  mode=ids returns the WHOLE set, which is a different request
   *
   * The store builds no SQL. Every statement comes from compile(), and this
   * method refuses to execute one that does not carry the viewer gate, so a
   * query path that skipped D-15's single compilation point fails loudly instead
   * of quietly returning more than the viewer may see.
   */
  #runQuery(stmt, tally) {
    if (!stmt || typeof stmt.sql !== "string" || !stmt.sql.includes(GATE_MARK))
      throw new Error("REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15)");
    tally.applied++;
    return this.#rows(stmt.sql, ...stmt.args);
  }

  search(input = {}) {
    const mode = input.mode === "ids" ? "ids" : input.mode === "count" ? "count" : "page";
    const plan = compile(input);
    const tally = { applied: 0 };
    const total = this.#runQuery(plan.statements.count(), tally)[0]?.n ?? 0;

    const out = {
      query: {
        q: String(input.q ?? ""), terms: plan.terms, match: plan.match,
        sort: plan.sort, warnings: plan.warnings, mode,
      },
      /* The gate is reported, not assumed. `scope` is DENY when the caller
         presented no recognisable viewer, which is the fail-closed answer, and
         `applied` counts the statements that carried the gate. */
      gate: { scope: plan.gate, applied: 0 },
      total, limit: plan.limit, offset: plan.offset,
    };

    if (mode === "page") {
      out.hits = this.#runQuery(plan.statements.page(), tally);
    } else if (mode === "ids") {
      /* Select-all. A distinct operation from a page because acting on a
         selection needs every id in the set, not the fifty on screen, and the
         payload and the cost are different. Ordered identically to the page so
         the set an operator selected is the set they were looking at. */
      const ids = this.#runQuery(plan.statements.ids(), tally).map((r) => r.bundle_id);
      out.ids = ids;
      out.truncated = ids.length >= IDS_MAX;
    }

    if (input.facets !== false && mode !== "count") {
      out.facets = this.#facetCounts(plan, tally, input.facetMode);
    }

    /* The affordance that makes AND safe. AND's failure mode is nothing found
       because of a typo or one word too many, which reads as "the system has
       nothing" when the truth is "nothing matches all of these". So a bare
       conjunction that returns zero is re-run as OR and the wider count is
       offered. It costs one extra query only in the case that already returned
       nothing. */
    out.widen = null;
    if (total === 0 && plan.widenable && input.widen !== false) {
      const or = compile({ ...input, implicitOp: "or" });
      const n = this.#runQuery(or.statements.count(), tally)[0]?.n ?? 0;
      if (n > 0) out.widen = { interpretation: "OR", total: n, q: String(input.q ?? ""),
                               detail: "no bundle matches all of these terms; this many match any of them" };
    }
    out.gate.applied = tally.applied;
    return out;
  }

  /** The fields the surface knows, so a UI can build its own controls from the
   *  plane's vocabulary rather than a copy of it that drifts. */
  searchFields() {
    return {
      fields: Object.fromEntries(Object.entries(FIELDS).map(([k, f]) =>
        [k, { type: f.type, freeText: !!f.fts, column: f.col }])),
      ftsColumns: FTS_COLUMNS, defaultFacets: DEFAULT_FACETS, idsMax: IDS_MAX,
      syntax: [
        "bare words are AND, ranked by relevance",
        "\"quoted phrase\" is one unit",
        "term* is a prefix match",
        "-term and NOT term exclude",
        "OR and parentheses nest",
        "field:value filters; free-text fields (title, locator, authority) match text, enumerations match exactly",
        "field:>value, field:<value, field:a..b compare and range",
        "has:field asks whether the field carries any value",
        "fm:path and fm:path=value reach frontmatter no column projects",
        "sort:field and sort:-field order the result",
      ],
    };
  }

  /** The verifier for the claim that the index cannot diverge from the corpus.
   *
   *  "Maintained in the same transaction" is a design, and a design is not a
   *  measurement. This re-derives the expected text row for every bundle from
   *  the stored files and compares it against what the index actually holds,
   *  which is the only thing that can tell the difference between an index that
   *  cannot diverge and one that has not diverged yet. Paginated and resumable
   *  by cursor, the same shape as the conformance audit. */
  searchIndexCheck({ after = "", limit = 200, viewer = null } = {}) {
    const cap = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200)));
    /* REC-30: every `findings` row NAMES a bundle, so the page it is derived
       from carries the D-15 predicate. `orphans` are index rowids no bundle
       claims — they name nothing by definition and stay whole, which is what
       makes the orphan check still worth running from any credential. */
    const gate = viewerPredicate(viewer);
    const rows = this.#rows(
      `SELECT b.bundle_id, b.fts_id FROM bundles b WHERE b.bundle_id > ? AND (${gate.sql}) ORDER BY b.bundle_id LIMIT ?`,
      after, ...gate.args, cap);
    const findings = [];
    for (const r of rows) {
      if (r.fts_id === null || r.fts_id === undefined) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_FTS_ID", detail: "the bundle has no text index key" });
        continue;
      }
      const have = this.#one(
        `SELECT ${FTS_COLUMNS.join(", ")} FROM bundles_fts WHERE rowid=?`, r.fts_id);
      if (!have) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_INDEX_ROW", ftsId: r.fts_id });
        continue;
      }
      const want = textOf(r.bundle_id, this.#filesOf(r.bundle_id));
      const bad = FTS_COLUMNS.filter((c) => String(have[c] ?? "") !== String(want[c] ?? ""));
      if (bad.length)
        findings.push({ bundleId: r.bundle_id, finding: "DIVERGED", columns: bad,
                        chars: Object.fromEntries(bad.map((c) => [c, [String(have[c] ?? "").length, String(want[c] ?? "").length]])) });
    }
    /* Orphans: an index row no bundle claims. It matters because fts_id is
       allocated as MAX+1, so an orphan can be inherited by a later bundle and
       hand it a deleted document's text. */
    const orphans = this.#rows(
      `SELECT rowid AS fts_id FROM bundles_fts WHERE rowid NOT IN (SELECT fts_id FROM bundles WHERE fts_id IS NOT NULL) LIMIT 100`)
      .map((r) => r.fts_id);
    const last = rows.length ? rows[rows.length - 1].bundle_id : null;
    return {
      checked: rows.length, findings, orphans,
      /* `bundles` and `keyed` are the totals of the enumeration above and are
         gated with it (REC-25: a total bigger than the pages says something is
         hidden). `indexed` counts INDEX rows, which is the substrate side of the
         parity this op exists to check and the number the orphan finding is read
         against — a count that names nothing is not identity. */
      counts: { bundles: this.#one(`SELECT count(*) c FROM bundles b WHERE (${gate.sql})`, ...gate.args).c,
                indexed: this.#one(`SELECT count(*) c FROM bundles_fts`).c,
                keyed: this.#one(`SELECT count(*) c FROM bundles b WHERE b.fts_id IS NOT NULL AND (${gate.sql})`,
                                 ...gate.args).c },
      cursor: rows.length === cap ? last : null,
      ok: findings.length === 0 && orphans.length === 0,
    };
  }

  /** The FACTS behind op=affordances (REC-19), and only the facts: what this
   *  object is, where its state machine stands, and which citation edges touch
   *  it — read with the SAME predicate retire's CITED guard runs (#citesInto),
   *  so the publication and the refusal cannot disagree. The DERIVATION (which
   *  acts those facts admit) happens at the control plane, where NEEDS and
   *  SESSION_OPS live; this method holds no copy of any act rule. */
  affordanceFacts({ target, viewer = null } = {}) {
    if (!target) return { ok: false, reason: "NO_TARGET",
      detail: "affordances are asked of an object: pass target=<bundle id>" };
    /* REC-25 / F-8: the D-15 viewer gate. An object the viewer may not see
       answers NO_SUCH_BUNDLE — the SAME shape a truly absent id answers, so
       the refusal discloses nothing. Fail closed on an absent viewer, exactly
       as the search path behaves. */
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.criticality FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    /* Edges INTO the target (who cites it), live and severed. */
    const citesIn = this.#citesInto(target);
    /* A project's OWN citation edges by status, from its document — the same
       source cite/sever read (the projection carries no status). */
    const citesOut = { confirmed: 0, severed: 0 };
    /* The document is read for a project's own edge statuses, and (REC-13) for
       the DECLARED object_type. `bundles.object_type` is the NORMALIZED type —
       promote projects it through normalizeType — so the row alone cannot
       answer a VOCABULARY question, and the derivation would consult the
       inquiry machine for a legacy focus document whose own machine has no
       `concluded` in it. That is precisely how a published act and the store's
       refusal come to disagree, which DEC-8 forbids. Reported as a separate
       fact rather than replacing object_type: membership questions still want
       the normalized answer. */
    const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    const docFm = md && md.content !== null ? (parseFrontmatter(md.content).data || {}) : {};
    /* THE MAP RULE (REC-31's chore 2, closing the residual REC-20 found). This
       is a MEMBERSHIP question — is this thing a project — so it goes through
       the catalog's normalizeType, never a raw key. The raw comparison was
       correct only by luck of there being no project alias TODAY: promote
       projects the type through the same map and the boot normaliser rewrites
       legacy rows, so `project` is what a row says now. But the alias table is
       exactly the mechanism by which a rename arrives (problem -> focus ->
       inquiry, twice already), and DATA-MODEL §2.7 measured what the last
       un-normalized consulting site cost — a third name meant editing every
       site that had not gone through the map. Through it, a fourth name is one
       catalog entry and zero edits here; a legacy-spelled project takes this
       arm and its own citation edges are counted, instead of silently
       reporting zero and unpublishing sever/reinstate on a project that has
       them. */
    if (normalizeType(b.object_type) === "project") {
      const refs = docFm.references;
      for (const r of (Array.isArray(refs) ? refs : []))
        if (r && typeof r === "object" && r.rel === "cites")
          citesOut[r.status === "severed" ? "severed" : "confirmed"]++;
    }
    return { ok: true, target: b.bundle_id, object_type: b.object_type,
             declared_type: typeof docFm.object_type === "string" ? docFm.object_type : b.object_type,
             current_state: b.current_state, criticality: b.criticality ?? null,
             cites_in: citesIn, cites_out: citesOut };
  }

  /* ---- S-10 step 5: selections ----
   *
   * KEEP-ALIVE, 300 seconds, refreshed on read. The same number and the same
   * shape as `leases`, deliberately: a Worker holds no connection, so a closed
   * tab is unobservable and the plane can only require proof of life. A view
   * that is still on screen keeps its selection alive by using it; one that is
   * gone stops paying. Bob's decision, 2026-07-25, explicitly provisional: only
   * operational experience will say whether 300s is right.
   */
  static SELECTION_TTL_MS = 300000;
  static SELECTION_MAX_ITEMS = 10000;   // an enumeration above this is REFUSED, never downgraded
  static SELECTION_MAX_PER_OWNER = 32;
  /* D-109. The task queue drains on the SAME Durable Object alarm the selection
     sweep uses: armed on enqueue, re-armed by the alarm while the queue is
     non-empty, self-terminating when it drains — the mechanism #armSweep proved
     for selections. DELAY is short so a burst of captures coalesces into one
     drain rather than one alarm apiece. BACKSTOP is longer and used when a tick
     drained nothing: every remaining event is then a capture not yet filed in a
     bundle (taskDrain keeps those, it does not drop them), and retrying that at
     the short cadence would be a hot loop against work that only a later promote
     can unblock. BATCH bounds one tick; a deeper backlog re-arms and continues.
     DELAY is overridable per instance through TASK_DRAIN_DELAY_MS: production
     takes the short default, and a test that drives the consumer by hand pushes
     the automatic one out of its own window so the two never race on the clock. */
  static TASK_DRAIN_DELAY_MS = 1000;
  static TASK_DRAIN_BACKSTOP_MS = 60000;
  static TASK_DRAIN_ALARM_BATCH = 200;

  #drainDelayMs() {
    const v = Number(this.env && this.env.TASK_DRAIN_DELAY_MS);
    return Number.isFinite(v) && v >= 0 ? v : Store.TASK_DRAIN_DELAY_MS;
  }

  /* REC-5 / D-122: how the SCHEDULED connection-derive sweep is paced and bounded.
     DELAY_MS is deliberately far larger than the drain's second-scale cadence:
     connections are a projection nobody is blocking on, deriving them a minute
     after a resolve is well inside "eventually" for a civic record, and a slack
     delay keeps the sweep off the resolve hot path. It is a tactical cadence, not
     a doctrine — reversible by editing this one constant — and it sits between the
     drain's 60s backstop and the selection TTL, so the alarm the resolve arms
     never fires inside another suite's sub-second wall-time (the flakiness the
     drain suite pins TASK_DRAIN_DELAY_MS out of its window to avoid). Overridable
     by a binding for exactly that reason: a test pins it far out to drive onAlarm
     by hand, or short to prove the real alarm fires. BATCH bounds the entities one
     tick derives; more than that and the wake stays non-null so the next tick
     drains the rest — bounded per tick, self-terminating overall. */
  static CONNECTION_DERIVE_DELAY_MS = 60000;
  static CONNECTION_DERIVE_BATCH = 100;

  #connectionDeriveDelayMs() {
    const v = Number(this.env && this.env.CONNECTION_DERIVE_DELAY_MS);
    return Number.isFinite(v) && v >= 0 ? v : Store.CONNECTION_DERIVE_DELAY_MS;
  }
  /* Overridable like the delay so a suite can pin the batch to 1 and PROVE the
     sweep is bounded per tick and drains a larger dirty-set across several
     self-re-arming ticks rather than in one full-store pass. */
  #connectionDeriveBatch() {
    const v = Number(this.env && this.env.CONNECTION_DERIVE_BATCH);
    return Number.isFinite(v) && v >= 1 ? Math.floor(v) : Store.CONNECTION_DERIVE_BATCH;
  }

  /* Stamp an entity into the connection-derive dirty-set so the scheduled sweep
     picks it up. Keyed by entity_id, so re-stamping the same entity is one row:
     the set is bounded by the count of DISTINCT changed entities, never by the
     number of resolutions that touched them. Runs inside the caller's resolve
     transaction, so a resolution and the dirt it produces commit atomically. */
  #stampConnectionDirty(entityId) {
    if (typeof entityId !== "string" || !entityId) return;
    this.sql.exec(
      `INSERT INTO connection_dirty (entity_id, stamped_at) VALUES (?, ?)
       ON CONFLICT(entity_id) DO UPDATE SET stamped_at=excluded.stamped_at`,
      entityId, new Date().toISOString());
  }

  /* The connection-derive sweep's tick body: derive connections for a BOUNDED
     batch of dirty entities, then clear each from the set. deriveConnections is
     idempotent (it UPSERTS by the FW-8 connection key), so re-deriving an entity
     is a no-op on the second run and the sweep is safe to re-run. Derive-then-
     delete in that order means a crash between the two leaves the entity dirty and
     it is simply re-derived next tick — the safe failure direction (re-derive, not
     skip). The whole body is synchronous (deriveConnections uses transactionSync),
     so no resolve can interleave between reading the batch and clearing it. */
  #deriveConnectionsSweep() {
    const batch = this.#rows(
      `SELECT entity_id FROM connection_dirty ORDER BY stamped_at, entity_id LIMIT ?`,
      this.#connectionDeriveBatch());
    const swept = [];
    for (const { entity_id } of batch) {
      const r = this.deriveConnections({ entityId: entity_id, assertedBy: "system" });
      this.sql.exec(`DELETE FROM connection_dirty WHERE entity_id=?`, entity_id);
      swept.push({ entity_id, connections: r && r.ok ? r.count : 0 });
    }
    const remaining = this.#one(`SELECT count(*) c FROM connection_dirty`).c;
    return { entities: swept.length, remaining, swept };
  }

  /* The producer-side arm for the connection-derive consumer: a resolve that
     dirtied an entity reconciles the alarm to include the sweep's wake. Mirrors
     #armSweep / #armDrain — it only SCHEDULES, it never derives, so the
     producer/consumer split holds (the sweep is the sole writer of connections on
     this path). */
  async #armConnectionDerive() { return await this.#armScheduler(); }
  /* MEASURED, and lower than SQLite's documented default by two orders of
     magnitude: workerd refuses a statement binding more than about 100
     variables. Binary-searched through this exact code path on 2026-07-25, where
     the largest id list that compiled was 99, with the gate, ranking and limit
     arguments sharing the same budget. 64 leaves headroom for arguments a future
     CTE arm adds without silently reintroducing the failure. Found by the scale
     bench and not by the suite, because no test had ever enumerated more than a
     handful of ids; test/selection.test.mjs now crosses the boundary on purpose. */
  static SELECTION_ID_CHUNK = 64;

  /* Citing writes one frontmatter entry per cited record into a single
     bundle.md, so the number of edges a Project can carry is bounded by
     INLINE_MAX and NOT by SELECTION_MAX_ITEMS. The two were set independently
     and they collide: a maximum legal enumeration of 10,000 produces a
     1,070,846-byte document against a 1,048,576-byte ceiling. MEASURED at 83
     bytes per edge for the reference block at a 25-character bundle id
     (2026-07-25, test/cite-scale.mjs); used only to tell an operator roughly how
     many would fit, never to decide the refusal, which is made on the real
     encoded length. */
  static CITE_EDGE_BYTES = 83;
  /* How many ids a Session Log entry names before it summarises. Bounded for
     the same reason the audit bounds its offender list. */
  static CITE_LOG_SAMPLE = 20;

  #sweepSelections() {
    const now = new Date().toISOString();
    const dead = this.#rows(`SELECT handle FROM selections WHERE expires < ?`, now).map((r) => r.handle);
    for (const h of dead) {
      this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, h);
      this.sql.exec(`DELETE FROM selections WHERE handle=?`, h);
    }
    return dead.length;
  }

  /* ==================================================================
   *  THE SCHEDULER (REC-1, milestone M1, RECORD).
   *
   *  DECISION — recorded in full in docs/development/SCHEDULER.md and
   *  summarised here because the second and third periodic consumers inherit
   *  it. The plane's periodic work runs on ONE reconciling Durable Object
   *  alarm, NOT on a Worker cron trigger. Three properties decided it, and a
   *  cron loses all three:
   *
   *    1. GRANULARITY. A cron trigger's floor is one minute; the task drain
   *       already coalesces at one SECOND (TASK_DRAIN_DELAY_MS). A cron could
   *       not serve that consumer, so it would be a SECOND scheduler beside the
   *       alarm rather than a replacement — the exact per-consumer sprawl REC-1
   *       exists to end. One mechanism serves both sub-second and multi-hour
   *       cadences; two mechanisms is the thing to avoid.
   *    2. SELF-TERMINATION. The alarm is deleted when nothing is pending, so an
   *       idle instance carries no timer and costs nothing. A cron fires the
   *       Worker every minute forever, awake or not — a standing cost on every
   *       sovereign instance, most of them on the Free tier the installer
   *       targets, where invocations are budgeted (D-118 / CPDF-7).
   *    3. LOCALITY. Every consumer — the sweep and drain here, and the
   *       monitoring, archive-fallback eligibility, per-document cadence and M4
   *       ageing clocks still to come — reconciles against the DO's own SQLite.
   *       A cron at the Worker would have to hop into the DO anyway; the
   *       periodic actor belongs next to its state, where the reconciling alarm
   *       already lives.
   *
   *  MECHANISM. A registry (#schedConsumers) of consumers, each a small
   *  { name, due, wake, tick }:
   *    - onAlarm runs tick() for every consumer DUE at the firing instant, then
   *      reconciles the single alarm to the EARLIEST wake() any consumer still
   *      wants, deleting it when none does (self-terminating).
   *    - a producer that created work arms via #armScheduler, reconciling the
   *      same way but only ever pulling the alarm EARLIER, so a sooner wake set
   *      by another consumer is never lost.
   *  The reconcile keeps EVERY active consumer's wake, not just the one that
   *  just ran — that is what stops a fast consumer from starving a slow one:
   *  when the fast consumer idles, the slow one's wake is still in the set and
   *  still re-arms the alarm. Reconcile over only the consumers that just ticked
   *  and the slow one is dropped the instant the fast one idles; that is the
   *  negative control in test/scheduler.test.mjs, and it names the victim.
   *
   *  Two REAL consumers are MOVED onto the mechanism as proof — RECORD's
   *  selection sweep and CAP-2's D-109 task drain — but their bodies
   *  (#sweepSelections, taskDrain) are UNCHANGED: they only register a tick and
   *  a wake. New consumers register the same way and inherit reconciliation and
   *  self-termination for free, which is the whole reason to decide this once.
   * ================================================================== */
  static SCHED_GRACE_MS = 250;   // an alarm may fire a hair early; run a consumer due within this window
  #lastDrainProgress = true;     // did the last drain tick make progress — decides DELAY vs BACKSTOP on re-arm

  /* The consumer registry. The two REAL consumers are ALWAYS due when the alarm
     fires (`due: () => now`): they are cheap and a no-op on an empty subject, so
     running them on any wake costs a bounded count and preserves the exact
     pre-REC-1 behaviour the task-drain and selection suites pin. An INTERVAL
     consumer (the env-gated test probes, and the future clocks) is due only at
     its own anchored `next`, so it fires at its OWN cadence and no other's —
     which is the property the reconcile has to protect. */
  #schedConsumers(probe) {
    const reg = [
      { name: "selection-sweep",
        due:  (now) => now,
        wake: (now) => this.#one(`SELECT count(*) c FROM selections`).c > 0
                         ? now + Store.SELECTION_TTL_MS + 30000 : null,
        tick: ()    => ({ swept: this.#sweepSelections() }) },
      { name: "task-drain",
        due:  (now) => now,
        wake: (now) => this.#one(`SELECT count(*) c FROM task_queue`).c > 0
                         ? now + (this.#lastDrainProgress ? this.#drainDelayMs() : Store.TASK_DRAIN_BACKSTOP_MS)
                         : null,
        tick: ()    => { const d = this.taskDrain({ limit: Store.TASK_DRAIN_ALARM_BATCH, actor: "alarm" });
                         this.#lastDrainProgress = d.drained > 0; return { drain: d }; } },
      /* CAP-3 (CAPTURE, appended here under CONDUCT's authorisation while RECORD
         is dormant). The archive-fallback MONITORING consumer: it fires the
         built-but-idle fallback for documents that have become fallback_eligible.
         It is a pure clock gated on pending work — `wake` is null unless
         monitoring is configured AND a failing document could still reach the
         threshold, so an unconfigured or idle instance holds no alarm exactly as
         before. Its `tick` is ASYNC (it does a governed archive fetch through
         op=acquire); onAlarm awaits it. Bodies and rationale live beside the
         reachability code, this is only its registration. */
      { name: "archive-monitor",
        due:  (now) => now,
        wake: (now) => this.#monitorPending() ? now + this.#monitorTickMs() : null,
        tick: (now) => this.#monitorTick(now) },
      /* REC-5 / D-122: the CONNECTION-DERIVE sweep. Closes the gap where op=connect
         was a manual mutation nothing called, so the entity axis stayed empty. It
         is due on any wake (cheap, and a no-op on an empty dirty-set, exactly like
         the two originals), and its WAKE is null unless the dirty-set has pending
         entities — so an instance with nothing to derive holds no alarm and the
         consumer self-terminates. Each tick derives a BOUNDED batch and clears it;
         while more remain the count stays > 0 and the wake re-arms for the next
         tick, so the sweep drains progressively rather than re-deriving the whole
         store at once. The derivation stamps asserted_by 'system' (deriveConnections'
         default): a scheduled derivation is a MACHINE act, never a member's. */
      { name: "connection-derive",
        due:  (now) => now,
        wake: (now) => this.#one(`SELECT count(*) c FROM connection_dirty`).c > 0
                         ? now + this.#connectionDeriveDelayMs() : null,
        tick: ()    => ({ connderive: this.#deriveConnectionsSweep() }) },
      /* REC-8 (CONSTRUCTS Step 7, AGEING): the OVERDUE-SUCCESSOR scan — the SECOND framework
         consumer on this alarm. It is the record's PROACTIVE noticing of a temporal expectation
         coming due (FW-8 gave each stage a `within_interval`; nothing checked it). It writes
         NOTHING — the overdue findings are DERIVED ON READ in op=proposals (an overdue flag goes
         stale against the clock, so there is no overdue table). This consumer is the PUSH SIGNAL:
         its WAKE is the EARLIEST FUTURE deadline across all instances, so the alarm fires exactly
         when the next required successor tips past its deadline, and SELF-TERMINATES (wake null)
         when no future deadline remains — an instance with no dated predecessor, no parseable
         interval, or nothing threaded holds no alarm. It does NOT mint a task/focus per overdue
         instance (D-79 don't-drown; escalation is DEC-10, Bob's). Uses the firing instant `now`,
         the virtual clock a suite drives onAlarm(now) with, exactly as the other consumers do.
         DEFERRED and flagged (D-86, the other half): bias-debt — a decayed bias measure is the
         SAME shape (an obligation with a clock, blocking a state transition, settleable in batches),
         and rides THIS consumer shape later with a different producer. REC-8 builds only the temporal
         half; a bias-debt sweep would register beside overdue-scan and inherit the reconcile. */
      { name: "overdue-scan",
        due:  (now) => now,
        wake: (now) => this.#overdueScan(now).next_deadline,
        tick: (now) => ({ overduescan: this.#overdueScan(now) }) },
      /* REC-21 / P-87: the QUEUE RE-NOTIFY consumer, and it is here rather than
         anywhere else because P-87 is a rule about WHERE the interval comes
         from. "Re-notify at the stage's OWN declared interval, never a global
         one" is satisfied structurally: this consumer holds NO constant. Its
         wake is the earliest instant a member's own snooze expires, read from
         queue_state; the interval of a FINDING that keeps coming due is the
         overdue-scan consumer's business and is read from the STAGE's declared
         `within_interval` there. Two consumers, each on its own cadence,
         reconciled by the one alarm — which is precisely the property REC-1's
         registry exists to protect and the reason a global re-notify timer was
         forbidden.
         It WRITES NOTHING (the overdue-scan precedent): the queue is derived on
         read, so a snooze expiring changes nothing in the store — it changes
         only when the alarm next fires, which is what a push signal is. And it
         SELF-TERMINATES: no future snooze, no wake, no alarm. */
      { name: "queue-renotify",
        /* DUE only when a snooze has actually EXPIRED, not on every wake. The
           two original consumers are always-due because they are cheap no-ops on
           an empty subject; this one has a real subject and a real answer, so it
           fires at its own moment and no other's — the INTERVAL-consumer shape
           the reconcile exists to protect. */
        due:  (now) => this.#queueRenotifyExpired(now) > 0 ? now : null,
        wake: (now) => this.#queueRenotifyWake(now),
        tick: (now) => ({ queuerenotify: { expired: this.#queueRenotifyExpired(now),
                                           next: this.#queueRenotifyWake(now) } }) },
    ];
    for (const name of Object.keys(probe || {})) {
      const st = probe[name];
      reg.push({
        name,
        due:  () => st.remaining > 0 ? st.next : null,
        wake: () => st.remaining > 0 ? st.next : null,
        tick: (now) => { st.fires.push(now); st.remaining -= 1;
                         st.next = st.remaining > 0 ? st.next + st.period : null;
                         return { probe: name }; } });
    }
    return reg;
  }

  /* `alarm()` is the reserved handler workerd invokes; it cannot be called over
     RPC or in a unit test, so its whole body is `onAlarm`, which the suites
     drive directly. The reserved entry is a one-line forward with nothing of its
     own to break. onAlarm takes an explicit `now` so a suite can drive a pinned
     virtual clock (following the reconciled `nextAt` exactly as workerd would);
     workerd calls it with the default wall clock. */
  async alarm() { await this.onAlarm(); }

  async onAlarm(now = Date.now()) {
    const probe = await this.#probeState(now);
    const reg = this.#schedConsumers(probe);
    const grace = Store.SCHED_GRACE_MS;
    let swept = 0, drain = null, monitor = null, connderive = null, overduescan = null,
        queuerenotify = null; const probes = [];
    for (const c of reg) {
      const d = c.due(now);
      if (d === null || d > now + grace) continue;
      /* Awaited so an ASYNC consumer's work COMPLETES inside the alarm. The two
         original consumers return synchronously, and awaiting a plain value is a
         no-op, so this is a strict generalisation for the async consumers REC-1
         foresaw ("the monitoring, archive-fallback eligibility ... clocks still
         to come") — not a reshape of the mechanism. */
      const r = await c.tick(now);
      if (c.name === "selection-sweep") swept = r.swept;
      else if (c.name === "task-drain") drain = r.drain;
      else if (c.name === "archive-monitor") monitor = r && r.monitor;
      else if (c.name === "connection-derive") connderive = r && r.connderive;
      else if (c.name === "overdue-scan") overduescan = r && r.overduescan;
      /* REC-21 / P-87. Named explicitly rather than falling through to `probes`:
         an unnamed consumer would be reported as a test probe, which is how a
         real clock disappears from the alarm's own account of itself. */
      else if (c.name === "queue-renotify") queuerenotify = r && r.queuerenotify;
      else probes.push(c.name);
    }
    /* Reconcile over the FULL registry, not just the consumers that ticked, and
       AUTHORITATIVELY (`exact`): a fired alarm is spent, so onAlarm sets the
       fresh earliest wake rather than only pulling an existing one earlier.
       NEGATIVE CONTROL (see test/scheduler.test.mjs): pass a due-filtered subset
       here instead of `reg` and a waiting consumer is starved the moment the
       consumer sharing its window idles. */
    const nextAt = await this.#reconcileAlarm(now, reg, true);
    if (probe) await this.ctx.storage.put("sched_probe", probe);
    const d = drain || { drained: 0, created: [], folded: [], refused: [], waiting: [], remaining: 0 };
    return { swept, drained: d.drained, created: d.created.length,
             folded: d.folded.length, refused: d.refused.length,
             waiting: d.waiting.length, remaining: d.remaining,
             rearmed: nextAt !== null, nextAt, probes,
             ...(monitor ? { monitor } : {}),
             ...(connderive ? { connderive } : {}),
             ...(overduescan ? { overduescan } : {}),
             ...(queuerenotify ? { queuerenotify } : {}) };
  }

  /* Reconcile the single alarm to the EARLIEST wake ANY active consumer wants,
     and never push a sooner one later. Nothing pending deletes the alarm — the
     exact invariant (no pending work, no pending alarm) that makes every
     consumer self-terminate on an idle instance rather than spin. Post-fire the
     alarm is already cleared, so `exact` sets the fresh minimum; on an arm the
     pull-earlier test preserves a sooner wake another consumer set. `exact` is
     what makes the mechanism correct even where a caller (a unit-test driver, or
     a runtime that does not pre-clear) has not cleared the spent alarm — onAlarm
     owns the alarm after a fire and states the new earliest outright. */
  async #reconcileAlarm(now, reg, exact = false) {
    const wants = [];
    for (const c of reg) { const w = c.wake(now); if (w !== null) wants.push(w); }
    if (!wants.length) { await this.ctx.storage.deleteAlarm(); return null; }
    const want = Math.min(...wants);
    if (exact) { await this.ctx.storage.setAlarm(want); return want; }
    const at = await this.ctx.storage.getAlarm();
    if (at === null || at > want) await this.ctx.storage.setAlarm(want);
    return await this.ctx.storage.getAlarm();
  }

  /* The producer-side arm: a consumer that just created work reconciles the
     alarm to include its wake, pulling it earlier if needed and never later.
     Arming never writes work — it only schedules — so the producer/consumer
     split D-109 relies on stays intact. */
  async #armScheduler(now = Date.now()) {
    const probe = await this.#probeState(now);
    const reg = this.#schedConsumers(probe);
    const at = await this.#reconcileAlarm(now, reg);
    if (probe) await this.ctx.storage.put("sched_probe", probe);
    return at;
  }

  /* The two producers keep their names and call sites — selectionCreate arms
     through #armSweep, taskEnqueue through #armDrain — but both now route
     through the one reconcile, so a selection's wake and a drain's wake are
     always weighed together rather than by two hand-written arms. #armDrain
     resets the progress flag so a fresh enqueue coalesces at the short DELAY. */
  async #armSweep() { return await this.#armScheduler(); }
  async #armDrain() { this.#lastDrainProgress = true; return await this.#armScheduler(); }

  /* ---- env-gated scheduler test seam (inert unless SCHED_PROBE is set) ------
     A probe is a synthetic INTERVAL consumer used only to exercise the registry
     with two independent, pinnable cadences and to detect starvation by name.
     In production SCHED_PROBE is unset, #probeState returns null before touching
     storage, and not one line below runs — the two real consumers are the whole
     registry. State lives in a `sched_probe` KV value, not a schema table, so it
     needs no purge entry and no migration. */
  #probeSpecs() {
    try { const s = JSON.parse((this.env && this.env.SCHED_PROBE) || "[]"); return Array.isArray(s) ? s : []; }
    catch { return []; }
  }
  async #probeState(now = Date.now()) {
    const specs = this.#probeSpecs();
    if (!specs.length) return null;
    let st = await this.ctx.storage.get("sched_probe");
    if (!st) {
      st = {};
      for (const s of specs)
        st[s.name] = { period: s.period, remaining: s.fires, next: now + s.period, fires: [] };
      await this.ctx.storage.put("sched_probe", st);
    }
    return st;
  }
  /* RPC entries for the suite, mirroring how the task-drain suite drives onAlarm
     directly: arm the probes (initialise from SCHED_PROBE, then reconcile) and
     read back what fired and when. */
  async schedProbeArm(now = Date.now()) { return await this.#armScheduler(now); }
  async schedProbeLog() { return (await this.ctx.storage.get("sched_probe")) || {}; }
  async schedAlarmAt() { return await this.ctx.storage.getAlarm(); }

  static #digestOf(ids) {
    /* A cheap order-sensitive digest. It answers "is this the same ordered set"
       and nothing else, which is exactly what a query selection needs and all it
       can afford at O(1) storage. */
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (const s of ids) for (let i = 0; i < s.length; i++) {
      h1 = Math.imul(h1 ^ s.charCodeAt(i), 0x01000193) >>> 0;
      h2 = Math.imul(h2 + s.charCodeAt(i) + i, 0x85ebca6b) >>> 0;
    }
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }

  /** Create a selection. `kind` is decided by what the caller supplied, not by
   *  size: an explicit id list is an enumeration, a bare query is a query
   *  selection. Bob settled that select-all means the query, 2026-07-25. */
  async selectionCreate({ q = "", viewer = null, owner = null, sort = null, dir = null,
                          ids = null, kind = null } = {}) {
    if (!owner) return { ok: false, reason: "NO_OWNER", detail: "a selection is owned by the credential that made it" };
    this.#sweepSelections();
    const wanted = kind || (Array.isArray(ids) && ids.length ? "enumerated" : "query");
    if (wanted !== "query" && wanted !== "enumerated")
      return { ok: false, reason: "BAD_KIND", detail: "a selection is 'query' or 'enumerated'" };

    const tally = { applied: 0 };
    let members = [];
    if (wanted === "enumerated") {
      const list = [...new Set((ids || []).map(String))];
      if (!list.length) return { ok: false, reason: "EMPTY", detail: "an enumerated selection needs at least one id" };
      if (list.length > Store.SELECTION_MAX_ITEMS)
        return { ok: false, reason: "TOO_LARGE", limit: Store.SELECTION_MAX_ITEMS, got: list.length,
                 detail: "an enumeration this large is refused rather than quietly turned into a query selection, "
                       + "because that would change what the operator's click meant. Select by query instead." };
      /* Chunked, because SQLite bounds how many variables one statement binds.
         Every chunk still goes through compile() and therefore through the
         viewer gate: an id the viewer may not see never enters the selection. */
      for (let i = 0; i < list.length; i += Store.SELECTION_ID_CHUNK) {
        const plan = compile({ q, viewer, sort, dir, ids: list.slice(i, i + Store.SELECTION_ID_CHUNK) });
        members.push(...this.#runQuery(plan.statements.snapshot(), tally));
      }
    } else {
      const plan = compile({ q, viewer, sort, dir });
      members = this.#runQuery(plan.statements.snapshot(), tally);
    }

    const handle = "sel-" + Store.#rand(12);
    const now = new Date();
    const rec = {
      handle, owner, kind: wanted, q: String(q ?? ""),
      sort_field: sort || null, sort_dir: dir || null,
      created: now.toISOString(), touched: now.toISOString(),
      expires: new Date(now.getTime() + Store.SELECTION_TTL_MS).toISOString(),
      n: members.length, digest: Store.#digestOf(members.map((m) => m.bundle_id)),
    };
    this.ctx.storage.transactionSync(() => {
      /* Over the per-owner cap, the OLDEST is collected rather than the new one
         refused. A selection is derived and losing one costs a click, so
         refusing a member's current action to preserve a stale one is the wrong
         trade. */
      const mine = this.#rows(`SELECT handle FROM selections WHERE owner=? ORDER BY created`, owner);
      for (const old of mine.slice(0, Math.max(0, mine.length + 1 - Store.SELECTION_MAX_PER_OWNER))) {
        this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, old.handle);
        this.sql.exec(`DELETE FROM selections WHERE handle=?`, old.handle);
      }
      this.sql.exec(
        `INSERT INTO selections (handle,owner,kind,q,sort_field,sort_dir,created,touched,expires,n,digest)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        rec.handle, rec.owner, rec.kind, rec.q, rec.sort_field, rec.sort_dir,
        rec.created, rec.touched, rec.expires, rec.n, rec.digest);
      /* A query selection stores NO items. The criterion is the intent, so the
         current answer to it is the correct set, and the digest is enough to
         say whether it moved. */
      if (rec.kind === "enumerated")
        members.forEach((m, i) => this.sql.exec(
          `INSERT INTO selection_items (handle,ord,bundle_id,bundle_sha) VALUES (?,?,?,?)`,
          rec.handle, i, m.bundle_id, m.bundle_sha));
    });
    await this.#armSweep();
    return { ok: true, handle: rec.handle, kind: rec.kind, n: rec.n, q: rec.q,
             expires: rec.expires, ttlSeconds: Store.SELECTION_TTL_MS / 1000,
             gate: { applied: tally.applied } };
  }

  /* How a revision is classified. The manifest already records who wrote a
     revision and what operation they claimed, so a monitor tick can be told
     apart from a member rewriting the analysis without inventing a second
     record of the same fact. */
  #revisionKind(bundleId) {
    const m = this.#one(
      `SELECT writer, operation FROM manifest WHERE bundle_id=? ORDER BY created DESC, snap_key DESC LIMIT 1`, bundleId);
    if (!m) return { class: "unknown" };
    return m.writer === "mechanical"
      ? { class: "mechanical", operation: m.operation || null }
      : { class: "authored" };
  }

  /** Resolve a selection to its current membership, with a drift report.
   *
   *  `weight` is the ACTION's weight, and it decides what drift means:
   *    report   the action proceeds and says what moved. Citing Information in
   *             a Project is this: the operator's intent survives a source
   *             having been re-captured.
   *    refuse   the action stops and the operator looks again. Anything that
   *             changes state is this, because a state transition landing on a
   *             set the operator did not see is exactly the accountability
   *             failure the record exists to prevent.
   *  Bob's decision, 2026-07-25. */
  selectionResolve({ handle, viewer = null, owner = null, weight = "report" } = {}) {
    this.#sweepSelections();
    const sel = this.#one(`SELECT * FROM selections WHERE handle=?`, handle);
    if (!sel) return { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" };
    /* Ownership is enforced, not inferred from the handle being hard to guess.
       A capability that is only protected by being unguessable is protected by
       nothing once it appears in a log. */
    if (!owner || sel.owner !== owner)
      return { ok: false, reason: "NOT_YOURS", detail: "a selection is readable only by the credential that made it" };

    const now = new Date();
    this.sql.exec(`UPDATE selections SET touched=?, expires=? WHERE handle=?`,
      now.toISOString(), new Date(now.getTime() + Store.SELECTION_TTL_MS).toISOString(), handle);

    const tally = { applied: 0 };
    const drift = { revised: [], purged: [], hidden: [], added: 0, removed: 0, kind: sel.kind };
    let members;

    if (sel.kind === "enumerated") {
      const stored = this.#rows(
        `SELECT ord, bundle_id, bundle_sha FROM selection_items WHERE handle=? ORDER BY ord`, handle);
      /* Re-run through the compiler with the CURRENT viewer, so an item the
         viewer may no longer see leaves the selection. This is not a courtesy:
         a frozen selection that preserved access past a revocation would be a
         visibility leak that outlives the revocation. */
      const visible = new Map();
      const idList = stored.map((r) => r.bundle_id);
      for (let i = 0; i < idList.length; i += Store.SELECTION_ID_CHUNK) {
        const plan = compile({ q: "", viewer, sort: sel.sort_field, dir: sel.sort_dir, ids: idList.slice(i, i + Store.SELECTION_ID_CHUNK) });
        for (const r of this.#runQuery(plan.statements.snapshot(), tally)) visible.set(r.bundle_id, r.bundle_sha);
      }
      members = [];
      for (const s of stored) {
        if (!visible.has(s.bundle_id)) {
          const exists = this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, s.bundle_id);
          (exists ? drift.hidden : drift.purged).push(s.bundle_id);
          continue;
        }
        const nowSha = visible.get(s.bundle_id);
        if (nowSha !== s.bundle_sha)
          drift.revised.push({ bundleId: s.bundle_id, was: s.bundle_sha, now: nowSha, ...this.#revisionKind(s.bundle_id) });
        members.push({ bundle_id: s.bundle_id, bundle_sha: nowSha });
      }
      drift.removed = drift.purged.length + drift.hidden.length;
      /* Never added. The operator picked items, not a criterion, so a bundle
         that started matching is not something they asked for. */
    } else {
      const plan = compile({ q: sel.q, viewer, sort: sel.sort_field, dir: sel.sort_dir });
      members = this.#runQuery(plan.statements.snapshot(), tally);
      const digest = Store.#digestOf(members.map((m) => m.bundle_id));
      if (digest !== sel.digest) {
        drift.added = Math.max(0, members.length - sel.n);
        drift.removed = Math.max(0, sel.n - members.length);
        drift.digestChanged = true;
        /* A query selection stores no items, so it can say the set moved and by
           how much, and cannot say which rows moved. That is the cost of O(1)
           storage and it is the right thing to lose: the criterion is the
           intent, so the current answer is the correct set. */
        drift.detail = "the criterion now answers differently; which rows moved is not recoverable "
                     + "because a query selection stores the criterion rather than the rows";
      }
    }

    const moved = drift.revised.length + drift.removed + drift.added > 0;
    const stopped = moved && weight === "refuse";
    return {
      ok: !stopped, handle, kind: sel.kind, q: sel.q, owner: sel.owner,
      n: members.length, snapshotN: sel.n, weight, moved,
      ...(stopped ? { reason: "SET_MOVED",
                      detail: "this action changes state, so it will not run against a set that moved "
                            + "since it was selected. Look at the selection again and re-select." } : {}),
      drift, members: stopped ? [] : members.map((m) => m.bundle_id),
      expires: new Date(now.getTime() + Store.SELECTION_TTL_MS).toISOString(),
      gate: { applied: tally.applied },
    };
  }

  selectionList({ owner = null } = {}) {
    this.#sweepSelections();
    if (!owner) return { ok: false, reason: "NO_OWNER" };
    return {
      ok: true, ttlSeconds: Store.SELECTION_TTL_MS / 1000,
      selections: this.#rows(
        `SELECT handle, kind, q, n, created, touched, expires FROM selections WHERE owner=? ORDER BY created DESC`, owner),
      caps: { maxItems: Store.SELECTION_MAX_ITEMS, maxPerOwner: Store.SELECTION_MAX_PER_OWNER },
      bytes: this.#one(`SELECT COALESCE(SUM(length(bundle_id)+length(bundle_sha)+8), 0) b FROM selection_items`).b,
    };
  }

  selectionRelease({ handle = null, owner = null } = {}) {
    if (!owner) return { ok: false, reason: "NO_OWNER" };
    const sel = handle ? this.#one(`SELECT owner FROM selections WHERE handle=?`, handle) : null;
    if (handle && (!sel || sel.owner !== owner)) return { ok: false, reason: "NOT_YOURS" };
    const before = this.#one(`SELECT count(*) c FROM selections WHERE owner=?`, owner).c;
    this.ctx.storage.transactionSync(() => {
      if (handle) {
        this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, handle);
        this.sql.exec(`DELETE FROM selections WHERE handle=?`, handle);
      } else {
        for (const r of this.#rows(`SELECT handle FROM selections WHERE owner=?`, owner))
          this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, r.handle);
        this.sql.exec(`DELETE FROM selections WHERE owner=?`, owner);
      }
    });
    return { ok: true, released: before - this.#one(`SELECT count(*) c FROM selections WHERE owner=?`, owner).c };
  }

  /* Facet counts, two ways, because which is faster is a measurement (D-32).
   *
   *   scan     ONE statement returning the facet columns of every row in scope,
   *            tallied into a hash map per field here. No aggregation and no
   *            sort in SQLite. Cost tracks the number of rows in scope.
   *   groupby  the compound UNION ALL of GROUP BY arms. SQLite aggregates and
   *            sorts; cost tracks rows scanned plus a sort per field, and the
   *            RESULT is bounded by distinct values rather than by rows.
   *
   * `scan` is the default because the bench measures it faster on every shape at
   * 20,000 bundles, most decisively on the sidebar over the whole corpus, which
   * was the worst shape in the release. Both are kept and both are asserted to
   * agree exactly in test/search.test.mjs: an optimisation that disagrees with
   * the thing it replaces is not an optimisation, and this is the same standard
   * op=audit is held to against an outside pass.
   */
  static FACET_MODE_DEFAULT = "scan";

  #facetCounts(plan, tally, mode) {
    const use = mode === "groupby" || mode === "scan" ? mode : Store.FACET_MODE_DEFAULT;
    const out = Object.fromEntries(plan.facetFields.map((f) => [f, []]));
    if (!plan.facetFields.length) return out;

    if (use === "groupby") {
      for (const stmt of plan.statements.facets())
        for (const r of this.#runQuery(stmt, tally))
          (out[r.field] ||= []).push({ value: r.value, n: r.n });
      return out;
    }

    const stmt = plan.statements.facetScan();
    if (!stmt) return out;
    const rows = this.#runQuery(stmt, tally);
    const cols = plan.facetCols;
    const tallies = plan.facetFields.map(() => new Map());
    for (const row of rows) {
      for (let i = 0; i < cols.length; i++) {
        const v = row[cols[i]];
        /* NULL is absence, not a value, and the GROUP BY form excludes it with
           `IS NOT NULL`. Excluded here too, or the two forms would disagree and
           the agreement assertion would be measuring nothing. */
        if (v === null || v === undefined) continue;
        const m = tallies[i];
        m.set(v, (m.get(v) || 0) + 1);
      }
    }
    /* Same order the GROUP BY form emits: count descending, then value
       ascending, so a sidebar is stable and the two forms compare equal. */
    plan.facetFields.forEach((name, i) => {
      out[name] = [...tallies[i].entries()]
        .map(([value, n]) => ({ value, n }))
        .sort((a, b) => b.n - a.n || (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
    });
    return out;
  }

  /* ---- the first STATE-CHANGING actions to refer to a selection ----
   *
   * SEVERING and REINSTATING a citation, both at weight `refuse`.
   *
   * `cite` shipped in 0.18.0 at weight `report` and left the refusing arm of
   * `selectionResolve` with no caller. These are its first, and they are the
   * right ones for two reasons. They genuinely change recorded state, so drift
   * must stop them: a state transition landing on a set the operator did not see
   * is the accountability failure the record exists to prevent. And they close a
   * hole `cite` opened, because until now an edge could be created and never
   * withdrawn, which makes a citation list an accumulation rather than a record
   * of what the group currently relies on.
   *
   * SEVERING IS NOT DELETION. The edge stays, with its target and rel intact,
   * and only its status changes. That is the same doctrine that greys a
   * dismissed Problem rather than removing it, and it is what makes a severance
   * auditable: a reader can see that the group once relied on this and stopped,
   * and why.
   *
   * A REASON IS REQUIRED by both. The catalog's own remediation for a bad edge
   * is "sever with reason" (C-6.1) and State Rules 5.1 has a human confirming or
   * severing what an agent proposed. A severance with no reason is an
   * unexplained deletion wearing a status field.
   */
  static EDGE_REASON_MAX = 160;
  /* Longer than a reason, because a release acknowledgment is a statement of
     what was weighed and what was checked, not a label. Same forbidden
     characters, because it is spliced into the Session Log and must stay one
     line per field. */
  static RELEASE_ACK_MAX = 500;
  static EDGE_NOTE_MAX = 480;

  /** Move `cites` edges between statuses for every member of a selection.
   *
   *  One method for both directions because they are the same operation over the
   *  same grammar, and two copies of a frontmatter splice is how the two
   *  reference sources drifted apart in the first place (D-21). */
  #edgeTransition({ project, handle, viewer, owner, reason, author,
                    from, to, verb, resultKey }) {
    /* Weight `refuse`, hard-coded exactly as `cite` hard-codes `report`. A
       caller that could choose the weight would make the distinction advisory. */
    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;

    const p = this.#one(`SELECT bundle_id, object_type, bundle_sha FROM bundles WHERE bundle_id=?`, project);
    if (!p) return { ok: false, reason: "NO_SUCH_PROJECT", project };
    if (p.object_type !== "project")
      return { ok: false, reason: "NOT_A_PROJECT", project, got: p.object_type,
               detail: "cites lives on the citing object and this action edits a Project's edges" };

    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: `${verb} an edge records WHY. The catalog's own remediation for a bad reference is `
                     + `"sever with reason", and an edge moved with no reason is an unexplained change `
                     + `wearing a status field.` };
    if (why.length > Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Store.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes, so `
                     + `those would reshape the document rather than appear in it` };

    /* An EMPTY selection is refused, not treated as a successful no-op. A
       selection can resolve to nothing (named ids that never existed, or members
       purged or hidden since it was made), and the first version of this method
       then found no offenders, built no changes, and promoted an UNCHANGED
       document: a revision in an append-only history recording that nothing
       happened, reported as success. Found by the suite asking what happens when
       you sever an id that was never cited. */
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", project, handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to move. It may have "
                     + "named ids that do not exist, or its members may have been purged or hidden since "
                     + "it was made." };

    const offenders = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") offenders.push(id);
    }
    if (offenders.length)
      return { ok: false, reason: "NOT_INFORMATION", project, handle, offenders: offenders.sort(),
               detail: "these members of the selection are not Information, so they carry no citation edge "
                     + "to move. The whole call is refused rather than narrowed." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, project);
    if (!liveMd || typeof liveMd.content !== "string") return { ok: false, reason: "NO_BUNDLE_MD", project };
    const parsed = parseFrontmatter(liveMd.content);
    if (!parsed.data) return { ok: false, reason: "UNPARSEABLE_FRONTMATTER", project };

    const current = new Map();
    for (const r of Array.isArray(parsed.data.references) ? parsed.data.references : [])
      if (r && typeof r === "object" && r.rel === "cites" && typeof r.target === "string")
        current.set(r.target, r);

    /* THE WHOLE SET MOVES OR NONE OF IT DOES. A member in the wrong state means
       the operator is looking at a stale view, so the batch is refused by name
       rather than partially applied. A half-run state change is precisely what
       weight `refuse` exists to prevent, and applying it to the subset that
       happens to be eligible would reintroduce that through the back door. */
    const wrong = [];
    for (const id of sel.members) {
      const e = current.get(id);
      if (!e || !from.includes(e.status)) wrong.push(id);
    }
    if (wrong.length)
      return { ok: false, reason: from.includes("severed") ? "NOT_SEVERED" : "NOT_CITED",
               project, handle, offenders: wrong.sort(), drift: sel.drift,
               detail: `${verb} requires an edge currently in ${from.map((s) => `'${s}'`).join(" or ")}. `
                     + `These targets are not, so the whole call is refused: a batch that moved only the `
                     + `eligible members would be a state change the operator did not ask for.` };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    /* The reason is APPENDED to the note, never substituted. The note is the
       only prose an edge carries, and the reason it was cited is as much a part
       of the record as the reason it stopped being relied on. Bounded, with the
       oldest text dropped first when it will not fit, because the superseded
       revision is in history and the newest reasoning is what a reader needs
       first. */
    const changes = new Map();
    for (const id of sel.members) {
      const prev = String(current.get(id).note ?? "");
      let note = (prev ? prev + " | " : "") + `${verb} ${when}: ${why}`;
      if (note.length > Store.EDGE_NOTE_MAX) note = note.slice(note.length - Store.EDGE_NOTE_MAX);
      changes.set(id, { status: to, note });
    }

    const spliced = Store.#spliceEdgeStatus(liveMd.content, changes);
    if (!spliced)
      return { ok: false, reason: "UNSPLICEABLE_REFERENCES", project,
               detail: "the references block is not in a shape this grammar can edit in place" };

    let text = Store.#setScalar(spliced, "last_updated", `"${when}"`);
    const ids = [...sel.members].sort();
    const shown = ids.slice(0, Store.CITE_LOG_SAMPLE);
    const listed = shown.join(", ") + (ids.length > shown.length ? `, and ${ids.length - shown.length} more` : "");
    const entry = `### Session ${when} | ${verb} ${ids.length} citation${ids.length === 1 ? "" : "s"}`
                + ` | ${author || "member"}\n`
                + `Trigger: selection ${handle}\n`
                + `Changes: cites edges to ${listed} moved to '${to}'. Reason: ${why}.\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cut = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
    }

    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, project))
      carried.push(r.content !== null
        ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
        : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

    const bytes = new TextEncoder().encode(text);
    if (bytes.length > INLINE_MAX)
      return { ok: false, reason: "CITATION_TOO_LARGE", project, bytes: bytes.length, limit: INLINE_MAX,
               detail: "the reasons appended to these edges would push bundle.md past the 1MB inline limit" };
    const fm = parsed.data;
    const promoted = this.promote({
      bundleId: project, base: p.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
      author: author || "member",
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() },
              ...carried],
      meta: {
        object_type: "project", group: fm.group || "believe-in-oakland", title: fm.title,
        current_state: fm.current_state, prior_state: fm.prior_state ?? null,
        created: fm.created, last_updated: when,
        criticality: fm.criticality ?? null,
      },
    });
    if (!promoted.ok) return { ...promoted, project, handle, drift: sel.drift };

    return { ok: true, project, handle, weight: "refuse", moved: sel.moved, drift: sel.drift,
             /* `why` and NOT `reason`: every refusal in this file returns a
                REASON CODE under that name, and returning the operator's prose
                under the same key made a success indistinguishable from a
                refusal to any caller checking `reason`. The suite caught it. */
             [resultKey]: ids, why, from, to,
             bundleSha: promoted.bundleSha, rowVersion: promoted.rowVersion, gate: sel.gate };
  }

  sever({ project, handle, viewer = null, owner = null, reason = "", author = null } = {}) {
    return this.#edgeTransition({ project, handle, viewer, owner, reason, author,
      from: ["confirmed", "proposed"], to: "severed", verb: "Severed", resultKey: "severed" });
  }

  reinstate({ project, handle, viewer = null, owner = null, reason = "", author = null } = {}) {
    return this.#edgeTransition({ project, handle, viewer, owner, reason, author,
      from: ["severed"], to: "confirmed", verb: "Reinstated", resultKey: "reinstated" });
  }

  /* S-11 step 3: bulk disposition of inquiries (né Problems, né Focuses),
   * weight `refuse`.
   *
   * The first selection-backed action to move an OBJECT's state rather than an
   * edge's. Steps 1 and 2 edited a Project's `references` block; this edits
   * `current_state` on each selected inquiry, which is heavier: an edge is a
   * claim about a relationship, and a state is a claim about where the group's
   * thinking has got to.
   *
   * WEIGHT `refuse`, hard-coded exactly as `cite` hard-codes `report`. The whole
   * set moves or none of it does, because a half-run bulk state change leaves
   * the operator unable to know which half ran.
   *
   * ONLY `deferred` AND `dismissed`. Every other inquiry state is entered by
   * its own act with its own entry requirements (REC-13/14/16 bring them),
   * never by a bulk state flip. Refused by name rather than by omission, so
   * the operator learns why.
   *
   * THE REASON IS NOT POLITENESS. C-2.8 requires a non-empty
   * `disposition_reason` for both target states, so a disposition without one
   * produces a bundle the catalog rejects. Refusing here is the difference
   * between refusing a write and writing something that fails its own checks. */
  dispose({ handle, to, reason = "", viewer = null, owner = null, author = null } = {}) {
    /* DISPOSITIONS is the PUBLISHED set, imported from affordances.mjs
       (REC-11's folded chore). This method held its own literal copy from the
       REC-19 wave's separate claims, with the affordances suite pinning the
       two arrays identical; the import is what makes that pin unnecessary —
       one array, no drift to pin against. */
    /* Legal transitions, IMPORTED from the catalog's own table (REC-10). The
       comment here used to claim exactly that over a literal second copy of
       the machine; DATA-MODEL.md §2.7 caught the claim being false, and this
       import is what makes it true. deferred->deferred is absent, which is
       what makes a stale view a refusal rather than a silent no-op. */
    const INQUIRY_STATES = STATES.inquiry.legal;
    const LEGAL = STATES.inquiry.edges;

    if (!INQUIRY_STATES.includes(to))
      return { ok: false, reason: "BAD_TARGET_STATE", to, legal: INQUIRY_STATES,
               detail: `an inquiry's state is one of ${INQUIRY_STATES.join(", ")}` };
    if (!DISPOSITIONS.includes(to))
      return { ok: false, reason: "NOT_A_DISPOSITION", to, dispositions: DISPOSITIONS,
               detail: "only deferring and dismissing are dispositions: every other inquiry state is "
                     + "entered by its own act, with its own entry requirements, never by a bulk state flip." };

    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "C-2.8 requires a non-empty disposition_reason for deferred and dismissed, so a "
                     + "disposition with no reason would produce a bundle the catalog rejects." };
    if (why.length > Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Store.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };

    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to dispose" };

    /* Refused WHOLE, offenders named, never narrowed to the valid subset. The
       operator picked a set; disposing part of it decides something they did
       not. Same rule cite applies to a selection carrying a non-Information. */
    const offenders = [], illegal = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type, current_state FROM bundles WHERE bundle_id=?`, id);
      /* Judged by the NORMALIZED type through the catalog's own map, so a
         legacy `focus` or `problem` row (should one predate the boot
         normaliser) and a canonical `inquiry` row answer the same way. */
      if (!b || normalizeType(b.object_type) !== "inquiry") { offenders.push(id); continue; }
      if (!(LEGAL[b.current_state] || []).includes(to)) illegal.push({ id, from: b.current_state });
    }
    if (offenders.length)
      /* NOT_INQUIRIES, né NOT_PROBLEMS: REC-10's one wire change inside this
         op (DATA-MODEL §2.7 change 13 — the refusal stops naming a construct
         that no longer exists). */
      return { ok: false, reason: "NOT_INQUIRIES", offenders: offenders.sort(),
               detail: "disposition moves an inquiry's state, and this selection carries something else. "
                     + "The set is refused whole rather than narrowed to the inquiries in it." };
    if (illegal.length)
      return { ok: false, reason: "ILLEGAL_TRANSITION", to, offenders: illegal.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "these are not legal moves in the catalog's state table. A move to the state "
                     + "something is already in usually means the view was taken before someone else's "
                     + "disposition, so it is refused rather than treated as a no-op." };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const disposed = [];
    for (const id of sel.members) {
      const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const cur = this.#one(`SELECT bundle_sha, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!liveMd || liveMd.content === null)
        return { ok: false, reason: "NO_DOCUMENT", bundleId: id,
                 detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
      let text = liveMd.content;
      /* C-4.2: prior_state obliges a state_history ENTRY. Naming where a state
         came from without recording the transition leaves the document asserting
         a history it does not carry, which the catalog rejects and which is
         worse than not naming it: the entry is the record, prior_state is only
         a pointer at it. Five fields, per the catalog: timestamp, from_state,
         to_state, blurb, author. */
      const withHistory = Store.#appendStateHistory(text, {
        timestamp: when, from_state: cur.current_state, to_state: to,
        blurb: why, author: author || "member" });
      if (!withHistory)
        return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", bundleId: id, disposedSoFar: disposed,
                 detail: "this document's state_history block is not in a shape this grammar can extend in "
                       + "place, and a disposition that recorded no transition would leave prior_state "
                       + "pointing at a history the document does not carry (C-4.2)" };
      text = withHistory;
      text = Store.#setScalar(text, "prior_state", cur.current_state);
      text = Store.#setScalar(text, "current_state", to);
      text = Store.#setScalar(text, "disposition_reason", `"${why}"`);
      text = Store.#setScalar(text, "last_updated", `"${when}"`);
      /* C-13.2: last_updated moving requires a Session Log entry. What the
         record is FOR is saying who did what and why, and a state change
         appearing with no account of it is an unaccountable change. */
      const entry = `### Session ${when} | ${to === "deferred" ? "Deferred" : "Dismissed"} | ${author || "member"}\n`
                  + `Trigger: selection ${handle}\n`
                  + `Changes: state ${cur.current_state} to ${to}. Reason: ${why}.\n`;
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entry;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cutAt = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
      }

      const carried = [];
      for (const r of this.sql.exec(
        `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, id))
        carried.push(r.content !== null
          ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
          : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

      const bytes = new TextEncoder().encode(text);
      const parsed = parseFrontmatter(text);
      const fm = parsed.data || {};
      const promoted = this.promote({
        bundleId: id, base: cur.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
        author: author || "member",
        files: [{ path: "bundle.md", text, bytes: bytes.length,
                  sha256: createSha256().update(bytes).hex() }, ...carried],
        meta: { object_type: "inquiry", group: fm.group || "believe-in-oakland", title: fm.title,
                current_state: to, prior_state: cur.current_state,
                created: fm.created, last_updated: when,
                criticality: fm.criticality ?? null },
      });
      if (!promoted.ok) return { ...promoted, bundleId: id, disposedSoFar: disposed };
      disposed.push(id);
    }
    return { ok: true, to, reason: why, handle, disposed: disposed.sort(),
             weight: "refuse", drift: sel.drift };
  }

  /* THE ONE live-cites predicate (REC-19). Who cites INTO a bundle, partitioned
   * by edge status. `refs` is the projection of the citing documents'
   * frontmatter, rewritten on every promotion, so a severed edge still has a
   * row there and its STATUS lives in the document; the document is read rather
   * than the projection, because the projection does not carry status. A citing
   * document that cannot be read counts as LIVE — refusing on what cannot be
   * verified is the conservative arm, and it was retire's behaviour already.
   *
   * Extracted from retire's CITED guard so that guard and op=affordances'
   * publication run the SAME predicate: a pre-flight that could disagree with
   * the refusal it fronts would be the drift DEC-8 forbids, wearing our colors. */
  #citesInto(id) {
    const confirmed = [], severed = [];
    for (const r of this.#rows(`SELECT bundle_id FROM refs WHERE target_id=? AND kind='cites'`, id)) {
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, r.bundle_id);
      if (!md || md.content === null) { confirmed.push(r.bundle_id); continue; }
      const refs = parseFrontmatter(md.content).data?.references;
      const entry = (Array.isArray(refs) ? refs : [])
        .find((x) => x && x.rel === "cites" && x.target === id);
      if (!entry || entry.status !== "severed") confirmed.push(r.bundle_id);
      else severed.push(r.bundle_id);
    }
    return { confirmed: confirmed.sort(), severed: severed.sort() };
  }

  /* S-11 step 4: bulk RETIREMENT of Information, weight `refuse`.
   *
   * Heavier than step 3's disposition for one structural reason: `retired` is
   * TERMINAL in the catalog's table (collected -> verified -> retired, and
   * retired -> nothing), where every Problem disposition is reversible. A wrong
   * disposition is corrected by disposing again. A wrong retirement cannot be
   * undone through the state machine at all, so every refusal here is worth more
   * than the equivalent refusal there.
   *
   * TWO GUARDS, and the second is the doctrinal one.
   *
   * First, only `verified` -> `retired`, because that is the only legal edge.
   * Retiring something merely `collected` would skip the step where a human
   * looked at it, which is precisely what the intake doctrine exists to
   * protect.
   *
   * Second, INFORMATION A PROJECT STILL CITES IS REFUSED. Nothing in the catalog
   * stops this, and that is why it matters: C-6.2 treats an unresolvable
   * reference target as an ERROR whose remediations are "restore target from
   * history", "re-point to the successor", or "sever the edge with a reason
   * note". A bulk retirement that silently stranded live citations would
   * manufacture exactly that error condition at whatever scale the operator
   * happened to select. The citing Projects are NAMED, because an operator told
   * only "refused" cannot act, and severing is C-6.2's own remedy.
   *
   * A SEVERED edge does not count as a citation. Severing is the recorded
   * decision to stop relying on something, so treating a severed edge as a live
   * dependency would make the refusal unclearable by the very act doctrine
   * prescribes for clearing it. */
  retire({ handle, reason = "", viewer = null, owner = null, author = null } = {}) {
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "retirement is terminal in the state machine, so it records WHY. There is no move "
                     + "back out of retired, and an unexplained one-way change is not a record." };
    if (why.length > Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Store.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline` };

    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to retire" };

    const notInfo = [], illegal = [], cited = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") { notInfo.push(id); continue; }
      if (b.current_state !== "verified") { illegal.push({ id, from: b.current_state }); continue; }
      /* Live citations only, through the ONE #citesInto predicate (shared with
         op=affordances, which publishes retire's availability from it): a
         severed edge is a recorded decision to stop relying and does not block. */
      const citedBy = this.#citesInto(id).confirmed;
      if (citedBy.length) cited.push({ id, citedBy });
    }
    if (notInfo.length)
      return { ok: false, reason: "NOT_INFORMATION", offenders: notInfo.sort(),
               detail: "retirement moves an Information state, and this selection carries something else. "
                     + "The set is refused whole rather than narrowed." };
    if (illegal.length)
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "retired",
               offenders: illegal.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "only verified Information may be retired. Something still collected has not been "
                     + "verified by anyone, and retiring it would skip that step; something already "
                     + "retired has nowhere further to go, because retired is terminal." };
    if (cited.length)
      return { ok: false, reason: "CITED", offenders: cited.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "these are still cited by live edges. Retiring them would leave those Projects "
                     + "pointing at retired material, which C-6.2 treats as an error whose remedy is to "
                     + "sever the edge with a reason. Sever first, then retire." };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const retired = [];
    for (const id of sel.members) {
      const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const cur = this.#one(`SELECT bundle_sha, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!liveMd || liveMd.content === null)
        return { ok: false, reason: "NO_DOCUMENT", bundleId: id, retiredSoFar: retired };
      let text = liveMd.content;
      const withHistory = Store.#appendStateHistory(text, {
        timestamp: when, from_state: cur.current_state, to_state: "retired",
        blurb: why, author: author || "member" });
      if (!withHistory)
        return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", bundleId: id, retiredSoFar: retired,
                 detail: "this document's state_history block cannot be extended in place, and a "
                       + "retirement recording no transition would leave prior_state pointing at a "
                       + "history the document does not carry (C-4.2)" };
      text = withHistory;
      text = Store.#setScalar(text, "prior_state", cur.current_state);
      text = Store.#setScalar(text, "current_state", "retired");
      text = Store.#setScalar(text, "last_updated", `"${when}"`);
      const entry = `### Session ${when} | Retired | ${author || "member"}\n`
                  + `Trigger: selection ${handle}\n`
                  + `Changes: state ${cur.current_state} to retired. Reason: ${why}.\n`;
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entry;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cutAt = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
      }

      const carried = [];
      for (const r of this.sql.exec(
        `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, id))
        carried.push(r.content !== null
          ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
          : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

      const bytes = new TextEncoder().encode(text);
      const fm = parseFrontmatter(text).data || {};
      const promoted = this.promote({
        bundleId: id, base: cur.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
        author: author || "member",
        files: [{ path: "bundle.md", text, bytes: bytes.length,
                  sha256: createSha256().update(bytes).hex() }, ...carried],
        meta: { object_type: "information", group: fm.group || "believe-in-oakland", title: fm.title,
                current_state: "retired", prior_state: cur.current_state,
                created: fm.created, last_updated: when,
                criticality: fm.criticality ?? null },
      });
      if (!promoted.ok) return { ...promoted, bundleId: id, retiredSoFar: retired };
      retired.push(id);
    }
    return { ok: true, reason: why, handle, retired: retired.sort(), weight: "refuse", drift: sel.drift };
  }

  /* S-11 step 5, the last rung of the ladder: bulk RELEASE of Information,
     collected -> verified over a selection, weight `refuse`, whole set or
     nothing. Decided by Bob 2026-07-27 and specified in Intake Doctrine v1.2:
     what legitimizes a bulk release is volume plus little-to-no variance in the
     trustworthiness of the collection, whatever origin brought it in, because
     verification asserts only that a document APPEARS to be what it claims to
     be, never accuracy.

     Four properties carry the doctrine:
     1. A NAMED MEMBER authors it. The author stamp arrives from the session;
        a machine credential's stamp is `token:<class>` and is refused by
        shape, because the collected-to-verified transition is a member's
        decision (section 4, C-18.1), whatever else machines may prepare.
     2. The ACKNOWLEDGMENT IS A RECORD, not a dialog. The member's explicit
        acknowledgment of the batch's homogeneity and the mitigation steps
        they actually took are required parameters, refused when absent, and
        written into every released document's Session Log, so a batch release
        is permanently distinguishable from a per-document one.
     3. CRUCIAL NEVER RIDES A BATCH. Ratifying crucial-criticality material
        requires verifying its co-attestations (doctrine section 3, F4), which
        is per-document work, and a batch containing crucial material is by
        definition not a low-variance collection.
     4. NOTHING VERIFIED HERE AUDITS DIRTY. C-2.7's verified-state entry
        requirements (well-formed content_hash, data/dataset.json, a file in
        snapshots/) are checked per member BEFORE any state moves, offenders
        named, set refused whole. */
  release({ handle, acknowledgment = "", mitigation = "", viewer = null, owner = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || who === "member" || /^token:/.test(who))
      return { ok: false, reason: "MACHINE_CANNOT_RELEASE",
               detail: "the collected-to-verified transition is a named member's decision (Intake Doctrine "
                     + "section 4, C-18.1). A machine credential may read and may prepare the review packet, "
                     + "and may not release. Sign in as a member." };
    const ack = String(acknowledgment ?? "").trim();
    const mit = String(mitigation ?? "").trim();
    if (!ack)
      return { ok: false, reason: "NO_ACKNOWLEDGMENT",
               detail: "a bulk release records the member's explicit acknowledgment that the batch is "
                     + "homogeneous and that the risks of releasing in bulk were weighed. Without it the "
                     + "record shows only that a button was pressed." };
    if (!mit)
      return { ok: false, reason: "NO_MITIGATION",
               detail: "a bulk release records what the member actually did: what was sampled, what was "
                     + "checked. 'Sender domains verified on a sample of twelve' can be audited later; "
                     + "silence cannot." };
    for (const [name, v] of [["acknowledgment", ack], ["mitigation", mit]])
      if (v.length > Store.RELEASE_ACK_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${Store.RELEASE_ACK_MAX} characters and cannot contain a `
                       + `quote, a backslash, or a newline` };

    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to release" };

    const notInfo = [], illegal = [], crucial = [], entry = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type, current_state, criticality FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") { notInfo.push(id); continue; }
      if (b.current_state !== "collected") { illegal.push({ id, from: b.current_state }); continue; }
      if (b.criticality === "crucial") { crucial.push(id); continue; }
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const fm = md && md.content !== null ? (parseFrontmatter(md.content).data || {}) : {};
      const missing = [];
      const ch = fm.content_hash;
      if (!(typeof ch === "string" && /^sha256:[0-9a-f]{64}$/.test(ch))) missing.push("well-formed content_hash");
      if (!this.#one(`SELECT 1 AS x FROM files WHERE bundle_id=? AND path='data/dataset.json'`, id))
        missing.push("data/dataset.json");
      if (!this.#one(`SELECT 1 AS x FROM files WHERE bundle_id=? AND path LIKE 'snapshots/%' LIMIT 1`, id))
        missing.push("a file in snapshots/");
      if (missing.length) entry.push({ id, missing });
    }
    if (notInfo.length)
      return { ok: false, reason: "NOT_INFORMATION", offenders: notInfo.sort(),
               detail: "release moves an Information state, and this selection carries something else. "
                     + "The set is refused whole rather than narrowed." };
    if (illegal.length)
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "verified",
               offenders: illegal.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "only collected Information may be released. Something already verified has been "
                     + "released once and release is not repeatable; something retired is terminal." };
    if (crucial.length)
      return { ok: false, reason: "CRUCIAL_IN_BATCH", offenders: crucial.sort(),
               detail: "crucial-criticality material is never batch-released (Intake Doctrine v1.2): "
                     + "ratifying it requires verifying its co-attestations, which is per-document work, "
                     + "and a batch containing crucial material is not a low-variance collection. Release "
                     + "these individually, or re-select without them." };
    if (entry.length)
      return { ok: false, reason: "ENTRY_REQUIREMENTS",
               offenders: entry.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "verified state has entry requirements (C-2.7): a well-formed content_hash, "
                     + "data/dataset.json, and at least one file in snapshots/. Releasing these as they "
                     + "stand would mint bundles the catalog immediately rejects." };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const released = [];
    for (const id of sel.members) {
      const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const cur = this.#one(`SELECT bundle_sha, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!liveMd || liveMd.content === null)
        return { ok: false, reason: "NO_DOCUMENT", bundleId: id, releasedSoFar: released };
      let text = liveMd.content;
      const withHistory = Store.#appendStateHistory(text, {
        timestamp: when, from_state: cur.current_state, to_state: "verified",
        blurb: `batch release via selection ${handle}; acknowledgment and mitigation in Session Log`,
        author: who });
      if (!withHistory)
        return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", bundleId: id, releasedSoFar: released,
                 detail: "this document's state_history block cannot be extended in place, and a release "
                       + "recording no transition would leave prior_state pointing at a history the "
                       + "document does not carry (C-4.2)" };
      text = withHistory;
      text = Store.#setScalar(text, "prior_state", cur.current_state);
      text = Store.#setScalar(text, "current_state", "verified");
      text = Store.#setScalar(text, "last_updated", `"${when}"`);
      const entryLog = `### Session ${when} | Released (batch) | ${who}\n`
                     + `Trigger: selection ${handle}\n`
                     + `Changes: state ${cur.current_state} to verified.\n`
                     + `Acknowledgment: ${ack}\n`
                     + `Mitigation: ${mit}\n`;
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entryLog;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cutAt = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cutAt) + entryLog + "\n" + text.slice(cutAt);
      }

      const carried = [];
      for (const r of this.sql.exec(
        `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, id))
        carried.push(r.content !== null
          ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
          : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

      const bytes = new TextEncoder().encode(text);
      const fm = parseFrontmatter(text).data || {};
      const promoted = this.promote({
        bundleId: id, base: cur.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
        author: who,
        files: [{ path: "bundle.md", text, bytes: bytes.length,
                  sha256: createSha256().update(bytes).hex() }, ...carried],
        meta: { object_type: "information", group: fm.group || "believe-in-oakland", title: fm.title,
                current_state: "verified", prior_state: cur.current_state,
                created: fm.created, last_updated: when,
                criticality: fm.criticality ?? null },
      });
      if (!promoted.ok) return { ...promoted, bundleId: id, releasedSoFar: released };
      released.push(id);
    }
    return { ok: true, handle, released: released.sort(), acknowledgment: ack, mitigation: mit,
             weight: "refuse", drift: sel.drift };
  }

  /* REC-13: CONCLUDING an inquiry. open|surfaced -> concluded, on op=release's
   * shape and with its four properties carried over deliberately.
   *
   * NOT SELECTION-BACKED, and that is the one place this departs from release.
   * Release's argument is a batch judgement about homogeneous material; a
   * CONCLUSION is one authored answer to one question, and the same sentence
   * cannot be the answer to twelve of them. A bulk conclude would be the
   * checkbox the whole construct exists to refuse, so this op takes ONE target
   * and reports `weight: "single"` — no set is applied, and op=affordances
   * publishes that same word (the suite cross-checks the two).
   *
   * The properties that DO carry over:
   * 1. A NAMED MEMBER authors it. The author stamp arrives from the session;
   *    a machine credential's stamp is `token:<class>` and is refused BY SHAPE
   *    (MACHINE_CANNOT_CONCLUDE, the MACHINE_CANNOT_RELEASE precedent above).
   *    A machine may SURFACE a question — D-78 stamps surfaced_by: agent and
   *    DEC-24 lets it PURSUE what a member authored — and it may never author
   *    the answer. That asymmetry is the whole of what "less narrative" means
   *    when the narrator is ours.
   * 2. THE TEXT IS CALLER-SUPPLIED AND NEVER PREFILLED. `conclusion` and
   *    `falsifier` are required parameters refused when absent, exactly as
   *    acknowledgment and mitigation are. Nothing is derived, defaulted or
   *    proposed: a falsifier the plane wrote is not a falsifier the group
   *    accepted.
   * 3. NOTHING CONCLUDED HERE AUDITS DIRTY. C-2.8's concluded-state entry
   *    requirements are checked BEFORE the state moves, so this op never mints
   *    a bundle the catalog immediately rejects. The basis is read from the
   *    DOCUMENT (D-21: inquiry_basis is a projection of it, never a second
   *    place to state it).
   *
   * NO OWNER GATE AND NO BALLOT (DEC-30). Any holder of `contribute` may
   * conclude, and the act is ATTRIBUTED — the member's name is in the
   * state_history entry and in the Session Log. Concluding is not ownership of
   * the question; a group that disagrees reopens it, which is what the
   * concluded -> open edge is for.
   *
   * THE MACHINE IS THE CATALOG'S. Edge legality comes from vocabFor(STATES, …)
   * over the DECLARED object_type, so a legacy focus/problem document — whose
   * own vocabulary has no `concluded` and whose heading set has no
   * `## Conclusion` to put one in — is refused ILLEGAL_TRANSITION rather than
   * quietly given a state its contract never had. Modernizing such a document
   * is a promotion, and then it concludes like any other. */
  conclude({ target, conclusion = "", falsifier = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || who === "member" || /^token:/.test(who))
      return { ok: false, reason: "MACHINE_CANNOT_CONCLUDE",
               detail: "a conclusion is a named member's assertion about what the record shows. A machine "
                     + "credential may SURFACE a question, gather what it rests on and prepare the answer, "
                     + "and may never author the conclusion. Sign in as a member." };
    const concl = String(conclusion ?? "").trim();
    const fals = String(falsifier ?? "").trim();
    if (!concl)
      return { ok: false, reason: "NO_CONCLUSION",
               detail: "concluding records WHAT was concluded. C-2.8 requires a non-empty conclusion in the "
                     + "concluded state, so a conclusion with nothing in it would produce a bundle the "
                     + "catalog rejects. An undetermined answer is stated as undetermined, never left blank." };
    if (!fals)
      return { ok: false, reason: "NO_FALSIFIER",
               detail: "a conclusion states what would OVERTURN it. Without that the finding cannot be "
                     + "checked by anyone, including its author, and a record that cannot be checked claims "
                     + "more than it can support." };
    for (const [name, v] of [["conclusion", concl], ["falsifier", fals]])
      if (v.length > Store.RELEASE_ACK_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${Store.RELEASE_ACK_MAX} characters and cannot contain a `
                       + `quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes` };

    if (!target)
      return { ok: false, reason: "NO_TARGET",
               detail: "a conclusion answers ONE question: pass target=<inquiry id>" };
    /* REC-25 / D-15: the same fail-closed viewer gate every read takes. An
       inquiry the viewer may not see answers NO_SUCH_BUNDLE, identical to an
       absent one, so the refusal discloses nothing. */
    const gate = viewerPredicate(viewer);
    /* The `b` alias is not cosmetic: viewerPredicate's participation arm is
       written against `b.object_type` / `b.bundle_id`, so a statement without
       it throws rather than filtering. affordanceFacts takes the same shape. */
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.bundle_sha FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "concluding answers a question, and only an inquiry carries one." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    let text = liveMd.content;
    const fm = parseFrontmatter(text).data || {};

    /* THE MAP RULE: the machine is looked up through the catalog's own
       vocabFor over the DECLARED spelling, never STATES.inquiry by a raw key.
       A legacy focus/problem document is judged by the contract it was
       authored under, which has no `concluded` in it. */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes("concluded"))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "concluded", target,
               from: b.current_state, object_type: fm.object_type ?? b.object_type,
               detail: "this is not a legal move in the catalog's state table for this document's own "
                     + "vocabulary. An inquiry concludes from open (or its `surfaced` alias); something "
                     + "deferred or dismissed is reopened first, and a legacy focus/problem document has "
                     + "no concluded state at all until its frontmatter is modernized." };

    /* Entry requirement 3, checked against the DOCUMENT before anything moves.
       DEC-22: zero legs is legal while OPEN — that is a standing objective —
       and is exactly what may not be concluded. */
    const legs = Array.isArray(fm.basis) ? fm.basis : [];
    if (legs.length < 1)
      return { ok: false, reason: "NO_BASIS", target,
               detail: "a conclusion rests on something. An open inquiry may hold a claim with no legs at "
                     + "all — a standing objective the group means to pursue — but concluding one that "
                     + "rests on nothing would put the record's name to an assertion nothing supports. "
                     + "Add a basis[] leg (and the same target in references[]) first." };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const withHistory = Store.#appendStateHistory(text, {
      timestamp: when, from_state: b.current_state, to_state: "concluded",
      blurb: concl, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a conclusion "
                     + "recording no transition would leave prior_state pointing at a history the document "
                     + "does not carry (C-4.2)" };
    text = withHistory;
    text = Store.#setScalar(text, "prior_state", b.current_state);
    text = Store.#setScalar(text, "current_state", "concluded");
    /* setOrAdd, not set: an inquiry authored before this state existed carries
       neither key, and #setScalar alone returns the text UNCHANGED for an
       absent key — which would move the state and leave the requirement
       unmet, minting exactly the bundle the catalog rejects. */
    text = Store.#setOrAddScalar(text, "conclusion", `"${concl}"`);
    text = Store.#setOrAddScalar(text, "falsifier", `"${fals}"`);
    text = Store.#setScalar(text, "last_updated", `"${when}"`);
    /* C-13.2: last_updated moving requires a Session Log entry, and DEC-30's
       attribution lives here — who concluded is part of the record even though
       no one owns the question. */
    const entry = `### Session ${when} | Concluded | ${who}\n`
                + `Trigger: op=conclude on ${target}\n`
                + `Changes: state ${b.current_state} to concluded.\n`
                + `Conclusion: ${concl}\n`
                + `Falsifier: ${fals}\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cutAt = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
    }

    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, target))
      carried.push(r.content !== null
        ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
        : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

    const bytes = new TextEncoder().encode(text);
    const promoted = this.promote({
      bundleId: target, base: b.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
      author: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type, group: fm.group || "believe-in-oakland",
              title: fm.title, current_state: "concluded", prior_state: b.current_state,
              created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, from: b.current_state, to: "concluded",
             conclusion: concl, falsifier: fals, basis_legs: legs.length,
             author: who, at: when, weight: "single" };
  }

  /* REC-31: REOPENING an inquiry the group SET DOWN. deferred|dismissed ->
   * open, on op=conclude's shape and for op=conclude's reasons.
   *
   * WHY IT EXISTS. `deferred -> open` and `dismissed -> open` have been legal
   * edges in the catalog's table since REC-10, and NO op wrote them: op=dispose
   * only ever targets the disposition set. REC-13 made that a real hole rather
   * than an untidiness — a deferred inquiry cannot be concluded (it is picked
   * back up first, which is what the edge is for), so a question the group set
   * down was unrecoverable except by hand-editing the document. An act the
   * table permits and no caller can perform is the state machine lying.
   *
   * CONCLUDE'S PROPERTIES, CARRIED OVER, and each for its own reason:
   * 1. A NAMED MEMBER reopens. The author stamp arrives from the session and a
   *    machine credential's is `token:<class>`, refused BY SHAPE
   *    (MACHINE_CANNOT_REOPEN, the MACHINE_CANNOT_RELEASE/CONCLUDE precedent).
   *    A machine may SURFACE a question (D-78) and PURSUE what a member
   *    authored (DEC-24); deciding that the group's own decision to set
   *    something down no longer holds is a member's judgement about the
   *    record, not a scheduler's.
   * 2. THE REASON IS AUTHORED AND NEVER PREFILLED. Refused when absent, exactly
   *    as dispose's is and as conclude's conclusion and falsifier are. Nothing
   *    is derived or proposed: "reopened" with no account of why is a state
   *    change wearing a decision's clothes, and the member who deferred it is
   *    owed the argument. It lands in the state_history entry and the Session
   *    Log, the two places this record keeps WHY.
   * 3. NO OWNER GATE AND NO BALLOT (DEC-30). Any holder of `contribute`
   *    reopens, and the act is ATTRIBUTED. Disagreeing with a disposition is
   *    precisely the disagreement DEC-30 says is expressed by acting and
   *    signing the act, not by a vote.
   *
   * THE MACHINE IS THE CATALOG'S, and there is NO SECOND EDGE SOURCE: legality
   * is vocabFor(STATES, <declared type>) offering `open`, the same one table
   * op=affordances publishes from. A legacy focus/problem document is refused
   * ILLEGAL_TRANSITION — its own vocabulary has no `open` at all (its open
   * state is spelled `surfaced`), and inventing the move would judge it by a
   * contract it was not authored under.
   *
   * SCOPED TO REOPENABLE_FROM, DELIBERATELY. The FROM state must be in that
   * one published array — imported here and by the act, so the publication and
   * this refusal cannot disagree about what "reopenable" means.
   *
   * `concluded -> open` is ALSO a legal edge and this op does NOT write it, for
   * the reason REC-31 gave and REC-14 did not change: reopening a conclusion
   * here would produce an `open` inquiry still wearing its conclusion and its
   * falsifier with NO EDITION RECORDED — exactly the overclaim the edition
   * machinery exists to prevent — so it is refused BY NAME rather than by
   * omission, and op=publish is where a conclusion moves forward.
   *
   * `published -> open` IS written here, added at the REC-31 x REC-14 merge,
   * and the distinction is the recorded edition rather than a softening. DEC-12
   * rules that reopening does not unpublish: edition 1 keeps answering with its
   * own signature, attestor, time and gate version whatever happens to the
   * working document afterwards. So there is nothing to erase and nothing to
   * revert silently — the opposite of the concluded case — and published ->
   * open is the ONLY route to a second edition, which makes THIS act the front
   * door of a revision. An act the catalog permits and no caller can perform is
   * the state machine lying, which is the argument this op was built on. */
  reopen({ target, reason = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || who === "member" || /^token:/.test(who))
      return { ok: false, reason: "MACHINE_CANNOT_REOPEN",
               detail: "reopening is a named member's judgement that a question the group set down has to "
                     + "be worked again. A machine credential may surface a question and pursue one, and "
                     + "may not overturn the group's own disposition. Sign in as a member." };
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "reopening records WHY the disposition no longer holds. The member who deferred or "
                     + "dismissed this gave their reason; reopening with none would replace an accounted "
                     + "decision with an unaccountable one. Nothing here is prefilled." };
    if (why.length > Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Store.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    if (!target)
      return { ok: false, reason: "NO_TARGET",
               detail: "reopening picks up ONE question: pass target=<inquiry id>" };

    /* REC-25 / D-15: the same fail-closed viewer gate every read takes. An
       inquiry the viewer may not see answers NO_SUCH_BUNDLE, identical to an
       absent one, so the refusal discloses nothing. */
    const gate = viewerPredicate(viewer);
    /* The `b` alias is load-bearing: viewerPredicate's participation arm is
       written against `b.object_type` / `b.bundle_id` (see conclude above). */
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.bundle_sha FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "reopening picks a question back up, and only an inquiry carries one." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    let text = liveMd.content;
    const fm = parseFrontmatter(text).data || {};

    /* Reopenable, and only reopenable. Checked BEFORE the edge table so a
       concluded inquiry — whose `open` edge IS legal — is told what it needs
       rather than being told the move is illegal, which it is not.

       THE SET IS REOPENABLE_FROM, decided at the REC-31 x REC-14 merge, and
       the exclusion this refusal was written for is UNCHANGED. `concluded`
       stays refused for exactly the reason below: a conclusion reverting to
       open still wearing its conclusion records nothing, and the edition
       machinery is where that move belongs. `published` JOINS, because a
       published case has the opposite property — its editions are ratified,
       signed and immutable, and DEC-12 rules that reopening does not unpublish
       them. There is nothing to erase, and published -> open is the only route
       to a second edition, so refusing it here would leave a legal edge no
       caller could travel. The array lives in affordances.mjs beside
       DISPOSITIONS so the refusal and the published act cannot disagree about
       what "reopenable" means. */
    if (!REOPENABLE_FROM.includes(b.current_state))
      return { ok: false, reason: "NOT_SET_DOWN", target, from: b.current_state, reopenable: REOPENABLE_FROM,
               detail: "reopening picks up something the group SET DOWN (deferred or dismissed) or something "
                     + "the group has PUBLISHED. An open inquiry is already open, and a CONCLUDED one moves "
                     + "forward by publishing a new EDITION (DEC-12) — op=publish — rather than quietly "
                     + "reverting to open still wearing its conclusion, which would record nothing. "
                     + "Reopening a PUBLISHED case IS this act and does not unpublish it: every edition "
                     + "keeps answering with its own signature, attestor, time and gate version." };

    /* THE MAP RULE: the machine is looked up through the catalog's own vocabFor
       over the DECLARED spelling, never STATES.inquiry by a raw key. A legacy
       focus/problem document has no `open` state at all — its open state is
       spelled `surfaced` — so it is refused rather than given a state its
       contract never had. */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes("open"))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "open", target,
               from: b.current_state, object_type: fm.object_type ?? b.object_type,
               detail: "this is not a legal move in the catalog's state table for this document's own "
                     + "vocabulary. An inquiry reopens from deferred, dismissed or published; a legacy "
                     + "focus/problem "
                     + "document has no `open` state at all until its frontmatter is modernized." };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const withHistory = Store.#appendStateHistory(text, {
      timestamp: when, from_state: b.current_state, to_state: "open",
      blurb: why, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a reopening "
                     + "recording no transition would leave prior_state pointing at a history the document "
                     + "does not carry (C-4.2)" };
    text = withHistory;
    text = Store.#setScalar(text, "prior_state", b.current_state);
    text = Store.#setScalar(text, "current_state", "open");
    /* The disposition_reason is CLEARED, and the authored words are not lost:
       the state_history entry dispose() wrote keeps them forever. Leaving the
       scalar would hand every reader an OPEN inquiry still saying it is set
       down for a reason that no longer applies — the current-state fields
       describe where the document stands now, and the history describes where
       it has been. #setScalar on an absent key is a no-op by design, so an
       inquiry that never carried the field gains nothing. */
    text = Store.#setScalar(text, "disposition_reason", `""`);
    text = Store.#setScalar(text, "last_updated", `"${when}"`);
    /* C-13.2: last_updated moving requires a Session Log entry, and DEC-30's
       attribution lives here — who reopened, and why, is part of the record. */
    const entry = `### Session ${when} | Reopened | ${who}\n`
                + `Trigger: op=reopen on ${target}\n`
                + `Changes: state ${b.current_state} to open. Reason: ${why}.\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cutAt = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
    }

    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, target))
      carried.push(r.content !== null
        ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
        : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

    const bytes = new TextEncoder().encode(text);
    const promoted = this.promote({
      bundleId: target, base: b.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
      author: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type, group: fm.group || "believe-in-oakland",
              title: fm.title, current_state: "open", prior_state: b.current_state,
              created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    /* `weight: "single"` for conclude's reason: one question is picked back up
       at a time. A bulk reopen would be a checkbox reversing a set of separate
       decisions with one sentence standing for all of them. */
    return { ok: true, target, from: b.current_state, to: "open",
             why, author: who, at: when, weight: "single" };
  }


  /* =======================================================================
   * REC-14: PUBLISHING a case. concluded -> published, and it is the act that
   * writes the completeness assertion, the frozen pair and the declared bar
   * INTO the bytes a member then signs.
   *
   * THE ORDER IS THE POINT AND IT IS NOT NEGOTIABLE. Authoring the exclusion
   * CHANGES THE SHA, so the signature can only be taken afterwards: you cannot
   * sign first and write the caveat later. That is why this is a separate act
   * from op=ratify — which is UNCHANGED at {bundleId, expectedSha, sig} — and
   * why the sha this act returns is the one the member reviews and signs.
   *
   * WHAT IS AUTHORED AND WHAT IS STAMPED, on op=conclude's discipline:
   *   AUTHORED, caller-supplied, never prefilled — the completeness statement,
   *   every exclusion row, and the group's POSITION on putting the case to its
   *   subject WITH its justification (DEC-13). A justification the plane wrote
   *   is not a justification the group made.
   *   STAMPED by the server — the author (from the session), the time, the
   *   EDITION (from the published record, never from a parameter), both frozen
   *   axis objects (derived, never authored), and the declared bar as it stands.
   *
   * DEC-13, EXACTLY AS RULED. What is required is not the CONTACT. It is the
   * group's declared, justified POSITION on the contact, carried inside the
   * artifact as declared bias. A group that sought comment says so; a group
   * that deliberately did not says so and says why — and a group facing a
   * hostile body may have real cause not to give notice. Nothing in this act,
   * the catalog, or the gate reads WHICH position it is, and nothing anywhere
   * checks whether the answer was favourable.
   *
   * DEC-17 as amended: the declared bar is STAMPED BESIDE the derived pair, and
   * an ABSENT bar gates nothing and is stated as absent — never rendered as a
   * blank and never as zero. Whether a case falling SHORT of its own declared
   * bar is refused is REC-15's publishpreflight; this act stamps the two side
   * by side so the shortfall is legible either way.
   *
   * C-21.1 RUNS HERE TOO, before anything moves. The gate runs it again at
   * ratification (the checkGatheringGrammar precedent, and REC-13's), because a
   * one-sided check is a check the other side has to catch. Refusing early is
   * what stops the member signing a document the gate will then reject.
   *
   * DEC-12: this act does NOT unpublish anything and cannot. Editions append;
   * the working document moves. */
  publishCase({ target, statement = "", excluded = null, subjectPosition = "",
                subjectJustification = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || who === "member" || /^token:/.test(who))
      return { ok: false, reason: "MACHINE_CANNOT_PUBLISH",
               detail: "publishing puts the group's name on a case. A machine credential may prepare one and "
                     + "may never author the completeness assertion or the position on putting it to its "
                     + "subject, both of which are declared bias. Sign in as a member." };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "publishing publishes ONE case: pass target=<inquiry id>" };

    const stmt = String(statement ?? "").trim();
    const just = String(subjectJustification ?? "").trim();
    const pos = String(subjectPosition ?? "").trim();
    if (!stmt)
      return { ok: false, reason: "NO_STATEMENT",
               detail: "a published case states what it does NOT cover. A case silent about its own limits is "
                     + "claiming to cover everything, which is the overclaim this record exists to refuse." };
    if (!SUBJECT_POSITIONS.includes(pos))
      return { ok: false, reason: "NO_SUBJECT_POSITION", allowed: SUBJECT_POSITIONS,
               detail: "declare the group's position on putting this case to its subject. The gate is that the "
                     + "position is DECLARED — never that contact happened, and never that the answer was "
                     + "favourable (DEC-13). Deciding not to give notice is a legitimate position and is "
                     + "declared like any other." };
    if (!just)
      return { ok: false, reason: "NO_SUBJECT_JUSTIFICATION",
               detail: "a declared position with no reasoning behind it is the checkbox this gate exists to "
                     + "refuse. Say why — including why the group chose not to give notice — and a reader "
                     + "weighs it exactly as they weigh any other declared bias." };
    if (!Array.isArray(excluded))
      return { ok: false, reason: "NO_EXCLUSION_FIELD",
               detail: "pass excluded[]. An EMPTY list is a claim — this case left nothing material out — and "
                     + "is legal; an ABSENT field is silence, and silence about what a case excludes is what "
                     + "the completeness assertion exists to refuse." };
    const rows = [];
    for (let i = 0; i < excluded.length; i++) {
      const r = excluded[i];
      if (!r || typeof r !== "object")
        return { ok: false, reason: "BAD_EXCLUSION", ord: i, detail: `excluded[${i}] is not an object` };
      const tgt = typeof r.target === "string" && r.target.trim() !== "" ? r.target.trim() : null;
      const desc = String(r.description ?? "").trim();
      const why = String(r.reason ?? "").trim();
      /* C-9: target OR prose, NEVER NEITHER — the capture-or-testify structure.
         A row may legitimately name something not in the record (an outstanding
         records request has no id), so a required target would force the member
         to invent a referent or to say nothing at all. */
      if (!tgt && !desc)
        return { ok: false, reason: "BAD_EXCLUSION", ord: i,
                 detail: `excluded[${i}] names neither a target nor a description. Every exclusion row carries `
                       + `a target id OR prose, never neither — otherwise the row asserts nothing and the `
                       + `index cannot answer "which published cases excluded this document".` };
      if (!why)
        return { ok: false, reason: "BAD_EXCLUSION", ord: i,
                 detail: `excluded[${i}] carries no reason. WHAT was left out and WHY are two statements and `
                       + `one does not stand in for the other.` };
      rows.push({ target: tgt, description: desc, reason: why });
    }
    /* The restricted frontmatter grammar has no escapes, so a quote, a
       backslash or a newline in an authored field would produce a document the
       parser cannot read back — refused by name rather than silently mangled.
       conclude()'s rule, at this act's own lengths. */
    for (const [name, v] of [["statement", stmt], ["subject_justification", just],
                             ...rows.flatMap((r, i) => [[`excluded[${i}].description`, r.description],
                                                        [`excluded[${i}].reason`, r.reason]])]) {
      if (v.length > Store.COMPLETENESS_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: "BAD_COMPLETENESS", field: name,
                 detail: `${name} is at most ${Store.COMPLETENESS_MAX} characters and cannot contain a quote, `
                       + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    }

    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.bundle_sha FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "a case is an inquiry that reached a conclusion; nothing else publishes." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    let text = liveMd.content;
    const fm = parseFrontmatter(text).data || {};

    /* THE MAP RULE: through the catalog's own vocabFor over the DECLARED
       spelling. A legacy focus/problem document has no `published` in its
       machine at all, and is refused rather than quietly given a state its
       contract never had. */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes("published"))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "published", target,
               from: b.current_state, object_type: fm.object_type ?? b.object_type,
               detail: "publishing is reachable ONLY from `concluded`: a material set cannot be asserted over a "
                     + "question with no conclusion. Conclude it first (op=conclude), and a case already "
                     + "published is reopened before it can be concluded again for a new edition." };

    /* DEC-12: the edition comes from the PUBLISHED RECORD, never from the
       caller. It is what the next ratification will commit, and the ratify
       committer refuses it independently if it does not increment. */
    const top = this.#one(`SELECT MAX(edition) AS m FROM published_bundles WHERE bundle_id=?`, target);
    const edition = (top && top.m != null ? Number(top.m) : 0) + 1;

    /* C-21.1, before anything moves. The comparison is against the previous
       RATIFIED EDITION — not the previous promotion — because what a reader was
       given is an edition. */
    const reg = this.publishedRegistryFor(target);
    const prior = reg[target] && reg[target].editions
      ? Object.values(reg[target].editions).sort((a, c) => Number(c.edition) - Number(a.edition))[0] : null;
    if (prior && prior.completeness) {
      const now = completenessFields({ completeness: { statement: stmt, subject_justification: just },
                                       completeness_excluded: rows });
      const LABEL = { statement: "statement", subject_justification: "the subject-position justification",
                      excluded: "the exclusion list" };
      for (const k of Object.keys(LABEL))
        if (now[k] != null && prior.completeness[k] != null && now[k] === prior.completeness[k])
          return { ok: false, reason: "COMPLETENESS_CARRIED_FORWARD", field: k, edition, prior: prior.edition,
                   detail: `${LABEL[k]} is byte-identical to edition ${prior.edition}'s. A completeness claim `
                         + `carried forward unchanged is a checkbox, and C-21.1 exists to refuse it: every `
                         + `edition is a separate document and states its own limits in its own words, as of `
                         + `its own date. If nothing about the limits changed, say THAT, as of this edition.` };
    }

    /* R2/DEC-21: BOTH axis objects, derived and frozen — never two letters, and
       never composed. `unrated` and `undetermined` are DIFFERENT frozen facts
       and C-21.2 compares against the right one, which a single nullable grade
       could not support. */
    const pair = this.strengthOf(target);
    const bar = this.#requiredStrengthFor(target, fm);
    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");

    const withHistory = Store.#appendStateHistory(text, {
      timestamp: when, from_state: b.current_state, to_state: "published",
      blurb: `edition ${edition}`, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a publication "
                     + "recording no transition would leave prior_state pointing at a history the document "
                     + "does not carry (C-4.2)" };
    text = withHistory;
    text = Store.#setScalar(text, "prior_state", b.current_state);
    text = Store.#setScalar(text, "current_state", "published");
    /* setOrAdd throughout: an inquiry authored before this state existed
       carries none of these keys, and #setScalar alone would move the state and
       leave the entry requirements unmet — the bundle the catalog rejects. */
    text = Store.#setOrAddScalar(text, "edition", String(edition));
    text = Store.#setOrAddBlock(text, "completeness", [
      `  statement: "${stmt}"`,
      `  subject_position: ${pos}`,
      `  subject_justification: "${just}"`,
      `  author: ${who}`,
      `  at: "${when}"`]);
    text = Store.#setOrAddBlock(text, "completeness_excluded",
      rows.length
        ? rows.flatMap((r) => [
            ...(r.target ? [`  - target: ${r.target}`, `    description: "${r.description}"`]
                         : [`  - description: "${r.description}"`]),
            `    reason: "${r.reason}"`])
        : []);
    text = Store.#setOrAddBlock(text, "published_strength",
      Store.STRENGTH_AXES.flatMap((axis) => {
        const a = pair[axis];
        return [`  - axis: ${axis}`,
                `    state: ${a.state}`,
                `    grade: ${a.grade ?? "null"}`,
                `    weakest: ${a.weakest ? a.weakest.target_id : "null"}`,
                `    load_bearing: ${a.load_bearing}`,
                `    population: ${a.population}`,
                `    detail: "${Store.#fmSafe(a.detail)}"`];
      }));
    text = Store.#setOrAddBlock(text, "required_strength", [
      `  declared: ${bar.declared}`,
      `  source: ${bar.source}`,
      `  capture: ${bar.capture ?? "null"}`,
      `  connection: ${bar.connection ?? "null"}`,
      `  detail: "${Store.#fmSafe(bar.detail)}"`]);
    /* R4, RESERVED and deliberately empty: a published CHILD of a division
       names its parent and its siblings, so a reader who can see one half can
       see that the other half exists. REC-16 is the producer and does not exist
       yet — the keys are written now, with null and [], so the published shape
       does not change under readers once cases exist. */
    text = Store.#setOrAddScalar(text, "division_parent",
      typeof fm.division_parent === "string" ? fm.division_parent : "null");
    text = Store.#setOrAddScalar(text, "division_siblings",
      Array.isArray(fm.division_siblings) && fm.division_siblings.length
        ? `[${fm.division_siblings.join(", ")}]` : "[]");
    text = Store.#setScalar(text, "last_updated", `"${when}"`);

    /* The assertion in the BODY as well as the frontmatter, under the canonical
       heading C-3.1 now requires in this state. The frontmatter is what the
       projection and the gates read; this is what a person reads. */
    text = Store.#setSection(text, "## What This Excludes", [
      stmt, "",
      ...(rows.length
        ? rows.flatMap((r) => [`- ${r.target ? r.target + " — " : ""}${r.description || "(named above)"}: ${r.reason}`])
        : ["Nothing material was excluded from this case."]),
      "",
      `Position on putting this case to its subject: ${pos}. ${just}`]);

    const entry = `### Session ${when} | Published | ${who}\n`
                + `Trigger: op=publish on ${target}\n`
                + `Changes: state ${b.current_state} to published, edition ${edition}.\n`
                + `Completeness: ${stmt}\n`
                + `Excluded: ${rows.length} item(s).\n`
                + `Subject position: ${pos} — ${just}\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cutAt = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
    }

    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, target))
      carried.push(r.content !== null
        ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
        : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

    const bytes = new TextEncoder().encode(text);
    const promoted = this.promote({
      bundleId: target, base: b.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
      author: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type, group: fm.group || "believe-in-oakland",
              title: fm.title, current_state: "published", prior_state: b.current_state,
              created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, from: b.current_state, to: "published", edition,
             bundleSha: promoted.bundleSha,
             completeness: { statement: stmt, subject_position: pos, subject_justification: just,
                             author: who, at: when, excluded: rows.length },
             strength: Store.STRENGTH_AXES.map((axis) => ({ axis, state: pair[axis].state,
               grade: pair[axis].grade, weakest: pair[axis].weakest ? pair[axis].weakest.target_id : null })),
             required: bar, author: who, at: when, weight: "single",
             next: "review this sha and ratify it (op=ratify): the assertion is inside the bytes, so the "
                 + "signature can only be taken after it is written" };
  }

  static COMPLETENESS_MAX = 2000;

  /* Frontmatter-safe: the restricted grammar has no escapes, and these strings
     are DERIVED (a strength detail, a bar's explanation) rather than authored,
     so they are sanitised here rather than refused — an authored field is
     refused by name above, which is the difference that matters. */
  static #fmSafe(s) {
    return String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
  }

  /* DEC-17 as amended: the bar the GROUP declared as its default, which a
     PROJECT may override in its own bundle.md.
     *
     * WHY THE PROJECT HALF IS AUTHORED FRONTMATTER AND NOT A TABLE: DEC-17's
     * escape is that a group may lower its own bar and may not do it quietly —
     * *"the amendment is an authored, dated, on-the-record act visible in the
     * published case"*. A project's bundle.md IS that: authored, dated,
     * promoted through the gate, in append-only history. A settings row would be
     * a way to change the standard with nothing to read afterwards.
     *
     * AN INQUIRY OUTSIDE ANY PROJECT HAS NO PROJECT BAR (DEC-17): the
     * declaration is a property of a project, and inheriting one from elsewhere
     * would invent it. The group default still applies, because that is what a
     * default is.
     *
     * WHERE TWO PROJECTS CITE ONE INQUIRY, the STRICTEST declared bar wins PER
     * AXIS — never composed into one letter. This is mine to decide and the
     * reasoning is conservative-by-construction: a case used by two projects
     * must satisfy both, and taking the strictest can never let a case past a
     * bar somebody set for it. REC-15's preflight is where falling short is
     * refused; this only decides what is STAMPED. */
  #requiredStrengthFor(bundleId, fm) {
    const rank = (g) => ["A", "B", "C", "D"].indexOf(g);
    const strictest = { capture: null, connection: null };
    const projects = [];
    for (const r of this.#rows(
      `SELECT r.bundle_id FROM refs r JOIN bundles b ON b.bundle_id=r.bundle_id
       WHERE r.target_id=?`, bundleId)) {
      const pb = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, r.bundle_id);
      if (!pb || normalizeType(pb.object_type) !== "project") continue;
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, r.bundle_id);
      if (!md || md.content === null) continue;
      const pfm = parseFrontmatter(md.content).data || {};
      const rq = pfm.required_strength;
      if (!rq || typeof rq !== "object") continue;
      let named = false;
      for (const axis of ["capture", "connection"]) {
        if (!["A", "B", "C", "D"].includes(rq[axis])) continue;
        named = true;
        if (strictest[axis] === null || rank(rq[axis]) < rank(strictest[axis])) strictest[axis] = rq[axis];
      }
      if (named) projects.push(r.bundle_id);
    }
    if (projects.length)
      return { declared: true, source: "project", projects,
               capture: strictest.capture, connection: strictest.connection,
               detail: `required by ${projects.join(", ")}: capture ${strictest.capture ?? "not set"}, `
                     + `connection ${strictest.connection ?? "not set"}. The bar is the group's own `
                     + `declaration about its own work, stated in advance, and is never set by who a reader is.` };
    const g = this.#one(`SELECT capture, connection, author, at FROM group_strength_bar WHERE group_id=?`,
      fm?.group || "believe-in-oakland");
    if (g && (g.capture || g.connection))
      return { declared: true, source: "group", capture: g.capture ?? null, connection: g.connection ?? null,
               declared_by: g.author, declared_at: g.at,
               detail: `the group's default required strength: capture ${g.capture ?? "not set"}, `
                     + `connection ${g.connection ?? "not set"}, declared by ${g.author} on ${g.at}.` };
    /* Undetermined is first-class and must be STATED. An absent bar gates
       nothing, and it is NOT a bar of zero. */
    return { declared: false, source: "none", capture: null, connection: null,
             detail: "no required evidentiary strength was declared for this case, by the group or by any "
                   + "project citing it, so nothing here was measured against one. An absent bar is not a bar "
                   + "of zero, and this case makes no claim to have cleared any standard." };
  }

  /* DEC-17 as amended: the GROUP sets the default a new project starts from.
     A PAIR, per R2 — a scalar would re-collapse the two axes in the one field a
     reader is most likely to quote. Either axis may be left unset; what may not
     happen is a bar that gates while saying nothing about which axis it gates. */
  strengthBarSet({ group = null, capture = null, connection = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || who === "member" || /^token:/.test(who))
      return { ok: false, reason: "MACHINE_CANNOT_DECLARE",
               detail: "the required evidentiary strength is the GROUP's declaration about its own work. A "
                     + "machine credential may not make it. Sign in as a member." };
    const gid = String(group ?? "").trim() || "believe-in-oakland";
    for (const [axis, v] of [["capture", capture], ["connection", connection]])
      if (v != null && !["A", "B", "C", "D"].includes(v))
        return { ok: false, reason: "BAD_GRADE", axis, detail: `${axis} must be one of A, B, C, D, or null` };
    if (capture == null && connection == null)
      return { ok: false, reason: "NO_BAR",
               detail: "declare at least one axis. Withdrawing a bar entirely is a different act from setting "
                     + "one, and an absent bar is stated as absent rather than written as a blank row." };
    const at = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO group_strength_bar (group_id,capture,connection,author,at) VALUES (?,?,?,?,?)
       ON CONFLICT(group_id) DO UPDATE SET capture=excluded.capture, connection=excluded.connection,
         author=excluded.author, at=excluded.at`,
      gid, capture, connection, who, at);
    return { ok: true, group: gid, capture, connection, author: who, at,
             note: "this is the DEFAULT a project starts from; a project may declare its own in its bundle.md, "
                 + "which is an authored, dated, on-the-record act visible in every case it governs." };
  }

  /** REC-30's sweep, applied to REC-14's read: `#requiredStrengthFor` reports
   *  `projects: [...]` and interpolates the same ids into its `detail`, which is
   *  the §7.9 reverse-edge walk op=backlinks was gated for, arriving again by a
   *  new door — an uninvited member asking the bar of a shared Information
   *  learned the ids of the secret projects citing it.
   *
   *  THE BAR VALUE ITSELF IS NOT GATED, deliberately, and this is the one place
   *  in the sweep where I left a signal standing. DEC-17's stake, stated in
   *  #requiredStrengthFor's own comment, is that the bar "is never set by who a
   *  reader is": it is the case's property, and a reader-dependent bar would let
   *  the plane tell one member "no required strength was declared for this case"
   *  while the record holds one — an affirmative false statement about the
   *  record, which this project ranks above a narrow inference. It costs the
   *  stamp nothing: op=publish computes the bar from #requiredStrengthFor
   *  directly (see publishCase), so what lands in the published bytes is the
   *  whole corpus's answer whatever this read shows.
   *
   *  So: identities withheld, value kept, and the withholding STATED without a
   *  count — #queueAncestors' `out_of_view` posture exactly. THE RESIDUAL IS
   *  REAL AND IS NAMED RATHER THAN PAPERED OVER: `source: "project"` on a target
   *  only invisible projects cite still says that SOME project declares a bar on
   *  it. It names none of them, which is the rule this sweep enforces, and
   *  closing it would mean making the bar a function of the reader. */
  strengthBarOf({ group = null, target = null, viewer = null } = {}) {
    if (target) {
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
      const fm = md && md.content !== null ? (parseFrontmatter(md.content).data || {}) : {};
      const bar = this.#requiredStrengthFor(target, fm);
      if (!Array.isArray(bar.projects)) return { ok: true, target, bar };
      const keep = this.#bundleRedactor(viewer);
      const visible = bar.projects.filter((id) => keep(id) !== null);
      if (visible.length === bar.projects.length) return { ok: true, target, bar };
      return { ok: true, target, bar: {
        ...bar, projects: visible, projects_out_of_view: true,
        detail: (visible.length
          ? `required by ${visible.join(", ")} and by at least one project you may not see: `
          : "required by at least one project you may not see: ")
          + `capture ${bar.capture ?? "not set"}, connection ${bar.connection ?? "not set"}. `
          + "The bar is the group's own declaration about its own work, stated in advance, and is never "
          + "set by who a reader is: the value here is the whole record's, and only the names are withheld." } };
    }
    const gid = String(group ?? "").trim() || "believe-in-oakland";
    const g = this.#one(`SELECT group_id, capture, connection, author, at FROM group_strength_bar WHERE group_id=?`, gid);
    return { ok: true, group: gid, bar: g || null,
             detail: g ? null : "no group default is declared. An absent bar gates nothing and is not a bar of zero." };
  }

  /* REC-14: replace a heading's SECTION body, or open the section if the
     document has none. Used for `## What This Excludes`, which C-3.1 requires
     in the published state — the frontmatter is what the gates read and this is
     what a person reads, and they are written in the same act so they cannot
     disagree. */
  static #setSection(text, heading, lines) {
    const at = text.indexOf(`\n${heading}\n`);
    const body = `${heading}\n\n${lines.join("\n")}\n`;
    if (at === -1) return text.replace(/\s*$/, "\n") + "\n" + body;
    const start = at + 1;
    const nxt = text.indexOf("\n## ", start + 1);
    const end = nxt === -1 ? text.length : nxt + 1;
    return text.slice(0, start) + body + "\n" + text.slice(end);
  }

  /* A frontmatter BLOCK (a map or an array of objects), written whole. The
     scalar setters cannot express either, and a block that is edited in place
     rather than rewritten is a block that can end up half from one edition and
     half from another — which is exactly what C-21.1 exists to catch and is not
     a state this act should be able to produce in the first place. */
  static #removeBlock(text, key) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return text;
    const end = lines.indexOf("---", 1);
    if (end === -1) return text;
    let at = -1;
    for (let i = 1; i < end; i++) if (lines[i].startsWith(key + ":")) { at = i; break; }
    if (at === -1) return text;
    let last = at;
    for (let i = at + 1; i < end; i++) {
      if (/^\s/.test(lines[i]) && lines[i].trim() !== "") last = i; else break;
    }
    return [...lines.slice(0, at), ...lines.slice(last + 1)].join("\n");
  }

  static #setOrAddBlock(text, key, block) {
    const t = Store.#removeBlock(text, key);
    const lines = t.split("\n");
    if (lines[0] !== "---") return t;
    const end = lines.indexOf("---", 1);
    if (end === -1) return t;
    return [...lines.slice(0, end), `${key}:`, ...block, ...lines.slice(end)].join("\n");
  }

  /* Rewrite the `status` and `note` of specific `cites` entries in place,
     touching nothing else. Walks the references block entry by entry, tracking
     which target the current entry belongs to, and edits only the two lines of
     the entries named in `changes`. An entry whose note line is absent gains
     one, because the reason has to land somewhere. */
  static #spliceEdgeStatus(text, changes) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    let ref = -1;
    for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) { ref = i; break; }
    if (ref === -1) return null;

    /* Entry boundaries first, so an edit never runs past the entry it belongs
       to. An entry starts at `  - ` and ends before the next one or at the end
       of the block. */
    const starts = [];
    for (let i = ref + 1; i < end; i++) {
      if (/^ {2}- /.test(lines[i])) starts.push(i);
      else if (!/^\s/.test(lines[i]) && lines[i].trim() !== "") break;
    }
    if (!starts.length) return null;
    const blockEnd = (() => {
      let last = ref;
      for (let i = ref + 1; i < end; i++) {
        if (lines[i].trim() === "") continue;
        if (/^\s/.test(lines[i])) { last = i; continue; }
        break;
      }
      return last;
    })();

    const out = lines.slice();
    let applied = 0;
    for (let s = 0; s < starts.length; s++) {
      const from = starts[s], to = (s + 1 < starts.length ? starts[s + 1] : blockEnd + 1) - 1;
      let target = null;
      for (let i = from; i <= to; i++) {
        const m = /^\s*(?:- )?target:\s*(.+?)\s*$/.exec(lines[i]);
        if (m) { target = m[1].replace(/^["']|["']$/g, ""); break; }
      }
      if (!target || !changes.has(target)) continue;
      const ch = changes.get(target);
      let sawNote = false, statusLine = -1;
      for (let i = from; i <= to; i++) {
        if (/^\s*(?:- )?status:/.test(lines[i])) { out[i] = "    status: " + ch.status; statusLine = i; }
        if (/^\s*(?:- )?note:/.test(lines[i])) { out[i] = `    note: "${ch.note}"`; sawNote = true; }
      }
      if (statusLine === -1) return null;   // an entry with no status is not ours to guess at
      if (!sawNote) out[statusLine] = out[statusLine] + `\n    note: "${ch.note}"`;
      applied++;
    }
    return applied === changes.size ? out.join("\n") : null;
  }

  /* ---- the first action that refers to a selection ----
   *
   * CITING INFORMATION IN A PROJECT, at weight `report`.
   *
   * `selectionResolve` shipped in 0.17.0 with no caller. This is its first, and
   * citing was chosen for it because it ADDS references rather than moving
   * state: drift is survivable, so the reporting arm of the gate gets exercised
   * before anything can be broken by it. The refusing arm gets its first caller
   * from the first state-changing action, deliberately not this one.
   *
   * WEIGHT IS NOT A PARAMETER. It is `report` because of what this action IS,
   * and the op reads no weight from the caller. A caller that could choose the
   * weight would make the whole distinction advisory.
   *
   * Citing writes the edge into bundle.md and promotes, because `refs` is a
   * PROJECTION re-derived from frontmatter inside promote's transaction and
   * promote refuses a refs field in the payload outright (D-21). The document is
   * authoritative; there is no second place to state an edge.
   *
   * Fully synchronous, and that is load-bearing rather than incidental. The
   * catalog's own sha256 is pure JS, so nothing between resolving the selection
   * and committing the promotion awaits, and a Durable Object is single
   * threaded: no other write can interleave. The CAS is still passed and still
   * checked, but it is a backstop here rather than the only guard.
   */
  cite({ project = null, handle = null, viewer = null, owner = null,
         note = "", author = null } = {}) {
    /* The gate first, so an unknown or someone else's selection is refused
       before this method has looked at a project at all. */
    const sel = this.selectionResolve({ handle, viewer, owner, weight: "report" });
    if (!sel.ok) return sel;

    const p = this.#one(`SELECT bundle_id, object_type, bundle_sha FROM bundles WHERE bundle_id=?`, project);
    if (!p) return { ok: false, reason: "NO_SUCH_PROJECT", project,
                     detail: "the citing object must exist before it can cite anything" };
    if (p.object_type !== "project")
      return { ok: false, reason: "NOT_A_PROJECT", project, got: p.object_type,
               detail: "cites lives on the citing object and this action cites INTO a Project (State Rules 5.2)" };

    /* A note is written into the restricted frontmatter grammar, whose scalar
       parser strips surrounding quotes and understands no escapes at all. A
       quote or a newline in here would not be escaped, it would silently
       reshape the document. Refused rather than sanitised: mangling an
       operator's words is worse than declining them. */
    const nt = String(note ?? "");
    if (nt.length > 200 || /["\\\r\n]/.test(nt))
      return { ok: false, reason: "BAD_NOTE",
               detail: "a note is at most 200 characters and cannot contain a quote, a backslash, or a newline" };

    /* Every member of the selection must be Information. A selection carrying
       anything else is REFUSED with the offenders named, never filtered down to
       the citable subset: quietly narrowing a set changes what the operator's
       click meant, which is the same reason an oversized enumeration is refused
       rather than downgraded. This also catches a Project citing itself, which
       is a cycle with nothing to mean. */
    const offenders = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") offenders.push(id);
    }
    if (offenders.length)
      return { ok: false, reason: "NOT_INFORMATION", project, handle,
               offenders: offenders.sort(), drift: sel.drift,
               detail: "citing Information means Information. These members of the selection are not, "
                     + "and the whole call is refused rather than narrowed to the ones that are." };

    const liveMd = this.#one(`SELECT content, sha256 FROM files WHERE bundle_id=? AND path='bundle.md'`, project);
    if (!liveMd || typeof liveMd.content !== "string")
      return { ok: false, reason: "NO_BUNDLE_MD", project };
    const parsed = parseFrontmatter(liveMd.content);
    if (!parsed.data)
      return { ok: false, reason: "UNPARSEABLE_FRONTMATTER", project,
               detail: "the project's own bundle.md does not parse under the restricted grammar" };

    /* Partition the selection against the edges the document already carries.
     *
     * SEVERED IS NOT ABSENT. A severed edge is a recorded human judgment,
     * preserved with its reason the same way a dismissed Problem is greyed and
     * never deleted. Reinstating one is a state change and cannot ride inside a
     * report-weight action; skipping one quietly narrows the operator's set.
     * Both would decide something the operator did not, so the call is refused
     * and handed back. Reinstatement is its own action, at weight `refuse`,
     * requiring a reason the way severing does. Bob's decision, 2026-07-25. */
    const existing = Array.isArray(parsed.data.references) ? parsed.data.references : [];
    const byTarget = new Map();
    for (const r of existing)
      if (r && typeof r === "object" && r.rel === "cites" && typeof r.target === "string")
        byTarget.set(r.target, r.status);

    const severed = [], already = [], add = [];
    for (const id of sel.members) {
      const st = byTarget.get(id);
      if (st === "severed") severed.push(id);
      else if (st !== undefined) already.push(id);
      else add.push(id);
    }
    if (severed.length)
      return { ok: false, reason: "SEVERED_EDGE", project, handle,
               offenders: severed.sort(), drift: sel.drift,
               detail: "these targets already carry a SEVERED cites edge, which is a recorded decision to cut "
                     + "the dependency, not the absence of one. Citing neither reverses it silently nor skips "
                     + "past it. Reinstating a severance is a separate action that records its own reason." };

    const when = new Date().toISOString().replace(/\.\d+Z$/, "Z");

    /* Nothing to do is a SUCCESS that writes nothing. Citing has to be safely
       retryable, because drift is reported rather than fatal and an operator
       who reads a drift report will reasonably press the button again. A no-op
       that still promoted would put an empty revision in an append-only
       history every time. */
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", project, handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to cite. It may have "
                     + "named ids that do not exist, or its members may have been purged or hidden since "
                     + "it was made." };
    if (!add.length)
      return { ok: true, project, handle, weight: "report", moved: sel.moved, drift: sel.drift,
               cited: [], alreadyCited: already.sort(), severed: [],
               bundleSha: p.bundle_sha, rowVersion: null,
               detail: "every member of the selection was already cited; nothing was written" };

    const spliced = Store.#spliceReferences(
      liveMd.content, add.map((target) => ({ rel: "cites", target, status: "confirmed", note: nt })));
    if (!spliced)
      return { ok: false, reason: "UNSPLICEABLE_REFERENCES", project,
               detail: "the project's references block is not in a shape this grammar can extend in place. "
                     + "Citing edits only that block and never rewrites the rest of the document." };

    /* last_updated moves, so C-13.2 requires a Session Log entry. That is not
       check-appeasement: what the record is FOR is saying who did what and on
       what basis, and an edge appearing with no account of why is the shape of
       an unaccountable change. */
    let text = Store.#setScalar(spliced, "last_updated", `"${when}"`);
    /* BOUNDED, on the same reasoning as the audit's offender list: a Session Log
       entry must not answer with a megabyte of repetition. Listing every id was
       measured at 24 bytes per edge on top of the 83 the reference block itself
       costs, so an unbounded entry put nearly a quarter of the document's growth
       into prose restating what the references array already says exactly. The
       edges are the record; the log entry accounts for the act. */
    const shown = add.slice(0, Store.CITE_LOG_SAMPLE);
    const listed = shown.join(", ")
                 + (add.length > shown.length ? `, and ${add.length - shown.length} more` : "");
    const entry = `### Session ${when} | Cited ${add.length} Information record${add.length === 1 ? "" : "s"}`
                + ` | ${author || "member"}\n`
                + `Trigger: selection ${handle}${sel.moved ? " (the set had moved since it was made; "
                    + "citing is report-weight and proceeded)" : ""}\n`
                + `Changes: cites edges added to ${listed}.`
                + `${nt ? ` Note: ${nt}.` : ""}\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cut = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
    }

    /* Every OTHER file carried forward untouched. promote writes a whole image,
       so a writer that mentions one file deletes the rest, and that default has
       already destroyed evidence twice here: the monitor's first tick removed
       the provenance register of every bundle it touched. Citing rewrites
       bundle.md and is exactly the same shape of writer. */
    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, project))
      carried.push(r.content !== null
        ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
        : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

    const bytes = new TextEncoder().encode(text);

    /* MEASURED, 2026-07-25, and a collision between two numbers that were set
       independently and had never met. An enumerated selection is capped at
       10,000 members (SELECTION_MAX_ITEMS) and every member costs about 83
       bytes of references block, so a MAXIMUM LEGAL SELECTION produced a
       1,070,846-byte bundle.md against an INLINE_MAX of 1,048,576 and was
       refused by promote with OVERSIZE_INLINE: an error about inline byte
       storage, in answer to an operator who selected a legal number of records
       and pressed cite.
       Refused here instead, before anything is written, in words that name the
       real limit and what to do. The whole call is refused rather than the first
       N edges taken, for the same reason an oversized enumeration is refused
       rather than downgraded: citing a prefix would silently change which
       records the operator's click meant. bundle.md cannot spill to R2 to escape
       this, because the gate compares it byte-wise against history (C-5, C-12)
       and schema.mjs keeps every file the gate reads inline by rule. */
    if (bytes.length > INLINE_MAX) {
      const overhead = bytes.length - add.length * Store.CITE_EDGE_BYTES;
      return { ok: false, reason: "CITATION_TOO_LARGE",
               project, handle, drift: sel.drift,
               requested: add.length, bytes: bytes.length, limit: INLINE_MAX,
               roomFor: Math.max(0, Math.floor((INLINE_MAX - overhead) / Store.CITE_EDGE_BYTES)),
               detail: "citing this many records at once would push the Project's bundle.md past the "
                     + "1MB inline limit. Every edge is written into the document, so the ceiling is on "
                     + "edges in one Project, not on the size of a selection. Cite in smaller batches; "
                     + "nothing has been written." };
    }

    const textSha = createSha256().update(bytes).hex();
    const fm = parsed.data;

    /* Hand-authored, not mechanical. A member citing evidence is authorship, so
       no writer and no operation are claimed and C-20.1's mechanical envelope
       does not apply. It also means #revisionKind classifies a citation
       revision as `authored`, which is what a later drift report should say
       about it. */
    const promoted = this.promote({
      bundleId: project, base: p.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
      author: author || "member",
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: textSha }, ...carried],
      meta: {
        object_type: "project", group: fm.group || "believe-in-oakland", title: fm.title,
        current_state: fm.current_state, prior_state: fm.prior_state ?? null,
        created: fm.created, last_updated: when,
        criticality: fm.criticality ?? null,
      },
    });
    if (!promoted.ok) return { ...promoted, project, handle, drift: sel.drift };

    return { ok: true, project, handle, weight: "report", moved: sel.moved, drift: sel.drift,
             cited: add.slice().sort(), alreadyCited: already.sort(), severed: [],
             bundleSha: promoted.bundleSha, rowVersion: promoted.rowVersion,
             gate: sel.gate, expires: sel.expires };
  }

  /* Rewrite ONE column-0 scalar inside the frontmatter, leaving every other
     byte alone. Line-oriented on purpose: the same approach the monitor takes,
     and the reason is that this repo has no frontmatter SERIALIZER, only a
     parser. Re-emitting a parsed document would reorder keys, drop comments and
     renormalise quoting across the whole file to change one field. */
  /* Append one entry to the `state_history` block, handling the inline-empty and
     populated shapes the corpus actually contains, exactly as #spliceReferences
     does for references. Returns null if the block is in a shape this restricted
     grammar cannot extend, so the caller refuses rather than guesses. */
  static #appendStateHistory(text, e) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = [`  - timestamp: "${e.timestamp}"`,
                   `    from_state: ${e.from_state}`,
                   `    to_state: ${e.to_state}`,
                   `    blurb: "${e.blurb}"`,
                   `    author: ${e.author}`];
    let at = -1;
    for (let i = 1; i < end; i++) if (/^state_history:/.test(lines[i])) { at = i; break; }
    if (at === -1) return [...lines.slice(0, end), "state_history:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[at].slice("state_history:".length).trim();
    if (rest === "[]") return [...lines.slice(0, at), "state_history:", ...block, ...lines.slice(at + 1)].join("\n");
    if (rest !== "") return null;
    /* Populated block: find its end and append, so entries stay chronological. */
    let last = at;
    for (let i = at + 1; i < end; i++) {
      if (/^\s/.test(lines[i]) && lines[i].trim() !== "") last = i;
      else break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }

  static #setScalar(text, key, value) {
    const lines = text.split("\n");
    const end = lines.indexOf("---", 1);
    for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
      if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
    }
    return text;
  }

  /* #setScalar for a key that may not be there yet (REC-13). It returns the
     text UNCHANGED when the key is absent, which is right for the fields every
     document already carries (current_state, prior_state, last_updated) and
     wrong for a field a NEW state introduces: an inquiry authored before
     `concluded` existed carries no `conclusion:` line, and silently not
     writing one would move the state while leaving its own entry requirement
     unmet — the bundle the catalog then rejects. Absent, the key is opened
     immediately before the closing fence, the #spliceReferences convention. */
  /* CORRECTED 2026-08-04 (REC-14), and the old form was WRONG rather than
     superseded. It decided "was the key there?" by asking "did the text
     CHANGE?" — so writing a key its EXISTING VALUE appended a SECOND copy of
     it, and the document then carried a duplicate top-level key that C-2.1
     refuses. Nothing caught it because no act had ever written the same value
     twice: REC-13's conclude() was only ever called once per document until
     DEC-12 made a case reopen, be concluded AGAIN with the same falsifier, and
     republish. The gate found it (`duplicate top-level key 'falsifier'`), which
     is the layering working, but the write should never have produced it.
     Presence is now decided by LOOKING, which is what the question was. */
  static #setOrAddScalar(text, key, value) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return text;
    const end = lines.indexOf("---", 1);
    if (end === -1) return text;
    for (let i = 1; i < end; i++)
      if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
    return [...lines.slice(0, end), `${key}: ${value}`, ...lines.slice(end)].join("\n");
  }

  /* Splice new entries into the `references` block, touching nothing else.
   *
   * Three shapes are reachable in the corpus and all three are handled: an
   * inline empty `references: []`, a populated block, and a document with no
   * references key at all. A key whose value is any OTHER inline scalar is
   * refused by returning null rather than guessed at, because the restricted
   * grammar cannot express an inline array of objects and a wrong guess would
   * corrupt the document silently. */
  static #spliceReferences(text, additions) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;

    const block = additions.map((a) =>
      `  - rel: ${a.rel}\n    target: ${a.target}\n    status: ${a.status}\n    note: "${a.note ?? ""}"`);

    let ref = -1;
    for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) { ref = i; break; }

    if (ref === -1)   // no key at all: open one immediately before the closing fence
      return [...lines.slice(0, end), "references:", ...block, ...lines.slice(end)].join("\n");

    const rest = lines[ref].slice("references:".length).trim();
    if (rest === "[]")   // an empty inline array becomes a block
      return [...lines.slice(0, ref), "references:", ...block, ...lines.slice(ref + 1)].join("\n");
    if (rest !== "") return null;   // some other inline scalar: not ours to reinterpret

    /* A block. Append after its LAST indented line, so a blank line sitting
       between the block and the next column-0 key stays where the author put
       it rather than being swallowed into the array. */
    let last = ref;
    for (let i = ref + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) { last = i; continue; }
      break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- reads: what storeReadAdapter_ did, without the re-resolution tax ---- */

  readFile(bundleId, path) {
    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);
    if (!r) return null;
    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
  }

  /** The canonical snapshot path for a file archived under a snapshot key.
   *
   *  The key goes in the FILENAME, not in a directory: `bundle.md` archived
   *  under key K is `_history/bundle_K.md`, and `data/changes.json` is
   *  `_history/data/changes_K.json`. This is not a style choice. The bundle
   *  format is authoritative (see schema.mjs line 3) and the check catalog
   *  parses exactly this shape, so a directory-per-key projection makes every
   *  snapshot in every bundle unaccountable to C-12.2 while losing no bytes.
   *  That is precisely what happened: 168 findings across 30 bundles, all of
   *  them this one mistake, invisible until the catalog could be run. */
  static snapPath(path, snapKey) {
    const cut = path.lastIndexOf("/");
    const dir = cut === -1 ? "" : path.slice(0, cut + 1);
    const name = cut === -1 ? path : path.slice(cut + 1);
    const dot = name.lastIndexOf(".");
    return dot === -1
      ? `_history/${dir}${name}_${snapKey}`
      : `_history/${dir}${name.slice(0, dot)}_${snapKey}${name.slice(dot)}`;
  }


  /* A whole-store conformance pass, run WHERE THE DATA IS.
   *
   * The benchmark that produced this: gating 20,000 bundles from outside costs
   * about 2,060 seconds on the deployed plane and 63 locally, and roughly 97% of
   * the difference is one network round trip per image. The store and the checks
   * are not the constraint; fetching bundles one at a time is. The catalog is a
   * pure function over an injected filesystem and the images are already here, so
   * the pass belongs here too.
   *
   * Paginated rather than exhaustive, because a Durable Object has a CPU budget
   * and 20,000 bundles is about 63 seconds of work. A page of a few hundred is
   * well inside it, and a hundred calls instead of twenty thousand captures
   * essentially all of the benefit. The cursor is the last bundle id seen, so a
   * pass is resumable and does not depend on a snapshot of the store.
   *
   * Blob-backed files are declared elided, exactly as the gate does: existence
   * assertions see them, byte checks skip them, and capture integrity was proven
   * at write time by the capture op rather than re-proven here.
   */
  async auditPass({ after = "", limit = 200, viewer = null } = {}) {
    const cap = Math.max(1, Math.min(1000, Number(limit) || 200));
    /* REC-30: `known` stays the WHOLE corpus and never leaves this method. It is
       the checker's answer to "does this reference resolve", and filtering it
       would manufacture dangling-reference findings out of a viewer's position —
       a false claim about the record, which is worse than the leak. The store is
       a legitimate whole-corpus reader internally (REC-25's own posture for
       #queueAncestors' existence probe); what is gated is what LEAVES. */
    const known = new Set(this.#rows(`SELECT bundle_id FROM bundles`).map((r) => r.bundle_id));
    /* The PAGE is gated, so `offenders` — the only place this answer names a
       bundle — can only ever name one the viewer may see. `total` is gated with
       it for REC-25's reason: a total larger than the pages says something is
       being withheld, which is half the leak. */
    const gate = viewerPredicate(viewer);
    const page = this.#rows(
      `SELECT b.bundle_id FROM bundles b WHERE b.bundle_id > ? AND (${gate.sql}) ORDER BY b.bundle_id LIMIT ?`,
      after, ...gate.args, cap);
    const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
    const te = new TextEncoder();
    const sha256 = async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v));
    const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));

    const tally = {}; const offenders = [];
    let clean = 0, withErrors = 0;
    for (const row of page) {
      const img = this.readImage(row.bundle_id) || {};
      const files = new Map(), elided = new Set();
      for (const [path, v] of Object.entries(img)) {
        if (typeof v === "string") files.set(path, v); else elided.add(path);
      }
      const { findings } = await checkBundle({
        folderName: row.bundle_id, files, elidedPaths: elided,
        sha256, sha512, resolveTarget: (id) => known.has(id),
      });
      const errs = findings.filter((f) => f.severity === "error");
      if (!errs.length) { clean++; continue; }
      withErrors++;
      for (const e of errs) tally[e.check] = (tally[e.check] || 0) + 1;
      /* Bounded: a pass over a broken store must not answer with a megabyte of
         repetition. The tally says how much, these say what it looks like. */
      if (offenders.length < 20)
        offenders.push({ bundleId: row.bundle_id,
                         errors: errs.slice(0, 5).map((e) => ({ check: e.check, detail: e.message })) });
    }
    const last = page.length ? page[page.length - 1].bundle_id : after;
    return {
      ok: true, checked: page.length, clean, withErrors, tally, offenders,
      cursor: page.length === cap ? last : null,
      total: this.#one(`SELECT COUNT(*) AS n FROM bundles b WHERE (${gate.sql})`, ...gate.args).n,
    };
  }

  /** The byte-complete image the gate consumes. One bundle, one call, no
   *  per-file resolution. This is the operation that cost ~43s on Drive.
   *
   *  Projects three things the catalog requires and an earlier version of this
   *  method did not: canonical snapshot paths, a verbatim promotion record per
   *  manifest entry, and the manifest's own entries. The promotion record is
   *  load-bearing beyond its own check: classifyDivergence reconstructs the
   *  bundle.md hash chain from the per-file sha256 lists inside it, and C-20.1
   *  uses it to establish what a mechanical writer actually changed. Without
   *  the records both are unreachable rather than passing. */
  readImage(bundleId) {
    const img = {};
    /* A blob reference carries its size as well as its hash, because a caller
       rewriting one file of a bundle has to hand every OTHER file back to
       promote unchanged, and promote needs bytes to record. Without this a
       partial writer silently drops what it did not mention: the monitor's
       first tick deleted the provenance register of every bundle it touched. */
    for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=?`, bundleId))
      img[r.path] = r.content !== null ? r.content
        : { blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes };
    /* Per-snapshot file hashes, collected while walking history so the
       promotion records below can carry them without a second pass. */
    const snapFiles = new Map();
    for (const r of this.sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId)) {
      img[Store.snapPath(r.path, r.snap_key)] =
        r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
      if (!snapFiles.has(r.snap_key)) snapFiles.set(r.snap_key, []);
      snapFiles.get(r.snap_key).push({ name: r.path, sha256: r.sha256 });
    }
    const entries = [];
    for (const r of this.sql.exec(`SELECT snap_key, kind, base, author, created, files_json, writer, operation FROM manifest WHERE bundle_id=?`, bundleId)) {
      /* files_json holds the files as WRITTEN by this promotion, with their
         hashes. Two consumers want different views of it and both are right:
         the manifest entry wants names, because C-20.1 asks whether a later
         entry touched bundle.md; the verbatim promotion record wants the
         hashes, because that is how classifyDivergence rebuilds the chain and
         how C-20.1 decides whether live is still this promotion's result. An
         earlier version stored only names here and put the PRE-image hashes in
         the record, which made every mechanical audit unknowable and silently
         skipped. */
      const written = JSON.parse(r.files_json);
      const writtenPairs = written.map((f) => typeof f === "string" ? { name: f, sha256: null } : f);
      const files = writtenPairs.map((f) => f.name);
      const snapshotted = (snapFiles.get(r.snap_key) || []).map((f) => f.name);
      entries.push({ key: r.snap_key, kind: r.kind, base: r.base, author: r.author,
                     created: r.created, files, snapshotted,
                     ...(r.writer ? { writer: r.writer, operation: r.operation } : {}) });
      /* The verbatim promotion record, in the shape the original accelerator
         wrote and the catalog reads: what was targeted, what it was based on,
         and the hash of every file as promoted. */
      img[`_history/promotion_${r.snap_key}.json`] = JSON.stringify({
        target: bundleId, base: r.base, files: writtenPairs,
        created: r.created, author: r.author, skill_version: "bio-plane",
        /* C-20.1 reads the writer and operation from HERE, not from the
           manifest, so a mechanical claim that is not in the promotion record is
           a claim the auditor never sees. */
        ...(r.writer ? { writer: r.writer, operation: r.operation } : {}),
      }, null, 2);
    }
    if (entries.length) {
      entries.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
      img["_history/manifest.json"] = JSON.stringify({ entries }, null, 2);
    }
    return Object.keys(img).length ? img : null;
  }

  /* Every bundle, or a page of them.
   *
   * Measured: 81ms at 5,000 bundles and 434ms at 20,000, which is honestly linear
   * and about two seconds at 100,000. It returned everything because nothing had
   * ever needed less, and a caller that wants everything can still have it, since
   * breaking that would break the browser, the audit, and the migration verifier
   * at once.
   *
   * So paging is OPT-IN and shaped like the audit's: a cursor that is the last
   * identifier seen, which makes it resumable and independent of any snapshot of
   * the store. A caller that passes no limit gets what it always got. */
  listBundles(filter = {}) {
    /* REC-25 / F-8: the D-15 viewer gate, from query.mjs's ONE compilation
       point. Fail closed — an absent viewer compiles to the deny predicate, so
       the failure mode of a missing control-plane stamp is an empty list rather
       than an unfiltered one, exactly as the search path already behaves. */
    const gate = viewerPredicate(filter.viewer);
    let q = `SELECT b.bundle_id, b.object_type, b.current_state, b.title, b.last_updated, b.bundle_sha FROM bundles b`;
    const w = [`(${gate.sql})`], a = [...gate.args];
    /* The projection stores canonical types only (boot normaliser + promote),
       so a legacy `focus`/`problem` filter value is honoured through the
       catalog's own map rather than answered with an empty page — the same
       courtesy query.mjs extends to `type:` filters (REC-10). */
    if (filter.type) { w.push(`b.object_type=?`); a.push(normalizeType(filter.type)); }
    if (filter.state) { w.push(`b.current_state=?`); a.push(filter.state); }
    if (filter.after) { w.push(`b.bundle_id > ?`); a.push(filter.after); }
    q += ` WHERE ` + w.join(" AND ");
    q += ` ORDER BY b.bundle_id`;
    const limit = Number(filter.limit);
    if (!Number.isFinite(limit) || limit <= 0) return this.#rows(q, ...a);
    const cap = Math.min(5000, Math.floor(limit));
    const rows = this.#rows(q + ` LIMIT ?`, ...a, cap);
    /* The shape changes only when paging was asked for, so no existing caller
       has to learn a new answer. The total counts what the VIEWER may see:
       a count that included invisible rows would say "something is hidden",
       which is half the leak. */
    return { bundles: rows, cursor: rows.length === cap ? rows[rows.length - 1].bundle_id : null,
             total: this.#one(`SELECT COUNT(*) AS n FROM bundles b WHERE (${gate.sql})`, ...gate.args).n };
  }

  /** The index projection. One stored artifact on Drive, one query here.
   *  Note the absence of `locator`: there is no substrate path to leak.
   *  REC-25 / F-8: §7.9 names the index as the one place the graph could
   *  escape, so the D-15 gate applies here as everywhere — fail closed. */
  buildIndex({ viewer = null } = {}) {
    const gate = viewerPredicate(viewer);
    return {
      generated: new Date().toISOString(),
      version: 2,
      bundles: this.#rows(
        `SELECT b.bundle_id AS id, b.object_type, b.current_state, b.title, b.last_updated, b.bundle_sha AS sha256
         FROM bundles b WHERE (${gate.sql}) ORDER BY b.bundle_id`, ...gate.args),
    };
  }

  /** REC-25: may this viewer see this bundle at all? The D-15 predicate over a
   *  single row, used to gate the whole-image and single-file reads, which are
   *  not SQL over the projection and so cannot carry the predicate inline.
   *  False for an absent bundle AND for an invisible one, deliberately: the
   *  two must be indistinguishable to the caller. */
  #viewerSees(bundleId, viewer) {
    if (!bundleId) return false;
    const gate = viewerPredicate(viewer);
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                       bundleId, ...gate.args);
  }

  /* ======================= REC-30 · the posture sweep ======================
   *
   * REC-25 stamped the D-15 gate onto every read that is ADDRESSED to a bundle.
   * What was left were the reads addressed to something ELSE — a capture, an
   * entity, a task, a reference, a dangling edge — that name a bundle on the way
   * past. `op=dangling` was the measured one (a project citing a nonexistent
   * target put the PROJECT's id in an uninvited member's hands), and the same
   * shape runs through the task inbox, the queue's subjects, the recogniser and
   * progression reads, and the two paging integrity sweeps.
   *
   * ONE COMPILATION POINT, still. Both helpers below take their predicate from
   * query.mjs's `viewerPredicate` and neither restates it — including its two
   * arms that are easy to get wrong by hand: the MACHINE CARVE-OUT (a machine
   * credential has no person behind it and is deliberately not filtered) and the
   * FAIL-CLOSED deny (an absent or unrecognised viewer sees nothing, so a
   * missing control-plane stamp is an outage and never a leak).
   *
   * TWO SHAPES, because the reads are two shapes:
   *
   *   the row IS ABOUT the bundle  ->  the ROW is withheld (`#bundleGate`, in
   *     SQL). A dangling edge, a task, a queue obligation: withhold the row and
   *     report no count of what was withheld, because that count is the leak.
   *     This is op=backlinks' own posture, landed by REC-25.
   *
   *   the row is about a CAPTURE or an ENTITY and merely POINTS BACK at the
   *     bundle the document lives in  ->  the REFERENCE alone is withheld
   *     (`#bundleRedactor`, in JS). The row stands, and so do its capture sha,
   *     its grade and every derivation over it: those are the RECORD's facts and
   *     they must not change with the reader. A grade that got stronger because
   *     someone was not invited to a project would be the record claiming more
   *     than it can support, which is worse than the leak we are closing.
   *
   * WHAT IS DELIBERATELY UNGATED is listed, with its reason, in
   * `test/gate-reads.test.mjs`. It is a shorter list than it looks: the
   * published projection is credential-free BY DESIGN, an op fenced to the admin
   * and probe classes has no member session to filter, and a COUNT THAT NAMES
   * NOTHING is not identity. */

  /** The D-15 predicate over a column that HOLDS a bundle id, as a WHERE term.
   *
   *  `FROM bundles b` and not `FROM bundles`: viewerPredicate compiles over the
   *  alias `b`, which is REC-25's landed lesson and the reason this subquery
   *  binds the alias rather than the table name.
   *
   *  A NULL column names no bundle and so discloses nothing: it passes. A column
   *  naming a bundle that is GONE does not, and that is the fail-closed arm — a
   *  row pointing at something the store cannot show is withheld rather than
   *  answered for.
   *
   *  THE COLUMN MUST BE QUALIFIED, and this refuses an unqualified one rather
   *  than trusting a caller to remember. Found by the suite: inside the EXISTS
   *  subquery a bare `bundle_id` resolves against `bundles` — the INNER table —
   *  so `b.bundle_id = bundle_id` is `b.bundle_id = b.bundle_id`, a gate that
   *  passes every row while looking exactly like a gate. The failure is silent
   *  and it is the whole class this sweep exists to close, so it is a throw. */
  #bundleGate(col, viewer) {
    if (typeof col !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
      throw new Error(`REFUSED: the D-15 bundle gate needs a QUALIFIED column (got ${col}). `
        + "An unqualified name binds to `bundles` inside the gate's own subquery and passes everything.");
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (gate.scope === "DENY") return { sql: gate.sql, args: [] };
    return {
      sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b
              WHERE b.bundle_id = ${col} AND (${gate.sql})))`,
      args: gate.args,
    };
  }

  /** The same question asked of ONE id, for the answers this store assembles in
   *  JavaScript rather than in SQL. Returns a function that passes a visible id
   *  through and answers `null` for one the viewer may not see; a row that names
   *  NO bundle is left alone, because it discloses nothing to begin with.
   *  Memoised per call site: a progression instance asks about the same handful
   *  of bundles many times over. */
  #bundleRedactor(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => id ?? null;        // machine: not filtered
    if (gate.scope === "DENY") return (id) => (id ? null : id ?? null);   // fail closed
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                                 id, ...gate.args));
      return memo.get(id) ? id : null;
    };
  }

  /** REC-25: the plane-side gated BACKLINK read — every edge INTO a bundle,
   *  with the citing bundle filtered by the VIEWER'S position (Membership
   *  Architecture 7.9: derived reverse edges into projects are filtered by the
   *  viewer's position). This is the read that lets the UI delete its
   *  client-side reverseRefs walk (app.html), which rebuilt the leak by
   *  walking every project's projection.
   *
   *  `cites` lives on the citing object, so an edge's STATUS lives in the
   *  citing document, not in the refs projection — read here the way
   *  #citesInto reads it, so the backlink surface and retire's CITED refusal
   *  cannot disagree about what a live citation is. A citing document that
   *  cannot be read counts as live (status defaults confirmed), the same
   *  conservative arm #citesInto takes.
   *
   *  An invisible TARGET answers NO_SUCH_BUNDLE — the same shape as an absent
   *  one — and invisible CITING bundles are simply not in the list. No count
   *  of what was withheld is reported, because that count is the leak. */
  backlinks({ target = null, viewer = null } = {}) {
    if (!target) return { ok: false, reason: "NO_TARGET",
      detail: "backlinks are asked of an object: pass target=<bundle id>" };
    if (!this.#viewerSees(target, viewer))
      return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    const gate = viewerPredicate(viewer);
    const rows = this.#rows(
      `SELECT r.bundle_id AS from_id, r.kind AS rel, b.object_type AS from_type,
              b.title AS from_title, b.current_state AS from_state
       FROM refs r JOIN bundles b ON b.bundle_id = r.bundle_id
       WHERE r.target_id = ? AND (${gate.sql})
       ORDER BY r.bundle_id, r.kind`, target, ...gate.args);
    const out = [];
    for (const r of rows) {
      let status = null, note = null;
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, r.from_id);
      if (md && md.content !== null) {
        const refs = parseFrontmatter(md.content).data?.references;
        const entry = (Array.isArray(refs) ? refs : [])
          .find((x) => x && x.rel === r.rel && x.target === target);
        if (entry) { status = entry.status ?? "confirmed"; note = entry.note ?? null; }
      }
      out.push({ from: r.from_id, from_type: r.from_type, from_title: r.from_title,
                 from_state: r.from_state, rel: r.rel,
                 status: status ?? "confirmed", note });
    }
    return { ok: true, target, backlinks: out };
  }

  /** C-6.2: every reference whose target does not exist. A join, not a scan.
   *
   *  REC-30, and this is the leak the item was written from: the row NAMES THE
   *  CITING BUNDLE, so a project that cited a target which does not exist handed
   *  its own id to any member who asked — the one thing 7.9 says an uninvited
   *  member must not learn. The citing bundle is the row's subject, so an
   *  invisible one withholds the whole row (op=backlinks' posture) and no count
   *  of what was withheld is reported, because that count is the leak.
   *
   *  The TARGET is deliberately not gated: by construction it names a bundle
   *  that does not exist, and there is nothing about a nonexistent id to hide.
   *
   *  The join must alias the dangling-target probe to something other than `b`:
   *  `b` belongs to viewerPredicate, and the gate's own subquery binds it. */
  danglingRefs(viewer = null) {
    const seen = this.#bundleGate("r.bundle_id", viewer);
    return this.#rows(
      `SELECT r.bundle_id, r.target_id FROM refs r
       LEFT JOIN bundles tgt ON tgt.bundle_id=r.target_id
       WHERE tgt.bundle_id IS NULL AND (${seen.sql})`, ...seen.args);
  }

  /** Streaming whole-store pass. Peak memory is one image, measured at 37KB,
   *  against 558MB if every image is materialised at once. */
  *eachImage() {
    for (const r of this.#rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`))
      yield [r.bundle_id, this.readImage(r.bundle_id)];
  }

  /* ---- writes: promotion is the sole writer of live state ---- */

  /**
   * One transaction. Either the whole bundle advances or nothing does.
   *
   * base is the CAS. It must equal the current bundle_sha, or null when
   * creating. A stale base is refused, which is the lost-update floor that
   * manifest base-sha CAS provided on Drive.
   */
  promote(pkg) {
    if (!pkg || typeof pkg !== "object") return { ok: false, reason: "NO_BODY", detail: "promote requires a POSTed package" };
    const { bundleId, base, files, meta, snapKey, author, register = [] } = pkg;
    /* A mechanical writer must name an operation the catalog knows, because
       C-20.1 holds it to that operation's declared field set and refuses one
       that names nothing. Validated here so a daemon cannot write an
       unaccountable mechanical revision and discover the problem at
       ratification, when the revision is already in the history. */
    const writer = pkg.writer === "mechanical" ? "mechanical" : null;
    const operation = writer ? pkg.operation : null;
    if (writer && !(operation in MECHANICAL_FIELD_SETS))
      return { ok: false, reason: "UNDECLARED_OPERATION",
               detail: `a mechanical promotion names one of: ${Object.keys(MECHANICAL_FIELD_SETS).join(", ")}`,
               got: operation ?? null };
    /* References used to arrive in the payload AND live in the frontmatter, and
       only the frontmatter was ever checked, so the two could disagree with
       nothing noticing (DEBT D-21). The document is authoritative. A caller
       still sending the old field is refused rather than quietly overridden,
       because a silent override is how the two drifted apart in the first
       place. */
    if (Array.isArray(pkg.refs) && pkg.refs.length)
      return { ok: false, reason: "REFS_IN_PAYLOAD",
               detail: "references are read from bundle.md frontmatter, not from the promote payload; remove the refs field" };
    /* REC-11: the same D-21 discipline for basis legs, from birth rather than
       after a drift has already cost something. The document is authoritative. */
    if (Array.isArray(pkg.basis) && pkg.basis.length)
      return { ok: false, reason: "BASIS_IN_PAYLOAD",
               detail: "basis legs are read from bundle.md frontmatter, not from the promote payload; remove the basis field" };
    if (!bundleId || !Array.isArray(files) || !meta) return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };
    return this.ctx.storage.transactionSync(() => {
      const cur = this.#one(`SELECT bundle_sha, row_version, object_type, current_state FROM bundles WHERE bundle_id=?`, bundleId);

      if (cur && base === null)
        return { ok: false, reason: "EXISTS", detail: "creation attempted against an existing bundle" };
      if (!cur && base !== null)
        return { ok: false, reason: "ABSENT", detail: "update attempted against a bundle that does not exist" };

      /* A title is never LOST by a revision.
       *
       * Found by the 7.1 check below refusing a cite. `cite`, `sever` and
       * `reinstate` rebuild `meta` from the document's frontmatter and re-promote,
       * so a bundle whose frontmatter carries no `title` was being re-promoted
       * with `title: undefined`, silently blanking it in the projection. The
       * catalog requires `title` on every bundle, so such a document is
       * malformed, but a malformed document is exactly when a write path should
       * preserve what it already knows rather than quietly discard it.
       *
       * Carrying forward is correct in general: an update that does not mention
       * the title is not a request to remove it. */
      if (cur && (meta.title === undefined || meta.title === null || meta.title === "")) {
        const prev = this.#one(`SELECT title FROM bundles WHERE bundle_id=?`, bundleId);
        if (prev && prev.title) meta.title = prev.title;
      }

      /* 7.1: a project's name is unique across the instance.
       *
       * HERE, at the write path, and not only at fork. Enforcing it at fork
       * alone left the ordinary creation path open, which was D-48: two projects
       * born the normal way could collide, and fork is only one of several ways
       * a project comes into being.
       *
       * Compared case-insensitively with runs of whitespace collapsed, via the
       * one `projectNameKey` the fork check also uses, so the two cannot
       * disagree about what a collision is. A plain unique index over the
       * trimmed string is how HANDLES work and would let "Sewer Fund" and
       * "Sewer fund" coexist, which is the collision the rule exists to stop:
       * uniqueness a reader cannot see is not uniqueness.
       *
       * HELD ACROSS EVERY LIFECYCLE STATE, deactivated projects included. A
       * deactivated project is `closed` with a reason of `abandoned` (7.11), not
       * gone: it is still cited, and its name must still resolve to what was
       * cited. Freeing the name on deactivation would let a later project
       * silently inherit an earlier one's references.
       *
       * Excludes the bundle being written, so a project may be revised without
       * colliding with itself, which is the obvious way to get this wrong.
       *
       * A SCAN, deliberately. The alternative is a maintained key column with a
       * unique index, which needs a backfill and would not catch collisions
       * against projects promoted before the column existed. Projects are few
       * relative to Information and this runs only for them. */
      if (meta.object_type === "project") {
        const key = Store.projectNameKey(meta.title);
        if (!key)
          return { ok: false, reason: "NO_TITLE",
                   detail: "a project needs a name, and it must be unique across this instance" };
        const clash = this.#rows(
          `SELECT bundle_id, title FROM bundles WHERE object_type='project' AND bundle_id<>?`, bundleId)
          .find((r) => Store.projectNameKey(r.title) === key);
        if (clash)
          return { ok: false, reason: "NAME_TAKEN", bundleId: clash.bundle_id, title: clash.title,
                   detail: "a project by that name already exists on this instance, compared without regard "
                         + "to case or spacing. This holds for deactivated projects too, because their "
                         + "names are still cited." };
      }

      /* 7.11: only an OWNER deactivates or reactivates a project.
       *
       * NARROW ON PURPOSE. Section 7.11 is titled deactivation and reactivation
       * and says only owners may do those. It does NOT say only owners may move
       * a project's lifecycle at all, and reading it that way would stop the
       * accelerator advancing a project from forming to investigating, which is
       * ordinary record work gated by `contribute` like every other write.
       *
       * So exactly two transitions are owner-only, and they are the two the
       * section names. Deactivation is entering `closed` with a `closed_reason`
       * of `abandoned`, which is what distinguishes "we stopped pursuing this"
       * from `resolved` (finished) and `superseded` (overtaken). Reactivation is
       * `closed` to `investigating`, the one reverse transition the check
       * catalog allows, which is there for this.
       *
       * `actorMemberId` is stamped by the control plane from the SESSION and
       * deleted first if a caller supplies it, exactly as `author` is. A machine
       * credential therefore carries none and cannot deactivate: saying the
       * group has stopped pursuing something is a statement by its members about
       * their own intent, and no automation holds that. */
      if (cur && cur.object_type === "project") {
        const to = meta.current_state, from = cur.current_state;
        const deactivating = from !== "closed" && to === "closed" && meta.closed_reason === "abandoned";
        const reactivating = from === "closed" && to === "investigating";
        if (deactivating || reactivating) {
          const actor = typeof pkg.actorMemberId === "string" && pkg.actorMemberId ? pkg.actorMemberId : null;
          if (!actor || !this.#isProjectOwner(bundleId, actor))
            return { ok: false, reason: "NOT_THE_OWNER",
                     act: deactivating ? "deactivate" : "reactivate",
                     detail: deactivating
                       ? "only an owner of this project may deactivate it, which is what closing it as "
                       + "abandoned means. Closing it as resolved or superseded is ordinary record work."
                       : "only an owner of this project may reactivate it." };
        }
      }
      if (cur && cur.bundle_sha !== base)
        return { ok: false, reason: "CAS_STALE", expected: cur.bundle_sha, got: base };

      for (const f of files) {
        if (f.text !== undefined && f.text.length > INLINE_MAX)
          return { ok: false, reason: "OVERSIZE_INLINE", path: f.path, bytes: f.text.length };
      }
      /* A gathering queue is validated at the WRITE, not only at ratification.
         C-18.5's grammar exists because a leaked write token must be able to
         litter the queue without steering a member's session: the exporter
         renders these fields as quoted data and the grammar bounds what they can
         carry. Refusing at the write means a malformed request never lands, so
         nobody has to read it to find out it was junk. The catalog's own function
         does the judging; the store supplies the file and reports its findings
         verbatim. */
      /* Historical replay is not authorship. The record's own history contains
         gathering queues written before this grammar existed, and a migration
         replays them verbatim through this same front door. Refusing them would
         mean the plane cannot faithfully hold its own past, so a replay says so
         explicitly and the manifest entry records it forever. The exemption is
         narrow by construction: it skips THIS check and nothing else, and it
         cannot hide, because a replayed revision is marked in the history a
         reader can see. */
      const gj = pkg.replay ? null : files.find((f) => f.path === "data/gathering.json");
      if (gj && typeof gj.text === "string") {
        const gf = [];
        checkGatheringGrammar({ files: new Map([["data/gathering.json", gj.text]]) }, gf);
        const errs = gf.filter((x) => x.severity === "error");
        if (errs.length)
          return { ok: false, reason: "GATHERING_REFUSED",
                   findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
      }

      /* REC-11: an inquiry's basis[] is validated at the WRITE, before anything
       * lands — the same reasoning as the gathering grammar above, and by the
       * CATALOG'S OWN function, so the store's view and the checker's view are
       * one rule. Shape refusals honour the replay exemption exactly as the
       * gathering check does (the record's history must be holdable verbatim);
       * the SELF and CYCLE refusals below do not, because acyclicity is a
       * structural invariant of the store itself — a faithfully replayed
       * history was acyclic when it was written, so an honest replay never
       * meets them.
       */
      const isInquiry = normalizeType(meta.object_type) === "inquiry";
      const basisMd = files.find((f) => f.path === "bundle.md");
      const basisFm = isInquiry && basisMd && typeof basisMd.text === "string"
        ? parseFrontmatter(basisMd.text).data : null;
      const basisLegs = basisFm && Array.isArray(basisFm.basis)
        ? basisFm.basis.filter((l) => l && typeof l === "object") : [];
      if (basisFm && basisFm.basis !== undefined && basisFm.basis !== null && !pkg.replay) {
        const bf = [];
        /* REC-14: C-21.2 runs HERE too, with the published projection injected,
           so an over-strong inherited grade is refused at the write and not
           only at the gate — the checkGatheringGrammar precedent, and the
           reason the rule lives in ONE catalog function that both sides run. */
        checkInquiryBasis(basisFm, bf, this.publishedRegistryFor(bundleId,
          basisLegs.map((l) => l.target).filter((t) => typeof t === "string")));
        const errs = bf.filter((x) => x.severity === "error");
        if (errs.length)
          return { ok: false, reason: "BASIS_REFUSED",
                   findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
      }
      if (basisLegs.length) {
        /* R3: the basis graph is a DAG, enforced HERE, at the write that would
         * close the cycle — before REC-11 the record's only acyclicity
         * protection was a side effect of op=cite refusing non-information
         * members, and this table is what removes that refusal's reach. The
         * refusal NAMES THE PATH it found, because "cycle refused" without the
         * path leaves the member to re-derive the walk the store just did.
         */
        for (const leg of basisLegs) {
          if (leg.target === bundleId)
            return { ok: false, reason: "SELF_BASIS", path: [bundleId, bundleId],
                     detail: `${bundleId} cannot rest on itself: a question is not evidence for its own answer` };
        }
        const inqTargets = [...new Set(basisLegs
          .filter((l) => typeof l.target === "string"
                      && normalizeType(OBJECT_TYPES[l.target.split("-")[0]]) === "inquiry")
          .map((l) => l.target))];
        const cycle = this.#basisCyclePath(bundleId, inqTargets);
        if (cycle)
          return { ok: false, reason: "BASIS_CYCLE", path: cycle,
                   detail: `this write would close a cycle: ${cycle.join(" -> ")}. `
                         + `An inquiry's basis is a DAG; the chain above already rests on ${bundleId}.` };
      }

      // history is append-only: snapshot the outgoing live state first
      /* A creation records a manifest entry with the empty-string SHA as its
         base and no snapshot, because there is no prior state to snapshot.
         The accelerator did exactly this and the catalog depends on it:
         classifyDivergence anchors the hash chain on entry bases, and C-20.1
         recognises a creation by that same sentinel. Omitting the entry, which
         is what this method did before, leaves the chain with no first link. */
      if (!cur) {
        this.sql.exec(
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
          bundleId, snapKey, pkg.replay ? "promotion-replay" : "promotion", EMPTY_STRING_SHA, author,
          meta.last_updated || new Date().toISOString(),
          JSON.stringify(files.map((f) => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      }
      if (cur) {
        for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))
          this.sql.exec(
            `INSERT OR REPLACE INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`,
            bundleId, snapKey, r.path, r.content, r.blob_sha, r.sha256, new Date().toISOString());
        this.sql.exec(
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
          /* The catalog switches on kind === 'promotion' (C-12.2, C-20.1), so
             that is the vocabulary. A creation is still distinguishable, by a
             base equal to the empty-string SHA, which is how the accelerator
             recorded it and how C-20.1 recognises one. */
          bundleId, snapKey, pkg.replay ? "promotion-replay" : "promotion", base, author,
          /* The revision's own time, never the server's wall clock. C-12.1
             compares live last_updated against earlier entries' created, and a
             signed ratification legitimately backdates last_updated to the
             transition instant. Stamping server time here made that comparison
             fail on honest content. */
          meta.last_updated || new Date().toISOString(),
          JSON.stringify(files.map(f => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      }

      /* Silent deletion has no legitimate use in an append-only record.
       *
       * promote writes a WHOLE image, so a caller that mentions one file removes
       * every other one. That is efficient and it is a trap, and it has already
       * cost twice: the monitor's first tick destroyed the provenance register of
       * every bundle it touched, and the browser's revise path did the same thing
       * for anyone who edited a captured document. Both were the DEFAULT
       * behaviour of a caller doing the obvious thing.
       *
       * So a promotion that drops a path the previous revision had must name it.
       * A deliberate deletion is still possible and is now on the record; an
       * accidental one is refused with the paths listed. Replay is exempt because
       * the history it reconstructs may legitimately contain deletions, and a
       * replayed revision is already marked as such in the manifest.
       */
      if (cur && !pkg.replay) {
        const had = new Set(this.#rows(`SELECT path FROM files WHERE bundle_id=?`, bundleId).map((r) => r.path));
        const now2 = new Set(files.map((f) => f.path));
        const declared = new Set(Array.isArray(pkg.drop) ? pkg.drop : []);
        const dropped = [...had].filter((p) => !now2.has(p) && !declared.has(p));
        if (dropped.length)
          return { ok: false, reason: "FILES_DROPPED", paths: dropped.sort(),
                   detail: "this promotion would remove files the previous revision had. "
                         + "Carry them forward, or name them in drop[] to delete them on purpose." };
      }
      this.sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);
      for (const f of files)
        this.sql.exec(
          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,
          bundleId, f.path, f.text ?? null, f.blobSha ?? null, f.bytes, f.sha256);

      const newSha = files.find(f => f.path === "bundle.md")?.sha256;
      if (!newSha) return { ok: false, reason: "NO_BUNDLE_MD" };

      /* Normalisation site 3 of 4 (REC-10): the projected type goes through
         the CATALOG'S OWN normalizeType rather than an inline restatement of
         it, so the store's view and the checker's view cannot disagree — the
         same reason this file imports the catalog's parser. */
      const projectedType = normalizeType(meta.object_type);
      /* C-16: an inquiry's title is DERIVED from its `## Question` section
         and never separately authored — deriveInquiryTitle (the catalog
         holds the one rule) over the document being promoted, with the
         caller's meta.title honoured only when the document carries no
         question (every legacy focus/problem document, whose title WAS
         authored under the old contract). */
      const mdForTitle = files.find((x) => x.path === "bundle.md");
      const projectedTitle = (projectedType === "inquiry"
        ? deriveInquiryTitle(inquiryQuestionOf(typeof mdForTitle?.text === "string" ? mdForTitle.text : "")) ?? meta.title
        : meta.title);

      this.sql.exec(
        `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,prior_state,created,last_updated,criticality,bundle_sha,row_version)
         VALUES (?,?,?,?,?,?,?,?,?,?,COALESCE((SELECT row_version+1 FROM bundles WHERE bundle_id=?),1))
         ON CONFLICT(bundle_id) DO UPDATE SET
           object_type=excluded.object_type, title=excluded.title,
           current_state=excluded.current_state, prior_state=excluded.prior_state,
           last_updated=excluded.last_updated, criticality=excluded.criticality,
           bundle_sha=excluded.bundle_sha,
           row_version=bundles.row_version+1`,
        bundleId, projectedType, meta.group, projectedTitle, meta.current_state, meta.prior_state ?? null,
        meta.created, meta.last_updated, meta.criticality ?? null, newSha, bundleId);

      /* Projected from the document, every promotion, so the table is a view of
         bundle.md rather than a second place to state the same thing. */
      this.sql.exec(`DELETE FROM refs WHERE bundle_id=?`, bundleId);
      const md = files.find((f) => f.path === "bundle.md");
      const fmRefs = md && typeof md.text === "string"
        ? (parseFrontmatter(md.text).data?.references ?? []) : [];
      for (const t of Array.isArray(fmRefs) ? fmRefs : []) {
        if (!t || typeof t !== "object" || typeof t.target !== "string") continue;
        this.sql.exec(`INSERT OR REPLACE INTO refs (bundle_id,target_id,kind) VALUES (?,?,?)`,
          bundleId, t.target, typeof t.rel === "string" ? t.rel : "");
      }

      /* REC-11: inquiry_basis, projected WHOLE from basis[] in this SAME
         transaction as refs and by the same delete-then-insert discipline, so
         it is a projection of the document and never a second place to state
         it (D-21). The legs were validated above, before anything landed;
         target_type is denormalised from the id prefix through the catalog's
         own map so the walk never re-derives it. ord is the leg's position in
         basis[], which is what makes a leg ADDRESSABLE and lets one document
         be cited for two legs (D4 — the reason refs could not carry this). */
      this.sql.exec(`DELETE FROM inquiry_basis WHERE bundle_id=?`, bundleId);
      if (isInquiry) {
        for (let i = 0; i < basisLegs.length; i++) {
          const leg = basisLegs[i];
          if (typeof leg.target !== "string") continue; // replay of a malformed shape: unprojectable
          this.sql.exec(
            `INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            bundleId, i, leg.target,
            /* '' rather than NULL on a replayed malformed shape, mirroring the
               refs projection's kind fallback: the columns are NOT NULL. */
            normalizeType(OBJECT_TYPES[leg.target.split("-")[0]]) ?? "",
            typeof leg.role === "string" ? leg.role : "",
            leg.grade ?? null, leg.grade_axis ?? null, leg.grade_source ?? null,
            typeof leg.note === "string" ? leg.note : null,
            /* The document's own authored date (required on a hunch), never the
               server's clock: delete-then-insert re-projects every promotion,
               so a server stamp here would silently re-date every leg. */
            leg.date != null ? String(leg.date) : null);
        }
      }
      /* REC-14 / C-9: inquiry_exclusions, projected WHOLE from
         completeness_excluded[] in the SAME transaction and by the same
         delete-then-insert discipline as inquiry_basis above — a projection of
         the document, never a second place to state it (D-21). The BYTES make
         the assertion storable and signable; only this INDEXED projection makes
         "which published cases excluded this document" ASKABLE, which is
         invariant 7's only mechanical enforcement point at the case level.

         target_id stays NULL when the row names something not in the record —
         an outstanding records request has no id to point at — and the catalog
         has already refused any row carrying NEITHER a target nor prose. */
      this.sql.exec(`DELETE FROM inquiry_exclusions WHERE bundle_id=?`, bundleId);
      if (isInquiry && basisFm && Array.isArray(basisFm.completeness_excluded)) {
        const comp = (basisFm.completeness && typeof basisFm.completeness === "object") ? basisFm.completeness : {};
        for (let i = 0; i < basisFm.completeness_excluded.length; i++) {
          const row = basisFm.completeness_excluded[i];
          if (!row || typeof row !== "object") continue;   // replay of a malformed shape: unprojectable
          this.sql.exec(
            `INSERT INTO inquiry_exclusions (bundle_id,ord,edition,target_id,description,reason,author,at)
             VALUES (?,?,?,?,?,?,?,?)`,
            bundleId, i, Number.isInteger(basisFm.edition) ? basisFm.edition : null,
            typeof row.target === "string" ? row.target : null,
            typeof row.description === "string" ? row.description : "",
            typeof row.reason === "string" ? row.reason : "",
            typeof comp.author === "string" ? comp.author : "",
            typeof comp.at === "string" ? comp.at : "");
        }
      }
      /* REC-12: re-derive this inquiry's per-axis strength CACHE from the legs
         just projected, in the SAME transaction, so the cache can never be a
         revision behind the basis it summarises. It is still only a cache: a
         leg raised in an inquiry BENEATH this one does not re-promote this
         document, so the columns go stale by design and strengthOf() is what
         anything needing the truth calls. */
      this.#writeStrengthProjection(bundleId, isInquiry);

      for (const c of register)
        this.sql.exec(
          `INSERT OR REPLACE INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
          c.sha256, bundleId, c.path, c.encoding ?? "utf8", c.bytes, new Date().toISOString());

      /* S-10 step 1: derive the metadata projection from the bundle.md being
         written, inside this same transaction. Inside, because a projection
         maintained separately is a projection that can be a revision behind the
         document, and the whole point of it is to be filtered on. From the
         document rather than from `meta`, because these fields have no
         representation in meta at all: the document is not the better source,
         it is the only one. */
      const bundleMd = files.find(f => f.path === "bundle.md");
      this.#writeProjection(bundleId, bundleMd?.text ?? null);

      /* S-10 step 2: the text index, written in the SAME transaction as the
         files and the projection it describes. Inside, because an index
         maintained by a separate pass is an index that can be a revision behind
         the corpus, and a text index that disagrees with the documents does not
         merely return stale hits, it returns hits for text that no longer exists
         and misses text that does. Either the whole bundle advances with its
         index or nothing does. */
      this.#writeText(bundleId, files);

      /* CONSTRUCTS Step 3 (FW-5): persist the READING the doctype's reader
         produced at acquire. It rides on the acquire document in
         data/provenance.json, so it is DERIVED from the document here rather than
         threaded as a second payload field — the same discipline the refs
         projection above follows, in the SAME transaction, so the reading and its
         entity-reference index can never be a revision behind the document they
         describe. A reading indexed by its raw entity references is the reverse
         index Step 4 resolves entities across documents with. */
      this.#writeReadings(bundleId, files);

      /* 7.1: the creator of a project is its sole initial owner, written in the
         SAME transaction as the project itself so a project cannot exist
         unowned even for an instant. Two round trips from the control plane
         would leave an ownerless project whenever the second one failed.

         `ownerMemberId` is stamped by the control plane from the authenticated
         SESSION and any caller-supplied value is deleted there first, exactly as
         `author` is: it is the field that decides who owns a project, so a
         caller naming it would be a caller granting themselves, or someone else,
         ownership of a project. A machine credential creates no owner at all,
         because there is no member behind it and inventing one would put a name
         on the record that nobody holds.

         Creation only. A revision to an existing project must not silently
         reassign it, which is why this hangs off `!cur`. */
      const ownerMemberId = typeof pkg.ownerMemberId === "string" && pkg.ownerMemberId ? pkg.ownerMemberId : null;
      let owner = null;
      if (!cur && ownerMemberId && meta.object_type === "project") {
        const ts = new Date().toISOString();
        this.sql.exec(
          `INSERT OR REPLACE INTO project_participants
             (project_id, member_id, state, owner, invited_by, comment, created, updated)
           VALUES (?,?,'joined',1,NULL,NULL,?,?)`, bundleId, ownerMemberId, ts, ts);
        owner = ownerMemberId;
      }

      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version, owner };
    });
  }

  /* CONSTRUCTS Step 3 (FW-5): persist a captured document's READING and index it
     by entity reference. Called inside the promote transaction, from the acquire
     document carried in data/provenance.json — the reading is a projection of the
     document, derived here exactly as `refs` is derived from bundle.md, so it can
     never disagree with the document it describes. A re-promotion REPLACES this
     capture's reading and its reference rows, so a revised reader never leaves
     stale references behind. Every reference is stored AS IT APPEARS — the raw
     kind:key — and is NEVER resolved to a canonical entity (Step 4 / D-83). */
  #writeReadings(bundleId, files) {
    const prov = files.find((f) => f.path === "data/provenance.json");
    if (!prov || typeof prov.text !== "string") return;
    let docs;
    try { docs = JSON.parse(prov.text).documents; } catch { return; }
    if (!Array.isArray(docs)) return;
    for (const doc of docs) {
      const sha = doc && doc.capture && doc.capture.sha256;
      const reading = doc && doc.reading;
      if (typeof sha !== "string" || !sha || !reading || typeof reading !== "object") continue;
      const entities = Array.isArray(reading.entities) ? reading.entities : [];
      /* Replace, so a re-promotion carries no orphan references. */
      this.sql.exec(`DELETE FROM reading_refs WHERE capture_sha=?`, sha);
      this.sql.exec(
        `INSERT OR REPLACE INTO readings (capture_sha,bundle_id,content_type,reader_version,found,entity_count,reading,at)
         VALUES (?,?,?,?,?,?,?,?)`,
        sha, bundleId,
        typeof reading.content_type === "string" ? reading.content_type : null,
        Number.isInteger(reading.reader_version) ? reading.reader_version : null,
        reading.found ? 1 : 0, entities.length,
        JSON.stringify(reading), typeof reading.at === "string" ? reading.at : null);
      for (const e of entities) {
        if (!e || (e.key == null && e.kind == null)) continue;
        /* The reference exactly as the reading carries it: the reader's own
           composed ref when present, otherwise kind:key. Raw, source-assigned,
           unresolved. */
        const ref = typeof e.ref === "string" && e.ref
          ? e.ref : `${e.kind == null ? "" : e.kind}:${e.key == null ? "" : e.key}`;
        this.sql.exec(
          `INSERT OR REPLACE INTO reading_refs (capture_sha,bundle_id,ref,ref_kind,ref_key,label)
           VALUES (?,?,?,?,?,?)`,
          sha, bundleId, ref,
          e.kind == null ? null : String(e.kind),
          e.key == null ? null : String(e.key),
          e.label == null ? null : String(e.label));
      }
    }
  }

  /* CONSTRUCTS Step 3 read side: the reading of one captured document, by its
     capture identity (register.capture_sha). Returns the stored reading —
     entities[] + document facts — or found:false when the store holds none. */
  readingFor(captureSha, viewer = null) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA", detail: "a reading is read by its capture sha256" };
    const row = this.#one(
      `SELECT capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at
         FROM readings WHERE capture_sha=?`, captureSha);
    if (!row) return { ok: true, found: false, capture_sha: captureSha, reading: null };
    let reading = null;
    try { reading = JSON.parse(row.reading); } catch { /* a malformed stored reading is surfaced as null */ }
    /* REC-30: the reading is OF A CAPTURE and is addressed by its sha — the
       bundle id is the back-reference to where that capture is filed, and it is
       withheld when it names a bundle this viewer may not see. The reading
       itself is the document's own content and is not a project's property. */
    return { ok: true, found: true, capture_sha: row.capture_sha,
             bundle_id: this.#bundleRedactor(viewer)(row.bundle_id),
             content_type: row.content_type, reader_version: row.reader_version,
             reader_found: !!row.found, entity_count: row.entity_count, at: row.at, reading };
  }

  /* The reverse index Step 4 builds on: every captured document whose reading
     carries this entity reference. The reference is matched AS IT APPEARS — the
     raw kind:key — and is NOT resolved to a canonical entity, so two documents
     that name the same source id land together without any identity model. */
  documentsByReference(ref, viewer = null) {
    if (typeof ref !== "string" || !ref)
      return { ok: true, ref: typeof ref === "string" ? ref : null, count: 0, documents: [] };
    const rows = this.#rows(
      `SELECT rr.capture_sha, rr.bundle_id, rr.ref, rr.ref_kind, rr.ref_key, rr.label, r.content_type
         FROM reading_refs rr LEFT JOIN readings r ON r.capture_sha = rr.capture_sha
        WHERE rr.ref=? ORDER BY rr.bundle_id, rr.capture_sha`, ref);
    /* REC-30: the reverse index answers WHICH DOCUMENTS carry a reference — a
       fact about captures. The bundle back-reference is withheld where the
       viewer may not see the bundle; `count` counts documents, not names. */
    const keep = this.#bundleRedactor(viewer);
    return { ok: true, ref, count: rows.length,
             documents: rows.map((r) => ({ capture_sha: r.capture_sha, bundle_id: keep(r.bundle_id),
               ref: r.ref, kind: r.ref_kind, key: r.ref_key, label: r.label, content_type: r.content_type })) };
  }

  /* ---- CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY / entity axis ----
   *
   * The framework's third registry, and the bias doctrine's safeguard-4 subject
   * registry, are ONE construct (D-83), so it is built ONCE here. An entity is a
   * subject the record is about (a source, institution, office, movement -- and,
   * because the same axis serves the framework, a person, body, ordinance, parcel,
   * contract or fund); it has first-class ALIASES, and DECLARED RELATIONS to other
   * entities (proxy_for, member_of, overlaps).
   *
   * A declared relation is CONSTITUTIVE, not evidentiary: the group fixing what its
   * own statements mean rather than claiming something checkable. It carries a
   * justification and a citation "like a pattern statement" (safeguard 4), and it
   * carries NO section-8.1 connection grade -- there is no grade field to carry one.
   * Grading a constitutive relation Grade D is the category error D-83 names, and the
   * enforcement here is structural rather than a convention.
   *
   * RESOLVING a reading_refs reference (FW-5) to an entry here, and declaring the
   * resolution METHOD as the connection grade (framework 8.1), is the NEXT slice and
   * is deliberately not built here. This slice is the registry itself. */

  /* The union kind vocabulary, reconciled across the two doctrines this one axis
     serves (D-83): safeguard 4's four SUBJECT kinds, plus the framework's entity
     kinds (framework:248). Closed and validated at the write path, so introducing a
     kind outside it is a loud refusal rather than a silent new vocabulary -- the
     spirit of safeguard 4, where introducing a new SUBJECT is a reviewed act. */
  static #ENTITY_KINDS = new Set([
    /* safeguard 4's SUBJECT kinds */ "source", "institution", "office", "movement",
    /* the framework's entity kinds */ "person", "body", "ordinance", "parcel", "contract", "fund",
  ]);
  /* The three DECLARED-relation predicates safeguard 4 names, and only these. */
  static #RELATION_KINDS = new Set(["proxy_for", "member_of", "overlaps"]);

  /* The case-folded, whitespace-collapsed form the alias reverse index keys on, so
     "City Clerk", "city clerk" and "  City   Clerk " are one lookup. */
  static #normAlias(s) {
    return String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase().slice(0, 200);
  }
  static #cleanLabel(s) {
    return String(s ?? "").trim().replace(/\s+/g, " ").slice(0, 200);
  }

  /* Create a registry entry, with its canonical label seeded as an alias so the
     entry is retrievable BY that name as well as by any explicit alias, and any
     inline aliases attached in the SAME transaction so an entity never exists
     nameless-but-for-its-id even for an instant. The kind is validated against the
     closed union vocabulary; an unknown kind is refused by name rather than stored,
     because a registry that silently accepts any kind is not a registry. */
  createEntity({ kind, label, note = null, aliases = [], declaredBy = null } = {}) {
    const k = typeof kind === "string" ? kind.trim().toLowerCase() : "";
    if (!k) return { ok: false, reason: "NO_KIND",
      detail: "an entity needs a kind: one of " + [...Store.#ENTITY_KINDS].join(", ") };
    if (!Store.#ENTITY_KINDS.has(k))
      return { ok: false, reason: "UNKNOWN_KIND", kind: k,
        detail: "the subject registry admits a closed kind vocabulary (D-83 reconciles safeguard 4 with the "
              + "framework's entity axis): one of " + [...Store.#ENTITY_KINDS].join(", ")
              + ". Introducing a new kind is a doctrine change, not a write." };
    const lab = Store.#cleanLabel(label);
    if (!lab) return { ok: false, reason: "NO_LABEL", detail: "an entity needs a canonical label, such as 'City Clerk'" };
    const extra = Array.isArray(aliases) ? aliases : [];
    const at = new Date().toISOString();
    const { id } = this.allocId("ENT", at.slice(0, 4));
    return this.ctx.storage.transactionSync(() => {
      this.sql.exec(
        `INSERT INTO entities (entity_id,kind,label,note,declared_by,at) VALUES (?,?,?,?,?,?)`,
        id, k, lab, note == null ? null : String(note).slice(0, 2000),
        declaredBy == null ? null : String(declaredBy), at);
      /* The canonical label is itself an alias (canonical=1), so a lookup by the
         entity's own name resolves without a special case. */
      const seen = new Set();
      const put = (name, canonical) => {
        const norm = Store.#normAlias(name);
        if (!norm || seen.has(norm)) return;
        seen.add(norm);
        this.sql.exec(
          `INSERT OR IGNORE INTO entity_aliases (entity_id,alias,alias_norm,canonical,declared_by,at)
           VALUES (?,?,?,?,?,?)`,
          id, Store.#cleanLabel(name), norm, canonical ? 1 : 0,
          declaredBy == null ? null : String(declaredBy), at);
      };
      put(lab, true);
      for (const a of extra) put(a, false);
      const count = this.#one(`SELECT count(*) c FROM entity_aliases WHERE entity_id=?`, id).c;
      return { ok: true, entity_id: id, kind: k, label: lab, alias_count: count, at };
    });
  }

  /* Attach an alias to an existing entity. First-class: an alias is added after the
     fact, by a member, exactly as it can be given at creation. */
  addEntityAlias({ entityId, alias, declaredBy = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return { ok: false, reason: "NO_ENTITY", detail: "an alias is attached to an entity by its id" };
    const norm = Store.#normAlias(alias);
    if (!norm) return { ok: false, reason: "NO_ALIAS", detail: "an alias needs a name" };
    const ent = this.#one(`SELECT entity_id FROM entities WHERE entity_id=?`, entityId);
    if (!ent) return { ok: false, reason: "NO_SUCH_ENTITY", entity_id: entityId };
    const dup = this.#one(`SELECT alias FROM entity_aliases WHERE entity_id=? AND alias_norm=?`, entityId, norm);
    if (dup) return { ok: false, reason: "ALREADY_ALIASED", entity_id: entityId, alias: dup.alias };
    const at = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO entity_aliases (entity_id,alias,alias_norm,canonical,declared_by,at) VALUES (?,?,?,?,?,?)`,
      entityId, Store.#cleanLabel(alias), norm, 0, declaredBy == null ? null : String(declaredBy), at);
    return { ok: true, entity_id: entityId, alias: Store.#cleanLabel(alias), at };
  }

  /* Declare a CONSTITUTIVE relation between two entries. proxy_for / member_of /
     overlaps only, both ends must be registered entities, and BOTH a justification
     and a citation are required -- the statement anatomy of a pattern statement,
     which is what safeguard 4 asks a relation to carry. There is no grade argument
     and no grade stored: a declared relation is not on the connection-grade axis at
     all (D-83), and that is enforced by the shape rather than by a caller's
     restraint. */
  declareRelation({ fromEntity, toEntity, relation, justification, citation, declaredBy = null } = {}) {
    const rel = typeof relation === "string" ? relation.trim().toLowerCase() : "";
    if (!Store.#RELATION_KINDS.has(rel))
      return { ok: false, reason: "UNKNOWN_RELATION", relation: rel,
        detail: "a declared relation is one of " + [...Store.#RELATION_KINDS].join(", ")
              + " (safeguard 4). A connection grade is NOT a relation kind: a declared relation is "
              + "constitutive, not evidentiary, and carries no grade (D-83)." };
    if (typeof fromEntity !== "string" || !fromEntity || typeof toEntity !== "string" || !toEntity)
      return { ok: false, reason: "NO_ENDS", detail: "a relation names two entities by id: fromEntity and toEntity" };
    if (fromEntity === toEntity)
      return { ok: false, reason: "SELF_RELATION", detail: "a relation is between two distinct entities" };
    const just = typeof justification === "string" ? justification.trim() : "";
    const cite = typeof citation === "string" ? citation.trim() : "";
    /* Justified AND citable, like a pattern statement (safeguard 4). Refused fail-
       closed rather than stored empty, so an un-justified or un-cited relation
       cannot enter the registry. */
    if (!just) return { ok: false, reason: "NO_JUSTIFICATION",
      detail: "a declared relation carries a justification, like a pattern statement (safeguard 4)" };
    if (!cite) return { ok: false, reason: "NO_CITATION",
      detail: "a declared relation carries a citation, like a pattern statement (safeguard 4)" };
    const from = this.#one(`SELECT entity_id FROM entities WHERE entity_id=?`, fromEntity);
    if (!from) return { ok: false, reason: "NO_SUCH_ENTITY", entity_id: fromEntity, end: "from" };
    const to = this.#one(`SELECT entity_id FROM entities WHERE entity_id=?`, toEntity);
    if (!to) return { ok: false, reason: "NO_SUCH_ENTITY", entity_id: toEntity, end: "to" };
    const at = new Date().toISOString();
    const { id } = this.allocId("REL", at.slice(0, 4));
    this.sql.exec(
      `INSERT INTO entity_relations (relation_id,from_entity,to_entity,relation,justification,citation,declared_by,at)
       VALUES (?,?,?,?,?,?,?,?)`,
      id, fromEntity, toEntity, rel, just.slice(0, 4000), cite.slice(0, 2000),
      declaredBy == null ? null : String(declaredBy), at);
    return { ok: true, relation_id: id, relation: rel, from_entity: fromEntity, to_entity: toEntity,
             justification: just.slice(0, 4000), citation: cite.slice(0, 2000), declared_by: declaredBy, at };
  }

  /* Read an entry BY KEY (its allocated entity_id), with its aliases and every
     declared relation it is an end of. A relation is returned with its justification
     and citation and WITHOUT a grade, because a declared relation has none (D-83) --
     the read cannot invent a field the table does not carry. */
  readEntity({ entityId } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return { ok: false, reason: "NO_ENTITY", detail: "an entity is read by its id (op=entity&id=ENT-...)" };
    const e = this.#one(
      `SELECT entity_id, kind, label, note, declared_by, at FROM entities WHERE entity_id=?`, entityId);
    if (!e) return { ok: true, found: false, entity_id: entityId, entity: null };
    return { ok: true, found: true, entity: this.#entityView(e) };
  }

  /* Read entries BY ALIAS: every entity carrying the given name (canonical or not).
     Usually one; more than one is a genuinely ambiguous name, returned in full
     rather than collapsed, since the registry does not pretend an ambiguity away. */
  entitiesByAlias({ alias } = {}) {
    const norm = Store.#normAlias(alias);
    if (!norm) return { ok: true, alias: typeof alias === "string" ? alias : null, count: 0, entities: [] };
    const hits = this.#rows(
      `SELECT e.entity_id, e.kind, e.label, e.note, e.declared_by, e.at
         FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
        WHERE a.alias_norm=? ORDER BY e.entity_id`, norm);
    return { ok: true, alias, alias_norm: norm, count: hits.length,
             entities: hits.map((e) => this.#entityView(e)) };
  }

  /* One declared relation by its id. The load-bearing read for the "carries no
     grade" property: the returned object has a justification and a citation and no
     grade key, because the row has no grade column (D-83). */
  readRelation({ relationId } = {}) {
    if (typeof relationId !== "string" || !relationId)
      return { ok: false, reason: "NO_RELATION", detail: "a relation is read by its id (op=relation&id=REL-...)" };
    const r = this.#one(
      `SELECT relation_id, from_entity, to_entity, relation, justification, citation, declared_by, at
         FROM entity_relations WHERE relation_id=?`, relationId);
    if (!r) return { ok: true, found: false, relation_id: relationId, relation: null };
    return { ok: true, found: true, relation: {
      relation_id: r.relation_id, relation: r.relation, from_entity: r.from_entity, to_entity: r.to_entity,
      justification: r.justification, citation: r.citation, declared_by: r.declared_by, at: r.at } };
  }

  /* The entity view shared by readEntity and entitiesByAlias: the entry, its
     aliases, and the relations it is either end of. Relations carry justification +
     citation and NO grade -- there is no grade to read. */
  #entityView(e) {
    const aliases = this.#rows(
      `SELECT alias, canonical, declared_by, at FROM entity_aliases WHERE entity_id=? ORDER BY canonical DESC, alias`,
      e.entity_id).map((a) => ({ alias: a.alias, canonical: !!a.canonical, declared_by: a.declared_by, at: a.at }));
    const rels = this.#rows(
      `SELECT relation_id, from_entity, to_entity, relation, justification, citation, declared_by, at
         FROM entity_relations WHERE from_entity=? OR to_entity=? ORDER BY at, relation_id`,
      e.entity_id, e.entity_id).map((r) => ({
        relation_id: r.relation_id, relation: r.relation, from_entity: r.from_entity, to_entity: r.to_entity,
        direction: r.from_entity === e.entity_id ? "out" : "in",
        justification: r.justification, citation: r.citation, declared_by: r.declared_by, at: r.at }));
    return { entity_id: e.entity_id, kind: e.kind, label: e.label, note: e.note,
             declared_by: e.declared_by, at: e.at, aliases, relations: rels };
  }

  /* ---- CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISERS ----
   *
   * A RESOLUTION matches one raw reading_refs reference (FW-5, a source-assigned
   * kind:key a captured document's reading carries) to a registry ENTITY (FW-6) and
   * DECLARES THE METHOD -- which IS the framework's section 8.1 connection grade. It
   * is the grading mechanism for referential connections (framework 8.1: "entity
   * resolution is therefore the grading mechanism"), and it delivers the reverse
   * index -- "every document that concerns this entity" -- by joining resolutions on
   * entity_id, the single largest manual task the framework removes.
   *
   * The recogniser (op=resolve) matches a reference against the registry in a strict
   * PRIORITY order and DECLARES THE GRADE FROM HOW IT MATCHED, which is all a grade is
   * (framework 8.1: "grade states how the connection was established, and nothing
   * else"):
   *   A -- the reference's raw composite key (kind:key) matched, exactly, a registered
   *        IDENTIFIER (an alias) of the entity: the source's OWN identifier names the
   *        subject at both ends captured+hashed.
   *   B -- the reference's BARE key matched a registered identifier exactly, but not as
   *        the source's composite addressing key: an identifier the source USES, matched
   *        in captured content at both ends.
   *   C -- the reference's LABEL (a name/title) matched an entity ALIAS by name:
   *        correspondence, not identity. Plausible, NEVER established, FLAGGED for a
   *        member to confirm.
   * A reference matching nothing stays honestly UNRESOLVED -- never force-matched to
   * manufacture a hit. The recogniser NEVER mints a D: grade D is member TESTIMONY
   * (op=resolvetestify), recorded with an author and a date, never produced by the
   * machine. And the recogniser matches a reference to an entity's OWN aliases only --
   * it NEVER traverses a declared relation (proxy_for/member_of/overlaps), which is
   * constitutive and sits outside this grade (D-83): resolving THROUGH a relation
   * silently would smuggle a member's constitutive statement into an evidentiary grade.
   *
   * Grade is IMPROVABLE (framework 8.1): the row is keyed (capture_sha, ref, entity_id)
   * so a re-resolution that finds a STRONGER basis raises the grade+method IN PLACE, via
   * #upsertResolution, never a second row and never a downgrade -- a C becomes A the
   * moment a member registers the source identifier as an alias and the recogniser is
   * re-run. */

  static #GRADE_RANK = { A: 4, B: 3, C: 2, D: 1 };
  /* established is a PROPERTY OF THE GRADE, computed here and stored, so a Grade C can
     never be read back as established (an equality that costs nothing is not evidence,
     CLAUDE.md): A and B rest on a captured identifier at both ends; C is correspondence
     awaiting a member's confirmation; D is bare testimony. */
  static #isEstablished(grade) { return grade === "A" || grade === "B"; }

  /* Upsert one resolution with the improvable-grade rule: a first resolution INSERTs; a
     re-resolution at a STRONGER grade RAISES in place (recording raised_from); an equal
     or weaker one is kept (idempotent, never a downgrade, never a duplicate row). Runs
     inside the caller's transaction. */
  #upsertResolution({ captureSha, bundleId, ref, entityId, grade, method, basis, resolvedBy }) {
    const rank = Store.#GRADE_RANK;
    const at = new Date().toISOString();
    const est = Store.#isEstablished(grade) ? 1 : 0;
    const b = basis == null ? null : String(basis).slice(0, 400);
    const by = resolvedBy == null ? null : String(resolvedBy).slice(0, 200);
    const existing = this.#one(
      `SELECT grade FROM resolutions WHERE capture_sha=? AND ref=? AND entity_id=?`, captureSha, ref, entityId);
    if (!existing) {
      this.sql.exec(
        `INSERT INTO resolutions (capture_sha,bundle_id,ref,entity_id,grade,method,basis,established,raised_from,resolved_by,at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        captureSha, bundleId, ref, entityId, grade, method, b, est, null, by, at);
      /* REC-5 / D-122: a NEW resolution can add a document to an entity, forming
         new pairs — stamp the entity so the scheduled sweep re-derives its
         connections. In the caller's transaction, so it commits with the row. */
      this.#stampConnectionDirty(entityId);
      return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade, method, basis: b,
               established: !!est, needs_confirmation: grade === "C", raised: false, resolved_by: by, at };
    }
    if (rank[grade] > (rank[existing.grade] || 0)) {
      this.sql.exec(
        `UPDATE resolutions SET grade=?, method=?, basis=?, established=?, raised_from=?, resolved_by=?, at=?
          WHERE capture_sha=? AND ref=? AND entity_id=?`,
        grade, method, b, est, existing.grade, by, at, captureSha, ref, entityId);
      /* REC-5 / D-122: a RAISED grade can strengthen a connection end (the weaker
         end governs, FW-8), so the derived grade may change — stamp for re-derive.
         A kept (equal/weaker) resolution below changes nothing and dirties nothing. */
      this.#stampConnectionDirty(entityId);
      return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade, method, basis: b,
               established: !!est, needs_confirmation: grade === "C", raised: true, raised_from: existing.grade,
               resolved_by: by, at };
    }
    return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade: existing.grade,
             established: Store.#isEstablished(existing.grade), needs_confirmation: existing.grade === "C",
             raised: false, kept: true };
  }

  /* Every entity carrying, exactly, the given normalised alias. The recogniser's one
     matching primitive: an entity's aliases are the identifiers and names it answers
     to. DISTINCT because an entity could carry the same normalised string twice only
     by construction it cannot -- but the guard costs nothing and keeps a hit a hit. */
  #entitiesByAliasNorm(norm) {
    if (!norm) return [];
    return this.#rows(`SELECT DISTINCT entity_id FROM entity_aliases WHERE alias_norm=?`, norm).map((r) => r.entity_id);
  }

  /* The recogniser over ONE reading reference: decide the grade from HOW it matched
     (A composite identifier, B bare identifier, C name correspondence), and upsert a
     resolution to every entity that matched at the STRONGEST available tier. Returns
     the matches (possibly several -- an ambiguous name resolves to every entity that
     carries it, honestly, never collapsed to one) or an empty list when nothing
     matched. Never falls through to a weaker tier once a stronger one has hit: a name
     correspondence is not recorded when the source's own identifier already resolved
     the reference. */
  #recognise(rr, resolvedBy) {
    const refNorm = Store.#normAlias(rr.ref);
    const keyNorm = rr.ref_key == null ? "" : Store.#normAlias(rr.ref_key);
    const labelNorm = rr.label == null ? "" : Store.#normAlias(rr.label);
    let grade = null, basis = null, method = null, hits = [];
    const a = this.#entitiesByAliasNorm(refNorm);
    if (a.length) {
      grade = "A"; hits = a; basis = rr.ref;
      method = `source identifier -- the reference's composite key '${rr.ref}' matched a registered identifier `
             + `of the entity exactly; the source names this subject by this key, both ends captured`;
    } else {
      const b = keyNorm && keyNorm !== refNorm ? this.#entitiesByAliasNorm(keyNorm) : [];
      if (b.length) {
        grade = "B"; hits = b; basis = rr.ref_key;
        method = `source identifier in content -- the reference's key '${rr.ref_key}' matched a registered `
               + `identifier of the entity exactly at both ends`;
      } else {
        const c = labelNorm ? this.#entitiesByAliasNorm(labelNorm) : [];
        if (c.length) {
          grade = "C"; hits = c; basis = rr.label;
          method = `correspondence -- the reference's name '${rr.label}' matched an entity alias by name; `
                 + `plausible, never established, flagged for a member to confirm`;
        }
      }
    }
    const matches = [];
    for (const entityId of hits) {
      matches.push(this.#upsertResolution({
        captureSha: rr.capture_sha, bundleId: rr.bundle_id, ref: rr.ref, entityId, grade, method, basis, resolvedBy }));
    }
    return matches;
  }

  /* op=resolve: run the recogniser over a captured document's references and store the
     resolutions. With a `ref`, resolve just that reference; without one, resolve every
     reference the document's reading carries. A reference matching no entity is returned
     UNRESOLVED and honestly so -- there is no row, no force-match. */
  async resolveReferences({ captureSha, ref = null, resolvedBy = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA", detail: "a resolution is over a captured document, named by its capture sha256" };
    let refs;
    if (ref != null) {
      if (typeof ref !== "string" || !ref)
        return { ok: false, reason: "NO_REF", detail: "resolve a single reference by its raw kind:key, or omit ref to resolve all" };
      const one = this.#one(
        `SELECT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs WHERE capture_sha=? AND ref=?`,
        captureSha, ref);
      if (!one) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha, ref,
        detail: "this captured document's reading carries no such reference (nothing to resolve)" };
      refs = [one];
    } else {
      refs = this.#rows(
        `SELECT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs WHERE capture_sha=? ORDER BY ref`,
        captureSha);
    }
    const resolved = [], unresolved = [];
    this.ctx.storage.transactionSync(() => {
      for (const rr of refs) {
        const matches = this.#recognise(rr, resolvedBy);
        if (matches.length === 0) { unresolved.push({ ref: rr.ref, kind: rr.ref_kind, key: rr.ref_key, label: rr.label }); continue; }
        for (const m of matches) resolved.push(m);
      }
    });
    /* REC-5 / D-122: #recognise stamped every entity whose resolution was inserted
       or raised (never a kept one). If anything was dirtied, ARM the scheduled
       connection-derive sweep so the entity axis self-populates without a manual
       op=connect. Producer-side only: it SCHEDULES, it never derives here. */
    if (resolved.some((m) => !m.kept)) await this.#armConnectionDerive();
    return { ok: true, capture_sha: captureSha, references: refs.length,
             resolved_count: resolved.length, unresolved_count: unresolved.length, resolved, unresolved };
  }

  /* op=resolvetestify: a member's Grade D TESTIMONY that a document concerns an entity,
     recorded with an author and a date (framework 8.1 grade D). The RECOGNISER never
     mints a D -- this is the ONLY path a D enters, and it is member-driven, never the
     machine's. It refuses unless the reference actually appears in the document's
     reading and the entity is registered, so testimony cannot invent either end. It
     shares the improvable-grade rule: a D never downgrades a stronger machine
     resolution already present for the same triple. */
  async testifyResolution({ captureSha, ref, entityId, basis, resolvedBy = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA", detail: "testimony is about a captured document, named by its capture sha256" };
    if (typeof ref !== "string" || !ref)
      return { ok: false, reason: "NO_REF", detail: "testimony names the raw reference (kind:key) the document carries" };
    if (typeof entityId !== "string" || !entityId)
      return { ok: false, reason: "NO_ENTITY", detail: "testimony names the entity the reference concerns, by id" };
    const b = typeof basis === "string" ? basis.trim() : "";
    if (!b) return { ok: false, reason: "NO_BASIS",
      detail: "grade D is recorded testimony: it carries the member's stated basis, with an author and a date" };
    const rr = this.#one(`SELECT bundle_id FROM reading_refs WHERE capture_sha=? AND ref=?`, captureSha, ref);
    if (!rr) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha, ref,
      detail: "this captured document's reading carries no such reference to testify about" };
    const ent = this.#one(`SELECT entity_id FROM entities WHERE entity_id=?`, entityId);
    if (!ent) return { ok: false, reason: "NO_SUCH_ENTITY", entity_id: entityId };
    const method = `testimony -- asserted by ${resolvedBy || "a member"} with no captured basis (framework 8.1 grade D)`;
    const m = this.ctx.storage.transactionSync(() => this.#upsertResolution({
      captureSha, bundleId: rr.bundle_id, ref, entityId, grade: "D", method, basis: b, resolvedBy }));
    /* REC-5 / D-122: a grade-D testimony that INSERTED or RAISED a resolution
       dirtied the entity (a kept D below a stronger machine grade did not) — arm
       the sweep so the connection is re-derived. */
    if (!m.kept) await this.#armConnectionDerive();
    return { ok: true, grade_declared: "D", ...m };
  }

  /* The read-side view of a resolution: established and needs_confirmation are surfaced
     explicitly from the grade so a caller cannot misread a C as established. */
  /* REC-30: `keep` is the D-15 back-reference projection (`#bundleRedactor`),
     passed in by the caller so one resolution list asks the store once per
     distinct bundle. Absent — the DO-internal callers that are legitimate
     whole-corpus readers — nothing is withheld. */
  #resolutionView(r, keep = null) {
    return { capture_sha: r.capture_sha, bundle_id: keep ? keep(r.bundle_id) : r.bundle_id,
             ref: r.ref, entity_id: r.entity_id,
             grade: r.grade, established: !!r.established, needs_confirmation: r.grade === "C",
             method: r.method, basis: r.basis, raised_from: r.raised_from, resolved_by: r.resolved_by, at: r.at };
  }

  /* op=resolutions: every resolution the recogniser (or a member's testimony) recorded
     for one captured document, by its capture sha. */
  resolutionsForCapture({ captureSha, viewer = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA", detail: "resolutions are read for a captured document, by its capture sha256" };
    const rows = this.#rows(
      `SELECT capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, raised_from, resolved_by, at
         FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id`, captureSha);
    /* REC-30: a resolution is a fact about a CAPTURE's reference and an entity;
       the bundle back-reference takes the D-15 projection. */
    const keep = this.#bundleRedactor(viewer);
    return { ok: true, capture_sha: captureSha, count: rows.length,
             resolutions: rows.map((r) => this.#resolutionView(r, keep)) };
  }

  /* op=concerns: THE REVERSE INDEX -- every document (capture, with its bundle) that
     concerns entity X, by joining resolutions on entity_id. This is the single largest
     piece of manual work the framework removes. It joins on entity_id ONLY: a declared
     relation is NEVER traversed (do not resolve THROUGH a relation, D-83), so "concerns
     X" means a reference in the document resolved to X itself, not to a proxy of X.
     Each document reports the STRONGEST grade any of its references resolved to X at,
     with established/needs_confirmation surfaced so a C is never presented as settled. */
  documentsConcerning({ entityId, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return { ok: false, reason: "NO_ENTITY", detail: "the reverse index answers by entity id (op=concerns&id=ENT-...)" };
    /* REC-30: "which documents concern this subject" is the framework's single
       largest saving and it is about CAPTURES — the strongest grade each one
       resolved at is the record's, identical for every reader. Only the bundle
       back-reference takes the D-15 projection. */
    const keep = this.#bundleRedactor(viewer);
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    const rows = this.#rows(
      `SELECT capture_sha, bundle_id, ref, grade, method, established, at
         FROM resolutions WHERE entity_id=? ORDER BY grade, bundle_id, capture_sha`, entityId);
    /* Collapse to distinct captures, keeping the strongest grade per capture. */
    const byCapture = new Map();
    for (const r of rows) {
      const cur = byCapture.get(r.capture_sha);
      if (!cur || Store.#GRADE_RANK[r.grade] > Store.#GRADE_RANK[cur.grade]) {
        byCapture.set(r.capture_sha, { capture_sha: r.capture_sha, bundle_id: keep(r.bundle_id), ref: r.ref,
          grade: r.grade, established: !!r.established, needs_confirmation: r.grade === "C", method: r.method, at: r.at });
      }
    }
    const documents = [...byCapture.values()];
    return { ok: true, entity_id: entityId, found: !!ent,
             entity: ent ? { entity_id: ent.entity_id, kind: ent.kind, label: ent.label } : null,
             count: documents.length, resolution_count: rows.length, documents };
  }

  /* ---- CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA, and the PROGRESSION
   * DEFINITION as data (framework section 8, 8.1, 8.2). Absorbs D-67 (connections were
   * emitted and stored nowhere) and D-72 (connections had no grade).
   *
   * A CONNECTION is the two-node base case of a progression: two captured documents that
   * resolve to the SAME registry entity are connected, because two documents concerning
   * one subject is the raw material of a connection (framework section 8). It is DERIVED
   * from FW-7's resolutions -- built UNDER the reverse-index join documentsConcerning
   * already makes, not a parallel path -- and it carries the section 8.1 GRADE: the
   * WEAKER of how its two ends resolved to the shared entity, which is section 8.2's
   * "a progression instance inherits the weakest connection grade along its chain" in
   * its two-node base case. */

  /* The weaker of two section-8.1 grades by rank (A strongest .. D weakest): a connection
     is no stronger than its weaker end, because a case is only as strong as its weakest
     link (framework 8.1).

     CORRECTED 2026-08-04 (REC-12, RECONCILED.md §1.1 R1-m). The comment here used to end
     "Reuses the resolution grade rank so the two axes cannot drift", and THAT SENTENCE WAS
     WRONG IN BOTH HALVES — it stated as a design INTENT the two things R1 and R2 forbid,
     which is why it is corrected rather than deleted (CLAUDE.md: correct a superseded claim
     and say why the old one was wrong).

       (1) "so the two axes cannot drift" wanted capture and connection to share one rank.
           R2/DEC-21 rules the opposite: they are two measurements over two POPULATIONS —
           capture over every DOCUMENT a conclusion reaches, connection over every EDGE it
           rests on — and nothing may average, mix or collapse them. Two scales that cannot
           drift apart are two scales that have been made one, which is the collapse itself.
       (2) `|| 0` ranks an UNKNOWN grade BELOW D, i.e. below a member's signed testimony.
           A null is the ABSENCE of a grade, not a weak one, and the two must not share a
           rank (R1). Under DEC-18 an ungraded leg is INERT — excluded from the population
           entirely — so a null must be short-circuited BEFORE any rank comparison happens.

     WHAT THIS FUNCTION IS STILL FOR, unchanged and legitimate: composing a CONNECTION's own
     grade from its two ends (`connections.a_grade`/`b_grade`) — how each end resolved to the
     shared entity. Both ends measure the same kind of thing on the same scale, and neither
     is ever null here (the resolver never stores one), so nothing above applies to its
     callers. REC-12's inquiry-altitude derivation does NOT and MUST NOT reuse it; it carries
     its own #weakestOf, per axis, with the null short-circuited first. */
  static #weakerGrade(g1, g2) {
    return (Store.#GRADE_RANK[g1] || 0) <= (Store.#GRADE_RANK[g2] || 0) ? g1 : g2;
  }

  /* The read-side view of a connection: established and needs_confirmation are surfaced
     from the WEAKER grade so a connection resting on a C at either end is never read back
     as established, and asserted_by is surfaced DISTINCT from grade (framework:554). */
  #connectionView(r) {
    return { a_capture_sha: r.a_capture_sha, b_capture_sha: r.b_capture_sha, entity_id: r.entity_id,
             a_bundle_id: r.a_bundle_id, b_bundle_id: r.b_bundle_id,
             grade: r.grade, a_grade: r.a_grade, b_grade: r.b_grade,
             established: !!r.established, needs_confirmation: !Store.#isEstablished(r.grade),
             asserted_by: r.asserted_by, basis: r.basis, at: r.at };
  }

  /* op=connect: DERIVE and persist the connections among every captured document that
     concerns one entity. Reads the entity's resolutions (FW-7) exactly as the reverse
     index does, collapses them to the STRONGEST grade each capture resolved to the entity
     at, and forms one connection per PAIR of distinct captures -- graded the WEAKER of the
     two ends, established only when BOTH ends are established (A/B), asserted_by 'system'
     (the framework inferred it). Canonical pair order (a < b) means (X,Y) and (Y,X) are
     ONE row; a re-derivation after a resolution's grade was RAISED (FW-7) upserts in place,
     so a connection is improvable too. A PROGRESSION INSTANCE -- an N-stage chain of real
     documents threaded by an entity -- is slice B; this forms the two-node base case. */
  deriveConnections({ entityId, assertedBy = "system" } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return { ok: false, reason: "NO_ENTITY", detail: "a connection is derived among the documents that concern one entity, by its id (op=connect&id=ENT-...)" };
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    const rows = this.#rows(
      `SELECT capture_sha, bundle_id, grade FROM resolutions WHERE entity_id=? ORDER BY capture_sha`, entityId);
    /* Collapse to distinct captures, keeping the STRONGEST grade each resolved to the
       entity at -- the same collapse op=concerns makes, so a connection end's grade is
       exactly the grade that document appears at in the reverse index. */
    const byCapture = new Map();
    for (const r of rows) {
      const cur = byCapture.get(r.capture_sha);
      if (!cur || Store.#GRADE_RANK[r.grade] > Store.#GRADE_RANK[cur.grade])
        byCapture.set(r.capture_sha, { capture_sha: r.capture_sha, bundle_id: r.bundle_id, grade: r.grade });
    }
    const ends = [...byCapture.values()];
    const at = new Date().toISOString();
    const label = ent ? ent.label : entityId;
    const connections = [];
    this.ctx.storage.transactionSync(() => {
      for (let i = 0; i < ends.length; i++) {
        for (let j = i + 1; j < ends.length; j++) {
          /* Canonical order: the lexicographically smaller capture sha is end A, so a pair
             is ONE connection regardless of which end the loop reached first. */
          let A = ends[i], B = ends[j];
          if (A.capture_sha > B.capture_sha) { const tmp = A; A = B; B = tmp; }
          const grade = Store.#weakerGrade(A.grade, B.grade);
          const est = Store.#isEstablished(grade) ? 1 : 0;
          const basis = `both documents concern ${label} (${entityId}); grade is the weaker of the two ends `
                      + `(${A.grade}, ${B.grade}) -> ${grade}`;
          this.sql.exec(
            `INSERT INTO connections
               (a_capture_sha,b_capture_sha,entity_id,a_bundle_id,b_bundle_id,a_grade,b_grade,grade,established,asserted_by,basis,at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
             ON CONFLICT(a_capture_sha,b_capture_sha,entity_id) DO UPDATE SET
               a_bundle_id=excluded.a_bundle_id, b_bundle_id=excluded.b_bundle_id,
               a_grade=excluded.a_grade, b_grade=excluded.b_grade, grade=excluded.grade,
               established=excluded.established, asserted_by=excluded.asserted_by,
               basis=excluded.basis, at=excluded.at`,
            A.capture_sha, B.capture_sha, entityId, A.bundle_id, B.bundle_id, A.grade, B.grade, grade, est,
            String(assertedBy || "system"), basis.slice(0, 400), at);
          connections.push(this.#connectionView({
            a_capture_sha: A.capture_sha, b_capture_sha: B.capture_sha, entity_id: entityId,
            a_bundle_id: A.bundle_id, b_bundle_id: B.bundle_id, a_grade: A.grade, b_grade: B.grade,
            grade, established: est, asserted_by: String(assertedBy || "system"), basis: basis.slice(0, 400), at }));
        }
      }
    });
    return { ok: true, entity_id: entityId, found: !!ent,
             entity: ent ? { entity_id: ent.entity_id, kind: ent.kind, label: ent.label } : null,
             documents: ends.length, count: connections.length, connections };
  }

  /* op=connections: read the persisted connections, by entity (every connection through a
     subject) or by capture sha (every connection this document is an end of, either side).
     established and needs_confirmation come from the WEAKER grade, so a caller can never
     read a connection resting on a C as settled. */
  connectionsFor({ entityId = null, captureSha = null, viewer = null } = {}) {
    let rows;
    if (entityId) {
      rows = this.#rows(
        `SELECT * FROM connections WHERE entity_id=? ORDER BY grade, a_capture_sha, b_capture_sha`, entityId);
    } else if (captureSha) {
      rows = this.#rows(
        `SELECT * FROM connections WHERE a_capture_sha=? OR b_capture_sha=? ORDER BY grade, entity_id`, captureSha, captureSha);
    } else {
      return { ok: false, reason: "NO_KEY", detail: "read connections by entity (id=ENT-...) or by capture (sha256=...)" };
    }
    /* REC-30: a connection is between two CAPTURES through one entity, and its
       grade is the weaker of its two ends — the record's own, not the reader's.
       Both bundle back-references take the D-15 projection, INDEPENDENTLY: a
       connection with one visible end and one invisible one still says what it
       says, and names only the end it may. */
    const keep = this.#bundleRedactor(viewer);
    return { ok: true, entity_id: entityId, capture_sha: captureSha, count: rows.length,
             connections: rows.map((r) => ({
               ...this.#connectionView(r),
               a_bundle_id: keep(r.a_bundle_id), b_bundle_id: keep(r.b_bundle_id) })) };
  }

  /* The closed vocabulary of stage requiredness (framework 8.2): unless_exception is the
     crucial one -- a lawful skip needs an exception document (slice B). */
  static #REQUIREDNESS = new Set(["always", "usually", "sometimes", "never", "unless_exception"]);

  /* op=progressiondefine: author a PROGRESSION DEFINITION as data -- an ordered set of
     stages carrying after / cardinality / interval / required-ness (framework 8.2's
     progression table). It is a member's CLAIM about how an institution ought to behave
     (framework 8.1 note 3), so it carries its author and date; the declaring member is
     stamped server-side. Re-defining the same key REPLACES its stages (the set is
     editable data, not code). Both example progressions -- meeting->agenda->minutes and
     need->award->signed-contract -- must be expressible as calls here. */
  defineProgression({ progressionKey, label, note = null, stages, declaredBy = null } = {}) {
    if (typeof progressionKey !== "string" || !progressionKey.trim())
      return { ok: false, reason: "NO_KEY", detail: "a progression definition is named by a key, e.g. 'meeting' or 'procurement'" };
    const key = progressionKey.trim();
    if (typeof label !== "string" || !label.trim())
      return { ok: false, reason: "NO_LABEL", detail: "a progression definition carries a human label" };
    if (!Array.isArray(stages) || stages.length === 0)
      return { ok: false, reason: "NO_STAGES", detail: "a progression is its ordered stages; name at least one" };
    /* Normalise and validate every stage before writing any, so a bad row refuses the
       whole definition rather than leaving a half-written one. */
    const norm = [];
    const seen = new Set();
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i] || {};
      const sk = typeof s.key === "string" ? s.key.trim() : (typeof s.stageKey === "string" ? s.stageKey.trim() : "");
      if (!sk) return { ok: false, reason: "NO_STAGE_KEY", detail: `stage ${i + 1} has no key`, stage: i + 1 };
      if (seen.has(sk)) return { ok: false, reason: "DUPLICATE_STAGE", detail: `stage key '${sk}' appears twice`, stage_key: sk };
      seen.add(sk);
      const card = typeof s.cardinality === "string" && s.cardinality.trim() ? s.cardinality.trim() : "";
      if (!card) return { ok: false, reason: "NO_CARDINALITY", detail: `stage '${sk}' needs a cardinality (1, 0..1, 0..n)`, stage_key: sk };
      const req = typeof s.required === "string" ? s.required.trim() : "";
      if (!Store.#REQUIREDNESS.has(req))
        return { ok: false, reason: "BAD_REQUIRED", stage_key: sk,
                 detail: `stage '${sk}' required must be one of always, usually, sometimes, never, unless_exception` };
      norm.push({ stage_key: sk, stage_no: i + 1,
                  label: typeof s.label === "string" && s.label ? s.label : null,
                  after_stage: typeof s.after === "string" && s.after.trim() ? s.after.trim()
                             : (typeof s.afterStage === "string" && s.afterStage.trim() ? s.afterStage.trim() : null),
                  cardinality: card, within_interval: typeof s.within === "string" && s.within.trim() ? s.within.trim() : null,
                  required: req });
    }
    /* after_stage must name a stage in THIS definition (or be null): a stage cannot
       presuppose one that does not exist. */
    for (const s of norm) {
      if (s.after_stage != null && !seen.has(s.after_stage))
        return { ok: false, reason: "UNKNOWN_AFTER", stage_key: s.stage_key, after: s.after_stage,
                 detail: `stage '${s.stage_key}' is after '${s.after_stage}', which is not a stage of this progression` };
    }
    const at = new Date().toISOString();
    const by = declaredBy == null ? null : String(declaredBy).slice(0, 200);
    this.ctx.storage.transactionSync(() => {
      this.sql.exec(
        `INSERT INTO progression_defs (progression_key,label,note,declared_by,at) VALUES (?,?,?,?,?)
         ON CONFLICT(progression_key) DO UPDATE SET label=excluded.label, note=excluded.note,
           declared_by=excluded.declared_by, at=excluded.at`,
        key, label.trim(), note == null ? null : String(note).slice(0, 1000), by, at);
      this.sql.exec(`DELETE FROM progression_stages WHERE progression_key=?`, key);
      for (const s of norm)
        this.sql.exec(
          `INSERT INTO progression_stages (progression_key,stage_key,stage_no,label,after_stage,cardinality,within_interval,required)
           VALUES (?,?,?,?,?,?,?,?)`,
          key, s.stage_key, s.stage_no, s.label, s.after_stage, s.cardinality, s.within_interval, s.required);
    });
    return { ok: true, progression_key: key, label: label.trim(), stage_count: norm.length,
             stages: norm, declared_by: by, at };
  }

  /* op=progression: read a progression definition and its ordered stages. */
  readProgression({ progressionKey } = {}) {
    if (typeof progressionKey !== "string" || !progressionKey.trim())
      return { ok: false, reason: "NO_KEY", detail: "read a progression definition by its key (op=progression&key=meeting)" };
    const key = progressionKey.trim();
    const def = this.#one(`SELECT progression_key, label, note, declared_by, at FROM progression_defs WHERE progression_key=?`, key);
    if (!def) return { ok: true, progression_key: key, found: false, stages: [] };
    const stages = this.#rows(
      `SELECT stage_key, stage_no, label, after_stage, cardinality, within_interval, required
         FROM progression_stages WHERE progression_key=? ORDER BY stage_no`, key);
    return { ok: true, progression_key: key, found: true,
             label: def.label, note: def.note, declared_by: def.declared_by, at: def.at,
             stage_count: stages.length, stages };
  }

  /* ---- CONSTRUCTS Step 5, SLICE B (FW-9): PROGRESSION INSTANCES, N-stage weakest-grade
   * inheritance, and the MISSING-PREDECESSOR finding (M4's acceptance: "a progression with a
   * missing predecessor is visible"). A progression INSTANCE threads REAL captured documents
   * through a definition's stages, assembled by following a THREADING ENTITY (framework 8.2:
   * "an instance of a progression is assembled by following an entity"). It builds ON FW-8:
   *   - a document is threaded only if it RESOLVES to the entity (FW-7) -- a real connection,
   *     not one a caller can invent;
   *   - the instance grade is the WEAKEST connection along the chain -- FW-8 graded the
   *     two-node base case, this generalises it to N stages (D-73 pair->chain);
   *   - a REQUIRED stage with no document is a missing-predecessor finding carrying the
   *     instance's grade (framework 8.2: "an award with no solicitation").
   * DEFERRED past FW-9 (flagged, not built): exception documents that discharge a lawful
   * skip; junction checks as findings; the scheduled task that walks the table. */

  /* The strongest 8.1 grade each captured document resolved to this entity at, with its
     bundle -- the SAME collapse op=concerns and op=connect make, so a placement's end-grade
     is exactly the grade that document appears at in the reverse index. Reuses the resolution
     grade rank so the instance axis cannot drift from the connection axis. */
  #strongestResolutionsFor(entityId) {
    const rows = this.#rows(
      `SELECT capture_sha, bundle_id, grade FROM resolutions WHERE entity_id=? ORDER BY capture_sha`, entityId);
    const byCapture = new Map();
    for (const r of rows) {
      const cur = byCapture.get(r.capture_sha);
      if (!cur || Store.#GRADE_RANK[r.grade] > Store.#GRADE_RANK[cur.grade])
        byCapture.set(r.capture_sha, { capture_sha: r.capture_sha, bundle_id: r.bundle_id, grade: r.grade });
    }
    return byCapture;
  }

  /* A missing stage is a FINDING only when the group's definition says the stage is expected
     (framework 8.2 required-ness) AND the skip is UNDISCHARGED. A sometimes/never stage missing
     is NOT a finding -- respect the stage's required-ness. always and usually fire (as FW-9).
     unless_exception is the crucial one: FW-9 left it SILENT because its finding turns on "no
     exception document" and FW-9 did not build that check (DEC-9 provisional a). FW-10 builds
     the exception-document machinery, so unless_exception GRADUATES to DISCHARGEABLE and now
     fires when required-and-UNDISCHARGED -- exactly DEC-9's own recommendation (c). This is the
     PROVISIONAL: DEC-9 stays OPEN and Bob rules whether unless_exception fires by default; the
     reversal is this one line (drop "unless_exception" from the set to return it to silence).
     Discharge itself applies to ANY of these -- a required stage that is missing but carries a
     discharging exception document is a "discharged" state, not a finding (see #assembleInstance).
     The finding reports; it does not decide. */
  static #REQUIRED_FIRES = new Set(["always", "usually", "unless_exception"]);

  /* Assemble a progression INSTANCE from its stored placements plus the CURRENT definition,
     deriving the instance grade and the missing-predecessor findings ON READ -- never from a
     stored grade that could go stale, so the instance reflects the live definition and the
     documents still held. found:false if the definition is gone. */
  #assembleInstance(progressionKey, entityId) {
    const def = this.#one(
      `SELECT progression_key, label FROM progression_defs WHERE progression_key=?`, progressionKey);
    if (!def) return { ok: true, progression_key: progressionKey, entity_id: entityId, found: false, defined: false,
                       detail: "no such progression definition (define it first, op=progressiondefine)" };
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    const stageDefs = this.#rows(
      `SELECT stage_key, stage_no, label, after_stage, cardinality, within_interval, required
         FROM progression_stages WHERE progression_key=? ORDER BY stage_no`, progressionKey);
    const rows = this.#rows(
      `SELECT stage_key, capture_sha, bundle_id, grade FROM progression_instances
         WHERE progression_key=? AND entity_id=?`, progressionKey, entityId);
    /* FW-10: the EXCEPTION DOCUMENTS recorded against this instance -- the documents that
       discharge a lawful skip (framework 8.2). Loaded here and CONSULTED per stage below: a
       required stage that is missing but discharged is a distinct "discharged" state, not a
       missing-predecessor finding. Grouped by the stage each names. */
    const excRows = this.#rows(
      `SELECT stage_key, capture_sha, bundle_id, reason, citation, declared_by, at FROM progression_exceptions
         WHERE progression_key=? AND entity_id=?`, progressionKey, entityId);
    const excByStage = new Map();
    for (const e of excRows) {
      if (!excByStage.has(e.stage_key)) excByStage.set(e.stage_key, []);
      excByStage.get(e.stage_key).push({ capture_sha: e.capture_sha, bundle_id: e.bundle_id,
        reason: e.reason, citation: e.citation, declared_by: e.declared_by, at: e.at });
    }
    /* found:false when NOTHING has been threaded on this entity -- an empty instance has no
       missing predecessor (there is no successor either), and reporting every required stage
       as absent would be a finding about a thing that does not exist. `defined:true` tells a
       caller the progression IS defined (they did not mistype the key), only that no document
       has been threaded on this entity yet. */
    if (rows.length === 0)
      return { ok: true, progression_key: progressionKey, entity_id: entityId, found: false, defined: true,
               label: def.label, entity: ent ? { entity_id: ent.entity_id, kind: ent.kind, label: ent.label } : null,
               grade: null, grade_determined: false, stage_count: stageDefs.length, placed_count: 0,
               chain: [], stages: [], findings: [], finding_count: 0, discharges: [], discharge_count: 0 };
    /* Group placements by stage; the stage's REPRESENTATIVE for the chain is its STRONGEST
       document (a stage is as well-evidenced as its best document, cardinality 0..n). */
    const docsByStage = new Map();
    for (const r of rows) {
      if (!docsByStage.has(r.stage_key)) docsByStage.set(r.stage_key, []);
      docsByStage.get(r.stage_key).push({ capture_sha: r.capture_sha, bundle_id: r.bundle_id, grade: r.grade });
    }
    const repGrade = new Map();
    for (const [sk, docs] of docsByStage) {
      let best = docs[0];
      for (const d of docs) if (Store.#GRADE_RANK[d.grade] > Store.#GRADE_RANK[best.grade]) best = d;
      repGrade.set(sk, best.grade);
    }
    /* The chain: PLACED stages in stage order (a missing stage in the middle is skipped here
       and surfaces as a finding below, not as a broken chain). Each consecutive pair is a
       connection graded the WEAKER of its two ends (FW-8 #weakerGrade); the INSTANCE grade is
       the WEAKEST connection along the whole chain (framework 8.2, D-73 generalised to N
       stages). With fewer than two placed stages there is NO connection, so the grade is
       UNDETERMINED -- never invented (CLAUDE.md: undetermined is first-class and stated). */
    const placedInOrder = stageDefs.filter((s) => docsByStage.has(s.stage_key));
    const chain = [];
    let instanceGrade = null;
    for (let i = 1; i < placedInOrder.length; i++) {
      const a = placedInOrder[i - 1], b = placedInOrder[i];
      const ga = repGrade.get(a.stage_key), gb = repGrade.get(b.stage_key);
      const g = Store.#weakerGrade(ga, gb);
      chain.push({ from_stage: a.stage_key, to_stage: b.stage_key, a_grade: ga, b_grade: gb, grade: g });
      if (instanceGrade === null || Store.#GRADE_RANK[g] < Store.#GRADE_RANK[instanceGrade]) instanceGrade = g;
    }
    const determined = instanceGrade !== null;
    /* The stage view, the missing-predecessor findings, and the DISCHARGED states (FW-10). A
       REQUIRED stage (always/usually/unless_exception) with no document is normally a finding
       carrying the INSTANCE's grade -- the finding REPORTS the gap, it does not decide (framework
       invariant 8), and it carries the weakest grade the chain rests on so a case built on it says
       how strong that chain is. BUT a missing required stage that carries a DISCHARGING exception
       document is a lawful, recorded skip: it becomes a distinct "discharged" state carrying the
       exception's reason/citation and the discharging document -- NOT a finding, and NOT silently
       absent (the record must show WHY the skip is legitimate). Undischarged-and-required still
       fires. A discharge only applies to a stage that is actually MISSING: an exception naming a
       stage that is present discharges nothing (there is no skip), and is carried on the stage as
       inert so the record shows it too. */
    const stages = [], findings = [], discharges = [];
    for (const s of stageDefs) {
      const docs = docsByStage.get(s.stage_key) || [];
      const present = docs.length > 0;
      const exceptions = excByStage.get(s.stage_key) || [];
      /* Only a MISSING stage can be discharged -- a discharge naming a present stage discharges
         nothing (framework 8.2: the exception explains a SKIP, and a filled stage was not skipped). */
      const discharged = !present && exceptions.length > 0;
      stages.push({ stage_key: s.stage_key, label: s.label, after_stage: s.after_stage,
                    cardinality: s.cardinality, required: s.required, present, document_count: docs.length,
                    grade: present ? repGrade.get(s.stage_key) : null,
                    discharged, exception_count: exceptions.length, exceptions,
                    documents: docs.map((d) => ({ capture_sha: d.capture_sha, bundle_id: d.bundle_id, grade: d.grade })) });
      if (!present && Store.#REQUIRED_FIRES.has(s.required)) {
        if (discharged) {
          /* A lawful, RECORDED skip -- the exception document names why the stage may be missing
             (framework 8.2). Reported distinctly (not a finding, not hidden), carrying the same
             reason/citation the writer earned, so the record shows the skip AND its legitimacy. */
          discharges.push({ kind: "discharged_skip", stage_key: s.stage_key, stage_label: s.label,
                            required: s.required, after_stage: s.after_stage,
                            documents: exceptions,
                            detail: `the '${s.stage_key}' stage is ${s.required} required and unfilled, but its skip is`
                                  + ` DISCHARGED by ${exceptions.length} exception document(s) naming why it may be missing`
                                  + ` (framework 8.2) -- a lawful, recorded skip, not a gap` });
        } else {
          findings.push({ kind: "missing_predecessor", stage_key: s.stage_key, stage_label: s.label,
                          required: s.required, after_stage: s.after_stage,
                          /* every required tier is DISCHARGEABLE by an exception document (FW-10); this
                             one simply carries none. unless_exception's firing here is DEC-9's open policy. */
                          dischargeable: true,
                          grade: determined ? instanceGrade : "undetermined", grade_determined: determined,
                          detail: `the '${s.stage_key}' stage is ${s.required} required but no threaded document fills it`
                                + ` and no exception document discharges the skip -- a missing predecessor (framework 8.2),`
                                + ` carrying the instance's grade` });
        }
      }
    }
    return { ok: true, progression_key: progressionKey, entity_id: entityId, found: true, defined: true,
             label: def.label, entity: ent ? { entity_id: ent.entity_id, kind: ent.kind, label: ent.label } : null,
             grade: instanceGrade, grade_determined: determined,
             established: determined && Store.#isEstablished(instanceGrade),
             stage_count: stageDefs.length, placed_count: placedInOrder.length,
             chain, stages, findings, finding_count: findings.length,
             discharges, discharge_count: discharges.length };
  }

  /* op=thread: thread REAL captured documents through a progression definition's stages,
     assembled by a THREADING ENTITY -- one instance per (definition, entity). A document is
     admitted ONLY if it RESOLVES to the entity (FW-7): a document that does not concern the
     subject cannot be threaded on it (an equality a caller can hand us is one a caller can
     invent). Each placement's GRADE is the record's (the document's strongest resolution to
     the entity), never the caller's; which STAGE a document fills is the member's authored
     judgment, so threaded_by is stamped server-side. Re-threading REPLACES the instance's
     placements (an instance is editable, like a definition). Returns the assembled instance
     -- grade and findings derived. */
  async threadInstance({ progressionKey, entityId, placements, threadedBy = null, viewer = null } = {}) {
    if (typeof progressionKey !== "string" || !progressionKey.trim())
      return { ok: false, reason: "NO_KEY", detail: "a progression instance names its definition by key (op=thread)" };
    const key = progressionKey.trim();
    if (typeof entityId !== "string" || !entityId.trim())
      return { ok: false, reason: "NO_ENTITY", detail: "a progression instance is threaded by an entity, named by its id" };
    const eid = entityId.trim();
    if (!Array.isArray(placements) || placements.length === 0)
      return { ok: false, reason: "NO_PLACEMENTS", detail: "name at least one {stage, captureSha} placement to thread" };
    const def = this.#one(`SELECT progression_key FROM progression_defs WHERE progression_key=?`, key);
    if (!def) return { ok: false, reason: "NO_SUCH_PROGRESSION", progression_key: key,
      detail: "define the progression first (op=progressiondefine), then thread documents through it" };
    const ent = this.#one(`SELECT entity_id FROM entities WHERE entity_id=?`, eid);
    if (!ent) return { ok: false, reason: "NO_SUCH_ENTITY", entity_id: eid,
      detail: "the threading entity must be registered (op=entitycreate)" };
    const stageKeys = new Set(this.#rows(
      `SELECT stage_key FROM progression_stages WHERE progression_key=?`, key).map((r) => r.stage_key));
    /* The documents that ACTUALLY concern the entity, at their strongest resolution grade --
       the only documents that may be threaded on it. */
    const concerning = this.#strongestResolutionsFor(eid);
    const norm = [];
    const seen = new Set();
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i] || {};
      const sk = typeof p.stage === "string" ? p.stage.trim() : (typeof p.stageKey === "string" ? p.stageKey.trim() : "");
      if (!sk) return { ok: false, reason: "NO_STAGE", detail: `placement ${i + 1} names no stage`, placement: i + 1 };
      if (!stageKeys.has(sk)) return { ok: false, reason: "BAD_STAGE", stage_key: sk,
        detail: `'${sk}' is not a stage of progression '${key}'` };
      const cs = typeof p.captureSha === "string" ? p.captureSha.trim()
               : (typeof p.capture_sha === "string" ? p.capture_sha.trim() : "");
      if (!cs) return { ok: false, reason: "NO_CAPTURE", stage_key: sk, detail: `placement for '${sk}' names no capture sha` };
      /* NUL cannot occur in a stage key or a sha, so the pair key is unambiguous.
         Written as the ESCAPE, never a raw byte: one raw NUL here made this whole
         file read as BINARY to grep, which then silently matched nothing (D-131). */
      const dup = sk + "\u0000" + cs;
      if (seen.has(dup)) return { ok: false, reason: "DUPLICATE_PLACEMENT", stage_key: sk, capture_sha: cs,
        detail: `the same document is placed at '${sk}' twice` };
      seen.add(dup);
      const res = concerning.get(cs);
      if (!res) return { ok: false, reason: "NOT_CONCERNED", stage_key: sk, capture_sha: cs, entity_id: eid,
        detail: "this document does not resolve to the threading entity, so it cannot be threaded on it "
              + "(resolve it first with op=resolve, or thread it on the entity it actually concerns)" };
      norm.push({ stage_key: sk, capture_sha: cs, bundle_id: res.bundle_id, grade: res.grade });
    }
    const at = new Date().toISOString();
    const by = threadedBy == null ? null : String(threadedBy).slice(0, 200);
    this.ctx.storage.transactionSync(() => {
      this.sql.exec(`DELETE FROM progression_instances WHERE progression_key=? AND entity_id=?`, key, eid);
      for (const p of norm)
        this.sql.exec(
          `INSERT INTO progression_instances (progression_key,entity_id,stage_key,capture_sha,bundle_id,grade,threaded_by,at)
           VALUES (?,?,?,?,?,?,?,?)`,
          key, eid, p.stage_key, p.capture_sha, p.bundle_id, p.grade, by, at);
    });
    /* REC-30: the echo a write returns is a READ, and it goes through the same
       projection op=instance does — a caller must not learn from a write's
       receipt what the read would withhold. */
    const inst = this.#redactInstance(this.#assembleInstance(key, eid), viewer);
    /* REC-8: a newly threaded instance may create a FUTURE overdue deadline (a placed, dated
       predecessor with a required successor still absent). ARM the reconciling alarm so the
       overdue-scan consumer wakes at that deadline — the producer/consumer split REC-5 established
       (a resolve arms the connection-derive sweep; a thread arms the overdue scan). Arming only
       SCHEDULES; the finding itself is derived on read, so this writes no overdue state. When the
       instance is already overdue (or carries no determinable deadline) there is no future wake and
       the scan self-terminates — the finding still surfaces through op=proposals. */
    await this.#armScheduler();
    return { ...inst, threaded: norm.length, threaded_by: by, at };
  }

  /** REC-30: the D-15 predicate over an ASSEMBLED instance, applied at the ANSWER
   *  and never inside the derivation.
   *
   *  A progression instance is the record's own reading of how an institution
   *  behaved. Its grade is the weakest connection along the chain and its
   *  findings are what the chain is missing — facts about the WORLD, derived
   *  from every threaded document, and they must be the same for every reader.
   *  Deriving them over a viewer-filtered document set would make the record
   *  stronger for the uninvited than for the invited, which is exactly the
   *  overclaim doctrine forbids.
   *
   *  So the whole derivation stands and only the BACK-REFERENCES are withheld:
   *  each threaded document keeps its capture sha (a capture identity is not a
   *  project identity) and loses the id of the bundle it lives in when that
   *  bundle is one this viewer may not see. `document_count` counts documents,
   *  not names, and stays honest. */
  #redactInstance(inst, viewer) {
    if (!inst || inst.ok !== true) return inst;
    const keep = this.#bundleRedactor(viewer);
    const doc = (d) => ({ ...d, bundle_id: keep(d.bundle_id) });
    return {
      ...inst,
      ...(Array.isArray(inst.stages) ? { stages: inst.stages.map((s) => ({
        ...s,
        documents: Array.isArray(s.documents) ? s.documents.map(doc) : s.documents,
        exceptions: Array.isArray(s.exceptions) ? s.exceptions.map(doc) : s.exceptions,
      })) } : {}),
      ...(Array.isArray(inst.discharges) ? { discharges: inst.discharges.map((d) => ({
        ...d,
        documents: Array.isArray(d.documents) ? d.documents.map(doc) : d.documents,
      })) } : {}),
    };
  }

  /* op=instance: read a progression INSTANCE -- the documents threaded through a definition
     by an entity, with the instance grade (the weakest connection along the chain) and the
     missing-predecessor findings, all DERIVED on read from the CURRENT definition. */
  readInstance({ progressionKey, entityId, viewer = null } = {}) {
    if (typeof progressionKey !== "string" || !progressionKey.trim())
      return { ok: false, reason: "NO_KEY", detail: "read an instance by progression key and entity id (op=instance&key=procurement&id=ENT-...)" };
    if (typeof entityId !== "string" || !entityId.trim())
      return { ok: false, reason: "NO_ENTITY", detail: "read an instance by progression key and entity id (op=instance&key=procurement&id=ENT-...)" };
    return this.#redactInstance(this.#assembleInstance(progressionKey.trim(), entityId.trim()), viewer);
  }

  /* op=discharge (FW-10): record an EXCEPTION DOCUMENT that discharges a lawful SKIP -- a real
     captured document, threaded onto ONE progression instance and NAMING the ONE stage it
     discharges, carrying the reason and citation the institution is supposed to publish for the
     skip (framework 8.2). A discharge must be EARNED, and the earning is enforced HERE so the
     record never rests on a caller's bare assertion (an equality a caller can hand us is one a
     caller can invent):
       - the document must ACTUALLY resolve to the threading entity (FW-7) -- NOT_CONCERNED
         otherwise, the same gate op=thread uses (a document that does not concern the subject
         cannot discharge that subject's skip);
       - it must name a REAL stage of the definition -- BAD_STAGE otherwise (an exception that
         names no real stage discharges nothing);
       - both a reason and a citation are required -- NO_REASON / NO_CITATION, refused fail-closed
         rather than stored empty, the same statement anatomy FW-8's declared relations carry.
     Whether the discharge APPLIES (the stage is missing-and-required) is derived on READ in
     #assembleInstance -- derived findings inform, they do not decide, so this stores the document,
     never a "discharged" flag that could go stale against the live placements. Re-recording the
     same document at the same stage UPSERTS (an exception is editable data); recording it at a
     different stage or from a different document ADDS (a stage may be discharged by several). */
  dischargeStage({ progressionKey, entityId, stageKey, stage, captureSha, capture_sha, reason, citation, declaredBy = null, viewer = null } = {}) {
    if (typeof progressionKey !== "string" || !progressionKey.trim())
      return { ok: false, reason: "NO_KEY", detail: "an exception document names its progression by key (op=discharge)" };
    const key = progressionKey.trim();
    if (typeof entityId !== "string" || !entityId.trim())
      return { ok: false, reason: "NO_ENTITY", detail: "an exception document discharges a skip in one entity's instance, named by id" };
    const eid = entityId.trim();
    const sk = typeof stageKey === "string" ? stageKey.trim() : (typeof stage === "string" ? stage.trim() : "");
    if (!sk) return { ok: false, reason: "NO_STAGE", detail: "an exception document NAMES the stage it discharges" };
    const cs = typeof captureSha === "string" ? captureSha.trim()
             : (typeof capture_sha === "string" ? capture_sha.trim() : "");
    if (!cs) return { ok: false, reason: "NO_CAPTURE", detail: "an exception document IS a captured document, named by its capture sha" };
    const rsn = typeof reason === "string" ? reason.trim() : "";
    if (!rsn) return { ok: false, reason: "NO_REASON",
      detail: "an exception document carries a reason -- why the stage may lawfully be missing (framework 8.2)" };
    const cite = typeof citation === "string" ? citation.trim() : "";
    if (!cite) return { ok: false, reason: "NO_CITATION",
      detail: "an exception document carries a citation -- where the justification for the skip is published" };
    const def = this.#one(`SELECT progression_key FROM progression_defs WHERE progression_key=?`, key);
    if (!def) return { ok: false, reason: "NO_SUCH_PROGRESSION", progression_key: key,
      detail: "define the progression first (op=progressiondefine), then discharge a skip in one of its instances" };
    const ent = this.#one(`SELECT entity_id FROM entities WHERE entity_id=?`, eid);
    if (!ent) return { ok: false, reason: "NO_SUCH_ENTITY", entity_id: eid,
      detail: "the threading entity must be registered (op=entitycreate)" };
    const stageRow = this.#one(`SELECT stage_key FROM progression_stages WHERE progression_key=? AND stage_key=?`, key, sk);
    if (!stageRow) return { ok: false, reason: "BAD_STAGE", stage_key: sk,
      detail: `'${sk}' is not a stage of progression '${key}' -- an exception must name a real stage to discharge` };
    /* the document must ACTUALLY concern the entity (FW-7), at its strongest resolution -- the
       same earned-connection gate op=thread applies to a placement. Its bundle rides along. */
    const res = this.#strongestResolutionsFor(eid).get(cs);
    if (!res) return { ok: false, reason: "NOT_CONCERNED", stage_key: sk, capture_sha: cs, entity_id: eid,
      detail: "this document does not resolve to the threading entity, so it cannot discharge that entity's skip "
            + "(resolve it first with op=resolve, or discharge the skip in the instance it actually concerns)" };
    const at = new Date().toISOString();
    const by = declaredBy == null ? null : String(declaredBy).slice(0, 200);
    this.sql.exec(
      `INSERT INTO progression_exceptions (progression_key,entity_id,stage_key,capture_sha,bundle_id,reason,citation,declared_by,at)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON CONFLICT(progression_key,entity_id,stage_key,capture_sha) DO UPDATE SET
         bundle_id=excluded.bundle_id, reason=excluded.reason, citation=excluded.citation,
         declared_by=excluded.declared_by, at=excluded.at`,
      key, eid, sk, cs, res.bundle_id, rsn.slice(0, 4000), cite.slice(0, 2000), by, at);
    /* return the reassembled instance so the caller sees the discharge take effect ON READ --
       the stage moves from a missing-predecessor finding to a discharged state (when it was in
       fact missing-and-required). */
    /* REC-30: the write's echo is a read and takes op=instance's projection. */
    const inst = this.#redactInstance(this.#assembleInstance(key, eid), viewer);
    return { ...inst, discharged_stage: sk, exception_document: cs, reason: rsn.slice(0, 4000),
             citation: cite.slice(0, 2000), declared_by: by, at };
  }

  /* op=exceptions (FW-10): read the EXCEPTION DOCUMENTS recorded against one progression instance
     -- the raw discharge rows, including any that discharge nothing (a stage that is not missing),
     so the record is auditable. The instance read (op=instance) shows which discharges APPLY as
     "discharged" states; this shows every exception recorded, applied or not. */
  readExceptions({ progressionKey, entityId, viewer = null } = {}) {
    if (typeof progressionKey !== "string" || !progressionKey.trim())
      return { ok: false, reason: "NO_KEY", detail: "read exceptions by progression key and entity id (op=exceptions&key=procurement&id=ENT-...)" };
    if (typeof entityId !== "string" || !entityId.trim())
      return { ok: false, reason: "NO_ENTITY", detail: "read exceptions by progression key and entity id (op=exceptions&key=procurement&id=ENT-...)" };
    const key = progressionKey.trim(), eid = entityId.trim();
    /* REC-30: the row's subject is the DISCHARGE — why a required stage may
       lawfully be missing — and its bundle_id is a back-reference to where the
       discharging capture lives. The discharge stays visible to every member (a
       skip whose justification only some readers could see would be a record
       that says different things to different people); the back-reference is
       withheld when it names a bundle this viewer may not see, and
       exception_count counts discharges, not names. */
    const keep = this.#bundleRedactor(viewer);
    const exceptions = this.#rows(
      `SELECT stage_key, capture_sha, bundle_id, reason, citation, declared_by, at FROM progression_exceptions
         WHERE progression_key=? AND entity_id=? ORDER BY stage_key, capture_sha`, key, eid)
      .map((r) => ({ ...r, bundle_id: keep(r.bundle_id) }));
    return { ok: true, progression_key: key, entity_id: eid, exception_count: exceptions.length, exceptions };
  }

  /* ---- CONSTRUCTS Step 7 (REC-8): AGEING -- the record NOTICES when a required successor
   * stage is OVERDUE (framework 8.2, "minutes follow a meeting within N days"). FW-8 gave each
   * stage a `within_interval` but nothing checked it; REC-8 checks it. This is DERIVED ON READ,
   * NEVER stored: an overdue flag goes stale against the clock (the same argument FW-9 made for
   * the missing-predecessor grade), and a stored `overdue` boolean computed at one instant is a
   * false claim at the next -- so there is NO overdue table. The finding is recomputed in the feed
   * (op=proposals) and on the alarm tick, both against an INJECTABLE clock (#nowMs), so the
   * computation is deterministic in the suite rather than a function of the day it runs.
   *
   * The honesty rules are load-bearing and every one is a "skip" (undetermined, NOT overdue):
   *   - the successor's `within_interval` must PARSE to a real duration -- "before the meeting"
   *     and "by due date" do not, so a stage carrying one of those is never overdue;
   *   - the predecessor stage (the successor's `after_stage`) must be PLACED -- if it is itself
   *     absent, the clock has not started (that gap is the predecessor's own finding);
   *   - the predecessor's document must carry a DETERMINABLE DATE (the reading's `at`, FW-5,
   *     preferred; else the register's `registered` time) -- if neither is determinable the
   *     deadline cannot be computed and is NEVER fabricated. */

  /* The injectable clock. Env-overridable exactly as REC-5 made its cadence/batch env-overridable
     (BIO_NOW_MS), so a suite pins "now" and the overdue computation is deterministic; a caller may
     also pass an explicit instant (op=proposals&now=<ms>, an as-of read, the same seam op=sourcereach
     opened for its time-armed verdict). Falls through to the wall clock in production. Milliseconds. */
  #nowMs(explicit) {
    /* an ABSENT param is null (or "") -- fall through to env, NOT to Number(null)===0 (epoch). */
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /* Turn a member-declared `within_interval` and an anchor instant into a deadline, or null when
     the interval does not parse (undetermined -- never a fabricated deadline). day/week are fixed
     spans; month/year use CALENDAR arithmetic on the anchor date, so "1 year" is exact rather than
     a 365-day approximation. Anything that is not "<n> <unit>" (e.g. "before the meeting", "by due
     date") returns null and the stage is simply not overdue. */
  #intervalDeadlineMs(anchorMs, within) {
    if (typeof within !== "string") return null;
    const m = within.trim().match(/^(\d+)\s*(day|days|week|weeks|month|months|year|years)$/i);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (!Number.isFinite(n)) return null;
    const unit = m[2].toLowerCase();
    if (unit === "day" || unit === "days") return anchorMs + n * 86400000;
    if (unit === "week" || unit === "weeks") return anchorMs + n * 7 * 86400000;
    const d = new Date(anchorMs);
    if (unit === "month" || unit === "months") { d.setUTCMonth(d.getUTCMonth() + n); return d.getTime(); }
    if (unit === "year" || unit === "years") { d.setUTCFullYear(d.getUTCFullYear() + n); return d.getTime(); }
    return null;
  }

  /* A captured document's DATE, in ms, or null when none is determinable. The reading's `at`
     (FW-5, a document's own date -- what op=acquire's reader found) is PREFERRED; the register's
     `registered` instant is the fallback (when the capture was filed). Neither determinable ->
     null, and the stage anchored on it is never overdue -- undetermined stays undetermined. */
  #captureDateMs(captureSha) {
    if (typeof captureSha !== "string" || !captureSha) return null;
    const r = this.#one(`SELECT at FROM readings WHERE capture_sha=?`, captureSha);
    if (r && typeof r.at === "string" && r.at) { const t = Date.parse(r.at); if (Number.isFinite(t)) return t; }
    const reg = this.#one(`SELECT registered FROM register WHERE capture_sha=?`, captureSha);
    if (reg && typeof reg.registered === "string" && reg.registered) { const t = Date.parse(reg.registered); if (Number.isFinite(t)) return t; }
    return null;
  }

  /* For an already-assembled instance, the deadline of every missing-required-undischarged
     successor whose deadline is DETERMINABLE (parseable interval + placed predecessor + dated
     predecessor). Returns {finding, within_interval, predecessor_stage, predecessor_ms,
     deadline_ms} per such stage -- REGARDLESS of whether it is past (that comparison against `now`
     is the caller's, so the same walk serves both the overdue findings and the alarm's next-wake).
     Reuses #assembleInstance's OWN required/discharge decision (its missing_predecessor findings),
     so the requiredness and FW-10 discharge doctrine is enforced at the one derivation point and
     never re-implemented here -- REC-8 adds only the temporal layer on top. */
  #instanceDeadlines(inst) {
    const out = [];
    if (!inst || !inst.found || !Array.isArray(inst.findings) || inst.findings.length === 0) return out;
    const missing = inst.findings.filter((f) => f.kind === "missing_predecessor");
    if (missing.length === 0) return out;
    const within = new Map(this.#rows(
      `SELECT stage_key, within_interval FROM progression_stages WHERE progression_key=?`, inst.progression_key)
      .map((r) => [r.stage_key, r.within_interval]));
    const stageByKey = new Map((inst.stages || []).map((s) => [s.stage_key, s]));
    for (const f of missing) {
      const wi = within.get(f.stage_key);
      if (!wi) continue;                                       // no within_interval -> undetermined, not overdue
      const anchorKey = f.after_stage;
      if (!anchorKey) continue;                                // no predecessor -> no clock anchor
      const anchor = stageByKey.get(anchorKey);
      if (!anchor || !anchor.present) continue;                // predecessor itself absent -> clock not started
      let anchorMs = null;                                     // the LATEST determinable predecessor date --
      for (const d of (anchor.documents || [])) {              // the most generous anchor, so a deadline is
        const t = this.#captureDateMs(d.capture_sha);          // declared overdue only when it truly is (we do
        if (t !== null && (anchorMs === null || t > anchorMs)) anchorMs = t;  // not over-accuse on a stale date)
      }
      if (anchorMs === null) continue;                         // no determinable date -> never a fabricated deadline
      const deadline = this.#intervalDeadlineMs(anchorMs, wi);
      if (deadline === null) continue;                         // interval did not parse -> undetermined
      out.push({ finding: f, within_interval: wi, predecessor_stage: anchorKey,
                 predecessor_ms: anchorMs, deadline_ms: deadline });
    }
    return out;
  }

  /* The OVERDUE findings for one instance at `nowMs`: a distinct finding KIND (overdue_successor)
     so a consumer tells "never happened" (missing_predecessor) from "not yet, but overdue". Every
     overdue stage is ALSO a missing_predecessor (overdue is computed only over those), so overdue is
     strictly an escalation carrying the SAME grade (the instance's weakest connection, or
     undetermined -- never invented). */
  #overdueFindings(inst, nowMs) {
    const out = [];
    for (const d of this.#instanceDeadlines(inst)) {
      if (d.deadline_ms >= nowMs) continue;                    // not yet overdue
      const f = d.finding;
      out.push({ kind: "overdue_successor", stage_key: f.stage_key, stage_label: f.stage_label,
                 required: f.required, after_stage: f.after_stage, predecessor_stage: d.predecessor_stage,
                 predecessor_at: new Date(d.predecessor_ms).toISOString(), within_interval: d.within_interval,
                 deadline: new Date(d.deadline_ms).toISOString(), overdue_by_ms: nowMs - d.deadline_ms,
                 grade: f.grade, grade_determined: f.grade_determined,
                 detail: "the '" + f.stage_key + "' stage is " + f.required + " required and still absent past its '"
                       + d.within_interval + "' deadline after '" + d.predecessor_stage + "' ("
                       + new Date(d.predecessor_ms).toISOString() + " + " + d.within_interval + " = "
                       + new Date(d.deadline_ms).toISOString() + ") -- an overdue successor (framework 8.2,"
                       + " temporal), carrying the instance's grade" });
    }
    return out;
  }

  /* The whole-store overdue scan, at `nowMs`: how many required successors are currently overdue,
     and the EARLIEST FUTURE deadline still ahead (the next instant a not-yet-overdue stage tips
     over). It is the alarm consumer's body AND its wake source -- the alarm arms to next_deadline
     and fires exactly when the record next has something to notice, and self-terminates when there
     is no future deadline left (everything determinable is already overdue, or nothing is
     determinable). It WRITES NOTHING: derive-on-read owns the truth, the scan is only the push
     signal. Bounded by the count of threaded instances, like proposalsFeed's own walk. */
  #overdueScan(nowMs) {
    const pairs = this.#rows(
      `SELECT DISTINCT progression_key, entity_id FROM progression_instances ORDER BY progression_key, entity_id`);
    let overdue = 0, next = null;
    for (const p of pairs) {
      const inst = this.#assembleInstance(p.progression_key, p.entity_id);
      for (const d of this.#instanceDeadlines(inst)) {
        if (d.deadline_ms < nowMs) overdue += 1;                // already past its deadline
        /* a FUTURE deadline (strictly ahead) is the next instant to wake for; the exact-boundary
           instant is neither, so the alarm never re-arms to `now` and spin-fires. */
        else if (d.deadline_ms > nowMs && (next === null || d.deadline_ms < next)) next = d.deadline_ms;
      }
    }
    return { overdue_count: overdue, next_deadline: next,
             next_deadline_at: next === null ? null : new Date(next).toISOString() };
  }

  /* op=proposals (REC-6): the DISCOVERY feed for DERIVED findings. UI-5's proposal surface can
     render, aggregate and act on proposals, but until this op nothing ENUMERATES the record's
     derived findings, so the surface cannot DISCOVER what to show (it ships a gap banner). This
     is the READ side of the FW-9/FW-10 walking-task that was deferred: a read-time walk of every
     progression INSTANCE for its MISSING-PREDECESSOR findings. It does NOT need the scheduled
     alarm (that is the deferred PUSH task); it REPORTS and never mutates — derived things inform.

     The walk: every distinct (progression_key, entity_id) with placements is ONE instance; reuse
     `#assembleInstance` (the SAME derivation op=instance returns) so the feed cannot drift from a
     single-instance read. `#assembleInstance` already respects FW-10 discharges (a discharged
     skip is a "discharged" state, NOT a finding) and stage required-ness (a missing
     sometimes/never stage is not a finding), so a discharged or non-required missing stage never
     enters this feed — the doctrine is enforced at the one derivation point, not re-implemented.

     Two shapes, from the ONE walk, so no caller is forced to reshape and the two cannot disagree:
       - `instances`: the RAW per-instance reads UI-5's loadProposals already consumes
         ({progression_key, progression_label, entity_id, entity_label, findings[]}), so the
         existing surface populates with NO UI change; UI-5's proposalsFrom does its own D-79
         grouping over these (the aggregation stays in the tested UI, exactly as UI-5's delegation
         offered).
       - `proposals`: the SERVER-SIDE D-79 aggregation the kickoff mandates — ONE proposal per
         (progression_key, stage_key) carrying its N instances, the WEAKEST §8.1 grade across them
         (any undetermined instance → the aggregate is undetermined, never guessed), surfaced_by
         `machine`. This is what a thin client (or a future UI-5 pass-through) reads without
         re-deriving, and it is the shape the acceptance suite asserts.
     Only instances that PRODUCE a missing-predecessor finding enter the feed: an instance with no
     gap is not a proposal, and reporting it would be noise about a thing that is fine. Connections
     as a second finding kind are DEFERRED as a follow-on (missing-predecessors only here). */
  proposalsFeed(nowMs) {
    /* REC-8: the INJECTABLE clock the overdue-successor findings are computed against (env
       BIO_NOW_MS, or an explicit op=proposals&now=<ms> as-of instant, else the wall clock), so
       "which required successors are overdue" is deterministic in the suite rather than a function
       of the day the feed is read. */
    const now = this.#nowMs(nowMs);
    /* REC-7 / D-79: DISPOSITION-AWARENESS. A proposal a member has deferred or dismissed
       (op=proposedispose) is AGED — it must not keep reappearing as an OPEN question, and it must
       not silently vanish either (a finding that disappears is indistinguishable from one never
       made). Both halves are kept here: the disposition, keyed by the SAME (progression_key,
       stage_key) the aggregation is keyed by, FILTERS its proposal out of the OPEN feed
       (`instances`/`proposals`) so it stops surfacing as open, and is RETURNED alongside in
       `dispositions` so the decision — its state, reason, who and when — stays on the record.
       Dropping this lookup is REC-7's negative control: with no dispositions read, an aged
       proposal reappears as open. */
    const disposed = new Map();   // (progression_key::stage_key) -> the disposition row
    for (const d of this.#rows(
      `SELECT progression_key, stage_key, state, reason, decided_by, at
         FROM proposal_dispositions`))
      disposed.set(d.progression_key + "::" + d.stage_key, d);
    /* DISTINCT (progression_key, entity_id): the identity of an instance is the pair; a stage
       holds several documents but that is still one instance. Ordered so the feed is stable. */
    const pairs = this.#rows(
      `SELECT DISTINCT progression_key, entity_id FROM progression_instances
         ORDER BY progression_key, entity_id`);
    const instances = [];
    const groups = new Map();   // (progression_key::stage_key) -> aggregated proposal
    for (const p of pairs) {
      const inst = this.#assembleInstance(p.progression_key, p.entity_id);
      /* only the UNDISCHARGED, required missing-predecessor findings #assembleInstance already
         computed — a discharged skip is in `discharges`, not here, and a non-required missing
         stage never fired. A finding whose (progression_key, stage_key) has been disposed is AGED
         OUT of the open feed (it lives on in `dispositions`). An instance with no OPEN finding
         left contributes nothing to the open feed — its aged findings are recorded, not shown. */
      const disp = (sk) => disposed.has(inst.progression_key + "::" + sk);
      const missing = (inst.findings || []).filter(
        (f) => f.kind === "missing_predecessor" && !disp(f.stage_key));
      /* REC-8: the OVERDUE-SUCCESSOR findings for this instance at `now`, a DISTINCT finding kind
         so a consumer tells "never happened" (missing_predecessor) from "not yet, but overdue".
         Every overdue stage is also a missing stage (overdue is computed only over the missing
         findings above), so the same disposition ages both — a member who set the gap aside is not
         re-asked because it later crossed its deadline. */
      const overdueF = this.#overdueFindings(inst, now).filter((f) => !disp(f.stage_key));
      const overdueByStage = new Map(overdueF.map((f) => [f.stage_key, f]));
      /* the instances[] shape carries BOTH kinds (missing first, then overdue) so UI-5's raw
         consumer sees the distinct overdue_successor finding alongside the missing_predecessor one. */
      const findings = [...missing, ...overdueF];
      if (findings.length === 0) continue;
      const entityLabel = inst.entity ? inst.entity.label : null;
      instances.push({
        progression_key: inst.progression_key, progression_label: inst.label,
        entity_id: inst.entity_id, entity_label: entityLabel, findings });
      /* D-79 aggregation stays ONE proposal per (progression_key, stage_key) — overdue does NOT
         split a stage into two proposals (that would drown, and would break the disposition key
         which is (progression, stage), kind-agnostic). Instead the proposal is ANNOTATED overdue,
         and each instance entry says whether IT is overdue and by when. Iterate the missing
         findings (one per stage), annotating from overdueByStage — every overdue stage has a
         missing counterpart, so nothing is missed. */
      for (const f of missing) {
        const key = inst.progression_key + "::" + f.stage_key;
        let g = groups.get(key);
        if (!g) {
          g = { key, progression_key: inst.progression_key, progression_label: inst.label,
                stage_key: f.stage_key, stage_label: f.stage_label, required: f.required,
                surfaced_by: "machine", overdue_count: 0, instances: [] };
          groups.set(key, g);
        }
        const od = overdueByStage.get(f.stage_key) || null;
        if (od) g.overdue_count += 1;
        /* the finding's grade is the instance's grade (the weakest connection along its chain),
           or "undetermined" when the instance has fewer than two placed stages — never invented. */
        g.instances.push({ entity_id: inst.entity_id, entity_label: entityLabel,
          progression_key: inst.progression_key,
          grade: f.grade_determined ? f.grade : null, grade_determined: f.grade_determined === true,
          overdue: !!od, deadline: od ? od.deadline : null });
      }
    }
    /* D-79: ONE proposal per (progression_key, stage_key) carrying its N instances, graded the
       WEAKEST §8.1 grade across them (a case is only as strong as its weakest link). ANY
       undetermined instance makes the aggregate undetermined — undetermined is first-class and
       is STATED, never averaged away into a determined grade. */
    const proposals = [];
    for (const g of groups.values()) {
      g.n = g.instances.length;
      const anyUndetermined = g.instances.some((i) => !i.grade_determined || !i.grade);
      g.grade_determined = !anyUndetermined;
      g.grade = anyUndetermined
        ? null
        : g.instances.map((i) => i.grade).reduce((a, b) => Store.#weakerGrade(a, b));
      /* REC-8: the temporal escalation on the proposal — `overdue` true when ANY of its instances
         is past its within_interval deadline, `overdue_count` how many, and `kinds` the distinct
         finding kinds this proposal aggregates (a consumer sorts/badges the overdue ones without
         re-deriving the clock). A proposal with no overdue instance carries the same missing-only
         shape as before. */
      g.overdue = g.overdue_count > 0;
      g.kinds = g.overdue ? ["missing_predecessor", "overdue_successor"] : ["missing_predecessor"];
      proposals.push(g);
    }
    /* biggest pattern first — the DROWNING failure D-79 names is showing many small findings as
       many items, so the widest question leads. Stable tiebreak on the aggregation key. */
    proposals.sort((a, b) => b.n - a.n || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    /* the aged decisions, on the record (D-79 age-not-vanish). Every recorded disposition, so a
       member (or UI-5) can see WHICH questions were deferred/dismissed, by whom, why and when —
       independent of whether the underlying gap still fires, because the decision stands until it
       is re-triaged. Stable order, widest identity first is meaningless here so ordered by key. */
    const dispositions = [...disposed.values()]
      .map((d) => ({ key: d.progression_key + "::" + d.stage_key,
                     progression_key: d.progression_key, stage_key: d.stage_key,
                     state: d.state, reason: d.reason, decided_by: d.decided_by, at: d.at }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return { ok: true, instances, proposals, dispositions,
             instance_count: instances.length, proposal_count: proposals.length,
             disposition_count: dispositions.length };
  }

  /* op=captureprogressions (REC-9): map a CAPTURE back to the progression INSTANCES it sits in —
     the per-document lookup UI-9's document page needs (its items 3–4) and no existing op answers:
     op=instance needs BOTH (progression_key, entity_id), and op=proposals walks every instance but
     carries no capture_sha to tie a finding to THIS document. READ-ONLY and DERIVE-ON-READ — no
     table, because an instance's findings go stale if stored (FW-9's own reasoning) — so the findings
     are recomputed here at the ONE derivation point, exactly as proposalsFeed recomputes them, never
     re-implemented.

     The walk: the DISTINCT (progression_key, entity_id, stage_key) placements of THIS capture, by
     JOINING `progression_instances` on capture_sha — a capture may be placed at a stage in several
     instances, so several rows. Each (progression_key, entity_id) instance is assembled ONCE via
     `#assembleInstance` (its instance grade + missing_predecessor findings, FW-10 discharge doctrine
     and stage required-ness enforced THERE), and its overdue_successor findings come from REC-8's
     `#overdueFindings` against the injectable clock (`now` as-of / BIO_NOW_MS / wall — the same seam
     op=proposals opened, so overdue is deterministic in a suite). Both kinds are returned (missing
     first, then overdue) exactly as proposalsFeed's instances[] shape carries them. The CAPTURE's own
     stage in each instance is reported from its placement row; its label is read from the assembled
     stages. A capture threaded into NOTHING returns an empty list, honestly — never a fabricated
     membership. established/needs_confirmation are PROJECTED from each finding's already-derived grade
     (the same boundary projection #resolutionView / connectionsFor make — #isEstablished, grade==="C"),
     NOT a new claim: an undetermined finding stays undetermined (established false, never invented). */
  captureProgressions({ captureSha, nowMs } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA",
               detail: "progression membership is read for a captured document, by its capture sha256 (op=captureprogressions&sha256=...)" };
    const now = this.#nowMs(nowMs);
    /* the placements of THIS capture: which (progression, entity) instance, and at which stage. A
       capture in NO progression yields no rows -> an empty list, never a guessed membership. */
    const rows = this.#rows(
      `SELECT DISTINCT progression_key, entity_id, stage_key FROM progression_instances
         WHERE capture_sha=? ORDER BY progression_key, entity_id, stage_key`, captureSha);
    const assembled = new Map();   // progression::entity -> { inst, overdue }: assemble each instance ONCE
    /* project a finding's already-derived grade into its two display booleans, the SAME boundary
       projection #resolutionView makes — never a new determination. undetermined -> not established. */
    const project = (f) => ({ ...f,
      established: f.grade_determined === true && Store.#isEstablished(f.grade),
      needs_confirmation: f.grade === "C" });
    const instances = [];
    for (const r of rows) {
      const ck = r.progression_key + "::" + r.entity_id;
      let a = assembled.get(ck);
      if (!a) {
        const inst = this.#assembleInstance(r.progression_key, r.entity_id);
        a = { inst, overdue: (inst && inst.found) ? this.#overdueFindings(inst, now) : [] };
        assembled.set(ck, a);
      }
      const inst = a.inst;
      if (!inst || !inst.found) continue;   // definition gone, or nothing threaded -> not a membership
      const stage = (inst.stages || []).find((s) => s.stage_key === r.stage_key);
      const missing = (inst.findings || []).filter((f) => f.kind === "missing_predecessor");
      const findings = [...missing, ...a.overdue].map(project);
      instances.push({
        progression_key: inst.progression_key, progression_label: inst.label,
        entity_id: inst.entity_id, entity_label: inst.entity ? inst.entity.label : null,
        stage_key: r.stage_key, stage_label: stage ? stage.label : r.stage_key,
        findings });
    }
    return { ok: true, capture_sha: captureSha, count: instances.length, instances };
  }

  /* ========================= REC-20 · op=queue ==============================
   *
   * ONE read, ONE contract, over the two producers that already exist: an
   * OBLIGATION is a row in `tasks` (D-98's routed work) and a FINDING is an
   * aggregated proposal from `proposalsFeed` (D-79's derived question). Before
   * this op a member had to open two surfaces and reconcile them by eye, and
   * neither could say WHICH CASE a thing belonged to. D-140 and SB-CORE
   * GAP-Q1/GAP-Q3; the queue is the one surface every member opens by habit.
   *
   * THE LOAD-BEARING SHAPE, and it is DEC-16 (Bob, 2026-08-02, answering his
   * own DEC-10): **the unit of state is the EVENT, not the (member, case)
   * entry — one state, N homes.** `case` is populated with EVERY ANCESTOR over
   * a bounded walk of the basis/citation edges, so a fact about a document
   * reaches everyone standing on it; and because the state lives on the event,
   * an event appearing under several cases does NOT create several entries, so
   * DEC-10's "one standing entry per (member, case)" survives intact and one
   * resolution clears the item everywhere.
   *
   * NO NEW TABLE, AND THAT IS A FINDING RATHER THAN A SHORTCUT. DEC-16's shape
   * asks for state that is keyed by the event. Both producers ALREADY key it
   * that way: `tasks.status` lives on the task row (the event), and
   * `proposal_dispositions` is keyed by (progression_key, stage_key) — the
   * proposal's own identity — never by who read it or under which case. So the
   * carrier exists, the homes are DERIVED on read from the edges, and nothing
   * is stored that could go stale. (REC-21's `queue_state` is the PERSONAL
   * half — mute and snooze — and is deliberately a different table with a
   * different doctrine: muting is personal, resolving is a record act.)
   *
   * THE VIEWER POSTURE. This is a read that names bundle ids, so it takes the
   * D-15 gate through query.mjs's ONE compilation point exactly as REC-25
   * stamped the other reads. An ancestor the caller may not see is NOT named,
   * and its absence is STATED rather than silently shortening the set — the
   * same honesty DEC-16 requires of an exhausted walk, for the same reason: a
   * quietly truncated home set is indistinguishable from nobody caring.
   *
   * CONDITION IS DEFERRED, DECLARED, AND NOT STUBBED (HOLE-1). The class has no
   * carrier and no producer in this plane; inventing one here would build the
   * second half of a bridge. It is named in QUEUE_CLASSES_DEFERRED so the
   * deferral is structural and a later item cannot forget it existed.
   * ======================================================================== */

  /** The classes this producer EMITS. `class` is NOT NULL on the producer:
   *  queueFeed refuses to answer rather than hand a surface a classless item,
   *  which is the shape a `class TEXT NOT NULL` column would enforce if the
   *  feed were a table. It is not a table — it is derived on read — so the
   *  constraint is enforced here, at the one place items are minted. */
  static QUEUE_CLASSES = ["OBLIGATION", "FINDING"];
  /** Declared, not stubbed. A class with no producer is named with the reason
   *  it is absent, so "not built yet" is distinguishable from "forgotten". */
  static QUEUE_CLASSES_DEFERRED = {
    CONDITION: "HOLE-1: the CONDITION class has no carrier and no producer in this plane "
             + "(NOTIFICATIONS.md scopes mute and acknowledge to it, and REC-21 owns that half). "
             + "Emitting a stub would build the second half of a bridge, so it is declared absent.",
  };
  /** R3's depth bound, applied to the ancestor walk. The basis graph is a DAG
   *  enforced at write (REC-11), so a walk terminates by construction — but
   *  "terminates" is not "terminates inside a Durable Object's CPU budget",
   *  and R3 requires derivation to carry a bound whose EXHAUSTION is reported
   *  as `undetermined` rather than as a failure or as a silent truncation.
   *  Six: deep enough that a real chain of questions resting on questions is
   *  covered whole (the corpus's own worked example is three), shallow enough
   *  that a pathological chain reports undetermined instead of burning the
   *  read. REC-12's read-time derivation takes THIS constant when it lands, so
   *  the record has one bound and not two. */
  static QUEUE_ANCESTOR_DEPTH = 6;
  /** Which object types can BE a case — the grouping key is a bundle id and it
   *  is an inquiry or a project, never a document. Consulted through
   *  normalizeType (REC-10's MAP RULE) so a legacy `focus`/`problem` spelling
   *  groups identically to a canonical `inquiry` one. */
  static QUEUE_CASE_TYPES = ["inquiry", "project"];
  /** How many subject bundles one FINDING derives its options from. An
   *  aggregated proposal spans N instances and therefore N documents; deriving
   *  acts over all of them would make one queue read O(corpus). */
  static QUEUE_OPTION_SUBJECTS_MAX = 8;

  /** One step UP the graph from a node: the edges an ancestor is reached by.
   *
   *  TWO edge kinds, because a case reaches a document two ways. `inquiry_basis`
   *  (REC-11) carries "this inquiry RESTS ON that target", indexed on target_id
   *  — the reverse index restingOn() already reads. `refs` with rel `cites`
   *  carries "this bundle CITES that target", which is how a project holds the
   *  documents and questions it is working on. Both are read at their target
   *  index, so a step is two indexed lookups and not a scan. */
  #queueAncestorEdges(nodeId) {
    const up = new Set();
    for (const r of this.#rows(
      `SELECT DISTINCT bundle_id FROM inquiry_basis WHERE target_id=?`, nodeId))
      up.add(r.bundle_id);
    for (const r of this.#rows(
      `SELECT DISTINCT bundle_id FROM refs WHERE target_id=? AND kind='cites'`, nodeId))
      up.add(r.bundle_id);
    return [...up].sort();
  }

  /** DEC-16's EVERY-ANCESTOR walk, bounded, viewer-gated, and honest about both
   *  ways it can come back incomplete.
   *
   *  Returns the SET of homes for one event, given the subject(s) the event is
   *  about. Breadth-first so `depth` means what it says; a `seen` set makes the
   *  walk cost linear in the edges actually reachable and makes a diamond
   *  (two questions resting on one document, both under one project) cost one
   *  visit rather than two.
   *
   *  WHAT IS AND IS NOT A HOME. The walk passes THROUGH every node it reaches
   *  but only ADMITS the case types (QUEUE_CASE_TYPES, via normalizeType) as
   *  homes: an information bundle that happens to cite another document is a
   *  waypoint, not a group header. Passing through it is deliberate — a
   *  question reachable only through a document is still a question that rests
   *  on the subject.
   *
   *  TWO WAYS TO COME BACK UNDETERMINED, both STATED and neither silent:
   *    - `depth_bound`: the frontier was still non-empty at the bound (R3).
   *    - `out_of_view`: an ancestor exists that this viewer may not see (D-15
   *      §7.9 filters PROJECT bundles). The id, the title, the state and even
   *      the COUNT are withheld — the count is the leak — but the FACT that the
   *      set is incomplete is reported, because a silently shorter set is
   *      exactly the "indistinguishable from nobody caring" failure DEC-16's
   *      truncation rule is about. The walk still passes THROUGH an invisible
   *      node: reaching a VISIBLE ancestor by way of an invisible one discloses
   *      nothing about the invisible one.
   *
   *  An EMPTY set with no reasons is UNGROUPED, and that is a real answer: an
   *  item nothing rests on sits ungrouped and is never given an invented home. */
  #queueAncestors(subjectIds, viewer) {
    const bound = Store.QUEUE_ANCESTOR_DEPTH;
    /* D-15 through the ONE compilation point. Fail closed: an absent or
       unrecognised viewer compiles to the deny predicate, so a caller that
       reached here without an identity groups under nothing rather than
       under everything. */
    const gate = viewerPredicate(viewer);
    const seen = new Set((subjectIds || []).filter((x) => typeof x === "string" && x));
    const found = new Map();
    const reasons = new Set();
    let frontier = [...seen];
    let depth = 0;
    while (frontier.length > 0 && depth < bound) {
      depth += 1;
      const next = [];
      for (const node of frontier) {
        for (const up of this.#queueAncestorEdges(node)) {
          if (seen.has(up)) continue;
          seen.add(up);
          next.push(up);
          const row = this.#one(
            `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
             WHERE b.bundle_id=? AND (${gate.sql})`, up, ...gate.args);
          if (!row) {
            /* Absent and invisible are indistinguishable TO THE CALLER (REC-25),
               but they are not the same fact and this producer must not report
               the wrong one: an edge whose target was purged is not an ancestor
               being withheld. The existence probe is internal — the store is a
               legitimate whole-corpus reader — and its answer never leaves this
               method except as the single word `out_of_view`. */
            if (this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, up))
              reasons.add("out_of_view");
            continue;
          }
          /* MAP RULE (REC-10, and REC-13's seam): every type and state
             consultation goes through the catalog's own vocabulary machinery,
             never a raw key — so a legacy `focus`/`problem` document groups
             exactly as a canonical `inquiry` one does. */
          const ty = normalizeType(row.object_type);
          if (!Store.QUEUE_CASE_TYPES.includes(ty)) continue;   // a waypoint, not a home
          const spec = vocabFor(STATES, row.object_type);
          const edges = spec && spec.edges ? spec.edges : null;
          /* Is this case CLOSED? Three-valued on purpose: a state the machine
             does not name is UNDETERMINED, not terminal. DEC-16's own reasoning
             turns on whether an ancestor has been concluded, so a surface must
             be able to tell "no way out" from "we do not know". */
          const terminal = edges && Object.prototype.hasOwnProperty.call(edges, row.current_state)
            ? edges[row.current_state].length === 0 : null;
          found.set(row.bundle_id, {
            id: row.bundle_id, type: ty, title: row.title ?? null,
            state: row.current_state ?? null, terminal, depth });
        }
      }
      frontier = next;
    }
    /* EXHAUSTION IS REPORTED EXACTLY, not eagerly. Stopping with a non-empty
       frontier is not by itself a truncation: the last layer may simply have
       nothing above it, and reporting `undetermined` there would claim we do
       not know something we do. So the bound reports itself only when a node we
       never expanded genuinely HAS an unvisited ancestor — one extra indexed
       lookup per remaining node, and the difference between an honest
       undetermined and a reflexive one. */
    if (frontier.length > 0
        && frontier.some((n) => this.#queueAncestorEdges(n).some((u) => !seen.has(u))))
      reasons.add("depth_bound");
    const ancestors = [...found.values()]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const state = reasons.size > 0 ? "undetermined" : "determined";
    return { state, ungrouped: state === "determined" && ancestors.length === 0,
             reasons: [...reasons].sort(), depth_bound: bound, ancestors };
  }

  /** DEC-16's event-state gate, asked of the EVENT and of nothing else.
   *
   *  A task's status IS the event's state: it lives on the task row, which is
   *  the event, and not on any (member, case) pairing. That is why one
   *  resolution clears the item under every ancestor without a second
   *  mechanism, and it is what the item's negative control breaks. */
  #queueEventLive(task) {
    return task && task.status !== "resolved";
  }

  /** The options a member may act on, DERIVED — never a copy, never invented.
   *
   *  REC-19 owns "what may be DONE to an object": ACTS + deriveActs over the
   *  store's own affordanceFacts, which is itself viewer-gated. This method
   *  calls THAT derivation and projects the three fields that survive the DO
   *  boundary; the control plane decorates them with `needs`, `mode` and
   *  `rung` from NEEDS/SESSION_OPS/RUNGS through the SAME function op=affordances
   *  uses, so a queue item's options and an affordances answer for the same
   *  subject and the same viewer are identical by construction rather than by
   *  agreement. A subject the viewer cannot see contributes nothing, and an
   *  empty list is the honest answer (REC-19's own posture for an `action`
   *  bundle: nothing operates it, so nothing is published).
   *
   *  Union order is ACTS order, preserved: a single-subject item's options are
   *  byte-for-byte op=affordances' `acts`. */
  #queueOptions(subjectIds, viewer) {
    const byId = new Map();
    for (const id of (subjectIds || []).slice(0, Store.QUEUE_OPTION_SUBJECTS_MAX)) {
      const facts = this.affordanceFacts({ target: id, viewer });
      if (!facts || facts.ok !== true) continue;
      for (const a of deriveActs(facts))
        if (!byId.has(a.id)) byId.set(a.id, { id: a.id, label: a.label, weight: a.weight });
    }
    return [...byId.values()];
  }

  /** op=queue: the member's ONE feed.
   *
   *  `member` and `viewer` are BOTH stamped server-side at index.mjs and are
   *  never taken from the caller — whose queue this is, and whose view its
   *  case names are compiled for, are server decisions or they are not
   *  decisions at all.
   *
   *  WHOSE OBLIGATIONS. Tasks assigned to the caller, PLUS tasks honestly
   *  `unassigned`. D-98 intends an unassigned task to stay claimable and
   *  routable by hand, and DEC-7 keeps it claimable rather than stranded, so
   *  hiding it from every queue would strand exactly the work routing could
   *  find nobody for. A machine credential has no member behind it and gets
   *  the whole live set, which is the operator view the token exists for.
   *
   *  `refers_to` POINTS AT THE SUBJECT, NOT AT THE CASE. They are different
   *  columns and the contract carries both: `subject` is what the item is
   *  about, `case` is where it is filed. Collapsing them is how a queue
   *  invents a home. */
  queueFeed({ member = null, viewer = null, nowMs = null, limit = 200 } = {}) {
    const cap = Math.max(1, Math.min(500, Math.floor(Number(limit) || 200)));
    const now = this.#nowMs(nowMs);
    const me = typeof member === "string" && member.trim() ? member.trim() : null;
    const items = [];

    /* ---------------------------------------------------- OBLIGATION · tasks
       REC-30: the CASE set was gated from birth (#queueAncestors) but the
       SUBJECT was not, and an obligation's subject is a bundle id — with the
       task's `subject_text` beside it. An item about a bundle this viewer may
       not see is withheld whole, the same posture op=tasks now takes: an
       obligation nobody may be told about is not an obligation this feed can
       carry, and a routed task on an invisible project reaches its assignee,
       who by construction can see it. Withheld silently and with no count, for
       the reason `mute` states its own suppressions and this cannot: a count
       here would say a project exists. */
    const taskSeen = this.#bundleGate("tk.refers_to", viewer);
    for (const row of this.#rows(
      `SELECT tk.* FROM tasks tk WHERE (${taskSeen.sql}) ORDER BY tk.created DESC, tk.id LIMIT ?`,
      ...taskSeen.args, cap * 2)) {
      if (me && row.assignee !== me && row.assignee !== "unassigned") continue;
      const subject = row.refers_to;
      /* The homes are derived FIRST and the event's state is asked ONCE, for
         all of them. This ordering is the whole of DEC-16 in two lines: one
         state, N homes.
         NEGATIVE CONTROL (REC-20): replace the single event-keyed test below
         with a per-(member, case) one — keep the item alive under every home
         except the first, as a queue_state row keyed by (member, case) would —
         and a resolved event with two ancestors leaves a stale unresolved copy
         under the second. */
      const homes = this.#queueAncestors([subject], viewer);
      if (!this.#queueEventLive(row)) continue;
      const createdMs = Date.parse(row.created);
      items.push({
        id: row.id,
        class: "OBLIGATION",
        kind: row.kind,
        case: homes,
        subject: { kind: "bundle", id: subject },
        summary: row.subject_text,
        detail: row.subject_desc ?? null,
        basis: { source: "tasks", refers_to: subject, routed_role: row.assignee_role,
                 status: row.status,
                 detail: "an obligation is a routed task: a named person must act for the record "
                       + "to proceed (D-98). refers_to points at the SUBJECT; case is derived." },
        age: Number.isFinite(createdMs)
          ? { state: "determined", since: row.created, ms: Math.max(0, now - createdMs) }
          : { state: "undetermined", reason: "unparseable_created",
              detail: "the task row carries a created stamp this producer cannot read as an instant" },
        assignee: row.assignee,
        assignee_role: row.assignee_role,
        options: this.#queueOptions([subject], viewer),
      });
    }

    /* --------------------------------------- FINDING · the proposals feed
       proposalsFeed is the ONE derivation (REC-6/7/8) and is read whole rather
       than re-implemented, so the queue and op=proposals cannot disagree about
       what is open. It has ALREADY aged out every disposed proposal, and its
       disposition key is (progression_key, stage_key) — the proposal's own
       identity, the EVENT — never (member, case). So the FINDING half inherits
       DEC-16's shape from the producer rather than needing a gate here: one
       op=proposedispose clears the finding under every case it appears in. */
    const feed = this.proposalsFeed(nowMs);
    /* REC-30: the FINDING's subject bundles are read straight out of
       progression_instances and were published unfiltered — a project whose
       document is threaded into a progression named itself here. The FINDING
       itself stands for every member: it is the RECORD's own question about a
       progression stage, derived from the whole corpus, and it must not change
       shape with the reader. What is withheld is which BUNDLES sit behind it —
       and, with them, the acts offered on those bundles, since #queueOptions
       and #queueAncestors both take the viewer and would answer nothing for
       them anyway. */
    const findingSeen = this.#bundleGate("pi.bundle_id", viewer);
    for (const p of feed.proposals) {
      const subjects = [];
      for (const inst of p.instances)
        for (const r of this.#rows(
          `SELECT DISTINCT pi.bundle_id FROM progression_instances pi
            WHERE pi.progression_key=? AND pi.entity_id=? AND (${findingSeen.sql})
            ORDER BY pi.bundle_id`,
          p.progression_key, inst.entity_id, ...findingSeen.args))
          if (!subjects.includes(r.bundle_id)) subjects.push(r.bundle_id);
      items.push({
        id: `FINDING::${p.key}`,
        class: "FINDING",
        /* The ESCALATED kind leads when the stage has also crossed a deadline —
           one kind, as the contract has one column, with the full set on the
           basis so nothing is lost. */
        kind: p.overdue ? "overdue_successor" : "missing_predecessor",
        case: this.#queueAncestors(subjects, viewer),
        subject: { kind: "progression_stage", id: null,
                   progression_key: p.progression_key, stage_key: p.stage_key,
                   bundles: subjects.slice(0, Store.QUEUE_OPTION_SUBJECTS_MAX) },
        summary: `${p.progression_label}: the '${p.stage_label}' stage is ${p.required} required and absent`,
        detail: `${p.n} instance${p.n === 1 ? "" : "s"} of this progression reach${p.n === 1 ? "es" : ""} `
              + `'${p.stage_label}' without it` + (p.overdue ? `, ${p.overdue_count} past a declared deadline` : ""),
        basis: { source: "proposalsFeed", progression_key: p.progression_key, stage_key: p.stage_key,
                 kinds: p.kinds, n: p.n, grade: p.grade, grade_determined: p.grade_determined,
                 overdue_count: p.overdue_count, surfaced_by: p.surfaced_by,
                 detail: "a finding is DERIVED (D-79): the record's own question, aggregated one per "
                       + "(progression, stage), graded the weakest instance and never averaged." },
        /* A derived finding is recomputed on every read and has no creation
           instant to age from. Undetermined, and STATED rather than filled in
           with the read's own clock — which would age every finding to zero. */
        age: { state: "undetermined", reason: "derived_on_read",
               detail: "a derived finding is recomputed at read time and has no creation instant; "
                     + "the temporal signal it does carry is overdue_count on the basis" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions(subjects, viewer),
      });
    }

    /* ------------------------------------------- REC-21 · the PERSONAL half
       ONE admission point, consulted for EVERY item whatever its class, over
       queuestate.mjs's pure decision. The class fence is at the WRITE (queueMute
       refuses anything that is not a CONDITION kind), so a kind present in
       muted_kinds already means "a condition this member muted" and the read
       asks only about membership. That is deliberate and it is what makes the
       rule's failure observable: negative control (b) removes the write fence,
       a real OBLIGATION kind enters the column, and a real obligation genuinely
       disappears from a real feed — which is exactly the harm the doctrine
       names, demonstrated rather than asserted.
       A mute is PERSONAL, so an anonymous or machine caller (no member) has no
       mutes and sees the whole live set: #queueMutes returns an empty map and
       this loop suppresses nothing. */
    const mutes = this.#queueMutes(me);
    const suppressed = [];
    const admitted = [];
    for (const it of items) {
      const by = suppressedBy(it, mutes);
      if (by === null) { admitted.push(it); continue; }
      suppressed.push({ id: it.id, class: it.class, kind: it.kind, case: by });
    }
    items.length = 0;
    items.push(...admitted);

    /* `class` NOT NULL on the producer. The feed is derived, not stored, so
       the constraint a column would carry is enforced here, at the one place
       an item is minted — and it REFUSES rather than emitting a classless item,
       because a surface that receives one has no honest way to render it. */
    for (const it of items)
      if (!Store.QUEUE_CLASSES.includes(it.class))
        return { ok: false, reason: "NO_CLASS", id: it.id ?? null,
                 detail: "every queue item carries a class from " + Store.QUEUE_CLASSES.join(" | ")
                       + "; this producer refuses to emit one that does not" };

    /* Obligations first — something a named person must do outranks something
       the record noticed — then stable on id so the feed does not shuffle. */
    const rank = (c) => Store.QUEUE_CLASSES.indexOf(c);
    items.sort((a, b) => rank(a.class) - rank(b.class)
      || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const out = items.slice(0, cap);
    return {
      ok: true, member: me, items: out,
      item_count: out.length, truncated: items.length > out.length,
      classes: Store.QUEUE_CLASSES,
      classes_deferred: Store.QUEUE_CLASSES_DEFERRED,
      ancestor_depth_bound: Store.QUEUE_ANCESTOR_DEPTH,
      /* REC-21. What this member has chosen not to be told about, REPORTED
         rather than silently applied — the same rule the ancestor walk obeys
         and for the same reason: a feed that is quietly shorter is
         indistinguishable from nobody caring. A surface renders "you muted 2
         condition kinds on this case" from this block; nothing is hidden from
         the member who did the hiding. `personal: true` is stated because the
         one thing a reader must never conclude from a mute is that the record
         changed. */
      mute: {
        personal: true,
        cases: [...mutes.keys()].sort(),
        suppressed,
        suppressed_count: suppressed.length,
        detail: "muting is PERSONAL and dismissing is a RECORD ACT (D-125). Nothing here was removed "
              + "from the record, nothing here left another member's queue, and only CONDITION kinds "
              + "can be here: an OBLIGATION leaves every list when it is RESOLVED and a FINDING when "
              + "it is dismissed, both of which are acts the record keeps.",
      },
      counts: {
        obligation: out.filter((i) => i.class === "OBLIGATION").length,
        finding: out.filter((i) => i.class === "FINDING").length,
        ungrouped: out.filter((i) => i.case.ungrouped).length,
        case_undetermined: out.filter((i) => i.case.state === "undetermined").length,
        suppressed: suppressed.length,
      },
    };
  }

  /* ========================================================================
   *  REC-21 · queue_state — the PERSONAL half, and the boundary it defends.
   *
   *  THE TWO OPS BELOW WRITE TO ONE TABLE AND TO NOTHING ELSE. Not `tasks`, not
   *  `proposal_dispositions`, and no bundle is minted. That is the discipline
   *  op=proposedispose established from the other side — declining is not
   *  authoring, so it writes a disposition rather than a document — carried one
   *  step further: a preference is not even a disposition. A disposition is
   *  ATTRIBUTED and DATED and stays in the case's history because the group is
   *  entitled to know its question was set aside and by whom. A mute is
   *  addressed to nobody, changes nothing about the record, and the group is
   *  entitled to know nothing about it.
   *
   *  WHY DEC-16 RAISES THE STAKES. Under shared resolution one member's act
   *  clears every other member's queue. That is right for a RESOLUTION — the
   *  City replacing a page is one fact about the world and anyone standing on
   *  it can settle it for everyone — and it is exactly why the personal half
   *  must not be able to reach the same lever. If mute and dismiss were one
   *  control, one member's inbox hygiene would clear the group's question, and
   *  a silent disappearance would be indistinguishable from a bug.
   *
   *  AND THE OTHER HALF OF DEC-16'S SAFEGUARD NEEDS NO CODE HERE, which is
   *  worth stating so nobody later builds it: an act that CHANGES the record is
   *  ITSELF AN EVENT, and it propagates by the same every-ancestor rule as any
   *  other. Resolving by LOOKING and finding nothing changed correctly clears
   *  the item for everyone; resolving by CHANGING something raises a new event
   *  that reaches every ancestor entry — including the entry of a member who
   *  muted conditions on that case, because the new event is an OBLIGATION and
   *  a mute cannot reach one. That is the ordinary consequence loop, not a
   *  mechanism, and the suite asserts it end to end rather than trusting it.
   * ======================================================================== */

  /** This member's mute rows, as the pure decision wants them: a Map
   *  case_id -> Set(kind). A caller with no member (a machine credential, an
   *  unauthenticated probe) has no personal state and gets an empty map, so the
   *  operator view is the whole live set — the same carve-out D-15 makes for a
   *  machine viewer, for the same reason: there is no person whose preferences
   *  these could be. */
  #queueMutes(member) {
    const out = new Map();
    if (typeof member !== "string" || !member.trim()) return out;
    for (const r of this.#rows(
      `SELECT case_id, muted_kinds FROM queue_state WHERE member_id=?`, member.trim())) {
      const kinds = parseMutedKinds(r.muted_kinds);
      if (kinds.length > 0) out.set(r.case_id, new Set(kinds));
    }
    return out;
  }

  /** The case a personal preference may be attached to, resolved through the
   *  catalog's OWN machinery and gated by the viewer.
   *
   *  MAP RULE (REC-10/REC-13). `normalizeType` decides whether the bundle is a
   *  CASE at all, so a legacy `focus`/`problem` document is mutable exactly as a
   *  canonical `inquiry` one is, and `vocabFor` reads its state through the
   *  machine that document was authored under. A raw `object_type === "inquiry"`
   *  here would silently refuse every legacy question.
   *
   *  D-15 through the ONE compilation point: a case this viewer cannot see
   *  answers identically to one that does not exist, so a mute cannot be used to
   *  probe for the existence of a project nobody invited you to. */
  #queueCaseFor(caseId, viewer) {
    const id = typeof caseId === "string" ? caseId.trim() : "";
    if (!id) return { ok: false, reason: "NO_CASE",
                      detail: "a personal preference is keyed (member, case); name the case it is about" };
    const gate = viewerPredicate(viewer);
    /* `FROM bundles b` and not `FROM bundles`: viewerPredicate compiles a
       predicate over the alias `b`, which is the shape every other gated read in
       this file passes it. */
    const row = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
        WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
    if (!row) return { ok: false, reason: "NO_SUCH_CASE", case: id,
      detail: "no case by that id is visible to you. A case you may not see and a case that does not "
            + "exist answer identically here (D-15), so this refusal reveals nothing either way." };
    const ty = normalizeType(row.object_type);
    if (!Store.QUEUE_CASE_TYPES.includes(ty))
      return { ok: false, reason: "NOT_A_CASE", case: id, object_type: ty,
        detail: "a queue entry is filed under a CASE — an inquiry or a project — and personal state is "
              + "keyed to that. A document is a SUBJECT, not a home: muting one would be muting every "
              + "question that rests on it, for reasons none of those questions' owners could see." };
    const spec = vocabFor(STATES, row.object_type);
    return { ok: true, id: row.bundle_id, type: ty, title: row.title ?? null,
             state: row.current_state ?? null,
             known_state: !!(spec && spec.edges
               && Object.prototype.hasOwnProperty.call(spec.edges, row.current_state)) };
  }

  /** op=queuemute — mute CONDITION kinds on one case, for one member.
   *
   *  `member` is stamped server-side at index.mjs and is never taken from the
   *  caller: a caller who could name the member could mute somebody else's
   *  attention, which is the one thing a personal preference must not permit.
   *
   *  THE FENCE. Every named kind must be a CONDITION kind. A kind that is an
   *  OBLIGATION or a FINDING is refused with the kind, its ACTUAL class, and the
   *  act that DOES clear it, because a refusal that only says no is the kind of
   *  gate that pressures a member into finding a way around it. A kind the
   *  catalogue does not name at all is refused separately: unknown is not the
   *  same as wrong.
   *
   *  It refuses an EMPTY set too. "Mute this case" with no kinds is the delete
   *  button the doctrine forbids, and accepting it as a no-op would leave a
   *  member believing they had silenced something they had not. */
  queueMute({ member = null, case: caseId = null, kinds = null, unmute = false,
              viewer = null, at = null } = {}) {
    const me = typeof member === "string" ? member.trim() : "";
    if (!me) return { ok: false, reason: "NO_MEMBER",
      detail: "a mute is PERSONAL: it is keyed to the member whose attention it is about, and a machine "
            + "credential has no member behind it. There is no instance-wide mute and there must not be." };
    const c = this.#queueCaseFor(caseId, viewer);
    if (c.ok !== true) return c;
    const named = Array.isArray(kinds) ? kinds.map((k) => (typeof k === "string" ? k.trim() : "")).filter(Boolean) : [];
    if (named.length === 0)
      return { ok: false, reason: "NO_KINDS", case: c.id,
        detail: "name the CONDITION kinds to mute. A mute is scoped to the kinds present when it was "
              + "made — that is what lets a NEW kind on this case still reach you — so there is no "
              + "whole-case mute to ask for.",
        available: Object.keys(QUEUE_CONDITION_KINDS) };
    for (const k of named) {
      if (k.includes(","))
        return { ok: false, reason: "BAD_KIND", kind: k, case: c.id,
          detail: "a kind is a slug and may not contain a comma; the stored set is comma-separated" };
      const cls = classOfKind(k);
      if (cls === null)
        return { ok: false, reason: "UNKNOWN_KIND", kind: k, case: c.id,
          detail: "the notification catalogue does not name that kind. Unknown is not the same as "
                + "forbidden, and this refusal is the first rather than the second.",
          available: Object.keys(QUEUE_CONDITION_KINDS) };
      if (cls !== "CONDITION")
        return { ok: false, reason: "KIND_NOT_PERSONAL", kind: k, kind_class: cls, case: c.id,
          detail: MUTE_REFUSAL_DETAIL[cls],
          available: Object.keys(QUEUE_CONDITION_KINDS) };
    }
    const stamp = typeof at === "string" && at ? at : new Date(this.#nowMs(null)).toISOString();
    const row = this.#one(
      `SELECT muted_kinds, snoozed_until FROM queue_state WHERE member_id=? AND case_id=?`, me, c.id);
    const had = parseMutedKinds(row ? row.muted_kinds : "");
    /* UNION on repeat, DIFFERENCE on unmute. Union rather than replace because
       a second mute is a member muting MORE, not restating everything they ever
       muted — and because replace would silently un-mute a kind the surface did
       not happen to re-send. */
    const next = unmute ? had.filter((k) => !named.includes(k))
                        : [...new Set([...had, ...named])];
    const text = serializeMutedKinds(next);
    this.sql.exec(
      `INSERT INTO queue_state (member_id, case_id, muted_kinds, snoozed_until, last_seen)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(member_id, case_id) DO UPDATE SET muted_kinds=excluded.muted_kinds,
                                                     last_seen=excluded.last_seen`,
      me, c.id, text, row ? row.snoozed_until ?? null : null, stamp);
    return {
      ok: true, member: me, case: c.id, case_type: c.type, case_title: c.title,
      muted_kinds: parseMutedKinds(text), added: unmute ? [] : named.filter((k) => !had.includes(k)),
      removed: unmute ? named.filter((k) => had.includes(k)) : [], at: stamp,
      /* The RECORD SURFACES THIS ACT DID NOT TOUCH, counted rather than claimed,
         so the suite can assert the boundary from the op's own answer as well as
         from the tables. */
      wrote: { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 },
      detail: "a mute is PERSONAL and reaches CONDITION kinds only. Nothing left the record, nothing "
            + "left another member's queue, and an OBLIGATION on this case still reaches you: an "
            + "obligation leaves every list only when it is RESOLVED, which is record state.",
    };
  }

  /** op=queuesnooze — defer a case's re-notification, for one member, until an
   *  instant the MEMBER named.
   *
   *  P-87 IS ENFORCED BY AN ABSENCE, and that is the point. "Re-notify at the
   *  stage's OWN declared interval, never a global one" means this plane has no
   *  instance-wide snooze constant to fall back on, so a snooze with no instant
   *  is REFUSED rather than filled in with one. There is nothing to configure
   *  and nothing to drift; the cadence comes from the member's own choice, and
   *  the re-notification clock is the REC-1 alarm's `queue-renotify` consumer,
   *  whose wake is read from these rows and from no constant of its own.
   *
   *  A SNOOZE HIDES NOTHING. It does not filter the feed — deferring a
   *  re-notification is not the same as removing an item, and treating them as
   *  the same is how an obligation would go quiet on a member who only meant
   *  "not right now". The feed keeps reporting the item; the alarm stops
   *  pushing about it until the instant passes. */
  queueSnooze({ member = null, case: caseId = null, until = null, clear = false,
                viewer = null, at = null } = {}) {
    const me = typeof member === "string" ? member.trim() : "";
    if (!me) return { ok: false, reason: "NO_MEMBER",
      detail: "a snooze is PERSONAL: it is keyed to the member whose attention it is about, and a "
            + "machine credential has no member behind it." };
    const c = this.#queueCaseFor(caseId, viewer);
    if (c.ok !== true) return c;
    const stamp = typeof at === "string" && at ? at : new Date(this.#nowMs(null)).toISOString();
    let iso = null;
    if (!clear) {
      if (typeof until !== "string" || !until)
        return { ok: false, reason: "NO_UNTIL", case: c.id,
          detail: "name the instant to snooze until. There is no default and there must not be one: "
                + "P-87 requires re-notification at the stage's OWN declared interval, never at a "
                + "global one, so this plane holds no instance-wide snooze constant to fall back on." };
      const ms = Date.parse(until);
      if (!Number.isFinite(ms))
        return { ok: false, reason: "BAD_UNTIL", until, case: c.id,
          detail: "until must be an instant this plane can read (ISO-8601)" };
      if (ms <= this.#nowMs(null))
        return { ok: false, reason: "UNTIL_IN_PAST", until, case: c.id,
          detail: "a snooze that has already expired is not a snooze; it would report as deferred while "
                + "deferring nothing" };
      iso = new Date(ms).toISOString();
    }
    const row = this.#one(
      `SELECT muted_kinds FROM queue_state WHERE member_id=? AND case_id=?`, me, c.id);
    this.sql.exec(
      `INSERT INTO queue_state (member_id, case_id, muted_kinds, snoozed_until, last_seen)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(member_id, case_id) DO UPDATE SET snoozed_until=excluded.snoozed_until,
                                                     last_seen=excluded.last_seen`,
      me, c.id, row ? row.muted_kinds ?? null : null, iso, stamp);
    return {
      ok: true, member: me, case: c.id, case_type: c.type, snoozed_until: iso, at: stamp,
      wrote: { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 },
      detail: iso
        ? "re-notification about this case is deferred for YOU until that instant. The items themselves "
        + "are unchanged, they still appear in your feed, and no other member's feed moved."
        : "the snooze is cleared; re-notification resumes at the declared interval of whatever raises it.",
    };
  }

  /** The earliest instant any member's snooze expires, or null. This is the
   *  whole of the `queue-renotify` consumer's wake and it holds NO constant of
   *  its own — P-87 by construction rather than by discipline. */
  /** How many snoozes have come due at this instant. */
  #queueRenotifyExpired(now) {
    return this.#rows(
      `SELECT count(*) c FROM queue_state WHERE snoozed_until IS NOT NULL AND snoozed_until<=?`,
      new Date(now).toISOString())[0].c;
  }

  #queueRenotifyWake(now) {
    let best = null;
    for (const r of this.#rows(
      `SELECT snoozed_until FROM queue_state WHERE snoozed_until IS NOT NULL`)) {
      const ms = Date.parse(r.snoozed_until);
      if (!Number.isFinite(ms) || ms <= now) continue;
      if (best === null || ms < best) best = ms;
    }
    return best;
  }

  /* op=proposedispose (REC-7): record a member's DEFER or DISMISS of a derived PROPOSAL, WITHOUT
     minting a bundle. REC-6's op=proposals surfaces the record's own questions (one missing-
     predecessor finding per (progression_key, stage_key), aggregated). A member who decides a
     question is not worth pursuing — or wants it parked — needs somewhere to record that. op=dispose
     cannot take it: it disposes a focus BUNDLE (a handle + a state), and a proposal is not a bundle.
     Doctrine is SETTLED (D-79): a declined proposal AGES with a recorded reason; it does NOT mint a
     bundle, open a focus, or attribute anything beyond this disposition record — because DECLINING
     IS NOT AUTHORING. So this writes ONE row keyed by the proposal's identity and nothing else: no
     bundle, no history entry, no manifest. proposalsFeed reads it and ages the proposal out of open.

     The reason is REQUIRED and never prefilled (NO_REASON, fail-closed) — the whole point is that a
     member's decision to set aside the record's question is itself accountable, in their own words.
     The deciding member is STAMPED server-side by index.mjs (decidedBy); a caller-supplied value is
     overwritten there, and a blank one is refused here (NO_DECIDER) so a bypass fails closed. */
  proposeDispose({ progressionKey, stageKey, key, to, state, reason, decidedBy = null } = {}) {
    /* the proposal identity is (progression_key, stage_key). UI-5 sends the aggregation key it
       already holds ("progression::stage"); the pair may also be passed explicitly. */
    let pk = typeof progressionKey === "string" ? progressionKey.trim() : "";
    let sk = typeof stageKey === "string" ? stageKey.trim() : "";
    if ((!pk || !sk) && typeof key === "string" && key.includes("::")) {
      const i = key.indexOf("::");
      if (!pk) pk = key.slice(0, i).trim();
      if (!sk) sk = key.slice(i + 2).trim();
    }
    if (!pk) return { ok: false, reason: "NO_KEY",
      detail: "a proposal disposition names its progression (progressionKey, or key='progression::stage')" };
    if (!sk) return { ok: false, reason: "NO_STAGE",
      detail: "a proposal disposition names the stage it ages (stageKey, or key='progression::stage')" };
    /* deferred (parked, returnable) or dismissed (declined). Both age the proposal out of the open
       feed. Elevating/adopting is a DIFFERENT act (op=promote authors a focus) and is not a
       disposition here — the same line op=dispose draws between a disposition and elevation.
       The vocabulary is the PUBLISHED set imported from affordances.mjs (REC-11's folded
       chore): one array for every disposition surface, so none can drift. */
    const st = typeof to === "string" ? to.trim() : (typeof state === "string" ? state.trim() : "");
    if (!DISPOSITIONS.includes(st))
      return { ok: false, reason: "NOT_A_DISPOSITION", to: st || null, dispositions: DISPOSITIONS,
               detail: "a proposal is deferred (parked) or dismissed (declined); adopting one authors a "
                     + "focus (op=promote) and is not a disposition" };
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "deferring or dismissing the record's own question is recorded with a reason, in the "
                     + "member's own words — a disposition with no reason ages a finding with no account of why" };
    if (why.length > Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Store.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    const by = decidedBy == null ? "" : String(decidedBy).trim();
    if (!by)
      return { ok: false, reason: "NO_DECIDER",
               detail: "a disposition is recorded under the deciding member, stamped from the session. An "
                     + "unnamed decider cannot age the record's question." };
    /* the proposal's identity must be REAL: a defined progression and a stage that belongs to it.
       A proposal only ever exists for a defined progression's real stage (proposalsFeed derives it
       from progression_instances → stages), so this catches a typo'd or invented key rather than
       silently recording a disposition against nothing. It does NOT require a gap to currently fire:
       the disposition is a standing decision keyed by identity, and D-79 keeps it until re-triaged
       even if the gap comes and goes. */
    const def = this.#one(`SELECT progression_key FROM progression_defs WHERE progression_key=?`, pk);
    if (!def) return { ok: false, reason: "NO_SUCH_PROGRESSION", progression_key: pk,
      detail: "define the progression first (op=progressiondefine); a proposal exists only for a defined one" };
    const stageRow = this.#one(
      `SELECT stage_key FROM progression_stages WHERE progression_key=? AND stage_key=?`, pk, sk);
    if (!stageRow) return { ok: false, reason: "BAD_STAGE", progression_key: pk, stage_key: sk,
      detail: `'${sk}' is not a stage of progression '${pk}' — a disposition must name a real stage` };
    const at = new Date().toISOString();
    /* UPSERT on the identity: a proposal re-decided (deferred→dismissed, or a corrected reason)
       keeps ONE row, re-triageable, never a second. No bundle is written, no history, no manifest —
       declining is not authoring, so the disposition row is the whole of the act. */
    this.sql.exec(
      `INSERT INTO proposal_dispositions (progression_key,stage_key,state,reason,decided_by,at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(progression_key,stage_key) DO UPDATE SET
         state=excluded.state, reason=excluded.reason, decided_by=excluded.decided_by, at=excluded.at`,
      pk, sk, st, why.slice(0, Store.EDGE_REASON_MAX), by.slice(0, 200), at);
    return { ok: true, key: pk + "::" + sk, progression_key: pk, stage_key: sk,
             to: st, state: st, reason: why, decided_by: by, at, bundle: null };
  }

  /* ---- coordination: what LockService and the nextSeq race did ---- */

  allocId(prefix, year) {
    return this.ctx.storage.transactionSync(() => {
      const scope = `${prefix}-${year}`;
      const cur = this.#one(`SELECT next FROM seq WHERE scope=?`, scope);
      const n = cur ? cur.next : 1;
      this.sql.exec(`INSERT INTO seq (scope,next) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET next=?`, scope, n + 1, n + 1);
      return { id: `${prefix}-${year}-${String(n).padStart(4, "0")}` };
    });
  }

  acquireLease(bundleId, actor, ttlMs) {
    /* D-61. A lease is NEVER anonymous. The column is NOT NULL, and an absent
       actor used to trip SQLITE_CONSTRAINT_NOTNULL — a raw platform error where
       a named BIO refusal belongs (the D-39 class). Refuse it here, fail-closed,
       exactly as taskForward/taskResolve refuse a forward that names no member:
       a writer that will not name itself does not take the lock. The control
       plane stamps the actor server-side for BOTH a session (the member) and a
       machine credential (token:<class>, a NAMED machine identity), so a real
       caller is never anonymous and never reaches this refusal; the guard is the
       floor that makes "anonymous is refused" true at the store rather than by
       the courtesy of the caller. It bounds nothing about WHICH named actor may
       hold the lease — the lease is a courtesy lock, and promote's CAS on `base`
       is the integrity mechanism that this does not touch. */
    if (typeof actor !== "string" || !actor.trim())
      return { ok: false, reason: "ANONYMOUS_LEASE",
               detail: "a lease is taken under a named actor — a member (from a session) or a machine "
                     + "identity (token:<class>). An unnamed writer cannot hold the courtesy lock." };
    return this.ctx.storage.transactionSync(() => {
      const now = Date.now();
      const cur = this.#one(`SELECT actor, expires, base_sha FROM leases WHERE bundle_id=?`, bundleId);
      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)
        return { ok: false, heldBy: cur.actor, until: cur.expires };
      const b = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
      const expires = new Date(now + ttlMs).toISOString();
      this.sql.exec(
        `INSERT INTO leases (bundle_id,actor,acquired,expires,base_sha) VALUES (?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET actor=excluded.actor, acquired=excluded.acquired, expires=excluded.expires, base_sha=excluded.base_sha`,
        bundleId, actor, new Date(now).toISOString(), expires, b ? b.bundle_sha : "");
      // the lease returns the CURRENT bundle sha as the edit base, so re-anchor
      // is structural and the CAS is anchored on live state
      return { ok: true, actor, expires, base: b ? b.bundle_sha : null };
    });
  }

  stats() {
    const n = (t) => this.#one(`SELECT count(*) c FROM ${t}`).c;
    return {
      bundles: n("bundles"), files: n("files"), history: n("history"),
      refs: n("refs"), register: n("register"), indexed: n("bundles_fts"),
      selections: n("selections"), selectionItems: n("selection_items"),
      /* Reported so a purge can prove it took them, and so an operator can see
         inbox and reachability depth without a second call. */
      tasks: n("tasks"), taskQueue: n("task_queue"), sourceReachability: n("source_reachability"),
      /* FW-6: the subject registry's depth, reported so a whole-store purge can
         PROVE it cleared the registry rather than assert it (D-113). */
      entities: n("entities"), entityAliases: n("entity_aliases"), entityRelations: n("entity_relations"),
      /* FW-7: the recogniser's resolutions, reported so a purge can PROVE it took them. */
      resolutions: n("resolutions"),
      /* FW-8: the derived connections and the member-declared progression definitions,
         reported so a whole-store purge can PROVE it cleared them (D-113). */
      connections: n("connections"), progressionDefs: n("progression_defs"),
      progressionStages: n("progression_stages"),
      /* FW-9: the threaded progression instances, reported so a purge can PROVE it cleared
         them (D-113). */
      progressionInstances: n("progression_instances"),
      /* FW-10: the exception documents that discharge a lawful skip, reported so a purge can
         PROVE it cleared them (D-113). */
      progressionExceptions: n("progression_exceptions"),
      /* REC-5 / D-122: the connection-derive dirty-set's depth, reported so a whole-store
         purge can PROVE it cleared the pending work-queue (D-113) and so an operator can
         see how many entities are awaiting a sweep. */
      connectionDirty: n("connection_dirty"),
      /* REC-7 / D-79: the recorded proposal dispositions, reported so a whole-store purge can
         PROVE it cleared the aged decisions (D-113) and an operator can see how many of the
         record's own questions a member has deferred or dismissed. */
      proposalDispositions: n("proposal_dispositions"),
      /* REC-27 / D-137: the participation graph and the pending owner-governance
         votes, reported so a purge can PROVE it took them (both are keyed on
         project_id, a bundle id, and were the silent-leftover the D-113 check
         could not see). */
      projectParticipants: n("project_participants"),
      projectOwnerVotes: n("project_owner_votes"),
      /* REC-21: members' personal queue state, reported so a purge can PROVE it
         cleared the mutes and snoozes it took (D-113). A COUNT OF ROWS AND
         NOTHING ELSE — stats is an operator surface and whose attention is muted
         on what is not an operator's business. */
      queueState: n("queue_state"),
      dbBytes: this.ctx.storage.sql.databaseSize,
    };
  }

  /* REC-11 / R3: would writing edges bundleId -> each of `targets` close a
   * cycle in the basis graph? The graph is the inquiry-typed rows of
   * inquiry_basis; by induction every prior write kept it acyclic, so a cycle
   * through the NEW edges exists iff bundleId is reachable FROM one of the
   * targets along stored edges. Depth-first with a visited set, so the walk is
   * bounded by the store's edge count and needs no depth bound here (REC-12's
   * read-time walk carries one because IT must answer under a budget; a write
   * guard over an acyclic store terminates by construction). bundleId's own
   * outgoing edges are irrelevant: this promotion REPLACES them, and the walk
   * stops the moment it reaches bundleId anyway.
   *
   * Returns the full cycle path [bundleId, target, ..., bundleId] for the
   * refusal to name, or null. */
  #basisCyclePath(bundleId, targets) {
    for (const t of targets) {
      const path = [bundleId, t];
      const found = this.#basisReach(t, bundleId, new Set([t]), path);
      if (found) return found;
    }
    return null;
  }
  #basisReach(from, goal, seen, path) {
    const next = this.#rows(
      `SELECT target_id FROM inquiry_basis WHERE bundle_id=? AND target_type='inquiry' ORDER BY ord`, from);
    for (const r of next) {
      if (r.target_id === goal) return [...path, goal];
      if (seen.has(r.target_id)) continue;
      seen.add(r.target_id);
      const found = this.#basisReach(r.target_id, goal, seen, [...path, r.target_id]);
      if (found) return found;
    }
    return null;
  }

  /* REC-11: read a bundle's basis legs back, in document order — the ord that
     makes a leg addressable. A read of the PROJECTION; bundle.md stays the
     authority. */
  basisFor(bundleId) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "basis requires ?id=" };
    const legs = this.#rows(
      `SELECT ord, target_id, target_type, role, grade, grade_axis, grade_source, note, at
       FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, bundleId);
    return { ok: true, bundleId, legs };
  }

  /* REC-11: "which inquiries rest on this document" — E2's question and
     REC-17's re-evaluation obligation — as ONE indexed lookup on
     inquiry_basis_target, never a graph walk. Answers for an INFO- target and
     for an INQ- target alike, because a leg to an inquiry is the same edge. */
  restingOn(targetId) {
    if (!targetId) return { ok: false, reason: "NO_ID", detail: "restson requires ?id=" };
    const dependents = this.#rows(
      `SELECT bundle_id, ord, role, grade, grade_axis, grade_source
       FROM inquiry_basis WHERE target_id=? ORDER BY bundle_id, ord`, targetId);
    return { ok: true, targetId, dependents };
  }

  /* =======================================================================
   * REC-12: STRENGTH at inquiry altitude — a PAIR over two POPULATIONS, over
   * a bounded DAG. RECONCILED.md §3.1 (REC-12), read with §1.1's amendment
   * block and §1.2's; DEC-21, DEC-18, D-160, DEC-15 and R1/R2/R3 folded in.
   *
   * TWO MEASUREMENTS OVER TWO POPULATIONS (DEC-21), and this is the whole
   * shape of it:
   *
   *   CAPTURE     ranges over every DOCUMENT the conclusion reaches, and
   *               answers "how well do we know these are the bytes the body
   *               published?"
   *   CONNECTION  ranges over every EDGE the conclusion rests on, and answers
   *               "how well established are the relationships this reasoning
   *               uses?"
   *
   * A LEG IS AN EDGE POINTING AT A TARGET, so one document leg carries BOTH
   * grades: the edge's own connection grade, and the capture grade of the
   * document it reaches. There is no such thing here as an "evidentiary leg"
   * versus an "inferential leg" — that split cannot survive its own worked
   * example (RECONCILED §1.2 R2-e), and DEC-21 replaced it. The leg records
   * WHICH AXIS its grade is on (REC-11's grade_axis, because the axis is NOT
   * derivable from target_type), so the axis field is what admits a leg to a
   * population, and one letter is never admitted to both.
   *
   * REPORTED SIDE BY SIDE, WHICH IS NOT COMPOSITION. Nothing averages, mixes
   * or collapses the two, and NO CALLER MAY REDUCE THE PAIR TO ONE LETTER —
   * there is deliberately no code path in this file that produces a single
   * composed grade for an inquiry, and the returned shape has no scalar for a
   * caller to reach for.
   *
   * AN UNGRADED LEG IS INERT, NOT UNRATING (DEC-18). It is excluded from the
   * population entirely: not weighed, not averaged, it does not floor and it
   * does not unrate. It sits in the basis NAMED and visible as a leg that is
   * present and not yet load-bearing, and EVERY ungraded leg is named, one or
   * many — which is what keeps "inert" from meaning "invisible". UNRATED is
   * the BOUNDARY CASE: an axis with no graded member at all rests on nothing
   * established and reads UNRATED, naming all of them. THE WORD IS `UNRATED`
   * (D-160). The word this behaviour used to be called is RETIRED and is not
   * written anywhere in this derivation, its copy or its tests — not even to
   * warn about it — because in SB-OUTPUT §5.1 it names the OPPOSITE behaviour
   * (grade on the determined legs, note the ungraded one), so a worker who
   * found it here in good faith would build the laundering R1 forbids. D-160
   * is the ruling; strength.test.mjs holds this file to it.
   *
   * A HUNCH COMPOSES NORMALLY (DEC-15). grade_source 'hunch' is an ASSERTED
   * grade, present and load-bearing, never treated as undetermined; it is
   * reported on the member so a surface (and REC-15's pre-flight) can see the
   * bias debt without the arithmetic pretending the grade is absent.
   *
   * DERIVE ON READ. The bundles columns this writes are a CACHE and never the
   * authority: a stored strength goes stale the moment a leg is raised, and
   * `resolutions` grades are explicitly improvable.
   *
   * SINGLE-BASIS ARITHMETIC (DEC-32, still open): the basis is one flat
   * conjunction of legs, so an axis is its weakest load-bearing member. No
   * grounds, no OR-branches, no plurality machinery is built here — when
   * DEC-32 closes, the shape it adds is a partition ABOVE this function, and
   * this stays the within-branch rule. */

  /* Named once so no site spells an axis and none can drift. */
  static STRENGTH_AXES = ["capture", "connection"];

  /* R1, THE ARITHMETIC HALF of the two defences (#axisResult holds the naming
     half, and they are deliberately separable so each has its own negative
     control). The weakest member of one axis's population by #GRADE_RANK.

     THE NULL IS SHORT-CIRCUITED HERE, BEFORE ANY RANK COMPARISON HAPPENS.
     #weakerGrade must NOT be reused for this: its `|| 0` ranks an unknown
     below grade D — below a member's signed testimony — and a null is the
     absence of a grade, not a weak one. It also composes on one shared rank
     across both axes, which R2 forbids; this function is called ONCE PER
     AXIS over that axis's own population and can therefore never mix them. */
  static #weakestOf(members) {
    let weakest = null;
    for (const m of members) {
      if (m.grade == null) continue;
      if (weakest === null || Store.#GRADE_RANK[m.grade] < Store.#GRADE_RANK[weakest.grade]) weakest = m;
    }
    return weakest;
  }

  /* What a member of a population looks like when it is NAMED — for the
     weakest leg, and for every leg that is not load-bearing. A leg is
     addressable by (bundle_id, ord), which is what REC-11's ord is for. */
  static #namedMember(m) {
    return { bundle_id: m.bundle_id, ord: m.ord, target_id: m.target_id, role: m.role,
             grade: m.grade ?? null, grade_source: m.grade_source ?? null, via: m.via,
             ...(m.inherited_from ? { inherited_from: m.inherited_from } : {}),
             ...(m.through ? { through: m.through } : {}),
             ...(m.why ? { why: m.why } : {}) };
  }

  /* One axis's answer, from its own population. Three states and no fourth:
       graded       — the axis rests on at least one graded member; the grade
                      is the weakest of them and that member is NAMED.
       unrated      — no member of this axis carries a grade (DEC-18's
                      boundary case). Not a low score and not a failure.
       undetermined — the walk could not finish a branch within its depth
                      bound (R3). UNKNOWN is not ABSENT: an unfinished branch
                      might be weaker than everything we can see, so the axis
                      states that it has no computed strength and names the
                      depth. R1's shape, not an error. */
  static #axisResult(axis, members, exhausted) {
    /* DEFENCE 2 of 2, the NAMING half of DEC-18: membership of the load-bearing
       population is decided HERE, by the presence of a grade, and the inert
       members are named rather than dropped. Breaking this alone leaves the
       arithmetic right and the record dishonest, which is why it has its own
       negative control.

       THE TWO DEFENCES SHARE ONE INVARIANT and are deliberately not made
       independent of it: `loadBearing` is non-empty EXACTLY when #weakestOf can
       find a member, because both ask `grade != null`. So breaking either one
       is LOUD — the graded branch below dereferences the weakest it was
       promised, and an axis that claims a load-bearing population it cannot
       describe fails at the write rather than publishing a strength nobody can
       check. A defensive fallback here would turn that into a quiet wrong
       answer, which is the failure mode this record cares about most. */
    const isLoadBearing = (m) => m.grade != null;
    const inert = members.filter((m) => !isLoadBearing(m)).map(Store.#namedMember);
    const loadBearing = members.filter(isLoadBearing);
    if (exhausted.length) {
      return { axis, state: "undetermined", grade: null, determined: false,
               weakest: null, load_bearing: loadBearing.length, population: members.length,
               not_load_bearing: inert,
               depth_bound: Store.QUEUE_ANCESTOR_DEPTH,
               undetermined_at: exhausted.map(Store.#namedMember),
               detail: `this ${axis} axis has NO computed strength: the basis walk reached its `
                     + `depth bound of ${Store.QUEUE_ANCESTOR_DEPTH} at `
                     + `${exhausted.map((e) => e.target_id).join(", ")}, so what lies below is `
                     + `unknown rather than absent. This is what we do not know, not a low score.` };
    }
    if (!loadBearing.length) {
      return { axis, state: "unrated", grade: null, determined: false,
               weakest: null, load_bearing: 0, population: members.length,
               not_load_bearing: inert, depth_bound: Store.QUEUE_ANCESTOR_DEPTH,
               detail: members.length
                 ? `UNRATED on ${axis}: no leg on this axis carries an established grade, so this `
                 + `conclusion rests on nothing established here. Not load-bearing: `
                 + `${inert.map((m) => m.target_id).join(", ")}.`
                 : `UNRATED on ${axis}: this inquiry rests on nothing on this axis.` };
    }
    /* Called over the FULL population, not over the pre-filtered one, so the
       null short-circuit in #weakestOf is genuinely load-bearing rather than
       decorative — two independent defences, each one breakable on its own. */
    const w = Store.#weakestOf(members);
    return { axis, state: "graded", grade: w.grade, determined: true,
             weakest: Store.#namedMember(w), load_bearing: loadBearing.length,
             population: members.length, not_load_bearing: inert,
             depth_bound: Store.QUEUE_ANCESTOR_DEPTH,
             detail: `${axis} ${w.grade} — no stronger than the weakest ${axis} it rests on, `
                   + `which is ${w.target_id}`
                   + (w.through ? ` (through ${w.through})` : "")
                   + `. ${inert.length ? `Present and not yet load-bearing: `
                   + `${inert.map((m) => m.target_id).join(", ")}.` : ""}`.trimEnd() };
  }

  /* The walk. Reads REC-11's projection through basisFor() — the read seam —
     and carries R3's DEPTH BOUND, which is REC-20's EXPORTED
     Store.QUEUE_ANCESTOR_DEPTH and not a second constant: one bound for the
     ancestor walk and this one, so the two cannot answer at different depths
     for the same store.

     THERE IS DELIBERATELY NO VISITED SET AND NO MEMO. The bound is the only
     thing that makes this terminate, which is exactly what R3 asks for: a
     cycle costs a bounded walk and reports `undetermined`, and the negative
     control (remove the bound, feed it a store-constructed cycle) is real
     rather than masked by a cache. REC-11 refuses a cycle at the WRITE, so a
     cycle can only reach here if something wrote around that guard. */
  #strengthWalk(bundleId, depth, bound) {
    const legs = this.basisFor(bundleId).legs ?? [];
    const members = { capture: [], connection: [] };
    const exhausted = { capture: [], connection: [] };
    for (const leg of legs) {
      /* MAP RULE: the type consultation goes through the catalog's own
         normalizeType, never a raw key and never a local alias copy. */
      const isInquiry = normalizeType(leg.target_type) === "inquiry";
      const site = { bundle_id: bundleId, ord: leg.ord, target_id: leg.target_id,
                     role: leg.role, grade_source: leg.grade_source ?? null };
      /* THE LEG'S OWN GRADE, admitted to the population of the axis it is
         RECORDED ON (R2-b: the axis is the leg's own fact, not a function of
         target_type). A leg carrying a connection grade is inert on capture
         and says so; that is not a defect, it is the two populations being
         two.

         A leg's ROLE is carried on the member and NEVER composed: a
         cuts_against leg is an edge the conclusion rests on and it stays in
         the population, because invariant 7 exists to stop a rendering
         quietly dropping it. */
      for (const axis of Store.STRENGTH_AXES) {
        const onAxis = leg.grade_axis === axis;
        /* CAPTURE ranges over DOCUMENTS (DEC-21). An inquiry is not a
           document, so a capture grade authored on an INQ- leg has no
           referent — it is named as not load-bearing rather than silently
           setting this axis, which would be a strength claimed about no
           document at all.
           CORRECTED BY REC-31: this arm used to say "REC-11's write-time
           check does not refuse it today", and that is no longer the gap it
           describes — checkInquiryBasis now REFUSES the combination at the
           write (C-2.8, one function consulted by both the catalog and
           op=promote), so no new leg reaches this walk in that shape. The
           handling stays, and stays load-bearing, for the reason the refusal
           cannot cover: history is append-only, a replayed revision is exempt
           from the shape checks by design, and a row written before the
           refusal existed still reads. A derivation that met one and threw
           would be the record failing to hold its own past. */
        const noReferent = axis === "capture" && isInquiry;
        if (noReferent && !onAxis) continue;
        members[axis].push({ ...site, via: "leg",
          grade: onAxis && !noReferent ? (leg.grade ?? null) : null,
          why: noReferent
            ? `the target is an inquiry, not a document, so a capture grade on this leg has no referent`
            : leg.grade == null ? `the leg carries no grade`
            : onAxis ? null
            : `the leg's grade is on the ${leg.grade_axis} axis` });
      }
      if (!isInquiry) continue;
      /* RECURSION: a leg to another inquiry contributes THAT INQUIRY'S DERIVED
         PAIR, PER AXIS — capture into capture, connection into connection,
         never crossed. The weakest leg it names is carried up with it, so the
         leg a reader is sent to check is the ACTUAL one and not the hop. */
      if (depth + 1 > bound) {
        for (const axis of Store.STRENGTH_AXES)
          exhausted[axis].push({ ...site, via: "inherited", grade: null,
            why: `the walk reached its depth bound of ${bound} here` });
        continue;
      }
      const sub = this.#strengthWalk(leg.target_id, depth + 1, bound);
      for (const axis of Store.STRENGTH_AXES) {
        const s = sub[axis];
        if (s.state === "undetermined") {
          exhausted[axis].push({ ...site, via: "inherited", grade: null,
            why: `${leg.target_id} is undetermined on ${axis}: ${s.detail}` });
          continue;
        }
        members[axis].push({ ...site, via: "inherited", grade: s.grade,
          inherited_from: leg.target_id,
          /* The named weakest leg travels with the grade: a reader checking
             this case is sent to the leg that actually sets it. */
          through: s.weakest ? s.weakest.target_id : null,
          why: s.grade == null
            ? `${leg.target_id} is UNRATED on ${axis}, so it is not load-bearing here`
            : null });
      }
    }
    return { capture: Store.#axisResult("capture", members.capture, exhausted.capture),
             connection: Store.#axisResult("connection", members.connection, exhausted.connection) };
  }

  /** REC-12: the derived PAIR for one inquiry, computed on read.
   *
   *  Returns { capture, connection } as two independent axis answers and NO
   *  scalar: there is nothing here for a caller to render as "the strength",
   *  because a case does not have one. */
  strengthOf(bundleId) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "strength requires ?id=" };
    const bound = Store.QUEUE_ANCESTOR_DEPTH;
    const pair = this.#strengthWalk(bundleId, 0, bound);
    return { ok: true, bundleId, depth_bound: bound,
             capture: pair.capture, connection: pair.connection };
  }

  /* REC-12: the projection CACHE, per axis, written inside promote's
     transaction right after the inquiry_basis projection it derives from.

     A CACHE AND NEVER THE AUTHORITY, and the distinction is not decoration: a
     stored strength goes stale the moment a leg anywhere beneath it is raised
     (`resolutions` grades are explicitly IMPROVABLE, and an inquiry this one
     rests on can be re-promoted without touching this row). It exists so that
     "every inquiry at B or better on an axis" is an indexed query rather than
     a scan of every basis in the store; anything that must be RIGHT calls
     strengthOf().

     PER AXIS, in two columns and never one: a single cached letter is exactly
     the composed scalar DEC-21 forbids, and a column is where one would grow.
     The STATE column beside each grade is what keeps `unrated` distinguishable
     from `undetermined` and both distinguishable from "never projected", which
     one nullable grade column cannot do. */
  #writeStrengthProjection(bundleId, isInquiry) {
    if (!isInquiry) return null;
    const s = this.strengthOf(bundleId);
    const n = this.#one(`SELECT count(*) AS c FROM inquiry_basis WHERE bundle_id=?`, bundleId).c;
    this.sql.exec(
      `UPDATE bundles SET inquiry_capture_strength=?, inquiry_capture_state=?,
              inquiry_connection_strength=?, inquiry_connection_state=?, inquiry_basis_count=?
         WHERE bundle_id=?`,
      s.capture.grade, s.capture.state, s.connection.grade, s.connection.state, n, bundleId);
    return s;
  }

  /* Eviction. The store is append-only by doctrine, so removal is deliberate,
     never implicit, and admin-only at the control plane. Two modes: one bundle
     with its whole lineage, or everything.

     seq is deliberately NOT reset. allocid must never reissue an identifier
     that has already existed, so a purged store keeps counting from where it
     stopped. A purge that reset the counter would make identifiers ambiguous
     across the purge boundary, which is worse than a gap.

     R2 is untouched. Registered captures are immutable and content-addressed,
     so orphaning them costs storage but cannot corrupt anything. Reclaiming
     them is a separate sweep against the register, not part of this. */
  purge({ bundleId = null } = {}) {
    /* D-113. `readings` and `reading_refs` (FW-5, CONSTRUCTS Step 3) are DERIVED
       from the corpus — a projection of each captured document's provenance — and
       both carry bundle_id, so listing them here clears them in BOTH arms: the
       per-bundle DELETE ... WHERE bundle_id, and the whole-store DELETE. A
       whole-store purge that reported scope ALL and left a document's reading and
       its entity references behind is exactly the silent-leftover D-113 exists to
       prevent, and hygiene.test.mjs holds this list against schema.mjs. */
    /* FW-7: `resolutions` (CONSTRUCTS Step 4 slice B) is DERIVED from the corpus — a
       recogniser's match of a captured document's reference to an entity — and carries
       bundle_id, so it clears in BOTH arms exactly as readings/reading_refs do. Leaving
       it out would let a whole-store purge report scope ALL while a document's
       resolutions survived, the D-113 silent-leftover; hygiene.test.mjs holds this list
       against schema.mjs. */
    /* FW-9: `progression_instances` (CONSTRUCTS Step 5 slice B) is DERIVED from the corpus —
       each row is a captured document threaded at a stage — and carries bundle_id, so it
       clears in BOTH arms exactly as resolutions do. A per-bundle purge removes that
       document's placements and the instance honestly re-reads with that stage now unfilled;
       a whole-store purge takes them all. Leaving it out would let a whole-store purge report
       scope ALL while a threaded document survived, the D-113 silent-leftover; hygiene.test.mjs
       holds this list against schema.mjs. Progression DEFINITIONS are member-declared (no
       bundle_id) and cleared in the whole-store arm below with the registry. */
    /* FW-10: `progression_exceptions` (CONSTRUCTS Step 5 slice C) is DERIVED from the corpus too --
       each row is a captured exception document threaded onto an instance -- and carries bundle_id,
       so it clears in BOTH arms exactly as progression_instances do. A per-bundle purge removes that
       document's discharges and the stage honestly re-reads as an undischarged gap; a whole-store
       purge takes them all. Leaving it out would let a whole-store purge report scope ALL while a
       discharge survived, the D-113 silent-leftover; hygiene.test.mjs holds this list against
       schema.mjs. */
    /* REC-11: `inquiry_basis` is DERIVED from the corpus — a projection of each
       inquiry's basis[] frontmatter, exactly as refs is of references[] — and
       carries bundle_id, so it clears in BOTH arms via this list. Leaving it out
       would let a whole-store purge report scope ALL while an inquiry's legs
       survived, the D-113 silent-leftover; hygiene.test.mjs holds this list
       against schema.mjs. A per-bundle purge clears only the purged inquiry's
       OWN legs; legs elsewhere that TARGET it stay, honestly unresolvable, the
       same way refs to a purged bundle read as C-6.2 findings rather than
       silently vanishing. */
    /* REC-14: `inquiry_exclusions` is DERIVED from the corpus in exactly the
       same sense — a projection of completeness_excluded[] — and carries
       bundle_id, so it clears in BOTH arms via this list. The PUBLISHED rows
       are not touched by either arm and must not be: published_bundles and
       published_shas are exempt by doctrine (a hash once published answers
       forever), so purging the working corpus leaves the published record
       standing, which is the correct asymmetry and is why the exclusion lives
       in the BYTES as well as in this table. */
    const TABLES = ["files", "history", "manifest", "refs", "register", "leases",
                    "readings", "reading_refs", "resolutions", "progression_instances",
                    "progression_exceptions", "inquiry_basis", "inquiry_exclusions"];
    const before = this.stats();
    this.ctx.storage.transactionSync(() => {
      if (bundleId) {
        /* The text index row goes with the bundle it describes, and it goes
           first, while the row that names its rowid still exists. An orphaned
           FTS row is worse than a missing one: fts_id is allocated as MAX+1, so
           a later bundle can be handed the same integer and inherit the deleted
           document's text. */
        const r = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t} WHERE bundle_id=?`, bundleId);
        /* FW-8. A connection is DERIVED (two documents concerning one entity) and spans
           TWO captures, so it has no single bundle_id and is NOT in TABLES; it is cleared
           when EITHER end's bundle is purged, so the reverse-index connection cannot
           outlive a document it joined (D-113). */
        this.sql.exec(`DELETE FROM connections WHERE a_bundle_id=? OR b_bundle_id=?`, bundleId, bundleId);
        /* REC-27 / D-137. Participation and owner-governance votes are keyed on
           project_id, and a project_id IS a bundle id, so they are cleared in the
           per-bundle arm too: purging a project bundle and leaving its participant
           rows would orphan the participation graph against a project that no
           longer exists — the D-113 silent-leftover in the two tables the D-113
           check could not see (they are created in the DO constructor, not in
           schema.mjs). For a non-project bundleId these DELETEs match no rows and
           change nothing. hygiene.test.mjs holds this list against BOTH files now. */
        this.sql.exec(`DELETE FROM project_participants WHERE project_id=?`, bundleId);
        this.sql.exec(`DELETE FROM project_owner_votes WHERE project_id=?`, bundleId);
        /* REC-21 / D-113. queue_state is keyed (member_id, case_id) and a case_id
           IS a bundle id, so it clears in the per-bundle arm too: purging an
           inquiry or a project while leaving members' mutes and snoozes against
           it would leave personal state pointed at a case that no longer exists,
           and a later bundle allocated a colliding id would inherit somebody's
           silence. It is NOT in TABLES because its column is case_id rather than
           bundle_id. For a non-case bundleId this DELETE matches no rows. */
        this.sql.exec(`DELETE FROM queue_state WHERE case_id=?`, bundleId);
        this.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, bundleId);
      } else {
        this.sql.exec(`DELETE FROM bundles_fts`);
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t}`);
        this.sql.exec(`DELETE FROM bundles`);
        /* Selections are derived, so a purge of everything takes them too. A
           purge of ONE bundle deliberately leaves them alone: the selection
           should report that item as purged rather than silently forget it was
           ever picked. */
        this.sql.exec(`DELETE FROM selection_items`);
        this.sql.exec(`DELETE FROM selections`);
        /* REC-27 / D-137. The participation graph and the owner-governance votes
           are keyed on project_id — a bundle id — so a whole-store purge that
           reported scope ALL while the entire participation graph stood was
           exactly the D-113 silent-leftover, in tables the D-113 check could not
           see because they are created by hand in the DO constructor rather than
           in schema.mjs. Cleared here with the corpus; the roster itself
           (members, member_expertise, admin_votes) survives, because membership
           is identity and not derived from captured documents. */
        this.sql.exec(`DELETE FROM project_participants`);
        this.sql.exec(`DELETE FROM project_owner_votes`);
        /* D-113. Everything else derived from the corpus, and the reason this
           list must be extended whenever a derived table is added: a purge that
           reports scope "ALL" and leaves rows behind is worse than one that
           reports a narrower scope, because the caller believes the store is
           empty. Found on 2026-07-31 when a scratch purge cleared five bundles
           and left an open task pointing at one of them, which C-19.1 would then
           refuse as unresolvable.
           *
           * A task and a queue event are derived: both exist only because a
           * capture in this corpus was undetermined. Source reachability is
           * derived too, but from ATTEMPTS rather than from bundles, so it is
           * taken here only because a whole-store purge means the corpus itself
           * is gone and the counter would otherwise outlive the thing it
           * describes. A per-bundle purge deliberately touches none of it, for
           * the same reason it leaves selections alone. */
        this.sql.exec(`DELETE FROM tasks`);
        this.sql.exec(`DELETE FROM task_queue`);
        this.sql.exec(`DELETE FROM source_reachability`);
        /* The capture machinery's own derived tables, found MISSING here on
           2026-07-31 when D-113 was closed as a class rather than an instance.
           Every one is derived from the corpus and every one predates the fix
           above, so each was the exact silent-leftover this list exists to
           prevent: links a captured document made and their contemporaneity
           verdicts; the address/capture index that answers "does the store hold
           a capture of X"; the per-host asset cache and its per-document rows;
           and the multi-tick capture work list. Leaving any of them behind lets
           a store that reports scope ALL still answer as though captures it no
           longer holds were present. hygiene.test.mjs now asserts this list
           against schema.mjs so the next derived table cannot be forgotten. */
        this.sql.exec(`DELETE FROM link_verdicts`);
        this.sql.exec(`DELETE FROM links`);
        this.sql.exec(`DELETE FROM captured_locators`);
        this.sql.exec(`DELETE FROM site_asset_refs`);
        this.sql.exec(`DELETE FROM site_assets`);
        /* CAP-4: verdicts on reused parts are derived from the corpus (a ratify
           verdict names a bundle; a posthoc verdict names a capture that reused
           bytes now gone). A whole-store purge that reported ALL and left these
           behind is the exact D-113 silent-leftover, so they go here too. */
        this.sql.exec(`DELETE FROM reuse_verdicts`);
        this.sql.exec(`DELETE FROM capture_sessions`);
        /* FW-6 / D-83: the SUBJECT REGISTRY (entities, their aliases, their declared
           relations). Unlike the tables above it is FIRST-CLASS member-declared
           state, not a projection of the corpus -- but op=purge is the scratch-reset
           tool, and a whole-store purge that reported scope ALL while leaving the
           registry populated is exactly the D-113 silent-leftover: the caller
           believes the store is empty. So it is cleared here, in the whole-store arm
           only, and left untouched by a per-bundle purge (it has no bundle_id).
           Relations first, then aliases, then entities, so nothing outlives an end
           it references. hygiene.test.mjs asserts this list against schema.mjs. */
        this.sql.exec(`DELETE FROM entity_relations`);
        this.sql.exec(`DELETE FROM entity_aliases`);
        this.sql.exec(`DELETE FROM entities`);
        /* FW-8. Connections are DERIVED from the corpus (two captures concerning one
           entity), so a whole-store purge clears them. Progression DEFINITIONS are
           FIRST-CLASS member-declared state like the registry above -- not corpus-derived
           -- but op=purge is the scratch-reset tool, so a whole-store purge that reported
           scope ALL while leaving them is the D-113 silent-leftover; cleared here in the
           whole-store arm only, left by a per-bundle purge (they have no bundle_id).
           Stages before defs, so nothing outlives the definition it belongs to.
           hygiene.test.mjs asserts this list against schema.mjs. */
        this.sql.exec(`DELETE FROM connections`);
        this.sql.exec(`DELETE FROM progression_stages`);
        this.sql.exec(`DELETE FROM progression_defs`);
        /* REC-5 / D-122. The connection-derive dirty-set is a transient work-queue
           DERIVED from the corpus (an entity is dirty only because a document
           resolved to it). A whole-store purge means the corpus is gone, so the
           pending queue must go with it or a scratch reset reports scope ALL while
           leaving rows the next sweep would act on (the D-113 silent-leftover). It
           has no bundle_id and is safe to re-derive, so a per-bundle purge leaves
           it. hygiene.test.mjs asserts this list against schema.mjs. */
        this.sql.exec(`DELETE FROM connection_dirty`);
        /* REC-7 / D-79. Proposal dispositions are member-authored decisions (a member aged the
           record's own question), not a projection of the corpus — like the registry and
           progression definitions above. But op=purge is the scratch-reset tool, so a whole-store
           purge that reported scope ALL while leaving dispositions is the D-113 silent-leftover.
           Cleared here in the whole-store arm only; a per-bundle purge leaves it (no bundle_id).
           hygiene.test.mjs asserts this list against schema.mjs. */
        this.sql.exec(`DELETE FROM proposal_dispositions`);
        /* REC-21 / D-113. Members' mutes and snoozes are keyed on a case id — a
           bundle id — so a whole-store purge that reported scope ALL while
           leaving them standing is the silent-leftover exactly: the corpus is
           gone and a member is still not being told about a case that no longer
           exists. It is PERSONAL state rather than corpus-derived, like the
           registry and the proposal dispositions above, and it is cleared here
           for the same reason those are — op=purge is the scratch-reset tool and
           the caller believes the store is empty. hygiene.test.mjs asserts this
           list against schema.mjs. */
        this.sql.exec(`DELETE FROM queue_state`);
      }
    });
    const after = this.stats();
    const d = (k) => before[k] - after[k];
    return {
      ok: true, scope: bundleId || "ALL", before, after,
      removed: { bundles: d("bundles"), files: d("files"), history: d("history"),
                 refs: d("refs"), register: d("register"),
                 tasks: d("tasks"), taskQueue: d("taskQueue"),
                 sourceReachability: d("sourceReachability"),
                 /* FW-6: the registry rows a whole-store purge took (D-113). */
                 entities: d("entities"), entityAliases: d("entityAliases"),
                 entityRelations: d("entityRelations"),
                 /* FW-7: the recogniser's resolutions a purge took (D-113). */
                 resolutions: d("resolutions"),
                 /* FW-8: the derived connections and member-declared progression
                    definitions a whole-store purge took (D-113). */
                 connections: d("connections"), progressionDefs: d("progressionDefs"),
                 progressionStages: d("progressionStages"),
                 /* FW-9: the threaded progression instances a purge took (D-113). */
                 progressionInstances: d("progressionInstances"),
                 /* FW-10: the exception documents a purge took (D-113). */
                 progressionExceptions: d("progressionExceptions"),
                 /* REC-5 / D-122: the pending connection-derive dirt a whole-store purge took (D-113). */
                 connectionDirty: d("connectionDirty"),
                 /* REC-7 / D-79: the aged proposal dispositions a whole-store purge took (D-113). */
                 proposalDispositions: d("proposalDispositions"),
                 /* REC-21: the mutes and snoozes a purge took (D-113) — per-bundle
                    for a case bundle, everything for scope ALL. */
                 queueState: d("queueState"),
                 /* REC-27 / D-137: the participation graph and pending owner votes a purge
                    took — per-bundle for a project bundle, everything for scope ALL. */
                 projectParticipants: d("projectParticipants"),
                 projectOwnerVotes: d("projectOwnerVotes") },
    };
  }

  /* ---- credentials ----

     A Worker cannot rewrite its own secret, so ADMIN_TOKEN is a bootstrap
     credential rather than the credential. It is spent once, exchanging itself
     for an operator-chosen password whose hash lives here. Recovery is to
     overwrite ADMIN_TOKEN in the dashboard, which clears the consumed marker
     and returns the instance to unclaimed. That makes the group's Cloudflare
     login the root of trust, which is the only thing they reliably still have
     when a password is lost. */

  static #enc = new TextEncoder();

  static async #derive(password, salt, iterations) {
    const key = await crypto.subtle.importKey(
      "raw", Store.#enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: Store.#enc.encode(salt), iterations }, key, 256);
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))]
      .map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  bootstrapState(tokenFp = null) {
    const b = this.#one(`SELECT consumed_at, token_fp FROM bootstrap WHERE id=1`);
    const roles = this.#rows(`SELECT role, updated FROM credentials`);
    const spent = !!(b && b.consumed_at);
    /* A different bootstrap secret than the one that was spent means the
       operator has rotated it in the dashboard, which is the recovery gesture.
       Re-arm rather than lock them out. */
    const rearmed = spent && tokenFp !== null && b.token_fp !== tokenFp;
    return {
      claimed: spent && !rearmed,
      rearmed,
      consumedAt: rearmed ? null : (b?.consumed_at || null),
      roles,
    };
  }

  /* Spending the bootstrap credential. Refuses if already spent, so a leaked
     ADMIN_TOKEN cannot silently re-claim a running instance. */
  async claim({ role = "admin", password, tokenFp = null } = {}) {
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    const st = this.bootstrapState(tokenFp);
    if (st.claimed)
      return { ok: false, reason: "ALREADY_CLAIMED", consumedAt: st.consumedAt };
    await this.setPassword({ role, password });
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET consumed_at=excluded.consumed_at,
                     token_fp=excluded.token_fp`, now, tokenFp);
    return { ok: true, role, consumedAt: now };
  }

  async setPassword({ role, password, iterations = 100000 }) {
    const salt = Store.#rand(16);
    const hash = await Store.#derive(password, salt, iterations);
    this.sql.exec(
      `INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES (?,?,?,?,?)
       ON CONFLICT(role) DO UPDATE SET salt=excluded.salt, hash=excluded.hash,
         iterations=excluded.iterations, updated=excluded.updated`,
      role, salt, hash, iterations, new Date().toISOString());
    return { ok: true, role };
  }

  /* Exchanges a password for a bearer token so the password does not travel on
     every later request. Constant-time comparison is not meaningful over a
     network round trip at this granularity, but the derived-hash compare avoids
     ever holding the password beyond this call. */
  async login({ role = "admin", password, ttlSeconds = 43200 } = {}) {
    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);
    if (!c) return { ok: false, reason: "NO_SUCH_ROLE" };
    const got = await Store.#derive(String(password ?? ""), c.salt, c.iterations);
    if (got !== c.hash) return { ok: false, reason: "BAD_PASSWORD" };
    const token = Store.#rand(32);
    const expires = Date.now() + ttlSeconds * 1000;
    this.sql.exec(`DELETE FROM sessions WHERE expires < ?`, Date.now());
    this.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES (?,?,?,?)`,
      token, role, expires, new Date().toISOString());
    return { ok: true, role, token, expires };
  }

  session(token) {
    if (!token) return null;
    const s = this.#one(`SELECT role, expires FROM sessions WHERE token=?`, token);
    if (!s) return null;
    if (s.expires < Date.now()) { this.sql.exec(`DELETE FROM sessions WHERE token=?`, token); return null; }
    return { role: s.role, expires: s.expires, ...this.#sessionRights(s.role) };
  }

  /* What a session may DO. Membership Architecture v2 section 5.
   *
   * Resolved HERE, at the point the session is read, rather than cached on the
   * session row: a capability change has to take effect on the next request and
   * not on the next login, or an administrator revoking `publish` from someone
   * mid-incident would be revoking it in eight hours' time.
   *
   * THE FOUNDER HOLDS EVERYTHING, and that is 4.6 rather than convenience. The
   * holders of ADMIN_TOKEN are the root of trust and every rule in the
   * membership model sits beneath them. 4.6 also forbids any interface implying
   * otherwise, so reporting them as capability-bounded would be a lie in the
   * one place it matters.
   *
   * AN IN-APP ADMINISTRATOR HOLDS EVERY WORKING CAPABILITY. v2 section 5,
   * confirmed 2026-07-26. Not read from their row, and deliberately: `memberCaps`
   * refuses to touch an administrator's row at all, to protect 4.4, so if the row
   * were consulted an administrator's powers would be frozen forever at whatever
   * their invitation happened to set, and an administrator invited with the
   * default `["contribute"]` could never publish and could never be granted
   * permission to. A field nobody can edit is not a variable. Reading it as not
   * consulted is the only reading with no trap in it.
   *
   * FAIL CLOSED everywhere else. An unrecognised role, a member row that is
   * gone, or a member whose status is not active resolves to NO capabilities
   * rather than to the member default. Revocation already deletes sessions; this
   * is what covers the race between the delete and an in-flight request.
   */
  #sessionRights(role) {
    const none = { capabilities: [], administer: false, member: null, handle: null, rootOfTrust: false };
    if (role === Store.ROOT_ADMIN)
      return { capabilities: [...Store.CAPABILITIES], administer: true,
               member: Store.ROOT_ADMIN, handle: null, rootOfTrust: true };
    if (typeof role !== "string" || !role.startsWith("member:")) return none;
    const id = role.slice(7);
    const m = this.#one(
      `SELECT member_id, handle, role, status, capabilities FROM members WHERE member_id=?`, id);
    if (!m || m.status !== "active") return { ...none, member: id };
    const admin = m.role === "admin";
    return {
      capabilities: admin ? [...Store.CAPABILITIES] : this.#capsOf(m),
      administer: admin, member: id, handle: m.handle ?? null, rootOfTrust: false,
    };
  }

  /* ---- members: each person their own credential, admin-invited ----

     The invite is spent exactly like the bootstrap credential is spent: its
     hash is cleared on enrollment, so possession of an old invite buys
     nothing against an enrolled member. Passwords live only as PBKDF2
     hashes under credentials role 'member:<id>'. */

  /* Why is a register row unreferenced? (D-9)
   *
   * The register maps a capture's sha to the bundle and path it was intake for.
   * Nothing could read it until 0.22.0, so the 30 unreferenced rows on the live
   * record were explained only by a guess.
   *
   * THE FIRST VERSION OF THIS LOOKED IN TWO OF THE THREE PLACES BYTES CAN LIVE.
   * It checked `files` and `history` and called everything else "dropped", which
   * produced a confident and wrong finding: that the Apps Script migration could
   * not be audited from the record it produced. The bytes were in R2 the whole
   * time. `migrate.mjs` says so in its own header, carrying Drive provenance
   * "verbatim as a registered drive-provenance capture, so the Drive era remains
   * inspectable without polluting the live file image", which is precisely what
   * the two-bucket design is for.
   *
   * So this returns rows and their capture hashes, and the CONTROL PLANE probes
   * `bio-captures` to finish the classification, exactly as the ratify path does
   * with `hasCapture`. The Durable Object does not know its own store name and
   * R2 keys are `<store>/captures/<sha>`, so the probe cannot honestly be done
   * from in here.
   *
   *   live        the capture's bytes are the current file at that path
   *   superseded  the path is still there carrying different bytes now
   *   historical  not live anywhere, but present in history
   *   unresolved  in neither, so the control plane must ask R2 before this row
   *               can be called sound or broken
   */
  registerAudit() {
    const rows = this.#rows(`SELECT capture_sha, bundle_id, path, encoding, bytes, registered FROM register`);
    const out = { total: rows.length, live: 0, superseded: 0, historical: 0, orphan: 0, unresolved: [] };
    for (const r of rows) {
      if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, r.bundle_id)) {
        out.orphan++; out.unresolved.push({ ...r, class: "orphan" }); continue;
      }
      const here = this.#one(`SELECT sha256 FROM files WHERE bundle_id=? AND path=?`, r.bundle_id, r.path);
      if (here && here.sha256 === r.capture_sha) { out.live++; continue; }
      if (this.#one(`SELECT sha256 FROM history WHERE bundle_id=? AND sha256=? LIMIT 1`, r.bundle_id, r.capture_sha)) {
        out.historical++; continue;
      }
      if (here) { out.superseded++; continue; }
      out.unresolved.push({ ...r, class: "unresolved" });
    }
    return { ok: true, ...out, needsCaptureProbe: out.unresolved.length };
  }

  /* ---- project participation, Architecture section 7 ----
   *
   * The evidence corpus stays shared: Information and Problems remain visible to
   * the group generally, because compartmenting evidence would fracture the
   * thing the record exists to be. What participation scopes is the group's
   * THINKING, which is the material with strategic value before publication.
   */
  #memberByHandle(handle) {
    return this.#one(`SELECT member_id, handle, status FROM members WHERE handle=?`, handle);
  }
/* Membership Architecture v2 section 7: authority over a project belongs to its
   OWNERS, and to nobody else. An administrator sees every project (7.3, 7.8) and
   directs none of them (v2 4.9), the single exception being 7.13, which is not
   built yet.

   This REVERSES v1.4 7.7, which gave removal to administrators and denied it to
   owners, in those words, reasoning from Design Requirement 1 that authority
   over people belongs to the custodial role. v2 reasons instead that
   participation in a project is a working relationship rather than a membership
   one, and the people who can judge it are the people doing the work. Authority
   over MEMBERSHIP itself is untouched and stays custodial.

   In one helper so the two call sites cannot drift apart, which is how the
   admin bypass came to sit on invite and remove with different shapes. */
  #isProjectOwner(projectId, memberId) {
    const p = this.#participation(projectId, memberId);
    return !!(p && p.owner);
  }

  #participation(projectId, memberId) {
    return this.#one(`SELECT state, owner FROM project_participants WHERE project_id=? AND member_id=?`,
      projectId, memberId);
  }
  #isAdminMember(memberId) {
    if (memberId === Store.ROOT_ADMIN) return true;
    const m = this.#one(`SELECT role, status FROM members WHERE member_id=?`, memberId);
    return !!m && m.role === "admin" && m.status === "active";
  }

  /** 7.1: the creator is the owner. Called when a project bundle is promoted by
   *  an identified member; a project created by a machine credential has no
   *  owner row, which is honest rather than inventing one. */
  projectClaimOwner({ projectId, memberId } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (this.#one(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1`, projectId))
      return { ok: false, reason: "OWNED" };
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO project_participants (project_id,member_id,state,owner,invited_by,created,updated)
       VALUES (?,?,'joined',1,NULL,?,?)`, projectId, memberId, now, now);
    return { ok: true, projectId, owner: memberId };
  }

  /** 7.2: the owner invites by handle. Administrators may also invite, because
   *  7.7 already gives them authority over participation. */
  projectInvite({ projectId, handle, by } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (!this.#isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project invites participants to it. An administrator sees "
                     + "every project and directs none of them." };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };
    if (this.#participation(projectId, target.member_id))
      return { ok: false, reason: "ALREADY_A_PARTICIPANT", handle };
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO project_participants (project_id,member_id,state,owner,invited_by,created,updated)
       VALUES (?,?,'invited',0,?,?,?)`, projectId, target.member_id, by, now, now);
    return { ok: true, projectId, handle, state: "invited" };
  }

  /** 7.4: joining is selecting the checkbox. There is no acceptance ceremony. */
  projectJoin({ projectId, by } = {}) {
    const p = this.#participation(projectId, by);
    if (!p) return { ok: false, reason: "NOT_INVITED",
      detail: "a member joins a project they were invited to. Being uninvited is not a refusal you can see." };
    this.sql.exec(`UPDATE project_participants SET state='joined', comment=NULL, updated=? WHERE project_id=? AND member_id=?`,
      new Date().toISOString(), projectId, by);
    return { ok: true, projectId, state: "joined" };
  }

  /** 7.6: unchecking the box is a REQUEST to leave. It greys the checkmark and
   *  removes nobody, because 7.7 gives removal to administrators alone. */
  projectLeave({ projectId, by, comment = null } = {}) {
    const p = this.#participation(projectId, by);
    if (!p) return { ok: false, reason: "NOT_A_PARTICIPANT" };
    if (p.state !== "joined") return { ok: false, reason: "NOT_JOINED", state: p.state };
    const c = comment === null ? null : String(comment).slice(0, 280);
    this.sql.exec(`UPDATE project_participants SET state='leaving', comment=?, updated=? WHERE project_id=? AND member_id=?`,
      c, new Date().toISOString(), projectId, by);
    return { ok: true, projectId, state: "leaving", comment: c,
             detail: "recorded as a request to leave. An administrator removes participants; this does not." };
  }

  /** 7.7: only an administrator removes a participant, request outstanding or
   *  not. Project owners invite; they do not remove. That keeps authority over
   *  people with the custodial role rather than distributing it into content
   *  work. */
  projectRemove({ projectId, handle, by, comment = null } = {}) {
    if (!this.#isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project removes a participant from it. This REVERSES the "
                     + "earlier rule, under which an administrator removed and an owner could not." };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    const p = this.#participation(projectId, target.member_id);
    if (!p) return { ok: false, reason: "NOT_A_PARTICIPANT", handle };
    if (p.owner) return { ok: false, reason: "OWNER",
      detail: "an owner is not removed from a project by this action. Ownership changes by the section "
            + "7.10 process, and removal from the project follows once they are no longer an owner." };
    this.sql.exec(`DELETE FROM project_participants WHERE project_id=? AND member_id=?`, projectId, target.member_id);
    return { ok: true, projectId, handle, removed: true, comment: comment === null ? null : String(comment).slice(0, 280) };
  }

  /** 7.10 addition. The sole owner may add a second unilaterally; every addition
   *  past that needs the consensus of ALL existing owners.
   *
   *  Consensus on addition is the load-bearing half, exactly as in 4.7. Without
   *  it one owner recruits confederates and manufactures the majority that then
   *  removes the others, and closing that door is what makes removal safe. */
  projectOwnerAdd({ projectId, handle, by } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (!this.#isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project may propose another owner of it" };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };
    const p = this.#participation(projectId, target.member_id);
    if (!p) return { ok: false, reason: "NOT_A_PARTICIPANT",
      detail: "an owner is a joined participant with the owner flag, so invite and admit them first" };
    if (p.owner) return { ok: false, reason: "ALREADY_AN_OWNER", handle };

    const owners = this.#owners(projectId);
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO project_owner_votes (project_id,kind,target,voter,reason,created)
       VALUES (?,'add',?,?,NULL,?)`, projectId, target.member_id, by, now);

    /* The sole owner acts alone. Past that, every existing owner must have
       voted, and votes from members who are no longer owners do not count. */
    if (owners.length > 1) {
      const have = this.#rows(
        `SELECT voter FROM project_owner_votes WHERE project_id=? AND kind='add' AND target=?`,
        projectId, target.member_id).map((r) => r.voter).filter((v) => owners.includes(v));
      const awaiting = owners.filter((o) => !have.includes(o));
      if (awaiting.length)
        return { ok: false, reason: "CONSENSUS_REQUIRED", projectId, handle,
                 have: have.sort(), awaiting: awaiting.sort(),
                 detail: "every existing owner must agree to an addition beyond the second" };
    }
    this.sql.exec(
      `UPDATE project_participants SET owner=1, state='joined', updated=? WHERE project_id=? AND member_id=?`,
      now, projectId, target.member_id);
    this.sql.exec(`DELETE FROM project_owner_votes WHERE project_id=? AND kind='add' AND target=?`,
      projectId, target.member_id);
    return { ok: true, projectId, handle, owner: true, owners: this.#owners(projectId) };
  }

  /** 7.13: the ONE participation power an administrator has, and its condition.
   *
   *  Only owners manage participation and lifecycle, and administrators may
   *  deactivate members. Those two rules together strand a project: an
   *  administrator can end the access of a project's only owner and then be
   *  unable to touch the project, which accepts no new participants, cannot be
   *  reactivated, and cannot change hands.
   *
   *  THE CONDITION IS EVERY OWNER, NOT ANY OWNER, and it cannot be manufactured
   *  piecemeal: an administrator cannot reach a live project by deactivating one
   *  inconvenient person. Reaching a project with an administrator among its
   *  owners additionally requires the 4.7 vote, per 4.9.
   *
   *  IT ADDS RATHER THAN REPLACES. The inactive owners keep their rows, so if
   *  one is later reactivated they are an owner again ALONGSIDE the added one,
   *  and removing them is then the ordinary 7.10 process. Nothing about this
   *  exception strips anyone, which is what keeps it from becoming a route
   *  around 7.10. The narrower alternative, that deactivation vacates ownership
   *  outright, was considered and rejected in v2: it makes a member's
   *  deactivation silently destroy project state, and hands administrators a way
   *  to empty a project's ownership one member at a time. */
  projectOwnerRescue({ projectId, handle, by, reason } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (!this.#isAdminMember(by))
      return { ok: false, reason: "ADMIN_ONLY",
               detail: "this is the single exception to administrators holding no authority over projects, "
                     + "and it is an administrator's to use" };
    const owners = this.#owners(projectId);
    if (!owners.length)
      return { ok: false, reason: "NO_OWNERS",
               detail: "this project has no owner rows at all, which is a project created by a machine "
                     + "credential rather than a stranded one" };
    /* EVERY owner, not any. */
    const active = owners.filter((o) => {
      const m = this.#one(`SELECT status FROM members WHERE member_id=?`, o);
      return m && m.status === "active";
    });
    if (active.length)
      return { ok: false, reason: "OWNERS_ARE_ACTIVE", active: active.sort(),
               detail: "an administrator may add an owner only when EVERY owner of the project is inactive. "
                     + "While one is active the project is theirs to run, and 7.10 is the route." };
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "authority changes are recorded with a reason" };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };

    const now = new Date().toISOString();
    /* Recorded, and visible to every participant, like every other authority
       change. Reuses the 7.10 vote log with its own kind so the project's
       ownership history reads in one place. */
    this.sql.exec(
      `INSERT OR REPLACE INTO project_owner_votes (project_id,kind,target,voter,reason,created)
       VALUES (?,'rescue',?,?,?,?)`, projectId, target.member_id, by, why, now);
    this.sql.exec(
      `INSERT INTO project_participants (project_id,member_id,state,owner,invited_by,comment,created,updated)
       VALUES (?,?,'joined',1,?,?,?,?)
       ON CONFLICT(project_id,member_id) DO UPDATE SET owner=1, state='joined', updated=excluded.updated`,
      projectId, target.member_id, by, why, now, now);
    return { ok: true, projectId, handle, by, reason: why, owner: true,
             owners: this.#owners(projectId), addedNotReplaced: true,
             detail: "the inactive owners keep their rows. If one is reactivated they are an owner again "
                   + "alongside this one, and removing them is then the ordinary 7.10 process." };
  }

  /** 7.10 removal. A majority of all owners, the target in the denominator and
   *  not voting, EXCEPT at exactly two owners where both must agree and the
   *  target is one of them. The floor is one owner. */
  projectOwnerRemove({ projectId, handle, by, reason } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (!this.#isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project votes on its ownership" };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (!this.#isProjectOwner(projectId, target.member_id))
      return { ok: false, reason: "NOT_AN_OWNER", handle };
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "ownership changes are recorded with a reason" };

    const owners = this.#owners(projectId);
    const math = Store.ownerMath(owners.length);
    if (!math.possible)
      return { ok: false, reason: "LAST_OWNER", ...math,
               detail: "one owner is the floor, so the last owner of a project is not removable. Add "
                     + "another owner first, or deactivate the project (7.11)." };
    /* At three and above the target does not vote. At two they must, which is
       the whole divergence from 4.7 and the reason ownerMath exists separately. */
    if (!math.targetMayVote && by === target.member_id)
      return { ok: false, reason: "TARGET_CANNOT_VOTE", ...math,
               detail: "the target is counted in the denominator but does not vote" };

    if (this.#one(
      `SELECT voter FROM project_owner_votes WHERE project_id=? AND kind='remove' AND target=? AND voter=?`,
      projectId, target.member_id, by))
      return { ok: false, reason: "ALREADY_VOTED", by };
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES (?,'remove',?,?,?,?)`,
      projectId, target.member_id, by, why, now);

    const votes = this.#rows(
      `SELECT voter FROM project_owner_votes WHERE project_id=? AND kind='remove' AND target=?`,
      projectId, target.member_id)
      .map((r) => r.voter)
      .filter((v) => owners.includes(v) && (math.targetMayVote || v !== target.member_id));
    if (votes.length < math.votesNeeded)
      return { ok: false, reason: "VOTES_SHORT", projectId, handle,
               have: votes.length, need: math.votesNeeded, ...math, deciders: votes.sort() };

    /* Carried. They stay a PARTICIPANT: 7.10 says removing ownership leaves
       them on the project, and removing them from it entirely is then 7.7. */
    this.sql.exec(`UPDATE project_participants SET owner=0, updated=? WHERE project_id=? AND member_id=?`,
      now, projectId, target.member_id);
    this.sql.exec(`DELETE FROM project_owner_votes WHERE project_id=? AND kind='remove' AND target=?`,
      projectId, target.member_id);
    return { ok: true, projectId, handle, owner: false, stillAParticipant: true,
             owners: this.#owners(projectId), deciders: votes.sort() };
  }

  /** 7.12: any JOINED participant may fork a project, creating a clone.
   *
   *  JOINED and not merely invited. An invited participant sees the SKELETON
   *  only (7.9): the Problems, the Information and the Actions, and none of the
   *  project's content, analysis record, work product or evaluations. A fork by
   *  such a member would either copy material they cannot read, which leaks it,
   *  or copy only what they can see, which is a different and lesser operation
   *  wearing the same name. Restricting it makes the leak impossible rather than
   *  managed.
   *
   *  THE FORKER MUST HOLD create_projects. A fork creates a project, and without
   *  this any participant creates projects they were not trusted to create,
   *  which is the capability defeated by a button. The capability is checked at
   *  the control plane, where the session is, and passed in here as a settled
   *  fact rather than re-derived.
   *
   *  THE CLONE CARRIES NO OTHER PARTICIPANTS. Copying the roster would let a
   *  forker manufacture visibility for people the original's owners chose, which
   *  is 7.3 defeated the same way.
   *
   *  Origin is recorded as `derived_from`, already in the closed relationship
   *  vocabulary of State Rules 5.1, so nothing is added to it. */
  forkProject({ projectId, newId, title, by } = {}) {
    const b = this.#one(`SELECT object_type, current_state FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    const p = this.#participation(projectId, by);
    if (!p) return { ok: false, reason: "NOT_A_PARTICIPANT",
      detail: "a project is forked by someone working on it. An uninvited member cannot see that it exists." };
    if (p.state !== "joined") return { ok: false, reason: "NOT_JOINED", state: p.state,
      detail: "an invited member who has not joined sees the project's skeleton only, so there is nothing "
            + "for them to fork. Join it first." };
    if (!newId || typeof newId !== "string") return { ok: false, reason: "MALFORMED", detail: "newId is required" };
    if (this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, newId))
      return { ok: false, reason: "EXISTS", bundleId: newId };

    /* 7.1: a project's name is unique across the instance, compared
       case-insensitively with runs of whitespace collapsed. A plain unique index
       over the trimmed string is how HANDLES work and would let "Sewer Fund" and
       "Sewer fund" coexist, which is the collision the rule exists to stop. Held
       across every lifecycle state, deactivated projects included, because a
       deactivated project is still cited and its name must still resolve to what
       was cited. */
    const want = Store.projectNameKey(title);
    if (!want) return { ok: false, reason: "NO_TITLE", detail: "a fork needs a name of its own" };
    const clash = this.#rows(`SELECT bundle_id, title FROM bundles WHERE object_type='project'`)
      .find((r) => Store.projectNameKey(r.title) === want);
    if (clash) return { ok: false, reason: "NAME_TAKEN", bundleId: clash.bundle_id, title: clash.title,
      detail: "a project by that name already exists on this instance, and project names are unique. "
            + "This holds for deactivated projects too, because their names are still cited." };
    /* The clone is a real bundle, written through `promote` like every other
       write, so it passes the same gate and lands in the same history. Composed
       here rather than left to the caller: a fork the caller has to assemble is
       a fork every caller assembles slightly differently. */
    const liveMd = this.#one(
      `SELECT content, bundle_sha FROM files f JOIN bundles b ON b.bundle_id=f.bundle_id
       WHERE f.bundle_id=? AND f.path='bundle.md'`, projectId);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", detail: "the origin has no readable bundle.md to fork" };

    const when = new Date().toISOString();
    /* THE ORIGIN EDGE, written into the document and not merely reported.
       The first version of this method returned `rel: "derived_from"` and never
       wrote it, and the suite asserted the returned literal rather than the
       record, so a fork with no provenance passed. `derived_from` is already in
       the closed relationship vocabulary of State Rules 5.1, so nothing is added
       to it, and refs projects the edge from frontmatter like any other. */
    const withEdge = Store.#spliceReferences(liveMd.content,
      [{ rel: "derived_from", target: projectId, status: "confirmed", note: `forked by ${by}` }]);
    if (!withEdge)
      return { ok: false, reason: "UNSPLICEABLE_REFERENCES", projectId,
               detail: "the origin's references block is not in a shape this grammar can extend in place, "
                     + "so the clone could not be given a recorded origin. A fork with no provenance is "
                     + "not written." };
    let text = withEdge;
    text = Store.#setScalar(text, "id", newId);
    text = Store.#setScalar(text, "title", JSON.stringify(title));
    /* A fork starts at the beginning of the lifecycle regardless of where the
       origin had got to. Inheriting `matured` would claim a readiness the clone
       has not earned, and inheriting `closed` would create a project born
       deactivated. */
    text = Store.#setScalar(text, "current_state", "forming");
    text = Store.#setScalar(text, "last_updated", `"${when}"`);
    const entry = `### Session ${when} | forked from ${projectId} | ${by}\n`
                + `Trigger: fork\n`
                + `Changes: created as a clone of ${projectId}, recorded as a derived_from reference. `
                + `Participants were NOT copied.\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cut = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
    }

    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, projectId))
      carried.push(r.content !== null
        ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
        : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

    const fbytes = new TextEncoder().encode(text);
    const promoted = this.promote({
      bundleId: newId, base: null, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
      author: by, ownerMemberId: by,
      files: [{ path: "bundle.md", text, bytes: fbytes.length,
                sha256: createSha256().update(fbytes).hex() }, ...carried],
      meta: { object_type: "project", group: "believe-in-oakland", title,
              current_state: "forming", created: when, last_updated: when },
    });
    if (!promoted.ok) return promoted;
    return { ok: true, projectId, newId, title, origin: projectId, rel: "derived_from",
             owner: by, participantsCopied: 0, bundleSha: promoted.bundleSha };
  }

  /** The comparison key for 7.1 project name uniqueness, in one place so the
   *  fork check and any later write-path check cannot disagree about it. */
  static projectNameKey(title) {
    return String(title ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  /* ---- section 8: secure verified export ----
   *
   * Export is the only real answer to a captured root of trust, because a group
   * that cannot leave is a group that can be held. It is also exactly the
   * capability an attacker wants most: a full working-corpus export is the
   * group's entire unpublished position, so if ANY administrator could take it,
   * one captured administrator exfiltrates everything and the feature becomes
   * the most efficient attack in the system.
   *
   * WHO MAY RUN IT is enforced in the control plane, not here, because that is
   * where the credential class is known. The rule is sharper than "an
   * administrator": section 8.1 says the ADMIN_TOKEN-class credential, which a
   * SESSION belonging to an administrator does not satisfy. A session is
   * password-derived; the root of trust is the token set in the hosting
   * dashboard. A stolen password must not reach this, and neither does the
   * founder's own signed-in browser.
   *
   * WHAT "VERIFIED" MEANS: the export carries its own manifest, every file
   * hashed on the way out, so the receiving side can re-derive everything and
   * trust nothing the sender asserts. */
  exportManifest({ note = null } = {}) {
    const bundles = this.#rows(
      `SELECT bundle_id, object_type, title, current_state, bundle_sha, row_version, created, last_updated
       FROM bundles ORDER BY bundle_id`);
    let fileCount = 0;
    const out = bundles.map((b) => {
      const files = this.#rows(
        `SELECT path, sha256, bytes, blob_sha, (content IS NOT NULL) AS inline
         FROM files WHERE bundle_id=? ORDER BY path`, b.bundle_id);
      fileCount += files.length;
      return { ...b,
        files: files.map((f) => ({ path: f.path, sha256: f.sha256, bytes: f.bytes,
                                   blobSha: f.blob_sha ?? null, inline: !!f.inline })),
        /* The manifest chain and the base links, so the receiving side can
           re-derive the chain rather than believe it. `history` holds the
           snapshotted FILES; `manifest` holds the promotion records that link
           them, which is what a chain check actually walks. */
        promotions: this.#rows(
          `SELECT snap_key, kind, base, author, created, writer, operation
           FROM manifest WHERE bundle_id=? ORDER BY created`, b.bundle_id),
        snapshots: this.#rows(
          `SELECT snap_key, path, sha256, created FROM history WHERE bundle_id=? ORDER BY snap_key, path`,
          b.bundle_id),
        refs: this.#rows(`SELECT target_id, kind FROM refs WHERE bundle_id=?`, b.bundle_id),
      };
    });
    const at = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO export_log (at,scope,bundles,files,note) VALUES (?,'working-corpus',?,?,?)`,
      at, bundles.length, fileCount, note ? String(note).slice(0, 280) : null);
    return { ok: true, at, scope: "working-corpus",
      bundles: out,
      counts: { bundles: bundles.length, files: fileCount },
      register: this.#rows(`SELECT bundle_id, path, capture_sha, bytes FROM register ORDER BY bundle_id`),
      recorded: "this export is in the append-only export log and is visible to every administrator",
      verify: "every file carries its sha256 and every bundle its history chain and base links. Re-derive "
            + "them on the way in and byte-compare every registered capture; trust nothing this manifest "
            + "asserts about itself." };
  }

  /** The log, readable by in-app administrators who cannot run an export. */
  exportLog() {
    return { ok: true, exports: this.#rows(
      `SELECT seq, at, scope, bundles, files, note FROM export_log ORDER BY seq DESC LIMIT 200`) };
  }

  /** 8.2: published-record reconstruction, requiring NOTHING.
   *
   *  Published material is content-addressed and its hashes are public, so any
   *  member or any stranger can rebuild and independently verify the published
   *  record without the cooperation, permission, or continued existence of the
   *  instance it came from. Nothing can be withheld here by construction.
   *
   *  READS THE PUBLISHED PROJECTION ONLY. That is the entire safety of an open
   *  endpoint: working material is never consulted, so there is nothing to leak,
   *  exactly as op=verify already works. */
  publishedManifest() {
    return { ok: true, scope: "published",
      published: this.#rows(
        `SELECT p.bundle_id, p.edition, p.title, p.bundle_sha, p.ratified_at, p.attestor_key,
                p.gate_version, p.manifest_sha, p.manifest
         FROM published_bundles p ORDER BY p.bundle_id, p.edition`),
      shas: this.#rows(
        `SELECT sha256, bundle_id, path, kind, bytes, published FROM published_shas ORDER BY published`),
      detail: "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
            + "instance's cooperation or continued existence. Nothing unpublished appears, by construction: "
            + "this reads the published projection and never the working corpus." };
  }

  /* ---- section 1.3: declared expertise, confirmed licenses ----
   *
   * TWO CLAIMS BY TWO PEOPLE, kept apart for the same reason the intake doctrine
   * keeps who ISSUED a document separate from how faithfully it was CAPTURED.
   * The member says what they hold. An administrator says whether the group has
   * satisfied itself that they hold it. Neither stands in for the other.
   *
   * WRITE AUTHORITY IS SPLIT BY COLUMN. A member writes `label` and never the
   * confirmation events; an administrator writes the confirmation events and can
   * never introduce a label the member did not declare. That is what keeps
   * confirmation a confirmation rather than an assignment.
   *
   * AND IT GATES NOTHING. An unconfirmed entry costs its holder no capability,
   * no visibility and no access. It appears in no session, is consulted by no
   * op, and must never enter the enforcement path. Section 5 in v2: it informs
   * humans; it gates nothing, confirmed or not. */
  static #normLabel(label) {
    return String(label ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  }

  #expertiseState(memberId, label) {
    const r = this.#one(
      `SELECT event, actor, created FROM member_expertise WHERE member_id=? AND label=?
       ORDER BY seq DESC LIMIT 1`, memberId, label);
    return r ? r.event : null;
  }

  /** The member's own statement about themselves. */
  expertiseDeclare({ memberId, label } = {}) {
    const m = this.#one(`SELECT member_id, status FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.status !== "active") return { ok: false, reason: "NOT_ACTIVE" };
    const lab = Store.#normLabel(label);
    if (!lab) return { ok: false, reason: "NO_LABEL", detail: "a declaration needs a label, such as 'CPA'" };
    const cur = this.#expertiseState(memberId, lab);
    if (cur === "declared" || cur === "confirmed")
      return { ok: false, reason: "ALREADY_DECLARED", label: lab, state: cur };
    this.sql.exec(
      `INSERT INTO member_expertise (member_id,label,event,actor,created) VALUES (?,?,'declared',?,?)`,
      memberId, lab, memberId, new Date().toISOString());
    return { ok: true, memberId, label: lab, state: "declared", confirmed: false,
             detail: "declared and unconfirmed, which costs nothing: an unconfirmed entry carries the same "
                   + "capabilities, visibility and access as a confirmed one" };
  }

  /** An administrator vouching, INCLUDING for another administrator (4.9). */
  expertiseConfirm({ memberId, label, by, withdraw = false } = {}) {
    if (!this.#isAdminMember(by))
      return { ok: false, reason: "ADMIN_ONLY",
               detail: "an administrator confirms a declared license, and may do so for another "
                     + "administrator: vouching for someone is the same act whoever they are" };
    const m = this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    const lab = Store.#normLabel(label);
    const cur = this.#expertiseState(memberId, lab);
    /* An administrator cannot introduce a label. Confirming something never
       declared would make this an assignment rather than a confirmation, and the
       whole point of 1.3 is that the two statements have two different authors. */
    if (cur === null)
      return { ok: false, reason: "NOT_DECLARED", label: lab,
               detail: "this member has not declared that. An administrator confirms what a member claims "
                     + "and never introduces the claim, or it would be an assignment rather than a "
                     + "confirmation." };
    if (!withdraw && cur === "confirmed") return { ok: false, reason: "ALREADY_CONFIRMED", label: lab };
    if (withdraw && cur !== "confirmed") return { ok: false, reason: "NOT_CONFIRMED", label: lab, state: cur };
    /* Supersede, never overwrite: the earlier confirmation stays readable. */
    this.sql.exec(
      `INSERT INTO member_expertise (member_id,label,event,actor,created) VALUES (?,?,?,?,?)`,
      memberId, lab, withdraw ? "withdrawn" : "confirmed", by, new Date().toISOString());
    return { ok: true, memberId, label: lab, state: withdraw ? "withdrawn" : "confirmed",
             confirmed: !withdraw, by };
  }

  /** The roster view: current state per label, with the history behind it. */
  expertiseList({ memberId } = {}) {
    const rows = this.#rows(
      `SELECT seq, label, event, actor, created FROM member_expertise WHERE member_id=? ORDER BY seq`,
      memberId);
    const cur = new Map();
    for (const r of rows) cur.set(r.label, r);
    return { ok: true, memberId,
      expertise: [...cur.values()].map((r) => ({
        label: r.label, state: r.event, confirmed: r.event === "confirmed",
        by: r.actor, at: r.created,
        /* Both are surfaced so an interface can show WHICH of the two claims it
           is looking at, which is the entire function of the distinction. */
        history: rows.filter((h) => h.label === r.label)
          .map((h) => ({ event: h.event, actor: h.actor, at: h.created })),
      })).sort((a, b) => a.label.localeCompare(b.label)),
      gates: "nothing" };
  }

  /** 7.8: every participant sees the handles of all other participants, and an
   *  administrator sees all of them. A non-participant sees nothing, and is told
   *  the same thing whether the project exists or not, because 7.9 says an
   *  uninvited member cannot see that a project EXISTS. */
  projectParticipants({ projectId, by } = {}) {
    const mine = this.#participation(projectId, by);
    if (!mine && !this.#isAdminMember(by))
      return { ok: false, reason: "NO_SUCH_PROJECT",
               detail: "no project by that identifier is visible to you. An uninvited member cannot see "
                     + "that a project exists, so this is the same answer as for one that does not." };
    return { ok: true, projectId, participants: this.#rows(
      `SELECT m.handle, p.state, p.owner, p.comment, p.created
       FROM project_participants p JOIN members m ON m.member_id = p.member_id
       WHERE p.project_id=? ORDER BY p.owner DESC, m.handle`, projectId) };
  }

  /* ---- the membership model's member half, Architecture sections 3 to 6 ----
   *
   * The arithmetic of section 4.7 lives in ONE place, `adminArithmetic`, and
   * every rule below reads it rather than restating it. The table in the
   * architecture document is the specification and `test/membership.test.mjs`
   * asserts it row by row, because this is the part of the design that is cheap
   * to get subtly wrong and expensive to discover wrong.
   */
  static CAPABILITIES = ["contribute", "publish", "create_projects"];

  /** Removal takes a MAJORITY OF ALL ADMINISTRATORS, counting the target in the
   *  denominator but not letting them vote, and ties do not eject.
   *
   *  That one sentence is what makes removal impossible at two without needing a
   *  special case, demands unanimity while the group is small enough for
   *  unanimity to be reasonable, and loosens as the group grows. A lone captured
   *  administrator can never eject anyone at any size. It fails only to a
   *  colluding majority, and nothing survives a colluding majority. */
  static adminMath(n) {
    const votesNeeded = Math.floor(n / 2) + 1;
    const eligibleVoters = Math.max(0, n - 1);
    return { administrators: n, votesNeeded, eligibleVoters, possible: votesNeeded <= eligibleVoters };
  }

  /* Section 7.10. Ownership of a project is a SET, and it follows 4.7 with one
     deliberate divergence and one relaxed floor.
   *
   * DO NOT REUSE adminMath HERE. It diverges at exactly one row, n=2, and that
   * row is the one a shared implementation gets wrong by reuse.
   *
   * For administrators, removal at two is IMPOSSIBLE and the impossibility is
   * the point: it stops a capture at the smallest size, and 4.2's floor of two
   * means a group never has to go below it. Projects have a floor of ONE, so if
   * removal at two were impossible the floor would be reachable only by never
   * adding a second owner, and a second owner would be permanent.
   *
   * At two, the target MAY vote, so removal is unanimity including them. That
   * describes what the act actually is at that size: one owner resigning with
   * the other's assent. It opens nothing, because the only removal it permits is
   * one the target has agreed to, and a hostile removal at two stays impossible
   * exactly as in 4.7. */
  static ownerMath(n) {
    if (n <= 1)
      return { owners: n, votesNeeded: 0, eligibleVoters: 0, targetMayVote: false, possible: false,
               why: "one owner is the floor, so the last owner is not removable" };
    if (n === 2)
      return { owners: 2, votesNeeded: 2, eligibleVoters: 2, targetMayVote: true, possible: true,
               why: "both owners must agree, the departing one included: resignation with the other's assent" };
    const votesNeeded = Math.floor(n / 2) + 1;
    const eligibleVoters = n - 1;
    return { owners: n, votesNeeded, eligibleVoters, targetMayVote: false,
             possible: votesNeeded <= eligibleVoters,
             why: "a majority of all owners, the target counted in the denominator and not voting" };
  }

  /** REC-30: the TABLE is arithmetic and belongs to everyone. The LIVE arm reads
   *  a named project's owner count, and an owner count is existence: asking for
   *  a project nobody invited you to would have answered `owners: 3` where an
   *  invented id answers `owners: 0`, which is precisely the "not even that it
   *  exists" 7.9 forbids. Gated through the ONE compilation point (`#viewerSees`,
   *  which is false for an absent bundle AND for an invisible one), so an
   *  invisible project now answers exactly what a nonexistent one answers —
   *  ownerMath(0) — rather than a refusal that would itself be a signal. */
  projectOwnerArithmetic({ projectId, viewer = null } = {}) {
    const table = [];
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) table.push(Store.ownerMath(n));
    const live = projectId
      ? Store.ownerMath(this.#viewerSees(projectId, viewer) ? this.#owners(projectId).length : 0)
      : null;
    return { ok: true, table, live, projectId: projectId ?? null };
  }

  #owners(projectId) {
    return this.#rows(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1`, projectId)
      .map((r) => r.member_id).sort();
  }

  /** The table, computed rather than transcribed, so the code and the document
   *  cannot drift. Exposed as an op because a UI must be able to tell a group
   *  what it would take BEFORE they start a removal. */
  adminArithmetic() {
    const table = [];
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) table.push(Store.adminMath(n));
    return { ok: true, table, live: Store.adminMath(this.#activeAdmins().length) };
  }

  /* Who counts as an administrator.
   *
   * The FOUNDING administrator has no members row. They claimed the instance by
   * spending ADMIN_TOKEN, which is what 4.1 describes: the solo participant is
   * the administrator, and the whole membership apparatus stays invisible until
   * a second person exists. Counting only member rows made a claimed instance
   * with one invited administrator look like a group of one, so the second
   * invitation was issued unilaterally when it should have needed consensus.
   * Found by the existing members suite failing, not by the new one.
   *
   * The founder is named `admin`, the credentials role they hold, and they
   * cannot be removed by vote: per 4.6 the holders of ADMIN_TOKEN are the root
   * of trust and every rule in the membership model sits beneath them.
   * Membership does not and cannot constrain them, and an interface that
   * implied otherwise would be lying. */
  static ROOT_ADMIN = "admin";

  #activeAdmins() {
    const rows = this.#rows(`SELECT member_id FROM members WHERE role='admin' AND status='active'`)
      .map((r) => r.member_id);
    const claimed = !!this.#one(`SELECT role FROM credentials WHERE role=?`, Store.ROOT_ADMIN);
    return claimed ? [Store.ROOT_ADMIN, ...rows] : rows;
  }

  #capsOf(row) {
    try { const v = JSON.parse(row.capabilities || "[]"); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }

  /** Set a member's capabilities. NOT a route to administrator status: that is
   *  granted and removed only by the section 4 process, and 4.4 says no
   *  administrator may strip another, so this refuses to touch either side of
   *  that line. */
  memberCaps({ memberId, capabilities } = {}) {
    const m = this.#one(`SELECT member_id, role FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    const want = Array.isArray(capabilities) ? capabilities : null;
    if (!want) return { ok: false, reason: "BAD_CAPABILITY", detail: "capabilities is an array" };
    if (want.includes("administer") || m.role === "admin")
      return { ok: false, reason: "NOT_A_CAPABILITY_GRANT",
               detail: "administrator status is granted and removed only by the section 4 process, never by "
                     + "editing a field. 4.4: no administrator may strip another." };
    const bad = want.filter((c) => !Store.CAPABILITIES.includes(c));
    if (bad.length) return { ok: false, reason: "BAD_CAPABILITY", got: bad, known: Store.CAPABILITIES };
    this.sql.exec(`UPDATE members SET capabilities=?, updated=? WHERE member_id=?`,
      JSON.stringify(want), new Date().toISOString(), memberId);
    return { ok: true, memberId, capabilities: want };
  }

  /** Endorse a proposed administrator. Addition above the second requires the
   *  CONSENSUS of every existing administrator, and that is the load-bearing
   *  half of 4.7: without it a captured administrator recruits confederates and
   *  manufactures the majority that ejects the honest ones. */
  async adminEndorse({ memberId, by } = {}) {
    const m = this.#one(`SELECT member_id, status, role FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.status !== "proposed") return { ok: false, reason: "NOT_PROPOSED", status: m.status };
    const admins = this.#activeAdmins();
    if (!by || !admins.includes(by)) return { ok: false, reason: "NOT_AN_ADMIN", by };
    const now = new Date().toISOString();
    this.sql.exec(`INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,?,?)`,
      memberId, by, null, now);
    const have = this.#rows(`SELECT voter FROM admin_votes WHERE kind='add' AND target=?`, memberId)
      .map((r) => r.voter).filter((v) => admins.includes(v));
    const awaiting = admins.filter((a) => !have.includes(a));
    if (awaiting.length)
      return { ok: false, reason: "CONSENSUS_REQUIRED", memberId, have: have.sort(), awaiting: awaiting.sort(),
               detail: "every existing administrator must endorse an addition beyond the second" };
    /* Consensus reached: the invitation is issued now, and the plaintext code
       appears exactly once, here, as it does for any other invitation. */
    const invite = Store.#rand(16);
    const hash = await Store.#sha256(invite);
    this.sql.exec(`UPDATE members SET status='invited', invite_hash=?, updated=? WHERE member_id=?`,
      hash, now, memberId);
    return { ok: true, memberId, invite, endorsedBy: have.sort() };
  }

  /** Vote to remove an administrator. Section 4.7. */
  adminRemove({ memberId, by, reason } = {}) {
    /* The founding administrator is the root of trust (4.6) and is not
       removable by the membership model, because the membership model runs on
       an instance they control. Saying so plainly is an obligation of 4.6: no
       interface may describe the administrator model as though it bounds this
       power, because it does not. The escape hatch in the other direction is
       replacing ADMIN_TOKEN in the hosting dashboard, which returns the
       instance to unclaimed. */
    if (memberId === Store.ROOT_ADMIN)
      return { ok: false, reason: "ROOT_OF_TRUST",
               detail: "the founding administrator holds ADMIN_TOKEN and cannot be removed from inside the "
                     + "application. Whoever can set ADMIN_TOKEN can take the group over, and there is no "
                     + "arrangement in which nobody holds that power, because the instance runs in somebody's "
                     + "hosting account. The remedy is at the hosting account, not here (section 4.6)." };
    const m = this.#one(`SELECT member_id, role, status FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.role !== "admin") return { ok: false, reason: "NOT_AN_ADMIN", detail: "this member is not an administrator" };
    const admins = this.#activeAdmins();
    if (memberId === by) return { ok: false, reason: "TARGET_CANNOT_VOTE",
      detail: "the target is counted in the denominator but does not vote" };
    if (!by || !admins.includes(by)) return { ok: false, reason: "NOT_AN_ADMIN", by };
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "removals are recorded with a reason" };

    const math = Store.adminMath(admins.length);
    if (!math.possible)
      return { ok: false, reason: "IMPOSSIBLE_AT_TWO", ...math,
               detail: `removal takes ${math.votesNeeded} of ${math.administrators} administrators and only `
                     + `${math.eligibleVoters} may vote, so it cannot be carried. That is the rule working, not `
                     + `a defect: a lone administrator must never be able to eject the other.` };

    if (this.#one(`SELECT voter FROM admin_votes WHERE kind='remove' AND target=? AND voter=?`, memberId, by))
      return { ok: false, reason: "ALREADY_VOTED", by };
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO admin_votes (kind,target,voter,reason,created) VALUES ('remove',?,?,?,?)`,
      memberId, by, why, now);

    const votes = this.#rows(`SELECT voter, reason FROM admin_votes WHERE kind='remove' AND target=?`, memberId)
      .filter((v) => admins.includes(v.voter) && v.voter !== memberId);
    if (votes.length < math.votesNeeded)
      return { ok: false, reason: "VOTES_SHORT", memberId, have: votes.length, need: math.votesNeeded,
               ...math, deciders: votes.map((v) => v.voter).sort() };

    /* Carried. Revocation is immediate and takes sessions and signing keys with
       it, exactly as an ordinary revocation does. */
    this.sql.exec(`UPDATE members SET status='revoked', updated=? WHERE member_id=?`, now, memberId);
    this.sql.exec(`DELETE FROM sessions WHERE role=?`, `member:${memberId}`);
    this.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id=?`, memberId);
    return { ok: true, memberId, removed: true, ...math,
             deciders: votes.map((v) => v.voter).sort(), reasons: votes.map((v) => v.reason).filter(Boolean),
             alsoDo: "removing an administrator in the application is half of an ejection. The other half is "
                   + "rotating ADMIN_TOKEN and reviewing hosting-account membership (4.8)." };
  }

  async memberAdd({ memberId, cover, name, role = "member", capabilities = null,
                    expertise = null, by = null } = {}) {
    /* `name` is still read, because an older caller may send it, but the field
       is a cover and the response says so. */
    const label = typeof cover === "string" && cover.trim() ? cover : name;
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(memberId || ""))
      return { ok: false, reason: "BAD_MEMBER_ID", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    if (!label || typeof label !== "string")
      return { ok: false, reason: "NO_COVER",
               detail: "a cover is the label you use to tell participants apart; it need not be, and often should not be, a legal name" };
    if (this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "EXISTS", memberId };

    /* D-51. v1.4 let an administrator ASSIGN expertise when creating the
       invitation, and v2 1.3 forbids exactly that: a member declares what they
       hold and an administrator confirms it, and an administrator who could
       introduce the label would be making an assignment wearing a
       confirmation's name. Refused rather than ignored, because silently
       dropping a caller's argument is how the two copies drifted apart in the
       first place. */
    if (expertise !== null && expertise !== undefined)
      return { ok: false, reason: "EXPERTISE_IS_NOT_ASSIGNED",
               detail: "expertise is declared by the member and then confirmed by an administrator "
                     + "(section 1.3). It is not set when the invitation is created, because an "
                     + "administrator who could introduce the label would be assigning it rather than "
                     + "confirming it. Use op=expertisedeclare and op=expertiseconfirm." };

    const wantAdmin = role === "admin";
    const admins = this.#activeAdmins();
    /* 4.2 and 4.3. The FIRST invitation a group issues creates a second
       administrator, and the group cannot grow past the two-administrator floor
       in any other order. This satisfies Design Requirement 1 and Requirement 14
       at the earliest moment it is possible to satisfy them, and it is a refusal
       rather than a nudge because an ordinary member added first is a group with
       a single point of failure that nobody notices until it fails. */
    if (!wantAdmin && admins.length < 2)
      return { ok: false, reason: "ADMINS_FIRST", administrators: admins.length,
               detail: "the second member of a group must be an administrator, and there are no ordinary "
                     + "members until two exist. Administrative access is shared among at least two people "
                     + "so that losing one person does not lose the group." };

    const caps = Array.isArray(capabilities) ? capabilities.filter((c) => Store.CAPABILITIES.includes(c))
                                             : ["contribute"];
    const now = new Date().toISOString();

    /* 4.7 addition. The first administrator may add a second unilaterally,
       because a group of one has nobody to consult. Every subsequent addition
       needs the consensus of all existing administrators: without that, a
       captured administrator recruits confederates and manufactures the majority
       that ejects the honest ones. */
    if (wantAdmin && admins.length >= 2) {
      this.sql.exec(
        `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,expertise,created,updated)
         VALUES (?,?,NULL,'admin','proposed',NULL,?,?,?,?)`,
        memberId, label, JSON.stringify(caps), expertise ?? null, now, now);
      if (by && admins.includes(by))
        this.sql.exec(`INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,NULL,?)`,
          memberId, by, now);
      const have = this.#rows(`SELECT voter FROM admin_votes WHERE kind='add' AND target=?`, memberId)
        .map((r) => r.voter).filter((v) => admins.includes(v));
      return { ok: false, reason: "CONSENSUS_REQUIRED", memberId, proposed: true,
               have: have.sort(), awaiting: admins.filter((a) => !have.includes(a)).sort(),
               detail: "adding an administrator beyond the second requires the consensus of every existing "
                     + "administrator. No invitation is issued until they have all endorsed it." };
    }

    const invite = Store.#rand(16);
    const hash = await Store.#sha256(invite);
    this.sql.exec(
      `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,expertise,created,updated)
       VALUES (?,?,NULL,?,?,?,?,?,?,?)`,
      memberId, label, wantAdmin ? "admin" : "member", "invited", hash,
      JSON.stringify(caps), expertise ?? null, now, now);
    /* The plaintext invite appears exactly once, here, for handing to the
       person. It is never readable again. */
    return { ok: true, memberId, invite, role: wantAdmin ? "admin" : "member", capabilities: caps };
  }

  /* An invitation is a BURNER: the token in the URL is the whole credential, and
   * after use the URL resolves to nothing and carries no record of what it
   * formerly addressed (Membership Architecture section 6).
   *
   * The previous scheme put `<memberId>:<code>` in the link, so anyone who saw a
   * leaked or archived one learned who had been invited. The token is now opaque
   * and the member id is never in it, never returned by this lookup, and never
   * needed to enrol.
   *
   * A SPENT token and a token that never existed return byte-identical answers.
   * That is the security property and not tidiness: a response distinguishing
   * them would confirm to whoever found the archived link that it had once
   * addressed somebody real, which is exactly what the burner is for. */
  static #INVITE_MISS = { ok: false, reason: "NO_SUCH_INVITATION",
    detail: "this invitation is not live. An invitation is spent the moment it is used, and a spent one "
          + "cannot be told apart from one that never existed." };

  async #invited(invite) {
    if (typeof invite !== "string" || !/^[0-9a-f]{16,64}$/.test(invite)) return null;
    const hash = await Store.#sha256(invite);
    /* Looked up BY HASH, so the store never holds a usable invitation and a
       leaked database is not a set of live credentials. */
    return this.#one(
      `SELECT member_id, cover, role, status, capabilities, expertise
       FROM members WHERE invite_hash=? AND status='invited'`, hash);
  }

  /** What a burner URL resolves to. Unauthenticated by necessity: the invitee
   *  holds no credential yet, which is what the invitation is for. */
  async inviteLook({ invite } = {}) {
    const m = await this.#invited(invite);
    if (!m) return { ...Store.#INVITE_MISS };
    /* The cover and capabilities are shown because the invitee is entitled to
       see what they are being asked to join as. The member id is NOT: it is the
       administrator's handle on them inside the roster, and the record will show
       the handle they are about to choose instead. */
    return { ok: true, cover: m.cover, role: m.role, capabilities: this.#capsOf(m),
             expertise: m.expertise ?? null };
  }

  async enroll({ invite, handle, password } = {}) {
    /* No member id. The token identifies the invitation, and requiring the id as
       well meant the link had to carry it, which is what leaked the invitee. */
    const m = await this.#invited(invite);
    if (!m) return { ...Store.#INVITE_MISS };
    /* The handle is the member's OWN name and the one the record shows, so it is
       chosen here and not by the administrator who issued the invitation. Unique
       across the instance, because a roster in which two people can answer to one
       name defeats the purpose of having one. */
    const h = String(handle ?? "").trim();
    if (!h) return { ok: false, reason: "NO_HANDLE",
      detail: "choose a handle. It is what the record shows: the author of a promotion, the attestor of a "
            + "ratification, the participant list of a project. It is yours, not the label the administrator "
            + "used to invite you." };
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(h))
      return { ok: false, reason: "BAD_HANDLE", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    if (this.#one(`SELECT member_id FROM members WHERE handle=? AND member_id<>?`, h, m.member_id))
      return { ok: false, reason: "HANDLE_TAKEN", handle: h };
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    await this.setPassword({ role: `member:${m.member_id}`, password });
    /* Cover, capabilities and role are the administrator's and are NOT read from
       this call. An invitee who posts their own is ignored rather than refused,
       because the fields are not theirs to send and naming them in an error
       would teach a caller to try. Section 6: already attached, not editable.
       The invite hash is cleared, so the burner URL resolves to nothing
       afterwards and a leaked or archived link is inert. */
    this.sql.exec(`UPDATE members SET status='active', handle=?, invite_hash=NULL, updated=? WHERE member_id=?`,
      h, new Date().toISOString(), m.member_id);
    return { ok: true, memberId: m.member_id, handle: h };
  }

  memberList({ administer } = {}) {
    /* THE COVER↔HANDLE PROJECTION (Membership Architecture v1 §3 and v2 §3,
       identical and unambiguous: "Pairing. Only administrators see cover and
       handle together"), and it is a PROJECTION rather than a refusal, because
       the same section says "Members and the public see handles". A member
       legitimately needs this roster — the participant list of a project, the
       author of a promotion, the attestor of a ratification — so the answer is
       the handle roster with the pairing withheld, never a closed door.
       D-157, MEASURED 2026-08-02: before this, an ordinary member's session and
       the shared MEMBER_TOKEN each received `handle` AND `cover` for every
       member, byte-identical to the administrator's view, while three comments
       in this source said the op was admin-only.

       THE STAKE, said here because this is the line that keeps it. schema.mjs
       on `members.cover`: the cover-and-handle split exists precisely so that a
       roster seized or subpoenaed does not deanonymise the group. A handle is
       already public — the record shows it. A cover is the administrator's
       private label for a person. Either one alone is inert; TOGETHER they are
       the map from the public record back to the people in it, and withholding
       that map from everyone who is not an administrator is the whole mechanism.
       This is the rare defect whose blast radius is OUTSIDE the project: the
       people in the roster are the ones it costs.

       `cover` is therefore NOT SELECTED for a caller who does not administer.
       The key is ABSENT from the row, not null and not blank — a key that is
       present and empty still confirms to whoever is asking that a pairing
       exists to be compelled.

       FAIL CLOSED. `administer` is stamped by the CONTROL PLANE from the
       credential that authenticated (index.mjs, beside the D-15 viewer stamp)
       and is never taken from the request, the same impostor rule `viewer`,
       `author`, `by` and `owner` follow. Anything that is not the affirmative
       stamp — absent, blank, a caller's invention, a direct-DO route that
       forgot it — yields the handle roster, so a bypass of the stamp loses the
       pairing rather than leaking it. */
    const pairs = administer === true || administer === "1";
    return { members: this.#rows(
      `SELECT member_id, ${pairs ? "cover, " : ""}handle, role, status, capabilities, created, updated,
              CASE WHEN invite_hash IS NULL THEN 0 ELSE 1 END AS invite_pending
       FROM members ORDER BY member_id`).map((r) => ({ ...r, capabilities: this.#capsOf(r),
         /* D-51: served from `member_expertise`, not from the dead column on
            this row. Two places answering the same question, one of them never
            updated, is the shape that produces a roster nobody can trust. */
         expertise: this.expertiseList({ memberId: r.member_id }).expertise })) };
  }

  memberSet({ memberId, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const m = this.#one(`SELECT status, role FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    /* 4.4: administrator status cannot be taken away by another administrator.
       Revoking an administrator IS taking it away, so it goes through the
       section 4.7 vote or it does not happen. This is what stops an instance
       being captured by whoever acts first in a dispute. */
    if (m.role === "admin" && status === "revoked")
      return { ok: false, reason: "ADMIN_REQUIRES_VOTE",
               detail: "an administrator is removed by a majority of all administrators, counting the target "
                     + "in the denominator but not letting them vote (section 4.7). No administrator may strip "
                     + "another unilaterally." };
    /* 4.9: reactivating a former administrator must NOT restore their
       administrator status.
     *
     * A 4.7 removal sets status='revoked' and leaves role='admin' on the row,
     * because the vote ejects them from the office and does not erase the
     * person. Before this rule, any administrator could call memberset(active)
     * and put an ejected administrator straight back with the office intact,
     * undoing a group decision with one call. That defeats 4.7's
     * consensus-on-addition, which exists precisely so administrators cannot be
     * manufactured unilaterally.
     *
     * So they come back as an ordinary MEMBER. Reactivating the person is a
     * single administrator's call; restoring the office goes through the 4.7
     * addition process like any other appointment. */
    const demoted = status === "active" && m.role === "admin" && m.status !== "active";
    const now = new Date().toISOString();
    if (demoted)
      this.sql.exec(`UPDATE members SET status=?, role='member', updated=? WHERE member_id=?`,
        status, now, memberId);
    else
      this.sql.exec(`UPDATE members SET status=?, updated=? WHERE member_id=?`, status, now, memberId);
    if (status === "revoked") {
      /* Revocation is immediate: live sessions die with it, and the member's
         registered keys stop attesting. */
      this.sql.exec(`DELETE FROM sessions WHERE role=?`, `member:${memberId}`);
      this.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id=?`, memberId);
    }
    return { ok: true, memberId, status, ...(demoted ? { demoted: true,
      detail: "reactivated as an ordinary member. Administrator status is not restored by reactivation: "
            + "the group voted them out under 4.7, and putting them back is an appointment, which needs "
            + "the consensus of all existing administrators like any other." } : {}) };
  }

  /* ---- signers: the registered-key projection ---- */

  signerAdd({ keyB64, memberId, comment } = {}) {
    if (!keyB64 || !/^AAAA[A-Za-z0-9+/=]+$/.test(keyB64))
      return { ok: false, reason: "BAD_KEY", detail: "expected the base64 field of an ssh-ed25519 public key" };
    if (!this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "NO_SUCH_MEMBER" };
    this.sql.exec(
      `INSERT INTO signers (key_b64,member_id,comment,status,added) VALUES (?,?,?,'active',?)
       ON CONFLICT(key_b64) DO UPDATE SET member_id=excluded.member_id,
         comment=excluded.comment, status='active'`,
      keyB64, memberId, comment ?? null, new Date().toISOString());
    return { ok: true, keyB64, memberId };
  }

  signerList() {
    return { signers: this.#rows(`SELECT key_b64, member_id, comment, status, added FROM signers ORDER BY added`) };
  }

  signerSet({ keyB64, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    if (!this.#one(`SELECT key_b64 FROM signers WHERE key_b64=?`, keyB64))
      return { ok: false, reason: "NO_SUCH_KEY" };
    this.sql.exec(`UPDATE signers SET status=? WHERE key_b64=?`, status, keyB64);
    return { ok: true, keyB64, status };
  }

  /* ---- ratification support: facts out, published rows in ----

     The gate and the signature check run at the control plane, which also
     owns all R2 traffic. This store only hands out the facts and commits
     the published rows in one transaction. */

  /* Facts ratify needs that are not in the image: the row for its CAS check and
     the active signer set. The manifest, history, and dangling-ref lists are
     still returned because the migrate tool and the older gate consumed them;
     plane-gate/1.0 reads all of that out of the image instead, since the catalog
     wants the bundle as a filesystem rather than as query results. */
  gateFacts(bundleId) {
    const row = this.#one(
      `SELECT bundle_id, object_type, current_state, bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
    if (!row) return { ok: false, reason: "ABSENT", bundleId };
    return {
      ok: true, row,
      manifest: this.#rows(`SELECT snap_key, kind, base, created FROM manifest WHERE bundle_id=? ORDER BY created`, bundleId),
      history: this.#rows(`SELECT snap_key, sha256 FROM history WHERE bundle_id=? AND path='bundle.md'`, bundleId),
      registers: this.#rows(`SELECT capture_sha, path, bytes FROM register WHERE bundle_id=?`, bundleId),
      dangling: this.#rows(
        `SELECT r.target_id FROM refs r LEFT JOIN bundles b ON b.bundle_id=r.target_id
         WHERE r.bundle_id=? AND b.bundle_id IS NULL`, bundleId).map((r) => r.target_id),
      signers: this.#rows(
        `SELECT s.key_b64, s.member_id FROM signers s
         JOIN members m ON m.member_id=s.member_id
         WHERE s.status='active' AND m.status='active'`),
      /* REC-14: the two facts the catalog cannot get from the bundle — what
         THIS case asserted at its previous edition (C-21.1) and what the cases
         beneath it FROZE (C-21.2). Read here, with the rows, rather than
         probed for at the control plane, so the gate and the store's own write
         path see the same published record. */
      publishedRegistry: this.publishedRegistryFor(bundleId,
        this.#rows(`SELECT target_id FROM inquiry_basis WHERE bundle_id=?`, bundleId).map((r) => r.target_id)),
    };
  }

  /* REC-14 / DEC-12: the committer APPENDS AN EDITION. It used to UPSERT on
     bundle_id, which destroyed the prior signature, attestor, time and gate
     version on every re-ratification (D-144) — the defect that made the code
     split against itself, since published_shas has always appended. Under the
     ruling the append was right all along and this row simply was not yet
     edition-aware.

     THE EDITION COMES FROM THE RATIFIED BYTES, never from a parameter: it is
     frontmatter on the document the signature covers, so an edition cannot be
     claimed at the commit that was not inside the hash the member signed.

     TWO REFUSALS, and they are the whole of what keeps an edition honest:
     EDITION_NOT_INCREMENTED (a republish that does not move the number would
     put a second, differently-signed document at the same edition — the reader
     who cited "edition 2" would no longer know which one they read), and
     EDITION_EXISTS with a DIFFERENT sha at the same number, which is the same
     defect arriving by the other route. Re-ratifying the SAME bytes at the same
     edition is idempotent and reports `existed`, because that is a retry, not a
     revision. */
  publish({ bundleId, bundleSha, attestorKey, attestorMember, gateVersion, sigArmored, shas,
            edition, title, completeness, strength, required, manifest, manifestSha } = {}) {
    if (!bundleId || !bundleSha || !attestorKey || !gateVersion || !sigArmored || !Array.isArray(shas))
      return { ok: false, reason: "MALFORMED" };
    return this.ctx.storage.transactionSync(() => {
      const top = this.#one(`SELECT MAX(edition) AS m FROM published_bundles WHERE bundle_id=?`, bundleId);
      const highest = top && top.m != null ? Number(top.m) : 0;
      /* Re-ratifying bytes that are ALREADY published is a retry, not a
         revision: it answers with the edition those bytes already carry rather
         than minting a second one for the same document. */
      const already = this.#one(
        `SELECT edition FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`, bundleId, bundleSha);
      /* A CASE states its edition in the bytes the signature covers, so it
         arrives here and is checked. ANYTHING ELSE — an information bundle, a
         project — has no authored edition, and each ratification of new bytes
         is the next one: that is what closes D-144 for every bundle type
         rather than only for cases, since the defect was that a re-ratification
         DESTROYED the prior signature, attestor, time and gate version. */
      const ed = Number.isInteger(edition) ? edition
               : already ? Number(already.edition)
               : highest + 1;
      const same = this.#one(`SELECT bundle_sha FROM published_bundles WHERE bundle_id=? AND edition=?`, bundleId, ed);
      const existed = !!(same && same.bundle_sha === bundleSha);
      if (same && !existed)
        return { ok: false, reason: "EDITION_EXISTS", bundleId, edition: ed, published: same.bundle_sha,
                 detail: `edition ${ed} of ${bundleId} is already published at a different sha. An edition is a `
                       + `SEPARATE DOCUMENT and answers forever: republishing different bytes under the same `
                       + `number would leave a reader who cited edition ${ed} unable to say which one they read.` };
      if (!existed && highest && ed <= highest)
        return { ok: false, reason: "EDITION_NOT_INCREMENTED", bundleId, edition: ed, highest,
                 detail: `this case is published through edition ${highest}; a revision must increment the `
                       + `edition (DEC-12). Editions do not overwrite each other — edition ${highest} keeps its `
                       + `own signature, attestor, time and gate version, and a new one joins it.` };
      const now = new Date().toISOString();
      this.sql.exec(
        `INSERT INTO published_bundles (bundle_id,edition,title,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored,completeness,strength,required,manifest_sha,manifest)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(bundle_id,edition) DO NOTHING`,
        bundleId, ed, title ?? null, bundleSha, now, attestorKey, attestorMember ?? null, gateVersion, sigArmored,
        completeness ? JSON.stringify(completeness) : null,
        strength ? JSON.stringify(strength) : null,
        required ? JSON.stringify(required) : null,
        manifestSha ?? null, manifest ? JSON.stringify(manifest) : null);
      /* Append-only: a hash once published stays answerable forever, across
         any number of re-ratifications. */
      for (const s of shas)
        this.sql.exec(
          `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
           ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
          s.sha256, bundleId, s.path, s.kind, s.bytes ?? null, now);
      return { ok: true, bundleId, bundleSha, edition: ed, existed, ratifiedAt: now };
    });
  }

  /* ---- the doorbell, store side ---- */

  /* 7a: answers ONLY from the published projection. Working material is not
     consulted, so there is nothing to leak: a hash that was never ratified
     is indistinguishable from a hash that never existed. */
  verifySha(sha) {
    const matches = this.#rows(
      `SELECT bundle_id, path, kind, published FROM published_shas WHERE sha256=? ORDER BY published`, sha);
    return { published: matches.length > 0, sha256: sha, matches };
  }

  /* REC-14 / DEC-12: the public index ENUMERATES EDITIONS rather than one row
     per bundle, because an edition is a separate document and edition 1 keeps
     answering after edition 2 lands. `title` is here — the one deliberate
     divergence from DATA-MODEL 2.4.4 — so a public index is not N+1 reads of
     the bytes to learn what each case is called. */
  publishedList() {
    return { bundles: this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, attestor_member, gate_version
       FROM published_bundles ORDER BY bundle_id, edition`) };
  }

  /* One case, every edition it has ever had, each with its OWN signature,
     attestor, time and gate version, and with the frozen assertion and the
     frozen PAIR the group signed. This is what makes "edition 1 still answers"
     checkable rather than merely stated. */
  publishedEditions(bundleId) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "publishededitions requires ?id=" };
    const rows = this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, attestor_key, attestor_member,
              gate_version, sig_armored, completeness, strength, required, manifest_sha
       FROM published_bundles WHERE bundle_id=? ORDER BY edition`, bundleId);
    return { ok: true, bundleId, editions: rows.map((r) => ({
      ...r,
      completeness: r.completeness ? JSON.parse(r.completeness) : null,
      strength: r.strength ? JSON.parse(r.strength) : null,
      required: r.required ? JSON.parse(r.required) : null })) };
  }

  /* REC-14 / P8's justifying query, and the reason inquiry_exclusions exists as
     a TABLE and not only as bytes: "WHICH CASES EXCLUDED THIS DOCUMENT" —
     invariant 7's only mechanical enforcement point at the case level — as ONE
     indexed lookup on inquiry_exclusions_target, never a scan of every
     completeness block in the store.

     Each row carries the case's CURRENT STATE and the EDITION the assertion was
     taken from, so "which PUBLISHED cases excluded it" is a filter the caller
     can apply on what it is given rather than a distinction this read makes on
     their behalf: a case that was reopened after excluding a document has still
     excluded it in every edition already published, and hiding those rows would
     be the surface deciding what the record forgets.

     D-15: viewer-gated like every other read that can name a bundle, and fails
     closed on an absent viewer. */
  excludedBy(targetId, viewer = null) {
    if (!targetId) return { ok: false, reason: "NO_ID", detail: "excludedby requires ?id=" };
    const gate = viewerPredicate(viewer);
    const rows = this.#rows(
      `SELECT x.bundle_id, x.ord, x.edition, x.description, x.reason, x.author, x.at,
              b.current_state, b.title
       FROM inquiry_exclusions x JOIN bundles b ON b.bundle_id = x.bundle_id
       WHERE x.target_id=? AND (${gate.sql}) ORDER BY x.bundle_id, x.ord`, targetId, ...gate.args);
    return { ok: true, targetId, cases: rows,
             detail: "each row is a case that named this document in its completeness exclusions, with the "
                   + "edition the assertion was taken from and the case's current state." };
  }

  /* REC-14: the published projection as the CHECK CATALOG needs it — the shape
     C-21.1 and C-21.2 read. Built for the bundle being written or gated AND for
     every target its basis names, in ONE indexed query rather than a probe per
     leg: a case's own prior edition (freshness) and the frozen pair of every
     published case beneath it (inheritance) are the two facts neither the
     checker nor a caller can supply for itself. */
  publishedRegistryFor(bundleId, extraTargets = []) {
    const ids = [...new Set([bundleId, ...extraTargets].filter(Boolean))];
    if (!ids.length) return {};
    const marks = ids.map(() => "?").join(",");
    const rows = this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, completeness, strength
       FROM published_bundles WHERE bundle_id IN (${marks}) ORDER BY bundle_id, edition`, ...ids);
    const reg = {};
    for (const r of rows) {
      const e = reg[r.bundle_id] || (reg[r.bundle_id] = { latest: 0, editions: {} });
      const strength = r.strength ? JSON.parse(r.strength) : null;
      const byAxis = {};
      for (const a of Array.isArray(strength) ? strength : [])
        if (a && a.axis) byAxis[a.axis] = { state: a.state, grade: a.grade ?? null };
      e.editions[String(r.edition)] = {
        edition: r.edition, title: r.title, bundle_sha: r.bundle_sha, ratified_at: r.ratified_at,
        completeness: r.completeness ? JSON.parse(r.completeness) : null,
        capture: byAxis.capture || null, connection: byAxis.connection || null };
      if (Number(r.edition) > e.latest) e.latest = Number(r.edition);
    }
    return reg;
  }

  /* 7b: the knock. Rate accounting and the row land in one transaction, so
     an attacker cannot slip past the caps on a race. The worst case is by
     construction a full inbox. */
  knock({ knockId, sha256, bytes, content, inR2, note, contact,
          ipBucket, globalBucket, perIpLimit, globalLimit } = {}) {
    return this.ctx.storage.transactionSync(() => {
      const cnt = (b) => this.#one(`SELECT count FROM knock_rate WHERE bucket=?`, b)?.count || 0;
      if (cnt(ipBucket) >= perIpLimit) return { ok: false, reason: "RATE_IP" };
      if (cnt(globalBucket) >= globalLimit) return { ok: false, reason: "RATE_GLOBAL" };
      for (const b of [ipBucket, globalBucket])
        this.sql.exec(`INSERT INTO knock_rate (bucket,count) VALUES (?,1)
                       ON CONFLICT(bucket) DO UPDATE SET count=count+1`, b);
      /* Prune buckets from past windows; bucket names embed their window. */
      const win = globalBucket.split(":").pop();
      this.sql.exec(`DELETE FROM knock_rate WHERE bucket NOT LIKE '%:' || ?`, win);
      this.sql.exec(
        `INSERT INTO inbox (knock_id,sha256,bytes,content,in_r2,note,contact,received,status)
         VALUES (?,?,?,?,?,?,?,?,'new')`,
        knockId, sha256, bytes, content ?? null, inR2 ? 1 : 0,
        (note || "").slice(0, 2000), (contact || "").slice(0, 300), new Date().toISOString());
      return { ok: true, knockId, sha256, bytes };
    });
  }

  inboxList(status) {
    return { inbox: this.#rows(
      `SELECT knock_id, sha256, bytes, in_r2, note, contact, received, status, resolved, resolved_by
       FROM inbox ${status ? "WHERE status=?" : ""} ORDER BY received DESC`,
      ...(status ? [status] : [])) };
  }

  inboxGet(knockId) {
    const r = this.#one(`SELECT knock_id, sha256, bytes, content, in_r2, note, contact, received, status FROM inbox WHERE knock_id=?`, knockId);
    return r ? { ok: true, item: r } : { ok: false, reason: "NOT_FOUND" };
  }

  inboxResolve({ knockId, status, by } = {}) {
    if (!["pulled", "discarded", "new"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const r = this.#one(`SELECT knock_id FROM inbox WHERE knock_id=?`, knockId);
    if (!r) return { ok: false, reason: "NOT_FOUND" };
    this.sql.exec(`UPDATE inbox SET status=?, resolved=?, resolved_by=? WHERE knock_id=?`,
      status, new Date().toISOString(), by ?? null, knockId);
    return { ok: true, knockId, status };
  }

  static async #sha256(v) {
    const b = await crypto.subtle.digest("SHA-256", Store.#enc.encode(v));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  /* ------------------------------------------------------------------ *
   * Measured runtime cost
   * ------------------------------------------------------------------ */

  /** Record what a run cost. peak is kept alongside last because the peak is the
   *  run that will die first and a mean would hide it. */
  recordRuntimeObservation({ metric, ms, detail = null, at = null }) {
    if (!metric || typeof ms !== "number" || !Number.isFinite(ms)) return { recorded: false };
    const now = at || new Date().toISOString().split(".")[0] + "Z";
    const cur = [...this.sql.exec(`SELECT * FROM runtime_observations WHERE metric = ?`, metric)][0] || null;
    if (!cur) {
      this.sql.exec(
        `INSERT INTO runtime_observations (metric, peak_ms, peak_at, peak_detail, last_ms, last_at, samples, total_ms)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`, metric, ms, now, detail, ms, now, ms);
      return { metric, peak_ms: ms, last_ms: ms, samples: 1, new_peak: true };
    }
    const isPeak = ms > cur.peak_ms;
    this.sql.exec(
      `UPDATE runtime_observations SET last_ms = ?, last_at = ?, samples = samples + 1, total_ms = total_ms + ?
       ${isPeak ? ", peak_ms = ?, peak_at = ?, peak_detail = ?" : ""} WHERE metric = ?`,
      ...(isPeak ? [ms, now, ms, ms, now, detail, metric] : [ms, now, ms, metric]));
    return { metric, peak_ms: isPeak ? ms : cur.peak_ms, last_ms: ms,
             samples: cur.samples + 1, new_peak: isPeak };
  }

  runtimeObservations() {
    const rows = [...this.sql.exec(`SELECT * FROM runtime_observations ORDER BY metric`)];
    return { metrics: rows.map((r) => ({ ...r, mean_ms: r.samples ? r.total_ms / r.samples : null })),
      note: "measured wall time across synchronous compute segments, not billed CPU time. peak_ms is "
          + "the run that would die first if a ceiling were near; a mean would hide it." };
  }

  /** Where the stepped probe got to, and therefore what is known about the
   *  ceiling. A gap between the highest completed step and the next one is the
   *  interval the ceiling lies in; no gap means the probe has never been cut off
   *  and the ceiling is above everything tried. */
  cpuProbeState() {
    const rows = [...this.sql.exec(`SELECT * FROM cpu_probe ORDER BY step`)];
    const top = rows[rows.length - 1] || null;
    return { steps: rows.length, highest_completed: top ? top.step : 0,
      elapsed_at_highest_ms: top ? top.elapsed_ms : 0,
      rows,
      note: rows.length
        ? "the isolate completed every step listed. If a later probe was killed, the ceiling lies "
        + "above elapsed_at_highest_ms and below whatever the next step would have cost."
        : "the probe has never run, so nothing is known about the ceiling by measurement" };
  }

  recordCpuProbeStep({ step, elapsedMs, iterations, at = null }) {
    const now = at || new Date().toISOString().split(".")[0] + "Z";
    this.sql.exec(
      `INSERT INTO cpu_probe (step, elapsed_ms, iterations, at) VALUES (?, ?, ?, ?)
       ON CONFLICT(step) DO UPDATE SET elapsed_ms = excluded.elapsed_ms, at = excluded.at`,
      step, elapsedMs, iterations, now);
    return { step, elapsed_ms: elapsedMs };
  }

  /* ------------------------------------------------------------------ *
   * D-95: the per-host request governor
   *
   * Our APPETITE is a configured constant because it is ours. Their CAPACITY
   * is discovered by being refused and recorded, the pattern capture_limits
   * proved. This lives here because the Durable Object serialises, so one
   * token bucket is globally correct for the instance for free; a bucket in
   * Worker memory governs nothing, since every invocation is independent.
   *
   * Pacing resembles a person rather than a loop: grants to one host are
   * separated by a JITTERED gap around the appetite's base interval, never a
   * metronome. The chosen constants are recorded in MEASUREMENTS.md as chosen,
   * not measured. A 429 overrides the bucket entirely: cooloff_until in the
   * future refuses admission regardless of token balance, honouring
   * Retry-After when the counterparty names one and escalating with
   * consecutive refusals when it does not, mirroring their own escalation.
   * Success decays the escalation to zero. This governs OUR instance only and
   * cannot solve the shared-egress problem; that is D-95's recorded limit.
   * ------------------------------------------------------------------ */

  static GOVERNOR = {
    defaultAppetitePerMin: 12,   /* chosen: one document fetch every ~5s on average */
    jitterLow: 0.6, jitterHigh: 1.5,
    burstTokens: 3,              /* a person opens a few tabs; a loop opens forty */
    cooloff429BaseMs: 60_000,  cooloff429CapMs: 3_600_000,
    cooloffRefusedBaseMs: 30_000, cooloffRefusedCapMs: 1_800_000,
  };

  #governorRow(host, now) {
    let r = [...this.sql.exec(`SELECT * FROM host_governor WHERE host = ?`, host)][0];
    if (!r) {
      this.sql.exec(
        `INSERT INTO host_governor (host, tokens, refilled_at, updated_at) VALUES (?, ?, ?, ?)`,
        host, Store.GOVERNOR.burstTokens, now, new Date(now).toISOString());
      r = [...this.sql.exec(`SELECT * FROM host_governor WHERE host = ?`, host)][0];
    }
    return r;
  }

  governorAdmit({ host }) {
    if (!host) return { admitted: false, reason: "no host named" };
    const G = Store.GOVERNOR;
    const now = Date.now();
    const r = this.#governorRow(host, now);
    /* Precedence: the host's own configured row, then the instance's
       GOVERNOR_APPETITE_PER_MIN binding (an operator knob, and what lets a
       test suite drive the real path without pacing a fake host), then the
       chosen default recorded in MEASUREMENTS.md. */
    const appetite = r.appetite_per_min
      || Number(this.env && this.env.GOVERNOR_APPETITE_PER_MIN)
      || G.defaultAppetitePerMin;
    const baseGapMs = 60_000 / appetite;

    /* A cool-off overrides the bucket entirely. */
    if (r.cooloff_until > now) {
      this.sql.exec(`UPDATE host_governor SET refused_total = refused_total + 1, updated_at = ? WHERE host = ?`,
        new Date(now).toISOString(), host);
      return { admitted: false, reason: "cooling_off", retry_in_ms: r.cooloff_until - now,
               refusals: r.refusals, last_refusal_status: r.last_refusal_status };
    }

    /* Refill, capped at a small burst: a person opens a few tabs at once and
       then reads; a loop opens forty and keeps going. */
    const tokens = Math.min(G.burstTokens, r.tokens + ((now - r.refilled_at) / 60_000) * appetite);
    if (tokens < 1) {
      const retryIn = Math.ceil(((1 - tokens) / appetite) * 60_000);
      this.sql.exec(`UPDATE host_governor SET tokens = ?, refilled_at = ?, refused_total = refused_total + 1, updated_at = ? WHERE host = ?`,
        tokens, now, new Date(now).toISOString(), host);
      return { admitted: false, reason: "appetite", retry_in_ms: retryIn };
    }

    /* Admitted. The caller waits wait_ms before fetching, which is where the
       human-shaped gap comes from: jittered around the base interval, and only
       when this grant follows the last one closely enough to need spacing. */
    const jitter = G.jitterLow + Math.random() * (G.jitterHigh - G.jitterLow);
    const gapWanted = baseGapMs * jitter;
    const sinceLast = now - (r.last_grant_at || 0);
    const wait = sinceLast >= gapWanted ? 0 : Math.round(gapWanted - sinceLast);
    this.sql.exec(
      `UPDATE host_governor SET tokens = ?, refilled_at = ?, last_grant_at = ?, granted = granted + 1, updated_at = ? WHERE host = ?`,
      tokens - 1, now, now + wait, new Date(now).toISOString(), host);
    return { admitted: true, wait_ms: wait, appetite_per_min: appetite };
  }

  governorReport({ host, status, retry_after_ms = null }) {
    if (!host) return { recorded: false };
    const G = Store.GOVERNOR;
    const now = Date.now();
    const r = this.#governorRow(host, now);
    const s = Number(status) || 0;
    if (s >= 200 && s < 400) {
      /* They relented, or never objected; the escalation resets. */
      this.sql.exec(`UPDATE host_governor SET refusals = 0, updated_at = ? WHERE host = ?`,
        new Date(now).toISOString(), host);
      return { recorded: true, refusals: 0 };
    }
    if (s === 429 || s === 403 || s === 503) {
      const refusals = (r.refusals || 0) + 1;
      const base = s === 429 ? G.cooloff429BaseMs : G.cooloffRefusedBaseMs;
      const cap  = s === 429 ? G.cooloff429CapMs  : G.cooloffRefusedCapMs;
      const escalated = Math.min(cap, base * Math.pow(2, refusals - 1));
      /* Retry-After is the counterparty naming their own capacity; honour it
         when it is longer than our escalation, never shorter. */
      const cooloff = now + Math.max(escalated, Number(retry_after_ms) || 0);
      this.sql.exec(
        `UPDATE host_governor SET refusals = ?, last_refusal_at = ?, last_refusal_status = ?, cooloff_until = ?, updated_at = ? WHERE host = ?`,
        refusals, now, s, cooloff, new Date(now).toISOString(), host);
      return { recorded: true, refusals, cooloff_until: cooloff, cooloff_ms: cooloff - now };
    }
    /* Other statuses (404, 500, network shapes reported as 0) are outcomes for
       monitoring, not capacity signals; the governor records nothing. */
    return { recorded: true, ignored: s };
  }

  governorConfig({ host, appetite_per_min = null }) {
    if (!host) return { configured: false };
    const now = Date.now();
    this.#governorRow(host, now);
    this.sql.exec(`UPDATE host_governor SET appetite_per_min = ?, updated_at = ? WHERE host = ?`,
      appetite_per_min ? Number(appetite_per_min) : null, new Date(now).toISOString(), host);
    return { configured: true, host, appetite_per_min: appetite_per_min ? Number(appetite_per_min) : null };
  }

  governorState({ host = null }) {
    const rows = host
      ? [...this.sql.exec(`SELECT * FROM host_governor WHERE host = ?`, host)]
      : [...this.sql.exec(`SELECT * FROM host_governor ORDER BY host`)];
    return { hosts: rows.map((r) => ({ ...r })) };
  }

  /* ------------------------------------------------------------------ *
   * Links: what a document pointed at, and whether we hold that version
   * ------------------------------------------------------------------ */

  recordCapturedLocator({ address, addressNorm, captureSha, retrieved, via = "direct", retrievalLocator = null }) {
    if (!addressNorm || !captureSha) return { recorded: false };
    /* Widen the interval rather than replacing a date. Seeing the same bytes
       again later is not a duplicate, it is the observation that proves the
       target held still in between.
       *
       * The interval widens PER SOURCE (D-96): via is part of the key, so a
       * direct observation and an archive observation of the same bytes are two
       * rows. The bracket arm reads them apart, because two sources agreeing is
       * stronger evidence than one source repeating, and two sources
       * disagreeing is a provenance difference rather than a change. */
    this.sql.exec(
      `INSERT INTO captured_locators (address_norm, address, capture_sha, via, retrieval_locator, first_retrieved, last_retrieved, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(address_norm, capture_sha, via) DO UPDATE SET
         first_retrieved   = MIN(first_retrieved, excluded.first_retrieved),
         last_retrieved    = MAX(last_retrieved,  excluded.last_retrieved),
         retrieval_locator = COALESCE(excluded.retrieval_locator, retrieval_locator),
         observations      = observations + 1`,
      addressNorm, address || addressNorm, captureSha, String(via || "direct"),
      retrievalLocator, retrieved, retrieved);
    return { recorded: true, address_norm: addressNorm, via: String(via || "direct") };
  }

  /** File the links a captured document made. Replaces this capture's rows
   *  rather than appending, because a capture's own links are a property of its
   *  bytes and do not change; a second filing is a re-run, not new information. */
  recordLinks({ sourceCapture, sourceBundle = null, capturedAt, links = [] }) {
    if (!sourceCapture) return { recorded: 0 };
    const now = new Date().toISOString().split(".")[0] + "Z";
    this.sql.exec(`DELETE FROM links WHERE source_capture = ?`, sourceCapture);
    let n = 0;
    for (const l of links) {
      /* address_norm is required; citation_norm falls back to it for a link that
         names no element. A link with neither is not a link. */
      if (!l || !l.address_norm) continue;
      this.sql.exec(
        `INSERT INTO links (source_bundle, source_capture, link_ref, address, address_norm,
           citation_norm, fragment, partition, origin, chrome, captured_at, first_seen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(source_capture, link_ref, citation_norm) DO NOTHING`,
        sourceBundle, sourceCapture, String(l.ref || l.address), l.address || l.address_norm,
        l.address_norm, l.citation_norm || l.address_norm, l.fragment || null,
        l.type || "deferred", l.origin || null, l.chrome ? 1 : 0,
        capturedAt || now, now);
      n++;
    }
    return { recorded: n, source_capture: sourceCapture };
  }

  /** Everything that points AT an address. The reverse index, which is the
   *  whole reason this is address-keyed. */
  linksTo({ address_norm }) {
    /* Matched on the RESOURCE key, so asking what points at a report finds the
       citations of its sections too, each still naming the element it cited. */
    const rows = [...this.sql.exec(
      `SELECT source_capture, source_bundle, link_ref, partition, fragment, citation_norm, captured_at
       FROM links WHERE address_norm = ?`, address_norm)];
    return { address_norm, count: rows.length, sources: rows,
      elements: [...new Set(rows.map((r) => r.fragment).filter(Boolean))] };
  }

  /** Resolve a capture's links against the store, with a contemporaneity
   *  verdict for each that resolves.
   *
   *  The verdict answers one question: is the capture the store holds of the
   *  target the version the source was pointing at on the day the source was
   *  captured? Three values, because that question is usually unanswerable and a
   *  binary scheme would sort every unanswerable case into one bucket or the
   *  other, either asserting connections nobody established or discarding real
   *  ones wholesale.
   *
   *  The strongest evidence available here is two captures of the target
   *  BRACKETING the source's retrieval whose bytes hash equal: identical bytes
   *  across the interval settles it outright and needs no timestamp anyone has
   *  to trust. Everything weaker is named rather than leaned on. */
  resolveLinks({ sourceCapture, at = null }) {
    const rows = [...this.sql.exec(`SELECT * FROM links WHERE source_capture = ?`, sourceCapture)];
    if (!rows.length) return { sourceCapture, resolved: 0, links: [] };
    const T = Date.parse(rows[0].captured_at) || Date.parse(at || "") || Date.now();
    const out = [];
    const tally = { linked: 0, offsite: 0, intra: 0, anchor: 0, refused: 0 };
    const verdicts = { contemporaneous: 0, superseded: 0, undetermined: 0 };

    for (const r of rows) {
      if (r.partition !== "deferred") {
        tally[r.partition] = (tally[r.partition] || 0) + 1;
        out.push({ ...r, resolution: r.partition, verdict: null });
        continue;
      }
      /* D-96: the bracket arms read DIRECT observations only. An archive row
         for the same address is a different observation stream: comparing
         archive bytes against live bytes as one stream reports a change that is
         a provenance difference. Cross-source agreement is stronger evidence
         and gets its own treatment when the provenance chain grades it; until
         then it must not leak into the identity bracket. */
      const caps = [...this.sql.exec(
        `SELECT capture_sha, first_retrieved, last_retrieved, observations FROM captured_locators
         WHERE address_norm = ? AND via = 'direct' ORDER BY first_retrieved`, r.address_norm)];
      if (!caps.length) {
        tally.offsite++;
        out.push({ ...r, resolution: "offsite", verdict: null,
          basis: "the record holds no capture of this address" });
        continue;
      }
      tally.linked++;
      /* The strongest case first: one set of bytes observed on BOTH sides of
         this document's retrieval. Identical bytes across the interval settle
         it, and nothing here depends on a date the source supplied. */
      const bracket = caps.find((c) => Date.parse(c.first_retrieved) <= T && Date.parse(c.last_retrieved) >= T
                                       && c.observations > 1) || null;
      const before = [...caps].reverse().find((c) => Date.parse(c.last_retrieved) <= T) || null;
      const after = caps.find((c) => Date.parse(c.first_retrieved) >= T) || null;
      let verdict, basis, detail = null, pick = null;

      if (bracket) {
        verdict = "contemporaneous"; pick = bracket;
        basis = "the same bytes were seen served on both sides of this document's retrieval and "
              + "hash equal, so the target did not change across the interval";
        detail = `observed ${bracket.observations} times between ${bracket.first_retrieved} and ${bracket.last_retrieved}`;
      } else if (before && after) {
        verdict = "undetermined"; pick = before;
        basis = "the target changed somewhere between the captures bracketing this document's "
              + "retrieval, so which version it pointed at is not established";
        detail = `bracketing captures differ: ${before.capture_sha.slice(0, 12)} last seen ${before.last_retrieved}, `
               + `${after.capture_sha.slice(0, 12)} first seen ${after.first_retrieved}`;
      } else if (!before && after) {
        verdict = "superseded"; pick = after;
        basis = "every capture of the target postdates this document's retrieval, so the record "
              + "holds a later version than the one pointed at";
      } else {
        verdict = "undetermined"; pick = before;
        basis = "the record's captures of the target all predate this document's retrieval, and "
              + "nothing establishes that it was unchanged in between";
      }
      verdicts[verdict]++;
      const reg = pick ? [...this.sql.exec(`SELECT bundle_id FROM register WHERE capture_sha = ?`, pick.capture_sha)][0] : null;
      out.push({ ...r, resolution: "linked", verdict, basis, detail,
                 target_capture: pick ? pick.capture_sha : null,
                 target_bundle: reg ? reg.bundle_id : null,
                 target_retrieved: pick ? pick.first_retrieved : null,
                 target_last_seen: pick ? pick.last_retrieved : null,
                 target_captures: caps.length });
    }
    return { sourceCapture, resolved: out.length, at: rows[0].captured_at, tally, verdicts, links: out,
      note: "undetermined is the resting state and the expected common case, not a failure: it means "
          + "nothing established which version the source pointed at, which is different from the "
          + "record holding nothing and different again from holding a later version" };
  }

  /** Project a capture's RESOLVED links into edges the record can traverse.
   *
   *  This is where a link becomes a citation. An unresolved link has no canonical
   *  target and cannot be an edge at all, because C-6.1 rightly refuses a locator
   *  as a references[].target; resolution is the act that supplies one. So only
   *  the `linked` partition projects, and the address rides along as the comment
   *  string Bob ruled it to be.
   *
   *  The edge kind is `links_to`, never `cites`. A member may promote it, and
   *  that promotion is a member's act recorded as one. Projecting it as `cites`
   *  would put words in the group's mouth that the source said.
   *
   *  A self-edge is dropped rather than recorded: a page linking to itself, which
   *  every paginated Legistar calendar does, is not a connection between two
   *  documents and would show up as a bundle citing itself. */
  projectLinks({ sourceCapture, sourceBundle = null, at = null }) {
    const res = this.resolveLinks({ sourceCapture, at });
    if (!res.links || !res.links.length) return { projected: 0, edges: [] };
    let bundle = sourceBundle;
    if (!bundle) {
      const reg = [...this.sql.exec(`SELECT bundle_id FROM register WHERE capture_sha = ?`, sourceCapture)][0];
      bundle = reg ? reg.bundle_id : null;
    }
    if (!bundle) return { projected: 0, edges: [],
      note: "this capture is not registered to a bundle, so there is no canonical source to hang an edge on" };
    const edges = [];
    let unregistered = 0;
    for (const l of res.links) {
      if (l.resolution !== "linked") continue;
      /* The record holds BYTES of the target but no bundle claims them yet. That
         is the normal state of anything acquired and not promoted: acquire files
         the locator, promote writes the register row. There is no canonical id to
         point an edge at, and inventing one would be worse than waiting, so it is
         counted and named rather than silently dropped. */
      if (!l.target_bundle) { unregistered++; continue; }
      if (l.target_bundle === bundle) continue;
      this.sql.exec(
        `INSERT INTO refs (bundle_id, target_id, kind) VALUES (?, ?, 'links_to')
         ON CONFLICT(bundle_id, target_id, kind) DO NOTHING`, bundle, l.target_bundle);
      edges.push({ from: bundle, to: l.target_bundle, rel: "links_to",
                   asserted_by: "source", address: l.address, fragment: l.fragment,
                   verdict: l.verdict, basis: l.basis,
                   target_capture: l.target_capture, target_retrieved: l.target_retrieved });
    }
    return { projected: edges.length, source_bundle: bundle, edges,
      skipped_self: res.links.filter((l) => l.resolution === "linked" && l.target_bundle === bundle).length,
      skipped_unregistered: unregistered,
      unresolved: res.tally.offsite,
      note: "only resolved links project, and only to a target some bundle has registered. "
          + "skipped_unregistered counts targets whose BYTES the record holds while no bundle claims "
          + "them, which is every acquired-but-unpromoted capture: those become edges when the target "
          + "is promoted, not before. The edge is links_to and never cites, because the source "
          + "asserted it and not the group; a member promoting it to cites is a member's act." };
  }

  /** Append a verdict. Never an update: a verdict that changed is a fact about
   *  the record, and the current answer is simply the newest row. */
  recordLinkVerdict({ sourceCapture, addressNorm, verdict, basis, targetBundle = null, targetCapture = null, detail = null, at = null }) {
    const now = at || new Date().toISOString().split(".")[0] + "Z";
    this.sql.exec(
      `INSERT INTO link_verdicts (source_capture, address_norm, verdict, basis, target_bundle, target_capture, at, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
      sourceCapture, addressNorm, verdict, basis, targetBundle, targetCapture, now, detail);
    const all = [...this.sql.exec(
      `SELECT * FROM link_verdicts WHERE source_capture = ? AND address_norm = ? ORDER BY at`,
      sourceCapture, addressNorm)];
    return { current: all[all.length - 1] || null, history: all, changed: all.length > 1 };
  }

  /* ------------------------------------------------------------------ *
   * Capture sessions: a capture that needs another tick
   * ------------------------------------------------------------------ */

  /** Park what is left of a capture. Expired rows are pruned on the way past,
   *  which is cheap and means an abandoned session cannot accumulate: a caller
   *  that walks away costs one row until its hour is up. */
  saveCaptureSession({ session, locator, primarySha, primaryFile, base, state, ttlMs = 3600000, at = null }) {
    const now = at ? new Date(at) : new Date();
    const iso = (d) => d.toISOString().split(".")[0] + "Z";
    this.sql.exec(`DELETE FROM capture_sessions WHERE expires < ?`, iso(now));
    if (!session || !state) return { session: null, saved: false };
    const cur = [...this.sql.exec(`SELECT ticks FROM capture_sessions WHERE session = ?`, session)][0];
    const body = JSON.stringify(state);
    if (cur) {
      this.sql.exec(`UPDATE capture_sessions SET updated = ?, expires = ?, ticks = ticks + 1, state = ? WHERE session = ?`,
        iso(now), iso(new Date(now.getTime() + ttlMs)), body, session);
      return { session, saved: true, ticks: cur.ticks + 1, bytes: body.length };
    }
    this.sql.exec(`INSERT INTO capture_sessions (session, locator, primary_sha, primary_file, base, created, updated, expires, ticks, state)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      session, locator, primarySha, primaryFile, base, iso(now), iso(now), iso(new Date(now.getTime() + ttlMs)), body);
    return { session, saved: true, ticks: 1, bytes: body.length };
  }

  loadCaptureSession({ session, at = null }) {
    const now = at ? new Date(at) : new Date();
    const iso = now.toISOString().split(".")[0] + "Z";
    this.sql.exec(`DELETE FROM capture_sessions WHERE expires < ?`, iso);
    const r = [...this.sql.exec(`SELECT * FROM capture_sessions WHERE session = ?`, session)][0] || null;
    if (!r) return { session, found: false,
      note: "no such capture session: it either never existed, was already finished, or expired" };
    let state = null;
    try { state = JSON.parse(r.state); } catch { return { session, found: false, note: "session state did not parse" }; }
    return { session, found: true, locator: r.locator, primarySha: r.primary_sha,
             primaryFile: r.primary_file, base: r.base, ticks: r.ticks, created: r.created, state };
  }

  dropCaptureSession({ session }) {
    this.sql.exec(`DELETE FROM capture_sessions WHERE session = ?`, session);
    return { session, dropped: true };
  }

  /* ------------------------------------------------------------------ *
   * What a host has served
   * ------------------------------------------------------------------ */

  /** Look up assets this host has served before, by normalised address.
   *  `documents` is counted from the ref rows rather than kept as a counter, so
   *  re-capturing the same document twice does not inflate it into looking like
   *  a shared asset when it is one page's own. */
  siteAssets({ host, addresses = [] }) {
    if (!host) return { host: null, assets: {} };
    const out = {};
    const want = addresses.length ? new Set(addresses) : null;
    for (const r of this.sql.exec(`SELECT * FROM site_assets WHERE host = ?`, host)) {
      if (want && !want.has(r.address_norm)) continue;
      const n = [...this.sql.exec(
        `SELECT COUNT(DISTINCT primary_sha) AS n FROM site_asset_refs WHERE host = ? AND address_norm = ?`,
        host, r.address_norm)][0];
      out[r.address_norm] = { ...r, documents: (n && n.n) || 0 };
    }
    return { host, assets: out, count: Object.keys(out).length };
  }

  /** File what a capture saw of a host.
   *
   *  The change case is the one that matters. When an address comes back with a
   *  different sha than the record holds, that is a dated fact about the site,
   *  AND it retrospectively puts every document that reused the old bytes into
   *  question. Both are recorded: stable_since moves, changes increments, and
   *  the affected documents are returned so the caller can act rather than
   *  having to go looking. */
  recordSiteAssets({ host, primarySha, observations = [], at = null }) {
    if (!host || !primarySha) return { host: null, recorded: 0 };
    const now = at || new Date().toISOString().split(".")[0] + "Z";
    let added = 0, changedCount = 0;
    const changed = [];
    for (const o of observations) {
      if (!o || !o.address_norm || !o.sha256) continue;
      const cur = [...this.sql.exec(
        `SELECT * FROM site_assets WHERE host = ? AND address_norm = ?`, host, o.address_norm)][0] || null;
      if (!cur) {
        this.sql.exec(
          `INSERT INTO site_assets (host, address_norm, address, sha256, content_type, bytes, kind,
             first_seen, last_seen, last_fetched, stable_since, changes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          host, o.address_norm, o.address || o.address_norm, o.sha256, o.content_type || null,
          o.bytes || 0, o.kind || null, now, now, now, now);
        added++;
      } else if (!o.reused && cur.sha256 !== o.sha256) {
        /* It changed. Everything that reused the OLD bytes is now unverified,
           and those documents are named rather than left to be discovered. */
        const affected = [...this.sql.exec(
          `SELECT primary_sha, at FROM site_asset_refs WHERE host = ? AND address_norm = ? AND reused = 1`,
          host, o.address_norm)];
        this.sql.exec(
          `UPDATE site_assets SET sha256 = ?, content_type = ?, bytes = ?, last_seen = ?, last_fetched = ?,
             stable_since = ?, changes = changes + 1 WHERE host = ? AND address_norm = ?`,
          o.sha256, o.content_type || cur.content_type, o.bytes || 0, now, now, now, host, o.address_norm);
        changedCount++;
        changed.push({ address_norm: o.address_norm, was: cur.sha256, now: o.sha256,
                       reused_by: affected.map((a) => a.primary_sha) });
        /* CAP-4 item 6a: POST-HOC reuse verification, unconditional and free. A
           later direct capture just fetched different bytes than what earlier
           captures REUSED from the record, so each of those captures now holds a
           reused part the source has since changed. That verdict is APPENDED and
           dated here (never overwritten, the same discipline link_verdicts
           follows) at zero request cost -- no fetch is made at any point; this is
           detection over what is already stored. INSERT OR IGNORE because the key
           carries the second, so two changes to one asset within the same second
           for one capture fold into the earlier row rather than throwing. */
        for (const a of affected)
          this.sql.exec(
            `INSERT OR IGNORE INTO reuse_verdicts
               (source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at)
             VALUES (?, NULL, ?, ?, 'posthoc', 'changed', ?, ?, ?, ?)`,
            a.primary_sha, host, o.address_norm, cur.sha256, o.sha256,
            `a later direct capture of this host fetched different bytes for this address; `
              + `this earlier capture reused the old ones, which are now unverified against the source`,
            now);
      } else if (!o.reused) {
        this.sql.exec(
          `UPDATE site_assets SET last_seen = ?, last_fetched = ? WHERE host = ? AND address_norm = ?`,
          now, now, host, o.address_norm);
      } else {
        /* A reuse confirms nothing about the source, so last_fetched must not
           move: it names the last time these bytes were actually seen served. */
        this.sql.exec(`UPDATE site_assets SET last_seen = ? WHERE host = ? AND address_norm = ?`,
          now, host, o.address_norm);
      }
      this.sql.exec(
        `INSERT INTO site_asset_refs (host, address_norm, primary_sha, at, reused, sha256)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(host, address_norm, primary_sha) DO UPDATE SET at = excluded.at,
           reused = excluded.reused, sha256 = excluded.sha256`,
        host, o.address_norm, primarySha, now, o.reused ? 1 : 0, o.sha256);
    }
    return { host, recorded: observations.length, added, changed: changedCount, changes: changed };
  }

  /** CAP-4: the reused subresource PARTS of a bundle, so ratification can
   *  re-fetch each one. A part is reused when a capture in this bundle drew an
   *  asset from the record rather than requesting it, which is exactly a
   *  `site_asset_refs` row with `reused = 1` whose `primary_sha` is one of the
   *  bundle's registered captures. The register is the trust root and keys on
   *  capture_sha, so the join to it is what scopes the reused parts to THIS
   *  bundle. `reused_sha` is the bytes the capture actually reused (the ref row's
   *  own sha, not necessarily what `site_assets` holds NOW -- the source may have
   *  changed since), and `address` comes along from `site_assets` because a
   *  re-fetch needs the real address, not the normalised key. */
  reusedParts(bundleId) {
    if (!bundleId) return { bundleId: null, parts: [] };
    const parts = this.#rows(
      `SELECT ar.host AS host, ar.address_norm AS address_norm, ar.primary_sha AS primary_sha,
              ar.sha256 AS reused_sha, sa.address AS address, sa.content_type AS content_type
       FROM site_asset_refs ar
       JOIN register r ON r.capture_sha = ar.primary_sha
       LEFT JOIN site_assets sa ON sa.host = ar.host AND sa.address_norm = ar.address_norm
       WHERE r.bundle_id = ? AND ar.reused = 1
       ORDER BY ar.host, ar.address_norm`, bundleId);
    return { bundleId, parts, count: parts.length };
  }

  /** CAP-4: append the outcome of a ratification's re-fetch of the reused parts.
   *  Appended and dated, never overwritten: a re-ratification is a fresh attempt
   *  and a fresh set of dated rows, so the history of what the source said each
   *  time it was checked is readable. The control plane owns all outbound R2 and
   *  network traffic (VERIFICATION.md), so it does the fetching and hashing and
   *  hands the store the verdicts to commit; the store invents none of them. */
  recordReuseVerdicts({ bundleId = null, verdicts = [], at = null } = {}) {
    const now = at || new Date().toISOString().split(".")[0] + "Z";
    let recorded = 0;
    for (const v of verdicts) {
      if (!v || !v.source_capture || !v.address_norm || !v.verdict) continue;
      this.sql.exec(
        `INSERT OR IGNORE INTO reuse_verdicts
           (source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at)
         VALUES (?, ?, ?, ?, 'ratify', ?, ?, ?, ?, ?)`,
        v.source_capture, bundleId, v.host || "", v.address_norm, v.verdict,
        v.reused_sha || "", v.observed_sha ?? null, v.basis || "", now);
      recorded++;
    }
    return { ok: true, bundleId, recorded, at: now };
  }

  /** CAP-4: read the reuse verdicts, newest first. By bundle (ratify verdicts) or
   *  by source_capture (which also surfaces the free posthoc verdicts that carry
   *  no bundle). The current answer for a part is its newest row; the older rows
   *  are the trail of what the source said each time it was checked. */
  reuseVerdicts({ bundleId = null, sourceCapture = null } = {}) {
    if (bundleId)
      return { bundleId, verdicts: this.#rows(
        `SELECT source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at
         FROM reuse_verdicts WHERE bundle_id = ? ORDER BY at DESC, address_norm`, bundleId) };
    if (sourceCapture)
      return { sourceCapture, verdicts: this.#rows(
        `SELECT source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at
         FROM reuse_verdicts WHERE source_capture = ? ORDER BY at DESC, address_norm`, sourceCapture) };
    return { verdicts: [] };
  }

  /** Chrome by RECURRENCE, which works on sites that never write a <nav>.
   *  A ratio, not a boolean: the threshold is a tuning decision and belongs to
   *  the caller, so both numbers are returned and nothing is decided here. */
  siteChrome({ host, threshold = 0.6 }) {
    if (!host) return { host: null, documents: 0, assets: [] };
    const d = [...this.sql.exec(`SELECT COUNT(DISTINCT primary_sha) AS n FROM site_asset_refs WHERE host = ?`, host)][0];
    const documents = (d && d.n) || 0;
    const assets = [];
    for (const r of this.sql.exec(
      `SELECT address_norm, COUNT(DISTINCT primary_sha) AS n FROM site_asset_refs WHERE host = ? GROUP BY address_norm`, host)) {
      const share = documents ? r.n / documents : 0;
      assets.push({ address_norm: r.address_norm, documents: r.n, share,
                    chrome: documents >= 3 && share >= threshold });
    }
    assets.sort((a, b) => b.share - a.share);
    return { host, documents, threshold, assets,
             note: documents < 3
               ? "fewer than three documents captured from this host: recurrence says nothing yet"
               : "chrome here means the address recurs across at least this share of the host's captured documents" };
  }

  /* ------------------------------------------------------------------ *
   * Observed runtime limits
   * ------------------------------------------------------------------ */

  /** What we last saw this runtime allow, and whether it is time to look again.
   *  `probeDue` is the part that matters: an instance that only ever learns a
   *  ceiling downward would run a paid account at free-tier caps forever, so
   *  after enough confirmations it deliberately goes back to running without
   *  one and lets itself be refused. */
  captureLimit(runtime) {
    const r = [...this.sql.exec(`SELECT * FROM capture_limits WHERE runtime = ?`, runtime)][0] || null;
    const PROBE_EVERY = 25;
    return r ? { ...r, probeDue: r.since_probe >= PROBE_EVERY, probeEvery: PROBE_EVERY }
             : { runtime, observed: null, probeDue: true, probeEvery: PROBE_EVERY };
  }

  /** Record an observation. Called with `observed: null` for a run that was
   *  never refused, which is NOT evidence about where the ceiling is and only
   *  advances the counter toward the next probe. */
  recordCaptureLimit({ runtime = "subrequests", observed = null, at = null }) {
    const now = at || new Date().toISOString().split(".")[0] + "Z";
    const cur = [...this.sql.exec(`SELECT * FROM capture_limits WHERE runtime = ?`, runtime)][0] || null;
    if (observed == null) {
      if (cur) this.sql.exec(`UPDATE capture_limits SET since_probe = since_probe + 1 WHERE runtime = ?`, runtime);
      return { runtime, observed: cur ? cur.observed : null, recorded: false,
               note: "a run that was never refused says the ceiling is at least what it spent, and nothing about where it is" };
    }
    if (!cur) {
      this.sql.exec(`INSERT INTO capture_limits (runtime, observed, observed_at, first_seen, samples, since_probe)
                     VALUES (?, ?, ?, ?, 1, 0)`, runtime, observed, now, now);
      return { runtime, observed, recorded: true, moved: false, samples: 1 };
    }
    if (cur.observed === observed) {
      this.sql.exec(`UPDATE capture_limits SET observed_at = ?, samples = samples + 1, since_probe = 0 WHERE runtime = ?`, now, runtime);
      return { runtime, observed, recorded: true, moved: false, samples: cur.samples + 1 };
    }
    /* It moved. Keep the old value and the date, because "the ceiling is 51"
       and "the ceiling was 51 until Tuesday and is now 1000" are different
       facts and only the second one is worth acting on. */
    this.sql.exec(`UPDATE capture_limits SET previous = observed, moved_at = ?, observed = ?, observed_at = ?, samples = 1, since_probe = 0
                   WHERE runtime = ?`, now, observed, now, runtime);
    return { runtime, observed, previous: cur.observed, moved: true, moved_at: now, recorded: true, samples: 1 };
  }

  /* ---- D-98: the task inbox ----
   *
   * Bob RULED that an undetermined-authority capture creates a task
   * AUTOMATICALLY AT CAPTURE, through a PRODUCER/CONSUMER QUEUE, and the queue
   * is the safety property rather than a transport detail.
   *
   * The split, stated once here because it is the whole point: the capture path
   * may only ENQUEUE. It cannot write a task, cannot name an assignee, cannot
   * set a status, cannot forge a history entry. Everything a member would READ
   * off a task is bounded at the enqueue boundary; everything a member would
   * ACT on is decided by the consumer, which is the sole writer. So the blast
   * radius of a leaked daemon credential stops at `task_queue`, where the worst
   * it can do is queue noise that dedups against itself.
   *
   * That is also why the grammar runs at the WRITE and not only at the gate.
   * The transport for these tasks MIGHT ONE DAY BE EMAIL, which renders in a
   * client we do not control, so a malformed task must never land at all rather
   * than be caught later at ratification.
   */

  /** PRODUCER. Called from the capture path. Bounds what it accepts, records
   *  no decision, and is idempotent on (kind, capture_sha) so a re-capture loop
   *  cannot flood the queue. */
  async taskEnqueue({ kind = "authority-undetermined", captureSha = null, subject = "", locator = null, at = null } = {}) {
    if (!TASK_KINDS.includes(kind)) return { ok: false, reason: "BAD_KIND", detail: `kind must be one of: ${TASK_KINDS.join(", ")}` };
    if (typeof captureSha !== "string" || !/^[0-9a-f]{64}$/.test(captureSha))
      return { ok: false, reason: "BAD_CAPTURE_SHA", detail: "a capture sha256 identifies the event; a bundle does not exist yet at capture time" };
    /* F5 bound applied HERE, at the boundary, not later. A subject that reaches
       the queue is already inert: single line, length-capped, and it will be
       rendered as quoted data by anything that shows it. */
    const text = boundedSubject(subject) || "a capture whose authority could not be determined";
    const loc = typeof locator === "string" && locator.length <= 2000 ? locator : null;
    const now = at && ISO_INSTANT.test(at) ? at : new Date().toISOString().split(".")[0] + "Z";
    const existing = this.#one(`SELECT capture_sha FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha);
    if (existing) {
      /* Still in the queue, so the consumer still owes it a drain: (re-)arm the
         alarm rather than assume the earlier enqueue's arming survived. */
      const armedAt = await this.#armDrain();
      return { ok: true, queued: false, deduped: true, kind, captureSha, armedAt };
    }
    this.sql.exec(
      `INSERT INTO task_queue (kind, capture_sha, subject, locator, enqueued) VALUES (?,?,?,?,?)`,
      kind, captureSha, text, loc, now);
    /* D-109: the enqueue arms the drain. This is the ONLY coupling the producer
       has to the consumer, and it is a schedule, not a write. */
    const armedAt = await this.#armDrain();
    return { ok: true, queued: true, deduped: false, kind, captureSha, enqueued: now, armedAt };
  }

  /** The RULED routing order, resolved at write time by the consumer.
   *
   *  1. the referred bundle's project manager, 2. a group admin, 3. nobody.
   *  A project's MANAGER is its owner in `project_participants`; the referred
   *  bundle is usually Information rather than a project, so a project that
   *  CITES it counts, which is what "the referred bundle's project" means in a
   *  record where evidence is shared and projects point at it.
   *
   *  Returns a `basis` for the drain report but never stores it on the task:
   *  the grammar is closed and a field invented here would be a second grammar. */
  #routeTask(bundleId) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, bundleId);
    const ownerOf = (projectId) => this.#one(
      `SELECT pp.member_id FROM project_participants pp
         JOIN members m ON m.member_id = pp.member_id
        WHERE pp.project_id = ? AND pp.owner = 1 AND m.status = 'active'
        ORDER BY pp.member_id LIMIT 1`, projectId);
    if (b && b.object_type === "project") {
      const o = ownerOf(bundleId);
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: "owner of the referred project" };
    }
    const cite = this.#one(
      `SELECT r.bundle_id AS project_id FROM refs r
         JOIN bundles pb ON pb.bundle_id = r.bundle_id AND pb.object_type = 'project'
        WHERE r.target_id = ? ORDER BY r.bundle_id`, bundleId);
    if (cite) {
      const o = ownerOf(cite.project_id);
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: `owner of ${cite.project_id}, which cites this bundle` };
    }
    const adm = this.#one(
      `SELECT member_id FROM members WHERE role = 'admin' AND status = 'active' ORDER BY created, member_id LIMIT 1`);
    if (adm) return { assignee: adm.member_id, assignee_role: "group-admin", basis: "no project manager; the RULED fallback to a group admin" };
    /* Named honestly rather than assigned to someone who does not exist. An
       unassigned task is still visible and still routable by hand; a task
       addressed to a phantom is not. */
    return { assignee: "unassigned", assignee_role: "group-admin", basis: "no project manager and no active administrator" };
  }

  #taskOf(row) {
    let locators = null, history = [];
    try { locators = row.locators ? JSON.parse(row.locators) : null; } catch { locators = null; }
    try { history = JSON.parse(row.history); } catch { history = []; }
    return {
      id: row.id, kind: row.kind, refers_to: row.refers_to,
      subject: { text: row.subject_text, ...(row.subject_desc ? { description: row.subject_desc } : {}) },
      ...(locators && locators.length ? { locators } : {}),
      assignee: row.assignee, assignee_role: row.assignee_role,
      status: row.status, created: row.created,
      ...(row.resolved_at ? { resolved_at: row.resolved_at } : {}),
      history,
    };
  }

  /** The C-19.1 grammar, run against a candidate task before it is stored.
   *  The EXPORTED catalog function, never a copy: a second grammar pretending
   *  to be the same one is the failure this reuse exists to avoid. */
  #refuseUngrammatical(task) {
    const findings = [];
    checkInboxGrammar(
      { files: new Map([["data/inbox.json", JSON.stringify({ tasks: [task] })]]),
        resolveTarget: (id) => !!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, id) },
      findings);
    const errs = findings.filter((x) => x.severity === "error");
    return errs.length ? { ok: false, reason: "UNGRAMMATICAL", findings: errs.map((e) => ({ check: e.check, detail: e.message })) } : null;
  }

  /** CONSUMER, and the SOLE writer of tasks.
   *
   *  Drains queued events, resolves each capture to the bundle that filed it,
   *  applies the routing order and the grammar, and folds a repeat into the
   *  live task rather than spawning a duplicate. An event whose capture has not
   *  been promoted into any bundle yet simply WAITS: at capture time no bundle
   *  exists, and inventing a refers_to would be worse than being patient. */
  taskDrain({ limit = 50, actor = "consumer", now = null } = {}) {
    const cap = Math.max(1, Math.min(500, Math.floor(Number(limit) || 50)));
    const at = now && ISO_INSTANT.test(now) ? now : new Date().toISOString().split(".")[0] + "Z";
    const queued = this.#rows(`SELECT * FROM task_queue ORDER BY enqueued, capture_sha LIMIT ?`, cap);
    const out = { drained: 0, created: [], folded: [], waiting: [], refused: [] };
    for (const q of queued) {
      const reg = this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, q.capture_sha);
      if (!reg) {
        this.sql.exec(`UPDATE task_queue SET attempts = attempts + 1, last_try = ? WHERE kind=? AND capture_sha=?`,
          at, q.kind, q.capture_sha);
        out.waiting.push({ captureSha: q.capture_sha, attempts: q.attempts + 1,
          detail: "the capture is not yet filed in any bundle; the event is kept, not dropped" });
        continue;
      }
      const live = this.#one(
        `SELECT * FROM tasks WHERE refers_to=? AND kind=? AND status IN ('open','forwarded')`, reg.bundle_id, q.kind);
      if (live) {
        /* The RULED fold. The task already in front of a member is the one that
           matters; a re-capture adds a dated note to it and nothing else. */
        const hist = this.#taskOf(live).history;
        hist.push({ at, event: "folded", actor });
        this.sql.exec(`UPDATE tasks SET history=? WHERE id=?`, JSON.stringify(hist), live.id);
        this.sql.exec(`DELETE FROM task_queue WHERE kind=? AND capture_sha=?`, q.kind, q.capture_sha);
        out.folded.push({ id: live.id, refers_to: reg.bundle_id });
        out.drained++;
        continue;
      }
      const route = this.#routeTask(reg.bundle_id);
      const year = at.slice(0, 4);
      const slug = taskSlug(q.subject);
      const alloc = this.allocId("TASK", year);
      const task = {
        id: `${alloc.id}-${slug}`,
        kind: q.kind,
        refers_to: reg.bundle_id,
        subject: { text: q.subject },
        ...(q.locator && isHttpsPublic(q.locator) ? { locators: [q.locator] } : {}),
        assignee: route.assignee,
        assignee_role: route.assignee_role,
        status: "open",
        created: at,
        history: [{ at, event: "created", actor }],
      };
      const bad = this.#refuseUngrammatical(task);
      if (bad) {
        /* Refused rather than stored malformed, and the event is DROPPED rather
           than retried forever: a grammar failure is deterministic, so retrying
           it is a loop. The refusal is reported so it is visible. */
        this.sql.exec(`DELETE FROM task_queue WHERE kind=? AND capture_sha=?`, q.kind, q.capture_sha);
        out.refused.push({ captureSha: q.capture_sha, refers_to: reg.bundle_id, findings: bad.findings });
        out.drained++;
        continue;
      }
      this.sql.exec(
        `INSERT INTO tasks (id, kind, refers_to, capture_sha, subject_text, subject_desc, locators,
                            assignee, assignee_role, status, created, resolved_at, history)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        task.id, task.kind, task.refers_to, q.capture_sha, task.subject.text, null,
        task.locators ? JSON.stringify(task.locators) : null,
        task.assignee, task.assignee_role, task.status, task.created, null,
        JSON.stringify(task.history));
      this.sql.exec(`DELETE FROM task_queue WHERE kind=? AND capture_sha=?`, q.kind, q.capture_sha);
      out.created.push({ id: task.id, refers_to: task.refers_to, assignee: task.assignee,
        assignee_role: task.assignee_role, basis: route.basis });
      out.drained++;
    }
    out.remaining = this.#one(`SELECT count(*) c FROM task_queue`).c;
    return { ok: true, ...out };
  }

  /** Read the inbox. Filterable by assignee and status, because the first thing
   *  a member wants is their own open work.
   *
   *  REC-30: a task's `refers_to` IS a bundle id (taskDrain writes the registering
   *  bundle's), and the row's whole subject is that bundle — its `subject_text`
   *  describes the document, and `refersTo` lets a caller ASK about one. So the
   *  D-15 predicate withholds the row, not a field, and it governs the `tasks`
   *  filter too: an uninvited member asking `refers=<a hidden project>` gets the
   *  same empty answer as for a bundle that does not exist.
   *
   *  The three task COUNTS are gated with the rows for REC-25's reason: a count
   *  bigger than the list says something is hidden, which is half the leak.
   *  `queued` is not — `task_queue` rows carry a capture sha and no bundle, so
   *  the number names nothing. */
  taskList({ assignee = null, status = null, refersTo = null, limit = 200, viewer = null } = {}) {
    const cap = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200)));
    /* `tk.` and not a bare column: see #bundleGate's refusal. */
    const seen = this.#bundleGate("tk.refers_to", viewer);
    const where = [`(${seen.sql})`], args = [...seen.args];
    if (assignee) { where.push("tk.assignee = ?"); args.push(assignee); }
    if (status) { where.push("tk.status = ?"); args.push(status); }
    if (refersTo) { where.push("tk.refers_to = ?"); args.push(refersTo); }
    const rows = this.#rows(
      `SELECT tk.* FROM tasks tk WHERE ${where.join(" AND ")} ORDER BY tk.created DESC, tk.id LIMIT ?`,
      ...args, cap);
    const n = (st) => this.#one(
      `SELECT count(*) c FROM tasks tk WHERE tk.status=? AND (${seen.sql})`, st, ...seen.args).c;
    return {
      ok: true,
      tasks: rows.map((r) => this.#taskOf(r)),
      counts: {
        open: n("open"),
        forwarded: n("forwarded"),
        resolved: n("resolved"),
        queued: this.#one(`SELECT count(*) c FROM task_queue`).c,
      },
    };
  }

  /** REC-4: the TASK-ACTOR FENCE, shared by taskForward and taskResolve.
   *
   *  The construct's accountability rule (BIO_Interaction_Constructs_v0_1.md,
   *  T · TASK): a task is an obligation with an ASSIGNEE, and its refusal shape
   *  is "this is not yours to resolve, and here is who it is with." Stamping the
   *  actor honestly into history made the act TRACEABLE but did not PREVENT it,
   *  so any member-class credential could resolve or forward ANY task by id. This
   *  is the prevention. The UI (UI-1) hides the verb on another member's task,
   *  but that gating is cosmetic until the plane enforces it — a caller that
   *  reaches the op directly must be refused here.
   *
   *  Who may act, and why:
   *   - the ASSIGNEE — it is theirs; a task is "mine" (the construct's word).
   *   - an ADMIN MEMBER — `#isAdminMember` (the ROOT admin session, actor
   *     "admin"; or any in-app member with role='admin'), the same "group admin"
   *     the routing (#routeTask) falls back to. The admin override stays.
   *   - any MEMBER, when the task is honestly `unassigned` — D-98's routing
   *     intends an unassigned task to stay CLAIMABLE and "routable by hand". An
   *     unassigned task exists PRECISELY because routing found no project manager
   *     and no active admin (#routeTask's last arm), so requiring assignee-or-
   *     admin would strand it forever — the exact over-fencing REC-4 warns
   *     against. DEC-7 raises whether "claimable" should be narrowed to the
   *     routed role (member_expertise → PM → group admin) rather than any actor,
   *     and KEEPS it open: the routing that produced `unassigned` had already
   *     exhausted PM and active admin, and member_expertise is doctrine'd as a
   *     HINT for a human forward rather than an automatic gate.
   *
   *  WHAT THIS FENCE DOES NOT ANSWER, corrected 2026-08-04 (REC-28, D-151), and
   *  the correction is the point of the item. This comment used to say that a
   *  machine credential (`actor` = "token:member" / "token:probe" /
   *  "token:admin") "is neither a member nor ROOT_ADMIN, so it is fenced off an
   *  ASSIGNED task and can only act on an unassigned one", and cited D-98's "a
   *  daemon cannot close somebody's work". Every clause of that was true and it
   *  described a guarantee the code did not make: the FIRST line below allows on
   *  `unassigned` BEFORE it has looked at the caller at all, so a machine could
   *  RESOLVE an unassigned task and close an obligation with no member act. A
   *  daemon cannot close somebody's work; it could close NOBODY'S work, and
   *  closing is the act.
   *
   *  The hole is closed at the ACT and not here (taskForward/taskResolve refuse
   *  `token:` actors BY SHAPE with MACHINE_CANNOT_FORWARD/MACHINE_CANNOT_RESOLVE,
   *  the MACHINE_CANNOT_RELEASE precedent), so the refusal does not depend on
   *  assignment state at all. BOTH fences stay, because they answer different
   *  questions and the second is not derivable from the first: THIS one answers
   *  *is this THIS member's task*, and the act refusal answers *is this a person
   *  at all*. So the "anyone" above now honestly reads "any member" — not
   *  because this function checks it, but because no machine reaches this
   *  function on these two verbs any more.
   *
   *  Returns a NOT_YOURS refusal NAMING who it is with, or null to proceed. */
  #refuseNotYours(row, actor, verb) {
    if (row.assignee === "unassigned") return null;
    if (actor === row.assignee) return null;
    if (this.#isAdminMember(actor)) return null;
    return {
      ok: false,
      reason: "NOT_YOURS",
      detail: `this task is not yours to ${verb}; it is with ${row.assignee}`,
      assignee: row.assignee,
      assignee_role: row.assignee_role,
    };
  }

  /** Forward a task to a member better placed to attest it.
   *
   *  A MEMBER action, never a daemon one: the ruling makes forwarding a human
   *  judgement, and `member_expertise` is a hint for that human rather than an
   *  automatic reassignment. The prior assignment stays in history, because who
   *  a task was taken FROM is as much a fact as who holds it now.
   *
   *  REC-28 / D-151: "never a daemon one" is now ENFORCED and not only stated.
   *  A machine credential's actor is stamped `token:<class>` by the control
   *  plane, so it is refused BY SHAPE — the MACHINE_CANNOT_RELEASE / CONCLUDE /
   *  REOPEN precedent, and the same one rule in a fifth place: a machine may
   *  surface, route and prepare; a member authors, resolves and forwards. It is
   *  checked BEFORE the row is read, so unlike the TASK-ACTOR FENCE it cannot
   *  depend on assignment state — which is exactly how the hole existed.
   *
   *  The precedent's `who === "member"` arm does NOT carry over, deliberately:
   *  on these two verbs the control plane stamps every machine credential
   *  `token:<class>` (never a bare class word), while the bare string "admin" is
   *  a LEGITIMATE actor here — it is ROOT_ADMIN's own session (`#isAdminMember`)
   *  — so a bare-class arm would refuse the root administrator's browser. */
  taskForward({ id = null, to = null, actor = null, now = null } = {}) {
    if (!actor) return { ok: false, reason: "NO_ACTOR", detail: "a forward is recorded under the member who made it" };
    if (/^token:/.test(String(actor)))
      return { ok: false, reason: "MACHINE_CANNOT_FORWARD",
               detail: "forwarding a task hands an obligation to a named person, and deciding who is "
                     + "better placed to answer it is a member's judgement. A machine credential may "
                     + "surface a task and route it at drain time, and may not re-address one. "
                     + "Sign in as a member." };
    const row = this.#one(`SELECT * FROM tasks WHERE id=?`, id);
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.status === "resolved") return { ok: false, reason: "ALREADY_RESOLVED", detail: "a resolved task is not forwarded; a new determination opens a new task" };
    const fenced = this.#refuseNotYours(row, actor, "forward");
    if (fenced) return fenced;
    const target = this.#one(`SELECT member_id FROM members WHERE member_id=? AND status='active'`, to);
    if (!target) return { ok: false, reason: "NO_SUCH_MEMBER", detail: "a task is forwarded to an active member of this group" };
    if (target.member_id === row.assignee) return { ok: false, reason: "ALREADY_THEIRS" };
    const at = now && ISO_INSTANT.test(now) ? now : new Date().toISOString().split(".")[0] + "Z";
    const task = this.#taskOf(row);
    task.history.push({ at, event: "forwarded", actor });
    task.assignee = target.member_id;
    task.assignee_role = "member";
    task.status = "forwarded";
    const bad = this.#refuseUngrammatical(task);
    if (bad) return bad;
    this.sql.exec(`UPDATE tasks SET assignee=?, assignee_role=?, status=?, history=? WHERE id=?`,
      task.assignee, task.assignee_role, task.status, JSON.stringify(task.history), id);
    return { ok: true, id, assignee: task.assignee, assignee_role: task.assignee_role, from: row.assignee, at };
  }

  /** Resolve a task. Also a member action — and, as of REC-28 (D-151), a member
   *  action the code enforces rather than a comment that describes one.
   *
   *  RESOLVING IS THE CLOSING ACT: the obligation the record raised is answered
   *  and stops asking. Before this refusal a machine credential could close an
   *  UNASSIGNED task, because the TASK-ACTOR FENCE allows on `unassigned` before
   *  it looks at the caller — an obligation discharged with `actor:
   *  "token:probe"` in its history and no member anywhere in it. The refusal is
   *  at the ACT and by SHAPE (the MACHINE_CANNOT_RELEASE / CONCLUDE / REOPEN
   *  precedent), checked before the row is read, so it holds whatever the task's
   *  assignment is.
   *
   *  `taskDrain` is deliberately untouched and is the daemon's path: draining
   *  turns queued events into tasks and ROUTES them, which is surfacing work
   *  rather than discharging it. Nothing a drain does closes an obligation. */
  taskResolve({ id = null, actor = null, now = null } = {}) {
    if (!actor) return { ok: false, reason: "NO_ACTOR", detail: "a resolution is recorded under the member who made it" };
    if (/^token:/.test(String(actor)))
      return { ok: false, reason: "MACHINE_CANNOT_RESOLVE",
               detail: "resolving a task says the obligation the record raised has been answered, and "
                     + "that is a named member's act. A machine credential may surface a task, route it "
                     + "and prepare what it needs, and may not close it — an unassigned task is nobody's "
                     + "work, and closing nobody's work is still closing. Sign in as a member." };
    const row = this.#one(`SELECT * FROM tasks WHERE id=?`, id);
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.status === "resolved") return { ok: true, id, already: true, resolved_at: row.resolved_at };
    const fenced = this.#refuseNotYours(row, actor, "resolve");
    if (fenced) return fenced;
    const at = now && ISO_INSTANT.test(now) ? now : new Date().toISOString().split(".")[0] + "Z";
    const task = this.#taskOf(row);
    task.history.push({ at, event: "resolved", actor });
    task.status = "resolved";
    task.resolved_at = at;
    const bad = this.#refuseUngrammatical(task);
    if (bad) return bad;
    this.sql.exec(`UPDATE tasks SET status=?, resolved_at=?, history=? WHERE id=?`,
      task.status, at, JSON.stringify(task.history), id);
    return { ok: true, id, status: "resolved", resolved_at: at };
  }

  /* ---- D-104: source reachability ----
   *
   * The archive fallback fires after THREE CONSECUTIVE FAILURES OR FOURTEEN
   * DAYS (RULED, AUTHORITY-AND-TRUST.md). This is the counter it will read, and
   * the whole reason it exists before the fallback does is so the exclusion
   * below is designed in rather than discovered afterwards.
   *
   * A GOVERNED REFUSAL IS NOT A FAILURE. When the per-host governor holds a
   * request, the source was never asked, so nothing was learned about it. If a
   * governed refusal counted, sustained self-throttling would trip the fallback:
   * we would fetch from the Internet Archive because WE paced ourselves, which
   * is backwards, and it would load somebody else's infrastructure to solve a
   * problem we created. Bob, 2026-07-31: the governor keeps traffic low enough
   * that being banned is not a concern, which is exactly why its refusals will
   * be COMMON and must never be mistaken for the source being unreachable.
   *
   * The same shape of mistake the 2026-07-31 CDX measurement found in a
   * different mechanism: an empty-body digest matching another empty-body digest
   * looks like "unchanged" and means nothing. Equality that costs nothing to
   * produce is not evidence.
   */

  /* CHOSEN, not measured, and recorded as such in MEASUREMENTS.md. Bob framed
     three-or-fourteen as a suggestion for finding an auditable alternative path
     and left the metric to this thread, 2026-07-31.
     *
     * The third constant is the thread's own judgement and the reason it exists
     * is worth stating. With a single failure able to age into eligibility, a
     * document that failed once and was then never retried becomes eligible
     * after a fortnight, which reads OUR MONITORING NEGLECT as the source being
     * unreachable. That is D-104's mistake one level up: an outcome that cost
     * nothing to produce (not asking again) turning into evidence about someone
     * else. So the age arm requires corroboration too. Two failures a fortnight
     * apart is a source that has actually been unreachable; one failure and
     * silence is a gap in our own attention. */
  static FALLBACK_CONSECUTIVE_FAILURES = 3;
  static FALLBACK_STALE_DAYS = 14;
  static FALLBACK_MIN_FAILURES_FOR_AGE = 2;

  /* Overridable PER INSTANCE at deploy time, never at runtime, exactly as
     GOVERNOR_APPETITE_PER_MIN is. A test instance can be told to fail fast so
     the fallback can be exercised without waiting a fortnight; a runtime op
     would be a fence anyone holding a credential could lower, which is not a
     fence. Bad values fall back to the constants rather than being obeyed. */
  #thresholds() {
    const pick = (v, dflt, min) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= min ? n : dflt;
    };
    return {
      failures: pick(this.env.FALLBACK_CONSECUTIVE_FAILURES, Store.FALLBACK_CONSECUTIVE_FAILURES, 1),
      days: pick(this.env.FALLBACK_STALE_DAYS, Store.FALLBACK_STALE_DAYS, 0),
      minForAge: pick(this.env.FALLBACK_MIN_FAILURES_FOR_AGE, Store.FALLBACK_MIN_FAILURES_FOR_AGE, 1),
    };
  }

  /* ==================================================================
   *  CAP-3: the archive-fallback MONITORING consumer.
   *
   *  The decision half and the capture half of the archive fallback both work
   *  and are live-verified, and NOTHING invoked them: no periodic actor
   *  consulted `source_reachability` and nothing fired the fallback (the largest
   *  gap between what is built and what runs). This is the consumer that closes
   *  it. It is REC-1's designed extension — one entry appended to the single
   *  reconciling DO alarm's `#schedConsumers` registry (RECORD's scheduler,
   *  DORMANT, this cross-area touch authorised by CONDUCT) — NOT a second alarm
   *  and NOT a cron. SCHEDULER.md is the authority for why.
   *
   *  Each tick consults `sourcereach` for every document whose CURRENT failing
   *  run could reach the RULED threshold, and for those the fence finds
   *  `fallback_eligible` it fires the fallback by invoking op=acquire with
   *  via:"archive.org" and the DOCUMENT address — the SAME op a caller uses, so
   *  the two-hop grade-C chain, the re-checked eligibility fence and the
   *  provenance hop built from the CDX record that call itself fetches are all
   *  produced by one code path that cannot drift (D-112). It reaches that op over
   *  `env.SELF`, a service binding to this instance's own Worker, under a daemon
   *  credential: the archive arm is admin/probe by design, "an operator or daemon
   *  credential, never a member's".
   *
   *  D-104 is load-bearing here and was read before this was written: a governed
   *  refusal is OUR OWN politeness declining and moves no failure counter, so a
   *  self-throttled instance never trips the fallback. The exclusion lives in
   *  `recordSourceOutcome`; this tick only reads the verdict that respects it.
   *
   *  INERT unless configured. With no `env.SELF` and no daemon token the consumer
   *  contributes no wake and holds no alarm — exactly the SCHED_PROBE seam's
   *  posture — so an instance that has not wired monitoring behaves byte-for-byte
   *  as it did before. Live wiring is per-instance because THE INSTANCE NAME IS
   *  THE WORKER NAME (a static self-binding target would be wrong on a deployed
   *  slug), so it is provisioned by the installer/CONDUCT, not by this file. */
  static MONITOR_TICK_MS = 3600000;   // 1h. Cadence is the binding variable, not corpus size (ARCHIVE-FALLBACK.md).
  static MONITOR_TICK_BATCH = 50;     // eligible documents acted on per tick, bounded like TASK_DRAIN_ALARM_BATCH.

  #monitorTickMs() {
    const v = Number(this.env && this.env.MONITOR_TICK_MS);
    return Number.isFinite(v) && v >= 0 ? v : Store.MONITOR_TICK_MS;
  }
  /* The archive arm of op=acquire is admin/probe only. A dedicated MONITOR_TOKEN
     is preferred so the monitoring surface can be scoped and rotated on its own;
     ADMIN_TOKEN is the fallback, because monitoring writes the real record's
     reachability, not scratch. */
  #monitorToken() {
    return (this.env && (this.env.MONITOR_TOKEN || this.env.ADMIN_TOKEN)) || null;
  }
  #monitorConfigured() {
    return !!(this.env && this.env.SELF && typeof this.env.SELF.fetch === "function" && this.#monitorToken());
  }
  /* The smallest consecutive-failure count from which a document could still
     reach EITHER arm: the count arm at `failures`, or the age arm at `minForAge`
     then fourteen days. A SINGLE unretried failure is deliberately below this and
     is NOT monitoring work for the archive tick — that is a gap in our own
     attention for the ordinary path to retry, D-104 one level up (the age arm's
     own reasoning in `sourceReachability`), never evidence the source is gone. */
  #monitorFloor() {
    const TH = this.#thresholds();
    return Math.max(1, Math.min(TH.failures, TH.minForAge));
  }
  /* Pending monitoring work keeps the one alarm armed; none lets it
     self-terminate on an idle Free-tier instance (the property REC-1 prized). */
  #monitorPending() {
    if (!this.#monitorConfigured()) return false;
    return this.#one(`SELECT count(*) c FROM source_reachability WHERE consecutive_failures >= ?`,
                     this.#monitorFloor()).c > 0;
  }

  /* The tick. Consult sourcereach for every failing document and fire the archive
     fallback for those the fence finds eligible. It records nothing about the
     source itself: op=acquire's own path records the outcome of the ARCHIVE fetch
     against the DOCUMENT address, and a success there is the RULED "an alternative
     source counts as a re-fetch for monitoring", which resets the failing run and
     drops the document out of eligibility on the next tick. The tick only DECIDES
     and INVOKES; the counter and the capture stay where they already live. */
  async #monitorTick(now) {
    if (!this.#monitorConfigured()) return { monitor: { configured: false } };
    const nowIso = Number.isFinite(now)
      ? new Date(now).toISOString().split(".")[0] + "Z"
      : new Date().toISOString().split(".")[0] + "Z";
    const rows = this.#rows(
      `SELECT address_norm FROM source_reachability
        WHERE consecutive_failures >= ? ORDER BY first_failure_since LIMIT ?`,
      this.#monitorFloor(), Store.MONITOR_TICK_BATCH);
    const eligible = [], fired = [], failed = [];
    for (const { address_norm } of rows) {
      const reach = this.sourceReachability({ addressNorm: address_norm, now: nowIso });
      if (!reach.fallback_eligible) continue;   // governed refusals excluded here, in the verdict (D-104)
      eligible.push(address_norm);
      const r = await this.#fireArchiveFallback(address_norm);
      (r.ok ? fired : failed).push(r.ok
        ? { address: address_norm, grade: r.grade, hops: r.hops }
        : { address: address_norm, reason: r.reason });
    }
    return { monitor: { configured: true, at: nowIso, checked: rows.length, eligible, fired, failed } };
  }

  /* Fire the fallback through the SAME op a caller uses, so every fence in that
     path holds and the chain is built once. A caller supplies no hop, no replay
     URL and no CDX evidence: op=acquire re-checks eligibility and builds the
     archive hop from the record IT fetched, which is exactly why the invocation
     names only the document address. */
  async #fireArchiveFallback(address) {
    const token = this.#monitorToken();
    try {
      const res = await this.env.SELF.fetch(
        new Request(`https://self/api/?op=acquire&token=${encodeURIComponent(token)}`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ via: "archive.org", address }),
        }));
      const out = await res.json().catch(() => null);
      const doc = out && out.ok && out.document;
      if (doc) return { ok: true,
        grade: doc.capture && doc.capture.grade,
        hops: Array.isArray(doc.provenance_chain) ? doc.provenance_chain.length : null,
        sha: doc.capture && doc.capture.sha256 };
      return { ok: false, reason: (out && (out.reason || out.error)) || `http ${res.status}` };
    } catch (e) {
      return { ok: false, reason: String(e && e.message || e) };
    }
  }

  /** Record the outcome of one attempt on one document address.
   *
   *  `outcome` is deliberately a closed set, because the entire value of this
   *  table is that it distinguishes kinds of not-getting-the-bytes, and a free
   *  string would let a caller collapse the distinction by accident.
   *    success         the source served us the document
   *    source_refused  the ORIGIN answered 4xx/5xx: evidence about the source
   *    fetch_failed    the network failed reaching it: also evidence
   *    governed        OUR governor declined to ask: evidence about US
   */
  async recordSourceOutcome({ addressNorm = null, outcome = null, status = null, at = null } = {}) {
    if (typeof addressNorm !== "string" || addressNorm === "")
      return { ok: false, reason: "NO_ADDRESS" };
    if (!SOURCE_OUTCOMES.includes(outcome))
      return { ok: false, reason: "BAD_OUTCOME", detail: `outcome must be one of: ${SOURCE_OUTCOMES.join(", ")}` };
    const now = at && ISO_INSTANT.test(at) ? at : new Date().toISOString().split(".")[0] + "Z";
    const st = Number.isInteger(status) ? status : null;
    this.sql.exec(
      `INSERT INTO source_reachability (address_norm, updated_at) VALUES (?, ?)
       ON CONFLICT(address_norm) DO NOTHING`, addressNorm, now);

    if (outcome === "governed") {
      /* Counted, and counted SEPARATELY. consecutive_failures is untouched, and
         so is first_failure_since: a document we chose not to ask about has not
         started being unreachable. last_outcome records it so an operator can
         see that the silence is ours. */
      this.sql.exec(
        `UPDATE source_reachability
            SET governed_refusals = governed_refusals + 1, last_outcome = ?, updated_at = ?
          WHERE address_norm = ?`, outcome, now, addressNorm);
      return { ok: true, counted: false, ...this.sourceReachability({ addressNorm, now }) };
    }

    if (outcome === "success") {
      this.sql.exec(
        `UPDATE source_reachability
            SET attempts = attempts + 1, consecutive_failures = 0, first_failure_since = NULL,
                last_success = ?, last_outcome = ?, last_status = ?, updated_at = ?
          WHERE address_norm = ?`, now, outcome, st, now, addressNorm);
      return { ok: true, counted: true, ...this.sourceReachability({ addressNorm, now }) };
    }

    /* A real failure, produced by the source or by the network reaching it. */
    this.sql.exec(
      `UPDATE source_reachability
          SET attempts = attempts + 1, failures_total = failures_total + 1,
              consecutive_failures = consecutive_failures + 1,
              first_failure_since = COALESCE(first_failure_since, ?),
              last_failure = ?, last_outcome = ?, last_status = ?, updated_at = ?
        WHERE address_norm = ?`, now, now, outcome, st, now, addressNorm);
    /* CAP-3. A counted failure is the archive-monitor consumer's producer: it may
       have just pushed this document to the fallback threshold, so arm the one DO
       alarm the way taskEnqueue arms the drain (SCHEDULER.md: "arm it from
       whatever producer creates its work"). Arming only ever SCHEDULES, never
       writes work, so the producer/consumer split holds. Gated on the consumer
       being configured so an instance that has not wired monitoring neither arms
       nor holds an alarm — governed and success never reach here, so the D-104
       exclusion is preserved structurally rather than re-checked. */
    if (this.#monitorConfigured()) await this.#armScheduler();
    return { ok: true, counted: true, ...this.sourceReachability({ addressNorm, now }) };
  }

  /** The reachability of one document address, and whether the RULED fallback
   *  threshold is met. Returns the verdict AND the two facts it is computed
   *  from, so a caller never has to re-derive it and a reader can see why. */
  sourceReachability({ addressNorm = null, now = null } = {}) {
    const row = this.#one(`SELECT * FROM source_reachability WHERE address_norm=?`, addressNorm);
    if (!row) {
      return { address_norm: addressNorm, known: false, consecutive_failures: 0,
               governed_refusals: 0, fallback_eligible: false,
               basis: "no attempt on this address has ever been recorded" };
    }
    const at = now && ISO_INSTANT.test(now) ? now : new Date().toISOString().split(".")[0] + "Z";
    const TH = this.#thresholds();
    const byCount = row.consecutive_failures >= TH.failures;
    /* Staleness runs from the FIRST failure in the current run, not from the
       last success: a document that has been failing for fourteen days is the
       case the ruling names, and a document nobody has asked about in fourteen
       days has not failed at all. */
    const since = row.first_failure_since ? Date.parse(row.first_failure_since) : null;
    const staleDays = since === null ? 0 : (Date.parse(at) - since) / 86400000;
    /* The age arm means THE CURRENT FAILING RUN HAS LASTED fourteen days, not
       "we last succeeded fourteen days ago". A document nobody has asked about
       in a fortnight has not failed; a document that has been failing since a
       fortnight ago has. One failure is enough to start that clock, because the
       clock is measuring how long the record has been without the document, and
       a single unretried failure that old is itself a monitoring problem the
       fallback is entitled to route around. */
    const byAge = row.consecutive_failures >= TH.minForAge && staleDays >= TH.days;
    return {
      address_norm: row.address_norm,
      known: true,
      consecutive_failures: row.consecutive_failures,
      attempts: row.attempts,
      failures_total: row.failures_total,
      /* Reported beside the verdict on purpose. A number excluded from a
         decision must stay visible or the exclusion cannot be audited. */
      governed_refusals: row.governed_refusals,
      last_success: row.last_success || null,
      last_failure: row.last_failure || null,
      last_outcome: row.last_outcome || null,
      last_status: row.last_status === null ? null : row.last_status,
      first_failure_since: row.first_failure_since || null,
      failing_days: since === null ? 0 : Math.floor(staleDays),
      fallback_eligible: byCount || byAge,
      /* Reported so a verdict can be audited against the thresholds actually in
         force, which on a test instance are not the shipped constants. */
      thresholds: TH,
      basis: byCount
        ? `${row.consecutive_failures} consecutive failures produced by the source, threshold ${TH.failures}`
        : byAge
          ? `failing since ${row.first_failure_since}, ${Math.floor(staleDays)} days, threshold ${TH.days} with at least ${TH.minForAge} failures`
          : row.governed_refusals > 0 && row.consecutive_failures === 0
            ? `not eligible: ${row.governed_refusals} governed refusal(s) recorded and DELIBERATELY not counted; the source has not failed`
            : row.consecutive_failures === 1 && staleDays >= TH.days
              ? `not eligible: failing for ${Math.floor(staleDays)} days but on ONE failure that was never retried, which is a gap in our monitoring rather than evidence the source is unreachable; retry it`
              : "not eligible: the threshold is not met",
    };
  }

  async fetch(req) {
    const url = new URL(req.url);
    const op = url.pathname.slice(1);
    /* D-39. An empty POST body used to throw here, BEFORE any op was dispatched,
       so the caller saw a Cloudflare worker exception (error 1101) rather than a
       BIO refusal. It was general to every op and it turned a client bug into an
       opaque platform error. An absent body is now simply null, which is what a
       GET already passes and what every op that takes no body already expects;
       a body that is present but not JSON is refused by name. */
    let body = null;
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw.trim() !== "") {
        try { body = JSON.parse(raw); }
        catch {
          return Response.json({ ok: false, reason: "BAD_JSON",
            detail: "the request body is not valid JSON" }, { status: 400 });
        }
      }
    }
    /* REC-30: the envelope carried an `ms` wall-clock field and NOTHING read it.
       It was spread into every control-plane response, where it was two things
       and neither of them good: a timing signal about work the caller did not
       ask about, and a standing hazard for the byte-comparison assertions the
       D-15 posture rests on — REC-25's suite had to strip it client-side because
       a 0ms-vs-1ms pair made "hidden and absent answer identically" flake about
       one run in twenty. Removed at the SOURCE, which retires the hazard instead
       of documenting it. If a caller ever genuinely needs the timing, it must be
       NAMED and asked for; an unnamed one is how this got here. */
    try {
      const map = {
        promote: () => this.promote(body),
        allocid: () => this.allocId(url.searchParams.get("prefix"), url.searchParams.get("year")),
        lease: () => this.acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 300000),
        /* REC-25 / F-8: the D-15 gate on the whole-image and single-file
           reads. `viewer` is stamped by the control plane, never taken from a
           caller's own parameters there; an invisible bundle answers null,
           exactly as an absent one does, and an absent viewer sees nothing
           (fail closed, the search path's own posture). The METHODS stay
           ungated because the store itself is a legitimate whole-corpus
           reader (audit, eachImage, ratify's assembly); this dispatch map is
           the store's one external door. */
        image: () => this.#viewerSees(url.searchParams.get("id"), url.searchParams.get("viewer"))
          ? this.readImage(url.searchParams.get("id")) : null,
        file: () => this.#viewerSees(url.searchParams.get("id"), url.searchParams.get("viewer"))
          ? this.readFile(url.searchParams.get("id"), url.searchParams.get("path")) : null,
        list: () => this.listBundles({ type: url.searchParams.get("type"), state: url.searchParams.get("state"),
                                       after: url.searchParams.get("after") || null,
                                       limit: url.searchParams.get("limit"),
                                       viewer: url.searchParams.get("viewer") }),
        index: () => this.buildIndex({ viewer: url.searchParams.get("viewer") }),
        /* REC-25: the gated backlink read — reverse edges into a bundle,
           filtered by the viewer's position (7.9). */
        backlinks: () => this.backlinks({ target: url.searchParams.get("target"),
                                          viewer: url.searchParams.get("viewer") }),
        capturelimit: () => this.captureLimit(url.searchParams.get("runtime") || "subrequests"),
        siteassets: () => this.siteAssets(body || { host: url.searchParams.get("host") }),
        recordsiteassets: () => this.recordSiteAssets(body || {}),
        /* CAP-4: reuse verification. `reusedparts` enumerates a bundle's reused
           parts so ratification can re-fetch them; `recordreuseverdicts` commits
           the outcomes the control plane produced; `reuseverdicts` reads them
           (also surfacing the free posthoc verdicts by source_capture). */
        /* REC-11: the basis projection, read back. `basis` is a bundle's legs
           in document order; `restson` is the reverse index — which inquiries
           rest on this document (or on this inquiry), ONE indexed lookup on
           inquiry_basis_target. DO-internal reads for the battery and for
           REC-12's derivation; E2/REC-17 give them their control-plane
           surfaces. */
        basis: () => this.basisFor(url.searchParams.get("id")),
        restson: () => this.restingOn(url.searchParams.get("id")),
        /* REC-12: the derived strength PAIR, on read. A DO-internal read of
           the same class as basis/restson — REC-14 stamps this pair into the
           ratified bytes and REC-22 serves it, and those are the items that
           give it a control-plane surface. Answers TWO axis objects and no
           scalar: there is nothing here for a caller to reduce to one letter. */
        strength: () => this.strengthOf(url.searchParams.get("id")),
        reusedparts: () => this.reusedParts(url.searchParams.get("id")),
        recordreuseverdicts: () => this.recordReuseVerdicts(body || {}),
        reuseverdicts: () => this.reuseVerdicts({ bundleId: url.searchParams.get("bundle"),
                                                  sourceCapture: url.searchParams.get("capture") }),
        /* CONSTRUCTS Step 3 (FW-5): read a captured document's reading by capture
           sha, and the reverse index by raw entity reference. */
        /* REC-30: `viewer` is stamped by the control plane, never read from a
           caller's own parameters there, and an absent one fails closed — the
           bundle back-reference is withheld rather than the answer refused. */
        reading: () => this.readingFor(url.searchParams.get("sha256"), url.searchParams.get("viewer")),
        readingref: () => this.documentsByReference(url.searchParams.get("ref"), url.searchParams.get("viewer")),
        /* CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY. Create an entity
           (with inline aliases), attach an alias, declare a constitutive relation;
           read an entity BY KEY, entities BY ALIAS, and one relation by id. A
           declared relation carries a justification + citation and NO grade (D-83). */
        entitycreate: () => this.createEntity(body || {}),
        entityalias: () => this.addEntityAlias(body || {}),
        relationdeclare: () => this.declareRelation(body || {}),
        entity: () => this.readEntity({ entityId: url.searchParams.get("id") }),
        entitybyalias: () => this.entitiesByAlias({ alias: url.searchParams.get("alias") }),
        relation: () => this.readRelation({ relationId: url.searchParams.get("id") }),
        /* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISERS. resolve runs the
           recogniser over a captured document's references and stores each resolution
           with its §8.1 grade (A/B/C, never D — the machine never testifies);
           resolvetestify is the member's grade-D testimony path; resolutions reads a
           document's resolutions; concerns is the REVERSE INDEX, every document that
           concerns an entity, by joining on entity_id (never through a relation). */
        resolve: () => this.resolveReferences(body || {}),
        resolvetestify: () => this.testifyResolution(body || {}),
        resolutions: () => this.resolutionsForCapture({ captureSha: url.searchParams.get("sha256"),
                                                        viewer: url.searchParams.get("viewer") }),
        concerns: () => this.documentsConcerning({ entityId: url.searchParams.get("id"),
                                                   viewer: url.searchParams.get("viewer") }),
        /* CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA carrying a GRADE (the
           two-node base case of a progression), and the PROGRESSION DEFINITION as data.
           connect DERIVES the connections among the documents that concern one entity,
           each graded the WEAKER of its two ends (D-67 storage + D-72 grade); connections
           reads them by entity or by capture; progressiondefine authors an ordered stage
           set (both example progressions expressible as rows); progression reads one. */
        connect: () => this.deriveConnections(body || { entityId: url.searchParams.get("id") }),
        connections: () => this.connectionsFor({ entityId: url.searchParams.get("id"),
                                                 captureSha: url.searchParams.get("sha256"),
                                                 viewer: url.searchParams.get("viewer") }),
        progressiondefine: () => this.defineProgression(body || {}),
        progression: () => this.readProgression({ progressionKey: url.searchParams.get("key") }),
        /* CONSTRUCTS Step 5, SLICE B (FW-9): PROGRESSION INSTANCES and the MISSING-PREDECESSOR
           finding. op=thread threads REAL captured documents through a definition's stages by
           a threading entity (only documents that resolve to it, FW-7), stamping threaded_by
           below; op=instance reads the instance with its grade (the weakest connection along
           the N-stage chain, D-73) and its missing-predecessor findings, derived on read. */
        thread: () => this.threadInstance({ ...(body || {}), viewer: url.searchParams.get("viewer") }),
        instance: () => this.readInstance({ progressionKey: url.searchParams.get("key"),
                                            entityId: url.searchParams.get("id"),
                                            viewer: url.searchParams.get("viewer") }),
        /* CONSTRUCTS Step 5, SLICE C (FW-10): EXCEPTION DOCUMENTS that discharge a lawful skip.
           op=discharge records an exception document (a real captured document resolving to the
           threading entity, naming the stage it discharges, carrying reason + citation), stamping
           declared_by below; op=instance then renders that stage as a "discharged" state rather
           than a missing-predecessor finding. op=exceptions reads the raw discharge rows. */
        discharge: () => this.dischargeStage({ ...(body || {}), viewer: url.searchParams.get("viewer") }),
        exceptions: () => this.readExceptions({ progressionKey: url.searchParams.get("key"),
                                                entityId: url.searchParams.get("id"),
                                                viewer: url.searchParams.get("viewer") }),
        /* REC-6: op=proposals, the DISCOVERY feed for derived findings (UI-5's delegation). A
           read-time walk of every progression instance for its missing-predecessor findings,
           D-79-aggregated per (progression_key, stage_key). Reports, never mutates. */
        /* REC-8: `now` is an optional AS-OF instant (ms) so a suite can pin the clock the
           overdue-successor findings are computed against, deterministically — the same seam
           op=sourcereach opened for its time-armed verdict. Absent, the feed uses env BIO_NOW_MS
           if set, else the wall clock. */
        proposals: () => this.proposalsFeed(url.searchParams.get("now")),
        /* REC-9: op=captureprogressions, the per-document progression lookup (UI-9's delegation).
           Maps a CAPTURE back to the progression instances it is threaded into, its stage in each,
           and each instance's missing_predecessor + overdue_successor findings — REUSING the ONE
           derivation point (#assembleInstance + REC-8's #overdueFindings), keyed by capture instead
           of by (progression, entity). `now` is the same optional as-of clock op=proposals takes, so
           the overdue computation is deterministic in a suite. Reports, never mutates. */
        captureprogressions: () => this.captureProgressions({ captureSha: url.searchParams.get("sha256"),
                                                              nowMs: url.searchParams.get("now") }),
        /* REC-20 / DEC-16: op=queue, the member's ONE feed — OBLIGATIONs from
           `tasks` and FINDINGs from the proposals derivation in one contract,
           each carrying its class, its options[] (REC-19's derivation) and its
           `case` set: EVERY ancestor over the bounded basis/citation walk.
           `member` and `viewer` are BOTH stamped by the control plane and
           never taken from a caller — whose queue it is and whose view the
           case names compile for are server decisions. The store fails closed
           on an absent viewer (D-15), so a missing stamp yields an ungrouped
           feed rather than an unfiltered one. */
        queue: () => this.queueFeed({ member: url.searchParams.get("member"),
                                      viewer: url.searchParams.get("viewer"),
                                      nowMs: url.searchParams.get("now"),
                                      limit: url.searchParams.get("limit") }),
        /* REC-21: the PERSONAL half. Both take `member` and `viewer` from the
           control plane's server-side stamps and NEVER from a body — a caller who
           could name the member could mute somebody else's attention. Both write
           to queue_state and to nothing else: no task row, no disposition, no
           bundle. Declining is not authoring (op=proposedispose's precedent), and
           a preference is not even a disposition. */
        queuemute: () => this.queueMute({ ...(body || {}),
                                          member: url.searchParams.get("member"),
                                          viewer: url.searchParams.get("viewer") }),
        queuesnooze: () => this.queueSnooze({ ...(body || {}),
                                              member: url.searchParams.get("member"),
                                              viewer: url.searchParams.get("viewer") }),
        /* REC-7: op=proposedispose, record a member's DEFER/DISMISS of a derived proposal WITHOUT
           minting a bundle (D-79 — declining is not authoring). Writes one disposition row keyed by
           (progression_key, stage_key); op=proposals then ages that proposal out of the open feed.
           decidedBy is stamped server-side at index.mjs, like every other authorship. */
        proposedispose: () => this.proposeDispose(body || {}),
        recordruntime: () => this.recordRuntimeObservation(body || {}),
        runtimeobservations: () => this.runtimeObservations(),
        cpuprobestate: () => this.cpuProbeState(),
        recordcpuprobestep: () => this.recordCpuProbeStep(body || {}),
        recordlinks: () => this.recordLinks(body || {}),
        resolvelinks: () => this.resolveLinks({ sourceCapture: url.searchParams.get("capture") }),
        linksto: () => this.linksTo({ address_norm: url.searchParams.get("address") }),
        recordlinkverdict: () => this.recordLinkVerdict(body || {}),
        projectlinks: () => this.projectLinks({ sourceCapture: url.searchParams.get("capture"),
                                                sourceBundle: url.searchParams.get("bundle") || null }),
        recordcapturedlocator: () => this.recordCapturedLocator(body || {}),
        /* D-98. Five ops, and the split between them is the safety property:
           `taskenqueue` is all the capture path can reach, and it writes only to
           the queue; `taskdrain` is the sole writer of tasks; the rest are
           member actions. */
        recordsourceoutcome: () => this.recordSourceOutcome(body || {}),
        /* `now` is readable so a suite can pin the instant. A verdict with a
           time arm that can only be evaluated against the wall clock is a
           verdict no test can assert without being about the day it runs. */
        sourcereach: () => this.sourceReachability({ addressNorm: url.searchParams.get("address"),
                                                     now: url.searchParams.get("now") }),
        taskenqueue: () => this.taskEnqueue(body || {}),
        taskdrain: () => this.taskDrain(body || {}),
        tasks: () => this.taskList({ assignee: url.searchParams.get("assignee"),
                                     status: url.searchParams.get("status"),
                                     refersTo: url.searchParams.get("refers"),
                                     limit: url.searchParams.get("limit"),
                                     viewer: url.searchParams.get("viewer") }),
        taskforward: () => this.taskForward(body || {}),
        taskresolve: () => this.taskResolve(body || {}),
        governoradmit: () => this.governorAdmit(body || { host: url.searchParams.get("host") }),
        governorreport: () => this.governorReport(body || {}),
        governorconfig: () => this.governorConfig(body || {}),
        governorstate: () => this.governorState(body || { host: url.searchParams.get("host") }),
        savecapturesession: () => this.saveCaptureSession(body || {}),
        loadcapturesession: () => this.loadCaptureSession({ session: url.searchParams.get("session") }),
        dropcapturesession: () => this.dropCaptureSession({ session: url.searchParams.get("session") }),
        sitechrome: () => this.siteChrome({ host: url.searchParams.get("host"),
                                            threshold: Number(url.searchParams.get("threshold")) || 0.6 }),
        recordcapturelimit: () => this.recordCaptureLimit(body || {}),
        projection: () => this.projection({
          bundleId: url.searchParams.get("id"),
          jsonPath: url.searchParams.get("jsonPath"),
          jsonEquals: url.searchParams.get("jsonEquals"),
          viewer: url.searchParams.get("viewer"),
        }),
        /* Retrieval. `viewer` is stamped by the control plane and is never taken
           from the caller's own parameters there; here it is simply read, and an
           absent one compiles to the deny predicate. */
        search: () => this.search({
          q: url.searchParams.get("q") ?? "",
          viewer: url.searchParams.get("viewer"),
          sort: url.searchParams.get("sort"),
          dir: url.searchParams.get("dir"),
          limit: url.searchParams.get("limit"),
          offset: url.searchParams.get("offset"),
          mode: url.searchParams.get("mode"),
          facets: url.searchParams.get("facets") === "none" ? false
                : url.searchParams.get("facets") ? url.searchParams.get("facets").split(",") : null,
          /* D-32. Which facet strategy ran, so the bench can drive BOTH through
             the real op rather than measuring a copy of the code. Not a tuning
             knob for callers: absent means the default, and the two are asserted
             to agree exactly. */
          facetMode: url.searchParams.get("facetmode"),
          widen: url.searchParams.get("widen") !== "0",
          snippetChars: Number(url.searchParams.get("snippet")) || 12,
        }),
        searchfields: () => this.searchFields(),
        /* REC-19: the facts behind op=affordances. The control plane derives
           the act list from these; this endpoint only reports what the store
           holds about the object. */
        affordancefacts: () => this.affordanceFacts({ target: url.searchParams.get("target"),
                                                      viewer: url.searchParams.get("viewer") }),
        /* Selections. `viewer` and `owner` are both stamped by the control plane
           from the authenticated credential and are never taken from the
           caller's own parameters there. */
        select: () => this.selectionCreate({
          q: url.searchParams.get("q") ?? "",
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          sort: url.searchParams.get("sort"),
          dir: url.searchParams.get("dir"),
          kind: url.searchParams.get("kind"),
          ids: Array.isArray(body?.ids) ? body.ids : null,
        }),
        selection: () => this.selectionResolve({
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          weight: url.searchParams.get("weight") === "refuse" ? "refuse" : "report",
        }),
        /* The first action that refers to a selection. `weight` is deliberately
           NOT read from the query string: citing is report-weight because of
           what it is, and a caller that could choose would make the weight
           distinction advisory. `author` is stamped by the control plane. */
        cite: () => this.cite({
          project: url.searchParams.get("project"),
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          note: url.searchParams.get("note") ?? "",
          author: url.searchParams.get("author"),
        }),
        /* The first STATE-CHANGING actions to refer to a selection, and the
           first callers of selectionResolve's refusing arm. Weight is not read
           from the caller here either. */
        sever: () => this.sever({
          project: url.searchParams.get("project"),
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          reason: url.searchParams.get("reason") ?? "",
          author: url.searchParams.get("author"),
        }),
        reinstate: () => this.reinstate({
          project: url.searchParams.get("project"),
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          reason: url.searchParams.get("reason") ?? "",
          author: url.searchParams.get("author"),
        }),
        selectionlist: () => this.selectionList({ owner: url.searchParams.get("owner") }),
        selectionrelease: () => this.selectionRelease({
          handle: url.searchParams.get("handle"), owner: url.searchParams.get("owner") }),
        searchindexcheck: () => this.searchIndexCheck({
          after: url.searchParams.get("after") || "",
          limit: url.searchParams.get("limit"),
          viewer: url.searchParams.get("viewer"),
        }),
        projectionplan: () => this.projectionPlan(),
        projectionclear: () => this.projectionClear(body || {}),
        reproject: () => this.reproject(body || {}),
        dangling: () => ({ dangling: this.danglingRefs(url.searchParams.get("viewer")) }),
        stats: () => this.stats(),
        bootstrap: () => this.bootstrapState(url.searchParams.get("fp")),
        claim: () => this.claim({ ...(body || {}), tokenFp: url.searchParams.get("fp") }),
        login: async () => {
          /* A member login is refused unless the member is active, so
             revocation closes the front door as well as the sessions. */
          const role = body?.role || "admin";
          if (role.startsWith("member:")) {
            const m = this.#one(`SELECT status FROM members WHERE member_id=?`, role.slice(7));
            if (!m || m.status !== "active") return { ok: false, reason: "NO_SUCH_ROLE" };
          }
          return this.login(body || {});
        },
        memberadd: () => this.memberAdd(body || {}),
        enroll: () => this.enroll(body || {}),
        invitelook: () => this.inviteLook(body || {}),
        memberlist: () => this.memberList({ administer: url.searchParams.get("administer") }),
        memberset: () => this.memberSet(body || {}),
        /* The membership model's member half. `memberadd`, `memberset`,
           `membercaps`, `adminendorse` and `adminremove` are admin-only at the
           control plane — section 4 governance. `memberlist` is NOT, and the
           comment that used to say so here was one of the three self-
           contradicting sites D-157 names: it is admin/member/probe, because
           §3 gives members and the public the HANDLE roster. What is
           administrator-only is the cover↔handle PAIRING, and that is enforced
           by the projection in memberList() above, off the `administer` stamp
           this line passes through — a class ACL cannot express it, because the
           op is legitimately reachable by callers who must not see the pairing. */
        membercaps: () => this.memberCaps(body || {}),
        adminendorse: () => this.adminEndorse(body || {}),
        adminremove: () => this.adminRemove(body || {}),
        adminarith: () => this.adminArithmetic(),
        projectclaimowner: () => this.projectClaimOwner(body || {}),
        projectowneradd: () => this.projectOwnerAdd({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by") }),
        projectownerremove: () => this.projectOwnerRemove({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by"),
          reason: url.searchParams.get("reason") }),
        projectownerrescue: () => this.projectOwnerRescue({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by"),
          reason: url.searchParams.get("reason") }),
        projectownerarith: () => this.projectOwnerArithmetic({ projectId: url.searchParams.get("projectId"),
                                                               viewer: url.searchParams.get("viewer") }),
        retire: () => this.retire({ handle: url.searchParams.get("handle"),
          reason: url.searchParams.get("reason"),
          viewer: url.searchParams.get("viewer"), owner: url.searchParams.get("owner"),
          author: url.searchParams.get("author") }),
        release: () => this.release({ handle: url.searchParams.get("handle"),
          acknowledgment: url.searchParams.get("acknowledgment"),
          mitigation: url.searchParams.get("mitigation"),
          viewer: url.searchParams.get("viewer"), owner: url.searchParams.get("owner"),
          author: url.searchParams.get("author") }),
        dispose: () => this.dispose({ handle: url.searchParams.get("handle"),
          to: url.searchParams.get("to"), reason: url.searchParams.get("reason"),
          viewer: url.searchParams.get("viewer"), owner: url.searchParams.get("owner"),
          author: url.searchParams.get("author") }),
        /* REC-13. No `handle` and no `owner`: concluding is not a set
           application (see conclude() above), so it takes the ONE target and
           the viewer/author stamps the control plane sets. */
        conclude: () => this.conclude({ target: url.searchParams.get("target"),
          conclusion: url.searchParams.get("conclusion"),
          falsifier: url.searchParams.get("falsifier"),
          viewer: url.searchParams.get("viewer"),
          author: url.searchParams.get("author") }),
        /* REC-31, conclude's shape exactly: ONE target, no handle and no
           owner, with the viewer and author stamps the control plane sets. */
        reopen: () => this.reopen({ target: url.searchParams.get("target"),
          reason: url.searchParams.get("reason"),
          viewer: url.searchParams.get("viewer"),
          author: url.searchParams.get("author") }),
        /* REC-14. The BODY carries the authored material (the exclusion list is
           an array, which a query string cannot express honestly); the viewer
           and the author come from the SEARCH PARAMS, which is where the
           control plane stamps them — so they are spread SECOND and a
           caller-supplied author in the body is overwritten, never honoured. */
        publishcase: () => this.publishCase({ ...(body || {}),
          target: url.searchParams.get("target") || (body || {}).target,
          viewer: url.searchParams.get("viewer"),
          author: url.searchParams.get("author") }),
        strengthbar: () => this.strengthBarSet({ ...(body || {}),
          author: url.searchParams.get("author") }),
        strengthbarof: () => this.strengthBarOf({ group: url.searchParams.get("group"),
          target: url.searchParams.get("target"),
          viewer: url.searchParams.get("viewer") }),
        publishededitions: () => this.publishedEditions(url.searchParams.get("id")),
        excludedby: () => this.excludedBy(url.searchParams.get("id"), url.searchParams.get("viewer")),
        expertisedeclare: () => this.expertiseDeclare(body || {}),
        expertiseconfirm: () => this.expertiseConfirm(body || {}),
        expertiselist: () => this.expertiseList({ memberId: url.searchParams.get("memberId") }),
        export: () => this.exportManifest({ note: url.searchParams.get("note") }),
        exportlog: () => this.exportLog(),
        publishedmanifest: () => this.publishedManifest(),
        projectfork: () => this.forkProject({ projectId: url.searchParams.get("projectId"),
          newId: url.searchParams.get("newId"), title: url.searchParams.get("title"),
          by: url.searchParams.get("by") }),
        projectinvite: () => this.projectInvite({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by") }),
        projectjoin: () => this.projectJoin({ projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by") }),
        projectleave: () => this.projectLeave({ projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by"), comment: url.searchParams.get("comment") }),
        projectremove: () => this.projectRemove({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by"),
          comment: url.searchParams.get("comment") }),
        projectparticipants: () => this.projectParticipants({ projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by") }),
        registeraudit: () => this.registerAudit(),
        signeradd: () => this.signerAdd(body || {}),
        signerlist: () => this.signerList(),
        signerset: () => this.signerSet(body || {}),
        gatefacts: () => this.gateFacts(url.searchParams.get("id")),
        audit: () => this.auditPass({ after: url.searchParams.get("after") || "",
                                      limit: url.searchParams.get("limit"),
                                      viewer: url.searchParams.get("viewer") }),
        publish: () => this.publish(body || {}),
        verify: () => this.verifySha((url.searchParams.get("sha256") || "").toLowerCase()),
        publishedlist: () => this.publishedList(),
        knock: () => this.knock(body || {}),
        inboxlist: () => this.inboxList(url.searchParams.get("status") || null),
        inboxget: () => this.inboxGet(url.searchParams.get("id")),
        inboxresolve: () => this.inboxResolve(body || {}),
        setpassword: () => this.setPassword(body || {}),
        session: () => ({ session: this.session(url.searchParams.get("t")) }),
        purge: () => this.purge({ bundleId: url.searchParams.get("bundleId") }),
      };
      if (!map[op]) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
      return Response.json({ ok: true, result: await map[op]() });
    } catch (e) {
      return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });
    }
  }
}

export default {
  fetch(req, env) {
    return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);
  },
};
