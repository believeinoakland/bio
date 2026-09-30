/* sources' refusal rows (requirements: `build/requirements/sources.md`, R14). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act is
 * reached. A new module with nothing moved (K509 (1), N364): the rows are its own new family, C-121, "a source's
 * disclosures", held here and nowhere else (K174). Each code is minted at one site, the DEC-49 region its `where`
 * names. No translation names a place (R14, `layers.md` rule 1), and none carries a value (R13). */

const at = (fn, region) => `src/sources/checks.mjs ${fn} > ${region}`;

export const SOURCES_CHECKS = Object.freeze({
  NO_SUCH_SOURCE: Object.freeze({
    check: 'C-121.1', where: at("noSuchSource", "is-source-held"),
    translation: 'No source you can see answers to that id. Nothing was written.',
  }),
  BAD_DISCLOSURE: Object.freeze({
    check: 'C-121.2', where: at("badDisclosure", "is-disclosure-well-formed"),
    translation: 'A disclosure names what was revealed (a pseudonym link, an attribute or a name), how it became known, '
      + 'and to whom it is known, each from the listed choices. The field that is not one of them is named. Nothing '
      + 'was written.',
  }),
  NO_EVIDENCE: Object.freeze({
    check: 'C-121.3', where: at("noEvidence", "is-evidence-named"),
    translation: 'What is recorded about a source is recorded with its evidence. Name the evidence. Nothing was written.',
  }),
  NO_SIGHT_LIST: Object.freeze({
    check: 'C-121.4', where: at("noSightList", "is-sight-listed"),
    translation: 'A detail about a source that is stored can be read only by the members listed for it, and none is '
      + 'listed. List at least one member, or record that the detail is known without storing it. Nothing was written.',
  }),
  CONSENT_NOT_STANDING: Object.freeze({
    check: 'C-121.5', where: at("consentNotStanding", "is-consent-standing"),
    translation: 'That consent cannot be recorded: the detail it names is not in this source\'s history, or consent to '
      + 'a wider audience already stands. Nothing was written.',
  }),
  SECRET_NOT_RECOGNISED: Object.freeze({
    check: 'C-121.6', where: at("secretNotRecognised", "is-secret-recognised"),
    translation: 'That secret was not recognised, so nothing was recorded. Check it and try again.',
  }),
});

/* Each code's one site. The refusal is written whole inside its region, its code a string literal, so the DEC-49
   guard can compare it with the row; `extra` adds a caller's own fields and never replaces the refusal's own. */
const ROW = SOURCES_CHECKS;

export function noSuchSource(source, extra) {
  /* DEC-49 REGION is-source-held */
  return { ...(extra || {}), ok: false, reason: "NO_SUCH_SOURCE", code: "NO_SUCH_SOURCE",
           check: ROW.NO_SUCH_SOURCE.check, translation: ROW.NO_SUCH_SOURCE.translation,
           detail: "no source this caller may see answers to that id, so nothing was written",
           source: typeof source === "string" ? source.slice(0, 64) : null };
  /* END DEC-49 REGION is-source-held */
}

export function badDisclosure(field, detail, extra) {
  /* DEC-49 REGION is-disclosure-well-formed */
  return { ...(extra || {}), ok: false, reason: "BAD_DISCLOSURE", code: "BAD_DISCLOSURE",
           check: ROW.BAD_DISCLOSURE.check, translation: ROW.BAD_DISCLOSURE.translation,
           detail, field };
  /* END DEC-49 REGION is-disclosure-well-formed */
}

export function noEvidence(extra) {
  /* DEC-49 REGION is-evidence-named */
  return { ...(extra || {}), ok: false, reason: "NO_EVIDENCE", code: "NO_EVIDENCE",
           check: ROW.NO_EVIDENCE.check, translation: ROW.NO_EVIDENCE.translation,
           detail: "evidence is a non-empty statement, or a citation {cite}, and none was named, so nothing was written" };
  /* END DEC-49 REGION is-evidence-named */
}

export function noSightList(detail, extra) {
  /* DEC-49 REGION is-sight-listed */
  return { ...(extra || {}), ok: false, reason: "NO_SIGHT_LIST", code: "NO_SIGHT_LIST",
           check: ROW.NO_SIGHT_LIST.check, translation: ROW.NO_SIGHT_LIST.translation,
           detail };
  /* END DEC-49 REGION is-sight-listed */
}

export function consentNotStanding(detail, extra) {
  /* DEC-49 REGION is-consent-standing */
  return { ...(extra || {}), ok: false, reason: "CONSENT_NOT_STANDING", code: "CONSENT_NOT_STANDING",
           check: ROW.CONSENT_NOT_STANDING.check, translation: ROW.CONSENT_NOT_STANDING.translation,
           detail };
  /* END DEC-49 REGION is-consent-standing */
}

/* R11: one answer, byte for byte, for every failure of a consent by secret, built once and frozen, so no failure can
   be told from another by its fields or their order. */
export function secretNotRecognised() {
  /* DEC-49 REGION is-secret-recognised */
  return Object.freeze({ ok: false, reason: "SECRET_NOT_RECOGNISED", code: "SECRET_NOT_RECOGNISED",
                         check: ROW.SECRET_NOT_RECOGNISED.check, translation: ROW.SECRET_NOT_RECOGNISED.translation,
                         detail: "the secret was not recognised, so nothing was recorded" });
  /* END DEC-49 REGION is-secret-recognised */
}
export const SECRET_NOT_RECOGNISED_ANSWER = secretNotRecognised();
