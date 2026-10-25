/* screens-investigate R8: a standard the city set itself (Projects › <project> › Standard; registry screen `standard`,
 * its 3 acts). Reads the standard (`standards`' `standard`: its words as written, its source passage, its issuer, kind and
 * when it is in force), its relations to laws (`lawrelations`) and, only while the assistant is reachable, the proposals
 * (`proposals`), each drawn as machine work, "not a standard until a member adopts it". */

import { PARTS } from "./parts.mjs";
import { FORM_SHARED } from "./graphwords.mjs";
import { WHY_KEYS } from "./whywords.mjs";
import { rereading } from "./rereads.mjs";
import { hasWord } from "../setup-words/index.mjs";

/* R56, R57: the path's project step is the project's title, read from its record as the timeline's is; a project that cannot
   be read is `crumb.project.unjoined` (drawn text left in `view.ui` by `render`, since `place` has no kit), never its id; the
   last step says which standard the member is on (the shell draws `screen.standard.crumb` with it). */
function place(view) {
  const [first, second] = String(view.subject || "").split("/");
  /* C62: a standard opened from its project's list carries the project as the address's second step (`/app/standard/<STD>/<PROJ>`) */
  const id = /^PROJ-/.test(first) ? first : /^STD-/.test(first) && /^PROJ-/.test(second || "") ? second : first;
  const std = view.data && view.data.standard && view.data.standard.state === "ok" && view.data.standard.value ? view.data.standard.value : null;
  const last = std && typeof std.cite === "string" && std.cite ? std.cite : "";
  if (!/^PROJ-/.test(id)) return { project: { id: "", title: "" }, last };
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw title is drawn */ }
  const settled = d && d.state !== "loading";
  return { project: { id, title: title || (settled ? String((view.ui && view.ui.unjoined) || "") : "") }, last };
}

function reads(view) {
  const [id, mode] = String(view.subject || "").split("/");
  const state = mode === "adopted" || mode === "all" ? mode : "open";
  const out = { docs: { op: "heldcaptures", query: { limit: "200", state: "held_and_vouched", fields: "picker" }, empty: (v) => !v || !Array.isArray(v.held) || !v.held.length },
    /* R8 (K5148; WALK-FINAL-08 D9): the registered bodies "Who set it" chooses among */
    bodies: { op: "entitieskind", query: { kind: "body", limit: "200" } }, institutions: { op: "entitieskind", query: { kind: "institution", limit: "200" } } };
  if (/^STD-/.test(id)) {
    out.standard = { op: "standard", query: { id }, subject: true };
    out.relations = { op: "lawrelations", query: { id } };
    out.laws = { op: "standards", query: { limit: "200" } };
    /* C62: the project a standard was opened from, for the path */
    if (/^PROJ-/.test(mode || "")) out.project = { op: "image", query: { id: mode }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] };
  }
  /* R19 (N1029): the project's proposals, a member's among them, whether or not the assistant is reachable */
  if (/^PROJ-/.test(id)) {
    out.proposals = { op: "standardproposals", query: { project: id, state } };
    out.project = { op: "image", query: { id }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] };
    /* C61: the standards the record holds, each a door to its page */
    out.held = { op: "standards", query: { limit: "200" } };
  }
  return out;
}

