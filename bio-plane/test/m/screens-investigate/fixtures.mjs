/* screens-investigate's tests: the helpers every test file shares, over interface-shell's served page (its tests' harness, `harness.mjs`, and
 * document stand-in, `dom.mjs`). The state a test draws is made by real acts over `store-request`'s world (`world.mjs`); this file holds no
 * scripted answers. */
import { SCREENS } from "../../../src/screens-investigate/index.mjs";
import { ok, textNodes } from "../interface-shell/harness.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import assert from "node:assert/strict";

export { SCREENS, word, hasWord };

/** A calendar day (`YYYY-MM-DD`) as the kit draws it, by its words (`date.daymonthyear`, `date.month.*`). */
export const dayOf = (iso) => { const [y, m, d] = iso.split("-").map(Number); return word("date.daymonthyear", { day: String(d), month: word("date.month." + ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"][m - 1]), year: String(y) }); };
export const drew = (el, key, vars, msg) => assert.ok(el.textContent.includes(word(key, vars)), msg || `${key} drawn`);
export const notDrew = (el, key, vars, msg) => assert.ok(!el.textContent.includes(word(key, vars)), msg || `${key} not drawn`);

export const ENT = "ENT-2026-0012";
export const MSR = "MSR-2026-0001";
export const CALC = "CALC-2026-0001";
export const PROC = "ENT-2026-0100";
export const STD = "STD-2026-0004-policy";

export const main = (p) => p.doc.getElementById("cs-main");
export const actsIn = (el) => [...new Set(el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act")))];
export const button = (p, op, within) => (within || p.root()).querySelector(`button[data-act="${op}"]`);
export function fill(p, values) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (typeof v === "boolean") el.checked = v; else el.value = v;
  }
}
/** Press an act; a reasoned act's own reason field (when the shell asks one) answered with `reason`, a dialog's fields
 *  filled with `fields` and confirmed. */
export async function press(p, op, { reason, within, fields, el } = {}) {
  const b = el || button(p, op, within);
  if (!b) throw new Error(`no act ${op}`);
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  if (ta && reason !== undefined) { ta.value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  const dlg = slot && slot.querySelector('[data-shell="confirm"]');
  if (dlg && fields) {
    slot.querySelectorAll("textarea").forEach((t, i) => { t.value = fields[i] === undefined ? "" : fields[i]; });
    await p.click(dlg);
  }
  await p.settle();
  await p.settle();
  return slot;
}
/** Every text node drawn that reads as a word key: a key the page holds no word for is drawn as itself. */
export const rawKeys = (root) => textNodes(root).map((t) => String(t.data).trim()).filter((t) => /^[a-z][\w-]*(\.[\w-]+){2,}$/.test(t));
export { ok, textNodes };
