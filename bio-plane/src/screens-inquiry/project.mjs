/* screens-inquiry R1, R9–R11, R14, R16, R20, R21, R27–R30, R38–R40, R43, R44: the project screen (Projects › <project>;
 * registry screen `project`).
 *
 * Self-contained functions (interface-shell R21 (1)); the readers they share are the screen's `parts` (common.mjs). The
 * subject read is `projectstage` (R21): it answers a project she cannot see as absent, and one she sees only to exist as
 * `PROJECT_SEEN_NOT_A_PARTICIPANT` with its name and owners, so the not-joined state (R1) and an administrator's rescue
 * (R30, state c) are drawn, never "Nothing is here".
 *
 * The project's questions (R9): `projectquestions`, paged to the end by its `cursor`, each with its `inquirystrength`; a
 * project with none (state b) asks "Your first question" (R43). Its own bar (R10) by `strengthbarof`, set by
 * `projectbarset`. "Open a question" writes the inquiry and draws it into the project (R11); "Draw on a question from
 * elsewhere" chooses among the questions she may see (R16). "This project's work" (R27): its plans (`plans`), and the
 * calculations, standards and timeline its own references name. Who can find it (R28, `projectvisibility`); its members
 * and owners (R29, `projectparticipants`, `projectownervotes`), the founder unnamed by key (R40). Every sentence a key. */

/** R1, R9, R27–R30: the reads, each `{op, query}` as its owner documents it. */
function reads(view) {
  const id = String(view.subject || "");
  /* K3379 (D29): the founder (`whoami`'s member `admin`) sees every discoverable project whole, and project-roster
     answers her `projectdirectory` with a refusal inside a 200 (N1129): it is not asked for her, nor before `whoami` */
  const me = view.me && view.me.member;
  const directory = me && me !== "admin" ? { directory: { op: "projectdirectory", query: {} } } : {};
  return {
    stage: { op: "projectstage", query: { project: id }, subject: true },
    project: { op: "image", query: { id }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    participants: { op: "projectparticipants", query: { projectId: id } },
    bar: { op: "strengthbarof", query: { project: id } },
    /* an empty first page is drawn by the screen's own state b, or paged on while a cursor follows */
    questions: { op: "projectquestions", query: { project: id, limit: "100" }, empty: () => false },
    others: { op: "list", query: { type: "inquiry", limit: "500" } },
    account: { op: "projectaccountstate", query: { project: id } },
    visibility: { op: "projectvisibility", query: { projectId: id } },
    votes: { op: "projectownervotes", query: { projectId: id } },
    plans: { op: "plans", query: { project: id }, empty: (v) => !v || !(Array.isArray(v.plans) ? v.plans : v.items || []).length },
    ...directory,
  };
}

/** The path's project step: the project's title as read (R39: never its id). */
function place(view) {
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  const st = view.data && view.data.stage;
  const named = st && st.refusal && st.refusal.name ? String(st.refusal.name) : "";
  if (typeof text !== "string") return { project: { id: String(view.subject || ""), title: named } };
  const m = /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "");
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw value is drawn */ }
  return { project: { id: String(view.subject || ""), title: title || named } };
}

