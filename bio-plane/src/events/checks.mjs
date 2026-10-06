/* events' rows for the two conditions it answers for every module (K1568, K1569; entities' `noSuchEntity` pattern,
   K275): one code minted at one site each, so a later module (progressions, duties) answers through these and holds no
   copy. Their catalogue numbers are promotion's to stamp (plan T33, Choices: promotion's stamp of T33's new rows is
   T34's), so `check` is null until then. The sentences name no act, so they read true wherever they are answered. */
export const EVENT_CHECKS = Object.freeze({
  NO_SUCH_EVENT: Object.freeze({
    check: null,
    where: "src/events/index.mjs noSuchEvent > is-event-held",
    translation: "No event with that id is held in the record, so nothing can be said about it or attached to it. "
      + "Name an event the record holds. Nothing was written.",
  }),
  NO_SUCH_DATED_FACT: Object.freeze({
    check: null,
    where: "src/events/index.mjs noSuchDatedFact > is-dated-fact-held",
    translation: "No date a document states is held under that id where you can see it, so nothing can rest on it. "
      + "Name a dated fact the record holds. Nothing was written.",
  }),
});
