/* project-roster — the acts on a project's working group that follow its setup: the roster and its removals record,
 * the owners' votes and an administrator's rescue, the visibility history and the directory, and requests to join.
 *
 * Requirements: build/requirements/project-roster.md (R1–R20). Split from membership for size at T38 (N783; K617,
 * K624, K2270: variant C1′ of `build/plan/membership-split.md`), by copy: each act's behaviour is membership's as T37
 * left it, its answers byte for byte. Inviting, joining, leaving and removing, the visibility setting, what a caller may
 * see of a project, the fence and the participation record stay `membership`'s.
 * Design: docs/architecture/BIO_Membership_Architecture_v2.md §7.
 *
 * SHAPE (K61). `projectRosterOf(ctx)` answers the one instance for a Durable Object's storage, over `ctx.storage.sql`,
 * reaching record-core by `recordOf(ctx)` and membership by `membershipOf(ctx)` on the same `ctx`; a test may pass its
 * own as `projectRosterOf(ctx, { record, membership })`. This module writes only its own three tables (`schema.mjs`).
 * It reads membership's tables only through membership's stated read contract (its R120) and writes them only through
 * `participationWrite` (its R118); it joins record-core's `bundles` only on its read contract (record-core R37) and
 * asks every other bundle fact of `core.bundleInfo` (R34). Calls go one way: membership never calls this module but
 * through the two notice slots this module registers in (membership R116, R117). */
import { MACHINE_CLASS_PREFIX } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { Membership, membershipOf, noSuchProject, viewerPredicate } from "../membership/index.mjs";
import { PROJECT_ROSTER_SCHEMA, PROJECT_ROSTER_TABLES } from "./schema.mjs";
import { PROJECT_ROSTER_CHECKS, PROJECT_JOIN_REQUEST_CHECKS } from "./checks.mjs";
export { PROJECT_ROSTER_TABLES } from "./schema.mjs";
export { PROJECT_ROSTER_CHECKS, PROJECT_JOIN_REQUEST_CHECKS } from "./checks.mjs";

const ROOT_ADMIN = Membership.ROOT_ADMIN;

export class ProjectRoster {
  constructor({ sql, core = null, membership } = {}) {
    this.sql = sql;
    this.core = core;
    this.m = membership;
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* A bundle's type and title, asked of record-core (its R34). */
  #bundle(bundleId) {
    const info = this.core && typeof this.core.bundleInfo === "function" ? this.core.bundleInfo(bundleId) : null;
    return info ? { type: info.type, title: typeof info.title === "string" ? info.title : null } : null;
  }

