/* NEGATIVE CONTROL: (RUN 2026-08-07, pl10-agent, each arm armed ALONE by a scripted mutation whose anchor must match EXACTLY ONCE or the harness refuses to arm blind — it refused once, correctly, because `JOIN register r ON r.capture_sha = cl.capture_sha` appears TWICE in store.mjs, this method and `#conditionBundlesForHost` — then every file restored from a PRISTINE copy with the restore verified by sha256 AND by `cmp`. Whole, clean: 91 pass, 0 fail.) (1) BREAK THE JOIN — in `src/store.mjs`'s CHAIN CTE join on `cl.address_norm` instead of `cl.capture_sha` -> versionchain 58 pass / 33 FAIL and bounds 109/3, the failures NAMING THE ADDRESS whose versions vanished ("the chain answers for https://www.oaklandca.gov/city-council/agenda.pdf, and it answers SIXTY versions") — a broken join reports WHOSE history disappeared rather than a number that moved. (2) ADD THE EDGE THIS ITEM EXISTS NOT TO ADD — a `supersedes TEXT` column on `captured_locators` in `src/schema.mjs` -> versionchain 89/2, "NO EDGE: the schema carries no supersedes/predecessor/version-edge name anywhere" and "NO NEW COLUMN: captured_locators carries EXACTLY the eight columns it carried before this item". **AND THE REST OF THE BATTERY DID NOT NOTICE** — hygiene and purge stayed green — which is precisely why the trap is PINNED rather than left to the next author's care. (3) D-221's OWN — the predecessor query re-ordered ASC so it returns the OLDEST version before the anchor, which is the behaviour `heldMatch` has today -> versionchain 86/5, and the arms NAME THE PREDECESSOR THEY SHOULD HAVE PICKED: `want ["3ee0db34…","INFO-2026-0946-agenda","2026-03-03T09:00:00Z"] got ["f136ccf7…","INFO-2026-0900-agenda","2026-01-01T09:00:00Z"]`, with all FIFTY-NINE links then naming the same first-ever capture — D-221's sentence, reproduced. (4) A CHAIN OF ONE AS A DEGENERATE FAILURE — a null predecessor made a refusal -> versionchain 87/4, "a single-capture address answers as a chain of ONE" and "the OLDEST version has no predecessor and says so": one version is a version history, and an honest absence is an answer. (5) ANSWER A BARE COLLECTION — `return versions;` above the envelope -> bounds 105/7 and **"PIN: ZERO capped ops answer with a bare array" FAILS with `got ["versionchain"]`**, naming the op, with no exception list for it to be added to. (6) OVER-STRICTNESS — section 14: three correct chains in vocabularies this file never emits all PASS, and the same readers still REFUSE an out-of-order chain and one whose versions name no bundle. (7) ARMED-NESS is asserted rather than assumed throughout: section 1 THROWS if the index this item rests on is absent from both real sources; every structural reader in section 2 is run a second time over a source that DOES carry the forbidden thing and must find it; the ground-truth guards prove sixty distinct shas and that date order agrees with neither insertion order nor bundle-id order, which is the only thing that lets this suite tell a date-ordered chain apart from D-221's tiebreak. D-256's RUN (2026-09-23, D-256 worker, section 15, each arm armed ALONE by an anchor that must match EXACTLY ONCE in `src/store.mjs` `changedFromAudit`, restored by cp from a per-arm pristine copy and verified by sha256 AND `cmp`; BASELINE 115 pass, 0 fail): (A) RESOLVE THROUGH THE RANKED SEARCH instead of the chain — the predecessor taken as the first hit of `locator:"<address>"` (D-221's route) -> 108/7, and the provably-wrong arm FAILS BY NAME: "PROVABLY WRONG — INFO-2026-0923-agenda, the sixtieth of sixty versions, names the OLDEST (INFO-2026-0900-agenda)"; the forty-first's wrong arm, the totals, the ground-truth arm, the cut-listing totals and the structural arm with it — and the over-strictness arm (a RIGHT sentence among twenty prior versions) too, correctly: the ranked route names the oldest for it as well. (B) FOLD `no_prior_version` INTO `wrong` -> 111/4: the three totals, the undetermined-reasons arm, the ground-truth arm and the cut-listing totals. (C) A WRITE — one byte appended to every audited body -> 113/2: "EVERY BODY IS BYTE-UNCHANGED" and the structural arm. RECORDED, NOT SMOOTHED: the op=stats witness stayed GREEN under (C) — its counters count rows, not bytes — so the digest arm is the one that sees a content rewrite. */
/* D-220 — THE DOCUMENT-VERSION CHAIN, AND THE POINT IS WHAT IS NOT BUILT.
 *
 * Bob ruled, 2026-08-06: *"Versions of the same document should be linked so
 * that the system recognizes that reality. Each version should also be indexed
 * by the same url (or id that refers back to the url.) These capabilities should
 * be used in code that would benefit to know about this versioning reality."*
 *
 * THE INDEX HE DESCRIBED ALREADY EXISTED. `captured_locators` is keyed
 * `(address_norm, capture_sha, via)` with `captured_locators_addr ON
 * (address_norm, first_retrieved)`; `register` maps `capture_sha` to `bundle_id`
 * on its primary key. So *"every version at this address, in date order, with
 * its bundle"* is ONE INDEXED JOIN over two existing tables. The versioning
 * reality was recorded; nothing exposed it.
 *
 * SO THE ACCEPTANCE IS TWO CLAIMS, AND THE SECOND OUTRANKS THE FIRST:
 *
 *   1. THE CHAIN ANSWERS. Sixty captures of one address are ONE document's
 *      sixty versions, in date order, each with its bundle — not sixty
 *      documents, which is the false-coverage failure `STORE-AS-CACHE.md` names
 *      arriving at the document level.
 *
 *   2. NO EDGE BETWEEN VERSIONS WAS ADDED, AND THAT IS ASSERTED STRUCTURALLY
 *      RATHER THAN PROMISED IN A COMMENT. An explicit `supersedes` relation
 *      would be a SECOND COPY of a fact the record already holds, and a second
 *      copy drifts from the first — D-164's solve-it-once, D-138's guard that
 *      guarded nothing. Section 2 below reads the REAL schema and the REAL
 *      migrations and fails if a version edge, relation, column, index or second
 *      writer appears; and it proves those readers are not blind by running each
 *      of them against a synthetic source that DOES carry the thing, which must
 *      be found. A pin that cannot see its own subject is the failure this
 *      project has measured four times.
 *
 * D-221 IS FIXED AT THE SAME JOIN, and by construction rather than by patching.
 * The defect: `heldMatch` (`civicos-ui/app.html`) looks for prior versions with
 * `locator:"<url>"`. `locator` is FTS-indexed (`query.mjs` FTS_COLUMNS), a
 * fielded query on an `fts` field compiles to a TEXT ATOM, a text atom creates a
 * rank arm, and the default order is therefore RELEVANCE. Every capture at one
 * address carries identical URL text, the bm25 scores tie, and the declared
 * tiebreak `bundle_id ASC` decides — so the "changed from" sentence written
 * permanently into a new bundle can name a snapshot twelve months old and
 * present it as the immediately preceding version. Here the predecessor is
 * resolved by ADDRESS EQUALITY and date order. There is no relevance to be
 * ordered by and nothing to get wrong. Section 4 asserts that against ground
 * truth computed in JavaScript from the fixture definitions and NEVER read back
 * out of the op, and it DRIVES the FTS route beside it so the two answers can be
 * compared rather than described.
 *
 * THE DEFECTIVE SITE ITSELF IS `civicos-ui/app.html` — UI's paths — so the
 * repair there is a DELEGATION recorded in CLAIMS.md, not an edit from here.
 * What this item owes is the join that makes the repair a one-line consumer
 * change, and the assertion that the join answers the question `heldMatch` asks.
 *
 * WHAT THIS SUITE DOES NOT RE-LITIGATE, because Bob settled it 2026-07-30: a
 * re-capture of IDENTICAL content creates no bundle and no second register
 * entry — it widens the interval and increments `observations`. That is asserted
 * as STILL TRUE (section 7) rather than redesigned.
 *
 * WHAT THIS SUITE DOES NOT CLAIM. It does not measure the join's COST. It
 * asserts that the seek column is the one the existing index is built on and
 * that the SQL is an equality rather than a scan; it runs no timing, and a
 * correct query that happened to be slow would pass here. Said plainly rather
 * than implied by silence.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { VERSION_CHAIN_CHECKS } from "../checks/bio-checks.mjs";
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");

/* Blank block comments before any structural read. bounds.test.mjs' own reader,
   and for its reason: an anchor that matches PROSE measures the prose, and this
   file's subject is an ABSENCE — a comment saying "no supersedes column" would
   otherwise be indistinguishable from the column itself. */
