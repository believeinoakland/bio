/* interface-shell (T46-54; N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -155, -159–-163, -175–-177, -179, -181;
   N672, N673; K2893): the member interface's page and frame. `interfacePage(screens)` composes one HTML document from the
   shell's browser program (`browser.mjs`) and each registered screen's self-contained functions (draft-T46-interface
   §1.3), with the data they read: the words (R5, R70: keys only; the sentences are `setup-words`'), the act gate's tables (R12), the grades (R11) and the paths (R8). It
   checks the screen contract (R21) before it composes anything, so a broken screen is never served. Pure: it reads no
   table and writes nothing; every read and act is an op the plane serves, from the browser. */
import { ASSET_FILES } from "../interface-assets/index.mjs";
import { WORD_ROWS, word } from "../setup-words/index.mjs";
import { OPS, NEEDS, SESSION_OPS } from "../op-declarations/index.mjs";
import { RUNGS, RUNG_ABSENT, IRREVERSIBLE_WEIGHT, MARKS, phoneOf } from "../op-grades/index.mjs";
import { SCREEN_REGISTRY } from "../wizard-scripts/index.mjs";
import { shellProgram } from "./browser.mjs";

/* R32 (N999; K3052; replaces setup-page R31): the session record's key in the browser's `localStorage`, this module's:
   `{t, e, d, w}`, `t` the token `login` answered, `e` its expiry in milliseconds (0 when none), `d` the device kind
   (`own` or `shared`), `w` the handle signed in with. Every tab reads it; nothing else holds the token. */
export const SESSION_STORE_KEY = "bio-session";

/* R2 (setup-page R28's rule; answer-envelope R6): the literal each script element's nonce holds, filled per response. */
export const NONCE_SLOT = "__CSP_NONCE__";

/* The phone width (the Terms): `civicsmith.css`' breakpoint, a viewport of 760 px or less. */
export const PHONE_WIDTH = 760;

/* R1, R2: the stylesheet and the icon sprite, `interface-assets`' files, served on the page's own origin. */
const ASSET = (name) => {
  if (!Object.hasOwn(ASSET_FILES, name)) throw new Error(`interface-shell: interface-assets holds no ${name}`);
  return "/app/assets/" + name;
};
export const STYLESHEET = ASSET("civicsmith.css");
/* R56 (K3254 (2); `interface-assets` R7): the design page's product rules, linked after the stylesheet */
export const SHELL_STYLESHEET = ASSET("shell.css");
export const ICONS = ASSET("icons.svg");

/* R8 (DEC-154; N672): each screen's path, `mock-shell.js`' `PATH` at 3f40899950, from its rail place to its own name;
   `@project` is the project's step, its title as read (the screen's `place(view)`). R28 (T47): the new screen modules'
   screens from `PATH` at a0fab7abf0, and L11's (R37) from `PATH` at PR #33's head; a step that is not a screen's own name
   is a `shell.step.*` word. A screen of the public, published or setup frame has no path (R30, R45). R54: the screens
   PR #34's registry adds, from `PATH` at its merge (4664e8efd4): `elsewhere` (Home) and `updates` (Settings). */
