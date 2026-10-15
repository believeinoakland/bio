/* Prepare, approve and record the sending (screens-action R3, R4, R8, R10; DEC-115; v0.2 rule 19): the steps `start-send`
   and `request` share, as one part and the act specs both screens register. Each function is self-contained (interface-
   shell R21 (1)); the shell serialises it beside each screen that names it. The group's Civicsmith sends nothing: the
   member sends by the office's own means and records it here.

   The step an action has reached is read from `filingsfor` (filings R13): its newest draft not yet sent. A prepared draft's
   text comes from the act that prepared it and, on a load that finds one prepared and not yet approved, from `filingread`
   (filings R59; screens-action R11): the same text, blanks with their sources, unfilled blanks with why, the member's fills,
   the advisory and the offers. It is kept in the screen's page memory (`view.ui.draft`), never in storage; reading
   prepares nothing. */

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

/** A prepared draft as the screen draws it, from what `communicationprepare`, `filingprepare` or `filingread` answered. */
export function draftOf(a) {
  return { id: a.id || a.filing, text: a.text, blanks: Array.isArray(a.blanks) ? a.blanks : [], unfilled: Array.isArray(a.unfilled) ? a.unfilled : [],
    template: a.template || null, disclosure: a.disclosure || null, advisory: typeof a.advisory === "string" && a.advisory ? a.advisory : null,
    offers: Array.isArray(a.offers) ? a.offers : [] };
}

/** R11: reads the prepared draft the action holds, once per filing, through `filingread`; keeps it in the page's memory
 *  as `ui.draft` (and a new text field id, so the redraw draws its text). Answers the read's state while it is not there. */
export function readFiling(cs, view, filing) {
  const ui = view.ui;
  const L = ui.read || (ui.read = {});
  if (!L[filing]) {
    L[filing] = { state: "loading" };
    const settle = function (o) { L[filing] = o; cs.set("read", L); };
    cs.call("filingread", { query: { filing: filing } }).then(function (a) {
      const r = a && a.result !== undefined ? a.result : a;
      if (!r || r.ok === false) {
        const code = String((r && (r.code || r.reason)) || "");
        settle({ state: code === "NO_SUCH_FILING" ? "absent" : "failed", refusal: { code: code, words: cs.esc((r && r.translation) || code) } });
      } else {
        cs.set("draft", view.parts.draftOf(r));
        cs.set("draftN", (view.ui.draftN || 0) + 1);
        settle({ state: "ok" });
      }
    }, function () { settle({ state: "failed", refusal: null }); });
  }
  return L[filing];
}

