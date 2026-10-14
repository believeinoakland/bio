/* The review copy (registry screen `review-copy`; R2; DEC-100): Projects › <project> › Review copy. The draft's named
 * outside readers, each with what they may read and until when; sharing with a new reader, whose link is shown once and
 * kept nowhere; stopping a share; the readers' comments and the member's replies. Its subject is the project, or
 * `<project>/<draft>` for one draft (the newest otherwise). Every function is self-contained (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";

export const REVIEW_COPY = Object.freeze({
  id: "review-copy",
  parts: PARTS,

  reads: function (view) {
    const project = String(view.subject || "").split("/")[0];
    return {
      project: { op: "image", query: { id: project } },
      drafts: { op: "casedrafts", query: { project: project }, subject: true,
        empty: function (v) { return !v || !Array.isArray(v.drafts) || v.drafts.length === 0; } },
    };
  },

  place: function (view) {
    const id = String(view.subject || "").split("/")[0];
    const p = view.data.project;
    return { project: { id: id, title: view.parts.titleOf(p && p.state === "ok" ? p.value : null, id) } };
  },

  render: function (cs, view) {
    const P = view.parts;
    const want = String(view.subject || "").split("/")[1];
    const d = view.data.drafts;
    const drafts = d && d.state === "ok" && Array.isArray(d.value.drafts) ? d.value.drafts : [];
    const chosen = drafts.find(function (x) { return x.draft_id === want; }) || drafts[drafts.length - 1] || null;
    view.ui.draft = chosen;
    const c = chosen && chosen.case ? chosen.case : {};
    const out = [cs.title(c.identity ? cs.w("screen.review-copy.heading", { case: c.identity, edition: String(c.edition || "") }) : null, { thing: "case" })];
    if (!chosen) { out.push(cs.state("drafts", function () { return ""; }, { empty: "screen.review-copy.nodraft" })); return out.join(""); }

    // The named readers: each a row with what they may read and until when, and "Stop sharing" (R2).
    const copy = P.later(cs, view, "copy", "reviewcopy", { query: { draft: chosen.draft_id } });
    out.push(cs.sec("screen.review-copy.readers", cs.state(copy, function (v) {
      const grants = (Array.isArray(v.grants) ? v.grants : []).filter(function (g) { return !g.revoked_at && !g.revokedAt; });
      if (!grants.length) return '<p class="muted">' + cs.w("screen.review-copy.noreaders") + "</p>";
      return cs.sheet(grants.map(function (g) {
        const id = g.grant_id || g.grantId || "";
        // The end date is in the recipient line; nothing yet ends the link but "Stop sharing" (K3147 (4); N1038).
        return cs.row("", "<b>" + cs.esc(g.recipient || "") + "</b>",
          '<span class="meta">' + cs.w("screen.review-copy.reads.stop", { edition: String(c.edition || "") }) + "</span>",
          cs.act("reviewrevoke", { data: { grant: id } }));
      }).join(""));
    })));

    // Sharing with a named reader: a name, a role and an end date; the secret shown once as the reader's link (R2).
    out.push(cs.sec("screen.review-copy.share", cs.field("rc-name", "screen.review-copy.name.label", { rec: true })
      + cs.field("rc-role", "screen.review-copy.role.label", { rec: true, help: "screen.review-copy.role.help" })
      + cs.field("rc-until", "screen.review-copy.until.label", { type: "date", help: "screen.review-copy.until.help" })
      + '<div class="cs-actrow">' + cs.act("reviewgrant", { tone: "primary" }) + "</div>"
      + (view.ui.link ? '<div class="cs-sheet" data-reader-link><span class="id">' + cs.esc(view.ui.link.href) + "</span><p>"
        + cs.w("screen.review-copy.link.for", { who: view.ui.link.who }) + " <b>" + cs.w("screen.review-copy.noemail") + "</b></p><p class=\"muted\">"
        + cs.w("screen.review-copy.link.once") + "</p></div>" : "")));

    // The readers' comments, each answered by "Reply" (R2).
    if (c.case_id) {
      const comments = P.later(cs, view, "comments", "reviewcomments", { query: { case: c.case_id, edition: String(c.edition || ""), draft: chosen.draft_id } },
        function (v) { return !v || !Array.isArray(v.comments) || v.comments.length === 0; });
      out.push(cs.sec("screen.review-copy.comments", cs.state(comments, function (v) {
        return cs.sheet(v.comments.map(function (x, i) {
          return cs.row("", '<span class="rec">' + cs.esc(x.text) + "</span>",
            '<span class="meta">' + cs.w(x.reviewer_kind === "recipient" ? "screen.review-copy.from.reader" : "screen.review-copy.from.member", { who: x.reviewer || "" })
            + (x.at ? " · " + cs.date(x.at) : "") + "</span>",
            x.reviewer_kind === "recipient" ? cs.field("rc-reply-" + i, "screen.review-copy.reply.label", { area: true }) + cs.act("reviewcomment", { data: { index: String(i) } }) : "");
        }).join(""));
      }, { empty: "screen.review-copy.nocomments" })));
    }
    return out.join("");
  },

  // R2, R11: the reader's link is page memory only, gone when the member leaves the screen.
  closed: function (cs, view) { view.ui.link = null; },

  acts: [
    {
      // R2: a named reader, their role and an end date; the answer's secret drawn once as the reader's link, never kept.
      op: "reviewgrant", label: "act.reviewgrant.label.review-copy", outward: true,
      send: function (view, el, cs) {
        const name = String(cs.value("rc-name") || "").trim();
        const role = String(cs.value("rc-role") || "").trim();
        const until = String(cs.value("rc-until") || "").trim();
        if (!name || !role || !/^\d{4}-\d{2}-\d{2}$/.test(until)) return { refuse: "screen.review-copy.reader.needed" };
        if (!view.ui.draft) return null;
        view.ui.pendingWho = name;
        return { body: { draft: view.ui.draft.draft_id, recipient: name + " · " + role + " · " + until, until: until } };
      },
      done: function (view, answer, cs) {
        const r = view.parts.value(answer) || {};
        view.ui.link = r.secret ? { href: view.origin + "/app/review#grant=" + r.secret, who: view.ui.pendingWho || r.recipient || "" } : null;
        view.ui.pendingWho = null;
        view.parts.forget(view);
      },
    },
    {
      // R2: "Stop sharing" one reader.
      op: "reviewrevoke", label: "act.reviewrevoke.label.review-copy",
      send: function (view, el) { return el.dataset.grant ? { body: { grant: el.dataset.grant } } : null; },
      done: function (view) { view.parts.forget(view); },
    },
    {
      // R2: "Reply" to a reader's comment.
      op: "reviewcomment", label: "act.reviewcomment.label.review-copy",
      send: function (view, el, cs) {
        const text = String(cs.value("rc-reply-" + el.dataset.index) || "").trim();
        if (!text) return { refuse: "screen.review-copy.reply.needed" };
        return view.ui.draft ? { query: { draft: view.ui.draft.draft_id }, body: { text: text } } : null;
      },
      done: function (view) { view.parts.forget(view); },
    },
  ],
});
