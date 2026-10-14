/* screens-investigate R3: a project's timeline (Projects › <project> › Timeline; registry screen `timeline`, its 6 acts;
 * K1462, K1494). Reads `events`' `timeline` over the project's set (the people, organisations and events its document
 * cites), drawn in two lanes, "What they did" and "What we did"; each event read with `event` for who decided or took
 * part and its grade. An event whose order is undetermined is drawn so, with the evidence that would order it, never
 * guessed into order; undated events are listed apart. */

import { PARTS } from "./parts.mjs";

const S = "screen.timeline.";

function reads(view) {
  const S = "screen.timeline.";
  const id = String(view.subject || "");
  return {
    project: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    people: { op: "peopledirectory", query: { limit: "200" } },
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
  const when = (w) => P.when(cs, w);
  /* R20: who took part and the event's grade, as `timeline` answers them for the item (no read per event) */
  const detail = (it) => {
    const ps = Array.isArray(it.participants) ? it.participants : [];
    const total = Number(it.participants_total) || ps.length;
    const people = ps.map((x) => cs.w(S + "role", { role: cs.w(S + "roles." + (["decider", "voted", "signatory", "actor", "party", "present", "speaker", "author"].includes(x.role) ? x.role : "actor")) })
      + " " + P.refOf(cs, x.entity_id, x.entity_id, [x.role || ""]) + (x.role === "voted" && x.vote_value ? " (" + cs.esc(x.vote_value) + ")" : "")
      + (x.grades && /^[A-D]$/.test(x.grades.attestation || "") ? " " + cs.grade("capture", x.grades.attestation) : "")).join("; ");
    const grade = /^[A-D]$/.test(it.grade || "") ? cs.grade("capture", it.grade)
      : cs.mark("gap", "unrated", { reason: it.grade_why || "" });
    return `<span class="mk-small">${people || cs.w(S + "nobody")}${total > ps.length ? " " + cs.w(S + "more.people", { n: String(total - ps.length) }) : ""}</span> ${grade}`;
  };
  /* R20: two events dates leave unordered, ordered by a cited relation: said so, the relation a reference */
  const citedOrder = (it) => (it.order && it.order.undetermined ? (it.order.with || []).map((w) => {
    const q = P.later(cs, view, "seq:" + it.event_id + ":" + w, "sequence", { query: { a: it.event_id, b: w } });
    const v = q.state === "ok" ? q.value : null;
    return v && v.basis === "cited" && (v.answer === "before" || v.answer === "after")
      ? `<p class="mk-small">${cs.w(S + (v.answer === "before" ? "order.cited.before" : "order.cited.after"), { other: w })} ${P.refOf(cs, String(v.relation_id), cs.w(S + "order.relation"), [], "record")}</p>` : "";
  }).join("") : "");
  const item = (it) => {
    const open = it.order && it.order.undetermined;
    const order = open
      ? `<div class="mk-gapblock">${cs.mark("gap", "undetermined", { reason: cs.w(S + "order.why", { with: (it.order.with || []).join(", ") }) })}`
        + `<p class="mk-small">${cs.w(S + "order.evidence", { examples: it.kind && ["vote", "meeting", "decision", "award", "statement", "filing"].includes(it.kind) ? cs.w(S + "evkind." + it.kind) : cs.w(S + "evkind.other") })}</p>`
        + `<div class="mk-acts">${cs.act("recorddatedfact", { label: S + "cite.date", data: { event: it.event_id } })}${cs.act("relate", { label: S + "cite.first", data: { event: it.event_id, kind: "precedes" } })}`
        + `${cs.act("findin", { label: S + "find.dates" })}</div></div>${citedOrder(it)}` : "";
    return `<div class="mk-ev" data-event="${cs.esc(it.event_id)}"><span class="mk-date">${when(it.when)}</span> <b>${P.refOf(cs, it.event_id, it.kind ? cs.w(S + "kind", { kind: it.kind }) : it.event_id, [it.status || ""], "event")}</b> ${detail(it)}${order}</div>`;
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
    return `<div class="mk-lanes"><section data-lane="world"><h2 class="mk-lanehead" tabindex="0">${cs.w(S + "lane.world")}</h2>`
      + (world.items || []).map(item).join("")
      + (world.truncated ? `<p class="mk-small">${cs.w(S + "more")}</p>` : "") + "</section>"
      + `<section data-lane="ours"><h2 class="mk-lanehead" tabindex="0">${cs.w(S + "lane.ours")}</h2>`
      + (ourItems.map((x) => `<div class="mk-ev us"><span class="mk-date">${cs.date(x.at) || cs.esc(String(x.at || ""))}</span> <b>${P.refOf(cs, x.ref, x.label || x.ref, [x.kind || ""], /^ACTN-/.test(String(x.ref)) ? "action" : undefined)}</b></div>`).join("")
        )
      + ourFails.map((s) => cs.mark("gap", "undetermined", { reason: cs.w(S + "lane.failed", { source: s.source || "" }) })).join("") + "</section></div>"
      + ((world.placed_nowhere || []).length ? cs.sec(S + "undated.head", cs.sheet(world.placed_nowhere.map((x) => cs.row("", P.refOf(cs, x.event_id, x.kind ? cs.w(S + "kind", { kind: x.kind }) : x.event_id, [], "event"), `<span class="mk-small">${cs.w(S + "undated.apart")}</span>`)).join(""))) : "");
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
    + evChoice("tl-event", S + "event") + cs.choice("tl-who", S + "who", view.parts.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || r.entity })), {})
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
  if (view.ui.said) out.push(`<p class="mk-note">${cs.w(view.ui.said)}</p>`);
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
      /* "Cite which came first": the member's chosen event came first, so `precedes` runs from it */
      if (el.dataset.kind === "precedes") return { body: { from, to, kind: "precedes", attestation: at } };
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
        value: v.length === 7 ? { value: v, precision: "edtf" } : v, method: view.parts.plain(cs, "screen.timeline.method.member") } };
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

