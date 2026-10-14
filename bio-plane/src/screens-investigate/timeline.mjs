/* screens-investigate R3: a project's timeline (Projects › <project> › Timeline; registry screen `timeline`, its 6 acts;
 * K1462, K1494). Reads `events`' `timeline` over the project's set (the people, organisations and events its document
 * cites), drawn in two lanes, "What they did" and "What we did"; each event read with `event` for who decided or took
 * part and its grade. An event whose order is undetermined is drawn so, with the evidence that would order it, never
 * guessed into order; undated events are listed apart. */

import { row } from "./row.mjs";
import { PARTS } from "./parts.mjs";

const S = "screen.timeline.";

function reads(view) {
  const S = "screen.timeline.";
  const id = String(view.subject || "");
  return {
    project: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    questions: { op: "list", query: { type: "inquiry", limit: "500" } },
  };
}

function place(view) {
  const S = "screen.timeline.";
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw title is drawn */ }
  return { project: { id: String(view.subject || ""), title: title || String(view.subject || "") } };
}

function render(cs, view) {
  const S = "screen.timeline.";
  const P = view.parts;
  const id = String(view.subject || "");
  const proj = view.data.project;
  const doc = proj && proj.state === "ok" ? P.front(proj.value["bundle.md"]) : null;
  const out = [cs.title(cs.w("screen.timeline.name"), { thing: { kind: "project", facts: [doc && doc.title ? doc.title : id] } })];
  /* an event's date, as precise as its source states it: a day, a month marked "month known", "on or before" */
  const when = (w) => {
    if (!w) return cs.mark("gap", "undetermined", { reason: cs.w(S + "undated") });
    if (w.precision === "edtf") { const m = P.month(cs, w.value); if (m) return cs.w(S + "month", m); }
    if (w.precision === "upper_bound") return cs.w(S + "onorbefore", { date: cs.date(w.end || w.value || "") });
    return cs.date(w.value || w.start || "") || cs.esc(String(w.value || ""));
  };
  const detail = (eid) => {
    const e = P.later(cs, view, "event:" + eid, "event", { query: { id: eid } });
    return cs.state(e, (v) => {
      const ev = v.event || {};
      const people = (ev.participants || []).filter((x) => !x.superseded).map((x) => cs.w(S + "role", { role: x.role || "" }) + " " + P.refOf(cs, x.entity_id, x.entity_id, [x.role || ""])).join(", ");
      const grades = (ev.attestations || []).map((a) => a.grade).filter((g) => /^[A-D]$/.test(g || "")).sort();
      const src = (ev.attestations || []).find((a) => a.capture_sha);
      return `<span class="cs-meta">${people || cs.w(S + "nobody")}</span> `
        + (grades.length ? cs.grade(src ? "capture" : "testimony", grades[grades.length - 1]) : cs.mark("gap", "unrated"))
        + (src ? " " + P.refOf(cs, src.capture_sha, cs.w(S + "source"), [], "capture") : "");
    });
  };
  const item = (it) => {
    const order = it.order && it.order.undetermined
      ? `<div class="cs-gapblock">${cs.mark("gap", "undetermined", { reason: cs.w(S + "order.why", { with: (it.order.with || []).join(", ") }) })}`
        + `<p class="cs-meta">${cs.w(S + "order.evidence")}</p>`
        + `<div class="cs-actrow">${cs.act("recorddatedfact", { label: S + "cite.date", data: { event: it.event_id } })}${cs.act("relate", { label: S + "cite.first", data: { event: it.event_id } })}`
        + `${cs.act("findin", { label: S + "find.dates" })}</div></div>` : "";
    return `<div class="mk-ev" data-event="${cs.esc(it.event_id)}"><span class="mk-date">${when(it.when)}</span> <b>${P.refOf(cs, it.event_id, it.kind ? cs.w(S + "kind", { kind: it.kind }) : it.event_id, [it.status || ""], "event")}</b> ${detail(it.event_id)}${order}</div>`;
  };
  /* the project's set: the people, organisations and events its document cites, and the events recorded here since */
  const set = doc ? [...new Set(doc.refs.filter((r) => /^(ENT|EVT)-/.test(String(r.target || "")) && r.status !== "severed").map((r) => r.target)
    .concat(Array.isArray(view.ui.added) ? view.ui.added : []))] : [];
  const tl = set.length ? P.later(cs, view, "timeline", "timeline", { query: { set: set.join(",") } }) : null;
  if (!proj || proj.state !== "ok") out.push(cs.state("project", view, () => ""));
  else if (!tl) out.push(`<p>${cs.w(S + "noset")}</p>`);
  else out.push(cs.state(tl, (v) => {
    if (!((v.world || {}).items || []).length && !((v.world || {}).placed_nowhere || []).length
        && !((v.ours || {}).sources || []).some((x) => (x.items || []).length)) return `<p class="cs-state" data-state="empty">${cs.w(S + "empty")}</p>`;
    const world = v.world || { items: [], placed_nowhere: [] };
    const ours = v.ours || { sources: [] };
    const ourItems = (ours.sources || []).flatMap((s) => (s.items || []).filter((x) => !x.placed_nowhere).map((x) => Object.assign({ source: s.source }, x)));
    const ourFails = (ours.sources || []).filter((s) => s.error);
    return `<div class="mk-lanes"><section class="mk-lane" data-lane="world"><h2 tabindex="0">${cs.w(S + "lane.world")}</h2>`
      + ((world.items || []).length ? world.items.map(item).join("") : `<p class="cs-meta">${cs.w(S + "lane.empty")}</p>`)
      + (world.truncated ? `<p class="cs-meta">${cs.w(S + "more")}</p>` : "") + "</section>"
      + `<section class="mk-lane us" data-lane="ours"><h2 tabindex="0">${cs.w(S + "lane.ours")}</h2>`
      + (ourItems.length ? ourItems.map((x) => `<div class="mk-ev us"><span class="mk-date">${cs.date(x.at) || cs.esc(String(x.at || ""))}</span> <b>${P.refOf(cs, x.ref, x.label || x.ref, [x.kind || ""], /^ACTN-/.test(String(x.ref)) ? "action" : undefined)}</b></div>`).join("")
        : `<p class="cs-meta">${cs.w(S + "lane.empty")}</p>`)
      + ourFails.map((s) => cs.mark("gap", "undetermined", { reason: cs.w(S + "lane.failed", { source: s.source || "" }) })).join("") + "</section></div>"
      + cs.sec(S + "undated.head", (world.placed_nowhere || []).length
        ? cs.sheet(world.placed_nowhere.map((x) => cs.row("", P.refOf(cs, x.event_id, x.kind ? cs.w(S + "kind", { kind: x.kind }) : x.event_id, [], "event"), `<span class="cs-meta">${cs.w(S + "undated.apart")}</span>`)).join(""))
        : `<p class="cs-meta">${cs.w(S + "undated.none")}</p>`);
  }));
  /* the acts: each from a passage the member names (its fingerprint, and its page) */
  const evs = tl && tl.state === "ok" ? ((tl.value.world || {}).items || []).concat((tl.value.world || {}).placed_nowhere || []) : [];
  const evChoice = (fid, key) => cs.choice(fid, key, evs.map((e) => ({ value: e.event_id, text: (e.kind || "") + " · " + e.event_id })), {});
  const qs = view.data.questions && view.data.questions.state === "ok" && Array.isArray(view.data.questions.value.bundles) ? view.data.questions.value.bundles : [];
  const cited = doc ? doc.refs.filter((r) => /^INQ-/.test(String(r.target || "")) && r.status !== "severed").map((r) => r.target) : [];
  const qChoice = cited.map((q) => { const b = qs.find((x) => x.bundle_id === q); return { value: q, text: (b && b.title) || q }; });
  out.push(cs.sec(S + "record.head",
    cs.field("tl-sha", S + "sha", { help: S + "sha.help" }) + cs.field("tl-page", S + "page", {})
    + cs.choice("tl-kind", S + "evkind", ["vote", "meeting", "decision", "award", "statement", "filing", "other"].map((k) => [k, S + "evkind." + k]), {})
    + cs.act("createevent", { label: "act.createevent.label.timeline", tone: "primary" })
    + evChoice("tl-event", S + "event") + cs.field("tl-who", S + "who", { help: S + "who.help" })
    + cs.choice("tl-role", S + "rolepick", ["decider", "voted", "signatory", "actor", "party", "present", "speaker", "author"].map((r) => [r, S + "roles." + r]), {})
    + cs.field("tl-vote", S + "vote", {})
    + cs.act("addparticipant", { label: "act.addparticipant.label.timeline" })
    + evChoice("tl-to", S + "to") + cs.choice("tl-rel", S + "rel", ["authorises", "answers", "amends", "reverses", "stated_cause", "within"].map((k) => [k, S + "rel." + k]), {})
    + cs.act("relate", { label: "act.relate.label.timeline" })
    + cs.field("tl-date", S + "date", { help: S + "date.help" })
    + cs.choice("tl-datekind", S + "datekind", ["meeting", "adopted", "effective", "signed", "issued", "published", "received"].map((k) => [k, S + "datekind." + k]), {})
    + cs.act("recorddatedfact", { label: "act.recorddatedfact.label.timeline" })
    + cs.choice("tl-question", S + "question", qChoice, {}) + cs.field("tl-hunch", S + "hunch", { area: true, rec: true })
    + cs.act("hypothesishold", { label: "act.hypothesishold.label.timeline" })
    + cs.act("findin", { label: "act.findin.label.timeline" })));
  if (view.ui.said) out.push(`<p class="cs-note">${cs.w(view.ui.said)}</p>`);
  return out.join("");
}

