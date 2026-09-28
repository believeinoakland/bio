/* run-productions — what an AI run produces, and the only way it produces it (requirements:
 * `build/requirements/run-productions.md`, R1–R19; map: `build/extraction/run-productions.md`). Extracted from the
 * legacy store (PL-3/IS-4's suggest endpoint `suggestVersion` with `#suggestionPersisted` and `#suggestionFrontmatter`;
 * SK-8's `extractPropose` and `extractProposals` with `#posFields`; the dispatch of `op=suggest`, `op=extractpropose`
 * and `op=extractproposals`), from the legacy schema (`suggest_refusals`, `proposed_readings`) and from the check
 * catalogue (C-27 and C-104, `checks.mjs`).
 *
 * `runProductionsOf(ctx, deps)` answers the one instance per Durable Object storage (K61). It reaches `record-core`,
 * `membership`, `content`, `connections`, `strength`, `citation` and `basis-versions` through their factories, and
 * `ai-runs` as an injected provider written to its Provides (K120): `deps.interim` builds it from what the legacy store
 * hands over until ai-runs is extracted (`interim.mjs`). It declares its tables to purge (R17, K23) and registers its
 * candidate source with basis-versions (R14; its R40).
 *
 * WHAT THIS MODULE DOES NOT DO (§4, §10): it accepts, hides, rejects or makes current nothing; it captures and requests
 * nothing; it notifies nobody; it opens no run, writes no run and no bound row (R18), and it reads a run only through
 * `ai-runs.runFor` and spends a bound only through `ai-runs.consumeBound`. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { contentOf, mintLabel } from "../content/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { strengthOf, ORIGIN_LIMIT, STRENGTH_AXES } from "../strength/index.mjs";
import { citationOf } from "../citation/index.mjs";
import { basisVersionsOf, versionsIn, versionAsWritten } from "../basis-versions/index.mjs";
import { runPrincipalGate } from "../airun.mjs";
import { EXTRACT_RUN_MODE, proposalChain, checkProposedRef, proposedReadingGrade, mintRatio } from "../extractrun.mjs";
import { readingSource, readingSourceJson, readingSourceFromColumns, describeChain } from "../textchain.mjs";
import { parseFrontmatter, normalizeType, OBJECT_TYPES, canonicalJson, isBoilerplate, isMachineIdentity,
         SUFFICIENCY_UNCLAIMED, MACHINE_CLASS_PREFIX } from "../../checks/bio-checks.mjs";
import { SUGGEST_CHECKS, EXTRACT_PROPOSE_CHECKS, SUGGEST_KINDS, SUGGEST_LEVELS } from "./checks.mjs";
import { RUN_PRODUCTIONS_TABLES, migrateRunProductions } from "./schema.mjs";

export { SUGGEST_CHECKS, EXTRACT_PROPOSE_CHECKS, SUGGEST_KINDS, SUGGEST_LEVELS, SUGGEST_CHECK_KEYS,
         EXTRACT_PROPOSE_CHECK_KEYS, ROWLESS_CODES } from "./checks.mjs";
export { RUN_PRODUCTIONS_SCHEMA, RUN_PRODUCTIONS_TABLES, runProductionsOwns, migrateRunProductions } from "./schema.mjs";
export { runProductionsInterim } from "./interim.mjs";

export const RUN_PRODUCTIONS_MODULE = "run-productions";

/** R3's legs bound: the WRITE cap, below the read cap of 500 (basis-versions R9), because every leg of a reading is a
 *  thing a member must read (§6 rule 4). Published in the refusal that hits it and on every answer (R5). */
export const SUGGEST_LEGS_MAX = 120;
/** The independence trace's origin limit (strength R12, R27): `strength`'s, re-exported as R5's `origin_limit`; the
 *  trace's own `limit` wins where it gives one. */
export const SUGGEST_ORIGIN_MAX = ORIGIN_LIMIT;
/** C-27.16's second bound: basis-versions' read maximum (its R9). A question holding more versions than a comparison
 *  reads cannot be said to hold none the same in substance. */
export const SUGGEST_VERSIONS_MAX = 1000;
/** The fields only a member's act writes (R3, C-27.13; D-271 adds the two affirmations). */
export const SUGGEST_UNWRITABLE_FIELDS = Object.freeze(["state", "hidden", "state_by", "state_at", "state_reason", "at",
                                                        "affirmed_parts", "affirmed"]);
/** The three axes strength answers (strength's Terms), never composed into one value (DEC-21, DEC-44). */
export const PAIR_AXES = Object.freeze([...STRENGTH_AXES]);

/** R12's bounds. */
export const EXTRACT_PROPOSALS_LIMIT_DEFAULT = 100;
export const EXTRACT_PROPOSALS_LIMIT_MAX = 500;
/** The ratio's documents: workerd binds about 100 variables per statement (D-36), so the IN list is capped and the
 *  answer says when it was. */
export const EXTRACT_RATIO_DOCUMENTS_MAX = 64;

export const EXTRACT_PROPOSALS_SAYS = "these readings are PROPOSALS. A machine read text this record already holds and "
  + "said what it names. Nothing here is part of a finding until a MEMBER cites it, and none of it counts as extraction "
  + "coverage";
export const EXTRACT_PROPOSAL_ROW_SAYS = "a machine proposed this reading. It is not extraction coverage and it is not "
  + "part of any finding — it becomes part of one when a MEMBER cites it, and not before";

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const HEX64 = /^[0-9a-f]{64}$/;

/** The per-arm fields of a reading position without kind and ref, which is exactly the shape a content extent takes:
 *  one function, because the two are one vocabulary (IC-1) seen from two tables. */
export function posFields(pos) {
  const { kind, ref, ...rest } = pos;
  return rest;
}

/** WHAT A SUGGESTION WILL HOLD is basis-versions' `versionAsWritten` (its R5, REC-75, D-234): the one normaliser the
 *  write and C-27.10's comparison both read. A level is carried by the empty-level kind only.
 *
 *  The candidate as a frontmatter object, so its canonical composition is basis-versions' one composer's (its R5)
 *  over exactly the shape the document will hold, never a second composer. */
export function suggestionFrontmatter(id, p) {
  const name = p.version.name;
  return {
    id,
    basis_versions: [{ name, kind: p.version.kind, description: p.version.description, claim: p.version.claim,
                       relationship: p.version.relationship, state: "suggested", hidden: false,
                       derived_from: p.version.derived_from, run: p.version.run, author: p.version.author,
                       at: p.version.at }],
    basis_version_grounds: p.grounds.map((g) => ({ version: name, ground: g.ground, asserted_by: g.asserted_by,
                                                   at: g.at, statement: g.statement })),
    basis_version_legs: p.legs.map((l) => ({
      version: name, target: l.target, role: l.role, ground: l.ground, grade: l.grade, grade_axis: l.grade_axis,
      grade_source: l.grade_source, note: l.note, date: l.date, extent_kind: l.extent_kind,
      ...(l.extent_capture ? { extent_capture: l.extent_capture } : {}) })),
  };
}

/** WHAT C-27.10 COMPARES (§6 rule 8): the canonical composition with its name, its parentage and the clock taken out.
 *  A name is how a reading is addressed and `derived_from` where it came from; when it was recorded (field 3 of a
 *  ground row, D-231) is not a thing it says. The composition escapes tabs inside values, so a real tab splits
 *  fields exactly. */
