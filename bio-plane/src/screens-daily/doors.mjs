/* The doors from Home and the queue to Held captures and the Inbox (screens-daily R65; C13, C14, C15; DEC-374), a screen part
   (interface-shell R21, K3002) handed to both as `view.parts.doors`. `reads()` answers the two reads a screen adds to its own
   (`heldcaptures`, `inbox`); `draw(cs, view, screen)` answers the doors' HTML for `screen` ("home" or "queue"): a door to `held`
   with the number held, when `heldcaptures` answers any (`act.release.label.<screen>`, the registry's "Vouch for photos"), and a
   door to `inbox` with the number of knocks still new. Neither is drawn at zero; a failed read is drawn failed in the door's place,
   never as none. On Home, one status line (`screen.home.waiting.counts`) says both numbers, a zero as 0, whenever either door is
   drawn and both reads answered. Self-contained: it refers only to its parameters. */

export function doors() {
  const none = function (key, keep) {
    return function (v) { return !v || !Array.isArray(v[key]) || v[key].filter(keep || function () { return true; }).length === 0; };
  };
  // The reads: the held captures (the most `heldcaptures` pages in one answer) and the knocks (`inbox`).
  const reads = function () {
    return {
      held: { op: "heldcaptures", query: { limit: "200", fields: "picker" }, empty: none("held") },
      inbox: { op: "inbox", query: { limit: "200" }, empty: none("inbox", function (k) { return k && k.status === "new"; }) },
    };
  };
  const draw = function (cs, view, screen) {
    const rows = [];
    const door = function (data, href, label, name, n, icon) {
      rows.push(cs.row(cs.icon(icon), '<a class="cs-ref" data-nav href="' + href + '"><b>' + cs.w(label) + "</b></a> "
        + '<span class="meta"><b>' + cs.esc(String(n)) + "</b>" + (name ? " " + cs.w(name) : "") + "</span>", "", ""));
    };
    const held = view.data.held;
    const inbox = view.data.inbox;
    const count = function (v, key, keep) {
      return v && v.state === "ok" && v.value && Array.isArray(v.value[key]) ? v.value[key].filter(keep || function () { return true; }).length : v && v.state === "empty" ? 0 : null;
    };
    const nHeld = count(held, "held");
    const nNew = count(inbox, "inbox", function (k) { return k && k.status === "new"; });
    if (held && held.state === "failed") rows.push(cs.state("held", null));
    else if (held && held.state === "ok" && held.value && Array.isArray(held.value.held) && held.value.held.length) {
      door(held, "/app/held", "act.release.label." + screen, "screen.held.name", held.value.held.length, "hold");
    }
    if (inbox && inbox.state === "failed") rows.push(cs.state("inbox", null));
    else if (inbox && inbox.state === "ok" && inbox.value && Array.isArray(inbox.value.inbox)) {
      const fresh = inbox.value.inbox.filter(function (k) { return k && k.status === "new"; }).length;
      if (fresh) door(inbox, "/app/inbox", "screen.inbox.name", "", fresh, "capture");
    }
    // The status line (Home only): both counts, a zero shown as 0, drawn only when something waits and both reads answered.
    const line = screen === "home" && nHeld !== null && nNew !== null && (nHeld || nNew)
      ? '<p class="mk-sub">' + cs.w("screen.home.waiting.counts", { held: String(nHeld), inbox: String(nNew) }) + "</p>" : "";
    return rows.length ? line + cs.sheet(rows.join("")) : "";
  };
  return { reads: reads, draw: draw };
}
