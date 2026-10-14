/* A review copy, from outside (registry screen `review-outside`; R17; DEC-201 (8)), drawn in the published frame with
 * no session at `/app/review#grant=<secret>`: the draft the group shared, until when the link works, and the reader's
 * comment, and (R23) the reader's acknowledgement of what the case says it does not cover. The secret travels only in each
 * request's body (`reviewcopy`, `reviewcomment`, `statementack`); the shell takes the fragment
 * off the address on load and hands it in as `view.fragment.grant` (interface-shell R46, R9's route). Every function is
 * self-contained (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const REVIEW_OUTSIDE = Object.freeze({
  id: "review-outside",
  parts: PARTS,

  reads: function (view) {
    // interface-shell R46: the fragment read once on load, removed from the address, handed in as `{grant}`.
    const f = view.fragment;
    const secret = f && typeof f.grant === "string" ? f.grant : "";
    view.ui.secret = secret;
    return secret ? { copy: { op: "reviewcopy", body: { secret: secret } } } : {};
  },

  render: function (cs, view) {
    const P = view.parts;
    const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
    const out = [];
    if (!view.ui.secret) { out.push(cs.title(null), '<p role="alert">' + cs.w("screen.review-outside.nolink") + "</p>"); return out.join(""); }
    const c = copy && copy.case ? copy.case : {};
    out.push(cs.title(c.identity ? cs.w("screen.review-outside.heading", { case: c.identity, edition: String(c.edition || "") }) : null, { thing: "case" }));
    if (!copy) { out.push(cs.state("copy", function () { return ""; })); return out.join(""); }
    const g = copy.grant || {};
    const until = typeof g.until === "string" && g.until ? g.until : null; // R18: the recipient's own grant part
    // R18 (K3295): the instant's date and time with UTC named, until `review` carries the group's zone.
    const at = until ? new Date(until) : null;
    out.push('<p class="mk-sub">' + cs.w(until ? "screen.review-outside.until" : "screen.review-outside.untilstopped",
      { date: { html: until ? cs.date(until) : "" }, time: at && !isNaN(at.getTime()) ? at.toISOString().slice(11, 16) : "" }) + "</p>");
    out.push('<p class="mk-note">' + cs.w("screen.review-outside.comments.go") + "</p>");
    const a = copy.authored || {};
    out.push(P.sec(cs, "screen.review-outside.draft", (a.scope ? '<p class="rec">' + cs.esc(a.scope) + "</p>" : "")
      + (Array.isArray(copy.findings) && copy.findings.length ? cs.sheet(copy.findings.map(function (f) {
        return cs.row("", '<span class="rec">' + cs.esc(f.text || f.detail || f.target || "") + "</span>", "");
      }).join("")) : "")));
    // R23 (N1094; DEC-240 (C2)): what the case says it does not cover, the reader's note and "Acknowledge it"; a copy with
    // no statement draws no section.
    out.push(typeof a.statement === "string" && a.statement ? cs.sec("review.statement.title", '<p class="rec">' + cs.esc(a.statement) + "</p>"
      + cs.field("ro-note", "review.statement.note", { area: true, help: "review.statement.note.help" })
      + '<div class="mk-acts">' + cs.act("statementack", { label: "review.statement.ack", tone: "primary" }) + "</div>" + P.said(view, "statementack"), { help: "review.statement.help" }) : "");
    out.push(cs.sec("screen.review-outside.comment", cs.field("ro-comment", "screen.review-outside.comment.label", { area: true, help: "screen.review-outside.comment.help" })
      + '<div class="mk-acts">' + cs.act("reviewcomment", { tone: "primary" }) + "</div>" + P.said(view, "reviewcomment")));
    return out.join("");
  },

  // R11: the secret is page memory only, gone when the reader leaves.
  closed: function (cs, view) { view.ui.secret = ""; },

  acts: [
    {
      // R17: "Send your comment": the comment and the secret in the body, never in the address.
      op: "reviewcomment", label: "act.reviewcomment.label.review-outside",
      send: function (view, el, cs) {
        const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
        const text = String(cs.value("ro-comment") || "").trim();
        if (!copy || !view.ui.secret) return null;
        if (!text) return { refuse: "screen.review-outside.comment.needed" };
        return { query: { draft: String(copy.draft || "") }, body: { text: text, secret: view.ui.secret } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "reviewcomment", answer)) return { stay: true }; // D29: not sent on a refusal
        cs.fill("ro-comment", "");
        view.parts.say(cs, view, "reviewcomment", cs.w("screen.review-outside.sent"));
        return { stay: true };
      },
    },
    {
      // R23: "Acknowledge it": the draft, the reader's note as the reason, and the secret in the body only, as `reviewcomment`
      // sends it; an empty note sends nothing.
      op: "statementack", label: "act.statementack.label.review-outside", reasonField: "reason",
      refusals: { STATEMENT_ACK_NO_REASON: "screen.case-editor.ack.reason.needed" },
      send: function (view, el, cs) {
        const copy = view.data.copy && view.data.copy.state === "ok" ? view.data.copy.value : null;
        if (!copy || !view.ui.secret) return null;
        const note = String(cs.value("ro-note") || "").trim();
        if (!note) return { refuse: "screen.case-editor.ack.reason.needed" };
        return { query: { draft: String(copy.draft || "") }, body: { reason: note, secret: view.ui.secret } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "statementack", answer)) return { stay: true }; // D29
        cs.fill("ro-note", "");
        view.parts.say(cs, view, "statementack", cs.w("screen.review-outside.sent"));
        return { stay: true };
      },
    },
  ],
});
