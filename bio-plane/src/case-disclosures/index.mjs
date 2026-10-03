/* case-disclosures — what a case discloses about what it rests on, judged and written before anything is signed
 * (requirements: `build/requirements/case-disclosures.md`; BIO_Publication_v0_1.md §3 rules 4 and 16, §5C; DEC-76 item 4,
 * DEC-81, DEC-96 item 4, DEC-112, DEC-119). The unresolved conflicts on a case's findings (R1); each document's grade and
 * co-attestation, and the owner's acknowledgement of a self-attested one (R2, R3); what may be said of a source (R4); the
 * method the case is signed under (R5); every document and observation a finding's chain reaches, with what this copy
 * holds whole and who attests it (R6–R12); another group's work it rests on, with its acceptance and open flags (R13,
 * R14); each reached finding's grading facts and passages (R15); and hunch debt (R16). Each judgment answers its
 * refusals in order and the rows the case document writes; `case-authoring`'s `publishCase` asks them in its order (its
 * R55), answers the first refusal, and writes the rows through this module's renderers (`./document.mjs`).
 *
 * Split from `case-authoring` for size (K617, N529, K1333): its private methods moved here with their bodies unchanged
 * (`#x` → `x`), `materials.mjs` and `accepted.mjs` whole, the C-120 family (`./checks.mjs`) with its ids, codes and
 * translations, and the disclosure renderers, moved and not copied, so the signed document is byte-identical. Each
 * comment's requirement id is this module's; an id of `case-authoring`'s is named as its.
 *
 * THE SEAM (R23). Every service is synchronous and never throws on a failed read of another module: that read states
 * less, never more. It writes nothing of its own; the one write it reaches is `sources.sourceOf`'s minting of a source
 * id (R4), inside the caller's transaction, so the caller can roll it back. It holds no table and no op, so it declares
 * nothing to purge and registers nothing.
 *
 * REACHED as `caseDisclosuresOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the
 * first call with `deps`, returned to every later caller. `deps` (each reached through its factory on the same host
 * unless given; a test passes its own):
 *   record               layer 2: `readFile` (R6, R13).
 *   inquiry              `basisFor` (R16).
 *   strength             `gradingFacts` (its R35; R15).
 *   contradiction        `unresolvedRecordOn` (its R29; R1).
 *   provenance           `captureGrade` (its R24–R27, R51; R2).
 *   attestation          `attestationsOf` (its R7; R2).
 *   capture              `lateAttestationsOf`, `captureAccountsOf` (its R68, R69; R2, R3, R10).
 *   sources              `sourceOf`, then `publishableAt` (its R1, R8; R4).
 *   extraction           `unitsOf` (its R36; R6, R15).
 *   promotion            the fact `producingGroup` (R7's group row); `CATALOG_VERSION` is imported (R5).
 *   caseImport           `acceptanceOf`, `openFlagsOn`, `importedCase` (its R4, R9; R13, R14).
 *
 * READ CONTRACTS it joins in its own SQL, each named at its statement: record-core's `bundles` (R37); inquiry's
 * `inquiry_basis` (R40); content's `content` (R45); provenance's `register` and `captured_locators` (R48). Sight is
 * membership's one rule (`viewerPredicate`, its R43). */

import { recordOf } from "../record-core/index.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { strengthOf, DEPTH_BOUND, GRADING_METHOD_VERSION } from "../strength/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { promotionOf, CATALOG_VERSION } from "../promotion/index.mjs";
import { parseImportedFindingRef } from "../inquiry-grammar/index.mjs";
import { caseImportOf } from "../case-import/index.mjs";
import { sourceStatement, unnamedSourceStatement } from "../publication/index.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { attestationOf } from "../attestation/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { parseFrontmatter, normalizeType, EARNED_CAPTURE_CEILING, canonicalJson,
         createSha256 } from "../record-grammar/index.mjs";
import { extractedTextOf, sourceRowWithheld } from "../case-grammar/index.mjs";
import { CASE_DISCLOSURE_CHECKS } from "./checks.mjs";
import { chainsOf, materialHeld, materialRows } from "./materials.mjs";
import { flagsListed, flagsJudged, acceptedWorkRow } from "./accepted.mjs";
import { NOT_SHOWN_WORDS, tensionSide, SELF_ATTESTED_SENTENCE } from "./document.mjs";

export { CASE_DISCLOSURE_CHECKS } from "./checks.mjs";
export { chainsOf, materialHeld, materialRows } from "./materials.mjs";
export { flagsListed, acceptedWorkRow, FLAG_SENTENCE, FLAGS_SAY } from "./accepted.mjs";
export { SELF_ATTESTED_SENTENCE, TENSION_TEMPLATES, HIGHLIGHT_SENTENCE, NOT_SHOWN_WORDS, TENSIONS_DEPTH_STATED,
         tensionSide, tensionTemplate, tensionSentence, tensionsUnreadStated, tensionFrontmatterLines,
         tensionBodyLines, captureBodyLines, carriesBodyLines, acceptedBodyLines } from "./document.mjs";

/** The longest owner's words in a list (`tensionsDisclosed`, `selfAttested`): this module's own copy of
 *  `case-authoring`'s `COMPLETENESS_MAX` (K57), the bound its R3 sets on every authored field. */
export const COMPLETENESS_MAX = 2000;
/** R2: the IN lists of the captures' reads are chunked at 50, under D-36's 100-bound-parameter ceiling; this module's
 *  own copy of `case-authoring`'s `SEARCHED_CHUNK` (K57). */
const SEARCHED_CHUNK = 50;

/* The one constructor of a refusal with a catalogue row (DEC-49): `reason` and `code` carry the same literal, and the
   row's `check` and `translation` join the site's own `detail` and keys. */
function refusal(family, key, extra = {}) {
  const row = family[key];
  return { ok: false, reason: key, code: key, check: row.check, translation: row.translation, ...extra };
}
/* The family's own helper, the code its literal first argument, so the DEC-49 guard judges the code at each site
   against the rows that govern it (N259, N275). */
const disclosureRefusal = (key, extra) => refusal(CASE_DISCLOSURE_CHECKS, key, extra);

export class CaseDisclosures {
  #deps;

