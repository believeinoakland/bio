/* screens-inquiry R1: the project screen (Projects › <project>; registry screen `project`, its 6 acts).
 *
 * Every function here is self-contained (interface-shell R21 (1)): it refers only to its parameters, the kit `cs` and
 * the language's own globals, because the shell composes the page's script from each function's `toString()`. So the
 * small readers (the project document's front matter, a lazy read) are written inside the function that uses them.
 *
 * The project's questions (R1): `basis-versions` R41's own test, the inquiries the project's document cites with an
 * edge not marked `severed`, read from `image` of the project; their titles from `list` (`type=inquiry`), which answers
 * no project per row (J4 (1)); each one's strength by `inquirystrength`, read as the row is drawn. */

import { ownRows } from "./words.mjs";

/** R1: the reads, each `{op, query}` as its owner documents it (survey on `tranche/T46`, J4). */
function reads(view) {
  const id = String(view.subject || "");
  return {
    project: { op: "image", query: { id }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    stage: { op: "projectstage", query: { project: id } },
    participants: { op: "projectparticipants", query: { projectId: id } },
    bar: { op: "strengthbarof", query: { project: id } },
    questions: { op: "list", query: { type: "inquiry", limit: "500" },
                 empty: (v) => !v || !Array.isArray(v.bundles) || v.bundles.length === 0 },
    account: { op: "projectaccountstate", query: { project: id } },
    directory: { op: "projectdirectory", query: {} },
  };
}

/** R8's project step: the project's title as read. */
function place(view) {
  const d = view.data && view.data.project;
  const text = d && d.state === "ok" && d.value && d.value["bundle.md"];
  if (typeof text !== "string") return { project: { id: String(view.subject || ""), title: String(view.subject || "") } };
  const m = /^title:\s*(.*)$/m.exec(text.split(/\n---\s*\n/)[0] || "");
  let title = m ? m[1].trim() : "";
  try { if (title.startsWith("\"")) title = JSON.parse(title); } catch { /* the raw value is drawn */ }
  return { project: { id: String(view.subject || ""), title: title || String(view.subject || "") } };
}

/** R1, R5: the project, its stage and bar, its questions with their strength, what pays for the assistant, its members,
 *  and its acts, each drawn by `cs.act` (absent when the session may not do it, interface-shell R12). */
function render(cs, view) {
  const id = String(view.subject || "");
  const ui = view.ui;
  /* the document's front matter: top-level scalars, and the `references` list as {target, rel, status} */
  const front = (text) => {
    const out = { refs: [] };
    if (typeof text !== "string") return out;
    const head = text.replace(/^---\s*\n/, "").split(/\n---\s*(\n|$)/)[0];
    let inRefs = false, cur = null;
    for (const line of head.split("\n")) {
      if (/^references:\s*$/.test(line)) { inRefs = true; continue; }
      if (inRefs && /^\s+-\s*/.test(line)) { cur = {}; out.refs.push(cur); }
      if (inRefs && /^\s+/.test(line) && cur) {
        const m = /^\s+(?:-\s*)?(\w+):\s*(.*)$/.exec(line);
        if (m) cur[m[1]] = m[2].trim();
        continue;
      }
      inRefs = false;
      const m = /^(\w+):\s*(.*)$/.exec(line);
      if (m) {
        let v = m[2].trim();
        try { if (v.startsWith("\"")) v = JSON.parse(v); } catch { /* raw */ }
        out[m[1]] = v;
      }
    }
    return out;
  };
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

  /* the stage (project-stage R2), and the bar (strength's `strengthbarof`) as two grades, never one score */
  out.push(cs.sec("screen.project.stage.head", cs.state("stage", view, (s) => {
    const k = ["forming", "investigating", "matured", "closed"].includes(s.stage) ? s.stage : "undetermined";
    const steps = ["forming", "investigating", "matured", "closed"].map((x) =>
      `<span class="${x === k ? "on" : ""}"${x === k ? " aria-current=\"step\"" : ""}>${cs.w("screen.project.stage." + x)}</span>`).join("");
    const q = s.questions || {};
    return `<div class="cs-ladder" data-ladder="stage">${steps}</div>`
      + (k === "undetermined" ? cs.mark("gap", "undetermined", { reason: s.detail || "" }) : "")
      + `<p class="cs-meta">${cs.w("screen.project.stage.counts", { read: q.read || 0, with_legs: q.with_legs || 0, concluded: q.concluded || 0 })}</p>`;
  })));
  out.push(cs.sec("screen.project.bar.head", cs.state("bar", view, (b) => {
    const bar = b.bar || {};
    const said = bar.declared && (bar.capture || bar.connection)
      ? `<p>${cs.grade("capture", bar.capture || "")}${cs.grade("connection", bar.connection || "")} ${cs.w("screen.project.bar.declared", { capture: bar.capture || "", connection: bar.connection || "" })}</p>`
      : `<p>${cs.mark("gap", "unrated")} ${cs.w("screen.project.bar.none")}</p>`;
    /* not drawn in T46: `strengthbarset`, which sets the group's bar, not the project's (K3003; N976) */
    return said;
  })));

  /* the questions: the project's own `cites` edges to inquiries, not severed (basis-versions R41's test) */
  const cited = doc ? doc.refs.filter((r) => /^INQ-/.test(String(r.target || "")) && r.rel === "cites"
                                             && r.status !== "severed").map((r) => r.target) : [];
  const qInner = cs.state("questions", view, (v) => {
    const titles = {};
    for (const b of v.bundles || []) if (b && b.bundle_id) titles[b.bundle_id] = b.title || b.bundle_id;
    if (!cited.length) return `<p>${cs.w("screen.project.questions.empty")}</p>`;
    return cs.sheet(cited.map((q) => {
      const st = later("strength:" + q, "inquirystrength", { id: q });
      const grades = cs.state(st, (s) => {
        const ax = (a) => (s[a] && s[a].state === "graded" ? cs.grade(a, s[a].grade)
                                                         : cs.mark("gap", s[a] && s[a].state === "undetermined" ? "undetermined" : "unrated", { reason: (s[a] && s[a].detail) || "" }));
        return `<span class="cs-strength" title="">${ax("capture")}${ax("connection")}</span>`;
      });
      const facts = [titles[q] || q];
      return cs.row("", cs.ref("question", q, titles[q] || q, facts), grades);
    }).join(""));
  }, { empty: "screen.project.questions.empty" });
  const fieldQ = cs.field("project-question", "screen.project.question.label", { area: true, rec: true, help: "screen.project.question.help" });
  out.push(cs.sec("screen.project.questions.head", qInner + fieldQ
    + cs.act("promote", { label: "act.promote.label.project", data: { project: id }, tone: "primary" })
    + (ui.promoteRefusal ? `<p class="cs-refusal" role="alert" data-refusal="promote">${ui.promoteRefusal.translation
        ? cs.esc(ui.promoteRefusal.translation) : cs.w("state.failed", { reason: ui.promoteRefusal.code || "" })}</p>` : "")
    + cs.act("findin", { label: "act.findin.label.project", data: { project: id } })
    + (ui.promoted ? `<p class="cs-note">${cs.w("screen.project.questions.notcited")}</p>` : "")));

  /* plans: opened here; the plan screen is T47's, so the screen says the plan was opened and lists it */
  const plans = Array.isArray(ui.plans) ? ui.plans : [];
  /* a choice's option is [value, word key]; a question's title, record data, stands in the key's place (the kit draws an
     unknown key as itself, escaped): J6's kit gap */
  const qTitles = d.questions && d.questions.state === "ok" && Array.isArray(d.questions.value.bundles)
    ? Object.fromEntries(d.questions.value.bundles.map((b) => [b.bundle_id, b.title || b.bundle_id])) : {};
  const choices = cited.map((q) => [q, qTitles[q] || q]);
  out.push(cs.sec("screen.project.plan.head",
    (plans.length ? cs.sheet(plans.map((p) => cs.row("", `<span class="cs-rec">${cs.esc(p.title)}</span>`, `<span class="cs-meta">${cs.esc(p.id)}</span>`)).join("")) : "")
    + cs.field("project-plan", "screen.project.plan.label", {})
    + cs.choice("project-plan-about", "screen.project.plan.about", choices, {})
    + cs.act("planopen", { label: "act.planopen.label.project", data: { project: id } })));

  /* what pays for the assistant here (credentials' projectaccountstate), read-only: its screen is T47's */
  out.push(cs.sec("screen.project.account.head", cs.state("account", view, (a) => {
    const say = a.on === false && a.held ? "screen.project.account.off"
      : a.serving === "project" || (a.on && a.held) ? "screen.project.account.project" : "screen.project.account.member";
    return `<p>${cs.w(say)}</p><p class="cs-meta">${cs.w("screen.project.account.later")}</p>`;
  })));

  /* members: participants by handle, owners marked; invite and join */
  const me = view.me && view.me.handle;
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

/** R1's acts (five in T46: `strengthbarset` is not drawn, K3003). `promote` writes its question itself (an id from
 *  `allocid`, then the package), so its `send` sends
 *  nothing through the shell and draws its own outcome; the others answer `{query, body}` for the shell to send. */
const acts = [
  { op: "promote", label: "act.promote.label.project",
    send(view, el, cs) {
      const project = String(view.subject || "");
      const question = String(cs.value("project-question") || "").trim();
      if (!question) return { refuse: "screen.project.question.empty" };
      const title = question.replace(/\s+/g, " ").slice(0, 120);
      const fail = (a) => {
        const r = a && a.result !== undefined ? a.result : a;
        cs.set("promoteRefusal", { code: (r && (r.code || r.reason)) || (a && (a.code || a.reason)) || "", translation: r && r.translation });
      };
      const clock = new Date(cs.now());
      const year = String(clock.getUTCFullYear());
      cs.call("allocid", { query: { prefix: "INQ", year } }).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
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
          const pr = p && p.result !== undefined ? p.result : p;
          if (!p || p.ok === false || !pr || pr.ok === false) return fail(p);
          cs.set("promoted", id);
          cs.go("question", id);
        });
      }, () => fail(null));
      return null;
    } },
  { op: "findin", label: "act.findin.label.project",
    send(view, el, cs) { cs.go("find-in", String(view.subject || "")); return null; } },
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
  "screen.project.name", "screen.project.purpose",
  "act.promote.label.project", "act.promote.does", "act.findin.label.project", "act.findin.does",
"act.projectinvite.label.project", "act.projectinvite.does",
  "act.projectjoin.label.project", "act.projectjoin.does", "act.planopen.label.project", "act.planopen.does",
  "mark.scale.capture.name", "mark.scale.capture.means", "mark.scale.connection.name", "mark.scale.connection.means",
  "mark.grade.reading", "mark.strength.means", "mark.gap.undetermined.name", "mark.gap.undetermined.means",
  "mark.gap.unrated.name", "mark.gap.unrated.means", "state.empty", "state.loading", "state.failed",
  ...ownRows("screen.project."),
];

/** The project screen (interface-shell R21). */
export const PROJECT_SCREEN = Object.freeze({ id: "project", reads, place, render, acts, words });
