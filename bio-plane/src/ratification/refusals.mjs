/* ratification — the case ceremony's refusals that hold before a signature exists, one builder each (R2, R3, R18).
 * `op=caseratify` (`./ops.mjs`, R2), the case commit (`./index.mjs` `ratifyCaseDocument`, R3) and the ceremony's
 * pre-flight (`./index.mjs` `caseRatifyPreflight`, R18) all answer through these, so each code is minted at one site
 * and the pre-flight's refusal is the act's own, byte for byte (DEC-49; the guard's one-site rule). A row's `where`
 * names the builder and the region in it. The act adds only its own envelope (`store`, `tokenClass`, the HTTP status)
 * where it always has. Pure; none throws. */

import { rowOf } from "./checks.mjs";

/* REC-123 / C-32.13. The fence alone, FIRST and before the payload is read, so
   it is the FENCE that answers a machine and never a payload complaint behind it (REC-73's lesson). Driven: before
   this, an `ai` credential whose scope named this op, carrying a registered member's valid signature, COMMITTED THE
   CASE and the record named the member. */
export function machineCaseRefusal(cls) {
  /* DEC-49 REGION is-machine-ratify-case */
  return { ok: false, reason: "MACHINE_CANNOT_RATIFY_CASE", ...rowOf("MACHINE_CANNOT_RATIFY_CASE"),
    op: "caseratify", tokenClass: cls,
    detail: "committing a case is a member's signed act. An assistant's credential may assemble the "
          + "case document and may never commit it, whoever's signature it carries (DEC-24 rule 4)." };
  /* END DEC-49 REGION is-machine-ratify-case */
}

/* REC-125 / C-32.15, D-421 DECIDED by BOB #14. An attested act is delivered
   ONLY by a signed-in member's own session, so every caller that did not arrive through one is refused, NAMING its
   class, whoever's valid signature it carries. */
export function operatorCaseRefusal(cls) {
  /* DEC-49 REGION is-operator-ratify-case */
  return { ok: false, reason: "OPERATOR_TOKEN_CANNOT_RATIFY_CASE",
    ...rowOf("OPERATOR_TOKEN_CANNOT_RATIFY_CASE"), op: "caseratify", tokenClass: cls,
    detail: `committing a case is a member's own signed act, delivered through that member's own `
          + `signed-in session. The credential that asked is the operator's \`${cls}\`-class bearer `
          + `token: the signature says who authorised the case, and the credential that delivers it `
          + `decides when the record changes, so a bearer token may not carry it in (D-421).` };
  /* END DEC-49 REGION is-operator-ratify-case */
}

/* MK-1 (A) / C-53.12, NARROWED BY MK-7. A case whose findings rest, at any
   depth, on an observation that still NAMES ITS AUTHOR in its own files (written before MK-6) does not cross:
   MEMBER-KNOWLEDGE-DESIGN.md §4.1 keeps those fenced, because the level lives outside the bundle and cannot hide a
   name the bundle itself prints. `legacy` is publication's `attributionFacts(doc).legacy`; none answers null. */
export function testimonyCaseRefusal(caseId, edition, legacy) {
  if (!Array.isArray(legacy) || !legacy.length) return null;
  /* DEC-49 REGION is-testimony-publish-case */
  return { ok: false, reason: "TESTIMONY_CASE_UNPUBLISHABLE", ...rowOf("TESTIMONY_CASE_UNPUBLISHABLE"),
    caseId, edition, observations: legacy.slice(0, 50),
    detail: `a finding in ${caseId} rests on an observation whose own files name its author (written `
          + `before §4.1) or cannot be read to show they do not (${legacy.slice(0, 5).join(", ")}); `
          + `publishing it could publish that name at any level (MEMBER-KNOWLEDGE-DESIGN.md §4.1)` };
  /* END DEC-49 REGION is-testimony-publish-case */
}

/* MK-7 / C-92.10, C-92.11 (MEMBER-KNOWLEDGE-DESIGN.md §4.4). A case reaching a
   member's observation crosses once, and only once, every observation it reaches carries its author's chosen level
   in the bytes being signed. `attr` is publication's `attributionFacts(doc)`; each builder answers null when its
   condition does not hold.
   (1) UNCHOSEN, named per observation: publishing one at ANY level would be the default §4 forbids. PROVISIONAL
       (§4.4's narrow veto, carried to Bob): a member stops the use of their own words and nothing else; the owner's
       recourse is an edition without the finding resting on it.
   (2) STALE: the document's statements are compared with what the authors' acts give NOW. The act re-authors the
       unsigned document when it lands, so this refuses only bytes that drifted from the acts by another route —
       never a level the author did not choose.
   A row keyed `capture` (its SHA-256) in place of `observation` is an off-the-record capture's attesting member's
   level (publication R60; DEC-119 (3)), asked as an observation's is. */
