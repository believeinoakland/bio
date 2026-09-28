/* C-108: capture-requests' own refusal family (K181 (2); K174's pattern: a new family is held in its module, the
 * catalogue untouched). One row: the source's own refusal of a request (R40, K103 (3)). */
export const CAPTURE_SOURCE_CHECKS = Object.freeze({
  /* R40, R42: THE SOURCE TURNED THE REQUEST AWAY and said why (401/407 a login, 402 a payment, 403/406 an agent it will
     not admit, 451 another reason). Terminal, and the one refusal a member can answer: supply what the source asked
     for (capture-sources R55) and ask again (op=capturerequestretry). */
  CAPTURE_SOURCE_REFUSED: {
    check: "C-108.1",
    where: "src/capture-requests/index.mjs drain > is-capture-source-refused",
    translation: "The site turned this request away: it asked for a login, a payment or a different browser, or refused "
      + "for another reason it gave. Nothing was captured. A member who can see the question may supply what the site "
      + "asked for and ask again.",
  },
});