function render(cs, view) {
  const S = "screen.standard.";
  const P = view.parts;
  const [id, mode] = String(view.subject || "").split("/");
  /* the kinds `standards` accepts (R1, `jurisdictions` R23), in the order the choice offers them */
  const KINDS = ["statute", "regulation", "ordinance", "court", "policy", "commitment", "standard"];
  const state = mode === "adopted" || mode === "all" ? mode : "open";
  const s = view.data.standard && view.data.standard.state === "ok" ? view.data.standard.value : null;
  /* R57: the text `place` names an unreadable project by (plain, the path escapes it itself) */
  view.ui.unjoined = P.plain(cs, "crumb.project.unjoined");
  const out = [cs.title(s ? s.cite || id : cs.w("screen.standard.name"), { thing: { kind: "standard", facts: s ? [s.kind || "", s.issuer || ""] : [] } })];
  if (/^STD-/.test(id)) out.push(cs.state("standard", view, (v) => {
    const texts = (Array.isArray(v.texts) ? v.texts : (v.text || []).map((c) => ({ content_id: c }))).slice(0, 5);
    const per = v.period || {};
    /* C61: the passage's words, as `content` places the passage (its capture and extent) read against that capture's reading; the
       document it is written in by title; never the content id */
    const heldRows = P.docsAll(cs, view).rows;
    const same = (a, b) => JSON.stringify(Object.keys(a || {}).sort().map((k) => [k, a[k]])) === JSON.stringify(Object.keys(b || {}).sort().map((k) => [k, b[k]]));
    const passage = (t) => {
      const cq = P.later(cs, view, "content:" + t.content_id, "content", { query: { id: t.content_id } });
      const c = cq.state === "ok" && cq.value && typeof cq.value.capture_sha === "string" ? cq.value : null;
      if (!c) return cq.state === "failed" ? cs.state(cq, () => "") : "";
      const rd = P.later(cs, view, "reading:" + c.capture_sha, "reading", { query: { sha256: c.capture_sha } });
      const units = rd.state === "ok" && rd.value && Array.isArray(rd.value.text_units) ? rd.value.text_units.filter((u) => u && String(u.text || "").trim()) : [];
      const hit = c.extent && c.extent.kind !== "document" ? units.filter((u) => same(u.extent, c.extent)) : units.slice(0, 3);
      const words = hit.map((u) => String(u.text).trim()).join(" ").slice(0, 800);
      const row = heldRows.find((r) => r && r.capture && r.capture.sha256 === c.capture_sha);
      return (words ? `<blockquote class="mk-passage rec">${cs.esc(words)}</blockquote>` : "")
        + `<p class="mk-small">${P.refOf(cs, c.capture_sha, (row && row.title) || P.plain(cs, "screen.person.source"), [t.standing || ""], "capture")}</p>`;
    };
    /* R8 (K5148; WALK-FINAL-08 D4): the words the plane composes for the standard (`standards` R45), each as the plane gave it, beside the passages */
    const says = v.says && typeof v.says === "object" ? ["owner", "held", "cited_by_words", "searched_words", "access", "copy", "public", "release_by_words", "note"]
      .filter((k) => typeof v.says[k] === "string" && v.says[k].trim()).map((k) => `<p class="mk-small" data-says="${k}">${cs.esc(v.says[k])}</p>`).join("") : "";
    return `<p class="mk-sub">${cs.w(S + "sub", { kind: cs.w(S + "kind." + (KINDS.includes(v.kind) ? v.kind : "standard")), issuer: v.issuer || "" })}`
      + ` · ${per.from ? cs.w(per.to ? S + "inforce.span" : S + "inforce.since", { from: cs.date(per.from), to: per.to ? cs.date(per.to) : "" }) : cs.mark("gap", "undetermined", { reason: cs.w(S + "inforce.none") })}</p>`
      + says
      + (v.reason ? `<blockquote class="mk-passage rec">${cs.esc(v.reason)}</blockquote>` : "")
      + (texts.length ? `<p class="mk-small">${cs.w(S + "words")}</p>` + texts.map(passage).join("") : "")
      + (v.text_withheld ? cs.mark("gap", "withheld") : "");
  }));
  /* R8 (K5148; WALK-FINAL-08 D8): a related law is named by its citation (the standards the record holds, `laws`), never its id; an incoming relation
     (`direction: "in"`: the other standard does it to this one) is drawn other-end first, the way it runs, so it is not read as this standard doing it */
  const lawsRead = view.data.laws && view.data.laws.state === "ok" && view.data.laws.value && Array.isArray(view.data.laws.value.items) ? view.data.laws.value.items : [];
  const citeOf = (sid) => { const x = lawsRead.find((l) => l && l.id === sid); return (x && x.cite) || P.plain(cs, "connection.node.unnamed"); };
  /* D3: the passage that says a relation is one of this standard's own passages, chosen by its words (the reading of its capture), never a content id */
  const stdTexts = s && Array.isArray(s.texts) ? s.texts.filter((x) => x && x.content_id) : [];
  const passageOptions = P.textOptions(cs, view, stdTexts);
  const blank = { value: "", text: "" };
  if (/^STD-/.test(id)) out.push(cs.sec(S + "laws", cs.state("relations", view, (v) => {
    const all = (v.temporal || []).concat(v.referential || []).filter((r) => !r.withdrawn);
    return all.length ? cs.sheet(all.map((r) => {
      const incoming = r.direction === "in";
      const other = citeOf(((incoming ? r.from : r.to) || {}).standard || "");
      const verb = cs.w(S + "rel." + (r.type || "refers_to"));
      /* the incoming verb's own word ("Implemented by") where the word table holds it; else the way the relation runs is drawn by its arrow */
      const inKey = S + "rel.in." + (r.type || "refers_to"), inWord = cs.w(inKey) !== cs.esc(inKey) ? cs.w(inKey) : "";
      return cs.row("", `<span data-relation data-direction="${incoming ? "in" : "out"}">${incoming ? (inWord ? `<b>${inWord}</b> ${cs.esc(other)}` : `${cs.esc(other)} → <b>${verb}</b>`) : `<b>${verb}</b> ${cs.esc(other)}`}</span>`,
        `<span class="mk-small">${cs.esc(r.reason || "")}</span>`);
    }).join("")) : "";
  })
    + cs.choice("st-type", S + "type", [blank].concat(["implements", "refers_to", "amends", "repeals", "defines", "excepts"].map((k) => [k, S + "rel." + k])), {})
    + cs.choice("st-to", S + "to", [blank].concat(view.parts.options(view, "laws", (v) => v.items, (x) => ({ value: x.id, text: x.cite || x.id })).filter((o) => o.value !== id)), {})
    + cs.choice("st-citation", "form.choose.passage", [blank].concat(passageOptions), {}) + cs.field("st-effective", S + "effective", { type: "date", help: S + "effective.help" })
    + cs.act("lawrelate", { label: "act.lawrelate.label.standard" })));
  /* R51 (DEC-375, C40): "Was it in force on a date?": the day asked (`standardinforce`, a read that writes nothing) and the
     owner's answer: its state and why, kept as the owner gave it, including "not in force" and "undetermined" */
  if (/^STD-/.test(id)) {
    const r = view.ui.inforce;
    /* R8 (K5148; R70.12): a version known in force through a day is worded by `standard.inforce.known` with the member who recorded it by name
       (never the stamp the plane's sentence was composed with) */
    const known = r && r.state === "in_force" && r.known && typeof r.known.through === "string" && typeof r.known.by === "string" && r.known.by
      ? cs.w("standard.inforce.known", { through: { html: cs.date(r.known.through) }, source: String(r.known.source || ""), author: P.who(cs, r.known.by) }) : "";
    const whyHtml = (w) => (known ? known : typeof w === "string" ? cs.esc(w) : w && typeof w === "object" ? P.why(cs, w) : "");
    const per = (s && s.period) || {};
    /* B419 (DEC-387): the state is drawn by its key, "On {date} it was: {state}"; a state the owner gives that no key names is undetermined */
    const KNOWN = ["in_force", "not_in_force", "overridden", "undetermined"];
    const st = r && KNOWN.includes(r.state) ? r.state : "undetermined";
    const line = r ? cs.w(S + "inforce.result.line", { date: cs.date(r.date), state: cs.w(S + "inforce.state." + st) }) : "";
    const answer = r ? cs.sheet(cs.row("", `<span data-inforce="${cs.esc(String(r.state || ""))}">${line}${st === "undetermined" ? " " + cs.mark("gap", "undetermined", { reason: whyHtml(r.why) }) : ` · ${whyHtml(r.why)}`}</span>`
      + (r.state === "in_force" && per.from && !per.to ? `<span class="meta">${cs.w(S + "inforce.result.meta", { from: cs.date(per.from) })}</span>` : ""), "")) : "";
    out.push(cs.sec(S + "inforce.heading", cs.field("st-inforce-day", S + "inforce.day.label", { type: "date", help: S + "inforce.day.help" })
      + cs.act("standardinforce", { label: "act.standardinforce.label.standard" }) + answer
      + `<details class="mk-details"><summary>${cs.w(S + "inforce.refused.summary")}</summary><p>${cs.w(S + "inforce.refused.body")} ${cs.w(S + "inforce.refused.body2")}</p></details>`, { help: S + "inforce.help" }));
  }
  /* C61: the standards the record holds, on the project's screen, each a door to its page (keeping the project in the path) */
  if (/^PROJ-/.test(id)) out.push(`<div data-held-standards>` + cs.sec(S + "held", cs.state("held", view, (v) => {
    const items = (Array.isArray(v.items) ? v.items : []).filter((x) => x && /^STD-/.test(String(x.id)));
    return (items.length ? cs.sheet(items.map((x) => cs.row("", `<a class="cs-ref" data-standard-door data-nav href="/app/standard/${encodeURIComponent(x.id)}/${encodeURIComponent(id)}">${cs.esc(x.cite || x.id)}</a>`,
      `<span class="mk-small">${cs.w(S + "sub", { kind: cs.w(S + "kind." + (KINDS.includes(x.kind) ? x.kind : "standard")), issuer: x.issuer || "" })}</span>`)).join(""))
      : `<p class="cs-state" data-state="empty">${cs.w("state.empty")}</p>`)
      + (v.truncated ? `<p class="mk-small" data-held-more>${cs.w(S + "held.more")}</p>` : "");
  })) + `</div>`);
  /* R19: the project's proposals under their state, each labelled with who proposed it, why, and what became of it */
  if (/^PROJ-/.test(id)) out.push(cs.sec(S + "proposals", `<div class="mk-acts">${["open", "adopted", "all"].map((k) =>
    `<a class="cs-btn" data-tone="quiet" data-nav href="/app/standard/${encodeURIComponent(id)}${k === "open" ? "" : "/" + k}" aria-pressed="${k === state}">${cs.w(S + "state." + k)}</a>`).join("")}</div>`
    + cs.state("proposals", view, (v) => {
      const list = (Array.isArray(v.items) ? v.items : []).filter((p) => p && p.id);
      return (list.length ? cs.sheet(list.map((p) => {
        const lab = p.label || {};
        return cs.row(lab.machine_work ? cs.mark("origin", "machine") : "",
          `<b>${cs.esc(p.cite || p.id)}</b> · ${cs.esc(lab.says || "")} <span class="mk-small">${cs.w(S + "proposedby", { by: P.who(cs, p.proposed_by || lab.by || ""), date: cs.date(p.proposed_at || "") })}</span>`
          + (p.why ? `<br><span class="rec">${cs.esc(p.why)}</span>` : "") + `<br><span class="mk-small">${cs.w(S + "notyet")}</span>`,
          p.adoption ? `<span class="mk-small">${cs.w(S + "adopted", { by: P.who(cs, p.adoption.by || ""), date: cs.date(p.adoption.at || "") })}</span> ${cs.ref("standard", p.adoption.standard, p.adoption.standard, [])}`
            : cs.act("standardadopt", { label: "act.standardadopt.label.standard", data: { proposal: p.id } }));
      }).join("")) : "") + (v.truncated ? `<p class="mk-small">${cs.w(S + "proposals.more")}</p>` : "");
    })));
  /* "Hold this as a standard", from a passage the member chooses on the document by its words (R34; K5148 D6); the kind opens with nothing chosen (D10)
     and offers every kind the store accepts (D7); "Who set it" chooses a registered body or takes a typed name (D9) */
  const bodies = ["bodies", "institutions"].flatMap((n) => (view.data[n] && view.data[n].state === "ok" && view.data[n].value && Array.isArray(view.data[n].value.entities) ? view.data[n].value.entities : []))
    .filter((e) => e && e.entity_id && e.label).map((e) => ({ value: e.entity_id, text: e.label }));
  out.push(cs.sec(S + "declare", cs.field("st-cite", S + "cite", { help: S + "cite.help" })
    + cs.choice("st-kind", S + "kindpick", [blank].concat(KINDS.map((k) => [k, S + "kind." + k])), {})
    + (bodies.length ? cs.choice("st-issuer-body", S + "issuer", [blank].concat(bodies), {}) : "") + cs.field("st-issuer", S + "issuer", {})
    + P.docChoice(cs, view, "st-doc", { label: S + "text", help: S + "text.help", passage: false, drive: true, project: /^PROJ-/.test(id) ? id : /^PROJ-/.test(mode || "") ? mode : "" })
    + P.passagePick(cs, view, "st-doc", "st-passage", P.later)
    + cs.field("st-from", S + "from", { type: "date" })
    + cs.act("standarddeclare", { label: "act.standarddeclare.label.standard", tone: "primary" })));
  return out.join("");
}

