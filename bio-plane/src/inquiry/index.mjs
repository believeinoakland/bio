/* inquiry — the one recursive object of case-making (requirements: `build/requirements/inquiry.md`). A question, which
 * gathers evidence and other inquiries as the legs of its basis, and may reach a conclusion. This module holds the
 * inquiry's lifecycle and its grammar (the public face of `inquiry-grammar`'s rules, `./grammar.mjs`), the basis legs and
 * what the record can earn for each (the earned registry, R13–R15), the ground partition (DEC-32), the exclusions a
 * completeness statement names, supersession and division. It holds no version of a basis, no conclusion and no
 * strength: those are `basis-versions`' and `strength`'s, which read what this module holds.
 *
 * Extracted from the legacy modules (T7, layer 6; K3, K64, K83, K102, N55, N56): `store.mjs` (REC-11's basis projection
 * and cycle guard, REC-14's exclusions, REC-16's division, REC-17's live-leg predicate and superseded-by index, REC-18's
 * earned registry with REC-83/REC-88/MK-2's arms, REC-45's grounding, S-11's disposition, REC-82/REC-84's leg content,
 * REC-220's leg versions, REC-173's replay row), `schema.mjs` (the three tables, now `./schema.mjs`). The leg and entry
 * grammar is `inquiry-grammar`'s since T19 (moved from the catalogue, K766), judged at the write synchronously (R11);
 * `./grammar.mjs` is its one public face here. The legacy code's comments moved with it, shortened where they only
 * restated it.
 *
 * REACHED as `inquiryOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first call
 * with `deps`, returned to every later caller. At creation it declares its tables to purge (R36), joins every promotion
 * (R11's check, R12's projection) and every re-read that stales content (content R41's `onStale`), and registers with
 * retrieval the `legs` field's relation (R36, its R62) and the migrated arm of `surfaced_in` (N405, its R56). Its
 * questions' findings are bias's work products (R53, bias R40) through `inquiryFindings`, which `plane` registers.
 * `deps`:
 *   record, membership, promotion, content, connections, entities, retrieval, provenance   the modules it uses,
 *                through their factories on the same host unless a test passes its own (connections, entities,
 *                retrieval and provenance are reached lazily, on first use).
 *   bias         the host's bias instance the lens of a finding is read from (R53); else the one `inquiryFindings` binds,
 *                and with neither a finding records no lens. Never created here: the host builds bias with its `env`.
 *   now          the module's clock, an ISO instant at second precision (default: the wall clock). */

import { parseFrontmatter, normalizeType, OBJECT_TYPES, STATES, vocabFor, deriveInquiryTitle, BUNDLE_ID_RE,
         isMachineIdentity, createSha256, BASIS_GRADES, EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE, TESTIMONY_GRADE,
         SHARED_ACT_CHECKS } from "../record-grammar/index.mjs";
import { checkInquiryBasis, checkInquiryExtension, supersedesEdgeFindings, divisionDisclosureFindings, INQUIRY_ROWS }
  from "./grammar.mjs";
import { INQUIRY_GRAMMARS, parseImportedFindingRef } from "../inquiry-grammar/index.mjs";
import { captureBound, isTranscribed } from "../textchain.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal } from "../membership/index.mjs";
import { promotionOf, stepContext, PROMOTION_ROW_CHECKS } from "../promotion/index.mjs";
import { contentOf, CONTENT_EXTENT_CHECKS, CONTENT_MINTED_BY_PLANE, canonicalExtent, legContentId }
  from "../content/index.mjs";
import { connectionsOf, refsReplacedOf } from "../connections/index.mjs";
import { entitiesOf, gradeRank } from "../entities/index.mjs";
import { retrievalOf } from "../retrieval/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { notADisposition, DISPOSITIONS } from "../progressions/index.mjs";
import { INQUIRY_TABLES, INQUIRY_PURGE, migrateInquiry, BUNDLE_FACTS, LEGS_RELATION } from "./schema.mjs";
import { INQUIRY_CONTRADICTION_CHECKS, INQUIRY_SURFACE_CHECKS } from "./checks.mjs";
import { checkInquiryEntry } from "./grammar.mjs";
import { contradictionFindings, candidateOf, readResolution, exploresOf, CANDIDATE_RE } from "./contradiction.mjs";
import { setScalar, setOrAddScalar, appendStateHistory, removeBlock, setOrAddBlock, setSection, appendSessionLog,
         spliceBasisGround, blockEntries, fmSafe, rand } from "./text.mjs";

export { INQUIRY_SCHEMA, INQUIRY_TABLES, BUNDLE_FACTS, LEGS_RELATION, SUBJECT_COLUMN, moveBundleFacts, moveSubjectEntity }
  from "./schema.mjs";
export * from "./grammar.mjs";
export { INQUIRY_CONTRADICTION_CHECKS, INQUIRY_SURFACE_CHECKS } from "./checks.mjs";
export { CONTRADICTION_COORDINATES, PLURALITY_DIFFERENCES, DISSOLVED_BY, NORM_CANONS, RESOLUTION_KINDS, resolutionFamily,
         resolutionLines, CANDIDATE_RE, QUALIFIER_MAX, HYPOTHESIS_MAX } from "./contradiction.mjs";

/** R20, R27, R9: a reason's bound (the edge-reason bound, K57: each module holds its own copy) and the longer bound on a
 *  division's or a grouping's reason and a child's question, which are accounts rather than labels. */
export const EDGE_REASON_MAX = 160;
export const RELEASE_ACK_MAX = 500;
/** R15: how many legs one `earnedBasis` read backfills, and how many targets it answers. */
export const LEG_BACKFILL_MAX = 50;
export const EARNED_TARGETS_MAX = 200;
/** R15: how many ids one statement binds in `#legVersions` (D-36's variable ceiling); this module's own copy of the
 *  bound retrieval holds for its selections, which is not a service it provides (K57). */
const ID_CHUNK = 64;
/** R39 (N183): the projects drawing on one member a refusal names, at most, the first by id (basis-versions R37's
 *  bound); deciding "more than one" is never cut by it. */
export const PROJECTS_DRAWING_MAX = 32;
/** R41, R18 (N183): the most legs, stale rows past a notice's bound, or exclusions one statement reads. */
export const STALE_PAGE = 500;
/** R44 (N149): the longest member-browser agent recorded; a longer or unprintable stamp is not an agent to present. */
export const MEMBER_AGENT_MAX = 512;
const agentOf = (v) => {
  const t = typeof v === "string" ? v.trim() : "";
  return t && t.length <= MEMBER_AGENT_MAX && !/[\u0000-\u001f\u007f]/.test(t) ? t : null;
};
/** R20 (N285): the two dispositions, `progressions`' one list (its R35), re-exported for `affordances` (K78 (3)); this
 *  module holds no copy of its own. */
export { DISPOSITIONS };

/** R39 (K102, K107 (3)): the refusal of a disposition a second team's stance would feel, its row held here (K174's
 *  pattern, the catalogue untouched). */
export const INQUIRY_DISPOSE_CHECKS = {
  DRAWN_ON_BY_SEVERAL_PROJECTS: {
    check: 'C-106.1',
    where: 'src/inquiry/index.mjs #dispose > is-dispose-shared',
    translation: 'More than one project draws on this question, and setting it down here would set it down for '
      + 'every one of them. One team\'s disposition never moves another team\'s stance: set it aside for your own '
      + 'project instead, which leaves the question where the other projects have it.',
  },
};

/** R13 (provenance R26, R51; K538): the capture-grade bases whose bytes no fetch measured, on which a leg keeps its
 *  author's letter under the ceiling, stated as authored: no recorded route, and material received through the
 *  doorbell. */
export const AUTHORED_ROUTE_BASES = Object.freeze(["CAPTURE_ROUTE_UNRECORDED", "CAPTURE_RECEIVED_NOT_FETCHED"]);

/* §8.1's rank (entities' `gradeRank`): A strongest. */
const GRADE_RANK = gradeRank;
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
/** R4, R12 (N522): a leg's target that is an imported finding reference (`inquiry-grammar` R11), another group's finding
 *  rather than a bundle of this record: never in `references[]`, no content row, projected as spelled. */
const isImportedRef = (t) => typeof t === "string" && parseImportedFindingRef(t) !== null;

/** The catalogue row a refusal code has, if any: its check id and canned translation travel with it (DEC-49). */
const ROW_FAMILIES = [INQUIRY_ROWS, SHARED_ACT_CHECKS, INQUIRY_DISPOSE_CHECKS, INQUIRY_CONTRADICTION_CHECKS,
                      INQUIRY_SURFACE_CHECKS];
function withRow(answer) {
  if (!answer || answer.ok !== false || typeof answer.reason !== "string" || answer.check) return answer;
  const row = ROW_FAMILIES.map((f) => f && f[answer.reason]).find((r) => r && r.check);
  return row ? { ...answer, check: row.check, translation: row.translation } : answer;
}

/** R14: ONE leg's capture letter against what the record can earn for its target (the registry's own entry). Null when
 *  the stated grade is within it (or the registry states no ceiling); otherwise the earned grade and why; a ceiling the
 *  record cannot determine answers a null grade with the reason. */
export function legCapped(stated, earned, targetId) {
  if (!earned || earned.mode !== "ceiling") return null;
  if (earned.grade == null)
    return { grade: null,
             why: earned.why
               ?? `what this document's capture can support is undetermined, so this leg claims nothing `
                + `on the capture axis` };
  if (GRADE_RANK[stated] <= GRADE_RANK[earned.grade]) return null;
  /* The letters are interpolated and never typed: the grade vocabulary is their one home. */
  return { grade: earned.grade,
           why: `the record can support no more than ${earned.grade} for ${targetId}, so this leg `
              + `is read at ${earned.grade} here and not at the ${stated} it carries. `
              + `${earned.why ?? ""}`.trimEnd() };
}

/** R16: the superseded-by column read back as a list; ONE parser, so no caller splits the string itself. */
export function supersededByOf(row) {
  const v = row && typeof row.inquiry_superseded_by === "string" ? row.inquiry_superseded_by : "";
  return v ? v.split(",").filter((x) => x !== "") : [];
}

/** R45 (D-484 / C-33.40, N186): the one site at which the plane says a thing the record would stand behind rests on
 *  nothing; `basis-versions` answers through it too. `extra` adds the caller's fields and never replaces these. */
export function actNoBasis(detail, extra = {}) {
  /* DEC-49 REGION is-act-no-basis */
  const row = SHARED_ACT_CHECKS.NO_BASIS;
  return { ...(extra && typeof extra === "object" ? extra : {}),
           ok: false, reason: "NO_BASIS", code: "NO_BASIS", check: row.check, translation: row.translation, detail };
  /* END DEC-49 REGION is-act-no-basis */
}

