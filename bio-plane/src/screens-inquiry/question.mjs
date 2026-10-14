/* screens-inquiry R2: the question screen (Projects › <project> › Question; registry screen `question`, its 11 acts).
 *
 * Self-contained functions (interface-shell R21 (1)): each refers only to its parameters, `cs` and the language's own
 * globals. The question is the inquiry `view.subject`. Its strength is two grades and a phrase against the bar, never one
 * score (DEC-82, DEC-160); the bar is the project's, read once the inquiry names its project (`strengthbarof`), else the
 * group's. Supports and Cuts against are the current basis version's legs by their role (`supports`, `cuts_against`).
 * A leg is live or severed as the inquiry's own `references[]` entry naming its target says (`citation` R15): `sever` is
 * drawn on each live leg (`confirmed` or `proposed`) and `reinstate` on each severed one, each with the member's reason,
 * the question its citing object and a selection of the leg's target (R12); a severed leg stays in its section, drawn
 * severed with its reason. */

import { OWN, ownRows } from "./words.mjs";

/** R2: the reads, each as its owner documents it. */
function reads(view) {
  const id = String(view.subject || "");
  return {
    inquiry: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    strength: { op: "inquirystrength", query: { id } },
    basis: { op: "basisversions", query: { id } },
    hunches: { op: "hypotheses", query: { inquiry: id },
               empty: (v) => !v || !Array.isArray(v.hypotheses) || v.hypotheses.length === 0 },
    waits: { op: "questionwaits", query: { question: id } },
  };
}

/** R8's project step: the project the inquiry states, by its id until its title is read. */
function place(view) {
  const d = view.data && view.data.inquiry;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  if (!m) return {};
  const t = view.ui && view.ui.later && view.ui.later["project:" + m[1]];
  const ft = t && t.state === "ok" && t.value && typeof t.value["bundle.md"] === "string"
    ? /^title:\s*(.*)$/m.exec(t.value["bundle.md"]) : null;
  let title = ft ? ft[1].trim() : m[1];
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* raw */ }
  return { project: { id: m[1], title } };
}

