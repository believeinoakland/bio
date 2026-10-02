/* project-stage — a project's stage, what each stage has earned and still needs, and its work products' readiness
 * (requirements: `build/requirements/project-stage.md`; State Rules §4.3; DEC-72, DEC-79; K356, K362, K364, K448,
 * K452). Derived at the read from the questions the project draws on and what it has published; it writes nothing and
 * owns no table (R5).
 *
 * Split from `publication` by copy (T18, layer 8; K617, K651, K624 (1)): the stage constants and helpers and
 * `projectStage` with its private reads, publication R44–R47 and R49 (here R1–R5). The legacy comments moved with it,
 * their requirement ids re-pointed to this module's.
 *
 * REACHED as `projectStageOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. It creates no table and registers nothing.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `readFile` (the project's `bundle.md`); `sight`, `existenceAct` (its R44).
 *   inquiry              `basisFor` (its R16; R2's rule 3, R4's `since`).
 *   basisVersions        `projectQuestions` (its R41) and `conclusionOf` (its R22), for R2 and R4.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`object_type`, its R37) and publication's `cases`,
 * `case_documents` and `published_cases` (its R40), for R3. */

import { recordOf, instantOrder } from "../record-core/index.mjs";
import { membershipOf, noSuchProject } from "../membership/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { basisVersionsOf, PROJECT_QUESTIONS_MAX } from "../basis-versions/index.mjs";
import { parseFrontmatter } from "../record-grammar/index.mjs";

/** R2: the held questions one `projectStage` reads, in pages of basis-versions' PROJECT_QUESTIONS_MAX (500). */
export const STAGE_QUESTIONS_MAX = 2000;
/** R3: the work products (cases) one `projectStage` answers. */
export const WORK_PRODUCTS_MAX = 200;
/** R2: State Rules §4.3's four stages, and the reasons an owner records a close with. */
export const PROJECT_STAGES = Object.freeze(["forming", "investigating", "matured", "closed"]);
export const CLOSED_REASONS = Object.freeze(["resolved", "superseded", "abandoned"]);
/* R4: the three stages R2's rules 2–4 compute, in order. */
const COMPUTED_STAGES = PROJECT_STAGES.slice(0, 3);
/** R4: the longest unrecognised close reason `closed.recorded` repeats. */
export const CLOSED_RECORDED_MAX = 40;
/** R4: the conditions a computed stage not reached lists in `needs`, each an input R2 counts. */
export const STAGE_NEEDS = Object.freeze({
  investigating: Object.freeze(["held_question_with_leg"]),
  matured: Object.freeze(["concluded_held_question", "ratified_case_edition"]),
});
/** R4: every `why` a stage states, fixed, filled with counts only (`{read}`, `{with_legs}`, `{concluded}`,
 *  `{editions}`); never a member, a question's text or a place (R9). The undetermined answers' `detail` stands in for
 *  a stage the read could not decide. */
export const STAGE_SENTENCES = Object.freeze({
  forming_reached: "every project starts forming; this stage needs nothing from the record",
  investigating_reached: "{with_legs} of the {read} held questions read have at least one leg in their basis",
  investigating_skipped: "reached because a later stage is reached; none of the {read} held questions read has a leg "
                       + "in its basis",
  investigating_none_held: "the project holds no question yet; a held question with a leg in its basis reaches this stage",
  investigating_no_leg: "the project holds {read} questions and none has a leg in its basis; a leg on any one of them "
                      + "reaches this stage",
  matured_reached: "the project has concluded {concluded} of the {read} held questions read and owns {editions} "
                 + "ratified case editions",
  matured_not_reached: "the project has concluded none of the {read} held questions read and owns no ratified case "
                     + "edition; concluding one of them, or a ratified case edition of a case it owns, reaches this stage",
  closed_project: "the project is closed, so no further stage is needed; a reopening is the owner's act",
  closed_reached: "the owner recorded the close with its reason; a reopening is the owner's act",
  closed_not_recorded: "a close is the owner's recorded act with its reason (resolved, superseded or abandoned), not a "
                     + "stage the record grows into",
  closed_unrecognised: "the document records a close, but its reason is not resolved, superseded or abandoned, so the "
                     + "close is not read",
});
const fillCounts = (sentence, n) => sentence.replace(/\{(read|with_legs|concluded|editions)\}/g, (_, k) => String(n[k]));
/* R4: a stage's fixed sentence, by whether it is reached and what earned it. */
function stageWhy(stage, reached, earned, n) {
  const key = stage === "forming" ? "forming_reached"
    : stage === "investigating"
      ? (reached ? (earned ? "investigating_reached" : "investigating_skipped")
                 : (n.read ? "investigating_no_leg" : "investigating_none_held"))
    : reached ? "matured_reached" : "matured_not_reached";
  return fillCounts(STAGE_SENTENCES[key], n);
}
/* R4: what a computed stage not reached needs, each condition with how much of it the record has now. */
function stageNeeds(stage, n) {
  const have = { held_question_with_leg: n.with_legs, concluded_held_question: n.concluded,
                 ratified_case_edition: n.editions };
  return { any_of: STAGE_NEEDS[stage].map((condition) => ({ condition, have: have[condition] })) };
}
/* R4: the earliest of some instants as held (ISO strings), or null when none is one. */
function earliestInstant(list) {
  let best = null;
  for (const v of list) {
    if (typeof v !== "string" || !Number.isFinite(Date.parse(v))) continue;
    if (best === null || instantOrder(v, best) < 0) best = v;
  }
  return best;
}
/* R4 (K452): the instant the project's document recorded its close, as the store holds the document: the timestamp of
   its newest `state_history` entry moving to `closed`; null when it carries none. */