/* The files of a bundle other than bundle.md, carried unchanged into its next promotion. */
function carriedFiles(sql, bundleId) {
  const carried = [];
  for (const r of sql.exec(
    `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, bundleId))
    carried.push(r.content !== null
      ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
      : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });
  return carried;
}
const mdFile = (text) => {
  const bytes = new TextEncoder().encode(text);
  return { path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() };
};

/* R24 (N360): a leg's lines rebuilt from its parsed fields, for the one case `divide` cannot copy them from the parent's
   bytes (a replayed shape whose block does not line up with its legs): every field of the leg grammar, the passage it
   names (`content_id`, each `extent_*` field, the capture it was made against) among them. A list is written inline. */
const LEG_FIELDS = ["target", "role", "grade", "grade_axis", "grade_source", "target_edition", "author", "date", "ground"];
function legRebuilt(l) {
  const val = (v) => (Array.isArray(v) ? `[${v.map((x) => fmSafe(x).replace(/[,[\]]/g, " ")).join(", ")}]`
    : typeof v === "string" && /[:#"'\[\]{},]|^\s|\s$|^$/.test(v) ? `"${fmSafe(v)}"` : String(v));
  const keys = [...LEG_FIELDS.filter((k) => k !== "target" && k !== "role"),
                ...Object.keys(l).filter((k) => k === "content_id" || k.startsWith("extent_")).sort()];
  return [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
    ...keys.filter((k) => l[k] !== undefined && l[k] !== null && l[k] !== "").map((k) => `    ${k}: ${val(l[k])}`),
    ...(typeof l.note === "string" ? [`    note: "${fmSafe(l.note)}"`] : [])];
}

/* R42 (N422): `base` with a `listeners_failed` key read through `failed()` whenever the object is read: present, as the
   list `failed()` answers, exactly while that list is not empty; every other key is `base`'s own. */
const LISTENERS_FAILED = "listeners_failed";
function liveFailures(base, failed) {
  const now = () => { const f = failed(); return f.length ? f : null; };
  return new Proxy(base, {
    get: (t, k, rcv) => (k === LISTENERS_FAILED ? (now() ?? undefined) : Reflect.get(t, k, rcv)),
    has: (t, k) => (k === LISTENERS_FAILED ? now() !== null : Reflect.has(t, k)),
    ownKeys: (t) => [...Reflect.ownKeys(t).filter((k) => k !== LISTENERS_FAILED), ...(now() ? [LISTENERS_FAILED] : [])],
    getOwnPropertyDescriptor: (t, k) => {
      if (k !== LISTENERS_FAILED) return Reflect.getOwnPropertyDescriptor(t, k);
      const f = now();
      return f ? { value: f, writable: true, enumerable: true, configurable: true } : undefined;
    },
  });
}

/** R53: a promotion's author as a member id (`member:<id>`, as the control plane stamps it), else null: a machine or
 *  an unreadable author is no principal a bias debt names. */
const MEMBER_AUTHOR = /^member:([A-Za-z0-9._:-]{1,128}?)(?:\/.*)?$/;
/** R53: the key a finding is offered to bias under, its question's id behind a prefix no run id shares (bias keys every
 *  debt by its work product's key alone). */
const FINDING_KEY = "finding:";

/* ------------------------------------------------------------------ the module */

export class Inquiry {
  #onRaised = null;      // {module, fn}: reevaluation's obligation (R21, R25)
  #onGrounded = null;    // {module, fn}: strength's pair (R28)
  #bias = null;          // R53: the lens a finding is made under is read here
  #deps;

  constructor({ storage, record, membership, promotion, content, connections = null, entities = null, retrieval = null,
                provenance = null, bias = null, host = null, now } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.content = content;
    this.#deps = { connections, entities, retrieval, provenance, host };
    this.#bias = bias;
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get connections() { return this.#deps.connections ||= connectionsOf(this.#deps.host); }
  get entities() { return this.#deps.entities ||= entitiesOf(this.#deps.host); }
  get retrieval() { return this.#deps.retrieval ||= retrievalOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  /** R53: the bias instance a finding's lens is read from, bound once (the first binding holds); null until bound. */
  bindBias(bias) { if (!this.#bias && bias && typeof bias.biasManifest === "function") this.#bias = bias; return this.#bias; }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #promote(pkg) { return this.promotion.promote(pkg); }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }

  /** The tables, their migrations (with N136's move of the leg count and the superseded-by index off `bundles`, R36)
   *  and the superseded-by backfill (REC-17's boot pass, bounded by the number of `supersedes` edges, which is the
   *  number of divisions anybody has performed). Idempotent: every boot. */
  migrate() {
    migrateInquiry(this.sql);
    if (this.#rows(`PRAGMA table_info(refs)`).length > 0)
      for (const r of this.#rows(`SELECT DISTINCT target_id FROM refs WHERE kind='supersedes'`))
        this.writeSupersededBy(r.target_id);
  }

  /* ---------------------------------------------------------------- facts from later modules (N56, promotion R40) */

  /* A published case's member cannot be divided, re-grouped or set down (R35). Unprovided, it is refused, never false. */
  #caseMemberFact(id) {
    const f = this.promotion.fact("caseMember", id);
    return f.ok ? { member: !!f.value } : { unavailable: f };
  }
  #caseMember(id) {
    const f = this.#caseMemberFact(id);
    /* An unanswered fact counts as a member: the conservative arm, which refuses the act rather than moving a case. */
    return f.unavailable ? true : f.member;
  }
  #publishedRegistry(bundleId, targets) {
    const f = this.promotion.fact("publishedRegistry", bundleId, targets);
    return f.ok ? f.value : null;
  }

  /* ---------------------------------------------------------------- registrations this module offers (K31) */

  /** R21, R25: `reevaluation`'s obligation. `fn({target, cause, since, viewer})` answers the dependents raised. */
  onRaised(module, fn) {
    /* N202: membership's one site of LISTENER_MALFORMED and LISTENER_DECLARED (its R81); a one-registration slot. */
    const refused = listenerRefusal(this.#onRaised, module, fn);
    if (refused) return refused;
    this.#onRaised = { module, fn };
    return { ok: true, module };
  }
  /** R28: `strength`'s pair. `fn(inquiryId)` answers `{capture, connection, testimony?}`, each `{state, grade}`. */
  onGrounded(module, fn) {
    const refused = listenerRefusal(this.#onGrounded, module, fn);
    if (refused) return refused;
    this.#onGrounded = { module, fn };
    return { ok: true, module };
  }
  /* The re-evaluation an act raised, `{raised, failed, answer}`, or null when no module is registered to raise it. The
     listener answers the dependents (an array), or an object `{raised, listeners_failed?}` (reevaluation R8), which is
     kept itself as `answer` (N422): reevaluation writes the listeners that failed onto it after the outermost commit
     (its R8, record-core R66), so a copy taken here would miss them under a caller's transaction. A listener that
     throws is named in `failed` itself, and never undoes the act. */
  #raise(target, cause, since, viewer) {
    if (!this.#onRaised) return null;
    try {
      const r = this.#onRaised.fn({ target, cause, since, viewer });
      if (Array.isArray(r)) return { raised: r, failed: [], answer: null };
      if (r && typeof r === "object")
        return { raised: Array.isArray(r.raised) ? r.raised : [], failed: [], answer: r };
      return { raised: [], failed: [], answer: null };
    } catch { return { raised: [], failed: [this.#onRaised.module], answer: null }; }
  }
  /* R42: the `reevaluation` field of an act's answer, over what each raise answered (in order), or the absence. Its
     `listeners_failed` is read when the reply is read (N422), from each raise's own failure and from what each answer
     object names then, each module once; absent while none has failed. */
  static #reevaluation(cause, since, raises) {
    if (raises === null)
      return { reevaluation_absent: "no module is registered to raise the re-evaluation this act would raise, so none is named here" };
    return { reevaluation: liveFailures({ source: cause, since, raised: raises.flatMap((r) => r.raised) }, () => {
      const failed = [];
      for (const r of raises)
        for (const f of [...r.failed, ...(r.answer && Array.isArray(r.answer.listeners_failed) ? r.answer.listeners_failed : [])])
          if (!failed.includes(f)) failed.push(f);
      return failed;
    }) };
  }
  #reevaluationField(target, cause, since, viewer) {
    const r = this.#raise(target, cause, since, viewer);
    return Inquiry.#reevaluation(cause, since, r === null ? null : [r]);
  }
  #strength(id) {
    if (!this.#onGrounded) return null;
    try { return this.#onGrounded.fn(id) || null; } catch { return null; }
  }

  /* D-436 / C-64.1: a creation this act would make cannot name the group that produced it. */
  #groupUndetermined(act, detail) {
    /* DEC-49 REGION is-group-undetermined */
    const row = PROMOTION_ROW_CHECKS.GROUP_UNDETERMINED;
    return { ok: false, reason: "GROUP_UNDETERMINED", code: "GROUP_UNDETERMINED", check: row.check,
             translation: row.translation, act, detail };
    /* END DEC-49 REGION is-group-undetermined */
  }

  /* ---------------------------------------------------------------- R11: the check (promotion R39) */

  /** Refuses a promotion whose document breaks the leg grammar, names an unknown subject, carries a malformed or
   *  unresolved supersession, discloses a division its parent does not record, or would close a basis cycle. Asked
   *  inside the promotion's transaction, before the write. */
  check(c) {
    const { pkg, bundleId, files, promotedType } = stepContext(c);
    const basisMd = Array.isArray(files) ? files.find((f) => f && f.path === "bundle.md") : null;
    const docFm = basisMd && typeof basisMd.text === "string" ? parseFrontmatter(basisMd.text).data : null;
    const isInquiry = promotedType === "inquiry";
    const basisFm = isInquiry ? docFm : null;
    const basisLegs = basisFm && Array.isArray(basisFm.basis) ? basisFm.basis.filter((l) => l && typeof l === "object") : [];
    const replay = !!(pkg && pkg.replay);
    /* R11 (K681; `inquiry-grammar` R1, R2, R4): the entry arm at the WRITE, judged synchronously by inquiry-grammar's
       own `checkInquiryExtension` over the document: the entry requirements, the division block, the subject's shape and
       the leg grammar, with the published and earned registries injected (C-21.2, REC-18). The version block is
       `basis-versions`' own check at the same write (its R6), not this arm's. Shape refusals honour the replay
       exemption: the record's history must be holdable verbatim. */
    if (basisFm && !replay) {
      const bf = [];
      checkInquiryExtension({ fm: basisFm,
        publishedRegistry: this.#publishedRegistry(bundleId, basisLegs.map((l) => l.target).filter((t) => typeof t === "string")),
        earnedRegistry: this.earnedForDoc(basisFm, basisLegs) }, bf);
      const errs = bf.filter((x) => x.severity === "error");
      if (errs.length)
        return { ok: false, reason: "BASIS_REFUSED",
                 findings: errs.map((x) => ({ check: x.check, detail: x.message,
                   /* a code with a catalogue row carries its translation (Terms); a sub-code of C-2.8 with none
                      (the testimony arms) carries its code alone, never an empty key */
                   ...(x.code ? { code: x.code } : {}),
                   ...(x.code && CONTENT_EXTENT_CHECKS[x.code]?.translation
                     ? { translation: CONTENT_EXTENT_CHECKS[x.code].translation } : {}),
                   ...(x.repairs ? { repairs: x.repairs } : {}) })) };
      /* REC-82 / REC-84: the content extent of each leg (content R27), after the grammar so a broken leg is told
         about the leg first. */
      if (basisLegs.length) {
        const cerrs = this.content.citationRefusals(basisLegs, (i) => `basis[${i}]`, this.content.citationPlan(basisLegs));
        if (cerrs.length) return { ok: false, reason: "BASIS_REFUSED", findings: cerrs };
      }
    }
    /* REC-18: a subject entity the registry does not hold. */
    if (isInquiry && docFm && !replay && typeof docFm.subject_entity === "string" && docFm.subject_entity.trim() !== "") {
      const se = docFm.subject_entity.trim();
      if (!this.entities.has(se))
        return { ok: false, reason: "SUBJECT_REFUSED", target: se,
                 findings: [{ check: "C-2.8",
                   detail: `subject_entity '${se}' does not resolve in this store: an inquiry naming its `
                         + `subject names an entry in the SUBJECT REGISTRY, and this one names a key no `
                         + `entity has. Register the subject with op=entitycreate, or omit subject_entity `
                         + `— an inquiry may name no subject, and then no leg of it earns an A/B/C `
                         + `connection grade (DEC-15).` }] };
    }
    /* REC-16 / R4: the supersession edge (on any document: `supersedes` is in every type's vocabulary) and the
       division disclosure, whose sibling set only the record can complete against the parent's `division.into`. */
    if (docFm && !replay) {
      const sf = [];
      supersedesEdgeFindings(docFm, sf);
      const serrs = sf.filter((x) => x.severity === "error");
      if (serrs.length)
        return { ok: false, reason: "SUPERSESSION_REFUSED", findings: serrs.map((x) => ({ check: x.check, detail: x.message })) };
      for (const r of (Array.isArray(docFm.references) ? docFm.references : [])) {
        if (!r || typeof r !== "object" || r.rel !== "supersedes") continue;
        if (r.target === bundleId)
          return { ok: false, reason: "SUPERSESSION_REFUSED", target: r.target,
                   findings: [{ check: "C-6.1", detail: `${bundleId} supersedes itself: a question cannot be the thing it replaced` }] };
        if (!this.record.bundleInfo(r.target))
          return { ok: false, reason: "SUPERSESSION_REFUSED", target: r.target,
                   findings: [{ check: "C-6.1",
                     detail: `supersedes target '${r.target}' does not resolve in this store: an edge that `
                           + `asserts a lineage must name a question that exists, or it points a reader at `
                           + `nothing while claiming a replacement happened` }] };
      }
      const df = [];
      divisionDisclosureFindings(docFm, df);
      const derrs = df.filter((x) => x.severity === "error");
      if (derrs.length)
        return { ok: false, reason: "NO_SIBLING_DISCLOSURE", findings: derrs.map((x) => ({ check: x.check, detail: x.message })) };
      const parentId = typeof docFm.division_parent === "string" && docFm.division_parent !== "null" ? docFm.division_parent : null;
      if (parentId) {
        const pmd = this.record.readFile(parentId, "bundle.md");
        const pfm = pmd && typeof pmd.text === "string" ? (parseFrontmatter(pmd.text).data || {}) : null;
        const into = pfm && pfm.division && Array.isArray(pfm.division.into) ? pfm.division.into.filter((x) => typeof x === "string") : null;
        if (!into || !into.includes(bundleId))
          return { ok: false, reason: "NO_SIBLING_DISCLOSURE", parent: parentId,
                   detail: `${parentId} does not record ${bundleId} as one of the questions it was divided `
                         + `into, so the parent and the child disagree about whether this division happened. `
                         + `A child names a parent that names it back, or the disclosure is a claim nobody `
                         + `can check.` };
        const declared = new Set(Array.isArray(docFm.division_siblings) ? docFm.division_siblings : []);
        const missing = into.filter((x) => x !== bundleId && !declared.has(x));
        const invented = [...declared].filter((x) => !into.includes(x));
        if (missing.length || invented.length)
          return { ok: false, reason: "NO_SIBLING_DISCLOSURE", parent: parentId, missing, not_siblings: invented,
                   detail: (missing.length
                     ? `this child does not name ${missing.join(", ")}, which ${parentId} was also divided `
                     + `into. A reader who can see one half of a divided inquiry must be able to see that `
                     + `the other half EXISTS (R4). `
                     : "")
                   + (invented.length ? `it also names ${invented.join(", ")}, which ${parentId} was not divided into.` : "") };
      }
    }
    /* R3 / R29: the basis is a DAG, enforced at the write that would close the cycle, naming the path. Not exempt on
       replay: a faithfully replayed history was acyclic when it was written. */
    if (basisLegs.length) {
      /* DEC-49 REGION is-basis-acyclic — C-33.22-23. */
      for (const leg of basisLegs)
        if (leg.target === bundleId)
          return withRow({ ok: false, reason: "SELF_BASIS", path: [bundleId, bundleId],
                           detail: `${bundleId} cannot rest on itself: a question is not evidence for its own answer` });
      const inqTargets = [...new Set(basisLegs
        .filter((l) => typeof l.target === "string" && normalizeType(OBJECT_TYPES[l.target.split("-")[0]]) === "inquiry")
        .map((l) => l.target))];
      const cycle = this.cyclePath(bundleId, inqTargets);
      if (cycle)
        return withRow({ ok: false, reason: "BASIS_CYCLE", path: cycle,
                         detail: `this write would close a cycle: ${cycle.join(" -> ")}. `
                               + `An inquiry's basis is a DAG; the chain above already rests on ${bundleId}.` });
      /* END DEC-49 REGION is-basis-acyclic */
    }
    /* R47 (N345, C-2.11–C-2.16): the contradiction arm, judged as C-2.8's entry requirements are, so every door that
       writes an inquiry (a take-up, a resolve, basis-versions' `conclude`, a member's own edit) meets it. Each finding
       carries its code and translation, inside BASIS_REFUSED. A replay is exempt, as from every shape arm above. */
    if (isInquiry && docFm && !replay) {
      const cf = contradictionFindings(docFm);
      if (cf.length) return { ok: false, reason: "BASIS_REFUSED", findings: cf };
      /* DEC-49 REGION is-candidate-taken-up — C-2.17: one candidate has one contradiction inquiry. */
      const candidate = candidateOf(docFm);
      const holder = candidate ? this.inquiryOfCandidate(candidate, bundleId) : null;
      if (holder)
        return withRow({ ok: false, reason: "CANDIDATE_ALREADY_TAKEN_UP", code: "CANDIDATE_ALREADY_TAKEN_UP",
                         candidate, inquiry: holder,
                         detail: `the contradiction candidate ${candidate} is already taken up as ${holder}, and one `
                               + `conflict has one question where it is resolved. Work on it in ${holder}.` });
      /* END DEC-49 REGION is-candidate-taken-up */
    }
    return this.#surfacedByCarried(c);
  }

  /* R50 (REC-179 / C-66.5, INVESTIGATIVE-SESSION.md §11 item 5, rule 2's reach): A REVISION CARRIES `surfaced_by`
     FORWARD. The field records the surfacing act, decided once at the trust boundary on the creation (D-78's restamp;
     REC-173's verified replay keeps the Drive era's), so without this a revision relabelled the question and the
     surfacing row then contradicted the bytes it describes. Asked of every revision of a bundle whose CURRENT version
     is an inquiry, after the compare-and-swap (so the head is the version this revision is based on) and before any
     write. Both sides are read by the record's own parser, never a line scan a caller can step around, so a respelling
     of the same value lands and a different value is refused in either direction. An absent field and an unreadable
     document are values too. `replay` is no exemption: it is a caller's assertion (only a creation is verified as a
     replay, REC-173). Moved from legacy-store's share of every promotion (T19 layer 6). */
  #surfacedByCarried(c) {
    const { bundleId, base, files, head } = stepContext(c);
    if (!head || base === null || normalizeType(head.type) !== "inquiry") return null;
    const surfacedOf = (text) => {
      if (typeof text !== "string") return "unreadable";
      /* No catch: the parser does not throw on a string; a document it cannot read comes back `data: null`. */
      const fm = parseFrontmatter(text).data;
      if (!fm || typeof fm !== "object") return "unreadable";
      return Object.prototype.hasOwnProperty.call(fm, "surfaced_by") ? JSON.stringify(fm.surfaced_by) : "absent";
    };
    const held = this.record.readFile(bundleId, "bundle.md");
    const next = Array.isArray(files) ? files.find((f) => f && f.path === "bundle.md") : null;
    const was = surfacedOf(held ? held.text : null);
    const now = surfacedOf(next ? next.text : null);
    /* DEC-49 REGION is-promote-surfaced-by */
    if (was !== now) {
      const row = INQUIRY_SURFACE_CHECKS.SURFACED_BY_REWRITTEN;
      return { ok: false, reason: "SURFACED_BY_REWRITTEN", code: "SURFACED_BY_REWRITTEN", check: row.check,
               translation: row.translation, bundleId, current: was, revision: now,
               detail: `the current version of ${bundleId} records surfaced_by ${was}, and this revision records ${now}. `
                     + `Who surfaced a question is recorded once, at its creation; a revision carries it forward `
                     + `unchanged. Nothing was written.` };
    }
    /* END DEC-49 REGION is-promote-surfaced-by */
    return null;
  }

  /* ---------------------------------------------------------------- R12: the projection (promotion R39) */

  /** In the promotion's transaction: the superseded-by index, `inquiry_basis` whole from `basis[]` with each document
   *  leg's content row, `inquiry_exclusions` from `completeness_excluded[]`, the leg count and subject entity, and a
   *  migration replay's row. The answer's keys join the promotion's. A leg on an imported finding reference (N522) is
   *  projected with its ref as `target_id`, as spelled, and no content row: content's plan reads it as no document. */
  project(c) {
    const { pkg, bundleId, meta, promotedType } = stepContext(c);
    const cur = c.head, docFm = c.docFm, isInquiry = promotedType === "inquiry";
    const basisFm = isInquiry ? docFm : null;
    const basisLegs = basisFm && Array.isArray(basisFm.basis) ? basisFm.basis.filter((l) => l && typeof l === "object") : [];
    /* REC-17: the supersedes targets this revision REPLACED (connections R19), the ones it holds now, and this
       bundle's own row (a bundle created after something already superseded it). */
    for (const t of new Set([...refsReplacedOf(c, "supersedes"),
                             ...this.#rows(`SELECT target_id FROM refs WHERE bundle_id=? AND kind='supersedes'`, bundleId)
                               .map((r) => r.target_id),
                             bundleId]))
      this.writeSupersededBy(t);

    /* REC-82 / IC-83: the prior referent of each leg, read before the delete and carried forward when the leg still
       names the SAME target and extent (and capture, when it names one, REC-220): the record never moves an authored
       edge's target without a member's act (Bob, 2026-09-14). Keyed by (target, extent), never by ord: a member who
       reorders their basis has not re-pointed anything. */
    const priorContent = new Map(), priorContentAt = new Map();
    const priorRows = this.#rows(
      `SELECT b.target_id AS t, b.content_id AS cid, c.extent AS ext, c.capture_sha AS cap
         FROM inquiry_basis b LEFT JOIN content c ON c.content_id = b.content_id
        WHERE b.bundle_id=? AND b.content_id IS NOT NULL`, bundleId);
    for (const r of priorRows)
      if (r.ext != null) {
        priorContent.set(`${r.t}\u0000${r.ext}`, r.cid);
        if (r.cap != null) priorContentAt.set(`${r.t}\u0000${r.ext}\u0000${r.cap}`, r.cid);
      }
    const contentProjected = [];
    const contentPlan = isInquiry ? this.content.citationPlan(basisLegs) : new Map();
    this.sql.exec(`DELETE FROM inquiry_basis WHERE bundle_id=?`, bundleId);
    if (isInquiry) {
      for (let i = 0; i < basisLegs.length; i++) {
        const leg = basisLegs[i];
        if (typeof leg.target !== "string") continue;   // a replayed malformed shape: unprojectable
        /* The leg's referent: named outright (taken at its word, REC-84), carried forward, or minted (`plane`) over the
           capture content resolves. A null is stated, never a row invented to fill the column. */
        let rowId = null, carriedRow = false, minted = false, undetermined = null;
        const cp = contentPlan.get(i);
        if (cp && cp.isInfo) {
          const ext = cp.extent;
          const named = legContentId(leg);
          if (named) rowId = named;
          else {
            const held = cp.authored
              ? priorContentAt.get(`${leg.target}\u0000${canonicalExtent(ext)}\u0000${cp.captureSha}`)
              : priorContent.get(`${leg.target}\u0000${canonicalExtent(ext)}`);
            if (held) { rowId = held; carriedRow = true; }
            else if (cp.captureSha) {
              const mint = this.content.mint({ bundleId: leg.target, captureSha: cp.captureSha, extent: ext,
                mintedBy: CONTENT_MINTED_BY_PLANE, at: (meta && meta.last_updated) || null, ctx: cp.ctx });
              if (mint.ok) { rowId = mint.content_id; minted = mint.minted; undetermined = mint.undetermined || null; }
            }
          }
          if (rowId)
            contentProjected.push({ ord: i, target: leg.target, content_id: rowId, extent_kind: ext.kind, minted,
                                    carried: carriedRow, ...(undetermined ? { undetermined } : {}) });
        }
        this.sql.exec(
          `INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at,ground,content_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          bundleId, i, leg.target,
          normalizeType(OBJECT_TYPES[leg.target.split("-")[0]]) ?? "",
          typeof leg.role === "string" ? leg.role : "",
          leg.grade ?? null, leg.grade_axis ?? null, leg.grade_source ?? null,
          typeof leg.note === "string" ? leg.note : null,
          /* the document's own authored date, never the server's clock (delete-then-insert re-projects every time) */
          leg.date != null ? String(leg.date) : null,
          /* REC-42: the OR branch exactly as authored; absent is the implicit single ground, never invented */
          typeof leg.ground === "string" && leg.ground.trim() ? leg.ground.trim() : null,
          rowId);
      }
    }
    /* the standing of each referent, in ONE pass over the ids the loop collected */
    if (contentProjected.length) this.content.projectStandings(contentProjected);

    /* REC-14 / C-9: the exclusions, whole, by the same delete-then-insert discipline. */
    this.sql.exec(`DELETE FROM inquiry_exclusions WHERE bundle_id=?`, bundleId);
    if (isInquiry && basisFm && Array.isArray(basisFm.completeness_excluded)) {
      const comp = (basisFm.completeness && typeof basisFm.completeness === "object") ? basisFm.completeness : {};
      for (let i = 0; i < basisFm.completeness_excluded.length; i++) {
        const row = basisFm.completeness_excluded[i];
        if (!row || typeof row !== "object") continue;
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
    /* REC-18: the leg count and the declared subject, from the same parsed bytes. */
    if (isInquiry) {
      const n = this.#one(`SELECT count(*) AS c FROM inquiry_basis WHERE bundle_id=?`, bundleId).c;
      const subject = basisFm && typeof basisFm.subject_entity === "string" && basisFm.subject_entity.trim()
        ? basisFm.subject_entity.trim() : null;
      /* R36, R40 (N136): the count and the subject in this module's own table, R40's read contract. */
      this.sql.exec(`INSERT INTO ${BUNDLE_FACTS} (bundle_id, inquiry_basis_count, inquiry_subject_entity) VALUES (?,?,?)
                     ON CONFLICT(bundle_id) DO UPDATE SET inquiry_basis_count=excluded.inquiry_basis_count,
                       inquiry_subject_entity=excluded.inquiry_subject_entity`, bundleId, n, subject);
    }
    /* R48 (N345): the contradiction link, its resolution while the document is concluded, and `explores`, re-derived
       whole from the document; no row for a plain inquiry. */
    this.sql.exec(`DELETE FROM inquiry_contradiction_links WHERE bundle_id=?`, bundleId);
    if (isInquiry && docFm) {
      const candidate = candidateOf(docFm), explores = exploresOf(docFm);
      if (candidate || explores) {
        const resolution = candidate && docFm.current_state === "concluded" ? readResolution(docFm.resolution) : null;
        this.sql.exec(`INSERT INTO inquiry_contradiction_links (bundle_id, candidate, resolution, explores, at) VALUES (?,?,?,?,?)`,
          bundleId, candidate, resolution ? JSON.stringify(resolution) : null, explores ? JSON.stringify(explores) : null,
          this.#when());
      }
    }
    /* REC-173: a creation admitted as a migration replay records its capture and promotion key, in its own transaction. */
    let migrated = null;
    const surfacing = typeof pkg.assistantPrincipal === "string" && pkg.assistantPrincipal.trim();
    if (!cur && isInquiry && !surfacing && pkg.migrationReplay && typeof pkg.migrationReplay === "object"
        && typeof pkg.migrationReplay.capture === "string" && pkg.migrationReplay.capture) {
      const ts = new Date().toISOString();
      const promotionKey = typeof pkg.migrationReplay.promotion === "string" ? pkg.migrationReplay.promotion : null;
      this.sql.exec(`INSERT INTO inquiry_migration_replays (bundle_id, capture_sha, promotion_key, at) VALUES (?,?,?,?)`,
        bundleId, pkg.migrationReplay.capture, promotionKey, ts);
      migrated = { capture: pkg.migrationReplay.capture, promotion: promotionKey, at: ts };
    }
    /* R53 (A9, bias R40): a finding, when the document enters `concluded` stating its project. */
    if (isInquiry && docFm && docFm.current_state === "concluded" && !(cur && cur.currentState === "concluded"))
      this.#recordFinding(bundleId, docFm, c.author, !!pkg.replay);
    /* R44 (N149): the member-browser agent, recorded at the creation from the control plane's stamp, never after. */
    const agent = !cur && isInquiry && !pkg.replay ? agentOf(pkg.memberUserAgent) : null;
    if (agent)
      this.sql.exec(`INSERT OR IGNORE INTO inquiry_member_agents (bundle_id, user_agent, at) VALUES (?,?,?)`,
        bundleId, agent, this.#when());
    return { ...(migrated ? { migration_replay: migrated } : {}),
             ...(contentProjected.length ? { content: contentProjected } : {}) };
  }

  /* R53: the question's finding and the project lens in force as it was made, read as bias reads every lens (the
     administrator viewer, bias R33). A lens that cannot be read (no bias bound, or its read fails) and a replayed
     conclusion (not made now) record no lens; none in force records that none was. Never throws into the promotion. */
  #recordFinding(bundleId, fm, author, replay) {
    const project = typeof fm.project === "string" ? fm.project.trim() : "";
    if (!project) return;
    let state = "unreadable", sha = null;
    if (!replay && this.#bias)
      try {
        const m = this.#bias.biasManifest({ scope: "project", scopeId: project, viewer: "admin", limit: 1 });
        if (m && m.in_force === true && typeof m.statements_sha === "string") { state = "recorded"; sha = m.statements_sha; }
        else if (m && m.in_force === false) state = "none";
      } catch { /* unreadable: no lens recorded */ }
    const who = MEMBER_AUTHOR.exec(typeof author === "string" ? author : "");
    this.sql.exec(`INSERT INTO inquiry_findings (bundle_id, project_id, lens_state, lens_sha, principal, at) VALUES (?,?,?,?,?,?)
                   ON CONFLICT(bundle_id) DO UPDATE SET project_id=excluded.project_id, lens_state=excluded.lens_state,
                     lens_sha=excluded.lens_sha, principal=excluded.principal, at=excluded.at`,
      bundleId, project, state, sha, who ? who[1] : null, this.#when());
  }

  /** R53 (A9, bias R40): this module's findings as bias's work products (bias R33), offered under kind `finding`. A
   *  finding is a question's conclusion, made under the lens of the project its document states: every question with
   *  a recorded finding (R12's row), and every concluded question stating a project that has none (concluded before
   *  findings were recorded), keyed `finding:<id>` and listed ascending. `read` answers its context (the project), its
   *  member principal, the lens in force as it was made (`{basis: "at_open", statements_sha}`, bias's comparison of a
   *  lens recorded in force, under which a lens since withdrawn has moved too), or null where no project lens was
   *  recorded (undetermined, never filled in), no re-run link, and `registered` (when it was made, null when not
   *  recorded); `visible` is the question's own sight (R33). */
  workProducts() {
    const idOf = (key) => (typeof key === "string" && key.startsWith(FINDING_KEY) ? key.slice(FINDING_KEY.length) : "");
    return {
      list: (after, limit) => this.#rows(
        `SELECT bundle_id FROM (SELECT bundle_id FROM inquiry_findings UNION SELECT bundle_id FROM bundles
           WHERE object_type='inquiry' AND current_state='concluded' AND COALESCE(project, '') <> '')
          WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`,
        idOf(String(after ?? "")) || "", Math.max(1, Math.floor(Number(limit) || 50))).map((r) => FINDING_KEY + r.bundle_id),
      read: async (key) => {
        const id = idOf(key);
        const info = id ? this.record.bundleInfo(id) : null;
        if (!info) return null;
        const f = this.#one(`SELECT * FROM inquiry_findings WHERE bundle_id=?`, id);
        const project = f ? f.project_id : info.project;
        if (!project) return null;
        return { context: { type: "project", id: project }, principal: f ? f.principal ?? null : null,
                 lens: f && f.lens_state === "recorded" && f.lens_sha ? { basis: "at_open", statements_sha: f.lens_sha } : null,
                 ranUnder: null, rerunOf: null, registered: f ? f.at : null };
      },
      visible: async (key, viewer) => { const id = idOf(key); return !!id && this.membership.inSight(id, viewer) === true; },
    };
  }

  /** R12, R16: ONE bundle's superseded-by index from the `supersedes` edges pointing at it (connections' `refs`), the
   *  ids comma-joined and sorted, NULL when nothing supersedes it, held in this module's table (R36). An id with no
   *  bundle is a no-op. */
  writeSupersededBy(targetId) {
    if (!targetId) return null;
    const ids = this.#rows(`SELECT bundle_id FROM refs WHERE target_id=? AND kind='supersedes' ORDER BY bundle_id`, targetId)
      .map((r) => r.bundle_id);
    const v = ids.length ? ids.join(",") : null;
    if (v === null) this.sql.exec(`UPDATE ${BUNDLE_FACTS} SET inquiry_superseded_by=NULL WHERE bundle_id=?`, targetId);
    else this.sql.exec(`INSERT INTO ${BUNDLE_FACTS} (bundle_id, inquiry_superseded_by)
                        SELECT bundle_id, ? FROM bundles WHERE bundle_id=?
                        ON CONFLICT(bundle_id) DO UPDATE SET inquiry_superseded_by=excluded.inquiry_superseded_by`, v, targetId);
    return ids;
  }

  /** R16: the ids that supersede `id`, from the index. */
  supersededBy(id) {
    return supersededByOf(this.#one(`SELECT inquiry_superseded_by FROM ${BUNDLE_FACTS} WHERE bundle_id=?`, id));
  }

  /** R18 (publication R12 reads it): the exclusions naming `targetId` the viewer may see, each with its inquiry, edition,
   *  description, reason, author and date, in (inquiry, ord) order. Every one is answered; they are read a page at a
   *  time, at most `STALE_PAGE` rows per statement (N183). An absent viewer fails closed. */
  exclusionsNaming(targetId, viewer = null) {
    if (!targetId) return [];
    const gate = viewerPredicate(viewer);
    const out = [];
    for (let bid = "", ord = -1; ;) {
      const page = this.#rows(
        `SELECT x.bundle_id, x.ord, x.edition, x.description, x.reason, x.author, x.at, b.current_state, b.title
           FROM inquiry_exclusions x JOIN bundles b ON b.bundle_id = x.bundle_id
          WHERE x.target_id=? AND (${gate.sql}) AND (x.bundle_id > ? OR (x.bundle_id = ? AND x.ord > ?))
          ORDER BY x.bundle_id, x.ord LIMIT ?`, targetId, ...gate.args, bid, bid, ord, STALE_PAGE);
      out.push(...page);
      if (page.length < STALE_PAGE) return out;
      ({ bundle_id: bid, ord } = page[page.length - 1]);
    }
  }

  /** R19 (D-592): the inquiry's state transitions from its own `state_history`, each with who took it and when (a
   *  reopening is written there by promotion's `reopen`). */
  stateHistory(id, viewer = undefined) {
    if (!id) return { ok: false, reason: "NO_ID" };
    if (viewer !== undefined && !this.membership.inSight(id, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id };
    const info = this.record.bundleInfo(id);
    if (!info) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id };
    if (normalizeType(info.type) !== "inquiry") return { ok: false, reason: "NOT_AN_INQUIRY", target: id };
    const md = this.record.readFile(id, "bundle.md");
    const fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
    if (!fm || typeof fm !== "object") return { ok: false, reason: "NO_DOCUMENT", target: id };
    const rows = Array.isArray(fm.state_history) ? fm.state_history.filter((r) => r && typeof r === "object") : [];
    return { ok: true, id, transitions: rows.map((r) => ({
      at: r.timestamp ?? null, from: r.from_state ?? null, to: r.to_state ?? null,
      by: r.author ?? null, reason: r.blurb ?? null })) };
  }

  /** R48 (N345): the inquiry's recorded `{candidate, resolution, explores}` as its latest promotion projected them, with
   *  `resolution` null unless the document was concluded; null for a plain inquiry. Not gated; for in-process callers
   *  (`contradiction`). Never throws. */
  contradictionLink(id) {
    try {
      if (!id || typeof id !== "string") return null;
      const r = this.#one(`SELECT candidate, resolution, explores FROM inquiry_contradiction_links WHERE bundle_id=?`, id);
      if (!r) return null;
      return { candidate: r.candidate ?? null, resolution: safeJson(r.resolution), explores: safeJson(r.explores) };
    } catch { return null; }
  }

  /** R48 (N345): the one inquiry whose document names `candidate`, or null (`except` leaves one inquiry out: R11's
   *  one-candidate rule asks it of every inquiry but the one being written). Not gated; never throws. */
  inquiryOfCandidate(candidate, except = null) {
    try {
      if (typeof candidate !== "string" || !CANDIDATE_RE.test(candidate)) return null;
      const r = this.#one(`SELECT bundle_id FROM inquiry_contradiction_links WHERE candidate=? AND bundle_id IS NOT ?
                            ORDER BY bundle_id LIMIT 1`, candidate, except);
      return r ? r.bundle_id : null;
    } catch { return null; }
  }

  /** R44: the member-browser agent recorded when the inquiry was created (the control plane's stamp, N149; a division's
   *  children carry their parent's), else the one its own document records (`member_user_agent`, trimmed), or null:
   *  never a default, which would be an invented client (capture-requests reads it, its R3, R14). */
  memberUserAgent(id) {
    try {
      if (!id || typeof id !== "string") return null;
      const rec = this.#one(`SELECT user_agent FROM inquiry_member_agents WHERE bundle_id=?`, id);
      if (rec && rec.user_agent) return rec.user_agent;
      const md = this.record.readFile(id, "bundle.md");
      const fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
      const ua = fm && typeof fm === "object" ? fm.member_user_agent : null;
      return typeof ua === "string" && ua.trim() !== "" ? ua.trim() : null;
    } catch { return null; }
  }

  /** N405 (REC-173, INVESTIGATIVE-SESSION.md §11 item 5): the `surfaced_in` of a question whose creation was a
   *  server-verified MIGRATION REPLAY (R12's row), surfaced in the Drive era and not inside a run on this plane: said in
   *  words, with the capture and promotion the replay named. Null for any other bundle; the rest of `surfaced_in` is
   *  ai-runs' (its R27). Registered as this module's decoration of retrieval's single-bundle answer (its R56). Not gated
   *  (the answer it decorates is); never throws. */
  migratedSurfacing(id) {
    try {
      if (!id || typeof id !== "string") return null;
      const mig = this.#one(`SELECT capture_sha, promotion_key, at FROM inquiry_migration_replays WHERE bundle_id=?`, id);
      return mig ? { recorded: false, stated: "not recorded (migrated from the Drive era)", run: null, lens: null,
                     migrated: { capture: mig.capture_sha, promotion: mig.promotion_key ?? null, at: mig.at } } : null;
    } catch { return null; }
  }

  /** R52 (1) (K861, plane R10): this module's share of the instance's figures, exported for `plane` to register under
   *  this module's name through `record-core` R63 (`registerCounts("inquiry", Inquiry.COUNT_KEYS, (hid) =>
   *  k.counts(hid))`); plane registers it under this module's name, and the module registers nothing itself. */
  static COUNT_KEYS = Object.freeze(["inquiryMigrationReplays"]);

  /** R52 (1), D-464 (A COUNT IS TAKEN THROUGH THE CALLER'S OWN SIGHT): `record-core` R63's `counts(hid)` for this
   *  module's share, registered by plane under this module's name. `inquiryMigrationReplays` is the rows of
   *  `inquiry_migration_replays` (REC-173) less those whose `bundle_id` is in `hid`, membership's `hiddenBundles`
   *  (`{sql, args}`), or null for a viewer that sees every bundle and for the direct internal call, which count whole.
   *  `COALESCE(k, '')`: a NULL key names no bundle, and `NULL NOT IN (…)` is NULL, which would drop the row. A figure
   *  whose table cannot be read is left out, and R63 answers it null, never zero. Synchronous; writes nothing; never
   *  throws. */
  counts(hid = null) {
    const out = {};
    try {
      out.inquiryMigrationReplays = hid
        ? this.#one(`SELECT count(*) AS c FROM inquiry_migration_replays WHERE COALESCE(bundle_id, '') NOT IN ${hid.sql}`,
            ...hid.args).c
        : this.#one(`SELECT count(*) AS c FROM inquiry_migration_replays`).c;
    } catch { /* unread: R63 answers it null */ }
    return out;
  }

  /** R52 (2) (K861, plane R10; retrieval R55): the leg grades `retrieval`'s `registerLegGrades` takes, for `plane` to
   *  register as `inquiry` (through `inquiryLegGrades(host)`). For legs `{grade, target_id}`, R13's `earned` is asked
   *  once, with no subject entity, over the list's distinct targets, and each leg, in order, answers R14's `legCapped`
   *  of its grade against its target's earned capture ceiling (null for a target with none). An empty list, or anything
   *  that is not a list, answers an empty list without asking. */
  legGrades(legs) {
    if (!Array.isArray(legs) || !legs.length) return [];
    const cap = this.earned(null, [...new Set(legs.map((l) => l && l.target_id))])?.earned?.capture || {};
    return legs.map((l) => (l && Object.hasOwn(cap, l.target_id) ? legCapped(l.grade, cap[l.target_id], l.target_id) : null));
  }

  /** R17, R11 (`inquiry-grammar` R1, R2): the entry requirements over one document, judged by record-grammar's
   *  `checkBundle` with the type grammars later modules registered with record-core (its `grammars()`), as promotion's
   *  gate judges a bundle (its R27), so a grammar registered there judges an inquiry here as it does there. A slot of
   *  `inquiry-grammar`'s that no registration claims (a record nothing registered it with) is filled by its own arm
   *  (`INQUIRY_GRAMMARS`), so the inquiry is never left unjudged. A grammar whose arm throws is one error of its own,
   *  naming its module; a record that cannot answer its registrations is an error, never read as none. Never throws. */
  async checkEntry(bundleMd, opts = {}) {
    let grammars;
    try {
      grammars = this.record.grammars().map((g) => ({ module: g.module, ids: g.ids, arm: async (ctx, found) => {
        try { await g.arm(ctx, found); }
        catch (e) {
          found.push({ check: g.module, severity: "error",
                       message: `${g.module}'s grammar threw, so it judged nothing and the document is not passed: `
                              + `${fmSafe(e && e.message ? e.message : e).slice(0, 200)}` });
        }
      } }));
    } catch (e) {
      return [{ check: "C-2.8", severity: "error",
                message: `the registered grammars could not be read, so the entry requirements were not judged: `
                       + `${fmSafe(e && e.message ? e.message : e).slice(0, 200)}` }];
    }
    const claimed = new Set(grammars.flatMap((g) => (Array.isArray(g.ids) ? g.ids : [])));
    grammars = [...grammars, ...INQUIRY_GRAMMARS.filter((g) => !g.ids.some((id) => claimed.has(id)))];
    return checkInquiryEntry(bundleMd, { ...(opts && typeof opts === "object" ? opts : {}), grammars });
  }

  /* ---------------------------------------------------------------- content R41: a re-read that staled rows */

  /** Registered on content's `onStale`: the legs resting on each affected or undetermined row (and, past the notice's
   *  bound, on the capture's stale rows after `ungraded_after`) are told through `onRaised`, cause `restaled`; with
   *  none registered, the answer names them and nothing is written. Runs in content's transaction, so it never throws. */
  staled(notice) {
    try {
      const ids = new Set((Array.isArray(notice && notice.rows) ? notice.rows : [])
        .map((r) => r && r.content_id).filter((x) => typeof x === "string" && x));
      /* N183: the capture's stale rows past the bound, and then the legs, each read a page at a time (at most
         STALE_PAGE rows per statement) until every one is read. */
      if (notice && notice.ungraded && notice.ungraded_after)
        for (let after = String(notice.ungraded_after); ;) {
          const page = this.#rows(`SELECT content_id FROM content WHERE capture_sha=? AND stale=1 AND content_id > ?
                                    ORDER BY content_id LIMIT ?`, notice.capture_sha, after, STALE_PAGE);
          for (const r of page) ids.add(r.content_id);
          if (page.length < STALE_PAGE) break;
          after = page[page.length - 1].content_id;
        }
      if (!ids.size) return { citing: [] };
      const citing = [];
      const list = JSON.stringify([...ids]);
      for (let bid = "", ord = -1; ;) {
        const page = this.#rows(
          `SELECT bundle_id, ord, target_id, content_id FROM inquiry_basis
            WHERE content_id IN (SELECT value FROM json_each(?)) AND (bundle_id > ? OR (bundle_id = ? AND ord > ?))
            ORDER BY bundle_id, ord LIMIT ?`, list, bid, bid, ord, STALE_PAGE);
        citing.push(...page);
        if (page.length < STALE_PAGE) break;
        ({ bundle_id: bid, ord } = page[page.length - 1]);
      }
      const since = this.#when();
      const told = [];
      let raises = [];
      for (const id of [...new Set(citing.map((l) => l.bundle_id))]) {
        const r = this.#raise(id, "restaled", since, null);
        if (r === null) { raises = null; break; }
        told.push({ inquiry: id, raised: r.raised });
        raises.push(r);
      }
      return { citing, told, since, ...(raises ? Inquiry.#reevaluation("restaled", since, raises) : {}) };
    } catch { return { citing: [], failed: true }; }
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
  dispose(args = {}) { return withRow(this.#dispose(args || {})); }
  #dispose({ handle, to, reason = "", viewer = null, owner = null, author = null } = {}) {
    /* DISPOSITIONS is progressions' one list (its R35), and a word outside it is answered by progressions'
       `notADisposition`, the one site that mints NOT_A_DISPOSITION with its row, C-100.20 (N285, K275): this act
       holds neither a literal of its own nor the row. */
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
    /* R20 (N285): the one answer to a word that is no disposition, minted in `progressions.notADisposition`. */
    const undisposed = notADisposition(to);
    if (undisposed) return undisposed;

    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "C-2.8 requires a non-empty disposition_reason for deferred and dismissed, so a "
                     + "disposition with no reason would produce a record the catalog rejects." };
    if (why.length > EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };

    const sel = this.retrieval.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to dispose" };

    /* Refused WHOLE, offenders named, never narrowed to the valid subset. The
       operator picked a set; disposing part of it decides something they did
       not. Same rule cite applies to a selection carrying a non-Information. */
    const offenders = [], illegal = [], published = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type, current_state FROM bundles WHERE bundle_id=?`, id);
      /* Judged by the NORMALIZED type through the catalog's own map, so a
         legacy `focus` or `problem` row (should one predate the boot
         normaliser) and a canonical `inquiry` row answer the same way. */
      if (!b || normalizeType(b.object_type) !== "inquiry") { offenders.push(id); continue; }
      /* ==== CASE-4 / DEC-72: A PUBLISHED CASE CANNOT BE QUIETLY SET DOWN, AND
         THIS GUARD EXISTS BECAUSE THE RULE LOST ITS CARRIER RATHER THAN BECAUSE
         ANYONE CHANGED IT.
         The catalog's STATES comment has said it since REC-14, in these words:
         *"DELIBERATELY NOT ADDED: `published -> deferred|dismissed`. Ageing is
         what happens to a finding NOBODY published (D-79); a published case
         cannot quietly stop being worked on, because it is already out in the
         world."* The enforcement was the EDGE TABLE — `published` had no
         disposition edges — and under DEC-72 a case member sits at `concluded`,
         which does carry them (REC-13's rule that a conclusion nobody published
         still ages). So without this, publishing a case would become the way to
         make it deferrable, and D-79's ruling would be reversed by a lifecycle
         change nobody read as reversing it.
         REFUSED BY NAME rather than as a generic ILLEGAL_TRANSITION, on
         PUBLISHED_CANNOT_DIVIDE's precedent: the two say different things to a
         member, and "this is not a legal move in the table" would be false here
         — the move IS in the table, and what forbids it is the case relation. */
      if (this.#caseMember(id)) { published.push({ id, from: b.current_state }); continue; }
      if (!(LEGAL[b.current_state] || []).includes(to)) illegal.push({ id, from: b.current_state });
    }
    /* DEC-49 REGION is-dispose-inquiries — REC-64/C-33.13. The kind check alone;
       the transition check below refuses with a code eight sites mint. */
    if (offenders.length)
      /* né NOT_PROBLEMS: REC-10's one wire change inside this op (DATA-MODEL
         §2.7 change 13 — the refusal stops naming a construct that no longer
         exists). */
      return { ok: false, reason: "NOT_INQUIRIES", offenders: offenders.sort(),
               detail: "disposition moves an inquiry's state, and this selection carries something else. "
                     + "The set is refused whole rather than narrowed to the inquiries in it." };
    /* END DEC-49 REGION is-dispose-inquiries */
    /* CASE-4 / DEC-72. Before the generic transition refusal, for
       PUBLISHED_CANNOT_DIVIDE's reason: a member told the move is illegal would
       go looking at the state table and find the edge sitting right there. */
    if (published.length)
      return { ok: false, reason: "PUBLISHED_CANNOT_BE_SET_DOWN", to,
               offenders: published.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "a finding that is a member of a published case cannot be deferred or dismissed. "
                     + "AGEING IS WHAT HAPPENS TO A FINDING NOBODY PUBLISHED (D-79): a question the group "
                     + "quietly stopped working is indistinguishable from one that was never asked, which "
                     + "is why it is made visible rather than left to vanish. A published case is already "
                     + "out in the world and cannot stop being worked on quietly — a reader is holding it. "
                     + "What IS available is the route DEC-12 built: reopen it (op=reopen), and let the "
                     + "next edition say what changed." };
    if (illegal.length)
      return { ok: false, reason: "ILLEGAL_TRANSITION", to, offenders: illegal.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "these are not legal moves in the catalog's state table. A move to the state "
                     + "something is already in usually means the view was taken before someone else's "
                     + "disposition, so it is refused rather than treated as a no-op." };

    /* REC-17 / D-5: THE WALK-BACK EDGES, and the criterion is the corpus's own
       rather than a preference. `SB-CORE.md:1507` says retire is "the existing
       TERMINAL transition, which already refuses on a downstream consequence
       (CITED) rather than on the actor", and that is the whole rule:
       **terminal acts on a cited inquiry REFUSE with CITED; reversible acts
       raise the re-evaluation OBLIGATION.** `dismissed` is terminal in the
       sense that matters here — the question is ABANDONED, and nothing succeeds
       it — so an inquiry a live basis leg still reasons from is refused, with
       the offenders named and the DOCUMENT PATH'S OWN REMEDY WORDING
       (SB-CORE.md:944-949, which retire's CITED already words). `deferred` is
       reversible and is NOT refused: it raises the obligation below.
       NO NEW MECHANISM AND NO NEW REFUSAL NAME — this is retire's `CITED` over
       REC-11's reverse index, which is why it is one lookup and not a walk.
       A PUBLISHED dependent counts here, and that is the point rather than a
       side effect: its basis is frozen inside a signed edition, so if the
       question beneath it is abandoned its panel names a question nobody will
       ever answer while its frozen strength still reads. That is the harm this
       item's second negative control produces on purpose. */
    if (to === "dismissed") {
      const cited = [];
      for (const id of sel.members) {
        const rests = this.restsOnLive(id);
        if (rests.all.length) cited.push({ id, citedBy: rests.all });
      }
      if (cited.length)
        return { ok: false, reason: "CITED", to, offenders: cited.sort((a, b) => a.id < b.id ? -1 : 1),
                 detail: "live basis legs still rest on these questions. Dismissing one abandons it, and a "
                       + "claim resting on an abandoned question would go on reading at a strength nobody "
                       + "will ever re-examine — the downstream consequence retire already refuses on. "
                       + "Withdraw those legs first (sever the citation with a reason), or DEFER instead: "
                       + "deferring is reversible and raises the re-evaluation obligation on every "
                       + "dependent rather than stranding it." };
    }

    /* R39 (K102): ONE TEAM'S DISPOSITION NEVER MOVES ANOTHER TEAM'S STANCE. A member more than one project draws on
       (a project document citing it, the citation not severed, counted over every project whatever the viewer
       sees) is not moved here: the set is refused naming each such member, and no project the viewer may not see;
       a disposition is then taken per project through the project-scoped set-aside (`queue`'s `op=proposedispose`).
       `divide` and `ground` stay shared acts, because they change what the question is. */
    /* DEC-49 REGION is-dispose-shared */
    const shared = [];
    for (const id of sel.members) {
      const drawing = this.projectsDrawingOn(id);
      if (drawing.length > 1) {
        const seen = drawing.filter((p) => this.membership.inSight(p, viewer));
        shared.push({ id, projects: seen, ...(seen.length < drawing.length ? { others_out_of_view: true } : {}),
                      ...(drawing.truncated ? { truncated: true, bound: PROJECTS_DRAWING_MAX } : {}) });
      }
    }
    if (shared.length)
      return withRow({ ok: false, reason: "DRAWN_ON_BY_SEVERAL_PROJECTS", to,
                       offenders: shared.sort((x, y) => (x.id < y.id ? -1 : 1)),
                       detail: "more than one project draws on these questions, and a disposition here would move "
                             + "every project's stance at once. Set each aside for your own project instead "
                             + "(op=proposedispose), which leaves the others where they are. Nothing was moved." });
    /* END DEC-49 REGION is-dispose-shared */

    const when = this.#when();
    const disposed = [];
    /* R22: THE WHOLE SET MOVES OR NONE OF IT DOES. Every member's promotion runs inside ONE record-core transaction
       (its R32: a nested promotion joins it), so a refusal after the first rolls back every member already moved. */
    const refusal = this.record.transact(() => {
      for (const id of sel.members) {
        const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
        const cur = this.#one(`SELECT bundle_sha, current_state FROM bundles WHERE bundle_id=?`, id);
        if (!liveMd || liveMd.content === null)
          return { ok: false, reason: "NO_DOCUMENT", bundleId: id,
                   detail: "this inquiry has no readable bundle.md, so its state cannot be moved; nothing was moved" };
        /* C-4.2: prior_state obliges a state_history ENTRY (timestamp, from_state, to_state, blurb, author). */
        let text = appendStateHistory(liveMd.content, {
          timestamp: when, from_state: cur.current_state, to_state: to, blurb: why, author: author || "member" });
        if (!text)
          return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", bundleId: id,
                   detail: "this document's state_history block is not in a shape this grammar can extend in "
                         + "place, and a disposition that recorded no transition would leave prior_state "
                         + "pointing at a history the document does not carry (C-4.2); nothing was moved" };
        text = setScalar(text, "prior_state", cur.current_state);
        text = setScalar(text, "current_state", to);
        /* D-169: setOrAdd, because C-2.8 requires the reason and an intake document may carry no such line. */
        text = setOrAddScalar(text, "disposition_reason", `"${why}"`);
        text = setScalar(text, "last_updated", `"${when}"`);
        /* C-13.2: a moved last_updated has a Session Log entry. */
        text = appendSessionLog(text,
          `### Session ${when} | ${to === "deferred" ? "Deferred" : "Dismissed"} | ${author || "member"}\n`
          + `Trigger: selection ${handle}\n`
          + `Changes: state ${cur.current_state} to ${to}. Reason: ${why}.\n`);
        const fm = parseFrontmatter(text).data || {};
        const promoted = this.#promote({
          bundleId: id, base: cur.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${rand(4)}`,
          author: author || "member",
          files: [mdFile(text), ...carriedFiles(this.sql, id)],
          meta: { object_type: "inquiry", title: fm.title, current_state: to, prior_state: cur.current_state,
                  created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
        });
        if (!promoted.ok) return { ...promoted, bundleId: id, detail: (promoted.detail ? promoted.detail + " " : "")
                                   + "The set moves whole or not at all, so nothing was moved." };
        disposed.push(id);
      }
      return null;
    });
    if (refusal) return refusal;
    /* REC-17 / D-5, the OTHER half: a REVERSIBLE act raises the obligation (R21), a query derived from the state this
       act just moved and told to the actor; nothing is written to the dependents. `dismissed` raises none: a cited
       inquiry cannot be dismissed at all. */
    let reevaluation = {};
    if (to === "deferred") {
      let raises = [];
      for (const id of disposed) {
        const r = this.#raise(id, "deferred", when, viewer);
        if (r === null) { raises = null; break; }
        raises.push({ ...r, raised: r.raised.map((d) => ({ ...d, target: id })) });
      }
      reevaluation = Inquiry.#reevaluation("deferred", when, raises);
    }
    return { ok: true, to, reason: why, handle, disposed: disposed.sort(), weight: "refuse", drift: sel.drift,
             ...reevaluation };
  }

  /** R39: the projects drawing on an inquiry — a project whose document cites it (connections' `refs`, kind `cites`),
   *  the citation not severed (connections R22), over every project whatever any viewer sees. At most
   *  `PROJECTS_DRAWING_MAX`, the first by id, the list carrying `truncated` when one more draws on it (N183). The
   *  candidates are read a page at a time, one past the bound, and a severed citer takes no slot, so the bound never
   *  decides whether more than one project draws on it. */
  projectsDrawingOn(id) {
    const out = [];
    out.truncated = false;
    if (!id) return out;
    let after = "";
    for (;;) {
      const page = this.#rows(
        `SELECT DISTINCT r.bundle_id AS p FROM refs r JOIN bundles b ON b.bundle_id = r.bundle_id
          WHERE r.target_id=? AND r.kind='cites' AND b.object_type='project' AND r.bundle_id > ?
          ORDER BY r.bundle_id LIMIT ?`, id, after, PROJECTS_DRAWING_MAX + 1);
      for (const r of page) {
        after = r.p;
        if (this.connections.edgeSevered(r.p, id, "cites")) continue;
        if (out.length === PROJECTS_DRAWING_MAX) { out.truncated = true; return out; }
        out.push(r.p);
      }
      if (page.length <= PROJECTS_DRAWING_MAX) return out;
    }
  }

  /* THE ONE live-basis-leg predicate (REC-17 / D-5). Which inquiries REASON
   * FROM this one — `SELECT ... FROM inquiry_basis WHERE target_id=?`, the
   * single indexed lookup REC-11 built `inquiry_basis_target` for, and the
   * whole mechanism P-64 asks for. #citesInto answers the CITATION question for
   * information objects; this answers the BASIS question for inquiries, and the
   * two are deliberately separate because a citation and a leg of a claim are
   * different relationships (D-21, REC-11).
   *
   * LIVE, and each exclusion is a rule rather than a filter:
   *   - the citing document is read for the REFERENCE entry's status, exactly
   *     the way #citesInto reads it (basis ⊆ references[], C-6.3 as REC-11
   *     rewrote it), so a SEVERED edge does not block: severing is the recorded
   *     decision to stop relying, and treating it as live would make the
   *     refusal unclearable by the very act doctrine prescribes for clearing it.
   *   - a citing document that CANNOT BE READ counts as live. Refusing on what
   *     cannot be verified is the conservative arm and it is retire's already.
   *   - a `divided` dependent does not block. It is TERMINAL (DEC-28) and its
   *     legs were re-homed onto children that carry their own, so its basis is
   *     frozen history; counting it would refuse an act on behalf of a question
   *     that has been carried forward, and the remedy — sever the leg — cannot
   *     be performed on a terminal document at all.
   *
   * The offenders are named by (bundle_id, ord): REC-11's ord is what makes a
   * leg ADDRESSABLE, and one document legitimately carries two legs (D4). */
  restsOnLive(id) {
    const confirmed = [], severed = [], frozen = [];
    for (const r of this.#rows(
      `SELECT ib.bundle_id, ib.ord, ib.role, b.current_state, b.object_type
         FROM inquiry_basis ib JOIN bundles b ON b.bundle_id = ib.bundle_id
        WHERE ib.target_id=? ORDER BY ib.bundle_id, ib.ord`, id)) {
      const leg = { bundle_id: r.bundle_id, ord: r.ord, role: r.role || null,
                    state: r.current_state };
      if (r.current_state === "divided") continue;
      /* D-267: the same one severance confirmation #citesInto and the queue's
         ancestor walk read, with NO relation constraint — a basis leg is a
         reference entry and the leg does not restate the rel. */
      if (this.connections.edgeSevered(r.bundle_id, id)) { severed.push(leg); continue; }
      /* FROZEN vs WORKING, and the split is the D-5 refinement this item makes
         (reported to CONDUCT rather than buried): a `published` dependent's
         basis is inside a SIGNED EDITION and cannot be edited at all, so it can
         never withdraw a leg. Both sets are returned; which one an act refuses
         on is the ACT's rule, stated at the act. */
      /* CASE-4 / DEC-72: the question is THE CASE RELATION, not the state word.
         The sentence above is unchanged and is now literally true rather than
         true by proxy: what makes a dependent's basis unwithdrawable is that its
         current version is the one a case froze and signed — which is what the
         pin says, and what `current_state: published` used to stand in for.
         A dependent that was published and has since been reopened is WORKING
         again and belongs in `confirmed`, which is exactly where the state word
         put it too; the difference is that this asks the fact directly. */
      (this.#caseMember(r.bundle_id) ? frozen : confirmed).push(leg);
    }
    return { confirmed, frozen, severed, all: [...confirmed, ...frozen] };
  }


  /* REC-16: DIVIDING an inquiry. open|surfaced|concluded -> `divided`, which is
   * TERMINAL (DEC-28), with the parent's legs re-homed onto children that each
   * supersede it.
   *
   * WHY THIS EXISTS AND IS NOT HOUSEKEEPING. Weakest-link composition means an
   * inquiry mixing one well-supported claim with one thin one is worth exactly
   * the thin one. Without division a member's only options are to OVERCLAIM or
   * to STAY SILENT, and both are failures of the same kind this repository's
   * threat model is about. Division is the honest third move: say that the
   * question was two questions, and answer each at what it is actually worth.
   *
   * AND THE ABUSE IS THE SAME MECHANISM (R4), which is why the disclosure below
   * is the point of this act rather than a detail. Dividing would otherwise be a
   * CHEAPER WAY TO SHED A FINDING THAT CUTS AGAINST YOU than severing it: move
   * the inconvenient leg onto a child nobody publishes and the published half
   * looks stronger, with nothing on the record saying what happened. Three
   * things close that, and all three are enforced rather than encouraged:
   *
   *   1. NO LEG MAY BE DROPPED. Every ord in the parent's basis is apportioned
   *      to at least one child, INCLUDING every `cuts_against` leg, and the
   *      refusal names the orphans (NO_APPORTIONMENT). Severance is the act that
   *      removes material and it costs a per-leg reason; division only re-homes,
   *      so it does not do severance's work at a discount (DEC-29(a)).
   *   2. EACH CHILD NAMES ITS PARENT AND EVERY SIBLING, in its own bundle.md, in
   *      the keys REC-14 reserved for exactly this and projected through the
   *      ordinary promote path. A reader who can see one half must be able to
   *      see that the other half EXISTS.
   *   3. THE PARENT RECORDS WHERE EVERY LEG WENT, in `division_apportionment`,
   *      and the catalog's `divided` entry requirements refuse the state without
   *      it — so a hand-written document cannot wear `divided` while quietly
   *      losing a leg.
   *
   * ONE AUTHORED REASON FOR THE WHOLE DIVISION (DEC-29(a)), and NO per-leg
   * reason. The per-leg judgement is already recorded per leg, in the
   * apportionment; a second one would be friction theatre on an act whose
   * disclosure is already total. Do not add one by inference.
   *
   * AUTHOR-SCOPED, SETTLED (DEC-30): any `contribute` holder, act attributed. A
   * machine credential is refused BY SHAPE (MACHINE_CANNOT_DIVIDE), the
   * MACHINE_CANNOT_CONCLUDE precedent — a machine may surface a question and may
   * never decide that the group's question was malformed. Owner-scoping was the
   * alternative and was refused for a reason worth keeping here: division is how
   * a member escapes an overclaiming mix, and de-escalation must never require
   * permission from someone whose incentive may run the other way.
   *
   * NO NEW TABLE (decision D5). The division is AUTHORED in bundle.md and the
   * children's `supersedes` edges reach `refs` through the projection that
   * already exists. A division table written by an op would be the first
   * relationship in this record that exists outside the document asserting it.
   *
   * THE MACHINE IS THE CATALOG'S, through vocabFor over the DECLARED spelling,
   * so a legacy focus/problem document — whose own vocabulary has no `divided`
   * — is refused rather than quietly given a state its contract never had. */
  divide(args = {}) { return withRow(this.#divide(args || {})); }
  #divide({ target, reason = "", children = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-divide — REC-64/C-32.7. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_DIVIDE",
               detail: "dividing is a named member's judgement that the group's own question was malformed — "
                     + "that it was two questions — and that judgement carries a name. A machine credential "
                     + "may surface a question and gather what it rests on; it may not restructure the "
                     + "record's questions. Sign in as a member." };
    /* END DEC-49 REGION is-machine-divide */
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "a division records WHY the question was two questions. One authored reason covers the "
                     + "whole restructuring (DEC-29) and nothing is derived, defaulted or proposed: "
                     + "'divided' with no account of why is a state change wearing a correction's clothes." };
    if (why.length > RELEASE_ACK_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `the reason is at most ${RELEASE_ACK_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    if (!target)
      return { ok: false, reason: "NO_TARGET",
               detail: "a division restructures ONE question: pass target=<inquiry id>" };

    /* REC-25 / D-15: the same fail-closed viewer gate every read takes. An
       inquiry the viewer may not see answers NO_SUCH_BUNDLE, identical to an
       absent one, so the refusal discloses nothing. */
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.bundle_sha, b.group_id FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "dividing splits a question, and only an inquiry carries one." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    const parentText = liveMd.content;
    const fm = parseFrontmatter(parentText).data || {};

    /* PUBLISHED_CANNOT_DIVIDE, refused BY NAME and BEFORE the generic edge
       check, because the two say different things to the member. DEC-12 changed
       PUBLISHING — a case may be reopened and republished at a new edition — and
       it did not change this. An EDITION says the case continues; a DIVISION
       says the parent was MALFORMED. A signed edition cannot be retroactively
       declared malformed without erasing what a reader already relied on, and
       the honest route is the one DEC-12 built: reopen it, and let the next
       edition say what changed. */
    /* CASE-4 / DEC-72: THE CASE RELATION, not the state word. The refusal's
       name, its reasoning and its remedy are unchanged — what changes is that
       "is this a published case" is now asked of the pin rather than of a
       lifecycle state that no longer exists. Keying it on `published` after the
       removal would have made this refusal unreachable, and a signed edition
       would have become divisible with the suite green. */
    if (this.#caseMember(target))
      return { ok: false, reason: "PUBLISHED_CANNOT_DIVIDE", target, from: b.current_state,
               detail: "a published case cannot be divided. An EDITION says the case continues; a DIVISION "
                     + "says the parent was malformed, and a hash somebody has already relied on cannot be "
                     + "retroactively declared malformed. Reopen it (op=reopen) and publish what changed as "
                     + "a new edition, which is the act DEC-12 built for exactly this." };

    /* THE MAP RULE: the machine is the catalog's, looked up through vocabFor
       over the DECLARED spelling, never STATES.inquiry by a raw key. */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes("divided"))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "divided", target,
               from: b.current_state, object_type: fm.object_type ?? b.object_type,
               detail: "this is not a legal move in the catalog's state table for this document's own "
                     + "vocabulary. An inquiry divides from open (or its `surfaced` alias) or from "
                     + "concluded; something deferred or dismissed is picked back up first (op=reopen), "
                     + "and a legacy focus/problem document has no divided state at all until its "
                     + "frontmatter is modernized." };

    /* REC-17 / D-5: division is TERMINAL for the parent, so it takes the same
       `CITED` refusal dismissal takes — retire's refusal on a downstream
       consequence rather than on the actor — over REC-11's reverse index. No
       new mechanism and no new refusal name.
       AND THE SET IT REFUSES ON IS NARROWER THAN DISMISSAL'S, which is this
       item's one judgment call and is reported to CONDUCT rather than buried.
       A WORKING dependent (open, concluded, deferred, dismissed) blocks:
       C-6.2's remedies for a leg whose target moved are "restore from history",
       "re-point to the successor" and "sever with a reason", and a working
       document can perform all three — so it is told now, with the offenders
       named, rather than discovering it later. A PUBLISHED dependent does NOT
       block, for the reason the two acts differ: dismissal ABANDONS a question
       and leaves nothing to re-point to, while a division CARRIES IT FORWARD
       into children that supersede it and are resolvable in both directions
       (REC-16). Refusing there would make a case's own publication the thing
       that freezes a malformed question in the record forever — the exact
       overclaim division exists to let a member escape (R4/DEC-28) — and the
       published edition is not stranded: it keeps answering with its own
       signature (DEC-12) and its authors get R7's obligation, which is what
       this item builds. */
    const restsOn = this.restsOnLive(target);
    if (restsOn.confirmed.length)
      return { ok: false, reason: "CITED", target, offenders: restsOn.confirmed,
               detail: "live basis legs still rest on this question. Dividing it declares it MALFORMED and "
                     + "ends it, and a claim resting on it would be left pointing at a question the record "
                     + "has withdrawn. Withdraw those legs first (sever the citation with a reason), or "
                     + "re-point them at the child that carries the half they rely on once it exists." };

    /* THE CHILDREN, and the apportionment they carry. Both AUTHORED: nothing
       here proposes a split, guesses a question, or distributes a leg. */
    const kids = Array.isArray(children) ? children.filter((c) => c && typeof c === "object") : [];
    if (kids.length < 2)
      return { ok: false, reason: "TOO_FEW_CHILDREN", target, got: kids.length,
               detail: "a division produces at least TWO questions. One child is a rename and zero is a "
                     + "deletion, and neither is what dividing claims about the parent." };
    const ids = kids.map((c) => String(c.id ?? "").trim());
    for (const id of ids)
      if (!BUNDLE_ID_RE.test(id) || normalizeType(OBJECT_TYPES[id.split("-")[0]]) !== "inquiry")
        return { ok: false, reason: "BAD_CHILD_ID", target, child: id,
                 detail: "each child is named with a canonical INQ- id: a division produces questions, and "
                       + "the id grammar is what makes them addressable by everything that will cite them." };
    if (new Set(ids).size !== ids.length)
      return { ok: false, reason: "BAD_CHILD_ID", target, children: ids,
               detail: "two children carry the same id: a leg apportioned to a child named twice has one "
                     + "home, not two." };
    if (ids.includes(target))
      return { ok: false, reason: "BAD_CHILD_ID", target,
               detail: "a division's child cannot be the parent itself: the parent is terminal and the "
                     + "children are what carry the question forward." };
    for (const id of ids) {
      const exists = this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, id);
      if (exists)
        return { ok: false, reason: "CHILD_EXISTS", target, child: id,
                 detail: "this id already names a record. A division CREATES its children, so re-using an "
                       + "existing id would overwrite a question somebody else is working on." };
    }
    for (const c of kids) {
      const q = String(c.question ?? "").trim();
      if (!q)
        return { ok: false, reason: "NO_CHILD_QUESTION", target, child: String(c.id ?? ""),
                 detail: "each child is a QUESTION and its question is authored, never derived from the "
                       + "parent's. The whole claim a division makes is that these are two different "
                       + "questions, so a child that cannot state its own has not been shown to be one." };
      if (q.length > RELEASE_ACK_MAX || /["\\\r\n]/.test(q))
        return { ok: false, reason: "BAD_CHILD_QUESTION", target, child: String(c.id ?? ""),
                 detail: `a child's question is at most ${RELEASE_ACK_MAX} characters and cannot `
                       + `contain a quote, a backslash, or a newline: the restricted frontmatter grammar `
                       + `has no escapes` };
    }

    /* THE APPORTIONMENT. Addressed by ORDINAL, because duplicate targets are
       legal by design (D4 — one document, two legs) and keying on the target
       would let one assignment discharge two legs. A leg may land on ONE child
       or on BOTH; what it may not do is land nowhere. */
    const legs = Array.isArray(fm.basis) ? fm.basis.filter((l) => l && typeof l === "object") : [];
    if (!legs.length)
      return { ok: false, reason: "NO_APPORTIONMENT", target, orphans: [],
               detail: "this inquiry rests on nothing, so there is nothing to apportion and both children "
                     + "would inherit nothing. A standing objective with no legs is not two questions yet "
                     + "(DEC-22); it is one question nobody has gathered anything for." };
    const homes = new Map();               // ord -> [child ids], in children order
    for (let k = 0; k < kids.length; k++) {
      const raw = Array.isArray(kids[k].legs) ? kids[k].legs : null;
      if (!raw || !raw.length)
        return { ok: false, reason: "NO_APPORTIONMENT", target, child: ids[k],
                 detail: `${ids[k]} was apportioned no leg of the parent's basis. A child that inherits `
                       + `nothing is a NEW question, not a half of this one — open it as its own inquiry `
                       + `rather than calling it a division.` };
      for (const o of raw) {
        const ord = Number(o);
        if (!Number.isInteger(ord) || ord < 0 || ord >= legs.length)
          return { ok: false, reason: "BAD_APPORTIONMENT", target, child: ids[k], ord: o,
                   detail: `a leg is apportioned by its ORDINAL in the parent's basis (0..${legs.length - 1}); `
                         + `'${o}' names none. Ordinals rather than targets, because one document `
                         + `legitimately carries two legs (D4).` };
        if (!homes.has(ord)) homes.set(ord, []);
        if (!homes.get(ord).includes(ids[k])) homes.get(ord).push(ids[k]);
      }
    }
    const orphans = [];
    for (let i = 0; i < legs.length; i++) if (!homes.has(i)) orphans.push(i);
    if (orphans.length) {
      const cutting = orphans.filter((i) => legs[i].role === "cuts_against");
      return { ok: false, reason: "NO_APPORTIONMENT", target,
               orphans: orphans.map((i) => ({ ord: i, target: legs[i].target ?? null, role: legs[i].role ?? null })),
               cuts_against_orphans: cutting.length,
               detail: `every leg gets a home. ${orphans.length} leg(s) were apportioned to no child`
                     + (cutting.length ? `, and ${cutting.length} of them CUT AGAINST this inquiry` : "")
                     + ". Division RE-HOMES material and only severance REMOVES it, which is why dividing "
                     + "cannot do severance's work at a discount (R4): apportion them, or sever them with "
                     + "a reason, which is the act that takes material out of a question." };
    }

    const when = this.#when();
    /* D-436: THE CHILDREN ARE CREATIONS, written AFTER the parent's revision — so whether each can name its producing
       group is asked HERE, before anything moves, and never discovered by a child refused after the parent is
       already divided. A child's bytes are derived from the parent's and carry its `group:` line; `promote` stamps
       the store's recorded group over it, or, recording none, keeps the parent's. With neither, no child could name
       one. This line was a literal fallback. */
    const pg = this.promotion.fact("producingGroup");
    if (!(pg.ok && pg.value) && !(typeof fm.group === "string" && fm.group.trim()))
      return this.#groupUndetermined("inquirydivide",
        `${target}'s children would be new documents that must name the group that produced them; this store `
        + `records none and ${target}'s own document names none, so nothing was divided.`);

    /* THE CHILDREN ARE DERIVED FROM THE PARENT'S OWN DOCUMENT, not built from a
       template here. A template would be this file's private idea of what an
       inquiry looks like, and it would fall behind the catalog's the first time
       the shape moved; deriving means a child is conformant for whatever
       contract the parent was authored under, which is the same reason every
       projection in this file reads the document rather than restating it. What
       is REPLACED is everything the child must not inherit: the parent's answer,
       the parent's history, the parent's session log. */
    /* R24 (N360): the parent's legs and groups as its bytes write them, lined up with the parsed ones (an entry of the
       basis that is not a leg is not carried, as `legs` above does not count it); null when they cannot be lined up. */
    const allBasis = Array.isArray(fm.basis) ? fm.basis : [];
    const basisRows = blockEntries(parentText, "basis");
    const rawLegs = basisRows && basisRows.length === allBasis.length
      ? allBasis.flatMap((l, i) => (l && typeof l === "object" ? [basisRows[i]] : [])) : null;
    const ordGround = legs.map((l) => (typeof l.ground === "string" && l.ground.trim() ? l.ground.trim() : null));
    const groupOrds = new Map();
    ordGround.forEach((g, i) => { if (g !== null) groupOrds.set(g, [...(groupOrds.get(g) || []), i]); });
    const groundRows = blockEntries(parentText, "grounds");
    const rawGrounds = groundRows && Array.isArray(fm.grounds) && groundRows.length === fm.grounds.length
      ? groundRows.map((lines, i) => ({ lines,
          label: fm.grounds[i] && typeof fm.grounds[i].ground === "string" ? fm.grounds[i].ground.trim() : null }))
        .filter((r) => r.label !== null)
      : null;
    const plans = [];
    for (let k = 0; k < kids.length; k++) {
      const id = ids[k];
      const q = String(kids[k].question).trim();
      const sibs = ids.filter((x) => x !== id);
      const mine = [...homes.entries()].filter(([, to]) => to.includes(id)).map(([ord]) => ord).sort((x, y) => x - y);
      const childLegs = mine.map((ord) => legs[ord]);
      let text = parentText;
      text = setScalar(text, "id", id);
      text = setScalar(text, "title", `"${fmSafe(deriveInquiryTitle(q) ?? q)}"`);
      text = setScalar(text, "current_state", "open");
      text = setScalar(text, "prior_state", "null");
      text = setOrAddScalar(text, "created", `"${when}"`);
      text = setOrAddScalar(text, "last_updated", `"${when}"`);
      /* A NEW document has no history of its own, and inheriting the parent's
         would be the child claiming transitions it never made — the append-only
         surface C-5.1 guards, filled with somebody else's past. REMOVED and
         re-opened rather than overwritten in place: a parent that has been
         concluded carries a populated BLOCK, and setting the key line alone
         would leave its indented entries behind as array items belonging to
         nothing (C-2.1's "array item outside any block", which is exactly what
         the catalog said the first time this was written the short way). */
      text = removeBlock(text, "state_history");
      text = setOrAddScalar(text, "state_history", "[]");
      /* The parent's ANSWER is not the child's. An inquiry authored before
         `concluded` existed carries neither key; one divided out of a concluded
         parent carries both, and carrying them forward would put the parent's
         conclusion on an open question nobody has answered. */
      text = setOrAddScalar(text, "conclusion", `""`);
      /* REC-136: and the reading the parent's conclusion ADOPTED (§7.1 item 6)
         is the parent's answer too — cleared for the rule above. #setScalar,
         not setOrAdd: a parent concluded before item 6 carries neither key,
         and adding two empty ones to its children would be bytes nobody asked
         for. */
      text = setScalar(text, "conclusion_version", `""`);
      text = setScalar(text, "conclusion_claim", `""`);
      text = setOrAddScalar(text, "falsifier", `""`);
      /* REC-117, AND IT IS THE SECOND HALF OF THE SAME RULE THE THREE LINES
         ABOVE STATE. A parent concluded under a falsifier override carries the
         pair; carrying it into a child would put a member's name, and their
         acceptance that no falsifier could be stated, on an OPEN question
         nobody has answered — the parent's answer arriving on the child by the
         one route the lines above exist to close. Swept rather than noticed:
         these are the only two sites in this file that write `falsifier`. */
      text = setOrAddScalar(text, "falsifier_override_by", `""`);
      text = setOrAddScalar(text, "falsifier_override_at", `""`);
      text = setOrAddScalar(text, "disposition_reason", `""`);
      /* THE DISCLOSURE (R4), in the keys REC-14 RESERVED for it with no
         producer. This act is the producer. */
      text = setOrAddScalar(text, "division_parent", target);
      text = setOrAddScalar(text, "division_siblings", `[${sibs.join(", ")}]`);
      /* references: the apportioned legs' targets, plus the supersedes edge back
         to the parent WITH ITS REASON — the requirement C-6.1 gains with this
         item, because before it `supersedes` passed on the strength of being in
         a list and had no producer at all. */
      /* R4 (N522): a leg on an imported finding reference is carried verbatim and is never a `references[]` entry. */
      const refTargets = [...new Set(childLegs.map((l) => l.target)
        .filter((t) => typeof t === "string" && !isImportedRef(t)))];
      text = setOrAddBlock(text, "references", [
        ...refTargets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"]),
        `  - target: ${target}`, "    rel: supersedes", "    status: confirmed",
        `    reason: "${fmSafe(why)}"`]);
      /* R24 (N360): THE LEGS VERBATIM — each apportioned leg's own lines from the parent's bytes, so a leg that names
         a passage (`content_id`, an extent, the capture it was made against) still names it on the child, and the
         child inherits what rests on that passage (reevaluation's passage-level causes) rather than resting on the
         whole document. Rebuilt from the parsed leg only when the parent's block cannot be lined up with its legs
         (a replayed shape), and then every field the rebuild knows, the passage among them.
         THE PARTITION TRAVELS ONLY WHOLE (R34, DEC-32). A group's row asserts that ITS legs are enough on their own,
         under a name and a date; a child given every leg of each group its legs belong to carries those groups
         verbatim, rows and labels. A child given part of a group would carry an assertion nobody made about the
         part, so it carries no partition at all: the ungrouped reading, no stronger than its weakest leg, which the
         child's own members may restructure (op=inquiryground). */
      const grouped = ordGround.some((g) => g !== null);
      const keepGroups = grouped && !!rawGrounds && mine.every((ord) => ordGround[ord] !== null
        && groupOrds.get(ordGround[ord]).every((o) => mine.includes(o))
        && rawGrounds.some((r) => r.label === ordGround[ord]));
      const legLines = (ord) => {
        const seg = rawLegs ? rawLegs[ord] : null;
        const lines = seg || legRebuilt(legs[ord]);
        return keepGroups ? lines : lines.filter((ln) => !/^\s+ground:/.test(ln));
      };
      text = setOrAddBlock(text, "basis", mine.flatMap(legLines));
      if (keepGroups) {
        const labels = new Set(mine.map((ord) => ordGround[ord]));
        text = setOrAddBlock(text, "grounds", rawGrounds.filter((r) => labels.has(r.label)).flatMap((r) => r.lines));
      } else text = removeBlock(text, "grounds");
      /* The parent's division block is the PARENT's, never the child's: a child
         carrying one would claim to have been divided itself. */
      text = removeBlock(text, "division");
      text = removeBlock(text, "division_apportionment");
      /* R47, C-2.17 (N345): the parent's contradiction link and its resolution are the parent's. A child naming the same
         candidate would be a second question for one conflict, and a resolution without the link is refused (C-2.12). */
      text = removeBlock(text, "contradiction");
      text = removeBlock(text, "resolution");
      text = setSection(text, "## Question", [q]);
      /* THE DISCLOSURE FOR A PERSON TO READ, beside the frontmatter the gates
         and the projections read — the same two-places discipline op=publish
         takes with `## What This Excludes`. A disclosure only a parser can find
         is not a disclosure. */
      text = setSection(text, "## What It Rests On", [
        `Divided out of ${target} on ${when} by ${who}.`, "",
        why, "",
        `The other half of that question stays on the record: ${sibs.join(", ")}. `
        + `${target} is the divided parent and records where every leg went, including any leg that cuts `
        + `against this question.`]);
      text = setSection(text, "## Conclusion", []);
      text = setSection(text, "## What Would Falsify This", []);
      text = setSection(text, "## Session Log", [
        `### Session ${when} | Divided out | ${who}`,
        `Trigger: op=inquirydivide on ${target}`,
        `Changes: created from ${target}, ${childLegs.length} leg(s) apportioned here.`,
        `Parent: ${target}`,
        `Siblings: ${sibs.join(", ")}`,
        `Reason: ${why}`]);
      plans.push({ id, q, sibs, mine, legs: childLegs, text });
    }

    /* PRE-FLIGHT EVERY CHILD BEFORE ANYTHING IS WRITTEN, through the catalog's
     * own functions — the ones promote itself will run.
     *
     * WHY IT IS HERE AND NOT LEFT TO promote. The parent has to be written
     * FIRST: a child's disclosure is checked against the PARENT's own
     * `division.into`, so a child written before the parent moved would be
     * refused NO_SIBLING_DISCLOSURE by a parent that has not been divided yet.
     * That ordering is the right one — a child supersedes a parent that IS
     * divided — but it means a child refused at ITS write would leave a terminal
     * parent naming a question that does not exist. So every child is judged
     * here, against the same rules, before the parent moves; what remains after
     * this gate is the promote-internal failures (a collision, an oversize
     * inline), which cannot arise for a freshly created document of this size.
     *
     * The alternative — write the children first and skip the resolved check
     * while the parent is mid-division — was rejected outright: an exemption
     * saying "the disclosure is not checked during the act that produces
     * disclosures" is the hole this whole item exists to close. */
    for (const pl of plans) {
      const cf = parseFrontmatter(pl.text).data || {};
      const findings = [];
      supersedesEdgeFindings(cf, findings);
      divisionDisclosureFindings(cf, findings);
      /* R23 (`inquiry-grammar` R1–R2, R4): the entry arm, as the child's own promotion will judge it (R11). */
      checkInquiryExtension({ fm: cf, publishedRegistry: this.#publishedRegistry(pl.id,
        pl.legs.map((l) => l.target).filter((t) => typeof t === "string")),
        /* REC-18: the earned registry for the CHILD, judged before the parent
           moves exactly as every other rule here is. A child inherits the
           parent's subject_entity through the copied frontmatter, so an
           apportioned earned leg is re-confirmed against the record rather than
           carried across on trust. */
        earnedRegistry: this.earnedForDoc(cf, pl.legs) }, findings);
      /* R47: the contradiction arm, as the child's promotion will judge it */
      for (const x of contradictionFindings(cf)) findings.push({ check: x.check, severity: "error", message: x.detail });
      const errs = findings.filter((x) => x.severity === "error");
      if (errs.length)
        return { ok: false, reason: "CHILD_REFUSED", target, child: pl.id,
                 findings: errs.map((x) => ({ check: x.check, detail: x.message })),
                 detail: `the document this division would create for ${pl.id} would not pass the catalog, `
                       + `so nothing was written: the parent is untouched and no child exists. A division `
                       + `that landed half-applied would leave a terminal parent naming a question nobody `
                       + `can open.` };
    }

    /* THE PARENT MOVES FIRST, and every child follows. The pre-flight above is
       why this order and not the other. */
    let text = parentText;
    const withHistory = appendStateHistory(text, {
      timestamp: when, from_state: b.current_state, to_state: "divided",
      blurb: why, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a division "
                     + "recording no transition would leave prior_state pointing at a history the document "
                     + "does not carry (C-4.2)" };
    text = withHistory;
    text = setScalar(text, "prior_state", b.current_state);
    text = setScalar(text, "current_state", "divided");
    /* `disposition_reason` is UNTOUCHED (DEC-28). Division's reason belongs to
       the ACT; routing it through the disposition field would make one field
       carry two grammars — a stance toward a question, and an account of a
       restructuring — and every consumer of the field would have to know which
       one it was holding. */
    text = setOrAddBlock(text, "division", [
      `  reason: "${fmSafe(why)}"`,
      `  apportioned_by: ${who}`,
      `  at: "${when}"`,
      `  into: [${ids.join(", ")}]`]);
    /* WHERE EVERY LEG WENT, one row per (leg, child). A second top-level key
       rather than a member of the map above because the restricted grammar
       cannot express an array of objects inside a map — the same split REC-14's
       completeness / completeness_excluded pair takes, for the same reason.
       `role` is carried on the row so the account is readable without joining it
       back to basis[]: what a reader checks first is where the legs that CUT
       AGAINST the case went. */
    const rows = [];
    for (let i = 0; i < legs.length; i++)
      for (const to of homes.get(i))
        rows.push([`  - ord: ${i}`, `    target: ${legs[i].target}`,
                   `    role: ${legs[i].role ?? "supports"}`, `    to: ${to}`]);
    text = setOrAddBlock(text, "division_apportionment", rows.flat());
    text = setScalar(text, "last_updated", `"${when}"`);
    /* The account in the BODY as well as the frontmatter, the op=publish
       precedent: the frontmatter is what the gates and the projections read,
       this is what a person reads. The parent's own conclusion, where it had
       one, is kept above it — a division does not unsay what the group
       concluded, it says the question was two questions. */
    text = setSection(text, "## Conclusion", [
      ...(typeof fm.conclusion === "string" && fm.conclusion.trim() ? [fm.conclusion, ""] : []),
      `Divided on ${when} by ${who} into ${ids.join(", ")}: ${why}`, "",
      "Where every leg went:", "",
      ...legs.map((l, i) => `- ${l.target}${l.role === "cuts_against" ? " (cuts against)" : ""} -> `
                          + `${homes.get(i).join(", ")}`)]);

    const entry = `### Session ${when} | Divided | ${who}\n`
                + `Trigger: op=inquirydivide on ${target}\n`
                + `Changes: state ${b.current_state} to divided (terminal).\n`
                + `Into: ${ids.join(", ")}\n`
                + `Reason: ${why}\n`
                + `Apportioned: ${legs.length} leg(s), ${rows.length} placement(s), `
                + `${legs.filter((l) => l.role === "cuts_against").length} cutting against.\n`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cutAt = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
    }

    /* R26: THE PARENT AND EVERY CHILD LAND TOGETHER OR NONE DOES. The parent is written first (a child's disclosure is
       checked against the parent's own `division.into`), and every promotion runs inside ONE record-core transaction
       (its R32), so a child refused after the parent rolls the parent back with it. */
    let promoted = null;
    const created = [];
    const refused = this.record.transact(() => {
      promoted = this.#promote({
        bundleId: target, base: b.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${rand(4)}`,
        author: who,
        files: [mdFile(text), ...carriedFiles(this.sql, target)],
        meta: { object_type: fm.object_type ?? b.object_type,
                title: fm.title, current_state: "divided", prior_state: b.current_state,
                created: fm.created, last_updated: when,
                criticality: fm.criticality ?? null },
      });
      if (!promoted.ok) return { ...promoted, target };
      for (const pl of plans) {
        const cp = this.#promote({
          bundleId: pl.id, base: null, snapKey: `${when.replace(/[-:]/g, "")}_${rand(4)}`,
          author: who,
          files: [mdFile(pl.text)],
          meta: { object_type: fm.object_type ?? b.object_type,
                  title: deriveInquiryTitle(pl.q) ?? pl.q,
                  current_state: "open", prior_state: null,
                  created: when, last_updated: when,
                  criticality: fm.criticality ?? null },
        });
        if (!cp.ok)
          return { ...cp, target, child: pl.id,
                   detail: `${cp.detail ? cp.detail + " " : ""}The division lands whole or not at all, so nothing was `
                         + `written: the parent is untouched and no child exists.` };
        created.push({ id: pl.id, question: pl.q, siblings: pl.sibs, legs: pl.mine, bundleSha: cp.bundleSha });
        /* R44 (N149): the child is the parent's question asked again, in the browser the parent's was asked in. */
        this.sql.exec(`INSERT OR IGNORE INTO inquiry_member_agents (bundle_id, user_agent, at)
                       SELECT ?, user_agent, at FROM inquiry_member_agents WHERE bundle_id=?`, pl.id, target);
      }
      return null;
    });
    if (refused) return refused;

    return { ok: true, target, from: b.current_state, to: "divided", terminal: true,
             bundleSha: promoted.bundleSha,
             into: ids, children: created,
             apportionment: legs.map((l, i) => ({ ord: i, target: l.target ?? null,
               role: l.role ?? "supports", to: homes.get(i) })),
             cuts_against: legs.filter((l) => l.role === "cuts_against").length,
             reason: why, apportioned_by: who, at: when, weight: "single",
             /* REC-17: supersession is the ORIGINAL raiser of R7's obligation
                (P-64), and this act is its producer. The dependents named here
                are the FROZEN ones — a working dependent would have refused the
                act above — and nothing is written to them: the obligation is a
                query, derived from the supersedes edge the children just made,
                and their strengths are untouched. */
             ...this.#reevaluationField(target, "supersession", when, viewer),
             next: "each child is OPEN and carries a supersedes edge back to this parent, this parent's id "
                 + "and every sibling's. This question is terminal: it is answered by its children now." };
  }


  /* ================================================================   * REC-45 / DEC-32: `op=inquiryground` — THE ACT THAT AUTHORS THE STRUCTURE.
   *
   * REC-42 built the partition and both gates that defend it, and left one gap
   * routed rather than closed: NOTHING AUTHORED IT. Grounds reached the record
   * only through a hand-written `bundle.md` promoted by op=promote, so DEC-32
   * clause 6 — *"RESTRUCTURING AFTER SEEING THE STRENGTH IS LEGAL, RECORDED AND
   * ATTRIBUTED — never blocked… the system may NOTICE the pattern"* — was
   * unreachable in both halves at once, because neither RECORDING nor NOTICING
   * is possible without an act that carries a reason. This is that act.
   *
   * IT IS BUILT ON op=publish's STAMPING SHAPE, and the split is the same one:
   *   AUTHORED, caller-supplied, never prefilled — WHICH legs are grouped
   *   together, what each group is called, the optional STATEMENT on a group,
   *   and the REASON for a restructuring. Nothing here proposes a partition,
   *   guesses a label, or moves a leg on a member's behalf.
   *   STAMPED by the server — `asserted_by` and `at` on every group, taken from
   *   the authenticated session and the clock and NEVER from a parameter.
   *
   * AND THE STAMP IS THE POINT OF THE ITEM. REC-42's gate already refuses a
   * MACHINE asserter and an UNDATED assertion; what it cannot refuse is a
   * caller who supplies a well-formed name and a well-formed date belonging to
   * somebody else, or belonging to an hour before the strength was shown. So a
   * caller's `asserted_by`/`at` are DELETED from every row before the stamp
   * (the op=promote `ownerMemberId` precedent, and the reason it is DELETE and
   * not OVERWRITE: overwriting is a property of the code path taken, deletion
   * is a property of the input, and only the second survives somebody later
   * adding an arm). The old process's CLAUDE.md rule (archived,
   * `docs/archive/CLAUDE-2026-09-26-old-process.md`) was exactly this one — a provenance hop a
   * caller can hand us is one a caller can invent — and this is the last door
   * on the one field in the record that makes a finding STRONGER.
   *
   * WHAT COUNTS AS A RESTRUCTURE, and it is decided from the RECORD:
   * the inquiry is in FIRST AUTHORSHIP when its standing document carries NO
   * partition at all — no leg names a group and there is no `grounds` key — and
   * is being RESTRUCTURED in every other case. A reason is REQUIRED on the
   * second and required on neither half of the first; DEC-32's clause is about
   * a member who *"may legitimately realise their structure was wrong"*, and
   * there must be a structure for that to be true of. The distinction is NOT a
   * parameter and must never become one: a caller who could declare "this is my
   * first time" could walk past the reason gate on every restructuring they
   * made. REMOVING a partition is a restructure too, and takes a reason like
   * any other — it changes an authored structure, and the fact that it moves in
   * the conservative direction is a fact about the ANSWER, not about the act.
   *
   * WHAT CARRIES FORWARD AND WHAT IS RE-STAMPED, which is the other half of
   * making clause 6 legible. A group's row asserts that ITS LEGS are enough on
   * their own, so the assertion is ABOUT the legs: a group whose leg set and
   * statement are unchanged keeps the `asserted_by` and `at` it already had,
   * and a group whose membership moved becomes THIS member's assertion, NOW.
   * Re-stamping everything would erase the one thing DEC-32 says the date is
   * for — *"a structure authored after a strength was seen is a different act
   * from one authored before it, and only a date lets a reader tell"* — and
   * carrying everything forward would let a member re-cut a group under
   * somebody else's name and an older date.
   *
   * ONE GRAMMAR, AT BOTH GATES, AND NO SECOND ONE HERE. The candidate document
   * is judged by `checkInquiryBasis` — the catalog's own function, the same one
   * op=promote runs at the write and the checker runs at the gate — over the
   * SAME two registries promote injects, and it is judged BEFORE a byte moves.
   * The refusal is even called `BASIS_REFUSED`, promote's name, because one
   * function answering twice should not answer under two names. So every REC-42
   * refusal fires through this act: an unattributed label, a half-labelled
   * basis, a machine asserter, an undated assertion, a duplicate label and an
   * empty group. What is refused HERE and could not be refused there is the
   * mapping this act introduces and the document does not have — an ordinal
   * naming no leg, and one leg claimed by two groups.
   *
   * THE PARTITION IS ADDRESSED BY ORDINAL and never by target id, which is
   * REC-16's apportionment decision for REC-16's reason: D4 makes duplicate
   * targets legal, a basis legitimately cites one document for two legs, and
   * target-keying would let one instruction move two legs a member meant to
   * separate. `ord` is the leg's position in `basis[]`, which is what
   * `inquiry_basis` already keys on.
   *
   * TWO STATES REFUSE BY NAME, on op=inquirydivide's precedent that a refusal
   * should say which rule it met. `published`: the pair and the per-group
   * breakdown are inside signed, ratified bytes, and re-cutting the partition
   * underneath them would leave the document composing to something an edition
   * on the record contradicts — DEC-12's route is reopen, restructure,
   * republish. `divided`: the parent was declared MALFORMED and carried forward
   * into children, and re-deriving a terminal parent's strength moves a number
   * its children's own disclosure already pointed at.
   *
   * WHAT IS DELIBERATELY NOT HERE. No NOTICER. DEC-32 says the system MAY
   * notice a weak leg moved into its own group immediately after a strength
   * drop and surface it; this act makes that possible and does not do it, and
   * the difference matters — noticing is a derived read with a surface half
   * (UI-27's), and building it inside the act would put a judgement about the
   * member's motive in the same function that must never refuse them (*"a
   * machine may not refuse the act and must not hide it"*). What this act does
   * instead is leave the evidence a noticer needs where an append-only history
   * keeps it: the pair AS IT STOOD BEFORE the act and after it, written into
   * the Session Log entry beside the reason, and returned to the caller.
   */
  ground(args = {}) { return withRow(this.#ground(args || {})); }
  #ground({ target, grounds, reason = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-ground — REC-64/C-32.8. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_GROUND",
               detail: "grouping is a named member's judgement that some of their reasons are enough on "
                     + "their own to carry their answer, and it is the one act in this record that makes a "
                     + "finding STRONGER. A machine credential may surface a question and gather what it "
                     + "rests on; it may not decide that part of the gathering was sufficient by itself. "
                     + "Sign in as a member." };
    /* END DEC-49 REGION is-machine-ground */
    if (!target)
      return { ok: false, reason: "NO_TARGET",
               detail: "grouping authors the structure of ONE question: pass target=<inquiry id>" };
    if (grounds === undefined)
      return { ok: false, reason: "NO_PARTITION", target,
               detail: "pass grounds[] — an array of { ground, legs: [ord, ...], statement? }, one entry per "
                     + "group, where each ord is a leg's position in this question's basis. Pass an EMPTY "
                     + "array to remove the grouping entirely and let the answer read as its weakest leg "
                     + "again; that is a restructuring like any other and takes a reason." };

    /* REC-25 / D-15: the same fail-closed viewer gate every read takes. An
       inquiry the viewer may not see answers NO_SUCH_BUNDLE, identical to an
       absent one, so the refusal discloses nothing. */
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.bundle_sha FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "a basis is what a QUESTION rests on, and only an inquiry carries one." };
    /* CASE-4 / DEC-72: THE CASE RELATION, not the state word — divide's reason
       exactly, and the stakes here are higher, because this act RAISES A GRADE.
       A restructure that reached a member of a signed edition would leave the
       document composing to something the edition on the record contradicts,
       which is what the refusal below says and what the removal of the state
       would silently have permitted. */
    if (this.#caseMember(target))
      return { ok: false, reason: "PUBLISHED_CANNOT_RESTRUCTURE", target, from: b.current_state,
               detail: "a published case's composed strength and its per-group breakdown are inside signed, "
                     + "ratified bytes. Re-cutting the structure underneath them would leave this document "
                     + "composing to something the edition on the record contradicts. Reopen it "
                     + "(op=reopen), restructure, and publish what changed as a new edition — the route "
                     + "DEC-12 built for exactly this." };
    if (b.current_state === "divided")
      return { ok: false, reason: "DIVIDED_CANNOT_RESTRUCTURE", target, from: b.current_state,
               detail: "this question was declared malformed and carried forward into children that "
                     + "supersede it. Re-deriving its strength now would move a number its children's own "
                     + "disclosure already points at. Restructure the CHILD that carries the half you mean." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its structure cannot be authored" };
    let text = liveMd.content;
    const fm = parseFrontmatter(text).data || {};
    const all = Array.isArray(fm.basis) ? fm.basis : [];
    const legs = all.filter((l) => l && typeof l === "object");
    if (!legs.length)
      /* D-484: routed through the ONE governed site (see `actNoBasis`). */
      return actNoBasis("a grouping is a partition OF THE LEGS, and this question rests on nothing yet. Cite "
                      + "what it rests on first (op=cite); an assertion that nothing is enough on its own is "
                      + "not a thing the record can hold.", { target });
    if (legs.length !== all.length)
      return { ok: false, reason: "UNSPLICEABLE_BASIS", target,
               detail: "this question's basis carries an entry that is not a leg, so the ordinals a "
                     + "partition addresses cannot be lined up against the document. Nothing was written." };

    /* WHAT STANDS TODAY, read from the DOCUMENT — `inquiry_basis` is a
       projection of it and never a second place to state it (D-21). */
    const standingLabel = legs.map((l) => typeof l.ground === "string" && l.ground.trim() ? l.ground.trim() : null);
    const standingRows = Array.isArray(fm.grounds) ? fm.grounds : [];
    const standingByLabel = new Map();
    for (const r of standingRows)
      if (r && typeof r === "object" && typeof r.ground === "string" && !standingByLabel.has(r.ground))
        standingByLabel.set(r.ground, r);
    /* THE DISTINCTION, decided here and from the record alone. Any standing
       label OR any standing `grounds` key — even an empty or malformed one —
       is a structure this act is about to replace. */
    const restructure = standingLabel.some((g) => g !== null)
                     || (fm.grounds !== undefined && fm.grounds !== null);

    const why = String(reason ?? "").trim();
    if (restructure && !why)
      return { ok: false, reason: "NO_REASON", target, restructure: true,
               detail: "this question already carries an authored structure, so changing it is a REVISION "
                     + "and records WHY. Restructuring after seeing a strength is legal and is never "
                     + "blocked (DEC-32) — the defence is that it is visible, which it is not without an "
                     + "account of it. Nothing here is derived, defaulted or prefilled. A FIRST grouping "
                     + "needs no reason: there is no earlier structure for it to be a revision of." };
    if (why && (why.length > RELEASE_ACK_MAX || /["\\\r\n]/.test(why)))
      return { ok: false, reason: "BAD_REASON", target,
               detail: `a reason is at most ${RELEASE_ACK_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };

    /* ---------------- the caller's partition, mapped onto the legs ----------
       THE SHAPE ARMS BELOW ARE THE MAPPING AND NOTHING ELSE. Every rule about
       what a LABEL may say, who may assert it, and whether the partition is
       total belongs to the catalog's `checkGrounds` and is applied to the
       CANDIDATE further down — one grammar, at both gates, never a second copy
       written here because it was convenient. */
    if (!Array.isArray(grounds))
      return { ok: false, reason: "BAD_PARTITION", target,
               detail: "grounds must be an ARRAY of groups, each { ground, legs: [ord, ...] }" };
    const nextLabel = new Array(legs.length).fill(null);
    const claimed = new Map();          // ord -> the label that claimed it
    const asked = [];                   // [{ label, ords, statement }] in the caller's own order
    for (let i = 0; i < grounds.length; i++) {
      const row = grounds[i];
      if (!row || typeof row !== "object" || Array.isArray(row))
        return { ok: false, reason: "BAD_PARTITION", target, at: i,
                 detail: `grounds[${i}] is not an object` };
      const label = typeof row.ground === "string" ? row.ground.trim() : row.ground;
      const ords = row.legs;
      if (!Array.isArray(ords))
        return { ok: false, reason: "BAD_PARTITION", target, at: i,
                 detail: `grounds[${i}].legs must be an array of ordinals — a group is a partition OF THE `
                       + `LEGS, and a group naming none asserts that nothing is enough on its own. Legs are `
                       + `addressed by ORDINAL (their position in basis[]) and never by target id, because `
                       + `one document legitimately carries two legs (D4).` };
      const stmt = row.statement === undefined || row.statement === null ? null : row.statement;
      if (stmt !== null && (typeof stmt !== "string"
          || stmt.length > EDGE_REASON_MAX || /["\\\r\n]/.test(stmt)))
        return { ok: false, reason: "BAD_STATEMENT", target, at: i,
                 detail: `grounds[${i}].statement is at most ${EDGE_REASON_MAX} characters and cannot `
                       + `contain a quote, a backslash, or a newline: the restricted frontmatter grammar `
                       + `has no escapes` };
      for (const raw of ords) {
        if (!Number.isInteger(raw) || raw < 0 || raw >= legs.length)
          return { ok: false, reason: "BAD_PARTITION", target, at: i, ord: raw ?? null, legs: legs.length,
                   detail: `grounds[${i}].legs names ord ${JSON.stringify(raw) ?? "null"}, and this question `
                         + `has legs 0..${legs.length - 1}. An ordinal that addresses no leg groups nothing.` };
        if (claimed.has(raw))
          return { ok: false, reason: "BAD_PARTITION", target, ord: raw,
                   claimed_by: [claimed.get(raw), label],
                   detail: `basis[${raw}] is claimed by two groups. A leg belongs to exactly ONE group: a `
                         + `leg that is needed whatever else holds is NECESSARY, and the honest way to say `
                         + `so is to leave the reasons ungrouped — an ungrouped basis is read as no `
                         + `stronger than its weakest leg, which is the conservative reading.` };
        claimed.set(raw, label);
        nextLabel[raw] = label;
      }
      asked.push({ label, ords: [...ords].sort((x, y) => x - y), statement: stmt });
    }

    /* ------------------------------------------- the stamp, and what carries */
    const when = this.#when();
    const ordsOf = (label) => standingLabel.reduce((a, g, i) => (g === label ? [...a, i] : a), []);
    const same = (a, c) => a.length === c.length && a.every((v, i) => v === c[i]);
    const rowsOut = asked.map((a) => {
      const prior = typeof a.label === "string" ? standingByLabel.get(a.label) : undefined;
      const priorStmt = prior && typeof prior.statement === "string" ? prior.statement : null;
      /* CARRIED FORWARD only when the assertion is genuinely the same one: the
         same legs and the same statement. And only when the standing row's own
         attribution is usable — a document that reached the store carrying a
         nameless or undated row (a replayed history: the gate's shape refusals
         honour the replay exemption) is re-stamped rather than trusted, which
         fails toward THIS member owning what they just authored. */
      const carry = !!prior && same(a.ords, ordsOf(a.label)) && priorStmt === a.statement
                 && typeof prior.asserted_by === "string" && prior.asserted_by.trim() !== ""
                 && typeof prior.at === "string" && prior.at.trim() !== "";
      return { ground: a.label, legs: a.ords, statement: a.statement,
               /* A caller's own `asserted_by`/`at` never appear in this object.
                  They are not overwritten from `row` — `row` is never read for
                  them at all, which is the same thing DELETE buys at the trust
                  boundary and is why R28's test (`test/m/inquiry/ground.test.mjs`)
                  asserts a caller's values are DISCARDED rather than merely
                  losing. */
               asserted_by: carry ? fmSafe(prior.asserted_by) : fmSafe(who),
               at: carry ? fmSafe(prior.at) : when,
               carried_forward: carry };
    });

    /* NOTHING MOVED, so nothing is recorded. An act that writes a reason, a
       Session Log entry and a promotion over an identical partition is a
       revision of nothing, and a record that holds one has a restructuring in
       it that never happened. */
    if (same(nextLabel.map((g) => String(g)), standingLabel.map((g) => String(g)))
        && rowsOut.every((r) => r.carried_forward)
        && standingByLabel.size === rowsOut.length)
      return { ok: false, reason: "PARTITION_UNCHANGED", target,
               detail: "this is the structure this question already carries, leg for leg. Nothing was "
                     + "written: a revision that changes nothing would put a restructuring in the record "
                     + "that did not happen." };

    /* ---------------- ONE GRAMMAR, judged before a byte moves ---------------
       The CANDIDATE frontmatter, checked by the catalog's own function over the
       same two registries op=promote injects at the write. This is the act's
       gate and the write's gate running the same rule twice on purpose (the
       checkGatheringGrammar precedent), and it is also what guarantees a label
       has passed GROUND_LABEL_RE — no quotes, no colons, no newlines — before
       any of it is written into a restricted-grammar block. */
    const grouped = nextLabel.some((g) => g !== null);
    const candidate = { ...fm,
      basis: legs.map((l, i) => {
        if (nextLabel[i] === null) { const { ground, ...rest } = l; return rest; }
        return { ...l, ground: nextLabel[i] };
      }) };
    if (grounds.length) candidate.grounds = rowsOut.map((r) => ({ ground: r.ground,
      asserted_by: r.asserted_by, at: r.at, ...(r.statement === null ? {} : { statement: r.statement }) }));
    else delete candidate.grounds;
    const bf = [];
    checkInquiryBasis(candidate, bf, this.#publishedRegistry(target,
      legs.map((l) => l.target).filter((t) => typeof t === "string")),
      this.earnedForDoc(candidate, candidate.basis));
    const errs = bf.filter((x) => x.severity === "error");
    if (errs.length)
      return { ok: false, reason: "BASIS_REFUSED", target,
               findings: errs.map((x) => ({ check: x.check, detail: x.message, repairs: x.repairs ?? [] })),
               detail: "the structure this would author is refused by the SAME catalog function op=promote "
                     + "runs at the write, so nothing was written. Every group is a claim that its legs are "
                     + "enough on their own, and that claim carries a name and a date." };

    /* ---------------------------------------------------- and now the bytes */
    /* R28: the pair before the act, from the module that holds strength (its registration); absent, said so. */
    const before = this.#strength(target);
    const spliced = spliceBasisGround(text, nextLabel);
    if (!spliced)
      return { ok: false, reason: "UNSPLICEABLE_BASIS", target,
               detail: "this document's basis block is not in a shape this grammar can edit in place. "
                     + "Nothing was written — a partial edit of a basis is worse than none." };
    text = spliced;
    text = grounds.length
      ? setOrAddBlock(text, "grounds", rowsOut.flatMap((r) => [
          `  - ground: ${r.ground}`,
          `    asserted_by: ${r.asserted_by}`,
          `    at: "${r.at}"`,
          ...(r.statement === null ? [] : [`    statement: "${r.statement}"`])]))
      /* REMOVED, not emptied. An unstructured basis must read BYTE-IDENTICALLY
         to one that was never grouped (REC-42's clause 2), and a document left
         wearing an empty `grounds:` key is not that document. */
      : removeBlock(text, "grounds");
    text = setScalar(text, "last_updated", `"${when}"`);
    /* C-13.2: last_updated moving requires a Session Log entry, and it is where
       DEC-32 clause 6's RECORD lives — this act moves no state, so there is no
       state_history entry to carry it and the log is the durable trace. THE
       PAIR AS IT STOOD BEFORE goes in beside the reason: that is the evidence a
       noticer needs (*"a weak leg moved into its own branch immediately after a
       strength drop"*), left where an append-only history keeps it rather than
       reconstructed later by something that would have to guess. */
    /* MK-2: the testimony axis joins the line ONLY when it carries something —
       the freeze's rule (publishCase), so an ordinary question's log reads
       byte for byte as it always did. */
    const w = (p) => `capture ${p.capture.state === "graded" ? p.capture.grade : p.capture.state}, `
                   + `connection ${p.connection.state === "graded" ? p.connection.grade : p.connection.state}`
                   + (p.testimony && p.testimony.state !== "unrated"
                       ? `, testimony ${p.testimony.state === "graded" ? p.testimony.grade : p.testimony.state}` : "");
    text = appendSessionLog(text,
      `### Session ${when} | ${restructure ? "Restructured" : "Grouped"} | ${who}\n`
      + `Trigger: op=inquiryground on ${target}\n`
      + `Changes: ${grounds.length ? `${rowsOut.length} group(s) over ${legs.length} leg(s) — `
          + rowsOut.map((r) => `${r.ground}: ${r.legs.join(", ")}`).join("; ")
          : `grouping removed; ${legs.length} leg(s) read as necessary again`}.\n`
      + (restructure ? `Reason: ${why}\n` : "First grouping: no earlier structure to revise.\n")
      + (before ? `Strength before: ${w(before)}.\n` : "Strength before: not stated (no module answers it here).\n"));

    const promoted = this.#promote({
      bundleId: target, base: b.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${rand(4)}`,
      author: who,
      files: [mdFile(text), ...carriedFiles(this.sql, target)],
      /* NO STATE MOVES. The meta carries the document's own state forward
         unchanged — this act authors what a question rests on, not where it
         stands — which is why it is not in op-declarations' STATE_ACTIONS (`op-declarations/index.mjs`). */
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    const after = this.#strength(target);

    /* `weight: "single"` for conclude's reason, and here it is load-bearing
       rather than conventional: one question's structure is authored at a time,
       and a bulk grouping would raise a set of grades with one sentence
       standing for all of them. */
    return { ok: true, target, act: restructure ? "restructured" : "authored",
             grouped, grounds: rowsOut, legs: legs.length,
             reason: restructure ? why : null, asserted_by: who, at: when, weight: "single",
             bundleSha: promoted.bundleSha,
             /* DEC-32 clause 6's noticing material, returned as well as
                recorded. NOT a judgement: the act reports what the pair was and
                what it is, and says nothing about why the member moved. */
             /* MK-2: every axis, from the one list — a third axis moved by a
                restructure is the same noticing material as the other two. */
             ...(before && after
               ? { strength: { before, after } }
               : { strength_absent: "no module is registered to answer this question's strength, so the pair before and after is not stated here" }),
             next: grouped
               ? "each group's strength is its weakest leg, and this question's is its strongest group. "
                 + "Every group carries the name and the date of the member who asserted it was enough on "
                 + "its own, and a published case carries the per-group breakdown inside the signed bytes."
               : "this question reads as its weakest leg again, which is the conservative reading and the "
                 + "one an ungrouped basis always takes." };
  }


  /** THE LEGACY BACKFILL — a leg promoted before this column existed, read for
   *  the first time.
   *
   *  DETERMINISTIC BECAUSE THE ID IS A HASH. There is no allocator, so "mint the
   *  row this leg would have had" is a pure function of the target the leg
   *  already names: the whole document (Bob, 5.3 — a citation with no stated
   *  part means the whole document and reads `document`, never `unstated`), the
   *  capture `#captureForContent` resolves, and the chain as it stands. Running
   *  it twice, or in two sessions, or after a replay, produces the same id — so
   *  this is a read that happens to write rather than a migration with a
   *  direction.
   *
   *  IT WRITES THE COLUMN AS WELL AS THE ROW, so the second read is a lookup.
   *  Not doing so would leave the projection permanently disagreeing with the
   *  row it resolves to, which is the drift `inquiry_basis` is delete-then-
   *  inserted to prevent.
   *
   *  THE HONEST NULLS, and each is a different fact stated rather than invented:
   *  a leg whose target is an INQUIRY has no capture behind it at all (an
   *  inquiry is not a document — DEC-21 — and IC-83's "every leg targets
   *  content" is written about the information arm); a leg whose target
   *  information object the record holds no bytes for has nothing to address.
   *  Both answer null and say which. */
  ensureLegContent(bundleId, ord) {
    const leg = this.#one(
      `SELECT bundle_id, ord, target_id, target_type, content_id
         FROM inquiry_basis WHERE bundle_id=? AND ord=?`, bundleId, ord);
    if (!leg) return { ok: false, reason: "NO_LEG",
                       detail: `no basis leg ${ord} on ${bundleId}` };
    if (leg.content_id)
      return { ok: true, content_id: leg.content_id, minted: false, backfilled: false };
    /* R12 (N522): another group's finding is no document of this record: its grades are the edition's it names. */
    if (isImportedRef(leg.target_id))
      return { ok: true, content_id: null, minted: false, backfilled: false,
               null_case: "IMPORTED_TARGET",
               why: `basis[${ord}] rests on ${leg.target_id}, another group's finding, graded as the edition this leg `
                  + `names publishes it. This record holds no part of it, so it has no content row here` };
    /* REC-83: THE CASE IS NAMED, NOT ONLY DESCRIBED. IC-83's AMENDMENT 2 says
       the reads must state WHICH of the two legitimate nulls they met and never
       collapse them, and a reader that has to pattern-match an English sentence
       to tell them apart is a reader that will collapse them. The code is
       decided HERE because this is where the distinction is made; every read
       carries it rather than re-deriving it from `target_type`. */
    if (leg.target_type !== "information")
      return { ok: true, content_id: null, minted: false, backfilled: false,
               null_case: "INQUIRY_TARGET",
               why: `basis[${ord}] rests on ${leg.target_id}, which is an inquiry rather than a `
                  + `document. An inquiry has no capture and therefore no part to point at — the `
                  + `content axis ranges over documents (DEC-21), and this is undetermined and `
                  + `stated rather than a document-extent row invented for it` };
    const sha = this.content.captureFor(leg.target_id);
    if (!sha)
      return { ok: true, content_id: null, minted: false, backfilled: false,
               null_case: "NO_BYTES_HELD",
               why: `this record holds no capture of ${leg.target_id}, so there are no bytes for a `
                  + `content row to address. Absence here is a fact about what was captured and `
                  + `never evidence about what the document says (CLAUDE.md's sparse rule)` };
    const out = this.content.mint({ bundleId: leg.target_id, captureSha: sha,
                                   extent: { kind: "document" },
                                   mintedBy: CONTENT_MINTED_BY_PLANE });
    if (!out.ok) return out;
    this.sql.exec(`UPDATE inquiry_basis SET content_id=? WHERE bundle_id=? AND ord=?`,
      out.content_id, bundleId, ord);
    return { ...out, backfilled: true };
  }


  /** IC-84 (4)'s other half — THE LEGACY BACKFILL, WIRED.
   *
   *  REC-82 landed `ensureLegContent` as a pure function with NO CALLER and
   *  said so in its own suite rather than leaving the gap to be found. This is
   *  the caller: the first read that asks what a leg earns mints the
   *  `document` row a leg written before the column existed should always have
   *  had. Deterministic because the id is a hash, so it is a read that happens
   *  to write rather than a migration with a direction — running it twice, in
   *  two sessions, or after a replay produces the same id.
   *
   *  ONE TRANSACTION FOR THE WHOLE BASIS, not one per leg.
   *
   *  THE TWO LEGITIMATE NULLS COME BACK AS THEMSELVES AND ARE CARRIED, NEVER
   *  COLLAPSED (IC-83's AMENDMENT 2): an inquiry target has no capture and no
   *  part to point at (DEC-21), and a target the record holds no bytes of has
   *  nothing to address. `ensureLegContent` answers each with its own `why`,
   *  and this pass puts that sentence on the leg so every read that meets the
   *  null states WHICH it is.
   *
   *  BOUNDED, AND THE BOUND IS STATED IN THE ANSWER. A basis's leg count is
   *  unbounded by the schema and `ensureLegContent` does a small fixed number
   *  of reads per leg, so an unbounded backfill behind a member-callable read
   *  is REC-66's amplification arriving at a new door. It is capped, and a read
   *  that hit the cap says so and leaves the rest for the next read — safe
   *  precisely because the id is a pure function of the leg. R15's test
   *  (`test/m/inquiry/content-legs.test.mjs`) drives the bound over 51 legs and
   *  the next read's continuation. */
  #backfillLegContent(bundleId, legs) {
    const need = legs.filter((l) => !l.content_id);
    const run = need.slice(0, LEG_BACKFILL_MAX);
    if (!run.length) return { ran: 0, truncated: false };
    const outcomes = new Map();
    this.record.transact(() => {
      for (const l of run) outcomes.set(l.ord, this.ensureLegContent(bundleId, l.ord));
    });
    for (const l of run) {
      const o = outcomes.get(l.ord);
      if (!o || !o.ok) { l.why_no_content = o && o.detail ? o.detail : null; continue; }
      if (o.content_id) { l.content_id = o.content_id; l.backfilled = !!o.backfilled; }
      else { l.null_case = o.null_case || null; l.why_no_content = o.why || null; }
    }
    return { ran: run.length, truncated: need.length > run.length };
  }


  /* ===================== REC-18 · THE EARNED BASIS GRADES ===========   *
   * DATA-MODEL D1(b), as DEC-15 closed it: a document leg's CONNECTION grade is
   * EARNED — the strongest resolution of that document's captures to the
   * inquiry's SUBJECT ENTITY — and its CAPTURE grade is earned from the capture
   * record. Both are computed HERE, server-side, and the write path refuses a
   * leg stating anything else (checkEarnedLeg). The rule is the recogniser's own,
   * moved up one layer: "the RECOGNISER never mints a D; the model holds it so a
   * member can testify, never the machine" (the legacy `schema.mjs`, deleted since).
   *
   * ONE FUNCTION, THREE CONSUMERS, and that is deliberate: op=promote's write
   * path, the ratification gate, and op=earnedbasis (the read a surface uses to
   * fill a leg in BEFORE writing it) all call this. A member who cannot learn
   * what a leg earns is a member the refusal pressures into inventing one, which
   * is the failure mode the old process's CLAUDE.md named about gates.
   */

  /* R43: the inquiry's recorded subject, the column R12 writes from the document into this module's table (R40), or
     null; never throws. The bytes stay the authority: the write path and the gate read the document's own
     `subject_entity` (`earnedForDoc`), because at promote time the column has not been written yet. */
  subjectEntityOf(bundleId) {
    try {
      const row = this.#one(`SELECT inquiry_subject_entity FROM ${BUNDLE_FACTS} WHERE bundle_id=?`, bundleId);
      return row && row.inquiry_subject_entity ? row.inquiry_subject_entity : null;
    } catch { return null; }
  }

  /* THE CAPTURE-AXIS CEILING is doctrine rather than a tuning knob, and as of
     REC-43 / DEC-39 it is DECLARED IN THE RECORD'S GRAMMAR rather than here.
     `static EARNED_CAPTURE_CEILING = "B"` stood on this line until 2026-08-04
     and the value is unchanged; what moved is WHERE it is written, so that the
     published co-attestation fence could be composed from it (affordances.mjs
     could not import the legacy store, which imported it). The doctrine, the reason
     for the direction and the derivation of the unreachable letter above it are
     all at the declaration in `record-grammar` (`grades.mjs`), and `checkEarnedLeg`
     is the arm that refuses a leg claiming more than this. This class
     keeps no copy: a second literal "B" here is precisely the drift the move
     exists to prevent. */

  /** The earned registry for one inquiry over one set of basis targets.
   *
   *  CONNECTION: the strongest resolution of each target document's captures to
   *  the subject entity, through #strongestResolutionsFor — the SAME collapse
   *  op=concerns, op=connect and op=thread make, reused rather than restated so
   *  a leg's grade cannot drift from the grade that document appears at in the
   *  reverse index. A/B/C ONLY: a grade-D resolution is a member's testimony
   *  (op=resolvetestify), so a document known to concern the subject only by
   *  testimony earns NOTHING here and its leg is testimony, with its own author
   *  and date. That is the machine-never-mints-a-D rule holding at this layer
   *  too, and it is why the D rows are dropped rather than passed through.
   *
   *  CAPTURE: whether the record holds registered captures for that document.
   *  Read from `register`, which is what op=promote writes when a bundle's
   *  bytes are registered — the capture record itself, never a caller's claim.
   *
   *  Bounded by the TARGETS asked about (a basis, or a caller's list) and not by
   *  the corpus, and it runs two indexed reads per call rather than a probe per
   *  leg — publishedRegistryFor's shape and for its reason. */
  /*  REC-83 / IC-84 (3) — THE THIRD ARGUMENT, AND WHY THE ANSWER STAYS
   *  BYTE-IDENTICAL WITHOUT IT. `contentIds` is the set of content rows the
   *  caller's legs point at. Given none — which is every existing caller: the
   *  write path (`earnedRegistryForDoc`), the ratification gate, and the two
   *  internal registry reads — this function returns EXACTLY what it returned
   *  before this item, with no `earned.content` key at all. That is not
   *  caution: a document-grain leg's earned basis must not move because the
   *  record learned to answer at a finer grain, and the over-strictness arm of
   *  this item's control set asserts it against a figure measured on the
   *  pristine tree.
   *
   *  THE CONTENT BLOCK IS DERIVED FROM `earned.connection`, NOT BESIDE IT. A
   *  `document` row earns what its document earns, taken from the map this
   *  function just built rather than recomputed — so the two grains cannot
   *  disagree, which is the same reason this is ONE function with three
   *  consumers in the first place. */
  earned(subjectEntity, targetIds = [], contentIds = []) {
    const ids = [...new Set((Array.isArray(targetIds) ? targetIds : [])
      .filter((t) => typeof t === "string" && t))];
    const ent = subjectEntity
      ? (() => { const r = this.entities.readEntity({ entityId: subjectEntity });
                 return r && r.found && r.entity ? r.entity : null; })()
      : null;
    const out = { subject_entity: subjectEntity || null,
                  subject_label: ent ? ent.label : null,
                  subject_known: !!ent,
                  /* MK-2 / IC-142: a `testimony` map joins these two ONLY when a
                     target asked about IS an authored observation (CASE 0 below)
                     — REC-83's `content` precedent, for its reason: a caller who
                     asked about no observation gets an answer byte-identical to
                     the one it got before the axis existed, and every existing
                     consumer is on that path. Readers take its absence as "no
                     target here is an observation", which is exactly what it is. */
                  earned: { connection: {}, capture: {} } };
    if (!ids.length) return out;
    const want = new Set(ids);
    if (subjectEntity) {
      /* Collapse per CAPTURE first (the established collapse), then take the
         strongest of a document's captures — a document may hold several, and
         D1(b)'s words are "the strongest resolution of that document's
         CAPTURES". Doing it in this order rather than one max over the raw rows
         keeps the two steps visible and keeps the per-capture step the shared
         one. */
      const perCapture = this.entities.strongestByCapture(subjectEntity);
      for (const c of perCapture.values()) {
        if (!c.bundle_id || !want.has(c.bundle_id)) continue;
        /* A/B/C ONLY. The machine never mints a D.
           REC-51 LEFT THIS LITERAL DELIBERATELY, and it is the ONE grade-letter
           literal still standing anywhere in src/. It is NOT a copy of
           `BASIS_GRADES` — it is a strict SUBSET of it carrying its own
           doctrine: the grades a MACHINE may mint. Grade D is a member's
           TESTIMONY (op=resolvetestify), recorded with an author and a date, and
           the recogniser never produces one; `checkEarnedLeg` types that 'D' at
           the enforcement point itself, so there is no exported constant to
           compose from and MINTING ONE WOULD BE A RULING — what a machine may
           earn, and whether that set follows the catalog when the catalog moves,
           is a doctrine question and no DEC is open in it. Deriving it (say, as
           "all but the weakest") would silently answer it.
           So it is held the way REC-50 held op=acquire's archive letter: OPEN BY
           DECISION, NOT BY OVERSIGHT, and guarded by R13's test
           (`test/m/inquiry/earned.test.mjs`) rather than by this comment: it
           drives a resolution at every letter of `BASIS_GRADES` and holds that
           the letters earned are its STRONGEST-FIRST PREFIX short of the
           testimony grade. Pinning that relation asserts no VALUE, so it is not a
           ruling; what it buys is that a catalog change which reorders or renames
           the vocabulary FAILS there by name instead of leaving this subset
           quietly meaning something new. */
        if (!["A", "B", "C"].includes(c.grade)) continue;
        const cur = out.earned.connection[c.bundle_id];
        if (!cur || GRADE_RANK[c.grade] > GRADE_RANK[cur.grade])
          out.earned.connection[c.bundle_id] = { grade: c.grade, capture_sha: c.capture_sha, captures: 0 };
      }
      for (const c of perCapture.values())
        if (c.bundle_id && out.earned.connection[c.bundle_id]) out.earned.connection[c.bundle_id].captures++;
      for (const [id, e] of Object.entries(out.earned.connection))
        /* mode 'value': `resolutions` holds the grade ITSELF, so the leg must
           state this letter and no other. */
        e.mode = "value",
        e.why = `${id} resolves to ${subjectEntity}${ent ? ` (${ent.label})` : ""} at grade ${e.grade} — the `
              + `strongest of the ${e.captures} capture(s) of that document the recogniser matched to this `
              + `subject. Grade states HOW it was matched (framework 8.1) and nothing about how credible the `
              + `document is.`;
    }
    /* THE CAPTURE RECORD IS BOTH PLACES A CAPTURE LANDS, and asking only one of
       them would earn nothing for half the corpus. `register` holds the captures
       a promotion REGISTERED against a bundle's files; `readings` holds the ones
       a captured document's provenance carried. A document acquired through
       op=acquire has both; one intaken with a provenance document has only the
       second. The union is what "the record holds bytes for this document"
       actually means. */
    /* ================= REC-88 / D-349 · THE FIDELITY BOUND ================
     *
     * THE CHAIN TRAVELS WITH THE CAPTURE, IN THE SAME READ. The union above is
     * unchanged in WHAT it enumerates — one row per distinct (bundle, capture)
     * — and gains a LEFT JOIN onto `reading_text_source`, the projection that
     * already holds every capture's chain. So this is still ONE indexed read
     * and this function is still the two-reads-per-call shape it was built in;
     * what moved is that the rows come back per capture and the count is taken
     * here instead of by `GROUP BY`. `count(*)` over the same union and a
     * length over the same rows are the same number by construction, and the
     * §7 pin asserts it stayed 1 where it was 1.
     *
     * A LEFT join, deliberately: a capture the record holds bytes of but has
     * never READ has no row there, and that is not a missing fact — it is an
     * UNTRANSCRIBED capture, which `captureBound(null, …)` already answers for
     * by passing the byte grade through. An INNER join would have silently
     * dropped every unread capture out of the capture axis, which is most of
     * the corpus (CAP-9 measured 88 captured documents and 0 readings on this
     * project's own instance) — the fence-tighter-than-its-rule failure, and it
     * would have read as this item working. */
    /* The scan sits in the `for` header for an instrument that read loops by their spelling (provenance: REC-88's
       `derivation-bounds.test.mjs`, deleted in T20); hoisted to a `const`, the query, rows and work are the same. */
    const perBundle = new Map();
    for (const r of this.#rows(
      `SELECT u.bundle_id AS bundle_id, u.capture_sha AS capture_sha, ts.chain AS chain,
              (SELECT ra.authored FROM register ra WHERE ra.capture_sha = u.capture_sha) AS authored FROM (
         SELECT bundle_id, capture_sha FROM register WHERE bundle_id IN (SELECT value FROM json_each(?))
         UNION
         SELECT bundle_id, capture_sha FROM readings WHERE bundle_id IN (SELECT value FROM json_each(?))
       ) u LEFT JOIN reading_text_source ts ON ts.capture_sha = u.capture_sha`,
      /* D-443: the list is bound TWICE, so one variable per id failed from ~50 targets (D-36). */
      JSON.stringify(ids), JSON.stringify(ids))) {
      if (!r.bundle_id) continue;
      if (!perBundle.has(r.bundle_id))
        perBundle.set(r.bundle_id, { n: 0, bound: null, transcribed: 0, authored: 0, byteBest: null, unruled: 0,
                                     measured: 0, authoredRoutes: [] });
      const e = perBundle.get(r.bundle_id);
      /* MK-1 / D-184: A MEMBER'S AUTHORED WORDS ARE NOT A CAPTURE ON THIS AXIS.
         The capture axis measures the act of reading a document in (DEC-21's
         amendment); nobody read these bytes in from anywhere, so they contribute
         NO LETTER and are not counted as a capture — `captureBound(null, …)`
         would otherwise have passed the byte grade straight through and earned an
         observation the fetch ceiling, which is strength it does not have
         (`MEMBER-KNOWLEDGE-DESIGN.md` §3). Counted apart, so the entry below can
         SAY why the axis is undetermined rather than fall silent. */
      if (r.authored === 1) { e.authored++; continue; }
      e.n++;
      /* THE RULE ITSELF IS `captureBound`'S AND IS NOT RESTATED HERE. It is
         handed the capture's chain and the BYTE grade, and it answers the
         weakest link of the two — a letter, or null for UNDETERMINED. This file
         does not know that an OCR step weakens and an attestation does not, it
         does not know that an unmeasured transcription is null rather than
         "fine", and it must not learn: DEC-4's arithmetic has one home. */
      const chain = safeJson(r.chain);
      /* N82 (K182): THE BYTE GRADE IS THE CAPTURE'S OWN, from how the bytes were fetched (provenance R24–R26): a direct
         receipt earns the ceiling, an archive replay one rank below, and bytes with no recorded route keep the ceiling
         as the most an author may state (R26). A route no ruling grades is UNDETERMINED and contributes no letter. */
      /* K538 (provenance R51): bytes received through the doorbell, never fetched, are the second route no fetch
         measures: like R26's unrecorded route, a leg on them keeps its author's letter under the ceiling, stated as
         authored, never as measured. Which of the two it was is kept, so the entry can say so. */
      const cg = this.provenance.captureGrade(r.capture_sha) || {};
      const authoredRoute = !(cg.determined && cg.grade) && AUTHORED_ROUTE_BASES.includes(cg.basis);
      const byteGrade = cg.determined && cg.grade ? cg.grade
        : authoredRoute ? (cg.ceiling || EARNED_CAPTURE_CEILING) : null;
      if (byteGrade == null) { e.unruled++; if (isTranscribed(chain)) e.transcribed++; continue; }
      if (authoredRoute) { if (!e.authoredRoutes.includes(cg.basis)) e.authoredRoutes.push(cg.basis); }
      else e.measured++;
      e.byteBest = e.byteBest == null ? byteGrade
        : (BASIS_GRADES.indexOf(byteGrade) < BASIS_GRADES.indexOf(e.byteBest) ? byteGrade : e.byteBest);
      const b = captureBound(chain, byteGrade);
      if (isTranscribed(chain)) e.transcribed++;
      if (b == null) continue;          /* undetermined contributes no letter; `e.bound` stays null unless another capture supplies one */
      /* THE STRONGEST OVER THE DOCUMENT'S CAPTURES, which is the collapse this
         same function already makes on the connection axis ("the strongest
         resolution of that document's CAPTURES") — reused so the two axes
         cannot drift about what a document with several captures means.
         `mode: 'ceiling'` decides the direction on its own: the entry states
         the MAXIMUM any leg may claim, so a document one of whose captures
         genuinely supports B must not be refused a B because a second, weaker
         capture of the same document exists. That would be a fence tighter than
         its rule. Every capture's own bound is still visible to a reader
         through `op=textprovenance`, which publishes the chain per capture. */
      e.bound = e.bound == null ? b
        : (BASIS_GRADES.indexOf(b) < BASIS_GRADES.indexOf(e.bound) ? b : e.bound);
    }
    for (const [bundleId, e] of perBundle) {
      /* MK-1 — CASE 0: THE DOCUMENT IS A MEMBER'S AUTHORED OBSERVATION AND HOLDS
         NO CAPTURE OF ANYTHING. Present with a NULL grade, on CASE 2's rule: an
         absent entry would say "the record holds no bytes for this document",
         which is false — it holds exactly the member's words. The leg may state
         no capture grade, which suspends the axis and names it; it may not state
         a letter. Its grade is testimony, on the axis MK-2 built beside this one. */
      if (!e.n && e.authored) {
        /* MK-2 / IC-142 — THE TESTIMONY AXIS, EARNED FROM THE REGISTER. What the
           record holds is that these bytes are a member's authored words (the
           flag only op=testify can set, C-53.8), and the ruling is what that is
           worth: TESTIMONY_GRADE, on the observing member's trust. mode 'value'
           on resolution's precedent — the record holds the letter, so a leg
           states that letter and no other (checkTestimonyLeg).
           NOTHING ELSE IS READ HERE, AND THAT ABSENCE IS THE RULE: no
           attestation, no co-signature, no count of members who agree. The
           design's words (section 3): a second member's attestation does NOT
           raise it, because a co-signature is not a second observation. A
           second member who saw the same thing records their own, and the case
           then rests on two testimonies, each at this letter. */
        (out.earned.testimony ||= {})[bundleId] = {
          mode: "value", grade: TESTIMONY_GRADE, authored: e.authored,
          why: `${bundleId} is a member's own firsthand observation, recorded through op=testify: it is `
             + `graded as testimony, ${TESTIMONY_GRADE}, and stands on the observing member's trust. Nothing `
             + `raises it — another member agreeing with it is a co-signature, not a second observation.` };
        out.earned.capture[bundleId] = {
          mode: "ceiling", grade: null, captures: 0, authored: e.authored,
          determined: false,
          undetermined_because: "CAPTURE_AXIS_AUTHORED",
          /* CORRECTED BY MK-2, never exempted: this read "this build does not
             yet carry that axis", which was true until the axis landed. */
          empty_level: "testimony — this document is a member's own firsthand observation, graded on that "
                     + `member's trust on the testimony axis at ${TESTIMONY_GRADE} `
                     + "(MEMBER-KNOWLEDGE-DESIGN.md section 3); the capture axis does not apply to it",
          why: `${bundleId} is a member's authored observation: its bytes are the member's own words, `
             + `recorded through op=testify, and nothing was read in from anywhere. The capture axis `
             + `measures that act, so it earns no letter here — a ${EARNED_CAPTURE_CEILING} would be true of `
             + `the bytes and would read as strength the observation does not have. A leg may state NO `
             + `capture grade, which suspends the axis and names it; it may not state a letter. Its grade `
             + `is testimony, ${TESTIMONY_GRADE}, on the testimony axis.` };
        continue;
      }
      if (!e.n) continue;
      const captureWord = `${bundleId} holds ${e.n} capture(s) in the record`;
      /* The unreachable letter is DERIVED, never typed (REC-48): it is the rank
         immediately above EARNED_CAPTURE_CEILING in the same BASIS_GRADES array
         checkEarnedLeg compares this leg against, so the sentence a member reads
         and the refusal that enforces it cannot say different things. */
      const ceiling = `Grade ${UNREACHABLE_CAPTURE_GRADE} is not reachable on the capture axis at all: it `
                    + `needs a chain-of-custody web archive, which this plane cannot produce and does not `
                    + `claim (CAPTURE-FIDELITY.md).`;
      /* CASE 1 — NOTHING TRANSCRIBED THIS DOCUMENT'S TEXT, so there is no
         fidelity to bound the bytes by and the answer is the one this record
         has given since REC-18, BYTE FOR BYTE. That identity is not caution: a
         leg on publisher-typed text must not move because the record learned to
         ask a question whose answer for it is "no change", and IC-84's §7
         over-strictness arm pins exactly that. No new key appears here. */
      /* K538 (provenance R26, R51): no capture of this document came by a measured route, so the ceiling below is the
         most an author may state, not a measurement: said so, beside the letter. */
      const asAuthored = !e.measured && e.authoredRoutes.length ? {
        stated_as: "authored", route_basis: [...e.authoredRoutes].sort(),
        why: `${captureWord}, and none of them was fetched by a route that measures a capture grade (`
           + `${e.authoredRoutes.includes("CAPTURE_RECEIVED_NOT_FETCHED") ? "received through the doorbell" : ""}`
           + `${e.authoredRoutes.length > 1 ? "; " : ""}`
           + `${e.authoredRoutes.includes("CAPTURE_ROUTE_UNRECORDED") ? "no fetch route recorded" : ""}), so a leg on `
           + `it keeps the letter its author gave, under the ceiling (${EARNED_CAPTURE_CEILING}), stated as authored `
           + `and never as measured.` } : null;
      if (!e.transcribed && e.bound === EARNED_CAPTURE_CEILING) {
        out.earned.capture[bundleId] = {
          /* mode 'ceiling', and the difference from the connection axis is not a
             softening — it is the record being honest about what it holds. There
             is no per-document capture grade column anywhere in this schema, so
             the record cannot say "this document's capture is worth C"; what it
             CAN say is that it holds bytes for the document and what the strongest
             capture this plane produces is worth. A leg may not claim more than
             that (which is what makes grade A unreachable rather than merely
             discouraged); a weaker letter is the member's account of a poorer
             route and stays theirs. */
          mode: "ceiling",
          grade: EARNED_CAPTURE_CEILING, captures: e.n,
          why: `${captureWord}, so the strongest capture grade it can `
             + `earn is ${EARNED_CAPTURE_CEILING} — the bytes as this instance fetched them, hashed at `
             + `receipt.`,
          ceiling, ...(asAuthored || {}) };
        continue;
      }
      /* CASE 2 — EVERY TRANSCRIPTION OF THIS DOCUMENT IS UNMEASURED, so the
         bound is UNDETERMINED and the axis says so. THE ENTRY IS STILL PRESENT
         WITH A NULL GRADE, and that distinction is the whole of DEC-49's rule
         applied to a grade: an ABSENT entry means "the record holds no bytes for
         this document", a PRESENT entry with a null grade means "the record
         holds the bytes and cannot say what the text derived from them is worth".
         Collapsing the two would tell a member to go capture a document the
         record already has. The empty level is NAMED rather than described,
         because a member who is told what is missing can go and get it. */
      if (e.bound == null && !e.transcribed) {
        /* N82: no capture of this document came by a route any ruling grades (provenance R26's unruled via). */
        out.earned.capture[bundleId] = {
          mode: "ceiling", grade: null, captures: e.n,
          determined: false,
          undetermined_because: "CAPTURE_GRADE_VIA_UNRULED",
          empty_level: "capture route — the bytes of this document were served by a route no ruling grades",
          why: `${captureWord}, but every one of them was served by a route no ruling grades, so what a leg `
             + `resting on it may claim about how it was captured is undetermined. A leg may state NO capture `
             + `grade, which suspends the axis and names it; it may not state a letter this record cannot support.`,
          ceiling };
        continue;
      }
      if (e.bound == null) {
        out.earned.capture[bundleId] = {
          mode: "ceiling", grade: null, captures: e.n,
          determined: false,
          undetermined_because: "CAPTURE_FIDELITY_UNMEASURED",
          empty_level: "transcription fidelity — this document's text was derived by a machine and no "
                     + "step in that derivation carries a measured fidelity (the MEASUREMENTS ledger, per engine, "
                     + "per version)",
          why: `${captureWord}, but every transcription of its text is UNMEASURED: no step in the `
             + `provenance of this document's text carries a measured fidelity, so what a leg resting on `
             + `that text may claim about how it was captured is undetermined. That is a statement, not a `
             + `permission — DEC-4 bounds the capture axis by transcription fidelity as its weakest link, `
             + `so an unmeasured derivation bounds it to nothing rather than to ${EARNED_CAPTURE_CEILING}. `
             + `A leg may state NO capture grade, which suspends the axis and names it; it may not state a `
             + `letter this record cannot support.`,
          ceiling };
        continue;
      }
      /* CASE 3 — A MEASURED FIDELITY, AND IT IS THE CEILING NOW. When the
         weakest link is the BYTES the letter is unchanged and the entry is
         byte-identical to case 1 by construction (`captureBound` never raises,
         so `bound === EARNED_CAPTURE_CEILING` means fidelity did not bind) —
         which is why a document OCR'd at B earns exactly what it earned before
         and gains no key. When the weakest link is the FIDELITY the letter
         falls, and only then does the entry say so. */
      if (e.bound === EARNED_CAPTURE_CEILING) {
        out.earned.capture[bundleId] = {
          mode: "ceiling",
          grade: EARNED_CAPTURE_CEILING, captures: e.n,
          why: `${captureWord}, so the strongest capture grade it can `
             + `earn is ${EARNED_CAPTURE_CEILING} — the bytes as this instance fetched them, hashed at `
             + `receipt.`,
          ceiling, ...(asAuthored || {}) };
        continue;
      }
      if (!e.transcribed || e.bound === e.byteBest) {
        /* N82: the ROUTE binds (an archive replay, provenance R25), not the transcription. */
        out.earned.capture[bundleId] = {
          mode: "ceiling", grade: e.bound, captures: e.n,
          bounded_by: "CAPTURE_BOUNDED_BY_ROUTE",
          why: `${captureWord}, and the strongest route by which this instance received them earns `
             + `${e.bound} on the capture axis (provenance's capture grade: an archive replay stands one party `
             + `further from the publisher than a direct fetch), so the strongest capture grade this document can `
             + `earn is ${e.bound}.`,
          ceiling };
        continue;
      }
      out.earned.capture[bundleId] = {
        mode: "ceiling", grade: e.bound, captures: e.n,
        bounded_by: "CAPTURE_BOUNDED_BY_FIDELITY",
        why: `${captureWord}, and the bytes as this instance fetched them would be worth `
           + `${EARNED_CAPTURE_CEILING} — but this document's TEXT was derived by a machine and that `
           + `derivation is measured at ${e.bound}. The capture axis is bounded by the weakest link of `
           /* THE WORDING AVOIDS "grade a": the capture rule's letters have one
              home and are composed from the constant, never typed beside the
              word "grade" (found by `hygiene.test.mjs` detector (B), deleted in
              T20, which could not tell the article from the letter). */
           + `byte provenance and transcription fidelity, with no third scale (DEC-4), so the strongest `
           + `capture grade this document can earn is ${e.bound}. Transcription never RAISES a capture `
           + `grade, and it is not a separate measurement a member can cite instead.`,
        ceiling };
    }
    /* REC-83 / IC-84 (3): THE SAME REGISTRY, AT CONTENT GRAIN. Keyed by content
       row, added only when the caller named rows — so the answer every existing
       consumer gets is unchanged, and a `document`-extent row's connection is
       the document's own entry above rather than a second computation of it. */
    if (Array.isArray(contentIds) && contentIds.length)
      out.earned.content = this.content.standings(contentIds, out.earned.connection);
    for (const [id, axis] of Object.entries(this.connections.portionAxes(contentIds, { entityId: subjectEntity }))) if (out.earned.content?.[id]?.connection?.grain === "portion") out.earned.content[id].connection = axis;
    return out;
  }

  /* The registry as the WRITE PATH and the GATE need it: the subject this
     document declares, over the targets this document's basis names. Takes the
     frontmatter because at promote time the bytes are the only authority — the
     projection column is written from them a few lines later. */
  earnedForDoc(fm, legs) {
    const subject = fm && typeof fm.subject_entity === "string" && fm.subject_entity
      ? fm.subject_entity : null;
    return this.earned(subject,
      (Array.isArray(legs) ? legs : []).map((l) => l && l.target).filter((t) => typeof t === "string"));
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
  cyclePath(bundleId, targets) {
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
  /* R16 (B4, STRENGTH #1): `limit`, a positive integer, bounds the read in SQL (at most `limit` legs, the first by
     ord, `truncated` measured by reading one more); without it the basis is read whole, as a walk over it needs. */
  basisFor(bundleId, { limit = null } = {}) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "basis requires ?id=" };
    const cols = `ord, target_id, target_type, role, grade, grade_axis, grade_source, note, at, ground`;
    if (Number.isInteger(limit) && limit > 0) {
      const rows = this.#rows(`SELECT ${cols} FROM inquiry_basis WHERE bundle_id=? ORDER BY ord LIMIT ?`, bundleId, limit + 1);
      return { ok: true, bundleId, legs: rows.slice(0, limit), limit, truncated: rows.length > limit };
    }
    const legs = this.#rows(`SELECT ${cols} FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, bundleId);
    return { ok: true, bundleId, legs };
  }

  /* REC-11: "which inquiries rest on this document" — E2's question and
     REC-17's re-evaluation obligation — as ONE indexed lookup on
     inquiry_basis_target, never a graph walk. Answers for an INFO- target and
     for an INQ- target alike, because a leg to an inquiry is the same edge. */
  restingOn(targetId) {
    if (!targetId) return { ok: false, reason: "NO_ID", detail: "restson requires ?id=" };
    /* D-280, site (d) — `#restsOnLive`'s UNCONFIRMED TWIN. `inquiry_basis` is a
       projection of `references[]` that drops the STATUS, so this read could
       not tell a leg somebody still rests on from one they recorded the
       decision to withdraw. IT PUBLISHES THE STATUS RATHER THAN FILTERING ON
       IT, which is `op=backlinks`' posture and deliberately NOT `#restsOnLive`'s:
       this is the projection read back — "which inquiries name this document as
       a leg" — and a withdrawn leg is a fact the record keeps. Dropping rows
       here would make a READ disagree with the table it reads, and a caller
       that wants the live set has `#restsOnLive`'s ops. Additive: no row and no
       field is removed (IC-61). */
    const dependents = this.#rows(
      `SELECT bundle_id, ord, role, grade, grade_axis, grade_source
       FROM inquiry_basis WHERE target_id=? ORDER BY bundle_id, ord`, targetId)
      .map((d) => ({ ...d,
        status: this.connections.edgeSevered(d.bundle_id, targetId) ? "severed" : "confirmed" }));
    return { ok: true, targetId, dependents };
  }


  /** REC-220 — WHICH VERSION EACH LEG RESTS ON, AND WHETHER THE RECORD CAN SAY (Bob, 2026-09-25 00:40Z,
   *  rule 1). Sets `version` on every leg onto a DOCUMENT, in place, from the leg's own BYTES:
   *
   *    `pinned`        the bytes name the capture — `extent_capture` (written by op=cite at the act since
   *                    REC-220, or by op=narrow, or by the author) or a `content_id` (a hash over its
   *                    capture). `by` says which. This is a fact the record holds.
   *    `only_capture`  no pin, and the record holds exactly ONE capture of the document: there is only one
   *                    version the leg can rest on.
   *    `undetermined`  no pin, and the record holds SEVERAL captures. The leg's content row is about the
   *                    capture the resolver answered when the question was first projected, carried
   *                    forward since in a DERIVED table (REC-82) — not a record of which bytes the member
   *                    read. That row's capture is named as `resolved_capture`, and it is never back-filled
   *                    into the leg by guess.
   *
   *  A leg onto a question (no bytes, DEC-21) or one whose document the record holds no capture of gets
   *  no `version`; its `null_case` already says which. TWO set-based reads, never one per leg (the
   *  derivation-bounds class): the document's bytes once, one grouped count per CHUNK of targets, one content read per chunk of ids. */
  #legVersions(id, legs) {
    const docs = legs.filter((l) => normalizeType(l.target_type) === "information");
    if (!docs.length) return;
    const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
    const bytesLegs = md && md.content !== null ? (parseFrontmatter(md.content).data?.basis || []) : [];
    /* CHUNKED under D-36's ~100-variable ceiling (`ID_CHUNK`): the count names
       each chunk TWICE (both halves of the union), so it takes half a chunk at a time. */
    const targets = [...new Set(docs.map((l) => l.target))];
    const held = new Map();
    const half = Math.floor(ID_CHUNK / 2);
    for (let i = 0; i < targets.length; i += half) {
      const part = targets.slice(i, i + half), qs = part.map(() => "?").join(",");
      for (const r of this.#rows(
        `SELECT bundle_id AS t, COUNT(DISTINCT capture_sha) AS n FROM (
           SELECT bundle_id, capture_sha FROM register WHERE bundle_id IN (${qs})
           UNION ALL
           SELECT bundle_id, capture_sha FROM readings WHERE bundle_id IN (${qs}))
         GROUP BY bundle_id`, ...part, ...part)) held.set(r.t, r.n);
    }
    const cids = [...new Set(docs.map((l) => l.content_id).filter(Boolean))];
    const capOf = new Map();
    for (let i = 0; i < cids.length; i += ID_CHUNK) {
      const part = cids.slice(i, i + ID_CHUNK);
      for (const r of this.#rows(
        `SELECT content_id, capture_sha FROM content WHERE content_id IN (${part.map(() => "?").join(",")})`,
        ...part)) capOf.set(r.content_id, r.capture_sha);
    }
    for (const l of docs) {
      const n = held.get(l.target) || 0;
      if (!n) continue;
      const bl = bytesLegs[l.ord] && typeof bytesLegs[l.ord] === "object" && bytesLegs[l.ord].target === l.target
        ? bytesLegs[l.ord] : {};
      const cap = l.content_id ? capOf.get(l.content_id) ?? null : null;
      const pin = typeof bl.extent_capture === "string" && bl.extent_capture.trim() ? "extent_capture"
                : legContentId(bl) ? "content_id" : null;
      l.version = pin ? { state: "pinned", by: pin, capture: cap }
                : n === 1 ? { state: "only_capture", capture: cap }
                : { state: "undetermined", resolved_capture: cap, captures_held: n,
                    detail: `the record holds ${n} captures of ${l.target} and this leg's bytes name none of `
                          + `them, so which version it was made against is undetermined. The capture named is `
                          + `the one the record resolved when this question was first projected; it is not `
                          + `a record of what the member read, and nothing here moves it` };
    }
  }

  earnedBasis({ id, targets = null, viewer = null } = {}) {
    if (!id) return { ok: false, reason: "NO_ID", detail: "earnedbasis requires ?id=<inquiry>" };
    if (!this.membership.inSight(id, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id };
    const b = this.#one(`SELECT b.object_type, f.inquiry_subject_entity FROM bundles b
                           LEFT JOIN ${BUNDLE_FACTS} f ON f.bundle_id = b.bundle_id WHERE b.bundle_id=?`, id);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target: id,
               detail: `${id} is a ${normalizeType(b.object_type)}. An earned basis grade is a fact about `
                     + `an INQUIRY's legs — what each candidate target earns against the question's subject `
                     + `— and only an inquiry has a basis.` };
    const asked = targets
      ? String(targets).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 200)
      : this.#rows(`SELECT DISTINCT target_id FROM inquiry_basis WHERE bundle_id=? ORDER BY target_id`, id)
          .map((r) => r.target_id);
    /* R15 (N522): a leg on an imported finding reference is a line of the question's own document, which the viewer
       sees (checked above); it is no bundle for the gate to ask, and it earns nothing here. */
    const sees = (t) => isImportedRef(t) || this.membership.inSight(t, viewer);
    const visible = asked.filter(sees);
    const withheld = visible.length !== asked.length;
    /* ================= REC-83 / IC-84 (3) · THE LEG PASS ==================
     *
     * The registry above answers per DOCUMENT, which is the question a member
     * asks BEFORE writing a leg ("what would this target earn me?"). This pass
     * answers the other question, which only exists now that a leg can name a
     * PART: what does the leg I ALREADY WROTE earn, given the extent it names?
     *
     * IT RUNS EVEN WHEN `targets` WAS GIVEN, because the legs are a fact about
     * the inquiry and not about the caller's list — a surface filling in a new
     * leg still wants to see what the existing ones stand on.
     *
     * THE READ IS NOT CAPPED, AND THAT IS A DECISION RATHER THAN A DEFAULT
     * (found when a first draft capped it at `CONTENT_EARNED_MAX`). This read is
     * over exactly the population the `asked` read three lines up already
     * enumerates UNCAPPED: the same table, the same bundle, one row per leg.
     * Capping one and not the other would publish two different populations in
     * one answer and silently omit legs whose targets are listed — the drift
     * this method's own comments warn about, installed by a bound nobody asked
     * for. A basis is bounded by what a member authored in one document, and the
     * answer says so by listing it whole. What IS bounded is the BACKFILL below,
     * because it WRITES; nothing inside a loop over these rows reads or writes
     * the store but through it.
     *
     * D-15, THE SAME POSTURE ONE OBJECT DOWN: a leg whose target the viewer may
     * not see is DROPPED, and the fact that something was dropped is stated with
     * no id and no count — op=backlinks' posture, which this op already takes
     * for `asked`. */
    const legRows = this.#rows(
      `SELECT ord, target_id, target_type, content_id FROM inquiry_basis
        WHERE bundle_id=? ORDER BY ord`, id);
    const legsVisible = legRows.filter((l) => sees(l.target_id));
    const legsWithheld = legsVisible.length !== legRows.length;
    const legs = legsVisible.map((l) => ({ ord: l.ord, target: l.target_id,
                                           target_type: l.target_type, content_id: l.content_id }));
    /* IC-84 (4): THE BACKFILL, WIRED HERE AND NOWHERE ELSE.
     *
     * A READ THAT WRITES, DELIBERATELY AND DECLARED. `op=earnedbasis` is
     * `mutating: false` in op-declarations' table of ops and stays so, and the reason is not
     * convenience — the old plane `index.mjs`'s doctrine was that *"a mutating
     * arm hiding inside a non-mutating op would pass the gate that exists to stop
     * exactly that"*, and op-declarations holds that gate now. This is not that arm. Nothing here is an ACT: the row minted is
     * `hash(capture, canonical extent, chain)` over rows the record already
     * holds, so its value is fixed before this call and running it twice, in
     * two sessions, or after a replay produces the same id. It changes no state
     * a caller could have caused differently and grants nobody anything —
     * which is why IC-83 could rule *"a legacy leg is backfilled to its
     * `document` row on first read"* in the first place. Flipping the op to
     * `mutating: true` would be the alternative and it is WORSE than the
     * problem: SESSION_OPS (op-declarations') would then gate a read the shipped composer already
     * calls, an undeclared interface change on I3 wearing the costume of
     * caution. THE REVERSAL, if this reading is rejected, is one line — delete
     * this call and let `op=promote`'s projection mint the row at the leg's
     * next promotion, which it already does and which R12's test
     * (`test/m/inquiry/content-legs.test.mjs`) drives. */
    const backfill = this.#backfillLegContent(id, legs);
    const reg = this.earned(b.inquiry_subject_entity || null, visible,
      legs.map((l) => l.content_id).filter(Boolean));
    /* THE TWO LEGITIMATE NULLS, STATED AS WHICH AND NEVER COLLAPSED (IC-83's
       AMENDMENT 2). A leg whose target is an INQUIRY has no capture and no part
       to point at (DEC-21); a leg whose target information object this record
       holds no bytes of has nothing to address. Both are `content_id: NULL` and
       they are DIFFERENT FACTS — one is about what kind of thing was cited, the
       other about what this record has captured — so the discriminator comes
       from `ensureLegContent`, which is where the distinction is decided, and
       is carried here rather than re-derived. A leg still NULL with no case
       named is one the bound above did not reach, and that is said too. */
    this.#legVersions(id, legs);
    for (const l of legs) {
      if (l.content_id) continue;
      if (!l.null_case && !l.why_no_content) {
        l.null_case = "NOT_YET_RESOLVED";
        l.why_no_content = `this read's backfill bound (${LEG_BACKFILL_MAX} legs) stopped before `
          + `this leg. Nothing is wrong with it — ask again and the next read continues, because the `
          + `content id is a pure function of the leg and needs no cursor`;
      }
    }
    return { ok: true, bundleId: id, ...reg, asked: visible,
             legs,
             /* The bound, published rather than left to be inferred from a
                short list — REC-60's rule about an answer that was cut. */
             ...(backfill.truncated ? { backfill_truncated: true } : {}),
             ...(legsWithheld ? { legs_out_of_view: true } : {}),
             /* Stated, never silently shortened — and with no id and no count,
                because the count IS the leak (op=backlinks' posture). */
             ...(withheld ? { out_of_view: true } : {}),
             detail: reg.subject_entity
               ? `${id} names ${reg.subject_entity}${reg.subject_label ? ` (${reg.subject_label})` : ""} as its `
               + `subject. A target listed under earned.connection may be written as a leg with `
               + `grade_source: resolution AT THAT GRADE and no other; one listed under earned.capture may be `
               + `written with grade_source: capture at that grade. A target absent from a list earns nothing `
               + `on that axis — the honest leg is testimony (grade D, with an author and a date) or no grade `
               + `at all, which suspends the axis and names the leg rather than pretending to a number.`
               : `${id} names NO subject entity, so no leg of it earns an A/B/C connection grade. That is a `
               + `stated position, not a defect (DEC-15): the capture axis still earns from the capture `
               + `record, and a connection a member can account for is testimony at grade D.` };
  }

}

