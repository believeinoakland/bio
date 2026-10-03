/* affordances — the FACTS behind op=affordances (R13–R16, R23), and only the facts: what this object is, where its
 * state machine stands, which citation edges touch it, and where the caller stands towards it. The DERIVATION (which
 * acts those facts admit) is `deriveActs` in `../affordances.mjs`, and this file holds no copy of any act rule.
 *
 * Extracted from the legacy store (T9, K225, N45, N176): `store.mjs` `affordanceFacts` and the three joined-project
 * predicates `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf`, `#editionWarrantedForJoinedProjectOf`, whose
 * only caller it was. The legacy comments moved with them, shortened where they only restated the code.
 *
 * EVERY FACT IS ASKED THROUGH THE PREDICATE THE CORRESPONDING ACT'S REFUSAL RUNS (R14), never a second copy of the
 * same question, so a published act and the refusal it fronts cannot disagree (DEC-8): live citations through
 * `connections.citesInto` (retire's CITED guard), reinstatable edges through `citation.retiredNotCitable`
 * (`#edgeTransition`'s), what rests on a question through `inquiry.restsOnLive` (divide's CITED guard), the case
 * relation through `publication.caseRelation`, a project's conclusion through `basis-versions.conclusionOf` and
 * `ratification.caseConclusionFor` / `editionsRecordingConclusion` (publishCase()'s gates), whether the viewer sees both
 * sides of a contradiction inquiry's candidate through `contradiction.candidateSidesSeen` (resolve's C-93.27 check), and
 * every position through `membership`'s predicates.
 *
 * FACTS ARE COUNTS, NEVER IDS (R16): op=affordances answers about the TARGET, and handing back WHICH bundles cite it,
 * or rest on it, would be §7.9's reverse-edge walk arriving by a new door. `op=backlinks` is the gated read that
 * answers that question.
 *
 * THREE-VALUED POSITIONS (R10, R15): a positional fact is null on a target of the wrong type and for a caller with no
 * roster position (a `class:*` credential); the catalogue never narrows on a null and offers a roster act only on a
 * stated `true`. Never writes (R22).
 *
 * REACHED as `affordancesOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`). The modules it
 * asks are reached through their factories on the same host at the moment of the call, when the Durable Object has
 * already made each of them with its own options; `deps` (a test's) replaces any of `record`, `membership`,
 * `connections`, `citation`, `inquiry`, `publication`, `basisVersions`, `ratification`, `contradiction`, `wizardScripts`.
 *
 * R37 (N528): the second route, `op=affordancescreens`, answers what the untargeted `op=affordances` publishes of
 * `wizard-scripts`: the registered screens and, for each, the offered scripts that start there for this viewer. */

import { normalizeType, parseFrontmatter, isMachineIdentity } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, Membership } from "../membership/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { citationOf } from "../citation/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { ratificationOf } from "../ratification/index.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { wizardScriptsOf } from "../wizard-scripts/index.mjs";

class AffordanceFacts {
  constructor(host, deps) {
    this.host = host;
    const d = deps || {};
    const of = (name, make) => () => d[name] || make(host);
    this.record = of("record", recordOf);
    this.membership = of("membership", membershipOf);
    this.connections = of("connections", connectionsOf);
    this.citation = of("citation", citationOf);
    this.inquiry = of("inquiry", inquiryOf);
    this.publication = of("publication", publicationOf);
    this.basisVersions = of("basisVersions", basisVersionsOf);
    this.ratification = of("ratification", ratificationOf);
    this.contradiction = of("contradiction", contradictionOf);
    this.wizardScripts = of("wizardScripts", wizardScriptsOf);
    const storage = host && host.storage ? host.storage : host;
    this.sql = d.sql || (storage && storage.sql);
  }

