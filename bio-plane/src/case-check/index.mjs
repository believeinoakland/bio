/* case-check — a case checked for publication and held unsigned (requirements: `build/requirements/case-check.md`;
 * BIO_Action_v0_2.md §3 Determination, §4 rule 2; Actions D23, D24). A project may run its case through every check
 * publication makes and keep it unsigned, with no limit: holding is the act itself (D23). This module records that check
 * (R1) and answers, at each read, whether it still stands (R2), so a determination may rest on findings checked for
 * publication and not yet published (D24; `conformance` R2, which reads R2 and R3). A held check is a state, never a
 * fault (R5).
 *
 * New in T45 (T45-22; N828; K2781 (1)): built fresh, no id moved, placed last in layer 8 after `review` so that
 * `case-authoring` stays under K617's bound.
 *
 * WHAT VOIDS A CHECK (R2; l8 doubt 3): any move of the stored preparation's `doc_sha` (a re-authored acknowledgement
 * list among them), a member whose current bundle is no longer the one pinned, and the commit's three lapse reads
 * (`case-carriage` R4, R5, R13, as `publication` R51, R57, R59 ask them at the commit), each asked over the interval
 * from the check's `checked_at` to the read (its R19–R21; T46, N907, K2833). Nothing is stored about a lapse: each read
 * computes it. A void check stays void when its cause is undone: for a replaced preparation (preparations only move
 * forward), a moved member (its commit count, record-core's `row_version`, never returns), and a lapse since the check
 * (case-carriage's histories answer it, as far as they hold one). The commit still re-reads all three at its own
 * instant. Any read that fails answers `undetermined`, never `held` (fail closed).
 *
 * REACHED as `caseCheckOf(host, deps)` (K61): one instance per host, created on the first call with `deps`, returned
 * to every later caller. At creation it creates its table and declares it to record-core's purge (R4).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record          `transact`, `mintOpaqueId` (a check's opaque id, `CHK`), `declarePurge`; the `bundles` read
 *                   contract (its R37), for `member_moved`.
 *   caseAuthoring   `publishPreflight` (its R34), `publishCase` (its R14, R18) and `calculationsAtPublication` (its
 *                   R56, which the op arm gathers first, as `op=publish` does).
 *   publication     `hasCaseStanding` (its R1), R2's fence.
 *   caseCarriage    `sourcesLapsedSince`, `acceptedWorkLapsedSince` and `marksLapsedSince` (its R21, R19, R20), each
 *                   asked from the check's `checked_at`.
 *   now             the clock for `checked_at`, an ISO string (default: record-core's instant).
 *
 * READ CONTRACTS it joins in its own SQL: publication's `cases`, `published_cases` and `case_documents` (its R40, R56);
 * record-core's `bundles` (its R37). `membership.viewerPredicate` answers whether a viewer is a stamp at all. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { caseCarriageOf } from "../case-carriage/index.mjs";
import { caseAuthoringOf } from "../case-authoring/index.mjs";
import { parseFrontmatter, createSha256 } from "../record-grammar/index.mjs";
import { CASE_CHECK_CHECKS } from "./checks.mjs";
import { CASE_CHECK_TABLES, migrateCaseCheck } from "./schema.mjs";

export { CASE_CHECK_CHECKS } from "./checks.mjs";
export { CASE_CHECK_SCHEMA, CASE_CHECK_TABLES } from "./schema.mjs";

/** R1: the check's id prefix, minted opaque. */
export const CHECK_PREFIX = "CHK";
/** R2: the states, and the causes of `void` in the order they are answered. */
export const CHECK_STATES = Object.freeze(["held", "void", "published", "none", "undetermined"]);
export const VOID_CAUSES = Object.freeze(["document_replaced", "member_moved", "source_lapsed", "accepted_work_lapsed",
                                          "marks_lapsed"]);
/** R5: the key each shown state carries; its words are the UX design stream's. */
export const stateKey = (state, why = null) => (state === "void" ? `case.check.void.${why}`
  : state === "held" || state === "undetermined" ? `case.check.${state}` : null);