export const PATHS = Object.freeze({
  home: ["home"], elsewhere: ["home", "screen.elsewhere.name"], queue: ["queue"], inbox: ["queue", "screen.inbox.name"], "due-date": ["queue", "shell.step.due-date"],
  finder: ["find"], answers: ["find", "screen.answers.name"],
  capture: ["add"], held: ["add", "screen.held.name"], archive: ["add", "screen.held.name", "screen.archive.name"],
  "open-file": ["projects", "@project", "screen.open-file.name"], "find-in": ["projects", "@project", "screen.find-in.name"],
  projects: ["projects"], project: ["projects", "@project"], document: ["projects", "@project", "screen.document.name"],
  question: ["projects", "@project", "screen.question.name"], assistant: ["projects", "@project", "screen.question.name"],
  projectai: ["projects", "@project", "screen.projectai.name"],
  calculation: ["projects", "@project", "screen.calculation.name"], standard: ["projects", "@project", "screen.standard.name"],
  plan: ["projects", "@project", "screen.plan.name"], "start-send": ["projects", "@project", "screen.plan.name", "screen.start-send.name"],
  request: ["projects", "@project", "screen.request.name"], action: ["projects", "@project", "screen.action.name"],
  timeline: ["projects", "@project", "screen.timeline.name"], money: ["projects", "@project", "screen.money.name"],
  proceeding: ["projects", "@project", "screen.proceeding.name"], matter: ["projects", "@project", "screen.matter.name"],
  "case-editor": ["projects", "@project", "screen.case-editor.name"], "review-copy": ["projects", "@project", "screen.review-copy.name"],
  ceremony: ["projects", "@project", "shell.step.ceremony"], docket: ["projects", "@project", "screen.docket.name"],
  imported: ["projects", "shell.step.imported", "screen.imported.name"],
  people: ["people"], person: ["people", "screen.person.name"], explore: ["people", "screen.person.name", "screen.explore.name"],
  settings: ["settings"], members: ["settings", "screen.members.name"], account: ["settings", "screen.account.name"],
  connect: ["settings", "screen.connect.name"], notes: ["settings", "screen.notes.name"], ties: ["settings", "screen.ties.name"],
  "group-identity": ["settings", "screen.group-identity.name"], security: ["settings", "screen.security.name"],
  translations: ["settings", "screen.translations.name"], wizards: ["settings", "screen.wizards.name"],
  updates: ["settings", "screen.updates.name"],
  group: ["settings", "screen.group.name"], places: ["settings", "screen.places.name"], recovery: ["settings", "screen.recovery.name"],
  unavailable: ["screen.unavailable.name"],
});
Object.values(PATHS).forEach(Object.freeze);

/* R7: the rail's places and the screens each opens, the first registered; a place none of whose screens is registered
   opens the shell's own page (R37: People opens `people`, Settings opens `settings`; until either is registered the
   shell says People comes later and lists the settings screens registered, never linking `/`). */
export const PLACE_SCREENS = Object.freeze({
  home: Object.freeze(["home"]), queue: Object.freeze(["queue"]), find: Object.freeze(["finder"]), add: Object.freeze(["capture"]),
  projects: Object.freeze(["projects", "project"]), people: Object.freeze(["people"]), settings: Object.freeze(["settings"]),
});

/* R37's fallback: the settings screens the shell lists while `settings` is not registered (R28's list; R54: `updates`
   after Security, drawn only while `whoami`'s `administer` is true, `ADMIN_SCREENS`). */
export const SETTINGS_SCREENS = Object.freeze(["members", "account", "connect", "notes", "ties", "group-identity", "security",
  "updates", "translations", "wizards", "group", "places", "recovery"]);
export const ADMIN_SCREENS = Object.freeze(["updates"]);

/* R16: the screen an item of each kind opens (R27: a knock opens `inbox` at that knock; R47: a person or organisation
   the record follows opens `person`, a proceeding `proceeding`, a standard `standard`; R66: a project's plan, timeline,
   money, calculation, case editor, review copy, ceremony and docket open their screens), each card its
   `shell.card.<kind>` word. */
export const REF_SCREENS = Object.freeze({ document: "document", passage: "document", question: "question", project: "project",
  member: "members", capture: "open-file", knock: "inbox", person: "person", proceeding: "proceeding", standard: "standard",
  plan: "plan", timeline: "timeline", money: "money", calculation: "calculation", "case-editor": "case-editor",
  "review-copy": "review-copy", ceremony: "ceremony", docket: "docket" });

/* R30, R45: the frames of `registry.json` other than `working` that the shell draws: `public` and `published` without a
   session, `setup` with or without one; the dock's panel is `dock`. A screen not named here is drawn in the working
   frame. */
