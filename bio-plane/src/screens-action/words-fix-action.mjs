/* screens-action's T51 fix-round words, group "action" (R37, R38, R40, R43, R52, R54; the keys this group's entries read, each one
   setup-words holds; K3366, K3810). WORDS: keys added to SCREEN_WORDS. EXTRA: keys a screen draws that do not start with its
   `screen.<id>.` prefix, by screen id. */
export const WORDS = Object.freeze([
  // R38: the full reply form (DEC-376, C66; DEC-387 B424), the design's own rows
  "screen.action.the.day.it.came.or.the", "screen.action.a.real.calendar.day", "screen.action.who.it.came.from", "screen.action.the.office.or.person.who.answered",
  "screen.action.your.account.of.the.reply", "screen.action.in.your.own.words.up.to", "screen.action.what.kind.of.reply", "screen.action.a.silence.has.no.kind",
  "screen.action.what.the.office.decided", "screen.action.only.on.a.reply", "screen.action.the.exemptions.the.office.cites",
  "screen.action.the.exemptions.or.reasons.for.withholding", "screen.action.the.office.says.it.will.answer", "screen.action.a.date.the.office.itself.stated",
  "screen.action.the.law.that.date.comes.from", "screen.action.only.a.law.this.action.goes", "screen.action.what.the.fee.is.for",
  "screen.action.optional.in.the.office.s.words", "screen.action.put.a.waiver.in.as.a", "screen.action.no.reply.came.by.the.date",
  "screen.action.what.came.back", "screen.action.a.reply.came", "screen.action.record.a.silence.with.its.date", "screen.action.it.is.not.the.same.as",
  "screen.action.how.it.came", "screen.action.reply.medium.email", "screen.action.reply.medium.letter", "screen.action.reply.medium.portal",
  "screen.action.reply.medium.person", "screen.action.reply.medium.other", "screen.action.what.you.record.it.from", "screen.action.your.account.of.it",
  "screen.action.the.reply.itself.a.document.you", "screen.action.either.the.reply.itself.or.your", "screen.action.a.silence.has.neither.because.there",
  "screen.action.the.document.that.holds.the.reply", "screen.action.only.when.you.record.the.reply", "screen.action.add.the.document.first.under.add",
  "screen.action.a.reply.needs.either.the.document", "screen.docket.capture.option", "screen.action.where.this.reply.stands.in.the",
  "screen.action.say.what.kind.of.reply.it", "screen.action.the.request.s.timeline.then.follows", "screen.action.a.sending.has.its.own.kinds",
  "screen.action.it.follows", "screen.action.the.earlier.entry.this.answers.so", "screen.action.an.appeal.must.follow.the.decision",
  "screen.action.reply.follows.none", "screen.action.reply.follows.request", "screen.action.reply.follows.reply",
  "screen.action.a.denial.a.decision.on.a", "screen.action.civicsmith.works.out.no.date.for", "screen.action.give.the.law.with.it",
  "screen.action.if.the.reply.quotes.a.fee", "screen.action.a.fee.quote.is.kept.as", "screen.action.the.amount.quoted", "screen.action.currency",
  "screen.action.reply.currency.usd", "screen.action.it.answers.this.sending", "screen.action.the.earlier.sending.the.quote.responds",
  "screen.action.it.revises.this.quote", "screen.action.only.when.the.office.changes.a", "screen.reminder.on",
  // the stages and outcomes the vocabulary names, by token (none is the empty choice)
  "screen.action.reply.stage.none", "screen.action.reply.stage.acknowledgement", "screen.action.reply.stage.fee_estimate", "screen.action.reply.stage.fee_waiver_decision",
  "screen.action.reply.stage.extension_notice", "screen.action.reply.stage.production", "screen.action.reply.stage.denial", "screen.action.reply.stage.appeal_decision",
  "screen.action.reply.stage.court_decision", "screen.action.reply.outcome.none", "screen.action.reply.outcome.granted", "screen.action.reply.outcome.denied",
  "screen.action.reply.outcome.partial", "screen.action.reply.outcome.reversed", "screen.action.reply.outcome.affirmed", "screen.action.reply.outcome.none_stated",
  "screen.action.reply.outcome.none_exists",
]);
export const EXTRA = Object.freeze({
  // R37, R40, R43: the cards of the screens the action opens; R54: the one list of laws
  action: ["screen.due-date.name", "screen.due-date.purpose", "screen.counsel.name", "screen.counsel.purpose", "screen.start-send.name", "screen.start-send.purpose", "law.pick",
    // R38 (B15 (1)): the reply's document is offered as the docket's capture option; R52: the reminder's sentence
    "screen.docket.capture.option", "screen.reminder.on"],
});
