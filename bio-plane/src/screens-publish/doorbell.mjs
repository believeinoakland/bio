/* The doorbell's page (registry screen `doorbell`; R9; DEC-78), drawn in the public frame with no session
 * (interface-shell R30) at `/app/doorbell`, headed by the group's public name: what happens to what is sent, a file, a
 * note and a secret phrase, each optional but the material; "Hand it over" sends them with no credential. The secret
 * phrase is never kept by the page. Every function is self-contained (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const DOORBELL = Object.freeze({
  id: "doorbell",
  parts: PARTS,

  reads: function () { return { group: { op: "groupidentity" } }; },

  render: function (cs, view) {
    const g = view.data.group && view.data.group.state === "ok" ? view.data.group.value : null;
    const group = g ? g.display_name || g.group || "" : "";
    const out = [];
    out.push('<div class="mk-setuphead"><span class="grp">' + cs.esc(group) + "</span></div>");
    out.push(cs.title(group ? cs.w("screen.doorbell.heading", { group: group }) : null));
    out.push('<p class="mk-sub">' + cs.w("screen.doorbell.sub") + "</p>");
    out.push('<ul class="cs-list" data-what-happens>' + ["only", "reads", "phrase", "court"].map(function (k) { return "<li>" + cs.w("screen.doorbell.happens." + k) + "</li>"; }).join("") + "</ul>");
    if (view.ui.received) {
      out.push('<p class="cs-note" role="status" data-received>' + cs.w("screen.doorbell.received", { at: { html: cs.date(view.ui.received.at) } }) + "</p>");
    }
    out.push(cs.field("db-file", "screen.doorbell.file.label", { type: "file", help: "screen.doorbell.file.help" })
      + cs.field("db-note", "screen.doorbell.note.label", { area: true })
      + cs.field("db-secret", "screen.doorbell.secret.label", { type: "password", autocomplete: "off", help: "screen.doorbell.secret.help" })
      + '<div class="cs-actrow">' + cs.act("knock", { tone: "primary" }) + "</div>");
    return out.join("");
  },

  acts: [
    {
      // R9: "Hand it over": the file, the note and the secret phrase, sent with no credential; refusals by their words.
      op: "knock", label: "act.knock.label.doorbell",
      refusals: { KNOCK_EMPTY: "screen.doorbell.refused.empty", KNOCK_PAYLOAD_TOO_LARGE: "screen.doorbell.refused.large",
        KNOCK_ENVELOPE_TOO_LARGE: "screen.doorbell.refused.large", KNOCKER_SECRET_WEAK: "screen.doorbell.refused.weak",
        RATE_IP: "screen.doorbell.refused.rate", RATE_GLOBAL: "screen.doorbell.refused.rate", BAD_CONTENT: "screen.doorbell.refused.content",
        KNOCK_NOT_STORED: "screen.doorbell.refused.notstored", REQUIRED_ARGUMENT_MISSING: "screen.doorbell.refused.empty" },
      send: async function (view, el, cs) {
        const f = cs.file("db-file");
        const note = String(cs.value("db-note") || "").trim();
        const secret = String(cs.value("db-secret") || "");
        if (!f) return { refuse: "screen.doorbell.refused.empty" };
        if (secret && secret.length < 20) return { refuse: "screen.doorbell.refused.weak" };
        const bytes = new Uint8Array(await f.arrayBuffer());
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
        const body = { contentB64: btoa(bin) };
        if (note) body.note = note;
        if (secret) body.knockerSecret = secret;
        return { body: body };
      },
      done: function (view, answer, cs) {
        view.ui.received = { at: new Date(cs.now()).toISOString() };
        if (typeof cs.fill === "function") cs.fill("db-note", "");
        return { stay: true };
      },
    },
  ],
});
