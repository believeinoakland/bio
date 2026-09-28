/* contradiction (layer 6): Contradiction's IDENTIFY (`build/requirements/contradiction.md`;
   `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md`). The pairing read (R5–R12) and the one door a run's judgement
   enters the record by (R13–R16), reached through `contradictionOf(ctx)` (K61). Moved from `store.mjs` (REC-146's
   pairing, REC-147's candidate door, their dispatch), `bio-checks.mjs` (C-60, C-93, now `checks.mjs`) and
   `schema.mjs` (`contradiction_candidates`, now `schema.mjs` here). The judgement's words stay in
   `../contradiction.mjs` and are re-exported here. Whether a run is visible, running and the caller's is asked of a
   run gate `ai-runs` registers (R21, K31), `legacy-store` registering until then.

   WHAT THIS IS AND, MORE IMPORTANTLY, WHAT IT IS NOT. Section 2 splits the detector in two and the split is the whole
   audit story: PAIRING — which two assertions are worth comparing — is deterministic, in the plane, and auditable;
   JUDGEMENT — whether a pair conflicts, and how — is the machine's, inside a run, labelled machine work. This module
   pairs, and holds what a run PROPOSED about a formed pair. It judges nothing, grades nothing, edits or closes no
   side, and no read here shows a candidate to a member (R19: PRESENT and RESOLVE are not designed).

   THE ONE THING THIS SURFACE CAN GET WRONG THAT NOTHING ELSE CAN. `CLAUDE.md`: *sparse is normal at every level, and
   absence at one level is not evidence of absence at the next. Saying WHICH is true is a first-class obligation.* An
   empty pair list here is SIX different facts — nobody has asked a question; the questions hold no readings; the
   readings state no claim; the claims share no subject; the sources cannot be told apart for want of a date nobody
   recorded; or this caller was shown nothing at all. Printed bare, every one of them reads as THE RECORD IS
   CONSISTENT. So no key ever returns a bare zero: `absence` names the LEVEL and the ladder that found it is
   published beside it (R11).

   WHAT IT READS OF OTHER MODULES' TABLES, each in its own SQL so the per-key bound stays a bound on the statement
   (D-365): `bundles` (record-core R37), `content` (content R45), `readings.content_type` (extraction R58) and the
   reading's date through `extraction.readingOf` (R30), and `inquiry_basis`, `bundles.inquiry_subject_entity`,
   `inquiry_basis_versions`, `inquiry_basis_version_legs` and `resolutions` as their owners' read contracts
   (CONTRADICTION #1 QUESTION J1). */
import { recordOf } from "../record-core/index.mjs";
import { viewerPredicate, GATE_MARK } from "../membership/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { sha256HexSync, canonicalJson } from "../../checks/bio-checks.mjs";
import { CONTRADICTION_LABELS, JUDGEMENT_PROMPT, JUDGEMENT_PROMPT_SHA256, judgementSide,
         renderJudgementInput } from "../contradiction.mjs";
import { CONTRADICTION_SCHEMA } from "./schema.mjs";
import { CONTRADICTION_PAIR_CHECKS, CONTRADICTION_CANDIDATE_CHECKS } from "./checks.mjs";

export { CONTRADICTION_LABELS, JUDGEMENT_PROMPT, JUDGEMENT_PROMPT_SHA256, judgementSide, renderJudgementInput,
         CONTRADICTION_PAIR_CHECKS, CONTRADICTION_CANDIDATE_CHECKS, CONTRADICTION_SCHEMA };

/* R22 (K23): the one table this module owns, keyed to a bundle by either side's. */
export const CONTRADICTION_TABLES = Object.freeze(["contradiction_candidates"]);

/** R6: the per-key bound. Section 6: *it is bounded, and the bound is stated* — a capped answer that drops its bound
 *  reads as COMPLETENESS. */
export const CONTRADICTION_PAIRS_MAX = 50;

/** R15: a proposal's reason, at most. */
export const CANDIDATE_REASON_MAX = 2000;

/** The keys, section 4, as the VOCABULARY rather than as four spellings in four places (PL-17's rule: the vocabulary
 *  travels with the answer). Section 4: *keys are ADDED, not tuned* (R18) — a fifth key is a design change and a new
 *  row, never a widened join inside an existing key, because a key whose meaning drifts makes the per-key figures
 *  incomparable across runs. */
export const CONTRADICTION_KEYS = Object.freeze({
  K1: Object.freeze({ key: "K1", name: "one inquiry, opposite roles", feeds: "world",
        join: "a supports leg and a cuts_against leg of the SAME inquiry, each resting on a passage",
        why: "the inquiry already holds both sides; what is missing is anyone proposing the "
           + "discrepancy itself as the conclusion shape" }),
  K2: Object.freeze({ key: "K2", name: "one subject, two held claims", feeds: "record",
        join: "two inquiries with the same subject entity, each with an ACCEPTED reading carrying a claim",
        why: "two things the group HOLDS about one subject — the case that carries a duty" }),
  K3: Object.freeze({ key: "K3", name: "one referent, two held claims", feeds: "record",
        join: "two accepted readings, of different inquiries, whose legs rest on the SAME passage "
            + "(or, where no passage is named, the same captured document)",
        why: "we read the same text two ways" }),
  K4: Object.freeze({ key: "K4", name: "one entity, two sources of different kind or date", feeds: "world",
        join: "two cited passages whose documents RESOLVE (established) to the same entity, from "
            + "different doctypes, or with different dates, AS THEIR READERS STATE THEM",
        why: "a rule against the act it governs, or one body's statement at one date against its statement at another" }),
});

/* R11: each key's own last level, named when every rung of its ladder is present and the join still formed nothing. */
const LAST_LEVEL = Object.freeze({ K1: "shared_side", K2: "shared_subject", K3: "shared_referent", K4: "discriminator" });

/** R11: the sentence a member reads when a key found nothing. ONE place, so a surface renders what the plane holds
 *  and never composes this itself — the second place a distinction is made is the first place it can drift. */
