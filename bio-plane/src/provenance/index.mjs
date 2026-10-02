/* provenance — the record's trust root (requirements: `build/requirements/provenance.md`). It holds the register,
 * which says which bundle is the one home of each captured byte sequence; the plane's own acquisition receipts, which
 * say which bytes it fetched from which address, by which route and when; the capture grade a capture's route earns;
 * and a member's firsthand observation, the one capture whose bytes are a person's own words. A hop attests bytes,
 * address and time, never the credibility of the content. Each document's chain of hops and the route marker are
 * `provenance-routes`', and trusted timestamps over capture hashes and the instance's key are `attestation`'s (N512,
 * T25); the pure copies held here for their importers through T25 were deleted in T26 (N516).
 *
 * Extracted from the legacy modules (T4-2; K49, K59, K72): `store.mjs` (the register write and the testimony fence
 * that ran inside `promote`, `testify`, the register audit, census and holds, the receipts and the version chain),
 * `index.mjs` (`partsHeld` and the `registeraudit` handler), `schema.mjs` (its tables, now `./schema.mjs`) and
 * `bio-checks.mjs` (the C-18 register arms, now `./register-checks.mjs`; since T18 the refusal families C-24, C-53
 * and C-103 too, now `./checks.mjs`). The `registeraudit` Worker arm is `./ops.mjs`' since T18.
 * The legacy code's comments moved with it, each re-pointed to this module's own names where it named the store's.
 *
 * REACHED as `provenanceOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps` and returned to every later caller. At creation it declares its tables to record-core's purge,
 * registers its check and projection with promotion (R1–R3, R42–R46), and with record-core its audit check (R59, N92)
 * and its figure (R55; record-core R63). The testimony path's later work is the slot later modules register on (R52,
 * `onTestimony`, `testimonySlot`), and its ops are `./ops.mjs`'s `provenanceOps` (R53).
 * `deps`:
 *   record, membership, promotion  the modules it uses, `recordOf(host)`, `membershipOf(host)`, `promotionOf(host)`
 *                                  unless a test passes its own.
 *   now           the module's clock, an ISO instant (default: the wall clock). R1's `registered`, R13's receipts
 *                 when a caller gives none, R28's `recorded_at` and R29's `at` read it, never a caller's time.
 *   order         the modules' total order (ids) R47's listeners run in: membership's `MODULE_ORDER`, the one list
 *                 promotion's steps run in too, unless a test passes its own. */

import { parseFrontmatter, isMachineIdentity, createSha256, EARNED_CAPTURE_CEILING, BASIS_GRADES,
         TESTIMONY_GRADE } from "../record-grammar/index.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { migrateProvenance } from "./schema.mjs";
import { registerChecks, RECEIVED_NOT_FETCHED, DOORBELL_ORIGIN } from "./register-checks.mjs";
import { REGISTER_ENTRY_CHECKS, TESTIMONY_CHECKS, VERSION_CHAIN_CHECKS, PROVENANCE_ACT_CHECKS } from "./checks.mjs";

export { PROVENANCE_SCHEMA } from "./schema.mjs";

/** The tables this module owns (R41): no other module declares, writes or reshapes them. */
export const PROVENANCE_TABLES = ["register", "captured_locators", "origin_declarations"];
export { registerChecks, RECEIVED_NOT_FETCHED, DOORBELL_ORIGIN } from "./register-checks.mjs";
export { REGISTER_ENTRY_CHECKS, VERSION_CHAIN_CHECKS, PROVENANCE_ACT_CHECKS, TESTIMONY_CHECKS } from "./checks.mjs";

const hexBytes = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const secondOf = (iso) => String(iso).replace(/\.\d+Z$/, "Z");
/* A JSON parse that answers null for text that does not parse (the legacy store's `safeJson`). */
function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}
/* A digest as the register keys it: a `sha256:` prefix and case ignored (R5). */
const bareSha = (v) => (typeof v === "string" ? v.trim().replace(/^sha256:/, "").toLowerCase() : null);

/* D-15: the bundle gate compiled over a QUALIFIED column (the legacy store's `#bundleGate`), for reads that join a
   row carrying a bundle id to the viewer predicate (membership R43) over record-core's `bundles` (its R37). */
function bundleGate(col, viewer) {
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

/* ======================================================================= *
 * CAPTURE GRADE, FROM THE ROUTE (R24–R27, R51; D-177, D-693, D-709, N364; DEC-75: capture grade is about the fetch path).
 * ======================================================================= */

/** The receipt `via` of a capture read through an archive replay (D-96's split; ARCHIVE-FALLBACK.md). */
export const ARCHIVE_VIA = "archive.org";

/** R25 · D-693 (BOB #35, 2026-09-25 07:55Z): what a capture whose only recorded source is an archive replay earns on
 *  the capture axis, DERIVED rather than typed: one rank below the direct ceiling in the same BASIS_GRADES array a
 *  leg is compared against, because grade tracks directness and the archive hop is one more party between the
 *  record and the publisher (AUTHORITY-AND-TRUST's transitive trust "with disclosure and grade adjustment";
 *  ARCHIVE-FALLBACK.md's two-hop chain). Move the ceiling and this letter moves with it; null rather than a lie if
 *  the ceiling were ever the weakest letter. The one definition, exported for every reader (op=acquire's stamp on
 *  an archive capture, the earned registry). */
export const ARCHIVE_CAPTURE_GRADE = BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) + 1] ?? null;

/** R51 · N364 (Bob, K509 (3)): the receipt `via` of material handed to the group through the doorbell and brought in
 *  by a member's pull (`capture.pullKnock`, its R65), at the address `knock:<knockId>`. The material was RECEIVED,
 *  never fetched: no instance asked any address for it, so it earns no fetched letter. The one spelling, exported
 *  for the writer. */
export const DOORBELL_VIA = "doorbell";

/* PL-10 / D-220. The chain's bound, in the pair every capped read in this
   file publishes: the default a caller gets by saying nothing, and the
   ceiling a caller cannot ask past. 200 because a weekly capture of one
   calendar reaches roughly 50 versions a year and a member reading a chain is
   reading a HISTORY, not paging a corpus; 1000 because past that the answer
   stops being something a person reads and becomes something a run walks,
   and a run has `offset`. Named rather than literal so REC-57's roster walk
   can see this method carries a cap at all. */
export const VERSION_CHAIN_LIMIT_DEFAULT = 200;
export const VERSION_CHAIN_LIMIT_MAX = 1000;

/* ==================================================================== *
 * MK-1 / D-184 / IC-133 / IC-134 — THE AUTHORED BUNDLE.
 *
 * `MEMBER-KNOWLEDGE-DESIGN.md` §2, read at the artifact before this was built
 * (§8's condition): *an observation is an authored INFORMATION bundle whose
 * bytes are exactly the member's words, registered like any capture, so that it
 * IS content in the record's one sense of the word … and every reader already
 * built works on it unchanged.* Bob's ruling it serves (§1, quoted there): *a
 * member's own eyewitness knowledge can be evidence — though it stands on the
 * trust held by that member.*
 *
 * WHAT IT IS, BUILT OUT OF WHAT EXISTED. An INFO bundle, written through
 * `promote` — the one write path — with the member's words — below the canonical header (`testimonyBytes`) — as a file under
 * `snapshots/`, a `data/provenance.json` document declaring origin `member`,
 * actor class `member` and `authored: true`, and a register row over the
 * words' bytes. In the SAME transaction: one passage-index unit over the whole
 * words (so `passage:` search finds them) and one `document` content row
 * (so a leg can cite them by `content_id` exactly as it cites any row).
 *
 * WHAT KEEPS IT HONEST, and it is the half that matters (§2): a capture of a
 * publisher's document and a member's authored statement are different acts
 * and the register must never let one pass for the other.
 *   - the `authored` flag is settable ONLY here — `TESTIMONY_PATH` is a Symbol,
 *     which no JSON body can carry — and `#testimonyFence` refuses it at
 *     `promote` on anything this method did not write (C-53.8);
 *   - the author is STAMPED by the control plane from the session; a caller
 *     naming one is refused (C-53.2), and a machine is refused (C-53.1);
 *   - two dates, kept apart: `observed_at` is the member's statement,
 *     `recorded_at` is this record's own clock and is not taken from the caller;
 *   - the words are the member's AS WRITTEN, after a canonical header of the testimony's id and observed_at (BOB #14, 2026-09-18) — nothing trims, paraphrases
 *     or cleans them. An edit is a new observation, never a rewrite.
 *
 * HOW IT READS ON THE THREE AXES (MK-2 built the third, §3): the TESTIMONY
 * axis earns TESTIMONY_GRADE — `earnedBasisRegistry`'s `testimony` map, from
 * the register's `authored` flag and from nothing else; the CAPTURE axis earns
 * NO letter for an authored capture — undetermined and stated
 * (`CAPTURE_AXIS_AUTHORED`) — because the axis measures the act of reading a
 * document in, which did not happen; the CONNECTION axis earns nothing, since
 * no reader ran over the words and nothing resolved them. A leg citing an
 * observation is graded on the testimony axis or not at all (checkTestimonyLeg).
 * ==================================================================== */

/** One passage: the same per-unit cap the content-grain text index stores a
 *  unit to, for `TRANSCRIPTION_MAX_BYTES`'s reason — REFUSED over it, never
 *  cut, because words silently truncated are words the member did not write. */
export const TESTIMONY_MAX_BYTES = 128 * 1024;   /* CAPTURE_TEXT_UNIT_CAP, 131,072 B (M-20) */

/** THE CANONICAL AUTHORED BYTES — PERMANENT ONCE ON MAIN, so stated exactly.
 *
 *  Ruled by BOB #14, 2026-09-18 (MK-1 design gap 1): identical words from two
 *  members are two testimonies, and the register is keyed by the bytes' sha,
 *  so the bytes carry a header that makes them unique per testimony. The
 *  format, byte for byte, UTF-8:
 *
 *      bio-testimony/1\n
 *      id: <the testimony's own bundle id>\n
 *      observed_at: <the member's observedAt, exactly as accepted>\n
 *      \n
 *      <the member's words, exactly as written — nothing added after them>
 *
 *  Three header lines in THIS order, each `key: value` with one space, LF line
 *  ends, then ONE empty line; the words begin at the first byte after the first
 *  "\n\n" and run to the end of the file. `bio-testimony/1` names the format so
 *  a later one is a new version line, never a silent change. Both values are
 *  single-line by construction (`id` is canonical, `observed_at` is validated
 *  to a date or instant), so the header cannot be forged from inside the words.
 *
 *  NO AUTHOR IDENTITY IS IN THE BYTES, by the same ruling: who the author is
 *  and what a published case shows of them is the attribution level's to
 *  govern (§4), and bytes are what verification publishes. The author is in
 *  the REGISTER alone (`register.author`, written only under TESTIMONY_PATH);
 *  every other file of the bundle names them by `observerRef` (§4.1). */
export const TESTIMONY_FORMAT = "bio-testimony/1";
export function testimonyBytes({ id, observedAt, words }) {
  return `${TESTIMONY_FORMAT}\nid: ${id}\nobserved_at: ${observedAt}\n\n${words}`;
}

