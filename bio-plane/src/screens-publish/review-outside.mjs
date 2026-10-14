/* A review copy, from outside (registry screen `review-outside`; R17; DEC-201 (8)), drawn in the published frame with
 * no session at `/app/review#grant=<secret>`: the draft the group shared, until when the link works, and the reader's
 * comment. The secret travels only in each request's body (`reviewcopy`, `reviewcomment`); the shell takes the fragment
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
    return secret ? { copy: { op: "reviewcopy", body: { secret: secret }, subject: true } } : {};
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
    const until = g.until || g.expires_at || g.expires || null;
    out.push('<p class="mk-sub">' + cs.w(until ? "screen.review-outside.until" : "screen.review-outside.untilstopped", { until: { html: until ? cs.date(until) : "" } }) + "</p>");
    out.push('<p class="cs-note">' + cs.w("screen.review-outside.comments.go") + "</p>");
    const a = copy.authored || {};
    out.push(cs.sec("screen.review-outside.draft", (a.scope ? '<p class="rec">' + cs.esc(a.scope) + "</p>" : "")
      + (a.statement ? '<p class="rec">' + cs.esc(a.statement) + "</p>" : "")
      + (Array.isArray(copy.findings) && copy.findings.length ? cs.sheet(copy.findings.map(function (f) {
        return cs.row("", '<span class="rec">' + cs.esc(f.text || f.detail || f.target || "") + "</span>", "");
      }).join("")) : "")));
    out.push(cs.sec("screen.review-outside.comment", cs.field("ro-comment", "screen.review-outside.comment.label", { area: true, help: "screen.review-outside.comment.help" })
      + '<div class="cs-actrow">' + cs.act("reviewcomment", { tone: "primary" }) + "</div>" + P.said(view, "reviewcomment")));
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
        cs.fill("ro-comment", "");
        view.parts.say(cs, view, "reviewcomment", cs.w("screen.review-outside.sent"));
        return { stay: true };
      },
    },
  ],
});
