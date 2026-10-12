/* screens-intake's tests over the real served page (K3007): `interfacePage(SCREENS)` booted through interface-shell's
 * harness and DOM stand-in (`../interface-shell/harness.mjs`, `dom.mjs`), the plane scripted per op. A few helpers to
 * open a screen, fill its fields and press its acts as a member would. */
import { boot, ok, refused, refusedIn, bytes, MEMBER, ADMIN } from "../interface-shell/harness.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

export { ok, refused, refusedIn, bytes, MEMBER, ADMIN };

/* The assistant reachable for this member (interface-shell R20): on, with the group's key held and on. */
const REACH = { assistantstate: ok({ on: true }), groupkeystate: ok({ on: true, held: true }) };

export async function open(path, { plane = {}, me = MEMBER, reachable = false } = {}) {
  const p = await boot({ screens: SCREENS, path, plane: { whoami: ok(me), ...(reachable ? REACH : {}), ...plane } });
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
