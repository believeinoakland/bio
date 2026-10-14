/* screens-daily (T46-57, T47-60; N897 (1), N972; DEC-110, DEC-131, DEC-139, DEC-164, DEC-198, DEC-201, DEC-212; N698's screen
   part): where a member starts and works each day. The registry screens `home`, `projects`, `queue`, `finder`, `find-in`
   and `answers`, built to interface-shell R21's screen
   contract: each `{id, reads, render, acts, words}`, every function self-contained, every read and act an op through the
   shell. Pure: this module reads no table and writes nothing. */
import { SCREEN_WORDS } from "./words.mjs";
import { home } from "./home.mjs";
import { projects } from "./projects.mjs";
import { queue } from "./queue.mjs";
import { finder } from "./finder.mjs";
import { findIn } from "./find-in.mjs";
import { answers } from "./answers.mjs";

export { SCREEN_WORDS };

// The `WORD_ROWS` keys (setup-words R5, at 3f40899950) each screen draws, beside its own rows.
const SHARED = ["state.loading", "state.empty", "state.failed", "state.undetermined"];
const DOORS = ["problem", "person", "money", "read", "tip"];
const QUEUE_KINDS = ["question-find", "step-later-found", "step-date-due", "step-reminder", "step-cost-shared", "step-cost-message",
  "milestone-overdue", "milestone-reminder", "project-quiet", "review-comment-left-out", "action-clock-overdue.ours",
  "action-clock-overdue.theirs", "member-left-items", "watch-keep-or-stop", "plan-review-due", "plan-look-again",
  "litigation-hold.docket"];
const MARKS = (kinds) => kinds.flatMap((k) => [`mark.${k}.name`, `mark.${k}.means`]);
const WORDS_FROM = {
  home: [...SHARED, "screen.home.name", "screen.home.purpose", "act.promote.label.home", "act.promote.does",
    "act.startfrom.label.home", "act.startfrom.does", "door.front.head", "door.front.intro", "door.front.matching", "door.front.blank",
    ...DOORS.flatMap((k) => [`door.front.${k}.name`, `door.front.${k}.hint`]),
    ...MARKS(["kind.todo", "kind.noticed", "kind.status"]), "mark.due.means"],
  queue: [...SHARED, "screen.queue.name", "screen.queue.purpose", ...MARKS(["kind.todo", "kind.noticed", "kind.status", "origin.accepted"]),
    "mark.due.means", "mark.hint.label", "mark.hint.means",
    ...["taskresolve", "taskforward", "proposedispose", "queuesnooze", "queuemute", "adoptversion", "keepversion", "reminderanswer", "promote",
      "projectkeyset", "exploreapprove", "actionmove"].flatMap((op) => [`act.${op}.label.queue`, `act.${op}.does`]),
    ...QUEUE_KINDS.flatMap((k) => [`queue.${k}.summary`, `queue.${k}.detail`]).filter((k) => k !== "queue.step-cost-shared.detail")],
  projects: [...SHARED, "screen.projects.name", "screen.projects.purpose", "act.promote.label.projects", "act.promote.does"],
  finder: [...SHARED, "screen.finder.name", "screen.finder.purpose", "mark.origin.search.name", "mark.gap.nobody.name", "mark.gap.nobody.means",
    ...["search", "select", "findin", "selectionrelease", "frontier", "calculationcreate"].flatMap((op) => [`act.${op}.label.finder`, `act.${op}.does`])],
  "find-in": [...SHARED, "screen.find-in.name", "screen.find-in.purpose", "mark.origin.search.name", "mark.origin.accepted.name", "mark.origin.accepted.means",
    ...["findin", "standingquestionset", "recordpersonfact", "recorddatedfact", "standarddeclare", "recordfact", "tabledeclare", "cite", "search"]
      .flatMap((op) => [`act.${op}.label.find-in`, `act.${op}.does`])],
  answers: [...SHARED, "screen.answers.name", "screen.answers.purpose", "screen.finder.words", "screen.finder.none", "mark.origin.search.name",
    "act.ask.label.answers", "act.ask.does", "act.ruleanswer.label.answers", "act.ruleanswer.does", "act.search.label.answers", "act.search.label.finder", "act.search.does",
    "act.standingquestionset.label.answers", "act.standingquestionset.does", "act.standingquestionend.label.answers", "act.standingquestionend.does",
    "ai.refused.limit", "ai.refused.off", "ai.refused.projectkeptaway", "ai.refused.signinnotconnected"],
};
// Each screen's own rows: its `screen.<id>.*` rows, and the shared-key rows it draws (interface-shell R5).
const OWN_SHARED = {
  queue: ["queue.step-cost-shared.detail"],
  finder: ["mark.origin.search.means"],
  "find-in": ["mark.origin.search.means"],
  answers: ["mark.origin.search.means", "ai.refused.limit.unjudged", "ai.label.untested", "screen.finder.words", "screen.finder.none", "screen.finder.wordsfirst"],
};
const wordsOf = (id) => {
  const own = SCREEN_WORDS.filter((r) => r[0].startsWith(`screen.${id}.`) || (OWN_SHARED[id] || []).includes(r[0]));
  const ownKeys = new Set(own.map((r) => r[0]));
  return Object.freeze([...WORDS_FROM[id].filter((k) => !ownKeys.has(k)), ...own]);
};

/** The six screens, in the registry's order of the rail (Home, Projects, Queue, Find, Find in this, Ask). */
export const SCREENS = Object.freeze([home, projects, queue, finder, findIn, answers].map((s) => Object.freeze({ ...s, words: wordsOf(s.id) })));