  /* This module's tables, at every boot, idempotent: every table and index created if absent (a store written before
     the split already holds them, as membership made them), then R18's purge declaration. Run by the host inside its
     boot, after membership's. */
  migrate() {
    const bare = PROJECT_ROSTER_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.sql.exec(t); }
    this.declareTables();
  }

  /* R18, through record-core's `declarePurge` (its R21, R46): each table keyed to a bundle (the project) by
     `project_id`. A refusal is thrown, as membership's is: a purge that silently skipped these tables would leave the
     project's votes and requests behind. */
  declareTables() {
    if (this.#declared) return false;
    const answer = this.core.declarePurge("project-roster",
      PROJECT_ROSTER_TABLES.map((name) => ({ name, keys: ["project_id"] })));
    if (answer && answer.ok === false)
      throw new Error(`project-roster: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }
  #declared = false;

  /* ===== R15, R16 — THE TWO NOTICES THIS MODULE TAKES FROM MEMBERSHIP (its R116, R117; R79's form) =====
   *
   * An invitation answers the invitee's open request to join (REC-226), and hiding a project lapses every open request
   * to it (REC-150). Both acts are membership's and the requests are this module's, so membership tells the one
   * registered listener inside its act, after its writes, and reads the number answered back: R116 puts
   * `request: "granted"` on its answer when it is at least 1, R117 puts it as `requests_lapsed`. Registered once, at
   * start (`projectRosterOf` calls it once per storage); each answer is membership's R81. Until membership offers a
   * slot there is nothing to register with, and its answer reads null. */
  start() {
    const invited = typeof this.m.onProjectInvited === "function"
      ? this.m.onProjectInvited("project-roster", (notice) => this.#invited(notice)) : null;
    const hidden = typeof this.m.onProjectHidden === "function"
      ? this.m.onProjectHidden("project-roster", (notice) => this.#hidden(notice)) : null;
    return { invited, hidden };
  }

  /* R15: the invitee's open request to that project, closed `granted` by the inviting owner at the act's time. A
     notice naming no member closes nothing: the statement below closes every open request of the project when the
     member is null, which is the lapse's form and never an invitation's. */
  #invited({ projectId, memberId, by = null, at = null } = {}) {
    if (typeof projectId !== "string" || !projectId || typeof memberId !== "string" || !memberId) return 0;
    return this.#closeJoinRequests(projectId, memberId, "granted", by ?? null, null, at ?? new Date().toISOString());
  }

  /* R16: every open request to the hidden project, closed `lapsed`, recorded with the owner who hid it and the date. */
  #hidden({ projectId, by = null, at = null } = {}) {
    if (typeof projectId !== "string" || !projectId) return 0;
    return this.#closeJoinRequests(projectId, null, "lapsed", by ?? null, null, at ?? new Date().toISOString());
  }

  /* ===== R17 (K861; plane R10) — THIS MODULE'S SHARE OF THE INSTANCE'S FIGURES =====
   *
   * The pending owner votes, so a purge can PROVE it took them (REC-27, D-137), shaped as record-core R63's
   * `counts(hid)` with its key list, which `plane` registers under this module's name; this module registers nothing
   * itself. `hid` is R63's: membership's `hiddenBundles(viewer)` (its R88), or null for a caller that sees every bundle
   * and for the direct internal call, which count whole. The table drops the rows whose `project_id` is in `hid` (D-464:
   * a count over rows the caller could not all read is a disclosure of existence). `COALESCE(project_id, '')`: a NULL
   * key names no bundle, and `NULL NOT IN (…)` is NULL, so without it the row would be dropped. Writes nothing. */
  static COUNT_KEYS = Object.freeze(["projectOwnerVotes"]);

  counts(hid = null) {
    const n = (table) => (hid
      ? this.#one(`SELECT count(*) c FROM ${table} WHERE COALESCE(project_id, '') NOT IN ${hid.sql}`, ...hid.args)
      : this.#one(`SELECT count(*) c FROM ${table}`)).c;
    return { projectOwnerVotes: n("project_owner_votes") };
  }

  /* ===== R19 — SIGHT BEFORE POSITION, AT EVERY ACT (membership R44, R61, R77) =====
   *
   * Every act naming a project asks, in this order: membership's `existenceAct` (C-70.1 at EXISTENCE, minted there and
   * relayed here), then whether the caller sees the project at all, answered as an id that names nothing
   * (`noSuchProject`, membership R78) when not, and only then the caller's position. Asked the other way round, the
   * positional refusal is the oracle. The roster acts' form of the sight question is membership's `rosterInSight`,
   * stated again here over `inSight` rather than imported: an ABSENT viewer (the parameter not sent: an internal caller,
   * a fixture, setup) is not asked; ANY viewer that was sent, an empty one included, is asked and fails closed. */
  #rosterInSight(projectId, viewer) {
    return viewer === null || viewer === undefined || this.m.inSight(projectId, viewer);
  }

  /* The project an owner's act names, or its refusal: C-70.1, the absent answer, or NOT_A_PROJECT. */
  #ownedProject(projectId, viewer, notAProject) {
    const b = this.#bundle(projectId);
    { const existence = b ? this.m.existenceAct(projectId, viewer) : null; if (existence) return existence; }
    if (!b || !this.#rosterInSight(projectId, viewer)) return noSuchProject(projectId);
    if (b.type !== "project") return notAProject;
    return null;
  }

  /* D54 (K2408, K2409): an ADMINISTRATOR's sight of a project, asked of membership's one rule (its R43) for the member
     `by` names, never of a second copy of it: FULL of a discoverable project, and of a hidden one only when invited or
     joined. The founder is spelled `member:admin`, which R43 reads as the founder's viewer. For the reads that carry
     no viewer (R1) or must not trust a viewer for another person (R14). */
  #adminAtFull(projectId, by) {
    return this.m.isAdministrator(by) && this.m.inSight(projectId, `member:${by}`);
  }

  /* R5 (T41; D54): the rescue is the one act an administrator holds that is reachable at an administrator's EXISTENCE of
     a hidden project (membership R44, R60). That EXISTENCE is the only one a HIDDEN project has (membership R44: a
     member outside a hidden project is at NONE), so it is asked as EXISTENCE of a hidden project, a sight membership
     answers, and never as a second reading of who is an administrator. A viewer never sent is not asked. */
  #rescueAtExistence(projectId, viewer) {
    if (viewer === null || viewer === undefined) return false;
    const b = this.#bundle(projectId);
    return !!b && b.type === "project" && this.m.sight(projectId, viewer) === Membership.SIGHT_EXISTENCE
      && this.m.visibilityOf(projectId) === "hidden";
  }

  /* ===== R1, R2, R6 — THE ROSTER AND ITS RECORD (§7.7, §7.8, §7.10, §7.13; Bob's ruling of 2026-09-26) =====
   *
   * §7.8: every participant sees the handles of all other participants, and an administrator sees them of every project
   * it sees at FULL (D54: of a hidden project, only when invited or joined, so never a hidden project's participants
   * otherwise; membership R43). Anyone else sees nothing, and is told the same thing whether the project exists or not, because §7.9 says an
   * uninvited member cannot see that a project EXISTS. The ownership decisions (R6) and the removals an owner made (R2,
   * membership R36 writes them) are read here beside the participants, by the same readers. */
  projectParticipants({ projectId, by } = {}) {
    const mine = this.m.participation(projectId, by);
    if (!mine && !this.#adminAtFull(projectId, by)) return noSuchProject(projectId);   /* membership R78 */
    const handleOf = (id) => this.m.memberFacts(id)?.handle ?? id;
    return { ok: true, projectId, participants: this.#rows(
      `SELECT m.handle, p.state, p.owner, p.comment, p.created
       FROM project_participants p JOIN members m ON m.member_id = p.member_id
       WHERE p.project_id=? ORDER BY p.owner DESC, m.handle`, projectId),
      /* R6: every ownership decision, with its deciders and reasons, in the order it was carried. */
      ownership: this.#rows(`SELECT kind, target, deciders, reasons, at FROM project_owner_decisions
                              WHERE project_id=? ORDER BY seq`, projectId).map((d) => ({
        kind: d.kind, handle: handleOf(d.target), deciders: JSON.parse(d.deciders).map(handleOf),
        reasons: JSON.parse(d.reasons), at: d.at })),
      /* R2: every removal an owner made: who removed whom, when, and the owner's reason. */
      removals: this.#rows(`SELECT member_id, removed_by, comment, at FROM project_removals
                             WHERE project_id=? ORDER BY seq`, projectId).map((x) => ({
        handle: handleOf(x.member_id), removedBy: handleOf(x.removed_by), reason: x.comment, at: x.at })) };
  }

  /* ===== R3–R7 — OWNERSHIP (§7.10, §7.13) =====
   *
   * Authority over a project belongs to its OWNERS, and to nobody else. An administrator sees every discoverable
   * project, and of a hidden one its id, name and owners unless added (§7.3, §7.8; D54), and directs none of them (§4.9), the single exception being §7.13, the rescue of a project whose owners are
   * all inactive (R5). The arithmetic is membership's `ownerMath` (its R38), read and never restated. */

  /* R3 (§7.10 addition). The sole owner may add a second unilaterally; every addition past that needs the consensus of
     ALL existing owners. Consensus on addition is the load-bearing half, exactly as in §4.7: without it one owner
     recruits confederates and manufactures the majority that then removes the others. */
  projectOwnerAdd({ projectId, handle, by, viewer = null } = {}) {
    { const refused = this.#ownedProject(projectId, viewer, { ok: false, reason: "NOT_A_PROJECT" }); if (refused) return refused; }
    if (!this.m.isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project may propose another owner of it" };
    const target = this.m.memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };
    const p = this.m.participation(projectId, target.member_id);
    /* An owner is a JOINED participant with the owner flag. An invited member has not accepted a place in the project
       at all, so making them an owner would also make them joined without their act; one who has asked to leave is on
       the way out. Both, and a member with no participation, are refused as not joined: C-56.5. */
    /* DEC-49 REGION is-owner-target-joined */
    if (!p || p.state !== "joined") {
      const row = PROJECT_ROSTER_CHECKS.TARGET_NOT_JOINED;
      return { ok: false, reason: "TARGET_NOT_JOINED", code: "TARGET_NOT_JOINED", check: row.check,
               translation: row.translation, handle, ...(p ? { state: p.state } : {}),
               detail: "an owner is a joined participant with the owner flag, so the member joins the project first" };
    }
    /* END DEC-49 REGION is-owner-target-joined */
    if (p.owner) return { ok: false, reason: "ALREADY_AN_OWNER", handle };

    const owners = this.m.projectOwners(projectId);
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO project_owner_votes (project_id,kind,target,voter,reason,created)
       VALUES (?,'add',?,?,NULL,?)`, projectId, target.member_id, by, now);

    /* The sole owner acts alone. Past that, every existing owner must have voted, and votes from members who are no
       longer owners do not count (R7). */
    if (owners.length > 1) {
      const have = this.#ownerVotes(projectId, "add", target.member_id, owners).map((v) => v.voter);
      const awaiting = owners.filter((o) => !have.includes(o));
      if (awaiting.length)
        return { ok: false, reason: "CONSENSUS_REQUIRED", projectId, handle,
                 have: have.sort(), awaiting: awaiting.sort(),
                 detail: "every existing owner must agree to an addition beyond the second" };
    }
    const deciders = this.#ownerVotes(projectId, "add", target.member_id, owners).map((v) => v.voter).sort();
    this.m.participationWrite("ownerOn", { projectId, memberId: target.member_id, by, at: now });   /* membership R118 */
    this.#recordOwnerDecision(projectId, "add", target.member_id, deciders, [], now);
    this.sql.exec(`DELETE FROM project_owner_votes WHERE project_id=? AND kind='add' AND target=?`,
      projectId, target.member_id);
    return { ok: true, projectId, handle, owner: true, owners: this.m.projectOwners(projectId).sort(), deciders };
  }

  /* R5 (§7.13): the ONE participation power an administrator has, and its condition. Only owners manage participation,
     and administrators may deactivate members; together those strand a project whose only owner was deactivated. THE
     CONDITION IS EVERY OWNER, NOT ANY OWNER, so it cannot be manufactured piecemeal, and IT ADDS RATHER THAN REPLACES:
     the inactive owners keep their rows, so a reactivated one is an owner again alongside the added one, and nothing
     about this exception strips anyone. Its caller-and-project refusals are membership's `rescueRefusal` (its R75),
     asked here so the offer (affordances) and the act cannot disagree. */
  projectOwnerRescue({ projectId, handle, by, reason, viewer = null } = {}) {
    /* Sight before position — so NOT_AN_ADMIN is said only to a member who can already see the project (an invited
       one). An administrator sees a discoverable project at FULL, and a hidden one it is not in at EXISTENCE, where
       the rescue alone stays reachable (D54; membership R60): there every answer below names only what that EXISTENCE
       shows (the id, the owners in `active` and `owners`) and the member named, never contents or other participants. */
    if (!this.#rescueAtExistence(projectId, viewer)) {
      const refused = this.#ownedProject(projectId, viewer, { ok: false, reason: "NOT_A_PROJECT" });
      if (refused) return refused;
    }
    const blocked = this.m.rescueRefusal(projectId, by);
    if (blocked) return blocked;
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "authority changes are recorded with a reason" };
    const target = this.m.memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };

    const now = new Date().toISOString();
    /* Recorded, and visible to every participant, like every other authority change: the §7.10 vote log with its own
       kind, so the project's ownership history reads in one place. */
    this.sql.exec(
      `INSERT OR REPLACE INTO project_owner_votes (project_id,kind,target,voter,reason,created)
       VALUES (?,'rescue',?,?,?,?)`, projectId, target.member_id, by, why, now);
    this.m.participationWrite("rescue", { projectId, memberId: target.member_id, by, comment: why, at: now });   /* R118 */
    this.#recordOwnerDecision(projectId, "rescue", target.member_id, [by], [why], now);
    return { ok: true, projectId, handle, by, reason: why, owner: true,
             owners: this.m.projectOwners(projectId).sort(), addedNotReplaced: true,
             detail: "the inactive owners keep their rows. If one is reactivated they are an owner again "
                   + "alongside this one, and removing them is then the ordinary 7.10 process." };
  }

  /* R4 (§7.10 removal). A majority of all owners, the target in the denominator and not voting, EXCEPT at exactly two
     owners where both must agree and the target is one of them. The floor is one owner. */
  projectOwnerRemove({ projectId, handle, by, reason, viewer = null } = {}) {
    { const refused = this.#ownedProject(projectId, viewer, { ok: false, reason: "NOT_A_PROJECT" }); if (refused) return refused; }
    if (!this.m.isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project votes on its ownership" };
    const target = this.m.memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (!this.m.isProjectOwner(projectId, target.member_id))
      return { ok: false, reason: "NOT_AN_OWNER", handle };
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "ownership changes are recorded with a reason" };

    /* DEC-49 REGION is-owner-floor — REC-64/C-33.28. */
    const owners = this.m.projectOwners(projectId);
    const math = Membership.ownerMath(owners.length);
    if (!math.possible)
      return { ok: false, reason: "LAST_OWNER", ...math,
               detail: "one owner is the floor, so the last owner of a project is not removable. Add "
                     + "another owner first, or deactivate the project (7.11)." };
    /* END DEC-49 REGION is-owner-floor */
    /* REC-224: a removal that would leave the project with owners who have ALL asked to leave is refused, naming them:
       the project would be left with nobody committed to running it. The code's row is membership's C-33.48. */
    const remaining = owners.filter((o) => o !== target.member_id);
    const committed = this.#committedOwners(projectId).filter((o) => o !== target.member_id);
    if (!committed.length)
      return { ok: false, reason: "LAST_COMMITTED_OWNER", ...math, leaving: remaining.sort(),
               detail: `removing this owner would leave only owners who have asked to leave (${remaining.join(", ")}), `
                     + "so nobody would be committed to the project. Add another owner first (7.10), or deactivate "
                     + "the project (7.11). Nothing was written." };
    /* At three and above the target does not vote. At two they must, which is the whole divergence from §4.7. */
    if (!math.targetMayVote && by === target.member_id)
      return { ok: false, reason: "TARGET_CANNOT_VOTE", ...math,
               detail: "the target is counted in the denominator but does not vote" };

    if (this.#one(
      `SELECT voter FROM project_owner_votes WHERE project_id=? AND kind='remove' AND target=? AND voter=?`,
      projectId, target.member_id, by))
      return { ok: false, reason: "ALREADY_VOTED", by };
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES (?,'remove',?,?,?,?)`,
      projectId, target.member_id, by, why, now);

    const counted = this.#ownerVotes(projectId, "remove", target.member_id, owners)
      .filter((v) => math.targetMayVote || v.voter !== target.member_id);
    const votes = counted.map((v) => v.voter);
    if (votes.length < math.votesNeeded)
      return { ok: false, reason: "VOTES_SHORT", projectId, handle,
               have: votes.length, need: math.votesNeeded, ...math, deciders: votes.sort() };

    /* Carried. They stay a PARTICIPANT: §7.10 says removing ownership leaves them on the project, and removing them
       from it entirely is then §7.7 (membership's `projectRemove`). */
    const reasons = counted.map((v) => v.reason).filter(Boolean);
    this.m.participationWrite("ownerOff", { projectId, memberId: target.member_id, by, at: now });   /* R118 */
    this.#recordOwnerDecision(projectId, "remove", target.member_id, [...votes].sort(), reasons, now);
    this.sql.exec(`DELETE FROM project_owner_votes WHERE project_id=? AND kind='remove' AND target=?`,
      projectId, target.member_id);
    return { ok: true, projectId, handle, owner: false, stillAParticipant: true,
             owners: this.m.projectOwners(projectId).sort(), deciders: votes.sort(), reasons };
  }

  /* The owners committed to the project: every owner who has not asked to leave (R4), read through membership's read
     contract (its R120). */
  #committedOwners(projectId) {
    return this.#rows(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1 AND state<>'leaving'`,
      projectId).map((r) => r.member_id);
  }

  /* R7 (N70): THE VOTES THAT COUNT on one proposal, `{voter, reason}` in voter order: those of the current `owners` (a
     former owner's vote does not count), joined in SQL to the participation (membership R120) and bounded by the owner
     count, which cuts nothing, since the table holds one row per voter per proposal (its key). */
  #ownerVotes(projectId, kind, target, owners) {
    return this.#rows(
      `SELECT v.voter, v.reason FROM project_owner_votes v
         JOIN project_participants p ON p.project_id = v.project_id AND p.member_id = v.voter AND p.owner = 1
        WHERE v.project_id=? AND v.kind=? AND v.target=? ORDER BY v.voter LIMIT ?`,
      projectId, kind, target, owners.length);
  }

  /* R6: a carried ownership decision, kept with its deciders and reasons. */
  #recordOwnerDecision(projectId, kind, target, deciders, reasons, at) {
    this.sql.exec(`INSERT INTO project_owner_decisions (project_id, kind, target, deciders, reasons, at)
                   VALUES (?,?,?,?,?,?)`, projectId, kind, target, JSON.stringify(deciders), JSON.stringify(reasons), at);
  }

  /* ===== R8, R9 — THE VISIBILITY HISTORY AND THE DIRECTORY (§7.14) ===== */

  /** R8: THE SETTING AND ITS HISTORY, for a caller with FULL sight (a participant, an administrator, the founder:
   *  §7.14, "administrators and the founder see the setting and its history"). A READ, so it does not widen: a caller
   *  without full sight is answered as for a project that does not exist. The setting is membership's `visibilityOf`
   *  (its R85), the one reading of the sight index; the history its act log (its R120). */
  projectVisibility({ projectId, viewer = null } = {}) {
    const b = this.#bundle(projectId);
    if (!b || !this.m.inSight(projectId, viewer)) return noSuchProject(projectId);
    if (b.type !== "project") return { ok: false, reason: "NOT_A_PROJECT", project: projectId };
    const history = this.#rows(
      `SELECT setting, set_by, reason, at FROM project_visibility WHERE project_id=? ORDER BY seq`, projectId);
    return { ok: true, projectId, setting: this.m.visibilityOf(projectId), recorded: history.length > 0, history,
             note: history.length ? undefined
               : "no owner has set this project's visibility, so it is HIDDEN: a project with no record reads "
                 + "hidden (Membership Architecture v2 §7.14)." };
  }

  /** R9: THE DIRECTORY (§7.14 "The directory"): for a member session, the DISCOVERABLE projects it does not see at FULL,
   *  each with its id and name and the state of the caller's OWN latest request to it (null only where it has never
   *  asked). A hidden project is never in it, so its absence is one answer for "hidden" and "does not exist". A viewer
   *  naming no member has no directory: it is refused by name, never answered empty.
   *
   *  ONE STATEMENT, BOUNDED ON WHAT GROWS (D-479, D-497). The DISCOVERABLE half joins membership's sight index
   *  (`project_sight`, its R120), the same rows its `visibilityOf` reads, so the rule about what an owner's acts mean is
   *  stated once (membership's `reindexProjectSight`) and read here. The NOT-FULL half is membership's own compiled
   *  `viewerPredicate` (its R43), NEGATED — never a hand copy: over rows already fixed to existing projects, `NOT (gate)`
   *  is exactly sight below FULL, and never NULL (each disjunct is a comparison FALSE for a project, or an EXISTS). The
   *  member refusal guarantees the gate is never `0=1`; it is `1=1` only for the founder's `member:admin`, who sees
   *  every project at FULL, so `NOT (1=1)` lists none, which is the answer. Under D54 (membership R43) the founder's and an
   *  administrator's gate withholds only hidden projects they are not in, and a hidden project is never listed here, so
   *  they too are listed none.
   *
   *  `limit` is the cap APPLIED, the caller's to lower and never to raise; `truncated` is MEASURED by reading one row
   *  past it, never derived from the page (a full page and a complete answer read alike). The page is the first `limit`
   *  in `bundle_id` order, so a page means the same thing twice. */
  projectDirectory({ viewer = null, limit = null } = {}) {
    const gate = viewerPredicate(viewer);
    const member = gate.member;
    const refusal = (code, detail) => {
      const row = PROJECT_ROSTER_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
    };
    /* DEC-49 REGION is-project-directory-member */
    if (!member)
      return refusal("PROJECT_DIRECTORY_NEEDS_A_MEMBER",
        "the project directory lists the discoverable projects a MEMBER is not in, so it is asked by a signed-in "
        + "member. A credential with no member behind it is outside no project, and an empty list would say "
        + "something untrue about the record.");
    /* END DEC-49 REGION is-project-directory-member */
    const cap = Math.max(1, Math.min(Number(limit) || ProjectRoster.PROJECT_DIRECTORY_LIMIT,
      ProjectRoster.PROJECT_DIRECTORY_LIMIT));
    /* `request` is the caller's own latest request to each listed project, joined in the SAME statement, so the page
       and its requests cannot disagree. Only the caller's own row is joined: whose else has asked is not a fact the
       directory holds. A granted request never appears: a grant makes the caller a participant, at FULL sight. */
    const projects = this.#rows(
      `SELECT b.bundle_id AS id, r.state AS rstate, r.asked_at AS rasked, r.closed_at AS rclosed
         FROM bundles b JOIN project_sight s ON s.project_id = b.bundle_id
         LEFT JOIN project_join_requests r
           ON r.seq = (SELECT MAX(r2.seq) FROM project_join_requests r2
                        WHERE r2.member_id = ? AND r2.project_id = b.bundle_id)
        WHERE b.object_type = 'project' AND s.setting = 'discoverable' AND NOT (${gate.sql})
        ORDER BY b.bundle_id
        LIMIT ?`, member, ...gate.args, cap + 1)
      .map((r) => ({ id: r.id, name: this.#bundle(r.id)?.title ?? null,
                     request: r.rstate ? { state: r.rstate, asked: r.rasked, closed: r.rclosed ?? null } : null }));
    const truncated = projects.length > cap;
    /* Cut by a slice at the published cap, so the collection `truncated` was measured over stays beside the page. */
    const page = truncated ? projects.slice(0, cap) : projects;
    return { ok: true, projects: page, count: page.length, limit: cap, truncated };
  }

  /* D-479: THE DIRECTORY'S PAGE SIZE, a chosen ceiling and never a finding: generous enough that a member browsing for
     one project to ask to join rarely meets it, published whenever it cuts. It may be lowered, never raised (R9). */
  static PROJECT_DIRECTORY_LIMIT = 200;

  /* ===== R10–R16 — THE REQUEST TO JOIN (§7.14, "The request to join"; Bob, 2026-09-18: *"somebody who sees the
   * project can ask to be added as a member"*) =====
   *   ASK       `projectRequest` — a member SESSION at EXISTENCE sight, at most ONE OPEN request per member per project,
   *             an optional short comment. A hidden project, or one the caller cannot see, is answered as absent.
   *   WITHDRAW  `projectRequestWithdraw` — the requester's own open request. After it they may ask again.
   *   ANSWER    `projectRequestAnswer` — an OWNER's (§7.2: only owners invite). GRANT IS AN INVITATION, written
   *             `invited` through membership's `participationWrite` (its R118), NEVER `joined` (§7.4). DECLINE is
   *             recorded with an optional comment. Administrators and the founder see requests and answer none.
   *   CLOSE     R15 (an invitation, membership R32) and R16 (the project set hidden, membership R45), through the
   *             notices this module registers for.
   *   READ      `projectRequests` — a project's requests to its owners and administrators; with no project, the
   *             caller's OWN requests, which it keeps sight of after a lapse, naming only what it already saw.
   * The record is `project_join_requests` (`schema.mjs`): append-only at the field (R13). */
  static JOIN_REQUEST_ANSWERS = Object.freeze(["grant", "decline"]);

  /* The member a request is ABOUT is the server-stamped `by`, never a name the caller supplies; a machine credential
     stamps `class:<cls>` and names nobody, so it resolves to no member. The FOUNDER is a person with no roster row, so
     "no member behind this credential" would be false about them: they are answered as the person they are, at FULL
     sight, so the ask is C-95.2 like any administrator's. A member's standing is membership's `memberFacts` (its R68). */
  #activeMemberRow(memberId) {
    if (memberId === null || memberId === undefined || String(memberId).startsWith(MACHINE_CLASS_PREFIX)) return null;
    if (memberId === ROOT_ADMIN) return { member_id: ROOT_ADMIN, handle: null, status: "active" };
    const f = this.m.memberFacts(memberId);
    return f && f.status === "active" ? { member_id: memberId, handle: f.handle, status: f.status } : null;
  }

  /* THE PERSON ASKING: the stamped `by` names an active member AND the stamped viewer names the SAME person — the
     control plane stamps both from one session, so a disagreement is a caller that is not a member session and asks
     nothing. The founder's viewer is spelled bare `admin` or `member:admin` (membership R43); every other member is
     matched by `viewerPredicate`'s own parse, never a second one. */
  #requester(by, viewer) {
    const me = this.#activeMemberRow(by);
    if (!me) return null;
    if (me.member_id === ROOT_ADMIN)
      return viewer === ROOT_ADMIN || viewerPredicate(viewer).member === ROOT_ADMIN ? me : null;
    return viewerPredicate(viewer).member === me.member_id ? me : null;
  }

  /* C-95.1 and C-95.4 are each said at more than one act, so each is minted in ONE governed region and every act
     RELAYS it: one row, one `where`. The DETAIL is the act's own sentence, handed in; the code is the literal here. */
  #joinRequestRefusal(code, projectId, detail, extra = {}) {
    const row = PROJECT_JOIN_REQUEST_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
             project: projectId ?? null, ...extra };
  }

  #noRequester(projectId, detail) {
    const refusal = (code, d) => this.#joinRequestRefusal(code, projectId, d);
    /* DEC-49 REGION is-join-request-member */
    return refusal("PROJECT_REQUEST_NEEDS_A_MEMBER",
      `${detail} A request to join is a PERSON's act: it is made, withdrawn and read back by the member who `
      + `asked, signed in as themselves (Membership Architecture v2 §7.14), and a machine credential, the operator's `
      + `bearer and the member bearer have nobody behind them to ask.`);
    /* END DEC-49 REGION is-join-request-member */
  }

  #noOpenRequest(projectId, detail, extra = {}) {
    const refusal = (code, d) => this.#joinRequestRefusal(code, projectId, d, extra);
    /* DEC-49 REGION is-join-request-none-open */
    return refusal("PROJECT_REQUEST_NONE_OPEN",
      `${detail} A request is open until it is granted, declined, withdrawn, or lapsed by its project going `
      + `hidden (Membership Architecture v2 §7.14), and each of those closes it for good; the member may ask `
      + `again.`);
    /* END DEC-49 REGION is-join-request-none-open */
  }

  #openJoinRequest(projectId, memberId) {
    return this.#one(`SELECT seq, comment, asked_at FROM project_join_requests
                       WHERE project_id=? AND member_id=? AND state='open'`, projectId, memberId);
  }

  /* R13: THE ONE STATEMENT THAT CLOSES A REQUEST. Every terminal state is written here, and only an OPEN row moves: the
     `WHERE state='open'` is what makes the closing fields write-once, so an answered request cannot be answered twice
     and a withdrawn one cannot then be granted. A null `memberId` closes every open request of the project (R16's
     lapse). Answers the number of rows closed. */
  #closeJoinRequests(projectId, memberId, state, by, comment, at) {
    const before = this.#one(`SELECT COUNT(*) AS n FROM project_join_requests
                               WHERE project_id=? AND (? IS NULL OR member_id=?) AND state='open'`,
      projectId, memberId, memberId).n;
    this.sql.exec(`UPDATE project_join_requests SET state=?, closed_by=?, closed_comment=?, closed_at=?
                    WHERE project_id=? AND (? IS NULL OR member_id=?) AND state='open'`,
      state, by, comment, at, projectId, memberId, memberId);
    return before;
  }

  static #requestComment(comment) {
    return comment === null || comment === undefined || String(comment).trim() === ""
      ? null : String(comment).slice(0, 280);
  }

  /** R10: ASK TO JOIN (§7.14 "Who may ask"). The one act a member at EXISTENCE may take. Who asks is settled first
   *  (a fact about the caller, saying nothing about any project); then sight, which says nothing a caller did not
   *  already know: NONE is the absent answer byte for byte; FULL is refused positionally. Only at EXISTENCE is a request
   *  written, with the name the caller was shown. */
  projectRequest({ projectId, comment = null, by, viewer = null } = {}) {
    const refusal = (code, detail, extra = {}) => {
      const row = PROJECT_JOIN_REQUEST_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               project: projectId ?? null, ...extra };
    };
    /* DEC-49 REGION is-join-request-ask */
    const me = this.#requester(by, viewer);
    if (!me)
      return this.#noRequester(projectId,
        "asking to join a project is a signed-in member's own act (Membership Architecture v2 §7.14). A "
        + "credential with no active member behind it asks nothing. Nothing was written.");
    /* Only a PROJECT is asked to join: any other bundle is visible to every member (§7.9), so its sight would read
       FULL and misname it a project the caller is in. It is answered as what it is — no project by that id. */
    const b = this.#bundle(projectId);
    const shown = b ? b.title : null;
    const sight = b && b.type === "project" ? this.m.sight(projectId, viewer) : Membership.SIGHT_NONE;
    if (sight === Membership.SIGHT_NONE) return noSuchProject(projectId);
    /* The ask is open only at a DISCOVERABLE project's EXISTENCE (§7.14: a member outside a discoverable project asks).
       The other EXISTENCE, an administrator's of a hidden project it is not in (D54; membership R44), is answered as
       every caller at EXISTENCE is, membership's C-70.1 with its owners: hiding lapses every request (R16), so a
       hidden project holds none open, and its owners add an administrator by inviting them. */
    if (sight === Membership.SIGHT_EXISTENCE && this.m.visibilityOf(projectId) !== "discoverable")
      return this.m.existenceAct(projectId, viewer);
    if (sight === Membership.SIGHT_FULL)
      return refusal("PROJECT_REQUEST_NOT_OUTSIDE",
        "you can already see this project, so there is nothing to ask: a participant is already in it (an "
        + "invited one joins by the checkbox, §7.4), and an administrator's sight of a project is not a "
        + "position in it (§7.3). Nothing was written.");
    const open = this.#openJoinRequest(projectId, me.member_id);
    if (open)
      return refusal("PROJECT_REQUEST_ALREADY_OPEN",
        "you already have an open request to join this project. One is open at a time: withdraw it to ask "
        + "again. Nothing was written.", { asked: open.asked_at });
    /* END DEC-49 REGION is-join-request-ask */
    const c = ProjectRoster.#requestComment(comment);
    const at = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO project_join_requests (project_id, member_id, project_name, comment, asked_at, state)
       VALUES (?,?,?,?,?,'open')`, projectId, me.member_id, shown, c, at);
    return { ok: true, projectId, name: shown, state: "open", comment: c, asked: at,
             detail: "your request is open. The project's owners answer it; until they do it stays open." };
  }

  /** R11: WITHDRAW (§7.14: "The requester may withdraw an open request"). The requester's own act on their own record,
   *  so it asks no sight of the project: a caller with no open request to that id is answered ONE way whether the
   *  project is discoverable, hidden or absent. */
  projectRequestWithdraw({ projectId, by, viewer = null } = {}) {
    const me = this.#requester(by, viewer);
    if (!me)
      return this.#noRequester(projectId,
        "withdrawing a request to join is the requester's own act, and a credential with no active member "
        + "behind it made none. Nothing was written.");
    if (!this.#openJoinRequest(projectId, me.member_id))
      return this.#noOpenRequest(projectId,
        "you have no open request to join a project by that id, so there is nothing to withdraw. This answer is "
        + "the same whatever that id names. Nothing was written.");
    const at = new Date().toISOString();
    this.#closeJoinRequests(projectId, me.member_id, "withdrawn", me.member_id, null, at);
    return { ok: true, projectId, state: "withdrawn", closed: at };
  }

  /** R12: AN OWNER ANSWERS (§7.14 "Who answers"). Sight before position, as every roster act; then ownership, through
   *  membership's `isProjectOwner` (§7's one owner predicate), so an administrator, the founder and every machine
   *  credential are refused by name. GRANT writes `invited`, `invited_by` the granting owner — never `joined` (§7.4).
   *  DECLINE is recorded with the owner's optional comment. A refused grant leaves the request open. */
  projectRequestAnswer({ projectId, handle, answer, comment = null, by, viewer = null } = {}) {
    { const refused = this.#ownedProject(projectId, viewer, { ok: false, reason: "NOT_A_PROJECT", project: projectId });
      if (refused) return refused; }
    const want = String(answer ?? "");
    const refusal = (code, detail, extra = {}) => {
      const row = PROJECT_JOIN_REQUEST_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               project: projectId, ...extra };
    };
    /* DEC-49 REGION is-join-request-answer */
    if (!this.m.isProjectOwner(projectId, by))
      return refusal("PROJECT_REQUEST_ANSWER_NOT_THE_OWNER",
        `a request to join ${String(projectId).slice(0, 80)} is answered by its OWNERS (Membership Architecture `
        + `v2 §7.14; only owners invite, §7.2), and ${String(by ?? "an unnamed caller").slice(0, 80)} is not one `
        + `of them. Administrators see requests and answer none. Nothing was written.`);
    if (!ProjectRoster.JOIN_REQUEST_ANSWERS.includes(want))
      return refusal("PROJECT_REQUEST_UNKNOWN_ANSWER",
        `${JSON.stringify(want.slice(0, 40))} is not an answer: a request is granted or declined, and nothing `
        + `else. Nothing was written.`);
    const target = this.m.memberByHandle(handle);
    const open = target ? this.#openJoinRequest(projectId, target.member_id) : null;
    if (!open)
      return this.#noOpenRequest(projectId,
        `${JSON.stringify(String(handle ?? "").slice(0, 80))} has no open request to join this project, so there `
        + `is nothing to answer. Nothing was written.`, { handle: handle ?? null });
    if (want === "grant" && target.status !== "active")
      return refusal("PROJECT_REQUEST_REQUESTER_INACTIVE",
        `${JSON.stringify(target.handle)} is not an active member, and a grant is an invitation (§7.2), which `
        + `goes to an active member. The request stays open. Nothing was written.`, { handle: target.handle });
    if (want === "grant" && this.m.participation(projectId, target.member_id))
      return refusal("PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT",
        `${JSON.stringify(target.handle)} is already a participant of this project, so a grant would invite `
        + `nobody new. The request stays open: decline it, or the requester withdraws it. Nothing was written.`,
        { handle: target.handle });
    /* END DEC-49 REGION is-join-request-answer */
    const c = ProjectRoster.#requestComment(comment);
    const at = new Date().toISOString();
    /* THE SAME ROW §7.2's invitation writes: `invited`, not an owner, invited_by the owner who granted. */
    if (want === "grant") this.m.participationWrite("invite", { projectId, memberId: target.member_id, by, at });   /* R118 */
    this.#closeJoinRequests(projectId, target.member_id, want === "grant" ? "granted" : "declined", by, c, at);
    return { ok: true, projectId, handle: target.handle, state: want === "grant" ? "granted" : "declined",
             comment: c, closed: at,
             ...(want === "grant"
               ? { participation: "invited",
                   detail: "granted as an invitation: the member is INVITED, and joins by the checkbox (§7.4)." }
               : {}) };
  }

  /** R14: WHO SEES A REQUEST (§7.14): the requester (their own, always), the project's owners, and administrators; not
   *  other participants, because a pending requester is not a participant (§7.8). WITH `projectId`: that project's
   *  requests, to an owner or an administrator (the founder included) at FULL sight of it (D54), after sight: an
   *  administrator at a hidden project's EXISTENCE is answered C-70.1 first, as every caller at EXISTENCE. WITHOUT it: the caller's OWN
   *  requests, every project and every state, each naming the project by the id and the name the caller was shown when
   *  asking — so a request LAPSED by a project going hidden is still the requester's to read, and names nothing they had
   *  not already seen. Its answering owner is NOT in the requester's view: who owns a project is contents. Both lists
   *  are bounded as R9's directory is (the first `limit` in the order made). */
  projectRequests({ projectId = null, by, viewer = null, limit = null } = {}) {
    const cap = Math.max(1, Math.min(Number(limit) || ProjectRoster.PROJECT_REQUESTS_LIMIT,
      ProjectRoster.PROJECT_REQUESTS_LIMIT));
    const refusal = (code, detail) => {
      const row = PROJECT_JOIN_REQUEST_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               project: projectId ?? null };
    };
    if (projectId === null || projectId === undefined || projectId === "") {
      const me = this.#requester(by, viewer);
      if (!me)
        return this.#noRequester(null,
          "a member's own requests to join are read by that member, signed in. A credential with no active "
          + "member behind it has made none.");
      const mine = this.#rows(
        `SELECT project_id AS project, project_name AS name, comment, state, asked_at AS asked,
                closed_comment, closed_at AS closed
           FROM project_join_requests WHERE member_id=? ORDER BY seq LIMIT ?`, me.member_id, cap + 1);
      const mineCut = mine.length > cap;
      const minePage = mineCut ? mine.slice(0, cap) : mine;
      return { ok: true, own: true, requests: minePage, count: minePage.length, limit: cap, truncated: mineCut };
    }
    const b = this.#bundle(projectId);
    { const existence = b ? this.m.existenceAct(projectId, viewer) : null; if (existence) return existence; }
    if (!b || !this.m.inSight(projectId, viewer)) return noSuchProject(projectId);
    if (b.type !== "project") return { ok: false, reason: "NOT_A_PROJECT", project: projectId };
    /* DEC-49 REGION is-join-requests-project */
    if (!this.m.isProjectOwner(projectId, by) && !this.#adminAtFull(projectId, by))
      return refusal("PROJECT_REQUESTS_NOT_VISIBLE",
        "a project's requests to join are seen by the requester, the project's owners and administrators "
        + "(Membership Architecture v2 §7.14), and not by other participants: a pending requester is not a "
        + "participant (§7.8). Your own requests are read without naming a project.");
    /* END DEC-49 REGION is-join-requests-project */
    const theirs = this.#rows(
      `SELECT m.handle, r.comment, r.state, r.asked_at AS asked, cb.handle AS closed_by,
              r.closed_comment, r.closed_at AS closed
         FROM project_join_requests r JOIN members m ON m.member_id = r.member_id
         LEFT JOIN members cb ON cb.member_id = r.closed_by
        WHERE r.project_id=? ORDER BY r.seq LIMIT ?`, projectId, cap + 1);
    const theirsCut = theirs.length > cap;
    const theirsPage = theirsCut ? theirs.slice(0, cap) : theirs;
    return { ok: true, own: false, projectId, requests: theirsPage, count: theirsPage.length, limit: cap,
             truncated: theirsCut };
  }

  /* THE REQUESTS READ'S PAGE SIZE, a chosen ceiling as R9's: a list a person reads to answer or to recall their own
     asks, generous enough that a legitimate caller rarely meets it, published whenever it cuts. */
  static PROJECT_REQUESTS_LIMIT = 200;
}

