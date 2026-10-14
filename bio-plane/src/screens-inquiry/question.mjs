/* screens-inquiry R2, R12, R23–R27, R31, R34–R36, R38, R39, R41, R44: the question screen (Projects › <project> ›
 * Question; registry screen `question`).
 *
 * Self-contained functions (interface-shell R21 (1)): each refers only to its parameters, `cs` and the language's own
 * globals; the readers they share (`front`, `later`, `plain`, `who`) are the screen's `parts` (common.mjs). The question
 * is the inquiry `view.subject`; its own document (`image`) holds what it cites: its `references[]` (each live or severed,
 * `citation` R15) and its `basis[]` legs (R34: Supports lists every passage it cites, whether or not a reading exists),
 * each leg's `ground` and the `grounds:` block (its partition, `inquiry` R27, R28; R23, R24), and the Session Log's
 * regroupings. Its readings are `basisversions` (R25), the one the project stands on read with `project`.
 *
 * Its states (R41, `Q_ST`): c, nothing cited (the three ways in); b, passages cited and no partition (what each passage
 * carries, no strength drawn); a, the strength against the bar and the read-back; d, a run of hers at work on it; e, a
 * reading the assistant proposed; f, the assistant's limit reached; g, concluded. Every sentence is a word by key (R44). */

