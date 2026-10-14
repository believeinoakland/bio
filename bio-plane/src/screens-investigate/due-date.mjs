/* screens-investigate R7: how a due date was worked out (Queue › Due date; registry screen `due-date`, its 3 acts; K1431,
 * K1444). Reads the action (`actions`' `action`: its clock entries) and its standing proposals (`action-clocks`'
 * `clockproposals`), and draws how the date was worked out: its basis (the law the profile names, cited), the day
 * received, the days counted, each holiday or closed day skipped with its source, and the date and time it falls due, in
 * the action's zone. A proposal is never the date until a member confirms it. "Download to my calendar" fetches
 * `clocksics` for the entry by `cs.download` (its address `…/due-date/<action>/calendar`, so it is a link the member
 * presses, drawn back at the screen once the file is handed over). */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

function reads(view) {
  const id = String(view.subject || "").split("/")[0];
  return {
    action: { op: "action", query: { id }, subject: true },
    proposals: { op: "clockproposals", query: { action: id } },
  };
}

function render(cs, view) {
  const S = "screen.due-date.";
  const [id, mode] = String(view.subject || "").split("/");
  const ui = view.ui;
  if (mode === "calendar" && !ui.fetched) {
    /* the download, once per press of the link, then the screen again */
    ui.fetched = true;
    Promise.resolve().then(() => cs.download("clocksics", { query: { actions: id }, name: "deadlines.ics" })).then((d) => {
      ui.fetched = false;
      ui.calendar = d && d.ok ? "ok" : "failed";
      cs.go("due-date", id);
    });
  }
  const a = view.data.action && view.data.action.state === "ok" ? view.data.action.value : null;
  const clock = a && Array.isArray(a.clock) ? a.clock : [];
  const next = clock.find((e) => e.status === "pending" && e.date) || null;
  const out = [cs.title(next ? cs.w(S + "due", { date: cs.date(next.date) }) : cs.w("screen.due-date.name"),
    { thing: { kind: "action", facts: a ? [a.kind || "", (a.counterparty && (a.counterparty.role || a.counterparty.body)) || ""] : [] } })];
  if (a && a.counterparty) out.push(`<p class="cs-sub">${cs.w(S + "of", { who: (a.counterparty.role || "") + (a.counterparty.body ? ", " + a.counterparty.body : "") })}</p>`);
  /* the confirmed entries: what each is, its basis and when */
  out.push(cs.sec(S + "entries", cs.state("action", view, () => (clock.length
    ? cs.sheet(clock.map((e, i) => cs.row(cs.due(e.date || "", e.status === "met" ? "met" : e.status === "overdue" ? "overdue" : ""),
      `<b>${cs.esc(e.description || e.text || "")}</b><span class="meta">${cs.w(S + "basis", { basis: e.basis || "" })}${e.due_at ? " · " + cs.w(S + "at", { time: String(e.due_at).slice(11, 16), zone: e.due_zone || "" }) : ""}</span>`,
      `<span class="cs-meta">${cs.w(S + "status." + (["pending", "met", "overdue", "waived"].includes(e.status) ? e.status : "pending"))}</span>`)).join(""))
    : `<p>${cs.w(S + "entries.none")}</p>`))
    + cs.choice("dd-entry", S + "entry", clock.map((e, i) => ({ value: String(i), text: (e.description || e.text || "") + " · " + (e.date || "") })), {})
    + cs.field("dd-on", S + "on", { type: "date" })
    + cs.act("reminderset", { label: "act.reminderset.label.due-date" })
    + `<p><a class="cs-btn" data-tone="quiet" data-nav href="/app/due-date/${encodeURIComponent(id)}/calendar">${cs.w(S + "download")}</a>`
    + (ui.calendar === "failed" ? ` <span class="cs-refusal" role="alert">${cs.w(S + "download.failed")}</span>` : ui.calendar === "ok" ? ` <span class="cs-meta">${cs.w(S + "download.ok")}</span>` : "") + "</p>"));
  /* how it was worked out: each standing proposal's trace */
  const trace = (p) => {
    const t = p.trace || {};
    const cal = (t.calendar && Array.isArray(t.calendar.entries)) ? t.calendar.entries : [];
    const srcOf = (day) => { const c = cal.find((x) => x.day === day || x.date === day); return c ? c.basis || c.source || "" : (t.calendar && t.calendar.status) || ""; };
    const steps = [`<li>${cs.w(S + "step.basis", { basis: p.basis || "" })}</li>`,
      `<li>${t.anchor_day ? cs.w(S + "step.received." + (p.start_from || t.start_from || "receipt"), { date: cs.date(t.anchor_day) }) : cs.mark("gap", "undetermined", { reason: cs.w(S + "noreceipt") })}</li>`,
      `<li>${cs.w(S + "step.counted", { amount: String(t.amount || ""), units: t.units || "", count: t.count || "" })}</li>`]
      .concat((t.skipped || []).map((s) => `<li>${cs.w(S + "step.skipped", { date: cs.date(s.day), why: s.why || "", source: srcOf(s.day) })}</li>`))
      .concat([`<li>${p.date ? cs.w(S + "step.due", { date: cs.date(p.date), zone: t.zone || "" }) : cs.mark("gap", "undetermined", { reason: p.undetermined && p.undetermined.why ? p.undetermined.why : cs.w(S + "nodate") })}</li>`]);
    const machine = p.label && p.label.machine_work;
    return `<div class="cs-proposal" data-proposal="${cs.esc(p.key)}">${machine ? cs.mark("origin", "machine") : ""} <b>${cs.w(S + "proposal", { by: String(p.proposed_by || "").replace(/^(member|class):/, "") })}</b>`
      + `<ol class="mk-list">${steps.join("")}</ol>`
      + cs.act("clockadopt", { label: "act.clockadopt.label.due-date", tone: "primary", data: { proposal: p.key } }) + "</div>";
  };
  out.push(cs.sec(S + "how", cs.state("proposals", view, (v) => ((v.proposals || []).length
    ? v.proposals.map(trace).join("") : `<p>${cs.w(S + "how.none")}</p>`))
    + cs.act("clockpropose", { label: "act.clockpropose.label.due-date" })));
  out.push(`<p class="cs-note">${cs.w(S + "queue")}</p>`);
  return out.join("");
}

