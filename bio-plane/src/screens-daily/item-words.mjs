/* How a queue item is worded, for Home and the queue alike (screens-daily R2, R17, R22, R28, R31; D21; N1093), a screen part
   (interface-shell R21, K3002) handed to both as `view.parts.itemWords`. `keyOf(it)` is the keyed kind an item carries words
   for (`queue.<kind>.summary` and `.detail`, filled by the item's `fills`); `words(cs, it)` answers `{summary, detail}` in
   HTML: a reply owed by another side whose date has passed is "no reply recorded" (R31), never "overdue"; an item with no
   keyed words is its subject by its title, a reference, beside the producer's own words when they are words and not an
   address (R28). `subject(cs, it)` answers that reference, or "" when the item names none. `open(it)` is the path a subject's
   screen has. Self-contained: it refers only to its parameters. */

export function itemWords() {
  // The queue's words keyed in the word list (`queue.<kind>.summary` / `.detail`); an item of any other kind draws its own.
  const KEYED = ["question-find", "step-later-found", "step-date-due", "step-reminder", "step-cost-shared", "step-cost-message",
    "milestone-overdue", "milestone-reminder", "project-quiet", "review-comment-left-out", "action-clock-overdue.ours",
    "action-clock-overdue.theirs", "member-left-items", "watch-keep-or-stop", "plan-review-due", "plan-look-again",
    "litigation-hold.docket", "project-invitation", "project-request"];
  // The screens a subject opens, by the kind of subject an item names, and by the id's own prefix.
  // R71, R73, R74: an escalation opens its matter, a key the account, a contradiction its screen; a subject kind with no screen opens nothing.
  const OPENS = { project: "project", inquiry: "question", question: "question", bundle: "document", information: "document", capture: "document", document: "document", action: "action",
    escalation: "matter", key: "account", contradiction_candidate: "contradiction", contradiction_notice: "contradiction" };
  // R73, R74: an item of these kinds opens the screen that settles it, whatever its subject is.
  const KIND_OPENS = { "bias-debt": "bias", tension: "contradiction", "contradiction-duty": "contradiction", "contradiction-duty-unseen": "contradiction",
    "contradiction-plurality": "contradiction", "contradiction-plurality-unseen": "contradiction" };
  const screenOf = function (s) {
    const id = s && s.id !== undefined && s.id !== null ? String(s.id) : "";
    if (/^PROJ-/.test(id)) return "project";
    if (/^INQ-/.test(id)) return "question";
    return OPENS[s && s.kind] || "";
  };
  const keyOf = function (it) {
    if (typeof it.word === "string") {
      const m = /^queue\.(.+)\.summary$/.exec(it.word);
      if (m && KEYED.indexOf(m[1]) >= 0) return m[1];
    }
    // The two project kinds (queue-producers R41, R42) carry no `fills`: their words are filled from the item's subject and basis.
    if (it.kind === "project-invitation" || it.kind === "project-request") return String(it.kind);
    return KEYED.indexOf(String(it.kind)) >= 0 && it.fills ? String(it.kind) : null;
  };
  // The screen an item opens and the id it opens at: the kind's settling screen first (R73, R74), else its subject's (R71).
  const targetOf = function (it) {
    const s = it && it.subject || {};
    const byKind = it && KIND_OPENS[String(it.kind)];
    const screen = byKind || screenOf(s);
    let id = screen === "contradiction" ? (s.candidate !== undefined && s.candidate !== null ? s.candidate : s.id) : s.id;
    // R74: a conflict seen in part opens at `<candidate>/<project>`, the project of the party (a notice) or of the first side (a candidate).
    if (screen === "contradiction" && id !== undefined && id !== null && id !== "") {
      const side = (Array.isArray(s.parties) && s.parties[0]) || (Array.isArray(s.between_projects) && s.between_projects[0]) || null;
      if (side && typeof side.project === "string" && side.project) id = String(id) + "/" + side.project;
    }
    return screen && id !== undefined && id !== null && id !== "" ? { screen: screen, id: String(id) } : null;
  };
  const open = function (it) {
    const t = targetOf(it);
    return t ? "/app/" + t.screen + "/" + (t.screen === "contradiction" ? t.id.split("/").map(encodeURIComponent).join("/") : encodeURIComponent(t.id)) : "";
  };
  // A subject's title: the item's own, as the producers carry it (queue-producers R40) or beside its subject.
  const titleOf = function (it) {
    const s = it && it.subject || {};
    const t = typeof s.title === "string" && s.title.trim() ? s.title : typeof it.title === "string" && it.title.trim() ? it.title : "";
    return t || null;
  };
  // C25 (K4437): a subject with no title yet, whose item carries the address it came from, is named by the one rule (screens-intake R54): its
  // host and the day, never the file part of the address; with no address, the untitled word.
  const hostOf = function (it) {
    const s = it && it.subject || {};
    const from = [it && it.summary, it && it.locator, s.locator].filter(function (x) { return typeof x === "string" && /^https?:\/\//i.test(x.trim()); })[0];
    try { return from ? new URL(from.trim()).hostname : ""; } catch (e) { return ""; }
  };
  const subject = function (cs, it) {
    const s = it && it.subject || {};
    const t = targetOf(it);
    if (!t) return "";
    const screen = t.screen;
    const title = titleOf(it);
    const since = it.since || it.captured || s.captured || (it.age && it.age.since) || "";
    const host = title ? "" : hostOf(it);
    const named = title || (host ? cs.w("document.untitled.web", { site: host, date: { html: cs.date(String(since)) } }) : cs.w("queue.source.untitled", { date: { html: cs.date(String(since)) } }));
    return cs.ref(screen === "bias" ? "bias-debt" : screen, t.id, named, []);
  };
  const dated = function (cs, fills) {
    const out = Object.assign({}, fills);
    if (typeof out.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(out.date)) out.date = { html: cs.date(out.date) };
    return out;
  };
  const words = function (cs, it) {
    const k = keyOf(it);
    let fills = it.fills && typeof it.fills === "object" ? dated(cs, it.fills) : {};
    if (k === "project-invitation" || k === "project-request") {
      const s = it.subject || {};
      const who = k === "project-request" ? s.requester : it.basis && typeof it.basis.inviter === "string" ? it.basis.inviter : null;
      const pid = s.id !== undefined && s.id !== null ? String(s.id) : "";
      fills = { project: { html: cs.ref("project", pid, typeof s.name === "string" && s.name.trim() ? s.name : cs.w("queue.source.untitled", { date: { html: cs.date(String((it.age && it.age.since) || "")) } }), []) } };
      if (who) fills.who = String(who);
    }
    if (k === "action-clock-overdue.theirs") {
      return { summary: cs.w("action.noreply.title", { date: fills.date === undefined ? "" : fills.date }), detail: cs.w("queue." + k + ".detail", fills) };
    }
    // R50 (3): an invitation whose inviter is not named reads `.summary.unnamed`; a request carries her own words.
    if (k === "project-invitation" && !fills.who) return { summary: cs.w("queue." + k + ".summary.unnamed", fills), detail: cs.w("queue." + k + ".detail", fills) };
    if (k === "project-request") {
      // Her comment is `quote: {by, text}` (queue-producers R42), apart from summary and detail; null when she added none.
      const note = it.quote && typeof it.quote === "object" && typeof it.quote.text === "string" && it.quote.text.trim() ? it.quote.text : "";
      return { summary: cs.w("queue." + k + ".summary", fills), detail: cs.w("queue." + k + ".detail", fills) + (note ? ' <span class="muted">' + cs.esc(note) + "</span>" : "") };
    }
    // Item 78 (1): a participant's request to leave (queue-producers R54) names her and the project in the producer's own words (the design holds
    // none for this kind yet), with her word apart as the request to join carries it; the project is a reference to it.
    if (it.kind === "project-leave") {
      const s = it.subject || {};
      const own = typeof it.summary === "string" ? it.summary.trim() : "";
      const note = it.quote && typeof it.quote === "object" && typeof it.quote.text === "string" && it.quote.text.trim() ? it.quote.text : "";
      const pid = s.id !== undefined && s.id !== null ? String(s.id) : "";
      const name = typeof s.name === "string" && s.name.trim() ? s.name : typeof s.title === "string" && s.title.trim() ? s.title : "";
      const ref = pid && name ? cs.ref("project", pid, name, []) : "";
      return { summary: cs.esc(own), detail: (ref ? ref + " " : "") + (typeof it.detail === "string" ? cs.esc(it.detail) : "") + (note ? ' <span class="muted">' + cs.esc(note) + "</span>" : "") };
    }
    if (k) return { summary: cs.w("queue." + k + ".summary", fills), detail: cs.w("queue." + k + ".detail", fills) };
    // R28: the subject by its title, beside the producer's words when they say something other than an address.
    const own = typeof it.summary === "string" ? it.summary.trim() : "";
    const bare = !own || /^(https?:\/\/|www\.)/i.test(own) || /^[A-Z]{1,6}-[0-9A-Za-z-]+$/.test(own) || /^[0-9a-f]{12,64}$/i.test(own);
    const ref = subject(cs, it);
    const detail = it.detail ? (typeof it.detail === "string" ? cs.esc(it.detail) : "") : "";
    // R79 (b): a kind with no sentence of its own (the producer gave an address, a bare id, or only the title) is `queue.unkeyed.summary`
    // with the subject named as it is titled, never the file part of an address, and `.detail` when the producer gave none.
    if (bare || own === titleOf(it)) {
      const t = ref || (titleOf(it) ? cs.esc(titleOf(it)) : cs.w("queue.source.untitled", { date: { html: cs.date(String(it.since || (it.age && it.age.since) || "")) } }));
      return { summary: cs.w("queue.unkeyed.summary", { title: { html: t } }), detail: detail || cs.w("queue.unkeyed.detail") };
    }
    if (!ref) return { summary: cs.esc(own), detail: detail };
    return { summary: ref + ' <span class="muted">' + cs.esc(own) + "</span>", detail: detail };
  };
  // R50 (3): a team's own passed date, `due.ours.passed`, explained by `due.ours.passed_says`: its own, not a law's or an office's.
  const ours = function (cs, it) {
    if (!it || String(it.kind) !== "action-clock-overdue.ours" || !it.due) return "";
    return '<span class="mk-tag" tabindex="0" data-level="1" data-tip="' + cs.w("due.ours.passed_says") + '">'
      + cs.w("due.ours.passed", { date: { html: cs.date(String(it.due)) } }) + "</span>";
  };
  return { keyOf: keyOf, ours: ours, words: words, subject: subject, open: open, titleOf: titleOf };
}