const acts = [
  { op: "createevent", label: "act.createevent.label.timeline",
    send(view, el, cs) {
      const at = view.parts.passage(cs.value("tl-sha"), cs.value("tl-page"));
      if (!at) return { refuse: "screen.timeline.passage.empty" };
      const proj = view.data.project;
      const set = proj && proj.state === "ok" ? view.parts.front(proj.value["bundle.md"]).refs.filter((r) => /^ENT-/.test(String(r.target || ""))).map((r) => r.target) : [];
      return { body: Object.assign({ kind: String(cs.value("tl-kind") || "other"), attestations: [at] }, set.length ? { concerns: set.slice(0, 1) } : {}) };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.event_id) view.ui.added = (Array.isArray(view.ui.added) ? view.ui.added : []).concat([r.event_id]);
      view.ui.later = {};
    } },
  { op: "addparticipant", label: "act.addparticipant.label.timeline",
    send(view, el, cs) {
      const eventId = String(cs.value("tl-event") || ""), entityId = String(cs.value("tl-who") || "").trim();
      const at = view.parts.passage(cs.value("tl-sha"), cs.value("tl-page"));
      if (!eventId || !entityId || !at) return { refuse: "screen.timeline.who.empty" };
      const role = String(cs.value("tl-role") || "actor");
      const vote = String(cs.value("tl-vote") || "").trim();
      return { body: Object.assign({ eventId, entityId, role, attestation: at }, role === "voted" && vote ? { voteValue: vote } : {}) };
    },
    done(view) { view.ui.later = {}; } },
  /* "Link events" and "Cite which came first": a relation between two events, from a passage that states it */
  { op: "relate", label: "act.relate.label.timeline",
    send(view, el, cs) {
      const from = String(el.dataset.event || cs.value("tl-event") || ""), to = String(cs.value("tl-to") || "");
      const at = view.parts.passage(cs.value("tl-sha"), cs.value("tl-page"));
      if (!from || !to || from === to || !at) return { refuse: "screen.timeline.relate.empty" };
      return { body: { from, to, kind: String(cs.value("tl-rel") || "answers"), attestation: at } };
    },
    done(view) { view.ui.later = {}; } },
  /* an exact date from a passage, a day or a month ("YYYY-MM", month known) */
  { op: "recorddatedfact", label: "act.recorddatedfact.label.timeline",
    send(view, el, cs) {
      const at = view.parts.passage(cs.value("tl-sha"), cs.value("tl-page"));
      const v = String(cs.value("tl-date") || "").trim();
      if (!at || !/^\d{4}-\d{2}(-\d{2})?$/.test(v)) return { refuse: "screen.timeline.date.empty" };
      return { body: { captureSha: at.captureSha, extent: at.extent, kind: String(cs.value("tl-datekind") || "adopted"),
        value: v.length === 7 ? { value: v, precision: "edtf" } : v, method: "a member's reading of the passage" } };
    },
    done(view) { view.ui.later = {}; } },
  /* a suspected cause kept as a hunch beside one of the project's questions, never evidence */
  { op: "hypothesishold", label: "act.hypothesishold.label.timeline",
    send(view, el, cs) {
      const inquiry = String(cs.value("tl-question") || ""), statement = String(cs.value("tl-hunch") || "").trim();
      const from = String(cs.value("tl-event") || ""), to = String(cs.value("tl-to") || "");
      if (!inquiry || !statement) return { refuse: "screen.timeline.hunch.empty" };
      return { body: Object.assign({ inquiry, statement }, from && to && from !== to ? { kind: "cause", about: { from, to } } : { kind: "other", about: [from || String(view.subject || "")] }) };
    },
    done(view, answer, cs) { cs.set("said", "screen.timeline.hunch.kept"); } },
  { op: "findin", label: "act.findin.label.timeline",
    send(view, el, cs) { cs.go("find-in", String(view.subject || "")); return null; } },
];

