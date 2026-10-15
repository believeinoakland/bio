/* screens-daily (T46-57, T47-60, T48-72, T49-24; N897 (1), N972, N847, N1036, N1047; DEC-110, DEC-131, DEC-139, DEC-164,
   DEC-198, DEC-201, DEC-212, DEC-218, DEC-219, DEC-226, DEC-227, DEC-228, DEC-257, DEC-258; N698's screen part): where a member
   starts and works each day. The registry screens `home`, `elsewhere`, `projects`, `queue`, `finder`, `find-in` and `answers`,
   built to interface-shell R21's screen contract: each `{id, reads, render, acts, words}`, every function self-contained,
   every read and act an op through the shell. Pure: this module reads no table and writes nothing. It holds no member-facing
   English (R34, K3366): each screen's `words` are the keys of the word list it draws, and the shell reads each through
   `setup-words`. */
import { home } from "./home.mjs";
import { elsewhere } from "./elsewhere.mjs";
import { projects } from "./projects.mjs";
import { queue } from "./queue.mjs";
import { finder } from "./finder.mjs";
import { findIn } from "./find-in.mjs";
import { answers } from "./answers.mjs";

// The keys each screen draws, by family. The first three states are every screen's.
const SHARED = ["state.loading", "state.empty", "state.failed", "state.undetermined"];
const DOORS = ["problem", "person", "money", "read", "tip", "elsewhere"];
// The queue's keyed kinds (`queue.<kind>.summary` and `.detail`), the same for Home and the queue (`item-words.mjs`).
const QUEUE_KINDS = ["question-find", "step-later-found", "step-date-due", "step-reminder", "step-cost-shared", "step-cost-message",
  "milestone-overdue", "milestone-reminder", "project-quiet", "review-comment-left-out", "action-clock-overdue.ours",
  "action-clock-overdue.theirs", "member-left-items", "watch-keep-or-stop", "plan-review-due", "plan-look-again",
  "litigation-hold.docket"];
// DEC-227's order of the kinds of places `elsewhere` lists (R15).
const ELSEWHERE_KINDS = ["legalaid", "selfhelp", "service", "agency", "representative", "tipline"];
const MARKS = (kinds) => kinds.flatMap((k) => [`mark.${k}.name`, `mark.${k}.means`]);
const ACTS = (screen, ops) => ops.flatMap((op) => [`act.${op}.label.${screen}`, `act.${op}.does`]);
const KEYED_QUEUE = QUEUE_KINDS.flatMap((k) => [`queue.${k}.summary`, `queue.${k}.detail`]);
// R22: the source notices, one item of each kind with its count; R28: a subject with no title; R31: a reply not recorded.
const SOURCES = ["queue.source-modified.one", "queue.source-modified.many", "queue.source-removed.one", "queue.source-removed.many",
  "queue.source.detail", "queue.source.untitled"];
const PROJECT_ROWS = (w) => [`${w}.questions.one`, `${w}.questions.many`, `${w}.owner`, `${w}.owner.none`, `${w}.lastchange`, `${w}.lastchange.none`,
  `${w}.truncated`, `${w}.stage.means`, `${w}.stage.none`, ...["forming", "investigating", "matured", "closed"].map((s) => `${w}.stage.${s}`),
  "member.founder.unnamed", "shell.glance.busy", "shell.glance.steady", "shell.glance.quiet"];
// R25, R30: "Start a project".
const START = ["project.start.title", "project.start.title.help", "project.start.go", "project.visibility.title", "project.visibility.start.hidden",
  "project.visibility.start.discoverable", "project.visibility.start.later"];