/** R2, R25, R26: the reads, each as its owner documents it. */
function reads(view) {
  const id = String(view.subject || "");
  return {
    inquiry: { op: "image", query: { id }, subject: true, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    strength: { op: "inquirystrength", query: { id } },
    basis: { op: "basisversions", query: { id } },
    hunches: { op: "hypotheses", query: { inquiry: id },
               empty: (v) => !v || !Array.isArray(v.hypotheses) || v.hypotheses.length === 0 },
    waits: { op: "questionwaits", query: { question: id } },
    relies: { op: "backlinks", query: { target: id },
              empty: (v) => !v || ((!Array.isArray(v.backlinks) || v.backlinks.length === 0) && v.out_of_view !== true) },
  };
}

/** The path's project step: the project the inquiry states, by its title once read (R39: never its id). */
function place(view) {
  const d = view.data && view.data.inquiry;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  if (!m) return {};
  const t = view.ui && view.ui.later && view.ui.later["project:" + m[1]];
  const ft = t && t.state === "ok" && t.value && typeof t.value["bundle.md"] === "string"
    ? /^title:\s*(.*)$/m.exec(t.value["bundle.md"]) : null;
  let title = ft ? ft[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* raw */ }
  return { project: { id: m[1], title } };
}

/** R2, R5, R23–R27, R31, R34–R36, R38, R41: the question in its state. */
function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui;
  const d = view.data || {};
  const P = view.parts;
  const W = (k, f) => cs.w(k, f);
  const T = (k, f) => P.plain(cs, k, f);
  const later = (key, op, query, token) => P.later(cs, ui, key, op, query, token);
  const doc = d.inquiry && d.inquiry.state === "ok" ? P.front(d.inquiry.value["bundle.md"]) : null;
  const project = doc && /^PROJ-/.test(String(doc.project || "")) ? String(doc.project) : "";
  const out = [];
  /* R39: the question's words, else its title; never its id */
  const heading = doc ? (doc.question || doc.title || "") : "";
  out.push(cs.title(heading || T("state.undetermined", { reason: "" }), { thing: "question" }));
  if (!doc) return out.join("");
  const pr = project ? later("project:" + project, "image", { id: project }) : null;
  const projectTitle = (() => {
    const m = pr && pr.state === "ok" && pr.value && typeof pr.value["bundle.md"] === "string" ? /^title:\s*(.*)$/m.exec(pr.value["bundle.md"]) : null;
    let t = m ? m[1].trim() : "";
    try { if (t.startsWith("\"")) t = JSON.parse(t); } catch { /* raw */ }
    return t;
  })();
  {
    const date = doc.created ? cs.date(String(doc.created), { year: true }) : "";
    if (project) out.push(`<p class="mk-sub">${W("screen.question.opened", { date: { html: date }, project: "" })}${cs.ref("project", project, projectTitle || T("state.undetermined", { reason: "" }), [])}</p>`);
    else out.push(`<p class="mk-sub">${W("screen.question.opened.noproject", { date: { html: date } })}</p>`);
  }

  /* R31: "Read in my language", only while the assistant is reachable: its answer drawn in place, labeled, and the
     original back by one press of the same control (nothing saved, nothing read again) */
  if (view.reachable) {
    const tr = ui.translation;
    if (tr && tr.shown) out.push(`<div class="mk-note" data-translation="shown"><p class="rec">${cs.esc(tr.text)}</p>`
      + `<p class="mk-small">${W("translate.label", { language: tr.from || T("state.undetermined", { reason: "" }) })}</p>`
      + `<p class="mk-small">${W("translate.label.help")}</p></div>`);
    out.push(cs.act("readtranslate", { label: tr ? (tr.shown ? "translate.original" : "translate.back") : "act.readtranslate.label.question",
      data: { project }, tone: "quiet" }));
  }

  /* the inquiry's own legs (R34): its basis[] with each one's place (`ord`, inquiry R27's ordinal), and its references */
  const refs = (doc.lists.references || []).filter((r) => r && r.target);
  const refOf = (target) => refs.find((r) => String(r.target) === target) || null;
  const legs = (doc.lists.basis || []).map((l, ord) => Object.assign({ ord }, l)).filter((l) => l && l.target);
  const citedLegs = legs.length ? legs
    : refs.filter((r) => (r.rel || "cites") === "cites").map((r, i) => ({ ord: i, target: r.target, role: "supports", fromRef: true }));
  const supports = citedLegs.filter((l) => (l.role || "supports") === "supports");
  const statusOf = (l) => { const r = refOf(String(l.target)); return r ? String(r.status || "") : (l.status === "severed" ? "severed" : ""); };
  const live = (l) => statusOf(l) !== "severed";
  const grounds = doc.lists.grounds || [];
  const partitioned = grounds.length > 0 && legs.some((l) => l.ground);

  /* the readings (R25): every one `basisversions` answers, and the one the project stands on (read with `project`) */
  const vs = d.basis && d.basis.state === "ok" && Array.isArray(d.basis.value.versions) ? d.basis.value.versions : [];
  const cur = project ? later("current", "basisversions", { id, project }) : null;
  const current = cur && cur.state === "ok" && cur.value.current ? cur.value.current : null;
  const currentName = current ? String(current.version || "") : "";
  const accepted = vs.filter((v) => v && v.state === "accepted");
  const machine = (v) => !!(v && (v.run || /^class:/.test(String(v.author || ""))));
  const picked = ui["choice:question-reading"];
  const shownName = (picked && vs.some((v) => v.name === picked)) ? picked
    : (currentName && vs.some((v) => v.name === currentName)) ? currentName : (accepted[0] ? accepted[0].name : (vs[0] ? vs[0].name : ""));
  const shown = vs.find((v) => v.name === shownName) || null;
  const legTitle = (l) => {
    const r = shown && Array.isArray(shown.legs) ? shown.legs.find((x) => String(x.target_id || x.target) === String(l.target)) : null;
    return String(l.target_title || l.title || (r && r.target_title) || l.target);
  };
  const legGrade = (l) => {
    const r = shown && Array.isArray(shown.legs) ? shown.legs.find((x) => String(x.target_id || x.target) === String(l.target)) : null;
    return (r && r.grade) || l.grade || "";
  };
  const legName = (l) => legTitle(l) + (l.extent_page ? " · " + T("screen.document.passage.where", { page: l.extent_page }) : "");

  /* R41 state g: concluded; c: nothing cited; d: a run of hers at work; e: the assistant's proposal; f: its limit */
  const b = d.basis && d.basis.state === "ok" ? d.basis.value : null;
  const concluded = !!(b && b.conclusion && b.conclusion_stance !== "withdrawn");
  const member = view.me && view.me.member;
  const runs = view.reachable && member ? later("runs", "airuns", { contextType: "inquiry", contextId: id, limit: "50" }, String(ui.seq || 0)) : null;
  const myRun = runs && runs.state === "ok" && Array.isArray(runs.value.runs)
    ? runs.value.runs.find((s) => s && s.status === "running" && s.principal && typeof s.principal.plane === "string"
      && (s.principal.plane === "member:" + member || s.principal.plane.startsWith("member:" + member + "/"))) : null;
  const pack = view.reachable ? later("pack", "agentpack", {}) : null;
  const packName = pack && pack.state === "ok" && pack.value && ((pack.value.pack && (pack.value.pack.version || pack.value.pack.skillVersion)) || pack.value.version);
  const askAct = view.reachable && packName && member
    ? cs.act("airunopen", { label: "act.airunopen.label.question", data: { pack: String(packName) } }) : "";

  if (!citedLegs.length && !myRun && !concluded) {
    /* state c: new and empty, the three ways in (R38: "Capture a document for it" opens `capture` with this question) */
    const rows = [cs.row("", `<b>${W("question.empty.capture")}</b><br><span class="mk-sub">${W("question.empty.capture.line")}</span>`,
        `<a class="cs-btn" data-tone="quiet" href="/app/capture/address/${cs.esc(id)}" data-nav data-adddoc="question">${W("question.adddoc")}</a>`),
      cs.row("", `<b>${W("question.empty.find")}</b><br><span class="mk-sub">${W("question.empty.find.line")}</span>`,
        cs.act("search", { label: "act.search.label.question", data: { q: heading } }))];
    if (askAct) rows.push(cs.row("", `<b>${W("question.empty.ask")}</b><br><span class="mk-sub">${W("question.empty.ask.line")}</span>`, askAct));
    out.push(cs.sec("question.empty.heading", `<p class="mk-note">${W("question.empty.note")}</p>` + cs.sheet(rows.join("")), { id: "state-c" }));
    if (ui.said) out.push(ui.said.html);
    out.push(limitPart());
    return out.join("");
  }
  /* state d: a run of hers at work on it */
  if (myRun) out.push(cs.sec("question.run.heading", `<div class="cs-machinework" data-origin="machine">${cs.mark("origin", "machine")}</div>`
    + `<p class="mk-note">${W("question.run.leave")}</p>`
    + cs.act("airunclose", { label: "act.airunclose.label.question", data: { run: String(myRun.id || "") } }), { id: "state-d" }));
  /* state e: a reading the assistant proposed, not yet weighed, only while the assistant is reachable */
  const proposals = view.reachable ? vs.filter((v) => machine(v) && v.state === "suggested" && !v.hidden) : [];
  for (const v of proposals) {
    const rests = (Array.isArray(v.legs) ? v.legs : []).map((l) => String(l.target_title || l.target_id || "")).filter(Boolean);
    out.push(cs.sec("question.proposal.heading", `<div class="cs-machinework" data-origin="machine">${cs.mark("origin", "machine")}`
      + (v.untested || (b && b.untested) ? `<span class="cs-draftlabel" data-label="untested">${W("ai.label.untested")}</span>` : "")
      + `<p class="rec">${cs.esc(String(v.claim && v.claim.text ? v.claim.text : v.description || v.name))}</p>`
      + (rests.length ? `<p class="mk-small rec">${cs.esc(rests.join(" · "))}</p>` : "") + "</div>"
      + cs.act("versionaccept", { label: "act.versionaccept.label.question", data: { version: v.name, grounds: (v.grounds || []).join(",") }, tone: "primary" })
      + cs.act("versionreject", { label: "act.versionreject.label.question", data: { version: v.name } }), { id: "state-e" }));
  }
  /* state f: the assistant's limit, and the other reasons it can't work here (R42) */
  out.push(limitPart());
  function limitPart() {
    const f = ui.limit;
    if (!f) return "";
    return cs.sec("question.empty.ask", `<p class="cs-gap" data-gap="refused" role="alert">${W("ai.refused.limit.overall", { whose: f.whose || "", period: f.period || "", when: f.when || "" })}</p>`
      + `<p class="mk-note">${W("question.limit.note")}</p>`
      + `<details class="mk-details" data-reasons="question"><summary>${W("question.ai.other")}</summary>`
      + (f.reasons || []).map((k) => `<p class="mk-small">${W(k)}</p>`).join("") + `<p class="mk-small">${W("question.ai.whose")}</p></details>`, { id: "state-f" });
  }

  /* state g: concluded (who, when, the reading's words, what would change it, its strength) */
  if (concluded) {
    const c = b.conclusion;
    const claim = typeof c === "string" ? c : (c.text || (c.claim && c.claim.text) || (typeof c.claim === "string" ? c.claim : "") || "");
    const by = P.who(cs, c.by || c.author || "");
    const at = c.at ? cs.date(String(c.at), { year: true }) : "";
    const fal = c.falsifier && typeof c.falsifier === "object" ? c.falsifier.text : c.falsifier;
    out.push(cs.sec("question.concluded.heading", cs.sheet(cs.row("", `<b>${W("question.concluded.by", { who: by, date: { html: at } })}</b> <span class="rec">“${cs.esc(claim)}”</span>`
        + (fal ? `<br><span class="mk-sub">${W("question.concluded.falsifier", { falsifier: String(fal) })}</span>` : "")
        + (d.strength && d.strength.state === "ok" ? `<br>${grades(d.strength.value)}` : "")))
      + cs.act("withdrawconclusion", { label: "act.withdrawconclusion.label.question", data: { inquiry: id } })
      + cs.act("planopen", { label: "act.planopen.label.question", data: { inquiry: id } }), { id: "state-g" }));
  }

  /* two grades, never one score (R2); a grade's strength sentence is drawn by its words (R34), never raw grade text */
  function axes(s) {
    const axis = (a) => (s[a] && s[a].state === "graded" ? cs.grade(a, s[a].grade)
      : cs.mark("gap", s[a] && s[a].state === "undetermined" ? "undetermined" : "unrated", { reason: (s[a] && s[a].detail) || "" }));
    const parts = [axis("capture"), axis("connection")];
    if (s.testimony && s.testimony.state === "graded") parts.push(axis("testimony"));
    return parts.join("");
  }
  function grades(s) { return `<span class="cs-strength">${axes(s)}</span>`; }
  const strengthText = (s) => (s && typeof s === "object" ? ["capture", "connection"].map((a) => (s[a] && s[a].grade) || "?").join("/") : String(s || ""));

  /* R23: what each passage carries: one choice per cited passage, the passages that would hold it up, the read-back,
     and "Save the answers"; drawn as state b, and (R24) inside "Change what a passage carries…" */
  const live1 = supports.filter(live);
  const askForm = (regroup) => {
    const asks = live1.map((l) => {
      const others = live1.filter((o) => o.ord !== l.ord);
      return `<div class="mk-ev" data-ask="${l.ord}"><span class="rec">${cs.esc(legName(l))}</span>`
        + cs.checks("ask-" + l.ord, "question.ask", [["no", "question.ask.no"], ["yes", "question.ask.yes"]], { radio: true })
        + (others.length ? `<fieldset class="cs-field" id="ask-which-${l.ord}"><legend>${W("question.ask.which")}</legend>`
          + others.map((o, i) => `<label><input type="checkbox" name="ask-which-${l.ord}" id="ask-which-${l.ord}-${i}" value="${o.ord}"> ${cs.esc(legName(o))}</label>`).join("") + "</fieldset>" : "")
        + "</div>";
    }).join("");
    /* the read-back as saved now: until the member saves, every passage is one the answer cannot do without */
    const readback = `<div class="cs-sheet" data-readback="ask"><b>${W("question.rests.any")}</b>`
      + live1.map((l) => `<span class="mk-small">· ${cs.esc(legName(l))}</span>`).join("") + `<span class="mk-small">${W("question.rests.readback")}</span></div>`;
    return `<div class="mk-versions">${asks}</div>` + readback
      + cs.act("inquiryground", { label: "act.inquiryground.label.question", data: { inquiry: id, regroup: regroup ? "1" : "" }, tone: "primary" });
  };
  if (supports.length && !partitioned) {
    out.push(`<div class="cs-sheet" data-state="ask"><b>${W("question.ask.first.title")}</b><p class="mk-small">${W("question.ask.first.says")}</p></div>`);
    out.push(cs.sec("question.ask.title", askForm(false), { help: "question.ask.help", id: "state-b" }));
  } else if (supports.length) {
    /* state a: the strength against the bar, the weakest part and what would raise it */
    const bar = d.inquiry.state !== "loading" ? later("bar", "strengthbarof", project ? { project } : {}) : { state: "loading" };
    const barOf = bar.state === "ok" && bar.value && bar.value.bar && (bar.value.bar.capture || bar.value.bar.connection)
      && (project ? bar.value.bar.declared !== false : true) ? bar.value.bar : null;
    const rank = { A: 4, B: 3, C: 2, D: 1 };
    out.push(cs.sec("screen.question.strength.head", cs.state("strength", view, (s) => {
      let phrase = W("screen.question.strength.nobar");
      if (barOf) {
        const short = ["capture", "connection"].filter((a) => barOf[a] && !(s[a] && s[a].state === "graded" && rank[s[a].grade] >= rank[barOf[a]]));
        phrase = W("screen.question.strength.against", { capture: barOf.capture || "", connection: barOf.connection || "" })
          + " · " + (short.length ? W("screen.question.strength.short") + " " + short.map((a) => W("mark.scale." + a + ".name")).join(", ")
                                  : W("screen.question.strength.meets"));
      }
      const weak = ["capture", "connection"].map((a) => s[a] && s[a].weakest).filter(Boolean)[0];
      const weakText = weak && typeof weak === "object" ? (weak.title || weak.target || weak.detail || "") : weak;
      const raise = ["capture", "connection"].map((a) => s[a] && s[a].state === "graded" && s[a].detail).filter(Boolean)[0];
      return `<div class="mk-strengthbox"><span class="cs-strength">${axes(s)}<span class="phrase">${phrase}</span></span>`
        + `<p class="mk-note">${W("screen.question.strength.two")}</p>`
        + (weakText ? `<p>${W("screen.question.strength.weakest", { weakest: String(weakText) })}</p>` : "")
        + (raise ? `<p>${W("screen.question.strength.raise", { raise: String(raise) })}</p>` : "")
        + ["capture", "connection"].filter((a) => s[a] && s[a].state === "undetermined")
            .map((a) => cs.mark("gap", "undetermined", { reason: s[a].detail || "" })).join("") + "</div>";
    }), { help: "mark.strength.means" }));
  }

  /* what it waits on: a document set aside, with who and why; restore it with a reason, or find another source */
  if (!(d.waits && d.waits.state === "empty")) {
    const inner = cs.state("waits", view, (v) => {
      const list = Array.isArray(v) ? v : (v.waits || v.items || []);
      return list.map((x, i) => {
        const by = P.who(cs, x.setter || x.by || x.handle || "");
        const doc2 = x.document || x.bundle_id || x.capture || "";
        const said = doc2 && x.reason !== undefined
          ? W("screen.question.waits.setaside", { document: x.title || doc2, who: by, reason: x.reason || "" })
          : W("screen.question.waits.item", { text: x.text || x.what || "" });
        return `<div class="cs-wait" data-wait="${i}">${said}`
          + (x.date || x.at ? `<span class="mk-small">${W("screen.question.waits.since", { who: by, date: { html: cs.date(String(x.date || x.at), { year: false }) } })}</span>` : "")
          + (doc2 ? cs.act("heldrestore", { label: "act.heldrestore.label.question", data: { doc: doc2 } }) : "")
          + cs.act("search", { label: "act.search.label.question", data: { q: heading } }) + "</div>";
      }).join("");
    });
    if (inner) out.push(cs.sec("screen.question.waits.head", inner));
  }

  /* the partition as the inquiry holds it (R23, R24): each ground's legs; a leg with no ground is a part of its own */
  const parts = [];
  if (partitioned) {
    const byGround = new Map();
    for (const l of supports.filter(live)) {
      const g = l.ground ? String(l.ground) : "#" + l.ord;
      if (!byGround.has(g)) byGround.set(g, []);
      byGround.get(g).push(l);
    }
    for (const [label, ls] of byGround) parts.push({ label, legs: ls });
  }
  const partOf = (l) => parts.find((p) => p.legs.some((x) => x.ord === l.ord)) || null;

  /* Supports (R34): every passage the question cites, from its own legs; R25's chooser; R23's line beneath each; R12 */
  const legRow = (l, role) => {
    const g = legGrade(l);
    const scale = l.grade_axis || l.scale || (role === "cuts_against" && l.testimony ? "testimony" : role === "cuts_against" && /testimony/.test(String(l.grade_axis || "")) ? "testimony" : "capture");
    const target = String(l.target);
    const ref = refOf(target);
    const status = statusOf(l);
    const severed = status === "severed";
    const why = severed ? (() => {
      const m = /(?:^|\|\s*)Severed (\S+): ([^|]*)$/.exec(String((ref && (ref.note || ref.reason)) || "").trim());
      return m ? m[2].trim() : String((ref && ref.reason) || "");
    })() : "";
    const isLive = status === "confirmed" || status === "proposed" || status === "active";
    const part = role === "supports" && partitioned && !severed ? partOf(l) : null;
    const others = part ? part.legs.filter((x) => x.ord !== l.ord).map(legName) : [];
    const line = part ? `<span class="mk-small" data-carries="${others.length ? "holds" : "falls"}">${others.length
      ? W("question.holds", { others: others.join(", ") }) : W("question.falls")}</span>` : "";
    return cs.row(g ? cs.grade(scale === "testimony" ? "testimony" : "capture", g) : "",
      (l.words ? `<span class="rec">“${cs.esc(l.words)}”</span>` : "")
      + `<span class="mk-small">${cs.ref("document", target, legTitle(l), [legTitle(l)])}`
      + (severed ? ` · <span data-leg="severed">${why ? W("screen.question.leg.severed.why", { why }) : W("screen.question.leg.severed")}</span>` : "") + "</span>" + line,
      isLive ? cs.act("sever", { label: "act.sever.label.question", data: { target } })
        : severed ? cs.act("reinstate", { label: "act.reinstate.label.question", data: { target } }) : "");
  };
  const chooser = vs.length ? cs.choice("question-reading", "question.reading.shown",
    vs.filter((v) => !v.hidden && v.state !== "rejected").map((v) => ({ value: String(v.name), text: String(v.name) })),
    { value: shownName, acts: {} }) + `<p class="mk-small">${W("question.reading.shown.help")}</p>` : "";
  let restsBack = "";
  if (partitioned) {
    /* R24: the read-back, the shared origins, who set it and every later change */
    const singles = parts.filter((p) => p.legs.length === 1), many = parts.filter((p) => p.legs.length > 1);
    const ind = later("independence", "partitionindependence", shownName ? { id, version: shownName }
      : { id, partition: JSON.stringify(citedLegs.reduce((acc, l) => { const p = partOf(l); const k = p ? p.label : "#" + l.ord; if (!acc.keys.includes(k)) { acc.keys.push(k); acc.list.push([]); } acc.list[acc.keys.indexOf(k)].push(l.ord); return acc; }, { keys: [], list: [] }).list) });
    const iv = ind.state === "ok" && ind.value && ind.value.independence ? ind.value.independence : null;
    const nameOfPart = (x) => {
      if (typeof x === "number" && parts[x]) return parts[x].legs.map(legName).join(", ");
      const p = parts.find((q) => q.label === String(x));
      return p ? p.legs.map(legName).join(", ") : String(x);
    };
    const shared = iv && Array.isArray(iv.shared) ? iv.shared.map((s) => {
      const t = Array.isArray(s.through) && s.through.length ? String(s.through[0]) : "";
      const origin = /^undetermined:/.test(t) ? T("state.undetermined", { reason: t.replace(/^undetermined:/, "") }) : t.replace(/^\w+:/, "");
      return `<p class="mk-small" data-origin-shared="${cs.esc(t)}">${W("question.origin.shared", { passages: nameOfPart(s.a) + ", " + nameOfPart(s.b), origin })}</p>`;
    }).join("") : "";
    const set = grounds[0] || {};
    const changes = doc.log.filter((e) => e.act === "Restructured");
    const now = d.strength && d.strength.state === "ok" ? strengthText(d.strength.value) : "";
    restsBack = cs.sec("question.rests.title",
      (singles.length ? `<p><b>${W("question.rests.any")}</b></p>` + singles.map((p) => `<p class="mk-small">· ${cs.esc(legName(p.legs[0]))}</p>`).join("") : "")
      + many.map((p) => `<p class="mk-small">${W("question.rests.all", { passages: p.legs.map(legName).join(", ") })}</p>`).join("")
      + shared + (iv && iv.complete === false ? `<p class="mk-small" data-complete="false">${cs.mark("gap", "undetermined", { reason: "" })}</p>` : "")
      + (set.asserted_by || set.at ? `<p class="mk-small">${W("question.rests.set", { who: P.who(cs, set.asserted_by || ""), date: { html: set.at ? cs.date(String(set.at), { year: true }) : "" } })}</p>` : "")
      + changes.map((e, i) => `<p class="mk-small" data-change="${i}">${W("question.rests.changed", { who: P.who(cs, e.who), date: { html: cs.date(e.at, { year: true }) },
          reason: e.reason, before: e.before.replace(/capture |connection |testimony /g, ""), after: changes[i + 1] ? changes[i + 1].before.replace(/capture |connection |testimony /g, "") : now })}</p>`).join("")
      /* "Change what a passage carries…" reopens R23's questions in place; the save carries her reason (NO_REASON) */
      + `<details class="mk-details" data-regroup="1"><summary>${W("question.rests.change")}</summary>`
      + `<p class="mk-small">${W("question.ask.title")}</p>` + askForm(true) + "</details>");
  }
  const supportsRows = supports.length ? cs.sheet(supports.map((l) => legRow(l, "supports")).join("")) : "";
  out.push(cs.sec("screen.question.supports.head", chooser + supportsRows
    + `<p class="mk-small">${W("screen.question.cite.from")}</p>`
    + cs.act("cite", { label: "act.cite.label.question", data: { inquiry: id, q: heading }, tone: "primary" })
    /* R38: "Add a document" opens `capture` with this question as its subject */
    + ` <a class="cs-btn" data-tone="quiet" href="/app/capture/address/${cs.esc(id)}" data-nav data-adddoc="question">${W("question.adddoc")}</a>`));
  if (restsBack) out.push(restsBack);
  const against = citedLegs.filter((l) => l.role === "cuts_against");
  if (against.length) out.push(cs.sec("screen.question.against.head", cs.sheet(against.map((l) => legRow(l, "cuts_against")).join(""))));

  /* hunches: a member's suspicion, labeled, never evidence (mark.hunch) */
  out.push(cs.sec("screen.question.hunches.head", (d.hunches && d.hunches.state === "empty" ? "" : cs.state("hunches", view, (h) =>
    (h.hypotheses || []).map((x) => `<p><span class="cs-hunch" data-mark="hunch">${W("screen.question.hunch.by", { who: P.who(cs, x.held_by || "") })}</span> `
      + `<span class="rec">${cs.esc(x.statement || "")}</span></p>`).join("")))
    + cs.field("question-hunch", "screen.question.hunch.label", { area: true, rec: true })
    + cs.choice("question-hunch-kind", "screen.question.hunch.kind",
        [["other", "screen.question.hunch.kind.other"], ["flow", "screen.question.hunch.kind.flow"]], { value: "other" })
    + cs.act("hypothesishold", { label: "act.hypothesishold.label.question", data: { inquiry: id } }), { help: "mark.hunch.means" }));

  /* R25: the readings, each with its state, its strength (a what-if unless accepted) and its acts */
  const joined = project ? (() => {
    const pp = later("participants", "projectparticipants", { projectId: project });
    const me = view.me && view.me.handle;
    return pp.state === "ok" && Array.isArray(pp.value.participants) && pp.value.participants.some((x) => x && x.handle === me && x.state === "joined");
  })() : false;
  const drawable = vs.filter((v) => !machine(v) || view.reachable);
  if (drawable.length) {
    const stateLine = (v) => {
      const m = v.moved || {};
      const by = P.who(cs, m.by || v.author || ""), at = m.at || v.at ? cs.date(String(m.at || v.at), { year: true }) : "";
      const key = v.state === "accepted" ? "question.reading.accepted" : v.state === "considering" ? "question.reading.weighing" : "question.reading.suggested";
      const said = W(key, { who: by, date: { html: at }, reason: String(m.reason || "") });
      return machine(v) ? cs.mark("origin", "machine") + " " + said : said;
    };
    const rowOf = (v) => {
      const vsr = later("vs:" + v.name, "versionstrength", { id, version: String(v.name), states: v.state === "accepted" ? "accepted" : String(v.state) });
      const strength = vsr.state === "ok" && vsr.value && vsr.value.pair
        ? `<span class="mk-small" data-whatif="${v.state === "accepted" ? "no" : "yes"}">${grades(vsr.value.pair)} ${W(v.state === "accepted" ? "question.reading.strength" : "question.reading.whatif")}</span>` : cs.state(vsr, () => "");
      const stands = currentName && v.name === currentName ? ` · <b data-standson="1">${W("question.reading.standson", { project: projectTitle || T("state.undetermined", { reason: "" }) })}</b>` : "";
      const data = { version: String(v.name), grounds: (v.grounds || []).join(",") };
      const acts = [
        v.state !== "accepted" ? cs.act("versionaccept", { label: "act.versionaccept.label.question", data }) : "",
        v.state === "suggested" || v.state === "rejected" ? cs.act("versionconsider", { label: "act.versionconsider.label.question", data }) : "",
        v.state !== "rejected" ? cs.act("versionreject", { label: "act.versionreject.label.question", data }) : "",
        v.state === "accepted" || v.state === "considering" || v.state === "rejected" ? cs.act("versionrevert", { label: "act.versionrevert.label.question", data }) : "",
        v.state === "accepted" && project && joined && v.name !== currentName ? cs.act("versioncurrent", { label: "act.versioncurrent.label.question", fills: { project: projectTitle }, data: { ...data, project } }) : "",
        !v.hidden ? cs.act("versionhide", { label: "act.versionhide.label.question", data }) : "",
      ].join("");
      return `<div class="mk-ev" data-reading="${cs.esc(v.name)}"><b class="rec">${cs.esc(String(v.name))}</b>`
        + (v.description ? `<span class="mk-small rec">${cs.esc(String(v.description))}</span>` : "")
        + `<span class="mk-small">${stateLine(v)}${stands}</span>${strength}${acts}</div>`;
    };
    /* rejected and hidden readings are counted, and shown on press; a hidden one is never deleted (basis-versions R9) */
    const seen = drawable.filter((v) => !v.hidden && v.state !== "rejected");
    const rest = drawable.filter((v) => v.hidden || v.state === "rejected");
    const rejected = rest.filter((v) => v.state === "rejected").length, hidden = rest.filter((v) => v.hidden).length;
    const more = rest.length ? `<details class="mk-details" data-readings="more"><summary>${W("question.readings.more", { rejected: String(rejected), hidden: String(hidden) })}</summary>`
      + `<div class="mk-versions">${rest.map(rowOf).join("")}</div></details>` : "";
    out.push(cs.sec("question.readings.title", (seen.length ? `<div class="mk-versions">${seen.map(rowOf).join("")}</div>` : "") + more, { help: "question.readings.help" }));
  }

  /* R26: what relies on this, each a reference; out of view said without saying what or how many */
  if (!(d.relies && d.relies.state === "empty")) {
    const relies = cs.state("relies", view, (r) => {
      const list = Array.isArray(r.backlinks) ? r.backlinks : [];
      const row = (x) => {
        const kind = x.from_type === "project" ? "project" : x.from_type === "inquiry" ? "question" : "document";
        let said;
        if (x.from_type === "project") {
          const pc = later("relies:" + x.from, "basisversions", { id, project: String(x.from) });
          const rd = pc.state === "ok" && pc.value.current ? String(pc.value.current.version || "") : "";
          said = rd ? W("question.relies.project", { reading: rd }) : W("shell.card.project");
        } else said = W("question.relies.cites", { kind: T(x.from_type === "inquiry" ? "shell.card.question" : x.from_type === "case" || x.from_type === "published" ? "shell.card.docket" : "shell.card.document") });
        return cs.row("", cs.ref(kind, String(x.from || ""), x.from_title || T("state.undetermined", { reason: "" }), [x.from_title || ""]), "", said);
      };
      return (list.length ? cs.sheet(list.map(row).join("")) : "") + (r.out_of_view === true ? `<p class="mk-note" data-outofview="1">${W("question.relies.outofview")}</p>` : "");
    });
    if (relies) out.push(cs.sec("question.relies.title", relies, { help: "question.relies.help" }));
  }

  /* Concluding (R35, R41): conclude only once the project stands on an accepted reading, carrying it; the form */
  const stands = project ? (current && vs.some((v) => v.name === currentName && v.state === "accepted")) : accepted.length > 0;
  const reading = project ? currentName : (shown && shown.state === "accepted" ? shown.name : (accepted[0] && accepted[0].name) || "");
  let concl = "";
  if (b && b.conclusion_stance === "withdrawn") concl += `<p>${W("screen.question.concluded.withdrawn")}</p>`;
  if (!concluded) {
    if (!stands) concl += `<p class="mk-note" data-owed="reading">${W("question.empty.conclude.own")}</p>`;
    else concl += `<details class="mk-details" data-conclude="form"><summary>${W("act.conclude.label.question")}</summary>`
      + cs.choice("question-conclude-reading", "question.conclude.reading", [{ value: reading, text: reading }], { value: reading })
      + (project ? "" : cs.field("question-conclude-claim", "screen.question.conclude.claim", { area: true, rec: true }))
      + cs.field("question-conclude-falsifier", "question.conclude.falsifier", { area: true, rec: true, help: "question.conclude.falsifier.help" })
      + cs.checks("question-conclude-none", "question.conclude.falsifier", [["none", "question.conclude.nofalsifier"]])
      + cs.field("question-conclude-commentary", "question.conclude.commentary", { area: true, rec: true, help: "question.conclude.commentary.help" })
      + cs.act("conclude", { label: "act.conclude.label.question", data: { inquiry: id, version: reading } })
      + `<p class="mk-small">${W("screen.question.conclude.who")}</p></details>`;
  }
  /* R27: the case's screens, where a read names the question's case (a citing case) */
  const cases = d.relies && d.relies.state === "ok" && Array.isArray(d.relies.value.backlinks)
    ? d.relies.value.backlinks.filter((x) => x && (x.from_type === "case" || x.from_type === "published")) : [];
  for (const c of cases) concl += `<p class="mk-small" data-case="${cs.esc(c.from)}">`
    + [["case-editor", "case.links.editor"], ["review-copy", "case.links.review"], ["ceremony", "case.links.ceremony"], ["docket", "case.links.docket"]]
      .map(([kind, key]) => cs.ref(kind, String(c.from), T(key), [T("shell.card." + kind)])).join(" · ") + "</p>";
  /* R36: a plan opened from this question links it by name */
  const plans = Array.isArray(ui.plans) ? ui.plans : [];
  for (const p of plans) concl += `<p class="mk-note" data-plan="${cs.esc(p.id)}">${W("question.plan.link", { plan: "" })}${cs.ref("plan", String(p.id), String(p.title || T("state.undetermined", { reason: "" })), [T("question.plan.link.tip")])}</p>`;
  out.push(cs.sec("screen.question.concluding.head", concl
    + cs.field("question-narrow-name", "screen.question.narrow.name", {})
    + cs.field("question-narrow-description", "screen.question.narrow.description", { area: true, rec: true })
    + cs.act("narrow", { label: "act.narrow.label.question", data: { inquiry: id } })
    + (concluded ? "" : "")
    + cs.field("question-check", "screen.question.check.label", { help: "screen.question.check.help" })
    + cs.field("question-check-note", "screen.question.check.note", { area: true, rec: true })
    + cs.act("checkrequest", { label: "act.checkrequest.label.question", data: { inquiry: id } })
    + (concluded ? "" : cs.field("question-plan", "screen.question.plan.label", {})
      + cs.act("planopen", { label: "act.planopen.label.question", data: { inquiry: id } }))));
  return out.join("");
}