/** R2, R5: the question, its strength against the bar, what it waits on, its four sections and its acts. */
function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui;
  const d = view.data || {};
  /* the front matter: top-level scalars, and the `references` list as {target, rel, status, note} */
  const front = (text) => {
    const out = { refs: [] };
    if (typeof text !== "string") return out;
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    let inRefs = false, cur = null;
    const val = (v) => { v = v.trim(); try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* raw */ } return v; };
    for (const line of head.split("\n")) {
      if (/^references:\s*$/.test(line)) { inRefs = true; continue; }
      if (inRefs && /^\s+-\s*/.test(line)) { cur = {}; out.refs.push(cur); }
      if (inRefs && /^\s+/.test(line) && cur) {
        const r = /^\s+(?:-\s*)?(\w+):\s*(.*)$/.exec(line);
        if (r) cur[r[1]] = val(r[2]);
        continue;
      }
      inRefs = false;
      const m = /^(\w+):\s*(.*)$/.exec(line);
      if (!m) continue;
      out[m[1]] = val(m[2]);
    }
    const q = /\n## Question\s*\n+([\s\S]*?)(\n## |$)/.exec(text);
    out.question = q ? q[1].trim() : "";
    return out;
  };
  const later = (key, op, query) => {
    const L = ui.later || (ui.later = {});
    const q = JSON.stringify(query);
    if (!L[key] || L[key].q !== q) {
      L[key] = { q, state: "loading" };
      const settle = (o) => { L[key] = Object.assign({ q }, o); cs.set("later", L); };
      cs.call(op, { query }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false))
          {
          const f = r && r.ok === false ? r : a || {};
          const code = String(f.code || f.reason || "");
          settle({ state: "failed", refusal: { code, words: cs.esc(f.translation || code) } });
        }
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed", refusal: null }));
    }
    return L[key];
  };
  const doc = d.inquiry && d.inquiry.state === "ok" ? front(d.inquiry.value["bundle.md"]) : null;
  const project = doc && /^PROJ-/.test(String(doc.project || "")) ? String(doc.project) : "";
  const out = [];
  const heading = doc ? (doc.question || doc.title || id) : id;
  out.push(cs.title(heading, { thing: "question" }));
  if (doc) {
    const date = doc.created ? cs.date(String(doc.created), { year: true }) : "";
    if (project) {
      const pr = later("project:" + project, "image", { id: project });
      const pm = pr.state === "ok" && pr.value && typeof pr.value["bundle.md"] === "string" ? /^title:\s*(.*)$/m.exec(pr.value["bundle.md"]) : null;
      let pt = pm ? pm[1].trim() : project;
      try { if (pt.startsWith("\"")) pt = JSON.parse(pt); } catch { /* raw */ }
      out.push(`<p class="mk-sub">${cs.w("screen.question.opened", { date: { html: date }, project: "" })}${cs.ref("project", project, pt, [])}</p>`);
    } else out.push(`<p class="mk-sub">${cs.w("screen.question.opened.noproject", { date: { html: date } })}</p>`);
  }

  /* strength against the bar: two grades and the phrase, the weakest part and what would raise it */
  /* the bar once the inquiry has said whose it is: the project's, else the group's */
  const bar = d.inquiry && d.inquiry.state !== "loading" ? later("bar", "strengthbarof", project ? { project } : {}) : { state: "loading" };
  const barOf = bar.state === "ok" && bar.value && bar.value.bar && (bar.value.bar.capture || bar.value.bar.connection)
    && (project ? bar.value.bar.declared !== false : true) ? bar.value.bar : null;
  const rank = { A: 4, B: 3, C: 2, D: 1 };
  /* a section that holds nothing is not drawn (R20): a read answered empty, or a body that draws nothing, makes no section;
     a read still pending or failed is drawn as such */
  const secOf = (titleKey, key, inner) => {
    if (d[key] && d[key].state === "empty") return "";
    const body = cs.state(key, view, inner);
    return body ? cs.sec(titleKey, body) : "";
  };
  out.push(cs.sec("screen.question.strength.head", cs.state("strength", view, (s) => {
    const axis = (a) => (s[a] && s[a].state === "graded" ? cs.grade(a, s[a].grade)
      : cs.mark("gap", s[a] && s[a].state === "undetermined" ? "undetermined" : "unrated", { reason: (s[a] && s[a].detail) || "" }));
    const parts = [axis("capture"), axis("connection")];
    if (s.testimony && s.testimony.state === "graded") parts.push(axis("testimony"));
    let phrase = cs.w("screen.question.strength.nobar");
    if (barOf) {
      const short = ["capture", "connection"].filter((a) => barOf[a] && !(s[a] && s[a].state === "graded"
        && rank[s[a].grade] >= rank[barOf[a]]));
      phrase = cs.w("screen.question.strength.against", { capture: barOf.capture || "", connection: barOf.connection || "" })
        + " · " + (short.length ? cs.w("screen.question.strength.short") + " " + short.map((a) => cs.w("mark.scale." + a + ".name")).join(", ")
                                : cs.w("screen.question.strength.meets"));
    }
    const weak = ["capture", "connection"].map((a) => s[a] && s[a].weakest).filter(Boolean)[0];
    const weakText = weak && typeof weak === "object" ? (weak.title || weak.target || weak.detail || "") : weak;
    const raise = ["capture", "connection"].map((a) => s[a] && s[a].state === "graded" && s[a].detail).filter(Boolean)[0];
    return `<div class="mk-strengthbox"><span class="cs-strength">${parts.join("")}<span class="phrase">${phrase}</span></span>`
      + `<p class="mk-note">${cs.w("screen.question.strength.two")}</p>`
      + (weakText ? `<p>${cs.w("screen.question.strength.weakest", { weakest: String(weakText) })}</p>` : "")
      + (raise ? `<p>${cs.w("screen.question.strength.raise", { raise: String(raise) })}</p>` : "")
      + ["capture", "connection"].filter((a) => s[a] && s[a].state === "undetermined")
          .map((a) => cs.mark("gap", "undetermined", { reason: s[a].detail || "" })).join("") + "</div>";
  }), { help: "mark.strength.means" }));

  /* what it waits on: a document set aside, with who and why; restore it with a reason, or find another source */
  out.push(secOf("screen.question.waits.head", "waits", (v) => {
    const list = Array.isArray(v) ? v : (v.waits || v.items || []);
    if (!list.length) return "";
    return list.map((x, i) => {
      const who = x.setter || x.by || x.handle || "";
      const doc2 = x.document || x.bundle_id || x.capture || "";
      const said = doc2 && x.reason !== undefined
        ? cs.w("screen.question.waits.setaside", { document: x.title || doc2, who, reason: x.reason || "" })
        : cs.w("screen.question.waits.item", { text: x.text || x.what || "" });
      return `<div class="cs-wait" data-wait="${i}">${said}`
        + (x.date || x.at ? `<span class="mk-small">${cs.w("screen.question.waits.since", { who, date: { html: cs.date(String(x.date || x.at), { year: false }) } })}</span>` : "")
        + (doc2 ? cs.act("heldrestore", { label: "act.heldrestore.label.question", data: { doc: doc2 } }) : "")
        + cs.act("search", { label: "act.search.label.question", data: { q: heading } }) + "</div>";
    }).join("");
  }));

  /* the current basis version's legs, by role; each live or severed by the inquiry's own reference to its target */
  const refOf = (target) => (doc ? doc.refs.find((r) => String(r.target || "") === target) : null);
  const whyOf = (note) => {
    /* citation R4's note: "<earlier> | Severed <ISO time>: <reason>" */
    const m = /(?:^|\|\s*)Severed (\S+): ([^|]*)$/.exec(String(note || "").trim());
    return m ? m[2].trim() : "";
  };
  const cur = (b) => {
    const vs = Array.isArray(b.versions) ? b.versions : [];
    const name = b.current && typeof b.current === "object" ? b.current.name : b.current;
    return vs.find((v) => v && v.name === name) || vs.find((v) => v && !v.hidden) || null;
  };
  const legRows = (b, role) => {
    const v = cur(b);
    const legs = v && Array.isArray(v.legs) ? v.legs.filter((l) => (l.role || "supports") === role) : [];
    if (!legs.length) return "";
    return cs.sheet(legs.map((l) => {
      const g = l.grade || (l.grades && l.grades.capture) || "";
      const scale = l.scale || (role === "cuts_against" && l.testimony ? "testimony" : "capture");
      const target = String(l.target || l.target_id || "");
      const facts = [l.target_title || target, l.extent_page ? cs.w("screen.document.passage.where", { page: l.extent_page }) : ""].filter(Boolean);
      const ref = refOf(target);
      const status = ref ? String(ref.status || "") : (l.status === "severed" || l.severed === true ? "severed" : "");
      const severed = status === "severed";
      const why = severed ? whyOf(ref && ref.note) : "";
      const live = status === "confirmed" || status === "proposed";
      return cs.row(g ? cs.grade(scale, g) : cs.mark("gap", "unrated"),
        (l.words ? `<span class="rec">“${cs.esc(l.words)}”</span>` : "")
        + `<span class="mk-small">${cs.ref("document", target, l.target_title || target, facts)}`
        + (severed ? ` · <span data-leg="severed">${why ? cs.w("screen.question.leg.severed.why", { why }) : cs.w("screen.question.leg.severed")}</span>` : "") + "</span>",
        live ? cs.act("sever", { label: "act.sever.label.question", data: { target } })
          : severed ? cs.act("reinstate", { label: "act.reinstate.label.question", data: { target } }) : "");
    }).join(""));
  };
  out.push(cs.sec("screen.question.supports.head", cs.state("basis", view, (b) => legRows(b, "supports"))
    + `<p class="mk-small">${cs.w("screen.question.cite.from")}</p>`
    + cs.act("cite", { label: "act.cite.label.question", data: { inquiry: id, q: heading }, tone: "primary" })));
  out.push(secOf("screen.question.against.head", "basis", (b) => legRows(b, "cuts_against")));

  /* hunches: a member's suspicion, labeled, never evidence (mark.hunch) */
  out.push(cs.sec("screen.question.hunches.head", (d.hunches && d.hunches.state === "empty" ? "" : cs.state("hunches", view, (h) =>
    (h.hypotheses || []).map((x) => `<p><span class="cs-hunch" data-mark="hunch">${cs.w("screen.question.hunch.by", { who: x.held_by || "" })}</span> `
      + `<span class="rec">${cs.esc(x.statement || "")}</span></p>`).join("")))
    + cs.field("question-hunch", "screen.question.hunch.label", { area: true, rec: true })
    + cs.choice("question-hunch-kind", "screen.question.hunch.kind",
        [["other", "screen.question.hunch.kind.other"], ["flow", "screen.question.hunch.kind.flow"]], { value: "other" })
    + cs.act("hypothesishold", { label: "act.hypothesishold.label.question", data: { inquiry: id } }), { help: "mark.hunch.means" }));

  /* concluding: the conclusion as held; narrow, conclude, withdraw; a check by expertise; a plan */
  const concl = cs.state("basis", view, (b) => {
    const c = b.conclusion;
    const stance = b.conclusion_stance;
    if (stance === "withdrawn") return `<p>${cs.w("screen.question.concluded.withdrawn")}</p>`;
    if (c && (c.claim || c.text || typeof c === "string"))
      return `<p>${cs.w("screen.question.concluded", { claim: typeof c === "string" ? c : (c.text || (c.claim && c.claim.text) || c.claim || "") })}</p>`;
    return `<p>${cs.w("screen.question.concluded.none")}</p>`;
  });
  const concluded = d.basis && d.basis.state === "ok" && d.basis.value && d.basis.value.conclusion
    && d.basis.value.conclusion_stance !== "withdrawn";
  out.push(cs.sec("screen.question.concluding.head", concl
    + cs.field("question-narrow-name", "screen.question.narrow.name", {})
    + cs.field("question-narrow-description", "screen.question.narrow.description", { area: true, rec: true })
    + cs.act("narrow", { label: "act.narrow.label.question", data: { inquiry: id } })
    + (concluded ? cs.act("withdrawconclusion", { label: "act.withdrawconclusion.label.question", data: { inquiry: id } })
                 : (project ? "" : cs.field("question-conclude-claim", "screen.question.conclude.claim", { area: true, rec: true }))
                   + cs.field("question-conclude-falsifier", "screen.question.conclude.falsifier", { area: true, rec: true })
                   + cs.field("question-conclude-commentary", "screen.question.conclude.commentary", { area: true, rec: true })
                   + cs.act("conclude", { label: "act.conclude.label.question", data: { inquiry: id } }))
    + `<p class="mk-small">${cs.w("screen.question.conclude.who")}</p>`
    + cs.field("question-check", "screen.question.check.label", { help: "screen.question.check.help" })
    + cs.field("question-check-note", "screen.question.check.note", { area: true, rec: true })
    + cs.act("checkrequest", { label: "act.checkrequest.label.question", data: { inquiry: id } })
    + cs.field("question-plan", "screen.question.plan.label", {})
    + cs.act("planopen", { label: "act.planopen.label.question", data: { inquiry: id } })
    + (Array.isArray(ui.plans) ? ui.plans.map((p) => `<p class="mk-note">${cs.w("screen.question.plan.opened", { title: p.title || p.id || "" })}</p>`).join("") : "")));
  return out.join("");
}