const instances = new WeakMap();

/** The one inquiry instance for `host` (the Durable Object's `ctx`); `deps` are read on the first call only. */
export function inquiryOf(host, deps) {
  let k = instances.get(host);
  if (!k) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    const content = d.content || contentOf(host, { record, membership });
    k = new Inquiry({ ...d, host, storage: d.storage || host.storage, record, membership, promotion, content });
    instances.set(host, k);
    record.declarePurge("inquiry", INQUIRY_PURGE);
    /* K783 (record-core R69, R45): the audit's context for each bundle's checks, the earned registry over the legs its
       basis projects (R13), null for a bundle resting on nothing. */
    if (typeof record.registerAuditContext === "function")
      record.registerAuditContext("inquiry", (id) => {
        const targets = [...k.sql.exec(`SELECT target_id FROM inquiry_basis WHERE bundle_id=?`, id)].map((r) => r.target_id);
        return { earnedRegistry: targets.length ? k.earned(k.subjectEntityOf(id), targets) : null };
      });
    promotion.registerStep("inquiry", { check: (c) => k.check(c), project: (c) => k.project(c) });
    if (typeof content.onStale === "function") content.onStale("inquiry", (notice) => k.staled(notice));
    /* R36 (N136): the `legs` field read from this module's table (retrieval R62); N405: the migrated arm of
       `surfaced_in` on retrieval's single-bundle answer (its R56). Retrieval is created at start before any module
       reaches this one; a stand-in that offers neither registration is left alone. */
    const retrieval = k.retrieval;
    if (retrieval && typeof retrieval.registerField === "function")
      retrieval.registerField("inquiry", "legs", LEGS_RELATION);
    if (retrieval && typeof retrieval.registerProjectionDecoration === "function")
      retrieval.registerProjectionDecoration("inquiry", (row) => {
        const m = row && normalizeType(row.object_type) === "inquiry" ? k.migratedSurfacing(row.bundle_id) : null;
        return m ? { surfaced_in: m } : {};
      });
  }
  return k;
}

