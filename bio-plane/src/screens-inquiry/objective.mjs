/* screens-inquiry R106 (FR-28 entry 23; C46; DEC-374; `intent` R2–R18): a project's objective on its own page (registry screen
 * `objective`, at `/app/objective/<project>`, opened from the project page): what success means and how it is measured, how it is
 * going, what is still short, the proposals to decide, the aspirations a team, project or member holds with their departures and dead
 * ends, and the goals the objective serves. In the drawing's order (`SCR.objective`, DEC-374), each section only when its read answers
 * (R20), a read that failed drawn failed. Progress is derived by the plane on every read and is never typed here (`intent` R19).
 *
 * Reads: `objectiveprogress`, `objectivegaps`, `intentproposals`, `aspirations` (for the project and for her), `list` (type `goal`);
 * then, as it draws, `progression` and `entity` (the measure's flow, party and stages by name), `pursuit` (an aspiration's dead ends)
 * and `goal`. Acts, each the fields `intent` declares: `objectivecondition` (the reason is the box "Why you measure it this way"; a
 * removal too), `triage`, `aspirationdeclare`, `aspirationdepart`, `aspirationdeadend` (the note), `aspirationretire` (what it taught),
 * `goaldeclare`, `goallink`, `goalclose`, and `writinghelp` beside each field of her own words, only while the assistant is reachable.
 *
 * Words are keys (R44). Design words the table does not hold yet are drawn as the key they will have (`PENDING_WORDS`, reported to BOB);
 * an optional label with no word is not drawn. Every function is self-contained (interface-shell R21 (1)): the page carries each by its
 * own text. */

/** The `screen.objective.*` keys DEC-374's drawing needs and `words.json` does not hold (GAP, reported): each is drawn as itself until
 *  the design stream writes its row, at which the table gives its words and nothing here changes. */
export const PENDING_WORDS = Object.freeze([
  "what-success-means", "proposals-to-decide", "aspirations", "declare-an-aspiration", "whose-it-is", "the-whole-team-s", "this-project-s", "mine",
  "about-which-party", "which-aspiration", "which-goal", "which-proposal", "open-a-goal", "what-it-pursues", "what-limits-it", "close-a-goal", "why-it-closes",
  "put-it-off", "dismiss-it", "retire-an-aspiration", "held-by-this-project", "held-by-me", "this-project-departed",
].map((s) => "screen.objective." + s));

function reads(view) {
  const id = String(view.subject || "");
  const me = view.me && view.me.member;
  return {
    progress: { op: "objectiveprogress", query: { project: id }, subject: true, empty: () => false },
    /* C62: the project's own record, for the crumb's title (R39: never its id); a project she cannot read names none */
    project: { op: "image", query: { id }, empty: () => false },
    gaps: { op: "objectivegaps", query: { project: id }, empty: () => false },
    proposals: { op: "intentproposals", query: { project: id }, empty: () => false },
    aspirations: { op: "aspirations", query: { project: id, ...(me ? { member: String(me) } : {}) }, empty: () => false },
    goals: { op: "list", query: { type: "goal", limit: "200" }, empty: () => false },
    /* R46 (K5148; WALK-FINAL-03b §14): the founder's handle, from the roster's founder row, so a declarer `admin` reads as her handle here as on the project */
    participants: { op: "projectparticipants", query: { projectId: id }, empty: () => false },
  };
}

/** The path's project step (R39, C62: the project's title as its own record states it, never its id). */
function place(view) {
  const id = String(view.subject || "");
  const p = view.data && view.data.progress;
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && typeof d.value["bundle.md"] === "string" ? d.value["bundle.md"] : "";
  const m = /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "");
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw value is drawn */ }
  return { project: { id, title: title || (p && p.state === "ok" && p.value && p.value.project_title ? String(p.value.project_title) : "") } };
}

