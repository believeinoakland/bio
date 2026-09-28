/* reevaluation — when something a finding rests on changes, which findings are affected and how (requirements:
 * `build/requirements/reevaluation.md`; Content Framework §18.1, State Rules §5.4). It changes nothing a finding rests
 * on: the obligation is DERIVED ON READ from the record's own facts about each target (R1–R6, R16, R17), the pushed
 * notice tells a member when a newer version of a document affects a passage they reference and the member chooses
 * (R14, R15), and later modules are told when a finding's basis changed (R8, R9).
 *
 * Extracted from the legacy modules (T7, layer 7; K3, K102): `store.mjs` (`#reevalRaisedBy`, now `raise`; the REC-17
 * obligation, `reevaluations`, with `#reevalLegsEarned` and `#reevalMoved`; D-256's `changedFromAudit`; D-394's
 * `versionNotice`, its question arm, calling content's passage notice) and `bio-checks.mjs` (C-10.1, C-80.1, C-80.2, now
 * `./checks.mjs`). Its tables are `./schema.mjs`. The legacy code's comments moved with it, shortened where they only
 * restated the code.
 *
 * NOTHING IS STORED FOR THE OBLIGATION (R18, P-64), for two reasons that are the item's title rather than an
 * implementation preference: a stored verdict goes stale in both directions (still set after the member looked, still
 * clear after the thing beneath it moved again), and the member decides, not the plane. No verdict here is computed
 * from strength and nothing here alters one (R19): what a reader is handed is the FACT that something moved.
 *
 * REACHED as `reevaluationOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its tables and declares them to record-core's
 * purge (K23), registers its answer with `inquiry.onRaised` (a deferral, a division, a re-read) and
 * `promotion.onReopened` (a reopening), registers C-10.1 with promotion as a check and with record-core's audit (R22), and
 * listens to provenance's receipts (its R47), each of which makes the notice sweep pending again (R25).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `readFile`, `head`, `livePaths`, `transact`, `declarePurge`,
 *                                   `registerAuditCheck`; `viewerPredicate`; `registerStep`, `onReopened`, the fact
 *                                   `publishedRegistry` (R2's ratified edition, R17's frozen pair).
 *   inquiry        `restingOn`, `restsOnLive`, `supersededBy`, `earned`, `onRaised` (its R13, R16, R17, R42).
 *   content        `noticeForRow`, `passageNotice` (its R29–R31).
 *   connections    `edgeSevered` (its R22), read through inquiry's `restingOn`.
 *   provenance     `versionChain` (its R17, R18), `onReceipt` (its R47, R25 here).
 *   strength       `strengthOf` (its R1–R5).
 *   basisVersions  `appendVersion` (its R28).
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *   env            the instance bindings: `REEVAL_NOTICE_DELAY_MS` (R25).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`, `title`,
 * `last_updated`, its R37) and `files` (the D-256 audit's scan, below); inquiry's `inquiry_basis` (`bundle_id`, `ord`,
 * `target_id`, `content_id`, its R40); content's `content` (its R45); provenance's `register` and `captured_locators`
 * (its R48). */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf, REOPENABLE_FROM } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf, VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES } from "../content/index.mjs";
import { inquiryOf, legCapped } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { strengthOf, GRADE_RANK } from "../strength/index.mjs";
import { normalizeType, parseFrontmatter, isMachineIdentity, MACHINE_CLASS_PREFIX, sha256HexSync,
         VERSION_NAME_RE, GROUND_LABEL_RE } from "../../checks/bio-checks.mjs";
import { checkReevalPending, REEVAL_SOURCES, VERSION_NOTICE_SUBJECT_CHECKS, REEVALUATION_ACT_CHECKS,
         rowOf } from "./checks.mjs";
import { REEVALUATION_TABLES, migrateReevaluation } from "./schema.mjs";

export { checkReevalPending, REEVAL_SOURCES, REEVAL_POLICY_AGE_DAYS, VERSION_NOTICE_SUBJECT_CHECKS,
         REEVALUATION_ACT_CHECKS } from "./checks.mjs";
export { REEVALUATION_SCHEMA, REEVALUATION_TABLES } from "./schema.mjs";

/** R11: the legs one notice read answers for a question. 200 is the version chain's own default, reused rather than a
 *  new spelling: a question resting on more than two hundred passages is a run's walk, and `truncated` says so. */
export const VERSION_NOTICE_LEGS_MAX = 200;
/** R13: D-256's bound, `op=versionchain`'s 200/1000 pair reused. It bounds the LISTING only: the three totals are
 *  always counted over every affected bundle, because a verdict total cut at N would be the partial count this read
 *  exists to replace. */
export const CHANGED_FROM_AUDIT_LIMIT_DEFAULT = 200;
export const CHANGED_FROM_AUDIT_LIMIT_MAX = 1000;
/** R12: the one literal the pre-2026-08-08 `addGo` wrote, up to the parenthesis that opens the named id. */
export const CHANGED_FROM_SENTENCE = "The record already holds an earlier capture of this same address (";
/** R9: the findings and the passages one `changesOf` read answers, each. */
export const CHANGES_OF_MAX = 200;
/** R14: the basis legs one sweep reads (default and most). */
export const NOTICE_SWEEP_DEFAULT = 200;
export const NOTICE_SWEEP_MAX = 1000;
/** R14: the notices one read lists (default and most). */
export const NOTICES_LIMIT_DEFAULT = 200;
export const NOTICES_LIMIT_MAX = 1000;
/** R25: the notice sweep's delay after `now` while it is pending, unless the instance binding sets another. */
export const REEVAL_NOTICE_DELAY_MS = 1000;
/** R15, R16: the longest why or note a member's act stores. */
export const NOTE_MAX = 500;
/** R2, R16: the sources a cause may carry. R2's five are facts about the target's own row; §5.4's four cascade events
 *  (the catalogue's `REEVAL_SOURCES`) are derived the same way; `weakened` is R17's. */
export const CAUSE_SOURCES = Object.freeze(["supersession", "edition", "deferred", "reopened", "dismissed",
  ...REEVAL_SOURCES, "weakened"]);
