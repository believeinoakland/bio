/* basis-versions — the grammar (R1–R5): the version block's findings, the machine, and the ONE assembler of a
 * version's composition that the freeze (R6) and the projection (R7) both read.
 *
 * The findings and the machine stay in the catalogue, whose own `checkInquiryBasis` calls `basisVersionFindings` and
 * whose C-25, C-27.15, C-33, C-32.2 and C-50 rows `affordances`, `agent-worker`, `newgroup`, the UI and the refusal-code
 * guard read (the catalogue is first in the order and cannot import this module; content's Q7, K138). This file is
 * their one public face here, and it holds what moved from `store.mjs`: `#canon`, `basisVersionsOf` (now `versionsIn`,
 * distinct from the module's factory) and `#compositionDiff`. Pure; nothing here throws. */

import { normalizeType, OBJECT_TYPES, legExtent, canonicalExtent, isMachineIdentity, SUFFICIENCY_UNCLAIMED }
  from "../../checks/bio-checks.mjs";
import { fmSafe } from "./text.mjs";
import { legContentId } from "../content/index.mjs";

export { basisVersionFindings, VERSION_MACHINE, versionNeedsReason, VERSION_NAME_RE, VERSION_STATES,
         VERSION_RELATIONSHIPS, VERSION_REASON_REQUIRED, BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS,
         SUGGEST_KINDS } from "../../checks/bio-checks.mjs";

/* THE CANONICAL FORM is line-oriented with a fixed field order and a fixed separator, and every value is escaped so
   the encoding is INJECTIVE: two different compositions cannot canonicalise to one string, which is the whole property
   a freeze rests on. Backslash first, then tab and newline, in that order. */
function canon(v) {
  return String(v ?? "").replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
}

/** R5: the document's version block, normalised into the rows the two tables take, each with its legs, grounds and
 *  composition. THE GROUND ROWS ARE SORTED and the legs are NOT: a ground is a set member, while a leg carries an
 *  ordinal that makes it addressable, so reordering legs IS a change to the composition. What happened TO a version
 *  (state, hidden, who moved it, its affirmation and regroup, author, at, run) is outside the composition, so the
 *  freeze does not shut the state machine. `kind` and a leg's referent are emitted only when present, so every
 *  composition frozen before they existed stays byte-identical. */
export function versionsIn(fm) {
  const rows = Array.isArray(fm?.basis_versions) ? fm.basis_versions : [];
  const legRows = Array.isArray(fm?.basis_version_legs) ? fm.basis_version_legs : [];
  const groundRows = Array.isArray(fm?.basis_version_grounds) ? fm.basis_version_grounds : [];
  const str = (x) => (typeof x === "string" && x.trim() !== "" ? x.trim() : null);
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i];
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const name = str(v.name);
    if (name === null) continue;
    const legs = [];
    for (let li = 0; li < legRows.length; li++) {
      const l = legRows[li];
      if (!l || typeof l !== "object" || str(l.version) !== name) continue;
      legs.push({
        /* The row's index in `basis_version_legs[]`, so the projection finds this leg in the content plan resolved
           over the raw array. Not a column and not part of the composition. */
        src_ord: li,
        /* What this leg rests on, inside the composition, only when it is not the whole document (an absent extent
           and `extent_kind: document` are one value, Bob's 5.3). */
        referent: (() => {
          const cid = legContentId(l);
          if (cid) return `id:${cid}`;
          const ce = canonicalExtent(legExtent(l));
          return ce === canonicalExtent({ kind: "document" }) ? null : ce;
        })(),
        target_id: typeof l.target === "string" ? l.target : "",
        target_type: normalizeType(OBJECT_TYPES[String(l.target || "").split("-")[0]]) ?? "",
        role: typeof l.role === "string" ? l.role : "",
        grade: l.grade ?? null, grade_axis: l.grade_axis ?? null, grade_source: l.grade_source ?? null,
        note: typeof l.note === "string" ? l.note : null,
        /* the document's own authored date, never the server's clock */
        at: l.date != null ? String(l.date) : null,
        ground: str(l.ground) ?? "",
        /* D-595 (BOB #34, K182): the capture a leg is pinned to, inside the composition so the freeze sees the pin */
        capture: str(l.extent_capture),
      });
    }
    const grounds = groundRows
      .filter((g) => g && typeof g === "object" && str(g.version) === name && str(g.ground) !== null)
      .map((g) => ({ ground: str(g.ground), asserted_by: str(g.asserted_by),
                     at: str(g.at), statement: typeof g.statement === "string" ? g.statement : null }))
      .sort((a, b) => (a.ground < b.ground ? -1 : a.ground > b.ground ? 1 : 0));
    const c = canon;
    const kind = str(v.kind);
    const composition = [
      `name\t${c(name)}`,
      ...(kind === null ? [] : [`kind\t${c(kind)}`]),
      `description\t${c(v.description)}`,
      `claim\t${c(v.claim)}`,
      `relationship\t${c(typeof v.relationship === "string" ? v.relationship.trim().toLowerCase() : "")}`,
      `derived_from\t${c(str(v.derived_from) === "null" ? null : str(v.derived_from))}`,
      ...grounds.map((g) => `ground\t${c(g.ground)}\t${c(g.asserted_by)}\t${c(g.at)}\t${c(g.statement)}`),
      ...legs.map((l, k) => `leg\t${k}\t${c(l.target_id)}\t${c(l.target_type)}\t${c(l.role)}\t${c(l.grade)}\t`
                          + `${c(l.grade_axis)}\t${c(l.grade_source)}\t${c(l.note)}\t${c(l.at)}\t${c(l.ground)}`),
      /* after the leg lines, so a composition with no referent is byte-identical to one frozen before referents */
      ...legs.flatMap((l, k) => (l.referent === null ? [] : [`leg_referent\t${k}\t${c(l.referent)}`])),
      /* and the pin, after the referents and only when a leg carries one, for the same byte-identity reason */
      ...legs.flatMap((l, k) => (l.capture === null ? [] : [`leg_capture\t${k}\t${c(l.capture)}`])),
    ].join("\n");
    out.push({
      name, ord: i,
      description: typeof v.description === "string" ? v.description : "",
      relationship: typeof v.relationship === "string" ? v.relationship.trim().toLowerCase() : "",
      state: typeof v.state === "string" ? v.state : "",
      derived_from: str(v.derived_from) === "null" ? null : str(v.derived_from),
      hidden: v.hidden === true ? 1 : 0,
      kind,
      claim: typeof v.claim === "string" ? v.claim : null,
      /* §14b.7: named, never resolved; a version outlives the run that proposed it */
      run: str(v.run),
      author: str(v.author), at: str(v.at),
      state_by: str(v.state_by), state_at: str(v.state_at),
      state_reason: typeof v.state_reason === "string" ? v.state_reason : null,
      /* DEC-32 clause 4: kept as the record's own text; the read that publishes it splits it */
      affirmed_parts: typeof v.affirmed_parts === "string" && v.affirmed_parts.trim() ? v.affirmed_parts : null,
      regroup_by: str(v.regroup_by), regroup_at: str(v.regroup_at),
      regroup_note: typeof v.regroup_note === "string" ? v.regroup_note : null,
      composition, legs, grounds,
    });
  }
  return out;
}

