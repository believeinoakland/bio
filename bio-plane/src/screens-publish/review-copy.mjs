/* The review copy (registry screen `review-copy`; R2; DEC-100): Projects › <project> › Review copy. The draft's named
 * outside readers, each with what they may read and until when; sharing with a new reader, whose link is shown once and
 * kept nowhere; stopping a share; the readers' comments and the member's replies. Its subject is the project, or
 * `<project>/<draft>` for one draft (the newest otherwise). Every function is self-contained (interface-shell R21 (1)). */
import { PARTS } from "./parts.mjs";
import { REVIEW_COPY_FILE } from "./review-copy-file.mjs";

export const REVIEW_COPY = Object.freeze({
  id: "review-copy",
  parts: Object.freeze({ ...PARTS, ...REVIEW_COPY_FILE }),

  reads: function (view) {
    if (!view.parts.subject(view, 1)) return {}; // K3171: no subject in the address, no subject read
    const project = String(view.subject || "").split("/")[0];
    return {
      // The project is the subject (a project with no draft yet is not an unknown subject: R20's one empty state is drawn).
      project: { op: "image", query: { id: project }, subject: true },
      drafts: { op: "casedrafts", query: { project: project },
        empty: function (v) { return !v || !Array.isArray(v.drafts) || v.drafts.length === 0; } },
    };
  },

  place: function (view) {
    const id = String(view.subject || "").split("/")[0];
    const p = view.data.project;
    return { project: { id: id, title: view.parts.titleOf(p && p.state === "ok" ? p.value : null, id) } };
  },

  render: function (cs, view) {
    if (!view.parts.subject(view, 1)) return view.parts.nothing(cs);
    const P = view.parts;
    const want = String(view.subject || "").split("/")[1];
    const d = view.data.drafts;
    const drafts = d && d.state === "ok" && Array.isArray(d.value.drafts) ? d.value.drafts : [];
    const chosen = drafts.find(function (x) { return x.draft_id === want; }) || drafts[drafts.length - 1] || null;
    view.ui.draft = chosen;
    const c = chosen && chosen.case ? chosen.case : {};
    const out = [cs.title(c.identity ? P.plain(cs.w("screen.review-copy.heading", { case: c.identity, edition: String(c.edition || "") })) : null, { thing: "case" })];
    if (!chosen) { out.push(cs.state("drafts", function () { return ""; }, { empty: "screen.review-copy.nodraft" })); return out.join(""); }

    // The named readers: each a row with what they may read and until when, and "Stop sharing" (R2, R18).
    const copy = P.later(cs, view, "copy", "reviewcopy", { query: { draft: chosen.draft_id } });
    out.push(P.sec(cs, "screen.review-copy.readers", cs.state(copy, function (v) {
      const grants = (Array.isArray(v.grants) ? v.grants : []).filter(function (g) { return !g.revoked_at && !g.revokedAt; });
      if (!grants.length) return "";
      // R18, R27: the end is drawn in the team's zone, as the copy answer carries it on each row (`review` R35).
      const held = P.copyZone(v).zone;
      return cs.sheet(grants.map(function (g) {
        const id = g.grant_id || g.grantId || "";
        const until = typeof g.until === "string" && g.until ? g.until : "";
        const zone = typeof g.zone === "string" && g.zone ? g.zone : held;
        const ended = until && Date.parse(until) <= cs.now();
        const day = until ? P.localDay(until, zone) || until : "";
        const says = !until ? cs.w("screen.review-copy.reads.stop", { edition: String(c.edition || "") })
          : ended ? cs.w("screen.review-copy.reads.ended", { edition: String(c.edition || ""), until: { html: cs.date(day) } })
            : P.untilIn(cs, view, until, zone) || cs.w("screen.review-copy.reads.until", { until: { html: cs.date(day) } });
        return cs.row("", "<b>" + cs.esc(g.recipient || "") + "</b>", '<span class="meta" data-grant-until="' + (ended ? "ended" : until ? "until" : "open") + '">' + says + "</span>",
          cs.act("reviewrevoke", { data: { grant: id } }));
      }).join(""));
    })) + P.said(view, "reviewrevoke"));

    // Sharing with a named reader: a name, a role and an end date; the secret shown once as the reader's link (R2).
    out.push(cs.sec("screen.review-copy.share", cs.field("rc-name", "screen.review-copy.name.label", { rec: true })
      + cs.field("rc-role", "screen.review-copy.role.label", { rec: true, help: "screen.review-copy.role.help" })
      + cs.field("rc-until", "screen.review-copy.until.label", { type: "date", help: "screen.review-copy.until.help" })
      + '<div class="mk-acts">' + cs.act("reviewgrant", { tone: "primary" }) + (view.ui.export ? "" : cs.act("reviewexport", { data: { step: "open" } })) + "</div>" + P.said(view, "reviewgrant")
      + (view.ui.link ? '<div class="cs-sheet" data-reader-link><span class="id">' + cs.esc(view.ui.link.href) + "</span><p>"
        + cs.w("screen.review-copy.link.for", { who: view.ui.link.who }) + " <b>" + cs.w("screen.review-copy.noemail") + "</b></p><p class=\"muted\">"
        + cs.w("screen.review-copy.link.once") + "</p></div>" : "")));

    // R40 (A81): "Save as a file": the warning, what the file carries, the one box, and the file handed over to save
    if (view.ui.export) {
      const done = view.ui.exported || null;
      const row = function (text) { return cs.row("", text, ""); };
      out.push(cs.sec("screen.review_copy.save.this.copy.as.a", '<div class="cs-gap" data-gap="refused" data-recall><span><b>' + cs.w("screen.review_copy.a.file.can.t.be") + "</b> "
        + cs.w("screen.review_copy.once.it.leaves.your.device") + " " + cs.w("screen.review_copy.stopping.the.sharing.of.a") + " " + cs.w("screen.review_copy.if.what.you.need.is") + "</span></div>"));
      out.push(cs.sec("screen.review_copy.what.the.file.carries", cs.sheet(row(cs.w("screen.review_copy.a.code.that.names.exactly")) + row(cs.w("screen.review_copy.the.date.this.copy.last"))
        + row(cs.w("screen.review_copy.the.minimum.strengths.it.was"))) + '<p class="mk-note">' + cs.w("screen.review_copy.the.file.does.not.say") + " " + cs.w("screen.review_copy.its.fingerprint.covers.them.so") + "</p>"));
      out.push(cs.choice("rc-export-ack", "screen.review_copy.before.you.save.it", [{ value: "", text: "–" }, { value: "yes", key: "screen.review_copy.i.understand.that.this.file" }],
        { acts: { yes: "reviewexport" }, act: { tone: "primary", data: { step: "save" } } }));
      out.push(P.said(view, "reviewexport"));
      if (done && done.name) out.push('<div class="mk-acts" data-export-ready>' + cs.save(done.name, done.text) + "</div>");
      if (done && done.unstamped) out.push(P.fold(cs, "screen.review_copy.when.the.copy.can.t", "<p>" + cs.w("screen.review_copy.this.copy.could.not.be") + " " + cs.w("screen.review_copy.no.file.was.made") + "</p>"));
      if (done && done.declined) out.push(P.fold(cs, "screen.review_copy.when.this.browser.doesn.t", "<p>" + cs.w("screen.review_copy.this.browser.did.not.accept") + " " + cs.w("screen.review_copy.nothing.left.this.page") + "</p>"));
    }

    // The readers' comments, each answered by "Reply" (R2).
    if (c.case_id) {
      const comments = P.later(cs, view, "comments", "reviewcomments", { query: { case: c.case_id, edition: String(c.edition || ""), draft: chosen.draft_id } },
        function (v) { return !v || !Array.isArray(v.comments) || v.comments.length === 0; });
      out.push(P.sec(cs, "screen.review-copy.comments", P.listed(cs, comments, function (v) {
        return cs.sheet(v.comments.map(function (x, i) {
          return cs.row("", '<span class="rec">' + cs.esc(x.text) + "</span>",
            '<span class="meta">' + cs.w(x.reviewer_kind === "recipient" ? "screen.review-copy.from.reader" : "screen.review-copy.from.member", { who: x.reviewer || "" })
            + (x.at ? " · " + cs.date(x.at) : "") + "</span>",
            x.reviewer_kind === "recipient" ? cs.field("rc-reply-" + i, "screen.review-copy.reply.label", { area: true }) + cs.act("reviewcomment", { data: { index: String(i) } }) : "");
        }).join(""));
      }) + P.said(view, "reviewcomment")));
    }
    return out.join("");
  },

  // R2, R11: the reader's link is page memory only, gone when the member leaves the screen.
  closed: function (cs, view) { view.ui.link = null; view.ui.export = false; view.ui.exported = null; },

  acts: [
    {
      // R2: a named reader, their role and an end date; the answer's secret drawn once as the reader's link, never kept.
      op: "reviewgrant", label: "act.reviewgrant.label.review-copy", outward: true,
      refusals: { REVIEW_BAD_UNTIL: "screen.review-copy.until.bad" },
      send: async function (view, el, cs) {
        const P = view.parts;
        const name = String(cs.value("rc-name") || "").trim();
        const role = String(cs.value("rc-role") || "").trim();
        const day = String(cs.value("rc-until") || "").trim();
        if (!name || !role || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return { refuse: "screen.review-copy.reader.needed" };
        const held = view.ui.later && view.ui.later.copy;
        const copy = held && held.state === "ok" ? held.value : null;
        if (!view.ui.draft || !copy) return null;
        // R18, R27, R41: the end of the chosen day in the team's zone, as an instant in the record's stamp form; the zone is the
        // member door's copy answer's own, at its top level whether or not the draft has a grant (`review` R35); with none held
        // the share is refused in its fold and nothing is sent.
        const zone = P.copyZone(copy).zone;
        if (!zone) {
          const key = view.me && view.me.administer === true ? "screen.review-copy.until.nozone" : "screen.review-copy.until.nozone.member";
          P.say(cs, view, "reviewgrant", P.fold(cs, "screen.review-copy.until.nozone.summary", "<p>" + cs.w(key) + "</p>"), false);
          return null;
        }
        const until = P.endOfDay(day, zone);
        if (!until) return { refuse: "screen.review-copy.reader.needed" };
        view.ui.pendingWho = name;
        return { body: { draft: view.ui.draft.draft_id, recipient: name + " · " + role, until: until } };
      },
      done: function (view, answer, cs) {
        if (view.parts.refused(cs, view, "reviewgrant", answer)) return; // D29: a refusal inside a success shows no link
        const r = view.parts.value(answer) || {};
        view.ui.link = r.secret ? { href: view.origin + "/app/review#grant=" + r.secret, who: view.ui.pendingWho || r.recipient || "" } : null;
        view.ui.pendingWho = null;
        view.parts.forget(view);
      },
    },
    {
      // R40 (A81): the browser act "Save as a file": it opens the saving (the warning, what the file carries, the one box); once the
      // box is ticked, the same act reads the copy once, makes one stamped file in the page and hands it over to save. Nothing is
      // written to the plane, stored or put in an address; the file carries no grant secret, reader's name or comment.
      op: "reviewexport", label: "act.owed_reviewexport.label.review-copy",
      send: async function (view, el, cs) {
        const P = view.parts;
        if (el.dataset.step !== "save") { cs.set("export", true); return null; }
        if (cs.value("rc-export-ack") !== "yes" || !view.ui.draft) return null;
        const answer = await cs.call("reviewcopy", { query: { draft: view.ui.draft.draft_id } });
        if (!answer || P.carried(answer)) { P.refused(cs, view, "reviewexport", answer || { ok: false }); return null; }
        const copy = P.value(answer), stamp = P.stampOf(copy);
        if (view.ui.said) delete view.ui.said.reviewexport;
        if (!stamp) view.ui.exported = { unstamped: true };
        else if (typeof Blob !== "function" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") view.ui.exported = { declined: true };
        else view.ui.exported = { name: P.fileName(copy, stamp), text: P.stampedFile(cs, copy, stamp) };
        cs.set("export", true);
        return null;
      },
    },
    {
      // R2: "Stop sharing" one reader.
      op: "reviewrevoke", label: "act.reviewrevoke.label.review-copy",
      send: function (view, el) { return el.dataset.grant ? { body: { grant: el.dataset.grant } } : null; },
      done: function (view, answer, cs) { if (!view.parts.refused(cs, view, "reviewrevoke", answer)) view.parts.forget(view); }, // D29
    },
    {
      // R2: "Reply" to a reader's comment.
      op: "reviewcomment", label: "act.reviewcomment.label.review-copy",
      send: function (view, el, cs) {
        const text = String(cs.value("rc-reply-" + el.dataset.index) || "").trim();
        if (!text) return { refuse: "screen.review-copy.reply.needed" };
        return view.ui.draft ? { query: { draft: view.ui.draft.draft_id }, body: { text: text } } : null;
      },
      done: function (view, answer, cs) { if (!view.parts.refused(cs, view, "reviewcomment", answer)) view.parts.forget(view); }, // D29
    },
  ],
});
