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
    "litigation-hold.docket"];
  // The screens a subject opens, by the kind of subject an item names, and by the id's own prefix.
  const OPENS = { project: "project", inquiry: "question", question: "question", bundle: "document", information: "document", capture: "document", document: "document", action: "action" };
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
    return KEYED.indexOf(String(it.kind)) >= 0 && it.fills ? String(it.kind) : null;
  };
  const open = function (it) {
    const s = it && it.subject || {};
    const screen = screenOf(s);
    return screen && s.id !== undefined && s.id !== null && s.id !== "" ? "/app/" + screen + "/" + encodeURIComponent(String(s.id)) : "";
  };
  // A subject's title: the item's own, as the producers carry it (queue-producers R40) or beside its subject.
  const titleOf = function (it) {
    const s = it && it.subject || {};
    const t = typeof s.title === "string" && s.title.trim() ? s.title : typeof it.title === "string" && it.title.trim() ? it.title : "";
    return t || null;
  };
  const subject = function (cs, it) {
    const s = it && it.subject || {};
    const screen = screenOf(s);
    if (!screen || s.id === undefined || s.id === null || s.id === "") return "";
    const title = titleOf(it);
    const since = it.captured || s.captured || (it.age && it.age.since) || "";
    return cs.ref(screen, String(s.id), title || cs.w("queue.source.untitled", { date: { html: cs.date(String(since)) } }), []);
  };
  const dated = function (cs, fills) {
    const out = Object.assign({}, fills);
    if (typeof out.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(out.date)) out.date = { html: cs.date(out.date) };
    return out;
  };
  const words = function (cs, it) {
    const k = keyOf(it);
    const fills = it.fills && typeof it.fills === "object" ? dated(cs, it.fills) : {};
    if (k === "action-clock-overdue.theirs") {
      return { summary: cs.w("action.noreply.title", { date: fills.date === undefined ? "" : fills.date }), detail: cs.w("queue." + k + ".detail", fills) };
    }
    if (k) return { summary: cs.w("queue." + k + ".summary", fills), detail: cs.w("queue." + k + ".detail", fills) };
    // R28: the subject by its title, beside the producer's words when they say something other than an address.
    const own = typeof it.summary === "string" ? it.summary.trim() : "";
    const bare = !own || /^(https?:\/\/|www\.)/i.test(own) || /^[A-Z]{1,6}-[0-9A-Za-z-]+$/.test(own) || /^[0-9a-f]{12,64}$/i.test(own);
    const ref = subject(cs, it);
    const detail = it.detail ? (typeof it.detail === "string" ? cs.esc(it.detail) : "") : "";
    if (!ref) return { summary: bare ? "" : cs.esc(own), detail: detail };
    return { summary: ref + (bare || own === titleOf(it) ? "" : ' <span class="muted">' + cs.esc(own) + "</span>"), detail: detail };
  };
  return { keyOf: keyOf, words: words, subject: subject, open: open, titleOf: titleOf };
}
