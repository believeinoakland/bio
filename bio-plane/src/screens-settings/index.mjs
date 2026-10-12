/* screens-settings (T46-55; N897 (1), (3); K2147): the settings a member and an administrator use day to day, as four
   screens of the member interface: `members`, `account`, `connect` and `notes` (registry screens, DEC-139), with the AI
   account panel drawn once for the group's key and the member's own (R9). Pure: every read and act is an op the plane
   serves, called through `interface-shell`'s screen contract (its R21) and kit; nothing here reads a table, writes, or
   keeps anything in the browser.

   `SCREENS`: per screen `{id, reads, render, acts, words, parts}` as interface-shell R21 states them (K2996, K2998);
   every function self-contained. `words` lists the `WORD_ROWS` keys a screen draws and, as `[key, en, protected]`
   rows, its own (`SCREEN_WORDS`). `parts` holds the AI account panel's functions, handed to `members` and `connect` as
   `view.parts` (J2 (1)). `SCREEN_WORDS`: this module's own words (interface-shell R5). */
import { members } from "./members.mjs";
import { account } from "./account.mjs";
import { connect } from "./connect.mjs";
import { notes } from "./notes.mjs";
import { aiPanel, aiPanelSend } from "./panel.mjs";
import { SCREEN_WORDS } from "./words.mjs";

export { SCREEN_WORDS };

const ROW = new Map(SCREEN_WORDS.map((r) => [r[0], r]));
const own = (...prefixes) => SCREEN_WORDS.filter((r) => prefixes.some((p) => r[0].startsWith(p))).map((r) => r[0]);
const USES = ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore", "suggestions"];
const PANEL = [...own("screen.panel."), ...USES.map((u) => `ai.use.${u}.name`), "ai.explore.no", "ai.explore.ask", "ai.explore.yes",
  "ai.refused.limitinvalid", "ai.refused.unitunavailable", "ai.refused.switchvalue",
  ...["owner", "scope", "unit", "period", "amount", "inclusive", "use", "count"].map((f) => `ai.limitfield.${f}`)];
const STATES = ["state.loading", "state.empty", "state.failed"];
const LABELS = (screen, ops) => ops.flatMap((op) => [`act.${op}.label.${screen}`, `act.${op}.does`]);

/** The words each screen draws: its own rows, and the `WORD_ROWS` keys it reads (interface-shell R5, R21). */
const WORDS = {
  members: [...STATES, "screen.members.name", ...own("screen.members."), ...PANEL, "ai.whopays",
    ...LABELS("members", ["memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "invitewithdraw",
      "websitekeycreate", "joinlinkenable", "groupkeyset", "groupkeyswitch", "accountusesset", "ailimitset", "groupkeyremove", "aikeepaway"])],
  account: [...STATES, "screen.account.name", ...own("screen.account."), "handle.fixed", "level.prompt.name", "level.pause.name",
    "screen.connect.name", "screen.notes.name",
    ...LABELS("account", ["expertisedeclare", "setpassword", "signerregisterown", "signerrevokeown", "memberlanguageset", "owed_infolevelset"])],
  connect: [...STATES, "screen.connect.name", ...own("screen.connect."), "screen.members.founder", ...PANEL, "ai.whopays", "mark.outward.means",
    ...LABELS("connect", ["groupkeynoticeseen", "disclosureshown", "owed_subscriptionsignin", "accountreferenceset", "accountusesset", "ailimitset", "accountreferenceremove"])],
  notes: [...STATES, "screen.notes.name", ...own("screen.notes."), "ai.label.untested",
    ...LABELS("notes", ["notewrite", "noteturn", "noterevise", "notedelete", "writinghelp"])],
};

const PARTS = Object.freeze({ aiPanel, aiPanelSend });
const freeze = (s) => Object.freeze({
  ...s,
  acts: Object.freeze(s.acts.map((a) => Object.freeze({ ...a }))),
  // a key of this module's own words is given as its row (interface-shell R21 (1)), any other as its key
  words: Object.freeze([...new Set(WORDS[s.id])].map((k) => (ROW.has(k) ? ROW.get(k) : k))),
  parts: PARTS,
});

export const SCREENS = Object.freeze([members, account, connect, notes].map(freeze));
