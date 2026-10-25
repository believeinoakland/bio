/* screens-investigate R3: a project's timeline (Projects › <project> › Timeline; registry screen `timeline`, its 6 acts;
 * K1462, K1494). Reads `events`' `timeline` over the project's set (the people, organisations and events its document
 * cites), drawn in two lanes, "What they did" and "What we did"; each event read with `event` for who decided or took
 * part and its grade. An event whose order is undetermined is drawn so, with the evidence that would order it, never
 * guessed into order; undated events are listed apart. */

import { PARTS } from "./parts.mjs";
import { TIMELINE_PARTS } from "./timeline-parts.mjs";
import { FORM_SHARED } from "./graphwords.mjs";
import { WHY_KEYS } from "./whywords.mjs";
import { rereading } from "./rereads.mjs";

/* R33 (4): the addresses. State a is the project (`/app/timeline/<project>`); state b one matter the project follows,
 * `<project>/matter/<progression>/<entity>`; state c one progression, `<project>/progression/<progression>`. */

const S = "screen.timeline.";

function reads(view) {
  const [id, mode, key, eid] = String(view.subject || "").split("/");
  const out = {
    project: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    people: { op: "peopledirectory", query: { limit: "200" } },
    questions: { op: "list", query: { type: "inquiry", limit: "500" } },
    docs: { op: "heldcaptures", query: { project: id, limit: "200", state: "held_and_vouched", fields: "picker" }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length },
    vocab: { op: "affordances", query: {} },
  };
  if (mode === "matter" && key && eid) out.matter = { op: "instance", query: { key, id: eid } };
  if (mode === "progression" && key) out.def = { op: "progression", query: { key } };
  return out;
}

function place(view) {
  const S = "screen.timeline.";
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw title is drawn */ }
  const pid = String(view.subject || "").split("/")[0];
  return { project: { id: pid, title: title || pid } };
}