export const CONTRADICTION_ABSENCE = Object.freeze({
  viewer: "this read was made with NO VIEWER the record recognises, so it compared nothing and "
        + "every key below is empty for want of a reader rather than for want of material. This is "
        + "an outage, not a statement about the record: ask again with a member's session",
  inquiry: "no question is in scope at all. Nothing has been asked here yet, so there is nothing "
         + "for any key to pair — the record is EMPTY at the question level and says nothing "
         + "whatever about whether the world contains contradictions",
  leg: "questions exist and NONE of them rests on anything. Nothing has been cited, so there are "
     + "no two sides to put beside each other",
  role: "questions rest on material, but not ONE of them holds both a leg that supports it and a "
      + "leg that cuts against it. That is a fact about how the questions are argued, not about "
      + "whether the record contains a discrepancy",
  referent: "both sides exist, but the legs name no PASSAGE — they rest on a whole document, on a "
          + "sub-question, or on bytes this record does not hold. A pair whose sides cannot be "
          + "quoted is not a pair a member could judge, so none was formed",
  subject: "questions exist and NONE of them names a registered subject. K2 pairs by subject, so "
         + "this is absence at the SUBJECT level: the claims may well disagree and nothing here "
         + "can see it",
  reading: "questions exist and none of them holds an ACCEPTED reading. A suggested, considering "
         + "or rejected reading is not something the group HOLDS, so there is no held assertion "
         + "to pair. Nothing is claimed about what the questions would say if they were read",
  claim: "accepted readings exist and none of them carries a CLAIM. What the group holds is "
       + "therefore unstated in the one field this key can read, which is absence in OUR record "
       + "rather than agreement in it",
  shared_entity: "cited passages and established resolutions exist, but no two documents resolve "
               + "to the SAME subject. There is nothing about one entity to compare",
  content: "no passage of any document has been cited or marked citable. Nothing has been "
         + "extracted at the content level, which says nothing about what the documents say",
  cited: "passages exist and none of them is cited by any reading. This key compares what the "
       + "record RESTS ON, and it rests on none of them",
  resolution: "cited passages exist and their documents carry no ESTABLISHED resolution to any "
            + "subject. Nobody has confirmed what these documents are about, so there is no "
            + "entity to pair them under — the next move is to resolve them, not to conclude "
            + "they are unrelated",
  shared_side: "questions hold both a supporting and a cutting leg, and each names a passage, but "
             + "no ONE question holds both at once. The two sides of this key are the two sides of a "
             + "SINGLE question, and none has them",
  shared_subject: "held claims and registered subjects both exist, and no two accepted claims share "
                + "a subject. Every subject is spoken to once, so there is nothing about one subject "
                + "for the record to disagree with itself about",
  shared_referent: "held claims rest on passages, and no two claims of DIFFERENT questions rest on "
                 + "the same one. Each passage is read by at most one held claim, so no text is read "
                 + "two ways here",
  discriminator: "documents sharing a subject were found and NOT ONE pair could be told apart by "
               + "kind or by date. Either the readers state the same kind and the same date on "
               + "both, or they state neither — and where a value is missing the pair was left "
               + "unformed rather than guessed. The counts beside this say which",
});

const RUN_GATE_DECLARED = "RUN_GATE_DECLARED";
const RUN_GATE_MALFORMED = "RUN_GATE_MALFORMED";

const instances = new WeakMap();

/** K61: the one Contradiction for this object's storage. `opts` is read on the first call only: `record`
 *  (`recordOf(ctx)`), `extraction` (`extractionOf(ctx)`, reached on first use), `now` (a clock). A test may pass its
 *  own. */
export function contradictionOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = instances.get(storage);
  if (!c) {
    c = new Contradiction(storage, { ...opts, record: opts.record ?? recordOf(ctx),
                                     extraction: opts.extraction ?? (() => extractionOf(ctx)) });
    instances.set(storage, c);
  }
  return c;
}

export class Contradiction {
  #sql; #record; #extraction; #now; #runGate = null; #declared = false;

