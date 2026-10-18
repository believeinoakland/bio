/* basis-versions — the conclusion family (R16–R21, R48, R51), moved out of `./index.mjs` at T51 (P6; M-T51-1). One
 * `ConcludeFamily` per `BasisVersions` instance, handed the instance's private helpers as `k`; the behaviour, refusals
 * and their order are unchanged. */

import { isMachineIdentity, normalizeType, STATES, vocabFor, parseFrontmatter } from "../record-grammar/index.mjs";
import { biasAppliedFindings } from "../inquiry-grammar/index.mjs";
import { actNoBasis, biasNotInForce } from "../inquiry/index.mjs";
import { EDGE_REASON_MAX } from "../promotion/index.mjs";
import { appendStateHistory, setScalar, setOrAddScalar, appendSessionLog } from "../promotion/text.mjs";
import { word } from "../setup-words/index.mjs";
import { CONCLUDE_ACT_CHECKS, VERSION_ACT_CHECKS, SUFFICIENCY_UNCLAIMED } from "./checks.mjs";
import { fmSafe, quoted, setCurrentVersionRow, appendConclusionEntry } from "./text.mjs";
import { VERSION_REASON_MAX, drawsOn, LEG_COPY_KEYS } from "./shared.mjs";

/** R51 (K3697): the shortest own reading, the grammar's description floor (C-25.1), since her words are the description. */
export const READING_MIN = 12;
/** R48: the effects a conclusion's bias application may name (inquiry-grammar R18's shape, a conclusion's own effects;
 *  its caps and encoding are inquiry-grammar's, K2479). */
export const CONCLUSION_BIAS_EFFECTS = Object.freeze(["inference_refused", "scrutiny_raised"]);
/** R51: the question has nothing for an own reading to rest on (inquiry R45's detail, one text for both doors). */
const NO_BASIS_DETAIL = "a conclusion rests on something. An open inquiry may hold a claim with no legs at "
  + "all — a standing objective the team means to pursue — but concluding one that "
  + "rests on nothing would put the record's name to an assertion nothing supports. "
  + "Add a basis[] leg (and the same target in references[]) first.";

/* R16, R17, R20, R21: a conclusion refusal's row (C-32.2, C-33.x), carried at its site with its code, so the refusal is
   translated wherever it is read (DEC-49). */
const concludeRow = (code) => ({ code, check: CONCLUDE_ACT_CHECKS[code].check,
                                 translation: CONCLUDE_ACT_CHECKS[code].translation });
/* R48: a conclusion's `bias_applied`, as a caller sends it (a list, or its JSON from a query string), judged by
   inquiry-grammar R18's one shape check (`biasAppliedFindings`) with a conclusion's own effects and this module's
   C-25.35: `{entries}` (empty when none was sent), each statement trimmed as a member's id is, or `{refused}`. */
function conclusionBiasApplied(raw) {
  const row = CONCLUDE_ACT_CHECKS.BAD_BIAS_APPLIED;
  const bad = (detail, findings = []) => ({ refused: { ok: false, reason: "BAD_BIAS_APPLIED", code: "BAD_BIAS_APPLIED",
                                                       check: row.check, translation: row.translation, detail, findings } });
  if (raw === undefined || raw === null || raw === "") return { entries: [] };
  let list = raw;
  if (typeof raw === "string") {
    try { list = JSON.parse(raw); } catch { return bad("bias_applied is a JSON list of {statement, effect}, and this is not JSON"); }
  }
  /* a row-shaped object is the grammar's other input form; a caller sends a list */
  if (!Array.isArray(list)) return bad("bias_applied is a list of {statement, effect}");
  const trimmed = list.map((e) => (e && typeof e === "object" && !Array.isArray(e) && typeof e.statement === "string"
    ? { ...e, statement: e.statement.trim() } : e));
  const findings = [];
  biasAppliedFindings("the conclusion", trimmed, findings, { effects: CONCLUSION_BIAS_EFFECTS, checkId: row.check });
  if (findings.length) return bad(findings[0].message ?? findings[0].detail ?? "bias_applied is malformed", findings);
  return { entries: trimmed.map((e) => ({ statement: e.statement, effect: e.effect })) };
}


export class ConcludeFamily {
  constructor(k) { this.k = k; }

