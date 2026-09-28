/* basis-versions — an inquiry's basis versions (requirements: `build/requirements/basis-versions.md`). An inquiry's
 * basis holds several VERSIONS, each a complete, named, described alternative account of the support for its claim,
 * frozen once written (INVESTIGATIVE-SESSION §6). This module holds the versions and their legs, their six-act state
 * machine, the version a project stands on (CURRENT, §7), a project's conclusion as the adoption of that version's claim
 * (§7.1), and narrowing a leg to a part of its document (Content Framework §14.4). Every act is a member's; a machine
 * proposes a version (`appendVersion`, through `ai-runs`) and holds no act that moves one (R30).
 *
 * Extracted from the legacy modules (T7-3; K3, K91, K102, N64, N67): `store.mjs` (PL-1's projection and freeze, PL-2's
 * six acts and CURRENT, PL-3's append, REC-13/REC-124/REC-136's conclusion and its record, REC-86's narrowing, D-235's
 * collections, REC-119's earned leg letters, MK-1's testimony reach, the shared-question producer's
 * `#projectsDrawingOn`), `schema.mjs` (the two tables, now `./schema.mjs`). The grammar and the check rows stay in the
 * catalogue, which calls them itself; `./grammar.mjs` is their face here. The legacy code's comments moved with it,
 * shortened where they only restated it.
 *
 * REACHED as `basisVersionsOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the
 * first call with `deps`, returned to every later caller. At creation it declares its tables to purge (R34) and joins
 * every promotion with its check (R6) and its projection (R7). `deps`:
 *   record, membership, promotion, content   the modules it uses, through their factories on the same host unless a
 *                test passes its own.
 *   inquiry      `{earned(subject, targetIds), legCapped(stated, earned, targetId), cyclePath(id, targetIds)}`, inquiry's
 *                R13, R14 and cycle read. `inquiry` is extracted in the same layer; until its merge `legacy-store` passes
 *                an adapter over its own registry and cycle walk (K134's pattern).
 *   now          the module's clock, an ISO instant at second precision (default: the wall clock). */

import { parseFrontmatter, isMachineIdentity, normalizeType, OBJECT_TYPES, STATES, vocabFor, isBoilerplate,
         checkLegExtentGrammar, legExtent, canonicalExtent, describeExtent, extentRelation, createSha256,
         CONTENT_EXTENT_CHECKS, SUGGEST_CHECKS, ACT_SHAPE_CHECKS } from "../../checks/bio-checks.mjs";
import { readingSourceFromColumns } from "../textchain.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK } from "../membership/index.mjs";
import { promotionOf, EDGE_REASON_MAX } from "../promotion/index.mjs";
import { appendStateHistory, setScalar, setOrAddScalar, appendSessionLog } from "../promotion/text.mjs";
import { contentOf, mintLabel, contentMintState, CONTENT_MINTED_BY_PLANE, legContentId } from "../content/index.mjs";
import { basisVersionFindings, BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, VERSION_MACHINE, versionNeedsReason,
         VERSION_NAME_RE, NARROW_CHECKS, versionsIn, compositionDiff } from "./grammar.mjs";
import { fmSafe, quoted, typedValue, randHex, setVersionField, setCurrentVersionRow, appendFmRows,
         appendConclusionEntry } from "./text.mjs";
import { BASIS_VERSIONS_TABLES, migrateBasisVersions } from "./schema.mjs";

export * from "./grammar.mjs";
export { BASIS_VERSIONS_SCHEMA, BASIS_VERSIONS_TABLES } from "./schema.mjs";

/** R9: versions per read (default and ceiling), and legs per version returned. */
export const BASIS_VERSIONS_LIMIT_DEFAULT = 200;
export const BASIS_VERSIONS_LIMIT_MAX = 1000;
export const BASIS_VERSION_LEGS_MAX = 500;
/** R25: candidates listed per source. */
export const NARROW_CANDIDATES_MAX = 50;
/** R37: projects named per inquiry. */
export const PROJECTS_DRAWING_MAX = 32;
/** R38: roots and rows of the testimony walk, and its depth guard. */
export const TESTIMONY_REACH_MAX = 200;
export const TESTIMONY_REACH_DEPTH = 64;
/** R12, R16: a reason, conclusion, falsifier or commentary written into the frontmatter (no escapes). */
export const VERSION_REASON_MAX = 500;
/** R14: the six acts and the state each moves a version to; `current` and `hide` move none. */
export const VERSION_ACT_TO = Object.freeze({
  accept: "accepted", reject: "rejected", consider: "considering", revert: "suggested", current: null, hide: null,
});

/* R16's shared C-33.40 site (a conclusion with nothing to rest on), `store.mjs`'s `actNoBasis` copied. */
function actNoBasis(detail, extra = {}) {
  /* DEC-49 REGION is-act-no-basis — D-484 / C-33.40. */
  const row = ACT_SHAPE_CHECKS.NO_BASIS;
  return { ok: false, reason: "NO_BASIS", code: "NO_BASIS", check: row.check, translation: row.translation, detail, ...extra };
  /* END DEC-49 REGION is-act-no-basis */
}

/* The per-arm fields of a reading position, without kind and ref: exactly the shape a content extent takes. */
function posFields(pos) {
  const { kind, ref, ...rest } = pos;
  return rest;
}

/* A content extent as the leg fields `op=cite` and the frontmatter carry. */
function extentLegFields(extent) {
  const e = extent && typeof extent === "object" ? extent : {};
  const out = { extent_kind: e.kind };
  const FIELD_OF = { page: "extent_page", rect: "extent_rect", sheet: "extent_sheet", cell: "extent_cell",
                     slide: "extent_slide", shape: "extent_shape", para: "extent_para", run: "extent_run" };
  for (const [f, k] of Object.entries(FIELD_OF)) if (e[f] !== undefined && e[f] !== null) out[k] = e[f];
  return out;
}

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const isInquiryId = (id) => normalizeType(OBJECT_TYPES[String(id ?? "").split("-")[0]]) === "inquiry";

export class BasisVersions {
  #candidateSource = null;   // R25's extract arm: {module, fn}