const acts = rereading([
  /* R51: "Check a date": whether the standard was in force on the day chosen, as the owner answers it */
  { op: "standardinforce", label: "act.standardinforce.label.standard", rereads: [],
    send(view, el, cs) {
      const date = String(cs.value("st-inforce-day") || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { refuse: "screen.standard.inforce.refused.body2" };
      return { query: { id: String(view.subject || "").split("/")[0], date } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.ok !== false && typeof r.state === "string") cs.set("inforce", { date: r.date, state: r.state, why: r.why, known: r.known_through || null });
      return { stay: true };
    } },
  { op: "standarddeclare", label: "act.standarddeclare.label.standard",
    send(view, el, cs) {
      const cite = String(cs.value("st-cite") || "").trim(), issuer = String(cs.value("st-issuer-body") || "").trim() || String(cs.value("st-issuer") || "").trim();
      const kind = String(cs.value("st-kind") || "").trim();
      const at = view.parts.chosen(cs, "st-doc", "st-passage");
      const text = at ? [{ capture_sha: at.captureSha, extent: at.extent }] : [];
      const from = String(cs.value("st-from") || "").trim();
      if (!cite || !kind || !issuer || !text.length) return { refuse: "screen.standard.declare.empty" };
      return { body: Object.assign({ cite, kind, issuer, text }, from ? { period: { from, to: null } } : {}) };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.id) cs.go("standard", r.id); } },
  /* adopting a proposal is the member's own act, with her own reason */
  { op: "standardadopt", label: "act.standardadopt.label.standard",
    send(view, el, cs) {
      const proposal = String((el && el.dataset && el.dataset.proposal) || "").trim();
      if (!proposal) return null;
      return { body: { proposal } };
    },
    done(view, answer, cs) { const r = answer && answer.result !== undefined ? answer.result : answer; if (r && r.id) cs.go("standard", r.id); } },
  { op: "lawrelate", label: "act.lawrelate.label.standard",
    send(view, el, cs) {
      const to = String(cs.value("st-to") || "").trim(), citation = String(cs.value("st-citation") || "").trim();
      const type = String(cs.value("st-type") || "").trim(), effective = String(cs.value("st-effective") || "").trim();
      if (!to || !citation || !type) return { refuse: "screen.standard.relate.empty" };
      if (["amends", "repeals"].includes(type) && !effective) return { refuse: "screen.standard.relate.effective" };
      /* D2: the standard's own id, the subject before any `/` (a standard opened from its project's list carries the project after it) */
      return { body: Object.assign({ type, from: String(view.subject || "").split("/")[0], to, citation }, effective ? { effective } : {}) };
    } },
], ["standard", "relations", "laws", "project", "proposals", "held", "bodies", "institutions"]);