/** MK-6 — THE BUNDLE NEVER NAMES ITS AUTHOR (MEMBER-KNOWLEDGE-DESIGN.md §4.1,
 *  BOB #19, 2026-09-21). §2 kept the author out of the testimony BYTES; §4.1
 *  extends the rule to EVERY file of an authored bundle, because a ratified
 *  bundle's files are exactly what the published bucket receives. Wherever a
 *  file records who authored it (the Session Log, `data/provenance.json`'s
 *  `author` and its chain's `who`), it writes this OPAQUE, PER-OBSERVATION
 *  reference instead of the member. One reference per testimony, so two
 *  observations by one member are unlinkable by construction. Only the
 *  register's `author` column resolves it, privately. The bundle is therefore
 *  the same bytes at every attribution level, and the level lives outside it
 *  (§4.3). */
export function observerRef(testimonyId) {
  return `observer:${testimonyId}`;
}

/* A refusal carrying its catalogue row, for a family this module's Uses name (legacy-checks, K72 (5)). The code is a
   literal at each site, so DEC-49's guard reads which code a region mints. */
const rowRefusal = (family) => (code, detail, extra) => {
  const row = family[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
};
/* This module's own acts' refusals (C-103: the register refusal at the write, a declared origin, a signed receipt). */
const actRefusal = rowRefusal(PROVENANCE_ACT_CHECKS);

/* ======================================================================= *
 * THE MEMBER'S OBSERVATION: its bytes and its reference (R28).
 * ======================================================================= */

/** MK-1: the key under which `testify` tells `promote`, and this module's registered step, that a package is the
 *  testimony path's own. A Symbol, so no JSON body a caller sends can carry it: the `authored` flag is settable only by
 *  `testify` (R3, R38). A later module's projection that writes the observation's content (the passage index, the
 *  content row, the extraction look; K31) reads the payload under this key: `{captureSha, author, observedAt,
 *  recordedAt, words}`. */
export const TESTIMONY_PATH = Symbol("mk1-testimony-path");

/** The legacy store's `observedMs`: when the member says they observed it, a calendar date or a UTC instant, a real
 *  one (2026-02-31 is refused, not rolled over), as epoch ms — or null. REQUIRED, and that STANDS by BOB #14's ruling
 *  of 2026-09-18: the record does not date a member's observation for them. */
function observedMs(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?Z)?$/.exec(v);
  if (!m) return null;
  const ms = Date.parse(m[4] === undefined ? `${v}T00:00:00Z` : v);
  if (!Number.isFinite(ms)) return null;
  const back = new Date(ms).toISOString();
  if (back.slice(0, 10) !== v.slice(0, 10)) return null;
  return ms;
}


/* ======================================================================= *
 * THE EVIDENCE STORE: parts (R7) and the audit's probe (R8, R9). Each takes the evidence store as callbacks (`head`,
 * `get` by digest), record-core's R38 in the Durable Object and the bucket keyed by the control plane in the Worker,
 * so the one rule runs at every door.
 * ======================================================================= */

/* D-533: ARE THESE PARTS, AS THE RECORD NAMES THEM, HELD — each present under its own content address and its
   digest verified? `op=registeraudit` asks it of a capture held only in parts (Intake Doctrine section 8, BOB #33's
   ruling of 2026-09-24 21:17Z). A part is VERIFIED when R2 reports the SHA-256 it checked at the put (both
   writers, `op=acquire` and `op=capture`, pass it) and that digest is the one the record names, and the stored
   size is the record's. An object carrying no such checksum is read and hashed when it is no larger than one
   acquire part; a larger one is left UNVERIFIED and said so, never passed. Three lists, each naming the part:
   `missing`, `disagree` (size or digest), `unverified`.
   D-556 (BOB #34, 2026-09-25 00:00Z): THREE READERS, ONE RULE. The ratify gate asks it of a whole-hash register row
   held in parts before admitting it, and publication asks it again of the PUBLISHED bucket after copying the parts
   across, so `keyOf` names the bucket's key for a part's hash rather than this function assuming the working one. */
export const PART_VERIFY_READ_MAX = 8 * 1024 * 1024;
export async function partsHeld(bucket, keyOf, parts) {
  const missing = [], disagree = [], unverified = [];
  for (const p of parts) {
    const name = { file: p.file, sha256: p.sha256, bytes: p.bytes };
    const h = await bucket.head(keyOf(p.sha256));
    if (!h) { missing.push(name); continue; }
    if (h.size !== p.bytes) { disagree.push({ ...name, stored_bytes: h.size }); continue; }
    let digest = h.checksums?.sha256 ? hexBytes(h.checksums.sha256) : null;
    if (!digest && h.size <= PART_VERIFY_READ_MAX) {
      const o = await bucket.get(keyOf(p.sha256));
      if (o) digest = hexBytes(await crypto.subtle.digest("SHA-256", await o.arrayBuffer()));
    }
    if (!digest) unverified.push({ ...name, why: "no stored checksum, and too large to read here" });
    else if (digest !== p.sha256) disagree.push({ ...name, stored_sha256: digest });
  }
  return { missing, disagree, unverified };
}

/** R8, R9 — the register audit's report, from the store's classification of every register row (`registerRows`)
 *  and a probe of the evidence store (`evidence`: `{head, get}` by digest; null when the instance has none). Every
 *  row the store could not resolve from the bundle image is probed:
 *    captured       the bytes are not in the bundle image but ARE in the working bucket, whole, and the size agrees
 *    mismatched     the register and the stored object disagree about size, or a part about its digest
 *    held_in_parts  every part the record names is held and verified, and the parts' sizes sum to the row's
 *    unbacked       not held, a part missing, or the home gone: the one broken state, with its reason
 *    undetermined   the record's parts cannot be read, or a part is present and unverified: counted OUTSIDE `sound`
 *  REC-52: this answer is a SOUNDNESS VERDICT about the register, so an audit that could not probe says so
 *  (`probed: false`) and calls every unresolved row unbacked with that reason, never clean. */
export async function registerAuditReport(r, evidence) {
  const canProbe = !!(evidence && typeof evidence.head === "function");
  const captured = [], unbacked = [], mismatched = [], heldInParts = [], undetermined = [];
  for (const { named_parts: named, ...row } of r.unresolved || []) {
    if (row.class === "orphan") { unbacked.push({ ...row, why: "the record itself is absent" }); continue; }
    if (!canProbe) { unbacked.push({ ...row, why: "no capture bucket is configured to check" }); continue; }
    const h = await evidence.head(row.capture_sha);
    if (h) {
      if (typeof row.bytes === "number" && h.size !== row.bytes)
        mismatched.push({ ...row, registered: row.bytes, stored: h.size });
      else captured.push(row);
      continue;
    }
    /* D-533 (BOB #33, 2026-09-24 21:17Z; Intake Doctrine section 8): A CAPTURE HELD IN PARTS HAS NO
       WHOLE KEY. `op=acquire` stores a multi-part document only as its parts, so the head above misses for
       every one of them and this audit called held bytes missing and the record unsound. The ruling: such
       a row is SOUND when every part the record names is present and each part's digest is verified
       ("held in parts, all present"); a missing part is NAMED; and a row resolving neither way is
       UNDETERMINED, counted outside `sound`, never inside it. */
    if (named?.state === "unreadable") { undetermined.push({ ...row, why: named.why }); continue; }
    if (named?.state !== "named") { unbacked.push({ ...row, why: "no bytes in the working bucket" }); continue; }
    const v = await partsHeld(evidence, (s) => s, named.parts);
    const sum = named.parts.reduce((n, p) => n + p.bytes, 0);
    if (v.missing.length)
      unbacked.push({ ...row, why: `${v.missing.length} of the ${named.parts.length} parts the record names `
                                 + `are not in the working bucket`, missing_parts: v.missing });
    else if (v.disagree.length || (typeof row.bytes === "number" && sum !== row.bytes))
      mismatched.push({ ...row, registered: row.bytes, stored: sum,
                        ...(v.disagree.length ? { disagreeing_parts: v.disagree } : {}) });
    else if (v.unverified.length)
      undetermined.push({ ...row, why: `every part the record names is present, but the digest of `
                                     + `${v.unverified.length} could not be verified`, unverified_parts: v.unverified });
    else heldInParts.push(row);
  }
  return {
    total: r.total, live: r.live, superseded: r.superseded, historical: r.historical,
    captured: captured.length, held_in_parts: heldInParts.length,
    mismatched: mismatched.length, unbacked: unbacked.length, undetermined: undetermined.length,
    sound: unbacked.length === 0 && mismatched.length === 0, probed: canProbe,
    detail: "captured means the bytes are not in the record's image but ARE in the working bucket, which "
          + "is what the two-bucket design exists for. "
          + "held_in_parts is the same for a document the store keeps only in parts: every part the "
          + "record names is in the working bucket and each part's digest is verified (the reassembled "
          + "whole's digest is C-18.6's check, not re-read here). "
          + "unbacked is the only broken state, and names any missing part; mismatched means the register "
          + "and the stored object disagree about size, or a part about its digest. undetermined rows "
          + "resolved neither way and are counted OUTSIDE sound: sound speaks for the other rows only.",
    sample: [...unbacked, ...mismatched, ...undetermined].slice(0, 40),
  };
}

/* ======================================================================= *
 * THE C-18 ARMS AT THE GATE AND IN THE AUDIT (K72 (4); record-core R59), so moving them out of the catalogue loses none.
 * ======================================================================= */

/* An image (path → text, or a blob reference) as the arms read it: the files, the elided paths and the front matter. */
function imageForChecks(image) {
  const files = new Map(), elided = new Set();
  for (const [path, v] of Object.entries(image || {})) (typeof v === "string" ? files.set(path, v) : elided.add(path));
  const md = files.get("bundle.md");
  const fm = typeof md === "string" ? parseFrontmatter(md).data : null;
  return { files, elided, fm: isObj(fm) ? fm : null };
}

/** The gate's answer (promotion's `runGate`, R27–R29) with the C-18 register arms run over the same image after it:
 *  an error finding joins `findings` and makes `ok` false, a warning adds to `warnings`. */
export function withRegisterChecks(image, gate) {
  const found = registerChecks(imageForChecks(image));
  const errors = found.filter((x) => x.severity === "error")
    .map((x) => ({ check: x.check, detail: x.message, ...(x.repairs ? { repairs: x.repairs } : {}) }));
  const findings = [...(gate.findings || []), ...errors];
  return { ...gate, ok: gate.ok && errors.length === 0, findings,
           warnings: (gate.warnings || 0) + found.length - errors.length };
}

/* ======================================================================= *
 * THE MODULE
 * ======================================================================= */

class Provenance {
  #storage; #sql; #record; #membership; #promotion; #now;
  #listeners = [];        // R47: {module, fn, rank}
  #testimony = [];        // R52: {module, check, project, rank, seq}
  #order;

  constructor({ storage, record, membership, promotion, now, order } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#promotion = promotion;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#order = Array.isArray(order) ? order : MODULE_ORDER;
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** This module's tables (R41), created or brought up to shape. Called by the host at every boot; idempotent. */
  migrate() {
    migrateProvenance(this.#sql);
    return { ok: true };
  }

  /* ===================================================================== *
   * R1–R3, R42–R46: THE REGISTER, WRITTEN INSIDE A PROMOTION (promotion R39, K31).
   * ===================================================================== */

  /* The check, before anything is written: each entry's stated size (R50), the testimony fence (R3) and one capture,
     one home (R2), then the C-18 register arms (R42–R46). A refusal refuses the whole promotion (promotion R2). */
  #check(c) {
    const { pkg, bundleId, files, register, head, promotedType, replay } = c;
    const unstated = this.#registerEntries(bundleId, register);
    if (unstated) return unstated;
    const testimony = pkg && pkg[TESTIMONY_PATH] ? pkg[TESTIMONY_PATH] : null;
    const fenced = this.#testimonyFence(bundleId, files, register, testimony,
      { identity: pkg ? pkg.actorIdentity ?? null : null, viewer: pkg ? pkg.actorViewer ?? null : null });
    if (fenced) return fenced;
    return this.#registerArms({ bundleId, files, head, promotedType, replay, docFm: c.docFm });
  }

