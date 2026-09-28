/* intent — what the group is trying to achieve, turned into checkable work (requirements: `build/requirements/intent.md`;
 * Content Framework §12). Aspirations (standing, never close, set priority), goals (bounded pursuits that close) and
 * objectives (a project's aim, with a satisfaction condition the record is measured against). Progress on an objective
 * is computed from the record on every read and never stored or reported (R19); its gaps are the work list. Unasked-
 * for findings arrive as proposals, and only a member's act adopts one, sets it aside with a recorded reason, or (a
 * machine too) opens a question from it (the discovery loop).
 *
 * A new module (K102): the one thing extracted is C-2.9's objective arm from `legacy-checks` (`checkProjectExtension`),
 * which is R1 here, run at the write as a registered promotion check and in the audit as a registered audit check, so
 * neither loses it (R22). Aspirations and goals are record documents of their own types (R26, `./doc.mjs`), written
 * through `promotion` like every other record object, with history, the gate and authored revisions; this module's
 * registered check holds their state machines (`held → retired`, `open → closed`) and who may write them.
 *
 * REACHED as `intentOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps` and returned to every later caller. At creation it registers its check with `promotion` (R39), its
 * audit check with `record-core` (R59) and its tables with purge (R24). `deps`:
 *   record, membership, promotion, entities   the modules it uses, through their factories on the same host unless a
 *                test passes its own.
 *   progressions through its factory on the same host, reached on first use (N179: the plane's own instance, built
 *                with the plane's `env`, is the one read), unless a test passes its own.
 *   inquiry      `dispose` (R17); aiRuns `open` (R18); retrieval `selectionCreate` (R17: inquiry's dispose takes a
 *                selection, K198); captureRequests `captureRequests`, a request's outcome (R14, K200). Each through its
 *                factory on the same host, reached lazily on first use, unless a test passes its own.
 *   now          the module's clock, an ISO instant (default: the wall clock). */

import { isMachineIdentity, normalizeType } from "../../checks/bio-checks.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { entitiesOf, gradeRank } from "../entities/index.mjs";
import { progressionsOf } from "../progressions/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { retrievalOf } from "../retrieval/index.mjs";
import { captureRequestsOf } from "../capture-requests/index.mjs";
import { INTENT_CHECKS, refusal } from "./checks.mjs";
import { INTENT_TABLES, migrateIntent } from "./schema.mjs";
import { ASPIRATION, GOAL, ASPIRATION_SCOPES, GRADES, TOKEN, quotable, q, parseFm, setField, removeBlock, setBlock,
         appendItem, appendHistory, readSection, setSection, appendSection, logEntry, deadEndsOf, aspirationDoc,
         goalDoc, pursuitId, CONDITION_KEY, conditionLines, conditionOf } from "./doc.mjs";

export { INTENT_CHECKS } from "./checks.mjs";
export { INTENT_SCHEMA, INTENT_TABLES } from "./schema.mjs";
export { ASPIRATION_SCOPES } from "./doc.mjs";

/** R16: the four acts on a proposal. */
export const TRIAGE_ACTS = Object.freeze(["adopt", "question", "defer", "dismiss"]);
/** R17 (Suggestions): the ageing interval's setting in record-core, and its default in days (C-10.1's staleness age). */
export const AGEING_SETTING = "intent_ageing_days", AGEING_DEFAULT_DAYS = 30;
/** R17: the plane actor the ageing act is taken under, and the machine sight it selects and disposes with (a scheduler's
 *  tick has no member behind it; membership R43 lets a machine credential see every bundle). */
export const PLANE_ACTOR = "plane:intent", PLANE_VIEWER = "class:daemon";
/** R6: the kind a gap is offered as (`queue`'s vocabulary, D-76). */
export const GAP_KIND = "objective-gap";
/** R16: a reason's bound, the restricted grammar's edge reason (a reason may travel into a document's front matter). */
export const REASON_MAX = 160;
/** N181: the bound on each read that grows with the record, published in each answer that it can cut, and read one
 *  past so a cut says so. MEASURE_MAX: the instances one condition measures (R4); WATCH_LIMIT_MAX: the captures one
 *  page of `watchSet` answers (R7), followed with its cursor; DEPARTURES_MAX: one project's departures in force (R10);
 *  GOALS_MAX, TRIAGED_MAX: the goals and triage acts one pursuit record answers (R14); SET_ASIDE_MAX: the proposals
 *  set aside that `proposals` lists beside the open ones, newest first (R16); SERVES_MAX: the subjects one `servesOf`
 *  call answers (R28). */
