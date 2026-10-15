/* screens-intake's tests over the real served page (K3007): `interfacePage(SCREENS)` booted through interface-shell's
 * harness and DOM stand-in (`../interface-shell/harness.mjs`, `dom.mjs`), the plane scripted per op. A few helpers to
 * open a screen, fill its fields and press its acts as a member would. */
import { boot, ok, refused, refusedIn, bytes, MEMBER, ADMIN } from "../interface-shell/harness.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";

export { ok, refused, refusedIn, bytes, MEMBER, ADMIN, word, hasWord };

/* The assistant reachable for this member (interface-shell R20): on, with the group's key held and on. */
const REACH = { assistantstate: ok({ on: true }), groupkeystate: ok({ on: true, held: true }) };

/* A stand-in for the `document` screen (screens-inquiry), so a reference of that kind is drawn as the link it is on the whole
   page; it draws nothing of its own. */
export const DOCUMENT_STUB = Object.freeze({ id: "document", reads: () => ({}), render: () => "", acts: Object.freeze([]), words: Object.freeze([]) });

export async function open(path, { plane = {}, me = MEMBER, reachable = false, screens = SCREENS } = {}) {
  const p = await boot({ screens, path, plane: { whoami: ok(me), ...(reachable ? REACH : {}), ...plane } });
  await p.settle();
  return p;
}

export const main = (p) => p.doc.getElementById("cs-main");
export const html = (p) => main(p).innerHTML;
export const text = (p) => main(p).textContent;
export const btn = (p, op, sel = "") => main(p).querySelector(`button[data-act="${op}"]${sel}`);

/* A field's value, a box's tick, a file input's file. */
export function fill(p, values = {}) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (el.type === "checkbox" || el.type === "radio") el.checked = !!v;
    else if (el.type === "file") el.files = v ? [v] : [];
    else el.value = v;
  }
}

/* Press an act. A reasoned act with no field of its own opens the shell's reason field: `reason` fills and sends it. */
export async function press(p, op, { reason, sel = "" } = {}) {
  const b = btn(p, op, sel);
  if (!b) throw new Error(`no act ${op} drawn`);
  const ai = b.getAttribute("data-ai");
  await p.click(b);
  const slot = main(p).querySelector(`[data-slot="${ai}"]`);
  if (reason !== undefined && slot && slot.querySelector("textarea")) {
    slot.querySelector("textarea").value = reason;
    await p.click(slot.querySelector('[data-shell="reason-send"]'));
  }
  /* an act's `done` may itself call the plane (acquire's promote, after `cs.digest`, which the platform answers off the
     event loop): let every request it makes be answered */
  for (let i = 0; i < 12; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 2)); }
  return { slot: () => main(p).querySelector(`[data-slot="${ai}"]`) };
}

/* Every word a page drew is a word: no raw key (`screen.…`, `act.…`, `mark.…`) is left in the text (interface-shell R5). */
export const rawKeys = (p) => (text(p).match(/\b(screen|act|mark|shell|state|refusal|photo|draft|ai)\.[a-z][\w.-]*\b/g) || [])
  .filter((k) => !/^(screen|act)\.[a-z-]+$/.test(k) || k.split(".").length > 2);

/* R26: a sentence is asserted by its key, never by its English: `says(p, key, vars)` is true when the page's text holds
   `word(key, vars)`; `saysIn(el, key, vars)` the same for one element (an act's refusal slot, a row). */
export const says = (p, key, vars) => text(p).includes(word(key, vars));
export const saysIn = (el, key, vars) => el.textContent.includes(word(key, vars));