const acts = [
  /* "Work it out again": a proposal, never the date until a member confirms it */
  { op: "clockpropose", label: "act.clockpropose.label.due-date",
    send(view) {
      const id = String(view.subject || "").split("/")[0];
      const p = view.data.proposals && view.data.proposals.state === "ok" ? (view.data.proposals.value.proposals || [])[0] : null;
      const a = view.data.action && view.data.action.state === "ok" ? view.data.action.value : null;
      return { body: Object.assign({ target: id }, p && p.rule ? { rule: p.rule } : a && a.kind ? { rule: a.kind } : {}) };
    } },
  /* "Confirm this due date": only on a standing proposal, naming it */
  { op: "clockadopt", label: "act.clockadopt.label.due-date",
    send(view, el) {
      const proposal = String(el.dataset.proposal || "");
      if (!proposal) return null;
      return { body: { target: String(view.subject || "").split("/")[0], proposal } };
    } },
  { op: "reminderset", label: "act.reminderset.label.due-date",
    send(view, el, cs) {
      const entry = Number(cs.value("dd-entry")), on = String(cs.value("dd-on") || "").trim();
      if (!Number.isInteger(entry) || !/^\d{4}-\d{2}-\d{2}$/.test(on)) return { refuse: "screen.due-date.remind.empty" };
      return { body: { target: String(view.subject || "").split("/")[0], entry, on } };
    } },
];

export const DUE_WORDS = [
  ["due", "Due {date}"],
  ["of", "The reply owed by {who}"],
  ["entries", "Confirmed due dates"],
  ["entries.none", "No due date is confirmed for this action yet."],
  ["basis", "basis: {basis}"],
  ["at", "by {time}, {zone}"],
  ["status.pending", "pending"],
  ["status.met", "met"],
  ["status.overdue", "overdue"],
  ["status.waived", "waived"],
  ["entry", "The due date to be reminded of"],
  ["on", "Remind me on"],
  ["remind.empty", "Choose the due date and the day to be reminded."],
  ["download", "Download to my calendar"],
  ["download.ok", "Handed to your browser as a calendar file."],
  ["download.failed", "The calendar file could not be made just now."],
  ["how", "How this was worked out"],
  ["how.none", "No proposal stands for this action. Work it out again to see how the date is counted."],
  ["proposal", "Worked out by {by}"],
  ["step.basis", "Basis: {basis}"],
  ["step.received.receipt", "Received by the office: {date}."],
  ["step.received.sent", "Counted from sending: {date} (receipt not recorded)."],
  ["step.received.service", "Served: {date}."],
  ["noreceipt", "the day it was received is not recorded"],
  ["step.counted", "Counted {amount} {units} ({count} days)."],
  ["step.skipped", "{date} skipped: {why} (from {source})."],
  ["step.due", "Falls due {date}, {zone}."],
  ["nodate", "the date cannot be worked out from what is recorded"],
  ["queue", "Once confirmed it goes into your queue. If no reply comes by then, the queue says so once."],
].map(([k, en]) => row("screen.due-date." + k, en));

const words = ["screen.due-date.name", "screen.due-date.purpose",
  ...["clockpropose", "clockadopt", "reminderset"].flatMap((op) => ["act." + op + ".label.due-date", "act." + op + ".does"]),
  "mark.due.means", "mark.origin.machine.name", "mark.origin.machine.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "state.empty", "state.loading", "state.failed", ...DUE_WORDS];

export const DUE_DATE_SCREEN = Object.freeze({ id: "due-date", reads, render, acts, words, parts: PARTS });