/** R14: the grades a notice is raised on (content R31's `affects`); A and B read `unaffected` and never raise one. */
const RAISED_ON = Object.freeze(["affected", "undetermined"]);
/** R17: the axes whose frozen and derived letters are compared. */
const PAIR_AXES = Object.freeze(["capture", "connection", "testimony"]);

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const MACHINE_ADMIN = `${MACHINE_CLASS_PREFIX}admin`;
const UNSTORABLE = /["\\\n\r]/;
const asList = (v) => {
  if (Array.isArray(v)) return v.map((x) => String(x ?? "").trim()).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
};
const clamp = (v, dflt, max) => Math.max(1, Math.min(max, Math.floor(Number(v) || dflt)));

/* A cause's `since` against a recorded one: closed when the cause is not later (R16). Two nulls are the same instant;
   an unreadable pair is compared as text, never read as later. */
function notLater(since, recorded) {
  if (since == null || recorded == null) return since == null && recorded == null;
  const o = instantOrder(since, recorded);
  return Number.isNaN(o) ? String(since) <= String(recorded) : o <= 0;
}

export class Reevaluation {
  #deps;
  #listeners = [];     // R8: {module, fn}, in registration order

  constructor({ storage, record, membership, promotion, host = null, inquiry = null, content = null,
                connections = null, provenance = null, strength = null, basisVersions = null, now = null,
                env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, inquiry, content, connections, provenance, strength, basisVersions };
    this.now = typeof now === "function" ? now : () => stampInstant("second");
    this.env = env && typeof env === "object" ? env : {};
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }

  migrate() { migrateReevaluation(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }

  /* R20: whether the viewer may see one bundle, by membership's one rule (its R43); absent and unseen are one answer. */
  #visible(id, viewer) {
    if (!id) return false;
    const g = viewerPredicate(viewer);
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args);
  }

  /* R3, R20: the same question of ONE id, as a function: a visible id passes, an unseen one answers null, a value naming
     no bundle is left alone. Memoised for the one answer it serves. */
  #redactor(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return (id) => id ?? null;          /* a machine credential: not filtered */
    if (g.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args));
      return memo.get(id) ? id : null;
    };
  }

  /* A bundle's live frontmatter, parsed from its bundle.md (record-core R13), or null. */
  #frontmatterOf(bundleId) {
    let md = null;
    try { md = this.record.readFile(bundleId, "bundle.md"); } catch { md = null; }
    if (!md || typeof md.text !== "string") return null;
    try { return parseFrontmatter(md.text).data || null; } catch { return null; }
  }

  /* The authored basis legs of a bundle, by ord: the fields `inquiry_basis` does not project (`target_edition`). */
  #basisFrontmatter(fm) {
    const legs = fm && Array.isArray(fm.basis) ? fm.basis : [];
    return legs.map((l) => (l && typeof l === "object" ? l : {}));
  }

  /* R4: the dependent's OWN authored triple, as its document states it (a legacy boolean is the flag alone). */
  #storedTriple(fm) {
    const rp = fm ? fm.reeval_pending : undefined;
    if (typeof rp === "boolean") return { flag: rp, since: null, source: null };
    if (rp && typeof rp === "object" && !Array.isArray(rp))
      return { flag: typeof rp.flag === "boolean" ? rp.flag : null,
               since: typeof rp.since === "string" ? rp.since : null,
               source: typeof rp.source === "string" ? rp.source : null };
    return { flag: null, since: null, source: null };
  }

  /* R2, R17: promotion's fact `publishedRegistry` for these ids (the published registry, per finding), or null when no
     module provides it: then no edition is read, and the answer says so (R21). */
  #registry(ids) {
    const list = [...new Set(ids.filter(Boolean))];
    if (!list.length) return {};
    const f = this.promotion.fact("publishedRegistry", null, list);
    return f && f.ok && f.value && typeof f.value === "object" ? f.value : null;
  }

  /* A target's own row, read through record-core: its `bundles` columns (R37) and its prior state (`head`, R41). */
  #targetRow(id) {
    const row = this.#one(`SELECT bundle_id, object_type, current_state, title, last_updated FROM bundles WHERE bundle_id=?`, id);
    if (!row) return null;
    let head = null;
    try { head = this.record.head(id); } catch { head = null; }
    return { ...row, prior_state: head ? head.priorState ?? null : null };
  }

  /* R16, the `annotation` cascade event: the latest annotation on the target addressed with a substantive change. */
  #addressedAnnotation(id) {
    let paths = null;
    try { paths = this.record.livePaths(id); } catch { paths = null; }
    let latest = null;
    for (const p of Array.isArray(paths) ? paths : []) {
      if (!p.startsWith("annotations/") || !p.endsWith(".json")) continue;
      let a = null;
      try { const f = this.record.readFile(id, p); a = f && typeof f.text === "string" ? JSON.parse(f.text) : null; }
      catch { a = null; }
      if (!a || a.state !== "addressed" || a.substantive !== true) continue;
      const when = typeof a.addressed_at === "string" ? a.addressed_at : null;
      if (!latest || (when && (!latest.at || String(when) > String(latest.at)))) latest = { id: a.id ?? p, at: when };
    }
    return latest;
  }

  /** R2, R16: one target's own row, answered as "has anything moved under a leg naming it?". `null` when nothing has,
   *  which is the common case and what keeps the untargeted sweep cheap. `reg` is the published registry (null unread). */
  #moved(targetId, visible, reg) {
    const row = this.#targetRow(targetId);
    /* §5.4's gated deletion: a leg naming what the record no longer holds. When it went is not recorded here. */
    if (!row)
      return { held: false, state: null, object_type: null, edition: null,
               causes: [{ source: "deletion", since: null,
                          detail: `${targetId} is not held by this record: it was deleted, or was never held. A claim `
                                + `resting on it names something the record cannot show, and when it went is not `
                                + `recorded here, so no instant is stated.` }] };
    const causes = [];
    /* SUPERSESSION, from inquiry's reverse index and not from a walk. The superseding ids are BACK-REFERENCES: an
       invisible one is redacted to null and the fact that this bundle was superseded still stands (REC-30). */
    const sup = this.inquiry.supersededBy(targetId) || [];
    let supersededBy = null;
    if (sup.length) {
      supersededBy = sup.map((id) => visible(id));
      /* D-443: ONE json_each value — a question's successors are bounded by no cap (D-36). */
      const when = this.#one(
        `SELECT MAX(last_updated) AS m FROM bundles WHERE bundle_id IN (SELECT value FROM json_each(?))`,
        JSON.stringify(sup));
      causes.push({ source: "supersession", since: (when && when.m) || row.last_updated,
                    detail: `${targetId} has been superseded. The question it asked is carried forward by `
                          + `what supersedes it, and a leg naming ${targetId} was not re-pointed by that `
                          + `act — nothing here re-points it for you.` });
    }
    /* THE LIFECYCLE ARMS (D-5), off the target's own state pair; the reversible acts RAISE rather than refuse. */
    if (row.current_state === "deferred")
      causes.push({ source: "deferred", since: row.last_updated,
                    detail: `${targetId} has been set down. It is reversible and the group may pick it back `
                          + `up, and until it does, a claim resting on it rests on a question nobody is `
                          + `working.` });
    else if (row.current_state === "dismissed")
      causes.push({ source: "dismissed", since: row.last_updated,
                    detail: `${targetId} was abandoned. A claim resting on it names a question that will `
                          + `not be answered.` });
    /* CASE-4 / DEC-72: `concluded` joins the prior states that mean "reopened". `concluded -> open` is refused by
       reopen for every finding that is not a case member, so a document at `open` with `prior_state: concluded` can
       only have got there by a case member being picked back up. */
    else if (row.current_state === "open"
             && (REOPENABLE_FROM.includes(row.prior_state) || row.prior_state === "concluded"))
      causes.push({ source: "reopened", since: row.last_updated,
                    detail: `${targetId} was picked back up from ${row.prior_state}. What it concluded is `
                          + `being worked again, which is a reason to look at what rests on it.` });
    /* R16: §5.4's cascade events, each a fact the target's own record states (the obligation is derived on read, never
       a flag a cascade sets). */
    const type = normalizeType(row.object_type);
    const fm = type === "information" || type === "project" || (reg && reg[targetId] && reg[targetId].latest > 0)
      ? this.#frontmatterOf(targetId) : null;
    if (type === "information" && fm && (fm.source_status === "modified" || fm.source_status === "removed"))
      causes.push({ source: "source_status", since: row.last_updated,
                    detail: fm.source_status === "removed"
                      ? `the source of ${targetId} no longer serves it (source_status: removed). What a claim quotes `
                        + `from it can no longer be checked against the source.`
                      : `the source of ${targetId} has changed since it was captured (source_status: modified); both `
                        + `versions are kept, and a claim resting on it rests on the earlier one.` });
    if (type === "project" && fm && (fm.workproduct_state === "retracted" || fm.workproduct_state === "redistributed"))
      causes.push({ source: "wp_retraction", since: row.last_updated,
                    detail: `the work product ${targetId} was ${fm.workproduct_state === "retracted"
                      ? "retracted" : "re-distributed"}, so what a claim took from it may no longer be what its `
                          + `authors stand behind.` });
    const ann = this.#addressedAnnotation(targetId);
    if (ann)
      causes.push({ source: "annotation", since: ann.at,
                    detail: `an annotation on ${targetId} was addressed with a substantive change (${ann.id}). What `
                          + `a claim took from it may have changed with it.` });
    /* THE EDITION ARM is per LEG (it depends on which edition the leg named), so what is computed here is the target's
       latest edition: the greater of what has been RATIFIED and what the working document now says, both reported so
       neither is implied. The document is read only where it could carry an edition at all (a ratified one exists). */
    const entry = reg ? reg[targetId] : null;
    const latestRatified = entry && Number.isFinite(Number(entry.latest)) ? Number(entry.latest) : 0;
    const authored = latestRatified > 0 && fm && Number.isInteger(fm.edition) ? fm.edition : 0;
    const latest = Math.max(latestRatified, authored);
    const edition = latest > 1 ? { latest, latest_ratified: latestRatified, since: row.last_updated } : null;
    if (!causes.length && !edition) return null;
    return { held: true, state: row.current_state, object_type: row.object_type, causes, edition,
             ...(supersededBy ? { superseded_by: supersededBy } : {}) };
  }

  /* R16: the recorded re-evaluations of the (dependent, target) pairs one answer lists, keyed (dependent, target,
     source): the LATEST record of each key, which is the one with the latest `since`, because a record is only written
     for a cause still owed, whose `since` is later than every earlier record's (`recordReevaluation`). So the read is
     one row per key, at most one per cause source per pair, and its `LIMIT` says so (N182 (2)). */
  #records(pairs) {
    const keys = [...new Map(pairs.map(([d, t]) => [`${d}\u0000${t}`, { d, t }])).values()];
    if (!keys.length) return new Map();
    const rows = this.#rows(
      `SELECT dependent, target, source, since, note, author, at FROM reevaluation_records
        WHERE record_id IN (
          SELECT MAX(r.record_id) FROM reevaluation_records r
            JOIN json_each(?) k ON r.dependent = json_extract(k.value, '$.d') AND r.target = json_extract(k.value, '$.t')
           GROUP BY r.dependent, r.target, r.source)
        ORDER BY record_id LIMIT ?`, JSON.stringify(keys), keys.length * CAUSE_SOURCES.length);
    return new Map(rows.map((r) => [`${r.dependent}\u0000${r.target}\u0000${r.source}`, r]));
  }

  /* R16: split one obligation's causes into those still owed and those a member's recorded re-evaluation closed. */
  #split(dependent, target, causes, records) {
    const open = [], closed = [];
    for (const c of causes) {
      const r = records.get(`${dependent}\u0000${target}\u0000${c.source}`);
      if (r && notLater(c.since, r.since))
        closed.push({ ...c, closed_by: r.author, closed_at: r.at, note: r.note });
      else open.push(c);
    }
    return { open, closed };
  }

  /* R4: the dependent's pair per axis with its depth bound (`strength.strengthOf`), unaltered. */
  #strengthOf(bundleId) {
    let s = null;
    try { s = this.strength.strengthOf(bundleId); } catch { s = null; }
    if (!s || s.ok === false) return null;
    return { capture: s.capture, connection: s.connection, testimony: s.testimony, depth_bound: s.depth_bound };
  }

  /** R17: a dependent at a published edition whose derived pair now reads weaker on an axis than that edition's frozen
   *  pair: the cause `weakened`, naming both per axis. Weaker is both graded and the derived letter ranking below the
   *  frozen one; an axis either side leaves ungraded is not compared. Neither pair is altered. */
  #weakened(dependent, reg) {
    const e = reg ? reg[dependent] : null;
    const latest = e && Number(e.latest) > 0 ? Number(e.latest) : 0;
    if (!latest) return null;
    const frozen = e.editions ? e.editions[String(latest)] : null;
    if (!frozen) return null;
    const derived = this.#strengthOf(dependent);
    if (!derived) return null;
    const axes = [];
    for (const axis of PAIR_AXES) {
      const f = frozen[axis], d = derived[axis];
      if (!f || !d || f.state !== "graded" || d.state !== "graded" || !f.grade || !d.grade) continue;
      if (!(f.grade in GRADE_RANK) || !(d.grade in GRADE_RANK)) continue;
      if (GRADE_RANK[d.grade] < GRADE_RANK[f.grade])
        axes.push({ axis, frozen: { state: f.state, grade: f.grade }, derived: { state: d.state, grade: d.grade } });
    }
    if (!axes.length) return null;
    return {
      source: "weakened", since: frozen.ratified_at ?? null, edition: latest, axes,
      detail: `${dependent} now derives weaker than edition ${latest} froze: `
        + axes.map((a) => `${a.axis} ${a.derived.grade} where the edition says ${a.frozen.grade}`).join("; ")
        + `. The signed edition keeps its own pair and nothing here changes either; a new edition stays the `
        + `authors' choice (DEC-12, DEC-69).`,
    };
  }

  /* ---------------------------------------------------------------- R1–R6, R16, R17: the obligation */

  /** R1–R6: the re-evaluation obligation, derived on read. With `target`, the dependents of one moved thing (and, R17,
   *  that thing itself if its derivation weakened under a published edition); with none, every id a basis leg names. */
  reevaluations({ target = null, viewer = null } = {}) {
    const t0 = str(target);
    if (t0 && !this.#visible(t0, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE", target: t0 };
    /* Bounded by the number of DISTINCT basis targets rather than by the corpus: the same index read the other way, and
       each costs one row read before it is dismissed as unmoved. */
    const targets = t0 ? [t0]
      : this.#rows(`SELECT DISTINCT target_id FROM inquiry_basis ORDER BY target_id`).map((r) => r.target_id);
    const dependents = t0 ? [t0]
      : this.#rows(`SELECT DISTINCT bundle_id FROM inquiry_basis ORDER BY bundle_id`).map((r) => r.bundle_id);
    const visible = this.#redactor(viewer);
    const reg = this.#registry([...targets, ...dependents]);
    const obligations = [], closedOnly = [];
    /* Each obligation found is held with its causes, and the recorded re-evaluations of exactly those pairs are read
       once after the walk (R16), so that read is bounded by the answer. */
    const found = [];
    const place = (o, causes) => found.push({ o, causes });
    for (const t of targets) {
      const moved = this.#moved(t, visible, reg);
      if (!moved) continue;
      const rest = this.inquiry.restingOn(t);
      const legs = rest && rest.ok !== false && Array.isArray(rest.dependents) ? rest.dependents : [];
      const byBundle = new Map();
      for (const l of legs) {
        /* The row IS about this dependent, so an invisible one is withheld whole and no count of the withheld is
           reported, because that count is the leak (R3). */
        if (visible(l.bundle_id) === null) continue;
        if (!byBundle.has(l.bundle_id)) byBundle.set(l.bundle_id, []);
        byBundle.get(l.bundle_id).push(l);
      }
      for (const [bundleId, mine] of byBundle) {
        const dep = this.#one(`SELECT title, object_type, current_state FROM bundles WHERE bundle_id=?`, bundleId);
        /* The leg's OWN cited edition comes from the dependent's document: `target_edition` is authored on the leg
           (DEC-12) and inquiry_basis does not project it. */
        const fm = this.#frontmatterOf(bundleId);
        const fmBasis = this.#basisFrontmatter(fm);
        /* REC-160 / DEC-70: SEVERANCE DISCHARGES SUPPORT, NEVER CONNECTION. A withdrawn leg still RECEIVES the
           obligation, and the read marks it (connections' one severance predicate, through inquiry's `restingOn`). */
        const legStatus = mine.some((l) => l.status === "severed") ? "severed" : "confirmed";
        const causes = [...moved.causes];
        if (moved.edition) {
          for (const l of mine) {
            const cited = fmBasis[l.ord] && fmBasis[l.ord].target_edition != null
              ? Number(fmBasis[l.ord].target_edition) : null;
            if (cited === null || cited < moved.edition.latest)
              causes.push({ source: "edition", since: moved.edition.since, ord: l.ord,
                            cited_edition: cited, latest_edition: moved.edition.latest,
                            latest_ratified_edition: moved.edition.latest_ratified,
                            detail: legStatus === "severed"
                              ? (cited === null
                                ? `this leg was WITHDRAWN (severed) and named no edition of ${t}, which `
                                  + `now stands at edition ${moved.edition.latest}.`
                                : `this leg was WITHDRAWN (severed) and named edition ${cited} of ${t}, `
                                  + `which now stands at edition ${moved.edition.latest}.`)
                                + ` A withdrawn leg supports nothing here: it adds nothing to strength, `
                                + `gates nothing and counts toward no bar. It is listed because the `
                                + `connection still informs a second look (DEC-70).`
                              : cited === null
                              ? `this leg names no edition of ${t}, which now stands at edition `
                                + `${moved.edition.latest}. A leg keeps citing the edition it names `
                                + `(DEC-12) and this one names none, so which edition it rests on cannot `
                                + `be read off the record.`
                              : `this leg rests on edition ${cited} of ${t}, which now stands at edition `
                                + `${moved.edition.latest}. Edition ${cited} keeps answering with its own `
                                + `signature and its own frozen strength; nothing here follows the case `
                                + `forward on your behalf (DEC-12).` });
          }
        }
        if (!causes.length) continue;
        place({
          bundle_id: bundleId, title: dep?.title ?? null,
          object_type: dep?.object_type ?? null, current_state: dep?.current_state ?? null,
          target: t, target_state: moved.state,
          /* The RAW rows travel here and the PUBLISHED leg shape is composed once, in `#legsEarned`, after the whole
             answer is built, so the registry is asked ONCE for the page. */
          legs: mine.map((l) => ({ ...l, target_id: t, target_type: moved.object_type,
                                   target_edition: fmBasis[l.ord]?.target_edition ?? null, status: legStatus })),
          stored: this.#storedTriple(fm),
          strength: this.#strengthOf(bundleId),
          ...(moved.superseded_by ? { superseded_by: moved.superseded_by } : {}),
        }, causes);
      }
    }
    /* R17: each visible dependent at a published edition whose derivation weakened; its own target. */
    for (const d of dependents) {
      if (visible(d) === null) continue;
      const w = this.#weakened(d, reg);
      if (!w) continue;
      const dep = this.#one(`SELECT title, object_type, current_state FROM bundles WHERE bundle_id=?`, d);
      if (!dep) continue;
      place({ bundle_id: d, title: dep.title ?? null, object_type: dep.object_type ?? null,
              current_state: dep.current_state ?? null, target: d, target_state: dep.current_state ?? null,
              legs: [], stored: this.#storedTriple(this.#frontmatterOf(d)), strength: this.#strengthOf(d) }, [w]);
    }
    const records = this.#records(found.map(({ o }) => [o.bundle_id, o.target]));
    for (const { o, causes } of found) {
      const { open, closed } = this.#split(o.bundle_id, o.target, causes, records);
      if (open.length) obligations.push({ ...o, reeval: { flag: true, since: open[0].since, source: open[0].source },
                                          causes: open, closed });
      else if (closed.length) closedOnly.push({ bundle_id: o.bundle_id, target: o.target, causes: closed });
    }
    const order = (a, b) => (a.bundle_id < b.bundle_id ? -1 : a.bundle_id > b.bundle_id ? 1
                            : a.target < b.target ? -1 : a.target > b.target ? 1 : 0);
    obligations.sort(order);
    closedOnly.sort(order);
    this.#legsEarned(obligations);
    return { ok: true, ...(t0 ? { target: t0 } : {}), obligations, count: obligations.length,
             closed: closedOnly, closed_count: closedOnly.length,
             editions_read: reg !== null,
             ...(reg === null ? { editions_why: "no module provides the published registry, so no edition was read "
                                  + "and no edition cause could be derived; that is not the same as none" } : {}) };
  }

  /** R5 (REC-118 / D-410): an obligation's leg letters, resolved against what the record can earn, so the two halves of
   *  one answer stop disagreeing. It publishes what the record can SUPPORT, never erases what a member AUTHORED, and
   *  says why they differ; the rule is inquiry's `legCapped`, never a second policy. Capture axis only, a leg actually
   *  carrying a letter, a target that is not an inquiry. ONE registry call for the whole answer. Both derived fields
   *  are always present. It mutates `obligations` in place. */
  #legsEarned(obligations) {
    if (!obligations.length) return;
    const bounded = (l) => !!l && l.grade_axis === "capture" && l.grade != null
      && typeof l.target_id === "string" && !!l.target_id && normalizeType(l.target_type) !== "inquiry";
    const targets = new Set();
    for (const o of obligations) for (const l of o.legs) if (bounded(l)) targets.add(l.target_id);
    let cap = {};
    if (targets.size) {
      try { cap = this.inquiry.earned(null, [...targets])?.earned?.capture || {}; } catch { cap = {}; }
    }
    for (const o of obligations) {
      o.legs = o.legs.map((l) => {
        const res = bounded(l) ? legCapped(l.grade, cap[l.target_id], l.target_id) : null;
        return { ord: l.ord, role: l.role || null,
                 grade: res ? res.grade : (l.grade ?? null),
                 grade_axis: l.grade_axis ?? null,
                 grade_source: l.grade_source ?? null,
                 target_edition: l.target_edition ?? null,
                 status: l.status === "severed" ? "severed" : "confirmed",
                 grade_authored: l.grade ?? null,
                 grade_why: res ? res.why : null };
      });
    }
  }

  /* ---------------------------------------------------------------- R7, R8: raise and the listeners */

  /** R8: a later module's listener, registered once at start, told of every R7 raise and every R14 notice raised,
   *  after the act commits. A second registration by one module is `LISTENER_DECLARED`. */
  onBasisChanged(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "LISTENER_MALFORMED", detail: "a listener names the module that registers it and its function" };
    if (this.#listeners.some((l) => l.module === module))
      return { ok: false, reason: "LISTENER_DECLARED", module, detail: `${module} has already registered its listener` };
    this.#listeners.push({ module, fn });
    return { ok: true, module };
  }

  /* R8: every listener once, in registration order; one that throws or rejects changes nothing, and is named. */
  #tell(event) {
    const failed = [];
    for (const l of this.#listeners) {
      try {
        const r = l.fn(event);
        if (r && typeof r.then === "function") r.then(null, () => {});
      } catch { failed.push(l.module); }
    }
    return failed;
  }

  /** R7: the live legs resting on `target` (`inquiry.restsOnLive`), each `{bundle_id, ord, role, state}`, a dependent
   *  the viewer may not see withheld and not counted, no titles. Called by the acts that move a target, after they
   *  commit; the act puts the answer in its reply as `reevaluation`. R8's listeners are told. */
  raise({ target = null, source = null, since = null, edition = null, viewer = null } = {}) {
    const t = str(target);
    const visible = this.#redactor(viewer);
    let live = null;
    try { live = t ? this.inquiry.restsOnLive(t) : null; } catch { live = null; }
    const raised = (live && Array.isArray(live.all) ? live.all : [])
      .filter((l) => visible(l.bundle_id) !== null)
      .map((l) => ({ bundle_id: l.bundle_id, ord: l.ord, role: l.role ?? null, state: l.state ?? null }));
    const out = { source, since, ...(edition != null ? { edition } : {}), raised };
    const failed = t ? this.#tell({ kind: "finding", subject: t, source, since, ...(edition != null ? { edition } : {}),
                                    detail: `${t} moved (${source}); ${raised.length ? "what rests on it is named" : "nothing visible here rests on it"}`,
                                    dependents: raised }) : [];
    if (failed.length) out.listeners_failed = failed;
    return out;
  }

  /* ---------------------------------------------------------------- R9: the recovery read */

  /** R9: now, the causes standing on each named finding (R2's arms and §5.4's, the finding as target, and R17's) and
   *  each named passage's `affects` (`content.passageNotice`). Ids the viewer may not see answer as absent. Writes
   *  nothing. */
  changesOf({ findings = null, contents = null, viewer = null } = {}) {
    const F = asList(findings), C = asList(contents);
    const fl = F.slice(0, CHANGES_OF_MAX), cl = C.slice(0, CHANGES_OF_MAX);
    const visible = this.#redactor(viewer);
    const seen = fl.filter((id) => this.#visible(id, viewer));
    const reg = this.#registry(seen);
    const outF = fl.map((id) => {
      if (!seen.includes(id)) return { id, absent: true };
      const moved = this.#moved(id, visible, reg);
      const causes = moved ? [...moved.causes] : [];
      if (moved && moved.edition)
        causes.push({ source: "edition", since: moved.edition.since, latest_edition: moved.edition.latest,
                      latest_ratified_edition: moved.edition.latest_ratified,
                      detail: `${id} now stands at edition ${moved.edition.latest}; a leg naming an earlier edition, or `
                            + `none, rests on an edition that is no longer its latest.` });
      const w = this.#weakened(id, reg);
      if (w) causes.push(w);
      const state = this.#one(`SELECT current_state FROM bundles WHERE bundle_id=?`, id);
      return { id, state: state ? state.current_state : null, causes,
               ...(moved && moved.superseded_by ? { superseded_by: moved.superseded_by } : {}) };
    });
    const outC = cl.map((cid) => {
      let n = null;
      try { n = this.content.passageNotice({ contentId: cid, viewer }); } catch { n = null; }
      if (!n || !n.ok) return { id: cid, absent: true };
      return { id: cid, state: n.state, newer: n.newer, affects: n.affects,
               candidates: (n.candidates || []).map((c) => ({ capture_sha: c.capture_sha, grade: c.grade,
                                                                affects: c.affects })) };
    });
    return { ok: true, findings: outF, contents: outC,
             findings_truncated: F.length > fl.length, contents_truncated: C.length > cl.length,
             limit: CHANGES_OF_MAX, wrote: false,
             ...(reg === null ? { editions_read: false } : { editions_read: true }) };
  }

  /* ---------------------------------------------------------------- R10, R11: the cross-version notice (D-394) */

  /** R10–R11: one question (`target=`: every leg of it, those resting on a passage carrying content's notice) or one
   *  passage (`content=`). A READ that writes nothing. `limit` bounds the legs answered for a question, clamped to
   *  1–200, and the applied figure is what is published, with `truncated`. */
  versionNotice({ target = null, content = null, limit = null, viewer = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = VERSION_NOTICE_SUBJECT_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               detail, ...(extra || {}) };
    };
    const tgt = String(target ?? "").trim();
    const cid = String(content ?? "").trim();
    let legs = [], rows = [], truncated = false, inquiry = null;
    /* DEC-49 REGION is-version-notice-subject */
    if ((tgt && cid) || (!tgt && !cid))
      return refusal("VERSION_NOTICE_NO_SUBJECT",
        tgt ? "pass target=<INQ-…> OR content=<content id>, not both: a notice is about one subject."
            : "pass target=<INQ-…> (every passage a question rests on) or content=<content id> (one passage).");
    if (tgt) {
      const b = this.#one(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id=?`, tgt);
      if (!b || normalizeType(b.object_type) !== "inquiry" || !this.#visible(b.bundle_id, viewer))
        return refusal("VERSION_NOTICE_NO_INQUIRY",
          `no question by the id '${tgt.slice(0, 60)}' is readable here. A question you may not see `
          + `answers exactly as one that does not exist.`, { target: tgt });
      inquiry = b.bundle_id;
    } else {
      const passage = this.content.passageNotice({ contentId: cid, viewer });
      if (!passage.ok) return passage;
      const { ok, states, grades, wrote, proposal_only, visible_to, ...notice } = passage;
      rows = [notice];
    }
    /* END DEC-49 REGION is-version-notice-subject */
    const max = clamp(limit, VERSION_NOTICE_LEGS_MAX, VERSION_NOTICE_LEGS_MAX);
    if (inquiry) {
      const page = this.#rows(
        `SELECT b.ord AS ord, b.target_id AS target, b.content_id AS content_id
           FROM inquiry_basis b WHERE b.bundle_id=? ORDER BY b.ord LIMIT ?`, inquiry, max + 1);
      truncated = page.length > max;
      legs = page.slice(0, max);
      const ids = [...new Set(legs.map((l) => l.content_id).filter(Boolean))];
      /* `LIMIT ?` at the id count: the set is already bounded by the leg cap above, and saying so in the SQL is what
         lets a bounds census see it. */
      rows = ids.length
        ? this.#rows(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content
                       WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`, JSON.stringify(ids), ids.length)
        : [];
    }
    const memo = new Map();
    const byId = new Map(rows.map((r) => [r.content_id, inquiry ? this.content.noticeForRow(r, viewer, memo) : r]));
    const notices = inquiry
      ? legs.map((l) => l.content_id && byId.has(l.content_id)
          ? { ord: l.ord, target: l.target, ...byId.get(l.content_id) }
          : { ord: l.ord, target: l.target, content_id: null, state: "not_asked", newer: null,
              says: null, affects: null,
              why: "this leg rests on no cited passage (it cites another question, or a document this record "
                 + "holds no bytes of), so there is no capture whose newer versions could be asked about" })
      : [...byId.values()];
    return {
      ok: true, target: inquiry, content: inquiry ? null : cid,
      notices, count: notices.length, limit: inquiry ? max : 1, truncated,
      states: VERSION_NOTICE_STATES, grades: VERSION_NOTICE_GRADES,
      wrote: false, proposal_only: true,
      visible_to: "the version chains here are the ones visible to you; a version filed in a project you "
        + "were not invited to is not in them",
      says: "a notice, computed now and stored nowhere. A newer version is stated with certainty where the "
        + "version chain was read; a passage at the same extent in it is a CANDIDATE, never the same passage; "
        + "nothing was moved, minted or written, and only a member's act can re-point a citation.",
    };
  }

  /* ---------------------------------------------------------------- R12, R13: the "changed from" audit (D-256) */

  /** R12–R13: every "changed from" sentence already written, checked against the version chain, and not one byte of any
   *  body rewritten (BOB #31, 2026-09-23 22:22Z: the bodies stay as written and the correction is the READ). The
   *  bundle's own version is found from the record (its `register` rows joined to `captured_locators`), never from its
   *  prose; the frontmatter's `content_hash` only breaks a tie. It reads the LIVE bundle.md of every bundle and matches
   *  the literal the writer emitted, so a sentence present only in a superseded snapshot, or retyped in other words, is
   *  not counted. Undetermined is never evidence the sentence was right. */
  changedFromAudit({ limit = null, offset = 0 } = {}) {
    const cap = clamp(limit, CHANGED_FROM_AUDIT_LIMIT_DEFAULT, CHANGED_FROM_AUDIT_LIMIT_MAX);
    const from = Math.max(0, Math.floor(Number(offset) || 0));
    const lit = CHANGED_FROM_SENTENCE;
    const named = new RegExp(lit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^()\\s]+)\\)", "g");
    const rows = this.#rows(
      `SELECT bundle_id, content FROM files WHERE path = 'bundle.md' AND instr(content, ?) > 0
        ORDER BY bundle_id`, lit);
    const out = { wrong: 0, right: 0, undetermined: 0 };
    const all = rows.map((r) => {
      const ids = [...new Set([...String(r.content).matchAll(named)].map((m) => m[1]))];
      const base = { bundle_id: r.bundle_id, named: ids.length === 1 ? ids[0] : null };
      const undetermined = (why, extra = {}) =>
        ({ ...base, verdict: "undetermined", why, predecessor: null, ...extra });
      if (ids.length !== 1) return undetermined(ids.length ? "several_named" : "no_named_id", { named_all: ids });
      const pairs = this.#rows(
        `SELECT DISTINCT cl.address_norm AS address_norm, cl.capture_sha AS capture_sha
           FROM register r JOIN captured_locators cl ON cl.capture_sha = r.capture_sha
          WHERE r.bundle_id = ? ORDER BY cl.address_norm, cl.capture_sha`, r.bundle_id);
      let pair = pairs.length === 1 ? pairs[0] : null;
      if (pairs.length > 1) {
        const h = /^\s*content_hash:\s*"?([0-9a-fA-F]{64})"?\s*$/m.exec(String(r.content));
        const hits = h ? pairs.filter((p) => p.capture_sha === h[1].toLowerCase()) : [];
        pair = hits.length === 1 ? hits[0] : null;
        if (!pair) return undetermined("several_versions_held", { versions_held: pairs.length });
      }
      if (!pair) return undetermined("no_version_held");
      const c = this.provenance.versionChain({ addressNorm: pair.address_norm, at: pair.capture_sha, limit: 1,
                                               viewer: MACHINE_ADMIN });
      if (!c || !c.ok) return undetermined("no_version_held");
      const at = { address_norm: pair.address_norm, capture_sha: pair.capture_sha, at_index: c.at_index };
      if (!c.predecessor) return undetermined("no_prior_version", at);
      const predecessor = { bundle_id: c.predecessor.bundle_id, capture_sha: c.predecessor.capture_sha,
                            first_retrieved: c.predecessor.first_retrieved };
      return { ...base, verdict: c.predecessor.bundle_id === ids[0] ? "right" : "wrong",
               ...at, sole_prior: c.at_index === 1, predecessor };
    });
    for (const a of all) out[a.verdict]++;
    const listed = all.slice(from, from + cap);
    return {
      ok: true,
      affected: all.length,
      wrong: out.wrong, right: out.right, undetermined: out.undetermined,
      bundles: listed, count: listed.length, total: all.length,
      limit: cap, offset: from, truncated: from + listed.length < all.length,
      wrote: false,
      note: "read-only: every body stays as written (BOB #31, 2026-09-23 22:22Z); this answer is the correction. "
        + "'undetermined' is the chain unable to check a sentence, never evidence it was right.",
    };
  }

  /* ---------------------------------------------------------------- R14: the pushed notice (REC-222) */

  /** R14: a bounded sweep over the basis legs that rest on a passage (inquiry R40), in (holder, ord) order after
   *  `after` (`<holder>#<ord>`). For each, content's notice is read as the record holds it (a machine viewer); each
   *  newer capture graded affected or undetermined raises ONE notice per (holder, reference, newer capture), never for A
   *  or B, and never where the chain could not be read (`chain_unread`, K102: a pushed notice needs a newer capture to
   *  exist; the pull read keeps answering it as undetermined by name). A notice once raised, open or closed, is never
   *  raised again; a yet newer capture raises its own. A divided holder's legs are frozen history and raise nothing.
   *  R8's listeners are told of each notice raised, after the sweep's writes commit. */
  raiseNotices({ limit = null, after = null } = {}) {
    const cap = clamp(limit, NOTICE_SWEEP_DEFAULT, NOTICE_SWEEP_MAX);
    const m = /^(.*)#(\d+)$/.exec(String(after ?? ""));
    const [aHolder, aOrd] = m ? [m[1], Number(m[2])] : ["", -1];
    const page = this.#rows(
      `SELECT ib.bundle_id AS holder, ib.ord AS ord, ib.target_id AS target_id, ib.content_id AS content_id
         FROM inquiry_basis ib
        WHERE ib.content_id IS NOT NULL AND ib.content_id <> ''
          AND (ib.bundle_id > ? OR (ib.bundle_id = ? AND ib.ord > ?))
        ORDER BY ib.bundle_id, ib.ord LIMIT ?`, aHolder, aHolder, aOrd, cap + 1);
    const truncated = page.length > cap;
    const legs = page.slice(0, cap);
    const holders = [...new Set(legs.map((l) => l.holder))];
    const divided = new Set(holders.length
      ? this.#rows(`SELECT bundle_id FROM bundles WHERE bundle_id IN (SELECT value FROM json_each(?))
                     AND current_state = 'divided' LIMIT ?`, JSON.stringify(holders), holders.length).map((r) => r.bundle_id)
      : []);
    const ids = [...new Set(legs.map((l) => l.content_id))];
    const rows = new Map((ids.length
      ? this.#rows(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content
                     WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`, JSON.stringify(ids), ids.length)
      : []).map((r) => [r.content_id, r]));
    const memo = new Map(), noticeMemo = new Map();
    const when = this.#when();
    const raised = [];
    let examined = 0, unread = 0;
    this.record.transact(() => {
      for (const l of legs) {
        const row = rows.get(l.content_id);
        if (!row || divided.has(l.holder)) continue;
        examined++;
        let n = noticeMemo.get(l.content_id);
        if (!n) {
          try { n = this.content.noticeForRow(row, MACHINE_ADMIN, memo); } catch { n = null; }
          noticeMemo.set(l.content_id, n);
        }
        if (!n || n.state === "chain_unread") { unread++; continue; }
        for (const c of n.candidates || []) {
          if (!RAISED_ON.includes(c.affects)) continue;
          const id = `RN-${sha256HexSync(`${l.holder}\u0000${l.ord}\u0000${l.content_id}\u0000${c.capture_sha}`).slice(0, 24)}`;
          if (this.#one(`SELECT 1 AS x FROM reevaluation_notices WHERE notice_id=?`, id)) continue;
          this.sql.exec(
            `INSERT INTO reevaluation_notices (notice_id, holder, ord, content_id, target_id, capture_sha, newer_capture,
                                               newer_bundle, grade, affects, raised_at, state)
             VALUES (?,?,?,?,?,?,?,?,?,?,?, 'open')`,
            id, l.holder, l.ord, l.content_id, l.target_id, row.capture_sha, c.capture_sha, c.bundle_id ?? null,
            c.grade ?? null, c.affects, when);
          raised.push({ notice: id, holder: l.holder, ord: l.ord, content_id: l.content_id, target: l.target_id,
                        capture_sha: row.capture_sha, newer_capture: c.capture_sha, grade: c.grade ?? null,
                        affects: c.affects });
        }
      }
      return null;
    });
    const failed = new Set();
    for (const r of raised)
      for (const mod of this.#tell({ kind: "passage", subject: r.content_id, source: "newer_capture", since: when,
                                     detail: `a newer capture of ${r.target} (${r.newer_capture.slice(0, 12)}) grades `
                                           + `this passage ${r.grade ?? "undetermined"} (${r.affects})`,
                                     dependents: [{ bundle_id: r.holder, ord: r.ord }],
                                     captures: { cited: r.capture_sha, newer: r.newer_capture },
                                     grade: r.grade, affects: r.affects, notice: r.notice }))
        failed.add(mod);
    const last = legs.length ? legs[legs.length - 1] : null;
    return { ok: true, examined, chain_unread: unread, raised, count: raised.length, limit: cap, truncated,
             cursor: truncated && last ? `${last.holder}#${last.ord}` : null,
             ...(failed.size ? { listeners_failed: [...failed] } : {}),
             says: "a notice is raised once per question, leg and newer capture, only where the newer version affects "
                 + "the passage or whether it does is undetermined; nothing was moved, and only a member's act moves a "
                 + "reference" };
  }

  #noticeView(r) {
    return { notice: r.notice_id, holder: r.holder, ord: r.ord, content_id: r.content_id, target: r.target_id,
             capture_sha: r.capture_sha, newer_capture: r.newer_capture, newer_bundle: r.newer_bundle,
             grade: r.grade, affects: r.affects, raised_at: r.raised_at, state: r.state,
             closed_by: r.closed_by, closed_at: r.closed_at, why: r.why, adopted_version: r.adopted_version };
  }

  /* R14 (N200): whether the viewer sees a capture, by the gate `versionChain` reads it through (provenance R17): some
     bundle registering it is one the viewer may see. Memoised for the one answer it serves. */
  #captureSeer(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return () => true;          /* a machine credential: not filtered */
    if (g.scope === "DENY") return () => false;
    const memo = new Map();
    return (sha) => {
      if (!sha) return false;
      if (!memo.has(sha))
        memo.set(sha, !!this.#one(`SELECT 1 AS x FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
                                    WHERE r.capture_sha=? AND (${g.sql}) LIMIT 1`, sha, ...g.args));
      return memo.get(sha);
    };
  }

  /** R14: the notices raised, for the queue that renders them: by holder or all, open unless `state` names another,
   *  in holder then id order after `after`, at most `limit` (default 200, most 1,000), `truncated`. A notice whose holder
   *  the viewer may not see is withheld and not counted; its newer bundle, if unseen, is null. A viewer who does not
   *  see the newer capture's project is given its `newer_capture`, `grade` and `affects` as absent, as
   *  `op=versionnotice` withholds that version (N200, K224). */
  notices({ holder = null, state = "open", after = null, limit = null, viewer = null } = {}) {
    const cap = clamp(limit, NOTICES_LIMIT_DEFAULT, NOTICES_LIMIT_MAX);
    const h = str(holder);
    const st = ["open", "adopted", "kept", "all"].includes(state) ? state : "open";
    const g = viewerPredicate(viewer);
    const rows = this.#rows(
      `SELECT n.* FROM reevaluation_notices n JOIN bundles b ON b.bundle_id = n.holder
        WHERE (${g.sql}) AND (? IS NULL OR n.holder = ?) AND (? = 'all' OR n.state = ?) AND n.notice_id > ?
        ORDER BY n.notice_id LIMIT ?`, ...g.args, h, h, st, st, String(after ?? ""), cap + 1);
    const visible = this.#redactor(viewer);
    const seesCapture = this.#captureSeer(viewer);
    const list = rows.slice(0, cap).map((r) => ({ ...this.#noticeView(r), newer_bundle: visible(r.newer_bundle),
      ...(seesCapture(r.newer_capture) ? {} : { newer_capture: null, grade: null, affects: null }) }));
    return { ok: true, notices: list, count: list.length, limit: cap, truncated: rows.length > cap,
             cursor: rows.length > cap ? list[list.length - 1].notice : null, state: st };
  }

  /* ---------------------------------------------------------------- R25: the notice sweep's due, wake and tick */

  /* R25: where the pass stands (`reevaluation_sweep`); an absent row is no pass yet complete and no receipt counted. */
  #sweepRow() {
    return this.#one(`SELECT cursor, pass_began, pass_seq, complete_began, complete_seq, receipt_seq
                        FROM reevaluation_sweep WHERE id = 1 LIMIT 1`)
      || { cursor: null, pass_began: null, pass_seq: null, complete_began: null, complete_seq: null, receipt_seq: 0 };
  }

  #sweepWrite(row) {
    this.sql.exec(`INSERT INTO reevaluation_sweep (id, cursor, pass_began, pass_seq, complete_began, complete_seq, receipt_seq)
                   VALUES (1,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET cursor=excluded.cursor, pass_began=excluded.pass_began,
                     pass_seq=excluded.pass_seq, complete_began=excluded.complete_began,
                     complete_seq=excluded.complete_seq, receipt_seq=excluded.receipt_seq`,
                  row.cursor, row.pass_began, row.pass_seq, row.complete_began, row.complete_seq, row.receipt_seq);
  }

  /* R25: a receipt was written: the count moves. Not a service: it is the listener the factory registers with
     provenance's `onReceipt`, run inside the receipt's own transaction. */
  receiptSeen() {
    this.sql.exec(`INSERT INTO reevaluation_sweep (id, receipt_seq) VALUES (1, 1)
                   ON CONFLICT(id) DO UPDATE SET receipt_seq = receipt_seq + 1`);
  }

  /* R25: pending while a pass is part-way, when a receipt was counted since the last complete pass began, or, with no
     pass yet complete, when any basis leg rests on a passage. */
  #sweepPending(row = this.#sweepRow()) {
    if (row.pass_began !== null) return true;
    if (row.complete_began !== null) return Number(row.receipt_seq) > Number(row.complete_seq ?? 0);
    return !!this.#one(`SELECT 1 AS x FROM inquiry_basis WHERE content_id IS NOT NULL AND content_id <> '' LIMIT 1`);
  }

  /* R25: the sweep delay, the instance binding `REEVAL_NOTICE_DELAY_MS` when it reads as a number >= 0. */
  #sweepDelayMs() {
    const raw = this.env.REEVAL_NOTICE_DELAY_MS;
    const v = raw === null || raw === undefined || String(raw).trim() === "" ? NaN : Number(raw);
    return Number.isFinite(v) && v >= 0 ? v : REEVAL_NOTICE_DELAY_MS;
  }

  /** R25: `now` while the sweep is pending, else null. Synchronous; writes nothing; never throws. */
  noticeSweepDue(now) {
    try { return this.#sweepPending() ? now : null; } catch { return null; }
  }

  /** R25: `now` plus the sweep delay while the sweep is pending, else null. Synchronous; writes nothing; never throws. */
  noticeSweepWake(now) {
    try { return this.#sweepPending() ? Number(now) + this.#sweepDelayMs() : null; } catch { return null; }
  }

  /** R25: one batch of R14's sweep at the default limit, where the pass stands (a pass begins when none is part-way),
   *  answered as that batch's `raiseNotices` answer; a batch whose `cursor` is null completes the pass. Not pending, it
   *  runs nothing and answers `{pending: false}`. `now` (ms) stamps when a pass began. */
  noticeSweep(now) {
    const row = this.#sweepRow();
    if (!this.#sweepPending(row)) return { pending: false };
    const ms = Number(now);
    const began = row.pass_began !== null ? row.pass_began
      : Number.isFinite(ms) ? new Date(ms).toISOString().replace(/\.\d+Z$/, "Z") : this.#when();
    const pass = row.pass_began !== null ? { began, seq: row.pass_seq ?? 0, after: row.cursor }
      : { began, seq: Number(row.receipt_seq) || 0, after: null };
    const batch = this.raiseNotices({ after: pass.after });
    /* The count read now: a receipt counted during the batch stays counted. */
    const seq = this.#sweepRow().receipt_seq;
    this.#sweepWrite(batch.cursor
      ? { ...row, receipt_seq: seq, cursor: batch.cursor, pass_began: pass.began, pass_seq: pass.seq }
      : { ...row, receipt_seq: seq, cursor: null, pass_began: null, pass_seq: null,
          complete_began: pass.began, complete_seq: pass.seq });
    return batch;
  }

  /* ---------------------------------------------------------------- R15: the member's choice (REC-223) */

  /* C-110's refusal with its row. */
  #refuse(code, detail, extra = {}) {
    const row = rowOf(code);
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
  }

  /* R15: the notice an act names, seen through its holder; a machine is refused first. */
  #choiceSubject(machineCode, notice, author, viewer) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-version-choice */
    if (!who || isMachineIdentity(who))
      return { refusal: this.#refuse(machineCode,
        who ? `'${who.slice(0, 60)}' is a machine identity.` : "no member is named as the one choosing.") };
    const id = String(notice ?? "").trim();
    const r = id ? this.#one(`SELECT * FROM reevaluation_notices WHERE notice_id=?`, id) : null;
    if (!r || !this.#visible(r.holder, viewer))
      return { refusal: this.#refuse("VERSION_NOTICE_NOT_FOUND",
        `no notice by the id '${id.slice(0, 60)}' is readable here.`, { notice: id || null }) };
    if (r.state !== "open")
      return { refusal: this.#refuse("VERSION_NOTICE_CLOSED",
        `${id} was answered ${r.state === "adopted" ? "by adopting the newer version" : "by keeping the earlier version"} `
        + `by ${r.closed_by} at ${r.closed_at}.`, { notice: id, state: r.state }) };
    /* END DEC-49 REGION is-version-choice */
    return { who, r };
  }

  /** R15: ADOPT writes a new version of the reference pinned to the newer capture, the old staying readable: for a
   *  basis leg, a new basis version through `basis-versions` (its R28), holding the question's live legs as written with
   *  this one re-pinned (its grade is not carried: it was given to the earlier passage). The live basis is untouched.
   *  The version and the notice's closing land together or neither does. */
  adoptVersion({ notice = null, author = null, viewer = null } = {}) {
    const s = this.#choiceSubject("MACHINE_CANNOT_ADOPT_VERSION", notice, author, viewer);
    if (s.refusal) return s.refusal;
    const { who, r } = s;
    const fm = this.#frontmatterOf(r.holder);
    const legs = this.#basisFrontmatter(fm);
    const leg = legs[r.ord];
    /* DEC-49 REGION is-version-adoptable */
    if (!fm || !leg || leg.target !== r.target_id)
      return this.#refuse("VERSION_ADOPT_UNWRITABLE",
        `${r.holder} no longer holds leg ${r.ord} on ${r.target_id} as this notice read it, so there is no reference to `
        + `move. Nothing was written.`, { notice: r.notice_id });
    const old = this.#one(`SELECT extent_kind, extent FROM content WHERE content_id=?`, r.content_id);
    let extent = null;
    try { extent = old && old.extent ? JSON.parse(old.extent) : null; } catch { extent = null; }
    /* The newer capture's home: the version chain is per address, so the newer version may be filed in another bundle,
       and a leg names the document its capture is held in (content R27). */
    const home = r.newer_bundle || r.target_id;
    const held = old ? this.#one(`SELECT content_id FROM content WHERE capture_sha=? AND extent=? AND bundle_id=?
                                   ORDER BY content_id LIMIT 1`, r.newer_capture, old.extent, home) : null;
    const when = this.#when();
    /* Every leg as the live basis holds it; the adopted one re-pinned. A content id is a hash over its capture, so the
       adopted leg names the newer capture's row where the record holds one at the same extent, else the extent itself
       with `extent_capture` (inquiry R5: never both). */
    const KEEP = ["target", "role", "grade", "grade_axis", "grade_source", "note", "date", "author", "ground",
                  "target_edition", "content_id", "extent_capture"];
    const copy = (l) => {
      const o = {};
      for (const [k, v] of Object.entries(l)) if ((KEEP.includes(k) || k.startsWith("extent_")) && v !== undefined && v !== null && v !== "") o[k] = v;
      return o;
    };
    const vlegs = legs.map((l, i) => {
      if (i !== r.ord) return copy(l);
      const o = { target: home };
      for (const k of ["role", "note", "ground", ...(home === l.target ? ["target_edition"] : [])])
        if (l[k] !== undefined && l[k] !== null && l[k] !== "") o[k] = l[k];
      if (held) o.content_id = held.content_id;
      else {
        const kind = (extent && extent.kind) || old?.extent_kind || "document";
        if (kind !== "document") {
          o.extent_kind = kind;
          for (const [k, v] of Object.entries(extent || {})) if (k !== "kind" && v !== undefined && v !== null) o[`extent_${k}`] = v;
        }
        o.extent_capture = r.newer_capture;
      }
      return o;
    });
    /* A version carries its partition (C-25.5): the live grounds as authored, or every leg in one ground the adopting
       member asserts, composing as `and`. */
    const labels = new Set(vlegs.map((l) => (typeof l.ground === "string" ? l.ground.trim() : "")).filter(Boolean));
    let grounds;
    if (labels.size && vlegs.every((l) => typeof l.ground === "string" && l.ground.trim())) {
      const rowsG = Array.isArray(fm.grounds) ? fm.grounds.filter((g) => g && typeof g === "object") : [];
      grounds = [...labels].map((g) => {
        const d = rowsG.find((x) => String(x.ground ?? "").trim() === g) || {};
        return { ground: g, asserted_by: d.asserted_by ?? who, at: d.at ?? when,
                 ...(d.statement ? { statement: d.statement } : {}) };
      });
    } else {
      for (const l of vlegs) l.ground = "all";
      labels.clear(); labels.add("all");
      grounds = [{ ground: "all", asserted_by: who, at: when,
                   statement: "every leg is needed, as the live basis holds them" }];
    }
    if (![...labels].every((g) => GROUND_LABEL_RE.test(g)))
      return this.#refuse("VERSION_ADOPT_UNWRITABLE",
        `${r.holder}'s grounds carry a label a version cannot hold, so the newer version could not be written. `
        + `Nothing was written.`, { notice: r.notice_id });
    const names = new Set((Array.isArray(fm.basis_versions) ? fm.basis_versions : [])
      .map((v) => String(v && v.name ? v.name : "").trim().toLowerCase()));
    let name = `adopt-${r.newer_capture.slice(0, 8)}-${r.ord}`;
    for (let k = 2; names.has(name.toLowerCase()); k++) name = `adopt-${r.newer_capture.slice(0, 8)}-${r.ord}-${k}`;
    if (!VERSION_NAME_RE.test(name))
      return this.#refuse("VERSION_ADOPT_UNWRITABLE", `no version name could be formed for ${r.holder}.`, { notice: r.notice_id });
    /* END DEC-49 REGION is-version-adoptable */
    const description = `Adopts a newer version of ${r.target_id}${home !== r.target_id ? ` (held as ${home})` : ""}: leg ${r.ord} rests on capture `
      + `${r.newer_capture.slice(0, 12)} in place of ${r.capture_sha.slice(0, 12)} (notice ${r.notice_id}). `
      + `Every other leg is as the live basis holds it.`;
    const answer = this.record.transact(() => {
      const w = this.basisVersions.appendVersion({
        target: r.holder, version: { name, description, relationship: labels.size > 1 ? "or" : "and" },
        grounds, legs: vlegs, author: who, at: when,
        log: `### Session ${when} | Newer version adopted | ${who}\n`
           + `Trigger: adoptVersion on ${r.notice_id}\n`
           + `Changes: reading '${name}' added, in state suggested: leg ${r.ord} pinned to capture ${r.newer_capture}; `
           + `the live basis is unchanged.\n` });
      /* basis-versions' own refusal passes through as it came; no answer at all is this module's C-110.9 (N182 (4)). */
      if (w && !w.ok) return { ...w, ok: false, notice: r.notice_id };
      if (!w) return this.#refuse("VERSION_ADOPT_UNWRITABLE", `the newer version of ${r.holder} could not be written. `
        + `Nothing was written.`, { notice: r.notice_id });
      this.sql.exec(`UPDATE reevaluation_notices SET state='adopted', closed_by=?, closed_at=?, adopted_version=?
                      WHERE notice_id=? AND state='open'`, who, when, name, r.notice_id);
      return { ok: true, bundleSha: w.bundleSha ?? null };
    });
    if (!answer.ok) return answer;
    return { ok: true, notice: r.notice_id, holder: r.holder, ord: r.ord, act: "adopted", author: who, at: when,
             capture_sha: r.capture_sha, newer_capture: r.newer_capture, version: name, state: "suggested",
             bundleSha: answer.bundleSha,
             ...(legs[r.ord].grade ? { grade_not_carried: { grade: legs[r.ord].grade,
               why: "the grade was given to the passage in the earlier capture; the newer passage is not graded until a "
                  + "member grades it" } } : {}),
             says: `a new reading of ${r.holder} rests leg ${r.ord} on the newer capture; the live basis and every earlier `
                 + `reading are unchanged and readable, and the new reading is suggested until a member accepts it` };
  }

  /** R15: KEEP records "stays on the earlier version" with who, when, the optional why and both captures. */
  keepVersion({ notice = null, why = null, author = null, viewer = null } = {}) {
    const s = this.#choiceSubject("MACHINE_CANNOT_KEEP_VERSION", notice, author, viewer);
    if (s.refusal) return s.refusal;
    const { who, r } = s;
    const text = why == null ? null : String(why).trim() || null;
    if (text !== null && (text.length > NOTE_MAX || UNSTORABLE.test(text)))
      return this.#refuse("VERSION_CHOICE_WHY_MALFORMED",
        `the reason is ${text.length} characters (at most ${NOTE_MAX}), or holds a quote, backslash or line break.`,
        { notice: r.notice_id, limit: NOTE_MAX });
    const when = this.#when();
    this.sql.exec(`UPDATE reevaluation_notices SET state='kept', closed_by=?, closed_at=?, why=?
                    WHERE notice_id=? AND state='open'`, who, when, text, r.notice_id);
    return { ok: true, notice: r.notice_id, holder: r.holder, ord: r.ord, act: "kept", author: who, at: when,
             why: text, capture_sha: r.capture_sha, newer_capture: r.newer_capture,
             says: `${r.holder}'s leg ${r.ord} stays on the earlier version (${r.capture_sha.slice(0, 12)}); the newer `
                 + `capture (${r.newer_capture.slice(0, 12)}) will not raise this notice again` };
  }

  /* ---------------------------------------------------------------- R16: a recorded re-evaluation */

  /** R16: a member's recorded re-evaluation of `dependent` against one standing cause (`target`, `source`, and, when
   *  given, its `since`), closing that cause for that dependent until the target moves again (a later `since`). The
   *  cause is read now, from the obligation; the caller's `since` only confirms which one is meant. */
  recordReevaluation({ dependent = null, target = null, source = null, since = null, note = null, author = null,
                       viewer = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-reevaluation-record */
    if (!who || isMachineIdentity(who))
      return this.#refuse("MACHINE_CANNOT_RECORD_REEVALUATION",
        who ? `'${who.slice(0, 60)}' is a machine identity.` : "no member is named as the one who looked again.");
    const text = String(note ?? "").trim();
    if (!text || text.length > NOTE_MAX || UNSTORABLE.test(text))
      return this.#refuse("REEVALUATION_NOTE_MALFORMED",
        !text ? "pass note=<what was looked at and what was decided>."
              : `the note is ${text.length} characters (at most ${NOTE_MAX}), or holds a quote, backslash or line break.`,
        { limit: NOTE_MAX });
    const dep = str(dependent), tgt = str(target), src = str(source);
    const noCause = (detail) => this.#refuse("REEVALUATION_NO_SUCH_CAUSE", detail,
      { dependent: dep, target: tgt, source: src });
    if (!dep || !tgt || !src || !CAUSE_SOURCES.includes(src))
      return noCause("pass dependent=<the finding looked at>, target=<what moved under it> and source=<one of "
                     + `${CAUSE_SOURCES.join(", ")}>.`);
    if (!this.#visible(dep, viewer)) return noCause(`no finding by the id '${dep.slice(0, 60)}' is readable here.`);
    const ob = (this.#visible(tgt, viewer) || tgt === dep)
      ? this.reevaluations({ target: tgt, viewer }) : { ok: true, obligations: [] };
    const hit = ob.ok ? (ob.obligations || []).find((o) => o.bundle_id === dep && o.target === tgt) : null;
    const cause = hit ? hit.causes.find((c) => c.source === src && (since == null || String(c.since) === String(since))) : null;
    if (!cause)
      return noCause(`nothing owed on ${dep} for ${tgt} (${src}${since != null ? ` since ${since}` : ""}) is standing now.`);
    /* END DEC-49 REGION is-reevaluation-record */
    const when = this.#when();
    this.sql.exec(`INSERT INTO reevaluation_records (dependent, target, source, since, note, author, at)
                   VALUES (?,?,?,?,?,?,?)`, dep, tgt, src, cause.since ?? null, text, who, when);
    return { ok: true, dependent: dep, target: tgt, source: src, since: cause.since ?? null, note: text,
             author: who, at: when, closed: true,
             says: `the ${src} cause on ${dep} from ${tgt} is recorded as looked at again by ${who}; it is owed again `
                 + `only when ${tgt} moves again` };
  }

  /* ---------------------------------------------------------------- R22: C-10.1 at the write and in the audit */

  /** R22: the promotion check (promotion R39): C-10.1's errors refuse a promotion that is not a replay; its warnings and
   *  infos are the audit's. */
  check(c) {
    if (!c || c.replay || (c.pkg && c.pkg.replay)) return null;
    const md = Array.isArray(c.files) ? c.files.find((f) => f && f.path === "bundle.md") : null;
    if (!md || typeof md.text !== "string") return null;
    let fm = null;
    try { fm = parseFrontmatter(md.text).data; } catch { fm = null; }
    if (!fm) return null;
    const errs = checkReevalPending(fm, { nowMs: Date.parse(this.#when()) || Date.now() })
      .filter((x) => x.severity === "error");
    if (!errs.length) return null;
    return { ok: false, reason: "REEVAL_PENDING_REFUSED",
             detail: "the document's reeval_pending field is not a shape the record can read. Nothing was written.",
             findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
  }

  /** R22: the audit check (record-core R59) over one image: every C-10.1 finding of its bundle.md. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    const md = files ? files.get("bundle.md") : null;
    const text = typeof md === "string" ? md : md instanceof Uint8Array ? new TextDecoder().decode(md) : null;
    if (text === null) return [];
    let fm = null;
    try { fm = parseFrontmatter(text).data; } catch { fm = null; }
    return fm ? checkReevalPending(fm) : [];
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its tables and declares them to
 *  purge (K23), fills the registrations `inquiry` and `promotion` offer (R7), and registers C-10.1 (R22). */
export function reevaluationOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    r = new Reevaluation({ ...d, host, storage, record, membership, promotion });
    instances.set(host, r);
    r.migrate();
    record.declarePurge("reevaluation", REEVALUATION_TABLES);
    /* R7: a deferral, a division and a re-read, through inquiry's registration (its R42): it answers the dependents. */
    r.inquiry.onRaised("reevaluation", ({ target, cause, since, viewer }) =>
      r.raise({ target, source: cause, since, viewer }).raised);
    /* R7: a reopening, through promotion's (its R46): the answer joins reopen's reply under this module's id. */
    promotion.onReopened("reevaluation", ({ target, at, viewer }) => r.raise({ target, source: "reopened", since: at, viewer }));
    promotion.registerStep("reevaluation", { check: (c) => r.check(c) });
    record.registerAuditCheck("reevaluation", (image) => r.audit(image));
    /* R25: a receipt makes the notice sweep pending again (provenance R47). */
    r.provenance.onReceipt("reevaluation", () => r.receiptSeen());
  }
  return r;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function reevaluationOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return REEVALUATION_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the legacy store's op map. `viewer` and `author` are the control plane's stamps,
 *  read from the query after the body, so a caller's own copy never wins. */
export function reevaluationOps(r, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    reevaluations: () => r.reevaluations({ target: q("target"), viewer: q("viewer") }),
    versionnotice: () => r.versionNotice({ target: q("target"), content: q("content"), limit: q("limit"),
                                           viewer: q("viewer") }),
    changedfromaudit: () => r.changedFromAudit({ limit: q("limit"), offset: q("offset") }),
    reevaluationchanges: () => r.changesOf({ findings: b.findings ?? q("findings"), contents: b.contents ?? q("contents"),
                                             viewer: q("viewer") }),
    reevaluationraise: () => r.raiseNotices({ limit: q("limit") ?? b.limit, after: q("after") ?? b.after }),
    reevaluationnotices: () => r.notices({ holder: q("holder"), state: q("state") || "open", after: q("after"),
                                           limit: q("limit"), viewer: q("viewer") }),
    versionadopt: () => r.adoptVersion({ notice: b.notice ?? q("notice"), author: q("author"), viewer: q("viewer") }),
    versionkeep: () => r.keepVersion({ notice: b.notice ?? q("notice"), why: b.why ?? q("why"), author: q("author"),
                                       viewer: q("viewer") }),
    reevaluationrecord: () => r.recordReevaluation({ ...b, dependent: b.dependent ?? q("dependent"),
                                                     target: b.target ?? q("target"), source: b.source ?? q("source"),
                                                     since: b.since ?? q("since"), note: b.note ?? q("note"),
                                                     author: q("author"), viewer: q("viewer") }),
  };
}