/** The project in its state: not joined, the rescue, or its work. */
function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui;
  const d = view.data || {};
  const P = view.parts;
  const W = (k, f) => cs.w(k, f);
  const T = (k, f) => P.plain(cs, k, f);
  const later = (key, op, query, token) => P.later(cs, ui, key, op, query, token);
  const doc = d.project && d.project.state === "ok" ? P.front(d.project.value["bundle.md"]) : null;
  /* a project she sees only to exist: its subject read refused PROJECT_SEEN_NOT_A_PARTICIPANT, read once more for the
     refusal's own fields (its `name` and `owners`, project-roster's existence answer) */
  const seenCode = ["stage", "participants", "bar", "account"].some((k) => d[k] && d[k].refusal && d[k].refusal.code === "PROJECT_SEEN_NOT_A_PARTICIPANT");
  const seenRead = seenCode ? later("seen", "projectstage", { project: id }) : null;
  const seen = seenCode ? Object.assign({ code: "PROJECT_SEEN_NOT_A_PARTICIPANT" }, (seenRead.refusal && seenRead.refusal.fields) || {}) : null;
  const listed = d.directory && d.directory.state === "ok" && Array.isArray(d.directory.value.projects)
    ? d.directory.value.projects.find((p) => p && p.id === id) : null;
  /* R39: the title read from the record (or the directory's, or the refusal's name), never its id */
  const title = (doc && doc.title) || (listed && (listed.name || listed.title)) || (seen && seen.name) || "";
  const out = [];
  out.push(cs.title(title || T("state.undetermined", { reason: "" }), { thing: "project" }));

  /* R30, state c: an administrator at a hidden project's existence only, whose owners are all inactive */
  if (seen && view.me && view.me.administer === true) {
    const aff = later("rescue", "affordances", { target: id });
    const roster = aff.state === "ok" && aff.value && aff.value.roster ? aff.value.roster : null;
    if (roster && roster.rescue_open === true) {
      const owners = (Array.isArray(seen.owners) ? seen.owners : []).map((o) => P.who(cs, o)).join(", ");
      out.push(cs.sec("project.rescue.title", `<p>${W("project.rescue.says", { owners })}</p>`
        + cs.field("project-rescue-why", "shell.reason", { area: true, rec: true, help: "shell.reason.help" })
        + cs.act("projectownerrescue", { label: "act.projectownerrescue.label.project", data: { project: id }, tone: "primary" })
        + `<p class="mk-small">${W("project.rescue.own")}</p>`, { fills: { date: roster.since ? { html: cs.date(String(roster.since), { year: true }) } : "" }, id: "state-rescue" }));
      return out.join("");
    }
    if (aff.state === "loading") { out.push(cs.state({ state: "loading" }, () => "")); return out.join(""); }
  }

  /* not joined (R1): she sees that it exists, and joins where she may */
  const me = view.me && view.me.handle;
  const notJoined = !!seen || !!listed;
  if (notJoined) {
    const owners = seen && Array.isArray(seen.owners) && seen.owners.length ? seen.owners.map((o) => P.who(cs, o)).join(", ") : "";
    out.push(cs.sec("screen.project.members.head",
      `<p>${W("screen.project.notjoined")}</p>${owners ? `<p>${W("screen.project.notjoined.owners", { owners })}</p>` : ""}`
      + cs.act("projectjoin", { label: "act.projectjoin.label.project", data: { project: id }, tone: "primary" })));
    return out.join("");
  }
  if (doc && doc.objective && doc.objective !== title)
    out.push(`<p class="mk-sub"><span class="mk-small">${W("screen.project.objective")}</span> ${cs.esc(doc.objective)}</p>`);
  const people = d.participants && d.participants.state === "ok" && Array.isArray(d.participants.value.participants)
    ? d.participants.value.participants.filter((x) => x && x.state !== "removed") : [];
  const mine = people.find((x) => x.handle && x.handle === me) || null;
  const joined = !!(mine && mine.state === "joined");
  const owner = !!(mine && Number(mine.owner) && mine.state === "joined");

  /* the stage (project-stage R2): a count is drawn only above zero (R20) */
  const counts = (q) => {
    const parts = [["read", q.read], ["legs", q.with_legs], ["concluded", q.concluded]].filter(([, n]) => Number(n) > 0)
      .map(([k, n]) => W("screen.project.stage." + k, { count: String(n) }));
    return parts.length ? `<p class="mk-small">${parts.join(" · ")}</p>` : "";
  };
  out.push(cs.sec("screen.project.stage.head", cs.state("stage", view, (s) => {
    const k = ["forming", "investigating", "matured", "closed"].includes(s.stage) ? s.stage : "undetermined";
    const steps = ["forming", "investigating", "matured", "closed"].map((x) =>
      `<span class="${x === k ? "on" : ""}"${x === k ? " aria-current=\"step\"" : ""}>${W("screen.project.stage." + x)}</span>`).join("");
    return `<div class="cs-ladder" data-ladder="stage">${steps}</div>`
      + (k === "undetermined" ? cs.mark("gap", "undetermined", { reason: s.detail || "" }) : "") + counts(s.questions || {});
  })));

  /* R10: the project's own bar, set by `projectbarset` to a joined member */
  const barAct = joined ? cs.act("projectbarset", { label: "act.projectbarset.label.project", data: { project: id } }) : "";
  const letters = () => [{ value: "", text: T("screen.project.bar.unset") }].concat(["A", "B", "C", "D"].map((g) => ({ value: g, text: g })));
  out.push(cs.sec("screen.project.bar.head", cs.state("bar", view, (bv) => {
    const bar = bv.bar || {};
    const declared = bar.declared === true && (bar.capture || bar.connection);
    const axis = (a) => (bar[a] ? cs.grade(a, bar[a]) : `<span data-axis-none="${a}">${W("screen.project.bar.axisnone", { axis: T("mark.scale." + a + ".name") })}</span>`);
    const said = declared ? `<p>${axis("capture")} ${axis("connection")}</p><p>${W("screen.project.bar.declared")}</p>`
      : `<p>${cs.mark("gap", "unrated")} ${W("screen.project.bar.none")}</p>`;
    return said + (barAct
      ? cs.choice("project-bar-capture", "mark.scale.capture.name", letters(), { value: declared && bar.capture ? bar.capture : "" })
        + cs.choice("project-bar-connection", "mark.scale.connection.name", letters(), { value: declared && bar.connection ? bar.connection : "" })
        + `<p class="mk-small">${W("screen.project.bar.help")}</p>` + barAct : "");
  })));

  /* R9: the project's questions, paged to the end; each a reference opening `question`, with its strength */
  const pages = [];
  let more = d.questions && d.questions.state === "ok" ? d.questions.value : null;
  let pending = !more && d.questions && d.questions.state === "loading", failed = null;
  const gen = String(ui.qgen || 0);
  for (let i = 0; more && i < 50; i++) {
    pages.push(...(Array.isArray(more.items) ? more.items : []));
    if (!more.cursor) { more = null; break; }
    const next = later("qpage:" + gen + ":" + more.cursor, "projectquestions", { project: id, after: String(more.cursor), limit: "100" });
    if (next.state === "loading") { pending = true; more = null; }
    else if (next.state === "failed") { failed = next; more = null; }
    else more = next.value;
  }
  const items = pages.filter((x) => x && x.inquiry);
  const firstQuestion = d.questions && d.questions.state === "ok" && !items.length && !pending && !failed;
  const nd = ui.notDrawn;
  const said = (ui.promoteRefusal ? `<p class="mk-msg" role="alert" data-refusal="promote">${ui.promoteRefusal.translation
      ? cs.esc(ui.promoteRefusal.translation) : W("state.failed", { reason: ui.promoteRefusal.code || "" })}</p>` : "")
    + (nd ? `<p class="mk-msg" role="alert" data-refusal="drawquestion">${W("screen.project.questions.notdrawn",
        { reason: nd.translation || nd.code || "" })} ${cs.ref("question", nd.id, nd.title || T("state.undetermined", { reason: "" }), [nd.title || ""])}</p>` : "");
  const adddoc = `<a class="cs-btn" data-tone="quiet" href="/app/capture/address/${cs.esc(id)}" data-nav data-adddoc="project">${W("project.adddoc")}</a>`;
  if (firstQuestion) {
    /* R43, state b: "Your first question", before "Open a question", sent as R11's two steps */
    out.push(cs.sec("project.firstquestion", cs.field("project-question", "project.firstquestion", { area: true, rec: true, help: "project.firstquestion.help" })
      + cs.act("promote", { label: "act.promote.label.project", data: { project: id }, tone: "primary" }) + said + adddoc, { id: "state-b" }));
  } else {
    const qInner = cs.state("questions", view, () => cs.sheet(items.map((x) => {
      const q = String(x.inquiry);
      const t = x.title || T("state.undetermined", { reason: "" });
      const st = later("strength:" + q, "inquirystrength", { id: q });
      const grades = cs.state(st, (s) => {
        const ax = (a) => (s[a] && s[a].state === "graded" ? cs.grade(a, s[a].grade)
          : cs.mark("gap", s[a] && s[a].state === "undetermined" ? "undetermined" : "unrated", { reason: (s[a] && s[a].detail) || "" }));
        return `<span class="cs-strength">${ax("capture")}${ax("connection")}</span>`;
      });
      return cs.row("", cs.ref("question", q, t, [t]), grades);
    }).join("")) + (pending ? cs.state({ state: "loading" }, () => "") : "") + (failed ? cs.state(failed, () => "") : ""));
    out.push(cs.sec("screen.project.questions.head", qInner
      + cs.field("project-question", "screen.project.question.label", { area: true, rec: true, help: "screen.project.question.help" })
      + cs.act("promote", { label: "act.promote.label.project", data: { project: id }, tone: "primary" }) + said
      + cs.act("findin", { label: "act.findin.label.project", data: { project: id } }) + adddoc));
  }

  /* R16: "Draw on a question from elsewhere", record data drawn as data (R8) */
  const drawAct = cs.act("drawquestion", { label: "act.drawquestion.label.project", data: { project: id } });
  if (drawAct) {
    const drawn = new Set(items.map((x) => String(x.inquiry)));
    const drawInner = cs.state("others", view, (v) => {
      const opts = (Array.isArray(v.bundles) ? v.bundles : []).filter((q) => q && q.bundle_id && !drawn.has(q.bundle_id) && q.title)
        .map((q) => ({ value: String(q.bundle_id), text: String(q.title) }));
      if (!opts.length) return "";
      return cs.choice("project-draw-question", "screen.project.draw.choose", opts, { value: opts[0].value })
        + cs.field("project-draw-note", "screen.project.draw.note", { rec: true, help: "screen.project.draw.help" }) + drawAct
        + (ui.drawSaid ? `<p class="mk-note" role="status" data-said="drawquestion">${W(ui.drawSaid)}</p>` : "");
    });
    if (drawInner) out.push(cs.sec("screen.project.draw.head", drawInner));
  }

  /* R27, R36: this project's work: its plans by name, and the calculations, standards and timeline its references name;
     a kind it has none of is not listed, and the section is not drawn when none is */
  const planList = d.plans && d.plans.state === "ok" ? (Array.isArray(d.plans.value.plans) ? d.plans.value.plans : d.plans.value.items || []) : [];
  const plans = planList.concat((Array.isArray(ui.plans) ? ui.plans : []).filter((p) => !planList.some((x) => x && (x.id || x.plan) === p.id)));
  const refs = doc ? (doc.lists.references || []).filter((r) => r && r.target && r.status !== "severed") : [];
  const work = [];
  for (const p of plans) if (p && (p.id || p.plan)) work.push(["plan", String(p.id || p.plan), String(p.title || T("state.undetermined", { reason: "" }))]);
  if (refs.some((r) => /^EVT-/.test(String(r.target)))) work.push(["timeline", id, T("screen.timeline.name")]);
  for (const r of refs) {
    const t = String(r.target);
    if (/^CALC-/.test(t)) work.push(["calculation", t, String(r.title || T("screen.calculation.name"))]);
    else if (/^STD-/.test(t)) work.push(["standard", t, String(r.title || T("screen.standard.name"))]);
  }
  if (work.length) out.push(cs.sec("project.work.title", cs.sheet(work.map(([kind, sid, label]) =>
    cs.row("", (() => { const h = String(cs.ref(kind, sid, label, [T("shell.card." + kind)])); return /^<a /.test(h) ? h : `<span class="rec">${cs.esc(label)}</span>`; })(), "")).join("")),
    { help: "project.work.help" }));
  /* the act that opens a plan, for one of the project's questions */
  const choices = items.map((x) => ({ value: String(x.inquiry), text: String(x.title || T("state.undetermined", { reason: "" })) }));
  if (choices.length) out.push(cs.sec("screen.project.plan.head", cs.field("project-plan", "screen.project.plan.label", {})
    + cs.choice("project-plan-about", "screen.project.plan.about", choices, {})
    + cs.act("planopen", { label: "act.planopen.label.project", data: { project: id } })));

  /* R28: who can find it, its history newest first, and an owner's act */
  out.push(cs.sec("project.visibility.title", cs.state("visibility", view, (v) => {
    const hist = (Array.isArray(v.history) ? v.history : []).slice();
    const setWord = (s) => T(s === "discoverable" ? "project.visibility.discoverable" : "project.visibility.hidden");
    const byOf = (x) => {
      const m = people.find((p) => p && p.member && p.member === x);
      return m ? P.who(cs, m) : P.who(cs, x);
    };
    const lines = hist.slice(1).reverse().map((h) => `<p class="mk-small" data-visibility="change">${W("project.visibility.history",
      { change: setWord(h.setting), who: byOf(h.set_by), date: { html: h.at ? cs.date(String(h.at), { year: true }) : "" }, reason: String(h.reason || "") })}</p>`);
    if (hist.length) lines.push(`<p class="mk-small" data-visibility="started">${W("project.visibility.started",
      { setting: setWord(hist[0].setting), date: { html: hist[0].at ? cs.date(String(hist[0].at), { year: true }) : "" } })}</p>`);
    return `<p data-visibility="${v.setting === "discoverable" ? "discoverable" : "hidden"}">${W(v.setting === "discoverable" ? "project.visibility.discoverable" : "project.visibility.hidden")}</p>`
      + lines.join("")
      + (owner ? cs.field("project-visibility-why", "shell.reason", { area: true, rec: true, help: "shell.reason.help" })
        + cs.act("projectvisibilityset", { label: "act.projectvisibilityset.label.project", data: { to: v.setting === "discoverable" ? "hidden" : "discoverable" } }) : "");
  })));

  /* what pays for the assistant here (credentials' projectaccountstate), and the project's AI screen (R14) */
  out.push(cs.sec("screen.project.account.head", cs.state("account", view, (a) => {
    const say = a.on === false && a.held ? "screen.project.account.off"
      : a.serving === "project" || (a.on && a.held) ? "screen.project.account.project" : "screen.project.account.member";
    return `<p>${W(say)}</p>`;
  }) + `<p class="mk-small">${W("screen.project.account.where")} <a class="cs-btn" data-tone="quiet" href="/app/projectai/${cs.esc(id)}" data-nav>${W("screen.projectai.name")}</a></p>`));

  /* R29: members, one row each with role and date (the founder unnamed by key, R40); owners' acts; changes waiting */
  out.push(cs.sec("screen.project.members.head", cs.state("participants", view, () => {
    const rows = people.map((x) => {
      const name = P.who(cs, x);
      const role = W(Number(x.owner) ? "project.member.owner" : "project.member.member");
      const since = x.since || x.joined_at || x.owner_since || null;
      const date = since ? W(Number(x.owner) ? "project.member.since" : "project.member.joined", { date: { html: cs.date(String(since), { year: true }) } }) : "";
      const self = x.handle && x.handle === me;
      const acts = self && Number(x.owner) ? cs.act("projectownerremove", { label: "act.projectownerremove.label.project", data: { handle: String(x.handle) } })
        : owner && !self && x.handle && x.state === "joined" ? (Number(x.owner) ? "" : cs.act("projectowneradd", { label: "act.projectowneradd.label.project", data: { handle: String(x.handle) } }))
          + cs.field("project-remove-why-" + x.handle, "shell.reason", { help: "shell.reason.help" })
          + cs.act("projectremove", { label: "act.projectremove.label.project", data: { handle: String(x.handle) } }) : "";
      return cs.row("", `<span class="rec">${cs.esc(name)}</span> · ${role}` + (x.state === "invited" ? " · " + W("screen.project.members.invited", { handle: "" }) : ""), acts, date);
    }).join("");
    /* changes waiting on owners (project-roster R30), and an owner who has not agreed agrees by the same act */
    const votes = d.votes && d.votes.state === "ok" && Array.isArray(d.votes.value.changes) ? d.votes.value.changes : [];
    const pend = ui.consensus ? votes.concat([ui.consensus]) : votes;
    const waiting = pend.map((c) => {
      const fills = { who: P.who(cs, c.target), by: P.who(cs, c.proposed_by), date: { html: c.proposed_at ? cs.date(String(c.proposed_at), { year: true }) : "" },
        agreed: (c.agreed || []).map((h) => P.who(cs, h)).join(", "), awaiting: (c.awaiting || []).map((h) => P.who(cs, h)).join(", ") };
      const mineToAgree = owner && (c.awaiting || []).includes(me);
      return `<p class="mk-small" data-pending="${c.change === "remove" ? "remove" : "add"}">${W(c.change === "remove" ? "project.owners.pending.remove" : "project.owners.pending", fills)}</p>`
        + (mineToAgree ? cs.act(c.change === "remove" ? "projectownerremove" : "projectowneradd", { label: c.change === "remove" ? "act.projectownerremove.label.project" : "project.owners.agree",
            fills: { who: fills.who }, data: { handle: String(c.target || "") } }) : "");
    }).join("");
    return (rows ? cs.sheet(rows) : "") + waiting + `<p class="mk-small">${W("project.owners.rule")}</p>`
      + `<p class="mk-small">${W("screen.project.members.who")}</p>`
      + (owner ? cs.field("project-invite", "screen.project.invite.label", {}) + cs.act("projectinvite", { label: "act.projectinvite.label.project", data: { project: id } }) : "")
      + (mine && mine.state === "invited" ? cs.act("projectjoin", { label: "act.projectjoin.label.project", data: { project: id } }) : "")
      + (joined ? cs.act("projectleave", { label: "act.projectleave.label.project", data: { project: id } }) : "")
      + (joined ? cs.field("project-fork-title", "project.start.title", { help: "project.start.title.help" })
        + cs.choice("project-fork-visibility", "project.visibility.title", [["hidden", "project.visibility.start.hidden"], ["discoverable", "project.visibility.start.discoverable"]], { value: "hidden" })
        + cs.act("projectfork", { label: "act.projectfork.label.project", data: { project: id } }) : "");
  })));
  return out.join("");
}

