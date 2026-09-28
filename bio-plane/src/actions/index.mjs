/* actions — the Action object (requirements: `build/requirements/actions.md`; State Rules v1.5 §4.4): what the group
 * sends or does outside the system, to whom, why, under which laws, at what legal exposure, by when, and what came
 * back. A member decides every move; a machine prepares and never advances, testifies, sets a tier or states a law.
 *
 * Extracted from the legacy modules (T8, layer 9; K3, K4, K6, K23, K31, K57, K61, K64, K75 (2), K79, K102):
 * `store.mjs` (the clock rule, `#actionDerived`, `actionMove` … `#spliceCorrespondence`, the governing-laws fence, the
 * action, risk-tier and `responds_to` arms of the promotion step and its three projections, the purge list entries and
 * the dispatch) and `schema.mjs` (the four tables, now `./schema.mjs`); the catalogue's action arms and rows are
 * `./checks.mjs`. The legacy code's comments moved with it.
 *
 * REACHED as `actionsOf(host, deps)` (K61): one instance per host, created on the first call. At creation it creates
 * its tables and declares them to record-core's purge (R36), registers its check and projection with promotion (R1–R3,
 * R7, R11, R33), its audit check with record-core (R37), and its facts and projection decoration with retrieval (R12,
 * R25; retrieval R53, R56).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `transact`, `acquireLease`, `head`, `readFile`, `livePaths`,
 *                                   `declarePurge`, `registerAuditCheck`, `getSetting`; `viewerPredicate`;
 *                                   `promote`, `registerStep`.
 *   retrieval      `registerActionFacts`, `registerProjectionDecoration` (its R53, R56).
 *   content        `captureFor` (R11).
 *   conformance    `determinationRead` (R8, R30), when provided (see R8 below).
 *   now            the instance clock, milliseconds (default: `env.BIO_NOW_MS`, else the wall clock).
 *   env            the instance bindings.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`) and
 * `files` (`bundle_id`, `path`, `content`), its R37; provenance's `register` (`capture_sha`, `bundle_id`), its R48;
 * connections' `refs` (`bundle_id`, `target_id`, `kind`) for R25's `responses`. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { retrievalOf } from "../retrieval/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { parseFrontmatter, normalizeType, vocabFor, STATES, OBJECT_TYPES, isMachineIdentity, createSha256,
         BUNDLE_ID_RE } from "../../checks/bio-checks.mjs";
import { RISK_TIERS, riskTierState, RESOLUTIONS, CORRESPONDENCE_DIRECTIONS, actionBasisFindings,
         correspondenceFindings, isQuoteEntry, quoteValue, quoteFindings, lifecycleFindings, lawProposalLabel,
         LAW_LEVELS, GOVERNING_LAWS_MAX, CITATION_MAX, RISK_TIER_REASON_MAX, RISK_TIER_HISTORY_MAX, riskTierHistoryOf,
         governingLawsOf, requestLifecycleOf, consequenceState, respondsToEdgeFindings, checkActionExtension,
         recordsLawFindings, recordsLawOf, counterpartyName, counterpartyFindings, actionKinds, kindReadsAsWritten,
         clockMovesNotMechanical, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS, QUOTE_CHECKS,
         LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS, ACTION_CATALOGUE_CHECKS } from "./checks.mjs";
import { ACTIONS_TABLES, migrateActions } from "./schema.mjs";

export * from "./checks.mjs";
export { ACTIONS_SCHEMA, ACTIONS_TABLES } from "./schema.mjs";

/** R13, R15: the longest reason, account, medium or party (the legacy store's `RELEASE_ACK_MAX`). */
export const NOTE_MAX = 500;
/* REC-24: how long op=actioncorrespond holds the courtesy lock while it rewrites one document. Short on purpose — the
   op is a single append with no human step inside it. It is a COURTESY: promote's CAS on `base` is what actually
   prevents a lost update, and this only stops two members interleaving two accounts of the same exchange. */
export const CORRESPOND_LEASE_MS = 30000;
/* REC-195: the most PROPOSALS one action's read returns (each at most GOVERNING_LAWS_MAX citations). A cut, published
   beside the answer — never a claim that no more exist. R28: the same bound for proposed tiers. */
export const LAW_PROPOSALS_READ_MAX = 12;
export const RISK_PROPOSALS_READ_MAX = 12;
/** R27: the most quotes one read answers. */
export const QUOTES_MAX = 500;
/** R30: the most actions one page lists; R31: the most pending clock entries. */
export const ACTIONS_PAGE_MAX = 200;
export const PENDING_CLOCKS_MAX = 500;
/** R28: the longest basis a proposed tier carries. */
export const RISK_PROPOSAL_BASIS_MAX = 500;

/* D-149: the one write that may set or change an action's governing laws is `actionLaws`, and it says so to `promote`
   under this Symbol. A Symbol: no JSON body a caller sends can carry one, so `op=promote` cannot claim to be the act. */
const LAWS_ACT = Symbol("d149-laws-act");
/* REC-214: the one write that may change an action's risk tier after intake, or append to its history, is
   `actionRiskTier`, and it says so to `promote` under this Symbol, for LAWS_ACT's reason. */
const RISK_TIER_ACT = Symbol("rec214-risk-tier-act");

/* The catalogue-backed refusals: each carries its code, check and translation (the Provides' "Terms"). */
const ROWS = Object.assign({}, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS, QUOTE_CHECKS,
  LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS, ACTION_CATALOGUE_CHECKS);
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string") return r;
  const row = ROWS[r.reason];
  if (!row) return r;
  return { ...r, code: r.code ?? r.reason, check: r.check ?? row.check, translation: r.translation ?? row.translation };
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });
const findingsOf = (list) => list.filter((x) => x.severity === "error")
  .map((x) => ({ check: x.check, detail: x.message, ...(x.code ? { code: x.code } : {}), ...(x.repairs ? { repairs: x.repairs } : {}) }));

/* R12, REC-24 (f): the clock, read from the DOCUMENT and never from a second store. The next PENDING deadline is the
   earliest date on a clock[] entry still marked pending. Pure over the frontmatter, so the projection writer, the
   read-time derivation and any later consumer compute one number by construction rather than by agreement. */
export function actionClockNext(fm) {
  const pending = (Array.isArray(fm?.clock) ? fm.clock : [])
    .filter((e) => e && typeof e === "object" && e.status === "pending"
                && typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .map((e) => e.date)
    .sort();
  return pending.length ? pending[0] : null;
}
/* Overdue is DERIVED from the document's own pending dates and an instant, never stored as the answer. A date is
   overdue when the day AFTER it has begun — a deadline of the 14th is met by anything on the 14th — so the comparison
   is against the UTC calendar day of `nowMs`, C-11.1's "silently past-due" convention. */
export function actionOverdue(fm, nowMs) {
  const next = actionClockNext(fm);
  if (!next) return false;
  const today = new Date(Number(nowMs)).toISOString().slice(0, 10);
  return next < today;
}

/** R12: the six facts retrieval projects for an action, pure; all null for another type or an unparsable document. */
export function actionFacts(documentText, nowMs) {
  const none = { kind: null, risk_tier: null, counterparty_state: null, resolution: null, clock_next: null, clock_overdue: null };
  let fm = null;
  try { fm = typeof documentText === "string" ? parseFrontmatter(documentText).data : null; } catch { fm = null; }
  if (!fm || typeof fm !== "object" || normalizeType(fm.object_type) !== "action") return none;
  const tier = riskTierState(fm.risk_tier);
  const cp = fm.counterparty && typeof fm.counterparty === "object" && !Array.isArray(fm.counterparty) ? fm.counterparty : {};
  return { kind: typeof fm.action_kind === "string" ? fm.action_kind : null,
           risk_tier: tier === 1 || tier === 2 || tier === 3 ? tier : null,
           counterparty_state: typeof cp.state === "string" ? cp.state : null,
           resolution: typeof fm.resolution === "string" ? fm.resolution : null,
           clock_next: actionClockNext(fm), clock_overdue: actionOverdue(fm, nowMs) };
}

const clampLimit = (v, dflt, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, max) : dflt; };

export class Actions {
  #deps;