function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui, d = view.data || {}, P = view.parts;
  const K = (s) => "screen.objective." + s;
  const W = (k, f) => cs.w(k, f);
  const T = (k, f) => P.plain(cs, k, f);
  const held = (k) => cs.w(k) !== cs.esc(k);
  const tok = String(ui.seq || 0);
  const ask = (key, op, query) => P.later(cs, ui, key, op, query, tok);
  const val = (r) => (r && r.state === "ok" && r.value && typeof r.value === "object" ? r.value : null);
  const data = (s) => `<span class="mk-data">${cs.esc(s)}</span>`;
  const quote = (s) => `<span class="rec">“${cs.esc(s)}”</span>`;
  const note = (k) => `<p class="mk-small muted">${W(K(k))}</p>`;
  const gap = (...ks) => `<div class="cs-gap" data-gap="refused">${cs.icon("refused")}<span>${ks.map((k) => W(K(k))).join(" ")}</span></div>`;
  const fold = (summary, inner, open) => `<details class="mk-details"${open ? " open" : ""}><summary>${W(summary)}</summary>${inner}</details>`;
  const day = (iso) => (iso ? cs.date(String(iso), { year: true }) : "");
  const help = (fid, field, forop) => (view.reachable ? `<div class="mk-acts">${cs.act("writinghelp", { data: { field, id: fid, forop } })}</div>` : "");
  const failed = (r) => (r && r.state === "failed" ? cs.state(r, () => "") : r && r.state === "loading" ? cs.state({ state: "loading" }, () => "") : "");
  const out = [cs.title(), ""];
  const pr = val(d.progress);
  if (pr && pr.objective) out[1] = `<p class="mk-sub">${data(pr.objective)}</p>`;
  const cond = pr && pr.condition && typeof pr.condition === "object" ? pr.condition : null;
  const proposals = val(d.proposals) && Array.isArray(val(d.proposals).proposals) ? val(d.proposals).proposals : [];
  const gaps = val(d.gaps) && Array.isArray(val(d.gaps).gaps) ? val(d.gaps).gaps : [];
  const asp = val(d.aspirations) || {};
  const aspirations = Array.isArray(asp.aspirations) ? asp.aspirations : [];
  const roster = val(d.participants) && Array.isArray(val(d.participants).participants) ? val(d.participants).participants : [];
  const founderRow = roster.find((x) => x && x.founder === true);
  const founder = founderRow && founderRow.handle ? String(founderRow.handle) : "";
  const departures = Array.isArray(asp.departures) ? asp.departures : [];

  /* the flows and parties this screen can name: the measure's own, and those the proposals and shortfalls name */
  const flows = new Map(), parties = new Map();
  if (cond && cond.progression) flows.set(cond.progression, null);
  if (cond && cond.entity) parties.set(cond.entity, null);
  for (const p of proposals) {
    if (p && p.progression_key) flows.set(p.progression_key, p.progression_label || flows.get(p.progression_key) || null);
    for (const i of Array.isArray(p && p.instances) ? p.instances : []) if (i && i.entity_id) parties.set(i.entity_id, i.entity_label || parties.get(i.entity_id) || null);
  }
  /* the flows the group holds (`progressions`, progressions R48) and the parties it holds (`entitieskind`, entities R51, one read for each kind
     that can be a party: a person or an organisation or post), so the measure's two pickers offer what exists and not a typed id */
  const flowList = ask("flows", "progressions", { limit: "200" });
  for (const f of Array.isArray(val(flowList) && val(flowList).items) ? val(flowList).items : [])
    if (f && f.progression_key) flows.set(String(f.progression_key), flows.get(String(f.progression_key)) || (f.label ? String(f.label) : null));
  const partyReads = ["person", "institution", "body", "office"].map((kind) => ask("kind:" + kind, "entitieskind", { kind, limit: "200" }));
  for (const r of partyReads)
    for (const e of Array.isArray(val(r) && val(r).entities) ? val(r).entities : [])
      if (e && e.entity_id) parties.set(String(e.entity_id), parties.get(String(e.entity_id)) || (e.label ? String(e.label) : null));
  const readFailed = [flowList, ...partyReads].find((r) => r && r.state === "failed");
  const flowKey = ui.obflow && flows.has(ui.obflow) ? ui.obflow : cond && cond.progression ? cond.progression : [...flows.keys()][0] || "";
  const prog = flowKey ? ask("prog:" + flowKey, "progression", { key: flowKey }) : null;
  const progV = val(prog) && val(prog).found !== false ? val(prog) : null;
  const stages = progV && Array.isArray(progV.stages) ? progV.stages.map((s) => ({ key: String(s.stage_key || s.key || ""), label: String(s.label || s.stage_key || s.key || "") })).filter((s) => s.key) : [];
  const stageName = (k) => (stages.find((s) => s.key === k) || { label: String(k) }).label;
  if (cond && cond.progression === flowKey && progV && progV.label) flows.set(flowKey, progV.label);
  const ent = cond && cond.entity ? val(ask("ent:" + cond.entity, "entity", { id: cond.entity })) : null;
  if (ent && ent.entity && ent.entity.label) parties.set(cond.entity, ent.entity.label);

  /* what success means */
  let means;
  if (cond && cond.progression) {
    const share = cond.satisfied && cond.satisfied.share != null ? String(cond.satisfied.share) + "%" : "";
    const req = cond.required || {};
    const sentence = req.grade && Array.isArray(req.stages) && req.stages.length && share
      ? W(K("success-is-reached-when-at-least-of-the-made-for"), { share, flow: flows.get(cond.progression) || cond.progression, party: parties.get(cond.entity) || cond.entity || "",
        stage: (req.stages || []).map(stageName).join(", "), grade: req.grade })
      : [flows.get(cond.progression) || cond.progression, parties.get(cond.entity) || cond.entity, (req.stages || []).map(stageName).join(", "), req.grade, share].filter(Boolean).map(data).join(" · ");
    const setBy = [pr.set_by ? P.who(cs, pr.set_by, founder) : "", day(pr.set_at)].filter(Boolean).join(" · ");
    means = cs.row(cs.icon("accepted"), sentence, "", setBy);
  } else if (pr) means = `<p>${W(K("this-objective-has-no-measure-of-success-yet-so"))} ${W(K("choose-what-counts-and-the-screen-works-it-out-f"))}</p>`;
  else means = failed(d.progress);

  /* the form that sets it */
  const opts = (m) => [...m.entries()].map(([v, t]) => ({ value: v, text: t || v }));
  const stageBoxes = stages.length ? cs.checks("ob-stages", K("each-one-must-have-reached"),
    stages.map((s) => ({ value: s.key, text: s.label, on: !!(cond && cond.progression === flowKey && cond.required && (cond.required.stages || []).includes(s.key)) }))) : "";
  const flowField = flows.size ? cs.choice("ob-flow", K("which-flow-of-events"), opts(flows), { value: flowKey, redraw: "obflow" }) : cs.field("ob-flow", K("which-flow-of-events"), {});
  const letters = [{ value: "", text: "–" }, ...["A", "B", "C", "D"].map((l) => ({ value: l, text: l }))];
  const measure = note("say-which-payments-or-records-count-what-each-mu") + note("the-screen-then-counts-them-from-your-documents")
    + flowField
    /* C58: where the group holds no flow, the field takes a typed key; a flow must exist before a measure can name it, said here and not
       only after the plane's refusal */
    + (flows.size ? "" : `<p class="mk-small" data-note="flowfirst">${W("refusal.INTENT_NO_SUCH_PROGRESSION")}</p>`)
    + (readFailed ? cs.state(readFailed, () => "") : "")
    + (parties.size ? cs.choice("ob-ent", K("about-which-party"), opts(parties), { value: cond && cond.entity || "" }) : cs.field("ob-ent", K("about-which-party"), {}))
    + cs.field("ob-rel", K("linked-to-it-as-optional"), { value: cond && cond.relation || "" })
    + cs.field("ob-min", K("only-amounts-of-at-least-optional"), { help: [K("leave-it-empty-to-count-every-amount"), K("a-top-amount-and-a-currency-can-be-given-too")] })
    + stageBoxes
    + cs.choice("ob-grade", K("every-link-at-least-grade-optional"), letters, { value: cond && cond.required && cond.required.grade || "" })
    + cs.field("ob-share", K("share-that-must-meet-it-from-1-to-100-percent"), { value: cond && cond.satisfied && cond.satisfied.share != null ? String(cond.satisfied.share) : "" })
    + `<div class="cs-reason">${cs.field("ob-why", K("why-you-measure-it-this-way"), { rec: true, area: true, help: [K("required-in-your-own-words"), K("it-stays-on-the-record-with-your-name")] })}${help("ob-why", "reason", "objectivecondition")}`
    + `<span class="mk-acts">${cs.act("objectivecondition", { data: { mode: "save" } })}${cond ? cs.act("objectivecondition", { label: K("stop-measuring-this-objective"), tone: "quiet", data: { mode: "stop" } }) : ""}</span></div>`
    + note("if-the-objective-or-the-party-you-chose-names-a") + note("you-can-still-go-on")
    + fold(K("when-the-measure-is-not-accepted"), gap("only-a-named-member-can-set-it-and-only-a-member", "if-you-have-not-joined-ask-to-join-first")
      + gap("a-reason-is-required-also-to-remove-the-measure", "say-why-and-save-again") + gap("the-measure-names-a-flow-a-party-or-a-stage-the", "choose-from-the-lists-and-save-again"));
  /* C58: choosing a flow redraws the page, and the form she had open stays open */
  out.push(cs.sec(K("what-success-means"), means + fold(K("set-how-success-is-measured"), measure, !!ui.obflow)));

  /* how it is going: counted by the plane on every read, never typed in */
  if (pr) {
    const rows = [];
    if (pr.computable === true) {
      const met = Number(pr.meeting) || 0, shortN = Array.isArray(pr.short) ? pr.short.length : 0, und = Array.isArray(pr.undetermined) ? pr.undetermined.length : 0;
      const share = cond && cond.satisfied && cond.satisfied.share != null ? String(cond.satisfied.share) + "%" : "";
      const line = [Number(pr.matched) > 0 && shortN > 0 ? W(K("rent-payments-meet-the-measure-are-short"), { met: String(met), short: String(shortN) }) : "",
        pr.satisfied === false && share ? W(K("success-needs-so-it-is-not-yet-reached"), { share }) : ""].filter(Boolean).join(" ");
      if (line) rows.push(cs.row(cs.icon("status"), line, "", day(pr.computed_at)));
      /* C58: a measure nothing matches (or one cut at its bound) is told in the plane's own words for it, never left a blank section */
      if (typeof pr.satisfied_why === "string" && pr.satisfied_why) rows.push(cs.row(cs.icon("undetermined"), cs.esc(pr.satisfied_why), ""));
      if (und > 0) rows.push(cs.row(cs.icon("undetermined"), W(K("not-yet-decidable-of-the-short-payments-may-stil"), { count: String(und) }), ""));
      if (pr.satisfied === null && Number(pr.matched) > 0) rows.push(cs.row(cs.icon("undetermined"), cs.mark("gap", "undetermined"), ""));
      if (rows.length) rows.push(note("this-is-counted-again-each-time-you-open-the-scr"));
    } else rows.push(note("not-counted-yet-no-measure-of-success-is-set"));
    if (rows.length) out.push(cs.sec(K("how-it-is-going"), rows.join("")));
  }

  /* what is still short: one row for each shortfall the plane names */
  if (gaps.length) {
    out.push(cs.sec(K("what-is-still-short"), cs.sheet(gaps.map((g) => {
      const b = g.basis || {}, i = Array.isArray(g.instances) && g.instances[0] ? g.instances[0] : {};
      const why = Array.isArray(b.stages_missing) ? W("queue.objective-gap.detail.stages", { stages: b.stages_missing.map(stageName).join(", ") })
        : b.grade_reached ? W("queue.objective-gap.detail.grade", { reached: String(b.grade_reached), required: String(b.grade_required || "") }) : "";
      return cs.row(cs.icon("status"), `<b class="mk-data">${cs.esc(i.entity_label || i.entity_id || "")}</b><span class="meta">${why}</span>`, "",
        /^[A-D]$/.test(String(g.grade)) ? cs.grade("connection", String(g.grade)) : "");
    }).join("")) + note("each-shortfall-is-also-offered-to-you-as-a-propo")));
  }

  /* the proposals to decide: only a member's act adopts one, opens a question from it, or sets it aside */
  const propTitle = (p) => (p.kind === "objective-gap" && p.basis
    ? (Array.isArray(p.basis.stages_missing) ? T("queue.objective-gap.detail.stages", { stages: p.basis.stages_missing.map(stageName).join(", ") })
      : T("queue.objective-gap.detail.grade", { reached: String(p.basis.grade_reached || ""), required: String(p.basis.grade_required || "") }))
    : T(K("a-missing-step-in"), { flow: p.progression_label || p.progression_key || "" }));
  if (d.proposals && d.proposals.state === "failed") out.push(cs.sec(K("proposals-to-decide"), failed(d.proposals)));
  else if (proposals.length) {
    const rows = proposals.map((p) => cs.row(cs.icon("hint"), `<b>${cs.esc(propTitle(p))}</b><span class="meta">${p.kind === "objective-gap" ? W(K("a-shortfall-of-this-objective")) : data(p.stage_label || p.stage_key || "")} · ${W(K("shown-by-the-machine"))}</span>`, ""));
    out.push(cs.sec(K("proposals-to-decide"), `<p class="mk-small muted">${W(K("things-the-record-suggests-this-objective-should"))} ${W(K("nothing-happens-until-a-member-decides"))}</p>`
      + cs.sheet(rows.join(""))
      + cs.choice("ob-tr-pick", K("which-proposal"), proposals.map((p) => ({ value: String(p.key), text: propTitle(p) })), {})
      + cs.checks("ob-tr-do", K("what-to-do-with-it"), [["adopt", K("adopt-it-into-this-objective")], ["question", K("open-a-question-from-it")], ["defer", K("put-it-off")], ["dismiss", K("dismiss-it")]], { radio: true })
      + note("adopting-adds-it-to-this-objective") + note("opening-a-question-starts-a-question-in-the-proj") + note("putting-it-off-or-dismissing-it-needs-a-reason")
      + `<div class="cs-reason">${cs.field("ob-tr-why", K("why-required-to-put-it-off-or-dismiss-it"), { rec: true })}${help("ob-tr-why", "reason", "triage")}${cs.act("triage")}</div>`
      + fold(K("when-a-proposal-is-not-accepted"), gap("putting-it-off-or-dismissing-it-needs-a-reason-i", "write-one-and-decide-again")
        + gap("that-proposal-is-no-longer-open-another-member-d", "a-decided-proposal-stays-readable-with-its-reaso") + gap("you-can-act-on-a-proposal-only-in-a-project-you", "join-it-or-open-a-question-instead"))));
  }

  /* aspirations: the rows, the departures and dead ends, then the four acts */
  const shown = aspirations.slice(0, 20);
  const pursuits = new Map(shown.concat(departures.map((x) => ({ id: x.aspiration }))).filter((a) => a && a.id).slice(0, 40).map((a) => [a.id, val(ask("pur:" + a.id, "pursuit", { id: a.id }))]));
  const scopeWords = (a) => (a.scope === "group" ? W(K("held-by-the-whole-team")) : a.scope === "project" && held(K("held-by-this-project")) ? W(K("held-by-this-project"))
    : a.scope === "member" && held(K("held-by-me")) ? W(K("held-by-me")) : "");
  const aRow = (a, departed) => cs.row(cs.icon(a.scope === "group" ? "group" : "subject"), `<b class="mk-data">${cs.esc(a.statement || "")}</b><span class="meta">${[scopeWords(a), a.author ? P.who(cs, a.author, founder) : ""].filter(Boolean).join(" · ")}</span>`,
    departed && held(K("this-project-departed")) ? W(K("this-project-departed")) : "");
  const departedIds = new Set(departures.map((x) => x.aspiration));
  const rowsA = aspirations.map((a) => aRow(a, departedIds.has(a.id)))
    .concat(departures.filter((x) => !aspirations.some((a) => a.id === x.aspiration) && pursuits.get(x.aspiration) && pursuits.get(x.aspiration).aspiration)
      .map((x) => aRow(pursuits.get(x.aspiration).aspiration, true)));
  const lines = departures.map((x) => `<p class="mk-small muted">${W(K("this-project-departed-from-the-team-s-aspiration"), { date: { html: day(x.at) }, reason: { html: quote(x.reason || "") } })}</p>`)
    .concat([...pursuits.values()].flatMap((u) => (u && Array.isArray(u.dead_ends) ? u.dead_ends : []).map((e) => `<p class="mk-small muted">${W(K("dead-ends-so-far"), { note: { html: quote(e.note || "") },
      by: { html: data([P.who(cs, e.author, founder), day(e.at)].filter(Boolean).join(", ") + ".") } })}</p>`)));
  const aOpts = aspirations.map((a) => ({ value: String(a.id), text: String(a.statement || a.id) }));
  const groupOpts = aspirations.filter((a) => a.scope === "group").map((a) => ({ value: String(a.id), text: String(a.statement || a.id) }));
  const scopeOpts = [["group", K("the-whole-team-s")], ["project", K("this-project-s")], ["member", K("mine")]];
  const declare = cs.choice("ob-asp-scope", K("whose-it-is"), scopeOpts, { value: "project" })
    + cs.field("ob-asp-st", K("what-it-holds-to"), { rec: true, area: true }) + help("ob-asp-st", "statement", "aspirationdeclare")
    + cs.field("ob-asp-ent", K("parties-it-concerns-optional"), {}) + cs.field("ob-asp-prog", K("flows-it-concerns-optional"), {}) + cs.act("aspirationdeclare")
    + fold(K("when-an-aspiration-is-not-accepted"), gap("only-an-administrator-can-declare-change-or-reti", "ask-one-to-do-it")
      + gap("a-member-s-own-aspiration-is-declared-by-that-me", "a-project-s-needs-a-member-who-has-joined-it") + gap("say-what-it-holds-to-and-name-only-parties-and-f"));
  const depart = groupOpts.length ? note("this-project-stops-holding-to-the-team-s-aspirat") + note("the-team-s-aspiration-stays-as-it-is") + note("a-project-s-or-a-member-s-own-aspiration-cannot")
    + cs.choice("ob-dep-asp", K("which-aspiration"), groupOpts, {})
    + `<div class="cs-reason">${cs.field("ob-dep-why", K("why-this-project-departs"), { rec: true, area: true })}${help("ob-dep-why", "reason", "aspirationdepart")}${cs.act("aspirationdepart")}</div>`
    + fold(K("when-a-departure-is-not-accepted"), gap("a-departure-records-why", "write-the-reason-and-save-again") + gap("this-aspiration-is-retired-so-nothing-holds-to-i", "there-is-nothing-to-depart-from")) : "";
  const deadEnd = aOpts.length ? note("write-what-was-tried-and-why-it-went-nowhere") + note("it-is-added-with-your-name-and-the-date-and-it-i")
    + cs.choice("ob-dea-asp", K("which-aspiration"), aOpts, {}) + cs.field("ob-dea-note", K("what-was-tried-and-why-it-went-nowhere"), { rec: true, area: true }) + help("ob-dea-note", "note", "aspirationdeadend") + cs.act("aspirationdeadend")
    + fold(K("when-a-dead-end-is-not-accepted"), gap("write-what-was-tried-and-why-it-went-nowhere", "only-whoever-may-change-the-aspiration-can-add-t")) : "";
  const retire = aOpts.length ? note("a-retired-aspiration-is-held-by-no-one") + note("it-and-its-dead-ends-stay-readable") + note("you-cannot-bring-it-back-declare-it-again-instea")
    + cs.choice("ob-ret-asp", K("which-aspiration"), aOpts, {})
    + `<div class="cs-reason">${cs.field("ob-ret-taught", K("what-pursuing-it-taught"), { rec: true, area: true })}${help("ob-ret-taught", "taught", "aspirationretire")}${cs.act("aspirationretire")}</div>`
    + fold(K("when-retiring-is-refused"), gap("retiring-records-what-pursuing-it-taught", "write-it-and-try-again") + gap("an-aspiration-already-retired-cannot-be-retired")) : "";
  out.push(cs.sec(K("aspirations"), failed(d.aspirations) + `<p class="mk-small muted">${W(K("what-a-team-a-project-or-a-member-holds-itself-t"))} ${W(K("an-aspiration-is-not-a-measure-it-is-the-standar"))}</p>`
    + (rowsA.length ? cs.sheet(rowsA.join("")) : "") + lines.join("") + fold(K("declare-an-aspiration"), declare)
    + (depart ? fold(K("depart-from-the-team-s-aspiration"), depart) : "") + (deadEnd ? fold(K("record-a-dead-end"), deadEnd) : "") + (retire ? fold(K("retire-an-aspiration"), retire) : "")));

  /* the goals this objective serves: the goals the plane lists, each read for its statement, limit and state */
  const listed = val(d.goals) && Array.isArray(val(d.goals).bundles) ? val(d.goals).bundles.slice(0, 40) : [];
  const goals = listed.map((b) => val(ask("goal:" + b.bundle_id, "goal", { id: b.bundle_id }))).map((v) => v && v.goal).filter(Boolean);
  const open = goals.filter((g) => g.state === "open");
  /* R106 (K5157; WALK-FINAL-03b §13): each goal row lists the objectives linked to it, the project's name, who linked it and the day (`goalread`'s
     `objectives`: only those the viewer may see); a goal with none linked draws nothing more */
  const projectRead = val(ask("projects", "projectlist", { limit: "200" }));
  const names = new Map((projectRead && Array.isArray(projectRead.projects) ? projectRead.projects : []).filter((x) => x && x.id && x.name).map((x) => [String(x.id), String(x.name)]));
  const linked = (g) => (Array.isArray(g.objectives) ? g.objectives : []).filter((o) => o && o.project).map((o) =>
    `<span class="meta" data-objective-link="${cs.esc(String(o.project))}">${[data(names.get(String(o.project)) || T("screen.project.name")), o.by ? P.who(cs, o.by, founder) : "", day(o.at)].filter(Boolean).join(" · ")}</span>`).join("");
  const gRows = goals.map((g) => cs.row(cs.icon("status"), `<b class="mk-data">${cs.esc(g.statement || "")}</b><span class="meta">${[g.bounds ? data(g.bounds) : "", g.author ? P.who(cs, g.author, founder) : ""].filter(Boolean).join(" · ")}</span>${linked(g)}`,
    g.state === "closed" && g.closed_reason ? quote(g.closed_reason) : ""));
  const gOpts = open.map((g) => ({ value: String(g.id), text: String(g.statement || g.id) }));
  const openGoal = cs.field("ob-goal-st", K("what-it-pursues"), { rec: true, area: true }) + help("ob-goal-st", "statement", "goaldeclare")
    + cs.field("ob-goal-bd", K("what-limits-it"), { rec: true, area: true }) + help("ob-goal-bd", "bounds", "goaldeclare")
    + cs.choice("ob-goal-asp", K("under-which-aspiration-optional"), [{ value: "", text: "–" }, ...aOpts], {}) + cs.act("goaldeclare")
    + fold(K("when-a-goal-is-not-accepted"), gap("say-what-it-pursues-and-what-limits-it", "a-goal-is-not-opened-under-a-retired-aspiration"));
  const link = gOpts.length ? note("your-name-and-the-date-are-kept-with-the-link") + note("you-must-have-joined-this-project") + cs.choice("ob-goal-link", K("which-goal"), gOpts, {}) + cs.act("goallink")
    + fold(K("when-linking-is-refused"), gap("a-closed-goal-takes-no-new-objective", "choose-an-open-goal-or-open-a-new-one")) : "";
  const close = gOpts.length ? note("a-closed-goal-stays-readable-with-its-projects-a") + note("you-cannot-reopen-it") + cs.choice("ob-goal-cl", K("which-goal"), gOpts, {})
    + `<div class="cs-reason">${cs.field("ob-goal-why", K("why-it-closes"), { rec: true, area: true })}${help("ob-goal-why", "reason", "goalclose")}${cs.act("goalclose")}</div>`
    + fold(K("when-closing-is-refused"), gap("a-goal-closes-with-its-reason", "write-why-and-try-again") + gap("a-goal-already-closed-stays-as-it-is")) : "";
  out.push(cs.sec(K("goals-this-objective-serves"), failed(d.goals) + `<p class="mk-small muted">${W(K("a-goal-is-a-larger-aim-with-limits-that-several"))}</p>`
    + (gRows.length ? cs.sheet(gRows.join("")) : "") + fold(K("open-a-goal"), openGoal) + (link ? fold(K("say-this-objective-serves-a-goal"), link) : "") + (close ? fold(K("close-a-goal"), close) : "")));
  return out.join("");
}

