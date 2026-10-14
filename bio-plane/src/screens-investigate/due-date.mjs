/* screens-investigate R7: how a due date was worked out (Queue › Due date; registry screen `due-date`, its 3 acts; K1431,
 * K1444). Reads the action (`actions`' `action`: its clock entries) and its standing proposals (`action-clocks`'
 * `clockproposals`), and draws how the date was worked out: its basis (the law the profile names, cited), the day
 * received, the days counted, each holiday or closed day skipped with its source, and the date and time it falls due, in
 * the action's zone. A proposal is never the date until a member confirms it. "Download to my calendar" is the
 * `clocksics` calendar text for the action, saved as a file by the kit's own control (`cs.save`, interface-shell R47;
 * K3145: `clocksics` answers the text in JSON, not bytes). */

import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "").split("~")[0];
  return {
    action: { op: "action", query: { id }, subject: true },
    proposals: { op: "clockproposals", query: { action: id } },
    calendar: { op: "clocksics", query: { actions: id }, empty: (v) => !v || typeof v.ics !== "string" || !v.events },
  };
}

function render(cs, view) {
  const S = "screen.due-date.";
  /* the subject is `<action>~<entry position>` (screens-action's links, K3149), or the action alone */
  const [id, at] = String(view.subject || "").split("~");
  const pos = /^\d+$/.test(at || "") ? Number(at) : null;
  const a = view.data.action && view.data.action.state === "ok" ? view.data.action.value : null;
  const clock = a && Array.isArray(a.clock) ? a.clock : [];
  const next = (pos !== null && clock[pos]) || clock.find((e) => e.status === "pending" && e.date) || null;
  const out = [cs.title(next ? cs.w(S + "due", { date: cs.date(next.date) }) : cs.w("screen.due-date.name"),
    { thing: { kind: "action", facts: a ? [a.kind || "", (a.counterparty && (a.counterparty.role || a.counterparty.body)) || ""] : [] } })];
  /* whose reply it is, to which kind of request: said only for a kind the words name (the request's own kind, keyed) */
  if (a && a.counterparty && ["records_request", "request_for_comment"].includes(a.kind))
    out.push(`<p class="mk-sub">${cs.w(S + "of", { who: (a.counterparty.role || "") + (a.counterparty.body ? ", " + a.counterparty.body : ""), item: cs.w("screen.start-send.kind." + a.kind) })}</p>`);
  /* the confirmed entries: what each is, its basis and when */
  out.push(cs.sec(S + "entries", cs.state("action", view, () => (clock.length
    ? cs.sheet(clock.map((e, i) => (i === pos ? '<div aria-current="true">' : "<div>") + cs.row(cs.due(e.date || "", e.status === "met" ? "met" : e.status === "overdue" ? "overdue" : ""),
      `<b>${cs.esc(e.description || e.text || "")}</b><span class="meta">${cs.w(S + "basis", { basis: e.basis || "" })}${e.due_at ? " · " + cs.w(S + "at", { time: String(e.due_at).slice(11, 16), zone: e.due_zone || "" }) : ""}</span>`,
      `<span class="mk-small">${cs.w(S + "status." + (["pending", "met", "overdue", "waived"].includes(e.status) ? e.status : "pending"))}</span>`) + "</div>").join(""))
    : "")
    /* drawn only once the clock is read, so its first value is the entry the address names, never one kept from before */
    + cs.choice("dd-entry", S + "entry", clock.map((e, i) => ({ value: String(i), text: (e.description || e.text || "") + " · " + (e.date || "") })), { value: pos !== null ? String(pos) : undefined }))
    + cs.field("dd-on", S + "on", { type: "date" })
    + cs.act("reminderset", { label: "act.reminderset.label.due-date" })
    + `<p>${clock.length ? cs.state(view.data.calendar, (c) => cs.save(c.filename || "deadlines.ics", c.ics, { label: S + "download" })) : ""}</p>`));
  /* how it was worked out: each standing proposal's trace */
  const trace = (p) => {
    const t = p.trace || {};
    const cal = (t.calendar && Array.isArray(t.calendar.entries)) ? t.calendar.entries : [];
    const srcOf = (day) => { const c = cal.find((x) => x.day === day || x.date === day); return c ? c.basis || c.source || "" : (t.calendar && t.calendar.status) || ""; };
    const steps = [`<li>${cs.w(S + "step.basis", { basis: p.basis || "" })}</li>`,
      `<li>${t.anchor_day ? cs.w(S + "step.received." + (p.start_from || t.start_from || "receipt"), { date: cs.date(t.anchor_day) }) : cs.mark("gap", "undetermined", { reason: cs.w(S + "noreceipt") })}</li>`,
      `<li>${cs.w(S + "step.counted", { amount: String(t.amount || ""), units: t.units || "", date: p.date ? cs.date(p.date) : "" })}</li>`]
      .concat((t.skipped || []).map((s) => `<li>${cs.w(S + "step.skipped", { date: cs.date(s.day), why: s.why || "", source: srcOf(s.day) })}</li>`))
      .concat([`<li>${p.date ? cs.w(S + "step.due", { date: cs.date(p.date), zone: t.zone || "" }) : cs.mark("gap", "undetermined", { reason: p.undetermined && p.undetermined.why ? p.undetermined.why : cs.w(S + "nodate") })}</li>`]);
    const machine = p.label && p.label.machine_work;
    return `<div class="mk-msg" data-proposal="${cs.esc(p.key)}">${machine ? cs.mark("origin", "machine") : ""} <b>${cs.w(S + "proposal", { by: String(p.proposed_by || "").replace(/^(member|class):/, "") })}</b>`
      + `<ol class="mk-list">${steps.join("")}</ol>`
      + cs.act("clockadopt", { label: "act.clockadopt.label.due-date", tone: "primary", data: { proposal: p.key } }) + "</div>";
  };
  out.push(cs.sec(S + "how", cs.state("proposals", view, (v) => ((v.proposals || []).length
    ? cs.field("dd-why", S + "why", { help: S + "why.help" }) + v.proposals.map(trace).join("") : ""))
    + cs.act("clockpropose", { label: "act.clockpropose.label.due-date" })));
  out.push(`<p class="mk-note">${cs.w(S + "queue")}</p>`);
  return out.join("");
}