export const TIMELINE_WORDS = [
  row(S + "undated", "the source states no date"),
  row(S + "month", "{month} {year} (month known)"),
  row(S + "onorbefore", "on or before {date}"),
  row(S + "role", "{role}:"),
  row(S + "nobody", "who took part is not recorded"),
  row(S + "source", "the source"),
  row(S + "kind", "{kind}"),
  row(S + "order.why", "the order of this and {with} is undetermined, because the sources date them no closer than this"),
  row(S + "order.evidence", "More evidence could order them: a passage that gives either one its day, or a source that says which came first. Until a source orders them they are kept as they are, never guessed into order."),
  row(S + "cite.date", "Cite an exact date for one of them"),
  row(S + "cite.first", "Cite which came first"),
  row(S + "find.dates", "Look for their dates in this project"),
  row(S + "noset", "This project's document names no person, organisation or event yet, so its timeline holds nothing. Record an event below, or tie the people it is about to the project."),
  row(S + "empty", "No event is recorded for the people and events this project follows."),
  row(S + "lane.world", "What they did"),
  row(S + "lane.ours", "What we did"),
  row(S + "lane.empty", "Nothing in this lane yet."),
  row(S + "lane.failed", "what {source} holds could not be read"),
  row(S + "more", "More events are held than are shown."),
  row(S + "undated.head", "Undated"),
  row(S + "undated.apart", "listed apart, never guessed into place"),
  row(S + "undated.none", "Every event here has a date."),
  row(S + "record.head", "Add to the timeline"),
  row(S + "record.head.holds", "Each act records from a passage you name: the document's fingerprint, and its page."),
  row(S + "sha", "The document"),
  row(S + "sha.help", "The document's fingerprint, as its page shows it."),
  row(S + "page", "Page (optional)"),
  row(S + "evkind", "What happened"),
  row(S + "evkind.vote", "A vote"),
  row(S + "evkind.meeting", "A meeting"),
  row(S + "evkind.decision", "A decision"),
  row(S + "evkind.award", "An award"),
  row(S + "evkind.statement", "A statement"),
  row(S + "evkind.filing", "A filing"),
  row(S + "evkind.other", "Something else"),
  row(S + "event", "The event"),
  row(S + "who", "Who took part"),
  row(S + "who.help", "The person or organisation, by its record id."),
  row(S + "rolepick", "As"),
  row(S + "roles.decider", "Decided"),
  row(S + "roles.voted", "Voted"),
  row(S + "roles.signatory", "Signed"),
  row(S + "roles.actor", "Acted"),
  row(S + "roles.party", "A party"),
  row(S + "roles.present", "Present"),
  row(S + "roles.speaker", "Spoke"),
  row(S + "roles.author", "Wrote it"),
  row(S + "vote", "How they voted (for a vote)"),
  row(S + "to", "The other event"),
  row(S + "rel", "How they are linked"),
  row(S + "rel.authorises", "The first authorised the second"),
  row(S + "rel.answers", "The first answered the second"),
  row(S + "rel.amends", "The first amended the second"),
  row(S + "rel.reverses", "The first reversed the second"),
  row(S + "rel.stated_cause", "A source states the first caused the second"),
  row(S + "rel.within", "The first happened within the second"),
  row(S + "date", "The date, as the passage states it"),
  row(S + "date.help", "A day (2024-01-12), or a month when that is all it gives (2024-03)."),
  row(S + "datekind", "What the date is"),
  row(S + "datekind.meeting", "A meeting"),
  row(S + "datekind.adopted", "Adopted"),
  row(S + "datekind.effective", "In effect"),
  row(S + "datekind.signed", "Signed"),
  row(S + "datekind.issued", "Issued"),
  row(S + "datekind.published", "Published"),
  row(S + "datekind.received", "Received"),
  row(S + "question", "Beside which question"),
  row(S + "hunch", "Your suspected cause"),
  row(S + "hunch.empty", "Choose the question and write your hunch."),
  row(S + "hunch.kept", "Kept as your hunch beside the question. It is never evidence."),
  row(S + "passage.empty", "Name the passage: the document's fingerprint, and its page."),
  row(S + "who.empty", "Choose the event, name who took part, and the passage that says so."),
  row(S + "relate.empty", "Choose two events and the passage that links them."),
  row(S + "date.empty", "Name the passage and the date as it states it."),
];

const words = ["screen.timeline.name", "screen.timeline.purpose",
  ...["createevent", "addparticipant", "relate", "recorddatedfact", "hypothesishold", "findin"].flatMap((op) => ["act." + op + ".label.timeline", "act." + op + ".does"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "state.empty", "state.loading", "state.failed", ...TIMELINE_WORDS];

export const TIMELINE_SCREEN = Object.freeze({ id: "timeline", reads, place, render, acts, words, parts: PARTS });
