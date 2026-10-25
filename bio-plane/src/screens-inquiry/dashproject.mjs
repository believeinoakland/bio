/* screens-inquiry R79 (T51-119; DEC-214 (2), (4); `interface-shell` R44; `screens-daily` R51): a project's dashboard (registry
 * screen `dash-project`, at `/app/dash-project/<project>`; Home's Investigation block opens it).
 *
 * In the drawing's order, each section only when its read answers (R20) and a read that failed drawn failed:
 *   the head (the title, then the objective, the owner by handle and the stage; `projectstage`, `projectparticipants`);
 *   "Next for you here" (`cs.path`): photos she captured and has not vouched for (`heldcaptures` with her `member`, the act
 *   `release`), a newer version of a document one of the project's questions rests on (her pushed notice in `queue`, the acts
 *   `adoptversion` and `keepversion`), and the ceremony when the project's draft case holds findings that meet the bar
 *   (`casedrafts`, `reviewcopy`'s findings, `publishpreflight`);
 *   "This project at a glance" (`cs.reading`): Questions with how many meet the bar (`projectquestions`, `inquirystrength`
 *   against `strengthbarof`), Events (`timeline` over the project's set) and Members (`projectparticipants`); no Documents
 *   reading, no read answers it (Private, Suggestions);
 *   "The story so far" (`cs.storyline`) from `timeline`; "Activity" (`cs.initials`, `cs.activity`) from `projectlist`.
 * A project she is not in draws R60's states; a name is a handle, the unnamed founder by `member.founder.unnamed` (R40); no
 * record id is a title (R39). Self-contained functions (interface-shell R21 (1)); the shared readers are the screen's `parts`.
 * Fix round 3 (T51): the queue is asked within the door's bound, 200 (C66; R79); a member the reads name is drawn by her handle, never her id (C94; R40). */

import { named } from "./question.mjs";

