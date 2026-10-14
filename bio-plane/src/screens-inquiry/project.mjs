/* screens-inquiry R1: the project screen (Projects › <project>; registry screen `project`, its 7 acts).
 *
 * Every function here is self-contained (interface-shell R21 (1)): it refers only to its parameters, the kit `cs` and
 * the language's own globals, because the shell composes the page's script from each function's `toString()`. So the
 * small readers (the project document's front matter, a lazy read) are written inside the function that uses them.
 *
 * The project's questions (R9): `projectquestions` (`basis-versions` R50), each `{inquiry, title}`, paged to the end by
 * its `cursor`; each one's strength by `inquirystrength`, read as the row is drawn. The project's own bar (R10) as
 * `strengthbarof` answers it for the project, set by `projectbarset` (`strength` R40), never the group's
 * `strengthbarset`. "Open a question" writes the inquiry and then draws it into the project (`drawquestion`,
 * `citation` R14; R11), and "Draw on a question from elsewhere" draws one the member chooses among those she may see
 * (`list`, `type=inquiry`; R16). A choice among record data is `cs.choice` over `{value, text}` options (R8). The
 * project's AI account is its own screen, `projectai` (R14), linked here. */

import { ownRows } from "./words.mjs";

/** R1, R9: the reads, each `{op, query}` as its owner documents it. */
function reads(view) {
  const id = String(view.subject || "");
  return {
    project: { op: "image", query: { id }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    stage: { op: "projectstage", query: { project: id } },
    participants: { op: "projectparticipants", query: { projectId: id } },
    bar: { op: "strengthbarof", query: { project: id } },
    questions: { op: "projectquestions", query: { project: id, limit: "100" } },
    others: { op: "list", query: { type: "inquiry", limit: "500" } },
    account: { op: "projectaccountstate", query: { project: id } },
    directory: { op: "projectdirectory", query: {} },
  };
}

/** The path's project step: the project's title as read (interface-shell R8). */
function place(view) {
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  if (typeof text !== "string") return { project: { id: String(view.subject || ""), title: String(view.subject || "") } };
  const m = /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "");
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw value is drawn */ }
  return { project: { id: String(view.subject || ""), title: title || String(view.subject || "") } };
}

/** R1, R5, R9–R11, R14, R16: the project, its stage and its own bar, its questions with their strength, the two ways a
 *  question comes into it, its plans, what pays for the assistant, its members, and its acts, each drawn by `cs.act`
 *  (absent when the session may not do it, interface-shell R12). */
