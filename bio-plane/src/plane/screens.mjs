/* plane R24 (Q1-7; K1430, K1522) and R19 (N528; DEC-120, DEC-121; K1396): the screens registry the plane carries, one
   entry per screen of the interface the plane serves today (`legacy-ui`, `civicos-ui/app.html`, its own `SURFACES`
   registry), `{id, title, acts, purpose}`: `id` the interface's own name for the screen, `title` as the screen shows it,
   `acts` the ops the screen calls (each one `op-declarations` declares; the release suite holds it), and `purpose` one
   plain sentence, the design stream's where it gives one for that screen (`ux-substrate-v2.json` `surfaces[]`),
   otherwise the interface's own. Handed to `answers` for its explain read (`wizard-scripts` is registered with its own
   `SCREEN_REGISTRY`, R19; K1871). The calls
   every screen shares (`login`, `whoami`, `groupidentity`) are not listed per screen. A screen absent here is unknown,
   never guessed; the design stream replaces these entries when its interface ships (K1475). */
const screen = (id, title, acts, purpose) => Object.freeze({ id, title, acts: Object.freeze(acts), purpose });

export const SCREENS = Object.freeze([
  screen("queue", "The queue",
    ["queue", "tasks", "queuemute", "taskresolve", "taskforward", "memberlist", "proposedispose", "allocid", "promote", "affordances"],
    "Everything the record is asking of somebody, in one list, filed under the case it belongs to."),
  screen("record", "Your accountability record", ["list", "search"],
    "The whole record as rows: every bundle your group's Civicsmith holds, with its type and its state."),
  screen("finder", "The evidence finder",
    ["search", "searchfields", "meaningrows", "concerns", "entitybyalias", "select", "selection", "selectionrelease", "cite", "affordances"],
    "One query surface over the record, asking three questions at once and reporting them apart."),
  screen("subjects", "Subjects",
    ["entitybyalias", "entity", "concerns", "connections", "entitycreate", "entityalias", "relationdeclare", "readingname", "resolve",
     "reading", "resolvetestify", "connect", "affordances"],
    "What the record knows about a person, office or thing, and its relations; each match's reported defects."),
  screen("progressions", "Progressions",
    ["progression", "progressiondefine", "entitybyalias", "instance", "concerns", "thread", "discharge"],
    "How something should go, with documents threaded through it and gaps shown."),
  screen("themes", "Themes", ["themeread", "themedeclare", "themeplace"],
    "A member's idea with its test, and the material placed in it."),
  screen("projects", "Projects", ["list"], "The cases this group is building, as rows."),
  screen("review", "Review", ["search", "list", "select", "release"], "What has been collected and not yet vouched for."),
  screen("members", "Members & governance",
    ["memberlist", "adminarith", "signerlist", "memberadd", "memberset", "signeradd", "signerset"],
    "Who holds what in your group's Civicsmith: the roster, each member's capabilities, and the invitations outstanding."),
  screen("add", "Add something new", ["acquire", "allocid", "promote", "attest", "search", "versionchain", "projection", "affordances"],
    "Where a document enters the record from outside it: an address is fetched, the bytes are hashed as they arrive, and "
    + "the address, the instant and the claimed issuer are recorded as three separate claims."),
  screen("bundle", "The document",
    ["image", "projection", "links", "backlinks", "search", "affordances", "entity", "resolutions", "connections", "connectionchoose",
     "captureprogressions", "acquire", "lease", "promote", "select", "release", "dispose", "attest", "cite", "retire", "sever", "reinstate"],
    "One document as the record holds it: the captured bytes, what was extracted from them, what the record made of it, "
    + "and what cites it."),
  screen("inquiry", "The question",
    ["image", "projection", "earnedbasis", "backlinks", "affordances", "search", "publishedcase", "versionnotice", "conclude",
     "basisversions", "inquirystrength", "inquiryground", "partitionindependence", "cite"],
    "A question the record is working on: the legs its basis rests on, how strongly each was established, and what it has "
    + "concluded if it has concluded anything."),
  screen("project", "The project",
    ["image", "projection", "projectparticipants", "backlinks", "search", "casedrafts", "projectownerarith", "projectvisibility",
     "projectvisibilityset", "projectownerremove", "projectjoin", "projectleave", "projectinvite", "projectremove", "projectowneradd",
     "projectownerrescue", "projectfork"],
    "A case's workspace: who is on it, what it holds, how ready its work product is, and what it is waiting on."),
  screen("action", "The action",
    ["image", "projection", "affordances", "actionmove", "actioncorrespond", "actionlaws", "actionrisktier"],
    "Something this group has asked of somebody outside it: the counterparty, the clock, the correspondence and what came back."),
  screen("published", "Case files", ["publishedmanifest", "verify"],
    "The cases your group's Civicsmith has published, readable by somebody holding no credential at all."),
  screen("review-copy", "Review copy", ["reviewcopy", "casedraft", "reviewgrant", "reviewrevoke", "reviewcomment", "statementack"],
    "A draft case shown to chosen reviewers who read, comment and acknowledge."),
  screen("published-case", "A published case", ["publishedcase", "publishedmanifest", "verify"],
    "One published case at one edition, with its account of why it carries no single case-level strength and of what its "
    + "index does and does not resolve."),
  screen("basis-versions", "How this question has been read", ["basisversions", "versionhide", "affordances"],
    "The readings of a question's evidence, each one that has been made, side by side."),
  screen("accept-ceremony", "Acting on one reading",
    ["basisversions", "affordances", "versionaccept", "versionreject", "versionconsider", "versionrevert", "versionstrength",
     "partitionindependence", "airun"],
    "One reading of one question's evidence, acted on: adopted, turned down, set aside with a reason, or put back where "
    + "nobody had acted on it."),
  screen("inquiry-stance", "What this project stands on",
    ["basisversions", "affordances", "versioncurrent", "conclude", "withdrawconclusion"],
    "Which reading a project stands on, and what it concluded on it."),
  screen("ai-session", "An AI session", ["airun"],
    "One running AI session as it runs: that a job is running in this context, the bound it is running under, what it has "
    + "consumed of that bound so far, and which account is paying."),
]);