const str = (v) => (typeof v === "string" ? v.trim() : "");
const ROLLBACK = Symbol("case-check dry run");

function refusal(code, detail, extra) {
  const row = CASE_CHECK_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}

/** R2: NOT PERMITTED, AND NOT THERE, ARE ONE ANSWER, built from no argument so its bytes vary with nothing. */
export function noSuchCase() {
  /* DEC-49 REGION is-case-check-case */
  return refusal("NO_SUCH_CASE", "no case by that name answers this read: a case being prepared in a project the "
                 + "viewer has no standing in is answered exactly as one that does not exist.");
  /* END DEC-49 REGION is-case-check-case */
}

/* R1: what makes an act a repeat. Two acts are one when their own inputs are: every argument but the viewer stamp
   (the author stays, so another owner's act is a check of their own), as canonical JSON (keys sorted), digested. A
   held check answers only the act that made it: an edited statement over the same members is a new preparation. */
const sorted = (v) => (Array.isArray(v) ? v.map(sorted) : v && typeof v === "object"
  ? Object.fromEntries(Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => [k, sorted(v[k])])) : v);
function inputsSha(act) {
  const { viewer: _viewer, ...own } = act;
  return createSha256().update(new TextEncoder().encode(JSON.stringify(sorted(own)))).hex();
}

/* The members a check pins, as stored: canonical JSON, in the order the case lists them. */
const canonical = (members) => JSON.stringify(members.map((m) => ({ bundle_id: m.bundle_id, version_sha: m.version_sha,
                                                                    role: m.role })));

export class CaseCheck {
  #deps;
  #seeded = false;

