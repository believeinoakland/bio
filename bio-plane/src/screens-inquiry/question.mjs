/* screens-inquiry R2, R12, R23–R27, R31, R34–R36, R38, R39, R41, R44, R45, R47, R71–R74, R78, R87–R89, R91, R101–R104, R114, R116, R117, R120, R121:
 * the question screen (Projects › <project> ›
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
    /* R54: the partition as the inquiry holds it, with the history of its changes (`inquiry` R65) */
    partition: { op: "inquirypartition", query: { id }, empty: () => false },
    relies: { op: "backlinks", query: { target: id },
              empty: (v) => !v || ((!Array.isArray(v.backlinks) || v.backlinks.length === 0) && v.out_of_view !== true) },
  };
}

/** The path's project step: the project the inquiry states, by its title once read (R39: never its id). */
function place(view) {
  const d = view.data && view.data.inquiry;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text.split(/\n---\s*\n/)[0] || "") : null;
  const home = m ? m[1] : "";
  const pid = view.project || home;
  if (!pid) return {};
  const t = view.ui && view.ui.later && view.ui.later["project:" + pid];
  const ft = t && t.state === "ok" && t.value && typeof t.value["bundle.md"] === "string"
    ? /^title:\s*(.*)$/m.exec(t.value["bundle.md"]) : null;
  let title = ft ? ft[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* raw */ }
  return { project: { id: pid, title } };
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
  /* R91: a question opened from a project acts for that project (the address's second part); the bare address, for its home project */
  const home = doc && /^PROJ-/.test(String(doc.project || "")) ? String(doc.project) : "";
  const project = view.project || home;
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
    /* K3402: who opened it, the author of its first promotion as the record keeps it (the image's `_history`), by
       handle (the founder unnamed by key, R40); undetermined when the record names none */
    /* R46: the founder's handle, from the participants this screen reads (project-roster R29); none while they name none */
    const parts = project ? later("participants", "projectparticipants", { projectId: project }) : null;
    const founder = parts && parts.state === "ok" && Array.isArray(parts.value.participants) ? parts.value.participants.find((x) => x && x.founder === true) : null;
    const founderHandle = founder && founder.handle ? String(founder.handle) : null;
    const opener = (() => {
      const img = d.inquiry.value || {};
      const first = Object.keys(img).filter((k) => /^_history\/promotion_.*\.json$/.test(k)).map((k) => {
        try { return JSON.parse(String(img[k])); } catch { return null; }
      }).filter((h) => h && h.author).sort((a, b) => String(a.created || "").localeCompare(String(b.created || "")))[0];
      return first ? P.who(cs, first.author, founderHandle) : "";
    })();
    const name = opener || T("state.undetermined", { reason: "" });
    if (project) out.push(`<p class="mk-sub">${W("screen.question.opened", { name, date: { html: date }, project: "" })}${cs.ref("project", project, projectTitle || T("state.undetermined", { reason: "" }), [])}</p>`);
    else out.push(`<p class="mk-sub">${W("screen.question.opened.noproject", { name, date: { html: date } })}</p>`);
  }

  const stepsAt = out.length;
  out.push("");

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
    const named = l.target_title || l.title || (r && r.target_title);
    if (named) return String(named);
    /* K3402 (R39): a cited document is named by its own title, read from the record, never its id */
    const im = later("doc:" + l.target, "image", { id: String(l.target) });
    const m = im.state === "ok" && im.value && typeof im.value["bundle.md"] === "string" ? /^title:\s*(.*)$/m.exec(im.value["bundle.md"].split(/\n---\s*\n/)[0] || "") : null;
    let t = m ? m[1].trim() : "";
    try { if (t.startsWith("\"")) t = JSON.parse(t); } catch { /* raw */ }
    return t || T("state.undetermined", { reason: "" });
  };
  const legGrade = (l) => {
    const r = shown && Array.isArray(shown.legs) ? shown.legs.find((x) => String(x.target_id || x.target) === String(l.target)) : null;
    return (r && r.grade) || l.grade || "";
  };
  /* R78: a page the record states counts from zero (a leg's `extent_page`, or its reading's `extent: {page}`) and is drawn from one;
     a leg whose extent states no page draws none */
  const pageOf = (l) => {
    const r = shown && Array.isArray(shown.legs) ? shown.legs.find((x) => String(x.target_id || x.target) === String(l.target)) : null;
    for (const x of [l, r]) {
      if (!x) continue;
      const p = x.extent_page !== undefined && x.extent_page !== null && x.extent_page !== "" ? Number(x.extent_page)
        : x.extent && typeof x.extent === "object" && x.extent.page !== undefined && x.extent.page !== null ? Number(x.extent.page) : NaN;
      if (Number.isInteger(p) && p >= 0) return p + 1;
    }
    return null;
  };
  const legName = (l) => legTitle(l) + (pageOf(l) !== null ? " · " + T("screen.document.passage.where", { page: String(pageOf(l)) }) : "");

  /* R51: the three steps under the title, each done, current or still to do from the question's state */
  function stepsHtml(st) {
    return `<ol class="mk-next" data-steps="1">` + ["source", "mark", "conclude"].map((k, i) => `<li data-step="${k}" data-state="${st[i]}"${st[i] === "current" ? ' aria-current="step"' : ""}>${W("question.steps." + k)}</li>`).join("") + "</ol>";
  }
  /* R59: accepting a reading of several separately sufficient parts opens "Before you accept", one tick per part */
  function acceptPart(v, tone, tag) {
    const parts = Array.isArray(v.parts) ? v.parts.map(String) : [];
    const name = String(v.name), ix = String(vs.findIndex((x) => x && x.name === v.name)) + (tag || "");
    if (parts.length < 2) return cs.act("versionaccept", { label: "act.versionaccept.label.question", data: { version: name, idx: ix }, tone });
    return `<fieldset class="cs-field" id="affirm-${ix}" data-affirm="${cs.esc(name)}"><legend>${W("reading.affirm.head")}</legend><p class="mk-small">${W("reading.affirm.says", { n: String(parts.length) })}</p>`
      + parts.map((pt, i) => `<label><input type="checkbox" name="affirm-${ix}" id="affirm-${ix}-${i}" value="${cs.esc(pt)}"> ${W("reading.affirm.part", { part: pt })}</label>`).join("") + "</fieldset>"
      + cs.act("versionaccept", { label: "reading.affirm.accept", data: { version: name, idx: ix }, tone });
  }
  /* R64: "Reject this reading, with a reason" is a fold holding the required reason and the act that sends it */
  function declineFold(v, tag) {
    const name = String(v.name), ix = String(vs.findIndex((x) => x && x.name === v.name)) + (tag || "");
    return `<details class="mk-details" data-reject="${cs.esc(name)}"><summary>${W("screen.question.reject.summary")}</summary>`
      + cs.field("question-reject-" + ix, "screen.question.reject.reason", { area: true, rec: true, help: "screen.question.reject.reason.help" })
      + cs.act("versionreject", { label: "screen.question.reject.go", data: { version: name, idx: ix } }) + "</details>";
  }
  /* R71: she is a participant of the project the question is in (R60: only she may set it aside for it) */
  const partsRead = project ? later("participants", "projectparticipants", { projectId: project }) : null;
  const joined = !!(partsRead && partsRead.state === "ok" && partsRead.value && Array.isArray(partsRead.value.participants)
    && partsRead.value.participants.some((x) => x && x.handle === (view.me && view.me.handle) && x.state === "joined"));
  /* R71: the project's own decision on this question, read from the set-aside list (`queueFeed` with `aside: true`, `queue`
     R61), paged by `after` until found or the last page */
  let decision = null, asideRead = null;
  if (joined) {
    let after = "";
    for (let pg = 0; pg < 100; pg++) {
      asideRead = later("aside:" + pg, "queue", { aside: "true", limit: "500", ...(after ? { after } : {}) }, String(ui.asideSeq || 0));
      if (asideRead.state !== "ok" || !asideRead.value || !Array.isArray(asideRead.value.aside)) break;
      decision = asideRead.value.aside.find((x) => x && x.scope === "project" && String(x.project) === project && String(x.finding) === id) || null;
      if (decision || !(asideRead.value.truncated && asideRead.value.next)) break;
      after = String(asideRead.value.next);
    }
  }
  const projectWord = projectTitle || T("state.undetermined", { reason: "" });
  /* R71: the choice (nothing preselected), her reason (no writing help) and the act, in the fold and in "Change your decision" alike */
  const asideForm = (which, before) => cs.checks("question-aside" + (which === "2" ? "2" : ""), which === "2" ? "screen.question.say003" : "screen.question.say063",
      [["deferred", "screen.question.say004"], ["dismissed", "screen.question.say005"]], { radio: true })
    + cs.field("question-aside" + (which === "2" ? "2" : "") + "-why", "shell.reason", { area: true, help: which === "2" ? "screen.question.say006" : "screen.question.say064" })
    + (before || "") + cs.act("proposedispose", { label: "act.proposedispose.label.question", data: { which }, tone: "primary" });
  /* R71: what this touches, read before she confirms, from what the screen already reads and only what she may see */
  const touches = () => {
    const backs = d.relies && d.relies.state === "ok" && d.relies.value && Array.isArray(d.relies.value.backlinks) ? d.relies.value.backlinks : [];
    const pl = later("qplans", "plans", { subject: id }, String(ui.plans ? ui.plans.length : 0));
    const planList = (pl.state === "ok" && pl.value && Array.isArray(pl.value.plans) ? pl.value.plans : []).concat(Array.isArray(ui.plans) ? ui.plans : []);
    const seenPlans = new Set();
    const rows = [];
    if (currentName) rows.push(cs.row("", W("screen.question.say065", { project: projectWord }), "", W("screen.question.say066")));
    for (const pn of planList) {
      const pid = String((pn && (pn.id || pn.plan)) || "");
      if (!pid || seenPlans.has(pid)) continue;
      seenPlans.add(pid);
      rows.push(cs.row("", W("screen.question.say067", { plan: String(pn.title || T("state.undetermined", { reason: "" })) }), "", W("screen.question.say068")));
    }
    if (backs.some((x) => x && x.from_type === "inquiry")) rows.push(cs.row("", W("screen.question.say069"), "", W("screen.question.say070")));
    for (const x of backs.filter((y) => y && (y.from_type === "published" || (y.from_type === "case" && y.from_state === "published"))))
      rows.push(cs.row("", W("screen.question.say071", { title: String(x.from_title || T("state.undetermined", { reason: "" })) }), "", W("screen.question.say072")));
    return rows.length ? `<div data-touches="1"><p class="mk-small"><b data-touches-heading="1">${W("screen.question.touches.heading")}</b></p><p class="mk-small"><b>${W("screen.question.tip078")}</b> ${W("screen.question.tip079")}</p>${cs.sheet(rows.join(""))}</div>` : "";
  };
  /* R71: the fold in state a; the refusals the design holds are told before the act */
  const asideFold = () => `<details class="mk-details" data-aside="set"><summary>${W("screen.question.say058", { project: projectWord })}</summary>`
    + `<p class="mk-note">${W("screen.question.say059", { project: projectWord })} ${W("screen.question.say060")} ${W("screen.question.say061")} ${W("screen.question.say062")}</p>`
    + asideForm("1", touches() + `<details class="mk-details" data-aside="cannot"><summary>${W("screen.question.say073")}</summary>`
      + `<p class="cs-gap" data-gap="refused">${W("screen.question.say074", { project: projectWord })}</p><p class="cs-gap" data-gap="refused">${W("screen.question.say075")}</p></details>`) + "</details>";
  /* R71 states k and l: the receipt, and "Change your decision" (the same choice and a reason that replaces the earlier one) */
  const receipt = (() => {
    if (!decision) return "";
    const by = String(decision.decided_by || "").replace(/^member:/, "");
    const mine = by !== "" && (by === String(view.me && view.me.member) || by === String(view.me && view.me.handle));
    const key = decision.state === "dismissed" ? "screen.question.say008" : "screen.question.say000";
    const said = mine ? W(key, { project: projectWord, date: { html: decision.at ? cs.date(String(decision.at), { year: true }) : "" } })
      : W(key + ".bymember", { project: projectWord, member: P.who(cs, by), date: { html: decision.at ? cs.date(String(decision.at), { year: true }) : "" } });
    return `<div data-aside="${decision.state === "dismissed" ? "dismissed" : "deferred"}">`
      + cs.sheet(cs.row("", `<b>${said}</b>`, "", `<b>${W("shell.reason.lead")}</b> <span class="rec">“${cs.esc(String(decision.reason || ""))}”</span>`))
      + `<p class="mk-note">${mine ? W("screen.question.say001", { project: projectWord }) + " " : ""}${W("screen.question.say002")}</p>`
      + `<details class="mk-details" data-aside="change"><summary>${W("screen.question.decision.change")}</summary>${asideForm("2")}</details></div>`;
  })();
  const around = [];
  /* R41 state g: concluded; c: nothing cited; d: a run of hers at work; e: the assistant's proposal; f: its limit */
  /* the conclusion is answered only to a read that names the project (`basis-versions` R12, R16): `cur` when there is one */
  const b = cur && cur.state === "ok" && cur.value ? cur.value : (d.basis && d.basis.state === "ok" ? d.basis.value : null);
  const concluded = !!(b && b.conclusion && b.conclusion_stance !== "withdrawn");
  const member = view.me && view.me.member;
  const runs = view.reachable && member ? later("runs", "airuns", { contextType: "inquiry", contextId: id, limit: "50" }, String(ui.seq || 0)) : null;
  /* R45: the answer stands while the runs are read again (a read in flight is not the run's state) */
  if (runs && runs.state === "ok" && Array.isArray(runs.value.runs)) ui.lastRuns = runs.value.runs;
  const runList = runs && runs.state === "ok" && Array.isArray(runs.value.runs) ? runs.value.runs
    : runs && runs.state === "loading" && Array.isArray(ui.lastRuns) ? ui.lastRuns : [];
  const isMine = (s) => !!(s && member && s.principal && typeof s.principal.plane === "string"
    && (s.principal.plane === "member:" + member || s.principal.plane.startsWith("member:" + member + "/")));
  /* a run of hers at work on it (R47): any running run of hers `airuns` shows, whether this page started it, the dock did,
     or it is found on a fresh load; except a run this page saw opened and then withheld, never drawn at work (R33's rule;
     D29) */
  const myRun = runList.find((s) => s && s.status === "running" && isMine(s) && ui.withheld !== s.id) || null;
  /* R45: from her press until the plane has answered, and until that run is read ended, the run is at work */
  const asked = ui.asking ? runList.find((s) => s && s.id === ui.asking) : null;
  const asking = !!ui.asking && !(asked && asked.status !== "running");
  /* her latest run on it (newest first), and R45's ending: drawn when it has ended and nothing else is drawn from it */
  const lastMine = runList.find(isMine) || null;
  const ending = (c) => (c && typeof c === "object" ? String(c.bound || c.kind || "") : String(c || ""));
  /* R57, R58: the run's session (its cost, to the paying account's owners only) and its log (its steps, as they arrive) */
  const watched = myRun || lastMine;
  const sess = watched && watched.id ? later("sess", "airun", { run: String(watched.id) }, String(myRun ? ui.seq || 0 : "")) : null;
  const session = sess && sess.state === "ok" && sess.value && sess.value.session ? sess.value.session : null;
  const log = watched && watched.id && (myRun || asking || lastMine) ? later("log", "airunlog", { run: String(watched.id), limit: "200" }, String(myRun ? ui.seq || 0 : "")) : null;
  const logEntries = log && log.state === "ok" && log.value && Array.isArray(log.value.entries) ? log.value.entries : [];
  const prog = P.progress(cs, logEntries, { title: (record) => { const t = later("doc:" + record, "image", { id: record });
    const m = t.state === "ok" && t.value && typeof t.value["bundle.md"] === "string" ? /^title:\s*(.*)$/m.exec(t.value["bundle.md"].split(/\n---\s*\n/)[0] || "") : null;
    let title = m ? m[1].trim() : ""; try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* raw */ } return title; } });
  const endedPart = (withAsk) => lastMine && lastMine.status !== "running" && !myRun && !asking
    ? `<div data-run="ended"><p class="mk-note">${W("screen.assistant.run.ended", { why: { html: P.ending(cs, ending(lastMine.condition) || String(lastMine.status || ""), proposals.length > 0) } })}</p>`
      + (ending(lastMine.condition) === "cancelled" || lastMine.status === "cancelled" ? `<p class="mk-small" data-run="stopped">${W("screen.question.stopped.kept")}</p>` : "")
      + P.costLine(cs, session, true) + (withAsk ? askAct : "") + "</div>" : "";
  const pack = view.reachable ? later("pack", "agentpack", {}) : null;
  const packName = pack && pack.state === "ok" && pack.value && ((pack.value.pack && (pack.value.pack.version || pack.value.pack.skillVersion)) || pack.value.version);
  const askAct = view.reachable && packName && member
    ? cs.act("airunopen", { label: "act.airunopen.label.question", data: { pack: String(packName) } }) : "";

  const proposals = view.reachable ? vs.filter((v) => machine(v) && v.state === "suggested" && !v.hidden) : [];
  if (!citedLegs.length && !myRun && !asking && !concluded) {
    /* state c: new and empty, the three ways in (R38: "Capture a document for it" opens `capture` with this question) */
    const rows = [cs.row("", `<b>${W("question.empty.capture")}</b><br><span class="mk-sub">${W("question.empty.capture.line")}</span>`,
        `<a class="cs-btn" data-tone="primary" href="/app/capture/address/${cs.esc(id)}" data-nav data-adddoc="question">${W("question.adddoc")}</a>`),
      cs.row("", `<b>${W("question.empty.find")}</b><br><span class="mk-sub">${W("question.empty.find.line")}</span>`,
        cs.act("search", { label: "act.search.label.question", data: { q: heading } }))];
    if (askAct) rows.push(cs.row("", `<b>${W("question.empty.ask")}</b><br><span class="mk-sub">${W("question.empty.ask.line")}</span>`, askAct));
    /* R45: a run of hers that ended with no proposal is said, above the three ways in (which offer the ask again) */
    out.push(cs.sec("question.empty.heading", endedPart(false) + `<p class="mk-note">${W("question.empty.note")}</p>` + cs.sheet(rows.join("")), { id: "state-c" }));
    /* R50, R51: nothing to conclude on before the first citation, said beneath the three ways; no "Concluding" section */
    out.push(`<p class="mk-note" data-owed="reading">${W("question.empty.conclude.own")}</p>`);
    out[stepsAt] = stepsHtml(["current", "todo", "todo"]) + receipt;
    if (ui.said) out.push(ui.said.html);
    out.push(limitPart());
    return out.join("");
  }
  /* state d: a run of hers at work on it, from her press (R45): its ticks once it is read, read again every 10 seconds on
     the page clock (as the dock does, R8), Stop the run once the plane has answered */
  if (myRun || asking) {
    out.push(cs.sec("question.run.heading", `<div class="cs-machinework" data-origin="machine">${cs.mark("origin", "machine")}</div>`
      + (myRun ? `<p data-run="running">${W("screen.assistant.run.running", { ticks: String(myRun.ticks || 1) })}</p>` : "")
      + (myRun ? P.costLine(cs, session, false) : "")
      + prog.html
      + `<p class="mk-note">${W("question.run.leave")}</p>`
      + (myRun ? cs.act("airunclose", { label: "act.airunclose.label.question", data: { run: String(myRun.id || "") } })
        : `<button class="cs-btn" data-tone="quiet" disabled data-pending="airunclose">${W("act.airunclose.label.question")}</button>`), { id: "state-d" }));
    if (myRun && runs && runs.state === "ok" && !ui.polling) {
      ui.polling = true;
      cs.later(10000, (k, v) => { v.ui.polling = false; k.set("seq", (v.ui.seq || 0) + 1); });
    }
  } else if (!concluded) out.push(endedPart(true)); /* R47: above the proposals, whether or not any wait */
  /* state e: a reading the assistant proposed, not yet weighed, only while the assistant is reachable */
  const checkFailed = !myRun && !asking && lastMine && prog.none;
  if (checkFailed) out.push(`<p class="mk-note" data-check="failed">${W("ai.progress.check.failed")}</p>`);
  for (const v of (myRun || asking || checkFailed ? [] : proposals)) {
    const rests = (Array.isArray(v.legs) ? v.legs : []).map((l) => String(l.target_title || l.target_id || "")).filter(Boolean);
    out.push(cs.sec("question.proposal.heading", `<div class="cs-machinework" data-origin="machine">${cs.mark("origin", "machine")}`
      + (v.untested || (b && b.untested) ? `<span class="cs-draftlabel" data-label="untested">${W("ai.label.untested")}</span>` : "")
      + `<p class="rec">${cs.esc(String(v.claim && v.claim.text ? v.claim.text : v.description || v.name))}</p>`
      + (rests.length ? `<p class="mk-small rec">${cs.esc(rests.join(" · "))}</p>` : "") + "</div>"
      + `<p class="mk-small" data-checked="all" data-tip="${cs.esc(W("ai.progress.checked.all.means"))}">${W("ai.progress.checked.all")}</p>`
      + acceptPart(v, "primary") + declineFold(v), { id: "state-e" }));
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

  /* state g: concluded (who, when, the reading's words, what would change it, its strength), and its three acts (R62): prepare a
     case from it, plan what to do, withdraw the conclusion */
  if (concluded) {
    const c = b.conclusion;
    const claim = typeof c === "string" ? c : (c.text || (c.claim && c.claim.text) || (typeof c.claim === "string" ? c.claim : "") || "");
    const by = P.who(cs, c.by || c.author || "");
    const at = c.at ? cs.date(String(c.at), { year: true }) : "";
    const fal = c.falsifier && typeof c.falsifier === "object" ? c.falsifier.text : c.falsifier;
    /* R50: a conclusion on a member's own reading says who wrote it, never marked machine work */
    const cv = vs.find((v) => v && v.name === String(c.version || c.reading || ""));
    const wrote = cv && !machine(cv) && cv.author ? `<br><span class="mk-sub" data-reading="member">${W("question.reading.by.member", { member: P.who(cs, cv.author) })}</span>` : "";
    out.push(cs.sec("question.concluded.heading", cs.sheet(cs.row("", `<b>${W("question.concluded.by", { who: by, date: { html: at } })}</b> <span class="rec">“${cs.esc(claim)}”</span>`
        + wrote + (fal ? `<br><span class="mk-sub">${W("question.concluded.falsifier", { falsifier: String(fal) })}</span>` : "")
        + (d.strength && d.strength.state === "ok" ? `<br>${grades(d.strength.value)}` : "")))
      + (project ? cs.act("casedraft", { label: "act.casedraft.label.question", data: { project }, tone: "primary" }) : "")
      + cs.field("question-plan", "screen.question.plan.label", {}) + cs.act("planopen", { label: "act.planopen.label.question", data: { inquiry: id } })
      + cs.act("withdrawconclusion", { label: "act.withdrawconclusion.label.question", data: { inquiry: id } }), { id: "state-g" }));
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
      /* the passage by its own words where the inquiry or the reading shown holds them (K3402) */
      ((() => { const r = shown && Array.isArray(shown.legs) ? shown.legs.find((x) => String(x.target_id || x.target) === target) : null;
        const words = l.words || (r && r.words); return words ? `<span class="rec">“${cs.esc(words)}”</span>` : ""; })())
      + `<span class="mk-small">${cs.ref("document", target, legTitle(l), [legTitle(l)])}${pageOf(l) !== null ? " · " + W("screen.document.passage.where", { page: String(pageOf(l)) }) : ""}`
      + (severed ? ` · <span data-leg="severed">${why ? W("screen.question.leg.severed.why", { why }) : W("screen.question.leg.severed")}</span>` : "") + "</span>" + line,
      isLive ? cs.act("sever", { label: "act.sever.label.question", data: { target } })
        : severed ? cs.act("reinstate", { label: "act.reinstate.label.question", data: { target } }) : "");
  };
  const chooser = vs.length ? cs.choice("question-reading", "question.reading.shown",
    vs.filter((v) => !v.hidden && v.state !== "rejected").map((v) => ({ value: String(v.name), text: String(v.name) })),
    /* the chooser drives only once the project's reading is known, so its default (the reading the project stands on) is not kept from a pending read */
    cur && cur.state === "loading" ? { value: shownName } : { value: shownName, acts: {} }) + `<p class="mk-small">${W("question.reading.shown.help")}</p>` : "";
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
    /* R54: who set it and every later change come from `inquirypartition` (`inquiry` R65); a `strength_after` of null is said as
       not recorded, never computed */
    const pc = d.partition && d.partition.state === "ok" && d.partition.value && d.partition.value.ok !== false ? d.partition.value : null;
    const set = pc && Array.isArray(pc.groups) && pc.groups[0] ? pc.groups[0] : grounds[0] || {};
    const pair = (x) => (x && typeof x === "object" ? strengthText(x).replace(/\?/g, "").replace(/\//g, "/") : "");
    const changes = pc && Array.isArray(pc.changes) ? pc.changes.filter((e) => e && e.act === "restructured")
      : doc.log.filter((e) => e.act === "Restructured");
    const now = pc && pc.strength_now ? pair(pc.strength_now) : d.strength && d.strength.state === "ok" ? strengthText(d.strength.value) : "";
    const strengthOf = (x) => (typeof x === "string" ? x : x && typeof x === "object" ? pair(x) : { html: cs.mark("gap", "undetermined", { reason: "" }) });
    restsBack = cs.sec("question.rests.title",
      (singles.length ? `<p><b>${W("question.rests.any")}</b></p>` + singles.map((p) => `<p class="mk-small">· ${cs.esc(legName(p.legs[0]))}</p>`).join("") : "")
      + many.map((p) => `<p class="mk-small">${W("question.rests.all", { passages: p.legs.map(legName).join(", ") })}</p>`).join("")
      + shared + (iv && iv.complete === false ? `<p class="mk-small" data-complete="false">${cs.mark("gap", "undetermined", { reason: "" })}</p>` : "")
      + (d.partition && d.partition.state === "failed" ? cs.state(d.partition, () => "") : "")
      + (set.asserted_by || set.at ? `<p class="mk-small">${W("question.rests.set", { who: P.who(cs, set.asserted_by || ""), date: { html: set.at ? cs.date(String(set.at), { year: true }) : "" } })}</p>` : "")
      + changes.map((e, i) => `<p class="mk-small" data-change="${i}">${pc ? W("question.rests.changed", { who: P.who(cs, e.by || ""), date: { html: cs.date(e.at, { year: true }) }, reason: String(e.reason || ""),
          before: strengthOf(e.strength_before), after: e.strength_after === null || e.strength_after === undefined ? strengthOf(null) : strengthOf(e.strength_after) })
        : W("question.rests.changed", { who: P.who(cs, e.who), date: { html: cs.date(e.at, { year: true }) },
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
        v.state !== "accepted" ? acceptPart(v, "") : "",
        v.state === "suggested" || v.state === "rejected" ? cs.act("versionconsider", { label: "act.versionconsider.label.question", data }) : "",
        v.state !== "rejected" ? declineFold(v) : "",
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
    /* R74: on a reading the assistant composed that is not yet accepted, the bias it was composed under, before the member accepts
       it: what the lens block of its own run (`airun`'s `session.bias`) answers. It shows whether it moved, never counts. */
    const biasFold = (v) => {
      const rr = v.run ? later("run:" + v.run, "airun", { run: String(v.run) }) : null;
      const session = rr && rr.state === "ok" && rr.value && rr.value.session ? rr.value.session : null;
      const bias = session && session.bias && typeof session.bias === "object" ? session.bias : null;
      const gap = (kind, inner) => `<p class="cs-gap" data-gap="${kind === "moved" ? "refused" : "undetermined"}" data-bias="${kind}">${inner}</p>`;
      let lens;
      if (rr && rr.state === "loading") lens = cs.state(rr, () => "");
      else if (rr && rr.state === "failed") lens = cs.state(rr, () => "");
      else if (!bias) lens = gap("undetermined", T("state.undetermined", { reason: "" }));
      else if (bias.moved === true) lens = gap("moved", `<b>${W("screen.question.bias.moved")}</b> ${W("screen.question.say013")}`);
      else if (bias.in_force === false) lens = gap("noneinforce", W("screen.question.say021"));
      else if (bias.moved === false) lens = gap("notmoved", W("screen.question.say017") + " " + W("screen.question.say018"));
      else lens = gap("unknown", W("screen.question.say019") + " " + W("screen.question.say020"));
      const forWhom = session && session.principal && typeof session.principal.plane === "string"
        ? session.principal.plane.replace(/^member:/, "").split("/")[0] : "";
      const at = v.at || (session && session.created) || "";
      const data = { version: String(v.name), grounds: (v.grounds || []).join(",") };
      return `<details class="mk-details" data-bias-fold="${cs.esc(String(v.name))}"><summary>${W("screen.question.say009")}</summary>`
        + `<p class="mk-note">${W("screen.question.say010")} ${W("screen.question.say011")}</p>`
        + `<div class="mk-ev"><b class="rec">${cs.esc(String(v.name))}</b>`
        + (forWhom ? `<span class="mk-small">${cs.mark("origin", "machine")} ${W("screen.question.say012", { member: P.who(cs, forWhom), date: { html: at ? cs.date(String(at), { year: true }) : "" } })}</span>` : "")
        + lens + `<span class="mk-small muted">${W("screen.question.say014")} ${W("screen.question.say015")}</span>`
        + acceptPart(v, "", "b") + (v.state === "suggested" ? cs.act("versionconsider", { label: "act.versionconsider.label.question", data }) : "") + declineFold(v, "b")
        + "</div></details>";
    };
    /* R73: compare the reading shown with another (`versioncompare`, a read: nothing is written), and where each came from */
    const compareFold = () => {
      const names = new Map(drawable.map((v) => [String(v.name), v]));
      const others = drawable.filter((v) => String(v.name) !== shownName);
      const pick = ui["choice:question-compare"];
      const against = names.has(pick) && pick !== shownName ? String(pick) : "";
      const mkData = (t) => ({ html: `<span class="rec">${cs.esc(String(t))}</span>` });
      const titleOf = (x) => legTitle({ target: String(x && typeof x === "object" ? x.target : x) });
      const refs = (list) => (Array.isArray(list) ? list : []).map((x) => cs.ref("document", String(x && typeof x === "object" ? x.target : x), titleOf(x), [])).join(", ");
      let answer = "";
      if (against) {
        const cr = later("cmp", "versioncompare", { target: id, a: against, b: shownName, ...(project ? { project } : {}) });
        if (cr.state === "loading" || cr.state === "empty") answer = cs.state(cr, () => "");
        else if (cr.state === "failed") {
          const code = cr.refusal && cr.refusal.code;
          const known = ["VERSION_COMPARE_NO_SUCH_VERSION", "VERSION_COMPARE_NO_VERSION", "VERSION_COMPARE_NO_INQUIRY"];
          const miss = cr.refusal && cr.refusal.fields && Array.isArray(cr.refusal.fields.missing) ? String(cr.refusal.fields.missing[0] || "") : against;
          const said = code === "VERSION_COMPARE_NO_SUCH_VERSION" ? W("refusal.VERSION_COMPARE_NO_SUCH_VERSION", { version: miss })
            : code === "VERSION_COMPARE_NO_VERSION" ? W("refusal.VERSION_COMPARE_NO_VERSION") : code === "VERSION_COMPARE_NO_INQUIRY" ? W("refusal.VERSION_COMPARE_NO_INQUIRY") : "";
          answer = known.includes(code) ? `<p class="cs-gap" data-gap="refused" role="alert" data-compare="refused">${said}</p>` : cs.state(cr, () => "");
        } else if (cr.value && cr.value.dimensions && typeof cr.value.dimensions === "object") {
          const r = cr.value, dm = r.dimensions, lg = r.legs || {};
          const leg = (k, labelKey) => `<div class="cs-row" data-legs="${k}">${cs.icon(k === "taken_up" ? "add" : k === "let_go" ? "sever" : "connection")}<span><b>${W(labelKey)}</b> ${Array.isArray(lg[k]) && lg[k].length ? refs(lg[k]) : W("screen.question.compare.none")}</span></div>`;
          const vals = (a, b) => `<span class="mk-small" data-side="was">${W("screen.question.compare.was", { value: { html: a } })}</span> <span class="mk-small" data-side="now">${W("screen.question.compare.now", { value: { html: b } })}</span>`;
          const claimText = (x) => (x && typeof x === "object" ? String(x.text || "") : String(x == null ? "" : x));
          const stateSide = (x, now) => {
            const m = x && x.moved && typeof x.moved === "object" ? x.moved : {};
            const date = { html: m.at ? cs.date(String(m.at), { year: true }) : "" };
            if (x && x.state === "accepted") return W(now && x.current ? "screen.question.say034" : "screen.question.say033", { member: P.who(cs, m.by || ""), date, project: projectWord });
            const k = x && x.state === "considering" ? "question.reading.weighing" : "question.reading.suggested";
            return W(k, { who: P.who(cs, m.by || ""), date, reason: String(m.reason || "") });
          };
          const row = (kind, labelKey, inner) => `<div class="cs-row" data-dim="${kind}" data-same="${dm[kind] && dm[kind].same === true ? "yes" : "no"}"><span><b>${W(labelKey)}</b> · ${dm[kind] && dm[kind].same === true ? W("screen.question.word.same") : W("screen.question.word.different")} ${inner}</span></div>`;
          const dimRow = (kind, labelKey, show) => {
            const x = dm[kind];
            if (!x) return "";
            return row(kind, labelKey, x.same === true ? (kind === "origin" && x.a && !machine({ author: x.a.author, run: x.a.run }) ? `<span class="mk-small">${W("screen.question.say035")}</span>` : "")
              : kind === "decision" ? `<span class="mk-small" data-side="was">${stateSide(x.a, false)}</span> <span class="mk-small" data-side="now">${stateSide(x.b, true)}</span>` : vals(show(x.a), show(x.b)));
          };
          const partsOf = (x) => (x && Array.isArray(x.partition) ? x.partition.map((g) => (Array.isArray(g) && Array.isArray(g[1]) ? g[1].map(titleOf).join(", ") : "")).filter(Boolean).join("; ") : "");
          answer = `<p class="mk-small" data-compare="sentence">${W("screen.question.say026", { against: mkData(against), shown: mkData(shownName), n: String(r.differs), total: String(r.of) })}</p>`
            + cs.sheet(leg("taken_up", "screen.question.compare.takenup") + leg("let_go", "screen.question.compare.letgo") + leg("kept", "screen.question.compare.kept"))
            + cs.sheet(dimRow("claim", "screen.question.say027", (x) => `<span class="rec">${cs.esc(claimText(x))}</span>`)
              + dimRow("legs", "screen.question.say028", (x) => `<span class="rec">${(Array.isArray(x) ? x : []).map((y) => cs.esc(titleOf(y))).join(", ")}</span>`)
              + dimRow("relationship", "screen.question.say029", (x) => `<span class="rec">${cs.esc(String((x && x.relationship) || ""))} ${cs.esc(partsOf(x))}</span>`)
              + dimRow("decision", "screen.question.say032", () => "")
              + dimRow("origin", "screen.question.compare.origin", (x) => `<span class="rec">${cs.esc(P.who(cs, (x && x.author) || ""))}</span>`));
        }
      }
      /* the tree: each reading's source (`derived_from`) and origin, the roots first, each child indented under its source */
      const kids = (n) => drawable.filter((c) => c.derived_from && String(c.derived_from) === String(n));
      const roots = drawable.filter((v) => !v.derived_from || !names.has(String(v.derived_from)));
      const targetsOf = (v) => new Set((Array.isArray(v.legs) ? v.legs : []).map((x) => String(x.target_id || x.target || "")));
      const treeRow = (v, depth, seenNames) => {
        const parent = v.derived_from ? names.get(String(v.derived_from)) : null;
        const mine = machine(v);
        let origin;
        if (!parent) origin = mine ? "" : W("screen.question.say037", { member: P.who(cs, v.author || "") });
        else if (mine) origin = W("screen.question.say040");
        else {
          const pt = targetsOf(parent), ct = targetsOf(v);
          const taken = ct.size < pt.size && [...ct].every((t) => pt.has(t));
          origin = W(taken ? "screen.question.say041" : "screen.question.say038", { member: P.who(cs, v.author || "") });
        }
        const orphan = v.derived_from && !parent ? ` <span class="rec" data-from="${cs.esc(String(v.derived_from))}">${cs.esc(String(v.derived_from))}</span>` : "";
        const line = `<span class="mk-small" data-tree="${cs.esc(String(v.name))}" data-depth="${depth}" style="margin-left:${18 * depth}px">`
          + `<span class="rec">${cs.esc(String(v.name))}</span>${mine ? " " + cs.mark("origin", "machine") : ""}${origin ? " · " + origin : ""}${orphan}`
          + (String(v.name) === shownName ? ` · <b>${W("screen.question.say039")}</b>` : "") + (v.hidden ? ` · ${W("screen.question.say042")}` : "") + "</span>";
        return line + (seenNames.has(String(v.name)) ? "" : kids(v.name).map((c) => treeRow(c, depth + 1, new Set([...seenNames, String(v.name)]))).join(""));
      };
      return `<details class="mk-details" data-compare-fold="1"><summary>${W("screen.question.say022")}</summary>`
        + cs.choice("question-compare", "screen.question.say023", [{ value: "", text: "" }].concat(others.map((v) => ({ value: String(v.name), text: String(v.name) }))), { acts: {}, value: "" })
        + `<p class="mk-small">${W("screen.question.say024")} ${W("screen.question.say025")}</p>` + answer
        + `<div data-tree-box="1"><b>${W("screen.question.say036")}</b><div class="mk-small" style="display:grid;gap:4px">${roots.map((v) => treeRow(v, 0, new Set())).join("")}</div>`
        + `<p class="mk-small muted">${W("screen.question.say043")} ${W("screen.question.say044")}</p></div></details>`;
    };
    const biasFolds = drawable.filter((v) => machine(v) && !v.hidden && (v.state === "suggested" || v.state === "considering")).map(biasFold).join("");
    out.push(cs.sec("question.readings.title", (seen.length ? `<div class="mk-versions">${seen.map(rowOf).join("")}</div>` : "") + biasFolds
      + (drawable.length >= 2 && shown ? compareFold() : "") + more, { help: "question.readings.help" }));
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
    if (relies) around.push(cs.sec("question.relies.title", relies, { help: "question.relies.help" }));
  }

  /* R56: the themes its passages are in, each with how many of the question's passages it holds (the question has no theme
     of its own, `connections` R40); and the act that places a passage in one */
  const passageDocs = [...new Set(citedLegs.filter(live).map((l) => String(l.target)))];
  if (passageDocs.length) {
    const tl = later("themes", "themeread", { limit: "200" });
    const themes = tl.state === "ok" && tl.value && Array.isArray(tl.value.themes) ? tl.value.themes.filter((t) => t && t.theme_id).slice(0, 20) : [];
    const held = themes.map((t) => { const r = later("theme:" + t.theme_id, "themeread", { id: String(t.theme_id), limit: "500" });
      const ms = r.state === "ok" && r.value && Array.isArray(r.value.members) ? r.value.members : [];
      return { t, n: ms.filter((m) => m && passageDocs.includes(String(m.document || m.target || "").split(/[#/:?]/)[0])).length, state: r.state }; });
    const rows = held.filter((h) => h.n > 0).map((h) => cs.row("", `<span class="rec">${cs.esc(String(h.t.name || ""))}</span>`, "", String(h.n)));
    const place = themes.length ? cs.choice("question-theme-passage", "theme.question.place", passageDocs.map((x) => ({ value: x, text: legTitle({ target: x }) })), {})
      + cs.choice("question-theme-which", "theme.section", themes.map((t) => ({ value: String(t.theme_id), text: String(t.name || "") })), {})
      + cs.field("question-theme-note", "theme.place", { rec: true, help: "act.themeplace.here.question" })
      + cs.act("themeplace", { label: "theme.question.place", data: { inquiry: id } }) : "";
    if (tl.state === "failed") around.push(cs.sec("theme.question.section", cs.state(tl, () => "")));
    else if (rows.length || place) around.push(cs.sec("theme.question.section", (rows.length ? cs.sheet(rows.join("")) : "") + `<p class="mk-small">${W("theme.never.evidence")}</p>` + place));
  }
  if (around.length) out.push(`<details class="mk-details" data-fold="around"${around.length ? "" : ""}><summary>${W("question.around")}</summary>${around.join("")}</details>`);
  /* R72: what each published case froze for this question, from `publishedfrozen` (public: no credential), beside today's strength;
     a question no case pins (cases [] or NOT_PUBLISHED, which a working question answers) draws no section; a read that fails is drawn failed */
  {
    const fr = later("frozen", "publishedfrozen", { id });
    const none = fr.state === "empty" || (fr.state === "failed" && fr.refusal && fr.refusal.code === "NOT_PUBLISHED") || (fr.state === "ok" && !(fr.value && Array.isArray(fr.value.cases) && fr.value.cases.length));
    if (fr.state === "failed" && !none) out.push(cs.sec("screen.question.say045", cs.state(fr, () => "")));
    else if (fr.state === "ok" && !none) {
      const rank = { A: 4, B: 3, C: 2, D: 1 };
      const sOf = (x) => (x && typeof x === "object" && x.grade ? { state: "graded", grade: String(x.grade) } : { state: "unrated" });
      const todayS = d.strength && d.strength.state === "ok" && d.strength.value ? d.strength.value : null;
      const entry = (c) => {
        const pc = later("pc:" + c.case_id + ":" + c.edition, "publishedcase", { caseId: String(c.case_id), edition: String(c.edition) });
        const named = pc.state === "ok" && pc.value && (pc.value.scope || pc.value.title) ? String(pc.value.scope || pc.value.title) : "";
        const ref = cs.ref("published", String(c.case_id), named || T("state.undetermined", { reason: "" }), []);
        const head = `<b>${ref}</b><span class="mk-small" data-published="${cs.esc(String(c.edition))}">${W("screen.question.frozen.published", { date: { html: c.published_at ? cs.date(String(c.published_at), { year: true }) : T("state.undetermined", { reason: "" }) }, n: String(c.edition) })}</span>`;
        if (c.withheld) return `<div class="mk-ev" data-case-edition="${cs.esc(String(c.case_id))}:${cs.esc(String(c.edition))}" data-withheld="1">${head}${cs.mark("gap", "withheld", { reason: "" })}</div>`;
        if (c.pinned === false) return `<div class="mk-ev" data-case-edition="${cs.esc(String(c.case_id))}:${cs.esc(String(c.edition))}" data-pinned="no">${head}<p class="cs-gap" data-gap="refused">${W("screen.question.say056")} ${W("screen.question.say057")}</p></div>`;
        const froze = c.strength && typeof c.strength === "object" ? { capture: sOf(c.strength.capture), connection: sOf(c.strength.connection), ...(c.strength.testimony ? { testimony: sOf(c.strength.testimony) } : {}) } : null;
        const rel = (a) => {
          const f = froze && froze[a] && froze[a].state === "graded" ? rank[froze[a].grade] : null, t = todayS && todayS[a] && todayS[a].state === "graded" ? rank[todayS[a].grade] : null;
          return f === null || t === null ? "unknown" : t === f ? "same" : t > f ? "stronger" : "weaker";
        };
        const relWord = (r) => (r === "same" ? W("screen.question.word.same") : r === "stronger" ? W("screen.question.word.stronger")
          : r === "weaker" ? W("screen.question.word.weaker") : W("screen.question.word.unknown"));
        /* R72 (DEC-366): say054's {source} is the newest document the question cited on that axis after this edition published (its
           citations' dates against `published_at`); with no such read the axis draws `compare.axis`. The capture axis reads each cited
           document's capture date (`source.retrieved`, in the image the screen already reads for the title); the citations carry no
           date for the connection axis, so it draws `compare.axis` until a read gives one. */
        const pubAt = Date.parse(String(c.published_at || ""));
        const newerSource = (a) => {
          if (a !== "capture" || Number.isNaN(pubAt)) return "";
          let best = null;
          for (const t of new Set(citedLegs.filter(live).map((l) => String(l.target)))) {
            const im = later("doc:" + t, "image", { id: t });
            const head = im.state === "ok" && im.value && typeof im.value["bundle.md"] === "string" ? (im.value["bundle.md"].split(/\n---\s*\n/)[0] || "") : "";
            const m = /^\s+retrieved:\s*"?([^"\n]+?)"?\s*$/m.exec(head);
            const when = m ? Date.parse(m[1]) : NaN;
            if (!Number.isNaN(when) && when > pubAt && (!best || when > best.when)) best = { when, target: t };
          }
          return best ? legTitle({ target: best.target }) : "";
        };
        const axisCard = (a) => {
          const name = `<span class="cs-card" tabindex="0" data-tip="${cs.esc(W(a === "capture" ? "screen.question.compare.captured.explain" : "screen.question.compare.connected.explain"))}">${W("mark.scale." + a + ".name")}</span>`;
          const cited = newerSource(a);
          const said = cited ? W("screen.question.say054", { change: { html: relWord(rel(a)) }, source: cited })
            : W("screen.question.compare.axis", { axis: { html: name }, change: { html: relWord(rel(a)) } });
          return `<span class="mk-small" data-axis="${a}" data-relation="${rel(a)}">${cited ? name + " " : ""}${said}</span>`;
        };
        return `<div class="mk-ev" data-case-edition="${cs.esc(String(c.case_id))}:${cs.esc(String(c.edition))}" data-pinned="${c.pinned === true ? "yes" : "none"}">${head}`
          + (froze ? `<span class="mk-small" data-frozen="1">${W("screen.question.say048")} ${grades(froze)}</span>` : `<p class="mk-small" data-frozen="none">${W("public-read.frozen.strength_detail.none")}</p>`)
          + (todayS && froze ? `<span class="mk-small" data-today="1">${W("screen.question.frozen.today")} <span class="cs-strength">${axes(todayS)}</span></span>` + axisCard("capture") + axisCard("connection") : "")
          + (froze ? `<span class="mk-small muted">${c.strength_from === "member_bytes" ? W("screen.question.say055") : W("screen.question.say050") + " " + W("screen.question.say051")}</span>` : "")
          + (c.pinned === true ? `<span class="mk-small" data-pin="1">${W("screen.question.say052")}</span>` : `<span class="mk-small" data-pin="none">${W("screen.question.frozen.unpinned")}</span>`) + "</div>";
      };
      const nCases = new Set(fr.value.cases.map((c) => String(c.case_id))).size;
      out.push(cs.sec("screen.question.say045", `<p class="mk-note">${nCases === 1 ? W("screen.question.frozen.count.one") : W("screen.question.frozen.count", { n: String(nCases) })} ${W("screen.question.say046")} ${W("screen.question.say047")}</p><div class="mk-versions">${fr.value.cases.map(entry).join("")}</div>`, { help: "screen.question.tip076" }));
    }
  }

  /* Concluding (R35, R41, R50, R51): offered once the question cites a passage, on an accepted reading or one she writes
     herself; open by itself when a reading stands */
  const stands = project ? (current && vs.some((v) => v.name === currentName && v.state === "accepted")) : accepted.length > 0;
  const reading = project ? currentName : (shown && shown.state === "accepted" ? shown.name : (accepted[0] && accepted[0].name) || "");
  const cited = citedLegs.length > 0;
  let concl = "";
  if (b && b.conclusion_stance === "withdrawn") concl += `<p>${W("screen.question.concluded.withdrawn")}</p>`;
  /* the form is drawn once the reads that say which reading stands have answered, so its default is not kept from a pending draw */
  const settled = (!cur || cur.state !== "loading") && !(d.basis && d.basis.state === "loading");
  if (!concluded && cited && settled) {
    const names = [...new Set((reading ? [reading] : []).concat(accepted.map((v) => String(v.name))))];
    concl += `<details class="mk-details" data-conclude="form"${stands ? " open" : ""}><summary>${W("act.conclude.label.question")}</summary>`
      + cs.choice("question-conclude-reading", "question.conclude.reading", names.map((n) => ({ value: n, text: n })).concat([{ value: "", key: "question.conclude.own.choice" }]), { value: stands ? reading : "" })
      + cs.field("question-conclude-own", "question.conclude.own.field", { area: true, rec: true, max: 500, help: "question.conclude.own.help" })
      + (project ? "" : cs.field("question-conclude-claim", "screen.question.conclude.claim", { area: true, rec: true }))
      + cs.field("question-conclude-falsifier", "question.conclude.falsifier", { area: true, rec: true, help: "question.conclude.falsifier.help" })
      + cs.checks("question-conclude-none", "question.conclude.falsifier", [["none", "question.conclude.nofalsifier"]])
      + cs.field("question-conclude-commentary", "question.conclude.commentary", { area: true, rec: true, help: "question.conclude.commentary.help" })
      + cs.act("conclude", { label: "act.conclude.label.question", data: { inquiry: id } })
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
  if (concl) out.push(cs.sec("screen.question.concluding.head", concl));

  /* R51: the secondary acts fold under `question.more` (before a conclusion; a concluded question has its own row, R62) */
  const moreInner = cs.field("question-narrow-name", "screen.question.narrow.name", {})
    + cs.field("question-narrow-description", "screen.question.narrow.description", { area: true, rec: true })
    + cs.act("narrow", { label: "act.narrow.label.question", data: { inquiry: id } })
    + cs.act("search", { label: "act.search.label.question", data: { q: heading } })
    + cs.field("question-check", "screen.question.check.label", { help: "screen.question.check.help" })
    + cs.field("question-check-note", "screen.question.check.note", { area: true, rec: true })
    + cs.act("checkrequest", { label: "act.checkrequest.label.question", data: { inquiry: id } })
    + (concluded ? "" : cs.field("question-plan", "screen.question.plan.label", {}) + cs.act("planopen", { label: "act.planopen.label.question", data: { inquiry: id } }))
    /* R71: in state a only (a decided question has the receipt above, a concluded one its own row); a failed read is drawn failed */
    + (joined && !concluded && !decision && asideRead ? (asideRead.state === "failed" ? cs.state(asideRead, () => "") : asideRead.state === "loading" ? "" : asideFold()) : "");
  out.push(`<details class="mk-details" data-fold="more"><summary>${W("question.more")}</summary>${moreInner}</details>`);

  out[stepsAt] = stepsHtml(concluded ? ["done", "done", "done"] : !cited ? ["current", "todo", "todo"] : stands ? ["done", "done", "current"] : ["done", "current", "todo"]) + receipt;
  return out.join("");
}

/** R2's, R12's, R23–R25's, R31's and R41's acts, each answering `{query, body}` for the shell to send, or running its own
 *  calls and drawing its outcome, or opening another screen and sending nothing. */
const acts = [
  /* R71's act. The registry lists `proposedispose` on `question` (`registry.json` at 8c5e692e19), but `wizard-scripts`' generated
 *  `screen-registry.mjs` still holds the older file (its R44, not yet met: T51), so `checkScreens` (interface-shell R21) refuses
 *  this screen until that file is re-taken.
 *  R71: set the question aside for its project, on the project's own decision: `project` (the question's), `finding` (its id), `to`
     `deferred` or `dismissed` and her reason, nothing else (`queue` R27's project arm: never a shared dispose); with no choice, or no
 *  reason, nothing is sent; its refusals are drawn by their `refusal.<CODE>` words. */
  { op: "proposedispose", label: "act.proposedispose.label.question", reasonField: "reason",
    send(view, el, cs) {
      const which = el.dataset.which === "2" ? "2" : "";
      const chosen = (cs.value("question-aside" + which) || [])[0];
      if (chosen !== "deferred" && chosen !== "dismissed") return { refuse: "screen.question.say063" };
      const reason = String(cs.value("question-aside" + which + "-why") || "").trim();
      if (!reason) return { refuse: "screen.question.say075" };
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(String(text).split(/\n---\s*\n/)[0] || "") : null;
      if (!m) return null;
      return { body: { project: m[1], finding: String(view.subject || ""), to: chosen, reason } };
    },
    done(view, answer, cs) { cs.set("asideSeq", (view.ui.asideSeq || 0) + 1); } },
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
      const own = String(cs.value("question-conclude-own") || "").trim();
      const claim = String(cs.value("question-conclude-claim") || "").trim();
      const falsifier = String(cs.value("question-conclude-falsifier") || "").trim();
      const none = (cs.value("question-conclude-none") || []).includes("none");
      const commentary = String(cs.value("question-conclude-commentary") || "").trim();
      /* R50: no reading chosen is her own: 1 to 500 characters, sent as `reading` in place of `version`; empty refused in place */
      if (!version && !claim && (!own || own.length > 500)) return { refuse: "refusal.BAD_READING" };
      if (!falsifier && !none) return { refuse: "question.conclude.falsifier.help" };
      const q = { target: String(view.subject || "") };
      if (m) q.project = m[1]; else if (claim && !version) q.conclusion = claim;
      if (version) q.version = version; else if (own) q.reading = own;
      if (falsifier) q.falsifier = falsifier; else q.no_falsifier = "1";
      if (commentary) q.commentary = commentary;
      return { query: q, raw: "" };
    },
    /* R41 state g: the conclusion is answered to the project-aware read, read again once it is made or withdrawn */
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { current: null })); } },
  /* R62: a concluded question offers a case: the question's project and itself as the one target, no case named; then the
     case editor, where the draft stands */
  { op: "casedraft", label: "act.casedraft.label.question",
    send(view, el) { return { body: { project: String(el.dataset.project || ""), targets: [String(view.subject || "")] } }; },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (!r || r.ok === false || !r.draftId) return { stay: true };
      cs.go("case-editor", String(r.project || ""));
    } },
  /* R56: a passage placed in a theme, with an optional note; the question has no theme of its own (`connections` R40) */
  { op: "themeplace", label: "theme.question.place",
    send(view, el, cs) {
      const theme = String(cs.value("question-theme-which") || ""), target = String(cs.value("question-theme-passage") || "");
      if (!theme || !target) return { refuse: "screen.question.plan.empty" };
      const note = String(cs.value("question-theme-note") || "").trim();
      return { body: { theme, target, ...(note ? { note } : {}) } };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { themes: null })); } },
  { op: "withdrawconclusion", label: "act.withdrawconclusion.label.question",
    send(view) {
      const text = view.data.inquiry && view.data.inquiry.state === "ok" ? view.data.inquiry.value["bundle.md"] : "";
      const m = typeof text === "string" ? /^project:\s*(\S+)\s*$/m.exec(text) : null;
      return { query: { target: String(view.subject || ""), ...(m ? { project: m[1] } : {}) }, raw: "" };
    },
    done(view, answer, cs) { cs.set("later", Object.assign({}, view.ui.later, { current: null })); } },
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
    ...(op === "versionreject" ? { reasonField: "reason" } : {}),
    send(view, el, cs) {
      /* each function is served by its own text (interface-shell R21 (1)), so the op is read from the pressed control */
      const op = el.getAttribute("data-act");
      const version = String(el.dataset.version || "");
      const body = { target: String(view.subject || ""), version };
      if (op === "versioncurrent") body.project = String(el.dataset.project || "");
      /* R59: the parts she ticked ("Before you accept"); a reading of one part asks none */
      const ix = String(el.dataset.idx || "");
      if (op === "versionaccept" && cs.value("affirm-" + ix) !== null) body.affirmed = cs.value("affirm-" + ix);
      /* R64: Decline sends the version's reject with her reason, and nothing while the reason is empty */
      if (op === "versionreject") body.reason = String(cs.value("question-reject-" + ix) || "").trim();
      return { body };
    },
    /* VERSION_AFFIRMATION_INCOMPLETE by its words, naming the first part not yet affirmed */
    refusals: { VERSION_AFFIRMATION_INCOMPLETE: (r, cs) => cs.w("refusal.VERSION_AFFIRMATION_INCOMPLETE",
      { part: String((r && (r.part !== undefined ? r.part : Array.isArray(r.missing) ? r.missing[0] : "")) || "") }) },
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
      const pack = el.dataset.pack;
      /* R45: state d is drawn at her press, before the plane answers; a refusal or a withholding replaces it */
      cs.set("said", null);
      cs.set("limit", null);
      cs.set("asking", run);
      const pm = /^project:\s*(\S+)\s*$/m.exec(String((view.data.inquiry && view.data.inquiry.state === "ok" && view.data.inquiry.value["bundle.md"]) || "").split(/\n---\s*\n/)[0] || "");
      cs.call("airunopen", { body: { run, contextType: "inquiry", contextId: String(view.subject || ""), mode: "check",
        principalClaude: "member:" + member, skillVersion: pack, bounds, ...(pm ? { project: pm[1] } : {}) } }).then((o) => {
        const r = res(o) || {};
        if (!o || o.ok === false || r.ok === false || r.started === false) {
          const code = String(r.code || r.reason || "");
          cs.set("asking", null);
          if (code === "AI_LIMIT_REACHED") cs.set("limit", { whose: r.whose || "", period: r.period || "", when: r.when || "", reasons: [] });
          else cs.set("said", { html: `<p class="mk-msg" role="alert" data-refusal="airunopen">${r.translation ? cs.esc(r.translation) : cs.w("state.failed", { reason: code })}</p>` });
          return;
        }
        /* D29: a dispatch answered `dispatched: false`, withheld or refused is said by its words, never taken as at work */
        return cs.call("airundispatch", { body: { run } }).then((x) => {
          const xr = res(x) || {};
          if (!x || x.ok === false || xr.ok === false || xr.dispatched === false || xr.withheld || xr.found === false) {
            const c = String(xr.code || xr.reason || xr.withheld || "");
            cs.set("asking", null);
            cs.set("withheld", run);
            const key = xr.withheld && (view.parts.withheld || []).includes(c) ? "dock.withheld." + c : (view.parts.refusals || {})[c];
            cs.set("said", { html: `<p class="mk-msg" role="alert" data-refusal="airundispatch">${key ? cs.w(key) : xr.translation ? cs.esc(xr.translation) : cs.w("dock.withheld.other")}</p>` });
            return;
          }
          cs.set("dispatched", run);
          cs.set("seq", (view.ui.seq || 0) + 1);
        });
      }, () => { cs.set("asking", null); cs.set("said", { html: `<p class="mk-msg" role="alert">${cs.w("state.failed", { reason: "" })}</p>` }); });
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
    "inquiryground", "versionaccept", "versionconsider", "versionreject", "versionrevert", "versioncurrent", "versionhide", "readtranslate", "airunopen", "airunclose", "proposedispose"]
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
  "question.run.heading", "question.run.leave", "screen.assistant.run.running", "screen.assistant.run.ended", "question.proposal.heading", "ai.refused.limit.overall", "question.limit.note",
  "question.ai.other", "question.ai.whose", "question.concluded.heading", "question.concluded.by", "question.concluded.falsifier",
  "question.conclude.reading", "question.conclude.falsifier", "question.conclude.falsifier.help", "question.conclude.nofalsifier",
  "question.conclude.commentary", "question.conclude.commentary.help", "question.plan.link", "question.plan.link.tip",
  "refusal.VERSION_AFFIRMATION_INCOMPLETE", "dock.withheld.other", "dock.withheld.MEMBER_PRINCIPAL_RUN", "dock.withheld.AGENT_WORKER_UNBOUND",
  "dock.withheld.NAMESPACE_UNDETERMINED", "dock.withheld.CREDENTIAL_RECORD_SILENT",
  /* T50 (R50–R64) */
  "question.steps.source", "question.steps.mark", "question.steps.conclude", "question.more", "question.around",
  "question.conclude.own.choice", "question.conclude.own.field", "question.conclude.own.help", "question.reading.by.member",
  "refusal.BAD_READING", "act.casedraft.label.question", "act.casedraft.does", "screen.question.stopped.kept",
  "screen.question.reject.summary", "screen.question.reject.reason", "screen.question.reject.reason.help", "screen.question.reject.go",
  "reading.affirm.head", "reading.affirm.says", "reading.affirm.part", "reading.affirm.accept",
  "ai.run.ending.completed", "ai.run.ending.completed.none", "ai.run.ending.cancelled", "ai.run.ending.mode-not-deployed", "ai.run.ending.fetches",
  "ai.run.ending.subsessions", "ai.run.ending.wallclock", "ai.run.ending.runtime", "ai.run.ending.mints", "ai.run.ending.surfaces",
  "ai.run.ending.proposals", "ai.run.ending.pages", "ai.run.ending.lease", "ai.run.ending.nothing-written", "ai.run.ending.unknown",
  "screen.assistant.run.cost.sofar", "screen.assistant.run.cost.final", "ai.run.cost.money", "ai.run.cost.money.one", "ai.run.cost.tokens",
  "ai.run.cost.tokens.one", "ai.run.cost.on.subscription", "ai.run.cost.on.apikey", "ai.run.cost.on.team", "ai.run.cost.on.project",
  "ai.run.cost.means", "ai.run.cost.tokens.means", "ai.progress.reading", "ai.progress.read", "ai.progress.read.one", "ai.progress.found",
  "ai.progress.found.one", "ai.progress.found.none", "ai.progress.composing", "ai.progress.checking", "ai.progress.hold", "ai.progress.means",
  "ai.progress.checked.all", "ai.progress.checked.all.means", "ai.progress.check.ok", "ai.progress.check.fail", "ai.progress.checked",
  "ai.progress.check.failed", "ai.reading.levels.disagree", "theme.question.section", "theme.question.place", "theme.section",
  "theme.place", "theme.never.evidence", "act.themeplace.here.question",
  /* T51 (R71–R74, R78) */
  "screen.question.say000", "screen.question.say001", "screen.question.say002", "screen.question.say003", "screen.question.say004", "screen.question.say005", "screen.question.say006", "screen.question.say008", "screen.question.say009", "screen.question.say010", "screen.question.say011", "screen.question.say012", "screen.question.say013", "screen.question.say014", "screen.question.say015", "screen.question.say017", "screen.question.say018", "screen.question.say019", "screen.question.say020", "screen.question.say021", "screen.question.say022", "screen.question.say023", "screen.question.say024", "screen.question.say025", "screen.question.say026", "screen.question.say027", "screen.question.say028", "screen.question.say029", "screen.question.say032", "screen.question.say033", "screen.question.say034", "screen.question.say035", "screen.question.say036", "screen.question.say037", "screen.question.say038", "screen.question.say039", "screen.question.say040", "screen.question.say041", "screen.question.say042", "screen.question.say043", "screen.question.say044", "screen.question.say045", "screen.question.say046", "screen.question.say047", "screen.question.say048", "screen.question.say050", "screen.question.say051", "screen.question.say052", "screen.question.say055", "screen.question.say056", "screen.question.say057", "screen.question.say058", "screen.question.say059", "screen.question.say060", "screen.question.say061", "screen.question.say062", "screen.question.say063", "screen.question.say064", "screen.question.say065", "screen.question.say066", "screen.question.say067", "screen.question.say068", "screen.question.say069", "screen.question.say070", "screen.question.say071", "screen.question.say072", "screen.question.say073", "screen.question.say074", "screen.question.say075",
  "screen.question.say000.bymember", "screen.question.say008.bymember", "screen.question.tip076", "screen.question.tip078", "screen.question.tip079",
  "shell.reason", "shell.reason.lead", "public-read.frozen.strength_detail.none", "mark.gap.withheld.name", "mark.gap.withheld.means",
  "screen.question.compare.captured.explain", "screen.question.compare.connected.explain", "screen.question.decision.change", "screen.question.compare.axis", "screen.question.say054",
  "refusal.VERSION_COMPARE_NO_SUCH_VERSION", "refusal.VERSION_COMPARE_NO_VERSION", "refusal.VERSION_COMPARE_NO_INQUIRY",
  "screen.question.touches.heading", "screen.question.frozen.count", "screen.question.frozen.count.one", "screen.question.frozen.published",
  "screen.question.frozen.today", "screen.question.frozen.unpinned", "screen.question.bias.moved",
  ...["same", "different", "stronger", "weaker", "unknown"].map((k) => "screen.question.word." + k),
  ...["takenup", "letgo", "kept", "none", "was", "now", "origin"].map((k) => "screen.question.compare." + k),
]);

/** The question screen (interface-shell R21), with the module's shared readers and the dock's bounds as its parts. */
export function questionScreen(parts) {
  return Object.freeze({ id: "question", reads, place, render, acts, words, parts });
}