  constructor(storage, { record, extraction = null, now = null } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#extraction = extraction;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #x() { return typeof this.#extraction === "function" ? (this.#extraction = this.#extraction()) : this.#extraction; }

  /* ---- boot (K4) ---- */

  /** This module's table at every boot, idempotent, and the purge declaration (R22) once. */
  migrate() {
    const bare = CONTRADICTION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    this.declarePurge();
  }

  /** R17, R22 (K23, record-core R21/R46): a candidate is keyed to the bundles both its sides live in, so a purge of
   *  either end takes the row (D-113), as connections do. Nothing else updates or deletes one. Once per instance. */
  declarePurge() {
    if (this.#declared) return { ok: true, already: true };
    const r = this.#record.declarePurge("contradiction",
      [{ name: "contradiction_candidates", keys: ["a_bundle_id", "b_bundle_id"] }]);
    if (r && r.ok !== false) this.#declared = true;
    return r;
  }

  /* ---- the run gate (R21, K31) ---- */

  /** R21 (K182): the slot `ai-runs` fills (its R37), `legacy-store` until then. `gate(run, viewer, caller)` answers
   *  `{found, running, refusal}`: `found` false for a blank, absent or invisible run alike (§7.9); `running` whether
   *  it is still running; `refusal` null, or ai-runs R5's `AI_RUN_NOT_PRINCIPAL` (C-22.12) for a caller who is not
   *  the run's principal, which R13 relays. One gate: a second registration is refused. */
  registerRunGate(module, gate) {
    if (typeof module !== "string" || !module.trim() || typeof gate !== "function")
      return { ok: false, reason: RUN_GATE_MALFORMED, detail: "a run gate is registered by a module name and a function" };
    if (this.#runGate)
      return { ok: false, reason: RUN_GATE_DECLARED, module: this.#runGate.module,
               detail: `the run gate is already registered by ${this.#runGate.module}` };
    this.#runGate = { module, gate };
    return { ok: true, module };
  }

  /* ---- sight (membership R43; R10) ---- */

  /** The viewer gate compiled into a statement over a QUALIFIED bundle column: a machine sees everything, an absent
   *  or unrecognised viewer nothing, a member through membership's predicate over record-core's `bundles` (its R37).
   *  A NULL column names no bundle and passes; one naming a bundle that is gone is withheld (fail closed).
   *
   *  THE COLUMN MUST BE QUALIFIED, and this refuses an unqualified one rather than trusting a caller to remember:
   *  inside the EXISTS subquery a bare `bundle_id` resolves against `bundles` — the INNER table — so the gate would
   *  pass every row while looking exactly like a gate. */
  #gate(col, viewer) {
    if (typeof col !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
      throw new Error(`REFUSED: the D-15 bundle gate needs a QUALIFIED column (got ${col}). `
        + "An unqualified name binds to `bundles` inside the gate's own subquery and passes everything.");
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (g.scope === "DENY") return { sql: g.sql, args: [] };
    return { sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = ${col} AND (${g.sql})))`,
             args: g.args };
  }

  /* ===================================================================== *
   * THE PAIRING READ (REC-146 / IC-167; R5–R12). Section 9 item 1.
   * ===================================================================== */

  /** R9: the doctype and the document DATE for one capture, AS THE READER STATES THEM — never as this module infers
   *  them. BOTH ARE THREE-VALUED AND THE THIRD VALUE IS THE POINT (section 4): *a document date or a doctype that its
   *  reader does not state is UNDETERMINED, and a pair that needs one is not formed on a guess.* So `null` here is
   *  returned and counted, and `read` keeps apart a capture nobody has read from a reading that states no value.
   *
   *  The doctype is the reading's `content_type` (extraction R58); the date is the reading's own top-level `date`
   *  (extraction R30's `readingOf`), where every doctype that has one puts it. A doctype that states none simply has
   *  none, which is a fact about the READER — exactly why it may not be filled in from the content row's or the
   *  capture's time. Those are facts about US. */
  #doc(captureSha, memo) {
    if (memo.has(captureSha)) return memo.get(captureSha);
    const row = this.#one(`SELECT content_type FROM readings WHERE capture_sha=? LIMIT 1`, captureSha);
    const held = row ? this.#x().readingOf(captureSha) : null;
    const reading = held && held.reading && typeof held.reading === "object" ? held.reading : null;
    const s = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
    const out = { read: !!row, doctype: row ? s(row.content_type) : null, date: reading ? s(reading.date) : null };
    memo.set(captureSha, out);
    return out;
  }

  /** R8: one leg's side of a pair, with the passage it rests on RESOLVED — the ref a member reads and the capture it
   *  is a part of (content R45). The leg alone names a content id, which is a hash and tells a reader nothing about
   *  what was cited. Section 5 requires both sides to travel with their referents; null when the row is not held. */
  #extent(kind, side) {
    const row = side.content_id
      ? this.#one(`SELECT capture_sha, ref, extent_kind, stale FROM content WHERE content_id=? LIMIT 1`, side.content_id)
      : null;
    return { kind, ...side,
             capture_sha: row ? row.capture_sha : null,
             ref: row ? row.ref : null,
             extent_kind: row ? row.extent_kind : null,
             stale: row ? !!row.stale : null };
  }

  /** R8 K1 — one inquiry, opposite roles. A `supports` leg and a `cuts_against` leg of the SAME inquiry, each with a
   *  content referent. BOUNDED AT THE SQL AND NOT IN JAVASCRIPT (D-365): a published `truncated` over a scan that
   *  read everything is an envelope staying honest about a read that was not bounded at all. The statement
   *  OVER-FETCHES BY ONE so truncation is OBSERVED rather than inferred from equality with the bound (R7). */
  #k1(viewer, cap) {
    const g = this.#gate("s.bundle_id", viewer);
    const rows = this.#rows(
      `SELECT s.bundle_id AS inquiry, s.ord AS a_ord, s.target_id AS a_target,
              s.content_id AS a_content, s.note AS a_note,
              c.ord AS b_ord, c.target_id AS b_target, c.content_id AS b_content, c.note AS b_note
         FROM inquiry_basis s
         JOIN inquiry_basis c ON c.bundle_id = s.bundle_id
        WHERE s.role = 'supports' AND c.role = 'cuts_against'
          AND s.content_id IS NOT NULL AND c.content_id IS NOT NULL
          AND (${g.sql})
        ORDER BY s.bundle_id, s.ord, c.ord
        LIMIT ?`, ...g.args, cap + 1);
    const truncated = rows.length > cap;
    const pairs = (truncated ? rows.slice(0, cap) : rows).map((r) => ({
      key: "K1", inquiry: r.inquiry,
      a: this.#extent("leg", { inquiry: r.inquiry, ord: r.a_ord, role: "supports",
                               target: r.a_target, content_id: r.a_content, note: r.a_note }),
      b: this.#extent("leg", { inquiry: r.inquiry, ord: r.b_ord, role: "cuts_against",
                               target: r.b_target, content_id: r.b_content, note: r.b_note }),
      why: "one question already rests on both of these, one supporting it and one cutting against it. "
         + "What they SAY about each other is not read here",
    }));
    return { pairs, truncated, notes: [] };
  }

  /** R8 K2 — one subject, two held claims. Two inquiries with the same `bundles.inquiry_subject_entity`, each with an
   *  ACCEPTED, unhidden reading carrying a `claim`. `hidden = 0` AND `state = 'accepted'` ARE BOTH REQUIRED AND THEY
   *  ARE DIFFERENT RULES: a suggested, considering or rejected version is not held (section 3), and a HIDDEN accepted
   *  version is one the group PRUNED. `bundle_id >` RATHER THAN `<>` IS WHAT MAKES A PAIR ONE PAIR: without it every
   *  pair appears twice, once from each side (R8). */
  #k2(viewer, cap) {
    const ga = this.#gate("v1.bundle_id", viewer);
    const gb = this.#gate("v2.bundle_id", viewer);
    const rows = this.#rows(
      `SELECT v1.bundle_id AS a_inquiry, v1.name AS a_version, v1.claim AS a_claim,
              v2.bundle_id AS b_inquiry, v2.name AS b_version, v2.claim AS b_claim,
              d1.inquiry_subject_entity AS entity_id, d1.title AS a_title, d2.title AS b_title
         FROM inquiry_basis_versions v1
         JOIN bundles d1 ON d1.bundle_id = v1.bundle_id
         JOIN bundles d2 ON d2.inquiry_subject_entity = d1.inquiry_subject_entity
                        AND d2.bundle_id > d1.bundle_id
         JOIN inquiry_basis_versions v2 ON v2.bundle_id = d2.bundle_id
        WHERE v1.state = 'accepted' AND v2.state = 'accepted'
          AND v1.hidden = 0 AND v2.hidden = 0
          AND v1.claim IS NOT NULL AND v1.claim <> ''
          AND v2.claim IS NOT NULL AND v2.claim <> ''
          AND d1.inquiry_subject_entity IS NOT NULL AND d1.inquiry_subject_entity <> ''
          AND (${ga.sql}) AND (${gb.sql})
        ORDER BY d1.inquiry_subject_entity, v1.bundle_id, v1.name, v2.bundle_id, v2.name
        LIMIT ?`, ...ga.args, ...gb.args, cap + 1);
    const truncated = rows.length > cap;
    const pairs = (truncated ? rows.slice(0, cap) : rows).map((r) => ({
      key: "K2", subject_entity: r.entity_id,
      a: { kind: "claim", inquiry: r.a_inquiry, title: r.a_title ?? null, version: r.a_version, claim: r.a_claim },
      b: { kind: "claim", inquiry: r.b_inquiry, title: r.b_title ?? null, version: r.b_version, claim: r.b_claim },
      why: "two questions about the same registered subject, each with a reading the group ACCEPTED "
         + "and a claim it therefore holds. Whether they can both be so is not read here",
    }));
    return { pairs, truncated, notes: [] };
  }

  /** K3 arm (a) — two accepted readings, of DIFFERENT inquiries, whose version legs rest on the SAME content row. */
  #k3Same(viewer, cap) {
    const ga = this.#gate("v1.bundle_id", viewer);
    const gb = this.#gate("v2.bundle_id", viewer);
    const rows = this.#rows(
      `SELECT v1.bundle_id AS a_inquiry, v1.name AS a_version, v1.claim AS a_claim, l1.ord AS a_ord,
              v2.bundle_id AS b_inquiry, v2.name AS b_version, v2.claim AS b_claim, l2.ord AS b_ord,
              l1.content_id AS content_id
         FROM inquiry_basis_version_legs l1
         JOIN inquiry_basis_versions v1 ON v1.bundle_id = l1.bundle_id AND v1.name = l1.name
         JOIN inquiry_basis_version_legs l2 ON l2.content_id = l1.content_id
                                           AND l2.bundle_id > l1.bundle_id
         JOIN inquiry_basis_versions v2 ON v2.bundle_id = l2.bundle_id AND v2.name = l2.name
        WHERE l1.content_id IS NOT NULL
          AND v1.state = 'accepted' AND v2.state = 'accepted'
          AND v1.hidden = 0 AND v2.hidden = 0
          AND v1.claim IS NOT NULL AND v1.claim <> ''
          AND v2.claim IS NOT NULL AND v2.claim <> ''
          AND (${ga.sql}) AND (${gb.sql})
        ORDER BY l1.content_id, v1.bundle_id, v1.name, v2.bundle_id, v2.name
        LIMIT ?`, ...ga.args, ...gb.args, cap + 1);
    const truncated = rows.length > cap;
    return { rows: truncated ? rows.slice(0, cap) : rows, truncated };
  }

  /** K3 arm (b) — THE SAME QUESTION WHERE NO PASSAGE IS NAMED, as a SECOND STATEMENT rather than a `UNION`: D-36's
   *  workerd ceiling of five compound terms, and a union would publish ONE figure over two joins that mean different
   *  things. A NULL `content_id` is one of three facts — the leg rests on an INQUIRY, the record holds no bytes of the
   *  document, or the row is a replay — and only the last two name a DOCUMENT, so this arm requires `target_type =
   *  'information'` on both sides: two claims resting on the same sub-QUESTION are not two readings of one text. */
  #k3Doc(viewer, cap) {
    const ga = this.#gate("v1.bundle_id", viewer);
    const gb = this.#gate("v2.bundle_id", viewer);
    const rows = this.#rows(
      `SELECT v1.bundle_id AS a_inquiry, v1.name AS a_version, v1.claim AS a_claim, l1.ord AS a_ord,
              v2.bundle_id AS b_inquiry, v2.name AS b_version, v2.claim AS b_claim, l2.ord AS b_ord,
              l1.target_id AS target_id
         FROM inquiry_basis_version_legs l1
         JOIN inquiry_basis_versions v1 ON v1.bundle_id = l1.bundle_id AND v1.name = l1.name
         JOIN inquiry_basis_version_legs l2 ON l2.target_id = l1.target_id
                                           AND l2.bundle_id > l1.bundle_id
                                           AND l2.content_id IS NULL
         JOIN inquiry_basis_versions v2 ON v2.bundle_id = l2.bundle_id AND v2.name = l2.name
        WHERE l1.content_id IS NULL AND l1.target_type = 'information'
          AND l2.target_type = 'information'
          AND v1.state = 'accepted' AND v2.state = 'accepted'
          AND v1.hidden = 0 AND v2.hidden = 0
          AND v1.claim IS NOT NULL AND v1.claim <> ''
          AND v2.claim IS NOT NULL AND v2.claim <> ''
          AND (${ga.sql}) AND (${gb.sql})
        ORDER BY l1.target_id, v1.bundle_id, v1.name, v2.bundle_id, v2.name
        LIMIT ?`, ...ga.args, ...gb.args, cap + 1);
    const truncated = rows.length > cap;
    return { rows: truncated ? rows.slice(0, cap) : rows, truncated };
  }

  /** R7, R8 K3 — both arms, each bounded on its own and each SAID in `arms`. */
  #k3(viewer, cap) {
    const same = this.#k3Same(viewer, cap);
    const doc = this.#k3Doc(viewer, cap);
    const mk = (r, referent) => ({
      key: "K3", ...referent,
      a: { kind: "claim", inquiry: r.a_inquiry, version: r.a_version, claim: r.a_claim, ord: r.a_ord },
      b: { kind: "claim", inquiry: r.b_inquiry, version: r.b_version, claim: r.b_claim, ord: r.b_ord },
      why: referent.content_id
        ? "two questions whose accepted readings rest on the SAME passage, each holding a claim. "
        + "What that passage supports is the thing they may disagree about"
        : "two questions whose accepted readings rest on the same DOCUMENT with no passage named on "
        + "either side, each holding a claim. The passage grain is absent on both, not chosen",
    });
    const pairs = [
      ...same.rows.map((r) => mk(r, { content_id: r.content_id, referent_grain: "passage" })),
      ...doc.rows.map((r) => mk(r, { content_id: null, document: r.target_id, referent_grain: "document" })),
    ];
    return { pairs, truncated: same.truncated || doc.truncated,
             arms: { passage: { formed: same.rows.length, truncated: same.truncated },
                     document: { formed: doc.rows.length, truncated: doc.truncated } },
             notes: [] };
  }

  /** A content row cited by a leg or a version leg of an inquiry this viewer may see (the gate on the CITING
   *  inquiry: a passage cited only by a question the viewer cannot see is not cited as this viewer can see it, so
   *  neither the pair nor the ladder discloses that the hidden question cites it). */
  #citedBy(col, viewer) {
    const gi = this.#gate("ib.bundle_id", viewer);
    const gl = this.#gate("vl.bundle_id", viewer);
    return { sql: `(EXISTS (SELECT 1 FROM inquiry_basis ib WHERE ib.content_id = ${col} AND (${gi.sql}))
                    OR EXISTS (SELECT 1 FROM inquiry_basis_version_legs vl WHERE vl.content_id = ${col} AND (${gl.sql})))`,
             args: [...gi.args, ...gl.args] };
  }

  /** R8, R9 K4 — one entity, two sources of different kind or DATE.
   *
   *  THE SQL FINDS CANDIDATES AND THE JAVASCRIPT DECIDES, and the division is the item's honesty requirement: the
   *  join can say *these two documents resolve, established, to one entity, and somebody has cited a passage of
   *  each*; it CANNOT say whether their kinds or dates differ, because a reader's date lives inside the reading. So
   *  the discriminator is applied here, where the third answer — UNDETERMINED — can be COUNTED and the pair left
   *  unformed.
   *
   *  `established = 1` ON BOTH ENDS IS SECTION 4's WORD AND IT IS LOAD-BEARING: a C-tier correspondence is expressly
   *  flagged for a member to confirm, and pairing on it would manufacture a world-contradiction candidate out of two
   *  documents nobody has agreed are about one thing. `DISTINCT` IS NOT COSMETIC: `resolutions` holds one row per
   *  (capture, reference, entity), so one document naming a subject five times would count one pair five times. */
  #k4(viewer, cap) {
    const ga = this.#gate("c1.bundle_id", viewer);
    const gb = this.#gate("c2.bundle_id", viewer);
    const ca = this.#citedBy("c1.content_id", viewer);
    const cb = this.#citedBy("c2.content_id", viewer);
    const rows = this.#rows(
      `SELECT DISTINCT c1.content_id AS a_content, c1.capture_sha AS a_capture, c1.ref AS a_ref,
              c1.extent_kind AS a_kind,
              c2.content_id AS b_content, c2.capture_sha AS b_capture, c2.ref AS b_ref,
              c2.extent_kind AS b_kind, r1.entity_id AS entity_id
         FROM content c1
         JOIN resolutions r1 ON r1.capture_sha = c1.capture_sha AND r1.established = 1
         JOIN resolutions r2 ON r2.entity_id = r1.entity_id AND r2.established = 1
                            AND r2.capture_sha > r1.capture_sha
         JOIN content c2 ON c2.capture_sha = r2.capture_sha
        WHERE ${ca.sql} AND ${cb.sql}
          AND (${ga.sql}) AND (${gb.sql})
        ORDER BY r1.entity_id, c1.content_id, c2.content_id
        LIMIT ?`, ...ca.args, ...cb.args, ...ga.args, ...gb.args, cap + 1);
    const truncated = rows.length > cap;
    const memo = new Map();
    const pairs = []; let undetermined = 0, indistinct = 0;
    const missing = { never_read: 0, no_doctype: 0, no_date: 0 };
    for (const r of truncated ? rows.slice(0, cap) : rows) {
      const da = this.#doc(r.a_capture, memo);
      const db = this.#doc(r.b_capture, memo);
      const kindsKnown = !!da.doctype && !!db.doctype;
      const datesKnown = !!da.date && !!db.date;
      const discriminator = kindsKnown && da.doctype !== db.doctype ? "doctype"
                          : datesKnown && da.date !== db.date ? "date" : null;
      if (discriminator) {
        pairs.push({
          key: "K4", entity_id: r.entity_id, discriminator,
          a: { kind: "extent", content_id: r.a_content, capture_sha: r.a_capture, ref: r.a_ref,
               extent_kind: r.a_kind, doctype: da.doctype, date: da.date, read: da.read },
          b: { kind: "extent", content_id: r.b_content, capture_sha: r.b_capture, ref: r.b_ref,
               extent_kind: r.b_kind, doctype: db.doctype, date: db.date, read: db.read },
          why: discriminator === "doctype"
            ? "two documents the record has established are about the same subject, of different kinds "
            + "as their readers state them — the shape of a rule against the act it governs"
            : "two documents the record has established are about the same subject, dated differently "
            + "as their readers state them — the shape of one body saying X then Y",
        });
        continue;
      }
      if (kindsKnown && datesKnown) { indistinct += 1; continue; }
      /* UNDETERMINED, AND IT IS COUNTED RATHER THAN ROUNDED TO EITHER NEIGHBOUR (R9). Section 4: *a pair that needs a
         date or a doctype its reader does not state is not formed on a guess*, and the count is what stops that
         refusal reading as "these two agree". */
      undetermined += 1;
      if (!da.read || !db.read) missing.never_read += 1;
      else if (!kindsKnown) missing.no_doctype += 1;
      else missing.no_date += 1;
    }
    return { pairs, truncated, undetermined, indistinct, missing,
             notes: undetermined
               ? [`${undetermined} candidate pair(s) were NOT formed because a doctype or a document `
                + `date their readers never stated was needed to tell them apart `
                + `(${missing.never_read} where a document has not been read at all, `
                + `${missing.no_doctype} where a reader stated no kind, ${missing.no_date} where a `
                + `reader stated no date). That is not evidence the two agree`]
               : [] };
  }

  /** R11: WHICH LEVEL WAS EMPTY, SAID RATHER THAN LEFT TO BE INFERRED. A LADDER OF EXISTENCE PROBES, and existence is
   *  deliberately not a count: a census would cost an unbounded scan per rung on the one surface whose subject is
   *  that the record is sparse. Each probe is `LIMIT 1` and rides the same viewer gate as the key's own join, so a
   *  rung never reports material this caller may not see.
   *
   *  THE FIRST RUNG THAT IS EMPTY IS THE ANSWER, because absence at one level is not evidence of absence at the next.
   *  `viewer` IS A RUNG AND IT IS THE FIRST ONE: a read made with no viewer stamp, or one the gate does not recognise,
   *  is empty for a reason that is not about the record at all (R10), and nothing below it can be believed when it
   *  fires. */
  #ladder(key, viewer, scope) {
    const rung = (level, sql, ...args) => ({ level, present: !!this.#one(sql, ...args) });
    if (scope === "DENY") return [{ level: "viewer", present: false }];
    const gi = this.#gate("ib.bundle_id", viewer);
    const gv = this.#gate("v.bundle_id", viewer);
    const gs = this.#gate("s.bundle_id", viewer);
    const vp = viewerPredicate(viewer);
    const anyInquiry = () => rung("inquiry",
      `SELECT 1 AS x FROM bundles b WHERE b.object_type='inquiry' AND (${vp.sql}) LIMIT 1`, ...vp.args);
    const heldReading = (extra) => this.#one(
      `SELECT 1 AS x FROM inquiry_basis_versions v
        WHERE v.state='accepted' AND v.hidden=0 ${extra} AND (${gv.sql}) LIMIT 1`, ...gv.args);
    if (key === "K1") return [
      { level: "viewer", present: true }, anyInquiry(),
      rung("leg", `SELECT 1 AS x FROM inquiry_basis ib WHERE (${gi.sql}) LIMIT 1`, ...gi.args),
      rung("role", `SELECT 1 AS x FROM inquiry_basis s JOIN inquiry_basis c ON c.bundle_id=s.bundle_id
                     WHERE s.role='supports' AND c.role='cuts_against' AND (${gs.sql}) LIMIT 1`, ...gs.args),
      rung("referent", `SELECT 1 AS x FROM inquiry_basis s JOIN inquiry_basis c ON c.bundle_id=s.bundle_id
                         WHERE s.role='supports' AND c.role='cuts_against'
                           AND s.content_id IS NOT NULL AND c.content_id IS NOT NULL
                           AND (${gs.sql}) LIMIT 1`, ...gs.args),
    ];
    if (key === "K2") return [
      { level: "viewer", present: true }, anyInquiry(),
      rung("subject", `SELECT 1 AS x FROM bundles b WHERE b.inquiry_subject_entity IS NOT NULL
                        AND b.inquiry_subject_entity <> '' AND (${vp.sql}) LIMIT 1`, ...vp.args),
      { level: "reading", present: !!heldReading("") },
      { level: "claim", present: !!heldReading("AND v.claim IS NOT NULL AND v.claim <> ''") },
    ];
    if (key === "K3") return [
      { level: "viewer", present: true }, anyInquiry(),
      { level: "reading", present: !!heldReading("") },
      { level: "claim", present: !!heldReading("AND v.claim IS NOT NULL AND v.claim <> ''") },
      rung("referent", `SELECT 1 AS x FROM inquiry_basis_version_legs l
                         JOIN inquiry_basis_versions v ON v.bundle_id=l.bundle_id AND v.name=l.name
                        WHERE v.state='accepted' AND v.hidden=0
                          AND v.claim IS NOT NULL AND v.claim <> ''
                          AND (l.content_id IS NOT NULL OR l.target_type='information')
                          AND (${gv.sql}) LIMIT 1`, ...gv.args),
    ];
    const gc = this.#gate("c.bundle_id", viewer);
    const cited = this.#citedBy("c.content_id", viewer);
    const g1 = this.#gate("c1.bundle_id", viewer);
    const g2 = this.#gate("c2.bundle_id", viewer);
    return [
      { level: "viewer", present: true },
      rung("content", `SELECT 1 AS x FROM content c WHERE (${gc.sql}) LIMIT 1`, ...gc.args),
      rung("cited", `SELECT 1 AS x FROM content c WHERE ${cited.sql} AND (${gc.sql}) LIMIT 1`, ...cited.args, ...gc.args),
      rung("resolution", `SELECT 1 AS x FROM content c
                           JOIN resolutions r ON r.capture_sha=c.capture_sha AND r.established=1
                          WHERE (${gc.sql}) LIMIT 1`, ...gc.args),
      /* The same sight as every rung above: two established resolutions of different documents to one entity, each
         document holding a passage this viewer may see (the key's own join is gated on its content rows). */
      rung("shared_entity", `SELECT 1 AS x FROM resolutions r1
                              JOIN resolutions r2 ON r2.entity_id=r1.entity_id AND r2.established=1
                                                 AND r2.capture_sha > r1.capture_sha
                             WHERE r1.established=1
                               AND EXISTS (SELECT 1 FROM content c1 WHERE c1.capture_sha=r1.capture_sha AND (${g1.sql}))
                               AND EXISTS (SELECT 1 FROM content c2 WHERE c2.capture_sha=r2.capture_sha AND (${g2.sql}))
                             LIMIT 1`, ...g1.args, ...g2.args),
    ];
  }

  /** op=contradictionpairs — THE PAIRING READ (R5–R12). A READ: it judges nothing and writes nothing, and both are
   *  said in the answer: `judgement.state` is `NOT_REACHED` and `wrote` is false.
   *
   *  WHY `judgement` IS PUBLISHED AS A FIELD AT ALL: a list of pairs with no verdict beside it reads as a list of
   *  CONTRADICTIONS. NO LABEL VOCABULARY IS PUBLISHED HERE (R12): the five labels are the JUDGEMENT's output, and
   *  publishing them from a surface that assigns none would read as a detector that had declined to label.
   *
   *  EACH KEY IS RUN EXACTLY ONCE (R7) and its result feeds both the per-key envelope and the flat pair list: two runs
   *  of one key over a store written between them would publish a `formed` figure that does not match the pairs. */
  pairs({ key = null, limit = null, viewer = null } = {}) {
    const names = Object.keys(CONTRADICTION_KEYS);
    const asked = key == null || String(key).trim() === "" ? null : String(key).trim().toUpperCase();
    /* DEC-49 REGION is-contradiction-key-unknown */
    if (asked !== null && !Object.prototype.hasOwnProperty.call(CONTRADICTION_KEYS, asked)) {
      const row = CONTRADICTION_PAIR_CHECKS.CONTRADICTION_KEY_UNKNOWN;
      return { ok: false, reason: "CONTRADICTION_KEY_UNKNOWN", code: "CONTRADICTION_KEY_UNKNOWN",
               check: row.check, translation: row.translation, keys: names,
               detail: `the record pairs by ${names.join(", ")} and holds no key `
                     + `'${String(key).slice(0, 40)}'` };
    }
    /* END DEC-49 REGION is-contradiction-key-unknown */
    /* R6: THE BOUND IS CLAMPED AND PUBLISHED, never refused. `truncated` is then a fact about THIS answer at THIS
       bound. */
    const max = CONTRADICTION_PAIRS_MAX;
    const n = limit === null || limit === undefined || limit === "" ? NaN : Number(limit);
    const cap = Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), max) : max;
    const scope = viewerPredicate(viewer).scope;
    const denied = scope === "DENY";
    const run = new Set(asked ? [asked] : names);
    const pairs = [];

    const keys = names.map((name) => {
      const spec = CONTRADICTION_KEYS[name];
      if (!run.has(name))
        return { ...spec, ran: false, formed: 0, limit: cap, truncated: false, levels: null, notes: [],
                 absence: { level: "not_run",
                            says: `this key was not run: the request named ${asked}. Nothing here is a `
                                + `statement about what ${name} would have found` } };
      const out = denied ? { pairs: [], truncated: false, notes: [] }
        : name === "K1" ? this.#k1(viewer, cap)
        : name === "K2" ? this.#k2(viewer, cap)
        : name === "K3" ? this.#k3(viewer, cap)
        : this.#k4(viewer, cap);
      pairs.push(...out.pairs);
      const ladder = this.#ladder(name, viewer, scope);
      /* THE FIRST EMPTY RUNG IS THE ANSWER. Where every rung is populated and the key still formed nothing, the join
         itself is what came back empty and the key's own last level names it — never a bare zero. */
      const empty = ladder.find((r) => !r.present);
      const level = out.pairs.length ? null : empty ? empty.level : LAST_LEVEL[name];
      return { ...spec, ran: true, formed: out.pairs.length, limit: cap, truncated: out.truncated,
               levels: ladder, notes: out.notes,
               absence: level === null ? null : { level, says: CONTRADICTION_ABSENCE[level] },
               ...(name === "K3" ? { arms: out.arms ?? { passage: { formed: 0, truncated: false },
                                                         document: { formed: 0, truncated: false } } } : {}),
               ...(name === "K4" && !denied
                 ? { undetermined: out.undetermined, indistinct: out.indistinct, undetermined_detail: out.missing }
                 : {}) };
    });

    const formed = pairs.length;
    const undetermined = keys.reduce((a, k) => a + (k.undetermined || 0), 0);
    return {
      ok: true, wrote: false, pairs_formed: formed, limit: cap, bound: max, bounded: true,
      viewer_scope: scope, keys, pairs,
      judgement: {
        state: "NOT_REACHED",
        by: "the machine, inside an investigative run, as labelled machine work (DEC-24)",
        item: "CONTRADICTION-IDENTIFY-DESIGN.md section 9 item 3",
        why: "whether either side of a pair here CONTRADICTS the other — and whether that would be a "
           + "contradiction in the WORLD, one in OUR RECORD, or merely the same fact stated at two "
           + "precisions — is semantic work this plane cannot do and has not done. NOTHING here is a "
           + "finding, and a pair is not a claim that its two sides disagree: it is a claim that they "
           + "are WORTH COMPARING, by the named key, and nothing more",
      },
      says: denied
        ? "this read compared NOTHING, because no viewer the record recognises was stamped on it. That "
        + "is an outage and not a statement about the record: every key below reads empty for want of "
        + "a reader, and none of them looked"
        : `${formed} candidate pair(s) over ${[...run].join(", ")}, each carrying the KEY that brought `
        + `its two sides together`
        + (undetermined ? `; ${undetermined} further pair(s) were NOT formed because a date or a `
                        + `doctype their readers never stated was needed to tell the two apart, and `
                        + `that is COUNTED rather than rounded to agreement` : "")
        + `. Every key that formed nothing NAMES THE LEVEL that was empty: absence at one level is `
        + `never evidence of absence at the next, and a key with nothing to join says the record is `
        + `SPARSE there, not that it is consistent`,
    };
  }

  /* ===================================================================== *
   * THE CANDIDATE DOOR (REC-147 / IC-318; R13–R17). Section 5, section 8, section 9 item 3.
   * ===================================================================== */

  /** R14: a side of a formed pair AS A REFERENT AT A VERSION (§8). A claim is the reading it is held on
   *  (`inquiry|version`), versioned by the SHA-256 of the claim text compared; a leg or an extent is its content row
   *  (or its capture where none is named), versioned by the capture, whose bytes never change. `bundle` is where the
   *  side lives, for purge (R22, D-113). */
  #side(s) {
    if (s && s.kind === "claim")
      return { kind: "claim", ref: `${String(s.inquiry ?? "")}|${String(s.version ?? "")}`,
               version: sha256HexSync(String(s.claim ?? "")), bundle: s.inquiry == null ? null : String(s.inquiry) };
    const cap = s?.capture_sha == null ? "" : String(s.capture_sha);
    const cid = s?.content_id == null || s.content_id === "" ? null : String(s.content_id);
    const home = cid ? this.#one(`SELECT bundle_id FROM content WHERE content_id=?`, cid)
      : cap ? this.#one(`SELECT bundle_id FROM content WHERE capture_sha=? ORDER BY bundle_id LIMIT 1`, cap) : null;
    return { kind: s?.kind === "leg" ? "leg" : "extent", ref: cid ?? cap, version: cap,
             bundle: home ? home.bundle_id : null };
  }

  /** R15, R17: THE ONE APPEND SITE of `contradiction_candidates` (§8). INSERT OR IGNORE on the candidate digest: a row
   *  over the same key and the same two referents at the same versions is already there, and is left exactly as it
   *  was. Answers whether a row was written. Nothing updates or deletes a candidate but its bundles' purge. */
  #append(row) {
    if (this.#one(`SELECT candidate FROM contradiction_candidates WHERE candidate=?`, row.candidate)) return false;
    this.#sql.exec(
      `INSERT OR IGNORE INTO contradiction_candidates (candidate, key, a_kind, a_ref, a_version, a_bundle_id,
         b_kind, b_ref, b_version, b_bundle_id, run, proposed_by, label, reason, state, origin, at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'proposed','machine',?)`,
      row.candidate, row.key, row.a.kind, row.a.ref, row.a.version, row.a.bundle,
      row.b.kind, row.b.ref, row.b.version, row.b.bundle, row.run, row.proposed_by, row.label, row.reason, row.at);
    return true;
  }

  /** op=contradictionpropose — A RUN'S JUDGEMENT OVER FORMED PAIRS ENTERS THE RECORD AS PROPOSED CANDIDATES (R13–R16).
   *
   *  The plane cannot judge (§2); what it holds is WHAT WAS COMPARED and WHAT WAS PROPOSED about it. So every refusal
   *  is asked of the whole batch before anything is written (a refused batch leaves nothing), and a proposal is
   *  written only when it names a pair the plane ITSELF forms for this viewer now, with the referents and versions
   *  the PLANE read — a pair a caller hands in is a provenance hop a caller can invent. A claim side must carry the
   *  claim text it judged: a claim that changed since is a different referent (R14), so that proposal is about a
   *  pair that is no longer formed and is refused rather than written against text the machine never saw.
   *
   *  THE LABEL IS A PROPOSAL (DEC-24): every row is `origin = 'machine'`, `state = 'proposed'`, and nothing here
   *  grades, edits or closes either side (R19). §7's over-strictness gate is a property of the JUDGEMENT (M-162
   *  measured the prompt `../contradiction.mjs` pins, R2). */
  propose({ run, proposals, proposedBy, viewer = null, caller = null, at = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = CONTRADICTION_CANDIDATE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-candidate-no-proposer */
    if (typeof proposedBy !== "string" || !proposedBy.trim())
      return refusal("CANDIDATE_NO_PROPOSER",
        "a proposed contradiction records who proposed it; the plane stamps that from the credential that asked, "
        + "so an empty one means the act arrived by a route that does not attribute it");
    /* END DEC-49 REGION is-candidate-no-proposer */
    const runId = typeof run === "string" ? run.trim() : "";
    /* R21: SIGHT, THEN POSITION, THEN STATUS — the tick's order (REC-152, REC-165), asked of the registered run gate.
       A run the viewer cannot see answers exactly as one never minted (§7.9), and with no gate registered nothing
       can say a run is open, so the answer is the same. */
    const r = runId && this.#runGate ? this.#runGate.gate(runId, viewer, caller) : null;
    /* DEC-49 REGION is-candidate-no-run */
    if (!r || r.found !== true)
      return refusal("CANDIDATE_NO_RUN",
        runId ? `no run named '${runId.slice(0, 60)}' is open in this store`
              : "pass run=<the run whose judgement this is>: a candidate is machine work and names the run it came from",
        { run: runId || null });
    /* END DEC-49 REGION is-candidate-no-run */
    const np = r.refusal;
    if (np)
      return { ok: false, reason: np.code, code: np.code, check: np.check, translation: np.translation,
               detail: np.detail, run: runId,
               note: "a proposed contradiction names a run its caller holds. Nothing was written" };
    /* DEC-49 REGION is-candidate-run-not-running */
    if (r.running !== true)
      return refusal("CANDIDATE_RUN_NOT_RUNNING",
        `the run '${runId.slice(0, 60)}' has ended; its work is read against the conditions it was formed under`,
        { run: runId });
    /* END DEC-49 REGION is-candidate-run-not-running */
    const list = Array.isArray(proposals) ? proposals : [];
    /* DEC-49 REGION is-candidate-no-proposals */
    if (list.length === 0)
      return refusal("CANDIDATE_NO_PROPOSALS",
        "an empty batch is not a judgement that found nothing; that is an observation for the run's log", { run: runId });
    /* END DEC-49 REGION is-candidate-no-proposals */
    const item = (i) => (list[i] && typeof list[i] === "object" ? list[i] : {});
    /* R13: each refusal asked of the WHOLE batch in turn — every label, then every reason, then every pair. */
    for (let i = 0; i < list.length; i++) {
      const p = item(i);
      /* DEC-49 REGION is-candidate-label-unknown */
      if (!CONTRADICTION_LABELS.includes(p.label))
        return refusal("CANDIDATE_LABEL_UNKNOWN",
          `proposal ${i} carries '${String(p.label).slice(0, 30)}', which is not one of ${CONTRADICTION_LABELS.join(", ")}`,
          { run: runId, index: i, labels: [...CONTRADICTION_LABELS] });
      /* END DEC-49 REGION is-candidate-label-unknown */
    }
    for (let i = 0; i < list.length; i++) {
      const p = item(i);
      /* DEC-49 REGION is-candidate-no-reason */
      if (typeof p.reason !== "string" || !p.reason.trim())
        return refusal("CANDIDATE_NO_REASON", `proposal ${i} carries no reason`, { run: runId, index: i });
      /* END DEC-49 REGION is-candidate-no-reason */
    }
    /* THE PAIRS AS THIS VIEWER'S PAIRING FORMS THEM NOW — the op's own read, so what may be proposed over is exactly
       what the member could have been shown (§6), bounded as it is bounded. */
    const read = this.pairs({ viewer });
    const handle = (x) => `${x.kind}|${x.ref}@${x.version}`;
    const formed = new Map();
    for (const q of Array.isArray(read.pairs) ? read.pairs : []) {
      const a = this.#side(q.a), b = this.#side(q.b);
      formed.set(`${q.key}:${[handle(a), handle(b)].sort().join(" <> ")}`, { key: q.key, a, b });
    }
    const cutKeys = (read.keys ?? []).filter((k) => k.truncated).map((k) => k.key);
    const stamp = at || this.#now();
    const rows = [];
    for (let i = 0; i < list.length; i++) {
      const p = item(i);
      const key = String(p.key ?? "").trim().toUpperCase();
      const a = this.#side(p.a), b = this.#side(p.b);
      const f = formed.get(`${key}:${[handle(a), handle(b)].sort().join(" <> ")}`);
      /* DEC-49 REGION is-candidate-pair-not-formed */
      if (!f)
        return refusal("CANDIDATE_PAIR_NOT_FORMED",
          `proposal ${i} names a ${key || "(no key)"} pair the pairing does not form for this viewer now`
          + (cutKeys.length ? ` (the read was cut at its bound on ${cutKeys.join(", ")}, and a pair past the bound is not formed here)` : ""),
          { run: runId, index: i, cut_keys: cutKeys });
      /* END DEC-49 REGION is-candidate-pair-not-formed */
      /* R15: the PLANE's referents, ordered so the row reads the way its digest was taken. */
      const [x, y] = handle(f.a) <= handle(f.b) ? [f.a, f.b] : [f.b, f.a];
      rows.push({ candidate: sha256HexSync(canonicalJson({ v: 1, key: f.key, sides: [handle(x), handle(y)] })),
                  key: f.key, a: x, b: y, run: runId, proposed_by: proposedBy.trim(),
                  label: p.label, reason: p.reason.trim().slice(0, CANDIDATE_REASON_MAX), at: stamp });
    }
    const written = this.#record.transact(() => rows.map((row) => this.#append(row)));
    const candidates = rows.map((row, i) => ({
      new: written[i], ...this.#one(`SELECT candidate, key, a_kind, a_ref, a_version, a_bundle_id, b_kind, b_ref,
        b_version, b_bundle_id, run, proposed_by, label, reason, state, origin, at
        FROM contradiction_candidates WHERE candidate=?`, row.candidate) }));
    const n = written.filter(Boolean).length;
    return { ok: true, run: runId, proposed: rows.length, written: n, unchanged: rows.length - n, candidates,
             says: `${n} candidate(s) written as PROPOSED machine work; ${rows.length - n} named two referents at `
                 + `versions already proposed over, and were left exactly as they were (§8). A candidate is a `
                 + `proposal about two things as they were, never a finding: no member has judged it.` };
  }
}

/* The Durable Object routes this module answers, as entries of the legacy store's op map (its dispatcher spreads
   them in, K3). `url` carries the control plane's stamps (`viewer`, `proposedBy`, `principal`), never the caller's;
   `body` the parsed body, of which only `run`, `proposals` and `at` are read. `key` and `limit` are the caller's,
   and both are answered rather than trusted (R5, R6). */
export function contradictionOps(c, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    contradictionpropose: () => c.propose({ run: b.run, proposals: b.proposals, at: b.at || null,
                                            proposedBy: q("proposedBy"), viewer: q("viewer"), caller: q("principal") }),
    contradictionpairs: () => c.pairs({ key: q("key"), limit: q("limit"), viewer: q("viewer") }),
  };
}
