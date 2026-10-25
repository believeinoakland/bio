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
    { thing: { kind: "action", facts: a ? [a.kind || "", view.parts.counterparty(a.counterparty)] : [] } })];
  const who = a ? view.parts.counterparty(a.counterparty) : "";
  if (who) out.push(`<p class="mk-sub">${cs.w(S + "of", { who })}</p>`);
  /* R54: the reminders this page set, by entry position, kept in page memory (the day each was set for) */
  const reminded = view.ui.reminded && typeof view.ui.reminded === "object" ? view.ui.reminded : {};
  /* the confirmed entries: what each is, its basis and when */
  out.push(cs.sec(S + "entries", cs.state("action", view, () => (clock.length
    ? cs.sheet(clock.map((e, i) => (i === pos ? '<div aria-current="true">' : "<div>") + cs.row(cs.due(e.date || "", e.status === "met" ? "met" : e.status === "overdue" ? "overdue" : ""),
      `<b>${cs.esc(e.description || e.text || "")}</b><span class="meta">${cs.w(S + "basis", { basis: e.basis || "" })}${e.due_at ? " · " + cs.w(S + "at", { time: String(e.due_at).slice(11, 16), zone: e.due_zone || "" }) : ""}</span>`,
      `<span class="mk-small">${cs.w(S + "status." + (["pending", "met", "overdue", "waived"].includes(e.status) ? e.status : "pending"))}</span>`
      + (Array.isArray(reminded[i]) ? reminded[i].map((on) => ` <span class="mk-small" data-reminder="${i}">${cs.w("screen.reminder.on", { date: cs.date(on, { year: true }) })}</span>`).join("") : "")) + "</div>").join(""))
    : "")
    /* drawn only once the clock is read, so its first value is the entry the address names, never one kept from before */
    + cs.choice("dd-entry", S + "entry", clock.map((e, i) => ({ value: String(i), text: (e.description || e.text || "") + " · " + (e.date || "") })), { value: pos !== null ? String(pos) : undefined }))
    + cs.field("dd-on", S + "on", { type: "date" })
    + cs.act("reminderset", { label: "act.reminderset.label.due-date" })
    + `<p>${clock.length ? cs.state(view.data.calendar, (c) => cs.save(c.filename || "deadlines.ics", c.ics, { label: S + "download" })) : ""}</p>`));
  /* how it was worked out: each standing proposal's trace */
  const trace = (p) => {
    const t = p.trace || {};
    /* the calendar the count read is stated per year (`trace.calendar.entries`, each with its `basis`); a closed day names the entry of its year, a
       weekend (no calendar entry says it) the counting rule's own basis */
    const cal = (t.calendar && Array.isArray(t.calendar.entries)) ? t.calendar.entries : [];
    const srcOf = (day) => {
      const weekend = [0, 6].includes(new Date(String(day) + "T00:00:00Z").getUTCDay());
      const c = weekend ? null : cal.find((x) => Number(x.year) === Number(String(day).slice(0, 4)));
      return (c && c.basis) || p.basis || "";
    };
    const steps = [`<li>${cs.w(S + "step.basis", { basis: p.basis || "" })}</li>`,
      `<li>${t.anchor_day ? cs.w(S + "step.received." + (p.start_from || t.start_from || "receipt"), { date: cs.date(t.anchor_day) }) : cs.mark("gap", "undetermined", { reason: cs.w(S + "noreceipt") })}</li>`,
      `<li>${cs.w(S + "step.counted", { amount: String(t.amount || ""), units: t.units || "" })}</li>`]
      .concat((t.skipped || []).map((s) => `<li>${cs.w(S + "step.skipped", { date: cs.date(s.day), why: s.why || "", source: srcOf(s.day) })}</li>`))
      .concat([`<li>${p.date ? cs.w(S + "step.due", { date: cs.date(p.date), zone: t.zone || "" }) : cs.mark("gap", "undetermined", { reason: p.undetermined && p.undetermined.why ? p.undetermined.why : cs.w(S + "nodate") })}</li>`]);
    const machine = p.label && p.label.machine_work;
    return `<div class="mk-msg" data-proposal="${cs.esc(p.key)}">${machine ? cs.mark("origin", "machine") : ""} <b>${cs.w(S + "proposal", { by: view.parts.who(cs, p.proposed_by) })}</b>`
      + `<ol class="mk-list">${steps.join("")}</ol>`
      + cs.act("clockadopt", { label: "act.clockadopt.label.due-date", tone: "primary", data: { proposal: p.key } }) + "</div>";
  };
  /* R59: the refusal that no rule of the member's places states a deadline brought the deadlines their rules do list; they are
     drawn to pick from, with the door to the rules in Settings (the refusal itself is drawn beside the act by the shell) */
  const rules = Array.isArray(view.ui.rules) ? view.ui.rules.filter((d) => d && typeof d.rule === "string" && d.rule) : [];
  const pick = rules.length ? `<details class="mk-details" open data-rules="1"><summary>${cs.w(S + "rule.summary")}</summary>`
    + cs.choice("dd-rule", S + "rule.pick", rules.map((d) => ({ value: d.rule, text: [d.label || d.description || d.rule, d.citation || ""].filter(Boolean).join(" · ") })), {})
    + `<p class="mk-small">${cs.w(S + "rule.help")}</p>`
    + cs.act("clockpropose", { label: "act.clockpropose.label.due-date" })
    + `<a class="cs-ref" href="/app/places" data-nav data-screen="places">${cs.w(S + "rule.go")}</a></details>` : "";
  out.push(cs.sec(S + "how", cs.state("proposals", view, (v) => ((v.proposals || []).length
    ? cs.field("dd-why", S + "why", { help: S + "why.help" }) + v.proposals.map(trace).join("") : ""))
    + cs.act("clockpropose", { label: "act.clockpropose.label.due-date" }) + pick));
  out.push(`<p class="mk-note">${cs.w(S + "queue")}</p>`);
  return out.join("");
}