/** R52 (2) (K861, plane R10): the resolver `retrieval`'s `registerLegGrades` takes, `(legs) => grades`, over the one
 *  instance for `host` (reached when the resolver is called, not when it is built). `plane` registers it under this
 *  module's name, `inquiry`; this module registers it nowhere itself. */
export function inquiryLegGrades(host) {
  return (legs) => inquiryOf(host).legGrades(legs);
}

/** R53 (A9, bias R40): this module's findings as bias's work products, for `plane` to register at start with the host's
 *  bias under this module's kind, `finding` (`registerWorkProducts("finding", inquiryFindings(host, bias))`, bias R33),
 *  as it registers R52's shares; the module registers nothing itself. Binds `bias` as the instance a finding's lens is
 *  read from (`bindBias`). The source reaches the one instance for `host` when it is asked. */
export function inquiryFindings(host, bias = null) {
  if (bias) inquiryOf(host).bindBias(bias);
  const src = () => inquiryOf(host).workProducts();
  return { list: (after, limit) => src().list(after, limit), read: (key) => src().read(key),
           visible: (key, viewer) => src().visible(key, viewer) };
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function inquiryOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return INQUIRY_TABLES.includes(name);
}

/* The Durable Object routes this module answers (K3), as entries of plane's op map. `url` carries the control
   plane's stamps (`viewer`, `owner`, `author`); `body` the authored material. The stamps are spread AFTER the body, so a
   caller's `author` in the body is overwritten, never honoured, and a caller's `asserted_by`/`at` reach no act. */
export function inquiryOps(k, url, body) {
  const q = (key) => url.searchParams.get(key);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* R16: in-process reads; the control plane routes neither (Suggestions). */
    basis: () => k.basisFor(q("id")),
    restson: () => k.restingOn(q("id")),
    earnedbasis: () => k.earnedBasis({ id: q("id"), targets: q("targets"), viewer: q("viewer") }),
    dispose: () => k.dispose({ handle: q("handle"), to: q("to"), reason: q("reason"), viewer: q("viewer"),
                               owner: q("owner"), author: q("author") }),
    inquirydivide: () => k.divide({ ...b, target: q("target") || b.target, viewer: q("viewer"), author: q("author") }),
    inquiryground: () => k.ground({ ...b, target: q("target") || b.target, viewer: q("viewer"), author: q("author") }),
  };
}
