/* screens-intake: bringing material in and deciding what enters the record (N897 (1); draft-T46-interface.md §2.4).
 * Five registry screens, `capture`, `held`, `archive` (since T47), `open-file` and `inbox`, each met to interface-shell's screen contract (its
 * R21): `{id, reads, render, acts, words}`. Pure: it reads no table and writes nothing; every read and act is an op the
 * plane serves, called through the kit.
 *
 * The contract is interface-shell R21's (K2996, K2998): every function is self-contained (its parameters, the kit `cs`
 * and the language's own globals), so the shell composes the page's one script from their text and the same functions
 * run in node for the tests. `reads(view)` answers `{name: {op, query, empty?}}`; `render(cs, view)` the screen's HTML;
 * each act `{op, label, send(view, el, cs, extra), done?(view, answer, cs), rereads?, refusals?, dialog?}`. It also
 * reads the parts K2999 and K3002 added to R21: `cs.download(op, {query, body})`, a byte answer handed to the browser
 * as a file (R6); `cs.digest(text)`, the SHA-256 of a text (the bundle an acquire promotes, R1); `cs.now()`; a `send`
 * answering a promise; `extra.picked`, the picked rows' keys; and `{refuse: key, fills}`, a word of the list beside the act.
 *
 * Words by key (R26; K3366, K3368; DEC-257, DEC-258): this module holds no member-facing English. `words` is the keys of
 * `setup-words`' `WORD_ROWS` each screen draws, and the shell reads every sentence through them. */

import { CAPTURE_SCREEN } from "./capture.mjs";
import { HELD_SCREEN } from "./held.mjs";
import { OPEN_FILE_SCREEN } from "./open-file.mjs";
import { INBOX_SCREEN } from "./inbox.mjs";
import { ARCHIVE_SCREEN } from "./archive.mjs";