const WORDS_OF = {
  home: [...SHARED, "screen.home.name", "screen.home.purpose", "shell.group.unnamed", ...ACTS("home", ["promote", "startfrom", "taskresolve", "adoptversion", "keepversion"]),
    "act.projectjoin.label.home", "act.projectjoin.does",
    "door.front.head", "door.front.intro", "door.front.matching", "door.front.blank", ...DOORS.flatMap((k) => [`door.front.${k}.name`, `door.front.${k}.hint`]),
    ...MARKS(["kind.todo", "kind.noticed", "kind.status"]), "mark.due.means", "home.update.ready", "home.update.security", "queue.update.see",
    ...SOURCES, "home.first.name", ...KEYED_QUEUE, "action.noreply.title", "queue.step-cost-shared.detail",
    ...START, "file.trigger.home", "screen.home.title.needed",
    "screen.home.script", "screen.home.words", "screen.home.wordsfirst", "screen.home.ready", "screen.home.nothingyet", "screen.home.invite", "screen.home.saywho",
    "screen.home.strip.you", "screen.home.strip.group", "screen.home.needsyou", "screen.home.needsyou.holds", "screen.home.needsgroup", "screen.home.needsgroup.holds",
    "screen.home.open", "screen.home.why", "screen.home.fieldfirst", "screen.home.move.admin", "screen.home.move.member", "screen.home.move.anyone",
    "screen.home.areas", "screen.home.areas.holds", ...["investigation", "action", "members", "administration"].map((a) => `screen.home.area.${a}`),
    "screen.home.area.need.one", "screen.home.area.need.many",
    ...["project", "projects", "question", "questions", "ours", "group", "member", "members", "admin", "admins", "invited", "release"].map((r) => `screen.home.rd.${r}`),
    "screen.home.line.lastchange", "screen.home.line.places", "screen.home.line.languages", "screen.home.line.aiused", "screen.home.line.ailimit",
    "screen.home.projects", "screen.home.since", "screen.home.since.holds", "screen.home.since.changed", ...PROJECT_ROWS("screen.home")],
  elsewhere: [...SHARED, "screen.elsewhere.name", "screen.elsewhere.purpose", "elsewhere.title", "elsewhere.says", "elsewhere.records_nothing",
    ...ELSEWHERE_KINDS.flatMap((k) => [`elsewhere.kind.${k}`, `elsewhere.kind.${k}_says`]), ...["phone", "web", "email", "address", "mail"].map((h) => `elsewhere.reach.${h}`),
    "elsewhere.source", "elsewhere.none.head", "elsewhere.none.says", "elsewhere.none.noplace", "elsewhere.danger", "elsewhere.back"],
  queue: [...SHARED, "screen.queue.name", "screen.queue.purpose", ...MARKS(["kind.todo", "kind.noticed", "kind.status", "origin.accepted"]),
    "mark.due.means", "mark.hint.label", "mark.hint.means",
    ...ACTS("queue", ["taskresolve", "taskforward", "proposedispose", "queuesnooze", "queuemute", "adoptversion", "keepversion", "reminderanswer", "promote",
      "projectkeyset", "exploreapprove", "actionmove"]),
    ...KEYED_QUEUE, "action.noreply.title", ...SOURCES, "file.trigger.queue",
    "queue.update.section", "queue.update.section_says", "queue.update.ready", "queue.update.see", "updates.ready.security", "updates.ready.security_says",
    "act.owed_updatelater.label.queue", "act.owed_updatelater.does",
    "screen.queue.count.one", "screen.queue.count.many", "screen.queue.grouped", "screen.queue.sort", ...["added", "due", "case", "kind"].map((s) => `screen.queue.sort.${s}`),
    "screen.queue.note", "screen.queue.note.once", "screen.queue.nocase", "screen.queue.uptodate", "screen.queue.gohome", "screen.queue.more", "screen.queue.more.one", "screen.queue.open",
    "screen.queue.hint.how", "screen.queue.hint.matched", "screen.queue.hint.method", "screen.queue.hint.trust", "screen.queue.hint.rate", "screen.queue.hint.rate.none",
    "screen.queue.hint.not", "screen.queue.hint.not.text", "screen.queue.forward.to", "screen.queue.snooze.until", "screen.queue.reminder.on", "screen.queue.fieldfirst",
    "screen.queue.why", "screen.queue.question", "screen.queue.projectkey", "screen.queue.unsent.pickup", "screen.queue.unsent.keep", "screen.queue.unsent.drop"],
  projects: [...SHARED, "screen.projects.name", "screen.projects.purpose", "screen.projects.sub", "screen.imported.name", ...ACTS("projects", ["promote", "projectjoin"]),
    "projects.empty.sub", "projects.empty.note", "projects.invited.head", "projects.invited.says", ...START, "file.trigger.projects", "screen.projects.title.needed",
    ...PROJECT_ROWS("screen.projects")],
  finder: [...SHARED, "screen.finder.name", "screen.finder.purpose", "mark.origin.search.name", "mark.origin.search.means", "mark.gap.nobody.name", "mark.gap.nobody.means",
    ...ACTS("finder", ["search", "select", "findin", "selectionrelease", "frontier", "calculationcreate"]),
    "screen.finder.sub", "screen.finder.words", "screen.finder.wordsfirst", "screen.finder.total.one", "screen.finder.total.many", "screen.finder.noresult",
    "screen.finder.covers", "screen.finder.captureit", "screen.finder.widen", "screen.finder.pick", "screen.finder.held.one", "screen.finder.held.many",
    "screen.finder.until", "screen.finder.nobody", "screen.finder.nobody.one", "screen.finder.nobody.none", "screen.finder.count.question", "screen.finder.count.from", "screen.finder.count.to",
    "screen.finder.counted", "screen.finder.pickfirst", "screen.finder.holdfirst"],
  "find-in": [...SHARED, "screen.find-in.name", "screen.find-in.purpose", "mark.origin.search.name", "mark.origin.search.means", "mark.origin.accepted.name", "mark.origin.accepted.means",
    ...ACTS("find-in", ["findin", "standingquestionset", "recordpersonfact", "recorddatedfact", "standarddeclare", "recordfact", "tabledeclare", "cite", "search"]),
    "shell.unavailable.nothing.title", "shell.unavailable.home", "screen.findin.cite.supports", "screen.findin.cite.against", "screen.findin.cite.norole",
    "screen.find-in.sub", "screen.find-in.lookin", "screen.find-in.lookin.help", "screen.find-in.scope.document", "screen.find-in.scope.this", "screen.find-in.scope.held", "screen.find-in.scope.project",
    "screen.find-in.scope.none", "screen.find-in.what", ...["people", "money", "dates", "requirements", "events", "term"].map((k) => `screen.find-in.kind.${k}`),
    "screen.find-in.term", "screen.find-in.term.help", "screen.find-in.question", "screen.find-in.question.help", "screen.find-in.question.none",
    "screen.find-in.kindsfirst", "screen.find-in.termfirst", "screen.find-in.section", "screen.find-in.termsection", "screen.find-in.nothing", "screen.find-in.notread", "screen.find-in.notread.one",
    "screen.find-in.quote", "screen.find-in.passage", "screen.find-in.recorded", "screen.find-in.note", "screen.find-in.questionfirst", "screen.find-in.keeping",
    ...["kind", "value", "date", "cite", "issuer", "reason", "amount", "currency", "phase", "from", "to", "header"].map((f) => `screen.find-in.field.${f}`)],
  answers: [...SHARED, "screen.answers.name", "screen.answers.purpose", "screen.finder.words", "screen.finder.none", "screen.finder.wordsfirst", "mark.origin.search.name", "mark.origin.search.means",
    ...ACTS("answers", ["ask", "ruleanswer", "search", "standingquestionset", "standingquestionend"]), "act.search.label.finder",
    "ai.refused.limit", "ai.refused.limit.unjudged", "ai.refused.off", "ai.refused.projectkeptaway", "ai.refused.signinnotconnected", "refusal.ANSWER_MALFORMED",
    "ai.label.untested", "screen.answers.sub", "screen.answers.question", "screen.answers.questionfirst", "screen.answers.machine", "screen.answers.asread",
    "screen.answers.holdings", "screen.answers.looks", "screen.answers.look", ...["document", "content", "meaning", "internet"].map((l) => `screen.answers.level.${l}`),
    ...["LOOKED_FOUND", "LOOKED_ABSENT", "NOT_LOOKED", "other"].map((s) => `screen.answers.state.${s}`), "screen.answers.withheld", "screen.answers.withheld.one", "screen.answers.notestablished",
    "screen.answers.legal", "screen.answers.offtitle", "screen.answers.offsub", "screen.answers.rule.value", "screen.answers.rule.basis", "screen.answers.rule.notheld",
    ...["legal_information", "procedural_fact", "computed_fact"].map((l) => `screen.answers.label.${l}`), "screen.answers.refused.off", "screen.answers.refused.notdeployed",
    "screen.answers.keeping", "screen.answers.kept", "screen.answers.cadence.weekly"],
};

/** The seven screens, in the registry's order of the rail (Home and its Where else to go, Projects, Queue, Find, Find in
    this, Ask). */
export const SCREENS = Object.freeze([home, elsewhere, projects, queue, finder, findIn, answers]
  .map((s) => Object.freeze({ ...s, words: Object.freeze([...new Set(WORDS_OF[s.id])]) })));