/** The acts, each sending exactly the fields `intent` declares. The reason of an act whose own field carries her words is that field
 *  (`reasonField`, interface-shell R11): the shell sends nothing and says why when it is empty. */
const acts = [
  { op: "objectivecondition", label: "act.objectivecondition.label.objective", reasonField: "reason", rereads: ["progress", "gaps", "proposals"],
    send(view, el, cs) {
      const project = String(view.subject || "");
      const reason = String(cs.value("ob-why") || "").trim();
      if (el.dataset.mode === "stop") return { body: { project, condition: null, reason } };
      const text = (id) => String(cs.value(id) || "").trim();
      const share = text("ob-share"), progression = text("ob-flow"), entity = text("ob-ent");
      if (!progression || !entity || !/^\d{1,3}$/.test(share) || Number(share) < 1 || Number(share) > 100) return { refuse: "screen.objective.the-measure-names-a-flow-a-party-or-a-stage-the" };
      const stages = cs.value("ob-stages");
      const grade = text("ob-grade"), relation = text("ob-rel"), min = text("ob-min");
      const m = /^(\$)?\s*(\d[\d,]*(?:\.\d+)?)$/.exec(min);
      const condition = { progression, entity, required: { ...(grade ? { grade } : {}), stages: Array.isArray(stages) ? stages : [] }, satisfied: { share: Number(share) } };
      if (relation) condition.relation = relation;
      if (min) condition.filter = { amount: { min: m ? m[2].replace(/,/g, "") : min, ...(m && m[1] ? { currency: "USD" } : {}) } };
      return { body: { project, condition, reason } };
    } },
  { op: "triage", label: "act.triage.label.objective", rereads: ["proposals", "progress", "gaps"],
    send(view, el, cs) {
      const proposal = String(cs.value("ob-tr-pick") || "");
      const chosen = cs.value("ob-tr-do");
      const act = Array.isArray(chosen) ? chosen[0] : "";
      if (!proposal || !act) return { refuse: "screen.objective.what-to-do-with-it" };
      const reason = String(cs.value("ob-tr-why") || "").trim();
      return { body: { proposal, act, project: String(view.subject || ""), ...(reason ? { reason } : {}) } };
    } },
  { op: "aspirationdeclare", label: "act.aspirationdeclare.label.objective", reasonField: "statement", rereads: ["aspirations"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) {
      const statement = String(cs.value("ob-asp-st") || "").trim();
      if (!statement) return { refuse: "screen.objective.say-what-it-holds-to-and-name-only-parties-and-f" };
      const scope = String(cs.value("ob-asp-scope") || "project");
      const owner = scope === "project" ? String(view.subject || "") : scope === "member" ? String((view.me && view.me.member) || "") : "";
      const list = (id) => String(cs.value(id) || "").split(/[\s,;]+/).filter(Boolean);
      const entities = list("ob-asp-ent"), progressions = list("ob-asp-prog");
      return { body: { scope, ...(owner ? { owner } : {}), statement, ...(entities.length ? { entities } : {}), ...(progressions.length ? { progressions } : {}) } };
    } },
  { op: "aspirationdepart", label: "act.aspirationdepart.label.objective", reasonField: "reason", rereads: ["aspirations"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) {
      return { body: { project: String(view.subject || ""), aspiration: String(cs.value("ob-dep-asp") || ""), reason: String(cs.value("ob-dep-why") || "").trim() } };
    } },
  { op: "aspirationdeadend", label: "act.aspirationdeadend.label.objective", reasonField: "note", rereads: ["aspirations"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) { return { body: { aspiration: String(cs.value("ob-dea-asp") || ""), note: String(cs.value("ob-dea-note") || "").trim() } }; } },
  { op: "aspirationretire", label: "act.aspirationretire.label.objective", reasonField: "taught", rereads: ["aspirations"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) { return { body: { aspiration: String(cs.value("ob-ret-asp") || ""), taught: String(cs.value("ob-ret-taught") || "").trim() } }; } },
  { op: "goaldeclare", label: "act.goaldeclare.label.objective", reasonField: "statement", rereads: ["goals"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) {
      const statement = String(cs.value("ob-goal-st") || "").trim(), bounds = String(cs.value("ob-goal-bd") || "").trim();
      if (!statement || !bounds) return { refuse: "screen.objective.say-what-it-pursues-and-what-limits-it" };
      const aspiration = String(cs.value("ob-goal-asp") || "");
      return { body: { statement, bounds, ...(aspiration ? { aspiration } : {}) } };
    } },
  { op: "goallink", label: "act.goallink.label.objective", rereads: ["goals"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) { return { body: { goal: String(cs.value("ob-goal-link") || ""), project: String(view.subject || "") } }; } },
  { op: "goalclose", label: "act.goalclose.label.objective", reasonField: "reason", rereads: ["goals"],
    done(view, answer, cs) { cs.set("seq", (view.ui.seq || 0) + 1); },
    send(view, el, cs) { return { body: { goal: String(cs.value("ob-goal-cl") || ""), reason: String(cs.value("ob-goal-why") || "").trim() } }; } },
  /* the assistant's help with one field of her own words (wizard-scripts R27): nothing is kept until she saves; the draft is labelled machine work */
  { op: "writinghelp", label: "act.writinghelp.label.objective", rereads: [], reasonField: "told",
    send(view, el, cs) {
      view.ui.helpId = el.dataset.id;
      return { body: { field: el.dataset.field, told: String(cs.value(el.dataset.id) || "").trim() } };
    },
    done(view, answer, cs) {
      const a = answer && answer.result !== undefined ? answer.result : answer;
      if (a && typeof a.text === "string" && view.ui.helpId) cs.fill(view.ui.helpId, a.text, { label: "draft.machine.label" });
    } },
];

