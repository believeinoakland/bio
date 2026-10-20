/* screens-action's T51 fix-round words, group "action" (R37, R38, R40, R43, R52, R54; the keys this group's entries read, each one
   setup-words holds; K3366, K3810). WORDS: keys added to SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its
   `screen.<id>.` prefix, by screen id. */
export const WORDS = Object.freeze([
  // R38: the full reply form (DEC-376, C66), the design's own rows
  "screen.action.the.day.it.came.or.the", "screen.action.a.real.calendar.day", "screen.action.who.it.came.from", "screen.action.the.office.or.person.who.answered",
  "screen.action.your.account.of.the.reply", "screen.action.in.your.own.words.up.to", "screen.action.what.kind.of.reply", "screen.action.a.silence.has.no.kind",
  "screen.action.what.the.office.decided", "screen.action.only.on.a.reply", "screen.action.the.exemptions.the.office.cites",
  "screen.action.the.exemptions.or.reasons.for.withholding", "screen.action.the.office.says.it.will.answer", "screen.action.a.date.the.office.itself.stated",
  "screen.action.the.law.that.date.comes.from", "screen.action.only.a.law.this.action.goes", "screen.action.what.the.fee.is.for",
  "screen.action.optional.in.the.office.s.words", "screen.action.put.a.waiver.in.as.a", "screen.action.no.reply.came.by.the.date",
  "screen.action.decision.on.a.fee.waiver", "screen.action.notice.of.an.extension", "screen.action.decision.on.an.appeal", "screen.action.no.such.records.exist",
]);
export const EXTRA = Object.freeze({
  // R37, R40, R43: the cards of the screens the action opens; R54: the one list of laws
  action: ["screen.due-date.name", "screen.due-date.purpose", "screen.counsel.name", "screen.counsel.purpose", "screen.start-send.name", "screen.start-send.purpose", "law.pick"],
});