export function substanceOf(composition) {
  return String(composition).split("\n")
    .filter((ln) => !/^name\t/.test(ln) && !/^derived_from\t/.test(ln))
    .map((ln) => (ln.startsWith("ground\t") ? ln.split("\t").map((f, i) => (i === 3 ? "" : f)).join("\t") : ln))
    .join("\n");
}

export class RunProductions {
  constructor({ storage, record, membership, content, connections, aiRuns, strength, citation, basisVersions,
                now = null }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.content = content;
    this.connections = connections;
    this.aiRuns = aiRuns;
    this.strength = strength;
    this.citation = citation;
    this.basisVersions = basisVersions;
    this.now = typeof now === "function" ? now : () => Date.now();
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** The module's tables (R2, R11, R17). */
  migrate() { migrateRunProductions(this.sql); }

  /* ==================================================================== *
   * PL-3 / IS-4 — THE SUGGEST ENDPOINT. ONE WRITE PATH FOR BOTH MODES (R1–R9).
   *
   * §10 makes this one endpoint rather than two: the background job and the interactive session are two ways into one
   * piece of work, and the fence needs no second design. THE SOLE POSSIBLE OUTPUT IS A `suggested` VERSION CARRYING ITS
   * RUN: all five of §9's kinds write that one object, the kind a field on it. THE ACCEPTANCE IS THE PRE-WRITE CHECKS
   * AND THEY ARE PLANE-SIDE (§14b.5): each has its own C-number and canned translation, and the fleet member receives
   * their verdicts. Every refusal is written as `refusal("<CODE>", …)` with the code a LITERAL, so the DEC-49 guard's
   * arm C can see and compare it (REC-71).
   * ==================================================================== */

  /** op=suggest — the investigative session's ONE write (R1–R9). `author`, `viewer` and `caller` are the control
   *  plane's stamps (R8). */
  suggest(a = {}) {
    const args = a || {};
    const refusal = (code, detail, extra) => {
      const row = SUGGEST_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };
    const str = (x) => (typeof x === "string" && x.trim() !== "" ? x.trim() : null);
    const viewer = args.viewer ?? null;

    /* DEC-49 REGION is-suggest-shape
     *
     * R1: the shape of the request, refused in order before anything is composed. A REGION and not the whole
     * function, so a refusal arriving here later is not conscripted into these rows (REC-71). */
    const target = String(args.target ?? "").trim();
    if (!target)
      return refusal("SUGGEST_NO_TARGET",
        "a suggestion is a reading of ONE question's evidence: pass target=<INQ-…>. There is no "
        + "default question and there must not be one.");
    if (normalizeType(OBJECT_TYPES[target.split("-")[0]]) !== "inquiry")
      return refusal("SUGGEST_NOT_AN_INQUIRY",
        `${target.slice(0, 60)} is not an inquiry, so there is nothing under it for a version to be a `
        + `version of.`, { target });

    const kind = String(args.kind ?? "").trim();
    if (!Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, kind))
      return refusal("SUGGEST_UNKNOWN_KIND",
        `'${kind.slice(0, 40) || "(none)"}' is not one of §9's kinds: ${Object.keys(SUGGEST_KINDS).join(", ")}. `
        + `The set is closed because §15's empty-run instrument needs an object to count — without `
        + `'level-empty' a run that honestly found nothing is indistinguishable from a run that emitted `
        + `nothing.`,
        { target, kinds: Object.keys(SUGGEST_KINDS) });

    /* The viewer gate, fail-closed (D-15): a question the caller may not see answers exactly as an absent one. */
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.bundle_sha FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b)
      return refusal("SUGGEST_NOT_AN_INQUIRY",
        "no question by that id is readable here, so there is nothing to add a reading to.", { target });