function render(cs, view) {
  const S = "screen.timeline.";
  const P = view.parts;
  const [id, mode] = String(view.subject || "").split("/");
  const proj = view.data.project;
  const doc = proj && proj.state === "ok" ? P.front(proj.value["bundle.md"]) : null;
  const out = [cs.title(cs.w("screen.timeline.name"), { thing: { kind: "project", facts: [doc && doc.title ? doc.title : id] } })];
  /* R33 (2), (3): one matter the project follows, and one progression, each drawn by the module's parts */
  if (proj && proj.state === "ok" && mode === "matter") return out.join("") + P.matter(cs, view, id);
  if (proj && proj.state === "ok" && mode === "progression") return out.join("") + P.progressionDef(cs, view, id);
  /* an event's date, as precise as its source states it: a day, a month marked "month known", "on or before" */
  const when = (w) => P.when(cs, w);
  /* R20: who took part and the event's grade, as `timeline` answers them for the item (no read per event) */
  const detail = (it) => {
    const ps = Array.isArray(it.participants) ? it.participants : [];
    const total = Number(it.participants_total) || ps.length;
    const people = ps.map((x) => cs.w(S + "role", { role: cs.w(S + "roles." + (["decider", "voted", "signatory", "actor", "party", "present", "speaker", "author"].includes(x.role) ? x.role : "actor")) })
      + " " + P.refOf(cs, x.entity_id, x.entity_id, [x.role || ""]) + (x.role === "voted" && x.vote_value ? " (" + cs.esc(x.vote_value) + ")" : "")
      + (x.grades && /^[A-D]$/.test(x.grades.attestation || "") ? " " + cs.grade("capture", x.grades.attestation) : "")).join("; ");
    /* K3996, events R54: an event placed nowhere gives its `grade_why` as `{key, vars}`, drawn by its word */
    const grade = /^[A-D]$/.test(it.grade || "") ? cs.grade("capture", it.grade)
      : cs.mark("gap", "unrated") + (it.grade_why ? ` <span class="mk-small">${P.why(cs, it.grade_why)}</span>` : "");
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
        + `<p class="mk-small">${cs.w(S + "order.evidence")}</p>`
        + `<div class="mk-acts">${cs.act("recorddatedfact", { label: S + "cite.date", data: { event: it.event_id } })}${cs.act("relate", { label: S + "cite.first", data: { event: it.event_id, kind: "precedes" } })}`
        + `${cs.act("findin", { label: S + "find.dates" })}</div></div>${citedOrder(it)}` : "";
    return `<div class="mk-ev" data-event="${cs.esc(it.event_id)}"><span class="mk-date">${when(it.when)}</span> <b>${P.refOf(cs, it.event_id, it.kind ? cs.w(S + "kind", { kind: it.kind }) : it.event_id, [it.status || ""], "event")}</b> ${detail(it)}${order}</div>`;
  };
  /* the project's set: the people, organisations and events its document cites. An event recorded here is found by the captures it cites
     (events R53, C54), which are the project's own documents below, so no list of what was recorded is kept in the page. */
  const set = doc ? [...new Set(doc.refs.filter((r) => /^(ENT|EVT)-/.test(String(r.target || "")) && r.status !== "severed").map((r) => r.target))] : [];
  /* R33 (5): the capture digests of the project's documents (at most 200, newest first, events R53) join the set */
  const docsRead = P.docsAll(cs, view, { project: id }).rows;
  const shas = docsRead.map((r) => r && r.capture && r.capture.sha256).filter(Boolean).slice(0, 200);
  const q = {};
  if (set.length) q.set = set.join(",");
  if (shas.length) q.captures = shas.join(",");
  const tl = doc && (set.length || shas.length) ? P.later(cs, view, "timeline", "timeline", { query: q }) : null;
  const titleOf = (sha) => { const r = docsRead.find((x) => x && x.capture && x.capture.sha256 === sha); return (r && r.title) || ""; };
  const kinds = ["meeting", "adopted", "effective", "signed", "issued", "published", "received", "entered", "hearing", "period_covered", "edited"];
  /* R34, C56: the kinds the form offers are the kinds `events` accepts, as `affordances` answers them (its R39), never a list copied
     here: a kind with a word of the design's is worded by it, any other by the owner's own word as record data; an unread
     vocabulary draws the choice failed, not a guess */
  const vk = view.data.vocab && view.data.vocab.state === "ok" && view.data.vocab.value && view.data.vocab.value.vocabularies ? view.data.vocab.value.vocabularies.event_kinds : null;
  const kindOptions = vk && Array.isArray(vk.values) ? vk.values.map((k) => (cs.w(S + "evkind." + k) !== cs.esc(S + "evkind." + k) ? [k, S + "evkind." + k]
    : { value: k, text: String((vk.words && vk.words[k] && vk.words[k].word) || k) })) : null;
  const kindChoice = kindOptions ? cs.choice("tl-kind", S + "evkind", kindOptions, {}) : cs.state("vocab", view, () => `<p class="cs-state" data-state="failed" role="alert">${cs.w("state.failed", { reason: { html: cs.w("shell.noanswer") } })}</p>`);
  const precisions = ["day", "minute", "second", "edtf"];
  const datedRow = (f) => cs.row("", `<span class="mk-date">${P.when(cs, f.upper_bound ? { precision: "upper_bound", end: f.value } : { value: f.value, precision: f.precision })}</span>`
    + (kinds.includes(f.kind) ? ` <b>${cs.w(S + "datekind." + f.kind)}</b>` : ""), "",
  cs.w(S + "dated.meta", { precision: precisions.includes(f.precision) ? cs.w("label.timeprecisions." + f.precision) : "", document: titleOf(f.capture_sha) || P.plain(cs, S + "source"), grade: f.grade ? String(f.grade) : { html: cs.mark("gap", "unrated") } }));
  if (!proj || proj.state !== "ok") out.push(cs.state("project", view, () => ""));
  else if (!tl) out.push(`<p>${cs.w(S + "noset")}</p>`);
  else out.push(cs.state(tl, (v) => {
    const dated = v.dated && Array.isArray(v.dated.items) ? v.dated.items : [];
    if (!((v.world || {}).items || []).length && !((v.world || {}).placed_nowhere || []).length && !dated.length
        && !((v.ours || {}).sources || []).some((x) => (x.items || []).length)) return `<p class="cs-state" data-state="empty">${cs.w(S + "empty")}</p>`;
    const world = v.world || { items: [], placed_nowhere: [] };
    const ours = v.ours || { sources: [] };
    const ourItems = (ours.sources || []).flatMap((s) => (s.items || []).filter((x) => !x.placed_nowhere).map((x) => Object.assign({ source: s.source }, x)));
    const ourFails = (ours.sources || []).filter((s) => s.error);
    const lanes = !(world.items || []).length && !(world.placed_nowhere || []).length && !ourItems.length && !ourFails.length ? "" :
      `<div class="mk-lanes"><section data-lane="world"><h2 class="mk-lanehead" tabindex="0">${cs.w(S + "lane.world")}</h2>`
      + (world.items || []).map(item).join("")
      + (world.truncated ? `<p class="mk-small">${cs.w(S + "more")}</p>` : "") + "</section>"
      + `<section data-lane="ours"><h2 class="mk-lanehead" tabindex="0">${cs.w(S + "lane.ours")}</h2>`
      + (ourItems.map((x) => `<div class="mk-ev us"><span class="mk-date">${cs.date(x.at) || cs.esc(String(x.at || ""))}</span> <b>${P.refOf(cs, x.ref, x.label || x.ref, [x.kind || ""], /^ACTN-/.test(String(x.ref)) ? "action" : undefined)}</b></div>`).join(""))
      + ourFails.map((s) => cs.mark("gap", "undetermined", { reason: cs.w(S + "lane.failed", { source: s.source || "" }) })).join("") + "</section></div>";
    return lanes
      + ((world.placed_nowhere || []).length ? cs.sec(S + "undated.head", cs.sheet(world.placed_nowhere.map((x) => cs.row("", P.refOf(cs, x.event_id, x.kind ? cs.w(S + "kind", { kind: x.kind }) : x.event_id, [x.status || "", cs.w(S + "undated.apart")], "event"), `<span class="mk-small">${cs.w(S + "undated.apart")}</span>${x.grade_why ? ` <span class="mk-small">${P.why(cs, x.grade_why)}</span>` : ""}`)).join(""))) : "")
      ;
  }));
  /* R33 (1): the matters the project follows through a progression, each a reference to its steps (state b) */
  if (set.length) {
    const inst = P.later(cs, view, "instances", "instances", { query: { set: set.join(",") } });
    const known = view.parts.options(view, "people", (v) => v.rows, (r) => ({ value: r.entity, text: r.name || "" }));
    if (inst.state !== "ok" || ((inst.value && inst.value.items) || []).length) out.push(P.actSec(cs.sec("progression.follows", cs.state(inst, (v) => cs.sheet(((v && v.items) || []).map((m) => cs.row("",
      `<b>${P.refOf(cs, [id, "matter", m.progression_key, m.entity_id].join("/"), (known.find((o) => o.value === m.entity_id) || {}).text || P.plain(cs, "connection.node.unnamed"), [m.label || ""], "timeline")}</b>`
      + `<br><span class="mk-small">${cs.w("progression.followed", { progression: m.label || "", n: String(m.definition_version) })} · ${cs.w("progression.threadedto")}: ${String(m.placed_count)} / ${String(m.stage_count)}`
      + (m.finding_count ? ` · ${cs.w("progression.findings")}: ${String(m.finding_count)}` : "") + "</span>")).join(""))), { help: S + "tip.progressions" }), "instance"));
  }
  /* R33 (5): "Dated in the documents": a third list apart from the two lanes; it creates no event and is never merged into a lane */
  const datedAll = tl && tl.state === "ok" && tl.value.dated && Array.isArray(tl.value.dated.items) ? tl.value.dated.items : [];
  if (datedAll.length) out.push(cs.sec("timeline.dated.title", cs.sheet(datedAll.map(datedRow).join("")), { help: "timeline.dated.tip" }));
  /* the acts: each from a passage the member names (its fingerprint, and its page) */
  const evs = tl && tl.state === "ok" ? ((tl.value.world || {}).items || []).concat((tl.value.world || {}).placed_nowhere || []) : [];
  const evChoice = (fid, key) => cs.choice(fid, key, evs.map((e) => ({ value: e.event_id, text: (e.kind || "") + " · " + e.event_id })), {});
  const qs = view.data.questions && view.data.questions.state === "ok" && Array.isArray(view.data.questions.value.bundles) ? view.data.questions.value.bundles : [];
  const cited = doc ? doc.refs.filter((r) => /^INQ-/.test(String(r.target || "")) && r.status !== "severed").map((r) => r.target) : [];
  const qChoice = cited.map((q) => { const b = qs.find((x) => x.bundle_id === q); return { value: q, text: (b && b.title) || q }; });
  /* R49: the first expected flow is defined from the project's own timeline, not only from inside a flow's page */
  if (proj && proj.state === "ok") out.push(view.parts.defineFold(cs));
  out.push(cs.sec(S + "record.head",
    P.docChoice(cs, view, "tl-doc", { project: id, query: { project: id }, passage: false, drive: true }) + P.passagePick(cs, view, "tl-doc", "tl-passage", P.later)
    + kindChoice
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
    + cs.choice("tl-question", S + "question", qChoice, qChoice.length ? { value: qChoice[0].value } : {}) + cs.field("tl-hunch", S + "hunch", { area: true, rec: true })
    + cs.act("hypothesishold", { label: "act.hypothesishold.label.timeline" })
    + cs.act("findin", { label: "act.findin.label.timeline" })));
  if (view.ui.dateRefusal) out.push(P.said(cs, view.ui.dateRefusal));
  if (view.ui.said) out.push(`<p class="mk-note">${cs.w(view.ui.said)}</p>`);
  return out.join("");
}