/** R1's, R10's, R11's, R16's and R27–R30's acts. `promote` writes its question itself (an id from `allocid`, then the
 *  package, then the draw), so its `send` sends nothing through the shell and draws its own outcome. */
const acts = [
  { op: "promote", label: "act.promote.label.project",
    send(view, el, cs) {
      const project = String(view.subject || "");
      const question = String(cs.value("project-question") || "").trim();
      if (!question) return { refuse: "screen.project.question.empty" };
      const title = question.replace(/\s+/g, " ").slice(0, 120);
      const res = (a) => (a && a.result !== undefined ? a.result : a);
      const fail = (a) => {
        const r = res(a);
        cs.set("promoteRefusal", { code: (r && (r.code || r.reason)) || (a && (a.code || a.reason)) || "", translation: r && r.translation });
      };
      cs.set("promoteRefusal", null);
      cs.set("notDrawn", null);
      const clock = new Date(cs.now());
      const year = String(clock.getUTCFullYear());
      cs.call("allocid", { query: { prefix: "INQ", year } }).then((a) => {
        const r = res(a);
        if (!r || !r.id) return fail(a);
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
        const id = r.id + (slug ? "-" + slug : "");
        const now = clock.toISOString().split(".")[0] + "Z";
        /* an inquiry document as record-grammar's inquiry grammar asks (HEADINGS.inquiry; first legal state `open`),
           stating its project (promotion R53); the headings are the grammar's, matched exactly (unkeyed) */
        const heads = ["## Question", "## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"];
        const lines = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title),
          "current_state: open", "prior_state: null", "created: " + now, "last_updated: " + now, "project: " + project,
          "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
          "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
          "surfaced_by: human", "recheck_triggers:", "  - text: " + JSON.stringify(view.parts.plain(cs, "file.recheck.revisit")),
          "    description: " + JSON.stringify(view.parts.plain(cs, "file.recheck.none")), "---", ""];
        heads.forEach((h, i) => { lines.push(h, ""); if (i === 0) lines.push(question, ""); });
        const text = lines.join("\n");
        const stamp = now.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        return cs.call("promote", { body: { bundleId: id, base: null, snapKey: stamp,
          meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now },
          files: [{ path: "bundle.md", text }] } }).then((p) => {
          const pr = res(p);
          if (!p || p.ok === false || !pr || pr.ok === false) return fail(p);
          /* R11: the project draws on it at once (citation R14); a refusal is said here, the question staying open */
          const notDrawn = (x) => {
            const xr = res(x) || {};
            cs.set("notDrawn", { id, title, code: String(xr.code || xr.reason || (x && (x.code || x.reason)) || ""), translation: xr.translation || "" });
          };
          return cs.call("drawquestion", { query: { project, inquiry: id, note: "" } }).then((x) => {
            const xr = res(x);
            if (!x || x.ok === false || !xr || xr.ok === false) return notDrawn(x);
            cs.go("question", id);
          }, () => notDrawn(null));
        });
      }, () => fail(null));
      return null;
    } },
  { op: "drawquestion", label: "act.drawquestion.label.project", reasonField: "note", rereads: ["questions"],
    send(view, el, cs) {
      const inquiry = String(cs.value("project-draw-question") || "").trim();
      const note = String(cs.value("project-draw-note") || "").trim();
      if (!inquiry || !note) return { refuse: "screen.project.draw.empty" };
      cs.set("drawSaid", null);
      return { query: { project: String(view.subject || ""), inquiry, note }, raw: "" };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const already = !!(r && Array.isArray(r.alreadyCited) && r.alreadyCited.length && !(Array.isArray(r.cited) && r.cited.length));
      cs.set("qgen", (view.ui.qgen || 0) + 1);
      cs.set("drawSaid", already ? "screen.project.draw.already" : "screen.project.draw.done");
    } },
  { op: "findin", label: "act.findin.label.project",
    send(view, el, cs) { cs.go("find-in", String(view.subject || "")); return null; } },
  { op: "projectbarset", label: "act.projectbarset.label.project", rereads: ["bar"],
    send(view, el, cs) {
      const body = { project: String(view.subject || "") };
      for (const a of ["capture", "connection"]) {
        const g = String(cs.value("project-bar-" + a) || "");
        if (["A", "B", "C", "D"].includes(g)) body[a] = g;
      }
      return { body };
    } },
  { op: "projectinvite", label: "act.projectinvite.label.project", rereads: ["participants"],
    send(view, el, cs) {
      const handle = String(cs.value("project-invite") || "").trim().replace(/^@/, "");
      if (!handle) return { refuse: "screen.project.invite.empty" };
      return { query: { projectId: String(view.subject || ""), handle } };
    } },
  { op: "projectjoin", label: "act.projectjoin.label.project",
    send(view) { return { query: { projectId: String(view.subject || "") } }; } },
  { op: "planopen", label: "act.planopen.label.project", reasonField: "title", rereads: ["plans"],
    send(view, el, cs) {
      const title = String(cs.value("project-plan") || "").trim();
      const inquiry = String(cs.value("project-plan-about") || "").trim();
      if (!title || !inquiry) return { refuse: "screen.project.plan.empty" };
      return { body: { project: String(view.subject || ""), title, subjects: [{ kind: "inquiry", inquiry }] } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (!r || !r.id) return;
      cs.set("plans", (Array.isArray(view.ui.plans) ? view.ui.plans : []).concat([{ id: String(r.id), title: String(r.title || "") }]));
    } },
  /* R28: an owner's change of who can find it, with her reason (in the query, where project-roster reads it) */
  { op: "projectvisibilityset", label: "act.projectvisibilityset.label.project", rereads: ["visibility"],
    send(view, el, cs) {
      const reason = String(cs.value("project-visibility-why") || "").trim();
      if (!reason) return { refuse: "shell.reason.needed" };
      return { query: { projectId: String(view.subject || ""), setting: String(el.dataset.to || "hidden"), reason }, raw: "" };
    } },
  /* R29: an owner stands down (or agrees to another's standing down), with her reason in the query */
  { op: "projectownerremove", label: "act.projectownerremove.label.project", rereads: ["participants", "votes"],
    send(view, el) { return { query: { projectId: String(view.subject || ""), handle: String(el.dataset.handle || "") }, raw: "" }; } },
  /* R29: make an owner (or agree to it, the same act sent by her); a consensus still owed redraws the pending line */
  { op: "projectowneradd", label: "act.projectowneradd.label.project", rereads: ["participants", "votes"],
    send(view, el) { return { query: { projectId: String(view.subject || ""), handle: String(el.dataset.handle || "") } }; },
    refusals: { CONSENSUS_REQUIRED: (r, cs) => cs.w("project.owners.pending", { who: String((r && r.handle) || ""), by: "", date: "",
      agreed: ((r && r.have) || []).join(", "), awaiting: ((r && r.awaiting) || []).join(", ") }) } },
  /* R29: remove a member, her reason asked and shown, not refused when empty (membership R36) */
  { op: "projectremove", label: "act.projectremove.label.project", rereads: ["participants"],
    send(view, el, cs) {
      const handle = String(el.dataset.handle || "");
      const comment = String(cs.value("project-remove-why-" + handle) || "").trim();
      return { query: { projectId: String(view.subject || ""), handle, ...(comment ? { comment } : {}) } };
    } },
  { op: "projectleave", label: "act.projectleave.label.project", rereads: ["participants"],
    send(view) { return { query: { projectId: String(view.subject || "") } }; } },
  /* R29: start a project from this one, with its title and who can find it (hidden preselected); the new one opened */
  { op: "projectfork", label: "act.projectfork.label.project",
    send(view, el, cs) {
      const title = String(cs.value("project-fork-title") || "").trim();
      if (!title) return { refuse: "project.start.title.help" };
      const visibility = cs.value("project-fork-visibility") === "discoverable" ? "discoverable" : "hidden";
      return { query: { projectId: String(view.subject || ""), title, visibility } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      if (r && r.newId) cs.go("project", String(r.newId));
    } },
  /* R30: an administrator becomes its owner, naming herself, with her reason (in the query) */
  { op: "projectownerrescue", label: "act.projectownerrescue.label.project", reasonField: "reason",
    send(view, el, cs) {
      const reason = String(cs.value("project-rescue-why") || "").trim();
      return { query: { projectId: String(view.subject || ""), handle: String((view.me && view.me.handle) || ""), reason }, raw: "" };
    } },
];

/** The keys the project screen may draw (R44: keys only). */
const words = Object.freeze([
  "screen.project.name", "screen.project.purpose", "screen.projectai.name",
  ...["promote", "drawquestion", "findin", "projectbarset", "projectinvite", "projectjoin", "planopen", "projectvisibilityset",
    "projectownerremove", "projectowneradd", "projectremove", "projectleave", "projectfork", "projectownerrescue"]
    .map((op) => "act." + op + ".label.project"),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.grade.reading", "mark.strength.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "mark.gap.unrated.name", "mark.gap.unrated.means", "state.empty", "state.loading", "state.failed", "state.undetermined",
  "member.founder.unnamed", "shell.reason", "shell.reason.help", "shell.reason.needed", "file.recheck.revisit", "file.recheck.none",
  "screen.timeline.name", "screen.calculation.name", "screen.standard.name",
  "shell.card.plan", "shell.card.timeline", "shell.card.calculation", "shell.card.standard",
  "project.work.title", "project.work.help", "project.visibility.title", "project.visibility.hidden", "project.visibility.discoverable",
  "project.visibility.history", "project.visibility.started", "project.visibility.start.hidden", "project.visibility.start.discoverable",
  "project.member.owner", "project.member.member", "project.member.since", "project.member.joined", "project.owners.pending",
  "project.owners.pending.remove", "project.owners.agree", "project.owners.rule", "project.rescue.title", "project.rescue.says",
  "project.rescue.own", "project.firstquestion", "project.firstquestion.help", "project.adddoc", "project.start.title", "project.start.title.help",
  ...["objective", "stage.head", "stage.forming", "stage.investigating", "stage.matured", "stage.closed", "stage.read", "stage.legs",
    "stage.concluded", "bar.head", "bar.declared", "bar.axisnone", "bar.none", "bar.unset", "bar.help", "questions.head",
    "questions.notdrawn", "draw.head", "draw.choose", "draw.note", "draw.help", "draw.empty", "draw.already", "draw.done",
    "question.label", "question.help", "question.empty", "account.head", "account.project", "account.member", "account.off",
    "account.where", "members.head", "members.invited", "members.who", "invite.label", "invite.empty", "notjoined",
    "notjoined.owners", "plan.label", "plan.about", "plan.empty", "plan.head"].map((k) => "screen.project." + k),
]);

/** The project screen (interface-shell R21), with the module's shared readers as its parts. */
export function projectScreen(parts) {
  return Object.freeze({ id: "project", reads, place, render, acts, words, parts });
}