const STANDARD_KEYS = [
  "screen.standard.sub", "screen.standard.held", "screen.standard.held.more", "screen.standard.kind.statute", "screen.standard.kind.regulation", "screen.standard.kind.ordinance",
  "screen.standard.kind.court", "screen.standard.kind.policy", "screen.standard.kind.commitment", "screen.standard.kind.standard",
  "screen.standard.inforce.since", "screen.standard.inforce.span", "screen.standard.inforce.none", "screen.standard.words", "screen.standard.laws",
  "screen.standard.rel.implements", "screen.standard.rel.refers_to", "screen.standard.rel.amends", "screen.standard.rel.repeals",
  "screen.standard.rel.renumbers", "screen.standard.rel.recodifies", "screen.standard.rel.defines", "screen.standard.rel.excepts",
  "screen.standard.rel.incorporates", "screen.standard.type", "screen.standard.to", "screen.standard.effective",
  "screen.standard.effective.help", "screen.standard.proposals", "screen.standard.proposals.more", "screen.standard.state.open",
  "screen.standard.state.adopted", "screen.standard.state.all", "screen.standard.proposedby", "screen.standard.adopted", "screen.standard.notyet",
  "screen.standard.declare", "screen.standard.cite", "screen.standard.cite.help", "screen.standard.kindpick", "screen.standard.issuer",
  "screen.standard.text", "screen.standard.text.help", "screen.standard.from", "screen.standard.declare.empty", "screen.standard.relate.empty",
  "screen.standard.relate.effective",
  "screen.standard.inforce.heading", "screen.standard.inforce.day.help", "screen.standard.inforce.result.meta", "screen.standard.inforce.refused.summary",
  "screen.standard.inforce.refused.body", "screen.standard.inforce.refused.body2", "screen.standard.inforce.help", "crumb.project.unjoined",
  "screen.standard.inforce.day.label", "screen.standard.inforce.result.line", "standard.inforce.known",
  "screen.person.source", "screen.standard.inforce.state.in_force", "screen.standard.inforce.state.not_in_force", "screen.standard.inforce.state.overridden", "screen.standard.inforce.state.undetermined",
];

/* the incoming words of D8, listed when the word table holds them */
const INCOMING = ["implements", "refers_to", "amends", "repeals", "renumbers", "recodifies", "defines", "excepts", "incorporates"].map((k) => "screen.standard.rel.in." + k).filter((k) => hasWord(k));

const words = ["screen.standard.name", "screen.standard.purpose", ...INCOMING,
  ...["standardinforce", "standarddeclare", "standardadopt", "lawrelate"].flatMap((op) => ["act." + op + ".label.standard", "act." + op + ".does"]),
  "mark.origin.machine.name", "mark.origin.machine.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "mark.gap.withheld.name", "mark.gap.withheld.means", ...WHY_KEYS, "state.empty", "state.loading", "state.failed", ...FORM_SHARED, ...STANDARD_KEYS];

export const STANDARD_SCREEN = Object.freeze({ id: "standard", ABSENT_CODES: Object.freeze(["NO_ENTITY", "NO_CALC"]), reads, place, render, acts, words, parts: PARTS });