/** R79: the reads, each `{op, query}` as its owner documents it. */
function reads(view) {
  const id = String(view.subject || "");
  /* K3379 (D29): the founder (`whoami`'s member `admin`) is not asked for `projectdirectory` (answered by a refusal in a 200) */
  const me = view.me && view.me.member;
  const directory = me && me !== "admin" ? { directory: { op: "projectdirectory", query: {} } } : {};
  const held = (v) => !v || !Array.isArray(v.held) || !v.held.length;
  return {
    stage: { op: "projectstage", query: { project: id }, subject: true },
    project: { op: "image", query: { id }, empty: (v) => !v || typeof v !== "object" || !v["bundle.md"] },
    participants: { op: "projectparticipants", query: { projectId: id } },
    bar: { op: "strengthbarof", query: { project: id } },
    questions: { op: "projectquestions", query: { project: id, limit: "100" }, empty: () => false },
    /* C66: the queue is asked within the door's bound (`queue` R6: a limit of 1 to 500, default 200; the walk saw `limit=500` answered 400, and the
       fix round caps the ask at 200): the default and the cap, 200 */
    queue: { op: "queue", query: { limit: "200" }, empty: (v) => !v || !Array.isArray(v.items) || !v.items.length },
    drafts: { op: "casedrafts", query: { project: id }, empty: (v) => !v || !Array.isArray(v.drafts) || !v.drafts.length },
    /* G12a (fix round 6): both lists are picker rows (a document's id, its place, its capture's digest are all this screen reads of them); the full row
       examines every capture with no recorded format, which cost a page seconds */
    docs: { op: "heldcaptures", query: { project: id, limit: "200", fields: "picker" }, empty: held },
    ...(me ? { mine: { op: "heldcaptures", query: { project: id, member: String(me), limit: "500", fields: "picker" }, empty: held } } : {}),
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

/** The dashboard. */
function render(cs, view) {
  const id = String(view.subject || "");
  if (!id) return "";
  const ui = view.ui;
  const d = view.data || {};
  const P = view.parts;
  const W = (k, f) => cs.w(k, f);
  const T = (k, f) => P.plain(cs, k, f);
  /* C94 (R40): a member the reads name is drawn by her handle (the kit's `cs.memberName`), the unnamed founder and any member with no
     handle known by a plain word, never the id; `P.who` is the fallback where the kit holds no `memberName` */
  const whoIs = (x, founder) => P.named(cs, x, founder, P.who);
  /* a read the screen makes as it draws, once for its request (`req` is `{query}` or `{body}`); a failed one keeps only its
     own words, never a code */
  const ask = (key, op, req) => {
    const L = ui.later || (ui.later = {});
    const q = JSON.stringify(req || {});
    if (!L[key] || L[key].q !== q) {
      L[key] = { q, state: "loading" };
      const settle = (o) => { L[key] = Object.assign({ q }, o); cs.set("later", L); };
      cs.call(op, req || {}).then((a) => {
        const r = a && a.result !== undefined ? a.result : a;
        if (!a || a.ok === false || (r && r.ok === false)) {
          const f = r && r.ok === false ? r : a || {};
          settle({ state: "failed", refusal: { code: String(f.code || f.reason || ""), words: f.translation ? cs.esc(f.translation) : "", fields: f } });
        } else if (r && r.found === false) settle({ state: "empty" });
        else settle({ state: "ok", value: r });
      }, () => settle({ state: "failed", refusal: null }));
    }
    return L[key];
  };
  const failedState = (r) => cs.state(r, () => "");
  const doc = d.project && d.project.state === "ok" ? P.front(d.project.value["bundle.md"]) : null;
  /* R60: a project she sees only to exist (its subject read refused PROJECT_SEEN_NOT_A_PARTICIPANT), read once more for the
     refusal's own fields (its `name` and `owners`) */
  const seenCode = ["stage", "participants", "bar"].some((k) => d[k] && d[k].refusal && d[k].refusal.code === "PROJECT_SEEN_NOT_A_PARTICIPANT");
  const seenRead = seenCode ? ask("seen", "projectstage", { query: { project: id } }) : null;
  const seen = seenCode ? Object.assign({ code: "PROJECT_SEEN_NOT_A_PARTICIPANT" }, (seenRead.refusal && seenRead.refusal.fields) || {}) : null;
  const listed = d.directory && d.directory.state === "ok" && Array.isArray(d.directory.value.projects)
    ? d.directory.value.projects.find((p) => p && p.id === id) : null;
  const title = (doc && doc.title) || (listed && (listed.name || listed.title)) || (seen && seen.name) || "";
  const out = [cs.title(title || T("state.undetermined", { reason: "" }), { thing: "project" })];
  const me = view.me && view.me.handle;
  const roster = d.participants && d.participants.state === "ok" && Array.isArray(d.participants.value.participants)
    ? d.participants.value.participants.find((x) => P.isMe(view, x)) : null;
  const invited = !!(roster && roster.state === "invited");
  if (seen || listed || invited) {
    const owners = seen && Array.isArray(seen.owners) && seen.owners.length ? seen.owners.map((o) => whoIs(o)).join(", ") : "";
    if (!invited && !listed) return out.join("") + P.unavailable(cs);
    /* the registry lists no `projectjoin`, `projectrequest` or `projectrequestwithdraw` on `dash-project` (REPORT): the ask is
       the project page's own (`project`), which this page opens */
    out.push(cs.sec("screen.project.members.head",
      `<p>${W("screen.project.notjoined")}</p>${owners ? `<p>${W("screen.project.notjoined.owners", { owners })}</p>` : ""}`
      + `<p>${cs.ref("project", id, title || T("state.undetermined", { reason: "" }), [])}</p>`));
    return out.join("");
  }

  const people = d.participants && d.participants.state === "ok" && Array.isArray(d.participants.value.participants)
    ? d.participants.value.participants.filter((x) => x && x.state !== "removed") : [];
  const active = people.filter((x) => x.state === "joined" || x.state === "leaving");

  /* the head: the objective, its owner by handle and its stage, in one line */
  const STAGES = ["forming", "investigating", "matured", "closed"];
  const stage = d.stage && d.stage.state === "ok" && d.stage.value ? d.stage.value.stage : null;
  const owners = active.filter((x) => Number(x.owner)).map((x) => whoIs(x)).filter(Boolean);
  const line = [];
  if (doc && doc.objective && doc.objective !== title) line.push(`<span class="rec">${cs.esc(doc.objective)}</span>`);
  if (owners.length) line.push(W("screen.projects.owner", { handle: owners.join(", ") }));
  if (STAGES.includes(stage)) line.push(W("screen.project.stage." + stage));
  else if (d.stage && d.stage.state === "ok") line.push(cs.mark("gap", "undetermined", { reason: (d.stage.value && d.stage.value.detail) || "" }));
  if (d.stage && d.stage.state === "failed") line.push(failedState(d.stage));
  if (line.length) out.push(`<p class="mk-sub">${line.join(" · ")}</p>`);

  /* the project's questions, paged to the end (`projectquestions`), each with its strength */
  const pages = [];
  let more = d.questions && d.questions.state === "ok" ? d.questions.value : null;
  let qPending = !more && d.questions && d.questions.state === "loading", qFailed = d.questions && d.questions.state === "failed" ? d.questions : null;
  for (let i = 0; more && i < 50; i++) {
    pages.push(...(Array.isArray(more.items) ? more.items : []));
    if (!more.cursor) { more = null; break; }
    const next = ask("qpage:" + more.cursor, "projectquestions", { query: { project: id, after: String(more.cursor), limit: "100" } });
    if (next.state === "loading") { qPending = true; more = null; } else if (next.state === "failed") { qFailed = next; more = null; } else more = next.value;
  }
  const items = pages.filter((x) => x && x.inquiry);

  /* "Next for you here": the steps no read supports are not drawn */
  const steps = [];
  const failed = [];
  let pending = false;
  /* (1) photos she captured and has not vouched for, one step for each place the held captures state */
  const mine = d.mine;
  if (mine && mine.state === "failed") failed.push(mine);
  if (mine && mine.state === "loading") pending = true;
  if (mine && mine.state === "ok" && Array.isArray(mine.value.held)) {
    const groups = [];
    for (const r of mine.value.held) {
      const docId = r && (r.bundle_id || r.document);
      const s = r && r.source;
      const at = s && typeof s.address === "string" && s.address && s.via !== "upload" && !/^upload:/.test(s.address) ? s.address : "";
      if (!docId) continue;
      const g = groups.find((x) => x.place === at) || (groups.push({ place: at, ids: [] }), groups[groups.length - 1]);
      g.ids.push(String(docId));
    }
    groups.forEach((g, i) => {
      const f = "dp-vouch-" + i;
      const button = cs.act("release", { label: "act.release.label.dash-project", data: { ids: g.ids.join(","), f }, tone: "primary" });
      if (!button) return;
      /* a capture with no place (an upload) is vouched for in a step of its own, by the keys that say no place */
      const text = g.place ? (g.ids.length === 1 ? { key: "screen.dash-project.next.vouch.one", fills: { place: g.place } }
          : { key: "screen.dash-project.next.vouch", fills: { count: String(g.ids.length), place: g.place } })
        : g.ids.length === 1 ? { key: "screen.dash-project.next.vouch.noplace.one" }
        : { key: "screen.dash-project.next.vouch.noplace", fills: { count: String(g.ids.length) } };
      steps.push({ text,
        act: `<details class="mk-details"><summary>${W("act.release.label.dash-project")}</summary>`
          + cs.field(f + "-ack", "screen.held.ack", { help: "screen.held.ackhelp", max: 500 })
          + cs.field(f + "-mitigation", "screen.held.mitigation", { help: "screen.held.mitigationhelp", max: 500 }) + button + "</details>" });
    });
  }
  /* (2) a newer version of a document one of this project's questions rests on: her pushed notice, decided here */
  const q = d.queue;
  if (q && q.state === "failed") failed.push(q);
  if (q && q.state === "loading") pending = true;
  if (q && q.state === "ok" && Array.isArray(q.value.items)) {
    const mineQ = new Set(items.map((x) => String(x.inquiry)));
    q.value.items.forEach((it, i) => {
      if (!it || it.kind !== "newer-capture-affects-reference") return;
      const s = it.subject || {};
      const anc = it.case && Array.isArray(it.case.ancestors) ? it.case.ancestors : [];
      if (!(anc.some((a) => a && a.id === id) || mineQ.has(String(s.holder || "")))) return;
      if (typeof s.id !== "string" || !s.id || typeof s.target !== "string" || !s.target) return;
      const t = ask("doctitle:" + s.target, "image", { query: { id: s.target } });
      if (t.state === "loading") { pending = true; return; }
      const name = t.state === "ok" && t.value && t.value["bundle.md"] ? P.front(t.value["bundle.md"]).title : "";
      const f = "dp-why-" + i;
      const adopt = cs.act("adoptversion", { label: "act.adoptversion.label.dash-project", data: { notice: s.id, f } });
      const keep = cs.act("keepversion", { label: "act.keepversion.label.dash-project", data: { notice: s.id } });
      if (!adopt && !keep) return;
      steps.push({ text: { key: "screen.dash-project.next.newer", fills: { document: name || T("state.undetermined", { reason: "" }) } },
        act: (adopt ? `<details class="mk-details"><summary>${W("act.adoptversion.label.dash-project")}</summary>`
          + cs.field(f + "-why", "shell.reason", { area: true, rec: true, help: "shell.reason.help" }) + adopt + "</details>" : "") + keep });
    });
  }
  /* (3) the ceremony, when the project's draft case holds findings that meet the bar */
  const dr = d.drafts;
  if (dr && dr.state === "failed") failed.push(dr);
  if (dr && dr.state === "loading") pending = true;
  if (dr && dr.state === "ok" && Array.isArray(dr.value.drafts) && dr.value.drafts.length) {
    const draft = dr.value.drafts[dr.value.drafts.length - 1];
    const edition = draft && draft.case && draft.case.edition !== undefined && draft.case.edition !== null ? String(draft.case.edition) : "";
    if (draft && draft.draft_id && edition) {
      const copy = ask("draftcopy", "reviewcopy", { query: { draft: String(draft.draft_id) } });
      if (copy.state === "failed") failed.push(copy);
      if (copy.state === "loading") pending = true;
      const targets = copy.state === "ok" && Array.isArray(copy.value.findings) ? copy.value.findings.map((f) => f && f.target).filter(Boolean) : [];
      if (targets.length) {
        const c = copy.value.case || {};
        const body = { draft: String(draft.draft_id), project: copy.value.project || id, targets, ...(c.case_id && !c.newCase ? { caseId: c.case_id } : { newCase: true }) };
        const pre = ask("draftpreflight", "publishpreflight", { body });
        if (pre.state === "failed") failed.push(pre);
        if (pre.state === "loading") pending = true;
        if (pre.state === "ok" && pre.value && pre.value.ready === true) {
          const list = Array.isArray(pre.value.steps) ? pre.value.steps : [];
          const pin = list.find((x) => x && typeof x === "object" && Array.isArray(x.pinned));
          const n = pin ? pin.pinned.length : 0;
          if (n > 0) steps.push({ text: { key: "screen.dash-project.next.prepare", fills: { edition, count: String(n) } },
            act: cs.ref("ceremony", id, T("screen.dash-project.next.prepare.label", { n: edition }), []) });
        }
      }
    }
  }
  if (steps.length) steps[0].now = true;
  if (steps.length || failed.length || pending) {
    out.push(cs.sec("screen.dash-project.next.heading", (steps.length ? cs.path(steps) : "")
      + failed.map(failedState).join("") + (pending && !steps.length ? cs.state({ state: "loading" }, () => "") : ""), { help: "screen.dash-project.tip.next" }));
  }

  /* the timeline over the project's set (events R28), which this screen resolves as `screens-investigate` R3 does: the people,
     organisations and events its document cites, and the capture digests of its documents (at most 200) */
  const refs = doc ? (doc.lists.references || []).filter((r) => r && r.target && r.status !== "severed") : [];
  const set = [...new Set(refs.filter((r) => /^(ENT|EVT)-/.test(String(r.target))).map((r) => String(r.target)))];
  const docRows = d.docs && d.docs.state === "ok" && Array.isArray(d.docs.value.held) ? d.docs.value.held : [];
  const shas = docRows.map((r) => r && r.capture && r.capture.sha256).filter(Boolean).slice(0, 200);
  const tq = {};
  if (set.length) tq.set = set.join(",");
  if (shas.length) tq.captures = shas.join(",");
  const docsFailed = d.docs && d.docs.state === "failed" ? d.docs : null;
  const docsPending = d.docs && d.docs.state === "loading";
  const tl = !docsFailed && !docsPending && (set.length || shas.length) ? ask("timeline", "timeline", { query: tq }) : null;
  const world = tl && tl.state === "ok" ? tl.value.world || {} : {};
  const worldItems = Array.isArray(world.items) ? world.items : [];
  const nowhere = Array.isArray(world.placed_nowhere) ? world.placed_nowhere : [];
  const ours = tl && tl.state === "ok" && tl.value.ours && Array.isArray(tl.value.ours.sources) ? tl.value.ours.sources : [];
  const ourItems = ours.flatMap((s) => (Array.isArray(s.items) ? s.items : []).filter((x) => x && !x.placed_nowhere));

  /* "This project at a glance": a reading only for a figure a read gives */
  const tiles = [];
  /* Questions: the count, and how many meet the bar (`inquirystrength` against `strengthbarof`) */
  if (qFailed) tiles.push(failedState(qFailed));
  else if (qPending) tiles.push(cs.state({ state: "loading" }, () => ""));
  else if (items.length) {
    const bar = d.bar && d.bar.state === "ok" && d.bar.value && d.bar.value.bar ? d.bar.value.bar : null;
    const barOf = bar && (bar.capture || bar.connection) && bar.declared !== false ? bar : null;
    const rank = { A: 4, B: 3, C: 2, D: 1 };
    let met = 0, settled = true;
    /* G12c: one `inquirystrength` read for the questions (for each 50), as the project page reads them */
    const strengthOf = barOf ? P.strengths((k, query) => ask(k, "inquirystrength", { query }), items.map((x) => x.inquiry), cs.esc) : null;
    if (barOf) for (const x of items) {
      const s = strengthOf(String(x.inquiry));
      if (s.state !== "ok") { settled = false; continue; }
      const sv = s.value || {};
      if (["capture", "connection"].every((a) => !barOf[a] || (sv[a] && sv[a].state === "graded" && rank[sv[a].grade] >= rank[barOf[a]]))) met++;
    }
    tiles.push(cs.reading({ label: "screen.dash-project.tile.questions", value: String(items.length),
      change: barOf && settled && met > 0 ? { key: "screen.home.area.meetbar", fills: { count: String(met) } } : null }));
  }
  /* Events: the count the timeline answers, and how many are undetermined in order (the world lane's, `order.undetermined`) */
  if (tl && tl.state === "failed") tiles.push(failedState(tl));
  else if (tl && tl.state === "ok" && worldItems.length + nowhere.length + ourItems.length > 0)
  {
    const undetermined = worldItems.filter((it) => it && it.order && it.order.undetermined).length;
    tiles.push(cs.reading({ label: "screen.dash-project.tile.events", value: String(worldItems.length + nowhere.length + ourItems.length),
      change: undetermined > 0 ? { key: "screen.dash-project.tile.events.undetermined", fills: { n: String(undetermined) } } : null }));
  }
  /* Members: the count, with their handles in words */
  if (d.participants && d.participants.state === "failed") tiles.push(failedState(d.participants));
  else if (active.length) {
    const names = active.map((x) => whoIs(x)).filter(Boolean);
    tiles.push(cs.reading({ label: "screen.dash-project.tile.members", value: String(active.length), change: names.length ? { text: names.join(", ") } : null }));
  }
  if (tiles.length) out.push(cs.sec("screen.dash-project.glance.heading", `<div class="mk-tiles">${tiles.join("")}</div>`));

  /* "The story so far": what they did above the line, what the team did below it; an event with no whole date is never
     placed, and what is undetermined in order is said, never guessed */
  if (docsFailed) out.push(cs.sec("screen.dash-project.story.heading", failedState(docsFailed), { help: "screen.dash-project.tip.story" }));
  else if (tl && tl.state === "loading") out.push(cs.sec("screen.dash-project.story.heading", cs.state({ state: "loading" }, () => ""), { help: "screen.dash-project.tip.story" }));
  else if (tl && tl.state === "failed") out.push(cs.sec("screen.dash-project.story.heading", failedState(tl), { help: "screen.dash-project.tip.story" }));
  else if (tl && tl.state === "ok") {
    const whole = (w) => w && ["day", "minute", "second"].includes(w.precision) ? String(w.value || w.start || "") : "";
    const events = worldItems.filter((it) => it && it.kind && whole(it.when)).map((it) => ({ date: whole(it.when), text: { key: "screen.timeline.kind", fills: { kind: String(it.kind) } } }))
      .concat(ourItems.filter((x) => x && x.at && x.label).map((x) => ({ date: String(x.at), text: { text: String(x.label) }, us: true })))
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).slice(-6);
    const open = worldItems.filter((it) => it && it.order && it.order.undetermined);
    const kinds = open.map((it) => it.kind).filter(Boolean).map(String);
    const precisions = [...new Set(open.map((it) => it.when && it.when.precision).filter(Boolean))];
    const sayOpen = open.length ? (kinds.length === open.length && precisions.length === 1 && ["day", "minute", "second", "edtf"].includes(precisions[0])
      ? cs.mark("gap", "undetermined", { reason: W("screen.dash-project.story.undetermined", { events: kinds.join(", "), precision: T("screen.dash-project.precision." + precisions[0]) }) })
      : cs.mark("gap", "undetermined")) : "";
    if (events.length || sayOpen) out.push(cs.sec("screen.dash-project.story.heading", (events.length ? cs.storyline(events, { open: { screen: "timeline", subject: id } }) : "") + sayOpen,
      { help: "screen.dash-project.tip.story" }));
  }

  /* "Activity": who works on it and how busy it is, as `projectlist` answers them for this project */
  let row = null, listFailed = null, listPending = false, after = "";
  for (let i = 0; i < 50; i++) {
    const r = ask("plist:" + i, "projectlist", { query: after ? { limit: "200", after } : { limit: "200" } });
    if (r.state === "loading") { listPending = true; break; }
    if (r.state === "failed") { listFailed = r; break; }
    const v = r.state === "ok" ? r.value : null;
    row = v && Array.isArray(v.projects) ? v.projects.find((p) => p && p.id === id) || null : null;
    if (row) break;
    if (v && v.truncated && v.next) { after = String(v.next); continue; }
    break;
  }
  if (listFailed) out.push(cs.sec("screen.dash-project.activity.heading", failedState(listFailed)));
  else if (listPending) out.push(cs.sec("screen.dash-project.activity.heading", cs.state({ state: "loading" }, () => "")));
  else if (row) {
    const names = Array.isArray(row.members) ? row.members.map((m) => whoIs(m)).filter(Boolean) : [];
    const weeks = Array.isArray(row.activity) && row.activity.length === 8 ? row.activity.map((n) => Number(n) || 0) : null;
    const older = weeks ? weeks[0] + weeks[1] + weeks[2] + weeks[3] : 0, newer = weeks ? weeks[4] + weeks[5] + weeks[6] + weeks[7] : 0;
    const said = newer === 0 || newer * 2 < older ? "shell.glance.quiet" : newer * 2 >= older * 3 ? "shell.glance.busy" : "shell.glance.steady";
    const last = "lastChange" in row ? `<span class="mk-small muted">${row.lastChange ? W("screen.projects.lastchange", { date: { html: cs.date(String(row.lastChange)) } }) : W("screen.projects.lastchange.none")}</span>` : "";
    const body = (names.length ? cs.initials(names) : "") + (weeks ? cs.activity(weeks, said) : "") + last;
    if (body) out.push(cs.sec("screen.dash-project.activity.heading", `<div class="mk-acts">${body}</div>`));
  }
  return out.join("");
}

/** R79: the acts the dashboard's steps are (the registry lists `release`, `adoptversion` and `keepversion`). */
const acts = [
  /* "Vouch for photos": an enumerated selection of the group's held captures (`select`), then `release` over its handle with the
     member's own acknowledgment and what she did to check, each checked as ratification R20 bounds it */
  { op: "release", label: "act.release.label.dash-project", reasonField: "acknowledgment", rereads: ["mine", "docs"],
    async send(view, el, cs) {
      const ids = String(el.dataset.ids || "").split(",").filter(Boolean);
      const f = String(el.dataset.f || "");
      const ack = String(cs.value(f + "-ack") || "").trim(), mitigation = String(cs.value(f + "-mitigation") || "").trim();
      const plain = (k) => String(cs.w(k)).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e]));
      if (!ids.length) return { refuse: "screen.held.none" };
      const missing = [!ack && "screen.held.ack", !mitigation && "screen.held.mitigation"].filter(Boolean);
      if (missing.length) return { refuse: "screen.held.vouchmissing", fills: { fields: missing.map(plain).join(", ") } };
      for (const [k, v] of [["screen.held.ack", ack], ["screen.held.mitigation", mitigation]])
        if (Array.from(v).length > 500 || /["\\\r\n]/.test(v)) return { refuse: "screen.held.vouchbad", fills: { field: plain(k) } };
      const sel = await cs.call("select", { body: { ids } });
      const s = sel && (sel.result || sel);
      if (!s || s.ok === false || typeof s.handle !== "string") return { refuse: "screen.held.selectfailed" };
      return { query: { handle: s.handle, acknowledgment: ack, mitigation }, body: { handle: s.handle, acknowledgment: ack, mitigation } };
    } },
  /* a newer version's notice decided here: adopt it with her reason, or keep the version she cited */
  { op: "adoptversion", label: "act.adoptversion.label.dash-project", reasonField: "why", rereads: ["queue"],
    send(view, el, cs) {
      const why = String(cs.value(String(el.dataset.f || "") + "-why") || "").trim();
      return { body: { notice: String(el.dataset.notice || ""), why } };
    } },
  { op: "keepversion", label: "act.keepversion.label.dash-project", rereads: ["queue"],
    send(view, el) { return { body: { notice: String(el.dataset.notice || "") } }; } },
];