function closedSince(fm) {
  const hist = Array.isArray(fm && fm.state_history) ? fm.state_history : [];
  for (let i = hist.length - 1; i >= 0; i--) {
    const e = hist[i];
    if (e && typeof e === "object" && e.to_state === "closed")
      return typeof e.timestamp === "string" && Number.isFinite(Date.parse(e.timestamp)) ? e.timestamp : null;
  }
  return null;
}
/** R3: State Rules §4.3's readiness ladder, lowest first. */
export const READINESS_RUNGS = Object.freeze(["draft", "internally_checked", "externally_compliant", "distributed"]);

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");

export class ProjectStage {
  #deps;

  constructor({ storage, record, membership, host = null, inquiry = null, basisVersions = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, inquiry, basisVersions };
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* A live file's inline text as `{content}` (record-core R13), or null when it is not held inline. */
  #fileText(bundleId, path) {
    let f = null;
    try { f = this.record.readFile(bundleId, path); } catch { f = null; }
    return f && typeof f.text === "string" ? { content: f.text } : null;
  }

  /** R1–R5 (N300, N346; K356, K362, K364, K379, K448, K452): a project's stage, what each stage has earned and still
   *  needs (`stages`), and its work products' readiness, derived afresh at every read from the record and never stored
   *  (R5): the project's own document (rule 1's recorded close), the questions it holds (basis-versions R41
   *  `projectQuestions`, whose stance is R22's `conclusionOf` reading) and the cases it owns and has published. Fenced
   *  by membership R44's sight: `NO_ID` for no project; absent, not a project and no sight are one answer, membership's
   *  `noSuchProject` (R8); existence only is membership's C-70.1 through `existenceAct`; only FULL sight is answered.
   *  Writes nothing; never throws (a part it cannot read is stated undetermined, R7). */
  projectStage({ project = null, viewer = null } = {}) {
    const pid = str(project);
    if (!pid) return { ok: false, reason: "NO_ID", detail: "projectStage names a project" };
    let row = null;
    try { row = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, pid); } catch { row = null; }
    if (!row || row.object_type !== "project") return noSuchProject(pid);
    let sight = "none";
    try { sight = this.membership.sight(pid, viewer); } catch { sight = "none"; }
    if (sight === "existence") {
      let seen = null;
      try { seen = this.membership.existenceAct(pid, viewer); } catch { seen = null; }
      return seen || noSuchProject(pid);
    }
    if (sight !== "full") return noSuchProject(pid);
    const work = this.#workProducts(pid);
    if (work.failed) {
      /* R1, R7: never thrown; the cases it owns could not be read, so what rule 2's second half and R3 would say is
         undetermined, stated as for an unread document. */
      const detail = "the cases this project owns could not be read, so its stage and its readiness are undetermined";
      return { ok: true, project: pid, stage: "undetermined", closed_reason: null,
               questions: { read: 0, with_legs: 0, concluded: 0, truncated: false }, published_editions: null,
               work_products: [], work_products_limit: WORK_PRODUCTS_MAX, work_products_truncated: false,
               readiness: "undetermined", basis: null, detail, stages: this.#stages({ unread: detail }) };
    }
    const out = { ok: true, project: pid, stage: null, closed_reason: null,
                  questions: { read: 0, with_legs: 0, concluded: 0, truncated: false },
                  published_editions: work.published_editions, work_products: work.items,
                  work_products_limit: WORK_PRODUCTS_MAX, work_products_truncated: work.truncated,
                  readiness: work.readiness, basis: null };
    /* Rule 1: the owner's recorded close, read from the project's own document and from nothing else. The document's
       `forming`, `investigating` or `matured` is never read (R2, R5). */
    const text = this.#fileText(pid, "bundle.md");
    if (!text) {
      const detail = "the project's own document could not be read, so whether its owner closed it is undetermined";
      return { ...out, stage: "undetermined", detail, stages: this.#stages({ unread: detail }) };
    }
    const fm = parseFrontmatter(text.content).data || {};
    const closeRecorded = fm.current_state === "closed";
    const closed = closeRecorded && CLOSED_REASONS.includes(fm.closed_reason);
    /* Rules 2 and 3, evaluated for a closed project too, so its answer states how far the work had come (R4). */
    const read = this.#readHeld(pid, out.questions);
    let computed;
    if (read.concluded)
      computed = { stage: "matured", basis: { rule: "matured", question: read.concluded, case: null, edition: null } };
    else if (work.first_ratified)
      /* Rule 2's second half is asked before any undetermined answer: a failed read or the cap leaves a project that
         owns a ratified case edition matured (R2). */
      computed = { stage: "matured", basis: { rule: "matured", question: null, ...work.first_ratified } };
    else if (read.failed || read.more)
      /* The cap reached, or the read failed, with rules 1–2 unmet: what was established, never filled in (R7). */
      computed = { stage: "undetermined", at_least: read.legged ? "investigating" : "forming",
                   detail: read.failed
                     ? "the questions this project holds could not all be read, so its stage is undetermined"
                     : `this project holds more than the ${STAGE_QUESTIONS_MAX} questions one read examines, none of `
                       + "those read is concluded and it has published no case, so whether it has matured is "
                       + "undetermined; it is at least as far as stated" };
    else if (read.legged)
      computed = { stage: "investigating", basis: { rule: "investigating", question: read.legged, case: null, edition: null } };
    else computed = { stage: "forming", basis: { rule: "forming", question: null, case: null, edition: null } };
    const questions = computed.stage === "undetermined" ? { ...out.questions, truncated: true } : out.questions;
    const stages = this.#stages({ computed, read, work, questions, viewer, pid, fm, closeRecorded, closed });
    if (closed)
      return { ...out, questions, stage: "closed", closed_reason: fm.closed_reason,
               basis: { rule: "closed", question: null, case: null, edition: null }, stages };
    if (computed.stage === "undetermined")
      return { ...out, questions, stage: "undetermined", at_least: computed.at_least, detail: computed.detail, stages };
    return { ...out, questions, stage: computed.stage, basis: computed.basis, stages };
  }

  /* R2: the held questions read in pages of 500, at most 2,000, stopping once rule 2 is met. Counts into `questions`;
     answers the first legged and first concluded question read, every one read with a leg (R4's `since`), whether
     more follow the last page read, and whether a read failed (the counts then stand as read). */
  #readHeld(pid, questions) {
    const r = { concluded: null, legged: null, leggedIds: [], more: false, failed: false };
    let after = null;
    try {
      while (questions.read < STAGE_QUESTIONS_MAX) {
        const page = this.basisVersions.projectQuestions({ project: pid, after,
          limit: Math.min(PROJECT_QUESTIONS_MAX, STAGE_QUESTIONS_MAX - questions.read) });
        const items = page && Array.isArray(page.items) ? page.items : [];
        for (const q of items) {
          questions.read++;
          if (q.legs) { questions.with_legs++; r.legged ??= q.inquiry; r.leggedIds.push(q.inquiry); }
          if (q.stance === "concluded") { questions.concluded++; r.concluded ??= q.inquiry; }
        }
        r.more = !!(page && page.cursor) && items.length > 0;
        if (r.concluded || !r.more) break;
        after = page.cursor;
      }
    } catch { r.failed = true; }
    return r;
  }