const keyOf = (r) => (r.observation || !r.capture ? { observation: r.observation } : { capture: r.capture });
const idOf = (r) => Object.values(keyOf(r))[0];
export function attributionUnchosenRefusal(caseId, edition, attr) {
  const unchosen = (attr && Array.isArray(attr.current) ? attr.current : []).filter((r) => !r.level);
  if (!unchosen.length) return null;
  /* DEC-49 REGION is-attribution-unchosen */
  return { ok: false, reason: "ATTRIBUTION_UNCHOSEN", ...rowOf("ATTRIBUTION_UNCHOSEN"),
    caseId, edition,
    unchosen: unchosen.slice(0, 50).map((r) => ({ ...keyOf(r), why: r.why })),
    detail: `${unchosen.length} observation${unchosen.length === 1 ? "" : "s"} or attested capture`
          + `${unchosen.length === 1 ? "" : "s"} this edition reaches ${unchosen.length === 1 ? "has" : "have"} no level `
          + `chosen by its author or attesting member: ${unchosen.slice(0, 5).map(idOf).join(", ")} `
          + `(MEMBER-KNOWLEDGE-DESIGN.md §4.4). Each chooses with op=attribute; nothing is filled in for them` };
  /* END DEC-49 REGION is-attribution-unchosen */
}

export function attributionStaleRefusal(caseId, edition, attr) {
  const current = attr && Array.isArray(attr.current) ? attr.current : [];
  const stated = attr && Array.isArray(attr.stated) ? attr.stated : [];
  const statedOf = new Map(stated.map((r) => [JSON.stringify(keyOf(r)), r]));
  const drift = current.filter((r) => {
    const st = statedOf.get(JSON.stringify(keyOf(r)));
    return !st || st.level !== r.level || (st.shown ?? null) !== (r.shown ?? null);
  });
  if (!drift.length && stated.length === current.length) return null;
  /* DEC-49 REGION is-attribution-stale */
  return { ok: false, reason: "ATTRIBUTION_STATEMENT_STALE", ...rowOf("ATTRIBUTION_STATEMENT_STALE"),
    caseId, edition,
    observations: (drift.length ? drift : current).slice(0, 50).map(idOf),
    detail: `the case document's attribution statements do not match what the authors and attesting members chose `
          + `for this edition; re-prepare it (op=publish) and sign the new bytes` };
  /* END DEC-49 REGION is-attribution-stale */
}

/* DEC-102 items 1 and 2 / C-58.5 (R35). Testimony credited only to the group or the project is an anonymous tip, and
   supports a finding only beside an independent corroborating leg (strength R29, R30), and so does material from an
   off-the-record source a member attests at those levels (strength R34; DEC-119 (3)). `offenders` is each `{member,
   observation}` or `{member, document}` strength answers uncorroborated, as the act's store half and the pre-flight
   both compute it (`./index.mjs`); it names no author, attesting member or source. None answers null. */
export function anonymousTestimonyRefusal(caseId, edition, offenders) {
  if (!Array.isArray(offenders) || !offenders.length) return null;
  /* DEC-49 REGION is-anonymous-testimony */
  return { ok: false, reason: "ANONYMOUS_TESTIMONY_UNCORROBORATED", ...rowOf("ANONYMOUS_TESTIMONY_UNCORROBORATED"),
    caseId, edition, uncorroborated: offenders.slice(0, 50),
    detail: `case ${caseId} edition ${edition} rests on testimony, or on material from an unnamed source a member `
          + `attests, credited only to the group or the project with no independent leg corroborating it: `
          + `${offenders.slice(0, 5).map((x) => `${x.member} on ${x.observation ?? x.document}`).join(", ")}. It counts `
          + `as an anonymous tip (DEC-102, DEC-119). Corroborate the claim with an independent leg, ask the author or `
          + `attesting member to choose cover or name (op=attribute), or drop the finding resting on it from the edition `
          + `(op=publish). Nothing was signed.` };
  /* END DEC-49 REGION is-anonymous-testimony */
}

/* REC-167 / C-65.1. A case document is signed only while its project
   still stands on the conclusion it records (INVESTIGATIVE-SESSION.md §7.1 items 4 and 9). `moved` is each roster
   member whose project conclusion is not the one the document records, as `ratifyCaseDocument` and the pre-flight
   both compute it; none answers null. */
export function conclusionMovedRefusal(caseId, edition, project, moved) {
  if (!Array.isArray(moved) || !moved.length) return null;
  /* DEC-49 REGION is-caseratify-conclusion-moved */
  return { ok: false, reason: "CASE_CONCLUSION_MOVED", ...rowOf("CASE_CONCLUSION_MOVED"),
    detail: `case ${caseId} edition ${edition}'s document records, for ${moved.map((x) => x.target).join(", ")}, a `
          + `conclusion ${project} no longer stands on: `
          + moved.map((x) => `${x.target} — ${x.now.state === "concluded"
              ? `${project} now stands on a DIFFERENT conclusion (reading '${x.now.version ?? "(unnamed)"}', `
                + `the ${x.now.relationship === "no_project" ? "no-project" : "project's own"} relationship)`
              : `${project} stands on no conclusion (${x.now.why})`}`).join("; ")
          + `. A signed edition records the conclusion it rests on (INVESTIGATIVE-SESSION.md §7.1 item 4), so `
          + `signing this one would publish a conclusion nobody holds. Publish the case again from the project `
          + `(op=publish) — the new document records what the project stands on now (§7.1 item 9) — and sign `
          + `that. Nothing was committed.`,
    caseId, edition, project, moved };
  /* END DEC-49 REGION is-caseratify-conclusion-moved */
}

