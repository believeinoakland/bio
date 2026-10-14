/* screens-entry (T47-86; N999, N1002, N1005; DEC-201 (1), (2), (5), (6), (12); DEC-202 (1)–(4); DEC-205 (5); K3052,
   K3053, K3060 D2, D4, D7, K3061 D3): the screens drawn without a member session, the way in. In the public frame
   `front` (the group's page, with members' sign-in), `tour`, `forgot` and `reset`; in the setup frame `setup` (the
   founder's claim and the group's first settings) and `join` (an invitation or the group's join link). Pure: every read
   and act is an op the plane serves, through `interface-shell`'s screen contract (its R21) and kit; nothing here reads
   a table, writes, or keeps anything in the browser (R8).

   `SCREENS`: per screen `{id, reads, render, acts, words}` as interface-shell R21 states them, every function
   self-contained. `words` lists the `WORD_ROWS` keys a screen draws and, as `[key, en, protected]` rows, its own
   (`SCREEN_WORDS`). */
import { front } from "./front.mjs";
import { tour } from "./tour.mjs";
import { forgot } from "./forgot.mjs";
import { reset } from "./reset.mjs";
import { setup } from "./setup.mjs";
import { join } from "./join.mjs";
import { SCREEN_WORDS, HOSTING_KEYS, HELP_KEYS } from "./words.mjs";

export { SCREEN_WORDS };

const ROW = new Map(SCREEN_WORDS.map((r) => [r[0], r]));
const own = (...prefixes) => SCREEN_WORDS.filter((r) => prefixes.some((p) => r[0].startsWith(p))).map((r) => r[0]);
const STATES = ["state.loading", "state.empty", "state.failed"];
const LABELS = (screen, ops) => ops.flatMap((op) => [`act.${op}.label.${screen}`, `act.${op}.does`]);
const PASSWORDS = ["screen.entry.password", "screen.entry.newpassword", "screen.entry.again", "screen.entry.twelve", "screen.entry.differ", "screen.entry.short"];
const CODES = own("screen.entry.codes.");

/** The words each screen draws: its own rows, and the `WORD_ROWS` keys it reads (interface-shell R5, R21). */
const WORDS = {
  front: [...STATES, "screen.front.name", "screen.front.purpose", ...own("screen.front."), "screen.entry.uses", "screen.entry.group", "screen.entry.logo",
    "screen.entry.password", "signin.founderhint", "session.keep", "session.shared", "session.signedout", "session.ended", "session.locked",
    "refusal.SIGN_IN_REFUSED", "refusal.SIGN_IN_PAUSED", ...LABELS("front", ["login", "unlock"])],
  tour: ["screen.tour.name", "screen.tour.purpose", ...own("screen.tour.")],
  forgot: [...STATES, "screen.forgot.name", "screen.forgot.purpose", ...own("screen.forgot."), ...HELP_KEYS, ...PASSWORDS, "screen.front.handle", "screen.entry.signin",
    "refusal.RECOVERY_REFUSED", "refusal.PASSWORD_TOO_SHORT", "refusal.SIGN_IN_PAUSED", ...LABELS("forgot", ["recover"])],
  reset: [...STATES, "screen.reset.name", "screen.reset.purpose", ...own("screen.reset."), ...PASSWORDS, "screen.entry.signin", "screen.entry.backtofront",
    "refusal.PASSWORD_TOO_SHORT", ...LABELS("reset", ["passwordreset"])],
  setup: [...STATES, "screen.setup.name", "screen.setup.purpose", ...own("screen.setup."), ...HOSTING_KEYS, ...PASSWORDS, ...CODES, "screen.entry.signin", "screen.entry.backtofront",
    ...LABELS("setup", ["claim", "recoverycodesissue", "groupnameset", "groupdomainset", "profilesset", "placewanted", "officesseed", "entitycreate",
      "aikeepaway", "groupkeyset", "groupkeyswitch", "ailimitset", "courtnoticeset", "hostingaccessset", "memberadd", "securitytooladd"])],
  join: [...STATES, "screen.join.name", "screen.join.purpose", ...own("screen.join."), ...PASSWORDS, ...CODES, "screen.entry.group", "screen.entry.signin",
    "handle.free", "handle.taken", "handle.characters", "handle.fixed", "handle.refused.paused", "refusal.JOIN_LINK_DAILY_CAP", "refusal.PASSWORD_TOO_SHORT",
    ...LABELS("join", ["invitelook", "memberlanguageset", "handlecheck", "enroll", "joinlinkinvite"])],
};

const freeze = (s) => Object.freeze({
  ...s,
  acts: Object.freeze(s.acts.map((a) => Object.freeze({ ...a }))),
  // a key of this module's own words is given as its row (interface-shell R21 (1)), any other as its key
  words: Object.freeze([...new Set(WORDS[s.id])].map((k) => (ROW.has(k) ? ROW.get(k) : k))),
});

export const SCREENS = Object.freeze([front, tour, forgot, reset, setup, join].map(freeze));