export const MEASURE_MAX = 1000, WATCH_LIMIT_MAX = 1000, DEPARTURES_MAX = 1000, GOALS_MAX = 200, TRIAGED_MAX = 1000,
             SET_ASIDE_MAX = 200, SERVES_MAX = 1000;

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
/* An empty author is a machine's: nothing a person did (R2's "an empty or machine author"). */
const machine = (who) => !str(who) || isMachineIdentity(str(who));
const second = (iso) => String(iso).replace(/\.\d+Z$/, "Z");
/* A member's own words kept whole in a body section: a line that would open a heading is set in by one space. */
const bodyText = (s) => String(s).trim().replace(/^#/gm, " #");

export class Intent {
  #sources = new Map();   // kind -> reader (R15)

  constructor({ storage, record, membership, promotion, entities, progressions, inquiry = null, aiRuns = null,
                retrieval = null, captureRequests = null, now = null } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.entities = entities;
    this.progressionsRef = progressions;
    this.inquiryRef = inquiry;
    this.aiRunsRef = aiRuns;
    this.retrievalRef = retrieval;
    this.captureRequests = captureRequests;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }
  #one(qs, ...a) { const r = this.#rows(qs, ...a); return r.length ? r[0] : null; }
  #lazy(ref) { return typeof ref === "function" ? ref() : ref; }
  /* N179: progressions as the host holds it, reached on first use, so the instance the plane builds with its `env`
     (progressions R16's configured clock) is the one read here, whichever module reached the host first. */
  get progressions() { return this.#lazy(this.progressionsRef); }
  #when() { return second(this.now()); }

  /** The module's tables (R24). */
  migrate() { migrateIntent(this.sql); }

  /* ===================================================================== *
   * READING THE RECORD
   * ===================================================================== */

  /* A held document: its head, text and front matter; null when the bundle is not held. */
  #doc(id) {
    if (typeof id !== "string" || !id) return null;
    const head = this.record.head(id);
    if (!head) return null;
    const f = this.record.readFile(id, "bundle.md");
    const text = f && typeof f.text === "string" ? f.text : null;
    return { id, head, text, fm: parseFm(text) || {}, type: normalizeType(head.type) };
  }

  /* R23: a project the viewer may see, or the one answer an absent project gets. A viewer who sees the project at
     existence only is told so (membership R77, C-70.1), before the absent answer. */
  #project(projectId, viewer) {
    const d = this.#doc(projectId);
    if (d && d.type === "project" && viewer !== null && viewer !== undefined) {
      const seen = this.membership.existenceAct(projectId, viewer);
      if (seen) return { refused: seen };
    }
    if (!d || d.type !== "project" || (viewer !== null && viewer !== undefined && !this.membership.inSight(projectId, viewer)))
      return { refused: refuseNoSuchProject("no project answers to that id here; one you cannot see is answered "
                                + "exactly as one that does not exist.", { project: typeof projectId === "string" ? projectId : null }) };
    return { doc: d };
  }

  /* An aspiration or goal the viewer may see (R8: absent and unseen are one answer). A project's aspiration is that
     project's material: it is seen only by a viewer who sees the project it names (R23, N199), whatever the
     aspiration's own bundle answers; the group's and a member's are seen by every member (R9). */
  #pursuit(id, type, viewer) {
    const d = this.#doc(id);
    const who = viewer ?? null;
    if (!d || d.type !== type || (who !== null && !this.membership.inSight(id, who))) return null;
    if (who !== null && type === ASPIRATION && d.fm.scope === "project" && this.#project(d.fm.owner, who).refused)
      return null;
    return d;
  }

  /* The member id behind an author (membership R76), null for a machine; the founder's session is `admin` (R9: an
     administrator's act, the founder included). */
  #memberOf(author) {
    if (str(author) === "admin") return "admin";
    return this.membership.positionalMember(str(author), str(author));
  }

  /* ===================================================================== *
   * THE WRITE (R2, R8–R11, R16, R26): every document intent writes goes through `promotion`, whose check runs this
   * module's own (below), so an act and a raw promotion meet one rule.
   * ===================================================================== */

  #create(id, type, text, author, extra = {}) {
    const fm = parseFm(text) || {};
    return this.promotion.promote({ bundleId: id, base: null, snapKey: `${this.#when().replace(/[-:]/g, "")}_${rand(4)}`,
      author, files: [{ path: "bundle.md", text }],
      meta: { object_type: type, title: fm.title, current_state: fm.current_state, created: fm.created,
              last_updated: fm.last_updated }, ...extra });
  }

  #revise(d, text, author, viewer, extra = {}) {
    const fm = parseFm(text) || {};
    const carried = this.record.livePaths(d.id).filter((p) => p !== "bundle.md").map((path) => {
      const f = this.record.readFile(d.id, path);
      return typeof f.text === "string" ? { path, text: f.text, sha256: f.sha256 }
                                        : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes };
    });
    const member = this.#memberOf(author);
    return this.promotion.promote({ bundleId: d.id, base: d.head.bundleSha,
      snapKey: `${this.#when().replace(/[-:]/g, "")}_${rand(4)}`, author,
      files: [{ path: "bundle.md", text }, ...carried],
      meta: { object_type: d.type, title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: fm.last_updated },
      actorIdentity: author, actorViewer: viewer ?? author, actorMemberId: member, ...extra });
  }

  /* ===================================================================== *
   * THE REGISTERED CHECK (promotion R39): R1, R2's grammar, R9's authority and R26's state machines, at the write.
   * ===================================================================== */

  check(c) {
    const type = c.promotedType;
    if (type === "project" && !c.replay) return this.#checkProject(c);
    if (type === ASPIRATION || type === GOAL) return this.#checkPursuit(c, type);
    return null;
  }

  #checkProject(c) {
    const fm = c.docFm || {};
    /* R1, C-2.9's objective arm (K6): moved from the catalogue, the id unchanged. */
    /* DEC-49 REGION is-objective-stated */
    if (typeof fm.objective !== "string" || fm.objective.trim() === "")
      return refusal("NO_OBJECTIVE", "this project's document states no objective, or an empty one (C-2.9). A project "
                     + "says what it is trying to achieve. Nothing was written.");
    /* END DEC-49 REGION is-objective-stated */
    /* R2's grammar, asked when the condition changes (Suggestions): a condition carried unchanged was judged when set. */
    const now = conditionOf(fm);
    const held = c.head ? conditionOf(parseFm(this.record.readFile(c.bundleId, "bundle.md")?.text) || {}) : null;
    if (now && JSON.stringify(now.condition) !== JSON.stringify(held ? held.condition : null))
      return this.#conditionRefusal(now.condition);
    return null;
  }

  #checkPursuit(c, type) {
    const fm = c.docFm || {};
    const author = c.author;
    const who = this.#memberOf(author);
    /* R20: an assistant proposes at any point and declares, revises, closes or retires at none. */
    const notMember = type === GOAL ? goalMachineRefusal(author, !!who) : aspirationMachineRefusal(author, !!who);
    if (notMember) return notMember;
    /* R26: the state machine. A creation starts at the first state; a revision moves only forward, once. */
    const [first, last] = type === GOAL ? ["open", "closed"] : ["held", "retired"];
    const from = c.head ? c.head.currentState : null, to = c.promotedState;
    const legal = c.head ? (to === from || (from === first && to === last)) : to === first;
    /* DEC-49 REGION is-pursuit-state-move */
    if (!legal)
      return refusal("PURSUIT_STATE_MOVE_UNDECLARED",
        `a ${type} ${c.head ? `at '${from}' moves only to '${last}', once` : `is created '${first}'`}, and this `
        + `promotion names '${String(to).slice(0, 40)}'. Nothing was written.`,
        { object_type: type, from, to: to ?? null });
    /* END DEC-49 REGION is-pursuit-state-move */
    const text = typeof c.bundleMd?.text === "string" ? c.bundleMd.text : "";
    if (!readSection(text, "Statement") || (type === GOAL && !readSection(text, "Bounds")))
      return refusePursuitUnstated(`a ${type} states ${type === GOAL ? "what it pursues and its bounds" : "what it holds to"}, `
                     + "in its Statement section. Nothing was written.");
    if (type === GOAL) {
      if (to === "closed" && from !== "closed" && !readSection(text, "Why It Closed"))
        return refuseNoReason("a goal is closed with the reason it closed. Nothing was written.");
      return null;
    }
    if (to === "retired" && from !== "retired" && !readSection(text, "Taught"))
      return refuseNoLesson("retiring an aspiration records what pursuing it taught. Nothing was written.");
    /* R9: who may write it, by its scope (its creation's, which a revision keeps). */
    const heldFm = c.head ? parseFm(this.record.readFile(c.bundleId, "bundle.md")?.text) || {} : fm;
    if (c.head && (fm.scope !== heldFm.scope || String(fm.owner ?? null) !== String(heldFm.owner ?? null)))
      return refuseBadScope("an aspiration keeps the scope and owner it was declared with. Nothing was written.");
    return this.#aspirationAuthority(heldFm.scope, heldFm.owner ?? null, author, c.pkg?.actorViewer ?? author);
  }

  /* R9: a member's aspiration is that member's; a project's, a member joined in it; the group's, an administrator's. */
  #aspirationAuthority(scope, owner, author, viewer) {
    const who = this.#memberOf(author);
    if (!ASPIRATION_SCOPES.includes(scope) || (scope !== "group" && !str(owner)) || (scope === "group" && owner != null))
      return refuseBadScope("an aspiration is the group's (naming no owner), a project's or a member's (naming "
                     + "which). Nothing was written.", { scope: scope ?? null, scopes: ASPIRATION_SCOPES });
    if (scope === "member" && str(owner) !== who)
      /* DEC-49 REGION is-aspiration-yours */
      return refusal("NOT_YOURS", "a member's aspiration is declared, revised and retired by that member alone. "
                     + "Nothing was written.", { owner });
      /* END DEC-49 REGION is-aspiration-yours */
    if (scope === "project") {
      const p = this.#project(owner, viewer);
      if (p.refused) return p.refused;
      const denied = this.membership.projectAuthority(owner, author, "joined", "aspiration");
      if (denied) return denied;
    }
    if (scope === "group" && !this.membership.isAdministrator(who))
      /* DEC-49 REGION is-group-aspiration-admin */
      return refusal("GROUP_ASPIRATION_NOT_ADMIN", "an aspiration the whole group holds is declared, revised and "
                     + "retired by an active administrator. Nothing was written.");
      /* END DEC-49 REGION is-group-aspiration-admin */
    return null;
  }

  /* R2: the condition's shape, then what it names, in R2's order; null when it is readable and names what exists. */
  #conditionRefusal(c) {
    const shaped = isObj(c) && TOKEN.test(str(c.progression)) && TOKEN.test(str(c.entity))
      && (c.relation == null || (typeof c.relation === "string" && this.entities.relationKinds().includes(c.relation)))
      && (c.filter == null || (isObj(c.filter) && Object.entries(c.filter).every(([k, v]) => /^[a-z][a-z0-9_]{0,39}$/.test(k)
                                                                                      && TOKEN.test(String(v)))))
      && isObj(c.required) && (c.required.stages == null || (Array.isArray(c.required.stages)
                                                               && c.required.stages.every((s) => TOKEN.test(String(s)))))
      && isObj(c.satisfied);
    /* DEC-49 REGION is-condition-shaped */
    if (!shaped)
      return refusal("CONDITION_UNREADABLE", "a condition is {progression, entity, relation?, filter?, required: {grade?, "
                     + "stages?}, satisfied: {share}}, each name a bare key or id. Nothing was written.");
    /* END DEC-49 REGION is-condition-shaped */
    const def = this.progressions.readProgression({ progressionKey: str(c.progression) });
    if (!def || def.ok === false || !def.found)
      return refuseNoSuchProgression("the condition names a flow the record has not declared. Nothing was written.",
                     { progression: str(c.progression) });
    if (!this.entities.has(str(c.entity)))
      return refuseNoSuchEntity("the condition names an entity the record does not hold. Nothing was written.",
                     { entity: str(c.entity) });
    const declared = new Set(def.stages.map((s) => s.stage_key));
    const bad = (c.required.stages || []).map(String).filter((s) => !declared.has(s));
    /* DEC-49 REGION is-condition-stage */
    if (bad.length)
      return refusal("BAD_STAGE", `the flow '${str(c.progression)}' declares no stage ${bad.join(", ")}. Nothing was written.`,
                     { stages: bad, declared: [...declared] });
    /* END DEC-49 REGION is-condition-stage */
    /* DEC-49 REGION is-condition-grade */
    if (c.required.grade != null && !GRADES.includes(c.required.grade))
      return refusal("CONDITION_BAD_GRADE", "a required grade is one of A, B, C, D. Nothing was written.", { grades: GRADES });
    /* END DEC-49 REGION is-condition-grade */
    const share = c.satisfied.share;
    /* DEC-49 REGION is-condition-share */
    if (!Number.isInteger(share) || share < 1 || share > 100)
      return refusal("BAD_SHARE", "a share is a whole number from 1 to 100. Nothing was written.");
    /* END DEC-49 REGION is-condition-share */
    return null;
  }

  /** record-core R59: C-2.9's objective arm in the audit, beside the catalogue, over the same image (R22). */
  auditCheck(image) {
    const md = image && image.files ? image.files.get("bundle.md") : null;
    const fm = parseFm(typeof md === "string" ? md : null);
    if (!fm || fm.object_type !== "project") return [];
    if (typeof fm.objective !== "string" || fm.objective.trim() === "")
      return [{ check: INTENT_CHECKS.NO_OBJECTIVE.check, code: "NO_OBJECTIVE", severity: "error",
                message: "objective is missing or empty" }];
    return [];
  }

  /* ===================================================================== *
   * THE OBJECTIVE (R2–R7)
   * ===================================================================== */

  /** R2: set, replace or (with a null condition) remove a project's satisfaction condition, as a new revision of the
   *  project's document through `promotion`; the earlier revision stays in history. */
  setCondition({ project, condition, author, viewer = null } = {}) {
    /* DEC-49 REGION is-condition-member */
    if (machine(author))
      return refusal("MACHINE_CANNOT_SET_OBJECTIVE", "setting or changing an objective's measure is a named member's act "
                     + "(DEC-24 rule 2). Nothing was written.");
    /* END DEC-49 REGION is-condition-member */
    const p = this.#project(project, viewer);
    if (p.refused) return p.refused;
    const denied = this.membership.projectAuthority(project, author, "joined", "setCondition");
    if (denied) return denied;
    const c = condition == null ? null
      : { ...condition, required: isObj(condition.required) ? { grade: condition.required.grade ?? null,
                                                               stages: condition.required.stages ?? [] } : condition.required,
          relation: condition.relation ?? null, filter: condition.filter ?? null };
    if (c) { const bad = this.#conditionRefusal(c); if (bad) return bad; }
    const at = this.#when();
    let text = removeBlock(p.doc.text, CONDITION_KEY);
    if (c) text = setBlock(text, CONDITION_KEY, conditionLines(c, str(author), at));
    text = setField(text, "last_updated", q(at));
    text = logEntry(text, at, c ? "Objective condition set" : "Objective condition removed", str(author),
                    c ? `the objective's satisfaction condition is ${JSON.stringify(c)}.` : "the objective states no condition.");
    const r = this.#revise(p.doc, text, str(author), viewer);
    if (!r.ok) return r;
    return { ok: true, project, condition: c, set_by: str(author), at, bundleSha: r.bundleSha };
  }

  /* The matched instances of a condition (R4), each assembled by progressions and judged; derived, never stored. */
  #measure(cond, viewer) {
    const key = str(cond.progression), anchor = str(cond.entity);
    const related = new Set([anchor]);
    if (cond.relation) {
      const e = this.entities.readEntity({ entityId: anchor });
      for (const r of (e && e.found && e.entity && e.entity.relations) || []) {
        if (r.relation !== cond.relation || r.withdrawn) continue;
        /* X stands in the relation to the condition's entity: an edge from X to it; `overlaps` reads both ways. */
        if (r.to_entity === anchor && r.from_entity) related.add(r.from_entity);
        else if (cond.relation === "overlaps" && r.from_entity === anchor && r.to_entity) related.add(r.to_entity);
      }
    }
    /* N181: the instances of the related entities only, at most MEASURE_MAX of them, read one past so a cut says so. */
    const rows = this.#rows(`SELECT DISTINCT entity_id FROM progression_instances WHERE progression_key=?
                               AND entity_id IN (SELECT value FROM json_each(?)) ORDER BY entity_id LIMIT ?`,
                            key, JSON.stringify([...related]), MEASURE_MAX + 1);
    const truncated = rows.length > MEASURE_MAX;
    const threaded = rows.slice(0, MEASURE_MAX).map((r) => r.entity_id);
    const need = cond.required || {};
    const stages = (need.stages || []).map(String);
    const matched = [], meeting = [], short = [], undetermined = [];
    for (const eid of threaded) {
      const inst = this.progressions.readInstance({ progressionKey: key, entityId: eid, viewer });
      if (!inst || inst.ok === false || !inst.found) continue;
      /* The filter: what the record can evaluate narrows; what it cannot makes the instance undetermined (R4). */
      let unevaluable = null, passes = true;
      for (const [k, v] of Object.entries(cond.filter || {})) {
        if (k === "entity_kind") { if (!inst.entity || inst.entity.kind !== String(v)) passes = false; }
        else unevaluable = k;
      }
      if (!passes) continue;
      const row = { entity_id: eid, entity_label: inst.entity ? inst.entity.label : null,
                    grade: inst.grade ?? null, grade_determined: inst.grade_determined === true,
                    definition_version: inst.definition_version };
      matched.push(row);
      if (unevaluable) {
        undetermined.push({ ...row, why: `the record cannot evaluate the filter '${unevaluable}' on this instance` });
        continue;
      }
      const placed = new Set((inst.stages || []).filter((s) => s.present).map((s) => s.stage_key));
      const missing = stages.filter((s) => !placed.has(s));
      /* R4 (K200): a missing required stage is short whatever the grade; the grade decides only once the stages are in. */
      if (missing.length) {
        short.push({ ...row, why: { stages_missing: missing }, documents: this.#documents(inst) });
        continue;
      }
      if (need.grade == null) { meeting.push(row); continue; }
      if (!row.grade_determined || gradeRank[row.grade] === undefined) {
        undetermined.push({ ...row, why: "the instance's grade is undetermined (fewer than two stages placed, or a "
                                         + "stage's grade unknown), so whether it reaches the required grade is not known" });
        continue;
      }
      if (gradeRank[row.grade] >= gradeRank[need.grade]) { meeting.push(row); continue; }
      const weakest = (inst.chain || []).find((l) => l.grade === inst.grade) || null;
      short.push({ ...row, why: { grade_reached: inst.grade, grade_required: need.grade, weakest_link: weakest },
                   documents: this.#documents(inst) });
    }
    return { key, related: [...related].sort(), matched, meeting, short, undetermined, truncated };
  }

  /* R5: the documents placed at each stage, with bundle ids the viewer may not see withheld (progressions R13). */
  #documents(inst) {
    return (inst.stages || []).filter((s) => s.present)
      .map((s) => ({ stage_key: s.stage_key, documents: (s.documents || []).map((d) => ({ capture_sha: d.capture_sha,
                                                                                       bundle_id: d.bundle_id ?? null,
                                                                                       grade: d.grade ?? null })) }));
  }

  /** R3–R5: progress on a project's objective, derived on read against its condition and never stored. */
  progress({ project, viewer = null } = {}) {
    const p = this.#project(project, viewer);
    if (p.refused) return p.refused;
    const objective = typeof p.doc.fm.objective === "string" ? p.doc.fm.objective : null;
    const held = conditionOf(p.doc.fm);
    const computed_at = this.#when();
    if (!held)
      return { ok: true, project, objective, condition: null, computable: false,
               why: "progress cannot be computed: the objective states no condition the record can be measured against",
               matched: null, meeting: null, short: null, undetermined: null, satisfied: null, computed_at };
    const bad = this.#conditionRefusal(held.condition);
    if (bad)
      return { ok: true, project, objective, condition: held.condition, computable: false,
               why: `progress cannot be computed: the condition no longer reads against the record (${bad.reason})`,
               matched: null, meeting: null, short: null, undetermined: null, satisfied: null, computed_at };
    const m = this.#measure(held.condition, viewer);
    const n = m.matched.length, k = m.meeting.length, u = m.undetermined.length, share = held.condition.satisfied.share;
    /* R4: reached, cannot be reached even if every undetermined instance met it, or not yet decidable. A measure cut at
       its bound (N181) decides nothing: the instances past the cut could move the share either way. */
    const satisfied = n === 0 || m.truncated ? null
      : k * 100 >= share * n ? true : (k + u) * 100 < share * n ? false : null;
    const why = n === 0 ? "no instance matches the condition, so no share of them can be taken"
      : m.truncated ? `more than ${MEASURE_MAX} instances match the condition and one read measures that many, so no `
                    + "share of them is taken" : null;
    return { ok: true, project, objective, condition: held.condition, set_by: held.set_by, set_at: held.set_at,
             computable: true, matched: n, meeting: k, short: m.short, undetermined: m.undetermined, satisfied,
             ...(why ? { satisfied_why: why } : {}), limit: MEASURE_MAX, truncated: m.truncated,
             instances: { meeting: m.meeting }, computed_at };
  }

  /** R6: one gap per short instance, each a proposal of kind `objective-gap`. */
  gaps({ project, viewer = null } = {}) {
    const pr = this.progress({ project, viewer });
    if (pr.ok === false) return pr;
    if (!pr.computable) return { ok: true, project, condition: pr.condition, gaps: [], why: pr.why };
    return { ok: true, project, condition: pr.condition, gaps: pr.short.map((s) => this.#gap(project, pr.condition, s)),
             limit: pr.limit, truncated: pr.truncated };
  }

  #gap(project, cond, s) {
    const key = `${project}::${cond.progression}::${s.entity_id}`;
    const basis = s.why.stages_missing
      ? { project, progression: cond.progression, entity: s.entity_id, stages_missing: s.why.stages_missing,
          says: `the records the stages ${s.why.stages_missing.join(", ")} would hold are to be requested` }
      : { project, progression: cond.progression, entity: s.entity_id, grade_reached: s.why.grade_reached,
          grade_required: s.why.grade_required, link: s.why.weakest_link,
          says: "the weakest link of this instance is to be strengthened" };
    return { key: `intent::${key}`, source: "intent", kind: GAP_KIND, grade: s.grade_determined ? s.grade : null, basis,
             instances: [{ entity_id: s.entity_id, entity_label: s.entity_label, documents: s.documents }],
             surfaced_by: "machine" };
  }

  /** R7: what the condition reads, so `monitoring` watches exactly those. The captures come a page at a time (N181):
   *  at most `limit` (default and ceiling WATCH_LIMIT_MAX), those after `after` in capture order, with `cursor` the
   *  last one answered and `truncated` whether more follow, so a watcher follows the whole set with the cursor. */
  watchSet({ project, after = null, limit = null } = {}) {
    const cap = Number.isInteger(limit) && limit >= 1 && limit <= WATCH_LIMIT_MAX ? limit : WATCH_LIMIT_MAX;
    const none = { entities: [], progressions: [], captures: [], limit: cap, truncated: false, cursor: null };
    const d = this.#doc(project);
    const held = d && d.type === "project" ? conditionOf(d.fm) : null;
    if (!held || this.#conditionRefusal(held.condition)) return none;
    const m = this.#measure(held.condition, null);
    const rows = this.#rows(`SELECT DISTINCT capture_sha FROM progression_instances WHERE progression_key=?
                               AND entity_id IN (SELECT value FROM json_each(?)) AND capture_sha > ?
                             ORDER BY capture_sha LIMIT ?`,
                            m.key, JSON.stringify(m.matched.map((r) => r.entity_id)), typeof after === "string" ? after : "",
                            cap + 1);
    const truncated = rows.length > cap;
    const captures = rows.slice(0, cap).map((r) => r.capture_sha);
    return { entities: m.related, progressions: [m.key], captures, limit: cap, truncated,
             cursor: truncated ? captures[captures.length - 1] : null, measure_truncated: m.truncated };
  }

  /* ===================================================================== *
   * WHAT A SUBJECT SERVES (R28), for `scheduler`'s rank (its R10): read as the plane, orders work only, never shown.
   * ===================================================================== */

  /** R28: for each named address, bundle and request (at most SERVES_MAX in all, the first in the order given, with
   *  `truncated`), the open gaps it serves in any project and the held aspirations in force for its project that it
   *  serves (member aspirations aside, §12.1). A subject serving nothing, or unknown, answers empty lists. Writes
   *  nothing; never throws. */
  servesOf({ addresses = [], bundles = [], requests = [] } = {}) {
    const named = [];
    for (const [kind, list] of [["address", addresses], ["bundle", bundles], ["request", requests]])
      for (const id of Array.isArray(list) ? list : []) named.push({ kind, id: typeof id === "string" ? id : null });
    const truncated = named.length > SERVES_MAX;
    const subjects = named.slice(0, SERVES_MAX);
    const empty = (x) => ({ kind: x.kind, id: x.id, gaps: [], aspirations: [] });
    let ctx;
    try { ctx = this.#servesContext(); } catch { return { ok: true, serves: subjects.map(empty), truncated }; }
    const serves = subjects.map((x) => {
      try {
        if (!x.id) return empty(x);
        const held = x.kind === "bundle" ? [x.id] : x.kind === "address" ? this.#bundlesAt(x.id) : ctx.requestBundles(x.id);
        const gaps = new Set(), aspirations = new Set();
        for (const b of held) {
          for (const g of ctx.gapsOf(b)) gaps.add(g);
          for (const a of ctx.aspirationsOf(b)) aspirations.add(a);
        }
        return { kind: x.kind, id: x.id, gaps: [...gaps].sort(), aspirations: [...aspirations].sort() };
      } catch { return empty(x); }
    });
    return { ok: true, serves, truncated };
  }

  /* R28: what every subject in one call is measured against, gathered once under the plane's sight: the open gaps by
     the bundles documenting their short instances, and each held group or project aspiration with what it names. */
  #servesContext() {
    const gapsByBundle = new Map();
    const all = [];
    for (const pid of this.#conditioned(PLANE_VIEWER)) {
      const g = this.gaps({ project: pid, viewer: PLANE_VIEWER });
      if (g.ok) all.push(...g.gaps);
    }
    const decided = this.#decidedAmong(all.map((g) => g.key));
    for (const g of all) {
      if (decided.has(g.key)) continue;
      for (const inst of g.instances || [])
        for (const stage of inst.documents || [])
          for (const d of stage.documents || [])
            if (d.bundle_id) {
              if (!gapsByBundle.has(d.bundle_id)) gapsByBundle.set(d.bundle_id, new Set());
              gapsByBundle.get(d.bundle_id).add(g.key);
            }
    }
    const held = this.#aspirations(PLANE_VIEWER)
      .filter((a) => a.state === "held" && (a.scope === "group" || a.scope === "project"));
    const departures = new Map(), concerned = new Map(), requestsRead = { rows: null };
    const departed = (project) => {
      if (!departures.has(project)) departures.set(project, this.#departures(project).latest);
      return departures.get(project);
    };
    /* the bundles a named entity's documents are filed in (entities R15), once per entity per call */
    const concerns = (entityId) => {
      if (!concerned.has(entityId)) {
        const r = this.entities.concerns({ entityId, limit: 5000, viewer: PLANE_VIEWER });
        concerned.set(entityId, new Set(((r && r.documents) || []).map((d) => d.bundle_id).filter(Boolean)));
      }
      return concerned.get(entityId);
    };
    const placedIn = (bundleId, keys) => keys.length > 0 && !!this.#one(
      `SELECT 1 AS x FROM progression_instances WHERE bundle_id=? AND progression_key IN (SELECT value FROM json_each(?))
       LIMIT 1`, bundleId, JSON.stringify(keys));
    return {
      gapsOf: (bundleId) => gapsByBundle.get(bundleId) || [],
      /* R12's in force for the bundle's project (the group's less its departures, and the project's own); a bundle in
         no project is under the group's alone */
      aspirationsOf: (bundleId) => {
        const project = this.record.bundleInfo(bundleId)?.project ?? null;
        const gone = project ? departed(project) : new Map();
        return held.filter((a) => (a.scope === "group" ? !gone.has(a.id) : project !== null && a.owner === project))
          .filter((a) => placedIn(bundleId, a.progressions) || a.entities.some((e) => concerns(e).has(bundleId)))
          .map((a) => a.id);
      },
      /* a request serves what its address and its target question serve (capture-requests R23, R28) */
      requestBundles: (request) => {
        if (requestsRead.rows === null) {
          const read = this.#lazy(this.captureRequests).captureRequests({ viewer: PLANE_VIEWER, state: "requested",
                                                                          limit: 1000 });
          requestsRead.rows = new Map(((read && read.requests) || []).map((r) => [r.request, r]));
        }
        const row = requestsRead.rows.get(request);
        const b = this.#lazy(this.captureRequests).bundlesOf?.(request) ?? null;
        const target = (b && b.target) || (row && row.target) || null;
        return [...(row && row.address ? this.#bundlesAt(row.address) : []), ...(target ? [target] : [])];
      },
    };
  }

  /* R28: the bundles the captures taken from an address are filed in (provenance R48's read contract), at most
     SERVES_MAX of them. */
  #bundlesAt(address) {
    return this.#rows(`SELECT DISTINCT r.bundle_id FROM captured_locators c JOIN register r ON r.capture_sha = c.capture_sha
                        WHERE c.address_norm = ? OR c.address = ? ORDER BY r.bundle_id LIMIT ?`,
                      address, address, SERVES_MAX).map((r) => r.bundle_id).filter(Boolean);
  }

  /* ===================================================================== *
   * GOALS (R8, R26)
   * ===================================================================== */

  /** R8: declare a goal, bounded, optionally under an aspiration. */
  declareGoal({ statement, bounds, aspiration = null, author, viewer = null } = {}) {
    const byMachine = goalMachineRefusal(author);
    if (byMachine) return byMachine;
    if (!str(statement) || !str(bounds))
      return refusePursuitUnstated("a goal states what it pursues and what bounds it. Nothing was written.");
    if (aspiration != null && aspiration !== "") {
      const a = this.#pursuit(aspiration, ASPIRATION, viewer ?? author);
      if (!a) return refuseNoSuchAspiration("no aspiration answers to that id here. Nothing was written.",
                             { aspiration });
      if (a.head.currentState === "retired")
        return refusePursuitEnded("a goal is not opened under a retired aspiration. Nothing was written.", { aspiration });
    }
    const at = this.#when();
    const id = pursuitId(this.record.allocId("GOAL", at.slice(0, 4)).id, GOAL);
    const r = this.#create(id, GOAL, goalDoc({ id, statement, bounds, aspiration: aspiration || null, author: str(author), at }),
                           str(author));
    if (!r.ok) return r;
    return { ok: true, goal: id, state: "open", aspiration: aspiration || null, author: str(author), at };
  }

  /** R8: record that a project's objective serves a goal, as the author's dated claim; the author has joined it. */
  linkObjective({ goal, project, author, viewer = null } = {}) {
    const byMachine = goalMachineRefusal(author);
    if (byMachine) return byMachine;
    const g = this.#pursuit(goal, GOAL, viewer ?? author);
    if (!g) return refuseNoSuchGoal("no goal answers to that id here. Nothing was written.", { goal: goal ?? null });
    if (g.head.currentState === "closed")
      return refusePursuitEnded("a closed goal takes no new objective. Nothing was written.", { goal });
    const p = this.#project(project, viewer ?? author);
    if (p.refused) return p.refused;
    const denied = this.membership.projectAuthority(project, author, "joined", "linkObjective");
    if (denied) return denied;
    if ((Array.isArray(g.fm.objectives) ? g.fm.objectives : []).some((o) => isObj(o) && o.project === project))
      return { ok: true, goal, project, already: true };
    const at = this.#when();
    let text = appendItem(g.text, "objectives", { project, by: TOKEN.test(str(author)) ? str(author) : q(author), at: q(at) });
    text = setField(text, "last_updated", q(at));
    text = logEntry(text, at, "Objective linked", str(author), `${project}'s objective serves this goal.`);
    const r = this.#revise(g, text, str(author), viewer);
    if (!r.ok) return r;
    return { ok: true, goal, project, by: str(author), at };
  }

  /** R8: close a goal with its reason; it stays readable with its objectives and reason. */
  closeGoal({ goal, reason, author, viewer = null } = {}) {
    const byMachine = goalMachineRefusal(author);
    if (byMachine) return byMachine;
    const g = this.#pursuit(goal, GOAL, viewer ?? author);
    if (!g) return refuseNoSuchGoal("no goal answers to that id here. Nothing was written.", { goal: goal ?? null });
    if (!str(reason)) return refuseNoReason("a goal is closed with the reason it closed. Nothing was written.");
    if (g.head.currentState === "closed")
      return refusePursuitEnded("this goal is already closed. Nothing was written.", { goal });
    const at = this.#when();
    let text = appendHistory(g.text, { at, from: "open", to: "closed", blurb: "closed; the reason is in its document",
                                       author: str(author) });
    text = setField(setField(setField(text, "prior_state", "open"), "current_state", "closed"), "last_updated", q(at));
    text = setSection(text, "Why It Closed", bodyText(reason));
    text = logEntry(text, at, "Closed", str(author), "open to closed.");
    const r = this.#revise(g, text, str(author), viewer);
    if (!r.ok) return r;
    return { ok: true, goal, state: "closed", reason: str(reason), author: str(author), at };
  }

  /** R8: a goal as the record holds it: its statement, bounds, aspiration, the objectives linked (each a project the
   *  viewer may see), its state and, once closed, its reason. No progress figure: its objectives carry theirs. */
  readGoal({ goal, viewer = null } = {}) {
    const g = this.#pursuit(goal, GOAL, viewer);
    if (!g) return refuseNoSuchGoal("no goal answers to that id here.", { goal: goal ?? null });
    return { ok: true, goal: this.#goalView(g, viewer) };
  }

  #goalView(g, viewer) {
    const objectives = (Array.isArray(g.fm.objectives) ? g.fm.objectives : []).filter(isObj)
      .filter((o) => viewer == null || this.membership.inSight(o.project, viewer))
      .map((o) => ({ project: o.project, by: o.by ?? null, at: o.at ?? null }));
    /* R23 (N199): the aspiration pointer is shown only to a viewer who may see that aspiration; to any other it reads
       as a goal opened under none, the answer an absent one gets. */
    const asp = typeof g.fm.aspiration === "string" && g.fm.aspiration ? g.fm.aspiration : null;
    const aspiration = asp && (viewer == null || this.#pursuit(asp, ASPIRATION, viewer)) ? asp : null;
    return { id: g.id, statement: readSection(g.text, "Statement"), bounds: readSection(g.text, "Bounds"),
             aspiration, objectives, state: g.head.currentState,
             closed_reason: g.head.currentState === "closed" ? readSection(g.text, "Why It Closed") : null,
             author: g.fm.author ?? null, at: g.fm.created ?? null };
  }

  /* ===================================================================== *
   * ASPIRATIONS (R9–R14, R26)
   * ===================================================================== */

  /** R9: declare an aspiration of the group, a project or a member. */
  declareAspiration({ scope, owner = null, statement, entities = [], progressions = [], author, viewer = null } = {}) {
    const byMachine = aspirationMachineRefusal(author);
    if (byMachine) return byMachine;
    const own = scope === "group" ? null : str(owner) || null;
    if (!ASPIRATION_SCOPES.includes(scope) || (scope !== "group" && !own) || (scope === "group" && str(owner)))
      return refuseBadScope("an aspiration is the group's (naming no owner), a project's or a member's (naming "
                     + "which). Nothing was written.", { scope: scope ?? null, scopes: ASPIRATION_SCOPES });
    if (!str(statement)) return refusePursuitUnstated("an aspiration states what it holds to. Nothing was written.");
    const denied = this.#aspirationAuthority(scope, own, author, viewer ?? author);
    if (denied) return denied;
    const ents = (Array.isArray(entities) ? entities : []).map(str).filter(Boolean);
    const progs = (Array.isArray(progressions) ? progressions : []).map(str).filter(Boolean);
    const badEnt = ents.find((e) => !TOKEN.test(e) || !this.entities.has(e));
    if (badEnt) return refuseNoSuchEntity("the aspiration names an entity the record does not hold. Nothing was written.",
                               { entity: badEnt });
    const badProg = progs.find((k) => { const d = TOKEN.test(k) && this.progressions.readProgression({ progressionKey: k });
                                        return !d || d.ok === false || !d.found; });
    if (badProg) return refuseNoSuchProgression("the aspiration names a flow the record has not declared. Nothing "
                                + "was written.", { progression: badProg });
    const at = this.#when();
    const id = pursuitId(this.record.allocId("ASP", at.slice(0, 4)).id, ASPIRATION);
    const r = this.#create(id, ASPIRATION, aspirationDoc({ id, scope, owner: own, statement, entities: ents,
                                                         progressions: progs, author: str(author), at }), str(author),
                           { actorViewer: viewer ?? str(author) });
    if (!r.ok) return r;
    return { ok: true, aspiration: id, scope, owner: own, state: "held", author: str(author), at };
  }

  /** R10: a project records its departure from a held group aspiration, with a reason. */
  departFrom({ project, aspiration, reason, author, viewer = null } = {}) {
    const byMachine = aspirationMachineRefusal(author);
    if (byMachine) return byMachine;
    const p = this.#project(project, viewer ?? author);
    if (p.refused) return p.refused;
    const a = this.#pursuit(aspiration, ASPIRATION, viewer ?? author);
    if (!a) return refuseNoSuchAspiration("no aspiration answers to that id here. Nothing was written.",
                           { aspiration: aspiration ?? null });
    if (a.fm.scope !== "group")
      return refuseBadScope("a project departs only from an aspiration the whole group holds; a project's or a "
                     + "member's own is not held by other projects. Nothing was written.", { scope: a.fm.scope ?? null });
    if (a.head.currentState === "retired")
      return refusePursuitEnded("a retired aspiration is held by no project, so there is nothing to depart from. "
                     + "Nothing was written.", { aspiration });
    if (!str(reason)) return refuseNoReason("a departure from the group's aspiration records why. Nothing was written.");
    const denied = this.membership.projectAuthority(project, author, "joined", "departFrom");
    if (denied) return denied;
    const at = this.#when();
    this.record.transact(() => this.sql.exec(
      `INSERT INTO intent_departures (project_id, aspiration_id, reason, author, at) VALUES (?,?,?,?,?)`,
      project, aspiration, str(reason).slice(0, 4000), str(author), at));
    return { ok: true, project, aspiration, reason: str(reason), author: str(author), at, notable: true };
  }

  /** R11: a dead end, appended to the aspiration's pursuit record, dated and authored, never removed. */
  recordDeadEnd({ aspiration, note, author, viewer = null } = {}) {
    const byMachine = aspirationMachineRefusal(author);
    if (byMachine) return byMachine;
    const a = this.#pursuit(aspiration, ASPIRATION, viewer ?? author);
    if (!a) return refuseNoSuchAspiration("no aspiration answers to that id here. Nothing was written.",
                           { aspiration: aspiration ?? null });
    /* DEC-49 REGION is-dead-end-noted */
    if (!str(note))
      return refusal("NO_NOTE", "a dead end records what was tried and why it went nowhere. Nothing was written.");
    /* END DEC-49 REGION is-dead-end-noted */
    const denied = this.#aspirationAuthority(a.fm.scope, a.fm.owner ?? null, author, viewer ?? author);
    if (denied) return denied;
    const at = this.#when();
    let text = appendSection(a.text, "Dead Ends",
                             `### ${at} | ${str(author)}\n${bodyText(note)}`);
    text = setField(text, "last_updated", q(at));
    text = logEntry(text, at, "Dead end recorded", str(author), "a dead end was appended to the pursuit record.");
    const r = this.#revise(a, text, str(author), viewer);
    if (!r.ok) return r;
    return { ok: true, aspiration, note: str(note), author: str(author), at };
  }

  /** R11: retire an aspiration with what pursuing it taught; it and its pursuit record stay readable. */
  retireAspiration({ aspiration, taught, author, viewer = null } = {}) {
    const byMachine = aspirationMachineRefusal(author);
    if (byMachine) return byMachine;
    const a = this.#pursuit(aspiration, ASPIRATION, viewer ?? author);
    if (!a) return refuseNoSuchAspiration("no aspiration answers to that id here. Nothing was written.",
                           { aspiration: aspiration ?? null });
    if (a.head.currentState === "retired")
      return refusePursuitEnded("this aspiration is already retired. Nothing was written.", { aspiration });
    if (!str(taught))
      return refuseNoLesson("retiring an aspiration records what pursuing it taught. Nothing was written.");
    const denied = this.#aspirationAuthority(a.fm.scope, a.fm.owner ?? null, author, viewer ?? author);
    if (denied) return denied;
    const at = this.#when();
    let text = appendHistory(a.text, { at, from: "held", to: "retired", blurb: "retired; what it taught is in its document",
                                       author: str(author) });
    text = setField(setField(setField(text, "prior_state", "held"), "current_state", "retired"), "last_updated", q(at));
    text = setSection(text, "Taught", bodyText(taught));
    text = logEntry(text, at, "Retired", str(author), "held to retired.");
    const r = this.#revise(a, text, str(author), viewer);
    if (!r.ok) return r;
    return { ok: true, aspiration, state: "retired", taught: str(taught), author: str(author), at };
  }

  /* Every aspiration document the viewer may see, as R12's terms read it. */
  #aspirations(viewer) {
    const out = [];
    let after = "";
    for (;;) {
      const page = this.record.listByType({ type: ASPIRATION, after, limit: 200 });
      for (const id of page.ids) {
        const a = this.#pursuit(id, ASPIRATION, viewer);
        if (a) out.push(this.#aspirationView(a));
      }
      if (page.ids.length < 200 || !page.cursor) break;
      after = page.cursor;
    }
    return out;
  }

  #aspirationView(a) {
    const list = (v) => (Array.isArray(v) ? v.map(String).filter((x) => x !== "") : []);
    return { id: a.id, scope: a.fm.scope ?? null, owner: a.fm.owner ?? null, statement: readSection(a.text, "Statement"),
             entities: list(a.fm.entities), progressions: list(a.fm.progressions), state: a.head.currentState,
             author: a.fm.author ?? null, at: a.fm.created ?? null };
  }

  /* R10: the departure in force for each (project, aspiration): the latest recorded, at most DEPARTURES_MAX of them
     (N181), read one past so a cut says so. */
  #departures(project) {
    const rows = this.#rows(`SELECT d.aspiration_id, d.reason, d.author, d.at FROM intent_departures d
                              WHERE d.project_id=? AND d.seq = (SELECT MAX(x.seq) FROM intent_departures x
                                                                  WHERE x.project_id=d.project_id
                                                                    AND x.aspiration_id=d.aspiration_id)
                              ORDER BY d.seq LIMIT ?`, project, DEPARTURES_MAX + 1);
    const latest = new Map();
    for (const r of rows.slice(0, DEPARTURES_MAX))
      latest.set(r.aspiration_id, { aspiration: r.aspiration_id, reason: r.reason, author: r.author, at: r.at, notable: true });
    return { latest, truncated: rows.length > DEPARTURES_MAX };
  }

  /** R12: the aspirations in force for a project, a member, or (neither named) the group, each with its scope. The
   *  group's less any departure, each departure listed with its reason; no precedence is stated or implied. */
  aspirationsFor({ project = null, member = null, viewer = null } = {}) {
    if (project != null && project !== "") {
      const p = this.#project(project, viewer);
      if (p.refused) return p.refused;
    }
    const held = this.#aspirations(viewer).filter((a) => a.state === "held");
    const dep = project ? this.#departures(project) : { latest: new Map(), truncated: false };
    const departed = dep.latest;
    const group = held.filter((a) => a.scope === "group" && !departed.has(a.id));
    const own = project ? held.filter((a) => a.scope === "project" && a.owner === project) : [];
    const mine = member ? held.filter((a) => a.scope === "member" && a.owner === str(member)) : [];
    const departures = [...departed.values()].filter((d) => held.some((a) => a.id === d.aspiration));
    return { ok: true, project: project || null, member: member || null, aspirations: [...group, ...own, ...mine],
             departures, departures_limit: DEPARTURES_MAX, departures_truncated: dep.truncated, precedence: null,
             says: "these are held side by side; the record states no order among them and resolves nothing between them" };
  }

  /** R13: each pair of held aspirations naming a common entity or progression, with what they share. */
  contacts({ viewer = null } = {}) {
    const held = this.#aspirations(viewer).filter((a) => a.state === "held");
    const pairs = [];
    for (let i = 0; i < held.length; i++)
      for (let j = i + 1; j < held.length; j++) {
        const a = held[i], b = held[j];
        const entities = a.entities.filter((e) => b.entities.includes(e));
        const progressions = a.progressions.filter((k) => b.progressions.includes(k));
        if (entities.length || progressions.length)
          pairs.push({ a: a.id, b: b.id, shared: { entities, progressions },
                       says: "both name what is listed; the record does not say whether they agree" });
      }
    return { ok: true, contacts: pairs };
  }

  /** R14: an aspiration's pursuit record: the goals opened under it and their objectives, the proposals triaged under
   *  them with each act and reason, the capture requests named in them with their outcome, and the dead ends. */
  pursuitOf({ aspiration, viewer = null } = {}) {
    const a = this.#pursuit(aspiration, ASPIRATION, viewer);
    if (!a) return refuseNoSuchAspiration("no aspiration answers to that id here.", { aspiration: aspiration ?? null });
    /* N181: at most GOALS_MAX goals, walked a page at a time and read one past so a cut says so. */
    const goals = [];
    let after = "", goalsSeen = 0;
    for (;;) {
      const page = this.record.listByType({ type: GOAL, after, limit: 200 });
      for (const id of page.ids) {
        const g = this.#pursuit(id, GOAL, viewer);
        if (g && g.fm.aspiration === aspiration) { goalsSeen += 1; if (goals.length < GOALS_MAX) goals.push(this.#goalView(g, viewer)); }
        if (goalsSeen > GOALS_MAX) break;
      }
      if (goalsSeen > GOALS_MAX || page.ids.length < 200 || !page.cursor) break;
      after = page.cursor;
    }
    const goals_truncated = goalsSeen > GOALS_MAX;
    /* N181: the triage acts under those goals' projects, oldest first, at most TRIAGED_MAX, read one past. */
    const projects = [...new Set(goals.flatMap((g) => g.objectives.map((o) => o.project)))];
    const acts = projects.length
      ? this.#rows(`SELECT proposal_key, source, kind, act, project_id, inquiry_id, reason, grade, basis_json, author, at
                      FROM intent_triage WHERE project_id IN (SELECT value FROM json_each(?)) ORDER BY seq LIMIT ?`,
                   JSON.stringify(projects), TRIAGED_MAX + 1)
      : [];
    const triaged_truncated = acts.length > TRIAGED_MAX;
    const triaged = acts.slice(0, TRIAGED_MAX)
      .map((r) => ({ proposal: r.proposal_key, source: r.source, kind: r.kind, act: r.act, project: r.project_id,
                     inquiry: r.inquiry_id, reason: r.reason, grade: r.grade, basis: safeJson(r.basis_json),
                     author: r.author, at: r.at }));
    const named = [...new Set(triaged.flatMap((t) => captureRequestsNamed(t.basis)))];
    let held = new Map(), readCut = false;
    if (named.length) {
      /* capture-requests' read (its R23), under the viewer's sight: a request it does not answer is not held, or is one
         the viewer may not see, and reads so; never a guessed outcome. Its own cut is relayed as it said it. */
      const read = this.#lazy(this.captureRequests).captureRequests({ viewer, limit: 1000 });
      const rows = read && Array.isArray(read.requests) ? read.requests : [];
      held = new Map(rows.map((r) => [r.request, r]));
      readCut = read ? read.truncated === true : false;
    }
    const capture_requests = named.map((id) => {
      const r = held.get(id);
      if (!r) return { request: id, outcome: null,
                       why: readCut ? "not among the requests the read answered (it was cut at its bound)"
                                    : "no such request is held, or it is one you may not see" };
      return { request: id, outcome: { state: r.state, code: r.code ?? null, capture_sha: r.capture_sha ?? null,
                                       captured_at: r.captured_at ?? null } };
    });
    return { ok: true, aspiration: this.#aspirationView(a), goals, goals_limit: GOALS_MAX, goals_truncated, triaged,
             triaged_limit: TRIAGED_MAX, triaged_truncated, capture_requests,
             dead_ends: deadEndsOf(a.text), taught: a.head.currentState === "retired" ? readSection(a.text, "Taught") : null };
  }

  /* ===================================================================== *
   * THE DISCOVERY LOOP (R15–R17)
   * ===================================================================== */

  /** R15: a later module registers a proposal source once, at start (K31's pattern). `reader({project, viewer})`
   *  answers its proposals, `{key, kind, grade, basis, instances, surfaced_by}`. */
  registerSource(kind, reader) {
    if (typeof kind !== "string" || !TOKEN.test(kind) || typeof reader !== "function" || kind === "progressions" || kind === "intent")
      /* DEC-49 REGION is-source-shaped */
      return refusal("SOURCE_MALFORMED", "a source names its kind (a key, not 'progressions' or 'intent', which are read "
                     + "directly) and gives a reader function.", { kind: typeof kind === "string" ? kind : null });
      /* END DEC-49 REGION is-source-shaped */
    /* DEC-49 REGION is-source-once */
    if (this.#sources.has(kind))
      return refusal("SOURCE_DECLARED", `the source '${kind}' is already registered.`, { kind });
    /* END DEC-49 REGION is-source-once */
    this.#sources.set(kind, reader);
    return { ok: true, kind };
  }

  /* Every proposal from every source, open or not, keyed `<source>::<its key>`. */
  #allProposals(project, viewer) {
    const out = [];
    const feed = this.progressions.proposalsFeed(null);
    for (const g of (feed && feed.proposals) || [])
      out.push({ key: `progressions::${g.key}`, source: "progressions", source_key: g.key, kind: "missing_predecessor",
                 grade: g.grade ?? null, grade_determined: g.grade_determined === true,
                 basis: { progression_key: g.progression_key, stage_key: g.stage_key, required: g.required,
                          definition_version: g.definition_version, overdue: !!g.overdue },
                 instances: g.instances || [], surfaced_by: g.surfaced_by || "machine" });
    for (const [kind, reader] of this.#sources) {
      let got = [];
      try { got = reader({ project, viewer }) || []; } catch { got = []; }
      for (const p of Array.isArray(got) ? got : [])
        if (isObj(p) && typeof p.key === "string" && p.key)
          out.push({ key: `${kind}::${p.key}`, source: kind, source_key: p.key, kind: p.kind ?? kind, grade: p.grade ?? null,
                     basis: p.basis ?? null, instances: Array.isArray(p.instances) ? p.instances : [],
                     surfaced_by: p.surfaced_by ?? "machine" });
    }
    const projects = project ? [project] : this.#conditioned(viewer);
    for (const pid of projects) {
      const g = this.gaps({ project: pid, viewer });
      if (g.ok) for (const gap of g.gaps) out.push({ ...gap, source_key: gap.key.slice("intent::".length) });
    }
    return out;
  }

  /* The projects the viewer may see whose objective states a condition. */
  #conditioned(viewer) {
    const out = [];
    let after = "";
    for (;;) {
      const page = this.record.listByType({ type: "project", after, limit: 200 });
      for (const id of page.ids) {
        if (viewer != null && !this.membership.inSight(id, viewer)) continue;
        const d = this.#doc(id);
        if (d && conditionOf(d.fm)) out.push(id);
      }
      if (page.ids.length < 200 || !page.cursor) break;
      after = page.cursor;
    }
    return out;
  }

  /* R16: whether a proposal key has a triage act recorded (any act takes it off the open list); one row, read through
     the key's index (N181 (4)). */
  #isDecided(key) {
    return !!this.#one(`SELECT 1 AS x FROM intent_triage WHERE proposal_key=? LIMIT 1`, typeof key === "string" ? key : "");
  }

  /* R15: which of these keys have a triage act recorded, read through the key's index, as many rows as keys. */
  #decidedAmong(keys) {
    if (!keys.length) return new Set();
    return new Set(this.#rows(`SELECT DISTINCT proposal_key FROM intent_triage
                                WHERE proposal_key IN (SELECT value FROM json_each(?)) LIMIT ?`,
                              JSON.stringify(keys), keys.length).map((r) => r.proposal_key));
  }

  /* R16, R23 (N199): the project a triage act concerns: the one named with it, else the project a gap's key names
     (`intent::<project>::…`), so a gap set aside without naming its project is still that project's material. */
  #projectOfAct(r) {
    if (r.project) return r.project;
    const m = /^intent::([^:]+)::/.exec(r.key || "");
    return m ? m[1] : null;
  }

  /* R16: the proposals set aside (deferred or dismissed), newest first, at most SET_ASIDE_MAX, read one past so a cut
     says so (N181); an act concerning a project the viewer may not see is not listed to them (R23, N199). */
  #setAside(viewer) {
    const rows = this.#rows(`SELECT proposal_key, act, project_id, inquiry_id, reason, author, at FROM intent_triage
                              WHERE act IN ('defer', 'dismiss') ORDER BY seq DESC LIMIT ?`, SET_ASIDE_MAX + 1);
    const truncated = rows.length > SET_ASIDE_MAX;
    const list = rows.slice(0, SET_ASIDE_MAX)
      .map((r) => ({ key: r.proposal_key, act: r.act, project: r.project_id, inquiry: r.inquiry_id, reason: r.reason,
                     author: r.author, at: r.at }))
      .filter((d) => { const pid = this.#projectOfAct(d);
                       return !pid || viewer == null || !this.#project(pid, viewer).refused; });
    return { list, truncated };
  }

  /** R15, R16: every open proposal from every source, each with its grade and basis; beside them, every proposal set
   *  aside (deferred or dismissed) with its reason, so a decision ages a proposal without hiding it. */
  proposals({ project = null, viewer = null } = {}) {
    if (project != null && project !== "") {
      const p = this.#project(project, viewer);
      if (p.refused) return p.refused;
    }
    const all = this.#allProposals(project || null, viewer);
    const decided = this.#decidedAmong(all.map((p) => p.key));
    const open = all.filter((p) => !decided.has(p.key));
    const aside = this.#setAside(viewer);
    return { ok: true, project: project || null, proposals: open, count: open.length, set_aside: aside.list,
             set_aside_limit: SET_ASIDE_MAX, set_aside_truncated: aside.truncated };
  }

  /** R16: a member's act on a proposal: adopt it into a project's objective, open a question from it (a machine may
   *  do only this), or defer or dismiss it with a reason. */
  triage({ proposal, act, project = null, reason = null, author = null, viewer = null, run = null,
           assistantPrincipal = null } = {}) {
    /* DEC-49 REGION is-triage-act */
    if (!TRIAGE_ACTS.includes(act))
      return refusal("TRIAGE_ACT_UNKNOWN", `a proposal is triaged by one of ${TRIAGE_ACTS.join(", ")}. Nothing was written.`,
                     { acts: TRIAGE_ACTS });
    /* END DEC-49 REGION is-triage-act */
    const isMachine = machine(author);
    /* DEC-49 REGION is-triage-member */
    if (isMachine && act !== "question")
      return refusal("MACHINE_CANNOT_TRIAGE", "an assistant may open a question from a proposal and take no other act on "
                     + "it. Nothing was written.");
    /* END DEC-49 REGION is-triage-member */
    let proj = null;
    if (project != null && project !== "") {
      const p = this.#project(project, viewer ?? (isMachine ? null : author));
      if (p.refused) return p.refused;
      proj = p.doc;
    }
    const found = this.#isDecided(proposal) ? null
      : this.#allProposals(proj ? proj.id : null, viewer).find((p) => p.key === proposal);
    /* DEC-49 REGION is-proposal-open */
    if (!found)
      return refusal("NO_SUCH_PROPOSAL", "no open proposal answers to that key; a decided one stays readable with its "
                     + "reason. Nothing was written.", { proposal: typeof proposal === "string" ? proposal : null });
    /* END DEC-49 REGION is-proposal-open */
    const why = str(reason);
    if ((act === "defer" || act === "dismiss") && !why)
      return refuseNoReason("a proposal is deferred or dismissed with a reason in your own words. Nothing was written.");
    if (act === "adopt" && !proj)
      return refuseNoSuchProject("a proposal is adopted into a named project's objective; name the project. "
                     + "Nothing was written.", { project: null });
    if (proj && !isMachine) {
      const denied = this.membership.projectAuthority(proj.id, author, "joined", `triage:${act}`);
      if (denied) return denied;
    }
    const at = this.#when();
    let inquiry = null, extra = {};
    if (act === "adopt") {
      let text = appendItem(proj.text, "objective_adoptions",
                            { proposal: q(found.key), source: found.source, by: TOKEN.test(str(author)) ? str(author) : q(author),
                              at: q(at) });
      /* DEC-49 REGION is-adoptions-spliceable */
      if (text === null) return refusal("ADOPTIONS_UNSPLICEABLE", "the project's objective_adoptions block is not in a "
                                         + "shape this grammar can extend. Nothing was written.");
      /* END DEC-49 REGION is-adoptions-spliceable */
      text = setField(text, "last_updated", q(at));
      text = logEntry(text, at, "Proposal adopted", str(author), `the proposal ${found.key} is adopted into the objective.`);
      const r = this.#revise(proj, text, str(author), viewer);
      if (!r.ok) return r;
    } else if (act === "question") {
      const opened = this.#openQuestion(found, author, viewer, run, assistantPrincipal, at);
      if (!opened.ok) return opened;
      inquiry = opened.bundleId;
      extra = { inquiry, surfaced_by: isMachine ? "agent" : "human" };
    } else if (found.source === "progressions") {
      /* A progression proposal is decided through progressions (its R20–R22), which ages its finding there too. */
      const d = this.progressions.disposeProposal({ key: found.source_key, to: act === "defer" ? "deferred" : "dismissed",
                                                    reason: why, definitionVersion: found.basis.definition_version,
                                                    decidedBy: str(author) });
      if (!d || d.ok !== true) return d;
      extra = { progressions: { key: d.key, state: d.state, definition_version: d.definition_version } };
    }
    this.record.transact(() => this.sql.exec(
      `INSERT INTO intent_triage (proposal_key, source, kind, act, project_id, inquiry_id, reason, grade, basis_json, author, at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      found.key, found.source, found.kind ?? null, act, proj ? proj.id : this.#projectOfAct({ key: found.key }), inquiry,
      why || null, found.grade ?? null,
      JSON.stringify(found.basis ?? null), str(author) || PLANE_ACTOR, at));
    return { ok: true, proposal: found.key, act, project: proj ? proj.id : null, reason: why || null,
             author: str(author) || null, at, ...extra };
  }

  /* R16's `question`: a new inquiry at `surfaced`, through promotion (so inquiry's check and ai-runs' surfacing step,
     its R25, run inside it), the proposal as its basis. */
  #openQuestion(found, author, viewer, run, assistantPrincipal, at) {
    const id = `${this.record.allocId("INQ", at.slice(0, 4)).id}-question`;
    const question = questionOf(found);
    const who = str(author) || PLANE_ACTOR;
    const text = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: ${q(question.slice(0, 120))}`,
      "current_state: surfaced", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
      "produced_by:", `  mode: ${machine(author) ? "agent" : "human"}`, "  capability_tier: session", "references: []",
      "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
      "visuals: []", `surfaced_by: ${machine(author) ? "agent" : "human"}`, 'disposition_reason: ""',
      `surfaced_from: ${q(found.key)}`, "---", "", "## Question", "", question, "", "## What It Rests On", "",
      `Surfaced from the proposal ${found.key} (${found.source}, ${found.kind ?? "finding"}): ${JSON.stringify(found.basis ?? null)}`,
      "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
      `### Session ${at} | Surfaced | ${who}`, `Changes: opened from the proposal ${found.key}.`, "", "## Review Notes", ""].join("\n");
    return this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author: who,
      files: [{ path: "bundle.md", text }],
      meta: { object_type: "inquiry", current_state: "surfaced", created: at, last_updated: at },
      ...(run ? { run } : {}), ...(str(assistantPrincipal) ? { assistantPrincipal: str(assistantPrincipal) } : {}),
      actorViewer: viewer ?? null });
  }

  /** R17 (called by `scheduler`): a question an assistant surfaced that no member has acted on within the instance's
   *  ageing interval moves to `deferred`, with its reason, through inquiry's dispose act under the plane's actor.
   *  Nothing is deleted. */
  async ageSurfaced(now) {
    const nowMs = this.#instantMs(now);
    const days = this.ageingDays();
    const reason = `surfaced by an assistant; no member acted within ${days} days`;
    const aged = [], refused = [];
    const due = this.#ageable().filter((x) => x.at <= nowMs).map((x) => x.id);
    const inquiry = this.#lazy(this.inquiryRef), retrieval = this.#lazy(this.retrievalRef);
    for (const id of due) {
      /* One question per selection, so one refused question never holds back another (inquiry R22 moves a set whole). */
      const sel = await retrieval.selectionCreate({ ids: [id], kind: "enumerated", owner: PLANE_ACTOR, viewer: PLANE_VIEWER });
      if (!sel || !sel.handle) { refused.push({ id, reason: sel && sel.reason ? sel.reason : "NO_SELECTION" }); continue; }
      const r = inquiry.dispose({ handle: sel.handle, to: "deferred", reason, viewer: PLANE_VIEWER, owner: PLANE_ACTOR,
                                  author: PLANE_ACTOR });
      if (r && r.ok) aged.push(id); else refused.push({ id, reason: r ? r.reason : "DISPOSE_FAILED" });
    }
    return { ok: true, aged, refused, interval_days: days, reason };
  }

  /* R17, R27: an instant given as milliseconds or ISO text; none given is the module's clock. */
  #instantMs(now) {
    return now == null || now === "" ? Date.parse(this.now()) : Number.isFinite(Number(now)) ? Number(now) : Date.parse(now);
  }

  /* R27: every ageable question (R17 would move it: at `surfaced`, surfaced by a machine, no member's entry in its
     history) with its ageing instant, its last entry's time plus the ageing interval, in milliseconds. */
  #ageable() {
    const span = this.ageingDays() * 86400000;
    const out = [];
    let after = "";
    for (;;) {
      const page = this.record.listByType({ type: "inquiry", after, limit: 200 });
      for (const id of page.ids) {
        const d = this.#doc(id);
        if (!d || d.head.currentState !== "surfaced" || d.fm.surfaced_by !== "agent") continue;
        const entries = manifestOf(this.record.readImage(id));
        if (!entries.length || entries.some((e) => !machine(e.author))) continue;
        const since = Date.parse(entries[entries.length - 1].created ?? d.fm.created);
        if (Number.isFinite(since)) out.push({ id, at: since + span });
      }
      if (page.ids.length < 200 || !page.cursor) break;
      after = page.cursor;
    }
    return out;
  }

  /** R27 (for `scheduler`, beside R17 as its tick): the earliest ageing instant of any ageable question, past or not,
   *  in milliseconds; null when there is none. A question R17 tried and could not move is still ageable, so it stays
   *  due and is tried again at a later firing. Writes nothing; never throws. */
  ageDue(now) {
    try {
      let best = null;
      for (const x of this.#ageable()) if (best === null || x.at < best) best = x.at;
      return best;
    } catch { return null; }
  }

  /** R27: the earliest ageing instant later than `now` (milliseconds or ISO; none given is the module's clock), in
   *  milliseconds; null when there is none. One already due is never woken for. Writes nothing; never throws. */
  ageWake(now) {
    try {
      const nowMs = this.#instantMs(now);
      if (!Number.isFinite(nowMs)) return null;
      let best = null;
      for (const x of this.#ageable()) if (x.at > nowMs && (best === null || x.at < best)) best = x.at;
      return best;
    } catch { return null; }
  }

  /** R17: the instance's ageing interval in days, a record-core setting (default 30). */
  ageingDays() {
    const v = Number(this.record.getSetting(AGEING_SETTING));
    return Number.isInteger(v) && v > 0 ? v : AGEING_DEFAULT_DAYS;
  }

  /* ===================================================================== *
   * WORKING AN OBJECTIVE (R18)
   * ===================================================================== */

  /** R18: a member sets an assistant to work a project's objective: a run through `ai-runs` with the project as its
   *  context, the objective and its current gaps as its instructions, its looks named under authority kind
   *  `objective`. `run` carries what `ai-runs.open` takes (its id, principals, skill version, bounds, …). */
  async workObjective({ project, author, viewer = null, run = {} } = {}) {
    /* DEC-49 REGION is-objective-member */
    if (machine(author))
      return refusal("MACHINE_CANNOT_CHOOSE_THE_QUESTION", "setting an assistant to work an objective is a member's act "
                     + "(DEC-24 rule 2). No run was opened.");
    /* END DEC-49 REGION is-objective-member */
    const p = this.#project(project, viewer ?? author);
    if (p.refused) return p.refused;
    const g = this.gaps({ project, viewer: viewer ?? author });
    const instructions = { objective: p.doc.fm.objective ?? null, condition: g.condition ?? null, gaps: g.gaps || [],
                           authority: { kind: "objective", ref: project } };
    const opened = await this.#lazy(this.aiRunsRef).open({ ...(isObj(run) ? run : {}), contextType: "project",
      contextId: project, state: { instructions }, actor: this.#memberOf(author), viewer: viewer ?? author });
    return { ...(isObj(opened) ? opened : {}), project, instructions };
  }
}

/* DEC-49: a code several acts answer is minted at one site, its own function here, which builds the refusal whole
   from its row (D-484's shape); each act relays it with its own detail. */
function refuseNoSuchProject(detail, extra) {
  /* DEC-49 REGION is-project-seen */
  const row = INTENT_CHECKS.NO_SUCH_PROJECT;
  return { ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-project-seen */
}

function refuseNoSuchGoal(detail, extra) {
  /* DEC-49 REGION is-goal-held */
  const row = INTENT_CHECKS.NO_SUCH_GOAL;
  return { ok: false, reason: "NO_SUCH_GOAL", code: "NO_SUCH_GOAL", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-goal-held */
}

function refuseNoSuchAspiration(detail, extra) {
  /* DEC-49 REGION is-aspiration-held */
  const row = INTENT_CHECKS.NO_SUCH_ASPIRATION;
  return { ok: false, reason: "NO_SUCH_ASPIRATION", code: "NO_SUCH_ASPIRATION", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-aspiration-held */
}

function refuseNoSuchProgression(detail, extra) {
  /* DEC-49 REGION is-named-progression */
  const row = INTENT_CHECKS.NO_SUCH_PROGRESSION;
  return { ok: false, reason: "NO_SUCH_PROGRESSION", code: "NO_SUCH_PROGRESSION", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-named-progression */
}

function refuseNoSuchEntity(detail, extra) {
  /* DEC-49 REGION is-named-entity */
  const row = INTENT_CHECKS.NO_SUCH_ENTITY;
  return { ok: false, reason: "NO_SUCH_ENTITY", code: "NO_SUCH_ENTITY", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-named-entity */
}

function refuseNoReason(detail, extra) {
  /* DEC-49 REGION is-reason-stated */
  const row = INTENT_CHECKS.NO_REASON;
  return { ok: false, reason: "NO_REASON", code: "NO_REASON", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-reason-stated */
}

function refusePursuitUnstated(detail, extra) {
  /* DEC-49 REGION is-pursuit-stated */
  const row = INTENT_CHECKS.PURSUIT_UNSTATED;
  return { ok: false, reason: "PURSUIT_UNSTATED", code: "PURSUIT_UNSTATED", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-pursuit-stated */
}

function refuseNoLesson(detail, extra) {
  /* DEC-49 REGION is-retirement-taught */
  const row = INTENT_CHECKS.NO_LESSON;
  return { ok: false, reason: "NO_LESSON", code: "NO_LESSON", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-retirement-taught */
}

function refuseBadScope(detail, extra) {
  /* DEC-49 REGION is-aspiration-scoped */
  const row = INTENT_CHECKS.BAD_SCOPE;
  return { ok: false, reason: "BAD_SCOPE", code: "BAD_SCOPE", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-aspiration-scoped */
}

function refusePursuitEnded(detail, extra) {
  /* DEC-49 REGION is-pursuit-live */
  const row = INTENT_CHECKS.PURSUIT_ENDED;
  return { ok: false, reason: "PURSUIT_ENDED", code: "PURSUIT_ENDED", check: row.check,
           translation: row.translation, detail, ...(extra || {}) };
  /* END DEC-49 REGION is-pursuit-live */
}

/* R8, R9, R20: a goal's and an aspiration's acts are a named member's. Each answers its refusal when the author is a
   machine (or no one), or is not a member (`member` false, the registered check's case), and null otherwise. */
function goalMachineRefusal(author, member = true) {
  /* DEC-49 REGION is-goal-member */
  if (str(author) && !isMachineIdentity(str(author)) && member) return null;
  const row = INTENT_CHECKS.MACHINE_CANNOT_DECLARE_GOAL;
  return { ok: false, reason: "MACHINE_CANNOT_DECLARE_GOAL", code: "MACHINE_CANNOT_DECLARE_GOAL", check: row.check,
           translation: row.translation,
           detail: "declaring, linking and closing a goal are a named member's acts. Nothing was written." };
  /* END DEC-49 REGION is-goal-member */
}

function aspirationMachineRefusal(author, member = true) {
  /* DEC-49 REGION is-aspiration-member */
  if (str(author) && !isMachineIdentity(str(author)) && member) return null;
  const row = INTENT_CHECKS.MACHINE_CANNOT_DECLARE_ASPIRATION;
  return { ok: false, reason: "MACHINE_CANNOT_DECLARE_ASPIRATION", code: "MACHINE_CANNOT_DECLARE_ASPIRATION",
           check: row.check, translation: row.translation,
           detail: "declaring, departing from, revising and retiring an aspiration are a named member's acts. Nothing "
                 + "was written." };
  /* END DEC-49 REGION is-aspiration-member */
}

/* The capture request ids a proposal's basis names (`capture_request`, `capture_requests`, `requests`). */
function captureRequestsNamed(basis) {
  if (!isObj(basis)) return [];
  const out = [];
  for (const k of ["capture_request", "capture_requests", "requests"]) {
    const v = basis[k];
    for (const x of Array.isArray(v) ? v : v == null ? [] : [v]) if (typeof x === "string" && x) out.push(x);
  }
  return out;
}

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/* record-core's manifest for a bundle, in the order it was recorded (its R16 `seq`). */
function manifestOf(img) {
  const raw = img && typeof img["_history/manifest.json"] === "string" ? safeJson(img["_history/manifest.json"]) : null;
  const entries = raw && Array.isArray(raw.entries) ? raw.entries : [];
  return [...entries].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
}

/* R16: the question a proposal opens, in words a member can read; an obstacle reads as such (Suggestions). */
function questionOf(p) {
  const b = isObj(p.basis) ? p.basis : {};
  if (p.source === "progressions")
    return `Why is the '${b.stage_key}' stage of '${b.progression_key}' missing where the flow requires it?`;
  if (p.kind === GAP_KIND)
    return b.stages_missing
      ? `What would fill the stages ${b.stages_missing.join(", ")} of '${b.progression}' for ${b.entity}?`
      : `What would strengthen the weakest link of '${b.progression}' for ${b.entity}?`;
  return `What does the finding ${p.key} show?`;
}

/** The ops whose handlers are this module's (K3): the control plane routes, authenticates and stamps them (`author`
 *  in the body; `viewer` in the URL, read after the body so a body cannot set it). Legacy-index routes them (REPORT). */
export function intentOps(i, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = body || {};
  return {
    objectivecondition: () => i.setCondition({ ...b, viewer: qp("viewer") }),
    objectiveprogress: () => i.progress({ project: qp("project"), viewer: qp("viewer") }),
    objectivegaps: () => i.gaps({ project: qp("project"), viewer: qp("viewer") }),
    goaldeclare: () => i.declareGoal({ ...b, viewer: qp("viewer") }),
    goallink: () => i.linkObjective({ ...b, viewer: qp("viewer") }),
    goalclose: () => i.closeGoal({ ...b, viewer: qp("viewer") }),
    goal: () => i.readGoal({ goal: qp("id"), viewer: qp("viewer") }),
    aspirationdeclare: () => i.declareAspiration({ ...b, viewer: qp("viewer") }),
    aspirationdepart: () => i.departFrom({ ...b, viewer: qp("viewer") }),
    aspirationdeadend: () => i.recordDeadEnd({ ...b, viewer: qp("viewer") }),
    aspirationretire: () => i.retireAspiration({ ...b, viewer: qp("viewer") }),
    aspirations: () => i.aspirationsFor({ project: qp("project"), member: qp("member"), viewer: qp("viewer") }),
    aspirationcontacts: () => i.contacts({ viewer: qp("viewer") }),
    pursuit: () => i.pursuitOf({ aspiration: qp("id"), viewer: qp("viewer") }),
    intentproposals: () => i.proposals({ project: qp("project"), viewer: qp("viewer") }),
    triage: () => i.triage({ ...b, viewer: qp("viewer") }),
    workobjective: () => i.workObjective({ ...b, viewer: qp("viewer") }),
  };
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It registers its check with promotion
 *  (R39), its audit check with record-core (R59) and its tables with purge (R24). */
export function intentOf(host, deps) {
  let i = instances.get(host);
  if (!i) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    i = new Intent({ ...d, storage, record, membership, promotion,
                     entities: d.entities || entitiesOf(host, { record, membership }),
                     progressions: d.progressions || (() => progressionsOf(host, { record })),
                     inquiry: d.inquiry || (() => inquiryOf(host)), aiRuns: d.aiRuns || (() => aiRunsOf(host)),
                     retrieval: d.retrieval || (() => retrievalOf(host)),
                     captureRequests: d.captureRequests || (() => captureRequestsOf(host)) });
    instances.set(host, i);
    record.declarePurge("intent", INTENT_TABLES);
    promotion.registerStep("intent", { check: (c) => i.check(c) });
    record.registerAuditCheck("intent", (image) => i.auditCheck(image));
  }
  return i;
}