/* The keys each screen reads (R26). */
export const SCREEN_KEYS = Object.freeze({
  capture: Object.freeze([
    "act.acquire.label.capture", "act.capturerequest.label.capture", "act.captureupload.label.capture",
    "capture.cite", "capture.cite.tip", "capture.filed.project", "capture.filed.question", "act.monitor.label.capture", "act.monitorset.label.capture",
    "act.testify.label.capture", "act.writinghelp.label.capture", "ai.label.untested", "capture.fieldneeded",
    "photo.reminder", "refusal.BAD_LOCATOR", "refusal.EMPTY", "refusal.FETCH_FAILED", "refusal.SOURCE_REFUSED",
    "refusal.TOO_LARGE", "screen.capture.address.archive", "screen.capture.address.checked",
    "screen.capture.address.done", "screen.capture.address.existed", "screen.capture.address.freq",
    "screen.capture.address.freq.daily", "screen.capture.address.freq.hourly", "screen.capture.address.freq.monthly",
    "screen.capture.address.freq.per_meeting", "screen.capture.address.freq.weekly", "screen.capture.address.help",
    "screen.capture.address.label", "screen.capture.address.note", "screen.capture.address.notpromoted",
    "screen.capture.address.requested", "screen.capture.address.requested.waits", "screen.capture.address.watchabout",
    "screen.capture.address.watchafter", "screen.capture.address.watching", "screen.capture.file.choose",
    "screen.capture.file.choosehelp", "screen.capture.file.done", "screen.capture.file.downloaded",
    "screen.capture.file.existed", "screen.capture.file.how", "screen.capture.file.how.downloaded",
    "screen.capture.file.how.handed", "screen.capture.file.how.made", "screen.capture.file.how.sent",
    "screen.capture.file.missing", "screen.capture.file.nofile", "screen.capture.file.note",
    "screen.capture.file.toaddress", "screen.capture.file.toolong", "screen.capture.file.what",
    "screen.capture.file.where", "screen.capture.file.wherehelp", "screen.capture.help.empty",
    "screen.capture.help.only", "screen.capture.refusal.MEMBER_SESSION_REQUIRED",
    "screen.capture.refusal.UPLOAD_NO_STATEMENT", "screen.capture.refusal.upload.EMPTY",
    "screen.capture.refusal.upload.TOO_LARGE", "screen.capture.saw.after", "screen.capture.saw.badwhen",
    "screen.capture.saw.done", "screen.capture.saw.draft", "screen.capture.saw.missing", "screen.capture.saw.note",
    "screen.capture.saw.when", "screen.capture.saw.whenhelp", "screen.capture.saw.where",
    "screen.capture.saw.wherein", "screen.capture.saw.words", "screen.capture.sub", "screen.capture.tab.address",
    "screen.capture.tab.file", "screen.capture.tab.saw", "screen.capture.tabs", "shell.unread",
  ]),
  held: Object.freeze([
    "act.heldcaptures.label.held", "act.heldrestore.label.held", "act.heldsetaside.label.held",
    "act.release.label.held", "mark.gap.refused.means", "mark.gap.refused.name", "mark.gap.undetermined.means",
    "mark.gap.undetermined.name", "mark.gap.withheld.means", "mark.gap.withheld.name", "refusal.CRUCIAL_IN_BATCH",
    "refusal.ENTRY_REQUIREMENTS", "screen.held.ack", "screen.held.ackhelp", "screen.held.age", "screen.held.age.one",
    "screen.held.age.today", "screen.held.archive", "screen.held.archive.filed", "screen.held.archive.notfiled",
    "screen.held.archivefiles", "screen.held.archivemore", "screen.held.asideby", "screen.held.asideempty",
    "screen.held.col", "screen.held.eligibility.undetermined", "screen.held.empty", "screen.held.for",
    "screen.held.forundetermined", "screen.held.from", "screen.held.grade.nocapture", "screen.held.grade.received",
    "screen.held.grade.stated", "screen.held.grade.testimony", "screen.held.grade.ungraded",
    "screen.held.grade.unread", "screen.held.ineligible", "screen.held.ineligible.alone",
    "screen.held.ineligible.contested", "screen.held.ineligible.crucial", "screen.held.mitigation",
    "screen.held.mitigationhelp", "screen.held.more", "screen.held.none", "screen.held.noproject",
    "screen.held.project", "screen.held.released", "screen.held.restored", "screen.held.selectfailed",
    "screen.held.setaside", "screen.held.setasidecount", "screen.held.sub", "screen.held.thumb",
    "screen.held.untitled", "screen.held.vouchbad", "screen.held.vouchmissing", "screen.held.waiting",
    "screen.held.withheld", "state.undetermined",
  ]),
  archive: Object.freeze([
    "act.archivelist.label.archive", "act.gradenote.label.archive", "act.heldsetaside.label.archive",
    "act.release.label.archive", "mark.gap.refused.means", "mark.gap.refused.name", "refusal.CRUCIAL_IN_BATCH",
    "refusal.ENTRY_REQUIREMENTS", "screen.archive.alreadyheld", "screen.archive.col", "screen.archive.empty",
    "screen.archive.facts", "screen.archive.facts.entries", "screen.archive.filed", "screen.archive.filedunseen",
    "screen.archive.files", "screen.archive.folder", "screen.archive.gradeabout", "screen.archive.link",
    "screen.archive.lists", "screen.archive.more", "screen.archive.names", "screen.archive.nonote",
    "screen.archive.notopened", "screen.archive.onlynotfiled", "screen.archive.onlynotfiledact",
    "screen.archive.refused.none", "screen.archive.see", "screen.archive.setaside", "screen.archive.sum.filed",
    "screen.archive.sum.folders", "screen.archive.sum.held", "screen.archive.sum.notfiled",
    "screen.archive.ungraded", "screen.archive.waiting", "screen.held.ack", "screen.held.ackhelp",
    "screen.held.mitigation", "screen.held.mitigationhelp", "screen.held.none", "screen.held.released",
    "shell.unavailable.home", "shell.unavailable.nothing.says", "shell.unavailable.nothing.title",
    "state.undetermined",
  ]),
  "open-file": Object.freeze([
    "act.deepercheck.label.open-file", "act.openoriginal.label.open-file", "act.openwithwarning.label.open-file",
    "act.releasescanhold.label.open-file", "act.safeview.label.open-file", "mark.origin.machine.means",
    "mark.origin.machine.name", "screen.open-file.checks", "screen.open-file.checks.none", "screen.open-file.closed",
    "screen.open-file.deeper", "screen.open-file.deeper.about", "screen.open-file.deeper.done",
    "screen.open-file.deeper.queued", "screen.open-file.deeper.running", "screen.open-file.deeper.state",
    "screen.open-file.findings", "screen.open-file.held.about", "screen.open-file.note.at",
    "screen.open-file.note.line", "screen.open-file.opened", "screen.open-file.release.done",
    "screen.open-file.release.pending", "screen.open-file.risk.held", "screen.open-file.risk.held.means",
    "screen.open-file.risk.high", "screen.open-file.risk.high.means", "screen.open-file.risk.low",
    "screen.open-file.risk.low.means", "screen.open-file.safe", "screen.open-file.safe.about",
    "screen.open-file.safe.cell", "screen.open-file.safe.cite", "screen.open-file.safe.origin",
    "screen.open-file.safe.pages", "screen.open-file.safe.ready", "screen.open-file.safe.sheet",
    "screen.open-file.safe.truncated", "screen.open-file.safe.value", "screen.open-file.status",
    "screen.open-file.status.held", "screen.open-file.status.line", "screen.open-file.status.overdue",
    "screen.open-file.status.queued", "screen.open-file.warn", "screen.open-file.warn.both",
    "screen.open-file.warn.confirm", "screen.open-file.warn.device", "screen.open-file.warn.ends",
    "screen.open-file.warn.macros", "screen.open-file.warn.notoffered", "screen.open-file.warn.title",
    "screen.open-file.weekly", "screen.open-file.why", "shell.unavailable.home", "shell.unavailable.nothing.says",
    "shell.unavailable.nothing.title",
  ]),
  inbox: Object.freeze([
    "act.inboxpull.label.inbox", "act.inboxresolve.label.inbox", "act.sourcelink.label.inbox",
    "screen.inbox.discarded", "screen.inbox.empty", "screen.inbox.existed", "screen.inbox.knock",
    "screen.inbox.ladder", "screen.inbox.ladder.basis", "screen.inbox.ladder.group", "screen.inbox.ladder.partly",
    "screen.inbox.ladder.public", "screen.inbox.ladder.same", "screen.inbox.ladder.unknown",
    "screen.inbox.link.choice", "screen.inbox.link.done", "screen.inbox.link.evidence", "screen.inbox.link.missing",
    "screen.inbox.link.none", "screen.inbox.link.nosource", "screen.inbox.link.samechoice", "screen.inbox.link.to",
    "screen.inbox.nonote", "screen.inbox.note", "screen.inbox.pulled", "screen.inbox.refusal.RESOLVE_NO_REASON",
    "screen.inbox.resolved", "screen.inbox.same", "screen.inbox.source", "screen.inbox.status.discarded",
    "screen.inbox.status.new", "screen.inbox.status.pulled", "screen.inbox.sub", "state.loading",
  ]),
});

export const SCREENS = Object.freeze([CAPTURE_SCREEN, HELD_SCREEN, ARCHIVE_SCREEN, OPEN_FILE_SCREEN, INBOX_SCREEN]
  .map((s) => Object.freeze({ ...s, words: SCREEN_KEYS[s.id] })));