/** R2's, R12's, R23–R25's, R31's and R41's acts, each answering `{query, body}` for the shell to send, or running its own
 *  calls and drawing its outcome, or opening another screen and sending nothing. */
const acts = [
  { op: "cite", label: "act.cite.label.question",
    /* the passage is chosen where passages are: Find in over the question's project, or Find with none */
    send(view, el, cs) {
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      if (m) cs.go("find-in", m[1]); else cs.go("finder", el.dataset.q || "");
      return null;
    } },
  { op: "narrow", label: "act.narrow.label.question", reasonField: "description",
    send(view, el, cs) {
      const name = String(cs.value("question-narrow-name") || "").trim();
      const description = String(cs.value("question-narrow-description") || "").trim();
      if (!name || !description) return { refuse: "screen.question.narrow.empty" };
      const version = String(cs.value("question-reading") || "");
      return { body: { target: String(view.subject || ""), ...(version ? { version } : {}), name, description } };
    } },
  /* R35, R41: the reading she concludes on (the project's CURRENT), what would change it (required, or none stated), and
     her commentary (not evidence); sent by a member, never the assistant */
  { op: "conclude", label: "act.conclude.label.question", reasonField: "commentary",
    send(view, el, cs) {
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      const version = String(cs.value("question-conclude-reading") || el.dataset.version || "");
      const claim = String(cs.value("question-conclude-claim") || "").trim();
      const falsifier = String(cs.value("question-conclude-falsifier") || "").trim();
      const none = (cs.value("question-conclude-none") || []).includes("none");
      const commentary = String(cs.value("question-conclude-commentary") || "").trim();
      if (!falsifier && !none) return { refuse: "question.conclude.falsifier.help" };
      const q = { target: String(view.subject || "") };
      if (m) q.project = m[1]; else if (claim) q.conclusion = claim;
      if (version) q.version = version;
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
  /* R36: the plan opened is linked by name */
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
      if (!r || !r.id) return;
      cs.set("plans", (Array.isArray(view.ui.plans) ? view.ui.plans : []).concat([{ id: String(r.id), title: String(r.title || "") }]));
    } },
  { op: "checkrequest", label: "act.checkrequest.label.question", reasonField: "note",
    send(view, el, cs) {
      const label = String(cs.value("question-check") || "").trim();
      const note = String(cs.value("question-check-note") || "").trim();
      if (!label || !note) return { refuse: "screen.question.check.empty" };
      return { body: { target: String(view.subject || ""), label, note } };
    } },
  /* R12: the leg's target selected first, then the act on the question as its citing object, with her reason */
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
  /* R23, R24: what each passage carries, as a partition: "No" a part of its own; the passages that hold each other up one
     part together; each part's statement left empty. A restructure carries her reason (the shell's, NO_REASON) */
  { op: "inquiryground", label: "act.inquiryground.label.question", rereads: ["inquiry", "strength", "basis"],
    send(view, el, cs) {
      const P = view.parts;
      const doc = P.front(view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "");
      const legs = (doc.lists.basis || []).map((l, ord) => Object.assign({ ord }, l))
        .filter((l) => l && l.target && (l.role || "supports") === "supports");
      const parent = new Map(legs.map((l) => [l.ord, l.ord]));
      const root = (x) => { while (parent.get(x) !== x) x = parent.get(x); return x; };
      for (const l of legs) {
        const said = cs.value("ask-" + l.ord) || [];
        if (!said.includes("yes")) continue;
        for (const o of cs.value("ask-which-" + l.ord) || []) {
          const n = Number(o);
          if (parent.has(n)) parent.set(root(n), root(l.ord));
        }
      }
      const groups = new Map();
      for (const l of legs) { const r = root(l.ord); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(l.ord); }
      const grounds = [...groups.values()].map((ords, i) => ({ ground: "part " + (i + 1), legs: ords }));
      return { body: { target: String(view.subject || ""), grounds } };
    } },
  /* R25: the reading acts, each with the version; Stand on with the project; accept with the affirmation of every ground */
  ...["versionaccept", "versionconsider", "versionreject", "versionrevert", "versioncurrent", "versionhide"].map((op) => ({
    op, label: "act." + op + ".label.question", rereads: ["basis", "strength", "inquiry"],
    send(view, el) {
      /* each function is served by its own text (interface-shell R21 (1)), so the op is read from the pressed control */
      const op = el.getAttribute("data-act");
      const body = { target: String(view.subject || ""), version: String(el.dataset.version || "") };
      if (op === "versioncurrent") body.project = String(el.dataset.project || "");
      if (op === "versionaccept" && el.dataset.grounds) body.affirmed = String(el.dataset.grounds).split(",").filter(Boolean);
      return { body };
    },
    /* VERSION_AFFIRMATION_INCOMPLETE by its words, naming the parts not yet affirmed */
    refusals: { VERSION_AFFIRMATION_INCOMPLETE: (r, cs) => cs.w("refusal.VERSION_AFFIRMATION_INCOMPLETE",
      { part: (Array.isArray(r && r.missing) ? r.missing : []).join(", ") }) },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { current: null })); } })),
  /* R31: the question read in her language, drawn in place; nothing saved */
  { op: "readtranslate", label: "act.readtranslate.label.question",
    send(view, el, cs) {
      const tr = view.ui.translation;
      if (tr) { cs.set("translation", Object.assign({}, tr, { shown: !tr.shown })); return null; }
      const subject = { kind: "question", id: String(view.subject || "") };
      if (el.dataset.project) subject.project = String(el.dataset.project);
      return { body: { subject } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (!r || r.ok === false || typeof r.translation !== "string") return { stay: true };
      cs.set("translation", { text: r.translation, from: String(r.from_language || ""), shown: true });
      return { stay: true };
    } },
  /* R41 state c: "Ask the assistant to look" opens a check run on this question (as the dock does, R33); a limit
     refusal draws state f */
  { op: "airunopen", label: "act.airunopen.label.question",
    send(view, el, cs) {
      const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const member = view.me && view.me.member;
      if (!member) return null;
      const res = (a) => (a && a.result !== undefined ? a.result : a);
      const run = "RUN-" + hex(16);
      const bounds = (view.parts.bounds || {}).check || [];
      cs.call("airunopen", { body: { run, contextType: "inquiry", contextId: String(view.subject || ""), mode: "check",
        principalClaude: "member:" + member, skillVersion: el.dataset.pack, bounds } }).then((o) => {
        const r = res(o) || {};
        if (!o || o.ok === false || r.ok === false || r.started === false) {
          const code = String(r.code || r.reason || "");
          if (code === "AI_LIMIT_REACHED") cs.set("limit", { whose: r.whose || "", period: r.period || "", when: r.when || "", reasons: [] });
          else cs.set("said", { html: `<p class="mk-msg" role="alert" data-refusal="airunopen">${r.translation ? cs.esc(r.translation) : cs.w("state.failed", { reason: code })}</p>` });
          return;
        }
        return cs.call("airundispatch", { body: { run } }).then(() => cs.set("seq", (view.ui.seq || 0) + 1));
      }, () => cs.set("said", { html: `<p class="mk-msg" role="alert">${cs.w("state.failed", { reason: "" })}</p>` }));
      return null;
    } },
  { op: "airunclose", label: "act.airunclose.label.question",
    send(view, el, cs) {
      const id = String(el.dataset.run || "");
      if (!id) return null;
      const end = () => cs.set("seq", (view.ui.seq || 0) + 1);
      cs.call("airunclose", { body: { run: id, bound: "cancelled" } }).then(end, end);
      return null;
    } },
];