  constructor({ storage, record, host = null, caseAuthoring = null, publication = null, caseCarriage = null,
                now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.#deps = { host, caseAuthoring, publication, caseCarriage };
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get caseAuthoring() { return this.#deps.caseAuthoring ||= caseAuthoringOf(this.#deps.host); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  get caseCarriage() { return this.#deps.caseCarriage ||= caseCarriageOf(this.#deps.host); }

  migrate() { migrateCaseCheck(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }

  /* ==========================================================================================================
   * R1: checkAndHold. The pre-flight (case-authoring R34) decides; a ready case is prepared (its R14) and its check
   * recorded, all inside one transaction, so a refusal anywhere writes nothing. `calculationFacts` is what the op arm
   * gathered (case-authoring R56), handed to both runs as `op=publish` hands it to its act.
   * ========================================================================================================== */
  checkAndHold(args = {}, calculationFacts = null) {
    const given = args && typeof args === "object" ? args : {};
    /* case-authoring R34 reads a carried agent credential beside the stamp; R14's act takes the stamp itself. */
    const act = given.viewer && typeof given.viewer === "object" ? { ...given, viewer: given.viewer.stamp ?? null } : given;
    return this.record.transact(() => {
      const pre = this.caseAuthoring.publishPreflight(given, calculationFacts);
      if (!pre || pre.ready !== true) {
        const first = pre?.first ?? null, blockers = Array.isArray(pre?.blockers) ? pre.blockers : [];
        const lead = first || blockers[0] || { reason: "PREFLIGHT_UNDETERMINED", detail: "the pre-flight gave no answer" };
        const { ok: _ok, ...shown } = lead;
        return { ...shown, ok: false, ready: false, held: false, first, blockers };
      }
      /* R1's repeat: the edition this act would prepare, learnt from a run rolled back (case-authoring R18), so a check
         still held, made by this same act (its inputs), is answered without a second preparation replacing the first. */
      let dry = null;
      try {
        this.record.transact(() => { dry = this.caseAuthoring.publishCase(act, calculationFacts); throw ROLLBACK; });
      } catch (e) { if (e !== ROLLBACK) throw e; }
      if (!dry || dry.ok !== true) return dry && dry.ok === false ? dry : { ok: false, reason: "PREPARATION_UNDETERMINED" };
      const digest = inputsSha(act);
      const latest = this.#latest(dry.caseId, Number(dry.edition));
      if (latest && latest.inputs_sha === digest) {
        const st = this.#state(latest);
        if (st.state === "held") return { ok: true, held: true, existed: true, ...this.#shown(latest) };
      }
      const prepared = this.caseAuthoring.publishCase(act, calculationFacts);
      if (!prepared || prepared.ok !== true) return prepared;
      const caseId = prepared.caseId, edition = Number(prepared.edition);
      const stored = this.#one(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=?`, caseId, edition);
      if (!stored || !stored.doc_sha)
        return { ok: false, reason: "PREPARATION_UNDETERMINED",
                 detail: "the preparation was not found where publication stores it, so no check was recorded" };
      const roles = prepared.roles && typeof prepared.roles === "object" ? prepared.roles : {};
      const members = (Array.isArray(prepared.findings) ? prepared.findings : [])
        .map((f) => ({ bundle_id: f.target, version_sha: f.bundleSha ?? null, role: f.role ?? roles[f.target] ?? null }));
      /* R2's latch: each member's commit count at the check (record-core R37's `bundles.row_version`, one per commit,
         its R41). A finding's sha is the digest of its bundle.md, so a version reverted returns to the pinned sha; the
         count never does. */
      const rows = {};
      for (const m of members)
        rows[m.bundle_id] = this.#one(`SELECT row_version FROM bundles WHERE bundle_id=?`, m.bundle_id)?.row_version ?? null;
      const when = this.#when();
      const taken = (id) => !!this.#one(`SELECT 1 AS x FROM case_checks WHERE check_id=?`, id);
      const check = this.record.mintOpaqueId(CHECK_PREFIX, when.slice(0, 4), "", taken);
      if (!check) return { ok: false, reason: "MINT_EXHAUSTED", prefix: CHECK_PREFIX };
      const by = str(given.author);
      this.sql.exec(`INSERT INTO case_checks (check_id, case_id, edition, project_id, doc_sha, members, member_rows,
                     checked_at, by, inputs_sha) VALUES (?,?,?,?,?,?,?,?,?,?)`, check, caseId, edition,
                    prepared.project ?? null, stored.doc_sha, canonical(members), JSON.stringify(rows), when, by, digest);
      const row = this.#one(`SELECT * FROM case_checks WHERE check_id=?`, check);
      return { ok: true, held: true, ...this.#shown(row), caseDocument: prepared.caseDocument ?? null };
    });
  }

  /* A check as answered: its identity, what it pins, when and by whom. */
  #shown(row) {
    return { check: row.check_id, case: row.case_id, edition: Number(row.edition), project: row.project_id ?? null,
             doc_sha: row.doc_sha, members: JSON.parse(row.members), checked_at: row.checked_at, by: row.by };
  }

  #latest(caseId, edition) {
    return this.#one(`SELECT * FROM case_checks WHERE case_id=? AND edition=? ORDER BY seq DESC LIMIT 1`, caseId, edition);
  }

  /* ==========================================================================================================
   * R2's computation over one check row: `published`, else `void` with every cause that holds, else `held`. Any read
   * that throws or answers outside its shape is `undetermined`: a failed read never answers `held`.
   * ========================================================================================================== */
  #state(row) {
    try {
      const ed = Number(row.edition);
      if (this.#one(`SELECT 1 AS x FROM published_cases WHERE case_id=? AND edition=?`, row.case_id, ed))
        return { state: "published", published_edition: ed };
      const why = [], extra = {};
      const doc = this.#one(`SELECT doc_sha, text FROM case_documents WHERE case_id=? AND edition=?`, row.case_id, ed);
      const replaced = !doc || doc.doc_sha !== row.doc_sha;
      if (replaced) why.push("document_replaced");
      /* A member moved at any moment since the check: its current sha is not the pinned one, or a commit has been made
         to it since (its commit count moved), or it is gone. */
      const moved = [];
      const counts = JSON.parse(row.member_rows);
      for (const m of JSON.parse(row.members)) {
        const b = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, m.bundle_id);
        const current = b ? b.bundle_sha ?? null : null;
        if (!b || current !== m.version_sha || b.row_version !== counts[m.bundle_id])
          moved.push({ bundle_id: m.bundle_id, pinned: m.version_sha, current });
      }
      if (moved.length) { why.push("member_moved"); extra.moved = moved; }
      if (!replaced) {
        /* The commit's three lapse reads, over the checked text itself, as publication R51, R57, R59 ask them, each
           over the interval since the check (case-carriage R19–R21), so a lapse undone before this read still voids. A
           provider without them is a failed read: undetermined, never held. */
        const C = this.caseCarriage, since = row.checked_at;
        const fm = parseFrontmatter(String(doc.text ?? "")).data;
        if (!fm || typeof fm !== "object") throw new Error("the checked preparation's front matter could not be read");
        const sources = C.sourcesLapsedSince(doc.text, since);
        if (!Array.isArray(sources)) throw new Error("case-carriage's sources read gave no list");
        if (sources.length) why.push("source_lapsed");
        const accepted = C.acceptedWorkLapsedSince(fm, row.by, since);
        if (accepted !== null && accepted !== undefined) {
          if (typeof accepted !== "object") throw new Error("case-carriage's accepted-work read gave no answer");
          why.push("accepted_work_lapsed");
        }
        const marks = C.marksLapsedSince(fm, since);
        if (!Array.isArray(marks)) throw new Error("case-carriage's marks read gave no list");
        if (marks.length) why.push("marks_lapsed");
      }
      return why.length ? { state: "void", why, ...extra } : { state: "held" };
    } catch (e) {
      return { state: "undetermined", detail: String(e && e.message || e).slice(0, 200) };
    }
  }

  /* R2's fence (publication R1's `hasCaseStanding`), over the stored document of the case edition, else over a
     stand-in naming the project a check recorded, else nothing: no standing is the absent case's answer. */
  #stands(caseId, edition, row, viewer) {
    const doc = edition != null
      ? this.#one(`SELECT case_id, edition, text FROM case_documents WHERE case_id=? AND edition=?`, caseId, edition)
      : null;
    const project = row ? row.project_id : null;
    const known = doc || row || this.#one(`SELECT 1 AS x FROM cases WHERE case_id=?`, caseId);
    if (!known) return false;
    const subject = doc || { case_id: caseId, edition, text: project ? `---\ncase_project: ${project}\n---\n` : "" };
    return this.publication.hasCaseStanding(subject, viewer) === true;
  }

  /** R2: one check's state, computed at the read. Writes nothing; never throws. */
  caseCheckOf({ case: caseIn = null, edition = null, check = null, viewer = undefined } = {}) {
    const fenced = viewer !== undefined && viewer !== null;
    try {
      const caseId = str(caseIn);
      const named = str(check);
      let row = null, ed = null;
      if (named) {
        row = this.#one(`SELECT * FROM case_checks WHERE check_id=?`, named);
        if (row && caseId && row.case_id !== caseId) row = null;
        ed = row ? Number(row.edition) : edition != null && edition !== "" ? Number(edition) : null;
      } else if (edition !== null && edition !== undefined && edition !== "") {
        ed = Number(edition);
        row = Number.isInteger(ed) ? this.#latest(caseId, ed) : null;
      } else {
        const latest = this.#one(`SELECT MAX(edition) AS m FROM case_documents WHERE case_id=?`, caseId);
        ed = latest && latest.m != null ? Number(latest.m) : null;
        row = ed != null ? this.#latest(caseId, ed) : null;
      }
      const theCase = row ? row.case_id : caseId;
      if (fenced) {
        if (!theCase || !this.#stands(theCase, ed, row, viewer)) return noSuchCase();
      }
      if (!row) return { ok: true, state: "none", case: theCase || null, edition: ed, check: null, key: null };
      const st = this.#state(row);
      const base = { ok: true, check: row.check_id, case: row.case_id, edition: Number(row.edition),
                     checked_at: row.checked_at, by: row.by };
      if (st.state === "void")
        return { ...base, state: "void", why: st.why, ...(st.moved ? { moved: st.moved } : {}),
                 key: stateKey("void", st.why[0]), keys: st.why.map((w) => stateKey("void", w)) };
      if (st.state === "published") return { ...base, state: "published", published_edition: st.published_edition, key: null };
      if (st.state === "undetermined") return { ...base, state: "undetermined", detail: st.detail, key: stateKey("undetermined") };
      return { ...base, state: "held", key: stateKey("held") };
    } catch (e) {
      /* A read that fails before a check is found: undetermined, behind the fence like every answer. */
      if (fenced) return noSuchCase();
      return { ok: true, state: "undetermined", case: str(caseIn) || null, check: null,
               detail: String(e && e.message || e).slice(0, 200), key: stateKey("undetermined") };
    }
  }

  /** R3: every check reading `held` whose members include `finding`, in publication R37's shape with `check` and
   *  `checked_at` in place of the frozen pair. Viewer-free; writes nothing. */
  heldFindingVersions({ finding = null, version = null, project = null } = {}) {
    const id = str(finding);
    if (!id) {
      /* DEC-49 REGION is-case-check-finding */
      return refusal("NO_ID", "a finding's id is required; nothing was read.");
      /* END DEC-49 REGION is-case-check-finding */
    }
    const v = str(version), p = str(project);
    const items = [];
    /* A narrowing by the id as the stored JSON spells it, LIKE's own characters escaped; the exact match follows. */
    for (const row of this.#rows(`SELECT * FROM case_checks WHERE members LIKE ? ESCAPE '!' ORDER BY seq`,
                                 `%${JSON.stringify(id).slice(1, -1).replace(/[!%_]/g, "!$&")}%`)) {
      if (p && row.project_id !== p) continue;
      const member = JSON.parse(row.members).find((m) => m.bundle_id === id);
      if (!member || (v && member.version_sha !== v)) continue;
      const latest = this.#latest(row.case_id, Number(row.edition));
      if (!latest || latest.check_id !== row.check_id) continue;
      if (this.#state(row).state !== "held") continue;
      items.push({ case: row.case_id, edition: Number(row.edition), project: row.project_id ?? null,
                   version_sha: member.version_sha, role: member.role, check: row.check_id, checked_at: row.checked_at });
    }
    return { ok: true, items };
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its table and declares it (R4). */
export function caseCheckOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    c = new CaseCheck({ ...d, host, storage, record });
    c.migrate();
    const declared = record.declarePurge("case-check", CASE_CHECK_TABLES);
    if (declared && declared.ok === false)
      throw new Error(`case-check: record-core refused its table declaration: ${declared.reason} (${declared.table})`);
    instances.set(host, c);
  }
  return c;
}

/** Which purge declaration names this module's table (record-core R21: each owner declares its own). */
export function caseCheckOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CASE_CHECK_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the plane's op map. `viewer` and `author` are the control plane's stamps, read
 *  from the query and spread after the body, so a caller's own copy is overwritten, never honoured. */
export function caseCheckOps(c, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* R1: op=publish's arguments and stamps, as case-authoring's `publishpreflight` arm reads them; the calculations a
       member's chain reaches gathered first (case-authoring R56). */
    publishcheck: async () => {
      const args = { ...b,
        target: q("target") || b.target,
        targets: b.targets || q("targets") || null,
        caseId: q("caseId") || b.caseId || null,
        newCase: (() => {
          const v = q("newCase") != null ? q("newCase") : b.newCase;
          return v === true || v === "true" || v === "1" || v === "yes";
        })(),
        project: q("project") || b.project || null,
        draft: q("draft") || b.draft || null,
        viewer: q("aiCred") ? { stamp: q("viewer"), aiCred: (() => {
          try { const v = JSON.parse(q("aiCred")); return v && typeof v === "object" ? v : {}; } catch { return {}; }
        })() } : q("viewer"),
        author: q("author") };
      return c.checkAndHold(args, await c.caseAuthoring.calculationsAtPublication(args));
    },
    /* R2: a read, fenced by the viewer stamp; a call with no stamp is fenced as no one (fail closed), never read as
       the plane. */
    casecheck: () => c.caseCheckOf({ case: q("case") || b.case || null, edition: q("edition") ?? b.edition ?? null,
                                     check: q("check") || b.check || null, viewer: q("viewer") ?? "" }),
  };
}