const acts = rereading([
  { op: "createevent", label: "act.createevent.label.timeline",
    async send(view, el, cs) {
      const at = view.parts.chosen(cs, "tl-doc", "tl-passage");
      if (!at) return { refuse: "screen.timeline.passage.empty" };
      const kind = String(cs.value("tl-kind") || "other"), date = String(cs.value("tl-date") || "").trim();
      /* C54: the event is attested by the passage chosen; the timeline finds it again by that capture, so it is tied to no person the page guessed */
      if (!date) return { body: { kind, attestations: [at] } };
      /* R33 (K5148; WALK-FINAL-07 R60): an event is dated only by an attestation that carries a date, so a date on the form is recorded as the
         dated fact (`recorddatedfact`, as that act sends it) and that fact is the event's attestation: the event lies on its lane with its date */
      if (!/^\d{4}-\d{2}(-\d{2})?$/.test(date)) return { refuse: "screen.timeline.date.empty" };
      view.ui.dateRefusal = null;
      const made = await cs.call("recorddatedfact", { body: { captureSha: at.captureSha, extent: at.extent, kind: String(cs.value("tl-datekind") || "adopted"),
        value: date.length === 7 ? { value: date, precision: "edtf" } : date, method: view.parts.plain(cs, "screen.timeline.method.member") } });
      const r = made && made.result !== undefined ? made.result : made;
      const id = r && r.ok !== false && r.dated_fact && typeof r.dated_fact.dated_fact_id === "string" ? r.dated_fact.dated_fact_id : "";
      if (!id) { cs.set("dateRefusal", { code: String((r && (r.code || r.reason)) || ""), translation: r && typeof r.translation === "string" ? r.translation : null }); return null; }
      return { body: { kind, attestations: [{ datedFactId: id }] } };
    },
    done(view) { view.ui.later = {}; } },
  { op: "addparticipant", label: "act.addparticipant.label.timeline",
    send(view, el, cs) {
      const eventId = String(cs.value("tl-event") || ""), entityId = String(cs.value("tl-who") || "").trim();
      const at = view.parts.chosen(cs, "tl-doc", "tl-passage");
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
      const at = view.parts.chosen(cs, "tl-doc", "tl-passage");
      if (!from || !to || from === to || !at) return { refuse: "screen.timeline.relate.empty" };
      /* "Cite which came first": the member's chosen event came first, so `precedes` runs from it */
      if (el.dataset.kind === "precedes") return { body: { from, to, kind: "precedes", attestation: at } };
      return { body: { from, to, kind: String(cs.value("tl-rel") || "answers"), attestation: at } };
    },
    done(view) { view.ui.later = {}; } },
  /* an exact date from a passage, a day or a month ("YYYY-MM", month known) */
  { op: "recorddatedfact", label: "act.recorddatedfact.label.timeline",
    send(view, el, cs) {
      const at = view.parts.chosen(cs, "tl-doc", "tl-passage");
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
  /* R33 (2): thread a document to a step (the instance's placements are the ones it holds and this one), record a lawful skip,
     set a finding aside with a reason; each reads the matter again */
  { op: "thread", label: "progression.thread",
    send(view, el, cs) {
      const [, , key, eid] = String(view.subject || "").split("/");
      const m = view.data.matter && view.data.matter.state === "ok" ? view.data.matter.value : null;
      const threads = m && Array.isArray(m.threads) ? m.threads : [];
      const last = threads.length ? threads[threads.length - 1] : null;
      const kept = last ? (last.placements || []).map((p) => Object.assign({ stage: p.stage_key, captureSha: p.capture_sha }, p.event_id ? { event: p.event_id } : {}, p.dated_fact_id ? { datedFact: p.dated_fact_id } : {})) : [];
      const at = view.parts.chosen(cs, "pm-thread-doc");
      return { body: { progressionKey: key, entityId: eid, placements: kept.concat([{ stage: String(cs.value("pm-thread-stage") || ""), captureSha: at ? at.captureSha : "" }]) } };
    },
    done(view) { view.ui.later = {}; } },
  { op: "discharge", label: "progression.discharge", reasonField: "reason",
    send(view, el, cs) {
      const [, , key, eid] = String(view.subject || "").split("/");
      const at = view.parts.chosen(cs, "pm-dis-doc");
      return { body: { progressionKey: key, entityId: eid, stageKey: String(cs.value("pm-dis-stage") || ""), captureSha: at ? at.captureSha : "",
        reason: String(cs.value("pm-dis-reason") || "").trim(), citation: String(cs.value("pm-dis-cite") || "").trim() } };
    },
    done(view) { view.ui.later = {}; } },
  { op: "proposedispose", label: "progression.setaside", reasonField: "reason",
    send(view, el, cs) {
      const [, , key] = String(view.subject || "").split("/");
      const [stageKey, version] = String(cs.value("pm-aside-finding") || "").split("|");
      return { body: { progressionKey: key, stageKey, to: "dismissed", reason: String(cs.value("pm-aside-reason") || "").trim(), definitionVersion: Number(version) } };
    } },
  /* R33 (3): a progression declared, or its steps revised as a new version (a basis and a citation required): the member's
     steps are lines `key | label | after | within | required | cardinality` */
  { op: "progressiondefine", label: "progression.define.go", reasonField: "basis",
    send(view, el, cs) {
      const revise = !!(el && el.dataset && el.dataset.mode === "revise");
      const name = String(cs.value("pd-name") || "").trim();
      const key = revise ? String(el.dataset.key || "") : name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const def = view.data.def && view.data.def.state === "ok" ? view.data.def.value : null;
      return { body: { progressionKey: key, label: revise ? String((def && def.label) || "") : name, basis: String(cs.value(revise ? "pd-rv-basis" : "pd-basis") || "").trim(),
        citation: String(cs.value(revise ? "pd-rv-cite" : "pd-cite") || "").trim(), stages: view.parts.stagesOf(cs.value(revise ? "pd-rv-steps" : "pd-steps")) } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; view.ui.later = {}; if (r && r.progression_key && !/\/progression\//.test(String(view.subject || ""))) cs.go("timeline", String(view.subject || "").split("/")[0] + "/progression/" + r.progression_key); } },
  { op: "findin", label: "act.findin.label.timeline",
    send(view, el, cs) { cs.go("find-in", String(view.subject || "")); return null; } },
  /* B14: the registry's reads of states b and c, drawn as the sections that show them (`data-act`), never as buttons */
  { op: "instance", label: "act.instance.label.timeline", send() { return null; } },
  { op: "progression", label: "act.progression.label.timeline", send() { return null; } },
], ["project", "people", "questions", "vocab", "matter", "def"]);

const TIMELINE_KEYS = [
  "screen.timeline.more.people", "screen.timeline.order.cited.before", "screen.timeline.order.cited.after", "screen.timeline.order.relation",
  "screen.timeline.undated", "screen.timeline.month", "screen.timeline.onorbefore", "screen.timeline.role", "screen.timeline.nobody",
  "screen.timeline.source", "screen.timeline.kind", "screen.timeline.order.why", "screen.timeline.order.evidence", "screen.timeline.cite.date",
  "screen.timeline.cite.first", "screen.timeline.find.dates", "screen.timeline.noset", "screen.timeline.empty", "screen.timeline.lane.world",
  "screen.timeline.lane.ours", "screen.timeline.lane.failed", "screen.timeline.more", "screen.timeline.undated.head",
  "screen.timeline.undated.apart", "screen.timeline.record.head", "screen.timeline.record.head.holds", "screen.timeline.sha",
  "screen.timeline.sha.help", "screen.timeline.page", "screen.timeline.evkind", "screen.timeline.evkind.vote", "screen.timeline.evkind.meeting",
  "screen.timeline.evkind.award", "screen.timeline.evkind.statement", "screen.timeline.evkind.filing",
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

const PROGRESSION_KEYS = [
  "progression.follows", "progression.followed", "progression.steps", "progression.threadedby", "progression.req.always", "progression.req.usually",
  "progression.req.sometimes", "progression.req.unless", "progression.req.never", "progression.nodoc", "progression.expects", "progression.expects.undetermined",
  "progression.finding.never", "progression.finding.state.open", "progression.finding.state.dismissed", "progression.finding.state.deferred", "progression.finding.state.help",
  "progression.steps.label.key", "progression.steps.label.label", "progression.steps.label.after", "progression.steps.label.within", "progression.steps.label.required", "progression.steps.label.cardinality", "progression.steps.help", "progression.revise.help", "progression.thread", "progression.discharge", "progression.setaside", "progression.chain", "progression.chain.undetermined",
  "progression.findings", "progression.basis", "progression.basis.help", "progression.revise", "progression.define", "progression.define.go", "progression.threadedto",
  "screen.timeline.tip.progressions", "screen.timeline.tip.steps", "screen.timeline.tip.sure", "screen.timeline.tip.findings", "screen.timeline.tip.stepsdef",
  "screen.timeline.tip.basis", "screen.timeline.step.none.optional", "screen.timeline.step.within", "screen.timeline.progression.sub", "screen.timeline.progression.steps.note",
  "timeline.dated.title", "timeline.dated.tip", "screen.timeline.dated.meta", "label.timeprecisions.day", "label.timeprecisions.minute", "label.timeprecisions.second",
  "label.timeprecisions.edtf", "screen.timeline.datekind.entered", "screen.timeline.datekind.hearing", "screen.timeline.datekind.period_covered", "screen.timeline.datekind.edited",
  "theme.name.label", "theme.name.help", "entity.relation.why", "entity.relation.cite", "entity.relation.cite.help", "connection.node.unnamed", "mark.grade.reading",
];

const words = [...new Set(["screen.timeline.name", "screen.timeline.purpose", ...PROGRESSION_KEYS,
  ...["instance", "thread", "discharge", "proposedispose", "progression", "progressiondefine"].flatMap((op) => ["act." + op + ".label.timeline", "act." + op + ".does"]),
  ...["createevent", "addparticipant", "relate", "recorddatedfact", "hypothesishold", "findin"].flatMap((op) => ["act." + op + ".label.timeline", "act." + op + ".does"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "screen.timeline.method.member", "state.empty", "state.loading", "state.failed", ...FORM_SHARED, ...WHY_KEYS, ...TIMELINE_KEYS])];

export const TIMELINE_SCREEN = Object.freeze({ id: "timeline", reads, place, render, acts, words, parts: Object.freeze(Object.assign({}, PARTS, TIMELINE_PARTS)) });