/* R18 (N364; DEC-80 items 3 and 4): the pre-flight's one refusal of its own. The act has no such answer, because a
   signature from a key nobody registered fails as `SIG_UNKNOWN_KEY` only once it is made; before it is made, the
   member is told they hold no key the ceremony will accept, and how to get one (credentials R9, was membership R89). Like `NO_SIGNERS`, it
   has no catalogue row. */
export function noAttestingKeyRefusal(signer) {
  return { ok: false, reason: "NO_ATTESTING_KEY", code: "NO_ATTESTING_KEY", signer: signer ?? null,
    detail: "you hold no registered, active signing key, so a signature you make now would not be accepted "
          + "by the ceremony. Nothing was written.",
    remedy: "Register a key of your own from your signed-in session (op=signerregister, credentials R9), or ask "
          + "an administrator to register one for you; then sign." };
}

/* R49 (T41; D60, N820) / C-58.11: the group's approval rule in force (R50's reader) names approvers who have not
   approved this case edition's document at its `doc_sha`. `read` is `approvalsRead`'s answer: null (no rule, nothing
   asked) answers null; `{unreadable}` refuses too, since an edition is never signed with its approvals unchecked. */
export function approvalMissingRefusal(caseId, edition, docSha, read) {
  if (!read || (!read.unreadable && !(Array.isArray(read.missing) && read.missing.length))) return null;
  /* DEC-49 REGION is-approval-missing */
  return { ok: false, reason: "APPROVAL_MISSING", ...rowOf("APPROVAL_MISSING"), caseId, edition, docSha: docSha ?? null,
    approvers: read.approvers ?? null, missing: read.unreadable ? null : read.missing,
    detail: read.unreadable
      ? `the group's approval rule, or the approvals given for case ${caseId} edition ${edition}, could not be read `
        + `(${read.unreadable}), so whether every required approver has approved this document is undetermined and it `
        + `is not signed unchecked. Ask again. Nothing was signed.`
      : `the group requires ${read.approvers.join(", ")} to approve a case before it is signed, and `
        + `${read.missing.join(", ")} ${read.missing.length === 1 ? "has" : "have"} not approved case ${caseId} edition `
        + `${edition} at this document (${String(docSha ?? "").slice(0, 12)}); an approval of an earlier version does `
        + `not carry over. Nothing was signed.` };
  /* END DEC-49 REGION is-approval-missing */
}

/* R50 (T41; D60): what the registered approval reader (`review`, its R32) answers for one case edition's document:
   null when none is registered or its `rule()` names no approver (no rule in force, the default: nothing asked); else
   `{approvers, approvals, missing}`, the approvers sorted, each approval `{by, at}` given at `docSha` sorted by `by`, and
   the approvers with none (a `member:` prefix read as the member); `{unreadable}` when a door throws or answers neither
   shape. `rule()` answers null, `{approvers: [ids]}` or the bare list; `approvals(...)` the list or `{approvals}`. */
const memberOf = (v) => (typeof v === "string" && v.trim() ? v.trim().replace(/^member:/, "") : null);
export function approvalsRead(reader, { caseId, edition, docSha }) {
  if (!reader) return null;
  let rule, given;
  try { rule = reader.rule(); } catch (e) { return { unreadable: `the approval rule: ${String((e && e.message) || e).slice(0, 120)}` }; }
  if (rule === null || rule === undefined) return null;
  const named = Array.isArray(rule) ? rule : rule && typeof rule === "object" && Array.isArray(rule.approvers) ? rule.approvers : null;
  if (!named || named.some((m) => !memberOf(m))) return { unreadable: "the approval rule" };
  const approvers = [...new Set(named.map(memberOf))].sort();
  if (!approvers.length) return null;
  try { given = reader.approvals({ case: caseId, edition, docSha }); }
  catch (e) { return { unreadable: `the approvals given: ${String((e && e.message) || e).slice(0, 120)}` }; }
  const list = Array.isArray(given) ? given : given && typeof given === "object" && Array.isArray(given.approvals) ? given.approvals : null;
  if (!list || list.some((a) => !a || typeof a !== "object" || !memberOf(a.by))) return { unreadable: "the approvals given" };
  const approvals = list.map((a) => ({ by: memberOf(a.by), at: typeof a.at === "string" ? a.at : null }))
    .sort((a, b) => (a.by < b.by ? -1 : a.by > b.by ? 1 : String(a.at) < String(b.at) ? -1 : 1));
  const by = new Set(approvals.map((a) => a.by));
  return { approvers, approvals, missing: approvers.filter((m) => !by.has(m)) };
}
