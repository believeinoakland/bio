/* The decisions the record routes to a member (screens-daily R75; C62, DEC-378, K4169, K4210), a screen part (interface-shell
   R21, K3002) handed to Home and the queue as `view.parts.routed`: an authority task opens a small form and sends
   `taskdecide`; an endorsement owed on a proposed administrator, an owner vote to add an owner and an expertise awaiting
   confirmation each name the person and carry their own act. `draw(cs, it, o)` answers `{summary, detail, acts}` in HTML, or
   null when the item is none of these or its act is not offered to this session (the caller then draws the item as any
   other); `decide(cs, el)` answers the request of the decision form, or its refusal. Self-contained: it refers only to its
   parameters. */

export function routed() {
  // The kind of decision an item asks. An owner vote to remove an owner is the project's own (its screen draws the act; the
  // registry lists `projectownerremove` on neither Home nor the queue), so it is `ownerremove`: the design's words and an "Open".
  const kindOf = function (it) {
    const k = it ? String(it.kind || "") : "";
    const s = it && it.subject && typeof it.subject === "object" ? it.subject : {};
    if (k === "authority-undetermined") return "authority";
    if (k === "endorsement-owed") return s.kind === "member" ? "endorse" : s.kind === "project" ? (s.change === "remove" || it.door === "projectownerremove" ? "ownerremove" : "owner") : "";
    if (k === "expertise-confirmation-owed") return "expert";
    return "";
  };
  // Whom an item names: the handle its fills carry, else the one on its subject, else the member's own id; never a sentence.
  const whoOf = function (it) {
    const s = it.subject || {};
    const f = it.fills && typeof it.fills === "object" ? it.fills : {};
    const pick = [f.who, s.handle, s.target, s.id].filter(function (x) { return typeof x === "string" && x.trim(); })[0];
    return pick ? String(pick) : "";
  };
  const clean = function (v) { return String(v === undefined || v === null ? "" : v).trim(); };
  // Who has agreed and who is still awaited, as the producer carries them in the item's `basis` (queue-producers R46, R47): the
  // names joined (a plain string, escaped when filled in), or `queue.owed.nobody` when none.
  const listOf = function (cs, list) {
    // R85: the producer carries member ids (the founder's is `admin`); each is named by handle (`cs.memberName`), never by id.
    const names = (Array.isArray(list) ? list : []).map(clean).filter(Boolean).map(function (x) { return cs.memberName(x); });
    return names.length ? names.join(", ") : { html: cs.w("queue.owed.nobody") };
  };

  const draw = function (cs, it, o) {
    const kind = kindOf(it);
    if (!kind) return null;
    const s = it.subject || {};
    const at = o.screen;
    const id = String(it.id || "");
    const label = function (op) { return "act." + op + ".label." + at; };
    // The caller's mark of an item's own act (R79 (a): `queue.act.dothis.help`), if it draws one.
    const mark = typeof o.mark === "function" ? o.mark : function (x) { return x; };
    if (kind === "authority") {
      // The form that answers who issued the document, and the way to pass the task on (`taskforward`).
      const f = o.id;
      const decide = mark(cs.act("taskdecide", { label: "screen.queue.routed.auth.record", data: { item: id, f: f } }));
      if (!decide) return null;
      const g = f + "f";
      const pass = cs.act("taskforward", { label: label("taskforward"), data: { item: id, f: g } });
      const form = '<details class="mk-details"><summary>' + cs.w("screen.queue.routed.auth.open") + "</summary>"
        + cs.checks(f + "-who", "screen.queue.routed.auth.question", [["known", "screen.queue.routed.auth.know"], ["unknown", "screen.queue.routed.auth.cannot"]], { radio: true })
        + cs.field(f + "-issuer", "screen.queue.routed.auth.issuer.label", { help: ["screen.queue.routed.auth.issuer.help1", "screen.queue.routed.auth.issuer.help2"], max: 500 })
        + cs.field(f + "-how", "screen.queue.routed.auth.how.label", { help: ["screen.queue.routed.auth.how.help1", "screen.queue.routed.auth.how.help2"], max: 2000 })
        + cs.field(f + "-tried", "screen.queue.routed.auth.tried.label", { help: ["screen.queue.routed.auth.tried.help1", "screen.queue.routed.auth.tried.help"], max: 2000 })
        + '<p class="mk-small muted">' + cs.w("screen.queue.routed.auth.fine1") + " " + cs.w("screen.queue.routed.auth.fine2") + "</p>" + decide + "</details>";
      const forward = pass ? '<details class="mk-details"><summary>' + cs.w(label("taskforward")) + "</summary>"
        + (typeof o.pick === "function" ? o.pick(g + "-to") : cs.field(g + "-to", "screen.queue.forward.to", {})) + pass + "</details>" : "";
      return { summary: cs.w("screen.queue.routed.auth.item") + (o.ref ? " " + o.ref : ""), detail: cs.w("screen.queue.routed.auth.leaves"), acts: form + forward };
    }
    const basis = it.basis && typeof it.basis === "object" ? it.basis : {};
    if (kind === "endorse") {
      const b = mark(cs.act("adminendorse", { label: label("adminendorse"), data: { item: id, memberId: String(s.id || "") } }));
      if (!b) return null;
      return { summary: cs.w("queue.endorsement-owed.summary", { who: whoOf(it), have: listOf(cs, basis.have), awaiting: listOf(cs, basis.awaiting) }),
        detail: cs.w("queue.endorsement-owed.detail"), acts: b };
    }
    if (kind === "owner" || kind === "ownerremove") {
      const project = cs.ref("project", String(s.id || ""), clean(s.name) || cs.w("queue.source.untitled", { date: { html: cs.date(String((it.age && it.age.since) || "")) } }), []);
      const fills = { who: whoOf(it), project: { html: project }, agreed: listOf(cs, basis.agreed), awaiting: listOf(cs, basis.awaiting) };
      const detail = cs.w("queue.endorsement-owed.owner.detail");
      // A vote to remove an owner is no act of this screen: the item says what it asks and leads to the project, where the act is.
      if (kind === "ownerremove") return { summary: cs.w("queue.endorsement-owed.owner.summary.remove", fills), detail: detail, acts: "" };
      const b = mark(cs.act("projectowneradd", { label: label("projectowneradd"), data: { item: id, projectId: String(s.id || ""), handle: String(s.target || "") } }));
      if (!b) return null;
      return { summary: cs.w("queue.endorsement-owed.owner.summary.add", fills), detail: detail, acts: b };
    }
    // expert: the member and the expertise she declared (record data), and what confirming is.
    const b = mark(cs.act("expertiseconfirm", { label: label("expertiseconfirm"), data: { item: id, memberId: String(s.id || ""), label: String(s.label || "") } }));
    if (!b) return null;
    return { summary: cs.w("queue.expertise-confirmation-owed.summary", { who: whoOf(it), label: clean(s.label) }), detail: cs.w("queue.expertise-confirmation-owed.detail"), acts: b };
  };

  // The request of the decision form (`taskdecide` accepts id, outcome, authority, basis; requires id, outcome, basis): "I know who
  // issued it" needs the issuing party and how she knows; "I could not tell" needs what she tried. Nothing is sent without them.
  const decide = function (cs, el) {
    const f = el.dataset.f;
    const chosen = cs.value(f + "-who");
    const who = Array.isArray(chosen) ? chosen[0] : "";
    if (who === "known") {
      const authority = clean(cs.value(f + "-issuer"));
      const basis = clean(cs.value(f + "-how"));
      if (!authority) return { refuse: "screen.queue.routed.auth.refused.issuer2" };
      if (!basis) return { refuse: "screen.queue.routed.auth.refused.basis" };
      return { body: { id: el.dataset.item, outcome: "determined", authority: authority, basis: basis } };
    }
    if (who === "unknown") {
      const basis = clean(cs.value(f + "-tried"));
      if (!basis) return { refuse: "screen.queue.routed.auth.refused.basis" };
      return { body: { id: el.dataset.item, outcome: "undetermined_after_review", basis: basis } };
    }
    return { refuse: "screen.queue.fieldfirst" };
  };
  // R82 (C4): endorsing the last administrator answers the invitation (`result.invite`), which Members keeps and shows once; so do
  // Home and the queue. `keep` is the act's `done`: it holds the invitation in the page's memory (never the record), and an answer
  // with none clears the earlier one. `shown` draws it, with the sentence that no email is sent, under the act's own redraw.
  const keep = function (view, answer, cs) {
    const a = answer && answer.result !== undefined ? answer.result : answer;
    cs.set("invite", a && a.invite ? { memberId: a.memberId, expires: a.expires, link: (view.origin || "") + "/#invite=" + encodeURIComponent(a.invite) } : undefined);
  };
  const shown = function (cs, ui) {
    const v = ui && ui.invite;
    if (!v || !v.link) return "";
    return '<div class="mk-msg" data-shown="invite"><p>' + cs.w("screen.members.invite.shown", { handle: String(v.memberId || ""), expires: { html: cs.date(String(v.expires || ""), { year: true }) } })
      + "</p><p><code>" + cs.esc(v.link) + '</code></p><p class="mk-note">' + cs.w("screen.members.invite.noemail") + "</p></div>";
  };
  return { kindOf: kindOf, draw: draw, decide: decide, keep: keep, shown: shown };
}

// The refusals of the decision, in their own words (the plane's codes; `provenance` R65, `tasks` R20). Each is self-contained: the
// shell runs it with the refusal and the kit.
export const ROUTED_REFUSALS = {
  AUTHORITY_NO_BASIS: function (r, cs) { return cs.w("screen.queue.routed.auth.refused.basis"); },
  AUTHORITY_NO_ISSUER: function (r, cs) { return cs.w("screen.queue.routed.auth.refused.issuer1") + " " + cs.w("screen.queue.routed.auth.refused.issuer2"); },
  TASK_NOT_YOURS: function (r, cs) { return cs.w("screen.queue.routed.auth.refused.yours1") + " " + cs.w("screen.queue.routed.auth.refused.yours2"); },
};