    /* §11: EVERY VERSION NAMES THE RUN THAT PRODUCED IT. Three questions of the run, in this order, and all BEFORE
       R2's memo, whose key carries no caller (REC-165): (a) SIGHT — `ai-runs.runFor` answers null for an absent and
       an invisible run alike, so both read as the same SUGGEST_NO_RUN but for the id (§7.9); (b) POSITION — ai-runs'
       R5, relayed whole; (c) STATUS — a version is formed under a LIVE run's conditions (rule 1). Then (d), BOB #28's
       target rule, after sight and position so a hidden run still reads as absent. */
    const run = String(args.run ?? "").trim();
    const runRow = run ? this.aiRuns.runFor(run, viewer) : null;
    if (!runRow)
      return refusal("SUGGEST_NO_RUN",
        run ? `no run named '${run.slice(0, 60)}' is open in this store, and a version is only `
              + `interpretable against the conditions its run was formed under (§11).`
            : "pass run=<the run that composed this>: §11 requires every version to name the piece of "
              + "work that produced it, because the bias in force, the declared standard and the claim "
              + "set can all change at the drop of a hat.",
        { target, run: run || null });
    const notPrincipal = runPrincipalGate({ caller: args.caller ?? null, principal: runRow.principal_plane,
                                            act: "suggesting a reading under a run" });
    /* RELAYED FIELD BY FIELD AND NEVER SPREAD, so the DEC-49 guard can read the verdict; the code, check and
       translation are the gate's own (C-22.12). */
    if (notPrincipal)
      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,
               translation: notPrincipal.translation, detail: notPrincipal.detail, target, run,
               note: "a suggestion names a run its caller holds. Nothing was composed or written" };
    if (runRow.status !== "running")
      return refusal("SUGGEST_RUN_NOT_RUNNING",
        `the run '${run.slice(0, 60)}' has ended, and a version is formed under a LIVE run's conditions `
        + `(§11 item 5, rule 1): open a new run to go on working, as the member's act.`,
        { target, run });
    /* (d) A SUGGESTION LANDS ONLY INSIDE ITS RUN'S CONTEXT: the context itself, or, for a run over a project, a
       question that project CONFIRMED-cites (`connections.citesInto`, the one live-cites predicate). */
    const ctxId = String(runRow.context_id ?? "");
    const inContext = target === ctxId
      || (String(runRow.context_type) === "project" && this.connections.citesInto(target).confirmed.includes(ctxId));
    if (!inContext)
      return refusal("SUGGEST_OUTSIDE_RUN_CONTEXT",
        `${target.slice(0, 60)} is outside the context of the run '${run.slice(0, 60)}': a run's readings `
        + `land on its own question, or, for a run over a project, on a question that project cites. Work on `
        + `another question opens a run over it.`,
        { target, run });

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return refusal("SUGGEST_NO_DOCUMENT",
        "this question has no readable file, so no reading can be added to it.", { target });
    const fm0 = parseFrontmatter(liveMd.content).data || {};
    const existing = Array.isArray(fm0.basis_versions) ? fm0.basis_versions : [];

    /* §6 rule 2, COMPARED AS WRITTEN (REC-75, D-234): the held names went through the grammar's escape at their
       write, so the caller's name is compared after it too, or a name the escape folds would pass here and be
       refused at the promotion in another family's words. */
    const name = String(args.name ?? "").trim();
    const nameWritten = versionAsWritten({ name }).version.name;
    if (existing.some((r) => r && typeof r === "object" && String(r.name ?? "").trim() === nameWritten))
      return refusal("SUGGEST_NAME_TAKEN",
        `'${name.slice(0, 60)}' already names a reading of ${target}. §6 rule 2: a version name is `
        + `unique WITHIN its inquiry, and derived_from reads by name.`,
        { target, name, known: existing.map((r) => String(r?.name ?? "").trim()).filter(Boolean).slice(0, 20) });

    const legsIn = Array.isArray(args.legs) ? args.legs : [];
    if (legsIn.length > SUGGEST_LEGS_MAX)
      return refusal("SUGGEST_TOO_MANY_LEGS",
        `${legsIn.length} legs were submitted and a version may carry ${SUGGEST_LEGS_MAX}. The `
        + `bound is PUBLISHED here rather than applied silently, so a caller splits the reading rather `
        + `than guessing what fitted.`,
        { target, legs: legsIn.length, limit: SUGGEST_LEGS_MAX });

    /* §9's empty-level kind says WHICH level and WHERE THE SEARCH IS LOGGED: absence at one level is not evidence of
       absence at the next, and an unattributed empty answer is the shape nobody can check. */
    const level = str(args.level);
    const observedAt = str(args.observed_at);
    if (kind === "level-empty" && (!level || !SUGGEST_LEVELS.includes(level) || !observedAt))
      return refusal("SUGGEST_EMPTY_LEVEL_UNSTATED",
        `kind=level-empty carries level=<${SUGGEST_LEVELS.join("|")}> and observed_at=<the observation-log `
        + `address of the search that establishes it>. Absence at one level is not evidence of absence at `
        + `the next, and an unattributed empty answer is the one shape a later reader cannot check.`,
        { target, level, observed_at: observedAt, levels: SUGGEST_LEVELS });
    /* END DEC-49 REGION is-suggest-shape */

    /* ---- R2 (F10). THE SUBMISSION'S IDENTITY, AND THE STRUCTURAL NO-OP.
     *
     * A verbatim resubmit changes NOTHING: the stored refusal comes back unaltered, no check runs again, no document
     * is touched and no version is written; only its counter moves (instrumentation, §15). THE KEY IS THE SUBMISSION
     * ITSELF, BYTE FOR BYTE, never a hash, and the question's `bundle_sha` is part of it: the moment the document
     * moves, the same bytes are a different question and are judged afresh. The refusals above, which fire before a
     * target resolves or before the run is known to be the caller's, are never stored. The fields §4 forbids ride the
     * key too, each with a prefix, so a caller that fixes one is genuinely re-evaluated. */
    const submission = canonicalJson({
      kind, name, description: args.description ?? null, claim: args.claim ?? null,
      relationship: args.relationship ?? null, derived_from: args.derived_from ?? null,
      level, observed_at: observedAt, run,
      grounds: (Array.isArray(args.grounds) ? args.grounds : []).map((g) => ({
        ground: g?.ground ?? null, statement: g?.statement ?? null, asserted_by: g?.asserted_by ?? null })),
      legs: legsIn.map((l) => ({
        target: l?.target ?? null, role: l?.role ?? null, ground: l?.ground ?? null,
        grade: l?.grade ?? null, grade_axis: l?.grade_axis ?? null,
        grade_source: l?.grade_source ?? null, note: l?.note ?? null, date: l?.date ?? null,
        ...(l?.extent_capture !== undefined ? { extent_capture: l.extent_capture } : {}) })),
      refused_state: args.state ?? null, refused_hidden: args.hidden ?? null,
      refused_state_by: args.state_by ?? null, refused_state_at: args.state_at ?? null,
      refused_state_reason: args.state_reason ?? null, refused_at: args.at ?? null,
      refused_affirmed_parts: args.affirmed_parts ?? null, refused_affirmed: args.affirmed ?? null,
    });
    const nowIso = stampInstant("second", this.now());
    const prior = this.#one(
      `SELECT * FROM suggest_refusals WHERE target=? AND base_sha=? AND submission=?`,
      target, b.bundle_sha, submission);
    if (prior) {
      this.sql.exec(
        `UPDATE suggest_refusals SET repeats = repeats + 1, last_at = ? WHERE target=? AND base_sha=? AND submission=?`,
        nowIso, target, b.bundle_sha, submission);
      const stored = JSON.parse(prior.payload);
      return { ...stored, repeated: true, evaluated: false, wrote: false,
               repeats: prior.repeats + 1, first_refused_at: prior.first_at };
    }
    /* One helper, so every refusal below is stored by the SAME path it is returned by (R3's last sentence). */
    const remember = (r) => {
      this.sql.exec(
        `INSERT INTO suggest_refusals (target, submission, base_sha, code, payload, first_at, last_at, repeats)
         VALUES (?,?,?,?,?,?,?,0)`,
        target, submission, b.bundle_sha, r.code, JSON.stringify(r), nowIso, nowIso);
      return { ...r, repeated: false, evaluated: true, wrote: false };
    };

    /* DEC-49 REGION is-suggest-checks
     *
     * R3: §14b.5's checks, each its own C-number, each removable on its own, in the order a caller can most cheaply
     * act on. */

    /* C-27.13 — NOTHING IN IT IS IN A STATE THE SESSION MAY NOT WRITE (§4: the AI holds no op that accepts). A
       submission that arrives already decided, or pre-affirmed (D-271), is refused by name rather than ignored. */
    const forbidden = SUGGEST_UNWRITABLE_FIELDS
      .filter((k) => args[k] !== undefined && args[k] !== null && args[k] !== "");
    if (forbidden.length)
      return remember(refusal("SUGGEST_UNWRITABLE_STATE",
        `a suggestion is born in state 'suggested' and carries nothing else about what has been decided `
        + `about it, and this submission set: ${forbidden.join(", ")}. Every one of those is a member `
        + `act (§6 rule 4) reachable only through op=versionaccept and its five siblings.`,
        { target, name, fields: forbidden }));

    /* AND THE STRUCTURAL ASSERTION ONLY A MEMBER CAN MAKE (C-25.5, C-25.6). Every version carrying legs declares at
       least one part, and a part is asserted by a named member. PL-19 / DEC-65's single-part licence: a machine may
       compose a reading declaring EXACTLY ONE part (one part has no maximum to take, so nobody is credited with a
       structural claim), never two or more; an UNNAMED credential never. `asserted_by` is stamped from the session,
       never taken from the caller. */
    const who = String(args.author ?? "").trim();
    const groundsIn = Array.isArray(args.grounds) ? args.grounds : [];
    const declared = groundsIn.map((g) => str(g?.ground)).filter(Boolean);
    const declaredParts = [...new Set(declared)];
    const singlePart = declaredParts.length === 1 && declared.length === 1 && legsIn.length > 0;
    if ((declared.length || legsIn.length > 0) && (!who || (isMachineIdentity(who) && !singlePart)))
      return remember(refusal("SUGGEST_UNWRITABLE_STATE",
        `this reading rests on ${legsIn.length} piece(s) of evidence arranged into ${declared.length || "no"} `
        + `declared part(s), and the credential that submitted it is ${who ? "a machine" : "unnamed"}. A `
        + `reading that rests on anything CARRIES the arrangement of what it rests on (C-25.5), and saying `
        + `a part of an argument would carry the answer on its own is an authored judgment a named member `
        + `signs for (C-25.6). A machine COMPOSES a reading and does not assert its structure — it may `
        + `put everything it rests on into ONE part, where there is nothing to assert because there is no `
        + `maximum to take, and it may still report that a level of the search is empty, which rests on `
        + `nothing and asserts nothing.`,
        { target, name, legs: legsIn.length, branches: declared.length }));

    /* C-27.12 — NO BOILERPLATE: the placeholder defect at machine scale, held to the catalogue's one predicate. */
    const filler = [];
    if (isBoilerplate(args.description)) filler.push("description");
    if (args.claim !== undefined && args.claim !== null && args.claim !== ""
        && isBoilerplate(args.claim)) filler.push("claim");
    if (str(args.description) && str(args.claim)
        && str(args.description).toLowerCase() === str(args.claim).toLowerCase()) filler.push("claim (repeats the description verbatim)");
    for (const g of groundsIn)
      if (g && g.statement !== undefined && g.statement !== null && g.statement !== ""
          && isBoilerplate(g.statement)) filler.push(`a statement on '${String(g.ground).slice(0, 40)}'`);
    for (let i = 0; i < legsIn.length; i++)
      if (legsIn[i] && legsIn[i].note !== undefined && legsIn[i].note !== null && legsIn[i].note !== ""
          && isBoilerplate(legsIn[i].note)) filler.push(`the note on leg ${i}`);
    if (filler.length)
      return remember(refusal("SUGGEST_BOILERPLATE",
        `${filler.join(", ")} carries filler rather than an account of anything. §6 rule 1 holds a `
        + `version's description to a commit message's standard — what changed and why — because it is `
        + `what survives a conversation that was deliberately not kept (§10).`,
        { target, name, fields: filler }));

    /* C-27.8 — EVERY LEG EXISTS AND IS REACHABLE AT ITS ADDRESS (D-168: a type check would pass retired
       information). Three questions: is it IN the record, READABLE from here, and has the record RETIRED it
       (`citation.retiredNotCitable`, the one predicate, never viewer-gated: the viewer decides only the wording).
       R9 (D-595) adds a fourth for a document leg: the capture it rests on. A capture the leg names must be one the
       record holds for that document (`content.captureFor`'s authored arm); a leg naming none rests on the capture the
       record presents for it now, and a leg on a question rests on none. */
    const unreachable = [];
    const pins = [];
    for (let i = 0; i < legsIn.length; i++) {
      const t = str(legsIn[i]?.target);
      pins.push(null);
      if (!t) { unreachable.push({ ord: i, target: null, why: "no address" }); continue; }
      const retired = this.citation.retiredNotCitable(t);
      const row = this.#one(`SELECT b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, t, ...gate.args);
      if (!row) { unreachable.push({ ord: i, target: t, why: "not in the record, or not readable from here" }); continue; }
      if (retired) { unreachable.push({ ord: i, target: t, why: "the record has RETIRED it" }); continue; }
      const named = legsIn[i]?.extent_capture;
      const isDoc = normalizeType(row.object_type) === "information";
      if (named !== undefined && named !== null && named !== "") {
        const held = isDoc && typeof named === "string" && HEX64.test(named) ? this.content.captureFor(t, named) : null;
        if (!held) { unreachable.push({ ord: i, target: t, why: "the capture it names is not one this record holds for it" }); continue; }
        pins[i] = held;
      } else if (isDoc) pins[i] = this.content.captureFor(t) || null;
    }
    if (unreachable.length)
      return remember(refusal("SUGGEST_LEG_UNREACHABLE",
        `${unreachable.length} of ${legsIn.length} legs cannot be reached at the address given: `
        + `${unreachable.map((u) => `${u.target ?? "(none)"} — ${u.why}`).join("; ")}. A type check would `
        + `have passed every one of these, which is D-168 exactly.`,
        { target, name, legs: unreachable }));

    /* C-27.9 — THE PAIR COMPUTES, PER AXIS, OVER THE DECLARED PARTITION: two answers over two populations, never one
       (DEC-21, DEC-44), computed by strength over the candidate's legs (its R26), never a second walk. The partition
       the legs sit in is compared against the one declared: a leg in a part nobody declared would let the maximum be
       taken over it, and a declared part holding no leg asserts nothing is sufficient on its own. Compared as
       serialised lists, since a part's label may hold a space. */
    const candidateLegs = legsIn.map((l) => ({
      target: str(l?.target) ?? "", role: typeof l?.role === "string" ? l.role : "",
      grade: l?.grade ?? null, grade_axis: l?.grade_axis ?? null, grade_source: l?.grade_source ?? null,
      ground: str(l?.ground) ?? null }));
    const { pair, error: pairError } = this.strength.candidatePair({ inquiry: target, legs: candidateLegs });
    const legal = ["graded", "unrated", "undetermined"];
    const axisBad = (x) => !x || !legal.includes(x.state) || (x.state === "graded" && (x.grade == null || !x.weakest));
    const usedLabels = [...new Set(candidateLegs.map((l) => l.ground).filter(Boolean))].sort();
    const declaredLabels = [...new Set(declared)].sort();
    const partitionDisagrees = JSON.stringify(usedLabels) !== JSON.stringify(declaredLabels);
    if (pairError || PAIR_AXES.some((x) => axisBad(pair?.[x])) || partitionDisagrees)
      return remember(refusal("SUGGEST_PAIR_DOES_NOT_COMPUTE",
        pairError
          ? `the arithmetic could not be run over this reading: ${pairError}`
          : partitionDisagrees
            ? `this reading declares [${declaredLabels.join(", ") || "none"}] as its separately `
              + `sufficient parts and its legs sit in [${usedLabels.join(", ") || "none"}]. A version `
              + `CARRIES its own structure (§3), so the two have to be the same set — otherwise the `
              + `maximum is taken over a part nobody declared, or a declared part holds nothing.`
            : `the pair did not resolve on every axis: `
              + `${PAIR_AXES.map((x) => `${x}=${pair?.[x]?.state ?? "(none)"}`).join(", ")}.`,
        { target, name, declared: declaredLabels, used: usedLabels,
          pair: pair ? Object.fromEntries(PAIR_AXES.map((x) => [x, pair[x]?.state ?? null])) : null }));

    /* C-27.16 and C-27.11 — D-195, INDEPENDENCE OVER THE SEPARATELY SUFFICIENT PARTS, from content-addressed
       provenance (strength R27, the one implementation `op=versionstrength` publishes too). A trace cut at its origin
       limit is UNDETERMINED, never independent (D-129): not found and did not finish looking are different facts. */
    const ind = this.strength.candidateIndependence({ legs: candidateLegs, parts: declaredLabels.length });
    const originLimit = Number.isSafeInteger(ind?.limit) ? ind.limit : SUGGEST_ORIGIN_MAX;
    const shared = Array.isArray(ind?.shared) ? ind.shared : [];
    const originsComplete = ind?.complete !== false;
    if (ind?.checked && ind.complete === false)
      return remember(refusal("SUGGEST_COMPARISON_INCOMPLETE",
        `tracing the separately sufficient parts of this reading back to their upstream material `
        + `reached the published bound of ${originLimit} per step, so independence is UNDETERMINED rather than `
        + `established. D-129: not found and did not finish looking are different facts, and only one `
        + `of them licenses putting this forward.`,
        { target, name, limit: originLimit, origins_complete: false }));
    if (shared.length)
      return remember(refusal("SUGGEST_BRANCHES_NOT_INDEPENDENT",
        `${shared.length} pair(s) of separately sufficient parts trace to the same upstream material: `
        + `${shared.map((s) => `'${s.a}' and '${s.b}' through ${s.through.join(", ")}`).join("; ")}. `
        + `§12 takes the MAXIMUM across them, so treating them as separate overstates the finding — `
        + `D-195. A named member may still affirm they are genuinely separate at the accept ceremony; a `
        + `machine composing at volume may not.`,
        { target, name, shared }));

    /* C-27.10 — DIFFERS IN SUBSTANCE FROM EVERY EXISTING VERSION (§6 rule 8, the write gate). The candidate is
       composed from the values the write will store (REC-75) by basis-versions' one composer, and compared with every
       held composition (basis-versions' R38 read contract) with the name, the parentage and the clock taken out
       (`substanceOf`). A comparison that did
       not reach every held reading cannot say this one is new, so past the bound it fails closed (C-27.16). */
    const persisted = versionAsWritten({
      kind, name, description: args.description, claim: args.claim,
      relationship: args.relationship, derived_from: args.derived_from,
      run, author: who || null, at: nowIso,
      level: kind === "level-empty" ? level : null, observed_at: kind === "level-empty" ? observedAt : null,
      grounds: groundsIn, legs: legsIn.map((l, i) => ({ ...l, extent_capture: pins[i] })),
    });
    const candidate = versionsIn(suggestionFrontmatter(target, persisted))[0] ?? null;
    const mine = candidate ? substanceOf(candidate.composition) : "";
    const held = this.#rows(
      `SELECT name, composition FROM inquiry_basis_versions WHERE bundle_id=? LIMIT ?`, target, SUGGEST_VERSIONS_MAX + 1);
    if (held.length > SUGGEST_VERSIONS_MAX)
      return remember(refusal("SUGGEST_COMPARISON_INCOMPLETE",
        `${target} holds more than ${SUGGEST_VERSIONS_MAX} readings, which is the bound this `
        + `comparison publishes, so whether this one differs in substance from every existing one was `
        + `not settled. A duplicate the comparison never reached would read exactly like a new reading.`,
        { target, name, limit: SUGGEST_VERSIONS_MAX }));
    const twin = held.find((r) => substanceOf(r.composition) === mine);
    if (twin)
      return remember(refusal("SUGGEST_NOT_DIFFERENT",
        `this reading is identical in substance to '${twin.name}', which ${target} already holds. §6 rule `
        + `8 is the write gate: a run adds its output as a new version ONLY IF it differs in substance `
        + `from every existing one. Compared over the same canonical composition the freeze compares, `
        + `with the name and the parentage excluded — those are how a reading is addressed, not what it `
        + `says.`,
        { target, name, same_as: twin.name }));
    /* END DEC-49 REGION is-suggest-checks */

    /* DEC-49 REGION is-suggest-write
     *
     * R4: THE WRITE, AND THERE IS NO SECOND WRITE PATH. basis-versions appends the version to the question's own
     * document and promotes it (its R28), so the document stays the authority (D-21) and the promotion judges it. The
     * Session Log entry names the run. A document the grammar cannot extend in place (its `UNSPLICEABLE_BASIS`) is
     * C-27.14; any other refusal of the write, basis-versions' or the promotion's, is returned unchanged, and stored
     * under the same key (R2). */
    const pv = persisted.version;
    const promoted = this.basisVersions.appendVersion({
      target,
      version: { name: pv.name, kind: pv.kind, description: pv.description,
                 ...(pv.claim === null ? {} : { claim: pv.claim }), relationship: pv.relationship,
                 derived_from: pv.derived_from, run: pv.run,
                 ...(pv.author === null ? {} : { author: pv.author }), at: pv.at,
                 ...(pv.level === null ? {} : { level: pv.level }),
                 ...(pv.observed_at === null ? {} : { observed_at: pv.observed_at }) },
      grounds: persisted.grounds.map((g) => ({ ground: g.ground, asserted_by: g.asserted_by, at: g.at,
                                               ...(g.statement === null ? {} : { statement: g.statement }) })),
      legs: persisted.legs.map((l) => Object.fromEntries(Object.entries(l).filter(([, v]) => v !== null))),
      author: pv.author, at: pv.at,
      log: `### Session ${nowIso} | Suggestion | ${who || run}\n`
         + `Trigger: op=suggest on ${target}\n`
         + `Changes: reading '${name}' proposed as ${kind}, in state suggested, carrying run ${run}.\n`,
    });
    if (promoted && promoted.ok === false && promoted.reason === "UNSPLICEABLE_BASIS")
      return remember(refusal("SUGGEST_UNWRITABLE_DOCUMENT",
        "this question's version block is in a shape the restricted frontmatter grammar cannot be "
        + "extended in place, so nothing was written. The grammar has no escapes and a guess would "
        + "corrupt the document silently.", { target, name }));
    if (!promoted || !promoted.ok) return remember({ ...promoted, code: promoted?.code ?? promoted?.reason, target, name });
    /* END DEC-49 REGION is-suggest-write */

    /* R5 — THE ANSWER IS ASSEMBLED OUT OF THREE NAMED GROUPS AND LABELS ITSELF (D-235). `record`: read back out of
     * the projection the promotion just wrote, through the read `op=basisversions` answers, so the two ops cannot
     * publish different bytes for one version; null, never a substitute, when the read comes back empty
     * (`read_back` says which). `derived`: computed over this submission and not stored (the pair per axis and the
     * independence trace; `shared_origins` is empty on every pass by construction, and `op=versionstrength` is where
     * a reader finds the recomputed trace). `call`: true of this act. `fields_of` is computed from the groups, never
     * typed, so no field reaches the answer without saying where its bytes came from. */
    const readBack = this.basisVersions.basisVersions({ id: target, limit: SUGGEST_VERSIONS_MAX, viewer });
    const recorded = (readBack && Array.isArray(readBack.versions)
      ? readBack.versions.find((v) => v && v.name === persisted.version.name) : null) || null;
    const fromRecord = {
      target: b.bundle_id,
      version: recorded ? recorded.name : null,
      kind: recorded ? recorded.kind ?? null : null,
      run: recorded ? recorded.run : null,
      state: recorded ? recorded.state : null,
      author: recorded ? recorded.author : null,
      at: recorded ? recorded.at : null,
      legs: recorded ? recorded.legs ?? null : null,
      count: recorded ? recorded.leg_count ?? null : null,
      grounds: recorded ? recorded.grounds ?? null : null,
      ground_count: recorded && Array.isArray(recorded.grounds) ? recorded.grounds.length : null,
      composition: recorded ? recorded.composition : null,
      bundleSha: promoted.bundleSha, rowVersion: promoted.rowVersion,
    };
    const derived = {
      pair: Object.fromEntries(PAIR_AXES.map((x) => [x, pair[x]])),
      shared_origins: shared, origins_complete: originsComplete,
    };
    const call = {
      ok: true, weight: "single",
      limit: SUGGEST_LEGS_MAX, truncated: recorded ? recorded.legs_complete === false : false,
      origin_limit: originLimit,
      evaluated: true, repeated: false, wrote: true, read_back: !!recorded,
    };
    const fields_of = { fields_of: "label", composition_of: "label", composition_grades: "label" };
    for (const [src, group] of [["record", fromRecord], ["derived", derived], ["call", call]])
      for (const k of Object.keys(group)) fields_of[k] = src;
    return {
      ...fromRecord, ...derived, ...call, fields_of,
      composition_of: recorded ? "record" : "unread",
      composition_grades: recorded ? recorded.composition_grades ?? null : null,
    };
  }

  /* ==================================================================== *
   * SK-8 — THE EXTRACT RUN'S PRODUCTIONS (R10–R13; BIO_Assistant_and_AI_Roles_v0_1.md §7.3).
   *
   * EXTRACT runs in DEC-62's RUN — no new runtime, no new credential class, no new fence — and content's mint door is
   * the door it walks through. Everything it refuses is refused by something that already existed; the only new
   * thing is the proposed reading itself. It does not start a run: a run begins on a member's act (DEC-24 rule 2).
   * ==================================================================== */

  /** op=extractpropose — AN EXTRACT RUN PROPOSES READINGS (R10, R11, R15). Every proposal is CHECKED before anything
   *  is written, the batch is written in one transaction, and the bound is consumed by what was ACTUALLY minted. A
   *  proposal that says WHERE it read the reference mints that passage through `content` (on the capture's own chain,
   *  so a member's later citation of the same passage finds this row); one with no position mints nothing. */
  extractPropose({ run, bundleId, fn, version, cap = null, refs, proposedBy, viewer = null, at = null, caller = null }) {
    const refuse = (code, detail, extra) => {
      const row = EXTRACT_PROPOSE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-extract-run */
    /* FAIL CLOSED ON AN ABSENT STAMP: the control plane stamps the proposer, so a blank means the stamp did not run. */
    if (typeof proposedBy !== "string" || !proposedBy.trim())
      return refuse("NO_PROPOSER",
        `a proposed reading records WHO proposed it. The plane stamps that from the credential that asked, so an `
        + `empty one means the act arrived by a route that does not attribute it — which is refused rather than `
        + `filled in`);
    if (typeof run !== "string" || !run.trim())
      return refuse("NO_RUN",
        `EXTRACT runs in DEC-62's RUN and nowhere else: the run is the object that bounds this work, logs it, `
        + `resumes it and checks it plane-side. A production outside one would be a second place a machine writes`);
    const runId = run.trim();
    /* SIGHT, THEN POSITION, THEN STATUS (REC-165): an invisible run answers the SAME NO_SUCH_RUN a never-minted id
       gets, but for the id (§7.9). */
    const r = this.aiRuns.runFor(runId, viewer);
    if (!r)
      return refuse("NO_SUCH_RUN",
        `no run is open under ${runId}. A run begins on a MEMBER's act (op=airunopen), naming the subject and the `
        + `objective — both of which stay the member's (DEC-24 rule 2). The assistant may propose that a run would `
        + `help; it may not start one`, { run: runId });
    /* END DEC-49 REGION is-extract-run */
    const notPrincipal = runPrincipalGate({ caller, principal: r.principal_plane, act: "proposing a reading under a run" });
    if (notPrincipal)
      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,
               translation: notPrincipal.translation, detail: notPrincipal.detail, run: runId,
               note: "a proposed reading names a run its caller holds. Nothing was proposed or minted" };
    /* DEC-49 REGION is-extract-door */
    if (r.status !== "running")
      return refuse("RUN_NOT_RUNNING",
        `this run has ended. Its log is closed and a later production does not reopen it — the conditions a run was `
        + `formed under are what its work is interpretable against, and they stopped being current when it stopped`,
        { run: runId, status: r.status });
    if (String(r.mode || "") !== EXTRACT_RUN_MODE)
      return refuse("NOT_AN_EXTRACT_RUN",
        `this run was opened in mode '${r.mode == null ? "(none)" : String(r.mode)}' and a proposed reading is the `
        + `EXTRACT role's production. A run's mode is one of the conditions it was formed under: it is read back, never `
        + `widened by the work`, { run: runId, mode: r.mode ?? null });
    /* THE BOUND, ASKED BEFORE ANY WORK IS DONE (§7.3 (5)). A bound nobody declared is an UNBOUNDED one, so it is a
       refusal here rather than a default allowance invented in code. */
    const bound = this.aiRuns.boundOf(runId, "mints");
    if (!bound || !(Number(bound.allowed) > 0))
      return refuse("NO_MINTS_BOUND",
        `this run declares no 'mints' bound, so its productions would be unbounded — and a machine that may mark `
        + `passages citable without a bound produces a store of proposals nobody cited, each correctly labelled and `
        + `the whole unexamined. The bound is declared at op=airunopen, by the member who opens the run`, { run: runId });
    if (Number(bound.consumed) >= Number(bound.allowed))
      return refuse("MINTS_BOUND_REACHED",
        `this run has reached its 'mints' bound (${Number(bound.consumed)} of ${Number(bound.allowed)}). The next `
        + `tick ends the run, and the log says which bound stopped it and where`,
        { run: runId, allowed: Number(bound.allowed), consumed: Number(bound.consumed) });
    const list = Array.isArray(refs) ? refs : [];
    if (list.length === 0)
      return refuse("NO_PROPOSALS",
        `a proposed reading carries what the machine found. An EMPTY one is not a reading that found nothing — that `
        + `is an observation about a LOOK, and it belongs in the run's log, where absence is first-class and says `
        + `which of the four levels it was`);
    /* END DEC-49 REGION is-extract-door */
    /* The target, D-15 and the bytes, asked ONCE for the batch in content's mint door's words (its R15). NO_TARGET and
       NO_SUCH_BUNDLE carry no row (R13, K163); an absent and an invisible document answer alike. */
    if (typeof bundleId !== "string" || !bundleId.trim())
      return { ok: false, reason: "NO_TARGET", code: "NO_TARGET", detail: `a proposed reading names the document it was read from` };
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, bundleId);
    if (!b || !this.membership.inSight(bundleId, viewer))
      return { ok: false, reason: "NO_SUCH_BUNDLE", code: "NO_SUCH_BUNDLE", target: bundleId,
               detail: `no document is addressed by ${bundleId} in this record` };
    /* DEC-49 REGION is-extract-document */
    if (normalizeType(b.object_type) !== "information")
      return refuse("NOT_A_DOCUMENT",
        `${bundleId} is not a document, so there is no text to have read. The content axis ranges over documents `
        + `(DEC-21)`, { target: bundleId, target_type: normalizeType(b.object_type) ?? null });
    const sha = this.content.captureFor(bundleId);
    if (!sha)
      return refuse("NO_BYTES_HELD",
        `this record holds no capture of ${bundleId}, so there is no text a machine could have read. Absence here is `
        + `a fact about what was captured and never evidence about what the document says`, { target: bundleId });
    /* END DEC-49 REGION is-extract-document */
    const ctx = this.content.contentContextFor(sha);
    /* THE CHAIN, BUILT ONCE FOR THE BATCH through `appendStep`: its refusal (TEXT_CHAIN_STRENGTHENS, …) comes back
       untouched (extraction R43). */
    const built = proposalChain(ctx.chain, { fn, version, cap });
    if (!built.ok) return built;
    /* EVERY PROPOSAL CHECKED BEFORE ANYTHING IS WRITTEN, the batch refused WHOLE on the first bad entry, naming its
       ordinal (extraction R42's own refusal): a partly-written batch would spend the bound on work the caller does not
       know it did. */
    const rows = [];
    for (const [i, e] of list.entries()) {
      const bad = checkProposedRef(e);
      if (bad) return { ...bad, at_index: i };
      const { grade, why } = proposedReadingGrade(e);
      rows.push({ ref: String(e.ref).trim().slice(0, 400),
                  refKind: e.refKind == null ? null : String(e.refKind).slice(0, 100),
                  refKey: e.refKey == null ? null : String(e.refKey).slice(0, 200),
                  label: e.label == null ? null : String(e.label).slice(0, 400),
                  grade, why, pos: e.source == null ? null : readingSource(e.source) });
    }
    /* DEC-49 REGION is-extract-whole-batch */
    /* AND THE BOUND IS ASKED AGAINST THE SIZE OF THE BATCH: one that would pass the allowance is refused WHOLE and
       never trimmed, since trimming would silently drop proposals the caller believes it filed (D-129). */
    const willMint = rows.filter((x) => x.pos != null).length;
    if (Number(bound.consumed) + willMint > Number(bound.allowed))
      return refuse("MINTS_BOUND_WOULD_EXCEED",
        `this batch would mark ${willMint} passage(s) citable and this run has `
        + `${Number(bound.allowed) - Number(bound.consumed)} left of its 'mints' bound. It is refused whole rather `
        + `than truncated: a batch trimmed to fit would drop proposals the caller believes it filed`,
        { run: runId, allowed: Number(bound.allowed), consumed: Number(bound.consumed), would_mint: willMint });
    /* END DEC-49 REGION is-extract-whole-batch */

    const when = at || new Date(this.now()).toISOString();
    const by = proposedBy.trim();
    const fnVersion = String(version).trim();
    const out = [];
    let minted = 0;
    this.record.transact(() => {
      for (const x of rows) {
        let contentId = null;
        if (x.pos != null) {
          /* A REFUSED MINT DOES NOT REFUSE THE PROPOSAL: the reading was still read, and "we could not make this
             citable" and "this was never proposed" are different facts. The refusal is carried whole (code, check,
             detail) and never dropped. */
          const m = this.content.mint({ bundleId, captureSha: sha, extent: { kind: x.pos.kind, ...posFields(x.pos) },
                                        mintedBy: by, at: when, context: ctx });
          if (m.ok) { contentId = m.content_id; if (m.minted) minted += 1; }
          else x.mint_refused = { code: m.code || m.reason || null, check: m.check || null, detail: m.detail || null };
        }
        this.sql.exec(
          `INSERT INTO proposed_readings
             (run, capture_sha, bundle_id, ref, ref_kind, ref_key, label, fn, fn_version,
              chain, cap, earned, pos_kind, pos, pos_ref, content_id, proposed_by, at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(run, capture_sha, ref) DO NOTHING`,
          runId, sha, bundleId, x.ref, x.refKind, x.refKey, x.label,
          fn, fnVersion, JSON.stringify(built.chain), built.cap, x.grade,
          x.pos ? x.pos.kind : null, x.pos ? readingSourceJson(x.pos) : null, x.pos ? x.pos.ref : null,
          contentId, by, when);
        out.push({ ref: x.ref, earned: x.grade, earned_because: x.why, content_id: contentId, position: x.pos,
                   ...(x.mint_refused ? { mint_refused: x.mint_refused } : {}) });
      }
      /* CONSUMED BY WHAT WAS ACTUALLY MINTED, inside the same transaction and only through ai-runs (R18): a batch
         that minted nothing spends nothing. */
      const spent = this.aiRuns.consumeBound(runId, "mints", minted);
      if (spent && spent.ok === false) throw new Error(`run-productions: the mints bound refused ${minted}: ${spent.code}`);
      return { ok: true };
    });
    const after = this.aiRuns.boundOf(runId, "mints");
    return { ok: true, run: runId, bundle_id: bundleId, capture_sha: sha,
             fn, fn_version: fnVersion, chain: built.chain, cap: built.cap,
             /* THE LABEL IS CONTENT'S OWN SENTENCE (its R16), never composed here. */
             mint: mintLabel(by),
             proposed: out, minted,
             bound: after ? { bound: "mints", allowed: Number(after.allowed), consumed: Number(after.consumed) } : null,
             says: EXTRACT_PROPOSALS_SAYS };
  }

  /** op=extractproposals — WHAT AN EXTRACT RUN PROPOSED, AND THE RATIO (R12; §7.3 (6)). The proposals are listed
   *  because a row nobody lists is a row nobody reviews; the ratio sits beside them because it is the instrument that
   *  catches manufacturing. The ratio is over machine-minted CONTENT rows (content's R45 read contract), not over
   *  proposals: §7.3 asks whether the passages a machine marked citable are ever cited. Its documents are the ones this
   *  scope names that the viewer may see, each asked once, so a document the viewer may not see moves neither the list
   *  nor the ratio (an instrument that moved with them would report their existence). */
  extractProposals({ run = null, bundleId = null, viewer = null, limit = EXTRACT_PROPOSALS_LIMIT_DEFAULT } = {}) {
    const n = Math.max(1, Math.min(EXTRACT_PROPOSALS_LIMIT_MAX, Math.floor(Number(limit)) || EXTRACT_PROPOSALS_LIMIT_DEFAULT));
    const where = [], args = [];
    const runId = run != null && String(run).trim() ? String(run).trim() : null;
    const bundleArm = bundleId != null && String(bundleId).trim() ? String(bundleId).trim() : null;
    if (runId) { where.push("run = ?"); args.push(runId); }
    if (bundleArm) { where.push("bundle_id = ?"); args.push(bundleArm); }
    /* DEC-49 REGION is-extract-scope */
    if (where.length === 0) {
      const row = EXTRACT_PROPOSE_CHECKS.EXTRACT_NO_SCOPE;
      return { ok: false, reason: "EXTRACT_NO_SCOPE", code: "EXTRACT_NO_SCOPE", check: row.check,
               translation: row.translation,
               detail: `this read answers about a RUN or about a DOCUMENT. An unscoped listing of every proposal in the `
                     + `record would be a scan, and a number nobody can act on` };
    }
    /* END DEC-49 REGION is-extract-scope */
    /* THE VIEWER'S GATE IS IN THE STATEMENT (membership's one predicate, over the alias `b`), so a proposal about a
       document the viewer may not see is not a row at all (not a redacted one) and the LIMIT and `truncated` range
       over what the viewer may see. The ratio's documents are read the same way, one past their cap to know it was
       cut. */
    const gate = viewerPredicate(viewer);
    const scoped = where.map((w) => `pr.${w}`).join(" AND ");
    const rows = this.#rows(
      `SELECT pr.run, pr.capture_sha, pr.bundle_id, pr.ref, pr.ref_kind, pr.ref_key, pr.label, pr.fn, pr.fn_version,
              pr.chain, pr.cap, pr.earned, pr.pos_kind, pr.pos, pr.pos_ref, pr.content_id, pr.proposed_by, pr.at
         FROM proposed_readings pr JOIN bundles b ON b.bundle_id = pr.bundle_id
        WHERE ${scoped} AND (${gate.sql})
        ORDER BY pr.at DESC, pr.ref ASC
        LIMIT ?`, ...args, ...gate.args, n + 1);
    const docs = this.#rows(
      `SELECT DISTINCT pr.bundle_id FROM proposed_readings pr JOIN bundles b ON b.bundle_id = pr.bundle_id
        WHERE ${scoped} AND (${gate.sql}) ORDER BY pr.bundle_id LIMIT ?`,
      ...args, ...gate.args, EXTRACT_RATIO_DOCUMENTS_MAX + 1).map((x) => x.bundle_id);
    const listed = rows.slice(0, n).map((x) => ({
      run: x.run, bundle_id: x.bundle_id, capture_sha: x.capture_sha,
      ref: x.ref, ref_kind: x.ref_kind, ref_key: x.ref_key, label: x.label,
      basis: { fn: x.fn, version: x.fn_version, chain: safeJson(x.chain), says: describeChain(safeJson(x.chain)) },
      cap: x.cap, earned: x.earned,
      position: readingSourceFromColumns(x.pos_kind, x.pos, x.pos_ref),
      content_id: x.content_id, mint: mintLabel(x.proposed_by), at: x.at,
      /* On every row, not only the machine ones: a key present in one case makes absence carry the meaning. */
      says: EXTRACT_PROPOSAL_ROW_SAYS,
    }));
    const scopeDocs = docs.slice(0, EXTRACT_RATIO_DOCUMENTS_MAX);
    const marks = scopeDocs.map(() => "?").join(",");
    const minted = scopeDocs.length ? Number(this.#one(
      `SELECT COUNT(*) AS n FROM content WHERE minted_by LIKE ? AND bundle_id IN (${marks})`,
      `${MACHINE_CLASS_PREFIX}%`, ...scopeDocs)?.n ?? 0) : 0;
    /* CITED IS READ OFF THE LEGS MEMBERS AUTHORED (inquiry R40's `inquiry_basis`, basis-versions R38's version legs):
       this record's own definition of a content row being part of a finding, not a flag anybody sets. */
    const cited = scopeDocs.length ? Number(this.#one(
      `SELECT COUNT(*) AS n FROM content c
        WHERE c.minted_by LIKE ? AND c.bundle_id IN (${marks})
          AND (EXISTS (SELECT 1 FROM inquiry_basis ib WHERE ib.content_id = c.content_id)
            OR EXISTS (SELECT 1 FROM inquiry_basis_version_legs vl WHERE vl.content_id = c.content_id))`,
      `${MACHINE_CLASS_PREFIX}%`, ...scopeDocs)?.n ?? 0) : 0;
    return { ok: true, scope: { run: runId, bundle_id: bundleArm,
                                /* WHAT THE RATIO IS OVER, published: a fraction whose denominator a reader cannot see
                                   is a fraction they cannot judge. */
                                documents: scopeDocs.length, documents_capped: docs.length > EXTRACT_RATIO_DOCUMENTS_MAX },
             count: listed.length, limit: n, truncated: rows.length > n, proposals: listed,
             instrument: mintRatio({ minted, cited }) };
  }

  /** R14 — THE NARROW CANDIDATE SOURCE, registered with basis-versions (its R25, R40 `onCandidates`): for a capture,
   *  the proposals with a position, newest first, at most `max` of them, read one past it so `truncated` is measured,
   *  each labelled machine work (content's mint label beside the proposer stamp). */
  candidates({ captureSha, max } = {}) {
    const cap = Math.max(1, Math.floor(Number(max)) || 1);
    const rows = this.#rows(
      `SELECT run, ref, label, pos_kind, pos, pos_ref, content_id, proposed_by FROM proposed_readings
        WHERE capture_sha=? AND pos_kind IS NOT NULL ORDER BY at DESC, ref LIMIT ?`, String(captureSha ?? ""), cap + 1);
    return { truncated: rows.length > cap,
             rows: rows.slice(0, cap).map((r) => ({
               run: r.run, ref: r.ref, label: r.label ?? null,
               position: readingSourceFromColumns(r.pos_kind, r.pos, r.pos_ref),
               content_id: r.content_id ?? null, proposed_by: r.proposed_by, mint: mintLabel(r.proposed_by) })) };
  }

  /** The counts `op=stats` reports of this module's tables (map §3): each row names a bundle (a proposal its document,
   *  a stored refusal its question), and `hid`, when given, is `{sql, args}` naming the bundles the caller may not
   *  see, whose rows are left out. */
  counts(hid = null) {
    const c = (t, k) => Number(this.#one(
      `SELECT count(*) c FROM ${t}${hid ? ` WHERE COALESCE(${k}, '') NOT IN ${hid.sql}` : ""}`,
      ...(hid ? hid.args : []))?.c ?? 0);
    return { proposedReadings: c("proposed_readings", "bundle_id"), suggestRefusals: c("suggest_refusals", "target") };
  }
}