function render(cs, view) {
  const id = String(view.subject || "");
  const ui = view.ui;
  /* the document's front matter: top-level scalars */
  const front = (text) => {
    const out = {};
    if (typeof text !== "string") return out;
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    for (const line of head.split("\n")) {
      const m = /^(\w+):\s*(.*)$/.exec(line);
      if (!m) continue;
      let v = m[2].trim();
      try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* raw */ }
      out[m[1]] = v;
    }
    return out;
  };
  /* a word as plain text, for record-data options and fills (the kit escapes both, interface-shell R5, R27) */
  const T = (k, f) => String(cs.w(k, f)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
  /* a read made as the screen draws: once per key, its outcome kept in the screen's memory and drawn on arrival */
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
  const d = view.data || {};
  const doc = d.project && d.project.state === "ok" ? front(d.project.value["bundle.md"]) : null;
  const notJoined = ["project", "stage", "participants", "bar"].some((k) =>
    d[k] && d[k].refusal && d[k].refusal.code === "PROJECT_SEEN_NOT_A_PARTICIPANT")
    || (d.directory && d.directory.state === "ok" && Array.isArray(d.directory.value.projects)
        && d.directory.value.projects.some((p) => p && p.id === id));
  const title = doc ? (doc.title || id) : id;
  const out = [];
  out.push(cs.title(title, { thing: "project" }));
  if (doc && doc.objective && doc.objective !== title)
    out.push(`<p class="cs-sub"><span class="cs-label">${cs.w("screen.project.objective")}</span> ${cs.esc(doc.objective)}</p>`);

  if (notJoined) {
    const owners = (() => {
      for (const k of ["project", "participants", "stage", "bar"]) {
        const r = d[k] && d[k].refusal;
        if (r && Array.isArray(r.owners) && r.owners.length) return r.owners.join(", ");
      }
      return "";
    })();
    out.push(cs.sec("screen.project.members.head",
      `<p>${cs.w("screen.project.notjoined")}</p>${owners ? `<p>${cs.w("screen.project.notjoined.owners", { owners })}</p>` : ""}`
      + cs.act("projectjoin", { label: "act.projectjoin.label.project", data: { project: id }, tone: "primary" })));
    return out.join("");
  }
  /* a member who has joined (not merely invited) sets the project's bar (R10) */
  const me = view.me && view.me.handle;
  const joined = d.participants && d.participants.state === "ok" && Array.isArray(d.participants.value.participants)
    && d.participants.value.participants.some((x) => x && x.handle === me && x.state === "joined");

  /* the stage (project-stage R2) */
  out.push(cs.sec("screen.project.stage.head", cs.state("stage", view, (s) => {
    const k = ["forming", "investigating", "matured", "closed"].includes(s.stage) ? s.stage : "undetermined";
    const steps = ["forming", "investigating", "matured", "closed"].map((x) =>
      `<span class="${x === k ? "on" : ""}"${x === k ? " aria-current=\"step\"" : ""}>${cs.w("screen.project.stage." + x)}</span>`).join("");
    const q = s.questions || {};
    return `<div class="cs-ladder" data-ladder="stage">${steps}</div>`
      + (k === "undetermined" ? cs.mark("gap", "undetermined", { reason: s.detail || "" }) : "")
      + `<p class="cs-meta">${cs.w("screen.project.stage.counts", { read: q.read || 0, with_legs: q.with_legs || 0, concluded: q.concluded || 0 })}</p>`;
  })));

  /* R10: the project's own bar as `strengthbarof` answers it for the project: a declared axis by its letter, an
     undeclared one in words, no bar as absent (never as zero); set by `projectbarset`, never the group's bar */
  const barAct = joined ? cs.act("projectbarset", { label: "act.projectbarset.label.project", data: { project: id } }) : "";
  const letters = () => [{ value: "", text: T("screen.project.bar.unset") }].concat(["A", "B", "C", "D"].map((g) => ({ value: g, text: g })));
  out.push(cs.sec("screen.project.bar.head", cs.state("bar", view, (b) => {
    const bar = b.bar || {};
    const declared = bar.declared === true && (bar.capture || bar.connection);
    const axis = (a) => (bar[a] ? cs.grade(a, bar[a]) : `<span data-axis-none="${a}">${cs.w("screen.project.bar.axisnone", { axis: T("mark.scale." + a + ".name") })}</span>`);
    const said = declared
      ? `<p>${axis("capture")} ${axis("connection")}</p><p>${cs.w("screen.project.bar.declared")}</p>`
      : `<p>${cs.mark("gap", "unrated")} ${cs.w("screen.project.bar.none")}</p>`;
    return said + (barAct
      ? cs.choice("project-bar-capture", "mark.scale.capture.name", letters(), { value: declared && bar.capture ? bar.capture : "" })
        + cs.choice("project-bar-connection", "mark.scale.connection.name", letters(), { value: declared && bar.connection ? bar.connection : "" })
        + `<p class="cs-meta">${cs.w("screen.project.bar.help")}</p>` + barAct
      : "");
  })));

  /* R9: the project's questions from `projectquestions`, paged to the end by its cursor; each a reference opening
     `question`, with its strength */
  const pages = [];
  let more = d.questions && d.questions.state === "ok" ? d.questions.value : null;
  let pending = false, failed = null;
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
  const qInner = cs.state("questions", view, () => {
    if (!items.length && !pending) return `<p>${cs.w("screen.project.questions.empty")}</p>`;
    return cs.sheet(items.map((x) => {
      const q = String(x.inquiry);
      const t = x.title || q;
      const st = later("strength:" + q, "inquirystrength", { id: q });
      const grades = cs.state(st, (s) => {
        const ax = (a) => (s[a] && s[a].state === "graded" ? cs.grade(a, s[a].grade)
                                                         : cs.mark("gap", s[a] && s[a].state === "undetermined" ? "undetermined" : "unrated", { reason: (s[a] && s[a].detail) || "" }));
        return `<span class="cs-strength" title="">${ax("capture")}${ax("connection")}</span>`;
      });
      return cs.row("", cs.ref("question", q, t, [t]), grades);
    }).join("")) + (pending ? cs.state({ state: "loading" }, () => "") : "") + (failed ? cs.state(failed, () => "") : "");
  }, { empty: "screen.project.questions.empty" });
  /* R11: "Open a question" writes it and draws it into the project; a refused draw is said beside the act, the
     question staying open on its own screen */
  const nd = ui.notDrawn;
  const fieldQ = cs.field("project-question", "screen.project.question.label", { area: true, rec: true, help: "screen.project.question.help" });
  out.push(cs.sec("screen.project.questions.head", qInner + fieldQ
    + cs.act("promote", { label: "act.promote.label.project", data: { project: id }, tone: "primary" })
    + (ui.promoteRefusal ? `<p class="cs-refusal" role="alert" data-refusal="promote">${ui.promoteRefusal.translation
        ? cs.esc(ui.promoteRefusal.translation) : cs.w("state.failed", { reason: ui.promoteRefusal.code || "" })}</p>` : "")
    + (nd ? `<p class="cs-refusal" role="alert" data-refusal="drawquestion">${cs.w("screen.project.questions.notdrawn",
        { reason: nd.translation || nd.code || "" })} ${cs.ref("question", nd.id, nd.title || nd.id, [nd.title || nd.id])}</p>` : "")
    + cs.act("findin", { label: "act.findin.label.project", data: { project: id } })));

  /* R16: "Draw on a question from elsewhere": a choice among the questions she may see that the project does not yet
     draw on, record data drawn as data (R8) */
  const drawAct = cs.act("drawquestion", { label: "act.drawquestion.label.project", data: { project: id } });
  if (drawAct) {
    const drawn = new Set(items.map((x) => String(x.inquiry)));
    const drawInner = cs.state("others", view, (v) => {
      const opts = (Array.isArray(v.bundles) ? v.bundles : []).filter((b) => b && b.bundle_id && !drawn.has(b.bundle_id))
        .map((b) => ({ value: String(b.bundle_id), text: String(b.title || b.bundle_id) }));
      if (!opts.length) return `<p>${cs.w("screen.project.draw.none")}</p>`;
      return cs.choice("project-draw-question", "screen.project.draw.choose", opts, { value: opts[0].value })
        + cs.field("project-draw-note", "screen.project.draw.note", { rec: true, help: "screen.project.draw.help" }) + drawAct
        + (ui.drawSaid ? `<p class="cs-note" role="status" data-said="drawquestion">${cs.w(ui.drawSaid)}</p>` : "");
    }, { empty: "screen.project.draw.none" });
    out.push(cs.sec("screen.project.draw.head", drawInner));
  }

  /* plans: opened here; the plan screen is screens-action's, so the screen says the plan was opened and lists it */
  const plans = Array.isArray(ui.plans) ? ui.plans : [];
  const choices = items.map((x) => ({ value: String(x.inquiry), text: String(x.title || x.inquiry) }));
  out.push(cs.sec("screen.project.plan.head",
    (plans.length ? cs.sheet(plans.map((p) => cs.row("", `<span class="cs-rec">${cs.esc(p.title)}</span>`, `<span class="cs-meta">${cs.esc(p.id)}</span>`)).join("")) : "")
    + cs.field("project-plan", "screen.project.plan.label", {})
    + cs.choice("project-plan-about", "screen.project.plan.about", choices, {})
    + cs.act("planopen", { label: "act.planopen.label.project", data: { project: id } })));

  /* what pays for the assistant here (credentials' projectaccountstate), and the project's AI screen (R14) */
  out.push(cs.sec("screen.project.account.head", cs.state("account", view, (a) => {
    const say = a.on === false && a.held ? "screen.project.account.off"
      : a.serving === "project" || (a.on && a.held) ? "screen.project.account.project" : "screen.project.account.member";
    return `<p>${cs.w(say)}</p>`;
  }) + `<p class="cs-meta">${cs.w("screen.project.account.where")} <a class="cs-btn" data-tone="quiet" href="/app/projectai/${cs.esc(id)}" data-nav>${cs.w("screen.projectai.name")}</a></p>`));

  /* members: participants by handle, owners marked; invite and join */
  out.push(cs.sec("screen.project.members.head", cs.state("participants", view, (p) => {
    const list = (p.participants || []).filter((x) => x && x.state !== "removed");
    const mine = list.find((x) => x.handle === me);
    const names = list.length
      ? `<p>${list.map((x) => (x.owner ? cs.w("screen.project.members.owner", { handle: x.handle })
          : x.state === "invited" ? cs.w("screen.project.members.invited", { handle: x.handle }) : cs.esc(x.handle))).join(", ")}</p>`
      : `<p>${cs.w("screen.project.members.empty")}</p>`;
    return names + `<p class="cs-meta">${cs.w("screen.project.members.who")}</p>`
      + cs.field("project-invite", "screen.project.invite.label", {})
      + cs.act("projectinvite", { label: "act.projectinvite.label.project", data: { project: id } })
      + (mine && mine.state === "invited" ? cs.act("projectjoin", { label: "act.projectjoin.label.project", data: { project: id } }) : "");
  })));
  return out.join("");
}