/** R2's acts, each answering `{query, body}` for the shell to send, or opening another screen and sending nothing
 *  (`findin`'s scope and `search` live on `screens-daily`'s screens). */
const acts = [
  { op: "cite", label: "act.cite.label.question",
    /* the passage is chosen where passages are: a document's (its per-passage cite names this question), or Find in over
       the question's project (`find-in`'s scope is a project, a held set or a capture); with no project, Find */
    send(view, el, cs) {
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      if (m) cs.go("find-in", m[1]); else cs.go("finder", el.dataset.q || "");
      return null;
    } },
  /* narrow, conclude and withdraw are reasoned (op-grades): narrow's and conclude's own words serve as their reason
     (interface-shell R11, DEC-88); withdraw asks the shell's reason, carried in the query, where its owner reads it
     (`raw` makes the shell put the reason there; an empty body reaches the door as none) */
  { op: "narrow", label: "act.narrow.label.question", reasonField: "description",
    send(view, el, cs) {
      const name = String(cs.value("question-narrow-name") || "").trim();
      const description = String(cs.value("question-narrow-description") || "").trim();
      if (!name || !description) return { refuse: "screen.question.narrow.empty" };
      const b = view.data.basis && view.data.basis.state === "ok" ? view.data.basis.value : {};
      const version = b && b.current && typeof b.current === "object" ? b.current.name : (b && b.current) || "";
      return { body: { target: String(view.subject || ""), ...(version ? { version: String(version) } : {}), name, description } };
    } },
  { op: "conclude", label: "act.conclude.label.question", reasonField: "commentary",
    send(view, el, cs) {
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      const b = view.data.basis && view.data.basis.state === "ok" ? view.data.basis.value : {};
      const version = b && b.current && typeof b.current === "object" ? b.current.name : (b && b.current) || "";
      const claim = String(cs.value("question-conclude-claim") || "").trim();
      const falsifier = String(cs.value("question-conclude-falsifier") || "").trim();
      const commentary = String(cs.value("question-conclude-commentary") || "").trim();
      const q = { target: String(view.subject || "") };
      if (m) q.project = m[1]; else if (claim) q.conclusion = claim;
      if (version) q.version = String(version);
      if (falsifier) q.falsifier = falsifier; else q.no_falsifier = "1";
      if (commentary) q.commentary = commentary;
      return { query: q, raw: "" };
    } },
  { op: "withdrawconclusion", label: "act.withdrawconclusion.label.question",
    send(view) {
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      return { query: { target: String(view.subject || ""), ...(m ? { project: m[1] } : {}) }, raw: "" };
    } },
  { op: "hypothesishold", label: "act.hypothesishold.label.question",
    send(view, el, cs) {
      const statement = String(cs.value("question-hunch") || "").trim();
      if (!statement) return { refuse: "screen.question.hunch.empty" };
      const kind = cs.value("question-hunch-kind") === "flow" ? "flow" : "other";
      return { body: { inquiry: String(view.subject || ""), kind, statement } };
    } },
  { op: "planopen", label: "act.planopen.label.question", reasonField: "title",
    send(view, el, cs) {
      const title = String(cs.value("question-plan") || "").trim();
      if (!title) return { refuse: "screen.question.plan.empty" };
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      return { body: { ...(m ? { project: m[1] } : {}), title, subjects: [{ kind: "inquiry", inquiry: String(view.subject || "") }] } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      cs.set("plans", (Array.isArray(view.ui.plans) ? view.ui.plans : []).concat([{ id: (r && r.id) || "", title: (r && r.title) || "" }]));
    } },
  { op: "checkrequest", label: "act.checkrequest.label.question", reasonField: "note",
    send(view, el, cs) {
      const label = String(cs.value("question-check") || "").trim();
      const note = String(cs.value("question-check-note") || "").trim();
      if (!label || !note) return { refuse: "screen.question.check.empty" };
      return { body: { target: String(view.subject || ""), label, note } };
    } },
  /* R12: the leg's target selected first (`citation` takes a selection handle), then the act on the question as its
     citing object; the member's reason is the shell's (their weight's, interface-shell R11), carried in the query where
     `citation` reads it (`raw`) */
  ...["sever", "reinstate"].map((op) => ({ op, label: "act." + op + ".label.question", rereads: ["inquiry", "basis", "strength"],
    async send(view, el, cs) {
      const s = await cs.call("select", { body: { ids: [String(el.dataset.target || "")] } }).then((a) => a, () => null);
      const sr = s && s.result !== undefined ? s.result : s;
      if (!s || s.ok === false || !sr || sr.ok === false || !sr.handle) return { refuse: "screen.question.leg.unselectable" };
      return { query: { project: String(view.subject || ""), handle: String(sr.handle) }, raw: "" };
    } })),
  { op: "heldrestore", label: "act.heldrestore.label.question",
    send(view, el) { return { body: { ids: [el.dataset.doc || ""] } }; } },
  { op: "search", label: "act.search.label.question",
    send(view, el, cs) { cs.go("finder", el.dataset.q || ""); return null; } },
];

/** The keys the question screen may draw. */
const words = [
  "screen.question.name", "screen.question.purpose",
  ...["cite", "sever", "reinstate", "narrow", "conclude", "withdrawconclusion", "hypothesishold", "planopen", "checkrequest", "heldrestore", "search"]
    .flatMap((op) => ["act." + op + ".label.question", "act." + op + ".does"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading", "mark.strength.means", "mark.hunch.means",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "state.empty", "state.loading", "state.failed", OWN["screen.document.passage.where"],
  ...ownRows("screen.question."),
];

/** The question screen (interface-shell R21). */
export const QUESTION_SCREEN = Object.freeze({ id: "question", reads, place, render, acts, words });