export const FRAMES = Object.freeze({
  front: "public", tour: "public", reset: "public", forgot: "public", doorbell: "public",
  published: "published", "review-outside": "published",
  setup: "setup", join: "setup", site: "setup", install: "setup", update: "setup",
  assistant: "dock",
});
const sessionless = (id) => FRAMES[id] === "public" || FRAMES[id] === "published";

/* R9 (K3137): addresses whose first part is not the screen's id: `/app/review` is `review-outside` (`screens-publish` R17). */
export const ADDRESSES = Object.freeze({ review: "review-outside" });

/* R21, R38: the ops a screen may name beyond its registry acts: `infolevelset` on any screen, and the re-points, each
   until the registry lists it: `ratify` on `ceremony` (`screens-publish` R13), `unlock` on `front` (`screens-entry` R2);
   R55: `planask` on `plan` (`screens-action` R13), `stepsource` and `stepsourcewithdraw` on `explore` (`screens-investigate`
   R17). */
export const RE_POINTS = Object.freeze({
  ceremony: Object.freeze(["ratify"]),
  front: Object.freeze(["unlock"]),
  plan: Object.freeze(["planask"]),
  explore: Object.freeze(["stepsource", "stepsourcewithdraw"]),
});
export const ANY_SCREEN_OPS = Object.freeze(["infolevelset"]);

/* R12: the acts their owners refuse to a member who does not administer: `membership`'s administrator acts (its R84's
   one answer), `credentials`' group-key acts (its R33) and `aikeepaway` (its R51). */
export const ADMIN_ACTS = Object.freeze(new Set([
  "memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "hostingaccessset", "invitewithdraw",
  "websitekeycreate", "websitekeyset", "websitekeyrevoke", "joinlinkenable", "joinlinkset", "joinlinkreplace", "joinlinkoff",
  "courtnoticeset", "groupdescriptionset", "joindoors", "projectownerrescue",
  "groupkeyset", "groupkeyremove", "groupkeyswitch", "aikeepaway",
  /* R47: `people`' expunging of a person (its R12) */
  "personexpunge",
  /* R50: the reset link, a member's key set by an administrator, the group's settings, its places and offices, its
     translators, its security tools */
  "passwordresetlink", "signerset", "groupnameset", "grouplogoset", "groupdomainset", "grouplanguagesset", "courtnoticeset",
  "hostingaccessset", "profilesset", "placewanted", "officesseed", "translationgrant", "translationrevert",
  "securitytools", "securitytoolcatalogue", "securitytoolevents", "securitytooladd", "securitytooltest", "securitytoolremove",
]));

/* The shell's own reads and acts (R3, R4, R7, R17, R20, R33, R34, R36). */
export const SHELL_OPS = Object.freeze(["whoami", "interfacewords", "groupidentity", "queue", "infolevel", "infolevelset",
  "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate", "signout", "unlock", "reauth", "bootstrap"]);

/* R21: the screen contract. Throws, naming the screen, for a screen whose id the registry does not hold, an act naming
   an op `OPS` does not hold, or an op that is neither the registry's for that screen nor a named re-point. */
