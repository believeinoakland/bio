/* screens-intake's tests over the real served page (K3007): `interfacePage(SCREENS)` booted through interface-shell's
 * harness and DOM stand-in (`../interface-shell/harness.mjs`, `dom.mjs`), the plane scripted per op. A few helpers to
 * open a screen, fill its fields and press its acts as a member would. */
import { boot, ok, refused, refusedIn, bytes, MEMBER, ADMIN, collectOwnerRows } from "../interface-shell/harness.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";

export { ok, refused, refusedIn, bytes, MEMBER, ADMIN, word, hasWord };

/* The owners' declarations of the ops this module's screens send that no hand row holds (C20's credential ops, C56's named requests and
   sweeps), registered as the plane registers them at start-up (op-declarations R80, R81), once per process before any table is read. They
   are read through the harness's one collector (test-support `declaredOpsOf`), never named or copied here (K3268). `link-sweep`'s two
   mutating rows declare no `needs` (op-declarations R80 refuses a mutating op without one), a defect of that owner's declaration reported
   to BOB (screens-intake record): here they carry the capability the same kind of act names, so the screens' requests are held to the
   fields link-sweep declares. */
const NEW_OPS = ["capturecredentialsupply", "capturecredentiallist", "capturecredentialwithdraw", "namedrequestset", "namedrequests", "sweepset", "sweepratify"];
const rows = collectOwnerRows();
registerDeclaredOps({ "screens-intake fixture": Object.fromEntries(NEW_OPS.filter((op) => rows[op]).map((op) => [op, rows[op].mutating && rows[op].needs === undefined ? { ...rows[op], needs: "contribute", stamps: ["author", "viewer"] } : rows[op]])) });

/* The assistant reachable for this member (interface-shell R20): on, with the group's key held and on. */
const REACH = { assistantstate: ok({ on: true }), groupkeystate: ok({ on: true, held: true }) };

/* A stand-in for the `document` screen (screens-inquiry), so a reference of that kind is drawn as the link it is on the whole
   page; it draws nothing of its own. */
export const DOCUMENT_STUB = Object.freeze({ id: "document", reads: () => ({}), render: () => "", acts: Object.freeze([]), words: Object.freeze([]) });

/* R66 (G143; K4836, K4787): a test reads a screen only once it has drawn what the act answered, which it learns from COUNTS and events, never from a time. The plane
   doubles' answers are counted while they are out (`out`); the platform's digests, which the event loop's ticks cannot see (they resolve on the thread pool, however
   long a busy machine takes), are waited for by the event of their completion (`digesting`, `drained`), not by a number of ticks. `idle` settles until no answer
   and no digest is out and no request has been added for three rounds running; a double a test holds on purpose (a gate) is waited on for a bounded number of rounds
   only, so the test can read the screen as it stands while the answer is held. */
let out = 0, digesting = 0, drainers = [];
const counted = (a) => (typeof a === "function" ? async (req) => { out++; try { return await a(req); } finally { out--; } } : a);
const subtle = globalThis.crypto && globalThis.crypto.subtle;
if (subtle && !subtle.digest.counted) {
  const real = subtle.digest.bind(subtle);
  subtle.digest = (...a) => { digesting++; return real(...a).finally(() => { if (--digesting === 0) { const d = drainers; drainers = []; d.forEach((r) => r()); } }); };
  subtle.digest.counted = true;
}
const drained = () => (digesting === 0 ? Promise.resolve() : new Promise((r) => drainers.push(r)));

export async function idle(p, rounds = 400) {
  let quiet = 0, seen = p.requests.length;
  for (let i = 0; i < rounds && quiet < 3; i++) {
    await drained();
    await p.settle(10);
    quiet = out === 0 && digesting === 0 && p.requests.length === seen ? quiet + 1 : 0;
    seen = p.requests.length;
  }
}

export async function open(path, { plane = {}, me = MEMBER, reachable = false, screens = SCREENS } = {}) {
  const p = await boot({ screens, path, plane: { whoami: ok(me), ...(reachable ? REACH : {}), ...Object.fromEntries(Object.entries(plane).map(([op, a]) => [op, counted(a)])) } });
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
     event loop): let every request it makes be answered (counted, R66) */
  await idle(p);
  return { slot: () => main(p).querySelector(`[data-slot="${ai}"]`) };
}

/* Every word a page drew is a word: no raw key (`screen.…`, `act.…`, `mark.…`) is left in the text (interface-shell R5). */
export const rawKeys = (p) => (text(p).match(/\b(screen|act|mark|shell|state|refusal|photo|draft|ai)\.[a-z][\w.-]*\b/g) || [])
  .filter((k) => !/^(screen|act)\.[a-z-]+$/.test(k) || k.split(".").length > 2);

/* R26: a sentence is asserted by its key, never by its English: `says(p, key, vars)` is true when the page's text holds
   `word(key, vars)`; `saysIn(el, key, vars)` the same for one element (an act's refusal slot, a row). */
export const says = (p, key, vars) => text(p).includes(word(key, vars));
export const saysIn = (el, key, vars) => el.textContent.includes(word(key, vars));

/* R54: a document with no title, no file name is named by its host and the day it was captured (`document.untitled.web`) */
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
export const dayOf = (iso) => { const d = new Date(iso); return word("date.daymonthyear", { day: String(d.getUTCDate()), month: word(`date.month.${MONTHS[d.getUTCMonth()]}`), year: String(d.getUTCFullYear()) }); };
export const untitled = (site = "www.example.gov") => word("document.untitled.web", { site, date: dayOf(Date.now()) });