  /* R50 · N263: every entry of the promotion's `register` list states its size, a whole number of bytes at least 0,
     which R1 stores exactly as stated. Asked first, of every entry and on a replay too: an entry that states no size is
     malformed before anything is judged about it, and without this the NOT NULL column refused an absent size as a
     bare PROMOTE_FAILED while `-1` or `1.5` were stored. A safe integer, so the stored value is the stated one. The
     stated size is not compared with the stored object's here (R7 and R8 read that). */
  #registerEntries(bundleId, register) {
    const refusal = rowRefusal(REGISTER_ENTRY_CHECKS);
    const list = Array.isArray(register) ? register : [];
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const bytes = isObj(e) ? e.bytes : undefined;
      if (Number.isSafeInteger(bytes) && bytes >= 0) continue;
      const sha256 = isObj(e) && typeof e.sha256 === "string" ? e.sha256 : null;
      const path = isObj(e) && typeof e.path === "string" ? e.path : null;
      const shown = typeof bytes === "string" ? JSON.stringify(bytes).slice(0, 40)
                  : bytes !== null && typeof bytes === "object" ? (Array.isArray(bytes) ? "a list" : "an object")
                  : String(bytes);
      const said = bytes === undefined ? "states no bytes" : `states bytes ${shown}`;
      /* DEC-49 REGION is-register-bytes */
      return refusal("REGISTER_BYTES_UNSTATED",
        `register[${i}] (${sha256 ? `capture ${sha256.slice(0, 16)}…` : "no capture named"}, `
        + `${path ? `path ${path.slice(0, 120)}` : "no path"}) ${said}: an entry states its size as a whole number `
        + `of bytes at least 0. Nothing was written`,
        { bundleId, index: i, sha256, path });
      /* END DEC-49 REGION is-register-bytes */
    }
    return null;
  }

  /* R42–R46 at the write (K72 (4)): the C-18 arms over the promoted package, for an information bundle whose register
     is present. Every error finding of a creation refuses it; a revision is refused for an error finding the held
     version does not already carry, so a promotion never adds a violation and is never refused for one it inherited
     (correction moves forward; Q1 in the job record). A replay is exempt, as the gathering grammar's check is: the
     record's history must be holdable verbatim. A warning (C-18.4) never refuses. */
  #registerArms({ bundleId, files, head, promotedType, replay, docFm }) {
    if (replay) return null;
    const type = String(promotedType ?? "").toLowerCase();
    if (type !== "information") return null;
    if (!files.some((f) => f && f.path === "data/provenance.json")) return null;
    const asImage = (list) => {
      const img = {};
      for (const f of list) if (f && typeof f.path === "string") img[f.path] = typeof f.text === "string" ? f.text : { blobSha: f.blobSha };
      return img;
    };
    const now = registerChecks({ ...imageForChecks(asImage(files)), fm: isObj(docFm) ? docFm : imageForChecks(asImage(files)).fm })
      .filter((x) => x.severity === "error");
    if (!now.length) return null;
    let held = new Set();
    if (head) {
      const live = {};
      for (const p of this.#record.livePaths(bundleId) || []) {
        const f = this.#record.readFile(bundleId, p);
        if (f) live[p] = typeof f.text === "string" ? f.text : { blobSha: f.blobSha };
      }
      held = new Set(registerChecks(imageForChecks(live)).filter((x) => x.severity === "error")
        .map((x) => `${x.check}\u0000${x.message}`));
    }
    const added = now.filter((x) => !held.has(`${x.check}\u0000${x.message}`));
    if (!added.length) return null;
    return actRefusal("PROVENANCE_REGISTER_REFUSED",
      `this promotion's data/provenance.json fails ${added.length} of the intake provenance register's `
      + `rules (C-18) that the version it revises did not fail. Nothing was written.`,
      { bundleId, findings: added.map((x) => ({ check: x.check, detail: x.message, ...(x.code ? { code: x.code } : {}),
                                                ...(x.repairs ? { repairs: x.repairs } : {}) })) });
  }

  /* R1: the register write, after `commit`, in the same transaction. `registered` is this module's clock; the
     authored columns are written from the testimony path's own key and never from the entry a caller sent. */
  #project(c) {
    const { pkg, bundleId, register } = c;
    const testimony = pkg && pkg[TESTIMONY_PATH] ? pkg[TESTIMONY_PATH] : null;
    /* MK-1 / IC-134: the three authored columns are written FROM THE
       TESTIMONY PATH'S OWN KEY and never from the entry a caller sent — `c`
       may carry an `authored` field and it is not read. An UPSERT rather than
       the `INSERT OR REPLACE` this was, so that a later revision re-registering
       an authored capture under the SAME bundle keeps what it is (REPLACE would
       have reset it to the default, the flag being cleared by any writer). The
       other five columns move exactly as REPLACE moved them. A re-registration
       under a DIFFERENT bundle that still exists cannot reach here for ANY row:
       the fence above refuses it (C-53.8 for an authored row, C-53.13 for every
       other, D-179), so the UPDATE arm moves a row only within its own bundle or
       off a home that no longer exists. */
    const at = this.#now();
    for (const r of Array.isArray(register) ? register : []) {
      if (!r || typeof r.sha256 !== "string") continue;
      const own = !!(testimony && testimony.captureSha === r.sha256);
      this.#sql.exec(
        `INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,authored,author,observed_at)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(capture_sha) DO UPDATE SET
           bundle_id=excluded.bundle_id, path=excluded.path, encoding=excluded.encoding,
           bytes=excluded.bytes, registered=excluded.registered,
           authored=MAX(register.authored, excluded.authored),
           author=COALESCE(excluded.author, register.author),
           observed_at=COALESCE(excluded.observed_at, register.observed_at)`,
        r.sha256, bundleId, r.path, r.encoding ?? "utf8", r.bytes, at,
        own ? 1 : 0, own ? testimony.author : null, own ? testimony.observedAt : null);
    }
    return null;
  }

  /** Registers this module's check and projection with promotion, once (the factory calls it). */
  joinPromotion() {
    return this.#promotion.registerStep("provenance", { check: (c) => this.#check(c), project: (c) => this.#project(c) });
  }

  /* ===================================================================== *
   * R52: THE TESTIMONY PATH'S LATER WORK, AS ONE SLOT (`build/extraction/legacy-store.md` §4.2 (5); K31's pattern, as
   * R47; a fixed slot in the step order, as record-grammar R28's, K763).
   * ===================================================================== */

  /** R52 — a later module's work on a member's observation, registered once at start: a `check` asked before the
   *  write, a `project`ion written after it, or both. A malformed or repeated registration is refused through
   *  membership's `listenerRefusal` (its R81), the one site of `LISTENER_MALFORMED` and `LISTENER_DECLARED`. */
  onTestimony(module, spec) {
    const fnOr = (v) => v === undefined || v === null || typeof v === "function";
    const check = isObj(spec) && typeof spec.check === "function" ? spec.check : null;
    const project = isObj(spec) && typeof spec.project === "function" ? spec.project : null;
    const formed = isObj(spec) && fnOr(spec.check) && fnOr(spec.project) && (check || project);
    const refused = listenerRefusal(this.#testimony, module, formed ? (check || project) : null);
    if (refused) return refused;
    const i = this.#order.indexOf(module);
    this.#testimony.push({ module, check, project, rank: i === -1 ? Infinity : i, seq: this.#testimony.length });
    this.#testimony.sort((a, b) => (a.rank - b.rank) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /* The path's own fields as R28 wrote them, for a promotion that carries the testimony path; null for any other. */
  #testimonyOf(c) {
    const t = c && c.pkg && c.pkg[TESTIMONY_PATH];
    if (!t) return null;
    return { bundleId: c.bundleId, captureSha: t.captureSha, words: t.words, author: t.author,
             observedAt: t.observedAt, recordedAt: t.recordedAt };
  }

  /** R52 — the registrations as one slot, which the composition root runs where the legacy store's promotion step ran
   *  the testimony work (control-plane's promotion step since T19, its R42): `check(c)` at the end of that step's check,
   *  `project(c)` at the end of its projection (`c` the promotion's step context). This module runs neither in its own step and calls no later
   *  module: what runs is what registered. On a promotion without the testimony path both answer null. */
  testimonySlot() {
    return {
      /* Every registered check, in the modules' order; the first refusal refuses the promotion as it came. */
      check: (c) => {
        const t = this.#testimonyOf(c);
        if (!t) return null;
        for (const { check } of this.#testimony) {
          if (!check) continue;
          const out = check({ ...t, earlier: {} });
          if (out && out.ok === false) return out;
        }
        return null;
      },
      /* Every registered projection, in the modules' order, each told what the ones before it answered. Their
         answers are joined, in that order, as `testimony`. A projection that throws is not caught: the promotion
         rolls back whole. */
      project: (c) => {
        const t = this.#testimonyOf(c);
        if (!t) return null;
        const earlier = {}, testimony = {};
        for (const { module, project } of this.#testimony) {
          if (!project) continue;
          const out = project({ ...t, earlier: { ...earlier } });
          if (out && out.ok === false) return out;
          earlier[module] = out ?? null;
          if (isObj(out)) Object.assign(testimony, out);
        }
        return { testimony };
      },
    };
  }

  /* Why is a register row unreferenced? (D-9)
   *
   * The register maps a capture's sha to the bundle and path it was intake for.
   * Nothing could read it until 0.22.0, so the 30 unreferenced rows on the live
   * record were explained only by a guess.
   *
   * THE FIRST VERSION OF THIS LOOKED IN TWO OF THE THREE PLACES BYTES CAN LIVE.
   * It checked `files` and `history` and called everything else "dropped", which
   * produced a confident and wrong finding: that bytes registered but carried in
   * no file could not be audited from the record. They were in R2 the whole time,
   * which is precisely what the two-bucket design is for.
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
  registerRows() {
    const rows = this.#rows(`SELECT capture_sha, bundle_id, path, encoding, bytes, registered FROM register`);
    const out = { total: rows.length, live: 0, superseded: 0, historical: 0, orphan: 0, unresolved: [] };
    for (const r of rows) {
      if (!this.#record.bundleInfo(r.bundle_id)) {
        out.orphan++; out.unresolved.push({ ...r, class: "orphan" }); continue;
      }
      const here = this.#record.readFile(r.bundle_id, r.path);
      if (here && here.sha256 === r.capture_sha) { out.live++; continue; }
      /* History is record-core's table, read on its digest column (record-core's read contract, R37). */
      if (this.#one(`SELECT sha256 FROM history WHERE bundle_id=? AND sha256=? LIMIT 1`, r.bundle_id, r.capture_sha)) {
        out.historical++; continue;
      }
      if (here) { out.superseded++; continue; }
      out.unresolved.push({ ...r, class: "unresolved", named_parts: this.partsNamed(r.bundle_id, r.capture_sha) });
    }
    return { ok: true, ...out, needsCaptureProbe: out.unresolved.length };
  }

  /* D-533 (BOB #33, 2026-09-24 21:17Z; Intake Doctrine section 8): WHICH PARTS DOES THE RECORD NAME FOR A
   * CAPTURE IT HOLDS IN PARTS? `op=acquire` stores a multi-part document ONLY as its parts, each under its own
   * hash, and never the whole under the whole's; the one place the record names those parts is the holding
   * bundle's intake provenance register, `data/provenance.json`, whose document for that `capture_sha` carries
   * `parts: [{file, sha256, bytes}]` (the shape C-18.1 checks). So the audit's R2 probe of the WHOLE key can
   * only ever miss for such a row, and it called held bytes missing.
   *
   *   none        the register document names no parts for this sha (or the bundle has no register): the
   *               whole key is the only place the record says the bytes live
   *   named       the parts, as the record names them, for the control plane to head and verify
   *   unreadable  the register exists and could not be read to an answer, with why: the row resolves
   *               NEITHER way, and the ruling counts it UNDETERMINED, outside `sound`
   *
   * It reads the live image only (`files`), which is what the audit's `live` class reads too. */
  partsNamed(bundleId, sha) {
    const f = typeof bundleId === "string" && bundleId ? this.#record.readFile(bundleId, "data/provenance.json") : null;
    if (!f) return { state: "none" };
    if (typeof f.text !== "string")
      return { state: "unreadable", why: "the record's data/provenance.json is held as a blob, which the store cannot read" };
    let reg;
    try { reg = JSON.parse(f.text); } catch {
      return { state: "unreadable", why: "the record's data/provenance.json does not parse" };
    }
    const doc = (Array.isArray(reg?.documents) ? reg.documents : [])
      .find((d) => d && bareSha(d.capture?.sha256) === bareSha(sha) && d.parts !== undefined);
    if (!doc) return { state: "none" };
    const ok = Array.isArray(doc.parts) && doc.parts.length && doc.parts.every((p) =>
      p && /^[0-9a-f]{64}$/.test(bareSha(p.sha256) || "") && Number.isInteger(p.bytes) && p.bytes >= 0);
    if (!ok) return { state: "unreadable", why: "the register document names parts for this capture without a digest and size for each" };
    return { state: "named", parts: doc.parts.map((p) => ({ file: typeof p.file === "string" ? p.file : null,
                                                            sha256: bareSha(p.sha256), bytes: p.bytes })) };
  }
  /* REC-190: THE CENSUS OF DISPLACED HOMES (`BIO_Intake_Doctrine_v1_1.md` §8, ONE CAPTURE, ONE HOME — the ORIGINAL's;
     D-179's residue). Before D-179's fence `op=promote` UPSERTed `register.bundle_id` on the `capture_sha` key, so a
     second bundle registering bytes the record already held MOVED the first bundle's register row to itself, and the
     first bundle's own `files` / `history` rows kept carrying bytes the register now says live elsewhere. This lists
     every such row: a `files` or `history` row whose sha256 the register assigns to a DIFFERENT bundle that STILL
     EXISTS, with both bundles named, grouped by the sha. READ-ONLY and never a repair (BOB #31, 2026-09-23 22:03Z: the
     census's report STANDS ALONE): WHICH BUNDLE HELD THE CAPTURE FIRST IS UNDETERMINED — the register keeps one holder
     and no prior one, and a row a bundle carried without ever registering it reads the same — so the answer names the
     register's CURRENT holder as that and nothing more, and says so. A sha shared by several bundles that the register
     does not assign elsewhere (an identical ordinary file, or the holder's own revisions) is NOT a displaced home and
     is not listed: only the register decides a home. A register row whose bundle no longer exists names no home and
     is counted apart (`home_absent`), never listed. The digest-level duplicate (the same content in different bytes)
     is out of reach: this compares the bytes' digest and nothing about their meaning. Shas are compared lower-cased on
     both sides, so a spelling difference is not a second identity. Bounded by `limit` shas listed (the counts are
     always whole). */
  homeCensus({ limit } = {}) {
    const asked = limit === undefined || limit === null || limit === "" ? NaN : Number(limit);
    const cap = Math.max(0, Math.min(Number.isInteger(asked) ? asked : 50, 500));
    const homes = new Map();
    const reg = { rows: 0, home_absent: 0 };
    for (const r of this.#sql.exec(`SELECT r.capture_sha, r.bundle_id, r.path, b.bundle_id AS present
                                     FROM register r LEFT JOIN bundles b ON b.bundle_id = r.bundle_id`)) {
      reg.rows++;
      if (r.present === null) { reg.home_absent++; continue; }
      homes.set(String(r.capture_sha).toLowerCase(), { bundle_id: r.bundle_id, path: r.path });
    }
    const bySha = new Map();
    const walk = (table) => {
      const out = { rows: 0, displaced: 0 };
      for (const r of this.#sql.exec(table === "files"
          ? `SELECT bundle_id, NULL AS snap_key, path, sha256 FROM files`
          : `SELECT bundle_id, snap_key, path, sha256 FROM history`)) {
        out.rows++;
        const s = String(r.sha256 ?? "").toLowerCase();
        const home = homes.get(s);
        if (!home) continue;
        if (home.bundle_id === r.bundle_id) continue;                     /* the different-bundle predicate */
        out.displaced++;
        if (!bySha.has(s)) bySha.set(s, { capture_sha: s, home: { ...home }, held_by: [] });
        bySha.get(s).held_by.push({ table, bundle_id: r.bundle_id, path: r.path,
                                    ...(r.snap_key ? { snap_key: r.snap_key } : {}) });
      }
      return out;
    };
    const files = walk("files"), history = walk("history");
    return { ok: true, register: reg, files, history, shas: bySha.size, listed: [...bySha.values()].slice(0, cap),
             first_holder: "UNDETERMINED", rewritten: 0,
             note: "read-only: each listed sha is registered to `home` and ALSO carried by every `held_by` row, a "
                 + "different record that still exists. Nothing is rewritten or repaired. `home` is the register's "
                 + "current holder, never a finding about which record held the capture first — that is undetermined. "
                 + "The same content in different bytes is not reached." };
  }

  /** D-476 - IS THIS WHOLE DOCUMENT ALREADY IN THE REGISTER? ONE BOUNDED READ ON
   *  THE REGISTER'S OWN KEY, and the only question `op=acquire` can ask about a
   *  MULTI-PART capture.
   *
   *  D-469 answered acquire's `existed` for a single-part capture by asking R2 for
   *  the whole's own key BEFORE the put. A multi-part capture has no such key: the
   *  whole is never stored under its own hash, only its parts are. So that
   *  question cannot be asked at all, and acquire answered a flat `false` - which
   *  CLAIMS THE BYTES ARE NEW every time a document the record already holds is
   *  re-fetched. This is the question that CAN be asked, and it is the record's
   *  own: `register` is keyed by `capture_sha`, the identity of the bytes across
   *  the whole system (`INTERFACES.md` I1 section 1), and one capture has one
   *  home (D-179; `BIO_Intake_Doctrine_v1_1.md` section 8).
   *
   *  THE HOLDER MUST STILL EXIST - the `bundles` join D-179's fence makes, for
   *  the reason that ruling gives: bytes whose home was purged register afresh,
   *  so a register row whose bundle is gone is not a holding.
   *
   *  IT NAMES NO BUNDLE, and so it needs no viewer. A caller learns only that the
   *  record holds these bytes, which is the whole of what `existed` has ever said;
   *  WHICH bundle holds them is D-15's question, answered under a visibility stamp
   *  by `op=promote`'s refusal and never here.
   *
   *  A MISS IS NOT AN ABSENCE, and THE CALLER STATES THAT, not this read: the
   *  register answers for documents the record REGISTERED, and a prior acquire
   *  never promoted leaves parts in R2 and no register row. `registered: false` is
   *  that one fact and nothing more; `registered: null` is no question asked.
   *
   *  D-530 - AND THE PLANE'S OWN RECEIPT, `acquired`. `captured_locators` has one
   *  writer, `op=acquire`, and the hash in it is the one the plane computed as the
   *  bytes ARRIVED; nothing deletes a store's captures. So a receipt for a whole
   *  hash that has no object under it says the plane took the document and keeps
   *  it in parts, and no caller can write it. The register cannot say that: a
   *  register row is written by `op=promote` from what its CALLER names, and
   *  promote does not read R2 (D-45). `op=attest` (`attestation`'s since N512) attests on the receipt and not on
   *  the register alone; the ratify gate names a whole-hash row held in parts
   *  rather than calling its bytes absent. One bounded read on the
   *  `captured_locators_sha` index, and like `registered` it names no bundle.
   */
  /*  D-556 (BOB #34, 2026-09-25 00:00Z) - AND, when the caller names the BUNDLE whose row it is gating, the
   *  PARTS that bundle's record names for the hash (`partsNamed`, D-533's reader, not a second one). The
   *  ratify gate asks it on a whole-hash miss: a row held in parts is admitted when every part the record names
   *  is present and verifies, and publication copies exactly those parts. The bundle's own register document is
   *  read, so it names nothing the ratifier has not already been handed in the image. */
  registerHolds({ sha = null, bundle = null } = {}) {
    const s = bareSha(sha) || null;
    if (!s) return { ok: true, sha: null, asked: false, registered: null, acquired: null };
    const b = typeof bundle === "string" && bundle.trim() ? bundle.trim() : null;
    return { ok: true, sha: s, asked: true, ...(b ? { parts: this.partsNamed(b, s) } : {}), registered: !!this.#one(
      `SELECT r.capture_sha FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE r.capture_sha = ? LIMIT 1`, s),
      acquired: !!this.#one(`SELECT capture_sha FROM captured_locators WHERE capture_sha = ? LIMIT 1`, s) };
  }

  /** R8, R9 — the register audit: every row classified (`registerRows`), each unresolved one probed in the evidence
   *  store (`{head, get}` by digest; record-core's R38 when none is passed; null when the instance has none). */
  async registerAudit(evidence) {
    const store = evidence === undefined ? this.#record.evidenceStore?.() ?? null : evidence;
    return { ok: true, ...await registerAuditReport(this.registerRows(), store) };
  }

  /** R4 — the capture's home, or null when no row names it or its bundle no longer exists. Never the author. */
  homeOf(captureSha) {
    const s = bareSha(captureSha);
    if (!s) return null;
    const r = this.#one(`SELECT r.capture_sha, r.bundle_id, r.path, r.encoding, r.bytes, r.registered, r.authored
                           FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id WHERE r.capture_sha = ?`, s);
    return r ? { bundleId: r.bundle_id, path: r.path, encoding: r.encoding, bytes: r.bytes, registered: r.registered,
                 authored: Number(r.authored) === 1 } : null;
  }

  /** R11 — every register row whose home is `bundleId`, in `capture_sha` order. */
  registeredFor(bundleId) {
    return this.#rows(`SELECT capture_sha, path, bytes, encoding, registered, authored FROM register
                        WHERE bundle_id = ? ORDER BY capture_sha`, String(bundleId ?? ""))
      .map((r) => ({ capture_sha: r.capture_sha, path: r.path, bytes: r.bytes, encoding: r.encoding,
                     registered: r.registered, authored: Number(r.authored) === 1 }));
  }

  /** R12 · D-580 — the bundle's captures in the order the record first held them. `held_at` is the earlier of the
   *  row's `registered` and its earliest receipt's `first_retrieved`, both this instance's clock, compared as
   *  instants and never as strings (`…:00Z` is before `…:00.123Z`). A document's own stated date never orders them,
   *  and no other clock is put in the column. Ties break on the capture's digest, so the order is total. */
  capturesOf(bundleId) {
    const rows = this.#rows(
      `SELECT r.capture_sha, r.registered,
              (SELECT MIN(cl.first_retrieved) FROM captured_locators cl WHERE cl.capture_sha = r.capture_sha) AS first
         FROM register r WHERE r.bundle_id = ?`, String(bundleId ?? ""));
    const ms = (v) => (typeof v === "string" && v ? Date.parse(v) : NaN);
    return rows.map((r) => {
      const a = ms(r.registered), b = ms(r.first);
      const held = Number.isFinite(b) && (!Number.isFinite(a) || b < a) ? r.first : r.registered;
      return { capture_sha: r.capture_sha, held_at: held, t: ms(held) };
    }).sort((x, y) => ((Number.isFinite(x.t) ? x.t : Infinity) - (Number.isFinite(y.t) ? y.t : Infinity))
                      || (x.capture_sha < y.capture_sha ? -1 : x.capture_sha > y.capture_sha ? 1 : 0))
      .map(({ capture_sha, held_at }) => ({ capture_sha, held_at }));
  }

  /* ===================================================================== *
   * THE ACQUISITION RECEIPTS (R13–R16, R47).
   * ===================================================================== */

  /** R47 — a later module's work on each receipt, registered once at start (K31's pattern, promotion R39). A malformed
   *  or repeated registration is refused through membership's `listenerRefusal` (its R81; N202), the one site of
   *  `LISTENER_MALFORMED` and `LISTENER_DECLARED`. */
  onReceipt(module, fn) {
    const refused = listenerRefusal(this.#listeners, module, fn);
    if (refused) return refused;
    const i = this.#order.indexOf(module);
    this.#listeners.push({ module, fn, rank: i === -1 ? Infinity : i, seq: this.#listeners.length });
    this.#listeners.sort((a, b) => (a.rank - b.rank) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /** R13, R14, R47 — the plane's own acquisition receipt: one row per (address, capture, via).
   *
   *  WHICH OF THE THREE — `new`, `unchanged`, `changed` — this look was is READ FROM THE RECORD BEFORE THE UPSERT,
   *  never declared by the caller (REC-93; OBSERVATION-LOG-DESIGN.md §4.1). A caller that tells us the bytes were
   *  unchanged is a caller we would be taking a coverage claim from for free, and an equality that costs nothing to
   *  produce is not evidence. ONE AGGREGATE ROW, NOT A SCAN: the decision needs exactly two facts — has this address
   *  been retrieved through this source before, and were these the same bytes.
   *
   *  Widen the interval rather than replacing a date. Seeing the same bytes again later is not a duplicate, it is the
   *  observation that proves the target held still in between. The interval widens PER SOURCE (D-96): via is part of
   *  the key, so a direct observation and an archive observation of the same bytes are two rows.
   *
   *  THE LISTENERS (R47): after the write, every registered listener runs inside the same transaction, in the
   *  modules' order, with the receipt and the observation; one that refuses or throws does not undo the receipt, and
   *  the answer names each one's outcome. `context` is the caller's own, handed to the listeners unread (who asked,
   *  under which authority), so a listener can attribute its row without this module knowing what it writes. */
  /*  THE INTERVAL IS SPELLED WHOLE-SECOND UTC ON EVERY ROW (R48, N133; record-core R47's "second"), so a later module
   *  compares and brackets `first_retrieved` and `last_retrieved` as text in its own SQL, and MIN/MAX below widen the
   *  interval as instants: two spellings of one instant never sort apart. A `retrieved` in any readable ISO spelling
   *  is re-spelled to its whole second (the fraction dropped); none, or one that names no instant, takes this module's
   *  clock, the instant of the plane's own write. */
  recordReceipt({ address, addressNorm, captureSha, retrieved, via = "direct", retrievalLocator = null, context = null } = {}) {
    if (!addressNorm || !captureSha) return { recorded: false };
    const v = String(via || "direct");
    const asked = typeof retrieved === "string" && retrieved ? Date.parse(retrieved) : NaN;
    const clock = Date.parse(this.#now());
    const when = stampInstant("second", Number.isFinite(asked) ? asked : Number.isFinite(clock) ? clock : Date.now());
    return this.#record.transact(() => {
      const seen = this.#one(
        `SELECT COUNT(*) AS n, SUM(CASE WHEN capture_sha = ? THEN 1 ELSE 0 END) AS same
           FROM captured_locators WHERE address_norm = ? AND via = ?`,
        captureSha, addressNorm, v) || { n: 0, same: 0 };
      const observation = Number(seen.n) === 0 ? "new" : Number(seen.same) > 0 ? "unchanged" : "changed";
      this.#sql.exec(
        `INSERT INTO captured_locators (address_norm, address, capture_sha, via, retrieval_locator, first_retrieved, last_retrieved, observations)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(address_norm, capture_sha, via) DO UPDATE SET
           first_retrieved   = MIN(first_retrieved, excluded.first_retrieved),
           last_retrieved    = MAX(last_retrieved,  excluded.last_retrieved),
           retrieval_locator = COALESCE(excluded.retrieval_locator, retrieval_locator),
           observations      = observations + 1`,
        addressNorm, address || addressNorm, captureSha, v, retrievalLocator, when, when);
      const event = { address: address || addressNorm, address_norm: addressNorm, capture_sha: captureSha, via: v,
                      retrieval_locator: retrievalLocator, retrieved: when, observation, context };
      const listeners = this.#listeners.map(({ module, fn }) => {
        try {
          const out = fn(event);
          return out && out.ok === false ? { module, outcome: "refused", answer: out } : { module, outcome: "ran", answer: out ?? null };
        } catch (e) {
          return { module, outcome: "threw", error: String(e && e.message ? e.message : e).slice(0, 200) };
        }
      });
      return { recorded: true, address_norm: addressNorm, via: v, observation, listeners };
    });
  }

  /** R16 — every receipt for the address (all when none is given), ordered by `via`, and their summed observations.
   *  `observations` is not bookkeeping — a run of them across an interval is the PRIMARY route by which the record
   *  establishes that a link was contemporaneous (LINK-FIDELITY.md), REC-26. */
  receipts({ addressNorm = null } = {}) {
    const rows = addressNorm
      ? this.#rows(`SELECT * FROM captured_locators WHERE address_norm = ? ORDER BY via`, addressNorm)
      : this.#rows(`SELECT * FROM captured_locators ORDER BY address_norm, via`);
    return { address_norm: addressNorm, rows: rows.map((r) => ({ ...r })),
             observations: rows.reduce((n, r) => n + r.observations, 0) };
  }

  /* ===================================================================== *
   * R24–R27, R51: THE CAPTURE AXIS FOR ONE CAPTURE, FROM ITS ROUTE.
   * ===================================================================== */

  /** `captureGrade(captureSha) → {grade, route, determined, basis, why}`. The route is the record's own fact about
   *  WHO SERVED the bytes, written by the fetch that received them (the receipts' `via`), never by a member; the
   *  issuing authority (D-97) is a different axis and is never read here. No letter above the ceiling is earned. */
  captureGrade(captureSha) {
    const s = bareSha(captureSha);
    const reg = s ? this.#one(`SELECT authored FROM register WHERE capture_sha = ?`, s) : null;
    /* R27: a member's authored observation earns no capture letter: the axis measures the act of reading a
       document in, which did not happen. Its grade is testimony, which nothing raises. */
    if (reg && Number(reg.authored) === 1)
      return { grade: null, route: "authored", determined: false, basis: "CAPTURE_AXIS_AUTHORED",
               testimony: TESTIMONY_GRADE,
               why: "a member's own words were not read in from anywhere, so the capture axis earns no letter; the "
                  + `observation is graded as testimony, ${TESTIMONY_GRADE}, and nothing raises that` };
    const vias = s ? this.#rows(`SELECT DISTINCT via FROM captured_locators WHERE capture_sha = ? ORDER BY via`, s)
      .map((r) => r.via) : [];
    /* R24 · D-177: a capture this instance fetched `direct` earns the ceiling, measured. */
    if (vias.includes("direct"))
      return { grade: EARNED_CAPTURE_CEILING, route: "direct", determined: true, basis: "measured",
               why: `this instance fetched these bytes directly from their address, so their capture grade is `
                  + `${EARNED_CAPTURE_CEILING} by that fact rather than by a member's account` };
    /* R25 · D-693: read only through an archive replay: one rank below, measured. */
    if (vias.includes(ARCHIVE_VIA))
      return { grade: ARCHIVE_CAPTURE_GRADE, route: "archive", determined: ARCHIVE_CAPTURE_GRADE !== null,
               basis: "measured",
               why: `this instance fetched these bytes only through an archive replay (${ARCHIVE_VIA}), never from `
                  + `their publisher: one more party stands between the record and the publisher, so their capture `
                  + `grade is ${ARCHIVE_CAPTURE_GRADE}, ranked below a direct capture` };
    /* R51 · N364 (K509 (3)): received through the doorbell, not fetched. A fetched route above, when one was also
       recorded, is measured and answers first; with none, the bytes earn no fetched letter: a leg on them keeps its
       author's letter under the ceiling, stated as authored. What the receipt DOES prove is existence: the plane
       held these bytes at the pull's instant, by its own receipt at the knock's address (the chain of custody from
       the knock's receipt), so the earliest such receipt is named. */
    if (vias.includes(DOORBELL_VIA)) {
      const r = this.#one(`SELECT address, address_norm, first_retrieved FROM captured_locators
                            WHERE capture_sha = ? AND via = ? ORDER BY first_retrieved, address_norm LIMIT 1`,
                          s, DOORBELL_VIA);
      return { grade: null, route: "doorbell", determined: false, basis: RECEIVED_NOT_FETCHED,
               ceiling: EARNED_CAPTURE_CEILING,
               received: { address: r.address, address_norm: r.address_norm, at: r.first_retrieved },
               why: "these bytes were handed to the group through the doorbell and brought in by a member, never "
                  + "fetched from an address, so no capture grade is measured from how they were fetched. A leg on "
                  + `them keeps the letter its author gave, under the ceiling (${EARNED_CAPTURE_CEILING}), stated as `
                  + `authored. That the record held them at ${r.first_retrieved} is proven by this plane's own `
                  + `receipt at ${r.address}` };
    }
    /* R26 · D-709: no recorded route at all: stated, never guessed. A leg on it keeps its author's letter, under the
       ceiling, and that letter is the author's account, not a measurement. */
    if (!vias.length)
      return { grade: null, route: "unrecorded", determined: false, basis: "CAPTURE_ROUTE_UNRECORDED",
               ceiling: EARNED_CAPTURE_CEILING,
               why: "no fetch route is recorded for these bytes (bytes a provenance document carried, or a member's "
                  + "upload), so no capture grade is measured from how they were fetched. A leg on them keeps the "
                  + `letter its author gave, under the ceiling (${EARNED_CAPTURE_CEILING}), stated as authored` };
    /* R26: a route no ruling grades is NAMED, and the grade is undetermined. */
    return { grade: null, route: vias.join(","), determined: false, basis: "CAPTURE_GRADE_VIA_UNRULED",
             ceiling: EARNED_CAPTURE_CEILING,
             why: `these bytes were served by a route no ruling grades (${vias.join(", ")}), so what they earn on the `
                + "capture axis is UNDETERMINED" };
  }

  /* ===================================================================== *
   * R29, R30 · REC-225: A MEMBER'S DECLARED ORIGIN FOR A DOCUMENT. A host serves many offices, so a host is not an
   * origin: the system a document came from is a member's attributed statement, per document, dated and append-only.
   * ===================================================================== */

  declareOrigin({ bundleId = "", system = "", by = null, viewer = null } = {}) {
    const who = String(by ?? "").trim();
    /* DEC-49 REGION is-origin-act
       The door (C-103.2, C-103.3): a named member, and a document named. NO_SUCH_BUNDLE, below, is minted at many
       sites and carries no row (REC-64), so it stands outside both regions. */
    if (!who || isMachineIdentity(who))
      return actRefusal("ORIGIN_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. Which system a document came from is a `
              + "named member's attributed statement, never a machine's"
            : "declaring a document's origin is a named member's act, and this call carries nobody");
    if (!bundleId) return actRefusal("NO_BUNDLE", "pass bundleId=<id>");
    /* END DEC-49 REGION is-origin-act */
    const info = this.#record.bundleInfo(bundleId);
    if (!info || !this.#membership.inSight(bundleId, viewer))
      return { ok: false, reason: "NO_SUCH_BUNDLE", bundleId,
               detail: "no document of that name is in the record, or none this viewer may see; the two answer alike" };
    /* DEC-49 REGION is-origin-statement
       The statement (C-103.4, C-103.5): only a document came from a system, and the system is named briefly. */
    if (String(info.type).toLowerCase() !== "information")
      return actRefusal("ORIGIN_NOT_A_DOCUMENT",
        `this record is a ${String(info.type).slice(0, 40)}; only a document came from a system`, { bundleId });
    const sys = String(system ?? "").replace(/[\p{Cc}]+/gu, " ").replace(/\s+/g, " ").trim();
    if (!sys || sys.length > 200)
      return actRefusal("ORIGIN_NO_SYSTEM", "name the system the document came from, in at most 200 characters");
    /* END DEC-49 REGION is-origin-statement */
    const at = secondOf(this.#now());
    const seq = (this.#one(`SELECT COALESCE(MAX(seq), 0) AS m FROM origin_declarations WHERE bundle_id = ?`, bundleId).m || 0) + 1;
    this.#sql.exec(`INSERT INTO origin_declarations (bundle_id, seq, system, by, at) VALUES (?, ?, ?, ?, ?)`,
                   bundleId, seq, sys, who, at);
    return { ok: true, bundleId, system: sys, by: who, at, seq };
  }

  /** R30 — the standing declaration (the latest), or null. A reader of a document's origin asks this before any
   *  system derived from its host. */
  originOf(bundleId) {
    const r = this.#one(`SELECT system, by, at FROM origin_declarations WHERE bundle_id = ? ORDER BY seq DESC LIMIT 1`,
                        String(bundleId ?? ""));
    return r ? { system: r.system, by: r.by, at: r.at } : null;
  }

  /** PL-10 / D-220 — EVERY VERSION AT AN ADDRESS, IN DATE ORDER, WITH ITS
   *  BUNDLE, AND NOT ONE NEW BYTE OF SCHEMA TO ANSWER IT.
   *
   *  Bob ruled (2026-08-06) that versions of one document must be linked and
   *  indexed by the same url. **The index he described already existed.**
   *  `captured_locators` is keyed `(address_norm, capture_sha, via)` with
   *  `captured_locators_addr ON (address_norm, first_retrieved)`; `register`
   *  maps `capture_sha` to `bundle_id` on its primary key. So the link is not a
   *  thing to BUILD, it is a thing to ASK — one indexed seek and one join, and
   *  this method is the asking.
   *
   *  **THEREFORE NO EDGE BETWEEN VERSIONS IS ADDED, AND THAT IS THE ITEM.** An
   *  explicit `supersedes` relation would be a SECOND COPY of a fact the record
   *  already holds, and a second copy of a fact drifts from the first — D-164's
   *  solve-it-once, D-138's guard that guarded nothing. There is no new table,
   *  no new column, no new index and no new write: `recordReceipt` above
   *  is untouched and remains the only writer. (The legacy suite that pinned
   *  that absence structurally, `test/versionchain.test.mjs`, was deleted at
   *  T20, and no module test carries the pin: R41 and R15 state who writes the
   *  tables, `test/m/provenance/receipts.test.mjs` R15 that no read writes one.)
   *
   *  ONE VERSION IS ONE `capture_sha`, WHICH IS WHY THIS GROUPS. The primary key
   *  carries `via` (D-96): an archive sighting of the same bytes is a different
   *  FACT from a direct one, and the write path keeps both rows deliberately. It
   *  is not a different VERSION. Grouping on the sha is what stops a document
   *  seen twice through two routes from reading as two versions — the same
   *  false-coverage failure this op exists to remove, one axis over. The `via`
   *  values survive into the answer, so the distinction the key preserves is
   *  reported rather than flattened away.
   *
   *  ORDER IS `first_retrieved` — WHEN WE FIRST HELD THESE BYTES — and never
   *  `last_retrieved`, which moves every time the target holds still and would
   *  reorder a settled history as a side effect of re-checking it. `capture_sha`
   *  is the tiebreak, so the order is TOTAL and `offset` paging cannot repeat or
   *  skip a version. The record cannot say when the SOURCE published a version;
   *  it can say when we first saw it, and that difference is why the field is
   *  named in the answer rather than relabelled "published".
   *
   *  D-221's FIX LIVES HERE, and it is a consequence of the shape rather than a
   *  patch on top of it. The defect was that `heldMatch` found prior versions
   *  with `locator:"<url>"` — a FULL-TEXT query on a text-indexed field, which
   *  compiles to a text atom, which creates a rank arm, which orders by
   *  RELEVANCE; every capture at one address carries identical URL text, the
   *  bm25 scores tie, and the tiebreak decided. The predecessor named was
   *  therefore not the previous version at all. Here `at` is resolved by
   *  ADDRESS EQUALITY and the predecessor is the row immediately before it in
   *  date order. No text index is consulted, no relevance exists to be ordered
   *  by, and there is nothing to get wrong.
   *
   *  A CHAIN OF ONE IS A CHAIN. A single capture at an address answers with one
   *  version, `at_index` 0 and `predecessor: null` — that is the record saying
   *  "these are the first bytes we held", not a degenerate failure, and
   *  `test/m/provenance/convert-versionchain.test.mjs` pins it as its own arm.
   *
   *  GATED at `register.bundle_id` through `bundleGate`, the same predicate
   *  every other read in this file compiles, and `total` is counted through the
   *  SAME join and the SAME predicate as the rows — so a viewer cannot learn
   *  from a total that something was withheld. Nothing publishes how many rows
   *  the gate removed, because that count is the leak (REC-36). */
  versionChain({ addressNorm = null, at = null, limit = null, offset = 0, viewer = null } = {}) {
    const refuse = (key, detail) => {
      const row = VERSION_CHAIN_CHECKS[key];
      return { ok: false, reason: key, check: row.check, translation: row.translation, detail };
    };
    const addr = addressNorm == null ? "" : String(addressNorm).trim();
    if (!addr)
      return refuse("VERSION_CHAIN_NO_ADDRESS",
        "op=versionchain answers for ONE document address: pass address=<url>. The plane normalises it "
        + "with the same normaliser the capture wrote it with, so the address you captured is the "
        + "address that answers.");
    const anchor = at == null ? "" : String(at).trim().toLowerCase();
    if (anchor && !/^[0-9a-f]{64}$/.test(anchor))
      return refuse("VERSION_CHAIN_BAD_ANCHOR",
        `at=${JSON.stringify(String(at).slice(0, 80))} is not a sha256. A version is anchored by the `
        + "capture identity of its bytes, which is 64 hex characters.");

    const cap = Math.max(1, Math.min(VERSION_CHAIN_LIMIT_MAX,
      Math.floor(Number(limit) || VERSION_CHAIN_LIMIT_DEFAULT)));
    const from = Math.max(0, Math.floor(Number(offset) || 0));
    const seen = bundleGate("r.bundle_id", viewer);

    /* THE JOIN, WRITTEN ONCE. Every answer below — the page, the total, the
       anchor, the predecessor — reads this same CTE, so they cannot disagree
       about what a version is or about which ones this viewer may see. It is
       the legacy store's `#conditionBundlesForHost` join, generalised off a host prefix onto the
       address the index is actually keyed on. */
    const CHAIN = `WITH chain AS (
        SELECT cl.capture_sha                   AS capture_sha,
               MIN(cl.first_retrieved)          AS first_retrieved,
               MAX(cl.last_retrieved)           AS last_retrieved,
               SUM(cl.observations)             AS observations,
               COUNT(*)                         AS sightings,
               MIN(cl.address)                  AS address,
               group_concat(DISTINCT cl.via)    AS via,
               r.bundle_id                      AS bundle_id,
               r.path                           AS path,
               r.encoding                       AS encoding,
               r.bytes                          AS bytes,
               r.registered                     AS registered
          FROM captured_locators cl
          JOIN register r ON r.capture_sha = cl.capture_sha
         WHERE cl.address_norm = ?
           AND (${seen.sql})
         GROUP BY cl.capture_sha)`;
    const args = [addr, ...seen.args];

    const total = this.#one(`${CHAIN} SELECT COUNT(*) AS n FROM chain`, ...args)?.n ?? 0;
    const shape = (r) => r && ({
      capture_sha: r.capture_sha, bundle_id: r.bundle_id,
      first_retrieved: r.first_retrieved, last_retrieved: r.last_retrieved,
      observations: r.observations, sightings: r.sightings,
      via: String(r.via || "").split(",").filter(Boolean).sort(),
      address: r.address, path: r.path, encoding: r.encoding,
      bytes: r.bytes, registered: r.registered,
    });
    const versions = this.#rows(
      `${CHAIN} SELECT * FROM chain ORDER BY first_retrieved, capture_sha LIMIT ? OFFSET ?`,
      ...args, cap, from).map(shape);

    /* THE PREDECESSOR, when an anchor was given. Two seeks, both on the same
       CTE: the anchor's own position in the order, then the one row before it.
       `predecessor: null` at `at_index` 0 is the OLDEST version saying so — an
       honest absence with the reason readable beside it, not a lookup that
       failed. */
    let anchorRow = null, predecessor = null, atIndex = null;
    if (anchor) {
      anchorRow = shape(this.#one(`${CHAIN} SELECT * FROM chain WHERE capture_sha = ?`, ...args, anchor));
      if (!anchorRow)
        return refuse("VERSION_CHAIN_NO_SUCH_VERSION",
          `no version with capture ${anchor.slice(0, 12)}… is held at ${addr}. A capture the record does `
          + "not hold, one filed at a different address, and one inside a project you were not invited to "
          + "answer identically here, deliberately.");
      const before = `first_retrieved < ? OR (first_retrieved = ? AND capture_sha < ?)`;
      const beforeArgs = [anchorRow.first_retrieved, anchorRow.first_retrieved, anchorRow.capture_sha];
      atIndex = this.#one(`${CHAIN} SELECT COUNT(*) AS n FROM chain WHERE ${before}`,
        ...args, ...beforeArgs)?.n ?? 0;
      predecessor = shape(this.#one(
        `${CHAIN} SELECT * FROM chain WHERE ${before} ORDER BY first_retrieved DESC, capture_sha DESC LIMIT 1`,
        ...args, ...beforeArgs)) || null;
    }

    return {
      ok: true,
      address_norm: addr,
      /* The count of DOCUMENTS is one, always, and saying so is the point of the
         op: sixty rows here are sixty versions of ONE document, and a consumer
         that read `count` as a document count would rebuild the exact false
         coverage D-220 names. It is stated in the answer rather than left to be
         inferred from a field name. */
      documents: total > 0 ? 1 : 0,
      versions, count: versions.length, total,
      limit: cap, offset: from,
      /* REC-57's discipline: the bound PUBLISHED is the one APPLIED, after
         clamping, never the number asked for; and `truncated` settles
         completeness so "this is all of it" cannot read like "the first N". */
      truncated: from + versions.length < total,
      /* Present only when asked for, and null-valued rather than absent when the
         anchor IS the oldest, so a consumer can tell "there is no earlier
         version" from "nobody asked". */
      at: anchorRow, at_index: atIndex, predecessor,
    };
  }

  /** R55 — this module's figure for `op=stats` and purge's proof (record-core R63), as the retired legacy store's
   *  `#counts` took it: `register`, keyed on `bundle_id` (`routeMarks` is `provenance-routes`' since N512). `hid`
   *  (`{sql, args}`, the bundles the caller may not see, or null for a whole count) drops the rows naming a hidden
   *  bundle; a row whose column is null names none and is counted (`NULL NOT IN (…)` is NULL, so the column is read
   *  through COALESCE). Writes nothing. */
  counts(hid = null) {
    const hidden = isObj(hid) && typeof hid.sql === "string";
    return { register: this.#one(`SELECT count(*) AS c FROM register${hidden ? ` WHERE COALESCE(bundle_id, '') NOT IN ${hid.sql}` : ""}`,
                                 ...(hidden && Array.isArray(hid.args) ? hid.args : [])).c };
  }
  /** THE AUTHORED FLAG'S FENCE, run by `promote` before its first write.
   *
   *  THREE REFUSALS, and each is a way the register could let a member's word
   *  pass for a captured document or the other way round (§7):
   *   (1) a document claiming `authored` that this record did not author through
   *       the testimony path — including a register entry that would re-file an
   *       authored capture's bytes under a DIFFERENT bundle (C-53.8, THE LIAR);
   *   (2) an authored document whose origin or actor class is not `member`
   *       (C-53.7) — reachable only by a REVISION, since `testify` writes both;
   *   (3) an authored document that stops saying `authored: true`, or whose
   *       provenance document is gone from the revision (C-53.9).
   *  AND ONE MORE, ASKED OF EVERY CAPTURE (D-179, C-53.13): a register entry
   *  whose bytes another EXISTING bundle already holds — one capture, one home.
   *
   *  IMPORT AND REPLAY GO THROUGH THE TESTIMONY PATH (BOB #14, 2026-09-18, §7):
   *  there is no replay exemption here, so a migration carrying an authored
   *  bundle must re-author it through `testify`, never promote it verbatim.
   *
   *  "AUTHORED" IS READ FROM THE REGISTER, NEVER FROM THE DOCUMENT. The register
   *  row's flag is written only under `TESTIMONY_PATH`, so it is the one fact
   *  here a caller cannot have produced; the document's `authored` field is the
   *  CLAIM being judged against it. ONE read, whatever the package holds: the
   *  shas travel as one bound JSON array (D-36's ~100-variable ceiling). */
  #testimonyFence(bundleId, files, register, testimony, viewing = {}) {
    const refusal = rowRefusal(TESTIMONY_CHECKS);
    const prov = Array.isArray(files) ? files.find((f) => f && f.path === "data/provenance.json") : null;
    /* `safeJson`, the class's one remedy (the legacy `provenance-marker.test.mjs`'s swallowed-
       read ratchet, deleted at T20, admitted it by name), and the null is SURFACED rather than
       smoothed: an unreadable provenance document on an authored bundle is
       refused below as C-53.9 with a sentence that says it could not be read. */
    let docs = [], unreadable = false;
    if (prov) {
      const j = typeof prov.text === "string" ? safeJson(prov.text) : null;
      if (j === null) unreadable = true;
      else docs = Array.isArray(j.documents) ? j.documents : [];
    }
    const shaOf = (d) => d && typeof d === "object" && d.capture && typeof d.capture === "object"
      && typeof d.capture.sha256 === "string" && d.capture.sha256 ? d.capture.sha256 : null;
    const regs = Array.isArray(register) ? register.filter((c) => c && typeof c.sha256 === "string") : [];
    const asked = [...new Set([...docs.map(shaOf).filter(Boolean), ...regs.map((c) => c.sha256)])];
    /* BOUNDED, AND THE BOUND IS EXACT RATHER THAN A CAP THAT COULD HIDE A ROW.
       `capture_sha` is the key, so the IN half answers at most one row per sha
       the package names; the `bundle_id` half answers this bundle's AUTHORED rows,
       and a bundle holds at most one — `testify` writes exactly one register row
       for a bundle id it has just allocated, a re-registration under the same
       bundle keeps its sha, and a re-filing from another bundle is refused
       below. So `asked.length + 1` is the whole population, not a page of it. */
    const held = this.#rows(
      `SELECT capture_sha, bundle_id FROM register
        WHERE authored = 1 AND (bundle_id = ? OR capture_sha IN (SELECT value FROM json_each(?)))
        LIMIT ?`,
      bundleId, JSON.stringify(asked), asked.length + 1);
    const here = new Set(held.filter((r) => r.bundle_id === bundleId).map((r) => r.capture_sha));
    const elsewhere = new Set(held.filter((r) => r.bundle_id !== bundleId).map((r) => r.capture_sha));
    const own = (s) => !!(testimony && testimony.captureSha === s && !elsewhere.has(s));
    /* DEC-49 REGION is-testimony-fence */
    for (const c of regs)
      if (elsewhere.has(c.sha256))
        return refusal("TESTIMONY_AUTHORED_UNEARNED",
          `this promotion registers capture ${c.sha256.slice(0, 16)}… under ${bundleId}, and those bytes are `
          + `already registered as ANOTHER record's authored observation. Re-filing them here would move a `
          + `member's word under a document that is not theirs`, { bundleId, capture_sha: c.sha256 });
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      if (!d || typeof d !== "object") continue;
      const s = shaOf(d);
      const claims = d.authored !== undefined && d.authored !== null && d.authored !== false;
      const authored = s != null && (here.has(s) || own(s));
      if (claims && !authored)
        return refusal("TESTIMONY_AUTHORED_UNEARNED",
          `data/provenance.json documents[${i}] claims authored: ${JSON.stringify(d.authored).slice(0, 40)}, and `
          + `${s ? `capture ${s.slice(0, 16)}… was not authored through op=testify` : `names no capture at all`}. `
          + `Only the testimony act marks a document as a member's own observation`, { bundleId, index: i });
      if (!authored) continue;
      if (d.authored !== true)
        return refusal("TESTIMONY_AUTHORED_DROPPED",
          `data/provenance.json documents[${i}] is the member's authored observation ${s.slice(0, 16)}… and this `
          + `revision sets authored to ${JSON.stringify(d.authored ?? null).slice(0, 40)}`, { bundleId, index: i });
      const origin = d.origin && typeof d.origin === "object" ? d.origin.kind : undefined;
      const actor = d.capture.actor_class;
      if (origin !== "member" || actor !== "member")
        return refusal("TESTIMONY_ORIGIN_NOT_MEMBER",
          `data/provenance.json documents[${i}] is the member's authored observation ${s.slice(0, 16)}… and `
          + `claims origin '${String(origin).slice(0, 40)}', actor class '${String(actor).slice(0, 40)}' — both `
          + `must be 'member'`, { bundleId, index: i, origin: origin ?? null, actor_class: actor ?? null });
    }
    const stated = new Set(docs.filter((d) => d && typeof d === "object" && d.authored === true)
      .map(shaOf).filter(Boolean));
    for (const s of here)
      if (!stated.has(s))
        return refusal("TESTIMONY_AUTHORED_DROPPED",
          unreadable
            ? `${bundleId} holds the member's authored observation ${s.slice(0, 16)}…, and this revision's `
              + `data/provenance.json cannot be read, so it cannot be shown to still say so`
            : `${bundleId} holds the member's authored observation ${s.slice(0, 16)}…, and this revision's `
              + `data/provenance.json no longer carries it as authored`, { bundleId, capture_sha: s });
    /* END DEC-49 REGION is-testimony-fence */
    /* D-179 — ONE CAPTURE, ONE HOME, THE ORIGINAL's (BOB #26, 2026-09-22; Intake Doctrine §8). The
       register write below UPSERTs `bundle_id` on the `capture_sha` key, so without this a capture
       already registered under ANOTHER bundle would be moved to this one and the first bundle's row
       would read as never having held it. C-53.8 above refused that only for an authored capture;
       this asks it of every register entry, after C-53.8 so an authored capture keeps its own words.
       The holder must STILL EXIST (`bundles` joined): a purged home's register rows are deleted with
       it, and a row orphaned any other way is not a home. The SAME bundle is never asked, so a
       revision re-registering its own bytes is unchanged. ONE bounded read, the shas as one bound
       JSON array (D-36); `capture_sha` is the key, so `shas.length` rows is the whole population.
       THE HOLDER IS NAMED ONLY TO A CALLER WHO MAY SEE IT (D-15), asked of the VISIBILITY stamp the
       control plane sets beside `actorIdentity` (membership's `inSight`, fail-closed on a stamped identity with
       no viewer). An unstamped write is not a caller (the store's own writes, fixtures driven at the
       store) and is told the holder, on the legacy store's `#rosterInSight` precedent. */
    const shas = [...new Set(regs.map((c) => c.sha256))];
    const homes = shas.length ? this.#rows(
      `SELECT r.capture_sha, r.bundle_id FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE r.bundle_id <> ? AND r.capture_sha IN (SELECT value FROM json_each(?)) LIMIT ?`,
      bundleId, JSON.stringify(shas), shas.length) : [];
    /* DEC-49 REGION is-register-home */
    if (homes.length) {
      const h = homes[0];
      const caller = viewing.identity != null || viewing.viewer != null;
      const named = !caller || this.#membership.inSight(h.bundle_id, viewing.viewer ?? null);
      return refusal("CAPTURE_HELD_BY_ANOTHER_BUNDLE",
        `this promotion registers capture ${h.capture_sha.slice(0, 16)}… under ${bundleId}, and those bytes are `
        + `already registered under ${named ? h.bundle_id : "another record"}. One capture has one home, the `
        + `original's; registering it here would move that record's register row`,
        { bundleId, capture_sha: h.capture_sha, holder: named ? h.bundle_id : null });
    }
    /* END DEC-49 REGION is-register-home */
    return null;
  }

  /** op=testify — A MEMBER RECORDS A FIRSTHAND OBSERVATION. */
  testify({ words = null, observedAt = null, title = null, author = null, claimedAuthor = null } = {}) {
    const refusal = rowRefusal(TESTIMONY_CHECKS);
    const who = typeof author === "string" ? author.trim() : "";
    /* DEC-49 REGION is-testify-act
       WHO FIRST, `transcribe`'s order: a machine is refused for BEING a machine.
       The control plane stamps `author` from the credential and overwrites any
       query-string value a caller sent, so a machine arrives honestly named
       `class:<cls>`. A caller who put an author in the BODY is refused by name
       rather than silently overridden — overriding would make the request look
       accepted as sent, and it was not. */
    if (!who || isMachineIdentity(who))
      return refusal("TESTIMONY_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. A firsthand observation is a person's `
              + `word about what they saw, and it stands on that person's trust`
            : `this call carries nobody. The plane stamps the author from the credential that asked, `
              + `so an empty one means the act arrived by a route that does not attribute it`);
    if (claimedAuthor !== null && claimedAuthor !== undefined)
      return refusal("TESTIMONY_AUTHOR_SUPPLIED",
        `the request names an author (${JSON.stringify(claimedAuthor).slice(0, 60)}). The author of an `
        + `observation is the signed-in member, stamped by the plane, and is never taken from the request`);
    /* END DEC-49 REGION is-testify-act */
    const text = typeof words === "string" ? words : "";
    const bytes = new TextEncoder().encode(text);
    const recorded = secondOf(this.#now());
    const obs = typeof observedAt === "string" ? observedAt.trim() : "";
    const obsMs = observedMs(obs);
    /* DEC-49 REGION is-testify-words */
    if (!text.trim())
      return refusal("TESTIMONY_NO_WORDS",
        `the observation is empty. Nothing is prefilled: the words are what the member saw, in theirs`);
    if (bytes.length > TESTIMONY_MAX_BYTES)
      return refusal("TESTIMONY_WORDS_TOO_LONG",
        `${bytes.length} B written, over the ${TESTIMONY_MAX_BYTES} B one passage is stored to `
        + `(CAPTURE_TEXT_UNIT_CAP). Refused rather than cut: words silently truncated would be words the `
        + `member did not write, standing in their name`,
        { bytes: bytes.length, limit: TESTIMONY_MAX_BYTES });
    if (obsMs == null || obsMs > Date.parse(recorded))
      return refusal("TESTIMONY_OBSERVED_AT_INVALID",
        obsMs == null
          ? `observedAt ${obs ? `'${obs.slice(0, 40)}' is not a real calendar date (YYYY-MM-DD) or UTC instant `
              + `(YYYY-MM-DDTHH:MM[:SS]Z)` : `was not given`}. It is the member's own statement of when they `
              + `saw it, and the record does not supply one`
          : `observedAt '${obs}' is later than this record's own clock (${recorded})`,
        { observed_at: obs || null });
    /* END DEC-49 REGION is-testify-words */
    /* D-436 and K72 (7): THE PRODUCING GROUP the bytes name is the instance's recorded one, read by `promote` as its
       registered fact (promotion R13, K69) and written into the document there; with none recorded the creation
       states none and `promote` refuses it (GROUP_UNDETERMINED). That refusal rolls back the transaction below with
       the id it allocated, so no id is spent on a document that is not written. */
    const heading = (typeof title === "string" ? title : "")
      .replace(/[\p{Cc}]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, 200)
      || `Firsthand observation, observed ${obs}`;
    /* THE CANONICAL ID (`BUNDLE_ID_RE`) carries a slug after the allocated
       number. It is the fixed word `observation` rather than one derived from
       the title or the words, so an id — which travels further than a document
       does — says what KIND of thing it names and nothing of what it says. */
    const out = this.#record.transact(() => {
      const id = `${this.#record.allocId("INFO", recorded.slice(0, 4)).id}-observation`;
      /* THE AUTHORED BYTES: A CANONICAL HEADER, THEN THE WORDS. Ruled by BOB #14,
         2026-09-18: two members' identical observations are TWO testimonies
         (MEMBER-KNOWLEDGE-DESIGN.md §3), and the register — keyed by the bytes —
         must not collide them; the answer is NOT an I5 key change but bytes that
         are unique per testimony. `testimonyBytes` is the one definition. */
      const fileText = testimonyBytes({ id, observedAt: obs, words: text });
      const fileBytes = new TextEncoder().encode(fileText);
      const sha = createSha256().update(fileBytes).hex();
      /* THE REGISTER IS KEYED BY THE BYTES, and with the header those bytes are
         unique to this testimony — so a hit here is somebody having registered,
         IN ADVANCE, the exact bytes the next observation would have (the id is
         sequential and therefore predictable). Recording over them would re-file
         their register row under this bundle. The transaction answers the hit as
         a success so the id stays SPENT and the next attempt gets new bytes; the
         refusal itself is made below, outside it (is-testify-bytes). */
      if (this.#one(`SELECT 1 AS x FROM register WHERE capture_sha=?`, sha)) return { spent: { id, sha } };
      const file = `snapshots/observation-${sha.slice(0, 16)}.txt`;
      const locator = "a member's firsthand observation, authored in this record";
      /* MK-6 (§4.1): every file below names the author by this reference, never
         by `who`. `who` goes to the register row and the private rows beside it
         (the content row's minter, the log's actor), which no publication carries. */
      const observer = observerRef(id);
      const md = ["---",
        `id: ${id}`, "object_type: information", "schema: information@1",
        `title: ${JSON.stringify(heading)}`, "current_state: collected", "prior_state: null",
        `created: "${recorded}"`, `last_updated: "${recorded}"`,
        "produced_by:", "  mode: human", "  capability_tier: session",
        "references: []", "state_history: []",
        "annotations_open: 0",
        "reeval_pending:", "  flag: false", "  since: null", "  source: null",
        "visuals: []", "criticality: supporting", "source_status: unchanged",
        "source:", `  locator: ${JSON.stringify(locator)}`, "  authority: the observing member",
        `  retrieved: ${recorded}`,
        "monitoring:", "  enabled: false", "  frequency: none",
        "---", "", "## Summary", "",
        `A member's firsthand observation. Their words are \`${file}\`, below its canonical header, exactly as written; nothing here `
        + `paraphrases or summarises them.`, "",
        "## Provenance Notes", "",
        `Authored through op=testify. Observed ${obs}, in the member's own statement; recorded ${recorded}, `
        + `by this record's clock. The author is stamped by the plane from the signed-in session. It stands on `
        + `that member's trust, graded as testimony (MEMBER-KNOWLEDGE-DESIGN.md section 3).`, "",
        "## Session Log", "",
        `### Session ${recorded} | Authored | ${observer}`,
        "Trigger: testify",
        "Changes: created as a member's authored observation.", "",
        "## Review Notes", ""].join("\n");
      const doc = {
        file, locator, retrieved: recorded,
        /* THE THREE THE DESIGN NAMES, in the register entry. `authored` is honoured
           only because this method wrote it (the fence reads the register's flag,
           not this field); the author is the STAMP, recorded in the register and
           named here only by its opaque reference (MK-6, §4.1); the two dates are apart. */
        authored: true, author: observer, observed_at: obs, recorded_at: recorded,
        authority: "the observing member", authority_state: "determined",
        authority_basis: `the author of these bytes is the signed-in member the plane stamped from the session `
                       + `at op=testify, ${recorded}; the request could not name it`,
        provenance_chain: [{
          who: observer,
          asserts: `these are my own words, as written, about what I observed at ${obs}`,
          evidence: "authored through op=testify under a signed-in member session, hashed at receipt",
          bound: false,
        }],
        capture: {
          method: "authored by a member through op=testify; the bytes are a canonical header (bio-testimony/1: id, observed_at) and then the member's words as written, "
                + "hashed at receipt",
          /* NO `grade`, and the absence is the statement (§3, and C-18.1's authored
             arm): the capture axis measures reading a document in, and nothing was
             read in. */
          actor_class: "member", sha256: sha, encoding: "utf8", bytes: fileBytes.length,
          content_type: "text/plain; charset=utf-8",
        },
        origin: { kind: "member" },
        attestation_attempts: [],
      };
      const provText = JSON.stringify({ documents: [doc] }, null, 2);
      const enc = (t) => {
        const b = new TextEncoder().encode(t);
        return { text: t, bytes: b.length, sha256: createSha256().update(b).hex() };
      };
      /* The words' later work (the passage index, the content row over them and the extraction look) is not this
         module's: it is R52's testimony slot, which `extraction`, `content` and `observation-log` register on and the
         composition root runs inside this same transaction (control-plane's promotion step since T19, its R42, where
         the legacy store's step ran that work). The slot's `testimony: {content_id}` names the
         content row this answer reports; with none named, `content_id` is null. */
      const promoted = this.#promotion.promote({
          bundleId: id, base: null, snapKey: `${recorded.replace(/[-:]/g, "")}_${rand(4)}`,
          author: who,
          files: [{ path: "bundle.md", ...enc(md) }, { path: "data/provenance.json", ...enc(provText) },
                  { path: file, text: fileText, bytes: fileBytes.length, sha256: sha }],
          meta: { object_type: "information", title: heading,
                  current_state: "collected", prior_state: null, created: recorded, last_updated: recorded,
                  criticality: "supporting" },
          register: [{ sha256: sha, path: file, encoding: "utf8", bytes: fileBytes.length }],
          [TESTIMONY_PATH]: { captureSha: sha, author: who, observedAt: obs, recordedAt: recorded, words: text },
        });
      if (!promoted.ok) return promoted;
      return { ok: true, id, sha, file, fileBytes, promoted };
    });
    /* DEC-49 REGION is-testify-bytes
       The canonical bytes are already registered: refused, naming no bundle (D-15). The id they carried is spent. */
    if (out.spent)
      return refusal("TESTIMONY_WORDS_REGISTERED",
        `the canonical bytes of ${out.spent.id} (${out.spent.sha.slice(0, 16)}…) are already registered in this record`);
    /* END DEC-49 REGION is-testify-bytes */
    if (!out.ok) return out;
    const { id, sha, file, fileBytes, promoted } = out;
    return {
      ok: true, bundle_id: id, bundle_sha: promoted.bundleSha ?? null, capture_sha: sha, file,
      bytes: fileBytes.length, words_bytes: bytes.length, content_id: promoted.testimony ? promoted.testimony.content_id ?? null : null,
      authored: true, origin: "member", actor_class: "member",
      author: who, observed_at: obs, recorded_at: recorded,
      axes: {
        capture: { grade: null, determined: false, undetermined_because: "CAPTURE_AXIS_AUTHORED",
                   why: "the capture axis measures the act of reading a document in, and a member's own "
                      + "words were not read in from anywhere, so it earns no letter here" },
        connection: { grade: null, determined: false,
                      why: "no reader ran over these words and nothing resolved them to a subject" },
        /* MK-2 / IC-142: the letter is the registry's own constant, so this answer and a leg's refusal cannot
           name different letters. */
        testimony: { grade: TESTIMONY_GRADE, determined: true,
                     why: `an observation is graded as testimony, ${TESTIMONY_GRADE}, on the observing `
                        + "member's trust (MEMBER-KNOWLEDGE-DESIGN.md section 3). A leg citing it carries "
                        + `grade_axis: testimony, grade: ${TESTIMONY_GRADE}, grade_source: testimony, and `
                        + "nothing raises it — another member agreeing is a co-signature, not a second "
                        + "observation" },
      },
      says: `${who} recorded a firsthand observation, observed ${obs}. The words are held exactly as `
          + `written and are the document; they stand on ${who}'s trust. This record takes the author from `
          + `the signed-in account and never from the request.`,
    };
  }

}

const instances = new WeakMap();

/** The one provenance instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on the
 *  first call only. At creation it declares its tables to purge (record-core R21, R46), joins every promotion with
 *  its check and projection (promotion R39), registers the C-18 arms as an audit check (record-core R59) and its figure
 *  (R55; record-core R63). The route marks' audit finding and figure are `provenance-routes`' (its R6, R10; N512). */
export function provenanceOf(host, deps) {
  let p = instances.get(host);
  if (!p) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host);
    p = new Provenance({ ...d, storage: d.storage || host.storage, record, membership, promotion });
    instances.set(host, p);
    record.declarePurge("provenance", ["register", "origin_declarations", { name: "captured_locators", keys: [] }]);
    p.joinPromotion();
    /* N92, record-core R59 (K130): the C-18 register arms (R42–R46) join the audit over the same image the catalogue
       reads, so the audit judges each bundle once, whole, and loses none of them. */
    record.registerAuditCheck("provenance", ({ raw }) => registerChecks(imageForChecks(raw)));
    /* R55, record-core R63: this module's figure for `op=stats` and purge's proof. */
    record.registerCounts("provenance", ["register"], (hid) => p.counts(hid));
  }
  return p;
}