export function checkScreens(screens) {
  if (!Array.isArray(screens)) throw new Error("interface-shell: screens is not a list");
  const seen = new Set();
  for (const s of screens) {
    const id = s && s.id;
    const reg = SCREEN_REGISTRY.find((r) => r.id === id);
    if (!reg) throw new Error(`interface-shell: screen ${String(id)} is not in SCREEN_REGISTRY`);
    if (seen.has(id)) throw new Error(`interface-shell: screen ${id} is registered twice`);
    seen.add(id);
    if (typeof s.render !== "function") throw new Error(`interface-shell: screen ${id} has no render`);
    if (s.reads !== undefined && typeof s.reads !== "function") throw new Error(`interface-shell: screen ${id}'s reads is not a function`);
    if (!Array.isArray(s.acts)) throw new Error(`interface-shell: screen ${id} has no acts list`);
    const allowed = new Set([...reg.acts, ...(reg.owed || []).map((o) => o.op), ...(RE_POINTS[id] || []), ...ANY_SCREEN_OPS]);
    for (const a of s.acts) {
      const op = a && a.op;
      if (typeof op !== "string" || !Object.hasOwn(OPS, op)) throw new Error(`interface-shell: screen ${id}'s act names ${String(op)}, which OPS does not hold`);
      if (!allowed.has(op)) throw new Error(`interface-shell: screen ${id}'s act ${op} is not the registry's for it, nor a named re-point`);
      /* R30: a screen drawn without a session calls only public ops (R46: `unlock`, under the locked session's token) */
      if (sessionless(id) && OPS[op].classes !== null && !(RE_POINTS[id] || []).includes(op)) throw new Error(`interface-shell: screen ${id} is drawn without a session, and its act ${op} is not a public op`);
    }
    if (s.words !== undefined && !Array.isArray(s.words)) throw new Error(`interface-shell: screen ${id}'s words is not a list`);
    if (s.ABSENT_CODES !== undefined && !(Array.isArray(s.ABSENT_CODES) && s.ABSENT_CODES.every((c) => typeof c === "string"))) throw new Error(`interface-shell: screen ${id}'s ABSENT_CODES is not a list of codes`);
  }
  return true;
}

/* R31, K3143: the dock's wizard guide (`screens-wizards`' `GUIDE`), `{words, parts?, ops, acts, render, marks, start,
   entered, pressed, ring, control}` (R51: `control` handles the guide's own `data-guide` controls): no registry id;
   `ops` (the ops it reads by `cs.call`) and its acts' ops each an op `OPS` holds, carried with their gate rows as a
   screen's. Throws, naming the guide, for one that is not. */
export function checkGuide(guide) {
  if (guide === undefined || guide === null) return true;
  if (typeof guide !== "object" || typeof guide.render !== "function") throw new Error("interface-shell: the guide has no render");
  for (const f of ["marks", "start", "entered", "pressed", "ring", "control"]) if (guide[f] !== undefined && typeof guide[f] !== "function") throw new Error(`interface-shell: the guide's ${f} is not a function`);
  if (!Array.isArray(guide.acts)) throw new Error("interface-shell: the guide has no acts list");
  if (guide.ops !== undefined && !Array.isArray(guide.ops)) throw new Error("interface-shell: the guide's ops is not a list");
  for (const op of [...(guide.ops || []), ...guide.acts.map((a) => a && a.op)]) if (!(typeof op === "string" && Object.hasOwn(OPS, op))) throw new Error(`interface-shell: the guide names ${String(op)}, which OPS does not hold`);
  if (guide.words !== undefined && !Array.isArray(guide.words)) throw new Error("interface-shell: the guide's words is not a list");
  return true;
}

