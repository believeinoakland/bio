/* screens-entry R21 (K3366, K3368; DEC-257, DEC-258): the keys this module reads, and no English. Every sentence its
   screens draw is the interface's word list (`setup-words` `WORD_ROWS`, generated from the design stream's
   `words.json`), drawn by key through the shell's `w` and read in node through `setup-words` `word(key, vars)`. The
   lists are `words-reads.json`'s `reads` for this module with every key a requirement here names (R16–R20); a sentence
   no key holds is a REPORT to BOB, never English here. DEC-256 retired `screen.forgot.handle.help` and
   `screen.setup.taken`, and DEC-230 withdrew `signin.founderhint`: none is read. */

export const STATES = Object.freeze(["state.loading", "state.empty", "state.failed"]);

/* shared by the screens */
export const PASSWORDS = Object.freeze(["screen.entry.password", "screen.entry.newpassword", "screen.entry.again",
  "screen.entry.twelve", "screen.entry.differ", "screen.entry.short"]);
export const CODES = Object.freeze(["screen.entry.codes.heading", "screen.entry.codes.what", "screen.entry.codes.none",
  "screen.entry.codes.list", "screen.entry.codes.save", "screen.entry.codes.copy"]);
/* R17, R18: the handle a founder chooses, and the four refusals of it */
export const HANDLE_REFUSALS = Object.freeze(["refusal.NO_HANDLE", "refusal.BAD_HANDLE", "refusal.HANDLE_TAKEN", "refusal.HANDLE_FIXED"]);

/* R4, R6: instance-setup's `HOSTING_CONTROL` (setup's) and `FORGOT_HELP` (forgot's), keyed by the design stream */
export const HOSTING_KEYS = Object.freeze(["screen.hosting.heading", "screen.hosting.s1", "screen.hosting.s2", "screen.hosting.s3",
  "screen.hosting.s4", "screen.hosting.s5", "screen.hosting.guide"]);
export const HELP_KEYS = Object.freeze(["screen.forgot.help.heading", "screen.forgot.help.s1", "screen.forgot.help.s2"]);

const labels = (screen, ops) => ops.flatMap((op) => [`act.${op}.label.${screen}`, `act.${op}.does`]);