const TIMELINE_KEYS = [
  "screen.timeline.more.people", "screen.timeline.order.cited.before", "screen.timeline.order.cited.after", "screen.timeline.order.relation",
  "screen.timeline.undated", "screen.timeline.month", "screen.timeline.onorbefore", "screen.timeline.role", "screen.timeline.nobody",
  "screen.timeline.source", "screen.timeline.kind", "screen.timeline.order.why", "screen.timeline.order.evidence", "screen.timeline.cite.date",
  "screen.timeline.cite.first", "screen.timeline.find.dates", "screen.timeline.noset", "screen.timeline.empty", "screen.timeline.lane.world",
  "screen.timeline.lane.ours", "screen.timeline.lane.failed", "screen.timeline.more", "screen.timeline.undated.head",
  "screen.timeline.undated.apart", "screen.timeline.record.head", "screen.timeline.record.head.holds", "screen.timeline.sha",
  "screen.timeline.sha.help", "screen.timeline.page", "screen.timeline.evkind", "screen.timeline.evkind.vote", "screen.timeline.evkind.meeting",
  "screen.timeline.evkind.decision", "screen.timeline.evkind.award", "screen.timeline.evkind.statement", "screen.timeline.evkind.filing",
  "screen.timeline.evkind.other", "screen.timeline.event", "screen.timeline.who", "screen.timeline.rolepick", "screen.timeline.roles.decider",
  "screen.timeline.roles.voted", "screen.timeline.roles.signatory", "screen.timeline.roles.actor", "screen.timeline.roles.party",
  "screen.timeline.roles.present", "screen.timeline.roles.speaker", "screen.timeline.roles.author", "screen.timeline.vote", "screen.timeline.to",
  "screen.timeline.rel", "screen.timeline.rel.authorises", "screen.timeline.rel.answers", "screen.timeline.rel.amends",
  "screen.timeline.rel.reverses", "screen.timeline.rel.stated_cause", "screen.timeline.rel.within", "screen.timeline.date",
  "screen.timeline.date.help", "screen.timeline.datekind", "screen.timeline.datekind.meeting", "screen.timeline.datekind.adopted",
  "screen.timeline.datekind.effective", "screen.timeline.datekind.signed", "screen.timeline.datekind.issued", "screen.timeline.datekind.published",
  "screen.timeline.datekind.received", "screen.timeline.question", "screen.timeline.hunch", "screen.timeline.hunch.empty",
  "screen.timeline.hunch.kept", "screen.timeline.passage.empty", "screen.timeline.who.empty", "screen.timeline.relate.empty",
  "screen.timeline.date.empty",
];

const words = ["screen.timeline.name", "screen.timeline.purpose",
  ...["createevent", "addparticipant", "relate", "recorddatedfact", "hypothesishold", "findin"].flatMap((op) => ["act." + op + ".label.timeline", "act." + op + ".does"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "screen.timeline.method.member", "state.empty", "state.loading", "state.failed", ...TIMELINE_KEYS];

export const TIMELINE_SCREEN = Object.freeze({ id: "timeline", reads, place, render, acts, words, parts: PARTS });