  /** R16–R19 (`op=conclude`). With a project, one dated, authored `concluded` row is appended to the PROJECT's
   *  `conclusions[]` adopting its CURRENT's claim verbatim, and the shared question's bytes do not move (§7.1 item 3).
   *  Without one, the question moves to `concluded` naming the reading whose claim it adopts (item 6). `withdraw: true`
   *  enters `withdrawConclusion` after the ONE machine fence both acts share (C-32.2). */
  conclude({ target, conclusion = "", falsifier = "", noFalsifier = false, version = "", reading = null, affirmed = null,
             preview = false, project = null, commentary = "", reason = "", withdraw = false, biasApplied = null,
             viewer = null, author = null, identity = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-conclude — REC-64/C-32.2. */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_CONCLUDE", ...concludeRow("MACHINE_CANNOT_CONCLUDE"),
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
    /* R51: the member's own words, which take the place of a named reading; absent is null, never a blank one */
    const hasReading = reading !== undefined && reading !== null;
    const ownText = hasReading ? fmSafe(reading) : "";
    const wantPreview = preview === true || preview === "1" || preview === "true";
    /* REC-117: the member's override, opt-in and never a default; `1`/`true` because a query string carries it */
    const noFals = noFalsifier === true || noFalsifier === 1 || noFalsifier === "1" || noFalsifier === "true";
    /* DEC-49 REGION is-conclude-answer — REC-64/C-33.1-2. */
    if (!concl && !pid && !hasReading)
      return { ok: false, reason: "NO_CONCLUSION", ...concludeRow("NO_CONCLUSION"),
               detail: "concluding records WHAT was concluded. C-2.8 requires a non-empty conclusion in the "
                     + "concluded state, so a conclusion with nothing in it would produce a record the "
                     + "catalog rejects. An undetermined answer is stated as undetermined, never left blank." };
    if (concl && pid)
      return { ok: false, reason: "CONCLUSION_IS_THE_CLAIM", ...concludeRow("CONCLUSION_IS_THE_CLAIM"),
               detail: "a project concludes by ADOPTING the claim of the reading it stands on, and that claim "
                     + "is what was concluded (INVESTIGATIVE-SESSION.md §7.1). A separate conclusion text could "
                     + "say what no claim said. Send what you want to add beyond the claim as commentary= — it "
                     + "is recorded in your name and is never evidence — or state the claim itself on a "
                     + "reading first." };
    if (!fals && !noFals)
      return { ok: false, reason: "NO_FALSIFIER", ...concludeRow("NO_FALSIFIER"),
               detail: "a conclusion states what would OVERTURN it. Without that the finding cannot be "
                     + "checked by anyone, including its author, and a record that cannot be checked claims "
                     + "more than it can support. If no falsifier can honestly be stated, SAY SO rather than "
                     + "inventing one: conclude again with no_falsifier=1 and the record will carry `no "
                     + "falsifier stated` in your name and with today's date, on every surface this finding "
                     + "appears on and in the signed bytes if it is ever published." };
    if (fals && noFals)
      return { ok: false, reason: "FALSIFIER_AND_NONE_STATED", ...concludeRow("FALSIFIER_AND_NONE_STATED"),
               detail: "you have both stated a falsifier and asked to record that none was stated. Those are "
                     + "two different claims about this finding and your team's Civicsmith will not choose "
                     + "between them. Send the falsifier, or send no_falsifier=1 with the falsifier empty." };
    /* END DEC-49 REGION is-conclude-answer */
    /* R51: 1 to 500 characters once made frontmatter-safe; it takes the place of a named reading (`version`) and, with
       no project, has nowhere for commentary to go */
    if (hasReading && (ownText.length < READING_MIN || ownText.length > VERSION_REASON_MAX || vname || (comm && !pid)))
      return { ok: false, reason: "BAD_READING", code: "BAD_READING", translation: word("refusal.BAD_READING"),
               detail: `reading is ${READING_MIN} to ${VERSION_REASON_MAX} characters${vname ? ", and it takes the place of version, which was also named" : ""}`
                     + `${comm && !pid ? "; commentary beside it needs a project" : ""}` };
    for (const [name, v] of [["conclusion", concl], ["falsifier", fals], ["commentary", comm]])
      if (v.length > VERSION_REASON_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${VERSION_REASON_MAX} characters and cannot contain a `
                       + `quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    /* R48: the bias applications' shape, with the other malformed fields; only a project's conclusion carries them */
    const bias = conclusionBiasApplied(biasApplied);
    if (bias.refused) return bias.refused;
    if (bias.entries.length && !pid)
      return { ok: false, reason: "BAD_BIAS_APPLIED", ...concludeRow("BAD_BIAS_APPLIED"),
               detail: "bias applications are recorded with a PROJECT's conclusion and checked against that project's "
                     + "lens in force; a conclusion drawn with no project carries none. Conclude for a project "
                     + "(project=), or send no bias_applied." };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "a conclusion answers ONE question: pass target=<inquiry id>" };
    /* an inquiry the viewer may not see answers exactly as an absent one */
    const b = this.k.visible(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "concluding answers a question, and only an inquiry carries one." };
    let text = this.k.doc(target);
    if (text === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    const fm = parseFrontmatter(text).data || {};
    /* THE MAP RULE: the machine is record-grammar's (`STATES`, once the catalogue's), over the DECLARED spelling. A
       project may conclude a question whose own state already reads `concluded` (one relationship's conclusion must
       not bar another's). */
    /* R52: without a project the act revises the question's document, which a divided question has closed */
    if (!pid) { const divided = this.k.dividedRefusal(b); if (divided) return divided; }
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
      projRow = this.k.visible(pid, viewer);
      if (!projRow) { const existence = this.k.bv.membership.existenceAct(pid, viewer); if (existence) return existence; }
      if (!projRow || normalizeType(projRow.object_type) !== "project")
        return { ok: false, reason: "NOT_A_PROJECT", target, project: pid,
                 detail: `${pid.slice(0, 60)} is not a project readable here, so there is no relationship `
                       + "with this question to conclude in." };
      /* REC-134: a conclusion takes CURRENT's position — the actor must have JOINED the project */
      const denied = this.k.bv.membership.projectAuthority(pid, identity, "joined", "conclude");
      if (denied) return denied;
      const pmd = this.k.doc(pid);
      if (pmd === null)
        return { ok: false, reason: "NO_DOCUMENT", target, project: pid,
                 detail: "this project has no readable bundle.md, so its conclusion cannot be recorded" };
      pfm = parseFrontmatter(pmd).data || {};
    }

    /* R51: the member's own reading is accepted and concluded on in one act */
    if (hasReading)
      return this.#concludeOwnReading({ target, b, text, fm, pid, projRow, pfm, reading: ownText, concl, fals, noFals,
                                        comm, bias, who, viewer, affirmed, preview: wantPreview });
    /* DEC-49 REGION is-conclude-claim — REC-124/C-33.34. Every arm is the same fact: no claim to adopt. */
    if (!pid && comm)
      return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target,
               detail: "commentary is what a member adds BEYOND a PROJECT's adopted claim, and it is recorded "
                     + "on that project's conclusion. A conclusion drawn with no project carries the member's "
                     + "own words in conclusion= beside the claim it adopts, so there is nowhere for commentary "
                     + "to go. Conclude for a project (project=), or send no commentary." };
    if (!pid && !vname)
      return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target,
               detail: "a conclusion adopts the claim of a reading, and the claim is what was concluded "
                     + "(INVESTIGATIVE-SESSION.md §7.1). Drawn with no project there is no reading the question "
                     + "stands on, so name it: conclude with version=<the accepted reading whose claim this "
                     + "conclusion adopts>. A conclusion whose claim is undetermined asserts nothing anyone "
                     + "can check." };
    let want = vname;
    if (pid) {
      if (!drawsOn(pfm, target))
        return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target, project: pid,
                 detail: `${pid} does not draw on ${target}, so it stands on no reading of it and has no `
                       + "claim to adopt. Cite the question into the project, make a reading current, then "
                       + "conclude." };
      const cur = this.k.bv.currentOf(pid, target, viewer);
      if (!cur)
        return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target, project: pid,
                 detail: `${pid} stands on no reading of ${target}. Concluding adopts the claim of the `
                       + "reading a project stands on (§7.1), so make an accepted reading current "
                       + "(op=versioncurrent) first." };
      if (vname && vname !== cur.version)
        return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target, project: pid, version: vname,
                 detail: `${pid} stands on reading '${cur.version}', not '${vname.slice(0, 80)}'. A project `
                       + "concludes on the reading it stands on (§7.1 item 1): make that reading current "
                       + "first, or conclude without version=." };
      want = cur.version;
    }
    const v = this.k.one(`SELECT name, state, claim, leg_count FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`,
                        target, want);
    const claimText = String(v?.claim ?? "").trim();
    const whose = pid ? `${pid} stands on reading` : "this conclusion names reading";
    if (!v || v.state !== "accepted" || !claimText)
      return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target, ...(pid ? { project: pid } : {}), version: want,
               detail: !v
                 ? `${whose} '${String(want).slice(0, 80)}', which ${target} does not carry, so there is no `
                   + "claim to adopt. Name a reading it does carry."
                 : v.state !== "accepted"
                 ? `${whose} '${want}', which is ${v.state || "in no recorded state"}, `
                   + "not accepted. A conclusion adopts only what the team accepted."
                 : `reading '${want}' states no claim, and the claim is what a conclusion adopts `
                   + "(§7.1). State the claim on a reading first — a claim with no support yet is legal "
                   + "to add (DEC-22) — then conclude on that reading." };
    const adopted = { version: v.name, claim: claimText, leg_count: Number(v.leg_count) || 0 };
    /* END DEC-49 REGION is-conclude-claim */

    const legs = Array.isArray(fm.basis) ? fm.basis : [];
    /* a conclusion rests on the adopted reading's legs, and without a project also on the live basis C-2.8 requires;
       NO_BASIS is minted at inquiry's one site (its R45, D-484, N186) */
    if (adopted.leg_count < 1 || (!pid && legs.length < 1))
      return actNoBasis(NO_BASIS_DETAIL, { target });

    if (pid) {
      const forced = this.#biasInForce(bias.entries, pid, target, viewer);
      if (forced.refused) return forced.refused;
      const lensSha = forced.lensSha;
      const when = this.k.bv.now();
      const priorRec = this.k.bv.conclusionRecordOf(pid, target, viewer);
      const prior = priorRec.history.length ? priorRec.history[priorRec.history.length - 1] : null;
      const w = this.#setProjectConclusion(projRow, target, {
        act: "concluded", version: adopted.version, claim: adopted.claim, falsifier: fals, noFals,
        commentary: comm, bias: bias.entries, biasSha: lensSha, who, when });
      if (!w.ok) return { ...w, target, project: pid };
      return { ok: true, target, project: pid, relationship: "project", to: "concluded",
               inquiry_state: b.current_state, inquiry_moved: false,
               version: adopted.version, claim: { state: "adopted", text: adopted.claim, version: adopted.version },
               falsifier: fals, basis_legs: adopted.leg_count,
               falsifier_override: noFals ? { by: who, at: when } : null,
               commentary: comm ? { text: comm, by: who, at: when, evidence: false } : null,
               bias_applied: bias.entries, bias_lens_sha: bias.entries.length ? lensSha : null,
               prior: prior ? { act: prior.act, version: prior.version, claim: prior.claim, at: prior.at, by: prior.by } : null,
               history_length: priorRec.history.length + 1, author: who, at: when, weight: "single" };
    }

    const when = this.k.bv.now();
    const concluded = ConcludeFamily.#concludedText(text, b, { concl, adopted, fals, noFals, who, when });
    if (concluded.refused) return concluded.refused;
    text = concluded.text;
    const promoted = this.k.repromote({ bundleId: target, base: b.bundle_sha, text, when, author: who,
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

  /* R48: each statement asked of bias R49 at the project's scope, the acting member as viewer; the first not in force
     (false or undetermined) refused through inquiry R61's one spelling, and nothing written. */
  #biasInForce(entries, pid, target, viewer) {
    let lensSha = null;
    for (const e of entries) {
      const ans = this.#statementInForce({ statement: e.statement, scope: { type: "project", id: pid }, viewer });
      if (!ans || ans.in_force !== true) {
        const inForce = ans && ans.in_force === false ? false : null;
        const row = biasNotInForce({ statement: e.statement, where: `the conclusion of ${pid} on ${target}`, inForce,
                                     scope: { type: "project", id: pid } });
        return { refused: { ok: false, reason: "BIAS_APPLICATION_NOT_IN_FORCE", code: row.code, check: row.check,
                            translation: row.translation, detail: row.detail, findings: [row], target, project: pid,
                            statement: e.statement, in_force: inForce } };
      }
      lensSha ??= typeof ans.statements_sha === "string" ? ans.statements_sha : null;
    }
    return { lensSha };
  }

  /* R19: the question's document moved to `concluded` (a state-history entry, the conclusion, the adopted reading and
     its claim, the falsifier or the override pair, a Session Log entry). `refused` when its state history cannot be
     extended in place. */
  static #concludedText(text, b, { concl, adopted, fals, noFals, who, when }) {
    const withHistory = appendStateHistory(text, { timestamp: when, from_state: b.current_state, to_state: "concluded",
                                                   blurb: concl, author: who });
    if (!withHistory)
      return { refused: { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target: b.bundle_id,
               detail: "this document's state_history block cannot be extended in place, and a conclusion "
                     + "recording no transition would leave prior_state pointing at a history the document "
                     + "does not carry (C-4.2)" } };
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
      + `Trigger: op=conclude on ${b.bundle_id}\n`
      + `Changes: state ${b.current_state} to concluded.\n`
      + `Conclusion: ${concl}\n`
      + `Adopted: reading '${adopted.version}', claim: ${adopted.claim}\n`
      + (noFals ? `Falsifier: NO FALSIFIER STATED — recorded by ${who} at ${when}\n` : `Falsifier: ${fals}\n`));
    return { text };
  }

  /* R51 (T50; N1109, N1173; DEC-254): a member's own reading, accepted and concluded on in one act. The question's
     live legs and grounds are copied as the document holds them into a new version carrying her words as claim and
     description, written already accepted by her; with a project the version is also the project's CURRENT and the
     conclusion row is appended (one promotion of the question, one of the project); without one the question moves
     to `concluded`. Every refusal of a conclusion stands (the caller has applied R16's in order); one refusal refuses
     all and writes nothing, so every text is built and every check run before the first promotion. */
  #concludeOwnReading({ target, b, text, fm, pid, projRow, pfm, reading, concl, fals, noFals, comm, bias, who, viewer,
                        affirmed, preview }) {
    if (pid && !drawsOn(pfm, target))
      return { ok: false, reason: "NO_CLAIM", ...concludeRow("NO_CLAIM"), target, project: pid,
               detail: `${pid} does not draw on ${target}, so it has no stance on it to conclude. Cite the question `
                     + "into the project first." };
    /* the legs the question stands on: its basis legs whose `cites` edge the question has not severed */
    const refs = Array.isArray(fm.references) ? fm.references : [];
    const live = (Array.isArray(fm.basis) ? fm.basis : []).filter((l) => {
      if (!l || typeof l !== "object" || typeof l.target !== "string") return false;
      const t = l.target.trim();
      const cites = refs.filter((x) => x && typeof x === "object" && x.rel === "cites" && String(x.target ?? "").trim() === t);
      return !(cites.length && cites.every((x) => x.status === "severed"));
    });
    if (!live.length) return actNoBasis(NO_BASIS_DETAIL, { target });
    const taken = new Set((Array.isArray(fm.basis_versions) ? fm.basis_versions : [])
      .map((r) => fmSafe(r?.name ?? "")));
    let n = 1;
    while (taken.has(`reading-${n}`)) n++;
    const name = `reading-${n}`;
    /* the grounds as the document holds them, the ones a live leg uses; none held, one part with the explicit no-claim
       value, as a machine's one-part version carries (DEC-65) */
    const labelled = live.some((l) => typeof l.ground === "string" && l.ground.trim() !== "");
    const used = new Set(live.map((l) => String(l.ground ?? "").trim()).filter(Boolean));
    const when = this.k.bv.now();
    const grounds = labelled
      ? (Array.isArray(fm.grounds) ? fm.grounds : []).filter((g) => g && typeof g === "object" && used.has(String(g.ground ?? "").trim()))
          .map((g) => ({ ground: g.ground, asserted_by: g.asserted_by, at: g.at, statement: g.statement }))
      : [{ ground: "g1", asserted_by: SUFFICIENCY_UNCLAIMED, at: when }];
    const legs = live.map((l) => {
      const o = {};
      for (const k of LEG_COPY_KEYS) o[k] = k === "ground" && !labelled ? "g1" : l[k];
      return o;
    });
    const parts = [...new Set(legs.map((l) => String(l.ground ?? "").trim()).filter(Boolean))];
    const aff = this.k.affirmation(parts, affirmed);
    if (aff.incomplete) {
      const row = VERSION_ACT_CHECKS.VERSION_AFFIRMATION_INCOMPLETE;
      return { ok: false, reason: "VERSION_AFFIRMATION_INCOMPLETE", check: row.check, code: "VERSION_AFFIRMATION_INCOMPLETE",
               translation: row.translation, detail: this.k.affirmationDetail(name, aff.incomplete),
               ...this.k.affirmationExtra(target, name, aff.incomplete) };
    }
    const forced = pid ? this.#biasInForce(bias.entries, pid, target, viewer) : { lensSha: null };
    if (forced.refused) return forced.refused;
    const adopted = { version: name, claim: reading, leg_count: legs.length };
    const v = { name, description: reading, claim: reading, relationship: parts.length > 1 ? "or" : "and",
                derived_from: null, author: who, at: when };
    let qtext = this.k.withVersion(text, v, grounds, legs, { state: "accepted", by: who, at: when, affirmed: aff.parts });
    if (qtext !== null) qtext = setScalar(qtext, "last_updated", `"${when}"`);
    if (qtext === null)
      return { ok: false, reason: "UNSPLICEABLE_BASIS", target,
               detail: "this question's version block is in a shape the restricted frontmatter grammar "
                     + "cannot extend in place, so nothing was written." };
    const facts = { act: "concluded", version: name, claim: reading, falsifier: fals, noFals, commentary: comm,
                    bias: bias.entries, biasSha: pid && bias.entries.length ? forced.lensSha : null, who, when };
    const base = { ok: true, target, own_reading: true, version: name, author: who, at: when, weight: "single",
                   claim: { state: "adopted", text: reading, version: name }, basis_legs: legs.length,
                   affirmed: aff.parts === null ? null : aff.parts.split("\t"), falsifier: fals,
                   falsifier_override: noFals ? { by: who, at: when } : null };
    let finish, receipt;
    if (pid) {
      /* both rows of the project, built now so a block that cannot take them refuses before anything is written */
      const md = this.k.doc(pid);
      if (md === null)
        return { ok: false, reason: "NO_DOCUMENT", target, project: pid,
                 detail: "this project has no readable bundle.md, so its conclusion cannot be recorded" };
      const withCurrent = setCurrentVersionRow(md, target, name, who, when);
      if (withCurrent === null) {
        const row = VERSION_ACT_CHECKS.VERSION_ACT_UNWRITABLE;
        return { ok: false, reason: "VERSION_ACT_UNWRITABLE", check: row.check, code: "VERSION_ACT_UNWRITABLE",
                 translation: row.translation, target, version: name, project: pid,
                 detail: `${pid}'s current_versions block could not be rewritten in place, so its stance cannot be recorded.` };
      }
      if (appendConclusionEntry(withCurrent, target, facts) === null)
        return { ok: false, reason: "UNSPLICEABLE_CONCLUSIONS", ...concludeRow("UNSPLICEABLE_CONCLUSIONS"), target, project: pid,
                 detail: `${pid}'s conclusions block could not be extended in place` };
      const priorRec = this.k.bv.conclusionRecordOf(pid, target, viewer);
      const prior = priorRec.history.length ? priorRec.history[priorRec.history.length - 1] : null;
      qtext = appendSessionLog(qtext,
        `### Session ${when} | Own reading accepted | ${who}\n`
        + `Trigger: op=conclude on ${target} for ${pid}\n`
        + `Changes: reading '${name}' written by ${who} from the question's own legs, in state accepted.\n`);
      receipt = { ...base, project: pid, relationship: "project", to: "concluded", inquiry_state: b.current_state,
                  inquiry_moved: false, current: { project: pid, version: name },
                  commentary: comm ? { text: comm, by: who, at: when, evidence: false } : null,
                  bias_applied: bias.entries, bias_lens_sha: bias.entries.length ? forced.lensSha : null,
                  prior: prior ? { act: prior.act, version: prior.version, claim: prior.claim, at: prior.at, by: prior.by } : null,
                  history_length: priorRec.history.length + 1 };
      finish = () => {
        const w = this.#setProjectConclusion(projRow, target, { ...facts, alsoCurrent: true });
        return w.ok ? receipt : { ...w, target, project: pid };
      };
    } else {
      qtext = appendSessionLog(qtext,
        `### Session ${when} | Own reading accepted | ${who}\n`
        + `Trigger: op=conclude on ${target}\n`
        + `Changes: reading '${name}' written by ${who} from the question's own legs, in state accepted.\n`);
      const concluded = ConcludeFamily.#concludedText(qtext, b, { concl: concl || reading, adopted, fals, noFals, who, when });
      if (concluded.refused) return concluded.refused;
      qtext = concluded.text;
      receipt = { ...base, from: b.current_state, to: "concluded", conclusion: concl || reading, relationship: "no_project",
                  project: null };
      finish = () => receipt;
    }
    const meta = { object_type: fm.object_type ?? b.object_type, title: fm.title,
                   current_state: pid ? b.current_state : "concluded", prior_state: pid ? (fm.prior_state ?? null) : b.current_state,
                   created: fm.created, last_updated: when, criticality: fm.criticality ?? null };
    /* the version's check (R6: the grammar, R3's accepted-work legs, R49's machine-passage read over the legs it
       copies) is this module's step of the promotion; a preview asks it directly over the text it would write */
    if (preview) {
      const refused = this.k.bv.check({ pkg: {}, bundleId: target, promotedType: "inquiry",
                                   docFm: parseFrontmatter(qtext).data || {}, author: who });
      if (refused) return { ...refused, target, preview: true, wrote: false };
      return { ...receipt, preview: true, would: "conclude", wrote: false };
    }
    const promoted = this.k.repromote({ bundleId: target, base: b.bundle_sha, text: qtext, when, author: who, meta });
    if (!promoted.ok) return { ...promoted, target };
    return finish();
  }

  /* R48: bias R49's answer, through the instance or function the factory handed; a source that throws or is absent
     answers undetermined (null), which refuses as not in force. */
  #statementInForce(args) {
    try {
      let src = this.k.bv.biasSource;
      if (typeof src === "function" && typeof src.statementInForce !== "function") src = this.k.bv.biasSource = src();
      return src && typeof src.statementInForce === "function" ? src.statementInForce(args) : null;
    } catch { return null; }
  }

  /* The conclusion record's ONE writer (R18, R20, R21), paired with `conclusionRecordOf`, its one reader: it only ever
     appends, then promotes the PROJECT. */
  #setProjectConclusion(projectRow, inquiryId, f) {
    const pid = projectRow.bundle_id;
    const md = this.k.doc(pid);
    if (md === null)
      return { ok: false, reason: "NO_DOCUMENT", detail: `${pid} has no readable file, so its conclusion cannot be recorded` };
    const pfm = parseFrontmatter(md).data || {};
    /* R51: an own reading is also what the project stands on, written in the same promotion as its conclusion */
    let text = f.alsoCurrent ? setCurrentVersionRow(md, inquiryId, f.version, f.who, f.when) : md;
    if (text !== null) text = appendConclusionEntry(text, inquiryId, f);
    if (text === null)
      /* DEC-49 REGION is-conclusion-row — REC-124/C-33.36. */
      return { ok: false, reason: "UNSPLICEABLE_CONCLUSIONS", ...concludeRow("UNSPLICEABLE_CONCLUSIONS"),
               detail: `${pid}'s conclusions block could not be extended in place` };
      /* END DEC-49 REGION is-conclusion-row */
    text = setScalar(text, "last_updated", `"${f.when}"`);
    text = appendSessionLog(text, f.act === "withdrawn"
      ? `### Session ${f.when} | Conclusion withdrawn | ${f.who}\n`
        + `Trigger: op=withdrawconclusion on ${inquiryId} for ${pid}\n`
        + `Changes: this project withdrew its conclusion on ${inquiryId} (reading '${f.version}', concluded `
        + `${f.withdrawsAt}). The conclusion stays in the record; this project now stands on no conclusion.\n`
        + `Reason: ${f.reason}\n`
      : (f.alsoCurrent ? `### Session ${f.when} | Stands on | ${f.who}\n`
          + `Trigger: op=conclude on ${inquiryId}\n`
          + `Changes: this project now stands on reading '${f.version}' of ${inquiryId}, written by ${f.who}.\n` : ``)
        + `### Session ${f.when} | Concluded | ${f.who}\n`
        + `Trigger: op=conclude on ${inquiryId} for ${pid}\n`
        + `Changes: this project concluded ${inquiryId} on reading '${f.version}', adopting its claim.\n`
        + `Claim: ${f.claim}\n`
        + (f.noFals ? `Falsifier: NO FALSIFIER STATED — recorded by ${f.who} at ${f.when}\n` : `Falsifier: ${f.falsifier}\n`)
        + (f.commentary ? `Commentary (${f.who}, not evidence): ${f.commentary}\n` : "")
        + (f.bias && f.bias.length
          ? `Bias applied: ${f.bias.map((e) => `${e.statement} (${e.effect})`).join("; ")}\n` : ""));
    return this.k.repromote({ bundleId: pid, base: projectRow.bundle_sha, text, when: f.when, author: f.who,
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
      return this.k.bv.conclude({ target, project, reason, withdraw: true, viewer, author: actor, identity });
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
    const b = this.k.visible(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: b.object_type,
               detail: "a conclusion answers a question, and only an inquiry carries one." };
    const projRow = pid ? this.k.visible(pid, viewer) : null;
    /* REC-149: at EXISTENCE the positional C-70.1, as conclude and make-current answer (membership R44) */
    if (pid && !projRow) { const existence = this.k.bv.membership.existenceAct(pid, viewer); if (existence) return existence; }
    if (!projRow || normalizeType(projRow.object_type) !== "project")
      return { ok: false, reason: "NOT_A_PROJECT", target, project: pid || null,
               detail: pid
                 ? `${pid.slice(0, 60)} is not a project readable here, so there is no relationship with this `
                   + "question to withdraw a conclusion from."
                 : "a withdrawal is a PROJECT's act on its own conclusion: pass project=<project id>. A "
                   + "conclusion drawn with no project is the inquiry's own state, and moving it is op=reopen's." };
    const denied = this.k.bv.membership.projectAuthority(pid, identity, "joined", "withdrawconclusion");
    if (denied) return { ...denied, target };
    const rec = this.k.bv.conclusionRecordOf(pid, target, viewer);
    /* DEC-49 REGION is-withdraw-stance — REC-136/C-33.37. */
    if (!rec.stance || rec.stance.act !== "concluded")
      return { ok: false, reason: "NOTHING_TO_WITHDRAW", ...concludeRow("NOTHING_TO_WITHDRAW"), target, project: pid,
               stance: rec.stance ? rec.stance.state : "none",
               detail: !rec.stance
                 ? `${pid} has never concluded ${target}, so there is no conclusion to withdraw.`
                 : rec.stance.act === "withdrawn"
                 ? `${pid}'s latest act on ${target} was already a withdrawal (${rec.stance.at || "undated"}), so `
                   + "it stands on no conclusion to withdraw. Its history is unchanged."
                 : `${pid}'s latest entry on ${target} is one your team's Civicsmith cannot read, so what it `
                   + "stands on is undetermined and a withdrawal would be withdrawing a guess." };
    /* END DEC-49 REGION is-withdraw-stance */
    const when = this.k.bv.now();
    const w = this.#setProjectConclusion(projRow, target, {
      act: "withdrawn", version: rec.stance.version, withdrawsAt: rec.stance.at, reason: why, who: actor, when });
    if (!w.ok) return { ...w, target, project: pid };
    return { ok: true, target, project: pid, relationship: "project", act: "withdrawn", to: "withdrawn",
             inquiry_moved: false,
             withdraws: { version: rec.stance.version, claim: rec.stance.claim, at: rec.stance.at, by: rec.stance.by },
             reason: why, history_length: rec.history.length + 1, author: actor, at: when, weight: "single" };
  }
}