/** Per screen, every key it reads (interface-shell R5, R21). */
export const READS = Object.freeze({
  front: Object.freeze([...STATES, "screen.front.name", "screen.front.purpose",
    ...["published", "edition", "edition.nosigner", "untitled", "doorbell", "doorbell.what", "doorbell.go", "how", "how.what", "how.go",
      "members", "handle", "device", "incomplete", "forgot", "notmember", "welcomeback", "notyou", "other", "nopassword"].map((k) => "screen.front." + k),
    "screen.entry.uses", "screen.entry.group", "screen.entry.logo", "screen.entry.password", "signin.handle.help",
    "session.keep", "session.shared", "session.signedout", "session.ended", "session.locked",
    "refusal.SIGN_IN_REFUSED", "refusal.SIGN_IN_PAUSED", ...labels("front", ["login", "unlock"])]),
  tour: Object.freeze(["screen.tour.name", "screen.tour.purpose", "screen.tour.step", "screen.tour.back", "screen.tour.next",
    "screen.tour.stop", "screen.tour.end", "screen.tour.nothing", "screen.tour.doorbell",
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => [`screen.tour.step${n}.title`, `screen.tour.step${n}.body`])]),
  forgot: Object.freeze([...STATES, "screen.forgot.name", "screen.forgot.purpose",
    ...["lede", "codes", "code", "code.help", "incomplete", "done", "done.last", "admin", "admin.what"].map((k) => "screen.forgot." + k),
    ...HELP_KEYS, ...PASSWORDS, "screen.front.handle", "forgot.handle.help", "screen.entry.signin",
    "refusal.RECOVERY_REFUSED", "refusal.PASSWORD_TOO_SHORT", "refusal.SIGN_IN_PAUSED", ...labels("forgot", ["recover"])]),
  reset: Object.freeze([...STATES, "screen.reset.name", "screen.reset.purpose",
    ...["for", "forhandle", "keeps", "done", "dead", "dead.what"].map((k) => "screen.reset." + k),
    ...PASSWORDS, "screen.entry.signin", "screen.entry.backtofront", "refusal.PASSWORD_TOO_SHORT", ...labels("reset", ["passwordreset"])]),
  setup: Object.freeze([...STATES, "screen.setup.name", "screen.setup.purpose",
    ...["lede", "steps", "step.claim", "step.name", "step.places", "step.offices", "step.assistant", "step.court", "step.hosting",
      "step.admins", "step.security", "step.done", "claim", "otp", "otp.help", "handle", "handle.help", "own", "own.help", "again.help",
      "nootp", "claimed", "claimed.nosignin", "unarmed",
      "name", "name.field", "name.help", "name.now", "name.empty", "domain", "domain.help", "domain.empty", "domain.verified",
      "places", "places.now", "places.none", "places.choose", "places.help", "place.wanted", "place.wanted.help", "place.wanted.now", "place.empty",
      "offices", "offices.what", "office.field", "office.note", "office.empty", "office.added",
      "assistant", "assistant.what", "assistant.own", "assistant.paid", "keepaway", "keepaway.on", "keepaway.why", "keepaway.help",
      "keepaway.noreason", "key", "key.help", "key.nokey", "key.held", "key.on", "key.off", "key.switchon", "key.switchoff",
      "limit", "limit.help", "limit.bad", "limit.set",
      "court", "court.what", "court.legend", "court.tell", "court.dont", "court.pick", "court.now.tell", "court.now.dont",
      "hosting", "hosting.field", "hosting.note", "hosting.empty", "hosting.now",
      "admins", "admins.what", "admins.id", "admins.id.help", "admins.cover", "admins.incomplete", "admins.shown",
      "security", "security.what", "security.scanner", "security.field", "security.keep", "security.missing", "security.nopick",
      "security.passed", "security.failed", "security.held", "finished", "finished.what", "finished.go"].map((k) => "screen.setup." + k),
    ...HOSTING_KEYS, ...PASSWORDS, ...CODES, "screen.entry.signin", "screen.entry.backtofront", "screen.entry.group",
    /* R17, R18: the founder's handle; R19: a reader who is not the founder; R20: the codes, and state c */
    ...HANDLE_REFUSALS, "founder.handle.title", "founder.handle.says", "founder.handle.choose", "founder.handle.later",
    "founder.handle.later.help", "founder.handle.done",
    "setup.member.heading", "setup.member.sub", "setup.member.home",
    "setup.codes.once", "setup.codes.copy", "setup.codes.save", "setup.claimed.heading", "setup.claimed.sub", "refusal.ALREADY_CLAIMED",
    ...labels("setup", ["claim", "recoverycodesissue", "groupnameset", "groupdomainset", "profilesset", "placewanted", "officesseed",
      "entitycreate", "aikeepaway", "groupkeyset", "groupkeyswitch", "ailimitset", "courtnoticeset", "hostingaccessset", "memberadd",
      "securitytooladd"])]),
  join: Object.freeze([...STATES, "screen.join.name", "screen.join.purpose",
    ...["invited", "invited.as", "link", "link.what", "cover", "cover.help", "cover.empty", "dead", "dead.what", "language",
      "language.help", "handle", "handle.help", "handle.taken", "handle.empty", "codes.after", "joined", "joined.nosignin", "home",
      "member", "member.go"].map((k) => "screen.join." + k),
    ...PASSWORDS, ...CODES, "screen.entry.group", "screen.entry.signin",
    "handle.free", "handle.taken", "handle.characters", "handle.fixed", "handle.refused.paused", "refusal.JOIN_LINK_DAILY_CAP",
    "refusal.PASSWORD_TOO_SHORT", ...labels("join", ["invitelook", "memberlanguageset", "handlecheck", "enroll", "joinlinkinvite"])]),
});
