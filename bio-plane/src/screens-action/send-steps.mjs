/* Prepare, approve and record the sending (screens-action R3, R4, R8, R10; DEC-115; v0.2 rule 19): the steps `start-send`
   and `request` share, as one part and the act specs both screens register. Each function is self-contained (interface-
   shell R21 (1)); the shell serialises it beside each screen that names it. The group's Civicsmith sends nothing: the
   member sends by the office's own means and records it here.

   The step an action has reached is read from `filingsfor` (filings R13): its newest draft not yet sent. A prepared draft's
   text is answered only by the act that prepared it (filings names no read of it), so it is kept in the screen's page
   memory (`view.ui.draft`), never in storage; after a reload the draft is approved as it was prepared. */

/** The newest draft not yet recorded sent, and the newest one sent, from `filingsfor`'s answer. */
export function draftsOf(v) {
  const drafts = v && Array.isArray(v.drafts) ? v.drafts.slice() : [];
  drafts.sort(function (a, b) { return String(a.at || "") < String(b.at || "") ? -1 : String(a.at || "") > String(b.at || "") ? 1 : 0; });
  const unsent = drafts.filter(function (d) { return !d.sending; });
  const sent = drafts.filter(function (d) { return d.sending; });
  return { open: unsent.length ? unsent[unsent.length - 1] : null, sent: sent.length ? sent[sent.length - 1] : null };
}

/** The step an action is at: "prepare", "approve", "second" (waiting on a second approval), "send" or "sent". */
export function stepOf(v) {
  const drafts = v && Array.isArray(v.drafts) ? v.drafts.slice() : [];
  drafts.sort(function (a, b) { return String(a.at || "") < String(b.at || "") ? -1 : String(a.at || "") > String(b.at || "") ? 1 : 0; });
  const unsent = drafts.filter(function (x) { return !x.sending; });
  const d = { open: unsent.length ? unsent[unsent.length - 1] : null, sent: drafts.some(function (x) { return x.sending; }) };
  if (d.open && d.open.approval) return d.open.second_needed && !d.open.second_approval ? "second" : "send";
  if (d.open) return "approve";
  if (d.sent) return "sent";
  return "prepare";
}

/** The steps drawn: `o.request` adds the period, form and cost limit fields (R8) and the portal's warning and number. */
export function sendSteps(cs, view, filings, o) {
  const P = view.parts;
  const req = !!(o && o.request);
  const d = P.draftsOf(filings);
  const step = P.stepOf(filings);
  const nosend = '<p class="mk-note">' + cs.w("screen.start-send.nosend") + "</p>";
  const ui = view.ui;
  const n = String(ui.draftN || 0);
  if (step === "sent") {
    const s = d.sent.sending;
    return '<p class="mk-done">' + cs.w("screen.start-send.sent", { date: { html: cs.date(s.sent_on || s.at) } })
      + (s.reference ? " · " + cs.w("screen.start-send.reference", { reference: s.reference }) : "") + "</p>"
      + '<a class="cs-ref" href="/app/action/' + encodeURIComponent(view.subject) + '" data-nav>' + cs.w("screen.start-send.openaction") + "</a>";
  }
  if (step === "second") {
    // R3: while a second approval waits, the screen says so and offers no send.
    return '<p class="mk-note" role="status">' + cs.w("screen.start-send.waitsecond") + "</p>"
      + '<div class="mk-acts">' + cs.act("filingsecondapprove", { data: { filing: d.open.filing } }) + "</div>" + nosend;
  }
  if (step === "send") {
    // R3, R4, R8: the outward warning, then the member's record of the sending: the day, how, and the venue's number.
    return (req ? cs.sec("screen.request.howsend", '<ol class="mk-list"><li>' + cs.w("screen.request.howsend.1") + "</li><li>"
      + cs.w("screen.request.howsend.2") + "</li><li>" + cs.w("screen.request.howsend.3") + "</li><li>" + cs.w("screen.request.howsend.4") + "</li></ol>") : "")
      + '<div class="cs-dialog" role="group" aria-label="' + cs.w("screen.start-send.outward") + '">' + '<span class="cs-tag-outward">' + cs.w("screen.start-send.outward") + "</span>"
      + '<p class="ends">' + cs.w(req ? "screen.request.outward" : "screen.start-send.outward.says") + "</p>"
      + cs.field("send-at", "screen.start-send.sentat", { type: "date", help: "screen.start-send.sentat.help" })
      + cs.field("send-account", "screen.start-send.how", { help: "screen.start-send.how.help" })
      + cs.field("send-reference", req ? "screen.request.reference" : "screen.start-send.reference.field", { help: req ? "screen.request.reference.help" : null })
      + '<div class="mk-acts">' + cs.act("filingrecordsent", { tone: "primary", label: "screen.start-send.recordsent", data: { filing: d.open.filing } }) + "</div></div>" + nosend;
  }
  // prepare, or approve what was prepared
  const draft = ui.draft && (step === "prepare" || (d.open && ui.draft.id === d.open.filing)) ? ui.draft : null;
  const label = draft ? (draft.disclosure && draft.disclosure.machine ? "screen.start-send.draft.machine" : draft.template ? "screen.start-send.draft.template" : "screen.start-send.draft.own") : null;
  const blanks = draft && Array.isArray(draft.blanks) && draft.blanks.length
    ? '<ul class="mk-list">' + draft.blanks.map(function (b) {
      return "<li>" + cs.w("screen.start-send.blank", { name: b.name || "", value: b.value || "", source: b.label || b.source || "" }) + "</li>";
    }).join("") + "</ul>" : "";
  const unfilled = draft && Array.isArray(draft.unfilled) && draft.unfilled.length
    ? '<p class="mk-note">' + cs.w("screen.start-send.unfilled", { names: draft.unfilled.map(function (u) { return u.name; }).join(", ") }) + "</p>" : "";
  const fills = req && step === "prepare" ? '<div class="mk-grid">' + cs.field("req-from", "screen.request.from", { type: "date" }) + cs.field("req-to", "screen.request.to", { type: "date" })
    + cs.choice("req-form", "screen.request.form", [["electronic", "screen.request.form.electronic"], ["spreadsheet", "screen.request.form.spreadsheet"], ["pdf", "screen.request.form.pdf"], ["paper", "screen.request.form.paper"]])
    + cs.field("req-cost", "screen.request.cost", { help: "screen.request.cost.help" }) + "</div>" : "";
  const text = cs.field("send-text-" + n, req ? "screen.request.text" : "screen.start-send.text", {
    area: true, rec: true, value: draft ? draft.text || "" : "", draft: label,
    help: req ? "screen.request.text.help" : "screen.start-send.text.help" });
  const prepared = step === "approve" && !draft ? '<p class="mk-note">' + cs.w("screen.start-send.prepared") + "</p>" : "";
  const acts = step === "prepare"
    ? cs.act("communicationprepare", {}) + cs.act("filingprepare", {})
    : cs.act("filingapprove", { tone: "primary", data: { filing: d.open.filing } });
  return fills + (step === "prepare" || draft ? text : prepared) + blanks + unfilled
    + (req ? '<p class="mk-note">' + cs.w("screen.request.describe") + "</p>" : "")
    + '<div class="mk-acts">' + acts + "</div>" + '<p class="mk-note">' + cs.w("screen.start-send.approvefixes") + "</p>" + nosend;
}

