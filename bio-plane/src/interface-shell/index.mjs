/* interface-shell (T46-54; N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -155, -159–-163, -175–-177, -179, -181;
   N672, N673; K2893): the member interface's page and frame. `interfacePage(screens)` composes one HTML document from the
   shell's browser program (`browser.mjs`) and each registered screen's self-contained functions (draft-T46-interface
   §1.3), with the data they read: the words (R5), the act gate's tables (R12), the grades (R11) and the paths (R8). It
   checks the screen contract (R21) before it composes anything, so a broken screen is never served. Pure: it reads no
   table and writes nothing; every read and act is an op the plane serves, from the browser. */
import { ASSET_FILES } from "../interface-assets/index.mjs";
import { WORD_ROWS } from "../setup-words/index.mjs";
import * as SETUP_PAGE from "../setup-page/index.mjs";
import { OPS, NEEDS, SESSION_OPS } from "../op-declarations/index.mjs";
import { RUNGS, RUNG_ABSENT, IRREVERSIBLE_WEIGHT } from "../op-grades/index.mjs";
import { SCREEN_REGISTRY } from "../wizard-scripts/index.mjs";
import { shellProgram } from "./browser.mjs";
import { SHELL_WORDS } from "./words.mjs";

export { SHELL_WORDS };

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
   `@project` is the project's step, its title as read (the screen's `place(view)`). */
export const PATHS = Object.freeze({
  home: ["home"], queue: ["queue"], inbox: ["queue", "screen.inbox.name"],
  finder: ["find"], answers: ["find", "screen.answers.name"],
  capture: ["add"], held: ["add", "screen.held.name"],
  "open-file": ["projects", "@project", "screen.open-file.name"], "find-in": ["projects", "@project", "screen.find-in.name"],
  project: ["projects", "@project"], document: ["projects", "@project", "screen.document.name"],
  question: ["projects", "@project", "screen.question.name"], assistant: ["projects", "@project", "screen.question.name"],
  members: ["settings", "screen.members.name"], account: ["settings", "screen.account.name"],
  connect: ["settings", "screen.connect.name"], notes: ["settings", "screen.notes.name"],
});
Object.values(PATHS).forEach(Object.freeze);

/* R7: the rail's places and the screen each opens; a place whose screen is not registered opens the shell's own page
   saying it comes later (People in T46). Settings opens the shell's settings page (R25). */
export const PLACE_SCREENS = Object.freeze({ home: "home", queue: "queue", find: "finder", add: "capture", projects: "project", people: "people", settings: "settings" });

/* R16: the screen an item of each kind opens. */
export const REF_SCREENS = Object.freeze({ document: "document", passage: "document", question: "question", project: "project", member: "members", capture: "open-file" });

/* R21: the re-points draft-T46-interface §3 names, and `owed:infolevelset`'s op. */
export const RE_POINTS = Object.freeze({
  capture: Object.freeze(["captureupload"]),
  connect: Object.freeze(["subscriptionsignin", "subscriptiondisconnect"]),
  answers: Object.freeze(["ask"]),
  account: Object.freeze(["infolevelset"]),
});

/* R12: the acts their owners refuse to a member who does not administer: `membership`'s administrator acts (its R84's
   one answer), `credentials`' group-key acts (its R33) and `aikeepaway` (its R51). */
export const ADMIN_ACTS = Object.freeze(new Set([
  "memberadd", "membercaps", "memberset", "adminendorse", "adminremove", "expertiseconfirm", "hostingaccessset", "invitewithdraw",
  "websitekeycreate", "websitekeyset", "websitekeyrevoke", "joinlinkenable", "joinlinkset", "joinlinkreplace", "joinlinkoff",
  "courtnoticeset", "groupdescriptionset", "joindoors", "projectownerrescue",
  "groupkeyset", "groupkeyremove", "groupkeyswitch", "aikeepaway",
]));

/* The shell's own reads and acts (R3, R4, R7, R17, R20). */
export const SHELL_OPS = Object.freeze(["whoami", "interfacewords", "groupidentity", "queue", "infolevel", "infolevelset",
  "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate", "signout"]);

/* setup-page R31's record, the session it hands over (R3). */
const storeKey = () => {
  const k = SETUP_PAGE.SESSION_STORE_KEY;
  if (typeof k !== "string" || !k) throw new Error("interface-shell: setup-page exports no SESSION_STORE_KEY");
  return k;
};

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
    const allowed = new Set([...reg.acts, ...(reg.owed || []).map((o) => o.op), ...(RE_POINTS[id] || [])]);
    for (const a of s.acts) {
      const op = a && a.op;
      if (typeof op !== "string" || !Object.hasOwn(OPS, op)) throw new Error(`interface-shell: screen ${id}'s act names ${String(op)}, which OPS does not hold`);
      if (!allowed.has(op)) throw new Error(`interface-shell: screen ${id}'s act ${op} is not the registry's for it, nor a named re-point`);
    }
    if (s.words !== undefined && !Array.isArray(s.words)) throw new Error(`interface-shell: screen ${id}'s words is not a list`);
  }
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
  const m = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
  for (const [k, en] of SHELL_WORDS) m.set(k, en);
  for (const s of screens) for (const x of s.words || []) if (Array.isArray(x)) m.set(x[0], x[1]);
  return [...m.entries()];
}