  /* One row of record-core's `bundles` read contract (its R37: `bundle_id`, `object_type`, `current_state`,
     `criticality`). */
  #bundle(id) {
    const rows = [...this.sql.exec(
      `SELECT bundle_id, object_type, current_state, criticality FROM bundles WHERE bundle_id=?`, id)];
    return rows.length ? rows[0] : null;
  }

  #isProject(id) {
    const b = this.#bundle(id);
    return !!b && normalizeType(b.object_type) === "project";
  }

  /* The projects that LIVE-cite `inquiryId`, that `viewer` can see and that `memberId` has joined: the three
     conditions `conclude()` runs on the project it is named (the one live-cites predicate — a SEVERED edge is a project
     that no longer draws on the question — the project gate, and C-56's joined rule). A question also writes
     `rel: cites` into its references (REC-37), and a citing question is no project, so the type goes through
     `normalizeType`. R23: asked only for the caller's own member id, over projects the viewer can see. */
  #joinedCitingProjects(inquiryId, viewer, memberId) {
    const m = this.membership();
    return this.connections().citesInto(inquiryId).confirmed
      .filter((pid) => this.#isProject(pid) && m.inSight(pid, viewer) && m.isJoinedParticipant(pid, memberId));
  }

  /* R14, R15 (REC-142 / INVESTIGATIVE-SESSION.md §7.1 item 8): MAY THIS MEMBER CONCLUDE THIS QUESTION FOR SOME PROJECT?
     "Some project", D-310's `ownsAnyProject` shape: the project is `conclude`'s PARAMETER, so the pre-flight narrows
     the act to exactly the class for which NO `project=` could succeed. */
  #concludesForProject(inquiryId, viewer, memberId) {
    return this.#joinedCitingProjects(inquiryId, viewer, memberId).length > 0;
  }

  /* R14, R15 (REC-135 / §7.1 item 4): DOES A PROJECT THIS CALLER HAS JOINED STAND ON A CONCLUSION OF THIS QUESTION?
     Asked through `basis-versions.conclusionOf`, the reader `publishCase()`'s own gate runs. A FACT and never a rule: it
     says SOME joined project concluded here, not that this caller may publish for THAT project (D-311's per-pair
     question), and the act still refuses on its own terms. */
  #concludedForProject(inquiryId, viewer, memberId) {
    const bv = this.basisVersions();
    return this.#joinedCitingProjects(inquiryId, viewer, memberId).some((pid) => !!bv.conclusionOf(pid, inquiryId, viewer));
  }

  /* R14, R15 (REC-157 / §7.1 item 9): COULD A PROJECT THIS CALLER HAS JOINED PUBLISH A NEW EDITION OF A FINDING A CASE
     ALREADY PINS — its conclusion having moved since every edition pinning these bytes? The two questions
     `publishCase()` asks of the project a caller names, through the SAME two readers (ratification R1): the
     relationship is CONCLUDED, and no edition pinning these bytes already records that conclusion. Only a case member is
     walked: a finding no case pins is offered `publish` by `!case_member` already. */
  #editionWarrantedForProject(inquiryId, viewer, memberId, currentState) {
    const rel = this.publication().caseRelation(inquiryId);
    if (!rel.member) return false;
    const r = this.ratification();
    return this.#joinedCitingProjects(inquiryId, viewer, memberId).some((pid) => {
      const conc = r.caseConclusionFor(pid, inquiryId, viewer, currentState);
      return conc.state === "concluded" && !r.editionsRecordingConclusion(inquiryId, rel, conc).same.length;
    });
  }

  /* R14, R15, R18 (D-311, N45): THE CALLER'S ROSTER POSITION IN THIS PROJECT — the PAIR (this target, this caller),
     asked of `by`, the string the roster acts themselves receive (`class:<cls>` for every bearer, which holds no row),
     so the pre-flight asks the question of the same caller the act will. Each field is read through the predicate its
     act's refusal runs:
       owner                  `isProjectOwner` (invite, remove, owner-add, owner-remove: NOT_THE_OWNER)
       state                  `participation` (join's NOT_INVITED, leave's NOT_A_PARTICIPANT / NOT_JOINED)
       owner_floor_clear      owner-remove's floor for EVERY target: `ownerMath` over the owners (LAST_OWNER, R40),
                              and at least one owner committed — with every owner leaving, removing any of them leaves
                              only leaving owners, which R40 refuses (LAST_COMMITTED_OWNER)
       other_owner_committed  leave's floor (membership R35, REC-224): some owner other than `by` has not asked to leave;
                              an owner who is the last committed one is refused LAST_COMMITTED_OWNER
       rescue_open            `rescueRefusal` is null (the rescue's three caller-and-project conditions, R75)
     "Committed" is R35's: an owner whose participation is not `leaving` (R65's owners, R74's state). Null on a target
     that is not a project and when no `by` was sent (a DO-internal call). */
  #roster(projectId, by) {
    const actor = typeof by === "string" && by.trim() ? by.trim() : null;
    if (actor === null) return null;
    const m = this.membership();
    const p = m.participation(projectId, actor);
    const owners = m.projectOwners(projectId);
    const committed = owners.filter((o) => m.participation(projectId, o)?.state !== "leaving");
    return { owner: m.isProjectOwner(projectId, actor),
             state: p ? p.state : null,
             owner_floor_clear: Membership.ownerMath(owners.length).possible && committed.length > 0,
             other_owner_committed: committed.some((o) => o !== actor),
             rescue_open: m.rescueRefusal(projectId, actor) === null };
  }

  /** R13–R16: the facts for one target as the caller stands. `viewer` is what the caller may see, `identity` who it
   *  is (a session's member; an `ai` credential's member principal), `author` the stamp an act would be signed with,
   *  `by` the roster stamp. */
  affordanceFacts({ target, viewer = null, identity = null, author = null, by = null } = {}) {
    if (!target) return { ok: false, reason: "NO_TARGET",
      detail: "affordances are asked of an object: pass target=<record id>" };
    /* R13 (REC-25 / F-8): an object the viewer may not see answers NO_SUCH_BUNDLE — the SAME shape a truly absent id
       answers, so the refusal discloses nothing. Sight is membership's one rule (R80), and an absent viewer sees
       nothing. */
    const m = this.membership();
    const b = m.inSight(target, viewer) ? this.#bundle(target) : null;
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    const type = normalizeType(b.object_type);
    const id = b.bundle_id;

    /* Edges INTO the target, live and severed, counted (R16, N176). HOW MANY OF THOSE CITERS ARE CASES is a fact of
       its own (REC-72): `sever` and `reinstate` move an edge on a CASE's document and refuse a citer that is not a
       project (NOT_A_PROJECT), while a question also writes `rel: cites` when it takes a basis leg. */
    const citesIn = this.connections().citesInto(id);
    const citedByCase = {
      confirmed: citesIn.confirmed.filter((c) => this.#isProject(c)).length,
      severed: citesIn.severed.filter((c) => this.#isProject(c)).length,
    };

    /* The document, for a project's own edge statuses and (REC-13) for the DECLARED object_type: `bundles.object_type`
       is the NORMALIZED type, and the derivation must consult the machine the document was authored under. */
    const md = this.record().readFile(id, "bundle.md");
    const docFm = md && typeof md.text === "string" ? (parseFrontmatter(md.text).data || {}) : {};

    /* A project's OWN citation edges by status, and (D-444) how many severed ones could be put back, asked through
       `retiredNotCitable`, the predicate `#edgeTransition` runs. A non-string target cannot be moved by the op, so it
       is not counted reinstatable. */
    const citesOut = { confirmed: 0, severed: 0, severed_reinstatable: 0 };
    if (type === "project") {
      const citation = this.citation();
      for (const r of (Array.isArray(docFm.references) ? docFm.references : []))
        if (r && typeof r === "object" && r.rel === "cites") {
          if (r.status !== "severed") { citesOut.confirmed++; continue; }
          citesOut.severed++;
          if (typeof r.target === "string" && !citation.retiredNotCitable(r.target)) citesOut.severed_reinstatable++;
        }
    }

    /* REC-17: WHAT RESTS ON THIS QUESTION, working and frozen apart (divide refuses on the working set alone). */
    const rested = type === "inquiry" ? this.inquiry().restsOnLive(id) : { confirmed: [], frozen: [], severed: [] };

    /* R15: positional facts are asked of who the caller is (`identity`), never of what it may see. */
    const who = m.positionalMember(viewer, identity);
    const versions = Array.isArray(docFm.basis_versions) ? docFm.basis_versions : [];
    return { ok: true, target: id, object_type: b.object_type,
             declared_type: typeof docFm.object_type === "string" ? docFm.object_type : b.object_type,
             current_state: b.current_state, criticality: b.criticality ?? null,
             /* CASE-4 / DEC-72: the case relation, through the one predicate the refusals run. */
             case_member: type === "inquiry" ? !!this.publication().caseRelation(id).member : false,
             /* D-310 / DEC-72 clause 5: owner of SOME project (the project is a PARAMETER of op=publish). */
             project_owner: who === null ? null : m.ownsAnyProject(who),
             /* REC-149: the PAIR — does the caller own THIS project (`projectVisibilitySet`'s refusal). */
             project_target_owner: type !== "project" || who === null ? null : m.isProjectOwner(id, who),
             /* REC-134 / C-56: has the caller JOINED this project (cite, sever, reinstate's refusal). */
             project_participant: type !== "project" || who === null ? null : m.isJoinedParticipant(id, who),
             roster: type === "project" ? this.#roster(id, by) : null,
             /* D-311: would the act be signed by a machine — `!who || isMachineIdentity(who)` on the author stamp,
                REC-46's one predicate, which the machine fences run. Null when no `author` was sent. */
             actor_is_machine: author === null ? null
               : (() => { const a = String(author).trim(); return !a || isMachineIdentity(a); })(),
             concludes_for_project: type !== "inquiry" || who === null ? null
               : this.#concludesForProject(id, viewer, who),
             concluded_for_project: type !== "inquiry" || who === null ? null
               : this.#concludedForProject(id, viewer, who),
             edition_warranted_for_project: type !== "inquiry" || who === null ? null
               : this.#editionWarrantedForProject(id, viewer, who, b.current_state),
             /* REC-16: how many legs this question rests on, read from the document (inquiry_basis projects it). */
             basis_legs: Array.isArray(docFm.basis) ? docFm.basis.filter((l) => l && typeof l === "object").length : 0,
             /* N345 (R14): a contradiction inquiry is one whose document carries `contradiction` (inquiry R47), read from
                the front matter; null on a type that is not an inquiry. */
             contradiction_inquiry: type !== "inquiry" ? null
               : docFm.contradiction !== undefined && docFm.contradiction !== null,
             /* N365 (R14, R8): whether the VIEWER may see both sides of the candidate that contradiction inquiry names,
                asked through the one predicate `contradictionresolve` refuses on (contradiction R56, its C-93.27 check),
                so the offer and the act cannot disagree. Null wherever `contradiction_inquiry` is not true. */
             contradiction_sides_seen: type !== "inquiry" || docFm.contradiction === undefined || docFm.contradiction === null
               ? null : this.contradiction().candidateSidesSeen({ inquiry: id, viewer }) === true,
             rested_on: { working: rested.confirmed.length, frozen: rested.frozen.length, severed: rested.severed.length },
             /* PL-2 / IS-2: which states this question's readings are in, from the document. */
             basis_version_states: versions.filter((v) => v && typeof v === "object" && typeof v.state === "string")
               .map((v) => v.state.trim()),
             basis_versions: versions.filter((v) => v && typeof v === "object").length,
             cites_in: { confirmed: citesIn.confirmed.length, severed: citesIn.severed.length },
             cites_out: citesOut, cited_by_case: citedByCase };
  }

  /** R37 (DEC-120, DEC-121; N528): the screen registry as `wizard-scripts` registered it (its R13, `[]` before
   *  registration) and the offered scripts for `viewer`: for each registered screen in registry order, its R11 answer
   *  passed in unchanged, the caller's own drafts (`draft: true`) left out — R37 publishes the offered scripts. A read. */
  screens({ viewer = null } = {}) {
    const w = this.wizardScripts();
    const screens = w.registeredScreens();
    const wizard_scripts = [];
    for (const { id } of screens) {
      const at = w.wizardsAt({ screen: id, viewer });
      for (const s of (at && Array.isArray(at.scripts) ? at.scripts : [])) if (s.draft !== true) wizard_scripts.push(s);
    }
    return { ok: true, screens, wizard_scripts };
  }
}

const instances = new WeakMap();

export function affordancesOf(host, deps) {
  let a = instances.get(host);
  if (!a) { a = new AffordanceFacts(host, deps); instances.set(host, a); }
  return a;
}

/* N13's share (`legacy-store`'s map §4.1): the route this module answers, `op=affordancefacts` (R13–R16), as an op map
   the composition root spreads into the durable object's one route map, as every other module's is. The stamps arrive
   on the query exactly as the acts receive them; an absent one reads null (R15). */
export function affordancesOps(a, url) {
  const q = (k) => url.searchParams.get(k);
  return {
    affordancefacts: () => a.affordanceFacts({ target: q("target"), viewer: q("viewer"), identity: q("identity"),
                                               author: q("author"), by: q("by") }),
    /* R37: the screens and the offered wizard scripts the untargeted answer publishes, for the stamped viewer. */
    affordancescreens: () => a.screens({ viewer: q("viewer") }),
  };
}