  constructor({ storage, record, membership, promotion, host = null, retrieval = null, content = null,
                conformance = null, now = null, env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, retrieval, content, conformance };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  get retrieval() { return this.#deps.retrieval ||= retrievalOf(this.#deps.host); }
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  /* R8, R30: conformance is a layer-9 module built beside this one; it is reached only when provided. */
  get conformance() { return this.#deps.conformance || null; }

  migrate() {
    migrateActions(this.sql);
    /* R11: the leg's pinned capture, on a table created before it had the column. */
    const cols = [...this.sql.exec(`PRAGMA table_info(action_basis)`)].map((r) => r.name);
    if (!cols.includes("extent_capture")) this.sql.exec(`ALTER TABLE action_basis ADD COLUMN extent_capture TEXT`);
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* The instance clock: an explicit `now` (the caller's as-of), then the injected clock, then `env.BIO_NOW_MS`, then
     the wall. An ABSENT param is null or "" and falls through, never read as the epoch. */
  #nowMs(explicit) {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /* R10, R32: the active profiles' combined view (record-core R26), or null with none active or none combinable. */
  #view() {
    let ids = null;
    try { ids = this.record.getSetting("jurisdiction_profiles"); } catch { ids = null; }
    if (typeof ids === "string") { try { ids = JSON.parse(ids); } catch { ids = null; } }
    if (!Array.isArray(ids) || !ids.length) return null;
    const c = combine(ids);
    return c && c.ok ? c.view : null;
  }
  /** R10, R40: the kinds this instance accepts on a creation. */
  kinds() { return actionKinds(this.#view()); }

  /* The held version's `bundle_sha`, the compare-and-swap base (record-core R41). */
  #baseOf(id) { const h = this.record.head(id); return h ? h.bundleSha : null; }
  /* Every live file but bundle.md, carried byte for byte into a revision (record-core R13, R43). */
  #carried(id) {
    const out = [];
    for (const path of this.record.livePaths(id) || []) {
      if (path === "bundle.md") continue;
      const f = this.record.readFile(id, path);
      if (!f) continue;
      out.push(typeof f.text === "string" ? { path, text: f.text, bytes: new TextEncoder().encode(f.text).length, sha256: f.sha256 }
                                          : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes });
    }
    return out;
  }
  /* R16: the courtesy lock is given back by taking it again for no time (record-core offers no release of its own). */
  #releaseLease(id, who) { try { this.record.acquireLease(id, who, 0); } catch { /* a lease is a courtesy */ } }
  #heldFm(id) {
    const f = this.record.readFile(id, "bundle.md");
    if (!f || typeof f.text !== "string") return null;
    const fm = parseFrontmatter(f.text).data;
    return fm && typeof fm === "object" ? fm : null;
  }
  #visibleAction(id, viewer) {
    const gate = viewerPredicate(viewer);
    return this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                     id, ...gate.args);
  }

  /* K57's small helpers, copied from the legacy store (which keeps its own for its other writers). */
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
  static #setOrAddScalar(text, key, value) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return text;
    const end = lines.indexOf("---", 1);
    if (end === -1) return text;
    for (let i = 1; i < end; i++)
      if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
    return [...lines.slice(0, end), `${key}: ${value}`, ...lines.slice(end)].join("\n");
  }
  static #spliceReferences(text, additions) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = additions.map((a) =>
      `  - rel: ${a.rel}\n    target: ${a.target}\n    status: ${a.status}\n    note: "${a.note ?? ""}"`);
    let ref = -1;
    for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) { ref = i; break; }
    if (ref === -1) return [...lines.slice(0, end), "references:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[ref].slice("references:".length).trim();
    if (rest === "[]") return [...lines.slice(0, ref), "references:", ...block, ...lines.slice(ref + 1)].join("\n");
    if (rest !== "") return null;
    let last = ref;
    for (let i = ref + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) { last = i; continue; }
      break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }
  static #fmSafe(s) { return String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim(); }
  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  /* One Session Log appender for this module's writers. */
  static #appendSessionLog(text, entry) {
    const at = text.indexOf("## Session Log");
    if (at < 0) return text + "\n## Session Log\n\n" + entry;
    const nxt = text.indexOf("\n## ", at + 1);
    const cut = nxt === -1 ? text.length : nxt + 1;
    return text.slice(0, cut) + entry + "\n" + text.slice(cut);
  }
  /* A revision of `id` through promotion, carrying every other live file (R14, R16, R18, R24). */
  #revise(id, text, fm, b, when, who, marks = {}, state = null) {
    const bytes = new TextEncoder().encode(text);
    return this.promotion.promote({
      bundleId: id, base: this.#baseOf(id), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, ...marks,
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() },
              ...this.#carried(id)],
      meta: { object_type: fm.object_type ?? b.object_type, title: fm.title,
              current_state: state ?? fm.current_state ?? b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
  }

  /* ================================================================ the write: promotion's step (R1–R3, R7, R11, R33) */

  /** R2: the governing-laws block as one comparable value (`[]` and absent are one state). */
  static #lawsKey(fm) {
    if (!fm || typeof fm !== "object") return "unreadable";
    const g = fm.governing_laws;
    const l = Array.isArray(g) && g.length ? g : (g === undefined || g === null || (Array.isArray(g) && !g.length)) ? null : g;
    return JSON.stringify([l, fm.governing_laws_by ?? null, fm.governing_laws_at ?? null]);
  }

  /* D-149 / C-73.1 (R2) — AN ACTION'S GOVERNING LAWS ARE SET BY `op=actionlaws` AND BY NOTHING ELSE. Asked of every
     creation and revision of an action, replay included: any difference not carried under LAWS_ACT is refused. */
  #lawsFence(c, heldFm, nextFm, isAction) {
    const { pkg, bundleId, head } = c;
    const heldAction = head && normalizeType(head.type) === "action";
    if (pkg[LAWS_ACT] || !(heldAction || (!head && isAction))) return null;
    const was = head ? Actions.#lawsKey(heldFm) : JSON.stringify([null, null, null]);
    const now = Actions.#lawsKey(nextFm);
    /* DEC-49 REGION is-promote-governing-laws */
    if (was !== now)
      return refuse("GOVERNING_LAWS_REWRITTEN",
        `${head ? "this revision of" : "this creation of"} ${bundleId} sets or changes its governing laws without `
        + "op=actionlaws. The laws that govern a request are a member's authored statement, set by that act and "
        + "carried forward unchanged by every other write. Nothing was written.", { bundleId });
    /* END DEC-49 REGION is-promote-governing-laws */
    return null;
  }

  /* REC-189 / C-32.19 — ONLY A MEMBER'S AUTHORED ACT SETS OR REVISES A RISK TIER. Two callers ask it: the write's
   * tier fence (`act` false) and `actionRiskTier` (`act` true). At the write it asks a CHANGE, never a presence: a
   * machine may carry a member's tier forward unchanged, and may leave undetermined a tier no member ever set; it may
   * not set one, change one, or drop a member's 1, 2 or 3. At the act a machine is refused whatever it asks for. */
  #machineRiskTierRefusal({ who, nextTier, heldTier, cur, act }) {
    const heldSet = heldTier === 1 || heldTier === 2 || heldTier === 3;
    /* DEC-49 REGION is-machine-set-risk-tier */
    if ((!who || isMachineIdentity(who))
        && (act || (((nextTier === 1 || nextTier === 2 || nextTier === 3) || heldSet) && nextTier !== heldTier)))
      return refuse("MACHINE_CANNOT_SET_RISK_TIER",
        (act ? `op=actionrisktier is a member's authored revision of this action's risk tier (held: ${heldTier}).`
             : cur ? `this revision states risk_tier ${nextTier} where the version it replaces states ${heldTier}.`
                   : `this creation states risk_tier ${nextTier}.`)
        + " A risk tier is a member's assessment of the legal exposure of filing this action, and only a member's "
        + "authored act sets 1, 2 or 3. A machine credential may carry a member's tier forward unchanged, and may "
        + "leave the tier unstated (undetermined) only where no member has set one; it may not remove a member's "
        + "tier. Nothing was written.", { risk_tier: nextTier, held: cur ? heldTier : null });
    /* END DEC-49 REGION is-machine-set-risk-tier */
    return null;
  }

  /* REC-214 / C-90.1 (R1) — AFTER INTAKE, A TIER CHANGES THROUGH `op=actionrisktier` AND NOTHING ELSE. */
  #tierFence(c, heldFm, nextFm, who) {
    const { pkg, bundleId, head } = c;
    const nextTier = riskTierState(nextFm.risk_tier);
    const heldTier = riskTierState(heldFm ? heldFm.risk_tier : undefined);
    const machine = this.#machineRiskTierRefusal({ who, nextTier, heldTier, cur: !!head, act: false });
    if (machine) return machine;
    if (pkg[RISK_TIER_ACT]) return null;
    const histKey = (x) => JSON.stringify(x && typeof x === "object" && x.risk_tier_history !== undefined
                                          && x.risk_tier_history !== null ? x.risk_tier_history : []);
    const tierMoved = head ? nextTier !== heldTier : false;
    const histMoved = histKey(nextFm) !== (head ? histKey(heldFm) : "[]");
    /* DEC-49 REGION is-promote-risk-tier */
    if (tierMoved || histMoved)
      return refuse("RISK_TIER_REWRITTEN",
        (tierMoved ? `this revision of ${bundleId} states risk_tier ${nextTier} where the version it replaces states ${heldTier}`
                   : `this ${head ? "revision" : "creation"} of ${bundleId} ${head ? "changes" : "states"} its risk_tier_history`)
        + " without op=actionrisktier. After intake a risk tier is revised by that act alone — it records who, when "
        + "and why, and keeps every earlier tier readable. Nothing was written.",
        { bundleId, ...(head ? { held: heldTier } : {}), risk_tier: nextTier });
    /* END DEC-49 REGION is-promote-risk-tier */
    return null;
  }

  /* D-689 / C-32.20 (R5): a machine or unstamped author may not state `law` on a creation, nor change or remove it. */
  #machineRecordsLawRefusal(heldFm, nextFm, who, creation) {
    const lawOf = (fm) => (fm && typeof fm.law === "string" && fm.law.trim() ? fm.law.trim() : null);
    const was = creation ? null : lawOf(heldFm), now = lawOf(nextFm);
    /* DEC-49 REGION is-machine-state-records-law */
    if ((!who || isMachineIdentity(who)) && was !== now)
      return refuse("MACHINE_CANNOT_STATE_RECORDS_LAW",
        "which law governs a records request is a member's statement. A machine credential may write a "
        + "records_request stating no law, and may propose one (op=actionlawspropose); it may not state, change or "
        + "remove the law. Nothing was written.", { held: was, law: now });
    /* END DEC-49 REGION is-machine-state-records-law */
    return null;
  }

  /* R4–R7, R9, R10, R33: the C-2.10 arms enforced at the write (C-73.6, C-101), each by its own name, carrying the
     arm's own findings. A MISSING counterparty and a pending entry PAST its date land; the audit reports them (R37). */
  #writeArms(c, heldFm, nextFm, who) {
    const { head, writer, operation } = c;
    const creation = !head;
    /* DEC-49 REGION is-promote-records-law */
    const lf = []; recordsLawFindings(nextFm, lf);
    if (lf.length) return refuse("RECORDS_LAW_REFUSED", lf[0].message, { findings: findingsOf(lf) });
    /* END DEC-49 REGION is-promote-records-law */
    /* DEC-49 REGION is-promote-action-kind */
    const kindMoved = creation || !heldFm || heldFm.action_kind !== nextFm.action_kind;
    if (kindMoved) {
      const kinds = this.kinds();
      if (!kinds.includes(nextFm.action_kind))
        return refuse("ACTION_KIND_UNKNOWN", `action_kind '${String(nextFm.action_kind).slice(0, 40)}' is not a kind this `
          + `instance offers: one of ${kinds.join(", ")}. Nothing was written.`, { legal: kinds });
    }
    /* END DEC-49 REGION is-promote-action-kind */
    /* DEC-49 REGION is-promote-tier-vocabulary */
    if (riskTierState(nextFm.risk_tier) === null)
      return refuse("RISK_TIER_REFUSED", `risk_tier '${String(nextFm.risk_tier).slice(0, 20)}' is not 1, 2, 3 or `
        + "undetermined. Nothing was written.", { legal: Object.keys(RISK_TIERS) });
    /* END DEC-49 REGION is-promote-tier-vocabulary */
    /* DEC-49 REGION is-promote-counterparty */
    const cp = nextFm.counterparty;
    const cpMoved = creation || !heldFm || JSON.stringify(heldFm.counterparty ?? null) !== JSON.stringify(cp ?? null);
    if (cpMoved && cp !== undefined && cp !== null) {
      const cf = [];
      counterpartyFindings(nextFm, cf);
      const office = cp && typeof cp === "object" && !Array.isArray(cp) && cp.state === "named"
        && !(typeof cp.role === "string" && cp.role.trim() && typeof cp.body === "string" && cp.body.trim());
      if (cf.length || office)
        return refuse("COUNTERPARTY_REFUSED", cf.length ? cf[0].message
          : "a named counterparty is an office, stated by its official role and the body it belongs to (R9). Nothing was written.",
          { findings: findingsOf(cf.length ? cf : [{ check: "C-2.10", severity: "error", message: "counterparty names no office (role and body)" }]) });
    }
    /* END DEC-49 REGION is-promote-counterparty */
    /* DEC-49 REGION is-promote-action-resolution */
    if (nextFm.current_state === "resolved" && !RESOLUTIONS.includes(nextFm.resolution))
      return refuse("ACTION_RESOLUTION_REFUSED", `a resolved action names how it ended: one of ${RESOLUTIONS.join(", ")}. `
        + "Nothing was written.", { legal: RESOLUTIONS });
    /* END DEC-49 REGION is-promote-action-resolution */
    /* DEC-49 REGION is-promote-clock */
    const clock = nextFm.clock;
    if (clock !== undefined && clock !== null) {
      const bad = [];
      if (!Array.isArray(clock)) bad.push({ check: "C-11.1", detail: "clock is not a list of entries" });
      else clock.forEach((e, i) => {
        if (!e || typeof e !== "object" || !e.text || !e.description) bad.push({ check: "C-11.1", detail: `clock[${i}] lacks the {text, description} shape` });
        else {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) bad.push({ check: "C-11.1", detail: `clock[${i}].date '${e.date}' is not YYYY-MM-DD` });
          if (typeof e.basis !== "string" || !e.basis.trim()) bad.push({ check: "C-11.1", detail: `clock[${i}] has no basis (the statute, order, or commitment the date derives from)` });
          if (!["pending", "met", "overdue", "waived"].includes(e.status)) bad.push({ check: "C-11.1", detail: `clock[${i}].status '${e.status}' is not one of: pending, met, overdue, waived` });
        }
      });
      if (bad.length) return refuse("CLOCK_REFUSED", bad[0].detail, { findings: bad });
    }
    /* END DEC-49 REGION is-promote-clock */
    /* DEC-49 REGION is-promote-clock-mechanical */
    if (!creation && (!who || isMachineIdentity(who) || writer === "mechanical")) {
      const today = new Date(this.#nowMs(null)).toISOString().slice(0, 10);
      const heldClock = heldFm && Array.isArray(heldFm.clock) ? heldFm.clock : [];
      const nextClock = Array.isArray(clock) ? clock : [];
      const recheck = writer === "mechanical" && operation === "deadline-recheck";
      const moved = clockMovesNotMechanical(heldClock, nextClock, today);
      const reshaped = heldClock.length !== nextClock.length || heldClock.some((e, i) => {
        const n = nextClock[i] || {};
        return JSON.stringify({ ...e, status: null }) !== JSON.stringify({ ...n, status: null });
      });
      if (moved.length || reshaped || (!recheck && JSON.stringify(heldClock) !== JSON.stringify(nextClock)))
        return refuse("CLOCK_STATUS_NOT_MECHANICAL", "a machine write may move a pending clock entry whose date has "
          + "passed to overdue, and nothing else: it never adds, removes or re-dates an entry or sets another status. "
          + "Nothing was written.", { moves: moved });
    }
    /* END DEC-49 REGION is-promote-clock-mechanical */
    return null;
  }

  /** R1–R2, R5–R8, R33: this module's check, run inside every promotion before the write (promotion R39). */
  check(c) {
    const { pkg, meta, author, bundleId, files, head } = c;
    const md = (files || []).find((f) => f && f.path === "bundle.md");
    const nextFm = c.docFm && typeof c.docFm === "object" ? c.docFm
      : (md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null);
    const heldFm = head ? this.#heldFm(bundleId) : null;
    const isAction = normalizeType(meta && meta.object_type) === "action"
      || (nextFm && typeof nextFm === "object" && normalizeType(nextFm.object_type) === "action");
    const laws = this.#lawsFence(c, heldFm, nextFm, isAction);
    if (laws) return laws;
    const who = String(author ?? "").trim();
    /* D-505: both spellings of "this is an action", and the union can only add refusals. Replay is exempt from the
       shape arms: the record's own history must be holdable verbatim. */
    if (isAction && nextFm && typeof nextFm === "object" && !pkg.replay) {
      const tier = this.#tierFence(c, heldFm, nextFm, who);
      if (tier) return tier;
      const law = this.#machineRecordsLawRefusal(heldFm, nextFm, who, !head);
      if (law) return law;
      const arms = this.#writeArms(c, heldFm, nextFm, who);
      if (arms) return arms;
      /* REC-24: the legs (ACTION_BASIS_REFUSED), the ledger (CORRESPONDENCE_REFUSED) and what only the record can
         resolve — a leg or a hash naming nothing it holds. */
      const af = []; actionBasisFindings(nextFm, af);
      if (af.some((x) => x.severity === "error")) return refuse("ACTION_BASIS_REFUSED", undefined, { findings: findingsOf(af) });
      const cf = []; correspondenceFindings(nextFm, cf);
      if (cf.some((x) => x.severity === "error")) return refuse("CORRESPONDENCE_REFUSED", undefined, { findings: findingsOf(cf) });
      for (const leg of (Array.isArray(nextFm.action_basis) ? nextFm.action_basis : [])) {
        if (!leg || typeof leg.target !== "string") continue;
        if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, leg.target))
          return refuse("ACTION_BASIS_REFUSED", undefined, { target: leg.target, findings: [{ check: "C-2.10",
            detail: `action_basis target '${leg.target}' does not resolve in this store: an action that names why it `
                  + "exists names something that exists, or it points a reader at nothing while claiming a reason" }] });
      }
      for (const e of (Array.isArray(nextFm.correspondence) ? nextFm.correspondence : [])) {
        if (!e || typeof e.artifact_sha !== "string" || !e.artifact_sha.trim()) continue;
        const sha = e.artifact_sha.trim().replace(/^sha256:/, "").toLowerCase();
        if (!this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, sha))
          return refuse("CORRESPONDENCE_REFUSED", undefined, { artifact_sha: sha, findings: [{ check: "C-2.10",
            detail: `correspondence artifact_sha '${sha.slice(0, 16)}...' does not resolve in the register: an entry `
                  + "claiming captured bytes names bytes this store holds, or it is testimony and says so with an "
                  + "account and an author (DEC-13)",
            repairs: ["capture the artifact first (op=capture), then record its sha", "or record a named account instead"] }] });
      }
      const breach = this.#breachRefusal(nextFm, pkg.viewer ?? c.viewer ?? null);
      if (breach) return breach;
    }
    /* REC-24 (g) / C-6.1: a responds_to edge's shape from the catalogue, its resolution from the record. */
    if (nextFm && typeof nextFm === "object" && !pkg.replay) {
      const rf = []; respondsToEdgeFindings(nextFm, rf);
      if (rf.some((x) => x.severity === "error")) return refuse("RESPONDS_TO_REFUSED", undefined, { findings: findingsOf(rf) });
      for (const r of (Array.isArray(nextFm.references) ? nextFm.references : [])) {
        if (!r || typeof r !== "object" || r.rel !== "responds_to") continue;
        if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, r.target))
          return refuse("RESPONDS_TO_REFUSED", undefined, { target: r.target, findings: [{ check: "C-6.1",
            detail: `responds_to target '${r.target}' does not resolve in this store: this document claims to be `
                  + "what came back from an ask that is not here" }] });
      }
    }
    return null;
  }

  /* R8: an action recorded for a breach (`breach: true`) rests on a live conformance determination the author may see.
     With no conformance provider the determination cannot be read, and the write is refused, never passed. */
  #breachRefusal(fm, viewer) {
    if (fm.breach !== true) return null;
    const legs = (Array.isArray(fm.action_basis) ? fm.action_basis : [])
      .filter((l) => l && typeof l === "object" && l.kind === "rests_on" && typeof l.target === "string");
    const conf = this.conformance;
    if (!conf || typeof conf.determinationRead !== "function")
      return { ok: false, reason: "ACTION_NO_DETERMINATION", cause: "CONFORMANCE_UNAVAILABLE",
               detail: "an action recorded for a breach rests on a conformance determination, and no determination "
                     + "can be read on this instance yet, so none could be found. Nothing was written." };
    let superseded = null;
    for (const l of legs) {
      let d = null;
      try { d = conf.determinationRead({ id: l.target, viewer }); } catch { d = null; }
      if (!d || d.ok === false) continue;
      if (d.live === false || d.superseded_by) { superseded = l.target; continue; }
      return null;
    }
    if (superseded)
      return { ok: false, reason: "DETERMINATION_SUPERSEDED", determination: superseded,
               detail: `the determination ${superseded} this action rests on has been superseded; rest it on the live one.` };
    return { ok: false, reason: "ACTION_NO_DETERMINATION",
             detail: "an action recorded for a breach rests on a live conformance determination you may see, as a "
                   + "rests_on leg. None of its legs names one. Nothing was written." };
  }

  /** R3, R11: this module's projection, in the promotion's transaction after the write: legs, ledger and quotes
   *  replaced whole from the document. A malformed replayed entry is skipped, never half-written. */
  project(c) {
    const { bundleId, promotedType } = c;
    const fm = c.docFm;
    /* R11: a leg's pinned capture is kept as it was first stamped; a leg new in this version is stamped now. */
    const held = new Map(this.#rows(`SELECT target_id, kind, extent_capture FROM action_basis WHERE bundle_id=?`, bundleId)
      .map((r) => [`${r.target_id}\u0000${r.kind}`, r.extent_capture]));
    this.sql.exec(`DELETE FROM action_basis WHERE bundle_id=?`, bundleId);
    this.sql.exec(`DELETE FROM correspondence WHERE bundle_id=?`, bundleId);
    this.sql.exec(`DELETE FROM action_quotes WHERE bundle_id=?`, bundleId);
    if (promotedType !== "action" || !fm || typeof fm !== "object") return null;
    const alegs = Array.isArray(fm.action_basis) ? fm.action_basis : [];
    for (let i = 0; i < alegs.length; i++) {
      const leg = alegs[i];
      if (!leg || typeof leg.target !== "string") continue;
      const type = normalizeType(OBJECT_TYPES[leg.target.split("-")[0]]) ?? "";
      const key = `${leg.target}\u0000${typeof leg.kind === "string" ? leg.kind : ""}`;
      let pinned = typeof leg.extent_capture === "string" && /^[0-9a-f]{64}$/.test(leg.extent_capture) ? leg.extent_capture : null;
      if (!pinned && held.has(key)) pinned = held.get(key) ?? null;
      else if (!pinned && !held.has(key) && type === "information") {
        try { pinned = this.content.captureFor(leg.target) || null; } catch { pinned = null; }
      }
      this.sql.exec(`INSERT INTO action_basis (bundle_id,ord,target_id,target_type,kind,note,at,extent_capture) VALUES (?,?,?,?,?,?,?,?)`,
        bundleId, i, leg.target, type, typeof leg.kind === "string" ? leg.kind : "",
        typeof leg.note === "string" ? leg.note : null, leg.date != null ? String(leg.date) : null, pinned);
    }
    const entries = Array.isArray(fm.correspondence) ? fm.correspondence : [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e || typeof e !== "object") continue;
      const sha = typeof e.artifact_sha === "string" && e.artifact_sha.trim()
        ? e.artifact_sha.trim().replace(/^sha256:/, "").toLowerCase() : null;
      const reg = sha ? this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, sha) : null;
      this.sql.exec(
        `INSERT INTO correspondence (bundle_id,ord,direction,at,medium,party,artifact_bundle_id,artifact_sha,account,author,recorded_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        bundleId, i, typeof e.direction === "string" ? e.direction : "", e.at != null ? String(e.at) : "",
        typeof e.medium === "string" ? e.medium : null, typeof e.party === "string" ? e.party : null,
        reg ? reg.bundle_id : (typeof e.artifact_bundle_id === "string" ? e.artifact_bundle_id : null), sha,
        typeof e.account === "string" && e.account.trim() ? e.account : null,
        typeof e.author === "string" && e.author.trim() ? e.author : null,
        typeof e.recorded_at === "string" ? e.recorded_at : null);
    }
    const cpName = counterpartyName(fm.counterparty);
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!isQuoteEntry(e) || quoteFindings(entries, i).length) continue;
      this.sql.exec(
        `INSERT INTO action_quotes (bundle_id,ord,amount,value,currency,basis,answers_ord,revises_ord,counterparty,at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        bundleId, i, String(e.quote_amount).trim(), quoteValue(e.quote_amount), String(e.quote_currency).trim(),
        e.quote_basis !== undefined && e.quote_basis !== null && String(e.quote_basis).trim() ? String(e.quote_basis) : null,
        Number(String(e.quote_answers).trim()),
        e.quote_revises !== undefined && e.quote_revises !== null && String(e.quote_revises).trim() !== ""
          ? Number(String(e.quote_revises).trim()) : null,
        cpName, e.at != null ? String(e.at) : "");
    }
    return null;
  }

  /** R37: the audit's action arm over one bundle image (record-core R59): C-2.10's arms and C-11.1 over an action,
   *  and C-6.1's `responds_to` arm over any document. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    const md = files ? files.get("bundle.md") : null;
    const text = typeof md === "string" ? md : md instanceof Uint8Array ? new TextDecoder().decode(md) : null;
    if (text === null) return [];
    let fm = null;
    try { fm = parseFrontmatter(text).data; } catch { fm = null; }
    if (!fm || typeof fm !== "object") return [];
    const findings = [];
    respondsToEdgeFindings(fm, findings);
    if (fm.object_type === "action")
      checkActionExtension({ fm, nowMs: this.#nowMs(null), actionKinds: this.kinds() }, findings);
    return findings;
  }

  /* REC-24 (c): MOVING AN ACTION THROUGH ITS OWN STATE MACHINE — the first op
   * in this plane whose subject is an action at all.
   *
   * WHY IT EXISTS. `STATES.action` has carried five states and seven edges since
   * the catalog was written, and NOTHING wrote them: SB-OUTPUT §4 measured the
   * whole diagram as dashed, with the creation of the bundle the only node that
   * ran. An act the table permits and no caller can perform is the state machine
   * lying, which is exactly what REC-31 said about `deferred -> open`.
   *
   * THE EDGE TABLE IS THE CATALOG'S AND THERE IS NO SECOND COPY. This is the
   * NAMED hazard of this item, not a general principle: `op=dispose` held its own
   * literal copy of the disposition set until REC-10 rewired it, and the whole
   * cost of that copy was that the publication and the refusal could disagree
   * about what was legal. So legality here comes from `vocabFor(STATES, …)` over
   * the DECLARED object_type — the MAP RULE, sixth consulting site — and this
   * method contains no state list of its own. Grep it: NO string from the action
   * vocabulary appears in this method at all.
   *
   * CORRECTED 2026-08-05 (REC-39), and the old sentence is worth keeping as the
   * receipt: it read "the only strings from the action vocabulary in this file
   * below are the four RESOLUTIONS, which are C-2.10's and are imported nowhere
   * because they are checked by the catalog itself a moment later". Every clause
   * was true and the conclusion was wrong. Being re-checked downstream makes a
   * copy HARMLESS at the write; it does not make it one array. The refusal this
   * method returns carries `legal:` — the option set a surface renders — so the
   * copy was load-bearing on the way OUT even though it was redundant on the way
   * in, and a word changed in the catalog would have left this act offering the
   * old one. RESOLUTIONS is imported now.
   *
   * THE REASON IS REQUIRED AND NEVER PREFILLED, op=reopen's rule and for its
   * reason: an action moving is the group deciding to send something outside the
   * system, or deciding it is finished, and a move with no account of why cannot
   * be checked by anyone including its author. Nothing is derived, defaulted or
   * proposed.
   *
   * A NAMED MEMBER MOVES IT. The author stamp arrives from the session and a
   * machine credential's is `token:<class>`, refused BY SHAPE. This follows
   * MACHINE_CANNOT_CONCLUDE / _RELEASE / _REOPEN and it is the same judgement:
   * an action is the one construct that reaches OUTSIDE this system and touches
   * people who never agreed to be in it, so a scheduler must not be able to
   * advance one. A machine may surface, gather and prepare (D-78, DEC-24); it
   * may not decide that the group is now asking somebody for something.
   *
   * WHAT IT DELIBERATELY DOES NOT DO: it does not touch the clock. A clock entry
   * that has fallen past due is a REAL finding about the document (C-11.1) and
   * this op neither suppresses it nor quietly marks it met — that would be the
   * machine authoring the answer to the question the deadline asked. Overdue is
   * DERIVED on read (see #actionDerived) and what to do about it is the member's. */
  actionMove({ target, to, reason = "", resolution = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-move-action — REC-64/C-32.3. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_MOVE_ACTION",
               detail: "moving an action is a named member's decision to reach outside this system, or to "
                     + "declare that reaching out is finished. A machine credential may prepare an action and "
                     + "may never advance one. Sign in as a member." };
    /* END DEC-49 REGION is-machine-move-action */
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "an action moves for a stated reason, authored by the member moving it and never "
                     + "prefilled. A state change with no account of why cannot be checked by anyone." };
    if (why.length > NOTE_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `reason is at most ${NOTE_MAX} characters and cannot contain a quote, a `
                     + `backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action moves at a time: pass target=<action id>" };

    /* REC-25 / D-15: the same fail-closed viewer gate every read takes; an
       invisible action answers exactly as an absent one. */
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "only an action has an action's state machine." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so its state cannot be moved" };
    let text = liveMd.content;
    const fm = parseFrontmatter(text).data || {};

    /* THE MAP RULE. The declared spelling first, so a document is judged by the
       contract it was authored under and not by the type its id prefix implies. */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legal = spec?.legal || [];
    if (!legal.includes(to))
      return { ok: false, reason: "BAD_TARGET_STATE", to, target, legal,
               detail: `an action's state is one of ${legal.join(", ")}` };
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes(to))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to, target, from: b.current_state,
               object_type: fm.object_type ?? b.object_type, legal_from: legalFrom,
               detail: "this is not a legal move in the catalog's state table for this document's own "
                     + "vocabulary. The table is the catalog's and this op holds no copy of it." };

    /* C-2.10's entry requirement for `resolved`, checked BEFORE anything moves so
       this op never mints a bundle the catalog immediately rejects (conclude's
       fourth property). The four words are the catalog's; they are compared
       here and enforced again by C-2.10 on the document that lands.
       REC-39: they are now IMPORTED rather than transcribed. The line that
       stood here was a local literal copy, and the comment above it said the
       words were the catalog's while the array was this file's — which is the
       DISPOSITIONS arrangement REC-11 unwound, and it survived here because
       nothing published the set, so nothing could pin the two identical. */
    const res = String(resolution ?? "").trim();
    /* DEC-49 REGION is-move-resolution — REC-64/C-33.3-4. The two conditions on
       HOW an action ended, which are this pair's whole subject. */
    if (to === "resolved" && !RESOLUTIONS.includes(res))
      return { ok: false, reason: "NO_RESOLUTION", target, legal: RESOLUTIONS,
               detail: "an action that is resolved says HOW it resolved: one of "
                     + `${RESOLUTIONS.join(", ")}. C-2.10 requires it in the resolved state, so a move `
                     + "without one would produce a bundle the catalog rejects." };
    if (to !== "resolved" && res)
      return { ok: false, reason: "RESOLUTION_WITHOUT_RESOLVING", target, to,
               detail: "a resolution describes how an action ENDED; supplying one on a move to "
                     + `${to} would record an outcome the action has not reached.` };
    /* END DEC-49 REGION is-move-resolution */

    const when = stampInstant("second", this.#nowMs(null));
    const withHistory = Actions.#appendStateHistory(text, {
      timestamp: when, from_state: b.current_state, to_state: to, blurb: why, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a move recording "
                     + "no transition would leave prior_state pointing at a history the document does not "
                     + "carry (C-4.2)" };
    text = withHistory;
    text = Actions.#setOrAddScalar(text, "prior_state", b.current_state);   /* R14: set, or added where absent */
    text = Actions.#setScalar(text, "current_state", to);
    /* setOrAdd, not set: an action authored before this op existed carries no
       `resolution` key at all, and #setScalar alone would move the state and
       leave the requirement unmet — the bundle the catalog then rejects (the
       REC-13 lesson, verbatim). */
    if (to === "resolved") text = Actions.#setOrAddScalar(text, "resolution", res);
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    const entry = `### Session ${when} | Action ${b.current_state} to ${to} | ${who}\n`
                + `Trigger: op=actionmove on ${target}\n`
                + `Changes: state ${b.current_state} to ${to}.`
                + `${to === "resolved" ? ` Resolution: ${res}.` : ""}\n`
                + `Reason: ${why}\n`;
    text = Actions.#appendSessionLog(text, entry);

    const carried = this.#carried(target);

    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: to, prior_state: b.current_state,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, from: b.current_state, to, reason: why,
             ...(to === "resolved" ? { resolution: res } : {}),
             author: who, at: when, weight: "single" };
  }

  /* REC-24 (d): APPENDING ONE ENTRY TO AN ACTION'S CORRESPONDENCE LEDGER.
   *
   * APPEND ONLY, AND THAT IS THE WHOLE DESIGN. This op adds an entry and can
   * never rewrite one: a correspondence entry that changed is ITSELF A FACT, so
   * a correction is a new dated entry saying so and the earlier statement stays
   * where it was. #spliceCorrespondence appends after the block's last line and
   * touches nothing else, exactly as #spliceBasis does for legs.
   *
   * LEASE THEN PROMOTE. The courtesy lock is taken under the acting member
   * before the document is rewritten, so two members recording what came back at
   * the same moment do not silently lose one entry — and promote's CAS on `base`
   * is still the integrity mechanism, because a lease is a courtesy and not a
   * guarantee (D-61's own wording).
   *
   * CAPTURE OR TESTIFY, REFUSED HERE AND AT THE GATE. The entry carries the
   * bytes we hashed OR a named member's account, never neither and never both.
   * It is refused at this op so the member is told before anything is written,
   * and again by C-2.10 over the document that lands, and again at promote where
   * the hash is resolved against the register — three gates, one rule, in the
   * one construct where "we have it in writing" and "somebody remembers it" are
   * different kinds of evidence and must not be able to be confused.
   *
   * AND THE NON-RESPONSE IS A FIRST-CLASS ENTRY (DEC-13). A refusal to reply is
   * a dated first-party fact about the body and is frequently the more useful
   * one, so it is RECORDED with the date it was due rather than left as an
   * absence a reader has to infer. It takes the testimony arm by construction:
   * nothing arrived, so there are no bytes to hash.
   *
   * THE PRODUCER OF `responds_to` IS HERE. A RECEIVED entry whose artifact
   * resolves to a bundle in this store writes a responds_to edge on THAT
   * document, pointing back at this action — the direction SB-OUTPUT's A10 row
   * specifies, and the reason the relation is no longer a string the vocabulary
   * merely tolerates. Idempotent: an edge already there is not written twice.
   *
   * D-148: A RECEIVED ENTRY MAY CARRY A QUOTE (`quote_amount`, `quote_currency`,
   * `quote_basis`, `quote_answers`, `quote_revises`). The rule is the catalog's
   * `quoteFindings`, run here over the ledger as it WOULD stand, so a member is
   * refused by the C-72 name before anything is written, and the same function
   * reports C-2.10 over the document that lands. An entry with no quote
   * parameter writes exactly the bytes it wrote before D-148.
   *
   * D-147: AND IT MAY CARRY ITS PLACE IN THE RECORDS-REQUEST LIFECYCLE (`stage`,
   * `follows`, `outcome`, `exemptions`, `due_by`, `due_cite`) — the catalog's
   * `lifecycleFindings`, run here the same way. A due date's citation is judged
   * HERE against the action's governing laws as they stand when it is stated
   * (DUE_CITE_NOT_GOVERNING), and only here: see the catalog's comment for why
   * the document-level rule does not. No due date is ever computed. An entry
   * with no lifecycle parameter writes exactly the bytes it wrote before. */
  actionCorrespond({ target, direction = "", at = "", medium = "", party = "",
                     artifactSha = "", account = "", quoteAmount = "", quoteCurrency = "",
                     quoteBasis = "", quoteAnswers = "", quoteRevises = "",
                     stage = "", follows = "", outcome = "", exemptions = "", dueBy = "", dueCite = "",
                     viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-correspond — REC-64/C-32.4. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_CORRESPOND",
               detail: "a correspondence entry is a named member's statement that this exchange happened — "
                     + "and on the testimony arm it IS the evidence. A machine credential may capture bytes "
                     + "and may not testify to an exchange. Sign in as a member." };
    /* END DEC-49 REGION is-machine-correspond */
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one entry at a time: pass target=<action id>" };
    /* DEC-49 REGION is-correspond-entry — REC-64/C-33.5-8. The four conditions
       on the ENTRY's own shape. The target guard above and the hash checks below
       refuse with codes minted at several other sites, so they are outside this
       span: a `where` claims ONE span, and a code enforced in eight places
       cannot honestly name one of them as the site. */
    if (!CORRESPONDENCE_DIRECTIONS.includes(direction))
      return { ok: false, reason: "BAD_DIRECTION", legal: CORRESPONDENCE_DIRECTIONS, direction,
               detail: `direction is one of ${CORRESPONDENCE_DIRECTIONS.join(", ")}. A reply that never came `
                     + "is recorded as no_response with the date it was due, not omitted (DEC-13)." };
    const day = String(at ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
      return { ok: false, reason: "BAD_DATE", at: day,
               detail: "every entry in this ledger is dated YYYY-MM-DD, including a non-response, which is "
                     + "dated by when the reply was due" };
    const sha = String(artifactSha ?? "").trim().replace(/^sha256:/, "").toLowerCase();
    const acct = String(account ?? "").trim();
    if (sha && acct)
      return { ok: false, reason: "CAPTURE_AND_TESTIMONY", target,
               detail: "an entry carries the captured bytes OR a named account, never both: what comes back "
                     + "is CAPTURED, not summarised (DEC-13). A paraphrase beside the bytes is what a reader "
                     + "would quote instead of the thing the group can defend." };
    if (!sha && !acct)
      return { ok: false, reason: "NEITHER_CAPTURE_NOR_TESTIMONY", target,
               detail: "an entry carries either an artifact_sha that resolves in the register or an account "
                     + "with an author. Neither is an entry that asserts an exchange and offers no way to "
                     + "check that it happened." };
    /* END DEC-49 REGION is-correspond-entry */
    if (sha && !/^[0-9a-f]{64}$/.test(sha))
      return { ok: false, reason: "BAD_SHA", detail: "artifact_sha is a sha256 hash (64 hex characters)" };
    if (sha && direction === "no_response")
      return { ok: false, reason: "NO_RESPONSE_HAS_NO_BYTES", target,
               detail: "nothing arrived, so there are no bytes to hash. A non-response is recorded as a named "
                     + "account with its date (DEC-13)." };
    for (const [name, v] of [["account", acct], ["medium", String(medium ?? "")], ["party", String(party ?? "")]])
      if (v.length > NOTE_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${NOTE_MAX} characters and cannot contain a quote, `
                       + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    /* D-148: the quote, as the entry will carry it. Only keys a caller SENT are
       written, so an entry with no quote parameter is byte-identical to before. */
    const quote = {};
    for (const [k, v] of [["quote_amount", quoteAmount], ["quote_currency", quoteCurrency],
                          ["quote_basis", quoteBasis], ["quote_answers", quoteAnswers],
                          ["quote_revises", quoteRevises]]) {
      const t = String(v ?? "").trim();
      if (t) quote[k] = t;
    }
    /* D-147: the lifecycle keys, likewise only those a caller SENT. */
    const life = {};
    for (const [k, v] of [["stage", stage], ["follows", follows], ["outcome", outcome],
                          ["exemptions", exemptions], ["due_by", dueBy], ["due_cite", dueCite]]) {
      const t = String(v ?? "").trim();
      if (t) life[k] = t;
    }
    const refusal = (code, detail, extra) => {
      const row = QUOTE_CHECKS[code] || LIFECYCLE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               target, detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-lifecycle-writable — D-147/C-94.11. The two prose values
       a stage carries are written quoted into a grammar with no escapes; the four
       tokens are bare, so each must be the token its grammar names before any
       byte is spliced (the grammar below judges which token). */
    for (const [k, max] of [["exemptions", NOTE_MAX], ["due_cite", CITATION_MAX]])
      if (life[k] !== undefined && (life[k].length > max || /["\\\r\n]/.test(life[k])))
        return refusal("LIFECYCLE_TEXT_UNWRITABLE",
          `${k} is at most ${max} characters and cannot contain a quote, a backslash, or a newline: the `
          + `restricted frontmatter grammar has no escapes`, { field: k });
    /* END DEC-49 REGION is-lifecycle-writable */
    for (const k of ["stage", "follows", "outcome", "due_by"])
      if (life[k] !== undefined && !/^[a-z0-9_-]{1,40}$/.test(life[k])) {
        /* DEC-49 REGION is-lifecycle-token — D-688/C-94.12 (R22): the token case, under its own name. */
        return refusal("LIFECYCLE_TOKEN_MALFORMED",
          `${k} is a single token of 1 to 40 lower-case letters, digits, underscores or hyphens`, { field: k });
        /* END DEC-49 REGION is-lifecycle-token */
      }
    /* DEC-49 REGION is-quote-writable — D-148/C-72.6. The two prose values a
       quote carries are written quoted into a grammar with no escapes. */
    for (const k of ["quote_currency", "quote_basis"])
      if (quote[k] !== undefined && (quote[k].length > NOTE_MAX || /["\\\r\n]/.test(quote[k])))
        return refusal("QUOTE_TEXT_UNWRITABLE",
          `${k} is at most ${NOTE_MAX} characters and cannot contain a quote, a backslash, or a `
          + `newline: the restricted frontmatter grammar has no escapes`, { field: k });
    /* END DEC-49 REGION is-quote-writable */

    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "a correspondence ledger belongs to an action: it records what that ask sent and what "
                     + "came back." };
    /* Resolved here as well as at promote, so the member is told which half of
       the capture-or-testify choice failed rather than being handed a write
       refusal after the lease was taken. */
    /* DEC-49 REGION is-correspond-artifact — REC-64/C-33.9. */
    if (sha && !this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, sha))
      return { ok: false, reason: "UNREGISTERED_ARTIFACT", target, artifact_sha: sha,
               detail: "this hash names no capture in this store. Capture the artifact first (op=capture), or "
                     + "record a named account instead — those are the two honest ways to hold an exchange." };
    /* END DEC-49 REGION is-correspond-artifact */

    /* THE COURTESY LOCK, under the acting member. */
    const lease = this.record.acquireLease(target, who, CORRESPOND_LEASE_MS);
    if (!lease.ok)
      return { ok: false, reason: "LEASE_HELD", target, heldBy: lease.heldBy, until: lease.until,
               detail: "another member is writing to this action right now. The ledger is append-only, so a "
                     + "second writer would not lose an entry — but it would interleave two accounts of the "
                     + "same exchange with no way to tell which was written first." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null) {
      this.#releaseLease(target, who);
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so nothing can be appended to it" };
    }
    const fm = parseFrontmatter(liveMd.content).data || {};
    const when = stampInstant("second", this.#nowMs(null));
    const ledgerNow = Array.isArray(fm.correspondence) ? fm.correspondence : [];
    const ord = ledgerNow.length;
    const entryFm = {
      direction, at: day,
      ...(String(medium ?? "").trim() ? { medium: String(medium).trim() } : {}),
      ...(String(party ?? "").trim() ? { party: String(party).trim() } : {}),
      ...(sha ? { artifact_sha: sha } : {}),
      ...(acct ? { account: acct } : {}),
      ...quote,
      ...life,
      /* SERVER-STAMPED. Present on both arms — who put this entry on the record
         is part of the record even when the record is bytes. */
      author: who,
      recorded_at: when,
    };
    /* D-148: the catalog's ONE quote rule, over the ledger as it would stand with
       this entry appended. The lease is given back on a refusal: nothing was
       written and a refused write holds nothing worth protecting. */
    const qf = quoteFindings([...ledgerNow, entryFm], ord);
    if (qf.length) {
      this.#releaseLease(target, who);
      const has = (c) => qf.find((x) => x.code === c);
      const all = { findings: qf };
      /* DEC-49 REGION is-quote-grammar — D-148/C-72.1-5. The first finding, by the
         name the catalog reports over the document too. */
      if (has("QUOTE_NOT_ON_RECEIVED"))
        return refusal("QUOTE_NOT_ON_RECEIVED", has("QUOTE_NOT_ON_RECEIVED").message, all);
      if (has("QUOTE_AMOUNT_NOT_A_NUMBER"))
        return refusal("QUOTE_AMOUNT_NOT_A_NUMBER", has("QUOTE_AMOUNT_NOT_A_NUMBER").message, all);
      if (has("QUOTE_NO_CURRENCY"))
        return refusal("QUOTE_NO_CURRENCY", has("QUOTE_NO_CURRENCY").message, all);
      if (has("QUOTE_ANSWERS_NO_SENT"))
        return refusal("QUOTE_ANSWERS_NO_SENT", has("QUOTE_ANSWERS_NO_SENT").message, all);
      if (has("QUOTE_REVISES_NO_QUOTE"))
        return refusal("QUOTE_REVISES_NO_QUOTE", has("QUOTE_REVISES_NO_QUOTE").message, all);
      /* END DEC-49 REGION is-quote-grammar */
    }
    /* D-147: the catalog's ONE lifecycle rule, over the ledger as it would stand. */
    const lf = lifecycleFindings([...ledgerNow, entryFm], ord);
    if (lf.length) {
      this.#releaseLease(target, who);
      const has = (c) => lf.find((x) => x.code === c);
      const all = { findings: lf };
      /* DEC-49 REGION is-lifecycle-grammar — D-147/C-94.1-9. The first finding, by
         the name the catalog reports over the document too. */
      if (has("STAGE_NOT_OF_DIRECTION"))
        return refusal("STAGE_NOT_OF_DIRECTION", has("STAGE_NOT_OF_DIRECTION").message, all);
      if (has("FOLLOWS_NO_ENTRY"))
        return refusal("FOLLOWS_NO_ENTRY", has("FOLLOWS_NO_ENTRY").message, all);
      if (has("APPEAL_NAMES_NO_DECISION"))
        return refusal("APPEAL_NAMES_NO_DECISION", has("APPEAL_NAMES_NO_DECISION").message, all);
      if (has("OUTCOME_NOT_ON_RECEIVED"))
        return refusal("OUTCOME_NOT_ON_RECEIVED", has("OUTCOME_NOT_ON_RECEIVED").message, all);
      if (has("OUTCOME_NOT_IN_VOCABULARY"))
        return refusal("OUTCOME_NOT_IN_VOCABULARY", has("OUTCOME_NOT_IN_VOCABULARY").message, all);
      if (has("DECISION_WITHOUT_OUTCOME"))
        return refusal("DECISION_WITHOUT_OUTCOME", has("DECISION_WITHOUT_OUTCOME").message, all);
      if (has("FEE_ESTIMATE_WITHOUT_QUOTE"))
        return refusal("FEE_ESTIMATE_WITHOUT_QUOTE", has("FEE_ESTIMATE_WITHOUT_QUOTE").message, all);
      if (has("DUE_HALF_STATED"))
        return refusal("DUE_HALF_STATED", has("DUE_HALF_STATED").message, all);
      if (has("DUE_NOT_A_DATE"))
        return refusal("DUE_NOT_A_DATE", has("DUE_NOT_A_DATE").message, all);
      /* END DEC-49 REGION is-lifecycle-grammar */
    }
    /* D-147: a stated due date names ONE OF THE ACTION'S citations (D-149), read
       from the action's own bytes as they stand now. With no list stated, no
       citation can be one of it, so the date cannot be stated yet — the refusal
       says to state the laws first. Nothing is inferred from the kind. */
    const cited = life.due_cite;
    const listed = governingLawsOf(fm).laws.map((l) => l.citation);
    const onList = cited ? listed.includes(cited) : true;
    if (!onList) {
      this.#releaseLease(target, who);
      /* DEC-49 REGION is-lifecycle-due-cite — D-147/C-94.10. */
      return refusal("DUE_CITE_NOT_GOVERNING",
        `due_cite '${cited.slice(0, 60)}' is not one of this action's stated governing laws`,
        { governing_laws: listed });
      /* END DEC-49 REGION is-lifecycle-due-cite */
    }
    let text = Actions.#spliceCorrespondence(liveMd.content, entryFm);
    if (!text) this.#releaseLease(target, who);
    if (!text)
      return { ok: false, reason: "UNSPLICEABLE_CORRESPONDENCE", target,
               detail: "this action's correspondence block is not in a shape this grammar can extend in "
                     + "place. Appending never rewrites the rest of the document, so nothing was written." };
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Correspondence ${direction} | ${who}\n`
      + `Trigger: op=actioncorrespond on ${target}\n`
      + `Changes: correspondence[${ord}] recorded, dated ${day}`
      + `${String(party ?? "").trim() ? `, with ${String(party).trim()}` : ""}.\n`
      + `Held as: ${sha ? `captured bytes ${sha.slice(0, 16)}...` : `testimony from ${who}`}\n`
      + `${life.stage ? `Stage: ${life.stage}${life.follows !== undefined ? `, following correspondence[${life.follows}]` : ""}.\n` : ""}`);

    const carried = this.#carried(target);
    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    /* THE LOCK IS GIVEN BACK, and this is not tidiness. The lease exists to
       stop two members interleaving two accounts of ONE exchange inside one
       write; the write is over. Leaving it to expire would lock the ledger for
       the rest of the TTL against the second member recording what they heard,
       which is the opposite of what an append-only ledger is for — and the
       member would be told "another member is writing to this action right now"
       when nobody is. Released whether the promote succeeded or failed, for the
       same reason: a refused write holds nothing worth protecting. */
    this.#releaseLease(target, who);
    if (!promoted.ok) return { ...promoted, target };

    /* REC-24 (g)'s PRODUCER. Only on a RECEIVED entry: a SENT artifact is our
       own letter and responds to nothing. */
    const responded = direction === "received" && sha
      ? this.#respondsToInto(sha, target, who) : null;
    return { ok: true, target, ord, direction, at: day, author: who, recorded_at: when,
             held_as: sha ? "capture" : "testimony",
             ...(sha ? { artifact_sha: sha } : { account: acct }),
             ...(Object.keys(quote).length ? { quote } : {}),
             ...(Object.keys(life).length ? { lifecycle: life } : {}),
             ...(responded ? { responds_to: responded } : {}),
             weight: "single" };
  }

  /* D-149 (Bob, 2026-09-22; BIO_Case_Making_v0_1.md §2, *A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*):
   * SETTING THE LIST OF LAWS THAT GOVERN AN ACTION.
   *
   * *"ALL records laws apply."* The layers follow the AGENCY ASKED — federal FOIA governs federal agencies, the
   * CPRA a California state or local agency, and a city's sunshine ordinance adds its own — so a request carries
   * a LIST, each law named by CITATION and stated at its level. This act is how the list is set, and the ONLY
   * way: `promote` refuses a creation or a revision that sets or changes it without this act
   * (GOVERNING_LAWS_REWRITTEN), so an action nobody stated a list for is undetermined IN ITS BYTES.
   *
   * A NAMED MEMBER SETS IT. The design: *set by a member's authored act; the machine may propose the list from
   * the counterparty, labelled as machine work, and never sets it*. So a machine credential is refused BY NAME
   * (MACHINE_CANNOT_SET_LAWS), the actionMove precedent. No proposal is built.
   *
   * THE WHOLE LIST, REPLACED. A member states the laws that govern the request as a set; adding one later is a
   * new statement of the set, attributed and dated anew, and the Session Log keeps what it replaced. There is
   * no act that clears it: an empty list is the undetermined state, and a member does not "set" it — nobody
   * having stated the laws is what it means.
   *
   * THE PLANE ENCODES NO LAW'S RULES. A citation is stored as the member wrote it and never parsed for a fee,
   * a clock or an appeal route, and nothing is inferred from the counterparty or the kind. */
  actionLaws({ target, laws = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-set-laws — D-149/C-32.18. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_SET_LAWS",
               detail: "which laws govern a request is a named member's authored statement (D-149). A machine "
                     + "credential may gather what the agency is and may not state the laws. Sign in as a member." };
    /* END DEC-49 REGION is-machine-set-laws */
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const read = this.#lawEntries(laws);
    if (!read.ok) return read;
    const entries = read.entries;

    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "governing laws belong to an action: they are the laws its request is made under." };
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so its governing laws cannot be set" };
    const fm = parseFrontmatter(liveMd.content).data || {};
    const before = governingLawsOf(fm);
    const when = stampInstant("second", this.#nowMs(null));
    let text = Actions.#replaceGoverningLaws(liveMd.content, entries);
    if (!text)
      return { ok: false, reason: "UNSPLICEABLE_GOVERNING_LAWS", target,
               detail: "this action's governing_laws block is not in a shape this grammar can replace in place, "
                     + "so nothing was written." };
    text = Actions.#setOrAddScalar(text, "governing_laws_by", `"${Actions.#fmSafe(who)}"`);
    text = Actions.#setOrAddScalar(text, "governing_laws_at", `"${when}"`);
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Governing laws stated | ${who}\n`
      + `Trigger: op=actionlaws on ${target}\n`
      + `Changes: governing_laws set to ${entries.map((e) => `${e.level} ${e.citation}`).join("; ")}.\n`
      + `Replaced: ${before.state === "stated"
          ? before.laws.map((e) => `${e.level} ${e.citation}`).join("; ") + ` (stated by ${before.by ?? "nobody recorded"})`
          : "nothing: the list was undetermined"}\n`);

    const carried = this.#carried(target);
    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, [LAWS_ACT]: true,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, laws: entries, by: who, at: when,
             replaced: before.state === "stated" ? before.laws : null, weight: "single" };
  }

  /* D-149 — WHAT A WELL-FORMED LIST OF GOVERNING LAWS IS, decided in ONE place.
   *
   * EXTRACTED FROM `actionLaws` BY REC-195, and the extraction is the point rather than tidiness. REC-195 adds a
   * SECOND caller — `actionLawsPropose`, the machine's proposal — and a second caller judging the same shape is
   * how REC-46's eleven-copies-of-one-predicate failure arrives at a grammar. The alternative was a second family
   * of refusal codes saying the same four things about the same four conditions, which would have made the
   * catalogue claim the plane draws a distinction it does not draw. So both acts ask this, both refuse with
   * C-73.2..5, and a change to what a citation may be cannot reach one act and miss the other.
   *
   * IT JUDGES THE SHAPE AND NEVER THE LAW. Whether a citation is the RIGHT law for the agency asked is a member's
   * reading and the plane does not try (D-149: the plane encodes no law's rules). Returns the parsed entries or
   * the refusal, and writes nothing. */
  /* AN INSTANCE METHOD AND NOT A STATIC ONE, which is a property of the INSTRUMENT rather than of the code:
     `check-refusal-codes.mjs`'s arm C finds the function a `where` names by a pattern that admits `export`,
     `async` and `function` before the name and NOT `static`, so a `where` pointing at a static method resolves
     to nothing — and a `where` that resolves to nothing takes its four rows OUT of the judged set while every
     arm still reports green (measured here: regions 157 -> 156, codesChecked 429 -> 424). Written this way so
     the guard can see it; it reads no instance state. */
  #lawEntries(laws) {
    let list = laws;
    if (typeof list === "string") { try { list = JSON.parse(list); } catch { list = null; } }
    const entries = [];
    /* DEC-49 REGION is-laws-entry — D-149/C-73.2-5. The conditions on the LIST's own shape. */
    if (!Array.isArray(list) || !list.length)
      return { ok: false, reason: "NO_LAWS", legal_levels: LAW_LEVELS,
               detail: "the act names at least one law as {level, citation}. An action whose laws nobody has "
                     + "stated reads UNDETERMINED on its own; an empty list is not a statement." };
    if (list.length > GOVERNING_LAWS_MAX)
      return { ok: false, reason: "TOO_MANY_LAWS", count: list.length, max: GOVERNING_LAWS_MAX,
               detail: `one act states at most ${GOVERNING_LAWS_MAX} governing laws` };
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const level = e && typeof e === "object" ? String(e.level ?? "").trim() : "";
      const citation = e && typeof e === "object" && typeof e.citation === "string" ? e.citation.trim() : "";
      if (!LAW_LEVELS.includes(level))
        return { ok: false, reason: "BAD_LAW_LEVEL", index: i, level, legal: LAW_LEVELS,
                 detail: `laws[${i}].level is one of ${LAW_LEVELS.join(", ")}` };
      if (!citation || citation.length > CITATION_MAX || /["\\\r\n]/.test(citation))
        return { ok: false, reason: "BAD_CITATION", index: i,
                 detail: `laws[${i}].citation is 1 to ${CITATION_MAX} characters with no quote, backslash or `
                       + "newline: the restricted frontmatter grammar has no escapes" };
      const key = `${level}\u0000${citation.toLowerCase()}`;
      if (seen.has(key))
        return { ok: false, reason: "BAD_CITATION", index: i,
                 detail: `laws[${i}] repeats an earlier entry: a law is named once at its level` };
      seen.add(key);
      entries.push({ level, citation });
    }
    /* END DEC-49 REGION is-laws-entry */
    return { ok: true, entries };
  }

  /* D-149: REPLACE the top-level `governing_laws:` block (the key line and its indented rows) with `entries`,
     or open it before the closing fence when absent — `#spliceCorrespondence`'s grammar, whole-block. Returns
     null for a block it cannot read as that shape (an inline value other than `[]`), refusing rather than
     guessing: the grammar has no escapes and a wrong guess corrupts the document silently. */
  static #replaceGoverningLaws(text, entries) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = ["governing_laws:", ...entries.flatMap((e) => [
      `  - level: ${e.level}`,
      `    citation: "${e.citation}"`,
    ])];
    let gi = -1;
    for (let i = 1; i < end; i++) if (/^governing_laws:/.test(lines[i])) { gi = i; break; }
    if (gi === -1) return [...lines.slice(0, end), ...block, ...lines.slice(end)].join("\n");
    const rest = lines[gi].slice("governing_laws:".length).trim();
    if (rest !== "" && rest !== "[]") return null;
    let last = gi;
    if (rest === "")
      for (let i = gi + 1; i < end; i++) {
        if (lines[i].trim() === "") continue;
        if (/^\s/.test(lines[i])) { last = i; continue; }
        break;
      }
    return [...lines.slice(0, gi), ...block, ...lines.slice(last + 1)].join("\n");
  }

  /** op=actionrisktier — REC-214 (BOB #33, 2026-09-24, "Risk-tier revision"; `BIO_Case_Making_v0_1.md` §2,
   *  `risk_tier`): A MEMBER REVISES AN ACTION'S RISK TIER, AS AN AUTHORED, APPEND-ONLY ACT.
   *
   *  The tier carries legal exposure — 3 is "do not file without counsel" — so the record must show that it was
   *  changed, by whom, when and why. A member may revise ANY tier, up or down, and the act:
   *   - writes `risk_tier` through the one front-matter path every reader derives the tier from (`riskTierState`
   *     over the document's own bytes; `#projectRow`'s `action_risk_tier` column; `op=search q=risk:`);
   *   - APPENDS one entry to `risk_tier_history[]` — the tier set, the tier replaced (`prior`), who, when and the
   *     REQUIRED reason — and never edits or drops an earlier one, so the prior tier, its author and its reason stay
   *     readable (`riskTierHistoryOf`); `promote` refuses any other writer that changes either (C-90.1);
   *   - records the revision in the Session Log as well, as every act on an action does.
   *  A machine credential is refused by C-32.19's own code. The act states 1, 2 or 3: `undetermined` is what an
   *  action reads when nobody has assessed it, and a member does not "set" it — actionLaws' rule for an empty list.
   *  A revision to the tier already held is refused: it would append a change that is not one. What a machine may
   *  PROPOSE is REC-215's, read beside this history and never written into it. */
  actionRiskTier({ target, tier = null, reason = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const machine = this.#machineRiskTierRefusal({ who, nextTier: riskTierState(tier), heldTier: null,
                                                   cur: false, act: true });
    if (machine) return { ...machine, target };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "a risk tier belongs to an action: it is the legal exposure of filing it." };
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so its risk tier cannot be revised" };
    const fm = parseFrontmatter(liveMd.content).data || {};
    const held = riskTierState(fm.risk_tier);
    const before = riskTierHistoryOf(fm);
    /* The query string carries every value as a string; the act's tier is a NUMBER in the bytes (a quoted "2" is
       refused by C-2.10), so the wire's "2" is read as 2 here and nowhere else. */
    const asked = typeof tier === "string" && /^[123]$/.test(tier.trim()) ? Number(tier.trim()) : tier;
    const next = riskTierState(asked);
    const why = typeof reason === "string" ? reason.trim() : "";
    const text0 = Actions.#appendRiskTierHistory(liveMd.content, null);
    /* DEC-49 REGION is-risk-tier-act */
    if (next !== 1 && next !== 2 && next !== 3)
      return { ok: false, reason: "BAD_RISK_TIER", target, tier: tier ?? null, legal: [1, 2, 3],
               detail: "the act states a tier of 1 (file freely), 2 (file with caution) or 3 (do not file without "
                     + "counsel). Undetermined is what an action reads when nobody has assessed it, not a tier to set." };
    if (!why || why.length > RISK_TIER_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "RISK_TIER_REASON_REFUSED", target, max: RISK_TIER_REASON_MAX,
               detail: `a revision of a risk tier carries a reason of 1 to ${RISK_TIER_REASON_MAX} characters, with no `
                     + "quote, backslash or line break: the restricted frontmatter grammar has no escapes. It is kept "
                     + "beside the change for as long as the record lasts." };
    if (next === held)
      return { ok: false, reason: "RISK_TIER_UNCHANGED", target, risk_tier: held,
               detail: `this action's risk tier is already ${held}; a revision changes it, and the history was not touched.` };
    if (text0 === null || before.revisions.length >= RISK_TIER_HISTORY_MAX)
      return { ok: false, reason: "RISK_TIER_HISTORY_UNSPLICEABLE", target, revisions: before.revisions.length,
               max: RISK_TIER_HISTORY_MAX,
               detail: "this action's risk_tier_history is not a block the act can append to in place (or it holds "
                     + `${RISK_TIER_HISTORY_MAX} revisions already); the act only appends, so nothing was written.` };
    /* END DEC-49 REGION is-risk-tier-act */

    const when = stampInstant("second", this.#nowMs(null));
    const entry = { tier: next, prior: held, by: Actions.#fmSafe(who), at: when, reason: why };
    let text = Actions.#appendRiskTierHistory(liveMd.content, entry);
    text = Actions.#setOrAddScalar(text, "risk_tier", String(next));
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Risk tier revised | ${who}\n`
      + `Trigger: op=actionrisktier on ${target}\n`
      + `Changes: risk_tier ${held} (${RISK_TIERS[held]}) -> ${next} (${RISK_TIERS[next]}).\n`
      + `Reason: ${why}\n`);

    const carried = this.#carried(target);
    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, [RISK_TIER_ACT]: true,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    const after = parseFrontmatter(text).data || {};
    return { ok: true, target, risk_tier: next, risk_tier_words: RISK_TIERS[next], prior: held,
             prior_words: RISK_TIERS[held] ?? null, by: who, at: when, reason: why,
             risk_tier_history: riskTierHistoryOf(after), weight: "single" };
  }

  /* REC-214: APPEND one entry to the top-level `risk_tier_history:` block, or open the block before the closing
     fence when absent — `#replaceGoverningLaws`' grammar, but it only ever ADDS rows after the last one. With
     `entry` null it answers only whether the block can be appended to (the act asks before it refuses anything
     that would write). Returns null for a block it cannot read as that shape — an inline value other than `[]` —
     refusing rather than guessing: the grammar has no escapes, and a wrong guess rewrites history silently. */
  static #appendRiskTierHistory(text, entry) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const rows = entry ? [
      `  - tier: ${entry.tier}`,
      `    prior: ${entry.prior}`,
      `    by: "${entry.by}"`,
      `    at: "${entry.at}"`,
      `    reason: "${entry.reason}"`,
    ] : [];
    let hi = -1;
    for (let i = 1; i < end; i++) if (/^risk_tier_history:/.test(lines[i])) { hi = i; break; }
    if (hi === -1) return [...lines.slice(0, end), "risk_tier_history:", ...rows, ...lines.slice(end)].join("\n");
    const rest = lines[hi].slice("risk_tier_history:".length).trim();
    if (rest !== "" && rest !== "[]") return null;
    let last = hi;
    if (rest === "")
      for (let i = hi + 1; i < end; i++) {
        if (lines[i].trim() === "") continue;
        if (/^\s/.test(lines[i])) { last = i; continue; }
        break;
      }
    return [...lines.slice(0, hi), "risk_tier_history:", ...lines.slice(hi + 1, last + 1), ...rows,
            ...lines.slice(last + 1)].join("\n");
  }

  /** op=actionlawspropose — REC-195 (D-149's remaining half; `BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST
   *  NAMES EVERY LAW THAT GOVERNS IT*): A PROPOSAL OF CITATIONS AND LEVELS, STORED APART FROM THE MEMBER'S
   *  LIST AND LABELLED MACHINE WORK.
   *
   *  THE RULING'S OWN WORDS: *the machine may propose the list from the counterparty, labelled as machine work,
   *  and never sets it.* D-149 built the half that REFUSES (the machine fence at C-32.18, spelled without backticks here
   *  because machinefences-dec49's ARM B2 reads a quoted fence literal in this file as a FENCE SITE and asks
   *  whether it sits inside a governed region — a mention in prose is not one) and said in this
   *  file's own comment that no proposal was built. This is that proposal, and every line of it is about the
   *  difference between the two halves.
   *
   *  IT NEVER SETS THE LIST, AND THAT IS STRUCTURAL RATHER THAN POLICED. This method does not call `promote`, it
   *  writes no file, and it never touches `governing_laws`, `governing_laws_by` or `governing_laws_at`. The list
   *  is the member's and moves only through `actionLaws`; the fence that keeps a revision from moving it
   *  (C-73.1) is untouched and unreachable from here, because nothing here writes bytes at all. The suite's
   *  named control arms this method to write the list and the arm that fails is the one whose name says the
   *  list is the member's.
   *
   *  ANY CREDENTIAL MAY PROPOSE, AND THE LABEL CARRIES THE MEANING — `themePropose`'s shape, for its reason
   *  (§8.4 fence 3). A fence admitting only machines would be a fence TIGHTER THAN ITS RULE: D-149 says a
   *  machine MAY propose, not that nobody else may, and a member's proposal to whoever states the list is a
   *  real act with an obvious surface. What the record owes is the LABEL, and `lawProposalLabel` composes it in
   *  one place so the plane answers the question rather than publishing an identity for a surface to judge.
   *
   *  THE WHOLE PROPOSAL, REPLACED, PER PROPOSER. A proposer restating replaces its OWN standing proposal and
   *  nobody else's: two machines proposing different lists are two proposals, and the record says who proposed
   *  which. There is no act that clears one and none that adopts one — adopting is `op=actionlaws`, which is a
   *  member's authored statement of the laws and not an acceptance of anybody's suggestion. **NOTHING HERE OR
   *  IN THE READ DERIVES A RELATION BETWEEN A PROPOSAL AND THE LIST**, even when they hold the same citations:
   *  that a member's list came FROM a machine's proposal is a claim about why somebody acted, and the record
   *  cannot support it. */
  actionLawsPropose({ target, laws = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who)
      return { ok: false, reason: "NO_AUTHOR",
               detail: "this call carries nobody. The plane stamps the proposer from the credential that "
                     + "asked, and a proposal nobody can be named for is one the record could say nothing "
                     + "about: the label IS the act." };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const read = this.#lawEntries(laws);
    if (!read.ok) return read;
    const entries = read.entries;

    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
      target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "governing laws belong to an action: they are the laws its request is made under." };
    const at = stampInstant("second", this.#nowMs(null));
    /* REPLACE THIS PROPOSER'S OWN ROWS AND NOBODY ELSE'S. Keyed on both columns, never on the bundle alone. */
    this.sql.exec(`DELETE FROM action_law_proposals WHERE bundle_id=? AND proposed_by=?`, target, who);
    entries.forEach((e, i) => this.sql.exec(
      `INSERT INTO action_law_proposals (bundle_id, proposed_by, ord, level, citation, proposed_at)
       VALUES (?, ?, ?, ?, ?, ?)`, target, who, i, e.level, e.citation, at));

    /* THE ACT'S OWN ANSWER SAYS WHAT IT DID NOT DO, read through the ONE reader of the list (`governingLawsOf`)
       so the act and the action's own read cannot disagree about whose the list is. */
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    const fm = liveMd && liveMd.content !== null ? (parseFrontmatter(liveMd.content).data || {}) : null;
    const listed = governingLawsOf(fm);
    return { ok: true, target, weight: "single",
             proposal: { ...lawProposalLabel(who), at, laws: entries },
             governing_laws: listed, evidence: false,
             says: `${entries.length} citation${entries.length === 1 ? " is" : "s are"} proposed for this `
                 + `action. This is not the action's list of governing laws and did not change it: that list `
                 + `${listed.state === "stated" ? `is ${listed.laws.length} law(s) stated by a member` : "is UNDETERMINED"}`
                 + ", and only a member's own act states it." };
  }

  /* REC-24 (g): write the `responds_to` edge onto the CAPTURED REPLY, pointing
     back at the action it answered. The edge lives on the responding document
     because that is what the relation says — this document is what came back —
     and because refs is a projection of the CITING document's own frontmatter,
     so an edge stated anywhere else would be a second place the relationship
     lives (D-21).
     Returns null when the capture is not part of a bundle in this store, which
     is a legitimate state rather than a failure: bytes may be registered against
     a bundle that has since been purged, and the ledger entry stands on its own
     hash either way. Idempotent by inspection, so re-recording does not
     duplicate an edge. */
  #respondsToInto(captureSha, actionId, who) {
    const reg = this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, captureSha);
    if (!reg || !reg.bundle_id || reg.bundle_id === actionId) return null;
    const doc = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, f.content
         FROM bundles b JOIN files f ON f.bundle_id=b.bundle_id AND f.path='bundle.md'
        WHERE b.bundle_id=?`, reg.bundle_id);
    if (!doc || doc.content === null) return null;
    const fm = parseFrontmatter(doc.content).data || {};
    const refs = Array.isArray(fm.references) ? fm.references : [];
    if (refs.some((r) => r && typeof r === "object" && r.rel === "responds_to" && r.target === actionId))
      return { bundle_id: doc.bundle_id, already: true };
    const when = stampInstant("second", this.#nowMs(null));
    let text = Actions.#spliceReferences(doc.content,
      [{ rel: "responds_to", target: actionId, status: "confirmed", note: "" }]);
    if (!text) return null;
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Recorded as a response | ${who}\n`
      + `Trigger: op=actioncorrespond on ${actionId}\n`
      + `Changes: responds_to edge added to ${actionId}.\n`);
    const carried = this.#carried(doc.bundle_id);
    const bytes = new TextEncoder().encode(text);
    const p = this.promotion.promote({
      bundleId: doc.bundle_id, base: this.#baseOf(doc.bundle_id),
      snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`, author: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? doc.object_type,
              title: fm.title, current_state: fm.current_state ?? doc.current_state,
              prior_state: fm.prior_state ?? null, created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null },
    });
    return p.ok ? { bundle_id: doc.bundle_id, already: false } : { bundle_id: doc.bundle_id, refused: p.reason };
  }

  /* D-148: A FEE QUOTE IS EVIDENCE — THE READ (`BIO_Case_Making_v0_1.md` §2).
   *
   * Quotes set side by side by ONE axis at a time: `counterparty=` (the action's
   * own named counterparty, matched exactly as written) or `request=` (an action,
   * optionally `answers=` one sent entry of it). One indexed lookup each, over
   * the `action_quotes` projection and gated by the viewer through the action.
   *
   * IT JUDGES NOTHING. Each row says what was quoted, by whom, when, for which
   * request, how it is held (captured bytes or a member's account), and which
   * later quotes revise it — a waiver is a revision to zero, and both rows are
   * returned. Whether two requests sought the same records, or a quote exceeds
   * what a law allows, is a member's claim in an inquiry (DEC-24), so no field
   * here compares one quote to another.
   *
   * AN EMPTY ANSWER SAYS WHICH LEVEL WAS EMPTY. By request, it names how many
   * sent and received entries the ledger holds, so "no quote" is distinguishable
   * from "no reply". By counterparty, it says an action whose counterparty is
   * stated undetermined is reachable only by its request. */
  actionQuotes({ counterparty = null, request = null, answers = null, viewer = null } = {}) {
    const cp = String(counterparty ?? "").trim();
    const req = String(request ?? "").trim();
    const ans = String(answers ?? "").trim();
    const refusal = (code, detail, extra) => {
      const row = QUOTE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-quote-read-axis — D-148/C-72.7-8. One axis at a time: a read
       answering from both would be neither question the caller asked; and answers=
       names a position in a ledger, so it is a whole number or it names nothing. */
    if ((!cp && !req) || (cp && req))
      return refusal("QUOTE_READ_UNASKED",
        "quotes are read by counterparty= or by request= (optionally with answers=), one at a time",
        { axes: ["counterparty", "request"] });
    if (ans && !/^\d+$/.test(ans))
      return refusal("QUOTE_ANSWERS_NOT_AN_ORD",
        "answers= is the position of a sent entry in the action's correspondence, a whole number",
        { answers: ans.slice(0, 20) });
    /* END DEC-49 REGION is-quote-read-axis */
    const gate = viewerPredicate(viewer);
    const max = QUOTES_MAX;
    let rows;
    let absence = null;
    if (req) {
      const b = this.#one(
        `SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
        req, ...gate.args);
      if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: req };
      if (normalizeType(b.object_type) !== "action")
        return { ok: false, reason: "NOT_AN_ACTION", target: req, object_type: b.object_type };
      rows = this.#rows(
        `SELECT q.* FROM action_quotes q WHERE q.bundle_id=?${ans ? " AND q.answers_ord=?" : ""}
          ORDER BY q.ord LIMIT ?`, req, ...(ans ? [Number(ans)] : []), max + 1);
      if (!rows.length) {
        const n = (d) => this.#one(`SELECT COUNT(*) AS n FROM correspondence WHERE bundle_id=? AND direction=?`,
          req, d).n;
        const sent = n("sent"), received = n("received");
        absence = { level: sent === 0 ? "no_request" : received === 0 ? "no_reply" : "no_quote",
                    sent, received,
                    says: sent === 0 ? "this action's ledger records no sent entry, so nothing here could be quoted"
                      : received === 0 ? "this action's ledger records no reply, so no quote has been received"
                      : "this action's ledger records replies and none of them carries a quote" };
      }
    } else {
      rows = this.#rows(
        `SELECT q.* FROM action_quotes q JOIN bundles b ON b.bundle_id=q.bundle_id
          WHERE q.counterparty=? AND (${gate.sql}) ORDER BY q.bundle_id, q.ord LIMIT ?`,
        cp, ...gate.args, max + 1);
      if (!rows.length)
        absence = { level: "no_quote_by_name",
                    says: "no action you may read names this counterparty and carries a quote. The name is "
                        + "matched exactly as written, and an action whose counterparty is stated undetermined "
                        + "is reachable only by its request" };
    }
    const truncated = rows.length > max;
    const quotes = rows.slice(0, max).map((q) => {
      const entry = this.#one(
        `SELECT artifact_sha, artifact_bundle_id, account, author, party FROM correspondence
          WHERE bundle_id=? AND ord=?`, q.bundle_id, q.ord) || {};
      const sent = this.#one(
        `SELECT at, artifact_sha, account FROM correspondence WHERE bundle_id=? AND ord=?`,
        q.bundle_id, q.answers_ord) || {};
      return {
        action: q.bundle_id, ord: q.ord, at: q.at,
        amount: q.amount, value: q.value, currency: q.currency, basis: q.basis,
        counterparty: q.counterparty, party: entry.party ?? null,
        held_as: entry.artifact_sha ? "capture" : "testimony",
        ...(entry.artifact_sha ? { artifact_sha: entry.artifact_sha, artifact_bundle_id: entry.artifact_bundle_id ?? null }
                               : { account: entry.account ?? null }),
        author: entry.author ?? null,
        answers: { ord: q.answers_ord, at: sent.at ?? null },
        revises: q.revises_ord,
        revised_by: this.#rows(`SELECT ord FROM action_quotes WHERE bundle_id=? AND revises_ord=? ORDER BY ord`,
          q.bundle_id, q.ord).map((r) => r.ord),
      };
    });
    return { ok: true, by: req ? "request" : "counterparty", ...(req ? { request: req } : { counterparty: cp }),
             ...(ans ? { answers: Number(ans) } : {}),
             quotes, count: quotes.length, truncated, max,
             ...(absence ? { absence } : {}),
             says: "the record asserts only what was quoted, by whom, when, and for which request. It sets "
                 + "quotes side by side and judges none of them (DEC-24)." };
  }

  /* REC-24 (d): APPEND one entry to the `correspondence` block, touching nothing
     else — #spliceBasis line for line, and a twin rather than a generalisation
     for the reason stated there: the ELEMENT shapes differ, and a parameterised
     splicer would hide that behind an option in a grammar with no serializer.
     A KEY IS RENDERED ONLY IF THE ENTRY CARRIES IT, so an entry held as
     testimony carries no artifact_sha at all rather than an empty one — the
     capture-or-testify choice is visible in the bytes and not only in a table.
     Values are emitted quoted where they are prose (account, medium, party) and
     bare where they are tokens, matching what the restricted grammar's parser
     reads back. */
  static #spliceCorrespondence(text, e) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = [
      `  - direction: ${e.direction}`,
      `    at: ${e.at}`,
      ...(e.medium ? [`    medium: "${e.medium}"`] : []),
      ...(e.party ? [`    party: "${e.party}"`] : []),
      ...(e.artifact_sha ? [`    artifact_sha: ${e.artifact_sha}`] : []),
      ...(e.account ? [`    account: "${e.account}"`] : []),
      /* D-148: a quote's keys, each only if carried. The amount is QUOTED so the
         parser keeps the text as the body wrote it (`1083.00` stays `1083.00`);
         the two ords are bare tokens. */
      ...(e.quote_amount !== undefined ? [`    quote_amount: "${e.quote_amount}"`] : []),
      ...(e.quote_currency !== undefined ? [`    quote_currency: "${e.quote_currency}"`] : []),
      ...(e.quote_basis !== undefined ? [`    quote_basis: "${e.quote_basis}"`] : []),
      ...(e.quote_answers !== undefined ? [`    quote_answers: ${e.quote_answers}`] : []),
      ...(e.quote_revises !== undefined ? [`    quote_revises: ${e.quote_revises}`] : []),
      /* D-147: the lifecycle keys, each only if carried. Stage, follows and
         outcome are bare tokens (judged tokens before this splice); the date and
         the two prose values are quoted so the parser keeps them as written. */
      ...(e.stage !== undefined ? [`    stage: ${e.stage}`] : []),
      ...(e.follows !== undefined ? [`    follows: ${e.follows}`] : []),
      ...(e.outcome !== undefined ? [`    outcome: ${e.outcome}`] : []),
      ...(e.exemptions !== undefined ? [`    exemptions: "${e.exemptions}"`] : []),
      ...(e.due_by !== undefined ? [`    due_by: "${e.due_by}"`] : []),
      ...(e.due_cite !== undefined ? [`    due_cite: "${e.due_cite}"`] : []),
      `    author: ${e.author}`,
      `    recorded_at: "${e.recorded_at}"`,
    ];
    let ci = -1;
    for (let i = 1; i < end; i++) if (/^correspondence:/.test(lines[i])) { ci = i; break; }
    if (ci === -1)
      return [...lines.slice(0, end), "correspondence:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[ci].slice("correspondence:".length).trim();
    if (rest === "[]")
      return [...lines.slice(0, ci), "correspondence:", ...block, ...lines.slice(ci + 1)].join("\n");
    if (rest !== "") return null;
    let last = ci;
    for (let i = ci + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) { last = i; continue; }
      break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }
  /* ================================================================ the read (R25, R26, R29–R31) */

  /** R25, REC-24 (f)/(g): everything about ONE action that is DERIVED rather than stored — the clock's verdict at a
   *  named instant, the action's own outcome (DEC-14), the ledger, the legs, and what responded. `row` is the
   *  projection row retrieval answers (`bundle_id`, `fm_json`, `action_*` columns); the cached flag is reported beside
   *  the derivation, never in place of it (R35). */
  derived(row, nowMs = null) {
    let fm = {};
    try { fm = row && row.fm_json ? (JSON.parse(row.fm_json) || {}) : {}; } catch { fm = {}; }
    if ((!fm || !Object.keys(fm).length) && row && row.bundle_id) fm = this.#heldFm(row.bundle_id) || {};
    const now = this.#nowMs(nowMs);
    const ledger = this.#rows(
      `SELECT ord, direction, at, medium, party, artifact_bundle_id, artifact_sha, account, author, recorded_at
         FROM correspondence WHERE bundle_id=? ORDER BY ord`, row.bundle_id);
    const legs = this.#rows(
      `SELECT ord, target_id, target_type, kind, note, at, extent_capture FROM action_basis WHERE bundle_id=? ORDER BY ord`,
      row.bundle_id).map((l) => ({ ...l, extent_capture: l.extent_capture ?? null,
        ...(l.target_type === "information" && !l.extent_capture ? { version: "undetermined" } : {}) }));
    const tier = riskTierState(fm.risk_tier);
    const cp = fm.counterparty && typeof fm.counterparty === "object" && !Array.isArray(fm.counterparty) ? fm.counterparty : {};
    return {
      kind: typeof fm.action_kind === "string" ? fm.action_kind : (row.action_kind ?? null),
      /* D-182: read from the stored DOCUMENT, never defaulted; the words travel with the value. */
      risk_tier: tier, risk_tier_words: RISK_TIERS[tier] ?? null,
      risk_tier_history: riskTierHistoryOf(fm),
      counterparty_state: typeof cp.state === "string" ? cp.state : (row.action_counterparty_state ?? null),
      resolution: typeof fm.resolution === "string" ? fm.resolution : (row.action_resolution ?? null),
      clock_next: actionClockNext(fm),
      clock_overdue: actionOverdue(fm, now),
      clock_overdue_cached: row.action_clock_overdue === null || row.action_clock_overdue === undefined
        ? null : !!row.action_clock_overdue,
      as_of: new Date(now).toISOString(),
      basis: legs,
      correspondence: ledger,
      governing_laws: governingLawsOf(fm),
      governing_laws_proposals: this.#lawProposalsFor(row.bundle_id),
      risk_tier_proposals: this.#riskProposalsFor(row.bundle_id),
      records_law: fm.action_kind === "records_request" ? recordsLawOf(fm, this.#lawAuthor(row.bundle_id, fm)) : null,
      lifecycle: requestLifecycleOf(fm, new Date(now).toISOString().slice(0, 10)),
      /* R26, DEC-14: the ACTION'S OWN OUTCOME, never the breach's consequence (which `consequences` holds). */
      own_outcome: consequenceState(fm),
      responses: this.#rows(`SELECT bundle_id FROM refs WHERE target_id=? AND kind='responds_to' ORDER BY bundle_id`,
        row.bundle_id).map((r) => r.bundle_id),
    };
  }

  /* R5: the recorded author class of the action's creation (record-core R15–R16's manifest, first by `seq`): a law
     written before C-32.20's fence was written with the action, and since the fence no machine can state one. */
  #lawAuthor(id, fm) {
    if (!fm || typeof fm.law !== "string" || !fm.law.trim()) return null;
    let entries = [];
    try {
      const im = this.record.readImage(id);
      const m = im ? im["_history/manifest.json"] : null;
      entries = (JSON.parse(typeof m === "string" ? m : m && m.text ? m.text : "{}").entries) || [];
    } catch { entries = []; }
    const first = [...entries].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0];
    return first && typeof first.author === "string" ? first.author : null;
  }

  /** R29: one action's block (R25) for a viewer. */
  actionRead({ id, viewer = null, now = null } = {}) {
    const b = id ? this.#visibleAction(id, viewer) : null;
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id ?? null };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target: id, object_type: b.object_type };
    const fm = this.#heldFm(id) || {};
    const d = this.derived({ bundle_id: id }, now);
    /* R29 (K248): R25's keys, and the document's own values its users read (filings, escalation). */
    return { ok: true, id, current_state: b.current_state, ...d,
             counterparty: fm.counterparty ?? null, clock: Array.isArray(fm.clock) ? fm.clock : [],
             legs: d.basis.map((l) => ({ target: l.target_id, kind: l.kind, note: l.note ?? null, at: l.at ?? null,
                                         target_type: l.target_type, extent_capture: l.extent_capture })),
             law: typeof fm.law === "string" ? fm.law : null, breach: fm.breach === true };
  }

  /** R30: visible actions by filters, in id order, at most 200 per page, `truncated` by reading one past. */
  actionsFor({ determination = null, counterparty = null, state = null, kind = null, after = null, limit = null,
               viewer = null } = {}) {
    const max = clampLimit(limit, ACTIONS_PAGE_MAX, ACTIONS_PAGE_MAX);
    const gate = viewerPredicate(viewer);
    const where = [`b.object_type='action'`, `(${gate.sql})`, `b.bundle_id>?`], fixed = [...gate.args];
    const tail = [];
    if (state) { where.push(`b.current_state=?`); tail.push(String(state)); }
    if (determination) { where.push(`EXISTS (SELECT 1 FROM action_basis l WHERE l.bundle_id=b.bundle_id AND l.kind='rests_on' AND l.target_id=?)`); tail.push(String(determination)); }
    const out = [];
    let truncated = false;
    /* kind and counterparty are read from the document, so the page is filled by reading on in id order. */
    let from = after ? String(after) : "";
    for (;;) {
      const rows = this.#rows(`SELECT b.bundle_id, b.current_state FROM bundles b WHERE ${where.join(" AND ")}
        ORDER BY b.bundle_id LIMIT ?`, ...fixed, from, ...tail, max + 1);
      for (const r of rows) {
        from = r.bundle_id;
        const fm = this.#heldFm(r.bundle_id) || {};
        if (kind && fm.action_kind !== kind) continue;
        if (counterparty && counterpartyName(fm.counterparty) !== counterparty) continue;
        if (out.length === max) { truncated = true; break; }
        out.push({ id: r.bundle_id, state: r.current_state, kind: fm.action_kind ?? null,
                   counterparty: counterpartyName(fm.counterparty), counterparty_state: fm.counterparty?.state ?? null });
      }
      if (truncated || rows.length <= max) break;
    }
    const cursor = out.length ? out[out.length - 1].id : null;
    return { ok: true, items: out, limit: max, truncated, cursor,
             ...(determination && !this.conformance ? { determination_read: "undetermined",
                 says: "the legs are matched by the determination named; whether it is live is conformance's to say, and it is not provided on this instance" } : {}) };
  }

  /** R31: every `pending` clock entry dated before `before` across visible actions, at most 500 per page. */
  pendingClocks({ before, limit = null, after = null, viewer = null } = {}) {
    const day = String(before ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { ok: false, reason: "BAD_DATE", before: before ?? null,
      detail: "before= is a date, YYYY-MM-DD" };
    const max = clampLimit(limit, PENDING_CLOCKS_MAX, PENDING_CLOCKS_MAX);
    const gate = viewerPredicate(viewer);
    const rows = this.#rows(`SELECT b.bundle_id FROM bundles b WHERE b.object_type='action' AND (${gate.sql})
      ${after ? "AND b.bundle_id>?" : ""} AND b.action_clock_next IS NOT NULL AND b.action_clock_next < ? ORDER BY b.bundle_id`,
      ...gate.args, ...(after ? [String(after)] : []), day);
    const items = [];
    let truncated = false;
    for (const r of rows) {
      const fm = this.#heldFm(r.bundle_id) || {};
      const clock = Array.isArray(fm.clock) ? fm.clock : [];
      for (let i = 0; i < clock.length; i++) {
        const e = clock[i];
        if (!e || e.status !== "pending" || typeof e.date !== "string" || !(e.date < day)) continue;
        if (items.length === max) { truncated = true; break; }
        items.push({ action: r.bundle_id, ord: i, date: e.date, basis: e.basis ?? null, text: e.text ?? null,
                     past: e.date < day });
      }
      if (truncated) break;
    }
    return { ok: true, before: day, items, limit: max, truncated,
             cursor: items.length ? items[items.length - 1].action : null };
  }

  /* ================================================================ proposals (R19, R28, R32) */

  /** R28 (REC-215): a proposed tier, stored apart, labelled; it never touches `risk_tier` or its history. */
  actionRiskPropose({ target, tier = null, basis = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const asked = typeof tier === "string" && /^[123]$/.test(tier.trim()) ? Number(tier.trim()) : tier;
    if (asked !== 1 && asked !== 2 && asked !== 3)
      return refuse("BAD_RISK_TIER", "a proposal states a tier of 1, 2 or 3", { target, tier: tier ?? null, legal: [1, 2, 3] });
    const why = typeof basis === "string" ? basis.trim() : "";
    /* DEC-49 REGION is-risk-propose-basis */
    if (!why || why.length > RISK_PROPOSAL_BASIS_MAX || /["\\\r\n]/.test(why))
      return refuse("RISK_PROPOSAL_BASIS_REFUSED", `a proposed tier carries its basis: 1 to ${RISK_PROPOSAL_BASIS_MAX} `
        + "characters with no quote, backslash or line break", { target, max: RISK_PROPOSAL_BASIS_MAX });
    /* END DEC-49 REGION is-risk-propose-basis */
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const at = stampInstant("second", this.#nowMs(null));
    this.sql.exec(`INSERT INTO action_risk_proposals (bundle_id, proposed_by, tier, basis, proposed_at) VALUES (?,?,?,?,?)
      ON CONFLICT(bundle_id, proposed_by) DO UPDATE SET tier=excluded.tier, basis=excluded.basis, proposed_at=excluded.proposed_at`,
      target, who, asked, why, at);
    const held = riskTierState((this.#heldFm(target) || {}).risk_tier);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who, "risk_tier"), tier: asked, tier_words: RISK_TIERS[asked], basis: why, at },
             risk_tier: held, risk_tier_words: RISK_TIERS[held] ?? null,
             says: `a tier of ${asked} is proposed for this action. This is not the action's risk tier and did not change `
                 + `it: the tier is ${held === "undetermined" ? "undetermined" : held}, and only a member's own act sets it.` };
  }

  /* R28: the standing tier proposals, newest first, at most 12, with `truncated` and a sentence also when empty. */
  #riskProposalsFor(id) {
    const cap = RISK_PROPOSALS_READ_MAX;
    const rows = this.#rows(`SELECT proposed_by, tier, basis, proposed_at FROM action_risk_proposals WHERE bundle_id=?
      ORDER BY proposed_at DESC, proposed_by LIMIT ?`, id, cap + 1);
    const proposals = rows.slice(0, cap).map((r) => ({ ...proposalLabelFor(r.proposed_by, "risk_tier"), tier: r.tier,
      tier_words: RISK_TIERS[r.tier] ?? null, basis: r.basis, at: r.proposed_at }));
    return { proposals, limit: cap, truncated: rows.length > cap,
             says: proposals.length
               ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of this action's risk tier. A proposal is `
                 + "not the tier: the tier is the member's own act, stated beside this one."
               : "no proposal of this action's risk tier stands in the record. That is a statement about proposals and "
                 + "about nothing else." };
  }

  /** R32: a clock entry computed from a profile deadline that applies to the action's kind, stored apart and labelled;
   *  never written into `clock[]`. */
  clockPropose({ target, rule, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    if (!rule) return { ok: false, reason: "NO_RULE", detail: "name the profile deadline's rule: rule=<rule>" };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const fm = this.#heldFm(target) || {};
    const view = this.#view();
    const d = (view && Array.isArray(view.deadlines) ? view.deadlines : [])
      .find((x) => x && x.rule === rule && x.applies_to === fm.action_kind);
    if (!d) return { ok: false, reason: "NO_SUCH_RULE", target, rule,
      detail: `no active profile states a deadline '${String(rule).slice(0, 60)}' for an action of kind '${fm.action_kind}'` };
    const computed = computeDeadline(d, fm, view);
    const basis = `${d.citation}${d.basis ? ` (profile basis: ${d.basis}${d.profile ? `, ${d.profile}` : ""})` : ""}`;
    const entry = { text: d.rule, description: `${d.days} ${d.count} day${d.days === 1 ? "" : "s"} from ${d.starts}`,
                    date: computed.date, basis, status: "pending" };
    const at = stampInstant("second", this.#nowMs(null));
    this.sql.exec(`INSERT INTO action_clock_proposals (bundle_id, proposed_by, rule, date, basis, entry_json, why, proposed_at)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(bundle_id, proposed_by, rule) DO UPDATE SET date=excluded.date,
      basis=excluded.basis, entry_json=excluded.entry_json, why=excluded.why, proposed_at=excluded.proposed_at`,
      target, who, rule, computed.date, basis, JSON.stringify(entry), computed.why ?? null, at);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who, "clock"), rule, entry, at,
                         ...(computed.date ? { start: computed.start } : { undetermined: computed.why }) },
             says: "this clock entry is proposed and is not on the action's clock: a member states a clock entry by a "
                 + "revision of the action." };
  }

  #lawProposalsFor(bundleId) {
    const cap = LAW_PROPOSALS_READ_MAX;
    const rowCap = (cap + 1) * GOVERNING_LAWS_MAX;
    const rows = this.#rows(
      `SELECT proposed_by, ord, level, citation, proposed_at FROM action_law_proposals
        WHERE bundle_id=? ORDER BY proposed_at DESC, proposed_by, ord LIMIT ?`, bundleId, rowCap + 1);
    const byProposer = new Map();
    for (const r of rows) {
      if (!byProposer.has(r.proposed_by))
        byProposer.set(r.proposed_by, { ...lawProposalLabel(r.proposed_by), at: r.proposed_at, laws: [] });
      byProposer.get(r.proposed_by).laws.push({ level: r.level, citation: r.citation });
    }
    const all = [...byProposer.values()];
    const proposals = all.slice(0, cap);
    const machine = proposals.filter((p) => p.machine_work).length;
    return {
      proposals, limit: cap, truncated: all.length > cap,
      says: proposals.length
        ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of the laws that govern this `
          + `action, ${machine} of them machine work. A proposal is not this action's list of governing laws `
          + `and nothing here states which laws apply: the list is the member's own act, and it is stated `
          + `beside this one.`
        : "no proposal of the laws governing this action stands in the record. That is a statement about "
          + "proposals and about nothing else: whether any law governs this request is answered beside this, "
          + "and a member states it.",
    };
  }
}