/** R6: whether a held composition and an offered one are the same version. A composition stored before the
 *  `leg_capture` line existed (K182) is compared with the offered one's `leg_capture` lines left out: that stored form
 *  never froze the pin, so its first re-projection adds the line instead of freezing the version shut. */
export function sameComposition(held, offered) {
  if (held === offered) return true;
  const h = String(held ?? "");
  if (/(^|\n)leg_capture\t/.test(h)) return false;
  return String(offered ?? "").split("\n").filter((x) => !x.startsWith("leg_capture\t")).join("\n") === h;
}

/** R5 (K182): what a submitted version becomes in the document, the one normaliser a writer and a comparison both read
 *  (moved from `#suggestionPersisted`, so `run-productions` compares C-27.5 and C-27.10 against the written form without
 *  a copy). Every value is frontmatter-safe (`fmSafe`, idempotent); a field the write would omit is null (an omitted line
 *  and a blank one are different documents); a ground with no label is dropped; a ground is asserted by the author, or
 *  by the explicit no-claim value when the author is a machine (PL-19 / DEC-65: a machine's stamp never stands where a
 *  member's has to); a leg cites the whole document (`extent_kind: document`) and carries its pinned capture when it
 *  names one (D-595). It normalises no further than the document does. */
export function versionAsWritten({ kind, name, description, claim, relationship, derived_from, run, author, at, level,
                                   observed_at, grounds, legs } = {}) {
  const fs = (x) => fmSafe(x);
  const blank = (x) => !(typeof x === "string" && x.trim() !== "");
  const opt = (x) => (blank(x) ? null : fs(x));
  return {
    version: {
      name: fs(name), kind: fs(kind), description: fs(description), claim: opt(claim),
      relationship: fs(String(relationship ?? "and").trim().toLowerCase()),
      derived_from: opt(derived_from), run: fs(run), author: blank(author) ? null : fs(author), at: fs(at),
      level: opt(level), observed_at: opt(observed_at),
    },
    grounds: (grounds || []).filter((g) => g && !blank(g.ground)).map((g) => ({
      ground: fs(g.ground), asserted_by: isMachineIdentity(author) ? SUFFICIENCY_UNCLAIMED : fs(author ?? ""),
      at: fs(at), statement: opt(g?.statement) })),
    legs: (legs || []).map((l) => ({
      target: fs(l?.target), role: fs(String(l?.role ?? "supports")),
      ground: opt(l?.ground), grade: opt(l?.grade), grade_axis: opt(l?.grade_axis),
      grade_source: opt(l?.grade_source), note: opt(l?.note), date: opt(l?.date),
      extent_kind: "document", ...(blank(l?.extent_capture) ? {} : { extent_capture: fs(l.extent_capture) }) })),
  };
}

/** R6: which FIELD moved, for the freeze's refusal — a member told "this changed" without being told what is left to
 *  re-derive the diff the module has already computed. */
export function compositionDiff(before, after) {
  const a = String(before).split("\n"), b = String(after).split("\n");
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] === b[i]) continue;
    const field = String(a[i] ?? b[i]).split("\t")[0];
    if (a[i] === undefined) return `a ${field} was added`;
    if (b[i] === undefined) return `a ${field} was removed`;
    return `${field} changed`;
  }
  return "nothing changed";
}