  constructor({ storage, record, membership, promotion, content, inquiry = null, now } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.content = content;
    this.inquiry = inquiry;
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  migrate() { migrateBasisVersions(this.sql); }

  /* ---- sight (R33) ---- */

  /* The D-15 bundle gate over a QUALIFIED column: a machine sees everything, an absent or unrecognised viewer nothing. */
  #gate(col, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (gate.scope === "DENY") return { sql: gate.sql, args: [] };
    return { sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b
              WHERE b.bundle_id = ${col} AND (${gate.sql})))`, args: gate.args };
  }

  /* A bundle the viewer may see, with its sha: null for one absent or invisible (one answer). */
  #visible(id, viewer) {
    const gate = viewerPredicate(viewer);
    const b = id ? this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
                                WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args) : null;
    if (!b) return null;
    const h = this.record.head(id);
    return h ? { ...b, bundle_sha: h.bundleSha } : null;
  }

  /* A held bundle with its sha, for an internal caller that asks no sight (R28). */
  #held(id) {
    const b = id ? this.#one(`SELECT bundle_id, object_type, current_state FROM bundles WHERE bundle_id=?`, id) : null;
    const h = b ? this.record.head(id) : null;
    return h ? { ...b, bundle_sha: h.bundleSha } : null;
  }

  #seen(id, viewer) {
    const gate = this.#gate("bx.bundle_id", viewer);
    return !!this.#one(`SELECT bx.bundle_id FROM bundles bx WHERE bx.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
  }

  /* A bundle's live `bundle.md` text, or null. */
  #doc(id) {
    const f = this.record.readFile(id, "bundle.md");
    return f && typeof f.text === "string" ? f.text : null;
  }

  /* ---- the one write: a new revision of a document through promotion (R14, R15, R18, R19, R27, R28) ---- */

  #repromote({ bundleId, base, text, when, author, meta }) {
    const carried = [];
    for (const path of this.record.livePaths(bundleId) || []) {
      if (path === "bundle.md") continue;
      const f = this.record.readFile(bundleId, path);
      if (!f) continue;
      carried.push(typeof f.text === "string"
        ? { path, text: f.text, bytes: new TextEncoder().encode(f.text).length, sha256: f.sha256 }
        : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes });
    }
    const bytes = new TextEncoder().encode(text);
    return this.promotion.promote({
      bundleId, base, snapKey: `${when.replace(/[-:]/g, "")}_${randHex(4)}`, author,
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() }, ...carried],
      meta });
  }

  /* ================================================================ its share of a promotion (R6, R7; K31) */

  /** R6: for an inquiry that is not a replay — the grammar (`BASIS_VERSION_REFUSED`), a leg naming a bundle the record
   *  does not hold (`VERSION_LEG_UNRESOLVED`, C-25.16), the version legs' content refusals (`content.citationRefusals`,
   *  through the same plan `basis[]` uses), and the freeze (`VERSION_FROZEN`, C-25.11). The freeze is exempt on replay
   *  too: history is append-only and a replay is the record re-stating what it said. */
  check(c) {
    const { pkg, bundleId, promotedType, docFm } = c;
    if (promotedType !== "inquiry" || !docFm || pkg.replay) return null;
    const vf = [];
    basisVersionFindings(docFm, vf);
    const verrs = vf.filter((x) => x.severity === "error");
    if (verrs.length)
      return { ok: false, reason: "BASIS_VERSION_REFUSED",
               findings: verrs.map((x) => ({ check: x.check, detail: x.message, code: x.code,
                                             /* three registries: a kind is C-27's, a leg extent relays C-45's codes */
                                             translation: (BASIS_VERSION_CHECKS[x.code] ?? SUGGEST_CHECKS[x.code]
                                                           ?? CONTENT_EXTENT_CHECKS[x.code])?.translation,
                                             ...(x.repairs ? { repairs: x.repairs } : {}) })) };
    const offered = versionsIn(docFm);
    /* DEC-49 REGION basis-version-resolve */
    for (const v of offered) {
      for (const leg of v.legs) {
        if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, leg.target_id))
          return { ok: false, reason: "VERSION_LEG_UNRESOLVED", version: v.name, target: leg.target_id,
                   findings: [{ check: BASIS_VERSION_CHECKS.VERSION_LEG_UNRESOLVED.check,
                                code: "VERSION_LEG_UNRESOLVED",
                                translation: BASIS_VERSION_CHECKS.VERSION_LEG_UNRESOLVED.translation,
                                detail: `basis version '${v.name}' rests on '${leg.target_id}', which does not `
                                      + `resolve in this store: an account of the evidence names material the `
                                      + `record holds, or it points a reader at nothing while claiming support`,
                                repairs: ["capture or promote the target first, then compose the version on it",
                                          "or drop the leg — a version may honestly rest on less"] }] };
      }
    }
    /* END DEC-49 REGION basis-version-resolve */
    /* After the resolve arm, so a leg naming a target the record does not hold is told that first. */
    const vLegRows = Array.isArray(docFm.basis_version_legs) ? docFm.basis_version_legs : [];
    if (vLegRows.length) {
      const verrs2 = this.content.legRefusals(vLegRows, this.content.citationPlan(vLegRows), (i) =>
        `basis_version_legs[${i}] (version '${String(vLegRows[i]?.version ?? "").slice(0, 48)}')`);
      if (verrs2.length) return { ok: false, reason: "BASIS_VERSION_REFUSED", findings: verrs2 };
    }
    /* DEC-49 REGION basis-version-freeze — read before this promotion's delete-then-insert, against the composition
       this module computed at the earlier write, so a caller cannot supply the value it is checked against. */
    for (const v of offered) {
      const prior = this.#one(`SELECT composition FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, bundleId, v.name);
      if (!prior || prior.composition === v.composition) continue;
      const changed = compositionDiff(prior.composition, v.composition);
      return { ok: false, reason: "VERSION_FROZEN", version: v.name, changed,
               findings: [{ check: BASIS_VERSION_CHECKS.VERSION_FROZEN.check, code: "VERSION_FROZEN",
                            translation: BASIS_VERSION_CHECKS.VERSION_FROZEN.translation,
                            detail: `basis version '${v.name}' of ${bundleId} is frozen and this promotion changes `
                                  + `it in place (${changed}): a version is frozen once written, because two members `
                                  + `exploring one version collide otherwise and comparison stops meaning anything `
                                  + `when the thing being compared shifts underneath them`,
                            repairs: [`add a NEW version with its own name and derived_from: '${v.name}'`,
                                      `or restore '${v.name}' to the composition the record holds`] }] };
    }
    /* END DEC-49 REGION basis-version-freeze */
    return null;
  }

  /** R7: both tables re-derived WHOLE from the document in the promotion's transaction, the ONLY write to either. Each
   *  document leg's content row is the one it names, else content's resolution over the leg's plan; there is no
   *  carry-forward, because a version is frozen and the content address answers the same id for the same referent. A
   *  replay reaches here with the check skipped: a leg the module would now refuse projects NULL, never a row minted
   *  retroactively. The answer lists `version_content`, read back out of the table. */
  project(c) {
    const { bundleId, promotedType, docFm, meta } = c;
    const isInquiry = promotedType === "inquiry";
    this.sql.exec(`DELETE FROM inquiry_basis_version_legs WHERE bundle_id=?`, bundleId);
    this.sql.exec(`DELETE FROM inquiry_basis_versions WHERE bundle_id=?`, bundleId);
    const vLegRowsAll = isInquiry && docFm && Array.isArray(docFm.basis_version_legs) ? docFm.basis_version_legs : [];
    if (!isInquiry || !docFm) return null;
    const vPlan = vLegRowsAll.length ? this.content.citationPlan(vLegRowsAll) : new Map();
    const at = (meta && meta.last_updated) || null;
    for (const v of versionsIn(docFm)) {
      this.sql.exec(
        `INSERT INTO inquiry_basis_versions
           (bundle_id,name,ord,description,relationship,state,derived_from,hidden,claim,run,author,at,
            regroup_by,regroup_at,regroup_note,composition,leg_count,state_by,state_at,state_reason,kind,affirmed_parts)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        bundleId, v.name, v.ord, v.description, v.relationship, v.state, v.derived_from,
        v.hidden, v.claim, v.run, v.author, v.at,
        v.regroup_by, v.regroup_at, v.regroup_note, v.composition, v.legs.length,
        v.state_by, v.state_at, v.state_reason, v.kind, v.affirmed_parts);
      for (let k = 0; k < v.legs.length; k++) {
        const l = v.legs[k];
        if (!l.target_id) continue;   // a replayed malformed shape: unprojectable
        let vContentId = null;
        const vp = vPlan.get(l.src_ord);
        if (vp && vp.isInfo) {
          const namedId = legContentId(vLegRowsAll[l.src_ord]);
          if (namedId) vContentId = namedId;
          else if (vp.captureSha) {
            const m = this.content.mint({ bundleId: l.target_id, captureSha: vp.captureSha, extent: vp.extent,
                                          mintedBy: CONTENT_MINTED_BY_PLANE, at, ctx: vp.ctx });
            if (m.ok) vContentId = m.content_id;
          }
        }
        this.sql.exec(
          `INSERT INTO inquiry_basis_version_legs
             (bundle_id,name,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at,ground,content_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          bundleId, v.name, k, l.target_id, l.target_type, l.role,
          l.grade, l.grade_axis, l.grade_source, l.note, l.at, l.ground, vContentId);
      }
    }
    if (!vLegRowsAll.length) return null;
    return { version_content: this.#rows(
      `SELECT name, ord, target_id, content_id FROM inquiry_basis_version_legs WHERE bundle_id=? ORDER BY name, ord`, bundleId)
      .map((r) => ({ version: r.name, ord: r.ord, target: r.target_id, content_id: r.content_id ?? null })) };
  }

  /* ================================================================ reads (R8–R11, R22, R23, R37, R38) */

  /** D-235: the collections the record holds for one version, read once for `op=basisversions` and `op=suggest`'s
   *  answer. The ground labels come from the legs this answer carries, the blank label a legless part projects dropped.
   *  `composition_grades: "authored"` says the frozen string keeps what was AUTHORED while `legs[]` publishes what the
   *  record earns (R10). */
  versionCollections(bundleId, row) {
    const legs = this.#legsEarned(this.#rows(
      `SELECT ord, target_id, target_type, role, grade, grade_axis, grade_source, note, at, ground, content_id
         FROM inquiry_basis_version_legs WHERE bundle_id=? AND name=? ORDER BY ord LIMIT ?`,
      bundleId, row.name, BASIS_VERSION_LEGS_MAX));
    const grounds = [...new Set(legs.map((l) => String(l.ground ?? "").trim()).filter(Boolean))].sort();
    return { legs, grounds, leg_count: row.leg_count, legs_complete: legs.length === row.leg_count,
             composition_grades: "authored" };
  }

  /** R10 (REC-119 / D-411): each leg's capture letter as `inquiry.legCapped` bounds it, one registry call for the whole
   *  version. A leg is bounded when it is on the capture axis, carries a letter, and rests on something that is not an
   *  inquiry; `grade_authored` and `grade_why` are on every leg, so a consumer never reads absence as a value. */
  #legsEarned(rows) {
    if (!Array.isArray(rows) || !rows.length) return rows;
    const bounded = (r) => !!r && r.grade_axis === "capture" && r.grade != null
      && typeof r.target_id === "string" && !!r.target_id && normalizeType(r.target_type) !== "inquiry";
    const targets = new Set();
    for (const r of rows) if (bounded(r)) targets.add(r.target_id);
    const inq = this.inquiry;
    const cap = targets.size && inq && typeof inq.earned === "function"
      ? (inq.earned(null, [...targets])?.earned?.capture || {}) : {};
    return rows.map((r) => {
      const res = bounded(r) && inq && typeof inq.legCapped === "function"
        ? inq.legCapped(r.grade, cap[r.target_id], r.target_id) : null;
      return { ...r, grade: res ? res.grade : r.grade, grade_authored: r.grade, grade_why: res ? res.why : null };
    });
  }

  /** R8–R11 (`op=basisversions`). Hidden versions are returned, flagged (DEC-29(b)); a version is whole or absent
   *  (the bound counts VERSIONS); an inquiry the viewer may not see answers exactly as one with no versions, and
   *  `inquiry_present` appears only when it is visible. The run a version names is reported, never joined (§14b.7). */
  basisVersions({ id = null, limit = null, offset = 0, viewer = null, project = null } = {}) {
    const refuse = (key, detail) => {
      const row = BASIS_VERSION_CHECKS[key];
      return { ok: false, reason: key, check: row.check, code: key, translation: row.translation, detail };
    };
    const inq = id == null ? "" : String(id).trim();
    if (!inq)
      return refuse("BASIS_VERSIONS_NO_INQUIRY",
        "op=basisversions answers for ONE inquiry: pass id=<INQ-…>. Versions are versions of a "
        + "question's basis, and there is no default question.");
    if (!isInquiryId(inq))
      return refuse("BASIS_VERSIONS_NOT_AN_INQUIRY",
        `${inq.slice(0, 60)} is not an inquiry. Only an inquiry has a basis, so only an inquiry has `
        + "versions of one; an empty list here would say this thing has none when it could not have any.");
    const cap = Math.max(1, Math.min(BASIS_VERSIONS_LIMIT_MAX, Math.floor(Number(limit) || BASIS_VERSIONS_LIMIT_DEFAULT)));
    const from = Math.max(0, Math.floor(Number(offset) || 0));
    const present = this.#seen(inq, viewer);
    const total = present
      ? (this.#one(`SELECT COUNT(*) AS n FROM inquiry_basis_versions WHERE bundle_id=?`, inq)?.n ?? 0) : 0;
    const rows = present ? this.#rows(
      `SELECT * FROM inquiry_basis_versions WHERE bundle_id=? ORDER BY ord, name LIMIT ? OFFSET ?`, inq, cap, from) : [];
    const versions = rows.map((r) => {
      const rec = this.versionCollections(inq, r);
      return {
        name: r.name, description: r.description, relationship: r.relationship, grounds: rec.grounds,
        state: r.state, derived_from: r.derived_from, hidden: r.hidden === 1, claim: r.claim, run: r.run,
        kind: r.kind ?? null, author: r.author, at: r.at,
        /* who moved it, when and why — null on a version nobody has moved */
        moved: r.state_by ? { by: r.state_by, at: r.state_at, reason: r.state_reason } : null,
        /* DEC-32 clause 4: null means nobody was asked, a different fact from an affirmation naming no parts */
        affirmed: r.affirmed_parts ? String(r.affirmed_parts).split("\t") : null,
        regroup: r.regroup_by ? { by: r.regroup_by, at: r.regroup_at, note: r.regroup_note } : null,
        composition: r.composition, composition_grades: rec.composition_grades,
        leg_count: rec.leg_count, legs_complete: rec.legs_complete, legs: rec.legs,
      };
    });
    const concRec = project ? this.conclusionRecordOf(project, inq, viewer) : null;
    return {
      ok: true, inquiry: inq, ...(present ? { inquiry_present: true } : {}),
      versions, count: versions.length, total, limit: cap, offset: from,
      truncated: from + versions.length < total,
      /* §7: CURRENT is a property of a named project's relationship, so an unnamed project gets no field at all */
      ...(project ? { current: this.currentOf(project, inq, viewer) } : {}),
      ...(project ? { conclusion: this.conclusionOf(project, inq, viewer) } : {}),
      ...(concRec ? { conclusion_stance: concRec.stance ? concRec.stance.state : "none",
                      conclusion_history: concRec.history } : {}),
      /* §7.1 item 5: the inquiry's own conclusion, the no-project relationship's, whether or not a project is named */
      no_project_conclusion: present ? this.noProjectConclusionOf(inq) : null,
    };
  }

  /** R11, R13 (PL-2): what a project stands on, read from the project's own `bundle.md`: `{project, version, at, by}`,
   *  or null for a project the viewer may not see, a project with no document, or one naming no version for this
   *  inquiry (one answer). The ONE reader, paired with the make-current act's one writer. */
  currentOf(projectId, inquiryId, viewer) {
    const pid = String(projectId ?? "").trim();
    if (!pid || !this.#seen(pid, viewer)) return null;
    const text = this.#doc(pid);
    if (text === null) return null;
    const fm = parseFrontmatter(text).data || {};
    const rows = Array.isArray(fm.current_versions) ? fm.current_versions : [];
    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      if (String(r.inquiry ?? "").trim() !== String(inquiryId ?? "").trim()) continue;
      const name = String(r.version ?? "").trim();
      if (!name) continue;
      return { project: pid, version: name, at: typeof r.at === "string" ? r.at : null,
               by: typeof r.by === "string" ? r.by : null };
    }
    return null;
  }

  /** R22 (REC-136): a project's whole record on an inquiry, in the order written, and its stance (the latest entry).
   *  A row with no `act` is a conclusion (REC-124's writer wrote nothing else); a row naming an act this module does not
   *  know is carried as `unrecognised` and reads `undetermined`, never skipped. An invisible project, one with no
   *  document, and one that did nothing about the question answer the same empty record. Commentary is labelled
   *  `evidence: false`. */
  conclusionRecordOf(projectId, inquiryId, viewer) {
    const none = { history: [], stance: null };
    const pid = String(projectId ?? "").trim();
    if (!pid || !this.#seen(pid, viewer)) return none;
    const text = this.#doc(pid);
    if (text === null) return none;
    const fm = parseFrontmatter(text).data || {};
    const rows = Array.isArray(fm.conclusions) ? fm.conclusions : [];
    const s = (v) => (typeof v === "string" ? v : null);
    const want = String(inquiryId ?? "").trim();
    const history = [];
    for (const r of rows) {
      if (!r || typeof r !== "object" || String(r.inquiry ?? "").trim() !== want) continue;
      const by = s(r.by), at = s(r.at);
      const act = r.act === undefined ? "concluded" : s(r.act);
      const base = { project: pid, inquiry: want, relationship: "project", at, by };
      if (act === "concluded") {
        const commentary = s(r.commentary);
        history.push({ ...base, act: "concluded", state: "concluded", version: s(r.version), claim: s(r.claim),
                       claim_state: s(r.claim) ? "adopted" : "undetermined",
                       falsifier: s(r.falsifier) ?? "",
                       falsifier_override: s(r.falsifier_override_by)
                         ? { by: s(r.falsifier_override_by), at: s(r.falsifier_override_at) } : null,
                       commentary: commentary ? { text: commentary, by, at, evidence: false } : null });
      } else if (act === "withdrawn") {
        history.push({ ...base, act: "withdrawn", state: "withdrawn", version: s(r.withdraws_version),
                       withdraws_at: s(r.withdraws_at), reason: s(r.reason) ?? "" });
      } else {
        history.push({ ...base, act: "unrecognised", state: "undetermined", recorded_act: act,
                       detail: "this entry names an act this plane does not know, so what the project "
                             + "stood on after it is undetermined rather than guessed." });
      }
    }
    return { history, stance: history.length ? history[history.length - 1] : null };
  }

  /** R22 (N67): the stance, only while it is a conclusion; null when the project concluded nothing, withdrew its
   *  latest conclusion, wrote an act this module does not know, or cannot be seen. */
  conclusionOf(projectId, inquiryId, viewer) {
    const { stance } = this.conclusionRecordOf(projectId, inquiryId, viewer);
    return stance && stance.act === "concluded" ? stance : null;
  }

  /* §7.1 item 5: the one sentence every read gives for a conclusion that adopted no claim a reader can check. */
  static undeterminedClaim(why = null) {
    return { state: "undetermined", text: null, version: null,
             detail: why
               ? why
               : "this conclusion adopted no claim a reader can check. It was written before a conclusion "
                 + "named the reading whose claim it adopts (INVESTIGATIVE-SESSION.md §7.1 items 5-6), so "
                 + "WHICH claim it concluded is undetermined — never back-filled from its conclusion text, "
                 + "which is the member's words and not a claim any reading stated." };
  }

  /** R23: the inquiry's own conclusion, the no-project relationship's (null when its state is not `concluded`). Its
   *  claim is `adopted` only when the named reading is still carried and still states the claim frozen; else
   *  `undetermined` with why — a hand-written pair of frontmatter keys is not evidence of an adoption. A conclusion
   *  written before versions reads undetermined and is never back-filled. */
  noProjectConclusionOf(inquiryId) {
    const b = this.#one(`SELECT current_state FROM bundles WHERE bundle_id=?`, inquiryId);
    if (!b || b.current_state !== "concluded") return null;
    const text = this.#doc(inquiryId);
    const fm = text !== null ? (parseFrontmatter(text).data || {}) : {};
    const s = (v) => (typeof v === "string" ? v : null);
    const nv = (s(fm.conclusion_version) ?? "").trim(), nc = (s(fm.conclusion_claim) ?? "").trim();
    let claim = BasisVersions.undeterminedClaim();
    if (nv || nc) {
      const v = nv ? this.#one(`SELECT claim FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, inquiryId, nv) : null;
      const matches = !!v && !!nc && fmSafe(String(v.claim ?? "").trim()) === nc;
      claim = matches
        ? { state: "adopted", text: nc, version: nv }
        : BasisVersions.undeterminedClaim(
            `this conclusion names reading '${nv.slice(0, 80)}' and a claim, but ${!v
              ? "the inquiry carries no such reading"
              : "that reading does not state the claim recorded"}, so which claim was concluded cannot be `
            + "established from the record and is undetermined (INVESTIGATIVE-SESSION.md §7.1 item 6) — "
            + "never taken on the frontmatter's word.");
    }
    return { project: null, inquiry: String(inquiryId), relationship: "no_project", state: "concluded",
             relationship_established: false,
             relationship_detail: "this conclusion is written in the inquiry's own bytes and names no project, "
                                + "so the relationship that drew it cannot be established; it is read as the "
                                + "no-project relationship's (INVESTIGATIVE-SESSION.md §7.1 item 5).",
             conclusion: s(fm.conclusion), falsifier: s(fm.falsifier) ?? "", claim };
  }

  /** R37 (N64): each project the viewer may see that draws on the inquiry — its document holds a `cites` reference to
   *  it not marked `severed`, R13's own test — in id order, `{id, title, current}`. Bounded at 32 projects, measured by
   *  reading one past the bound; the list carries `bound` and `truncated`. Writes nothing; never throws. */
  projectsDrawingOn(inquiryId, viewer) {
    const out = [];
    out.bound = PROJECTS_DRAWING_MAX;
    out.truncated = false;
    try {
      const inq = String(inquiryId ?? "").trim();
      if (!inq) return out;
      const gate = this.#gate("bx.bundle_id", viewer);
      const seen = this.#rows(
        `SELECT DISTINCT rf.bundle_id AS pid, bx.title AS title FROM refs rf
          JOIN bundles bx ON bx.bundle_id = rf.bundle_id
          WHERE rf.target_id=? AND rf.kind='cites' AND bx.object_type='project' AND (${gate.sql})
          ORDER BY rf.bundle_id LIMIT ?`, inq, ...gate.args, PROJECTS_DRAWING_MAX + 1);
      out.truncated = seen.length > PROJECTS_DRAWING_MAX;
      for (const r of seen.slice(0, PROJECTS_DRAWING_MAX)) {
        const text = this.#doc(r.pid);
        if (text === null) continue;
        const fm = parseFrontmatter(text).data || {};
        const refs = Array.isArray(fm.references) ? fm.references : [];
        const draws = refs.some((x) => x && typeof x === "object" && x.rel === "cites" && x.status !== "severed"
                                    && String(x.target ?? "").trim() === inq);
        if (!draws) continue;
        out.push({ id: r.pid, title: r.title ?? null, current: this.currentOf(r.pid, inq, viewer) });
      }
    } catch { /* never throws: what was read so far stands */ }
    return out;
  }

  /** R38 (MK-1 (A), N67): what would carry a member's authored observation into the published record. From each root
   *  the evidence graph is walked through every basis leg AND every version leg (an older reading of the basis is still
   *  bytes a published finding can point at); an observation is a bundle holding an authored register row. `self`
   *  names roots that ARE observations; `via` a finding and the observation it rests on. One bounded statement. */
  testimonyReach(ids) {
    const roots = [...new Set((Array.isArray(ids) ? ids : []).filter((x) => typeof x === "string" && x))]
      .slice(0, TESTIMONY_REACH_MAX);
    if (!roots.length) return { self: [], via: [] };
    const rows = this.#rows(
      `WITH RECURSIVE reach(root, id, depth) AS (
         SELECT value, value, 0 FROM json_each(?)
         UNION
         SELECT r.root, e.target_id, r.depth + 1 FROM reach r
           JOIN (SELECT bundle_id, target_id FROM inquiry_basis
                 UNION SELECT bundle_id, target_id FROM inquiry_basis_version_legs) e
             ON e.bundle_id = r.id
          WHERE r.depth < ${TESTIMONY_REACH_DEPTH})
       SELECT DISTINCT reach.root AS root, reach.id AS observation, MIN(reach.depth) AS depth
         FROM reach JOIN register g ON g.bundle_id = reach.id AND g.authored = 1
        GROUP BY reach.root, reach.id
        LIMIT ?`, JSON.stringify(roots), TESTIMONY_REACH_MAX);
    return { self: rows.filter((r) => r.depth === 0).map((r) => r.root),
             via: rows.filter((r) => r.depth > 0).map((r) => ({ finding: r.root, observation: r.observation })) };
  }

  /* ================================================================ the six acts (R12–R15; PL-2) */

  /** ACCEPT — adopt this reading of the evidence (§6 rule 4's ADOPT). */
  versionAccept(a)   { return this.#moveVersionState("accept", a); }
  /** REJECT — the construct's DISMISS. Carries an authored reason, always. */
  versionReject(a)   { return this.#moveVersionState("reject", a); }
  /** CONSIDER — the construct's DEFER: not decided, and saying so on the record. */
  versionConsider(a) { return this.#moveVersionState("consider", a); }
  /** REVERT — put a reading back where nobody had acted on it; not from `accepted` (§6 rule 5). */
  versionRevert(a)   { return this.#moveVersionState("revert", a); }
  /** CURRENT — what THIS PROJECT stands on (§7). Not a state in the machine. */
  versionCurrent(a)  { return this.#moveVersionState("current", a); }
  /** HIDE — the prune flag: hides and never deletes (D-214, DEC-29(b)). */
  versionHide(a)     { return this.#moveVersionState("hide", a); }

  /* ONE implementation with six entry points: every guard is written once (test/versionstate.test.mjs pinned one
     implementation, the reason IS-6's control was absorbed). The four beats: CHOOSE (inquiry and version named, never
     defaulted), SEE WHAT WILL BE REFUSED (`preview` runs every guard and writes nothing), AUTHOR THE REASON (never
     prefilled), RECEIPT (the answer and a Session Log entry carry the same facts). A machine identity is refused on
     every act (§4: the AI holds no op that accepts). */
  #moveVersionState(act, args) {
    const a = args || {};
    const to = VERSION_ACT_TO[act] ?? null;
    const preview = a.preview === true || a.preview === "1" || a.preview === "true";
    const refuse = (key, detail, extra) => {
      const row = VERSION_ACT_CHECKS[key];
      return { ok: false, reason: key, check: row.check, code: key, translation: row.translation, act, detail,
               ...(extra || {}) };
    };
    const target = String(a.target ?? "").trim();
    if (!target)
      return refuse("VERSION_ACT_NO_INQUIRY",
        "a reading belongs to one question: pass target=<INQ-…>. There is no default question and "
        + "there must not be one.");
    if (!isInquiryId(target))
      return refuse("VERSION_ACT_NOT_AN_INQUIRY",
        `${target.slice(0, 60)} is not an inquiry, so it holds no readings of its evidence to act on.`, { target });
    const vname = String(a.version ?? "").trim();
    if (!vname)
      return refuse("VERSION_ACT_NO_VERSION",
        "a question can hold several readings of its evidence: pass version=<name>. Acting on the "
        + "wrong one is worse than being asked which was meant.", { target });
    const who = String(a.author ?? "").trim();
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_MOVE_VERSION",
        `op=version${act} moves what the record stands on or shows, and the credential that called it `
        + `is ${who ? "a machine" : "unnamed"}. A machine credential may COMPOSE an account of the `
        + `evidence and propose it, and may never accept it, turn it down, set it aside, hide it, or `
        + `make it what a project stands on. Sign in as a member.`, { target, version: vname });
    const b = this.#visible(target, a.viewer ?? null);
    if (!b)
      return refuse("VERSION_ACT_NO_SUCH_VERSION",
        "no question by that id is readable here, so it holds no reading by that name either.",
        { target, version: vname });
    let text = this.#doc(target);
    if (text === null)
      return refuse("VERSION_ACT_UNWRITABLE",
        "this question has no readable file, so nothing about its readings can be moved.", { target, version: vname });
    const fm = parseFrontmatter(text).data || {};
    const rows = Array.isArray(fm.basis_versions) ? fm.basis_versions : [];
    const idx = rows.findIndex((r) => r && typeof r === "object" && String(r.name ?? "").trim() === vname);
    if (idx < 0)
      return refuse("VERSION_ACT_NO_SUCH_VERSION",
        `this question holds no reading named '${vname.slice(0, 60)}'. Readings are named so a member `
        + `can ask for one by name, and a name nobody wrote is refused rather than matched to the nearest.`,
        { target, version: vname, known: rows.map((r) => String(r?.name ?? "").trim()).filter(Boolean).slice(0, 20) });
    const row = rows[idx];
    const from = typeof row.state === "string" ? row.state.trim() : "";

    /* CASE-3 / CASE-4 / DEC-72 clause 3: a state move on a case member is refused and pointed at the route DEC-12
       built (reopen, move, publish a new edition). `hide` and `current` move no state (`to === null`) and stay open.
       Asked after the reading is located, so a mistyped name is told first. */
    if (to !== null) {
      const member = this.promotion.fact("caseMember", target);
      if (!member.ok) return { ...member, act, target, version: vname };
      if (member.value)
        return refuse("PUBLISHED_CANNOT_MOVE_VERSION",
          `'${vname}' belongs to a question that is PUBLISHED, and a published case froze this finding `
          + `at the version its members signed. Moving a reading from ${from || "no recorded state"} to `
          + `${to} would change what this finding rests on underneath an edition already on the record, `
          + `leaving it deriving something the published bytes contradict. Reopen it (op=reopen), move `
          + `the reading, and publish what changed as a new edition — the route DEC-12 built for exactly `
          + `this, and the one op=inquiryground and op=inquirydivide already send you down. The pinned `
          + `edition keeps its own signature and keeps answering.`,
          { target, version: vname, from, to, state: b.current_state });
    }

    const why = String(a.reason ?? "").trim();
    if (versionNeedsReason(to) && !why)
      return refuse("VERSION_NO_REASON",
        `op=version${act} records WHY. ${to === "rejected"
          ? "The record of what was turned down is the anti-omission instrument (§6 rule 4) and it is "
            + "worthless without the reason"
          : "Setting a reading aside without saying why leaves the next reader unable to tell a judgement "
            + "from an oversight"}.`, { target, version: vname, from, to });
    /* C-25.32: a reason that arrived and cannot be stored is a different refusal from one that never arrived. */
    if (why.length > VERSION_REASON_MAX || /["\\\r\n]/.test(why))
      return refuse("VERSION_REASON_MALFORMED",
        `a reason is at most ${VERSION_REASON_MAX} characters and cannot contain a quote, a `
        + `backslash, or a newline: the restricted frontmatter grammar has no escapes.`,
        { target, version: vname, reason_length: why.length });
    if (to !== null && !(VERSION_MACHINE.edges[from] || []).includes(to))
      return refuse("VERSION_ILLEGAL_TRANSITION",
        `'${vname}' is ${from || "in no recorded state"} and op=version${act} would make it ${to}. `
        + `The states are not a one-way ladder and being considered or turned down is reversible, but `
        + `a reading a member ACCEPTED is a historical fact: it is corrected by turning it down or by `
        + `putting it back under consideration, never by returning it to something nobody acted on.`,
        { target, version: vname, from, to, legal: VERSION_MACHINE.edges[from] || [] });

    /* The transitive basis cycle at the accept, through inquiry's ONE walk: a leg naming an inquiry that rests on
       this one is harmless while a proposal and a circle the moment a member makes it what the answer rests on. */
    if (to === "accepted") {
      const legRows = Array.isArray(fm.basis_version_legs) ? fm.basis_version_legs : [];
      const inqTargets = [...new Set(legRows
        .filter((l) => l && typeof l === "object" && String(l.version ?? "").trim() === vname
                    && typeof l.target === "string" && isInquiryId(l.target))
        .map((l) => l.target))];
      if (inqTargets.length) {
        if (!this.inquiry || typeof this.inquiry.cyclePath !== "function")
          return { ok: false, reason: "FACT_UNAVAILABLE", fact: "cyclePath", act, target, version: vname,
                   detail: "whether accepting this reading closes a basis cycle cannot be asked here, so it is not "
                         + "accepted rather than accepted unchecked. Nothing was written." };
        const cycle = this.inquiry.cyclePath(target, inqTargets);
        if (cycle)
          return refuse("VERSION_BASIS_CYCLE",
            `accepting '${vname}' would close a cycle: ${cycle.join(" -> ")}. An inquiry's basis is a `
            + `DAG, and the chain above already rests on ${target}.`, { target, version: vname, path: cycle });
      }
    }

    /* D-271 / DEC-32 clause 4: accepting a reading of several separately sufficient parts affirms each by name, and
       the record keeps the parts in its own order (tab-separated). Only on accept, and only when there is more than one
       part to affirm between. */
    let affirmedParts = null;
    if (to === "accepted") {
      const vlegs = Array.isArray(fm.basis_version_legs) ? fm.basis_version_legs : [];
      const declared = [...new Set(vlegs
        .filter((l) => l && typeof l === "object" && String(l.version ?? "").trim() === vname)
        .map((l) => String(l.ground ?? "").trim()).filter(Boolean))];
      if (declared.length > 1) {
        const raw = a.affirmed == null || a.affirmed === ""
          ? [] : (Array.isArray(a.affirmed) ? a.affirmed : String(a.affirmed).split(","));
        const said = [...new Set(raw.map((s) => String(s).trim()).filter(Boolean))];
        const missing = declared.filter((d) => !said.includes(d));
        const unknown = said.filter((s) => !declared.includes(s));
        if (missing.length || unknown.length)
          return refuse("VERSION_AFFIRMATION_INCOMPLETE",
            `'${vname.slice(0, 60)}' rests on ${declared.length} separately sufficient parts and this `
            + `answer counts the STRONGEST of them, so accepting it is a claim that each one would `
            + `carry the finding on its own. ${missing.length
                ? `Not affirmed: ${missing.slice(0, 8).join(", ")}.` : ``}${unknown.length
                ? ` Named but not part of this reading: ${unknown.slice(0, 8).join(", ")}.` : ``} Pass `
            + `affirmed=<every part, comma-separated>. DEC-32 rule 4: this cannot be carried by omission or by `
            + `default, because that is exactly how a finding gets strengthened by repackaging.`,
            { target, version: vname, declared, affirmed: said, missing, unknown });
        affirmedParts = declared.join("\t");
      }
    }

    /* MAKE-CURRENT's own checks (§7): the project is named, visible, draws on the question, and the actor joined it. */
    let projectId = null, projectRow = null;
    if (act === "current") {
      if (from !== "accepted")
        return refuse("VERSION_NOT_ACCEPTED",
          `'${vname}' is ${from || "in no recorded state"}. Current implies accepted (§6 rule 5), and `
          + `exploring an unaccepted reading is done by CALCULATING OVER IT rather than by making it `
          + `what everyone stands on — once a stance is shared, designating one temporarily would move `
          + `a whole team's ground so one member could examine a possibility.`, { target, version: vname, from });
      projectId = String(a.project ?? "").trim();
      if (!projectId)
        return refuse("VERSION_CURRENT_NO_PROJECT",
          "pass project=<PROJ-…>: what a project stands on is the project's own dated declaration, "
          + "and there is no default project.", { target, version: vname });
      projectRow = this.#visible(projectId, a.viewer ?? null);
      /* REC-149: at EXISTENCE the positional C-70.1; NONE falls to the unchanged answer below. */
      if (!projectRow) { const existence = this.membership.existenceAct(projectId, a.viewer ?? null); if (existence) return existence; }
      if (!projectRow || normalizeType(projectRow.object_type) !== "project")
        return refuse("VERSION_CURRENT_UNRELATED",
          `${projectId.slice(0, 60)} is not a project readable here, so it holds no stance to move.`,
          { target, version: vname, project: projectId });
      /* REC-134: sight is not authority; the actor must have JOINED the project (Membership v2 §7.5). */
      const denied = this.membership.projectAuthority(projectId, a.identity ?? null, "joined", "versioncurrent");
      if (denied) return denied;
      const ptext = this.#doc(projectId);
      const pfm = ptext !== null ? (parseFrontmatter(ptext).data || {}) : {};
      const refs = Array.isArray(pfm.references) ? pfm.references : [];
      const draws = refs.some((r) => r && typeof r === "object" && r.rel === "cites"
                                  && r.status !== "severed" && String(r.target ?? "").trim() === target);
      if (!draws)
        return refuse("VERSION_CURRENT_UNRELATED",
          `${projectId} does not draw on ${target}, so it has no stance on this question to move. `
          + `Cite the question into the project first.`, { target, version: vname, project: projectId });
    }

    const when = this.now();
    const hidden = act === "hide" ? !(a.hidden === false || a.hidden === "false" || a.hidden === "0") : (row.hidden === true);
    const receipt = {
      ok: true, act, target, version: vname, from, to: to ?? from, moves_state: to !== null,
      hidden, reason: why || null, author: who, at: when, weight: "single",
      affirmed: affirmedParts === null ? null : affirmedParts.split("\t"),
      ...(act === "current" ? { project: projectId } : {}),
    };
    if (preview) return { ...receipt, preview: true, would: act, wrote: false };

    /* R15 (REC-166): make-current writes only the project; the question is not promoted at all. */
    if (act === "current") {
      const p = this.#setProjectCurrentVersion(projectRow, target, vname, who, when, why);
      if (!p.ok) return { ...p, act, target, version: vname, project: projectId };
      return receipt;
    }

    text = setVersionField(text, vname, "state", to === null ? from : to);
    if (to !== null && text !== null) {
      /* the attribution moves WITH the state, always; a move clears an earlier reason and affirmation */
      text = setVersionField(text, vname, "state_by", who);
      if (text !== null) text = setVersionField(text, vname, "state_at", when);
      if (text !== null) text = setVersionField(text, vname, "state_reason", why);
      if (text !== null) text = setVersionField(text, vname, "affirmed_parts", affirmedParts ?? "");
    }
    if (act === "hide" && text !== null) text = setVersionField(text, vname, "hidden", hidden);
    if (text === null)
      return refuse("VERSION_ACT_UNWRITABLE",
        "this question's version block could not be rewritten in place, so nothing was changed.", { target, version: vname });
    text = setScalar(text, "last_updated", `"${when}"`);
    text = appendSessionLog(text,
      `### Session ${when} | Version ${act} | ${who}\n`
      + `Trigger: op=version${act} on ${target}\n`
      + `Changes: reading '${vname}' ${to === null
          ? `${hidden ? "hidden from" : "returned to"} the display` : `${from} to ${to}`}.\n`
      + (why ? `Reason: ${why}\n` : ""));
    const promoted = this.#repromote({ bundleId: target, base: b.bundle_sha, text, when, author: who,
      meta: { object_type: fm.object_type ?? b.object_type, title: fm.title, current_state: b.current_state,
              prior_state: fm.prior_state ?? null, created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null } });
    if (!promoted.ok) return { ...promoted, act, target, version: vname };
    return receipt;
  }

  /* The make-current pointer's ONE writer (R15): the pointer, `last_updated` and a Session Log entry with the reason,
     in one promotion of the PROJECT. */
  #setProjectCurrentVersion(projectRow, inquiryId, vname, who, when, why = "") {
    const pid = projectRow.bundle_id;
    const unwritable = (detail) => {
      const row = VERSION_ACT_CHECKS.VERSION_ACT_UNWRITABLE;
      return { ok: false, reason: "VERSION_ACT_UNWRITABLE", check: row.check, code: "VERSION_ACT_UNWRITABLE",
               translation: row.translation, detail };
    };
    const md = this.#doc(pid);
    if (md === null) return unwritable(`${pid} has no readable file, so its stance cannot be recorded`);
    const pfm = parseFrontmatter(md).data || {};
    let text = setCurrentVersionRow(md, inquiryId, vname, who, when);
    if (text === null) return unwritable(`${pid}'s current_versions block could not be rewritten in place`);
    text = setScalar(text, "last_updated", `"${when}"`);
    text = appendSessionLog(text,
      `### Session ${when} | Stands on | ${who}\n`
      + `Trigger: op=versioncurrent on ${inquiryId}\n`
      + `Changes: this project now stands on reading '${vname}' of ${inquiryId}.\n`
      + (why ? `Reason: ${why}\n` : ""));
    return this.#repromote({ bundleId: pid, base: projectRow.bundle_sha, text, when, author: who,
      meta: { object_type: pfm.object_type ?? "project", title: pfm.title, current_state: pfm.current_state ?? "forming",
              prior_state: pfm.prior_state ?? null, created: pfm.created, last_updated: when,
              criticality: pfm.criticality ?? null } });
  }

  /* ================================================================ the conclusion (R16–R21; §7.1) */

  /** R16–R19 (`op=conclude`). With a project, one dated, authored `concluded` row is appended to the PROJECT's
   *  `conclusions[]` adopting its CURRENT's claim verbatim, and the shared question's bytes do not move (§7.1 item 3).
   *  Without one, the question moves to `concluded` naming the reading whose claim it adopts (item 6). `withdraw: true`
   *  enters `withdrawConclusion` after the ONE machine fence both acts share (C-32.2). */
  conclude({ target, conclusion = "", falsifier = "", noFalsifier = false, version = "",
             project = null, commentary = "", reason = "", withdraw = false,
             viewer = null, author = null, identity = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-conclude — REC-64/C-32.2. */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_CONCLUDE",
               detail: "a conclusion is a named member's assertion about what the record shows. A machine "
                     + "credential may SURFACE a question, gather what it rests on and prepare the answer, "
                     + "and may never author the conclusion. Sign in as a member." };
    /* END DEC-49 REGION is-machine-conclude */
    if (withdraw === true) return this.withdrawConclusion({ target, project, reason, viewer, who, identity });
    const concl = String(conclusion ?? "").trim();
    const fals = String(falsifier ?? "").trim();
    /* empty means the no-project relationship, never a default project */
    const pid = String(project ?? "").trim();
    const comm = String(commentary ?? "").trim();
    const vname = String(version ?? "").trim();
    /* REC-117: the member's override, opt-in and never a default; `1`/`true` because a query string carries it */
    const noFals = noFalsifier === true || noFalsifier === 1 || noFalsifier === "1" || noFalsifier === "true";
    /* DEC-49 REGION is-conclude-answer — REC-64/C-33.1-2. */
    if (!concl && !pid)
      return { ok: false, reason: "NO_CONCLUSION",
               detail: "concluding records WHAT was concluded. C-2.8 requires a non-empty conclusion in the "
                     + "concluded state, so a conclusion with nothing in it would produce a bundle the "
                     + "catalog rejects. An undetermined answer is stated as undetermined, never left blank." };
    if (concl && pid)
      return { ok: false, reason: "CONCLUSION_IS_THE_CLAIM",
               detail: "a project concludes by ADOPTING the claim of the reading it stands on, and that claim "
                     + "is what was concluded (INVESTIGATIVE-SESSION.md §7.1). A separate conclusion text could "
                     + "say what no claim said. Send what you want to add beyond the claim as commentary= — it "
                     + "is recorded in your name and is never evidence — or state the claim itself on a "
                     + "reading first." };
    if (!fals && !noFals)
      return { ok: false, reason: "NO_FALSIFIER",
               detail: "a conclusion states what would OVERTURN it. Without that the finding cannot be "
                     + "checked by anyone, including its author, and a record that cannot be checked claims "
                     + "more than it can support. If no falsifier can honestly be stated, SAY SO rather than "
                     + "inventing one: conclude again with no_falsifier=1 and the record will carry `no "
                     + "falsifier stated` in your name and with today's date, on every surface this finding "
                     + "appears on and in the signed bytes if it is ever published." };
    if (fals && noFals)
      return { ok: false, reason: "FALSIFIER_AND_NONE_STATED",
               detail: "you have both stated a falsifier and asked to record that none was stated. Those are "
                     + "two different claims about this finding and the plane will not choose between them. "
                     + "Send the falsifier, or send no_falsifier=1 with the falsifier empty." };
    /* END DEC-49 REGION is-conclude-answer */
    for (const [name, v] of [["conclusion", concl], ["falsifier", fals], ["commentary", comm]])
      if (v.length > VERSION_REASON_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${VERSION_REASON_MAX} characters and cannot contain a `
                       + `quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "a conclusion answers ONE question: pass target=<inquiry id>" };
    /* an inquiry the viewer may not see answers exactly as an absent one */
    const b = this.#visible(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "concluding answers a question, and only an inquiry carries one." };
    let text = this.#doc(target);
    if (text === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    const fm = parseFrontmatter(text).data || {};
    /* THE MAP RULE: the machine is the catalogue's, over the DECLARED spelling. A project may conclude a question whose
       own state already reads `concluded` (one relationship's conclusion must not bar another's). */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes("concluded") && !(pid && b.current_state === "concluded"))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "concluded", target,
               from: b.current_state, object_type: fm.object_type ?? b.object_type,
               detail: "this is not a legal move in the catalog's state table for this document's own "
                     + "vocabulary. An inquiry concludes from open (or its `surfaced` alias); something "
                     + "deferred or dismissed is reopened first, and a legacy focus/problem document has "
                     + "no concluded state at all until its frontmatter is modernized." };
    let projRow = null, pfm = null;
    if (pid) {
      projRow = this.#visible(pid, viewer);
      if (!projRow) { const existence = this.membership.existenceAct(pid, viewer); if (existence) return existence; }
      if (!projRow || normalizeType(projRow.object_type) !== "project")
        return { ok: false, reason: "NOT_A_PROJECT", target, project: pid,
                 detail: `${pid.slice(0, 60)} is not a project readable here, so there is no relationship `
                       + "with this question to conclude in." };
      /* REC-134: a conclusion takes CURRENT's position — the actor must have JOINED the project */
      const denied = this.membership.projectAuthority(pid, identity, "joined", "conclude");
      if (denied) return denied;
      const pmd = this.#doc(pid);
      if (pmd === null)
        return { ok: false, reason: "NO_DOCUMENT", target, project: pid,
                 detail: "this project has no readable bundle.md, so its conclusion cannot be recorded" };
      pfm = parseFrontmatter(pmd).data || {};
    }

    /* DEC-49 REGION is-conclude-claim — REC-124/C-33.34. Every arm is the same fact: no claim to adopt. */
    if (!pid && comm)
      return { ok: false, reason: "NO_CLAIM", target,
               detail: "commentary is what a member adds BEYOND a PROJECT's adopted claim, and it is recorded "
                     + "on that project's conclusion. A conclusion drawn with no project carries the member's "
                     + "own words in conclusion= beside the claim it adopts, so there is nowhere for commentary "
                     + "to go. Conclude for a project (project=), or send no commentary." };
    if (!pid && !vname)
      return { ok: false, reason: "NO_CLAIM", target,
               detail: "a conclusion adopts the claim of a reading, and the claim is what was concluded "
                     + "(INVESTIGATIVE-SESSION.md §7.1). Drawn with no project there is no reading the question "
                     + "stands on, so name it: conclude with version=<the accepted reading whose claim this "
                     + "conclusion adopts>. A conclusion whose claim is undetermined asserts nothing anyone "
                     + "can check." };
    let want = vname;
    if (pid) {
      const prefs = Array.isArray(pfm.references) ? pfm.references : [];
      const draws = prefs.some((x) => x && typeof x === "object" && x.rel === "cites"
                                   && x.status !== "severed" && String(x.target ?? "").trim() === target);
      if (!draws)
        return { ok: false, reason: "NO_CLAIM", target, project: pid,
                 detail: `${pid} does not draw on ${target}, so it stands on no reading of it and has no `
                       + "claim to adopt. Cite the question into the project, make a reading current, then "
                       + "conclude." };
      const cur = this.currentOf(pid, target, viewer);
      if (!cur)
        return { ok: false, reason: "NO_CLAIM", target, project: pid,
                 detail: `${pid} stands on no reading of ${target}. Concluding adopts the claim of the `
                       + "reading a project stands on (§7.1), so make an accepted reading current "
                       + "(op=versioncurrent) first." };
      if (vname && vname !== cur.version)
        return { ok: false, reason: "NO_CLAIM", target, project: pid, version: vname,
                 detail: `${pid} stands on reading '${cur.version}', not '${vname.slice(0, 80)}'. A project `
                       + "concludes on the reading it stands on (§7.1 item 1): make that reading current "
                       + "first, or conclude without version=." };
      want = cur.version;
    }
    const v = this.#one(`SELECT name, state, claim, leg_count FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`,
                        target, want);
    const claimText = String(v?.claim ?? "").trim();
    const whose = pid ? `${pid} stands on reading` : "this conclusion names reading";
    if (!v || v.state !== "accepted" || !claimText)
      return { ok: false, reason: "NO_CLAIM", target, ...(pid ? { project: pid } : {}), version: want,
               detail: !v
                 ? `${whose} '${String(want).slice(0, 80)}', which ${target} does not carry, so there is no `
                   + "claim to adopt. Name a reading it does carry."
                 : v.state !== "accepted"
                 ? `${whose} '${want}', which is ${v.state || "in no recorded state"}, `
                   + "not accepted. A conclusion adopts only what the group accepted."
                 : `reading '${want}' states no claim, and the claim is what a conclusion adopts `
                   + "(§7.1). State the claim on a reading first — a claim with no support yet is legal "
                   + "to add (DEC-22) — then conclude on that reading." };
    const adopted = { version: v.name, claim: claimText, leg_count: Number(v.leg_count) || 0 };
    /* END DEC-49 REGION is-conclude-claim */

    const legs = Array.isArray(fm.basis) ? fm.basis : [];
    /* a conclusion rests on the adopted reading's legs, and without a project also on the live basis C-2.8 requires */
    if (adopted.leg_count < 1 || (!pid && legs.length < 1))
      return actNoBasis("a conclusion rests on something. An open inquiry may hold a claim with no legs at "
                      + "all — a standing objective the group means to pursue — but concluding one that "
                      + "rests on nothing would put the record's name to an assertion nothing supports. "
                      + "Add a basis[] leg (and the same target in references[]) first.", { target });

    if (pid) {
      const when = this.now();
      const priorRec = this.conclusionRecordOf(pid, target, viewer);
      const prior = priorRec.history.length ? priorRec.history[priorRec.history.length - 1] : null;
      const w = this.#setProjectConclusion(projRow, target, {
        act: "concluded", version: adopted.version, claim: adopted.claim, falsifier: fals, noFals,
        commentary: comm, who, when });
      if (!w.ok) return { ...w, target, project: pid };
      return { ok: true, target, project: pid, relationship: "project", to: "concluded",
               inquiry_state: b.current_state, inquiry_moved: false,
               version: adopted.version, claim: { state: "adopted", text: adopted.claim, version: adopted.version },
               falsifier: fals, basis_legs: adopted.leg_count,
               falsifier_override: noFals ? { by: who, at: when } : null,
               commentary: comm ? { text: comm, by: who, at: when, evidence: false } : null,
               prior: prior ? { act: prior.act, version: prior.version, claim: prior.claim, at: prior.at, by: prior.by } : null,
               history_length: priorRec.history.length + 1, author: who, at: when, weight: "single" };
    }

    const when = this.now();
    const withHistory = appendStateHistory(text, { timestamp: when, from_state: b.current_state, to_state: "concluded",
                                                   blurb: concl, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a conclusion "
                     + "recording no transition would leave prior_state pointing at a history the document "
                     + "does not carry (C-4.2)" };
    text = withHistory;
    text = setScalar(text, "prior_state", b.current_state);
    text = setScalar(text, "current_state", "concluded");
    text = setOrAddScalar(text, "conclusion", `"${concl}"`);
    text = setOrAddScalar(text, "conclusion_version", quoted(adopted.version));
    text = setOrAddScalar(text, "conclusion_claim", quoted(adopted.claim));
    text = setOrAddScalar(text, "falsifier", `"${fals}"`);
    /* REC-117: the override is its own pair, never written into the falsifier; a re-conclude with a falsifier clears a
       stale pair, and a normal conclude adds nothing (a stated falsifier's bytes are unchanged). */
    if (noFals) {
      text = setOrAddScalar(text, "falsifier_override_by", quoted(who));
      text = setOrAddScalar(text, "falsifier_override_at", `"${when}"`);
    } else {
      text = setScalar(text, "falsifier_override_by", `""`);
      text = setScalar(text, "falsifier_override_at", `""`);
    }
    text = setScalar(text, "last_updated", `"${when}"`);
    text = appendSessionLog(text,
      `### Session ${when} | Concluded | ${who}\n`
      + `Trigger: op=conclude on ${target}\n`
      + `Changes: state ${b.current_state} to concluded.\n`
      + `Conclusion: ${concl}\n`
      + `Adopted: reading '${adopted.version}', claim: ${adopted.claim}\n`
      + (noFals ? `Falsifier: NO FALSIFIER STATED — recorded by ${who} at ${when}\n` : `Falsifier: ${fals}\n`));
    const promoted = this.#repromote({ bundleId: target, base: b.bundle_sha, text, when, author: who,
      meta: { object_type: fm.object_type ?? b.object_type, title: fm.title, current_state: "concluded",
              prior_state: b.current_state, created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null } });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, from: b.current_state, to: "concluded",
             conclusion: concl, falsifier: fals, basis_legs: legs.length,
             falsifier_override: noFals ? { by: who, at: when } : null,
             relationship: "no_project", project: null, version: adopted.version,
             claim: { state: "adopted", text: adopted.claim, version: adopted.version },
             author: who, at: when, weight: "single" };
  }

  /* The conclusion record's ONE writer (R18, R20, R21), paired with `conclusionRecordOf`, its one reader: it only ever
     appends, then promotes the PROJECT. */
  #setProjectConclusion(projectRow, inquiryId, f) {
    const pid = projectRow.bundle_id;
    const md = this.#doc(pid);
    if (md === null)
      return { ok: false, reason: "NO_DOCUMENT", detail: `${pid} has no readable file, so its conclusion cannot be recorded` };
    const pfm = parseFrontmatter(md).data || {};
    let text = appendConclusionEntry(md, inquiryId, f);
    if (text === null)
      /* DEC-49 REGION is-conclusion-row — REC-124/C-33.36. */
      return { ok: false, reason: "UNSPLICEABLE_CONCLUSIONS",
               detail: `${pid}'s conclusions block could not be extended in place` };
      /* END DEC-49 REGION is-conclusion-row */
    text = setScalar(text, "last_updated", `"${f.when}"`);
    text = appendSessionLog(text, f.act === "withdrawn"
      ? `### Session ${f.when} | Conclusion withdrawn | ${f.who}\n`
        + `Trigger: op=withdrawconclusion on ${inquiryId} for ${pid}\n`
        + `Changes: this project withdrew its conclusion on ${inquiryId} (reading '${f.version}', concluded `
        + `${f.withdrawsAt}). The conclusion stays in the record; this project now stands on no conclusion.\n`
        + `Reason: ${f.reason}\n`
      : `### Session ${f.when} | Concluded | ${f.who}\n`
        + `Trigger: op=conclude on ${inquiryId} for ${pid}\n`
        + `Changes: this project concluded ${inquiryId} on reading '${f.version}', adopting its claim.\n`
        + `Claim: ${f.claim}\n`
        + (f.noFals ? `Falsifier: NO FALSIFIER STATED — recorded by ${f.who} at ${f.when}\n` : `Falsifier: ${f.falsifier}\n`)
        + (f.commentary ? `Commentary (${f.who}, not evidence): ${f.commentary}\n` : ""));
    return this.#repromote({ bundleId: pid, base: projectRow.bundle_sha, text, when: f.when, author: f.who,
      meta: { object_type: pfm.object_type ?? "project", title: pfm.title, current_state: pfm.current_state ?? "forming",
              prior_state: pfm.prior_state ?? null, created: pfm.created, last_updated: f.when,
              criticality: pfm.criticality ?? null } });
  }

  /** R20 (REC-136): a project withdraws its conclusion by APPENDING a dated, authored `withdrawn` row; the conclusion it
   *  withdraws stays readable beside it (DEC-19). The no-project relationship is not withdrawn here (that is
   *  `op=reopen`'s). Reached through `conclude` (`withdraw: true`), after its machine fence; `who` arrives judged. */
  withdrawConclusion({ target, project = null, reason = "", viewer = null, who, identity = null }) {
    const actor = String(who ?? "").trim();
    if (!actor || isMachineIdentity(actor))
      return this.conclude({ target, project, reason, withdraw: true, viewer, author: actor, identity });
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "withdrawing a conclusion records WHY the project no longer stands on it. The conclusion "
                     + "stays in the record beside the withdrawal, and a withdrawal with no account would leave "
                     + "a reader unable to tell a correction from a change of mind. Nothing here is prefilled." };
    if (why.length > EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + "a backslash, or a newline: the restricted frontmatter grammar has no escapes" };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "a withdrawal answers ONE question: pass target=<inquiry id>" };
    const pid = String(project ?? "").trim();
    const b = this.#visible(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "a conclusion answers a question, and only an inquiry carries one." };
    const projRow = pid ? this.#visible(pid, viewer) : null;
    if (!projRow || normalizeType(projRow.object_type) !== "project")
      return { ok: false, reason: "NOT_A_PROJECT", target, project: pid || null,
               detail: pid
                 ? `${pid.slice(0, 60)} is not a project readable here, so there is no relationship with this `
                   + "question to withdraw a conclusion from."
                 : "a withdrawal is a PROJECT's act on its own conclusion: pass project=<project id>. A "
                   + "conclusion drawn with no project is the inquiry's own state, and moving it is op=reopen's." };
    const denied = this.membership.projectAuthority(pid, identity, "joined", "withdrawconclusion");
    if (denied) return { ...denied, target };
    const rec = this.conclusionRecordOf(pid, target, viewer);
    /* DEC-49 REGION is-withdraw-stance — REC-136/C-33.37. */
    if (!rec.stance || rec.stance.act !== "concluded")
      return { ok: false, reason: "NOTHING_TO_WITHDRAW", target, project: pid,
               stance: rec.stance ? rec.stance.state : "none",
               detail: !rec.stance
                 ? `${pid} has never concluded ${target}, so there is no conclusion to withdraw.`
                 : rec.stance.act === "withdrawn"
                 ? `${pid}'s latest act on ${target} was already a withdrawal (${rec.stance.at || "undated"}), so `
                   + "it stands on no conclusion to withdraw. Its history is unchanged."
                 : `${pid}'s latest entry on ${target} is one this plane cannot read, so what it stands on is `
                   + "undetermined and a withdrawal would be withdrawing a guess." };
    /* END DEC-49 REGION is-withdraw-stance */
    const when = this.now();
    const w = this.#setProjectConclusion(projRow, target, {
      act: "withdrawn", version: rec.stance.version, withdrawsAt: rec.stance.at, reason: why, who: actor, when });
    if (!w.ok) return { ...w, target, project: pid };
    return { ok: true, target, project: pid, relationship: "project", act: "withdrawn", to: "withdrawn",
             inquiry_moved: false,
             withdraws: { version: rec.stance.version, claim: rec.stance.claim, at: rec.stance.at, by: rec.stance.by },
             reason: why, history_length: rec.history.length + 1, author: actor, at: when, weight: "single" };
  }

  /* ================================================================ appendVersion (R28) */

  /** R28: appends ONE version, its grounds and its legs to the question's document, in `suggested` state and not
   *  hidden (a caller's `state` or `hidden` is never read), and promotes it, so R6 judges it. The version row is written
   *  in the caller's field order with `state` and `hidden` after `relationship` (undefined skipped, null written as
   *  `null`); each ground and leg row in its own order (undefined, null and empty skipped), numbers bare, lists of
   *  numbers inline, text quoted. Whether the composition differs in substance from every held version is the
   *  caller's check. Refusals: `NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`, `NO_DOCUMENT`, `UNSPLICEABLE_BASIS`; promote's own
   *  come back unchanged. */
  appendVersion({ target, version, grounds = [], legs = [], author, run, kind, at, log } = {}) {
    const tgt = String(target ?? "").trim();
    const b = this.#held(tgt);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: tgt || null };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target: tgt, object_type: b.object_type };
    const src = this.#doc(tgt);
    if (src === null) return { ok: false, reason: "NO_DOCUMENT", target: tgt };
    const fm0 = parseFrontmatter(src).data || {};
    const v = version && typeof version === "object" ? { ...version } : {};
    if (kind !== undefined && v.kind === undefined) v.kind = kind;
    if (run !== undefined && v.run === undefined) v.run = run;
    const when = at || this.now();
    const name = String(v.name ?? "");
    const vLines = [];
    for (const [k, val] of Object.entries(v)) {
      if (k === "state" || k === "hidden" || val === undefined) continue;
      vLines.push(`${vLines.length ? "    " : "  - "}${k}: ${val === null ? "null" : typedValue(val)}`);
      if (k === "relationship") vLines.push(`    state: "suggested"`, `    hidden: false`);
    }
    if (!("relationship" in v)) vLines.push(`    state: "suggested"`, `    hidden: false`);
    const rowOf = (o) => {
      const lines = [`  - version: ${quoted(name)}`];
      for (const [k, val] of Object.entries(o || {})) {
        if (k === "version" || val === undefined || val === null || val === "") continue;
        lines.push(`    ${k}: ${typedValue(val)}`);
      }
      return lines.join("\n");
    };
    let text = appendFmRows(src, "basis_versions", [vLines.join("\n")]);
    const gRows = (Array.isArray(grounds) ? grounds : []).map(rowOf);
    const lRows = (Array.isArray(legs) ? legs : []).map(rowOf);
    if (text !== null && gRows.length) text = appendFmRows(text, "basis_version_grounds", gRows);
    if (text !== null && lRows.length) text = appendFmRows(text, "basis_version_legs", lRows);
    if (text === null)
      return { ok: false, reason: "UNSPLICEABLE_BASIS", target: tgt,
               detail: "this question's version block is in a shape the restricted frontmatter grammar "
                     + "cannot extend in place, so nothing was written." };
    text = setScalar(text, "last_updated", `"${when}"`);
    text = appendSessionLog(text, typeof log === "string" && log
      ? log
      : `### Session ${when} | Version appended | ${author}\n`
        + `Trigger: appendVersion on ${tgt}\n`
        + `Changes: reading '${fmSafe(name)}' added, in state suggested.\n`);
    return this.#repromote({ bundleId: tgt, base: b.bundle_sha, text, when, author,
      meta: { object_type: fm0.object_type ?? b.object_type, title: fm0.title, current_state: b.current_state,
              prior_state: fm0.prior_state ?? null, created: fm0.created, last_updated: when,
              criticality: fm0.criticality ?? null } });
  }

  /* ================================================================ narrowing (R24–R27; REC-86) */

  /** R25's extract arm (proposed R40): one module registers the source of passages an extract run proposed. */
  onCandidates(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "LISTENER_MALFORMED", detail: "a candidate source names its module and its function" };
    if (this.#candidateSource)
      return { ok: false, reason: "LISTENER_DECLARED", module: this.#candidateSource.module,
               detail: `${this.#candidateSource.module} already provides the extract candidates` };
    this.#candidateSource = { module, fn };
    return { ok: true, module };
  }

  /* R24: the citation both reads name: the inquiry, the version, the leg, and the content row it resolves to today. */
  #narrowSource({ target = null, version = null, ord = null, viewer = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = NARROW_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };
    const tgt = String(target ?? "").trim();
    const vname = String(version ?? "").trim();
    const ordRaw = String(ord ?? "").trim();
    /* DEC-49 REGION is-narrow-source */
    const b = tgt ? this.#visible(tgt, viewer) : null;
    if (!b || normalizeType(b.object_type) !== "inquiry")
      return refusal("NARROW_NO_INQUIRY",
        tgt ? `no question by the id '${tgt.slice(0, 60)}' is readable here. A question you may not `
              + `see answers exactly as one that does not exist.`
            : `pass target=<INQ-…>: the question whose reading holds the citation.`, { target: tgt || null });
    const text = this.#doc(b.bundle_id);
    const fm = text !== null ? (parseFrontmatter(text).data || {}) : {};
    const versions = Array.isArray(fm.basis_versions) ? fm.basis_versions : [];
    const vrow = vname ? versions.find((r) => r && typeof r === "object" && String(r.name ?? "").trim() === vname) : null;
    if (!vrow)
      return refusal("NARROW_NO_SUCH_VERSION",
        vname ? `${b.bundle_id} holds no reading named '${vname.slice(0, 64)}'.`
                + (versions.length ? "" : " It holds no readings at all: the live basis is not a reading, and "
                  + "a citation on it is made more specific by a reading taken from it.")
              : `pass version=<the name of the reading that holds the citation>.`,
        { target: b.bundle_id, version: vname || null,
          known: versions.map((r) => String(r?.name ?? "").trim()).filter(Boolean).slice(0, 20) });
    const legRows = (Array.isArray(fm.basis_version_legs) ? fm.basis_version_legs : [])
      .filter((l) => l && typeof l === "object" && String(l.version ?? "").trim() === vname);
    const k = /^\d+$/.test(ordRaw) ? parseInt(ordRaw, 10) : -1;
    if (k < 0 || k >= legRows.length)
      return refusal("NARROW_NO_SUCH_LEG",
        `the reading '${vname}' has ${legRows.length} piece(s) of evidence, counted from 0, and `
        + `${ordRaw ? `'${ordRaw.slice(0, 12)}'` : "no position"} was named.`,
        { target: b.bundle_id, version: vname, ord: ordRaw || null, legs: legRows.length });
    const leg = legRows[k];
    /* the row the projection resolved for this leg: one answer to "which part", never a second derivation */
    const proj = this.#one(`SELECT target_id, content_id FROM inquiry_basis_version_legs WHERE bundle_id=? AND name=? AND ord=?`,
                           b.bundle_id, vname, k);
    const row = proj && proj.content_id ? this.content.contentRow(proj.content_id) : null;
    if (!proj || proj.target_id !== leg.target || !row)
      return refusal("NARROW_NO_PART",
        isInquiryId(leg.target)
          ? `piece ${k} of '${vname}' rests on another question (${leg.target}), which has no part to name.`
          : `piece ${k} of '${vname}' rests on ${leg.target}, and this record resolves no part of it — it `
            + `holds no copy of that document to point into.`,
        { target: b.bundle_id, version: vname, ord: k, leg_target: leg.target ?? null });
    /* END DEC-49 REGION is-narrow-source */
    const extent = row.extent && typeof row.extent === "object" ? row.extent : { kind: row.extent_kind };
    return { ok: true, b, fm, text, vrow, vname, legRows, k, leg, row, extent };
  }

  /* R25: the machine's proposals for one leg, strictly NARROWER than it and in the same capture, per source. */
  #narrowCandidateList(src) {
    const cap = src.row.capture_sha;
    const subject = typeof src.fm.subject_entity === "string" && src.fm.subject_entity.trim()
      ? src.fm.subject_entity.trim() : null;
    const max = NARROW_CANDIDATES_MAX;
    const out = [];
    const seen = new Set();
    let truncated = false;
    const counts = { reading: 0, extract: 0, marked: 0 };
    const push = (c) => {
      c.fields = c.content_id ? { content_id: c.content_id } : extentLegFields(c.extent);
      const key = canonicalExtent(c.extent);
      if (seen.has(key)) return;
      if (extentRelation(src.extent, c.extent) !== "narrower") return;
      seen.add(key);
      if (counts[c.source] >= max) { truncated = true; return; }
      counts[c.source] += 1;
      out.push(c);
    };
    /* (1) where the record's own reading found a reference; whether it names the subject is three-valued (null when
       the question names none). One bounded read, the subject test folded in (extraction R58, entities' resolutions). */
    const refRows = this.#rows(
      `SELECT rr.ref AS ref, rr.label AS label, rr.pos_kind AS pos_kind, rr.pos AS pos, rr.pos_ref AS pos_ref,
              EXISTS (SELECT 1 FROM resolutions r
                       WHERE r.capture_sha = rr.capture_sha AND r.ref = rr.ref AND r.entity_id = ?) AS named
         FROM reading_refs rr
        WHERE rr.capture_sha=? AND rr.pos_kind IS NOT NULL ORDER BY rr.ref, rr.seq LIMIT ?`, subject ?? "", cap, max * 4 + 1);
    if (refRows.length > max * 4) truncated = true;
    for (const r of refRows) {
      const pos = readingSourceFromColumns(r.pos_kind, r.pos, r.pos_ref);
      if (!pos) continue;
      push({ source: "reading", ref: pos.ref, extent: { kind: pos.kind, ...posFields(pos) },
             reference: r.ref, label: r.label ?? null, mentions_subject: subject ? !!r.named : null,
             content_id: null, mint: mintLabel(CONTENT_MINTED_BY_PLANE), machine_work: true,
             says: `the record's own reading of this document found a reference ('${String(r.ref).slice(0, 80)}') `
                 + `at ${pos.ref}. That it is there is what the reading says; whether it is on point is yours `
                 + `to judge.` });
    }
    /* (2) what an extract run proposed, through the registered source (ai-runs, K73 (2)) */
    if (this.#candidateSource) {
      let ext = null;
      try { ext = this.#candidateSource.fn({ captureSha: cap, max }); } catch { ext = null; }
      const extRows = ext && Array.isArray(ext.rows) ? ext.rows : [];
      if (ext && ext.truncated) truncated = true;
      for (const r of extRows) {
        const pos = readingSourceFromColumns(r.pos_kind, r.pos, r.pos_ref);
        if (!pos) continue;
        push({ source: "extract", ref: pos.ref, extent: { kind: pos.kind, ...posFields(pos) },
               reference: r.ref, label: r.label ?? null, run: r.run, mentions_subject: null,
               content_id: r.content_id ?? null, mint: mintLabel(r.proposed_by), machine_work: true,
               says: `a machine proposed this passage in run ${r.run}. It is a PROPOSAL: not part of any `
                   + `citation, and not coverage, until a member chooses it.` });
      }
    }
    /* (3) rows a machine marked citable (content R45's read contract) */
    const markRows = this.#rows(
      `SELECT content_id, extent_kind, extent, ref, minted_by FROM content
        WHERE capture_sha=? AND extent_kind <> 'document' ORDER BY at, content_id LIMIT ?`, cap, max * 4 + 1);
    for (const r of markRows) {
      if (contentMintState(r.minted_by) !== "machine_marked") continue;
      push({ source: "marked", ref: r.ref, extent: { kind: r.extent_kind, ...(safeJson(r.extent) || {}) },
             reference: null, label: null, mentions_subject: null, content_id: r.content_id,
             mint: mintLabel(r.minted_by), machine_work: true,
             says: `a machine marked this passage citable. Nobody has chosen it for this citation.` });
    }
    /* subject mentions first — the one ordering the record can defend — then as read */
    out.sort((x, y) => (y.mentions_subject === true) - (x.mentions_subject === true));
    return { candidates: out, counts, truncated, subject,
             read: !!this.#one(`SELECT 1 AS x FROM readings WHERE capture_sha=?`, cap) };
  }

  /** R24, R25 (`op=narrowcandidates`): a READ. Every entry is machine work and a proposal; listing it writes nothing.
   *  With none, the absence is stated by level (never read, or read and nothing inside). */
  narrowCandidates({ target = null, version = null, ord = null, viewer = null } = {}) {
    const src = this.#narrowSource({ target, version, ord, viewer });
    if (!src.ok) return src;
    const list = this.#narrowCandidateList(src);
    const leg = { target: src.leg.target, content_id: src.row.content_id, ref: src.row.ref,
                  extent: src.extent, capture_sha: src.row.capture_sha };
    const absence = list.candidates.length ? null
      : !list.read
        ? { level: "document", says: "this copy of the document has never been read, so the machine has "
              + "no passage to propose. You may still name the part yourself." }
        : { level: "content", says: "the document was read and nothing the machine found lies inside what "
              + "this citation already points at. That is not evidence there is no better passage — only "
              + "that none was proposed. You may still name the part yourself." };
    return { ok: true, target: src.b.bundle_id, version: src.vname, ord: src.k, leg,
             subject: list.subject, candidates: list.candidates, counts: list.counts,
             limit: NARROW_CANDIDATES_MAX, truncated: list.truncated, absence, proposal_only: true,
             says: "every entry here is MACHINE WORK and a PROPOSAL. Listing it wrote nothing and cited "
                 + "nothing; which passage is on point to this question is the member's judgment, made by "
                 + "op=narrow in the member's own name." };
  }

  /** R24, R26, R27 (`op=narrow`): THE ACT. A new version `suggested`, `derived_from` the old, identical but for the
   *  one leg, which names the part (pinned to the old leg's capture) and carries no grade; the old version is untouched
   *  (Bob's 5.8: the act makes a new reading, it does not rewrite the one somebody may stand on). */
  narrow(a = {}) {
    const args = a || {};
    const refusal = (code, detail, extra) => {
      const row = NARROW_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };
    const src = this.#narrowSource(args);
    if (!src.ok) return src;
    const who = String(args.author ?? "").trim();
    const name = String(args.name ?? "").trim();
    const nameWritten = fmSafe(name);
    const description = String(args.description ?? "").trim();
    const EXTENT_FIELDS = {
      extent_kind: "text", extent_ref: "text", extent_page: "int", extent_rect: "nums",
      extent_sheet: "text", extent_cell: "text", extent_slide: "int", extent_shape: "int",
      extent_para: "int", extent_run: "int", content_id: "text",
    };
    const bag = args.extent && typeof args.extent === "object" ? args.extent : {};
    const authored = Object.keys(bag).filter((k) => String(bag[k] ?? "").trim() !== "").sort();
    const legFields = {};
    let chosenRow = null;
    /* DEC-49 REGION is-narrow-extent */
    if (!who || isMachineIdentity(who))
      return refusal("NARROW_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. It may propose passages (op=narrowcandidates `
              + `lists them); choosing which one a citation rests on is a member's act.`
            : `this act names no member, and a choice nobody made is not a choice.`, { target: src.b.bundle_id });
    const unknown = Object.keys(bag).filter((k) => !(k in EXTENT_FIELDS)).sort();
    if (unknown.length)
      return refusal("NARROW_BAD_EXTENT",
        `this call names ${unknown.map((k) => `'${k}'`).join(", ")}, which this act does not take. The `
        + `fields it takes are: ${Object.keys(EXTENT_FIELDS).join(", ")}.`, { got: unknown });
    if (!authored.length)
      return refusal("NARROW_NO_EXTENT",
        "pass extent={…}: the part of the document the citation should now point at, or the content_id "
        + "of a proposed passage.", { target: src.b.bundle_id });
    for (const k of authored) {
      const raw = String(bag[k]).trim();
      if (raw.length > 200 || /["\\\r\n#]/.test(raw))
        return refusal("NARROW_BAD_EXTENT",
          `'${k}' cannot be written into the record as it stands: at most 200 characters, and no quotation `
          + `mark, backslash, line break or comment mark.`, { field: k });
      const t = EXTENT_FIELDS[k];
      if (t === "int" && /^\d+$/.test(raw)) legFields[k] = parseInt(raw, 10);
      else if (t === "nums") {
        const parts = raw.replace(/^\[|\]$/g, "").split(",").map((s) => s.trim());
        const nums = parts.map((s) => (/^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN));
        legFields[k] = nums.every((n) => Number.isFinite(n)) ? nums : raw;
      } else legFields[k] = raw;
    }
    if (legFields.content_id !== undefined) {
      if (authored.length > 1)
        return refusal("NARROW_BAD_EXTENT",
          "this call names a content id AND describes a part: one fact written twice, which can disagree. "
          + "Send one or the other.", { got: authored });
      chosenRow = this.content.contentRow(String(legFields.content_id));
      if (!chosenRow)
        return refusal("NARROW_BAD_EXTENT",
          `content id '${String(legFields.content_id).slice(0, 16)}…' names no part this record holds.`,
          { content_id: String(legFields.content_id) });
      if (chosenRow.bundle_id !== src.leg.target || chosenRow.capture_sha !== src.row.capture_sha)
        return refusal("NARROW_OTHER_CAPTURE",
          `the citation rests on ${src.leg.target} as captured at ${src.row.capture_sha.slice(0, 12)}…, and `
          + `the part named is ${chosenRow.bundle_id === src.leg.target
            ? `in a DIFFERENT copy of it (${String(chosenRow.capture_sha).slice(0, 12)}…)`
            : `in a different document (${chosenRow.bundle_id})`}.`,
          { from_capture: src.row.capture_sha, to_capture: chosenRow.capture_sha, to_bundle: chosenRow.bundle_id });
    }
    /* END DEC-49 REGION is-narrow-extent */
    /* the grammar is the leg grammar's ONE checker, answered under op=promote's own name (inquiry R5) */
    if (!chosenRow) {
      const ef = [];
      checkLegExtentGrammar(legFields, "the part of the document this narrowing names", "C-25.10", ef);
      const errs = ef.filter((x) => x.severity === "error");
      if (errs.length)
        return { ok: false, reason: "BASIS_REFUSED", target: src.b.bundle_id,
                 findings: errs.map((x) => ({ check: x.check, code: x.code ?? null, detail: x.message,
                                              repairs: x.repairs ?? [] })),
                 detail: "the part named is refused by the SAME catalog function op=promote runs at the "
                       + "write, so nothing was written." };
    }
    const newExtent = chosenRow ? chosenRow.extent : legExtent(legFields);
    const relation = extentRelation(src.extent, newExtent);
    const existingNames = new Set((Array.isArray(src.fm.basis_versions) ? src.fm.basis_versions : [])
      .map((r) => String(r?.name ?? "").trim()));
    /* DEC-49 REGION is-narrow-claim */
    if (relation !== "narrower")
      return refusal("NARROW_NOT_NARROWER",
        `the citation points at ${src.row.ref} and the part named (${describeExtent(newExtent)}) is `
        + (relation === "same" ? "that same part"
          : relation === "wider" ? "WIDER than it"
          : relation === "disjoint" ? "a different place, not a part of it"
          : "not one this record can compare with it")
        + ". Narrowing only ever points a citation at less of its document.",
        { relation, from: src.extent, to: newExtent });
    if (!name || !VERSION_NAME_RE.test(name) || existingNames.has(nameWritten))
      return refusal("NARROW_NAME",
        !name ? "pass name=<a name for the new reading>."
          : existingNames.has(nameWritten)
            ? `'${name.slice(0, 64)}' already names a reading of ${src.b.bundle_id}` + (nameWritten === src.vname
              ? ` — it is the reading being narrowed, and reusing its name would change it in place.` : `.`)
            : `'${name.slice(0, 64)}' is not a name a reading can carry: letters, digits, space, dot, `
              + `dash and underscore, starting with a letter or digit, at most 64 characters.`,
        { name: name || null, taken: existingNames.has(nameWritten) });
    if (!description || isBoilerplate(description))
      return refusal("NARROW_NO_DESCRIPTION",
        "pass description=<what changed and why>: which citation now points at less of its document, and "
        + "why that part is the one on point.", { name });
    /* END DEC-49 REGION is-narrow-claim */

    /* THE COMPOSITION — the source version copied, one leg re-pointed. The partition is carried and asserted in the
       narrowing member's name (C-25.6 asks a named member to stand behind each part; the old asserter is not copied). */
    const nowIso = this.now();
    const vr = src.vrow;
    const version = { name: nameWritten, description,
                      ...(vr.claim === undefined || vr.claim === null || vr.claim === "" ? {} : { claim: vr.claim }),
                      relationship: vr.relationship, derived_from: src.vname, author: who, at: nowIso };
    const grounds = (Array.isArray(src.fm.basis_version_grounds) ? src.fm.basis_version_grounds : [])
      .filter((g) => g && typeof g === "object" && String(g.version ?? "").trim() === src.vname)
      .map((g) => ({ ground: String(g.ground ?? ""), asserted_by: who, at: nowIso, statement: g.statement }));
    const LEG_KEYS = ["target", "role", "ground", "grade", "grade_axis", "grade_source", "note", "date",
                      "extent_capture", ...Object.keys(EXTENT_FIELDS)];
    const EXTENT_KEYS = new Set([...Object.keys(EXTENT_FIELDS), "extent_capture"]);
    const GRADE_KEYS = new Set(["grade", "grade_axis", "grade_source"]);
    const dropped = {};
    const legs = src.legRows.map((l, i) => {
      const o = {};
      for (const key of LEG_KEYS) {
        if (i === src.k && (EXTENT_KEYS.has(key) || GRADE_KEYS.has(key))) {
          if (GRADE_KEYS.has(key) && l[key] !== undefined && l[key] !== null && l[key] !== "") dropped[key] = l[key];
          continue;
        }
        o[key] = l[key];
      }
      if (i === src.k) {
        if (chosenRow) o.content_id = chosenRow.content_id;
        else {
          for (const [key, v] of Object.entries(legFields)) o[key] = v;
          /* the capture is PINNED, so the narrower row is minted against the same bytes (5.8) */
          o.extent_capture = src.row.capture_sha;
        }
      }
      return o;
    });
    /* was it one of the machine's proposals? derived here, never taken from the caller */
    const toKey = canonicalExtent(newExtent);
    const matched = this.#narrowCandidateList(src).candidates.find((c) => canonicalExtent(c.extent) === toKey) || null;
    const promoted = this.appendVersion({ target: src.b.bundle_id, version, grounds, legs, author: who, at: nowIso,
      log: `### Session ${nowIso} | Narrowed a citation | ${who}\n`
        + `Trigger: op=narrow on ${src.b.bundle_id}\n`
        + `Changes: reading '${nameWritten}' derived from '${src.vname}', in state suggested; piece ${src.k} `
        + `(${src.leg.target}) now points at ${fmSafe(describeExtent(newExtent))} instead of `
        + `${fmSafe(src.row.ref)}. '${src.vname}' is unchanged.`
        + (matched ? ` Chosen from a machine proposal (${matched.source}).` : ` Named by the member.`)
        + (Object.keys(dropped).length ? ` The old grade was not carried: a part earns only from what is in it.` : ``)
        + `\n` });
    if (!promoted.ok) return { ...promoted, target: src.b.bundle_id, name: nameWritten };
    const after = this.#one(`SELECT content_id FROM inquiry_basis_version_legs WHERE bundle_id=? AND name=? AND ord=?`,
                            src.b.bundle_id, nameWritten, src.k);
    const toRow = after && after.content_id ? this.content.contentRow(after.content_id) : null;
    const fromRow = this.#one(`SELECT content_id FROM inquiry_basis_version_legs WHERE bundle_id=? AND name=? AND ord=?`,
                              src.b.bundle_id, src.vname, src.k);
    return { ok: true, target: src.b.bundle_id, version: nameWritten, derived_from: src.vname,
             ord: src.k, state: "suggested", author: who,
             narrowed: {
               from: { content_id: src.row.content_id, ref: src.row.ref, extent: src.extent, still_held_by: src.vname,
                       unchanged: !!fromRow && fromRow.content_id === src.row.content_id },
               to: toRow
                 ? { content_id: toRow.content_id, ref: toRow.ref, extent: toRow.extent,
                     capture_sha: toRow.capture_sha, mint: mintLabel(toRow.minted_by) }
                 : { content_id: null, ref: describeExtent(newExtent), extent: newExtent },
             },
             chosen_from: matched ? { source: matched.source, machine_work: true, says: matched.says } : null,
             grade_not_carried: Object.keys(dropped).length
               ? { was: dropped,
                   why: "a grade was earned for what the citation pointed at before; a part earns only from "
                      + "what is in it, so the narrowed piece is left ungraded and stated as such. "
                      + "op=earnedbasis answers what this part earns." }
               : null,
             bundleSha: promoted.bundleSha ?? promoted.bundle_sha ?? null,
             version_content: promoted.version_content ?? [],
             says: `a new reading '${nameWritten}' was written, taken from '${src.vname}', with piece ${src.k} `
                 + `pointing at less of its document. '${src.vname}' and its citation are exactly as they `
                 + `were. The new reading is SUGGESTED: standing on it is a separate act.` };
  }
}