  constructor({ storage, record, host = null, inquiry = null, strength = null, contradiction = null, provenance = null,
                attestation = null, capture = null, sources = null, extraction = null, caseImport = null,
                promotion = null } = {}) {
    this.sql = storage.sql;
    this.storage = storage;
    this.record = record;
    this.#deps = { host, inquiry, strength, contradiction, provenance, attestation, capture, sources, extraction,
                   caseImport, promotion };
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get contradiction() { return this.#deps.contradiction ||= contradictionOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get attestation() { return this.#deps.attestation ||= attestationOf(this.#deps.host); }
  get capture() { return this.#deps.capture ||= captureOf(this.#deps.host); }
  get sources() { return this.#deps.sources ||= sourcesOf(this.#deps.host); }
  get extraction() { return this.#deps.extraction ||= extractionOf(this.#deps.host); }
  get promotion() { return this.#deps.promotion ||= promotionOf(this.#deps.host); }
  /* R13, R14: `case-import`'s reads (its R4, R9). A read that throws fails closed here: a leg on another group's
     finding is not in force (C-120.10), its flags undetermined (C-120.12). */
  get caseImport() { return this.#deps.caseImport ||= caseImportOf(this.#deps.host); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* The live `bundle.md` text of a held bundle, or null (blob-backed, absent, or a read that failed): record-core R13. */
  #liveText(id) {
    let f = null;
    try { f = this.record.readFile(id, "bundle.md"); } catch { f = null; }
    return f && typeof f.text === "string" ? f.text : null;
  }

  /** R5 (DEC-112 (3)): the versions the owner signs under, read at the call: the grading method `strength` grades by
   *  and the catalogue version promotion stamps (rule 17). `case-grammar`'s `methodBlockLines` (its R11) writes them in
   *  the frontmatter, and `carriesBodyLines` in the body, so the version is inside what the owner signs. */
  methodOf() {
    return { grading: GRADING_METHOD_VERSION, checks: CATALOG_VERSION };
  }

  /** R16 — HUNCH DEBT REFUSES PUBLICATION (Publication §3 rule 4; DEC-20; Declared Bias, "HUNCH DEBT"): the one bias
   *  that must be cleared before a case publishes. Cleared means the case holds without the hunch, so a member whose
   *  live basis still carries a leg whose grade source is `hunch` carries the debt. Asked of EVERY member, load-bearing
   *  or supporting, before the case identity is derived, so a refusal draws no id and writes nothing (K240); `case-authoring`
   *  R34's pre-flight answers it before the first screen. Answers C-120.7 or null. */
  hunchDebt(prepared) {
    const hunches = [];
    const undetermined = [];
    for (const p of prepared) {
      /* R23, R18: a basis that cannot be read is not a basis without a hunch. It fails closed, stated beside the
         hunches as undetermined, and never throws (J1's reading). */
      let basis = null;
      try { basis = this.inquiry.basisFor(p.id); }
      catch (e) { undetermined.push({ target: p.id, why: String(e && e.message || e).slice(0, 160) }); continue; }
      if (!basis || basis.ok === false) {
        undetermined.push({ target: p.id, why: basis ? basis.reason ?? "the read failed" : "no answer" });
        continue;
      }
      for (const leg of (Array.isArray(basis.legs) ? basis.legs : []))
        if (leg && leg.grade_source === "hunch") hunches.push({ target: p.id, ord: leg.ord, leg_target: leg.target_id });
    }
    if (!hunches.length && !undetermined.length) return null;
    /* DEC-49 REGION is-hunch-cleared */
    return disclosureRefusal("UNCLEARED_HUNCH", { hunches, ...(undetermined.length ? { undetermined } : {}),
      detail: (hunches.length ? `${hunches.length} basis leg(s) of this case's findings rest on a HUNCH (`
            + hunches.map((h) => `${h.target} leg ${h.ord} on ${h.leg_target}`).join("; ") + `). ` : "")
            + (undetermined.length ? `The basis of ${undetermined.map((u) => `${u.target} (${u.why})`).join("; ")} `
              + `could not be read, so whether it rests on a hunch is not known. ` : "")
            + `A hunch is temporary declared bias, and it is the one bias that must be cleared before `
            + `publication (DEC-20): the case must still hold with the hunch removed. Give each leg a grade `
            + `the record earns, or take the hunch out of the basis, and publish again. Nothing was written.` });
    /* END DEC-49 REGION is-hunch-cleared */
  }

  /** R1 — N345 (DEC-76 item 4, DEC-84 items 11–13, DEC-85): A CASE DISCLOSES EVERY UNRESOLVED CONFLICT ON WHAT IT RESTS
   *  ON, ONE LEVEL DEEP, AND IS NEVER REFUSED BECAUSE ONE EXISTS. Each member is read at the bytes the act pins
   *  (`case-authoring` R13), as the viewer, so a side the publisher may not see comes back highlighted with nothing of
   *  it (R17). Answers
   *  `{refusals, entries, unread, byCandidate}`: the list's own malformation or C-120.3 alone, else C-120.1 and C-120.2
   *  in that order, each once; `op=publish` answers the first, `case-authoring` R34's pre-flight lists them all. */
  tensionsJudged(prepared, viewer, tensionsDisclosed) {
    const listed = this.#disclosuresListed(tensionsDisclosed);
    if (listed.ok === false) return { refusals: [listed], entries: [], unread: [], byCandidate: new Map() };
    const read = this.tensionsRead(prepared, viewer);
    if (read.ok === false) return { refusals: [read], entries: [], unread: [], byCandidate: listed.byCandidate };
    const refusals = [];
    const undisclosed = read.entries.filter((e) => !listed.byCandidate.has(e.candidate));
    /* DEC-49 REGION is-tension-disclosed */
    if (undisclosed.length)
      refusals.push(disclosureRefusal("TENSION_NOT_DISCLOSED", {
        undisclosed: undisclosed.map((e) => this.#namedInRefusal(e)),
        detail: `${undisclosed.length} unresolved conflict(s) on what this case rests on are not disclosed (`
              + undisclosed.map((e) => `${e.candidate} on ${e.finding}`
                + (e.unseen_other_side ? `, ${NOT_SHOWN_WORDS}` : "")).join("; ")
              + `). A case is published with its conflicts disclosed, never refused because one exists (DEC-76 `
              + `item 4): list each in tensionsDisclosed, or resolve it first. Nothing was published.` }));
    /* END DEC-49 REGION is-tension-disclosed */
    const standing = new Set(read.entries.map((e) => e.candidate));
    const notStanding = [...listed.byCandidate.values()].filter((d) => !standing.has(d.candidate));
    /* DEC-49 REGION is-disclosure-standing */
    if (notStanding.length)
      refusals.push(disclosureRefusal("DISCLOSURE_NOT_STANDING", {
        not_standing: notStanding.map((d) => ({ candidate: d.candidate, ord: d.ord })),
        detail: `${notStanding.map((d) => d.candidate).join(", ")} is not an unresolved conflict on this case's `
              + `findings at the bytes this act pins: it may have been resolved since, or it names nothing this `
              + `case rests on. Read the list again (op=publishtensions). Nothing was published.` }));
    /* END DEC-49 REGION is-disclosure-standing */
    return { refusals, entries: read.entries, unread: read.unread, byCandidate: listed.byCandidate };
  }

  /** R2 — WHAT EACH MEMBER RESTS ON, AS CAPTURES, ONE LEVEL DEEP (as `case-authoring` R29 and R1 read): each document leg of the
   *  member's basis at the bytes this act pins, either role, names its content row's capture, else every capture its
   *  target registers (provenance R48's `register`); an inquiry leg names none (that finding states its own when it is
   *  published). Answers `[{member, capture}]` in member order, then leg order, each pair once. Set-based: one read per
   *  chunk of ids over inquiry R40's `inquiry_basis`, content R45's `content`, record-core R37's `bundles` and provenance
   *  R48's `register`. */
  restingCaptures(prepared) {
    const chunked = (vals, fn) => { for (let i = 0; i < vals.length; i += SEARCHED_CHUNK) fn(vals.slice(i, i + SEARCHED_CHUNK)); };
    const marks = (part) => part.map(() => "?").join(",");
    const legsOf = new Map(prepared.map((p) => [p.id, []]));
    chunked(prepared.map((p) => p.id), (part) => {
      for (const r of this.#rows(`SELECT bundle_id, ord, target_id, content_id FROM inquiry_basis
                                   WHERE bundle_id IN (${marks(part)}) ORDER BY bundle_id, ord`, ...part))
        legsOf.get(r.bundle_id).push(r);
    });
    const legs = [...legsOf.values()].flat();
    const captureOfContent = new Map();
    chunked([...new Set(legs.map((l) => l.content_id).filter((c) => typeof c === "string" && c))], (part) => {
      for (const r of this.#rows(`SELECT content_id, capture_sha FROM content WHERE content_id IN (${marks(part)})`, ...part))
        if (typeof r.capture_sha === "string" && r.capture_sha) captureOfContent.set(r.content_id, r.capture_sha);
    });
    const whole = [...new Set(legs.filter((l) => !captureOfContent.has(l.content_id)).map((l) => l.target_id)
      .filter((t) => typeof t === "string" && t))];
    const documents = new Set();
    const registered = new Map();
    chunked(whole, (part) => {
      for (const r of this.#rows(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id IN (${marks(part)})`, ...part))
        if (normalizeType(r.object_type) === "information") documents.add(r.bundle_id);
    });
    chunked([...documents], (part) => {
      for (const r of this.#rows(`SELECT bundle_id, capture_sha FROM register WHERE bundle_id IN (${marks(part)})
                                   ORDER BY bundle_id, capture_sha`, ...part)) {
        if (!registered.has(r.bundle_id)) registered.set(r.bundle_id, []);
        registered.get(r.bundle_id).push(r.capture_sha);
      }
    });
    const out = [];
    for (const p of prepared) {
      const had = new Set();
      for (const l of legsOf.get(p.id)) {
        const caps = captureOfContent.has(l.content_id) ? [captureOfContent.get(l.content_id)]
                   : documents.has(l.target_id) ? (registered.get(l.target_id) || []) : [];
        for (const c of caps) if (!had.has(c)) { had.add(c); out.push({ member: p.id, capture: c }); }
      }
    }
    return out;
  }

  /** R2, R3: one capture's grade (`provenance.captureGrade`) and co-attestation, read at the act. It is co-attested
   *  only when it holds both a timestamp and a co-archive: first as recorded at capture (`attestation.attestationsOf`),
   *  else a late one that succeeded (`capture.lateAttestationsOf`; a late co-archive whose replay holds other bytes
   *  corroborates nothing and is not counted), a late one stated as late. The capturing member's signed accounts
   *  (`capture.captureAccountsOf`) travel with it, their exact text and signature (publication R20 writes them as
   *  base64 of the exact bytes, so each still verifies). Never throws: a read that fails states less, never more. */
  captureFacts(sha) {
    const safe = (fn) => { try { return fn(); } catch { return null; } };
    const g = safe(() => this.provenance.captureGrade(sha)) || {};
    const att = safe(() => this.attestation.attestationsOf(sha));
    const late = safe(() => this.capture.lateAttestationsOf(sha));
    const acc = safe(() => this.capture.captureAccountsOf(sha));
    const held = att && att.ok !== false && Array.isArray(att.attestations) ? att.attestations : [];
    const lateHeld = late && Array.isArray(late.late_attestations) ? late.late_attestations : [];
    const onTs = held.find((a) => a && a.kind === "rfc3161");
    const onCa = held.find((a) => a && a.kind === "co_archive" && a.locator);
    const lateTs = lateHeld.find((a) => a && a.kind === "timestamp" && a.ok === true);
    const lateCa = lateHeld.find((a) => a && a.kind === "co_archive" && a.ok === true && a.matches !== false
                                        && a.archived_locator);
    const ts = onTs ? { at: onTs.at ?? null, late: false } : lateTs ? { at: lateTs.at ?? null, late: true } : null;
    const ca = onCa ? { locator: onCa.locator, late: false } : lateCa ? { locator: lateCa.archived_locator, late: true } : null;
    const accounts = acc && Array.isArray(acc.accounts) ? acc.accounts : [];
    return { capture: sha, grade: g.grade ?? null, grade_basis: g.basis ?? null, grade_why: g.why ?? null,
             co_attested: !!(ts && ca), timestamp_at: ts ? ts.at : null, co_archive: ca ? ca.locator : null,
             late: !!((ts && ts.late) || (ca && ca.late)),
             accounts_read: accounts.map((a) => ({ by: a.by ?? null, at: a.at ?? null, text: String(a.text ?? ""),
                                                  signature: a.signature == null ? null : String(a.signature) })) };
  }

  /** R2 (DEC-81 item 3 (b), (d)): `selfAttested: [{capture, reason}]`, the owner's attributed acknowledgement of a
   *  document published as self-attested only. Any malformed shape is `BAD_COMPLETENESS` (`case-authoring` R3's code)
   *  naming the field (the pattern of `tensionsDisclosed`, K498); a capture listed twice is acknowledged once, its first reason kept. Then, in
   *  R2's order: a load-bearing capture at `EARNED_CAPTURE_CEILING` (Grade B, provenance R24's one definition) not
   *  co-attested and not listed is C-120.4, naming each; a listed one with an empty reason C-120.5; a listed one that
   *  is co-attested, or not in the case, C-120.6. Answers `{refusals, byCapture}`; `op=publish` answers the first,
   *  `case-authoring` R34's pre-flight lists them all. Nothing here refuses a case because a document is not co-attested. */
  selfAttestedJudged(resting, facts, memberRoles, list) {
    const byCapture = new Map();
    const bad = (field, detail) => ({ refusals: [{ ok: false, reason: "BAD_COMPLETENESS", field, detail }], byCapture });
    if (list != null) {
      if (!Array.isArray(list))
        return bad("selfAttested", "selfAttested is a list of {capture, reason}, one per document published as "
                                 + "self-attested only");
      for (let i = 0; i < list.length; i++) {
        const d = list[i];
        const capture = d && typeof d === "object" && !Array.isArray(d) && typeof d.capture === "string"
          ? d.capture.trim().toLowerCase() : "";
        if (!capture) return bad(`selfAttested[${i}]`, `selfAttested[${i}] is not {capture, reason} naming a capture`);
        if (d.reason != null && typeof d.reason !== "string")
          return bad(`selfAttested[${i}].reason`, `selfAttested[${i}].reason is the owner's reason, a string`);
        const reason = typeof d.reason === "string" ? d.reason.trim() : "";
        if (reason.length > COMPLETENESS_MAX || /["\\\r\n]/.test(reason))
          return bad(`selfAttested[${i}].reason`, `selfAttested[${i}].reason is at most ${COMPLETENESS_MAX} characters `
            + `and cannot contain a quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes`);
        if (!byCapture.has(capture)) byCapture.set(capture, { capture, ord: i, reason });
      }
    }
    const roleOf = new Map(memberRoles.map((m) => [m.target, m.role]));
    const membersOf = new Map();
    for (const r of resting) {
      if (!membersOf.has(r.capture)) membersOf.set(r.capture, []);
      membersOf.get(r.capture).push(r.member);
    }
    const refusals = [];
    const unacknowledged = [...facts.values()].filter((f) => f.grade === EARNED_CAPTURE_CEILING && !f.co_attested
      && membersOf.get(f.capture).some((m) => roleOf.get(m) === "load_bearing") && !byCapture.has(f.capture));
    /* DEC-49 REGION is-co-attestation-acknowledged */
    if (unacknowledged.length)
      refusals.push(disclosureRefusal("CO_ATTESTATION_UNACKNOWLEDGED", {
        unacknowledged: unacknowledged.map((f) => ({ capture: f.capture, members: membersOf.get(f.capture), grade: f.grade,
                                                     timestamp_at: f.timestamp_at, co_archive: f.co_archive })),
        detail: `${unacknowledged.length} load-bearing Grade ${EARNED_CAPTURE_CEILING} document(s) hold no trusted timestamp `
              + `and co-archive (`
              + unacknowledged.map((f) => `${f.capture} under ${membersOf.get(f.capture).join(", ")}`).join("; ")
              + `). Retry them (op=reattest), or list each in selfAttested with your reason to publish it as `
              + `self-attested only (DEC-81 item 3). The case is never refused because a document is not co-attested. `
              + `Nothing was written.` }));
    /* END DEC-49 REGION is-co-attestation-acknowledged */
    const noReason = [...byCapture.values()].filter((d) => !d.reason);
    /* DEC-49 REGION is-self-attested-reasoned */
    if (noReason.length)
      refusals.push(disclosureRefusal("SELF_ATTESTED_NO_REASON", {
        no_reason: noReason.map((d) => ({ capture: d.capture, ord: d.ord })),
        detail: `${noReason.map((d) => `selfAttested[${d.ord}]`).join(", ")} gives no reason. Publishing a document as `
              + `self-attested only is an attributed act with a stated reason (DEC-81 item 3 (b)). Nothing was written.` }));
    /* END DEC-49 REGION is-self-attested-reasoned */
    const notStanding = [...byCapture.values()].filter((d) => !facts.has(d.capture) || facts.get(d.capture).co_attested);
    /* DEC-49 REGION is-self-attestation-standing */
    if (notStanding.length)
      refusals.push(disclosureRefusal("SELF_ATTESTATION_NOT_STANDING", {
        not_standing: notStanding.map((d) => ({ capture: d.capture, ord: d.ord,
                                                why: facts.has(d.capture) ? "co_attested" : "not_in_case" })),
        detail: `${notStanding.map((d) => d.capture).join(", ")} needs no acknowledgement: `
              + notStanding.map((d) => (facts.has(d.capture) ? `${d.capture} is co-attested` : `${d.capture} is not a `
                + `document this case rests on`)).join("; ") + `. Remove it from selfAttested. Nothing was written.` }));
    /* END DEC-49 REGION is-self-attestation-standing */
    return { refusals, byCapture };
  }

  /** R6, R8, R12 (DEC-112 (4); K1134 reading 1): each member's chain (`chainsOf`, as `viewer` sees the record), each
   *  material it reaches with what this copy holds of it (`materialHeld`), and C-120.8 for every load-bearing member
   *  whose chain reaches material not held whole, naming each member and each material. Material only supporting
   *  members reach is listed `included: false` and never refused. Answers `{refusals, materials, refs, findings}`;
   *  `op=publish` answers the first refusal, `case-authoring` R34's pre-flight lists it. */
  materialsJudged(prepared, memberRoles, viewer) {
    const gate = viewerPredicate(viewer);
    const io = {
      rows: (q, ...a) => this.#rows(q, ...a), one: (q, ...a) => this.#one(q, ...a), normalizeType,
      parseRef: (t) => parseImportedFindingRef(t),
      visible: (id) => gate.scope !== "DENY"
        && !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args),
      readFile: (b, p) => this.record.readFile(b, p),
      unitsOf: (sha) => this.extraction.unitsOf(sha),
      sha256: (s) => createSha256().update(new TextEncoder().encode(s)).hex(), extractedTextOf,
    };
    const roleOf = new Map(memberRoles.map((m) => [m.target, m.role]));
    const chains = chainsOf(prepared.map((p) => ({ id: p.id, role: roleOf.get(p.id) })), io, DEPTH_BOUND);
    const materials = chains.materials.map((m) => {
      const held = materialHeld(m, io);
      return { ...m, held, included: held.whole };
    });
    const short = materials.filter((m) => !m.included && m.rests_under === "load_bearing");
    const refusals = [];
    /* DEC-49 REGION is-relied-on-presentable */
    if (short.length) {
      const byMember = memberRoles.filter((r) => r.role === "load_bearing")
        .map((r) => ({ target: r.target, materials: short.filter((m) => m.members.includes(r.target))
          .map((m) => ({ ref: m.ref, kind: m.kind, sha: m.sha, missing: m.held.missing })) }))
        .filter((x) => x.materials.length);
      refusals.push(disclosureRefusal("RELIED_ON_NOT_PRESENTABLE", { not_presentable: byMember,
        detail: `${short.length} document(s) or observation(s) a load-bearing finding of this case rests on are not held `
              + `whole by this copy (` + byMember.map((x) => `${x.target}: ` + x.materials.map((m) => `${m.ref} `
                + `${m.sha} lacks ${m.missing.join(" and ")}`).join(", ")).join("; ")
              + `). Everything a case relies on travels with it in full (DEC-112 (4)): find a presentable copy, stop `
              + `relying on the material, or make the finding supporting. Nothing was written.` }));
    }
    /* END DEC-49 REGION is-relied-on-presentable */
    return { refusals, materials, refs: chains.refs, findings: chains.findings };
  }

  /** R15 (DEC-112 (3); K1305, K1315): for each finding a member's chain reaches (R8), its legs exactly as
   *  `strength.gradingFacts` (its R35) answers them at the act, with `levels` null (`recomputePair` takes the levels the
   *  signed attribution section states), one `grading_facts:` row each, `{finding, ord}` beside the answer's fields; and
   *  each relied-on passage, one `passages:` row per leg naming a content row, `{finding, ord, content_id, capture_sha,
   *  extent, chain, quoted}` (`chain` as minted, null when none: K1317), `quoted` the text of the extracted unit at that extent (`extraction.unitsOf`), null where the copy
   *  holds none there. A finding `gradingFacts` refuses contributes no row, and the refusal is kept in `unread`, stated. */
  findingFacts(findings, viewer) {
    const grading = [], passages = [], unread = [];
    const units = new Map();
    const unitsOf = (sha) => {
      if (!units.has(sha)) { let u = null; try { u = this.extraction.unitsOf(sha); } catch { u = null; } units.set(sha, u); }
      return units.get(sha);
    };
    for (const id of [...new Set(findings.map((f) => f.id))]) {
      let gf = null;
      try { gf = this.strength.gradingFacts({ inquiry: id, levels: null, viewer }); } catch (e) { gf = { ok: false, reason: String(e && e.message || e).slice(0, 160) }; }
      if (!gf || gf.ok !== true) { unread.push({ finding: id, reason: gf ? gf.reason ?? null : null }); continue; }
      gf.legs.forEach((leg, ord) => grading.push({ finding: id, ord, ...leg }));
      for (const leg of this.#rows(`SELECT b.ord, c.content_id, c.capture_sha, c.extent, c.chain FROM inquiry_basis b
                                    JOIN content c ON c.content_id = b.content_id WHERE b.bundle_id=? ORDER BY b.ord`, id)) {
        const u = unitsOf(leg.capture_sha);
        const at = u && Array.isArray(u.units) ? u.units.find((x) => canonicalJson(x.extent) === leg.extent) : null;
        passages.push({ finding: id, ord: Number(leg.ord), content_id: leg.content_id, capture_sha: leg.capture_sha,
                        extent: leg.extent, chain: leg.chain ?? null, quoted: at && !at.truncated ? at.text : null });
      }
    }
    return { grading, passages, unread };
  }

  /** R4, R8, R10 (K1316): the off-the-record captures, those whose `sources:` row (R4) states the identity "Withheld":
   *  `case-grammar`'s `sourceRowWithheld`, the one reading of such a row. */
  withheldOf(sourceRows) {
    return new Set(sourceRows.filter(sourceRowWithheld).map((r) => r.capture));
  }

  /** R13 (DEC-96 item 4; N522): for each leg a member's chain reaches on another group's finding, the acceptance in force
   *  at the leg's `target_edition` (`case-import.acceptanceOf`, its R9) and the imported edition's facts
   *  (`importedCase`, its R4), as `accepted_work:` rows. A leg with none in force is C-120.10, naming each member, leg,
   *  source case and edition. The edition is read from the inquiry's own `bundle.md` `basis[ord]` (K1305 (2)). Answers
   *  `{refusals, rows, editions}`, `editions` each (import, edition) named with its refs, for R14. */
  acceptedWorkJudged(refs, viewer) {
    const rows = [], missing = [], editions = new Map();
    for (const leg of refs) {
      const parsed = parseImportedFindingRef(leg.ref);
      const text = this.#liveText(leg.leg_of);
      const basis = text !== null ? (parseFrontmatter(text).data || {}).basis : null;
      const at = Array.isArray(basis) ? basis[leg.ord] : null;
      const ed = at && Number.isInteger(Number(at.target_edition)) && Number(at.target_edition) > 0
        ? Number(at.target_edition) : null;
      const read = (fn) => { try { return fn(); } catch { return null; } };
      const imported = ed === null ? null : read(() => this.caseImport.importedCase({ import: parsed.import, edition: ed, viewer }));
      /* case-import R4: the import's source group and case at the top, the named edition in full under `edition`. */
      const view = imported && imported.ok !== false && imported.edition && Number(imported.edition.edition) === ed
        ? imported.edition : null;
      const edition = view ? { group: imported.group ?? null, case: imported.case ?? null,
                               manifest_sha: view.manifest_sha ?? null, findings: view.findings } : null;
      const acceptance = ed === null ? null
        : read(() => this.caseImport.acceptanceOf({ import: parsed.import, edition: ed, finding: parsed.finding }));
      const source = { group: edition ? edition.group ?? null : null, case: edition ? edition.case ?? null : null, edition: ed };
      if (!acceptance || acceptance.ok === false) {
        missing.push({ target: leg.member, leg_of: leg.leg_of, ord: leg.ord, ref: leg.ref, source });
        continue;
      }
      const found = edition && Array.isArray(edition.findings)
        ? edition.findings.find((f) => f.finding === parsed.finding) || null : null;
      rows.push(acceptedWorkRow({ ...leg, target_edition: ed }, parsed, acceptance, edition, found));
      const key = `${parsed.import}#${ed}`;
      if (!editions.has(key)) editions.set(key, { import: parsed.import, edition: ed, refs: [] });
      editions.get(key).refs.push({ ref: leg.ref, finding: parsed.finding, member: leg.member });
    }
    const refusals = [];
    /* DEC-49 REGION is-accepted-work-in-force */
    if (missing.length)
      refusals.push(disclosureRefusal("ACCEPTED_WORK_NOT_IN_FORCE", { not_in_force: missing,
        detail: `${missing.length} leg(s) of this case's findings rest on another group's finding with no acceptance of `
              + `that edition in force (` + missing.map((m) => `${m.target}: ${m.leg_of} leg ${m.ord} on ${m.ref}, `
                + `${m.source.case ?? "an imported case"} edition ${m.source.edition ?? "not stated"}`).join("; ")
              + `). Accept that edition again (op=importaccept), or take the leg out. Nothing was written.` }));
    /* END DEC-49 REGION is-accepted-work-in-force */
    return { refusals, rows, editions: [...editions.values()] };
  }

  /** R14 (DEC-96 items 2, 4; DEC-84 (13)): the open flags on each edition R13 names (`case-import.openFlagsOn`, its
   *  R9), judged against `flagsDisclosed` (`flagsJudged`): a failed or incomplete read C-120.12 alone; else an open flag
   *  not listed C-120.11, naming each, and a listed one not open C-120.13. Never refused because a flag is open. Answers
   *  `{refusals, open, byFlag}`. */
  flagsJudged(editions, flagsDisclosed) {
    const listed = flagsListed(flagsDisclosed);
    if (listed.ok === false) return { refusals: [listed], open: [], byFlag: new Map() };
    const reads = editions.map((e) => {
      let answer;
      try { answer = this.caseImport.openFlagsOn({ import: e.import, edition: e.edition }); }
      catch (x) { answer = { failed: String(x && x.message || x).slice(0, 160) }; }
      return { ...e, answer };
    });
    const j = flagsJudged(reads, listed);
    const refusals = [];
    /* DEC-49 REGION is-flags-determined */
    if (j.failed.length)
      return { refusals: [disclosureRefusal("FLAGS_UNDETERMINED", { undetermined: j.failed,
        detail: `the flags on another group's work this case rests on could not be read whole (`
              + j.failed.map((f) => `edition ${f.edition} of import ${f.import}: ${f.why}`).join("; ")
              + `), so what this case must disclose is not known. Try again. Nothing was published.` })],
        open: [], byFlag: listed.byFlag };
    /* END DEC-49 REGION is-flags-determined */
    /* DEC-49 REGION is-flag-disclosed */
    if (j.undisclosed.length)
      refusals.push(disclosureRefusal("FLAG_NOT_DISCLOSED", {
        undisclosed: j.undisclosed.map((f) => ({ flag: f.flag, ref: f.ref, edition: f.edition, issue: f.issue })),
        detail: `${j.undisclosed.length} open flag(s) on another group's work this case rests on are not disclosed (`
              + j.undisclosed.map((f) => `flag ${f.flag} on ${f.ref} edition ${f.edition}`).join("; ")
              + `). A case is published with its open flags disclosed, never refused because one is open (DEC-96 item `
              + `4): list each in flagsDisclosed, or clear it first. Nothing was published.` }));
    /* END DEC-49 REGION is-flag-disclosed */
    /* DEC-49 REGION is-flag-disclosure-standing */
    if (j.notStanding.length)
      refusals.push(disclosureRefusal("FLAG_DISCLOSURE_NOT_STANDING", {
        not_standing: j.notStanding.map((d) => ({ flag: d.flag, ord: d.ord })),
        detail: `${j.notStanding.map((d) => d.flag).join(", ")} is not an open flag on work this case rests on: it may `
              + `have been cleared since. Read the list again (op=publishpreflight). Nothing was published.` }));
    /* END DEC-49 REGION is-flag-disclosure-standing */
    return { refusals, open: j.open, byFlag: listed.byFlag };
  }

  /** R4 (DEC-78 item 5): what may be stated of the source of each capture given to the group rather than fetched. The
   *  capture's source is found through `sources.sourceOf` (a capture no source stands behind, a fetched one, has none,
   *  and nothing is stated: the capturing member is never its source), and for each source only what
   *  `sources.publishableAt({audience: "public"})` answers is stated, spelled by publication's `sourceStatement`, with its
   *  basis. With nothing publishable, publication's `unnamedSourceStatement`: "an unnamed source" and the receipt's
   *  digest and time, basis null. Rows are `{capture, stated, basis}` (K549); no authored field adds to them, and no
   *  source or entry id is written (an opaque id in two cases would itself link them). A source read that fails states
   *  the unnamed row: less, never more. */
  sourcesStated(shas, viewer) {
    const rows = [];
    const unnamed = (capture, receipt) => ({ capture, basis: null,
      stated: unnamedSourceStatement({ capture: receipt && receipt.sha256 ? receipt.sha256 : capture,
                                       received: receipt && receipt.received ? receipt.received : null }) });
    for (const sha of shas) {
      let of = null;
      try { of = this.sources.sourceOf({ captureSha: sha, viewer }); } catch { of = null; }
      if (of && of.ok === false && of.reason === "NO_SUCH_SOURCE") continue;
      if (!of || of.ok !== true) { rows.push(unnamed(sha, null)); continue; }
      const each = Array.isArray(of.sources) && of.sources.length ? of.sources
        : [{ sourceId: of.sourceId, source: of.source }];
      for (const s of each) {
        let pa = null;
        try { pa = this.sources.publishableAt({ source: s.sourceId, audience: "public" }); } catch { pa = null; }
        const entries = (pa && pa.ok === true && Array.isArray(pa.entries) ? pa.entries : [])
          .map((e) => ({ stated: sourceStatement(e), basis: e.basis ?? null })).filter((e) => e.stated);
        /* The unnamed statement is the capture's, from its first pulled knock (`sourceOf`'s own `source`), whichever
           source says nothing: publication R51 re-derives it that way at the commit. */
        if (!entries.length) { rows.push(unnamed(sha, of.source && of.source.receipt)); continue; }
        for (const e of entries) rows.push({ capture: sha, stated: e.stated, basis: e.basis });
      }
    }
    /* Each statement once: two knockers of the same bytes with nothing publishable are one unnamed statement. */
    const once = new Set();
    return rows.filter((r) => { const k = JSON.stringify([r.capture, r.stated, r.basis]); return once.has(k) ? false : once.add(k); });
  }

  /** R1's input: `tensionsDisclosed`, `[{candidate, words?}]`, as a map by candidate (a candidate listed twice is
   *  disclosed once, its first words kept). Absent or null is none. Any malformed shape is `BAD_COMPLETENESS`
   *  (`case-authoring` R3's code) naming the field (K498): a list that is not one, an entry that is not an object naming a `candidate` string, and
   *  words over `COMPLETENESS_MAX` or holding a character the grammar cannot carry (a double quote, a backslash, a line
   *  break; an apostrophe is legal inside its quoted string). C-120.2 is only for a well-formed candidate. */
  #disclosuresListed(list) {
    const byCandidate = new Map();
    const bad = (field, detail) => ({ ok: false, reason: "BAD_COMPLETENESS", field, detail });
    if (list == null) return { ok: true, byCandidate };
    if (!Array.isArray(list))
      return bad("tensionsDisclosed", "tensionsDisclosed is a list of {candidate, words?}, one per conflict disclosed");
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      const candidate = d && typeof d === "object" && !Array.isArray(d) && typeof d.candidate === "string"
        ? d.candidate.trim() : "";
      if (!candidate)
        return bad(`tensionsDisclosed[${i}]`, `tensionsDisclosed[${i}] is not {candidate, words?} naming a candidate`);
      if (d.words != null && typeof d.words !== "string")
        return bad(`tensionsDisclosed[${i}].words`, `tensionsDisclosed[${i}].words is the owner's words, a string`);
      const words = typeof d.words === "string" ? d.words.trim() || null : null;
      if (words !== null && (words.length > COMPLETENESS_MAX || /["\\\r\n]/.test(words)))
        return bad(`tensionsDisclosed[${i}].words`, `tensionsDisclosed[${i}].words is at most ${COMPLETENESS_MAX} `
          + `characters and cannot contain a quote, a backslash, or a newline: the restricted frontmatter grammar has `
          + `no escapes`);
      if (!byCandidate.has(candidate)) byCandidate.set(candidate, { candidate, ord: i, words });
    }
    return { ok: true, byCandidate };
  }

  /** R1 (and `case-authoring` R32): THE ONE READ of what a case over `prepared` must disclose: `contradiction.unresolvedRecordOn` (its R29)
   *  for each member at its pin, as `viewer`. A read that fails or is truncated is C-120.3 (what cannot be read cannot
   *  be disclosed). A leg the read could name no referent for (`undetermined_legs`: a document leg with no content row)
   *  is stated, never filled (R18): counted per member in `unread`. Answers C-120.3 itself or `{ok: true, entries, unread}`, one
   *  entry per candidate and member, each with its sides as the document states them, and a highlighted one with its
   *  seen side only (R17). Never throws. */
  tensionsRead(prepared, viewer) {
    const entries = [];
    const failed = [];
    const unread = [];
    for (const p of prepared) {
      let r = null;
      try { r = this.contradiction.unresolvedRecordOn({ finding: p.id, sha: p.bundleSha, viewer }); }
      catch (e) { r = { undetermined: true, why: String(e && e.message || e).slice(0, 160) }; }
      if (!r || r.ok === false || r.undetermined || r.truncated || !Array.isArray(r.candidates)) {
        failed.push({ finding: p.id, sha: p.bundleSha,
                      why: !r ? "no answer" : r.truncated ? `more than ${r.bound ?? "its bound of"} candidates on it`
                         : r.why || "the read failed" });
        continue;
      }
      if (Number(r.undetermined_legs) > 0) unread.push({ finding: p.id, legs: Number(r.undetermined_legs) });
      for (const c of r.candidates) {
        if (c.unseen_other_side)
          entries.push({ candidate: c.candidate, finding: p.id, state: c.state, kind: null, unseen_other_side: true,
                         side: tensionSide(c.side), depth: 1 });
        else
          entries.push({ candidate: c.candidate, finding: p.id, state: c.state, kind: c.kind ?? null,
                         unseen_other_side: false, a: tensionSide(c.a), b: tensionSide(c.b),
                         explanation: c.explanation ?? null, depth: 1 });
      }
    }
    if (failed.length) return this.tensionsUndetermined(failed);
    return { ok: true, entries, unread };
  }

  /** R1: C-120.3's one site, a read of conflicts that could not be made whole, naming each finding and why; also the
   *  refusal for a caller's own failed read (`case-authoring` R32). */
  tensionsUndetermined(failed) {
    /* DEC-49 REGION is-tensions-determined */
    return disclosureRefusal("TENSIONS_UNDETERMINED", { undetermined: failed,
      detail: `the record could not be read whole for conflicts on ${failed.map((f) => `${f.finding ?? "this case's "
                + "findings"} (${f.why})`).join("; ")}, so what this case must disclose is not known. Nothing was `
            + `published.` });
    /* END DEC-49 REGION is-tensions-determined */
  }

  /* R1, R17: how C-120.1 names an undisclosed entry. A half-seen one by its candidate and its finding only. */
  #namedInRefusal(e) {
    return e.unseen_other_side
      ? { candidate: e.candidate, finding: e.finding, unseen_other_side: true, says: NOT_SHOWN_WORDS }
      : { candidate: e.candidate, finding: e.finding, state: e.state, kind: e.kind, a: e.a, b: e.b };
  }

  /** R3, R7, R10, R14 (K1134 Q6, BOB's decision 15; K1316): the rows the case document writes for what R2, R6 and R14
   *  judged, once the caller is past its last refusal and has read R4's sources and the attribution run. Its arguments
   *  are those answers as the caller holds them: `resting` (R2's captures), `facts` (a map of R2's facts by capture,
   *  extended here by every document R6 reached), `selfAttested` (R2's judgment, or its `byCapture`), `reached` (R6's
   *  judgment), `flags` (R14's judgment), `withheld` (R4's off-the-record captures, `withheldOf`), `attributionOf` (the
   *  attribution rows by capture or observation, `publication.attributionStatements`), `project`, and the act's
   *  `author` stamp and instant `at`. Answers `{captures, materials: {rows, attestations}, flags, group}`:
   *  - `captures`: one row per (member, capture), R2's facts with `self_attested_only` and, on an acknowledged capture's
   *    rows, `{reason, acknowledged_by, at, sentence}` (R3); each capture's signed accounts on its first row only, an
   *    off-the-record one's text only unless its member chose to be named (R10);
   *  - `materials`: `materialRows` over R6's materials (R7), an off-the-record capture's origin not stated (R10);
   *  - `flags`: one row per open flag disclosed, the owner's words marked as the owner's, acknowledged by the `author`
   *    stamp at `at` (R14); the flagging member is not named;
   *  - `group`: the producing group's slug (promotion's fact `producingGroup`), or null.
   *  Reads nothing it was not handed but the facts of a reached document, its origin and its register row. */
  disclosureBlocks({ resting = [], facts = new Map(), selfAttested = null, reached = null, flags = null,
                     withheld = new Set(), attributionOf = new Map(), project = null, author = null, at = null } = {}) {
    const who = author, when = at;
    const byCapture = selfAttested instanceof Map ? selfAttested
      : selfAttested && selfAttested.byCapture instanceof Map ? selfAttested.byCapture : new Map();
    const factsOf = (sha) => { if (!facts.has(sha)) facts.set(sha, this.captureFacts(sha)); return facts.get(sha); };
    /* R10: a member credited at `cover` or `name` is named as they chose; at `group`, `project` or none yet, never by
       handle, key or signature. */
    const named = (sha) => { const l = (attributionOf.get(sha) || {}).level; return l === "cover" || l === "name"; };
    /* R2, R3: each (member, capture) row, the owner's acknowledgement (the `author` stamp at this act) on every row of
       an acknowledged capture, and each capture's signed accounts, an off-the-record one's text only unless its member
       chose to be named (R10). */
    const accountsCarried = new Set();
    const captures = resting.map((r) => {
      const { accounts_read, ...f } = factsOf(r.capture);
      const ack = byCapture.get(r.capture) || null;
      /* A capture's accounts ride on its first row only, so each is written once (publication R20 reads them back by
         capture). */
      const first = !accountsCarried.has(r.capture);
      accountsCarried.add(r.capture);
      const hidden = withheld.has(r.capture) && !named(r.capture);
      return { ...f, member: r.member, self_attested_only: !!ack,
               ...(ack ? { acknowledgement: { reason: ack.reason, acknowledged_by: who, at: when,
                                              sentence: SELF_ATTESTED_SENTENCE } } : {}),
               accounts: !first ? [] : hidden ? accounts_read.map((x) => ({ ...x, by: null, signature: null })) : accounts_read };
    });
    /* R7 (K1134 Q6, BOB's decision 15): each material a chain reaches and its attestations. */
    const group = (() => {
      let f = null;
      try { f = this.promotion.fact("producingGroup"); } catch { f = null; }
      return f && f.ok ? f.value ?? null : null;
    })();
    const materials = materialRows(reached && Array.isArray(reached.materials) ? reached.materials : [],
                                   { project, group, at: when, facts: factsOf,
      origin: (sha) => withheld.has(sha) ? null : (this.#one(`SELECT address FROM captured_locators WHERE capture_sha=?
                         AND address NOT LIKE 'knock:%' ORDER BY first_retrieved, address LIMIT 1`, sha) || {}).address ?? null,
      registered: (sha) => this.#one(`SELECT bundle_id, registered FROM register WHERE capture_sha=?`, sha),
      member: (m, f) => {
        const attr = attributionOf.get(m.kind === "observation" ? m.ref : m.sha) || null;
        if (m.kind === "observation")
          return [{ by: attr ? attr.shown ?? null : null, level: attr ? attr.level ?? null : null, at: null, signature: null }];
        const accounts = f && Array.isArray(f.accounts_read) ? f.accounts_read : [];
        /* A capture whose source is not withheld: its signed accounts are in the capturing member's own name (DEC-81
           item 3), so their row states that level and carries the handle and signature (case-grammar R12). */
        if (!withheld.has(m.sha)) return accounts.map((x) => ({ by: x.by, level: "name", at: x.at, signature: x.signature }));
        const level = attr ? attr.level ?? null : null, open = named(m.sha);
        const shown = open ? attr.shown ?? null : null;
        return accounts.length ? accounts.map((x) => ({ by: shown, level, at: x.at, signature: open ? x.signature : null }))
                               : [{ by: shown, level, at: null, signature: null }];
      } });
    /* R14: each open flag disclosed, the owner's words marked as the owner's, acknowledged by the `author` stamp. */
    const byFlag = flags && flags.byFlag instanceof Map ? flags.byFlag : new Map();
    const flagRows = (flags && Array.isArray(flags.open) ? flags.open : []).map((f) => ({ ref: f.ref, edition: f.edition,
      flag: f.flag, issue: f.issue, flagged_at: f.at, words: (byFlag.get(f.flag) || {}).words ?? null,
      acknowledged_by: who, acknowledged_at: when }));
    return { captures, materials, flags: flagRows, group };
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It holds no table, so it creates none and
 *  declares nothing to purge (R23). */
export function caseDisclosuresOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    c = new CaseDisclosures({ ...d, host, storage, record });
    instances.set(host, c);
  }
  return c;
}