  /* R4: the four stages, each `{stage, reached, earned, since, needs, why}`, from the one evaluation `projectStage`
     made (`computed`, the rules-2–4 decision; rule 1's `closed`), never from a second reading of the record. `unread`
     is the detail when the project's own document could not be read: every stage is then undetermined. */
  #stages({ unread = null, computed = null, read = null, work = null, questions = null, viewer = null, pid = null,
            fm = null, closeRecorded = false, closed = false }) {
    if (unread !== null)
      return PROJECT_STAGES.map((stage) => ({ stage, reached: null, earned: null, since: null, needs: null, why: unread }));
    const n = { read: questions.read, with_legs: questions.with_legs, concluded: questions.concluded,
                editions: work.published_editions };
    const undetermined = computed.stage === "undetermined";
    const top = COMPUTED_STAGES.indexOf(undetermined ? computed.at_least : computed.stage);
    const earnedOf = {
      forming: null,
      investigating: read.legged ? { question: read.legged } : null,
      matured: computed.stage === "matured"
        ? (computed.basis.question ? { question: computed.basis.question }
                                   : { case: computed.basis.case, edition: computed.basis.edition })
        : null,
    };
    const sinceOf = {
      forming: () => null,
      investigating: () => this.#earliestLeg(read.leggedIds),
      /* the instant of the evidence `earned` names, and only that (K469): its current conclusion, else its ratification */
      matured: () => earnedOf.matured.question ? this.#conclusionInstant(pid, earnedOf.matured.question, viewer)
                                               : earliestInstant([work.first_ratified_at]),
    };
    const computedStages = COMPUTED_STAGES.map((stage, i) => {
      if (undetermined && i > top)
        return { stage, reached: null, earned: null, since: null, needs: null, why: computed.detail };
      const reached = i <= top;
      const earned = reached ? earnedOf[stage] : null;
      const since = earned ? sinceOf[stage]() : null;
      if (reached) return { stage, reached, earned, since, needs: null, why: stageWhy(stage, true, earned, n) };
      if (closed) return { stage, reached, earned: null, since: null, needs: null, why: STAGE_SENTENCES.closed_project };
      return { stage, reached, earned: null, since: null, needs: stageNeeds(stage, n), why: stageWhy(stage, false, null, n) };
    });
    let closedStage;
    if (closed)
      closedStage = { stage: "closed", reached: true, earned: { closed_reason: fm.closed_reason },
                      since: closedSince(fm), needs: null, why: STAGE_SENTENCES.closed_reached };
    else if (undetermined)
      closedStage = { stage: "closed", reached: null, earned: null, since: null, needs: null, why: computed.detail };
    else
      closedStage = { stage: "closed", reached: false, earned: null, since: null, needs: null,
                      why: closeRecorded ? STAGE_SENTENCES.closed_unrecognised : STAGE_SENTENCES.closed_not_recorded };
    if (closeRecorded && !closed)
      closedStage.recorded = fm.closed_reason == null ? null : String(fm.closed_reason).slice(0, CLOSED_RECORDED_MAX);
    return [...computedStages, closedStage];
  }

  /* R4: the earliest recorded instant among the legs of the held questions read with a leg (inquiry R16's `basisFor`,
     each leg's `at`); null when none carries one or the legs cannot be read. */
  #earliestLeg(ids) {
    const at = [];
    for (const id of ids) {
      let b = null;
      try { b = this.inquiry.basisFor(id); } catch { b = null; }
      if (b && b.ok && Array.isArray(b.legs)) for (const l of b.legs) at.push(l && l.at);
    }
    return earliestInstant(at);
  }

  /* R4: the instant of the project's current conclusion of one held question (basis-versions R22 `conclusionOf`). */
  #conclusionInstant(pid, id, viewer) {
    let c = null;
    try { c = this.basisVersions.conclusionOf(pid, id, viewer); } catch { c = null; }
    return c ? earliestInstant([c.at]) : null;
  }

  /* R3: the project's work products, read from publication's tables under its R40. A work product is a case the
     project owns: its `cases` row (written at the first edition's signature), or, for a case not yet signed, the
     `case_project` its unsigned document names (publication R21; so a case prepared and never signed is the project's
     draft). Each rung is stated by its own condition. A read that fails answers `{failed: true}` (R1, R7). */
  #workProducts(pid) {
    try { return this.#readWorkProducts(pid); } catch { return { failed: true }; }
  }

  #readWorkProducts(pid) {
    const ids = this.#rows(
      `SELECT case_id FROM (
         SELECT case_id FROM cases WHERE project_id=?
         UNION SELECT d.case_id FROM case_documents d
          WHERE d.sig_armored IS NULL AND instr(d.text, ?) > 0
            AND NOT EXISTS (SELECT 1 FROM cases k WHERE k.case_id=d.case_id))
        ORDER BY case_id LIMIT ?`, pid, `\ncase_project: ${pid}\n`, WORK_PRODUCTS_MAX + 1).map((r) => r.case_id);
    const truncated = ids.length > WORK_PRODUCTS_MAX;
    if (truncated) ids.length = WORK_PRODUCTS_MAX;
    const items = [];
    for (const id of ids) {
      /* A case with no `cases` row counts only when its unsigned document's own `case_project` is this project. */
      const owned = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, id);
      if (!owned) {
        const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND sig_armored IS NULL AND instr(text, ?) > 0
                              ORDER BY edition LIMIT 1`, id, `\ncase_project: ${pid}\n`);
        if (!d || String((parseFrontmatter(d.text).data || {}).case_project ?? "").trim() !== pid) continue;
      }
      const drafted = !!this.#one(`SELECT 1 AS d FROM case_documents WHERE case_id=? AND sig_armored IS NULL LIMIT 1`, id);
      const ed = this.#one(`SELECT COUNT(*) AS n, MAX(edition) AS latest FROM published_cases
                             WHERE case_id=? AND ratified_at IS NOT NULL`, id) || {};
      const editions = Number(ed.n) || 0;
      const notEvaluated = { met: false, why: "no evaluation is recorded" };
      const rungs = {
        draft: drafted ? { met: true } : { met: false, why: "no unsigned case document of this case is stored" },
        internally_checked: notEvaluated,
        externally_compliant: notEvaluated,
        distributed: editions ? { met: true } : { met: false, why: "no edition of this case is ratified" },
      };
      const readiness = [...READINESS_RUNGS].reverse().find((r) => rungs[r].met) ?? "none";
      items.push({ case: id, readiness, editions, latest_edition: editions ? Number(ed.latest) : null, rungs });
    }
    const top = items.reduce((m, w) => Math.max(m, READINESS_RUNGS.indexOf(w.readiness)), -1);
    /* Over every case the project owns, not only the page answered: the count, and rule 2's first case edition by id. */
    const all = this.#one(`SELECT COUNT(*) AS n FROM published_cases c JOIN cases k ON k.case_id=c.case_id
                            WHERE k.project_id=? AND c.ratified_at IS NOT NULL`, pid) || {};
    const first = this.#one(`SELECT c.case_id, MIN(c.edition) AS edition FROM published_cases c
                               JOIN cases k ON k.case_id=c.case_id
                              WHERE k.project_id=? AND c.ratified_at IS NOT NULL
                              GROUP BY c.case_id ORDER BY c.case_id LIMIT 1`, pid);
    /* R4: when that edition was ratified, the instant `matured.since` states when it earns the stage */
    const firstAt = first ? this.#one(`SELECT ratified_at FROM published_cases WHERE case_id=? AND edition=?`,
                                      first.case_id, first.edition) : null;
    return { items, truncated, published_editions: Number(all.n) || 0,
             readiness: !items.length ? "absent" : top < 0 ? "none" : READINESS_RUNGS[top],
             first_ratified: first ? { case: first.case_id, edition: Number(first.edition) } : null,
             first_ratified_at: firstAt ? firstAt.ratified_at ?? null : null, failed: false };
  }
}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps` (a test passes its own); it creates no
 *  table and registers nothing (R5). */
export function projectStageOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    s = new ProjectStage({ ...d, host, storage, record, membership });
    instances.set(host, s);
  }
  return s;
}

/** The module's op (K3), as an entry of the plane's one op map, which the plane composes and control-plane's routes
 *  spread (`control-plane/dispatch.mjs`). `viewer` is the control plane's stamp, read from the query, so a caller's own
 *  copy in a body never wins. */
export function projectStageOps(s, url) {
  const q = (k) => url.searchParams.get(k);
  return {
    /* R1 (N300): the viewer the control plane stamps; the route is control-plane's (N321). */
    projectstage: () => s.projectStage({ project: q("project"), viewer: q("viewer") }),
  };
}
