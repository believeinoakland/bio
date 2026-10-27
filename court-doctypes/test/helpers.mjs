/* Test support for court-doctypes: the captured fixtures, and the views the readers are tested under.
 *
 * R15: the tests use the test profile and the first profile, each as `jurisdictions.combine` gives it, on
 * the profiles' own facts: the three publishing systems under this module's keys and the `proceeding`
 * forms (added by JURISDICTIONS, K1514). A view may only have facts REMOVED here, to show what a reader
 * answers without them; nothing is supplied. */
import { readFileSync } from "node:fs";
import { combine } from "../../jurisdictions/index.mjs";
import { WORD_ROWS } from "../../bio-plane/src/setup-words/index.mjs";

const DIR = new URL("./fixtures/", import.meta.url);
export const fixture = (name) => readFileSync(new URL(name, DIR), "utf8");

export const FIRST = "oakland-alameda";
export const TEST = "test-port-ellery";
const KEYS = ["courtlistener_docket", "cpuc_proceeding", "ecourt_roa"];

/** The combined view of one profile; `systems: false` removes its entries under this module's keys,
 *  `forms: false` its proceeding space. */
export function viewFor(id, { systems = true, forms = true } = {}) {
  const r = combine([id]);
  if (!r.ok) throw new Error(`combine ${id}: ${JSON.stringify(r.errors)}`);
  const v = structuredClone(r.view);
  if (!systems) v.systems = (Array.isArray(v.systems) ? v.systems : []).filter((s) => !KEYS.includes(s.origin));
  if (!forms) { v.spaces = { ...(v.spaces || {}) }; delete v.spaces.proceeding; }
  return v;
}

/** Where each fixture was captured, and a locator of the test profile's fictional systems for the same page. */
export const LOCATORS = {
  [FIRST]: {
    courtlistener: (p) => `https://www.courtlistener.com/docket/4214664/national-veterans-legal-services-program-v-united-states/?page=${p}`,
    card: "https://apps.cpuc.ca.gov/apex/f?p=401:56:0::NO:RP,57,RIR:P5_PROCEEDING_SELECT:A2106021",
    documents: "https://apps.cpuc.ca.gov/apex/f?p=401:57:0::NO:RP,57,RIR:P5_PROCEEDING_SELECT:A2106021",
    ecourt: "https://eportal.alameda.courts.ca.gov/?q=node/410&case=24CV000123",
  },
  [TEST]: {
    courtlistener: (p) => `https://dockets.registry.example/case/${p}`,
    card: "https://board.marlow-county.example/proceeding/UB-2021-06/card",
    documents: "https://board.marlow-county.example/proceeding/UB-2021-06/documents",
    ecourt: "https://court.marlow-county.example/case/MC-24-0123",
  },
};

/** A ctx as docprofile hands a type: the text, the locator, the view, and what the caller knows. */
export function ctxFor(text, { view, locator, origin, at, locate } = {}) {
  const c = { text, view, locator };
  if (origin !== undefined) c.origin = origin;
  if (at !== undefined) c.at = at;
  if (locate) c.locate = locate;
  return c;
}

/** A pattern for the sentence a word row says: its literal text as written, each `{placeholder}` any text, or
 *  the text of `vars[name]` where the test gives it. A test reads the sentence from the word table and never
 *  copies it (K3810). */
export function wordRe(id, vars = {}) {
  const row = WORD_ROWS.find((r) => r[0] === id);
  if (!row) throw new Error(`no word row ${id}`);
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(row[1].split(/(\{[A-Za-z0-9_]+\})/).map((c) => {
    const m = /^\{([A-Za-z0-9_]+)\}$/.exec(c);
    return m ? (Object.hasOwn(vars, m[1]) ? esc(String(vars[m[1]])) : "[\\s\\S]+?") : esc(c);
  }).join(""));
}

/** The first profile's view, its `courtlistener_docket` system's path widened to also match the docket-entries
 *  path (R18). A STAND-IN: `jurisdictions` owes the same widening in the two profiles (the entry says it), and
 *  this view stands for them until they carry it. */
const API_PATH = String.raw`^\/api\/rest\/v[0-9]+\/docket-entries\/`;
export function widenedFor(id) {
  const v = viewFor(id);
  for (const s of v.systems) if (s.origin === "courtlistener_docket") s.path = { re: `${s.path.re}|${API_PATH}` };
  return v;
}

/** Where the docket-entries answer of each profile's CourtListener system is served. */
export const API_LOCATORS = {
  [FIRST]: "https://www.courtlistener.com/api/rest/v4/docket-entries/?docket=4214664",
  [TEST]: "https://dockets.registry.example/api/rest/v4/docket-entries/?docket=4214664",
};

/** A pattern for a sentence whose text is already filled with `ANY` where the test leaves a placeholder open
 *  (`localize(id, en, { name: ANY })` at the call, so the key and its sentence are read, not copied). */
export const ANY = "\u0001";
export const reOf = (text) => new RegExp(String(text).split(ANY).map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s\\S]+?"));
