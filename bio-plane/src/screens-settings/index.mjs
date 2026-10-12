/* screens-settings (T46-55; N897 (1), (3); K2147): the settings a member and an administrator use day to day, as four
   screens of the member interface: `members`, `account`, `connect` and `notes` (registry screens, DEC-139), with the AI
   account panel drawn once for the group's key and the member's own (R9). Pure: every read and act is an op the plane
   serves, called through `interface-shell`'s screen contract (its R21) and kit; nothing here reads a table, writes, or
   keeps anything in the browser.

   `SCREENS`: per screen `{id, reads, render, acts, words, parts}`. `reads(ctx)` names the reads (`{name, op, query?,
   body?}`; a read with a body is posted); `render(cs, d, ctx, parts)` draws from each read's outcome; each act is
   `{op, args, rereads, after?, refused?, clears?}`, its `args` answering the request's `{query?, body}` or `{hold}` (a
   word drawn beside the act, nothing sent); `words` the keys the screen draws; `parts` the AI account panel's
   functions. Every function is self-contained (K2854 T1), so the shell can compose the page from its source.
   `SCREEN_WORDS`: this module's own words (interface-shell R5). */
import { members } from "./members.mjs";
import { account } from "./account.mjs";
import { connect } from "./connect.mjs";
import { notes } from "./notes.mjs";
import { aiPanel, aiPanelArgs, aiPanelRefused } from "./panel.mjs";
import { SCREEN_WORDS } from "./words.mjs";

export { SCREEN_WORDS };

const OWN = SCREEN_WORDS.map((r) => r[0]);
const own = (...prefixes) => OWN.filter((k) => prefixes.some((p) => k.startsWith(p)));
const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore", "suggestions"];
const PANEL = [...own("screen.panel."), ...USES.map((u) => `ai.use.${u}.name`), "ai.explore.no", "ai.explore.ask", "ai.explore.yes",
  "ai.refused.limitinvalid", "ai.refused.unitunavailable", "ai.refused.switchvalue",
  ...["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].map((f) => `ai.limitfield.${f}`)];
const STATES = ["state.loading", "state.empty", "state.failed"];
const LABELS = (screen, ops) => ops.map((op) => `act.${op}.label.${screen}`);

/** The words each screen draws: its own rows, and the `WORD_ROWS` keys it reads (interface-shell R5). */
const WORDS = {
  members: [...STATES, "screen.members.name", ...own("screen.members."), ...PANEL, "ai.whopays", "act.aikeepaway.does",
    ...LABELS("members", ["memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "invitewithdraw",
      "websitekeycreate", "joinlinkenable", "groupkeyset", "groupkeyswitch", "accountusesset", "ailimitset", "groupkeyremove", "aikeepaway"])],
  account: [...STATES, "screen.account.name", ...own("screen.account."), "handle.fixed", "act.memberlanguageset.does",
    "level.prompt.name", "level.pause.name", "screen.connect.name", "screen.notes.name",
    ...LABELS("account", ["expertisedeclare", "setpassword", "signerregisterown", "signerrevokeown", "memberlanguageset", "owed_infolevelset"])],
  connect: [...STATES, "screen.connect.name", ...own("screen.connect."), "screen.members.founder", ...PANEL, "ai.whopays", "mark.outward.means",
    "act.owed_subscriptionsignin.does", "act.groupkeyremove.does",
    ...LABELS("connect", ["groupkeynoticeseen", "disclosureshown", "owed_subscriptionsignin", "accountreferenceset", "accountusesset", "ailimitset", "accountreferenceremove"])],
  notes: [...STATES, "screen.notes.name", ...own("screen.notes."), "ai.label.untested",
    ...LABELS("notes", ["notewrite", "noteturn", "noterevise", "notedelete", "writinghelp"])],
};

const PARTS = Object.freeze({ aiPanel, aiPanelArgs, aiPanelRefused });
const screen = (s) => Object.freeze({ ...s, acts: Object.freeze(s.acts.map((a) => Object.freeze({ ...a }))), words: Object.freeze([...new Set(WORDS[s.id])]), parts: PARTS });

export const SCREENS = Object.freeze([members, account, connect, notes].map(screen));
