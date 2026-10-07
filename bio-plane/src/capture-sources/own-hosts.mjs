/* F16, F19; K1881 — THE GROUP'S OWN HOSTS (capture-sources R65): the one rule every module that refuses them asks.
 *
 * `ownHosts` is the list the composition root hands in (`plane`, T35-73): the host the group's Civicsmith is reached
 * at and its fleet members' hosts. Each entry is a lower-case host name, or a suffix beginning with `.` that stands
 * for every host under it (the account's `workers.dev` subdomain, which holds the fleet's members). The credentials
 * (R55, R56), the in-plane renderer (R64) and `acquisition` read it here, so the rule cannot drift between them.
 *
 * With no list (absent, empty, not a list) nothing is one of the group's own: the own-host refusals refuse nothing
 * until the composition hands one in (fail-open, F16 low; K1940). Pure; never throws. */

/* A host as compared: lower-cased, a port and one trailing dot removed. A bracketed IPv6 literal keeps its brackets. */
function hostKey(host) {
  if (typeof host !== "string") return "";
  let h = host.trim().toLowerCase();
  if (h.startsWith("[")) { const end = h.indexOf("]"); return end > 0 ? h.slice(0, end + 1) : h; }
  const colon = h.indexOf(":");
  if (colon >= 0) h = h.slice(0, colon);
  if (h.endsWith(".")) h = h.slice(0, -1);
  return h;
}

/** `true` exactly when `host` (lower-cased, port and trailing dot removed) equals an entry of `ownHosts` or ends with
 *  one of its suffix entries (`.example.workers.dev`); `false` for anything else, a bad host or list included. */
export function isOwnHost(host, ownHosts) {
  try {
    if (!Array.isArray(ownHosts) || ownHosts.length === 0) return false;
    const h = hostKey(host);
    if (h === "") return false;
    for (const entry of ownHosts) {
      if (typeof entry !== "string") continue;
      const e = entry.trim().toLowerCase();
      if (e === "" || e === ".") continue;
      if (e.startsWith(".") ? h.endsWith(e) : h === hostKey(e)) return true;
    }
    return false;
  } catch {
    return false;
  }
}