/* The page's script holds the screens as JavaScript source: each function by its own text, every other value as JSON. */
export function toSource(v) {
  if (typeof v === "function") {
    const src = v.toString();
    /* a method written `name(a) {…}` is an object's member, never an expression: make it one */
    if (/^(async\s+)?(function\b|\(|[\w$]+\s*=>)|^async\s*\(/.test(src)) return src;
    const m = /^async\s+/.exec(src);
    return (m ? "async function " : "function ") + src.slice(m ? m[0].length : 0);
  }
  if (Array.isArray(v)) return "[" + v.map(toSource).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.entries(v).map(([k, x]) => JSON.stringify(k) + ":" + toSource(x)).join(",") + "}";
  return v === undefined ? "undefined" : JSON.stringify(v);
}

/* R5, R70: every word the page may draw, `[key, en]`: `WORD_ROWS` (the shell's own keys are its rows) and each screen's
   own rows. A screen's own row under a key `WORD_ROWS` holds wins (DEC-149's conformed form, R5). */
export function wordsOf(screens) {
  const m = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
  for (const s of screens) for (const x of s.words || []) if (Array.isArray(x)) m.set(x[0], x[1]);
  return [...m.entries()];
}

/* The words the page carries (R70: the keys of `setup-words`' list, read from it, never English held here): the families the shell and its kit draw (R5–R7, R10, R11, R13, R14, R16, R32–R36, R40),
   each act's label and explanation, each registered screen's, and every key a screen (or the guide) names. */
const FAMILIES = ["shell.", "rail.", "tab.", "state.", "weight.", "mark.", "level.", "date.", "refusal.", "ai.refused.", "session.",
  "signing.ceremony.", "instance.test."];
function pageWords(screens, ops) {
  const named = new Set(screens.flatMap((s) => (s.words || []).map((x) => (Array.isArray(x) ? x[0] : x))));
  const ids = screens.map((s) => s.id).filter(Boolean).concat(Object.keys(PATHS), ["unavailable", "more"]);
  const keep = (k) => named.has(k) || FAMILIES.some((f) => k.startsWith(f))
    || ids.some((id) => k.startsWith("screen." + id + ".")) || [...ops].some((op) => k.startsWith("act." + op + "."));
  return wordsOf(screens).filter(([k]) => keep(k));
}

/* R33 (K3061 D3; `credentials` R65): the page's own idle limits, the plane's answer governing over them. */
export const IDLE_LOCK_MS = 30 * 60 * 1000;
export const IDLE_END_MS = 15 * 60 * 1000;
/* R35 (DEC-201 (8)): a subject read refused with one of these is "You can't open this"; an absence code (R61: `NO_SUCH_*`,
   `*_NOT_FOUND`, `NOT_FOUND`, `NO_ENTITY`, `NO_CALC`, `NO_NODE`, and the codes a screen lists as its `ABSENT_CODES`), or an empty
   answer, is "Nothing is here"; no answer, or a 5xx, is "can't be reached", tried again every `RETRY_MS`. */
export const ABSENCE = /^NO_SUCH_|_NOT_FOUND$|^NOT_FOUND$|^NO_ENTITY$|^NO_CALC$|^NO_NODE$/;
export const NOT_YOURS = Object.freeze(["NOT_VISIBLE", "NOT_A_PARTICIPANT"]);
export const RETRY_MS = 30 * 1000;

function dataOf(screens, guide) {
  const all = guide ? screens.concat([guide]) : screens;
  const ops = new Set(SHELL_OPS);
  for (const s of all) for (const a of s.acts) ops.add(a.op);
  if (guide) for (const op of guide.ops || []) ops.add(op);
  const pick = (f) => Object.fromEntries([...ops].filter((op) => Object.hasOwn(OPS, op)).map((op) => [op, f(op)]).filter(([, v]) => v !== undefined));
  /* R11 (K3002, K3011): the weight from `RUNGS` (an alias carries its op's); an act that can never be undone weighs
     Irreversible (DEC-143, `op-grades` R21); a read (`OPS` declares it not mutating), or an op in `RUNG_ABSENT` under a
     ground other than `undetermined`, is not an act on the record: no weight (`none`), run on press; an undetermined or
     unnamed op is reasoned in the browser (DEC-87) */
  const rungOf = (op) => (OPS[op] && OPS[op].mutating === false ? "none" : IRREVERSIBLE_WEIGHT.includes(op) ? "irreversible"
    : Object.hasOwn(RUNG_ABSENT, op) ? (RUNG_ABSENT[op] && RUNG_ABSENT[op].ground !== "undetermined" ? "none" : undefined)
      : Object.hasOwn(RUNGS, op) ? RUNGS[op] : undefined);
  return {
    storeKey: SESSION_STORE_KEY, phoneWidth: PHONE_WIDTH, icons: ICONS,
    words: pageWords(all, ops),
    ops: pick(() => true),
    /* R30, R45: the public ops (`classes: null`), the only ones a page with no session calls, by an act or by `cs.call` */
    publicOps: Object.keys(OPS).filter((op) => OPS[op].classes === null),
    needs: pick((op) => (Object.hasOwn(NEEDS, op) ? NEEDS[op] : undefined)),
    sessionOps: { member: [...ops].filter((op) => SESSION_OPS.member.has(op)), admin: [...ops].filter((op) => SESSION_OPS.admin.has(op)) },
    adminActs: [...ops].filter((op) => ADMIN_ACTS.has(op)),
    rungs: pick(rungOf),
    /* R64 (`op-grades` R42): the design kit's mark for an act R11 draws with no weight, a mark and its explanation only */
    marks: pick((op) => (rungOf(op) === "none" && Object.hasOwn(MARKS, op) ? String(MARKS[op]).toLowerCase() : undefined)),
    /* R50 (K3156): the acts held at the phone width: every act carrying a weight that `op-grades.phoneOf` answers false
       for (its terminal, attested and irreversible rungs, `IRREVERSIBLE_WEIGHT`, its larger-screen acts through
       `OP_ALIASES`); never one run on press (a read, or an op `RUNG_ABSENT` grounds otherwise than `undetermined`: the
       credential acts `knock`, `enroll`, `recover` stay on the phone) */
    larger: [...ops].filter((op) => Object.hasOwn(OPS, op) && rungOf(op) !== "none" && phoneOf(op) === false),
    paths: PATHS, placeScreens: PLACE_SCREENS, refScreens: REF_SCREENS, frames: FRAMES, settingsScreens: SETTINGS_SCREENS, addresses: ADDRESSES,
    places: [...Object.keys(PLACE_SCREENS), "more"],
    idleLock: IDLE_LOCK_MS, idleEnd: IDLE_END_MS, notYours: NOT_YOURS, retry: RETRY_MS, absence: ABSENCE.source, adminScreens: ADMIN_SCREENS,
  };
}

/* The shell's own styles (R56, R65: only these two, never a hand copy of a design rule, which `shell.css` carries): the
   page's height settings, so the frame's main column scrolls and the page never does (R57; the frame's own fixed height is
   the design's `.cs-frame`), and motion stopped under reduced motion (R22). Every element the shell draws is a design
   class (R65), so nothing else is carried; no rule gives `cursor: help`, nor a pointer to an element that only explains
   itself (R52). */
const STYLE = `html,body.cs{height:100%}body.cs{margin:0;height:100dvh;display:flex;flex-direction:column;overflow:hidden}
#cs-root{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}#cs-root>.cs-frame{flex:1 1 auto;min-height:0;height:auto;overflow:hidden}
#cs-root>.cs-frame>.cs-main{overflow:auto;min-height:0}#cs-root>.cs-frame:not(.cs-shell){display:grid;grid-template-rows:minmax(0,1fr)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

/* R56: the script-hook classes, each with what reads it; a class here needs no style. */
export const HOOK_CLASSES = Object.freeze({
  "cs-crumbs": "the path's element, read by journey-check's walker (its screens.mjs) and the screen modules' tests",
  "cs-rows": "the kit's table of rows (R19), read by the screen modules' tests",
  "cs-r": "a row of `cs.rows`, read by the screen modules' tests",
  "cs-panel": "a row's panel, read by the shell's ring (R31) and `cs.fieldOf`, and by the screen modules' tests",
  "mk-lvlbtn": "the explanation-level control (R65), read by the design's script and journey-check (`mock-shell.js`:47)",
});

/* R56: every class a served stylesheet defines: `civicsmith.css` (whose own elements' classes count with it), `shell.css`
   and the shell's `STYLE`. Comments and addresses are no selector. */
export function stylesheetClasses(...sheets) {
  const out = new Set();
  for (const css of sheets) {
    const text = String(css || "").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/url\([^)]*\)/g, " ").replace(/"[^"\n]*"|'[^'\n]*'/g, " ");
    for (const m of text.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.add(m[1]);
  }
  return out;
}
let DEFINED = null;
const definedClasses = () => DEFINED || (DEFINED = stylesheetClasses(ASSET_FILES["civicsmith.css"].body, ASSET_FILES["shell.css"].body, STYLE));

/* R56: the classes written as literals in `class` attributes (and the `class` set by `setAttribute` or `classList.add`) in
   a source text. A literal cut by a quote of the program's own string, `${` or a backslash keeps its last word unless
   that word ends open (`cs-tag-` + a kind), so a class made at run time is never taken for a written one. */
export function classLiterals(src) {
  const out = new Set();
  const take = (body, closed) => {
    const words = body.split(/\s+/).filter(Boolean);
    if (!closed && words.length && /[-_]$/.test(words[words.length - 1])) words.pop();
    for (const c of words) if (/^-?[_a-zA-Z][\w-]*$/.test(c)) out.add(c);
  };
  for (const m of String(src).matchAll(/\bclass=(\\?)(["'])([^"'`$\\<>{}]*)(.)/g)) {
    const [, , q, body, end] = m;
    const closed = end === q || /\s$/.test(body);
    take(body, closed || end === "\\");
  }
  for (const m of String(src).matchAll(/setAttribute\(\s*["']class["']\s*,\s*["']([^"']*)["']\s*\)|classList\.add\(\s*["']([^"']*)["']\s*\)/g)) take(m[1] || m[2] || "", true);
  return out;
}
/* R56: throws, naming the screen (or the guide, or the shell) and the class, for a class no served stylesheet defines
   that is neither a hook class nor one of `civicsmith.css`' own. */
export function checkClasses(screens, guide, program) {
  const defined = definedClasses();
  const check = (who, src) => {
    for (const c of classLiterals(src)) if (!defined.has(c) && !Object.hasOwn(HOOK_CLASSES, c)) throw new Error(`interface-shell: ${who} draws the class ${c}, which no served stylesheet defines`);
  };
  check("the shell", program);
  for (const s of screens) check(`screen ${s.id}`, toSource(s));
  if (guide) check("the guide", toSource(guide));
  return true;
}

/* the page's own escaping of a served word */
const escape = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * R1: the page. One document, `<html lang>` `en` until the member's language is read; `interface-assets`' `civicsmith.css`
 * and then its `shell.css` (R56), both before the shell's own `<style>`; icons referenced from its `icons.svg`; one
 * script, its nonce `NONCE_SLOT`, composed from the shell's program and each screen's functions. No member-facing text
 * stands outside the words. R28: `screens` are the nine screen modules' `SCREENS`; R31: `options.guide` is
 * `screens-wizards`' `GUIDE`, the dock's wizard guide; R58: `options.testInstance` true serves the test band in the page
 * itself, above the frame, from first paint (`control-plane` R95). R56: throws for a class no served stylesheet defines.
 */
export function interfacePage(screens = [], options = {}) {
  checkScreens(screens);
  const guide = options && options.guide ? options.guide : null;
  checkGuide(guide);
  const program = shellProgram.toString();
  checkClasses(screens, guide, program);
  const D = dataOf(screens, guide);
  const script = `(${program})(${toSource(D)}, ${toSource(screens)}, window, ${toSource(guide)}).start();`
    .replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
  /* R58, R67: the band as served: the design's `.cs-band[data-band="test"]`, the machine icon, `instance.test.band` and
     `instance.test.notice`, in the English of their words until the member's words are read (R5) */
  const band = options && options.testInstance === true
    ? `<div class="cs-band" data-band="test" id="cs-testband" role="note"><svg class="i" aria-hidden="true"><use href="${ICONS}#i-machine"/></svg><b>${escape(word("instance.test.band"))}</b> <span>${escape(word("instance.test.notice"))}</span></div>\n` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<link rel="stylesheet" href="${STYLESHEET}">
<link rel="stylesheet" href="${SHELL_STYLESHEET}">
<style>${STYLE}</style>
</head>
<body class="cs">
${band}<div id="cs-root"></div>
<div class="cs-tip" id="cs-tip" role="tooltip" hidden></div>
<script nonce="${NONCE_SLOT}">${script}</script>
</body>
</html>
`;
}