/** R1's acts, R10's `projectbarset` and R11's and R16's `drawquestion`. `promote` writes its question itself (an id
 *  from `allocid`, then the package, then the draw), so its `send` sends nothing through the shell and draws its own
 *  outcome; the others answer `{query, body}` for the shell to send. */
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
           stating its project (promotion R53) */
        const heads = ["## Question", "## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"];
        const lines = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title),
          "current_state: open", "prior_state: null", "created: " + now, "last_updated: " + now, "project: " + project,
          "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
          "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
          "surfaced_by: human", "recheck_triggers:", "  - text: Revisit this",
          "    description: A member set no specific trigger at creation; replace this with a real one.", "---", ""];
        heads.forEach((h, i) => { lines.push(h, ""); if (i === 0) lines.push(question, ""); });
        const text = lines.join("\n");
        const stamp = now.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
        return cs.call("promote", { body: { bundleId: id, base: null, snapKey: stamp,
          meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now },
          files: [{ path: "bundle.md", content: text }] } }).then((p) => {
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
  /* R16: a question she chooses, with her note on why (its own words are its reason, interface-shell R11, DEC-88); a
     question already drawn on is answered `alreadyCited` and said so */
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
  /* R10: both axes, either, or neither (withdrawing the bar), with the member's reason (the shell's reason field, its
     weight's, interface-shell R11), in the body as `strength` R40 takes it */
  { op: "projectbarset", label: "act.projectbarset.label.project", rereads: ["bar"],
    send(view, el, cs) {
      const body = { project: String(view.subject || "") };
      for (const a of ["capture", "connection"]) {
        const g = String(cs.value("project-bar-" + a) || "");
        if (["A", "B", "C", "D"].includes(g)) body[a] = g;
      }
      return { body };
    } },
  { op: "projectinvite", label: "act.projectinvite.label.project",
    send(view, el, cs) {
      const handle = String(cs.value("project-invite") || "").trim().replace(/^@/, "");
      if (!handle) return { refuse: "screen.project.invite.empty" };
      return { query: { projectId: String(view.subject || ""), handle } };
    } },
  { op: "projectjoin", label: "act.projectjoin.label.project",
    send(view) { return { query: { projectId: String(view.subject || "") } }; } },
  { op: "planopen", label: "act.planopen.label.project", reasonField: "title",
    send(view, el, cs) {
      const title = String(cs.value("project-plan") || "").trim();
      const inquiry = String(cs.value("project-plan-about") || "").trim();
      if (!title || !inquiry) return { refuse: "screen.project.plan.empty" };
      return { body: { project: String(view.subject || ""), title, subjects: [{ kind: "inquiry", inquiry }] } };
    },
    done(view, answer, cs) {
      const r = answer && answer.result !== undefined ? answer.result : answer;
      const plans = (Array.isArray(view.ui.plans) ? view.ui.plans : []).concat([{ id: (r && r.id) || "", title: (r && r.title) || "" }]);
      cs.set("plans", plans);
    } },
];

/** The keys the project screen may draw (interface-shell R5, R21 (1)). */
const words = [
  "screen.project.name", "screen.project.purpose", "screen.projectai.name",
  ...["promote", "drawquestion", "findin", "projectbarset", "projectinvite", "projectjoin", "planopen"]
    .flatMap((op) => ["act." + op + ".label.project", "act." + op + ".does"]),
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.grade.reading", "mark.strength.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "mark.gap.unrated.name", "mark.gap.unrated.means", "state.empty", "state.loading", "state.failed",
  ...ownRows("screen.project."),
];

/** The project screen (interface-shell R21). */
export const PROJECT_SCREEN = Object.freeze({ id: "project", reads, place, render, acts, words });