/** The keys the dashboard may draw (R44: keys only). */
const words = Object.freeze([
  "screen.dash-project.name", "screen.dash-project.purpose", "screen.dash-project.next.heading", "screen.dash-project.next.vouch", "screen.dash-project.next.vouch.one",
  "screen.dash-project.next.newer", "screen.dash-project.next.prepare", "screen.dash-project.next.prepare.label",
  "screen.dash-project.next.vouch.noplace", "screen.dash-project.next.vouch.noplace.one", "screen.dash-project.tile.events.undetermined",
  "screen.dash-project.precision.day", "screen.dash-project.precision.minute", "screen.dash-project.precision.second", "screen.dash-project.precision.edtf", "screen.dash-project.glance.heading", "screen.dash-project.tile.questions",
  "screen.dash-project.tile.events", "screen.dash-project.tile.members", "screen.dash-project.story.heading", "screen.dash-project.story.undetermined",
  "screen.dash-project.activity.heading", "screen.dash-project.tip.next", "screen.dash-project.tip.story", "shell.card.dash-project",
  "act.release.label.dash-project", "act.adoptversion.label.dash-project", "act.keepversion.label.dash-project",
  "screen.held.ack", "screen.held.ackhelp", "screen.held.mitigation", "screen.held.mitigationhelp", "screen.held.none", "screen.held.vouchmissing",
  "screen.held.vouchbad", "screen.held.selectfailed", "shell.reason", "shell.reason.help", "screen.home.area.meetbar",
  "screen.timeline.kind", "shell.card.ceremony", "shell.card.timeline", "screen.projects.owner", "screen.projects.lastchange",
  "screen.projects.lastchange.none", "screen.project.stage.forming", "screen.project.stage.investigating", "screen.project.stage.matured",
  "screen.project.stage.closed", "screen.project.members.head", "screen.project.notjoined", "screen.project.notjoined.owners", "shell.card.project",
  "shell.glance.busy", "shell.glance.steady", "shell.glance.quiet", "shell.glance.people", "shell.glance.more", "shell.glance.timeline", "shell.glance.weeks",
  "shell.unavailable.notyours.title", "shell.unavailable.notyours.says", "state.empty", "state.loading", "state.failed", "state.undetermined", "shell.unread",
  "mark.gap.undetermined.name", "mark.gap.undetermined.means", "member.founder.unnamed",
]);

/** The project's dashboard (interface-shell R21), with the module's shared readers as its parts. */
export function dashProjectScreen(parts) {
  return Object.freeze({ id: "dash-project", reads, place, render, acts, words, parts: Object.freeze({ ...parts, named }) });
}