const instances = new WeakMap();

/** The one run-productions instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on the
 *  first call only. A provider not given is built by `deps.interim(host)` (the legacy store's hand-over,
 *  `interim.mjs`). At creation it declares its tables to purge (R17). */
export function runProductionsOf(host, deps) {
  let p = instances.get(host);
  if (!p) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const content = d.content || contentOf(host);
    const connections = d.connections || connectionsOf(host);
    const interim = typeof d.interim === "function" ? d.interim(host) : {};
    const need = (k) => {
      const v = d[k] || interim[k];
      if (!v) throw new Error(`run-productions: no ${k} provider (its Provides) was given`);
      return v;
    };
    p = new RunProductions({ storage: d.storage || host.storage, record, membership, content, connections,
                             aiRuns: need("aiRuns"), strength: d.strength || strengthOf(host, { record, membership }),
                             citation: d.citation || citationOf(host, { record, membership, content }),
                             basisVersions: d.basisVersions || basisVersionsOf(host, { record, membership, content }),
                             now: d.now || null });
    instances.set(host, p);
    record.declarePurge(RUN_PRODUCTIONS_MODULE, RUN_PRODUCTIONS_TABLES);
    /* R14: the extract arm of basis-versions' narrow candidates (its R40). */
    p.basisVersions.onCandidates(RUN_PRODUCTIONS_MODULE, (a) => p.candidates(a));
  }
  return p;
}

/** The op handlers the control plane routes to (K3): `suggest`, `extractpropose`, `extractproposals`. The author,
 *  viewer, proposer and caller come from the QUERY STRING, where the control plane stamped them, and never from the body
 *  (R8): `suggest`'s stamps are set AFTER the body's spread, so a body's are overwritten rather than believed. */
export function runProductionsOps(p, url, body) {
  const q = (k) => url.searchParams.get(k);
  const bd = body || {};
  return {
    suggest: () => p.suggest({
      ...bd,
      target: bd.target || q("target"), kind: bd.kind || q("kind"), run: bd.run || q("run"),
      author: q("author"), viewer: q("viewer"), caller: q("principal"),
    }),
    extractpropose: () => p.extractPropose({
      run: bd.run, bundleId: bd.bundleId, fn: bd.fn, version: bd.version, cap: bd.cap ?? null, refs: bd.refs,
      at: bd.at || null, proposedBy: q("proposedBy"), viewer: q("viewer"), caller: q("principal") }),
    extractproposals: () => p.extractProposals({ run: q("run"), bundleId: q("bundle"), limit: q("limit"), viewer: q("viewer") }),
  };
}