/* The acts answer their catalogue-backed refusals with code, check and translation (the Provides' "Terms"). */
for (const m of ["actionMove", "actionCorrespond", "actionLaws", "actionLawsPropose", "actionRiskTier", "actionQuotes",
                 "actionRiskPropose", "check"]) {
  const fn = Actions.prototype[m];
  Actions.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

/* R19, R28, R32: the label of a proposal stored apart. The governing-laws sentence is legacy-checks' (REC-195); the
   tier's and the clock entry's say, in each state, what the proposal is not. */
const PROPOSAL_SAYS = {
  risk_tier: {
    machine_proposed: "a machine credential proposed this risk tier. That is machine work, labelled as machine work: it "
      + "can set a tier beside the action for members to weigh and it can never set the tier. Nothing here is this "
      + "action's risk tier, and nothing becomes it until a member states it themselves",
    member_proposed: "a member proposed this risk tier to whoever states it. It is a proposal and not the tier: only the "
      + "risk-tier act sets that, and the record holds who made the proposal",
    unstated: "the record does not say who proposed this risk tier",
  },
  clock: {
    machine_proposed: "a machine credential computed this clock entry from the jurisdiction profile. That is machine "
      + "work, labelled as machine work: it is not on the action's clock, and nothing puts it there until a member "
      + "revises the action to state it",
    member_proposed: "a member asked for this clock entry to be computed from the jurisdiction profile. It is a proposal "
      + "and not a clock entry: a member states one by revising the action",
    unstated: "the record does not say who asked for this clock entry",
  },
};
function proposalLabelFor(who, subject) {
  const base = lawProposalLabel(who);
  return { by: base.by, state: base.state, machine_work: base.machine_work, says: PROPOSAL_SAYS[subject][base.state] };
}

/* R32: a deadline's date from its rule, counted from the event the rule names in the action's ledger: `filed` the first
   sent entry, `received` the first received entry; `act` and `known` are not ledger events, so they are undetermined.
   A `business` count uses the profile's holiday calendar and is undetermined past the years it lists (jurisdictions
   R33). Nothing is written. */
function computeDeadline(d, fm, view) {
  const ledger = Array.isArray(fm.correspondence) ? fm.correspondence : [];
  const dir = d.starts === "filed" ? "sent" : d.starts === "received" ? "received" : null;
  if (!dir) return { date: null, why: `the rule starts from '${d.starts}', an event the action's ledger does not record` };
  const e = ledger.find((x) => x && x.direction === dir && typeof x.at === "string" && /^\d{4}-\d{2}-\d{2}/.test(x.at));
  if (!e) return { date: null, why: `the action's ledger holds no ${dir} entry, the event this rule starts from` };
  const start = e.at.slice(0, 10);
  const days = Number(d.days);
  if (!Number.isInteger(days) || days < 0) return { date: null, start, why: "the rule's number of days is not a whole number" };
  const t0 = Date.parse(`${start}T00:00:00Z`);
  const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
  if (d.count === "calendar") return { date: iso(t0 + days * 86400000), start };
  if (d.count !== "business") return { date: null, start, why: `the rule's count '${d.count}' is neither calendar nor business` };
  const years = new Map();
  for (const h of (view && Array.isArray(view.holidays) ? view.holidays : []))
    if (h && Number.isInteger(Number(h.year))) years.set(Number(h.year), new Set((h.days || []).map((x) => x && x.date)));
  let t = t0, n = 0;
  while (n < days) {
    t += 86400000;
    const y = new Date(t).getUTCFullYear();
    if (!years.has(y)) return { date: null, start, why: `the count reaches ${y}, a year the profile's holiday calendar does not list` };
    const wd = new Date(t).getUTCDay();
    if (wd === 0 || wd === 6 || years.get(y).has(iso(t))) continue;
    n++;
  }
  return { date: iso(t), start };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it declares its tables, registers its step, audit, facts and
 *  decoration (R3, R12, R25, R36, R37; retrieval R53, R56). */
export function actionsOf(host, deps) {
  let a = instances.get(host);
  if (!a) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    a = new Actions({ ...d, host, storage, record, membership, promotion });
    instances.set(host, a);
    a.migrate();
    record.declarePurge("actions", [...ACTIONS_TABLES]);
    promotion.registerStep("actions", { check: (c) => a.check(c), project: (c) => a.project(c) });
    record.registerAuditCheck("actions", (image) => a.audit(image));
    const retrieval = d.retrieval === null ? null : a.retrieval;
    if (retrieval) {
      retrieval.registerActionFacts("actions", (md, nowMs) => actionFacts(md, nowMs));
      retrieval.registerProjectionDecoration("actions", (row, { nowMs } = {}) =>
        (normalizeType(row && row.object_type) === "action" ? { action: a.derived(row, nowMs) } : {}));
    }
  }
  return a;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function actionsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTIONS_TABLES.includes(name);
}

/** The module's ops (K3), as entries of the legacy store's op map. `viewer`, `author` and `proposer` are the control
 *  plane's stamps, read from the query, so a caller's own copy never wins. */
export function actionsOps(a, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    actionmove: () => a.actionMove({ target: q("target"), to: q("to"), reason: q("reason"), resolution: q("resolution"),
                                     viewer: q("viewer"), author: q("author") }),
    actionlaws: () => a.actionLaws({ target: q("target") || b.target, laws: b.laws, viewer: q("viewer"), author: q("author") }),
    actionrisktier: () => a.actionRiskTier({ target: q("target") || b.target, tier: q("tier") ?? b.tier ?? null,
                                             reason: q("reason") ?? b.reason ?? null, viewer: q("viewer"), author: q("author") }),
    actionlawspropose: () => a.actionLawsPropose({ target: q("target") || b.target, laws: b.laws, viewer: q("viewer"),
                                                   proposer: q("proposer") }),
    actionriskpropose: () => a.actionRiskPropose({ target: q("target") || b.target, tier: q("tier") ?? b.tier ?? null,
                                                   basis: q("basis") ?? b.basis ?? null, viewer: q("viewer"),
                                                   proposer: q("proposer") }),
    actioncorrespond: () => a.actionCorrespond({ target: q("target"), direction: q("direction"), at: q("at"),
      medium: q("medium"), party: q("party"), artifactSha: q("artifact_sha"), account: q("account"),
      quoteAmount: q("quote_amount"), quoteCurrency: q("quote_currency"), quoteBasis: q("quote_basis"),
      quoteAnswers: q("quote_answers"), quoteRevises: q("quote_revises"),
      stage: q("stage"), follows: q("follows"), outcome: q("outcome"), exemptions: q("exemptions"),
      dueBy: q("due_by"), dueCite: q("due_cite"), viewer: q("viewer"), author: q("author") }),
    actionquotes: () => a.actionQuotes({ counterparty: q("counterparty"), request: q("request"), answers: q("answers"),
                                         viewer: q("viewer") }),
  };
}
