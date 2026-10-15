/* screens-action (T47-64; N897 (1); BIO_Action_v0_2.md rules 1–3, 6, 15, 18–21; DEC-89, DEC-113, DEC-115, DEC-194,
   DEC-209, DEC-212): the Action layer's working screens. The registry screens `plan`, `start-send`, `request`, `action`,
   `matter` and `help-records`, built to interface-shell R21's screen contract: each `{id, reads, render, acts, words}`,
   every function self-contained, every read and act an op through the shell. The member decides and sends; the group's
   Civicsmith proposes, prepares and records, and sends nothing. Pure: this module reads no table and writes nothing. */
import { SCREEN_WORDS } from "./words.mjs";
import { plan } from "./plan.mjs";
import { startSend } from "./start-send.mjs";
import { request } from "./request.mjs";
import { action } from "./action.mjs";
import { matter } from "./matter.mjs";
import { helpRecords } from "./help-records.mjs";

export { SCREEN_WORDS };

// The keys each screen draws beside its acts' labels and explanations (R19: keys only, read through `setup-words`).
const SHARED = ["state.loading", "state.empty", "state.failed", "shell.unread"];
const EXTRA = {
  plan: ["plan.offer.document", "plan.offer.document.means", "plan.offer.chancetofix", "plan.offer.chancetofix.means",
    "plan.offer.chancetofix.again", "plan.close.lessons", "mark.due.means"],
  "start-send": [],
  request: ["screen.help-records.name"],
  action: ["mark.due.means", "law.title", "law.help", "law.stated", "law.undetermined", "law.change", "law.proposed", "law.proposal.not", "law.propose",
    "risk.title", "risk.help", "risk.tier", "risk.tier.1", "risk.tier.2", "risk.tier.3", "risk.tier.undetermined", "risk.set", "risk.revise", "risk.proposed",
    "risk.proposal", "risk.proposal.not"],
  matter: [],
  "help-records": [],
};
// Keys a screen draws under another screen's prefix (one sentence, one key, wherever it is drawn).
const BORROWS = {
  plan: ["screen.matter.stage."],
  "start-send": ["screen.plan.support.", "screen.request.", "screen.start-send."],
  request: ["screen.start-send."],
  action: ["screen.plan.actionstate.", "screen.request.holder", "screen.request.level", "screen.request.window.", "screen.request.law"],
  "help-records": ["screen.request.window."],
};
const SHARED_OWN = { plan: ["act.plansubjectadd.label.plan", "act.plansubjectadd.does", "act.planask.does"], "start-send": ["act.filingrecordsent.does"], request: ["act.filingrecordsent.does"] };

const wordsOf = (s) => {
  const id = s.id;
  const own = SCREEN_WORDS.filter((k) => k.startsWith(`screen.${id}.`) || (BORROWS[id] || []).some((p) => k.startsWith(p))
    || (SHARED_OWN[id] || []).includes(k));
  const acts = s.acts.flatMap((a) => [a.label || `act.${a.op}.label.${id}`, `act.${a.op}.does`]);
  return Object.freeze([...new Set([...SHARED, `screen.${id}.name`, `screen.${id}.purpose`, ...acts, ...EXTRA[id], ...own])]);
};

/** The six screens, in the order a member meets them: the plan, starting and sending, a records request, one action,
 *  one matter, and the records request's help. */
export const SCREENS = Object.freeze([plan, startSend, request, action, matter, helpRecords].map((s) => Object.freeze({ ...s, words: wordsOf(s) })));