const decomment = (text) => text.split("\n").map(((state) => (L) => {
  let out = "", i = 0;
  while (i < L.length) {
    if (state.block) {
      const e = L.indexOf("*/", i);
      if (e < 0) { i = L.length; } else { state.block = false; i = e + 2; }
      continue;
    }
    const b = L.indexOf("/*", i), s = L.indexOf("//", i);
    if (b >= 0 && (s < 0 || b < s)) { out += L.slice(i, b); state.block = true; i = b + 2; continue; }
    if (s >= 0 && (b < 0 || s < b)) { out += L.slice(i, s); i = L.length; continue; }
    out += L.slice(i); i = L.length;
  }
  return out;
})({ block: false })).join("\n");

const STORE_CODE = decomment(STORE_SRC);
/* The schema is SQL inside a template literal, so its prose is `--` comments and
   `decomment` above cannot see them. Stripped too, and for the same reason —
   MEASURED, not anticipated: the first run of this suite failed its own
   no-edge arm on three `-- the MISSING PREDECESSOR is slice B` lines in the
   PROGRESSIONS block, which are prose about a different subject entirely. A pin
   that matches a comment is measuring the comment. Only `-- ` with a space is
   stripped, so a JS decrement (`i--`) cannot be mistaken for a comment. */
const SCHEMA_CODE = decomment(SCHEMA_SRC).split("\n")
  .map((L) => L.replace(/(^|\s)--\s.*$/, "$1")).join("\n");

/* The method segmenter, bounds.test.mjs' own, bounded by the NEXT signature
   rather than by brace matching. */