/** The keys the screen reads that the table holds (R44); `PENDING_WORDS` are the design's, drawn as themselves until written. */
const words = Object.freeze([
  "screen.objective.name", ...acts.map((a) => a.label),
  ...["success-is-reached-when-at-least-of-the-made-for", "this-objective-has-no-measure-of-success-yet-so", "choose-what-counts-and-the-screen-works-it-out-f",
    "set-how-success-is-measured", "say-which-payments-or-records-count-what-each-mu", "the-screen-then-counts-them-from-your-documents", "which-flow-of-events",
    "linked-to-it-as-optional", "only-amounts-of-at-least-optional", "leave-it-empty-to-count-every-amount", "a-top-amount-and-a-currency-can-be-given-too",
    "each-one-must-have-reached", "every-link-at-least-grade-optional", "share-that-must-meet-it-from-1-to-100-percent", "why-you-measure-it-this-way",
    "required-in-your-own-words", "it-stays-on-the-record-with-your-name", "stop-measuring-this-objective", "if-the-objective-or-the-party-you-chose-names-a",
    "you-can-still-go-on", "when-the-measure-is-not-accepted", "only-a-named-member-can-set-it-and-only-a-member", "if-you-have-not-joined-ask-to-join-first",
    "a-reason-is-required-also-to-remove-the-measure", "say-why-and-save-again", "the-measure-names-a-flow-a-party-or-a-stage-the", "choose-from-the-lists-and-save-again",
    "how-it-is-going", "rent-payments-meet-the-measure-are-short", "success-needs-so-it-is-not-yet-reached", "not-yet-decidable-of-the-short-payments-may-stil",
    "this-is-counted-again-each-time-you-open-the-scr", "not-counted-yet-no-measure-of-success-is-set", "what-is-still-short", "each-shortfall-is-also-offered-to-you-as-a-propo",
    "things-the-record-suggests-this-objective-should", "nothing-happens-until-a-member-decides", "a-shortfall-of-this-objective", "shown-by-the-machine", "a-missing-step-in",
    "what-to-do-with-it", "adopt-it-into-this-objective", "open-a-question-from-it", "adopting-adds-it-to-this-objective", "opening-a-question-starts-a-question-in-the-proj",
    "putting-it-off-or-dismissing-it-needs-a-reason", "why-required-to-put-it-off-or-dismiss-it", "when-a-proposal-is-not-accepted", "putting-it-off-or-dismissing-it-needs-a-reason-i",
    "write-one-and-decide-again", "that-proposal-is-no-longer-open-another-member-d", "a-decided-proposal-stays-readable-with-its-reaso", "you-can-act-on-a-proposal-only-in-a-project-you",
    "join-it-or-open-a-question-instead", "what-a-team-a-project-or-a-member-holds-itself-t", "an-aspiration-is-not-a-measure-it-is-the-standar", "held-by-the-whole-team",
    "this-project-departed-from-the-team-s-aspiration", "what-it-holds-to", "parties-it-concerns-optional", "flows-it-concerns-optional", "when-an-aspiration-is-not-accepted",
    "only-an-administrator-can-declare-change-or-reti", "ask-one-to-do-it", "a-member-s-own-aspiration-is-declared-by-that-me", "a-project-s-needs-a-member-who-has-joined-it",
    "say-what-it-holds-to-and-name-only-parties-and-f", "depart-from-the-team-s-aspiration", "this-project-stops-holding-to-the-team-s-aspirat", "the-team-s-aspiration-stays-as-it-is",
    "a-project-s-or-a-member-s-own-aspiration-cannot", "why-this-project-departs", "when-a-departure-is-not-accepted", "a-departure-records-why", "write-the-reason-and-save-again",
    "this-aspiration-is-retired-so-nothing-holds-to-i", "there-is-nothing-to-depart-from", "record-a-dead-end", "write-what-was-tried-and-why-it-went-nowhere",
    "it-is-added-with-your-name-and-the-date-and-it-i", "what-was-tried-and-why-it-went-nowhere", "dead-ends-so-far", "when-a-dead-end-is-not-accepted",
    "only-whoever-may-change-the-aspiration-can-add-t", "a-retired-aspiration-is-held-by-no-one", "it-and-its-dead-ends-stay-readable", "you-cannot-bring-it-back-declare-it-again-instea",
    "what-pursuing-it-taught", "when-retiring-is-refused", "retiring-records-what-pursuing-it-taught", "write-it-and-try-again", "an-aspiration-already-retired-cannot-be-retired",
    "goals-this-objective-serves", "a-goal-is-a-larger-aim-with-limits-that-several", "under-which-aspiration-optional", "when-a-goal-is-not-accepted", "say-what-it-pursues-and-what-limits-it",
    "a-goal-is-not-opened-under-a-retired-aspiration", "say-this-objective-serves-a-goal", "your-name-and-the-date-are-kept-with-the-link", "you-must-have-joined-this-project",
    "when-linking-is-refused", "a-closed-goal-takes-no-new-objective", "choose-an-open-goal-or-open-a-new-one", "a-closed-goal-stays-readable-with-its-projects-a", "you-cannot-reopen-it",
    "when-closing-is-refused", "a-goal-closes-with-its-reason", "write-why-and-try-again", "a-goal-already-closed-stays-as-it-is"].map((s) => "screen.objective." + s),
  "queue.objective-gap.detail.stages", "queue.objective-gap.detail.grade", "draft.machine.label", "shell.reason.needed", "state.empty", "state.loading", "state.failed", "shell.unread",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "refusal.INTENT_NO_SUCH_PROGRESSION", "screen.project.name", "member.founder.unnamed",
]);

/** A project's objective (interface-shell R21), with the module's shared readers as its parts. */
export function objectiveScreen(parts) {
  return Object.freeze({ id: "objective", reads, place, render, acts, words, parts });
}