const acts = [
  /* "Work it out again": a proposal, never the date until a member confirms it */
  { op: "clockpropose", label: "act.clockpropose.label.due-date",
    send(view) {
      const id = String(view.subject || "").split("~")[0];
      const p = view.data.proposals && view.data.proposals.state === "ok" ? (view.data.proposals.value.proposals || [])[0] : null;
      const a = view.data.action && view.data.action.state === "ok" ? view.data.action.value : null;
      return { body: Object.assign({ target: id }, p && p.rule ? { rule: p.rule } : a && a.kind ? { rule: a.kind } : {}) };
    } },
  /* "Confirm this due date": only on a standing proposal, naming it */
  { op: "clockadopt", label: "act.clockadopt.label.due-date", reasonField: "why",
    send(view, el, cs) {
      const proposal = String(el.dataset.proposal || "");
      if (!proposal) return null;
      return { body: { target: String(view.subject || "").split("~")[0], proposal, why: String(cs.value("dd-why") || "").trim() } };
    } },
  { op: "reminderset", label: "act.reminderset.label.due-date",
    send(view, el, cs) {
      const entry = Number(cs.value("dd-entry")), on = String(cs.value("dd-on") || "").trim();
      if (!Number.isInteger(entry) || !/^\d{4}-\d{2}-\d{2}$/.test(on)) return { refuse: "screen.due-date.remind.empty" };
      return { body: { target: String(view.subject || "").split("~")[0], entry, on } };
    } },
];

const DUE_KEYS = [
  "screen.due-date.due", "screen.due-date.of", "screen.due-date.entries", "screen.due-date.basis", "screen.due-date.at",
  "screen.due-date.status.pending", "screen.due-date.status.met", "screen.due-date.status.overdue", "screen.due-date.status.waived",
  "screen.due-date.entry", "screen.due-date.on", "screen.due-date.remind.empty", "screen.due-date.download", "screen.due-date.how",
  "screen.due-date.proposal", "screen.due-date.step.basis", "screen.due-date.step.received.receipt", "screen.due-date.step.received.sent",
  "screen.due-date.step.received.service", "screen.due-date.noreceipt", "screen.due-date.step.counted", "screen.due-date.step.skipped",
  "screen.due-date.step.due", "screen.due-date.nodate", "screen.due-date.why", "screen.due-date.why.help", "screen.due-date.queue",
];

const words = ["screen.due-date.name", "screen.due-date.purpose",
  ...["clockpropose", "clockadopt", "reminderset"].flatMap((op) => ["act." + op + ".label.due-date", "act." + op + ".does"]),
  "mark.due.means", "mark.origin.machine.name", "mark.origin.machine.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "screen.start-send.kind.records_request", "screen.start-send.kind.request_for_comment", "state.empty", "state.loading", "state.failed", ...DUE_KEYS];

export const DUE_DATE_SCREEN = Object.freeze({ id: "due-date", reads, render, acts, words, parts: PARTS });