const segments = (code) => {
  const lines = code.split("\n");
  /* D-414: `(?:\*\s*)?` so a GENERATOR method opens its own segment. Without it `*eachImage`
     was invisible and its body was credited to the method above it (`danglingRefs`), which
     then read as doing work it does not do. The optional group carries its own `\s*`
     deliberately: a bare `\*?\s*` would also let `\s*` absorb a THIRD space of indent and
     match at ANY depth, a second and silent widening. This regex is IDENTICAL in all five
     walks sharing this segmenter; the D-414 PARITY arms in `bounds.test.mjs` read all five
     off disk and assert it. */
  const sig = /^ {2}(?:static\s+|async\s+)?(?:\*\s*)?(#?[A-Za-z_$][\w$]*)\s*\(/;
  const heads = [];
  for (let i = 0; i < lines.length; i++) { const m = sig.exec(lines[i]); if (m) heads.push([i, m[1]]); }
  const out = new Map();
  for (let k = 0; k < heads.length; k++) {
    const j = k + 1 < heads.length ? heads[k + 1][0] : lines.length;
    out.set(heads[k][1], lines.slice(heads[k][0], j).join("\n"));
  }
  return out;
};
const SEGMENTS = segments(STORE_CODE);

/* ====================================================================== 1
 * THE ASSUMPTION SWEEP, AND IT THROWS.
 *
 * PL-8's probe was WRONG BEFORE THE PRODUCT WAS: its synthetic table omitted an
 * index the product has had for months, so it reported a 97% saving from an
 * index that already existed — and it had written that index into the schema
 * before catching itself. That matters DOUBLE here, because this item's entire
 * argument is that the index already exists. So the assumption is swept against
 * BOTH real sources — the schema literal AND the migrations executed in
 * store.mjs — and an absent one THROWS rather than failing an assertion, because
 * every section below would otherwise be measuring a world that is not this one.
 * ==================================================================== */
console.log("\n--- 1. the assumption: the index D-220 rests on, swept from BOTH real sources ---");
{
  const SOURCES = { "schema.mjs": SCHEMA_CODE, "store.mjs migrations": STORE_CODE };
  const foundIn = (re) => Object.entries(SOURCES).filter(([, src]) => re.test(src)).map(([n]) => n);

  const idxAddr = foundIn(/CREATE INDEX IF NOT EXISTS captured_locators_addr ON captured_locators\(address_norm, first_retrieved\)/);
  const clKey = foundIn(/PRIMARY KEY \(address_norm, capture_sha, via\)/);
  const regKey = foundIn(/CREATE TABLE IF NOT EXISTS register \([\s\S]*?capture_sha TEXT PRIMARY KEY/);
  const regIdx = foundIn(/CREATE INDEX IF NOT EXISTS register_bundle ON register\(bundle_id\)/);

  console.log(`  sources swept: ${Object.keys(SOURCES).join(", ")} `
    + `(${SCHEMA_CODE.split("\n").length} + ${STORE_CODE.split("\n").length} lines, comments blanked)`);
  console.log(`    captured_locators_addr (address_norm, first_retrieved) -> ${idxAddr.join(", ") || "ABSENT"}`);
  console.log(`    captured_locators PK (address_norm, capture_sha, via)  -> ${clKey.join(", ") || "ABSENT"}`);
  console.log(`    register PK on capture_sha                             -> ${regKey.join(", ") || "ABSENT"}`);
  console.log(`    register_bundle (bundle_id)                            -> ${regIdx.join(", ") || "ABSENT"}`);

  for (const [what, where] of [["the (address_norm, first_retrieved) index", idxAddr],
                               ["captured_locators' (address_norm, capture_sha, via) key", clKey],
                               ["register's capture_sha primary key", regKey],
                               ["the register(bundle_id) reverse index", regIdx]])
    if (!where.length)
      throw new Error(`REFUSED: ${what} is ABSENT from every real source. D-220's whole argument is that `
        + "this item ADDS no index because the index already exists. If it does not, this suite is measuring "
        + "a world that is not this one and every assertion below is worthless — which is exactly how PL-8's "
        + "probe reported a 97% saving from an index the product already had.");

  t("the index the chain seeks on EXISTS ALREADY, in the schema, and is not added by this item",
    idxAddr, ["schema.mjs"]);
  t("and it is indexed by the ADDRESS, which is the half of Bob's ruling the record already satisfied",
    /captured_locators_addr ON captured_locators\(address_norm,/.test(SCHEMA_CODE), true);
  t("register maps capture_sha -> bundle_id on its PRIMARY KEY and is indexed the other way too",
    [regKey.length > 0, regIdx.length > 0], [true, true]);
  /* GUARD: a sweep that cannot see an ABSENCE would pass over an empty file. */
  t("SWEEP GUARD: the same reader over an empty corpus finds NOTHING — so the four above answer the source",
    [/captured_locators_addr/.test(""), /PRIMARY KEY \(address_norm, capture_sha, via\)/.test("")],
    [false, false]);
  /* GUARD, BOTH WAYS, on the schema's own comment stripping: a known SQL CODE
     line must SURVIVE it and a known SQL PROSE line must not. */
  t("COMMENT GUARD: `--` prose is blanked out of the schema and a known CODE line SURVIVES it",
    [/CREATE TABLE IF NOT EXISTS captured_locators \(/.test(SCHEMA_CODE),
     /the MISSING PREDECESSOR is slice B/.test(SCHEMA_CODE)], [true, false]);
  t("COMMENT GUARD: and a JS decrement is NOT mistaken for a comment (the stripper needs `-- ` with a space)",
    "for (let i = n; i--;) keep".replace(/(^|\s)--\s.*$/, "$1"), "for (let i = n; i--;) keep");
}

/* ====================================================================== 2
 * THE STRUCTURAL PROOF: NO EDGE BETWEEN VERSIONS WAS ADDED.
 *
 * This is the item. Every reader here is run TWICE — once over the real source,
 * where it must find nothing, and once over a synthetic source that DOES carry
 * the forbidden thing, where it must find it. A pin that passes because it is
 * blind is worth less than no pin, because it tells the next reader the trap is
 * guarded.
 * ==================================================================== */
console.log("\n--- 2. STRUCTURAL: no edge, no relation, no supersedes column, no second writer ---");
{
  /* (a) THE VOCABULARY OF A VERSION EDGE, wherever it might appear as a column
     or a table name. Broad on purpose: the trap is not the WORD `supersedes`,
     it is any stored pointer from one version to another. */
  const EDGE_WORDS = /\b(supersede[sd]?|superseded_by|supersedes_sha|predecessor|previous_version|prior_version|next_version|replaces_sha|version_edge|version_chain|document_version[s]?|version_of)\b/gi;
  const schemaHits = [...SCHEMA_CODE.matchAll(EDGE_WORDS)].map((m) => m[0]);
  console.log(`  schema.mjs, comments blanked: ${SCHEMA_CODE.split("\n").length} lines, `
    + `${(SCHEMA_CODE.match(/CREATE TABLE/g) || []).length} CREATE TABLE, `
    + `${(SCHEMA_CODE.match(/CREATE INDEX/g) || []).length} CREATE INDEX`);
  t("NO EDGE: the schema carries no supersedes/predecessor/version-edge name anywhere — not a table, "
  + "not a column, not an index",
    schemaHits, []);
  t("NO EDGE (GUARD, the arm that proves the reader is not blind): the SAME reader over a schema that DOES "
  + "carry one FINDS it, and names it",
    [...`CREATE TABLE x (\n  capture_sha TEXT,\n  supersedes TEXT\n);`.matchAll(EDGE_WORDS)].map((m) => m[0]),
    ["supersedes"]);

  /* (b) THE TWO TABLES THE JOIN READS ARE UNCHANGED — asserted on their COLUMN
     SETS, read out of the schema, so a column added to either is a failure here
     even if it is named something this file never anticipated. */
  const columnsOf = (tbl) => {
    const m = new RegExp(`CREATE TABLE IF NOT EXISTS ${tbl} \\(([\\s\\S]*?)\\n\\);`).exec(SCHEMA_CODE);
    if (!m) return null;
    return m[1].split("\n").map((l) => l.trim()).filter(Boolean)
      .filter((l) => !/^(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK)\b/.test(l))
      .map((l) => l.split(/\s+/)[0]);
  };
  t("NO NEW COLUMN: captured_locators carries EXACTLY the eight columns it carried before this item",
    columnsOf("captured_locators"),
    ["address_norm", "address", "capture_sha", "via", "retrieval_locator",
     "first_retrieved", "last_retrieved", "observations"]);
  /* CORRECTED BY MK-1 (IC-134, 2026-09-18), NOT EXEMPTED. This pinned the six
     columns `register` carried when this item landed, and its purpose was that
     THIS item added no column to a table its join reads. MK-1 then added three —
     `authored`, `author`, `observed_at` — by an accepted-for-proposal I5 change
     of its own, so "exactly the six" became a statement about the wrong era
     rather than a rule anyone meant. The set is moved to the nine, and it still
     fails on ANY further column under any name, which is the property it was
     written for. The versionchain join reads `capture_sha` and `bundle_id` only,
     and neither moved. */
  t("NO NEW COLUMN: register carries EXACTLY its nine (the six this item found, plus MK-1's three, IC-134)",
    columnsOf("register"),
    ["capture_sha", "bundle_id", "path", "encoding", "bytes", "registered",
     "authored", "author", "observed_at"]);
  t("NO NEW COLUMN (GUARD): the same reader SEES a column when one is there",
    columnsOf("register") && columnsOf("register").includes("bundle_id"), true);

  /* (c) NO NEW INDEX. The chain seeks on an index that already existed; if this
     item had quietly added one, the "no new machinery" claim would be false in
     the direction easiest to miss. */
  const indexesOn = (tbl) => [...SCHEMA_CODE.matchAll(new RegExp(`CREATE (?:UNIQUE )?INDEX IF NOT EXISTS (\\w+) ON ${tbl}\\(`, "g"))].map((m) => m[1])
    .concat([...STORE_CODE.matchAll(new RegExp(`CREATE (?:UNIQUE )?INDEX IF NOT EXISTS (\\w+) ON ${tbl}\\(`, "g"))].map((m) => m[1]));
  /* CORRECTED BY CAP-13 (2026-09-23), NOT EXEMPTED. This pinned the ONE index
     `captured_locators` carried when this item landed, and its purpose was that
     THIS item added no index. CAP-13 then added `captured_locators_sha` for its
     own join (the reuse floor counts a primary's document ADDRESS, joined on
     `capture_sha`), so "exactly the one" became a statement about the wrong era.
     The set moves to the two, and it still fails on ANY further index. */
  t("NO NEW INDEX: captured_locators carries exactly its two (this item's one, plus CAP-13's capture_sha index)",
    indexesOn("captured_locators"), ["captured_locators_addr", "captured_locators_sha"]);
  t("NO NEW INDEX: register still carries exactly the ONE",
    indexesOn("register"), ["register_bundle"]);

  /* (d) NO NEW WRITE. `recordCapturedLocator` remains the ONLY writer of
     captured_locators, and the chain method writes nothing at all. A read that
     quietly maintained a derived edge would be the mirror-and-drift class
     wearing a read's clothes. */
  const writesTo = (tbl) => [...STORE_CODE.matchAll(new RegExp(`(INSERT[^;]*?INTO ${tbl}\\b|UPDATE ${tbl}\\b|DELETE FROM ${tbl}\\b)`, "g"))].map((m) => m[1]);
  const writerSegments = [...SEGMENTS].filter(([, body]) =>
    /INSERT[^;]*?INTO captured_locators\b|UPDATE captured_locators\b|DELETE FROM captured_locators\b/.test(body))
    .map(([n]) => n);
  console.log(`  writers of captured_locators: ${writerSegments.join(", ") || "NONE"}`);
  t("NO NEW WRITE: exactly one method in the whole store writes captured_locators, and it is the one that "
  + "always did — `purge` reaches it through its own table list, which is not a version edge",
    writerSegments.filter((n) => n !== "purge" && n !== "#purgeTables"), ["recordCapturedLocator"]);
  t("NO NEW WRITE: and the version chain method writes NOTHING — it is SELECT only",
    /\b(INSERT|UPDATE|DELETE)\b/.test(SEGMENTS.get("versionChain") || ""), false);
  t("NO NEW WRITE (GUARD): the writer reader can SEE a write when one is there",
    writesTo("captured_locators").length > 0, true);

  /* (e) THE WRITE PATH ITSELF IS BYTE-UNCHANGED IN THE PART THAT MATTERS: the
     INSERT still names the same eight columns and the same conflict clause, so
     "no new column" is true at the write as well as in the schema. */
  const wr = SEGMENTS.get("recordCapturedLocator") || "";
  t("THE WRITE PATH IS UNTOUCHED: the same eight-column INSERT, the same ON CONFLICT key, the same "
  + "widen-the-interval update",
    [/INSERT INTO captured_locators \(address_norm, address, capture_sha, via, retrieval_locator, first_retrieved, last_retrieved, observations\)/.test(wr),
     /ON CONFLICT\(address_norm, capture_sha, via\) DO UPDATE SET/.test(wr),
     /observations\s+= observations \+ 1/.test(wr)], [true, true, true]);

  /* (f) THE CHAIN READS EXACTLY TWO TABLES, and they are the two the record
     already holds. This is the positive half of the same claim: not merely that
     nothing was added, but that the answer comes from what was already there. */
  const chain = SEGMENTS.get("versionChain") || "";
  const tablesRead = [...new Set([...chain.matchAll(/\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/g)].map((m) => m[1]))]
    .filter((x) => x !== "chain").sort();
  console.log(`  tables the chain reads: ${tablesRead.join(", ")}`);
  t("THE LINK IS THE JOIN, EXPOSED: the chain reads captured_locators and register and NOTHING ELSE",
    tablesRead, ["captured_locators", "register"]);
  t("and it is a JOIN on the register's own key, the shape #conditionBundlesForHost already used",
    /JOIN register r ON r\.capture_sha = cl\.capture_sha/.test(chain), true);
  t("STRUCTURAL GUARD: the segmenter really found the method (an empty body would pass every arm above)",
    chain.length > 1200, true);
}

/* ====================================================================== 3
 * THE SHAPE OF THE SEEK: equality on the address, order on the date.
 * ==================================================================== */
console.log("\n--- 3. the seek: address EQUALITY, date order, and no text index anywhere near it ---");
{
  const chain = SEGMENTS.get("versionChain") || "";
  t("the address is matched by EQUALITY — the index's own leading column — never GLOB, LIKE or MATCH",
    [/WHERE cl\.address_norm = \?/.test(chain),
     /\bGLOB\b/.test(chain), /\bLIKE\b/.test(chain), /\bMATCH\b/.test(chain)],
    [true, false, false, false]);
  t("D-221: the chain consults NO text index and NO query compiler — there is no relevance to order by",
    [/bundles_fts/.test(chain), /\bcompile\(/.test(chain), /relevance/i.test(chain), /bm25/i.test(chain)],
    [false, false, false, false]);
  t("the order is `first_retrieved` — when we first HELD the bytes — with capture_sha as a TOTAL tiebreak",
    /ORDER BY first_retrieved, capture_sha/.test(chain), true);
  t("and never `last_retrieved`, which moves every time the target holds still and would reorder a settled "
  + "history as a side effect of re-checking it",
    /ORDER BY[^\n]*last_retrieved/.test(chain), false);
  t("ONE VERSION IS ONE capture_sha: the rows are grouped on it, so a document seen twice through two "
  + "routes (D-96's `via` in the key) is one version and not two",
    /GROUP BY cl\.capture_sha/.test(chain), true);
  t("the answer is GATED at the register's bundle, through the plane's one gate function",
    /#bundleGate\("r\.bundle_id", viewer\)/.test(chain), true);
  t("SEEK GUARD: these anchors are read over comment-stripped source, so this suite's own prose cannot "
  + "satisfy them",
    /Bob ruled/.test(STORE_CODE), false);
}

/* ====================================================================== 4
 * THE CONTROL PLANE: the op is declared, gated, and normalised at the seam.
 * ==================================================================== */
console.log("\n--- 4. the op, at the control plane ---");
{
  t("op=versionchain is declared in the OPS table, non-mutating, on the retrieval classes",
    /versionchain: \{ classes: \["admin", "member", "probe"\],\s+mutating: false \}/.test(decomment(INDEX_SRC)), true);
  t("its viewer is stamped by the SERVER, so a caller cannot choose whose chain compiles",
    /\|\| op === "versionchain"/.test(decomment(INDEX_SRC)), true);
  t("and the address is normalised with the SAME function the capture wrote the row with — a normalisation "
  + "MISS looks exactly like `not captured`, which is the failure hardest to notice",
    /if \(op === "versionchain"\)\s*\n\s*inner\.searchParams\.set\("address", normalizeAddress\(/.test(decomment(INDEX_SRC)), true);
  t("the DO dispatch reaches the one method and forwards nothing else",
    /versionchain: \(\) => this\.versionChain\(\{/.test(decomment(STORE_SRC)), true);
}

/* ====================================================================== 5
 * THE RUNTIME. Everything below goes through the control plane.
 * ==================================================================== */
console.log("\n--- 5. the corpus: SIXTY versions of ONE document, written through op=promote ---");
const IDX = SRC("index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl10", MEMBER_TOKEN: "mem-pl10", PROBE_TOKEN: "prb-pl10", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-pl10") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-pl10") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, "adm-pl10");
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

/* THE ADDRESS UNDER TEST, and its DECOY. The decoy is the same host and the same
   path with a different query string — D-221's SECOND, smaller risk, which that
   row records as mechanism-only and never measured: *"two different URLs that
   tokenise alike can match each other."* It tokenises alike and it is a
   different document, so a chain that ever joins the two has reproduced the
   defect from the other side. */
/* D-256: THE "CHANGED FROM" SENTENCE, READ OUT OF ITS WRITER rather than typed here — a hand copy agrees
   with the op for free. `addGo`'s CHANGED_FROM branch (civicos-ui/app.html) composes it from three string
   literals around the named bundle id; this suite rebuilds it the same way, so the fixture bodies below
   carry the bytes the pre-2026-08-08 writer put in the record. */
const APP_SRC = readFileSync(fileURLToPath(new URL("../../civicos-ui/app.html", import.meta.url)), "utf8");
const CF_PARTS = /CHANGED_FROM\s*\?\s*body \+ NL \+ NL \+ "([^"]+)"\s*\+ CHANGED_FROM\.bundle_id \+ "([^"]+)"\s*\+ "([^"]+)"/.exec(APP_SRC);
if (!CF_PARTS)
  throw new Error("REFUSED: addGo's CHANGED_FROM sentence was not found in civicos-ui/app.html. D-256's audit "
    + "matches the literal that writer emitted; if the writer moved, this suite would be auditing a sentence "
    + "nobody writes.");
const changedFrom = (id) => "\n\n" + CF_PARTS[1] + id + CF_PARTS[2] + CF_PARTS[3];
/* Which fixture bundles carry the sentence, and the id each names. Filled beside the fixture writes. */
const CF_NAMES = new Map();

const ADDR = normalizeAddress("https://www.oaklandca.gov/city-council/agenda.pdf");
const DECOY = normalizeAddress("https://www.oaklandca.gov/city-council/agenda.pdf?session=2");
const SOLO = normalizeAddress("https://www.oaklandca.gov/city-council/charter.pdf");
const NOTHING = normalizeAddress("https://www.oaklandca.gov/city-council/never-captured.pdf");
const GATED = normalizeAddress("https://www.oaklandca.gov/city-council/budget.pdf");

const infoMd = (id, locator, prose) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Agenda snapshot ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", prose, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); its
   creation bytes carry no `id:` line (C-59.2) and the promote names no bundleId (C-59.1). `id` null = creation. */
const projectMd = (id) => ["---", ...(id === null ? [] : [`id: ${id}`]), "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "---", "", "## Summary", "", "A project the uninvited must not learn about.", ""].join("\n");

const promote = async (id, text, type, register = [], tok = "mem-pl10") => await post("promote", {
  ...(id === null ? {} : { bundleId: id }), base: null, snapKey: `${id ?? "project"}-new`, author: "pl10",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER },
  register,
}, tok);

await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const recordLocator = async (b) => rP(await (await doStub.fetch("http://x/recordcapturedlocator",
  { method: "POST", body: JSON.stringify(b) })).json());

/* ------------------------------------------------------------------ GROUND
   TRUTH, COMPUTED HERE AND NEVER READ BACK OUT OF THE OP. A closed loop — an
   arm comparing an answer against the same op that produced it — is how a
   constant published by the plane got faithfully rendered while the arm stayed
   green. Everything below is anchored on what was WRITTEN. */
const N = 60;
/* Chain position i has first_retrieved i days after 2026-01-01. The bundle id
   suffix is a PERMUTATION of 0..59 (step 37, coprime to 60), so date order is
   NOT bundle-id order — which matters because bundle_id ASC is exactly what
   D-221's tied relevance scores fell back on. */
const suffix = (i) => String((i * 37) % N).padStart(2, "0");
const day = (i) => `2026-${String(1 + Math.floor(i / 28)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}T09:00:00Z`;
const CHAIN = Array.from({ length: N }, (_, i) => {
  const bundleId = `INFO-2026-09${suffix(i)}-agenda`;
  const bytes = `agenda revision ${i} — the council agenda as published on ${day(i)}\n`;
  return { i, bundleId, captureSha: sha(bytes), first: day(i) };
});
t("GROUND TRUTH GUARD: sixty distinct capture shas and sixty distinct bundles (a fixture that collided "
+ "would make every arm below measure something smaller than it claims)",
  [new Set(CHAIN.map((v) => v.captureSha)).size, new Set(CHAIN.map((v) => v.bundleId)).size], [N, N]);
t("GROUND TRUTH GUARD: date order is NOT bundle-id order — which is the ONLY thing that lets this suite "
+ "tell a date-ordered chain apart from the tiebreak D-221 actually fell back on",
  CHAIN.map((v) => v.bundleId).join() === [...CHAIN].sort((a, b) => a.bundleId < b.bundleId ? -1 : 1).map((v) => v.bundleId).join(),
  false);

/* WRITTEN IN AN ORDER THAT IS NEITHER: reverse-chronological, so insertion order
   cannot be mistaken for the answer either. */
const writeOrder = [...CHAIN].reverse();
/* D-256's chain arms: the sixtieth and the forty-first name the OLDEST version (D-221's measured sentence,
   PROVABLY WRONG); the twenty-first names its true predecessor, the twentieth, with nineteen more before
   it — RIGHT although the address held more than one prior version, and followed by more prose, so the
   sentence need not end the body. */
CF_NAMES.set(CHAIN[59].bundleId, CHAIN[0].bundleId);
CF_NAMES.set(CHAIN[40].bundleId, CHAIN[0].bundleId);
CF_NAMES.set(CHAIN[20].bundleId, CHAIN[19].bundleId);
for (const v of writeOrder) {
  const cf = CF_NAMES.has(v.bundleId) ? changedFrom(CF_NAMES.get(v.bundleId)) : "";
  const tail = v.i === 20 ? "\n\nA later paragraph the member wrote." : "";
  const r = await promote(v.bundleId, infoMd(v.bundleId, ADDR, `Agenda revision ${v.i}.${cf}${tail}`), "information",
    [{ sha256: v.captureSha, path: "documents/agenda.pdf", encoding: "binary", bytes: 4096 }]);
  if (r?.ok !== true) throw new Error(`promote ${v.bundleId} refused: ${JSON.stringify(r).slice(0, 600)}`);
  await recordLocator({ address: ADDR, addressNorm: ADDR, captureSha: v.captureSha, retrieved: v.first });
}
console.log(`  wrote ${N} versions at ONE address, in reverse-chronological order, `
  + `bundle ids permuted so no two of {insertion, date, id} orders agree`);

/* THE DECOY: three versions at an address that tokenises alike. */
const DECOY_CHAIN = [0, 1, 2].map((k) => {
  const bundleId = `INFO-2026-0980-decoy-${k}`;
  const bytes = `a DIFFERENT document that happens to live one query parameter away, revision ${k}\n`;
  return { bundleId, captureSha: sha(bytes), first: `2026-03-${String(10 + k).padStart(2, "0")}T09:00:00Z` };
});
/* D-256: the decoy's second version names its first — the address held EXACTLY ONE prior version, where the
   ranked route and the chain cannot disagree (RIGHT, `sole_prior`). */
CF_NAMES.set(DECOY_CHAIN[1].bundleId, DECOY_CHAIN[0].bundleId);
for (const v of DECOY_CHAIN) {
  const cf = CF_NAMES.has(v.bundleId) ? changedFrom(CF_NAMES.get(v.bundleId)) : "";
  await promote(v.bundleId, infoMd(v.bundleId, DECOY, `A different document at a similar address.${cf}`), "information",
    [{ sha256: v.captureSha, path: "documents/agenda.pdf", encoding: "binary", bytes: 2048 }]);
  await recordLocator({ address: DECOY, addressNorm: DECOY, captureSha: v.captureSha, retrieved: v.first });
}

/* THE SINGLE-CAPTURE ADDRESS: one version is not a degenerate failure. */
const SOLO_SHA = sha("the charter, captured once and never changed\n");
/* D-256: the charter's one version names an earlier capture the chain does not hold — it is the OLDEST
   version at its address, so the record cannot check the sentence (UNDETERMINED, `no_prior_version`). */
CF_NAMES.set("INFO-2026-0990-charter", "INFO-2026-0001-ghost");
await promote("INFO-2026-0990-charter", infoMd("INFO-2026-0990-charter", SOLO,
  `The charter.${changedFrom("INFO-2026-0001-ghost")}`), "information",
  [{ sha256: SOLO_SHA, path: "documents/charter.pdf", encoding: "binary", bytes: 1024 }]);
await recordLocator({ address: SOLO, addressNorm: SOLO, captureSha: SOLO_SHA, retrieved: "2026-02-14T09:00:00Z" });

/* THE GATED ADDRESS: two versions, one of them filed inside a project carol owns
   and dave was never invited to. This is what makes the gate arm a LIVE one
   rather than a predicate reaching a statement. */
const OPEN_SHA = sha("the budget, first version, in the open record\n");
const HIDDEN_SHA = sha("the budget, second version, filed inside a project\n");
await promote("INFO-2026-0995-budget", infoMd("INFO-2026-0995-budget", GATED, "The budget."), "information",
  [{ sha256: OPEN_SHA, path: "documents/budget.pdf", encoding: "binary", bytes: 900 }]);
await recordLocator({ address: GATED, addressNorm: GATED, captureSha: OPEN_SHA, retrieved: "2026-01-05T09:00:00Z" });
{
  const r = await promote(null, projectMd(null), "project",
    [{ sha256: HIDDEN_SHA, path: "documents/budget.pdf", encoding: "binary", bytes: 950 }], carol);
  t("MEASURED, not assumed: a PROJECT bundle really can carry a register entry, so the withheld version "
  + "below is a row a real uninvited member really cannot see", r?.ok, true);
}
await recordLocator({ address: GATED, addressNorm: GATED, captureSha: HIDDEN_SHA, retrieved: "2026-06-05T09:00:00Z" });

/* ====================================================================== 6
 * SIXTY CAPTURES OF ONE ADDRESS ANSWER AS ONE DOCUMENT'S VERSIONS.
 * ==================================================================== */
console.log("\n--- 6. sixty captures of one address are ONE document's sixty versions, in date order ---");
const full = await get("versionchain", `address=${encodeURIComponent(ADDR)}&limit=1000`);
{
  const versions = full?.versions ?? [];
  /* The ADDRESS is in the label, so a broken join reports WHOSE versions
     vanished rather than reporting a number that moved. */
  t(`the chain answers for ${ADDR}, and it answers SIXTY versions`,
    [full?.ok, full?.count, full?.total], [true, N, N]);
  t("AND IT IS ONE DOCUMENT. Sixty rows here are sixty versions of ONE document, and the answer says so "
  + "in its own field rather than leaving a consumer to infer it from a count — reading them as sixty "
  + "documents is the false-coverage failure this op exists to remove",
    full?.documents, 1);
  t("IN DATE ORDER: every version in the order we first held its bytes, matching ground truth computed "
  + "here and never read back out of the op",
    versions.map((v) => v.first_retrieved), CHAIN.map((v) => v.first));
  t("EACH WITH ITS BUNDLE: every version names the bundle its bytes are registered in",
    versions.map((v) => v.bundle_id), CHAIN.map((v) => v.bundleId));
  t("and its capture identity, which is what makes it a version at all",
    versions.map((v) => v.capture_sha), CHAIN.map((v) => v.captureSha));
  /* THE POPULATION, not just the shape. A count can be right about the shape and
     wrong about the population — four sightings in this project. */
  t("THE POPULATION IS RIGHT, not merely the count: the SET of shas returned is exactly the set written, "
  + "with nothing borrowed from the decoy or the other addresses",
    [...new Set(versions.map((v) => v.capture_sha))].sort().join() === [...CHAIN.map((v) => v.captureSha)].sort().join(),
    true);
  t("the order is NOT the order they were written (they were written newest-first)",
    versions.map((v) => v.capture_sha).join() === writeOrder.map((v) => v.captureSha).join(), false);
  t("and NOT bundle-id order either — which is precisely the order D-221's tied relevance scores fell "
  + "back on, so a chain that agreed with it would be indistinguishable from the defect",
    versions.map((v) => v.bundle_id).join() === [...versions].sort((a, b) => a.bundle_id < b.bundle_id ? -1 : 1).map((v) => v.bundle_id).join(),
    false);
  t("every version carries its bundle's register facts too — path, encoding and bytes — so a consumer "
  + "reading the chain does not need a second call per version to know what it is holding",
    [versions[0]?.path, versions[0]?.encoding, versions[0]?.bytes], ["documents/agenda.pdf", "binary", 4096]);
}

/* ====================================================================== 7
 * D-221: THE PREDECESSOR, BY ADDRESS EQUALITY AND NEVER BY RELEVANCE.
 * ==================================================================== */
console.log("\n--- 7. D-221: the previous version, chosen by address equality and date ---");
{
  const newest = CHAIN[N - 1], trueP = CHAIN[N - 2], oldest = CHAIN[0];
  const a = await get("versionchain", `address=${encodeURIComponent(ADDR)}&at=${newest.captureSha}`);
  t("the anchor resolves to the version asked for", a?.at?.capture_sha, newest.captureSha);
  t("IT IS THE SIXTIETH, so `at_index` says where in the history it sits", a?.at_index, N - 1);
  t("THE PREDECESSOR IS THE TEMPORALLY PREVIOUS VERSION — the fifty-ninth — computed here from the "
  + "fixture and never read back out of the op",
    [a?.predecessor?.capture_sha, a?.predecessor?.bundle_id, a?.predecessor?.first_retrieved],
    [trueP.captureSha, trueP.bundleId, trueP.first]);
  t("AND IT IS NOT THE OLDEST, which is the version D-221 measures the defect naming — on a calendar "
  + "captured weekly for a year, a snapshot twelve months old presented as the one before this",
    a?.predecessor?.capture_sha === oldest.captureSha, false);
  t("the predecessor names its BUNDLE, which is what a `changed from` sentence has to write down",
    typeof a?.predecessor?.bundle_id === "string" && a.predecessor.bundle_id.length > 0, true);

  /* EVERY LINK IN THE CHAIN, not just the last one. One correct predecessor
     could be luck; fifty-nine cannot. */
  const walked = [];
  for (let i = 1; i < N; i++) {
    const r = await get("versionchain", `address=${encodeURIComponent(ADDR)}&at=${CHAIN[i].captureSha}&limit=1`);
    walked.push([r?.at_index, r?.predecessor?.capture_sha]);
  }
  t("EVERY link in the sixty-version chain names its own immediate predecessor, and its own position — "
  + "fifty-nine of them, so one lucky answer cannot carry this",
    walked, CHAIN.slice(1).map((v, k) => [k + 1, CHAIN[k].captureSha]));

  /* THE OLDEST HAS NO PREDECESSOR, and says so as an honest absence. */
  const first = await get("versionchain", `address=${encodeURIComponent(ADDR)}&at=${oldest.captureSha}&limit=1`);
  t("the OLDEST version has no predecessor and says so — `at_index` 0 with a null predecessor is the "
  + "record saying `these are the first bytes we held`, which is an answer and not a failure",
    [first?.ok, first?.at_index, first?.predecessor], [true, 0, null]);

  /* THE OTHER ROUTE, DRIVEN rather than described. This is D-221's mechanism
     staged live: the same question asked through the full-text field, whose
     answer is ordered by relevance over identical URL text. */
  const ftsQuoted = await get("search", `q=${encodeURIComponent(`locator:"${ADDR}"`)}&limit=5&facets=none`);
  const ftsBare = await get("search", `q=${encodeURIComponent(`locator:${ADDR}`)}&limit=5&facets=none`);
  const firstHit = (r) => (r?.hits ?? [])[0]?.bundle_id ?? null;
  console.log(`  the FTS route, MEASURED: locator:"<url>" -> ${ftsQuoted?.total ?? "?"} hits, first ${firstHit(ftsQuoted)}`);
  console.log(`                            locator:<url>  -> ${ftsBare?.total ?? "?"} hits, first ${firstHit(ftsBare)}`);
  t("D-221's ROUTE, DRIVEN: asking the text index for prior captures at this address does NOT put the "
  + "true predecessor first — it is ordered by relevance over identical URL text, which is the whole defect",
    [firstHit(ftsQuoted) === trueP.bundleId, firstHit(ftsBare) === trueP.bundleId], [false, false]);
  /* AND WHAT IT PUTS THERE INSTEAD, MEASURED. D-221 predicted the failure
     precisely — *"almost certainly the OLDEST version at that address rather
     than the previous one"* — because identical URL text ties the bm25 scores
     and the declared tiebreak `bundle_id ASC` decides. This is that prediction
     REPRODUCED rather than restated: the row `heldMatch` would return first is
     the FIRST version ever captured here, on a chain sixty long.
     If a later item changes the compiler's tiebreak this arm goes red, and that
     is the correct signal: it means D-221's MECHANISM moved, and this line is
     where the record says what it used to be. */
  t("D-221 REPRODUCED, not restated: the relevance-ordered route returns the OLDEST version at the "
  + "address first — the snapshot fifty-nine versions back, offered as `the one before this`",
    [firstHit(ftsQuoted), firstHit(ftsBare)], [oldest.bundleId, oldest.bundleId]);
  t("while the join, asked the same question, gets it right — the two routes are compared rather than "
  + "described, and only one of them is an address comparison",
    a?.predecessor?.bundle_id, trueP.bundleId);
}

/* ====================================================================== 8
 * TWO DOCUMENTS AT SIMILAR ADDRESSES NEVER JOIN ONE CHAIN.
 * ==================================================================== */
console.log("\n--- 8. a document one query parameter away is a DIFFERENT document ---");
{
  const decoy = await get("versionchain", `address=${encodeURIComponent(DECOY)}&limit=1000`);
  const mainShas = new Set((full?.versions ?? []).map((v) => v.capture_sha));
  const decoyShas = new Set((decoy?.versions ?? []).map((v) => v.capture_sha));
  t("the decoy address answers its OWN three versions and no more", [decoy?.ok, decoy?.total], [true, 3]);
  t("NEITHER CHAIN CONTAINS THE OTHER'S VERSIONS — D-221's second, smaller risk, recorded there as "
  + "mechanism-only and never measured, is measured here and does not occur",
    [[...decoyShas].filter((s) => mainShas.has(s)), [...mainShas].filter((s) => decoyShas.has(s))], [[], []]);
  t("and the decoy's predecessor walk stays inside its own document",
    (await get("versionchain", `address=${encodeURIComponent(DECOY)}&at=${DECOY_CHAIN[2].captureSha}&limit=1`))
      ?.predecessor?.capture_sha, DECOY_CHAIN[1].captureSha);
  t("SIMILARITY GUARD: the two addresses really do differ by one query parameter, so this arm is about "
  + "near-misses and not about two unrelated urls",
    [DECOY.startsWith(ADDR), DECOY !== ADDR], [true, true]);
}

/* ====================================================================== 9
 * ONE VERSION IS NOT A DEGENERATE FAILURE, AND NEITHER IS NONE.
 * ==================================================================== */
console.log("\n--- 9. a chain of one, and a chain of none ---");
{
  const solo = await get("versionchain", `address=${encodeURIComponent(SOLO)}&at=${SOLO_SHA}`);
  t("a single-capture address answers as a chain of ONE: one version, one document, no truncation",
    [solo?.ok, solo?.count, solo?.total, solo?.documents, solo?.truncated], [true, 1, 1, 1, false]);
  t("its one version is at index 0 with no predecessor — the same honest absence the oldest of sixty gives",
    [solo?.at_index, solo?.predecessor], [0, null]);
  t("and it carries its bundle exactly as a sixtieth version does",
    solo?.versions?.[0]?.bundle_id, "INFO-2026-0990-charter");

  const none = await get("versionchain", `address=${encodeURIComponent(NOTHING)}`);
  t("an address the record never captured answers ZERO versions and ZERO documents — an honest `we hold "
  + "nothing here`, not a refusal, because sparse is the normal condition at every level",
    [none?.ok, none?.count, none?.total, none?.documents, none?.versions], [true, 0, 0, 0, []]);
  t("EMPTY-CASE GUARD: the empty answer is still an ENVELOPE — a bare collection here would be the same "
  + "defect REC-59 closed, arriving at the one shape nobody looks at",
    [Array.isArray(none), typeof none?.limit], [false, "number"]);
}

/* ===================================================================== 10
 * THE UNCHANGED CASE, ASSERTED STILL TRUE — never re-litigated.
 * ==================================================================== */
console.log("\n--- 10. a re-capture of identical content makes no new version (Bob, 2026-07-30) ---");
{
  const target = CHAIN[10];
  await recordLocator({ address: ADDR, addressNorm: ADDR, captureSha: target.captureSha,
                        retrieved: "2026-07-20T09:00:00Z" });
  const after = await get("versionchain", `address=${encodeURIComponent(ADDR)}&limit=1000`);
  const row = (after?.versions ?? []).find((v) => v.capture_sha === target.captureSha);
  t("seeing the SAME bytes again creates no new version and no second register entry — the chain is still "
  + "sixty long, and this is asserted as STILL TRUE rather than redesigned",
    [after?.total, after?.count], [N, N]);
  t("what it does instead is widen the interval and count the observation, which is the PRIMARY route by "
  + "which the record establishes that a link was contemporaneous",
    [row?.observations, row?.last_retrieved], [2, "2026-07-20T09:00:00Z"]);
  t("and it does NOT move the version's place in the history, because `first_retrieved` is when we first "
  + "held these bytes and re-checking does not change that",
    (after?.versions ?? []).map((v) => v.capture_sha).join(), CHAIN.map((v) => v.captureSha).join());

  /* D-96: the same bytes seen through a DIFFERENT route is a different FACT and
     a second row in the key — and still ONE version. */
  await recordLocator({ address: ADDR, addressNorm: ADDR, captureSha: target.captureSha,
                        retrieved: "2026-07-25T09:00:00Z", via: "archive.org",
                        retrievalLocator: "https://web.archive.org/web/2026/id_/agenda.pdf" });
  const d96 = await get("versionchain", `address=${encodeURIComponent(ADDR)}&limit=1000`);
  const r96 = (d96?.versions ?? []).find((v) => v.capture_sha === target.captureSha);
  t("D-96: an ARCHIVE sighting of the same bytes is a second row in the key — a different fact, kept — "
  + "and it is still ONE version, not two",
    [d96?.total, r96?.sightings], [N, 2]);
  t("and both routes are REPORTED rather than flattened away, because the distinction the key preserves "
  + "is one a reader needs: two sources agreeing is stronger than one source repeating",
    r96?.via, ["archive.org", "direct"]);
}

/* ===================================================================== 11
 * THE ENVELOPE. REC-57/59/60's discipline, in the plane's existing spelling.
 * ==================================================================== */
console.log("\n--- 11. the envelope: the bound APPLIED, and whether it bit ---");
{
  const asked = await get("versionchain", `address=${encodeURIComponent(ADDR)}&limit=999999`);
  t("the bound PUBLISHED is the bound APPLIED, after clamping — never the number asked for",
    asked?.limit, 1000);
  t("and a caller who names nothing gets the default, published just as plainly",
    (await get("versionchain", `address=${encodeURIComponent(ADDR)}`))?.limit, 200);
  const cut = await get("versionchain", `address=${encodeURIComponent(ADDR)}&limit=7`);
  t("a CUT answer says so, and says how many exist: `this is all of it` cannot read like `the first N`",
    [cut?.count, cut?.total, cut?.truncated], [7, N, true]);
  t("a COMPLETE answer says the opposite",
    [full?.count, full?.truncated], [N, false]);
  /* PAGING IS TOTAL, because the ORDER BY is total: every version exactly once
     over the whole walk, with no repeat and no gap. */
  const walk = [];
  for (let off = 0; off < N; off += 7)
    walk.push(...((await get("versionchain", `address=${encodeURIComponent(ADDR)}&limit=7&offset=${off}`))?.versions ?? []));
  t("PAGING IS TOTAL: the whole chain walked seven at a time yields every version EXACTLY once, in order",
    [walk.length, new Set(walk.map((v) => v.capture_sha)).size,
     walk.map((v) => v.capture_sha).join() === CHAIN.map((v) => v.captureSha).join()],
    [N, N, true]);
  t("ZERO BARE ARRAYS: the op answers an object with the bound and the completeness on it",
    [Array.isArray(full), typeof full?.limit, typeof full?.offset, typeof full?.total, typeof full?.truncated],
    [false, "number", "number", "number", "boolean"]);
}

/* ===================================================================== 12
 * THE REFUSALS. Three C-numbers, DEC-49's shape, translations imported.
 * ==================================================================== */
console.log("\n--- 12. the refusals, each a C-number with a canned translation ---");
{
  const noAddr = await get("versionchain", "limit=10");
  t("no address at all is REFUSED, not answered for some default document",
    [noAddr?.ok, noAddr?.reason, noAddr?.check], [false, "VERSION_CHAIN_NO_ADDRESS", "C-24.1"]);
  const bad = await get("versionchain", `address=${encodeURIComponent(ADDR)}&at=not-a-sha`);
  t("a malformed anchor is refused as MALFORMED — a different fact from an absent version, and stated as "
  + "one, because collapsing them makes a typo indistinguishable from an absence",
    [bad?.ok, bad?.reason, bad?.check], [false, "VERSION_CHAIN_BAD_ANCHOR", "C-24.3"]);
  const gone = await get("versionchain", `address=${encodeURIComponent(ADDR)}&at=${"0".repeat(64)}`);
  t("an anchor the record does not hold at this address is refused rather than matched approximately — "
  + "that approximation IS D-221",
    [gone?.ok, gone?.reason, gone?.check], [false, "VERSION_CHAIN_NO_SUCH_VERSION", "C-24.2"]);
  /* HIDDEN IS ABSENT: an anchor that exists at a DIFFERENT address refuses
     identically to one that does not exist at all. */
  const elsewhere = await get("versionchain", `address=${encodeURIComponent(ADDR)}&at=${SOLO_SHA}`);
  t("a capture the record DOES hold, but at another address, refuses IDENTICALLY to one it does not hold "
  + "at all — the chain answers about ONE document and discloses nothing about another",
    [elsewhere?.reason, elsewhere?.check], [gone?.reason, gone?.check]);
  t("EVERY refusal carries the canned translation from the catalogue, so a surface cannot render one the "
  + "plane did not send (DEC-49)",
    [noAddr?.translation === VERSION_CHAIN_CHECKS.VERSION_CHAIN_NO_ADDRESS.translation,
     bad?.translation === VERSION_CHAIN_CHECKS.VERSION_CHAIN_BAD_ANCHOR.translation,
     gone?.translation === VERSION_CHAIN_CHECKS.VERSION_CHAIN_NO_SUCH_VERSION.translation],
    [true, true, true]);
  t("and every refusal names a DETAIL beyond the code, so the answer is usable without the catalogue",
    [noAddr?.detail?.length > 40, bad?.detail?.length > 40, gone?.detail?.length > 40], [true, true, true]);
  t("CATALOGUE GUARD: the three checks are IMPORTED, and the catalogue really holds three (a hand-typed "
  + "list two members short of the catalogue is what PL-8 found)",
    Object.keys(VERSION_CHAIN_CHECKS).length, 3);
}

/* ===================================================================== 13
 * THE GATE, STAGED LIVE against a version a real member cannot see.
 * ==================================================================== */
console.log("\n--- 13. the gate: a version inside a project the viewer was not invited to ---");
{
  const mine = await get("versionchain", `address=${encodeURIComponent(GATED)}&limit=100`, carol);
  const theirs = await get("versionchain", `address=${encodeURIComponent(GATED)}&limit=100`, dave);
  t("the project's OWNER sees both versions at the address", [mine?.total, mine?.count], [2, 2]);
  t("the UNINVITED member sees ONE — the version filed inside the project is absent from their chain",
    [theirs?.total, theirs?.count], [1, 1]);
  t("and it is absent WHOLE: no row arrives with its bundle nulled, blanked or hollowed out (REC-36)",
    (theirs?.versions ?? []).map((v) => v.capture_sha), [OPEN_SHA]);
  t("THE TOTAL IS GATED WITH THE ROWS: a total larger than what the pages reach is exactly how a viewer "
  + "learns something was withheld",
    theirs?.total, (theirs?.versions ?? []).length);
  t("and nothing publishes HOW MANY were withheld, because that count is the leak",
    JSON.stringify(theirs).includes("withheld"), false);
  t("the withheld version is refusable-as-absent too: anchoring on it refuses for the uninvited member "
  + "exactly as an unheld capture does",
    (await get("versionchain", `address=${encodeURIComponent(GATED)}&at=${HIDDEN_SHA}`, dave))?.reason,
    "VERSION_CHAIN_NO_SUCH_VERSION");
  t("while the owner reaches it",
    (await get("versionchain", `address=${encodeURIComponent(GATED)}&at=${HIDDEN_SHA}`, carol))?.at?.capture_sha,
    HIDDEN_SHA);
  /* NO STAMP AT ALL: the deny predicate, not an unfiltered read. */
  const unstamped = await (await mf.dispatchFetch(`http://x/api/?op=versionchain&address=${encodeURIComponent(ADDR)}`)).json();
  t("and an unauthenticated caller reaches no chain at all — the failure mode of a missing stamp is an "
  + "empty answer or a refusal, never an unfiltered one",
    (unstamped?.result?.total ?? 0) === 0 || unstamped?.ok === false, true);
}

/* ===================================================================== 14
 * OVER-STRICTNESS. A correct answer phrased unlike anything here must PASS.
 * ==================================================================== */
console.log("\n--- 14. over-strictness: correct chains phrased unlike anything this file wrote ---");
{
  /* The PROPERTY, read structurally rather than by vocabulary: a chain answer is
     honest if it orders versions by a monotone date key, names a bundle per
     version, and settles completeness somewhere. */
  const ordered = (a) => {
    const rows = a.versions || a.revisions || a.items || a.snapshots || [];
    const keys = rows.map((r) => r.first_retrieved ?? r.firstSeen ?? r.captured_at ?? r.when);
    return keys.every((k, i) => i === 0 || String(keys[i - 1]) <= String(k));
  };
  const namesBundle = (a) => (a.versions || a.revisions || a.items || a.snapshots || [])
    .every((r) => typeof (r.bundle_id ?? r.bundleId ?? r.bundle ?? r.container) === "string");
  const settles = (a) => Object.entries(a).some(([k, v]) =>
    /truncated|remaining|cursor|total|hasMore|next|bounded|complete/i.test(k) ? true
      : (v && typeof v === "object" && !Array.isArray(v) && settles(v)));
  const alternatives = [
    /* camelCase, `revisions`, a cursor instead of a flag */
    { revisions: [{ firstSeen: "2026-01-01", bundleId: "INFO-1" },
                  { firstSeen: "2026-02-01", bundleId: "INFO-2" }], cursor: null },
    /* a page/of shape with `snapshots`, and completeness nested */
    { snapshots: [{ captured_at: "2026-01-01", container: "INFO-1" }],
      page: { size: 25, complete: true } },
    /* the plane's own `items` spelling with hasMore */
    { items: [{ when: "2026-01-01", bundle: "INFO-1" }, { when: "2026-03-01", bundle: "INFO-2" }],
      hasMore: false },
  ];
  t("three genuinely correct chains in vocabularies this file never emits are all accepted",
    alternatives.filter((a) => !(ordered(a) && namesBundle(a) && settles(a))).length, 0);
  /* And the reader is not simply permissive: it REFUSES the two failures this
     item exists to prevent — out-of-date-order, and a version with no bundle. */
  t("and the same reader REFUSES a chain in the WRONG ORDER, and one whose versions name no bundle — an "
  + "over-strictness arm that accepts everything proves nothing",
    [ordered({ versions: [{ first_retrieved: "2026-05-01", bundle_id: "A" },
                          { first_retrieved: "2026-01-01", bundle_id: "B" }] }),
     namesBundle({ versions: [{ first_retrieved: "2026-01-01" }] })], [false, false]);
  t("and the REAL answer passes the same three readers, so they are not a private language",
    [ordered(full), namesBundle(full), settles(full)], [true, true, true]);
}

/* ===================================================================== 15
 * D-256: THE "CHANGED FROM" SENTENCES ALREADY WRITTEN, AUDITED THROUGH THE CHAIN.
 *
 * D-221 fixed the writer; the sentences it wrote before 2026-08-08 stay in the
 * record, and BOB #31 ruled (2026-09-23 22:22Z) that the bodies stay as written
 * and the correction is the READ. `op=changedfromaudit` is that read. Every
 * verdict below is GROUND TRUTH computed from the fixture definitions, never
 * read back out of the op, and every body is digested before and after.
 * ==================================================================== */
console.log("\n--- 15. D-256: every changed-from sentence, classed through the chain, and no body touched ---");
{
  /* Three more affected bundles, and one that must NOT count. */
  const UNLOCATED = "INFO-2026-0996-unlocated", TWICE = "INFO-2026-0997-twice", NEAR = "INFO-2026-0998-nearmiss";
  const UNLOC_ADDR = normalizeAddress("https://www.oaklandca.gov/city-council/unlocated.pdf");
  /* Registered, but NO captured_locators row: the chain holds no version of it (UNDETERMINED). */
  CF_NAMES.set(UNLOCATED, CHAIN[0].bundleId);
  await promote(UNLOCATED, infoMd(UNLOCATED, UNLOC_ADDR, `Registered, never located.${changedFrom(CHAIN[0].bundleId)}`),
    "information", [{ sha256: sha("unlocated bytes\n"), path: "documents/u.pdf", encoding: "binary", bytes: 10 }]);
  /* Two sentences naming two different ids: which one the writer meant is not in the record (UNDETERMINED). */
  await promote(TWICE, infoMd(TWICE, ADDR,
    `Twice.${changedFrom(CHAIN[1].bundleId)}${changedFrom(CHAIN[2].bundleId)}`), "information", []);
  /* A sentence in words the writer never emitted is not this defect's, and is not counted. */
  await promote(NEAR, infoMd(NEAR, ADDR,
    `Near.\n\nThe record already holds an earlier capture of this address (${CHAIN[0].bundleId}).`), "information", []);

  const EVERY = [...CHAIN.map((v) => v.bundleId), ...DECOY_CHAIN.map((v) => v.bundleId),
    "INFO-2026-0990-charter", "INFO-2026-0995-budget", UNLOCATED, TWICE, NEAR];
  const digests = async () => {
    const out = {};
    for (const id of EVERY) {
      const md = (await get("image", `id=${encodeURIComponent(id)}`, "adm-pl10"))?.["bundle.md"];
      out[id] = typeof md === "string" ? sha(md) : null;
    }
    return out;
  };
  const before = await digests();
  const statsBefore = await get("stats", "", "mem-pl10");
  t(`DIGEST GUARD: every one of the ${EVERY.length} bodies was read and digested before the audit — a digest `
  + "comparison over bodies it never read would agree on nothing",
    [Object.values(before).filter((d) => typeof d === "string" && d.length === 64).length >= 66,
     Object.values(before).includes(sha(""))], [true, false]);
  t("the fixture bodies carry the WRITER'S bytes: the sixtieth version's body holds the sentence exactly as "
  + "addGo composed it, naming the oldest",
    ((await get("image", `id=${encodeURIComponent(CHAIN[59].bundleId)}`, "adm-pl10"))?.["bundle.md"] ?? "")
      .includes(changedFrom(CHAIN[0].bundleId).trim()), true);

  const audit = await get("changedfromaudit", "limit=1000", "adm-pl10");
  const by = new Map((audit?.bundles ?? []).map((b) => [b.bundle_id, b]));
  console.log(`  op=changedfromaudit: affected ${audit?.affected}, wrong ${audit?.wrong}, right ${audit?.right}, `
    + `undetermined ${audit?.undetermined}`);

  /* GROUND TRUTH: the verdict each affected bundle must carry, from the fixture alone. */
  const WANT = new Map([
    [CHAIN[59].bundleId, ["wrong", CHAIN[58].bundleId]],
    [CHAIN[40].bundleId, ["wrong", CHAIN[39].bundleId]],
    [CHAIN[20].bundleId, ["right", CHAIN[19].bundleId]],
    [DECOY_CHAIN[1].bundleId, ["right", DECOY_CHAIN[0].bundleId]],
    ["INFO-2026-0990-charter", ["undetermined", null]],
    [UNLOCATED, ["undetermined", null]],
    [TWICE, ["undetermined", null]],
  ]);
  t("the audit answers, and says it wrote nothing", [audit?.ok, audit?.wrote], [true, false]);
  t("EVERY AFFECTED BUNDLE IS FOUND: the set listed is exactly the set carrying the writer's sentence",
    [...by.keys()].sort(), [...WANT.keys()].sort());
  t("THE THREE TOTALS ARE KEPT APART and each is right — wrong 2, right 2, undetermined 3 — reporting wrong and "
  + "undetermined as one number would be D-256's own mistake repeated",
    [audit?.affected, audit?.wrong, audit?.right, audit?.undetermined], [7, 2, 2, 3]);
  t("and EXACTLY ONE CLASS EACH: the totals partition the affected set, with no bundle counted twice or left out",
    [audit?.wrong + audit?.right + audit?.undetermined === audit?.affected,
     (audit?.bundles ?? []).length === new Set((audit?.bundles ?? []).map((b) => b.bundle_id)).size,
     (audit?.bundles ?? []).every((b) => ["wrong", "right", "undetermined"].includes(b.verdict))],
    [true, true, true]);
  t(`PROVABLY WRONG — ${CHAIN[59].bundleId}, the sixtieth of sixty versions, names the OLDEST `
  + `(${CHAIN[0].bundleId}); the chain's true predecessor is ${CHAIN[58].bundleId}`,
    [by.get(CHAIN[59].bundleId)?.verdict, by.get(CHAIN[59].bundleId)?.named,
     by.get(CHAIN[59].bundleId)?.predecessor?.bundle_id, by.get(CHAIN[59].bundleId)?.at_index],
    ["wrong", CHAIN[0].bundleId, CHAIN[58].bundleId, 59]);
  t(`PROVABLY WRONG — ${CHAIN[40].bundleId} names the oldest too; its true predecessor is ${CHAIN[39].bundleId}`,
    [by.get(CHAIN[40].bundleId)?.verdict, by.get(CHAIN[40].bundleId)?.predecessor?.bundle_id],
    ["wrong", CHAIN[39].bundleId]);
  t(`PROVABLY RIGHT with ONE prior version — ${DECOY_CHAIN[1].bundleId} names ${DECOY_CHAIN[0].bundleId}, the `
  + "only version before it, where the two routes cannot disagree",
    [by.get(DECOY_CHAIN[1].bundleId)?.verdict, by.get(DECOY_CHAIN[1].bundleId)?.sole_prior,
     by.get(DECOY_CHAIN[1].bundleId)?.predecessor?.bundle_id], ["right", true, DECOY_CHAIN[0].bundleId]);
  t(`OVER-STRICTNESS: RIGHT among MANY prior versions — ${CHAIN[20].bundleId} names its true predecessor with `
  + "nineteen more before it, mid-body; a correct sentence is right however long the chain",
    [by.get(CHAIN[20].bundleId)?.verdict, by.get(CHAIN[20].bundleId)?.sole_prior,
     by.get(CHAIN[20].bundleId)?.at_index], ["right", false, 20]);
  t("UNDETERMINED, each with its reason stated: the oldest version held (no prior version to check against), "
  + "a bundle the chain holds no version of, and a body naming two ids",
    [by.get("INFO-2026-0990-charter")?.why, by.get(UNLOCATED)?.why, by.get(TWICE)?.why],
    ["no_prior_version", "no_version_held", "several_named"]);
  t("and an undetermined bundle names NO predecessor — the chain could not check it, which is not a verdict",
    ["INFO-2026-0990-charter", UNLOCATED, TWICE].map((id) => by.get(id)?.predecessor), [null, null, null]);
  t("EVERY verdict and predecessor matches the ground truth computed from the fixture",
    [...WANT].map(([id]) => [by.get(id)?.verdict, by.get(id)?.predecessor?.bundle_id ?? null]),
    [...WANT].map(([, w]) => w));
  t("PRECISION: a sentence in words the writer never emitted is not counted", by.has(NEAR), false);

  /* THE ENVELOPE: the listing is bounded; the totals never are. */
  const cut = await get("changedfromaudit", "limit=2", "adm-pl10");
  t("a CUT listing says so, and the three totals stay WHOLE — a total cut at the page would be a partial count",
    [cut?.count, cut?.total, cut?.truncated, cut?.wrong, cut?.right, cut?.undetermined],
    [2, 7, true, 2, 2, 3]);
  const walk = [];
  for (let off = 0; off < 7; off += 3)
    walk.push(...((await get("changedfromaudit", `limit=3&offset=${off}`, "adm-pl10"))?.bundles ?? []));
  t("PAGING IS TOTAL: walked three at a time, every affected bundle appears exactly once",
    [walk.length, new Set(walk.map((b) => b.bundle_id)).size], [7, 7]);
  t("the bound PUBLISHED is the bound APPLIED", (await get("changedfromaudit", "limit=999999", "adm-pl10"))?.limit, 1000);

  /* IT WRITES NOTHING. */
  const after = await digests();
  t("EVERY BODY IS BYTE-UNCHANGED: each bundle.md digests the same after the audit as before it",
    EVERY.filter((id) => after[id] !== before[id]), []);
  t("and the record's own counters read the same before and after — the witness, not a promise",
    JSON.stringify(await get("stats", "", "mem-pl10")) === JSON.stringify(statsBefore), true);
  const seg = SEGMENTS.get("changedFromAudit") || "";
  t("STRUCTURAL: the audit holds no write statement, resolves through `versionChain` and never through a "
  + "ranked search or the text index",
    [/\b(INSERT|UPDATE|DELETE|REPLACE)\b/.test(seg), /this\.versionChain\(/.test(seg),
     /this\.search\(|bundles_fts|\bMATCH\b|bm25/i.test(seg), seg.length > 1500],
    [false, true, false, true]);
  t("the sentence the audit matches IS the writer's literal — if addGo's words move, this goes red",
    /static CHANGED_FROM_SENTENCE = "([^"]+)";/.exec(STORE_CODE)?.[1], CF_PARTS[1]);

  /* THE FENCE: admin and probe; probe confined to the scratch namespace. */
  t("op=changedfromaudit is declared admin and probe, non-mutating",
    /changedfromaudit: \{ classes: \["admin", "probe"\],\s+mutating: false \}/.test(decomment(INDEX_SRC)), true);
  const asMember = await get("changedfromaudit", "", "mem-pl10");
  t("a member-class credential is refused", asMember?.ok === true || Array.isArray(asMember?.bundles), false);
  const asProbe = await get("changedfromaudit", "", "prb-pl10");
  t("and a probe answers from its own scratch namespace, which holds none of this record's bodies",
    [asProbe?.ok, asProbe?.affected], [true, 0]);
}

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
