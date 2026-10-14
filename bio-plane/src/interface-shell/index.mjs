/* interface-shell (T46-54; N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -155, -159–-163, -175–-177, -179, -181;
   N672, N673; K2893): the member interface's page and frame. `interfacePage(screens)` composes one HTML document from the
   shell's browser program (`browser.mjs`) and each registered screen's self-contained functions (draft-T46-interface
   §1.3), with the data they read: the words (R5), the act gate's tables (R12), the grades (R11) and the paths (R8). It
   checks the screen contract (R21) before it composes anything, so a broken screen is never served. Pure: it reads no
   table and writes nothing; every read and act is an op the plane serves, from the browser. */
import { ASSET_FILES } from "../interface-assets/index.mjs";
import { WORD_ROWS } from "../setup-words/index.mjs";
import { OPS, NEEDS, SESSION_OPS } from "../op-declarations/index.mjs";
import { RUNGS, RUNG_ABSENT, IRREVERSIBLE_WEIGHT } from "../op-grades/index.mjs";
import { SCREEN_REGISTRY } from "../wizard-scripts/index.mjs";
import { shellProgram } from "./browser.mjs";
import { SHELL_WORDS, DESIGN_WORDS } from "./words.mjs";

export { SHELL_WORDS, DESIGN_WORDS };

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
export const ICONS = ASSET("icons.svg");

/* R8 (DEC-154; N672): each screen's path, `mock-shell.js`' `PATH` at 3f40899950, from its rail place to its own name;
   `@project` is the project's step, its title as read (the screen's `place(view)`). R28 (T47): the new screen modules'
   screens from `PATH` at a0fab7abf0, and L11's (R37) from `PATH` at PR #33's head; a step that is not a screen's own name
   is a `shell.step.*` word. A screen of the public, published or setup frame has no path (R30, R45). */