/* The acts, shared by both screens (each registers the ones its registry lists). The action is the screen's subject. */
const keepDraft = function (view, answer, cs) {
  if (answer && answer.id) {
    // the draft first, then a new field id, so the redraw draws the draft's text and not what was typed before
    cs.set("draft", { id: answer.id, text: answer.text, blanks: answer.blanks, unfilled: answer.unfilled, template: answer.template || null,
      disclosure: answer.disclosure || null });
    cs.set("draftN", (view.ui.draftN || 0) + 1);
  }
};

export const PREPARE = Object.freeze({
  // R3, R4, R8: what is sent, in the member's own words, with the period, form and cost limit as `fills` on a request.
  op: "communicationprepare",
  send: function (view, el, cs) {
    const text = String(cs.value("send-text-" + (view.ui.draftN || 0)) || "").trim();
    if (!text) return { refuse: "screen.start-send.text.needed" };
    const body = { action: view.subject, purpose: view.ui.purpose || "request", text: text };
    if (view.parts.isRequest && view.parts.isRequest()) {
      const from = String(cs.value("req-from") || ""), to = String(cs.value("req-to") || ""), cost = String(cs.value("req-cost") || "").trim();
      const fills = {};
      if (from || to) fills.period = from + " – " + to;
      const form = cs.value("req-form");
      if (form) fills.form = String(form);
      if (cost) fills.cost_limit = cost;
      if (Object.keys(fills).length) body.fills = fills;
    }
    return { body: body };
  },
  done: keepDraft,
});

export const PREPARE_FILING = Object.freeze({
  // R3: the filing from the group's template for this kind, or the member's text where she wrote one.
  op: "filingprepare",
  send: function (view, el, cs) {
    const text = String(cs.value("send-text-" + (view.ui.draftN || 0)) || "").trim();
    return { body: text ? { action: view.subject, text: text } : { action: view.subject } };
  },
  done: keepDraft,
});

export const APPROVE = Object.freeze({
  // R3: terminal: approving fixes the text (the shell's dialog says so, `act.filingapprove.does`).
  op: "filingapprove",
  send: function (view, el, cs) {
    const body = { filing: el.dataset.filing };
    if (view.ui.draft && view.ui.draft.id === el.dataset.filing) {
      const t = cs.value("send-text-" + (view.ui.draftN || 0));
      if (typeof t === "string" && t.trim() && t !== view.ui.draft.text) body.text = t;
    }
    return { body: body };
  },
});

export const SECOND = Object.freeze({
  // R3: by a member other than the first approver (filings refuses `SAME_APPROVER` otherwise).
  op: "filingsecondapprove",
  send: function (view, el) { return { body: { filing: el.dataset.filing } }; },
});

export const RECORD_SENT = Object.freeze({
  // R3, R4, R8: the member sent it by the office's own means; this records the day, how, and the venue's reference.
  op: "filingrecordsent", outward: true,
  send: function (view, el, cs) {
    const at = String(cs.value("send-at") || "").trim();
    const account = String(cs.value("send-account") || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(at)) return { refuse: "screen.start-send.sentat.needed" };
    if (!account) return { refuse: "screen.start-send.how.needed" };
    const body = { filing: el.dataset.filing, at: at, account: account };
    const ref = String(cs.value("send-reference") || "").trim();
    if (ref) body.reference = ref;
    return { body: body };
  },
  refusals: { SENT_REFERENCE_MALFORMED: "screen.request.reference.malformed", SECOND_APPROVAL_NEEDED: "screen.start-send.waitsecond" },
});