const instances = new WeakMap();

/** The one basis-versions instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on the
 *  first call only. At creation it declares its tables (R34) and joins every promotion (R6, R7). */
export function basisVersionsOf(host, deps) {
  let bv = instances.get(host);
  if (!bv) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    const content = d.content || contentOf(host, { record, membership });
    bv = new BasisVersions({ ...d, storage: d.storage || host.storage, record, membership, promotion, content });
    instances.set(host, bv);
    record.declarePurge("basis-versions", BASIS_VERSIONS_TABLES);
    promotion.registerStep("basis-versions", { check: (c) => bv.check(c), project: (c) => bv.project(c) });
  }
  return bv;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function basisVersionsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return BASIS_VERSIONS_TABLES.includes(name);
}

/* The Durable Object routes this module answers, as entries of the legacy store's op map (its dispatcher spreads them
   in; K3). `url` carries the control plane's stamps — `viewer`, `author`, `identity` — and `body` the parsed body; no
   stamp is read from the body. */
export function basisVersionsOps(bv, url, body) {
  const q = (key) => url.searchParams.get(key);
  const b = body && typeof body === "object" ? body : null;
  /* ONE argument reader for all six acts: the reason and the hidden flag may arrive in the body; the stamps only in
     the query string (`identity` is REC-134's positional identity). */
  const versionArgs = () => {
    const v = (k) => (b && b[k] !== undefined ? b[k] : q(k));
    return { target: v("target"), version: v("version"), reason: v("reason"), project: v("project"),
             hidden: v("hidden"), preview: v("preview"), affirmed: v("affirmed"),
             author: q("author"), viewer: q("viewer"), identity: q("identity") };
  };
  return {
    basisversions: () => bv.basisVersions({ id: q("id"), limit: q("limit"), offset: q("offset"), viewer: q("viewer"),
                                            project: q("project") }),
    versionaccept:   () => bv.versionAccept(versionArgs()),
    versionreject:   () => bv.versionReject(versionArgs()),
    versionconsider: () => bv.versionConsider(versionArgs()),
    versionrevert:   () => bv.versionRevert(versionArgs()),
    versioncurrent:  () => bv.versionCurrent(versionArgs()),
    versionhide:     () => bv.versionHide(versionArgs()),
    narrow: () => bv.narrow({
      target: (b && b.target) || q("target"), version: (b && b.version) || q("version"),
      ord: (b && b.ord !== undefined ? b.ord : null) ?? q("ord"),
      name: (b && b.name) || q("name"), description: (b && b.description) || q("description"),
      extent: b && b.extent && typeof b.extent === "object" ? b.extent : null,
      author: q("author"), viewer: q("viewer") }),
    narrowcandidates: () => bv.narrowCandidates({ target: q("target"), version: q("version"), ord: q("ord"),
                                                  viewer: q("viewer") }),
    /* `no_falsifier` is the member's own assertion, so it arrives from the caller; the stamps are identity only */
    conclude: () => bv.conclude({ target: q("target"), conclusion: q("conclusion"), falsifier: q("falsifier"),
                                  noFalsifier: q("no_falsifier"), project: q("project"), commentary: q("commentary"),
                                  version: q("version"), viewer: q("viewer"), author: q("author"), identity: q("identity") }),
    withdrawconclusion: () => bv.conclude({ withdraw: true, target: q("target"), project: q("project"), reason: q("reason"),
                                            viewer: q("viewer"), author: q("author"), identity: q("identity") }),
  };
}