export const PATHS = Object.freeze({
  home: ["home"], queue: ["queue"], inbox: ["queue", "screen.inbox.name"], "due-date": ["queue", "shell.step.due-date"],
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

/* R37's fallback: the settings screens the shell lists while `settings` is not registered (R28's list). */
export const SETTINGS_SCREENS = Object.freeze(["members", "account", "connect", "notes", "ties", "group-identity", "security",
  "translations", "wizards", "group", "places", "recovery"]);

/* R16: the screen an item of each kind opens (R27: a knock opens `inbox` at that knock; R47: a person or organisation
   the record follows opens `person`, a proceeding `proceeding`, a standard `standard`). */
export const REF_SCREENS = Object.freeze({ document: "document", passage: "document", question: "question", project: "project",
  member: "members", capture: "open-file", knock: "inbox", person: "person", proceeding: "proceeding", standard: "standard" });

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
   until the registry lists it: `ratify` on `ceremony` (`screens-publish` R13), `unlock` on `front` (`screens-entry` R2). */
export const RE_POINTS = Object.freeze({
  ceremony: Object.freeze(["ratify"]),
  front: Object.freeze(["unlock"]),
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
  }
  return true;
}

/* R31, K3143: the dock's wizard guide (`screens-wizards`' `GUIDE`), `{words, parts?, ops, acts, render, marks, start,
   entered, pressed, ring}`: no registry id; `ops` (the ops it reads by `cs.call`) and its acts' ops each an op `OPS`
   holds, carried with their gate rows as a screen's. Throws, naming the guide, for one that is not. */
export function checkGuide(guide) {
  if (guide === undefined || guide === null) return true;
  if (typeof guide !== "object" || typeof guide.render !== "function") throw new Error("interface-shell: the guide has no render");
  for (const f of ["marks", "start", "entered", "pressed", "ring"]) if (guide[f] !== undefined && typeof guide[f] !== "function") throw new Error(`interface-shell: the guide's ${f} is not a function`);
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

/* R5: every word the page may draw, `[key, en]`: `WORD_ROWS`, the shell's own and each screen's own rows. A screen's own
   row under a key `WORD_ROWS` holds wins (DEC-149's conformed form, R5). */
export function wordsOf(screens) {
  const m = new Map(DESIGN_WORDS.map((r) => [r[0], r[1]]));
  for (const r of WORD_ROWS) m.set(r[0], r[1]);
  for (const [k, en] of SHELL_WORDS) m.set(k, en);
  for (const s of screens) for (const x of s.words || []) if (Array.isArray(x)) m.set(x[0], x[1]);
  return [...m.entries()];
}

/* The words the page carries: the families the shell and its kit draw (R5–R7, R10, R11, R13, R14, R16, R32–R36, R40),
   each act's label and explanation, each registered screen's, and every key a screen (or the guide) names. */
const FAMILIES = ["shell.", "rail.", "tab.", "state.", "weight.", "mark.", "level.", "date.", "refusal.", "ai.refused.", "session.",
  "signing.ceremony.", "instance.test.notice"];
function pageWords(screens, ops) {
  const named = new Set(screens.flatMap((s) => (s.words || []).map((x) => (Array.isArray(x) ? x[0] : x))));
  const ids = screens.map((s) => s.id).filter(Boolean).concat(Object.keys(PATHS), ["unavailable"]);
  const keep = (k) => named.has(k) || FAMILIES.some((f) => k.startsWith(f))
    || ids.some((id) => k.startsWith("screen." + id + ".")) || [...ops].some((op) => k.startsWith("act." + op + "."));
  return wordsOf(screens).filter(([k]) => keep(k));
}

/* R33 (K3061 D3; `credentials` R65): the page's own idle limits, the plane's answer governing over them. */
export const IDLE_LOCK_MS = 30 * 60 * 1000;
export const IDLE_END_MS = 15 * 60 * 1000;
/* R35 (DEC-201 (8)): a subject read refused with one of these is "You can't open this"; `NOT_FOUND`, `NO_SUCH_*` and
   `*_NOT_FOUND`, or an empty answer, are "Nothing is here"; no answer, or a 5xx, is "can't be reached", tried again every
   `RETRY_MS`. */
export const NOT_YOURS = Object.freeze(["NOT_VISIBLE", "NOT_A_PARTICIPANT"]);
export const RETRY_MS = 30 * 1000;

function dataOf(screens, guide) {
  const all = guide ? screens.concat([guide]) : screens;
  const ops = new Set(SHELL_OPS);
  for (const s of all) for (const a of s.acts) ops.add(a.op);
  if (guide) for (const op of guide.ops || []) ops.add(op);
  const pick = (f) => Object.fromEntries([...ops].filter((op) => Object.hasOwn(OPS, op)).map((op) => [op, f(op)]).filter(([, v]) => v !== undefined));
  return {
    storeKey: SESSION_STORE_KEY, phoneWidth: PHONE_WIDTH, icons: ICONS,
    words: pageWords(all, ops),
    ops: pick(() => true),
    /* R30, R45: the public ops (`classes: null`), the only ones a page with no session calls, by an act or by `cs.call` */
    publicOps: Object.keys(OPS).filter((op) => OPS[op].classes === null),
    needs: pick((op) => (Object.hasOwn(NEEDS, op) ? NEEDS[op] : undefined)),
    sessionOps: { member: [...ops].filter((op) => SESSION_OPS.member.has(op)), admin: [...ops].filter((op) => SESSION_OPS.admin.has(op)) },
    adminActs: [...ops].filter((op) => ADMIN_ACTS.has(op)),
    /* R11 (K3002): the weight from `RUNGS` (an alias carries its op's); an act that can never be undone weighs
       Irreversible (DEC-143, `op-grades` R21); an op in `RUNG_ABSENT` under a ground other than `undetermined` is not an
       act on the record: no weight (`none`), run on press; an undetermined or unnamed op is reasoned in the browser (DEC-87) */
    /* R11 (K3011): a read (`OPS` declares it not mutating) carries no weight and runs on press, whatever the grades hold */
    rungs: pick((op) => (OPS[op] && OPS[op].mutating === false ? "none" : IRREVERSIBLE_WEIGHT.includes(op) ? "irreversible"
      : Object.hasOwn(RUNG_ABSENT, op) ? (RUNG_ABSENT[op] && RUNG_ABSENT[op].ground !== "undetermined" ? "none" : undefined)
        : Object.hasOwn(RUNGS, op) ? RUNGS[op] : undefined)),
    paths: PATHS, placeScreens: PLACE_SCREENS, refScreens: REF_SCREENS, frames: FRAMES, settingsScreens: SETTINGS_SCREENS, addresses: ADDRESSES,
    places: [...Object.keys(PLACE_SCREENS), "more"],
    idleLock: IDLE_LOCK_MS, idleEnd: IDLE_END_MS, notYours: NOT_YOURS, retry: RETRY_MS,
  };
}

/* Shell styles the stylesheet does not hold: the path, the menu, the rows and their panels, the phone's row cards; the
   mark (R43), the lock and the password dialog (R33, R34), the test band (R36), the ring (R31) and the at-a-glance
   elements (R44, `page.src.html`'s drawings at PR #33's head). */
const STYLE = `.cs-crumbs ol{display:flex;flex-wrap:wrap;gap:4px 8px;list-style:none;margin:0;padding:0;font-size:var(--t-sm);color:var(--c-muted)}
.cs-crumbs li+li::before{content:"›";margin-right:8px}.cs-crumbs [aria-current]{color:var(--c-ink);font-weight:600}
.cs-menuwrap{position:relative}.cs-menu{position:absolute;right:0;top:100%;z-index:40;min-width:220px;padding:var(--s-3);gap:var(--s-2)}
.cs-menu[hidden]{display:none}.cs-list{display:grid;gap:var(--s-2);padding-left:var(--s-4)}.cs-actrow{display:flex;flex-wrap:wrap;gap:var(--s-2)}
.cs-actwrap{display:inline-grid;gap:var(--s-2);justify-items:start}.cs-slot:empty{display:none}
.cs-rows{width:100%;border-collapse:collapse;background:var(--c-surface)}.cs-rows th,.cs-rows td{padding:var(--s-2) var(--s-3);border-bottom:var(--hair);text-align:left;vertical-align:top}
.cs-rowname{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s-2)}
.cs-panel[hidden]{display:none}.cs-hold{position:sticky;bottom:0}
.cs-mast .cs-mark{display:inline-flex;align-items:center;margin-right:-4px;cursor:help}.cs-mast .cs-mark svg{height:20px;width:auto;color:var(--c-accent)}
.cs-testband{padding:var(--s-2) var(--s-4);border-bottom:var(--hair);border-top:3px solid var(--c-attn,var(--c-ink));background:var(--c-ground-2);font-size:var(--t-sm)}
.cs-overlay{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:var(--s-4);background:color-mix(in srgb,var(--c-ground) 82%,transparent)}
.cs-overlay>.cs-dialog{max-width:440px;width:100%;display:grid;gap:var(--s-3)}
.cs-ring{outline:3px solid var(--c-accent);outline-offset:3px;animation:cs-ring 1.2s ease-out 2}.cs-ringlabel{display:block;font-size:var(--t-xs);font-weight:600;color:var(--c-accent)}
@keyframes cs-ring{from{outline-offset:12px}to{outline-offset:3px}}
.cs-spark{display:inline-flex;align-items:flex-end;gap:2px;height:20px;vertical-align:middle}.cs-spark i{display:block;width:5px;background:color-mix(in srgb,var(--c-stage) 40%,var(--c-surface));border-radius:1px 1px 0 0}
.cs-spark i.now{background:var(--c-stage)}.cs-spark b{margin-left:6px;font:600 var(--t-xs) var(--f-sans);color:var(--c-ink-2);align-self:center}
.cs-people{display:inline-flex;align-items:center}.cs-people i{width:22px;height:22px;margin-right:-4px;border-radius:50%;background:var(--c-ground-2);border:1.5px solid var(--c-surface);box-shadow:0 0 0 1px var(--c-rule-strong);font:600 11px/20px var(--f-sans);text-align:center;font-style:normal;color:var(--c-ink)}
.cs-people i.more{background:var(--c-surface);font-size:10px}.cs-people>span{margin-left:10px;font:600 var(--t-sm) var(--f-sans);color:var(--c-ink-2)}
.cs-tile{background:var(--c-surface);border:var(--hair);padding:10px 12px;display:grid;gap:2px;align-content:start}.cs-tile .k{font:600 var(--t-xs) var(--f-sans);letter-spacing:var(--track-caps);text-transform:uppercase;color:var(--c-muted)}
.cs-tile .v{font:600 var(--t-2xl)/1.1 var(--f-sans)}.cs-tile .d{font-size:var(--t-sm);color:var(--c-ink-2)}.cs-tile .cs-spark{margin-top:4px}
.cs-strip{display:flex;flex-wrap:wrap;gap:6px 20px;padding:8px 14px;background:var(--c-ground-2);border:var(--hair);border-top:3px solid var(--c-ink);margin-bottom:4px}
.cs-strip .cs-ref{display:inline-flex;align-items:baseline;gap:6px;font-weight:600;text-decoration:none;color:var(--c-ink)}.cs-strip .cs-ref b{font-size:var(--t-xl)}
.cs-next{list-style:none;margin:0;padding:0;display:grid;gap:6px;counter-reset:n}.cs-next li{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:8px 12px;border:var(--hair);background:var(--c-surface);counter-increment:n}
.cs-next li::before{content:counter(n);width:24px;height:24px;border-radius:50%;border:1.5px solid var(--c-rule-strong);text-align:center;font:600 13px/22px var(--f-sans);color:var(--c-ink-2);flex:none}
.cs-next li[aria-current]{border-color:var(--c-accent);box-shadow:inset 3px 0 0 var(--c-accent)}.cs-next li[aria-current]::before{background:var(--c-accent);color:var(--c-on-accent);border-color:var(--c-accent)}.cs-next li>span:first-of-type{flex:1 1 240px}
.cs-tl{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(118px,1fr);gap:6px;padding:0 4px;overflow-x:auto}.cs-tl::before{content:"";position:absolute;left:0;right:0;top:50%;border-top:2px solid var(--c-rule-strong)}
.cs-tl .ev{display:grid;grid-template-rows:1fr 16px 1fr;height:124px;justify-items:center;text-align:center}.cs-tl .ev .t{font-size:var(--t-xs);line-height:1.25;color:var(--c-ink-2);max-width:118px}.cs-tl .ev .t b{display:block;color:var(--c-ink)}
.cs-tl .ev .t:first-child{align-self:end;padding-bottom:4px}.cs-tl .ev .t:last-child{align-self:start;padding-top:4px}
.cs-tl .ev i{width:14px;height:14px;border-radius:50%;background:var(--c-ink);border:2px solid var(--c-surface);z-index:1;align-self:center}.cs-tl .ev.us i{background:var(--c-accent)}
@media (max-width:760px){.cs-rows thead{display:none}.cs-rows tr.cs-r{display:grid;border-bottom:var(--hair)}.cs-rows td{border:0}
.cs-rows td[data-label]::before{content:attr(data-label);display:block;font-size:var(--t-xs);color:var(--c-muted)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

/**
 * R1: the page. One document, `<html lang>` `en` until the member's language is read; one stylesheet link to
 * `interface-assets`' `civicsmith.css`; icons referenced from its `icons.svg`; one script, its nonce `NONCE_SLOT`,
 * composed from the shell's program and each screen's functions. No member-facing text stands outside the words.
 * R28: `screens` are the nine screen modules' `SCREENS`; R31: `options.guide` is `screens-wizards`' `GUIDE`, the dock's
 * wizard guide.
 */
export function interfacePage(screens = [], options = {}) {
  checkScreens(screens);
  const guide = options && options.guide ? options.guide : null;
  checkGuide(guide);
  const D = dataOf(screens, guide);
  const script = `(${shellProgram.toString()})(${toSource(D)}, ${toSource(screens)}, window, ${toSource(guide)}).start();`
    .replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<link rel="stylesheet" href="${STYLESHEET}">
<style>${STYLE}</style>
</head>
<body class="cs">
<div id="cs-root"></div>
<div class="cs-tip" id="cs-tip" role="tooltip" hidden></div>
<script nonce="${NONCE_SLOT}">${script}</script>
</body>
</html>
`;
}