const acts = [
  /* "Work it out again": a proposal, never the date until a member confirms it */
  { op: "clockpropose", label: "act.clockpropose.label.due-date",
    /* R59: a refusal that no rule states a deadline for this kind of action keeps the deadlines its answer carries, to be picked from */
    refusals: { NO_SUCH_RULE: function (refusal, cs) {
      if (cs) cs.set("rules", Array.isArray(refusal.deadlines) ? refusal.deadlines : []);
      return cs ? cs.w("refusal.NO_SUCH_RULE") : "";
    } },
    send(view, el, cs) {
      const id = String(view.subject || "").split("~")[0];
      const p = view.data.proposals && view.data.proposals.state === "ok" ? (view.data.proposals.value.proposals || [])[0] : null;
      const a = view.data.action && view.data.action.state === "ok" ? view.data.action.value : null;
      const chosen = String(cs.value("dd-rule") || "").trim();
      return { body: Object.assign({ target: id }, chosen ? { rule: chosen } : p && p.rule ? { rule: p.rule } : a && a.kind ? { rule: a.kind } : {}) };
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
    },
    /* R54: the day the reminder was set for is drawn beside its entry; a refused day (the shell draws the refusal) adds none */
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (!r || r.ok === false || typeof r.on !== "string") return undefined;
      const kept = Object.assign({}, view.ui.reminded || {});
      const at = Number.isInteger(r.entry) ? r.entry : Number(r.entry);
      kept[at] = (Array.isArray(kept[at]) ? kept[at] : []).filter((d) => d !== r.on).concat([r.on]);
      cs.set("reminded", kept);
      return { stay: true };
    } },
];

const DUE_KEYS = [
  "screen.due-date.due", "screen.due-date.of", "screen.due-date.entries", "screen.due-date.basis", "screen.due-date.at",
  "screen.due-date.status.pending", "screen.due-date.status.met", "screen.due-date.status.overdue", "screen.due-date.status.waived",
  "screen.due-date.entry", "screen.due-date.on", "screen.due-date.remind.empty", "screen.reminder.on", "screen.due-date.download", "screen.due-date.how",
  "screen.due-date.rule.summary", "screen.due-date.rule.pick", "screen.due-date.rule.help", "screen.due-date.rule.go", "refusal.NO_SUCH_RULE",
  "screen.due-date.proposal", "screen.due-date.step.basis", "screen.due-date.step.received.receipt", "screen.due-date.step.received.sent",
  "screen.due-date.step.received.service", "screen.due-date.noreceipt", "screen.due-date.step.counted", "screen.due-date.step.skipped",
  "screen.due-date.step.due", "screen.due-date.nodate", "screen.due-date.why", "screen.due-date.why.help", "screen.due-date.queue",
];

const words = ["screen.due-date.name", "screen.due-date.purpose",
  ...["clockpropose", "clockadopt", "reminderset"].flatMap((op) => ["act." + op + ".label.due-date", "act." + op + ".does"]),
  "mark.due.means", "mark.origin.machine.name", "mark.origin.machine.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "state.empty", "state.loading", "state.failed", ...DUE_KEYS];

export const DUE_DATE_SCREEN = Object.freeze({ id: "due-date", reads, render, acts, words, parts: PARTS });
