/* screens-settings (T46-55; N897 (1), (3); K2147): the settings a member and an administrator use day to day, as
   screens of the member interface: `members`, `account`, `connect` and `notes` (registry screens, DEC-139), with the AI
   account panel drawn once for the group's key and the member's own (R9); since T47, `group-identity`, `security` and
   `translations` (R14–R16), and the settings index and the sections the setup page held, `settings`, `group`, `places`
   and `recovery` (R17–R20). Pure: every read and act is an op the plane
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
import { settings } from "./settings.mjs";
import { group } from "./group.mjs";
import { places } from "./places.mjs";
import { recovery } from "./recovery.mjs";
import { identity } from "./identity.mjs";
import { security } from "./security.mjs";
import { translations } from "./translations.mjs";
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
  members: [...STATES, "screen.members.name", ...own("screen.members."), ...PANEL, "ai.whopays", "screen.group.name", "screen.places.name", "screen.recovery.name",
    ...LABELS("members", ["memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "invitewithdraw",
      "websitekeycreate", "joinlinkenable", "groupkeyset", "groupkeyswitch", "accountusesset", "ailimitset", "groupkeyremove", "aikeepaway", "signerset"]),
    "act.owed_passwordresetlink.label.members"],
  account: [...STATES, "screen.account.name", ...own("screen.account."), "handle.fixed", "level.prompt.name", "level.pause.name", "signing.ceremony.keepkey",
    "screen.connect.name", "screen.notes.name",
    ...LABELS("account", ["expertisedeclare", "setpassword", "signerregisterown", "signerrevokeown", "memberlanguageset", "infolevelset", "signout", "signouteverywhere"])],
  connect: [...STATES, "screen.connect.name", ...own("screen.connect."), "screen.members.founder", ...PANEL, "ai.whopays", "mark.outward.means",
    "instance.part.signin.absent", "instance.part.unknown",
    ...["NO_SIGNIN_WAITING", "SIGNIN_REFUSED", "SIGNIN_UNAVAILABLE", "SIGNIN_ADDRESS_UNEXPECTED", "AGENT_WORKER_UNBOUND", "DISCLOSURE_DUE"].map((c) => "refusal." + c),
    ...LABELS("connect", ["groupkeynoticeseen", "disclosureshown", "subscriptionsignin", "accountreferenceset", "accountusesset", "ailimitset", "accountreferenceremove", "subscriptiondisconnect"])],
  notes: [...STATES, "screen.notes.name", ...own("screen.notes."), "ai.label.untested",
    ...LABELS("notes", ["notewrite", "noteturn", "noterevise", "notedelete", "writinghelp"])],
  settings: [...STATES, ...own("screen.settings."), ...["settings", "account", "connect", "ties", "notes", "recovery", "group", "group-identity", "members", "places", "security", "translations", "wizards"]
    .flatMap((id) => [`screen.${id}.name`, `screen.${id}.purpose`])],
  group: [...STATES, "screen.group.name", ...own("screen.group."),
    ...LABELS("group", ["groupnameset", "grouplogoset", "groupdomainset", "grouplanguagesset", "courtnoticeset", "hostingaccessset", "strengthbarset"])],
  places: [...STATES, "screen.places.name", ...own("screen.places."), ...LABELS("places", ["profilesset", "placewanted", "officesseed", "entitycreate"])],
  recovery: [...STATES, "screen.recovery.name", ...own("screen.recovery."), "screen.members.recovery.one", "screen.members.recovery.many", "screen.members.recovery.add",
    ...LABELS("recovery", ["recoverycodesissue"])],
  "group-identity": [...STATES, "screen.group-identity.name", ...own("screen.group-identity."), "ai.label.untested",
    ...LABELS("group-identity", ["groupdescriptionset", "groupdescriptiondraft"])],
  security: [...STATES, "screen.security.name", ...own("screen.security."), "instance.part.scanner.present", "instance.part.scanner.absent",
    "instance.part.safeview.present", "instance.part.safeview.absent", "instance.part.unknown", "instance.scanner.absent.step",
    ...LABELS("security", ["securitymap", "securitytooladd", "securitytooltest", "securitytoolremove"])],
  translations: [...STATES, "screen.translations.name", ...own("screen.translations."),
    ...LABELS("translations", ["translationdraft", "translationadopt", "translationgrant", "translationconfirm", "translationrevert"])],
};

const PARTS = Object.freeze({ aiPanel, aiPanelSend });
const freeze = (s) => Object.freeze({
  ...s,
  acts: Object.freeze(s.acts.map((a) => Object.freeze({ ...a }))),
  // a key of this module's own words is given as its row (interface-shell R21 (1)), any other as its key
  words: Object.freeze([...new Set(WORDS[s.id])].map((k) => (ROW.has(k) ? ROW.get(k) : k))),
  parts: PARTS,
});

export const SCREENS = Object.freeze([settings, members, account, connect, notes, group, identity, places, recovery, security, translations].map(freeze));