/* The words the page carries: the families the shell and its kit draw (R5–R7, R10, R11, R13, R14, R16), each act's
   label and explanation, each registered screen's, and every key a screen names. */
const FAMILIES = ["shell.", "rail.", "tab.", "state.", "weight.", "mark.", "level.", "date.", "refusal.", "ai.refused."];
function pageWords(screens, ops) {
  const named = new Set(screens.flatMap((s) => (s.words || []).map((x) => (Array.isArray(x) ? x[0] : x))));
  const ids = screens.map((s) => s.id).concat(Object.keys(PATHS));
  const keep = (k) => named.has(k) || FAMILIES.some((f) => k.startsWith(f))
    || ids.some((id) => k.startsWith("screen." + id + ".")) || [...ops].some((op) => k.startsWith("act." + op + "."));
  return wordsOf(screens).filter(([k]) => keep(k));
}

function dataOf(screens) {
  const ops = new Set(SHELL_OPS);
  for (const s of screens) for (const a of s.acts) ops.add(a.op);
  const pick = (f) => Object.fromEntries([...ops].filter((op) => Object.hasOwn(OPS, op)).map((op) => [op, f(op)]).filter(([, v]) => v !== undefined));
  return {
    storeKey: storeKey(), phoneWidth: PHONE_WIDTH, icons: ICONS,
    words: pageWords(screens, ops),
    ops: pick(() => true),
    needs: pick((op) => (Object.hasOwn(NEEDS, op) ? NEEDS[op] : undefined)),
    sessionOps: { member: [...ops].filter((op) => SESSION_OPS.member.has(op)), admin: [...ops].filter((op) => SESSION_OPS.admin.has(op)) },
    adminActs: [...ops].filter((op) => ADMIN_ACTS.has(op)),
    /* R11 (K3002): the weight from `RUNGS` (an alias carries its op's); an act that can never be undone weighs
       Irreversible (DEC-143, `op-grades` R21); an op in `RUNG_ABSENT` under a ground other than `undetermined` is not an
       act on the record: no weight (`none`), run on press; an undetermined or unnamed op is reasoned in the browser (DEC-87) */
    rungs: pick((op) => (IRREVERSIBLE_WEIGHT.includes(op) ? "irreversible"
      : Object.hasOwn(RUNG_ABSENT, op) ? (RUNG_ABSENT[op] && RUNG_ABSENT[op].ground !== "undetermined" ? "none" : undefined)
        : Object.hasOwn(RUNGS, op) ? RUNGS[op] : undefined)),
    paths: PATHS, placeScreens: PLACE_SCREENS, refScreens: REF_SCREENS,
    places: [...Object.keys(PLACE_SCREENS), "more"],
  };
}

/* Shell styles the stylesheet does not hold: the path, the menu, the rows and their panels, the phone's row cards. */
const STYLE = `.cs-crumbs ol{display:flex;flex-wrap:wrap;gap:4px 8px;list-style:none;margin:0;padding:0;font-size:var(--t-sm);color:var(--c-muted)}
.cs-crumbs li+li::before{content:"›";margin-right:8px}.cs-crumbs [aria-current]{color:var(--c-ink);font-weight:600}
.cs-menuwrap{position:relative}.cs-menu{position:absolute;right:0;top:100%;z-index:40;min-width:220px;padding:var(--s-3);gap:var(--s-2)}
.cs-menu[hidden]{display:none}.cs-list{display:grid;gap:var(--s-2);padding-left:var(--s-4)}.cs-actrow{display:flex;flex-wrap:wrap;gap:var(--s-2)}
.cs-actwrap{display:inline-grid;gap:var(--s-2);justify-items:start}.cs-slot:empty{display:none}
.cs-rows{width:100%;border-collapse:collapse;background:var(--c-surface)}.cs-rows th,.cs-rows td{padding:var(--s-2) var(--s-3);border-bottom:var(--hair);text-align:left;vertical-align:top}
.cs-panel[hidden]{display:none}.cs-hold{position:sticky;bottom:0}
@media (max-width:760px){.cs-rows thead{display:none}.cs-rows tr.cs-r{display:grid;border-bottom:var(--hair)}.cs-rows td{border:0}
.cs-rows td[data-label]::before{content:attr(data-label);display:block;font-size:var(--t-xs);color:var(--c-muted)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

/**
 * R1: the page. One document, `<html lang>` `en` until the member's language is read; one stylesheet link to
 * `interface-assets`' `civicsmith.css`; icons referenced from its `icons.svg`; one script, its nonce `NONCE_SLOT`,
 * composed from the shell's program and each screen's functions. No member-facing text stands outside the words.
 */
export function interfacePage(screens = []) {
  checkScreens(screens);
  const D = dataOf(screens);
  const script = `(${shellProgram.toString()})(${toSource(D)}, ${toSource(screens)}, window).start();`
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
