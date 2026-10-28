/* TEMPORARY (dev only, to be replaced before this job completes): the one place the tests meet ai-catalogue. Until that
   module's job lands, a stand-in in the session's scratchpad answers its reads; at completion this file builds the real
   service from ai-catalogue's published fixture (K4990, K4993). */
import { catalogueDouble } from "/tmp/claude-0/-home-user-bio/1464e53d-6f7f-5732-8add-2e08c261dedc/scratchpad/cat-double.mjs";

export const PLANS = Object.freeze({ provider: "anthropic", teamApi: "anthropic-api", memberApi: "anthropic-member-api",
  subscription: "anthropic-sub", teamSubscription: "anthropic-team-sub", freeProvider: "freeco", freeApi: "free-api",
  builtinProvider: "civicsmith", builtin: "builtin" });
export const ENTRIES = Object.freeze({ a: "claude-a", b: "claude-b", free: "free-m", builtin: "builtin-m" });

export function catalogueFor() { return catalogueDouble(); }

/* The catalogue's variations the arms need, each one call, so a change in how the real fixture is varied is made here alone:
   an entry's verdict for a part, an entry's answer to a check (true, false or null for open), its lifecycle, a plan's terms
   version, the catalogue unreadable (and readable again). */
export const setGate = (w, entry, part, verdict) => { w.catalogue.state.gate.set(`${entry}|${part}`, verdict); };
export const setCheck = (w, entry, check, met) => { w.catalogue.state.met.set(`${entry}|${check}`, met); };
export const setLifecycle = (w, entry, state) => { w.catalogue.state.lifecycle.set(entry, state); };
export const setUnavailable = (w, on = true) => { w.catalogue.state.unavailable = on; };
export const setPlanTerms = (w, plan, version) => { w.catalogue.state.terms.set(plan, version); };
export const setPendingTerms = (w, plan, pending) => { w.catalogue.state.pending.set(plan, pending); };
