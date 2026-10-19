/* R63: the words of what a copy the account already holds says about itself (`describeCopy`), drawn on the page that offers an
 * update, an install beside it or its removal. What the account holds and the facts a copy states are `installer-steps`'
 * (`readCopyFacts`, `countsViaApi`); this file only words them, by key (R72, R76). */

import { word } from "./words.mjs";

/* A fact not stated is not known, and why: the copy did not answer (`silent`), or it answered without the fact, which an
   older release and a copy that withholds the facts from a caller with no credential cannot be told apart by (R63): that
   is "not known", never a claim about its release. */
const reasonOf = (f) => word(f && f.why === "silent" ? "installer.fact.unknown.silent" : "installer.fact.unknown.short");
const notKnown = () => word("installer.fact.unknown.short");
const dateOf = (v) => (typeof v === "string" ? v.slice(0, 10) : v);
const HOLDINGS = ["projects", "documents", "published", "members"];
/* The installer's own counts from Cloudflare's API, by the key family each reads (R63, R76: a plural pair by the number). */
const FALLBACK = ["workers", "containers", "captured", "published"];
const fallbackWord = (k, n) => word(`installer.fallback.${k === "workers" ? "programs" : k}.${n === 1 ? "one" : "other"}`, { n });

/* One copy, drawn as the page draws it: its facts as its own worker stated them or as not known (R63), and, when the worker
   stated no counts, the installer's own from Cloudflare's API in their place, beside the line that the team's own were not
   available. `fallback` is countsViaApi's answer or null. */
export function describeCopy(copy, address, facts, fallback) {
  const val = (f) => (f.known ? String(f.value) : notKnown());
  const known = HOLDINGS.filter((k) => facts[k].known);
  const lines = [];
  const whose = facts.team.known ? word("screen.install.exists.whose", { team: facts.team.value, address: address || copy.slug })
    : word("installer.fact.unknown.whose", { address: address || copy.slug });
  if (!facts.team.known) lines.push(word("installer.fact.unknown.team", { reason: reasonOf(facts.team) }));
  if (!facts.release.known) lines.push(word("installer.fact.unknown.release", { reason: reasonOf(facts.release) }));
  if (!facts.installed.known) lines.push(word("installer.fact.unknown.installed", { reason: reasonOf(facts.installed) }));
  if (!facts.used.known) lines.push(word("installer.fact.unknown.used", { reason: reasonOf(facts.used) }));
  const release = word("screen.install.exists.release", { release: val(facts.release), date: facts.installed.known ? dateOf(facts.installed.value) : notKnown(),
    used: facts.used.known ? dateOf(facts.used.value) : notKnown() });
  let holdings;
  if (known.length) {
    holdings = known.map((k) => word(`installer.holdings.${k}.${facts[k].value === 1 ? "one" : "other"}`, { n: facts[k].value })).join(", ");
    for (const k of HOLDINGS) if (!facts[k].known) lines.push(word(`installer.fact.unknown.${k}`, { reason: reasonOf(facts[k]) }));
  } else if (fallback) {
    holdings = FALLBACK.filter((k) => fallback[k] !== null && fallback[k] !== undefined).map((k) => fallbackWord(k, fallback[k])).join(", ");
    lines.push(word("installer.fact.unknown.counts", { reason: reasonOf(facts.projects) }), word("installer.fallback.note"));
  } else {
    holdings = notKnown();
    lines.push(word("installer.fact.unknown.counts", { reason: reasonOf(facts.projects) }));
  }
  return { slug: copy.slug, finished: copy.finished, address, whose, release, holds: word("screen.install.exists.holds", { holdings }), holdings, unknown: lines,
    fromApi: !known.length && !!fallback };
}