/** The keys the question screen may draw (R44: keys only). */
const words = Object.freeze([
  "screen.question.name", "screen.question.purpose",
  ...["cite", "sever", "reinstate", "narrow", "conclude", "withdrawconclusion", "hypothesishold", "planopen", "checkrequest", "heldrestore", "search",
    "inquiryground", "versionaccept", "versionconsider", "versionreject", "versionrevert", "versioncurrent", "versionhide", "readtranslate", "airunopen", "airunclose"]
    .map((op) => "act." + op + ".label.question"),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.scale.testimony.name", "mark.scale.testimony.means", "mark.grade.reading", "mark.strength.means", "mark.hunch.means",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "mark.gap.unrated.name", "mark.gap.unrated.means",
  "mark.origin.machine.name", "mark.origin.machine.means", "ai.label.untested",
  "state.empty", "state.loading", "state.failed", "state.undetermined", "member.founder.unnamed", "screen.document.passage.where",
  ...["opened", "opened.noproject", "strength.head", "strength.two", "strength.weakest", "strength.raise", "strength.against",
    "strength.short", "strength.meets", "strength.nobar", "waits.head", "waits.setaside", "waits.item", "waits.since", "supports.head",
    "against.head", "leg.severed", "leg.severed.why", "leg.unselectable", "hunches.head", "hunch.by", "hunch.label", "hunch.kind",
    "hunch.kind.other", "hunch.kind.flow", "hunch.empty", "concluding.head", "concluded.withdrawn", "conclude.claim", "conclude.who",
    "check.label", "check.help", "check.note", "check.empty", "plan.label", "plan.empty", "cite.from", "narrow.name",
    "narrow.description", "narrow.empty"].map((k) => "screen.question." + k),
  "question.falls", "question.holds", "question.ask.first.title", "question.ask.first.says", "question.ask.title", "question.ask.help",
  "question.ask", "question.ask.no", "question.ask.yes", "question.ask.which", "question.rests.readback", "question.rests.title",
  "question.rests.any", "question.rests.all", "question.origin.shared", "question.rests.set", "question.rests.changed", "question.rests.change",
  "question.reading.shown", "question.reading.shown.help", "question.readings.title", "question.readings.help", "question.reading.accepted",
  "question.reading.weighing", "question.reading.suggested", "question.reading.strength", "question.reading.whatif", "question.reading.standson",
  "question.readings.more", "question.relies.title", "question.relies.help", "question.relies.project", "question.relies.cites",
  "question.relies.outofview", "shell.card.project", "shell.card.question", "shell.card.document", "shell.card.docket",
  "case.links.editor", "case.links.review", "case.links.ceremony", "case.links.docket",
  "shell.card.case-editor", "shell.card.review-copy", "shell.card.ceremony",
  "translate.read", "translate.label", "translate.label.help", "translate.original", "translate.back",
  "question.empty.conclude.own", "question.empty.capture", "question.empty.capture.line", "question.empty.heading", "question.empty.note",
  "question.empty.find", "question.empty.find.line", "question.empty.ask", "question.empty.ask.line", "question.adddoc",
  "question.run.heading", "question.run.leave", "question.proposal.heading", "ai.refused.limit.overall", "question.limit.note",
  "question.ai.other", "question.ai.whose", "question.concluded.heading", "question.concluded.by", "question.concluded.falsifier",
  "question.conclude.reading", "question.conclude.falsifier", "question.conclude.falsifier.help", "question.conclude.nofalsifier",
  "question.conclude.commentary", "question.conclude.commentary.help", "question.plan.link", "question.plan.link.tip",
  "refusal.VERSION_AFFIRMATION_INCOMPLETE",
]);

/** The question screen (interface-shell R21), with the module's shared readers and the dock's bounds as its parts. */
export function questionScreen(parts) {
  return Object.freeze({ id: "question", reads, place, render, acts, words, parts });
}
