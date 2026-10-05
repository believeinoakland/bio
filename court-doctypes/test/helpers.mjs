/* Test support for court-doctypes: the captured fixtures, and the views the readers are tested under.
 *
 * R15: the tests use the test profile and the first profile. Each view is `jurisdictions.combine` of one
 * of them, with the three publishing systems (under this module's keys) and the `proceeding` forms set as
 * FIXTURE DATA here (K1514: JURISDICTIONS adds them to both profiles; until it merges, and so that these
 * tests do not move when it does, the view's own entries under these keys are replaced by the ones below).
 * The first profile's are the measured addresses and number forms (`measures-T33/courts-workbooks.md` §1);
 * the test profile's are fictional, sharing no host with the first. */
import { readFileSync } from "node:fs";
import { combine } from "../../jurisdictions/index.mjs";

const R = String.raw;
const DIR = new URL("./fixtures/", import.meta.url);
export const fixture = (name) => readFileSync(new URL(name, DIR), "utf8");

export const FIRST = "oakland-alameda";
export const TEST = "test-port-ellery";

export const COURT_SYSTEMS = {
  [FIRST]: [
    { origin: "courtlistener_docket", name: "CourtListener's docket pages", hosts: ["www.courtlistener.com"],
      path: { re: R`^\/docket\/[0-9]+\/` }, basis: "TEST" },
    { origin: "cpuc_proceeding", name: "the CPUC proceeding application", hosts: ["apps.cpuc.ca.gov"],
      path: { re: R`^\/apex\/f\?p=401:(?:56|57):` }, basis: "TEST" },
    { origin: "ecourt_roa", name: "the eCourt public portal", hosts: ["eportal.alameda.courts.ca.gov"], basis: "TEST" },
  ],
  [TEST]: [
    { origin: "courtlistener_docket", name: "the harbour court's docket mirror", hosts: ["dockets.harbour-court.example"], basis: "TEST" },
    { origin: "cpuc_proceeding", name: "the Marlow utilities board's proceedings", hosts: ["proceedings.marlow-board.example"], basis: "TEST" },
    { origin: "ecourt_roa", name: "the Marlow County court portal", hosts: ["portal.marlow-courts.example"], basis: "TEST" },
  ],
};

export const PROCEEDING_FORMS = {
  [FIRST]: [
    { form: "federal_district", pattern: { re: R`^([0-9]):([0-9]{2})-(cv|cr|mc|md|mj|bk|ap)-([0-9]{5})((?:-[A-Z]{2,4})*)$` },
      normal: [{ group: 1 }, ":", { group: 2 }, "-", { group: 3 }, "-", { group: 4 }], clean: { spaces: "remove" }, basis: "TEST" },
    { form: "cpuc", pattern: { re: R`^([ARICPK])\.?([0-9]{2})-?([0-9]{2})-?([0-9]{3})$` },
      normal: [{ group: 1 }, { group: 2 }, { group: 3 }, { group: 4 }], clean: { spaces: "remove", upper: true }, basis: "TEST" },
    { form: "superior_current", pattern: { re: R`^([0-9]{2}CV[0-9]{6})$` }, normal: [{ group: 1 }],
      clean: { spaces: "remove", upper: true }, basis: "TEST" },
    { form: "superior_legacy", pattern: { re: R`^((?:RG|HG)[0-9]{8})$` }, normal: [{ group: 1 }],
      clean: { spaces: "remove", upper: true }, basis: "TEST" },
  ],
  [TEST]: [
    { form: "marlow_civil", pattern: { re: R`^MC-([0-9]{4})-([0-9]{4})$` }, normal: ["MC", { group: 1 }, { group: 2 }],
      clean: { spaces: "remove", upper: true }, basis: "TEST" },
  ],
};

/** The combined view of one profile, with this module's fixture entries in place of its own. */
export function viewFor(id, { systems = true, forms = true } = {}) {
  const r = combine([id]);
  if (!r.ok) throw new Error(`combine ${id}: ${JSON.stringify(r.errors)}`);
  const v = structuredClone(r.view);
  const keys = new Set(COURT_SYSTEMS[id].map((s) => s.origin));
  v.systems = (Array.isArray(v.systems) ? v.systems : []).filter((s) => !keys.has(s.origin));
  if (systems) v.systems = [...COURT_SYSTEMS[id], ...v.systems];
  v.spaces = { ...(v.spaces || {}) };
  if (forms) v.spaces.proceeding = { label: "proceeding number", forms: PROCEEDING_FORMS[id] };
  else delete v.spaces.proceeding;
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
    courtlistener: (p) => `https://dockets.harbour-court.example/docket/1/?page=${p}`,
    card: "https://proceedings.marlow-board.example/card/1",
    documents: "https://proceedings.marlow-board.example/documents/1",
    ecourt: "https://portal.marlow-courts.example/case/1",
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
