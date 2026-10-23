/* G42 (K4635, K4638, K4640): the sentences of the `group` screen's storage gauge (`size` is a function of its {used}, {limit} and {percent}). control-plane provides the capacity stamp
   `op=stats` answers `dbBytes` through, so the gauge's words are its own code-origin rows; screens-settings reads them by key. */
import { localize } from "../setup-words/index.mjs";

export const STORAGE_WORDS = Object.freeze({
  head: localize("screen.group.storage.head", "How full your team's record is"),
  size: (vars) => localize("screen.group.storage.size", "Your team's record holds {used} GB of the {limit} GB one record can hold ({percent}%).", vars),
  unstated: localize("screen.group.storage.unstated", "The size of your team's record is not stated."),
  warn1: localize("screen.group.storage.warn1", "Your team's record has passed 70% of what one record can hold. Decide what to do before it fills."),
  warn2: localize("screen.group.storage.warn2", "Your team's record has passed 90% of what one record can hold. At the limit, writes will fail: nothing more can be saved until room is made."),
  factorsLead: localize("screen.group.storage.factors.lead", "How large your record can realistically grow depends on four things."),
  factorsPlan: localize("screen.group.storage.factors.plan", "The Cloudflare plan your team has and is willing to pay for."),
  factorsPare: localize("screen.group.storage.factors.pare", "How far you pare the record, by what your investigations and queries touch."),
  factorsLatency: localize("screen.group.storage.factors.latency", "How much delay you accept when a search has to run in the background instead of at once."),
  factorsLimits: localize("screen.group.storage.factors.limits", "The limits of the platform itself."),
});
