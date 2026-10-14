/* plane R24 (Q1-7; K1430, K1522) and R19 (N528; DEC-120, DEC-121; K1396): the screens registry the plane carries, one
   entry per screen of the interface the plane serves today (`legacy-ui`, `civicos-ui/app.html`, its own `SURFACES`
   registry), `{id, title, acts, purpose}`: `id` the interface's own name for the screen, `title` as the screen shows it,
   `acts` the ops the screen calls (each one `op-declarations` declares; the release suite holds it), and `purpose` one
   plain sentence, the design stream's where it gives one for that screen (`ux-substrate-v2.json` `surfaces[]`),
   otherwise the interface's own. Handed to `answers` for its explain read (`wizard-scripts` is registered with its own
   `SCREEN_REGISTRY`, R19; K1871). The calls
   every screen shares (`login`, `whoami`, `groupidentity`) are not listed per screen. A screen absent here is unknown,
   never guessed; the design stream replaces these entries when its interface ships (K1475).
   (T49; K3366; R56) A title or purpose the design stream keys is read through `setup-words` `word(key)`, never held as
   English here: the key is the screen's own (`screen.<key>.name`, `screen.<key>.purpose`). A screen with no key keeps its
   interface's own words. */
import { word } from "../setup-words/index.mjs";

const screen = (id, title, acts, purpose) => Object.freeze({ id, title, acts: Object.freeze(acts), purpose });

export const SCREENS = Object.freeze([
  screen("queue", word("screen.queue.name"),
    ["queue", "tasks", "queuemute", "taskresolve", "taskforward", "memberlist", "proposedispose", "allocid", "promote", "affordances"],
    word("screen.queue.purpose")),
  screen("record", "Your accountability record", ["list", "search"],
    "The whole record as rows: every bundle your group's Civicsmith holds, with its type and its state."),
  screen("finder", word("screen.finder.name"),
    ["search", "searchfields", "meaningrows", "concerns", "entitybyalias", "select", "selection", "selectionrelease", "cite", "affordances"],
    word("screen.finder.purpose")),
  screen("subjects", "Subjects",
    ["entitybyalias", "entity", "concerns", "connections", "entitycreate", "entityalias", "relationdeclare", "readingname", "resolve",
     "reading", "resolvetestify", "connect", "affordances"],
    word("screen.people.purpose")),
  screen("progressions", "Progressions",
    ["progression", "progressiondefine", "entitybyalias", "instance", "concerns", "thread", "discharge"],
    "How something should go, with documents threaded through it and gaps shown."),
  screen("themes", "Themes", ["themeread", "themedeclare", "themeplace"],
    word("screen.theme.purpose")),
  screen("projects", "Projects", ["list"], word("screen.projects.purpose")),
  screen("review", "Review", ["search", "list", "select", "release"], word("screen.held.purpose")),
  screen("members", word("screen.members.name"),
    ["memberlist", "adminarith", "signerlist", "memberadd", "memberset", "signeradd", "signerset"],
    word("screen.members.purpose")),
  screen("add", word("screen.capture.name"), ["acquire", "allocid", "promote", "attest", "search", "versionchain", "projection", "affordances"],
    word("screen.capture.purpose")),
  screen("bundle", word("screen.document.name"),
    ["image", "projection", "links", "backlinks", "search", "affordances", "entity", "resolutions", "connections", "connectionchoose",
     "captureprogressions", "acquire", "lease", "promote", "select", "release", "dispose", "attest", "cite", "retire", "sever", "reinstate",
     /* T43 (N862; DEC-190 (1)): the reading, its unread pages and their transcription by the AI */
     "reading", "pagetranscribe", "transcribe"],
    word("screen.document.purpose")),
  screen("inquiry", word("screen.question.name"),
    ["image", "projection", "earnedbasis", "backlinks", "affordances", "search", "publishedcase", "versionnotice", "conclude",
     "basisversions", "inquirystrength", "inquiryground", "partitionindependence", "cite"],
    word("screen.question.purpose")),
  screen("project", word("screen.project.name"),
    ["image", "projection", "projectparticipants", "backlinks", "search", "casedrafts", "projectownerarith", "projectvisibility",
     "projectvisibilityset", "projectownerremove", "projectjoin", "projectleave", "projectinvite", "projectremove", "projectowneradd",
     "projectownerrescue", "projectfork"],
    word("screen.project.purpose")),
  screen("action", word("screen.action.name"),
    ["image", "projection", "affordances", "actionmove", "actioncorrespond", "actionlaws", "actionrisktier"],
    word("screen.action.purpose")),
  screen("published", "Case files", ["publishedmanifest", "verify"],
    "The cases your group's Civicsmith has published, readable by somebody holding no credential at all."),
  screen("review-copy", word("screen.review-copy.name"), ["reviewcopy", "casedraft", "reviewgrant", "reviewrevoke", "reviewcomment", "statementack"],
    word("screen.review-copy.purpose")),
  screen("published-case", word("screen.published.name"), ["publishedcase", "publishedmanifest", "verify"],
    word("screen.published.purpose")),
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