/* K61: the one ProjectRoster of a Durable Object's storage, made on first use over its `sql`, reaching record-core by
   `recordOf(ctx)` and membership by `membershipOf(ctx)` on the same `ctx`, and started once (R15, R16). `record` and
   `membership` (a test's own) are read on the first call only. */
const OF = new WeakMap();
export function projectRosterOf(ctx, { record = null, membership = null } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let r = OF.get(storage);
  if (!r) {
    r = new ProjectRoster({ sql: storage.sql, core: record ?? recordOf(ctx),
                            membership: membership ?? membershipOf(ctx, { record }) });
    OF.set(storage, r);
    r.start();
  }
  return r;
}

/* The ops this module answers, as entries of the plane's op map (the composition root, `plane`, spreads them in after
   membership's; their names, declarations and grades are unchanged by the split). `url` is the request URL, whose query
   carries the control plane's stamps (`by`, `viewer`); every parameter is read from it, never from a body. */
export function projectRosterOps(r, url, body, env) {
  const q = (k) => url.searchParams.get(k);
  return {
    /* REC-138: `viewer` is the control plane's stamp (sight before position, R19). */
    projectowneradd: () => r.projectOwnerAdd({ projectId: q("projectId"), handle: q("handle"), by: q("by"),
      viewer: q("viewer") }),
    projectownerremove: () => r.projectOwnerRemove({ projectId: q("projectId"), handle: q("handle"), by: q("by"),
      reason: q("reason"), viewer: q("viewer") }),
    projectownerrescue: () => r.projectOwnerRescue({ projectId: q("projectId"), handle: q("handle"), by: q("by"),
      reason: q("reason"), viewer: q("viewer") }),
    projectvisibility: () => r.projectVisibility({ projectId: q("projectId"), viewer: q("viewer") }),
    /* D-479: `limit` reaches the directory's page (the cap is the caller's to LOWER, not to raise). */
    projectdirectory: () => r.projectDirectory({ viewer: q("viewer"), limit: q("limit") }),
    projectparticipants: () => r.projectParticipants({ projectId: q("projectId"), by: q("by") }),
    /* REC-150: `by` and `viewer` are the control plane's stamps. */
    projectrequest: () => r.projectRequest({ projectId: q("projectId"), comment: q("comment"), by: q("by"),
      viewer: q("viewer") }),
    projectrequestwithdraw: () => r.projectRequestWithdraw({ projectId: q("projectId"), by: q("by"),
      viewer: q("viewer") }),
    projectrequestanswer: () => r.projectRequestAnswer({ projectId: q("projectId"), handle: q("handle"),
      answer: q("answer"), comment: q("comment"), by: q("by"), viewer: q("viewer") }),
    projectrequests: () => r.projectRequests({ projectId: q("projectId"), by: q("by"), viewer: q("viewer"),
      limit: q("limit") }),
  };
}