/** The steps drawn: `o.request` adds the period, form and cost limit fields (R8) and the portal's warning and number. */
export function sendSteps(cs, view, filings, o) {
  const P = view.parts;
  const req = !!(o && o.request);
  const d = P.draftsOf(filings);
  const step = P.stepOf(filings);
  const nosend = '<p class="mk-note">' + cs.w("screen.start-send.nosend") + "</p>";
  // R19: a sentence whose particulars (the law's citation, the portal, its button, the department) the record does not
  // give is not drawn, never drawn with a placeholder in it
  const part = function (key) { const s = cs.w(key); return /\{\w+\}/.test(s) ? "" : s; };
  const ui = view.ui;
  const n = String(ui.draftN || 0);
  if (step === "sent") {
    const s = d.sent.sending;
    return '<p class="mk-note" role="status">' + cs.w("screen.start-send.sent", { date: { html: cs.date(s.sent_on || s.at) } })
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
    const how = req ? [1, 2, 3, 4].map(function (n) { return part("screen.request.howsend." + n); }).filter(Boolean) : [];
    return (how.length ? cs.sec("screen.request.howsend", '<ol class="mk-list"><li>' + how.join("</li><li>") + "</li></ol>") : "")
      + '<div class="cs-dialog" role="group" aria-label="' + cs.w("screen.start-send.outward") + '">' + '<span class="cs-tag-outward">' + cs.w("screen.start-send.outward") + "</span>"
      + '<p class="ends">' + cs.w(req ? "screen.request.outward" : "screen.start-send.outward.says") + "</p>"
      + cs.field("send-at", "screen.start-send.sentat", { type: "date", help: "screen.start-send.sentat.help" })
      + cs.field("send-account", "screen.start-send.how", { help: "screen.start-send.how.help" })
      + cs.field("send-reference", req ? "screen.request.reference" : "screen.start-send.reference.field", { help: req ? "screen.request.reference.help" : null })
      + '<div class="mk-acts">' + cs.act("filingrecordsent", { tone: "primary", label: "screen.start-send.recordsent", data: { filing: d.open.filing } }) + "</div></div>" + nosend;
  }
  // R11: a draft prepared and not yet approved is read again on load; nothing is prepared again by reading.
  let reading = null;
  if (step === "approve" && !(ui.draft && ui.draft.id === d.open.filing)) {
    const r = P.readFiling(cs, view, d.open.filing);
    if (r.state === "absent") reading = cs.state({ state: "empty" }, null, { empty: "shell.unavailable.nothing" });
    else if (r.state !== "ok") reading = cs.state(r);
  }
  // prepare, or approve what was prepared
  const draft = ui.draft && (step === "prepare" || (d.open && ui.draft.id === d.open.filing)) ? ui.draft : null;
  const label = draft ? (draft.disclosure && draft.disclosure.machine ? "screen.start-send.draft.machine" : draft.template ? "screen.start-send.draft.template" : "screen.start-send.draft.own") : null;
  const blanks = draft && Array.isArray(draft.blanks) && draft.blanks.length
    ? '<ul class="mk-list">' + draft.blanks.map(function (b) {
      const own = b.label && typeof b.label === "object" && b.label.kind === "member_fill";
      return "<li>" + (own ? cs.w("screen.start-send.blank.own", { name: b.name || "", value: b.value || "" })
        : cs.w("screen.start-send.blank", { name: b.name || "", value: b.value || "", source: b.source || "" })) + "</li>";
    }).join("") + "</ul>" : "";
  const unfilled = draft && Array.isArray(draft.unfilled) && draft.unfilled.length
    ? '<p class="mk-note">' + cs.w("screen.start-send.unfilled", { names: draft.unfilled.map(function (u) { return u.name; }).join(", ") }) + "</p>"
      + '<ul class="mk-list">' + draft.unfilled.filter(function (u) { return u.why; }).map(function (u) {
        return "<li>" + cs.w("screen.start-send.unfilled.why", { name: u.name || "", why: u.why }) + "</li>";
      }).join("") + "</ul>" : "";
  const advisory = draft && draft.advisory ? '<p class="mk-note">' + cs.w("screen.start-send.advisory", { advisory: draft.advisory }) + "</p>" : "";
  const offers = draft && Array.isArray(draft.offers) && draft.offers.includes("counsel_packet")
    ? '<p class="mk-note">' + cs.w("screen.start-send.offer.counsel_packet") + "</p>" : "";
  const fills = req && step === "prepare" ? cs.field("req-from", "screen.request.from", { type: "date" }) + cs.field("req-to", "screen.request.to", { type: "date" })
    + cs.choice("req-form", "screen.request.form", [["electronic", "screen.request.form.electronic"], ["spreadsheet", "screen.request.form.spreadsheet"], ["pdf", "screen.request.form.pdf"], ["paper", "screen.request.form.paper"]])
    + cs.field("req-cost", "screen.request.cost", { help: "screen.request.cost.help" }) : "";
  const text = cs.field("send-text-" + n, req ? "screen.request.text" : "screen.start-send.text", {
    area: true, rec: true, value: draft ? draft.text || "" : "", draft: label,
    help: req ? "screen.request.text.help" : "screen.start-send.text.help" });
  const acts = step === "prepare"
    ? cs.act("communicationprepare", {}) + cs.act("filingprepare", {})
    : cs.act("filingapprove", { tone: "primary", data: { filing: d.open.filing } });
  if (reading) return reading + nosend;
  return fills + (step === "prepare" || draft ? text : "") + blanks + unfilled + advisory + offers
    + (req && part("screen.request.describe") ? '<p class="mk-note">' + part("screen.request.describe") + "</p>" : "")
    + '<div class="mk-acts">' + acts + "</div>" + '<p class="mk-note">' + cs.w("screen.start-send.approvefixes") + "</p>" + nosend;
}

/* The acts, shared by both screens (each registers the ones its registry lists). The action is the screen's subject. */
const keepDraft = function (view, answer, cs) {
  if (answer && answer.id) {
    // the draft first, then a new field id, so the redraw draws the draft's text and not what was typed before
    cs.set("draft", view.parts.draftOf(answer));
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
